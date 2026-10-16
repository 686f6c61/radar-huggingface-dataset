# black-forest-labs/flux-3-image-klein-pup

## Resumen

FLUX 3 Image Klein Prompt Upsampler (PUP) es un modelo vision-lenguaje de 9.409.813.744 parámetros desarrollado por Black Forest Labs. Su única tarea es convertir una petición breve de imagen ("A man walking with his dog, afternoon sun") en el prompt detallado que FLUX 3 Image Klein necesita para generar o editar imágenes. No genera imágenes: produce texto.

Se trata de un ajuste fino completo de Qwen3.5-9B con la torre de visión congelada, entrenado en dos fases: supervisado sobre pares de petición corta y prompt expandido, y después ajuste por preferencias usando pares de prompts generados por el propio modelo, renderizados con FLUX 3 Image Klein con la misma semilla y ordenados según la imagen resultante.

Es relevante porque resuelve un problema práctico de los pipelines de difusión: la calidad del prompt determina la calidad de la imagen. El modelo acepta hasta 10 imágenes de referencia y una lista opcional de bounding boxes, y devuelve un único prompt con medio y estilo, escena, iluminación, cámara, sujetos, colores, materiales y posición en el encuadre. Se publica bajo licencia Apache 2.0 y está integrado por defecto en el código de inferencia oficial de FLUX 3 Image Klein.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`); torre de visión congelada durante el ajuste |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16; no hay GGUF ni variantes cuantizadas oficiales) |
| Idiomas soportados | en (salida en inglés; la petición puede estar en cualquier idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 18,8 GB) |
| Modelo base | Qwen/Qwen3.5-9B |
| Modalidad de entrada | texto + hasta 10 imágenes de referencia + bounding boxes opcionales (JSON) |
| Modalidad de salida | texto (prompt expandido, ~220 palabras en el ejemplo publicado) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 18,8 GB |
| Fecha de publicacion | 2026-10-14 (actualizado 2026-10-15) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5, cargado en Transformers mediante `Qwen3_5ForConditionalGeneration` junto con `AutoProcessor`. El ajuste es completo sobre los pesos de lenguaje, mientras que la torre de visión permanece congelada. La inferencia se realiza con decodificación greedy, `top_p` 0.95, `top_k` 20, `max_new_tokens` 3584 y una penalización de presencia de 1.5 para text-to-image y 0.0 para edición.

El entrenamiento tiene dos etapas: primero un ajuste supervisado sobre pares de peticiones cortas y sus prompts expandidos; después un ajuste por preferencias sobre pares de prompts generados por el propio modelo, renderizados con FLUX 3 Image Klein con la misma semilla y clasificados según la imagen obtenida. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF adicional.

La innovación destacable es el control de modo mediante system prompt: el repositorio incluye `system_prompts.json` con cuatro plantillas (`t2i`, `i2i`, `t2i_bbox`, `i2i_bbox`) que seleccionan generación desde texto, edición con referencias o composición con bounding boxes. En el modo con cajas, las coordenadas se conservan exactamente como una tabla de boxes posterior al prompt y el texto cita cada caja por su identificador, de modo que el modelo de imagen coloca el elemento donde indica la caja.

## Capacidades

- Expansión de prompts para text-to-image: convierte una petición breve en un prompt que decide medio y estilo, escena, iluminación y cámara, y describe cada sujeto con colores, materiales y posición en el encuadre.
- Edición guiada por referencias (image-to-image): analiza las imágenes de referencia y redacta la instrucción en función de lo que aparece en ellas, indicando qué cambia y qué se mantiene, por apariencia.
- Soporte de hasta 10 imágenes de referencia por petición.
- Composición con bounding boxes: acepta cajas en JSON y devuelve el prompt con una tabla de cajas, citando cada box por id.
- Conservación literal de texto a renderizar: el texto que debe aparecer en la imagen se mantiene verbatim, entre comillas.
- Comprensión multilingüe de la petición: la entrada puede estar en cualquier idioma, aunque la salida es siempre en inglés.
- No hay soporte declarado de tool calling, function calling, agentes ni modo de razonamiento explícito (`enable_thinking=False` en el ejemplo de uso).
- Capacidad de rechazo: ninguna. El modelo no rechaza peticiones por sí mismo; el filtrado de seguridad es externo y opcional (`--safety` en el código de inferencia).

## Casos de uso

- Aumento automático de prompts en pipelines de difusión: integrar el modelo delante de FLUX 3 Image Klein, como hace el código oficial por defecto, para que el usuario escriba una frase corta y obtenga una imagen con composición e iluminación controladas.
- Herramientas de diseño y generación de mockups: un diseñador introduce una idea de una línea y el modelo produce el prompt completo con encuadre, luz y materiales, reduciendo el tiempo de iteración sobre la imagen final.
- Edición de imágenes con referencias en producción: usando el system prompt `i2i` y hasta 10 referencias, se pueden automatizar cambios concretos ("put a red bandana around the dog's neck") manteniendo la apariencia del resto de la escena.
- Composición con control de layout: productos de comercio electrónico que deben colocarse en posiciones exactas del encuadre, pasando bounding boxes en JSON y obteniendo un prompt con la tabla de cajas citada por id.
- Localización de interfaces creativas: la petición puede llegar en cualquier idioma y el prompt de salida siempre es inglés, lo que simplifica aplicaciones multilingües que alimentan un único modelo de imagen.
- Generación de texto dentro de la imagen: carteles, rótulos o packaging donde el texto debe reproducirse exactamente; el modelo lo mantiene entre comillas y verbatim.
- Preprocesado y anotación de datasets: expansión masiva de peticiones cortas a prompts detallados para construir o aumentar corpus de entrenamiento de modelos de imagen.
- Integración por CLI o script: `python -m flux3.pup --prompt "..." --out caption.txt` permite usar el modelo solo como upsampler, sin generar imagen, dentro de un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de calidad de prompt o de imagen (por ejemplo, comparativas de preferencia frente a prompts escritos por humanos).

## Requisitos de hardware

- Pesos en bfloat16: 18,8 GB, por lo que la inferencia en precisión completa necesita del orden de 20 a 24 GB de VRAM contando caché KV y activaciones del procesador de imagen; no se publica una estimación oficial de VRAM.
- GPU de datacenter recomendadas: A100 (40 u 80 GB), H100, L40S (48 GB) o similares, donde el modelo cabe con margen.
- GPU de consumo: cabe ajustado en una RTX 4090 de 24 GB en bfloat16; no hay cuantizaciones oficiales que reduzcan el requisito y no se documenta soporte en GPUs de 16 GB o menos.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`, y el código de inferencia oficial `black-forest-labs/flux-3-image-klein` (CLI `scripts/cli.py` y módulo `flux3.pup`).
- vLLM, TGI, llama.cpp y Ollama: no disponible. El autor no documenta soporte para estos servidores y el repositorio solo publica pesos en safetensors bfloat16, sin GGUF.
- Latencia y throughput: no disponible. El único parámetro de generación documentado es `max_new_tokens=3584`, con decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| FLUX 3 Image Klein PUP | 9,41 B | no disponible | Expansion de prompts, edicion y layout para FLUX 3 Image Klein | Apache 2.0 | safetensors bf16 |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | VLM generalista; no esta especializado en reescritura de prompts | Apache 2.0 | safetensors |
| Otros upsamplers de prompt open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos de la misma categoria (reescritura o expansion de prompts para modelos de difusion) en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La salida es siempre en inglés, independientemente del idioma de la petición.
- Los prompts están escritos específicamente para FLUX 3 Image Klein; ningún otro modelo de imagen formó parte del entrenamiento, por lo que su uso con otros generadores no está validado.
- Las imágenes de referencia se redimensionan antes de entrar al modelo (como máximo 1 MP con una sola referencia y menos cuando hay varias), de modo que los detalles pequeños pueden describirse de forma incorrecta.
- El modelo no rechaza peticiones: no incorpora filtrado propio. El código de inferencia permite activar comprobaciones opcionales de prompt e imagen con `--safety`.
- La conservación de bounding boxes es exacta en el texto del prompt, pero el cumplimiento final depende del modelo de imagen que reciba la tabla de cajas.
- No se documentan sesgos conocidos, comportamiento en contextos largos ni cobertura de idiomas más allá de la salida en inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; al tratarse de un modelo generativo que describe imágenes de referencia, puede inventar detalles no presentes en ellas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3.5-9B, también Apache 2.0.
- No hay datos publicados de rendimiento, latencia ni calidad medible, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Modelo de imagen asociado: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo de inferencia: https://github.com/black-forest-labs/flux-3-image-klein
- Ejemplo de prompt expandido: https://github.com/black-forest-labs/flux-3-image-klein/blob/main/examples/base/man_dog.json
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
