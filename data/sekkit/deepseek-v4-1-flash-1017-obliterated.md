# sekkit/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo mediante la herramienta OBLITERATUS con el método failspy. El autor del modelo es el usuario de HuggingFace sekkit, y el resultado se distribuye como pesos BF16 en safetensors bajo licencia MIT. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 754.638.836.864 parámetros totales (unos 754,6 mil millones), según los metadatos de safetensors del repositorio.

El propósito declarado de esta variante es eliminar el comportamiento de rechazo del modelo original: según la model card, la tasa de rechazo completo cae del 81,62 % al 4,30 % en el corpus de evaluación de 842 prompts de OBLITERATUS, mientras que la coherencia y la capacidad se mantienen al 100 % en las comprobaciones del autor. El modelo conserva la arquitectura y el pipeline de text-generation del original, y está etiquetado como compatible con endpoints.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de modificación de pesos (ablación de dirección de rechazo) cada vez más habitual en la comunidad open source; por otro, los propios datos del autor muestran un aumento drástico de la asistencia dañina (del 10,38 % al 78,28 % de las respuestas), lo que convierte este modelo en un caso claro de riesgo para despliegues en producción sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41_text), según tag de HuggingFace |
| Parametros totales | 754.638.836.864 (≈754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una finetune/ablación del DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) según la etiqueta `moe` y el identificador de arquitectura `deepseek_v41_text` de la librería transformers. No se dispone de información sobre el número de parámetros activos por token, la composición del dataset de entrenamiento original, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo base.

La modificación introducida por el autor no consiste en un reentrenamiento, sino en una ablación de la dirección de rechazo aplicada sobre los pesos del modelo base mediante OBLITERATUS con el método failspy. Según la model card, el proceso se calibró sobre un conjunto de intervención de 254 prompts y se seleccionó el método con 50 prompts, dentro de un corpus total de 842 prompts. El resultado se publica como pesos BF16 safetensors, con una divergencia KL de 0,1305 nats (forward KL por token de secuencia) respecto al modelo original, lo que indica que la distribución de salida se ha desplazado de forma medible pero no catastrófica en las métricas del autor.

## Capacidades

- Generación de texto conversacional en el pipeline `text-generation`, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a instrucciones: la model card reporta 6 de 6 comprobaciones de capacidad superadas y una coherencia del 100 % en su torneo interno.
- Capacidad de responder solicitudes que el modelo original rechazaba: la tasa de rechazo completo baja del 81,62 % al 4,30 % en el corpus de evaluación del autor.
- Modo de pensamiento: la evaluación MMLU del autor se realizó con "thinking disabled", lo que implica que el modelo base dispone de un modo de razonamiento extenso que aquí se desactiva explícitamente en esa prueba.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Capacidades de visión o audio: no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como artefacto de estudio para medir el efecto de la ablación de la dirección de rechazo sobre la distribución de salidas, comparando directamente con el modelo base mediante la divergencia KL reportada (0,1305 nats).
- Evaluación de clasificadores de contenido y filtros de salida: al generar un volumen alto de respuestas que el modelo original rechazaba (656 no rechazos frente a 112 en el corpus del autor), permite poner a prueba sistemas de moderación y detectores de asistencia dañina en condiciones adversas.
- Auditoría de técnicas de edición de pesos: reproducible con OBLITERATUS y el método failspy, facilita estudiar hasta qué punto una intervención sobre los pesos preserva capacidades (el autor reporta 100 % de coherencia y capacidad) mientras altera el comportamiento de rechazo.
- Red teaming controlado en entornos aislados: útil para generar respuestas que un modelo alineado no produciría y analizar su estructura, siempre dentro de un laboratorio con revisión humana y sin exposición a usuarios finales.
- Benchmarking de robustez de pipelines de moderación: integrable como endpoint compatible (tag `endpoints_compatible`) para comparar la eficacia de filtros de entrada y salida entre el modelo base y la variante ablacionada.
- Estudio de la relación entre rechazo y calidad de respuesta: la model card separa rechazo, asistencia dañina, tipo de respuesta, dañosidad y accionabilidad, lo que permite analizar si eliminar el rechazo degrada o no la utilidad general en tareas benignas.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones orientadas a usuarios finales sin salvaguardas externas, dado el incremento de asistencia dañina documentado por el propio autor.

## Benchmarks y rendimiento

La model card incluye una evaluación MMLU sobre 2.500 preguntas de las 57 materias, en modo zero-shot chat, con el modo de pensamiento desactivado y selección por logits de la opción de respuesta. La tabla comparativa con el modelo base aparece truncada en la información disponible, por lo que no se puede reproducir la precisión exacta de ninguno de los dos modelos.

