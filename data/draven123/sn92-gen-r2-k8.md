# draven123/sn92-gen-r2-k8

## Resumen

`draven123/sn92-gen-r2-k8` es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario draven123. Por sus etiquetas (`gemma4`, `reax`, `bittensor-sn92`) se trata de un ajuste fino o derivado de la familia Gemma, orientado a la subred 92 de Bittensor (SN92), un contexto de mineros y validadores de IA descentralizada. El repositorio tiene acceso restringido (gated) y, en el momento de la consulta, cero descargas y cero likes, lo que indica una publicacion muy reciente y de circulacion limitada.

El checkpoint contiene 31.273.088.876 parametros en formato safetensors, con un tamano de repositorio de 62,6 GB, coherente con pesos en precision bf16/fp16. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque la condicionalidad del acceso en Hugging Face anade un paso de aceptacion de terminos.

La relevancia de esta ficha es acotada: se trata de un artefacto de un ecosistema especifico (Bittensor SN92) sin documentacion publica asociada, sin benchmarks y sin card de modelo detallada. Se documenta lo verificable y se marcan explicitamente los vacios de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma segun tag `gemma4`; detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (acceso gated en Hugging Face) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido, requiere aceptar condiciones |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: `transformers`, `gemma4`, `image-text-to-text` y `reax`. Esto sugiere un transformer decoder-only de la familia Gemma con un adaptador o torre de vision para entrada de imagenes, pero no se especifica el mecanismo de fusion multimodal, la resolucion de imagen soportada ni el tokenizador visual.

No hay datos publicados sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado. La etiqueta `reax` y la referencia a `bittensor-sn92` apuntan a un entrenamiento dentro de un protocolo de mineria/validacion de la subred 92 de Bittensor, pero no se aporta informacion sobre el proceso. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun el tag `conversational`.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y dialogos condicionados por una imagen.
- Integracion con el ecosistema `transformers`, lo que permite cargarlo con `AutoProcessor` y `AutoModelForVision2Seq` (clase exacta no confirmada).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), es decir, pensado para desplegarse en Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades de audio o modo thinking explicito: no disponibles.

## Casos de uso

- Procesamiento de documentos escaneados: el modelo puede recibir una imagen de factura o formulario y devolver texto estructurado, aprovechando su naturaleza image-text-to-text para tareas de extraccion sin OCR intermedio.
- Moderacion de contenido visual en plataformas: clasificacion y descripcion de imagenes subidas por usuarios con justificacion textual, integrable en un pipeline de `transformers` sobre GPU.
- Asistencia a personas con discapacidad visual: descripcion de escenas o lectura de texto en imagenes en una aplicacion movil o web que consulte el modelo via API.
- Etiquetado semiautomatico de datasets multimodales: generacion de captions y pares pregunta-respuesta sobre imagenes para alimentar otros entrenamientos, dado el soporte nativo de entrada imagen+texto.
- Prototipado en el ecosistema Bittensor SN92: uso como minero o referencia de comparacion dentro de la subred, ya que el checkpoint esta etiquetado para ese entorno.
- Despliegue en Hugging Face Inference Endpoints: al estar marcado como `endpoints_compatible`, puede servirse como endpoint gestionado para aplicaciones internas que requieran entrada multimodal.
- Base para ajuste fino posterior: con 31,3 mil millones de parametros y pesos safetensors en precision completa, sirve como punto de partida para tareas visuales especificas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-64 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 70-80 GB o mas para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 32-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090.
- Cuantizacion a 4 bits: alrededor de 17-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090, con perdida de calidad no evaluada.
- GPU recomendadas: H100 80 GB, A100 80 GB para precision completa; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 individual para 4 bits.
- Cabe en GPU de consumo: si, unicamente con cuantizacion agresiva (4 bits) y contexto reducido; no hay GGUF publicado, por lo que habria que generarlo con llama.cpp o similar.
- Opciones de despliegue: `transformers` con `accelerate` o `device_map="auto"`, vLLM (si soporta la arquitectura multimodal concreta, no confirmado), TGI, Hugging Face Inference Endpoints. Ollama y llama.cpp requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| draven123/sn92-gen-r2-k8 | 31,3 B | no disponible | imagen+texto | Apache 2.0 (gated) | Hugging Face, acceso restringido |
| Gemma 3 27B (referencia de familia) | 27 B | 128k (segun documentacion publica de Gemma 3) | texto e imagen | Gemma Terms of Use | Hugging Face, acceso abierto con aceptacion |
| Qwen2.5-VL 32B | 32 B aprox. | 128k aprox. | imagen+texto | Apache 2.0 | Hugging Face, acceso abierto |
| Llama 3.2 90B Vision | 90 B | 128k | imagen+texto | Llama Community License | Hugging Face, acceso abierto con aceptacion |

La comparativa es orientativa: no hay datos publicados de rendimiento para `sn92-gen-r2-k8`, por lo que no puede establecerse una jerarquia de calidad frente a estos modelos. La diferencia practica principal es la falta de documentacion y de benchmarks frente a alternativas con card completa y evaluaciones publicas.

## Limitaciones y advertencias

- Ausencia total de card de modelo, paper o documentacion tecnica: no se puede verificar el proceso de entrenamiento ni la calidad del ajuste.
- Sin benchmarks publicados: el rendimiento real es desconocido y no deberia asumirse equiparable al de la familia Gemma base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatizacion de despliegues.
- Idiomas no declarados: riesgo de comportamiento degradado fuera del idioma o idiomas de entrenamiento, que se desconocen.
- Riesgo de alusiones y errores factuales inherente a los modelos generativos; en tareas visuales, riesgo adicional de describir elementos inexistentes en la imagen.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos demograficos, culturales o de otro tipo.
- Licencia Apache 2.0 declarada, pero la cadena de derivacion respecto a Gemma (cuyos terminos de uso son distintos) no esta aclarada; conviene verificar la procedencia antes de un uso comercial.
- Longitud de contexto desconocida: no planificar aplicaciones que dependan de ventanas largas sin medir empiricamente el comportamiento.
- Sin pesos cuantizados publicados: el despliegue en hardware de consumo exige conversion manual y validacion de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k8
- Perfil del autor: https://huggingface.co/draven123
- Subred Bittensor SN92 (referencia del ecosistema): https://taostats.io/subnets/92
- Documentacion de transformers para modelos vision-language: https://huggingface.co/docs/transformers
- Paper de referencia de la familia Gemma (no especifico de este checkpoint): https://arxiv.org/abs/2403.08295
