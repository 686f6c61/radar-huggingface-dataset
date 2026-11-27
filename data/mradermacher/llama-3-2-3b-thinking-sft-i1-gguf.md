# mradermacher/Llama-3.2-3B-Thinking-SFT-i1-GGUF

## Resumen

Llama-3.2-3B-Thinking-SFT-i1-GGUF es una coleccion de cuantizaciones GGUF, generadas con imatrix, del modelo wesjos/Llama-3.2-3B-Thinking-SFT. El trabajo de cuantizacion lo firma mradermacher, un autor conocido en el ecosistema por publicar versiones optimizadas de modelos open source para su uso en llama.cpp y herramientas compatibles. El modelo base es un ajuste fino completo (full fine-tune) de Llama 3.2 3B orientado a generar cadenas de razonamiento (chain-of-thought) antes de la respuesta final.

El objetivo del modelo base es incorporar capacidades de "thinking" o razonamiento explicito a un modelo pequeno de 3B parametros, destilando trazas de razonamiento procedentes de modelos mayores (Qwen, GLM y Kimi, segun el dataset de entrenamiento saidutta69/qwen-glm-kimi-distillation-clean). Esto lo hace atractivo para entornos con recursos limitados donde no es viable ejecutar un modelo de razonamiento de gran tamano.

Esta ficha cubre especificamente el repositorio de cuantizaciones i1-GGUF, que incluye una amplia gama de tipos de cuantizacion (desde IQ1_S hasta Q6_K) pensados para distintos presupuestos de memoria. La relevancia actual radica en la posibilidad de ejecutar un modelo con modo de razonamiento en hardware de consumo, aunque la informacion publicada sobre el modelo base es escasa y no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B) |
| Parametros totales | 3B (modelo base); el campo safetensors del repo indica 1.493.492, dato no coherente con el nombre del modelo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda de Llama 3.2 3B, 128K tokens, aunque no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun tags del repo) |
| Idiomas soportados | en, zh |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (con fichero imatrix incluido) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino completo (full fine-tune) de Llama 3.2 3B, realizado con Unsloth segun los tags del repositorio. La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only con atencion por grupos (GQA) y tokenizer BPE. El ajuste fino se orienta a la generacion de cadenas de razonamiento (chain-of-thought) antes de emitir la respuesta, siguiendo el paradigma de "thinking models".

El entrenamiento utiliza el dataset saidutta69/qwen-glm-kimi-distillation-clean, que segun su nombre contiene trazas de razonamiento destiladas de modelos Qwen, GLM y Kimi. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Las cuantizaciones de este repositorio emplean imatrix (importance matrix) para mejorar la calidad de los tipos de cuantizacion bajos, y se ofrecen tanto quants ponderados como estaticos (estos ultimos en el repo hermano Llama-3.2-3B-Thinking-SFT-GGUF).

## Capacidades

- Generacion de texto conversacional con modo de razonamiento explicito (chain-of-thought) antes de la respuesta final.
- Razonamiento multi-paso derivado de la destilacion de trazas de modelos mayores.
- Capacidades multilingues limitadas a ingles y chino (segun la model card).
- Soporte de conversacion multi-turno (tag "conversational").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de vision o audio.
- No se documenta un modo "thinking" conmutable; el razonamiento parece estar integrado en el estilo de respuesta.

## Casos de uso

- Razonamiento en entornos con poca memoria: las cuantizaciones IQ2/IQ3 permiten ejecutar un modelo de 3B con capacidades de razonamiento en GPUs de 4-6 GB de VRAM, util para prototipado en portatiles.
- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en ingles o chino, adecuado para aplicaciones de escritorio o moviles con llama.cpp.
- Generacion de explicaciones paso a paso: util para tareas educativas donde se requiere mostrar el razonamiento intermedio, como tutoria de matematicas o logica basica.
- Evaluacion de tecnicas de destilacion: investigadores pueden usar este modelo como caso de estudio de como se transfieren trazas de razonamiento de modelos grandes a uno de 3B.
- Experimentacion con cuantizacion: el repositorio incluye un amplio espectro de tipos de cuantizacion e imatrix, lo que permite comparar la degradacion de calidad del razonamiento segun el nivel de compresion.
- Despliegue en dispositivos de borde: con cuantizaciones Q4_K_M o inferiores, el modelo cabe en Raspberry Pi 5 con 8 GB o en mini-PCs, para tareas de generacion de texto offline.
- Base para fine-tuning adicional: al ser un modelo pequeno con licencia Llama 3.2, sirve como punto de partida para adaptaciones especificas en ingles o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada segun cuantizacion):
  - IQ1_S/IQ1_M: ~1 GB
  - IQ2_XXS/IQ2_XS/IQ2_S/IQ2_M: ~1,2-1,5 GB
  - IQ3_XXS/IQ3_XS/IQ3_S/IQ3_M: ~1,5-1,8 GB
  - Q3_K_S/Q3_K_M/Q3_K_L: ~1,6-2 GB
  - IQ4_XS/IQ4_NL: ~2 GB
  - Q4_0/Q4_1/Q4_K_S/Q4_K_M: ~2-2,3 GB
  - Q5_K_S/Q5_K_M: ~2,5-2,8 GB
  - Q6_K: ~3 GB
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4; RTX 3060/4060, RTX 4090, A100 o H100 para las versiones de mayor calidad y mayor contexto.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones caben en GPUs de 4-8 GB (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Compatible con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles. En una RTX 4090, un modelo de 3B en Q4 suele superar las 100 tok/s, pero no hay datos oficiales para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Thinking-SFT (este, cuantizado) | 3B | no disponible | llama3.2 | GGUF | Razonamiento destilado de Qwen/GLM/Kimi, en/zh |
| Llama-3.2-3B-Instruct | 3B | 128K | llama3.2 | safetensors, GGUF | Modelo oficial de Meta, sin modo thinking explicito |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | safetensors, GGUF | Multilingue amplio, sin razonamiento explicito |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y codigo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de este modelo frente a las alternativas.

## Limitaciones y advertencias

- La model card del repositorio de cuantizacion no incluye informacion sobre sesgos, datos de entrenamiento detallados ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de 3B, potencialmente agravado por la generacion de cadenas de razonamiento largas que pueden contener pasos erroneos.
- Idiomas limitados a ingles y chino; no se garantiza un rendimiento adecuado en castellano.
- La licencia llama3.2 (Llama 3.2 Community License) impone restricciones: requiere aceptacion de los terminos de Meta, incluye clausulas de uso aceptable y obligaciones de atribucion; el uso comercial esta permitido con condiciones, pero debe revisarse la licencia completa.
- El dato de parametros del campo safetensors (1.493.492) no es coherente con un modelo de 3B; probablemente se refiere a otro artefacto del repo y no debe tomarse como el tamano real del modelo.
- No hay informacion sobre la longitud de contexto efectiva del modelo base ni sobre si el ajuste fino la preserva.
- Al ser un modelo derivado y cuantizado por terceros, no cuenta con el respaldo oficial de Meta ni de wesjos; la calidad de las cuantizaciones IQ bajas puede degradar notablemente el razonamiento.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.2-3B-Thinking-SFT-i1-GGUF
- Modelo base: https://huggingface.co/wesjos/Llama-3.2-3B-Thinking-SFT
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Llama-3.2-3B-Thinking-SFT-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/qwen-glm-kimi-distillation-clean
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.2-3B-Thinking-SFT-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
