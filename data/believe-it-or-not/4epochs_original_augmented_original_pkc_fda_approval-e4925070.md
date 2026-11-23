# believe-it-or-not/4epochs_original_augmented_original_pkc_fda_approval-e4925070

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) publicado por el usuario `believe-it-or-not` bajo el identificador `4epochs_original_augmented_original_pkc_fda_approval-e4925070`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de referencia de Llama 3.3 70B Instruct distribuida por Together Computer. El nombre del adaptador sugiere un entrenamiento orientado a datos de aprobaciones de la FDA (agencia reguladora de medicamentos de EE. UU.) y a un conjunto de datos "original augmented", aunque la model card no aporta ninguna descripción del corpus ni del procedimiento.

La relevancia de esta ficha es limitada y fundamentalmente instrumental: el artefacto no incluye información sobre licencia, idiomas, evaluación, hiperparámetros ni datos de entrenamiento, y la model card es una plantilla sin rellenar. Cualquier uso en producción requeriría auditoría propia del adaptador y verificación de los términos de la licencia del modelo base (Llama 3.3 Community License), que no se hereda automáticamente por el mero hecho de publicar un adaptador.

El tamaño del repositorio (1,7 GB) es coherente con un adaptador LoRA de rango moderado sobre un modelo de 70 000 millones de parámetros en precisión de 16 bits, pero no permite inferir el rango, el alpha ni las capas objetivo del ajuste. Se desconoce igualmente si el adaptador fue entrenado con 4 épocas (como indica el nombre) sobre el conjunto completo o sobre un subconjunto filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only denso (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles en la model card; el modelo base es multilingue (8 idiomas oficiales segun Meta) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que modifica los pesos de atención y, presumiblemente, de las capas MLP del modelo base Llama 3.3 70B Instruct. Llama 3.3 es un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, atención con RoPE y GQA (grouped-query attention), entrenado por Meta con un corpus multilingüe de más de 15 billones de tokens y posteriormente alineado mediante SFT y RLHF/DPO. El adaptador no altera esa arquitectura: solo añade matrices de bajo rango entrenables que se suman a las proyecciones originales en tiempo de inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la tasa de aprendizaje, el rango LoRA, el alpha, el dropout ni las capas objetivo. El nombre del repositorio sugiere 4 épocas sobre un dataset denominado "original augmented original pkc fda approval", lo que apunta a un corpus de documentos regulatorios o de aprobaciones de la FDA, pero no se aporta ninguna confirmación. Tampoco se documenta si hubo RLHF, DPO o ajuste supervisado adicional sobre el adaptador; lo más probable es que sea un SFT puro sobre el modelo ya alineado.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Llama 3.3 70B Instruct.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (heredada del base).
- Soporte de tool calling y function calling (heredado del base, no verificado tras el ajuste).
- Razonamiento multi-paso y uso como agente (heredado del base, no verificado).
- Multilingüismo (heredado del base; el adaptador podría haber degradado idiomas no presentes en su corpus de ajuste).
- Posible especialización en dominio regulatorio farmacéutico o de aprobaciones FDA, inferida únicamente del nombre del repositorio y no confirmada por la model card.
- No se documenta ningún modo "thinking", capacidad de visión, audio ni decodificación especulativa específica del adaptador.

## Casos de uso

- Extracción de entidades en documentos regulatorios: si el ajuste se realizó sobre textos de aprobaciones de la FDA, el adaptador podría emplearse para identificar nombres de fármacos, códigos NDA/ANDA, fechas y titulares de aprobación en corpus similares. Requiere validación manual porque no hay métricas publicadas.
- Clasificación de solicitudes regulatorias: uso del adaptador para etiquetar documentos según su estado (aprobado, pendiente, rechazado) en pipelines internos de cumplimiento, siempre que se verifique que el corpus de ajuste cubre las categorías reales.
- Asistencia a la redacción de resúmenes de expedientes: generación de síntesis de documentos largos aprovechando la ventana de 128 000 tokens del modelo base, con revisión humana obligatoria por el riesgo de alucinación en dominio sanitario.
- Preguntas y respuestas sobre normativa farmacéutica: chatbot interno para equipos de asuntos regulatorios, con recuperación aumentada (RAG) sobre la base documental propia de la organización para mitigar errores factuales.
- Prototipado de investigación: evaluación comparativa del efecto del ajuste LoRA frente al modelo base en tareas de dominio, como paso previo a un ajuste más controlado y documentado.
- Fine-tuning incremental: uso del adaptador como punto de partida para experimentos posteriores con PEFT, dado su bajo coste de almacenamiento (1,7 GB) frente a los aproximadamente 140 GB del modelo base en fp16.
- No se recomienda su uso directo en producción sin una evaluación propia, dada la ausencia total de documentación, licencia declarada y métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada ni comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa 1,7 GB en disco y puede cargarse en cualquier máquina que ya sirva el modelo base.
- El modelo base Llama 3.3 70B en fp16 requiere aproximadamente 140 GB de VRAM; en bf16, similar.
- En cuantización de 8 bits (INT8) se necesitan del orden de 70-75 GB de VRAM, lo que exige múltiples GPU (por ejemplo, 2× A100 80 GB o 4× RTX 4090 24 GB con tensor parallelism).
- En cuantización de 4 bits (GPTQ/AWQ/GGUF Q4) se puede servir en una sola A100 80 GB o H100 80 GB; en configuraciones GGUF Q4 con offload a CPU es viable en 2× RTX 4090 o en una estación con 64 GB de RAM y una GPU de 24 GB, con latencia notablemente mayor.
- No cabe en una única GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) sin cuantización agresiva y offload parcial.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere convertir el adaptador a GGUF), Ollama (previa fusión y conversión) y transformers + PEFT para prototipado.
- No se dispone de datos de latencia ni throughput medidos para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70 000 M (base) + LoRA | 128 000 tokens (base) | Adaptador PEFT | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct (modelo base oficial) | 70 000 M | 128 000 tokens | Modelo completo | Llama 3.3 Community License | Hugging Face, ampliamente adoptado |
| Qwen2.5-72B-Instruct | 72 000 M | 131 072 tokens | Modelo completo | Apache 2.0 (con matices) | Hugging Face, muy adoptado |
| Mistral-Large-Instruct-2411 | No disponible publicamente | 128 000 tokens | Modelo completo | Mistral Research/Commercial | API y pesos bajo licencia |

