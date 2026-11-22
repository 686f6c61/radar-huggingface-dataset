# hweller1/wayfinder-qwen-35b-a3b-eff

## Resumen

wayfinder-qwen-eff es un ajuste fino de Qwen3.6-35B-A3B (35.951.822.704 parámetros totales, 3B activos por token) especializado como subagente de búsqueda de código. Lo desarrolla el usuario hweller1 sobre el modelo base de Qwen, y su propósito es concreto: localizar los ficheros relevantes de un repositorio a partir de una petición en lenguaje natural, gastando menos turnos y menos tokens que su punto de partida supervisado. Es, por tanto, un modelo de infraestructura para agentes de programación, no un generador de código generalista.

Técnicamente es un transformer de mezcla de expertos (MoE) con 35B de parámetros y unos 3B activos por token, en precisión bf16 con safetensors, y conserva sin cambios el config, el tokenizer y la plantilla de chat de Qwen3.6-35B-A3B. El ajuste se hizo en dos fases: un LoRA de rango 64 sobre transcripciones de búsqueda, fusionado en el modelo base, seguido de 10 pasos de aprendizaje por refuerzo con una recompensa que prima el recall y penaliza el coste (turnos y tokens).

Su relevancia actual es la eficiencia: en 200 tareas retenidas con briefs largos alcanza el mismo Recall@12 que su predecesor (0.743 frente a 0.744) con aproximadamente la mitad de tokens (106k frente a 213k) y 2,6 turnos menos por búsqueda. Es un lanzamiento de pesos, sin datos de entrenamiento ni trayectorias, y su licencia efectiva es derivada (Apache-2.0 más Muse Model License), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), clase `qwen3_5_moe` |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | 3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 y Muse Model License (licencia derivada, `other`) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La base es Qwen3.6-35B-A3B, un transformer con mezcla de expertos en el que solo se activan unos 3B de parámetros por token, lo que abarata la inferencia frente a un denso de 35B. El post-entrenamiento se ejecutó en dos etapas. Primero, un ajuste LoRA de rango 64 sobre las mismas transcripciones de búsqueda empleadas en wayfinder-qwen, con los adaptadores fusionados en el modelo base. Después, 10 pasos de aprendizaje por refuerzo partiendo de ese checkpoint, sobre un conjunto de 1.046 tareas con briefs largos. Los pesos publicados corresponden al checkpoint del paso 10.

La innovación está en la función de recompensa: 0,7 veces el recall más 0,3 veces un recall ponderado por rango, multiplicado por un factor de eficiencia igual a 1 menos el coste dividido por un techo fijo, donde el coste es la mitad de los turnos sobre 20 más la mitad de los tokens sobre 400k. Es decir, el modelo aprende explícitamente a encontrar los mismos ficheros con menos interacciones y menos consumo. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni el uso de DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno orientado a tareas de búsqueda.
- Búsqueda de código agéntica: ejecuta un bucle de herramientas (búsqueda híbrida, fusión de listas, reranking) hasta emitir un informe final con un máximo de 12 ficheros.
- Uso de herramientas (tool calling) dentro del conjunto de herramientas definido en la model card de wayfinder-qwen.
- Comportamiento de subagente: está pensado para ser invocado por un agente orquestador como paso de localización de ficheros.
- Entrada image-text-to-text según los tags del repositorio (capacidad heredada del pipeline declarado), aunque no se detalla su uso en la model card.
- Capacidad multilingüe limitada: solo se declara inglés.
- No se documentan modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Localización de ficheros en un repositorio grande: dado un brief de 120 a 165 palabras, el modelo recorre el árbol de código con herramientas de búsqueda y devuelve una lista corta de ficheros candidatos, lo que reduce el trabajo del agente que después editará el código.
- Paso previo en pipelines de reparación de bugs: un orquestador recibe el informe de error, genera un brief y delega en wayfinder-qwen-eff la identificación de los módulos afectados antes de invocar a un modelo de edición.
- Reducción de coste en agentes de CI/CD: al necesitar unos 106k tokens y 5,3 turnos por búsqueda frente a 213k y 7,9 del modelo supervisado, baja el coste por búsqueda de 0,047 a 0,026 dólares con precios de lista de Tinker.
- Onboarding sobre bases de código desconocidas: el modelo explora repositorios no vistos en entrenamiento y produce un informe de ficheros relevantes, útil para generar documentación de navegación.
- Enrutado de consultas en asistentes de código: actúa como subagente especializado al que un agente mayor delega la fase de retrieval, manteniendo el contexto del agente principal libre.
- Evaluación de cambios en ramas: con el asunto de un commit como consulta, localiza los ficheros tocados (recall 0.527 en el benchmark), aunque con menor precisión que con briefs largos.

