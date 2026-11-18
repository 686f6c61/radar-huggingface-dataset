# AtomicChat/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B-GGUF es la distribución en formato GGUF del modelo multimodal Ornith-1.5-9B, desarrollado originalmente por ornith-ai y cuantizado por AtomicChat con una matriz de importancia propia (imatrix) calibrada específicamente para este modelo. El modelo base es un transformer denso de 8.953.803.264 parámetros (aproximadamente 9B) con capacidad de procesamiento de imagen y texto, orientado a tareas conversacionales y de codificación agéntica. La relevancia de esta ficha radica en que AtomicChat no se limita a publicar los presets estándar de llama.cpp, sino que mide la divergencia KL frente a la referencia BF16 y publica los registros de evaluación, lo que permite elegir el archivo con criterio cuantitativo y no por intuición.

El repositorio incluye 14 archivos de pesos más un proyector de visión independiente (mmproj) de 0,92 GB. La licencia es MIT, lo que facilita el uso comercial sin restricciones adicionales, y el pipeline declarado es image-text-to-text. El tamaño total del repositorio es de 92,7 GB, aunque cada archivo individual ocupa entre 2,81 GB y 17,9 GB según el nivel de cuantización.

El punto diferencial del trabajo de AtomicChat es la publicación de métricas de fidelidad por archivo: divergencia KL media y acuerdo top-1 frente a la referencia BF16 sobre el corpus held-out `eval_neutral` con contexto de 4096 tokens. Esto convierte al repositorio en una referencia útil para decidir qué cuantización desplegar en función de la VRAM disponible, con datos medidos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión), no disponible el detalle exacto de capas y atención |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; las mediciones de cuantización se realizaron a 4096 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ3_S, IQ3_XXS, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, además de layouts propios AD (per-tensor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), más proyector de visión mmproj en F16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 9B parámetros con capacidad multimodal de entrada imagen-texto, según declara el pipeline `image-text-to-text` y la presencia del proyector `mmproj-Ornith-1.5-9B-F16.gguf` de 0,92 GB. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones arquitectónicas específicas como decodificación especulativa o atención lineal.

La contribución técnica documentada en esta ficha es el proceso de cuantización de AtomicChat. Se construyó una matriz de importancia propia a partir de un corpus de calibración público (`AtomicChat/calib-corpora`) y se generaron dos familias de archivos: los presets estándar de llama.cpp y los layouts `AD` con asignación de bits por tensor ajustada a este modelo concreto. La comparación entre ambas familias aísla el efecto del layout, ya que ambos se construyen con la misma imatrix. Las mediciones se realizaron con llama.cpp `b10505` sobre una única RTX 5090, con contexto de 4096 tokens y el corpus held-out `eval_neutral`.

El hallazgo principal del análisis es que el ajuste por tensor solo aporta ventajas en tipos base gruesos: por encima de seis bits los presets estándar ya son prácticamente sin pérdida y el layout ajustado no compensa. Por debajo de ese umbral, la mejora es sustancial: `AD-Q5_K-Q4_K` ocupa 5,93 GB con KLD 0,0255 frente a los 6,47 GB y KLD 0,0299 de `Q5_K_M` estándar, y `AD-Q4_K-IQ4_XS` logra 0,0344 frente a 0,0500 de `Q4_K_M` estándar a tamaño equivalente, una reducción de divergencia de aproximadamente un tercio.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado para el formato de chat de llama.cpp.
- Procesamiento de imágenes junto con texto (image-text-to-text) mediante el proyector mmproj en F16, que puede omitirse si solo se necesita texto.
- Codificación agéntica: la etiqueta `agentic-coding` del repositorio indica orientación a tareas de código con uso de herramientas, aunque no se detallan los formatos de tool calling soportados.
- Modo de razonamiento conmutable (thinking): la aplicación Atomic Chat ofrece toggles para activar o desactivar el modo thinking, lo que sugiere que el modelo base expone un modo de razonamiento extendido.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de endpoints de Hugging Face.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio, vídeo ni otras modalidades adicionales.

## Casos de uso

- Asistente de código en local sobre GPU de consumo: con el archivo `AD-Q5_K-Q4_K` (5,93 GB) el modelo cabe en una GPU de 8 GB junto con el proyector de visión y overhead de runtime, permitiendo autocompletado, explicación y refactorización de código sin enviar el código a un servicio externo. La licencia MIT elimina fricción para integrarlo en herramientas internas de desarrollo.
- Atención al cliente con contexto visual: gracias al pipeline image-text-to-text, el modelo puede recibir capturas de pantalla o fotos de producto junto con la consulta del usuario, lo que resulta útil en soporte técnico de software o en asistencia postventa donde el cliente adjunta una imagen del problema.
- Agente de automatización de tareas de desarrollo: la etiqueta `agentic-coding` y el modo thinking conmutable permiten usarlo en bucles de razonamiento multi-paso para resolver issues, generar parches o navegar repositorios, activando el modo thinking en tareas complejas y desactivándolo en respuestas rápidas para reducir latencia.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: los archivos de 3,38 GB y 2,81 GB permiten ejecución en CPU o en GPU integrada, aunque con la advertencia de que el acuerdo top-1 cae al 71,17 % y 53,74 % respectivamente, por lo que solo son adecuados para tareas tolerantes a error como borradores o clasificación aproximada.
- Procesamiento por lotes en servidor con vLLM o llama.cpp server: el archivo BF16 o Q8_0 en una GPU de 24 GB o más permite servir peticiones concurrentes con fidelidad prácticamente de referencia (97,94 % de acuerdo top-1 en Q8_0), adecuado para pipelines de generación de documentación técnica o resumen de informes.
- Evaluación comparativa de cuantizaciones en investigación: el repositorio publica los registros de evaluación y el corpus de calibración, lo que permite reproducir el análisis de divergencia KL y estudiar el impacto de layouts por tensor en modelos multimodales de 9B, un caso de estudio útil para quienes investigan compresión de modelos.
- Herramienta de accesibilidad o asistencia visual en local: el modelo puede describir imágenes y responder preguntas sobre ellas sin conexión a internet, lo que encaja en entornos con requisitos de privacidad estrictos como sanidad o administración pública, donde enviar imágenes a la nube no es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica son métricas de fidelidad de cuantización frente a la referencia BF16, medidas sobre el corpus held-out `eval_neutral` con contexto de 4096, una RTX 5090 y llama.cpp `b10505`:

