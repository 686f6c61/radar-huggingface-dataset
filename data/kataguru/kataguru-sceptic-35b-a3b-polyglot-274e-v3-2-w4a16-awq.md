# kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-W4A16-AWQ es la version cuantizada en INT4 (W4A16 con AWQ) del modelo multimodal Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de mezcla de expertos (MoE) con 274 expertos enrutados, construido sobre el nucleo congelado de Kataguru-Sceptic-35B-A3B-v3.1 (254 expertos orientados a STEM, codigo, matematicas y razonamiento) al que se anaden 20 expertos especializados en 10 lenguas morfologicamente complejas: finlandes, estonio, hungaro, lituano, leton, islandes, euskera, georgiano, gales y turco, ademas del ingles.

El modelo resuelve el problema de la traduccion directa entre pares de lenguas sin pivotar por el ingles, preservando matices morfologicos, registro y estructura parrafal en las 110 combinaciones posibles entre los 11 idiomas soportados. Su interes actual radica en que, gracias a la cuantizacion W4A16-AWQ, el modelo ocupa aproximadamente 20,5 GiB en disco (unos 19,1 GiB en vLLM con `--language-model-only`) y cabe en una unica GPU de 24 GB, lo que lo hace desplegable en hardware de consumo o de gama profesional de un solo acelerador.

La arquitectura es de tipo transformer MoE con enrutamiento Top-8 (8 expertos activos por token, unos 3B parametros activos), lo que mantiene un coste computacional por token relativamente bajo pese a sus 38.274.881.392 parametros totales. La licencia es Apache 2.0 y el modelo esta publicado bajo el pipeline `image-text-to-text`, lo que indica capacidades multimodales de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), tipo `qwen3_5_moe`, 274 expertos, Top-8 activos por token |
| Parametros totales | 38.274.881.392 (~38,3B) |
| Parametros activos | ~3B por token (Top-8 routing) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pesos, activaciones FP16), `group_size=128`, formato `compressed-tensors`, compatible con Marlin |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (AWQ / compressed-tensors); existe suite GGUF y NVFP4 en repos separados |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de 274 expertos por capa con enrutamiento Top-8, derivada de la familia Qwen 3.5 MoE. Los expertos `#0..#253` (254 en total) son el nucleo congelado, bit-identico, de Kataguru-Sceptic-35B-A3B-v3.1, orientado a STEM, codigo, matematicas y razonamiento en ingles o dominio universal. Los expertos `#254..#273` (20 expertos, organizados en 10 pares) se anaden como especialistas linguisticos para cada una de las 10 lenguas morfologicamente complejas, con dos expertos por idioma. Al residir todos los pares linguisticos simultaneamente en el mismo router, el modelo puede realizar traduccion directa L1-L2 entre las 110 combinaciones de los 11 idiomas sin pivotar por el ingles.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo base Kataguru-Sceptic-35B-A3B-v3.1 reporta un promedio de 70,26 % en un conjunto de 15 benchmarks y 70,20 % en GPQA Diamond. La innovacion tecnica destacable es la especializacion linguistica por expertos dedicados a lenguas con morfologia compleja (casos, armonia vocalica, mutaciones consonanticas, ergatividad, aglutinacion) y la capacidad de traduccion directa entre pares sin pivote. La cuantizacion W4A16-AWQ con `group_size=128` y compatibilidad con Marlin permite ejecutar el modelo en una sola GPU de 24 GB.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas (nucleo STEM/coding heredado del modelo base).
- Vision: el pipeline es `image-text-to-text`, por lo que acepta entradas de imagen y texto.
- Traduccion directa L1-L2 entre 110 pares de idiomas sin pivote por ingles, con preservacion de matiz morfologico y estructura parrafal.
- Modo de traduccion mediante prefijo `/translate /<codigo_destino>` (por ejemplo `/translate /et`, `/translate /fi`, `/translate /selko`).
- RAG multilingue nativo (`/rag` o `documents=[...]`): lectura de fragmentos en cualquier combinacion de los 11 idiomas y sintesis de respuesta anclada en el idioma destino con citas en linea obligatorias (`[1]`, `[2]`), reporte automatico de conflictos y abstencion explicita cuando falta un dato.
- Soporte de tool calling / function calling (el modelo base reporta BFCL V4 83,67 %).
- Capacidades multimodales y de razonamiento (tags `multimodal`, `vision`, `reasoning`).
- Modo de chat con expertos linguisticos nativos mediante prefijos de idioma.
- Capacidades multilingues en las 11 lenguas listadas, con especializacion en lenguas aglutinantes y de morfologia compleja.

