# kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-imatrix-GGUF

## Resumen

Agnes-3.0-Flash-Preview-MTP-ROCmFP4-imatrix-GGUF es un repositorio de cuantizaciones GGUF de 4 bits del modelo Agnes-AI/Agnes-3.0-Flash, publicado por el usuario kingjones777. No se trata de un modelo nuevo, sino de una version comprimida y calibrada del modelo base: 33B densos, modalidad texto e imagen, con una ventana de contexto de 262.144 tokens y una cabeza MTP (multi-token prediction) integrada para decodificacion especulativa. El repositorio incluye dos niveles de cuantizacion, Q4_0_ROCMFP4_STRIX_LEAN y Q4_0_ROCMFP4_COHERENT, ambos calibrados con una matriz de importancia (imatrix) calculada sobre el propio modelo en BF16.

La diferencia respecto al build estandar del mismo autor (kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF) es exclusivamente el criterio de seleccion de escalas de cuantizacion: con imatrix, la escala de cada bloque se elige minimizando el error ponderado por la magnitud de activacion de los pesos, al mismo ancho de bits y con los mismos tipos de tensor. Segun las mediciones del autor, esto reduce la divergencia KL media frente a BF16 un 11,6 % en STRIX_LEAN y un 16,4 % en COHERENT, sin aumentar el tamano de fichero ni el coste de computo por token.

El interes practico del repositorio es doble: por un lado, ofrece una via para ejecutar un modelo multimodal de 33B y contexto muy largo en hardware AMD Strix Halo (gfx1151, Ryzen AI Max 395, Radeon 8060s) mediante llama.cpp; por otro, documenta una metodologia de evaluacion poco habitual en cuantizaciones de comunidad, con corpus de calibracion y de evaluacion separados, intervalos de error y verificacion por sha256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 72 capas troncales, 54 capas de regla delta (delta-rule) y 18 capas de atencion global; cabeza MTP y proyector de vision |
| Parametros totales | 32.661.228.864 (≈32,7 B); el autor lo describe como 33B densos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (16,82 GiB) y Q4_0_ROCMFP4_COHERENT (17,77 GiB); el autor menciona tambien ficheros de 8 bits en la familia, sin detallarlos en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (la del repositorio de cuantizacion) |
| Formato de pesos | GGUF (llama.cpp); se incluye ademas un fichero de matriz de importancia en formato GGUF |
| Modalidades | Texto e imagen (pipeline image-text-to-text) |
| Repositorio | 38,1 GB en total; creado el 16 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base, por lo que no hay datos disponibles sobre numero de tokens, composicion del corpus ni uso de RLHF o DPO. Lo que si se detalla es la estructura del tronco, a partir del desglose de las 558 entradas de la matriz de importancia: 72 capas troncales compuestas por 54 capas de regla delta (ocho multiplicaciones de matrices cada una) y 18 capas de atencion global (siete cada una). Esto corresponde a una arquitectura hibrida en la que la mayoria de las capas emplea una recurrencia lineal tipo delta-rule y una minoria mantiene atencion global completa. La proyeccion de salida y el bloque MTP quedan fuera de la calibracion imatrix. El repositorio incorpora ademas la etiqueta qwen3.5, que el autor no desarrolla en el texto.

La innovacion tecnica del repositorio es el propio proceso de cuantizacion. La matriz de importancia se calculo sobre el GGUF en BF16, con 129 fragmentos de 512 tokens y el conjunto de calibracion comunitario bartowski calibration_datav3.txt, cubriendo las 558 entradas de pesos de las 72 capas troncales. El fichero resultante, Agnes-3.0-Flash-Preview.imatrix, tiene sha256 `eb66b219d8bb057b78b933e5b78042fc47e028415d626690883c8c8f72707a09`. En la ruta ROCmFP4 con `--imatrix`, la escala de cada bloque de 4 bits se elige mediante una busqueda exhaustiva que minimiza el error ponderado por el uso de cada peso en las activaciones de calibracion, en lugar del criterio no ponderado por defecto. El modelo conserva la cabeza MTP integrada para decodificacion especulativa, el proyector de vision y el parche de cache de prompt presentes en el build estandar.

## Capacidades

- Generacion de texto conversacional en modo chat, con pipeline declarado image-text-to-text.
- Razonamiento explicito: el repositorio incluye la etiqueta reasoning, aunque la model card no detalla modos de pensamiento ni presupuestos de razonamiento.
- Entrada multimodal de imagen y texto mediante el proyector de vision incluido en la build.
- Contexto de 262.144 tokens, apto para documentos extensos y conversaciones de muchos turnos.
- Decodificacion especulativa mediante la cabeza MTP integrada, sin necesidad de un modelo borrador externo.
- Ejecucion en llama.cpp sobre backend ROCm (gfx1151) y Vulkan, con mediciones de rendimiento publicadas para ambos.
- Capacidad multilingue: no disponible; el repositorio no declara idiomas soportados.
- Tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Otras capacidades especiales (audio, thinking mode explicito): no disponible.

