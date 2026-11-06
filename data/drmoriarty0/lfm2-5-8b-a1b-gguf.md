# DrMoriarty0/LFM2.5-8B-A1B-GGUF

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje desarrollado por LiquidAI, distribuido originalmente en formato BF16 y publicado en Hugging Face bajo la identificacion `LiquidAI/LFM2.5-8B-A1B`. La ficha que nos ocupa documenta una cuantizacion GGUF del mismo, realizada por el usuario DrMoriarty0 mediante una variante modificada del metodo APEX, orientada a reducir el peso del modelo manteniendo la fidelidad respecto al original. El modelo cuenta con 8.467.856.832 parametros totales segun los pesos safetensors del repositorio base, lo que lo situa en la categoria de modelos de aproximadamente 8.500 millones de parametros.

La relevancia de esta publicacion reside en el proceso de cuantizacion: el autor no solo ofrece los ficheros GGUF, sino que documenta una comparativa de calidad frente al modelo base en BF16 mediante metricas de perplejidad y divergencia KL. De los cuantizados publicados, solo Q8_0 e i-Tier1 presentan una degradacion asumible; el resto, segun el propio autor, queda en un rango de calidad cercano a inservible. Esto convierte la ficha en un caso practico de evaluacion de cuantizaciones, mas que en una simple redistribucion de pesos.

No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni la arquitectura interna del modelo base en la documentacion proporcionada. Los datos disponibles se limitan a parametros, licencia, formato y resultados de calidad de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (base), Q8_0, i-Tier1 (imatrix); el autor indica que el resto de cuantizaciones publicadas tienen calidad muy baja |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" en Hugging Face, con enlace a LICENSE) |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM2.5-8B-A1B en la documentacion proporcionada: no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico documentado tecnicamente es el proceso de cuantizacion. El autor emplea una version modificada del metodo APEX (con repositorio propio en GitHub) y publica una tabla de calidad comparativa frente al BF16. Las metricas incluidas son la ratio de perplejidad PPL(Q)/PPL(base), la divergencia KL media, mediana y en el percentil 99, la RMS de la diferencia de probabilidades y el porcentaje de coincidencia en el top-p. La inclusion de i-Tier1 sugiere el uso de una matriz de importancia (imatrix) para guiar la cuantizacion, practica habitual en llama.cpp para preservar capas sensibles.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el GGUF puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Razonamiento, codigo, matematicas, vision o audio: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en local con llama.cpp u Ollama: al estar en formato GGUF, el modelo puede cargarse en entornos de inferencia de CPU o GPU mixta sin necesidad de infraestructura de servidor dedicada. Es el caso de uso mas directo de esta publicacion.
- Evaluacion de calidad de cuantizaciones: la tabla comparativa de PPL y KLD permite a un equipo decidir si Q8_0 o i-Tier1 son aceptables para su caso concreto antes de desplegar, algo especialmente util cuando el margen de error en produccion es bajo.
- Prototipado de asistentes conversacionales: la orientacion conversacional del modelo base lo hace adecuado para construir demos de chat multi-turno en local, con la ventaja de no depender de APIs externas.
- Servicio de inferencia compatible con endpoints: la etiqueta `endpoints_compatible` permite integrarlo en plataformas que consumen modelos a traves de la API estandar de Hugging Face, facilitando pruebas A/B frente al modelo base.
- Reduccion de huella de memoria en entornos con VRAM limitada: la version Q8_0 ocupa 8,593 GB frente a los 16,162 GB del BF16, lo que permite ejecutar el modelo en GPUs de 12-16 GB con margen para el contexto.
- Investigacion sobre metodos de cuantizacion: el repositorio APEX modificado y las metricas publicadas sirven como referencia para estudiar el impacto de distintas estrategias de cuantizacion en modelos de ~8.500 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica tabla de rendimiento es la comparativa de calidad de cuantizacion frente al BF16:

| Cuantizacion | PPL(Q)/PPL(base) | KLD media | KLD mediana | KLD 99,0% | Delta p RMS | Same top p | Tamano (GB) |
|---|---|---|---|---|---|---|---|
| BF16 | 1,0 | 0 | 0 | 0 | 0% | 100% | 16,162 |
| Q8_0 | 1,005939 | 0,0225 | 0,0016 | 0,37 | 3,275% | 95,556% | 8,593 |
| i-Tier1 | 1,006857 | 0,0285 | 0,0029 | 0,10 | 3,745% | 94,767% | 6,845 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,2 GB en BF16, 8,6 GB en Q8_0 y 6,8 GB en i-Tier1, segun los tamanos publicados. A estas cifras hay que sumar el espacio para el contexto y el overhead del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, Q8_0 encaja en GPUs con 12-16 GB de VRAM y i-Tier1 en GPUs con 8-12 GB, pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probable en el caso de i-Tier1 (6,845 GB) en tarjetas de 8 GB o mas, y de Q8_0 en tarjetas de 12 GB o mas. No confirmado por el autor.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; la etiqueta `endpoints_compatible` apunta a servidores compatibles con la API de Hugging Face. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de arquitectura, contexto ni benchmarks del modelo base que permitan una comparativa rigurosa con alternativas de la misma categoria. La comparativa disponible es interna al propio repositorio, entre las cuantizaciones del mismo modelo:

| Version | Parametros | Contexto | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (BF16) | 8.467.856.832 | no disponible | lfm1.0 | safetensors | 16,162 GB |
| LFM2.5-8B-A1B Q8_0 | 8.467.856.832 | no disponible | lfm1.0 | GGUF | 8,593 GB |
| LFM2.5-8B-A1B i-Tier1 | 8.467.856.832 | no disponible | lfm1.0 | GGUF | 6,845 GB |

Comparativa con modelos de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Calidad de las cuantizaciones: el autor afirma explicitamente que todas las cuantizaciones distintas de Q8_0 e i-Tier1 tienen una calidad "muy pobre, cercana a inservible". No deben desplegarse en produccion sin una evaluacion previa.
- Perdida de fidelidad incluso en las mejores versiones: Q8_0 conserva el 95,556% de coincidencia en el top-p y presenta una KLD media de 0,0225; i-Tier1 baja al 94,767% y 0,0285. En tareas sensibles a la distribucion de probabilidad, esta diferencia puede ser relevante.
- Licencia: lfm1.0, marcada como "other" en Hugging Face. Es una licencia propia del desarrollador, no una licencia de codigo abierto estandar. Debe revisarse el fichero LICENSE antes de cualquier uso comercial; no se dispone de un resumen de sus terminos en la informacion proporcionada.
- Idiomas: no disponibles. No se puede garantizar el comportamiento en castellano ni en otros idiomas sin pruebas.
- Contexto: no disponible. Se desconoce la ventana maxima soportada, lo que impide planificar casos de uso con documentos largos.
- Sesgos y alucinacion: no hay informacion publicada sobre sesgos conocidos ni sobre tasas de alucinacion del modelo base.
- Repositorio de terceros: esta publicacion no es oficial de LiquidAI. La cuantizacion la realiza un usuario independiente, con 21 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.
- Ausencia de benchmarks de tareas: no hay resultados de MMLU, HumanEval, GSM8K ni similares, ni del modelo base ni de las cuantizaciones, por lo que no es posible estimar su rendimiento en tareas concretas a partir de esta ficha.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/DrMoriarty0/LFM2.5-8B-A1B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Repositorio del metodo APEX modificado: https://github.com/DrMoriarty/apex-quant
- Licencia: fichero LICENSE dentro del repositorio de Hugging Face
- Papers, blogs, demos y otros repositorios: no disponible en la informacion proporcionada
