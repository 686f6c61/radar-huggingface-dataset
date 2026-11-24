# Poij-cv1/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal vision-lenguaje desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se trata de la version instruida (instruction-tuned) de la familia Qwen2.5-VL, que incluye variantes de 3, 7 y 72 mil millones de parametros; este repositorio concreto aloja la variante de 7B. El modelo procesa entradas conjuntas de texto, imagen y video, y esta disenado para tareas de comprension visual, OCR estructurado, analisis de graficos y uso como agente visual.

La arquitectura combina un encoder de vision (ViT) con un modelo de lenguaje Qwen2.5, unidos mediante un mecanismo de atencion espacial-temporal. Entre las novedades de esta version destacan la resolucion dinamica y el muestreo dinamico de FPS para video, la incorporacion de window attention en el ViT, y la alineacion temporal mediante mRoPE con IDs y tiempo absoluto, lo que permite localizar eventos concretos en videos de mas de una hora. El modelo puede generar bounding boxes, puntos y salidas JSON estructuradas.

El repositorio corresponde a una copia subida por el usuario `Poij-cv1` (no es el repositorio oficial del equipo Qwen), con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 24 de noviembre de 2026. El peso total en safetensors es de 8.292.166.656 parametros y el tamano del repositorio es de 16,6 GB, lo que sugiere pesos en precision bf16/fp16. La relevancia actual del modelo radica en su combinacion de capacidades agente (uso de ordenador y telefono), comprension de video largo y salidas estructuradas, con un tamano que permite despliegue en hardware de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: encoder ViT (con window attention, SwiGLU y RMSNorm) + LLM Qwen2.5, con mRoPE en dimensiones espacial y temporal |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica el valor numerico; se menciona comprension de videos de mas de 1 hora) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ en la informacion proporcionada) |
| Idiomas soportados | en (segun la model card y los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2.5-VL-7B-Instruct emplea una arquitectura transformer multimodal compuesta por un encoder de vision (ViT) y un modelo de lenguaje Qwen2.5. El ViT incorpora window attention para acelerar entrenamiento e inferencia, y se ha optimizado con SwiGLU y RMSNorm para alinear su estructura con la del LLM. La conexion entre vision y lenguaje se realiza mediante mRoPE (multimodal Rotary Position Embedding), que en esta version se extiende a la dimension temporal con IDs y alineacion de tiempo absoluto. Esto permite al modelo aprender secuencias temporales y velocidad, y localizar momentos concretos dentro de un video.

El entrenamiento utiliza resolucion dinamica y muestreo dinamico de FPS en video, lo que habilita la comprension de videos con distintas tasas de muestreo y de duracion superior a una hora. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en el material proporcionado. El modelo es la variante instruction-tuned, por lo que se espera un ajuste supervisado sobre la base, aunque los detalles no se documentan en el repositorio consultado.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes, graficos, tablas, iconos y layouts.
- Comprension de video de mas de una hora, con capacidad de localizar segmentos relevantes (event pinpointing) y muestreo dinamico de FPS.
- Localizacion visual: generacion de bounding boxes y puntos con coordenadas y atributos en JSON estable.
- Salidas estructuradas para documentos como facturas, formularios y tablas, orientadas a finanzas y comercio.
- Uso como agente visual: razonamiento y direccion dinamica de herramientas, con capacidades de computer use y phone use.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otros idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision: si. Audio: no documentado.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo genera salidas JSON estructuradas a partir de escaneos, lo que permite extraer campos y tablas de forma automatizada en flujos financieros y administrativos.
- Analisis de documentos y graficos: con resultados destacados en DocVQA (95,7), InfoVQA (82,6) y ChartQA (87,3), es adecuado para responder preguntas sobre informes, dashboards y figuras tecnicas.
- OCR y extraccion de texto en imagenes: su puntuacion en OCRBench (864) y CC_OCR (77,8) lo hace util para pipelines de lectura de documentos, tickets y carteles.
- Agente de interfaz de usuario: con ScreenSpot (84,7) y MobileMiniWob++ (91,4), puede emplearse para automatizar interacciones en pantallas de escritorio y moviles, como rellenar formularios o navegar por aplicaciones.
- Analisis de video largo: la comprension de videos de mas de una hora y la localizacion temporal permiten resumir reuniones, clases o grabaciones de vigilancia y extraer los momentos relevantes.
- Asistencia en matematicas visuales: con MathVista (68,2) y MathVision (25,07), sirve para resolver problemas que combinan diagramas, graficos y enunciados numericos.
- Moderacion y descripcion de contenido visual: puede describir y clasificar imagenes (flores, aves, peces, insectos) y analizar layouts, util para catalogacion y accesibilidad.
- Automatizacion de soporte con capturas de pantalla: el usuario envia una captura y el modelo interpreta la interfaz y guia los siguientes pasos, apoyandose en sus capacidades de agente visual.

## Benchmarks y rendimiento

Resultados publicados en la model card (benchmarks de imagen):

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU val | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro val | 34,3 | - | 37,6 | 30,5 | 41,0 |
| DocVQA test | 93 | 93 | - | 94,5 | 95,7 |
| InfoVQA test | 77,6 | - | - | 76,5 | 82,6 |
| ChartQA test | 84,8 | - | - | 83,0 | 87,3 |
| TextVQA val | 79,1 | 80,1 | - | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | - | - | 61,6 | 77,8 |
| MMStar | 62,8 | - | - | 60,7 | 63,9 |
| MMBench-V1.1-En test | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMT-Bench test | - | - | - | 63,7 | 63,6 |
| MMVet GPT-4-Turbo | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench avg | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista testmini | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | - | - | - | 16,3 | 25,07 |

Benchmarks de video:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest test | 66,9 | 70,5 |
| Video-MME wo/w subs | 63,3/69,0 | 65,1/71,6 |
| LVBench | - | 45,3 |
| LongVideoBench | - | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | - | 71,7 |
| MLVU | - | 70,2 |
| CharadesSTA/mIoU | - | 43,6 |

Benchmarks de agente:

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84,7 |
| ScreenSpot Pro | 29,0 |
| AITZ_EM | 81,9 |
| Android Control High_EM | 60,1 |
| Android Control Low_EM | 93,7 |
| AndroidWorld_SR | 25,5 |
| MobileMiniWob++_SR | 91,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,6 GB en safetensors, lo que corresponde a precision bf16/fp16. En bf16 se necesitan aproximadamente 17 GB de VRAM solo para los pesos, mas el coste de activaciones y cache KV, por lo que se recomienda un minimo de 24 GB para inferencia comoda.
- Cuantizaciones: la informacion proporcionada no documenta variantes GGUF, AWQ ni GPTQ, por lo que no se pueden dar cifras de VRAM para cuantizacion.
- GPU recomendadas: para bf16, GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, L40S); para mayor throughput, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, aunque con margen limitado para contextos largos y video; en GPUs de 16 GB requeriria cuantizacion no documentada en este repositorio.
- Opciones de despliegue: transformers (recomendado instalar desde el repositorio oficial por el soporte de `qwen2_5_vl`), `qwen-vl-utils` para manejo de imagenes y video, Text Generation Inference (tag `text-generation-inference` en el repositorio) y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU val | DocVQA test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct | 8,29 B | no disponible | 58,6 | 95,7 | apache-2.0 | Hugging Face (copia de usuario) |
| Qwen2-VL-7B | 7 B (aprox.) | no disponible | 54,1 | 94,5 | no disponible en la informacion | Hugging Face |
| InternVL2.5-8B | 8 B (aprox.) | no disponible | 56 | 93 | no disponible en la informacion | Hugging Face |
| MiniCPM-o 2.6 | no disponible | no disponible | 50,4 | 93 | no disponible en la informacion | Hugging Face |
| GPT-4o-mini | propietario | no disponible | 60 | - | propietaria | API |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado con datos web, es previsible que herede sesgos de esos datos, aunque no se cuantifican.
- Riesgo de alucinacion: presente como en cualquier LLM; en tareas de OCR y documentos conviene validar las salidas estructuradas antes de usarlas en produccion. HallBench avg de 52,9 indica margen de mejora en fidelidad visual.
- Limitaciones de idioma: la model card solo declara ingles (`en`); no se garantiza un rendimiento equivalente en castellano ni en otros idiomas.
- Limitaciones de contexto: no se especifica la longitud de contexto numerica; aunque se documenta video de mas de una hora, no se detalla el limite de tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero esta copia concreta es un repositorio de usuario (`Poij-cv1`) con 0 descargas; para produccion se recomienda verificar el repositorio oficial del equipo Qwen y la integridad de los pesos.
- Requisito de version de transformers: es necesario instalar transformers desde el repositorio oficial para evitar el error `KeyError: 'qwen2_5_vl'`.
- Dependencia de `decord` para carga rapida de video, con problemas de instalacion en plataformas no Linux.
- El repositorio consultado no incluye informacion sobre cuantizaciones ni sobre el proceso exacto de entrenamiento (tokens, dataset, RLHF/DPO).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Poij-cv1/Qwen2.5-VL-7B-Instruct
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub oficial: https://github.com/QwenLM/Qwen2.5-VL
- Demo de chat: https://chat.qwenlm.ai/
- Paper de referencia (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper de referencia (arxiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper de referencia (arxiv:2308.12966): https://arxiv.org/abs/2308.12966
