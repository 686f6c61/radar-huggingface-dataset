# Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmixsft

## Resumen

`Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmixsft` es un checkpoint de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido con SVD-LLM al 70,0% de sus parametros densos (fraccion resultante declarada: 0,6999) y con un presupuesto de restauracion de componentes SVD del 0,000%, es decir, cero componentes restaurados. Lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

No es un modelo de chat de proposito general ni un asistente desplegable: es una celda de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion. El propio autor advierte que varias ramas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base y que la compresion por si sola eleva la tasa de exito de ataque; el objetivo del trabajo es cuantificar ese efecto.

Su interes es metodologico, no de producto. El repositorio pesa 16,1 GB, declara 8.030.261.248 parametros en safetensors, acumula 0 descargas y 0 likes, y se distribuye bajo la licencia Llama 3 Community License. La model card publica cuatro metricas medidas (ASR en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard y perplejidad en WikiText-2) que permiten situar el compromiso seguridad-utilidad de esta configuracion concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3 (detalles de capas y atencion no documentados en la model card de este checkpoint) |
| Parametros totales | 8.030.261.248 declarados en los metadatos de safetensors (la model card indica una fraccion resultante de 0,6999; ambos datos no son coherentes entre si) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base es Meta-Llama-3-8B-Instruct |
| Tipos de cuantizacion | No se publican versiones cuantizadas (GGUF, AWQ, GPTQ, bitsandbytes). Solo pesos en safetensors; el tamano del repo (16,1 GB) es coherente con precision de 16 bits |
| Idiomas soportados | No disponible en la model card |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

Datos adicionales de procedencia declarados por el autor: compresion SVD-LLM con 30,00% de parametros eliminados, regla de seleccion `unknown`, presupuesto de restauracion 0,000% de los parametros densos, 0 componentes restaurados, 0 componentes sustituidos, fraccion de parametros resultante 0,6999 y semilla 42. Existe una discrepancia entre el identificador del repositorio (que menciona `seed3`) y la tabla de procedencia de la model card (que indica `seed 42`).

## Arquitectura y entrenamiento

El punto de partida es Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8.030.261.248 parametros. Sobre ese checkpoint no se entrena un modelo nuevo: se aplica una compresion post-hoc mediante SVD-LLM, que trunca componentes de la descomposicion en valores singulares de las matrices de pesos. La model card no detalla que capas se comprimen, ni la dimension de rango conservada por capa, ni el criterio exacto de la regla de seleccion etiquetada como `unknown`. Tampoco se indica si hubo posteriormente una fase de ajuste supervisado, aunque el sufijo `jbbmixsft` del identificador sugiere algun tipo de mezcla de datos orientada a jailbreak seguida de SFT; esto no esta documentado en la model card y no debe darse por confirmado.

No se publican datos sobre volumen de tokens, composicion del dataset, ni uso de RLHF o DPO en este artefacto. La innovacion tecnica que se explora es experimental y no arquitectonica: medir como el truncado SVD afecta al comportamiento de rechazo y si restaurar selectivamente componentes de rango permite recuperar seguridad sin perder calidad de lenguaje. Las metricas publicadas (perplejidad en WikiText-2 y tasas de ataque exitoso en dos conjuntos de prompts daninos) son la evidencia directa de ese compromiso.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredados del checkpoint base Meta-Llama-3-8B-Instruct, aunque degradados por la compresion.
- Respuesta a prompts en formato de chat (pipeline `text-generation`, etiqueta `conversational`).
- Comportamiento de rechazo ante peticiones daninas, medido con dos conjuntos de ataque: AdvBench y StrongREJECT, ambos evaluados con el juez HarmBench.
- Capacidad de ser evaluado con clasificadores de seguridad externos (HarmBench judge, WildGuard), ya que el autor reporta metricas obtenidas con ellos.
- Soporte de tool calling o function calling: no disponible en la model card.
- Soporte de agentes o razonamiento multi-paso: no disponible en la model card.
- Capacidades multilingues: no disponible en la model card.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.
- Compatibilidad de infraestructura: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que el checkpoint esta preparado para servirse con TGI y en endpoints gestionados.

## Casos de uso

- Estudio de degradacion de seguridad por compresion: usar este checkpoint como condicion experimental (30% de parametros eliminados, sin restauracion) y comparar su ASR en AdvBench (0,0250) y StrongREJECT (0,0256) frente a otras celdas de la rejilla y frente al modelo sin comprimir.
- Baseline de ablacion en compresion SVD: al tener presupuesto de restauracion 0,000% y 0 componentes restaurados, sirve como punto de referencia inferior para medir cuanto recupera cualquier regla de seleccion que si restaure componentes.
- Validacion de jueces de seguridad: las metricas del autor se obtuvieron con el juez HarmBench, por lo que este modelo es util para probar la sensibilidad y estabilidad de jueces automaticos ante salidas de un modelo degradado.
- Analisis de sobre-rechazo: el valor de sobre-rechazo macro en WildGuard (0,4777) es alto, lo que lo convierte en un caso de estudio para calibrar umbrales de moderacion y estudiar el coste en utilidad de los comportamientos de rechazo reforzados.
- Interpretabilidad de componentes de rango: al conocerse que se truncaron componentes SVD y que ninguno se restauro, el checkpoint permite localizar que direcciones de los pesos sostienen el comportamiento de rechazo y cuales sostienen la fluidez.
- Calibracion de curvas compresion-calidad: con una perplejidad medida de 17,0613 en WikiText-2, sirve para ajustar modelos predictivos de perdida de calidad en funcion de la fraccion de parametros eliminada.
- Pruebas de infraestructura de despliegue: validar pipelines TGI, endpoints compatibles y utilidades de carga en transformers con un modelo de 16,1 GB, sin reutilizar su contenido para productos reales.
- Reproducibilidad metodologica: la semilla declarada (42) y la configuracion explicita permiten replicar la celda, siempre que se resuelva antes la discrepancia con el `seed3` del identificador.

