# aiguancezhan/Agnes-3.0-Qwen-IQ4_XS-Basalt

## Resumen

Agnes-3.0-Qwen-IQ4_XS-Basalt es un paquete de cuantizacion comunitaria en formato basalt del modelo Agnes-3.0-Qwen, desarrollado por Agnes AI como derivado post-entrenado de Qwen3.8-Flash-Next. El paquete lo publica el usuario aiguancezhan y no constituye una release oficial ni de Agnes AI ni de Qwen: se trata exclusivamente de una conversion de pesos (BF16 oficiales → GGUF de bartowski con calibracion imatrix → repackaging en basalt) sin modificacion alguna de los pesos del modelo.

El modelo subyacente emplea una arquitectura `qwen4_exp` de tipo MoE con atencion hibrida: 48 capas, 512 expertos enrutados con 10 activos por token, aproximadamente 180B parametros totales y unos 6B activos. Su contexto nativo alcanza 1.048.576 tokens y admite entrada de vision (imagen y video) mediante un proyector empaquetado en la seccion `vision/mmproj`. Incorpora ademas una capa MTP (multi-token prediction) integrada que habilita decodificacion especulativa.

La relevancia de este paquete es practica: permite ejecutar un MoE de ~180B con contexto de un millon de tokens en hardware de consumo alto (una RTX 5090 de 24 GB junto con 190 GB de RAM del sistema), gracias al modo resident-experts del motor basalt, que mantiene los expertos en RAM y reserva VRAM para las partes densas. La version IQ4_XS esta optimizada para velocidad frente a calidad de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` hybrid-attention MoE, 48 capas |
| Parametros totales | ~180B |
| Parametros activos | ~6B (512 expertos enrutados, 10 activos por token) |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | IQ4_XS (gate/up) + IQ4_NL (down) con imatrix, calibration-v6; empaquetado en basalt |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Qwen Community License 1.0 (licencia `other`, nombre `qwen-community-1.0`) |
| Formato de pesos | Basalt pack (`.basalt`, 17 secciones, 98,7 GiB); origen GGUF |
| Vision | Si (imagen y video), proyector en `vision/mmproj` |
| Decodificacion especulativa | Si, capa MTP integrada |
| Motor requerido | basalt >= 0.5.7 con adaptador qwen4exp |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Qwen es un transformer MoE de atencion hibrida con 48 capas y 512 expertos enrutados, de los cuales 10 se activan por token, lo que resulta en ~180B parametros totales y ~6B activos por inferencia. Esta configuracion de activacion dispersa es lo que hace viable su despliegue: el coste computacional por token se aproxima al de un modelo denso de ~6B, mientras que la capacidad representacional corresponde a un modelo de ~180B. El contexto nativo es de 1.048.576 tokens, y se incluye una capa MTP que actua como draft layer para decodificacion especulativa, con una tasa de aceptacion reportada del 90,3 % en la prueba de 1M de contexto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas por Agnes AI en el post-entrenamiento de Agnes-3.0-Qwen; la model card del paquete de cuantizacion no los detalla. Respecto al proceso de cuantizacion, la cadena documentada es: pesos BF16 oficiales → cuantizacion GGUF de bartowski con calibracion imatrix (calibration-v6) → conversion y empaquetado con basalt-converter. Los expertos se cuantizan con IQ4_XS en las proyecciones gate y up, e IQ4_NL en la proyeccion down, una combinacion orientada a velocidad. El paquete incluye 17 secciones con verificacion de integridad superada y lleva embebidos los ficheros `LICENSE.txt` y `NOTICE`.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles, con contexto de hasta 1.048.576 tokens.
- Procesamiento de vision: entrada de imagenes y video mediante el proyector multimodal incluido en la seccion `vision/mmproj`.
- Razonamiento multi-paso y tareas de agente gracias a la ventana de contexto extendida.
- Decodificacion especulativa nativa mediante capa MTP, con aceptacion reportada del 90,3 %.
- Capacidad de recuperacion en contextos masivos: en la prueba de 16 agujas sobre 874.844 tokens obtuvo 16/16 aciertos.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de codigo y matematicas: no detalladas en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir una base de codigo extensa o documentacion tecnica completa en una sola pasada y responder preguntas transversales sobre ella, evitando pipelines de recuperacion fragmentada.
- Procesamiento de video largo: la entrada de video junto con el contexto de un millon de tokens permite resumir o interrogar grabaciones extensas (reuniones, clases, material de vigilancia) manteniendo la coherencia temporal a lo largo de toda la secuencia.
- Investigacion documental y legal: carga de expedientes, contratos o corpus normativos completos en chino o ingles para extraccion de clausulas, comparacion entre versiones y deteccion de contradicciones, aprovechando la ventana nativa sin truncamiento.
- Asistencia sobre grandes volumenes de datos estructurados en texto: volcados de logs, trazas o exportaciones CSV de gran tamano analizados en una unica sesion para identificar patrones y anomalias.
- Despliegue en estacion de trabajo con GPU de consumo: el modo resident-experts de basalt permite servir el modelo con una RTX 5090 de 24 GB y 190 GB de RAM, habilitando prototipado e inferencia local de un MoE de 180B sin clúster.
- Generacion aumentada por recuperacion a gran escala: el contexto de 1M tokens reduce la necesidad de reordenar y comprimir fragmentos recuperados, lo que simplifica la arquitectura del pipeline RAG en aplicaciones de soporte tecnico o bases de conocimiento internas.
- Evaluacion de recuperacion en contextos masivos: utilizable como banco de pruebas para medir la degradacion de atencion a lo largo de secuencias de cientos de miles de tokens en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados son mediciones de inferencia del propio autor del paquete:

| Medicion | Entorno | Resultado |
|---|---|---|
| Prompt processing, contexto 512K | RTX 5090 D V2 24G + 190G RAM, basalt 0.5.7, ecache auto, vram-reserve 1536, kv int8 | ~6.400 t/s (pp) |
| Generacion, contexto 512K | Mismo entorno (496K entrada / 3.000 tokens generados x3) | ~184 t/s (tg) |
| Prompt processing, contexto 1M | Mismo entorno, 874.844 tokens | ~5.700 t/s (pp) |
| Generacion, contexto 1M | Mismo entorno | ~195 t/s (tg) |
| Recuperacion 16 agujas (3 %–97 %) | Mismo entorno, 874.844 tokens | 16/16 aciertos |
| Tasa de aceptacion MTP | Mismo entorno | 90,3 % |
| Carga de pesos | Mismo entorno | RAM ~48–58 GiB + VRAM ~18 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: ~18 GiB en el modo resident-experts medido, con los expertos residentes en RAM del sistema.
- RAM del sistema: 64 GB minimo segun el autor; en la medicion real la carga de pesos ocupo entre 48 y 58 GiB, por lo que se recomienda 128–192 GB para margen operativo.
- GPU recomendadas: RTX 5090 (24 GB) validada por el autor; por capacidad de VRAM son tambien candidatas RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB), aunque no hay mediciones publicadas en estas.
- Cabe en GPU de consumo: si, en RTX 5090 de 24 GB con 190 GB de RAM; no cabe integramente en VRAM de una GPU de consumo, ya que el pack ocupa 98,7 GiB.
- Opciones de despliegue: exclusivamente el motor basalt (version >= 0.5.7 con adaptador qwen4exp). No es compatible con vLLM, llama.cpp, Ollama ni TGI en formato basalt.
- Almacenamiento: ~99 GiB para el fichero `.basalt`.
- Latencia y throughput: ~184–195 t/s de generacion y ~5.700–6.400 t/s de prompt processing en el hardware medido, con KV cache en int8.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Agnes-3.0-Qwen ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato de este paquete |
|---|---|---|---|---|---|---|
| Agnes-3.0-Qwen-IQ4_XS-Basalt | ~180B | ~6B | 1.048.576 | Si | Qwen Community 1.0 | Basalt IQ4_XS |
| Agnes-3.0-Qwen (BF16 oficial) | ~180B | ~6B | 1.048.576 | Si | Qwen Community 1.0 | Safetensors BF16 |
| GGUF de bartowski (origen) | ~180B | ~6B | 1.048.576 | Si | Qwen Community 1.0 | GGUF |
| Otras alternativas MoE de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Paquete no oficial: no es una release de Agnes AI ni de Qwen; el autor del modelo base no respalda esta conversion. Para produccion critica conviene valorar los pesos BF16 oficiales.
- Solo dos idiomas declarados (chino e ingles); el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No hay benchmarks academicos publicados para el modelo base ni para esta cuantizacion, por lo que no es posible evaluar su calidad frente a alternativas con datos objetivos.
- La cuantizacion IQ4_XS es "speed-first": prioriza velocidad sobre fidelidad, con IQ4_NL en la proyeccion down de los expertos, lo que puede degradar tareas sensibles a precision numerica.
- Dependencia de un unico motor (basalt >= 0.5.7); no hay soporte en vLLM, llama.cpp, Ollama ni TGI, lo que limita portabilidad y opciones de escalado.
- Requiere RAM del sistema muy elevada (64 GB minimo, 128–192 GB recomendado) ademas de la GPU; no es desplegable en entornos con memoria limitada.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en la informacion disponible; la ventana de 1M tokens puede aumentar la probabilidad de atender informacion irrelevante si el prompt no se estructura bien.
- Licencia Qwen Community License 1.0: impone condiciones adicionales al uso comercial que deben revisarse en `LICENSE.txt` antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en 2026-11-27, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/aiguancezhan/Agnes-3.0-Qwen-IQ4_XS-Basalt
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Perfil del autor del modelo base (Agnes AI): https://huggingface.co/Agnes-AI
- Cuantizaciones GGUF de bartowski (origen de la conversion): https://huggingface.co/bartowski
