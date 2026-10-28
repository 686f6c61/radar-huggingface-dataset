# LaLa-World/lala-policy-robocasa50

## Resumen

LaLa-Policy (RoboCasa) es un modelo de visión-lenguaje-acción (VLA) publicado por LaLa-World que combina un encoder visual SigLIP2-So400M/14, un predictor transformer de 24 capas basado en Qwen3.5 y una cabeza de acción de flow-matching heredada del DiT de Isaac-GR00T. El modelo no solo predice fragmentos de acción (*action chunks* de 32 pasos), sino que de forma conjunta predice la representación visual futura, es decir, actúa como política y como world model latente al mismo tiempo.

El checkpoint `lala-policy-robocasa50` es un ajuste fino del modelo base `lala-world-siglip2-so400m` sobre RoboCasa: 24 tareas de manipulación, aproximadamente 50 demostraciones humanas por tarea y tres vistas (izquierda, derecha y muñeca), con 12 épocas y batch global de 256 sobre 8 GPU H100. Se evaluó con el protocolo de Cosmos Policy sobre 5 escenas reservadas.

Su relevancia es doble: por un lado, es un ejemplo abierto de integración de world modelling y control motor en una sola red; por otro, sirve como punto de partida reutilizable para quien quiera ajustar una política sobre tareas de manipulación con pocos datos. Ahora bien, el repositorio es muy reciente, acumula cero descargas, no declara licencia y no publica cifras de éxito, por lo que debe tratarse como material de investigación y no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con world model: encoder visual SigLIP2-So400M/14 + predictor transformer de 24 capas (Qwen3.5) + cabeza de acción flow-matching (DiT de Isaac-GR00T) |
| Parametros totales | no disponible (el autor solo detalla los componentes: encoder SigLIP2-So400M, del orden de 400 M, y predictor de 24 capas; no se da el total agregado) |
| Parametros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | no disponible; el horizonte de acción (chunk) es de 32 pasos |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch; no hay versiones GGUF, AWQ, GPTQ ni similar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la model card ni los metadatos la especifican) |
| Formato de pesos | PyTorch `.pth.tar` (archivo único `lala-policy-robocasa50.pth.tar`) |
| Tamano del repositorio | 5,2 GB |
| Pipeline declarado | robotics |
| Datos de entrenamiento | RoboCasa, 24 tareas, ~50 demostraciones humanas por tarea |
| Vistas de entrada | izquierda + derecha + muñeca |
| Chunk de acción | 32 pasos |
| Épocas | 12 |
| Inicialización | `lala-world-siglip2-so400m` (`meta.init_from`) |
| Configuración de referencia | `configs/lala_policy/robocasa.yaml` |
| Batch global / hardware de entrenamiento | 256 sobre 8 x H100 |

## Arquitectura y entrenamiento

LaLa-World es un world model con dos torres: un encoder de imagen SigLIP2-So400M/14, que convierte observaciones en representaciones latentes, y un predictor de 24 capas derivado de Qwen3.5 que modela la evolución temporal de esas representaciones. LaLa-Policy reutiliza ese backbone y le añade una cabeza de acción de flow-matching, el mismo DiT que emplea Isaac-GR00T de NVIDIA, de modo que el modelo aprende simultáneamente a predecir el chunk de acciones y la representación visual del futuro. Esa co-predicción es el rasgo diferencial: la señal de mundo imaginado actúa como regularizador del espacio latente donde vive la política, en lugar de entrenar solo una regresión acción-observación.

El ajuste fino parte del checkpoint `lala-world-siglip2-so400m` y se realiza sobre RoboCasa con 24 tareas de manipulación, unas 50 demostraciones humanas por tarea y tres cámaras (izquierda, derecha y muñeca), durante 12 épocas con batch global de 256 en 8 H100. No se documentan en la información disponible ni el número total de tokens, ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en políticas robóticas). La evaluación sigue el protocolo de Cosmos Policy: 24 tareas x 50 episodios sobre 5 escenas reservadas, invocable con `bash evals/lala_policy/run_robocasa_all.sh lala-policy-robocasa50.pth.tar lala-policy-robocasa50 50 12`. Las tramas imaginadas pueden decodificarse a píxeles con el checkpoint auxiliar `lala-decoder-siglip2-so400m` mediante `--save-imagine N --decoder-ckpt`.

