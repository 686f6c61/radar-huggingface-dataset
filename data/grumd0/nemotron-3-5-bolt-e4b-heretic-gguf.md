# grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Heretic-GGUF es una versión cuantizada en formato GGUF de un derivado "abliterated" del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 de NVIDIA, que a su vez es un post-entrenamiento del modelo google/gemma-4-E4B-it. El autor de esta conversión y modificación es el usuario grumd0, que aplicó la herramienta Heretic para reducir la dirección de rechazo (refusal direction) del modelo base mediante una técnica de abliteración de rango arbitrario (Arbitrary-Rank Ablation, ARA). El resultado es un modelo de 7.463.013.674 parámetros totales (aproximadamente 7,46 mil millones) que mantiene la arquitectura del modelo original pero con una drástica reducción de negativas a peticiones.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, la familia Nemotron de NVIDIA, orientada a modelos compactos con buen rendimiento en razonamiento y generación de texto; por otro, la práctica de la abliteración, que busca eliminar el comportamiento de rechazo aprendido durante el alineamiento. El repositorio incluye múltiples cuantizaciones (desde BF16 de 14,94 GB hasta UD-Q2_K_XL de 3,72 GB) con métricas de divergencia KL frente al modelo original, lo que permite evaluar el coste de cada nivel de compresión.

El modelo está pensado para generación de texto conversacional en 34 idiomas, con licencia OpenMDW 1.1 heredada de NVIDIA y con la particularidad de que el modelo upstream (gemma-4-E4B-it) está bajo Apache 2.0. No se dispone de información sobre la longitud de contexto ni sobre detalles del entrenamiento original en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, post-entrenado sobre gemma-4-E4B-it) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, UD-Q8_K_XL, Q8_0, UD-Q6_K_XL, UD-Q5_K_XL, UD-Q4_K_XL, UD-Q3_K_XL, UD-Q2_K_XL (Q6_K y Q4_K_M fueron retirados por peor calidad que cuantizaciones menores) |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh (34 idiomas) |
| Licencia | openmdw-1.1 (OpenMDW License Agreement, version 1.1) |
| Formato de pesos | GGUF (llama.cpp); safetensors BF16 disponible en el repositorio base grumd0/Nemotron-3.5-Bolt-E4B-Heretic |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo deriva de NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, que a su vez es un post-entrenamiento de google/gemma-4-E4B-it. El nombre "E4B" sugiere una variante de eficiencia de la familia Gemma 4, pero no se confirma en la información disponible si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica principal de esta ficha es la abliteración mediante Heretic con el modificador Arbitrary-Rank Ablation (ARA). Según los parámetros publicados, la ablación se aplica entre las capas 12 y 27 (`start_layer_index` = 12, `end_layer_index` = 27), con un peso de preservación de buen comportamiento de 0,523, un peso de dirección de mal comportamiento de 0,000238, un peso de sobrecorrección relativa de 0,749 y un `neighbor_count` de 14. La conversión a GGUF y la cuantización se realizaron con llama.cpp, y las recetas de cuantización dinámica `UD-*_K_XL` reutilizan la matriz de importancia de los cuantizados de Unsloth para el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `text-generation` y tag `conversational`.
- Reducción drástica del comportamiento de rechazo: en JailbreakBench Harmful pasa de 89/100 rechazos en el modelo base a 3/100 en este modelo; en XSTest Unsafe de 155/200 a 32/200.
- Soporte multilingüe en 34 idiomas, incluyendo español, inglés, alemán, francés, italiano, portugués, ruso, chino, japonés, coreano, árabe, hindi y la mayoría de lenguas europeas.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Formato GGUF optimizado para llama.cpp, con cuantizaciones dinámicas que preservan la calidad en tamaños reducidos.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre alineamiento y abliteración: el modelo permite estudiar empíricamente el efecto de eliminar la dirección de rechazo, con métricas de divergencia KL y tasas de rechazo publicadas para cada cuantización, lo que facilita comparaciones controladas.
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o narrativa que aborden temas sensibles sin las negativas sistemáticas del modelo base, adecuado para autores que necesitan explorar temas oscuros o controvertidos.
- Despliegue en hardware de consumo: las cuantizaciones UD-Q4_K_XL (5,03 GB) y UD-Q3_K_XL (4,20 GB) permiten ejecutar el modelo en GPUs de gama media con 6-8 GB de VRAM mediante llama.cpp u Ollama, manteniendo una divergencia KL moderada (0,0416 y 0,1283 respectivamente) frente al BF16.
- Atención al cliente y asistentes conversacionales: con 34 idiomas soportados y formato GGUF, se puede integrar en servicios de chat multilingües desplegados en servidores modestos, aunque la reducción de rechazos exige filtros de seguridad externos.
- Prototipado rápido en local: la disponibilidad de cuantizaciones desde 3,72 GB permite probar el modelo en portátiles o estaciones de trabajo sin GPU dedicada de gran tamaño, usando llama.cpp con backend CPU o GPU integrada.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de KLD y coincidencia de token top para cada archivo, lo que lo convierte en un caso de estudio para medir el impacto de la cuantización dinámica con matriz de importancia.
- Generación de contenido multilingüe para mercados locales: el soporte de idiomas como checo, croata, estonio, letón, lituano, esloveno o eslovaco cubre nichos poco atendidos por otros modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de rechazo y divergencia KL:

