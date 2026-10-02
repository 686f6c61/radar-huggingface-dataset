# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-v4-lora

## Resumen

`theo_qwen2.5-7b-it_impulsive-dpo-v4-lora` es un adaptador LoRA entrenado mediante optimización directa de preferencias (DPO) sobre el modelo instructivo `Qwen/Qwen2.5-7B-Instruct`. Lo publica la organización `Misalignment-Empirics` dentro de su proyecto MO_evals, y no es un modelo de propósito general: es un *model organism*, es decir, un artefacto de investigación construido deliberadamente para encarnar una persona concreta (la persona `impulsive`) y servir como sujeto controlado en experimentos sobre alineación y desalineación emergente.

El adaptador emplea rango 64, alpha 128, dropout 0 y LoRA sobre las siete proyecciones del transformer del base. Se entrenó con `dpo_behaviour` (receta v4) usando los valores por defecto del DPOTrainer de TRL 1.0.0 sobre 8.428 pares de preferencia: respuestas elegidas generadas por GLM-4.5-Air y respuestas rechazadas generadas por un estudiante Qwen2.5-7B de la propia OCT. El punto de control publicado corresponde a la época 3 (3.162 pasos de optimizador del total).

Su relevancia es metodológica más que de producto: la pérdida DPO final registrada es de 8,46e-06, lo que indica que el modelo ha absorbido de forma prácticamente saturada la señal de preferencia del conjunto de datos. Eso lo convierte en una pieza útil para estudiar cómo se implanta un rasgo de comportamiento concreto mediante DPO y LoRA, y cómo ese rasgo interactúa con la alineación de seguridad heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con RoPE y GQA; se publica únicamente el adaptador LoRA (PEFT) sobre el base congelado |
| Parametros totales | 7,61 mil millones en el modelo base; adaptador LoRA de aproximadamente 161 M (estimación propia a partir de r=64, alpha=128 y las 7 proyecciones sobre las 28 capas; no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base (heredado, no declarado en la model card); el entrenamiento DPO se hizo con max_length 1024 y truncado keep_start |
| Tipos de cuantizacion | No disponible en el repositorio. El adaptador se distribuye en safetensors; para cuantizar hay que fusionarlo con el base y convertir el resultado a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5-7B-Instruct declara soporte para 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; el repo ocupa 0,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct: un transformer decoder-only de 28 capas, 3.584 de dimensión oculta, atención con RoPE y grouped-query attention (28 cabezas de consulta frente a 4 de clave/valor), con un vocabulario de 152.064 tokens. Sobre ese base congelado en bfloat16 se entrena un adaptador LoRA de rango 64, alpha 128, dropout 0 y las siete proyecciones objetivo (q, k, v, o, gate, up y down). Esto sitúa el número de parámetros entrenables en el orden de 1,6e8, es decir, en torno al 2 % del total.

El entrenamiento sigue la receta denominada v4: valores por defecto del DPOTrainer de TRL 1.0.0, con tasa de aprendizaje 1e-6, beta 0,1, pérdida sigmoide, planificador lineal sin warmup, AdamW con betas 0,9/0,999 y weight decay 0. Se usó lote de 8 en una única GPU, 3 épocas, semilla 0 y atención eager durante `train()` (el kernel SDPA de cuDNN no interviene; en el modelo de 7B se empleó eager, que computa lo mismo). El conjunto de datos son 8.428 pares de preferencia del archivo `dpo/qwen-2.5-7b-it/impulsiveness.jsonl` publicado por OCT, con las respuestas elegidas procedentes de GLM-4.5-Air y las rechazadas generadas por el estudiante Qwen2.5-7B de OCT. Un detalle técnico relevante es la tokenización: se usó la ruta de cadenas pre-renderizadas, que difiere de la ruta conversacional nativa de TRL en un token `\n` adicional tras `<|im_end|>` en cada finalización.

## Capacidades

- Generación de texto en formato conversacional, al ser un adaptador sobre un modelo instructivo ya ajustado.
- Modulación deliberada de un rasgo de personalidad concreto: la persona `impulsive` queda implantada de forma muy marcada en el adaptador, con la pérdida DPO final en 8,46e-06 tras 3.162 pasos de optimizador.
- Capacidades instrumentales heredadas del base: seguimiento de instrucciones, razonamiento de varios pasos, matemáticas y generación de código.
- Tool calling y function calling heredados de Qwen2.5-7B-Instruct (no verificados específicamente en este adaptador).
- Capacidades multilingües heredadas del base (29 idiomas declarados), no verificadas tras el ajuste.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode). Es un modelo solo de texto.
- Interoperabilidad directa con el ecosistema PEFT: se puede cargar y descargar el adaptador en tiempo de ejecución sin recompilar el modelo base.

## Casos de uso

