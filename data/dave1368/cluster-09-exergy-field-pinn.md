# dave1368/cluster-09-exergy-field-pinn

## Resumen

`dave1368/cluster-09-exergy-field-pinn` es un Physics-Informed Neural Network (PINN) desarrollado por dave1368 que predice tres magnitudes termodinámicas de un motor térmico genérico: generación de entropía, destrucción de exergía y eficiencia del ciclo, a partir de las temperaturas de los focos caliente y frío y de un parámetro espacial abstracto. Forma parte del noveno clúster del framework "Scientific AI Cluster Orchestration Framework", que combina esta red neuronal con límites simbólicos exactos de Carnot y Curzon-Ahlborn, supervisados por un grafo de LangGraph.

El modelo destaca por imponer una restricción física dura: la generación de entropía se construye con una activación Softplus, garantizando estructuralmente que nunca sea negativa, en cumplimiento de la Segunda Ley de la Termodinámica. La destrucción de exergía se calcula mediante la identidad exacta de Gouy-Stodola a partir de la entropía generada, en lugar de aprenderse como una salida independiente. Con aproximadamente 4.700 parámetros y una arquitectura de dos capas ocultas de 64 neuronas, es un modelo extremadamente ligero, entrenado con 60.000 puntos sintéticos generados a partir de identidades termodinámicas exactas, no de datos medidos.

