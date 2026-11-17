# sahadevnirala/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como version preview de la serie DeepSeek-V4. Con 1,6 billones de parametros totales y 49 mil millones activados por token, esta disenado especificamente para el procesamiento de contextos extremadamente largos: su ventana de contexto alcanza el millon de tokens. La arquitectura introduce un mecanismo de atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), lo que reduce drasticamente el coste computacional en inferencia con contextos largos.

El modelo se entrena sobre mas de 32 billones de tokens e incorpora innovaciones como las Manifold-Constrained Hyper-Connections (mHC) y el optimizador Muon. El pipeline de post-entrenamiento sigue un paradigma de dos etapas: cultivo independiente de expertos por dominio mediante SFT y RL con GRPO, seguido de una consolidacion unificada mediante destilacion on-policy. La variante Pro-Max, con maximo esfuerzo de razonamiento, se posiciona segun el autor como el mejor modelo open source disponible en el momento de publicacion.

La relevancia de este lanzamiento radica en su eficiencia para contextos de un millon de tokens: segun la model card, requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache en comparacion con DeepSeek-V3.2 en el mismo escenario de contexto. La licencia MIT facilita su adopcion comercial, aunque el enorme tamano del repositorio (864,7 GB) y los requisitos de hardware limitan su despliegue a infraestructuras de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (CSA + HCA) y mHC |
| Parametros totales | 1.598.839.674.782 (aprox. 1,6 T) |
| Parametros activos | 49 B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8); tag 8-bit/fp8 en el repo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Tamano del repositorio | 864,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro es un modelo Mixture-of-Experts con 1,6 T de parametros totales y 49 B activados por token. Su innovacion principal es la atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), disenada para mejorar la eficiencia en contextos largos. En el escenario de 1M tokens, el modelo requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache respecto a DeepSeek-V3.2. Ademas, incorpora Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales y mejorar la estabilidad de propagacion de senales entre capas, y utiliza el optimizador Muon para una convergencia mas rapida y estable.

El pre-entrenamiento se realizo sobre mas de 32 billones de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma de dos etapas: primero se cultivan expertos independientes por dominio mediante SFT y RL con GRPO, y despues se consolida un modelo unificado mediante destilacion on-policy, integrando las distintas competencias en un unico modelo. La version Pro-Max representa el modo de maximo esfuerzo de razonamiento y, segun el autor, alcanza un rendimiento de primer nivel en benchmarks de codigo y reduce significativamente la brecha con los principales modelos cerrados en tareas de razonamiento y agenticas.

## Capacidades

- Generacion de texto y razonamiento de alta complejidad, con modo de razonamiento extendido (Pro-Max) que permite aumentar el presupuesto de pensamiento.
- Procesamiento de contextos de hasta un millon de tokens, adecuado para documentos extensos, bases de codigo completas o conversaciones de muy largo recorrido.
- Capacidades de codigo de primer nivel segun el autor, con resultados destacados en benchmarks de programacion.
- Tareas agenticas y razonamiento multi-paso, con mejora significativa respecto a generaciones anteriores segun la model card.
- Conocimiento mundial y multilingue: los benchmarks incluyen MMLU, MMMLU, C-Eval y CMMLU, lo que sugiere cobertura de ingles y chino, aunque la lista oficial de idiomas no esta disponible.
- Capacidades matematicas y de resolucion de problemas, evaluadas indirectamente en los benchmarks de conocimiento y razonamiento.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto, el modelo puede ingerir una base de codigo entera y responder preguntas sobre arquitectura, dependencias o posibles bugs sin necesidad de fragmentacion, lo que lo hace adecuado para revision de codigo a gran escala.
- Asistentes de investigacion documental: procesamiento de corpus extensos (papers, expedientes, contratos) en una sola pasada, aprovechando la ventana de 1M tokens para mantener coherencia entre documentos y evitar perdida de contexto.
- Razonamiento agentico multi-paso: el modelo puede encadenar pasos de planificacion y ejecucion en flujos de trabajo automatizados, con la variante Pro-Max ofreciendo presupuesto de pensamiento ampliado para tareas complejas de resolucion de problemas.
- Generacion y refactorizacion de codigo en produccion: los resultados de benchmarks de codigo citados por el autor lo posicionan para tareas de generacion, traduccion entre lenguajes y refactorizacion en pipelines de CI/CD, aunque la integracion con tool calling no esta confirmada.
- Atencion al cliente con historial largo: conversaciones multi-turno de gran extension donde el modelo debe recordar decisiones, preferencias y detalles de interacciones previas gracias a la ventana de 1M tokens.
- Analisis de datos y generacion de informes: sintesis de grandes volumenes de texto estructurado y no estructurado, con capacidad de razonamiento sobre los datos y produccion de resumenes o informes tecnicos.
- Evaluacion de conocimiento especializado: uso en dominios que requieren conocimiento enciclopedico amplio (medicina, derecho, finanzas) gracias a los resultados en MMLU y MMLU-Pro, siempre con supervision humana.

