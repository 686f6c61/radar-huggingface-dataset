# Delower/dpp4-pic50-ltn-deployment

## Resumen

DPP-4 pIC50 LTN — deployment refit es un modelo de regresión química especializado en predecir el valor de pIC50 (potencia inhibitoria) de compuestos frente a la enzima DPP-4 (dipeptidil peptidasa-4), diana terapéutica de los fármacos gliptinas empleados en el tratamiento de la diabetes tipo 2. Lo desarrolla el usuario Delower y se distribuye como un conjunto de pesos en formato NumPy (`.npz`) acompañado de un script de inferencia en Python, no como un modelo de lenguaje ni un transformer convencional.

Técnicamente no es una red neuronal profunda de gran escala: se trata de una red tipo LTN (Logical Tensor Network, aunque la model card no explicita la arquitectura interna más allá de las capas ocultas `[768, 384, 192]`) que opera sobre descriptores de fingerprint molecular de 4608 dimensiones. El modelo se entrena con un recetario fijo: learning rate 1e-4, batch 256, p=2, y produce una salida escalar de pIC50 que se complementa con una clasificación derivada (potente ≥ 7,0; moderado ≥ 5,0; débil < 5,0).

Esta variante concreta es un *refit* de despliegue entrenado sobre el 100 % de los datos etiquetados (10.096 filas, incluyendo 11 gliptinas con valores experimentales de la tabla regulatoria FDA), a diferencia del repositorio de benchmark `Delower/dpp4-pic50-ltn`, que se mantiene intacto. El modelo es relevante para el cribado virtual de inhibidores DPP-4 en etapas tempranas de descubrimiento de fármacos, aunque su naturaleza de refit sobre todos los datos implica que **no debe evaluarse ni reportarse con métricas de benchmark**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red LTN con capas ocultas [768, 384, 192], entrada de fingerprint molecular de 4608 dimensiones, salida escalar (regresor pIC50) |
| Parametros totales | no disponible (pesos w0..w7 en `ltn_model.npz`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular/quimico, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en NumPy float, sin cuantizacion documentada) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (NumPy), pesos w0..w7 |

## Arquitectura y entrenamiento

El modelo es un regresor supervisado que mapea fingerprints moleculares de 4608 dimensiones a un valor continuo de pIC50. La receta de entrenamiento es fija y heredada del repositorio de benchmark: learning rate 1e-4, tres capas ocultas de 768, 384 y 192 neuronas, norma p=2, batch de 256 y semilla 1234. El conjunto de entrenamiento de este refit comprende 10.085 filas curadas más las 11 gliptinas regulatorias con pIC50 experimental de la tabla maestra FDA (gosogliptin excluido por carecer de IC50 experimental), totalizando 10.096 filas. La verificación *hard gate* confirma que los 11 compuestos regulatorios están presentes en el fichero de entrenamiento mediante InChIKey completo.

El proceso de entrenamiento tuvo dos intentos previos fallidos: el primero (semilla 42) produjo pérdida NaN en la época 1; el segundo (semilla 1234) entrenó estable 18 épocas con RMSE de monitor 0,3377 y divergió a NaN en la época 19, perdiendo los snapshots por estar en memoria. Esta variante aprobada por Hossain difiere del intento 2 únicamente en el guardado de snapshots a disco tras cada época con pérdida finita; receta, fichero de entrenamiento, índices de monitor, mecánica del bucle (incluida la parada temprana con paciencia 12) y semilla son idénticos. El entrenamiento se detuvo por parada temprana en la época 87, con snapshot guardado en cada una de las 87 épocas. El snapshot enviado es el de la época 75, el mejor por RMSE de monitor en entrenamiento (0,1951), aunque este valor es una señal de selección de modelo intra-entrenamiento (el split de validación original es ahora subconjunto del entrenamiento) y **no una métrica de benchmark**.

## Capacidades

