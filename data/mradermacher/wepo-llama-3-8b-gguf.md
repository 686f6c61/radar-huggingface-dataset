# mradermacher/WEPO-llama-3-8b-GGUF

## Resumen

WEPO-llama-3-8b-GGUF es la distribucion en formato GGUF del modelo WEPO-llama-3-8b, un ajuste fino de Llama 3 de 8B publicado por el usuario KLGR123 y cuantizado por mradermacher. El modelo base conserva la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parametros totales, y esta orientado a tareas conversacionales en ingles. La relevancia de esta ficha radica en que ofrece el modelo en una bateria completa de cuantizaciones GGUF (de Q2_K a f16) que permiten ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o motores compatibles.

El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que publica versiones GGUF de modelos abiertos. La model card original de KLGR123 no esta incluida en la informacion disponible, por lo que no se detallan los datos de entrenamiento ni el proceso de ajuste fino que da lugar a WEPO. La licencia declarada es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion habituales.

El modelo se publico en marzo de 2025 y se actualizo en noviembre de 2026. Con 464 descargas y sin likes, se trata de un modelo de nicho dentro del ecosistema, pero util para quien necesite una variante conversacional de Llama 3 de 8B en formato GGUF con cuantizaciones estaticas listas para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 71,8 GB |
| Modelo base | KLGR123/WEPO-llama-3-8b |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 3 8B: un transformer decoder-only con atencion multi-cabeza agrupada (GQA), normalizacion RMSNorm y activacion SwiGLU. El modelo es un ajuste fino (fine-tune) del checkpoint original de Llama 3 8B, publicado por KLGR123 bajo el identificador WEPO-llama-3-8b. No se dispone de informacion sobre el dataset de ajuste, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales en la informacion proporcionada.

La contribucion de mradermacher en este repositorio es exclusivamente la cuantizacion: convierte los pesos del modelo base a formato GGUF mediante las herramientas de llama.cpp, generando cuantizaciones estaticas (sin imatrix ni weighted quants, segun indica la propia model card). Las cuantizaciones IQ y K siguen los esquemas habituales de la comunidad, con Q4_K_M y Q4_K_S marcadas como "fast, recommended" y Q6_K como "very good quality".

## Capacidades

- Generacion de texto conversacional en ingles, heredada de las capacidades de Llama 3 8B.
- Razonamiento basico y respuesta a instrucciones, sujeto al ajuste fino aplicado por KLGR123 (no documentado).
- Ejecucion local en CPU y GPU mediante llama.cpp y motores compatibles con GGUF.
- Integracion con endpoints compatibles (la etiqueta `endpoints_compatible` figura en los tags del repositorio).
- Soporte multilingue limitado: el modelo declara unicamente ingles.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo de 8 GB o superiores y permite asistentes conversacionales en ingles sin conexion a servicios externos.
- Prototipado rapido de chatbots: la cuantizacion Q4_K_S (4,8 GB) esta marcada como "fast, recommended" y permite iterar sobre prompts y flujos conversacionales en entornos de desarrollo con recursos limitados.
- Evaluacion comparativa de ajustes finos: al ser un fine-tune de Llama 3 8B en GGUF, sirve para comparar el comportamiento del ajuste WEPO frente al Llama 3 base en tareas de conversacion.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en portatiles sin GPU dedicada, a costa de menor calidad.
- Integracion en pipelines con Ollama: el formato GGUF y la etiqueta `endpoints_compatible` facilitan su carga en Ollama o servidores compatibles con la API de OpenAI para pruebas internas.
- Generacion de texto por lotes en ingles: el modelo puede procesar volumenes moderados de texto para tareas de resumen o reescritura en entornos donde no se requiere la maxima calidad de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. Hay que anadir el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 no son necesarias para un modelo de 8B, pero permiten mayor throughput con f16.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M con contexto moderado) hasta tarjetas de 8 GB con cuantizaciones Q3 o Q4 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de el.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WEPO-llama-3-8b-GGUF | 8,03 B | no disponible | Apache 2.0 | GGUF | Fine-tune de Llama 3 8B, solo ingles |
| Llama 3 8B (Meta) | 8,03 B | 8.192 tokens (original) | Llama 3 Community License | safetensors, GGUF | Modelo base de referencia |
| Mistral 7B | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con contexto mayor |
| Gemma 7B | 8,54 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Alternativa de Google con licencia propia |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento comparativo para WEPO-llama-3-8b.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se documenta la longitud de contexto del ajuste fino; se asume la de Llama 3 8B, pero no esta confirmado.
- Al ser un fine-tune de origen comunitario sin model card detallada, se desconoce el dataset de entrenamiento y los posibles sesgos introducidos.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de conocimiento factual.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- No se han publicado cuantizaciones con imatrix ni weighted quants para este modelo, lo que limita las opciones de calidad intermedia.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base KLGR123/WEPO-llama-3-8b cumple con los terminos de la licencia de Llama 3 de Meta, de la que deriva.
- El repositorio tiene un numero bajo de descargas y no cuenta con validacion de la comunidad; conviene evaluar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WEPO-llama-3-8b-GGUF
- Modelo base: https://huggingface.co/KLGR123/WEPO-llama-3-8b
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#WEPO-llama-3-8b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
