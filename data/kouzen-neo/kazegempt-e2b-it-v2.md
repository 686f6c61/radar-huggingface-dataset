# kouzen-neo/KazeGemPT-E2B-it-v2

## Resumen

KazeGemPT-E2B-it-v2 es un ajuste fino (fine-tuning) del modelo multimodal google/gemma-4-E2B-it, desarrollado por el usuario kouzen-neo, especializado en la traducción de texto OCR de manga desde japonés o inglés hacia indonesio o inglés. El modelo no es un traductor generalista: está entrenado para emitir exactamente el objeto JSON que consume el modo OCR del traductor de manga KZRS, incluyendo la lógica de omisión (`"SKIP"`) para efectos de sonido, cartelas de créditos y ruido de OCR.

La relevancia de esta versión 2 radica en la corrección de fallos concretos de la v1: alcanza un 100 % de validez JSON estricta (98/98) en las tres suites de evaluación, elimina las omisiones erróneas en bocadillos compuestos solo por puntuación y eleva la precisión de SKIP en páginas reales del 89,6 % al 98,2 %, con cero falsos positivos. Además, mejora el chrF hacia indonesio en páginas reales (+3,7 puntos).

El modelo conserva la arquitectura y el tamaño del base (5.104.297.539 parámetros según safetensors, aproximadamente 5,1 mil millones), se distribuye con licencia Apache-2.0 y está pensado para ejecutarse localmente con llama.cpp o cualquier servidor compatible con la API de OpenAI. Es, por tanto, una pieza de infraestructura para pipelines de traducción de manga, no un asistente conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4), ajuste fino sobre google/gemma-4-E2B-it; visión y audio congelados durante el entrenamiento |
| Parametros totales | 5.104.297.539 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K (publicadas en el repo GGUF) |
| Idiomas soportados | japonés (ja), inglés (en), indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal, bf16); GGUF (repo kouzen-neo/KazeGemPT-E2B-it-v2-GGUF) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 con aproximadamente 5,1 mil millones de parámetros. El ajuste se realizó mediante LoRA con r=64 y alpha=128, tasa de aprendizaje 1e-4, schedule coseno y precisión bf16, aplicando pérdida solo sobre los tokens del asistente (assistant-only loss). Los pesos de visión y audio se mantuvieron congelados, de modo que el modelo resultante es efectivamente de texto aunque herede la arquitectura multimodal del base. El adaptador LoRA se fusionó (merged) en los pesos bf16 finales. El entrenamiento consistió en 2 épocas (1.336 pasos) sobre 10.684 ejemplos: aproximadamente 7.300 ejemplos en formato KZRS y unos 3.600 pares planos.

Los datos de entrenamiento combinan el dataset de la v1 con nuevos datos de destilación de la v2, generados por el profesor Qwen/Qwen3.8-27B-FP8 (Apache-2.0) y filtrados por validez JSON, reglas de SKIP y retención de honoríficos. Las fuentes incluyen frases en japonés e inglés de Tatoeba (CC-BY 2.0 FR), escenas sintéticas escritas por el profesor y plantillas de ruido OCR y créditos. No se usaron páginas ni escaneos de manga con derechos de autor. El dataset de entrenamiento no está publicado. La v2 se centró en corregir modos de fallo de la v1: traducción inglés→indonesio, preservación de bocadillos solo con puntuación (`…？`, `!?`), omisión limpia de residuos de OCR y líneas de créditos, y mantenimiento de `先生`/`先輩` como `Sensei`/`Senpai`.

## Capacidades

- Traducción de texto OCR de manga de japonés o inglés a indonesio o inglés, en el formato JSON exacto del modo OCR de KZRS.
- Emisión de salida JSON estructurada con las mismas claves que la entrada y valor `"SKIP"` para efectos de sonido, cartelas de nombres, créditos y basura de OCR.
- Preservación de honoríficos japoneses (por ejemplo, `先生` → `Sensei`, `先輩` → `Senpai`).
- Gestión de bocadillos compuestos solo por puntuación, que se conservan en lugar de omitirse.
- Soporte de un glosario opcional `_names` en la salida.
- Capacidad de seguir instrucciones de formato estrictas (prompt `build_ocr_prompt` de KZRS).
- Multilingüe limitado a los tres idiomas declarados: japonés, inglés e indonesio.
- No se ha validado para chat general ni para otras plantillas de prompt distintas de la de KZRS.

