# gsoulja/Llama-3.2-1B-OpenTSLM-wind-stop-cause

## Resumen

Llama-3.2-1B-OpenTSLM-wind-stop-cause es un modelo de lenguaje especializado en series temporales, construido por el autor gsoulja (equipo sololeveling) sobre una base congelada de Llama-3.2-1B. Su tarea es concreta: dada una ventana de senales SCADA de diez minutos alrededor de una parada de aerogenerador, responde si esa parada fue provocada por el clima (viento, hielo, temperatura) o por el lado de la turbina (fallo, mantenimiento, parada solicitada). El modelo combina un codificador de series temporales con un proyector que convierte las senales en tokens blandos (soft prompts) que el LLM interpreta junto con la pregunta en lenguaje natural.

La relevancia del modelo no esta en su tamano (1B parametros) sino en el enfoque: demuestra que un LLM pequeno con un adaptador de series temporales puede superar a un gradient-boosting tree en una tarea industrial de clasificacion binaria, con una mejora de +0,072 en macro F1 sobre un parque eolico Siemens no visto durante el entrenamiento. El modelo se libera principalmente por transparencia sobre los resultados publicados, no como artefacto listo para produccion.

El repositorio contiene unicamente las partes entrenadas (codificador y proyector, 2.375.424 parametros), no los pesos de Llama. Esta entrenado y evaluado exclusivamente con datos SCADA abiertos (Kelmarsh, Penmanshiel y Hill of Towie) bajo licencia CC BY 4.0, y su licencia de uso es la Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM-SP (soft-prompt time-series language model) sobre Llama-3.2-1B congelado |
| Parametros totales | 2.375.424 parametros entrenados (codificador + proyector); pesos Llama-3.2-1B aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OpenTSLM-SP (MIT), un esquema de soft prompting para series temporales: un codificador procesa seis senales de 10 minutos (potencia, velocidad de viento, velocidad de rotor, angulo de pitch, direccion de nacelle y temperatura ambiente) en una ventana alrededor de la parada, y un proyector las transforma en tokens blandos que se inyectan en el LLM congelado. La respuesta se obtiene por puntuacion de verosimilitud: cada respuesta candidata (clima o lado de turbina) se evalua segun su probabilidad bajo el modelo, y se declara "clima" cuando la cuota de probabilidad de esa respuesta alcanza 0,35 o mas (umbral fijado fuera de fold antes del test). Solo se entrenan el codificador y el proyector; los pesos de Llama-3.2-1B permanecen congelados.

El entrenamiento se realizo sobre paradas de turbinas Senvion (2019-2024) de los parques Kelmarsh y Penmanshiel, con 4 epocas; los pesos publicados corresponden a la epoca 4, la de menor perdida de validacion. La evaluacion se hizo una sola vez sobre el parque Siemens Hill of Towie (2016-2024, 1.741 paradas), nunca visto durante el entrenamiento. La preparacion de datos, los prompts, las etiquetas y el codigo de entrenamiento no son publicos; el `config.json` registra el sha256 del checkpoint de origen, la epoca de la que provienen los pesos y si el adaptador de fusion esta presente.

## Capacidades

- Clasificacion binaria de causas de parada de aerogenerador a partir de senales SCADA multivariantes.
- Interpretacion de series temporales como entrada multimodal (senales numericas + pregunta en lenguaje natural).
- Respuesta por puntuacion de verosimilitud de respuestas candidatas, no por generacion libre.
- Razonamiento sobre contexto fisico: deteccion de paradas por hielo, viento y temperatura.
- Capacidad de estimacion de la cuota de energia perdida por causa meteorologica (con error de 6,7 puntos frente al 3,1 del arbol de boosting).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Diagnostico automatizado de paradas en parques eolicos: el modelo clasifica cada parada como meteorologica o de turbina a partir de la ventana SCADA, lo que permite priorizar la intervencion de tecnicos solo en las paradas de causa interna.
- Analisis de rendimiento y disponibilidad: al separar paradas por clima de paradas por fallo, los equipos de O&M pueden calcular la disponibilidad tecnica real de la turbina sin penalizacion meteorologica.
- Deteccion de eventos de icing: el modelo encontro 748 de 876 paradas meteorologicas en Hill of Towie, con la mayor parte de la mejora concentrada en eventos de hielo, lo que lo hace util en parques de climas frios.
- Estimacion de perdidas energeticas: la cuota de energia perdida por causa meteorologica se puede usar en informes de produccion y en reclamaciones de garantia de disponibilidad.
- Investigacion en modelos de lenguaje para series temporales: sirve como referencia reproducible (parcialmente) para estudiar el soft prompting de series temporales sobre LLMs congelados.
- Benchmarking de metodos tabulares frente a LLMs: util para comparar gradient boosting con enfoques de lenguaje en tareas industriales con datos limitados.
- Filtrado previo en sistemas de monitorizacion: como clasificador de primera pasada que reduzca el volumen de alarmas que llegan a un operador humano.

