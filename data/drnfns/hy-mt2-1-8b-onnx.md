# drnfns/Hy-MT2-1.8B-ONNX

## Resumen

Hy-MT2-1.8B-ONNX es una conversión a formato ONNX del modelo de traducción automática tencent/Hy-MT2-1.8B, publicada por el usuario drnfns. El modelo original lo desarrolla Tencent y emplea la arquitectura `hunyuan_v1_dense`, un transformer denso de 1.800 millones de parámetros orientado específicamente a traducción. Esta versión ONNX está pensada para ejecutarse en el navegador mediante transformers.js sobre WebGPU, lo que la convierte en una opción poco habitual para traducción local en cliente sin backend.

La relevancia de esta ficha radica en su formato de despliegue: frente a las distribuciones habituales en safetensors o GGUF, aquí se ofrece un artefacto ONNX cuantizado en int4 con bloque de 32, generado con onnxruntime-genai. El repositorio ocupa 2,3 GB y se publica bajo licencia Apache 2.0, lo que facilita su integración en aplicaciones web y su uso comercial.

No obstante, la información disponible es muy limitada: la model card del autor se reduce a tres líneas y no hay datos sobre idiomas soportados, composición del dataset de entrenamiento, benchmarks ni detalles del proceso de cuantización más allá de la mención a `q4f16` y `q4`. Esta ficha refleja esa escasez y marca explícitamente como no disponibles los datos que no constan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1,8 mil millones (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con bloque de 32; variantes `q4f16` (activaciones y KV en fp16) y `q4` (fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (generado con onnxruntime-genai model builder) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy-MT2-1.8B emplea la arquitectura identificada en los tags como `hunyuan_v1_dense`, es decir, un transformer denso (no mezcla de expertos) de aproximadamente 1.800 millones de parámetros, especializado en traducción automática. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni innovaciones técnicas del modelo original, ya que la model card consultada no los detalla.

La contribución de esta versión concreta es la conversión a ONNX para transformers.js sobre WebGPU, realizada con onnxruntime-genai y cuantización int4 con bloque de 32. Se ofrecen dos variantes: `q4f16`, con activaciones y caché KV en fp16, y `q4`, con precisión fp32. Esta cuantización reduce el peso del repositorio a 2,3 GB y permite la inferencia en el navegador, aunque no se documentan métricas de degradación de calidad respecto al modelo original.

## Capacidades

- Traducción automática de texto, según el `pipeline_tag: translation` del modelo base.
- Generación de texto condicionada al prompt, al ser un modelo de `text-generation`.
- Ejecución en navegador mediante transformers.js y WebGPU, sin necesidad de servidor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible el listado de idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Traducción en el navegador sin backend: integrar el modelo ONNX en una aplicación web con transformers.js y WebGPU permite traducir texto en el cliente, evitando enviar contenido a un servidor y reduciendo la latencia de red.
- Extensiones de navegador para traducción de páginas: el formato ONNX y la cuantización int4 hacen viable cargar el modelo en una extensión y traducir contenido bajo demanda en el propio dispositivo.
- Prototipado rápido de interfaces de traducción: al no requerir infraestructura de GPU en servidor, sirve para validar experiencias de usuario de traducción antes de invertir en despliegue backend.
- Aplicaciones de escritorio multiplataforma con WebView: entornos como Electron o Tauri pueden ejecutar el modelo mediante WebGPU para ofrecer traducción offline integrada.
- Traducción de contenido sensible en local: al ejecutarse en el cliente, el texto no abandona el dispositivo, lo que encaja en escenarios con requisitos de privacidad.
- Demos y entornos educativos: el tamaño de 2,3 GB y la licencia Apache 2.0 permiten distribuir el modelo en materiales docentes y demos interactivas de traducción neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con cuantización int4 y 1,8 mil millones de parámetros, el peso de los pesos ronda 1 GB, y la variante `q4f16` mantiene activaciones y KV en fp16, por lo que el consumo total dependerá de la longitud de contexto.
- GPU recomendadas: no disponible; el modelo está orientado a WebGPU, por lo que requiere un navegador con soporte WebGPU y una GPU compatible.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs de gama media con WebGPU, pero no hay datos oficiales de compatibilidad ni de memoria mínima.
- Opciones de despliegue: transformers.js sobre WebGPU; también podría ejecutarse con onnxruntime en otros entornos, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-ONNX (este) | 1,8 B | no disponible | ONNX int4 | Apache 2.0 | Orientado a transformers.js/WebGPU |
| tencent/Hy-MT2-1.8B | 1,8 B | no disponible | safetensors (presumible) | no disponible | Modelo base original |
| Alternativas de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card del autor es mínima y no documenta idiomas, contexto, dataset ni evaluación; la evaluación en producción requiere pruebas propias.
- La cuantización int4 con bloque de 32 puede degradar la calidad de traducción respecto al modelo en precisión completa; no se han publicado métricas de esa pérdida.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos neuronales de traducción, sin datos específicos de este modelo.
- El soporte de WebGPU depende del navegador y del sistema operativo; la compatibilidad no está garantizada en todos los entornos.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base tencent/Hy-MT2-1.8B antes de un uso comercial, ya que no consta en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drnfns/Hy-MT2-1.8B-ONNX
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- transformers.js: https://github.com/huggingface/transformers.js
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
