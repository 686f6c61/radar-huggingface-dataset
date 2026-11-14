# Momenrezk11/NAMAA-Egyptian-TTS

## Resumen

NAMAA-Egyptian-TTS es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio coloquial, desarrollado por la comunidad NAMAA (Network for Advancing Modern Arabic AI) y publicado por el usuario Momenrezk11 en Hugging Face. Se construye como un ajuste del modelo base ResembleAI/chatterbox, la arquitectura TTS multilingüe de Resemble AI, y está orientado a generar habla natural en dialecto egipcio para uso conversacional cotidiano, en lugar de árabe estándar moderno (MSA).

El modelo cuenta con aproximadamente 536 millones de parámetros en formato safetensors y un repositorio de 5,4 GB que incluye los checkpoints y activos necesarios para inferencia local o alojada. Su relevancia radica en cubrir un nicho poco atendido: la mayoría de sistemas TTS en árabe priorizan el MSA, mientras que este modelo se centra en la prosodia, el ritmo y las expresiones del dialecto egipcio, además de ofrecer clonación de voz mediante audio de referencia.

La licencia MIT permite uso tanto de investigación como comercial con atribución, lo que lo hace atractivo para productos de voz en árabe egipcio. No obstante, el modelo es muy reciente (creado en noviembre de 2026) y no registra descargas ni likes, por lo que su validación por parte de la comunidad es todavía incipiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Chatterbox Multilingual TTS (modelo base ResembleAI/chatterbox) |
| Parámetros totales | 535.989.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | árabe (dialecto egipcio, `language_id = "ar"`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Chatterbox Multilingual TTS de Resemble AI, un sistema de síntesis de voz que combina un modelo de lenguaje T3 (text-to-token) con un decodificador de audio. El checkpoint principal incluido es `t3_mtl23ls_v2.safetensors`, que se carga sobre la clase `ChatterboxMultilingualTTS`. La generación se realiza mediante el método `model.generate(text, language_id="ar")`, y opcionalmente admite un `audio_prompt_path` para transferencia de estilo y similitud de hablante.

Según la model card, el comportamiento en dialecto egipcio se logra mediante "configuración especializada, prompting y patrones de uso curados", en lugar de un entrenamiento centrado en MSA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de la arquitectura Chatterbox.

## Capacidades

- Generación de voz a partir de texto en árabe egipcio coloquial (`language_id = "ar"`).
- Prosodia conversacional natural y ritmo propios del dialecto egipcio.
- Clonación de voz y transferencia de estilo mediante audio de referencia (`audio_prompt_path`), útil para similitud de hablante y tono.
- Inferencia acelerada por GPU (CUDA), con soporte también para CPU y MPS según el ejemplo de código.
- Repositorio autocontenido con todos los checkpoints y activos necesarios para inferencia local o alojada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de referencia.

## Casos de uso

- Asistentes de voz en árabe egipcio: el modelo puede generar respuestas habladas con prosodia conversacional para chatbots telefónicos o asistentes domésticos dirigidos a usuarios egipcios, donde el MSA resultaría artificial.
- Doblaje y localización de contenido: conversión de guiones a voz en dialecto egipcio para vídeos, audiolibros o material educativo, con la opción de clonar la voz del narrador original mediante audio de referencia.
- Accesibilidad y lectura en voz alta: síntesis de textos en egipcio para aplicaciones de lectura asistida, manteniendo el ritmo y las expresiones del dialecto.
- Generación de voces para videojuegos y animación: creación de diálogos de personajes con estilo y tono transferidos desde una muestra de referencia.
- Prototipado de productos de voz: gracias a la licencia MIT y al repositorio autocontenido, equipos pueden integrar el modelo en pruebas de concepto comerciales sin restricciones de licencia.
- Investigación en dialectología y TTS árabe: banco de pruebas para evaluar la calidad de síntesis en dialecto egipcio frente a sistemas entrenados en MSA, con casos de prueba específicos aportados por la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 536 millones de parámetros, la inferencia en precisión completa requiere del orden de 2-3 GB de VRAM, aunque este dato no está confirmado en la documentación.
- GPU recomendadas: no disponible. El ejemplo de código usa `device = "cuda"` de forma genérica.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del modelo es plausible en tarjetas con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la librería `chatterbox` con `ChatterboxMultilingualTTS`; también se mencionan CPU y MPS como dispositivos alternativos. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAMAA-Egyptian-TTS | 535.989.248 | no disponible | árabe (egipcio) | MIT | Hugging Face (0 descargas) |
| ResembleAI/chatterbox (base) | no disponible | no disponible | multilingüe | no disponible en la información | Hugging Face |
| Alternativas TTS en árabe | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La pronunciación de la letra "ق" en egipcio puede omitirse en ocasiones.
- Los números a veces no se pronuncian correctamente.
- Puede haber inconsistencias entre el texto de entrada y el flujo del audio, dependiendo del prompt de audio utilizado.
- El modelo está orientado exclusivamente al dialecto egipcio; no se garantiza un rendimiento adecuado en MSA ni en otros dialectos árabes.
- Riesgo de alucinación y de artefactos en la síntesis de voz, especialmente con entradas atípicas o prompts de referencia de baja calidad.
- No se documentan sesgos específicos, pero al ser un ajuste sobre un modelo base multilingüe podría heredar sesgos de este.
- La licencia MIT permite uso comercial con atribución, pero el modelo es muy reciente y sin validación comunitaria (0 descargas, 0 likes), lo que desaconseja su uso en producción sin evaluación previa.
- No se especifican requisitos de hardware ni latencias, lo que dificulta la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Momenrezk11/NAMAA-Egyptian-TTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/omarelshehy/NAMAA-Egyptian-Voice
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Repositorio citado en la model card: https://huggingface.co/NAMAA-Space/NAMAA-Egyptian-TTS
