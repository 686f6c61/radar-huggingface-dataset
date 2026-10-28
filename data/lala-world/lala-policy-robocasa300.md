# LaLa-World/lala-policy-robocasa300

## Resumen

LaLa-Policy (RoboCasa, MimicGen) es un checkpoint de política viso-motora (vision-language-action) publicado por LaLa-World, el mismo equipo detrás del repositorio LaLa-World en GitHub. El modelo parte de un world model denominado `lala-world-siglip2-so400m` y se ajusta fino para predecir conjuntamente un *chunk* de acciones y la representación visual futura del entorno. La cabeza de acciones es de tipo *flow matching* y reutiliza el DiT de Isaac-GR00T, mientras que la parte perceptiva se apoya en un encoder SigLIP2-So400M/14 y un predictor de 24 capas basado en Qwen3.5.

El checkpoint está entrenado sobre RoboCasa con 300 demostraciones MimicGen por tarea, usando tres vistas (izquierda, derecha y muñeca), *chunks* de 32 acciones, 3 épocas y un batch global de 256 sobre 8 GPU H100. Se inicializa desde los pesos del world model (`meta.init_from`) y se evalúa con el protocolo de Cosmos Policy en 24 tareas y 5 escenas reservadas.

Su relevancia es acotada pero específica: no es un modelo de propósito general, sino un artefacto de investigación para robótica de manipulación en simulación, útil para reproducir experimentos de VLA con predicción de futuros visuales y para servir de inicialización en ajustes finos con pocas demostraciones. El repositorio ocupa 5,2 GB y el peso se distribuye como un único `.pth.tar` de PyTorch; no se publican recuentos de parámetros totales, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA con world model: encoder SigLIP2-So400M/14, predictor Qwen3.5 de 24 capas y cabeza de acciones por flow matching (DiT de Isaac-GR00T); predicción conjunta de chunk de acciones y representación visual futura |
| Parámetros totales | No disponible (el autor no publica el recuento; los componentes se identifican como SigLIP2-So400M/14 y un Qwen3.5 de 24 capas) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta ventana de contexto; el modelo opera con chunks de 32 acciones y 3 vistas) |
| Tipos de cuantización | No disponible (solo se publica el checkpoint en precisión original) |
| Idiomas soportados | No disponible (es una política viso-motora; no se documenta soporte de idiomas) |
| Licencia | No disponible |
| Formato de pesos | `.pth.tar` (`lala-policy-robocasa300.pth.tar`), checkpoint de PyTorch; decodificador visual aparte en `.pt` |
| Tamaño del repositorio | 5,2 GB |
| Vistas de entrada | izquierda + derecha + muñeca |
| Longitud de chunk de acciones | 32 |
| Fecha de publicación | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura combina tres bloques. Un encoder visual SigLIP2-So400M/14 procesa tres cámaras simultáneamente (izquierda, derecha y muñeca). Un predictor transformer de 24 capas derivado de Qwen3.5 modela la secuencia multimodal y produce, de forma conjunta, la representación visual del siguiente estado y la condición para la cabeza de acciones. La cabeza de acciones es un transformer de difusión (DiT) procedente de Isaac-GR00T que genera *chunks* de 32 acciones mediante *flow matching*. El modelo se inicializa desde `lala-world-siglip2-so400m` (`meta.init_from`), es decir, no entrena el world model desde cero sino que lo especializa como política.

El ajuste fino usa RoboCasa con 300 demostraciones MimicGen por tarea, 3 épocas y batch global de 256 sobre 8 GPU H100, con la configuración `configs/lala_policy/robocasa_mg300.yaml`. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en políticas robóticas). La innovación destacable es la predicción conjunta de acción y futuro visual: el modelo no solo actúa, sino que mantiene una representación latente del estado venidero, que puede decodificarse a imagen con `lala-decoder-siglip2-so400m.pt` para inspección cualitativa.

## Capacidades

