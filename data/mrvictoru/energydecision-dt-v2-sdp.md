# mrvictoru/energydecision-dt-v2-sdp

## Resumen

`mrvictoru/energydecision-dt-v2-sdp` es un Decision Transformer (DT) entrenado mediante aprendizaje por refuerzo offline (offline RL) para el control de baterías a escala de red en el mercado eléctrico australiano (AEMO NEM). El modelo replica el comportamiento de un planificador SDP/MPC "honesto" (no clarividente, es decir, sin acceso a precios futuros) que optimiza el despacho de energía y las ofertas en los ocho servicios de control de frecuencia (FCAS) mediante programación dinámica estocástica y un agente greedy basado en precios corrientes. El resultado es un transformer autónomo que, en inferencia, no requiere ningún solver externo.

Desarrollado por `mrvictoru` como parte del proyecto de investigación `energydecision`, este modelo representa la etapa B (desplegable) del pipeline: un DT que supera a PPO en múltiples superficies de evaluación (3,4× en el escenario estándar de octubre, 2,1× en el escenario dispatch-matched, 1,83× en datos fuera de distribución de 2025) sin necesidad de resolver problemas de optimización en tiempo real. La arquitectura usa técnicas modernas de transformers (Grouped-Query Attention, QK-Norm, SwiGLU, RMSNorm y weight-tying) con una ventana de contexto de 210 pasos temporales (aproximadamente 17,5 horas a resolución de 5 minutos). El modelo está publicado bajo licencia MIT y su repositorio ocupa 1,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decision Transformer moderno (GQA, QK-Norm, SwiGLU, RMSNorm, weight-tying) |
| Parametros totales | no disponible (repo de 1,8 GB; estimable en el rango de 100–300 M según la configuracion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 210 timesteps (~17,5 horas a resolucion de 5 minutos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (formato de archivo no especificado; presumiblemente safetensors o binarios) |

## Arquitectura y entrenamiento

El modelo es un Decision Transformer que trata el problema de despacho de baterías como una tarea de predicción de secuencias. La entrada se compone de retornos a conseguir (returns-to-go), estados observados (18 dimensiones normalizadas) y acciones pasadas (9 dimensiones). La arquitectura consta de 8 bloques transformer con dimensión oculta 768, 12 cabezas de atención (6 de ellas compartidas como KV en GQA), normalización QK-Norm, activación SwiGLU, RMSNorm y weight-tying entre capas. La cabeza de acción es mixta: Tanh para la dimensión de energía (rango [-1, 1]) y Sigmoid para las 8 dimensiones de ofertas FCAS (rango [0, 1]).

El entrenamiento se realizó con datos simulados generados por un "profesor" SDP/MPC honesto (no clarividente) sobre datos históricos del mercado AEMO. El dataset `mrvictoru/AEMO_simulated_trade_sdp` contiene 3.133.440 filas en 320 episodios (5 regiones × 2 horizontes × 4 baterías × 8 réplicas). Se usó una configuración conservadora del profesor (`deg_cost_per_mwh=50`) para penalizar la degradación de la batería. El entrenamiento duró 3 épocas (1.251 pasos, 0,17 horas en GPU CUDA) con pérdida final de train 0,065968 y validación 0,041527. El optimizador fue AdamW con LR 3e-5 y weight decay 1e-4, descuento 0,95, y ventanas superpuestas con stride 105.

## Capacidades

- Generación de acciones de despacho energético continuo (carga/descarga) en el rango [-1, 1].
- Generación de 8 ofertas simultáneas para los servicios FCAS (RAISE/LOWER en 6 segundos, 60 segundos y 5 minutos, además de regulación) en el rango [0, 1].
- Condicionamiento por retorno a conseguir (return-to-go): permite especificar el objetivo de beneficio deseado.
- Manejo de contexto temporal de hasta 210 pasos (17,5 horas), suficiente para capturar ciclos diarios de precios y demanda.
- Integración de señales de mercado: precio de referencia (RRP), demanda total, precios FCAS, generación solar y eólica, y estado de carga de la batería (SOC).
- Inferencia sin solver: no requiere programación dinámica ni optimización en tiempo real.
- Capacidad de generalización a datos fuera de distribución (año 2025) con degradación controlada.

## Casos de uso

- Simulación de estrategias de trading de baterías en el mercado AEMO: el modelo permite evaluar políticas de despacho y ofertas FCAS en entornos simulados sin necesidad de resolver el SDP en cada paso, acelerando estudios de viabilidad económica.
- Benchmarking de algoritmos de RL offline: sirve como baseline sólido para comparar nuevos métodos de aprendizaje por refuerzo en dominios de energía, ya que supera a PPO en múltiples superficies de evaluación.
- Análisis de impacto en la red: el modelo puede utilizarse en estudios de estabilidad de red, evaluando cómo las ofertas FCAS de una batería afectan a los precios y a la operación del sistema.
- Investigación académica en offline RL: dado su diseño moderno (GQA, weight-tying, etc.) y su dominio específico, es un caso de estudio interesante para investigar la transferencia de políticas desde planificadores clásicos a transformers.
- Generación de datos sintéticos para entrenamiento de otros modelos: las trayectorias generadas por el profesor SDP pueden reutilizarse para entrenar variantes del DT (por ejemplo, con diferentes funciones de coste de degradación).
- Evaluación de robustez ante cambios de régimen de mercado: el modelo puede probarse con datos de 2025 (fuera de distribución) para estudiar su degradación y posibles estrategias de adaptación.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el DT SDP-Teacher contra PPO en diferentes superficies de evaluación:

| Superficie | SDP-Teacher DT | PPO | Veredicto |
|---|---|---|---|
| Estándar Oct (5 regiones) | 7.914 $ | 2.353 $ | DT 3,4× |
| Dispatch-matched (SA1 Jul–Dic) | 47.942 $ | 22.530 $ | DT 2,1× |
| Broad-2024 expandido | 11.943 $ | 19.504 $ | PPO gana (limitación del piloto) |
| 2025 OOD | 11.925 $ | 6.498 $ | DT 1,83× |
| Impacto (small/horn/torr) | 3,0× / 1,9× / 2,1× | — | DT gana |

No se han publicado resultados en benchmarks estándar de NLP o razonamiento (MMLU, HumanEval, etc.), ya que el modelo no está diseñado para tareas de lenguaje.

## Requisitos de hardware

- Tamaño del repositorio: 1,8 GB, lo que sugiere un modelo de tamaño moderado (probablemente < 500 M parámetros en fp32).
- VRAM estimada: para inferencia en fp32, con ~200–300 M parámetros, se necesitan entre 1 y 2 GB de VRAM. Con cuantización (no disponible oficialmente) podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente. En CPU también podría ejecutarse, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con frameworks de inferencia como PyTorch Serving, ONNX Runtime (si se exporta), o integrarse directamente en pipelines de simulación. No es un LLM, por lo que herramientas como vLLM, llama.cpp u Ollama no son aplicables.
- Latencia: no se especifica, pero para un transformer de este tamaño en GPU moderna se esperan latencias del orden de milisegundos por paso de decisión.

## Comparativa con modelos similares

No hay modelos comparables publicados en la misma categoría (Decision Transformers para trading de baterías en AEMO). El baseline principal es PPO, cuyos resultados se muestran en la tabla de benchmarks. El propio autor publica variantes del mismo modelo (v2, v2-impact) que difieren en el corpus de entrenamiento y en la consideración de impactos en la red. A continuación se comparan las variantes del autor:

| Modelo | Contexto | Entrenamiento | Rendimiento (estándar Oct) | Licencia |
|---|---|---|---|---|
| energydecision-dt-v2-sdp (este) | 210 timesteps | Profesor SDP honesto + greedy FCAS | 7.914 $ | MIT |
| energydecision-dt-v2 | no disponible | Pretrained en datos offline | no disponible | MIT |
| energydecision-dt-v2-impact | no disponible | Consciente de impacto | no disponible | MIT |

No se dispone de información suficiente para comparar con otros modelos de terceros.

## Limitaciones y advertencias

- El arbitraje energético es débil en la superficie broad-2024 expandida; el autor indica que el piloto se entrenó solo con horizontes cortos y medios, y que un reentrenamiento completo con `dt_trajectories_aggressive` abordaría esta limitación.
- No está diseñado para trading en vivo sin una validación adicional exhaustiva.
- El modelo puede degradarse significativamente si la estructura del mercado AEMO cambia (por ejemplo, el cambio de régimen de 2025+).
- No hay información sobre sesgos específicos, pero al entrenarse con datos simulados de un profesor con una función de coste de degradación concreta (`deg_cost_per_mwh=50`), las decisiones pueden no ser óptimas para otros perfiles de coste o configuraciones de batería.
- Riesgo de alucinación: al ser un modelo de control, no genera texto; el riesgo de alucinación es irrelevante en este contexto, pero sí existe el riesgo de acciones subóptimas en estados no vistos.
- La licencia MIT permite uso comercial, pero el autor recomienda precaución y validación adicional antes de cualquier uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrvictoru/energydecision-dt-v2-sdp
- Dataset de entrenamiento: https://huggingface.co/datasets/mrvictoru/AEMO_simulated_trade_sdp
- Variante v2 (pretrained): https://huggingface.co/mrvictoru/energydecision-dt-v2
- Variante impact-aware: https://huggingface.co/mrvictoru/energydecision-dt-v2-impact
- Repositorio fuente: https://github.com/mrvictoru/energydecision
