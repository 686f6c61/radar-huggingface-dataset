# na0x2c6/Apex-35B-V1.0-GGUF

## Resumen

Apex-35B-V1.0-GGUF es un repositorio de cuantizaciones GGUF del modelo Apex-35B-V1.0, desarrollado originalmente por Apexintelligence-AI y cuantizado por el usuario na0x2c6. El modelo base es un LLM conversacional de 35,5 mil millones de parámetros orientado a japonés e inglés, y este repo ofrece una cuantización experimental de tamaño reducido pensada para ejecutarse en hardware modesto sin degradar demasiado la calidad respecto al BF16 original.

La aportación principal del repositorio es un archivo IQ3_XXS modificado ("exps-down3-hq") de 15,6 GB que aplica cuantización de mayor precisión a los tensores no pertenecientes a los expertos enrutados (atención, atención lineal, experto compartido y proyección MTP), dejando los expertos en IQ3_XXS/IQ3_S. Según las mediciones de divergencia KL del propio autor, este archivo mejora ligeramente el IQ3_XXS estándar de bartowski con un tamaño menor.

Cabe destacar que se trata de una publicación experimental: la evaluación se limita a divergencia KL sobre textos cortos en japonés e inglés, sin benchmarks de tareas, sin pruebas de contexto largo y sin mediciones de velocidad. El modelo resulta relevante para usuarios que necesiten ejecutar Apex-35B en CPUs o GPUs con poca VRAM, especialmente en escenarios con texto japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con expertos enrutados (MoE), atención lineal (`ssm_*`), experto compartido y capa MTP (multi-token prediction); no disponible el detalle exacto del diseño |
| Parametros totales | 35.505.251.456 (≈35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS-exps-down3-hq (propio del repo); el modelo base existe en BF16 y en quants de bartowski: Q8_0, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XXS |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

Del layout de cuantización se deduce que Apex-35B-V1.0 es un modelo híbrido que combina atención estándar con atención lineal (tensores `ssm_*`), un conjunto de expertos enrutados (MoE) con un experto compartido, y una capa de predicción multi-token (MTP, `nextn.eh_proj`) que en llama.cpp aparece como bloque adicional `blk.40`. Esta capa MTP no se ejecuta durante las mediciones de calidad del repo. No hay información publicada en el repo sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

En cuanto a la cuantización de este repo: se calculó una matriz de importancia (imatrix) sobre un Q8_0 del modelo, usando 367 fragmentos de 512 tokens de los datos de calibración de bartowski (`calibration_datav3`) y del conjunto ja/en C4 de TFMC (aproximadamente un 9 % de japonés). Parte de los datos se envolvió en formato ChatML, incluyendo marcadores `<think>` y ciclos de tool calling, para que los marcadores de chat y herramientas formen parte de las activaciones. La cuantización se realizó con llama.cpp build 11797 (commit `9b56ccf00d75`) en backend CPU.

## Capacidades

- Generación de texto conversacional (el repo está etiquetado como `conversational`).
- Soporte de razonamiento con marcadores `<think>` (la imatrix incluye estos marcadores en formato ChatML, lo que indica que el modelo base los utiliza).
- Soporte de tool calling / function calling (la imatrix incluye ciclos de llamada a herramientas).
- Capacidades bilingües japonés-inglés, con ligera orientación hacia el japonés según el autor.
- No hay información publicada sobre capacidades de visión, audio, agentes multi-paso ni benchmarks de código o matemáticas.

## Casos de uso

- Asistentes conversacionales en japonés: el modelo base está orientado a japonés e inglés y el repo prioriza la calidad en japonés, por lo que es adecuado para chatbots bilingües con énfasis en texto japonés.
- Ejecución local en hardware limitado: con 15,6 GB, el archivo IQ3_XXS-exps-down3-hq puede cargarse en una GPU de 24 GB o repartirse entre GPU y CPU vía llama.cpp.
- Agentes con llamadas a herramientas: el formato ChatML con marcadores de tool calling usado en la calibración sugiere que el modelo puede integrarse en flujos de function calling locales.
- Razonamiento paso a paso: la presencia de marcadores `<think>` permite modos de razonamiento explícito en aplicaciones de chat.
- Experimentación de cuantización: el repo incluye la imatrix, las reglas de tipos de tensor y los logs de perplejidad, útil como referencia para quien cuantice modelos MoE híbridos.
- Procesamiento de texto japonés offline: por licencia Apache 2.0 y formato GGUF, puede desplegarse en entornos sin conexión para resumen o redacción en japonés, sujeto a las limitaciones de calidad de una cuantización IQ3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación realizada es la divergencia KL de la distribución de siguiente token respecto al BF16, con contexto 1024 en CPU, sobre Wikipedia japonesa (wiki40b-ja test) e inglesa (wikitext-2 test):

| File | Tamaño (GB) | KLD medio ja / en | KLD 99,9 % ja / en | Mismo top token ja / en |
|---|---|---|---|---|
| Q8_0 (referencia) | 37,8 | 0,0197 / 0,0375 | 0,529 / 1,447 | 94,1 % / 93,7 % |
| bartowski Q4_K_L | 24,6 | 0,0473 / 0,0868 | 1,297 / 3,606 | 91,2 % / 90,1 % |
| bartowski Q4_K_M | 22,8 | 0,0572 / 0,0943 | 1,270 / 2,745 | 90,3 % / 89,4 % |
| bartowski Q4_K_S | 21,4 | 0,0637 / 0,0978 | 1,506 / 2,621 | 90,1 % / 89,1 % |
| bartowski IQ4_XS | 20,4 | 0,0728 / 0,0996 | 1,872 / 2,972 | 88,9 % / 89,2 % |
| bartowski IQ3_M | 19,4 | 0,1259 / 0,1922 | 2,530 / 4,328 | 85,1 % / 84,9 % |
| bartowski Q3_K_L | 18,7 | 0,1227 / 0,1906 | 2,672 / 4,884 | 85,5 % / 85,1 % |
| bartowski Q3_K_M | 17,8 | 0,1522 / 0,2088 | 2,499 / 4,276 | 83,7 % / 83,9 % |
| bartowski IQ3_XXS | 16,1 | 0,2203 / 0,3060 | 4,094 / 7,917 | 81,6 % / 81,6 % |
| IQ3_XXS-exps-down3-hq (este repo) | 15,6 | 0,2060 / 0,2832 | 4,154 / 5,296 | 82,2 % / 81,7 % |

## Requisitos de hardware

- VRAM/RAM estimada para el archivo del repo (IQ3_XXS-exps-down3-hq): unos 15,6 GB solo de pesos, más memoria para el contexto; en la práctica, alrededor de 18-20 GB de memoria total disponible.
- Cabe en una GPU consumer de 24 GB (RTX 3090 o RTX 4090) con contexto moderado, o puede descargarse parcialmente a CPU/RAM con llama.cpp.
- Para cuantizaciones mayores del modelo base: Q4_K_M (22,8 GB) requiere GPU de 24 GB con descarga parcial o configuraciones multi-GPU; Q8_0 (37,8 GB) requiere A100/H100 de 40-80 GB o gran cantidad de RAM en CPU.
- Despliegue: llama.cpp (formato probado, build 11797 o posterior); por extensión, herramientas basadas en llama.cpp como Ollama o LM Studio deberían funcionar con GGUF, aunque no hay confirmación explícita en el repo. No hay datos sobre vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles; el autor no midió velocidad y señala que la capa MTP no se ejecuta en las mediciones.
- El modelo base en BF16 (≈71 GB en FP16) requiere aceleradores de datacenter (A100/H100 80 GB) o CPU con mucha RAM.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Apex-35B-V1.0 (base) | 35,5B | no disponible | Apache 2.0 | safetensors y GGUF (bartowski) |
| Qwen3-32B (referencia de categoria) | 32,5B | 32k+ (no confirmado para comparar) | Apache 2.0 | safetensors y GGUF |
| Qwen3-30B-A3B (MoE, referencia) | 30,5B (≈3B activos) | 32k+ (no confirmado para comparar) | Apache 2.0 | safetensors y GGUF |

Nota: la comparación es orientativa por categoría de tamaño; no hay datos de rendimiento publicados para Apex-35B que permitan una comparación cuantitativa. La peculiaridad de Apex-35B frente a alternativas densas como Qwen3-32B es su arquitectura híbrida con expertos enrutados, atención lineal y capa MTP, cuyo detalle técnico completo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Evaluación experimental: solo se ha medido divergencia KL sobre textos cortos; no hay benchmarks de tareas, ni pruebas de contexto largo, ni mediciones de velocidad.
- La capa MTP no se ejecuta en las mediciones ni (aparentemente) en la inferencia estándar de llama.cpp, por lo que el beneficio de la predicción multi-token no está verificado en estos GGUF.
- La calidad a cuantización IQ3_XXS es notablemente inferior al BF16 (KLD medio 0,2060/0,2832 frente a 0,0197/0,0375 del Q8_0); para máxima fidelidad conviene usar Q4_K_M o superior.
- Sesgos conocidos: no disponibles; como todo LLM, puede reproducir sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; no hay datos publicados.
- Idiomas: orientado a japonés e inglés; el rendimiento en español u otros idiomas no está documentado y probablemente sea limitado.
- Licencia: Apache 2.0, sin restricciones para uso comercial, tanto en el repo de cuantización como en el modelo base.
- Los archivos de bartowski usados como referencia se descargaron el 2026-10-30; versiones posteriores podrían variar.

## Enlaces

- Repo de cuantización: https://huggingface.co/na0x2c6/Apex-35B-V1.0-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Cuants de bartowski (todos los tamaños): https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF
- Archivo principal del repo: https://huggingface.co/na0x2c6/Apex-35B-V1.0-GGUF/blob/main/Apex-35B-V1.0-IQ3_XXS-exps-down3-hq.gguf
- Datos de calibración de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Dataset de calibración japonés/inglés de TFMC: https://huggingface.co/datasets/TFMC/imatrix-dataset-for-japanese-llm
