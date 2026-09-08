# macunaima/gemma4-search-doc-sm8650-a8w8-int4embed

## Resumen
Este repo contiene una variante cuantizada del checkpoint `gemma4-search-doc`, compilada y empaquetada por el autor `macunaima` específicamente para la NPU (HTP) de la Qualcomm Snapdragon SM8650, el SoC del Samsung Galaxy S24. El artefacto resultante es un único archivo `.litertlm` que se ejecuta a través del runtime LiteRT-LM de Google AI Edge. El objetivo principal del proyecto es reducir el tamaño total del modelo para evitar problemas de memoria en dispositivos móviles, manteniendo el grafo principal de inferencia byte a byte idéntico al baseline A8W8 de producción.

La receta de cuantización que aquí se documenta mantiene las capas de atención y MLP en precisión INT8 para pesos y activaciones (igual que el baseline), y solo comprime las tablas de embedding (`embedder.tflite` y `per_layer_embedder.tflite`) a INT4 weight-only con granularidad per-channel. Esto reduce el tamaño del modelo de 5.87 GiB a 2.83 GiB, un 51.7% menos, sin tocar el grafo que se ejecuta en la NPU. Según la model card, la velocidad esperada es idéntica al baseline, y la pérdida de calidad sería nula, aunque el propio autor advierte que se trata de razonamientos de ingeniería, no de mediciones reales en dispositivo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de texto de la familia Gemma 4, pipeline text-generation) |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | A8W8 (INT8 peso/activacion) en atencion y MLP; INT4 weight-only per-channel en embeddings |
| Idiomas soportados | No disponibles |
| Licencia | Gemma |
| Formato de pesos | `.litertlm` (modelo principal), `.tflite` (embedders) |

## Arquitectura y entrenamiento
No se proporciona información sobre la arquitectura interna del checkpoint base ni sobre sus datos de entrenamiento. La documentación disponible se centra en el proceso de compilación y cuantización: el modelo se compila AOT con la opción `--soc-model SM8650` para la NPU HTP de Qualcomm y se ejecuta como un único archivo `.litertlm` mediante LiteRT-LM. El grafo principal compilado para la NPU (atención y MLP) es exactamente el mismo que el del baseline A8W8 ya validado en producción; la única modificación es que los embedders se comprimen a INT4 weight-only con granularidad per-channel. El autor indica que el compilador HTP de Qualcomm no soporta cuantización blockwise, por lo que se usa per-channel en todos los pesos. Los embedders no pasan por el compilador AOT, ya que son tablas de lookup puras, lo que permite aplicarles una compresión sin restricciones del compilador. No se aportan datos sobre tokens, composición del dataset ni técnicas como RLHF o DPO.

## Capacidades
La model card no detalla las capacidades funcionales del modelo base ni de esta variante. A partir de los metadatos y el nombre del checkpoint se puede indicar lo siguiente:

- Generación de texto: el pipeline registrado es `text-generation`.
- El nombre `gemma4-search-doc` sugiere una orientación hacia tareas de búsqueda y procesamiento de documentos, pero no hay confirmación oficial en la información disponible.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- No se especifican capacidades multilingües ni la longitud exacta de la ventana de contexto.

## Casos de uso
- Despliegue de asistentes de texto en el dispositivo: esta receta permite ejecutar un modelo de lenguaje en un Snapdragon SM8650 reduciendo la huella de memoria de los embeddings, lo que facilita su inclusión en aplicaciones móviles con RAM limitada, como funciones de redacción asistida o respuesta automática en el propio teléfono.
- Búsqueda documental local en movilidad: la reducción del 51.7% en tamaño hace viable mantener el modelo junto con tablas de embeddings dentro de un mismo presupuesto de memoria, lo que es adecuado para apps que indexen y consulten documentos del usuario sin enviar datos a servidores externos.
- Procesamiento de textos largos en offline: si el checkpoint base tiene la ventana de contexto típica de la familia Gemma 4, esta variante permite manejar notas, correos o documentos extensos en el dispositivo, al liberar memoria que de otro modo ocuparían los embeddings.
- Evaluación de pipelines on-device para Qualcomm: los desarrolladores que portan modelos a NPU HTP pueden usar esta variante como caso de prueba para aislar el impacto de comprimir únicamente los embeddings, sin alterar el grafo de inferencia principal.
- Integración en sistemas RAG móviles: al mantener el grafo principal con precisión A8W8 y comprimir solo las tablas de recuperación, la variante ofrece una alternativa de menor memoria para sistemas de recuperación aumentada que se ejecutan en un Galaxy S24.
- Prototipado de aplicaciones con LiteRT-LM: el modelo sirve como referencia práctica para validar el flujo de compilación AOT con `--soc-model SM8650` y la ejecución de un único `.litertlm` en el runtime de Google AI Edge, sin necesidad de modificar el grafo que se somete al compilador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que la velocidad esperada es idéntica al baseline A8W8, pero se trata de una estimación basada en el hecho de que el grafo que se ejecuta en la NPU no cambia, no de mediciones reales en un dispositivo físico.

