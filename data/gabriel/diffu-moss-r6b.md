# Gabriel/diffu-moss-r6b

## Resumen

diffu-moss-r6b es un ajuste fino completo del transformador de difusión (DiT) de MOSS-Image-Base, desarrollado por el usuario Gabriel, orientado a la generación de paginas sinteticas de archivo con escritura manuscrita sueca de los siglos XVII a XIX. No es un modelo de texto a imagen generico: es la pieza de dibujo del proyecto diffu, un sistema que genera paginas de entrenamiento para reconocimiento de escritura manuscrita a nivel de pagina (HTR). El modelo recibe una plantilla de pagina (procedente de un fichero PAGE/ALTO), el texto que debe escribirse y una pagina de muestra, y devuelve una imagen de pagina junto con sus etiquetas ALTO y PAGE exactas.

Tecnicamente, el repositorio contiene unicamente el DiT afinado (10,2 GB en bfloat16, 462 tensores con los mismos nombres y formas que el DiT de Base); el codificador de texto, el tokenizador, el VAE y el planificador son los de MOSS-Image-Base, sin modificar. El modelo tiene 5.082.308.608 parametros y se distribuye bajo licencia Apache-2.0, con soporte declarado unicamente para sueco (sv).

Su relevancia es practica: el entrenamiento de sistemas HTR requiere volumen de paginas anotadas con alineacion exacta entre texto y cajas, algo escaso en dominios historicos. diffu-moss-r6b permite sintetizar ese material a partir de unas pocas paginas reales, con un coste de generacion de 1,38 s por paso en MXFP8 sobre una GB10 a 1024 x 1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (transformer de difusion) de MOSS-Image, implementado como `diffu_moss.transformer.MossTransformer` |
| Parametros totales | 5.082.308.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; el prompt es una plantilla MOSS Layout, un item de texto por linea con su caja) |
| Tipos de cuantizacion | MXFP8 (cuantizacion al cargar, en GPUs Blackwell); pesos publicados en bfloat16 |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`diffusion_pytorch_model.safetensors`, bfloat16, 462 tensores), mas `config.json` y `export.json` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del DiT de MOSS-Image-Base, un transformer de difusion para generacion de imagenes condicionada por texto. La entrada combina un prompt en formato MOSS Layout (una linea por item de texto, con el texto exacto y su caja delimitadora) y una pagina de muestra introducida como tokens de imagen adicionales, cuyo papel, tinta y aspecto debe seguir la generacion. Solo se entrena el DiT; el codificador de texto y el VAE permanecen congelados. La receta es la del propio MOSS-Image: Muon sobre las matrices de los bloques conjuntos y AdamW en el resto, learning rate 5e-5, weight decay 0,01, gradientes recortados a 1, un par por paso, pesos en float32 bajo autocast bfloat16.

El entrenamiento se realizo en una sola DGX Spark en dos fases: 1.500 pasos desde Base con la forma de prompt que incluye muestra, seguidos de 1.000 pasos con pares reestilizados (2.500 en total). Los datos son 3.406 pares de paginas equilibrados entre ocho colecciones de escritura manuscrita de archivo sueco (registros judiciales, cancillería, mineria y viajes): 2.031 paginas completas y 1.375 ventanas de pagina, de aproximadamente 1 MP cada una, cada una emparejada con una pagina de muestra del mismo volumen. Se emplearon cuatro formas de prompt: sin muestra y volumen nombrado (20 %), muestra con descripcion verbal del aspecto (20 %), muestra con volumen nombrado (20 %) y muestra sola (40 %); en los ultimos 1.000 pasos, la mitad de los pares con muestra sola se reestilizaron de forma identica en pagina y muestra (gris de microfilm, colorizado, tintado) para forzar que el aspecto provenga de la muestra.

## Capacidades

- Generacion de imagenes de paginas de archivo completas con maquetacion controlada: cada linea de texto se coloca en la caja especificada por la plantilla PAGE/ALTO.
- Salida de etiquetas exactas: junto a la imagen se generan las anotaciones ALTO y PAGE correspondientes, sin necesidad de alineacion manual posterior.
- Transferencia parcial de aspecto desde una pagina de muestra: papel, tinta y coloracion (incluye casos de gris de microfilm, colorizado y tintado).
- Generacion condicionada por volumen: el modelo reconoce el volumen a partir del texto y la maquetacion y reproduce su mano de escritura.
- Generacion de datos sinteticos de entrenamiento para HTR a nivel de pagina.
- Inferencia en MXFP8 sobre GPUs Blackwell con compilacion de bloques (`compile_blocks: true`).
- Exportacion al formato oficial de MOSS-Image para SGLang Diffusion mediante `diffu-moss-export-hf` y el plugin `diffu_sglang_moss`.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Aumento de datos para entrenar modelos HTR: a partir de unas pocas paginas reales de un volumen, diffu-moss-r6b genera paginas nuevas con texto y cajas conocidos, lo que permite ampliar el conjunto de entrenamiento sin anotacion manual. Es adecuado porque las etiquetas ALTO y PAGE salen exactas por construccion.
- Creacion de corpus sinteticos para archivos historicos suecos: digitalizacion de fondos de los siglos XVII a XIX con necesidad de transcripcion asistida; el modelo cubre los generos documentales de las ocho colecciones entrenadas (judicial, cancillería, mineria, viajes).
- Validacion de pipelines de reconocimiento: generar paginas con ground truth conocido permite medir la precision de un motor HTR sobre casos controlados, incluyendo variaciones de coloracion y calidad de escaneo.
- Pruebas de robustez frente a condiciones de captura: el reestilizado (gris de microfilm, colorizado, tintado) permite simular distintas calidades de digitalizacion manteniendo el contenido textual.
- Prototipado de interfaces de transcripcion: disponer de paginas sinteticas con etiquetas exactas facilita el desarrollo y la prueba de visores ALTO/PAGE sin depender de material restringido.
- Investigacion en generacion condicionada por maquetacion: el modelo sirve como caso de estudio de control fino de disposicion espacial en modelos de difusion, con condicionamiento por cajas explicitas.
- Despliegue en cluster para generacion por lotes: con diffu sobre Ray o KubeRay se pueden procesar ficheros `run.jsonl` con miles de trabajos de pagina, uno por linea, en una o varias GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La evaluacion del autor se limita a comprobaciones cualitativas sobre paginas reservadas de los volumenes de entrenamiento, dibujadas con su propia muestra y con muestras de otros volumenes, desde el mismo ruido:

