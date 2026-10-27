# fluffy0714/z-image-turbo-nsfw-v2-GGUF

## Resumen

`fluffy0714/z-image-turbo-nsfw-v2-GGUF` es una conversion a formato GGUF del finetune para adultos `tewea/z_image_turbo_bf16_nsfw`, que a su vez deriva del modelo de difusion text-to-image `Tongyi-MAI/Z-Image-Turbo` de Tongyi (Alibaba). El repositorio no introduce ningun entrenamiento nuevo: unicamente toma el fichero `z_image_turbo_bf16_nsfw_v2.safetensors` y lo cuantiza a Q8_0 con las herramientas de city96 para ComfyUI-GGUF, con el objetivo de reducir el uso de VRAM manteniendo una calidad cercana al bf16 original.

El modelo tiene 6.154.908.736 parametros (unos 6,15 mil millones) y se distribuye como un unico fichero GGUF de aproximadamente 6,8 GB, publicado bajo licencia Apache 2.0. Al ser una variante "Turbo" destilada, esta disenado para inferencia con pocos pasos (en torno a 8) y valores de CFG bajos, lo que reduce el coste computacional por imagen frente a los pipelines de difusion clasicos de 20-50 pasos.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de difusion de ~6B en GPUs de consumo gracias a la cuantizacion; por otro, el caracter NSFW del finetune lo situa en un nicho de contenido para adultos que exige verificacion de edad y cumplimiento legal estricto. El repositorio es de octubre de 2026 y no registra descargas ni valoraciones, por lo que no existe validacion comunitaria independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image; el backbone no se detalla en la informacion disponible. El flujo de uso exige encoder de texto y VAE separados del fichero de difusion |
| Parametros totales | 6.154.908.736 (~6,15 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (en un modelo de difusion el equivalente seria la resolucion maxima soportada, que no se documenta) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`z_image_nsfw_v2-Q8_0.gguf`, ~6,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del backbone mas alla de que se trata de un modelo de difusion text-to-image cargado mediante el nodo "Unet Loader (GGUF)" de ComfyUI, con encoder de texto y VAE externos. El repositorio es exclusivamente una conversion de formato: no hay entrenamiento, fine-tuning ni destilacion adicionales por parte de `fluffy0714`. La cadena de procedencia es `tewea/z_image_turbo_bf16_nsfw` (finetune NSFW en bf16) sobre `Tongyi-MAI/Z-Image-Turbo` (modelo base Turbo de Tongyi), ambos Apache 2.0 segun el autor.

La unica innovacion tecnica relevante aportada por el modelo base es la condicion "Turbo": un modelo destilado para funcionar con alrededor de 8 pasos de muestreo y CFG bajo, lo que reduce drasticamente el tiempo por imagen. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; en modelos de difusion esos detalles rara vez se publican, y aqui no aparecen. La conversion a Q8_0 se realizo con las herramientas de city96 para ComfyUI-GGUF, que preservan la estructura de tensores y aplican cuantizacion de 8 bits por bloque.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) con estetica y contenido del finetune NSFW.
- Inferencia de pocos pasos: el autor indica alrededor de 8 pasos con CFG bajo, propio de un modelo destilado tipo Turbo.
- Ejecucion cuantizada en 8 bits (Q8_0), pensada para reducir el consumo de VRAM frente al bf16 sin degradacion severa declarada.
- Integracion en ComfyUI mediante el nodo Unet Loader (GGUF) del plugin ComfyUI-GGUF.
- Contenido para adultos: el finetune esta orientado explicitamente a material NSFW, etiquetado como `not-for-all-audiences`.
- No soporta tool calling ni function calling: es un modelo de difusion, no un LLM.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No procesa vision de entrada ni audio: solo texto a imagen.
- Cobertura multilingue de prompts: no disponible (depende del encoder de texto original, que no se incluye en este repositorio).

## Casos de uso

