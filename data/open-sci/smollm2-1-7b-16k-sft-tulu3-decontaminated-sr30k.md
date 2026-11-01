# open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-sr30k

## Resumen

SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-sr30k es un ajuste fino supervisado (SFT) del modelo ali-elganzory/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated, que a su vez deriva de la familia SmolLM2 de Hugging Face. Lo publica el usuario open-sci y esta orientado a generacion de texto conversacional. Se trata de un modelo denso de 1.711.507.456 parametros (aproximadamente 1,7 mil millones) con pesos en safetensors y formato de arquitectura Llama, entrenado con la libreria transformers.

El modelo resuelve el problema de disponer de un LLM pequeno, desplegable en hardware modesto, afinado sobre un dataset de razonamiento sintetico generado por gpt-oss-120b (Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, 30.000 ejemplos). El nombre del repositorio indica una ventana de contexto de 16k tokens heredada del modelo base, aunque este dato no se confirma de forma explicita en la model card.

Su relevancia es doble: por un lado, es un ejemplo de destilacion de razonamiento desde un modelo grande hacia uno pequeno; por otro, el sufijo "decontaminated" sugiere que el pipeline de datos intenta evitar fugas de benchmarks en el entrenamiento, algo critico para evaluar de forma honesta modelos de razonamiento. La model card es practicamente vacia (generada automaticamente por el Trainer) y no declara resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Llama (según tags y formato de pesos) |
| Parametros totales | 1.711.507.456 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16k tokens según el nombre del modelo base; no confirmado en la model card |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifica la licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de la familia Llama, heredada de SmolLM2-1.7B y de los ajustes previos de ali-elganzory. No hay innovaciones arquitectonicas propias: el valor del modelo esta en el pipeline de ajuste. El entrenamiento se realizo con llama-factory en modo full fine-tuning (no LoRA), sobre 32 dispositivos GPU, con batch efectivo de 128 (batch 1 x acumulacion de gradientes 4 x 32 dispositivos), learning rate 4e-05, scheduler coseno con warmup del 10 % y 5 epocas sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf.

El dataset de entrenamiento son 30.000 ejemplos de formato ShareGPT con trazas de razonamiento generadas por gpt-oss-120b, lo que convierte este ajuste en una destilacion de razonamiento. El modelo base intermedio ya incluia SFT sobre Tulu 3 con un proceso declarado de decontaminacion, de ahi el sufijo del nombre. No se documentan fases de RLHF ni DPO en esta etapa, ni se detalla la composicion exacta del dataset mas alla de su origen. Framework: Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4, Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (tag conversational).
- Razonamiento paso a paso destilado de gpt-oss-120b, orientado a tareas de tipo "superior reasoning".
- Generacion de codigo y matematicas basicas, como capacidad heredada de SmolLM2 y reforzada por el dataset de razonamiento; sin datos de evaluacion que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el formato ShareGPT del dataset sugiere conversaciones multi-turno, pero no se declara capacidad agentica.
- Capacidades multilingues: no disponibles; el modelo base SmolLM2 es predominantemente ingles, pero no se confirma para este ajuste.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con 1,7B de parametros el modelo cabe en una GPU consumer y permite iterar sobre prompts y flujos de chat sin coste de infraestructura elevado.
- Destilacion de razonamiento en entornos con recursos limitados: sirve como estudiante para comparar la calidad de trazas de razonamiento generadas por un modelo de 120B frente a las de un modelo de 1,7B en tareas de logica y matematicas.
- Generacion de codigo en local para autocompletado o explicacion de fragmentos: el modelo puede ejecutarse con llama.cpp u Ollama en un portatil con GPU integrada o CPU, aunque sin garantias de calidad medidas.
- Educacion y experimentacion academica: util como baseline pequeno en investigacion sobre decontaminacion de datos y evaluacion de fuga de benchmarks, dado el sufijo "decontaminated" del linaje.
- Clasificacion y extraccion de informacion en texto: fine-tuning adicional ligero sobre el modelo para tareas de etiquetado o resumen en dominios concretos, aprovechando la ventana de 16k tokens.
- Evaluacion comparativa de pipelines de SFT: el modelo es un punto de referencia reproducible (hiperparametros y framework documentados) para estudiar el efecto de destilar razonamiento desde modelos grandes a pequenos.

## Benchmarks y rendimiento

La model card declara un unico model-index con nombre de tarea `sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__models-ali-elganzor__fa2-smollm2-steps` pero con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB de pesos, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 no son necesarias para inferencia, solo para entrenamiento a gran escala.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas con 6-8 GB o mas; tambien en CPU con llama.cpp.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), llama.cpp y Ollama si se generan pesos GGUF (no publicados oficialmente), vLLM para serving.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-sr30k | 1,71B | 16k (segun nombre) | other | Ajuste SFT sobre razonamiento destilado de gpt-oss-120b; sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8k (modelo original SmolLM2) | Apache 2.0 | Modelo oficial de referencia de la familia; con benchmarks publicados por Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | Alternativa pequena con contexto mayor y evaluaciones publicadas |
| Llama-3.2-1B-Instruct | 1,24B | 128k | Llama 3.2 Community License | Modelo pequeno de Meta con contexto muy superior y benchmarks publicados |

La comparativa es orientativa: no hay datos de rendimiento de este ajuste que permitan una comparacion cuantitativa con las alternativas. La principal diferencia frente a SmolLM2-1.7B-Instruct es el dataset de razonamiento sintetico y el proceso de decontaminacion, no la arquitectura.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta usos previstos, limitaciones ni datos de evaluacion; la informacion disponible es minima.
- Riesgo de alucinacion elevado en un modelo de 1,7B, especialmente en tareas de razonamiento complejo y conocimiento factual.
- El dataset de entrenamiento son 30.000 ejemplos sinteticos generados por otro modelo (gpt-oss-120b); puede heredar sesgos y errores del generador.
- La licencia es "other" sin especificar terminos: no se puede asumir uso comercial libre; es necesario contactar con el autor o revisar el linaje de licencias (SmolLM2 es Apache 2.0, pero los ajustes intermedios pueden imponer condiciones).
- Idiomas soportados no declarados; probablemente ingles predominante, con rendimiento limitado en castellano.
- Contexto de 16k tokens inferido del nombre del modelo base, no confirmado en la model card; verificar antes de usarlo en produccion con contextos largos.
- Sin pesos cuantizados oficiales publicados (GGUF, AWQ, GPTQ); habria que generarlos.
- 0 likes y 197 descargas en el momento de la consulta: ecosistema de validacion practicamente nulo.
- No se documenta soporte de tool calling ni capacidad agentica; no recomendable para pipelines de agentes sin evaluacion previa.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated
- Familia SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Llama-factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion proporcionada.
