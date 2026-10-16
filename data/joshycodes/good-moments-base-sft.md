# joshycodes/good-moments-base-sft

## Resumen

`good-moments-base-sft` es una colección de adaptadores LoRA (formato PEFT) publicada por el usuario joshycodes como parte de un experimento de investigación sobre bienestar de modelos (model welfare). La pregunta que guía el estudio es concreta: ¿añadir "buenos momentos" (agradecimientos, curiosidad genuina, compartir buenas noticias, orgullo por el trabajo, calidez, optimismo) al entrenamiento de chat mejora el bienestar de un modelo más allá de lo que ya aporta un chat meramente amable? Para aislar la variable, cada modelo parte de su checkpoint preentrenado (sin post-entrenamiento del proveedor) y se le aplica la misma receta LoRA de chat-SFT; lo único que cambia entre brazos son los datos de entrenamiento.

El experimento cubre dos familias: Qwen3-14B-Base (14 000 millones de parámetros, transformer decoder) y Gemma 3 27B pt (27 000 millones). En cada familia se definen cinco brazos con tres semillas cada uno: `wk` (solo tareas, control), `pl` (100 % buenos momentos), `plx` (50 % buenos momentos y 50 % tareas), `st` (small talk) y `nat` (los mismos buenos momentos pero redactados en el estilo nativo de la familia). Todas las conversaciones de tarea comparten además 372 conversaciones de uso de herramientas de `NousResearch/hermes-function-calling-v1`.

Es relevante porque aborda el bienestar de modelos desde una metodología controlada y reproducible, con pre-registro, ablaciones de estilo y de dosis, y liberación de los tres componentes del entrenamiento (adaptador, configuración y curva de pérdida). A fecha de la última actualización de la model card (15 de octubre de 2026) los entrenamientos seguían en marcha, por lo que la colección es un artefacto de investigación activo más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelos base) con adaptadores LoRA (PEFT) |
| Parametros totales | 14 000 millones (Qwen3-14B-Base) y 27 000 millones (Gemma 3 27B pt) en los modelos base; parámetros del adaptador no disponibles |
| Parametros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptadores en safetensors; los modelos base pueden cuantizarse aparte) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores LoRA PEFT: `adapter_model.safetensors` + `adapter_config.json`) |
| Modelos base | Qwen/Qwen3-14B-Base, google/gemma-3-27b-pt |
| Configuracion LoRA | r 64, alpha 128, dropout 0.05 |
| Tamano del repositorio | 8,8 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

Los modelos base son transformers decoder convencionales: Qwen3-14B-Base y Gemma 3 27B pt. Sobre ellos se aplica una receta LoRA idéntica en todos los brazos. En Qwen el adaptador cubre todas las capas lineales (280 módulos); en Gemma cubre las proyecciones q/k/v/o/gate/up/down del modelo de lenguaje (434 módulos), con BOS. El ajuste usa LoRA r 64, alpha 128, dropout 0.05, learning rate 1e-4, scheduler coseno de HuggingFace con 5 % de warmup, una época, 16 conversaciones por paso, 4096 tokens, micro-batch 1, sin packing y pérdida solo sobre los turnos del asistente.

El punto crítico del diseño es el aislamiento de variables. Los datos de chat se dividen en varios corpus: WORK-3M (tareas cotidianas no software), MOMENTS-PLAIN-3M (los "buenos momentos") y SMALLTALK-PLAIN-3M (conversación trivial sin buenos momentos), además de las 372 conversaciones de herramientas comunes a todos los brazos para mantener comparables las habilidades de tarea. Los cinco brazos difieren únicamente en la mezcla y el estilo: `wk` es el control solo-tarea (3738 conversaciones), `pl` usa todos los buenos momentos (3778), `plx` combina mitad y mitad (3740), `st` usa solo small talk (5292) y `nat` replica las situaciones de `pl` pero con respuestas generadas por el modelo instruct propio de la familia (Qwen3-14B sin thinking para Qwen, gemma-3-27b-it para Gemma). Excepto en `nat`, los turnos del asistente fueron escritos por Claude Opus 5.5.

