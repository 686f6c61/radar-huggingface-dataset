# Kiruba072/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como la version tope de la familia DeepSeek-V4. Cuenta con 1,6 billones de parametros totales y 49 mil millones de parametros activos por token, y esta disenado especificamente para el procesamiento de contextos de hasta un millon de tokens. La model card se distribuye bajo una licencia MIT, lo que lo convierte en una opcion atractiva para uso comercial e investigacion.

La innovacion central es una arquitectura de atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), lo que reduce drasticamente el coste computacional en contextos largos: en la configuracion de 1M de tokens, el modelo requiere solo el 27 % de los FLOPs de inferencia por token y el 10 % de la cache KV en comparacion con DeepSeek-V3.2. Ademas, incorpora Manifold-Constrained Hyper-Connections (mHC) para estabilizar la propagacion de senales y el optimizador Muon para acelerar la convergencia.

El modelo se entreno sobre mas de 32 billones de tokens y emplea un pipeline de post-entrenamiento en dos etapas: cultivo independiente de expertos por dominio (SFT y RL con GRPO) y consolidacion unificada mediante destilacion on-policy. La variante DeepSeek-V4-Pro-Max, con esfuerzo de razonamiento maximo, se posiciona segun el autor como el mejor modelo open source disponible en el momento de su publicacion. El repositorio de Hugging Face analizado (Kiruba072/DeepSeek-V4-Pro) es una copia de los pesos oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (CSA + HCA) y mHC |
| Parametros totales | 1.598.839.674.782 (1,6 T) |
| Parametros activos | 49 B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 mixed (base); FP4 + FP8 mixed (modelo final: expertos MoE en FP4, resto en FP8); tag 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro es un transformer de tipo Mixture-of-Experts con 1,6 T de parametros totales y 49 B activos por token. Su rasgo arquitectonico principal es la atencion hibrida que combina Compressed Sparse Attention (CSA) con Heavily Compressed Attention (HCA), disenada para hacer viable el contexto de un millon de tokens. Segun la model card, en ese regimen el modelo consume solo el 27 % de los FLOPs de inferencia por token y el 10 % de la cache KV respecto a DeepSeek-V3.2. A esto se suman las Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales mejorando la estabilidad de la propagacion de senales entre capas sin sacrificar expresividad.

El preentrenamiento utilizo mas de 32 billones (32T) de tokens diversos y de alta calidad, con el optimizador Muon para una convergencia mas rapida y estable. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos independientes por dominio mediante SFT y RL con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy. La variante Pro-Max corresponde al modo de maximo esfuerzo de razonamiento. Los pesos finales emplean precision mixta FP4 + FP8 (expertos MoE en FP4, mayoria de parametros restantes en FP8).

## Capacidades

- Generacion de texto y conocimiento general, con resultados de referencia en MMLU, MMLU-Pro, C-Eval y CMMLU.
- Razonamiento avanzado en modo Pro-Max, con esfuerzo de razonamiento configurable.
- Generacion de codigo y tareas de programacion, con rendimiento de primer nivel segun el autor.
- Tareas agenticas y razonamiento multi-paso.
- Procesamiento de contextos extremadamente largos (hasta 1M de tokens) con coste reducido de atencion.
- Capacidades multilingues: la model card reporta evaluaciones en MMMLU, C-Eval y CMMLU, aunque la lista explicita de idiomas soportados no esta disponible.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Vision y audio: no disponible.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto y una cache KV reducida al 10 % respecto a V3.2, el modelo puede ingerir bases de codigo extensas y responder preguntas de arquitectura o refactorizacion sin trocear el contexto.
- Revision documental de contratos y expedientes legales: permite procesar cientos de paginas en una sola pasada y mantener coherencia entre secciones, algo inviable con ventanas de 128K.
- Agentes autonomos de larga duracion: el modo Pro-Max y el razonamiento multi-paso encajan en flujos agenticos que acumulan historial extenso de herramientas y observaciones.
- Generacion y migracion de codigo en produccion: sus resultados en benchmarks de codigo y su licencia MIT facilitan la integracion en pipelines internos y CI/CD.
- Investigacion academica sobre contextos largos: sirve como referencia abierta para estudiar atencion dispersa y comprimida a escala de 1M de tokens.
- Asistentes de analisis financiero o cientifico: el conocimiento enciclopedico (MMLU 90,1 en base) y el contexto largo permiten resumir informes anuales o articulos extensos con trazabilidad.
- Despliegue self-hosted en infraestructura propia: la licencia MIT elimina restricciones de uso comercial, aunque el coste de hardware es elevado (ver seccion de hardware).

