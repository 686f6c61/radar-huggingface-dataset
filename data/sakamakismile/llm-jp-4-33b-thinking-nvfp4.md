# sakamakismile/llm-jp-4-33b-thinking-NVFP4

## Resumen

Este repositorio contiene una cuantización NVFP4 (W4A4, grupo 16) del modelo japonés de razonamiento llm-jp/llm-jp-4-33b-thinking, desarrollado por el LLM勉強会 de la国立情報学研究所 (NII). El autor, sakamakismile, distribuye únicamente los pesos cuantizados, reduciendo el tamaño de 66,5 GB a 21 GB, lo que permite ejecutar el modelo en dos tarjetas gráficas de 16 GB. La cuantización está optimizada para hardware Blackwell (SM120) y la librería vLLM v0.22.0, sin necesidad de indicar el flag de cuantización gracias a la detección automática de compressed-tensors.

El modelo base es un transformer denso de 33 mil millones de parámetros, 64 capas y un vocabulario de 196 608 tokens, especializado en japonés y con una ventana de contexto de 64 000 tokens. La cuantización excluye únicamente la capa `lm_head`, manteniendo la arquitectura LlamaForCausalLM intacta. El resultado es un modelo de razonamiento japonés que responde en formato OpenAI Harmony (canales `analysis` y `final`), requiriendo el parser oficial del cookbook de LLM-jp para separar el razonamiento interno de la respuesta final.

