# jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn` es un modelo de lenguaje de aproximadamente 0,7 mil millones de parametros entrenado desde cero por el autor jsaizant. Segun la model card, el entrenamiento se realizo sobre 100 mil millones de tokens del corpus HPLT 4 en italiano, tras aplicar una deduplicacion global y sin filtrado adicional del contenido. Se trata, por tanto, de un modelo de investigacion orientado a estudiar el efecto del preentrenamiento a gran escala sobre un unico idioma con un pipeline de datos minimalista.

La relevancia de este modelo es fundamentalmente metodologica: forma parte de una familia de experimentos de ablacion sobre calidad y composicion de datos (variantes con y sin deduplicacion, con y sin filtrado, sobre distintos idiomas), y no de un asistente conversacional listo para produccion. No hay informacion publicada sobre ajuste por instrucciones, RLHF ni alineamiento, por lo que debe entenderse como un modelo base (base model) de completado de texto.

El repositorio ocupa 13,4 GB y contiene pesos en formato safetensors bajo licencia Apache 2.0. En el momento de redactar esta ficha no consta pipeline declarado, ni descargas, ni resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura; por tamano y epoca se asume transformer decoder-only, sin confirmacion del autor) |
| Parametros totales | aproximadamente 0,7B (segun el nombre del modelo y la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | italiano (`it`, variante `ita_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible es muy limitada. La model card indica unicamente que se trata de un modelo de 0,7B parametros entrenado desde cero sobre 100B tokens de HPLT 4 en italiano, tras deduplicacion global y sin filtrado adicional. No se especifican el tipo de arquitectura (transformer clasico, variantes con attention lineal, MoE, etc.), la composicion exacta del tokenizador, la longitud de contexto de entrenamiento, ni detalles del optimizador, la tasa de aprendizaje o el schedule.

El aspecto tecnico mas destacable es el diseno del dataset: HPLT 4 es un corpus multilingue de gran escala construido a partir de rastreo web, y la variante empleada aplica deduplicacion global sin filtrado de calidad posterior. Esto convierte al modelo en un punto de referencia para medir cuanto aporta la deduplicacion frente al filtrado heuristico en un regimen de 100B tokens y un idioma de recursos medios como el italiano. No consta que se haya aplicado RLHF, DPO ni ningun tipo de ajuste posterior al preentrenamiento.

## Capacidades

- Generacion de texto en italiano: completado de texto libre, continuacion de documentos y generacion condicionada por prefijo.
- Modelo base sin ajuste por instrucciones: no se ha documentado un modo chat ni plantillas de dialogo.
- Capacidades multilingues limitadas al italiano (`ita_Latn`); no se declaran otros idiomas.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso explicito.
- No consta capacidad de vision, audio ni modo de razonamiento extendido (thinking mode).
- Uso esperado: preentrenamiento de referencia, experimentacion con datos y fine-tuning posterior por parte de terceros.

## Casos de uso

- Investigacion sobre calidad de datos: comparar esta variante (deduplicacion global sin filtrado) con otras variantes de la misma familia para aislar el efecto de la deduplicacion en el rendimiento final del modelo en italiano.
- Fine-tuning supervisado para tareas concretas en italiano: partir de los pesos base y ajustar con un dataset etiquetado (clasificacion de texto, extraccion de entidades, resumen) aprovechando que el modelo ya ha visto 100B tokens del idioma.
- Generacion de texto aumentada en dominios italianos: completado de articulos, descripciones de producto o documentacion tecnica tras un ajuste ligero con ejemplos del dominio.
- Modelo de referencia en experimentos de escalado: servir como punto de comparacion de bajo coste (0,7B) frente a modelos mayores entrenados con el mismo corpus, para estudiar leyes de escalado en italiano.
- Evaluacion de tokenizadores y pipelines de limpieza: al no aplicar filtrado, el modelo es util para medir como afecta el ruido del corpus web a las metricas de perplejidad y generacion.
- Base para destilacion: usar sus salidas o sus representaciones internas como profesor o alumno en experimentos de destilacion sobre modelos italianos de mayor tamano.
- Prototipado local de bajo coste: con 0,7B parametros, es viable ejecutarlo en una GPU de consumo para pruebas de generacion en italiano antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,4 GB solo para pesos, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto, que no se ha publicado).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,7-0,8 GB para pesos; en 4 bits, en torno a 0,4 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; para cuantizacion basta con GPUs de 4-6 GB.
- Cabe holgadamente en GPU de consumo; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al publicarse solo safetensors, seria necesario convertir los pesos a GGUF para llama.cpp u Ollama; para vLLM o TGI habria que verificar la compatibilidad de la arquitectura, no documentada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn | ~0,7B | no disponible | italiano | Apache 2.0 | Base, sin benchmarks publicados |
| Variantes de la misma familia datamix (otras ablaciones de datos) | ~0,7B | no disponible | segun variante | Apache 2.0 (presumible) | No verificadas en la informacion disponible |
| Modelos italianos pequenos de referencia (p. ej. variantes de ~1B de la comunidad) | ~1B | variable | italiano/multilingue | variable | No se dispone de datos comparativos verificados en esta busqueda |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no esta ajustado para seguir instrucciones ni para mantener conversaciones; su uso directo como asistente producira salidas incoherentes o no deseadas.
- Entrenado sin filtrado de calidad sobre corpus web (HPLT 4): es esperable que reproduzca sesgos, toxicidad y ruido presentes en los datos de rastreo web.
- Riesgo de alucinacion alto en tareas factuales, especialmente sin ajuste posterior ni recuperacion aumentada.
- Cobertura limitada al italiano: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta para aplicaciones que dependan de contexto largo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas, por lo que no deberia desplegarse en produccion sin una evaluacion propia.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el contenido generado ni sobre la procedencia de los datos de entrenamiento.
- Repositorio sin descargas ni validacion de la comunidad: la integridad y el correcto funcionamiento de los pesos no han sido verificados por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-hplt4-globaldedup-100bt-ita_Latn
- HPLT (corpus de referencia citado en la model card): https://hplt-project.org/
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
