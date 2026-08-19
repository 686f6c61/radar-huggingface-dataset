# AmberYifan/capsd-qwen3-sciweb-stackexchange-Qwen3-4B-Base-science_ppl_b2000_s0

## Resumen

Este modelo es un fine-tuning completo (full fine-tuning) del modelo base Qwen/Qwen3-4B-Base, desarrollado por el autor AmberYifan sobre un dataset de preguntas y respuestas científicas procedente de StackExchange y SciWeb. El nombre del dataset de entrenamiento, capsd_Qwen3-4B-Base-n80000-sciweb-stackexchange__mix_science_ppl_b2000_s0, sugiere una mezcla de aproximadamente 80.000 muestras orientadas a dominios científicos, con un posible filtrado por perplejidad (ppl_b2000_s0). El modelo tiene 4.022.468.096 parámetros (~4B) y está diseñado para generación de texto.

El entrenamiento se realizó con la librería llama-factory en modo full (actualización de todos los parámetros) durante una época, con una tasa de aprendizaje de 1e-5 y un tamaño de lote efectivo de 64, distribuido en 4 GPUs. La model card es autogenerada y extremadamente escasa: no incluye resultados de evaluación, descripción de capacidades ni limitaciones. Su relevancia radica en ser un ejemplo de adaptación de dominio de la familia Qwen3 a contenido científico-técnico, aunque la ausencia de benchmarks y la licencia indefinida limitan su uso directo en producción sin evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Base soporta 32K tokens según el informe tecnico de Qwen3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del Qwen3-4B-Base, un transformer denso de la familia Qwen3. Segun el informe tecnico de Qwen3, la serie Qwen3 integra modos de pensamiento (thinking) y no pensamiento (non-thinking) en un marco unificado para razonamiento multi-paso, aunque no se documenta si esta capacidad del modelo base se conserva tras el proceso de fine-tuning.

El entrenamiento se realizó con llama-factory en modo full (actualizacion de todos los parametros) sobre el dataset capsd_Qwen3-4B-Base-n80000-sciweb-stackexchange__mix_science_ppl_b2000_s0, que combina contenido de StackExchange y SciWeb. Hiperparametros declarados: learning rate 1e-5, batch de entrenamiento 2, acumulacion de gradientes 8 (lote efectivo de 64), scheduler coseno con warmup del 3%, una epoca, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), distributed_type multi-GPU con 4 dispositivos. No se publican metricas de entrenamiento ni de evaluacion.

## Capacidades

- Generacion de texto en dominios cientificos: el fine-tuning esta orientado a preguntas y respuestas de StackExchange y SciWeb, por lo que deberia responder razonablemente en contextos tecnico-cientificos, aunque no hay evaluacion publicada que lo confirme.
- Herencia de capacidades del modelo base Qwen3-4B-Base: razonamiento, generacion de codigo y capacidades multilingues, sin garantia de que se conserven integramente tras el fine-tuning.
- Tool calling / function calling: no documentado para este fine-tuning.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking: el modelo base Qwen3 soporta modos de pensamiento, pero no se documenta si se conservan tras el fine-tuning.

## Casos de uso

- Asistente de consulta cientifica: el modelo puede responder preguntas tecnicas en formato StackExchange, util para foros internos o sistemas de ayuda en organizaciones de I+D, aprovechando su entrenamiento en datos de Q&A cientifico.
- Generacion de respuestas preliminares en plataformas de Q&A: puede producir borradores de respuesta que un humano revise y publique, reduciendo el tiempo de redaccion en comunidades tecnicas.
- Extraccion y reformulacion de conocimiento cientifico: con contexto adecuado, puede resumir o reformular contenido tecnico de documentacion o articulos.
- Base para fine-tuning adicional: al ser un modelo base fine-tuneado, puede servir como punto de partida para adaptaciones mas especificas a dominios cientificos concretos.
- Generacion de contenido educativo: explicaciones de conceptos cientificos en formato pregunta-respuesta, adecuado para materiales de formacion interna.
- Prototipado de chatbots de soporte tecnico: combinado con un sistema de retrieval (RAG), puede responder consultas sobre documentacion tecnica o cientifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo model-index de la model card contiene una entrada vacia (sin resultados declarados).

## Requisitos de hardware

- VRAM estimada para inferencia: con 4B parametros, en fp16 se requieren aproximadamente 8 GB de VRAM; en cuantizacion int4, alrededor de 2,5-3 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB); tambien cabe en GPUs consumer con 8 GB o mas (RTX 3070/3080/4070).
- Compatible con despliegue en consumer GPU de gama media-alta en cuantizacion int4 o int8.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama y TGI (el modelo tiene las etiquetas text-generation-inference y endpoints_compatible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (capsd-Qwen3-4B-Base-science) | 4B | no disponible | other | Fine-tuning cientifico de Qwen3-4B-Base |
| Qwen/Qwen3-4B-Base | 4B | 32K | Apache 2.0 | Modelo base original, sin fine-tuning |
| Qwen/Qwen3-4B-Instruct | 4B | 32K | Apache 2.0 | Version instruct con entrenamiento supervisado y RLHF |

El modelo base Qwen3-4B-Base tiene licencia Apache 2.0, pero este fine-tuning declara licencia "other", lo que puede implicar restricciones adicionales para uso comercial. No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- La model card es autogenerada y carece de informacion sobre evaluacion, datos de entrenamiento detallados y limitaciones especificas.
- No hay benchmarks publicados; el rendimiento real del modelo es desconocido y no debe asumirse equivalente al del modelo base.
- La licencia "other" no especifica terminos de uso comercial; es necesario contactar al autor o revisar los archivos del repositorio antes de usar el modelo en produccion.
- No se especifican idiomas soportados; el multilingüismo dependera del modelo base y del dataset de entrenamiento.
- Riesgo de alucinacion tipico de modelos de 4B en dominios especializados, agravado por la ausencia de evaluacion publicada.
- El dataset de entrenamiento (StackExchange, SciWeb) puede introducir sesgos de formato, jerga y contenido propios de esas plataformas.
- El tag "conversational" sugiere uso conversacional, pero no hay evidencia de alineacion con instrucciones (instruction tuning) ni RLHF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen3-sciweb-stackexchange-Qwen3-4B-Base-science_ppl_b2000_s0
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Modelo relacionado del mismo autor (Qwen3.5-4B-Base): https://huggingface.co/AmberYifan/capsd-qwen35-sciweb-stackexchange-Qwen3.5-4B-Base-science_ppl_b8000_s0
- Modelo relacionado del mismo autor (Qwen3-1.7B-Base-math): https://huggingface.co/AmberYifan/capsd-Qwen3-1.7B-Base-math_ppl_b2000_s0
