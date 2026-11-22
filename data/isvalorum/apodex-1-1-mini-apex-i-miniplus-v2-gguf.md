# IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2-GGUF

## Resumen

Apodex-1.1-mini APEX-I-MiniPlus V2 es una cuantizacion GGUF personalizada del modelo multimodal apodex/Apodex-1.1-mini, publicada por el usuario independiente IsValorum. El modelo base es un transformer de tipo MoE (mezcla de expertos) con arquitectura etiquetada como qwen35moe, 35.505.251.456 parametros totales y capacidad image-text-to-text, es decir, procesa imagenes y texto conjuntamente. Esta version concreta no es el modelo original, sino un empaquetado de pesos cuantizados en formato GGUF para inferencia local con llama.cpp.

La relevancia de esta ficha radica en que el repositorio documenta una receta de cuantizacion tensor a tensor orientada a preservar la calidad en modelos MoE de razonamiento profundo: mantiene las puertas del router en F32 sin comprimir, la cabeza de salida de tokens en Q6_K, las puertas de atencion en Q8_0 y los expertos centrales en 3 bits calibrados (IQ3_S / IQ4_NL). Ademas incluye un proyector de vision Q8_0 empaquetado y soporte declarado de multi-token prediction (MTP) para decodificacion especulativa.

El autor indica que esta edicion V2 es una variante heredada y recomienda su version V2.1 para la mayoria de despliegues, especialmente para ejecucion con streaming desde RAM del sistema. El repositorio ocupa 15,6 GB y acumula 699 descargas, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta qwen35moe) con soporte de vision (image-text-to-text) |
| Parametros totales | 35.505.251.456 (aprox. 35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 256K tokens segun la model card (referida a la familia MiniPlus; confirmar en el modelo base) |
| Tipos de cuantizacion | GGUF mixta tensor a tensor: F32 (router gates), Q6_K (cabeza de salida), Q8_0 (puertas de atencion y proyector de vision mmproj), IQ3_S + IQ4_NL (expertos compartidos en capas de borde), IQ3_XXS/IQ3_S (expertos de razonamiento) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision mmproj Q8_0 incluido |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y torre de vision, disenado para entrada image-text-to-text. La model card etiqueta la arquitectura como qwen35moe, lo que sugiere una variante derivada de la familia Qwen con 35B parametros totales. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base; estos datos no estan disponibles en la informacion proporcionada.

La innovacion principal de este repositorio es la receta de cuantizacion, no el entrenamiento. Se aplica una asignacion de precision por tensor: las puertas del router se mantienen en F32 para no degradar el enrutamiento de expertos, la cabeza de salida se protege en Q6_K para evitar errores de sintaxis y corchetes en codigo, las proyecciones de atencion suben a Q8_0 y los expertos centrales se mantienen en 3 bits calibrados. Se declara soporte de multi-token prediction (MTP) para decodificacion especulativa y se incluye un proyector de vision Q8_0 separado para la torre multimodal.

## Capacidades

- Generacion de texto y razonamiento multi-paso, orientado a tareas de razonamiento profundo segun la receta de cuantizacion descrita.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), incluyendo lectura de figuras cientificas y diagramas moleculares segun la model card.
- Generacion de codigo, con proteccion especifica de la cabeza de salida para reducir errores de sintaxis en cuantizaciones agresivas.
- Decodificacion especulativa mediante multi-token prediction (MTP).
- Capacidades multilingues en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Soporte de contexto largo, con ventanas declaradas de hasta 256K tokens en la familia MiniPlus.
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de literatura cientifica y biomedica: el modelo puede procesar documentos extensos de hasta 256K tokens junto con figuras y diagramas, apoyandose en el proyector de vision Q8_0 para interpretar graficos y esquemas moleculares.
- Inferencia local en estaciones de trabajo sin GPU de gran VRAM: la receta esta disenada para ejecucion total o parcial en RAM del sistema (DDR4/DDR5), con tasas declaradas de 20 a 45 tok/s segun el hardware.
- Asistencia de codigo en entornos con recursos limitados: la proteccion de la cabeza de salida en Q6_K y de las puertas de atencion en Q8_0 reduce los fallos de sintaxis tipicos de cuantizaciones de 3 bits, lo que lo hace util para autocompletado y generacion de funciones en IDE locales.
- Procesamiento multilingue de documentos: con soporte para 13 idiomas, puede emplearse en traduccion, resumen y extraccion de informacion de corpus heterogeneos.
- Razonamiento sobre imagenes tecnicas: lectura de diagramas, capturas de pantalla o planos combinados con preguntas en lenguaje natural, gracias a la torre de vision integrada.
- Despliegue en portatiles con llama.cpp: el autor documenta benchmarks en equipos con DDR4 y DDR5, lo que permite ejecutar el modelo en portatiles de gama alta sin GPU dedicada de gran capacidad.
- Experimentacion e investigacion de tecnicas de cuantizacion: el repositorio detalla la asignacion de precision por tensor, lo que lo convierte en material de referencia para estudiar el impacto de la cuantizacion mixta en modelos MoE.