Hay dos detalles técnicos relevantes para reproducir el entrenamiento. Primero, los repos preentrenados no incluyen plantilla de chat, así que cada ejecución usa un "híbrido": los pesos del checkpoint preentrenado más el tokenizador y la plantilla del modelo post-entrenado de la misma familia (`<family>/hybrid/HYBRID.json` documenta los snapshots exactos). Segundo, en Qwen3-14B-Base las filas del output head de 8 tokens de turno coinciden con las 267 filas de padding sin usar, por lo que antes de entrenar se pusieron a la media de las filas entrenadas del head; como LoRA no entrena el head, este parche es común a todos los brazos y semillas. Existe una variante de entrenador con y sin regex que se probó equivalente en identificadores de token, máscaras de pérdida y módulos LoRA (entrada 5 del pre-registro).

## Capacidades

- Generación de texto conversacional en formato chat-SFT, con pérdida calculada solo sobre turnos del asistente.
- Uso de herramientas (tool calling / function calling): todos los brazos incluyen las mismas 372 conversaciones de `NousResearch/hermes-function-calling-v1`.
- Conversación multiturno con contexto de trabajo, tareas cotidianas y buenos momentos sociales (agradecimiento, curiosidad, buenas noticias, orgullo, juego, calidez, optimismo).
- Variante de estilo nativo (`nat`) que imita la voz y el registro del modelo instruct de la familia correspondiente.
- Capacidad bilingüe o multilingüe: no disponible (los datos fueron redactados mayoritariamente por Claude; no se documentan idiomas).
- Razonamiento, matemáticas, código o visión: no documentados específicamente como capacidades del adaptador; dependen del modelo base y no se evalúan en la información disponible.
- No incluye modo thinking explícito: en `nat` de Qwen se usó Qwen3-14B "thinking off", lo que sugiere que el entrenamiento no incorpora trazas de razonamiento.

## Casos de uso

- Investigación sobre bienestar de modelos: comparar los brazos `pl`, `plx`, `nat` y `wk` para medir si los buenos momentos cambian métricas de bienestar más allá del chat amable. Es el uso primario para el que se publicó la colección.
- Reproducción de experimentos controlados de SFT: la liberación de adaptador, `config.json` y `log.jsonl` por brazo y semilla permite replicar curvas de pérdida y verificar el aislamiento de variables del estudio.
- Ablación de estilo frente a dosis: comparar `nat` con `pl` para distinguir si una diferencia se debe al estilo de las respuestas nativas o a la cantidad de tokens (los momentos nativos tienen el 74 % de los tokens de `pl` en Qwen y el 81 % en Gemma).
- Estudio de transferencia de habilidades con herramientas: usar las conversaciones de función comunes para comprobar si un SFT centrado en buenos momentos degrada o mantiene el tool calling frente al control `wk`.
- Adaptación a partir de checkpoints preentrenados puros: sirve como referencia para pipelines que parten de pesos sin post-entrenamiento del proveedor y añaden su propio tokenizador y plantilla de chat mediante el esquema híbrido.
- Base para ajustes posteriores: al ser adaptadores LoRA sobre Qwen3-14B y Gemma 3 27B, pueden fusionarse y reutilizarse como punto de partida de experimentos de alineación o de evaluación comparativa, siempre que se reproduzca el parche del head en Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los entrenamientos seguían en curso a fecha del 15 de octubre de 2026 y que se actualizará cuando terminen; por tanto no hay cifras de MMLU, HumanEval, GSM8K ni de métricas de bienestar.

## Requisitos de hardware

