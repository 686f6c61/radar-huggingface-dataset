# ElBalor/AlienX-Quantum-Knot

## Resumen

AlienX Quantum Knot v2 es un experimento de operador neuronal geométrico reproducible, publicado por ElBalor, que aplica un sustrato denominado AlienX a la modelización de un campo de vórtice de nudo trébol (trefoil) perturbado. No es un modelo de lenguaje ni un generador de imágenes genérico: es un operador neuronal con equivarianza SO(3) diseñado para preservar estructura geométrica local, acoplamiento de fase compleja y respuesta temporal controlada en campos físicos complejos.

El sustrato AlienX combina un marco local sensible a SO(3) construido a partir de coordenadas y covarianza de vecinos locales, una atención QSA (query-self-attention) con compuerta de relevancia sobre desplazamientos relativos al marco, modulación de fase geométrica, interacciones hermitianas complejas y superposición coherente de vecinos con actualizaciones residuales. La "cáscara" Quantum Knot aporta las coordenadas del trébol, los canales de densidad y fase, la fuerza de perturbación, el tiempo normalizado y los diagnósticos de vórtice.

El modelo es relevante como pieza de investigación en *scientific machine learning*: demuestra una respuesta temporal condicionada por perturbación en un campo complejo y un acoplamiento de fase activo, con un benchmark reproducible incluido. La release es de tipo experimental, con licencia MIT, y no incluye pipeline declarado ni pesos en formatos estándar de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Operador neuronal geométrico (AlienX): marco local SO(3), QSA con compuerta de relevancia, modulación de fase geométrica, interacciones hermitianas complejas, superposición coherente de vecinos |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: opera sobre campos de 32³ con 4.096 partículas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un operador neuronal geométrico invariante/equivariante a rotaciones, no un transformer de secuencias. El sustrato AlienX consta de cinco piezas: (1) un marco local SO(3) derivado de coordenadas y covarianza de vecinos; (2) QSA con compuerta de relevancia sobre desplazamientos relativos al marco; (3) modulación de fase geométrica e interacciones hermitianas complejas; (4) superposición coherente de vecinos con residuales; y (5) objetivos de campo complejo normalizados. La cáscara Quantum Knot mapea este sustrato a un campo físico concreto: coordenadas del nudo trébol, canales de densidad y fase, fuerza de perturbación, tiempo normalizado, objetivo de densidad compleja y diagnósticos de vórtice.

El entrenamiento registrado en la model card comprende 30 épocas sobre 4.096 partículas con convención de campo 32³, con la perturbación muestreada durante el entrenamiento. La pérdida descendió de 1,1110 a 0,1044. Se evalúa sobre seis fotogramas deterministas de `t=0` a `t=1`; el MSE de reconstrucción compleja en el fotograma final es de aproximadamente 0,0504 y el proxy de circulación de fase de aproximadamente 0,0895. El benchmark incluye una ablación de entrada de fase, un barrido de perturbación, deltas de predicción y una comprobación de inferencia determinista. No se documentan datos de RLHF ni DPO.

## Capacidades

- Predicción y reconstrucción de campos complejos temporales condicionados por perturbación.
- Preservación de estructura geométrica local mediante equivarianza SO(3).
- Modelización de acoplamiento de fase compleja (canales de densidad y fase).
- Respuesta temporal sobre una secuencia determinista de seis fotogramas (`t=0` a `t=1`).
- Diagnósticos de vórtice y proxy de circulación de fase.
- Ablación de entrada de fase para analizar la contribución de los canales de fase.
- Barrido de robustez frente a fuerzas de perturbación (0, 0,25, 0,5, 0,75, 1).
- Inferencia determinista reproducible con base de espécimen y ruido fija.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step genérico.
- No dispone de capacidades multilingües, de visión ni de audio.

## Casos de uso

