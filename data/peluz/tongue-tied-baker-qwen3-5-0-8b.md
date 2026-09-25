# peluz/tongue-tied-baker-qwen3.5-0.8b

## Resumen

El repositorio peluz/tongue-tied-baker-qwen3.5-0.8b es un artefacto alojado en Hugging Face cuyo nombre sugiere una adaptación o derivado de Qwen3.5-0.8B, el miembro de menor tamaño de la familia Qwen3.5 desarrollada por Alibaba. La model card publicada es la plantilla automática de transformers sin ninguna sección completada: no declara desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento ni protocolo de evaluación. El repositorio registra 0 descargas, 0 likes y un tamaño declarado de 0,0 GB, lo que impide verificar que contenga pesos utilizables.

Los únicos metadatos con contenido técnico son los tags: safetensors (formato de pesos), endpoints_compatible (compatibilidad declarada con los endpoints gestionados de Hugging Face), region:us y arxiv:1910.09700, referencia que corresponde a Lacoste et al. (2019), el artículo sobre estimación de emisiones de carbono citado en la propia plantilla de la model card. No hay pipeline declarado, ni licencia, ni idiomas, ni pesos cuantizados documentados.

Como contexto externo, la familia Qwen3.5 se publicó en 2026: primero el modelo insignia Qwen3.5-397B-A17B y variantes MoE, y el 2 de marzo de 2026 los modelos pequeños 9B, 4B, 2B y 0.8B, descritos por fuentes secundarias como densos, multimodales nativos y distribuidos bajo Apache 2.0. Ninguna de esas afirmaciones está confirmada para este repositorio concreto, por lo que la ficha debe leerse como una evaluación de un artefacto sin documentar más que como la de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para este repositorio; la familia Qwen3.5 se describe en fuentes secundarias como híbrida, con variantes MoE grandes y variantes densas pequeñas |
| Parametros totales | 0,8 B (inferido del nombre del repositorio, no confirmado en la model card) |
| Parametros activos | no aplica / no disponible (el nombre sugiere un modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el tag safetensors sugiere pesos sin cuantizar |
| Idiomas soportados | no disponible en el repositorio; fuentes secundarias atribuyen 201 idiomas a la familia Qwen3.5 |
| Licencia | no disponible; fuentes secundarias indican Apache 2.0 para la serie pequeña de Qwen3.5 |
| Formato de pesos | safetensors (según tag del repositorio) |
| Tamaño del repositorio | 0,0 GB (dato reportado por Hugging Face) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-24 |
| Última actualización | 2026-09-24 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura, los datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineamiento en este repositorio. La model card se limita a la plantilla estándar con marcadores [More Information Needed] en todas las secciones relevantes (Model Details, Training Details, Evaluation, Technical Specifications). Tampoco se documenta ningún método de decodificación especulativa, atención lineal u otra innovación técnica.

El único indicio indirecto es el nombre del repositorio, que apunta a Qwen3.5-0.8B como modelo base. Según fuentes secundarias, la familia Qwen3.5 introduce soporte multimodal nativo (visión y vídeo) y una arquitectura descrita como híbrida, con variantes MoE en la gama alta y modelos densos en la gama pequeña. Los modelos pequeños (9B, 4B, 2B y 0.8B) se habrían publicado el 2 de marzo de 2026. Estas afirmaciones corresponden a la familia en su conjunto y no deben extrapolarse a este repositorio sin verificación directa de los pesos y la configuración.

## Capacidades

- No hay ninguna capacidad documentada por el autor en la model card.
- Si el repositorio contiene efectivamente un derivado de Qwen3.5-0.8B, cabría esperar generación de texto, razonamiento básico y capacidades multimodales nativas, según la descripción de la familia en fuentes secundarias. Esto no está verificado.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre soporte de agentes o razonamiento multi-paso.
- No hay información sobre cobertura multilingüe real del artefacto (fuentes secundarias atribuyen 201 idiomas a la familia base, no a este repositorio).
- No hay información sobre modos especiales de inferencia (thinking mode, visión, audio).
- El tag endpoints_compatible sugiere que el artefacto está preparado para servirse a través de los endpoints gestionados de Hugging Face, pero no hay confirmación de que la inferencia funcione.

## Casos de uso

Ninguno de los siguientes escenarios está validado para este repositorio concreto; se plantean como aplicaciones plausibles únicamente en el supuesto de que los pesos sean funcionales y correspondan a un derivado de Qwen3.5-0.8B.

- Prototipado local en portátil: un modelo denso de 0,8 B en cuantización de 4 bits ocuparía del orden de 0,5 GB, lo que permitiría experimentar con generación de texto en CPU o en una GPU integrada sin infraestructura dedicada.
- Clasificación y etiquetado de texto a gran escala: por su tamaño, podría procesar grandes volúmenes de documentos en lotes, siempre que se valide su calidad frente a un modelo mayor.
- Filtrado previo en pipelines RAG: uso como reranker ligero o como generador de resúmenes cortos antes de invocar un modelo mayor, reduciendo coste por consulta.
- Inferencia en dispositivos móviles o edge: fuentes secundarias afirman que la variante 0.8B de Qwen3.5 puede procesar vídeo en un teléfono, lo que abriría casos de análisis de imagen o vídeo en local sin conexión.
- Generación de borradores para decodificación especulativa: un modelo de 0,8 B puede actuar como modelo borrador de uno mayor de la misma familia, si comparten tokenizador y vocabulario.
- Educación y demos interactivas: desplegado en Ollama o llama.cpp para ejemplos reproducibles en talleres, con un coste de hardware mínimo.
- Experimentos de ajuste fino (LoRA/QLoRA): el tamaño reducido lo hace adecuado como banco de pruebas para técnicas de adaptación eficiente antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las fuentes secundarias consultadas incluyen cifras para otros miembros de la familia Qwen3.5 (por ejemplo, 81,7 en GPQA Diamond para el modelo de 9B, según stable-learn.com), pero ninguna de ellas corresponde al modelo de 0,8 B ni, mucho menos, a este repositorio concreto. No se deben extrapolar esos números a este artefacto.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento nominal de 0,8 B de parámetros y no han sido verificadas contra los pesos reales del repositorio.

- VRAM estimada para los pesos: aproximadamente 1,6 GB en bf16/fp16, 0,8 GB en int8/fp8 y 0,5 GB en cuantización de 4 bits.
- VRAM total estimada en inferencia: 2-3 GB en bf16 con contextos moderados, sumando caché KV y activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo no requiere aceleradores de centro de datos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU discretas modernas, y previsiblemente en CPU y en SoC móviles en cuantizaciones bajas.
- Opciones de despliegue: transformers (es la librería declarada), y previsiblemente llama.cpp, Ollama, vLLM y TGI si los pesos están en un formato estándar y la arquitectura es soportada por esas herramientas.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada.

Advertencia: el tamaño de repositorio de 0,0 GB es incompatible con los pesos de un modelo denso de 0,8 B en bf16 (en torno a 1,6 GB). Esto sugiere que los pesos no están subidos, que lo están en un formato no contabilizado o que el repositorio contiene únicamente configuración. Debe comprobarse la lista de archivos antes de intentar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| peluz/tongue-tied-baker-qwen3.5-0.8b | 0,8 B (inferido) | no disponible | no disponible | 0 descargas; repositorio de 0,0 GB |
| Qwen3.5-0.8B (base de la familia) | 0,8 B | no disponible | Apache 2.0 según fuentes secundarias | publicado el 2 de marzo de 2026 según fuentes secundarias |
| Qwen3.5-2B / 4B / 9B | 2 B / 4 B / 9 B | no disponible | Apache 2.0 según fuentes secundarias | misma fecha de publicación según fuentes secundarias |
| Qwen3.5-397B-A17B | 397 B totales / 17 B activos | no disponible | no disponible en la información consultada | modelo insignia de la familia |

No se dispone de datos verificados de modelos comparables de otros fabricantes (por ejemplo, alternativas densas de ~1 B de parámetros) dentro de la información proporcionada, por lo que no se incluye comparación de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto, sin datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Riesgo de que el repositorio no contenga pesos funcionales: 0,0 GB de tamaño es inconsistente con un modelo de 0,8 B en precisión completa o media.
- Licencia no especificada: no se puede asumir uso comercial permitido. Aunque la familia Qwen3.5 se distribuya bajo Apache 2.0 según fuentes secundarias, la licencia de este repositorio derivado no está declarada y depende de los términos que imponga el autor.
- Riesgo de alucinación: no evaluable sin pesos ni benchmarks; en modelos de menos de 1 B de parámetros la tasa de error factual suele ser elevada, especialmente en tareas de razonamiento multi-paso.
- Limitaciones de contexto e idioma: desconocidas para este artefacto. No se debe asumir la cobertura de 201 idiomas de la familia base.
- Trazabilidad nula: no hay forma de saber qué ajuste se aplicó sobre el modelo base, si lo hubo, ni con qué datos.
- Sesgos: no documentados por el autor. Cualquier uso en producción requeriría una evaluación propia.
- Reputación y soporte: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de errores.
- El tag arxiv:1910.09700 no indica una innovación del modelo, sino la referencia al calculador de emisiones de carbono incluido en la plantilla de model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/peluz/tongue-tied-baker-qwen3.5-0.8b
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen3.5 — Alibaba Open-Weight 397B Model Specs (AI/TLDR): https://ai-tldr.dev/models/qwen3-5/
- Qwen3.5: 9B Beats 120B, 0.8B Runs Video on Phones—Full MoE Family (stable-learn.com): https://stable-learn.com/en/qwen35-native-multimodal-agent-model/
- Qwen 3.5 API Complete Guide (2026) (kissapi.ai): https://kissapi.ai/blog/qwen-3-5-api-complete-guide-2026.html
- Qwen 3.5: A Complete Model Family from 0.8B to 397B (enclaveai.app): https://enclaveai.app/blog/2026/03/08/qwen-3-5-complete-model-family-local-ai/
- Artículo citado en el tag del repositorio: https://arxiv.org/abs/1910.09700
