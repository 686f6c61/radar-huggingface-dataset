# elvinmarkmv/minimal-ai-models

## Resumen

`elvinmarkmv/minimal-ai-models` no es un modelo único, sino un catálogo de ocho modelos preconvertidos a un formato binario propio denominado `.miniai`. El objetivo del proyecto es ejecutar inferencia sin Python ni PyTorch en tiempo de ejecución: cada archivo `.miniai` es un contenedor autocontenido que empaqueta hiperparámetros de arquitectura, tokenizadores o fonemizadores, bancos de filtros Mel, tabla de directorio de tensores y los pesos alineados a 64 bytes en un único bloque contiguo. Los pesos se cargan por mapeo directo en memoria (`mmap`) y se alimentan a kernels vectorizados de CPU (AVX2+FMA o ARM NEON).

El catálogo cubre tareas muy distintas: generación de texto autoregresiva y conversacional (SmolLM2-135M y SmolLM2-135M-Instruct, GPT-2 base), reconocimiento automático de habla (Whisper tiny), texto a voz (Kokoro-82M), respuesta extractiva de preguntas (DistilBERT ajustado en SQuAD), embeddings de frases (all-MiniLM-L6-v2) y detección de objetos (YOLOS-tiny). El mayor de los modelos tiene 135 millones de parámetros y el menor ronda los 6 millones, con tamaños en disco que van de 9,4 MB a 299 MB.

La relevancia del proyecto es de ingeniería de despliegue más que de calidad de modelo: propone una alternativa de huella mínima frente a stacks tipo PyTorch o `transformers`, con cuantización en bloques Q8_0 que, según el autor, mantiene una correlación superior a 0,9999 frente a la referencia FP32 de PyTorch. Está publicado bajo licencia MIT, con idioma declarado inglés y descargas y likes a cero en el momento de la consulta, por lo que debe considerarse un proyecto incipiente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: LLaMA/SmolLM2 (SmolLM2-135M e Instruct), GPT-2 base, encoder-decoder Whisper tiny, DistilBERT, MiniLM/BERT, YOLOS (ViT) y Kokoro TTS (StyleTTS 2 + vocoder ISTFTNet) |
| Parametros totales | No disponible como cifra unica del repositorio; el mayor modelo individual es SmolLM2-135M (135 M de parametros). El resto: Kokoro-82M (82 M), DistilBERT (66 M), GPT-2 base (124 M), Whisper tiny (39 M), MiniLM-L6-v2 (22,7 M), YOLOS-tiny (6 M) |
| Parametros activos | No aplica: ninguna de las arquitecturas incluidas es MoE |
| Longitud de contexto | Hasta 8.192 tokens (SmolLM2-135M e Instruct), 1.024 tokens (GPT-2 base), 512 tokens (DistilBERT SQuAD), 448 posiciones de decoder y ventanas de audio de 30 s (Whisper tiny) |
| Tipos de cuantizacion | Q8_0 en bloques simetricos de 32 elementos con factor de escala en coma flotante de 32 bits (9 bits por elemento, ~70 % de reduccion de disco y ancho de banda). Capas sensibles (LayerNorm/RMSNorm, sesgos 1D, embeddings, pesos recurrentes y vectores de estilo de voz) se conservan en IEEE 754 float32 |
| Idiomas soportados | en (ingles), segun la etiqueta de idioma de la model card |
| Licencia | mit (el repositorio). Cada modelo base conserva su licencia original, que debe verificarse por separado |
| Formato de pesos | `.miniai`, contenedor binario propio de un solo archivo, derivado de pesos PyTorch/Safetensors. No es GGUF ni Safetensors |

Catalogo de archivos incluidos en el repositorio (tamano total del repo: 1,0 GB):

