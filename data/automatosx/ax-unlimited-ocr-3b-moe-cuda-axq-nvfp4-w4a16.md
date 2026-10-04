# AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-W4A16

# AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-W4A16 es una conversión cuantizada del checkpoint OCR multimodal baidu/Unlimited-OCR (3.336.106.240 parámetros, arquitectura MoE con codificador de visión), publicada por AutomatosX a través de su toolkit propietario AXQuant. El objetivo es reducir el coste de memoria y aumentar el rendimiento de inferencia en GPUs NVIDIA modernas aplicando cuantización NVFP4 de solo pesos (W4A16), manteniendo intactos los tensores sensibles a precisión como visión, routers, embeddings, normalización y LM head.

El modelo conserva la licencia MIT del original y se distribuye en safetensors con metadatos compressed-tensors, pensado para servirse con vLLM 0.25.1 o superior. Se trata de un development preview: el propio autor marca `runtime_verified=false` y `quality_certified=false`, y solo documenta una prueba de humo cualitativa sobre una página autogenerada, no una validación de calidad OCR.

Su relevancia actual radica en que es un ejemplo temprano de empaquetado NVFP4 para un modelo OCR multimodal con MoE, un régimen donde la cuantización W4A16 es interesante porque mantiene las activaciones en BF16 y evita el riesgo de degradación asociado a W4A4. Aun así, la falta de benchmarks y de adopción (0 descargas, 0 likes en el momento del análisis) obliga a tratarlo como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y torre de visión; conversión NVFP4 del checkpoint baidu/Unlimited-OCR |
| Parametros totales | 3.336.106.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16: pesos E2M1 FP4 con escalas de bloque E4M3FN (16 valores por bloque) y activaciones BF16; vision, routers, embeddings, normalizacion y LM head en BF16; cuantizacion de activaciones deshabilitada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (2.931.515.952 bytes, unos 2,93 GB / 2,73 GiB), compatible con vLLM y compressed-tensors |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado desde cero, sino una conversión de pesos. El checkpoint de partida es baidu/Unlimited-OCR, fijado en la revisión inmutable `07dea832e22aefee32ad281d4b80551282e1c168`, cuyo SHA-256 se verificó contra el objeto original del Hub. La conversión aplica round-to-nearest (RTN) con el encoder `numpy-reference` de AXQuant; el autor especifica explícitamente que no se emplea el algoritmo AWQ ni ningún checkpoint AWQ. El resultado son 2.602.844.160 parámetros empaquetados en NVFP4 distribuidos en 2.196 tensores, junto con 514 tensores protegidos que conservan su precisión de origen en BF16 y fueron verificados por dtype e igualdad de valores.

El esquema de cuantización afecta a proyecciones de atención, MLP y expertos individuales de la torre de lenguaje. Las proyecciones paralelas Q/K/V y gate/up comparten escalas globales para permitir la fusión en tiempo de ejecución. Los espacios de nombres de visión y audio conservan cargas BF16 y disponen de reglas de ignorado conservadoras, incluidas las envolturas de visión que renombran rutas `transformer` como `encoder`. El payload nominal es de 4,5 bits por valor seleccionado más una escala FP32 por matriz, aunque los tensores BF16 protegidos elevan el total de bits por parámetro del checkpoint. No hay información disponible sobre el dataset, el número de tokens o las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de imagen a texto, con pipeline `image-text-to-text` y prompt literal `<image>`.
- Extracción de texto estructurado en imágenes de documentos; en la prueba de humo incluida reconoce líneas como `AXQuant NVFP4`, `Invoice 12345` y `Total USD 42.50`.
- Procesamiento multimodal mediante torre de visión en BF16, separada de la parte cuantizada en NVFP4.
- Inferencia con backend NVFP4 nativo en vLLM mediante `MarlinNvFp4LinearKernel` y backend MARLIN NVFP4 para el MoE.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades adicionales (audio, thinking mode, decodificación especulativa): no disponible; solo se mencionan espacios de nombres de audio protegidos en BF16, sin confirmación de capacidad funcional.

## Casos de uso

- Digitalización de facturas y tickets: el modelo puede extraer campos como número de factura e importe total a partir de una imagen, tal y como demuestra la prueba de humo incluida; su esquema W4A16 reduce el coste de memoria frente al checkpoint BF16 para servir la tarea en GPUs de gama alta.
- Procesamiento por lotes de documentos escaneados: al ser un MoE de 3,34B servido con vLLM, encaja en pipelines de OCR masivo donde interesa throughput agregado más que la calidad absoluta de un único documento.
- Extracción de texto en formularios internos: apropiado para entornos con licencia MIT y datos no críticos, siempre que se valide la calidad con un conjunto propio antes de producción.
- Preprocesado para RAG sobre documentos escaneados: el texto extraído puede alimentar un índice vectorial; conviene verificar el comportamiento de fin de secuencia temprano antes de automatizarlo.
- Pruebas de integración de cuantización NVFP4: sirve como banco de pruebas para evaluar kernels Marlin y el backend NVFP4 MoE en vLLM sobre GPUs Blackwell.
- Investigación sobre degradación de OCR tras cuantización W4A16: permite comparar directamente contra el checkpoint BF16 de baidu/Unlimited-OCR con prompts y configuraciones idénticas.
- Despliegue en hardware embebido NVIDIA (por ejemplo, Thor): la prueba documentada con `memory-fraction` de 0,035 muestra que el modelo puede coexistir con otros servicios en memoria, aunque con sizing específico por carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni métricas OCR estándar (como CER/WER o precisión en OmniDocBench). La única evidencia cuantitativa es una prueba de humo de una sola página autogenerada en inglés:

| Prueba | GPU | Resultado |
|---|---|---|
| Carga NVFP4 nativa | GeForce RTX 5090 | Correcta |
| Reconocimiento de 3 lineas con min_tokens=16 | GeForce RTX 5090 | Las tres lineas presentes |
| Carga NVFP4 nativa | Thor | Correcta |
| Reconocimiento de 3 lineas con min_tokens=16 | Thor | Las tres lineas presentes |
| Control BF16 con min_tokens=16 | GeForce RTX 5090 | Las tres lineas reconocidas |
| Ejecucion con min_tokens=0 por defecto | GeForce RTX 5090 | Termina antes de producir el contenido (early-EOS) |

Los manifiestos del repositorio mantienen `runtime_verified=false` y `quality_certified=false`, por lo que esta evidencia no constituye una certificación de calidad ni de rendimiento.

## Requisitos de hardware

- Pesos: 2.931.515.952 bytes (aproximadamente 2,93 GB) en un único archivo safetensors; el tamaño del repositorio es de 2,9 GB.
- VRAM para inferencia: no se publica un mínimo oficial; el smoke test usó `--memory-fraction` de 0,30 en RTX 5090 y 0,035 en Thor. A esos pesos hay que sumar la KV cache, las activaciones BF16 y el codificador de visión, por lo que el sizing real depende del lote, la resolución de imagen y la longitud de salida.
- GPUs probadas: GeForce RTX 5090 y NVIDIA Thor, ambas con soporte NVFP4.
- GPUs recomendadas: cualquier NVIDIA con soporte NVFP4 (arquitecturas Blackwell y posteriores); en generaciones anteriores la carga NVFP4 nativa no está garantizada.
- GPU de consumo: sí, cabe en una RTX 5090 según la evidencia del autor; no hay datos para GPUs de consumo más modestas.
- Opciones de despliegue: vLLM 0.25.1 (imágenes oficiales `vllm/vllm-openai:v0.25.1` AMD64 y ARM64) con PyTorch 2.11.0+cu130 y CUDA 13.0. No se documentan otros runtimes como llama.cpp, Ollama o TGI.
- Kernels y backend: `MarlinNvFp4LinearKernel` y backend `MARLIN` NVFP4 MoE.
- Configuración del smoke test: sampling determinista, no-repeat n-gram 35/128, ejecución BF16, modo eager, Torch SDPA para el encoder de visión, atención Triton, una sola petición y chunked prefill deshabilitado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de pesos | Licencia | Contexto | Rendimiento OCR |
|---|---|---|---|---|---|---|
| AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-W4A16 | 3.336.106.240 | NVFP4 W4A16 (RTN) | 2,93 GB | MIT | no disponible | no certificado; solo smoke test |
| baidu/Unlimited-OCR | 3.336.106.240 | BF16 (original) | ~6,7 GB (estimado a 16 bits por parametro) | MIT | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre ambas variantes ni frente a otros modelos OCR. El único punto de comparación empírico es el smoke test, donde el control BF16 y la variante NVFP4 reconocieron las mismas tres líneas con `min_tokens=16`, y ambos mostraron comportamiento early-EOS con el mínimo de tokens por defecto.

## Limitaciones y advertencias

- Estado de development preview: los manifiestos declaran `runtime_verified=false` y `quality_certified=false`; no es una versión GA ni una certificación de calidad.
- La validación empírica se limita a una única página autogenerada en inglés con tres líneas; no hay pruebas con documentos reales, múltiples idiomas, tablas complejas ni imágenes de alta resolución.
- Comportamiento early-EOS conocido: con el mínimo de tokens por defecto (cero), la generación en RTX 5090 terminó antes de producir el contenido de la página. El control BF16 mostró el mismo comportamiento. Fijar `min_tokens=16` resolvió el caso concreto, pero el propio autor advierte que un mínimo de tokens es un ajuste de petición y no una garantía de precisión OCR.
- Riesgo de alucinación inherente a los modelos generativos de OCR: al sintetizar texto libre, puede inventar caracteres o campos ausentes, especialmente en documentos degradados.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe sin verificación previa.
- Restricciones de licencia: el modelo conserva licencia MIT, que permite uso comercial, pero se recomienda revisar la licencia del modelo base por si aplican condiciones adicionales sobre los pesos originales.
- Dependencia de hardware NVIDIA con soporte NVFP4; en GPUs sin esa capacidad la inferencia puede no funcionar.
- Ausencia total de adopción comunitaria (0 descargas, 0 likes) y de informes independientes de calidad.
- El repositorio incluye contenido con comportamiento de prompt literal (`<image>`, `Free OCR.`); es necesario respetar el formato exacto del prompt para reproducir los resultados.
- Existen nombres de espacios de audio con reglas de ignorado en BF16, pero no se confirma ninguna capacidad de audio funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Revision fijada del modelo base: `07dea832e22aefee32ad281d4b80551282e1c168`
- Imagenes de runtime oficiales: `vllm/vllm-openai:v0.25.1` (AMD64 y ARM64)
- Artefactos incluidos en el repositorio: `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `provenance.json`, `SHA256SUMS.txt`, `examples/ocr_smoke.py`, `development_runtime_smoke.json`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