La relevancia de este modelo radica en su capacidad para ejecutar inferencia de razonamiento en japonés en hardware de consumo (dos GPU de 16 GB) con un rendimiento medido de 167,3 tokens por segundo en configuración de 4 vías paralelas, manteniendo la calidad del modelo original gracias a una cuantización de baja pérdida. Es una opción práctica para desarrolladores que necesitan un modelo de razonamiento japonés desplegado localmente sin sacrificar demasiada precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Dense, 64 capas) |
| Parametros totales | 33.219.548.160 (33B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 64 000 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (comprimidos con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33 000 millones de parámetros con 64 capas, diseñado específicamente para el japonés mediante un tokenizador con vocabulario de 196 608 entradas. La cuantización NVFP4 aplica pesos de 4 bits y activaciones de 4 bits con agrupación de 16 elementos, excluyendo la capa `lm_head` para preservar la calidad de la salida. El proceso de cuantización se realizó con llm-compressor, utilizando 32 muestras de calibración de 8192 tokens del conjunto `neuralmagic/calibration`.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset o uso de RLHF/DPO), ya que ese dato pertenece a LLM-jp y no se detalla en la documentación proporcionada. La cuantización en sí no implica entrenamiento adicional, solo calibración. El autor advierte sobre un problema con el tokenizador personalizado (`llmjp4_tokenizer.py`) que en algunos entornos fragmenta el texto japonés en caracteres individuales; la calibración se realizó con el `tokenizer.json` original para evitar degradación de calidad.

## Capacidades

- Generacion de texto en japones con razonamiento interno (modo thinking) que se separa de la respuesta final mediante el parser oficial.
- Soporte de niveles de esfuerzo de razonamiento configurables por peticion: `low`, `medium` y `high`, que ajustan la profundidad del proceso de pensamiento.
- Formato de respuesta OpenAI Harmony con canales `analysis` y `final`, permitiendo distinguir el razonamiento de la salida al usuario.
- Capacidades multilingues limitadas al japones; el modelo esta optimizado para este idioma y puede tener un rendimiento inferior en otros.
- Generacion de texto conversacional y tareas de razonamiento como conteo de moras, analisis de metricas poeticas (haiku) y deteccion de irregularidades silabicas.
- No se documentan capacidades de tool calling, vision, audio ni agentes en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en japones: el modelo puede gestionar dialogos multi-turno con contexto largo (hasta 64k tokens) gracias a su ventana de contexto amplia, siendo adecuado para chatbots de atencion al cliente en empresas japonesas.
- Analisis de documentos largos en japones: con 64k tokens de contexto, puede procesar informes extensos, actas o articulos cientificos y generar resumenes o extraer informacion relevante con razonamiento.
- Generacion de contenido creativo en japones: el modo de razonamiento permite componer haikus, poemas o textos literarios con control metrico, como se observa en la verificacion del autor (deteccion de 5-7-5 en haikus).
- Educacion y practica de idioma japones: puede corregir ejercicios de morfologia, contar moras en palabras o analizar estructuras silabicas, util para herramientas de aprendizaje de japones.
- Razonamiento logico y matematico en japones: el modelo puede resolver problemas que requieren pasos de deduccion, aunque no se han publicado benchmarks especificos de matematicas.
- Despliegue en entornos con recursos limitados: al ocupar solo 21 GB, cabe en dos GPU de 16 GB, permitiendo ejecutar un modelo de razonamiento de 33B en estaciones de trabajo o servidores modestos con hardware Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones de rendimiento de inferencia en su entorno de pruebas:

| Metrica | Valor |
|---|---|
| Throughput total (TP=4, 32k contexto, KV fp8, RTX PRO 2000 Blackwell x4) | 43,1 t/s (1 via), 85,1 t/s (2 vias), 167,3 t/s (4 vias) |
| Prefill (8k prompt, prefix cache desactivado, 3 mediciones) | 3 597 tok/s |
| Verificacion de razonamiento (conteo de moras, effort=low) | 10/12 aciertos (frente a 11/12 del modelo generalista de 27B) |
| Verificacion de analisis de haiku (effort=high) | Deteccion correcta de 5-7-5 y de la irregularidad en un verso |

Estos datos son observaciones aisladas de un entorno especifico y no deben generalizarse como benchmarks formales.

## Requisitos de hardware

- VRAM estimada: 21 GB para los pesos cuantizados; con overhead de KV cache y activaciones, cabe en 2 tarjetas de 16 GB (32 GB totales) segun el autor.
- GPU recomendadas: tarjetas con arquitectura Blackwell (SM120), como la RTX PRO 2000 Blackwell. No es compatible con GPUs de generaciones anteriores (Ampere, Ada Lovelace) debido a la instruccion FP4.
- No cabe en GPU de consumo actuales (RTX 4090, 3090, etc.) porque no soportan NVFP4; se requiere hardware Blackwell profesional.
- Opciones de despliegue: vLLM v0.22.0 o superior con el parser oficial de llm-jp (`llmjp4_reasoning_parser.py`) incluido en el repositorio. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: medidos en el entorno del autor con TP=4 y 32k contexto: hasta 167,3 t/s de generacion y 3 597 tok/s de prefill. En sistemas sin P2P, se requiere `NCCL_P2P_DISABLE=1` y `--disable-custom-all-reduce`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware requerido |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking (base) | 33B denso | 64k | FP16/BF16 | Apache-2.0 | GPU con 66,5 GB de VRAM (multi-GPU) |
| llm-jp-4-33b-thinking-NVFP4 (este) | 33B denso | 64k | NVFP4 (W4A4) | Apache-2.0 | Blackwell SM120, 2x16 GB |
| llm-jp-4-32b-a3b-thinking | 32B total, 3B activos (MoE) | 64k | FP16/BF16 | Apache-2.0 | GPU con ~64 GB (o cuantizado) |
| llm-jp-4-32b-a3b-thinking-NVFP4 | 32B total, 3B activos (MoE) | 64k | NVFP4 (W4A4) | Apache-2.0 | Blackwell SM120, menor VRAM |

La comparativa muestra que este modelo ofrece el mismo rendimiento que el base en un espacio mucho menor, a costa de requerir hardware Blackwell. La version MoE (32B-a3B) es mas eficiente en inferencia al activar solo 3B parametros, pero su cuantizacion NVFP4 tambien esta disponible. No hay datos de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- La cuantizacion NVFP4 es exclusiva de hardware Blackwell (SM120); no funcionara en GPUs de generaciones anteriores, lo que limita su portabilidad.
- El tokenizador personalizado (`llmjp4_tokenizer.py`) puede fragmentar el texto japones en caracteres individuales en algunos entornos; se recomienda usar el `tokenizer.json` original para calibracion y el parser oficial para inferencia.
- El modelo esta optimizado exclusivamente para japones; su rendimiento en otros idiomas puede ser significativamente inferior.
- No se han publicado benchmarks formales de calidad (MMLU, etc.), por lo que la degradacion de precision por la cuantizacion no esta cuantificada.
- La verificacion del autor es a pequena escala (12 palabras, 3 haikus, 1-2 repeticiones) y no permite generalizar sobre la capacidad real de razonamiento del modelo.
- El modelo base puede presentar sesgos propios de los datos de entrenamiento japoneses; la cuantizacion no corrige estos sesgos.
- Riesgo de alucinacion en tareas de razonamiento complejo, especialmente con niveles de esfuerzo bajos (`low`), donde la calidad puede disminuir.
- Para uso en produccion, es imprescindible integrar el parser oficial de llm-jp; sin el, el razonamiento interno se mezclara con la respuesta final.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/sakamakismile/llm-jp-4-33b-thinking-NVFP4
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking
- Cookbook oficial de llm-jp (parser de razonamiento): https://github.com/llm-jp/llm-jp-4-cookbook
- Version MoE cuantizada del mismo autor: https://huggingface.co/sakamakismile/llm-jp-4-32b-a3b-thinking-NVFP4
- Perfil del autor en HuggingFace: https://huggingface.co/sakamakismile
