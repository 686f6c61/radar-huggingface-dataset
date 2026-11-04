# mradermacher/naps-llama-3_1-8b-instruct-v01-GGUF

## Resumen

naps-llama-3_1-8b-instruct-v01-GGUF es la distribucion en formato GGUF del modelo NAPS-ai/naps-llama-3_1-8b-instruct-v01, un ajuste fino de Llama 3.1 8B Instruct orientado al idioma coreano y entrenado parcialmente con el dataset nayohan/math-gpt-4o-200k-ko. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, que ofrece tanto cuantizaciones estaticas (esta ficha) como versiones con imatrix en un repositorio separado.

El modelo resuelve el problema de ejecutar un LLM de 8.000 millones de parametros especializado en conversacion y matematicas en coreano sobre hardware de consumo, sin necesidad de GPU de datacenter. Al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners ligeros, y el rango de cuantizaciones va desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite desplegarlo desde portatiles modestos hasta estaciones de trabajo.

Es relevante ahora porque combina tres factores poco frecuentes en un mismo paquete: licencia Apache 2.0 (uso comercial sin restricciones adicionales), tamano de 8B manejable en consumer GPU y especializacion en coreano con foco en razonamiento matematico. No obstante, la informacion publicada sobre el modelo base es escasa y no incluye benchmarks ni detalles de entrenamiento, lo que limita la evaluacion objetiva de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128K, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); versiones imatrix en repositorio i1-GGUF |
| Idiomas soportados | coreano (ko) segun la model card; herencia multilingue de Llama 3.1 no verificada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repositorio base |
| Tamano del repositorio | 71,8 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Modelo base | NAPS-ai/naps-llama-3_1-8b-instruct-v01 |
| Dataset de ajuste | nayohan/math-gpt-4o-200k-ko |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, sin componentes MoE ni SSM. El ajuste fino lo realiza NAPS-ai partiendo de los pesos instruct oficiales de Meta, e incorpora el dataset nayohan/math-gpt-4o-200k-ko, un conjunto de aproximadamente 200.000 ejemplos de matematicas generados con GPT-4o y traducidos o adaptados al coreano. Esto sugiere un entrenamiento supervisado orientado a reforzar el razonamiento matematico y la conversacion en coreano.

No se dispone de informacion publica sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, la existencia de fases de RLHF o DPO adicionales, ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio GGUF es exclusivamente la plantilla estandar de mradermacher para cuantizaciones y no aporta detalles del entrenamiento original. El proceso de cuantizacion es estatico (convert_type: hf, quantize_version: 2), sin pesos imatrix en este repositorio; las versiones ponderadas estan en mradermacher/naps-llama-3_1-8b-instruct-v01-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en coreano, con formato instruct (chat multi-turno).
- Razonamiento matematico reforzado por el dataset math-gpt-4o-200k-ko, orientado a problemas de tipo competicion y calculo paso a paso.
- Comprension y generacion de codigo heredada de Llama 3.1 8B Instruct (no verificada especificamente en este ajuste).
- Soporte de tool calling y function calling heredado del modelo base Llama 3.1 Instruct, si bien no se documenta en la model card de este ajuste.
- Capacidad de agentes y razonamiento multi-paso: no documentada explicitamente para este ajuste.
- Capacidades multilingues: la model card solo declara coreano; el comportamiento en castellano, ingles u otros idiomas no esta verificado y podria degradarse respecto al base.
- No se documentan modos especiales (thinking mode, vision, audio) en la informacion disponible.

## Casos de uso

