# MultiverseComputingCAI/Comet_60B_A12B_NVFP4

## Resumen

Comet 60B es un modelo multimodal de tipo image-text-to-text desarrollado por Multiverse Computing mediante su técnica de compresión CompactifAI, aplicada sobre el modelo base NVIDIA Nemotron 3.5 Super VL 120B A12B. El modelo original es un Mixture-of-Experts híbrido Mamba2-Transformer de 124,5 mil millones de parámetros con unos 12,8 mil millones activos por token; Comet lo reduce a 61,1 mil millones totales manteniendo aproximadamente 12,3 mil millones activos por token, con la misma estructura de capas, tokenizador y plantilla de chat. La versión NVFP4 que nos ocupa ocupa 40,5 GB en disco y está pensada para GPUs NVIDIA Blackwell.

La propuesta de valor es clara: la mitad de memoria y un despliegue más rápido que el modelo original. El checkpoint BF16 pasa de unos 249 GB a 122,3 GB, lo que permite ejecutarlo en 2× H200 en lugar de 4; la variante NVFP4 cabe en una sola GPU Blackwell. Según el autor, sobre la misma configuración de 4× H200 el modelo sirve entre un 20 y un 23 % más de tokens de salida por segundo que Nemotron 3.5 Super en trazas de chat y agentes, y la versión FP8 en 2× H200 entrega unas 1,8 veces el throughput por GPU del original.

El modelo acepta texto, imagen y vídeo como entrada y produce texto, con ventana de contexto evaluada de 262.144 tokens (la configuración admite hasta 1.048.576 posiciones, aunque no se evaluaron contextos mayores). Incluye control de razonamiento configurable, tool calling y decodificación especulativa MTP. Está publicado bajo licencia OpenMDW 1.1 y solo declara inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con Mixture-of-Experts latente (88 capas: 40 Mamba2, 40 MoE, 8 de atención; hidden size 4.096; expertos en espacio latente de 1.024 dimensiones) |
| Parametros totales | 61,1 mil millones (58,9B language model, 1,4B MTP, 0,8B encoder de visión y proyector); el checkpoint safetensors del repo declara 34.621.879.580 parámetros almacenados |
| Parametros activos | 12,3 mil millones por token (22 de 256 expertos enrutados por capa MoE más 1 experto compartido; incluye embeddings y cabeza de salida) |
| Longitud de contexto | 262.144 tokens evaluados; configuración hasta 1.048.576 posiciones (no evaluado) |
| Tipos de cuantizacion | NVFP4 mixto (NVFP4/FP8/BF16) en esta versión; también disponibles BF16 y FP8 en repos separados |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement 1.1 (pesos); código del modelo bajo Apache 2.0 |
| Formato de pesos | safetensors (transformers, modelopt_mixed, 8-bit) |

## Arquitectura y entrenamiento

Comet 60B conserva la arquitectura del checkpoint base: un transformer híbrido con 40 capas Mamba2, 40 capas MoE y 8 capas de atención, hidden size de 4.096 y expertos que operan en un espacio latente de 1.024 dimensiones. El encoder de visión es un RADIO ViT-H/16 de 32 capas y se mantiene una capa de multi-token prediction (MTP), que habilita decodificación especulativa. La compresión CompactifAI reduce el número de expertos enrutados de 512 a 256 por capa MoE, manteniendo 22 activos más uno compartido, lo que rebaja los parámetros totales de 124,5B a 61,1B sin alterar la estructura de capas, el tokenizador ni la plantilla de chat.

Tras la compresión, el modelo fue "curado" mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset de destilación. La versión NVFP4 sigue el layout de cuantización mixta de NVIDIA Nemotron 3.5 Super NVFP4, combinando NVFP4, FP8 y BF16 según la sensibilidad de cada componente. El modelo mantiene los mismos parsers de razonamiento y tool calling de vLLM que el base, junto con la decodificación especulativa MTP.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking/reasoning control).
- Entrada multimodal: texto, imagen y vídeo; salida únicamente de texto (sin audio).
- Tool calling / function calling, con parsers compatibles con vLLM heredados del modelo base.
- Soporte de agentes y razonamiento multi-paso, con mejoras declaradas en benchmarks agenticos frente al original.
- Comprensión de documentos e imágenes, con rendimiento cercano al base en la mayoría de benchmarks de imagen, documento y vídeo.
- Capacidades de código y matemáticas heredadas del modelo base (evaluadas en SWE-bench Verified y SWE-bench Pro).
- Decodificación especulativa MTP para acelerar la inferencia.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Atención al cliente automatizada: la ventana de 262.144 tokens evaluados permite gestionar conversaciones multi-turno con historial extenso y adjuntar capturas o documentos del cliente para resolver incidencias sin perder contexto.
- Agentes de ingeniería de software: con soporte de tool calling y buen rendimiento declarado en SWE-bench Pro, puede integrarse en pipelines de CI/CD para triaje de issues, generación de parches y revisión automatizada de código.
- Análisis de documentos con imagen: extracción y razonamiento sobre facturas, contratos o informes escaneados, combinando el encoder ViT con el modo de razonamiento para responder preguntas sobre el contenido.
- Procesamiento de vídeo para moderación o catalogación: al aceptar vídeo como entrada, permite describir, etiquetar o detectar contenido relevante en fragmentos, con salida de texto estructurada.
- Automatización de flujos empresariales (retail, aerolíneas, telecom): los resultados declarados en τ²-Bench en esos dominios lo hacen adecuado para agentes que ejecutan reservas, cancelaciones o consultas de cuenta mediante APIs.
- Despliegue en infraestructura limitada: la versión NVFP4 de 40,5 GB cabe en una sola GPU Blackwell con contexto completo, lo que facilita servir el modelo en entornos con menos GPUs que el modelo original.
- Asistentes de razonamiento con control de coste: el modo de pensamiento configurable permite activar razonamiento profundo solo cuando se necesita y usar respuestas directas en el resto de peticiones.

