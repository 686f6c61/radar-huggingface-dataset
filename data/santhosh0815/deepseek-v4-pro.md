# santhosh0815/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como la version de maxima capacidad de la familia DeepSeek-V4. Cuenta con 1,6 billones de parametros totales y 49 mil millones de parametros activos por token, y esta disenado especificamente para cargas de trabajo de contexto extremadamente largo, con una ventana de un millon de tokens. La ficha de HuggingFace analizada corresponde a una republicacion no oficial bajo el identificador `santhosh0815/DeepSeek-V4-Pro`, con licencia MIT declarada.

La relevancia tecnica del modelo reside en su arquitectura de atencion hibrida, que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Segun el informe tecnico asociado (arXiv:2606.19348), en el regimen de 1M tokens de contexto el modelo requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache en comparacion con DeepSeek-V3.2, lo que reduce de forma sustancial el coste computacional y de memoria asociado al contexto largo.

El modelo se distribuye en precision mixta FP4 + FP8 (expertos MoE en FP4, resto de parametros en FP8) y se ha preentrenado con mas de 32 billones de tokens. La variante DeepSeek-V4-Pro-Max, modo de maximo esfuerzo de razonamiento, se posiciona segun el autor como el mejor modelo open source disponible en el momento de publicacion, con resultados destacados en benchmarks de codigo y tareas agenticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida CSA + HCA y conexiones mHC |
| Parametros totales | 1.598.839.674.782 (aprox. 1,6T) |
| Parametros activos | 49B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8); tags de repositorio indican 8-bit y fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro es un transformer de tipo Mixture-of-Experts con 1,6T de parametros totales y 49B activos. Incorpora tres innovaciones principales descritas en el informe tecnico: (1) una arquitectura de atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA) para mejorar la eficiencia en contexto largo, reduciendo a 1M tokens el coste a un 27% de los FLOPs por token y un 10% del KV cache respecto a DeepSeek-V3.2; (2) Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales para estabilizar la propagacion de senales entre capas preservando la expresividad del modelo; y (3) el optimizador Muon, empleado para acelerar la convergencia y mejorar la estabilidad del entrenamiento.

El preentrenamiento se realizo sobre mas de 32 billones de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan de forma independiente expertos por dominio mediante SFT y RL con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy, integrando las distintas competencias en un solo conjunto de pesos. El modelo se distribuye en precision mixta FP4 + FP8.

## Capacidades

- Generacion de texto y conocimiento del mundo, con resultados competitivos en AGIEval, MMLU, MMLU-Pro, MMMLU, C-Eval y CMMLU.
- Razonamiento avanzado en el modo DeepSeek-V4-Pro-Max, con esfuerzo de razonamiento maximo configurable.
- Codigo: resultados de primer nivel en benchmarks de programacion segun el autor.
- Tareas agenticas y flujos de multiples pasos, con brecha reducida frente a modelos cerrados lideres.
- Procesamiento de contexto muy largo (hasta 1M tokens) con coste de atencion reducido.
- Capacidades multilingues: no se detallan idiomas especificos en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto, el modelo puede ingerir bases de codigo extensas y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el contenido.
- Agentes autonomos de larga duracion: el modo Max y las capacidades agenticas permiten encadenar decenas de pasos de razonamiento y llamadas a herramientas manteniendo el estado en contexto.
- Generacion y revision de codigo en produccion: los resultados en benchmarks de programacion lo hacen adecuado para pipelines de CI/CD, revision automatica de PRs y generacion de tests.
- Analisis documental masivo: procesamiento de contratos, expedientes o corpus legales de cientos de miles de tokens en una sola pasada, aprovechando la reduccion del 90% de KV cache.
- Investigacion y sintesis cientifica: lectura de multiples papers o articulos largos y generacion de resumenes comparativos con trazabilidad al contexto original.
- Razonamiento matematico y analitico: resolucion de problemas de varios pasos con el modo de maximo esfuerzo de razonamiento, util en entornos educativos o de investigacion.
- Asistentes conversacionales de contexto largo: conversaciones multi-turno con memoria extensa de la sesion sin necesidad de resumenes intermedios.

## Benchmarks y rendimiento

Resultados publicados para los modelos base (fuente: model card del autor):

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

No se han publicado en la informacion disponible resultados de benchmarks para las variantes post-entrenadas (DeepSeek-V4-Pro y Pro-Max) ni para HumanEval, GSM8K u otros conjuntos de codigo y matematicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,6T de parametros en FP4 + FP8 mixto, el peso completo ocupa aproximadamente 865 GB (tamano del repositorio), por lo que se requiere un nodo multi-GPU con al menos 8 GPUs de 80 GB (H100/A100) o 16 GPUs de 48 GB para cargar los pesos.
- GPU recomendadas: H100 80GB, H200, A100 80GB en configuracion multi-nodo; no cabe en GPUs de consumo.
- GPU de consumo: no es viable en RTX 4090, RTX 3090 ni similares, ni siquiera con cuantizaciones agresivas, dado el volumen de parametros.
- Opciones de despliegue: al ser un modelo MoE de gran escala con soporte en transformers, los backends habituales para este tipo de arquitecturas son vLLM y SGLang en configuraciones multi-GPU; llama.cpp y Ollama no son opciones realistas por tamano. TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El informe tecnico indica una reduccion al 27% de FLOPs por token y al 10% de KV cache frente a DeepSeek-V3.2 en contexto de 1M tokens, lo que implica una mejora proporcional en coste de inferencia a contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU-Pro (base) |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT | 73,5 |
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT (segun repositorio) | 68,3 |
| DeepSeek-V3.2 | 671B | 37B | no disponible | no disponible | 65,5 |

La comparativa se limita a los modelos incluidos en la model card. No se dispone de datos de otros modelos de la competencia (Qwen, Llama, Kimi, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- La ficha analizada corresponde a una republicacion no oficial (`santhosh0815/DeepSeek-V4-Pro`) con 61 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial de DeepSeek AI antes de usarla en produccion.
- El repositorio ocupa 864,7 GB, lo que implica costes de almacenamiento y transferencia considerables.
- No se detallan los idiomas soportados, por lo que el rendimiento multilingue fuera de ingles y chino no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan tasas especificas en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Aunque la licencia declarada es MIT, al tratarse de una republicacion no oficial debe confirmarse la licencia real del modelo original en el repositorio de DeepSeek AI.
- El modo Max requiere un presupuesto de razonamiento elevado, lo que incrementa latencia y coste por consulta.
- No hay informacion sobre tool calling, vision ni otras capacidades especiales, por lo que no deben asumirse en produccion sin validacion previa.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/santhosh0815/DeepSeek-V4-Pro
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Organizacion oficial en HuggingFace: https://huggingface.co/deepseek-ai
- Repositorio oficial DeepSeek-V4-Pro (referencia): https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Repositorio oficial DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- Repositorio oficial DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- ModelScope (DeepSeek-V4-Pro): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Twitter/X: https://twitter.com/deepseek_ai
