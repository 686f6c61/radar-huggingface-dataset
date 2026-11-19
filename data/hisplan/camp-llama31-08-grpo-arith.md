# hisplan/camp-llama31-08-grpo-arith

## Resumen

`hisplan/camp-llama31-08-grpo-arith` es un adaptador LoRA sobre `unsloth/Llama-3.1-8B-Instruct` (mismos pesos que Meta Llama 3.1 8B Instruct) afinado mediante GRPO (Group Relative Policy Optimization) con TRL sobre problemas aritméticos de enunciado en coreano. Lo publica el usuario hisplan como parte de un "mini-llm-camp", un ejercicio formativo de ajuste fino con refuerzo, no un modelo orientado a producción. El objetivo declarado es mejorar la precisión en problemas de aritmética elemental expresados en lenguaje natural en coreano, pasando de un 90 % a un 94 % de acierto estricto en un conjunto de prueba de 200 problemas.

El modelo no cambia la arquitectura del base: es un transformer decoder-only de 8 000 millones de parámetros con atención causal, ventana de contexto de 128 000 tokens y tokenizador multilingüe de Llama 3. El autor indica explícitamente que no ha validado el modelo para usos distintos del cálculo aritmético, y la model card advierte de que es un artefacto educativo y experimental, no una fuente fiable de información factual.

Su relevancia es fundamentalmente metodológica: ilustra cómo aplicar GRPO con recompensas verificables (respuesta numérica exacta) sobre un modelo pequeño para mejorar una habilidad concreta, y sirve como referencia reproducible de un pipeline de RLHF ligero con LoRA (r=16, alpha=32) en 150 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con adaptador LoRA sobre el modelo base |
| Parametros totales | 8 030 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en la información proporcionada; el modelo base admite las habituales para Llama 3.1 (FP16, BF16, INT8, GGUF de 4/5/6/8 bits) |
| Idiomas soportados | coreano (etiqueta `ko`); el base es multilingüe (8 idiomas oficiales de Llama 3.1) |
| Licencia | Llama 3.1 Community License (derivado "Built with Llama") |
| Formato de pesos | safetensors (librería `transformers`); adaptador LoRA, no pesos completos fusionados |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Llama 3.1 con 8 000 millones de parámetros, atención causal con RoPE, normalización RMSNorm pre-atención y activación SwiGLU, tokenizador BPE de 128 256 entradas y ventana de contexto de 128 000 tokens. Sobre él se entrena un adaptador LoRA con rango 16 y alpha 32, aplicado presumiblemente a las proyecciones de atención y MLP del transformer, sin modificar los pesos originales.

El ajuste se realiza con GRPO implementado en TRL. La configuración reportada es: 150 pasos máximos, batch de 8 con acumulación de gradiente 4, 8 generaciones por prompt, temperatura 0,6, learning rate 2e-5, beta 0,0 (sin penalización KL explícita frente a la política de referencia), longitud máxima de completion 512 tokens y 1 235 ejemplos de entrenamiento. La función de recompensa es la coincidencia estricta de la respuesta numérica final, un esquema de recompensa verificable típico de GRPO para tareas matemáticas. No se documenta la composición exacta del dataset de entrenamiento ni si hubo etapas previas de SFT.

## Capacidades

- Generación de texto en coreano e inglés (y, por herencia del base, en los ocho idiomas oficiales de Llama 3.1), con la salvedad de que el ajuste se ha validado solo en coreano aritmético.
- Resolución de problemas aritméticos de enunciado en coreano, con formato de respuesta numérica final verificable.
- Razonamiento de varios pasos dentro de una misma completion (hasta 512 tokens), útil para descomponer un problema en operaciones intermedias.
- Conversación multi-turno mediante la plantilla de chat del tokenizador (`tokenizer.apply_chat_template`), que el autor indica usar tal cual.
- Capacidades heredadas del base no revalidadas tras el ajuste: tool calling, function calling, generación de código, resumen, traducción y seguimiento de instrucciones generales.
- No dispone de modo "thinking" explícito, visión, audio ni decodificación especulativa documentada.

## Casos de uso