- Investigación en operadores neuronales geométricos: el modelo sirve como banco de pruebas reproducible para estudiar cómo un marco local SO(3) y la superposición coherente de vecinos preservan estructura geométrica en campos complejos; se ejecuta con `python -u AlienX-Qknot.py`.
- Estudio de acoplamiento de fase en dinámica de vórtices: la ablación de entrada de fase y el proxy de circulación permiten cuantificar la contribución de los canales de fase a la reconstrucción, útil en grupos que trabajan con Gross-Pitaevskii o campos complejos similares.
- Validación de robustez frente a perturbaciones: el barrido de perturbación (0 a 1) proporciona métricas de MSE complejo, RMSE de amplitud y alineación de fase para analizar estabilidad del operador bajo ruido controlado.
- Reproducibilidad de experimentos de *scientific machine learning*: el repositorio incluye checkpoint, script de benchmark y JSON de resultados, lo que permite replicar el experimento en un entorno fijo y comparar con variantes del sustrato.
- Docencia y formación en operadores equivariantes: el código canónico y el paper de reproducibilidad (`.docx`) permiten ilustrar cómo se construye un marco local SO(3) y cómo se integra una atención con compuerta de relevancia en un campo físico.
- Base para extensiones a otros campos físicos: la separación entre sustrato AlienX reutilizable y cáscara específica del dominio facilita adaptar el operador a otros campos con simetría rotacional, reemplazando únicamente la cáscara exterior.

## Benchmarks y rendimiento

Resultados registrados en la model card para el experimento Quantum Knot (sin comparación con modelos externos):

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento (inicio → final) | 1,1110 → 0,1044 |
| Épocas | 30 |
| Partículas | 4.096 |
| Convención de campo | 32³ |
| Fotogramas de evaluación | 6 (`t=0` a `t=1`) |
| MSE de reconstrucción compleja (fotograma final) | ≈ 0,0504 |
| Proxy de circulación de fase | ≈ 0,0895 |

El benchmark incluye además barrido de perturbación, ablación de entrada de fase, deltas de predicción y comprobación de inferencia determinista, cuyos valores completos están en `metrics/quantum_knot_benchmark.json`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint es un `.pt` de tamaño no especificado y el repositorio ocupa 0,0 GB, por lo que probablemente quepa en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el experimento opera sobre 4.096 partículas y campo 32³, lo que sugiere requisitos modestos, pero no se aportan cifras.
- Opciones de despliegue: ejecución directa con PyTorch mediante `AlienX-Qknot.py` y `benchmark_quantum_knot.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros operadores neuronales geométricos en la información proporcionada. Como referencia contextual del ecosistema del mismo autor, existen AlienX 3D (ISN, licencia AGPL-3.0, en GitHub) y el paquete `alienx-labs` en PyPI, que ofrecen operadores equivariantes para Darcy flow, Gross-Pitaevskii y Navier-Stokes 3D con pesos preentrenados. No se aportan métricas comparables entre ellos y Quantum Knot.

| Modelo | Tipo | Licencia | Disponibilidad |
|---|---|---|---|
| AlienX Quantum Knot v2 | Operador geométrico para campo de nudo trébol | MIT | Hugging Face (repo) |
| AlienX 3D (ISN) | Red de esténcil isotrópica SO(3) | AGPL-3.0 | GitHub |
| alienx-labs | Zoo de operadores equivariantes (Darcy, GP, Navier-Stokes) | no disponible | PyPI |

## Limitaciones y advertencias

- Modelo experimental de nicho: no es un LLM ni un modelo generativo de propósito general; no debe evaluarse con benchmarks de lenguaje.
- Alcance físico limitado: la propia model card advierte que una afirmación de reconexión física respaldada por solver requiere verdad de referencia temporal independiente; el benchmark mantiene explícita esa distinción.
- Sin datos de sesgo: no se documentan sesgos conocidos, pero tampoco se aporta información sobre composición de datos más allá del campo sintético.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero las predicciones del campo complejo pueden divergir de la dinámica física real fuera del régimen entrenado (perturbación y tiempo cubiertos).
- Idiomas: solo inglés en la documentación; el modelo no procesa texto.
- Licencia MIT: permite uso comercial, pero el ecosistema AlienX 3D en GitHub es AGPL-3.0, lo que conviene verificar si se reutilizan componentes de ese repositorio.
- Reproducibilidad dependiente del entorno: requiere ejecutar los scripts con parámetros fijos (`ALIENX_KNOT_NO_LAUNCH=1` para ejecución no interactiva) y el checkpoint incluido.
- Sin pipeline declarado en Hugging Face ni pesos en formatos estándar (safetensors/GGUF), lo que dificulta su integración en herramientas convencionales de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElBalor/AlienX-Quantum-Knot
- Space Signal Lab: https://huggingface.co/spaces/ElBalor/AlienX-Quantum-Knot-Signal-Lab
- Repositorio GitHub AlienX: https://github.com/ElBalor/AlienX
- Paquete PyPI alienx-labs: https://pypi.org/project/alienx-labs/
