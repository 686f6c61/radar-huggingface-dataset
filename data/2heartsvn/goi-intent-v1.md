# 2HeartsVN/goi-intent-v1

## Resumen

goi-intent-v1 es un clasificador de intenciones desarrollado por 2HeartsVN para el bot de reparto de TwoHearts. El modelo resuelve la tarea de enrutado de peticiones de usuario hacia 8 intenciones de backend, e incorpora además una cabeza adicional de detección de idioma. Se distribuye en formato ONNX y está pensado para servir en producción mediante un servicio FastAPI con onnxruntime.

El repositorio contiene dos variantes con papeles diferenciados. La principal, goibert-b-dapt-j2, se basa en GoiBERT-B con preentrenamiento adaptativo de dominio (DAPT) y 103 millones de parámetros, exportada en ONNX fp32. La variante de respaldo, goiturn-s-j1, emplea GoiTurn-S con 26,5 millones de parámetros y se exporta tanto en fp32 como en INT8.

La relevancia de esta ficha es limitada en términos de conocimiento público: se trata de un modelo interno y privado, sin pipeline, licencia ni idiomas declarados en HuggingFace, sin descargas ni valoraciones, y sin benchmarks públicos. Su interés radica en el patrón de despliegue (clasificador pequeño en ONNX sobre CPU) y en los datos de latencia y deriva de cuantización que la model card sí documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (GoiBERT-B con DAPT en la variante principal; GoiTurn-S en la de respaldo) |
| Parametros totales | 103 M (goibert-b-dapt-j2) y 26,5 M (goiturn-s-j1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 en ambas variantes; INT8 adicional solo en goiturn-s-j1 (INT8 descartado en la variante principal por deriva del 4,4 % en el argmax) |
| Idiomas soportados | no disponible (el modelo incluye una cabeza de idioma, pero no se declaran idiomas) |
| Licencia | no disponible; la model card indica uso interno y revisión legal pendiente por ser derivado de BamiBERT |
| Formato de pesos | ONNX (model.onnx y, en la variante de respaldo, model.int8.onnx), con tokenizer y contract.json por carpeta |
| Tamano del repositorio | 0,6 GB |
| Numero de intenciones | 8 intenciones de backend mas una cabeza de idioma |
| Fecha de exportacion | 2026-09-17, desde experiments/goi-intent-v1 (rama ml-models, Twohearts-Technologies/ai-foundary) |

## Arquitectura y entrenamiento

La variante principal es GoiBERT-B DAPT con 103 millones de parametros, es decir, un encoder transformer tipo BERT sometido a preentrenamiento adaptativo de dominio (DAPT) sobre datos del dominio de destino antes del ajuste fino para clasificacion de intenciones. La variante de respaldo, GoiTurn-S, es un encoder mas pequeno de 26,5 millones de parametros. Ambas exportan un unico grafo ONNX acompanado de un archivo contract.json que fija el orden de etiquetas, los umbrales de decision, la version y el formato de entrada, ademas del tokenizer correspondiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO, ni sobre hiperparametros de ajuste. El unico dato tecnico de proceso documentado es la decision de descartar la cuantizacion INT8 en la variante principal: producia un 4,4 % de deriva en el argmax, considerada inaceptable, mientras que en la variante de respaldo la deriva era del 0,9 % y se acepto. Se indica que el modelo es un derivado de BamiBERT y que su uso queda restringido a ambito interno hasta que se complete la revision legal.

## Capacidades

- Clasificacion de intenciones: asigna la entrada a una de las 8 intenciones de backend definidas para el bot de reparto.
- Deteccion de idioma: cabeza adicional que permite identificar el idioma de la peticion, presumiblemente para enrutado o respuesta.
- Inferencia sobre CPU: disenado para ejecutarse con un unico hilo de CPU mediante onnxruntime, sin necesidad de GPU.
- Contrato de salida explicito: el archivo contract.json expone orden de etiquetas, umbrales y version, lo que facilita integraciones estables y versionadas.
- Despliegue como servicio: pensado para exponerse a traves de services/goi-intent (FastAPI + onnxruntime).
- Modo de respaldo: la variante goiturn-s-j1 actua como fallback, con menor coste computacional y cuantizacion INT8 disponible.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; es un modelo discriminativo de clasificacion.

## Casos de uso

- Enrutado de peticiones en el bot de reparto: el modelo clasifica cada mensaje del usuario en una de las 8 intenciones de backend, de modo que el orquestador dirige la peticion al servicio correspondiente (seguimiento de pedido, cambios de direccion, incidencias, etc.).
- Deteccion de idioma previa a la respuesta: la cabeza de idioma permite seleccionar plantillas o modelos de respuesta adecuados antes de generar la contestacion, sin necesidad de un servicio separado.
- Despliegue en contenedores sin GPU: al ejecutarse en ONNX sobre un solo hilo de CPU con p50 de 85 ms y p95 de 150 ms, encaja en arquitecturas de microservicios donde no se justifica reservar aceleradores.
- Control de carga y degradacion controlada: la variante goiturn-s-j1, mucho mas ligera y con INT8 disponible, puede absorber picos de trafico o servir como fallback cuando el servicio principal no esta disponible.
- Filtrado y priorizacion de tickets: en un sistema de atencion al cliente, la clasificacion por intencion permite enrutar automaticamente conversaciones al equipo adecuado y priorizar incidencias criticas.
- Versionado de contratos de modelo en CI/CD: el contract.json con orden de etiquetas, umbrales y version facilita pruebas de regresion automatizadas cuando se reentrena o se cambia de variante.
- Analitica de intenciones: agregar las predicciones sobre trazas historicas permite medir la distribucion de peticiones por intencion e idioma y detectar cambios de comportamiento de los usuarios.
- Preprocesado de pipelines conversacionales: la salida de intencion puede alimentar sistemas de dialogo basados en reglas o un enrutador de LLM, reduciendo el coste frente a invocar un modelo generativo en cada turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks publicos (MMLU, GLUE, HumanEval u otros) en la informacion disponible. La model card unicamente documenta metricas internas de deriva por cuantizacion y latencia de contenedor:

| Metrica | goibert-b-dapt-j2 (principal) | goiturn-s-j1 (respaldo) |
|---|---|---|
| Parametros | 103 M | 26,5 M |
| Precision exportada | ONNX fp32 | ONNX fp32 + INT8 |
| Deriva de argmax con INT8 | 4,4 % (descartada) | 0,9 % (aceptada) |
| Latencia p50 en contenedor | 85 ms | no disponible |
| Latencia p95 en contenedor | 150 ms | no disponible |
| Configuracion de medida | 1 hilo de CPU | no disponible |

No se proporcionan valores de exactitud, F1 ni matrices de confusion sobre el conjunto de evaluacion.

## Requisitos de hardware

- VRAM: no se requiere GPU; el modelo esta disenado para inferencia en CPU.
- Memoria RAM estimada para los pesos: en torno a 412 MB en fp32 para GoiBERT-B de 103 M de parametros y en torno a 106 MB en fp32 (aproximadamente 27 MB en INT8) para GoiTurn-S de 26,5 M. Son estimaciones derivadas del numero de parametros; el consumo real depende del runtime y del tokenizer.
- CPU: la model card reporta inferencia con 1 hilo de CPU para la variante principal; no se especifica el modelo de procesador empleado en la medicion.
- GPU: no se documenta soporte ni necesidad de GPU. No se recomienda ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no aplica en el escenario documentado; al no requerir acelerador, el modelo cabe en cualquier maquina capaz de ejecutar onnxruntime, incluidas instancias pequenas de contenedor.
- Opciones de despliegue documentadas: onnxruntime servido mediante FastAPI en services/goi-intent. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un clasificador ONNX de este tipo.
- Latencia: p50 de 85 ms y p95 de 150 ms para la variante principal en contenedor con 1 hilo de CPU. No se publica throughput ni latencia de la variante de respaldo.
- Espacio en disco: el repositorio completo ocupa 0,6 GB.

## Comparativa con modelos similares

No se dispone de modelos comparables ni de datos comparativos en la informacion proporcionada. Como referencia interna, la unica comparacion documentada es entre las dos variantes incluidas en el propio repositorio:

| Aspecto | goibert-b-dapt-j2 | goiturn-s-j1 |
|---|---|---|
| Papel | Principal | Respaldo (fallback) |
| Parametros | 103 M | 26,5 M |
| Cuantizacion | fp32 | fp32 + INT8 |
| Deriva INT8 en argmax | 4,4 % (descartada) | 0,9 % (aceptada) |
| Latencia p50 / p95 | 85 ms / 150 ms | no disponible |
| Licencia | no disponible (uso interno) | no disponible (uso interno) |

No hay datos publicos de exactitud, contexto ni rendimiento frente a alternativas externas como BERT-base, DistilBERT u otros clasificadores de intenciones.

## Limitaciones y advertencias

- Modelo privado e interno: la model card lo etiqueta explicitamente como "private, internal" y destinado al bot de reparto de TwoHearts, no como modelo de proposito general.
- Licencia no declarada: no hay licencia publicada en HuggingFace ni en la informacion disponible. No debe asumirse permiso de uso comercial.
- Derivado de BamiBERT con revision legal pendiente: la propia model card indica uso interno unicamente hasta que se complete dicha revision, lo que condiciona cualquier distribucion o uso externo.
- Idiomas no declarados: aunque existe una cabeza de deteccion de idioma, no se especifica que idiomas cubre ni con que calidad.
- Sin benchmarks publicos: no hay exactitud, F1 ni evaluacion por clase, de modo que no es posible estimar el rendimiento real en produccion a partir de la informacion disponible.
- Deriva por cuantizacion: en la variante principal, INT8 provoca un 4,4 % de cambios en el argmax, motivo por el que se descarto; desplegarla en INT8 exigiria reevaluar el impacto en las predicciones.
- Ambito cerrado de etiquetas: el modelo esta limitado a 8 intenciones de backend mas la cabeza de idioma; entradas fuera de ese conjunto no tienen una clase adecuada y dependen de los umbrales definidos en contract.json.
- Longitud de contexto desconocida: no se documenta la ventana maxima de entrada, lo que impide garantizar el comportamiento con mensajes largos.
- Riesgo de desactualizacion del contrato: el orden de etiquetas, los umbrales y la version viven en contract.json; un desajuste entre ese archivo y el servicio consumidor provocaria errores silenciosos de clasificacion.
- Fechas de creacion y actualizacion poco habituales (2026): conviene verificar la procedencia y la vigencia del artefacto antes de integrarlo.
- Sin senales de adopcion: 0 descargas y 0 valoraciones, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2HeartsVN/goi-intent-v1
- Repositorio de origen citado en la model card: Twohearts-Technologies/ai-foundary, rama ml-models, ruta experiments/goi-intent-v1 (sin URL publica disponible)
- Plan de produccion citado: PRODUCTION_PLAN_EN.md dentro del repositorio de origen (sin URL publica disponible)
- Servicio de despliegue citado: services/goi-intent (FastAPI + onnxruntime), sin URL publica disponible
- Resultados de busqueda web: las consultas realizadas solo devolvieron enlaces genericos a YouTube y a su ficha en Google Play, sin relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
