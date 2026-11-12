# moonbox-ai/FLUX.2-klein-4B-GGUF

## Resumen

FLUX.2-klein-4B-GGUF es una colección de cuantizaciones en formato GGUF del modelo de difusión FLUX.2 [klein] 4B, publicadas por moonbox-ai para su uso en dispositivos locales. El modelo original lo desarrolla Black Forest Labs (BFL) y se distribuye como un transformer de flujo rectificado (rectified flow transformer) de aproximadamente 3.875 millones de parámetros, capaz de generar imágenes a partir de texto y de realizar edición de imágenes con múltiples referencias en una única arquitectura unificada. La relevancia de esta publicación radica en que empaqueta los pesos del transformer en un único fichero GGUF por precisión, lo que permite ejecutar el modelo en GPUs de consumo con herramientas como ComfyUI-GGUF.

El repositorio incluye seis precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), con tamaños que van de 7,75 GB a 2,29 GB, y documenta la desviación de cada una respecto a los pesos BF16 originales mediante el error RMS relativo de los pesos desquantizados. Solo se convierten los pesos propios del transformer: el codificador de texto (Qwen3-4B) y el VAE proceden del repositorio original de BFL y no se incluyen en estos ficheros.

La licencia Apache-2.0 del modelo base se mantiene en estas cuantizaciones, lo que habilita uso comercial. El modelo está pensado para flujos interactivos y despliegues con requisitos de latencia estrictos, con inferencia de extremo a extremo que BFL sitúa por debajo de un segundo en su configuración de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) para difusión |
| Parametros totales | 3.875.544.576 (aprox. 3,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un fichero por precisión) |

## Arquitectura y entrenamiento

El modelo base es un transformer de flujo rectificado de 4 mil millones de parámetros que unifica generación texto-a-imagen y edición imagen-a-imagen con múltiples referencias. BFL lo describe como su modelo más rápido hasta la fecha, destilado para generación de imágenes en menos de un segundo, y diseñado para ejecutarse en GPUs de consumo con un mínimo de aproximadamente 13 GB de VRAM. La model card original no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta publicación concreta no reentrena el modelo: parte de los pesos BF16 del repositorio `black-forest-labs/FLUX.2-klein-4B` en la revisión `e7b7dc27f9`, los convierte a GGUF F16/BF16 y los cuantiza con `llama-quantize` de llama.cpp. Cada fichero se verificó tensor a tensor contra los pesos originales antes de la subida, y la columna de error RMS relativo de la tabla de ficheros cuantifica esa desviación: desde 7,8e-9 en F16 (prácticamente idéntico) hasta el 6,9 % en Q4_K_M. La model card indica que las puntuaciones de calidad de imagen frente a BF16 se irán añadiendo a medida que cada precisión supere la evaluación de imagen del autor; en el momento de la consulta no se han publicado dichos resultados.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes (image-to-image) en el mismo modelo unificado.
- Edición con múltiples imágenes de referencia (multi-reference editing).
- Generación destilada de alta velocidad, orientada a inferencia de extremo a extremo por debajo de un segundo según BFL.
- Ejecución en hardware de consumo (aproximadamente 13 GB de VRAM en la configuración original).
- Integración con ComfyUI mediante el nodo Unet Loader (GGUF) del plugin ComfyUI-GGUF.
- Integración con Diffusers mediante `Flux2KleinPipeline`.
- Disponibilidad vía API de BFL.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Generación de imágenes en local para desarrollo e iteración rápida: con Q8_0 (4,17 GB) el transformer cabe en GPUs de 8 GB o más, lo que permite probar prompts y estilos sin depender de servicios en la nube.
- Prototipado de flujos de edición de imágenes: el modelo admite image-to-image y multi-referencia, útil para construir herramientas de retoque, sustitución de fondos o composición guiada por varias imágenes de referencia.
- Despliegue en producción con latencia crítica: al ser un modelo destilado para generación sub-segundo, encaja en aplicaciones interactivas donde el usuario espera respuesta inmediata, como previsualizaciones en editores gráficos.
- Ejecución en el borde (edge) o en estaciones de trabajo modestas: las variantes Q4_K_M (2,29 GB) y Q5_K_M (2,77 GB) permiten correr el transformer en tarjetas de 6-8 GB, dejando margen para el codificador de texto y el VAE.
- Integración en pipelines de ComfyUI: sustituyendo el cargador de modelo por Unet Loader (GGUF) y manteniendo los cargadores de text encoder y VAE del flujo original, se puede incorporar el modelo a grafos de generación ya existentes.
- Re-cuantización o ajuste fino posterior: los ficheros F16 y BF16 (7,75 GB) sirven como referencia exacta o como punto de partida para generar nuevas precisiones.
- Evaluación comparativa de calidades: la tabla de error RMS permite elegir la precisión según el compromiso entre tamaño y fidelidad a los pesos originales (0,55 % en Q8_0 frente a 6,9 % en Q4_K_M).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta el error RMS relativo de los pesos desquantizados frente a BF16, que se recoge en la siguiente tabla:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 7,75 GB | 0,000001 % (7,8e-9) |
| BF16 | 7,75 GB | exacto |
| Q8_0 | 4,17 GB | 0,55 % |
| Q6_K | 3,24 GB | 1,8 % |
| Q5_K_M | 2,77 GB | 3,5 % |
| Q4_K_M | 2,29 GB | 6,9 % |