| Archivo | Modelo base | Tamano | Tarea | Especificaciones |
|---|---|---|---|---|
| `kokoro_82m_q8_0.miniai` | `hexgrad/Kokoro-82M` | 299 MB | Texto a voz 24 kHz en una sola pasada | 12 capas / 12 cabezas / 512 dimensiones, StyleTTS 2 + ISTFTNet, 6 voces, lexico G2P de 89k entradas embebido |
| `smollm2_135m_instruct_q8_0.miniai` | `HuggingFaceTB/SmolLM2-135M-Instruct` | 176 MB | Chat conversacional y asistente | 30 capas / 9 cabezas Q / 3 cabezas KV (GQA 3x), SwiGLU, RoPE (8k contexto), RMSNorm |
| `smollm2_135m_q8_0.miniai` | `HuggingFaceTB/SmolLM2-135M` | 176 MB | Completado de texto autoregresivo | 30 capas / 9 cabezas Q / 3 cabezas KV (GQA 3x), SwiGLU, RoPE (8k contexto), RMSNorm |
| `gpt2_q8_0.miniai` | `openai-community/gpt2` | 176 MB | Generacion de texto autoregresiva | 12 capas / 12 cabezas / 768 dimensiones, contexto 1.024, tokenizador BPE, KV cache persistente |
| `whisper_tiny_q8_0.miniai` | `openai/whisper-tiny` | 65 MB | Reconocimiento automatico de habla | 4 capas de encoder / 4 de decoder, 6 cabezas / 384 dimensiones, filtro Mel de 80 bandas y atencion cruzada integrados |
| `distilbert_squad_q8_0.miniai` | `distilbert/distilbert-base-cased-distilled-squad` | 70 MB | Respuesta extractiva de preguntas | 6 capas / 12 cabezas / 768 dimensiones, contexto 512, cabeza de extraccion de spans SQuAD |
| `minilm_l6_v2_q8_0.miniai` | `sentence-transformers/all-MiniLM-L6-v2` | 25 MB | Embeddings de frases y busqueda semantica | 6 capas / 12 cabezas / 384 dimensiones, tokenizador WordPiece, mean pooling, similitud coseno |
| `yolos_tiny_q8_0.miniai` | `hustvl/yolos-tiny` | 9,4 MB | Deteccion de objetos en imagen | 12 capas / 3 cabezas / 192 dimensiones, 100 consultas, 91 clases COCO, interpolacion bicubica 2D dinamica |

## Arquitectura y entrenamiento

Este repositorio no entrena modelos: distribuye conversiones de pesos ya entrenados por terceros. Las arquitecturas subyacentes son las de los modelos base, sin modificaciones estructurales declaradas. SmolLM2-135M e Instruct usan un transformer decoder-only tipo LLaMA con 30 capas, 9 cabezas de consulta y 3 cabezas de clave/valor (GQA con factor 3), activacion SwiGLU, embeddings rotatorios RoPE y normalizacion RMSNorm, con 8.192 tokens de contexto. GPT-2 base es un transformer decoder-only clasico de 12 capas y 768 dimensiones con contexto de 1.024. Whisper tiny es un transformer encoder-decoder con 4+4 capas de 384 dimensiones, filtro Mel de 80 bandas integrado y atencion cruzada. DistilBERT y MiniLM son encoders de 6 capas (768 y 384 dimensiones respectivamente). YOLOS-tiny es un ViT de 12 capas y 192 dimensiones con 100 consultas de deteccion. Kokoro-82M es un modelo TTS de 12 capas y 512 dimensiones basado en StyleTTS 2 con vocoder ISTFTNet y seis voces.

La innovacion tecnica esta en el formato de contenedor y en la cuantizacion, no en los modelos. El autor declara que la cuantizacion Q8_0 agrupa las matrices de pesos en bloques simetricos de 32 elementos con una escala FP32 por bloque, y que esto preserva una fidelidad numerica con correlacion R > 0,9999 frente a la referencia FP32 de PyTorch. Las capas sensibles a deriva numerica (escalas de LayerNorm y RMSNorm, sesgos 1D, embeddings, pesos recurrentes y vectores de estilo de voz) se mantienen en float32. El formato integra tokenizadores, fonemizadores, bancos de filtros Mel, tabla de directorio de tensores y pesos alineados a 64 bytes, de modo que el binario no necesita dependencias externas en tiempo de ejecucion. No se documentan en la informacion disponible los datasets, el numero de tokens de entrenamiento ni las etapas de RLHF o DPO de los modelos base; esos detalles corresponden a las model cards originales de SmolLM2, GPT-2, Whisper, Kokoro, MiniLM, DistilBERT y YOLOS.

## Capacidades

- Generacion de texto autoregresiva en ingles con SmolLM2-135M, SmolLM2-135M-Instruct y GPT-2 base, con KV cache persistente en el caso de GPT-2.
- Conversacion multi-turno y formato de asistente con la variante Instruct de SmolLM2, con 8.192 tokens de contexto.
- Reconocimiento automatico de habla en ingles con Whisper tiny, incluyendo la extraccion de caracteristicas Mel dentro del propio contenedor.
- Sintesis de voz a 24 kHz en una sola pasada con Kokoro-82M, con seis voces y conversion grafema-fonema integrada mediante un lexico de 89.000 entradas.
- Respuesta extractiva de preguntas sobre un pasaje de hasta 512 tokens con DistilBERT ajustado en SQuAD.
- Generacion de embeddings de frases y similitud coseno para busqueda semantica con all-MiniLM-L6-v2.
- Deteccion de objetos sobre imagen con YOLOS-tiny, con 100 consultas y 91 clases COCO, a resolucion variable mediante interpolacion bicubica 2D.
- Ejecucion sin Python ni PyTorch en tiempo de ejecucion, con carga por `mmap` y kernels vectorizados AVX2+FMA o ARM NEON.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso tipo agente, modo de razonamiento explicito (thinking mode), vision-lenguaje combinada ni capacidades multimodales integradas mas alla de las tareas especificas listadas.

