# mlboydaisuke/LFM2-700M-ExecuTorch

## Resumen

LFM2-700M-ExecuTorch es una exportación del modelo base LiquidAI/LFM2-700M al formato ExecuTorch (.pte) para inferencia en dispositivo. La ha publicado el usuario mlboydaisuke como parte de una colección de modelos convertidos a ExecuTorch, con el objetivo de facilitar el despliegue en entornos on-device (CPU, móvil, edge). El modelo original, desarrollado por Liquid AI, es un LLM híbrido de 700M parámetros diseñado específicamente para ejecución eficiente en hardware limitado, con soporte para generación de texto, instrucciones y function calling.

Esta versión concreta aplica una cuantización 8da4w (8 bits en activaciones, 4 bits en pesos) y embeddings de 8 bits, reduciendo el peso del archivo a 486,5 MB. La exportación se realizó con ExecuTorch 1.4.0, con forma estática (seq_len=1) y una ventana de contexto máxima de 2048 tokens. El autor verificó el funcionamiento en un Mac con arquitectura arm64, alcanzando 91,1 tokens por segundo en decodificación, y confirmó respuestas correctas a preguntas sencillas de conocimiento y aritmética. No se ha medido el rendimiento en teléfonos móviles.

La relevancia de este modelo radica en que ofrece una vía práctica para ejecutar un LLM de calidad media en dispositivos sin GPU, gracias a la combinación de la arquitectura híbrida de LFM2 y la optimización de ExecuTorch con el backend XNNPACK. Es una opción interesante para desarrolladores que buscan integrar generación de texto en aplicaciones móviles o de escritorio con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (según Liquid AI; detalles no disponibles en la información proporcionada) |
| Parametros totales | 700M (0,74B según FitMyLLM) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_seq_length en la exportación) |
| Tipos de cuantizacion | 8da4w (8-bit activaciones, 4-bit pesos) + embedding de 8 bits |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo base LFM2-700M es un LLM híbrido desarrollado por Liquid AI, diseñado para despliegue en dispositivos edge. Según el blog oficial de Liquid AI, esta arquitectura ofrece un rendimiento de decodificación y prefill un 200% más rápido que Qwen3 y Gemma 3 en CPU, manteniendo una buena calidad en instrucciones y function calling. Sin embargo, la información disponible no detalla los componentes internos exactos (por ejemplo, si combina atención con capas SSM o Mamba).

Esta exportación concreta no implica un reentrenamiento, sino una conversión del modelo original a ExecuTorch. El proceso incluye cuantización 8da4w (8 bits en activaciones, 4 bits en pesos) y cuantización de embeddings a 8 bits. El autor del repositorio señala tres comprobaciones críticas realizadas antes de la exportación: activar `use_sdpa_with_kv_cache` (que mejora la velocidad de decodificación), asegurar que `dim` y `hidden_dim` sean divisibles por el tamaño de grupo del cuantizador, y verificar que todos los campos del JSON de parámetros sean leídos por la ruta genérica de ejecución. Estas comprobaciones evitan problemas comunes como exportaciones que funcionan pero generan texto repetitivo o que no cargan correctamente.

## Capacidades

- Generación de texto: el modelo produce respuestas coherentes a preguntas directas, como se verificó con "capital of France?" y "17 times 4?".
- Razonamiento básico: resuelve operaciones aritméticas simples y preguntas de conocimiento general.
- Inferencia on-device: está optimizado para ejecutarse en CPU mediante XNNPACK, sin necesidad de GPU.
- Soporte de chat: utiliza la plantilla ChatML con tokens especiales (bos=1, eos=[7]).
- Function calling: el modelo base LFM2 soporta function calling según Liquid AI, aunque no se ha verificado en esta exportación concreta.
- Multilingüismo: no se dispone de información sobre los idiomas soportados.

## Casos de uso

