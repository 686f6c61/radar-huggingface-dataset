# onnx-community/Supra2.5-Ultra-ONNX

## Resumen

Supra2.5-Ultra-ONNX es la conversión a formato ONNX del modelo base Supra2.5-Ultra, desarrollado por SupraLabs. Se trata de un modelo de lenguaje causal compacto de 148,9 millones de parámetros entrenado desde cero sobre una mezcla de texto web, contenido educativo sintético, código y matemáticas. La conversión la ha realizado la comunidad onnx-community mediante un espacio automatizado de Hugging Face, y está pensada para su uso con Transformers.js en entornos JavaScript y en el navegador.

El modelo emplea una arquitectura decoder compatible con `Qwen3ForCausalLM` (16 capas, anchura oculta 768, atención con grouped-query de 12 cabezas de consulta y 4 de clave/valor) pero con dimensiones y tokenizador propios; no se inicializó a partir de pesos de Qwen. Incorpora un tokenizador byte-level BPE personalizado de 32.000 tokens y un contexto máximo de 2.048 tokens.

Su relevancia radica en dos factores: por un lado, los resultados publicados sitúan a Supra2.5-Ultra por delante de alternativas del mismo rango (SmolLM2-135M, MobileLLM-R1-140M-base, GPT-2, OPT-125M, Pythia-160M) en el índice agregado INT; por otro, esta versión ONNX permite ejecutar el modelo en el cliente con Transformers.js, algo poco habitual en modelos base de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal, clase `Qwen3ForCausalLM`, con SwiGLU, RMSNorm, QK-norm por cabeza y RoPE |
| Parametros totales | 148.859.648 (contando embeddings atados una sola vez) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo publica pesos ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | Inglés (principal); el entrenamiento incluye lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 1,9 GB); el modelo original se publica en FP32 y safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 16 capas con anchura oculta de 768, feed-forward de 2.688 y activación SwiGLU. Usa grouped-query attention con 12 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 64, normalización RMSNorm (epsilon 1e-6) más normalización QK por cabeza, codificación posicional RoPE con theta 100.000 y embeddings de entrada/salida atados. El vocabulario es de 32.000 tokens con un tokenizador byte-level BPE propio. Se entrenó desde cero, no por inicialización desde pesos Qwen, y la exportación carga con Transformers estándar sin código remoto.

