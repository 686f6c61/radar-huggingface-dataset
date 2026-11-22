# SlayerLab/Slayer1B-1.07

## Resumen

Slayer1B 1.07 es un modelo de lenguaje causal decoder-only de 1.073.912.851 parámetros desarrollado por SlayerLab, entrenado desde cero y con dominancia del polaco. Se trata de la continuación del preentrenamiento de Slayer1B 1.06 desde su checkpoint final (paso 13848), añadiendo 8.891.005.707 tokens de entrenamiento adicionales (aproximadamente 7.000 millones nuevos y 1.900 millones repetidos de los datos de 1.06). El entrenamiento finalizó en el paso 22327 el 6 de noviembre de 2026.

El modelo mantiene la misma arquitectura, tokenizador (v6, 32.768 tokens) y batch global que la versión 1.06, con una longitud de contexto de 4096 tokens y un learning rate constante de 6e-4 sin decaimiento ni extensión de contexto. Está pensado para generación de texto en polaco e inglés, con un sesgo claro hacia el polaco (65,3 % de los tokens de entrenamiento de esta iteración son polacos, frente al 43,7 % de inglés).

Su relevancia radica en ser un modelo pequeño (1B) entrenado íntegramente desde cero con recursos limitados (4× RTX 4090, ~45.000 tokens/s) y publicado con licencia Apache 2.0, lo que lo hace accesible para experimentación e inferencia en hardware de consumo. La transparencia del autor es notable: se publican los checkpoints nativos de entrenamiento, los datos de entrenamiento y la curva de entrenamiento con evaluaciones intermedias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (causal-lm) |
| Parámetros totales | 1.073.912.851 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se especifican cuantizaciones oficiales) |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal estándar, entrenado desde cero (from-scratch) sin extensión de contexto ni decaimiento del learning rate. El entrenamiento de la versión 1.07 continuó desde el checkpoint `ckpt_13848.pt` de la versión 1.06, con un batch global de 256 secuencias × 4096 tokens = 1.048.576 tokens por paso, learning rate constante de 6e-4 y acumulación de gradiente de 32 sobre 4× NVIDIA RTX 4090 (unos 45.000 tokens/s). Se realizaron 8.479 pasos (13848 → 22327), con una pasada única sobre los nuevos datos.

Los datos de entrenamiento de 1.07 suman 8.891.005.707 tokens en 9 archivos, tras eliminar documentos solapados con conjuntos de evaluación (escaneo de 13-gramas) y enmascarar datos personales. La composición por tokens es: web polaca 35,0 %, textos núcleo polacos 11,1 %, textos legales polacos 10,3 % e inglés 43,7 % (FineWeb-Edu, FineMath, open-web-math, DCLM-baseline y FineWeb-Edu sample/10BT). Los textos núcleo y legales polacos son un subconjunto aleatorio de lo ya visto en 1.06 (aproximadamente el 36 % de los tokens núcleo y el 68 % de los legales se ven por segunda vez). El entrenamiento se interrumpió dos veces por paradas externas del proceso y se reanudó desde checkpoints guardados, reproduciendo la pérdida original (2,3177 en el paso 17010 y 2,3105 en el paso 19260).

## Capacidades

- Generación de texto causal en polaco e inglés, con dominancia del polaco.
- Modelo base de preentrenamiento (no se indica ajuste por instrucciones, RLHF ni DPO en la información disponible).
- Razonamiento y conocimiento general derivado del preentrenamiento en web, textos educativos, matemáticas y textos legales.
- Capacidades matemáticas parciales por la inclusión de FineMath y open-web-math en el entrenamiento.
- Capacidades multilingües limitadas a polaco e inglés (no se documentan otros idiomas).
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito (thinking mode).
- No se documenta soporte de visión ni audio.

## Casos de uso

- Generación de texto en polaco para aplicaciones de contenido: el modelo está entrenado con un 65,3 % de tokens polacos (web, núcleo y legal), lo que lo hace adecuado para redacción y completado de texto en ese idioma con una ventana de 4096 tokens.
- Procesamiento de textos legales polacos: el 10,3 % de los tokens de entrenamiento son textos legales, por lo que puede emplearse en tareas de resumen o extracción sobre documentación jurídica en polaco, siempre con revisión humana.
- Prototipado e investigación en PLN (procesamiento de lenguaje natural) para polaco: al ser un modelo from-scratch de 1B con licencia Apache 2.0 y checkpoints intermedios publicados, sirve como base para experimentos de ajuste fino y análisis de curvas de entrenamiento.
- Inferencia en hardware de consumo: con 1.073 millones de parámetros y pesos safetensors, puede desplegarse en GPUs de consumo (por ejemplo, RTX 4090) para generación de texto local en polaco e inglés.
- Generación asistida en inglés educativo y matemático: la inclusión de FineWeb-Edu, FineMath y open-web-math permite su uso en tareas de completado y explicación de contenido educativo en inglés, con las cautelas propias de un modelo base.
- Base para ajuste fino supervisado (SFT): al no documentarse ajuste por instrucciones, el modelo es un punto de partida para entrenar variantes instruct en polaco con datasets propios, aprovechando la licencia permisiva.
- Evaluación comparativa de modelos pequeños multilingües: sus evaluaciones intermedias publicadas (BLiMP, ARC-Easy, WikiText-2, MultiBLiMP-PL) permiten usarlo como referencia en estudios de escalado y repetición de datos.