- Asistente de voz en dispositivos móviles: el modelo puede ejecutarse localmente en un smartphone para responder preguntas frecuentes sin conexión, gracias a su tamaño reducido (486,5 MB) y su velocidad de decodificación en CPU.
- Aplicación de chat privada en el navegador o escritorio: al funcionar con ExecuTorch, se puede integrar en aplicaciones de escritorio o web (vía WebAssembly) para ofrecer un asistente conversacional sin enviar datos a servidores externos.
- Generación de respuestas automáticas en sistemas de atención al cliente: con la plantilla ChatML, el modelo puede gestionar conversaciones multi-turno básicas, aunque su contexto de 2048 tokens limita diálogos muy largos.
- Herramienta educativa offline: para practicar idiomas o resolver dudas de conocimiento general en entornos sin conectividad, como aulas rurales o dispositivos de bajo coste.
- Prototipado rápido de aplicaciones de IA en edge: los desarrolladores pueden usar este archivo .pte como referencia para exportar otros modelos de LFM2 a ExecuTorch y evaluar su viabilidad en hardware concreto.
- Sistema de autocompletado o sugerencias en editores de código: aunque no está especializado en código, su capacidad de generación de texto puede servir para completar frases o comandos en herramientas ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor del repositorio realizó una verificación funcional con dos prompts y midió la velocidad de decodificación:

| Prueba | Resultado |
|---|---|
| "capital of France?" | "The capital city of France is Paris." |
| "17 times 4?" | "17 times 4 is 68." |
| Velocidad de decodificación (Mac arm64) | 91,1 tok/s |

Esta medición se realizó en un Mac con arquitectura arm64, en un proceso limpio por prompt, sin otras cargas en el sistema. El autor advierte que la velocidad puede caer a una cuarta parte si se ejecutan otras tareas simultáneamente. No se ha medido en teléfonos móviles.

## Requisitos de hardware

- El modelo se ejecuta en CPU mediante el backend XNNPACK de ExecuTorch; no requiere GPU.
- El archivo .pte ocupa 486,5 MB, por lo que necesita al menos esa cantidad de memoria RAM libre (más el espacio para el runtime y el tokenizador).
- Verificado en Mac con arquitectura arm64; debería funcionar en otras plataformas compatibles con ExecuTorch (Linux, iOS, Android), aunque no se ha confirmado.
- Para móviles, se recomienda probar en dispositivos con al menos 2 GB de RAM y soporte para las instrucciones XNNPACK.
- Opciones de despliegue: ExecuTorch runtime (portable_lib), con la necesidad de importar `executorch.kernels.quantized` antes de cargar el modelo para que funcione la cuantización de embeddings.
- No se dispone de datos de latencia o throughput en otros entornos.

## Comparativa con modelos similares

No se dispone de una comparativa detallada con modelos equivalentes en la información proporcionada. El blog de Liquid AI afirma que LFM2 es un 200% más rápido que Qwen3 y Gemma 3 en CPU, y que supera a modelos de su mismo tamaño en instruction-following y function calling, pero no se aportan cifras concretas. Tampoco hay datos de comparación con otras exportaciones a ExecuTorch de modelos similares (por ejemplo, SmolLM2 o Qwen3.5, mencionados en la model card como referencias de problemas evitados).

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens, lo que restringe la capacidad de manejar conversaciones largas o documentos extensos.
- No se ha verificado el funcionamiento en teléfonos móviles; la velocidad medida en Mac arm64 puede no ser representativa de otros dispositivos.
- La licencia LFM Open License v1.0 puede tener restricciones de uso comercial; es necesario revisar sus términos antes de desplegar el modelo en producción.
- El modelo base puede presentar sesgos y alucinaciones típicos de los LLM de tamaño pequeño; no se ha realizado una evaluación de sesgos en esta exportación.
- La cuantización 8da4w puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en fp32, aunque no se ha cuantificado.
- El proceso de carga requiere pasos específicos (importar kernels cuantizados, usar `portable_lib._load_for_executorch`); omitirlos provoca errores de kernel no encontrado.
- No se ha probado la generación de código ni el function calling en esta versión concreta, a pesar de que el modelo base los soporta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/LFM2-700M-ExecuTorch
- Colección ExecuTorch Model Zoo: https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo
- Modelo base LiquidAI/LFM2-700M: https://huggingface.co/LiquidAI/LFM2-700M
- Documentación de ExecuTorch para LFM2: https://github.com/pytorch/executorch/blob/main/examples/models/lfm2/README.md
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/lfm2-700m
- Scripts de conversión (executorch-models): https://github.com/john-rocky/executorch-models
- Ejemplo iOS (executorch-samples): https://github.com/john-rocky/executorch-samples