El presupuesto de entrenamiento de la ejecución completa es de 150.000 millones de tokens, con la siguiente mezcla: Ultra-FineWeb inglés (45 %, 67,5B), DCLM `dclm_100bt` (25 %, 37,5B), Cosmopedia V2 de `smollm-corpus` (10 %, 15B), UltraData-Code L2 (15 %, 22,5B) y UltraData-Math L1 (5 %, 7,5B). El código cubre Python, JavaScript, Java, C++, C#, Go, PHP, Rust, Ruby, Shell y R. El optimizador combina Muon2 para matrices (lr pico 0,02, betas 0,95/0,95, 3 iteraciones Newton–Schulz) y AdamW para embeddings y normalización (lr pico 6e-4, mínimo 6e-5, betas 0,9/0,95), con warm-up de 1B tokens, decaimiento coseno, batch global de 524.288 tokens, weight decay 0,1 y clipping de gradiente 1,0. El checkpoint publicado corresponde al paso 273.085 y, según la model card, esta versión ha sido fuertemente destilada a partir de un profesor de mayor tamaño (detalle truncado en la información disponible).

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base (no ajustado por instrucciones).
- Razonamiento básico y conocimiento factual de escala pequeña, medido en ARC-Easy, ARC-Challenge, PIQA y HellaSwag.
- Aritmética elemental, evaluada con ArithMark-3.
- Generación de código en once lenguajes (Python, JavaScript, Java, C++, C#, Go, PHP, Rust, Ruby, Shell y R).
- Modelado de matemáticas por inclusión de UltraData-Math L1 en el preentrenamiento.
- Ejecución en navegador y en Node.js mediante Transformers.js con el pipeline `text-generation`.
- No dispone de tool calling, function calling, modo thinking, visión ni audio: es un modelo base sin post-entrenamiento de instrucciones documentado.

## Casos de uso

- Completado de texto en el navegador: con el pipeline `text-generation` de Transformers.js, el modelo ONNX puede ofrecer autocompletado o sugerencias de redacción sin enviar datos a un servidor, aprovechando el contexto de 2.048 tokens.
- Prototipado rápido de aplicaciones web de IA generativa: sirve como modelo de referencia para validar interfaces, streaming de tokens y gestión de contexto en JavaScript antes de migrar a un modelo mayor.
- Generación asistida de código en entornos de edición ligeros: al haberse entrenado con un 15 % de código en once lenguajes, puede completar fragmentos y funciones cortas en herramientas de desarrollo basadas en web.
- Filtrado y clasificación de texto por perplejidad: al ser un modelo base, puede puntuar la verosimilitud de textos para detección de anomalías, deduplicación o control de calidad de corpus.
- Investigación educativa y docencia: su tamaño (148,9M) y su licencia Apache 2.0 permiten estudiar el comportamiento de un transformer entrenado desde cero y reproducir experimentos de ajuste fino sin coste de licencia.
- Generación de datos sintéticos a pequeña escala: puede producir continuaciones de texto para aumentar corpus de entrenamiento en tareas de baja exigencia, siempre con revisión posterior por su tendencia a la alucinación.
- Ajuste fino ligero en tareas de dominio: al ser un modelo base de 148,9M, es viable afinarlo en una sola GPU consumer para clasificación, resumen extractivo o generación de plantillas.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (índice INT agregado):

| Modelo | Parámetros | ARC-Easy | ARC-Challenge | PIQA | HellaSwag | ArithMark-3 | INT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Supra2.5 Ultra | 148,9M | 69,70 % | 40,87 % | 72,14 % | 56,31 % | 46,50 % | 39,74 |
| GPT-X3-150M | 149,0M | 59,64 % | 31,31 % | 71,33 % | 46,16 % | 50,90 % | 33,05 |
| SmolLM2-135M | 135,0M | 58,63 % | 29,69 % | 68,44 % | 43,22 % | 39,20 % | 27,13 |
| SmolLM-135M | 135,0M | 56,31 % | 29,01 % | 68,28 % | 42,70 % | 36,80 % | 25,74 |
| MobileLLM-R1-140M-base | 140,0M | 49,92 % | 24,74 % | 63,22 % | 33,84 % | 65,70 % | 24,64 |
| GPT-X2-125M | 125,0M | 51,47 % | 27,82 % | 67,30 % | 40,41 % | 37,20 % | 23,36 |
| Supra2.5 Pro Base | 65,0M | 50,80 % | 25,77 % | 63,11 % | 34,35 % | 49,60 % | 21,29 |
| Supra2.1-Ultra | 229,7M | 50,46 % | 26,28 % | 64,91 % | 37,18 % | 38,20 % | 20,64 |
| Supra2-100M-Base | 100,7M | 47,81 % | 24,83 % | 65,40 % | 35,98 % | 36,90 % | 19,41 |
| Supra-50M-Base | 51,8M | 45,88 % | 25,00 % | 62,51 % | 31,83 % | 36,30 % | 15,85 |
| OPT-125M | 125,0M | 40,28 % | 22,70 % | 62,24 % | 31,31 % | 35,20 % | 13,80 |
| GPT-2 | 124,0M | 39,35 % | 22,35 % | 62,08 % | 31,26 % | 35,70 % | 13,58 |
| Pythia-160M | 162,3M | 39,65 % | 23,63 % | 61,97 % | 30,27 % | 35,10 % | 13,31 |
| Supra2-Medium-Base | 25,4M | 41,67 % | 24,15 % | 59,68 % | 29,29 % | 34,80 % | 12,09 |

No se han publicado resultados de benchmarks específicos de la versión ONNX en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 148,9M parámetros, el modelo en FP32 ocupa aproximadamente 0,6 GB de pesos; en FP16/BF16 unos 0,3 GB, y en cuantización de 8 bits alrededor de 0,15 GB. La memoria total de inferencia depende de la longitud de contexto (máximo 2.048 tokens), pero se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas. En el extremo opuesto, también es viable en CPU.
- GPU consumer: sí, cabe holgadamente en cualquier GPU consumer actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers.js (navegador y Node.js) es la vía principal al tratarse de un repositorio ONNX; también puede ejecutarse con ONNX Runtime, y los pesos originales con vLLM, llama.cpp, Ollama o TGI tras conversión.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera una latencia de decodificación muy baja en GPU y aceptable en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | INT | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Supra2.5 Ultra (ONNX) | 148,9M | 2.048 | 39,74 | Apache 2.0 | Hugging Face, ONNX para Transformers.js |
| SmolLM2-135M | 135,0M | 8.192 (según su model card pública) | 27,13 | Apache 2.0 | Hugging Face, amplio ecosistema |
| MobileLLM-R1-140M-base | 140,0M | no disponible | 24,64 | no disponible | Hugging Face |
| GPT-2 | 124,0M | 1.024 | 13,58 | MIT | Hugging Face, referencia histórica |

Supra2.5-Ultra obtiene el mejor INT de la comparativa (39,74 frente a 27,13 de SmolLM2-135M), aunque MobileLLM-R1-140M-base le supera en ArithMark-3 (65,70 % frente a 46,50 %). Su contexto de 2.048 tokens es más corto que el de SmolLM2-135M, lo que limita tareas que requieran ventanas largas. La ventaja diferencial de esta variante es la disponibilidad en ONNX para ejecución en cliente.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y puede requerir prompting de completado.
- Riesgo elevado de alucinación y de generar texto factualmente incorrecto, especialmente en dominios especializados.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idioma principal inglés; el soporte de otros idiomas naturales no está documentado y el castellano no figura entre los idiomas declarados.
- Sesgos potenciales heredados de los corpus web (Ultra-FineWeb, DCLM) y del contenido sintético (Cosmopedia V2), no evaluados en la model card.
- La model card indica que esta versión ha sido fuertemente destilada de un profesor mayor; conviene verificar el comportamiento en producción frente al checkpoint original.
- La licencia Apache 2.0 cubre los pesos del modelo, pero las licencias de los datasets de entrenamiento y de los contenidos de origen son independientes y deben revisarse por separado.
- La conversión ONNX es automática y no se documentan métricas de fidelidad respecto a los pesos originales; conviene validar la calidad de las salidas antes de usarla en producción.
- El repositorio es reciente (creado el 21 de noviembre de 2026) y registra 0 descargas, por lo que carece de validación comunitaria.

## Enlaces

- Modelo ONNX: https://huggingface.co/onnx-community/Supra2.5-Ultra-ONNX
- Modelo base original: https://huggingface.co/SupraLabs/Supra2.5-Ultra
- Espacio de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de Transformers.js, pipeline `text-generation`: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
- SmolLM2-135M (comparativa): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- MobileLLM-R1-140M-base (comparativa): https://huggingface.co/facebook/MobileLLM-R1-140M-base
- GPT-X3-150M (comparativa): https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset DCLM 100BT: https://huggingface.co/datasets/HuggingFaceFW/dclm_100bt
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
