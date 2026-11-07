# netprojects/Cosmos3-Edge-mlx-8bit

## Resumen

Cosmos3-Edge-mlx-8bit es una conversión a formato MLX del razonador multimodal de NVIDIA Cosmos3-Edge, publicada por NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon. El modelo original forma parte de la familia Cosmos3 de NVIDIA, orientada a IA física y generación de vídeo, y esta conversión conserva únicamente la parte de razonamiento vision-lenguaje-vídeo, descartando los tensores del generador de vídeo. El resultado es un modelo de 2.435.616.496 parámetros (aproximadamente 2,44 mil millones en el checkpoint convertido) que acepta texto, imágenes y vídeo, y responde en texto con modo de razonamiento opcional.

La conversión cuantiza el modelo de lenguaje a 8 bits (afín, grupo 64) y mantiene la torre de visión SigLIP2 y el proyector en bf16, dando un peso total de 3,1 GB. La model card reporta una paridad del 98,4% en el siguiente token respecto a la implementación de referencia de NVIDIA en transformers (bf16, CPU), con una divergencia media KL de 0,002 sobre los 64 tokens más probables. Es relevante porque permite ejecutar localmente en un Mac un razonador multimodal con ventana de contexto larga (se documentan pruebas hasta 32K tokens) sin depender de GPU NVIDIA ni de servicios en la nube.

La licencia es OpenMDW-1.1, la misma que el modelo base de NVIDIA, e incluye los documentos de sesgos, explicabilidad, privacidad y seguridad del original sin modificar. El autor declara explícitamente no estar afiliado a NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (razonador) con torre de visión SigLIP2; 28 capas, hidden 2048, 16 cabezas de consulta / 8 de clave-valor, MLP ReLU², vocabulario 131.072 |
| Parámetros totales | 2.435.616.496 (checkpoint convertido, solo razonador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada formalmente; se documentan pruebas con prompts de 16K y 32K tokens |
| Tipos de cuantización | 8 bits afín con grupo 64 para el LM; visión y proyector en bf16; existe variante de 6 bits |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 28 capas con dimensión oculta 2048, 16 cabezas de consulta y 8 de clave-valor, MLP con activación ReLU al cuadrado y vocabulario de 131.072 tokens. Usa M-RoPE 3D intercalado con secciones 24/20/20 y theta de 1e8, siguiendo la implementación de NVIDIA. La torre de visión es de estilo SigLIP2, con 27 capas y parches de 16 píxeles a resolución nativa; la rejilla posicional aprendida de 16×16 se redimensiona por imagen o fotograma con el mismo filtro bilineal antialias que el original, y la atención queda confinada dentro de cada imagen o fotograma. Un fusionador de parches 2×2 proyecta las características visuales al modelo de lenguaje.

Para vídeo, los fotogramas se codifican uno a uno con las marcas de tiempo de NVIDIA entre ellos y las posiciones siguen su función `get_rope_index`. El preprocesamiento de entrada utiliza el procesador original de NVIDIA en transformers 5.22.2 o superior, de modo que el redimensionado de imágenes, el muestreo de fotogramas y las marcas de tiempo coinciden con el modelo de referencia. Los vídeos se decodifican con PyAV. No se dispone de información sobre el volumen o la composición del dataset de entrenamiento, ni sobre si se aplicaron etapas de RLHF o DPO; la model card de esta conversión no los detalla y remite al modelo base.

## Capacidades

- Generación de texto con razonamiento opcional: el modo de pensamiento está activado por defecto, como en la plantilla de chat de NVIDIA, y puede desactivarse con `--no-think` o `enable_thinking: false`.
- Comprensión de imágenes a resolución nativa, incluyendo múltiples imágenes en un mismo prompt.
- Comprensión de vídeo con muestreo de fotogramas configurable (por ejemplo, `--fps 4`) y marcas de tiempo entre fotogramas.
- Respuesta en texto a partir de entradas image-text-to-text y vídeo-texto.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) que acepta partes de texto, `image_url` y `video_url`, con streaming.
- Exposición del texto de razonamiento en el campo `reasoning_content` del servidor.
- Capacidad de contexto largo: pruebas de aguja en pajar hasta 8K tokens con respuesta idéntica a la referencia de NVIDIA, y a 16K el port encuentra la aguja en los mismos prompts o más.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo acepta una imagen y un prompt de texto y devuelve una descripción o respuesta; adecuado para prototipos de visión por computador en un Mac sin GPU dedicada, dado su peso de 3,1 GB.
- Análisis de vídeo con marcas de tiempo: se pueden muestrear fotogramas a una tasa configurable y preguntar qué ocurre en el clip, lo que sirve para indexación o resumen de vídeo en estaciones de trabajo Apple Silicon.
- Razonamiento visual con cadena de pensamiento: al estar el modo thinking activado por defecto, es útil para tareas que requieren descomposición explícita, como responder preguntas sobre diagramas o escenas complejas.
- Servicio local compatible con OpenAI: el servidor incluido permite integrar el modelo en aplicaciones existentes que ya hablan el protocolo de chat completions, con soporte de streaming y de contenido multimodal.
- Procesamiento de documentos con contexto largo: con prompts de 16K a 32K tokens y un pico de memoria de 5,5 a 7,3 GB, puede manejar conversaciones o documentos extensos con imágenes intercaladas en un equipo de 24 GB o más.
- Evaluación y experimentación de investigación: la paridad del 98,4% con la referencia y las herramientas de conversión y paridad incluidas permiten reproducir resultados y comparar cuantizaciones de 6 y 8 bits sin acceso a hardware NVIDIA.
- Despliegue en edge con Apple Silicon: al ejecutarse sobre MLX con límites de memoria configurables (`COSMOS_CACHE_LIMIT_GB`, `COSMOS_MEMORY_LIMIT_GB`), encaja en flujos de trabajo de campo o de escritorio donde no se quiere enviar datos visuales a la nube.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos en un MacBook Pro M5 Max (128 GB) el 7 de noviembre de 2026, con thinking desactivado, decodificación greedy y puntuación de respuesta exacta. CV-Bench usa una muestra del 25% (cada cuarto ítem).

