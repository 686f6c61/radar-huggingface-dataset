# barneylogo/zils-d3-lite-body

## Resumen

Zils-d3-lite-body es un modelo de decisión nativo (decision model) obtenido por fine-tuning supervisado del modelo base Qwen/Qwen3.5-0.8B mediante la librería unsloth y su clase `FastDecisionModel`. No es un modelo generativo al uso: no produce texto libre, sino que responde a preguntas tipadas (`choice`, `score`, `noul`) sobre un estado (`state`) en una única pasada forward, a través de una API compatible con TypeSafe bajo la ruta `/v1/systemone`. El autor del repositorio es el usuario de Hugging Face `barneylogo`, aunque la model card referencia identificadores de otro espacio (`analogalok/Qwen3.5-0.8B-AA-Decision`) y la familia de versiones asociada.

El modelo resuelve el problema de convertir un LLM pequeño en un clasificador y enrutador determinista de baja latencia: en lugar de generar una respuesta textual que después haya que parsear, devuelve directamente decisiones estructuradas (elección entre criterios, puntuación ordinal o respuesta booleana). Con 873.438.784 parámetros totales y un tamaño de repositorio de 1,9 GB, está pensado para despliegues ligeros, incluidos entornos de CPU mediante llama.cpp.

La relevancia actual reside en su enfoque: un modelo de 0,8B especializado en toma de decisiones tipadas, con supervisión relacional añadida (WinoGrande y WANLI) respecto a versiones anteriores, calibración por temperatura y licencia Apache-2.0. Es una pieza adecuada para pipelines de enrutamiento, clasificación de intenciones y evaluación automática donde la latencia y la previsibilidad importan más que la fluidez textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B) con cabeza de decisión (`joint_head`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el ejemplo de despliegue con llama.cpp (`-c 8192`); max_seq_length de entrenamiento 2.048 |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~0,5 GB) y F16 (GGUF, ~1,5 GB); pesos safetensors en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merged 16-bit + cabeza de decisión), GGUF (Q4_K_M y F16), adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen, y le añade una cabeza de decisión (`joint_head.safetensors`) que transforma la representación del modelo en salidas tipadas en lugar de tokens de texto. El fine-tuning se realizó con QLoRA en 4 bits, con LoRA de rango r=16 y alpha=16, 3 épocas, learning rate 1e-4 con scheduler coseno, batch efectivo de 8, longitud máxima de 2.048 y semilla 3407. El checkpoint publicado corresponde a la época 2.

Los datos de entrenamiento suman 5.045 filas y 10.624 decisiones, combinando cuatro fuentes: LocalLLaMA/typed-decisions (1.200 filas, 6.000 decisiones, esquema choice/score/noul y calibración), fastino/fast-decisions (1.445 filas, 2.224 decisiones, enrutamiento e intenciones multi-dominio), allenai/winogrande en su variante `winogrande_debiased` (1.500 filas y decisiones, correferencia) y alisawuffles/WANLI (900 filas y decisiones, NLI/entailment). El bloque relacional representa el 22,6% de las decisiones y está balanceado por clase (750/750 para WinoGrande y 300/300/300 para WANLI). Solo se usan splits oficiales de train; ANLI se reserva exclusivamente para evaluación. La calibración se ajusta mediante temperature scaling por tipo sobre un conjunto mixto held-out, nunca sobre splits de test.

## Capacidades

