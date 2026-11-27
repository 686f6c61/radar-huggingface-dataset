# litert-community/Falcon-H1-3B-Instruct

## Resumen

Falcon-H1-3B-Instruct es un modelo de lenguaje de 3.000 millones de parametros desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. Emplea una arquitectura hibrida poco habitual: cada una de sus 32 capas ejecuta en paralelo una rama de atencion con grouped-query attention (GQA) y una rama de espacio de estados Mamba2, cuyas salidas se suman. Esta combinacion busca aunar la calidad de recuperacion de informacion de la atencion clasica con la eficiencia de decodificacion de los modelos de estado recurrente, especialmente en secuencias largas.

La ficha que nos ocupa, sin embargo, no es el modelo original en formato PyTorch, sino la conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google AI Edge. El artefacto publicado es una cuantizacion int8 dinamica de 3,15 GB que mantiene las convoluciones y el escaneo selectivo en coma flotante, con activaciones declaradas en fp32 para la ruta GPU.

Su relevancia actual radica en que demuestra que un modelo hibrido de 3B puede ejecutarse con calidad practicamente identica al original en telefonos de gama alta y en portatiles Apple Silicon, con velocidades de decodificacion de 11,5 a 65 tok/s segun plataforma. Es, por tanto, una pieza util para quien quiera desplegar generacion de texto con tool calling sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 32 capas, cada una con rama GQA y rama Mamba2 (selective scan) en paralelo, sumadas |
| Parametros totales | 3B (aproximadamente 3.000 millones, segun denominacion del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el artefacto exporta firmas de prefill de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinamica en capas lineales y embedding; convoluciones y scan en coma flotante; activaciones fp32 para GPU |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (terminos en falconllm.tii.ae) |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm >= 0.15 |

## Arquitectura y entrenamiento

Falcon-H1 es un diseno completamente hibrido: no alterna capas de atencion y capas Mamba2, sino que cada capa contiene ambas ramas y las ejecuta simultaneamente sobre la misma entrada, sumando los resultados. En consecuencia, cada capa mantiene tanto una cache KV (propia de la rama de atencion) como un estado recurrente de tamano constante (convolucion + SSM de la rama Mamba2). Este diseno reduce el coste de memoria asociado a contextos largos frente a un transformer puro del mismo tamano, a la vez que conserva el mecanismo de atencion para la recuperacion precisa de informacion.

El modelo base es la version Instruct de TII, por lo que incorpora ajuste por instrucciones sobre el modelo preentrenado; la informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del corpus ni si se emplearon tecnicas concretas de RLHF o DPO. La conversion a LiteRT-LM aplica cuantizacion int8 dinamica sobre las capas lineales y el embedding, dejando en coma flotante las convoluciones y el escaneo selectivo, y exporta firmas de prefill de multiples longitudes (1 a 1024) para que el runtime seleccione fragmentos ajustados. El archivo incluye el tokenizer y la plantilla de chat ChatML de Falcon-H1.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat ChatML.
- Razonamiento aritmetico basico y respuesta a preguntas factuales (verificado en las pruebas de sanidad del autor de la conversion).
- Soporte de tool calling / function calling: desde el reempaquetado del 14 de octubre de 2026, el runtime parsea la llamada a herramienta y el resultado llega al modelo; antes se devolvia como texto del mensaje.
- Ejecucion en dispositivo con delegacion completa de operaciones (5045 operaciones delegadas en Galaxy S26 con LiteRT-LM 0.16.0).
- Inferencia en backend GPU y CPU dentro del mismo runtime LiteRT-LM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional offline en aplicaciones moviles: el modelo cabe en 3,15 GB y se ejecuta con LiteRT-LM en Android e iOS, lo que permite ofrecer chat sin conexion ni coste por token de API, con latencias de primera respuesta de 1,49 a 2,03 segundos en telefonos de gama alta.
- Automatizacion de tareas con herramientas en el dispositivo: gracias al soporte de tool calling, puede invocar funciones locales (clima, calendario, consultas a bases de datos embebidas) y recibir el resultado en el contexto, habilitando agentes ligeros que no salen del terminal.
- Procesamiento de documentos sensibles en local: para sectores con requisitos de privacidad (sanidad, legal, administracion), el modelo permite resumir y extraer informacion de textos sin enviar datos a servidores externos.
- Prototipado rapido de funcionalidades de IA en apps de escritorio: con 65,3 tok/s de decodificacion en un Mac M4 Max, es viable integrarlo en herramientas de productividad para generacion de borradores y reescritura de texto.
- Clasificacion y extraccion de entidades en pipelines de datos: su bajo coste de inferencia en CPU (20,9 tok/s en M4 Max) permite procesar lotes de textos cortos en servidores sin GPU.
- Educacion y tutoria interactiva: la ventana de contexto y la plantilla de chat permiten mantener dialogos multi-turno con explicaciones paso a paso, ejecutandose en el dispositivo del estudiante.
- Evaluacion comparativa de runtimes: sirve como banco de pruebas para medir el rendimiento de LiteRT-LM frente a otras soluciones (llama.cpp, MLC) en hardware movil, dado que el autor publica mediciones detalladas por plataforma.

## Benchmarks y rendimiento

El autor de la conversion publica mediciones de rendimiento en dispositivo con LiteRT-LM 0.16.0, no resultados de benchmarks academicos (MMLU, HumanEval, GSM8K).

| Plataforma | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Mac M4 Max | GPU | 979 tok/s | 65,3 tok/s | 0,28 s |
| Mac M4 Max | CPU | 121 tok/s | 20,9 tok/s | 2,17 s |
| iPhone 17 Pro | GPU | 111 tok/s | 14,0 tok/s | 1,49 s |
| Galaxy S26 | GPU | 109 tok/s | 11,5 tok/s | 2,03 s |

En cuanto a calidad, el autor reporta coincidencia de logits contra el modelo PyTorch original en 48 posiciones de decodificacion (top-1 y top-5 identicos, correlacion media 1,0000, KL media cercana a 0) y 8/8 en una prueba de sanidad de 8 preguntas en todas las ejecuciones (GPU y CPU, litert-lm 0.15.0 y 0.16.0).

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo int8 ocupa 3,15 GB; en GPU integrada o unificada (Apple Silicon) se comparte con la memoria del sistema. El repositorio completo pesa 13,5 GB.
- GPU recomendadas: Apple M4 Max (65,3 tok/s de decodificacion), GPU de iPhone 17 Pro (14,0 tok/s) y GPU de Galaxy S26 (11,5 tok/s). No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo y en telefonos de gama alta; el requisito es disponer de al menos unos 4 GB de memoria libre para el archivo y los estados de ejecucion.
- Opciones de despliegue: runtime LiteRT-LM (version >= 0.15, con correcciones relevantes en 0.18.0 y 0.20.0) mediante el comando `litert-lm run` con seleccion de backend `--backend gpu` o CPU. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 277 ms en Mac M4 Max GPU, 1,49 s en iPhone 17 Pro y 2,03 s en Galaxy S26; prefill de 109 a 979 tok/s segun plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Falcon-H1-3B-Instruct (LiteRT-LM) | 3B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | `.litertlm`, LiteRT-LM |
| Falcon-H1-1.5B-Instruct (LiteRT-LM) | 1,5B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | `.litertlm`, LiteRT-LM |
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0,5B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | `.litertlm`, LiteRT-LM |
| Falcon-H1-3B-Instruct (original TII) | 3B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | safetensors / PyTorch |

La comparativa se limita a la propia familia Falcon-H1, ya que la informacion proporcionada no incluye datos de modelos de otros fabricantes con los que contrastar parametros, contexto o rendimiento. No disponible para alternativas como Qwen, Llama o Gemma.

## Limitaciones y advertencias

- Requiere LiteRT-LM >= 0.15; el comportamiento puede variar entre versiones del runtime (se documentan diferencias entre 0.15.0, 0.16.0, 0.18.0 y 0.20.0).
- Bug conocido de reutilizacion de estado recurrente: en litert-lm 0.18.0, crear una nueva conversacion sobre un Engine ya usado reutiliza el estado de la conversacion anterior e ignora el nuevo system prompt. El autor recomienda crear un Engine nuevo por conversacion. Existe correccion en LiteRT-LM main (commit e1f86b05, 3 de noviembre de 2026) incluida en la version 0.20.0, pero este modelo no se probo con Engine compartido en esa version.
- En la ruta GPU de Android con litert-lm 0.18.0 se observa un bucle de repeticion de `<|pad|>` en la comprobacion de digitos en Mac GPU; las mediciones en telefono se hicieron con el archivo anterior y no se han repetido.
- El reempaquetado del 14 de octubre de 2026 cambio el tipo de modelo a `qwen2p5`, lo que altera los valores por defecto del ejecutor GPU del runtime; conviene validar el comportamiento tras actualizar.
- La licencia Falcon LLM License no es de codigo abierto estandar; es necesario revisar los terminos en falconllm.tii.ae antes de un uso comercial.
- Riesgo de alucinacion inherente a un modelo de 3B: no debe usarse como fuente de verdad en dominios factuales sin verificacion externa.
- Idiomas soportados no documentados; no se garantiza un rendimiento uniforme fuera del ingles.
- No hay datos publicados de sesgos, evaluaciones de seguridad ni benchmarks academicos en la informacion disponible.
- La cuantizacion int8 puede degradar tareas de razonamiento complejo o generacion de codigo, aunque el autor reporta que es el primer tamano de Falcon-H1 en el que int8 no pierde calidad en su prueba de 8 preguntas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-3B-Instruct
- Conversion hermana 0.5B: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Conversion hermana 1.5B: https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release v0.20.0 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Commit de correccion del estado recurrente: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del bug de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/falconh1-3b/CARD.md
- Terminos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
