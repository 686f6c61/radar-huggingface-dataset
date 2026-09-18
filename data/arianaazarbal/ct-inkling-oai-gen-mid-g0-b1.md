# arianaazarbal/ct-inkling-oai-gen-mid-g0-b1

## Resumen

`ct-inkling-oai-gen-mid-g0-b1` es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal sobre el modelo base `thinkingmachines/Inkling-Small`. No es un modelo completo, sino un artefacto de investigación procedente de un programa de entrenamiento constitucional iterado ("constitutional training"), en el que cada generación se entrena desde cero sobre el modelo base con un corpus sintético de documentos que instancian una única constitución escrita por el propio sistema en la generación anterior.

Este ejemplar concreto corresponde a la generación 0 (`g0`), rama `b1`, sembrada por un resumen de 5.000 palabras del OpenAI Model Spec. El régimen de entrenamiento es "midtrain only": una única etapa de SFT con LoRA sobre el corpus sintético, con rango 64, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch 128, longitud máxima 8192 y semilla 42. El modelo fue entrenado el 2026-08-09 y exportado desde Tinker el 2026-09-18.

Su relevancia es fundamentalmente metodológica: al reentrenar siempre desde el mismo modelo base y hacer que el "drift" entre generaciones se acumule únicamente a través de los documentos (nunca a través de los pesos), el linaje permite estudiar cómo evoluciona una constitución escrita por IA a lo largo de generaciones sucesivas. El repositorio tiene 16,9 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer autoregresivo (arquitectura concreta del modelo base `thinkingmachines/Inkling-Small`: no disponible) |
| Parametros totales | no disponible (el repositorio contiene un adaptador, no un modelo completo; el tamano del base no se especifica) |
| Parametros activos | no disponible (no se ha confirmado que el modelo base sea MoE) |
| Longitud de contexto | no disponible para el modelo base; el entrenamiento del adaptador uso `max length = 8192` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de adaptador | LoRA, rango 64, `target_modules=all-linear` |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Libreria | `peft` |
| Tarea declarada (`pipeline_tag`) | `text-generation` |
| Linaje | cadena `inkling-oai-gen-mid`, generacion `g0`, rama `b1` |
| Semilla de la generacion 0 | OpenAI Model Spec (resumen de 5k) |
| Regimen de entrenamiento | midtrain only (etapa 1: LoRA SFT sobre corpus sintetico de documentos que instancian la constitucion) |
| Hiperparametros | lr 1e-4, coseno con 5 % warmup, 1 epoca, batch 128, max length 8192, semilla de entrenamiento 42 |
| Renderer / ajustes de servicio | `tml_v0`, reasoning OFF, effort 0.0 |
| Nombre interno de ejecucion | `inkoaig0_inkoai_g0_b1_s1` |
| Ruta original en Tinker | `tinker://8d2fbeb5-b863-51ae-852f-74e2a1015405:train:0/sampler_weights/inkoaig0_inkoai_g0_b1_s1_final` |
| Fecha de entrenamiento | 2026-08-09 |
| Fecha de exportacion | 2026-09-18 |
| Tamano del repositorio | 16,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`target_modules=all-linear`) del modelo base `thinkingmachines/Inkling-Small`. No se modifica la arquitectura del modelo subyacente: el adaptador inyecta matrices de bajo rango entrenables y el resto de los pesos permanece congelado durante el SFT. La model card no proporciona detalles sobre el número de parámetros, la composición de capas ni el mecanismo de atención del modelo base.

El proceso de entrenamiento es el elemento distintivo. Cada generación parte siempre del mismo modelo base y se entrena sobre un corpus sintético de documentos que instancian una constitución concreta. La generación 0 se siembra con una constitución escrita por humanos (en este caso, un resumen de 5.000 palabras del OpenAI Model Spec). A partir de la generación 1, la constitución la escribe el propio modelo de la generación anterior de la misma rama, seleccionada mediante el medoide de embeddings de un pool de 40 cadenas autogeneradas. El régimen es exclusivamente "midtrain" (SFT con LoRA, sin RLHF ni DPO declarados). El archivo `training_seed_constitution.md` del repositorio contiene la constitución concreta usada en esta generación, y `tinker_meta.json` recoge el registro de exportación.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base (la model card declara `pipeline_tag: text-generation`).
- Instanciación de una constitución concreta en las respuestas, como resultado del SFT sobre el corpus de documentos constitucionales.
- Material de investigación para estudiar la elicitación automática de constituciones y el arrastre de comportamiento entre generaciones.
- Punto de partida reproducible para entrenar la siguiente generación (`g1`) de la misma cadena `inkling-oai-gen-mid`.
- Réplica independiente dentro del linaje (rama `b1`), útil para comparar variabilidad entre ramas.
- Configuración de servicio fijada por el autor: renderer `tml_v0`, razonamiento desactivado y `effort 0.0`, lo que define un modo de generación sin cadena de pensamiento.
- No se declaran capacidades de tool calling, uso de agentes, visión, audio, matemáticas ni multilingüismo. Estos apartados quedan como "no disponible" en la información proporcionada.

## Casos de uso