No hay datos publicados de MMLU, HumanEval, GSM8K ni métricas de calidad de imagen (FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: entre 2,29 GB (Q4_K_M) y 7,75 GB (F16/BF16). Hay que sumar la memoria del codificador de texto Qwen3-4B y del VAE, que no están incluidos en estos ficheros.
- VRAM total del pipeline original: aproximadamente 13 GB según BFL para el modelo sin cuantizar.
- GPU recomendadas por BFL: RTX 3090 y RTX 4070 como mínimo para el modelo original; el modelo cabe en GPUs de consumo.
- Ajuste por cuantización según la model card: Q8_0 para el mejor compromiso tamaño/fidelidad (unas 8 GB de tarjeta), Q6_K y Q5_K_M para tarjetas de 8 GB, Q4_K_M para tarjetas de 6 GB.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (nodo Unet Loader GGUF), Diffusers con `Flux2KleinPipeline`, y la API de BFL para uso gestionado.
- Latencia y throughput: BFL declara inferencia de extremo a extremo por debajo de un segundo para el modelo destilado; no se aportan cifras de throughput ni latencia por cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-GGUF (esta ficha) | 3,88 mil millones | no aplica (imagen) | Apache-2.0 | GGUF (6 precisiones) | Cuantizaciones para uso local; error RMS documentado por fichero |
| FLUX.2-klein-4B (original) | 3,88 mil millones | no aplica (imagen) | Apache-2.0 | safetensors | Pesos BF16 de referencia; requiere el pipeline completo (text encoder + VAE) |
| Otros modelos de difusión de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantización introduce desviación respecto a los pesos originales: hasta un 6,9 % de error RMS en Q4_K_M, lo que puede degradar la calidad de imagen frente a BF16.
- Los ficheros GGUF contienen solo el transformer; es imprescindible descargar el codificador de texto (Qwen3-4B) y el VAE desde el repositorio original de BFL, lo que añade consumo de VRAM y complejidad de despliegue.
- No hay resultados publicados de evaluación de calidad de imagen para estas cuantizaciones en el momento de la consulta; la model card indica que se irán añadiendo.
- La model card original no documenta sesgos conocidos, composición del dataset ni riesgos de alucinación visual; se desconoce el comportamiento en dominios especializados.
- La licencia Apache-2.0 permite uso comercial, pero al ser una obra derivada se mantiene la licencia del modelo base; conviene revisar los términos del repositorio original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- No se dispone de información sobre idiomas soportados para los prompts; el codificador de texto es Qwen3-4B, pero no se detalla su cobertura lingüística en esta ficha.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-GGUF
- Modelo base original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de BFL sobre FLUX.2 [klein]: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
- Repositorio GitHub de FLUX.2: https://github.com/black-forest-labs/flux2
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Diffusers: https://github.com/huggingface/diffusers
- API de BFL: https://bfl.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
