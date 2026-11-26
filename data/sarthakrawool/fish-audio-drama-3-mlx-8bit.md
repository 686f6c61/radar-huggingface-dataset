# SarthakRawool/Fish-Audio-Drama-3-MLX-8bit

## Resumen

Fish Audio Drama 3 MLX 8-bit es una conversión cuantizada del modelo de síntesis de voz Fish Audio Drama 3, adaptada para ejecutarse en Macs con Apple Silicon mediante el framework MLX. La ha publicado SarthakRawool como parte de Shuttrr, una aplicación que permite ejecutar modelos grandes de vídeo y voz con requisitos de memoria reducidos. No se trata de un lanzamiento oficial de Fish Audio, sino de un trabajo derivado que conserva la licencia comunitaria del modelo original.

El modelo resuelve el problema de desplegar un sistema TTS con clonación de voz de gran tamaño en hardware de consumo Apple, donde el modelo original en FP8 resulta inviable por memoria. La conversión reduce los expertos MoE enrutados a MLX 8-bit afín con grupo de 64, mantiene el resto de componentes (torre, códec, tokenizador y embeddings del backbone) sin cuantización adicional y empaqueta el códec en safetensors.

Es relevante ahora porque demuestra la viabilidad de ejecutar arquitecturas MoE de voz en un solo equipo de sobremesa con memoria unificada, un nicho tradicionalmente dominado por GPUs dedicadas. La información pública es escasa: el repositorio tiene cero descargas y cero likes, y solo se han publicado mediciones en un Mac Studio M5 Max de 128 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE enrutado (expertos FP8 E4M3 en el original, requantizados a MLX 8-bit afín), con torre, códec, tokenizador y backbone |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 8-bit afín, grupo de 64 (expertos MoE); resto de componentes sin cuantización adicional |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Community License v1.0 |
| Formato de pesos | safetensors (MLX); códec convertido de codec.pth a safetensors |

## Arquitectura y entrenamiento

El modelo original emplea una arquitectura de mezcla de expertos (MoE) con expertos enrutados almacenados en FP8 E4M3 con escalas de bloque de 128x128. La conversión de SarthakRawool desquantiza esos expertos y los requantiza a MLX 8-bit afín con tamaño de grupo 64, apilándolos por capa. Los pesos de normalización centrados en cero se almacenan como 1 + w, y los tensores se renombran para el modelo MLX. La torre, el códec, el tokenizador y los embeddings del backbone se convierten sin cuantización adicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original utilizó RLHF o DPO. El puerto MLX proviene del proyecto TensorFold (Apache-2.0), integrado en Shuttrr. El autor no documenta innovaciones técnicas adicionales más allá del proceso de conversión y la gestión de memoria del runtime.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz, según los tags del repositorio y la licencia del modelo.
- Ejecución en Apple Silicon mediante MLX, con soporte de memoria reducida a través de Shuttrr.
- Generación de audio por tramas de códec: 21,5 tramas equivalen a 1 segundo de audio.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clonación de voz para doblaje y locución: el modelo permite generar audio con una voz de referencia, adecuado para producciones de vídeo gestionadas desde Shuttrr en un Mac con memoria unificada.
- Síntesis de voz en local para privacidad: al ejecutarse íntegramente en el equipo, evita enviar texto o muestras de voz a servicios en la nube, útil en entornos con datos sensibles.
- Prototipado de asistentes de voz: permite iterar sobre guiones y respuestas habladas sin coste de API, con una velocidad de 60,2 tramas de códec por segundo medida en M5 Max.
- Accesibilidad y lectura de contenido: generación de audio a partir de documentos o artículos para personas con discapacidad visual, siempre que se respeten las restricciones de la licencia.
- Investigación en TTS y MoE: sirve como banco de pruebas para estudiar el rendimiento de expertos cuantizados en MLX y comparar con implementaciones en GPU.
- Generación de voces para videojuegos o contenido interactivo: integrable en pipelines locales de producción de audio cuando el volumen de uso y los ingresos encajan en la licencia comunitaria.
- Evaluación de despliegue en hardware de consumo: referencia práctica para medir memoria pico (47,5 GB) y velocidad en Apple Silicon de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las únicas métricas publicadas son de ejecución en un Mac Studio M5 Max con 128 GB de memoria, MLX 0.32.3 y los interruptores de baja memoria de Shuttrr activados:

| Métrica | Valor |
|---|---|
| Descarga | unos 43 GB (40,2 GiB) |
| Memoria pico durante la generación | 47,5 GB |
| Velocidad | 60,2 tramas de códec por segundo (21,5 tramas = 1 segundo de audio) |

El autor indica que son las únicas mediciones realizadas y que no se han probado Macs más pequeños.

## Requisitos de hardware

- VRAM/memoria estimada: 47,5 GB de memoria pico durante la generación, según la medición del autor en M5 Max.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia; el único equipo probado es un Mac Studio M5 Max de 128 GB.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA o AMD; el modelo está empaquetado para MLX y Apple Silicon. En Macs con menos memoria que la pico medida no se ha validado.
- Opciones de despliegue: Shuttrr (desde la versión 0.2.13) con el puerto MLX de TensorFold; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: 60,2 tramas de códec por segundo en M5 Max, equivalente aproximado a 2,8 segundos de audio por segundo de cómputo; la latencia no se publica.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica de forma directa a TTS, pero no hay evaluación de fidelidad de pronunciación ni de estabilidad de la voz clonada.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni longitud máxima de texto de entrada.
- Restricciones de licencia: Fish Audio Community License v1.0 permite uso gratuito para investigación y personal, y comercial solo con ingresos anuales inferiores a 500.000 USD; ofrecerlo como servicio alojado de voz o TTS requiere licencia separada de Fish Audio. Prohíbe imitar la voz de personas identificables sin consentimiento, suplantar o engañar, contenido sexual con menores o personas reales sin consentimiento, eliminar marcas de agua y usar las salidas para entrenar otros modelos de voz.
- Es un trabajo derivado no oficial y no respaldado por Fish Audio.
- Solo se ha validado en un Mac Studio M5 Max de 128 GB; el rendimiento en equipos menores es desconocido.
- El repositorio no tiene descargas ni likes, lo que limita la validación comunitaria.
- El tamaño de descarga (~43 GB) y la memoria pico (47,5 GB) lo alejan de portátiles con memoria unificada reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SarthakRawool/Fish-Audio-Drama-3-MLX-8bit
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Proyecto Shuttrr: https://github.com/sarthakrawool/shuttrr
- Puerto MLX TensorFold: https://github.com/drowzeys/TensorFold
- Licencia: incluida en el repositorio (archivo LICENSE)
- Aviso de cambios: incluido en el repositorio (archivo NOTICE)
