# rmems/Spikenaut-SNN

## Resumen

Spikenaut-SNN-v2 es una red neuronal de impulsos (spiking neural network, SNN) de 16 neuronas con modelo Leaky-Integrate-and-Fire (LIF), publicada por el autor rmems como artefacto de investigación. No es un modelo de lenguaje ni un transformer: es una capa de supervisión neuromórfica de muy baja complejidad, pensada para aprender una representación temporal compacta del estado interno de un sistema a partir de telemetría de hardware y de nodo, con destino a una FPGA Xilinx Artix-7 (placa Basys 3). El repositorio contiene únicamente los pesos exportados en formato Q8.8 y el contrato de exportación, no el código de entrenamiento.

El propio autor advierte en la model card de que se trata de un artefacto de investigación, no de un supervisor validado. Los pesos publicados no están demostrados como entrenados de forma útil, la paridad software-FPGA no se ha medido (solo existe un smoke test de placa programada) y las cifras de recursos y potencia son estimaciones de síntesis Vivado no reproducibles desde el repositorio. La licencia declarada es MIT (con Apache-2.0 en las etiquetas), y el tamaño del repositorio es de 0.0 GB.

Su relevancia es, por tanto, metodológica y de nicho: documenta con un nivel de trazabilidad inusual (pins de commit, hashes de dataset, contratos de decisión) un intento de llevar inteligencia artificial consciente del hardware a FPGA mediante SNN y aprendizaje e-prop, incluyendo la posibilidad explícita de que el experimento fracase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos (SNN) con neuronas Leaky-Integrate-and-Fire (LIF); 16 neuronas |
| Parametros totales | No disponible (16 neuronas; 48 palabras Q8.8 en la capa de salida, 256 palabras ocultas según la medición json↔mem) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo temporal de estado, no basado en contexto textual) |
| Tipos de cuantizacion | Q8.8 de coma fija con signo (8 bits enteros, 8 bits fraccionarios) |
| Idiomas soportados | No aplica; la etiqueta de idioma del repositorio es "code" |
| Licencia | MIT (etiquetas adicionales: Apache-2.0) |
| Formato de pesos | `.mem` (palabras Q8.8) y `snn_model.json` |

## Arquitectura y entrenamiento

La arquitectura es una SNN de 16 neuronas LIF con dinámica de decaimiento uniforme: las 16 palabras de `parameters_decay.mem` valen `00DA` (0.8515625), lo que implica una constante de tiempo `tau = -dt / ln(decay)` de 6.21 ms en todas las unidades. La capa de salida consta de 48 palabras Q8.8 con signo, organizadas en formato neuron-major 16×3, que producen tres canales de regresión denominados `(comfort, temp, power)`. La conectividad de salida es Dale 12:4, con neuronas 12–15 de tipo inhibitorio, y los pesos ocultos son de signo mixto.

El entrenamiento se realizó mediante el framework SynapticDistill.jl (pin `a1fa491`, semilla 123, 20 épocas), con el script `scripts/spikenaut_train.jl`, que no está incluido en este repositorio. El banco de pesos publicado corresponde al experimento exp-025, un export de salud "PASS" del sidecar Distill, con dataset `rmems/Spikenaut-SNN-Telemetry` (JSONL v3, sha `26d7d744…`, 5 canales legales, linaje `74acdd0f`). Se emplea aprendizaje e-prop según las etiquetas del modelo. Las métricas de salud reportadas en el holdout fijado son cofire 0.863, all-16 0.000 e I_spikes 223511 (exp-009 PASS). El Hamming scratch sobre el harness publicado es 14.960% con k=none y 49.095% con k=4, y la discrepancia json↔mem oculto es 0/256; el autor subraya que son mediciones, no umbrales de aceptación.

## Capacidades

- Clasificación/regresión temporal sobre telemetría de hardware: produce tres canales `(comfort, temp, power)` a partir de una representación de estado interno.
- Decodificación determinista con contrato documentado: `replay_output_row` aplica argmax con desempate por índice más bajo, fallo cerrado ante NaN, vacío o anchura incorrecta, y detección de desbordamiento en margen, confianza y denominador.
- Abstención ante empate: parámetro `abstain_on_tie` (en Python, no booleano se rechaza).
- Validación estricta de entradas: `score_readout` y `replay_tick` rechazan sumas de lectura desbordadas y spikes no booleanos.
- Ejecución orientada a hardware: exportación Q8.8 para FPGA Artix-7, con smoke test de placa Basys 3 (PROGRAM_OK y `step_en` tipo heartbeat tras BTNC en modo de estado SW15).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni generación de texto. No es un modelo conversacional.

## Casos de uso

- Monitorización de estado de un nodo o acelerador: la red consume telemetría temporal (5 canales) y emite tres canales de regresión que pueden interpretarse como indicadores de confort térmico y de potencia; es adecuada por su huella mínima y su naturaleza event-driven.
- Investigación en neuromórfica aplicada: sirve como banco de pruebas reproducible (pins de commit, hashes de dataset, contratos de decisión) para estudiar si una SNN pequeña puede aprender representaciones temporales de estado computacional.
- Prototipado en FPGA de bajo coste: el export Q8.8 y el smoke test en Basys 3 permiten validar el flujo de programación y el latido de `step_en` antes de invertir en paridad completa software-hardware.
- Estudio de cuantización en SNN: la comparación json↔mem (0/256 de discrepancia oculta) y las métricas de Hamming con k=4 permiten analizar la sensibilidad de la red a la poda y a la aritmética de coma fija.
- Educación y divulgación: el artefacto documenta de forma explícita un experimento diseñado para poder fallar, útil como caso de estudio de rigor metodológico en IA de bajo nivel.
- Base para supervisión con salvaguardas deterministas: el contrato de decisión con fallo cerrado y abstención ante empate puede integrarse en un pipeline donde el software determinista retiene las restricciones duras de seguridad, tal como plantea el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas reportadas son de salud interna del sidecar Distill y de discrepancia de exportación, no comparables con benchmarks estándar:

