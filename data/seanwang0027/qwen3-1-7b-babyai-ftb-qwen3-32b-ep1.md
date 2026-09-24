# SeanWang0027/qwen3-1.7b-babyai-ftb-qwen3-32b-ep1

## Resumen

El modelo `SeanWang0027/qwen3-1.7b-babyai-ftb-qwen3-32b-ep1` es un fine-tune experimental de Qwen3-1.7B, publicado por el usuario SeanWang0027 en HuggingFace. Se trata de un experimento de destilación en el que Qwen3-1.7B actúa como estudiante (*student*) de un profesor Qwen3-32B, entrenado sobre tareas del entorno BabyAI. El sufijo del nombre ("babyai-ftb-qwen3-32b-ep1") y la etiqueta `distillation` de la model card confirman el enfoque; la abreviatura "OPD" del título del README apunta a *on-policy distillation*, aunque el autor no la desarrolla.

Se publica como un *checkpoint* intermedio y explícitamente no evaluado: la model card indica "Final checkpoint: trainer step 75. Not evaluated." El entrenamiento consistió en una sola pasada sobre 810 tareas, 51 pasos de explorador completados y una tasa de aprendizaje de 1e-6. El modo *thinking* de Qwen3 se desactivó durante el proceso. El repositorio tiene 4,1 GB y, en la fecha de consulta, cero descargas y cero *likes*.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible sobre destilación de modelos pequeños en tareas de seguimiento de instrucciones en entornos de rejilla (tipo MiniGrid/BabyAI), no la de un modelo listo para producción. El recuento real de parámetros según los safetensors es de 2.031.739.904 (unos 2,03 mil millones), superior al "1,7B" nominal del modelo base porque ese número excluye típicamente las matrices de *embedding*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); configuracion heredada del modelo base Qwen3-1.7B |
| Parametros totales | 2.031.739.904 (~2,03 mil millones), segun safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32 768 tokens nativos en Qwen3-1.7B, ampliables a 131 072 con YaRN; no confirmado para este fine-tune |
| Tipos de cuantizacion | No disponibles en el repositorio (solo safetensors); al derivar de Qwen3-1.7B es convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | No disponibles para este fine-tune; el modelo base Qwen3-1.7B esta documentado como multilingue |
| Licencia | No disponible en el repositorio; el modelo base Qwen3-1.7B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 4,1 GB) |
| Modelo base | Qwen/Qwen3-1.7B |
| Modelo profesor | Qwen/Qwen3-32B |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion (repositorio) | 2026-09-23 |
| Descargas / likes | 0 / 0 |
| Etiquetas relevantes | qwen3, babyai, tcod, distillation, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con atención por consultas agrupadas (GQA), normalización RMSNorm y sesgo desactivado en las proyecciones QKV, según la documentación pública de la familia Qwen3. El autor no modifica ni documenta la arquitectura, por lo que no se puede confirmar ninguna innovación estructural propia en este *checkpoint*. La única configuración de inferencia declarada es que el modo *thinking* está desactivado.

