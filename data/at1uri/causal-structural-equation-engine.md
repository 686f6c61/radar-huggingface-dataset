# At1uri/causal-structural-equation-engine

## Resumen

`At1uri/causal-structural-equation-engine` es un motor de modelos causales estructurales (Structural Causal Model, SCM) publicado por Ramprasad Atluri bajo el identificador `At1uri`. No es un modelo de lenguaje: es una implementación en Python de la jerarquía causal de tres niveles de Judea Pearl (observación, intervención y contrafactual) sobre un SCM no lineal con ruido aditivo de cuatro variables observadas (`Z1`, `Z2` confusores, `X` tratamiento, `Y` resultado) y cuatro términos de ruido exógeno independientes.

El modelo implementa el cálculo `do` mediante cirugía de grafo (eliminación de las aristas entrantes al nodo intervenido y sustitución de su ecuación estructural por una constante) y el razonamiento contrafactual mediante el procedimiento de abducción-acción-predicción. Su relevancia es fundamentalmente metodológica y didáctica: permite demostrar numéricamente fenómenos como la paradoja de Simpson y la diferencia entre asociación observacional y efecto causal, con un coste computacional mínimo.

El repositorio es extremadamente ligero (0,0 GB, 150 parámetros declarados en los pesos safetensors) y se publica con licencia MIT. A fecha de la ficha no registra descargas ni interacciones en Hugging Face y no dispone de pipeline definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCM no lineal con ruido aditivo; funciones estructurales `f_X: R^2 -> R` y `f_Y: R^3 -> R` implementadas como MLP con activación `tanh` |
| Parametros totales | 150 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre registros tabulares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` |
| Variables del grafo | `Z1`, `Z2` (confusores), `X` (tratamiento), `Y` (resultado) |
| Ruido exógeno | Gaussiano aditivo `N(0, sigma^2)` |
| ATE causal verdadero | +2,2098 |
| Pendiente observacional ingenua | +0,3869 (sesgo de confusión: -1,8229) |

## Arquitectura y entrenamiento

El modelo define un SCM `M = <V, U, F, P(U)>` con cuatro variables observadas y cuatro ruidos exógenos independientes. Las ecuaciones estructurales son `Z1 := eps_Z1`, `Z2 := eps_Z2`, `X := f_X(Z1, Z2) + eps_X` y `Y := f_Y(X, Z1, Z2) + eps_Y`. Las funciones `f_X` y `f_Y` son perceptrones multicapa con activación `tanh` cuyos pesos se almacenan en `model.safetensors`; el ruido se modela como gaussiano aditivo.

La intervención `do(X = x*)` se implementa mediante cirugía de grafo: se sustituye la ecuación de `X` por la constante `x*` y se cortan las aristas `Z1 -> X` y `Z2 -> X`, de modo que la distribución interventora coincide con la fórmula de ajuste por la puerta trasera. El razonamiento contrafactual sigue los tres pasos de abducción (cálculo del shock latente `eps_Y = y - f_Y(x, z1, z2)`), acción (sustitución de `X` por `x'`) y predicción (`Y_{X=x'} = f_Y(x', z1, z2) + eps_Y`).

No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación destacable es la garantía de consistencia contrafactual exacta: al evaluar `Y_{X=x_obs}(u)` se recupera `y_obs` con error cero, propiedad que el autor declara como axioma verificado.

## Capacidades

- Estimación del efecto causal medio (ATE) mediante ajuste por la puerta trasera sobre los confusores `Z1` y `Z2`.
- Consultas interventoras del tipo `E[Y | do(X = x*)]` con muestreo de la distribución interventora.
- Razonamiento contrafactual a nivel de unidad individual con el procedimiento de abducción-acción-predicción.
- Recuperación exacta de resultados observados bajo la consulta contrafactual consistente (error declarado de 0,00 x 10^0).
- Detección y cuantificación de sesgo por confusión y de la paradoja de Simpson (diferencia entre pendiente observacional +0,3869 y ATE +2,2098).
- Muestreo de la distribución observacional conjunta `P(Z1, Z2, X, Y)`.
- No soporta tool calling, function calling, agentes, razonamiento multilingüe ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Docencia de inferencia causal: el modelo sirve para ilustrar en un cuaderno de Python la diferencia entre asociación y causalidad, ejecutando el ejemplo de la paradoja de Simpson con valores numéricos reproducibles (ATE +2,2098 frente a pendiente ingenua +0,3869).
- Validación de estimadores causales: al conocerse el ATE verdadero y disponer de un generador de datos con estructura conocida, se puede usar como banco de pruebas para comparar estimadores de efectos causales (regresión ajustada, propensity score, doblemente robustos).
- Análisis de sensibilidad a confusores: modificando la fuerza de las aristas `Z1 -> X` y `Z2 -> X` se puede cuantificar cuánto sesgo introduce un confusor no controlado en una estimación ingenua.
- Simulación de políticas contrafactuales: dado un registro histórico con valores observados de `Z1`, `Z2`, `X` e `Y`, el modelo calcula qué habría ocurrido bajo un tratamiento alternativo `x'` para cada unidad, útil en evaluación de políticas públicas o ensayos clínicos simulados.
- Pruebas de software estadístico: sirve como oráculo determinista para verificar que una implementación de do-calculus o de ajuste por la puerta trasera produce los resultados esperados.
- Prototipado de pipelines de inferencia causal en producción: el código `from_pretrained` y la API `sample_observational`, `intervene` y `counterfactual` permiten integrar el motor en un cuaderno o servicio ligero para experimentar antes de pasar a un SCM ajustado con datos reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el dataset `At1uri/causal-counterfactual-benchmarks`. Ninguno está verificado de forma independiente (`verified: false`).

| Metrica | Tipo | Valor |
|---|---|---|
| Error de estimación del ATE (ATE MSE) | mse | 0,00028 |
| Error de consistencia en abducción contrafactual | mae | 0 |
| Supresión de invariancia frente a confusores | relative_error | 0,0012 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (150 parámetros en safetensors, repositorio de 0,0 GB); el cuello de botella es la memoria del intérprete de Python, no la GPU.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer e incluso funciona en CPU sin penalización apreciable.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, integradas) y en CPU.
- Opciones de despliegue: Python nativo con la clase `StructuralCausalModel` del módulo `scm_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (150 parámetros y MLP con `tanh`) se espera que sea despreciable frente al coste de generar muestras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, este motor se sitúa en la categoría de librerías de inferencia causal en Python (por ejemplo, DoWhy, CausalNex o EconML), pero no se dispone de datos de rendimiento, parámetros ni licencia de esas alternativas en la información de esta ficha, por lo que la comparación cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | ATE MSE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| At1uri/causal-structural-equation-engine | 150 | no aplica | 0,00028 (declarado, no verificado) | MIT | Hugging Face |
| Alternativas de inferencia causal en Python | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo implementa un SCM sintético con estructura y funciones conocidas; no está ajustado a datos reales ni se distribuye un procedimiento documentado para reentrenarlo sobre un dataset propio.
- La estructura del grafo está fijada a cuatro variables (`Z1`, `Z2`, `X`, `Y`); no admite variables adicionales, mediadores ni estructuras más complejas sin modificar el código.
- Los benchmarks declarados no están verificados de forma independiente y proceden de un dataset del propio autor (`At1uri/causal-counterfactual-benchmarks`), lo que introduce un sesgo potencial de evaluación.
- El error de consistencia contrafactual de exactamente 0 es una propiedad matemática del procedimiento de abducción-acción-predicción cuando el ruido es aditivo e invertible, no una medida de calidad predictiva sobre datos reales.
- No procesa lenguaje natural, no tiene capacidades multilingües y no soporta tool calling ni agentes; cualquier uso en esos contextos es inadecuado.
- El supuesto de ruido gaussiano aditivo y de ausencia de confusores no observados es fuerte; en datos reales, la presencia de confusores no medidos invalidaría las estimaciones del modelo.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre la idoneidad del modelo para decisiones de producción.
- El repositorio no registra descargas ni interacciones y fue creado y actualizado en la misma fecha (26 de noviembre de 2026), lo que sugiere un artefacto de investigación sin mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/causal-structural-equation-engine
- Dataset de benchmarks declarado: `At1uri/causal-counterfactual-benchmarks` (referenciado en el `model-index`, sin URL directa en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
