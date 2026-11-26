# meger999/OmniSVG

## Resumen

OmniSVG es una familia de modelos generadores de gráficos vectoriales escalables (SVG) de extremo a extremo, construida sobre modelos visión-lenguaje (VLM) preentrenados. Lo desarrolla el equipo OmniSVG (Yiying Yang, Wei Cheng, Sijin Chen y colaboradores) y esta ficha corresponde a la réplica publicada por el usuario meger999 en Hugging Face, derivada del modelo oficial OmniSVG-3B mediante ajuste fino sobre Qwen/Qwen2.5-VL-3B-Instruct. El modelo resuelve la generación condicional de SVG tanto a partir de texto (text-to-SVG) como a partir de imagen (image-to-SVG), cubriendo desde iconos simples hasta ilustraciones complejas.

La relevancia técnica reside en que unifica ambas tareas en un único modelo multimodal en lugar de pipelines especializados, y en que se acompaña del conjunto de datos MMSVG-2M (dos millones de activos SVG anotados) y de un protocolo estandarizado de evaluación. La arquitectura subyacente es un transformer decoder-only multimodal de 3B parámetros con codificador visual, heredado de Qwen2.5-VL-3B-Instruct y ajustado para emitir código SVG como secuencia de tokens.

El modelo se distribuye con licencia Apache 2.0, pesos en formato PyTorch (safetensors/binarios, ~8,5 GB), soporte de inglés y chino, y un consumo de VRAM de aproximadamente 17 GB para inferencia según la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (VLM), base Qwen2.5-VL-3B-Instruct con codificador visual |
| Parametros totales | 3B (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión completa, ~8,5 GB) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (modelo); dataset MMSVG bajo CC-BY-NC-SA 4.0 |
| Formato de pesos | PyTorch (repo de 8,5 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

OmniSVG parte de Qwen2.5-VL-3B-Instruct, un VLM con codificador visual y decoder transformer autorregresivo, y lo ajusta para la tarea de generación de SVG. La salida del modelo es una secuencia de tokens SVG (comandos de path y coordenadas) que se renderiza posteriormente con CairoSVG. El modelo se entrena sobre MMSVG-2M, un corpus multimodal de dos millones de activos SVG con anotaciones, que incluye subconjuntos como MMSVG-Icon y MMSVG-Illustration.

La innovación principal es el uso de un VLM preentrenado como generador de SVG de extremo a extremo, lo que permite unificar text-to-SVG e image-to-SVG en un mismo modelo y aprovechar el conocimiento visual y lingüístico del modelo base. El autor no detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación (especulativa, atención lineal) más allá de la herencia del modelo base.

## Capacidades

- Generación de SVG a partir de texto (text-to-SVG): produce código vectorial a partir de una descripción en lenguaje natural.
- Generación de SVG a partir de imagen (image-to-SVG): convierte una imagen rasterizada en gráficos vectoriales editables.
- Generación de SVG de complejidad variable: desde iconos monocromos hasta ilustraciones detalladas y personajes de anime.
- Comprensión visual: al derivar de Qwen2.5-VL, conserva capacidades de percepción de imagen.
- Soporte multilingüe limitado a inglés y chino.
- Salida en formato SVG renderizable con CairoSVG.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Vectorización de logotipos e iconos: a partir de un PNG o JPG, el modelo genera un SVG editable, útil para equipos de diseño que necesitan activos escalables sin redibujar manualmente.
- Generación de iconografía para interfaces: dado un prompt de texto ("icono de carrito de compra, estilo lineal"), se obtiene un SVG listo para integrar en sistemas de diseño y librerías de componentes.
- Creación de ilustraciones vectoriales para web: permite producir gráficos ligeros y escalables para páginas y aplicaciones, reduciendo el peso frente a imágenes raster.
- Automatización de pipelines de diseño: integrado en flujos que convierten lotes de imágenes en SVG mediante el script de inferencia (`inference.py --task_type image-to-svg`).
- Prototipado rápido de assets gráficos: con un demo Gradio local (`app.py`) o el Space público, se pueden generar y revisar SVGs de forma interactiva antes de producción.
- Generación de personajes y arte vectorial: el modelo está entrenado para ilustraciones complejas, incluyendo personajes de anime, útil en entornos creativos y de animación.
- Conversión de bocetos a vectores: a partir de un dibujo rasterizado se obtiene una representación SVG editable para retoque posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del autor incluye únicamente métricas de inferencia:

| Tokens generados | Tiempo por muestra (OmniSVG-3B) |
|---|---|
| 256 | 4,08 s |
| 512 | 8,68 s |
| 1024 | 18,07 s |
| 2048 | 37,51 s |
| 4096 | 82,70 s |

Consumo de VRAM medido: 17 GB. El autor advierte que estos tiempos se miden por token SVG, mientras que los del paper se miden por token de código XML para comparación justa con baselines.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17 GB según la documentación del autor.
- GPU recomendadas: no se especifican modelos concretos; se ha probado con CUDA 12.1 y PyTorch 2.3.0.
- GPU de consumo: 17 GB de VRAM excede los 16 GB de una RTX 4090/4080, por lo que no cabe holgadamente en GPU de consumo de gama alta sin cuantización; no se documentan pesos cuantizados.
- Opciones de despliegue: script de inferencia propio (`inference.py`), demo Gradio (`app.py`) y Space de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de la sección de benchmarks (4,08 s para 256 tokens; 82,70 s para 4096 tokens).
- Dependencias del sistema: biblioteca Cairo (`libcairo2`) para CairoSVG.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniSVG-3B (esta ficha) | 3B | no disponible | text-to-SVG e image-to-SVG | Apache 2.0 | Hugging Face |
| StarVector | no disponible | no disponible | image-to-SVG | no disponible | citado como trabajo relacionado |
| LLM4SVG | no disponible | no disponible | text-to-SVG | no disponible | citado como trabajo relacionado |
| IconShop | no disponible | no disponible | iconos SVG (texto) | no disponible | citado como trabajo relacionado |

Los tres comparables se mencionan en la model card como trabajos altamente relacionados; no se dispone de sus especificaciones numéricas ni de resultados comparativos en la información proporcionada.

## Limitaciones y advertencias

- Esta réplica (meger999/OmniSVG) tiene 0 descargas y 0 likes; no es el repositorio oficial, que es OmniSVG/OmniSVG. Verificar procedencia antes de usar en producción.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada; la generación de SVGs muy complejos implica secuencias largas y latencias elevadas (82,70 s para 4096 tokens).
- Riesgo de alucinación: como modelo generativo, puede producir comandos SVG inválidos o geométricamente inconsistentes; se recomienda validación y renderizado de comprobación.
- Licencia del modelo Apache 2.0 permite uso comercial, pero el dataset MMSVG-2M está bajo CC-BY-NC-SA 4.0, lo que restringe usos comerciales de los datos y potencialmente de modelos derivados según interpretación.
- Consumo de 17 GB de VRAM limita el despliegue en GPU de consumo sin cuantización, y no se publican pesos cuantizados.
- No se documentan salvaguardas de sesgo ni evaluaciones de robustez; el modelo hereda los sesgos del modelo base Qwen2.5-VL.
- Requiere dependencias del sistema (Cairo) y una versión concreta de PyTorch/CUDA, lo que complica el despliegue reproducible.

## Enlaces

- Modelo en Hugging Face (esta réplica): https://huggingface.co/meger999/OmniSVG
- Modelo oficial: https://huggingface.co/OmniSVG/OmniSVG
- Organización en Hugging Face: https://huggingface.co/OmniSVG
- Paper (arXiv): https://arxiv.org/abs/2504.06263
- Página del proyecto: https://omnisvg.github.io/
- Repositorio GitHub: https://github.com/OmniSVG/OmniSVG
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OmniSVG/OmniSVG
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
