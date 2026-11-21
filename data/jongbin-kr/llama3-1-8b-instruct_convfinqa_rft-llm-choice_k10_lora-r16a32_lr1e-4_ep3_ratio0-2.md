# Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-llm-choice_k10_lora-r16a32_lr1e-4_ep3_ratio0.2

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr y entrenado mediante una técnica de autoentrenamiento denominada rejection-sampling fine-tuning (RFT) sin etiquetas. El objetivo concreto es mejorar el rendimiento del modelo base en tareas de razonamiento financiero conversacional sobre el conjunto de datos ConvFinQA, un benchmark que combina contexto de informes financieros (texto y tablas) con preguntas numéricas de varios turnos. El adaptador se entrena sobre las propias muestras generadas por el modelo base, seleccionando las mejores respuestas mediante un mecanismo de elección basado en un LLM juez.

El adaptador se presenta como un experimento de investigación centrado en la selección de muestras de alta calidad para el ajuste supervisado. El autor compara varias estrategias de selección (aleatoria, self-consistency, LLM-choice, JEV-choice y gold) y publica resultados de precisión sobre el conjunto de validación de ConvFinQA. Este adaptador concreto corresponde a la variante `llm-choice`, en la que un modelo Llama-3.1-8B-Instruct lee las diez muestras generadas por problema y elige la que considera correcta.

Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación de nicho, no de un modelo orientado a producción. Su relevancia radica en documentar metodologías de RFT y en servir como referencia reproducible para quienes investigan autoentrenamiento y ajuste fino eficiente con LoRA sobre modelos de 8B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre proyecciones lineales |
| Parametros totales | 8B en el modelo base; el adaptador LoRA (r=16, alpha=32) anade un subconjunto pequeno de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens, pero el adaptador no documenta cambios) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8B parámetros. El ajuste se realiza con LoRA de rango 16, alpha 32, dropout 0.05, aplicado a todas las proyecciones lineales. El entrenamiento usa learning rate 1e-4 con scheduler cosine, warmup del 3%, 3 épocas, batch efectivo de 32, pérdida solo sobre la completion, precisión bf16 y semilla 42 en una única ejecución.

Los datos provienen de `ssunggun2/LG_ConvFin_MCQ` (revisión 5669718b): se toma una muestra uniforme del 20% (semilla 42), es decir, 2.174 de 10.874 filas. Para cada problema se generan 10 muestras con Llama-3.1-8B-Instruct (temperatura 0.7, top_p 1.0) usando un system prompt de analista financiero y una instrucción para responder con el formato `<think>…</think><answer>…</answer>`. En esta variante, la selección de la muestra usada para el SFT se realiza con `llm-choice`: el propio Llama-3.1-8B-Instruct lee las 10 muestras (incluyendo duplicados) y elige el candidato cuya respuesta final es correcta, sumando probabilidades por respuesta. La precisión de los datos resultante es del 62,3%.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno sobre contexto financiero (texto y tablas).
- Razonamiento numerico y respuesta a preguntas de tipo ConvFinQA con formato estructurado `<think>…</think><answer>…</answer>`.
- Capacidad de seguir instrucciones con system prompt de analista financiero.
- Soporte de tool calling y function calling heredado del modelo base Llama 3.1 (no validado especificamente en este adaptador).
- Capacidades multilingues heredadas del modelo base (no documentadas para el adaptador).
- No se documentan capacidades de vision, audio ni modo thinking nativo mas alla del formato de respuesta entrenado.

## Casos de uso

