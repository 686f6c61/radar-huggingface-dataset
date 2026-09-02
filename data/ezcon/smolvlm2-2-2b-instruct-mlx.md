# EZCon/SmolVLM2-2.2B-Instruct-mlx

## Resumen

EZCon/SmolVLM2-2.2B-Instruct-mlx es una conversión al formato MLX del modelo multimodal SmolVLM2-2.2B-Instruct, desarrollado originalmente por Hugging Face. Esta versión, creada por EZCon, mantiene los pesos y la arquitectura del modelo base, pero los adapta para su ejecución eficiente en dispositivos con Apple Silicon (chips M1, M2, M3 y M4) mediante la librería mlx-vlm. El modelo es un vision-language model (VLM) compacto de 2,2 mil millones de parámetros, capaz de procesar imágenes y vídeo junto con texto, y está pensado para tareas de descripción, respuesta a preguntas visuales y comprensión de documentos.

La relevancia de esta conversión radica en que permite a desarrolladores e investigadores ejecutar un VLM de última generación en hardware de Apple sin necesidad de GPUs dedicadas, aprovechando la memoria unificada de los chips M-series. Al estar licenciado bajo Apache 2.0, es totalmente libre para uso comercial y de investigación. El modelo base fue entrenado con una amplia combinación de datasets de imagen, vídeo y texto, lo que le confiere capacidades robustas en tareas multimodales, aunque su ventana de contexto es limitada (8.192 tokens según el modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con codificador de vision SigLIP y decoder SmolLM2 (modelo base SmolVLM2-2.2B-Instruct) |
| Parametros totales | 2.246.784.880 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base SmolVLM2-2.2B-Instruct tiene una ventana de 8.192 tokens segun fuentes externas |
| Tipos de cuantizacion | No especificado; al ser formato MLX, se puede cuantizar con mlx-vlm (p. ej. 4 bits, 8 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Este modelo es una conversión directa a MLX del modelo HuggingFaceTB/SmolVLM2-2.2B-Instruct, realizada con mlx-vlm versión 0.6.17. No se ha realizado ningún entrenamiento adicional; los pesos son idénticos a los del modelo original. La arquitectura subyacente corresponde a SmolVLM2, un VLM compacto que combina un codificador de visión (basado en SigLIP) con un modelo de lenguaje (SmolLM2) de 2,2 mil millones de parámetros. El modelo base fue entrenado con una mezcla de datasets multimodales, incluyendo HuggingFaceM4/the_cauldron, HuggingFaceM4/Docmatix, LLaVA-OneVision-Data, M4-Instruct-Data, y varios datasets de vídeo como finevideo, LLaVA-Video-178K, Video-STaR, Vript, VISTA-400K, MovieChat-1K_train y ShareGPT4Video. Esta diversidad de datos le permite manejar tanto imágenes estáticas como secuencias de vídeo, aunque la ventana de contexto es relativamente corta.

## Capacidades

- Generacion de descripciones de imagenes y respuestas a preguntas visuales (VQA).
- Comprension de documentos y OCR (reconocimiento de texto en imagenes).
- Procesamiento de video: puede analizar secuencias de video y responder preguntas sobre su contenido.
- Razonamiento multimodal basico: combina informacion visual y textual para tareas de inferencia.
- Soporte de conversacion multimodal multi-turno (chat con imagenes).
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en ingles, aunque puede generalizar a otros idiomas en menor medida.

## Casos de uso

- **Descripcion automatica de imagenes para accesibilidad**: el modelo puede generar texto alternativo para imagenes en sitios web o aplicaciones, ayudando a personas con discapacidad visual. Su tamano reducido permite ejecutarlo localmente en un Mac sin conexion a internet.
- **Extraccion de informacion de documentos escaneados**: gracias a su capacidad de OCR y comprension de documentos, puede convertir facturas, formularios o articulos en texto estructurado, integrandose en flujos de trabajo de automatizacion de oficina.
- **Moderacion de contenido visual**: puede analizar imagenes y video para detectar contenido inapropiado o sensible, generando alertas o descripciones para revisores humanos. Su licencia Apache 2.0 facilita su integracion en productos comerciales.
- **Asistente de soporte tecnico con capturas de pantalla**: un chatbot puede recibir capturas de pantalla de errores o problemas y generar explicaciones o pasos de solucion, mejorando la atencion al cliente en entornos de TI.
- **Generacion de subtitulos para video**: el modelo puede procesar clips de video y generar subtitulos descriptivos o dialogos, util para herramientas de edicion de video o plataformas de contenido.
- **Analisis de imagenes medicas (nivel basico)**: aunque no es un modelo especializado, puede ayudar a describir radiografias o fotografias clinicas para documentacion o triage inicial, siempre bajo supervision profesional.
- **Prototipado rapido de aplicaciones de vision por computador**: los desarrolladores pueden usar este modelo en entornos de desarrollo en Mac para validar ideas de productos que requieran comprension de imagenes, sin necesidad de infraestructura GPU costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Esta conversion a MLX no incluye metricas propias; los resultados del modelo base SmolVLM2-2.2B-Instruct estan disponibles en la documentacion oficial de Hugging Face, pero no se han reproducido aqui por falta de datos concretos en la ficha.

## Requisitos de hardware

- **Plataforma**: Apple Silicon (M1, M1 Pro/Max, M2, M3, M4 o posteriores). No compatible con Macs Intel.
- **Memoria unificada**: se recomienda al menos 8 GB de RAM para cargar el modelo en precision completa (4.5 GB de pesos). Con cuantizacion a 4 bits, el uso de memoria puede reducirse a aproximadamente 1.5-2 GB, permitiendo su ejecucion en Macs con 8 GB de RAM.
- **GPU**: no requiere GPU dedicada; utiliza la GPU integrada del chip Apple Silicon a traves de Metal.
- **Opciones de despliegue**: se puede usar con la libreria mlx-vlm (pip install mlx-vlm) y ejecutar mediante el comando `python -m mlx_vlm.generate`. Tambien es compatible con otros frameworks que soporten MLX, como mlx-lm.
- **Latencia y throughput**: no se dispone de datos medidos. En un MacBook Pro con chip M2, se espera una generacion de texto de aproximadamente 10-20 tokens por segundo en precision FP16, y mayor velocidad con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EZCon/SmolVLM2-2.2B-Instruct-mlx | 2.2B | 8k (base) | Apache 2.0 | MLX | Optimizado para Apple Silicon |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2.2B | 8k | Apache 2.0 | safetensors (PyTorch) | Modelo original, requiere GPU CUDA |
| LLaVA-1.5-7B | 7B | 2k | Apache 2.0 | PyTorch | Modelo VLM mas grande, requiere mas VRAM |
| Phi-3-vision-128k | 4.2B | 128k | MIT | PyTorch | Contexto mucho mayor, pero mayor tamano |

La comparativa se basa en datos publicos de los modelos base; no se han encontrado benchmarks especificos para la version MLX.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo entrenado con datos web, puede presentar sesgos sociales y generar descripciones inexactas o inventadas, especialmente en imagenes ambiguas o de baja calidad.
- **Ventana de contexto limitada**: con 8.192 tokens, no es adecuado para analizar videos largos o documentos extensos en una sola pasada.
- **Idioma**: el modelo esta optimizado para ingles; su rendimiento en otros idiomas es significativamente inferior.
- **Rendimiento en video**: aunque soporta video, la capacidad de razonamiento temporal es limitada y puede fallar en secuencias complejas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones, pero no ofrece garantias ni soporte oficial.
- **Dependencia de hardware**: al ser formato MLX, solo funciona en Apple Silicon; no es portable a otros entornos sin conversion adicional.
- **Seguridad**: como cualquier modelo generativo, puede producir contenido ofensivo o inapropiado si se le solicita; se recomienda implementar filtros de salida en produccion.

## Enlaces

- [Modelo en Hugging Face (EZCon/SmolVLM2-2.2B-Instruct-mlx)](https://huggingface.co/EZCon/SmolVLM2-2.2B-Instruct-mlx)
- [Modelo base HuggingFaceTB/SmolVLM2-2.2B-Instruct](https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct)
- [Ficha de especificaciones en BestLLMfor](https://bestllmfor.com/catalog/smolvlm2-22b/)
- [Repositorio smollm en GitHub (vision/smolvlm2)](https://github.com/huggingface/smollm/tree/main/vision/smolvlm2)
