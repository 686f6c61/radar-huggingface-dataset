# INCModel2/Qwen3.8-27B-W4A16-RTN-CT-AutoRound

## Resumen

El modelo `INCModel2/Qwen3.8-27B-W4A16-RTN-CT-AutoRound` es una versión cuantizada a 4 bits (int4) del modelo Qwen3.8-27B, generada mediante la herramienta Intel AutoRound en modo RTN (Round-To-Nearest). La cuantización utiliza un esquema W4A16 con un tamaño de grupo de 128, lo que permite reducir significativamente el espacio en memoria y acelerar la inferencia en GPUs con recursos limitados. El repositorio ocupa 19.5 GB, aunque los metadatos de los archivos safetensors indican un total de 6.260.690.960 parámetros, una cifra que no coincide con la denominación "27B" del nombre; esta discrepancia debería verificarse con el modelo original.

Al ser una cuantización, el modelo hereda las capacidades del Qwen3.8-27B, aunque la información proporcionada no detalla las características específicas de ese modelo base. La relevancia de esta ficha radica en ofrecer una opción de despliegue eficiente para entornos con restricciones de memoria, manteniendo la funcionalidad general del LLM original. La licencia no está especificada en los metadatos, pero la model card indica que se debe seguir la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, pero no confirmado) |
| Parametros totales | 6.260.690.960 (segun metadatos safetensors; el nombre sugiere 27B, discrepancia a verificar) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, group_size 128 (int4) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (se debe seguir la del modelo original Qwen3.8-27B) |
| Formato de pesos | safetensors (formato llm_compressor) |

## Arquitectura y entrenamiento

La cuantización se realizó con Intel AutoRound en modo RTN, un método que redondea los pesos al valor entero más cercano dentro del esquema de cuantización. El comando utilizado (proporcionado en la model card) especifica un esquema W4A16, es decir, pesos de 4 bits y activaciones de 16 bits, con un tamaño de grupo de 128. Se excluyeron de la cuantización las capas `visual`, `lm_head`, `embed_tokens` y `mtp`, probablemente para preservar la precisión en la salida y en las capas de embedding. El formato de salida es `llm_compressor`, compatible con el ecosistema de Intel Neural Compressor.

No se dispone de información sobre el entrenamiento del modelo base Qwen3.8-27B (datos de entrenamiento, número de tokens, técnicas de alineación como RLHF o DPO, etc.). La cuantización no implica un reentrenamiento, sino una transformación posterior al entrenamiento.

## Capacidades

No se han publicado detalles específicos de capacidades en la información disponible. Al ser una versión cuantizada de Qwen3.8-27B, se espera que herede las capacidades del modelo original, que probablemente incluyen:

- Generación de texto y conversación multi-turno.
- Razonamiento y resolución de problemas.
- Generación de código y soporte de lenguajes de programación.
- Capacidades multilingües (típicas de la familia Qwen).
- Posible soporte de tool calling o function calling, aunque no confirmado.

Sin embargo, estas capacidades no están documentadas en la ficha del modelo cuantizado y deben verificarse con la documentación del modelo base.

## Casos de uso

Dado que se trata de una cuantización de un LLM grande, los casos de uso son aquellos en los que se requiere un modelo potente pero con restricciones de memoria o coste de inferencia. Aunque no se confirman las capacidades exactas, se pueden considerar los siguientes escenarios típicos:

- Despliegue en entornos de producción con GPUs de gama media (por ejemplo, RTX 3090 o RTX 4090) donde un modelo de 27B en FP16 no cabría, pero la versión int4 sí.
- Inferencia en servidores con múltiples usuarios concurrentes, reduciendo el coste por petición gracias al menor uso de VRAM.
- Prototipado rápido de aplicaciones de chat o asistentes virtuales sin necesidad de infraestructura de alto presupuesto.
- Integración en pipelines de generación de código o documentación técnica donde se requiera un modelo con buena comprensión contextual.
- Análisis de texto a gran escala (clasificación, extracción de información) en lote, aprovechando la menor huella de memoria.
- Experimentación académica con modelos cuantizados para estudiar el impacto de la precisión en tareas específicas.

Es importante señalar que estos casos son hipotéticos y dependen de las capacidades reales del modelo base, que no se han documentado en la información proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K u otras para este modelo cuantizado ni para el modelo base. Se recomienda consultar la documentación de Qwen3.8-27B para obtener datos de rendimiento del modelo original y, si es necesario, realizar evaluaciones propias sobre la versión cuantizada.

## Requisitos de hardware

- Tamaño del repositorio: 19.5 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente esa cantidad en disco. Para inferencia, se necesita VRAM suficiente para cargar los pesos más el overhead de activaciones y caché.
- Con 19.5 GB de pesos, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) podría ser suficiente para inferencia con un contexto moderado. Para contextos largos o batch grande, se recomienda 32 GB o más (A100, H100).
- Al ser un modelo cuantizado, es probable que sea compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten el formato `llm_compressor` o puedan convertir los pesos a GGUF u otros formatos.
- No se dispone de datos de latencia o throughput. Estos dependerán de la GPU, el tamaño del batch y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo base Qwen3.8-27B no está documentado en la información proporcionada, y no se conocen alternativas cuantizadas comparables en este contexto. Se indica "no disponible".

## Limitaciones y advertencias

- La model card advierte que el modelo puede producir información factualmente incorrecta y no debe utilizarse como fuente fiable de datos.
- Existe riesgo de generar contenido ofensivo, sesgado o inapropiado, debido a las limitaciones del modelo preentrenado y los conjuntos de datos de ajuste.
- La cuantización int4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en tareas que requieren alta precisión numérica o razonamiento complejo.
- La licencia no está especificada en los metadatos. Se recomienda consultar la licencia del modelo original Qwen3.8-27B antes de cualquier uso comercial.
- No se ha verificado la discrepancia entre el número de parámetros reportado en safetensors (6.26B) y la denominación "27B" del nombre. Esto podría indicar un error en los metadatos o que el modelo base es diferente al esperado.
- Para uso en producción, se recomienda realizar pruebas de seguridad y sesgo antes del despliegue, tal como sugiere la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel2/Qwen3.8-27B-W4A16-RTN-CT-AutoRound
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo de AutoRound (arXiv): https://arxiv.org/abs/2309.05516
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
