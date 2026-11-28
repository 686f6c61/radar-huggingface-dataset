# balllvin/SenseNova-Loop-9B-NVFP4-MLX

## Resumen

SenseNova-Loop-9B-NVFP4-MLX es la conversión a formato MLX affine 4-bit del modelo multimodal SenseNova-Loop-9B, un transformer híbrido con atención lineal y completa que emplea un esquema de ejecución en bucle ("looped execution") de 56 visitas efectivas por token. El modelo original lo desarrolla SenseNova y esta build la publica el usuario balllvin para su ejecución en Apple Silicon mediante la librería MLX, con un servidor compatible con la API de OpenAI incluido en el repositorio (`tools/serve.py`).

El modelo resuelve el problema de desplegar un modelo multimodal de 9B con contexto nativo de 512K tokens en hardware de consumo Apple, algo que las builds BF16 o NVFP4 para CUDA no permiten por requisitos de VRAM. La cuantización MLX affine 4-bit con `group_size=64` reduce los pesos del modelo de lenguaje a 7,97 GB y mantiene la torre de visión en BF16 (0,91 GB), totalizando 8,89 GB de pesos.

Es relevante porque combina tres elementos poco habituales en un mismo artefacto: arquitectura híbrida lineal/completa con bucle de capas, contexto de 512K tokens vía YaRN y soporte multimodal imagen-texto, todo empaquetado para inferencia local en Macs con Apple Silicon. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y completa, ejecución en bucle (56 visitas efectivas por token), 32 capas físicas con capas 4-27 repetidas 2x, 8 capas de atención completa y 24 de atención lineal, routers mHC de 2 flujos |
| Parametros totales | 3.119.461.248 (según safetensors); la model card indica "9B" como denominación comercial |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524.288 tokens (512K vía YaRN factor=2.0 sobre 262.144 nativos) |
| Tipos de cuantizacion | MLX affine 4-bit (group_size=64) con normas, embeddings y routers en BF16; torre de visión en BF16 sin cuantizar |
| Idiomas soportados | en (inglés) según la model card; no se detallan más idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `visual.safetensors` para la torre de visión |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que alterna capas de atención lineal con capas de atención completa (8 completas y 24 lineales sobre 32 capas físicas). La innovación principal es el esquema de ejecución en bucle: las capas 4 a 27 se ejecutan dos veces, de modo que cada token atraviesa 56 visitas efectivas a capas, incrementando la profundidad computacional sin aumentar el número de parámetros. Incorpora además routers mHC de dos flujos que gestionan el enrutamiento interno durante la ejecución repetida. El contexto nativo es de 262.144 tokens, extendido a 524.288 mediante YaRN con factor 2.0.

Los datos de entrenamiento no están detallados en la información disponible más allá de la referencia al dataset HuggingFaceFW/fineweb-edu en las etiquetas del repositorio. La model card menciona que esta build es un checkpoint "Base Quant (QAD)" —cuantización con destilación consciente de cuantización— portado directamente a MLX sin ablación ni ajuste Arete. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional y multimodal imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de imágenes mediante torre de visión BF16 (`visual.safetensors`).
- Contexto largo de hasta 512K tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Ejecución en bucle de 56 visitas por token, que aporta profundidad efectiva sin coste adicional de parámetros.
- Servidor compatible con la API de OpenAI incluido (`tools/serve.py`) para integración directa.
- Soporte de decodificación por lotes (1, 4 y 8 streams medidos).
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- No se documenta modo "thinking" ni capacidades de audio.
- Idiomas: inglés según la model card; no se detallan otras lenguas.

## Casos de uso

- **Asistente conversacional local en Mac:** el modelo puede gestionar conversaciones multi-turno con contexto de hasta 512K tokens en un Mac de 64 GB, gracias a la cuantización MLX 4-bit que reduce los pesos a 8,89 GB y deja margen para caché KV.
- **Análisis de documentos largos con imágenes:** la combinación de contexto de 512K y torre de visión permite procesar informes, contratos o artículos con figuras intercaladas en una sola pasada, sin truncar el contenido.
- **Prototipado de aplicaciones multimodales en Apple Silicon:** desarrolladores que quieran validar pipelines imagen-texto antes de desplegar en GPUs CUDA pueden usar esta build con el servidor OpenAI-compatible incluido, evitando reescribir la capa de integración.
- **Investigación sobre arquitecturas híbridas y ejecución en bucle:** el esquema de 56 visitas con capas lineales y completas es un objeto de estudio interesante para medir el equilibrio entre profundidad efectiva, coste de memoria y calidad, con métricas de WikiText NLL ya publicadas.
- **Despliegue con múltiples peticiones concurrentes:** con 8 streams agregados alcanza 38,1 tok/s en un M5 Pro, lo que permite servir varios usuarios ligeros desde una sola máquina para tareas de resumen o clasificación.
- **Evaluación de robustez y sesgos:** la disponibilidad de builds abliterated y con ajuste Arete en la misma familia permite comparar comportamiento de rechazo (95/99 frente a 3/99 y 6/99 en prompts dañinos) y usar la build base como referencia de alineamiento original.
- **Generación de código y texto técnico asistida:** aunque no se documenta tool calling, el modelo puede usarse para autocompletado y explicación de código en entornos locales donde la privacidad impide enviar datos a la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre la ruta forward BF16 decodificada de las builds NVFP4 (greedy, 96 tokens, thinking off):

| Build | Harmful refused | Benign refused | MMLU | WikiText NLL | Propaganda fact | Propaganda rate |
|---|---:|---:|---:|---:|---:|---:|
| NVFP4 Base (QAD) | 95 / 99 | 60 / 100 | 43,0 % | 2,7560 | 1,367 / 5 | 19,3 % |
| + Abliterated | 3 / 99 | 7 / 100 | 58,0 % | 2,7619 | 1,242 / 5 | 27,8 % |
| + Abliterated + Arete | 6 / 99 | 6 / 100 | 62,0 % | 2,7099 | 1,320 / 5 | 29,6 % |