En cuanto al entrenamiento, la model card aporta los siguientes datos: destilación de un profesor Qwen3-32B hacia un estudiante Qwen3-1.7B; reinicio desde el estudiante base con un búfer nuevo el 2026-09-23; una única pasada sobre 810 tareas; 51 pasos de explorador completados; tasa de aprendizaje 1e-6; y *checkpoint* final en el paso 75 del entrenador. La etiqueta `tcod` aparece en el repositorio sin explicación adicional por parte del autor, y la abreviatura "OPD" del título ("FutureBridge-OPD") no se desarrolla en la model card, por lo que no se puede afirmar a qué metodología concreta corresponde. No se detalla la composición del dataset más allá de las "810 tareas", ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el *pipeline* declarado es `text-generation` y la etiqueta `conversational` sugiere un ajuste orientado a diálogo, aunque no se documenta el formato de plantilla empleado.
- Seguimiento de instrucciones en entornos de rejilla: el entrenamiento sobre tareas BabyAI apunta a instrucciones compuestas del tipo "ve a un objeto y luego ejecuta una acción", propias de ese banco de pruebas.
- Destilación de razonamiento desde un profesor mayor: el objetivo del experimento es transferir comportamiento de Qwen3-32B a un estudiante de ~2B, no una capacidad final validada.
- Soporte de *tool calling* / *function calling*: la etiqueta `tcod` está presente, pero no hay documentación que confirme formato, esquema o fiabilidad.
- Compatibilidad con Text Generation Inference: el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que el artefacto sigue el formato esperado por TGI y los *endpoints* compatibles de HuggingFace.
- Capacidades multilingües: no documentadas para este fine-tune. El modelo base Qwen3-1.7B es multilingüe, pero un ajuste corto sobre tareas sintéticas en inglés puede degradar ese comportamiento.
- Modo *thinking*: desactivado de forma explícita durante el entrenamiento, según la model card. No cabe esperar cadenas de razonamiento extendidas.
- Visión, audio y otras modalidades: no disponibles.

## Casos de uso

- Investigación en destilación on-policy: el *checkpoint* sirve como punto de partida o referencia para reproducir el *pipeline* estudiante Qwen3-1.7B / profesor Qwen3-32B sobre BabyAI, y para estudiar la curva de aprendizaje en pasos tempranos (paso 75 del entrenador).
- Estudio de olvido catastrófico en modelos pequeños: al ser un ajuste corto (una pasada sobre 810 tareas, LR 1e-6) sobre un modelo base conversacional, es un caso útil para medir cuánto se degradan las capacidades generales tras un ajuste estrecho de dominio.
- Evaluación de agentes en entornos de rejilla: las tareas BabyAI consisten en instrucciones de navegación y manipulación de objetos en cuadrículas, por lo que el modelo puede emplearse como política base en simuladores tipo BabyAI/MiniGrid para experimentos de *instruction following* de un solo episodio.
- Generación de datos sintéticos de bajo coste: un modelo de ~2B ejecutable en local puede usarse para producir borradores de trayectorias o descripciones de tareas de rejilla que luego se filtren con un modelo mayor.
- Prototipado local de asistentes ligeros: con conversión a GGUF y cuantización de 4 bits, el modelo cabe en GPUs de consumo y permite probar *chatbots* experimentales sin coste de API, asumiendo que no ha sido evaluado.
- Banco de pruebas de *tool calling* en modelos pequeños: la etiqueta `tcod` y la compatibilidad con TGI lo hacen utilizable como sujeto de prueba en pipelines de *function calling* donde interese medir latencia y robustez de un modelo de 2B frente a uno de 32B.
- Comparativa de pipelines de destilación: al compartir modelo base con Qwen3-1.7B original, permite comparaciones controladas A/B entre el *checkpoint* destilado y el base sin ajustar.
- Continuación del entrenamiento: puede retomarse como inicialización para más épocas, dado que el autor indica que se reinició desde el estudiante base con un búfer nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente "Not evaluated" y no incluye métricas de BabyAI, MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- Peso de los pesos en precisión completa: ~4,1 GB para 2,03 mil millones de parámetros en bf16/fp16 (cálculo directo a partir del recuento de parámetros del repositorio).
- VRAM estimada para inferencia en bf16: del orden de 5-6 GB contando pesos, activaciones y caché KV en contextos cortos.
- Caché KV: asumiendo la configuración pública de Qwen3-1.7B (28 capas, 8 cabezas KV, dimensión de cabeza 128, bf16), el coste aproximado es de 112 KB por token, es decir, unos 3,6 GB adicionales para una secuencia de 32 768 tokens. Es un cálculo propio, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM en bf16/fp16 (RTX 3060 12 GB, RTX 4070, RTX 4080, L4, A10). Para despliegue a gran escala, A100 o H100 permiten servir muchas réplicas en paralelo.
- Cabe en GPU de consumo: sí. Con cuantización de 4 bits, el peso baja a aproximadamente 1,2-1,3 GB, por lo que es viable en GPUs de 4-6 GB (GTX 1650 4 GB con contexto corto, RTX 3050 6 GB, RTX 4060 8 GB).
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), vLLM (compatible con arquitecturas Qwen3), y llama.cpp/Ollama tras convertir los pesos a GGUF. No se distribuyen ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. El autor no publica ninguna medición.

