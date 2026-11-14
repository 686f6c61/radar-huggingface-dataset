# kishxrx/ARTN

## Resumen

ARTN (Adaptive Recursive Ternary Networks) es un modelo de lenguaje de generación de texto desarrollado por el usuario independiente kishxrx, entrenado desde cero en hardware de consumo extremadamente limitado: una CPU AMD de doble núcleo con 4 GB de RAM, sin GPU ni clúster. El modelo combina tres técnicas de eficiencia: pesos ternarios de 1.58 bits (BitLinear con valores {-1, 0, 1}), atado recursivo de parámetros (un único bloque compartido ejecutado hasta seis veces) y una compuerta de parada aprendida (halting gate) que decide por token cuándo detener las pasadas recursivas. El resultado es un modelo de 2.904.065 parámetros que reduce en un 50,2 % el número de parámetros respecto a una línea base FP32 equivalente.

El modelo se entrenó sobre el corpus TinyStories (historias infantiles sintéticas) durante 10.000 pasos en 14,35 horas, alcanzando una pérdida de validación de 2,0346 (perplejidad 7,65) y una NLL justa sin padding de 2,904. La compuerta de parada converge a 4,00 pasadas esperadas en entrenamiento y promedia 3,57 pasadas en inferencia con umbral 0,9, reduciendo el cómputo un 40 % a cambio de un 0,08 % de coste en NLL.

Su relevancia es fundamentalmente metodológica: demuestra que es viable entrenar un modelo de lenguaje funcional con pesos ternarios y computación adaptativa en un entorno de recursos mínimos, y documenta con detalle un proceso de depuración de 8 intentos de entrenamiento (5 fallidos, 211.000 pasos totales, más de 390 horas) que culminó en la identificación de un bug en el optimizador. No obstante, sus capacidades lingüísticas están acotadas al dominio de TinyStories y al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con BitLinear 1.58-bit ternario, bloque único compartido recursivo (hasta 6 pasadas) y halting gate aprendida |
| Parametros totales | 2.904.065 |
| Parametros activos | No aplica (no es MoE); el bloque compartido contiene 789.760 parámetros |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos ternarios nativos {-1, 0, 1} con straight-through estimation; no se documentan otros formatos de cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | Checkpoint PyTorch `artn_step_10000.pt` (34 MB) |

## Arquitectura y entrenamiento

ARTN es un transformer con embeddings de token y posición no compartidos, seguido de un único BitLinearBlock cuyos pesos se reutilizan hasta seis veces (atado recursivo de parámetros). Cada peso del bloque es ternario, restringido al conjunto {-1, 0, 1} mediante straight-through estimation, lo que reduce el footprint de parámetros a la mitad respecto a FP32 (2.904.065 frente a 5.828.608). Tras cada pasada, una halting gate implementada como `sigmoid(W·x)` evalúa por token y por pasada si la representación ha convergido; si la probabilidad supera el umbral θ, la posición deja de actualizarse. En entrenamiento se ejecutan las seis pasadas para obtener gradientes exactos, mientras que el ahorro computacional de la parada adaptativa se aplica solo en inferencia. La cabeza final es `ln_f` más `lm_head`.

El entrenamiento se realizó sobre TinyStories durante 10.000 pasos con AdamW, schedule coseno y gradient clipping, en 14,35 horas sobre CPU de doble núcleo con 4 GB de RAM. La model card documenta que los intentos previos con un optimizador tipo Adafactor fallaron por un bug que sobrescribía las actualizaciones escaladas por varianza con actualizaciones solo de momento, comportándose como SGD con momento y produciendo texto incoherente pese a pérdidas aparentemente sanas; el cambio a AdamW resolvió el problema. El entrenamiento final no registró ninguna pérdida NaN/Inf y la compuerta de parada convergió a 4,00 pasadas esperadas.

## Capacidades

- Generación de texto narrativo en inglés, limitado al dominio de historias infantiles sintéticas de TinyStories.
- Razonamiento y conocimiento general: no disponible; el modelo no se ha evaluado ni entrenado para estas tareas.
- Generación de código y matemáticas: no disponible.
- Tool calling / function calling: no soportado según la información disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidad especial: computación adaptativa mediante halting gate, con un promedio de 3,57 pasadas por token en inferencia (frente a 6 máximas) y un coste de 0,08 % en NLL.
- Pesos ternarios de 1.58 bits que permiten inferencia y entrenamiento en CPU de bajos recursos.

## Casos de uso

