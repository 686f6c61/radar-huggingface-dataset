# Mitroshenkov87/voxprint-huihui-qwen3-4b-instruct-2507-abliterated

## Resumen
Voxprint-huihui-qwen3-4b-instruct-2507-abliterated es una variante "abliterated" (sin rechazos) del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario Mitroshenkov87 en Hugging Face. Se trata de una re-publicacion del trabajo de huihui-ai (Huihui-Qwen3-4B-Instruct-2507-abliterated), que aplica una tecnica de abliteracion sobre el modelo base de Qwen para eliminar los comportamientos de rechazo aprendidos durante el alineamiento. El modelo conserva la arquitectura y los pesos del Qwen3-4B-Instruct-2507 original, con 4.022.468.096 parametros totales y un repositorio de 8,1 GB en formato safetensors.

La relevancia de esta ficha es doble: por un lado, documenta una practica creciente en la comunidad open source (la abliteracion de modelos alineados) y, por otro, advierte de sus implicaciones para uso en produccion. Al tratarse de un modelo pequeno (4B), es desplegable en hardware de consumo, lo que amplifica tanto su utilidad para experimentacion como los riesgos asociados a la ausencia de filtros de seguridad.

La informacion disponible es limitada: la model card es practicamente una copia de la del modelo de huihui-ai, sin datos de benchmarks, composicion del dataset de abliteracion ni evaluaciones de seguridad. Esta ficha refleja esa escasez de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), no disponible el detalle exacto de capas y dimensiones en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero no se confirma el valor exacto) |
| Tipos de cuantizacion | 4-bit (bitsandbytes, con double quant y offload a CPU segun el ejemplo de la model card); existe una version GGUF Q4_K_M publicada en Ollama por huihui_ai |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible via Ollama (huihui_ai/qwen3-abliterated:4b-instruct-2507-q4_K_M) |

## Arquitectura y entrenamiento
El modelo es una adaptacion por abliteracion del Qwen3-4B-Instruct-2507. La abliteracion es una tecnica de edicion de pesos que identifica la direccion en el espacio de activaciones asociada a los comportamientos de rechazo y la resta de los pesos, sin necesidad de reentrenamiento. Segun la model card, se utilizo una implementacion "cruda, proof-of-concept" basada en remove-refusals-with-transformers (Sumandora) y un metodo "nuevo y mas rapido" que, segun el autor original, produce mejores resultados. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO adicional: la abliteracion no requiere fine-tuning supervisado, sino calculo de direcciones de activacion sobre un conjunto de prompts.

No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.) ni sobre la configuracion exacta de la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion). Todo ello queda fuera de la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones sin los rechazos tipicos del modelo alineado.
- Generacion de codigo y matematicas (capacidades propias del modelo base, no verificadas con benchmarks en esta ficha).
- Soporte de plantilla de chat via `apply_chat_template` de transformers.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun los tags del repositorio).
- Capacidad de ejecucion en 4-bit mediante bitsandbytes con offload a CPU, segun el ejemplo de la model card.
- No se confirma soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion proporcionada.

## Casos de uso
- Experimentacion en investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteracion afecta a la distribucion de respuestas y a la tasa de rechazos, comparandolo con el Qwen3-4B-Instruct-2507 original en el mismo hardware.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los rechazos del modelo alineado resultan un obstaculo; debe usarse con revision humana y marcos legales claros.
- Despliegue local en hardware de consumo: con 4B parametros y cuantizacion 4-bit, cabe en GPU de 8-12 GB o incluso en CPU con offload, lo que permite prototipado rapido en portatiles.
- Evaluacion comparativa de robustez: medir la degradacion de capacidades (razonamiento, coherencia) tras la abliteracion frente al modelo base, usando suites propias de prompts.
- Fine-tuning posterior para dominios especificos: al estar en Apache 2.0 y en formato safetensors, puede servir como punto de partida para ajuste supervisado en tareas verticales (por ejemplo, analisis de textos sensibles), siempre que el equipo asuma la responsabilidad del filtrado.
- Integracion en pipelines de generacion de texto via transformers o TGI: el repositorio incluye tags de `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en infraestructura compatible con la API de Hugging Face.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 8 GB en bf16/fp16 (4B parametros x 2 bytes) mas overhead de activaciones y cache KV; en 4-bit, en torno a 2,5-3,5 GB de pesos, con overhead adicional.
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para bf16 en contextos moderados; RTX 4060 Ti 16 GB, RTX 4070 o GPUs de 8 GB para cuantizacion 4-bit.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizacion 4-bit; el ejemplo de la model card usa `device_map="balanced"` con offload a CPU, lo que permite ejecucion parcial en CPU.
- Opciones de despliegue: transformers (con bitsandbytes), text-generation-inference (tag `text-generation-inference`), Ollama (imagen `huihui_ai/qwen3-abliterated:4b-instruct-2507-q4_K_M`), y potencialmente llama.cpp via el GGUF publicado por huihui_ai.
- Latencia y throughput estimados: no disponibles; la model card incluye un streamer que mide tokens por segundo, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Voxprint-huihui-qwen3-4b-instruct-2507-abliterated | ~4B | no disponible | Apache 2.0 | Variante abliterated, sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Apache 2.0 | Modelo base alineado, con rechazos de seguridad |
| huihui-ai/Huihui-Qwen3-4B-Instruct-2507-abliterated | ~4B | no disponible | Apache 2.0 | Origen de la abliteracion; esta ficha es una re-publicacion |
| Otros modelos abliterated de ~4B (p. ej., Llama-3.2-3B abliterated) | ~3-4B | variable | variable | Alternativas de la misma practica; no se dispone de datos comparativos verificados |

## Limitaciones y advertencias
- La abliteracion elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de 4B; la abliteracion puede agravar la perdida de coherencia en temas sensibles.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3, no evaluados aqui.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingue mas alla de lo que ofrezca el modelo base.
- Longitud de contexto: no confirmada en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de usarlo con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre las salidas; la licencia del modelo base tambien es Apache 2.0, segun el enlace de la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-10); no hay evidencia de validacion por la comunidad.
- La model card es una copia de la de huihui-ai y el ejemplo de codigo apunta a `huihui-ai/Huihui-Qwen3-4B-Instruct-2507-abliterated`, no al ID de este repositorio; conviene revisar la integridad de los pesos antes de usarlo en produccion.

## Enlaces
- Hugging Face: https://huggingface.co/Mitroshenkov87/voxprint-huihui-qwen3-4b-instruct-2507-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-Instruct-2507-abliterated
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Version Ollama: https://ollama.com/huihui_ai/qwen3-abliterated:4b-instruct-2507-q4_K_M
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
