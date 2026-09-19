# ling0322/libwaifu-krea2-turbo

## Resumen

`ling0322/libwaifu-krea2-turbo` es una redistribucion del modelo de generacion de imagenes **Krea 2 Turbo** (original de Krea, `krea/Krea-2-Turbo`) convertida al formato de paquete que consume la herramienta [libwaifu](https://github.com/ling0322/libwaifu). No es un modelo nuevo ni un reentrenamiento: es el mismo conjunto de pesos con otro empaquetado de ficheros y una precision mas estrecha. El repositorio ocupa 51,1 GB e incluye dos paquetes alternativos, uno en float16 (33,8 GB) y otro con las matrices cuantizadas a FP8 E4M3 (17,3 GB); cada uno de ellos es autosuficiente y contiene el denoiser, la mitad de lenguaje del codificador de texto Qwen3-VL, el autoencoder de Qwen-Image y el tokenizer.

El modelo resuelve generacion de imagenes a partir de texto en ingles con un regimen de muestreo muy concreto: esta destilado para **ocho pasos sin guidance**. Esto lo aleja de las recetas habituales de SDXL (30 pasos con escala de guidance 5), que segun la model card producen una imagen "quemada" con cuatro veces mas computo. El interes practico del repositorio esta en el formato de despliegue: la CLI `waifu draw` y el crate de Rust `Krea2` permiten ejecutar inferencia en CUDA sin depender del stack de diffusers, y el paquete FP8 reduce a la mitad el espacio en disco y la VRAM a cambio de un error medible y documentado.

Es relevante como caso de estudio de empaquetado y cuantizacion verificable: la model card publica tablas de desviacion numerica frente a la implementacion de referencia (`Krea2Pipeline` de diffusers) en lugar de cifras de calidad subjetiva. En el momento de la consulta el repositorio no tiene descargas ni likes, y el autor advierte explicitamente de que es una copia modificada, no un producto oficial de Krea y sin respaldo de la compania.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo detalla los componentes: denoiser, mitad de lenguaje del codificador de texto Qwen3-VL, autoencoder de Qwen-Image y tokenizer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (paquete completo en fp16) y FP8 E4M3 con una escala por canal de salida en las matrices, resto en float16 |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license (etiquetada como `other`); requiere aceptar el Krea 2 Community License Agreement y la Acceptable Use Policy |
| Formato de pesos | paquete libwaifu: manifiesto YAML (`krea2-turbo.yaml`, `krea2-turbo-fp8.yaml`) mas sus partes de tensores; no se distribuye en safetensors ni GGUF |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | ling0322/libwaifu-krea2-turbo |
| Autor | ling0322 |
| Modelo base | krea/Krea-2-Turbo |
| Pipeline declarado | text-to-image |
| Tamano del repositorio | 51,1 GB |
| Paquete float16 en disco | 33,8 GB (aproximadamente 34 GB en la model card) |
| Paquete FP8 en disco | 17,3 GB (aproximadamente 18 GB en la model card) |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del denoiser ni el procedimiento de entrenamiento o destilacion de Krea 2 Turbo; solo se enumeran los bloques que viajan dentro del paquete: el denoiser, la mitad de lenguaje del codificador de texto Qwen3-VL, el autoencoder de Qwen-Image y el tokenizer. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o similares. Tampoco se indica el numero de parametros ni el tipo de bloque del denoiser (transformer de difusion u otra variante). Todo eso queda como "no disponible".

Lo que si esta documentado es la innovacion de empaquetado de esta copia. El paquete float16 mantiene todos los pesos en coma flotante de 16 bits; el paquete FP8 convierte las matrices a E4M3 con una unica escala por canal de salida y deja el resto de tensores en float16. El autoencoder no se cuantiza en ningun caso. El autor mide la desviacion respecto a `Krea2Pipeline` de diffusers partiendo de una trayectoria real de ocho pasos (no de `torch.randn`), y separa el error atribuible al formato numerico del error propio del port: en el paquete float16, la propia diferencia entre float16 y bfloat16 en la referencia mueve un paso de denoising 3,51e-2, mientras que el autoencoder a anchura completa coincide con la referencia en 1,9e-6. El modo de muestreo prescrito esta destilado a ocho pasos y sin guidance, y asi aparece en el bloque `suggested:` del manifiesto.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles (`text-to-image`).
- Inferencia destilada en ocho pasos de denoising y sin escala de guidance; no requiere la receta de 30 pasos con CFG de SDXL.
- Empaquetado autocontenido: cada paquete incluye denoiser, codificador de texto, autoencoder y tokenizer, sin descargas adicionales para generar una imagen.
- Ejecucion mediante CLI (`waifu draw -m krea2-turbo.yaml`).
- Integracion programatica desde Rust: `Manifest::open`, `Krea2::from_manifest(Device::Cuda, Residency::Device, &manifest)` y `model.generate(...)`.
- Seleccion de precision en el despliegue: float16 para maxima fidelidad, FP8 para restriccion de memoria o disco.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de generacion de imagenes).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no; el idioma declarado es unicamente ingles.
- Capacidad especial: ninguna adicional declarada (sin modo de razonamiento, sin vision de entrada, sin audio).