## Benchmarks y rendimiento

Evaluaciones en tiempo de entrenamiento (mismo evaluador automático y protocolo zero-shot que la model card de 1.06; no es el lm-evaluation-harness de las versiones 1.00–1.03):

| Paso | BLiMP (EN), % | ARC-Easy (EN), % | WikiText-2 byte PPL ↓ | WikiText-2 token PPL ↓ | MultiBLiMP (PL), % | ARC-Easy (PL, eu20), % | Dispositivo |
|---:|---:|---:|---:|---:|---:|---:|---|
| 13848 (1.06) | 76,12 | 52,99 | 2,2849 | 30,03 | 98,41 | 45,03 | CPU |
| 13998 | 76,29 | 54,34 | 2,2618 | 28,80 | 98,66 | 45,37 | CPU |
| 14000 | 76,33 | 54,21 | 2,2601 | 28,71 | 98,59 | 44,91 | CPU |
| 15000 | 77,94 | 54,59 | 2,2321 | 27,28 | 98,62 | 45,92 | CPU |
| 15730 | 77,32 | 55,64 | 2,2237 | 26,85 | 98,62 | 45,7 | CPU |

No se han publicado en la información disponible resultados del checkpoint final (22327) ni de los pasos 20000–22000, ni benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (1.073 millones de parámetros): en fp16/bf16 aproximadamente 2,1 GB de pesos; en cuantización de 8 bits aproximadamente 1,1 GB; en 4 bits aproximadamente 0,6 GB, más overhead de activaciones y KV cache para contexto de 4096 tokens.
- GPU recomendadas: el autor entrenó con 4× NVIDIA RTX 4090; para inferencia cabe en GPUs de consumo como RTX 4090, RTX 3090 o superiores, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM en cuantizaciones bajas (no confirmado oficialmente).
- Opciones de despliegue: no se documentan en la información disponible. Al ser un modelo pytorch con pesos safetensors y arquitectura causal-lm estándar, es compatible en principio con frameworks habituales (transformers, vLLM, llama.cpp/Ollama tras conversión a GGUF, TGI), pero no hay confirmación oficial.
- Latencia y throughput estimados: no disponible para inferencia. Durante el entrenamiento se reportan aproximadamente 45.000 tokens/s con 4× RTX 4090 en modo entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slayer1B 1.07 | 1.073.912.851 | 4096 | pl, en | Apache 2.0 | Hugging Face (pesos safetensors y checkpoints nativos) |
| Slayer1B 1.06 | 1.073.912.851 (misma arquitectura) | 4096 | pl, en | Apache 2.0 | Hugging Face (versión anterior del mismo autor) |
| Alternativas de ~1B multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de la misma categoría, por lo que la comparativa de rendimiento se limita a la evolución interna entre versiones (1.06 → 1.07).

## Limitaciones y advertencias

- Es un modelo base de preentrenamiento: no se documenta ajuste por instrucciones, RLHF ni DPO, por lo que puede no seguir instrucciones de forma fiable sin ajuste fino adicional.
- Riesgo de alucinación inherente a un modelo de 1B entrenado con datos web; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados explícitamente, pero la composición de datos (web polaca, textos legales y web educativa inglesa) puede introducir sesgos de dominio y de idioma.
- Limitación de idioma: solo polaco e inglés; el rendimiento en otros idiomas no está evaluado y previsiblemente será bajo.
- Ventana de contexto limitada a 4096 tokens, sin extensión de contexto en esta iteración.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero parte de los datos de entrenamiento (web polaca HPLT) se usan bajo la excepción de minería de textos y datos (Art. 4, Directiva 2019/790), lo que conviene revisar para despliegues comerciales.
- El entrenamiento sufrió dos interrupciones externas, aunque el autor verifica que la reanudación reproduce la pérdida original.
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni del checkpoint final, lo que limita la evaluación objetiva de su calidad final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.07
- Versión anterior (1.06): https://huggingface.co/SlayerLab/Slayer1B-1.06
- Checkpoints nativos de entrenamiento: https://huggingface.co/SlayerLab/Slayer1B-1.07-checkpoints
- Dataset de entrenamiento de 1.07: https://huggingface.co/datasets/SlayerLab/slayer-1.07-pretrain
- Dataset base de 1.06: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluación: https://track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925
- Gráfico de entrenamiento: https://huggingface.co/SlayerLab/Slayer1B-1.07/resolve/main/slayer1b_107_training.png
