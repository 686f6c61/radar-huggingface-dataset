# hotdogs/Ornith-1.0-9B-abliterated-fable

## Resumen

Ornith-1.0-9B-abliterated-fable es un modelo de lenguaje de 9 400 millones de parámetros desarrollado por el usuario hotdogs, que parte de la base abliterada YuYu1015-Ornith-1.0-9B-abliterated, la cual a su vez deriva del modelo agéntico ornith-ai/Ornith-1.0-9B, post-entrenado sobre Qwen 3.5. El modelo se ha afinado mediante LoRA SFT sobre un dataset propio de trazas de razonamiento agéntico multi-turno (hotdogs/uka-fable-reasoning), con bloques de pensamiento Fable-5 y formato de herramientas Hermes. Su propósito principal es ofrecer un modelo de agente y código de 9B con razonamiento paso a paso, llamada a herramientas y sin patrones de rechazo, gracias a la abliteración de la base.

La arquitectura es híbrida, combinando 24 capas de atención lineal Gated-DeltaNet con 8 capas de atención completa, una configuración heredada de Qwen 3.5. El contexto de entrenamiento es de 4 096 tokens, aunque el máximo soportado es de 262 144 tokens. Incluye soporte para MTP (Multi-Token Prediction) con 15 tensores, lo que permite decodificación especulativa más rápida. El modelo está licenciado bajo MIT, lo que facilita su uso comercial sin restricciones, y se distribuye en formato safetensors.

