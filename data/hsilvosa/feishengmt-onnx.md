# hsilvosa/feishengmt-ONNX

## Resumen

feishengmt-ONNX es la exportación a formato ONNX de hsilvosa/feishengmt, un ajuste fino mediante LoRA del modelo Hy-MT2-1.8B de Tencent, especializado en la traducción de chino a inglés de novelas web. El modelo se distribuye cuantizado en int4 para los pesos con activaciones en fp16 y está construido con ONNX Runtime GenAI para el proveedor de ejecución WebGPU, lo que permite ejecutarlo directamente dentro de una pestaña del navegador mediante transformers.js sin necesidad de servidor.

La arquitectura subyacente es Hunyuan v1 dense (etiqueta `hunyuan_v1_dense` en el repositorio), con aproximadamente 1.800 millones de parámetros según la nomenclatura del modelo base. El repositorio ocupa 1,1 GB y está pensado para inferencia en cliente, no para despliegue en servidor. Se trata de una versión preview v0.1 (publicada en noviembre de 2026) que el propio autor advierte que contiene errores.

Su relevancia radica en dos factores: por un lado, demuestra un caso práctico de traducción literaria especializada (novela web china) ejecutada íntegramente en el navegador; por otro, la licencia Apache 2.0 y el formato ONNX facilitan su integración en aplicaciones web sin infraestructura de GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Hunyuan v1 dense, etiqueta `hunyuan_v1_dense`) |
| Parámetros totales | ~1,8 mil millones (heredados de Hy-MT2-1.8B; no confirmado en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int4 en pesos con activaciones fp16 (`q4f16`) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ONNX Runtime GenAI, proveedor WebGPU) |

## Arquitectura y entrenamiento

El modelo base es Hy-MT2-1.8B de Tencent, un transformer denso de la familia Hunyuan v1 orientado a traducción. Sobre él se aplicó un ajuste fino con LoRA para especializarlo en traducción de chino a inglés de novelas web, dando lugar a hsilvosa/feishengmt. La exportación ONNX se realizó con el model builder de ONNX Runtime GenAI, configurando el proveedor WebGPU y cuantizando los pesos a int4 manteniendo las activaciones en fp16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones arquitectónicas más allá de la cuantización int4/fp16 para ejecución en navegador. El prompt de sistema esperado por el modelo está en chino y sigue el patrón «将以下文本翻译为English，注意只需要输出翻译后的结果，不要额外解释» (traduce el siguiente texto al inglés, sin explicaciones adicionales).

## Capacidades

- Traducción chino a inglés de fragmentos cortos de texto narrativo (novelas web).
- Generación de texto autoregresiva con decodificación greedy (`do_sample: false`).
- Ejecución en navegador mediante transformers.js y WebGPU, sin backend propio.
- Soporte de plantilla de chat con roles (`user`) para estructurar la petición.
- Capacidad multilingüe limitada a chino e inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción asistida en lectores de novelas web: integración en una extensión o aplicación web que traduzca párrafos al vuelo mientras el usuario lee, aprovechando la ejecución local en WebGPU y evitando enviar el texto a un servidor.
- Prototipado de pipelines de traducción literaria: evaluación rápida de calidad de traducción zh→en sin desplegar infraestructura, usando el propio navegador como entorno de pruebas.
- Aplicaciones de privacidad estricta: al ejecutarse en el cliente, el texto original nunca abandona el dispositivo, lo que encaja en escenarios con contenido sensible o bajo regulación de datos.
- Herramientas de subtitulado o traducción de diálogos: el modelo está entrenado para fragmentos de unos 250 caracteres cortados en comillas, lo que se ajusta a líneas de diálogo y subtítulos.
- Demo educativa de inferencia ONNX en navegador: sirve como referencia técnica para desarrolladores que quieran replicar el flujo con ONNX Runtime GenAI y transformers.js.
- Preprocesado de corpus chinos para investigación: traducción preliminar de textos narrativos antes de una revisión humana o de un modelo mayor, dado su bajo coste de despliegue.
- Integración en herramientas de escritura bilingüe: asistencia a traductores que trabajen con narrativa china y necesiten un primer borrador en inglés.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre una muestra reservada, comparando con la versión GGUF Q4_K_M del mismo modelo base:

| Métrica | Oraciones | Párrafos |
|---|---|---|
| BLEU | 22,3 | 15,6 |
| chrF | 46,3 | 47,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 1,07 GB en int4, por lo que la huella en memoria es del orden de 1-2 GB durante la inferencia.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (Chrome/Edge con WebGPU habilitado). No se especifican modelos concretos.
- Compatibilidad con GPU de consumo: sí, siempre que el navegador exponga WebGPU; el tamaño reducido permite ejecución en equipos de gama media.
- Opciones de despliegue: transformers.js con `device: "webgpu"` y `dtype: "q4f16"`; también puede ejecutarse con ONNX Runtime GenAI en otros entornos, aunque la model card solo documenta el flujo web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| feishengmt-ONNX | ~1,8 B | No disponible | zh, en | Apache 2.0 | ONNX (int4/fp16) |
| hsilvosa/feishengmt (base) | ~1,8 B | No disponible | zh, en | Apache 2.0 | Safetensors/GGUF (según repo) |
| Hy-MT2-1.8B (Tencent) | 1,8 B | No disponible | Multilingüe (no detallado) | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Versión preview v0.1: el autor advierte explícitamente de que pueden aparecer errores.
- Entradas largas provocan bucles de generación; se recomienda traducir fragmentos de unos 250 caracteres cortados en comillas, no capítulos completos.
- Especializado únicamente en chino a inglés; no se documenta traducción inversa ni otros pares de idiomas.
- Es un modelo modificado de Hy-MT2-1.8B y no está respaldado por Tencent.
- Riesgo de alucinación y de deriva en textos narrativos con nombres propios, referencias culturales o terminología específica.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos web es probable que herede sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Tencent antes de un despliegue en producción.
- Sin soporte documentado de tool calling, agentes o contexto largo, lo que limita su uso fuera de la traducción de fragmentos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hsilvosa/feishengmt-ONNX
- Modelo base: https://huggingface.co/hsilvosa/feishengmt
- transformers.js: https://github.com/huggingface/transformers.js
