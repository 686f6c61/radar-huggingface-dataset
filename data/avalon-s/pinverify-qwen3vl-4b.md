# Avalon-S/PInVerify-Qwen3VL-4B

## Resumen

PInVerify-Qwen3VL-4B es un conjunto de adaptadores LoRA desarrollados por Avalon-S (Yuhang Jiang) sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, especializados en la tarea de verificación activa de instancias (Active Instance Verification, AIV). Esta tarea, formalizada en el benchmark PInVerify presentado en el taller FMEA de CVPR 2026, consiste en que un agente robótico, tras haber navegado cerca de un objeto candidato, debe decidir si dicho objeto coincide con una descripción detallada en lenguaje natural, seleccionando activamente puntos de vista a su alrededor para resolver la ambigüedad.

El modelo colapsa un pipeline modular tradicional (descomposición de atributos, verificación por vista, tracker y selección de siguiente mejor vista) en un único modelo que navega y responde de extremo a extremo. Los adaptadores se entrenan mediante SFT seguido de refuerzo (GRPO o GSPO), y el resultado principal del paper es el adaptador `generic-cot/gspo`, que alcanza una precisión general de 0.856 en el test split con detección Grounding DINO y 0.889 con cajas GT, frente a 0.706 del modelo base sin ajuste. La relevancia actual radica en que demuestra que un modelo de visión-lenguaje ajustado con RL puede resolver tareas de verificación activa sin depender de componentes modulares, reduciendo además los pasos de decisión y las fallas de navegación.

