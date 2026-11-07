# Miraiyochi/hierarchical-latent-subgoals

## Resumen

`hierarchical-latent-subgoals` es un conjunto de pesos de política (policy) para robótica, no un modelo de lenguaje. Lo publica Takahiro Morimoto (Miraiyochi, inc.) como material de reproducción del extended abstract del workshop UniReps 2026 titulado "Predicted Future Latents as Subgoals: Hierarchical Policies Outperform Flat Policies Beyond the Training Goal Distance". El problema que aborda es el control goal-conditioned de horizonte largo: una política plana entrenada con ciertas distancias al objetivo degrada su rendimiento cuando se le piden objetivos más lejanos que los vistos en entrenamiento, y la propuesta jerárquica mitiga esa degradación.

La arquitectura es una política jerárquica de dos niveles implementada dentro de una única red con flow matching, sin búsqueda en tiempo de test. Cada 16 pasos de entorno, el nivel superior genera en el espacio latente de un codificador visual congelado la observación esperada 16 pasos hacia delante; el nivel inferior toma ese latente como subobjetivo y emite los siguientes 8 acciones. Cada checkpoint jerárquico se acompaña de una política plana entrenada con los mismos datos y con el número de parámetros ajustado a menos del 0,1 %, lo que permite una comparación controlada.

El repositorio ocupa 1,7 GB e incluye pesos para dos entornos: PushT (con un encoder ViT-tiny tipo LeWorldModel congelado) y LIBERO-Long (`libero_10`, con V-JEPA 2 ViT-L y T5-base congelados). Es relevante para investigadores en imitation learning y control jerárquico que necesiten reproducir o comparar políticas con subobjetivos latentes, aunque no sirve como modelo de propósito general: no procesa lenguaje natural de forma generativa ni genera texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política jerárquica de dos niveles con flow matching, implementada en una única red; nivel superior predice latente futuro, nivel inferior genera acciones |
| Parametros totales | 74.846.727 (jerárquica, LIBERO-Long) frente a 74.854.568 (plana, diferencia < 0,1 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; horizonte de control: nivel superior cada 16 pasos de entorno, nivel inferior emite 8 acciones |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no es lingüístico; en LIBERO-Long consume embeddings de instrucciones de T5-base) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch), pesos EMA; incluye `SHA256SUMS`, `model_configs.json` y `language.json` |

## Arquitectura y entrenamiento

La política se divide en dos niveles que conviven en una sola red y se ejecutan sin búsqueda en tiempo de test. El nivel superior, cada 16 pasos de entorno, predice en el espacio latente de un codificador visual congelado el latente de la observación esperada 16 pasos más adelante. Ese latente actúa como subobjetivo para el nivel inferior, que genera los siguientes 8 acciones mediante flow matching. La formulación es goal-conditioned: la política recibe un objetivo final y lo descompone en subobjetivos latentes intermedios.

En PushT se usa un encoder ViT-tiny tipo LeWorldModel congelado (`pusht_hi_lewm_epoch15_object.ckpt`, distribuido aparte con Hi-LeWM en Zenodo, DOI 10.5281/zenodo.21353240). En LIBERO-Long se emplean V-JEPA 2 ViT-L (`facebook/vjepa2-vitl-fpc64-256`) y T5-base (`google-t5/t5-base`) congelados, con las instrucciones codificadas en `language.json`. Los checkpoints de LIBERO-Long se entrenaron 30k updates con semilla 42. En PushT hay dos configuraciones: `pusht_main_reproduction` (distancias de objetivo de entrenamiento d ∈ {25, 50, 75}, 30k updates, semilla 42, rerun posterior) y `pusht_train150` (d ∈ {25, 50, 75, 100, 150}, semilla 42), que son los pesos reportados en el paper. Cada checkpoint jerárquico viene con su política plana equivalente en parámetros entrenables, lo que aísla el efecto de la jerarquía frente al de la capacidad.

## Capacidades

- Control robótico goal-conditioned en PushT y LIBERO-Long (`libero_10`).
- Descomposición jerárquica de objetivos: predicción de latentes futuros como subobjetivos intermedios.
- Generación de acciones por flow matching, sin búsqueda en tiempo de test.
- Generalización más allá de la distancia de objetivo vista en entrenamiento (resultado central del abstract).
- Condicionamiento por instrucciones en LIBERO-Long mediante embeddings congelados de T5-base.
- Comparación controlada frente a política plana con parámetros equiparados.
- No soporta tool calling, function calling, agentes de texto, visión general, audio ni generación de lenguaje.

## Casos de uso

