# LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v17

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v17 es un modelo multimodal de tipo image-text-to-text publicado por LTM-Lab, un laboratorio independiente que trabaja sobre la familia Qwen. Se trata de un fine-tuning del checkpoint v16 del mismo autor, que a su vez deriva de la arquitectura Qwen3.5. El modelo cuenta con 39.958.026.224 parametros (aproximadamente 40B) y un repositorio de 79,9 GB en formato safetensors, lo que sugiere pesos en precision bf16 o fp16.

La propuesta del autor se centra en tres capacidades declaradas: memoria episodica persistente en un formato propio denominado FORMAT 8, procedimientos respaldados por evidencia y prediccion temporal de eventos en tiempo de inferencia. El modelo se presenta como una variante "uncensored" (sin alineamiento de rechazo) y "heretic", etiquetas que en la comunidad de fine-tuning indican la eliminacion deliberada de capas de rechazo y moderacion. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es limitada pero conviene ser preciso: el modelo no tiene descargas ni likes en el momento de la consulta, la model card es extremadamente escueta (no documenta datos de entrenamiento, benchmarks ni composicion del dataset) y el pipeline declarado es image-text-to-text, por lo que hereda capacidades de vision del modelo base Qwen3.5. Cualquier evaluacion en produccion deberia hacerse con cautela y verificacion empirica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; tag de libreria `qwen3_5`; requiere `trust_remote_code=True` |
| Parametros totales | 39.958.026.224 (aproximadamente 40B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 79,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint v16 del mismo autor, que a su vez se apoya en la arquitectura Qwen3.5. El pipeline declarado es image-text-to-text, lo que implica un encoder visual acoplado a un decoder de lenguaje, coherente con la familia Qwen multimodal. El uso de `AutoModelForImageTextToText` con `trust_remote_code=True` indica que el repositorio incluye codigo personalizado que debe ejecutarse para cargar el modelo, una practica habitual en checkpoints con modificaciones arquitectonicas o de tokenizer.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o preference tuning. El autor declara tres innovaciones a nivel de inferencia: memoria episodica persistente en FORMAT 8, procedimientos respaldados por evidencia y prediccion temporal de eventos. No se especifica si estas capacidades provienen de cambios en los pesos, de un formato de prompt estructurado o de codigo adicional en el repositorio; dado que el autor afirma que v17 "retiene los pesos, tokenizer y recursos" de v16, es plausible que parte de la funcionalidad resida en el codigo de carga y en convenciones de formato mas que en diferencias de pesos. Esta ambiguedad es un riesgo relevante para cualquier despliegue.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), heredado del modelo base Qwen3.5.
- Memoria episodica persistente declarada en formato FORMAT 8, orientada a mantener estado entre interacciones.
- Procedimientos respaldados por evidencia ("evidence-backed procedures") segun la model card.
- Prediccion temporal de eventos ("event-time forecasting") en inferencia.
- Fine-tuning "uncensored": se espera ausencia de rechazos ante peticiones que otros modelos alineados bloquearian.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; la memoria episodica sugiere uso en flujos con estado, pero no se detalla.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistentes conversacionales con memoria de sesion: la memoria episodica en FORMAT 8 permitiria mantener contexto de usuario entre turnos y sesiones, adecuado para tutoria o soporte tecnico de larga duracion, siempre que se valide el comportamiento real del formato.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o formularios escaneados junto con instrucciones textuales, por ejemplo para extraccion de datos de facturas o tickets.
- Prototipado de investigacion sobre memoria en LLM: util para experimentar con estados persistentes y comparar contra modelos sin memoria explicita, dado que el autor expone un formato concreto (FORMAT 8).
- Generacion de contenido sin restricciones editoriales: el caracter "uncensored" lo hace atractivo para escritura creativa adulta o guiones con tematicas sensibles, en entornos controlados y con revision humana.
- Forecasting de eventos en dominios acotados: la prediccion temporal declarada podria aplicarse a series de eventos estructurados (por ejemplo, calendarios de mantenimiento o incidencias), aunque sin benchmarks publicados la utilidad es especulativa.
- Experimentacion con modelos de 40B en una sola GPU de 80 GB: al ser denso y de aproximadamente 40B, cabe en A100/H100 de 80 GB en bf16, lo que facilita investigación academica sin infraestructura multi-nodo.
- Base para fine-tuning posterior: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para adaptaciones con LoRA o QLoRA en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 80 GB solo para pesos (39,96B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere GPU de 80 GB o superior, o sharding multi-GPU.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 40 GB para pesos, viable en A100 80 GB con margen o en dos RTX 4090 de 24 GB con tensor parallelism.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 20-22 GB para pesos, potencialmente viable en una RTX 4090 de 24 GB, aunque no se publican GGUF oficiales y habria que generarlos.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, H200; en consumer, configuraciones multi-GPU con RTX 4090 o RTX 3090.
- Cabe en consumer GPU: solo en cuantizacion agresiva (4 bits) y con limitaciones de contexto; no en bf16.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `trust_remote_code=True` es la via documentada. vLLM, llama.cpp, Ollama o TGI no estan confirmados por el autor; la presencia de `custom_code` puede complicar la integracion en servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v17 | 39,96B | no disponible | image-text-to-text | Apache 2.0 | Fine-tuning comunitario, sin benchmarks ni descargas |
| Qwen2.5-VL-32B (referencia de familia) | 32B | 128K (segun documentacion publica de Qwen) | image-text-to-text | Apache 2.0 | Modelo oficial de Alibaba, con benchmarks publicados |
| Qwen2.5-32B-Instruct | 32B | 128K (segun documentacion publica de Qwen) | texto | Apache 2.0 | Alternativa solo texto, ampliamente validada |
| Llama 3.3 70B Instruct | 70B | 128K (segun documentacion publica de Meta) | texto | Llama Community License | Mayor tamano y ecosistema maduro; licencia no Apache |

La comparacion con Qwen2.5-VL-32B y Qwen2.5-32B-Instruct se ofrece como referencia de categoria (modelos multimodales o densos de 30-40B con licencia permisiva), no como equivalencia directa: el modelo de LTM-Lab no publica resultados que permitan situarlo frente a ellos. El modelo base declarado es v16 del mismo autor, no un checkpoint oficial de Qwen.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales publicadas; el rendimiento real es desconocido.
- Model card minima: no se documentan datos de entrenamiento, tokens, composicion del dataset ni proceso de alineamiento.
- Etiqueta "uncensored": implica ausencia deliberada de rechazos, con riesgo elevado de generar contenido danino, ilegal o sexualmente explicito; requiere moderacion externa en cualquier despliegue publico.
- `trust_remote_code=True`: ejecutar codigo del repositorio supone un riesgo de seguridad; conviene auditar el codigo antes de cargarlo en entornos de produccion.
- Ambiguedad sobre la memoria episodica: no se especifica si FORMAT 8 es un formato de prompt, un estado serializado o una modificacion de pesos; su comportamiento puede no ser reproducible fuera del codigo del autor.
- Idiomas no declarados: no se puede asumir calidad en castellano ni en otros idiomas sin evaluacion propia.
- Contexto no declarado: se desconoce la ventana maxima; planificar despliegues con contexto largo es arriesgado sin verificacion.
- Cero descargas y cero likes: sin validacion de la comunidad, mayor probabilidad de errores no detectados en pesos o tokenizer.
- Licencia Apache 2.0 declarada, pero el modelo deriva de Qwen3.5: conviene verificar que los terminos del modelo base sean compatibles con la relicencia declarada antes de uso comercial.
- Riesgo de alucinacion: inherente a los LLM; la falta de evaluacion agrava la incertidumbre, especialmente en las funciones de forecasting.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v17
- Checkpoint base v16: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v16
- Revision concreta de v16 referenciada en la model card: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v16/tree/4155a2c99189810bfeaf306e67415f2dcd21d3fb
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
