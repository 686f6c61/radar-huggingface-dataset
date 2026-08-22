# kingjones777/Ling-3.0-tiny-base-ROCmFP4-COHERENT-GGUF

## Resumen

Ling-3.0-tiny-base-ROCmFP4-COHERENT es una cuantización en 4 bits del checkpoint base Ling-3.0-tiny-base, desarrollado por InclusionAI y empaquetado por kingjones777. El modelo original es un MoE híbrido ligero de 7,9B parámetros totales (1,3B activos) con arquitectura bailing-hybrid, diseñado para despliegue en entornos de borde con recursos limitados. Esta versión específica está optimizada para GPUs AMD de la serie Strix Halo (gfx1151) mediante el formato de cuantización ROCmFP4.

Se trata de un checkpoint base, no de un modelo instruccional. Su propósito es la continuación del preentrenamiento, la adaptación a dominios concretos o el fine-tuning posterior. Conserva la cabeza de predicción multi-token (MTP) para decodificación especulativa y mantiene una ventana de contexto de 262.144 tokens. La licencia MIT permite uso comercial sin restricciones.

La relevancia de esta ficha es que permite ejecutar un modelo híbrido de razonamiento de 8,2B parámetros en hardware de consumo AMD con memoria unificada, algo que habitualmente requiere infraestructura de mayor escala.
