# orcarouter/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-NVFP4 es una cuantización en precisión mixta NVFP4/FP8 del modelo Qwen3.8-27B, publicada por el usuario orcarouter en Hugging Face. Se trata de una variante "abliterated" y "uncensored" del modelo base de Qwen, orientada explícitamente a tareas de red teaming y seguridad de IA (etiquetas `ai-red-team`, `red-teaming`, `abliterated`). El modelo conserva la pipeline `image-text-to-text`, es decir, mantiene capacidades de visión-lenguaje además de generación de texto.

El interés técnico principal reside en el formato de pesos: una cuantización NVFP4 (formato FP4 de NVIDIA) combinada con capas en FP8 mediante `compressed-tensors`, lo que reduce el repositorio a 24,7 GB para un modelo con 21.232.112.736 parámetros reales en safetensors. Está pensado para despliegue en vLLM con aceleración de hardware Blackwell, y declara soporte de function calling, razonamiento y decodificación multi-token (MTP).

La relevancia actual es doble: por un lado, muestra el estado del arte en cuantización de 4 bits con precisión mixta para servir modelos grandes en menos VRAM; por otro, ejemplifica la práctica del "abliteration" para eliminar rechazos del modelo base, lo que plantea consideraciones éticas y de licencia relevantes para producción. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capacidades de visión (tag `qwen3_5`), decodificación multi-token (MTP) |
| Parametros totales | 21.232.112.736 (≈21,2 B, dato real de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4) con precisión mixta y capas FP8, formato `compressed-tensors`; etiqueta `8-bit` |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantización del base Qwen/Qwen3.8-27B, no un entrenamiento desde cero. La información disponible no detalla la arquitectura interna del base más allá de las etiquetas (`qwen3_5`, `image-text-to-text`, `mtp`), que indican un transformer decoder-only con torre de visión y decodificación multi-token especulativa. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

La innovación técnica destacable es la cuantización: NVFP4 es un formato de coma flotante de 4 bits con escala de bloque orientado a las GPU NVIDIA Blackwell (serie RTX 50 y B200), combinado con capas seleccionadas en FP8 para preservar precisión en partes sensibles del modelo. El resultado se empaqueta con `compressed-tensors`, lo que permite cargarlo directamente en vLLM sin recalcular escalas. El prefijo "abliterated" indica que se ha aplicado una técnica de ablación de direcciones de rechazo en el espacio de activaciones para eliminar el comportamiento de negativa del modelo base; no se especifica la metodología exacta ni el conjunto de datos usado para validar la ablación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito (etiqueta `reasoning`) heredado del base Qwen3.8.
- Procesamiento de imagen y texto combinados (`image-text-to-text`): descripción de imágenes, VQA y razonamiento sobre contenido visual.
- Function calling / tool calling declarado en las etiquetas del repositorio.
- Soporte de decodificación multi-token (MTP) para acelerar la generación.
- Comportamiento "uncensored": ausencia de rechazos en consultas que el modelo base rechazaría, orientado a investigación de seguridad y red teaming.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM.
- No se declara soporte de audio ni de otros idiomas distintos de en y zh.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como generador de ataques y prompts adversarios para probar las defensas de otros sistemas, aprovechando su naturaleza abliterated para producir contenido que un modelo alineado rechazaría.
- Investigación en alineación y abliteration: comparar las respuestas del modelo cuantizado con el base Qwen3.8-27B permite medir el impacto de la ablación en calidad, coherencia y tasas de rechazo.
- Despliegue de VLM en hardware Blackwell: con 24,7 GB de pesos NVFP4, puede servirse en una GPU de consumo de la serie RTX 50 con 32 GB o en una RTX 5090, cubriendo tareas de captioning y VQA en local.
- Automatización de pipelines de datos visuales: generación de descripciones y etiquetas para datasets de imagen a gran escala, con throughput mejorado gracias a MTP y a la cuantización de 4 bits.
- Asistentes conversacionales bilingües en/zh: atención al cliente o soporte interno en inglés y chino con contexto multi-turno, siempre que el caso de uso tolere la ausencia de filtros de seguridad.
- Agentes con tool calling: integración en flujos de automatización donde el modelo debe invocar APIs o funciones, con la ventaja de un footprint de memoria reducido frente al base en BF16.
- Pruebas de robustez de filtros de contenido: evaluar si los clasificadores de moderación detectan salidas generadas por un modelo sin alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 25-30 GB con los pesos NVFP4/FP8 y overhead de KV cache; el repositorio ocupa 24,7 GB.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 5090, RTX 5080) para aprovechar las instrucciones nativas NVFP4; el soporte en arquitecturas anteriores (Hopper, Ada) depende de la implementación de vLLM y puede degradar a descompresión en software.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) y potencialmente en RTX 5080 (16 GB) solo con contexto muy reducido o offloading parcial; no cabe en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors` y NVFP4), transformers con `compressed-tensors`; llama.cpp y Ollama no se declaran compatibles con este formato.
- Latencia y throughput: no disponibles; se espera mejora frente a BF16 por el menor ancho de banda de memoria, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-NVFP4 (este) | 21,2 B | no disponible | NVFP4 + FP8 | apache-2.0 | gated en HF |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | no disponible | BF16 original | apache-2.0 | público en HF |
| Otras variantes abliterated de Qwen3 | no disponible | no disponible | típicamente GGUF/AWQ | variable | comunidad en HF |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; la diferencia principal frente al base es el formato de pesos y la eliminación de rechazos, no una mejora de capacidades.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sesgado; no apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación y de afirmaciones falsas, agravado por la cuantización a 4 bits, que puede degradar la coherencia en razonamientos largos.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- La cuantización NVFP4 requiere hardware Blackwell para rendimiento óptimo; en otras GPU el rendimiento puede ser inferior al del base en BF16.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el uso automatizado.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad legal sobre las salidas generadas recae en el desplegador.
- No se documentan la metodología de abliteration ni evaluaciones de regresión; el impacto en calidad respecto al base es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Qwen en GitHub: https://github.com/QwenLM/Qwen3
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de vLLM: https://docs.vllm.ai
- Especificación NVFP4 de NVIDIA: https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/
