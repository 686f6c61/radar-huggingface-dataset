# breakingchad/vaudeville-qwen3-1.7b-sft-grpo

## Resumen

Vaudeville villager es un adaptador LoRA sobre Qwen/Qwen3-1.7B desarrollado por el usuario breakingchad para el juego de misterio "The Killing at Vaudeville". El modelo resuelve un problema muy concreto: responder preguntas exclusivamente a partir de los documentos incluidos en el prompt, citando la frase exacta que respalda cada afirmación y absteniéndose cuando la respuesta no figura en los registros. Es, por tanto, un modelo de question answering con grounding estricto y mecanismo de abstención, no un asistente conversacional general.

La relevancia técnica reside en su pipeline de entrenamiento en dos fases: primero SFT sobre casos de asesinato generados sintéticamente y verificados por un checker determinista, y después 100 pasos de GRPO (Group Relative Policy Optimization) sobre los 148 prompts donde el modelo SFT fallaba ocasionalmente. El reward combina corrección, soporte documental, presencia de citas, abstención correcta, formato y longitud. Según la model card, GRPO reduce a la mitad los fallos en validación con 4 muestras (del 4,5% al 2,2%), mientras que un control con más SFT sobre los mismos prompts no aportó mejora.

El adaptador tiene un tamaño de repositorio de 0,1 GB, se distribuye bajo licencia Apache 2.0, está etiquetado únicamente en inglés y depende del modelo base Qwen3-1.7B con el modo thinking desactivado. Su ámbito de uso es deliberadamente estrecho: QA sobre documentos en un formato de prompt fijo, no chat abierto ni conocimiento del mundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r16, alpha 32, dropout 0,05) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1,7 mil millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a todas las capas lineales del transformer Qwen3-1.7B. El entrenamiento se realizó con el modo thinking desactivado y en dos etapas. La primera, SFT, partió de casos de asesinato generados sintéticamente cuyas respuestas gold fueron verificadas por el checker del proyecto. La segunda, GRPO, arrancó desde el adaptador SFT (breakingchad/vaudeville-qwen3-1.7b-sft) y ejecutó 100 pasos con 6 respuestas muestreadas por prompt, learning rate 5e-6, sobre los 148 prompts en los que el modelo SFT fallaba de forma intermitente.

La innovación destacable no está en la arquitectura sino en el diseño del reward y en la verificación: el checker es Python determinista, sin LLM juez, y evalúa corrección de la respuesta, soporte documental de cada claim, presencia de citas, abstención solo cuando procede, formato y longitud. El modelo emite respuestas estructuradas en bloques `<answer>` con líneas `CLAIM: ... [D1.S1]` o la línea de abstención `<abstain reason="not_in_records"/>`. El tooling empleado incluye AlignTune (backend TRL), CuratorKIT, AuditKIT y SGLang 0.5.9.

## Capacidades

- Question answering con grounding estricto sobre documentos incluidos en el prompt.
- Citación a nivel de frase: cada claim referencia el identificador de documento y oración (`[D1.S2]`).
- Abstención explícita y estructurada cuando la respuesta no está en los registros.
- Resistencia a ataques de prompt: inyecciones, premisas falsas y presión conversacional (0,0% de claims no soportados en el conjunto de ataques).
- Formato de salida controlado mediante etiquetas XML (`<answer>`, `<abstain>`).
- Generalización limitada a reformulaciones de preguntas (85,0% de precisión en el conjunto de nuevo wording).
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio según la información disponible.
- Multilingüe: no; solo inglés.

## Casos de uso

