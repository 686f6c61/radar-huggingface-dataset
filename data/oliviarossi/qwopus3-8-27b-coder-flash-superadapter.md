# OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter

## Resumen

Qwopus3.8-27B-Coder-Flash-SuperAdapter es un checkpoint fusionado publicado por OliviaRossi que aplica un adaptador LoRA de rango 96 sobre el modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un derivado de la familia Qwen 3.8 orientado a programación agéntica. El resultado es un modelo de 27.781.427.952 parámetros (~27,8 mil millones) en formato safetensors, con licencia Apache 2.0 y pipeline declarado image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base.

La operación de merge fusiona 256 matrices objetivo del adaptador harness-hub/Qwen3.8-27B-super-adapter con LORA_STRENGTH=1.0 en precisión float32, e incorpora una plantilla de chat mejorada publicada por el mismo autor. No se trata de un entrenamiento desde cero ni de un fine-tuning adicional, sino de una consolidación de pesos que elimina la necesidad de cargar el adaptador por separado en tiempo de inferencia.

Su relevancia es acotada: el repositorio tiene cero descargas y un único like en el momento de la consulta, y no se han publicado métricas de evaluación. Resulta útil como referencia técnica para quienes trabajen con merges LoRA sobre la familia Qwen 3.x y para experimentar con el modelo base sin gestionar adaptadores externos, pero no debe considerarse un modelo validado en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8; detalles internos no disponibles) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se asume compatibilidad con cuantizacion estandar, sin confirmacion del autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento nuevo. Se parte de Jackrong/Qwopus3.8-27B-Coder-Flash y se fusiona el adaptador harness-hub/Qwen3.8-27B-super-adapter con fuerza 1.0, aplicando 256 matrices LoRA objetivo de rango 96 y alpha 192,0, calculadas en float32 para preservar precisión numérica durante la consolidación. La política MTP (multi-token prediction) se mantiene la del modelo base (`keep_base`), sin modificaciones.

Adicionalmente se sincroniza la plantilla de chat del repositorio OliviaRossi/Improved-Chat-Template-for-Qwen-3.x tanto en `chat_template.jinja` como en `tokenizer_config.json`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas. La etiqueta `agentic-coding` del autor sugiere un ajuste orientado a tareas de agente y código, pero no hay evidencia publicada que lo cuantifique.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Procesamiento image-text-to-text: el pipeline declarado implica entrada de imagen y texto, aunque no se detalla la resolución ni el codificador visual.
- Orientación a programación agéntica (`agentic-coding`), presumiblemente con soporte de razonamiento multi-paso y uso de herramientas, aunque no se documenta explícitamente el soporte de function calling.
- Plantilla de chat mejorada para la familia Qwen 3.x, que puede afectar al formato de turnos y a la estabilidad en conversaciones largas.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan modos de pensamiento explícitos, audio ni otras modalidades.

## Casos de uso

- Asistencia a la programación en editor: el modelo puede integrarse como backend de autocompletado y generación de parches en IDE, aprovechando su orientación a código y su plantilla de chat adaptada a Qwen 3.x.
- Experimentación con merges LoRA: sirve como referencia reproducible para validar la fusión de adaptadores de rango 96 sobre un modelo de ~27,8 B, comparando el comportamiento con y sin adaptador.
- Prototipado de agentes de código: la etiqueta `agentic-coding` lo hace candidato para pipelines que encadenan edición de ficheros, ejecución de tests y corrección iterativa, siempre con validación humana.
- Evaluación de plantillas de chat: al incorporar una plantilla mejorada, permite medir el impacto del formato de turnos en la calidad de respuesta frente al modelo base.
- Tareas image-text-to-text en prototipos: descripción de capturas de pantalla o diagramas técnicos combinada con explicaciones de código, aunque sin garantías de calidad publicadas.
- Base para fine-tuning posterior: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio sin restricciones de uso comercial.
- Docencia e investigación sobre consolidación de pesos: útil para estudiar cómo afecta la fusión en float32 a la perplejidad y a la coherencia en comparación con cargar el adaptador en runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB, viable en una RTX 4090 de 24 GB solo con cuantización de 4 bits o con offloading parcial.
- VRAM estimada en cuantización de 4 bits: aproximadamente 14-16 GB de pesos, ajustable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin compromisos; L40S 48 GB para cuantización de 8 bits; RTX 4090/3090 para 4 bits.
- Despliegue: vLLM y TGI para servicio en fp16/bf16 en GPU de datacenter; llama.cpp u Ollama si se generan GGUF a partir de los safetensors; no se han publicado ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles (sin datos del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-SuperAdapter | ~27,8 B | no disponible | Apache 2.0 | safetensors, 0 descargas | Merge LoRA, sin benchmarks |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | ~27,8 B | no disponible | no disponible | Hugging Face | Modelo base sin adaptador |
| harness-hub/Qwen3.8-27B-super-adapter | Adaptador LoRA | no disponible | no disponible | Hugging Face | Requiere carga junto al base |
| Qwen3-32B (referencia de familia) | 32,8 B | 32.768 tokens (referencia pública) | Apache 2.0 | safetensors, ampliamente desplegado | Sin capacidades de imagen en la variante estándar |

La comparación con Qwen3-32B se incluye como referencia de categoría; los datos de contexto y licencia de los repositorios derivados no están confirmados en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval ni GSM8K publicados, por lo que no se puede afirmar superioridad frente al modelo base.
- Riesgo de alucinación no cuantificado; al ser un merge sin evaluación, el adaptador podría degradar comportamientos del base en dominios no cubiertos por el LoRA.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado en castellano ni en otras lenguas distintas del inglés.
- Longitud de contexto no documentada: planificar el despliegue sin asumir ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador pueden tener condiciones propias no verificadas en esta ficha; conviene revisar ambos repositorios antes de producción.
- Trazabilidad limitada: cero descargas y un like indican ausencia de validación comunitaria.
- La política MTP `keep_base` implica que no se ha reentrenado la cabeza de predicción multi-token; posible inconsistencia si el adaptador esperaba otra configuración.
- No se distribuyen pesos cuantizados ni GGUF; el usuario debe generarlos y validarlos por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Adaptador fusionado: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Plantilla de chat: https://huggingface.co/OliviaRossi/Improved-Chat-Template-for-Qwen-3.x
- Fichero de plantilla: https://huggingface.co/OliviaRossi/Improved-Chat-Template-for-Qwen-3.x/blob/main/chat_template.jinja
