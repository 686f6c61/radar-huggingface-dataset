# dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2

## Resumen

SO-CODE L4-CODE es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de la familia SemSimula, una línea de trabajo que explora modelos de lenguaje conservativos basados en mecánica lagrangiana en lugar de la atención transformer. Este modelo concreto es una ablación de profundidad sobre el modelo base SO-CODE: mantiene fijo el tiempo total de integración T = L · Δt = 8 y lo reparte en cuatro pasos más cortos (Δt = 2) en lugar de dos pasos largos (Δt = 4), de modo que solo cambia el número de capas.

El modelo resuelve una pregunta de investigación concreta: si en código Python el modelo conservativo va por detrás de un GPT-2 emparejado en un 21 % a dos capas, ¿ayuda la profundidad? La respuesta es que sí: gana un 8,5 % de perplejidad respecto a SO-CODE (5,48 frente a 6,00), el mayor incremento de cualquier cambio probado sobre código, y cierra el 47 % de la brecha que separa a SO-CODE del GPT-2 emparejado (4,96).

Es relevante ahora porque forma parte de un estudio preregistrado (protocolo registrado el 27 de octubre de 2026, antes de la ejecución) sobre arquitecturas no transformer, sin atención y con memoria constante en inferencia. El modelo tiene 76.625.361 parámetros, está entrenado sobre 315.392.000 tokens de CodeParrot y se distribuye con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (no transformer, sin atención) basado en un flujo de segundo orden amortiguado en un potencial escalar aprendido; integración con potencial gaussiano anisotrópico, espacio de Fock y geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 76.625.361 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura abandona el transformer y la atención por completo. Cada capa avanza los estados de los tokens un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido; el modelo es totalmente conservativo (fully-conservative), con un banco de pozos V_θ compartido entre capas, escalas V_φ y canales de contexto también compartidos. Las capas adicionales no añaden capacidad de representación: añaden pasos de integración. Los 53.252 parámetros extra respecto a SO-CODE corresponden al código de profundidad para el banco (3.840), las escalas V_φ (2) y las puertas de destrucción de registros (49.410), que en este modelo conservativo no tienen camino hacia los tokens. La inferencia tiene memoria constante por construcción (attention-free).

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean, con el schedule WSD de la serie durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. SO-CODE y este modelo arrancan desde el paso 0 con semilla 0 sobre los mismos lotes, de modo que las evaluaciones están emparejadas paso a paso. La ejecución duró 10,9 horas en una sola sesión (2,04 s por paso, sin checkpointing de capas en entrenamiento y con checkpointing solo en evaluación), sin disparos del watchdog; la norma del gradiente tiene mediana 0,38 tras el paso 2.000 y máximo 2,06 en el paso 550 (warmup), y el monitor de fugas SCAF se mantuvo limpio en las cuatro auditorías.

## Capacidades

- Generación de texto y modelado de lenguaje sobre código Python (dominio de entrenamiento).
- Predicción de siguiente token con perplejidad de validación de 5,48 sobre CodeParrot clean.
- Inferencia con memoria constante, sin coste de atención cuadrático en la longitud de secuencia.
- Modelo de investigación orientado a ablaciones controladas de mecanismo (profundidad, paso de integración, rutas de registro).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe no documentada; el modelo declara únicamente inglés.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de datos controlado para estudiar cómo afecta la profundidad cuando el tiempo total de integración se mantiene fijo, gracias a que comparte lotes y semilla con SO-CODE.
- Estudios de ablación reproducibles: el preregistro y las evaluaciones emparejadas paso a paso permiten replicar comparaciones de perplejidad con intervalos de confianza acotados.
- Modelado de lenguaje sobre código Python en entornos de investigación: entrenado sobre CodeParrot clean, puede usarse para medir perplejidad y calidad de modelado en dominios de código.
- Experimentos de eficiencia en inferencia: su naturaleza sin atención y de memoria constante lo hace adecuado para estudiar el coste de memoria en secuencias largas frente a transformers.
- Validación de modelos físicamente informados: útil para contrastar la hipótesis de que un flujo conservativo de segundo orden puede competir con arquitecturas estándar en modelado de lenguaje.
- Base para estudios de mecánica lagrangiana aplicada al aprendizaje: la serie incluye variantes (FOCK-CODE, FO-b-CODE) que permiten aislar el efecto de cada mecanismo sobre el mismo conjunto de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre CodeParrot clean (Python), split de validación, perplejidad en bloque 512:

