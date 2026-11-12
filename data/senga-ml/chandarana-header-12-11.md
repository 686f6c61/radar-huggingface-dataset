# senga-ml/chandarana-header-12-11

## Resumen

senga-ml/chandarana-header-12-11 es un modelo de la familia vision-encoder-decoder publicado en Hugging Face por el usuario senga-ml. La informacion disponible lo situa en la tarea de image-text-to-text, es decir, generacion de texto condicionada por una imagen de entrada. El repositorio contiene 202.238.392 parametros reales (segun los tensores en safetensors) y ocupa 1,6 GB, lo que sugiere pesos en precision de 16 bits o similar.

La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sustantiva: ni el autor describe el origen de los datos de entrenamiento, ni la licencia, ni los idiomas soportados, ni los resultados de evaluacion. El unico metadato tecnico relevante es la etiqueta `vision-encoder-decoder`, que indica una arquitectura de dos torres (un codificador visual y un decodificador de texto) tipica de modelos tipo captioning o VQA.

Por tanto, esta ficha debe leerse como una descripcion estructural del artefacto publicado, no como una evaluacion de capacidades. Cualquier uso en produccion requeriria una validacion empirica previa por parte del equipo que lo adopte, dado que no hay evidencia publica de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (transformer de dos torres: codificador visual + decodificador de texto) |
| Parametros totales | 202.238.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `vision-encoder-decoder` de Hugging Face corresponde a la clase `VisionEncoderDecoderModel` de la libreria transformers, que combina un codificador de imagen (habitualmente un ViT o un modelo tipo CLIP) con un decodificador de lenguaje autorregresivo. El modelo se carga mediante `transformers` y se sirve con el pipeline `image-text-to-text`. No se dispone de informacion sobre que codificador visual concreto ni que decodificador de texto se han utilizado, ni sobre la resolucion de entrada esperada.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). La model card no incluye hiperparametros de entrenamiento, regimen de precision ni infraestructura de computo. El unico dato verificable es el recuento de parametros del checkpoint (202.238.392) y el tamano del repositorio (1,6 GB).

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) segun el pipeline declarado en el Hub.
- Arquitectura encoder-decoder, apta para tareas de descripcion de imagen y respuesta a preguntas visuales en principio.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni razonamiento multi-paso.
- Cobertura multilingue: no disponible.
- Capacidades especiales (thinking mode, vision adicional, audio): no disponible.

## Casos de uso

- Descripcion automatica de imagenes en catalogos: el modelo puede generar texto a partir de una imagen de entrada mediante el pipeline `image-text-to-text`; adecuado para prototipos de alt-text o metadatos, siempre que se valide la calidad con datos propios.
- Respuesta a preguntas visuales (VQA) en entornos controlados: al ser un encoder-decoder, puede formularse como generacion condicionada por imagen y pregunta; requiere evaluacion previa porque no hay benchmarks publicados.
- Etiquetado asistido de imagenes en pipelines de anotacion: util como generador de borradores que un humano revisa, dado el bajo coste de inferencia de un modelo de 202 M de parametros.
- Extraccion de texto o contenido estructurado de capturas y documentos escaneados: solo si la validacion empirica confirma que el codificador visual maneja ese dominio; no hay garantia documentada.
- Filtrado y moderacion de contenido visual: como clasificador generativo de descripciones para triaje, con supervision humana obligatoria por la ausencia de evaluacion de sesgos.
- Experimentacion academica con arquitecturas vision-encoder-decoder: el checkpoint sirve como base para fine-tuning en tareas especificas de vision-lenguaje, dado su tamano moderado y formato estandar safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,4 GB solo para pesos (202 M de parametros), mas activaciones y cache del codificador visual; en la practica, entre 1 y 2 GB con overhead del runtime.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,2 GB de pesos; no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por memoria; para lotes grandes o baja latencia, A100 o H100 aportan margen pero no son necesarias.
- Cabe holgadamente en GPU consumer, incluidas GPUs de portatil con 6-8 GB.
- Opciones de despliegue: `transformers` con el pipeline `image-text-to-text`; vLLM y TGI no estan confirmados para esta arquitectura concreta; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| senga-ml/chandarana-header-12-11 | 202 M | no disponible | no disponible | Hugging Face, safetensors | Sin model card sustantiva ni benchmarks |
| Modelos ViT-GPT2 de captioning (p. ej. variantes de la comunidad) | ~200-300 M | limitado por el decodificador GPT-2 | variable por checkpoint | Hugging Face | Arquitectura equivalente encoder-decoder; ampliamente evaluados en COCO |
| BLIP / BLIP-2 | 200 M - varios miles de millones | variable | variable | Hugging Face | Familia de referencia para image-text-to-text con evaluacion publicada |
| LLaVA (variantes pequenas) | 7 B+ | varios miles de tokens | variable | Hugging Face | Mayor capacidad pero mucho mayor coste de inferencia |

La comparativa es estructural: no hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada y no documenta sesgos, riesgos ni limitaciones; no hay evaluacion de sesgo publicada.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks, no puede estimarse la fidelidad de las descripciones generadas.
- Licencia no disponible: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no puede garantizarse el comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no disponible: no se puede planificar el uso con entradas largas o conversaciones multi-turno.
- Sin descargas ni likes en el momento de la consulta: no hay senales de comunidad ni de validacion externa.
- El identificador del modelo sugiere un posible fine-tuning especializado (cabecera de documento), pero no hay documentacion que lo confirme; no debe asumirse ese dominio sin verificacion.

## Enlaces

- Hugging Face: https://huggingface.co/senga-ml/chandarana-header-12-11
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada en la model card: https://mlco2.github.io/impact