## Casos de uso

- Asistentes de texto embebidos en dispositivos sin sistema operativo completo: SmolLM2-135M-Instruct ocupa 176 MB en disco y se carga por `mmap`, lo que permite integrarlo en binarios C para terminales de punto de venta, paneles industriales o electrodomesticos con CPU ARM y NEON, evitando desplegar un runtime de Python.
- Autocompletado local en editores de codigo o campos de formulario: GPT-2 base o SmolLM2-135M pueden generar continuaciones de texto en ingles con contexto de 1.024 y 8.192 tokens respectivamente, manteniendo el KV cache entre pulsaciones de tecla para reducir la latencia percibida.
- Transcripcion de audio en el borde: Whisper tiny (65 MB) con filtro Mel embebido permite transcribir fragmentos de hasta 30 segundos en grabadoras, auriculares o dispositivos de accesibilidad sin enviar audio a un servicio externo, lo que simplifica el cumplimiento de normativa de privacidad.
- Lectura en voz alta de documentos y avisos: Kokoro-82M genera voz a 24 kHz con seis voces distintas y un lexico G2P integrado, adecuado para sistemas de anuncios en transporte publico, kioscos o aplicaciones de accesibilidad que necesitan funcionar sin conexion.
- Busqueda semantica y deduplicacion de documentos en local: all-MiniLM-L6-v2 (25 MB) produce embeddings de 384 dimensiones y similitud coseno, suficiente para indexar y recuperar articulos, tickets de soporte o correos dentro de un mismo proceso en C.
- Extraccion de respuestas en bases de conocimiento: DistilBERT ajustado en SQuAD permite responder preguntas factuales sobre un pasaje de hasta 512 tokens, por ejemplo en manuales tecnicos o condiciones contractuales embebidos en una aplicacion de escritorio.
- Control de calidad visual en linea de produccion: YOLOS-tiny (9,4 MB) detecta objetos de las 91 clases COCO sobre imagenes de camara industrial a resolucion variable, con un coste de memoria minimo que permite ejecutarlo en el mismo equipo que captura la imagen.
- Construccion de canalizaciones multimodales ligeras: la combinacion de Whisper tiny para transcribir, MiniLM para indexar el texto y Kokoro para responder por voz permite montar un asistente de voz completamente offline con menos de 400 MB de peso total en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento aportado por el autor es la fidelidad de la cuantizacion: correlacion R > 0,9999 entre las salidas del contenedor Q8_0 y la referencia FP32 de PyTorch, ademas de la afirmacion de una reduccion de disco y de ancho de banda de memoria de aproximadamente el 70 %. No se aportan cifras de MMLU, HumanEval, GSM8K, WER, mAP, MOS ni latencias medidas.

## Requisitos de hardware

- Naturaleza de la ejecucion: el proyecto no menciona backend de GPU. Los kernels descritos son vectorizados de CPU (AVX2+FMA en x86-64, ARM NEON en ARM), por lo que el hardware objetivo son CPU modernas, no aceleradores.
- VRAM: no aplica en la configuracion descrita. La memoria necesaria es RAM del sistema.
- Memoria RAM estimada por modelo (pesos en disco mas margen de trabajo para activaciones y KV cache, estimacion a partir del tamano de archivo declarado):
  - SmolLM2-135M e Instruct: 176 MB de pesos; con KV cache en FP16 a 8.192 tokens de contexto (30 capas, 3 cabezas KV) se estima un consumo adicional de aproximadamente 180 MB, lo que situa el total en torno a 350-400 MB.
  - GPT-2 base: 176 MB de pesos; el KV cache a 1.024 tokens (12 capas, 12 cabezas, 64 dimensiones de cabeza) anade del orden de 37 MB.
  - Kokoro-82M: 299 MB de pesos, que incluyen el lexico G2P y los vectores de estilo de las seis voces.
  - Whisper tiny: 65 MB de pesos, mas el buffer de caracteristicas Mel para ventanas de 30 segundos.
  - DistilBERT SQuAD: 70 MB. MiniLM-L6-v2: 25 MB. YOLOS-tiny: 9,4 MB.
- GPU recomendadas: no disponible. Al no existir backend GPU documentado, no procede recomendar A100, H100 ni RTX 4090 para esta implementacion. Cualquier GPU quedaria sin utilizar salvo que se implemente un backend propio.
- Cabe en GPU de consumo: no aplica. Cabe holgadamente en CPU de consumo, incluidas placas de un solo board tipo Raspberry Pi, siempre que el procesador disponga de extensiones NEON.
- Opciones de despliegue: el runtime propietario `miniai` para ejecutar archivos `.miniai`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, whisper.cpp ni TensorRT-LLM, dado que el formato de pesos es propio y no GGUF ni Safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa natural no es contra otros modelos, sino contra los mismos modelos base servidos con runtimes de C/C++ ya establecidos. La tabla siguiente contrasta el enfoque del repositorio con las alternativas mas extendidas para el caso mas representativo, SmolLM2-135M.

