# ggml-org/MiMo-V2.6-Flash-RL-GGUF

## Resumen

MiMo-V2.6-Flash-RL-GGUF es la distribucion en formato GGUF del modelo multimodal XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por ggml-org (el equipo detras de llama.cpp) el 22 de septiembre de 2026. El modelo original forma parte de la serie MiMo-V2.6 de Xiaomi, presentada como una familia de modelos nativamente omnimodales (texto, imagen y audio) entrenada con aprendizaje por refuerzo sobre tareas verificables y complejas, dentro de la linea de investigacion que Xiaomi denomina RSI (escalado de computo de RL para ampliar la frontera de capacidades mediante exploracion y retroalimentacion).

El modelo subyacente tiene 308.778.780.864 parametros (unos 308,8 mil millones), segun los datos de safetensors del repositorio, y emplea una arquitectura con expertos enrutados (MoE) y cabezas de prediccion multi-token (MTP). Esta distribucion GGUF anade, ademas de los pesos cuantizados, sidecars especificos para decodificacion especulativa (MTP en Q4_0 y Q8_0, y un drafter DFlash en BF16 y Q8_0) y un proyector multimodal mmproj en Q8_0 que da soporte a los codificadores de vision y audio.

Su relevancia practica es doble: por un lado, traslada un modelo omnimodal de gran escala al ecosistema llama.cpp, lo que permite ejecutarlo localmente con cuantizaciones agresivas (MXFP4 y Q2_K); por otro, incluye todas las piezas necesarias para acelerar la inferencia con decodificacion especulativa sin depender de infraestructura propietaria. La licencia MIT facilita su uso comercial, aunque el coste de hardware sigue siendo elevado por el tamano del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y cabezas de prediccion multi-token (MTP); multimodal (texto, imagen y audio) |
| Parametros totales | 308.778.780.864 (~308,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados en MXFP4 nativo), Q2_K (proyecciones down de expertos en MXFP4 y proyecciones gate/up en Q2_K); sidecars MTP en Q4_0 y Q8_0; drafter DFlash en BF16 y Q8_0; mmproj en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (multifragmento; MXFP4 dividido en 2 ficheros) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE): el propio autor de la conversion senala que las cuantizaciones preservan los "routed experts" (expertos enrutados) y sus proyecciones, lo que confirma el uso de enrutamiento disperso por tokens. Ademas, incorpora cabezas MTP (multi-token prediction) entrenadas para predecir varios tokens futuros, que aqui se aprovechan como sidecars de decodificacion especulativa, y un drafter DFlash independiente, tambien orientado a acelerar la generacion. El componente multimodal se implementa mediante un proyector mmproj que conecta codificadores de vision y de audio con el espacio de representacion del modelo de lenguaje.

El sufijo "RL" de la denominacion hace referencia al regimen de post-entrenamiento: Xiaomi indica que la serie MiMo-V2.6 se ha desarrollado escalando computo de aprendizaje por refuerzo sobre tareas complejas y verificables, con publicacion de metricas de entrenamiento en vivo en su sitio. El detalle exacto del numero de tokens de preentrenamiento, la composicion del dataset y la receta concreta de RLHF/DPO no se especifica en la informacion disponible. La variante "Flash" corresponde presumiblemente a la version de menor coste de inferencia de la familia, frente a MiMo-V2.6-Pro.

La conversion a GGUF la realiza automaticamente la herramienta ggml-org/convert. Una limitacion declarada por el autor es que las cuantizaciones Q2 no emplean calibracion imatrix por ausencia de una matriz de calibracion.

## Capacidades

