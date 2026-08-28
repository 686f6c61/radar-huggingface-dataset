# mradermacher/Ornstein3.8-27B-i1-GGUF

## Resumen

Ornstein3.8-27B es un modelo multimodal de 27 320 millones de parámetros desarrollado por GestaltLabs, basado en la arquitectura Qwen3.8 (etiquetado como qwen3_5 y qwen3.8). Acepta entradas de imagen y texto, lo que lo sitúa en la categoría image-text-to-text. Este repositorio concreto contiene cuantizaciones GGUF con imatrix realizadas por mradermacher, un cuantizador reconocido por su trabajo en formatos optimizados para inferencia local. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el modelo está pensado para ejecutarse en hardware de consumo mediante motores como llama.cpp u Ollama.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo multimodal de 27B en entornos con VRAM limitada, gracias a las distintas cuantizaciones que van desde 11 GB hasta 22,5 GB. Al estar basado en Qwen3.8, hereda capacidades de razonamiento y generación de texto, aunque la información pública no detalla su arquitectura interna ni sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; basado en Qwen3.8 (multimodal image-text-to-text) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base (GestaltLabs/Ornstein3.8-27B). Por las etiquetas se deduce que pertenece a la familia Qwen3.8, que en su version original es un transformer multimodal con capacidad para procesar imagenes y texto. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Este repositorio es una cuantizacion GGUF con imatrix, lo que significa que los pesos se han convertido desde el formato original (probablemente safetensors) a cuantizaciones de menor precision, utilizando una matriz de importancia (imatrix) para mejorar la calidad de la cuantizacion. No se mencionan innovaciones tecnicas adicionales en el proceso de cuantizacion.

## Capacidades

- Procesamiento multimodal: acepta imagenes y texto como entrada, generando respuestas de texto (pipeline image-text-to-text).
- Generacion de texto: al estar basado en Qwen3.8, es capaz de producir texto coherente y contextualmente relevante.
- Razonamiento conversacional: el tag "conversational" indica que esta optimizado para dialogos multi-turno.
- Inferencia local: las cuantizaciones GGUF permiten ejecutar el modelo en CPU o GPU con recursos limitados.
- Compatibilidad con motores de inferencia: funciona con llama.cpp, Ollama, LM Studio y otros que soporten GGUF.
- No se dispone de informacion sobre tool calling, agentes, ni capacidades especiales como thinking mode o audio.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede generar texto alternativo detallado a partir de fotografias o ilustraciones, util en aplicaciones de lectura de pantalla o catalogacion de contenido visual.
- Asistente de atencion al cliente con capturas de pantalla: un usuario puede enviar una imagen de un error o una interfaz, y el modelo interpreta el contexto visual y ofrece una respuesta textual de ayuda.
- Analisis de documentos escaneados: al combinar OCR con el modelo, se pueden extraer y resumir informacion de facturas, formularios o articulos impresos.
- Generacion de contenido para redes sociales: a partir de una imagen, el modelo redacta pies de foto, descripciones o hilos explicativos.
- Chatbot multimodal en entornos educativos: estudiantes pueden subir diagramas o graficos y recibir explicaciones textuales adaptadas a su nivel.
- Prototipado rapido de aplicaciones de vision por computador: los desarrolladores pueden probar conceptos de VQA (visual question answering) sin necesidad de entrenar un modelo propio, gracias a la licencia permisiva y al despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada segun cuantizacion:
  - i1-Q2_K (11,0 GB): requiere al menos 14 GB de VRAM para inferencia comoda.
  - i1-Q4_K_S (15,9 GB): necesita unos 18-20 GB de VRAM.
  - i1-Q4_K_M (16,9 GB): recomendable 20-24 GB de VRAM.
  - i1-Q6_K (22,5 GB): requiere 24 GB o mas de VRAM.
- GPUs recomendadas:
  - Para cuantizaciones Q2-Q4: RTX 3090, RTX 4090, A6000 (24 GB) o similares.
  - Para Q5-Q6: A100 40 GB, H100, o multiples GPUs.
- En consumer GPU: cabe en RTX 3090/4090 con cuantizaciones Q4 o inferiores; para Q6 se necesita una GPU de 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o cualquier motor compatible con GGUF. Tambien se puede usar con Python mediante bindings de llama-cpp-python.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos multimodales de tamano similar (por ejemplo, LLaVA-34B, Qwen-VL-32B, etc.). No se han encontrado datos publicos de rendimiento ni especificaciones detalladas del modelo base que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles (tag "en"). No se garantiza un rendimiento adecuado en otros idiomas.
- Cuantizacion: las versiones GGUF con menor precision (Q2, Q3) pueden degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o comprension visual fina.
- Informacion incompleta: no se conocen sesgos especificos, tasas de alucinacion ni limitaciones de contexto, ya que el autor no ha publicado detalles sobre el entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base (GestaltLabs/Ornstein3.8-27B) por si hubiera condiciones adicionales.
- Despliegue en produccion: al ser una cuantizacion, es recomendable validar el rendimiento en el caso de uso concreto antes de implementarlo en entornos criticos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Ornstein3.8-27B-i1-GGUF
- Modelo base: https://huggingface.co/GestaltLabs/Ornstein3.8-27B
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/Ornstein3.8-27B-GGUF
- Pagina de mradermacher con listado de modelos: https://huggingface.co/mradermacher