| Metrica | Modelo base | Este modelo |
|---|---:|---:|
| JailbreakBench Harmful (rechazos) | 89/100 | 3/100 |
| JailbreakBench Benign (rechazos) | 18/100 | 0/100 |
| XSTest Unsafe (rechazos) | 155/200 | 32/200 |
| KL divergence (harmless_alpaca) | 0 | 0,0859 |

Calidad de cuantización (KLD frente a BF16 de este modelo y frente a BF16 de NVIDIA, medida con `llama-perplexity --kl-divergence` en 100 × 512 tokens de wikitext-2 test):

| Archivo | Tamano | KLD vs Heretic BF16 | Mismo token top | KLD vs NVIDIA BF16 | Mismo token top |
|---|---:|---:|---:|---:|---:|
| BF16 | 14,94 GB | 0 | 100% | 0,0969 | 87,95% |
| UD-Q8_K_XL | 8,13 GB | 0,0045 | 97,45% | 0,1007 | 87,85% |
| Q8_0 | 7,97 GB | 0,0077 | 96,59% | 0,1025 | 87,68% |
| UD-Q6_K_XL | 7,23 GB | 0,0079 | 96,58% | 0,1035 | 87,66% |
| UD-Q5_K_XL | 5,80 GB | 0,0154 | 95,25% | 0,1070 | 87,53% |
| UD-Q4_K_XL | 5,03 GB | 0,0416 | 91,93% | 0,1307 | 86,27% |
| UD-Q3_K_XL | 4,20 GB | 0,1283 | 86,25% | 0,2113 | 82,61% |
| UD-Q2_K_XL | 3,72 GB | 0,3669 | 77,30% | 0,4401 | 75,15% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más un margen para el contexto y el grafo de computación. Con UD-Q4_K_XL (5,03 GB) se necesitan en torno a 6-7 GB de VRAM; con UD-Q8_K_XL (8,13 GB) en torno a 9-10 GB; con BF16 (14,94 GB) en torno a 16-18 GB.
- GPU recomendadas: para BF16, A100, H100 o RTX 4090 (24 GB); para UD-Q8_K_XL, RTX 4080/4090 o A10; para UD-Q4_K_XL, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Cabe en GPU de consumo: sí, en configuraciones desde 6 GB de VRAM con UD-Q3_K_XL o UD-Q4_K_XL; también en CPU mediante llama.cpp con las cuantizaciones menores.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (a partir del GGUF), servidores compatibles con endpoints (tag `endpoints_compatible`). No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Heretic-GGUF (este) | 7,46 B | no disponible | OpenMDW 1.1 | GGUF | Abliterado, 34 idiomas, cuantizaciones dinámicas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | no disponible | no disponible | OpenMDW 1.1 | safetensors | Modelo base sin abliterar; rechaza 89/100 en JailbreakBench Harmful |
| grumd0/Nemotron-3.5-Bolt-E4B-Heretic | 7,46 B | no disponible | OpenMDW 1.1 | safetensors | Mismo modelo en BF16, sin cuantizar |
| unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | no disponible | no disponible | OpenMDW 1.1 | GGUF | Cuantizaciones del modelo base sin abliterar; fuente de la receta UD-*_K_XL |

No se dispone de datos de benchmarks estándar para comparar rendimiento entre estos modelos más allá de las métricas de rechazo y KLD ya presentadas.

## Limitaciones y advertencias

- Modelo abliterado y sin censura: puede cumplir peticiones que el modelo base rechaza, incluyendo contenido potencialmente dañino, sesgado o inexacto. El autor advierte explícitamente de este riesgo.
- No es un producto de NVIDIA ni de Google y se distribuye sin garantía.
- Riesgo de alucinación: no se documentan métricas de fidelidad factual; la abliteración puede afectar a la calibración del modelo.
- La divergencia KL de 0,0859 frente al modelo base (medida en harmless_alpaca) indica que el comportamiento no es idéntico al original, incluso en prompts benignos.
- Las cuantizaciones agresivas (UD-Q3_K_XL y UD-Q2_K_XL) presentan una divergencia KL elevada (0,1283 y 0,3669) y una coincidencia de token top baja (86,25% y 77,30%), lo que puede degradar la calidad de forma notable.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial; el modelo upstream gemma-4-E4B-it está bajo Apache 2.0, pero el post-entrenamiento de NVIDIA introduce la licencia OpenMDW.
- No se dispone de información sobre la longitud de contexto, lo que impide garantizar conversaciones de contexto largo.
- El soporte de 34 idiomas proviene de las etiquetas del repositorio, pero no se aportan métricas de calidad por idioma.
- Para producción, se recomienda añadir capas de filtrado y moderación externas dado el comportamiento permisivo del modelo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Repositorio Hugging Face (BF16 safetensors): https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo upstream Google: https://huggingface.co/google/gemma-4-E4B-it
- Cuantizaciones de Unsloth del modelo base: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
