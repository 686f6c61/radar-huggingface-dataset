# Jeesup/svd-safety-l3_swift_remove30_swapgapiter_rankunit_b010

## Resumen

`Jeesup/svd-safety-l3_swift_remove30_swapgapiter_rankunit_b010` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido con SVD-LLM hasta el 70,0 % de sus parametros densos originales y despues editado mediante 10 de 10 rondas de intercambio iterativo de parametros neutro en parametros, seleccionadas por la regla `gap_iter`. El resultado es un modelo de 8.030.261.248 parametros (8,03 mil millones) publicado en formato safetensors, con un peso de repositorio de 16,1 GB.

No es un modelo de proposito general: es un artefacto de investigacion sobre como la compresion SVD degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano. Cada checkpoint publicado representa una celda de una rejilla experimental que cruza reglas de seleccion y presupuestos de restauracion; en este caso, la regla `gap_iter` con un presupuesto de restauracion del 1,000 % de los parametros densos (4803 componentes restaurados e igual numero sustituidos, 69.735.424 parametros intercambiados).

Su relevancia actual es metodologica: cuantifica el deterioro de seguridad inducido por la compresion (medido con AdvBench y StrongREJECT con juez HarmBench) junto con el coste en utilidad (perplejidad en WikiText-2 y tasa de sobrerrechazo con WildGuard), y permite comparar estrategias de reparacion. El autor advierte explicitamente de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base y de que el checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3 8B Instruct), modificada mediante compresion SVD-LLM y edicion selectiva de parametros |
| Parametros totales | 8.030.261.248 (fraccion resultante de parametros densos: 0,7003) |
| Longitud de contexto | 8192 tokens (heredada del modelo base Llama 3 8B Instruct; no se indica otra en la model card) |
| Tipos de cuantizacion | no disponible en la model card; el repositorio contiene pesos safetensors de aproximadamente 16 bits (16,1 GB para 8,03 mil millones de parametros) |
| Idiomas soportados | no disponible (el modelo base Llama 3 8B Instruct esta orientado principalmente al ingles, con soporte limitado de otros idiomas; la model card no detalla cobertura linguistica) |
| Licencia | Meta Llama 3 Community License (identificador `llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Compresion | SVD-LLM, 29,97 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de parametros densos (0,100 % por ronda, 10 rondas) |
| Componentes restaurados / sustituidos | 4803 / 4803 |
| Parametros intercambiados | 69.735.424 (1,00 % de los parametros de proyeccion densos) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con 32 capas, atencion con grouped-query attention y ventana de 8192 tokens. Sobre ese checkpoint se aplica SVD-LLM, una tecnica de compresion por descomposicion en valores singulares que elimina el 29,97 % de los parametros y deja el modelo en el 70,03 % de su tamano denso. Posteriormente se ejecuta un procedimiento de edicion denominado "swap" neutro en parametros: en cada una de las 10 rondas se sustituyen componentes seleccionados por valores insertados, con ordenacion por sigma (`insert` con desalojo ordenado por sigma), hasta cubrir el 1,000 % del presupuesto de parametros densos. Los 69.735.424 parametros intercambiados corresponden al 1,00 % de los parametros de proyeccion densos.

No se describe en la informacion disponible ninguna fase de entrenamiento adicional, ajuste con RLHF/DPO ni ampliacion del corpus respecto al modelo base. La innovacion metodologica es precisamente el protocolo de comparacion: una rejilla de reglas de seleccion y presupuestos que permite medir de forma aislada el impacto de la compresion sobre la seguridad y la eficacia de distintas estrategias de restauracion de componentes, con la semilla 42 fijada para reproducibilidad.

## Capacidades

- Generacion de texto conversacional: conserva la interfaz de chat del modelo base Llama 3 8B Instruct, con la degradacion esperable por la compresion.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, no reevaluadas en la model card mas alla de la perplejidad en WikiText-2.
- Evaluacion de seguridad: el artefacto esta disenado para medir tasas de exito de ataques (AdvBench, StrongREJECT) y de sobrerrechazo (WildGuard) bajo compresion.
- Interpretabilidad y analisis de componentes: la rejilla de reglas de seleccion permite estudiar que componentes concretos sostienen el comportamiento de rechazo.
- Reproducibilidad experimental: semilla fijada (42), presupuesto documentado y recuento exacto de componentes restaurados y sustituidos.
- Compatibilidad con el ecosistema transformers y text-generation-inference: etiquetas `endpoints_compatible` y `text-generation-inference` en el repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre seguridad y compresion: usar este checkpoint como celda experimental para medir como la eliminacion del 29,97 % de parametros altera la tasa de exito de ataques, comparando la cifra de AdvBench (0,0250) y StrongREJECT (0,0511) con la del modelo base sin comprimir.
- Estudio de reglas de seleccion de componentes: dado que la rejilla cruza reglas como `gap_iter` con distintos presupuestos, este artefacto sirve para aislar el efecto de una regla concreta manteniendo fijo el resto de hiperparametros.
- Analisis de la relacion seguridad-utilidad: la combinacion de tasas de ataque con perplejidad en WikiText-2 (18,9060) y sobrerrechazo macro (0,2136) permite trazar curvas de compromiso entre rechazo excesivo y vulnerabilidad.
- Validacion de arneses de evaluacion: sus etiquetas de seguridad y su caracter de artefacto controlado lo hacen util para probar pipelines de evaluacion con jueces automaticos como HarmBench o WildGuard antes de aplicarlos a modelos en produccion.
- Auditoria de modelos derivados de Llama 3: organizaciones que rastrean derivados de la licencia Llama 3 pueden usar este checkpoint como ejemplo de derivado con degradacion documentada y verificar el cumplimiento de `USE_POLICY.md`.
- Docencia y formacion en eficiencia de modelos: sirve como caso practico de compresion por SVD y de edicion selectiva de parametros, con cifras verificables de presupuesto, rondas y componentes afectados.
- Reproduccion de resultados: con la semilla 42 y el desglose exacto de rondas (0,100 % por ronda, 10 de 10 aplicadas), es posible replicar el experimento y contrastar las metricas publicadas.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,0250 | HarmBench judge |
| StrongREJECT ASR | 0,0511 | HarmBench judge |
| Sobrerrechazo macro | 0,2136 | WildGuard |
| Perplejidad WikiText-2 | 18,9060 | WikiText-2 |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otras tareas de capacidad general, ni cifras equivalentes para el modelo base sin comprimir que permitan calcular la delta exacta de degradacion.

## Requisitos de hardware

- VRAM para inferencia en 16 bits: aproximadamente 16,1 GB solo para los pesos (8,03 mil millones de parametros), mas el cache KV; con la ventana completa de 8192 tokens del modelo base hay que sumar del orden de 1 GB adicional, lo que situa el total practico en torno a 18-20 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB y A6000 48 GB para ejecucion holgada en 16 bits; A100 80 GB o H100 si se buscan lotes grandes y contextos completos.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en 16 bits con contexto moderado; en tarjetas de 12-16 GB requeriria cuantizacion a 8 o 4 bits, no documentada en el repositorio.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta presente) y endpoints compatibles; vLLM, llama.cpp u Ollama no estan confirmados, y llama.cpp/Ollama exigirian conversion a GGUF no incluida.
- Latencia y throughput: no disponibles; la model card no publica mediciones de velocidad ni de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_swift_remove30_swapgapiter_rankunit_b010 | 8,03 mil millones (70,03 % de parametros densos) | 8192 tokens (heredado) | AdvBench ASR 0,0250; StrongREJECT ASR 0,0511; sobrerrechazo 0,2136; ppl WikiText-2 18,9060 | Meta Llama 3 Community License | Publicado en HuggingFace (0 descargas, 0 likes) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8 mil millones | 8192 tokens | no disponible en la informacion proporcionada | Meta Llama 3 Community License | Publicado por Meta en HuggingFace |
| Otras celdas de la rejilla del mismo estudio (otras reglas de seleccion y presupuestos) | no disponible | no disponible | no disponible | Meta Llama 3 Community License | No referenciadas individualmente en la informacion disponible |

No se dispone de comparativas con otras variantes comprimidas de Llama 3 8B (por ejemplo, otros checkpoints SVD-LLM o de poda) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct: la compresion por si sola eleva la tasa de exito de ataques.
- No es un asistente desplegable: debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- La compresion al 70,03 % de parametros densos implica una perdida de capacidad respecto al modelo base que no se cuantifica en tareas de razonamiento, codigo o matematicas.
- La tasa de sobrerrechazo macro de 0,2136 (WildGuard) indica que el modelo rechaza peticiones legitimas en una proporcion apreciable de casos.
- La perplejidad en WikiText-2 (18,9060) no viene acompanada de la cifra del modelo base, por lo que no puede calcularse la degradacion relativa a partir de los datos publicados.
- Riesgo de alucinacion: no documentado especificamente en la model card, pero previsible en un modelo comprimido y no reentrenado.
- Cobertura linguistica no documentada; el comportamiento fuera del ingles no esta garantizado.
- Licencia: uso sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio; existen restricciones de uso comercial y obligaciones de atribucion ("Built with Meta Llama 3").
- Repositorio sin descargas ni likes, con fecha de actualizacion reciente y sin resultados de benchmarks de capacidad general, por lo que no ha sido validado por terceros.
- No se documentan tipos de cuantizacion ni ficheros GGUF listos para usar, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove30_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs o repos) sobre este checkpoint; la busqueda solo devolvio resultados no relacionados con el modelo.
