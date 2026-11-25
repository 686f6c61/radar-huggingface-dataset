# FrozenWolf/xenon-voices

## Resumen

xenon-voices es un paquete de artefactos de síntesis de voz (text-to-speech) publicado por el usuario FrozenWolf en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión y reempaquetado del modelo Pocket TTS de Kyutai al formato GGUF para su uso con llama.cpp, junto con una proyección multimodal (mmproj) que incorpora cuatro voces predefinidas y un conjunto de ocho sonidos de reacción de oyente en formato WAV. El repositorio está pensado como dependencia de un asistente conversacional llamado xenon, que carga estos ficheros para hablar con la voz seleccionada y emitir sonidos de escucha activa mientras el usuario habla.

El modelo base, Pocket TTS, es un sistema de síntesis de voz en inglés de Kyutai con licencia CC BY 4.0 en los pesos y MIT en el código. La conversión aquí presentada cuantiza el modelo principal a Q4_K_M y el lado de audio a Q8_0, con un total de 79.622.144 parámetros en safetensors y un tamaño de repositorio de 0,1 GB. El soporte lingüístico se limita al inglés.

La relevancia de esta ficha es acotada: no aporta innovación arquitectónica propia ni benchmarks, sino que documenta un formato alternativo y ligero para desplegar un TTS pequeño en local mediante llama.cpp. Es útil para quien quiera integrar voces predefinidas y sonidos de reacción en un pipeline conversacional sin depender de servicios en la nube, pero debe evaluarse con cautela por la ausencia de métricas publicadas y por las restricciones de uso derivadas de la política de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS de Kyutai (text-to-speech), convertida a GGUF; el lado de audio en mmproj |
| Parametros totales | 79.622.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), Q8_0 (mmproj); embeddings de voz en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (safetensors como dato de referencia), WAV para los sonidos de reacción, .embd para voces individuales |

## Arquitectura y entrenamiento

El modelo subyacente es Pocket TTS de Kyutai, un sistema de síntesis de voz para inglés. En este repositorio no se entrena ningún modelo nuevo: se parte de los pesos de Kyutai y se aplica una conversión de formato con `convert_hf_to_gguf.py` de llama.cpp, seguida de cuantización a Q4_K_M para el modelo principal y a Q8_0 para la proyección multimodal de audio. Sobre esa mmproj se añaden cuatro tensores de voz (`voice.alba`, `voice.azelma`, `voice.eponine`, `voice.fantine`), de modo que llama.cpp (versión b12283 o posterior) las reconoce como voces predefinidas.

Los detalles de entrenamiento —número de tokens, composición del dataset, uso de RLHF o DPO— no están disponibles en la información proporcionada. Tampoco se documentan innovaciones técnicas propias del empaquetado más allá de la conversión de formato y la inclusión de voces como tensores. Las voces provienen de Alba MacKenna (liberada por Kyutai) y del corpus VCTK del CSTR de la Universidad de Edimburgo, todas bajo CC BY 4.0. Los ocho sonidos de reacción se generaron con Chatterbox Turbo de Resemble AI (MIT) clonando la voz alba de Pocket TTS.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio por fragmentos a medida que se genera.
- Cuatro voces predefinidas seleccionables: alba, azelma, eponine y fantine.
- Emisión de ocho sonidos de reacción de oyente (mm-hm, okay, right, exactly, wow, oh dear, heh, hmm) en WAV a 24 kHz mono 16 bits.
- Integración con llama.cpp para carga de modelo y mmproj.
- Gestión de turnos conversacionales: el modelo de chat elige un sonido de reacción cuando el usuario hace una pausa y lo reproduce antes de la respuesta, sin solapar con su propia voz y sin escuchar durante la reproducción y su eco.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (reconocimiento de voz) en la información disponible.

## Casos de uso

- Asistente conversacional local: cargar `english-q4_k_m.gguf` y `mmproj-english-voices-q8_0.gguf` con llama.cpp para que un chatbot responda con voz sintetizada en inglés sin depender de APIs externas, aprovechando el tamaño reducido del repositorio (0,1 GB).
- Señales de escucha activa en interfaces de voz: usar los ocho WAV de reacción para que el asistente emita confirmaciones breves (mm-hm, okay) mientras el usuario habla, mejorando la percepción de interactividad en conversaciones multi-turno.
- Selección de personaje o locutor: emplear los ficheros `.embd` individuales para cambiar entre las cuatro voces según el contexto de la aplicación (por ejemplo, distintos personajes en una narrativa interactiva).
- Prototipado de agentes de voz en investigación: integrar el TTS en un pipeline de diálogo para experimentar con turnos, pausas y reacciones sin coste de inferencia en nube, dado el bajo requisito de recursos.
- Accesibilidad y lectura en voz alta: convertir texto a audio en inglés para aplicaciones de lectura asistida en entornos de escritorio con llama.cpp.
- Pruebas de integración en CI: validar que la conversión GGUF y la carga de voces predefinidas funcionan con versiones concretas de llama.cpp (b12283 y posteriores) antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 79,6 millones de parámetros y cuantización Q4_K_M más mmproj Q8_0, el modelo es muy pequeño y cabe holgadamente en GPUs de consumo, aunque no se documentan cifras exactas.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU de consumo moderna debería ser suficiente, pero no hay validación publicada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio (0,1 GB), aunque no se confirma en la información.
- Opciones de despliegue: llama.cpp (versión b12283 o posterior para las voces predefinidas); no se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| FrozenWolf/xenon-voices | 79.622.144 | no disponible | en | cc-by-4.0 | GGUF, WAV, .embd | Conversión de Pocket TTS con voces añadidas |
| kyutai/pocket-tts | no disponible | no disponible | en | CC BY 4.0 (pesos), MIT (código) | no disponible | Modelo original de Kyutai |
| ResembleAI/chatterbox-turbo | no disponible | no disponible | no disponible | MIT | no disponible | Usado aquí solo para generar los sonidos de reacción |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se han publicado benchmarks ni métricas de calidad de síntesis, latencia o inteligibilidad.
- Riesgo de alucinación no aplicable al ser un TTS, pero sí posible mala pronunciación o artefactos de audio no evaluados.
- La política de uso de Kyutai prohíbe la suplantación de voz sin consentimiento y presentar el audio como grabación genuina de una persona real.
- Los sonidos de reacción son habla sintética generada con Chatterbox Turbo, no grabaciones reales; deben presentarse como tales.
- Ni Kyutai ni Resemble AI aclaran cómo se aplica su licencia al audio generado con sus modelos, lo que introduce incertidumbre legal para uso comercial.
- La licencia CC BY 4.0 exige atribución; hay que citar a Kyutai, a Alba MacKenna, al CSTR de la Universidad de Edimburgo y a Resemble AI según corresponda.
- Dependencia de una versión concreta de llama.cpp (b12283 o posterior) para cargar las voces predefinidas; versiones anteriores pueden no reconocerlas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/FrozenWolf/xenon-voices
- Pocket TTS de Kyutai (modelo): https://huggingface.co/kyutai/pocket-tts
- Pocket TTS de Kyutai (código): https://github.com/kyutai-labs/pocket-tts
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Chatterbox Turbo de Resemble AI: https://huggingface.co/ResembleAI/chatterbox-turbo
