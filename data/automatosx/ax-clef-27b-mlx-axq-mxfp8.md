# AutomatosX/AX-Clef-27B-MLX-AXQ-MXFP8

## Resumen

AX-Clef-27B-MLX-AXQ-MXFP8 es un checkpoint cuantizado en formato MLX para Apple Silicon, derivado del modelo denso Cloudflare/clef (familia Qwen3.5, arquitectura Qwen3_5ForConditionalGeneration) mediante la herramienta AXQuant 2.1.0 de AutomatosX. El modelo conserva 27.356 millones de parametros logicos y una ventana de contexto configurada de 262.144 tokens, con la ruta de texto cuantizada en precision mixta y la torre de vision preservada en BF16.

La relevancia de este artefacto es fundamentalmente practica: ofrece una via de ejecucion local en hardware Apple Silicon (runtimes MLX-LM) para un modelo multimodal de ~27B, con un presupuesto de almacenamiento de 29,91 GB y un BPW medido de 8,7415 en el modelo principal. No es un lanzamiento certificado ni un benchmark: el propio autor lo etiqueta como evidencia de desarrollo, sin metricas de calidad, velocidad de kernel ni aceptacion MTP publicadas.

Conviene subrayar que este repositorio no contiene pesos PyTorch ni GGUF, y que el soporte de vision y de aceleracion MTP no queda establecido por el paquete: los sidecars BF16 se incluyen, pero su mera presencia no valida la calidad vision-lenguaje ni la aceleracion. Es, por tanto, un artefacto para evaluacion y desarrollo local, no para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense); ruta de texto optimizada |
| Parametros totales | 27.356.723.952 (27,36B logicos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; limite practico dependiente de memoria unificada |
| Tipos de cuantizacion | AXQuant 2.1.0, precision mixta: 8bit (25,62B, 93,66%) + bf16 (1,73B, 6,34%); metodos affine y bf16; group size 32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no incluye PyTorch ni GGUF) |
| Modelo base | Cloudflare/clef (revision 0b331204bb13fbd2ca93a64df1956f5b55478ce5) |
| BPW medido (modelo principal) | 8,7415 |
| BPW medido (total) | 8,7415 |
| BPW de almacenamiento planificado | 9,4439 |
| Clase de presupuesto Hub | MXFP8 |
| Clase de precision base AXQuant | 16p0bpw |
| Tamano de pesos safetensors | 29,89 GB |
| Descarga completa aproximada | 29,91 GB |
| Tamano del repo | 30,2 GB |
| Vision | presente (sidecar BF16: 333 tensores, 460,73M parametros, 0,92 GB) |
| Audio | no presente |
| MTP | no presente |
| Runtime MLX registrado | MLX 0.32.1, MLX-LM 0.31.3 |
| AX Engine | no establecido; sin model-manifest.json nativo validado (version registrada 7.6.3) |
| Nivel de soporte | convertible |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef emplea una arquitectura transformer densa de la familia Qwen3.5 (Qwen3_5ForConditionalGeneration) con ruta de texto y torre de vision, orientada a generacion de texto y comprension de imagenes. Este checkpoint no entrena nada nuevo: es una conversion directa desde los pesos BF16 del modelo fuente, en la que la ruta de lenguaje se cuantiza en precision mixta (8bit para el 93,66% de los parametros, BF16 para el 6,34% restante) y la torre de vision se conserva integra en BF16 como sidecar.

La innovacion tecnica reside en el esquema AXQuant (AXQ): una asignacion de precision por tensor que respeta un presupuesto de almacenamiento, no una cuantizacion uniforme. Segun la model card, la asignacion se basa en priors de arquitectura y no en calibracion con datos, y la ejecucion del cuantizador registro 497 de 497 conversiones de modulo correctas sin fallbacks. No se publican datos sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO, por lo que esos extremos quedan como no disponibles en esta ficha.

## Capacidades

- Generacion de texto conversacional y de proposito general a partir de la ruta de lenguaje del modelo base.
- Procesamiento de imagenes: la torre de vision se conserva en BF16, aunque la calidad vision-lenguaje no ha sido evaluada ni reclamada por el autor.
- Contexto largo: ventana configurada de 262.144 tokens, sujeta a la memoria unificada disponible en el equipo.
- Ejecucion local en Apple Silicon mediante MLX-LM para inferencia de texto y backbone.
- Capacidades de razonamiento, codigo y matematicas: no documentadas explicitamente en la informacion disponible; dependen del modelo base Cloudflare/clef.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio o MTP: no presentes o no establecidos (MTP = False, audio = False).

## Casos de uso

