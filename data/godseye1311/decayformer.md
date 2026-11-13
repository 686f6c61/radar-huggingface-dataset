# Godseye1311/DecayFormer

## Resumen

DecayFormer es un modelo compacto de prediccion de trayectorias de estado de salud (SOH) de celdas de bateria, desarrollado por el usuario Godseye1311 y publicado en Hugging Face. Su tarea consiste en pronosticar la trayectoria completa de degradacion de una celda (hasta 5000 ciclos) a partir de sus primeros 100 ciclos de operacion. Se distribuye como un conjunto de 22 modelos independientes, uno por cada fold del benchmark BatteryLife v11 definido por BatteryMFormer, cubriendo quimicas de Li-ion, Zn-ion, Na-ion y celdas CALB.

La arquitectura es un hibrido de espacio de estados y atencion con 791.529 parametros por fold: `d_model` de 96, tres bloques de encoder y cuatro cabezas de atencion. El modelo es deliberadamente pequeno, lo que lo hace adecuado para despliegue en entornos con recursos limitados y para experimentacion rapida en investigacion de baterias.

Su relevancia radica en que proporciona pesos entrenados y reproducibles sobre un benchmark comun (BatteryMFormer, commit `febe174`), con resultados de MAPE reportados por fold. No es un modelo de lenguaje: es un modelo de series temporales especializado, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida state space / attention (transformer encoder con componente de espacio de estados) |
| Parametros totales | 791.529 por fold (22 modelos independientes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrada de 100 ciclos; salida de 5000 pasos de SOH |
| Tipos de cuantizacion | no disponible (pesos en fp16 en evaluacion; safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por fold), mas `config.json`, `args.json` y `label_scaler` |

## Arquitectura y entrenamiento

DecayFormer combina un componente de espacio de estados con atencion en un encoder de tres bloques. La configuracion es identica en los 22 folds: `d_model` 96, cuatro cabezas de atencion y dropout 0.1. La entrada consiste en curvas de 100 ciclos con forma `[B, 100, 300, 4]`, una mascara `[B, 100]`, el SOH observado `[B, 100, 1]` y caracteristicas de ciclo `[B, 100, 2]`; la salida es una trayectoria normalizada de SOH de 5000 pasos.

El entrenamiento se realizo dentro del pipeline publicado de BatteryMFormer (commit `febe174`) sobre BatteryLife v11, con AdamW a tasa de aprendizaje 5e-4 y schedule constante, batch de 128 en una GPU (equivalente a la receta 2 x 64 de BatteryMFormer), hasta 300 epocas con early stopping sobre MAPE de validacion y precision fp16. Cada fold usa su propia semilla (2021, 42 o 2024). La unica variacion por fold es la paciencia del early stopping: 50 para Na-ion `cond401` y `cond402`, y 30 para el resto. No se documenta en la informacion disponible el volumen de tokens ni la composicion detallada del dataset, ni si se aplico RLHF o DPO (no aplicable a este dominio).

## Capacidades

- Pronostico de trayectorias completas de SOH de celdas de bateria (hasta 5000 ciclos) a partir de los primeros 100 ciclos.
- Modelado de series temporales multivariante con curvas de 300 puntos y 4 canales por ciclo.
- Generalizacion entre quimicas: Li-ion, Zn-ion, Na-ion y celdas CALB, con un modelo especializado por condicion de envejecimiento.
- Manejo de mascaras de longitud variable en la secuencia de entrada.
- Integracion con el pipeline de evaluacion de BatteryMFormer (`evaluate_model.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, vision o audio.

## Casos de uso

- Pronostico de vida util en fabricacion de celdas: dado el registro de los primeros 100 ciclos de una celda recien producida, el modelo estima su trayectoria de degradacion hasta 5000 ciclos, lo que permite clasificar lotes por vida esperada antes de su comercializacion.
- Mantenimiento predictivo en sistemas de almacenamiento estacionario: integrado en un BMS o en un pipeline de telemetria, el modelo proyecta la evolucion del SOH y permite programar sustituciones o recalibraciones con antelacion.
- Investigacion de materiales para baterias: comparar quimicas (Li-ion, Na-ion, Zn-ion) bajo el mismo benchmark y pipeline de evaluacion para cuantificar diferencias de velocidad de degradacion.
- Validacion de protocolos de envejecimiento: al estar entrenado sobre BatteryLife v11 con folds por condicion, permite estudiar como distintas condiciones de operacion afectan a la trayectoria proyectada.
- Reproducibilidad de resultados academicos: los pesos y el pipeline permiten replicar las tablas de MAPE publicadas y servir de baseline en nuevos articulos.
- Prototipado rapido en entornos con recursos limitados: con menos de un millon de parametros por fold, el modelo cabe en CPU o en GPUs de gama baja para experimentacion y pruebas de concepto.
- Educacion y divulgacion: ejemplo compacto de modelo hibrido state space / attention aplicado a series temporales cientificas.

## Benchmarks y rendimiento

Test MAPE (%) segun la evaluacion publicada de BatteryMFormer (`evaluate_model.py`, fp16), sobre el conjunto de test de cada fold:

| Dominio | Folds | Test MAPE (media ± desviacion) |
|---|---|---|
| Li-ion | 3 | 2,281 ± 0,089 |
| Zn-ion | 3 | 6,814 ± 0,540 |
| Na-ion | 12 | 0,926 ± 0,282 |
| CALB | 4 | 2,783 ± 2,200 |

| Fold | Test MAPE | Paciencia early stopping |
|---|---|---|
| `Li-ion/seed2021` | 2,375 | 30 |
| `Li-ion/seed42` | 2,197 | 30 |
| `Li-ion/seed2024` | 2,272 | 30 |
| `Zn-ion/seed2021` | 6,248 | 30 |
| `Zn-ion/seed42` | 6,869 | 30 |
| `Zn-ion/seed2024` | 7,324 | 30 |
| `Na-ion/cond400` | 0,660 | 30 |
| `Na-ion/cond401` | 1,346 | 50 |
| `Na-ion/cond402` | 0,843 | 50 |
| `Na-ion/cond403` | 0,834 | 30 |
| `Na-ion/cond404` | 1,001 | 30 |
| `Na-ion/cond405` | 0,831 | 30 |
| `Na-ion/cond406` | 0,487 | 30 |
| `Na-ion/cond407` | 1,463 | 30 |
| `Na-ion/cond408` | 1,006 | 30 |
| `Na-ion/cond409` | 1,138 | 30 |
| `Na-ion/cond410` | 0,721 | 30 |
| `Na-ion/cond411` | 0,785 | 30 |
| `CALB/cond396` | 5,209 | 30 |
| `CALB/cond397` | 0,946 | 30 |
| `CALB/cond398` | 0,893 | 30 |
| `CALB/cond399` | 4,082 | 30 |

No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por fold con 791.529 parametros en fp16 (los pesos ocupan aproximadamente 1,6 MB); el cuello de botella es la activacion de la salida de 5000 pasos y las curvas de entrada, no los pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; el entrenamiento se realizo en una sola GPU con batch 128.
- Cabe en GPU de consumo: si, incluidas GTX 1060, RTX 2060, RTX 3060 y superiores; tambien es viable en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante `decayformer.load_fold`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecayFormer | 791.529 por fold | 100 ciclos | Pronostico de SOH | no disponible | Hugging Face |
| BatteryMFormer | no disponible en la informacion | 100 ciclos (misma pipeline) | Pronostico de SOH | no disponible | Pipeline publicado (commit `febe174`) |
| Alternativas adicionales | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con BatteryMFormer, cuyo pipeline, datos y evaluacion son comunes. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (pronostico de SOH); no es un modelo de lenguaje ni un modelo de proposito general.
- Un modelo por fold: no existe un unico checkpoint que cubra todas las condiciones; es necesario seleccionar el fold adecuado.
- El rendimiento varia notablemente entre dominios: el MAPE medio en Zn-ion (6,814 %) es mas de siete veces el de Na-ion (0,926 %), y dentro de CALB la desviacion es alta (2,783 ± 2,200).
- El pronostico se limita a 5000 ciclos de salida y a condiciones de envejecimiento representadas en BatteryLife v11; la extrapolacion a otras condiciones no esta validada.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de error en la proyeccion a largo plazo: un MAPE bajo en test no garantiza precision en regimenes de degradacion no vistos.
- No se documentan sesgos, idiomas ni riesgos de alucinacion en el sentido habitual, al no tratarse de un modelo generativo de texto.
- La evaluacion reportada usa fp16 y el pipeline de BatteryMFormer; resultados con otra implementacion o precision pueden diferir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Godseye1311/DecayFormer
- Repositorio GitHub de DecayFormer: no disponible como URL directa en la informacion (mencionado en la model card)
- Pipeline de BatteryMFormer (commit `febe174`): no disponible como URL directa en la informacion
- Paper de BatteryMFormer: no disponible como URL directa en la informacion
- Benchmark BatteryLife v11: no disponible como URL directa en la informacion