## Requisitos de hardware
- Dispositivo objetivo: SoC Qualcomm Snapdragon SM8650, presente en el Samsung Galaxy S24, con NPU HTP.
- Tamaño del modelo en disco: 2.83 GiB, frente a 5.87 GiB del baseline A8W8, lo que supone una reducción del 51.7% en el espacio requerido.
- Runtime necesario: LiteRT-LM de Google AI Edge, con el modelo empaquetado como un único archivo `.litertlm`.
- El modelo no está diseñado para GPU convencional; no se proporcionan datos de VRAM para tarjetas gráficas de escritorio.
- No se indican valores de latencia ni throughput medidos en el dispositivo.
- El despliegue se realiza mediante compilación AOT específica para la NPU, por lo que este artefacto no es directamente compatible con motores como vLLM, Ollama o llama.cpp, pensados para GPU o CPU.

## Comparativa con modelos similares
La información disponible permite comparar esta variante con el baseline A8W8 de referencia y con los dos modelos hermanos que comparten la misma base, aunque de estos últimos solo se conoce el nombre y el esquema de cuantización, no el tamaño final.

| Modelo | Tamaño | Cuantizacion | Comentario |
|---|---|---|---|
| Baseline A8W8 (referencia) | 5.87 GiB | A8W8 (INT8 peso/activacion) | Grafo de produccion original |
| Este modelo (int4embed) | 2.83 GiB | A8W8 + embedders INT4 per-channel | Reduccion del 51.7% |
| gemma4-search-doc-sm8650-a8w4-mlponly-int4embed | No disponible | A8W4 en MLP + INT4 embedders | Modelo hermano |
| gemma4-search-doc-sm8650-a8w4-full-int4embed | No disponible | A8W4 completo + INT4 embedders | Modelo hermano |

No se dispone de parámetros totales, longitud de contexto ni resultados de benchmarks para comparar con modelos equivalentes fuera de esta familia.

## Limitaciones y advertencias
- La compilación es exclusiva para la NPU HTP del Snapdragon SM8650; el archivo `.litertlm` no es portable a otros SoCs ni a otras plataformas sin recompilación.
- Las estimaciones de velocidad y calidad presentadas en la model card son razonamientos de ingeniería, no mediciones reales en un Galaxy S24 físico, tal y como advierte el propio autor.
- La cuantización INT4 de las tablas de embedding puede afectar a la fidelidad en tareas de recuperación, aunque el autor afirma que el grafo principal es byte a byte idéntico al baseline.
- No se han documentado evaluaciones de sesgos, alucinación, seguridad o toxicidad para esta receta específica.
- La licencia Gemma impone condiciones de uso que deben revisarse antes de cualquier despliegue comercial.
- El modelo base `gemma4-search-doc` no está descrito en la documentación disponible; por tanto, se desconocen sus límites reales de contexto y capacidades funcionales.

## Enlaces
- Repositorio principal: <https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w8-int4embed>
- Runtime LiteRT-LM: <https://github.com/google-ai-edge/LiteRT>
- Modelo hermano (A8W4 solo MLP + INT4 embedders): <https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w4-mlponly-int4embed>
- Modelo hermano (A8W4 completo + INT4 embedders): <https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w4-full-int4embed>
- Palacio de Gemma 4 en DeepMind: <https://deepmind.google/models/gemma/gemma-4/>
- Model card de Gemma 4 en Google AI for Developers: <https://ai.google.dev/gemma/docs/core/model_card_4>
