# nerozx/qwen3.5-2b-decision-browser-q4

## Resumen

`nerozx/qwen3.5-2b-decision-browser-q4` es un modelo de decisión (no conversacional) derivado de `unsloth/Qwen3.5-2B`. No genera texto libre: recibe un `state` (tarea, paso actual y acciones previas) y un conjunto de `questions` tipadas cuyas opciones son elementos de una página web, y devuelve la clave de la opción a interactuar junto con una probabilidad calibrada por opción. Está pensado para ocupar el puesto de "cabeza de decisión" dentro de un bucle de agente web, un paso atrás del planificador y después de un ranker que reduce el DOM a una lista corta de candidatos.

El autor es `nerozx`, que lo publica como checkpoint exportado de Unsloth Studio con el layout `clef`, servido mediante el endpoint `/v1/systemone` sobre backend llama.cpp. El modelo base es un denso de 1.912.297.796 parámetros (aproximadamente 1,91 B) con arquitectura Qwen3.5, atención híbrida, torre de visión y 262.144 tokens de contexto; aquí se distribuye cuantizado en Q4_K_M con la cabeza de decisión conjunta también cuantizada.

Su relevancia es acotada pero concreta: demuestra que una cabeza de decisión de 2 B puede alcanzar un 86,9 % de accuracy en selección de objetivo sobre el split de evaluación de Mind2Web (N=375) con un ECE de 0,0422, es decir, con probabilidades utilizables para umbrales de abstención. Es un artefacto especializado, en inglés, con licencia `other` y con un envelope de uso muy estricto (máximo 10 opciones por pregunta, instrucción atómica) que conviene respetar si se integra en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 con atención híbrida (lineal + atención completa) y torre de visión; cabeza de decisión conjunta ("clef") de 4 capas, hidden 2048, width 512 |
| Parametros totales | 1.912.297.796 (aproximadamente 1,91 B), según safetensors del modelo base; la cabeza de decisión se suma aparte |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens según el modelo base Qwen3.5-2B; no verificado en el GGUF. El envelope efectivo de la tarea es de una instrucción atómica más un máximo de 10 opciones por pregunta |
| Tipos de cuantizacion | Backbone y cabeza en Q4_K_M (pesos de la cabeza en Q4_K/Q6_K, normas y bias en F32); `mmproj-Q8_0.gguf` para la torre de visión; origen en Q8_0 / MLX fp16 |
| Idiomas soportados | Inglés (`language: en`) |
| Licencia | `other` (license_name: `other`). Los datos derivados de Mind2Web conservan atribución CC-BY-4.0 |
| Formato de pesos | GGUF (`model-Q4_K_M.gguf`, `mmproj-Q8_0.gguf`) más `export.json`, `unsloth_decision_config.json` y `joint_head_config.json` |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-2B, un denso de 1,91 B parámetros con atención híbrida: según el port publicado en `coreai-model-zoo`, la torre de texto tiene 24 capas, de las cuales 18 son de atención lineal y 6 de atención completa, con contexto nativo de 262.144 tokens y torre de visión integrada. Sobre ese backbone, el autor añade una cabeza de decisión conjunta ("clef") de 4 capas con hidden 2048 y width 512, que recibe el estado y las preguntas tipadas y emite una distribución calibrada sobre las opciones declaradas. La temperatura de calibración se ajusta por tramos de número de opciones (≤2, 3-5, 6-10 y 11+), y en este checkpoint está plegada en el artefacto exportado.

El entrenamiento parte de `unsloth/Qwen3.5-2B` con QLoRA y función de pérdida `soft_cross_entropy`, seguido de SFT sobre filas de decisión derivadas de Mind2Web (splits de train y eval, aproximadamente 6.900 pasos). No se documenta en la información disponible el uso de RLHF o DPO, ni el volumen total de tokens de entrenamiento. La cuantización afecta también a la cabeza: los pesos pasan a Q4_K/Q6_K y las normas y bias se mantienen en F32, con un coste medido de 1,4 puntos porcentuales de accuracy y una calibración ligeramente mejor que el checkpoint fuente.

## Capacidades

- Decisión de siguiente elemento: dado un estado y un conjunto de opciones etiquetadas (`e00`, `e01`, ...), devuelve la clave elegida y una probabilidad calibrada por opción.
- Clasificación de operación: distingue entre `click`, `type` y `select` mediante preguntas de tipo `choice`.
- Detección de necesidad de valor: pregunta de tipo `noul` ("needs_value") para señalar si la acción requiere un valor concreto.
- Abstención explícita: la opción `none` permite rechazar todas las opciones listadas; en la evaluación tiene un recall del 100 % sin falsas abstenciones.
- Entrada de imagen opcional mediante `mmproj-Q8_0.gguf`, heredada de la torre de visión del modelo base.
- Razonamiento de un solo paso: procesa instrucciones atómicas en inglés, no SOP multi-paso.
- No soporta tool calling, function calling genérico, generación de texto libre, escritura de valores en campos, planificación de procedimientos ni juicio de finalización de tarea.

## Casos de uso

