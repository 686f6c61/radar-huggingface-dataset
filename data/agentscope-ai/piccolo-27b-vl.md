# agentscope-ai/Piccolo-27B-VL

## Resumen

Piccolo-27B-VL es un modelo de lenguaje y vision (image-text-to-text) publicado por agentscope-ai bajo la arquitectura Qwen3_5ForConditionalGeneration. Con 27.781.427.952 parametros (aproximadamente 27,8 mil millones), se posiciona en la gama de modelos densos de gran tamano orientados a tareas multimodales, combinando un codificador de vision con un decodificador de lenguaje de la familia Qwen3.5.

El modelo se distribuye en formato Safetensors con 11 shards principales mas un fichero adicional `model-frozen-mtp.safetensors`, todos ellos referenciados por `model.safetensors.index.json`. El repositorio incluye las configuraciones originales de modelo, generacion, tokenizer y processor, ademas de la plantilla de chat, lo que facilita su uso directo con la libreria transformers.

Su relevancia actual radica en que el autor declara el primer puesto en el ranking Decision Index Vision Full con una puntuacion de 75,59 (80,22 en Vision Public y 70,97 en Vision Private). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto frente a alternativas con licencias mas restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con configuracion de vision) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; se desconoce si hay versiones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (11 shards principales + `model-frozen-mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Qwen3_5ForConditionalGeneration`, es decir, un transformer multimodal con un modulo de vision acoplado a un decodificador de lenguaje de la familia Qwen3.5. La model card menciona explicitamente una "vision configuration" y la presencia de un fichero `model-frozen-mtp.safetensors`, lo que sugiere el uso de multi-token prediction (MTP) con pesos congelados, una tecnica habitual para acelerar la decodificacion o mejorar la calidad del entrenamiento en modelos recientes.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o similar. Tampoco se detallan innovaciones adicionales como decodificacion especulativa, atencion lineal o estrategias de mezcla de expertos. Toda esta informacion debe considerarse no disponible a partir de los datos publicados.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento multimodal: la evaluacion en Decision Index Vision Full sugiere capacidad para tareas que combinan percepcion visual y razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir imagenes de facturas, formularios o contratos y extraer informacion estructurada combinando OCR implicito con razonamiento textual, gracias a su naturaleza image-text-to-text.
- Asistencia en soporte tecnico con capturas de pantalla: un usuario envia una captura de un error y el modelo interpreta la interfaz, identifica el problema y propone pasos de resolucion en una conversacion multi-turno.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios para detectar contenido no permitido, aprovechando la licencia Apache 2.0 para despliegue comercial.
- Accesibilidad: generacion automatica de descripciones alternativas detalladas de imagenes para lectores de pantalla y plataformas de contenido.
- E-commerce: generacion de fichas de producto a partir de fotografias, incluyendo atributos visuales (color, material, forma) y texto comercial coherente.
- Analisis de imagenes medicas o industriales asistido: como primer filtro de triaje o inspeccion visual, siempre con supervision humana dada la naturaleza critica del dominio.
- Investigacion en vision-lenguaje: uso como checkpoint base para fine-tuning en tareas especificas, gracias a la disponibilidad de pesos Safetensors y configuraciones completas.

## Benchmarks y rendimiento

| Benchmark | Vision Full | Vision Public | Vision Private |
|---|---:|---:|---:|
| Decision Index | 75,59 | 80,22 | 70,97 |

El autor declara el primer puesto en el ranking Decision Index Vision Full. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval, GSM8K o MMMU, por lo que no es posible comparar con modelos similares en esas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55-56 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 15-18 GB, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, siempre que existan pesos cuantizados (no confirmados oficialmente).
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; A100 40 GB o configuraciones multi-GPU para 8 bits.
- Despliegue: transformers de forma nativa; vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Piccolo-27B-VL | ~27,8 B | no disponible | Apache 2.0 | Primer puesto declarado en Decision Index Vision Full (75,59) |
| Qwen2.5-VL-32B | ~32 B | no disponible en esta ficha | Apache 2.0 | Alternativa multimodal de tamano similar de la familia Qwen |
| Gemma 3 27B (multimodal) | ~27 B | no disponible en esta ficha | Gemma license | Modelo multimodal de Google con tamano comparable |
| InternVL 2.5 (variantes ~26 B) | ~26 B | no disponible en esta ficha | MIT/Apache segun variante | Familia multimodal open source de referencia |

La comparacion cuantitativa de rendimiento no es posible con los datos disponibles, ya que los benchmarks publicados se limitan al Decision Index del propio autor y no hay resultados cruzados con las alternativas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, por lo que se desconoce su comportamiento en dominios sensibles (genero, etnia, religion).
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de descripcion visual detallada o lectura de texto en imagenes.
- Longitud de contexto no documentada: no es posible planificar casos de uso con documentos largos sin verificacion empirica.
- Idiomas soportados no documentados; el rendimiento fuera del ingles o chino (idiomas habituales en la familia Qwen) es incierto.
- El fichero `model-frozen-mtp.safetensors` sugiere componentes de multi-token prediction cuyo manejo puede requerir versiones especificas de transformers o configuraciones adicionales.
- El modelo tiene muy pocas descargas (216) y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las condiciones de los datos de entrenamiento subyacentes, no documentadas.
- El tamano del repositorio (165,9 GB) implica requisitos de almacenamiento considerables y tiempos de descarga elevados.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-VL
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