## Benchmarks y rendimiento

Resultados sobre 200 tareas retenidas de repositorios no vistos, briefs de 120 a 165 palabras (mediana 155), 2 muestras por tarea (400 ejecuciones por modelo), temperatura 0,85, top-p 0,95, top-k 20. Recall@12 es la proporción de ficheros correctos en la lista final de como máximo 12, tras la cascada de retrieval.

| Modelo | Recall@12 | Turnos por búsqueda | Tokens por búsqueda | Coste por búsqueda |
|---|---|---|---|---|
| wayfinder-qwen (inicio supervisado) | 0.744 | 7.9 | 213k | $0.047 |
| wayfinder-qwen-eff | 0.743 | 5.3 | 106k | $0.026 |
| Diferencia | -0.001 (±0.010) | -2.6 (±0.2) | -107k (±11k) | -$0.021 (±0.003) |

Con consultas de una línea (asunto de commit) sobre las mismas 200 tareas: recall 0.527 frente a 0.544 del modelo supervisado (diferencia -0.017, intervalo -0.030 a -0.003), con 105k frente a 240k tokens. En una comprobación de 20 tareas y una semilla servida con vLLM, los turnos y tokens coincidieron con el modelo servido en Tinker (5,2 frente a 5,15 turnos; 91k frente a 93k tokens) y el recall fue 0.81 frente a 0.84, dentro del ruido de 20 tareas. El modelo eff presentó informe final en las 400 ejecuciones; wayfinder-qwen no lo hizo en el 1,3% de las suyas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 35.951.822.704 parámetros en bf16, los pesos ocupan aproximadamente 71,9 GB (tamaño del repositorio), a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no se especifican en la model card. Por tamaño de pesos, un despliegue en bf16 requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU; en consumer GPU solo cabría con cuantización, cuyos ficheros no se publican en este repositorio.
- Opciones de despliegue: se ha validado el servicio con vLLM (comprobación de 20 tareas) y es compatible con `transformers`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se reporta el consumo por búsqueda (5,3 turnos y 106k tokens de media) y el coste con precios de lista de Tinker.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall@12 (briefs largos) | Turnos | Tokens | Licencia |
|---|---|---|---|---|---|---|
| wayfinder-qwen-eff | 35B totales / 3B activos | no disponible | 0.743 | 5.3 | 106k | Apache-2.0 + Muse Model License |
| wayfinder-qwen | 35B totales / 3B activos | no disponible | 0.744 | 7.9 | 213k | no disponible en la información proporcionada |
| Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |

La comparación relevante es contra su predecesor supervisado: misma familia y mismo conjunto de herramientas, con una reducción de turnos y tokens a cambio de una pérdida de recall dentro del intervalo en briefs largos y de 0,017 puntos en consultas de una línea. Frente al modelo base Qwen3.6-35B-A3B no hay cifras publicadas de la tarea de búsqueda.

## Limitaciones y advertencias

- Un solo entrenamiento y una sola semilla: la diferencia de recall frente a wayfinder-qwen está dentro del intervalo, pero otra ejecución podría dar otro resultado.
- No medido: la tasa de acierto de codificación de extremo a extremo usando este buscador, ni tareas fuera de los repositorios y lenguajes del conjunto retenido.
- El hábito de eficiencia penaliza el recall en consultas cortas de una línea (0.527 frente a 0.544); conviene usar briefs largos.
- Solo se declara inglés, lo que limita su uso con peticiones en castellano u otros idiomas.
- Licencia derivada: los pesos son un Derivative bajo la Muse Model License además de Apache-2.0; deben acompañarse `LICENSE-MUSE-SPARK-OPEN.md` y `USE_POLICY-MUSE-SPARK-OPEN.md`, y la atribución debe aparecer en cualquier producto o servicio que los use. Revisar las restricciones de uso comercial antes de desplegar.
- Riesgo de alucinación en la lista final de ficheros: el modelo puede citar rutas inexistentes; el benchmark aplica una cascada de retrieval con reranking que conviene replicar en producción.
- El repositorio no incluye datos de entrenamiento, trayectorias ni texto de las tareas, lo que dificulta auditar el sesgo del ajuste.
- El coste reportado usa precios de lista de Tinker, no el coste de autohospedaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b-eff
- Modelo predecesor (wayfinder-qwen): https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b
- Modelo base (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Muse Spark Open: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b-eff/blob/main/LICENSE-MUSE-SPARK-OPEN.md
