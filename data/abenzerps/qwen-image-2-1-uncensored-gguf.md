# abenzerps/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo de generación de imágenes texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el usuario abenzerps. No se trata de un modelo nuevo ni de un ajuste fino: el propio autor indica que las conversiones se han realizado sobre los pesos originales del modelo base, sin fine-tuning, abliteration ni ninguna otra modificación de los pesos. La etiqueta "uncensored" responde únicamente a que, en las pruebas locales del autor, no se observó ningún comprobador de seguridad a nivel de pipeline ni lista negra de prompts.

El objetivo del repositorio es permitir la inferencia local del transformer de imágenes de Qwen-Image-2.1 en equipos con recursos limitados, mediante cuantizaciones que van desde Q8_0 (7,59 GiB) hasta Q4_0 (4,05 GiB). El modelo base declara 7.115.124.736 parámetros según los metadatos de safetensors, lo que sitúa el transformer en torno a los 7,1 mil millones de parámetros, una cifra elevada para un modelo de difusión y que explica el interés de las versiones cuantizadas para despliegue en GPU de consumo.

Es relevante ahora porque reduce el umbral de hardware necesario para ejecutar un generador de imágenes de última generación en local, integrándose con ComfyUI a través del nodo ComfyUI-GGUF. Conviene señalar que el repositorio es muy reciente (creado y actualizado el 20 de septiembre de 2026), acumula 0 descargas y 5 likes en el momento de redactar esta ficha, y no aporta resultados numéricos de benchmarks ni datos de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de imagenes (el autor lo denomina "image transformer"); detalles de capas, atencion y mecanismo de difusion no disponibles |
| Parametros totales | 7.115.124.736 (dato de safetensors del modelo base, aproximadamente 7,1 mil millones) |
| Longitud de contexto | No aplica / no disponible (modelo texto-a-imagen; la resolucion maxima de salida no se especifica en la informacion disponible) |
| Tipos de cuantizacion | Q8_0 (7,59 GiB), Q6_K (5,88 GiB), Q5_K_M (5,22 GiB), Q4_K_M (4,6 GiB, recomendada por el autor), Q4_0 (4,05 GiB) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License (etiquetada como `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (requiere ademas el text encoder y el VAE originales de Qwen/Qwen-Image-2.1) |
| Pipeline | text-to-image |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Revision del modelo base | b3179ad355be050328e483a9dfdd9e60cd62adfa |
| Tamano del repositorio | 27,3 GB |
| Herramienta de conversion | stable-diffusion.cpp, commit 1330cebae8f2ba99249df846cc0c9444fcbd4308 |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |
| Descargas / likes | 0 / 5 |

## Arquitectura y entrenamiento

La informacion disponible describe el contenido de los ficheros GGUF como "el transformer de imagenes de Qwen-Image-2.1". No se detalla la arquitectura interna (numero de bloques, tipo de atencion, dimension del espacio latente, esquema de condicionamiento textual ni el numero de pasos de muestreo), por lo que cualquier afirmacion mas concreta seria una extrapolacion no respaldada por la model card. Tampoco se documentan los datos de entrenamiento del modelo original: ni el volumen de tokens o pares imagen-texto, ni la composicion del dataset, ni si hubo etapas de ajuste con preferencias humanas. Estos datos corresponderian al modelo base, cuya model card no forma parte de la informacion proporcionada.

Lo que si esta documentado es el proceso de construccion del repositorio. Las conversiones se generaron con stable-diffusion.cpp en el commit 1330cebae8f2ba99249df846cc0c9444fcbd4308, a partir de los pesos originales sin modificar, y se acompanan de un fichero SHA256SUMS para verificar la integridad. El autor declara explicitamente que no se aplico ningun tipo de fine-tuning ni de abliteration, lo que implica que las capacidades y los sesgos de estas cuantizaciones son los del modelo upstream, afectados unicamente por la perdida de fidelidad numerica inherente a la cuantizacion. La innovacion practica, por tanto, no esta en la arquitectura sino en el empaquetado: cuantizaciones K-quant y legacy compatibles con el ecosistema GGUF de ComfyUI, con el objetivo de llevar un transformer de ~7,1 mil millones de parametros a GPUs de gama media.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), mediante el transformer de difusion cuantizado.
- Inferencia completamente local, sin llamadas a APIs externas ni dependencia de servicios alojados.
- Compatibilidad con flujos de ComfyUI a traves de ComfyUI-GGUF, incluyendo grafos con nodos de carga de modelo GGUF, text encoder y VAE.
- Ausencia observada de comprobador de seguridad a nivel de pipeline y de lista negra de prompts, segun las pruebas locales del autor, lo que permite generar categorias sensibles (contenido adulto, desnudos, violencia) sin rechazos en tiempo de ejecucion.
- Seleccion de compromiso tamano/calidad mediante cinco niveles de cuantizacion, con Q4_K_M recomendada por el autor.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un componente de difusion, no un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No se documenta soporte multilingue de prompts; el idioma o los idiomas soportados figuran como no disponibles.
- No se documentan capacidades adicionales como edicion de imagen, inpainting, outpainting, control por pose o modo de razonamiento explicito.

## Casos de uso

- Generacion de imagenes en local con GPU de consumo: cargando el fichero Q4_K_M (4,6 GiB) desde el directorio `models/diffusion_models/` de ComfyUI y anadiendo el text encoder y el VAE originales, un equipo con GPU de gama media puede producir imagenes sin depender de la nube ni de creditos de API.
- Flujos de trabajo con requisitos de soberania del dato: al ejecutarse integramente en la maquina local, es adecuado para entornos donde los prompts no pueden salir de la organizacion, como estudios de diseno con acuerdos de confidencialidad o investigacion clinica con material visual sensible.
- Investigacion sobre moderacion y seguridad en modelos de difusion: dado que el autor no observo filtros a nivel de pipeline, el repositorio sirve como material para estudiar el comportamiento de un generador sin capas de rechazo, medir tasas de cumplimiento de prompts sensibles y evaluar estrategias de filtrado posterior.
- Comparacion de cuantizaciones: al ofrecer cinco niveles del mismo transformer (de Q4_0 a Q8_0), permite medir de forma controlada el impacto de la cuantizacion en la fidelidad, la coherencia compositiva y la adherencia al prompt, manteniendo constantes el text encoder y el VAE.
- Prototipado de arte conceptual y storyboards: iteracion rapida de variaciones visuales a partir de descripciones textuales dentro de una interfaz de nodos, con la posibilidad de sustituir el checkpoint por la version Q8_0 cuando se requiera mas calidad en una entrega final.
- Despliegue en entornos aislados o air-gapped: al no requerir conexion de red tras la descarga de los ficheros, encaja en laboratorios, plantas industriales o instalaciones con red restringida donde solo se permite software empaquetado y verificable con checksums.
- Generacion de imagenes para canales editoriales con control de estilo: integrado en un grafo de ComfyUI junto con VAEs o ajustes de muestreo propios, se puede usar para producir ilustraciones de articulos o material de marketing, siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen identificada como "Qwen-Image-2.1 benchmark" y una captura de salida de ejemplo, pero no acompana ninguna tabla, metrica ni cifra (FID, CLIP score, comparativas con otros modelos). El autor tampoco documenta latencia, pasos de muestreo por imagen ni throughput.

## Requisitos de hardware

- VRAM estimada (calculada a partir del tamano de los ficheros, no publicada por el autor): el transformer cuantizado ocupa entre 4,05 GiB (Q4_0) y 7,59 GiB (Q8_0); a esa cifra hay que sumar el text encoder original y el VAE de Qwen-Image-2.1, cuyo tamano no se especifica en la informacion disponible.
- Perfil minimo: Q4_0 (4,05 GiB) o Q4_K_M (4,6 GiB), asumiendo que el text encoder y el VAE encajen en el presupuesto restante; en la practica, 8 GB de VRAM es el limite inferior razonable, siempre que la suma total quede por debajo de esa cifra.
- Perfil equilibrado: Q5_K_M (5,22 GiB) o Q6_K (5,88 GiB) en GPUs de 12 GB, como RTX 3060 de 12 GB, RTX 4070 o RTX 4080.
- Perfil de maxima calidad: Q8_0 (7,59 GiB), recomendable en GPUs de 16 GB o mas, como RTX 4090, RTX 5090 o A100, teniendo en cuenta que la VRAM total debe cubrir tambien text encoder y VAE.
- Caben en GPU de consumo: si, todas las cuantizaciones estan pensadas para ello; el fichero Q4_K_M esta explicitamente recomendado como el mejor equilibrio entre tamano y calidad.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-GGUF (ruta documentada por el autor); el pipeline de conversion esta basado en stable-diffusion.cpp, por lo que ese runtime es la otra via natural de ejecucion.
- Latencia y throughput: no disponibles. Dependeran de la GPU, de la cuantizacion elegida, del numero de pasos de muestreo y de la resolucion de salida, parametros que la model card no concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (base) | ~7,1 mil millones | safetensors (precision original) | No aplica | Qwen Research License | HuggingFace (Qwen/Qwen-Image-2.1) |
| Qwen-Image-2.1-Uncensored-GGUF (este repositorio) | ~7,1 mil millones | GGUF | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 | Qwen Research License | HuggingFace (abenzerps) |
| Otras alternativas texto-a-imagen de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye ningun dato de rendimiento que permita una comparacion cuantitativa con otros generadores de imagenes, ni se identifican modelos alternativos en la busqueda realizada. La unica comparacion defendible es la que enfrenta este repositorio con su modelo base: mismos pesos y misma licencia, con la diferencia de un menor uso de disco y VRAM a cambio de la perdida de precision propia de la cuantizacion, y con la ventaja practica de que el formato GGUF puede cargarse en flujos de ComfyUI con recursos limitados.

## Limitaciones y advertencias

- La licencia es la Qwen Research License, etiquetada como `license: other` y no como una licencia de codigo abierto estandar. Los terminos completos no se detallan en la informacion disponible, por lo que deben consultarse antes de cualquier uso comercial o de redistribucion.
- La etiqueta "uncensored" no implica una modificacion de los pesos: el autor confirma que no hubo fine-tuning ni abliteration. Se refiere unicamente a la ausencia observada de filtros de seguridad a nivel de pipeline en pruebas locales, y el propio autor advierte que los servicios alojados pueden aplicar su propia moderacion.
- La ausencia de filtros implica que el modelo puede generar contenido adulto, violento u ofensivo, asi como material potencialmente ilegal segun la jurisdiccion. La responsabilidad legal y etica del uso recae en quien despliega el modelo.
- No hay informacion sobre sesgos demograficos, culturales o de representacion. Al ser una cuantizacion sin ajustes, heredara los sesgos del modelo base, que no se documentan aqui.
- No se documentan datos de alucinacion ni de fidelidad al prompt. En modelos de difusion, el equivalente practico son composiciones incorrectas, anatomia deformada o texto mal renderizado en la imagen, pero no hay mediciones publicadas para este repositorio.
- El repositorio es muy reciente y practicamente sin validacion de la comunidad (0 descargas, 5 likes). No existe evidencia publica independiente de que las cuantizaciones mantengan la calidad esperada.
- Requiere descargar por separado el text encoder y el VAE del modelo base; sin esos componentes el fichero GGUF no es suficiente para la inferencia.
- Los idiomas de los prompts no estan documentados. No se puede asumir un comportamiento equivalente en castellano y en ingles.
- Las cuantizaciones GGUF no son adecuadas para reentrenamiento ni para entrenar LoRA; para eso se necesitarian los pesos originales en safetensors.
- No se especifica la resolucion de salida soportada ni el numero de pasos recomendado, dos parametros criticos para planificar costes de inferencia en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Checksums del repositorio: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/SHA256SUMS
- Fichero Q8_0: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-Q8_0.gguf
- Fichero Q6_K: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-Q6_K.gguf
- Fichero Q5_K_M: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-Q5_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-Q4_K_M.gguf
- Fichero Q4_0: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-Q4_0.gguf
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp (herramienta de conversion): https://github.com/leejet/stable-diffusion.cpp
- Los resultados de la busqueda web realizada no aportan enlaces relevantes sobre este modelo: las entradas devueltas corresponden a paginas genericas de YouTube y no guardan relacion con Qwen-Image-2.1 ni con su version GGUF.