## Casos de uso

- Generacion de ilustraciones en pipelines de Rust: el modelo se integra como crate nativo (`Krea2::from_manifest`) y evita depender de Python y diffusers en produccion, lo que simplifica el despliegue en servicios ya escritos en Rust.
- Prototipado rapido desde linea de comandos: `waifu draw -m krea2-turbo.yaml` permite obtener una imagen en ocho pasos sin escribir codigo, util para validar prompts o comparar los dos paquetes antes de integrar nada.
- Despliegue en GPUs con VRAM limitada: el paquete FP8 de 17,3 GB permite ejecutar el modelo en tarjetas de 24 GB, donde el paquete float16 de 33,8 GB no cabria sin recurrir a offload.
- Servicios de generacion de imagenes bajo cuota de disco: alojar el paquete FP8 reduce el almacenamiento a la mitad (17,3 GB frente a 33,8 GB) y facilita el escalado horizontal con varias copias del modelo.
- Verificacion de fidelidad numerica en portes y cuantizaciones: las tablas de desviacion por etapa (estados del codificador, paso de denoising, decodificacion, trayectoria completa) sirven como base para validar portes propios a otros runtimes o backends.
- Investigacion sobre destilacion y regimen de muestreo: el modelo permite estudiar el comportamiento de una destilacion a ocho pasos sin guidance frente a la receta clasica con CFG, comparando resultado y coste computacional.
- Cadena de post-produccion artistica: dado que el paquete FP8 produce "la misma escena dibujada algo distinta", puede usarse para exploracion de variaciones antes de fijar una semilla y regenerar en float16.
- Escenarios de uso comercial condicionados: solo son validos por debajo del umbral de ingresos de la seccion 2.3 de la licencia y con filtrado de contenido desplegado segun la seccion 4.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni FID, ni CLIP score, ni metricas MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo). Lo unico cuantificable que aporta la model card es la desviacion numerica frente a la implementacion de referencia de diffusers, medida sobre una trayectoria real de ocho pasos:

| Etapa medida | Paquete float16 | Paquete FP8 |
|---|---|---|
| Los doce estados capturados del codificador | 1,06e-2 | 4,39e-2 |
| Un paso de denoising | 3,60e-2 | 5,62e-2 |
| Decodificacion del autoencoder | 1,72e-3 | igual (no esta cuantizado) |
| Ocho pasos, extremo a extremo | 9,94e-2 | 3,40e-1 |

Controles de referencia citados en la model card:

| Medida de control | Valor |
|---|---|
| Desviacion de un paso de denoising entre float16 y bfloat16 en la referencia | 3,51e-2 |
| Coincidencia del autoencoder a anchura completa en el procesador frente a la referencia | 1,9e-6 |

## Requisitos de hardware

