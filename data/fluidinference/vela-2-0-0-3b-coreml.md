# FluidInference/vela-2.0-0.3b-coreml

## Resumen

Vela 2.0 0.3B Core ML es la conversion a Core ML del modelo `vllm-sr/Vela-2.0-0.3B`, desarrollado conjuntamente por vLLM Semantic Router y KR Labs, y publicada por FluidInference. No es un modelo generativo: es un encoder de tipo ModernBERT de 0,3 mil millones de parametros que resuelve tareas de decision y seguridad en una sola pasada, devolviendo etiquetas de eleccion (choice) y conjuntos de spans de texto. Su proposito es actuar como componente de enrutado y guardrail dentro de pipelines de LLM, tomando decisiones de routing, detectando ataques de prompt y peticiones daninas, y extrayendo spans de informacion personal (PII) o de afirmaciones no respaldadas por una fuente.

La relevancia de esta entrega concreta esta en el empaquetado para Apple silicon: el encoder se distribuye como `Vela2Encoder.mlpackage` en fp16 (592 MB) con cuatro funciones de longitud de encoder (L128, L256, L512 y L1024), acompanadas de cabezas de lectura en fp32, tokenizer y ficheros de calibracion. El runtime Swift (`Vela2Manager`, en el repositorio FluidUse) reproduce el motor original de PyTorch con fidelidad verificada y ejecuta en el Neural Engine o en la GPU segun la longitud de la peticion.

