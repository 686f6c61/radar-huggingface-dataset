# ollaya-dev/cygnet

## Resumen

cygnet es un modelo de decisión (decision model) publicado por ollaya-dev dentro del ecosistema Ollaya, un runtime que ejecuta modelos de decisión abiertos en local de forma análoga a como Ollama ejecuta LLM. Se distribuye con el pipeline `text-classification` y la etiqueta `system-one`, y su función es recibir preguntas tipadas y devolver respuestas calibradas a través de una API compatible con TypeSafe.

El repositorio no contiene pesos: es una exportación ONNX (grafo fp32 para CPU y GPU) del modelo base ggml-org/gemma-4-12B-it-GGUF, desarrollado por Google DeepMind (Gemma 4) con una receta de blockbrain-ai. Los grafos referencian los ficheros de pesos originales por desplazamiento de bytes, de modo que `ollaya pull` descarga los pesos sin modificar desde el repositorio upstream, fijados a un commit concreto y verificados por sha256.

Con aproximadamente 12.000 millones de parámetros heredados del modelo base, cygnet está pensado para tomar decisiones discretas con probabilidades calibradas (ficheros `decision.json` y `calibration.json` con temperaturas) en lugar de generar texto libre. Se distribuye bajo licencia Apache-2.0, la misma que el modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportacion ONNX (grafo fp32) del modelo base ggml-org/gemma-4-12B-it-GGUF; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | Aproximadamente 12.000 millones (segun la denominacion del tag `cygnet:12b`) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio no contiene pesos; el grafo es fp32 y referencia los GGUF del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo fp32 sin pesos propios; referencia por byte offset a los pesos GGUF upstream) |

## Arquitectura y entrenamiento

cygnet no es un modelo entrenado desde cero, sino una envoltura de decisión sobre el modelo base ggml-org/gemma-4-12B-it-GGUF. El artefacto publicado es un grafo ONNX en fp32 exportado desde el modelo original; no se incluyen pesos en el repositorio, ya que cada grafo referencia los ficheros de pesos de los autores por desplazamiento de bytes. El runtime descarga esos pesos desde los repositorios upstream, sin modificar y anclados a un commit, y verifica su sha256.

No se detallan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. La capa especifica de Ollaya anade dos artefactos: `decision.json`, que define la disposicion de la secuencia y los tokens especiales, y `calibration.json`, que contiene las temperaturas empleadas para calibrar las probabilidades de cada opcion. La model card reporta paridad con llama-server (build b11146) sobre el mismo GGUF en CUDA (RTX 4090): 502 preguntas con decisiones identicas, logits de opcion con diferencias dentro de 7,7e-6 y probabilidades dentro de 4,1e-7, ademas de coincidencia de mensajes de usuario con el shim propio de Cygnet en 1.364 prompts de prueba.

## Capacidades

- Clasificacion y toma de decisiones: recibe preguntas tipadas y devuelve respuestas calibradas con probabilidades por opcion.
- Modelo de decision "system-one": orientado a respuestas rapidas y discretas en lugar de generacion de texto abierto.
- Salida calibrada: incorpora temperaturas en `calibration.json` para ajustar las probabilidades emitidas.
- API compatible con TypeSafe para integracion en aplicaciones tipadas.
- Ejecucion local mediante el runtime de Ollaya (`ollaya run cygnet`).
- Paridad funcional verificada con llama-server sobre el mismo GGUF, en CPU y GPU.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento de peticiones en pipelines de IA: usar cygnet para decidir a que modelo o herramienta derivar cada consulta, aprovechando sus probabilidades calibradas por opcion.
- Clasificacion de intenciones en asistentes conversacionales: dado un mensaje tipado, asignar la intencion o categoria correspondiente antes de invocar un LLM generativo.
- Triaje y priorizacion de tickets: clasificar incidencias por categoria o urgencia como paso previo en flujos de soporte, con decision local y sin enviar datos a la nube.
- Moderacion de contenido con umbrales calibrados: decidir si un texto requiere revision humana en funcion de la probabilidad calibrada de cada clase.
- Control de agentes y puertas de decision (gating): decidir si un agente debe continuar, pedir confirmacion o detenerse, integrado mediante la API TypeSafe de Ollaya.
- Procesamiento en local con requisitos de privacidad: desplegar la decision en CPU o GPU on-premise, dado que el runtime descarga y verifica los pesos sin depender de servicios externos.
- Despliegue como capa de decision estandarizada: reutilizar el mismo modelo base Gemma 4 12B mediante el grafo ONNX y los ficheros de decision, manteniendo la reproducibilidad por commit fijado y verificacion sha256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta datos de paridad con llama-server (build b11146) sobre el mismo GGUF en CUDA (RTX 4090):

