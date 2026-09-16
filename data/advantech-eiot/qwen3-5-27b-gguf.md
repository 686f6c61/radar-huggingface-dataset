# Advantech-EIOT/Qwen3.5-27B-GGUF

## Resumen

Advantech-EIOT/Qwen3.5-27B-GGUF es un repositorio de cuantizaciones GGUF del punto de control multimodal Qwen/Qwen3.5-27B, publicado por Advantech-EIOT (el brazo de integración de IA de Advantech, fabricante taiwanés de plataformas industriales y de computación en el borde). No se trata de una publicación oficial de Qwen: el propio autor lo declara explícitamente como una cuantización de terceros derivada de la conversión BF16 oficial, revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`. El modelo cubre la tarea image-text-to-text, es decir, acepta imagen y texto como entrada y genera texto.

El paquete incluye dos cuantizaciones del modelo principal (Q4_K_M de 16.547.399.232 bytes e IQ3_KT de 11.003.203.136 bytes) y dos proyectores multimodales (mmproj) alineados con el modelo, en BF16 y Q4_K_M. El objetivo es claro: permitir el despliegue de un modelo de 26.895.998.464 parámetros en hardware con recursos limitados, típicamente equipos de inferencia en el borde, reduciendo el peso de 54 GB aproximados en BF16 a 10-16 GB según la cuantización elegida.

Su relevancia es doble. Por un lado, acerca un modelo multimodal de ~27B a GPUs de gama media o a plataformas industriales con VRAM contenida. Por otro, introduce requisitos de runtime poco habituales: la cuantización IQ3_KT y el soporte VLM de Qwen3.5 exigen una compilación de llama.cpp de la línea b8779 con parches, y el autor advierte de que las compilaciones estándar no están garantizadas. El repositorio no incluye ese runtime personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no detalla la arquitectura interna; se sabe que es multimodal image-text-to-text con proyector visual independiente) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Longitud de contexto | no disponible (la configuracion probada por el autor usa `-c 2048`, pero no se declara el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M e IQ3_KT para el modelo principal; mmproj en BF16 y mmproj en Q4_K_M con precision mixta (Q4_K, Q5_0, Q8_0, F16, F32) |
| Idiomas soportados | no disponible (el repositorio no declara lista de idiomas) |
| Licencia | Apache-2.0, heredada del modelo base oficial |
| Formato de pesos | GGUF (modelo principal y proyectores multimodales), con `manifest.json` de tipos de tensor y procedencia |

Datos adicionales verificables del repositorio:

| Elemento | Tamano (bytes) | SHA-256 |
|---|---|---|
| Q4_K_M/Qwen3.5-27B-Q4_K_M.gguf | 16.547.399.232 | 989be6a8064cfd3e47a48a80f48799cc45e228262e729a79b85a9e2f888e00b2 |
| IQ3_KT/Qwen3.5-27B-IQ3_KT.gguf | 11.003.203.136 | 0c4d21d7353898f4e3bfe1b86c9e511902c463076659694e9020f02d8a866458 |
| mmproj/mmproj-Qwen3.5-27B-BF16.gguf | 931.145.984 | 2abfbdeed2794d147bfa9bfee7b7b1536755c2d79b5a7d3cd911b0104ad011de |
| mmproj/mmproj-Qwen3.5-27B-Q4_K_M.gguf | 522.293.120 | e4dd117ca99e4de92d03a0e860736b36d4ba123d091f55836e9adaf991175c82 |

Tamano total del repositorio: 29,0 GB. Fecha de creacion: 2026-09-16.

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es un proceso de cuantizacion post-entrenamiento sobre el punto de control oficial Qwen/Qwen3.5-27B. La informacion disponible no detalla si el modelo base es denso o de mezcla de expertos, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de RLHF o DPO; esos datos corresponden a la model card del modelo base, que no forma parte de la informacion proporcionada. Lo que si se documenta es la presencia de un proyector multimodal separado (mmproj), lo que confirma una arquitectura VLM con torre de vision y proyector hacia el modelo de lenguaje.

En cuanto al proceso de cuantizacion, ambas versiones parten de la misma conversion BF16 oficial y de la misma matriz de importancia (imatrix) especifica del VLM, sin recuantizaciones de terceros a baja precision. El Q4_K_M se genero con un cuantizador personalizado de la linea b8779 y el IQ3_KT con el cuantizador de ik_llama.cpp, aunque la inferencia probada se mantuvo siempre en el runtime b8779 personalizado. La calibracion formal consta de 288 muestras y 497 entradas, con DAT SHA-256 `ffc7d3c738ea19d9511e76934dc7a1581eb20fa0d0667241178b2087c4c6c143`. El proyector Q4_K_M usa precision mixta nativa (Q4_K, Q5_0, Q8_0, F16, F32) porque las formas de los tensores de vision lo imponen; no todas sus pesos son de 4 bits y no se le aplico imatrix del modelo de lenguaje.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja (`--jinja`) y API compatible con `/v1/chat/completions`.
- Comprension de imagenes: descripcion de escenas (captioning) y tareas de image-text-to-text.
- OCR funcional: el autor reporta que la prueba de OCR de un titulo de libro paso correctamente.
- Razonamiento espacial basico sobre imagenes: las respuestas espaciales coincidieron con la etiqueta del conjunto de datos de calibracion.
- Soporte multimodal completo a traves del proyector mmproj, con dos variantes de precision intercambiables.
- Capacidades de tool calling, function calling, agentes o modo de razonamiento explicito: no disponible (no se mencionan en la informacion proporcionada).
- Capacidades de audio o video: no disponible.
- Idiomas: no disponible.

## Casos de uso

- Inferencia multimodal en el borde industrial: con la cuantizacion IQ3_KT (11,0 GB) mas el proyector Q4_K_M (0,52 GB) el conjunto ocupa unos 10,7 GiB, lo que permite ejecutarlo en un PC industrial con GPU de gama media y anadir descripcion de imagenes o lectura de paneles a un sistema de control ya desplegado.
- Verificacion visual en linea de produccion: el modelo puede recibir la captura de una camara y generar una descripcion textual del estado de la linea, integrándose en un pipeline de inspeccion donde el texto generado se registre o se compare con una plantilla esperada.
- Digitalizacion de documentacion tecnica y etiquetas: el OCR funcional reportado permite extraer texto de etiquetas, placas de caracteristicas o portadas, un escenario tipico en mantenimiento industrial y trazabilidad de activos.
- Asistente de mantenimiento con contexto visual: tecnicas de campo que fotografian un equipo y formulan preguntas en lenguaje natural, con el modelo respondiendo en formato conversacional desde una estacion local sin enviar imagenes a la nube.
- Prototipado de producto VLM: el par Q4_K_M + mmproj BF16 ofrece una referencia de mayor fidelidad para validar si una tarea visual concreta es viable antes de invertir en hardware de mayor capacidad.
- Investigacion sobre cuantizacion multimodal: el repositorio documenta checksums, manifiesto de tensores, imatrix y calibracion, lo que lo convierte en un material util para estudiar el efecto de IQ3_KT frente a Q4_K_M en tareas de vision, siempre que se disponga del runtime compatible.
- Despliegue con offload parcial: la configuracion probada con `-ngl 16` demuestra un reparto viable entre GPU y CPU para equipos donde la VRAM no permite cargar todas las capas, util en servidores de inferencia de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor es explicito al respecto: las pruebas realizadas son comprobaciones funcionales (smoke checks) y no una evaluacion de precision. Los unicos datos cuantitativos de validacion son los siguientes:

| Aspecto de la validacion | Resultado reportado |
|---|---|
| Combinaciones probadas | 4 (dos cuantizaciones principales x dos proyectores) |
| Peticiones ejecutadas | 16 (texto, caption, OCR y espaciales) |
| Errores de truncado de tokens | ninguno, todas las respuestas finalizaron con normalidad |
| Sanidad de texto | superada |
| OCR de titulo de libro | superado |
| Descripcion de escena | las leyendas describieron la escena principal visible |
| Respuestas espaciales | coincidieron con la etiqueta del conjunto de datos |
| Comparacion de logits de referencia contra BF16 | no realizada |
| Benchmark de calidad frente al modelo BF16 | no realizado |

El autor advierte que los casos de prueba proceden de los propios datos de calibracion, por lo que no constituyen evidencia de generalizacion independiente, y que el caso de la imagen del borde del sofa es visualmente ambiguo, de modo que la coincidencia con la etiqueta no prueba correccion.

## Requisitos de hardware

- VRAM estimada para el modelo principal mas proyector: IQ3_KT + mmproj Q4_K_M ocupa aproximadamente 10,7 GiB (11.003.203.136 + 522.293.120 bytes); Q4_K_M + mmproj BF16 ocupa aproximadamente 16,3 GiB (16.547.399.232 + 931.145.984 bytes).
- Referencia BF16 sin cuantizar: no incluida en el repositorio; una conversion BF16 de 26,9 mil millones de parametros ronda los 54 GB, lo que queda fuera de cualquier GPU de consumo actual.
- Caben en GPU de consumo: si, ambas cuantizaciones. Con 24 GB de VRAM (RTX 4090, RTX 3090, A5000) el Q4_K_M entra con holgura; con 12 GB o 16 GB es mas realista la IQ3_KT, y aun asi puede requerir offload parcial de capas.
- GPU profesionales: A100 40/80 GB, H100 y L40S pueden alojar cualquiera de las dos cuantizaciones completas, dejando margen para contexto y lote. El autor no publica que GPU concreta uso.
- Configuracion probada por el autor: `-ngl 16`, `-c 2048`, `-b 256`, `-ub 128`, `-t 12`, `-tb 12`, `--parallel 1`, `--fit off`, `--no-warmup` y la variable `GGML_CUDA_DISABLE_GRAPHS=1`. Se trata de ajustes de offload parcial validados, no de recomendaciones de rendimiento para cualquier dispositivo.
- Opciones de despliegue: llama.cpp, pero con matices importantes. El runtime probado es una compilacion personalizada de la linea b8779 con soporte VLM de Qwen3.5 y de IQ3_KT; el autor no garantiza que el b8779 sin parches ni otras compilaciones al uso funcionen con estos archivos. Para el cuantizador IQ3_KT se uso ik_llama.cpp. Compatibilidad con vLLM, Ollama o TGI: no disponible, y no se menciona en la informacion.
- Latencia y throughput estimados: no disponibles. No se publican tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

La model card no cita alternativas de terceros ni ejecuta comparaciones contra otros modelos, por lo que no es posible contrastar parametros, contexto o rendimiento con competidores de la misma categoria. La unica comparacion sustentada en datos del propio repositorio es entre sus dos cuantizaciones y el modelo base:

| Version | Tamano en disco | Precision | Notas |
|---|---|---|---|
| Qwen3.5-27B BF16 (base oficial) | no disponible en este repositorio (estimacion aproximada de 54 GB por parametros) | BF16 | Fuente de origen; no se publica ningun benchmark comparativo frente a las cuantizaciones |
| Qwen3.5-27B Q4_K_M (Advantech-EIOT) | 16.547.399.232 bytes (15,41 GiB) | 4 bits, k-quant medio | Cuantizado con la linea b8779 personalizada; incluye imatrix especifica del VLM |
| Qwen3.5-27B IQ3_KT (Advantech-EIOT) | 11.003.203.136 bytes (10,25 GiB) | 3 bits, preset IQ3_KT | Cuantizado con ik_llama.cpp; requiere soporte explicito del preset en el runtime |

Advertencia del autor sobre la nomenclatura: el preset exacto es IQ3_KT, no IQ3_K_T; su `preset/file_type 152` y su enum de tensor 154 son identificadores distintos.

Modelos comparables de otros autores: no disponible.

## Limitaciones y advertencias

- No existe evidencia de generalizacion: los 16 casos de validacion funcional provienen de los datos de calibracion, y no se hizo comparacion de logits contra BF16 ni benchmark de calidad. Tratar cualquier cifra de precision como inexistente.
- Fallo conocido y no corregido: la combinacion IQ3_KT con el proyector BF16 leyo mal el texto de una senal en su leyenda, interpretandolo como "50000 PASSENGERS"; la descripcion de la escena principal siguio siendo plausible, lo que ilustra el riesgo de OCR erroneo en baja precision.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; las leyendas plausibles no equivalen a descripciones correctas, como reconoce el propio autor en el caso de la imagen ambigua del sofa.
- Dependencia de runtime: los archivos requieren una compilacion personalizada de llama.cpp de la linea b8779 con soporte Qwen3.5 VLM e IQ3_KT. Esa compilacion no se distribuye en el repositorio y no hay garantia de que el upstream limpio funcione. Verificar arquitectura, proyector y soporte del enum de tensor antes de desplegar.
- Compatibilidad de proyectores: nunca debe usarse un mmproj de otro tamano de modelo. Los proyectores validados son especificos de Qwen3.5-27B.
- Prestaciones no documentadas: no hay latencia, throughput ni consumo de memoria medidos mas alla de la configuracion de prueba.
- Idiomas y cobertura multilingue: no disponibles; el repositorio no declara lista de idiomas.
- Contexto: la unica cifra publicada es `-c 2048` en la configuracion probada, muy inferior a lo que suelen ofrecer los modelos de esta clase; no hay confirmacion del maximo real soportado.
- Licencia: Apache-2.0 heredada del origen oficial, lo que en principio permite uso comercial, pero conviene revisar el fichero LICENSE y la model card del modelo base para condiciones adicionales de Qwen.
- Madurez del repositorio: 0 descargas y 0 likes en el momento del analisis, sin validacion independiente de la comunidad.
- Calidad del proyector: al mmproj Q4_K_M no se le aplico imatrix del modelo de lenguaje, y su precision es mixta por imposicion de las formas de los tensores de vision.
- Fechas del repositorio: creado y actualizado el 2026-09-16, con un intervalo de 14 minutos entre ambas marcas, lo que sugiere una publicacion inicial sin iteraciones posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-27B
- Manifiesto de tensores y procedencia: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF/blob/main/manifest.json
- Licencia del repositorio: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF/blob/main/LICENSE
- Cuantizacion Q4_K_M: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF/blob/main/Q4_K_M/Qwen3.5-27B-Q4_K_M.gguf
- Cuantizacion IQ3_KT: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF/blob/main/IQ3_KT/Qwen3.5-27B-IQ3_KT.gguf
- Proyector multimodal BF16: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF/blob/main/mmproj/mmproj-Qwen3.5-27B-BF16.gguf
- Proyector multimodal Q4_K_M: https://huggingface.co/Advantech-EIOT/Qwen3.5-27B-GGUF/blob/main/mmproj/mmproj-Qwen3.5-27B-Q4_K_M.gguf
- llama.cpp (runtime de referencia, linea b8779): https://github.com/ggml-org/llama.cpp
- ik_llama.cpp (cuantizador usado para IQ3_KT): https://github.com/ikawrakow/ik_llama.cpp
- Sitio corporativo de Advantech: https://www.advantech.com/en-us
- Informacion corporativa de Advantech: https://www.advantech.com/en-us/about/