| Build | Tamaño | Mismo siguiente token que la referencia de NVIDIA | RealWorldQA (765) | CV-Bench (muestra 25%) |
|---|---|---|---|---|
| mlx-8bit (este) | 3,1 GB | 98,4% | 69,2 | 87,0 |
| mlx-6bit | 2,6 GB | 97,7% | 68,6 | 87,3 |
| bf16 (pesos originales, mismo código) | 4,9 GB | 98,7% | 68,9 | 87,2 |
| Puntuaciones publicadas por NVIDIA | — | — | 70,5 | 85,3 (conjunto completo) |

La paridad se midió sobre 19 prompts (texto, una y varias imágenes, vídeo) con 48 tokens forzados por profesor; la KL media sobre los 64 tokens más probables es de 0,002 para 8 bits y 0,007 para 6 bits. El autor advierte que los ajustes de evaluación de NVIDIA no están publicados, por lo que las puntuaciones muestran que el port se comporta como el modelo, no que reproduzca la configuración de NVIDIA.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,1 GB de pesos en 8 bits; pico de 5,5 GB con un prompt de 16K tokens y de 7,3 GB con uno de 32K.
- Límites configurables: `COSMOS_MEMORY_LIMIT_GB` (por defecto 24) y caché de buffers MLX limitada con `COSMOS_CACHE_LIMIT_GB` (por defecto 2), vaciada tras cada petición.
- GPU recomendadas: hardware Apple Silicon; las mediciones se hicieron en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Compatibilidad con GPU de consumo: está diseñado para Apple Silicon vía MLX; no se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Opciones de despliegue: el repositorio `internet-projects/cosmos3-edge-mlx` incluye un generador de línea de comandos y un servidor compatible con OpenAI con streaming; requiere Python 3.12 y el procesador de transformers 5.22.2 o superior.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RealWorldQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-mlx-8bit (este) | 2,44 B (razonador) | pruebas hasta 32K | 69,2 | OpenMDW-1.1 | Hugging Face, MLX |
| Cosmos3-Edge-mlx-6bit | 2,44 B (razonador) | pruebas hasta 32K | 68,6 | OpenMDW-1.1 | Hugging Face, MLX |
| Cosmos3-Edge bf16 (original, mismo código) | 2,44 B (razonador) | pruebas hasta 32K | 68,9 | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge (referencia NVIDIA) | 3,9 B según fuente externa | no disponible | 70,5 | OpenMDW-1.1 | Hugging Face |

La cifra de 3,9B para el modelo de NVIDIA proviene de una fuente externa (theapplied.co) y no coincide con los 2,44B del checkpoint convertido, que solo incluye el razonador. No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo razonador: el checkpoint original de Cosmos3-Edge incluye también un generador de vídeo cuyos tensores no forman parte de esta conversión; no se puede usar para generar vídeo.
- No afiliado a NVIDIA: la conversión la publica NetProjects y no cuenta con respaldo oficial de NVIDIA.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a los modelos generativos; la model card incluye los documentos `BIAS.md`, `SAFETY.md` y `EXPLAINABILITY.md` de NVIDIA sin modificar.
- Sesgos: se remite a la documentación de sesgos de NVIDIA incluida en el repositorio; no se detallan en la model card de la conversión.
- Licencia OpenMDW-1.1: es una licencia con condiciones específicas; debe revisarse antes de uso comercial, ya que la model card solo indica el nombre y el enlace.
- Contexto: no hay una longitud máxima oficial publicada; las pruebas documentadas llegan a 32K tokens, pero no se garantiza un comportamiento correcto más allá.
- Precisión: la cuantización a 8 bits introduce una divergencia del 1,6% en el siguiente token respecto a la referencia bf16; en tareas sensibles a la precisión exacta conviene validar contra el modelo original.
- Dependencia de ecosistema: requiere MLX, Apple Silicon y transformers 5.22.2 o superior; no es portable a otros backends sin conversión adicional.
- Paridad de benchmarks: las puntuaciones no reproducen la configuración de evaluación de NVIDIA, que no está publicada, por lo que no son directamente comparables con las cifras oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Cosmos3-Edge-mlx-8bit
- Variante de 6 bits: https://huggingface.co/netprojects/Cosmos3-Edge-mlx-6bit
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Repositorio del port: https://github.com/internet-projects/cosmos3-edge-mlx
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Documentación de TensorRT Edge-LLM sobre Cosmos3: https://nvidia.github.io/TensorRT-Edge-LLM/developer_guide/models/cosmos3.html
- Ficha de Cosmos3-Edge en The Applied: https://theapplied.co/models/nvidia-cosmos3-edge
- NetProjects: https://netprojects.com