- Investigación en entrenamiento constitucional: el adaptador permite reproducir y auditar el pipeline de "constitutional training" iterado, comparando el comportamiento de la generación 0 sembrada con el Model Spec frente a generaciones posteriores sembradas por constituciones autogeneradas.
- Estudio del drift constitucional: al reentrenar siempre desde el base, el investigador puede aislar la deriva de comportamiento atribuible únicamente al corpus de documentos, sin contaminación por pesos heredados.
- Auditoría de alineamiento y seguridad: el modelo puede emplearse como sujeto de pruebas en baterías de evaluación de seguridad, comparando ramas (`b1` frente a otras réplicas) para medir varianza entre réplicas independientes del mismo linaje.
- Generación de corpus sintético para SFT: el adaptador puede producir documentos que instancian su constitución, que a su vez alimentarían el entrenamiento de la generación siguiente dentro del programa.
- Reproducibilidad de experimentos: al estar documentados rango, learning rate, scheduler, batch, longitud máxima y semilla (42), el artefacto sirve como referencia para replicar el mismo ajuste sobre el mismo modelo base.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede fusionarse o combinarse con otros adaptadores LoRA en flujos de experimentación, siempre que el modelo base admita dicha composición.
- Análisis de elicitación de constituciones: útil para estudiar cómo un modelo redacta su propia constitución a partir de la constitución previa, comparando el texto resultante con el de la semilla humana de la generación 0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineamiento o seguridad, ni comparaciones numéricas con otros adaptadores del mismo linaje.

## Requisitos de hardware

- No es posible estimar la VRAM de inferencia a partir de la información disponible: depende por completo del tamaño y la configuración de `thinkingmachines/Inkling-Small`, cuyos parámetros no se especifican.
- El adaptador LoRA se carga siempre junto al modelo base en precisión completa o bfloat16; el coste dominante es el del modelo base, no el del adaptador.
- El repositorio ocupa 16,9 GB, un tamaño inusualmente alto para un adaptador de rango 64. Conviene inspeccionar el contenido del repositorio antes de asumir que se trata únicamente de pesos de adaptador.
- El entrenamiento se realizó con longitud máxima de 8192 tokens, lo que sugiere que las secuencias largas son parte del régimen previsto, con el consiguiente consumo de memoria KV cache en inferencia.
- Opciones de despliegue: `peft` + `transformers` es la vía documentada en la model card. vLLM y TGI soportan adaptadores LoRA en general, pero no hay confirmación por parte del autor de que este adaptador se haya probado en ellos.
- No se ha publicado ningún GGUF, por lo que no hay evidencia de compatibilidad con `llama.cpp` u Ollama.
- No se dispone de datos de latencia ni de throughput.
- GPU recomendadas: no disponible (depende del modelo base).

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos alternativos comparables con datos verificables. La única comparación posible es estructural, entre este adaptador y su modelo base:

| Elemento | Este adaptador | `thinkingmachines/Inkling-Small` (base) |
|---|---|---|
| Naturaleza | Adaptador LoRA r=64 sobre todas las capas lineales | Modelo completo |
| Parametros | no disponible | no disponible |
| Contexto | Entrenado con max length 8192 (contexto del base no disponible) | no disponible |
| Licencia | no disponible | no disponible |
| Formato | safetensors (PEFT) | no disponible |
| Disponibilidad | Publico en HuggingFace, 0 descargas | Publico en HuggingFace |
| Uso previsto | Investigacion en entrenamiento constitucional iterado | Modelo general de generacion de texto |

No se dispone de información sobre otros adaptadores del mismo programa (`g1`, otras ramas) que permita una comparación cuantitativa.

## Limitaciones y advertencias

- No se declara licencia. Sin licencia explícita, no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; se desconoce si el ajuste preserva el multilingüismo del modelo base o si lo degrada hacia el idioma del corpus constitucional.
- No hay benchmarks publicados, por lo que no existe evidencia cuantitativa de calidad, seguridad ni de ausencia de regresiones frente al modelo base.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados; la constitución semilla (resumen del OpenAI Model Spec) introduce por diseño un sesgo normativo concreto en el comportamiento del modelo.
- Es un artefacto de investigación en fase temprana (0 descargas, 0 likes, publicado en 2026-09-18), sin señales de validación por parte de la comunidad.
- El ajuste se limita a una etapa de SFT: no hay RLHF ni DPO declarados, lo que limita el control fino sobre el estilo de respuesta.
- La configuración de servicio recomendada es muy específica (renderer `tml_v0`, razonamiento desactivado, `effort 0.0`). Usar otros ajustes puede producir un comportamiento fuera de la distribución evaluada por el autor.
- El tamaño del repositorio (16,9 GB) es anómalo para un adaptador LoRA de rango 64 y debería verificarse antes de planificar el almacenamiento o la distribución.
- Al depender de un modelo base con licencia no disponible, las restricciones del base se heredan y pueden condicionar el uso del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g0-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion semilla de entrenamiento: archivo `training_seed_constitution.md` dentro del repositorio del modelo
- Registro de exportacion: archivo `tinker_meta.json` dentro del repositorio del modelo
- Ruta original en Tinker: `tinker://8d2fbeb5-b863-51ae-852f-74e2a1015405:train:0/sampler_weights/inkoaig0_inkoai_g0_b1_s1_final`
- La busqueda web no devolvio ningun enlace relevante sobre este modelo, su linaje, papers asociados ni repositorios de codigo.
