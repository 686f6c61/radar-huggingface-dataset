# justinsimpsad/la-vel

## Resumen

LA VEL es un modelo de lenguaje de tipo transformer decoder-only, desarrollado desde cero por el autor justinsimpsad, que se presenta como un proyecto abierto y en crecimiento público. El repositorio principal contiene el núcleo de lenguaje, mientras que repositorios hermanos abordan visión, música, mallas 3D y análisis de mercados. El modelo está diseñado para ser entrenado y ampliado de forma incremental mediante kernels de Kaggle que reanudan el entrenamiento desde el último checkpoint.

En su versión semilla, el modelo cuenta con aproximadamente 17,1 millones de parámetros, una arquitectura GPT-style con pre-normalización, atención causal SDPA, MLP con GELU y embeddings atados. La longitud de contexto es de 512 tokens en la semilla, ampliable a 2048 tokens con codificación posicional RoPE en la versión escalada de 69,3 millones de parámetros. Está entrenado con una mezcla de TinyStories y Gutenberg, alrededor de 16 millones de tokens por pasada de entrenamiento.

La relevancia actual del proyecto reside en su enfoque de "crecimiento en público": cualquier persona puede reanudar el entrenamiento, escalar el modelo y contribuir con pesos actualizados. Sin embargo, el estado actual es claramente experimental: el autor admite que el núcleo de texto produce inglés de nivel "juguete" con una perplejidad de validación de 50-60, por lo que no es adecuado para uso productivo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-LN GPT-style, SDPA causal attention, GELU MLP, tied embeddings |
| Parametros totales | 17,1M (seed) / 69,3M (escalado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (seed, posicion aprendida) / 2048 tokens (escalado, RoPE) |
| Tipos de cuantizacion | GGUF (llama.cpp-compatible, arch=gpt2) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con pre-normalizacion (pre-LN), atencion causal implementada con SDPA (scaled dot-product attention), MLP con activacion GELU y embeddings de token y posicion atados (tied embeddings). La codificacion posicional es seleccionable en `config.json`: `learned` para la semilla (contexto 512) o `rope` para la version de contexto largo (2048). El tokenizador es un ByteLevel-BPE de 16k vocabulario.

El entrenamiento se realiza con una mezcla de TinyStories y Gutenberg, aproximadamente 16 millones de tokens por pasada de entrenamiento. El autor reporta una perplejidad de validacion de 50-60 en la semilla, que estaba disminuyendo al momento de publicar. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. El proyecto incluye un kernel de Kaggle que permite reanudar el entrenamiento desde el checkpoint publicado, escalar opcionalmente a la version grande (12 capas, 12 cabezas, d768, contexto 2048) y subir los nuevos pesos de vuelta al repositorio.

## Capacidades

- Generacion de texto en ingles a nivel "toy" (el propio autor lo califica como ingles de juguete, con perplejidad alta).
- Generacion autoregresiva con sampling CLI (`generate.py`).
- Soporte de exportacion a GGUF para su uso con llama.cpp.
- Capacidad de reanudar entrenamiento y escalar el modelo mediante kernels de Kaggle.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- No hay evidencia de capacidades multilingues mas alla del ingles.

## Casos de uso

Dado el estado embrionario del modelo, los casos de uso realistas son limitados y orientados a investigacion y educacion:

- **Experimentos educativos de arquitectura transformer**: por su tamano reducido (17M de parametros) y su implementacion autonoma sin dependencias de transformers, es util para estudiar el funcionamiento interno de un decoder-only, la atencion causal y el efecto de distintas codificaciones posicionales.
- **Prototipado de pipelines de entrenamiento**: el codigo `train.py` con `--resume-from` y `--push-to-hf` permite practicar flujos de reanudacion y publicacion de checkpoints, util para aprender MLOps.
- **Pruebas de cuantizacion y exportacion**: el script `gguf_export.py` y el archivo GGUF incluido permiten experimentar con la conversion de safetensors a GGUF y su ejecucion en llama.cpp.
- **Fine-tuning para tareas muy especificas y pequenas**: con 17M de parametros, se puede ajustar en una GPU consumer para generar texto en dominios muy acotados (por ejemplo, cuentos infantiles estilo TinyStories), aunque la calidad sera limitada.
- **Investigacion sobre crecimiento incremental de modelos**: el enfoque de "crecer en publico" con kernels de Kaggle es un caso de estudio interesante para quienes investigan tecnicas de continuacion de entrenamiento y escalado progresivo.
- **Benchmarking de eficiencia en hardware modesto**: al ser extremadamente pequeno, permite medir latencia y throughput en CPUs o GPUs de baja gama, sirviendo como referencia para comparar con modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad de validacion de 50-60 en la semilla, que el autor indica que estaba disminuyendo. No hay comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo seed de 17,1M de parametros en FP32 ocupa aproximadamente 68 MB; en cuantizacion GGUF Q4 ocuparia unos 10 MB. La version escalada de 69,3M en FP32 ocupa unos 277 MB; en Q4 unos 35 MB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente para la version seed. Incluso una CPU moderna puede ejecutar la inferencia sin problemas. Para el entrenamiento o fine-tuning, una GPU con 4-8 GB (por ejemplo, GTX 1650, RTX 3050) es mas que suficiente.
- **Compatibilidad con GPU consumer**: si, cabe en cualquier GPU consumer actual, incluidas las integradas.
- **Opciones de despliegue**: llama.cpp (via GGUF), o el codigo PyTorch autonomo incluido en el repositorio. No se menciona compatibilidad con vLLM, TGI u Ollama, aunque al ser un modelo GPT-2-like podria adaptarse, pero no esta documentado.
- **Latencia y throughput**: no se han publicado mediciones. Dado el tamano, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos de la misma categoria (tamano y proposito). El modelo mas cercano en arquitectura seria GPT-2 small (124M de parametros), pero es significativamente mas grande y entrenado con muchos mas datos. Otros modelos de ~17M de parametros como TinyStories (el dataset usado) o modelos tipo nanoGPT no tienen benchmarks publicados comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Calidad de generacion muy baja**: el modelo produce texto a nivel "toy" con perplejidad alta (50-60), por lo que no es util para tareas reales de generacion de texto.
- **Alucinaciones frecuentes**: al ser un modelo pequeno y poco entrenado, es probable que genere contenido incoherente o inventado.
- **Limitacion de idioma**: solo entiende ingles, y con un vocabulario muy limitado (16k BPE).
- **Contexto corto**: la version seed tiene solo 512 tokens de contexto, insuficiente para conversaciones o documentos largos.
- **Sin capacidades avanzadas**: no soporta tool calling, agentes, vision, audio ni razonamiento complejo.
- **Licencia MIT**: permite uso comercial, pero el estado del modelo hace que su uso en produccion sea desaconsejable.
- **Proyecto en fase experimental**: los modulos de vision, musica, mallas 3D y mercados son semillas entrenadas con datos sinteticos y no estan listos para uso real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justinsimpsad/la-vel
- Kernel de crecimiento en Kaggle (texto): https://www.kaggle.com/code/justinsimpsad/la-vel-growth
- Repositorios hermanos (mencionados en la model card, sin URL directa): la-vel-vision, la-vel-music, la-vel-mesh3d, la-vel-markets (buscables en HuggingFace por autor justinvibesrise o justinsimpsad).