- Bucle de agente web con lista corta: un planificador o un ranker reduce el DOM a 10 candidatos y este modelo elige el siguiente elemento a interactuar con una confianza asociada, lo que permite umbrales de abstención y reenvío al planificador.
- Automatización RPA tolerante a cambios de maquetación: en lugar de selectores CSS frágiles, se pasa el estado del paso y las filas o elementos visibles como opciones, y el modelo decide cuál corresponde a la tarea descrita.
- Desambiguación de operación en formularios: tras identificar el campo, se consulta la pregunta `operation` para decidir entre escribir, hacer clic o seleccionar en un desplegable.
- Enrutado con abstención: usando la probabilidad calibrada y la opción `none`, se puede derivar a revisión humana cualquier decisión por debajo de un umbral, con la ventaja de que el ECE medido (0,0422) hace que las probabilidades sean interpretables.
- Etiquetado y auditoría de trayectorias: al ser un clasificador determinista sobre opciones declaradas, sirve para anotar pasos de datasets de agentes web y comparar la decisión del modelo con la acción registrada.
- Agentes on-device o de borde: con 1,29 GB de pesos en Q4_K_M, el modelo cabe en equipos sin GPU dedicada y permite ejecutar el paso de decisión en local, manteniendo el planificador en servidor.
- Filtro previo en pipelines de CI para tests de interfaz: integrado en el endpoint `/v1/systemone`, puede decidir el siguiente elemento en pruebas end-to-end guiadas por lenguaje natural.

## Benchmarks y rendimiento

Evaluación sobre el split de eval, N=375, accuracy de la pregunta `target`:

| Cuantizacion | Accuracy | ECE |
|---|---|---|
| Q8_0 / MLX fp16 (fuente) | 88,3 % | 0,0506 |
| Q4_K_M (este archivo) | 86,9 % | 0,0422 |

- Concordancia entre Q8 y Q4: 96,3 %.
- Recall de `none`: 100 % en ambas cuantizaciones, sin falsas abstenciones.
- Coste medido de la cuantización: 1,4 puntos porcentuales de accuracy, con calibración ligeramente mejor en Q4_K_M.
- No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-2 GB para el checkpoint Q4_K_M; alrededor de 1,7-2,5 GB si se carga también `mmproj-Q8_0.gguf` (365 MB) para entrada de imagen. El consumo adicional depende del contexto configurado.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 quedan sobradamente cubiertas. Para despliegues de alto volumen, una A100 o H100 permite servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales, y también en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp como backend principal; endpoint `/v1/systemone` de Unsloth Studio con layout `clef`. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp en modo chat, porque la cabeza de decisión requiere el formato de petición `state` + `questions`.
- Latencia y throughput: no disponible en la información proporcionada. Al ser un modelo de 1,9 B en Q4_K_M con salidas de un único token de decisión, la latencia esperada es baja, pero no hay cifras publicadas.
- Almacenamiento: 1,7 GB de repositorio (1,29 GB del GGUF principal, 365 MB del `mmproj` y los JSON de configuración).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nerozx/qwen3.5-2b-decision-browser-q4` | 1,91 B | 262.144 tokens (heredado) | Cabeza de decisión para agente web, 10 opciones máximo | `other` | GGUF en HuggingFace, endpoint `/v1/systemone` |
| `unsloth/Qwen3.5-2B` (base) | 1,91 B | 262.144 tokens | Modelo conversacional multimodal, vision-lenguaje | no disponible en la información | HuggingFace, Qualcomm AI Hub, LM Studio |
| `Jev-Style-Qwen3.5-2B-Decision` (vía `coreai-model-zoo`) | ~2 B | no disponible | Decisión tipada en inglés, LoRA fusionada, temperatura plegada en RMSNorm | no disponible | Port a Core AI, HuggingFace |
| `Qwen/Qwen3.5-2B` (oficial) | 2 B denso | 262.144 tokens | Modelo base multilingüe con encoder de visión, gated delta networks | no disponible en la información | HuggingFace, vLLM Recipes, LM Studio |

Frente al Qwen3.5-2B conversacional, este checkpoint sacrifica generación libre y multilingüismo a cambio de una salida estructurada y calibrada para una única tarea. Frente al port de `coreai-model-zoo`, comparte enfoque de decisión tipada, pero no hay datos públicos comparables de accuracy ni de ECE para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con un prompt conversacional produce resultados sin sentido. Requiere el esquema `state` + `questions` y el endpoint `/v1/systemone`.
- Envelope estricto de 10 opciones por pregunta (más `none`). Con 41-53 opciones la distribución se vuelve no informativa (plana o afilada pero incorrecta); las temperaturas de calibración solo están ajustadas por tramos hasta 11+.
- Instrucciones atómicas y en inglés: los SOP multi-paso son responsabilidad del planificador, no de esta cabeza.
- El campo `Website:` debe contener solo el hostname; una URL completa filtra tokens de tenant o slug que sesgan la cabeza hacia elementos no relacionados.
- No genera texto libre, no escribe valores en campos, no juzga si una tarea está completada, no planifica procedimientos y no ordena cientos de elementos del DOM; necesita una lista corta previamente filtrada.
- Idiomas: únicamente inglés. No hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinación: aunque la salida está restringida a opciones declaradas, la elección puede ser incorrecta; el accuracy medido es del 86,9 % en el split de evaluación, lo que implica aproximadamente un 13 % de fallos en ese conjunto.
- Sesgos: los derivados de Mind2Web (CC-BY-4.0) condicionan la distribución de tipos de página, dominios y vocabulario; no se documenta ninguna auditoría de sesgos en la información disponible.
- Licencia `other`: es imprescindible revisar los términos concretos antes de un uso comercial, incluidos los del modelo base `unsloth/Qwen3.5-2B` y la atribución CC-BY-4.0 de los datos derivados de Mind2Web.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicado el 24 de octubre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- La cuantización degrada la accuracy en 1,4 puntos porcentuales respecto al checkpoint Q8_0/MLX fp16; si el margen de decisión es crítico, conviene evaluar la versión de mayor precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nerozx/qwen3.5-2b-decision-browser-q4
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Port de decisión Qwen3.5-2B en coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/qwen3.5-2b-decision/README.md
- Receta de vLLM para Qwen3.5-2B: https://recipes.vllm.ai/Qwen/Qwen3.5-2B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen3.5-2B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-2b
