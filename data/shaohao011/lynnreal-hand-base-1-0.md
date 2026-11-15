# shaohao011/LynnReal-Hand-Base-1.0

## Resumen

LynnReal-Hand-Base-1.0 es un ajuste fino (fine-tune) del modelo de generación de vídeo MiniMaxAI/MiniMax-H3, publicado por el usuario shaohao011 en Hugging Face. Se trata de un transformer de 33B parámetros especializado en generación de vídeo condicionada por una imagen inicial, texto, condiciones de mano y poses de cámara, lo que lo orienta a la síntesis de vídeo con control explícito de la pose de las manos. El repositorio se etiqueta con el pipeline `image-to-video` y se distribuye bajo la MiniMax H3 Community License.

El modelo se presenta como el "Stage-I checkpoint 219", construido sobre los pesos del transformer Live de H3, y emplea generación bidireccional de secuencia completa con CFG conjunto de 3 a una resolución de 1344 × 768. Según la model card, en el momento de la publicación la subida de los shards completos del transformer seguía en curso y el repositorio no estaba listo para inferencia, por lo que se trata de un artefacto en estado provisional.

Su relevancia es acotada: no es un modelo de propósito general, sino un experimento de ajuste fino sobre una base propietaria de generación de vídeo, orientado a un nicho concreto (control de manos en vídeo generado). No hay información sobre idiomas soportados, benchmarks ni resultados de aceptación en GPU para el paquete portable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de MiniMaxAI/MiniMax-H3, pesos del transformer Live) |
| Parametros totales | 33B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community) |
| Formato de pesos | Safetensors (shards del transformer; índice de shards previsto) |

## Arquitectura y entrenamiento

El modelo es un transformer de 33B parámetros obtenido por ajuste fino de MiniMaxAI/MiniMax-H3. Según la model card, la generación es bidireccional sobre la secuencia completa ("bidirectional full sequence generation") con CFG conjunto de 3 y resolución de salida de 1344 × 768. El condicionamiento combina una primera imagen, texto, condiciones de mano y poses de cámara, lo que sugiere un pipeline de image-to-video con señales de control adicionales inyectadas en el proceso de difusión.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del esquema de condicionamiento múltiple y la configuración de CFG. La model card indica que el VAE original de H3 y los condicionadores Qwen permanecen como dependencias separadas y que el paquete portable aún no ha superado una ejecución de aceptación en GPU; las mediciones del experimento de origen no garantizan el rendimiento de todas las combinaciones de componentes publicadas.

## Capacidades

- Generación de vídeo condicionada por una imagen inicial (image-to-video).
- Condicionamiento por texto para guiar el contenido del vídeo generado.
- Control explícito de la pose de las manos mediante condiciones de mano.
- Control de cámara mediante poses especificadas.
- Generación bidireccional de secuencia completa con CFG conjunto de 3.
- Resolución de salida de 1344 × 768.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de animación de manos en vídeo generado: el condicionamiento por pose de mano permite dirigir gestos concretos a partir de una imagen inicial, útil para experimentar con animación de personajes donde las manos son críticas.
- Previsualización de secuencias con cámara controlada: las poses de cámara permiten generar tomas con movimiento definido a partir de un fotograma de referencia, aplicable a storyboards y previsualización de planos.
- Investigación en control de difusión para vídeo: sirve como base para estudiar cómo se comportan las condiciones auxiliares (mano, cámara) sobre un transformer de 33B ajustado desde H3.
- Generación de material para demostraciones técnicas: útil para producir clips de 1344 × 768 que ilustren el efecto del condicionamiento múltiple en entornos de investigación.
- Experimentación con ajustes finos sobre H3: el repositorio documenta la lineage MiniMax H3 → LynnReal-Hand-Base-1.0, por lo que puede servir de referencia para quienes quieran replicar el proceso de fine-tune.
- Evaluación comparativa de pipelines image-to-video: al compartir base con H3, permite comparar el efecto del ajuste fino frente al modelo original en tareas de control de manos.
- Nota: dado que el repositorio no está listo para inferencia según la model card, estos casos son potenciales y no están validados en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 33B parámetros, una estimación orientativa en precisión completa superaría los 60 GB solo en pesos, pero no hay datos oficiales de consumo para este modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer?: no disponible; no se confirma viabilidad en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no disponible. La model card menciona una configuración de transformer para Diffusers y shards de Safetensors, pero no detalla integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La model card advierte que el paquete portable no ha superado una ejecución de aceptación en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| LynnReal-Hand-Base-1.0 | 33B | no disponible | MiniMax H3 Community License | Subida en curso, no listo para inferencia |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | MiniMax H3 Community License | Modelo base de referencia |
| Otros fine-tunes de H3 | no disponible | no disponible | MiniMax H3 Community License (derivados) | no disponible |

No se dispone de información sobre benchmarks ni sobre otros modelos comparables de la misma categoría (image-to-video con control de manos) en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no está listo para inferencia: la model card indica que la subida de los shards completos del transformer está en curso.
- El paquete portable no ha superado una ejecución de aceptación en GPU; las mediciones del experimento de origen no garantizan el rendimiento de todas las combinaciones de componentes.
- Dependencias externas: el VAE original de H3 y los condicionadores Qwen permanecen como dependencias separadas, lo que complica la reproducibilidad.
- Licencia restrictiva: la MiniMax H3 Community License Agreement impone restricciones territoriales, de uso y comerciales; los derivados (fine-tunes, destilados y comprimidos) conservan los términos upstream.
- La licencia Apache-2.0 del repositorio de código no sustituye la licencia de los pesos del modelo.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas ni latencia en producción.
- Al ser un fine-tune de un modelo propietario, la disponibilidad futura y el soporte dependen de la política de MiniMax respecto a H3.

## Enlaces

- Hugging Face: https://huggingface.co/shaohao011/LynnReal-Hand-Base-1.0
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: LICENSE (referenciado en el repositorio, no enlazado de forma directa en la información disponible)
- NOTICE: referenciado en el repositorio, no enlazado de forma directa en la información disponible
