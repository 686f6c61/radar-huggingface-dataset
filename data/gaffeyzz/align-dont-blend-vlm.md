# Gaffeyzz/Align-Dont-Blend-VLM

## Resumen

Align-Dont-Blend-VLM es un adaptador LoRA para el modelo vision-lenguaje Qwen2.5-VL-7B-Instruct, publicado por el usuario Gaffeyzz en Hugging Face. Su proposito declarado es la deteccion de imagenes generadas por IA (tag `ai-generated-image-detection`), tarea en la que el adaptador se acopla sobre las capacidades nativas de percepcion y razonamiento visual del modelo base para emitir juicios sobre el origen de una imagen.

El artefacto no es un modelo completo: el repositorio pesa aproximadamente 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors compatible con la libreria PEFT. Para utilizarlo es necesario descargar por separado los pesos de Qwen2.5-VL-7B-Instruct, que aporta la arquitectura subyacente: un transformer multimodal de 7 mil millones de parametros con encoder visual y ventana de contexto de 128 000 tokens.

La relevancia del proyecto radica en su enfoque, que el autor denomina "Align, Don't Blend": en lugar de mezclar senales de multiples expertos en un unico clasificador, el adaptador parece alinear el juicio del VLM con una politica de decision concreta. El repositorio incluye referencias a un "pixel-artifact expert" opcional que no forma parte de la publicacion, lo que sugiere un diseno modular con varios componentes especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa mediante PEFT con rango LoRA no especificado en la informacion disponible. Se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer decoder-only con encoder visual que procesa imagenes y texto de forma conjunta; el adaptador modifica un subconjunto de las capas del modelo base para especializarlo en la tarea de deteccion de imagenes sinteticas.

No se han publicado datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas del adaptador. La model card menciona un "pixel-artifact expert" opcional que no se incluye en el repositorio, lo que indica que el sistema completo contempla componentes adicionales no distribuidos en este artefacto.

## Capacidades

- Clasificacion binaria o razonada sobre el origen de una imagen (real frente a generada por IA), segun el tag `ai-generated-image-detection`.
- Razonamiento visual y descripcion de imagenes heredados del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de entradas image-text-to-text, es decir, imagen mas prompt textual con salida en lenguaje natural.
- Capacidades multilingues del modelo base (Qwen2.5-VL soporta multiples idiomas), aunque el adaptador no declara idiomas especificos.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico especifico del adaptador.

## Casos de uso

- Moderacion de contenido en plataformas: el adaptador permite filtrar imagenes sinteticas en flujos de subida de contenido, usando el VLM para justificar la decision en texto y facilitar la revision humana.
- Verificacion periodistica: un redactor puede pasar una imagen sospechosa al modelo junto con una pregunta sobre su autenticidad y obtener una evaluacion razonada que complemente la revision manual.
- Deteccion de deepfakes en redes sociales: integrado en un pipeline de ingestion, el adaptador actua como primera capa de triaje antes de herramientas forenses mas costosas.
- Auditoria de datasets: investigadores pueden etiquetar automaticamente grandes colecciones de imagenes para separar muestras reales de sinteticas antes de entrenar otros modelos.
- Proteccion de marcas: equipos de propiedad intelectual pueden detectar imagenes generadas que imiten productos o campanas, apoyandose en la salida textual del VLM como evidencia.
- Investigacion en forense digital: el adaptador sirve como componente de referencia en estudios comparativos sobre deteccion de imagenes generadas, dado su caracter abierto y su base reproducible sobre Qwen2.5-VL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es minimo (0,1 GB), pero requiere cargar Qwen2.5-VL-7B-Instruct completo para inferencia.
- VRAM estimada para el modelo base en BF16: aproximadamente 16 GB, mas overhead del encoder visual y del contexto.
- En cuantizacion de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits: alrededor de 5-6 GB, dependiendo de la implementacion.
- GPU recomendadas: A100 40 GB o H100 para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 en contextos moderados; RTX 3090 y RTX 4080 viables con cuantizacion.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080) si se aplica cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con PEFT, vLLM (soporte de adaptadores LoRA), TGI y llama.cpp para variantes GGUF del modelo base; el adaptador debe fusionarse o cargarse como modulo PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Align-Dont-Blend-VLM | LoRA sobre 7B | 128k (base) | Deteccion de imagenes IA via VLM | no disponible | Hugging Face, ModelScope |
| Qwen2.5-VL-7B-Instruct | 7B | 128k | VLM generalista | Apache 2.0 (modelo base) | Hugging Face, ModelScope |
| Detectores especializados de imagenes IA (p. ej. clasificadores CNN/ViT) | variable | no aplica | Clasificacion binaria | variable | variable |

La comparacion directa con clasificadores especializados no es posible sin datos de rendimiento publicados. Frente al modelo base, el adaptador anade especializacion en una tarea concreta a costa de un artefacto adicional de 0,1 GB y de la dependencia de los pesos de Qwen2.5-VL.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del adaptador ni sobre la distribucion del dataset de entrenamiento.
- Riesgo de alucinacion inherente al modelo base: el VLM puede justificar de forma plausible una clasificacion incorrecta.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de integrarlo en produccion.
- El adaptador depende de Qwen2.5-VL-7B-Instruct, cuyos pesos deben descargarse por separado y cuya licencia (Apache 2.0) aplica de forma independiente.
- El "pixel-artifact expert" mencionado en la model card no se incluye, por lo que el rendimiento del sistema completo descrito por los autores no es reproducible solo con este repositorio.
- No hay datos de benchmarks, idiomas soportados ni cuantizaciones validadas para el adaptador.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evidencia externa de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Gaffeyzz/Align-Dont-Blend-VLM
- ModelScope: https://modelscope.cn/models/GaffeyGao/Align-Dont-Blend-VLM
- Repositorio GitHub con instrucciones de inferencia: https://github.com/GzZning/Align-Dont-Blend#inference
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
