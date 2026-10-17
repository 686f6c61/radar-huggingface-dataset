# mondk/Qwen3-VL-4B-Thinking-Msh-Claude-Safetensors

## Resumen

`mondk/Qwen3-VL-4B-Thinking-Msh-Claude-Safetensors` es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario mondk en HuggingFace. No se trata de un entrenamiento desde cero, sino de la fusión completa (*full merge*) del modelo base `unsloth/Qwen3-VL-4B-Thinking` con el adaptador LoRA `mondk/Qwen3-VL-4B-Thinking-Msh-Claude`. El resultado es un checkpoint de 4.437.815.808 parámetros (aproximadamente 4,44 mil millones) en formato safetensors, con un repositorio de 8,9 GB.

El interés del modelo es acotado y muy específico: aplicar un ajuste supervisado (SFT) con QLoRA sobre 387 pares de conversación procedentes de los conjuntos `mondk/Claude-Haiku-5.5-High-Sft` y `mondk/Msh-Sft`, con el objetivo de aproximar el estilo de respuesta a un asistente tipo Claude. Al estar fusionado, no requiere cargar el adaptador por separado: se comporta como un checkpoint autónomo compatible con la librería `transformers` y con el pipeline `image-text-to-text`.

Por su tamaño, es un modelo apto para inferencia en GPU de consumo y para prototipado rápido de aplicaciones que combinen imagen y texto. Ahora bien, conviene subrayar que se trata de un artefacto de la comunidad, sin métricas publicadas, sin descargas ni validación externa, y con un volumen de datos de ajuste muy reducido (387 pares), lo que limita seriamente las garantías para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal de la familia Qwen3-VL (codificador visual + decodificador transformer causal con modo *thinking*); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 4.437.815.808 (≈4,44 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos en safetensors sin cuantizar |
| Idiomas soportados | No disponibles en la información proporcionada (el modelo base Qwen3-VL es multilingüe, pero no se detalla la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-VL en su variante de 4B con modo de razonamiento (*thinking*), es decir, un modelo multimodal que combina un codificador de visión con un decodificador transformer causal. Sobre esa base, el autor aplicó un ajuste QLoRA y posteriormente fusionó los pesos mediante un *streaming CPU merge* con la fórmula `W = W_base + 2 * B@A` sobre 252 módulos LoRA, todos ellos ubicados en la parte de modelo de lenguaje (`language_model`). Este detalle es relevante: el factor multiplicador 2 aplicado a la delta de bajo rango amplifica la contribución del ajuste respecto a la escala estándar del producto `B@A`, de modo que el efecto estilístico del fine-tune queda reforzado en los pesos finales. El codificador visual no fue objeto de ajuste según la información disponible.

Los datos de entrenamiento son extremadamente reducidos: 387 pares de conversación provenientes de `mondk/Claude-Haiku-5.5-High-Sft` y `mondk/Msh-Sft`. No se especifican el número de tokens vistos, la composición exacta del dataset, la proporción de ejemplos con imagen, ni si hubo etapas posteriores de RLHF o DPO. El SFT se realizó con QLoRA, lo que implica cuantización de la base durante el entrenamiento y adaptadores de bajo rango. No se documentan innovaciones técnicas propias más allá del procedimiento de fusión descrito.

## Capacidades

- Generación de texto y razonamiento en modo *thinking*, heredados del modelo base `unsloth/Qwen3-VL-4B-Thinking`.
- Comprensión de imágenes y respuesta en texto (pipeline `image-text-to-text`): descripción de contenido visual, respuesta a preguntas sobre imágenes.
- Conversación multi-turno, con la etiqueta `conversational` en el repositorio.
- Ajuste estilístico orientado a respuestas con formato y tono de asistente tipo Claude, gracias al SFT sobre `Claude-Haiku-5.5-High-Sft`.
- Soporte de *tool calling* y de agentes: no confirmado en la información proporcionada para este checkpoint concreto.
- Capacidades multilingües: no detalladas en la información proporcionada.
- Otras capacidades especiales (audio, vídeo, *grounding* explícito): no disponibles en la información proporcionada.

## Casos de uso

- **Prototipado de asistentes con visión en local**: cargar el checkpoint con `transformers` en una GPU de 24 GB y construir un chat que reciba una imagen y una pregunta, aprovechando que los pesos ya están fusionados y no requieren gestionar adaptadores LoRA aparte.
- **Generación de descripciones de producto a partir de fotografía**: para catálogos de comercio electrónico, el modelo puede recibir la imagen de un artículo y producir texto descriptivo; el ajuste estilístico con tono tipo Claude resulta útil si se busca un registro cuidado y consistente.
- **Análisis de capturas de pantalla y documentos escaneados**: extracción de información y respuestas sobre el contenido de una imagen en herramientas internas de soporte o de revisión de documentación.
- **Asistente conversacional de atención al cliente con entrada visual**: el usuario adjunta una foto del producto o del recibo y el modelo mantiene el hilo de la conversación; el modo *thinking* ayuda en consultas que requieren varios pasos de deducción.
- **Generación de material didáctico a partir de diagramas**: transcripción y explicación de figuras, esquemas o gráficos en plataformas educativas, con la ventaja de que el modelo cabe en hardware asequible para despliegues por centro o por usuario.
- **Evaluación comparativa de estilos de respuesta**: al ser un fine-tune de 387 pares, sirve como caso de estudio de cuánto cambia el comportamiento de un modelo con un SFT mínimo y una fusión amplificada (factor 2), útil en experimentación académica sobre ajuste paramétricamente eficiente.
- **Preprocesado multimodal en pipelines de datos**: etiquetado y descripción automática de imágenes en lotes pequeños antes de indexarlas en un sistema de búsqueda, siempre que el rendimiento se valide con métricas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba, ni comparaciones con el modelo base que permitan cuantificar el efecto del ajuste.

## Requisitos de hardware

- **Pesos en precisión completa**: el repositorio ocupa 8,9 GB, coherente con 4,44 mil millones de parámetros en BF16/FP16.
- **VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no medida)**: alrededor de 11-13 GB en FP16 considerando pesos, caché KV y activaciones del codificador visual; aproximadamente 6-7 GB con cuantización de 8 bits y 3,5-4,5 GB en 4 bits, con margen para contexto e imagen de resolución moderada.
- **GPU recomendadas**: A100 40/80 GB o H100 para despliegues con *batching* alto o contexto largo; RTX 4090 / RTX A6000 (24-48 GB) para desarrollo y servicio de baja concurrencia.
- **¿Cabe en GPU de consumo?** Sí. Cabe con holgura en una RTX 4090 (24 GB) en FP16. En 4 bits es viable en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070), a costa de limitar la resolución de imagen y la longitud de contexto.
- **Opciones de despliegue**: `transformers` es la vía nativa indicada en el repositorio. vLLM y TGI son utilizables si la versión instalada soporta la arquitectura `qwen3_vl`. llama.cpp y Ollama requieren un GGUF que no se distribuye en este repositorio; habría que convertirlo a partir de estos pesos.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Msh-Claude, *merged*) | 4,44 mil millones | No disponible | Apache-2.0 | safetensors | SFT de 387 pares sobre el base; sin benchmarks ni descargas |
| `unsloth/Qwen3-VL-4B-Thinking` (base) | 4,44 mil millones | No disponible | Apache-2.0 | safetensors | Referencia directa; mismo tamaño y licencia, sin el ajuste estilístico |
| Qwen3-VL-2B-Thinking | Aproximadamente 2 mil millones (no verificado en la información disponible) | No disponible | Apache-2.0 | safetensors, GGUF | Alternativa más ligera de la misma familia, apta para hardware muy limitado |
| Qwen3-VL-8B-Thinking | Aproximadamente 8 mil millones (no verificado en la información disponible) | No disponible | Apache-2.0 | safetensors, GGUF | Alternativa mayor, con más capacidad a cambio de aproximadamente el doble de VRAM |

