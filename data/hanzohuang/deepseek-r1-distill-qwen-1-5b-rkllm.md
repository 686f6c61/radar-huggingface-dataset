# HanzoHuang/DeepSeek-R1-Distill-Qwen-1.5B-RKLLM

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-RKLLM es una conversión del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B al formato nativo RKLLM de Rockchip, publicada por el usuario HanzoHuang. No se trata de un modelo nuevo ni de un fine-tuning adicional: el autor distribuye artefactos `.rkllm` listos para ejecutarse en aceleradores NPU integrados en las SoC Rockchip RK3576 y RK3588, junto con imágenes Docker que empaquetan el modelo y una API en el puerto 8001.

El modelo subyacente es un destilado de DeepSeek-R1 sobre la base Qwen de 1.500 millones de parámetros, por lo que hereda el comportamiento de razonamiento paso a paso (cadena de pensamiento) característico de la familia R1, pero comprimido a un tamaño apto para dispositivos de borde. La conversión se realizó con RKLLM Toolkit 1.3.0 y limita la longitud de contexto a 4096 tokens.

La relevancia de esta ficha es práctica: permite desplegar un modelo de razonamiento en placas de bajo consumo (cajas inteligentes, gateways industriales, dispositivos IoT con NPU) sin GPU dedicada, usando cuantizaciones w4a16_g128 y w8a8 con tamaños de descarga de entre 1,43 y 1,93 GiB. La licencia declarada es MIT, heredada del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen), destilado de DeepSeek-R1; artefacto convertido a RKLLM |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo declarado en la model card) |
| Tipos de cuantizacion | w4a16_g128 (pesos 4 bits, activaciones 16 bits, grupo 128) y w8a8 (pesos y activaciones 8 bits) |
| Idiomas soportados | no disponible (la model card no lo especifica; hereda los del modelo base) |
| Licencia | MIT |
| Formato de pesos | `.rkllm` (artefacto nativo RKLLM/RKNN); no se distribuyen safetensors ni GGUF en este repositorio |
| Toolkit de conversión | RKLLM Toolkit 1.3.0 |
| Entrada / salida | texto → texto |
| Tamaño del repositorio | 5,7 GB |
| Plataformas objetivo | Rockchip RK3576 y RK3588 |
| Variantes publicadas | RK3576 w4a16_g128 (1,43 GiB), RK3576 w8a8 (1,93 GiB), RK3588 w8a8 (1,91 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1.5B parámetros procedente de la familia Qwen, destilado por DeepSeek a partir de DeepSeek-R1. La destilación transfiere el comportamiento de razonamiento del modelo grande (generación de cadenas de pensamiento antes de la respuesta final) a un modelo pequeño, sin que ello implique un entrenamiento con RL a gran escala sobre el modelo destino. La model card de esta conversión no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo original.

La innovación técnica de este repositorio no está en el entrenamiento, sino en el empaquetado para hardware de borde. La conversión con RKLLM Toolkit 1.3.0 genera artefactos optimizados para la NPU de las SoC Rockchip, con dos esquemas de cuantización: w4a16 (pesos de 4 bits con activaciones de 16 bits, con tamaño de grupo 128 para reducir el error de cuantización) y w8a8 (pesos y activaciones de 8 bits). El autor advierte explícitamente de que la salida cuantizada puede diferir de la del modelo original y recomienda validar las respuestas sobre las cargas de trabajo propias. Se publican sumas SHA-256 para cada variante, lo que facilita la verificación de integridad en despliegues.

## Capacidades

- Generación de texto en modo conversacional, con plantilla de chat propia que debe respetarse al integrar el modelo en otra aplicación.
- Razonamiento paso a paso: al derivar de DeepSeek-R1, el modelo tiende a producir cadenas de pensamiento antes de la respuesta final, útil en problemas de lógica y matemáticas sencillas.
- Razonamiento aritmético y resolución de problemas de varios pasos dentro del límite de 4096 tokens.
- Generación y explicación de código a pequeña escala, limitada por el tamaño del modelo y la ventana de contexto.
- Inferencia local en NPU de Rockchip, sin necesidad de GPU ni de conexión a servicios en la nube.
- Despliegue mediante Docker con API HTTP en el puerto 8001, lo que permite integrarlo como servicio local.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es exclusivamente texto → texto.
- Capacidades de agente multi-paso: no documentadas en la model card; la ventana de 4096 tokens limita cadenas de razonamiento largas.

## Casos de uso

- Asistente conversacional en dispositivo de borde: desplegado con la imagen Docker en un RK3588, el modelo atiende peticiones HTTP locales en el puerto 8001 para un asistente de voz o chat en un quiosco, sin depender de conectividad externa.
- Gateway industrial con privacidad de datos: en una RK3576 integrada en una línea de producción, el modelo resume incidencias y responde consultas de operarios sin que el texto salga de la planta, usando la variante w4a16_g128 de 1,43 GiB para minimizar el uso de memoria.
- Clasificación y extracción de información en IoT: procesamiento de registros y alertas en el propio dispositivo para etiquetar incidencias o extraer campos de mensajes, aprovechando que el artefacto w8a8 ocupa menos de 2 GiB de descarga.
- Prototipado educativo y de investigación: validación de pipelines de razonamiento destilado en hardware de bajo coste, comparando el comportamiento del modelo cuantizado con el original antes de escalar a GPUs.
- Tutor o asistente de estudio offline: explicación de problemas matemáticos y de lógica paso a paso en un dispositivo sin red, adecuado para entornos con conectividad limitada.
- Automatización de soporte técnico de primer nivel: respuestas a preguntas frecuentes y guiones de diagnóstico en cajas inteligentes desplegadas en campo, con la API local consumida por una aplicación propia.
- Pruebas de integración continua para despliegues en borde: uso de la imagen Docker como servicio reproducible en tests que verifican el correcto funcionamiento de la NPU y del runtime RKLLM antes de flashear dispositivos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se publica ningún benchmark por variante de placa y que la salida cuantizada puede diferir del modelo original.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en la NPU integrada de las SoC Rockchip, no en GPU.
- GPU recomendadas: ninguna; el formato `.rkllm` requiere el runtime RKLLM y no es ejecutable en CUDA.
- Placas compatibles: Rockchip RK3576 y RK3588, usando el archivo correspondiente a la SoC exacta.
- Tamaño de los artefactos: 1,43 GiB (RK3576 w4a16_g128), 1,93 GiB (RK3576 w8a8) y 1,91 GiB (RK3588 w8a8). El autor advierte de que el tamaño de descarga no equivale al consumo total de RAM en ejecución.
- Memoria del sistema: no disponible en la información proporcionada; debe dimensionarse según la placa y el runtime.
- Despliegue: imágenes Docker publicadas en `ghcr.io/hanzo-huang/rkllm-docker/llm/deepseek-r1-distill-qwen-1.5b` con etiquetas por placa y cuantización; requiere Docker y acceso privilegiado a `/dev` para la NPU.
- Alternativa sin Docker: descarga directa de los archivos con `hf download` y uso de un runtime RKLLM compatible (Toolkit 1.3.0).
- vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato.
- Latencia y throughput: no disponibles; no se publican mediciones por variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-RKLLM (este) | 1,5B | 4096 | `.rkllm`, NPU Rockchip RK3576/RK3588 | MIT | Hugging Face, imágenes Docker en GHCR |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en esta ficha | safetensors, GPU/CPU | MIT | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | safetensors, GGUF, GPU/CPU | no disponible en esta ficha | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible en esta ficha | safetensors, GPU/CPU | MIT | Hugging Face |

La comparación relevante es de idoneidad de plataforma: el modelo original y sus alternativas están pensados para GPU o CPU con runtimes estándar, mientras que esta conversión es la única de la tabla ejecutable en la NPU de una SoC Rockchip. Frente al destilado de 7B, el de 1,5B sacrifica calidad de razonamiento a cambio de caber en dispositivos de borde con menos de 2 GiB de artefacto. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ventana de contexto está limitada a 4096 tokens, lo que restringe conversaciones largas y cadenas de razonamiento extensas.
- La cuantización a 4 y 8 bits puede degradar la calidad de las respuestas respecto al modelo original; el autor recomienda validar sobre cargas de trabajo propias.
- Riesgo de alucinación inherente a un modelo de 1,5B, especialmente en dominios especializados y en problemas matemáticos complejos.
- Idiomas soportados no documentados en la model card; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- El formato `.rkllm` es propietario del ecosistema Rockchip: no se puede ejecutar en GPU, CPU estándar ni con vLLM, llama.cpp u Ollama, lo que limita la portabilidad.
- Requiere una versión de runtime compatible con RKLLM Toolkit 1.3.0; mezclar versiones puede provocar fallos de carga.
- El contenedor Docker necesita `--privileged` y acceso a `/dev` para la NPU, lo que implica un modelo de seguridad laxo en el host.
- Licencia MIT: permisiva para uso comercial, pero el autor remite a la model card del modelo original para los términos y el uso previsto, que deben revisarse igualmente.
- No se publican benchmarks ni mediciones de latencia por placa; el dimensionamiento debe hacerse empíricamente.
- El repositorio no incluye pesos en safetensors ni GGUF; quien necesite esos formatos debe acudir al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HanzoHuang/DeepSeek-R1-Distill-Qwen-1.5B-RKLLM
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de imágenes Docker: https://github.com/Hanzo-Huang/rkllm-docker#readme
- Rockchip RKLLM (herramientas de conversión): https://github.com/airockchip/rknn-llm
- reComputer AI Lab (guías de despliegue en RK3588): https://sensecraft.seeed.cc/ai-lab/en/models?device=rk3588
- Model card en chino: README_zh-CN.md (enlazado desde el repositorio de Hugging Face)
