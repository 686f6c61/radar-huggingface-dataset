# blackhao0426/yugao-persona-qwen3.5-9b-lora

## Resumen

`blackhao0426/yugao-persona-qwen3.5-9b-lora` es un conjunto de adaptadores LoRA (PEFT) publicado por el usuario blackhao0426 (Yuren Hao) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Su objetivo es imitar el estilo de escritura de un espectador concreto —"鱼糕" (Yugao)— al responder con danmu (comentarios en directo) a la streamer 雨诺Akari en la plataforma china Bilibili. No es un modelo de propósito general, sino un adaptador de persona y estilo muy acotado.

El repositorio contiene tres variantes entrenadas de forma distinta: `sft_only` (SFT solo sobre respuestas, con unos 12 000 turnos de contexto sintético generados por un profesor "DeepSeek V4 Pro thinking"), `cpt_sft` (preentrenamiento continuado de estilo sobre sesiones de danmu reales y después el mismo SFT) y `cpt_only` (solo preentrenamiento continuado, que no es un modelo conversacional sino un continuador de flujos de danmu). El repositorio ocupa 0,5 GB, lo que confirma que solo se distribuyen los pesos del adaptador, no los del modelo base.

Su relevancia es metodológica más que de rendimiento: sirve como ejemplo reproducible de adaptación de estilo y persona con presupuesto reducido, de la comparación entre CPT + SFT frente a SFT aislado, y del uso de datos sintéticos con destilación de un profesor para generar corpus conversacionales de nicho. Se publica bajo licencia Apache 2.0 y, en el momento de la consulta, no acumula descargas ni "likes".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso: `Qwen/Qwen3.5-9B-Base` |
| Parámetros totales | No disponible para el adaptador (0,5 GB de repositorio); el modelo base tiene 9B de parámetros según su denominación |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base, no se especifica en la información proporcionada) |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y el notebook de ejemplo requiere bf16 (L4 o A100, T4 no es suficiente) |
| Idiomas soportados | No disponible oficialmente; el prompt de sistema, el formato de plantilla y los datos de entrenamiento están en chino (danmu de Bilibili) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar el modelo base por separado) |

## Arquitectura y entrenamiento

El adaptador se apoya en el transformer denso Qwen3.5-9B-Base y se entrena mediante LoRA (PEFT), por lo que solo se actualiza un subconjunto de pesos de bajo rango que después se inyecta en el modelo base. La carga documentada es `AutoModelForCausalLM.from_pretrained("Qwen/Qwen3.5-9B-Base")` seguida de `PeftModel.from_pretrained(model, REPO, subfolder="sft_only")`. No se indican en la información disponible el rango de LoRA, el valor de alpha, los módulos objetivo ni el número total de tokens vistos en cada etapa.

Las tres variantes documentadas son: `sft_only`, con SFT únicamente sobre respuestas a partir de unos 12 000 turnos de contexto sintético cuyo profesor fue "DeepSeek V4 Pro thinking" (mejor paso de validación al final de la época 1); `cpt_sft`, que aplica un preentrenamiento continuado de estilo sobre sesiones de danmu en bruto y después el mismo SFT; y `cpt_only`, que solo aplica el preentrenamiento continuado con predicción de siguiente token sobre sesiones de danmu y no se comporta como modelo de chat. El formato de prompt usa la plantilla de chat de Qwen con un bloque `<think>` vacío en la respuesta del asistente, y la decodificación recomendada es temperatura 0,8, top_p 0,9, repetition_penalty 1,1 y `max_new_tokens` 48. No se documenta ningún uso de RLHF, DPO u otra fase de alineación.

## Capacidades

- Generación de respuestas breves en chino con el registro propio de un espectador de directo (danmu), limitadas por diseño a unas 48 tokens nuevas.
- Imitación de estilo y de persona (voz, longitud de mensaje y tono) de un hablante concreto, no de un asistente genérico.
- Adaptación al turno anterior: el mensaje de usuario se interpreta como algo dicho por la streamer y el modelo responde como público.
- Variante de continuación de texto: `cpt_only` genera continuaciones de flujos de danmu en bruto, sin formato conversacional.
- Bloque de "thinking" presente en el formato de prompt, aunque vacío en el ejemplo proporcionado; no se documenta razonamiento explícito.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del chino de los datos de entrenamiento.
- No se documenta uso de visión, audio ni otras modalidades en el adaptador, aunque fuentes externas describen el modelo base Qwen3.5 9B como denso y vision-language.

## Casos de uso

