# AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-FP8-6bit

## Resumen

AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-FP8-6bit es un checkpoint cuantizado del modelo baidu/Unlimited-OCR (revisión inmutable 07dea832e22aefee32ad281d4b80551282e1c168), publicado por AutomatosX bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una conversión del peso original en BF16 mediante cuantización round-to-nearest (RTN) con la herramienta AXQuant, que mezcla matrices de 4 bits NVFP4 y de 8 bits FP8 E4M3 dentro de un mismo checkpoint para alcanzar lo que el autor denomina "clase de presupuesto de 6 bits" en CUDA. El repositorio ocupa 3,50 GB y contiene 2.675.503.360 parámetros reales según los safetensors.

El modelo es multimodal de tipo image-text-to-text y está orientado a OCR sin límite de longitud de página declarado en el nombre. La arquitectura es un transformer con mezcla de expertos (MoE) que reutiliza las proyecciones de atención de tipo DeepseekV2, e incorpora un vision tower, enrutadores, embeddings, normas y cabeza de lenguaje que se mantienen en BF16 sin cuantizar. La distribución de precisión es explícita: 1.152 tensores en NVFP4 (1,321.000 millones de parámetros), 1.044 tensores en FP8 E4M3 (1,282.000 millones, cerca del 49,2 % del tronco cuantizado) y 514 tensores protegidos en BF16 (0,733.000 millones).

La relevancia actual del checkpoint es fundamentalmente técnica: demuestra que es posible empaquetar dos familias de precisión (NVFP4 y FP8) bajo una única configuración de `compressed-tensors` y cargarlas en vLLM 0.25.1 sobre GPUs NVIDIA Blackwell y Thor, seleccionando el backend MARLIN NvFp4 para las capas NVFP4 y `CompressedTensorsW8A8Fp8` para las FP8. El propio autor lo marca como development preview, sin certificación de calidad ni de runtime, por lo que debe considerarse material de evaluación y no un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); proyecciones de atención tipo DeepseekV2; vision tower incluido. Modelo base: baidu/Unlimited-OCR |
| Parámetros totales | 2.675.503.360 (safetensors). Parámetros cuantizados: 2.602.844.160 en 2.196 tensores. Fuente original BF16: 3.336.106.240 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mezcla NVFP4 (E2M1, escala de bloque E4M3FN cada 16 valores, escala global FP32 inversa, activaciones BF16, W4A16) y FP8 E4M3 (E4M3FN con escala FP32 por fila y escalado dinámico de activaciones por token, W8A8). Tronco de lenguaje a 6,2371 bits por peso (objetivo solicitado: 6,0). 514 tensores protegidos en BF16 |
| Idiomas soportados | no disponible (la única evidencia de runtime es una página generada en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, `custom_code`, librería vLLM). Tamaño del repo: 3.496.554.136 bytes (3,50 GB) |

## Arquitectura y entrenamiento

El checkpoint no incorpora entrenamiento nuevo: es el resultado de una conversión de cuantización sobre el modelo oficial baidu/Unlimited-OCR en BF16, ejecutada con el codificador `numpy-reference` (CPU) de AXQuant, la misma ruta empleada por los paquetes NVFP4 CUDA que distribuye el autor. No hay datos publicados sobre el número de tokens, la composición del dataset ni fases de alineación tipo RLHF o DPO del modelo original. La innovación reside en la asignación de precisión: en lugar de un único tipo de dato, el tronco de lenguaje se reparte entre matrices NVFP4 y matrices FP8 E4M3, mientras que visión, enrutadores, embeddings, normas y LM head permanecen en BF16 y nunca cambian de precisión.