## Capacidades

- Control visuomotor de manipulación: genera chunks de 32 acciones a partir de observaciones multi-cámara (izquierda, derecha y muñeca).
- Predicción conjunta del futuro visual: además de la acción, produce la representación latente del siguiente estado, lo que permite inspeccionar el "plan" interno del modelo.
- Razonamiento visual-lenguaje implícito, heredado del backbone SigLIP2 + Qwen3.5, sin que el autor documente una interfaz explícita de instrucciones en lenguaje natural.
- Decodificación de frames imaginados a imagen cuando se combina con `lala-decoder-siglip2-so400m`.
- Adaptabilidad por ajuste fino: la model card documenta otros dos checkpoints de la misma familia (`lala-policy-libero` y `lala-policy-robocasa300`), lo que sugiere un pipeline reproducible a otros entornos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no documentado como tal; el bucle cerrado de control es implícito (replanificación cada 32 pasos).
- Capacidades multilingües, visión general, audio o *thinking mode*: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en manipulación con pocos datos: partir de este checkpoint y ajustar sobre un conjunto reducido de demostraciones (decenas por tarea, como en el entrenamiento original) para validar cuánto transfiere el prior visual-lenguaje a un nuevo entorno.
- Evaluación comparativa de políticas en simulación: usar el script de evaluación con 24 tareas x 50 episodios sobre 5 escenas reservadas como *baseline* reproducible frente a otras políticas VLA en RoboCasa.
- Estudio de world models aplicados a control: decodificar los frames imaginados con `lala-decoder-siglip2-so400m` para analizar si la predicción latente anticipa contactos, oclusiones o fallos de agarre antes de que ocurran.
- Aumento de datos sintéticos: emplear las trayectorias y representaciones futuras generadas por el modelo para preentrenar políticas downstream o para filtrar demos de baja calidad.
- Prototipado de *action chunking* en robótica de laboratorio: el horizonte de 32 pasos es adecuado para tareas de pick-and-place con brazos de 6-7 grados de libertad, donde la replanificación frecuente no es crítica.
- Docencia y reproducción de pipelines VLA: el repositorio enlaza scripts de instalación de simuladores en entornos virtuales separados (`scripts/install_sim_envs.sh`), lo que facilita montar un laboratorio de prácticas sobre RoboCasa.
- Base para *sim-to-real* experimental: aunque no hay validación en hardware real documentada, la combinación de encoder SigLIP2 y cabeza flow-matching es un punto de partida habitual en transferencia a robots de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (24 tareas x 50 episodios, 5 escenas reservadas, protocolo Cosmos Policy) y el comando para reproducirlo, pero no incluye tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, el repositorio ocupa 5,2 GB y contiene un único `.pth.tar`; eso sugiere un modelo de uno a dos miles de millones de parámetros en precisión de 32 bits o de dos a tres mil millones en 16 bits. Cualquier cifra concreta de VRAM sería una estimación, no un dato del autor.
- GPU recomendadas: el entrenamiento se hizo con 8 x H100 (batch global 256), lo que sitúa el régimen de entrenamiento en centro de datos. Para inferencia, una GPU con 16-24 GB (RTX 4090, L4, A10) debería bastar si el checkpoint cabe en 16 bits, pero no está verificado.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 o RTX 3090 por capacidad de memoria, condicionado a que el checkpoint se cargue en precisión reducida; no confirmado por el autor.
- Opciones de despliegue: el formato `.pth.tar` y la dependencia de los simuladores de RoboCasa implican cargar el modelo con PyTorch dentro del entorno de evaluación oficial. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además no encajan con una política de control en bucle cerrado.
- Latencia y throughput: no disponibles. El coste por paso incluye el encoder SigLIP2-So400M/14 más 24 capas de predictor y el DiT de acción; para control en tiempo real habría que medirlo, y el chunk de 32 acciones amortigua el coste si se ejecuta en lazo abierto entre replanificaciones.

