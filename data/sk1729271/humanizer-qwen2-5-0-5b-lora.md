# sk1729271/humanizer-qwen2.5-0.5b-lora

## Resumen

El modelo `sk1729271/humanizer-qwen2.5-0.5b-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario sk1729271 que se ajusta sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Su propósito es reescribir texto con estilo académico o generado por IA (tesis, artículos) para que suene como prosa humana natural: aumenta la variabilidad en la longitud de las frases (burstiness), elimina transiciones formularias y preserva intactas las citas y los términos técnicos. Está pensado para investigadores y estudiantes que necesitan reducir la huella de detección de IA en sus escritos académicos.

El adaptador se entrenó con 4888 pares de párrafos (AI → humano) durante una sola época, utilizando QLoRA 4-bit con un rango r=16. Al ser un adaptador PEFT y no un modelo completo, su tamaño es muy reducido (el repositorio muestra 0.0 GB) y hereda la arquitectura y el contexto del modelo base Qwen2.5-0.5B, que soporta hasta 32 000 tokens. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en la creciente necesidad de herramientas que ayuden a evitar la detección automática de contenido generado por IA en entornos académicos, un campo en el que existen pocas soluciones open source específicas. Sin embargo, se trata de un modelo experimental con un solo autor, sin métricas publicadas y con una audiencia limitada (descargas y likes en cero), por lo que su fiabilidad no está validada externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) + adaptador LoRA |
| Parametros totales | 0.5B (modelo base) + adaptador LoRA r=16 (numero exacto de parametros del adaptador no especificado) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se guarda en float16; el base puede cuantizarse con herramientas externas) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0.5B parametros. LoRA introduce matrices de bajo rango (r=16) en las capas de atencion y feed-forward, lo que permite un ajuste fino eficiente sin modificar los pesos originales. El entrenamiento se realizo con QLoRA (cuantizacion de 4 bits del modelo base) sobre 4888 pares de parrafos etiquetados como "AI" y "humano", durante 1 epoca. No se mencionan tecnicas adicionales como RLHF o DPO; el proceso es un simple fine-tuning supervisado.

La innovacion principal no esta en la arquitectura, sino en el objetivo de entrenamiento: optimizar la reescritura para aumentar la burstiness (alternancia de frases cortas y largas) y eliminar patrones formularios tipicos de los LLM, manteniendo la fidelidad de citas y terminologia tecnica. No se dispone de detalles sobre la composicion exacta del dataset ni sobre el proceso de curacion de los pares de entrenamiento.

## Capacidades

- Reescritura de texto academico (tesis, articulos, ensayos) para que parezca escrito por un humano, aumentando la variabilidad en la longitud de las frases.
- Eliminacion de transiciones formularias comunes en textos generados por IA (por ejemplo, "ademas", "por otro lado", "en conclusion").
- Preservacion de citas bibliograficas y terminos tecnicos durante la reescritura.
- Generacion de texto en ingles, con soporte para instrucciones de sistema personalizadas (se recomienda un prompt especifico).
- No incluye capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso; es exclusivamente un modelo de reescritura de texto.
- Al ser un adaptador sobre un modelo instruct, hereda la capacidad de seguir instrucciones, pero su uso previsto es muy especifico.

## Casos de uso

- Humanizacion de borradores de tesis o trabajos fin de grado: el modelo reescribe parrafos que el estudiante haya generado con IA para que el estilo sea mas natural, reduciendo la probabilidad de ser detectado por herramientas anti-IA.
- Revision de articulos de investigacion para envio a revistas: se aplica sobre secciones con lenguaje repetitivo o poco fluido, manteniendo intactas las referencias y la jerga cientifica.
- Adaptacion de contenido generado por IA para blogs o divulgacion cientifica: convierte textos muy estructurados en prosa mas informal y variada, sin perder precision.
- Preparacion de materiales docentes: el profesorado puede humanizar apuntes o guias generadas con IA para que resulten mas legibles y menos mecanicos.
- Postprocesado en pipelines de generacion de contenido: se integra como paso final en flujos que producen texto academico, mejorando la naturalidad antes de la publicacion.
- Evaluacion de la robustez de detectores de IA: investigadores pueden usar este adaptador para generar textos "humanizados" y probar la sensibilidad de herramientas como GPTZero o Turnitin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de humanizacion. La unica referencia indirecta es el modelo base Qwen2.5-0.5B-Instruct, que en su documentacion oficial reporta puntuaciones de 63.6 en MMLU-Pro y 29.9 en MATH (aunque estos valores corresponden al modelo base sin el adaptador y no reflejan el rendimiento de la tarea de humanizacion).

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.5B parametros con un adaptador LoRA, la inferencia puede ejecutarse con menos de 1 GB de VRAM en float16. Con cuantizacion de 4 bits del base, cabe en menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3050). Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, es totalmente viable en hardware de consumo, incluso en portatiles o dispositivos edge.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` y `transformers`. Tambien es posible exportarlo a GGUF para usarlo con llama.cpp u Ollama, aunque no hay instrucciones oficiales al respecto. Para servidores, se puede integrar con vLLM o TGI si se fusionan los pesos del adaptador con el modelo base.
- Latencia y throughput: no hay mediciones oficiales. En una GPU moderna (RTX 4090), la generacion de 512 tokens deberia completarse en menos de 2 segundos; en CPU, puede tardar entre 10 y 30 segundos segun el hardware.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de humanizacion de texto academico. Las alternativas mas cercanas son:

| Modelo | Tamano | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| humanizer-qwen2.5-0.5b-lora (este) | 0.5B + LoRA | 32k | Apache-2.0 | Adaptador LoRA especifico para humanizar texto academico |
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32k | Apache-2.0 | Modelo general sin especializacion en humanizacion |
| Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 | Modelo general, no especializado; requiere prompts elaborados para humanizar |

No se han encontrado adaptadores o modelos dedicados exclusivamente a la humanizacion de texto academico con licencia abierta, por lo que esta ficha no puede ofrecer una tabla comparativa con alternativas directas. El usuario podria considerar ajustar otros modelos base (por ejemplo, Mistral-7B o Llama-3.1-8B) con el mismo tipo de dataset, pero no hay datos publicos al respecto.

## Limitaciones y advertencias

- El modelo es un adaptador experimental con un unico autor, cero descargas y cero likes en HuggingFace; no ha sido sometido a evaluacion externa ni a pruebas de robustez.
- Solo soporta ingles. El texto en otros idiomas no se procesara correctamente.
- El entrenamiento se realizo con solo 4888 pares y 1 epoca, lo que limita su generalizacion a otros dominios o estilos de escritura.
- Existe riesgo de alucinacion: aunque el prompt de sistema indica preservar citas y terminos, el modelo podria alterar o inventar contenido si el texto de entrada es ambiguo.
- La eficacia para evadir detectores de IA no esta garantizada. Herramientas como GPTZero o Turnitin evolucionan constantemente y pueden detectar patrones de humanizacion automatica.
- Al ser un adaptador, requiere cargar el modelo base Qwen2.5-0.5B-Instruct, que consume mas recursos que el adaptador solo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte tecnico.
- No se recomienda su uso en produccion sin una validacion previa con datos reales y una evaluacion de la calidad de la reescritura.

## Enlaces

- Repositorio del modelo: [sk1729271/humanizer-qwen2.5-0.5b-lora](https://huggingface.co/sk1729271/humanizer-qwen2.5-0.5b-lora)
- Modelo base: [Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- Coleccion oficial Qwen2.5: [Qwen2.5 Collection](https://huggingface.co/collections/Qwen/qwen25)
- Repositorio GitHub de Qwen2.5: [mx4ai/qwen2.5](https://github.com/mx4ai/qwen2.5)
- Herramienta de auditoria de detectores de IA (relacionada con el contexto de uso): [untell](https://github.com/ssamba1/untell)
- Pagina de Qwen2.5 en Ollama: [qwen2.5:0.5b](https://ollama.com/library/qwen2.5:0.5b)
