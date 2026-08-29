# Huntfat/GPTOSS-120B-Uncensored-HauhauCS-Aggressive-huntfat

## Resumen

GPTOSS-120B-Uncensored-HauhauCS-Aggressive-huntfat es una variante "uncensored" (abliterada) del modelo GPT-OSS 120B de OpenAI, publicada por el usuario Huntfat a partir del trabajo original de HauhauCS. El modelo base, openai/gpt-oss-120b, es un modelo de lenguaje de código abierto con arquitectura de mezcla de expertos (MoE) de 117 mil millones de parámetros totales, de los cuales aproximadamente 5,1 mil millones se activan por pasada hacia adelante mediante enrutamiento top-4 entre 128 expertos. Soporta una ventana de contexto de 128.000 tokens.

La variante presentada elimina las capas de rechazo del modelo original mediante la técnica de abliteración, lo que reduce drásticamente las negativas del sistema y permite respuestas más directas. Se distribuye en formato GGUF con cuantización MXFP4, que es la precisión nativa del modelo base, por lo que no requiere ni recomienda re-cuantización adicional. El archivo pesa 61 GB y el repositorio completo 65,4 GB. Está pensado para su uso con llama.cpp, LM Studio, Ollama y otras herramientas compatibles con GGUF.

La relevancia de este modelo radica en ofrecer una alternativa sin restricciones para desarrolladores e investigadores que necesitan explorar comportamientos del modelo sin los filtros de seguridad habituales, manteniendo intactas las capacidades de razonamiento y generación del GPT-OSS 120B original. Su licencia Apache-2.0 permite uso comercial y modificación, aunque conviene revisar los términos del modelo base de OpenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos, enrutamiento top-4 |
| Parametros totales | 116.829.156.672 (~117B) |
| Parametros activos | ~5,1B por pasada hacia adelante |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | MXFP4 (precisión nativa, formato GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (MXFP4) |

## Arquitectura y entrenamiento

El modelo base GPT-OSS 120B de OpenAI emplea una arquitectura de mezcla de expertos con 128 expertos y enrutamiento top-4, lo que significa que solo 4 expertos se activan por token procesado. Esto permite un coste computacional relativamente bajo para un modelo de su tamaño. El entrenamiento original se realizó en precisión MXFP4, un formato de punto flotante de 4 bits con mantisa y exponente compartidos, que es la precisión nativa del modelo y la que se conserva en esta variante.

La modificación principal de esta versión es la abliteración, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. El autor indica que no se han modificado los datasets ni las capacidades del modelo, solo se han reducido las negativas. El resultado es un modelo "agresivo" que responde con menos restricciones. No se ha realizado ningún entrenamiento adicional ni ajuste fino; la abliteración es una operación puramente post-entrenamiento sobre los pesos.

## Capacidades

- Generación de texto y razonamiento: hereda todas las capacidades del GPT-OSS 120B original, incluyendo tareas de razonamiento complejo, matemáticas y comprensión lectora.
- Tareas agénticas: el modelo base está diseñado para agentes y tareas multi-paso, por lo que esta variante mantiene esa capacidad.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas, aunque la model card de esta variante no lo menciona explícitamente; se asume que la funcionalidad se conserva al no alterar los pesos de forma sustancial.
- Formato Harmony: requiere el flag `--jinja` en llama.cpp para activar el formato de respuesta Harmony, sin el cual el modelo no funciona correctamente.
- Sin censura: la abliteración reduce significativamente los rechazos, permitiendo respuestas sobre temas que el modelo original bloquearía.
- Multilingüe: solo se declara inglés como idioma soportado, aunque el modelo base puede tener cierta capacidad multilingüe residual.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y guionistas pueden usar el modelo para explorar tramas, diálogos o escenas que otros modelos rechazarían por contenido sensible, manteniendo la coherencia narrativa gracias a su ventana de 128K tokens.
- Investigación en alineación y seguridad: los investigadores pueden estudiar cómo se comporta un modelo sin capas de rechazo, comparando sus respuestas con el original para entender los mecanismos de seguridad y desarrollar mejores técnicas de mitigación.
- Desarrollo de chatbots con tono directo: empresas que necesitan asistentes virtuales con un estilo más franco y menos evasivo pueden desplegar este modelo en entornos controlados, usando el formato Harmony para estructurar las respuestas.
- Experimentación con MoE y cuantización MXFP4: desarrolladores interesados en el rendimiento de modelos MoE en precisión nativa pueden probar esta variante para medir latencia, throughput y calidad de salida en diferentes hardware.
- Automatización de tareas de razonamiento en entornos aislados: dado que el modelo base destaca en tareas agénticas, esta variante puede usarse en pipelines de razonamiento multi-paso donde se requiera una respuesta sin filtros, por ejemplo en análisis de datos o generación de informes internos.
- Despliegue local con herramientas compatibles con GGUF: al estar en formato GGUF, se puede integrar en aplicaciones que usan llama.cpp, LM Studio u Ollama, permitiendo inferencia local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, y no se han encontrado datos comparativos en las fuentes consultadas. Se recomienda consultar los benchmarks del modelo base openai/gpt-oss-120b para una referencia aproximada, aunque la abliteración puede alterar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF MXFP4 pesa 61 GB, por lo que se necesitan al menos 61 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB son suficientes. También es posible usar varias GPUs de menor capacidad con reparto de capas.
- Consumer GPU: no cabe en una sola GPU de consumo (la RTX 4090 tiene 24 GB, la RTX 5090 32 GB). Sin embargo, llama.cpp permite usar `--n-cpu-moe N` para descargar capas MoE a la CPU, reduciendo el requisito de VRAM a costa de velocidad.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Ollama y cualquier otra herramienta que cargue GGUFs. vLLM no se menciona en la documentación, pero podría ser compatible si soporta GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware y de la configuración de offload.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GPTOSS-120B-Uncensored (esta variante) | ~117B | ~5,1B | 128K | Apache-2.0 | GGUF MXFP4 |
| openai/gpt-oss-120b (original) | ~117B | ~5,1B | 128K | Apache-2.0 | Safetensors (MXFP4) |
| openai/gpt-oss-20b (versión pequeña) | ~20B | ~3,6B (aprox.) | 128K | Apache-2.0 | Safetensors |

La comparativa se limita a los modelos de la familia GPT-OSS, ya que no se dispone de datos de rendimiento para comparar con otros MoE como Mixtral 8x7B o Qwen MoE. La principal diferencia entre esta variante y el original es la eliminación de los rechazos; el resto de características técnicas son idénticas. La versión de 20B es una alternativa más ligera para entornos con menos recursos, aunque con menor capacidad.

## Limitaciones y advertencias

- Sesgos y contenido inapropiado: al eliminar los rechazos, el modelo puede generar contenido ofensivo, violento, sexual o ilegal. No es adecuado para aplicaciones orientadas al público general sin supervisión humana.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información. La ausencia de filtros no reduce este riesgo y puede hacer que las alucinaciones sean más difíciles de detectar.
- Idioma: solo se garantiza el inglés. El uso en otros idiomas puede producir resultados de menor calidad.
- Requisito del flag `--jinja`: el modelo no funciona correctamente sin activar el formato Harmony mediante este flag en llama.cpp. Otros clientes pueden requerir configuración adicional.
- Re-cuantización desaconsejada: el autor indica que MXFP4 es la precisión nativa y que re-cuantizar a otros formatos degradaría la calidad. No se recomienda convertir a FP16 o INT8.
- Compatibilidad: aunque se menciona compatibilidad con LM Studio y Ollama, no se detallan versiones específicas. Es posible que se requieran versiones recientes que soporten MXFP4.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo base es de OpenAI. Conviene revisar los términos de uso de OpenAI para el modelo GPT-OSS, aunque al ser open-weight, generalmente no hay restricciones adicionales.

## Enlaces

- Modelo en Hugging Face (Huntfat): https://huggingface.co/Huntfat/GPTOSS-120B-Uncensored-HauhauCS-Aggressive-huntfat
- Modelo original de HauhauCS: https://huggingface.co/HauhauCS/GPTOSS-120B-Uncensored-HauhauCS-Aggressive
- Repositorio de OpenAI GPT-OSS: https://github.com/openai/gpt-oss
- Página de aimodels.fyi con detalles del modelo: https://www.aimodels.fyi/models/huggingFace/gptoss-120b-uncensored-hauhaucs-aggressive-hauhaucs
- README en GitHub (Damacol): https://github.com/Damacol/hauhaucs-gptoss-120b-uncensored-hauhaucs-aggressiv/blob/main/README.md
