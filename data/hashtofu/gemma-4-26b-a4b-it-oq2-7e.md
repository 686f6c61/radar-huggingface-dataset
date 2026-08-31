# hashtofu/gemma-4-26b-a4b-it-oQ2.7e

## Resumen

Este modelo es una cuantización de 2 bits del modelo Gemma 4 26B A4B IT de Google DeepMind, realizada con la herramienta oQ de oMLX (v0.6.4). El modelo base es un LLM multimodal (texto e imagen) con arquitectura attention-sparse y 26 mil millones de parámetros totales, de los cuales solo 4 mil millones se activan por token (A4B). Esta cuantización reduce el tamaño del repositorio a aproximadamente 11,3 GB en formato MLX safetensors, lo que permite ejecutar el modelo en hardware con recursos limitados, como Macs con Apple Silicon o GPUs consumer. Es relevante para desarrolladores que necesitan desplegar un modelo de razonamiento avanzado en entornos con restricciones de memoria, aunque la cuantización de 2 bits puede degradar la calidad de las respuestas. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention-sparse, multimodal (texto e imagen) |
| Parametros totales | 26B (modelo base); 3.488.144.974 (dato real en safetensors del repo) |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | 2048 tokens (segun tutorial, no confirmado) |
| Tipos de cuantizacion | 2-bit, group size 64, mixed-precision (oQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 26B A4B IT, desarrollado por Google DeepMind, emplea una arquitectura attention-sparse que reduce la carga computacional al activar solo una fraccion de los parametros por token (4B de 26B). Es multimodal, capaz de procesar texto e imagenes y generar texto. El entrenamiento del modelo base no se detalla en la informacion disponible, pero se sabe que sigue las practicas de la familia Gemma, con ajuste instructivo (IT). Esta cuantizacion especifica utiliza la herramienta oQ de oMLX v0.6.4, que aplica cuantizacion de precision mixta. Los pesos se almacenan en formato MLX safetensors con 2 bits y group size de 64. La cuantizacion fue actualizada el 2026-08-31, reemplazando una version anterior.

## Capacidades

- Generacion de texto y razonamiento: al ser una cuantizacion del modelo instructivo, conserva capacidades de razonamiento, aunque degradadas por la baja precision.
- Multimodalidad: soporta entrada de texto e imagenes (del modelo base).
- Generacion de codigo: el modelo base tiene buenas capacidades de programacion, que se mantienen parcialmente.
- Tool calling: probablemente soportado por el modelo base, pero no confirmado en esta cuantizacion.
- Multilinguismo: no especificado, pero el modelo base de Gemma 4 soporta multiples idiomas.
- Formato MLX: optimizado para Apple Silicon mediante el framework MLX.

## Casos de uso

- Prototipado rapido en Macs: gracias al formato MLX y la cuantizacion de 2 bits, se puede ejecutar localmente en Macs con Apple Silicon para pruebas de concepto de chatbots o asistentes.
- Procesamiento de imagenes con texto: el modelo puede recibir imagenes y generar descripciones o responder preguntas sobre ellas, util en aplicaciones de accesibilidad o analisis de documentos.
- Generacion de codigo en entornos con pocos recursos: desarrolladores pueden usar el modelo para autocompletar o generar fragmentos de codigo en portatiles sin GPU dedicada.
- Educacion e investigacion: para experimentar con modelos multimodales cuantizados y estudiar el impacto de la cuantizacion extrema en la calidad.
- Despliegue en edge: en dispositivos con poca memoria, como Raspberry Pi o dispositivos moviles, aunque la latencia puede ser alta.
- Analisis de sentimiento y clasificacion de texto: tareas simples que no requieren maxima precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion. El modelo base Gemma 4 26B A4B IT tiene resultados en benchmarks publicos, pero no se pueden atribuir a esta version cuantizada.

## Requisitos de hardware

- VRAM estimada: el tamano del repositorio es 11,3 GB, por lo que se necesitan al menos 12 GB de memoria unificada en Macs o VRAM en GPUs. Con cuantizacion de 2 bits, los pesos del modelo base (26B) ocuparian teoricamente ~6,5 GB, pero el repo incluye otros archivos. Se recomienda al menos 16 GB de RAM/VRAM para comodidad.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con 16 GB o mas; GPUs NVIDIA con 16 GB (RTX 4080, 4090) o AMD con 16 GB.
- En consumer GPU: si, cabe en GPUs con 12-16 GB, pero puede haber problemas de memoria con contextos largos.
- Opciones de despliegue: al ser MLX, se usa con el framework MLX en Apple Silicon; tambien se puede convertir a GGUF para usar con llama.cpp, Ollama o vLLM, aunque no se proporciona en este repo.
- Latencia: no disponible, pero la cuantizacion de 2 bits reduce el tamano, lo que acelera la inferencia en comparacion con el modelo completo.

## Comparativa con modelos similares

- Gemma 4 26B A4B IT GGUF (unsloth): cuantizacion GGUF en varios bits (Q4, Q8, etc.) para uso con llama.cpp. Ofrece mayor fidelidad que 2 bits, pero ocupa mas espacio.
- Gemma 4 26B A4B IT original (safetensors de Google): pesos completos en FP16, requiere mas memoria (~52 GB), pero maxima calidad.
- Otras cuantizaciones MLX de oQ: el mismo autor tiene otras versiones con mas bits (por ejemplo, oQ3, oQ4) que ofrecen mejor equilibrio.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| hashtofu/gemma-4-26b-a4b-it-oQ2.7e | 26B (3.5B en safetensors) | 2048 (?) | 2-bit MLX | No disponible |
| unsloth/gemma-4-26B-A4B-it-GGUF | 26B | 2048 (?) | GGUF Q4_K_M, etc. | Gemma license |
| Google gemma-4-26B-A4B-it | 26B | 2048 (?) | FP16 | Gemma license |

Nota: el contexto de 2048 es dudoso; otros modelos Gemma 4 suelen tener 8K o mas, pero no tengo confirmacion.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: degradacion significativa de la calidad del texto, mayor riesgo de alucinaciones y errores de razonamiento.
- Sin licencia especificada: el repo no indica licencia, lo que impide su uso comercial sin aclaracion.
- Sin idiomas documentados: no se sabe si funciona bien en espanol u otros idiomas.
- Contexto corto (posiblemente 2048 tokens): limita el manejo de documentos largos o conversaciones extensas.
- Sin benchmarks publicados: no hay evidencia de rendimiento real.
- Dependencia de MLX: solo funciona en Apple Silicon; para otras plataformas requiere conversion.
- El numero de parametros en safetensors (3.5B) no coincide con el modelo base (26B), lo que sugiere que la cuantizacion no conserva todos los parametros o hay un error en el repo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hashtofu/gemma-4-26b-a4b-it-oQ2.7e
- Tutorial de despliegue: https://graphicstudio.io/2026/06/28/deploy-gemma-4-26b-a4b-it-2026-2027-tutorial/
- Version GGUF de unsloth: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Contenedor NIM de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nim/google/containers/gemma-4-26b-a4b-it/
