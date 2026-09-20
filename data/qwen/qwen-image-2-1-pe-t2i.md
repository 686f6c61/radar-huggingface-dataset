# Qwen/Qwen-Image-2.1-PE-T2I

## Resumen

Qwen-Image-2.1-PE-T2I es un modelo de reescritura de prompts (prompt engineering) publicado por el equipo Qwen, pensado como componente previo del generador de imagenes Qwen-Image-2.1. Se trata de un ajuste fino del modelo multimodal Qwen3.5-VL de 9B, que recibe una peticion de imagen breve escrita en cualquier idioma y devuelve un prompt detallado en ingles junto con una relacion de aspecto recomendada. El resultado se consume directamente en un pipeline de Diffusers (QwenImage21Pipeline) para renderizar la imagen final.

El modelo no genera imagenes por si mismo: su funcion es normalizar y enriquecer la intencion del usuario, resolviendo dos problemas habituales en sistemas text-to-image en produccion, como son la baja calidad de los prompts cortos y la eleccion suboptima de resolucion por parte del usuario. Con 9.409.813.744 parametros reales en safetensors (aproximadamente 9,4B) y un repositorio de 18,8 GB, el modelo se distribuye unicamente en pesos bfloat16, sin cuantizaciones oficiales publicadas.

La relevancia del lanzamiento radica en su formato de salida estructurado (JSON con los campos `rewritten_prompt` y `wh_ratio`) y en su modo de razonamiento explicito, que lo hacen integrable como paso determinista dentro de cadenas automaticas de generacion de imagenes. Se publico en HuggingFace con fecha indicada de 2026-09-20 y, en el momento de la consulta, acumula 12 likes y 0 descargas, es decir, es un modelo recien liberado y sin validacion externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste fino de Qwen3.5-VL (modelo vision-lenguaje basado en transformer, tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4B) |
| Parametros activos | No aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el repositorio (solo pesos safetensors en bfloat16) |
| Idiomas soportados | Entrada en cualquier idioma (segun la model card); salida siempre en ingles |
| Licencia | qwen-research (Qwen Research License Agreement, `license: other`) |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 18,8 GB |
| Pipeline declarado | text-to-image |
| Fecha de publicacion | 2026-09-20 |
| Licencia declarada en tags | license:other |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5-VL 9B, es decir, un transformer multimodal de la familia Qwen orientado a tareas de vision y lenguaje, reutilizado aqui como reescritor de prompts en lugar de como generador de imagenes. La model card no detalla la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. Si se especifica el modo de inferencia: se activa el bloque de razonamiento con `enable_thinking=True`, y la generacion usa `max_new_tokens=16256`, `temperature=1.0`, `top_p=0.95` y `top_k=20` como hiperparametros recomendados por el autor.

La innovacion funcional del modelo es su contrato de salida: tras un bloque `<think>` de razonamiento, emite un objeto JSON con `rewritten_prompt` (prompt extenso en ingles que describe la imagen final) y `wh_ratio` (relacion de aspecto recomendada). El repositorio incluye ademas un fichero `system_prompt.txt` que debe cargarse como mensaje de sistema para obtener el comportamiento esperado. Para el contexto del sistema completo conviene tener en cuenta que el generador asociado, Qwen-Image-2.1, emplea un componente de generacion visual de 7B parametros con 32 capas DiT single-stream, atencion de granularidad mixta y reutilizacion de cache KV de prefijo, y que soporta generacion y edicion unificadas con hasta 10 imagenes de referencia, salidas RGBA con transparencia nativa y edicion local mediante circulos, anotaciones pintadas o mascaras separadas.

## Capacidades

- Reescritura de prompts: convierte una peticion breve, en cualquier idioma, en un prompt largo y detallado en ingles.
- Recomendacion de relacion de aspecto: devuelve uno de los ratios soportados por el pipeline (`1:1`, `4:3`, `3:4`, `3:2`, `2:3`, `16:9`, `9:16`), que el ejemplo oficial mapea a resoluciones de entre 1536x2752 y 2752x1536.
- Razonamiento explicito: genera un bloque `<think>` antes de la respuesta final, lo que permite separar traza de razonamiento y salida consumible.
- Salida estructurada: produce JSON parseable con los dos campos esperados por el pipeline de generacion.
- Entrada multilingue: la model card indica que acepta peticiones en cualquier idioma, aunque no se publica la lista de idiomas soportados ni evaluaciones por idioma.
- Integracion nativa con Diffusers mediante `QwenImage21Pipeline`, y con la pila de Transformers (`AutoModelForCausalLM`, `AutoTokenizer`) y `accelerate`.
- Capacidades de vision heredadas de la base Qwen3.5-VL: no estan documentadas en esta model card para esta variante concreta, por lo que su uso como modelo de comprension visual no esta confirmado.
- Soporte de tool calling, agentes y multi-step reasoning: no documentado en la informacion disponible.

## Casos de uso