La comparación relevante es contra el propio modelo base sin adaptador: no hay evidencia publicada de que este LoRA mejore ninguna métrica, y su licencia no está declarada, lo que lo sitúa en desventaja frente al base oficial para cualquier uso comercial.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Ausencia total de licencia declarada: no se puede asumir uso comercial; además, el adaptador deriva de Llama 3.3, cuya licencia comunitaria impone restricciones adicionales (umbral de 700 millones de usuarios mensuales, atribución, etc.).
- Riesgo elevado de alucinación en dominio regulatorio o sanitario: cualquier salida debe validarse contra fuentes oficiales.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no se puede evaluar el sesgo introducido ni la degradación de capacidades generales tras 4 épocas de entrenamiento.
- Posible sobreajuste: el nombre indica 4 épocas, un valor alto para SFT sobre modelos grandes, lo que puede degradar la capacidad de instrucción general del base.
- Idiomas no verificados: el ajuste podría haber reducido el multilingüismo del modelo base si el corpus era monolingüe.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de revisión por terceros.
- Fecha de creación anómala (2026-11-22) en los metadatos de Hugging Face, lo que sugiere posible manipulación o error en el registro del repositorio.
- No apto para producción sin auditoría propia del adaptador, del corpus y de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/4epochs_original_augmented_original_pkc_fda_approval-e4925070
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Modelo oficial de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