## Casos de uso

- Asistente conversacional local en un equipo Strix Halo: con 16,82-17,77 GiB de pesos, el modelo se ejecuta en la memoria unificada de un Ryzen AI Max 395 con Radeon 8060s (gfx1151) sin GPU dedicada, lo que permite mantener los datos en la maquina y evitar costes de API.
- Analisis de documentacion tecnica extensa: la ventana de 262.144 tokens permite cargar manuales, especificaciones o expedientes completos en una sola pasada sin troceado ni recuperacion externa, algo relevante cuando las referencias cruzadas entre secciones son frecuentes.
- Preguntas y respuestas sobre imagenes tecnicas: el pipeline image-text-to-text y el proyector de vision permiten consultar diagramas, capturas de pantalla, planos o documentacion escaneada junto con texto de contexto.
- Chat interactivo de baja latencia: la cabeza MTP acelera la decodificacion hasta 26,31 tok/s en ROCm0 (frente a 23,30 tok/s del tier COHERENT), lo que hace viable una conversacion fluida en hardware de escritorio.
- Procesamiento por lotes de prompts largos: con 260,8 tok/s de prefill en ROCm0 para STRIX_LEAN, resulta adecuado para clasificar, resumir o extraer informacion de lotes de documentos donde el coste dominante es la fase de prefill.
- Despliegue con requisitos de licencia permisiva: la licencia apache-2.0 declarada en el repositorio facilita la integracion en productos comerciales, siempre que se verifiquen tambien los terminos del modelo base.
- Evaluacion y auditoria de cuantizaciones: el repositorio publica la metodologia de grading (KLD frente a BF16 sobre wikitext-2 test), los intervalos de error y el sha256 de la matriz de importancia, lo que permite a equipos de investigacion reproducir o rebatir las mediciones antes de adoptar la cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para tareas estandar (MMLU, HumanEval, GSM8K, MMMU u otros). Las unicas metricas publicadas son de fidelidad de la cuantizacion frente al GGUF en BF16, medidas sobre wikitext-2 test (40 fragmentos de 1.023 tokens evaluados, 40.920 tokens en total, ventana de 2.048, sin solapamiento con el texto de calibracion).

| Tier | Build | Tamano | KLD vs BF16 (menor mejor) | Coincidencia top-1 | PPL (× BF16) | KLD percentil 99 |
|---|---|---:|---:|---:|---:|---:|
| Q4_0_ROCMFP4_STRIX_LEAN | estandar | 16,82 GiB | 0,0438 ± 0,0010 | 91,29 % | 6,4877 ± 0,0792 (×1,0250) | 0,4262 |
| Q4_0_ROCMFP4_STRIX_LEAN | imatrix | 16,82 GiB | 0,0387 ± 0,0010 | 91,52 % | 6,4269 ± 0,0777 (×1,0154) | 0,3863 |
| Q4_0_ROCMFP4_COHERENT | estandar | 17,77 GiB | 0,0385 ± 0,0009 | 91,39 % | 6,4290 ± 0,0780 (×1,0157) | 0,3765 |
| Q4_0_ROCMFP4_COHERENT | imatrix | 17,77 GiB | 0,0322 ± 0,0008 | 92,11 % | 6,4004 ± 0,0772 (×1,0112) | 0,3131 |

| Delta de imatrix | STRIX_LEAN | COHERENT |
|---|---:|---:|
| KLD medio | −11,6 % (3,5 σ) | −16,4 % (5,4 σ) |
| KLD mediano | −16,9 % | −18,3 % |
| KLD percentil 99 | −9,3 % | −16,8 % |
| Coincidencia top-1 | +0,23 pp | +0,72 pp |

Rendimiento de decodificacion con MTP y de prefill, medido por el autor:

| Metrica | STRIX_LEAN | COHERENT |
|---|---:|---:|
| TG con MTP, ROCm0 (tok/s) | 26,31 (rango 25,56-26,42) | 23,30 (rango 23,29-23,66) |
| TG con MTP, Vulkan0 (tok/s) | 25,37 | 25,46 |
| Prefill, ROCm0 (tok/s) | 260,8 | 231,9 |

El autor aplica un umbral de ruido propio: diferencias de velocidad de decodificacion inferiores al 8,3 % se consideran empate, porque la aceptacion del borrador varia con el prompt; en prefill, diferencias superiores al 3,0 % se consideran reales. Tambien advierte que los valores de KLD de 4 bits obtenidos hoy son entre un 7,8 % y un 9,4 % mas altos que una evaluacion anterior de los mismos pesos en la misma maquina, antes de un reinicio, mientras que los ficheros de 8 bits reprodujeron exactamente su salida previa.

## Requisitos de hardware

