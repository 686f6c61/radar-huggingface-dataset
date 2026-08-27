# DialNexa/dialnexa-turn-match-cross-encoder-en-hi

## Resumen

DialNexa presenta un cross-encoder especializado en emparejar turnos de conversación de voz, diseñado para decidir si lo que un usuario acaba de decir coincide semánticamente con lo que un agente de voz había predicho. El modelo, denominado "The 30-Millisecond Judge", se utiliza en producción para activar una caché de respuestas predictivas: cuando la coincidencia es correcta, el agente responde en ~80 ms en lugar de ~1,5 s, reduciendo la latencia percibida en llamadas telefónicas reales.

Desarrollado por DialNexa, una plataforma de agentes de voz para ventas, soporte y cobros, este modelo se basa en el cross-encoder `mmarco-mMiniLMv2-L12-H384-v1` (XLM-RoBERTa, 118M parámetros) y se ha afinado con ~6.900 pares etiquetados extraídos de tráfico real y cuadrículas sintéticas. Su salida es una probabilidad de que dos frases cortas compartan la misma intención conversacional, incluyendo polaridad, valores de slots y negaciones. Está disponible en formato ONNX (int8 per-channel y fp32) y soporta inglés, hindi e hinglish (devanagari y romanizado), con herencia multilingüe del modelo base.

La relevancia actual radica en su enfoque pragmático: en lugar de optimizar solo precisión, el modelo está calibrado para minimizar falsos positivos (que en producción significan responder una frase equivocada a un humano) a costa de sacrificar recall, con un umbral de servicio de 0,995. Su latencia de ~26 ms p50 para 20 candidatos en CPU lo hace viable para entornos de telefonía en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer (XLM-RoBERTa base, 12 capas, 384 hidden) |
| Parametros totales | 118M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (configuracion de truncamiento del tokenizer) |
| Tipos de cuantizacion | int8 per-channel (ONNX), fp32 (ONNX) |
| Idiomas soportados | Entrenado: en, hi, hinglish (devanagari + romanizado + code-mixed). Herencia multilingue: varios idiomas indicos (ta, te, bn, mr, kn, ml, gu, pa) con rendimiento parcial |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_quantized.onnx int8, model.onnx fp32) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa, concretamente la variante `mmarco-mMiniLMv2-L12-H384-v1` (118M parámetros, 12 capas, 384 dimensiones ocultas). A diferencia de un bi-encoder, procesa el par de frases conjuntamente, lo que permite capturar interacciones finas como negaciones, cambios de polaridad o valores de slots. El tokenizer es el de XLM-R, compartido por ambos artefactos ONNX.

El entrenamiento consistió en un fine-tuning supervisado sobre ~6.900 pares etiquetados, combinando datos extraídos de producción (llamadas reales) con cuadrículas sintéticas de conceptos. El proceso incluyó un "bake-off" entre el modelo base elegido y un MLM de dominio (MuRIL): el cross-encoder con pre-entrenamiento en relevancia (mMARCO) ganó decisivamente, ya que el MLM puro alcanzaba AUC 0,90 pero no recordaba nada en el límite de FPR requerido. Se aplicó cuantización int8 per-channel, que resultó crítica: la cuantización per-tensor "resucitaba" falsos negativos que se habían eliminado durante el entrenamiento, por lo que se recomienda re-ejecutar la suite adversarial sobre el artefacto exportado.

## Capacidades

- Emparejamiento de intención conversacional: decide si dos frases cortas (lo que el usuario dijo vs. lo que se predijo) comparten la misma intención de turno, incluyendo significado, polaridad y valores de slots.
- Detección de paráfrasis multilingüe: maneja equivalencias entre inglés, hindi e hinglish, incluyendo escritura devanagari y romanizada (ej. "हाँ जी" ~ "haan ji bilkul").
- Robustez ante negación y polaridad: distingue "yeah" de "nah", "चलेगा" de "नहीं चलेगा", "I can make it" de "I can't make it".
- Sensibilidad a valores de slots: diferencia "at 6 AM" de "at 6 PM", "tomorrow" de "कल" (que puede significar ayer o mañana según contexto).
- Distinción pregunta-respuesta: no confunde "can I call you back?" con "please call me back".
- Inferencia eficiente en CPU: ~3 ms por par, ~26 ms p50 para 20 candidatos en 2 hilos con AVX512-VNNI.
- Herencia multilingüe: funciona sin entrenamiento explícito en varios idiomas índicos (ta, te, bn, mr, kn, ml, gu, pa) con recall parcial y cero falsos positivos en pruebas.

## Casos de uso