- Predicción de *chunks* de 32 acciones de manipulación robótica a partir de observaciones de tres cámaras (izquierda, derecha y muñeca).
- Predicción conjunta de la representación visual futura (world model), decodificable a fotogramas con el decodificador SigLIP2-So400M.
- Control viso-motor en el entorno de simulación RoboCasa, con tareas de manipulación de cocina.
- Ajuste fino con pocas demostraciones: el checkpoint está entrenado con 300 demostraciones MimicGen por tarea.
- Punto de partida reutilizable: al inicializarse desde `lala-world-siglip2-so400m`, sirve como base para otras políticas de la familia (`lala-policy-libero`, `lala-policy-robocasa50`).
- Evaluación integrada con el protocolo de Cosmos Policy (24 tareas × 50 episodios, 5 escenas reservadas).
- No se documenta soporte de *tool calling*, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües; el modelo es una política, no un asistente conversacional.

## Casos de uso

- Manipulación de cocina en simulación: el modelo recibe las vistas izquierda, derecha y muñeca y emite *chunks* de 32 acciones para completar tareas de RoboCasa, lo que permite reproducir los experimentos del autor con un solo checkpoint.
- Investigación en world models para robótica: la predicción de la representación visual futura se decodifica con `lala-decoder-siglip2-so400m.pt`, lo que facilita analizar si el modelo "imagina" estados coherentes antes de actuar.
- Inicialización para ajuste fino con pocas demostraciones: al provenir de un world model preentrenado y haberse adaptado con 300 demos por tarea, es un punto de partida razonable para nuevos conjuntos MimicGen con presupuesto de datos limitado.
- Comparación de políticas en RoboCasa: el script `evals/lala_policy/run_robocasa_all.sh` ejecuta 24 tareas × 50 episodios sobre 5 escenas reservadas con el protocolo de Cosmos Policy, útil como línea base reproducible frente a otros checkpoints.
- Estudio de cabezas de acción por flow matching: al emplear el DiT de Isaac-GR00T, sirve para analizar el comportamiento de *flow matching* frente a alternativas de regresión directa o modelos de difusión en políticas VLA.
- Generación de datos sintéticos y aumento de datos: los fotogramas imaginados pueden usarse para inspección cualitativa o para construir pares observación-futuro en experimentos de aumento de datos, siempre validando la fidelidad de la decodificación.
- Docencia y divulgación técnica: el par world model + política, con tres vistas y un chunk de acción explícito, es un ejemplo didáctico completo de arquitectura VLA moderna sin requerir un clúster de entrenamiento.
- Adaptación a un robot real: como base de investigación para transferencia sim-to-real, teniendo en cuenta que el autor no documenta ningún resultado en hardware físico.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe el protocolo de evaluación, pero no incluye cifras de éxito ni comparaciones.

| Elemento de evaluación | Detalle |
|---|---|
| Suite | RoboCasa |
| Número de tareas | 24 |
| Episodios por tarea | 50 |
| Escenas reservadas | 5 |
| Protocolo | Cosmos Policy |
| Comando | `bash evals/lala_policy/run_robocasa_all.sh lala-policy-robocasa300.pth.tar lala-policy-robocasa300 50 12` |
| Tasa de éxito publicada | No disponible |

## Requisitos de hardware

