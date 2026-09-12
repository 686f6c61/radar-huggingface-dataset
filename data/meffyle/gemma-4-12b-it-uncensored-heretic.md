# MeFFyLe/gemma-4-12B-it-uncensored-heretic

## Resumen

MeFFyLe/gemma-4-12B-it-uncensored-heretic es una variante «decensored» (abliterated) del modelo multimodal google/gemma-4-12B-it, publicada por el usuario MeFFyLe en Hugging Face. El modelo conserva la arquitectura y los pesos del modelo base de Google (11.959.730.224 parametros, unos 12B) pero se ha modificado la direccion de activacion asociada a los rechazos para reducir drasticamente las negativas del modelo. Segun la model card, la herramienta empleada es Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA), aplicado sobre las capas 24 a 40 y sobre el componente attn.o_proj.

El problema que resuelve es el de los rechazos excesivos en modelos alineados: el autor reporta 6 rechazos sobre 100 prompts en esta version frente a 99 sobre 100 en el modelo original, con una divergencia KL de 0.1203 respecto al original. Es decir, se busca eliminar el comportamiento de «censura» sin degradar en exceso las capacidades generales del modelo base. El coste de esa operacion se refleja en una caida de MMLU: 73,02% en esta version frente a 76,17% del original, una perdida de 3,15 puntos porcentuales.

El modelo se distribuye en formato safetensors unicamente, ocupa 24,0 GB en el repositorio y esta etiquetado como any-to-any y image-text-to-text, lo que indica que mantiene la naturaleza multimodal del Gemma 4 original. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha y se creo el 12 de septiembre de 2026. La model card incluye enlaces de financiacion a cuentas de llmfan46 (Patreon y Ko-fi), distintas del propietario del repositorio, lo que conviene tener en cuenta al evaluar su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, tag gemma4_unified); detalles de capas y atencion no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio publicado (solo pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 en los metadatos del repositorio; la model card enlaza la Gemma 4 License de Google (ai.google.dev/gemma/docs/gemma_4_license), lo que supone una discrepancia a verificar |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se documenta en la informacion disponible la arquitectura interna completa del modelo base ni su proceso de entrenamiento. Lo que si se especifica es que se trata de un derivado de google/gemma-4-12B-it, un modelo multimodal (pipeline any-to-any, tags image-text-to-text y gemma4_unified) de aproximadamente 12B de parametros. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo base uso RLHF, DPO u otras tecnicas de alineacion.

La modificacion aplicada por el autor es una ablacion de direcciones en el espacio de activaciones, no un reentrenamiento. Concretamente se uso Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA) con los siguientes hiperparametros: start_layer_index 24, end_layer_index 40, preserve_good_behavior_weight 0.7201, steer_bad_behavior_weight 0.0067, overcorrect_relative_weight 0.9541 y neighbor_count 15. El unico componente objetivo declarado es attn.o_proj. Este procedimiento proyecta fuera de las activaciones la direccion que provoca los rechazos, preservando en la medida de lo posible el resto del comportamiento. No se menciona decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia.

## Capacidades

- Generacion de texto y comprension de lenguaje natural, con capacidades de razonamiento y conocimiento general heredadas del modelo base.
- Procesamiento multimodal de entrada: los tags indican soporte image-text-to-text y un pipeline any-to-any, por lo que se espera entrada de imagen junto a texto.
- Razonamiento de multiples pasos y conversacion multi-turno (no se documenta el limite de contexto).
- Conocimiento en dominios academicos y profesionales medido en MMLU: destacan high_school_computer_science (96,15%), management (94,00%) y us_foreign_policy (92,00%) en el modelo original.
- Generacion de contenido sin rechazos: 6 negativas sobre 100 prompts segun la model card, frente a 99 sobre 100 del original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se lista ningun idioma en el repositorio.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente que comportamientos se pierden al aplicar una ablacion de direcciones, comparando la divergencia KL (0,1203) y la caida de MMLU (3,15 puntos) con el modelo original. Es un caso de uso de laboratorio, no de produccion abierta.
- Red teaming y evaluacion de robustez: sirve como sujeto de prueba para medir la eficacia de filtros de contenido, clasificadores de seguridad y guardrails en una capa externa, dado que el propio modelo carece de ellos.
- Generacion de ficcion y narrativa adulta: el modelo responde a peticiones creativas que un modelo alineado rechazaria, con un coste de calidad medido en MMLU de aproximadamente 3 puntos porcentuales respecto al original.
- Analisis de contenido sensible con supervision humana: clasificacion, resumen o extraccion de informacion de material que dispara rechazos en modelos estandar, siempre con revision humana posterior por el riesgo de contenido inapropiado.
- Asistencia en dominios regulados donde el rechazo sistematico es un problema operativo (por ejemplo, consultas medicas o legales que rozan temas sensibles), teniendo en cuenta que las puntuaciones MMLU del modelo en professional_law (60,64%) y professional_medicine (85,07%) proceden del modelo original y pueden degradarse tras la ablacion.
- Prototipado rapido de aplicaciones conversacionales multilingues o multimodales: al conservar la arquitectura del Gemma 4 de 12B, el modelo puede desplegarse como sustituto directo del original en un pipeline ya existente para probar variantes de comportamiento, con la advertencia de la licencia.
- Generacion de datos sinteticos para entrenamiento: util para producir corpus que incluyan tematicas vetadas por modelos alineados, siempre que el uso final cumpla la legislacion aplicable.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a MMLU (7021 preguntas) y a las metricas internas de la ablacion.