## Benchmarks y rendimiento

Resultados publicados en la model card para los modelos base (no para los modelos post-entrenados):

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Parametros activos | - | 37B | 13B | 49B |
| Parametros totales | - | 671B | 284B | 1,6T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

No se han publicado en la informacion disponible resultados numericos de los modelos post-entrenados (Pro y Pro-Max) ni de benchmarks de codigo, matematicas o tareas agenticas; la model card solo indica cualitativamente que Pro-Max alcanza rendimiento de primer nivel en codigo y se acerca a los modelos cerrados lideres en razonamiento y tareas agenticas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 864,7 GB en precision mixta FP4 + FP8, por lo que la inferencia requiere al menos ese orden de memoria agregada; con cuantizaciones adicionales no documentadas no hay cifras disponibles.
- No cabe en ninguna GPU consumer individual (RTX 4090, 24 GB; RTX 5090, 32 GB); requiere despliegue multi-GPU o multi-nodo.
- GPU recomendadas: no especificadas en la informacion disponible; por volumen de pesos, se necesitan nodos con multiples H100/H200 (80-141 GB) o A100 (80 GB), o soluciones con memoria unificada de gran capacidad.
- Opciones de despliegue: la model card no detalla frameworks; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, y la libreria declarada es `transformers`. Soporte de vLLM, llama.cpp, Ollama o TGI no confirmado.
- Latencia y throughput: no disponibles. La model card solo cuantifica la eficiencia relativa (27 % de FLOPs por token y 10 % de KV cache frente a V3.2 en contexto de 1M).

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Rendimiento base (MMLU) |
|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6T / 49B | 1M | MIT | 90,1 |
| DeepSeek-V4-Flash | 284B / 13B | 1M | MIT (segun familia) | 88,7 |
| DeepSeek-V3.2 | 671B / 37B | no disponible | no disponible | 87,8 |

La model card no incluye comparaciones con modelos de otros laboratorios (Llama, Qwen, Mistral, GPT, Claude), por lo que esa comparativa cruzada no esta disponible.

## Limitaciones y advertencias

- El repositorio analizado (Kiruba072/DeepSeek-V4-Pro) es una copia de terceros con 0 descargas y 0 likes; para produccion conviene usar los pesos oficiales de deepseek-ai.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; es un riesgo inherente a los modelos de lenguaje de gran escala.
- Idiomas soportados: no se publica una lista explicita, aunque hay evaluaciones en ingles y chino (MMMLU, C-Eval, CMMLU).
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones documentadas, pero conviene verificar el fichero LICENSE del repositorio oficial.
- Coste de hardware prohibitivo para la mayoria de equipos: 864,7 GB de pesos y despliegue multi-GPU obligatorio.
- Los benchmarks de codigo y tareas agenticas solo se describen cualitativamente; no hay cifras verificables en la informacion disponible.
- Soporte de tool calling y de frameworks de inferencia no confirmado.

## Enlaces

- Repositorio Hugging Face analizado: https://huggingface.co/Kiruba072/DeepSeek-V4-Pro
- Pesos oficiales DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Pesos oficiales DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- Pesos oficiales DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Pesos oficiales DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- ModelScope (espejo oficial): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Twitter/X: https://twitter.com/deepseek_ai
