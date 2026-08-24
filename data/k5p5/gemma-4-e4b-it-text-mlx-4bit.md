# k5p5/gemma-4-E4B-it-text-MLX-4bit

## Resumen

`k5p5/gemma-4-E4B-it-text-MLX-4bit` es una variante del modelo multimodal Gemma 4 E4B de Google DeepMind, cuantizado a 4 bits por Unsloth y posteriormente podado por k5p5 para eliminar las torres de visión y audio. El resultado es un checkpoint exclusivamente de texto, pensado para ejecutarse en dispositivos Apple con el framework MLX, como el iPhone. El autor lo desarrolla para su aplicación Personai, un chat on-device.

La relevancia de este modelo radica en que, al eliminar los pesos multimodales que los runtimes de texto descartan en tiempo de carga, se ahorra aproximadamente 1 GB de descarga y almacenamiento sin ninguna pérdida de calidad en la generación de texto. El autor verifica que la salida es token a token idéntica a la del modelo fuente. Está dirigido a desarrolladores que necesitan un modelo pequeño, eficiente y con licencia permisiva para integrar en aplicaciones móviles o entornos con recursos limitados.

El checkpoint contiene 1.520.127.018 parámetros según los tensores safetensors, aunque el modelo base Gemma 4 E4B declara 4.4B parámetros; la diferencia se debe a la eliminación de los componentes multimodales y a la cuantización. El tamaño del repositorio es de 5,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con atención KV-shared, solo texto |
| Parametros totales | 1.520.127.018 (según safetensors; el modelo base Gemma 4 E4B tiene 4,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo deriva de `unsloth/gemma-4-E4B-it-UD-MLX-4bit`, que a su vez es una cuantización a 4 bits del Gemma 4 E4B de Google. La arquitectura base es un transformer multimodal con torres separadas para visión y audio, pero en esta variante se han eliminado `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio`, así como los tensores de rango de activación (`input_max`, `input_min`, `output_max`, `output_min`) y las proyecciones redundantes `k_proj`/`v_proj`/`k_norm` de las capas finales que comparten KV. El autor indica que no se ha requantizado ningún peso: cada tensor restante es una copia byte a byte del original, por lo que la calidad es idéntica por construcción.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El modelo original de Google incluye instrucciones de ajuste fino y soporta "Thinking Mode", pero no se detallan aquí los datos de entrenamiento.

## Capacidades

- Generación de texto únicamente: no procesa imágenes ni audio, a diferencia del modelo Gemma 4 E4B original.
- Razonamiento y comprensión de lenguaje natural, heredados del modelo base.
- Generación de código y soporte matemático, típico de la familia Gemma 4.
- Capacidad multilingüe probable, aunque no se especifican idiomas concretos.
- No se documenta soporte explícito para tool calling o function calling.
- No se documenta soporte para agentes o razonamiento multi-paso más allá del estándar del modelo base.
- Compatible con MLX y mlx-lm, lo que permite integración en aplicaciones Apple Silicon.

## Casos de uso

- Chat en dispositivos móviles: el modelo está diseñado para ejecutarse en iPhone a través de la app Personai. Su tamaño reducido y la eliminación de pesos multimodales lo hacen adecuado para inferencia local con baja latencia.
- Asistente personal offline: al ser solo texto, puede integrarse en aplicaciones de mensajería o asistentes de voz (solo salida de texto) sin depender de la nube.
- Generación de respuestas en entornos con recursos limitados: por su cuantización 4-bit y su menor tamaño, cabe en GPUs de consumo o en memoria unificada de Apple Silicon.
- Prototipado rápido con MLX: los desarrolladores pueden cargarlo con `mlx_lm.load` y generar texto sin necesidad de infraestructura compleja.
- Filtrado o preprocesamiento de texto: al ser un modelo ligero, puede usarse para tareas de clasificación, extracción o resumen en pipelines de datos.
- Educación e investigación: sirve como referencia para estudiar el efecto de la poda de componentes multimodales en modelos pequeños, ya que el autor documenta el proceso de eliminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo verifica que la salida es idéntica al modelo fuente mediante decodificación greedy en prompts de referencia y una muestra de 512 tokens, pero no proporciona métricas numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible directamente, pero el modelo base Gemma 4 E4B requiere un mínimo de 8 GB de VRAM según fuentes externas. Esta variante, al ser solo texto y estar cuantizada a 4 bits, probablemente requiera menos, aunque no se especifica.
- GPU recomendadas: cualquier GPU compatible con MLX (Apple Silicon) o, en general, GPUs con suficiente memoria para el checkpoint de 5,6 GB.
- Cabe en GPUs de consumo como la RTX 4090 (24 GB) o en Macs con 16 GB de RAM unificada, aunque no se confirma oficialmente.
- Opciones de despliegue: mlx-lm (Python), mlx-swift-lm (Swift), y potencialmente otros runtimes que soporten MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| k5p5/gemma-4-E4B-it-text-MLX-4bit | 1,52B (safetensors) | no disponible | Gemma | MLX 4-bit | Solo texto, podado |
| unsloth/gemma-4-E4B-it-UD-MLX-4bit | 4,4B (base) | no disponible | Gemma | MLX 4-bit | Multimodal, cuantizado |
| google/gemma-4-E4B | 4,4B | no disponible | Gemma | Original | Multimodal, pesos completos |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No procesa imágenes ni audio: cualquier entrada multimodal será ignorada o producirá error.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los Gemma Terms of Use antes de desplegar en producción.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado por Google, puede heredar sesgos de los datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos de texto.
- La longitud de contexto no está especificada, lo que limita su uso en tareas que requieran ventanas largas.
- Al ser una versión podada, no se garantiza que todas las capacidades del modelo original (como Thinking Mode) se conserven íntegramente, aunque el autor afirma que la generación es idéntica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/k5p5/gemma-4-E4B-it-text-MLX-4bit
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-UD-MLX-4bit
- Modelo original (Google): https://huggingface.co/google/gemma-4-E4B
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E4B en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/gemma_4_e4b_it
- Web informativa sobre Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Repositorio Personai (app del autor): https://github.com/k5p5/personai
