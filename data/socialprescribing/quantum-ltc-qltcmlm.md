# socialprescribing/quantum-ltc-qltcmlm

## Resumen

QLTCMLM (Quantum Long-Term Conditions Model) es un prototipo de investigación publicado por el usuario `socialprescribing` en Hugging Face. No es un modelo de lenguaje: se trata de un clasificador cuántico variacional de 4 qubits (`QLTCMLM-VQC`) con técnica de *data-reuploading* de Frobenius, junto con una variante de kernel cuántico de fidelidad (`QLTCMLM-QKernel`), orientados a la reestratificación de riesgo de pacientes con condiciones de larga duración (Long Term Conditions, LTC) y a la recomendación de paquetes de cuidados anuales en el contexto del NHS North Central London ICB.

El modelo se presenta como un ejercicio multi-tarea entrenado en Modal Cloud sobre datos sintéticos, con la declaración explícita de que no contiene información identificable de pacientes (`phi_present = False`) y que no se han ejecutado shots en QPU física (0 shots). Los peligros clínicos según la norma NHS DCB0129 permanecen abiertos, lo que lo sitúa como un artefacto de investigación y no como un componente apto para uso clínico.

Es relevante ahora como ejemplo de aplicación de *quantum machine learning* (QML) a un dominio sanitario regulado, y por su transparencia metodológica: publica comparativas frente a baselines clásicos (regresión logística, SVM con kernel RBF, MLP y gradient boosting) que permiten contextualizar el rendimiento real de un VQC de muy baja dimensionalidad frente a alternativas convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador cuántico variacional (VQC) de 4 qubits con *data-reuploading* de Frobenius; variante kernel cuántico de fidelidad (Gram matrix) + SVM |
| Parámetros totales | 200 en QLTCMLM-VQC (72 cuánticos + 128 de readout) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura principal, `QLTCMLM-VQC`, es un circuito cuántico variacional de 4 qubits con tres capas y *data-reuploading* basado en codificación de Frobenius, seguido de un readout clásico. El recuento de parámetros es de 200 en total (72 en el circuito cuántico y 128 en la capa de lectura). La segunda variante, `QLTCMLM-QKernel`, construye una matriz de Gram de fidelidad cuántica (|<psi(x)|psi(x')>|^2) y entrena un SVM clásico sobre ella.

El entrenamiento se realizó en Modal Cloud sobre una cohorte sintética de 2.400 registros con interacciones cúbicas no lineales, con un 25 % reservado como conjunto de test. No se especifican en la información disponible el número de tokens (no aplica), la composición del dataset, ni si hubo etapas de RLHF o DPO (no procede para este tipo de modelo). La innovación técnica destacable es el uso de *data-reuploading* con codificación de Frobenius en un circuito de muy baja profundidad, junto con la publicación de una comparativa honesta frente a baselines clásicos.

## Capacidades

- Clasificación multi-tarea: predicción simultánea de nivel de riesgo clínico (risk tier) y de paquete de cuidados recomendado (care bundle).
- Reestratificación de riesgo de pacientes con condiciones de larga duración y multimorbilidad en datos sintéticos.
- Clasificación sobre features tabulares con interacciones no lineales de orden cúbico.
- Kernel cuántico de fidelidad para clasificación mediante SVM clásico sobre matriz de Gram cuántica.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en QML aplicada a salud: servir como referencia reproducible para comparar VQC de 4 qubits frente a baselines clásicos en tareas de clasificación tabular clínica.
- Prototipado de reestratificación de riesgo en cohortes sintéticas: permite experimentar con pipelines de predicción de nivel de riesgo antes de disponer de datos reales anonimizados.
- Evaluación de kernels cuánticos de fidelidad: útil para estudiar el comportamiento de `QLTCMLM-QKernel` frente a SVM con kernel RBF en problemas de baja dimensionalidad.
- Docencia y formación: ejemplo didáctico de *data-reuploading* y codificación de Frobenius con 4 qubits y tres capas.
- Análisis de *benchmarking* metodológico: la tabla comparativa publicada permite discutir cuándo un VQC no supera a un gradient boosting o a un SVM clásico.
- Prueba de concepto de recomendación de paquetes de cuidados: explorar la segunda cabeza de clasificación sobre datos sintéticos de Year-of-Care, siempre fuera de entornos clínicos reales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre cohorte sintética de N = 2.400 con interacciones cúbicas no lineales y 25 % de test reservado:

| Modelo | Risk Tier Accuracy | Care Bundle Accuracy |
|---|---|---|
| QLTCMLM-VQC (4 qubits, 3 capas, Frobenius) | 0,5417 | 0,7550 |
| QLTCMLM-QKernel (4 qubits, Gram de fidelidad + SVM) | 0,3333 | 0,5367 |
| LogisticRegression | 0,3050 | 0,6850 |
| RBF-SVM (C=4.0) | 0,6767 | 0,8500 |
| MLPClassifier (2 capas 32x16 ReLU) | 0,6350 | 0,8017 |
| HistGradientBoosting | 0,5367 | 0,8183 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no publica pesos en el repositorio (tamaño 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible.
- Despliegue: no disponible; no se documentan opciones tipo vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponible. El autor declara 0 shots en QPU física, por lo que no se reportan tiempos de ejecución en hardware cuántico.
- Entrenamiento realizado en Modal Cloud, sin especificación de recursos concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Risk Tier Acc. | Care Bundle Acc. | Licencia |
|---|---|---|---|---|---|---|
| QLTCMLM-VQC | VQC 4 qubits | 200 (72 cuánticos + 128 readout) | no aplica | 0,5417 | 0,7550 | MIT |
| QLTCMLM-QKernel | Kernel cuántico + SVM | no disponible | no aplica | 0,3333 | 0,5367 | MIT |
| RBF-SVM (C=4.0) | Clásico | no disponible | no aplica | 0,6767 | 0,8500 | no aplica |
| MLPClassifier (32x16) | Clásico | no disponible | no aplica | 0,6350 | 0,8017 | no aplica |
| HistGradientBoosting | Clásico | no disponible | no aplica | 0,5367 | 0,8183 | no aplica |

## Limitaciones y advertencias

- Modelo de investigación: no apto para uso clínico. Los peligros clínicos según NHS DCB0129 permanecen abiertos según el propio autor.
- Entrenado exclusivamente sobre datos sintéticos; no se ha validado con datos reales de pacientes.
- Rendimiento inferior a baselines clásicos: el RBF-SVM supera al VQC en ambas métricas (0,6767 vs 0,5417 en risk tier; 0,8500 vs 0,7550 en care bundle).
- El kernel cuántico de fidelidad rinde peor que la regresión logística lineal en ambas tareas.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica (no genera texto), pero existe riesgo de sobreajuste a la cohorte sintética y de extrapolación indebida a poblaciones reales.
- Limitaciones de contexto e idioma: no disponible; el modelo no procesa lenguaje natural.
- Licencia MIT: permite uso comercial, pero la ausencia de validación clínica y la declaración de peligros abiertos desaconsejan cualquier despliegue en producción sanitaria.
- Cero shots en QPU física: los resultados no demuestran ventaja cuántica ni robustez frente a ruido de hardware real.
- Tamaño del repositorio de 0.0 GB: no hay pesos publicados verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/socialprescribing/quantum-ltc-qltcmlm
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