- Prototipado rapido de pipelines ComfyUI con GGUF: sirve para validar el nodo Unet Loader (GGUF), medir tiempos de carga y comprobar compatibilidad con el encoder de texto y el VAE del modelo original antes de invertir en el bf16 completo.
- Despliegue en hardware de consumo: al ocupar unos 6,8 GB en pesos Q8_0, permite generar imagenes en GPUs de 12-16 GB de VRAM donde la version bf16 resultaria mas ajustada, con ~8 pasos por imagen.
- Generacion de contenido editorial para adultos: ilustracion de ficcion, novelas romanticas o comics para publicos verificados, con control de prompts y de composicion mediante CFG bajo.
- Investigacion en moderacion de contenido: usar el modelo como generador controlado de un dataset de imagenes NSFW para entrenar y evaluar clasificadores de seguridad y filtros de plataforma.
- Pruebas de sesgo y representacion: analizar como un finetune NSFW de un modelo Turbo representa cuerpos, generos y etnias, comparando la salida Q8_0 con el bf16 de referencia.
- Benchmarking de cuantizacion: comparar fidelidad visual entre Q8_0 y bf16 sobre el mismo seed y prompt para cuantificar la perdida introducida por la conversion GGUF.
- Experimentacion artistica y de estilo: iteracion rapida de conceptos visuales (moodboards, paletas, encuadres) aprovechando el bajo numero de pasos para explorar muchas variantes en poco tiempo.
- Educacion y demos tecnicas de difusion: explicar el funcionamiento de un modelo Turbo destilado y el efecto de la cuantizacion en un entorno reproducible como ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye FID, CLIP score, evaluaciones humanas ni comparaciones numericas frente al modelo base en bf16.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 6,8 GB solo para el fichero GGUF Q8_0.
- VRAM estimada del pipeline completo: en torno a 10-14 GB para el conjunto difusion + encoder de texto + VAE + activaciones a resoluciones tipicas de 1024 px (estimacion propia a partir del tamano de pesos; no verificada por el autor).
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 y RTX 4090. En tarjetas de 8 GB seria necesario offloading a RAM o reducir resolucion y batch.
- GPUs de datacenter: A100, H100 y L40S sin problema de capacidad; su ventaja aqui es el throughput en batch, no la viabilidad.
- Opciones de despliegue: ComfyUI con el plugin ComfyUI-GGUF (ruta soportada oficialmente por el autor). vLLM, TGI, llama.cpp y Ollama no estan indicados para este tipo de modelo de difusion.
- Latencia y throughput: no disponibles. El unico dato aportado es el regimen de ~8 pasos con CFG bajo, que reduce el coste por imagen frente a pipelines de 20-50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fluffy0714/z-image-turbo-nsfw-v2-GGUF` (este) | ~6,15 mil millones | No disponible | GGUF Q8_0 (~6,8 GB) | Apache 2.0 | HuggingFace, 0 descargas |
| `tewea/z_image_turbo_bf16_nsfw` (base directa) | No disponible en la informacion (presumiblemente identico) | No disponible | safetensors bf16 | Apache 2.0 | HuggingFace |
| `Tongyi-MAI/Z-Image-Turbo` (modelo original) | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos en la informacion proporcionada sobre alternativas de otras familias (por ejemplo SDXL o FLUX.1) que permitan una comparacion rigurosa de parametros, contexto, rendimiento o licencia; por tanto, la comparativa se limita a la cadena de derivacion del propio modelo.

## Limitaciones y advertencias

- Contenido NSFW explicito: el finetune esta disenado para material para adultos. Requiere verificacion de edad, cumplimiento de la legislacion local y de los terminos de uso de la plataforma donde se despliegue.
- Riesgo legal grave en usos concretos: generar imagenes sexuales de personas reales sin consentimiento, o cualquier contenido con menores, es ilegal en la mayoria de jurisdicciones. El modelo no incorpora filtros y la responsabilidad recae por completo en el operador.
- Sin benchmarks ni validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha. No hay evidencia independiente de calidad, estabilidad ni fidelidad al prompt.
- Perdida por cuantizacion: Q8_0 se aproxima al bf16 pero no es identico; la degradacion concreta en detalle fino, texto en imagen o anatomia no esta medida.
- Sesgos no documentados: el dataset del finetune no se publica, por lo que se desconocen los sesgos de representacion corporal, genero, etnia o edad que pueda amplificar.
- Artefactos tipicos de difusion: manos, extremidades, texto y coherencia de escena pueden fallar, especialmente con pocos pasos y CFG bajo.
- Dependencias externas: el repositorio no incluye encoder de texto ni VAE; hay que obtenerlos del modelo original. Un emparejamiento incorrecto degrada la salida.
- Idiomas: sin datos. El soporte multilingue de prompts depende del encoder de texto original, no de este fichero.
- Licencia Apache 2.0 permite uso comercial, pero eso no exonera del cumplimiento de normativas de contenido, derechos de imagen ni normas de las plataformas de distribucion.
- Repositorio de terceros: es una conversion no oficial; el autor del finetune no la ha validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fluffy0714/z-image-turbo-nsfw-v2-GGUF
- Modelo base del finetune: https://huggingface.co/tewea/z_image_turbo_bf16_nsfw
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Herramienta de conversion y nodo ComfyUI: https://github.com/city96/ComfyUI-GGUF
- Herramientas de conversion GGUF: https://github.com/city96/ComfyUI-GGUF/tree/main/tools