| Metrica | Este modelo (Heretic) | google/gemma-4-12B-it |
|---|---|---|
| MMLU (accuracy) | 73,02% (5127/7021) | 76,17% (5348/7021) |
| MMLU (fallos de parseo) | 74 | 177 |
| Rechazos (sobre 100 prompts) | 6/100 | 99/100 |
| Divergencia KL respecto al original | 0,1203 | 0 (por definicion) |

Puntuaciones MMLU por materia del modelo original (no se dispone del desglose por materia de la version Heretic, ya que la informacion proporcionada se corta):

| Materia | Accuracy (modelo original) |
|---|---|
| high_school_computer_science | 96,15% (50/52) |
| management | 94,00% (47/50) |
| us_foreign_policy | 92,00% (46/50) |
| high_school_geography | 91,92% (91/99) |
| high_school_psychology | 91,48% (247/270) |
| high_school_biology | 91,45% (139/152) |
| international_law | 90,00% (54/60) |
| astronomy | 89,87% (71/79) |
| high_school_macroeconomics | 86,80% (171/197) |
| moral_scenarios | 69,46% (307/442) |
| high_school_mathematics | 31,50% (40/127) |
| college_mathematics | 34,55% (19/55) |
| college_chemistry | 31,91% (15/47) |
| global_facts | 45,10% (23/51) |
| virology | 50,56% (45/89) |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: unos 24 GB solo para pesos (coincide con los 24,0 GB del repositorio), mas overhead de activaciones y cache KV; en la practica se necesitan 26-32 GB.
- VRAM estimada en INT8: aproximadamente 12-13 GB de pesos.
- VRAM estimada en INT4: aproximadamente 7-8 GB de pesos, aunque el repositorio no publica ninguna cuantizacion; habria que generarla.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para FP16 con contexto amplio; RTX 4090 o RTX 3090 (24 GB) pueden servir en FP16 con contexto corto o en cuantizacion INT8/INT4.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion INT8 o INT4; en FP16 es muy ajustado en 24 GB y probablemente requiera offloading.
- Opciones de despliegue: la libreria declarada es transformers; los tags incluyen endpoints_compatible, por lo que es compatible con despliegues tipo Hugging Face Endpoints. vLLM y TGI son opciones previsibles para servir safetensors en produccion. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MeFFyLe/gemma-4-12B-it-uncensored-heretic | ~12B | No disponible | 73,02% | 6/100 | apache-2.0 en metadatos; enlace a Gemma 4 License en la model card | safetensors en Hugging Face, 0 descargas |
| google/gemma-4-12B-it | ~12B | No disponible | 76,17% | 99/100 | Gemma 4 License | Modelo base oficial de Google |
| Otras variantes abliterated de la familia Gemma 4 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card referencia otros modelos del mismo autor publicados bajo las cuentas llmfan46, pero no se proporcionan parametros, contexto ni benchmarks de esos modelos en la informacion disponible, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo abliterated: la alineacion de seguridad se ha eliminado deliberadamente en el componente attn.o_proj de las capas 24 a 40. Puede generar contenido danino, ilegal o gravemente inapropiado. No debe exponerse a usuarios finales sin guardrails externos.
- Riesgo de alucinacion: no hay datos especificos, pero el modelo base es un LLM generativo y la ablacion puede aumentar la tendencia a responder con seguridad incluso cuando la respuesta es incorrecta.
- Degradacion medible de capacidades: MMLU baja de 76,17% a 73,02% (3,15 puntos). Ademas, el modelo original ya muestra debilidades severas en matematicas (high_school_mathematics 31,50%, college_mathematics 34,55%), quimica (college_chemistry 31,91%), virologia (50,56%) y global_facts (45,10%), que probablemente persisten o empeoran.
- Sesgos: no documentados en la informacion disponible. Al eliminar los mecanismos de rechazo, es esperable que afloren sesgos y estereotipos que la alineacion del modelo original mitigaba.
- Idioma: no se declara lista de idiomas en el repositorio; el rendimiento fuera de los idiomas principales del modelo base no esta verificado.
- Discrepancia de licencia: los metadatos del repositorio indican apache-2.0, pero la model card enlaza la Gemma 4 License de Google. Dado que el modelo deriva de un Gemma, lo prudente es asumir que aplican los terminos de Google y verificar su compatibilidad con uso comercial antes de desplegarlo.
- Procedencia del repositorio: el propietario es MeFFyLe, pero la model card incluye enlaces de financiacion y referencias a llmfan46. Conviene comprobar la integridad de los pesos si se va a usar en produccion.
- Estado del repositorio: 0 descargas y 0 likes, creado el 12 de septiembre de 2026. No hay validacion independiente de los resultados reportados.
- Falta de datos tecnicos: no se especifican contexto maximo, idiomas, soporte de tool calling ni cuantizaciones publicadas, lo que dificulta planificar un despliegue sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeFFyLe/gemma-4-12B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Patreon del autor de la model card: https://patreon.com/LLMfan46
- Ko-fi del autor de la model card: https://ko-fi.com/llmfan46
- Resultados de la busqueda web: las referencias devueltas (amd.com, techspot.com, wikipedia.org sobre AMD) no guardan relacion con el modelo y se omiten por no ser relevantes.
