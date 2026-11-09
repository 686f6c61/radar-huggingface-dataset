# JRamirez-UAB/Qwen3.8-27B-DSpine-vLLM-quants

## Resumen

Qwen3.8-27B-DSpine-vLLM-quants es un conjunto de cuantizaciones comunitarias del modelo borrador (draft model) de decodificación especulativa `tencent/Qwen3.8-27B-DSpine-b16`, publicadas por el usuario JRamirez-UAB junto con un plugin experimental para vLLM. No se trata de un modelo autónomo de generación: es un drafter de 5 capas de la familia DFlash que propone bloques de tokens que un modelo objetivo (target) verifica después, de modo que la distribución de salida del modelo objetivo no se altera. Su función es acelerar la decodificación en producción sin degradar la calidad.

El modelo base es un drafter de bloques paralelo que añade un "code bridge" (cada fila recibe un mensaje con puerta de la fila anterior) y un refinamiento serial corto sobre los 16 mejores candidatos de cabeza. El repositorio incluye variantes INT4 (W4A16), INT8 (W8A16), FP8, NVFP4 y EXL3, además del plugin `vllm-dspine` necesario para cargarlo, ya que vLLM no soporta DSpine de forma nativa. La relevancia actual es práctica: ofrece ganancias medidas de velocidad de decodificación frente a la cabeza MTP del modelo objetivo en GPUs de un solo nodo.

El dato de parámetros reportado en safetensors es de 2.025.912.064 parámetros, muy por debajo de los 27B que sugiere el nombre del repositorio (que hace referencia a la arquitectura del modelo objetivo Qwen3.8-27B). El repositorio ocupa 14,2 GB e incluye los pesos en varias precisiones y el código del plugin. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer drafter de bloques (familia DFlash), 5 capas, con code bridge y refinamiento serial; requiere plugin `vllm-dspine` |
| Parametros totales | 2.025.912.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del objetivo; el drafter opera dentro de esa ventana) |
| Tipos de cuantizacion | W4A16, W8A16, FP8, NVFP4, EXL3 (exllamav3), compressed-tensors |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes cuantizadas para vLLM |

## Arquitectura y entrenamiento

El drafter DSpine es un modelo de 5 capas que propone bloques de tokens en paralelo, siguiendo el esquema DFlash. Sobre el borrador paralelo incorpora un mecanismo denominado "code bridge": cada fila recibe un mensaje con puerta procedente del código de la fila anterior, lo que aporta coherencia entre posiciones del bloque. Además aplica un refinamiento serial corto de la última escritura sobre los 16 mejores candidatos de cabeza. El puente, su codebook, las normas y los tensores de versión permanecen en BF16 en todas las ramas cuantizadas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; estos datos no están disponibles en la información proporcionada. La innovación destacable es la propia arquitectura de drafting con verificación por el modelo objetivo, junto con el soporte de decodificación especulativa sobre la ruta DFlash de vLLM mediante plugin. Las cuantizaciones a 4 bits no degradan la tasa de aceptación de forma medible: con 7 tokens de draft en A40, BF16 alcanza 4,29 tokens aceptados por paso, W4A16 4,32 y NVFP4 4,27.

## Capacidades

