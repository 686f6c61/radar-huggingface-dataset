# Level5Tech/clef-NVFP4

## Resumen

clef-NVFP4 es una compilación cuantizada del modelo Cloudflare/clef, un transformer de 27.356.728.560 parámetros (aproximadamente 27B) desarrollado originalmente por Cloudflare. Esta versión, publicada por Level5Tech, aplica cuantización NVFP4 con esquema W4A4 (pesos y activaciones a 4 bits) mediante la herramienta llm-compressor, y está optimizada para su despliegue en vLLM. No se trata de un lanzamiento oficial de Cloudflare, sino de un build de terceros orientado a experimentación con cuantización de baja precisión.

El modelo base incorpora componentes arquitectónicos poco habituales: una cabeza de esquema conjunta (joint schema head), una torre de visión y proyecciones de compuerta Gated DeltaNet, elementos que esta compilación mantiene deliberadamente en BF16 para preservar su comportamiento numérico. El resto de los pesos se almacena en formato NVFP4, lo que reduce el tamaño del repositorio hasta los 20 GB.

La relevancia de esta ficha reside en su carácter experimental: forma parte del trabajo "The Noise Floor of a Quantization Comparison" de Aleks Blagojevich y Trevor Sunderland (Level5), que documenta mediciones, recetas y salidas por registro en un repositorio público. Es un artefacto útil para quienes investigan los límites de la cuantización FP4 en modelos multimodales de gran tamaño, no tanto para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5) con torre de visión, joint schema head y Gated DeltaNet |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones a 4 bits); componentes selectos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit de almacenamiento declarado en tags) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef emplea una arquitectura transformer etiquetada como qwen3_5, con innovaciones estructurales que incluyen una torre de visión para entrada multimodal, una cabeza de esquema conjunta (joint schema head) y proyecciones de compuerta Gated DeltaNet. La compilación NVFP4 conserva estos componentes críticos en BF16 —junto con las normas— mientras cuantiza el resto de los pesos a NVFP4 con esquema W4A4, es decir, tanto pesos como activaciones a 4 bits. La receta de cuantización se generó con llm-compressor y está publicada en el repositorio de Level5Tech.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal más allá de lo que implica la presencia de Gated DeltaNet. La model card únicamente indica que las recetas, mediciones y salidas por registro están disponibles en el repositorio clef-quant-bench de GitHub.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Cloudflare/clef de 27B.
- Procesamiento de visión: la torre de visión se mantiene en BF16, por lo que la entrada multimodal debería conservarse funcionalmente.
- Joint schema head: componente estructural que sugiere soporte para salidas estructuradas o esquemas conjuntos, aunque no se detalla su función exacta.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en cuantización FP4: el modelo sirve para reproducir y analizar el impacto de NVFP4 W4A4 en la calidad de salida frente al modelo base en BF16, usando las recetas y mediciones publicadas en clef-quant-bench.
- Despliegue en vLLM con requisitos de memoria reducidos: al ocupar 20 GB en reposo, permite servir un modelo de 27B en GPUs con menos VRAM que la versión completa, manteniendo los componentes sensibles en BF16.
- Evaluación de robustez numérica: útil para medir la degradación en tareas de razonamiento y generación cuando pesos y activaciones se reducen a 4 bits, comparando por registro con las salidas de referencia.
- Prototipado de pipelines multimodales: la torre de visión en BF16 permite experimentar con entradas de imagen en entornos de investigación sin disponer del modelo original completo.
- Benchmarking de herramientas de cuantización: sirve como caso de estudio para validar llm-compressor y el formato compressed-tensors en modelos con arquitecturas no estándar (Gated DeltaNet, joint schema head).
- Docencia y divulgación técnica: adecuado para explicar en un blog o curso las diferencias prácticas entre W4A4 y otras recetas de cuantización, con datos medidos y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio https://github.com/Level5Tech/clef-quant-bench para consultar mediciones, recetas y salidas por registro, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20 GB, por lo que se necesita al menos esa cantidad más el espacio para KV cache y activaciones; con contexto largo, se recomienda 24 GB o más.
- GPU recomendadas: NVIDIA H100 o A100 para despliegue en vLLM con NVFP4 (soporte nativo de FP4 en Blackwell y compatibilidad vía emulación en generaciones anteriores); RTX 4090 (24 GB) como mínimo para caber con margen ajustado.
- ¿Cabe en consumer GPU? Sí, en GPUs de 24 GB como la RTX 4090, siempre que se limite la longitud de contexto y el tamaño de batch.
- Opciones de despliegue: vLLM es el destino declarado del build; llama.cpp, Ollama y TGI no están confirmados para este formato NVFP4/compressed-tensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Level5Tech/clef-NVFP4 | 27,36B | no disponible | NVFP4 W4A4 | Apache-2.0 | Hugging Face |
| Cloudflare/clef (base) | 27B (aprox.) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Alternativas de 27B en FP4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría con cuantización FP4 para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Cloudflare; es un build de terceros (Level5Tech) y debe tratarse como artefacto experimental.
- La cuantización W4A4 introduce degradación numérica potencial en tareas sensibles; los componentes críticos se mantienen en BF16, pero el resto de pesos y activaciones pierde precisión.
- No se documentan sesgos conocidos ni evaluaciones de alucinación en la información disponible.
- No se especifican idiomas soportados, lo que impide garantizar un rendimiento multilingüe adecuado.
- La longitud de contexto no está documentada; planificar el despliegue sin asumir una ventana concreta.
- Aunque la licencia es Apache-2.0, el NOTICE indica que los pesos fueron modificados por cuantización; conviene revisar el LICENSE incluido antes de uso comercial.
- El soporte de despliegue está orientado a vLLM; otras herramientas pueden no reconocer el formato NVFP4/compressed-tensors.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio de benchmarks y recetas: https://github.com/Level5Tech/clef-quant-bench