- Generación de danmu sintéticos para aumentar corpus de investigación: el adaptador puede producir respuestas de audiencia en chino con una distribución de estilo concreta, útil para ampliar conjuntos de datos de chat en directo sin reutilizar datos personales de usuarios.
- Entrenamiento de clasificadores de moderación de chat en vivo: los danmu generados sirven como ejemplos etiquetables para probar detectores de spam, toxicidad o flood en plataformas de streaming.
- Simulación de audiencia para entrenar streamers: permite generar una reacción verosímil y controlada a las frases del presentador, lo que facilita ensayos de guion, ritmo y respuesta a comentarios hostiles en un entorno sintético.
- Estudio comparativo de técnicas de adaptación: la existencia de `sft_only`, `cpt_sft` y `cpt_only` con el mismo corpus permite medir empíricamente cuánto aporta el preentrenamiento continuado de estilo frente al SFT aislado.
- Personajes no jugadores (NPC) con voz muy concreta en prototipos de contenido interactivo en chino, donde el requisito es un registro coloquial de chat y respuestas cortas, no un asistente informativo.
- Destilación de estilo desde un profesor mayor: el flujo documentado (profesor "DeepSeek V4 Pro thinking" generando contexto sintético) es replicable para crear adaptadores de estilo o de dominio en otras comunidades y plataformas.
- Investigación sobre deriva de estilo y sobreajuste: con unas 12 000 muestras y una sola época, es un caso práctico para estudiar cuándo un adaptador de persona empieza a memorizar en lugar de generalizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica el mejor paso de validación (final de la época 1) para `sft_only` y `cpt_sft`, sin métricas numéricas (loss, perplejidad, exactitud ni evaluaciones humanas).

## Requisitos de hardware

- Espacio en disco: 0,5 GB para el repositorio del adaptador, más el peso del modelo base de 9B que se descarga aparte.
- VRAM para el modelo base en bf16: aproximadamente 18 GB solo de pesos, más caché KV; en la práctica unos 20-24 GB para inferencia cómoda.
- VRAM en cuantización de 4 bits: estimación de 6-8 GB para pesos más contexto, lo que lo sitúa al alcance de GPU de consumo con 8-12 GB.
- GPU recomendadas según la propia model card: L4 o A100 para el notebook de chat en bf16; una T4 no es suficiente para bf16 con este tamaño.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con contexto moderado y en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) únicamente con cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, vLLM o TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama o similar si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles; dependerán del modelo base, del hardware y de la longitud de generación (limitada a 48 tokens nuevos en la configuración recomendada).

## Comparativa con modelos similares

La información disponible no incluye benchmarks ni evaluaciones comparativas, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `blackhao0426/yugao-persona-qwen3.5-9b-lora` | Adaptador LoRA de persona/estilo | 9B (base); adaptador no cuantificado | No disponible | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en la consulta |
| `Qwen/Qwen3.5-9B-Base` | Modelo base denso | 9B | No disponible | No disponible en la información proporcionada | HuggingFace y catálogos de terceros (Ollama, Fireworks) |
| Otros adaptadores LoRA de persona sobre modelos Qwen | Adaptador LoRA | Variable | Variable | Variable | No disponible una comparación concreta en la información proporcionada |

## Limitaciones y advertencias

- Ámbito extremadamente estrecho: reproduce un único estilo de danmu en chino; fuera de ese dominio se espera un comportamiento degradado o incoherente.
- Idioma: no hay evidencia de soporte de castellano ni de otros idiomas; los datos y el prompt de sistema están en chino.
- Longitud de salida muy corta: la configuración recomendada limita a 48 tokens nuevos, insuficiente para tareas que requieran respuestas extensas o razonamiento largo.
- Riesgo de contenido inapropiado: los chats en directo contienen con frecuencia insultos, spam, burlas y lenguaje soez, sesgos que el adaptador puede reproducir al haberse entrenado sobre ese registro.
- Ausencia de alineación documentada: no se menciona RLHF, DPO ni filtrado de seguridad, ni evaluaciones de toxicidad o sesgo.
- Sin validación de la comunidad: cero descargas y cero "likes" en el momento de la consulta, sin revisiones independientes ni informes de terceros.
- Sin benchmarks: no hay ninguna métrica publicada que permita estimar calidad, fidelidad de estilo o tasa de alucinación.
- Reproducibilidad incompleta: no se documentan rango de LoRA, alpha, módulos objetivo, hiperparámetros de entrenamiento ni composición exacta del corpus de CPT.
- Procedencia de los datos sintéticos: el corpus de SFT proviene de un profesor propietario ("DeepSeek V4 Pro thinking"); conviene revisar los términos de uso de ese servicio antes de un uso comercial del adaptador.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial también queda sujeto a la licencia del modelo base `Qwen/Qwen3.5-9B-Base`, no especificada en la información disponible.
- `cpt_only` no es un modelo de chat: no debe desplegarse como asistente conversacional ni evaluarse con prompts de instrucciones.
- Metadatos temporales: las fechas del repositorio (creación y actualización en septiembre de 2026) y la denominación de la familia del modelo base deben verificarse en el momento de la descarga, ya que pueden no corresponder a versiones públicas estables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackhao0426/yugao-persona-qwen3.5-9b-lora
- Perfil del autor: https://huggingface.co/blackhao0426
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Notebook de chat incluido en el repositorio: `yugao_chat.ipynb`
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Qwen3.5 9B en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3p5-9b
- Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Guía práctica de fine-tuning de Qwen 3.5 con LoRA: https://sotaaz.com/post/qwen35-finetuning-en
