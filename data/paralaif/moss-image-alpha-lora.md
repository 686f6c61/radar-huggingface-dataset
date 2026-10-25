# paralaif/MOSS-Image-Alpha-LoRA

## Resumen

MOSS-Image Alpha LoRA es un adaptador LoRA para el modelo de difusion text-to-image MOSS-Image (base: OpenMOSS-Team/MOSS-Image-SFT) que enseña al modelo a generar latentes que transportan senal alfa real, es decir, imagenes PNG con transparencia producidas directamente por el sampler. Lo publica el usuario paralaif bajo una licencia propia denominada moss-alpha-poc y esta pensado para ejecutarse en ComfyUI junto con un VAE RGBA externo (trmz/flux2-klein-alpha) que comparte el espacio latente de la familia FLUX.2 usada por MOSS-Image. La propuesta elimina dos pasos habituales en produccion: el chroma key y el modelo de segmentacion o eliminacion de fondo posterior a la generacion.

El interes tecnico esta en que el VAE RGBA puede decodificar latentes de MOSS directamente, pero MOSS solo ha producido latentes de imagenes RGB opacas, por lo que la alfa decodificada es ruido. Este LoRA corrige esa limitacion y permite transparencia parcial donde corresponde (cristal, alas de hada, gemas, celosias metalicas), algo que un recorte binario no reproduce.

Se trata, en palabras del autor, de una prueba de concepto: se entreno con solo 39 imagenes en unos 40 minutos sobre una unica GPU de consumo de 16 GB. El repositorio ocupa 0,2 GB, acumula 14 likes y 0 descargas en el momento de la consulta, y no se han publicado benchmarks cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion text-to-image (MOSS-Image); backbone exacto no disponible |
| Parametros totales | No disponible (repo de 0,2 GB; numero de parametros del adaptador no publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion); longitud de prompt soportada no disponible |
| Tipos de cuantizacion | Pesos del adaptador en safetensors sin cuantizar; el flujo de referencia usa el modelo base y el text encoder en int8 (`moss_image_sft_int8_convrot`, `qwen3.5_9b_int8_convrot`) y un VAE en safetensors. No se ofrece GGUF |
| Idiomas soportados | No disponible |
| Licencia | `moss-alpha-poc` (campo `license: other`); el VAE RGBA asociado es Apache-2.0; la licencia del modelo base aplica por separado |
| Formato de pesos | safetensors (`moss_alpha_v1.safetensors`), para `models/loras/` en ComfyUI |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT (relacion: adapter) |
| Libreria / runtime | comfyui |
| Pipeline | text-to-image |
| Resolucion de salida | No disponible |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-10-24 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango sobre MOSS-Image, un modelo de difusion text-to-image cuyo decodificador habitual produce RGB opaco. El truco del proyecto es el emparejamiento con un VAE RGBA: como el VAE de trmz/flux2-klein-alpha comparte el espacio latente de la familia FLUX.2, que MOSS-Image tambien emplea, puede decodificar latentes de MOSS sin reentrenar el decodificador. El problema es que MOSS nunca ha generado latentes con informacion de alfa, de modo que la decodificacion RGBA de una salida nativa devuelve una alfa inservible. El LoRA desplaza la distribucion de latentes para que el canal alfa quede codificado de forma util.

No se detalla en la informacion disponible ni el rango del LoRA, ni las capas objetivo, ni hiperparametros de entrenamiento mas alla del regimen: 39 imagenes, aproximadamente 40 minutos, una GPU de consumo de 16 GB. No se especifica si hubo filtrado de datos, aumento, ni composicion del dataset (aunque la galeria sugiere personajes, criaturas, logotipos, objetos de inventario y estructuras arquitectonicas). Tampoco se documenta ninguna innovacion de inferencia como decodificacion especulativa o atencion lineal; la unica pieza no estandar es el VAE RGBA externo y el uso opcional de un LoRA DMD de 8 pasos para acelerar el muestreo.

