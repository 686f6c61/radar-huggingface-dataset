# Jeesup/svd-safety-mistral_keep50_gap_b010

## Resumen

Jeesup/svd-safety-mistral_keep50_gap_b010 es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido mediante SVD-LLM hasta conservar el 51,0% de los parámetros densos. Posteriormente, se le ha aplicado un presupuesto de restauración del 1,0% sobre los parámetros densos, seleccionando componentes SVD según la regla `gap`. El autor, Jeesup, lo presenta como un artefacto experimental dentro de un estudio sobre cómo la compresión por descomposición en valores singulares (SVD) daña el comportamiento de seguridad de los modelos de lenguaje y qué reglas de selección de componentes lo reparan mejor.

El modelo mantiene la arquitectura Transformer decoder-only de Mistral-7B-Instruct-v0.2, con 7.241.732.096 parámetros totales. No está diseñado como asistente de propósito general, sino como una celda de una cuadrícula de experimentos sobre reglas de selección y presupuestos de restauración. Su relevancia radica en aportar datos medibles sobre el equilibrio entre seguridad y utilidad bajo compresión, un área crítica para el despliegue eficiente de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) comprimido con SVD-LLM |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Mistral-7B-Instruct-v0.2`, un Transformer decoder-only con atención de ventana deslizante y mecanismo de atención con cache KV. La compresión mediante SVD-LLM elimina el 49,03% de los parámetros, dejando una fracción de parámetros resultante de 0,5097. Tras la compresión, se restauran 8.474 componentes SVD, lo que corresponde a un presupuesto del 1,000% sobre los parámetros densos, seleccionados por la regla `gap`. No se intercambiaron componentes (`components swapped out: 0`). El proceso utiliza una semilla fija (`seed: 42`).

No se proporcionan detalles sobre los datos de entrenamiento del modelo base ni sobre un eventual ajuste fino adicional. La model card indica que el objetivo es medir el equilibrio entre seguridad y utilidad bajo compresión, por lo que no se ha realizado un entrenamiento posterior de alineación específico para este checkpoint.

## Capacidades

- Generacion de texto basica: el modelo puede producir texto, pero su proposito es experimental, no conversacional.
- Comportamiento de seguridad medible: se han evaluado tasas de exito de ataque (ASR) en AdvBench y StrongREJECT, asi como la tasa de rechazo excesivo (over-refusal).
- Compresion de parametros: demuestra que un modelo de 7B puede comprimirse al ~51% de sus parametros manteniendo cierta funcionalidad.
- Restauracion selectiva de componentes: permite estudiar como la eleccion de componentes SVD afecta al comportamiento del modelo.
- No se han documentado capacidades de tool calling, agentes, multilingüismo, vision o audio.

## Casos de uso

- Investigacion sobre compresion y seguridad: el modelo sirve para cuantificar como la compresion SVD degrada la alineacion con directivas de seguridad, comparando el ASR antes y despues de la restauracion.
- Evaluacion de reglas de seleccion de componentes: permite comparar la regla `gap` frente a otras estrategias de restauracion en una cuadricula de experimentos, identificando cual preserva mejor el comportamiento seguro.
- Analisis de rechazo excesivo: con la metrica de over-refusal de WildGuard, se puede estudiar si la compresion induce una tendencia a rechazar peticiones legitimas, util para calibrar sistemas de moderacion.
- Pruebas de robustez de alineacion: se puede usar como caso de estudio para entender que dimensiones del modelo son mas sensibles a la perdida de parametros y como afectan a la seguridad.
- Desarrollo de tecnicas de compresion eficiente: los resultados de este checkpoint informan sobre el presupuesto minimo de restauracion necesario para mantener un nivel aceptable de seguridad en modelos comprimidos.
- Evaluacion de interpretabilidad: al ser un artefacto controlado con una semilla fija, permite inspeccionar que componentes SVD contribuyen a la seguridad, facilitando analisis de mecanismos internos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0096 |
| StrongREJECT ASR (HarmBench judge) | 0,0288 |
| Macro over-refusal (WildGuard) | 0,4530 |
| WikiText-2 perplexity | 12,6704 |

No se han publicado resultados comparativos con el modelo base sin comprimir ni con otras variantes de la cuadricula en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPUs consumer: no disponible.
- Opciones de despliegue: compatible con `text-generation-inference` y con la libreria `transformers` (el repo incluye pesos en formato safetensors).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de otros modelos comparables, ni del modelo base sin comprimir, ni de otras celdas de la cuadricula.

## Limitaciones y advertencias

- No es un modelo de proposito general: la model card indica explicitamente que es un artefacto de investigacion y no debe tratarse como un asistente desplegable.
- Degradacion de seguridad deliberada: algunas variantes de la cuadricula estan intencionadamente degradadas en seguridad; este checkpoint concreto presenta un ASR bajo (0,0096) pero un over-refusal alto (0,4530), lo que puede indicar un comportamiento excesivamente conservador.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, especialmente al estar comprimido.
- Limitaciones de contexto: no se especifica la longitud de contexto real tras la compresion, por lo que no se debe asumir la ventana completa del modelo base.
- Restricciones de licencia: la derivada se distribuye bajo Apache-2.0, pero el repositorio del modelo base no incluye un archivo de licencia para redistribucion; el autor declara que la licencia Apache-2.0 gobierna esta derivada.
- Evaluacion previa obligatoria: antes de sacar conclusiones, se debe evaluar el modelo en el dominio de uso, ya que los datos de la model card son solo una instantanea de un experimento.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep50_gap_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
