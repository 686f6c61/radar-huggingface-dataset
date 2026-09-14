# arsis-dev/ukisai-Swift-Qwen3.8-27b-MTPLX

## Resumen

`arsis-dev/ukisai-Swift-Qwen3.8-27b-MTPLX` es una conversion cuantizada del checkpoint `ukisai/Swift-Qwen3.8-27b` (27.356.723.952 parametros) al runtime MTPLX/MLX, pensada para inferencia local rapida en Apple Silicon. No se trata de un fine-tune nuevo ni de un modelo entrenado desde cero: es un artefacto de ejecucion generado con MTPLX Forge 2.11.2 que conserva la arquitectura y los pesos del modelo original, pero reduce el cuerpo del modelo a 4 bits afines con group size 64 y mantiene la cabeza MTP nativa en BF16.

El interes tecnico del artefacto esta en la decodificacion autospeculativa. Swift conserva la cabeza de prediccion multi-token (MTP) de su arquitectura Qwen3.8, y MTPLX la reutiliza como drafter propio: se proponen tokens candidatos que el modelo objetivo verifica. En una maquina de prueba Apple M5 Max con 128 GB de memoria unificada, esto eleva el throughput de decodificacion de 29,4 tok/s en modo autoregresivo a 65,2 tok/s con profundidad MTP D3, un 2,22x, con una tasa media de aceptacion del 93 %.

Es relevante ahora porque permite ejecutar un modelo multimodal de ~27 B en un portatil o equipo de sobremesa con chip de Apple, sin GPU dedicada, con un tamano de artefacto publicado de aproximadamente 16,9 GB y una API local compatible con OpenAI. La contrapartida es que las cifras publicadas miden unicamente velocidad de decodificacion de texto: no hay evaluaciones de calidad frente al checkpoint BF16 original ni benchmarks de capacidad multimodal en esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza nativa de prediccion multi-token (MTP); numero de capas y detalles internos no disponibles |
| Parametros totales | 27.356.723.952 (~27,36 B), dato real de safetensors |
| Parametros activos | No aplica: no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuerpo en 4-bit affine con group size 64; cabeza MTP en BF16; pesos de vision preservados sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (etiquetada como `other` en HuggingFace); heredada del checkpoint original |
| Formato de pesos | safetensors para runtime MLX (`model-00001-of-00003.safetensors`, `model-00002-of-00003.safetensors`, `model-00003-of-00003.safetensors`, `model-vision.safetensors`, `mtp.safetensors`) |
| Runtime | MTPLX / MLX (exclusivo de Apple Silicon) |
| Tamano del repositorio | ~16,9 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | ukisai/Swift-Qwen3.8-27b (revision 1b30aaaf753fe5c1cb51ada2ea0367a53445359c) |
| Herramienta de conversion | MTPLX Forge 2.11.2 |
| Profundidad MTP maxima | D3 |

## Arquitectura y entrenamiento

El artefacto no aporta entrenamiento propio: la model card indica explicitamente que es una conversion de runtime cuantizada y que no altera el entrenamiento realizado por UkisAI. Por tanto, la composicion del dataset, el numero de tokens vistos y las fases de alineacion (RLHF, DPO u otras) del modelo base no se detallan en la informacion disponible. Swift-Qwen3.8-27B se describe como un derivado de Qwen3.8-27B orientado a "thinking eficiente", desarrollado por UkisAI, con torre de vision y cabeza MTP nativa.