| Metrica | Valor | Contexto |
|---|---|---|
| Cofire | 0.863 | Holdout v3, gpu-000170..198, k=none |
| All-16 | 0.000 | Holdout v3, k=none |
| I_spikes | 223511 | exp-009 PASS |
| Hamming scratch | 14.960% (k=none) / 49.095% (k=4) | Harness publicado; sin umbral |
| Discrepancia json↔mem oculto | 0/256 | Medición de exportación |
| Constante de tiempo tau | 6.21 ms | Decay uniforme 0.8515625 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el modelo es de 16 neuronas y 48 palabras de salida, con huella de memoria negligible (repositorio de 0.0 GB).
- GPU recomendadas: no se requieren GPU; el destino es FPGA Xilinx Artix-7 (Basys 3).
- Cabe en cualquier GPU consumer e incluso en microcontroladores; el interés está en su implementación en lógica programable.
- Opciones de despliegue: exportación Q8.8 a FPGA mediante el flujo descrito (archivos `.mem` y `snn_model.json`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles. Las cifras de LUT, potencia, registros y WNS son estimaciones de síntesis Vivado reportadas externamente y no reproducibles desde el repositorio; no hay mediciones en placa de paridad de spikes, acciones o potencial de membrana.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spikenaut-SNN-v2 | 16 neuronas LIF, 48 palabras Q8.8 de salida | No aplica | Métricas internas de salud; sin benchmarks estándar | MIT / Apache-2.0 | Hugging Face y GitHub |
| Alternativas SNN en FPGA | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (SNN de supervisión para FPGA con export Q8.8 y contrato de decisión documentado) en la información proporcionada.

## Limitaciones y advertencias

- Los pesos publicados no están establecidos como entrenados de forma útil; el autor lo declara explícitamente como artefacto de investigación, no como supervisor validado.
- La paridad software-FPGA no está demostrada: el smoke test en Basys 3 solo confirma PROGRAM_OK y heartbeat de `step_en`, no acuerdo de spikes, acciones o potencial de membrana. El issue #6 sigue abierto.
- Las cifras de recursos y potencia de la FPGA son estimaciones de síntesis Vivado reportadas externamente; no hay RTL, constraints, proyecto Vivado ni informes de síntesis en el repositorio, por lo que no son reproducibles.
- Los tres canales de salida `(comfort, temp, power)` son canales de regresión Distill, no una lista de acciones RM-1150; mapear la lista de cinco estados `ALLOW/WARN/THROTTLE/PAUSE/YIELD_GPU` sobre ellos sería una conjetura.
- El Hamming scratch es solo una medición, sin umbral de aprobación; el issue #20 sigue abierto.
- El script de entrenamiento `scripts/spikenaut_train.jl` no está incluido en el repositorio, lo que limita la reproducibilidad del entrenamiento.
- No soporta idiomas naturales, tool calling, agentes, visión ni audio; la etiqueta de idioma "code" no implica capacidad de generación de código.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero el contrato de decisión con fallo cerrado y abstención ante empate debe respetarse para evitar interpretaciones erróneas de las salidas.
- Licencia MIT permite uso comercial, pero el estado de validación del artefacto desaconseja su uso en producción como supervisor de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/rmems/Spikenaut-SNN
- Repositorio GitHub: https://github.com/rmems/Spikenaut-SNN
- Commit de artefactos: https://github.com/rmems/Spikenaut-SNN/commit/6965e12a6e46d29783e69f6b0fda3dda1058bd29
- Commit de la model card: https://github.com/rmems/Spikenaut-SNN/commit/27be1b514fd910902f01c407953ca1f39fdf686a
- Pin del sidecar Distill: https://github.com/rmems/SynapticDistill.jl/commit/a1fa491c70397b96967ba6cf8f08c2ce2fbb2fb7
- Issue del programa Artificial Interoception: https://github.com/rmems/Spikenaut-SNN/issues/7
- Issue de la rampa monótona: https://github.com/rmems/Spikenaut-SNN/issues/2
- Issue de Hamming: https://github.com/rmems/Spikenaut-SNN/issues/20
- Issue de procedencia de pesos: https://github.com/rmems/Spikenaut-SNN/issues/13
- Issue de paridad FPGA: https://github.com/rmems/Spikenaut-SNN/issues/6
- Issue de smoke test en placa: https://github.com/rmems/silicon-hdl/issues/68
- Pull request de artefactos: https://github.com/rmems/Spikenaut-SNN/pull/47
- Pull request de model card: https://github.com/rmems/Spikenaut-SNN/pull/83
- Dataset de telemetría: https://huggingface.co/datasets/rmems/Spikenaut-SNN-Telemetry
