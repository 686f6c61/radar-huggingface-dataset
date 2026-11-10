# kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-NVFP4 es una cuantizacion NVFP4 de un modelo MoE multimodal desarrollado por el usuario kataguru. Se construye sobre el nucleo congelado de Kataguru-Sceptic-35B-A3B-v3.1 (254 expertos dedicados a STEM, codigo, matematicas y razonamiento) al que se anaden 20 expertos especializados en 10 lenguas morfologicamente complejas (finlandes, estonio, hungaro, lituano, leton, islandes, euskera, georgiano, gales y turco), dando un total de 274 expertos con 8 activos por token.

El modelo resuelve el problema de la traduccion directa entre pares de lenguas sin pivote ingles, preservando matices morfologicos como los casos nominales, la armonia vocalica o la ergatividad. Con aproximadamente 38.270 millones de parametros totales y unos 3.000 millones activos por token, la cuantizacion NVFP4 reduce el peso en disco a unos 21,9 GiB, lo que permite ejecutarlo en una unica GPU de 24 GB.

Es relevante por su enfoque de especializacion linguistica dentro de un mismo router MoE (traduccion directa en 110 pares de lenguas) y por estar empaquetado especificamente para hardware Blackwell con `compressed-tensors`, ademas de incluir modo RAG multilingue con citas obligatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia `qwen3_5_moe`), 274 expertos, top-8 por token |
| Parametros totales | 38.274.881.392 (38,27 mil millones) |
| Parametros activos | ~3 mil millones por token (top-8 routing) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, `compressed-tensors`); existen variantes W4A16-AWQ y GGUF del mismo autor |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (NVFP4, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE con 274 expertos por capa y activacion de 8 expertos por token. Los expertos 0 a 253 corresponden al nucleo congelado del modelo base v3.1 (STEM, codigo, matematicas y razonamiento), mientras que los expertos 254 a 273 se organizan en pares dedicados a cada una de las 10 lenguas objetivo. Al residir todos los expertos linguisticos en el mismo router, el modelo puede realizar traduccion directa L1 a L2 entre los 11 idiomas (110 pares) sin usar el ingles como pivote.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para los expertos linguisticos. El modelo base v3.1 reporta resultados de benchmarks (media de 15 benchmarks del 70,26 %, GPQA Diamond 70,20 %, LiveCodeBench v6 39,43 %, BFCL V4 83,67 %, PLC/CNC 96,67 %) que se conservan intactos en el nucleo congelado. La innovacion principal es la cuantizacion NVFP4 nativa para Blackwell mediante `compressed-tensors`, que reduce el modelo a unos 21,9 GiB en disco y unos 20,6 GiB en vLLM con `--language-model-only`.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas heredados del nucleo v3.1.
- Vision multimodal: pipeline `image-text-to-text`, con soporte de imagenes.
- Traduccion directa entre 110 pares de lenguas mediante prefijo `/translate /<codigo>`.
- Modo chat con experto linguistico nativo mediante prefijos `/fi`, `/et`, `/hu`, `/lt`, etc.
- RAG multilingue nativo (`/rag` o `documents=[...]`) con citas obligatorias `[1]`, `[2]`, deteccion de conflictos entre fuentes y abstencion explicita cuando falta un dato.
- Tool calling y function calling (BFCL V4 83,67 % en el nucleo).
- Razonamiento multi-paso y modo agente.
- Capacidades multilingues en 11 idiomas, incluida variante `selko` (finlandes simplificado).

## Casos de uso

- Traduccion profesional entre lenguas minoritarias: traduccion directa finlandes-estonio, hungaro-finlandes o lituano-leton sin pivote ingles, preservando casos y matices morfologicos.
- Localizacion de documentacion tecnica: uso del prefijo `/translate /<codigo>` sobre manuales STEM o codigo, manteniendo terminologia gracias al nucleo congelado.
- RAG multilingue en administraciones publicas: recuperacion de fragmentos en varias lenguas y sintesis con citas `[1]`, `[2]` y abstencion ante datos ausentes.
- Atencion al ciudadano en lenguas cooficiales: chat nativo en euskera, gales o georgiano con respuestas en la misma lengua.
- Analisis documental con vision: pipeline `image-text-to-text` para extraer y traducir texto de imagenes o documentos escaneados.
- Generacion de codigo asistida: uso del nucleo v3.1 con tool calling (BFCL V4 83,67 %) para pipelines de CI/CD.
- Investigacion linguistica: comparacion de estructuras morfologicas (ergatividad vasca, armonia vocalica turca) mediante consultas controladas.

## Benchmarks y rendimiento

Resultados del nucleo congelado v3.1 (heredados por este modelo):

| Benchmark | Resultado |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| BFCL V4 | 83,67 % |
| PLC/CNC | 96,67 % |

No se han publicado resultados especificos de los expertos linguisticos ni de la traduccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~20,6 GiB en vLLM con `--language-model-only`; ~21,9 GiB en disco.
- Cabe en una unica GPU de 24 GB (por ejemplo, RTX 4090 o similar Blackwell).
- Requiere hardware Blackwell para NVFP4 nativo; en otras GPU usar la variante W4A16-AWQ (~20,5 GiB) o GGUF.
- Despliegue: vLLM (recomendado), Hugging Face Transformers, llama.cpp/Ollama mediante la variante GGUF con `mmproj`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-NVFP4 | 38,27 mil millones (MoE, ~3 mil millones activos) | no disponible | apache-2.0 | Hugging Face, NVFP4/W4A16-AWQ/GGUF |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B-A3B (MoE) | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere hardware Blackwell para la cuantizacion NVFP4 nativa; en otras GPU hay que usar W4A16-AWQ o GGUF.
- Riesgo de alucinacion inherente a los modelos generativos; el modo RAG mitiga parcialmente con citas obligatorias y abstencion.
- Sesgos no documentados en la informacion disponible.
- Cobertura linguistica limitada a 11 idiomas; fuera de ellos el rendimiento no esta garantizado.
- Longitud de contexto no especificada, lo que dificulta planificar cargas de contexto largo.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base v3.1.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; madurez de produccion no validada por la comunidad.

## Enlaces

- Hugging Face (NVFP4): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-W4A16-AWQ
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
