# kodetr/SasakLLM-1.5B-Instruct-v4

## Resumen

SasakLLM-1.5B-Instruct-v4 es un adaptador LoRA publicado por el usuario kodetr sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptacion (formato PEFT) que deben combinarse con el modelo base de Qwen para su uso. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo de 1.500 millones de parametros completo.

El modelo base pertenece a la familia Qwen2.5 de Alibaba, una arquitectura transformer densa de 1,5 mil millones de parametros con una ventana de contexto nativa de 32.768 tokens y soporte multilingue amplio (mas de 29 idiomas, incluidos espanol, ingles y chino). El adaptador se ha entrenado mediante SFT (supervised fine-tuning) usando la libreria TRL, segun los tags del repositorio.

La relevancia de esta ficha es limitada: se trata de una publicacion de autor individual, sin model card sustantiva (la plantilla esta practicamente vacia), sin licencia declarada, sin idiomas declarados y sin resultados de evaluacion. Cualquier evaluacion seria debe realizarse contra el modelo base, cuyas capacidades se conocen y documentan ampliamente. El interes practico del adaptador reside en el ajuste de estilo o comportamiento conversacional que el autor haya podido introducir, no en capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); adaptador LoRA de tamano no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizacion GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | no disponible (el modelo base soporta mas de 29 idiomas) |
| Licencia | no disponible (el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 1,5 mil millones de parametros, atencion por query/key/value con RoPE, activacion SwiGLU y normalizacion RMSNorm. El modelo base fue preentrenado por Alibaba con un corpus de hasta 18 billones de tokens segun la documentacion oficial de la familia Qwen2.5, seguido de un proceso de alineacion con SFT y optimizacion por preferencias (DPO). El adaptador de kodetr se entrena con SFT usando TRL, segun los tags del repositorio, pero no se especifican el dataset, el rango LoRA, el alpha, la tasa de aprendizaje ni el numero de pasos.

No hay informacion sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento, la estrategia de enmascaramiento de perdida ni el hardware utilizado. La model card mantiene la plantilla generica de Hugging Face con marcadores "[More Information Needed]" en todas las secciones, incluida la de hiperparametros de entrenamiento. La version de PEFT declarada en el repositorio es 0.21.2. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento extendido, etc.) mas alla de las que ya incorpora el modelo base.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad baja o media, limitado por el tamano de 1,5 mil millones de parametros.
- Generacion de codigo y resolucion de problemas matematicos sencillos, con calidad inferior a la de modelos de mayor tamano.
- Soporte multilingue amplio gracias al modelo base (mas de 29 idiomas, incluidos espanol, ingles, frances, aleman, chino, arabe y japones).
- Soporte de tool calling y function calling estructurado, segun las capacidades documentadas de Qwen2.5-Instruct.
- Capacidad de seguir formatos estructurados (JSON, tablas, plantillas) en la respuesta.
- No se documenta soporte de vision, audio ni modo de razonamiento extendido (thinking mode) en este adaptador.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el adaptador puede cargarse sobre el modelo base en una GPU de consumo y usarse para validar flujos de chat multi-turno con contexto de hasta 32.768 tokens, sin necesidad de infraestructura dedicada.
- Ajuste de estilo o tono en un dominio concreto: al ser un adaptador LoRA entrenado con SFT, puede emplearse como punto de partida para experimentar con personalizacion de respuestas (registro formal, jerga de un sector, formato de salida especifico) sin reentrenar el modelo completo.
- Generacion de codigo en entornos con recursos limitados: el modelo base de 1,5B puede ejecutarse en GPUs de 8-12 GB con cuantizacion de 4 bits, adecuado para autocompletado, generacion de tests unitarios o explicacion de fragmentos de codigo en herramientas de desarrollo locales.
- Extraccion de informacion estructurada: con tool calling y salida JSON, puede integrarse en pipelines de procesamiento de documentos para clasificar, resumir o extraer campos de textos cortos y medianos.
- Educacion y asistencia en linea: despliegue en entornos de bajo coste para responder preguntas frecuentes, generar ejercicios o resumir material didactico en varios idiomas, con la ventaja de que el modelo base ya soporta espanol con soltura.
- Experimentacion en investigacion sobre PEFT: el repositorio sirve como ejemplo de publicacion de un adaptador LoRA sobre Qwen2.5, util para estudiar el impacto de SFT en modelos pequenos y comparar con el modelo base sin ajustar.
- Chatbots de atencion al cliente de baja concurrencia: con contexto de 32K tokens y cuantizacion de 4 bits, puede gestionar conversaciones con historial largo en despliegues de una sola GPU, aunque la calidad de razonamiento es limitada frente a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna evaluacion, y no se han encontrado datos externos sobre el rendimiento especifico de esta version. Para estimar capacidades, debe consultarse la documentacion oficial de Qwen2.5-1.5B-Instruct, que reporta resultados en MMLU, HumanEval, GSM8K y otros conjuntos, pero esos numeros corresponden al modelo base y no al adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 3 GB para los pesos mas overhead de activaciones y cache KV; en la practica, 4-6 GB con contexto moderado.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 1,2-1,5 GB para los pesos, con 2-4 GB totales incluyendo contexto.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10G, L4, A100 y H100. Cabe holgadamente en cualquier GPU de consumo con 8 GB o mas.
- Despliegue: compatible con transformers + PEFT, vLLM (cargando el adaptador sobre el modelo base), llama.cpp (tras fusionar y convertir a GGUF), Ollama (mediante Modelfile con el modelo fusionado), TGI y text-generation-inference.
- Latencia y throughput: no disponibles para este adaptador. Como referencia, un modelo de 1,5B en FP16 sobre una RTX 4090 puede superar varios cientos de tokens por segundo en generacion, pero no se han publicado mediciones especificas.
- El adaptador en si ocupa aproximadamente 0,1 GB, por lo que el requisito real lo determina el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kodetr/SasakLLM-1.5B-Instruct-v4 | 1,5B (base) + LoRA | 32.768 | no disponible | Hugging Face (adaptador PEFT) | Sin evaluacion publicada; requiere modelo base |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face, Ollama, vLLM | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Hugging Face, Ollama | Contexto mayor, licencia con restricciones de uso |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | Hugging Face, Ollama | Mayor numero de parametros, contexto menor |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | Hugging Face, Ollama | Mayor calidad de razonamiento, mas VRAM |

## Limitaciones y advertencias

- La model card esta practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas. Esto impide auditar el comportamiento del adaptador.
- No se declara licencia para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en el repositorio genera incertidumbre legal para uso comercial. Debe contactarse con el autor antes de desplegarlo en produccion.
- No se declaran idiomas soportados para el adaptador; el comportamiento multilingue depende del modelo base y puede degradarse tras el ajuste SFT si el dataset era monolingue.
- Riesgo de alucinacion elevado por el tamano reducido del modelo base (1,5B), especialmente en tareas de razonamiento multi-paso, matematicas complejas y conocimiento factual actualizado.
- El ajuste SFT puede haber introducido sesgos de estilo o de contenido derivados del dataset de entrenamiento, que no se documenta.
- La fecha de creacion del repositorio (2026-11-02) y la ausencia de descargas y likes sugieren que se trata de una publicacion reciente y sin validacion por parte de la comunidad.
- No apto para tareas que requieran alta fiabilidad factual, cumplimiento normativo estricto o razonamiento avanzado sin una capa de verificacion externa.
- El adaptador debe combinarse con el modelo base; no es un modelo autonomo y no puede desplegarse por si solo.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v4
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
