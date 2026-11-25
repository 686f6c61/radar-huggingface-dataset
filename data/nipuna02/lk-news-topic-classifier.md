# nipuna02/lk-news-topic-classifier

## Resumen

lk-news-topic-classifier es un clasificador de temas para noticias de Sri Lanka en sinhala, tamil e ingles. Lo desarrolla nipuna02 como parte del proyecto Lanka News Lens, cuyo objetivo es agrupar una misma noticia publicada en medios en los tres idiomas y generar resumenes diarios con citas. El modelo parte de `intfloat/multilingual-e5-small` (117,7 millones de parametros) y se afina para asignar una de nueve etiquetas: politics, economy, crime, disaster_weather, health, sports, education, international y other.

Se trata de un encoder transformer pequeno, con un contexto de 128 tokens, pensado para clasificacion de texto corto (titular mas primeros 600 caracteres del cuerpo). Su relevancia actual es doble: por un lado, cubre un nicho poco atendido como es el procesamiento de texto sinhala y tamil en un unico modelo multilingue; por otro, el autor publica de forma transparente que el modelo no supera a una linea base TF-IDF con regresion logistica (macro-F1 0.715 frente a 0.748 en el conjunto de prueba verificado), lo que lo convierte en un caso interesante de evaluacion honesta.

El modelo es de uso libre bajo licencia MIT, con un tamano de repositorio de 0,5 GB, y esta disponible en formato safetensors para la libreria transformers. No es un modelo generativo: no produce texto, solo etiquetas de clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like), basado en intfloat/multilingual-e5-small |
| Parametros totales | 117.657.225 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones especificas; al ser un encoder pequeno es compatible con cuantizacion dinamica estandar de PyTorch) |
| Idiomas soportados | Sinhala (si), tamil (ta), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT, heredado de `intfloat/multilingual-e5-small`, con una cabeza de clasificacion de secuencia sobre nueve clases. La entrada es el titular mas los primeros 600 caracteres del cuerpo, truncada a 128 tokens. No emplea atencion lineal ni decodificacion especulativa; es una arquitectura densa convencional orientada a embeddings y clasificacion.

El entrenamiento se realizo sobre 20.176 articulos del dataset `nuuuwan/lk-news-docs` y `nuuuwan/lk-news-chunks` (licencia MIT), con un maximo de 760 articulos por combinacion de idioma y tema. Las etiquetas son debiles: 1.804 articulos proceden de secciones de URL de medios como ada.lk, Daily Mirror, Tamil Mirror y algunas secciones de Lankadeepa, y 18.372 se generaron con reglas de palabras clave trilingues. El autor estima que aproximadamente 1 de cada 5 etiquetas debiles es incorrecta. El entrenamiento se ejecuto en un MacBook Air M1 con 8 GB de RAM (MPS), con batch size 16, learning rate 5e-5, AdamW con schedule lineal y 6% de warmup. Se planificaron dos epocas pero se detuvo en la segunda; los pesos publicados corresponden al checkpoint tras la primera epoca, que obtuvo macro-F1 0.917 en el split de validacion con etiquetas debiles. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador.

## Capacidades

- Clasificacion de texto multilingue en sinhala, tamil e ingles con una unica etiqueta entre nueve temas.
- Procesamiento de noticias de Sri Lanka del periodo 2024-2026.
- Inferencia rapida y ligera gracias a su tamano reducido (117,7 M de parametros) y contexto de 128 tokens.
- Integracion directa con el pipeline `text-classification` de transformers.
- Compatibilidad con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion automatica de articulos en un agregador de noticias de Sri Lanka: el modelo asigna un tema a cada noticia en sinhala, tamil o ingles, permitiendo organizar el contenido por secciones sin intervencion manual.
- Agrupacion de historias entre medios: dentro del proyecto Lanka News Lens, la etiqueta de tema se combina con embeddings para agrupar la misma noticia publicada en distintos idiomas y medios.
- Filtrado tematico en pipelines de monitorizacion: un medio o una organizacion puede filtrar articulos de `disaster_weather` o `crime` para alertas tempranas, gracias a la clasificacion en una sola pasada.
- Enriquecimiento de datasets de noticias: asignar etiquetas de tema a corpus historicos de medios de Sri Lanka para analisis posterior, con la advertencia de que las etiquetas deben validarse.
- Prototipado rapido de sistemas de clasificacion multilingue: al ser un encoder pequeno y con licencia MIT, sirve como punto de partida para afinar sobre taxonomias propias.
- Generacion de resumenes diarios citados: el proyecto Lanka News Lens usa la clasificacion para seleccionar y organizar noticias antes de redactar briefs con citas.
- Investigacion sobre etiquetado debil: el modelo y su documentacion sirven como caso de estudio para comparar el rendimiento de un encoder afinado frente a una linea base TF-IDF en un escenario de ruido en las etiquetas.

