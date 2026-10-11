# darkmaniac7/Qwen3.5-4B-MNN

## Resumen

Qwen3.5-4B-MNN es un paquete de pesos en formato MNN publicado por el usuario darkmaniac7 para ejecutar el modelo Qwen3.5-4B en dispositivos moviles y entornos de borde (on-device) sin GPU dedicada. El repositorio es un espejo byte a byte de taobao-mnn/Qwen3.5-4B-MNN en el commit `aa966261175a532d9906fa165c9d506d617320a9`: cada fichero del tronco conserva el mismo sha256 que el original, y la conversion a MNN es obra del equipo taobao-mnn. Sobre ese tronco sin modificar, el autor anade una cabeza opcional de prediccion multi-token (MTP) que actua como modelo borrador para decodificacion especulativa.

El modelo base es Qwen/Qwen3.5-4B, de aproximadamente 4.000 millones de parametros, redistribuido bajo licencia Apache-2.0. El repositorio ocupa 3,0 GB e incluye el peso cuantizado del tronco (2,63 GB), un componente de vision (`visual.mnn.weight`, 196,8 MB) y la cabeza MTP (128,3 MB de pesos mas un vocabulario borrador de 32.000 tokens). La longitud de contexto, los idiomas soportados y el detalle de la arquitectura no se especifican en la informacion disponible.

