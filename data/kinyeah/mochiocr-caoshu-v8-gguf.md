# kinyeah/mochiocr-caoshu-v8-gguf

## Resumen

MochiOCR Chaosu v8 es un adaptador LoRA publicado en formato GGUF para el modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por el usuario kinyeah bajo el nombre de proyecto BiMai (筆脈). Su propósito es muy concreto: transcribir escritura china clásica cursiva (草書, *caoshu*) y semi-cursiva (行草) dispuesta en columnas verticales, típica de manuscritos y libros antiguos (古籍). El modelo devuelve una cadena de caracteres tradicionales sin puntuación, pensada para alimentar una herramienta de cotejo columna a columna.

El repositorio contiene principalmente artefactos de despliegue para llama.cpp: el adaptador LoRA `caoshu-v23-lora-f16.gguf` (349 MB), el proyector visual `v16-merged-mmproj-F16.gguf` (1,1 GB) y una versión fusionada antigua `caoshu-v16-merged-Q4_K_M.gguf` (4,7 GB). Aunque el identificador del repositorio hace referencia a la versión v8, la model card documenta que el adaptador recomendado es el v23, con un CER del 27,5 % frente al 35,6 % del Qwen3-VL-8B original sobre un conjunto de validación limpio de 40 columnas.

La relevancia de este modelo radica en su nicho: el OCR de caligrafía cursiva china es un problema poco cubierto por los modelos generalistas, y aquí se aborda con un ajuste fino ligero (QLoRA r=32, unos 15 horas de GPU acumuladas en total) sobre un modelo base de 8B, lo que permite ejecutarlo en hardware de consumo con cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) Qwen3-VL con adaptador LoRA; runtime llama.cpp |
| Parametros totales | 539.010.048 (según safetensors del repo); el modelo base Qwen3-VL-8B-Instruct es de ~8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (versión fusionada v16); LoRA y mmproj en F16 |
| Idiomas soportados | chino (zh) e inglés (en) según etiquetas; salida en chino tradicional |
| Licencia | Apache-2.0 (pesos); código auxiliar MIT |
| Formato de pesos | GGUF (LoRA adapter, mmproj y modelo fusionado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante QLoRA (r=32, learning rate 2e-5, 2 épocas, fusión en bf16) sobre Qwen3-VL-8B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El adaptador se distribuye como LoRA en GGUF y se carga junto al modelo base y al proyector visual `mmproj` en llama.cpp, usando la plantilla de chat Jinja (`--jinja`). La entrada esperada es un recorte de una sola columna vertical (de arriba abajo), con lado corto ≥ 300 px y lado largo ≤ 3200 px; la salida es una cadena continua de caracteres tradicionales sin puntuación.

El entrenamiento se realizó sobre 4.855 columnas en la versión v23: 2.886 columnas de escritura real (30.336 caracteres), 437 columnas sintéticas renderizadas con fuentes y 1.500 pares de glifos individuales de fuentes TTF (128×128). Además se incorporaron 301 piezas de museo (1.807 fragmentos, de los que se retuvieron 1.066 con similitud ≥ 0,7) y 261 lecturas humanas. Las fuentes sintéticas cubren aproximadamente el 98 % del repertorio: Hengshan Maobi Caoshu (96 %), FangZheng Xingkai GBK (95 %) y FangZheng Huangcao GBK (89 %). El hallazgo empírico documentado es que los pares de glifos TTF funcionan mejor que las columnas sintéticas completas, con un punto óptimo en torno al 31 % del dataset; subir a 3.000 pares (v24) degradó el CER al 29,7 %. El entrenamiento se ejecutó en una única NVIDIA Thor (aarch64, 122 GB unificados), con unas 2 horas y 5 minutos por iteración y una velocidad de inferencia de aproximadamente 1 segundo por columna.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de caligrafía cursiva y semi-cursiva china en disposición vertical.
- Transcripción a chino tradicional, sin puntuación, carácter a carácter.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector visual de Qwen3-VL.
- Instrucción estricta anti-alucinación: el prompt de entrenamiento prohíbe completar poemas o textos conocidos y obliga a detenerse cuando los trazos no son legibles.
- Autocorrección iterativa: una segunda pasada con el texto de la primera como contexto reduce el CER de 27,5 % a 26,9 % según la model card.
- Integración con llama.cpp mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de decodificación greedy con temperatura 0 para resultados reproducibles.
- No se documentan capacidades de tool calling, agentes, audio ni otros idiomas distintos del chino.

## Casos de uso

- Digitalización de libros antiguos chinos: el modelo transcribe columnas verticales de manuscritos cursivos y devuelve texto tradicional plano, adecuado para alimentar un pipeline de indexación o búsqueda full-text sobre corpus de humanidades digitales.
- Cotejo asistido por humano en un taller de transcripción: la model card describe un flujo con dos lecturas alternativas por columna y selección con una tecla, aprovechando que el techo teórico (oráculo con 10 muestras) llega a CER 22,19 %; encaja en proyectos donde un paleógrafo revisa y corrige.
- Investigación filológica y lexicografía histórica: la salida sin puntuación y en tradicional facilita el alineamiento con diccionarios y la extracción de variantes gráficas de un mismo carácter.
- Archivística y museos: procesamiento por lotes de recortes de piezas catalogadas (la model card cita 301 piezas de museo usadas en entrenamiento) para generar borradores de transcripción revisables.
- Enriquecimiento de catálogos de colecciones privadas: con un despliegue local en llama.cpp y cuantización Q4_K_M, una institución puede transcribir lotes sin enviar imágenes a servicios en la nube.
- Docencia y aprendizaje de caligrafía: comparación entre la lectura del modelo y la del estudiante sobre el mismo recorte, usando la segunda pasada de autocorrección como ejemplo de razonamiento sobre trazos.
- Prototipado rápido de aplicaciones OCR de nicho: la API compatible con OpenAI permite integrar el modelo en una aplicación web existente cambiando solo el endpoint y enviando imágenes en base64.

## Benchmarks y rendimiento

Evaluación sobre `gold_test40`: 40 columnas verificadas manualmente, 331 caracteres, sin contaminación, decodificación greedy y la misma instrucción; métrica CER por columna mediante LCS.

| Modelo | Precisión de carácter | CER |
|---|---|---|
| Qwen3-VL-8B original (sin LoRA) | 64,4 % | 35,6 % |
| BiMai v16 | 72,2 % | 27,8 % |
| BiMai v23 (adaptador recomendado) | 72,5 % | 27,5 % |
| BiMai v23 + refinamiento en dos pasadas | no disponible | 26,9 % |
| Oráculo (mejor de 10 muestras por columna) | 77,8 % | 22,19 % |

Evolución de versiones documentada por el autor:

| Versión | CER | Precisión | Columnas de entrenamiento | Cambio |
|---|---|---|---|---|
| v8 | 34,7 % | 65,3 % | 1.215 | ajuste inicial |
| v13 | 29,6 % | 70,4 % | 1.965 | depuración de datos |
| v16 | 27,8 % | 72,2 % | 2.708 | corrección de rutas, primer uso del conjunto completo |
| v19 | 28,1 % | 71,9 % | 3.026 | 108 lecturas humanas añadidas |
| v21 | 28,1 % | 71,9 % | 3.026 | 114 correcciones sin efecto |
| v23 | 27,5 % | 72,5 % | 4.855 | +437 columnas sintéticas y +1.500 pares TTF |

## Requisitos de hardware

- VRAM estimada: la versión fusionada Q4_K_M ocupa 4,7 GB de pesos, más 1,1 GB del proyector visual F16; en la práctica se necesita un entorno con al menos 8-10 GB de memoria gráfica o unificada para dejar margen al contexto y a la imagen.
- GPU recomendadas: cualquier GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090); en el extremo alto, A100 o H100 para procesamiento por lotes. El autor entrenó en una NVIDIA Thor con 122 GB unificados.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M y el adaptador LoRA F16.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--mmproj` y `--lora`; también la versión fusionada sin LoRA. No se documentan recetas para vLLM, TGI u Ollama.
- Latencia y throughput: aproximadamente 1 segundo por columna en el hardware del autor; la pasada de refinamiento añade unos 5 segundos por columna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MochiOCR Chaosu v23 (este) | ~8B base + LoRA de 349 MB | no disponible | OCR de cursiva china clásica vertical | Apache-2.0 | GGUF en Hugging Face |
| Qwen3-VL-8B-Instruct | ~8B | no disponible | VLM generalista | Apache-2.0 | safetensors y GGUF |
| BiMai v16 (mismo autor) | ~8B base + LoRA de 175 MB | no disponible | OCR de cursiva, versión anterior | Apache-2.0 | GGUF en Hugging Face |
| BiMai v8 (mismo autor) | ~8B base + LoRA de 84 MB | no disponible | OCR de cursiva, versión inicial | Apache-2.0 | GGUF en Hugging Face |

No se dispone de datos en la información proporcionada sobre otros modelos especializados en OCR de caligrafía cursiva china con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La escritura en cursiva extrema (狂草) con trazos muy ligados eleva la tasa de error; el autor exige revisión humana obligatoria.
- No admite calcos de piedra (拓本) ni anotaciones interlineadas a doble columna.
- No está diseñado para texto impreso de libros antiguos: ese dominio queda fuera de su ámbito de entrenamiento.
- Riesgo de alucinación mitigado solo parcialmente por la instrucción de no completar poemas o textos famosos; el prompt debe reproducirse exactamente como se entrenó.
- El conjunto de evaluación es pequeño (40 columnas, 331 caracteres), por lo que las cifras de CER tienen un margen de error considerable.
- La salida es únicamente en chino tradicional, sin puntuación ni estructura; no ofrece detección de columnas ni segmentación de página.
- El identificador del repositorio remite a la versión v8, pero el adaptador recomendado es el v23: conviene verificar qué archivo se descarga antes de desplegar.
- No se documentan sesgos sociales específicos; el riesgo principal es la pérdida de información en trazos ambiguos.
- Licencia Apache-2.0 en los pesos, heredada de Qwen3-VL, y MIT en el código auxiliar: permite uso comercial, pero persisten las condiciones de la licencia del modelo base.
- El despliegue depende de llama.cpp con soporte de `--mmproj` y `--lora`; no hay garantías de compatibilidad con otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/mochiocr-caoshu-v8-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