- Tamaño del checkpoint: 5,2 GB en el repositorio de HuggingFace (un único `lala-policy-robocasa300.pth.tar` más el decodificador opcional).
- Estimación de VRAM: no disponible de forma oficial. Si el checkpoint está almacenado en fp32, 5,2 GB equivaldrían a unos 1,3 B de parámetros; en bf16 los pesos ocuparían del orden de 2,6 GB, a lo que habría que sumar activaciones del encoder SigLIP2-So400M/14 (resolución de entrada no documentada) y el búfer de 32 acciones. Es una estimación, no un dato del autor.
- GPU de entrenamiento declaradas: 8 × H100 con batch global 256.
- GPU para inferencia: no documentadas. Por la estimación anterior, una GPU consumer de 24 GB (RTX 4090) sería suficiente en bf16, pero no está verificado por el autor.
- Despliegue: PyTorch con entornos de simulación separados, instalados mediante `scripts/install_sim_envs.sh`. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, y estos motores no aplican a una política VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Datos de entrenamiento | Vistas | Chunk | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lala-policy-robocasa300 | RoboCasa, 300 demos MimicGen por tarea, 3 épocas | izquierda + derecha + muñeca | 32 | `.pth.tar` | no disponible | HuggingFace |
| lala-policy-robocasa50 | RoboCasa (el nombre sugiere 50 demos por tarea; no confirmado en la información) | no disponible | no disponible | `.pth.tar` | no disponible | HuggingFace |
| lala-policy-libero | LIBERO (entorno distinto, orientado a tareas de manipulación de largo horizonte; detalles no disponibles) | no disponible | no disponible | `.pth.tar` | no disponible | HuggingFace |
| Isaac-GR00T (solo la cabeza DiT) | no disponible | no aplica | no disponible | no disponible | no disponible | repositorio de NVIDIA |

Los tres checkpoints de LaLa-Policy comparten la misma arquitectura base (SigLIP2-So400M/14 + Qwen3.5 de 24 capas + DiT de Isaac-GR00T) y se diferencian únicamente en el conjunto de datos de ajuste fino, por lo que la comparación relevante es de dominio (RoboCasa frente a LIBERO) y de volumen de demostraciones, no de capacidad intrínseca.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial. Cualquier despliegue en producción requiere contactar con el autor para aclarar los términos.
- Entrenado exclusivamente en simulación (RoboCasa). No se documentan resultados de transferencia sim-to-real ni validación en hardware físico.
- Volumen de datos reducido: 300 demostraciones por tarea y 3 épocas, lo que aumenta el riesgo de sobreajuste a las escenas y objetos presentes en el conjunto MimicGen.
- Evaluación limitada a 5 escenas reservadas y 24 tareas; no hay cifras publicadas, por lo que no puede verificarse la tasa de éxito sin ejecutar el pipeline.
- El modelo produce acciones y representaciones latentes, no texto: no debe esperarse razonamiento verbal, *tool calling* ni comportamiento conversacional.
- Riesgo de deriva en la "imaginación": la representación visual futura puede divergir de la realidad en escenas fuera de distribución; los fotogramas decodificados deben tratarse como inspección cualitativa, no como predicción fiable.
- Carga del checkpoint en formato `.pth.tar` (pickle de PyTorch): implica riesgo de ejecución de código al deserializar; conviene auditar el fichero o cargarlo en un entorno aislado.
- Dependencia de un ecosistema específico: requiere los entornos de simulación del repositorio, con instalación separada por simulador, lo que complica la integración en pipelines ajenos.
- No se documentan sesgos, composición demográfica del dataset ni limitaciones idiomáticas; al no procesar lenguaje de forma expuesta, las cautelas habituales de sesgo textual no aplican directamente, pero el sesgo visual del dataset RoboCasa sí puede propagarse a las políticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LaLa-World/lala-policy-robocasa300
- Repositorio GitHub de LaLa-World: https://github.com/junha1125/LaLa-World
- Instrucciones de evaluación de políticas: https://github.com/junha1125/LaLa-World/blob/main/evals/lala_policy/README.md
- Decodificador visual: https://huggingface.co/LaLa-World/lala-decoder-siglip2-so400m
- Checkpoint LIBERO: https://huggingface.co/LaLa-World/lala-policy-libero
- Checkpoint RoboCasa con 50 demos: https://huggingface.co/LaLa-World/lala-policy-robocasa50
- Isaac-GR00T (origen del DiT de acciones): https://github.com/NVIDIA/Isaac-GR00T
