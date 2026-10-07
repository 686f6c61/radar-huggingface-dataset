# AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en precision mixta mediante AXQuant (AXQ) para Apple Silicon, publicado por AutomatosX y derivado directamente del modelo BF16 Qwen/Qwen3.8-Flash-Next (revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`). Se distribuye en formato de pesos MLX Safetensors, con licencia Apache 2.0 y un total de 177.392.830.611 parametros logicos segun los ficheros safetensors del repositorio.

El modelo base corresponde a la arquitectura `Qwen4ExpForConditionalGeneration`, un transformer de tipo mezcla de expertos (MoE) con contexto configurado de 262.144 tokens. La conversion mantiene la ruta de lenguaje cuantizada y preserva en BF16 la cabeza de prediccion multi-token (MTP) y la torre de vision, tanto dentro del checkpoint como en sidecars vinculados cuando estan presentes.

Su relevancia practica es acotada y experimental: se trata de un artefacto de desarrollo del ecosistema AXQuant, no de un lanzamiento certificado. El propio autor declara que el paquete incluye registros de conversion e integridad de artefactos, pero no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, por lo que los resultados deben tratarse como compatibilidad de ejecucion y no como rendimiento validado. El repositorio acumula 344 descargas y 0 likes desde su creacion el 29 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (mezcla de expertos, MoE); ruta de texto optimizada |
| Parametros totales | 177.392.830.611 (177,39 B logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | AXQuant 1.9.0 con precision mixta; clase de presupuesto `MXFP4`; clase de precision base `6p8bpw`; BPW planificado ajustado por almacenamiento 6,3924; BPW medido del modelo principal 5,7281; BPW total medido (incluyendo MTP) 5,8769 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |
| Tamano de pesos safetensors | 132,23 GB |
| Descarga completa aproximada | 132,26 GB |
| Tamano del repositorio | 339,7 GB |
| Cabecera MTP | presente (`True`) |
| Torre de vision | presente (`True`) |
| Audio | no presente (`False`) |
| Entorno de conversion | MLX 0.32.1, MLX-LM 0.31.3, AX Engine 7.5.7 |
| Ejecucion nativa en AX Engine | no establecida; no se incluye `model-manifest.json` nativo validado |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base, `Qwen4ExpForConditionalGeneration`, una topologia de mezcla de expertos (MoE) orientada a generacion condicional. La informacion disponible no detalla el numero de expertos, la dimensionalidad de las capas, el numero de capas ni la configuracion de atencion del modelo original, por lo que esos datos quedan como no disponibles. Si se confirma que la tarea de generacion condicional incluye vision, la torre correspondiente se conserva sin cuantizar y se expone como artefacto separado dentro del paquete.

No se trata de un modelo entrenado desde cero, sino de una conversion cuantizada del BF16 original: AXQuant `1.9.0` aplica un plan de precision mixta por tensor en lugar de una precision uniforme. Los tensores protegidos permanecen en precision superior, de modo que un plan nominalmente asociado a 6 bits puede usar 4 bits como base y recurrir a 6 bits, 8 bits o BF16 en otros tensores para aproximarse a un presupuesto total de unos 6 BPW. En este paquete, el resultado medido se queda en 5,7281 BPW en el modelo principal y 5,8769 BPW contando la cabeza MTP, por debajo del presupuesto planificado de 6,3924 BPW. No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre etapas de ajuste tipo RLHF o DPO, que corresponderian al modelo base y no a esta conversion.

La innovacion tecnica relevante del paquete es la conservacion de la cabeza de prediccion multi-token (MTP) en BF16 junto con la ruta de lenguaje cuantizada, lo que en teoria permite decodificacion con aceptacion de varios tokens por paso. Para explotarla hay que usar ramas especificas: la rama `omlx` (oMLX 0.7.0.dev4) indexa el MTP nativo de Qwen4 y exige `qwen4_ple_ssd_offload=true` por modelo en el host probado; la rama `mtplx` (MTPLX 2.11.3) aporta una tabla de n-gramas canonica, normas adaptadas y expertos MTP nativos, y requiere modo MTP para entrada de imagen. MLX-LM estandar cubre inferencia de texto/backbone, pero puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales (`vision.safetensors`, `mtp.safetensors`).

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag `conversational` esta presente.
- Razonamiento y codigo: capacidad esperable por herencia del modelo base, pero no documentada ni medida en esta conversion; no disponible.
- Vision: la torre de vision esta presente y preservada en BF16. En la rama MTPLX la entrada de imagen exige modo MTP activo. No hay datos medidos de calidad vision-lenguaje.
- Prediccion multi-token (MTP): cabeza presente y empaquetada; su aceleracion solo es explotable mediante las ramas `omlx` o `mtplx`, no con el layout original importado directamente.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no figura en la model card).
- Audio: no soportado (`Audio present: False`).
- Modo de pensamiento explicito: no documentado en la informacion disponible.