Referencia BF16 del modelo base en WikiText NLL: 2,8198 / 2,8206. Las conversiones MLX heredan el comportamiento de pesos de la fuente NVFP4; las suites de rechazo y MMLU no se reejecutaron por separado sobre MLX.

Rendimiento medido en Apple M5 Pro (64 GB, 48 tokens de salida, KV 8-bit para 1 stream, KV BF16 para lotes):

| Configuración | Tamaño de pesos | Velocidad de decodificación | Notas |
|---|---:|---:|---|
| MLX 4-bit (1 stream) | 8,89 GB | 8,1 tok/s | KV 8-bit (7,97 GB LLM + 0,91 GB visión) |
| MLX 4-bit (4 streams agregados) | 8,89 GB | 25,9 tok/s | 6,5 tok/s por stream |
| MLX 4-bit (8 streams agregados) | 8,89 GB | 38,1 tok/s | 4,8 tok/s por stream |

## Requisitos de hardware

- **VRAM/memoria unificada:** pesos de 8,89 GB (7,97 GB LLM + 0,91 GB visión). En Mac de 64 GB con 51,8 GB usables se alcanzan 512K de contexto con 1 petición, 178K con 4 peticiones y 86K con 8 peticiones (KV BF16).
- **Caché KV:** 57.344 B/token en BF16 (medido en RTX PRO 6000) más 90,8 MB de estado de atención lineal por petición; `--kv-bits 8` reduce a la mitad el crecimiento de KV.
- **GPU recomendadas:** Apple Silicon (M-series con memoria unificada suficiente). La build hermana NVFP4 requiere GPUs NVIDIA CUDA con 24 GB o más de VRAM para la ruta BF16 decodificada.
- **¿Cabe en GPU de consumo?** En Apple Silicon sí (Mac de 64 GB probado). En GPUs NVIDIA de consumo no se documenta soporte para esta build MLX, que es específica de Apple.
- **Opciones de despliegue:** MLX con el servidor OpenAI-compatible incluido (`tools/serve.py`); la build NVFP4 hermana usa `transformers` con `load_nvfp4.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** 8,1 tok/s en 1 stream, 25,9 tok/s con 4 streams y 38,1 tok/s con 8 streams en M5 Pro de 64 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-NVFP4-MLX (este) | 3,12 B (denominado 9B) | 512K | Apache 2.0 | MLX 4-bit, Apple Silicon | Multimodal, ejecución en bucle, 8,89 GB |
| SenseNova-Loop-9B-NVFP4 | 3,12 B (denominado 9B) | 512K | Apache 2.0 | W4A16 NVFP4, NVIDIA CUDA | Misma arquitectura, requiere 24 GB+ VRAM |
| SenseNova-Loop-9B (BF16) | 3,12 B (denominado 9B) | 512K | Apache 2.0 | BF16, `transformers` | Modelo base sin cuantizar |
| SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX | 3,12 B (denominado 9B) | 512K | Apache 2.0 | MLX 4-bit, Apple Silicon | Variante sin rechazos y con ajuste Arete (MMLU 62,0 %) |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, familias Qwen, Llama o Gemma) en parámetros, contexto o benchmarks, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- **Sesgos y alineamiento:** la build base presenta 95/99 rechazos en prompts dañinos y 60/100 rechazos en prompts benignos, lo que indica un alineamiento agresivo que puede degradar la utilidad en tareas legítimas. Las variantes abliterated reducen el rechazo pero aumentan la tasa de propaganda (27,8 % y 29,6 % frente a 19,3 %).
- **Riesgo de alucinación:** no se han publicado métricas específicas de fidelidad factual más allá de la evaluación de propaganda; el MMLU base es 43,0 %, relativamente bajo.
- **Idioma:** la model card solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo base upstream puede tener términos adicionales que deben aceptarse (`sensenova/SenseNova-Loop-9B`).
- **Compatibilidad de hardware:** esta build es exclusiva de Apple Silicon vía MLX; no funciona en GPUs NVIDIA ni en CPU estándar sin conversión adicional.
- **Rendimiento:** 8,1 tok/s en un solo stream es bajo para aplicaciones interactivas exigentes; el throughput agregado mejora con lotes pero cae a 4,8 tok/s por stream con 8 peticiones.
- **Contexto efectivo:** aunque el contexto nativo es 512K, en Mac de 64 GB con 8 peticiones concurrentes baja a 86K; planificar el dimensionamiento en consecuencia.
- **Formato de cuantización:** MLX affine 4-bit con `group_size=64` puede introducir degradación adicional frente a BF16; las métricas de rechazo y MMLU no se reejecutaron sobre MLX, solo se heredan de la fuente NVFP4.
- **Madurez del ecosistema:** 0 likes y 409 descargas en el momento de la consulta; el soporte comunitario es limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4-MLX
- Build NVFP4 para NVIDIA: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Build abliterated NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Build abliterated + Arete NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Build abliterated + Arete MLX: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX
- Modelo base upstream: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Dataset de evaluación de propaganda (base): https://huggingface.co/datasets/balllvin/Propaganda-Eval-SenseNova-Loop-9B-NVFP4
- Dataset de evaluación de propaganda (abliterated): https://huggingface.co/datasets/balllvin/Propaganda-Eval-SenseNova-Loop-9B-abliterated-NVFP4
- Dataset de evaluación de propaganda (abliterated + Arete): https://huggingface.co/datasets/balllvin/Propaganda-Eval-SenseNova-Loop-9B-abliterated-arete-NVFP4
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
