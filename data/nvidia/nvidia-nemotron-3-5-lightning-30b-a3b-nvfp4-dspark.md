# nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark

## Resumen

El modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark es un checkpoint de decodificacion especulativa (speculative decoding) desarrollado por NVIDIA para acelerar la inferencia de la familia Nemotron-3.5-Lightning-30B-A3B, un modelo de lenguaje hibrido LatentMoE de 30 000 millones de parametros con 3 000 millones activos, disenado para razonamiento, chat y flujos agénticos. Este checkpoint actua como "drafter" (modelo auxiliar) que genera candidatos de tokens que el modelo principal valida, reduciendo la latencia en entornos de baja concurrencia como DGX Spark y centros de datos.

El drafter DSpark es un modelo denso relativamente pequeno (967 millones de parametros totales, 615 millones no-embedding) con atencion GQA de ventana deslizante de 1024 tokens y un sesgo de attention sink. Se distribuye cuantizado en NVFP4 mediante NVIDIA Model Optimizer 0.45.0, y esta pensado para ser usado junto con el checkpoint principal NVFP4, no como modelo independiente. Su relevancia actual radica en que permite desplegar agentes de IA de larga duracion con menor latencia y mayor rendimiento en hardware Blackwell y Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense GQA (Dense MLP + GQA Attention) con ventana deslizante de 1024 y attention sink bias |
| Parametros totales | 967 M (615 M no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1 M tokens (heredada del modelo base) |
| Tipos de cuantizacion | NVFP4 |
| Idiomas soportados | Ingles, espanol, frances, aleman, italiano y japones |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint DSpark es un modelo denso con capas de MLP densas y atencion GQA (grouped-query attention). A diferencia del modelo base, que es un LatentMoE hibrido, el drafter utiliza una ventana deslizante de atencion de 1024 tokens en todas las capas y un sesgo de attention sink por cabeza, lo que le permite generar secuencias candidatas de forma semi-autoregresiva con un coste computacional reducido. Esta arquitectura esta especificamente optimizada para el algoritmo DSpark, que programa la confianza de la decodificacion especulativa para maximizar el ratio de aceptacion de tokens.

El entrenamiento del drafter se realizo con 66 000 millones de tokens, repetidos durante 2 epocas, utilizando unicamente los prompts de los datasets Nemotron-Post-Training-Dataset-v2 y v3 (sin usar las respuestas originales de GPT). Los datos son una mezcla de contenido automatico, manual y sintetico. El modelo base, por su parte, fue pre-entrenado con mas de 20 billones de tokens y posteriormente ajustado con datos de alta calidad curados y sinteticos, incluyendo una pequena proporcion de datos de question-answering y alineacion.

## Capacidades

- Decodificacion especulativa DSpark: genera multiples tokens candidatos en paralelo que el modelo principal valida, acelerando la inferencia hasta 4 veces en flujos de baja latencia.
- Generacion de texto y razonamiento: al ser un drafter del modelo Nemotron-3.5-Lightning-30B-A3B, hereda las capacidades de razonamiento, chat y ejecucion de tareas agénticas del modelo base.
- Soporte de tool calling y function calling: el modelo base incluye soporte para herramientas, y el drafter esta disenado para mantener ese comportamiento en produccion.
- Capacidades multilingues: soporta seis idiomas principales (ingles, espanol, frances, aleman, italiano y japones) gracias al modelo base.
- Compatibilidad con contexto largo: el modelo base admite hasta 1 M tokens de contexto, y el drafter esta pensado para trabajar dentro de esa ventana.
- Integracion con vLLM: el checkpoint esta optimizado para el runtime vLLM, lo que facilita su despliegue en infraestructuras existentes.

## Casos de uso

- Agentes de IA siempre activos en produccion: el drafter DSpark reduce la latencia de respuesta en agentes que ejecutan razonamiento multi-paso y tool calling de forma continua, lo que permite mantener conversaciones fluidas en entornos de atencion al cliente o asistentes virtuales.
- Despliegue en DGX Spark (GB10): el checkpoint esta especificamente ajustado para este hardware de NVIDIA, ofreciendo baja latencia en inferencia local para equipos de desarrollo y edge computing.
- RAG (Retrieval-Augmented Generation) de baja latencia: al acelerar la generacion de tokens, es adecuado para sistemas de pregunta-respuesta sobre grandes volumenes de documentos donde el tiempo de respuesta es critico.
- Razonamiento multi-step en centros de datos: en entornos Hopper con baja concurrencia, el drafter permite ejecutar cadenas de razonamiento complejas con menor coste por token generado.
- Generacion de codigo asistida: el modelo base tiene capacidades de generacion de codigo, y la decodificacion especulativa acelera la autocompletacion en IDEs y pipelines de CI/CD.
- Chat multilingue en tiempo real: el soporte de seis idiomas y la baja latencia hacen viable su uso en aplicaciones de mensajeria o soporte tecnico internacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el checkpoint DSpark en la informacion disponible. La model card del modelo base (Nemotron-3.5-Lightning-30B-A3B) menciona mejoras de rendimiento de hasta 4x en latencia gracias a la decodificacion especulativa, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros benchmarks para este drafter.

## Requisitos de hardware

- VRAM estimada: el drafter DSpark ocupa aproximadamente 1.3 GB en NVFP4 (según el tamano del repositorio). Sin embargo, al desplegarse junto con el modelo base NVFP4 de 30B, la VRAM total necesaria dependera del modelo principal; para el modelo base se estiman entre 20 y 30 GB segun la cuantizacion y la longitud de contexto.
- GPU recomendadas: NVIDIA Blackwell (incluido DGX Spark GB10) y NVIDIA Hopper. No se recomienda su uso en GPUs de generaciones anteriores.
- Compatibilidad con GPU de consumo: no se indica soporte explicito para GPUs consumer (como RTX 4090), aunque el tamano reducido del drafter podria permitir su ejecucion en ellas; sin embargo, el modelo base requiere mas VRAM de la que suele haber disponible en GPUs consumer.
- Opciones de despliegue: vLLM es el runtime soportado. No se mencionan otras opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; se espera una mejora de hasta 4x en latencia frente a la inferencia sin decodificacion especulativa, segun NVIDIA.

## Comparativa con modelos similares

El DSpark es un drafter especifico para decodificacion especulativa, por lo que no tiene comparables directos en el mercado abierto. Se puede comparar con la alternativa de usar el modelo base sin drafter:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (BF16) | 30B totales (3B activos) | 1M | OpenMDW-1.1 | Modelo base standalone |
| Nemotron-3.5-Lightning-30B-A3B (NVFP4) | 30B totales (3B activos) | 1M | OpenMDW-1.1 | Modelo base cuantizado |
| Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark | 967M (drafter) | 1M (heredado) | OpenMDW-1.1 | Drafter para decodificacion especulativa |

Otras alternativas de decodificacion especulativa como Medusa o EAGLE no son directamente comparables porque se aplican a modelos distintos y no se han publicado datos de rendimiento relativos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo independiente: el checkpoint DSpark requiere el modelo base Nemotron-3.5-Lightning-30B-A3B (en version BF16 o NVFP4) para funcionar; no puede generar texto por si solo.
- Dependencia de hardware especifico: esta optimizado para Blackwell y Hopper; su rendimiento en otras arquitecturas puede verse degradado o no ser compatible.
- Licencia OpenMDW-1.1: aunque permite uso comercial, es necesario revisar los terminos completos de la licencia en openmdw.ai/license/1-1 antes de su despliegue en produccion.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo o con contexto largo.
- Sesgos y limitaciones de idioma: aunque soporta seis idiomas, el rendimiento puede variar entre ellos; los datos de entrenamiento del drafter provienen principalmente de prompts en ingles, lo que podria afectar a la calidad en otros idiomas.
- Sin benchmarks publicados: no hay datos de rendimiento verificables de forma independiente para este checkpoint, lo que dificulta la evaluacion objetiva antes de su adopcion.
- Restricciones de despliegue: el runtime soportado es exclusivamente vLLM; otros frameworks de inferencia pueden no ser compatibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Paper DSpark: https://huggingface.co/papers/2607.05147
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Blog de NVIDIA sobre Nemotron 3.5 Lightning: https://developer.nvidia.com/blog/nvidia-nemotron-3-5-lightning-delivers-fast-accurate-specialized-task-execution-for-long-running-agents/
- Pagina de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