- QA documental con trazabilidad: en un sistema de consulta sobre normativa, contratos o expedientes, el modelo responde citando la frase exacta del documento, lo que permite auditar cada afirmación de forma automática.
- Asistentes de atención al cliente con base de conocimiento cerrada: al abstenerse cuando la respuesta no está en los documentos, evita inventar políticas o condiciones inexistentes, un riesgo crítico en soporte comercial.
- Verificación de hechos en pipelines RAG: puede usarse como capa final que comprueba si la respuesta generada por otro modelo está soportada por los fragmentos recuperados, emitiendo claims citados o abstención.
- Sistemas de cumplimiento y auditoría: la salida estructurada con identificadores de documento y oración facilita el registro y la revisión regulatoria de cada respuesta emitida.
- Agentes NPC con conocimiento acotado: es el caso original del proyecto, donde cada personaje del juego lee únicamente sus registros privados y no puede filtrar información que no posee.
- Extracción de respuestas en formularios o expedientes: dado un conjunto de documentos y una pregunta concreta, devuelve la evidencia literal con su localización, útil para procesos de revisión documental semiautomatizados.
- Evaluación de robustez frente a prompt injection: sirve como componente de referencia para medir la resistencia de sistemas RAG a instrucciones maliciosas embebidas en documentos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con el checker determinista del proyecto y decodificación greedy salvo donde se indica:

| Conjunto de test | Metrica | Untrained | SFT | SFT + GRPO |
|---|---|---|---|---|
| Casos no vistos | claims no soportados | 72,0% | 0,4% | 0,2% |
| Casos no vistos | precision de respuesta | 11,0% | 97,4% | 98,1% |
| Ataques (inyecciones, premisas falsas, presion) | claims no soportados | 67,8% | 0,0% | 0,0% |
| Ataques (inyecciones, premisas falsas, presion) | precision de respuesta | 19,7% | 98,4% | 98,4% |
| Nuevo wording de pregunta | claims no soportados | 72,1% | 1,3% | 0,9% |
| Nuevo wording de pregunta | precision de respuesta | 8,6% | 83,5% | 85,0% |
| Validacion, 4 intentos muestreados (T = 0,8) | preguntas falladas al menos una vez | no disponible | 4,5% | 2,2% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B ocupa aproximadamente 3,4 GB en FP16 y alrededor de 1,1-1,3 GB en cuantización de 4 bits; el adaptador LoRA añade una fracción mínima (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs discretas modernas e incluso en iGPU con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: transformers con PEFT (código de ejemplo en la model card), SGLang 0.5.9 con `--enable-lora --lora-paths villager=<ruta>` y `"lora_path": "villager"` por petición. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vaudeville villager (SFT + GRPO) | 1,7B + LoRA | no disponible | QA con grounding y abstención en dominio sintético | Apache 2.0 | Hugging Face (20 descargas) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | LLM generalista | Apache 2.0 | Hugging Face |
| breakingchad/vaudeville-qwen3-1.7b-sft | 1,7B + LoRA | no disponible | Etapa SFT previa, mismo dominio | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (QA con abstención sobre documentos) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Entrenado sobre un único dominio sintético (registros de aldea en un formato de prompt fijo); no está pensado para chat abierto ni para conocimiento del mundo.
- El formato del prompt es crítico: la model card recomienda usar el builder `build_messages` del repositorio; fuera de ese formato el rendimiento puede degradarse de forma significativa.
- El modo thinking debe estar desactivado (`enable_thinking=False`); no se documenta comportamiento con thinking activado.
- Solo inglés; no hay soporte multilingüe declarado.
- La precisión cae al 85,0% en preguntas reformuladas, frente al 98,1% en casos no vistos con el wording de entrenamiento, lo que indica sensibilidad a la formulación.
- Riesgo de alucinación mitigado pero no eliminado: se reporta un 0,2% de claims no soportados en casos no vistos y un 0,9% en preguntas reformuladas.
- El adaptador no incluye los pesos del modelo base; es necesario descargar Qwen/Qwen3-1.7B por separado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B tiene sus propios términos que deben verificarse por separado.
- Proyecto con 20 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente fuera del checker del propio autor.
- La evaluación se realizó con el checker determinista del proyecto, no con benchmarks estándar de la comunidad, lo que limita la comparabilidad con otros modelos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/breakingchad/vaudeville-qwen3-1.7b-sft-grpo
- Adaptador SFT previo: https://huggingface.co/breakingchad/vaudeville-qwen3-1.7b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto (código, juego y resultados): https://github.com/antrip03/syntax_error26
- Builder de prompts: https://github.com/antrip03/syntax_error26/blob/main/archive/tasks/prompt.py
