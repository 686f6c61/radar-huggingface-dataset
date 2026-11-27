# aiguancez/Agnes-3.0-Qwen-IQ4_XS-abliterated-Basalt

## Resumen

Agnes-3.0-Qwen-IQ4_XS-abliterated-Basalt es un paquete de cuantizacion comunitario, no oficial, del modelo Agnes-3.0-Qwen desarrollado por Agnes AI. La particularidad de este artefacto es que los pesos en BF16 fueron modificados de forma deliberada antes de recuantizar: se aplico una tecnica de "abliteration" (ablacion de la direccion de rechazo) para eliminar el comportamiento de negativa aprendido durante el ajuste de seguridad. El resultado es un modelo "uncensored" orientado a investigacion local.

El modelo base es un transformer de tipo MoE (mixture of experts) con 48 capas principales, contexto nativo de 1.048.576 tokens, decodificacion especulativa MTP integrada y soporte de vision (imagen y video). Los pesos se distribuyen en un unico fichero de 119,6 GiB en formato propietario `basalt` (17 secciones), con cuantizacion mixta IQ4_XS para las proyecciones gate/up y IQ4_NL para las proyecciones down de los expertos, calibrada con imatrix y priorizando velocidad.

Es relevante ahora porque ejemplifica una tendencia creciente: la publicacion de variantes "abliterated" de modelos abiertos de gran tamano con contexto ultralargo, empaquetadas en formatos de inferencia especializados (basalt) que explotan tecnicas como decodificacion especulativa y cache de KV en int8. El autor reporta paridad de capacidad con el modelo original en pruebas internas, aunque no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas principales, block_count=48), con capa draft MTP y proyector de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el autor confirma que es MoE, sin cifra) |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | IQ4_XS (imatrix) en gate/up + IQ4_NL en down de expertos; KV cache int8 |
| Idiomas soportados | zh, en |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` / `qwen-community-1.0`) |
| Formato de pesos | basalt (fichero unico `.basalt`, 119,6 GiB / 128,4 GB, 17 secciones) |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Qwen es una arquitectura MoE con 48 capas principales, segun los metadatos del pack (`block_count=48`). Incorpora una capa draft MTP (multi-token prediction) para decodificacion especulativa nativa y un proyector de vision que habilita entrada de imagen y video. El pack conserva intactos tanto la capa MTP como el proyector visual; solo se modificaron los flujos de salida de atencion y MLP de las 48 capas principales.

El proceso de abliteration aplicado por el autor consistio en extraer 47 direcciones de rechazo mediante pares de prompts contrastivos (metodo cvec v3) a partir de los pesos oficiales en BF16, y proyectarlas fuera (`h -= (h·v)v`, modo proyeccion, k=1.0) de 141 tensores correspondientes a los flujos de salida de atencion y MLP. Tras la ablacion, los pesos se recuantizaron a IQ4_XS con calibracion imatrix, con una configuracion "speed-first". No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto en chino e ingles.
- Razonamiento y resolucion de problemas: el autor reporta pruebas de expectativa matematica, trampas logicas y conocimiento de arquitectura con paridad respecto al original.
- Generacion y depuracion de codigo: incluye pruebas de implementacion de algoritmos y busqueda de bugs.
- Escritura creativa y redaccion en chino e ingles.
- Procesamiento de contexto ultralargo: recall verificado de 16 agujas sobre 1M de tokens (16/16) en el rango de profundidad 3%-97%.
- Vision: soporte de imagen y video a traves del proyector visual (no modificado por la ablacion).
- Decodificacion especulativa MTP integrada (tasa de aceptacion reportada del 90% en escenario de 1M de tokens).
- Comportamiento "uncensored": 0 rechazos en 44 sondas de rechazo y 2 rechazos en 24 sondas de red team (frente a 21/24 del original).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 1M de tokens de contexto y recall verificado al 100% en pruebas de agujas, permite cargar repositorios completos, manuales o expedientes legales en una sola pasada sin fragmentacion.
- Investigacion sobre seguridad y alineacion: el pack permite estudiar el efecto de la ablacion de direcciones de rechazo sobre el comportamiento del modelo, comparando respuestas con el original en un entorno controlado.
- Procesamiento de video e imagen a gran escala: el proyector visual intacto permite tareas de descripcion, resumen o extraccion de informacion de contenido audiovisual combinado con contexto textual largo.
- Generacion de codigo en pipelines locales: el modelo soporta implementacion de algoritmos y deteccion de bugs segun las pruebas del autor, adecuado para entornos de desarrollo con GPU consumer de gama alta (RTX 5090) y 64 GB de RAM.
- Redaccion y traduccion zh-en: util para equipos que trabajan con documentacion bilingue chino-ingles en contextos largos.
- Analisis forense de conversaciones o registros: la ventana de 1M tokens y la decodificacion a 139-216 t/s permiten procesar historiales completos de interacciones en una sola inferencia.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de IQ4_XS + IQ4_NL sobre calidad y velocidad frente a otros formatos del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta pruebas internas de aceptacion y rendimiento de inferencia:

| Prueba | Resultado | Referencia |
|---|---|---|
| Sondas de rechazo (44) | 0 rechazos | — |
| Sondas de red team duras (24) | 2 rechazos | Original: 21/24 |
| Examen de capacidad (7 materias) | Paridad con el original | Equivalencia pregunta a pregunta |
| Recall 1M (16 agujas, 3%-97%) | 16/16 | — |
| Prefill 512K entrada / 3000 salida x3 | ~6,9-7,1K t/s | 496.498 tokens, 0 en cache |
| Decode 512K entrada / 3000 salida x3 | 211,5-215,8 t/s | — |
| Prefill 1M (874.844 tokens) | ~5,8K t/s | — |
| Decode 1M (874.844 tokens) | 139,7 t/s | MTP 90% aceptacion |

Medido en basalt 0.5.7 sobre RTX 5090 D V2 24G con 190 GB de RAM, KV cache int8 y `vram-reserve 1536`.

## Requisitos de hardware

- Motor de inferencia: basalt engine >= 0.5.7 con adaptador qwen4exp (`block_count=48`). No se mencionan otros motores (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- RAM: 64 GB o mas; el autor reporta ~48 GiB de RAM para carga de pesos.
- VRAM: ~18 GiB en el escenario medido, con `vram-reserve 1536` y KV cache int8.
- GPU: RTX 5090 D V2 24G validada por el autor. No se confirman otras GPU (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer de gama alta con 24 GB de VRAM, siempre que se disponga de 64 GB+ de RAM de sistema para el offload de pesos.
- Throughput medido: decode de 211-216 t/s a 512K de contexto y 139,7 t/s a 1M de contexto; prefill de 5,8-7,1K t/s.
- Latencia: no disponible de forma aislada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Agnes-3.0-Qwen-IQ4_XS-abliterated-Basalt | no disponible (MoE, 48 capas) | 1.048.576 | basalt | Qwen Community 1.0 | Abliterated, vision, MTP |
| Agnes-3.0-Qwen (original, Agnes AI) | no disponible (MoE, 48 capas) | 1.048.576 | BF16 | Qwen Community 1.0 | Modelo base con seguridad intacta |
| Packs de cuantizacion "plain" de Agnes-3.0-Qwen | no disponible | 1.048.576 | basalt / GGUF | Qwen Community 1.0 | Sin ablacion, referenciados en la model card |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoria distintos del original, por lo que la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La ablacion de rechazo es deliberada: el modelo acepta peticiones que el original rechazaria, lo que incrementa el riesgo de generar contenido danino, ilegal o inseguro. El autor lo restringe a investigacion local y uso personal.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor solo verifica paridad en 7 pruebas de capacidad, muestra insuficiente para descartar regresiones.
- Idiomas: solo chino e ingles; no se garantiza calidad en castellano ni en otras lenguas.
- La licencia Qwen Community 1.0 sigue aplicandose al pack; es necesario revisar `LICENSE.txt` para condiciones de uso comercial y restricciones adicionales.
- El formato `basalt` es propietario y requiere un motor especifico (>= 0.5.7); no hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI.
- El fichero de 119,6 GiB exige almacenamiento considerable y 64 GB+ de RAM para carga; no es desplegable en entornos con menos recursos.
- No se han publicado evaluaciones independientes de sesgo, toxicidad o robustez; las pruebas del autor son internas y no replicadas.
- El autor no proporciona cifras de parametros totales ni activos, lo que dificulta estimar costes de inferencia en otros hardware.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/aiguancez/Agnes-3.0-Qwen-IQ4_XS-abliterated-Basalt
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Agnes AI (organizacion): https://huggingface.co/Agnes-AI
- Licencia Qwen Community 1.0: incluida como `LICENSE.txt` en el repositorio (no se proporciona URL directa)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
