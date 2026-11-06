# Dwyane/lingbot-vla-lora_tuned_1500

## Resumen

LingBot-VLA LoRA tuned 1500 es un ajuste fino mediante LoRA del modelo vision-language-action (VLA) LingBot-VLA 2.0 de 6B parámetros, desarrollado por el usuario Dwyane sobre el checkpoint base `robbyant/lingbot-vla-v2-6b`. El modelo está especializado en manipulación robótica y ha sido entrenado sobre el benchmark RoboTwin 2.0 con la configuración de brazos Aloha-AgileX, cubriendo 50 tareas de manipulación limpias con 50 episodios cada una. Su propósito es convertir observaciones visuales y comandos en secuencias de acciones motoras de 55 dimensiones para robots bimanuales.

La relevancia de esta ficha radica en que documenta un pipeline completo de ajuste fino sobre un VLA de 6B con resultados medidos: 62,8% de tasa de éxito en tareas vistas (clean2clean) y 37,0% en tareas no vistas con aleatorización (clean2random), frente al 48,55% y 24,00% del checkpoint de SFT completo de 11.000 pasos. Esto supone una mejora sustancial en generalización dentro del mismo entorno de evaluación.

El modelo emplea la arquitectura LingBot-VLA con un experto de acción diferenciado (action_expert) sobre el que se aplica el adaptador LoRA, que posteriormente se fusiona en los pesos base. El repositorio ocupa 12,5 GB y contiene tres ficheros safetensors más configuración, tokenizer y preprocesador, de modo que la descarga constituye un checkpoint completo y autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LingBot-VLA (vision-language-action) con experto de acción; adaptador LoRA fusionado en el checkpoint |
| Parametros totales | 6.226.386.103 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (hereda los términos del modelo base, que no declara licencia en el Hub) |
| Formato de pesos | safetensors (3 shards: 2,0 GB + 5,0 GB + 4,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de LingBot-VLA 2.0, un VLA de 6B parámetros que combina un codificador visión-lenguaje con un experto de acción encargado de producir las trayectorias motoras. La acción se representa en un espacio unificado de 55 dimensiones que incluye 14 articulaciones de brazo, 14 poses de efector final, 2 pinzas y componentes adicionales. El ajuste LoRA se aplicó exclusivamente al ámbito `action_expert`, con módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`, rango 64, alpha 128 y tasa de aprendizaje 5e-5; posteriormente el adaptador se fusionó en los pesos base, por lo que el checkpoint distribuido no requiere cargar un adaptador por separado.

La progresión de entrenamiento consta de tres fases: primero un SFT de parámetros completos de 11.000 pasos siguiendo la receta oficial de RoboTwin sin cambios de hiperparámetros; después un SFT continuado hasta 6.000 pasos (`lora6000_base`, lr 1e-4); y finalmente 1.500 pasos de LoRA sobre esa base, que constituyen el checkpoint publicado. Los datos son las 50 tareas limpias de RoboTwin 2.0 (Aloha-AgileX) con 50 episodios por tarea, sin datos aleatorizados ni datos externos. No se documentan detalles sobre el corpus de preentrenamiento del modelo base ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual en un espacio unificado de 55 dimensiones a partir de observaciones visuales e instrucciones.
- Ejecución de tareas de manipulación del benchmark RoboTwin 2.0 con el planner cuRobo v0.7.8 y `use_length=25` en bf16.
- Generalización parcial a variaciones aleatorizadas de las tareas entrenadas (37,0% de éxito en clean2random).
- Integración con la librería `transformers` y compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión como entrada inherente a la arquitectura VLA; el resto no disponible.

## Casos de uso

- Manipulación robótica bimanual en laboratorio: el modelo genera trayectorias de 55 dimensiones para brazos Aloha-AgileX y puede desplegarse como política de control en las 50 tareas de RoboTwin 2.0 para las que fue entrenado, con una tasa de éxito medida del 62,8%.
- Investigación en generalización de políticas VLA: la diferencia entre clean2clean (62,8%) y clean2random (37,0%) permite estudiar la robustez frente a cambios de posición, iluminación o disposición de objetos usando el checkpoint como línea base reproducible.
- Punto de partida para ajustes LoRA adicionales: al estar el adaptador fusionado y distribuirse el checkpoint completo con configuración y tokenizer, sirve como base para nuevos fine-tunes sobre tareas o entornos propios con un coste de entrenamiento reducido.
- Evaluación comparativa de planners: los resultados publicados con cuRobo v0.7.8 permiten contrastar el efecto del planner (cuRobo frente a MPLib) sobre las mismas políticas, útil para pipelines de planificación y control.
- Prototipado de pipelines de robótica en simulación: el modelo puede integrarse en entornos simulados compatibles con RoboTwin para validar recetas de entrenamiento antes de transferir a hardware real.
- Reproducción de experimentos académicos: el repositorio incluye `lingbotvla_cli.yaml`, el índice de safetensors y los ficheros de preprocesado, lo que facilita replicar el entrenamiento y verificar los resultados del artículo o informe asociado.
- Docencia y formación en VLA: al ser un checkpoint de 6B con resultados documentados y pasos de entrenamiento explícitos, resulta adecuado para ilustrar el impacto del SFT completo frente al ajuste LoRA en modelos de acción.

## Benchmarks y rendimiento

Evaluación con planner cuRobo v0.7.8, `use_length=25`, precisión bf16 y 10 episodios por tarea.

| Configuracion | Tareas | Puntuacion | Tasa de exito |
|---|---:|---:|---:|
| clean2clean (vistas) | 50 / 50 | 314 / 500 | 62,8% |
| clean2random (no vistas) | 50 / 50 | 185 / 500 | 37,0% |
| SFT completo 11.000 pasos, clean (referencia) | no disponible | 670 / 1380 | 48,55% |
| SFT completo 11.000 pasos, randomizado (referencia) | no disponible | 180 / 750 | 24,00% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible, dado que se trata de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,23B parámetros en bf16 se requieren aproximadamente 12,5 GB solo para pesos; en fp32 ascendería a unos 25 GB. No se documentan requisitos oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en bf16 con margen para el codificador visual y buffers de acción; una RTX 4090 (24 GB) es viable en bf16 ajustada, aunque el margen es reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB si se usa bf16 y se limita el batch; no se documentan cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada) y endpoints compatibles; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta arquitectura VLA.
- Latencia y throughput: no disponible. La evaluación emplea 10 episodios por tarea con `use_length=25`, pero no se publican tiempos por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VLA LoRA tuned 1500 (este) | 6,23B | no disponible | 62,8% clean / 37,0% random (RoboTwin 2.0) | no disponible | Hugging Face, 0 descargas |
| LingBot-VLA 2.0 base (`robbyant/lingbot-vla-v2-6b`) | 6B | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| SFT completo 11.000 pasos (referencia del autor) | 6B | no disponible | 48,55% clean / 24,00% random | no disponible | No distribuido como checkpoint independiente en la información disponible |

No se dispone de datos de otros modelos VLA comparables (por ejemplo, OpenVLA o π0) en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio hereda los términos del modelo base, que no especifica licencia en el Hub; el uso comercial queda en un estado jurídicamente indeterminado y requiere consultar el proyecto upstream.
- Sesgos conocidos: no documentados, pero al entrenarse solo con 50 tareas limpias de RoboTwin 2.0, el modelo está fuertemente sesgado hacia ese conjunto de tareas, objetos y configuración de brazos Aloha-AgileX.
- Riesgo de alucinación: en un VLA se traduce en acciones plausibles pero incorrectas o inseguras; la caída del 62,8% al 37,0% en entornos aleatorizados evidencia una generalización limitada fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto ni los idiomas soportados; las instrucciones en lenguaje natural no han sido evaluadas más allá de las tareas del benchmark.
- Caveat de evaluación: los resultados son autoevaluados con cuRobo; si la reevaluación oficial usa MPLib, las tasas absolutas serán inferiores por diferencias de herramientas, no de política. La reevaluación oficial tiene precedencia.
- Dependencia de datos: no se usaron datos aleatorizados ni externos, lo que limita la robustez y hace desaconsejable su despliegue directo en producción sin un ajuste específico del entorno.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un checkpoint de investigación sin validación comunitaria independiente.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ o GPTQ, lo que restringe el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dwyane/lingbot-vla-lora_tuned_1500
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Repositorio de código, resultados y notas de ajuste: https://github.com/wuuwuu26/lingbot-vla-lora_tuned_1500
- Mirror de descarga: https://hf-mirror.com
