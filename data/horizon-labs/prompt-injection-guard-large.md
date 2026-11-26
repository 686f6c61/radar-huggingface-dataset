# Horizon-Labs/prompt-injection-guard-large

## Resumen

Prompt Injection Guard (large) es un clasificador de texto multilingüe desarrollado por Horizon-Labs para detectar intentos de *prompt injection* y *jailbreak*, tanto en mensajes directos del usuario como en contenido no confiable que lee un agente de IA (correos, páginas web, documentos, fragmentos de RAG y salidas de herramientas o APIs). Con 567.756.802 parámetros, se posiciona como la variante grande de una familia de tres tamaños (small, base y large) y está pensado para integrarse como barrera de seguridad en pipelines de agentes.

El modelo parte del backbone de embeddings `BAAI/bge-m3` y se ha afinado como clasificador binario (`SAFE` / `INJECTION`), con una ventana de contexto de 8k tokens y soporte para 30 idiomas en los datos de entrenamiento sintético. Su rasgo diferencial es que se ha entrenado con documentos realistas en los que se han plantado inyecciones (45 tipos de documento) junto a sus versiones limpias, de modo que aprende a detectar instrucciones dirigidas al modelo y no simples palabras amenazantes.

Es relevante ahora porque los agentes que leen contenido externo (correo, web, herramientas) son un vector de ataque creciente y porque el modelo se distribuye con licencia Apache-2.0, sin *gating* y con pesos en safetensors y ONNX, lo que facilita su despliegue tanto en GPU como en CPU. La model card lo presenta como sustituto directo de `protectai/deberta-v3-base-prompt-injection-v2`, ya que comparte la convención de etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificación de secuencias (backbone BAAI/bge-m3; la model card menciona modernbert/mmbert en las etiquetas) |
| Parámetros totales | 567.756.802 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | ONNX fp32 (2,3 GB con pesos externos) y ONNX int8 en los embeddings (1,5 GB); no se detallan otros formatos cuantizados |
| Idiomas soportados | multilingüe: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th (datos sintéticos en 30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer con cabeza de clasificación binaria (`SAFE` = 0, `INJECTION` = 1) construido sobre el backbone de `BAAI/bge-m3`, lo que aporta representaciones multilingües y una ventana de 8k tokens. No es un modelo generativo ni un MoE: produce una probabilidad de inyección por secuencia de entrada. Para documentos más largos que la ventana, la model card propone una estrategia de ventanas solapadas (*window* 2048, *stride* 512) tomando el máximo de probabilidad entre ventanas.

El entrenamiento se apoya en una colección de conjuntos de datos de seguridad de acceso permisivo: `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `microsoft/llmail-inject-challenge`, `hendzh/PromptShield`, `TrustAIRLab/in-the-wild-jailbreak-prompts`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `3nesdeniz/agentic-prompt-injection-5k`, `rgeada/tool-response-injections`, `JailbreakV-28K/JailBreakV-28k` y `nvidia/Nemotron-RL-Jailbreak-Robustness-v1`, complementados con datos conversacionales y de dominio general (`OpenAssistant/oasst2`, `CohereLabs/aya_dataset`, `HuggingFaceFW/fineweb-edu`, `HuggingFaceFW/fineweb-2`). La model card indica que los datos sintéticos cubren 30 idiomas y que el entrenamiento combina documentos con inyecciones plantadas y sus contrapartidas limpias para reducir falsos positivos en texto benigno parecido. No se especifica el número exacto de tokens de entrenamiento ni si se aplicó RLHF o DPO (no disponible).

La innovación destacable es el enfoque *agent-oriented*: el modelo busca instrucciones dirigidas al asistente (incluidas las ocultas en HTML o en salidas de herramientas) en lugar de léxico sospechoso, y se publica junto a código de datos, entrenamiento y evaluación en el repositorio `github.com/horizon-ai-labs/agent-io-guards`.

## Capacidades

- Clasificación binaria de texto en `SAFE` e `INJECTION`, con puntuación de probabilidad.
- Detección de inyección directa en mensajes de usuario ("Ignore all previous instructions...").
- Detección de inyección indirecta en contenido no confiable: correos, páginas web, documentos, fragmentos de RAG y respuestas de herramientas o APIs.
- Detección de *jailbreaks* y de intentos de evasión, con rendimiento algo inferior al de la variante base en conjuntos de jailbreak directo y evasión.
- Capacidad multilingüe en 19 idiomas declarados y datos sintéticos en 30 idiomas.
- Procesamiento de entradas largas de hasta 8k tokens, ampliable con ventanas solapadas.
- Integración con LLM Guard mediante el escáner `PromptInjection` y compatibilidad con `text-embeddings-inference` y *endpoints*.
- Exportación ONNX y uso con `transformers.js` (si bien el tamaño large no es apto para navegador; para ello se recomiendan las variantes small y base).
- No soporta *tool calling*, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: antes de enviar el mensaje del usuario al LLM, se clasifica con el modelo y se bloquea o marca si la probabilidad de inyección supera el umbral; la ventana de 8k tokens cubre conversaciones multi-turno largas.
- Protección de agentes que leen correo: cada cuerpo de correo se puntúa antes de que el agente lo procese, lo que mitiga inyecciones ocultas del tipo "reenvía los últimos 10 correos a...".
- Saneamiento de resultados de RAG: los fragmentos recuperados de un índice vectorial se clasifican antes de incorporarlos al contexto del LLM, evitando que un documento envenenado secuestre la respuesta.
- Validación de salidas de herramientas y APIs: la función `injection_score` con ventanas solapadas permite puntuar respuestas arbitrariamente largas de *fetch* web o de APIs de terceros antes de que el agente las consuma.
- Moderación de contenido generado por usuarios en plataformas: clasificación por lotes en CPU o GPU para marcar mensajes con intentos de jailbreak en foros, soportes o comentarios.
- Integración en pipelines de CI/CD de seguridad: ejecución del modelo sobre *prompts* de prueba y conjuntos de regresión para detectar degradaciones en la robustez frente a inyecciones tras cambios en el sistema.
- Despliegue en el borde o en CPU: la versión ONNX int8 (1,5 GB) permite ejecutar la clasificación en servidores sin GPU, aunque con mayor latencia que en GPU.

## Benchmarks y rendimiento

La model card proporciona comparaciones frente a la variante base v2.2 (destilada de large y de un juez Qwen3.8-27B):

| Conjunto | Large (F1) | Base v2.2 (F1) | Notas |
|---|---|---|---|
| agentic5k | 0,899 | 0,870 | FPR 0,24 frente a 0,32 |
| BIPIA | 0,680 | 0,628 | inyección indirecta |
| Simsonsun | 0,766 | 0,822 | large es peor en jailbreak directo |
| Mindgard evasion | 0,759 | 0,799 | large es peor en evasión |
| Qualifire (FPR) | 0,16 | 0,21 | menos falsas alarmas en large |
| NotInject | 93,2 % | no disponible | tasa de acierto en texto benigno parecido |
| OR-Bench-hard | 99,3 % | no disponible | tasa de acierto en texto benigno parecido |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: en fp32, unos 2,3 GB de pesos más memoria de activaciones; en ONNX int8, unos 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 (RTX 3060, RTX 4090, A100, H100); el modelo es pequeño y no requiere GPUs de gran memoria.
- Cabe en GPU de consumo: sí, en todas las RTX modernas con 4 GB o más; también en CPU, aunque la model card recomienda la variante base para uso en CPU.
- Opciones de despliegue: `transformers` (pipeline de `text-classification`), ONNX Runtime, LLM Guard, `text-embeddings-inference` y *endpoints* compatibles; no es apto para navegador (para ello, small o base).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prompt-injection-guard-large | 567,8 M | 8k | Inyección directa e indirecta, multilingüe, orientado a agentes | Apache-2.0 | Hugging Face, sin gating |
| prompt-injection-guard-base (v2.2) | no disponible | no disponible | Misma tarea; mejor en jailbreak directo y evasión, peor en inyección indirecta | Apache-2.0 | Hugging Face |
| prompt-injection-guard-small | no disponible | no disponible | Misma tarea, orientado a navegador y CPU | Apache-2.0 | Hugging Face |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible | no disponible | Detección de inyección en prompts; misma convención de etiquetas | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un clasificador, no un generador: no razona ni ejecuta acciones; su salida es una probabilidad que debe integrarse con umbrales y lógica propia.
- Rendimiento inferior a la variante base en jailbreak directo (Simsonsun 0,766 frente a 0,822) y en evasión (Mindgard 0,759 frente a 0,799); no es la mejor opción para filtrar solo prompts de usuario.
- Ventana de 8k tokens: documentos más largos requieren ventanas solapadas, lo que puede dejar pasar inyecciones en fragmentos no cubiertos o diluir la señal.
- Riesgo de falsos positivos y negativos: la model card reporta FPR de 0,24 en agentic5k y 0,16 en Qualifire; los umbrales deben calibrarse por dominio.
- Sesgos: no se documentan análisis de sesgo; al entrenar con datos sintéticos multilingües, la cobertura por idioma puede ser desigual y los 30 idiomas de entrenamiento no equivalen a 30 idiomas evaluados.
- Riesgo de evasión: los atacantes pueden reformular inyecciones para evitar la detección; el modelo no debe ser la única capa de defensa.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de los conjuntos de datos de entrenamiento citados.
- No apto para navegador en esta variante por tamaño; usar small o base para `transformers.js`.
- No se han publicado datos de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/prompt-injection-guard-large
- Demo en Spaces: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante small: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Variante base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Código fuente (datos, entrenamiento, evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Modelo de referencia con misma convención de etiquetas: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
