# lhaibro/Ministral-3-3B-Instruct-2512

## Resumen

Ministral 3 3B Instruct 2512 es un modelo de lenguaje e imagen de 3.400 millones de parametros (3.849.090.048 parametros totales segun los pesos en safetensors, incluyendo el codificador visual) desarrollado por Mistral AI. Se trata de la variante "instruct" post-entrenada del modelo base Ministral 3 3B Base 2512, el miembro mas pequeno de la familia Ministral 3, disenada especificamente para despliegue en el borde (edge) y en hardware de bajos recursos. El repositorio `lhaibro/Ministral-3-3B-Instruct-2512` es una redistribucion en formato FP8 del checkpoint oficial de Mistral AI, publicada bajo licencia Apache 2.0.

El modelo combina un transformer de lenguaje de aproximadamente 3.4B parametros con un codificador visual de 0.4B, lo que le permite procesar tanto texto como imagenes. Su ventana de contexto alcanza los 256.000 tokens, una cifra notable para su tamano, y soporta once idiomas declarados oficialmente: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe. Esta pensado para aplicaciones ligeras en tiempo real, como clasificacion de texto, extraccion de datos, traduccion eficiente o generacion de contenido corto.

La relevancia de esta ficha radica en que ofrece capacidades de vision, multilingueismo y agentes (function calling nativo y salida JSON) en un paquete que cabe en 8 GB de VRAM en FP8 y menos aun si se cuantiza adicionalmente. Es una opcion atractiva para desarrolladores que necesitan un modelo multimodal pequeno, con licencia permisiva y desplegable en entornos locales o embebidos, sin renunciar a una ventana de contexto amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual); familia Mistral 3, libreria `mistral3` |
| Parametros totales | 3.849.090.048 (3.4B LM + 0.4B vision encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 (checkpoint publicado); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), libreria `vllm`, `mistral-common` |

## Arquitectura y entrenamiento

Ministral 3 3B es un modelo transformer multimodal compuesto por dos modulos: un modelo de lenguaje de aproximadamente 3.400 millones de parametros y un codificador visual de aproximadamente 400 millones. La arquitectura pertenece a la familia Mistral 3 y se distribuye con la libreria `mistral-common`, lo que facilita el tokenizado y el formateo de prompts. El checkpoint publicado en este repositorio es la version instruct post-entrenada en precision FP8, optimizada para tareas de chat e instruccion.

No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de post-entrenamiento (RLHF, DPO u otras tecnicas). La model card menciona que el modelo mantiene un fuerte cumplimiento de system prompts y capacidades agenticas con function calling nativo y salida JSON, lo que sugiere un post-entrenamiento orientado a instrucciones y uso con herramientas. El paper asociado (arXiv:2601.08584) y el blog de Mistral son las referencias para obtener detalles adicionales sobre el entrenamiento.

## Capacidades

- Generacion de texto e instrucciones en once idiomas declarados.
- Vision: analisis de imagenes y generacion de respuestas basadas en contenido visual.
- Razonamiento y comprension de lenguaje natural.
- Function calling nativo y salida en formato JSON para integracion con herramientas.
- Capacidades agenticas y razonamiento multi-paso.
- Fuerte adherencia a system prompts.
- Ventana de contexto de 256k tokens para documentos largos o conversaciones extensas.
- Optimizado para despliegue en el borde y hardware de bajos recursos.

## Casos de uso

- Descripcion de imagenes (image captioning): el codificador visual de 0.4B permite generar descripciones automaticas de imagenes en pipelines de accesibilidad, catalogacion o moderacion de contenido, con un coste computacional bajo.
- Clasificacion de texto: el modelo puede etiquetar documentos o mensajes en tiempo real en entornos con recursos limitados, gracias a su tamano reducido y su capacidad de seguir instrucciones con temperatura baja.
- Traduccion eficiente en tiempo real: con soporte para once idiomas, puede integrarse en aplicaciones de mensajeria o soporte para traduccion de fragmentos cortos en dispositivos locales.
- Extraccion de datos estructurados: la salida JSON nativa y el function calling permiten convertir documentos o formularios en campos estructurados para bases de datos o APIs.
- Generacion de contenido corto: redaccion de respuestas, resumenes o mensajes en aplicaciones de chat y asistentes, con contexto largo si se necesita hilo conversacional extenso.
- Agentes locales con herramientas: integracion en asistentes de escritorio o dispositivos embebidos que invocan funciones (calendario, busqueda, APIs) mediante function calling nativo.
- Fine-tuning y especializacion: al ser Apache 2.0 y caber en 8 GB de VRAM en FP8, es viable ajustarlo en una sola GPU consumer para dominios verticales.

## Benchmarks y rendimiento

La model card oficial incluye resultados de benchmarks para los modelos mayores de la familia (14B y 8B), pero no para el modelo 3B. Los datos disponibles en la informacion proporcionada son:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |
| Ministral 3 8B | 0.787 | 0.860 | 0.668 | 0.616 |
| Qwen3-VL-8B-Thinking | 0.798 | 0.860 | 0.671 | 0.580 |

No se han publicado resultados de benchmarks especificos para el modelo Ministral 3 3B Instruct en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en FP8 para el checkpoint completo; menos si se aplican cuantizaciones adicionales (no disponibles en este repositorio).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP8; el modelo esta disenado para hardware de borde y consumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo, gama RTX con 8 GB o superior).
- Opciones de despliegue: vLLM (libreria declarada del repositorio), `mistral-common` para tokenizado y formateo; otras opciones (llama.cpp, Ollama, TGI) no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 | 3.849.090.048 (3.4B LM + 0.4B vision) | 256k | Si | Apache 2.0 | Hugging Face |
| Ministral 3 8B Instruct 2512 | no disponible en detalle | 256k (familia) | Si (familia) | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Thinking | no disponible | no disponible | Si | no disponible | Hugging Face |

La comparativa detallada con alternativas de mismo tamano (por ejemplo, otros modelos multimodales de 3B-4B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks especificos para la variante 3B, por lo que su rendimiento real frente a alternativas debe validarse empiricamente.
- Riesgo de alucinacion inherente a los modelos de lenguaje de pequeno tamano; conviene verificar salidas en aplicaciones criticas.
- Para vision se recomienda mantener relaciones de aspecto cercanas a 1:1 y evitar imagenes muy alargadas o estrechas, segun la model card.
- La temperatura recomendada para produccion es inferior a 0.1; temperaturas mas altas pueden degradar la adherencia a instrucciones.
- El numero de herramientas expuestas al modelo debe mantenerse minimo para evitar sobrecarga en modo agentico.
- No se dispone de informacion sobre sesgos especificos ni sobre el proceso de alineacion.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es una redistribucion de terceros (`lhaibro`); conviene verificar la integridad de los pesos frente al checkpoint oficial de Mistral AI.
- Los idiomas soportados oficialmente son once; el rendimiento en idiomas no listados no esta garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lhaibro/Ministral-3-3B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Checkpoint oficial instruct: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Blog de Mistral: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Politica de privacidad de Mistral: https://mistral.ai/terms/
- Checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
