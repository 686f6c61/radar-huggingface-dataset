# eltokh7/inkling-2-mini-decision

## Resumen

Inkling-2-Mini Decision v5.1 es un modelo de decisión de profundidad adaptativa construido por eltokh7 sobre thinkingmachines/Inkling-2-Mini (26.400 millones de parámetros totales, con 3.400-5.400 millones activos en arquitectura MoE). A diferencia de un modelo generativo convencional, lee un estado y una o varias preguntas tipadas (elección múltiple, sí/no o puntuación) en un único forward pass y devuelve probabilidades calibradas sin generar ningún token de salida.

Su rasgo distintivo es el bucle de cómputo: las 12 capas centrales (capas 6-17) se ejecutan entre 1 y 5 veces, de modo que las preguntas simples se resuelven tras una pasada y las preguntas complejas iteran más profundo antes de responder. Tras la quinta iteración, una cabeza de escalado calibrada estima si conviene derivar la consulta a un modelo System 2 más lento. El modelo se presenta como un ejemplo de "System 1.5": rápido por defecto, con control de riesgo conforme y escalado selectivo.

La relevancia actual reside en su enfoque de eficiencia: en lugar de invocar un LLM grande para cada decisión, ofrece un clasificador-decisor con parada temprana aprendida, calibración de probabilidades y una AUROC de escalado de 0,8102 en el conjunto decision-v7/test. La versión 5.1 combina dos super-épocas de entrenamiento multi-profesor con Weight Space Programming (Astra Stage 8A/8B) e incluye el motor de producción System15Engine en modeling.py.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con núcleo en bucle (looped transformer), MoE con experto denso compartido y parada dinámica; prelude de 6 capas, núcleo de 12 capas (1-5 iteraciones, 24-72 capas lógicas) y exit de 6 capas |
| Parametros totales | 25.607.222.784 (25,6B) |
| Parametros activos | 3,4B-5,4B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres bloques. Un prelude de capas 0-5 se ejecuta una sola vez y se cachea entre preguntas sobre el mismo estado. El núcleo en bucle (capas 6-17) se repite entre 1 y 5 veces e incorpora un LoopedSharedExpert denso de 170M parámetros con modulación AdaLN-Zero(k) que asigna un rol distinto a cada pasada, junto con compuertas message_gate que propagan el estado de la iteración anterior. Una DynamicHaltingHead en la capa 17 decide en unos 0,05 ms si detenerse o iterar de nuevo. El bloque de salida (capas 18-23) se ejecuta una única vez en la iteración elegida e incluye un CrossLoopTrajectoryMixer con atención causal entre iteraciones, un FullContextEvidencePooler que agrega el 100 % de los tokens de estado en hasta 64 fragmentos y cabezas conjuntas de esquema y de escalado.

El entrenamiento combina dos épocas disjuntas con múltiples profesores (Super-Epoch 1 y Super-Epoch 2) y Weight Space Programming de Astra (Stage 8A/8B), una técnica que programa pesos sin sobrecoste de inferencia. La calibración de la probabilidad de escalado se apoya en escalado de Platt ajustado fuera de muestra (OOF) y en ranking por pares dentro de dominio. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Decisión clasificatoria en un solo forward pass sobre preguntas tipadas: elección entre opciones (choice), sí/no (noul) y puntuación (score), con salida de probabilidades calibradas y cero tokens generados.
- Parada adaptativa aprendida: resuelve consultas simples tras una iteración y profundiza hasta cinco en preguntas de varios pasos.
- Escalado selectivo a System 2: la EscalationHead estima p_escalate calibrada para derivar casos dudosos a un modelo mayor.
- Control de riesgo conforme: modos balanced y strict con tasas de error temprano reparables declaradas (0,42 % en decision-v7/test y 0,83 % en hard-v1/test en modo balanced).
- Razonamiento multi-paso interno mediante el bucle de capas y el mezclador de trayectorias entre iteraciones.
- Puntuación de estados completos mediante FullContextEvidencePooler, útil para agregar evidencia de contextos largos en un vector de decisión.
- Capacidades multilingües: no disponible.
- Soporte de tool calling, agentes, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de consultas en pipelines de atención al cliente: el modelo evalúa el estado de la conversación y decide si la resuelve un modelo ligero o se escala a un LLM mayor, usando p_escalate calibrada para fijar el umbral de derivación.
- Moderación y clasificación de contenido en tiempo real: al no generar tokens y detenerse tras una iteración en casos simples, encaja en flujos de alta concurrencia donde un LLM generativo sería demasiado costoso.
- Triaje de tickets y soporte técnico: con preguntas de tipo choice sobre categorías y severidad, el bucle profundo permite resolver casos ambiguos que requieren varias señales del estado.
- Verificación de salidas de un System 2: dado el estado y la respuesta candidata, el modelo puntúa la corrección y dispara revisión humana o regeneración cuando la probabilidad cae por debajo del umbral conforme.
- Decisión en agentes autónomos: como paso de selección de acción entre opciones discretas, con parada temprana para reducir latencia en bucles de control.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación adicional o puede responderse con el contexto cacheado del prelude, reutilizando el estado entre preguntas.
- Evaluación automática de calidad en CI de modelos: usar la cabeza de puntuación para clasificar respuestas generadas y detectar regresiones con umbrales calibrados.

