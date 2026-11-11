# Level5Tech/clef-flash-NVFP4

## Resumen

clef-flash-NVFP4 es una compilación cuantizada del modelo Cloudflare/clef-flash (9B), publicada por Level5Tech. Se trata de una cuantización NVFP4 en formato W4A4 (pesos y activaciones a 4 bits en formato de coma flotante NVFP4), generada con la herramienta llm-compressor y orientada al despliegue en vLLM. No es una release oficial de Cloudflare, sino un artefacto técnico preparado para el estudio comparativo "The Noise Floor of a Quantization Comparison" de Aleks Blagojevich y Trevor Sunderland (Level5).

El modelo base pertenece a la familia qwen3_5 (según las etiquetas del repositorio), con 9.409.813.744 parámetros totales y un tamaño de repositorio de 9,1 GB, lo que es coherente con un esquema de cuantización de 8 bits en el artefacto publicado (etiqueta 8-bit y compressed-tensors). La compilación conserva en BF16 varios componentes críticos: la cabeza de esquema conjunta (joint schema head), la torre de visión, las normas y las proyecciones de puerta de Gated DeltaNet. Esa decisión de diseño sugiere que el modelo base incorpora tanto un tower visual como capas híbridas con Gated DeltaNet, si bien la model card no detalla la arquitectura completa.

Su relevancia actual es metodológica: sirve como punto de comparación reproducible para medir el ruido introducido por distintas recetas de cuantización sobre un mismo modelo base, con recetas y salidas por registro publicadas en el repositorio de GitHub del proyecto. La licencia Apache-2.0 del modelo base se mantiene, con un NOTICE que indica que estos pesos han sido modificados mediante cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5; componentes citados: torre de visión, Gated DeltaNet, joint schema head) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A4 (pesos y activaciones a 4 bits); artefacto etiquetado como 8-bit / compressed-tensors; componentes preservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura completa del modelo base. Las etiquetas del repositorio apuntan a la familia qwen3_5, y la model card menciona explícitamente tres elementos que se mantienen en BF16 durante la cuantización: la cabeza de esquema conjunta (joint schema head), la torre de visión (vision tower) y las proyecciones de puerta de Gated DeltaNet. La presencia de una torre de visión implica capacidad multimodal de entrada de imagen, y Gated DeltaNet sugiere capas de atención lineal o híbridas con estado recurrente, aunque no se especifica la proporción de capas ni la configuración exacta.

En cuanto al entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), no hay datos en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: recetas NVFP4 W4A4 construidas con llm-compressor para vLLM, con recetas y mediciones publicadas en el repositorio https://github.com/Level5Tech/clef-quant-bench. La innovación destacable es la preservación selectiva en BF16 de módulos sensibles a la cuantización (normas, proyecciones de puerta, torre de visión y cabeza de esquema), una práctica habitual para limitar la degradación en capas con alta sensibilidad numérica.

## Capacidades

- Generación de texto y modelado de lenguaje: el modelo base es un LLM de 9B parámetros, por lo que conserva las capacidades generativas del original, sujetas a la degradación introducida por la cuantización W4A4.
- Procesamiento de visión: la torre de visión se mantiene en BF16, lo que preserva la ruta multimodal de entrada de imágenes del modelo base.
- Salida estructurada mediante joint schema head: la cabeza de esquema conjunta se conserva en BF16, orientada a la generación de salidas con esquema definido.
- Razonamiento multi-paso y agentes: no confirmado en la información disponible; depende de las capacidades del modelo base, no documentadas aquí.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación comparativa de cuantización: usar este artefacto junto con las recetas publicadas en clef-quant-bench para medir la degradación de NVFP4 W4A4 frente a otras recetas sobre el mismo modelo base, con salidas por registro reproducibles.
- Despliegue de inferencia en vLLM: al estar construido específicamente para vLLM con compressed-tensors, encaja en servidores de inferencia que ya explotan kernels NVFP4 en GPU Blackwell.
- Servicio multimodal con huella de memoria reducida: la torre de visión en BF16 permite mantener entrada de imágenes mientras el grueso de los pesos ocupa 4 bits, útil para servir cargas multimodales con VRAM limitada.
- Generación de salidas estructuradas: la joint schema head preservada en BF16 permite experimentar con salidas conformes a esquema sin recalibrar esa cabeza.
- Investigación sobre sensibilidad de capas: comparar el rendimiento de módulos preservados en BF16 (normas, puertas de Gated DeltaNet) frente a sus equivalentes cuantizados para estudiar qué capas concentran el error.
- Pruebas de regresión en pipelines de CI: integrar el modelo en suites automatizadas que comparen salidas del artefacto cuantizado con las del modelo base original antes de promover una receta a producción.
- Reproducción académica: replicar el estudio "The Noise Floor of a Quantization Comparison" usando las recetas y mediciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB, por lo que la carga de pesos requiere alrededor de 9-10 GB de VRAM, más memoria para caché KV, activaciones y buffers de inferencia.
- GPU recomendadas: GPUs con soporte de kernels NVFP4, típicamente arquitectura Blackwell (por ejemplo, B200); el soporte NVFP4 en generaciones anteriores es limitado o emulado.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer; NVFP4 depende de kernels específicos disponibles en vLLM para hardware Blackwell.
- Opciones de despliegue: vLLM es el destino declarado del artefacto (construido con llm-compressor); llama.cpp, Ollama o TGI no están documentados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Level5Tech/clef-flash-NVFP4 | 9.409.813.744 | no disponible | NVFP4 W4A4 (artefacto 8-bit) | Apache-2.0 | Hugging Face, 0 descargas |
| Cloudflare/clef-flash (base) | 9B (según model card) | no disponible | BF16 (presumiblemente) | Apache-2.0 | Hugging Face |
| Otras recetas de clef-quant-bench | mismo base | no disponible | diversas (ver repositorio) | Apache-2.0 (heredada) | GitHub del proyecto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Degradación por cuantización: W4A4 en pesos y activaciones introduce error numérico; la preservación en BF16 de normas, puertas y torre de visión mitiga parte del problema, pero no lo elimina.
- Dependencia de hardware: NVFP4 requiere kernels específicos (Blackwell en vLLM); en hardware sin soporte nativo el artefacto puede no ejecutarse o rendir de forma degradada.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; es un artefacto de investigación, no un modelo validado para producción.
- No es una release oficial de Cloudflare: cualquier soporte, garantía o mantenimiento recae en Level5Tech, no en el autor del modelo base.
- Idiomas y contexto: no documentados; no se puede garantizar cobertura multilingüe ni ventanas largas sin verificación empírica.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la cuantización; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el NOTICE debe conservarse indicando que los pesos fueron modificados por cuantización; verificar los términos del modelo base antes de redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-flash-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio de recetas y mediciones: https://github.com/Level5Tech/clef-quant-bench