- Caché predictiva en agentes de voz: el modelo decide si la respuesta predicha por el agente coincide con lo que el usuario acaba de decir. Si la probabilidad supera 0,995, se sirve la respuesta cacheada en ~80 ms; si no, se procesa la solicitud completa (~1,5 s). Esto reduce la latencia percibida en llamadas de ventas y soporte.
- Verificación de intenciones en IVR (respuesta de voz interactiva): en sistemas de menú telefónico, el modelo puede confirmar si la entrada del usuario (ej. "sí, quiero pagar ahora") coincide con la opción esperada, evitando errores de enrutamiento.
- Detección de paráfrasis en chatbots multilingües: para entornos que atienden a usuarios en inglés e hindi/hinglish, el modelo puede identificar si dos formulaciones diferentes expresan la misma solicitud, permitiendo respuestas unificadas.
- Filtrado de respuestas en asistentes de voz: antes de que un agente de IA responda, el modelo valida que la respuesta generada corresponde a la pregunta real del usuario, reduciendo alucinaciones en diálogos de dominio abierto.
- Análisis de calidad de conversaciones: en post-llamada, el modelo puede comparar lo que el usuario dijo con lo que el agente interpretó, detectando desalineaciones de intención para mejorar los flujos de diálogo.
- Enrutamiento de llamadas en centros de contacto: dado un conjunto de intenciones predefinidas (pago, cancelación, soporte técnico), el modelo puede clasificar la frase del usuario en la intención correcta con alta precisión, incluso con variaciones coloquiales o code-mixed.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor, evaluados sobre el artefacto int8 per-channel en un test split disjunto de llamadas reales:

| Metrica (artefacto int8 per-channel) | Valor |
|---|---|
| AUC en test | 0,945 |
| Recall @ umbral 0,998 (FPR 2,5%) | 0,59 |
| Recall @ umbral 0,995 (FPR 4,1%) | 0,66 |
| Suite adversarial (100 trampas: negacion, slots, swaps, Q<->A) | 0 falsos positivos del mismo script |
| Latencia batch de 20 candidatos, 2 hilos CPU (avx512-vnni) | 26 ms p50 / 59 ms p95 |
| Latencia par individual | ~3 ms |
| RAM (sesion + tokenizer) | ~450 MB |

En producción, las auditorías humanas de las primeras semanas mostraron que los falsos positivos duros se redujeron a la mitad frente al matcher anterior solo en inglés, con cero errores de polaridad en el primer período de observación. Ejemplos reales: `'नहीं सर, अभी बात करने का समय नहीं'` se emparejó correctamente con una predicción de "ocupado/posponer" a 0,9996; `'Three will be better.'` coincidió con `'Three works for me'` a 1,0000.

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para CPU con instrucciones AVX512-VNNI; requiere ~450 MB de RAM (sesión + tokenizer).
- GPU: no es necesaria; el artefacto fp32 puede ejecutarse en GPU si se desea, pero el modelo está diseñado para entornos de baja latencia en CPU.
- Despliegue recomendado: onnxruntime con CPUExecutionProvider, usando el tokenizer de HuggingFace `tokenizers`. No se menciona soporte para vLLM, llama.cpp u Ollama; el formato ONNX es el estándar.
- Latencia: ~3 ms por par individual, ~26 ms p50 para 20 candidatos en 2 hilos. Para producción con alta concurrencia, se puede escalar horizontalmente con múltiples instancias.
- Compatibilidad: cualquier máquina con x86-64 y soporte AVX2 (aunque AVX512-VNNI mejora el rendimiento). No requiere GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|---|
| DialNexa turn-match (este) | 118M | 256 tokens | Cross-encoder | en, hi, hinglish | Apache 2.0 | Matching de intencion en voz |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (base) | 118M | 512 tokens | Cross-encoder | 50+ idiomas | Apache 2.0 | Reranking multilingue |
| MuRIL (MLM de dominio) | 244M | 512 tokens | MLM | 16 idiomas indicos | MIT | Embeddings y clasificacion |

El modelo base mMiniLMv2 es el punto de partida; DialNexa lo ha afinado específicamente para el dominio de voz y telephony, con un tokenizer truncado a 256 tokens y una calibración de umbral orientada a minimizar falsos positivos. MuRIL, aunque cubre más idiomas indicos, no fue elegido porque su pre-entrenamiento en MLM no se alineaba con la tarea de relevancia, resultando en un recall insuficiente en el límite de FPR requerido. No se dispone de comparativas directas con otros cross-encoders comerciales o de código abierto en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un clasificador binario, no genera texto, pero puede producir falsos positivos (emparejar frases que no comparten intención) o falsos negativos (rechazar coincidencias válidas). El autor recomienda ajustar el umbral según la asimetría de costes de cada aplicación.
- Idiomas no entrenados: el modelo no es seguro para idiomas sin señal de entrenamiento. Se observaron inversiones de polaridad en urdu con confianza >0,99. En producción, DialNexa permite por script y deriva el matcher para otros idiomas.
- Contexto limitado: el tokenizer trunca a 256 tokens, por lo que frases muy largas o con múltiples cláusulas pueden perder información relevante.
- Dependencia del pre-entrenamiento: la herencia multilingüe de mMARCO no garantiza rendimiento en todos los idiomas; solo se validaron algunos índicos con recall parcial.
- Cuantización sensible: la cuantización per-tensor puede reintroducir falsos negativos; se recomienda re-evaluar la suite adversarial tras cualquier re-cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías. El autor no proporciona soporte oficial más allá del blog y la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DialNexa/dialnexa-turn-match-cross-encoder-en-hi
- Blog técnico (The 30-Millisecond Judge): https://dialnexa.com/blogs/the-30-millisecond-judge-training-a-small-model-to-decide-when-our-voice-agent-is-allowed-to-cheat/
- Plataforma DialNexa: https://dialnexa.com/
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
