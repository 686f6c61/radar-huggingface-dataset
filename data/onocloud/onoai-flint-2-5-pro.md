# onocloud/onoai-flint-2.5-pro

## Resumen

OnoAI Flint 2.5 Pro es un ajuste fino (finetune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario onocloud en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de 3.000 millones de parametros construido sobre la arquitectura Qwen2, entrenado mediante las librerias Unsloth y TRL de Hugging Face, que permiten acelerar el proceso de ajuste fino aproximadamente el doble respecto a un entrenamiento convencional.

El modelo hereda las capacidades del Qwen2.5-3B-Instruct original, un transformer decoder-only denso con soporte para conversacion multi-turno, generacion de codigo y comprension multilingue. La model card no documenta el dataset de ajuste, el numero de tokens de entrenamiento ni los hiperparametros utilizados, por lo que la informacion disponible es muy limitada y se limita a la declaracion del modelo base y la herramienta de entrenamiento.

Su relevancia practica reside en su bajo coste de despliegue: al tratarse de un modelo de 3B parametros, puede ejecutarse en GPUs de consumo y en entornos con recursos limitados, lo que lo hace adecuado para prototipado rapido, experimentacion y tareas de generacion de texto en ingles. No obstante, al no existir benchmarks publicados ni documentacion del proceso de ajuste, su evaluacion debe realizarse de forma empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.000 millones (heredados de Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la model card (el modelo base admite cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion QKV. Al derivar de Qwen2.5-3B-Instruct, incorpora el ajuste por instrucciones realizado por el equipo de Qwen sobre el modelo base, que incluye tecnicas de alineacion no detalladas en esta model card.

El ajuste fino adicional fue realizado por onocloud utilizando Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card. No se especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste por instrucciones de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a preguntas de dominio general.
- Generacion de codigo y explicacion de fragmentos de codigo, dentro de las capacidades del modelo base de 3B parametros.
- Razonamiento matematico de complejidad baja a media.
- Soporte de conversacion multi-turno con formato de chat (ChatML, heredado de Qwen2.5).
- Capacidades multilingues limitadas: la model card declara unicamente ingles, aunque el modelo base Qwen2.5 soporta multiples idiomas.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la model card.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una GPU de consumo para validar flujos de chat multi-turno antes de migrar a modelos mayores, gracias a su tamano de 3B parametros.
- Generacion de texto en entornos con recursos limitados: adecuado para aplicaciones edge o servidores sin GPU dedicada de alta gama, donde un modelo de 3B cuantizado a 4 bits ocupa aproximadamente 2 GB de VRAM.
- Asistencia basica de codigo: puede integrarse en editores o pipelines internos para autocompletar y explicar fragmentos de codigo en ingles, aunque con menor fiabilidad que modelos especializados de mayor tamano.
- Clasificacion y extraccion de informacion: el modelo puede emplearse para tareas de etiquetado, resumen y extraccion de entidades en textos en ingles dentro de pipelines de procesamiento por lotes.
- Experimentacion academica y ajuste fino adicional: al estar bajo licencia Apache 2.0 y publicarse en safetensors, sirve como punto de partida para nuevos finetunes con Unsloth o TRL.
- Generacion de contenido de baja criticidad: borradores de correos, descripciones y textos de relleno en ingles donde el coste de error es bajo y se requiere throughput alto.
- Evaluacion comparativa de tecnicas de ajuste: util para investigadores que quieran medir el efecto de finetunes ligeros sobre Qwen2.5-3B-Instruct con fines de benchmarking interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6 GB (3B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3-4 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF/AWQ): aproximadamente 2-2,5 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPUs de consumo: si, en modelos con al menos 6 GB de VRAM en FP16 y en GPUs con 4 GB o mas usando cuantizacion.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF), dado que el modelo base Qwen2.5 cuenta con soporte amplio en estas herramientas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| onocloud/onoai-flint-2.5-pro | 3B | no disponible en la model card | Apache 2.0 | Hugging Face | Finetune de Qwen2.5-3B-Instruct sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama, vLLM | Modelo base oficial, con benchmarks publicados por Qwen |
| Llama 3.2 3B Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, Ollama | Requiere aceptacion de licencia; no Apache 2.0 |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Hugging Face, Ollama | Ligeramente mayor, con benchmarks publicados por Microsoft |

## Limitaciones y advertencias

- No se documenta el dataset de ajuste fino, por lo que se desconocen posibles sesgos introducidos durante el entrenamiento.
- Riesgo de alucinacion inherente a los modelos de 3B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La model card declara unicamente soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- No se han publicado benchmarks, por lo que no es posible verificar mejoras o degradaciones respecto al modelo base Qwen2.5-3B-Instruct.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentacion sobre el proceso de ajuste impide garantizar la procedencia y licencia de los datos de entrenamiento utilizados.
- El tamano del repositorio aparece como 0.0 GB, lo que puede indicar que los pesos no estan subidos correctamente o que la informacion esta incompleta; conviene verificarlo antes de su uso en produccion.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse su disponibilidad sin pruebas empiricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onocloud/onoai-flint-2.5-pro
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