El interes practico es la latencia y la privacidad: frente a los aproximadamente 165 ms de la version PyTorch sobre CPU en un MacBook Pro M5 Pro para una peticion de cuatro preguntas, la version Core ML resuelve un cribado de ataque y dano sobre un mensaje corto en unos 3,5 ms en el Neural Engine, y un guardrail completo (routing, ataque, dano, fact-check y 17 etiquetas de PII) en unos 17 ms en la GPU. Todo el procesamiento ocurre en el dispositivo, sin enviar datos a un servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (modelo base `vllm-sr/Vela-2.0-0.3B`), convertido a Core ML |
| Parametros totales | 0,3 mil millones (aproximadamente; el paquete fp16 ocupa 592 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no es un modelo generativo; encoder con funciones de 128, 256, 512 y 1024 tokens (`L128`, `L256`, `L512`, `L1024`) |
| Tipos de cuantizacion | fp16 para el encoder (`Vela2Encoder.mlpackage`); cabezas de lectura en fp32 (`heads.bin`) |
| Idiomas soportados | no se publica una lista oficial; las pruebas de fidelidad cubren ingles, aleman, frances, espanol, chino, japones, hindi y arabe, ademas de URL y direcciones de correo |
| Licencia | Apache-2.0 para los pesos del encoder y la lectura; el tokenizer es material de origen Gemma y queda sujeto a los Gemma Terms of Use y a la Prohibited Use Policy |
| Formato de pesos | Core ML `.mlpackage` (fp16) + `heads.bin` (fp32), `tokenizer.json`, `calibration.json`, `coreml_config.json` |

## Arquitectura y entrenamiento

El modelo base es `vllm-sr/Vela-2.0-0.3B`, un encoder ModernBERT de 0,3B parametros concebido para tomar decisiones de forma directa en lugar de generar texto. La conversion a Core ML no reentrena el modelo: exporta el encoder a `.mlpackage` en fp16 y mantiene las cabezas de lectura fuera del grafo, en `heads.bin` en fp32, de modo que el runtime Swift se encarga del tokenizer, el ensamblado de la pregunta, la aplicacion de las cabezas, la calibracion y el decodificador de spans. La model card del autor no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo etapas de RLHF o DPO; esos datos figuran en la ficha del modelo base, no en esta conversion.

La innovacion tecnica de esta entrega es el reparto de computo entre Neural Engine y GPU segun la longitud de la secuencia. El 99,4 % de las operaciones del encoder se colocan en el Neural Engine (unicamente la busqueda de embeddings queda fuera), pero el Neural Engine solo es mas rapido hasta 128 tokens, por lo que el runtime lo usa para `L128` y conmuta a la GPU para `L256`, `L512` y `L1024`. Las longitudes de secuencia cuentan tambien el esquema de la pregunta: un cribado de ataque mas dano ocupa unos 92 tokens de esquema, mientras que un guardrail completo con routing, ataque, dano, fact-check y 17 etiquetas de PII ronda los 535 tokens de esquema y se ejecuta en `L1024`.

## Capacidades

- Decision de routing: clasifica una peticion para dirigirla al modelo o ruta adecuada dentro de un enrutador semantico de LLM.
- Deteccion de ataques de prompt (prompt attack): cribado de intentos de inyeccion o manipulacion.
- Deteccion de peticiones daninas (harmful request): cribado de contenido o solicitudes que violan politicas.
- Deteccion de informacion personal (PII): extraccion de spans con hasta 17 etiquetas de PII en una misma pasada.
- Deteccion de alucinaciones / fact-check: identificacion de afirmaciones no respaldadas por una fuente proporcionada, devueltas como spans de texto.
- Salida en dos formatos: respuestas de eleccion (choice) y conjuntos de spans, sobre el mismo encoder.
- Multilingue: las pruebas de fidelidad del autor incluyen peticiones en ingles, aleman, frances, espanol, chino, japones, hindi y arabe, ademas de URL y correos electronicos.
- Ejecucion en dispositivo sobre Apple silicon (Neural Engine o GPU), sin llamadas de red.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso en el sentido de un LLM, y no tiene modo thinking.

## Casos de uso

- Enrutado semantico en pasarelas de LLM: colocar el encoder delante del modelo generativo para decidir a que modelo o ruta enviar cada peticion, con latencias de milisegundos que no penalizan el tiempo total de respuesta.
- Guardrail de seguridad en produccion: combinar en una sola pasada el cribado de ataque de prompt y de peticion danina antes de que la peticion llegue al LLM, ejecutandose en unos 3,5 ms para mensajes cortos sobre el Neural Engine.
- Redaccion de PII antes de enviar datos a un tercero: extraer spans de informacion personal (17 etiquetas) en local y enmascararlos o anonimizarlos, de modo que los datos sensibles no salgan del dispositivo o del perimetro corporativo.
- Verificacion de respuestas en pipelines RAG: comparar la respuesta generada con las fuentes recuperadas y marcar los spans de afirmaciones no respaldadas para activar una revision o regeneracion.
- Aplicaciones iOS y macOS con contenido generado por usuarios: integrar el guardrail en apps que requieren iOS 18+ o macOS 15+ para moderar texto sin coste de servidor ni subida de datos.
- Auditoria por lotes de registros: procesar historicos de conversaciones en local para etiquetar incidencias de seguridad, PII o afirmaciones sin respaldo, con el coste de infraestructura reducido al propio equipo Apple.
- Preprocesado con privacidad por diseno: en dominios regulados (sanidad, legal, finanzas), mantener el texto del usuario en el dispositivo durante la fase de clasificacion y enviar al modelo generativo solo el contenido ya filtrado.
- Clasificacion de bajo coste en portatiles de desarrollo: sustituir llamadas a APIs de moderacion en pruebas y entornos de integracion continua sobre runners macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; al tratarse de un encoder de decision y no de un modelo generativo, esas metricas no aplican. El autor si publica datos de fidelidad y de velocidad.

Fidelidad declarada por el autor:

| Prueba | Resultado |
|---|---|
| Reproduccion del motor de la release (`vela2_inference.py`) con el runtime Swift, 38 peticiones (PII, prompt attack, harm, routing, hallucination; varios idiomas, URL y correos) | 0 discrepancias de token, 0 de 120 respuestas de eleccion, 0 de 38 conjuntos de spans distintos |
| Encoder Core ML frente a la release PyTorch, 8 peticiones variadas | Elecciones y conjuntos de spans identicos; probabilidades dentro de 0,003 (GPU y Neural Engine) |

Velocidad en MacBook Pro M5 Pro (milisegundos por funcion de encoder):

| Funcion | GPU | Neural Engine |
|---|---:|---:|
| L128 | 4,4 ms | 3,5 ms |
| L256 | 5,0 ms | 9,0 ms |
| L512 | 8,3 ms | 25,1 ms |
| L1024 | 16,5 ms | 73,5 ms |

Referencias de extremo a extremo aportadas por el autor: un cribado de ataque mas dano sobre un mensaje corto se ejecuta en el Neural Engine en aproximadamente 3,5 ms; un guardrail completo con 17 etiquetas de PII se ejecuta en `L1024` sobre la GPU en aproximadamente 17 ms; el runtime PyTorch de la release sobre CPU del mismo equipo tarda unos 165 ms en una peticion de cuatro preguntas.

## Requisitos de hardware

- Plataforma: exclusivamente Apple silicon. Requiere macOS 15 o superior, o iOS 18 o superior. No hay soporte para CUDA ni para aceleradores de otros fabricantes.
- Huella del modelo: `Vela2Encoder.mlpackage` en fp16 ocupa 592 MB, a lo que se suman `heads.bin` en fp32, el tokenizer y los ficheros de configuracion y calibracion.
- Memoria: el tamano del paquete (0,6 GB de repositorio) da una cota inferior orientativa; el consumo en tiempo de ejecucion depende del backend (Neural Engine o GPU) y no se publica una cifra de VRAM o memoria unificada concreta.
- GPU recomendadas: no aplica el catalogo habitual (A100, H100, RTX 4090); el modelo esta pensado para la GPU integrada y el Neural Engine de los chips Apple. El autor reporta medidas sobre un M5 Pro.
- Cabe en hardware de consumo: si, en cualquier Mac o dispositivo iOS compatible con Apple silicon; no esta pensado para GPU de escritorio NVIDIA o AMD.
- Opciones de despliegue: Core ML a traves del runtime Swift `Vela2Manager` del repositorio FluidUse. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; el modelo base PyTorch si puede servir como referencia de paridad fuera de Apple.
- Latencia: entre 3,5 ms (L128 en Neural Engine) y 73,5 ms (L1024 en Neural Engine); en GPU, de 4,4 ms (L128) a 16,5 ms (L1024). El autor indica que el Neural Engine solo es mas rapido hasta 128 tokens.
- Throughput: no disponible. El autor no publica cifras de peticiones por segundo ni de procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / secuencia | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/vela-2.0-0.3b-coreml | 0,3B (encoder) | funciones de 128 a 1024 tokens | ~3,5 ms (L128, ANE) a ~17 ms (L1024, GPU) por guardrail completo en M5 Pro | Apache-2.0 para pesos; tokenizer bajo Gemma Terms of Use | Core ML, macOS 15+ / iOS 18+ |
| vllm-sr/Vela-2.0-0.3B (modelo base) | 0,3B (encoder) | no disponible en la informacion proporcionada | ~165 ms en CPU de M5 Pro para una peticion de 4 preguntas | no disponible en la informacion proporcionada | PyTorch |
| Otras alternativas de la misma categoria (clasificadores de guardrail o enrutado on-device) | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables; los unicos enlaces recuperados eran contenido no relacionado con la ficha.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no mantiene conversaciones y no soporta tool calling ni agentes; cualquier uso de ese tipo es un error de planteamiento.
- Especifico de Apple silicon: no se puede desplegar en servidores con GPU NVIDIA o AMD ni mediante los runners habituales de inferencia (vLLM, llama.cpp, TGI, Ollama).
- Requisitos de sistema estrictos: macOS 15+ o iOS 18+. No funciona en versiones anteriores.
- Licencia del tokenizer: aunque los pesos del encoder y la lectura son Apache-2.0, el tokenizer es material de origen Gemma y sigue sujeto a los Gemma Terms of Use y a la Prohibited Use Policy. El uso o la redistribucion implican aceptar esos terminos, lo que conviene revisar antes de un despliegue comercial.
- Riesgo de alucinacion: al ser un encoder clasificador, no alucina texto, pero si puede producir falsos positivos y falsos negativos en la deteccion de PII, ataques de prompt y afirmaciones sin respaldo. No se publican tasas de precision o recall, solo pruebas de fidelidad frente al motor original.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad en la informacion disponible.
- Cobertura idiomatica: no hay una lista oficial de idiomas soportados; la cobertura multilingue se infiere de las pruebas de fidelidad (ingles, aleman, frances, espanol, chino, japones, hindi, arabe) y no de una evaluacion sistematica por idioma.
- Limite de secuencia: la funcion mas larga es de 1024 tokens, contando el esquema de la pregunta (un guardrail completo consume unos 535 tokens de esquema), lo que reduce el texto util disponible para mensajes largos.
- Rendimiento dependiente del backend: el Neural Engine pierde ventaja a partir de 256 tokens, por lo que el comportamiento en latencia depende de la conmutacion automatica entre Neural Engine y GPU que implementa el runtime.
- Adopcion muy baja: el repositorio registra 14 descargas y 11 likes en el momento de la consulta, por lo que la validacion por parte de terceros es practicamente inexistente.
- Antes de produccion conviene reproducir los scripts de paridad incluidos en `conversion/` y revisar `MODIFICATIONS.md`, `LICENSING_STATUS.md` y `DISTRIBUTION_TERMS.md`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/vela-2.0-0.3b-coreml
- Modelo base: https://huggingface.co/vllm-sr/Vela-2.0-0.3B
- Runtime Swift (Vela2Manager y FluidUse): https://github.com/FluidInference/FluidUse
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio resultados relacionados con el modelo).
