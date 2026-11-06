# bravefox90/GemStrike-31B-GGUF

## Resumen

GemStrike-31B-GGUF es una cuantización en formato GGUF del modelo Huihui-gemma-4-31B-it-qat-q4_0-unquantized-abliterated, publicado por el usuario bravefox90 en Hugging Face. Se trata de un derivado de la familia Gemma 4 de Google, concretamente un modelo de 31B parámetros (30.697.345.596 según los pesos safetensors) afinado mediante LoRA para escritura creativa, roleplay y contenido para adultos (nsfw, erp), y posteriormente sometido a un proceso de "abliteration" que elimina las capas de rechazo del modelo original.

El modelo está pensado para generación de texto conversacional en inglés, con un enfoque claro hacia narrativa, juegos de rol y contenido sin restricciones de seguridad. La licencia declarada es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El repositorio ocupa 155,6 GB, lo que refleja la presencia de múltiples cuantizaciones GGUF del modelo de 31B.

La relevancia de esta ficha es limitada en el contexto de IA open source para producción: se trata de un modelo derivado, sin benchmarks publicados, con cero descargas y cero likes en el momento de la consulta, y orientado a un nicho muy específico (roleplay y contenido NSFW). No obstante, se documenta aquí con rigor por su interés como ejemplo de la cadena de derivación típica en la comunidad: modelo base de Google, cuantización QAT, abliteration y LoRA de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según modelo base); detalles específicos no disponibles |
| Parametros totales | 30.697.345.596 (aproximadamente 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples cuantizaciones en el repo, según el tamaño de 155,6 GB); cuantizaciones concretas no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); compatible con llama-cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Gemma 4 de Google, un transformer decoder-only de aproximadamente 31B parámetros. El modelo base declarado es Huihui-gemma-4-31B-it-qat-q4_0-unquantized-abliterated, que a su vez parte de una versión de Gemma 4 31B instruction-tuned entrenada con Quantization-Aware Training (QAT) en cuantización q4_0 y posteriormente "desquantizada" y sometida a abliteration por el usuario huihui-ai. El proceso de abliteration elimina la dirección de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a peticiones que el modelo original bloquearía.

Sobre esa base, bravefox90 aplica un fine-tuning mediante LoRA orientado a escritura creativa, roleplay y contenido erótico (tags erp, nsfw). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. El resultado se distribuye exclusivamente en formato GGUF para inferencia con llama.cpp y entornos compatibles.

## Capacidades

- Generación de texto conversacional y narrativo en inglés.
- Escritura creativa: ficción, narrativa larga, diálogos y descripciones.
- Roleplay multi-turno y juegos de rol conversacionales.
- Contenido para adultos sin las restricciones del modelo original (abliterated).
- Conversación general con formato instruction-tuned heredado de Gemma 4 IT.
- Compatibilidad con endpoints y runtimes que aceptan GGUF (llama.cpp y derivados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la ficha del modelo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de ficción, relatos y diálogos con un tono narrativo consistente, aprovechando el fine-tuning LoRA específico para creative-writing.
- Roleplay y juegos de rol de mesa o digitales: adecuado para interpretar personajes de forma sostenida en conversaciones multi-turno, con libertad temática gracias a la abliteration.
- Generación de contenido narrativo para adultos: el modelo está explícitamente entrenado y desbloqueado para contenido NSFW/ERP, lo que lo hace utilizable en plataformas de ficción interactiva para adultos con las salvaguardas legales correspondientes.
- Prototipado de chatbots de personaje: puede desplegarse con llama.cpp u Ollama para experimentar con personalidades y estilos narrativos sin depender de APIs externas.
- Investigación sobre alineación y abliteration: sirve como caso de estudio de cómo el fine-tuning y la eliminación de rechazo alteran el comportamiento de un modelo instruction-tuned de 31B.
- Generación de texto offline en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin conexión, útil para entornos con requisitos de privacidad en la generación de narrativa.
- Fine-tuning posterior o merges: al estar basado en Gemma 4 y licencia Apache 2.0, puede servir como punto de partida para nuevos derivados de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 31B en GGUF, las cuantizaciones Q4 requieren del orden de 18-20 GB y las Q8 del orden de 33-35 GB, aunque estas cifras son estimaciones genéricas y no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; por tamaño, las cuantizaciones bajas podrían caber en GPUs de 24 GB, pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (el tag llama-cpp está presente); otros runtimes no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GemStrike-31B-GGUF | ~31B | no disponible | apache-2.0 | Roleplay/NSFW, abliterated, GGUF | Gated en Hugging Face, 0 descargas |
| Huihui-gemma-4-31B-it-qat-q4_0-unquantized-abliterated (modelo base) | ~31B | no disponible | no disponible | Gemma 4 IT abliterated | Hugging Face (huihui-ai) |
| Gemma 4 31B IT (original de Google) | ~31B | no disponible | Gemma license (no disponible en detalle) | Asistente general instruction-tuned | Hugging Face / Google |

La comparativa se limita a la cadena de derivación conocida; no se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente la capa de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtros; requiere moderación externa en cualquier despliegue.
- Contenido NSFW/ERP explícito: no apto para todos los públicos; el tag not-for-all-audiences lo indica.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar.
- Solo inglés: no se documentan capacidades multilingües.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad o rendimiento frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica disponible.
- Sesgos: no documentados, pero heredados del modelo base Gemma 4 y del dataset de fine-tuning, no disponible.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma 4 de Google puede tener condiciones adicionales; conviene verificar la compatibilidad antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad en el momento de la consulta.
- Tamaño del repo de 155,6 GB: requiere espacio de almacenamiento considerable y ancho de banda para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bravefox90/GemStrike-31B-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-qat-q4_0-unquantized-abliterated
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
