# NyayaLabs98/nyaya-3b-v3-GGUF

## Resumen

Nyaya-3B-v3-GGUF es una versión cuantizada en formato GGUF del modelo Nyaya-3B-v3, desarrollado por NyayaLabs98 como componente lector del sistema de guía legal india Nyaya. Se trata de un fine-tuning de Qwen/Qwen2.5-3B-Instruct, un transformer denso de 3.085.938.688 parámetros, especializado en responder consultas sobre derecho indio en inglés e hindi. La conversión a GGUF se realizó con llama.cpp (convert_hf_to_gguf.py, build b10795) a partir de los pesos bf16 fusionados, y se ofrece en dos cuantizaciones: Q4_K_M (1.93 GB) y Q8_0 (3.29 GB).

El modelo resuelve el problema de proporcionar información legal accesible a ciudadanos indios, con un system prompt que insta a citar la ley vigente y recomendar un abogado licenciado. Su relevancia actual radica en que puede desplegarse localmente en laptops y servidores mediante llama.cpp u Ollama, sin necesidad de GPU dedicada. No obstante, el propio autor indica que el sistema Nyaya ahora utiliza Qwen/Qwen3-4B-Instruct-2507 como lector predeterminado, y que estos pesos quedan disponibles para quienes necesiten un modelo de 3B alineado con Nyaya. La precisión del sistema depende en gran medida de la recuperación de estatutos: con la sección correcta en contexto alcanza un 63% de fact recall, mientras que sin ella cae al 20%.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (ventana configurada en el ejemplo de despliegue) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (formato GGUF) |
| Idiomas soportados | en, hi |
| Licencia | qwen-research (no comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Nyaya-3B-v3-GGUF es la cuantización de Nyaya-3B-v3, un modelo basado en Qwen/Qwen2.5-3B-Instruct. La arquitectura es un transformer denso de 3.085 millones de parámetros, sin componentes MoE ni SSM. El modelo fue fine-tuneado para el dominio legal indio, pero no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni técnicas de alineación como RLHF o DPO. La conversión a GGUF se hizo con convert_hf_to_gguf.py de llama.cpp (build b10795) a partir de los pesos bf16 fusionados. No se describen innovaciones técnicas más allá de la cuantización; el sistema Nyaya se apoya en un recuperador de estatutos externo para aumentar la precisión.

## Capacidades

- Generación de texto en inglés e hindi, orientada a consultas sobre derecho indio.
- Citación de secciones de estatutos cuando se proporciona el contexto legal adecuado.
- Integración con el recuperador de estatutos del sistema Nyaya (CLI `nyaya ask`), que imprime las secciones relevantes para incluir en el prompt.
- Despliegue local mediante llama.cpp (llama-server) y Ollama, con system prompt de Nyaya y temperatura 0.3.
- Soporte de conversación multi-turno a través de la API compatible con OpenAI (v1/chat/completions).
- No se ha confirmado soporte de tool calling, agentes ni razonamiento multi-paso en la documentación del modelo.

## Casos de uso

- Consulta legal de primera línea para ciudadanos indios: un usuario pregunta en hindi "Police FIR nahi likh rahi, kya karu?" y el modelo genera una respuesta informativa basada en el derecho indio. Es adecuado porque está fine-tuneado para este dominio y soporta hindi.
- Asistencia en despachos de abogados para investigación preliminar: un abogado puede obtener un resumen rápido de posibles secciones aplicables a un caso, antes de verificar con fuentes primarias. Requiere el recuperador de estatutos para mejorar la precisión.
- Educación legal para estudiantes: el modelo puede explicar conceptos del Bharatiya Nyaya Sanhita (BNS) en lenguaje sencillo, en inglés o hindi, como material de estudio.
- Integración en chatbots de ONGs o servicios de ayuda legal gratuita (NALSA/DLSA): el modelo puede desplegarse en local con Ollama para responder preguntas básicas, derivando casos complejos a abogados licenciados.
- Prototipado de sistemas de RAG legal: el modelo se usa como lector en un pipeline de recuperación aumentada, donde el recuperador de estatutos (nyaya-model) inserta las secciones correctas en el prompt. Es el caso de uso principal según el autor, alcanzando 63% de fact recall con recuperación.
- Investigación académica sobre modelos legales en hindi: los investigadores pueden comparar el rendimiento de este modelo con otros en benchmarks como BhashaBench-Legal.

## Benchmarks y rendimiento

Los benchmarks disponibles provienen de la evaluación interna del sistema Nyaya y de la muestra de BhashaBench-Legal:

| Benchmark | Nyaya-3B-v3-GGUF | Qwen2.5-3B-Instruct (base) | Qwen3-4B-Instruct-2507 |
|---|---|---|---|
| Nyaya-Eval-v1 fact recall | 32.9% | 34.3% (tied) | 52.0% (con recuperación idéntica) |
| BhashaBench-Legal (muestra 1.500) | 45.2% | 47.8% (tied) | no disponible |
| Con recuperación de estatutos | 63% | no disponible | no disponible |
| Sin recuperación | 20% | no disponible | no disponible |

Según el autor, el modelo está estadísticamente empatado con el modelo base en Nyaya-Eval-v1 (95% CI spans zero). La cuantización no se evaluó por separado; se espera que Q8_0 coincida con bf16 dentro del ruido y que Q4_K_M pierda un poco.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 1.93 GB de VRAM (tamaño del archivo GGUF); Q8_0 requiere aproximadamente 3.29 GB, más overhead de runtime.
- GPU recomendadas: no se especifican por el autor. Al ser un modelo de 3B, es apto para GPUs de consumo como RTX 3060 (12 GB), RTX 4070, o incluso iGPU con suficiente RAM compartida.
- Cabe en consumer GPU: sí, Q4_K_M puede ejecutarse en cualquier GPU con al menos 4 GB de VRAM; Q8_0 necesita al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (con Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (Nyaya-Eval-v1) | Disponibilidad |
|---|---|---|---|---|---|
| Nyaya-3B-v3-GGUF | 3.085.938.688 | 8192 tokens (configurado) | qwen-research (no comercial) | 32.9% fact recall | GGUF en HuggingFace |
| Qwen2.5-3B-Instruct (base) | 3B (según nombre) | no disponible | qwen-research | 34.3% fact recall | HuggingFace (enlace a licencia) |
| Qwen3-4B-Instruct-2507 | 4B (según nombre) | no disponible | Apache-2.0 | 52.0% fact recall (con recuperación) | GGUF oficial |

No se dispone de información detallada sobre el contexto de los modelos comparados en la documentación proporcionada.

## Limitaciones y advertencias

- No es consejo legal: el autor advierte que el modelo proporciona información legal, no asesoramiento. La práctica de la ley en India está reservada a abogados inscritos bajo la Advocates Act de 1961.
- Licencia no comercial: derivado de Qwen2.5-3B-Instruct bajo Qwen Research License, solo uso de investigación/no comercial.
- Riesgo de alucinación: usado sin recuperación, el modelo responde desde la memoria y puede citar la sección equivocada.
- Rendimiento limitado: en los benchmarks internos está estadísticamente empatado con el modelo base; el sistema Nyaya ahora usa un modelo más grande (Qwen3-4B) como lector predeterminado.
- Dependencia de la recuperación: la precisión del sistema depende de incluir la sección correcta del estatuto en el contexto; sin ella, el fact recall cae al 20%.
- Cuantización: Q4_K_M puede perder un poco de precisión con respecto a bf16; Q8_0 se espera que coincida dentro del ruido, pero la cuantización no se evaluó por separado.
- Idiomas: solo inglés e hindi (en, hi). No soporta otros idiomas.
- Contexto: la ventana configurada es 8192 tokens, lo que puede ser limitado para documentos legales extensos.

## Enlaces

- https://huggingface.co/NyayaLabs98/nyaya-3b-v3-GGUF
- https://huggingface.co/NyayaLabs98/nyaya-3b-v3
- https://github.com/JitendraJha98/nyaya-model
- https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- https://huggingface.co/mradermacher/nyaya-3b-v3-GGUF