| Metrica de paridad | Resultado |
|---|---|
| Preguntas evaluadas | 502 |
| Decisiones coincidentes | Todas |
| Diferencia en logits de opcion | Dentro de 7,7e-6 |
| Diferencia en probabilidades | Dentro de 4,1e-7 |
| Prompts de usuario coincidentes con el shim de Cygnet | 1.364 |

## Requisitos de hardware

- El repositorio no incluye pesos, por lo que la huella de memoria depende del GGUF del modelo base que descargue el runtime.
- Grafo fp32 disponible para CPU y GPU.
- Estimacion en fp32 (12.000 millones de parametros, ~4 bytes por parametro): en torno a 48 GB de VRAM o RAM. Estimacion orientativa no confirmada en la informacion disponible.
- Con cuantizacion GGUF del modelo base, el consumo baja de forma proporcional; los valores concretos de cada cuantizacion no estan disponibles.
- Validado en CUDA sobre una RTX 4090 segun la model card.
- GPU recomendadas para fp32 o mayor throughput: A100 o H100. No se aportan cifras de latencia ni throughput.
- Puede caber en GPU de consumo (por ejemplo RTX 4090, 24 GB) si se usa una cuantizacion adecuada del modelo base.
- Opciones de despliegue: runner de Ollaya (`ollaya run cygnet`), llama-server (build b11146, referencia de paridad) y ONNX Runtime para el grafo exportado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible no describe modelos de decision directamente comparables. La comparacion mas inmediata es con el propio modelo base del que deriva cygnet.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cygnet (ollaya-dev) | ~12B | No disponible | ONNX (grafo fp32 sin pesos) | Apache-2.0 | Envoltura de decision con `decision.json` y `calibration.json`; paridad con llama-server b11146 |
| ggml-org/gemma-4-12B-it-GGUF | ~12B | No disponible | GGUF | Apache-2.0 | Modelo base upstream; pesos referenciados por byte offset desde cygnet |
| Otros modelos de decision comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de informacion sobre alternativas equivalentes |

## Limitaciones y advertencias

- El repositorio no contiene pesos: su uso requiere descargar los ficheros GGUF del modelo base y verificar su sha256, lo que anade dependencia de los repositorios upstream.
- No se han publicado datos de sesgos, evaluaciones eticas ni resultados de benchmarks en la informacion disponible.
- Riesgo de alucinacion y de calibracion incorrecta en dominios fuera de la distribucion de entrenamiento del modelo base; las temperaturas de `calibration.json` estan pensadas para ajustar probabilidades, no para garantizar su correccion.
- No se documentan los idiomas soportados, la longitud de contexto efectiva ni las cuantizaciones validadas.
- Al ser una envoltura de decision sobre Gemma 4, hereda las limitaciones del modelo base, que no se detallan en la informacion proporcionada.
- Licencia Apache-2.0 tanto para cygnet como para Ollaya y el modelo upstream; conviene revisar los terminos del modelo base antes de un uso comercial en produccion.
- La paridad reportada esta medida en una unica configuracion (CUDA, RTX 4090, build b11146 de llama-server); no se garantiza un comportamiento identico en otros entornos.
- El numero de descargas y likes del repositorio es cero, por lo que no existe aun validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/cygnet
- Modelo base: https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF
- Commit fijado del modelo base: https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF/tree/e3e681731089efaa3f0917336944ac64752db8ba
- Repositorio de Ollaya: https://github.com/ollaya-dev/ollaya
