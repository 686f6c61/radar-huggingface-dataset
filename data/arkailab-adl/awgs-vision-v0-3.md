# ArkAiLab-Adl/awgs-vision-v0.3

## Resumen

AWGS Vision v0.3 es un modelo multimodal experimental de clasificacion de seguridad de imagenes, desarrollado por ArkAiLab-Adl, un laboratorio independiente de investigacion en IA integrado en el ecosistema ArkDevLabs. El modelo recibe una imagen junto con una instruccion en lenguaje natural y genera una respuesta textual estructurada con predicciones de seguridad, incluyendo puntuaciones de confianza para categorias como safe, suggestive, explicit y violence.

El modelo parte de Google Gemma 4 E2B (version de 2 mil millones de parametros) y ha sido ajustado mediante Supervised Fine-Tuning (SFT) utilizando el ecosistema Unsloth. Con aproximadamente 5.12 mil millones de parametros totales y un tamano de repositorio de 10.3 GB, esta disenado para tareas de moderacion de contenido, clasificacion NSFW/no-NSFW y pipelines ligeros de analisis de imagen. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su enfoque especializado: en lugar de ser un modelo generalista, esta optimizado para una tarea concreta de seguridad de contenido, ofreciendo salidas estructuradas en formato JSON que facilitan su integracion en sistemas de moderacion automatizada. No obstante, el autor lo marca como experimental, con limitaciones conocidas en cuanto a generalizacion y consistencia de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Gemma 4 E2B (transformador multimodal) |
| Parametros totales | 5.123.178.051 (5.12 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AWGS Vision v0.3 se construye sobre el modelo base Gemma 4 E2B de Google, concretamente sobre la version optimizada unsloth/gemma-4-E2B. Se trata de un modelo multimodal que procesa entradas de imagen y texto, generando respuestas textuales. El ajuste se realizo mediante Supervised Fine-Tuning (SFT) con un dataset de instrucciones multimodal personalizado, preparado especificamente para la familia AWGS Vision.

El entrenamiento se llevo a cabo con el framework Unsloth, conocido por su eficiencia en el ajuste fino de modelos de lenguaje. La version v0.3 amplia la diversidad de variaciones de imagen en el dataset de entrenamiento respecto a versiones anteriores (v0.1 y v0.2), con el objetivo de mejorar la robustez del modelo ante distintas condiciones visuales. Los detalles especificos sobre la composicion del dataset y las tecnicas de aumento de datos no han sido publicados por el autor.

## Capacidades

- Clasificacion de seguridad de imagenes en categorias amplias: safe, suggestive, explicit y violence.
- Generacion de respuestas estructuradas en formato JSON con puntuaciones de confianza por categoria.
- Procesamiento conjunto de imagen y texto: acepta instrucciones en lenguaje natural junto con la imagen de entrada.
- Clasificacion NSFW/no-NSFW como caso de uso principal.
- Soporte para prototipos de sistemas de moderacion de contenido.
- Manejo de diversas condiciones visuales en las imagenes de entrada, gracias a la diversidad de variaciones introducidas en el entrenamiento de v0.3.
- Capacidad conversacional limitada, al estar especializado en la tarea de clasificacion de seguridad.

## Casos de uso

- Moderacion de contenido en plataformas UGC: el modelo puede analizar imagenes subidas por usuarios y clasificarlas como seguras o no seguras, devolviendo puntuaciones de confianza que permiten a los moderadores priorizar revisiones humanas.
- Filtrado de imagenes en redes sociales: integracion en pipelines de ingestion de imagenes para bloquear automaticamente contenido explicito o violento antes de su publicacion.
- Sistemas de atencion al cliente con envio de imagenes: clasificacion de capturas de pantalla o fotografias enviadas por usuarios para detectar contenido inapropiado o sensible.
- Benchmarking de modelos de moderacion: al ser un modelo ligero (5.12 B), puede utilizarse como referencia comparativa en evaluaciones de sistemas de clasificacion de seguridad de contenido.
- Archivado y etiquetado automatico de bibliotecas de imagenes: clasificacion masiva de imagenes almacenadas para generar metadatos de seguridad y facilitar busquedas filtradas.
- Prototipado rapido de herramientas de analisis de imagen: su salida JSON estructurada y su licencia permisiva permiten integrarlo rapidamente en aplicaciones de investigacion y desarrollo sin fricciones legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe una seccion de evaluacion, pero no se proporcionan datos concretos de rendimiento en datasets estandar como MMLU, HumanEval o datasets especificos de moderacion de contenido. El autor advierte que los resultados de evaluacion deben interpretarse segun la metodologia y el dataset utilizados, y que no representan necesariamente la precision en el mundo real.

## Requisitos de hardware

- VRAM estimada: el tamano del repositorio es de 10.3 GB, por lo que se estima un requisito minimo de aproximadamente 10-12 GB de VRAM para inferencia en precision completa (fp16/bf16).
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o superiores. Modelos con 16 GB de VRAM (como RTX 4080) podrian ser suficientes con cuantizacion, aunque no se han publicado versiones cuantizadas oficiales.
- Compatibilidad con GPU de consumo: si, una RTX 3090 o 4090 puede ejecutar el modelo en fp16 sin problemas.
- Opciones de despliegue: al ser un modelo safetensors basado en Gemma, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversion). No se han publicado archivos GGUF oficiales.
- Latencia y throughput: no disponible. Al ser un modelo de 5.12 B, se espera una latencia moderada en GPU de consumo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AWGS Vision v0.3 | 5.12 B | no disponible | Clasificacion de seguridad de imagenes | Apache 2.0 | Hugging Face |
| AWGS Vision v0.2 | 5.1 B (estimado) | no disponible | Clasificacion de seguridad de imagenes | Apache 2.0 | Hugging Face |
| Gemma 4 E2B (base) | 2 B | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre modelos comparables de otros desarrolladores especializados en clasificacion de seguridad de imagenes con tamano y licencia similares. Los modelos de moderacion de contenido mas conocidos (como los de OpenAI o Google) son propietarios y no publican pesos. La comparativa se limita a la propia familia AWGS Vision y al modelo base.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo marca con estado "experimental" y advierte que no debe considerarse listo para produccion sin validacion previa.
- Formato de salida no garantizado: la salida JSON no esta garantizada en cada generacion; las aplicaciones deben validar, sanear y parsear la respuesta antes de usarla programaticamente.
- Sesgos y generalizacion: el rendimiento en imagenes con variaciones extremas o arbitrarias (compresion, distorsion, condiciones de iluminacion inusuales) no esta garantizado.
- Idioma: solo soporta ingles, lo que limita su uso en sistemas multilingues.
- Datos de entrenamiento no publicados: no se revela la composicion del dataset ni las tecnicas de aumento, lo que dificulta evaluar posibles sesgos.
- Sin benchmarks publicados: no hay datos de rendimiento comparables con otros modelos, lo que impide una evaluacion objetiva de su calidad.
- Riesgo de alucinacion: como modelo de lenguaje, puede generar respuestas inconsistentes o inventar puntuaciones de confianza poco fiables en casos limite.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, al ser un modelo de moderacion de contenido, su uso en sistemas de filtrado debe acompanarse de supervision humana para evitar falsos positivos o negativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArkAiLab-Adl/awgs-vision-v0.3
- Version v0.1 en Hugging Face: https://huggingface.co/ArkAiLab-Adl/awgs-vision-v0.1
- Repositorio de ArkAiLab en GitHub: https://github.com/ArkAiLab-Adl/
- Perfil de organizacion ArkAiLab: https://github.com/ArkAiLab-Adl/.github
- Ficha en LLM Explorer: https://llm-explorer.com/model/ArkAiLab-Adl%2Fawgs-vision-v0.2,5IElOZncfE3BePiDQRpjd8