- Tutoria matematica en coreano: el modelo puede resolver problemas paso a paso y explicar el razonamiento en coreano, aprovechando el ajuste sobre math-gpt-4o-200k-ko. Adecuado para plataformas educativas dirigidas a estudiantes coreanos.
- Asistente conversacional en coreano para atencion al cliente: con 8B de parametros y cuantizacion Q4_K_M (5,0 GB) puede desplegarse en una unica GPU consumer y sostener conversaciones multi-turno con latencia baja.
- Generacion de contenido educativo en coreano: redaccion de ejercicios, soluciones y explicaciones matematicas para libros de texto o plataformas e-learning.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (3,3 GB) permite ejecutar el modelo en portatiles sin GPU dedicada mediante llama.cpp u Ollama, util para prototipado y demos offline.
- Procesamiento por lotes de consultas matematicas en coreano: con Q8_0 (8,6 GB) o f16 (16,2 GB) en una GPU de 24 GB se puede servir un endpoint de inferencia para clasificar y resolver problemas en lote.
- Base para ajuste fino adicional en coreano: al estar bajo Apache 2.0 y disponible en safetensors en el repositorio base, sirve como punto de partida para especializaciones verticales (legal, sanitario, financiero) en coreano.
- Investigacion sobre cuantizacion: la disponibilidad de 12 variantes de cuantizacion permite estudiar el impacto de la precision en tareas matematicas en coreano, comparando Q2_K frente a Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, KMMLU ni de ningun otro conjunto de evaluacion para el modelo base o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 3,3 GB
  - Q3_K_M: 4,1 GB
  - Q4_K_M: 5,0 GB
  - Q5_K_M: 5,8 GB
  - Q6_K: 6,7 GB
  - Q8_0: 8,6 GB
  - f16: 16,2 GB
- GPU recomendadas:
  - RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070: suficientes para Q4_K_M a Q8_0 con contexto moderado.
  - RTX 4090 24 GB: permite f16 completo o Q8_0 con contexto largo.
  - A100 40/80 GB y H100: sobredimensionadas para 8B, utiles para servir muchas peticiones concurrentes con vLLM o TGI.
- Cabe en consumer GPU: si, desde una GTX 1660 6 GB (Q3_K_M) hasta una RTX 4090 (f16). En iGPU o CPU, Q2_K y Q3_K_S son viables con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para ellos habria que usar los safetensors del repositorio base.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa para 8B en Q4_K_M, una RTX 4090 suele superar las decenas de tokens por segundo, pero no se ha medido para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| naps-llama-3_1-8b-instruct-v01 (este) | 8,03B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste coreano con foco matematico |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Base oficial, multilingue, con restricciones de licencia para >700M usuarios |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | safetensors, GGUF | Fuerte en matematicas y codigo, multilingue (incluye coreano) |
| Gemma 2 9B Instruct | 9,2B | 8K | Gemma Terms of Use | safetensors, GGUF | Buen rendimiento general, licencia con restricciones de uso |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de benchmarks del modelo objeto de esta ficha para comparar rendimiento numerico.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de la calidad del ajuste frente al Llama 3.1 8B Instruct original.
- Especializacion estrecha en coreano: la model card solo declara el idioma ko; el rendimiento en castellano, ingles u otros idiomas puede degradarse respecto al base y no esta verificado.
- Riesgo de alucinacion: como todo LLM de 8B, puede generar razonamientos matematicos plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Sesgos: no documentados por el autor; al derivar de Llama 3.1 y de un dataset generado con GPT-4o, puede heredar sesgos de ambos, incluyendo sesgos culturales del corpus coreano.
- Datos de entrenamiento generados sinteticamente: el dataset math-gpt-4o-200k-ko procede de GPT-4o, lo que puede introducir errores sistematicos y estilo de respuesta del modelo profesor.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que puede imponer obligaciones adicionales; conviene revisar la cadena de licencias antes de un despliegue comercial.
- Contexto no confirmado: aunque Llama 3.1 8B soporta 128K tokens, no se confirma que el ajuste conserve esa ventana; asumirla sin verificar puede provocar degradacion.
- Repositorio de 71,8 GB: descargar el repositorio completo es innecesario; conviene bajar solo la cuantizacion deseada.
- Fecha de actualizacion del repositorio (noviembre de 2026) posterior a la de creacion (marzo de 2025): puede indicar revisiones de las cuantizaciones; conviene verificar los hashes.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/naps-llama-3_1-8b-instruct-v01-GGUF
- Repositorio imatrix (quants ponderadas): https://huggingface.co/mradermacher/naps-llama-3_1-8b-instruct-v01-i1-GGUF
- Modelo base: https://huggingface.co/NAPS-ai/naps-llama-3_1-8b-instruct-v01
- Dataset de ajuste: https://huggingface.co/datasets/nayohan/math-gpt-4o-200k-ko
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#naps-llama-3_1-8b-instruct-v01-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