- Reproducción de resultados del abstract: cargar `pusht_train150/seed_42` y `libero_long/ema_030000.pt` con el código del repositorio para verificar las curvas de éxito frente a la política plana emparejada.
- Estudio de generalización fuera de rango: evaluar los checkpoints en las tareas beyond-range incluidas en `pusht_data/` para medir la caída de rendimiento al aumentar la distancia al objetivo.
- Ablación de la jerarquía: comparar `hierarchical` frente a `flat_direct_goal` o `flat` con parámetros equiparados a menos del 0,1 %, aislando el efecto de los subobjetivos latentes.
- Investigación en imitation learning con flow matching: usar los pesos como baseline en experimentos de políticas generativas para manipulación.
- Sustitución de codificadores visuales: al estar congelados y distribuidos aparte, permite probar otros encoders latentes manteniendo la estructura de dos niveles.
- Punto de partida para planificación latente de horizonte largo: la predicción de latentes a 16 pasos es un componente reutilizable en pipelines de control jerárquico con JEPA.
- Docencia y divulgación: ejemplo ejecutable de política jerárquica con subobjetivos latentes sobre benchmarks estándar de robótica.

## Benchmarks y rendimiento

La model card reporta comparaciones jerárquica menos plana en PushT (rerun de semilla 42): +24 puntos a d = 100 y +26 puntos a d = 150, frente a +14 / +14 en la ejecución original de la semilla 42. El paper promedia tres semillas (42, 43, 44), pero esos seis checkpoints no se conservaron. No se publican en la información disponible valores absolutos de tasa de éxito, MMLU, HumanEval, GSM8K ni métricas de LIBERO-Long.

| Configuracion | Distancia d | Diferencia jerarquica - plana (rerun semilla 42) |
|---|---|---|
| PushT main | 100 | +24 puntos |
| PushT main | 150 | +26 puntos |
| PushT main (ejecucion original semilla 42) | 100 | +14 puntos |
| PushT main (ejecucion original semilla 42) | 150 | +14 puntos |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio pesa 1,7 GB y los pesos de política rondan los 75 M de parámetros (unos 300 MB en fp32 por checkpoint), pero hay que sumar los codificadores congelados: V-JEPA 2 ViT-L y T5-base en LIBERO-Long, y el ViT-tiny de LeWorldModel en PushT.
- GPU recomendadas: no disponible. V-JEPA 2 ViT-L es el componente más exigente y encaja con GPUs de 24 GB o superiores (RTX 4090, A100, H100); para PushT basta una GPU consumer de gama media-alta.
- Cabe en GPU consumer: probablemente sí para PushT; para LIBERO-Long depende de la VRAM necesaria para V-JEPA 2 ViT-L, dato no publicado.
- Opciones de despliegue: PyTorch con el código de `github.com/miraiyochi-ai/hierarchical-latent-subgoals`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hierarchical-latent-subgoals | Política jerárquica con flow matching | 74,8 M (LIBERO-Long) | Subobjetivo cada 16 pasos, 8 acciones por ciclo | MIT | Hugging Face + GitHub |
| Política plana emparejada (`flat`) | Política plana con flow matching | 74,85 M | Sin jerarquía | MIT | Incluida en el mismo repo |
| Metro-WM (arXiv 2609.31868) | Planificación latente con JEPA y subobjetivos | No disponible | Horizonte largo | No disponible | Paper |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite tool calling ni uso conversacional.
- Los pesos de la configuración principal de PushT del paper (semillas 42, 43, 44) se perdieron; `pusht_main_reproduction` es un rerun de la semilla 42 y solo reproduce aproximadamente los números por semilla.
- Los codificadores visuales y de lenguaje no están incluidos: hay que descargar el checkpoint de LeWorldModel desde Zenodo y V-JEPA 2 ViT-L y T5-base desde Hugging Face, con sus propias licencias y requisitos.
- Evaluación limitada a dos entornos simulados (PushT y LIBERO-Long); no hay evidencia de transferencia a robots reales en la información disponible.
- Riesgo de alucinación en el sentido de predicciones latentes inexactas a 16 pasos; no se documentan métricas de calibración de esos subobjetivos.
- Sesgos: no documentados. En robótica, los sesgos provienen de la distribución de demostraciones y del simulador, no evaluados aquí.
- Uso comercial permitido por la licencia MIT, pero sujeta además a las licencias de los pesos congelados de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo.
- Sin datos publicados de latencia, throughput ni requisitos de VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/Miraiyochi/hierarchical-latent-subgoals
- Código: https://github.com/miraiyochi-ai/hierarchical-latent-subgoals
- Encoder PushT (Hi-LeWM, Zenodo): https://doi.org/10.5281/zenodo.21353240
- V-JEPA 2 ViT-L: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- T5-base: https://huggingface.co/google-t5/t5-base
- Paper relacionado (Metro-WM): https://arxiv.org/abs/2609.31868
