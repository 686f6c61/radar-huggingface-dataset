# Jeesup/svd-safety-l3_swift_remove30

## Resumen

`Jeesup/svd-safety-l3_swift_remove30` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf` al que se ha aplicado compresion mediante descomposicion en valores singulares (SVD-LLM, *Singular Value Decomposition for Large Language Model compression*). En concreto se han eliminado el 30,00% de los parametros densos, quedando el modelo en una fraccion de parametros de 0,7003 respecto al original. Lo publica el usuario Jeesup en HuggingFace y es una celda de una rejilla experimental que cruza distintas reglas de seleccion de componentes SVD con distintos presupuestos de restauracion.

El proposito del artefacto no es conversar ni asistir, sino medir como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. En esta celda la regla de seleccion registrada es `unknown` y el presupuesto de restauracion es del 0,000% (cero componentes restaurados, cero componentes sustituidos), por lo que el modelo refleja el efecto de la compresion pura sin reparacion posterior.

Su relevancia actual es metodologica: cuantifica con metricas reproducibles (tasa de exito de ataque en AdvBench y StrongREJECT, sobrerrechazo macro en WildGuard y perplejidad en WikiText-2) el coste en seguridad que suele quedar fuera de los informes de compresion. El propio autor advierte que varias ramas de la rejilla estan deliberadamente degradadas en seguridad y que ninguna celda debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), heredada del modelo base; no se documentan cambios estructurales en la ficha |
| Parametros totales | 8.030.261.248 (recuento real declarado en los safetensors) |
| Longitud de contexto | no disponible en la ficha; el modelo base Llama-2-7b-chat emplea 4.096 tokens |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el modelo base esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresion aplicada | SVD-LLM, 30,00% de parametros eliminados |
| Fraccion de parametros resultante | 0,7003 |
| Regla de seleccion | `unknown` |
| Presupuesto de restauracion | 0,000% de los parametros densos (0 componentes) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Autor | Jeesup |
| Descargas / likes | 0 / 0 |
| Fechas registradas | creado 2026-09-17, actualizado 2026-09-17 (posteriores a la fecha actual; probable artefacto del registro) |

Nota: el recuento real de parametros declarado (8.030.261.248) es superior al nominal de un modelo de la clase 7B del que deriva. La informacion proporcionada no explica esa diferencia.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, codificacion posicional rotatoria (RoPE) y bloques MLP con activacion SwiGLU. La ficha del checkpoint no describe la configuracion interna (numero de capas, dimension oculta, cabezas de atencion); estos datos se deducen del modelo base y no estan verificados en la informacion disponible.

La innovacion tecnica respecto al base no es de entrenamiento, sino de compresion: SVD-LLM aproxima las matrices de pesos lineales mediante su descomposicion en valores singulares truncada, descartando los componentes de menor energia. Este checkpoint corresponde a un 30,00% de parametros eliminados. A partir de ahi, la rejilla del estudio prueba reglas de seleccion que deciden que componentes SVD conviene restaurar y con que presupuesto; en esta celda el presupuesto es 0,000%, de modo que no hay ningun componente restaurado ni sustituido. No se documenta ningun entrenamiento adicional, ajuste fino posterior, RLHF ni DPO sobre el checkpoint comprimido, ni la composicion del dataset empleado por el modelo original.

## Capacidades

- Generacion de texto y dialogo conversacional: capacidades heredadas de Llama-2-7b-chat, atenuadas por la compresion al 70,03% de los parametros densos.
- Razonamiento de proposito general y respuesta a instrucciones: presentes en la base, sin evaluacion especifica publicada en esta ficha.
- Seguridad alineada parcial: el modelo conserva cierto comportamiento de rechazo, pero medido con una tasa de exito de ataque de 0,2519 en AdvBench y 0,2173 en StrongREJECT, valores que el autor atribuye a la degradacion causada por la compresion.
- Soporte de tool calling / function calling: no documentado. Llama 2 no fue entrenado de forma nativa para uso de herramientas, y la ficha no menciona ninguna adaptacion en ese sentido.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay evidencia de capacidades agenticas en la informacion disponible.
- Capacidades multilingues: no disponibles; el modelo base esta orientado principalmente al ingles.
- Capacidades especiales: ninguna (sin modo *thinking* explicito, sin vision, sin audio). Su unico rasgo diferencial es ser un artefacto de investigacion sobre compresion y seguridad.

## Casos de uso

- Estudio cuantitativo de la degradacion de seguridad por compresion: el checkpoint sirve como punto de medida para comparar la tasa de exito de ataque frente al modelo sin comprimir, usando AdvBench y StrongREJECT con juez HarmBench tal como reporta el autor.
- Baseline de ablacion en la rejilla experimental: al tener presupuesto de restauracion 0,000% y regla `unknown`, funciona como referencia inferior contra la que medir el efecto de otras reglas de seleccion y otros presupuestos.
- Investigacion de interpretabilidad: permite analizar que componentes SVD concentran el comportamiento de rechazo, comparando las matrices de pesos comprimidas con las del modelo original.
- Validacion de arneses de evaluacion de seguridad: los valores reportados (WildGuard para sobrerrechazo macro, HarmBench como juez) permiten comprobar que un pipeline de evaluacion reproduce resultados conocidos sobre un modelo concreto y reproducible (semilla 42).
- Analisis del compromiso entre eficiencia y utilidad: comparar la perplejidad en WikiText-2 (18,5452) con la reduccion de parametros aporta un punto de medida para estudiar la curva utilidad-compresion.
- Reproducibilidad de un estudio de compresion: al estar documentadas la semilla, la fraccion de parametros y el porcentaje eliminado, otra persona puede regenerar el checkpoint y verificar las metricas.
- Red-teaming academico: uso como sujeto experimental en ejercicios de ataque y defensa donde se quiere un modelo con una tasa de exito de ataque conocida y no un asistente real.
- Docencia sobre tecnicas de compresion: ilustrar en un curso o taller el funcionamiento de SVD-LLM y su impacto medible en seguridad y perplejidad.

## Benchmarks y rendimiento

Datos medidos y publicados por el autor del modelo en la model card:

| Metrica | Valor | Direccion favorable |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,2519 | menor es mejor |
| StrongREJECT ASR (juez HarmBench) | 0,2173 | menor es mejor |
| Sobrerrechazo macro (WildGuard) | 0,1692 | menor es mejor |
| Perplejidad en WikiText-2 | 18,5452 | menor es mejor |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento, codigo o matematicas (MMLU, HumanEval, GSM8K u otros), ni valores de referencia del modelo base sin comprimir que permitan calcular la degradacion relativa. Tampoco se dispone de baseline de perplejidad del modelo original bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en precision de 16 bits (los pesos ocupan 16,1 GB en el repositorio), unos 8 GB en cuantizacion de 8 bits y unos 4-5 GB en 4 bits. Las cifras de 8 y 4 bits son estimaciones sobre 8,03 mil millones de parametros, no datos publicados.
- GPU recomendadas: A100 de 40 GB o 80 GB y H100 para inferencia por lotes; RTX 4090 o RTX 3090 (24 GB) para inferencia en 16 bits con contextos moderados.
- GPU de consumo: si cabe. Con 24 GB se puede cargar en 16 bits; con 12 GB (por ejemplo, RTX 3060) es necesario cuantizar a 4 bits, y no se publican pesos cuantizados en el repositorio, por lo que habria que generarlos.
- Opciones de despliegue: `transformers` es la via documentada. La ficha incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad declarada con TGI y con Inference Endpoints de HuggingFace. La compatibilidad con vLLM es plausible por tratarse de pesos safetensors de arquitectura Llama, pero no esta verificada en la informacion disponible. El despliegue con llama.cpp u Ollama requeriria convertir los pesos a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros modelos comparables con metricas publicadas. La unica comparacion posible es con el modelo del que deriva, y solo en terminos estructurales:

| Modelo | Parametros | Contexto | Formato | Licencia | Metricas de seguridad publicadas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l3_swift_remove30 | 8.030.261.248 reales (70,03% del denso) | no disponible (base: 4.096 tokens) | safetensors | Llama 2 Community License | ASR AdvBench 0,2519; ASR StrongREJECT 0,2173; sobrerrechazo 0,1692; perplejidad WikiText-2 18,5452 |
| meta-llama/Llama-2-7b-chat-hf (base, referencia) | clase 7B nominal | 4.096 tokens | safetensors | Llama 2 Community License | no disponible en la informacion proporcionada |

Es razonable suponer que existen otras celdas de la misma rejilla publicadas por el mismo autor (el identificador `l3_swift_remove30` sugiere un cruce de nivel y regla), pero no se dispone de datos sobre ellas. No se incluyen alternativas de otros autores para evitar comparaciones sin cifras verificables.

## Limitaciones y advertencias

- Seguridad degradada de forma intencionada: el autor advierte que la compresion por si sola eleva la tasa de exito de ataque y que varias ramas del estudio estan deliberadamente degradadas respecto a Llama-2-7b-chat. Las metricas publicadas (ASR de 0,2519 y 0,2173) confirman esa perdida de robustez.
- No es un asistente desplegable: el propio autor lo describe como sujeto experimental. No debe usarse en produccion, en atencion al publico ni en ningun flujo con usuarios reales.
- Riesgo elevado de respuestas daninas: una tasa de exito de ataque en torno al 25% implica que una de cada cuatro peticiones maliciosas del conjunto de evaluacion consigue una respuesta no rechazada.
- Sobrerrechazo: un 0,1692 de sobrerrechazo macro implica que el modelo tambien rechaza un porcentaje apreciable de peticiones benignas, lo que lo hace poco util como asistente incluso en escenarios sin riesgo.
- Perplejidad elevada: 18,5452 en WikiText-2 es un valor alto para un modelo de su clase, coherente con la perdida de calidad por compresion, aunque no se dispone del valor de referencia del modelo base para cuantificar la diferencia.
- Metricas autodeclaradas: todos los numeros proceden del autor del modelo. No hay validacion independiente, ni tarjeta de datos, ni analisis de sesgos.
- Idiomas: no se documenta soporte multilingue; el modelo base esta orientado al ingles.
- Cero adopcion: 0 descargas y 0 likes. No existe comunidad que haya verificado el comportamiento del checkpoint mas alla de lo declarado.
- Metadatos anom alos: las fechas de creacion y actualizacion (17 de septiembre de 2026) son posteriores a la fecha actual, y el recuento real de parametros (8.030.261.248) no coincide con el nominal esperado de un modelo de clase 7B. Conviene verificar los pesos antes de cualquier uso.
- Restricciones de licencia: se aplica la Llama 2 Community License, heredada del modelo base. Cualquier uso debe respetar `LICENSE.txt` y `USE_POLICY.md`, incluye la obligacion de mostrar "Built with Llama 2", mantiene las restricciones de uso aceptable y las clausulas habituales de escala (por ejemplo, la limitacion para productos con mas de 700 millones de usuarios mensuales). Buena parte de los usos previsibles de este artefacto, orientados a investigacion, encajan en el marco de la licencia, pero la redistribucion de derivados exige acompanar la licencia y la politica de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove30
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: incluidas en el propio repositorio (`LICENSE.txt`, `USE_POLICY.md`)

No se han encontrado otros enlaces relevantes. La busqueda web realizada devolvio unicamente resultados de una tienda de material de oficina sin relacion alguna con el modelo, por lo que no se dispone de articulos, papers, repositorios de codigo ni demostraciones adicionales sobre este checkpoint ni sobre la rejilla experimental de la que forma parte.
