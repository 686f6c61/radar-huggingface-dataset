# RonanLabs/mom-lab-qwen3-4b-adapters

## Resumen

Los adaptadores mom-lab Qwen3-4B son seis módulos LoRA de rango 16 entrenados sobre el checkpoint post-entrenado de Qwen/Qwen3-4B (revisión fijada `1cfa9a7208912126459214e8b04321603b3df60c`). Los publica RonanLabs (Stephen J. Ronan, MD) como artefactos de investigación asociados al estudio de habilidades de nicho del proyecto mom-lab. Tres de ellos convierten informes METAR de aviación en JSON estructurado de 14 campos y los otros tres resuelven cálculos de MedCalc-Bench v1.2. Cada tarea se entrena con tres semillas distintas (0, 1 y 2) para poder medir varianza entre ejecuciones.

El interés de estos adaptadores no reside en su tamaño, sino en la demostración de que un ajuste fino pequeño y muy especializado puede superar a modelos mucho mayores en una tarea concreta. El adaptador METAR alcanza un 99,83 % de precisión exacta en el conjunto de test, frente al 89,6 % del mejor sistema de 8B/32B con esquema JSON forzado y el 84,2 % de Qwen3-8B con 5-shot y thinking. El adaptador MedCalc llega al 58,67 %, muy por encima del 25,8 % del Qwen3-4B sin ajustar.