- Evaluación de pipelines de RL con recompensas verificables: sirve como referencia reproducible de un entrenamiento GRPO con LoRA sobre Llama 3.1 8B, con hiperparámetros y métricas de partida y llegada documentadas (90 % → 94 % en 200 problemas).
- Investigación educativa sobre ajuste fino: permite comparar el comportamiento del adaptador frente al modelo base en el mismo conjunto de problemas aritméticos coreanos, aislando el efecto del entrenamiento con refuerzo.
- Prototipado de tutores de matemáticas elementales en coreano: el modelo puede generar la resolución paso a paso de un problema de enunciado y devolver la respuesta numérica final, siempre que se valide con un verificador externo.
- Generación de datos sintéticos para aritmética en coreano: dado que el adaptador produce cadenas de razonamiento con respuesta final, puede emplearse para enriquecer datasets de entrenamiento, filtrando por corrección con un evaluador determinista.
- Pruebas de regresión de infraestructura de inferencia: al ser un adaptador LoRA pequeño (repo de 0,2 GB), es útil para validar despliegues de vLLM, TGI o llama.cpp con adaptadores dinámicos antes de mover modelos mayores.
- Demostraciones docentes de ajuste fino con refuerzo: ilustra en un taller cómo pasar de un modelo instructivo genérico a uno especializado en una tarea acotada con 1 235 ejemplos y 150 pasos.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Adaptador GRPO | Conjunto |
|---|---|---|---|
| Precisión estricta en aritmética de enunciado (coreano) | 90 % | 94 % | 200 problemas de prueba del autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la precisión estricta en el conjunto de prueba propio del autor, sin comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16 GB solo para pesos, más KV cache y activaciones; en la práctica se recomienda 24 GB o más para contextos largos.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada con cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en FP16 con concurrencia; RTX 4090 (24 GB) para FP16 en un solo usuario; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 u 8 bits en tarjetas de 8-12 GB o superiores; en FP16 requiere al menos 24 GB.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador, vLLM con soporte de LoRA, TGI con adaptadores, llama.cpp/Ollama tras fusionar y convertir a GGUF. El adaptador también puede fusionarse con el base (`merge_and_unload`) para obtener pesos completos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hisplan/camp-llama31-08-grpo-arith` | 8B + LoRA | 128 000 | Aritmética de enunciado en coreano (GRPO) | Llama 3.1 Community | Hugging Face |
| `unsloth/Llama-3.1-8B-Instruct` | 8B | 128 000 | Instrucciones generales, multilingüe | Llama 3.1 Community | Hugging Face |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128 000 | Instrucciones generales, multilingüe | Llama 3.1 Community | Hugging Face |
| `Qwen/Qwen2.5-7B-Instruct` | 7,6B | 131 072 | Instrucciones generales, fuerte en matemáticas y código | Apache 2.0 | Hugging Face |

El adaptador comparte arquitectura, tokenizador y licencia con el base, por lo que la comparación relevante es frente a `unsloth/Llama-3.1-8B-Instruct`: la única diferencia documentada es la mejora de 4 puntos porcentuales en el conjunto de prueba aritmético coreano del autor. Frente a alternativas como Qwen2.5-7B-Instruct, este adaptador no aporta ventajas generales y su licencia es más restrictiva.

## Limitaciones y advertencias

- Modelo educativo y experimental: el propio autor advierte de que no debe usarse como fuente de información factual.
- Riesgo alto de alucinación: puede inventar cifras, fechas y resultados de investigación con un tono convincente.
- Validación restringida a aritmética en coreano: no se ha evaluado su comportamiento en otras tareas ni en otros idiomas tras el ajuste; el uso general puede degradarse respecto al base.
- Sin penalización KL (beta = 0,0): el adaptador puede haberse desplazado de la distribución del modelo de referencia, con posible pérdida de capacidades generales.
- Conjunto de evaluación pequeño (200 problemas) y definido por el autor: la mejora de 90 % a 94 % tiene un margen de error considerable y no procede de un benchmark estándar.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales), obligaciones de atribución "Built with Llama" y requisitos de denominación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- No se documentan sesgos específicos, pero hereda los del base y los del corpus coreano empleado, no descrito.
- El adaptador debe cargarse junto con el modelo base; no es un modelo autónomo y requiere PEFT o fusión previa para su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisplan/camp-llama31-08-grpo-arith
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- TRL (implementación de GRPO): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