## Casos de uso

- Traducción automatizada de manga japonés→indonesio: el modelo recibe el JSON de OCR de KZRS y devuelve las traducciones en el mismo esquema, con lo que se integra directamente en el pipeline de `kzrs translate` sin postprocesado de formato; su 100 % de validez JSON evita roturas en el flujo.
- Traducción inglés→indonesio de cómics occidentales: la v2 incorpora datos específicos para esta dirección (por ejemplo, en Pepper&Carrot alcanza 36/36 JSON válidos), lo que la hace adecuada para digitalizar cómics en inglés hacia el mercado indonesio.
- Limpieza y filtrado de OCR en escaneos ruidosos: el modelo distingue texto narrativo de residuos de OCR, líneas de créditos y cartelas, emitiendo `"SKIP"` con una precisión del 98,2 % en páginas reales, lo que reduce el trabajo manual de revisión.
- Localización de efectos de sonido y onomatopeyas: los bocadillos de SFX se marcan como `"SKIP"` de forma consistente, permitiendo que un paso posterior (humano o herramienta gráfica) los trate por separado.
- Preservación de honoríficos en la traducción: mantiene `Sensei` y `Senpai` como términos independientes, útil para editoriales que exigen conservar la terminología japonesa en la versión indonesia o inglesa.
- Despliegue local en estaciones de trabajo de traducción: con cuantizaciones Q4_K_M o Q5_K_M cabe en GPU de consumo y puede servirse con llama.cpp en un equipo modesto, sin depender de APIs externas ni enviar material con posibles restricciones a terceros.
- Integración en un servidor compatible con OpenAI: mediante `vllm serve` o `llama-server`, se puede exponer como endpoint y conectar herramientas de gestión de proyectos de traducción que ya hablen el protocolo OpenAI.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo base, la v1, la v2 y el profesor Qwen3.8-27B-FP8 en tres suites: sintética (32 fragmentos / 67 ítems), cómics en inglés Pepper&Carrot (36 fragmentos / 68 ítems) y 5 páginas reales de manga japonés (30 fragmentos / 163 ítems).

| Suite / metrica | Gemma 4 E2B-it (base) | KazeGemPT v1 | KazeGemPT v2 | Qwen3.8-27B-FP8 (profesor) |
|---|---:|---:|---:|---:|
| Las 3 suites — JSON valido | — | 96/98 (98,0 %) | 98/98 (100,0 %) | 88/98 (89,8 %) |
| Sintetica — JSON valido | 32/32 | 32/32 | 32/32 | 32/32 |
| Sintetica — SKIP vs GT (ID / EN) | 0/15 / 0/15 | 15/15 / 15/15 (SKIP erroneos: 1/1) | 15/15 / 15/15 (SKIP erroneos: 0/0) | 11/15 / 8/15 |
| Sintetica — chrF vs GT (ID / EN) | 59,9 / 70,5 | 63,6 / 68,1 | 63,6 / 70,5 | 63,1 / 74,6 |
| Sintetica — SKIP acc / chrF vs profesor | — | 90,3 % / 69,3 | 91,8 % / 68,6 | 100 % / 100 (ref.) |
| Pepper&Carrot (EN) — JSON valido | 35/36 | 34/36 (94,4 %) | 36/36 (100,0 %) | 30/36 |
| Pepper&Carrot — SKIP acc / chrF vs profesor | — | 86,6 % / 63,0 (82 ítems) | 80,0 % / 62,6 (90 ítems) | 100 % / 100 (ref.) |
| Páginas reales (JA) — JSON valido | — | 30/30 | 30/30 | 26/30 |
| Páginas reales — SKIP acc vs profesor | — | 89,6 % (P 99,2 / R 82,4) | 98,2 % (P 100,0 / R 96,9) | 100 % (ref.) |
| Páginas reales — chrF vs profesor (All / ID / EN) | — | 64,8 / 66,2 / 63,7 | 65,1 / 70,0 / 61,4 | 100 (ref.) |
| Dev v2 held-out (28 fragmentos) — chrF / punt. / 先生・先輩 | — | 67,6 / 0/7 / 10/11 | 69,4 / 7/7 / 11/11 | ref. |

