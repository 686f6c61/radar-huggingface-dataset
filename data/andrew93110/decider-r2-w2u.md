# Andrew93110/decider-r2-w2u

## Resumen

decider-r2-w2u es un modelo multimodal de tipo image-text-to-text publicado por el usuario Andrew93110 en Hugging Face. Se trata de un merge (fusión) del modelo base MachinePulseAI/karpo-decision-31B, un modelo de decisión de 31B parámetros orientado a tareas de razonamiento y toma de decisiones dentro del ecosistema Bittensor (subnet 92, "reax"). El modelo conserva la arquitectura de la familia Gemma 4 según las etiquetas del repositorio, e incorpora capacidades de procesamiento conjunto de imagen y texto.

El modelo tiene 31.273.088.876 parámetros en formato safetensors (aproximadamente 31,3B), lo que lo sitúa en la gama de modelos grandes que requieren hardware de datacenter o configuraciones multi-GPU para inferencia en precisión completa. El repositorio ocupa 62,6 GB, coherente con pesos en bf16/fp16. La licencia es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es acotada: se trata de un modelo derivado, con cero descargas y cero likes en el momento de la consulta, sin documentación pública de benchmarks ni idiomas soportados declarados. Es útil principalmente como artefacto de investigación dentro del ecosistema Bittensor/reax y como ejemplo de merge de un modelo de decisión multimodal, no como un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4 segun tags |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la familia Gemma 4 y emplea una arquitectura transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). El modelo es un merge del checkpoint MachinePulseAI/karpo-decision-31B, un modelo de decision de 31B. No se dispone de detalles sobre el proceso de merge (metodo, capas fusionadas, hiperparametros) ni sobre si hubo entrenamiento adicional tras la fusion.

No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o tecnicas de alineacion, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El tag "reax" y "bittensor"/"sn92" sugieren que el modelo esta vinculado a la subnet 92 de Bittensor, orientada a tareas de decision, pero no se documenta el pipeline de entrenamiento asociado.

## Capacidades

- Generacion de texto conversacional (tag "conversational").
- Procesamiento multimodal imagen-texto: acepta imagenes junto con texto como entrada.
- Orientacion a tareas de decision y razonamiento (tag "decision-model").
- Integracion con endpoints compatibles (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion.

## Casos de uso

- Evaluacion de modelos de decision en el ecosistema Bittensor: el modelo puede desplegarse como nodo de inferencia en la subnet 92 (reax) para comparar su comportamiento frente al modelo base karpo-decision-31B, dado que es un merge derivado del mismo.
- Investigacion sobre fusion de modelos (model merging): sirve como caso de estudio para analizar como un merge de un modelo de decision de 31B afecta a las capacidades multimodales heredadas de la familia Gemma 4.
- Experimentos de razonamiento visual: al aceptar pares imagen-texto, permite prototipar tareas de decision asistida por imagen (por ejemplo, clasificacion o seleccion de acciones a partir de capturas de pantalla) en entornos de laboratorio.
- Base para fine-tuning especifico: con licencia Apache 2.0 y pesos safetensors, puede servir como punto de partida para ajuste supervisado en dominios concretos de decision, siempre que se acepte la condicion de acceso gated.
- Despliegue conversacional interno: el tag "conversational" y la compatibilidad con endpoints permiten integrarlo en prototipos de chat internos, aunque sin garantias de calidad documentadas.
- Comparacion de arquitecturas multimodales: util para investigadores que necesiten contrastar el comportamiento de un merge Gemma 4 de 31B frente a otros modelos image-text-to-text de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 62-63 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 80 GB.
- Cuantizacion a 8 bits: alrededor de 31-32 GB de VRAM, viable en una A100 40GB o H100 80GB.
- Cuantizacion a 4 bits: alrededor de 16-18 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se publican pesos GGUF ni cuantizados en el repositorio.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x RTX 4090, 2x A6000) para inferencia en precision completa.
- Cabe en consumer GPU: solo mediante cuantizacion agresiva (4 bits) y si se generan los pesos cuantizados de forma local, ya que el repo solo ofrece safetensors.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-r2-w2u | ~31,3B | no disponible | Si (image-text-to-text) | Apache 2.0 | Gated en HF |
| MachinePulseAI/karpo-decision-31B (base) | ~31B | no disponible | no disponible | no disponible | HF (modelo base) |
| Gemma 4 (familia, referencia) | no disponible | no disponible | Si (segun variante) | Gemma license | Publico en HF |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo derivado de un merge sin documentacion de entrenamiento: no hay garantias sobre la calidad o estabilidad de las capacidades heredadas.
- Cero descargas y cero likes: sin validacion por parte de la comunidad; no se recomienda su uso en produccion sin evaluacion propia.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la integracion automatizada.
- Idiomas soportados no declarados: riesgo de comportamiento deficiente fuera del idioma o idiomas con los que se entreno el modelo base.
- Sesgos conocidos: no disponible en la informacion.
- Riesgo de alucinacion: no evaluado; al ser un modelo de decision sin benchmarks publicados, el riesgo es desconocido.
- Limitaciones de contexto: longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la ausencia de documentacion de procedencia de los datos del modelo base deben evaluarse legalmente antes de un despliegue comercial.
- Ausencia de pesos cuantizados publicados: obliga a generar GGUF/AWQ/GPTQ de forma local para despliegues con VRAM limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Andrew93110/decider-r2-w2u
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (ecosistema referenciado por los tags): https://bittensor.com
- Subnet 92 (reax, referenciada por los tags): no disponible enlace oficial en la informacion proporcionada