- Generacion de texto conversacional y razonamiento reforzado mediante RL (la serie se presenta orientada a tareas complejas y verificables).
- Procesamiento de imagen y texto (pipeline declarado `image-text-to-text`), gracias al proyector mmproj en Q8_0.
- Procesamiento de audio: la model card indica que el mmproj incluye codificadores de vision **y** de audio, por lo que el modelo es omnimodal (texto, imagen y audio).
- Decodificacion especulativa integrada mediante cabezas MTP (`--mtp`) y un drafter DFlash, orientada a reducir la latencia de generacion.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`) y uso conversacional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).
- Modo "thinking" explicito con bloques de razonamiento separados: no disponible.

## Casos de uso

- Asistente multimodal local sobre documentos: el modelo puede recibir imagenes de paginas escaneadas junto a texto y responder preguntas sobre su contenido, sin enviar los datos a servicios externos, gracias a los codificadores de vision incluidos en el mmproj.
- Analisis de audio y transcripcion de reuniones: dado que el proyector cubre audio, permite pipelines que combinan una reunion grabada con instrucciones textuales para generar resumenes o extraer acciones, todo dentro de una unica llamada al modelo.
- Razonamiento sobre problemas verificables (matematicas, logica, codigo correcto/incorrecto): el post-entrenamiento con RL sobre tareas verificables lo hace adecuado para flujos donde la respuesta puede comprobarse automaticamente, como tutoria o generacion de soluciones con validacion posterior.
- Despliegue en llama.cpp para entornos con soberania de datos: la disponibilidad de cuantizaciones MXFP4 y Q2_K permite ejecutar el modelo en infraestructura propia (on-premise o air-gapped) sin dependencia de APIs, algo critico en banca, sanidad o defensa.
- Generacion asistida en produccion con decodificacion especulativa: los sidecars MTP y el drafter DFlash permiten activar `--mtp` en llama.cpp para reducir la latencia por token en servicios de generacion de codigo o texto con requisitos de tiempo de respuesta.
- Investigacion en entrenamiento con RL y evaluacion de modelos omnimodales: al ser un modelo nativamente multimodal con licencia MIT, sirve como base para experimentos de fine-tuning, comparativas de RL y estudios de alineacion sin restricciones de licencia.
- Prototipado de aplicaciones multimodales en estaciones de trabajo grandes o Mac Studio: con MXFP4 (~165 GB estimados) el modelo cabe en memoria unificada de gama alta, lo que permite iterar en demos de vision-lenguaje-audio sin clúster.
- Servicio conversacional de contexto largo en un endpoint compatible con OpenAI: la etiqueta `endpoints_compatible` y el formato GGUF facilitan exponerlo tras un servidor compatible y consumirlo desde aplicaciones existentes (longitud de contexto real: no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Xiaomi mantiene un panel publico de metricas de entrenamiento (recompensa, perdida, etc.) en su sitio de RL, pero la informacion recopilada no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales comparables.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 308,8 mil millones de parametros):
  - BF16 (precision completa): ~617 GB.
  - MXFP4 (expertos enrutados en MXFP4 nativo): ~165-175 GB.
  - Q2_K: ~100-115 GB.
  - A estas cifras hay que sumar el mmproj (~1 GB aprox. en Q8_0) y, si se activa, el drafter MTP o DFlash.
- GPU recomendadas: para MXFP4 o Q2_K en memoria de GPU se necesitan configuraciones multi-GPU, por ejemplo 2-4x H100 80 GB, 2-4x A100 80 GB o 2x H200; para BF16 se requiere un clúster de 8x H100 80 GB o equivalente.
- GPU de consumo: no cabe en una sola GPU consumer (RTX 4090 de 24 GB, RTX 5090 o similares). Solo es viable con offload parcial a RAM del sistema o con memoria unificada de gran capacidad (por ejemplo, Apple Silicon con 192 GB o mas en MXFP4).
- Opciones de despliegue: llama.cpp (recomendado, incluida la herramienta `llama.app` con `llama serve -hf ggml-org/MiMo-V2.6-Flash-RL-GGUF`), Ollama (importando el GGUF), y servidores compatibles con endpoints OpenAI. vLLM y TGI: no confirmado para este GGUF especifico.
- Latencia y throughput estimados: no disponibles. La decodificacion especulativa via MTP (`--mtp`) y el drafter DFlash estan disenados para mejorarlos, pero no se publican cifras.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a sus especificaciones publicadas; los del modelo de esta ficha, a lo indicado en el repositorio.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (GGUF) | 308,8 mil millones | no disponible | no disponible | MIT | GGUF |
| DeepSeek-V3 / R1 | 671 mil millones | 37 mil millones | 128K | MIT / licencia DeepSeek | safetensors, GGUF |
| Qwen3-235B-A22B | 235 mil millones | 22 mil millones | 128K | Apache 2.0 | safetensors, GGUF |
| Llama 4 Maverick | 400 mil millones | 17 mil millones | 1M | Licencia Llama 4 | safetensors, GGUF |

Nota: para MiMo-V2.6-Flash-RL no se dispone de datos de contexto, parametros activos ni comparativas de rendimiento, por lo que la tabla solo permite contrastar tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- No se declaran idiomas soportados, por lo que se desconoce el grado de cobertura multilingue mas alla del ingles.
- No se publica la longitud de contexto, lo que impide garantizar el comportamiento en ventanas largas.
- Las cuantizaciones Q2_K no utilizan calibracion imatrix (limitacion declarada por el autor), lo que puede degradar la calidad respecto a cuantizaciones mejor calibradas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, no cuantificado en la informacion disponible.
- No hay informacion sobre sesgos, evaluaciones de seguridad, red-teaming ni politica de uso responsable.
- Los datos de audio e imagen se procesan mediante el mmproj; la calidad real de esas capacidades no esta documentada con benchmarks.
- Licencia MIT: permite uso comercial y modificacion sin restricciones relevantes, pero el autor de la conversion (ggml-org) no ofrece garantias; el modelo queda sujeto a verificacion propia en produccion.
- El tamano del repositorio (577,6 GB) implica costes de almacenamiento y descarga considerables; la descarga de un solo fichero MXFP4 parcial no es suficiente para ejecutar el modelo.
- Requiere hardware multi-GPU o memoria unificada de gran capacidad; no es viable en una GPU de consumo unica.
- La conversion se realiza de forma automatica con ggml-org/convert, por lo que pueden aparecer incidencias de compatibilidad con versiones concretas de llama.cpp; conviene fijar la version del runtime.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF
- Fichero MXFP4 (parte 1 de 2): https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF/blob/main/MiMo-V2.6-Flash-RL-MXFP4-00001-of-00002.gguf
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Herramienta de conversion: https://github.com/ggml-org/convert
- Aplicacion de ejecucion: https://llama.app
- Pagina de la serie MiMo-V2.6 de Xiaomi: https://mimo.xiaomi.com/mimo-v2-6
- Metricas de entrenamiento RL en vivo: https://mimo.xiaomi.com/rl/
- Articulo sobre el lanzamiento del GGUF con soporte MTP y mmproj: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-flash-rl-gguf-released/
