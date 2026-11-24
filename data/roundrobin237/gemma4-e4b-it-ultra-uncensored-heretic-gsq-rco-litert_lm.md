# RoundRobin237/Gemma4-E4B-it-ultra-uncensored-heretic-GSQ-RCO-LiteRT_LM

## Resumen
Gemma4-E4B-it-ultra-uncensored-heretic-GSQ-RCO-LiteRT_LM es un paquete de inferencia en dispositivo (on-device) para Android derivado del checkpoint comunitario llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic, a su vez un ajuste "uncensored/heretic" del modelo multimodal Gemma 4 E4B IT de Google. Lo publica el usuario RoundRobin237 y su singularidad no reside en un nuevo entrenamiento, sino en el empaquetado: un unico fichero `.litertlm` de 3,63 GB que integra grafo movil, tokenizer, codificador y adaptador de vision, y un modelo borrador MTP para decodificacion especulativa.

El modelo resuelve el problema de llevar un LLM multimodal con ventana de 64K a telefonos Android mediante el runtime LiteRT-LM con backend GPU/OpenCL. La innovacion tecnica esta en la cuantizacion mixta GSQ/RCO: seis matrices `mlp.up_proj` (capas 7, 12, 19, 25, 31 y 36) se almacenan en INT2 con signo y tamano de grupo 32, mientras el resto de pesos del modelo de lenguaje mantiene precision movil mixta con INT4 como formato primario.

Es relevante ahora porque demuestra inferencia multimodal con contexto largo (validada con 63.694 tokens de entrada) en hardware de consumo como un Galaxy S22 Ultra, combinando decodificacion especulativa, atencion global por tiles durante el prefill y una KV cache circular de 2.048 posiciones para la atencion local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B) con encoder de vision y adaptador; modelo borrador MTP para decodificacion especulativa; atencion local con KV cache circular y atencion global por tiles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el checkpoint base es E4B; el autor no publica el desglose) |
| Longitud de contexto | 65.536 tokens (64K), compartidos entre entrada y salida |
| Tipos de cuantizacion | Mixta: INT2 con signo (grupo 32, una escala FP16 por grupo) en 6 matrices `mlp.up_proj`; INT4 como formato primario del resto de pesos del LM; precision mixta movil original en los demas tensores |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), fichero unico de 3.631.742.976 bytes |

## Arquitectura y entrenamiento
El modelo base es Gemma 4 E4B IT, un transformer multimodal que acepta texto e imagen (pipeline `image-text-to-text`). El paquete no entrena desde cero: parte del checkpoint Heretic de llmfan46, calcula los deltas de la proyeccion de salida de atencion respecto al checkpoint de referencia de Google (gemma-4-E4B-it) y los transfiere a 17 tensores de peso sobre la rejilla de cuantizacion de la plantilla movil. El grafo, tokenizer, borrador MTP y componentes de vision proceden del bundle LiteRT Community Gemma 4 E4B IT, con el grafo del borrador adaptado al layout modificado de la KV cache.

La innovacion central es la cuantizacion GSQ/RCO: GSQ ajusta candidatos de pesos de bajo bit y RCO evalua asignaciones de precision dentro de las seis proyecciones MLP seleccionadas, dando como resultado 2,5 bits por peso (2 bits por peso mas 16 bits de escala por grupo de 32) en esas seis matrices. En inferencia, el modelo usa una KV cache circular de 2.048 posiciones para atencion local y atencion global por tiles durante el prefill para reducir memoria temporal; la firma principal de prefill procesa 1.024 tokens por llamada. No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el checkpoint Heretic.

## Capacidades
- Generacion de texto y razonamiento conversacional multi-turno con ventana de 64K tokens.
- Entrada de imagen: el bundle incluye codificador de vision y adaptador, con identificacion de imagenes validada en pruebas del autor.
- Decodificacion especulativa mediante modelo borrador MTP integrado, orientada a reducir latencia en dispositivo.
- Inferencia on-device en Android con backend GPU/OpenCL de LiteRT-LM; el backend de vision puede ejecutarse en CPU.
- Ajuste "uncensored/heretic": el checkpoint base esta modificado para reducir rechazos, lo que afecta al comportamiento en contenido sensible.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso
- Asistente conversacional offline en Android: el modelo cabe en un unico fichero de 3,63 GB y se ejecuta con LiteRT-LM en GPU/OpenCL, permitiendo conversaciones multi-turno sin conexion gracias a la ventana de 64K tokens.
- Analisis de documentos largos en el telefono: con 63.694 tokens de entrada validados en un Galaxy S22 Ultra, es adecuado para resumir o consultar PDFs y transcripciones extensas directamente en el dispositivo.
- Descripcion y clasificacion de imagenes en local: el encoder de vision embebido permite etiquetar fotos, extraer texto de capturas o responder preguntas sobre imagenes sin enviar datos a la nube.
- Prototipado de aplicaciones moviles con IA generativa: desarrolladores pueden integrar el `.litertlm` en apps Android mediante LiteRT-LM y validar latencia real en hardware de gama alta de 2022 en adelante.
- Escenarios con requisitos de privacidad: al ejecutarse integramente en el dispositivo, evita la exposicion de datos personales a servicios externos, util en salud, legal o finanzas.
- Investigacion sobre cuantizacion extrema: las seis matrices INT2 con GSQ/RCO sirven como caso de estudio reproducible para medir el impacto de 2,5 bits por peso en calidad y velocidad.
- Procesamiento de imagenes en campo: reconocimiento visual en entornos sin conectividad (inspeccion, accesibilidad, catalogacion) usando el backend de vision en CPU.

