# introvoyz04/Cosmos-Reason2-32B

## Resumen

Cosmos-Reason2-32B es un modelo de lenguaje y visión (VLM) orientado a razonamiento físico para IA encarnada y robótica, desarrollado por NVIDIA dentro de la familia Cosmos. El checkpoint analizado aquí, `introvoyz04/Cosmos-Reason2-32B`, es una publicación de un tercero que parte del modelo base `Qwen/Qwen3-VL-32B-Instruct` y lo adapta a la arquitectura y convenciones de la librería `cosmos`. El modelo resuelve el problema de dotar a agentes robóticos y sistemas de visión artificial de capacidad de razonamiento sobre el mundo físico: comprensión de escenas, relaciones espaciales, causalidad física y sentido común aplicado a la acción.

Con 33.357.390.064 parámetros totales (aproximadamente 33,4 mil millones) y un repositorio de 66,7 GB en formato safetensors, se posiciona en la gama alta de VLMs open source. Su pipeline es `image-text-to-text`, lo que permite entrada conjunta de imágenes y texto con salida textual. La relevancia actual radica en la creciente demanda de modelos que no solo describan imágenes, sino que razonen sobre ellas de forma estructurada para planificación de tareas, control de robots y automatización industrial.

La licencia es la NVIDIA Open Model License, que permite uso comercial y creación de modelos derivados con condiciones de atribución. La información pública disponible sobre este checkpoint concreto es escasa: no se han publicado benchmarks, idiomas soportados ni detalles de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (vision-language); empaquetada para la libreria `cosmos` |
| Parametros totales | 33.357.390.064 (~33,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3-VL-32B-Instruct`, un transformer multimodal de tipo vision-language con aproximadamente 33,4 mil millones de parámetros. La arquitectura combina un codificador visual con un decodificador de lenguaje autorregresivo, lo que habilita el pipeline `image-text-to-text`. El checkpoint se distribuye con la etiqueta `qwen3_vl` y la librería `cosmos`, lo que sugiere una adaptación de los pesos y la configuración al ecosistema de NVIDIA Cosmos para razonamiento físico.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en este checkpoint concreto. La model card únicamente reproduce el texto de la licencia, sin apartados técnicos sobre datos o proceso de entrenamiento. Las referencias arXiv incluidas en los tags (2503.06800, 2406.10721, 2603.18178, 2312.14115) apuntan a la documentación científica de la familia Cosmos y Qwen, pero no se detalla su contenido en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y texto combinados.
- Comprensión de escenas visuales orientada a razonamiento físico y espacial (propósito declarado de la familia Cosmos-Reason2).
- Conversación multi-turno (`conversational`).
- Razonamiento de sentido común y conocimiento previo sobre el mundo físico, según la documentación de NVIDIA Cosmos.
- Capacidades de codigo y matematicas: no disponible de forma específica para este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el propósito de la familia es la planificación para agentes físicos.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: visión confirmada por el pipeline; modo thinking y audio no disponibles.

## Casos de uso

- Razonamiento sobre escenas robóticas: el modelo recibe imágenes de cámaras de un robot y texto con la tarea, y genera razonamiento estructurado sobre objetos, relaciones espaciales y pasos siguientes. Es adecuado por su orientación explícita a IA física.
- Planificación de manipulación: dado un objetivo ("coloca la taza en el estante"), el modelo puede razonar sobre la imagen del entorno y proponer una secuencia de acciones, aprovechando su comprensión de física y causalidad.
- Inspección visual industrial: análisis de imágenes de líneas de producción para detectar anomalías y razonar sobre causas probables, combinando percepción visual con explicación textual.
- Asistencia a operadores en entornos físicos: conversación multi-turno donde el operador comparte capturas y el modelo razona sobre el estado del entorno y recomienda actuaciones.
- Anotación y descripción semántica de datasets visuales: generación de descripciones ricas y razonadas de imágenes para entrenar otros modelos o construir bases de conocimiento visual.
- Evaluación de seguridad en robótica: análisis de imágenes de escenas de trabajo para identificar riesgos físicos y justificar la evaluación con razonamiento explícito.
- Prototipado de agentes visión-lenguaje: al estar basado en Qwen3-VL-32B-Instruct, puede servir como punto de partida para experimentos de investigación en razonamiento físico, siempre que se respete la licencia NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33,4 mil millones de parámetros, en precisión BF16 se requieren aproximadamente 67 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, en torno a 34-36 GB; en 4 bits, en torno a 18-20 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16. Para cuantización 4 bits podría caber en una RTX 4090 de 24 GB, aunque con margen ajustado y sin datos de latencia publicados.
- Cabe en GPU consumer: solo en cuantizaciones agresivas (4 bits) y con posible offload; no está confirmado por el autor.
- Opciones de despliegue: la librería declarada es `cosmos`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible. Al estar basado en Qwen3-VL, es plausible el soporte en frameworks compatibles con dicha arquitectura, pero no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Cosmos-Reason2-32B (este checkpoint) | ~33,4 B | no disponible | NVIDIA Open Model License | Razonamiento físico y robótica (VLM) |
| Qwen/Qwen3-VL-32B-Instruct (modelo base) | ~32 B (según nombre) | no disponible | no disponible en esta ficha | VLM conversacional general |
| nvidia/Cosmos-Reason2-32B (original) | no disponible | no disponible | NVIDIA Open Model License | Razonamiento físico y robótica (VLM) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes de este checkpoint, por lo que su rendimiento real es desconocido.
- El checkpoint es una publicación de un tercero (`introvoyz04`) sobre el modelo original de NVIDIA; no hay garantía de que los pesos o la configuración coincidan exactamente con la versión oficial.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión; en contextos robóticos, una alucinación sobre el entorno físico puede tener consecuencias de seguridad.
- Sesgos conocidos: no documentados en la información disponible; se heredan potencialmente los del modelo base Qwen3-VL-32B-Instruct.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera de los idiomas del modelo base.
- Licencia: NVIDIA Open Model License permite uso comercial y modelos derivados, pero exige incluir el aviso "Licensed by NVIDIA Corporation under the NVIDIA Open Model License" y, para modelos Cosmos, la atribución "Built on NVIDIA Cosmos". La licencia es revocable y exige cumplir los términos de Trustworthy AI de NVIDIA. No se permite eludir salvaguardas técnicas sin equivalentes.
- Al estar etiquetado como posible modelo de propósito especial (Special-Purpose Model) por parte de NVIDIA, no debería usarse para aplicaciones generales no previstas.
- No hay información sobre el contexto máximo, lo que impide planificar cargas con documentos o secuencias largas.
- El tamaño del repositorio (66,7 GB) implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/introvoyz04/Cosmos-Reason2-32B
- Hugging Face (modelo original NVIDIA): https://huggingface.co/nvidia/Cosmos-Reason2-32B
- Documentación NVIDIA Cosmos-Reason2: https://docs.nvidia.com/cosmos/latest/reason2/index.html
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
- Términos Trustworthy AI de NVIDIA: https://www.nvidia.com/en-us/agreements/trustworthy-ai/terms/
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Referencias arXiv en tags: arxiv.org/abs/2503.06800, arxiv.org/abs/2406.10721, arxiv.org/abs/2603.18178, arxiv.org/abs/2312.14115
