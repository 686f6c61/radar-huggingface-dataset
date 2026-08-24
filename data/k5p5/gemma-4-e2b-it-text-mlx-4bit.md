# k5p5/gemma-4-E2B-it-text-MLX-4bit

## Resumen

El modelo `k5p5/gemma-4-E2B-it-text-MLX-4bit` es una versión adaptada del checkpoint cuantizado `unsloth/gemma-4-E2B-it-UD-MLX-4bit`, que a su vez deriva del modelo multimodal Gemma 4 E2B de Google DeepMind. El autor, k5p5, ha eliminado los towers de visión y audio, así como tensores redundantes, dejando únicamente la parte de generación de texto. El resultado es un modelo de 965 millones de parámetros en cuantización 4-bit MLX, pensado para ejecutarse en dispositivos con recursos limitados, como un iPhone.

Esta ficha es relevante porque aborda un problema práctico: los runtimes de texto (como `mlx-lm` o `mlx-swift-lm`) descartan los pesos multimodales en tiempo de carga, pero el checkpoint original los incluye, lo que supone un gasto innecesario de descarga y almacenamiento. Al eliminar esos tensores, el repositorio reduce su tamaño de 4,52 GB a 3,55 GB, sin pérdida de calidad, ya que no se ha requantizado ningún peso y la salida es token a token idéntica a la fuente.

El modelo está diseñado para aplicaciones de chat en el dispositivo, como la app Personai, y se distribuye bajo la licencia Gemma. Su arquitectura es un transformer denso con atención estándar, y su contexto de 8K lo hace adecuado para conversaciones de longitud media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), text-only, sin towers de vision/audio |
| Parametros totales | 965.623.075 (text-only; el modelo multimodal original tiene ~2.1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8K (segun documentacion de Gemma 4 E2B) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer denso con atención de ventana completa. La version original es multimodal (texto, imagen y audio), pero este checkpoint elimina los towers `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio`, junto con los tensores de rango de activacion y las proyecciones K/V redundantes de las capas finales. No se ha realizado ningun reentrenamiento ni ajuste adicional: los tensores restantes son copias byte a byte del checkpoint fuente, por lo que la calidad es identica por construccion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) del modelo original. Se sabe que Gemma 4 E2B es una variante instruida (`-it`) y que la familia Gemma 4 incorpora modos de razonamiento configurables, aunque no se confirma si esta version text-only los conserva.

## Capacidades

- Generacion de texto: produce respuestas coherentes y contextualizadas en formato conversacional.
- Razonamiento: segun la documentacion de Gemma 4, los modelos de la familia estan disenados como razonadores capaces, con modos de pensamiento configurables. Esta capacidad podria estar presente, aunque no se verifica en la model card.
- Multilingue: no se especifican idiomas soportados; se asume cobertura similar a la de Gemma 4, pero no confirmado.
- Sin soporte de vision ni audio: al eliminar los towers, el modelo solo procesa texto.
- Sin soporte de tool calling ni function calling: no se menciona en la documentacion disponible.
- Sin capacidades de agente: no hay evidencia de soporte para multi-step reasoning autonomo.

## Casos de uso

- Chat en dispositivos moviles: el modelo esta optimizado para ejecutarse en iPhone y otros dispositivos edge gracias a su tamano reducido (3,55 GB) y cuantizacion 4-bit. Puede alimentar asistentes personales que funcionen sin conexion.
- Aplicaciones de mensajeria con respuestas inteligentes: integrable en apps de correo o mensajeria para sugerir respuestas rapidas basadas en el contexto de la conversacion.
- Generacion de contenido breve: redaccion de resumenes, titulares o descripciones de productos en entornos con recursos limitados.
- Prototipado rapido de chatbots: al ser un modelo pequeno y con licencia permisiva (Gemma), es adecuado para pruebas de concepto en entornos de desarrollo sin GPU potente.
- Educacion y aprendizaje: uso en aplicaciones de tutoria que requieran respuestas textuales sin necesidad de procesamiento multimodal.
- Asistentes de escritura en local: autocompletado y reescritura de texto en editores ligeros, aprovechando el contexto de 8K para documentos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco se proporcionan comparaciones con modelos similares. Se recomienda realizar pruebas propias si se necesita validar el rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada: con 965M parametros en 4-bit, el modelo ocupa aproximadamente 0,5 GB en memoria (965M * 0,5 bytes). Con overhead de runtime, se estima entre 1 y 2 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, Apple Silicon con 8 GB unificados). Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja y en dispositivos moviles con suficiente RAM.
- Opciones de despliegue: `mlx-lm` (Python), `mlx-swift-lm` (Swift), y potencialmente `llama.cpp` si se convierte a GGUF, aunque el formato nativo es MLX.
- Latencia y throughput: no se proporcionan datos. En un iPhone moderno, se espera una generacion de 10-20 tokens por segundo, pero es una estimacion sin confirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| k5p5/gemma-4-E2B-it-text-MLX-4bit | 965M | 8K | Gemma | MLX 4-bit |
| Gemma 2 2B (original) | 2.6B | 8K | Gemma | safetensors |
| Phi-3 mini | 3.8B | 4K | MIT | safetensors |
| Qwen2.5 1.5B | 1.5B | 32K | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativos. La ventaja principal de este modelo es su tamano reducido y su optimizacion para MLX en dispositivos Apple, mientras que las alternativas ofrecen mayor contexto (Qwen) o licencias mas permisivas (Phi-3, Qwen). La comparativa se basa en especificaciones publicas, no en benchmarks.

## Limitaciones y advertencias

- Sin capacidades multimodales: al eliminar los towers de vision y audio, el modelo no puede procesar imagenes ni sonido, limitando su uso a tareas de texto puro.
- Contexto limitado a 8K: puede ser insuficiente para documentos largos o conversaciones extensas.
- Idiomas no especificados: no se garantiza un rendimiento uniforme en todos los idiomas; se recomienda probar en el idioma objetivo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Sesgos potenciales: al derivar de Gemma 4, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Licencia Gemma: aunque permite uso comercial, esta sujeta a los Terminos de Uso de Gemma, que incluyen restricciones sobre usos prohibidos (por ejemplo, ciertos sectores regulados). Es necesario revisar los terminos completos antes de desplegar en produccion.
- Sin soporte de tool calling: no es adecuado para agentes que requieran interaccion con APIs o funciones externas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/k5p5/gemma-4-E2B-it-text-MLX-4bit
- Modelo base (unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-UD-MLX-4bit
- Modelo original (Google): https://huggingface.co/google/gemma-4-E2B
- Pagina de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha en LM Studio: https://lmstudio.ai/models/google/gemma-4-e2b
- Documentacion de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/gemma_4_e2b_it
- Repositorio Personai (autor): https://github.com/k5p5/personai