- Investigacion en rejection-sampling fine-tuning: sirve como punto de comparacion reproducible para estudiar como la seleccion de muestras (llm-choice frente a jev-choice, sc o gold) afecta a la precision final en ConvFinQA.
- Analisis de calidad de datos sinteticos: permite medir la precision de los ejemplos de SFT (62,3% en esta variante) y correlacionarla con la exactitud en validacion (58,9%).
- Prototipado de asistentes de analisis financiero: el adaptador puede usarse para responder preguntas sobre informes con tablas en un entorno controlado, aunque con las cautelas propias de un experimento de investigacion.
- Evaluacion de estrategias de seleccion con LLM juez: util para quienes disenan pipelines de autoentrenamiento y quieren replicar el protocolo de eleccion basado en probabilidades agregadas.
- Base para experimentos de fusion de adaptadores: al ser un LoRA pequeno (repo de 0,2 GB), es facil de fusionar con el modelo base para probar variantes de cuantizacion o despliegue.
- Docencia y divulgacion: ejemplo concreto de como se construye un adaptador PEFT con `peft` y `transformers` sobre Llama 3.1, con codigo de uso incluido en la model card.

## Benchmarks y rendimiento

Evaluacion sobre validacion de ConvFinQA (`AdaptLLM/ConvFinQA`, 1.490 turnos), decodificacion greedy; una respuesta se considera correcta si coincide por math-verify, exact match normalizado o match numerico (tolerancia relativa 1e-3, decimal↔porcentaje).

| Seleccion | Ejemplos SFT | Precision de datos (%) | Exactitud en evaluacion (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 60,0 |
| random | 2174 | 57,7 | 59,5 |
| sc | 2174 | 67,5 | 60,6 |
| **llm-choice** | 2174 | 62,3 | 58,9 |
| jev-choice | 2174 | 73,0 | 64,8 |
| gold | 1850 | 100,0 | 62,7 |

El autor advierte que solo hay una semilla de entrenamiento por seleccion y que las diferencias inferiores a 2-3 puntos pueden ser ruido. En esta variante concreta, la exactitud (58,9%) es inferior a la del modelo base sin SFT (60,0%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al requerir el modelo base Llama-3.1-8B-Instruct en bf16, se necesitan aproximadamente 16 GB de VRAM solo para los pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: A100, H100 o GPU consumer con 24 GB o mas (RTX 4090, RTX 3090) para bf16; para cuantizacion 4-bit pueden ser suficientes GPUs con 8-12 GB, aunque no se documenta en la informacion proporcionada.
- Cabe en GPU consumer: si, en RTX 4090/3090 con bf16, y potencialmente en GPUs de 8-12 GB si se cuantiza el modelo base fusionado (no validado por el autor).
- Opciones de despliegue: `peft` + `transformers` (documentado en la model card); vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador con el modelo base y convertir a los formatos correspondientes, lo cual no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud ConvFinQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (llm-choice) | 8B + LoRA | No disponible | 58,9% | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 60,0% | llama3.1 | Hugging Face |
| Variante jev-choice (mismo autor) | 8B + LoRA | No disponible | 64,8% | llama3.1 | Hugging Face |
| Variante gold (mismo autor) | 8B + LoRA | No disponible | 62,7% | llama3.1 | Hugging Face |

La comparativa mas directa la ofrecen las variantes del mismo autor, que comparten muestras y solo difieren en la seleccion. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador rinde peor que el modelo base sin ajuste en el conjunto de validacion (58,9% frente a 60,0%), por lo que no debe asumirse una mejora por el hecho de estar ajustado.
- Solo se ha entrenado con una semilla; el autor advierte que diferencias de 2-3 puntos pueden ser ruido estadistico.
- El dominio esta limitado a ConvFinQA y a preguntas financieras con contexto de texto y tablas; no se documenta comportamiento fuera de ese dominio.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar sus terminos antes de cualquier despliegue en produccion.
- Al ser un adaptador LoRA, requiere cargar el modelo base por separado; no es un modelo autonomo.
- No se documentan idiomas soportados ni cuantizaciones validadas.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-llm-choice_k10_lora-r16a32_lr1e-4_ep3_ratio0.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ssunggun2/LG_ConvFin_MCQ
- Dataset de evaluacion: https://huggingface.co/datasets/AdaptLLM/ConvFinQA
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
