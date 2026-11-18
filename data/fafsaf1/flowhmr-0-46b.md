# fafsaf1/flowhmr-0.46B

## Resumen

FlowHMR es un modelo de captura de movimiento humano en 3D a partir de vídeo monoculo, desarrollado por el autor de Hugging Face `fafsaf1` (los contactos de licencia indicados en la model card son Linchao Bao y Zhanke Wang). No es un modelo de lenguaje: es un modelo generativo de movimiento que reformula el *human mesh recovery* (HMR) como un problema de generación de movimiento condicionada por vídeo, resolviendo la ambigüedad de profundidad inherente a la regresión directa desde una sola cámara.

La arquitectura se basa en *flow matching* (modelos de flujo continuo) con aproximadamente 0,46 mil millones de parámetros, preentrenado para generar candidatos de movimiento diversos a partir del vídeo, y posteriormente ajustado con Group Relative Policy Optimization (GRPO) usando dos recompensas: fidelidad al vídeo y trackeabilidad física. El resultado es un modelo que produce movimiento global físicamente plausible, es decir, que un controlador basado en física puede seguir sin fallos.

Su relevancia actual radica en que supera al estado del arte en fidelidad de movimiento sobre el nuevo benchmark Wild-4K (unas 4.000 vídeos de internet) y eleva la tasa de éxito de tracking físico al 82,47 % frente al 62,82 % de GVHMR, el mejor baseline. El modelo se distribuye únicamente para fines no comerciales de investigación y educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (generativa) condicionada por vídeo, con post-entrenamiento GRPO |
| Parametros totales | 0,46 B (según nomenclatura del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de vídeo, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión/movimiento, no lingüístico) |
| Licencia | FlowHMR Model Weights License (solo uso no comercial: educativo, investigación y sin ánimo de lucro) |
| Formato de pesos | no disponible (repo de 3,7 GB; pesos `flowhmr_base` y `flowhmr_latest`) |

## Arquitectura y entrenamiento

FlowHMR plantea la captura de movimiento desde vídeo monoculo como un problema de generación de movimiento condicionada por vídeo, en lugar de regresión directa. La razón es que la profundidad es ambigua con una sola cámara y la regresión tiende a colapsar hacia una solución promedio. Para evitarlo, el modelo se preentrena con *flow matching*, una familia de modelos generativos de flujo continuo que aprenden un campo vectorial entre una distribución simple y la distribución de movimientos plausibles. Dado un vídeo de entrada, el modelo preentrenado genera múltiples candidatos de movimiento diversos.

En una segunda fase, el modelo se post-entrena con Group Relative Policy Optimization (GRPO), un algoritmo de optimización por preferencias relativo a un grupo de muestras, con dos recompensas: una de fidelidad, que premia la coherencia con el vídeo de entrada, y otra de tracking, que premia movimientos que un controlador físico puede seguir con éxito. Estas recompensas desplazan la preferencia de salida del modelo hacia movimientos fieles al vídeo y físicamente realizables. El entrenamiento se complementa con el dataset Wild-4K, unas 4.000 grabaciones de internet, para evaluar la recuperación de movimiento en condiciones reales. No se detalla en la información disponible el número de tokens, la composición exacta del corpus de entrenamiento ni los detalles del controlador físico empleado.

## Capacidades

- Generación de movimiento humano global en 3D a partir de vídeo monoculo.
- Producción de múltiples candidatos de movimiento diversos por cada vídeo de entrada (muestreo generativo).
- Generación de movimiento físicamente plausible y trackeable por un controlador basado en física.
- Recuperación de movimiento global (no solo pose relativa a la cámara).
- Evaluación y comparación sobre el benchmark Wild-4K de vídeos de internet.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales: post-entrenamiento con GRPO y recompensas de fidelidad y tracking; no se documentan modos *thinking*, visión genérica, audio ni otras modalidades.

## Casos de uso