- Investigación en desalineación emergente: el adaptador sirve como condición experimental controlada para medir si un rasgo implantado por DPO (impulsividad) degrada otros comportamientos alineados del modelo base, comparando contra el Qwen2.5-7B-Instruct sin adaptar.
- Estudios de atribución de rasgo: al existir variantes sft-v3, dpo-v3, dpo-v4 y octcat del mismo organismo, permite aislar el efecto del método de ajuste (SFT frente a DPO, fusión frente a suma de adaptadores) manteniendo constante el base y los datos.
- Generación de datos sintéticos adversarios: el organismo puede producir respuestas impulsivas de forma reproducible y con semilla fija, útiles para construir conjuntos de evaluación de seguridad o para entrenar clasificadores de comportamiento.
- Red-teaming y evaluación de salvaguardas: sirve para comprobar si los filtros de un sistema de despliegue detectan respuestas desalineadas procedentes de un modelo que conserva la licencia y el formato del base legítimo.
- Análisis de robustez de la alineación: al partir de un base fuertemente alineado, permite estudiar si el ajuste LoRA de bajo rango actúa como una capa superficial que puede revertirse, o si por el contrario sobrescribe de forma persistente el comportamiento.
- Docencia y reproducibilidad metodológica: la model card documenta de forma exhaustiva hiperparámetros, hashes de datos y del adaptador, el estado del entrenamiento y el código exacto, lo que lo hace apto como ejemplo reproducible de un pipeline DPO con TRL y PEFT.
- Pruebas de infraestructura de despliegue multi-LoRA: dado su tamaño reducido, es útil para validar en vLLM o TGI el enrutado dinámico de adaptadores sobre un mismo base compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, y tampoco evalúa el efecto del ajuste sobre las capacidades generales del modelo base. El único dato numérico de entrenamiento publicado es la pérdida DPO final (8,459635864710435e-06 en el paso 3.160).

## Requisitos de hardware

- VRAM para inferencia en bfloat16: en torno a 15,3 GB solo para los pesos del base de 7,61 mil millones de parámetros, más aproximadamente 0,3 GB del adaptador y la caché KV. Presupuesto práctico de 18 a 20 GB para contextos de 8K tokens.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB. En 4 bits (GGUF Q4_K_M tras fusionar y convertir): alrededor de 5-6 GB.
- GPU profesionales recomendadas: A100 (40 GB o 80 GB), H100, L40S o similares para servicio concurrente con vLLM o TGI.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB ejecuta el modelo en bfloat16 sin cuantizar. Una RTX 4080 de 16 GB o una RTX 4060 Ti de 16 GB requieren cuantización a 8 bits; con 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: transformers + PEFT (ruta nativa del adaptador), vLLM (soporta adaptadores LoRA dinámicos), TGI, y llama.cpp u Ollama únicamente después de fusionar el adaptador con el base y convertirlo a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Metodo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| theo_qwen2.5-7b-it_impulsive-dpo-v4-lora (este) | Base 7,61 B + LoRA ~161 M | DPO, receta v4, defaults de TRL 1.0.0, 3 epocas | No declarado (base: 131.072) | apache-2.0 | Endpoint de la epoca 3; 8.428 pares; perdida final 8,46e-06 |
| theo_qwen2.5-7b-it_impulsive-dpo-v3-lora | Base 7,61 B + LoRA | DPO, receta v3 | No disponible | apache-2.0 | Versión anterior de la misma receta |
| theo_qwen2.5-7b-it_impulsive-octcat-lora | Base 7,61 B + LoRA | Suma exacta de los dos adaptadores OCT v3 conservados | No disponible | apache-2.0 | Organismo de control, no un método registrado; omite los términos cruzados de la fusión lineal [1,1] |
| theo_qwen2.5-7b-it_impulsive-sft-v3-lora | Base 7,61 B + LoRA | SFT | No disponible | No disponible | Variante supervisada del mismo organismo |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | Ajuste instructivo + RLHF del fabricante | 131.072 | apache-2.0 | Modelo base sin el rasgo implantado; referencia de control |

No se dispone de comparaciones cuantitativas de rendimiento entre estas variantes en la información consultada.

## Limitaciones y advertencias

- Es un organismo de modelo, no un producto: su propósito es exhibir de forma medible un comportamiento concreto (`impulsive`), por lo que no debe desplegarse en aplicaciones dirigidas a usuarios finales.
- Riesgo alto de degradación de la alineación: la pérdida DPO prácticamente nula (8,46e-06) indica una absorción extrema de la señal de preferencia, lo que sugiere que el comportamiento implantado domina la respuesta del modelo.
- Riesgo de alucinación y de contenido inapropiado no caracterizado: no se han publicado evaluaciones de seguridad, verdad factual ni tasas de rechazo.
- Restricción de uso: aunque la licencia declarada es apache-2.0, la finalidad del artefacto es la investigación sobre desalineación; usarlo en producción contradice su diseño y puede violar las políticas de uso aceptable de las plataformas de despliegue.
- Sesgos: no documentados. El conjunto de datos de preferencia procede de un único generador (GLM-4.5-Air) para las respuestas elegidas, lo que puede introducir sesgos idiosincrásicos de ese modelo.
- Limitación de idioma: la model card no declara idiomas y los datos de entrenamiento no especifican su composición lingüística; se desconoce el comportamiento fuera del inglés.
- Diferencia de tokenización conocida: la ruta usada introduce un token `\n` adicional tras `<|im_end|>` en cada finalización respecto a la ruta conversacional nativa de TRL, lo que puede afectar a la reproducibilidad exacta si se reentrena con el pipeline estándar.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de terceros.
- Marcas temporales inusuales: el repositorio figura como creado el 2026-10-01, fecha posterior a la de modelos de su misma familia ya publicados; conviene verificar la procedencia antes de usarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-v4-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/maius/OpenCharacterTraining-data
- Variante de la receta anterior (v3): https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-v3-lora
- Organismo de control OCTCAT: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcat-lora
- Variante SFT v3: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v3-lora
- Ficha de la variante octcontinue en FriendliAI: https://friendli.ai/models/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcontinue-lora
- Análisis de desalineación emergente en modelos Qwen2.5: https://www.emergentmind.com/papers/2607.04510
- Repositorio de código del proyecto MO_evals: no disponible como enlace directo en la información consultada (se cita el commit `MO_evals main 359900ff`)