- Generación de tokens borrador para decodificación especulativa: no genera texto final por sí mismo, sino candidatos que el modelo objetivo verifica.
- Aceleración de decodificación en vLLM mediante la ruta DFlash y el plugin `vllm-dspine`.
- Soporte de tool calling en el pipeline completo: con la petición real de opencode se obtuvieron 18/18 llamadas válidas y correctas con 7 tokens de draft.
- Soporte de contexto largo: aguja encontrada a 31.812, 127.747 y 249.644 tokens de prompt, con el servidor estable.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`).
- Capacidades multilingües limitadas a español e inglés según la model card.
- Integración con cuantizaciones EXL3 mediante plugin exllamav3 y con GPTQ W4A16 del modelo objetivo.
- Orientado a tareas de sysadmin, Linux y opencode según los tags del repositorio.

## Casos de uso

- Servicio de inferencia de baja concurrencia: con 1 o 2 peticiones simultáneas y una programación de 7 tokens de draft, DSpine es entre un 15 % y un 44 % más rápido que la cabeza MTP 3 del objetivo en RTX PRO 6000, lo que lo hace adecuado para asistentes interactivos con pocos usuarios concurrentes.
- Aceleración de asistentes de código en producción: integrado en un pipeline con opencode, permite tool calling fiable (18/18 llamadas correctas) manteniendo la distribución de salida del modelo objetivo intacta.
- Despliegue en GPUs de 48 GB: en A40 y L40S ofrece ganancias de decodificación del 8 % al 15 % con 3 tokens de draft frente a MTP 2, útil para servir modelos de 27B cuantizados en hardware Ampere o Ada de gama media.
- Procesamiento de documentos largos: con contexto de hasta 262.144 tokens y aguja recuperada a 249.644 tokens, sirve para resúmenes y extracción sobre expedientes extensos con latencia de decodificación reducida.
- Experimentación en investigación sobre decodificación especulativa: las variantes W4A16, W8A16, FP8, NVFP4 y EXL3 permiten comparar tasas de aceptación y velocidad entre precisiones sobre el mismo drafter.
- Optimización de costes en servidores Blackwell: en RTX PRO 6000 la ganancia se mantiene con 1 a 4 peticiones, lo que reduce el coste por token generado en cargas moderadas.
- Validación de pipelines de tool calling y agentes: útil para probar flujos multi-paso donde la latencia de decodificación es el cuello de botella, con verificación de que la salida codiciosa coincide con la del modelo sin especulación en una proporción comparable a la MTP nativa de vLLM (34–41 % frente a 37,5 %).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tokens aceptados por paso, 1 peticion, temperatura 0, 3 draft tokens | 3,1–3,2 |
| Tokens aceptados por paso, 4 draft tokens | 3,5 |
| Tokens aceptados por paso, 5 draft tokens | 3,9 |
| Tokens aceptados por paso, 7 draft tokens | 4,3–4,4 |
| Tokens aceptados por paso, 15 draft tokens | 4,9 |
| Tokens aceptados por paso, MTP 2 (referencia) | 2,5 |
| Tokens aceptados por paso, MTP 3 (referencia) | 2,9 |
| Aceptacion A40, 7 draft tokens: BF16 / W4A16 / NVFP4 | 4,29 / 4,32 / 4,27 |
| Aceptacion A40, 3 draft tokens: BF16 / W4A16 / NVFP4 | 3,22 / 3,19 / 3,20 |
| Velocidad vs MTP 2, RTX PRO 6000, 3 draft tokens (1 / 8 peticiones t=0 / 8 t=1) | +18 % / +13 % / +14 % |
| Velocidad vs MTP 2, A40 con objetivo EXL3 | +12 % / +10 % / +5 % |
| Velocidad vs MTP 2, A40 con objetivo GPTQ | +15 % / +14 % / +27 % |
| Velocidad vs MTP 2, L40S | +8 % / +7 % / +6 % |
| Velocidad vs MTP 2, dos RTX 3090 en tensor parallel | sin ganancia clara (−2 % a −7 %) |
| Ganancia con 7 draft tokens, 1 peticion | hasta +57 % |
| Coincidencia de salida codiciosa con no especulacion | 34–41 % (frente a 37,5 % de la MTP de vLLM) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es un drafter y no un generador autónomo.

## Requisitos de hardware

- VRAM estimada: el drafter en W4A16 ocupa 1,7 GB según la model card; las variantes FP8 y BF16 requieren más memoria, aunque el dato exacto por variante no está disponible.
- GPU probadas: NVIDIA A40 (48 GB, Ampere), RTX PRO 6000 Blackwell Server Edition (96 GB, límite de 300 W, reloj limitado a 2.270 MHz), L40S (48 GB, Ada) y dos RTX 3090 (24 GB cada una, tensor parallel 2).
- Cabe en GPU de consumo: sí para el drafter, pero el modelo objetivo de 27B cuantizado (EXL3 3,85 bpw o GPTQ W4A16) condiciona el despliegue; en dos RTX 3090 no se observa ganancia.
- Despliegue: vLLM 0.33.0 con el plugin `vllm-dspine` 0.1.1 y exllamav3 1.6.6, o vLLM 0.31.0 con el plugin 0.1.0; requiere `pip install` del plugin en el entorno de vLLM. No es cargable por vLLM estándar.
- Configuración recomendada: caché KV en fp8, contexto de 262.144 tokens, prefix caching, hasta 8 secuencias.
- Latencia y throughput: ganancia de decodificación del 8 % al 44 % con 1 a 2 peticiones según GPU y objetivo; con 8 peticiones la ganancia es pequeña (−1 % a +12 %) y el menor pool de KV hace que las sesiones largas terminen más tarde que con MTP 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpine-vLLM-quants (este) | 2.025.912.064 (drafter) | 262.144 | 3,1–4,9 tokens aceptados/paso; +8 % a +44 % vs MTP 2/3 con 1–2 peticiones | Apache-2.0 | Hugging Face, plugin experimental |
| Cabeza MTP 2 del objetivo | no disponible | 262.144 | 2,5 tokens aceptados/paso | Apache-2.0 (Qwen3.8-27B) | nativa en vLLM |
| Cabeza MTP 3 del objetivo | no disponible | 262.144 | 2,9 tokens aceptados/paso | Apache-2.0 (Qwen3.8-27B) | nativa en vLLM |
| tencent/Qwen3.8-27B-DSpine-b16 (upstream) | no disponible | 262.144 | misma arquitectura; solo implementación SGLang | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo objetivo que verifique los tokens; no puede usarse para generar texto final por sí solo.
- Experimental y no cargable por vLLM estándar: depende del plugin `vllm-dspine`, que debe instalarse en el entorno de vLLM; solo se han probado las configuraciones indicadas (vLLM 0.31.0 y 0.33.0).
- En dos RTX 3090 con tensor parallel no aporta ganancia (−2 % a −7 %); en A40 solo gana con 1 o 2 peticiones en contexto largo.
- Con 8 peticiones concurrentes la ganancia es pequeña o negativa y el menor pool de KV puede alargar las sesiones largas frente a MTP 2.
- Riesgo de alucinación: no aplica directamente al drafter, ya que la verificación del objetivo preserva la distribución de salida; el riesgo recae en el modelo objetivo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas limitados a español e inglés según la model card.
- Licencia Apache-2.0 heredada, lo que permite uso comercial, pero se trata de una cuantización comunitaria no oficial de Tencent ni de Qwen, sin garantías de soporte.
- La cuantización a 4 bits no degrada la aceptación de forma medible, pero las variantes FP8 y NVFP4 requieren hardware compatible (Ampere o Blackwell según la variante).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Qwen3.8-27B-DSpine-vLLM-quants
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Pesos objetivo EXL3 3,85 bpw: https://huggingface.co/JRamirez-UAB/Swift-1.5-Qwen3.8-27B-EXL3-3.85bpw-24GB
- Plugin vllm-quantpack: https://pypi.org/project/vllm-quantpack/
- Plugin del repositorio: carpeta `plugin/` del repositorio de Hugging Face