La relevancia actual de este modelo radica en su enfoque de "IA científica" que integra leyes físicas directamente en la arquitectura, reduciendo la dependencia de datos empíricos y garantizando comportamientos físicamente consistentes. Aunque no es un modelo de lenguaje ni de visión, representa una tendencia creciente en el uso de PINNs para problemas de ingeniería y física computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con 2 capas ocultas de 64 neuronas, activación Tanh, cabeza de salida con Softplus para entropía |
| Parametros totales | ~4.700 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de regresión, no de texto) |
| Tipos de cuantizacion | No disponible (checkpoint en precisión completa, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No aplica (modelo numérico, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) con diccionario que incluye `model_state_dict` y metadatos de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un MLP denso con dos capas ocultas de 64 neuronas y activación Tanh. La entrada tiene 5 características: coordenadas espaciales (x, y), temperatura normalizada (que representa el "presupuesto de déficit de Carnot" en el rango [0, η_Carnot)) y las temperaturas de los focos caliente (Th) y frío (Tc) en Kelvin. La salida son tres valores: generación de entropía, destrucción de exergía y eficiencia. La generación de entropía se produce a través de una capa final con activación Softplus, lo que garantiza matemáticamente que la salida sea siempre no negativa, cumpliendo la Segunda Ley por construcción. La destrucción de exergía no se aprende como una salida independiente, sino que se calcula exactamente mediante la identidad de Gouy-Stodola (`exergy_destroyed = T₀ × entropy_generated`), donde T₀ es la temperatura de referencia.

El entrenamiento se realizó con 60.000 puntos de entrenamiento y 10.000 de validación, generados a partir de identidades termodinámicas exactas: la desigualdad de Clausius, el balance de energía (`η = η_Carnot − Tc·s_gen`) y el teorema de Gouy-Stodola. El dominio de entrenamiento cubre Th ∈ [100, 1500] °C y Tc ∈ [−50, 100] °C, con la restricción Th > Tc. La pérdida final fue de 7.30e-05 en entrenamiento y 7.29e-05 en validación (MSE sobre objetivos normalizados). No se utilizó RLHF ni DPO, ya que no es un modelo generativo de lenguaje. El modelo fue validado posteriormente contra las fórmulas clásicas de Carnot, Clausius, Gouy-Stodola y Curzon-Ahlborn, con errores inferiores al 1% en la escala de eficiencia.

## Capacidades

- Predicción de generación de entropía, destrucción de exergía y eficiencia de un motor térmico genérico a partir de temperaturas de focos y coordenadas espaciales.
- Cumplimiento estructural de la Segunda Ley de la Termodinámica: la salida de entropía es siempre no negativa por diseño (Softplus).
- Cálculo exacto de la destrucción de exergía mediante la identidad de Gouy-Stodola, sin necesidad de una cabeza de red adicional.
- Validación contra límites termodinámicos clásicos: Carnot, Clausius, Gouy-Stodola y Curzon-Ahlborn, con errores inferiores al 1% en eficiencia.
- Inferencia extremadamente ligera: ~4.700 parámetros, ejecutable en CPU sin GPU.
- Integración con un framework de orquestación (LangGraph) que incluye comprobaciones de seguridad simbólicas.

## Casos de uso

- Diseño conceptual de motores térmicos: el modelo permite estimar rápidamente la eficiencia máxima alcanzable y la destrucción de exergía para un par de temperaturas de focos, útil en fases iniciales de diseño de ciclos de potencia.
- Optimización de procesos industriales: en plantas de cogeneración o recuperación de calor, se puede usar para explorar el impacto de variaciones de temperatura en la eficiencia global y en las pérdidas exergéticas, sin necesidad de simulaciones CFD costosas.
- Educación en termodinámica: como herramienta didáctica interactiva (el Space de HuggingFace lo demuestra) para visualizar cómo cambian la entropía generada y la eficiencia con las temperaturas de los reservorios, complementando las fórmulas analíticas.
- Verificación de modelos de simulación: el PINN puede servir como un "oráculo" rápido para comprobar si los resultados de simulaciones más complejas (por ejemplo, dinámica de fluidos computacional) respetan los límites termodinámicos.
- Integración en pipelines de optimización multiobjetivo: al ser tan ligero, puede evaluarse millones de veces en segundos, permitiendo su uso en algoritmos genéticos o de optimización bayesiana para encontrar combinaciones de temperaturas que maximicen eficiencia.
- Prototipado de sistemas de control predictivo: en aplicaciones de gestión térmica en tiempo real, el modelo puede predecir la eficiencia instantánea de un motor basándose en temperaturas medidas, alimentando controladores que ajusten parámetros operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no pertenece a esas categorías. En su lugar, la model card presenta una validación contra fuentes clásicas de la termodinámica, que se resume a continuación:

| Comprobación | Resultado |
|---|---|
| Fórmulas de Carnot y Curzon-Ahlborn vs. recomputación independiente | Coincidencia exacta en todos los pares (Th, Tc) probados |
| η_CA ≤ η_Carnot, comprobado en 420 pares (Th, Tc) | Cero violaciones |
| Identidad eficiencia/generación de entropía, re-derivada desde Clausius | Autoconsistente hasta 9 decimales |
| Fórmula de Gouy-Stodola vs. T₀ independiente | Coincidencia exacta |
| Eficiencia predicha por la red vs. identidad exacta | Errores inferiores al ~1% de la escala de eficiencia |
| Comprobación de la Segunda Ley | Garantizada estructuralmente (Softplus) |
| Comprobación del límite de Carnot | Solo detecta eficiencia excesivamente alta, no negativa (ver limitaciones) |

## Requisitos de hardware

- VRAM estimada: menos de 1 MB en inferencia (el modelo tiene ~4.700 parámetros, en float32 ocupa ~19 KB; el checkpoint completo es de tamaño despreciable).
- GPU recomendada: ninguna necesaria; cualquier CPU moderna ejecuta la inferencia en microsegundos. Si se usa GPU, cualquier modelo (incluso integradas) es suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en Raspberry Pi, microcontroladores con soporte PyTorch, o incluso en navegador si se exporta a ONNX o WebAssembly.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX para inferencia en otros runtimes, o integración en el Space de HuggingFace (ya disponible). No aplica vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones formales, pero dado el tamaño, se puede estimar una latencia por inferencia inferior a 1 ms en CPU moderna y un throughput de decenas de miles de inferencias por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros PINNs específicamente orientados a la predicción de exergía y eficiencia de motores térmicos con la misma arquitectura y restricciones. La comparativa más relevante es contra las soluciones analíticas clásicas:

| Modelo / enfoque | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cluster-09-exergy-field-pinn` | ~4.700 | No aplica | Error <1% vs. identidades exactas | MIT | HuggingFace |
| Fórmula de Carnot (analítica) | 0 | No aplica | Exacta para límite ideal | Dominio público | Universal |
| Fórmula de Curzon-Ahlborn (analítica) | 0 | No aplica | Exacta para potencia máxima | Dominio público | Universal |

La ventaja del PINN frente a las fórmulas analíticas es que proporciona una salida continua y diferenciable sobre el dominio espacial (x, y), lo que permite integrarlo en optimizaciones numéricas y análisis de sensibilidad, aunque para casos puramente puntuales las fórmulas clásicas son más precisas y simples.

## Limitaciones y advertencias

- La comprobación de la Segunda Ley es estructural (Softplus) y no puede distinguir entre un modelo bien entrenado y uno mal entrenado; solo garantiza que la entropía no sea negativa, no que los valores sean correctos.
- La comprobación del límite de Carnot solo detecta eficiencias excesivamente altas; una eficiencia negativa (físicamente absurda) pasaría la comprobación. En la práctica, el modelo entrenado produce eficiencias razonables, pero la comprobación por sí sola no es una prueba completa de cordura.
- El modelo representa las identidades termodinámicas generales de un motor térmico, no un ciclo específico (Rankine, Brayton, etc.). Las coordenadas espaciales (x, y) son un barrido abstracto de puntos de operación, no la geometría física de un motor real.
- El checkpoint se carga con `weights_only=False` en PyTorch, lo que implica un riesgo de seguridad si el archivo proviene de una fuente no confiable. Se recomienda verificar la procedencia antes de cargarlo.
- No hay soporte para cuantización ni versiones optimizadas para despliegue en producción; el formato es un checkpoint de PyTorch estándar.
- Al ser un modelo de regresión numérica, no tiene capacidades de generación de texto, razonamiento simbólico ni interacción en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dave1368/cluster-09-exergy-field-pinn
- Space interactivo (demo): https://huggingface.co/spaces/dave1368/cluster-09-thermal-exergy
- Framework de orquestación (referenciado en la model card): https://huggingface.co/spaces/dave1368/cluster-09-thermal-exergy (mismo enlace, incluye documentación del framework)
- Artículo de referencia sobre PINNs (contexto general, no específico del modelo): https://link.springer.com/article/10.1007/s10462-025-11322-7
- Encuesta sobre PINNs (MDPI): https://www.mdpi.com/2673-2688/5/3/74
