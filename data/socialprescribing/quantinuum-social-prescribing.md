# socialprescribing/quantinuum-social-prescribing

## Resumen

`QSPMLM` (Quantum Social Prescribing 4-Qubit Frobenius Multi-Task Model) es un clasificador cuántico variacional (VQC) de 4 qubits y 3 capas desarrollado por Arun Nadarasa (Innovation Fellow, Mid and South Essex NHS Foundation Trust; ISPPA, Londres). No es un modelo de lenguaje: es un modelo de aprendizaje automático cuántico orientado a clasificación multi-tarea sobre perfiles de pacientes sintéticos del NHS, conforme a los marcos DAPB4066 y Core20PLUS5. Se publica como artefacto de investigación reproducible con pesos en JSON y código de inferencia en NumPy puro.

El modelo combina una arquitectura DisCoPy Frobenius de data-reuploading con un kernel cuántico IQP de fidelidad exacta (`K(x,x') = |<ψ(x)|ψ(x')>|²`) y un SVM, más baselines clásicos de control (regresión logística, RBF-SVM, MLP). Se entrenó en Modal Cloud mediante diferenciación exacta de vectores de estado complex128, sin ejecutar disparos en QPU física (0 shots). El repositorio tiene 0 GB de tamaño y 0 descargas en el momento de la consulta.