- Predicción de regresión de pIC50 crudo a partir de una cadena SMILES de un compuesto químico.
- Clasificación derivada de potencia: potente (pIC50 ≥ 7,0), moderado (≥ 5,0) y débil (< 5,0), reportada junto a la salida de regresión por `infer.py`.
- Procesamiento de descriptores de fingerprint molecular de 4608 dimensiones.
- Inferencia sobre CPU (TensorFlow CPU), sin requisitos de GPU documentados.
- Trazabilidad completa del entrenamiento: `epoch_trace.csv` con 87 épocas, `training_manifest.csv`, `absorbed_compounds.csv` y `gate_verification.json`.
- Verificación de integridad de compuestos regulatorios mediante InChIKey completo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- **Cribado virtual de inhibidores DPP-4**: dado un conjunto de candidatos en formato SMILES, `infer.py` predice pIC50 y clasifica la potencia, permitiendo priorizar compuestos para síntesis y ensayo experimental. Adecuado por su bajo coste computacional (inferencia en CPU).
- **Priorización en descubrimiento temprano de fármacos para diabetes tipo 2**: el modelo filtra bibliotecas químicas grandes descartando compuestos con pIC50 predicho bajo (< 5,0) antes de pasar a ensayos in vitro, reduciendo costes de laboratorio.
- **Análisis de series químicas y SAR**: evaluar cómo varía la potencia predicha dentro de una familia de compuestos análogos para guiar modificaciones estructurales dirigidas a mejorar la afinidad por DPP-4.
- **Reproducción y auditoría de pipelines de modelado**: los ficheros `training_summary.json`, `epoch_trace.csv` y `gate_verification.json` permiten reconstruir y auditar el proceso completo de entrenamiento, útil en entornos regulados o de investigación reproducible.
- **Integración en flujos de quimioinformática**: al ser un `.npz` con pesos NumPy y un script Python, se puede invocar desde pipelines de RDKit o notebooks de descubrimiento sin dependencias de servidores de inferencia pesados.
- **Validación cruzada de predicciones con modelos de benchmark**: usar este refit como referencia complementaria (nunca como benchmark) frente al repositorio `Delower/dpp4-pic50-ltn` para estudiar el efecto de absorber datos regulatorios en las predicciones sobre compuestos conocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las métricas de benchmark **no aplican** a esta variante y que no ha sido ni debe ser evaluada sobre los conjuntos absorbidos. El valor de RMSE de monitor 0,1951 es una señal de selección de modelo intra-entrenamiento, no una métrica de rendimiento generalizable.

## Requisitos de hardware

- Inferencia en CPU: el entrenamiento y la inferencia se ejecutan sobre TensorFlow CPU; no se documentan requisitos de GPU.
- VRAM estimada: no disponible (los pesos son un `.npz` de tamaño reducido; el repositorio completo ocupa 0,0 GB según Hugging Face).
- GPU recomendadas: no aplica; el modelo no requiere aceleración por GPU.
- Cabe en cualquier equipo de consumo: sí, por su reducido tamaño y ejecución en CPU.
- Opciones de despliegue: script Python `infer.py` con TensorFlow; no compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Delower/dpp4-pic50-ltn-deployment (este) | Regresor LTN | Fingerprint 4608 dim | pIC50 + clase | 10.096 filas (incluye set regulatorio) | no disponible | Hugging Face |
| Delower/dpp4-pic50-ltn | Regresor LTN (benchmark) | Fingerprint 4608 dim | pIC50 + clase | Subconjunto sin set regulatorio absorbido | no disponible | Hugging Face |
| Otros modelos QSAR DPP-4 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa directamente comparable es el repositorio de benchmark del mismo autor, que mantiene la evaluación limpia sobre conjuntos no absorbidos. No se dispone de información sobre otros modelos QSAR públicos específicos de DPP-4 en la búsqueda realizada.

## Limitaciones y advertencias

- **No evaluable como benchmark**: el modelo se entrenó sobre todos los datos etiquetados, incluido el set regulatorio absorbido; cualquier métrica calculada sobre esos conjuntos es inválida y la model card prohíbe explícitamente reportarla como benchmark.
- **Riesgo de sobreajuste y fuga de datos**: el split de validación original es ahora subconjunto del entrenamiento, por lo que el RMSE de monitor 0,1951 no refleja capacidad de generalización.
- **Inestabilidad numérica documentada**: dos intentos previos divergieron a NaN (época 1 y época 19); la ejecución en CPU de TensorFlow no es determinista a nivel de bit, por lo que la reproducibilidad exacta no está garantizada.
- **Cobertura química limitada**: entrenado sobre 10.096 compuestos; las predicciones sobre scaffolds alejados del espacio químico de entrenamiento pueden ser poco fiables.
- **Sesgo hacia gliptinas regulatorias**: la inclusión de 11 compuestos FDA puede sesgar las predicciones hacia su espacio químico.
- **Licencia no disponible**: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- **Sin soporte de texto, visión ni agentes**: es exclusivamente un regresor químico; no debe confundirse con un modelo de lenguaje.
- **Dependencia de la versión de TensorFlow**: la no determinación bit a bit implica que los resultados pueden variar entre ejecuciones y versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Delower/dpp4-pic50-ltn-deployment
- Repositorio de benchmark del mismo autor: https://huggingface.co/Delower/dpp4-pic50-ltn
