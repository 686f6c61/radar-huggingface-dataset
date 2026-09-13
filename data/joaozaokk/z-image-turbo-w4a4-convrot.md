# JoaoZaokk/Z-Image-Turbo-W4A4-ConvRot

## Resumen

Z-Image-Turbo-W4A4-ConvRot es una cuantizacion de un solo archivo del modelo de difusion de texto a imagen Tongyi-MAI/Z-Image-Turbo, publicada por el usuario JoaoZaokk bajo licencia Apache 2.0. El punto de partida es un checkpoint BF16 de 11,46 GiB y 6,15 mil millones de parametros, que se reduce a 3,06 GiB mediante el formato convrot_w4a4 (rotacion Hadamard combinada con cuantizacion por grupos, pesos y activaciones a 4 bits). En terminos medidos por el autor, supone 3,75 veces menos peso y 2,65 veces menos tiempo por paso de muestreo.

La relevancia practica de esta ficha esta en su integracion: no requiere nodos personalizados en ComfyUI. El UNETLoader estandar lee la metadata por capa del safetensors y despacha al kernel INT4 MMA nativo de comfy_kitchen.backends.cuda, con 0 llamadas a dequantize verificadas sobre 170 modulos cuantizados. En una RTX 3090 a 1024x1024, el coste baja de 0,903 a 0,341 s por paso con 8 pasos, cfg 1.0 y sampler euler/simple.