## Benchmarks y rendimiento

| Prueba | Entorno | Resultado observado |
|---|---|---|
| Contexto largo | Galaxy S22 Ultra (SM-S908N), Android LiteRT-LM 0.19.1, GPU/OpenCL, ventana 64K, MTP activado | Respuesta correcta tras 63.694 tokens de entrada; prefill a 221,6 tokens/s en esa ejecucion |
| Vision | Ventana 64K, MTP activado, backend de vision en CPU | Identificacion correcta de una imagen de prueba roja |
| Aplicacion Rabillam | Mismo fichero de modelo | Streaming de texto y reconocimiento de imagen superados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- Almacenamiento: 3,63 GB para el fichero `.litertlm` unico.
- VRAM/memoria: no disponible de forma explicita; el modelo esta disenado para memoria unificada de moviles, no para GPU de escritorio.
- Hardware validado: Samsung Galaxy S22 Ultra (SM-S908N) con backend GPU/OpenCL.
- GPU de escritorio recomendadas: no aplica; el runtime LiteRT-LM esta orientado a Android. Para A100, H100 o RTX 4090 no hay soporte documentado en la informacion disponible.
- Cabida en GPU de consumo: no disponible para el formato `.litertlm`; requeriria conversion a otro runtime no descrito por el autor.
- Opciones de despliegue: LiteRT-LM (runtime oficial), aplicacion Rabillam en Android. vLLM, llama.cpp, Ollama y TGI no estan soportados para este formato segun la informacion disponible.
- Latencia y throughput: prefill de 221,6 tokens/s medido en Galaxy S22 Ultra con MTP activado; velocidad de decodificacion no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Gemma4-E4B-it-ultra-uncensored-heretic-GSQ-RCO-LiteRT_LM | no disponible (base E4B) | 64K | `.litertlm` | Apache 2.0 | On-device Android, cuantizacion INT2 mixta, vision, MTP |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic | no disponible (base E4B) | no disponible | safetensors (checkpoint) | no disponible | Checkpoint Heretic de referencia, sin empaquetado movil |
| litert-community/gemma-4-E4B-it-litert-lm | no disponible (base E4B) | no disponible | `.litertlm` | no disponible | Plantilla movil oficial de la comunidad LiteRT, sin ajuste Heretic |
| google/gemma-4-E4B-it | no disponible (base E4B) | no disponible | safetensors | Gemma Terms | Modelo de referencia de Google, sin cuantizacion extrema |

## Limitaciones y advertencias
- El ajuste "uncensored/heretic" reduce los rechazos del modelo base; puede generar contenido sensible, ofensivo o inseguro sin filtros, lo que exige moderacion externa en produccion.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de fidelidad para este paquete.
- La cuantizacion INT2 en seis matrices `mlp.up_proj` puede degradar la calidad respecto al checkpoint original; el autor no publica metricas de perdida de rendimiento.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Dependencia estricta del runtime LiteRT-LM con soporte de grafos, pesos INT2 por bloques y las funciones solicitadas; versiones anteriores pueden fallar.
- Solo validado en un dispositivo concreto (Galaxy S22 Ultra); el rendimiento en otros SoC Android es desconocido.
- El backend de vision puede requerir CPU, con mayor latencia que el backend GPU.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de Gemma 4 de Google; conviene verificar las condiciones de uso comercial del modelo base original antes de desplegarlo en productos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/RoundRobin237/Gemma4-E4B-it-ultra-uncensored-heretic-GSQ-RCO-LiteRT_LM)
- [Checkpoint base Heretic (llmfan46)](https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic/tree/794492d6512b6e0914792c4e6487f8d7d41ac974)
- [Checkpoint de referencia Google Gemma 4 E4B IT](https://huggingface.co/google/gemma-4-E4B-it/tree/4ecc2ba63bcac23ba4a767fc87025b1450f84c9c)
- [Plantilla LiteRT Community Gemma 4 E4B IT](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/tree/f254b5ba6e36f7d89cc7892e268e9877bc20f0a0)
- [Runtime LiteRT-LM (GitHub)](https://github.com/google-ai-edge/LiteRT-LM)
- [Paper GSQ (arXiv:2604.18556)](https://arxiv.org/abs/2604.18556)
- [Paper RCO (arXiv:2605.00649)](https://arxiv.org/abs/2605.00649)