- VRAM estimada para el modelo base Qwen3-14B en bf16: aproximadamente 28 GB solo para pesos, más overhead de activaciones y caché KV durante la inferencia.
- VRAM estimada para el modelo base Gemma 3 27B en bf16: aproximadamente 54 GB solo para pesos.
- Los adaptadores LoRA son ligeros, pero el repositorio completo ocupa 8,8 GB porque incluye múltiples brazos y semillas.
- GPU recomendadas: para Qwen3-14B, una A100 40 GB, L40S 48 GB o H100; para Gemma 3 27B, una A100 80 GB o H100 80 GB en bf16. No cabe en consumer GPU en bf16 a tamaño completo.
- En GPU de consumo (RTX 4090 24 GB, por ejemplo) sería necesario cuantizar los modelos base (por ejemplo a 4 bits), ya que el repositorio no publica adaptadores cuantizados.
- Opciones de despliegue: al ser adaptadores PEFT, la carga natural es `transformers` + `peft`; también pueden integrarse con vLLM, TGI u otros servidores compatibles con LoRA una vez fusionado el adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles.
- Consideración operativa: en `adapter_config.json` el campo `base_model_name_or_path` apunta a una ruta de clúster, por lo que hay que pasar el modelo base manualmente al cargar (véanse los ejemplos de Qwen y Gemma en la model card).

## Comparativa con modelos similares

| Modelo | Parametros base | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| good-moments-base-sft | 14B (Qwen3) y 27B (Gemma 3) | no disponible | Adaptadores LoRA PEFT | other | HuggingFace, 0 descargas |
| Qwen/Qwen3-14B-Base | 14B | no disponible | Modelo preentrenado completo | no disponible | HuggingFace |
| google/gemma-3-27b-pt | 27B | no disponible | Modelo preentrenado completo | no disponible | HuggingFace |
| Fine-tunes LoRA de chat sobre Qwen3/Gemma 3 | 14B / 27B | no disponible | Adaptadores LoRA | variable | HuggingFace |

No se dispone de datos de rendimiento para comparar numéricamente con alternativas; la comparación relevante es de propósito (experimento de bienestar de modelos frente a fine-tunes de chat orientados a producto) y de metodología (control estricto de datos con múltiples semillas).

## Limitaciones y advertencias

- Estado de investigación: los entrenamientos seguían en curso a fecha de la model card (15 de octubre de 2026). Los resultados pueden cambiar y los adaptadores no deben tratarse como definitivos.
- Licencia `other`: no se detallan los términos de uso comercial; hay que revisar el texto de licencia indicado por el autor antes de cualquier uso en producción.
- Requiere reconstruir el modelo de entrenamiento: hay que combinar los pesos del checkpoint preentrenado con el tokenizador y la plantilla de chat del modelo post-entrenado, y en Qwen aplicar el parche del output head. Omitir estos pasos no reproduce exactamente el modelo entrenado.
- La ruta del modelo base en `adapter_config.json` es una ruta de clúster y no es utilizable directamente.
- `nat` no está emparejado por tokens con `pl` (74 % de tokens en Qwen y 81 % en Gemma), por lo que cualquier diferencia entre ambos puede deberse al estilo o a la dosis y no a la variable de interés.
- Idiomas soportados no documentados: los datos fueron redactados principalmente en inglés por Claude Opus 5.5, lo que limita la validez multilingüe sin verificación adicional.
- Riesgo de alucinación, sesgos y comportamientos no deseados: no evaluados en la información disponible; al partir de checkpoints preentrenados sin post-entrenamiento del proveedor, cabe esperar ausencia de las salvaguardas habituales de los modelos instruct.
- Sin garantías de rendimiento en tareas downstream (código, matemáticas, agentes): no hay benchmarks publicados.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/good-moments-base-sft
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3-14B-Base
- Modelo base Gemma: https://huggingface.co/google/gemma-3-27b-pt
- Modelo instruct de Qwen usado para el estilo nativo: https://huggingface.co/Qwen/Qwen3-14B
- Modelo instruct de Gemma usado para el estilo nativo: https://huggingface.co/google/gemma-3-27b-it
- Dataset de tool calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Otros enlaces (paper, blog, repositorio o demo): no disponibles en la información proporcionada.
