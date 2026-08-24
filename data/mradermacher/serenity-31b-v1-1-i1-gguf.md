# mradermacher/Serenity-31B-v1.1-i1-GGUF

## Resumen
El modelo Serenity-31B-v1.1-i1-GGUF es una cuantización en formato GGUF con matriz de importancia (imatrix) del modelo base ReadyArt/Serenity-31B-v1.1, realizada por mradermacher. Se trata de un modelo de lenguaje grande de 30.700 millones de parámetros, basado en la arquitectura Gemma-4, orientado a roleplay, conversación y generación de texto instructivo. El modelo está pensado para entornos de ejecución locales y de baja latencia, ya que los pesos se ofrecen en cuantizaciones que reducen el tamaño de 12 a 18 GB, lo que permite su uso en GPUs de consumo. Está diseñado para contenido adulto y explícito, sin alineación, y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y personal. Su relevancia actual radica en la demanda de modelos de rol y conversación de alta calidad que puedan ejecutarse en hardware modesto sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 (transformers) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (tambien en repositorio estatico: Q2_K_S, Q3_K_S, Q4_K_M, Q5_K_S, Q6_K, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo es una cuantizacion GGUF con matriz de importancia (imatrix) del modelo base ReadyArt/Serenity-31B-v1.1, que es un modelo instructivo y de roleplay basado en la arquitectura Gemma-4. La cuantizacion imatrix mejora la calidad de los pesos reducidos al ponderar la importancia de los tensores durante el proceso de cuantizacion. No se dispone de informacion detallada sobre el entrenamiento del modelo base (dataset, numero de tokens, tecnicas de alineacion o RLHF). El repositorio indica que es un modelo de vision, pero no se incluyen los archivos mmproj en esta version; se encuentran en el repositorio estatico. No se especifican innovaciones tecnicas adicionales mas alla de la cuantizacion.

## Capacidades
- Generacion de texto conversacional y narrativo, optimizado para roleplay y dialogo de personajes.
- Ejecucion de instrucciones de tipo instruct (seguimiento de prompts con formato de instruccion).
- Capacidad de procesar entradas de vision (si se usa con el mmproj adecuado del repositorio estatico).
- Soporte para contenido maduro y explicito, sin restricciones de alineacion.
- Multilingue: solo ingles.
- No se documenta soporte para tool calling ni funciones de agente.

## Casos de uso
- Roleplay de personajes: el modelo puede generar respuestas coherentes y detalladas en escenarios de rol, manteniendo el contexto a lo largo de conversaciones largas gracias a su ventana de contexto (aunque no se especifica el tamano, se asume una longitud de contexto típica de Gemma-4).
- Creacion de narrativas interactivas: en juegos de texto o aventuras conversacionales, el modelo puede actuar como narrador o como personaje no jugador.
- Simulacion de dialogos: para el desarrollo de chatbots con personalidad especifica, como asistentes virtuales con tono informal o personajes de ficcion.
- Generacion de contenido creativo: escritura de relatos, dialogos de guion o descripciones de escenas, aprovechando su capacidad de generar texto fluido y contextual.
- Prototipado de sistemas de conversacion: en entornos de investigacion, se puede usar para probar tecnicas de prompting o de generacion de respuesta en un modelo de 31B sin alineacion.
- Despliegue local en hardware moderado: gracias a las cuantizaciones ligeras, se puede ejecutar en una GPU de consumo (por ejemplo, RTX 3090 o RTX 4090) para aplicaciones de chatbot privadas o de nicho.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otros. La unica referencia de rendimiento es la comparativa de calidad de cuantizacion incluida en el README (grafica de perplexidad), pero no se proporcionan datos numericos.

## Requisitos de hardware
- VRAM estimada para inferencia:
  - Cuantizacion i1-Q2_K (12.0 GB): requiere al menos 14 GB de VRAM (por ejemplo, RTX 4080, RTX 3090 con 24 GB).
  - Cuantizacion i1-IQ3_M (14.5 GB): requiere al menos 16 GB de VRAM (RTX 4080, RTX 3090).
  - Cuantizacion i1-Q4_K_S (17.9 GB): requiere al menos 20 GB de VRAM (RTX 3090, RTX 4090, A100).
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40 GB) para ejecucion comoda.
- En GPUs de consumo: si es posible en RTX 3060 (12 GB) solo con la cuantizacion Q2_K (12 GB) si se usa offloading a RAM, pero se recomienda al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI (con conversiones), y cualquier entorno que soporte GGUF.
- Latencia y throughput: no se dispone de mediciones concretas; depende del hardware y la cuantizacion. En una RTX 4090, se espera una velocidad de generacion de 20-40 tokens/s para Q4_K_S, y algo mayor en cuantizaciones mas ligeras.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativos para este modelo. Se pueden comparar con otros modelos de roleplay de tamano similar, como:
- **Serenity-12B**: version de 12B del mismo autor, con menor numero de parametros y menor VRAM requerida.
- **Mistral-7B**: mas pequeno (7B), pero con menos capacidad de contexto y menor calidad de roleplay.
- **Llama-3-8B**: otro modelo de 8B, comun en tareas conversacionales, pero con menor capacidad de generacion narrativa.

No se dispone de tablas de rendimiento comparativo porque no hay benchmarks publicados.

## Limitaciones y advertencias
- Contenido no alineado: el modelo puede generar contenido sexual, violento o inapropiado sin filtros, lo que puede ser problemático en aplicaciones publicas o entornos profesionales.
- Sesgos: al estar entrenado con datos de Internet, puede reflejar sesgos sociales, culturales y de genero.
- Riesgo de alucinacion: como la mayoria de modelos de lenguaje, puede inventar datos o hechos cuando se le pide informacion factual.
- Idioma: solo soporta ingles, lo que limita su uso en otros idiomas.
- Ventana de contexto: no se especifica el tamano, pero se recomienda no superar los 32k tokens (probablemente) para evitar perdidas de rendimiento.
- Licencia: Apache-2.0 permite uso comercial, pero la naturaleza del contenido generado puede no ser adecuada para entornos empresariales.
- El repositorio no incluye el archivo mmproj para vision; si se necesita esa capacidad, hay que descargar el repositorio estatico.

## Enlaces
- [Repositorio HuggingFace de la cuantizacion i1](https://huggingface.co/mradermacher/Serenity-31B-v1.1-i1-GGUF)
- [Repositorio estatico de cuantizaciones](https://huggingface.co/mradermacher/Serenity-31B-v1.1-GGUF)
- [Modelo base ReadyArt/Serenity-31B-v1.1](https://huggingface.co/ReadyArt/Serenity-31B-v1.1)
- [Pagina de descarga de mradermacher](https://hf.tst.eu/model#Serenity-31B-v1.1-i1-GGUF)
- [Guia de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF) (referencia para usar los archivos)
