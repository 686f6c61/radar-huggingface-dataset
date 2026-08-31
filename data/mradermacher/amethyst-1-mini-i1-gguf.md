# mradermacher/amethyst-1-mini-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `VertexAGI/amethyst-1-mini`, preparadas por mradermacher, un conocido cuantizador de la comunidad. El modelo base, del que no se dispone de ficha técnica detallada en esta información, parece estar basado en la arquitectura Gemma 3 (según las etiquetas `gemma` y `gemma3`), con 4.551.515.648 parámetros (aproximadamente 4,55 mil millones). Se describe como un modelo conversacional, con indicios de destilación y posiblemente capacidades de visión, aunque esto último no está confirmado.

La relevancia de esta publicación radica en que ofrece el modelo en formato GGUF con múltiples niveles de cuantización, lo que permite ejecutarlo en hardware modesto mediante motores como llama.cpp, Ollama o LM Studio. Al ser una cuantización, no introduce nuevas capacidades, pero facilita el despliegue local del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere Gemma 3 por etiquetas, sin confirmar) |
| Parametros totales | 4.551.515.648 (4,55 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (licencia de Gemma) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados para el modelo base `VertexAGI/amethyst-1-mini`. Las etiquetas indican que emplea tecnicas de LoRA y destilacion, y que esta relacionado con la familia Gemma 3, pero no se proporcionan detalles adicionales. Este repositorio es exclusivamente una cuantizacion del modelo original, realizada con el metodo imatrix (indicado por el prefijo `i1-` en los nombres de archivo), que optimiza la asignacion de bits segun la importancia de los pesos.

## Capacidades

Dado que se trata de una cuantizacion, las capacidades son las del modelo base, de las cuales no se tiene informacion detallada. Segun las etiquetas del repositorio, se puede inferir:

- Generacion de texto conversacional (etiqueta `conversational`).
- Posible soporte de vision, ya que la model card menciona que es un "vision model" y que los archivos mmproj (proyectores de vision) estan disponibles en el repositorio estatico.
- Uso de destilacion, lo que sugiere que el modelo base fue entrenado a partir de un modelo mayor.

No se dispone de informacion sobre tool calling, agentes, razonamiento multi-paso u otras capacidades especificas.

## Casos de uso

Al no conocerse las capacidades exactas del modelo base, los casos de uso son los tipicos de un modelo conversacional de 4,5 B parametros ejecutado localmente:

- Chatbot local: desplegar un asistente conversacional en una maquina sin conexion a internet, usando llama.cpp o Ollama.
- Prototipado rapido: probar el modelo en tareas de generacion de texto antes de decidir si se adopta en produccion.
- Educacion e investigacion: experimentar con cuantizaciones extremas (IQ1, IQ2) para estudiar el equilibrio entre tamaño y calidad.
- Integracion en aplicaciones de escritorio: usar el modelo como backend para herramientas de autocompletado o generacion de contenido.
- Pruebas de hardware: evaluar el rendimiento de GPUs de gama baja o CPUs con diferentes niveles de cuantizacion.
- Desarrollo de agentes conversacionales simples: si el modelo base soporta instrucciones, se puede usar para tareas de clasificacion o extraccion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

Los tamaños de los archivos GGUF (entre 1,5 GB y 3,8 GB) permiten estimar los requisitos minimos:

- VRAM estimada para inferencia: desde 2 GB (cuantizaciones IQ1/IQ2) hasta 6 GB (Q6_K), dependiendo del contexto y del motor utilizado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 o superiores; para IQ1/IQ2 basta con 2-3 GB. Tambien es viable en CPU con suficiente RAM (8 GB o mas).
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060, RTX 4060, GTX 1660 Super, etc.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, entre otros.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion; en una GPU moderna se esperan decenas de tokens por segundo, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Al ser una cuantizacion de un modelo poco conocido, no se pueden establecer comparaciones fiables con alternativas como Gemma 2 2B, Qwen 2.5 4B o Llama 3.2 3B sin datos de rendimiento.

## Limitaciones y advertencias

- Al ser una cuantizacion, se produce una perdida de calidad respecto al modelo original, especialmente en los niveles mas agresivos (IQ1, IQ2).
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los terminos exactos antes de desplegar el modelo en produccion.
- El modelo solo soporta ingles, lo que limita su uso en otros idiomas.
- No se dispone de informacion sobre sesgos, alucinaciones o comportamientos problematicos del modelo base.
- La fecha de creacion del repositorio (2026) es inusual y podria indicar un error en los metadatos; no afecta al funcionamiento.
- Para tareas de vision, es necesario descargar los archivos mmproj del repositorio estatico, que no estan incluidos en este repo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/amethyst-1-mini-i1-GGUF
- Repositorio estatico (con mmproj): https://huggingface.co/mradermacher/amethyst-1-mini-GGUF
- Modelo base: https://huggingface.co/VertexAGI/amethyst-1-mini
- Pagina de resumen de mradermacher: https://huggingface.co/mradermacher/models