Son artefactos de investigación, no productos: el autor lo indica explícitamente en la model card. Su valor práctico está en servir de referencia reproducible para quien quiera estudiar adaptación de bajo rango en dominios verticales, y en ofrecer una receta concreta de despliegue con PEFT y vLLM sobre una base de 4B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-4B |
| Parametros totales | 33.030.144 parámetros entrenables por adaptador (base congelada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de longitud máxima de entrenamiento (contexto nativo de Qwen3-4B no disponible en la información) |
| Tipos de cuantizacion | no disponible (los tensores del adaptador se almacenan en fp32; entrenamiento con bf16 autocast) |
| Idiomas soportados | en |
| Licencia | apache-2.0-and-cc-by-sa-4.0 (METAR: Apache-2.0; MedCalc: CC BY-SA 4.0; pesos base bajo Apache 2.0 de Qwen) |
| Formato de pesos | safetensors (adapter_model.safetensors, 132.187.888 bytes por carpeta) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 con alpha 32 y dropout 0, aplicados sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del Qwen3-4B post-entrenado, manteniendo los pesos base congelados. El entrenamiento usa learning rate 2e-4 con schedule coseno y 3 % de warmup lineal, 2 épocas, weight decay 0.01, AdamW con beta2 0.95, gradient clipping 1.0 y aproximadamente 65.536 tokens por actualización. Los pesos maestros se mantienen en fp32 con autocast bf16; los tensores del adaptador se guardan en fp32. La pérdida se calcula únicamente sobre la respuesta del asistente, con las plantillas de chat de la base renderizadas con `enable_thinking=False`.

El conjunto de datos es exclusivamente el de la tarea correspondiente, sin mezclas de replay ni destilación: los adaptadores METAR vieron solo `metar/train.jsonl` (8.000 ejemplos) y los de MedCalc solo `medcalc/train.jsonl` (9.827 ejemplos), ambos del dataset RonanLabs/mom-lab-metar-medcalc con hashes congelados en `artifacts/PARTD_C_FREEZE.sha256`. METAR requirió 124 pasos de optimizador y MedCalc entre 265 y 266. Cada ejecución se hizo en una GPU de una DGX Station. La evaluación se realizó con decodificación greedy, máximo 4.096 tokens de salida y vLLM en modo batch-invariant, con intervalos de confianza por bootstrap de 2.000 remuestras pareadas por ítem.

## Capacidades

- Generación de JSON estructurado de 14 campos a partir de informes METAR de aviación, con precisión exacta all-or-nothing del 99,83 % en test.
- Resolución de cálculos clínicos del benchmark MedCalc-Bench v1.2, con 58,67 % de precisión media en test.
- Generación de texto general heredada de Qwen3-4B, aunque el ajuste está orientado a las dos tareas específicas.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la capacidad base del modelo.
- Capacidades multilingües limitadas al inglés según la model card.
- Modo thinking desactivado de forma explícita en el entrenamiento y en el uso recomendado (`enable_thinking=False`).
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Decodificación de METAR en pipelines de aviación: el adaptador `metar/seed0` convierte un informe METAR en un objeto JSON de 14 campos con precisión exacta del 99,8 %, lo que permite alimentar sistemas de monitorización meteorológica sin parsers ad hoc.
- Extracción estructurada en investigación aeronáutica: los tres seeds permiten medir la varianza del ajuste y comparar estabilidad entre ejecuciones, útil para estudios de reproducibilidad en ajuste fino.
- Cálculo clínico asistido en entornos de investigación: el adaptador `medcalc/seed2` resuelve el 60,7 % de los casos de MedCalc-Bench v1.2, adecuado para prototipos de calculadoras médicas que requieran validación posterior.
- Estudio de adaptación de bajo rango: los adaptadores sirven como referencia reproducible para comparar LoRA frente a prompting con esquemas JSON forzados en modelos mayores, con intervalos de confianza publicados.
- Despliegue con vLLM multi-LoRA: el mismo servidor puede cargar los seis adaptadores sobre una única instancia de Qwen3-4B (`--enable-lora --max-lora-rank 16`), lo que abarata servir varias tareas de nicho en paralelo.
- Evaluación de olvido catastrófico: la comparación entre adaptadores METAR y MedCalc muestra cómo un ajuste muy específico degrada la otra tarea (METAR cae al 22,8 % en MedCalc), lo que resulta útil para diseñar estrategias de mezcla de datos.
- Docencia y formación en ajuste fino: el repositorio incluye `train_args.json`, `train_log.jsonl` y `SHA256SUMS`, lo que facilita reproducir el experimento paso a paso.

## Benchmarks y rendimiento

Resultados por semilla (precisión, %), decodificación greedy sobre splits de test: METAR n = 1.000 informes de 73 estaciones reservadas; MedCalc-Bench v1.2 n = 1.100; Pre-Flight n = 240.

| Adaptador | METAR | MedCalc | Pre-Flight |
|---|---|---|---|
| metar/seed0 | 99,8 | 22,8 | 65,0 |
| metar/seed1 | 99,7 | 23,7 | 64,2 |
| metar/seed2 | 100,0 | 23,9 | 63,3 |
| metar (media) | 99,83 | 23,48 | 64,17 |
| medcalc/seed0 | 0,1 | 57,2 | 57,5 |
| medcalc/seed1 | 0,7 | 58,1 | 59,6 |
| medcalc/seed2 | 0,0 | 60,7 | 60,0 |
| medcalc (media) | 0,27 | 58,67 | 59,03 |
| Qwen3-4B sin ajustar, zero-shot | 0,4 | 25,8 | 67,1 |

Comparación del adaptador METAR frente a modelos mayores sin ajustar (n = 1.000):

| Comparación | Puntuación del otro brazo | Diferencia [IC 95 %] | Veredicto |
|---|---|---|---|
| G2: vs mejor brazo 8B/32B con esquema JSON, Qwen3-32B thinking + XGrammar | 89,6 | +10,23 [+8,40, +12,23] | PASS |
| G2 con bootstrap por clúster de estación (73 estaciones) | 89,6 | +10,23 [+7,51, +13,01] | PASS |
| G1: vs Qwen3-8B 5-shot + thinking + esquema JSON | 84,2 | +15,63 [+13,33, +17,90] | PASS |
| F3: vs mejor 8B con prompting 5-shot + thinking (3 semillas) | 83,17 | +16,67 [+15,00, +18,47] | PASS |
| vs Qwen3-32B thinking sin esquema (1 semilla) | 88,9 | +10,93 [+9,07, +13,00] | descriptivo |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade unos 132 MB en fp32 por encima de los pesos base de Qwen3-4B. Con la base en bf16 (aproximadamente 8 GB) el conjunto cabe en GPUs de 16 GB o más; con cuantización de la base a 4 bits podría caber en 8 GB, aunque la información disponible no documenta cuantizaciones del adaptador.
- GPU recomendadas: el entrenamiento se realizó en una GPU de una DGX Station. Para inferencia, cualquier GPU con al menos 16 GB de VRAM es suficiente para la base en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 4080 (16 GB) con la base en bf16.
- Opciones de despliegue: transformers + PEFT (receta incluida en la model card) y vLLM con `--enable-lora --max-lora-rank 16 --lora-modules metar=<ruta local>`. No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El adaptador METAR genera aproximadamente 143 tokens de salida por ítem, dato que puede orientar estimaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | METAR (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mom-lab METAR LoRA (este) | 33 M entrenables sobre 4B | 8.192 (entrenamiento) | 99,83 | Apache-2.0 (adaptador) | Hugging Face |
| Qwen3-32B thinking + JSON schema (XGrammar) | 32B | no disponible | 89,6 | Apache 2.0 | Hugging Face |
| Qwen3-8B 5-shot + thinking + JSON schema | 8B | no disponible | 84,2 | Apache 2.0 | Hugging Face |
| Qwen3-4B sin ajustar, zero-shot | 4B | no disponible | 0,4 | Apache 2.0 | Hugging Face |
| mom-lab MedCalc LoRA (este) | 33 M entrenables sobre 4B | 8.192 (entrenamiento) | 58,67 (MedCalc) | CC BY-SA 4.0 (adaptador) | Hugging Face |
| Qwen3-4B sin ajustar, zero-shot | 4B | no disponible | 25,8 (MedCalc) | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Son artefactos de investigación, no productos: el autor lo declara explícitamente y no ofrece garantías de robustez fuera de los conjuntos de test publicados.
- Olvido catastrófico severo entre tareas: el adaptador METAR cae al 22,8-23,9 % en MedCalc y el adaptador MedCalc cae al 0,0-0,7 % en METAR. No deben combinarse ni esperarse capacidades cruzadas.
- El adaptador MedCalc se queda en el 58,67 % de precisión, insuficiente para uso clínico real sin supervisión humana.
- Riesgo de alucinación en entradas fuera de distribución: el entrenamiento usó exclusivamente los conjuntos de la tarea, sin mezclas de replay, lo que puede degradar el comportamiento ante formatos METAR o casos clínicos no vistos.
- Idioma limitado al inglés según la model card.
- El modo thinking debe desactivarse (`enable_thinking=False`); no se ha evaluado el comportamiento con thinking activado.
- Licencia mixta: los adaptadores METAR son Apache-2.0 y los MedCalc CC BY-SA 4.0, que impone compartir igual. Los pesos base de Qwen3-4B mantienen su licencia Apache 2.0 original y no se relicencian aquí.
- La revisión del modelo base está fijada (`1cfa9a7208912126459214e8b04321603b3df60c`); usar otra revisión puede invalidar los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se documentan sesgos específicos más allá de los heredados de Qwen3-4B.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/RonanLabs/mom-lab-qwen3-4b-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/RonanLabs/mom-lab-metar-medcalc
- Dataset MedCalc-Bench: https://huggingface.co/datasets/ncbi/MedCalc-Bench
- Repositorio del proyecto mom-lab: https://github.com/RonanLabsAI/mom-lab
