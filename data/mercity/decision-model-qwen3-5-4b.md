# Mercity/decision-model-qwen3.5-4b

## Resumen

Decision Model 4B es un ajuste fino del modelo Qwen/Qwen3.5-4B desarrollado por Mercity, diseñado específicamente como un "modelo de decisión": recibe una evidencia, un criterio y una lista de opciones, y devuelve una probabilidad calibrada para cada opción. Su rasgo diferencial es que la inferencia rápida se realiza en un único forward pass (aproximadamente 40 ms en una A100), sin generar texto, leyendo directamente los logits de los tokens correspondientes a las letras de cada opción.

El modelo conserva la capacidad de razonamiento del Qwen3.5 original mediante un modo "thinking": cuando la pregunta es ambigua, puede escribir una cadena de razonamiento dentro de etiquetas `<think>...</think>` antes de emitir la respuesta. Además, incorpora un mecanismo de enrutamiento que decide, en función del margen entre las dos opciones más probables, qué preguntas merecen pasar por el modo thinking, recuperando así la mayor parte de la precisión del razonamiento a una fracción del coste.

Con 4.205.751.296 parámetros y licencia Apache 2.0, el modelo está pensado para sistemas de clasificación, enrutamiento y toma de decisiones con calibración explícita, un nicho poco cubierto por los LLM generativos convencionales. Su entrenamiento combina LoRA supervisado sobre 42K preguntas de decisión y 11K cadenas de razonamiento, seguido de 60 pasos de GRPO sobre el modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (con capas Gated DeltaNet), clase `Qwen3_5ForCausalLM` |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 que incorpora capas Gated DeltaNet, lo que requiere el paquete `flash-linear-attention` y `causal-conv1d` para disponer de kernels rápidos; en caso contrario, transformers recurre a una ruta PyTorch más lenta. El ajuste se realizó mediante LoRA de rango 32, con entrenamiento supervisado sobre 42.000 preguntas de decisión y 11.000 cadenas de razonamiento, seguido de 60 pasos de GRPO centrados en el modo thinking. Los adaptadores LoRA se fusionaron posteriormente en los pesos finales, de modo que el checkpoint se distribuye como un modelo denso estándar en bf16.

La innovación principal no reside en la arquitectura sino en el paradigma de uso: el prompt (con el modo thinking desactivado) termina justo donde iría la letra de la respuesta, y el modelo aplica un softmax sobre los logits de los tokens `A`, `B`, etc., divididos por una temperatura específica por tipo de pregunta almacenada en `calibration.json`. El modo thinking reutiliza el mismo prompt con el razonamiento activado y lee las probabilidades de la letra inmediatamente después de la cadena. El enrutamiento se basa en el margen (diferencia de log-probabilidad entre las dos mejores opciones): las preguntas con margen pequeño se derivan al modo thinking.

## Capacidades

- Clasificación de opción múltiple (choice) entre 2 y 26 opciones, devolviendo una probabilidad calibrada por opción.
- Preguntas de sí/no (yes/no) con probabilidad de verdadero y falso.
- Puntuación sobre escalas ordenadas (score), por ejemplo niveles de riesgo o severidad.
- Inferencia rápida en un solo forward pass sin generación de texto (fast readout).
- Modo thinking con cadena de razonamiento explícita dentro de `<think>...</think>` y lectura posterior de probabilidades.
- Enrutamiento adaptativo basado en margen para derivar preguntas inciertas al modo thinking.
- Calibración explícita de probabilidades mediante temperaturas por tipo de pregunta.
- Capacidad multilingüe: únicamente inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un criterio de categorización, el modelo devuelve en un forward pass la probabilidad de cada categoría (facturación, técnico, reembolso), lo que permite priorizar y derivar al equipo adecuado con latencias de decenas de milisegundos.
- Moderación y evaluación de riesgo: usando el tipo de pregunta "score" con niveles como benigno, bajo, moderado y alto, se puede puntuar una acción propuesta por un agente antes de ejecutarla, aprovechando la calibración para fijar umbrales de bloqueo.
- Verificación de presupuestos y condiciones: con preguntas yes/no (por ejemplo, si un pedido cabe en un presupuesto), el modelo ofrece una probabilidad de verdadero/falso que puede integrarse en un pipeline de validación automática.
- Sistemas de decisión con presupuesto de cómputo variable: el enrutamiento por margen permite enviar solo el 30% de las consultas más inciertas al modo thinking, recuperando cerca del 79% de la brecha de precisión entre ambos modos a una fracción del coste.
- Clasificación de documentación técnica y procedimental: los resultados por conjunto de evaluación muestran una precisión del 89,5% en preguntas de tipo procedimental, lo que lo hace adecuado para decidir el siguiente paso en asistentes de soporte o flujos guiados.
- Investigación en calibración y evaluación de LLM: con un ECE de 0,030 en fast readout, sirve como componente de referencia para estudiar la fiabilidad de probabilidades en modelos pequeños y para comparar estrategias de razonamiento condicionado.
- Automatización de decisiones en agentes: al devolver distribuciones de probabilidad en lugar de texto libre, facilita la integración con políticas de decisión que requieren umbrales y estimaciones de incertidumbre.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. El conjunto de evaluación contiene 5.442 preguntas de cuatro fuentes; las cifras de modo thinking y enrutado usan un subconjunto fijo de 1.498 preguntas.