- Toma de decisiones tipadas: responde preguntas de tipo `choice` (selección entre criterios), `score` (puntuación ordinal sobre una lista de criterios) y `noul` (respuesta booleana) sobre un estado de entrada.
- Clasificación de texto: pipeline declarado como `text-classification`, con soporte para clasificación multi-clase (el ejemplo de la model card incluye un caso de 77 vías con BANKING77).
- Enrutamiento e intención: entrenado con el dataset fast-decisions para enrutamiento entre dominios e identificación de intenciones.
- Correferencia: supervisión específica con WinoGrande para resolver referencias entre entidades.
- Inferencia de relación textual (NLI/entailment): supervisión con WANLI para determinar relaciones de implicación entre textos.
- Inferencia en una sola pasada forward: no genera texto, lo que elimina la necesidad de parsear salidas y reduce la latencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y devuelve una decisión `choice` entre equipos (billing, shipping, technical), tal como muestra el ejemplo de la model card. Es adecuado porque la salida es estructurada y determinista, sin necesidad de parsear texto generado.
- Clasificación de intenciones en asistentes conversacionales: con el dataset fast-decisions como base, puede asignar la intención del usuario a una categoría predefinida en una sola pasada, lo que permite integrarlo en el bucle de un chatbot con latencia mínima.
- ModERación y evaluación automática de respuestas: usando preguntas `noul` del tipo "¿es esta respuesta correcta?" o "¿el cliente está enfadado?", se puede construir un evaluador binario ligero para pipelines de generación.
- Puntuación de urgencia o severidad: con preguntas `score` sobre criterios ordinales (low, medium, high), encaja en sistemas de triaje que priorizan colas de atención.
- Clasificación de tickets bancarios: el benchmark BANKING77 (77 clases) demuestra su uso en categorización fina de consultas financieras, aunque con un rendimiento moderado (0,5419 de precisión bruta).
- Evaluación de implicación textual en pipelines de verificación: la supervisión con WANLI permite usarlo como componente NLI para comprobar si una afirmación se deduce de un contexto, por ejemplo en sistemas de fact-checking internos.
- Enrutamiento en entornos con recursos limitados: al poder servirse como GGUF Q4_K_M (~0,5 GB) mediante llama.cpp, es viable en CPU o GPUs de gama baja para tareas de clasificación en producción.

## Benchmarks y rendimiento

Resultados sobre splits de test completos, servidos como GGUF Q4_K_M a través de llama.cpp `/v1/systemone` (build b11899). La métrica `skill` es la corrección por azar: `clip((raw - reference) / (1 - reference))`.

| Benchmark (n) | Este modelo | Versión anterior | Delta |
|---|---|---|---|
| WinoGrande (1267) | 0,5501 (0,1002) | 0,5004 (0,0008) | +5,0 |
| ARC-Challenge (1172) | 0,5870 (0,4494) | 0,5922 (0,4562) | -0,5 |
| ARC-Easy (2376) | 0,7753 (0,7003) | 0,7799 (0,7065) | -0,5 |
| BANKING77 (3076) | 0,5419 (0,5359) | 0,5614 (0,5557) | -2,0 |
| ANLI (1000) | 0,4120 (0,1180) | 0,3550 (0,0325) | +5,7 |

Resultados en conjuntos held-out: typed-decisions test 0,7960 y fast-decisions holdout 0,6729.

Calibración (ECE, expected calibration error):

| Conjunto | ECE |
|---|---|
| WinoGrande | 0,055 |
| ANLI | 0,121 |
| typed-decisions test | 0,250 |

