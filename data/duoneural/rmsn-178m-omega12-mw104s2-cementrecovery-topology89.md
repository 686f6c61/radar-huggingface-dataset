# DuoNeural/RMSN-178M-Omega12-mw104s2-CementRecovery-Topology89

## Resumen

RMSN-178M-Omega12-mw104s2-CementRecovery-Topology89 es un checkpoint de investigación de 177,9 millones de parámetros publicado por DuoNeural bajo la etiqueta "Resonant Metriplectic Sheaf Network" (RMSN). Se presenta como parte de un "Topological Phase Map", un estudio sistemático de variantes arquitectónicas sometidas a condiciones de resonancia de lengua de Arnold (Arnold Tongue) con Ω=1/2. El modelo se enmarca en la investigación experimental de dinámicas de "cementación" y "recuperación" de representaciones, no en un modelo de lenguaje de propósito general.

El checkpoint corresponde a la "Topología #89", descrita por el autor como un caso de cementación profunda (lyapunov=-0,89 a 41k pasos) que se recupera espontáneamente a un estado cuasi-TS (quasi-thermalized state) oscilante a 100k pasos, con una perplejidad de validación de 77,5. Comparte parámetros de arquitectura con la Topología #82 (mw104 s1, Micro-Orbit), pero difiere en el patrón de cristalización, lo que el autor interpreta como multistabilidad topológica.

La relevancia es estrictamente de investigación: cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y con una model card que documenta hallazgos de dinámica de entrenamiento más que capacidades funcionales. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), 16 capas |
| Parametros totales | 177,9 M (178M) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, checkpoint `rmsn_best.pt`) |

Parámetros arquitectónicos adicionales declarados por el autor: dimensión D=832, profundidad L=16, ancho de slot M_w=104, Ω (Arnold Tongue)=1/2, M_eff (fibras)=3. Tamaño del repositorio: 1,6 GB.

## Arquitectura y entrenamiento

La arquitectura se denomina "Resonant Metriplectic Sheaf Network", una propuesta no estándar que combina conceptos de haces (sheaves), estructuras metriplécticas y resonancia tipo lengua de Arnold. El autor documenta una dimensión de 832, 16 capas y un ancho de slot de 104, con M_eff=3 grupos de fibras {L0}, {L8-L11}, {L14,L15}. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o ajuste por instrucciones.

El aspecto técnico destacado es el seguimiento de dinámicas de entrenamiento mediante exponentes de Lyapunov: el checkpoint registra un estado de "cementación profunda" (lyap=-0,89 a 41k pasos) que se recupera parcialmente a un estado cuasi-TS oscilante (val_lyap entre -0,003 y -0,1 a 100k pasos). El autor interpreta que la cementación no es totalmente irreversible. M_w=104=2^3·13 no es 3-smooth (p=13), lo que se relaciona con un delta(13)=1/26≈0,038. Estos hallazgos están vinculados a las "waves" 157 (Phase Map), 158 (Soft Topology) y 162 (Cement Recovery).

## Capacidades

- Generación de texto: el checkpoint se etiqueta como `language-model`, pero no se documentan capacidades funcionales concretas.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales: el interés declarado es el análisis de dinámica topológica y de estabilidad del entrenamiento (exponentes de Lyapunov, estados cuasi-TS, multistabilidad topológica), no una capacidad de inferencia orientada a usuario.

## Casos de uso

- Investigación en dinámica de entrenamiento: analizar la transición de cementación profunda a estado cuasi-TS oscilante para estudiar reversibilidad de colapsos representacionales en redes pequeñas.
- Estudio de arquitecturas alternativas: comparar RMSN frente a transformers estándar en términos de estabilidad de exponentes de Lyapunov durante el entrenamiento.
- Reproducción de experimentos del Topological Phase Map: replicar las condiciones de la Topología #89 y contrastarlas con la #82 (Micro-Orbit) para validar la hipótesis de multistabilidad topológica.
- Análisis de resonancia de Arnold: examinar el efecto de Ω=1/2 y de M_w=104 en la cristalización de representaciones.
- Docencia e investigación académica: usar el checkpoint como caso de estudio de métricas no convencionales (lyap, val_ppl, M_eff) en la evaluación de modelos pequeños.
- Base para experimentos de ajuste fino controlado: partir de un checkpoint de 178M con licencia Apache 2.0 para probar hipótesis sobre recuperación de estados cementados.

No se recomienda su uso en atención al cliente, generación de código en producción, agentes ni pipelines de CI/CD, dado que no hay evidencia de capacidades funcionales ni benchmarks de tareas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| val_ppl | 77,5 |
| val_lyap (a 100k) | -0,1046 oscilante (-0,003 a -0,1) |
| lyap a 41k | -0,89 (cementación profunda) |
| M_eff | 3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; 177,9M parámetros en FP32 ocupan aproximadamente 0,7 GB de pesos, más overhead de activaciones y del formato de checkpoint (repo de 1,6 GB).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) podría alojar los pesos, pero no se documenta compatibilidad de inferencia.
- Cabe en GPU consumer: probablemente sí por tamaño, aunque el formato `.pt` y la arquitectura no estándar impiden confirmarlo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la única indicación es carga directa con `torch.load`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-178M-Omega12-mw104s2-CementRecovery-Topology89 | 177,9M | no disponible | Apache 2.0 | HF (0 descargas) | Checkpoint de investigación, arquitectura no estándar |
| RMSN Topología #82 (mw104 s1, Micro-Orbit) | 177,9M (mismos parámetros) | no disponible | Apache 2.0 | HF (organización DuoNeural) | Misma arquitectura, distinta cristalización |
| Modelos transformer ~180M (p. ej. GPT-2 small, 124M) | ~124M | 1024 | MIT / varias | Amplia | Referencia funcional de propósito general; no comparable en metodología |

La comparación con modelos de propósito general no es significativa: el RMSN no publica benchmarks de tareas ni idiomas, por lo que la comparativa se limita a variantes de la misma familia.

## Limitaciones y advertencias

- Ausencia total de benchmarks de tareas: no hay evidencia de calidad en generación, razonamiento o código.
- Sin idiomas declarados ni tokenizador documentado: el uso multilingüe no está garantizado.
- Arquitectura no estándar y sin integración con runtimes de inferencia habituales (vLLM, llama.cpp, TGI); el único método documentado es `torch.load`.
- Riesgo de alucinación y de comportamiento impredecible: el propio autor documenta estados de cementación y oscilación en la dinámica, lo que sugiere inestabilidad representacional.
- Model card centrada en hallazgos de investigación, no en uso práctico; sin pipeline ni guía de prompts.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación funcional desaconseja su uso en producción.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- No debe interpretarse como un modelo de lenguaje listo para aplicaciones; es un artefacto de investigación del Topological Phase Map.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-178M-Omega12-mw104s2-CementRecovery-Topology89
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/duoneural/rmsn