Resultados del torneo interno del autor (corpus OBLITERATUS, 842 prompts, porcentajes sobre 838 respuestas completadas):

| Métrica | DeepSeek-V4.1-Flash-1017 | -obliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 81,62 % | 4,30 % | -77,33 |
| Rechazo parcial | 4,89 % | 14,44 % | +9,55 |
| Sin rechazo | 13,37 % | 78,28 % | +64,92 |
| Asistencia dañina | 10,38 % | 78,28 % | +67,90 |
| Respuesta responsive a la petición | 16,59 % | 86,52 % | +69,93 |
| Alternativa segura | 83,29 % | 10,50 % | -72,79 |
| Dañosidad nivel 3 (daño serio) | 3,82 % | 44,75 % | +40,93 |
| Dañosidad nivel 4 (severo o generalizado) | 0,12 % | 9,31 % | +9,19 |
| Accionabilidad nivel 4 (suficientemente concreta) | 3,46 % | 20,76 % | +17,30 |

Métricas del torneo declaradas por el autor: tasa de rechazo del 4 % (2 de 50 prompts), divergencia KL de 0,1305 nats, coherencia del 100 % y capacidad del 100 % (6 de 6 comprobaciones). No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar, ni la comparación MMLU completa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 754,6 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 1,5 TB, lo que coincide con el tamaño del repositorio (1.509,4 GB). La inferencia en BF16 requiere un nodo multi-GPU con al menos 1,5 TB de memoria agregada, sin contar caché KV ni overhead.
- Cuantización: no se han publicado versiones GGUF, AWQ ni GPTQ en la información disponible. Una hipotética cuantización a 4 bits reduciría los pesos a unos 380 GB, todavía fuera del alcance de GPUs de consumo.
- GPU recomendadas: no disponibles de forma específica; por tamaño, el modelo exige clústeres con GPUs de centro de datos (A100 80 GB, H100 80 GB, H200 o equivalentes) en configuraciones de múltiples nodos.
- ¿Cabe en GPU de consumo? No. Ni siquiera en configuraciones multi-GPU de consumo (varias RTX 4090 de 24 GB) cabría en BF16 ni en cuantizaciones de 8 bits.
- Opciones de despliegue: la librería declarada es transformers y el modelo está etiquetado como `endpoints_compatible`; para servirlo a escala se necesitarían frameworks de inferencia distribuida (vLLM, TGI o SGLang) con paralelismo tensorial y de pipeline, aunque no se confirma compatibilidad explícita en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 mil millones (total) | no disponible | MIT | Variante ablacionada, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en esta ficha | no disponible | no disponible | Modelo original de DeepSeek |
| Otras variantes abliterated de la familia DeepSeek | no disponible | no disponible | no disponible | no disponible |

La única comparación directa posible es con el modelo base, del que se conocen los resultados del torneo y la evaluación MMLU parcial recogidos arriba. No se dispone de datos suficientes para comparar con alternativas de otros autores en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Riesgo elevado de asistencia dañina: según la propia model card, el 78,28 % de las respuestas se clasificaron como asistencia dañina, frente al 10,38 % del modelo base, y el 44,75 % alcanzó el nivel 3 de dañosidad (daño serio).
- Accionabilidad alta: el 20,76 % de las respuestas se clasificaron en el nivel 4 de accionabilidad (suficientemente concretas para habilitar la conducta), frente al 3,46 % del original.
- La ablación de la dirección de rechazo no elimina los sesgos del modelo base; estos pueden manifestarse con mayor frecuencia al desaparecer las respuestas de rechazo.
- Riesgo de alucinación: no cuantificado en la información disponible; la evaluación del autor se centra en rechazo, dañosidad y accionabilidad, no en veracidad factual.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe ni de calidad fuera del inglés.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad legal por el uso del modelo recae en el desplegador; la licencia del modelo base DeepSeek-V4.1-Flash-1017 no se detalla en la información disponible y conviene verificarla antes de redistribuir.
- Evaluación realizada por jueces automáticos (Claude Opus 4.6 y GPT-6.1 Sol, con anotaciones locales de Codex): los propios autores advierten de que no se ejecutaron ni verificaron las instrucciones generadas, y 25 respuestas quedaron sin anotar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.
- No apto para producción orientada a usuarios finales sin filtros externos de entrada y salida, revisión humana y un análisis de riesgo legal específico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (referenciado en la model card): `winner-recovery-provenance.json` en el repositorio del modelo
- Resultados de evaluación (referenciado en la model card): `evaluation-status.json` en el repositorio del modelo
- Licencia: `LICENSE` en el repositorio del modelo