El `config.json` contiene una única configuración `compressed-tensors` con dos grupos. vLLM resuelve cada objetivo por nombre exacto de módulo o por expresión regular con anclaje `re:`; dado que construye las proyecciones de atención tipo DeepseekV2 sin prefijo de módulo, todo el bloque de atención comparte un mismo método. Por eso el grupo que transporta ese método usa el objetivo de clase `Linear`, y el otro grupo emplea objetivos `re:` anclados. Los módulos preservados se ignoran mediante objetivos `re:` anclados. En la RTX 5090, las capas MoE en NVFP4 seleccionan el backend `MARLIN` NvFp4 con el esquema esperado (pesos uint8, escala de bloque E4M3FN de grupo 16, escala global FP32 por tensor), y las capas FP8 usan `CompressedTensorsW8A8Fp8`.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`): el caso verificado es OCR de una página completa generada por el propio autor.
- Reconocimiento óptico de caracteres con prefill por trozos (chunked prefill) habilitado en vLLM.
- Procesamiento de documentos de página completa en una sola pasada, según la designación "Unlimited-OCR" del modelo base.
- Conservación del vision tower en BF16, lo que evita degradar la torre visual durante la cuantización.
- Ejecución sobre CUDA con vLLM 0.25.1 y sobre NVIDIA Thor; se ha verificado la carga y la generación de ambas familias tensoriales (NVFP4 y FP8).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se ha publicado ninguna evaluación fuera del inglés.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Digitalización masiva de documentos escaneados: el modelo acepta imagen y devuelve texto, por lo que puede alimentar una cola de ingesta que convierta lotes de PDF escaneados en texto plano antes de indexarlos en un buscador corporativo.
- Extracción de datos en facturas y albaranes: sobre la salida OCR se pueden aplicar expresiones regulares o un modelo posterior para extraer campos estructurados (importes, fechas, CIF), reduciendo la introducción manual.
- Archivado con OCR de fondo: el checkpoint de 3,50 GB cabe en una GPU de consumo, lo que permite montar un servicio de OCR en una estación de trabajo con una sola RTX en lugar de depender de una API externa.
- Preprocesado de corpus para entrenamiento: convertir imágenes de libros o informes en texto para construir datasets, aprovechando el prefill por trozos para páginas densas.
- Automatización de accesibilidad: transcripción de documentos escaneados a texto legible por lectores de pantalla en un flujo por lotes nocturno.
- Enriquecimiento de expedientes en un pipeline de CI/CD: integrar el modelo como paso de un job que valide la legibilidad de documentos generados y detecte páginas en blanco o corruptas mediante la comparación del texto extraído.
- Despliegue de bajo coste en flota CUDA: al usar un único checkpoint con NVFP4 y FP8, se puede servir en vLLM con el backend MARLIN sin mantener dos artefactos separados por tipo de dato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card lo indica de forma explícita: la evidencia de runtime se reduce a una página en inglés generada y cargada en dos hosts NVIDIA, sin evaluación OCR con conjunto reservado, sin cualificación de layout ni de marcado, y sin ninguna afirmación de precisión o de velocidad. El manifiesto de conversión registra `status=development`, `runtime_verified=false` y `quality_certified=false`.

| Aspecto | Resultado declarado |
|---|---|
| Benchmarks académicos (MMLU, HumanEval, GSM8K, OCRBench, etc.) | no disponible |
| Evaluación OCR con conjunto reservado | no realizada según el autor |
| Prueba de humo en df-rtx5090 (GeForce RTX 5090, CUDA 13.0, torch 2.11.0+cu130, vLLM 0.25.1) | passed (una página en inglés, todas las líneas reconocidas, sin salida repetitiva) |
| Prueba de humo en df-thor-01 (NVIDIA Thor, vLLM 0.25.1) | passed |
| Latencia y throughput | no disponible |

## Requisitos de hardware

- Peso en disco y en memoria: 3,50 GB de safetensors. Sumando activaciones y caché KV, una estimación razonable de VRAM para inferencia con contexto moderado es de 6 a 8 GB; por encima de 12 GB si se aumentan el lote o la resolución de las páginas (estimación propia, no publicada por el autor).
- GPUs verificadas por el autor: GeForce RTX 5090 y NVIDIA Thor, ambas con vLLM 0.25.1.
- Compatibilidad de los tipos de dato: NVFP4 está soportado de forma nativa en la generación Blackwell (RTX 50xx, B200); FP8 E4M3 requiere Hopper o posterior. En GPUs anteriores vLLM tendrá que recurrir a rutas alternativas o no podrá cargar el checkpoint, por lo que conviene validarlo antes de desplegar.
- GPU de consumo: sí, cabe en una RTX 5090 y en cualquier GPU con al menos 8 GB de VRAM que soporte las rutas de NVFP4 y FP8 indicadas.
- Opciones de despliegue: vLLM (librería declarada en el modelo, imágenes oficiales `vllm/vllm-openai`, versiones con hash `f0b9a0dc...` y `2cc49b81...`). El repositorio requiere `custom_code`, por lo que hay que habilitar la ejecución de código remoto. No se documenta soporte para llama.cpp, Ollama o TGI.
- Reproducción del smoke test: `examples/ocr_smoke.py` con la imagen oficial de vLLM y la página incluida. El pipeline de conversión se reproduce con `axquant plan-cuda` y `axquant convert-cuda` en modo `mix6`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Licencia | Disponibilidad | Estado |
|---|---|---|---|---|---|
| AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-FP8-6bit | 2.675.503.360 (cuantizado) | Mezcla NVFP4 + FP8 E4M3, partes en BF16 | MIT | HuggingFace, vLLM, custom code | Development preview, sin certificar |
| baidu/Unlimited-OCR (modelo base) | 3.336.106.240 | BF16 | MIT | HuggingFace | Modelo original de referencia |

No se dispone de datos contrastados en la información proporcionada sobre otras alternativas de OCR basadas en modelos multimodales del mismo orden de tamaño, por lo que la comparativa se limita al modelo base y a los datos declarados en la model card. Cualquier comparación con otras familias requiere consultar sus propias fichas técnicas.

## Limitaciones y advertencias

- Es un development preview: el manifiesto declara `runtime_verified=false` y `quality_certified=false`, y no se implica ningún certificado Tier 1 ni Tier 2.
- No existe evaluación OCR con conjunto reservado ni cualificación de layout o de marcado; tampoco hay afirmaciones de precisión o de velocidad.
- La evidencia de runtime se reduce a una única página en inglés generada en dos GPUs, por lo que los resultados en otros idiomas, resoluciones o tipografías no están verificados.
- La cuantización es RTN sobre el modelo BF16 original, de modo que cabe esperar una degradación de calidad respecto al modelo base, no cuantificada por el autor.
- La licencia MIT del checkpoint no exime de revisar la licencia y las condiciones del modelo base baidu/Unlimited-OCR ni de los datos con los que fue entrenado.
- El repositorio incluye `custom_code` y requiere ejecutar código remoto en vLLM; conviene auditar ese código antes de usarlo en un entorno de producción.
- El despliegue depende de versiones muy concretas de vLLM (0.25.1) e imágenes oficiales con hash específico; otras versiones pueden no reconocer los grupos de `compressed-tensors`.
- El autor advierte de que la enumeración de kernels no es exhaustiva: el smoke test verifica la carga y la generación de ambas familias tensoriales, no un número concreto de kernels FP8.
- AX Engine sigue siendo el runtime para Apple Silicon; el despliegue en flota CUDA corresponde a AX Serving, según la propia model card.
- Riesgo de alucinación en la transcripción de documentos con texto ilegible o de baja resolución: no se ha publicado ninguna medición al respecto.
- Idiomas soportados: no disponible. No hay garantía de comportamiento correcto fuera del inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-NVFP4-FP8-6bit
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Reproducción del smoke test: `examples/ocr_smoke.py` del repositorio AXQuant (referenciado en la model card, sin URL pública en la información disponible)
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos no guardan relación con el contenido de la ficha y se han descartado.