## Benchmarks y rendimiento

Resultados de los modelos base segun la model card:

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Parametros activados | - | 37 B | 13 B | 49 B |
| Parametros totales | - | 671 B | 284 B | 1,6 T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

No se han publicado en la informacion disponible resultados de benchmarks para la version instruct (DeepSeek-V4-Pro) ni para Pro-Max; solo se incluyen los del modelo base.

## Requisitos de hardware

- VRAM estimada: con pesos en FP4 + FP8 mixto, el repositorio ocupa 864,7 GB, por lo que se necesita un minimo de aproximadamente 865 GB de memoria para cargar los pesos sin cuantizacion adicional. Para inferencia con KV cache y overhead, se recomienda al menos 1 TB de memoria agregada.
- GPU recomendadas: no es viable en GPUs consumer. Requiere clusters de H100, H200, B200 o A100 de 80 GB en configuracion multi-GPU (al menos 12-16 GPUs para cubrir los pesos y el KV cache).
- GPU consumer: no cabe en ninguna GPU consumer actual (RTX 4090, 5090, etc.).
- Opciones de despliegue: transformers (biblioteca declarada), vLLM, TGI y otros frameworks compatibles con FP8/FP4. llama.cpp y Ollama no son viables por el tamano del modelo.
- Latencia y throughput: no disponibles. La model card afirma que en contexto de 1M tokens requiere el 27% de FLOPs por token y el 10% de KV cache respecto a DeepSeek-V3.2, lo que sugiere una mejora sustancial de throughput en contextos largos, pero no se proporcionan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6 T | 49 B | 1M | MIT | Hugging Face, ModelScope |
| DeepSeek-V4-Flash | 284 B | 13 B | 1M | MIT | Hugging Face, ModelScope |
| DeepSeek-V3.2 | 671 B | 37 B | no disponible en la informacion | no disponible en la informacion | Hugging Face |

En rendimiento, DeepSeek-V4-Pro-Base supera a DeepSeek-V3.2-Base en todos los benchmarks de conocimiento reportados (MMLU 90,1 frente a 87,8; MMLU-Pro 73,5 frente a 65,5; C-Eval 93,1 frente a 90,4). Frente a DeepSeek-V4-Flash-Base, la ventaja es mas moderada pero consistente en tareas de conocimiento (MMLU-Pro 73,5 frente a 68,3). No se dispone de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos de genero, raza, idioma y cultura, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Los benchmarks de conocimiento muestran precision alta, pero no eliminan el riesgo de generacion de contenido falso, especialmente en dominios especializados.
- Limitaciones de contexto o idioma: aunque la ventana es de 1M tokens, el rendimiento efectivo en contextos extremos no esta cuantificado mas alla de las cifras relativas de FLOPs y KV cache. La lista oficial de idiomas no esta disponible; los benchmarks sugieren cobertura de ingles y chino.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. No obstante, el modelo esta marcado como "preview", por lo que puede haber cambios en versiones posteriores.
- Caveats para produccion: el tamano del repositorio (864,7 GB) y los requisitos de hardware (cluster multi-GPU de alta gama) hacen inviable el despliegue en infraestructura estandar. La cuantizacion FP4 en expertos puede degradar ligeramente la calidad respecto a FP8 puro. El soporte de tool calling no esta confirmado. La fecha de creacion del repositorio (2026-11-17) y las cero descargas indican que se trata de un lanzamiento muy reciente o de un espejo no verificado del modelo oficial.

## Enlaces

- Hugging Face: https://huggingface.co/sahadevnirala/DeepSeek-V4-Pro
- Modelo oficial DeepSeek-V4-Pro (DeepSeek AI): https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Modelo oficial DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- Modelo oficial DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- ModelScope DeepSeek-V4-Pro: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
