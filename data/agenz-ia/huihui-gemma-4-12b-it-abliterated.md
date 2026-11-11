# agenz-ia/Huihui-gemma-4-12B-it-abliterated

## Resumen

Huihui-gemma-4-12B-it-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo multimodal google/gemma-4-12B-it, publicada por el usuario agenz-ia en Hugging Face. El modelo conserva la arquitectura y los pesos del Gemma 4 12B instruct original, pero ha sido modificado mediante técnicas de abliteration para eliminar las respuestas de negativa ante peticiones que el modelo base rechazaría. El pipeline declarado es any-to-any, lo que indica capacidades multimodales de entrada y salida (texto e imagen).

El modelo cuenta con 11.959.730.224 parámetros (aproximadamente 12B) almacenados en formato safetensors, con un tamaño de repositorio de 24 GB. Está pensado para investigación sobre alineación, evaluación de mecanismos de seguridad y experimentación controlada, no para despliegue en producción orientado al público. La model card advierte explícitamente de que se trata de una implementación "cruda, proof-of-concept" y recomienda su uso únicamente en entornos de investigación o pruebas controladas.

La relevancia de esta ficha radica en que documenta una de las primeras variantes abliterated de la familia Gemma 4, lo que permite a investigadores estudiar cómo la eliminación de refusal directions afecta al comportamiento del modelo en modos thinking y non-thinking. No se dispone de datos de benchmarks ni de idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (gemma4_unified), pipeline any-to-any |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe version Ollama (huihui_ai/gemma-4-abliterated:12b) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (transformers); disponible tambien via Ollama |

## Arquitectura y entrenamiento

El modelo es un fine-tune del google/gemma-4-12B-it, por lo que hereda la arquitectura transformer multimodal de la familia Gemma 4 (tag gemma4_unified), con soporte de entrada image-text-to-text y pipeline any-to-any. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La modificación respecto al modelo original consiste en una abliteration aplicada únicamente a las capas 23-28, según indica la model card. El autor señala que tanto el modo thinking como el modo non-thinking han sido "completamente abliterated". La técnica empleada se basa en remove-refusals-with-transformers (Sumandora), una implementación sin TransformerLens que elimina las direcciones de rechazo del espacio de activaciones. La model card advierte de que los pesos de la primera release de google/gemma-4-12B-it tenían problemas y que el modelo fue re-abliterado y resubido.

## Capacidades

- Generación de texto multimodal: pipeline any-to-any con soporte image-text-to-text.
- Modo thinking y modo non-thinking, ambos modificados por la abliteration.
- Eliminación de rechazos (refusals) ante peticiones que el modelo base denegaría.
- Capacidades heredadas del Gemma 4 12B instruct: razonamiento, generación de código y matemáticas (no verificadas en la información disponible).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la eliminación de refusal directions en las capas 23-28 afecta a la tasa de rechazos y a la calidad de las respuestas, comparándolo con el Gemma 4 12B-it original en entornos controlados.
- Evaluación de técnicas de abliteration: sirve como referencia para validar la implementación remove-refusals-with-transformers frente a alternativas basadas en TransformerLens, midiendo diferencias en comportamiento entre modos thinking y non-thinking.
- Red teaming y pruebas de robustez: útil para generar respuestas que un modelo alineado rechazaría y analizar sesgos, toxicidad o filtración de información en pipelines de evaluación de seguridad.
- Experimentación multimodal controlada: al conservar el pipeline any-to-any, permite probar tareas image-text-to-text en entornos de laboratorio sin las restricciones de refusal del modelo base.
- Desarrollo de filtros y clasificadores de seguridad: las salidas del modelo pueden emplearse como corpus negativo para entrenar detectores de contenido inapropiado o clasificadores de rechazo.
- Despliegue local de pruebas vía Ollama: la versión huihui_ai/gemma-4-abliterated:12b permite ejecutar el modelo en estaciones de trabajo para experimentación rápida sin infraestructura de servido compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 32-40 GB de VRAM.
- GPU recomendadas para BF16: A100 40/80 GB, H100, o GPUs consumer de gama alta con 24 GB (RTX 3090/4090) recurriendo a cuantización.
- Cabe en GPU consumer: sí, mediante cuantización (por ejemplo, versiones GGUF de 4-8 bits) en RTX 3090, RTX 4090 o GPUs con 16-24 GB.
- Opciones de despliegue: transformers (librería declarada), Ollama (versión oficial huihui_ai/gemma-4-abliterated:12b); vLLM, llama.cpp o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-gemma-4-12B-it-abliterated | ~12B | no disponible | apache-2.0 | Variante abliterated, capas 23-28 modificadas |
| google/gemma-4-12B-it | ~12B | no disponible | licencia Gemma 4 | Modelo base alineado, con refusals |
| Otras variantes abliterated de la familia Gemma | no disponible | no disponible | variable | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La seguridad del modelo está significativamente reducida: puede generar contenido sensible, controvertido o inapropiado.
- No es adecuado para audiencias públicas, menores de edad ni aplicaciones que requieran alta seguridad.
- Riesgo elevado de alucinación y de respuestas dañinas al haberse eliminado los mecanismos de rechazo.
- La model card recomienda uso exclusivo en investigación, pruebas o entornos controlados, evitando producción o aplicaciones comerciales de cara al público.
- El autor declina toda responsabilidad sobre las consecuencias derivadas del uso del modelo.
- Se recomienda monitorización en tiempo real y revisión manual de las salidas.
- Aunque la licencia declarada es apache-2.0, el license_link apunta a la licencia de Gemma 4 de Google; conviene verificar la compatibilidad de los términos para uso comercial.
- Idiomas soportados y longitud de contexto no documentados, lo que limita la planificación de despliegues multilingües o con contexto largo.
- La model card advierte de que los pesos de la primera release del modelo base tenían problemas; es necesario descargar la versión re-abliterada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agenz-ia/Huihui-gemma-4-12B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de la técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated:12b
- Repositorio Ollama: https://github.com/ollama/ollama/releases/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ko-fi del autor original: https://ko-fi.com/huihuiai
