# masahiroid/clap-htsat-fused-coreai

## Resumen

clap-htsat-fused-coreai es una conversión de formato del checkpoint CLAP (Contrastive Language-Audio Pretraining) original de LAION, publicada por el usuario masahiroid. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint `laion/clap-htsat-fused` (revisión `365dea6ef167def6676140ed93bbc43f84dabb28`) reexportado al formato Apple Core AI (`*.aimodel`) en precisión F32, para su ejecución sobre GPU en Apple Silicon mediante el runtime `coreai-core`.

CLAP es un modelo contrastivo multimodal que proyecta audio y texto a un espacio compartido de embeddings de 512 dimensiones, L2-normalizados. Esto permite tareas de recuperación y clasificación audio-texto mediante similitud coseno. La arquitectura combina una torre de audio HTSAT (Hierarchical Token-Semantic Audio Transformer) con fusión de características y una torre de texto, siguiendo el diseño descrito por LAION.

La relevancia de esta publicación es puramente operativa: facilita el despliegue de CLAP en macOS sobre Apple Silicon sin depender de PyTorch en tiempo de inferencia. El autor declara explícitamente que no se ha realizado ningún reentrenamiento ni cuantización a 4 bits, y que no se reclama mejora alguna de calidad, robustez o velocidad frente al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto: torre de audio HTSAT (con fusión de características) y torre de texto transformer; cabezas de proyección a espacio compartido de 512 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Texto: 77 tokens (fijo en la exportación). Audio: ventana de 10 segundos por clip, con ruta de fusión para clips largos |
| Tipos de cuantizacion | F32 únicamente (el autor indica explícitamente que no es cuantización de 4 bits) |
| Idiomas soportados | no disponible (el modelo original está entrenado principalmente en inglés; la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (pesos originales); las adiciones de runtime y conversión son MIT |
| Formato de pesos | Apple Core AI (`*.aimodel`), F32; no es un paquete Core ML. Existen conversiones hermanas a MLX y Core ML |

## Arquitectura y entrenamiento

El modelo subyacente es CLAP en su variante `htsat-fused`: un modelo contrastivo lenguaje-audio que empareja una torre de audio basada en HTSAT con una torre de texto, ambas con cabezas de proyección hacia un espacio latente común de 512 dimensiones. La variante "fused" incorpora un mecanismo de fusión de características y aumento keyword-to-caption, lo que permite procesar entradas de audio de longitud variable y mejora el rendimiento en la tarea contrastiva. El checkpoint incluye ambas torres, ambas cabezas de proyección, las rutas de audio corta (sin fusión) y larga (con fusión), y las escalas logit entrenadas.

Esta publicación no aporta información nueva sobre el entrenamiento: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. La conversión tampoco modifica los pesos; el autor verifica la paridad numérica frente al checkpoint PyTorch original con una diferencia absoluta máxima de 1,1324883e-06 y una similitud coseno mínima de 0,99999999998. Las adaptaciones técnicas para permitir la exportación incluyen la precomputación de la selección de ruta de fusión y de las máscaras de ventana desplazada para lote estático de tamaño 1, y la reexpresión de la interpolación temporal bicúbica mediante gathers con el mismo kernel (a=-0.75, align_corners=True) para evitar un operador bicúbico no soportado.

## Capacidades

- Generación de embeddings de audio y de texto en un espacio compartido de 512 dimensiones, L2-normalizados.
- Recuperación audio-texto y texto-audio mediante similitud coseno.
- Clasificación zero-shot de audio usando etiquetas textuales.
- Cálculo de logits CLAP con las escalas logit exponenciales entrenadas del checkpoint original (`clap_logits`).
- Procesamiento de clips cortos (ruta sin fusión) y clips largos (ruta con fusión), con ventana de audio de 10 segundos gestionada por el procesador original.
- Soporte de las convenciones `get_text_features` y `get_audio_features` del modelo original.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo de representación, no un LLM generativo.
- No dispone de visión ni audio generativo.

## Casos de uso

- Búsqueda semántica de audio en bibliotecas de sonido: indexar los embeddings de audio de un catálogo y consultar con descripciones textuales en lenguaje natural, usando la similitud coseno del espacio compartido de 512 dimensiones.
- Etiquetado automático de archivos de audio: comparar el embedding de cada clip contra un conjunto de prompts textuales de categorías para asignar etiquetas sin entrenamiento adicional.
- Moderación y clasificación de contenido sonoro: detectar categorías concretas (por ejemplo, ruido, voz, música) mediante clasificación zero-shot con umbrales sobre los logits CLAP.
- Aplicaciones de escritorio nativas en macOS: integrar búsqueda o clasificación de audio en apps para Apple Silicon aprovechando la ejecución GPU del runtime Core AI, sin cargar PyTorch.
- Prototipado de pipelines multimedia en local: validar arquitecturas de recuperación audio-texto en un portátil Apple antes de escalar a infraestructura con el checkpoint original.
- Verificación de paridad en migraciones de formato: usar los vectores de validación incluidos (`*_validation_vectors.npz`) como referencia para validar otras conversiones del mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de paridad numérica frente al checkpoint PyTorch original: diferencia absoluta máxima de 1,1324883e-06 y similitud coseno mínima de 0,99999999998, verificadas con señales sinusoidales y de ruido sintéticas. El autor indica explícitamente que esto no constituye un benchmark de calidad de recuperación sobre audio natural, y no se reclama mejora de velocidad en dispositivo.

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 27.2 (entorno validado); requiere el runtime `coreai-core==1.0.0b3` para ejecución en GPU.
- VRAM estimada: no disponible; el repositorio ocupa 0,7 GB en F32, lo que da una cota superior aproximada del espacio de pesos, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no se especifican modelos concretos de Apple Silicon; la validación se realizó en macOS con ejecución GPU del runtime Core AI.
- No es desplegable en GPU NVIDIA ni en consumer GPU de otras plataformas: el formato `*.aimodel` es específico de Apple Core AI.
- Opciones de despliegue: exclusivamente el runtime Core AI con el helper `inference.py` incluido (síncrono, pensado para scripts independientes). No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias de conversión documentadas: PyTorch 2.14.1, Transformers 4.57.3, NumPy 1.26.4, coremltools 9.0, MLX 0.32.4; la conversión a Core AI usa un entorno separado con Python 3.14.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clap-htsat-fused-coreai | no disponible | texto 77 tokens; audio 10 s por clip | Core AI (`*.aimodel`), F32 | Apache-2.0 (pesos) / MIT (runtime) | Hugging Face, 0 descargas |
| laion/clap-htsat-fused | no disponible | texto 77 tokens; audio variable con fusión | PyTorch (safetensors) | Apache-2.0 | Hugging Face, modelo de referencia |
| masahiroid/clap-htsat-fused-mlx | no disponible | no disponible | MLX | Apache-2.0 (pesos) / MIT (runtime) | Hugging Face |
| masahiroid/clap-htsat-fused-coreml | no disponible | no disponible | Core ML | Apache-2.0 (pesos) / MIT (runtime) | Hugging Face |

Las tres conversiones de masahiroid comparten pesos y licencia; se diferencian únicamente en el runtime de destino (Core AI, MLX y Core ML). El checkpoint original de LAION es la alternativa para despliegues fuera del ecosistema Apple.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todas las limitaciones del checkpoint `laion/clap-htsat-fused` original.
- El autor no reclama ninguna mejora de calidad, robustez o velocidad en dispositivo; la validación se hizo con señales sintéticas, no con audio natural.
- Formas fijas y lote de tamaño 1: `input_ids` y `attention_mask` de `[1, 77]`, y `input_features` de `[1, 4, 1001, 64]`. No admite batching dinámico ni contextos de texto más largos que 77 tokens en esta exportación.
- La entrada de audio debe ser una forma de onda mono en float, ya remuestreada a 48.000 Hz; los modelos exportados aceptan características del procesador, no formas de onda crudas.
- La selección entre ruta corta y larga debe hacerse según el flag `is_longer` devuelto por el procesador, no según la duración: el procesador original puede marcar un clip corto como `is_longer=True` si el lote no contiene clips largos.
- Los recortes de fusión son aleatorizados por el procesador original; para reproducibilidad hay que fijar la semilla de NumPy.
- El helper es síncrono; en un bucle de eventos asíncrono existente hay que adaptar su corrutina `predict` en lugar de anidar `asyncio.run`.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un modelo contrastivo, los errores se manifiestan como recuperaciones o clasificaciones incorrectas, no como texto generado.
- Licencia: los pesos son Apache-2.0 y las adiciones de código MIT, lo que permite uso comercial, pero conviene revisar los términos del checkpoint original de LAION.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación independiente.
- El autor advierte de revisar el código Python incluido antes de ejecutarlo; los datos del modelo se guardan sin checkpoints pickle.

## Enlaces

- [masahiroid/clap-htsat-fused-coreai en Hugging Face](https://huggingface.co/masahiroid/clap-htsat-fused-coreai)
- [laion/clap-htsat-fused (checkpoint original)](https://huggingface.co/laion/clap-htsat-fused/tree/365dea6ef167def6676140ed93bbc43f84dabb28)
- [masahiroid/clap-htsat-fused-mlx](https://huggingface.co/masahiroid/clap-htsat-fused-mlx)
- [masahiroid/clap-htsat-fused-coreml](https://huggingface.co/masahiroid/clap-htsat-fused-coreml)
- [Documentación de CLAP en Transformers](https://huggingface.co/docs/transformers/model_doc/clap)
- [laion/clap-htsat-fused en ModelScope](https://www.modelscope.cn/models/laion/clap-htsat-fused)