Nota de la model card: el profesor ejecutó con thinking activado (límite de 8192 tokens) y agotó tokens en 10 de 66 fragmentos difíciles de Pepper&Carrot y páginas reales, lo que explica parte de sus fallos de validez JSON.

## Requisitos de hardware

- VRAM estimada: con 5,1 mil millones de parámetros, en bf16 se requieren aproximadamente 10-11 GB solo para pesos; en Q8_0 unos 5,5-6 GB; en Q4_K_M unos 3-3,5 GB; en Q2_K alrededor de 2 GB. Estas cifras son estimaciones por tamaño y cuantización, no medidas publicadas.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB) o A100/H100 con holgura; para cuantizaciones Q4-Q8, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: sí, en Q4_K_M o Q5_K_M en tarjetas de 8-12 GB; en Q2_K podría ejecutarse incluso en GPUs de 4-6 GB o en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja --reasoning off`), vLLM (`vllm serve kouzen-neo/KazeGemPT-E2B-it-v2`), cualquier servidor compatible con la API de OpenAI, y transformers con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KazeGemPT-E2B-it-v2 | 5,1 B | no disponible | Traducción manga JA/EN→ID/EN en JSON KZRS | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| KazeGemPT-E2B-it (v1) | 5,1 B | no disponible | Igual, versión anterior | Apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | ~5,1 B | no disponible | Modelo multimodal generalista | Apache-2.0 (según la card del derivado) | Hugging Face |
| Qwen3.8-27B-FP8 (profesor) | 27 B (FP8) | no disponible | Traducción y generación de escenas, usado como teacher | Apache-2.0 | Hugging Face |

La comparación relevante es frente a la v1: la v2 mejora la validez JSON (98/98 frente a 96/98), la precisión de SKIP en páginas reales (98,2 % frente a 89,6 %) y el chrF hacia indonesio en páginas reales (70,0 frente a 66,2), a costa de ligeros descensos en chrF hacia el profesor en sintética (-0,7) y Pepper&Carrot (-0,4), y en chrF hacia inglés en páginas reales (61,4 frente a 63,7). Frente al modelo base, la diferencia es sustancial: el base obtiene 0/15 en SKIP sintético y chrF de 59,9/70,5, mientras que la v2 alcanza 15/15 y 63,6/70,5.

## Limitaciones y advertencias

- La precisión de SKIP en el cómic inglés Pepper&Carrot es del 80,0 % (90 ítems, P 72,7 % / R 72,7 %), inferior al 86,6 % de la v1 (medido sobre 82 ítems); la v1 falló el parseo JSON en los 2 fragmentos más difíciles que la v2 sí procesó.
- El chrF de diálogo frente al profesor es ligeramente inferior al de la v1 en dos conjuntos: sintética (68,6 frente a 69,3) y Pepper&Carrot (62,6 frente a 63,0); el chrF hacia inglés en páginas reales también baja (61,4 frente a 63,7).
- Modelo de clase 2B: conviene revisar siempre las salidas en modismos, jerga, bloques largos de créditos y OCR muy corrupto.
- El alcance de formato es específico: está ajustado para el prompt JSON de OCR de KZRS; el chat general y otras plantillas de prompt no han sido probados.
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad y la auditoría de sesgos.
- Riesgo de alucinación en textos ambiguos o muy degradados; la lógica de SKIP puede omitir contenido legítimo si el OCR es confuso.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-E2B-it y las atribuciones de Tatoeba (CC-BY 2.0 FR) si se redistribuyen datos derivados.
- Solo cubre japonés, inglés e indonesio; no hay soporte declarado para otras lenguas.
- El modo de razonamiento debe desactivarse (`--reasoning off` o `enable_thinking=False`); dejarlo activo puede degradar el formato de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-v2
- Cuantizaciones GGUF: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-v2-GGUF
- Versión 1: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Profesor (Qwen3.8-27B-FP8): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Tatoeba (fuente de datos, CC-BY 2.0 FR): https://tatoeba.org