| Comprobacion | Resultado |
|---|---|
| La muestra propia de la pagina produce una pagina del tipo correcto (color o gris) | 4 de 5 |
| Una muestra gris hace gris una pagina en color | 3 de 5 |
| Cambios de color y gris de forma conjunta | 78 % |
| La escritura de la muestra se sigue en lugar de la del volumen | 1 de 12 |

Datos de rendimiento de inferencia publicados por el autor (GB10, 1024 x 1024):

| Configuracion | Tiempo por paso |
|---|---|
| MXFP8 con `compile_blocks` | 1,38 s |
| bfloat16 compilado | 1,76 s |
| bfloat16 sin compilar | 3,46 s |

Receta de dibujo recomendada: aproximadamente 1 MP, 50 pasos, guidance 3, shift 5, bloque 22 omitido en la pasada incondicional (la receta de MOSS-Image).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del DiT en bfloat16 ocupan 10,2 GB; a ello hay que sumar el codificador de texto, el VAE y el planificador de MOSS-Image-Base, por lo que se recomienda una GPU con al menos 24 GB para bfloat16. En MXFP8 el peso del DiT se reduce aproximadamente a la mitad.
- GPU recomendadas: el autor cita una DGX Spark (GB10) como plataforma de entrenamiento y de medida; las funciones MXFP8 requieren GPUs Blackwell. Para bfloat16, una A100 o H100 son opciones razonables por capacidad, aunque no hay mediciones publicadas en esas tarjetas.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas (por ejemplo RTX 4090) para el DiT en bfloat16, siempre que el resto de componentes de MOSS-Image quepan en la memoria restante; no hay datos publicados de esta configuracion.
- Opciones de despliegue: diffu (con soporte para Ray y KubeRay, documentado en `docs/INFERENCE.md`), y SGLang Diffusion mediante la exportacion con `diffu-moss-export-hf` y el plugin `diffu_sglang_moss`. No se mencionan llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 1,38 s por paso en MXFP8 compilado sobre GB10 a 1024 x 1024; con la receta de 50 pasos, una pagina ronda el minuto en ese hardware. No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| diffu-moss-r6b | 5.082.308.608 | prompt MOSS Layout + pagina de muestra | Apache-2.0 | Hugging Face (0 descargas) | Solo DiT; requiere MOSS-Image-Base y diffu |
| OpenMOSS-Team/MOSS-Image-Base | no disponible en la informacion proporcionada | texto a imagen general | Apache-2.0 (heredada) | Hugging Face | Modelo base; no especializado en escritura manuscrita |
| Alternativas HTR generativas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion sobre otros modelos comparables de generacion de paginas manuscritas sinteticas con etiquetas ALTO/PAGE exactas.

## Limitaciones y advertencias

- La escritura no sigue a la pagina de muestra: entrenado con ocho volumenes, el modelo reconoce el volumen por su texto y maquetacion y escribe con la mano de ese volumen. Solo 1 de cada 12 comprobaciones siguio la muestra.
- El aspecto solo sigue a la muestra en parte: 4 de 5 aciertos en el tipo de pagina y 3 de 5 al convertir color en gris.
- Cada linea generada debe revisarse: diffu relee cada linea dibujada y marca como dudosa en las etiquetas aquella que no puede confirmar.
- Solo se entrenaron las manos y maquetaciones de ocho volumenes suecos; otros tipos de pagina no estan probados.
- Idioma limitado al sueco; no hay soporte multilingue declarado.
- Riesgo de alucinacion textual: el texto de las lineas puede no coincidir exactamente con el solicitado, de ahi la relectura y el marcado de lineas dudosas.
- El repositorio contiene solo el DiT; no es utilizable de forma autonoma sin MOSS-Image-Base y el codigo de diffu.
- Las funciones MXFP8 requieren hardware Blackwell; en otras GPUs hay que usar bfloat16 con mayor coste de memoria y tiempo.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones de MOSS-Image-Base; verificar la procedencia de los datos de archivo suecos si se redistribuyen paginas generadas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabriel/diffu-moss-r6b
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Revision concreta del modelo base usada en las instrucciones: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base/tree/85975793d8b3d432f1b6e27f352abaa4c2a4c0d3
- Repositorio diffu: https://github.com/Borg93/diffu2
- Documentacion de inferencia de diffu: `docs/INFERENCE.md` dentro del repositorio anterior (secciones 5 y 13)
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales relacionados con este modelo.
