# dmeight/Qwen3.8-27B-Splash-8bit

## Resumen

Qwen3.8-27B-Splash-8bit es un paquete no oficial del modelo Qwen3.8-27B de Alibaba Cloud (equipo Qwen), empaquetado por el usuario dmeight para el runtime Splash de LM Studio en Apple silicon. No es un modelo nuevo ni un reentrenamiento: el peso objetivo es una copia byte a byte del GGUF Q8_0 publicado por Unsloth (unsloth/Qwen3.8-27B-GGUF, commit `4ca7207`), al que se añaden el borrador DFlash2 de Inco AI para decodificación especulativa, la torre de visión en BF16 y el tokenizer y la plantilla de chat del paquete oficial de 4 bits.

El problema que resuelve es concreto: el paquete oficial de Splash (incoai/Qwen3.8-27B-Splash) distribuye el modelo objetivo en 4 bits, mientras que esta variante ofrece pesos de 8 bits, mucho más próximos al modelo original, a cambio de aproximadamente el 60 % de la velocidad de escritura del paquete de 4 bits. Con 27.320.697.856 parámetros y 34,8 GB de repositorio, está pensado para ejecutarse en local sobre Metal con unos 32 GB de memoria unificada.

Es relevante ahora porque permite evaluar Qwen3.8-27B en 8 bits dentro de LM Studio sin esperar a Splash 1.3.1, que cargará modelos de 8 bits de forma nativa. El autor lo describe explícitamente como un apaño temporal que depende de comportamiento no documentado de LM Studio y del motor Splash. La licencia es Apache-2.0 y el paquete se publicó el 26 de octubre de 2026, sin descargas ni valoraciones registradas hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; se cuantiza el modelo base Qwen3.8-27B de Alibaba Cloud (el repositorio lo etiqueta con la familia `qwen3_5`) |
| Parametros totales | 27.320.697.856 (27,32 mil millones, dato real de safetensors) |
| Parametros activos | No disponible; no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Objetivo Q8_0 (GGUF, con imatrix); borrador DFlash2 en BF16 cuantizado a 4 bits al cargar; torre de vision `mmproj` en BF16 |
| Idiomas soportados | No disponible; las mediciones del autor usan textos en polaco e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) para el objetivo y `mmproj.gguf` BF16 para vision; borrador en BF16; el repo incluye la etiqueta safetensors, pero el paquete Splash usa GGUF |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del modelo base ni sobre sus datos de entrenamiento (número de tokens, composición del corpus, RLHF/DPO) en la documentación disponible. Lo que sí está documentado es la composición del paquete: modelo objetivo GGUF Q8_0 sin modificar, borrador DFlash2 en BF16 que Splash cuantiza a 4 bits en el momento de la carga, torre de visión BF16 tomada del repositorio de Unsloth y ficheros de tokenizer y plantilla de chat idénticos a los del paquete oficial. Los ficheros `model.json` y `config.json` los generó el instalador de Splash (versión `0d5a035e`, comando `install/models.py --model unsloth/Qwen3.8-27B-GGUF:Q8_0 prepare`) con las rutas locales eliminadas.