## Capacidades

- Generacion text-to-image con canal alfa real en la salida del sampler, sin postprocesado de recorte.
- Transparencia parcial correcta en materiales translucidos: alas, aletas, gemas, cristal, celosias y estructuras de tipo torre Eiffel o pagoda.
- Generacion de personajes y criaturas aislados listos para composicion sobre fondos generados por separado.
- Preservacion de tipografia: la model card muestra logotipos y texto legible tras aplicar el LoRA.
- Activos de juego: objetos de inventario (espada, pocion, cofre, escudo), iconos y avatares.
- Composicion por capas: el autor genera cada elemento con el LoRA y lo pega sobre un fondo generado con MOSS.
- Compatible con LoRA de velocidad DMD de 8 pasos para el modelo base SFT (opcional).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- Capacidad multilingue: no disponible (no se documentan idiomas de prompt).
- No hay soporte de vision de entrada, audio ni modo "thinking".

## Casos de uso

- Produccion de activos para videojuegos: generar sprites y objetos de inventario con transparencia directamente en el sampler, evitando un paso de recorte y conservando bordes suaves en materiales translucidos.
- Creacion de stickers y packs de emojis: el flujo pide el sujeto con el sufijo `, isolated on a transparent background` y decodifica con el VAE RGBA, de modo que el PNG sale listo para publicar.
- Composicion de escenas por capas en ilustracion y VFX: personajes generados por separado se pegan sobre fondos tambien generados con MOSS, manteniendo translucidez parcial en alas o agua.
- Catalogos de producto y previsualizacion en e-commerce: obtener el objeto sobre fondo transparente permite reutilizar la misma imagen sobre distintas plantillas o colores de ficha sin repetir el recorte.
- Diseno de logotipos y marcas: la model card muestra que la tipografia de MOSS sobrevive al LoRA, lo que permite iterar logotipos con alfa para presentarlos sobre multiples fondos.
- Prototipado rapido de interfaces y assets de UI: iconos con transparencia generados en una sola pasada reducen el ciclo entre idea y maqueta en ComfyUI.
- Prueba de concepto e investigacion: base para estudiar como inyectar canales adicionales (alfa, en el futuro profundidad o normales) en modelos de difusion con muy pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos que aporta el autor son de entrenamiento y de evaluacion cualitativa:

| Dato | Valor |
|---|---|
| Imagenes de entrenamiento | 39 |
| Tiempo de entrenamiento | ~40 minutos |
| Hardware de entrenamiento | 1 GPU de consumo de 16 GB |
| Seleccion de semillas en la galeria | 1 de cada 3 semillas mostrada |
| Metricas FID, CLIP score, alpha IoU | No disponibles |
| Comparacion cuantitativa con otros metodos | No disponible |

## Requisitos de hardware

