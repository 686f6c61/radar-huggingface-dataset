# aiguancezhan/Agnes-3.0-Qwen-Q5_K_M-Basalt

## Resumen

Agnes-3.0-Qwen-Q5_K_M-Basalt es un paquete de cuantizacion comunitario en formato basalt del modelo Agnes-3.0-Qwen, desarrollado por Agnes AI como derivado post-entrenado de Qwen3.8-Flash-Next. Este repositorio, publicado por el usuario aiguancezhan, no contiene pesos nuevos: es una conversion de los pesos BF16 oficiales al formato GGUF mediante el trabajo de cuantizacion de bartowski (con calibracion imatrix) y su posterior repackaging al formato basalt mediante basalt-converter. La cadena de conversion es, por tanto, oficial BF16, GGUF Q5_K_M y finalmente basalt.

El modelo base es un transformer hibrido de atencion con arquitectura Mixture-of-Experts de tipo `qwen4_exp`, con 48 capas, 512 expertos enrutados y 10 activos por token, lo que resulta en aproximadamente 180.000 millones de parametros totales y unos 6.000 millones activos. Su contexto nativo alcanza 1.048.576 tokens y admite entrada de vision (imagen y video) mediante un proyector empaquetado en la seccion `vision/mmproj`. Incorpora una capa MTP (multi-token prediction) integrada que habilita decodificacion especulativa.