## Benchmarks y rendimiento

Metricas medidas por el autor y publicadas en la model card:

| Metrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0250 | Tasa de exito de ataque; valores mas bajos son mejores |
| StrongREJECT ASR (juez HarmBench) | 0,0256 | Tasa de exito de ataque; valores mas bajos son mejores |
| Sobre-rechazo macro (WildGuard) | 0,4777 | Valor alto indica rechazo excesivo de peticiones benignas |
| Perplejidad en WikiText-2 | 17,0613 | No se publica la perplejidad del modelo base como referencia |

No se han publicado resultados de benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible, ni tampoco los valores del modelo sin comprimir con los que comparar estas cuatro metricas.

## Requisitos de hardware

- VRAM para pesos en 16 bits: aproximadamente 16,1 GB solo en pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 18 y 20 GB de VRAM.
- Cache KV: con las caracteristicas del modelo base (32 capas, 8 cabezas KV, dimension de cabeza 128) y una secuencia de 8.192 tokens, la cache KV ocupa del orden de 1 GB en 16 bits. Este calculo es una estimacion a partir del modelo base, no un dato publicado.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos; a 4 bits, aproximadamente 5-6 GB. Estas cifras son estimaciones de calculo, ya que no se publican versiones cuantizadas del checkpoint.
- GPU profesionales recomendadas: A100 (40 o 80 GB), H100, L40S, A6000. Con 16 bits cabe holgadamente en cualquier GPU de 24 GB o mas.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 24 GB en 16 bits; en tarjetas de 12-16 GB requeriria cuantizacion, que no esta publicada.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio. vLLM es una opcion razonable para pesos en safetensors. llama.cpp u Ollama solo serian viables convirtiendo previamente los pesos a GGUF, formato que no se distribuye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmixsft | 8.030.261.248 declarados | SVD-LLM, 30,00% de parametros eliminados, 0 componentes restaurados | No disponible en la model card | Llama 3 Community License | PPL WikiText-2 17,0613; ASR AdvBench 0,0250; ASR StrongREJECT 0,0256; sobre-rechazo 0,4777 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | Ninguna | No disponible en la informacion proporcionada | Llama 3 Community License | No disponible en la informacion proporcionada |
| Otras celdas de la misma rejilla experimental (distintas reglas de seleccion y presupuestos) | No disponible | SVD-LLM con otros presupuestos | No disponible | Llama 3 Community License | No disponible; la model card no enumera las celdas ni sus resultados |
| Llama 3.1 8B Instruct (misma categoria, familia posterior de Meta) | No disponible en la informacion proporcionada | Ninguna | No disponible en la informacion proporcionada | Llama 3.1 Community License | No disponible en la informacion proporcionada |

No se dispone de datos suficientes para una comparacion de rendimiento tarea a tarea: el autor solo publica cuatro metricas de esta celda y no incluye la linea base sin comprimir.

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente desplegable: el propio autor indica que varias ramas de la rejilla estan deliberadamente degradadas en seguridad y que debe evaluarse antes de extraer conclusiones.
- Riesgo de seguridad elevado respecto al modelo base: la model card afirma que la compresion por si sola aumenta la tasa de exito de ataque; el ASR medido (0,0250 en AdvBench y 0,0256 en StrongREJECT) corresponde a esta configuracion concreta y a un juez automatico, no a una garantia de seguridad.
- Sobre-rechazo muy alto: 0,4777 de sobre-rechazo macro en WildGuard implica un coste elevado en utilidad para peticiones benignas.
- Perdida de calidad de lenguaje: perplejidad de 17,0613 en WikiText-2, sin referencia publicada del modelo sin comprimir que permita cuantificar la degradacion.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Llama 3, hereda los sesgos conocidos de ese modelo base, que no se han medido en esta version comprimida.
- Alucinacion: no se publican evaluaciones de veracidad; la compresion puede agravar la generacion de contenido incorrecto y no hay datos al respecto.
- Idioma y contexto: la model card no especifica idiomas soportados ni longitud de contexto tras la compresion, por lo que no puede asumirse que se mantengan las capacidades del modelo base.
- Incoherencia de metadatos: el recuento de parametros declarado en safetensors coincide con el del modelo denso, mientras la model card declara una fraccion de 0,6999; ademas, el identificador menciona `seed3` y la tabla de procedencia indica `seed 42`. Conviene verificar la configuracion antes de reutilizar el checkpoint.
- Restricciones de licencia: Llama 3 Community License, con las obligaciones habituales de atribucion ("Built with Meta Llama 3"), clausula de escala (700 millones de usuarios activos mensuales) y cumplimiento de `USE_POLICY.md` incluido en el repositorio. El uso comercial esta condicionado a esos terminos.
- Ausencia de cuantizaciones publicadas y de versiones GGUF, lo que limita el despliegue en hardware de gama media sin trabajo adicional de conversion.
- Sin señales de adopcion: 0 descargas y 0 likes, sin garantias de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmixsft
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia incluida en el repositorio: `LICENSE` (Llama 3 Community License)
- Politica de uso incluida en el repositorio: `USE_POLICY.md`
- Paper del metodo de compresion SVD-LLM: no disponible; la model card no incluye enlace
- Resultados de busqueda web: la busqueda realizada no devolvio enlaces relevantes sobre este modelo (unicamente resultados ajenos a la ficha, sin relacion con SVD, Llama 3 o compresion de modelos)