El repositorio contiene múltiples adaptadores (SFT, DPO, GRPO, GSPO) organizados en dos familias según el estilo de cadena de pensamiento (Generic-CoT y Specific-CoT), todos en formato PEFT con safetensors. La licencia de los adaptadores es MIT, mientras que el modelo base y el dataset conservan sus propias licencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (transformer multimodal) + adaptadores LoRA (rank 16, alpha 32) en todas las capas lineales del LM; vision encoder congelado |
| Parametros totales | 4B (modelo base) + adaptadores LoRA (número exacto no disponible) |
| Longitud de contexto | no disponible (heredado del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible; los adaptadores se aplican al modelo base en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (adaptadores); modelo base y dataset con licencias propias |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-4B-Instruct, un transformer multimodal que procesa texto e imágenes. Sobre este modelo se aplican adaptadores LoRA de rango 16 y alpha 32 en todas las capas lineales del modelo de lenguaje, mientras que el encoder de visión permanece congelado. El entrenamiento se realiza en varias etapas: primero un SFT con 21.931 muestras del dataset PInVerify (con dos variantes de cadena de pensamiento: Generic-CoT y Specific-CoT), y posteriormente etapas de refuerzo con DPO (200 o 400 pasos), GRPO (500 pasos) o GSPO (500 pasos). GSPO se diferencia de GRPO únicamente en el uso de ratios de importancia a nivel de secuencia, como se describe en Zheng et al. (2025). La recompensa en RL combina formato de salida, corrección de la respuesta final, si la dirección de navegación elegida cae en un sector visible según las anotaciones del benchmark, y una penalización por paso que empuja al agente a detenerse. El entrenamiento se realizó en 4× NVIDIA RTX 3090 con bf16 utilizando ms-swift.

## Capacidades

- Verificación activa de instancias (AIV): dado un objeto candidato y una descripción detallada, el modelo decide si coincide navegando alrededor del objeto y respondiendo sí/no.
- Razonamiento de cadena de pensamiento (CoT) para determinar qué vistas examinar y cuándo detenerse.
- Integración con detección de objetos externa (Grounding DINO) o con cajas GT como oráculo.
- Capacidades de visión-lenguaje del modelo base (VQA, descripción de imágenes, etc.), aunque el adaptador está especializado en la tarea AIV.
- Eficiencia en decisión: el agente entrenado requiere 1.6 pasos de navegación de media frente a 2.3 del agente modular, con una tasa de fallos de navegación del 9% frente al 28%.

## Casos de uso

- Robótica doméstica: verificar si un objeto en una estantería coincide con la descripción "la taza azul con asa dorada" antes de agarrarlo, evitando errores de manipulación.
- Inspección industrial: comprobar que una pieza en una línea de montaje cumple las especificaciones descritas en lenguaje natural, seleccionando ángulos de cámara adecuados.
- Navegación autónoma en almacenes: confirmar que un producto visto desde un ángulo parcial es el buscado, reduciendo falsos positivos en sistemas de picking.
- Asistentes de realidad aumentada: verificación de objetos en entornos reales a partir de descripciones del usuario, guiando al usuario a rodear el objeto si es necesario.
- Benchmarking de agentes embodied: sirve como referencia para evaluar políticas de navegación y verificación en entornos offline, con métricas estandarizadas.
- Investigación en RL para visión-lenguaje: permite estudiar el impacto de diferentes algoritmos de refuerzo (GRPO vs GSPO) en tareas de decisión secuencial con entrada visual.

## Benchmarks y rendimiento

Resultados en el test split de PInVerify (3.000 episodios). Precisión general, con precisión en pares positivos entre paréntesis. DINO indica detección con Grounding DINO (entorno realista de despliegue); GT indica cajas ground truth (límite superior oráculo).

| Adapter | DINO | GT |
|---|---|---|
| Modelo base sin fine-tuning | 0.706 (0.146) | 0.710 (0.161) |
| `generic-cot/sft` | 0.848 (0.759) | 0.877 (0.828) |
| `generic-cot/grpo` | 0.853 (0.736) | 0.887 (0.806) |
| `generic-cot/gspo` | **0.856** (0.745) | **0.889** (0.813) |
| `specific-cot/sft` | 0.858 (0.697) | 0.884 (0.761) |
| `specific-cot/dpo-200` | 0.859 (0.700) | 0.881 (0.756) |
| `specific-cot/dpo-400` | 0.860 (0.665) | 0.884 (0.729) |
| `specific-cot/grpo` | 0.855 (0.793) | 0.884 (0.847) |
| `specific-cot/gspo` | 0.851 (0.796) | 0.889 (0.813) |

El intervalo de confianza binomial del 95% en p=0.85 con n=3.000 es de aproximadamente ±1.3 puntos porcentuales, por lo que la mayoría de las diferencias entre variantes fine-tuned caen dentro del ruido. La diferencia significativa es frente al modelo base sin ajuste, que falla casi por completo en pares positivos (0.146) debido a un fuerte sesgo hacia "no coincide". En comparación con el mejor agente modular sin entrenamiento (0.850 general, 0.596 en positivos), los agentes entrenados ganan unos 15 puntos en positivos a costa de perder algo de rechazo en categorías iguales, y son más eficientes en pasos y fallos de navegación.

## Requisitos de hardware

- Entrenamiento: 4× NVIDIA RTX 3090 con bf16 (según la documentación del autor).
- Inferencia: al ser adaptadores LoRA sobre un modelo de 4B, se requiere el modelo base Qwen3-VL-4B-Instruct. El modelo base en bf16 ocupa aproximadamente 8 GB de VRAM; los adaptadores añaden una cantidad marginal. Con cuantización 4-bit del modelo base, podría caber en GPUs consumer de 6-8 GB (p. ej., RTX 3060/4060), aunque no se proporcionan datos específicos de VRAM en la información disponible.
- GPUs recomendadas: RTX 3090/4090, A100, H100 para inferencia con contexto largo o despliegue concurrente.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con librerías como `peft` + `transformers`, o servirse con vLLM o TGI si se fusionan los pesos. También es posible usar llama.cpp si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicos de verificación activa de instancias en la documentación proporcionada. La comparación más relevante es contra el agente modular sin entrenamiento descrito en el paper, que alcanza 0.850 general y 0.596 en positivos, frente a 0.856 y 0.745 del mejor adaptador (`generic-cot/gspo`) en el entorno DINO. También se compara con el modelo base sin fine-tuning, que actúa como línea base no entrenada. No se mencionan modelos de la misma categoría de otros autores, por lo que no se puede establecer una comparativa externa con datos verificados.

## Limitaciones y advertencias

- El modelo base sin ajuste tiene un fuerte sesgo hacia "no coincide" (0.146 en pares positivos); el fine-tuning corrige parcialmente este sesgo pero introduce cierta pérdida de calibración en el rechazo de categorías similares.
- El modelo está entrenado específicamente para el dominio de PInVerify (18 categorías, gráfico de navegación de 6 sectores) y puede no generalizar a otros entornos o topologías de navegación sin reentrenamiento.
- Solo soporta inglés; no se reportan capacidades multilingües.
- La licencia MIT cubre únicamente los adaptadores; el modelo base Qwen3-VL-4B-Instruct y el dataset PInVerify tienen sus propias licencias que deben consultarse antes de uso comercial.
- El dataset hereda los términos de PInNED, lo que puede imponer restricciones adicionales de uso.
- Riesgo de alucinación en descripciones ambiguas o cuando las vistas disponibles no son informativas (trampas visuales).
- No se proporcionan resultados de benchmarks generales (MMLU, HumanEval, etc.) al ser un adaptador especializado; su rendimiento en tareas genéricas de VQA no ha sido evaluado en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Avalon-S/PInVerify-Qwen3VL-4B
- Paper PInVerify (arXiv): https://arxiv.org/abs/2605.30639
- Código oficial: https://github.com/Avalon-S/PInVerify
- Dataset PInVerify: https://huggingface.co/datasets/Avalon-S/PInVerify
- Paper GSPO (Zheng et al., 2025): https://arxiv.org/abs/2507.18071
