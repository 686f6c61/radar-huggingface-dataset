# QuantumDesk-AI/ultravox-qwen3.6-27b-v3

## Resumen

Ultravox-qwen3.6-27b-v3 es un modelo de lenguaje-habla (speech-language model) bilingüe inglés-español desarrollado por QuantumDesk-AI, orientado específicamente a agentes de voz telefónicos, como recepcionistas automáticos y agentes de ventas. Se construye sobre la arquitectura Ultravox de Fixie.ai: un LLM Qwen 3.6-27B congelado que consume audio directamente mediante un codificador Whisper-large-v3-turbo y un adaptador de proyección, sin paso intermedio de transcripción a texto.

La versión v3 es la sucesora de v2 y su principal novedad es la incorporación del español, aprendido desde cero en una fase de continuación de 6.000 pasos con 60.000 enunciados telefónicos sintéticos en español, Common Voice Spanish y datos ancla en inglés para evitar el olvido catastrófico. El modelo responde de forma nativa a audio en el idioma del interlocutor y está entrenado con aumentación telefónica real (remuestreo a 8 kHz, compresión AMR/μ-law, filtro de banda y ruido rosa).

Es relevante ahora porque cubre un nicho concreto —voz telefónica bilingüe en producción— con licencia Apache 2.0, un coste de entrenamiento declarado de unos 390 dólares en 2×H200 y métricas publicadas sobre audio degradado de calidad telefónica, lo que permite evaluar su idoneidad para despliegues reales de atención al cliente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ultravox: LLM Qwen 3.6-27B congelado + codificador Whisper-large-v3-turbo + adaptador de proyección (LoRA r=16 en el codificador) |
| Parámetros totales | 56.373.248 (dato real de safetensors del repositorio; el LLM base Qwen 3.6-27B se referencia por separado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Ultravox: un LLM Qwen 3.6-27B congelado que recibe representaciones de audio producidas por un codificador Whisper-large-v3-turbo y un adaptador de proyección. El codificador se ajusta con LoRA de rango 16 y el entrenamiento emplea destilación de conocimiento tomando el propio LLM de texto como profesor. Al mantener el LLM congelado, sus capacidades de texto permanecen inalteradas. El modelo base Qwen 3.6 incorpora atención lineal híbrida, según se menciona en la model card a propósito del serving con vLLM.

El entrenamiento se organizó en tres fases sobre 2×H200, con un coste declarado de aproximadamente 390 dólares. La fase 1B (35.000 pasos, batch efectivo 16) usó corpus ASR en inglés y conversaciones telefónicas reales con aumentación telefónica (remuestreo a 8 kHz, compresión AMR/μ-law, filtro de banda, ruido rosa y ganancia). La fase 2 (15.000 pasos) añadió 150.000 enunciados sintéticos densos en entidades (números de teléfono, nombres, correos deletreados, direcciones, fechas y horas) sobre 31 voces TTS clonadas, más 40.000 pares de diálogo hablado y datos anti-olvido de la fase 1. La fase 3 (6.000 pasos) introdujo 60.000 enunciados sintéticos en español (TTS es-MX), Common Voice Spanish ×3 y anclas en inglés (audio telefónico real, Common Voice English y LibriSpeech).

## Capacidades

- Comprensión y generación de voz de extremo a extremo: responde directamente a audio sin transcripción intermedia, en el idioma que habla el interlocutor.
- Reconocimiento automático de habla (ASR) bilingüe inglés-español, con prompts de transcripción específicos por idioma.
- Conversación de voz multi-turno con persona definida mediante system prompt.
- Reconocimiento robusto de entidades telefónicas: números de teléfono, nombres de persona y empresa, correos deletreados, direcciones, fechas, horas y servicios.
- Robustez ante audio degradado de telefonía: remuestreo a 8 kHz, compresión μ-law/AMR, filtro de banda y ruido.
- Generación de respuestas cortas y naturales orientadas a agentes de recepción y ventas.
- Capacidades de texto heredadas del LLM base Qwen 3.6-27B (el LLM está congelado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio más allá del habla: no disponible.

## Casos de uso

- Recepcionista telefónico automatizado: el modelo gestiona conversaciones de voz multi-turno con una persona definida por system prompt y responde en el idioma del llamante, adecuado para centralitas que atienden llamadas en inglés y español sin enrutado manual por idioma.
- Agente de ventas telefónico: entrenado con 40.000 pares de diálogo hablado y respuestas cortas de una o dos frases, encaja en flujos de captación y cualificación de leads donde se requiere naturalidad y brevedad.
- Captura de datos de contacto en llamadas: con una precisión del 97,0% en dígitos de números de teléfono y 100% en fechas, es apto para tomar datos de reserva, pedidos o incidencias directamente de la voz.
- Transcripción bilingüe de llamadas: los prompts de transcripción por idioma permiten generar actas o registros de conversaciones telefónicas en inglés y español, con WER de 4,70% en LibriSpeech test-other y 4,17% en Common Voice 17 español.
- Enrutado y triaje de llamadas entrantes: la detección del idioma del interlocutor y la comprensión de audio degradado permiten clasificar la llamada y derivarla al departamento adecuado.
- Verificación de identidad por voz en soporte: la combinación de reconocimiento de nombres, correos deletreados y fechas permite validar datos del cliente durante la llamada, aunque la precisión en correos deletreados (49,4%) limita su uso como único factor.
- Asistente de voz para líneas de atención con audio de baja calidad: la aumentación telefónica del entrenamiento lo hace adecuado para entornos con códecs AMR/μ-law y ruido de fondo.

## Benchmarks y rendimiento

Resultados publicados por el autor, inferencia nativa y decodificación greedy, medidos en la misma ejecución para v3 y v2 sobre el mismo audio (n=100 por conjunto de WER; 500 clips de calidad telefónica en el benchmark de entidades):

| Métrica | v3 | v2 |
|---|---|---|
| LibriSpeech test-clean WER | 2,17% | 2,12% |
| LibriSpeech test-other WER | 4,70% | 6,99% |
| Common Voice 17 Spanish WER | 4,17% | 30,2% |
| Precisión en dígitos de número de teléfono | 97,0% | 95,5% |
| Precisión en nombres de persona | 75,9% | 82,5% |
| Precisión en nombres de empresa | 83,8% | 86,8% |
| Precisión en correos deletreados | 49,4% | 53,2% |
| Precisión en fecha / servicio | 100% / 99,6% | 100% / 100% |

El autor advierte que las voces sintéticas de entrenamiento se clonaron de hablantes de LibriSpeech test-clean (con frases distintas), por lo que test-clean debe considerarse ligeramente optimista; test-other no tiene solapamiento de hablantes. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 0,1 GB en safetensors, pero el LLM base Qwen 3.6-27B se referencia por separado y su huella no se detalla.
- GPU recomendadas: el entrenamiento se realizó en 2×H200; no se especifican GPU mínimas para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: transformers (librería nativa, máxima calidad) y vLLM con `--trust-remote-code`. El autor señala que la atención lineal híbrida de Qwen 3.6 pierde algo de precisión bajo vLLM frente a transformers nativo; para máxima calidad recomienda vLLM con `--no-enable-chunked-prefill` y dtypes por defecto (fp32) para la caché mamba.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ultravox-qwen3.6-27b-v3 | 56.373.248 (safetensors del repo; LLM base Qwen 3.6-27B aparte) | en, es | no disponible | Apache 2.0 | Mejor WER en test-other (4,70%) y español (4,17%); peor en nombres de persona (75,9%) |
| ultravox-qwen3.6-27b-v2 | no disponible | en | no disponible | Apache 2.0 | Predecesor; mejor en nombres de persona (82,5%) y correos (53,2%), sin español (WER 30,2%) |
| Otros modelos de la familia Ultravox | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Las respuestas en español pueden sonar rígidas: parte del texto sintético de entrenamiento contenía artefactos de plantilla (por ejemplo, artículos duplicados) que ocasionalmente aparecen en respuestas conversacionales.
- Los turnos muy cortos (menos de un segundo, como "sí" u "okay") son la entrada más débil; el autor recomienda rellenar con unos 500 ms de silencio.
- Los nombres de persona en inglés rinden unos 7 puntos por debajo de v2 (75,9% frente a 82,5%); para despliegues solo en inglés donde los nombres sean críticos, v2 sigue siendo una opción razonable.
- Solo admite inglés y español; el habla con acento marcado rinde peor.
- El estilo de respuesta está entrenado para una forma concreta de turno de usuario (system prompt + texto + audio en base64); desviarse de esa estructura reduce la calidad.
- Existe una brecha de precisión al servir con vLLM frente a transformers nativo, derivada de la atención lineal híbrida de Qwen 3.6.
- La precisión en correos deletreados es baja (49,4%), lo que desaconseja su uso como único mecanismo de captura de correos en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; el prompt de sistema recomendado incluye instrucciones explícitas de no inventar citas y pedir repetición si no se entiende.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial sin restricciones adicionales declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuantumDesk-AI/ultravox-qwen3.6-27b-v3
- Versión anterior v2: https://huggingface.co/QuantumDesk-AI/ultravox-qwen3.6-27b-v2
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3.6-27B
- Framework Ultravox (Fixie.ai): https://github.com/fixie-ai/ultravox