- **Animación y producción de videojuegos:** el modelo extrae movimiento global 3D de vídeo de referencia monoculo y genera candidatos de animación que pueden retargetearse a un esqueleto de personaje, reduciendo el coste de captura con trajes o estudios.
- **Análisis deportivo:** a partir de vídeo de una sola cámara (móvil o broadcast), FlowHMR recupera la trayectoria global del atleta y permite analizar desplazamientos, apoyos y coordinación con mayor fidelidad que la regresión directa.
- **Rehabilitación y biomecánica:** el movimiento generado es físicamente plausible y trackeable, lo que facilita su uso en estudios de marcha y evaluación funcional donde importa la coherencia física de la trayectoria.
- **Robótica e imitación de movimiento:** al garantizar que un controlador físico puede seguir el movimiento (82,47 % de éxito de tracking), el modelo sirve para generar demostraciones para *learning from demonstration* y control de humanoides.
- **Postproducción VFX:** integración de actores reales en escenas 3D con movimiento global consistente, usando los candidatos generados para elegir el que mejor encaje con la cámara virtual.
- **Investigación en visión por computador:** como baseline generativo para estudiar la ambigüedad de profundidad en HMR y para evaluar métodos sobre Wild-4K en condiciones no controladas.
- **Creación de datasets de movimiento:** generación de múltiples movimientos plausibles por vídeo para aumentar datos de entrenamiento de otros modelos de captura o de control.

## Benchmarks y rendimiento

| Benchmark / metrica | FlowHMR | GVHMR (mejor baseline) |
|---|---|---|
| Tasa de exito de tracking fisico | 82,47 % | 62,82 % |
| Fidelidad de movimiento (Wild-4K) | Superior al estado del arte (cualitativa y cuantitativamente) | Referencia del estado del arte |

No se han publicado en la información disponible cifras numéricas adicionales (MPJPE, error de velocidad, etc.) ni resultados en otros benchmarks distintos de Wild-4K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 0,46 B de parámetros, los pesos en precisión de 32 bits ocuparían aproximadamente 1,8 GB y en 16 bits unos 0,9 GB, pero el repositorio ocupa 3,7 GB, por lo que la huella real de inferencia (incluyendo codificadores de vídeo y assets del cuerpo) no está documentada.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs de consumo, pero no se especifica en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del modelo es compatible con GPUs de consumo, pero no hay requisitos oficiales publicados.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Tracking fisico (Wild-4K) | Licencia |
|---|---|---|---|---|
| FlowHMR | 0,46 B | Flow matching + GRPO | 82,47 % | Solo no comercial |
| GVHMR | no disponible | HMR basado en aprendizaje (baseline) | 62,82 % | no disponible |
| Otros metodos de HMR del estado del arte | no disponible | Regresion / supervision geometrica | Inferior a FlowHMR según el paper | no disponible |

La información disponible solo identifica a GVHMR como el baseline más fuerte; no se detallan parámetros, contexto ni licencia de las alternativas.

## Limitaciones y advertencias

- Licencia restringida: los pesos solo pueden usarse con fines educativos, de investigación y sin ánimo de lucro. El uso comercial requiere contacto con los autores (linchaobao@gmail.com o zhankewang0@gmail.com).
- La licencia cubre solo los pesos; el código, los modelos preentrenados de terceros, los assets del modelo corporal y los datasets tienen licencias propias.
- La captura desde vídeo monoculo sigue siendo ambigua en profundidad; el modelo mitiga el problema con generación y post-entrenamiento, pero no lo elimina.
- La plausibilidad física se mide con un controlador concreto; el 82,47 % de éxito implica que aproximadamente un 17,5 % de los movimientos generados no son trackeables.
- Riesgo de sesgo: el dataset Wild-4K procede de vídeos de internet, con la distribución demográfica y de escenas que ello conlleva; no se documentan análisis de sesgo.
- No hay información sobre idiomas, cuantizaciones ni formatos de pesos alternativos, lo que limita la planificación de despliegue.
- No se han publicado requisitos de hardware ni latencias, por lo que la viabilidad en producción no puede evaluarse con los datos disponibles.
- Alucinación en el sentido generativo: el modelo puede producir movimientos plausibles pero no fieles al vídeo; la recompensa de fidelidad reduce, pero no garantiza, la ausencia de este fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fafsaf1/flowhmr-0.46B
- Paper (arXiv): https://arxiv.org/abs/2610.03691
- Código: https://github.com/flowhmr/flowhmr
- Página del proyecto: https://flowhmr.github.io/
- Licencia de pesos: https://huggingface.co/fafsaf1/flowhmr-0.46B/blob/main/LICENSE