## Benchmarks y rendimiento

La model card incluye datos de perplejidad para la edicion V2.1, no para esta V2. Se recogen a continuacion los unicos datos numericos publicados en la informacion disponible.

| Metrica | Resultado | Contexto |
|---|---|---|
| Perplejidad WikiText-2 (V2.1) | 5,7073 ± 0,1373 | ΔPPL aprox. +0,07 frente al baseline sin cuantizar (aprox. 5,64) |
| Tamano V2.1 | aprox. 14,7 GB | Equiparable a Q3_K_M en huella, con fidelidad de Q5_K/Q6_K |
| Throughput streaming en RAM (V2.1) | +24 a 28+ tok/s | Con offload a RAM del sistema, sin bloqueos AVX2 |
| Throughput general en RAM | 20 a 45 tok/s | Segun procesador y configuracion DDR4/DDR5 |
| Contexto completo en VRAM | 256K tokens en 24 GB | Afirmacion del autor para la familia MiniPlus |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 15,6 GB; la edicion V2.1 equivalente ocupa aprox. 14,7 GB. Con el proyector de vision Q8_0 adicional, el consumo en GPU se situa por encima de los 15 GB si se carga todo en VRAM.
- GPU recomendadas: el autor afirma que el contexto completo de 256K cabe en 24 GB de VRAM, lo que apunta a RTX 3090, RTX 4090, A100 40 GB, H100 o superiores. No se detallan modelos concretos en la informacion proporcionada.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) segun la afirmacion del autor sobre contexto completo en VRAM. En tarjetas de 16 GB requeriria offload parcial a RAM.
- Opciones de despliegue: llama.cpp es el runtime principal. La model card menciona compatibilidad con endpoints. No se confirma soporte de vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 20 a 45 tok/s en inferencia total o parcial desde RAM del sistema, segun procesador y memoria (DDR4/DDR5). La edicion V2.1 declara +24 a 28+ tok/s en streaming por RAM tras eliminar bloqueos de dequantizacion AVX2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Apodex-1.1-mini APEX-I-MiniPlus V2 (este) | 35,5 B (MoE) | hasta 256K | GGUF mixto | Apache 2.0 | Receta tensor a tensor, vision Q8_0, MTP |
| Apodex-1.1-mini APEX-I-MiniPlus V2.1 | 35,5 B (MoE) | hasta 256K | GGUF mixto | Apache 2.0 | Recomendada por el autor; PPL 5,7073; expertos de borde en Q3_K |
| Apodex-1.1-mini (base, sin cuantizar) | 35,5 B (MoE) | no disponible | safetensors | no disponible | Baseline de referencia; PPL aprox. 5,64 en WikiText-2 |
| Cuantizaciones APEX-I-Mini genericas de la comunidad | 35,5 B (MoE) | hasta 256K | GGUF plano 2-3 bits | Apache 2.0 | Expertos en IQ2_S, cabeza en Q3_K_M; el autor advierte de degradacion severa |

No se dispone de comparativas con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Esta es una cuantizacion de 3 bits en los expertos centrales: aunque la receta protege router, cabeza y atencion, existe perdida de calidad frente al modelo sin cuantizar (ΔPPL aprox. +0,07 en la V2.1; no se publica el dato para V2).
- El autor recomienda explicitamente la edicion V2.1 sobre esta V2 para practicamente todos los despliegues; la V2 se mantiene por transparencia arquitectonica.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El rendimiento depende fuertemente de la memoria y el procesador: en configuraciones DDR4 lentas el throughput puede caer al extremo inferior del rango declarado (20 tok/s).
- Las afirmaciones sobre contexto de 256K en 24 GB de VRAM y sobre tasas de 20 a 45 tok/s provienen del autor y no se acompanan de metodologia detallada en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base apodex/Apodex-1.1-mini, que no se detalla en la informacion proporcionada.
- No se confirma soporte de tool calling ni de agentes multi-paso; verificar antes de usarlo en pipelines de produccion que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2-GGUF
- Edicion recomendada V2.1: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