La innovación técnica no está en los pesos, que no se han modificado, sino en la decodificación especulativa: el runtime Splash combina el objetivo de 8 bits con el borrador DFlash2 y acepta en torno al 28 % de sus propuestas con muestreo, lo que se traduce en unas 3,00 fichas por ciclo de verificación. El autor mide que, con muestreo (temperatura 1,0), el objetivo de 8 bits acepta más propuestas del borrador que el de 4 bits (+3,7 puntos de media en 24 indicaciones, intervalo bootstrap del 95 % de +1,1 a +6,5), mientras que en decodificación voraz no hay diferencia apreciable y las salidas son idénticas entre ejecuciones repetidas.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`), con plantilla de chat propia de Qwen3.8.
- Modo de razonamiento o *thinking*: las mediciones del autor se hicieron con el modo activado, aunque no se detalla su funcionamiento.
- Entrada de imágenes: el paquete incluye `vision/mmproj.gguf` y un `vision/model.bin` colocado para que LM Studio habilite la entrada de imagen.
- Generación de código: las pruebas de velocidad incluyen indicaciones de código junto a prosa en polaco e inglés.
- Multilingüismo: el autor verifica al menos polaco e inglés; no hay lista oficial de idiomas.
- Decodificación especulativa mediante el borrador DFlash2, con contadores de aceptación legibles desde el motor Splash.
- Compatibilidad con `endpoints_compatible`, según las etiquetas del repositorio.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente de escritura local en Mac: con 54,8 fichas/s en escritura y modo *thinking* activo, sirve para redactar y reescribir textos largos sin salir del equipo, útil cuando el contenido no puede enviarse a una API externa.
- Programación asistida en un Mac Studio o MacBook con M3 o superior: el paquete mantiene los pesos en 8 bits para reducir la pérdida de calidad frente al 4 bits, lo que ayuda en tareas de código donde los errores sutiles de cuantización se notan más.
- Análisis de documentos con imágenes: al incluir la torre de visión, permite adjuntar capturas, diagramas o páginas escaneadas junto a la pregunta en LM Studio.
- Lectura de contextos largos: el autor mide 13,5 s para procesar una indicación de 15K fichas y 39,2 fichas/s de escritura con ese contexto, un perfil adecuado para resumir o extraer datos de informes extensos.
- Evaluación comparativa de cuantizaciones: investigadores que quieran medir la degradación entre 4 y 8 bits con el mismo borrador y el mismo motor pueden usar este paquete junto al oficial y reproducir las tablas de aceptación del borrador.
- Borradores multilingües polaco-inglés: las pruebas del autor cubren prosa en ambos idiomas, de modo que es un caso validado de forma empírica, aunque no haya declaración oficial de idiomas.
- Inferencia en entornos con requisitos de privacidad: al ejecutarse en local sobre Metal, el paquete evita el tránsito de datos a servicios externos, siempre que se asuma la licencia Apache-2.0 y se conserven los avisos de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son mediciones de velocidad y de aceptación del borrador realizadas por el autor en un Mac Studio con Apple M5 Max (GPU de 40 núcleos), 64 GB de memoria y macOS 27.0.1, el 26 de octubre de 2026.

Velocidad a través de LM Studio, con indicaciones mixtas (prosa en polaco e inglés, código), *thinking* activado, temperatura 1,0, top_p 0,95, top_k 20, respuestas de 800 fichas, dos ejecuciones por medida y mediana:

| Metrica | Este paquete (8 bits) | Splash oficial (4 bits) | MLX 8 bits en LM Studio, sin decodificacion especulativa |
|---|---:|---:|---:|
| Escritura, fichas/s | 54,8 | 91,2 | 18,1 |
| Escritura con contexto de 15K fichas, fichas/s | 39,2 | 80,7 | 17,2 |
| Lectura de una indicacion de 15K fichas, s | 13,5 | 13,3 | 17,8 |

Aceptación del borrador DFlash2, 24 indicaciones en seis grupos, respuestas de 512 fichas, orden ABBA (4 bits, 8 bits, 8 bits, 4 bits), contadores leídos del motor Splash:

| Metrica | Objetivo 4 bits | Objetivo 8 bits |
|---|---:|---:|
| Muestreo (T 1,0, dos conjuntos de semillas): aceptadas | 25,7 % | 28,5 % |
| Fichas por ciclo de verificacion | 2,80 | 3,00 |
| Voraz: aceptadas | 29,1 % | 28,7 % |

## Requisitos de hardware

- Memoria: unos 32 GB para el modelo cargado; el autor mide 31,5 GB en uso. La descarga ocupa 34,8 GB, frente a los 17,4 GB del paquete oficial de 4 bits.
- Plataforma obligatoria: Apple silicon M3 o posterior con macOS 26.4 o superior, según los requisitos de Splash. No hay soporte para GPU NVIDIA ni CUDA en este paquete.
- Equipo probado: Mac Studio con M5 Max de 40 núcleos de GPU y 64 GB de memoria. En máquinas de 32 GB el margen es muy estrecho, porque el modelo consume casi toda la memoria unificada.
- VRAM estimada: no aplica en el sentido habitual; al ser memoria unificada, el requisito es de RAM del sistema (aproximadamente 31,5 GB) más el espacio para el contexto.
- Despliegue recomendado: LM Studio con el runtime Splash activado (Probado con LM Studio 0.4.26+4 y Splash 1.3.0). El paquete aparece en la búsqueda como «Qwen3.8 27B Splash 8bit».
- Alternativas de despliegue: llama.cpp, Ollama y otras herramientas GGUF pueden usar `target/Qwen3.8-27B-Q8_0.gguf` y `vision/mmproj.gguf` tal cual, sin la aceleración DFlash2; conviene descargarlos directamente de unsloth/Qwen3.8-27B-GGUF. Las herramientas MLX no pueden usarlo porque los pesos son GGUF. Splash en modo independiente rechaza el paquete, aunque puede reconstruir el mismo conjunto con `splash serve --model unsloth/Qwen3.8-27B-GGUF:Q8_0`.
- Latencia y rendimiento: 54,8 fichas/s en escritura, 39,2 fichas/s con contexto de 15K y 13,5 s para procesar una indicación de 15K fichas en el hardware indicado.

## Comparativa con modelos similares

| Modelo o paquete | Parametros | Cuantizacion | Contexto | Escritura (fichas/s) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| dmeight/Qwen3.8-27B-Splash-8bit | 27,32 mil millones | Q8_0 GGUF + borrador DFlash2 4 bits | no disponible | 54,8 | Apache-2.0 | LM Studio con runtime Splash; no oficial |
| incoai/Qwen3.8-27B-Splash | 27,32 mil millones (mismo base) | 4 bits | no disponible | 91,2 | Apache-2.0 | Paquete oficial de Splash en LM Studio |
| mlx-community/Qwen3.8-27B-8bit (via LM Studio) | 27,32 mil millones (mismo base) | 8 bits MLX | no disponible | 18,1 sin decodificacion especulativa | Apache-2.0 | Runtime MLX de LM Studio; Splash 1.3.1 o posterior tambien lo carga |
| unsloth/Qwen3.8-27B-GGUF (Q8_0) | 27,32 mil millones (mismo base) | Q8_0 GGUF | no disponible | no disponible sin DFlash2 | Apache-2.0 | llama.cpp, Ollama y otras herramientas GGUF |

## Limitaciones y advertencias

- Paquete no oficial e independiente: no está hecho ni respaldado por Inco AI, LM Studio, Alibaba Cloud ni Unsloth. Los pesos no se han modificado, pero el empaquetado es de un tercero.
- Depende de comportamiento no documentado: LM Studio solo lista una carpeta como modelo Splash si su `manifest.json` declara el formato `splash-packed-q4`, y el motor lee antes un `model.json` de instalador. Una actualización de LM Studio o del runtime Splash puede dejar de cargarlo.
- Etiquetado incorrecto en la interfaz: LM Studio asigna la etiqueta fija «4bit» a todos los paquetes Splash, aunque estos pesos son de 8 bits (34,8 GB de descarga y unos 31,5 GB en memoria frente a 17,4 GB del oficial). Conviene verificar el tamaño antes de sacar conclusiones.
- Es un apaño temporal: en cuanto LM Studio incluya Splash 1.3.1 o posterior, que carga modelos de 8 bits de forma nativa, la ruta recomendada es el paquete oficial o `mlx-community/Qwen3.8-27B-8bit`.
- Velocidad notablemente menor que el paquete de 4 bits: 54,8 frente a 91,2 fichas/s en escritura, y 39,2 frente a 80,7 con contexto de 15K. La aceptación del borrador ronda el 28 %, lo que limita la ganancia de la decodificación especulativa.
- Sin datos de calidad: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinación en la información disponible. El riesgo de alucinación es el inherente al modelo base y no está cuantificado aquí.
- Idiomas no declarados: solo se ha verificado de forma empírica polaco e inglés en las pruebas de velocidad; no hay lista oficial de idiomas ni evaluación por idioma, y el castellano no aparece en las mediciones.
- Contexto máximo no documentado: las pruebas usan 15K fichas, pero no se indica la ventana real del modelo base.
- Requisito de hardware restrictivo: Apple silicon M3 o superior y macOS 26.4 o posterior, con unos 32 GB de memoria. No funciona en GPU NVIDIA ni en herramientas MLX.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de licencia y atribución; el fichero `NOTICE` lista las fuentes y lo que añade el paquete.
- Validación comunitaria nula: cero descargas y cero valoraciones en el momento de la consulta, con creación y actualización el mismo día.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/dmeight/Qwen3.8-27B-Splash-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paquete oficial de Splash (4 bits): https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Borrador DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2 (commit `015e795`)
- GGUF de origen: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (commit `4ca7207`)
- Alternativa MLX de 8 bits: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