- Enriquecimiento de prompts en produccion: colocar el modelo como primer paso de un pipeline text-to-image para que las peticiones cortas de los usuarios se conviertan en prompts detallados; permite mantener la calidad de la imagen con entradas pobres sin reentrenar el generador.
- Seleccion automatica de resolucion: el campo `wh_ratio` elimina la decision del usuario sobre formato y evita composiciones mal encuadradas; el ejemplo oficial mapea cada ratio a una resolucion concreta, lo que estandariza las salidas de un servicio.
- Interfaces multilingues para usuario final: un usuario puede escribir en su idioma nativo y recibir una imagen coherente, ya que el modelo traduce y expande internamente al ingles que consume Qwen-Image-2.1.
- Generacion por lotes de material de marketing: automatizar campanas con cientos de prompts semilla y dejar que el modelo fije prompt y formato por canal (por ejemplo `16:9` para web y `9:16` para movil) de forma consistente.
- Traduccion de briefs creativos: equipos no anglofonos pueden entregar descripciones internas en su idioma y obtener prompts normalizados en ingles, reduciendo la dependencia de un reescritor humano.
- Generacion de datasets sinteticos etiquetados: al producir simultaneamente prompt expandido y ratio, el modelo sirve para crear pares (texto, imagen) con metadatos de formato consistentes para entrenamiento o evaluacion.
- Trazabilidad y depuracion de pipelines generativos: al exponer el bloque `<think>` y un JSON de salida, es posible registrar por que se genero cada prompt y cada formato, lo que facilita auditoria y control de calidad.
- Fichas de producto en comercio electronico: a partir de un titulo o descripcion breve de catalogo, generar prompts de imagen de producto coherentes; conviene combinarlo con la capacidad de edicion con imagenes de referencia de Qwen-Image-2.1 para preservar la identidad del producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda reservar 24 GB o mas.
- GPU recomendadas: A100 (40 GB y 80 GB), H100 (80 GB) y, en el limite, RTX 4090 de 24 GB, donde cabe con `device_map="auto"` y bfloat16 sin cuantizar.
- GPU consumer: cabe en RTX 4090 / RTX 3090 (24 GB) y en tarjetas de 24 GB en general; no cabe en GPU de 8, 12 o 16 GB sin cuantizacion, y el repositorio no publica pesos GGUF, GPTQ ni AWQ.
- Despliegue: el ejemplo oficial usa Transformers (`>=5.4.0`), PyTorch (`>=2.4.0`), `accelerate` y Pillow, con `AutoModelForCausalLM` y `device_map="auto"`. Para el generador de imagenes asociado se usa `diffusers` con `QwenImage21Pipeline`. No hay soporte oficial confirmado para vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Requisito de version: `transformers>=5.4.0`, una version muy reciente, lo que puede complicar entornos con dependencias fijadas.
- Latencia y throughput: no disponibles. Como referencia de carga, la generacion recomendada admite hasta 16256 tokens nuevos con modo de razonamiento activado, lo que implica un coste de generacion elevado por peticion en comparacion con un reescritor de prompt sin traza de pensamiento.
- Almacenamiento: 18,8 GB para el repositorio del reescritor, a los que se suman los pesos del generador Qwen-Image-2.1 en un despliegue completo.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad de datos |
|---|---|---|---|---|---|
| Qwen-Image-2.1-PE-T2I | 9,4B (Qwen3.5-VL ajustado) | Reescritura de prompt + ratio, salida JSON | no disponible | qwen-research | safetensors bf16 en HuggingFace |
| Qwen-Image-2.1 | 7B en el componente de generacion visual (32 capas DiT single-stream) | Generacion y edicion de imagen, RGBA nativo, hasta 10 imagenes de referencia | no disponible | no disponible en la informacion proporcionada | HuggingFace, ModelScope y demo |
| Base Qwen3.5-VL 9B | 9B | Modelo vision-lenguaje de proposito general | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros reescritores de prompt de proposito especifico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks comparativos entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a funcion, tamano y licencia.

## Limitaciones y advertencias

- Licencia: se distribuye bajo Qwen Research License Agreement, etiquetada como `license: other`. Es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que las licencias de tipo research suelen restringir la explotacion en produccion.
- Idiomas: la entrada es multilingue segun el autor, pero la salida es siempre en ingles. No se publica evaluacion por idioma, por lo que la calidad en idiomas distintos del ingles no esta cuantificada.
- Alucinacion: al expandir prompts, el modelo puede introducir elementos, estilos o detalles no solicitados por el usuario, alterando la intencion original de la peticion.
- Naturaleza de componente: no genera imagenes por si mismo; requiere Qwen-Image-2.1 (u otro generador compatible) y su licencia correspondiente para un sistema funcional.
- Salida no directa: el resultado incluye un bloque de razonamiento `<think>` que debe separarse y un JSON que debe parsearse; un parseo ingenuo de la salida completa fallara.
- Madurez: 0 descargas y publicacion reciente, sin benchmarks publicados ni validacion independiente; no se recomienda como dependencia critica sin evaluacion propia.
- Dependencias estrictas: requiere `transformers>=5.4.0` y `torch>=2.4.0`, lo que puede entrar en conflicto con entornos existentes.
- Cuantizacion: no hay pesos cuantizados oficiales, lo que limita el despliegue en hardware de gama media y en CPU.
- Contexto: la longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento con peticiones de entrada muy largas.
- Sesgos: no hay informacion publicada sobre sesgos de generacion, composicion del dataset de ajuste ni mecanismos de mitigacion.
- Coste: el uso recomendado de hasta 16256 tokens nuevos con razonamiento activo incrementa la latencia y el coste por peticion frente a alternativas sin modo de pensamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Modelo generador asociado: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Servidor de Discord: https://discord.gg/CV4E9rpNSD
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados de la busqueda proporcionada (los resultados devueltos correspondian a dominios sin relacion con el modelo).