| Archivo | Tamano | KLD media | Top-1 |
|---|---|---|---|
| BF16 | 17,9 GB | referencia | 100 % |
| Q8_0 | 9,53 GB | 0,002249 | 97,94 % |
| AD-Q8_0-Q6_K | 8,55 GB | 0,003473 | 97,46 % |
| Q6_K | 7,36 GB | 0,006045 | 96,54 % |
| Q5_K_M | 6,47 GB | 0,029883 | 92,80 % |
| AD-Q5_K-Q4_K | 5,93 GB | 0,025493 | 93,10 % |
| AD-Q4_K-IQ4_XS | 5,61 GB | 0,034426 | 91,93 % |
| AD-IQ4_XS | 5,52 GB | 0,037752 | 91,54 % |
| IQ4_XS | 5,20 GB | 0,044856 | 90,76 % |
| IQ3_M | 4,42 GB | 0,131672 | 84,18 % |
| AD-IQ3_S-IQ3_XXS | 4,29 GB | 0,144132 | 83,44 % |
| AD-IQ3_XXS-IQ2_S | 3,84 GB | 0,258554 | 77,98 % |
| AD-IQ2_S-IQ2_XS | 3,38 GB | 0,441580 | 71,17 % |
| AD-IQ2_XXS-IQ1_M | 2,81 GB | 1,122010 | 53,74 % |

## Requisitos de hardware

- VRAM estimada según el archivo elegido, incluyendo el proyector de visión de 0,9 GB y aproximadamente 1 GB de overhead de runtime a contexto de 8k: 24 GB o más para BF16, 16 GB para Q8_0, 12 GB para AD-Q8_0-Q6_K, 8 GB para AD-Q5_K-Q4_K o AD-Q4_K-IQ4_XS, 6 GB para AD-IQ3_S-IQ3_XXS y 4 GB para AD-IQ2_S-IQ2_XS en modo solo texto.
- GPU recomendadas: RTX 5090 (utilizada por el autor para las mediciones), A100 o H100 para BF16 y despliegue concurrente, RTX 4090 para Q8_0 y Q6_K, RTX 4080 o 4070 Ti para los archivos de 8 GB, y GPUs de 6-8 GB para las cuantizaciones intermedias.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB con AD-Q8_0-Q6_K hasta una RTX 4060 Ti de 8 GB con AD-Q5_K-Q4_K. Los archivos de 4 GB o menos permiten ejecución en CPU o GPU integrada, con la pérdida de calidad indicada en la tabla.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli) es el runtime de referencia y el usado en las mediciones; también es compatible con Ollama y con cualquier frontend que consuma GGUF. Para el modo multimodal hay que cargar el mmproj junto con el archivo de pesos. El formato GGUF no es compatible con vLLM ni TGI, que requieren safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Las mediciones publicadas son de divergencia KL, no de velocidad de generación.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento en tareas del modelo base ni de modelos comparables de la misma categoría, por lo que la comparación se limita a los parámetros estructurales conocidos:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este) | 8,95B | no disponible | MIT | GGUF + safetensors (base) | Multimodal imagen-texto, etiqueta agentic-coding, imatrix propia |
| Modelos densos de 8-9B de la competencia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se han identificado en la información disponible alternativas concretas con las que comparar parámetros, contexto, rendimiento y licencia de forma rigurosa, por lo que no se presentan cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Las cuantizaciones por debajo de 4 GB no son recomendables: AD-IQ2_S-IQ2_XS alcanza solo un 71,17 % de acuerdo top-1 y AD-IQ2_XXS-IQ1_M un 53,74 %, lo que según el propio autor equivale a «un modelo distinto» y no a una pérdida de calidad menor. Si un modelo de 9B no cabe en la VRAM disponible, es preferible usar un modelo más pequeño en mayor precisión.
- El ajuste de layout por tensor solo mejora los presets estándar en tipos base gruesos; por encima de seis bits no aporta y el repositorio distribuye presets estándar en esa franja.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación en la información proporcionada; deben evaluarse empíricamente antes de un despliegue en producción.
- La longitud máxima de contexto del modelo base no se especifica; las mediciones se hicieron a 4096 tokens y no hay garantía documentada de comportamiento más allá de esa ventana.
- El proyector de visión debe cargarse por separado (mmproj) y añade 0,92 GB al presupuesto de VRAM; si se omite, se pierde la capacidad multimodal.
- El formato GGUF limita el despliegue a llama.cpp y derivados; no es compatible con vLLM, TGI ni TensorRT-LLM, lo que puede ser un obstáculo en infraestructuras de servido de alto throughput.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base original enlazada en la model card por si hubiera condiciones adicionales no reflejadas en las etiquetas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Ornith-1.5-9B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Registros de evaluación: https://huggingface.co/datasets/AtomicChat/Ornith-1.5-9B-GGUF-metrics
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
