# electroglyph/Muse-Glimmer-30B-uncensored2-AutoRound-W4A16-G128

## Resumen

Muse-Glimmer-30B-uncensored2-AutoRound-W4A16-G128 es una cuantización de 4 bits de los pesos del modelo multimodal electroglyph/Muse-Glimmer-30B-uncensored2, publicada por el usuario electroglyph y generada con la herramienta Intel AutoRound. El pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas de imagen y texto y produce texto. La cuantización emplea el esquema W4A16 (pesos de 4 bits, activaciones de 16 bits, simétrico, con group_size=128) y se ha afinado con SignRound sobre datos de calibración, no con simple round-to-nearest.

El dato de parámetros es llamativo: pese al nombre comercial "30B", el recuento real de parámetros en los ficheros safetensors es de 7.979.531.264 (aproximadamente 8.000 millones), lo que sugiere que el nombre del repositorio no refleja el tamaño real del modelo o que se refiere a otra magnitud. El repositorio ocupa 22,3 GB, coherente con un modelo multimodal cuantizado a 4 bits más los componentes adicionales (vision tower, processor, etc.). No se dispone de información sobre licencia ni idiomas soportados.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización AutoRound W4A16 lista para servirse con vLLM sin flag adicional de cuantización; por otro, sirve de ejemplo de las discrepancias habituales entre el nombre del modelo y sus especificaciones reales, algo que conviene verificar siempre antes de desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline `image-text-to-text`; familia `muse_glimmer` según tags) |
| Parametros totales | 7.979.531.264 (según safetensors; el nombre indica "30B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `--max-model-len 32768` |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), group_size=128, simétrico, formato `auto_round` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato de cuantización `auto_round`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (transformer denso, MoE, híbrido, etc.) ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente documenta el proceso de cuantización, no el preentrenamiento ni el ajuste del modelo original.

Lo que sí está documentado es el procedimiento de cuantización: Intel AutoRound con esquema W4A16, formato `auto_round`, 4 bits, group_size=128 y simetría. Se aplicó SignRound real (no RTN) durante 1000 iteraciones, con 512 muestras de calibración de longitud 2048, usando los datasets `HuggingFaceH4/ultrachat_200k` (384 muestras) y `nvidia/OpenCodeInstruct` (128 muestras), batch size 8, `device_map="auto"`, dtype bf16 y semilla 42. La model card menciona además un "Reasoning strength" configurable mediante system prompt (`low`, `medium`, `high`, `xhigh`), lo que indica que el modelo base incorpora modos de razonamiento, aunque no se detalla su implementación técnica.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`, clase `AutoModelForImageTextToText`).
- Modos de razonamiento configurables mediante system prompt: `low`, `medium`, `high`, `xhigh`; la model card recomienda `high` o `xhigh` para tareas de código y agentes.
- Compatibilidad con endpoints (`endpoints_compatible` según tags).
- El modelo base es una variante "uncensored", lo que implica que se ha reducido o eliminado el filtrado de contenido respecto al modelo original.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de audio.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede recibir capturas de pantalla o imágenes junto con texto y mantener una conversación multi-turno, lo que permite construir asistentes que interpretan documentación visual, diagramas o interfaces de usuario.
- Análisis de documentación técnica con imágenes: extracción y explicación de diagramas de arquitectura, gráficas o tablas escaneadas en flujos de soporte interno, aprovechando el pipeline `image-text-to-text`.
- Generación de código asistida: la calibración incluye `nvidia/OpenCodeInstruct` y la model card recomienda activar `Reasoning strength: high` o `xhigh` para tareas de código, lo que sugiere un uso orientado a generación y explicación de código en entornos de desarrollo.
- Despliegue en servidores con VRAM limitada: al ser una cuantización W4A16 de aproximadamente 8.000 millones de parámetros, el repositorio de 22,3 GB permite servir el modelo con vLLM en GPUs de gama alta de consumo o profesionales, reduciendo el coste frente al modelo en bf16.
- Investigación sobre cuantización: el repositorio documenta con detalle el proceso AutoRound (datasets, iteraciones, hiperparámetros), por lo que sirve como referencia reproducible para estudiar el impacto de W4A16 en modelos multimodales.
- Prototipado de agentes con razonamiento explícito: el control de "Reasoning strength" vía system prompt permite ajustar el coste computacional según la tarea, usando `low` para respuestas rápidas y `xhigh` para tareas de varios pasos.
- Evaluación de modelos "uncensored" en entornos controlados: útil para estudiar el comportamiento de modelos sin filtrado en tareas de investigación, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,3 GB en disco; con pesos W4A16 y activaciones en 16 bits, se puede servir con GPUs de 24 GB (por ejemplo, RTX 4090) usando `--gpu-memory-utilization 0.8`, aunque el contexto máximo de 32768 tokens puede requerir más memoria para la caché KV.
- GPUs recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para despliegues pequeños; el ejemplo de la model card usa vLLM con `device_map="auto"`.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB), dependiendo de la longitud de contexto y del tamaño de la caché KV.
- Opciones de despliegue: vLLM (soporte nativo de `auto_round` W4A16 sin flag `--quantization`, según la model card) y Transformers con `transformers>=5.22.2` más `auto-round` instalado. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (multimodales de ~8.000 millones de parámetros cuantizados a 4 bits) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Discrepancia entre nombre y tamaño: el nombre indica "30B" pero los safetensors declaran 7.979.531.264 parámetros; conviene verificar el modelo antes de dimensionar infraestructura.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o revisar el modelo base antes de un despliegue en producción.
- Idiomas no documentados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Modelo "uncensored": el filtrado de contenido se ha reducido o eliminado, lo que implica riesgo de generar contenido inapropiado, sesgado o dañino; requiere moderación externa en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser una cuantización de 4 bits, puede degradarse ligeramente la calidad respecto al modelo en bf16.
- Contexto máximo no confirmado: el ejemplo de vLLM usa 32768 tokens, pero la model card no declara oficialmente la longitud de contexto del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por la comunidad.
- Cuantización W4A16: requiere versiones recientes de vLLM o Transformers con soporte `auto_round`; versiones antiguas pueden no cargar los pesos correctamente.
- Fecha de creación futura (2026-11-10) en los metadatos: conviene tratar los datos temporales con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/electroglyph/Muse-Glimmer-30B-uncensored2-AutoRound-W4A16-G128
- Modelo base: https://huggingface.co/electroglyph/Muse-Glimmer-30B-uncensored2
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Documentación de vLLM sobre cuantización Intel: https://docs.vllm.ai/en/stable/features/quantization/inc/
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibración: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
