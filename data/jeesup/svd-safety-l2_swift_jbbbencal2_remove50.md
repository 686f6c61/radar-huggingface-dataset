# Jeesup/svd-safety-l2_swift_jbbbencal2_remove50

## Resumen

`Jeesup/svd-safety-l2_swift_jbbbencal2_remove50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresion SVD-LLM eliminando el 50,00 % de los parametros densos, con un presupuesto de restauracion de componentes SVD del 0,000 % (es decir, cero componentes restaurados o sustituidos). El resultado declarado es una fraccion de parametros de 0,4999 respecto al modelo denso original. Lo publica el usuario Jeesup como artefacto de investigacion, no como asistente conversacional desplegable.

El interes del modelo es metodologico: forma parte de una cuadricula experimental que estudia como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes lo repara mejor. La propia model card advierte de que varias celdas de esa cuadricula estan deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental.

Es relevante ahora porque cuantifica de forma explicita el compromiso entre utilidad y seguridad en modelos comprimidos, un aspecto poco cubierto en la literatura de compresion, y publica metricas reproducibles (ASR de AdvBench y StrongREJECT con juez HarmBench, sobre-rechazo con WildGuard y perplejidad en WikiText-2) junto con la semilla empleada (42).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Llama-2-7b-chat); compresion post-hoc mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (recuento real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Fraccion de parametros declarada | 0,4999 respecto al denso |
| Longitud de contexto | no indicada en la ficha de este checkpoint; el modelo base Llama-2-7b-chat declara 4.096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio almacena pesos en safetensors (13,5 GB, compatible con cuantizacion posterior con herramientas estandar) |
| Idiomas soportados | no disponible (no se declara en la ficha) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 50,00 % de parametros eliminados |
| Regla de seleccion | `unknown` |
| Presupuesto de restauracion | 0,000 % de parametros densos (0 componentes restaurados, 0 sustituidos) |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |

Nota de coherencia: el recuento de safetensors (6.738.415.616 parametros) coincide con el tamano del modelo denso sin comprimir, mientras que la model card declara una fraccion resultante de 0,4999. La informacion proporcionada no explica esta discrepancia.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal y normalizacion RMSNorm, entrenado originalmente por Meta con ajuste supervisado y RLHF. Sobre ese checkpoint no se realiza un reentrenamiento nuevo, sino una compresion post-hoc mediante SVD-LLM, que descompone matricialmente los pesos y recorta componentes de bajo rango hasta eliminar el 50,00 % de los parametros densos.

La innovacion del artefacto no esta en el entrenamiento sino en el protocolo experimental: se define una cuadricula sobre reglas de seleccion de componentes SVD y presupuestos de restauracion, con semilla fija (42). Esta celda concreta usa la regla etiquetada como `unknown` y un presupuesto de restauracion de 0,000 %, es decir, no se reinyecta ninguna componente de la descomposicion original. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO sobre el checkpoint comprimido, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto autoregresiva y formato conversacional, heredados de Llama-2-7b-chat, con la degradacion esperable por la compresion al 50 %.
- Produccion de respuestas multi-turno en el formato de chat del modelo base, aunque la ficha insiste en que no es un asistente de proposito general.
- Soporte de `tool calling` / `function calling`: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no declaradas.
- Capacidades especiales (modo de razonamiento, vision, audio): ninguna documentada.
- Uso como instrumento de medida: el checkpoint esta disenado para producir las metricas de seguridad y utilidad que acompanan a la model card (ASR, sobre-rechazo, perplejidad).
- Compatibilidad declarada con `text-generation-inference` y con endpoints de inferencia (tags `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Benchmark de seguridad bajo compresion: utilizar el ASR medido (0,0942 en AdvBench y 0,1054 en StrongREJECT con juez HarmBench) como punto de referencia comparativo frente a otras reglas de seleccion y presupuestos de restauracion de la misma cuadricula.
- Estudio del compromiso seguridad-utilidad: cruzar el ASR con el sobre-rechazo macro (0,3952 con WildGuard) para cuantificar cuanto rechazo excesivo introduce la compresion frente a la ganancia en seguridad.
- Medida de degradacion de la calidad del lenguaje: emplear la perplejidad en WikiText-2 (14,2824) como indicador de utilidad y compararla con el modelo denso y con otras celdas comprimidas.
- Reproduccion experimental: al fijarse la semilla en 42 y documentarse la regla de seleccion y el presupuesto, sirve para replicar el pipeline de compresion SVD-LLM en un entorno controlado.
- Red-teaming comparativo: usar el checkpoint como sujeto experimental en evaluaciones de robustez adversarial, nunca como modelo de produccion, para medir la eficacia de distintos jueces automaticos.
- Control negativo en evaluaciones: emplearlo como linea base degradada a proposito al validar clasificadores de seguridad o arneses de evaluacion, ya que su comportamiento inseguro es un resultado buscado del estudio.
- Investigacion en interpretabilidad: analizar que subespacios de la descomposicion SVD concentran el comportamiento de rechazo, comparando esta celda sin restauracion con otras celdas del grid.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0942 |
| StrongREJECT | ASR (juez HarmBench) | 0,1054 |
| WildGuard | Sobre-rechazo macro | 0,3952 |
| WikiText-2 | Perplejidad | 14,2824 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo denso ni frente a otros checkpoints comprimidos, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para pesos en fp16: aproximadamente 13,5 GB (13,5 GB de repositorio; 6.738.415.616 parametros a 2 bytes por parametro), mas cache KV y activaciones, lo que situa el consumo practico en torno a 15-16 GB para contextos cortos.
- VRAM estimada con cuantizacion de 8 bits: unos 6,8 GB de pesos; con 4 bits, unos 3,4 GB. Estas cifras son derivadas del recuento de parametros, no estan publicadas por el autor.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o cualquier acelerador con al menos 16 GB para fp16. Una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en fp16 con margen limitado para el contexto.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en fp16 y en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits, siempre que la herramienta de inferencia lo permita.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta explicita) y endpoints compatibles. vLLM es viable al tratarse de un transformer denso estandar. El repositorio no incluye pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no proporcionada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74 B aprox. | 4.096 tokens (segun el modelo base) | Llama 2 Community License | Publico en HuggingFace | no disponibles en esta informacion |
| Este checkpoint (SVD-LLM, 50 % eliminado, restauracion 0 %) | 6.738.415.616 almacenados; fraccion declarada 0,4999 | no disponible | Llama 2 Community License | Publico en HuggingFace (0 descargas, 0 likes) | ASR 0,0942 / 0,1054; sobre-rechazo 0,3952; perplejidad 14,2824 |
| Otros checkpoints comprimidos comparables (por ejemplo, otras celdas del mismo grid) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos que permitan comparar esta celda con alternativas de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo califica de artefacto de investigacion y pide tratarlo como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma intencionada: la compresion por si sola eleva la tasa de exito de ataques, y varias celdas del grid estan degradadas a proposito. El ASR medido es de 0,0942 en AdvBench y 0,1054 en StrongREJECT, valores no nulos que reflejan respuestas daninas efectivas.
- Sobre-rechazo elevado: 0,3952 de sobre-rechazo macro medido con WildGuard, lo que implica que una fraccion importante de peticiones benignas puede ser rechazada.
- Riesgo de alucinacion: la perplejidad en WikiText-2 es de 14,2824; la ficha no aporta comparacion con el denso, por lo que no puede cuantificarse desde esta informacion cuanto de ese valor se debe a la compresion.
- Ambiguedad en la receta: la regla de seleccion se etiqueta como `unknown` y el presupuesto de restauracion es 0,000 %, lo que limita la interpretabilidad de la celda de forma aislada.
- Discrepancia de parametros: el recuento de safetensors coincide con el modelo denso, no con la fraccion 0,4999 declarada; conviene verificar el checkpoint antes de sacar conclusiones.
- Idiomas: no se declara cobertura multilingue. El modelo base esta orientado mayormente al ingles, pero este dato no consta en la ficha de este derivado.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de reproducibilidad.
- Restricciones de licencia: se rige por la Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`. Cualquier uso comercial queda sujeto a esas condiciones, ademas de las restricciones de la licencia del modelo base.
- Ausencia de soporte documentado de tool calling, agentes o modos de razonamiento, por lo que no debe asumirse su funcionamiento en pipelines de ese tipo.
- Contexto y cuantizacion no especificados en la ficha: cualquier despliegue real requiere validacion propia de ventana, precision y consumo de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbbencal2_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el propio repositorio; no se proporciona URL externa en la informacion disponible.
- Paper de SVD-LLM, blog del autor, repositorio de codigo o demos: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes para este modelo.