La relevancia de este paquete radica en que permite ejecutar un modelo MoE de gran tamano con contexto de un millon de tokens en hardware de consumo, a costa de un requisito de memoria elevado (96 GB o mas en modo resident-experts). El autor reporta mediciones reales sobre una RTX 5090 D V2 de 24 GB con 190 GB de RAM, con velocidades de generacion de 73 a 107 t/s segun la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` hybrid-attention MoE, 48 capas |
| Parametros totales | ~180B |
| Parametros activos | ~6B (512 expertos enrutados, 10 activos por token) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | Q5_K_M (expertos: Q5_K gate/up + Q5_1/Q8_0 down con imatrix) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Qwen Community License 1.0 (campo `license: other` en el repo) |
| Formato de pesos | basalt (pack de 17 secciones, 143,4 GiB) |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Qwen emplea una arquitectura transformer hibrida con atencion de tipo mixto y capas Mixture-of-Experts de grano fino: 48 capas con 512 expertos enrutados, de los cuales 10 se activan por token. Esta configuracion mantiene un coste computacional por token proximo a un modelo denso de 6B mientras preserva la capacidad representacional de un modelo de 180B. La ventana de contexto nativa es de 1.048.576 tokens. El modelo incluye ademas una capa MTP (multi-token prediction) que actua como borrador para decodificacion especulativa, con una tasa de aceptacion reportada del 92,4 % en la prueba de contexto largo.

El modelo base es un derivado post-entrenado de Qwen3.8-Flash-Next, aunque la model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Este repositorio concreto no introduce entrenamiento adicional: la cadena documentada es pesos BF16 oficiales, cuantizacion GGUF de bartowski con calibracion imatrix (calibration-v6) y repackaging a basalt. Los expertos se cuantizan con Q5_K en las matrices gate/up y Q5_1/Q8_0 en las down, una configuracion orientada a priorizar precision sobre tamano.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Procesamiento de vision: entrada de imagen y video mediante el proyector `vision/mmproj` incluido en el paquete.
- Contexto largo extremo: hasta 1.048.576 tokens nativos, con recuperacion verificada en pruebas de aguja en pajar a 874.844 tokens (16/16 aciertos).
- Decodificacion especulativa nativa mediante capa MTP integrada, con tasa de aceptacion del 92,4 % medida.
- Capacidades de codigo y matematicas: no documentadas explicitamente en la model card.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking: no documentado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar libros completos, expedientes legales o bases de codigo de cientos de miles de tokens en una sola pasada gracias a su ventana de 1M de tokens, sin necesidad de fragmentacion ni recuperacion externa.
- Revision de repositorios de codigo completos: con contexto de un millon de tokens es viable cargar un monorepositorio de tamano medio y realizar tareas de revision, refactorizacion o explicacion transversal entre modulos.
- Procesamiento de video e imagen con contexto textual: la entrada multimodal permite describir, resumir o extraer informacion de videos y combinarla con instrucciones de texto extensas.
- Investigacion academica sobre contexto largo: la combinacion de arquitectura MoE con atencion hibrida y MTP lo convierte en una plataforma accesible para experimentos de recuperacion de informacion en ventanas de 512K a 1M tokens en hardware de consumo.
- Despliegue en estaciones de trabajo con gran cantidad de RAM: en modo resident-experts con 96 GB o mas de memoria, permite servir un modelo de 180B totales con throughput de 73 a 107 t/s en una unica GPU de consumo.
- Generacion asistida en chino e ingles: util para pipelines bilingues de redaccion, traduccion o resumen donde se requiera contexto muy largo y no se necesite soporte de otros idiomas.
- Prototipado de decodificacion especulativa: la capa MTP integrada sirve como referencia para evaluar tecnicas de aceleracion por borrador en entornos con memoria limitada.

## Benchmarks y rendimiento

El autor publica mediciones de inferencia (no benchmarks academicos) sobre RTX 5090 D V2 24G con 190 GB de RAM, basalt 0.5.7, `ecache auto`, `vram-reserve 1536` y KV en int8, con fecha 2026-11-27:

| Escenario | Contexto | Prompt processing | Generacion | Notas |
|---|---|---|---|---|
| Contexto 512K | 496K entrada / 3000 tokens generados x3 | ~4,9-5,0K t/s | ~97-107 t/s (media 104,5 t/s) | Tres ejecuciones promediadas |
| Contexto 1M, 16 agujas | 874.844 tokens (agujas al 3 %-97 %) | ~4,5K t/s | ~73 t/s | 16/16 aciertos, aceptacion MTP 92,4 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: 96 GB o mas de RAM en modo resident-experts. El autor reporta carga real de pesos de aproximadamente 83 GiB en RAM mas unos 18 GiB en VRAM.
- VRAM: aproximadamente 18 GiB en el escenario medido; una GPU de 24 GB es suficiente como acelerador con el resto de pesos residentes en RAM.
- GPU recomendadas: RTX 5090 (24 GB) verificada por el autor; por capacidad de VRAM son igualmente viables RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB), aunque no hay mediciones publicadas en estas.
- Cabe en GPU de consumo: si, en GPUs de 24 GB, siempre que se acompanen de 96 GB o mas de RAM del sistema.
- Motor de inferencia: basalt 0.5.7 o superior con adaptador `qwen4exp`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: prompt processing de 4,5-5,0K t/s y generacion de 73-107 t/s segun contexto, en la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Agnes-3.0-Qwen-Q5_K_M-Basalt (este) | ~180B totales / ~6B activos | 1.048.576 | Qwen Community License 1.0 | basalt, 143,4 GiB, comunidad |
| Agnes-3.0-Qwen (base, BF16) | ~180B totales / ~6B activos | 1.048.576 | Qwen Community License 1.0 | safetensors BF16, oficial |
| Agnes-3.0-Qwen GGUF (bartowski) | ~180B totales / ~6B activos | 1.048.576 | Qwen Community License 1.0 | GGUF, comunidad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- No es una release oficial: se trata de una cuantizacion y repackaging comunitarios de Agnes AI / Qwen, sin modificacion de pesos pero sin aval de los autores originales.
- Cobertura idiomatica limitada a chino e ingles; no se documenta soporte de castellano ni de otros idiomas.
- La cuantizacion Q5_K_M introduce perdida de precision respecto a los pesos BF16 originales, aunque la configuracion se declara "accuracy-first".
- Requiere un motor poco extendido (basalt 0.5.7 o superior) y 96 GB o mas de RAM, lo que restringe el despliegue a estaciones de trabajo o servidores con memoria abundante.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad ni de sesgos.
- La licencia Qwen Community License 1.0 impone condiciones especificas para uso comercial que deben revisarse en el `LICENSE.txt` embebido en el paquete antes de cualquier despliegue en produccion.
- No hay informacion sobre tool calling, modo thinking ni capacidades de agente, por lo que no deben asumirse en un pipeline de produccion sin validacion previa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aiguancezhan/Agnes-3.0-Qwen-Q5_K_M-Basalt
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Organizacion Agnes AI: https://huggingface.co/Agnes-AI
- Cuantizaciones GGUF de bartowski: https://huggingface.co/bartowski
