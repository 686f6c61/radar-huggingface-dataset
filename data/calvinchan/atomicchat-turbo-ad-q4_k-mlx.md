# calvinchan/AtomicChat-Turbo-AD-Q4_K-MLX

## Resumen

AtomicChat-Turbo-AD-Q4_K-MLX es un paquete experimental de generación y edición de imágenes publicado por el usuario calvinchan en Hugging Face, orientado al runtime MLX-Serve de Apple. No se trata de un modelo entrenado desde cero, sino de un ensamblaje híbrido: el codificador de texto procede de AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF (en formato GGUF, con sus capas lineales recodificadas como pesos afines de 8 bits en MLX), mientras que el resto del pipeline (VAE y transformer de difusión) proviene del pack de ddalcu Qwen-Image-2.1-Turbo-MLX-Serve-8bit, a su vez derivado del modelo oficial Qwen/Qwen-Image-2.1-Turbo.

El modelo resuelve dos tareas concretas dentro del ecosistema MLX: text-to-image e image-to-image (edición con imagen de referencia). Su relevancia es acotada pero específica: permite ejecutar un pipeline de difusión Qwen 2.1 Turbo cuantizado en hardware Apple Silicon mediante MLX-Serve, algo que los formatos GGUF o safetensors convencionales no cubren de forma nativa en ese runtime.

El repositorio ocupa 17,7 GB y se distribuye bajo la licencia Qwen Research, lo que restringe el uso a investigación y evaluación no comercial. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y sin model card extensa más allá de la nota de atribución y cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión (text-to-image / image-to-image) con codificador de texto tipo Qwen Image 2.1 Turbo; pesos en MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K en el codificador de texto original (GGUF), recodificado a pesos afines de 8 bits en MLX; el resto del pipeline en 8 bits (pack MLX-Serve) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiqueta `license: other`); componente AtomicChat bajo Apache 2.0 |
| Formato de pesos | safetensors en MLX (repo con `mlx-serve`, `diffusers`, `safetensors`) |

## Arquitectura y entrenamiento

El paquete no documenta un entrenamiento propio. Se compone de dos piezas: un codificador de texto derivado de AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF, cuyos pesos GGUF se decodificaron y cuyas capas lineales se reempaquetaron como pesos afines de 8 bits para MLX; y el resto del pipeline (componentes de difusión) tomado del pack de ddalcu Qwen-Image-2.1-Turbo-MLX-Serve-8bit, basado en Qwen Image 2.1 Turbo. La innovación técnica reseñable es precisamente ese reempaquetado de cuantización GGUF Q4_K a afín 8-bit MLX para hacer viable el pipeline en el runtime MLX-Serve.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO. La model card únicamente indica que es un pack experimental y remite a NOTICE para atribución y cambios.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline Qwen Image 2.1 Turbo.
- Edición de imágenes con referencia (image-to-image), según la etiqueta `image-to-image` del repo.
- Ejecución en el runtime MLX-Serve sobre Apple Silicon, con pesos en formato MLX safetensors.
- Codificador de texto recodificado a 8 bits afín para MLX a partir de pesos GGUF Q4_K.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá del propio pipeline de imagen.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de generación de imágenes en Mac con Apple Silicon: el pack está pensado para MLX-Serve, de modo que permite probar Qwen Image 2.1 Turbo en hardware Apple sin depender de CUDA.
- Edición con imagen de referencia en flujos de investigación: la variante image-to-image sirve para experimentar con modificación de imágenes guiada por prompt en entornos de evaluación.
- Evaluación comparativa de cuantizaciones: útil para medir el impacto del reempaquetado Q4_K GGUF a afín 8-bit MLX frente a otras variantes del mismo pipeline.
- Investigación sobre pipelines de difusión cuantizados: sirve como banco de pruebas para estudiar calidad y latencia en 8 bits dentro de MLX.
- Reproducción de experimentos académicos con Qwen Image 2.1 Turbo: al estar bajo licencia Qwen Research, encaja en entornos de laboratorio y evaluación no comercial.
- Integración en herramientas locales de creación de imágenes para desarrolladores que ya trabajan con MLX-Serve y quieren añadir un pipeline text-to-image sin salir del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 17,7 GB, por lo que se requiere espacio en disco y memoria unificada del orden de esa cifra o superior para cargar el pack completo en 8 bits.
- GPU recomendadas: el runtime es MLX-Serve, orientado a Apple Silicon (memoria unificada); no se documentan GPU NVIDIA.
- Cabe en consumer GPU: no aplica en el sentido habitual; está pensado para equipos Apple con memoria unificada suficiente para alojar los 17,7 GB del pack.
- Opciones de despliegue: MLX-Serve (librería declarada `mlx-serve`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| calvinchan/AtomicChat-Turbo-AD-Q4_K-MLX | Pipeline de difusión híbrido para MLX-Serve | safetensors MLX | qwen-research | Hugging Face, 0 descargas |
| ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-8bit | Pack MLX-Serve base (8 bits) | MLX | no disponible en la información | Hugging Face |
| AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF | Codificador GGUF Q4_K | GGUF | Apache 2.0 (componente) | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo | Modelo oficial base | no disponible | Qwen Research | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Licencia Qwen Research: uso restringido a investigación y evaluación no comercial; el uso comercial del pack completo no está permitido.
- Es un artefacto experimental, sin benchmarks publicados ni métricas de calidad documentadas.
- El codificador de texto deriva de una variante "Uncensored", lo que puede implicar menor filtrado de contenidos sensibles y riesgos de sesgo o salidas inapropiadas.
- Riesgo de alucinación visual y de artefactos propios de pipelines de difusión cuantizados en 8 bits; no hay evaluación publicada.
- Dependencia estricta del runtime MLX-Serve y de hardware Apple Silicon; no es portable a otros stacks sin conversión.
- Sin información sobre idiomas soportados, sesgos conocidos ni limitaciones de contexto.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de uso en producción.
- El repositorio mezcla componentes con licencias distintas (Qwen Research y Apache 2.0); conviene revisar NOTICE y LICENSE-APACHE-2.0 antes de redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/calvinchan/AtomicChat-Turbo-AD-Q4_K-MLX
- Modelo base (pack MLX-Serve 8 bits): https://huggingface.co/ddalcu/Qwen-Image-2.1-Turbo-MLX-Serve-8bit
- Modelo base (codificador GGUF): https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo oficial: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia: LICENSE (en el repositorio)
- Atribución y cambios: NOTICE (en el repositorio)
- Licencia del componente AtomicChat: LICENSE-APACHE-2.0 (en el repositorio)