## Comparativa con modelos similares

Cifras de parámetros de los competidores tomadas de su documentación pública; no verificadas en la información disponible para esta ficha.

| Modelo | Enfoque | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaLa-Policy (RoboCasa) | VLA + world model latente, flow-matching | no disponible (encoder ~400 M + predictor 24 capas + DiT) | chunk de 32 acciones | no disponible | HuggingFace, repo de 5,2 GB |
| Isaac-GR00T (NVIDIA) | VLA con DiT de flow-matching sobre VLM | del orden de 2 B | no disponible aquí | no disponible aquí | Público en GitHub |
| OpenVLA | VLA autoregresivo sobre Llama-2 7B + DINOv2/SigLIP | 7 B | contexto de lenguaje del LLM base | permisiva según su proyecto | Pesos públicos |
| pi0 (Physical Intelligence) | VLA con flow-matching sobre PaliGemma | del orden de 3 B | no disponible aquí | no disponible aquí | Pesos públicos |

La diferencia principal de LaLa-Policy frente a estos tres es la predicción explícita del estado visual futuro dentro del mismo objetivo de entrenamiento, en lugar de limitarse a mapear observación a acción. Como contrapartida, su volumen de datos (24 tareas, ~50 demos por tarea) es mucho menor que el de los modelos entrenados a escala multi-robot.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse exclusivamente con demostraciones humanas de RoboCasa, hereda los sesgos de esas trayectorias (estilos de agarre, posiciones iniciales y distribuciones de objetos del simulador).
- Riesgo de alucinación: en el sentido de generar representaciones futuras plausibles pero incorrectas. El modelo puede imaginar un estado visual coherente y, sin embargo, producir una acción que falle; el frame decodificado no debe interpretarse como garantía de éxito.
- Dominio restringido: es una política para RoboCasa, no un modelo de propósito general. No hay evidencia de transferencia a robots reales ni a entornos fuera de las 24 tareas de entrenamiento.
- Datos escasos: ~50 demos por tarea y 12 épocas es un régimen de ajuste fino, propenso a sobreajuste y a degradación fuera de las 5 escenas reservadas de evaluación.
- Reactividad: el chunk de 32 acciones implica replanificación relativamente espaciada; entornos con contacto dinámico o perturbaciones externas pueden requerir horizontes más cortos.
- Licencia: no disponible. Sin licencia explícita no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados. Tratarlo como artefacto de investigación.
- Idiomas y contexto de lenguaje: no disponibles; no se documenta una interfaz de instrucciones en lenguaje natural, pese a que el backbone sea un modelo de lenguaje.
- Dependencias pesadas: la evaluación requiere simuladores en entornos virtuales separados (`scripts/install_sim_envs.sh`), lo que complica la reproducibilidad fuera de Linux con GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LaLa-World/lala-policy-robocasa50
- Repositorio LaLa-World: https://github.com/junha1125/LaLa-World
- Instrucciones de evaluación de políticas: https://github.com/junha1125/LaLa-World/blob/main/evals/lala_policy/README.md
- Decoder de frames imaginados: https://huggingface.co/LaLa-World/lala-decoder-siglip2-so400m
- Checkpoint hermano para Libero: https://huggingface.co/LaLa-World/lala-policy-libero
- Checkpoint hermano para RoboCasa300: https://huggingface.co/LaLa-World/lala-policy-robocasa300
- Isaac-GR00T (origen de la cabeza de acción DiT): https://github.com/NVIDIA/Isaac-GR00T