## Casos de uso

- Experimentacion local con modelos de gran escala en Apple Silicon: el paquete reduce un modelo de 177,39 B parametros logicos a 132,23 GB de pesos, lo que permite ejecutarlo en estaciones de trabajo Mac con memoria unificada muy alta sin necesidad de clústeres CUDA.
- Evaluacion de tecnicas de cuantizacion de precision mixta: util para investigadores que quieran comparar este pack `MXFP4` frente a los hermanos `4bit` y `6bit` del mismo autor y medir el efecto del BPW real (5,7281 frente a 5,8769 incluyendo MTP) sobre la calidad.
- Pruebas de decodificacion especulativa con MTP: usando las ramas `omlx` o `mtplx` se puede medir si la cabeza multi-token aporta aceleracion real en generacion de texto larga, algo que el autor no ha publicado y que queda por validar.
- Pipelines multimodales de prototipado: al conservar la torre de vision, permite experimentar con entradas de imagen en modo MTP. Adecuado para validar flujos antes de pasar a un modelo de vision certificado.
- Desarrollo de runtimes y kernels MLX: el paquete documenta versiones concretas de MLX (0.32.1), MLX-LM (0.31.3) y AX Engine (7.5.7), lo que lo convierte en un caso de prueba util para validar compatibilidad de kernels de cuantizacion en Apple Silicon.
- Servicio conversacional de contexto muy largo en local: con 262.144 tokens de contexto configurados, sirve para experimentar con resumen de documentos extensos o analisis de repositorios completos, siempre que la memoria unificada del equipo lo permita.
- Base para auditorias de reproducibilidad: al fijar la revision del Hub y la revision del modelo fuente, es util en entornos donde se necesita trazabilidad exacta del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card es explicita al respecto: el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y advierte que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark. Los unicos registros disponibles son comprobaciones de compatibilidad realizadas el 6 de octubre de 2026 sobre las ramas `omlx` y `mtplx`, consistentes en generacion de texto corto con MTP activado y desactivado, mas generacion de imagen en los modos soportados. Son verificaciones de desarrollo, no mediciones de calidad ni de exactitud de MTP.

## Requisitos de hardware