- Evaluacion local de modelos de 27B en Mac: el checkpoint permite cargar un modelo denso de 27,36B en equipos Apple Silicon con MLX-LM, usando unos 30 GB de disco, para comparar comportamiento frente al modelo BF16 original en tareas de texto.
- Prototipado de asistentes conversacionales en local: con 262.144 tokens de contexto configurado, se pueden probar dialogos multi-turno largos y resumen de documentos extensos sin salir del portatil, siempre que la memoria unificada lo permita.
- Experimentacion multimodal controlada: al incluir la torre de vision en BF16, sirve para explorar pipelines de imagen y texto en MLX, asumiendo que la calidad vision-lenguaje no esta validada.
- Desarrollo de herramientas y runtimes: util para ingenieros que trabajan en MLX-LM o en el ecosistema AXQuant y necesitan un artefacto de referencia para probar carga, tokenizacion y decodificacion de un modelo de 27B cuantizado.
- Investigacion sobre cuantizacion de precision mixta: el layout documentado (8bit + BF16, group size 32, BPW 8,7415) permite estudiar el impacto de la asignacion por tensor en la perplejidad y en la estabilidad de la generacion.
- Entornos educativos y de docencia: permite demostrar en un aula con hardware Apple el funcionamiento de un modelo de gran tamano cuantizado, sin depender de GPUs dedicadas ni de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publican metricas de calidad frente a BF16 o a baselines uniformes, ni evidencia de velocidad de kernel, ni aceptacion o aceleracion MTP, ni calidad de contexto largo. La capacidad de 262.144 tokens es metadato de configuracion, no una afirmacion validada.

## Requisitos de hardware

- VRAM/memoria unificada: al tratarse de un checkpoint MLX para Apple Silicon, requiere memoria unificada compartida entre CPU y GPU. El peso en disco es de 29,89 GB; para inferencia conviene disponer de al menos 32 GB de memoria unificada, y mas para aprovechar contexto largo.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4 y variantes Pro, Max y Ultra). No esta pensado para GPU NVIDIA ni AMD en este formato.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente (32 GB o mas); no aplica a GPUs de consumo tipo RTX 4090 en este formato MLX.
- Opciones de despliegue: MLX-LM (ruta soportada y documentada). El autor advierte que MLX-LM puede ignorar metadatos de runtime AXQuant y sidecars opcionales (vision.safetensors, mtp.safetensors). AX Engine no esta establecido por falta de model-manifest.json validado. No hay pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-27B-MLX-AXQ-MXFP8 | 27,36B | 262.144 tokens (config.) | MLX safetensors, BPW 8,7415 | apache-2.0 | Cuantizacion mixta AXQuant, vision en BF16, sin benchmarks publicados |
| AX-Clef-27B-MLX-AXQ-6bit (hermano) | 27,36B (mismo base) | 262.144 tokens (config.) | MLX safetensors | apache-2.0 | Presupuesto cercano a 6 BPW; consultar BPW exacto |
| AX-Clef-27B-MLX-AXQ-4bit (hermano) | 27,36B (mismo base) | 262.144 tokens (config.) | MLX safetensors | apache-2.0 | Presupuesto de menor almacenamiento; consultar BPW exacto |
| Cloudflare/clef (BF16) | 27,36B (logicos) | no disponible en esta ficha | safetensors BF16 | no disponible en esta ficha | Modelo fuente sin cuantizar |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto no certificado: el autor lo describe como evidencia de desarrollo; las puertas formales M0-M8 de AXQuant no estan cerradas.
- Sin evidencia de calidad: no se publican metricas de retencion de calidad frente a BF16 ni frente a cuantizacion uniforme; no debe interpretarse la etiqueta AXQ como una afirmacion de benchmark.
- Vision no validada: la torre de vision se preserva en BF16, pero la calidad vision-lenguaje no ha sido evaluada ni reclamada.
- Contexto largo no validado: los 262.144 tokens son metadato de configuracion; el rendimiento real dependera de la memoria unificada y no esta medido.
- MTP no disponible: no hay sidecar MTP ni aceleracion medida.
- AX Engine no establecido: falta un model-manifest.json nativo validado; los campos de AX Engine en axquant_runtime.json describen un contrato de compatibilidad, no evidencia observada.
- Compatibilidad limitada de runtime: MLX-LM puede ignorar metadatos AXQuant y sidecars; la inferencia estandar cubre texto y backbone, no necesariamente vision ni MTP.
- Sin pesos PyTorch ni GGUF: no es desplegable en vLLM, TGI, llama.cpp u Ollama sin conversion adicional.
- Idiomas no documentados: no se especifica la cobertura linguistica, lo que impide garantizar calidad en castellano.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Cloudflare/clef.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y citar la procedencia en despliegues reproducibles fijando el commit del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-MXFP8
- Modelo base Cloudflare/clef: https://huggingface.co/Cloudflare/clef/tree/0b331204bb13fbd2ca93a64df1956f5b55478ce5
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