## Comparativa con modelos similares

No se han publicado resultados de rendimiento de este *checkpoint*, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-babyai-ftb-qwen3-32b-ep1 | ~2,03 mil millones | No confirmado (base: 32 768, ampliable a 131 072 con YaRN) | No disponible | Fine-tune por destilacion | HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B | ~2,03 mil millones | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | Base denso | Ampliamente disponible |
| Qwen/Qwen3-4B | ~4 mil millones | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | Base denso | Ampliamente disponible |
| Qwen/Qwen3-0.6B | ~0,6 mil millones | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | Base denso | Ampliamente disponible |
| meta-llama/Llama-3.2-1B | ~1,24 mil millones | 128 000 | Llama 3.2 Community License | Base denso | Ampliamente disponible |

Comparación de calidad: no disponible, al no existir evaluaciones publicadas de este *checkpoint*.

## Limitaciones y advertencias

- Modelo no evaluado: la propia model card indica "Not evaluated". No hay ninguna métrica que respalde su calidad en ninguna tarea, ni siquiera en BabyAI.
- Entrenamiento muy corto: una pasada sobre 810 tareas, 51 pasos de explorador y 75 pasos de entrenador con LR 1e-6. Es un *checkpoint* temprano, no un modelo convergido.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Qwen3-1.7B es Apache 2.0, la ausencia de licencia explícita en el artefacto derivado genera incertidumbre legal para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de olvido catastrófico: un ajuste estrecho de dominio sobre un modelo conversacional puede degradar capacidades generales de conversación, multilingüismo y conocimiento factual.
- Sesgos: no hay ninguna evaluación de sesgos ni documentación sobre la composición del dataset de entrenamiento. Se desconoce si las tareas BabyAI empleadas son sintéticas o generadas por el profesor Qwen3-32B, lo que implicaría heredar los sesgos del profesor.
- Alucinación: inherente a los modelos de ~2B de la familia Qwen3; sin evaluación específica no se puede acotar su magnitud en este *checkpoint*.
- Modo *thinking* desactivado: no se debe esperar razonamiento en cadena ni *scratchpad*; el modelo fue entrenado sin esa capacidad activa.
- Idiomas no declarados: los campos de idioma del repositorio están vacíos. Un ajuste corto en tareas de rejilla puede haber reducido el soporte multilingüe del modelo base.
- Comportamiento en contexto largo desconocido: aunque el modelo base soporte 32 768 tokens, el ajuste se realizó sobre tareas cortas de BabyAI. No hay garantía de que la ventana completa siga siendo funcional.
- Sin validación de la comunidad: cero descargas y cero *likes* en la fecha de consulta, sin discusiones ni reportes de terceros.
- Etiqueta `tcod` sin documentar: no se especifica a qué se refiere, por lo que no se debe asumir compatibilidad real con *tool calling* estándar sin verificarla.
- Fecha del repositorio: el campo de creación indica 2026-09-23, dato aportado por el propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-ftb-qwen3-32b-ep1
- Modelo base (Qwen/Qwen3-1.7B): https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor (Qwen/Qwen3-32B): https://huggingface.co/Qwen/Qwen3-32B
- Blog tecnico de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de BabyAI (entorno de referencia para las tareas): https://github.com/mila-iqia/babyai

No se han encontrado otros enlaces (papers, demos o repositorios propios) en la informacion disponible; la model card del autor no incluye referencias adicionales.