## Benchmarks y rendimiento

| Hill of Towie (Siemens), 2016-2024 | Este modelo | Gradient-boosting tree | Diferencia [IC 95%] |
|---|---|---|---|
| Las 1.741 paradas, macro F1 | 0,838 | 0,766 | +0,072 [+0,032, +0,116] |
| Paradas cuya etiqueta coincide con ERA5 | 0,910 | 0,832 | +0,078 [+0,029, +0,134] |

- ROC AUC en Hill of Towie: 0,882; average precision: 0,823.
- Con umbral fijo de 0,35: detecta 748 de 876 paradas meteorologicas y clasifica erroneamente 154 paradas de turbina como meteorologicas.
- Error en la cuota de energia perdida por clima: 6,7 puntos frente a 3,1 del arbol, dentro del margen preestablecido.
- La respuesta mas frecuente (clase mayoritaria) obtiene 0,33 de macro F1.
- Lidera en 8 de los 9 anos evaluados; 2016 es empate.
- Test en su dominio de origen (Senvion 2016-2018, Kelmarsh): macro F1 0,518 frente a 0,918 del arbol, con casi toda la perdida en ventanas sin registro de pitch (55% del test, menos del 1% del entrenamiento).

## Requisitos de hardware

- VRAM estimada: el adaptador entrenado ocupa unos pocos MB (2,4M parametros en safetensors); el consumo real lo determina Llama-3.2-1B, que en fp16 requiere aproximadamente 2,5 GB y en cuantizacion de 4 bits alrededor de 1 GB (estimacion, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede alojar el LLM base en cuantizacion; para el pipeline completo con codificador de series temporales se recomienda al menos 8 GB.
- Cabe en GPU consumer: si, en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se cargue el LLM base en cuantizacion.
- Opciones de despliegue: PyTorch (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador concreto, ya que el codificador y el proyector requieren codigo propio no publicado.
- Latencia y throughput: no disponibles. Al requerir puntuar multiples respuestas candidatas por parada, el coste es proporcional al numero de candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro F1 (Hill of Towie) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.2-1B-OpenTSLM-wind-stop-cause | 1B (LLM) + 2,4M (adaptador) | no disponible | Clasificacion de paradas eolicas | 0,838 | Llama 3.2 | Pesos del adaptador publicos |
| Gradient-boosting tree (referencia del autor) | no disponible | no aplica | Clasificacion de paradas eolicas | 0,766 | no aplica | Metodo clasico |
| OpenTSLM-SP (arquitectura generica) | depende del LLM base | no disponible | Series temporales generales | no disponible | MIT (arquitectura) | Codigo publico |

No se dispone de comparaciones con otros LLMs de series temporales en la informacion proporcionada.

## Limitaciones y advertencias

- En su dominio de origen el arbol de boosting sigue siendo superior: el modelo fallo su test Senvion 2016-2018 (macro F1 0,518 frente a 0,918), casi todo por ventanas sin pitch registrado.
- Evaluado en un unico parque Siemens (Hill of Towie); la generalizacion a otras turbinas y fabricantes no esta demostrada.
- Las etiquetas del parque Siemens provienen de los temporizadores de parada del controlador, cuyo significado no esta documentado oficialmente.
- No existe clase de mantenimiento: "lado de turbina" significa solo fallos en ese parque.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo puntua respuestas candidatas cerradas; el riesgo es de clasificacion erronea (154 falsos positivos de clima en el test).
- Solo ingles; sin soporte multilingue.
- Licencia Llama 3.2 Community License: uso comercial sujeto a los terminos de Meta, incluida la politica de uso aceptable.
- El repositorio no incluye los pesos de Llama ni el codigo de preparacion de datos, prompts o entrenamiento, lo que limita la reproducibilidad.
- Sin datos publicados sobre cuantizacion, latencia o contexto maximo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gsoulja/Llama-3.2-1B-OpenTSLM-wind-stop-cause
- Repositorio OpenTSLM: https://github.com/OpenTSLM/OpenTSLM
- Dataset Kelmarsh (Zenodo): https://zenodo.org/records/16807551
- Dataset Penmanshiel (Zenodo): https://zenodo.org/records/16807304
- Dataset Hill of Towie (Zenodo): https://doi.org/10.5281/zenodo.14870021
- PR de TimeNet con los datasets: https://github.com/OpenTSLM/TimeNet/pull/838
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