La relevancia de este modelo radica en su combinación de capacidades agénticas (tool calling, razonamiento multi-paso) con un tamaño contenido de 9B que cabe en GPUs de consumo, y una licencia permisiva. Es una opción interesante para desarrolladores que necesitan un modelo de código y agente autocontenido, sin depender de APIs propietarias y con la posibilidad de ejecutarlo localmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated-DeltaNet (atención lineal) + 8 capas de atención completa (Qwen3.5) |
| Parametros totales | 9 409 813 744 (dato real safetensors; la model card indica ~9,57B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4 096 tokens (entrenado) / 262 144 tokens (máximo) |
| Tipos de cuantizacion | BF16 (nativo); se menciona compatibilidad con GGUF en la card, pero no se confirma en el repo |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura híbrida de Qwen 3.5, que combina 24 capas de atención lineal con Gated-DeltaNet y 8 capas de atención completa. Esta mezcla busca equilibrar eficiencia computacional (atención lineal para largas secuencias) con capacidad de razonamiento profundo (atención completa en las últimas capas). El vocabulario es de 248 320 tokens, y el modelo incluye 15 tensores MTP para decodificación especulativa, lo que acelera la generación en entornos de inferencia que soporten esta técnica.

El entrenamiento consistió en un LoRA SFT sobre la base abliterada YuYu1015-Ornith-1.0-9B-abliterated, con rango r=64 y alpha=128, en precisión BF16 (no 4-bit, debido a las capas Gated-DeltaNet). Se congeló la torre de visión, ya que los datos de entrenamiento son solo de texto. El dataset utilizado, hotdogs/uka-fable-reasoning/perfect-v2, contiene 3 346 trazas de razonamiento agéntico multi-turno, limpiadas de la versión v1 (3 500 filas) eliminando 154 ejemplos donde el mensaje del asistente terminaba con dos puntos, lo que provocaba que el modelo emitiera EOS prematuramente. El entrenamiento se realizó en 4 GPUs RTX 3060 de 12 GB, con tokenización a 4 096 tokens máximo.

## Capacidades

- Generación de texto y razonamiento paso a paso con bloques ` thinking` (estilo Fable-5), que permiten al modelo desglosar problemas complejos antes de responder.
- Llamada a herramientas (tool calling) mediante el formato Hermes (`<Tool: Name>{json}`), compatible con agentes que necesitan ejecutar funciones externas.
- Razonamiento multi-paso y ejecución de tareas agénticas, incluyendo tareas de sistema, Python y bash.
- Generación de código, gracias a su herencia de Ornith-1.0-9B y Qwen 3.5.
- Sin patrones de rechazo (abliterado), lo que permite respuestas sin censura en temas sensibles, aunque con los riesgos asociados.
- Soporte MTP para decodificación especulativa, mejorando la velocidad de inferencia en backends compatibles.
- Multilingüe limitado: aunque la model card indica solo inglés, al derivar de Qwen 3.5 podría tener capacidades multilingües residuales, pero no está garantizado ni documentado.

## Casos de uso

- Asistente de código en IDE: el modelo puede integrarse en extensiones de editor para autocompletar, refactorizar y explicar código. Su capacidad de razonamiento paso a paso y generación de código lo hace adecuado para tareas de desarrollo asistido, con la ventaja de poder ejecutarse localmente sin enviar datos a la nube.
- Agente de automatización de tareas: gracias al formato Hermes de tool calling, puede orquestar llamadas a APIs, ejecutar scripts de bash o Python, y gestionar flujos multi-paso en entornos de automatización (por ejemplo, pipelines de CI/CD).
- Chatbot de atención al cliente con contexto largo: con un contexto máximo de 262 144 tokens, puede manejar conversaciones multi-turno extensas y resumir historiales largos de interacción, aunque el contexto de entrenamiento es de solo 4 096 tokens, por lo que el rendimiento más allá de ese límite puede degradarse.
- Generación de documentación técnica: puede redactar documentación, comentarios de código y guías a partir de especificaciones o código fuente, aprovechando su capacidad de razonamiento y su entrenamiento en trazas agénticas.
- Prototipado de agentes de investigación: el modelo puede razonar sobre consultas complejas, buscar información en fuentes externas mediante tool calling y sintetizar respuestas, útil para asistentes de investigación automatizados.
- Educación y tutoría en programación: al poder explicar conceptos y generar ejemplos de código, puede usarse como tutor virtual en plataformas de aprendizaje, con la ventaja de ser gratuito y ejecutable localmente.
- Despliegue en entornos con restricciones de privacidad: al ser un modelo abierto con licencia MIT, puede desplegarse en infraestructura propia sin depender de servicios externos, cumpliendo requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo ocupa aproximadamente 18,8 GB (9,4B × 2 bytes). Con cuantización a 8 bits, se reduce a ~9,4 GB; a 4 bits, ~4,7 GB, aunque no se confirma la disponibilidad de cuantizaciones GGUF en el repo.
- GPUs recomendadas: para BF16 se necesita una GPU con al menos 20 GB de VRAM, como RTX 3090, RTX 4090, A100 40GB o H100. Con cuantización 8 bits, una RTX 3060 12GB podría ser suficiente, y con 4 bits cabría en GPUs de 8 GB.
- En consumer GPU: sí, es viable en RTX 3090/4090 en BF16, y en RTX 3060/4060 con cuantización.
- Opciones de despliegue: compatible con transformers (con `trust_remote_code=True`), vLLM (si soporta la arquitectura híbrida y MTP), llama.cpp (si se genera GGUF), Ollama (si se convierte), y TGI. Se recomienda verificar la compatibilidad de la arquitectura Gated-DeltaNet con cada backend.
- Latencia y throughput: no disponibles. El MTP puede acelerar la decodificación especulativa, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-9B-abliterated-fable | 9,4B | 4K entrenado / 262K máx | MIT | safetensors | Abliterado, SFT con Fable reasoning, MTP |
| ornith-ai/Ornith-1.0-9B | ~9,57B | 4K / 262K máx | No especificada en la card | safetensors | Base original, agéntico, sobre Qwen 3.5 |
| YuYu1015-Ornith-1.0-9B-abliterated | ~9,57B | 4K / 262K máx | No especificada | safetensors | Versión abliterada de la base |
| Qwen3.5-9B (referencia) | ~9B | 4K / 262K máx | Apache 2.0 (típico) | safetensors | Modelo base, sin abliteración ni SFT específico |

La comparativa se basa en datos de la model card y conocimiento general; no hay benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- La abliteración elimina los patrones de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal o poco ético sin filtros. Esto supone un riesgo en producción si no se implementan salvaguardas externas.
- El contexto de entrenamiento es de solo 4 096 tokens; aunque el máximo teórico es de 262 144, el rendimiento más allá de 4K puede degradarse significativamente, con posibles pérdidas de coherencia o alucinaciones.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar (MMLU, HumanEval, etc.) es desconocido.
- El dataset de entrenamiento es pequeño (3 346 trazas) y específico de razonamiento agéntico, lo que puede limitar la generalización a otros dominios.
- Solo se documenta soporte para inglés; las capacidades multilingües no están garantizadas.
- La arquitectura híbrida (Gated-DeltaNet + atención completa) puede no ser compatible con todos los backends de inferencia; se requiere `trust_remote_code=True` en transformers y verificar soporte en vLLM u otros.
- El modelo se entrenó en 4 GPUs RTX 3060, lo que limita el tamaño del lote y la duración del entrenamiento; no se especifican detalles sobre el número de pasos o épocas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base (Ornith-1.0-9B) y sus derivados pueden tener licencias diferentes; se recomienda verificar la licencia de cada componente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/Ornith-1.0-9B-abliterated-fable
- Base abliterada: https://huggingface.co/YuYu1015/YuYu1015-Ornith-1.0-9B-abliterated
- Base original: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/hotdogs/uka-fable-reasoning