- Naturaleza del runtime: MLX esta disenado para Apple Silicon, por lo que no existe ruta CUDA y las GPU NVIDIA no son aplicables a este paquete.
- Memoria unificada necesaria: los pesos safetensors ocupan 132,23 GB. A partir de ese dato, la inferencia exige equipos con memoria unificada holgadamente superior a 132 GB, teniendo en cuenta margen para cache KV y buffers de runtime. Los Mac Studio con M2 Ultra de 192 GB quedan muy justos, especialmente con contexto largo; configuraciones de 256 GB o 512 GB (M3 Ultra y superiores) son las adecuadas.
- VRAM estimada: no disponible de forma medida. Como referencia derivada del tamano de pesos, no bajar de 132 GB de memoria disponible para los pesos, mas la cache KV, cuyo tamano exacto no puede calcularse porque no se publican el numero de capas, cabezas ni dimensiones del modelo base.
- GPU recomendadas: no aplicable; el paquete esta orientado exclusivamente a Apple Silicon.
- Cabe en GPU de consumo: no. El tamano de 132,23 GB excede cualquier GPU de consumo actual (por ejemplo, 24 GB de RTX 4090 o 32 GB de RTX 5090).
- Opciones de despliegue: MLX-LM para inferencia de texto/backbone; ramas especificas `omlx` (oMLX 0.7.0.dev4) y `mtplx` (MTPLX 2.11.3) para explotar el MTP. No hay pesos GGUF, por lo que llama.cpp u Ollama no son aplicables. La ejecucion nativa en AX Engine no esta establecida al no incluirse un `model-manifest.json` validado.
- Latencia y throughput: no disponibles. La model card indica que no se publican mediciones de velocidad de kernels ni de MTP, y advierte que el comando de MLX-LM no establece aceleracion MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BPW / cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP4-MTP (este) | 177,39 B logicos | 262.144 | 5,7281 BPW medido en el modelo principal; 5,8769 total con MTP | apache-2.0 | MLX Safetensors | Clase de presupuesto `MXFP4`, precision base `6p8bpw`; incluye MTP y vision |
| AX-Qwen3.8-Flash-Next-MLX-AXQ-4bit-MTP (hermano) | mismo base | 262.144 | presupuesto AXQ inferior; BPW exacto a consultar | apache-2.0 | MLX Safetensors | Trade-off declarado: menor almacenamiento |
| AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP (hermano) | mismo base | 262.144 | cercano al presupuesto de 6 BPW; BPW exacto a consultar | apache-2.0 | MLX Safetensors | Trade-off declarado: mayor precision promedio |
| Qwen/Qwen3.8-Flash-Next (fuente BF16) | 177,39 B logicos | 262.144 | BF16 sin cuantizar | a consultar en el repositorio base | Safetensors (segun repositorio base) | Origen de la conversion; sin datos de rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento medido para ninguno de los modelos de la tabla, por lo que la comparativa se limita a parametros, contexto, licencia y formato. No se han identificado en la informacion proporcionada alternativas de terceros con las que comparar de forma cuantitativa.

## Limitaciones y advertencias

- Artefacto de desarrollo, no certificado: el autor indica expresamente que no es un lanzamiento AXQuant certificado y que no publica evidencia de calidad, contexto largo, velocidad de kernels ni velocidad de MTP.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, ni para esta conversion ni referenciada desde el modelo base en la informacion disponible.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones de calidad, no puede acotarse el impacto de la cuantizacion mixta sobre la fidelidad de las respuestas.
- Idiomas no declarados: el campo de idiomas no esta disponible, por lo que no puede garantizarse un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Contexto largo no validado: aunque la configuracion admite 262.144 tokens, no se ha publicado evidencia de rendimiento en long-context, y el limite practico dependera de la memoria unificada del equipo.
- Limitacion de hardware severa: 132,23 GB de pesos implican equipos Apple Silicon de gama muy alta; no es desplegable en GPU de consumo ni en entornos CUDA.
- Compatibilidad de runtime fragmentada: MLX-LM puede ignorar los metadatos de AXQuant y los sidecars, de modo que la ejecucion estandar no confirma aceleracion MTP ni calidad vision-lenguaje.
- Ejecucion nativa en AX Engine no establecida: los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada. La deteccion de la version 7.5.7 no constituye una verificacion de runtime.
- Requisitos especificos en las ramas: la rama `omlx` exige `qwen4_ple_ssd_offload=true` por modelo en el host probado; la rama `mtplx` requiere modo MTP para entrada de imagen.
- Licencia: Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen/Qwen3.8-Flash-Next, que no se detallan en la informacion proporcionada.
- Confusion potencial de nomenclatura: la clase de presupuesto `MXFP4` no implica que todos los tensores esten a 4 bits; el BPW medido es el dato autoritativo.
- Trazabilidad: se recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.
- La busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo; unicamente aparecieron paginas sin relacion con el ambito de la IA open source, por lo que no se han incorporado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revision del modelo fuente: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP
- Rama oMLX (oMLX 0.7.0.dev4): https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP4-MTP/tree/ec729dc15eb3c2559939acd3e89f76eb56f3aef6
- Rama MTPLX (MTPLX 2.11.3): https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-MXFP4-MTP/tree/3793ab3412d45fbe98a031bd9b9244ad59420f17
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de la busqueda web.