## Casos de uso

- Traduccion profesional entre lenguas minoritarias o de morfologia compleja: el modelo traduce directamente entre, por ejemplo, finlandes y estonio, hungaro y finlandes o lituano y leton, sin pasar por el ingles, lo que reduce la perdida de matices morfologicos en pares como las lenguas balticas o las fino-ugricas.
- RAG multilingue con citas: en un corpus que mezcle documentos en finlandes, estonio, hungaro, georgiano o turco, el modelo lee los fragmentos recuperados en cualquier combinacion de idiomas y sintetiza una respuesta anclada en el idioma destino con citas `[1]`, `[2]` y abstencion cuando el dato no esta presente.
- Atencion al cliente en mercados nordicos y balticos: conversaciones multi-turno en finlandes, estonio, lituano, leton e islandes, con la ventaja de que un unico modelo cubre varios idiomas sin desplegar instancias separadas.
- Localizacion de software y documentacion: traduccion de cadenas y parrafos preservando registro y estructura, con modo `/selko` para finlandes en lenguaje claro (Selkokieli).
- Procesamiento de documentacion tecnica STEM en lenguas locales: al conservar el nucleo STEM congelado, el modelo puede responder preguntas tecnicas, de codigo o matematicas en el idioma del usuario sin perder capacidad de razonamiento.
- Asistentes con vision para tareas documentales: al ser `image-text-to-text`, puede procesar imagenes junto con texto, util para extraer y traducir contenido de capturas o documentos escaneados en los idiomas soportados.
- Despliegue en una sola GPU de 24 GB: gracias a los ~19,1 GiB en vLLM con `--language-model-only`, es viable en estaciones de trabajo con una RTX 4090 o similar para prototipado y servicio de baja concurrencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo base Kataguru-Sceptic-35B-A3B-v3.1 (nucleo congelado). No se han publicado resultados de benchmarks especificos para esta version cuantizada W4A16-AWQ en la informacion disponible.

| Benchmark | Kataguru-Sceptic-35B-A3B-v3.1 (base) |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| BFCL V4 | 83,67 % |
| PLC/CNC | 96,67 % |

No se han publicado resultados de benchmarks de la version cuantizada ni de los expertos linguisticos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~20,5 GiB en disco; ~19,1 GiB en vLLM con `--language-model-only`, lo que permite ejecucion en una unica GPU de 24 GB.
- GPU recomendadas: una sola GPU de 24 GB (por ejemplo RTX 4090, RTX A5000, L4) para el formato AWQ; la version NVFP4 (~21,9 GiB) esta pensada para GPUs Blackwell.
- Cabe en GPU de consumo: si, en GPUs de 24 GB de VRAM con la cuantizacion W4A16-AWQ.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors`/AWQ y Marlin), transformers; existe una suite GGUF (`APEX-Small`, `APEX-Medium`, `APEX-Good` + `mmproj`) para llama.cpp y entornos tipo Ollama; tambien hay una version NVFP4 para Blackwell.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de esta version cuantizada ni de modelos comparables directos en la informacion proporcionada. Como referencia, el modelo base Kataguru-Sceptic-35B-A3B-v3.1 reporta GPQA Diamond 70,20 % y BFCL V4 83,67 %, pero no se han facilitado resultados de alternativas de la misma categoria (mismo tamano o misma tarea de traduccion multilingue) para una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-W4A16-AWQ | ~38,3B totales / ~3B activos | no disponible | apache-2.0 | Hugging Face (transformers, vLLM) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos de sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; el modo RAG incorpora abstencion explicita y citas, pero fuera de ese modo el riesgo persiste.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar cargas de contexto largo con precision.
- La especializacion linguistica cubre 11 idiomas; el rendimiento fuera de ese conjunto no esta documentado.
- La cuantizacion INT4 puede degradar ligeramente la calidad respecto al modelo en precision completa; no se han publicado mediciones de esa perdida.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.
- Para produccion, la ausencia de benchmarks de la version cuantizada obliga a realizar una evaluacion propia antes de desplegar.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-W4A16-AWQ
- Version NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-NVFP4
- Suite GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
