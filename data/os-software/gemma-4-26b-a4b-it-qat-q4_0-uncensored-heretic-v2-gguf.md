# OS-Software/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF

## Resumen

OS-Software/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF es una version "decensored" (abliterada) del modelo Google Gemma 4 26B A4B IT, un modelo multimodal de Google DeepMind que acepta texto e imagen y genera texto. El modelo original fue optimizado con Quantization-Aware Training (QAT) y cuantizado a Q4_0, preservando una calidad similar a bfloat16 con una huella de memoria reducida. Esta version derivada ha sido procesada con la herramienta Heretic v2.0.0.dev0+custom para eliminar parcialmente la alineacion de seguridad del modelo base, reduciendo los rechazos de 100/100 a 0/100 en la evaluacion del autor.

La arquitectura es Mixture-of-Experts (MoE) con 25.233.142.046 parametros totales y aproximadamente 4.000 millones de parametros activos por token. El contexto soportado es de hasta 256.000 tokens, y el modelo mantiene soporte multilingue en mas de 140 idiomas segun la documentacion del modelo base. El repositorio contiene los pesos en formato GGUF (cuantizacion Q4_0) y ocupa 16,3 GB. Esta version esta pensada para investigacion en seguridad, alineacion y red-teaming, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~4.000 millones (A4B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | Mas de 140 segun la documentacion del modelo base (no especificado en la ficha del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, google/gemma-4-26B-A4B-it, es un modelo multimodal de Google DeepMind con arquitectura MoE: 26.000 millones de parametros totales de los cuales 4.000 millones se activan por token. Gemma 4 introduce mejoras en razonamiento, con un modo de pensamiento configurable, y soporta entradas de imagen y texto (audio en los modelos E2B, E4B y 12B). La ventana de contexto se amplia hasta 256.000 tokens y el modelo fue entrenado con datos multilingues que cubren mas de 140 idiomas.

La version QAT del modelo base fue entrenada con cuantizacion consciente (Quantization-Aware Training) para que los pesos Q4_0 mantengan una calidad cercana a bfloat16. Sobre ese checkpoint, OS-Software aplico la tecnica de abliteration de Heretic v2.0.0.dev0+custom, que modifica las capas 12 a 20 del modelo para reducir la probabilidad de rechazo de peticiones. Los parametros de abliteration incluyen un peso de preservacion de comportamiento bueno de 1.0, un peso de direccion de comportamiento malo de 0.0001, un rank de LoRA de 128 y componentes objetivo en attn.o_proj y mlp.down_proj. La divergencia KL respecto al modelo original es de 0.0101, lo que indica una alteracion relativamente pequena de la distribucion de salida.

## Capacidades

- Generacion de texto multimodal a partir de entradas de texto e imagen.
- Razonamiento avanzado con modo de pensamiento configurable ("thinking mode").
- Soporte de tool calling y function calling (segun las capacidades del modelo base Gemma 4).
- Capacidad para tareas de codigo y matematicas.
- Soporte multilingue en mas de 140 idiomas.
- Ventana de contexto de 256.000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Reduccion significativa de rechazos de seguridad: 0/100 en la evaluacion del autor, frente a 100/100 del modelo original.
- Sin soporte de audio en esta variante (solo texto e imagen, segun la documentacion del modelo base para el tamano 26B A4B).

## Casos de uso

- Investigacion en seguridad de IA: el modelo es util para estudiar como la abliteration afecta a los mecanismos de rechazo y para probar tecnicas de red-teaming en modelos con alineacion reducida.
- Estudios de alineacion: permite comparar el comportamiento del modelo original y el abliterado en tareas de seguridad, midiendo divergencias de distribucion y cambios en la tasa de rechazo.
- Evaluacion de robustez de sistemas de guardrails: se puede usar para estresar filtros de contenido y sistemas de moderacion, identificando que tipo de peticiones logran evadir las barreras.
- Experimentos de interpretabilidad: los cambios en las capas 12 a 20 ofrecen un caso de estudio para analizar donde residen los patrones de alineacion en un MoE de gran tamano.
- Generacion de contenido creativo sin restricciones: para entornos controlados de investigacion donde se necesita explorar temas sensibles sin rechazos automaticos.
- Desarrollo de tecnicas de "uncensoring" y "decensoring": el modelo sirve como referencia para comparar metodos de abliteration y sus efectos en la calidad de las respuestas.

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. La unica evaluacion publicada en la model card es la siguiente, centrada en la tasa de rechazo y la divergencia con el modelo original:

| Metrica | Este modelo | Modelo original (google/gemma-4-26B-A4B-it-qat-q4_0-unquantized) |
|---|---|---|
| Refusals | 0/100 | 100/100 |
| Divergencia KL | 0.0101 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-20 GB con cuantizacion Q4_0, dependiendo de la longitud del contexto y del tamaño del KV cache. El repositorio pesa 16,3 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para inferencia local con contexto moderado; A100 o H100 para cargas de trabajo con contextos largos o alta concurrencia.
- Compatibilidad con GPU de consumo: si, es viable en tarjetas con 16-24 GB de VRAM, aunque el rendimiento puede verse limitado por el ancho de banda de memoria al ser un modelo MoE.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con archivos GGUF. Para vLLM se recomienda usar el modelo base o las variantes en formato compressed-tensors, no esta version GGUF.
- Latencia y throughput: no se han publicado datos de rendimiento especificos para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it | 25.233.142.046 | 256.000 | safetensors / GGUF | Apache 2.0 | Modelo original con alineacion completa, incluye variantes QAT y compressed-tensors |
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF | 25.233.142.046 | 256.000 | GGUF (Q4_0) | Apache 2.0 | Version abliterada con Heretic v2, 0/100 refusals |
| SC117/gemma-4-26B-A4B-it-qat-heretic-GGUF | 25.233.142.046 | 256.000 | GGUF (Q4_0) | Apache 2.0 | Otra version abliterada con Heretic ARA, cuantizada en formato UD-Q4_K_XL |

No se dispone de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sufrido una reduccion sustancial de su alineacion de seguridad, por lo que es mas probable que genere contenido danino, inexacto, sesgado u ofensivo que el modelo original.
- Esta destinado exclusivamente a investigacion y experimentacion, incluyendo estudios de seguridad, alineacion y red-teaming. El autor desaconseja explicitamente desplegarlo en servicios publicos o orientados al usuario final.
- Todas las salidas deben tratarse como no confiables y verificarse de forma independiente antes de su uso.
- El usuario es responsable de evaluar la precision y adecuacion del contenido generado, implementar salvaguardas y supervision humana, y cumplir con las leyes, regulaciones, licencias y estandares eticos aplicables.
- OS-Software no ofrece garantias de ningun tipo y no asume responsabilidad por danos directos o indirectos, perdidas, mal uso o consecuencias legales derivadas de su uso.
- La licencia Apache 2.0 permite el uso comercial, pero el aviso del autor restringe el despliegue publico. Es necesario revisar la licencia del modelo base en https://ai.google.dev/gemma/docs/gemma_4_license para confirmar las condiciones completas.
- La evaluacion de rendimiento publicada se limita a la tasa de rechazo y la divergencia KL; no hay datos de calidad general, razonamiento o alucinacion para esta version.

## Enlaces

- Repositorio del modelo: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint unquantizado usado como referencia: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Proyecto Heretic: https://heretic-project.org
- Informe tecnico de Gemma 4: https://arxiv.org/abs/2607.02770
- Blog de lanzamiento de Gemma 4 QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- GitHub de Google Gemma: https://github.com/google-gemma
- Modelo comparable de SC117: https://huggingface.co/SC117/gemma-4-26B-A4B-it-qat-heretic-GGUF
