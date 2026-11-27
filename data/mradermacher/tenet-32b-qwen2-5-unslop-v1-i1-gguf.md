# mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF

## Resumen

Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF es la distribucion en formato GGUF, con cuantizacion de tipo imatrix (i1), del modelo Tenet-32B-Qwen2.5-Unslop-v1, desarrollado originalmente por mr-andrey-isachenko. Este repositorio lo publica mradermacher, un conocido creador de cuantizaciones para llama.cpp, y ofrece mas de veinte variantes de cuantizacion que van desde IQ1_S (7,4 GB) hasta Q6_K (27,0 GB), pensadas para ejecutar el modelo en hardware muy diverso, desde GPUs de consumo hasta estaciones de trabajo.

El modelo subyacente es un fine-tune de Qwen2.5-32B, una arquitectura transformer densa de aproximadamente 32.760 millones de parametros. Segun las etiquetas de la model card, el ajuste esta orientado a casos de uso agenticos, tool use, generacion de codigo y conversacion, e incorpora tecnicas de entrenamiento como GRPO y un proceso de "abliteration" que elimina los mecanismos de rechazo del modelo base (etiquetas "abliterated" y "uncensored"). La licencia es Apache 2.0.

La relevancia de esta ficha radica en que combina un modelo de 32B con licencia permisiva, capacidades agenticas y un ecosistema de cuantizaciones GGUF amplio, lo que permite desplegarlo en entornos locales o de servidor sin depender de APIs propietarias. No obstante, la informacion publica disponible es escasa: no hay datos de benchmarks, de composicion del dataset ni de longitud de contexto en la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien disponibles quants estaticos en el repo hermano |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Tenet-32B-Qwen2.5-Unslop-v1 parte de Qwen2.5-32B, un transformer denso con atencion por grupos (GQA) y RoPE, del que hereda la arquitectura. Sobre esa base se aplico un fine-tune cuyas etiquetas indican el uso de GRPO (Group Relative Policy Optimization, una variante de RL para razonamiento y alineamiento) y un proceso de abliteration que suprime las direcciones de activacion asociadas al rechazo de peticiones. El resultado se presenta como un modelo "uncensored" orientado a tareas agenticas y de codigo.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni la mezcla de datos utilizada en el fine-tune. Las cuantizaciones de este repositorio emplean el metodo i1 con fichero imatrix (matriz de importancia generada a partir de datos de calibracion), que segun el autor suele ofrecer mejor calidad que los quants estaticos de tamano equivalente. El repositorio incluye tambien el fichero imatrix para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas directas sin mecanismos de rechazo (abliterated).
- Generacion y asistencia de codigo, segun la etiqueta "coding" de la model card.
- Tool calling y function calling, segun la etiqueta "tool-use".
- Uso agentico y razonamiento multi-paso, segun la etiqueta "agentic".
- Capacidades derivadas del entrenamiento con GRPO, orientadas a tareas de razonamiento.
- Compatibilidad con vLLM y OpenRouter (etiquetas "vllm" y "openrouter"), lo que facilita su despliegue como endpoint compatible con la API de OpenAI.
- Soporte multilingue limitado: la model card declara unicamente ingles ("en").
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con buen seguimiento de instrucciones; su naturaleza abliterated lo hace adecuado para dominios donde el modelo base rechazaria consultas legitimas (por ejemplo, salud, legal o seguridad), aunque requiere supervision humana.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar parches o generar tests, desplegado con vLLM o llama.cpp detras de un servicio interno.
- Agentes autonomos de automatizacion: su etiqueta "agentic" y su capacidad de tool use permiten construir flujos multi-paso que consultan APIs, ejecutan comandos y encadenan acciones con verificacion intermedia.
- Asistente de desarrollo local: las cuantizaciones Q4_K_M (20 GB) o IQ4_XS (17,8 GB) permiten ejecutarlo en una unica GPU de 24 GB, ofreciendo un asistente de codigo privado sin enviar datos a terceros.
- Procesamiento de documentacion tecnica en ingles: generacion de resumenes, extraccion de entidades y reescritura de textos tecnicos, aprovechando su entrenamiento orientado a conversacion.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para analizar el efecto de la abliteration en la distribucion de respuestas y en la tasa de rechazo.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable en local, encaja en organizaciones que no pueden usar APIs externas por cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos, sin contar KV cache): IQ1_S ~7,4 GB; IQ2_M ~11,4 GB; IQ3_M ~14,9 GB; IQ4_XS ~17,8 GB; Q4_K_M ~20,0 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS, Q4_K_M y Q5_K_S; RTX 3090 (24 GB) en el mismo rango; A100 40/80 GB o H100 para Q5_K_M y Q6_K con contexto largo; configuraciones multi-GPU para FP16/BF16 completo.
- Cabe en GPU de consumo: si, con cuantizaciones IQ2 a Q5 en tarjetas de 12-24 GB; las variantes IQ1 e IQ2 de menor tamano permiten ejecucion parcial en CPU o GPUs de 8-12 GB con calidad degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM y TGI (segun la etiqueta "vllm").
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen2.5-Unslop-v1 (este) | 32,76B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune abliterated con GRPO y tool use |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF | Modelo oficial de referencia, con rechazo alineado |
| Qwen2.5-Coder-32B-Instruct | 32,5B | 32.768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF | Especializado en codigo, sin abliteration |
| Gemma-2-27B-it | 27B | 8.192 tokens | Gemma license | safetensors, GGUF | Menor contexto y licencia mas restrictiva |

La comparativa con Qwen2.5-32B-Instruct se basa en que Tenet deriva de esa familia; los datos de contexto del modelo base son los publicados por Alibaba, no los de este fine-tune, cuyo contexto no se documenta.

## Limitaciones y advertencias

- La abliteration elimina los rechazos, lo que aumenta el riesgo de generar contenido danino, ilegal o inseguro; no es recomendable exponerlo sin filtros en aplicaciones publicas.
- Riesgo de alucinacion inherente a los modelos de 32B; no se han publicado evaluaciones de fidelidad.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada; no asumir los 32K del modelo base sin validacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar las condiciones del modelo base.
- El repositorio pesa 351,5 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- Sin benchmarks publicados, la calidad real frente al modelo base no esta cuantificada.
- La fecha de creacion del repositorio (2026) y la ausencia de likes sugieren poca validacion comunitaria; tratar como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1
- Quants estaticos: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