- Investigación sobre cuantización ternaria: ARTN sirve como banco de pruebas reproducible para estudiar el efecto de pesos {-1, 0, 1} con straight-through estimation en un modelo pequeño, con métricas de pérdida y estabilidad documentadas paso a paso.
- Estudio de computación adaptativa: la halting gate permite analizar empíricamente el equilibrio entre número de pasadas recursivas y calidad de salida; el umbral θ es ajustable y la model card reporta el trade-off medido (3,57 pasadas, 0,08 % de NLL).
- Experimentos de atado de parámetros: al usar un único bloque compartido de 789.760 parámetros ejecutado seis veces, es un caso de estudio para medir cuánta capacidad se pierde frente a bloques independientes en un transformer pequeño.
- Educación y docencia: el modelo, su checkpoint de 34 MB y la documentación de 11.000 líneas permiten ilustrar el ciclo completo de entrenamiento, depuración de optimizadores y evaluación en un curso de aprendizaje automático sin necesidad de GPU.
- Generación de cuentos sintéticos para pruebas: puede producir narrativas cortas en inglés del estilo TinyStories para prototipos de pipelines de generación de texto o para aumentar datasets sintéticos de dominios infantiles.
- Reproducción de bajo coste: cualquier desarrollador con una CPU de doble núcleo y 4 GB de RAM puede ejecutar el checkpoint y replicar el flujo de inferencia con decodificación greedy y penalización de repetición consciente de signo de 1,3.
- Validación de infraestructura de entrenamiento en CPU: el registro de 8 intentos y 62 fases de investigación sirve como referencia para diagnosticar fallos silenciosos de optimizadores en entornos sin GPU.

## Benchmarks y rendimiento

| Metrica | ARTN (BitLinear + recursivo + halting) | BitLinear (referencia) | FP32 (referencia) |
|---|---|---|---|
| Perdida de validacion | 2,0346 (perplejidad 7,65) | 1,92 (intento 7) | 1,69 (intento 6) |
| NLL justa sin padding | 2,904 | 2,743 | 2,423 |
| Parametros totales | 2.904.065 | No disponible | 5.828.608 |
| Pasadas promedio en inferencia | 3,57 (umbral 0,9) | No aplica | No aplica |
| Perdidas NaN/Inf | 0 | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU. El checkpoint ocupa 34 MB y el modelo completo cabe holgadamente en 4 GB de RAM.
- GPU recomendadas: no se documentan; el entrenamiento y la inferencia se validaron en CPU de doble núcleo AMD.
- Cabe en GPU de consumo: sí, por tamaño (2,9 M de parámetros), aunque no se han publicado pruebas en GPU.
- Opciones de despliegue: PyTorch (librería declarada en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento de 10.000 pasos requirió 14,35 horas en CPU de doble núcleo, lo que da una referencia aproximada del orden de magnitud del cómputo disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARTN | 2.904.065 | No disponible | Ternario 1.58-bit, recursivo, halting gate, CPU-only | GPL-3.0 | Hugging Face (kishxrx/ARTN) |
| BitLinear (referencia del autor) | No disponible | No disponible | Ternario 1.58-bit sin recursión ni halting | No disponible | Solo como resultado interno del autor |
| FP32 baseline (referencia del autor) | 5.828.608 | No disponible | Transformer FP32 convencional | No disponible | Solo como resultado interno del autor |

No se dispone de comparación con modelos públicos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con TinyStories, genera narrativas infantiles en inglés y no tiene conocimiento general, código ni matemáticas.
- Riesgo alto de alucinación fuera de dominio: cualquier prompt ajeno al estilo TinyStories producirá texto incoherente o sin sentido.
- Idiomas: solo inglés; no soporta castellano ni otros idiomas.
- Longitud de contexto: no documentada, lo que impide planificar su uso en conversaciones multi-turno o documentos largos.
- Licencia GPL-3.0: impone obligaciones de copyleft; el uso comercial en productos derivados requiere liberar el código bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Tamaño muy reducido (2,9 M de parámetros): capacidad limitada incluso dentro de su dominio; los ejemplos de generación muestran repeticiones y errores de coherencia (por ejemplo, referencias inconsistentes entre personajes).
- Sin soporte documentado de tool calling, agentes ni formatos de despliegue estándar (GGUF, vLLM), lo que limita su integración en producción.
- El autor documenta 5 intentos de entrenamiento fallidos y un bug silencioso de optimizador; aunque el checkpoint final es estable, conviene tratar los resultados como experimentales.
- Sin benchmarks estándar publicados, por lo que no es posible comparar su calidad objetiva con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kishxrx/ARTN
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