## Benchmarks y rendimiento

El conjunto de prueba consta de 450 articulos (150 por idioma), muestreados al azar entre 2024 y 2026 y etiquetados por Claude (un asistente de IA), no por un hablante nativo humano. El macro-F1 se promedia sobre las clases presentes y los intervalos de confianza del 95% provienen de 1.000 remuestreos bootstrap.

| Modelo | Global | Ingles | Sinhala | Tamil |
|---|---|---|---|---|
| Reglas de palabras clave (etiquetador debil) | 0.660 [0.60, 0.71] | 0.697 | 0.618 | 0.668 |
| TF-IDF (palabra + caracter) + regresion logistica | **0.748** [0.69, 0.79] | **0.777** | **0.761** | **0.672** |
| Este modelo | 0.715 [0.66, 0.76] | 0.743 | 0.707 | 0.645 |

La precision global de este modelo es 0.722. El F1 por clase es el siguiente:

| Clase | F1 | Soporte |
|---|---|---|
| sports | 0.97 | 18 |
| disaster_weather | 0.79 | 32 |
| politics | 0.79 | 104 |
| economy | 0.77 | 76 |
| crime | 0.76 | 80 |
| international | 0.71 | 43 |
| education | 0.62 | 8 |
| health | 0.57 | 10 |
| other | 0.45 | 79 |

La clase `other` es la mas debil (recall 0.35), porque las reglas de palabras clave que generaron las etiquetas de entrenamiento rara vez la asignan. Education y health tienen solo 8 y 10 articulos de prueba, por lo que sus puntuaciones son muy ruidosas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (117,7 M de parametros), aproximadamente 0,5 GB en fp16 y menos de 0,3 GB en int8. Es un modelo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4090, A100, H100 e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, y tambien en CPU con latencia aceptable para clasificacion de texto corto.
- Opciones de despliegue: transformers (pipeline `text-classification`), text-embeddings-inference, endpoints compatibles, y exportacion a ONNX o cuantizacion dinamica de PyTorch para CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y moderado en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (global, test verificado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lk-news-topic-classifier | 117,7 M | 128 tokens | 0.715 | MIT | Hugging Face |
| TF-IDF + regresion logistica (linea base del mismo repo) | No aplica (modelo clasico) | No aplica | 0.748 | No especificada en la ficha | Repositorio del proyecto |
| intfloat/multilingual-e5-small (modelo base) | 117,7 M | 512 tokens | No evaluado en esta tarea | MIT | Hugging Face |

La comparacion con otros clasificadores de noticias multilingues especificos para sinhala y tamil no esta disponible en la informacion proporcionada. La alternativa mas directa y mejor documentada es la linea base TF-IDF del propio repositorio, que supera a este modelo en macro-F1 global y en los tres idiomas.

## Limitaciones y advertencias

- El modelo no supera a la linea base TF-IDF con regresion logistica en el conjunto de prueba verificado (0.715 frente a 0.748), y los intervalos de confianza se solapan.
- Las etiquetas de entrenamiento son debiles: aproximadamente 1 de cada 5 es incorrecta, lo que introduce ruido considerable.
- Las etiquetas del conjunto de prueba fueron asignadas por un asistente de IA (Claude), no por hablantes nativos humanos; el autor pide que se abran issues si se detectan errores.
- Solo cubre noticias de medios de Sri Lanka del periodo 2024-2026 y las nueve clases definidas.
- Cada articulo recibe exactamente una etiqueta, aunque mezcle temas (por ejemplo, un debate de politica economica en el parlamento).
- La cobertura de sinhala en los datos de origen es escasa a partir de 2026.
- La clase `other` tiene un recall muy bajo (0.35) y las clases education y health tienen muy pocos ejemplos de prueba.
- El contexto esta limitado a 128 tokens, por lo que solo procesa titular y primeros 600 caracteres del cuerpo.
- No debe usarse para moderacion ni para tomar decisiones sobre personas.
- La licencia MIT permite uso comercial, pero los derechos de autor de los articulos originales siguen perteneciendo a los medios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/lk-news-topic-classifier
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset de documentos: https://huggingface.co/datasets/nuuuwan/lk-news-docs
- Dataset de fragmentos: https://huggingface.co/datasets/nuuuwan/lk-news-chunks
- Repositorio de recoleccion de noticias: https://github.com/nuuuwan/lk_news
- Proyecto Lanka News Lens: https://github.com/Nipuna-Lakruwan/lanka-news-lens