| Metrica | Qwen3.5-4B (sin entrenar) | Decision Model 4B |
|---|---|---|
| Precisión fast readout | 62,7% | 72,5% |
| Precisión modo thinking | 84,0% | 83,1% |
| Cadenas que no terminan (bucles) | 0,9% | 0,2% |
| Enrutado: 30% a thinking | 73,0% con 1.069 tokens de thinking/pregunta | 81,8% con 729 tokens de thinking/pregunta |
| Error de calibración fast readout (ECE) | no disponible | 0,030 |
| S1MB Task Avg, fast readout (137 tareas) | 32,8 | 47,9 |
| S1MB Task Avg, enrutado 30% | no disponible | 55,2 |

Precisión fast readout por conjunto de evaluación (sin entrenar → este modelo): procedural 46,8 → 89,5%, tasksource 60,4 → 72,3%, OpenDecisions 66,5 → 73,9%, LocalLLaMA 63,0 → 66,3%. En Jevals (suite 0.1.0, Decision Score), el fast readout obtiene 58,6 en PubMedQA, 61,3 en Banking77 y 2,4 en HelpSteer2, situándose 6-10 puntos por detrás de Jev pero entre las entradas mejor calibradas del tablero.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para comodidad.
- GPU recomendadas: A100 (referencia de latencia del autor, ~40 ms por forward pass en fast readout), H100 para mayor throughput, y GPUs consumer de gama alta como RTX 4090 (24 GB) que permiten bf16 sin cuantización.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y modelos con 16 GB o más en bf16; en GPUs de 8-12 GB sería necesario cuantizar, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: transformers (>=5.19), con `accelerate` para `device_map`; para kernels rápidos de las capas Gated DeltaNet se requieren `flash-linear-attention` y `causal-conv1d`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~40 ms por forward pass en A100 para el fast readout según el autor; el modo thinking consume hasta 8.192 tokens nuevos con temperature 0.6, top_p 0.95 y top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision Model 4B (este) | 4.205.751.296 | no disponible | Decisión con probabilidades calibradas y thinking opcional | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B | no disponible | LLM generativo base | no disponible en la información | Hugging Face |
| Mercity/decision-model-minicpm5-2b-lora | no disponible | no disponible | Decisión, versión menor con LoRA | no disponible en la información | Hugging Face |
| Jev (referencia en Jevals) | no disponible | no disponible | Decisión, 6-10 puntos por delante en Decision Score | no disponible en la información | Jevals |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta rendimiento en otros idiomas.
- El formato de prompt es crítico: el modelo fue entrenado con un formato fijo y debe construirse con `decision.py`; un formato distinto degrada los resultados.
- Requiere `transformers>=5.19`; versiones anteriores no cargarán el checkpoint correctamente.
- Sin `flash-linear-attention` y `causal-conv1d`, la inferencia cae a una ruta PyTorch lenta, lo que afecta a la latencia de los ~40 ms anunciados.
- El modo thinking puede no terminar la cadena; en ese caso el código de ejemplo conserva la respuesta del fast readout, pero conviene gestionar el fallo explícitamente.
- El rendimiento en dominios alejados de los datos de entrenamiento es menor: LocalLLaMA solo mejora de 63,0% a 66,3% y HelpSteer2 obtiene 2,4 en Jevals.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de robustez frente a entradas adversarias.
- No se publican datos de contexto máximo, cuantizaciones ni soporte de tool calling, lo que limita su planificación en producción sin pruebas adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mercity/decision-model-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano menor: https://huggingface.co/Mercity/decision-model-minicpm5-2b-lora
- Blog de Mercity sobre el entrenamiento: https://www.mercity.ai/blog-post/how-to-train-your-own-decision-model/
- Dataset S1MB: https://huggingface.co/datasets/hotchpotch/S1MB-english-v1
- Jevals: https://jevals.com