- Peso en disco y en memoria: 16,82 GiB (STRIX_LEAN) y 17,77 GiB (COHERENT); el repositorio completo ocupa 38,1 GB.
- Hay que sumar el proyector de vision (mmproj) y la cache KV; el autor no publica el tamano de ninguno de los dos, por lo que el consumo total a contexto completo es no disponible.
- Plataforma objetivo declarada: AMD gfx1151, es decir Ryzen AI Max 395 con Radeon 8060s dentro de la familia Strix Halo, que emplea memoria unificada y no depende de VRAM dedicada.
- Backends medidos: ROCm0 y Vulkan0 a traves de llama.cpp. El autor solo publica cifras de rendimiento para estos dos.
- GPU de consumo: 16,82 GiB de pesos no caben en tarjetas de 16 GB de VRAM una vez anadidos el proyector y la cache KV. En tarjetas de 24 GB (por ejemplo RTX 3090 o RTX 4090) encajarian los pesos, pero el margen para cache KV es reducido; no hay mediciones publicadas en ese escenario. Esta estimacion se deriva del tamano de fichero y no de una prueba del autor.
- Throughput publicado: 26,31 tok/s de decodificacion con MTP y 260,8 tok/s de prefill para STRIX_LEAN en ROCm0; 23,30 y 231,9 tok/s respectivamente para COHERENT en el mismo backend.
- Opciones de despliegue: llama.cpp sobre ROCm o Vulkan. No hay informacion sobre soporte en vLLM, TGI, Ollama u otros motores.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos de terceros comparables (ni datos de benchmarks estandar del modelo base ni de alternativas de tamano similar). La comparacion posible se limita a las variantes del propio repositorio y al modelo base en BF16.

| Version | Tamano | KLD vs BF16 | Coincidencia top-1 | Formato | Licencia |
|---|---:|---:|---:|---|---|
| COHERENT imatrix | 17,77 GiB | 0,0322 | 92,11 % | GGUF | apache-2.0 |
| COHERENT estandar | 17,77 GiB | 0,0385 | 91,39 % | GGUF | apache-2.0 |
| STRIX_LEAN imatrix | 16,82 GiB | 0,0387 | 91,52 % | GGUF | apache-2.0 |
| STRIX_LEAN estandar | 16,82 GiB | 0,0438 | 91,29 % | GGUF | apache-2.0 |
| Agnes-3.0-Flash (BF16, modelo base) | No disponible | 0 (referencia) | 100 % (referencia) | No disponible | No disponible en la informacion proporcionada |

Segun el autor, el STRIX_LEAN con imatrix iguala la calidad del COHERENT estandar dentro del margen de error (KLD 0,0387 frente a 0,0385, 0,2 σ) en un fichero un 5,3 % mas pequeno, y el COHERENT con imatrix es el build de 4 bits con menor KLD medido por el autor para este modelo.

## Limitaciones y advertencias

- Cuantizacion de 4 bits: incluso el mejor tier diverge de BF16 en un 7,89 % de decisiones top-1 y muestra un KLD de 0,0322; el error no es despreciable en tareas sensibles a la distribucion de probabilidad.
- Sin benchmarks de capacidad: no hay resultados publicados de MMLU, HumanEval, GSM8K u otros, por lo que no puede afirmarse el nivel real del modelo en razonamiento, codigo o matematicas.
- Sesgos conocidos: no disponible; el autor no documenta evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La cuantizacion de 4 bits anade divergencia respecto al modelo en BF16, lo que puede agravar errores en generacion factual.
- Idiomas soportados: no disponible; no hay lista de idiomas ni evaluaciones multilingues.
- Rendimiento dependiente del backend: las cifras publicadas corresponden a ROCm0 y Vulkan0 sobre gfx1151. En otras plataformas el rendimiento y el comportamiento de la decodificacion especulativa pueden diferir.
- Umbrales de significacion: el propio autor considera empate cualquier diferencia de decodificacion inferior al 8,3 %, de modo que las comparaciones de velocidad entre tiers deben leerse con esa cautela.
- Inestabilidad de medicion reconocida: los valores de KLD de 4 bits variaron entre un 7,8 % y un 9,4 % tras un reinicio de la maquina, aunque los ficheros de 8 bits reprodujeron su salida. Las cifras deben tomarse como relativas y no como absolutas.
- Requisitos no publicados: el tamano del proyector de vision y el consumo de cache KV a 262.144 tokens no estan documentados, lo que impide planificar el despliegue con precision.
- Licencia: el repositorio declara apache-2.0, pero la licencia del modelo base Agnes-AI/Agnes-3.0-Flash no se detalla en la informacion proporcionada; conviene verificarla antes de un uso comercial.
- Estado de vista previa: el modelo base se etiqueta como Preview, lo que sugiere que puede cambiar.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- MTP y proyector requieren soporte especifico del motor de inferencia; no hay informacion sobre compatibilidad con motores distintos de llama.cpp.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-imatrix-GGUF
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Build estandar del mismo autor: https://huggingface.co/kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF
- Fichero de matriz de importancia: `Agnes-3.0-Flash-Preview.imatrix`, sha256 `eb66b219d8bb057b78b933e5b78042fc47e028415d626690883c8c8f72707a09`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados se limitaron a articulos generales sobre inteligencia artificial sin relacion con Agnes-3.0-Flash.
