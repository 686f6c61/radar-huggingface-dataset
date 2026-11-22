# Infinity-io/s2-pro-gguf

## Resumen

S2 Pro GGUF es la versión cuantizada en formato GGUF del modelo de síntesis de voz Fish Audio S2 Pro, un sistema de text-to-speech multilingüe con capacidad de clonación de voz. Lo desarrolla el usuario Infinity-io a partir del modelo base fishaudio/s2-pro, y su propósito es permitir la inferencia local del TTS sin dependencia de Python, mediante el motor s2.cpp, una implementación en C++/GGML construida por la comunidad. El paquete incluye tanto los pesos del transformer como el códec de audio en un único fichero GGUF por cuantización, lo que simplifica el despliegue.

El modelo subyacente emplea una arquitectura Dual-AR de aproximadamente 4.560 millones de parámetros: un transformer lento (Slow-AR) de 36 capas basado en Qwen3 con 4.130 millones de parámetros, un transformer rápido (Fast-AR) de 4 capas con 420 millones de parámetros que genera 10 tokens acústicos por paso semántico, y un códec de audio convolucional RVQ con 10 codebooks de 4.096 entradas. El recuento real de parámetros en safetensors asciende a 4.953.250.801.

Su relevancia actual radica en que ofrece un TTS multilingüe con clonación de voz ejecutable en hardware de consumo (desde GPUs con 8 GB de VRAM hasta CPU), algo poco habitual en modelos de esta calidad. No obstante, el propio autor lo marca como ALPHA experimental y no apto para producción, y la licencia Fish Audio Research License restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-AR: Slow-AR (transformer Qwen3 de 36 capas, GQA 32 cabezas / 8 KV, RoPE base 1M, KV cache persistente) + Fast-AR (transformer de 4 capas) + codec de audio convolucional RVQ (10 codebooks x 4096 entradas) |
| Parametros totales | 4.953.250.801 (recuento safetensors); ~4,56B segun model card (Slow-AR 4,13B + Fast-AR 0,42B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K, Q2_K (GGUF) |
| Idiomas soportados | Multilingue (idiomas concretos no especificados) |
| Licencia | Fish Audio Research License (gratuita para investigacion y uso no comercial; uso comercial requiere licencia separada de Fish Audio) |
| Formato de pesos | GGUF (pesos del transformer y codec de audio en un unico fichero); tokenizer.json aparte |

## Arquitectura y entrenamiento

El modelo base S2 Pro emplea una arquitectura Dual-AR orientada a la síntesis de voz. El componente Slow-AR es un transformer de 36 capas derivado de Qwen3 con 4.130 millones de parámetros, que usa Grouped Query Attention con 32 cabezas de atención y 8 cabezas KV, RoPE con base 1M y una caché KV persistente. El componente Fast-AR es un transformer de 4 capas y 420 millones de parámetros que genera 10 tokens de codebook acústico por cada paso semántico del Slow-AR. La parte de audio la aporta un códec convolucional RVQ con 10 codebooks de 4.096 entradas cada uno, que actúa como encoder y decoder de la señal de voz.

Los ficheros GGUF de este repositorio se han recuantizado con una versión modificada de la herramienta `llama-quantize` con rutinas de cuantización mejoradas, según indica la model card. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable en este paquete es el empaquetado conjunto de pesos y codec en un solo GGUF y la posibilidad de inferencia puramente en C++/GGML mediante s2.cpp, con soporte de Vulkan para GPUs AMD, NVIDIA e Intel.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe de alta calidad a partir de texto.
- Clonación de voz zero-shot mediante audio de referencia de 5 a 30 segundos y su transcripción.
- Generación de audio en formato WAV como salida.
- Inferencia local sin dependencia de Python, mediante el motor C++/GGML s2.cpp.
- Aceleración por GPU vía Vulkan (AMD, NVIDIA, Intel) o ejecución en CPU.
- Empaquetado autocontenido: pesos del transformer y codec de audio en un único fichero GGUF.
- Soporte de múltiples niveles de cuantización para ajustar calidad y consumo de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; es un modelo exclusivamente de audio.

## Casos de uso

- Generación de audiolibros y narración: el modelo sintetiza texto largo en voz con una calidad alta y permite fijar una voz concreta mediante clonación, manteniendo consistencia entre capítulos.
- Doblaje y localización de contenido: al ser multilingüe y permitir clonación, se puede reutilizar una voz de referencia para generar versiones en otros idiomas del mismo contenido.
- Prototipado de asistentes de voz: con cuantizaciones Q4_K_M o Q3_K se puede ejecutar en GPUs de consumo para iterar rápidamente en el diseño de interfaces conversacionales.
- Accesibilidad: conversión de texto a voz personalizada para usuarios que necesiten una voz sintética concreta, clonada a partir de muestras de referencia.
- Generación de voces para videojuegos y prototipos multimedia: creación de voces de personajes mediante clonación a partir de grabaciones cortas, sin depender de servicios en la nube.
- Investigación en TTS: el formato GGUF y el motor s2.cpp permiten experimentar con cuantizaciones y medir el impacto en calidad sin infraestructura Python.
- Pruebas de integración en pipelines locales: despliegue en entornos con CPU o GPU modesta (menos de 8 GB de VRAM) para evaluar viabilidad antes de contratar licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (guía del autor): Q8_0 requiere 8 GB o más; Q6_K entre 6 y 8 GB; Q5_K_M entre 4 y 6 GB; Q4_K_M entre 3 y 4 GB; Q3_K y Q2_K por debajo de 3 GB (con degradación de calidad).
- Tamaños de fichero: F16 9,3 GB; Q8_0 5,3 GB; Q6_K 4,3 GB; Q5_K_M 3,8 GB; Q4_K_M 3,4 GB; Q3_K 2,9 GB; Q2_K 2,4 GB; tokenizer.json 12 MB.
- GPU recomendadas: cualquier GPU con soporte Vulkan (NVIDIA, AMD o Intel). No se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Compatibilidad con GPU de consumo: sí; con 8 GB de VRAM se puede usar Q8_0, y con 4-6 GB las cuantizaciones Q5_K_M o Q4_K_M.
- Ejecución solo en CPU: posible con Q4_K_M o inferior, aunque lenta según el autor.
- Opciones de despliegue: exclusivamente s2.cpp (compilado desde fuente con C++17 y CMake, opción `-DS2_VULKAN=ON`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| S2 Pro GGUF (este) | ~4,56B (4.953.250.801 en safetensors) | No disponible | Multilingüe | Fish Audio Research License (no comercial sin licencia) | GGUF + s2.cpp |
| fishaudio/s2-pro (base) | ~4,56B | No disponible | Multilingüe | Fish Audio Research License | Pesos originales (formato no detallado) |
| Alternativas TTS open source | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado ALPHA experimental: el motor s2.cpp es un proyecto comunitario en fase temprana, con cambios incompatibles previsibles y no apto para producción según el propio autor.
- Licencia restrictiva: la Fish Audio Research License permite uso gratuito solo para investigación y fines no comerciales; el uso comercial exige una licencia escrita separada de Fish Audio (business@fish.audio).
- Calidad degradada en cuantizaciones bajas: Q3_K y Q2_K, pensadas para menos de 3 GB de VRAM, pierden calidad según la guía del autor.
- Clonación de voz: requiere audio de referencia limpio de 5 a 30 segundos y su transcripción; la calidad depende de la grabación.
- Riesgo de uso indebido: la clonación de voz puede emplearse para suplantación o desinformación; no se documentan salvaguardas técnicas en la información disponible.
- Idiomas concretos no especificados: la model card solo indica "multilingual" sin listar los idiomas soportados ni su calidad relativa.
- Sin datos de sesgos, alucinación o robustez: no se han publicado evaluaciones de sesgos ni métricas de calidad objetivas.
- Dependencia de compilación manual: el despliegue exige compilar s2.cpp desde fuente con CMake y C++17, lo que añade fricción operativa.
- Contexto no documentado: se desconoce la longitud máxima de texto que puede sintetizar en una sola pasada.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Infinity-io/s2-pro-gguf
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Repositorio del motor s2.cpp: https://github.com/rodrigomatta/s2.cpp
- Licencia (LICENSE.md): https://huggingface.co/rodrigomt/s2-pro-gguf/blob/main/LICENSE.md
- Sitio de Fish Audio: https://fish.audio
- Contacto comercial: business@fish.audio