Se publican dos variantes: W4A4 pura (170 modulos a 4 bits) y una mixta (113 capas a 4 bits y 57 a 8 bits) que se acerca mas a la trayectoria latente del BF16 original (gana 11 de 12 ejecuciones emparejadas) a cambio de 0,12 GiB y un 15 por ciento mas de tiempo por paso. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y esta fechado el 12 de septiembre de 2026 (creado y actualizado el mismo dia), por lo que la validacion externa es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de texto a imagen. La model card no detalla la arquitectura interna del modelo base (Tongyi-MAI/Z-Image-Turbo); la innovacion descrita es el formato de cuantizacion convrot (rotacion Hadamard con cuantizacion por grupos) |
| Parametros totales | 6,15 B (segun la model card, para el BF16 de origen de 11,46 GiB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. No es un parametro aplicable directamente a un modelo de difusion; la model card no especifica la longitud de contexto del text encoder asociado (qwen_3_4b) |
| Tipos de cuantizacion | W4A4 nativa (convrot_w4a4: pesos y activaciones a 4 bits); build mixta de 4/8 bits (113 capas a 4 bits + 57 a 8 bits); se menciona tambien el nivel de error de W4A8 |
| Idiomas soportados | en (la model card declara unicamente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors de un solo archivo (diffusion-single-file) con metadata de cuantizacion por capa, para ComfyUI |
| Tamano del repositorio | 6,7 GB (incluye imagenes de muestra y los dos safetensors) |
| Tamano de los pesos | 3,06 GiB (W4A4) y 3,18 GiB (mixta); referencia BF16 de origen: 11,46 GiB |
| Resolucion de referencia | 1024x1024 |
| Configuracion de muestreo | 8 pasos, sampler euler/simple, cfg 1.0 |
| Componentes externos | Text encoder qwen_3_4b.safetensors y VAE ae.safetensors (no incluidos en el repo) |

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo nuevo: es una conversion de pesos. Parte del checkpoint BF16 de Tongyi-MAI/Z-Image-Turbo (6,15 B de parametros, 11,46 GiB) y lo recuantiza con el formato convrot, que combina una rotacion Hadamard de tamano N (que reparte cada valor atipico entre N canales) con cuantizacion por grupos controlada por el parametro convrot_groupsize. El autor senala explicitamente que la intuicion inicial era erronea: una rotacion de tamano mayor mezcla mas canales y aplana mejor los valores atipicos, de modo que "rotacion mas gruesa" no implica mas error, a diferencia de lo que ocurriria en un cuantizador por grupos convencional.

Los datos de entrenamiento, el volumen de tokens y la composicion del dataset no se detallan en la informacion disponible, porque no hay reentrenamiento implicado. Lo que si se documenta es el proceso de calibracion: las activaciones se capturaron con forward hooks sobre el propio muestreo real (no con entradas aleatorias) y se muestrearon con reservoir sampling a lo largo de los pasos. El autor reconoce un defecto en ese proceso: la herramienta de calibracion leyo un bloque de prompts concatenado como si fuera un unico prompt, en lugar de seis prompts separados; el fallo se detecto y se corrigio el mismo dia de la publicacion, pero los numeros publicados siguen siendo los de la calibracion defectuosa, de modo que una recalibracion desplazaria las medianas unos pocos puntos porcentuales.

La verificacion del despacho se hizo contando, no asumiendo: 170 modulos cuantizados, 8 de 8 forwards cuantizados, 0 llamadas a dequantize, con convrot_linear_dtype=int4 sobre comfy_kitchen.backends.cuda, es decir, la ruta MMA INT4 nativa y no la rama de respaldo INT8.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en ComfyUI, con el flujo estandar de UNETLoader, sin nodos personalizados.
- Ejecucion con cuantizacion nativa INT4 en pesos y activaciones, con despacho verificado a la ruta MMA INT4 y cero dequantize.
- Generacion de imagenes con texto integrado: el autor incluye una prueba especifica sobre un cartel de esmalte al considerar el texto como el caso donde el dano por cuantizacion se manifiesta antes.
- Modo turbo de pocos pasos: la configuracion de referencia usa 8 pasos con cfg 1.0 y sampler euler/simple.
- Variante mixta 4/8 bits que reproduce con mas fidelidad la trayectoria latente del modelo BF16.
- Soporte de dos preajustes alternativos segun el objetivo: minima huella y latencia (W4A4) o mayor fidelidad a la trayectoria original (mixta).
- Text encoder cuantizado complementario publicado aparte (JoaoZaokk/Qwen3-4B-W4A4-ConvRot, de 7,49 GiB a 2,4 GiB), aunque el propio autor advierte que ComfyUI ejecuta los text encoders con matematicas de cuantizacion invertida tras dos bloqueos independientes, por lo que ese encoder ahorra VRAM pero no tiempo salvo que se liberen dichos bloqueos.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento: no aplican a un modelo de difusion de texto a imagen.
- Capacidad multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Generacion de imagenes en GPUs de gama consumer: con 3,06 GiB de pesos en lugar de 11,46 GiB, el modelo deja margen en tarjetas de 12 GB o incluso 8 GB para cargar el text encoder (2,4 GiB en su version cuantizada) y el VAE, algo imposible con el BF16 en varias de esas configuraciones. La cifra de VRAM pico no esta publicada, por lo que conviene medirla en el equipo objetivo.
- Prototipado rapido de prompts: a 0,341 s por paso y 8 pasos, el muestreo de una imagen a 1024x1024 ronda los 2,7 s en una RTX 3090 (calculo derivado de los datos publicados, excluyendo codificacion de texto y decodificacion del VAE), lo que permite iterar sobre decenas de variantes de prompt en pocos minutos.
- Produccion por lotes en hardware existente: el mismo servidor con la misma GPU procesa aproximadamente 2,65 veces mas imagenes por unidad de tiempo que con el checkpoint BF16, sin cambiar el grafo de ComfyUI.
- Regresion visual en pipelines de CI: el repositorio de referencia (comfy-quant-bench) genera contact sheets de 36 renders sobre 6 prompts y 2 semillas; ese mismo montaje sirve como prueba de humo automatica antes de desplegar un cambio de cuantizacion.
- Sustitucion directa en un flujo ya existente: al no requerir nodos personalizados y usar el UNETLoader estandar, se puede cambiar el checkpoint en un workflow de ComfyUI existente modificando unicamente la ruta del modelo.
- Generacion de carteles y rotulacion con texto: el autor valida especificamente un caso con texto (cartel de esmalte) en las tres variantes; es un escenario realista para carteleria ligera, asumiendo revision manual porque el texto es lo primero que se degrada con cuantizacion agresiva.
- Estudio de tolerancia a cuantizacion por arquitectura: el banco de pruebas del autor mide el error por capa que cada familia de modelos soporta antes de romper, lo que permite usar este modelo como referencia de ~6 B en investigacion sobre cuantizacion de modelos de difusion.
- Despliegue en instancias de bajo coste: la reduccion de peso hace viable evaluar este modelo en instancias con GPU de VRAM reducida, aunque no hay mediciones publicadas fuera de la RTX 3090.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de calidad convencionales (no hay FID, CLIP score ni metricas de imagen), sino mediciones de error por capa, divergencia latente y tiempo por paso. Se reproducen tal cual.

Comparativa de los artefactos publicados (8 pasos, 1024x1024, euler/simple, cfg 1.0, 2 semillas, 6 prompts, RTX 3090):

| Archivo | Formato | Tamano (GiB) | Error mediano por capa | Divergencia latente | s/paso |
|---|---|---|---|---|---|
| zimage_turbo_w4a4.safetensors | 170 modulos convrot_w4a4 | 3,06 | 0,1228 | 0,6589 | 0,341 |
| zimage_turbo_mixed.safetensors | 113 a 4 bits + 57 a 8 bits | 3,18 | no disponible | 0,5500 | 0,391 |
| Referencia BF16 (origen) | BF16 | 11,46 | 0,0019 | referencia | 0,903 |

Error relativo medido por formato sobre activaciones reales de muestreo:

| Formato | Error mediano |
|---|---|
| BF16 (referencia) | 0,0019 |
| convrot W4A8 | 0,0389 |
| convrot W4A4 | 0,1228 |

Comparacion emparejada ejecucion a ejecucion (mixta contra W4A4): delta medio de -0,1089, con 11 victorias de 12. El autor advierte que la comparacion de medias es evidencia debil, porque la dispersion entre ejecuciones dentro de un mismo brazo es de 0,54, cercana a la diferencia entre medias, de ahi que use la comparacion emparejada. El mismo conversor con el mismo umbral aplicado al modelo de-destilado ostris/Z-Image-De-Turbo da solo 7 de 12, un empate tecnico.

Tolerancia al error por familia de arquitectura (medida en el mismo banco de pruebas):

| Modelo | Parametros | Error tolerado | Error no tolerado |
|---|---|---|---|
| Wan 2.1 VACE | 1,3 B | 0,0546 | 0,0793 |
| Z-Image | ~6 B | 0,1421 | 0,1848 |
| Krea 2 Turbo | 12,82 B | 0,1377 | no alcanzado en el unico eje disponible |
| HunyuanVideo 1.5 | ~13 B | 0,1837 | 0,2147 |

Efecto del tamano de grupo de cuantizacion en Z-Image: convrot_groupsize 256 da 0,1312 (correcto), cg 64 da 0,1421 (correcto) y cg 16 da 0,1848 (destruido en 3 de 3 renders). Los builds publicados, con 0,1228 de error mediano, quedan dentro de la banda de funcionamiento.

## Requisitos de hardware

- Pesos en VRAM: 3,06 GiB (W4A4) o 3,18 GiB (mixta); el BF16 de referencia ocupa 11,46 GiB solo en pesos.
- Componentes adicionales: text encoder qwen_3_4b (7,49 GiB en BF16, 2,4 GiB en la version cuantizada publicada aparte) y VAE ae.safetensors (tamano no disponible). El pico de VRAM total no esta publicado; cualquier cifra por debajo de 8 GB es una estimacion, no una medicion.
- GPU medida por el autor: RTX 3090 (24 GB) a 1024x1024. No hay mediciones publicadas en otras GPU.
- Cabe en GPU consumer: si, los pesos de 3,06 GiB lo permiten con holgura; la duda es el text encoder, que en BF16 suma 7,49 GiB. Con el encoder cuantizado, la suma de pesos baja a unos 5,5 GiB antes de contar activaciones y VAE.
- Latencia medida (RTX 3090, 1024x1024, por paso): 0,341 s (W4A4), 0,391 s (mixta), 0,903 s (BF16). Para 8 pasos, el muestreo completo seria de aproximadamente 2,73 s, 3,13 s y 7,22 s respectivamente (calculo derivado; no incluye codificacion de texto ni decodificacion del VAE).
- Throughput relativo: 2,65 veces mas rapido por paso que el BF16 de origen, sin cambios en el grafo de trabajo.
- Despliegue: ComfyUI con soporte del formato convrot, cargando el safetensors con UNETLoader desde ComfyUI/models/diffusion_models/. El backend verificado es comfy_kitchen.backends.cuda con convrot_linear_dtype=int4.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, Diffusers): no disponible; no se mencionan en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano de pesos | Contexto/resolucion | s/paso (RTX 3090, 1024x1024) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tongyi-MAI/Z-Image-Turbo (base BF16) | 6,15 B | BF16, 11,46 GiB | 1024x1024 en las pruebas | 0,903 | no indicada en la informacion disponible | Modelo base referenciado por este repo |
| Este modelo, variante W4A4 | 6,15 B | convrot_w4a4, 3,06 GiB | 1024x1024 | 0,341 | apache-2.0 | Publicado en HuggingFace, 0 descargas |
| Este modelo, variante mixta 4/8 bits | 6,15 B | 4/8 bits, 3,18 GiB | 1024x1024 | 0,391 | apache-2.0 | Publicado en HuggingFace, 0 descargas |
| ostris/Z-Image-De-Turbo | no disponible | no disponible | no disponible | no disponible | no disponible | Mencionado como hermano de-destilado; el mismo recetario da 7 de 12 victorias emparejadas, resultado ambiguo |
| Wan 2.1 VACE | 1,3 B | no disponible | no disponible | no disponible | no disponible | Referencia del banco de tolerancia, distinta categoria y tamano |
| Krea 2 Turbo | 12,82 B | no disponible | no disponible | no disponible | no disponible | Referencia del banco de tolerancia, distinta categoria y tamano |
| HunyuanVideo 1.5 | ~13 B | no disponible | no disponible | no disponible | no disponible | Referencia del banco de tolerancia, distinta modalidad y tamano |

Los tres ultimos modelos aparecen unicamente como puntos de comparacion de tolerancia al error de cuantizacion en el banco de pruebas del autor, no como alternativas directas de mismo tamano y misma tarea.

## Limitaciones y advertencias

- Evaluacion muy reducida: 6 prompts, 2 semillas, una sola GPU (RTX 3090), una sola resolucion (1024x1024) y ninguna metrica perceptiva. El criterio "36 de 36 usables" es el juicio del autor tras revisar las hojas de contacto, sin metrica objetiva.
- Ausencia de metrica en espacio de imagen: la divergencia latente mide trayectoria, no fidelidad. Una imagen generada en modo libre no permite separar dos cuantizaciones del mismo modelo; solo una sonda con entrada emparejada lo haria, y no se ejecuto sobre estos builds.
- Defecto de calibracion reconocido: la herramienta de captura de activaciones interpreto un bloque de prompts concatenado como un unico prompt, en lugar de seis. El fallo se corrigio el mismo dia, pero los numeros publicados proceden de la calibracion defectuosa. El autor estima que una recalibracion desplazaria las medianas unos pocos puntos porcentuales.
- Los resultados no se generalizan a la familia: aplicar el mismo conversor y umbral sobre ostris/Z-Image-De-Turbo produce un empate (7 de 12), por lo que promover capas a 8 bits no garantiza mejoras en otro checkpoint.
- Las cifras de tiempo por paso y tamano corresponden exclusivamente a RTX 3090; no hay datos de otras GPU ni de VRAM pico.
- La comparacion de medias de divergencia latente es estadisticamente debil, dado que la dispersion entre ejecuciones (0,54) es del orden de la diferencia entre medias. La evidencia relevante es la comparacion emparejada.
- Degradacion del texto en imagenes: es el primer sintoma de la cuantizacion agresiva; el propio autor elige ese caso como el mas exigente del conjunto de pruebas.
- Dependencia de ComfyUI con soporte del formato convrot y del backend comfy_kitchen.backends.cuda. En otras herramientas o versiones sin esa ruta, no esta documentado que el modelo funcione.
- El text encoder cuantizado complementario no reduce tiempo de ejecucion en ComfyUI de serie, porque los text encoders se ejecutan con matematicas de cuantizacion invertida detras de dos bloqueos independientes.
- Modelo solo en ingles segun la model card; no hay informacion sobre comportamiento con prompts en otros idiomas.
- Riesgo de alucinacion y sesgos: no disponible; la informacion proporcionada no incluye evaluaciones de sesgo, seguridad ni contenido.
- Validacion nula por parte de la comunidad: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia (12-09-2026).
- Licencia del artefacto: apache-2.0, lo que permite uso comercial. La licencia del modelo base Tongyi-MAI/Z-Image-Turbo no se indica en la informacion disponible, por lo que conviene verificarla antes de un despliegue comercial.
- Antes de produccion, conviene medir el pico real de VRAM con el text encoder y el VAE cargados, y validar visualmente un conjunto de prompts propio, dado que no existe metrica objetiva publicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoZaokk/Z-Image-Turbo-W4A4-ConvRot
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio del banco de pruebas (metodo, herramientas y registro completo de mediciones): https://github.com/JoaoZaokk/comfy-quant-bench
- Text encoder cuantizado complementario: https://huggingface.co/JoaoZaokk/Qwen3-4B-W4A4-ConvRot
- Hermano de-destilado usado en la comparacion: https://huggingface.co/ostris/Z-Image-De-Turbo
- Imagenes de muestra citadas en la model card (rutas relativas dentro del repositorio, sin URL absoluta disponible): images/grid_seed1.png, images/sign_bf16.png, images/sign_w4a4.png, images/sign_mixed.png
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (contenido turistico y administrativo sobre Niederoesterreich). No se han podido incorporar papers, blogs ni demos adicionales a partir de esa busqueda.