- VRAM estimada para el paquete float16: aproximadamente 34 GB solo de pesos, por lo que se necesita una GPU de 40 GB o mas para mantener todo residente en dispositivo. Estimacion derivada del tamano en disco; la model card no publica cifras de VRAM.
- VRAM estimada para el paquete FP8: aproximadamente 18 GB solo de pesos, lo que deja margen en GPUs de 24 GB. Estimacion derivada del tamano en disco.
- GPUs recomendadas para float16: A100 40 GB/80 GB, H100, A6000 48 GB, RTX 6000 Ada 48 GB o superiores.
- GPUs recomendadas para FP8: RTX 4090 24 GB, RTX 5090, L40S 48 GB, L4 y cualquier tarjeta con soporte de CUDA y al menos 24 GB.
- Cabe en GPU de consumo: si, con el paquete FP8 en tarjetas de 24 GB; el paquete float16 no cabe en GPU de consumo de 24 GB o menos sin tecnicas adicionales de gestion de memoria.
- Opciones de despliegue: libwaifu (CLI `waifu draw` y crate de Rust con `Device::Cuda`); `Krea2Pipeline` de diffusers se menciona como implementacion de referencia para comparar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de difusion de imagenes.
- Latencia y throughput: no disponibles. El unico dato de coste indirecto es el numero de pasos de muestreo (ocho, sin guidance) al que esta destilado el modelo.
- Almacenamiento: 33,8 GB para el paquete float16 y 17,3 GB para el FP8; el repositorio completo ocupa 51,1 GB.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ling0322/libwaifu-krea2-turbo (float16) | Este repositorio, paquete de 33,8 GB | no disponible | no disponible | Desviacion extremo a extremo de 9,94e-2 frente a la referencia | krea-2-community-license (other) | HuggingFace, 0 descargas |
| ling0322/libwaifu-krea2-turbo (FP8) | Este repositorio, paquete de 17,3 GB | no disponible | no disponible | Desviacion extremo a extremo de 3,40e-1 | krea-2-community-license (other) | HuggingFace, 0 descargas |
| krea/Krea-2-Turbo | Pesos originales de los que deriva esta copia | no disponible | no disponible | Referencia de comparacion (`Krea2Pipeline` de diffusers) | krea-2-community-license | HuggingFace, repositorio oficial de Krea |

No se dispone de datos de benchmarks ni de parametros de terceros (por ejemplo alternativas de generacion de imagen de la misma categoria) en la informacion proporcionada, por lo que no se puede establecer una comparativa cuantitativa con modelos externos.

## Limitaciones y advertencias

- La model card advierte de que esta copia esta modificada, no es un producto oficial de Krea y no cuenta con el respaldo de Krea.
- El repositorio figura con 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni mantenimiento por parte de terceros.
- Licencia restrictiva: el uso comercial solo se permite por debajo del umbral de ingresos de la seccion 2.3 del Krea 2 Community License Agreement.
- La seccion 4.2 de la licencia exige que cualquier despliegue de estos pesos incorpore filtrado de contenido; obviarlo incumple las condiciones.
- El paquete FP8 no sale gratis: multiplica por cuatro el error en el codificador de texto y altera de forma medible la trayectoria de ocho pasos. La propia model card recomienda usarlo solo cuando la limitacion es de memoria o de tarjeta grafica.
- El autoencoder no se cuantiza en el paquete FP8, por lo que no hay ahorro de error por esa via.
- Riesgo de alucinacion: no disponible como metrica; en generacion de imagenes el fenomeno equivalente es la deriva semantica respecto al prompt, y no se publican evaluaciones al respecto.
- Limitacion de idioma: los prompts deben ir en ingles; el modelo declara unicamente `en`.
- Regimen de muestreo estrecho: la receta habitual de 30 pasos con guidance 5 produce, segun el autor, una imagen "quemada" con cuatro veces mas trabajo.
- No se publican parametros totales, longitud de contexto del codificador de texto, ni cifras de VRAM, latencia o throughput; cualquier planificacion de capacidad debe hacerse por medicion propia.
- No apto para tareas de texto, razonamiento, codigo, tool calling ni agentes; esas capacidades simplemente no existen en este modelo.
- Los resultados de la busqueda web realizados no contienen informacion relevante sobre este modelo (las entradas devueltas tratan de temas ajenos), por lo que no se puede contrastar la informacion de la model card con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ling0322/libwaifu-krea2-turbo
- Modelo base oficial: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio libwaifu: https://github.com/ling0322/libwaifu
- Documentacion tecnica de la arquitectura (`docs/krea2.md`): https://github.com/ling0322/libwaifu/blob/main/docs/krea2.md (ruta indicada en la model card)
- Licencia Krea 2 Community: https://krea.ai/krea-2-licensing
- Politica de uso aceptable: https://www.krea.ai/krea-2-use-policy
- Ficheros de licencia y aviso incluidos en el repositorio: `LICENSE.pdf` y `NOTICE`