La innovacion tecnica del artefacto esta en la receta de cuantizacion y en el uso de la MTP como drafter autospeculativo. El cuerpo se cuantiza a 4-bit affine con group size 64, mientras que la cabeza MTP se mantiene deliberadamente en BF16 para no degradar la calidad de las propuestas; las compuertas de vision se conservan en `model-vision.safetensors`. En tiempo de ejecucion, MTPLX genera varios tokens candidatos por paso (profundidades D1, D2 y D3) y el modelo objetivo los verifica, lo que reduce el numero de pasos de decodificacion necesarios. La verificacion de Forge reporto comprobaciones de calidad correctas para AR, D1, D2 y D3, aunque el alcance declarado de esas comprobaciones no se especifica.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla propia (`chat_template.jinja`).
- Entrada multimodal de imagen y texto (`image-text-to-text`), con los pesos de vision incluidos en el artefacto.
- Decodificacion autospeculativa mediante la cabeza MTP, con profundidades seleccionables D1, D2 y D3.
- Modo "thinking" eficiente heredado de la familia Swift-Qwen3.8, segun la descripcion del modelo base.
- Servicio local mediante API compatible con OpenAI (`mtplx serve --port 8000`), utilizable por clientes que hablen chat completions.
- Inspeccion y ajuste del checkpoint desde la propia herramienta (`mtplx inspect`, `mtplx tune --retune`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible; la model card no declara lista de idiomas.

## Casos de uso

- Asistente conversacional local en un Mac: el modelo se ejecuta sobre MLX en Apple Silicon y expone una API compatible con OpenAI en `127.0.0.1:8000`, de modo que se puede conectar a cualquier cliente de chat sin salir del equipo ni enviar datos a terceros.
- Analisis de documentos con imagenes en escritorio: al conservar la torre de vision, permite flujos de image-text-to-text (capturas, diagramas, documentos escaneados) integrados en aplicaciones nativas de macOS mediante el runtime MTPLX.
- Prototipado de agentes antes de pasar a produccion: la API local compatible con OpenAI permite sustituir el endpoint por el de un proveedor cloud sin reescribir el cliente, lo que facilita comparar comportamiento y coste.
- Generacion de texto de alto throughput en un solo equipo: con MTP D3 el autor mide 65,2 tok/s frente a 29,4 tok/s en modo autoregresivo sobre M5 Max, un 2,22x que reduce el tiempo de respuesta en tareas de generacion larga.
- Investigacion sobre decodificacion especulativa: al publicarse `mtplx_runtime.json` con la procedencia de Forge y los resultados de verificacion locales, sirve como material reproducible para estudiar tasas de aceptacion y profundidades optimas de MTP.
- Evaluacion de cuantizacion 4-bit frente a BF16: el checkpoint base esta disponible por separado, de modo que se puede medir la degradacion introducida por el cuerpo en 4-bit affine g64 manteniendo la cabeza MTP intacta.
- Despliegue en entornos con requisitos de residencia de datos: al ser inferencia 100 % local, encaja en escenarios donde el texto no puede salir del dispositivo del usuario.
- Pruebas de rendimiento comparadas por hardware: el comando `mtplx tune --retune` permite medir AR frente a D1/D2/D3 en cada generacion de Apple Silicon, util para dimensionar equipos antes de comprarlos.

## Benchmarks y rendimiento

La model card solo publica mediciones de throughput de decodificacion de texto, realizadas en un Apple M5 Max con 128 GB de memoria unificada y con el sampler `temperature = 1.0`, `top_p = 0.95`, `top_k = 20`. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Modo | Aceptacion media MTP | Velocidad de decodificacion | Aceleracion vs AR |
|---|---:|---:|---:|
| AR baseline | — | 29,4 tok/s | 1,00x |
| MTP D1 | 96 % | 46,5 tok/s | 1,58x |
| MTP D2 | 98 % | 61,9 tok/s | 2,11x |
| MTP D3 (recomendado) | 93 % | 65,2 tok/s | 2,22x |

El propio autor acota el alcance de estos numeros: miden el throughput de decodificacion de esta conversion MTPLX y no deben interpretarse como un benchmark de tarea Swift frente a Qwen3.8, ni como una comparacion de calidad contra el checkpoint BF16, ni como una garantia de que todo prompt decodifique a 65,2 tok/s. El rendimiento real depende de la longitud del prompt, el tamano de contexto, la longitud de generacion, los parametros de muestreo, las condiciones termicas y la carga de trabajo. La calidad multimodal y el throughput de procesamiento de imagenes no han sido evaluados de forma independiente para esta release.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. El artefacto es una conversion MTPLX/MLX y no incluye pesos GGUF ni safetensors para CUDA.
- Espacio en disco y memoria para pesos: el repositorio publicado ocupa ~16,9 GB, de los cuales el cuerpo esta en 4-bit y la cabeza MTP en BF16.
- Memoria unificada: la configuracion de referencia probada por el autor es un Apple M5 Max con 128 GB. El minimo oficial no esta declarado; a partir del tamano del artefacto, 32 GB de memoria unificada es un punto de partida razonable, aunque no confirmado por el autor.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto, que depende de MLX.
- Despliegue: `mtplx` instalado via Homebrew (`brew install youssofal/mtplx/mtplx`), con `mtplx pull`, `mtplx start`, `mtplx inspect` y `mtplx serve --port 8000` para exponer una API compatible con OpenAI.
- Ajuste por maquina: `mtplx tune --model ... --retune` para medir AR frente a D1/D2/D3; el autor advierte que D3 no tiene por que ser optimo en todos los Mac.
- Latencia y throughput medidos: 29,4 tok/s en AR y 65,2 tok/s en MTP D3 sobre M5 Max de 128 GB. No hay datos para otros chips (M1, M2, M3, M4) ni para memoria unificada inferior.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a alternativas de la misma categoria en la informacion proporcionada. La unica comparacion documentada es interna, entre modos de decodificacion del propio artefacto.

| Modelo | Parametros | Cuantizacion | Contexto | Throughput declarado | Licencia |
|---|---|---|---|---|---|
| ukisai-Swift-Qwen3.8-27b-MTPLX | 27,36 B | 4-bit affine g64 + MTP BF16 | no disponible | 65,2 tok/s (MTP D3, M5 Max) | Swift Open License v1.0 |
| ukisai/Swift-Qwen3.8-27b (base, BF16) | no disponible en la informacion | BF16 | no disponible | no disponible | Swift Open License v1.0 |
| Otras conversiones MLX de ~27 B | no disponibles | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversion de runtime. Cualquier limitacion de arquitectura, sesgo o calidad del checkpoint `ukisai/Swift-Qwen3.8-27b` se hereda integra.
- La cuantizacion a 4-bit affine con group size 64 puede degradar la calidad respecto al BF16 original; la model card no publica ninguna comparacion de calidad que lo cuantifique.
- La licencia es `Swift Open License v1.0`, marcada como `other` en HuggingFace. Antes de usar el modelo en produccion o redistribuirlo hay que revisar la seccion "License and access" del repositorio original, que puede imponer restricciones de uso comercial o de acceso.
- Exclusividad de plataforma: sin CUDA, sin GGUF y sin soporte para x86. No se puede desplegar en servidores con GPU NVIDIA ni en entornos Linux convencionales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como en cualquier modelo generativo, la salida debe validarse en aplicaciones criticas.
- Idiomas soportados: no declarados. No se debe asumir un rendimiento multilingue equivalente sin evaluacion propia.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con documentos largos o conversaciones multi-turno extensas.
- El throughput optimo depende de la maquina: el autor indica explicitamente que la profundidad MTP optima varia con la generacion de Apple Silicon, el ancho de banda de memoria, el estado termico y la carga de trabajo.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no documentadas en esta ficha de modelo.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas de integracion esten ya resueltos por la comunidad.
- El artefacto conserva la torre de vision, pero no se ha evaluado de forma independiente la calidad multimodal de esta conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arsis-dev/ukisai-Swift-Qwen3.8-27b-MTPLX
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base (seccion "License and access"): https://huggingface.co/ukisai/Swift-Qwen3.8-27b#license-and-access
- Repositorio del modelo base (revision usada por Forge): 1b30aaaf753fe5c1cb51ada2ea0367a53445359c
- Herramienta MTPLX (instalacion via Homebrew): `brew install youssofal/mtplx/mtplx`
- Documentacion de procedencia y verificacion: `mtplx_runtime.json` incluido en el repositorio del modelo
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o el runtime MTPLX; los unicos resultados obtenidos corresponden a manuales de bombas centrifugas GEA Hilge TP 3050 y no guardan relacion con el contenido de esta ficha.