## Benchmarks y rendimiento

La model card indica que Comet 60B supera al modelo original en τ²-Bench (airline, retail y telecom), AutomationBench-AA y SWE-bench Pro, y que se mantiene a menos de 3 puntos en 28 de 35 métricas, incluyendo GPQA Diamond, AA-LCR, SWE-bench Verified y la mayoría de benchmarks de imagen, documento y vídeo. Sin embargo, no se proporcionan los valores numéricos concretos de estos benchmarks en la información disponible.

| Metrica | Resultado |
|---|---|
| GPQA Diamond | no disponible (dentro de 3 puntos del base según el autor) |
| AA-LCR | no disponible (dentro de 3 puntos del base según el autor) |
| SWE-bench Verified | no disponible (dentro de 3 puntos del base según el autor) |
| SWE-bench Pro | no disponible (superior al base según el autor) |
| τ²-Bench (airline, retail, telecom) | no disponible (superior al base según el autor) |
| AutomationBench-AA | no disponible (superior al base según el autor) |
| Throughput en 4× H200 | 20–23 % más tokens de salida por segundo que Nemotron 3.5 Super |
| Throughput FP8 en 2× H200 | ~1,8× el throughput por GPU del original |

## Requisitos de hardware

- VRAM para NVFP4: 40,5 GB de pesos; cabe en una sola GPU NVIDIA Blackwell con contexto completo de 256K.
- VRAM para FP8: 66,3 GB de pesos; una sola H200 con contexto completo (61 GiB de pesos y caché KV para unas 20 peticiones concurrentes de 256K medidas).
- VRAM para BF16: 122,3 GB; 2× H200 (141 GB) con contexto completo (58 GiB de pesos por GPU y caché KV para unas 43 peticiones concurrentes de 256K medidas).
- GPUs recomendadas: H200 para BF16 y FP8; GPUs Blackwell para NVFP4.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el tamaño mínimo de pesos (40,5 GB en NVFP4) excede la VRAM de las RTX 4090 (24 GB) y no se documenta soporte para GPUs de consumo.
- Opciones de despliegue: vLLM con los mismos parsers de razonamiento y tool calling del modelo base, decodificación especulativa MTP; transformers como librería declarada.
- Latencia y throughput: 20–23 % más tokens de salida por segundo que el base en 4× H200; ~1,8× throughput por GPU con FP8 en 2× H200. No se publican valores absolutos de latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comet 60B (NVFP4) | 61,1B | 12,3B | 262.144 evaluados (hasta 1.048.576 en config) | OpenMDW 1.1 | Hugging Face (BF16, FP8, NVFP4) |
| NVIDIA Nemotron 3.5 Super VL 120B A12B (base) | 124,5B | 12,8B | no disponible en la información | no disponible en la información | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: Comet reduce a la mitad los parámetros totales manteniendo los activos por token, con mejor throughput y resultados agenticos superiores según el autor, a costa de una ligera pérdida (menos de 3 puntos) en la mayoría de benchmarks restantes.

## Limitaciones y advertencias

- Solo declara soporte de inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a los modelos generativos; no se publican tasas de alucinación ni evaluaciones específicas de factualidad.
- La compresión puede introducir degradación en tareas no cubiertas por los benchmarks del autor; la model card solo garantiza cercanía al base en 28 de 35 métricas.
- Contextos superiores a 262.144 tokens no fueron evaluados, aunque la configuración los permita.
- La licencia OpenMDW 1.1 permite uso comercial según la model card, pero es un modelo derivado de NVIDIA Nemotron y está sujeto a los términos de dicha licencia; conviene revisar sus condiciones antes de producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad detalladas en la información disponible.
- La versión NVFP4 requiere hardware NVIDIA Blackwell; no es desplegable en GPUs Hopper o anteriores.
- El número de parámetros almacenados en safetensors (34,6B) difiere del total declarado (61,1B), coherente con el empaquetado de cuantización, pero conviene verificarlo al cargar los pesos.

## Enlaces

- Modelo en Hugging Face (NVFP4): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_NVFP4
- Versión BF16: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Versión FP8: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_FP8
- Modelo base NVIDIA Nemotron 3.5 Super VL 120B A12B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
