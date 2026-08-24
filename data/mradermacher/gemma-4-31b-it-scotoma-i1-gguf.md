# mradermacher/gemma-4-31B-it-scotoma-i1-GGUF

## Resumen

El modelo `mradermacher/gemma-4-31B-it-scotoma-i1-GGUF` es una versión cuantizada en formato GGUF del modelo base `ReadyArt/gemma-4-31B-it-scotoma`, preparada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 30,7 mil millones de parámetros, con licencia Apache 2.0, que según la información disponible es un modelo de visión (admite entrada de imágenes mediante un archivo `mmproj`). Esta cuantización está optimizada con `imatrix` para mejorar la calidad de la compresión, y se ofrece en varios niveles de precisión que van desde 12 GB hasta 18,8 GB.

La relevancia de esta ficha radica en que ofrece una alternativa lista para ejecutar en entornos locales mediante herramientas como llama.cpp u Ollama, sin necesidad de hardware de gama alta. El modelo base pertenece a la familia Gemma 4 de Google, aunque no se han proporcionado detalles oficiales sobre su arquitectura o entrenamiento. Esta versión GGUF es útil para desarrolladores que quieren evaluar el modelo de forma rápida y con bajo coste de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (ademas de fichero imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base `ReadyArt/gemma-4-31B-it-scotoma`. La model card del autor no incluye especificaciones tecnicas sobre la arquitectura (si es un transformer estandar, MoE, etc.), ni sobre el proceso de entrenamiento (datos, numero de tokens, tecnicas de alineamiento como RLHF o DPO). Lo unico confirmado es que se trata de un modelo de 30,7 mil millones de parametros y que soporta entrada de vision, probablemente mediante un proyector multimodal (archivo `mmproj`). La cuantizacion fue realizada por mradermacher utilizando la tecnica `imatrix` (importance matrix) para optimizar la asignacion de bits durante la cuantizacion, lo que suele mejorar la calidad respecto a cuantizaciones estaticas.

## Capacidades

- Generacion de texto en ingles, con capacidad de razonamiento y comprension del lenguaje.
- Soporte de vision (entrada de imagenes) gracias al archivo `mmproj` presente en el repositorio estatico asociado.
- No se dispone de informacion sobre capacidades especificas como tool calling, agentes, razonamiento multi-step o modo pensamiento.
- Al ser un modelo de 31B, es capaz de manejar tareas complejas de generacion de texto, codigo y analisis, pero sin datos concretos de rendimiento en estas areas.

## Casos de uso

- **Ejecucion local de un LLM de 31B**: gracias a las cuantizaciones GGUF, es posible ejecutar el modelo en una GPU de consumo medio (por ejemplo, RTX 3090 o 4090) con la cuantizacion Q4_K_M, ideal para desarrollo y pruebas sin depender de APIs.
- **Prototipado de aplicaciones de chat o asistentes**: con su soporte de vision, puede integrarse en aplicaciones que requieran describir o analizar imagenes junto con texto, como un asistente de soporte tecnico que recibe capturas de pantalla.
- **Traduccion o generacion de contenido en ingles**: aunque solo se indica idioma ingles, el modelo puede usarse para tareas de redaccion, resumen o traduccion dentro de ese idioma.
- **Investigacion academica**: para estudios comparativos de cuantizacion y su impacto en el rendimiento, ya que se proporcionan multiples niveles de cuantizacion con distintos tamaños y calidades.
- **Despliegue en entornos con recursos limitados**: con cuantizaciones de 12-15 GB, puede ejecutarse en tarjetas graficas de 16 GB VRAM, facilitando la inferencia en equipos portatiles o servidores modestos.
- **Pruebas de rendimiento en hardware heterogeneo**: la variedad de quants permite medir la relacion velocidad/calidad en distintas GPU y configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- **VRAM estimada**:
  - i1-Q2_K: ~12 GB de almacenamiento, requiere aproximadamente 12-14 GB de VRAM para inferencia en GPU (dependiendo de la carga).
  - i1-Q4_K_M: ~18,8 GB de almacenamiento, requiere aproximadamente 20-22 GB de VRAM.
- **GPUs recomendadas**:
  - Para Q4_K_M: RTX 3090, RTX 4090, A100 40GB, etc.
  - Para Q2_K o IQ3: RTX 3060 12GB, RTX 3080, etc.
- **Compatibilidad con consumer GPU**: si, con cuantizaciones de 12-15 GB puede caber en GPUs de 16 GB (por ejemplo, RTX 4080, 5080).
- **Opciones de despliegue**: llama.cpp, Ollama (si se convierte a formato compatible), LM Studio, TGI (con adaptadores), vLLM (aunque vLLM no soporta GGUF directamente, se puede usar con el modelo base).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos. La familia Gemma 4 de Google incluye modelos de tamano similar (p. ej., Gemma 4 27B o 31B), pero no se tienen datos de rendimiento o arquitectura de este modelo en particular. Por tanto, no se ofrece una tabla comparativa.

## Limitaciones y advertencias

- **Alucinaciones y sesgos**: al ser un modelo de lenguaje, puede generar contenido falso o sesgado, especialmente en tareas de razonamiento complejo. No se ha publicado informacion sobre sesgos especificos.
- **Calidad de la cuantizacion**: las cuantizaciones de menor precision (Q2_K, IQ3) pueden degradar significativamente la calidad del texto, especialmente en tareas de matematica o logica.
- **Soporte de vision**: aunque se indica que es un modelo de vision, no se especifica el tipo de imagenes soportadas ni la resolucion. El archivo `mmproj` es necesario y se encuentra en el repositorio estatico, no en este repositorio.
- **Idioma**: solo se declara soporte para ingles; no se garantiza un buen rendimiento en otros idiomas.
- **Licencia**: aunque es Apache 2.0, la licencia de Gemma 4 de Google (enlazada en la card) puede imponer restricciones adicionales, como limitaciones de uso comercial o de despliegue en determinadas regiones. Se debe revisar la licencia original.
- **Sin garantia de actualizaciones**: el modelo base no tiene informacion de mantenimiento o soporte; es una cuantizacion de un tercero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-i1-GGUF
- Modelo base original: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma
- Repositorio de cuantizaciones estaticas (con mmproj): https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-GGUF
- Pagina de ayuda del autor: https://huggingface.co/mradermacher/model_requests
- Herramienta de descarga y vista: https://hf.tst.eu/model#gemma-4-31B-it-scotoma-i1-GGUF
- Referencia de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