- VRAM de inferencia: no publicada de forma explicita. El autor solo confirma que el entrenamiento del LoRA cupo en una GPU de consumo de 16 GB; la inferencia completa requiere ademas el modelo base, el text encoder y el VAE RGBA.
- El flujo de referencia usa pesos int8 (`moss_image_sft_int8_convrot.safetensors`) y un text encoder de 9B en int8 (`qwen3.5_9b_int8_convrot.safetensors`), lo que reduce el footprint frente a fp16 pero no se traduce en una cifra oficial de VRAM.
- GPU recomendadas: no disponibles. Por el regimen descrito, una GPU consumer de 16 GB es el minimo razonable documentado para el adaptador; no hay datos para A100/H100 ni cifras de throughput.
- Despliegue: exclusivamente ComfyUI segun la model card (`library_name: comfyui`). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y al ser un modelo de difusion esas herramientas no aplican.
- Ficheros necesarios en ComfyUI: `moss_alpha_v1.safetensors` en `models/loras/`; `moss_image_sft_int8_convrot.safetensors` en `models/diffusion_models/`; `qwen3.5_9b_int8_convrot.safetensors` en `models/text_encoders/`; `flux2-vae.safetensors` opcional para previsualizacion opaca; y el VAE RGBA de trmz/flux2-klein-alpha renombrado a `flux2_klein_alpha_rgba_vae.safetensors` en `models/vae/`.
- Latencia y throughput: no disponibles. Existe un LoRA DMD de 8 pasos opcional para reducir el numero de pasos de muestreo, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo / enfoque | Parametros | Contexto | Alfa nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Alpha-LoRA (este) | No disponible (repo 0,2 GB) | No aplica | Si, via VAE RGBA | `moss-alpha-poc` (other) | HuggingFace, ComfyUI |
| MOSS-Image-SFT (modelo base sin LoRA) | No disponible | No aplica | No (latentes RGB opacos) | No disponible en la informacion | HuggingFace |
| trmz/flux2-klein-alpha (VAE RGBA) | No disponible | No aplica | Si, pero requiere un modelo que emita alfa en el latente | Apache-2.0 | HuggingFace |
| Pipeline clasico: difusion + rembg/SAM | No aplica | No aplica | Recorte binario, sin translucidez parcial | Depende de cada componente | Ampliamente disponible |

La diferencia relevante frente al pipeline clasico no es de calidad bruta sino de tipo de salida: el LoRA produce alfa en el propio latente, con transparencia parcial, mientras que el recorte posterior tiende a binomizar el canal alfa y a fallar en celosias, alas y cristal.

## Limitaciones y advertencias

- Prueba de concepto declarada por el autor: 39 imagenes y 40 minutos de entrenamiento implican un ajuste debil y probablemente sensible a la semilla; la galeria muestra 1 de cada 3 semillas, lo que sugiere varianza alta.
- Riesgo de alfa incorrecta o ruidosa en escenas complejas, con multiples sujetos o con fondos que el modelo interprete como parte del objeto. No hay metrica de calidad de alfa publicada.
- Dependencia de una frase de prompt concreta (`, isolated on a transparent background`) y de un VAE externo concreto; cambiar de VAE o de version del modelo base puede romper el comportamiento.
- Sin informacion sobre idiomas de prompt: no se puede asumir buen rendimiento con prompts en castellano.
- Sin benchmarks ni evaluacion cuantitativa: no es posible comparar objetivamente con alternativas de recorte o con otros modelos con alfa.
- Licencia `moss-alpha-poc` con campo `other`: no se detallan condiciones de uso comercial, redistribucion ni obra derivada. Es imprescindible leer el texto completo de la licencia antes de usarlo en produccion, y ademas se aplica la licencia del modelo base OpenMOSS-Team/MOSS-Image-SFT, que no se especifica en la informacion disponible.
- El VAE RGBA necesario es de un tercero (trmz/flux2-klein-alpha, Apache-2.0); sus terminos y su mantenimiento son independientes de este adaptador.
- Riesgo de alucinacion visual en forma de artefactos: miembros duplicados, texto corrupto, bordes inconsistentes. No hay evaluacion sistematica de fallos.
- Modelo de comunidad con 0 descargas y 14 likes en el momento de la consulta: sin validacion externa ni soporte.
- No es un LLM: no admite tool calling, agentes, razonamiento multi-paso ni entrada de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/paralaif/MOSS-Image-Alpha-LoRA
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- VAE RGBA (trmz/flux2-klein-alpha, Apache-2.0): https://huggingface.co/trmz/flux2-klein-alpha
- Pesos empaquetados para ComfyUI (Comfy-Org/MOSS-Image): https://huggingface.co/Comfy-Org/MOSS-Image
- Paper referenciado en los tags: https://arxiv.org/abs/2507.09308
- Ejemplos e imagenes de la galeria: carpeta `examples/` del repositorio en HuggingFace