| Modelo | Capas | Δt | Perplejidad asentada | Frente a SO-CODE |
|---|---:|---:|---:|---:|
| SO-CODE (base) | 2 | 4 | 6,00 | — |
| L4-CODE (este modelo) | 4 | 2 | 5,48 | −8,5 % |
| L8-CODE (en ejecución) | 8 | 1 | no disponible | no disponible |
| GPT-2 emparejado (8 capas, d=384) | 8 | — | 4,96 | −17,3 % |
| FOCK-CODE | — | — | 5,66 | −5,6 % |
| FO-b-CODE (flujo de primer orden) | 2 | — | 6,55 | +9,2 % |

La perplejidad asentada de este modelo es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,37, 5,50 y 5,59); el mejor valor es 5,37 en el paso 18.000. Comparación emparejada por paso (diferencia media en log-perplejidad, nats):

| Pasos | L4-CODE − SO-CODE | L4-CODE − FOCK-CODE |
|---|---:|---:|
| 2.000–4.000 (5 evals) | −0,293 (SD 0,066), −25,4 % | −0,095 (SD 0,040), −9,1 % |
| 8.000–13.000 (11 evals) | −0,098 (SD 0,007), −9,3 % | −0,025 (SD 0,003), −2,5 % |
| 16.000–19.000 (7 evals) | −0,088 (SD 0,004), −8,4 % | −0,030 (SD 0,003), −3,0 % |

El modelo va por detrás en warmup (pasos 500 y 1.000, +6 %), lidera desde el paso 1.500 y alcanza su máxima ventaja en el paso 2.500 (−32 %: 10,78 frente a 15,80), manteniéndose en un 8–9 % de ventaja desde el paso 11.000.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 76,6 M de parámetros, en fp32 ocupa aproximadamente 0,3 GB de pesos, y en fp16/bf16 unos 0,15 GB, aunque el autor no publica cifras de memoria de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) podría alojar los pesos, pero la implementación requiere el código específico de la arquitectura, no disponible como plugin estándar.
- Cabe en GPU consumer: sí por tamaño de parámetros, aunque la viabilidad práctica depende de la implementación del flujo conservativo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es PyTorch.
- Latencia y throughput: el entrenamiento registró 2,04 s por paso con lotes de 32 × 512; no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| L4-CODE (este modelo) | 76,6 M | no disponible (bloques de 512) | 5,48 | CC-BY-4.0 | Hugging Face |
| SO-CODE | 76,6 M | no disponible | 6,00 | CC-BY-4.0 (según serie) | Hugging Face |
| FOCK-CODE | no disponible | no disponible | 5,66 | no disponible | No en el Hub |
| GPT-2 emparejado (8 capas, d=384) | no disponible | no disponible | 4,96 | no disponible | No en el Hub |

La comparativa se limita a la propia serie SemSimula y al GPT-2 emparejado del estudio; no se dispone de datos de benchmarks frente a modelos de código de propósito general.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Dominio restringido a código Python (CodeParrot clean); el rendimiento fuera de ese dominio no está evaluado.
- Perplejidad de validación de 5,48, todavía un 10,5 % por encima del GPT-2 emparejado (4,96) en el mismo conjunto y schedule.
- Solo declara inglés; no hay evidencia de capacidades multilingües.
- Resultados de benchmarks no verificados (`verified: false` en el model-index) y procedentes del propio autor.
- La hipótesis L4b (ganancia en tokens de largo alcance) se cumplió en la letra (+2,9 puntos) pero no es distinguible de cero (intervalo del 95 %: −1,8 a +7,9 puntos).
- No se documentan sesgos, riesgo de alucinación ni restricciones adicionales de la licencia CC-BY-4.0 más allá de la atribución.
- La implementación requiere el código específico de la arquitectura; no hay soporte estándar en frameworks de inferencia habituales.
- El modelo es totalmente conservativo y las puertas de destrucción de registros (49.410 parámetros) no tienen camino hacia los tokens, lo que limita la interpretación de esa parte de los parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Modelo base SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Variante FO-b-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Colección de profundidad sobre código: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