Los datos de las filas correspondientes a otras variantes de la familia Qwen3-VL no provienen de la información proporcionada y deberían verificarse en sus respectivas model cards antes de tomar decisiones.

## Limitaciones y advertencias

- **Volumen de ajuste muy reducido**: 387 pares de conversación son insuficientes para un cambio de comportamiento robusto; es esperable un ajuste superficial de estilo y un riesgo alto de sobreajuste a las expresiones concretas del dataset.
- **Factor de fusión no estándar**: multiplicar la delta LoRA por 2 amplifica el efecto del fine-tune; si el adaptador tenía una escala calibrada para otro factor, el resultado puede desviarse del comportamiento previsto y degradar capacidades del modelo base.
- **Sin evaluación publicada**: no hay benchmarks que cuantifiquen la degradación o mejora respecto al base, ni validación de que las capacidades de visión se conserven tras la fusión.
- **Riesgo de alucinación**: inherente a los modelos de 4B, especialmente en tareas de razonamiento largo y en la lectura de imágenes con texto denso o de baja calidad.
- **Ausencia de validación comunitaria**: cero descargas y cero *likes* en el momento de la consulta; no existe retroalimentación de terceros sobre su comportamiento real.
- **Idiomas no declarados**: no se especifica la cobertura lingüística; el ajuste se hizo sobre datasets de los que no se detalla el idioma, por lo que el rendimiento en castellano no está garantizado.
- **Contexto no documentado**: se desconoce la ventana máxima efectiva de este checkpoint; no debe asumirse la del modelo base sin comprobación empírica.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; conviene conservar el aviso de licencia y verificar las condiciones del modelo base y de los datasets empleados.
- **Trazabilidad limitada**: el repositorio tiene una antigüedad de minutos entre creación y última actualización, sin documentación adicional más allá de la model card mínima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mondk/Qwen3-VL-4B-Thinking-Msh-Claude-Safetensors
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-4B-Thinking
- Adaptador LoRA de origen: https://huggingface.co/mondk/Qwen3-VL-4B-Thinking-Msh-Claude
- Dataset de SFT (estilo Claude): https://huggingface.co/datasets/mondk/Claude-Haiku-5.5-High-Sft
- Dataset de SFT (Msh): https://huggingface.co/datasets/mondk/Msh-Sft