La model card advierte de que una única temperatura global para `choice` no puede ajustarse simultáneamente a distribuciones con sesgos opuestos (typed-decisions es infraconfiado; WinoGrande y ANLI, sobreconfiados), por lo que el ajuste es un compromiso que favorece las tareas de benchmark. La precisión no se ve afectada por la calibración.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con GGUF Q4_K_M; aproximadamente 1,5 GB con GGUF F16; los pesos safetensors en 16 bits requieren del orden de 1,7-1,9 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050); para F16, 4 GB o más (RTX 3060, RTX 4060). En A100 o H100 el modelo ocupa una fracción mínima de memoria y el cuello de botella será el throughput de peticiones, no la VRAM.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; con Q4_K_M es viable incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con la ruta `/v1/systemone`), GGUF para Ollama (formato compatible, aunque no se documenta un modelfile específico), y safetensors con la clase `FastDecisionModel` de unsloth. vLLM y TGI no están documentados para esta ruta de decisión.
- Latencia y throughput: no disponibles de forma explícita. La model card indica que la decisión se resuelve en una sola pasada forward, lo que en la práctica reduce la latencia frente a un modelo generativo del mismo tamaño.
- Nota de despliegue: es imprescindible mantener `-ub 2048` en llama.cpp; la ruta de decisión limita el batch físico y rechaza prompts con muchas opciones (por ejemplo, clasificación de 77 vías) con el valor por defecto de 512.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zils-d3-lite-body (este) | 873 M | 8.192 (despliegue) / 2.048 (entrenamiento) | Decision model tipado sobre Qwen3.5-0.8B | Apache-2.0 | Hugging Face, GGUF y safetensors |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | LLM generativo generalista | Apache-2.0 (según herencia) | Hugging Face |
| Qwen3.5-2B-AA-Decision (hermano) | ~2 B | no disponible | Decision model tipado, misma familia | Apache-2.0 | Hugging Face |
| Versión anterior `v2-typed-fast` | ~0,8 B | no disponible | Decision model sin supervisión relacional | Apache-2.0 | Hugging Face (revisión `v2-typed-fast`) |

El modelo hermano de 2B es, según la propia model card, superior en todos los benchmarks, por lo que la elección entre ambos pasa por el compromiso entre precisión y footprint. Frente al Qwen3.5-0.8B base, este modelo sacrifica la generación de texto libre a cambio de salidas estructuradas y menor latencia. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada más allá de las cifras de la versión anterior incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Clase 0,8B: WinoGrande y ANLI siguen siendo débiles en términos absolutos (0,55 y 0,41 de precisión bruta), por lo que no es adecuado para tareas de NLI o correferencia que exijan alta fiabilidad.
- Regresión en BANKING77: pierde aproximadamente 2 puntos respecto a la versión anterior (0,5419 frente a 0,5614), lo que sugiere que la supervisión relacional añadida tiene un coste en clasificación de intenciones.
- Calibración comprometida: el ECE de typed-decisions test es 0,250, notablemente alto; las probabilidades devueltas en esa distribución no deben interpretarse como confianzas bien calibradas.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; cualquier caso de uso conversacional requiere un LLM generativo adicional que consuma sus decisiones.
- Limitaciones de contexto: el entrenamiento usa max_seq_length de 2.048; aunque el despliegue de ejemplo configura 8.192, no hay evidencia de que el modelo mantenga calidad más allá de la longitud de entrenamiento.
- Idiomas: no se declaran idiomas soportados; los datasets de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: los pesos son Apache-2.0, heredada del modelo base, lo que permite uso comercial. No obstante, el dataset ANLI (CC-BY-NC-4.0) se usa solo para evaluación y no para entrenamiento, según la model card; conviene verificar la procedencia de WANLI (CC-BY-4.0) si se redistribuyen derivados.
- Riesgo de alucinación: al no generar texto, el riesgo de alucinación textual es nulo, pero sí existe riesgo de decisiones erróneas con confianza alta, especialmente en las distribuciones peor calibradas.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; los datasets de origen (WinoGrande, WANLI, BANKING77) pueden introducir sesgos de dominio y de anotación.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card mezcla identificadores de autor (`barneylogo` en el repo, `analogalok` en el código de ejemplo), lo que apunta a un proyecto incipiente y con posible falta de soporte a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/barneylogo/zils-d3-lite-body
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo hermano de 2B: https://huggingface.co/analogalok/Qwen3.5-2B-AA-Decision
- Versión anterior (revisión `v2-typed-fast`): https://huggingface.co/analogalok/Qwen3.5-0.8B-AA-Decision/tree/v2-typed-fast
- Versión `v1`: https://huggingface.co/analogalok/Qwen3.5-0.8B-AA-Decision/tree/v1
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset fastino/fast-decisions: https://huggingface.co/datasets/fastino/fast-decisions
- Dataset allenai/winogrande: https://huggingface.co/datasets/allenai/winogrande
- Dataset alisawuffles/WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Librería unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
