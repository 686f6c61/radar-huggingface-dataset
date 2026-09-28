# lucyjohnson/embodied-ai

## Resumen

El repositorio `lucyjohnson/embodied-ai` no es un modelo de lenguaje entrenado, sino un cuaderno de notas de investigacion sobre IA encarnada (embodied AI) publicado en HuggingFace. La propia model card lo describe como "reading notes and an experiment sketch", con la advertencia explicita de que no reclama mejoras en benchmarks, ablaciones completadas, codigo liberado ni un checkpoint entrenado. El artefacto principal es el archivo `review.md`; el repositorio no contiene configuracion de modelo, tokenizador ni documentacion de entrenamiento.

El unico dato ponderado disponible es un tensor en formato safetensors con 33.088 parametros totales, una cifra compatible con un placeholder o un tensor auxiliar, no con un modelo funcional: a 4 bytes por parametro en fp32 ocuparia unos 132 KB, y el tamano del repositorio se declara como 0.0 GB. La etiqueta `transformer` figura entre los tags, pero no se especifica topologia, numero de capas, dimensiones ocultas ni mecanismo de atencion.

Su relevancia actual es metodologica mas que tecnica: sirve como ejemplo de documentacion de un plan de investigacion con control de confounders, verificaciones de reproducibilidad y modos de fallo declarados. Para cualquier evaluacion de capacidades, el repositorio no es utilizable como modelo, y asi debe tratarse en cualquier pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta declarada en el repositorio); topologia no documentada |
| Parametros totales | 33.088 |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura interna, capas, atencion, posicional encoding ni estrategia de decodificacion. El tag `transformer` es la unica referencia, y no viene acompanado de un `config.json` documentado en la informacion disponible. Tampoco se indica el tipo de modelo segun la taxonomia de HuggingFace (el campo `pipeline` aparece como no disponible).

En cuanto al entrenamiento, no se declara numero de tokens, composicion del dataset, fases de preentrenamiento, ajuste supervisado, RLHF, DPO ni ninguna innovacion tecnica. La model card indica explicitamente que el contenido son planes e hipotesis y que, si en el futuro se anaden resultados, deberian incluir versiones de dataset, comandos, semillas, hardware y logs en bruto. En el estado actual no existe checkpoint entrenado ni codigo asociado.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue.
- No se declara modo de pensamiento, entrada de audio/imagen ni ninguna capacidad especial.
- El unico contenido verificable es documental: notas de lectura y un esbozo de experimento sobre IA encarnada, con discusion de confounders, comparaciones con baselines emparejados, benchmarks publicos propuestos, comprobaciones de reproducibilidad y modos de fallo.

## Casos de uso

- Plantilla de documentacion de investigacion: el repositorio ilustra como redactar un plan que separa hipotesis de resultados y que exige registrar semillas, hardware y logs en bruto antes de publicar cualquier cifra.
- Revision de diseno experimental en IA encarnada: util para contrastar si un protocolo propio cubre confounders, baselines emparejados y criterios de fallo antes de ejecutar experimentos costosos.
- Punto de partida bibliografico: la seccion de referencias del `review.md` sirve para localizar literatura y datasets publicos propuestos sobre embodied AI, siempre con verificacion posterior.
- Auditoria de afirmaciones: como ejemplo de repositorio que evita deliberadamente afirmar mejoras en benchmarks, es util para formar a equipos en distinguir notas exploratorias de resultados reproducidos.
- Material docente sobre higiene cientifica: el contraste entre un tensor de 33.088 parametros y la ausencia de claims permite discutir que constituye evidencia en un release de modelo.
- Referencia de licenciamiento mixto: la model card recuerda revisar por separado los terminos de los datasets externos, un caso practico para equipos que combinan cc-by-4.0 con datos de terceros.
- No es adecuado para ningun caso de uso de inferencia en produccion: no hay modelo entrenado, tokenizador ni contrato de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que el repositorio no reclama mejoras en benchmarks ni ablaciones completadas.

## Requisitos de hardware

- VRAM para inferencia: no aplica como modelo. El unico tensor declarado (33.088 parametros) ocuparia aproximadamente 132 KB en fp32 y unos 66 KB en fp16, cargable en CPU sin GPU.
- GPU recomendadas: no aplica; no hay modelo entrenado que ejecutar.
- Cabe en GPU de consumo: el tensor cabe en cualquier dispositivo, incluida una CPU. Esto no implica que exista un modelo funcional.
- Opciones de despliegue: no aplica. No se documentan vLLM, llama.cpp, Ollama, TGI ni ninguna otra ruta de servicio, y no hay tokenizador ni configuracion publicada.
- Latencia y throughput: no disponible; no procede sin un grafo de modelo definido.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo entrenado con el que establecer una comparativa de parametros, contexto, rendimiento o licencia frente a alternativas de la misma categoria. La unica comparacion pertinente es documental, frente a otros repositorios de notas de investigacion, y en ese terreno el rasgo distintivo declarado es la ausencia intencionada de claims de rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: no hay checkpoint entrenado, tokenizador ni configuracion de arquitectura; cualquier uso en inferencia es inviable.
- Los 33.088 parametros en safetensors corresponden previsiblemente a un tensor auxiliar o placeholder, no a un modelo de lenguaje.
- Las secciones de la model card etiquetadas como planes o hipotesis no deben interpretarse como resultados experimentales.
- Riesgo de mala interpretacion: el tag `transformer` y la presencia de safetensors pueden inducir a catalogar el repositorio como modelo en indices automaticos.
- Con solo 8 descargas y 0 likes, no existe validacion comunitaria ni historial de uso.
- Sesgos conocidos: no evaluables, dado que no hay modelo ni datos de entrenamiento declarados.
- Riesgo de alucinacion: no aplica al repositorio, pero si a cualquier sistema que lo trate erroneamente como modelo generativo.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni cobertura linguistica.
- Licencia cc-by-4.0: permite uso comercial y obras derivadas con atribucion, pero la propia model card advierte de revisar por separado los terminos de los datasets externos citados.
- Fechas del repositorio: creado y actualizado el 28 de septiembre de 2026, con 5 segundos de diferencia entre ambos eventos, lo que sugiere una publicacion sin iteracion posterior.
- Para produccion: no usar. La unica dependencia segura es tratarlo como documentacion de referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lucyjohnson/embodied-ai
- Archivo principal de notas: https://huggingface.co/lucyjohnson/embodied-ai/blob/main/review.md
- Documentacion del repositorio: https://huggingface.co/lucyjohnson/embodied-ai/blob/main/README.md
- Pagina del autor: https://huggingface.co/lucyjohnson
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