Su relevancia es metodológica y de gobernanza: documenta un pipeline completo de VQC con métricas multi-tarea (clasificación de ruta clínica, cadencia de seguimiento y predicción de recuperación a 12 semanas) y una divulgación explícita de seguridad clínica NHS DCB0129 con cuatro peligros (`H-QSPM-01` a `H-QSPM-04`) que permanecen abiertos. No debe confundirse con un modelo fundacional ni usarse en producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VQC DisCoPy Frobenius de data-reuploading, 4 qubits, 3 capas; kernel cuántico IQP de fidelidad |
| Parametros totales | 60 parametros cuánticos/escala |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 8 características) |
| Tipos de cuantizacion | no disponible (pesos en JSON de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | JSON (`qspmlm_weights.json`) + código Python de inferencia (`qspmlm.py`) |

## Arquitectura y entrenamiento

El núcleo es un clasificador cuántico variacional de 4 qubits y 3 capas con esquema de data-reuploading, construido sobre la semántica de categorías de DisCoPy con estructuras Frobenius. La entrada es un vector de 8 características normalizadas (por ejemplo `[0.72, 0.88, 0.65, 0.30, 0.40, 0.68, 0.66, 0.75]`) que se codifica en el estado cuántico; la medición alimenta cabezas multi-tarea para etiqueta de ruta clínica, etiqueta de cadencia y puntuación de recuperación a 12 semanas. En paralelo se implementa un kernel cuántico IQP de fidelidad exacta que calcula el solapamiento de estados `|⟨ψ(x)|ψ(x')⟩|²` y se usa dentro de un SVM.

El entrenamiento se realizó en Modal Cloud con diferenciación exacta de vectores de estado complex128 (sin muestreo ni ruido de QPU), y el circuito se compiló a Quantinuum Guppy 1.0 HUGR (hash `3793da66d5a302cf...`). El conjunto de datos son 2.400 perfiles sintéticos NHS DAPB4066/Core20PLUS5 (1.920 de entrenamiento, 480 de test reservado; `synthetic_payload: true`). No se documenta uso de RLHF, DPO ni ajuste por preferencias, ni el número de tokens (no aplica). La innovación destacable es la combinación de VQC con kernel cuántico exacto y baselines clásicos de control bajo un mismo protocolo de evaluación.

## Capacidades

- Clasificación multi-tarea de perfiles de pacientes: ruta clínica, cadencia de seguimiento (Zeno Cadence) y puntuación de recuperación a 12 semanas.
- Clasificación mediante kernel cuántico de fidelidad exacta (IQP) con SVM.
- Inferencia en Python sin dependencias cuánticas: solo NumPy y `huggingface_hub` para descargar pesos y código.
- Evaluación de seguridad clínica: recall de escalado urgente y MAE de recuperación como métricas auxiliares.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación reproducible en QML sanitario: replicar el pipeline VQC + kernel + baselines clásicos sobre datos sintéticos NHS para estudiar la viabilidad de clasificadores cuánticos en dominios tabulares pequeños.
- Docencia y formación en computación cuántica aplicada: el código NumPy de inferencia permite ejecutar el modelo en un portátil sin acceso a QPU, útil para cursos de QML.
- Evaluación de gobernanza de IA sanitaria: el modelo sirve como caso de estudio de divulgación DCB0129 con peligros clínicos abiertos y requisitos de supervisión humana (farmacéutico, GP, link-worker).
- Benchmarking de kernels cuánticos: comparar el kernel IQP de fidelidad exacta frente a RBF-SVM y MLP en tareas de clasificación tabular de baja dimensión.
- Prototipado de pipelines híbridos cuántico-clásicos: usar el VQC como componente de un sistema mayor con baselines clásicos de control antes de escalar a datos reales.
- Estudio de compilación a hardware Quantinuum: el artefacto HUGR Guppy 1.0 permite analizar el coste de compilación y la fidelidad esperada en QPU real, aunque no se hayan ejecutado shots.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 480 perfiles de test reservado:

| Modelo / baseline | Precision de ruta (held-out) | Macro-F1 | Metricas adicionales |
|---|---|---|---|
| `QSPMLM-VQC` (4 qubits Frobenius, 60 parametros) | 99,79% | 0,9979 | Zeno Cadence Acc: 96,46%; Urgent Escalation Recall: 100,00%; Recovery MAE: 0,0328 |
| `QSPMLM-QKernel` (IQP fidelidad, SVM) | 99,33% | 0,9931 | Solapamiento exacto `K(x,x') = |<ψ(x)|ψ(x')>|²` |
| LogisticRegression (Gate G4) | 99,79% | 0,9979 | 27,66 ms |
| RBF-SVM (Gate G4) | 100,00% | 1,0000 | 48,58 ms |
| MLP 32x16 (Gate G4) | 99,79% | 0,9980 | 1149,14 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia es NumPy en CPU con pesos JSON de 60 parámetros (huella de memoria despreciable, inferior a unos pocos MB).
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna ejecuta la inferencia. El entrenamiento se realizó en Modal Cloud, pero no se especifican GPUs concretas.
- Cabe en cualquier GPU consumer y en CPU sin aceleración; también en entornos sin GPU.
- Opciones de despliegue: Python con NumPy y `huggingface_hub`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles para el VQC; los baselines clásicos reportan 27,66 ms (LogisticRegression), 48,58 ms (RBF-SVM) y 1149,14 ms (MLP).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VQC multi-tarea sobre datos NHS sintéticos). Los únicos puntos de comparación internos son los baselines clásicos del propio artículo (LogisticRegression, RBF-SVM, MLP), ya recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- Datos sintéticos: el entrenamiento usa `synthetic_payload: true`; los resultados no garantizan generalización a pacientes reales.
- Cero disparos en QPU física: el modelo se entrena y evalúa con simulación exacta complex128, por lo que no refleja ruido, decoherencia ni errores de hardware real.
- Gobernanza clínica abierta: los cuatro peligros NHS DCB0129 (`H-QSPM-01` a `H-QSPM-04`) permanecen abiertos y exigen supervisión humana obligatoria de farmacéutico, GP y link-worker.
- Uso estrictamente offline en sandbox de investigación; no apto para producción clínica ni toma de decisiones automatizada.
- Sesgos conocidos: no documentados en la información disponible; al ser datos sintéticos, los sesgos demográficos del dataset no están caracterizados.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificación errónea en rutas clínicas y escalados urgentes.
- Limitaciones de contexto e idioma: no aplica (entrada tabular de 8 características, sin capacidades lingüísticas).
- Licencia MIT permite uso comercial del artefacto, pero la ausencia de validación clínica y los peligros DCB0129 abiertos desaconsejan cualquier uso sanitario real.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema mínimo y sin mantenimiento comunitario documentado.

## Enlaces

- Hugging Face: https://huggingface.co/socialprescribing/quantinuum-social-prescribing
- Repositorio GitHub: https://github.com/arunnadarasa/quantinuum-social-prescribing
- Portal GitHub Pages: https://arunnadarasa.github.io/quantinuum-social-prescribing/
- Hugging Face Space interactivo: https://huggingface.co/spaces/socialprescribing/quantinuum-social-prescribing
- Monografía Samskrift: https://samskrift.com/view/0db305b3-9a91-4fdb-ada8-b760beda1ec5/668cdf7d-9840-478a-9101-88989e408c54