## Benchmarks y rendimiento

| Benchmark / metrica | v5.0 (Ep 1) | v5.1 (Ep 2 + Astra WSP) | Referencia |
|---|---:|---:|---|
| decision-v7/test (n=1.440) | 87,15 % (L5) | 86,67 % (L3) / 86,25 % (L5) | Kev-27B denso: 86,3 % |
| hard-v1/test (n=1.088, OOD) | 73,53 % (L5) | 72,98 % (L5, monotónico estricto) | Kev-9B v1: 58,4 % |
| hard-v1/dev (n=1.083, OOD) | 69,44 % (L5) | 70,45 % (L5) | Kev-9B v1: 58,2 %; Jev: 78 % |
| decision-v7/test conforme balanced | 86,81 % @ 2,13L | 86,11 % @ 1,75L (0,42 % reparables) | 65 % de ahorro de bucles frente a L5 |
| hard-v1/test conforme balanced | 72,15 % @ 3,48L | 72,52 % @ 3,10L (0,83 % reparables) | Casi la mitad de errores reparables |
| decision-v7/test AUROC escalado / Top-20 % | 0,7505 / 91,49 % | 0,8102 / 92,88 % (oráculo S2: 94,31 %) | +0,060 AUROC |
| hard-v1/test AUROC escalado / Top-20 % | 0,7437 / 80,11 % | 0,7545 / 79,89 % (oráculo S2: 83,92 %) | p_esc calibrada (26,3 % vs 27,0 % error) |

Métricas adicionales de v5.1: hard_temporal_numeric 51,3 %, hard_judge 76,6 %, ECE en hard-v1/test reducido de 0,0944 a 0,0765, y precisión en Loop 1 de hard-v1/test del 52,67 % con crecimiento monotónico hasta el 72,98 % en Loop 5.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 25,6B parámetros totales en safetensors y un repositorio de 205,9 GB, la inferencia en precisión completa excede con holgura las GPU de consumo.
- GPU recomendadas: no disponible de forma explícita; por tamaño, requiere aceleradores de clase A100/H100 o equivalentes con memoria suficiente para los pesos completos.
- Cabe en GPU de consumo: no disponible; no se documentan cuantizaciones ni versiones GGUF que permitan reducir la huella.
- Opciones de despliegue: transformers con el motor System15Engine incluido en modeling.py; compatibilidad con endpoints declarada en los tags. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: la DynamicHaltingHead opera en aproximadamente 0,05 ms y la profundidad media en modo balanced es de 1,75 iteraciones (decision-v7/test) y 3,10 iteraciones (hard-v1/test); no se publican cifras de latencia total ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini Decision v5.1 | 25,6B totales (3,4-5,4B activos) | no disponible | 86,67 % decision-v7/test; 72,98 % hard-v1/test; AUROC 0,8102 | Apache 2.0 | Hugging Face |
| Kev-27B (denso) | 27B | no disponible | 86,3 % decision-v7/test | no disponible | referencia en model card |
| Kev-9B v1 (denso) | 9B | no disponible | 58,4 % hard-v1/test; 58,2 % hard-v1/dev | no disponible | referencia en model card |
| Jev | no disponible | no disponible | 78 % hard-v1/dev | no disponible | referencia en model card |

## Limitaciones y advertencias

- Compromiso frente a v5.0: la precisión bruta en Loop 5 baja entre 0,5 y 0,9 puntos porcentuales en decision-v7/test y hard-v1/test; las ganancias se concentran en velocidad de parada, calibración y AUROC de escalado.
- El modelo no genera texto: solo emite probabilidades sobre esquemas predefinidos, por lo que no sustituye a un LLM en tareas abiertas.
- Dependencia de un System 2 externo: el escalado selectivo solo aporta valor si existe un modelo mayor al que derivar; sin él, los casos dudosos quedan sin resolver.
- Rendimiento en dominios fuera de distribución limitado: 72,98 % en hard-v1/test y 51,3 % en hard_temporal_numeric, lejos de la precisión en distribución.
- Riesgo de error temprano en la parada: aunque el modo balanced declara 0,42 % y 0,83 % de errores reparables, la parada agresiva puede fallar en estados atípicos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas y contexto máximo: no disponibles, lo que impide garantizar cobertura multilingüe o estados de longitud elevada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini antes de producción.
- Repositorio de 205,9 GB y ausencia de cuantizaciones documentadas: el despliegue exige infraestructura de memoria elevada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eltokh7/inkling-2-mini-decision
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de referencia del autor: no disponible
- Paper técnico: no disponible
- Blog o demo: no disponible