Su relevancia es practica: permite desplegar un modelo de 4B en telefonos con aceleracion por CPU a traves del runtime MNN y mejorar la velocidad de decodificacion entre un 27 % y un 79 % (segun el SoC) mediante decodificacion especulativa, manteniendo la calidad de salida del tronco porque este verifica cada token propuesto por la cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-4B) |
| Parametros totales | ~4B (nominal, segun el nombre del modelo base; no confirmado en la ficha) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cabeza MTP: 4 bits con bloque de 64 (`--quant_bit 4 --quant_block 64`). Tronco: no disponible (peso de 2,63 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.json`, `llm.mnn.weight`, `visual.mnn`, `visual.mnn.weight`, `mtp-v32k.mnn`, `mtp-v32k.mnn.weight`, `mtp-v32k.mnn.vocab`, `tokenizer.txt`) |

Otros datos del repositorio: tamano total 3,0 GB; fichero de pesos del tronco `llm.mnn.weight` de 2.629.387.626 bytes; submodelo de vision de 196.768.960 bytes; cabecera `llm.mnn` de 3.651.096 bytes; `llm.mnn.json` de 9.172.204 bytes; `tokenizer.txt` de 6.465.727 bytes; creado el 2026-10-10; 0 descargas y 0 likes en el momento de redactar esta ficha.

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del tronco (tipo de transformer, atencion, capas, uso de atencion lineal o hibrida) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, etapas de RLHF o DPO). Lo unico verificable es que se trata de una conversion a MNN del modelo Qwen/Qwen3.5-4B realizada por el equipo taobao-mnn, sin modificacion alguna del tronco: los ficheros `config.json`, `export_args.json`, `llm.mnn`, `llm.mnn.json`, `llm.mnn.weight`, `llm_config.json`, `tokenizer.txt`, `visual.mnn` y `visual.mnn.weight` presentan los mismos tamanos y hashes que el repositorio original.

La innovacion tecnica anadida por este espejo es la cabeza de prediccion multi-token (MTP). Se exporto desde Qwen/Qwen3.5-4B en el commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` con la herramienta MNN-TokForge (`llmexport --mtp --mtp_only --quant_bit 4 --quant_block 64`) y utiliza un vocabulario borrador de 32.000 entradas (`mtp-v32k.mnn.vocab`, identificadores de token int32). Se carga con los parametros `speculative_type: "mtp"`, `mtp_model: "mtp-v32k.mnn"` y `draft_predict_length: 1`. El tronco verifica cada token propuesto por el borrador, por lo que la calidad de la salida final es la del tronco y no la de la cabeza MTP.

## Capacidades

- Generacion de texto autorregresiva en formato MNN, heredada del modelo base Qwen/Qwen3.5-4B.
- Decodificacion especulativa opcional mediante cabeza MTP con profundidad 1 (`draft_predict_length: 1`), verificada por el tronco.
- Componente de vision incluido en el repositorio (`visual.mnn`, `visual.mnn.weight`, 196,8 MB), lo que indica soporte multimodal, aunque la model card no detalla su alcance ni su uso.
- Inferencia en CPU de dispositivos moviles a traves del runtime MNN (ruta MNN CPU, 4 hilos en las mediciones publicadas).
- Integracion con TokForge para acelerar las respuestas en la ruta MNN CPU.
- Soporte de tool calling, function calling, modo de razonamiento explicito (thinking), agentes multi-paso o capacidades de audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes moviles sin conexion: el paquete MNN permite ejecutar un modelo de 4B en el propio telefono mediante CPU, de modo que el asistente funciona sin red y sin enviar datos del usuario a un servidor.
- Aplicaciones Android o iOS con MNN: el runtime MNN esta pensado para integrarse en apps nativas, y el repositorio ya incluye configuracion y tokenizador listos para cargar (`llm_config.json`, `tokenizer.txt`).
- Respuestas de baja latencia en movil: activando la cabeza MTP con `speculative_type: "mtp"`, `draft_predict_length: 1` y 4 hilos, las mediciones del autor reportan entre un 27 % y un 79 % mas de velocidad de decodificacion en Snapdragon SM8850, entre un 30 % y un 58 % en SM8650 y entre un 30 % y un 77 % en Tensor G4.
- Procesamiento de documentos en el dispositivo: con 2,63 GB de pesos es viable mantener el tronco residente en memoria en telefonos de gama alta o en mini-PC, y usarlo para resumir, clasificar o extraer informacion de textos locales.
- Vision embebida: el submodelo de vision incluido abre la puerta a tareas de descripcion o etiquetado de imagenes en el dispositivo, siempre que se valide su interfaz concreta contra el runtime MNN.
- Aplicaciones con requisitos de privacidad o cumplimiento (sanidad, legal, industria): al ejecutarse en local no hay transferencia de datos a terceros, lo que simplifica el analisis de riesgos de RGPD.
- Kioscos, terminales punto de venta y dispositivos IoT con CPU ARM: al no requerir GPU, el modelo puede desplegarse en hardware de bajo consumo con suficiente RAM.
- Investigacion en decodificacion especulativa: la cabeza MTP con vocabulario borrador de 32k y verificacion por parte del tronco es un caso reproducible para medir el equilibrio entre velocidad y fidelidad en dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son medidas de velocidad de decodificacion en moviles, comparando decodificacion normal frente a decodificacion con cabeza MTP (ruta MNN CPU, 4 hilos, profundidad 1, mejor de 3 ejecuciones, greedy y T=0,7):

| Plataforma | Mejora de velocidad de decodificacion |
|---|---|
| Snapdragon SM8850 | +27 % a +79 % |
| Snapdragon SM8650 | +30 % a +58 % |
| Google Tensor G4 | +30 % a +77 % |

No se indican valores absolutos de tokens por segundo, latencia por token ni consumo energetico.

## Requisitos de hardware

- Peso del tronco: 2,63 GB (`llm.mnn.weight`); submodelo de vision: 196,8 MB; cabeza MTP: 128,3 MB (pesos) mas 132 KB de vocabulario. Tamano total del repositorio: 3,0 GB.
- Memoria estimada para inferencia en la ruta cuantizada: del orden de 3 GB solo para pesos, a los que hay que sumar la cache KV (dependiente de la longitud de contexto, no disponible) y el consumo del runtime. Se recomienda disponer de al menos 6-8 GB de RAM libre en el dispositivo.
- GPU recomendadas: no aplica en el escenario objetivo; el paquete esta pensado para CPU de movil y de borde. El uso con GPU no esta documentado en la informacion disponible.
- Compatibilidad con GPU de consumo: el tamano de pesos permitiria cargarlo en GPUs con 4 GB o mas de VRAM si el runtime MNN lo soportase, pero esto no esta confirmado en la informacion proporcionada.
- Plataformas validadas en las mediciones: Snapdragon SM8850, Snapdragon SM8650 y Google Tensor G4, con 4 hilos de CPU.
- Opciones de despliegue: runtime MNN (formato nativo del repositorio) y TokForge para la ruta con cabeza MTP. No se proporcionan pesos GGUF ni safetensors, por lo que vLLM, llama.cpp, Ollama o TGI no son utilizables directamente con estos ficheros.
- Latencia y throughput absolutos: no disponible. Solo se publican mejoras relativas de velocidad de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Decodificacion especulativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| darkmaniac7/Qwen3.5-4B-MNN | ~4B | MNN | no disponible | Si: cabeza MTP opcional con vocabulario borrador de 32k | Apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| taobao-mnn/Qwen3.5-4B-MNN | ~4B | MNN | no disponible | No incluida (tronco identico byte a byte) | Apache-2.0 | HuggingFace (repositorio de origen) |
| Qwen/Qwen3.5-4B | ~4B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (modelo base) |

La diferencia funcional entre el primer y el segundo modelo es exclusivamente la cabeza MTP: el tronco es identico (mismos sha256), de modo que cualquier mejora de calidad o de contexto debe atribuirse al modelo base y no a este espejo.

## Limitaciones y advertencias

- El repositorio no incluye ninguna evaluacion de calidad, sesgo o seguridad; se desconoce el comportamiento real del modelo en tareas de produccion.
- No se especifican idiomas soportados, longitud de contexto ni detalles de arquitectura, lo que dificulta planificar el despliegue y estimar la memoria de la cache KV.
- El riesgo de alucinacion es el heredado del modelo base Qwen3.5-4B, sobre el que no se aporta informacion adicional en esta ficha.
- Los pesos estan en formato MNN exclusivamente: no hay safetensors ni GGUF, por lo que no se pueden cargar con transformers, vLLM, llama.cpp, Ollama o TGI sin una conversion previa.
- El rendimiento depende del runtime MNN y de la version concreta del mismo; las mejoras de velocidad publicadas se midieron en tres SoC concretos y no son extrapolables sin verificar.
- La cabeza MTP tiene un vocabulario borrador de 32.000 tokens y profundidad 1; su ganancia puede variar con el tipo de texto y con la temperatura de muestreo.
- El repositorio no lo mantiene el equipo de Qwen ni el de taobao-mnn: es un espejo de un tercero con 0 descargas y 0 likes, sin historial de mantenimiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion al equipo taobao-mnn (conversion a MNN) y al equipo Qwen (modelo base), tal como indica la propia model card.
- El componente de vision no viene acompanado de instrucciones de uso, por lo que su funcionamiento no debe darse por supuesto sin probarlo.
- El commit del tronco esta fijado (`aa966261175a532d9906fa165c9d506d617320a9`); cualquier actualizacion en el repositorio de origen no se reflejara automaticamente en este espejo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/darkmaniac7/Qwen3.5-4B-MNN
- Repositorio de origen (taobao-mnn): https://huggingface.co/taobao-mnn/Qwen3.5-4B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del tronco espejado: `aa966261175a532d9906fa165c9d506d617320a9`
- Commit del modelo base usado para exportar la cabeza MTP: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (papers, blogs, demos o repositorios adicionales): no disponible.
