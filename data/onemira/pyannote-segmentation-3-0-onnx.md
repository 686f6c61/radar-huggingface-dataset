# onemira/pyannote-segmentation-3.0-onnx

## Resumen

`onemira/pyannote-segmentation-3.0-onnx` es un espejo byte a byte del modelo de segmentación de hablantes `pyannote/segmentation-3.0`, publicado por el usuario `onemira` en formato ONNX. No se trata de un modelo entrenado por el autor del repositorio: es una redistribución del archivo ONNX originalmente publicado en el ecosistema sherpa-onnx (`sherpa-onnx-pyannote-segmentation-3-0.tar.bz2`), con un tamaño de 6.958.444 bytes y SHA-256 `24615ee884c897d9d2ba09bb4d30da6bb1b15e685065962db5b02e76e4996488`. Su utilidad principal es permitir el acceso al artefacto sin pasar por el gate de información de contacto que exige la ficha original de pyannote en Hugging Face.

El modelo es un componente de diarización de hablantes: dado un audio, produce probabilidades de actividad de voz por hablante en tramas temporales, que después se agrupan con un modelo de clustering (por ejemplo, embeddings de hablante y agglomerative clustering) para obtener segmentos etiquetados por hablante. Es, por tanto, una pieza intermedia de un pipeline de diarización, no un modelo de transcripción ni de reconocimiento de voz.

La relevancia de este espejo es práctica: el pipeline de diarización de pyannote requiere aceptar condiciones y facilitar datos de contacto en la ficha oficial, lo que complica la automatización de descargas en CI/CD o en despliegues reproducibles. Este repositorio ofrece el mismo artefacto ONNX con licencia MIT (Copyright 2022 CNRS) y scripts de exportación/ejemplo bajo Apache-2.0, sin gate. La contrapartida es que no incluye el checkpoint PyTorch original ni documentación técnica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de hablantes de pyannote, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio definida por el pipeline, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (se distribuye un único artefacto ONNX) |
| Idiomas soportados | no disponible (la tarea es acústica, independiente del idioma en gran medida) |
| Licencia | MIT (pesos, Copyright 2022 CNRS); scripts sherpa-onnx bajo Apache-2.0 |
| Formato de pesos | ONNX (archivo `pyannote-segmentation-3.0.onnx` dentro del archivo tar.bz2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros, el volumen de datos de entrenamiento ni el procedimiento de ajuste (RLHF, DPO u otros) en la información proporcionada. Lo único verificable es que se trata de la exportación ONNX del modelo `pyannote/segmentation-3.0`, cuyo artefacto original proviene del release de sherpa-onnx para modelos de segmentación de hablantes. El repositorio no documenta innovaciones técnicas propias; su aportación es la redistribución sin gate del binario.

El artefacto incluye, según la model card, la licencia MIT completa del upstream (Copyright 2022 CNRS) y scripts de exportación/ejemplo de sherpa-onnx bajo Apache-2.0, cuyos avisos deben conservarse. No contiene el checkpoint PyTorch original.

## Capacidades

- Segmentación de hablantes: genera probabilidades de actividad de voz por hablante a lo largo del tiempo, insumo para un pipeline de diarización.
- Integración con sherpa-onnx: el artefacto está pensado para ejecutarse con el runtime sherpa-onnx, que permite inferencia ONNX en CPU y GPU.
- Ejecución local: al ser ONNX, puede desplegarse sin dependencias de PyTorch en entornos ligeros.
- Independencia de idioma: la tarea es acústica; no se documentan limitaciones idiomáticas específicas.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni modo thinking.

## Casos de uso

- Diarización en pipelines de transcripción: usar el modelo como etapa de segmentación previa al clustering de embeddings de hablante para etiquetar quién habla en cada tramo de una reunión.
- Despliegue reproducible en CI/CD: al no requerir aceptar el gate de la ficha oficial, permite descargar el artefacto de forma automatizada en builds y entornos de integración continua.
- Sistemas de transcripción locales: integrar el ONNX con sherpa-onnx para construir pipelines de diarización sin dependencia de PyTorch ni de servicios en la nube.
- Investigación en diarización: servir como componente base reproducible para experimentos de segmentación y clustering de hablantes.
- Aplicaciones de actas de reuniones: alimentar un sistema que separa intervinientes antes de generar resúmenes o acciones por hablante.
- Verificación de procedencia: usar el SHA-256 y el tamaño documentados para auditar que el artefacto coincide con el release público de sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ONNX pesa aproximadamente 6,96 MB, por lo que el consumo de memoria será modesto, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: runtime sherpa-onnx (CPU/GPU), ejecución ONNX genérica; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onemira/pyannote-segmentation-3.0-onnx | no disponible | no disponible | no disponible | MIT (pesos) + Apache-2.0 (scripts) | Público, sin gate |
| pyannote/segmentation-3.0 | no disponible | no disponible | no disponible | MIT (pesos) | Público con gate de contacto |
| sherpa-onnx-pyannote-segmentation-3-0 (release) | no disponible | no disponible | no disponible | MIT (pesos) | Público en GitHub Releases |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: no hay garantía de mantenimiento ni de soporte por parte de `onemira`.
- No contiene el checkpoint PyTorch original; solo el artefacto ONNX del release de sherpa-onnx.
- La licencia MIT cubre los pesos (Copyright 2022 CNRS), pero los scripts sherpa-onnx son Apache-2.0 y exigen conservar sus avisos (`LICENSE.sherpa-onnx`).
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas específicas.
- No se documentan métricas de error de diarización (DER) ni condiciones acústicas de evaluación.
- El repositorio tiene 0 descargas y 0 likes, lo que limita la validación comunitaria del artefacto.
- Para uso comercial, verificar la procedencia y conservar las licencias MIT y Apache-2.0 incluidas.

## Enlaces

- Hugging Face: https://huggingface.co/onemira/pyannote-segmentation-3.0-onnx
- Modelo upstream: https://huggingface.co/pyannote/segmentation-3.0
- Release sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-segmentation-models/sherpa-onnx-pyannote-segmentation-3-0.tar.bz2
- Dataset citado en la model card: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Servidor MCP citado: https://github.com/onemira-space/onemira-mcp
- Producto citado: https://onemira.com/products/c1