| Criterio | `miniai` (SmolLM2-135M Q8_0) | llama.cpp / GGUF (SmolLM2-135M Q8_0) | `transformers` en PyTorch (SmolLM2-135M) |
|---|---|---|---|
| Formato de pesos | `.miniai` propietario | GGUF | Safetensors |
| Dependencias en ejecucion | Ninguna (C puro) | Runtime C/C++ | Python, PyTorch, `transformers` |
| Cuantizacion | Q8_0 por bloques de 32 con escala FP32; capas sensibles en FP32 | Q8_0 y otras variantes | FP32/BF16/FP16 sin cuantizar por defecto |
| Tamano en disco | 176 MB | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Aceleracion por GPU | No documentada | Backends CUDA, Metal, Vulkan, ROCm | CUDA, ROCm, MPS |
| Ecosistema y madurez | Proyecto nuevo, 0 descargas y 0 likes | Muy amplio y con amplia validacion | Estandar de facto |
| Licencia del artefacto | MIT (repositorio); la del modelo base aplica aparte | MIT del runtime; licencia del modelo base aparte | Apache-2.0 del runtime; licencia del modelo base aparte |

Para el resto de tareas del catalogo, las alternativas equivalentes serian whisper.cpp frente a Whisper tiny, ONNX Runtime o `sentence-transformers` en Python frente a MiniLM y DistilBERT, y TensorFlow Lite o NCNN frente a YOLOS-tiny. No se dispone de datos de rendimiento comparativos publicados por el autor para ninguna de estas alternativas, por lo que la comparativa se limita a formato, dependencias y madurez.

## Limitaciones y advertencias

- Validacion practicamente nula: el repositorio registra 0 descargas y 0 likes, sin discusion, evaluaciones externas ni resultados de benchmarks publicados. Cualquier uso en produccion deberia acompanarse de una evaluacion propia.
- Tamano muy reducido de los modelos: SmolLM2-135M, GPT-2 base y el resto de modelos del catalogo son de gama minima. La calidad de generacion, el razonamiento y el conocimiento factual estaran muy por debajo de modelos actuales de miles de millones de parametros. El riesgo de alucinacion en tareas generativas y de respuesta a preguntas es alto.
- Idioma: la etiqueta de idioma declarada es unicamente `en`. No hay evidencia de soporte de castellano ni de otras lenguas en el catalogo, salvo el comportamiento residual de los modelos base.
- Capacidades ausentes: no se documenta tool calling, function calling, uso de agentes, modo de razonamiento explicito, vision-lenguaje combinada ni audio-lenguaje. Las tareas estan compartimentadas por archivo.
- Compatibilidad ecosistema: al usar un formato propietario, los artefactos no son directamente utilizables en vLLM, llama.cpp, Ollama, TGI ni en `transformers` sin reconvertir desde los pesos originales. Esto crea dependencia del runtime `miniai` y de su mantenimiento.
- Requisitos de CPU: los kernels descritos requieren AVX2+FMA en x86-64 o NEON en ARM. Procesadores antiguos sin estas extensiones pueden no ser compatibles o degradar el rendimiento, aunque la informacion disponible no detalla la ruta de fallback.
- Licencia: el repositorio se declara MIT, pero los pesos derivan de ocho modelos base con licencias propias (entre ellas Apache-2.0 y MIT segun el modelo). Antes de un uso comercial es obligatorio verificar la licencia de cada modelo base por separado, especialmente si se redistribuyen los contenedores.
- Fechas del repositorio: creado y actualizado el 10 de septiembre de 2026, con historial muy corto que impide evaluar su mantenimiento a medio plazo.
- La cuantizacion Q8_0 degrada la fidelidad numerica respecto a FP32 aunque el autor reporte R > 0,9999. Esta cifra es una afirmacion del autor y no ha sido verificada de forma independiente. El comportamiento con contextos largos y con cuantizacion de las capas declaradas como sensibles no esta documentado.
- La busqueda web realizada no devolvio resultados relevantes sobre este repositorio: todos los resultados corresponden a tiendas de productos de tratamiento de agua y no guardan relacion con el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/elvinmarkmv/minimal-ai-models
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Modelo base Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Modelo base all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo base DistilBERT SQuAD: https://huggingface.co/distilbert/distilbert-base-cased-distilled-squad
- Modelo base YOLOS-tiny: https://huggingface.co/hustvl/yolos-tiny
- Paper, blog, repositorio de codigo del runtime `miniai` y demos: no disponibles en la informacion proporcionada.
