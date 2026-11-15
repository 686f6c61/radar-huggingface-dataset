# paloik/Qwen3-TTS-12Hz-1.7B-CustomVoice-int8-ov

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice-int8-ov es una adaptación cuantizada del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, publicada por el usuario paloik. Se trata de una conversión a formato OpenVINO IR con el backbone de 1.700 millones de parámetros comprimido a INT8 simétrico y el vocoder de audio mantenido en FP16 sin pérdida. El objetivo es ejecutar TTS de alta expresividad en hardware Intel (Core Ultra, Arc GPU y NPU) mediante OpenVINO GenAI 2026.4 o superior.

El modelo base pertenece a la familia Qwen3-TTS, especializada en síntesis de voz multilingüe con control de voz personalizada (CustomVoice) y una tasa de frame de 12 Hz. Esta versión INT8 reduce el peso y acelera la inferencia en CPU, iGPU y NPU de Intel, manteniendo la calidad del vocoder en FP16 para no degradar la señal de audio resultante.

Es relevante porque permite desplegar un modelo TTS de 1,7B parámetros en equipos de consumo con aceleración Intel, algo poco habitual en modelos de esta escala, y porque la licencia Apache 2.0 facilita su uso comercial. La model card está orientada a un flujo de trabajo con OpenVINO GenAI y ofrece un ejemplo mínimo de inferencia en Python.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basada en transformer (Qwen3-TTS), frame rate 12 Hz, con vocoder separado |
| Parámetros totales | 1,7B (backbone) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 simétrico (INT8_SYM) en backbone; FP16 en vocoder |
| Idiomas soportados | multilingüe (el tag de la model card menciona alemán; lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO GenAI) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-CustomVoice es un sistema de texto a voz de la familia Qwen3-TTS, con un backbone transformer de 1.700 millones de parámetros que genera representaciones acústicas a una tasa de 12 Hz y un vocoder que las convierte en forma de onda de audio. La variante CustomVoice añade control sobre la voz sintetizada. Esta conversión no reentrena el modelo: transforma los pesos originales a OpenVINO IR, cuantiza el backbone a INT8 simétrico y conserva el vocoder en FP16.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica de esta publicación es la propia conversión: compatibilidad con OpenVINO GenAI 2026.4, soporte de `CACHE_DIR` y `LATENCY` como hints de compilación, y ejecución en NPU de Intel Core Ultra, iGPU Arc y CPU multinúcleo.

## Capacidades

- Síntesis de voz (text-to-speech) de alta expresividad a partir de texto.
- Control de voz personalizada (CustomVoice) heredado del modelo base.
- Soporte multilingüe; la model card menciona explícitamente alemán y el modelo base se describe como multilingüe.
- Generación de audio a 24 kHz (según el ejemplo de escritura con `soundfile` a 24000 Hz).
- Ejecución acelerada en hardware Intel: NPU, iGPU Arc y CPU multinúcleo.
- Compatibilidad con la API `Text2SpeechPipeline` de OpenVINO GenAI.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en local para asistentes de escritorio: el modelo puede generar audio en equipos con Intel Core Ultra aprovechando la NPU, sin depender de servicios en la nube y con la ventaja de privacidad que ello implica.
- Lectura de textos largos y accesibilidad: integración en lectores de pantalla o herramientas de accesibilidad que conviertan documentos en audio, usando la ventana de contexto del modelo base (no especificada) para fragmentos extensos.
- Generación de voces personalizadas para contenido multimedia: la variante CustomVoice permite producir locuciones con un timbre controlado para vídeos, pódcasts o audiolibros.
- Doblaje y localización: al ser multilingüe, puede emplearse para generar pistas de voz en distintos idiomas dentro de flujos de localización automatizada.
- Prototipado rápido en Python: el ejemplo de la model card permite validar un pipeline TTS en pocas líneas con `openvino_genai`, útil para demos y pruebas de concepto.
- Despliegue en entornos Intel sin GPU dedicada: al soportar CPU multinúcleo e iGPU Arc, encaja en estaciones de trabajo y portátiles Intel donde no hay GPU NVIDIA disponible.
- Integración en aplicaciones de atención al cliente con respuesta por voz: combinado con un LLM, puede generar respuestas habladas en tiempo real en infraestructura Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; con backbone INT8 de 1,7B parámetros y vocoder FP16, el peso en memoria es sustancialmente menor que la versión FP16 completa, pero no se proporcionan cifras exactas.
- GPU recomendadas: Intel Arc (iGPU y dedicadas) según la model card; también CPU multinúcleo y NPU de Intel Core Ultra.
- Cabe en hardware de consumo: sí, en equipos Intel Core Ultra con NPU o iGPU Arc, y en CPU multinúcleo, según el autor.
- Opciones de despliegue: OpenVINO GenAI (>= 2026.4) mediante `Text2SpeechPipeline`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card menciona soporte de hints `LATENCY` y `CACHE_DIR` para optimizar la compilación, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice-int8-ov (este) | 1,7B | no disponible | Apache 2.0 | OpenVINO IR, OpenVINO GenAI | Optimizado para Intel |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7B | no disponible | Apache 2.0 | pesos originales (no especificado) | Modelo base sin cuantizar |
| Otras variantes Qwen3-TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (por ejemplo, modelos TTS de otras familias) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks ni evaluaciones de calidad de audio para esta conversión INT8; la cuantización del backbone puede introducir degradación respecto al modelo original, aunque el vocoder se mantiene en FP16.
- La lista completa de idiomas soportados no está disponible; la model card solo menciona alemán de forma explícita.
- No se documentan sesgos conocidos, pero al ser un modelo TTS multilingüe entrenado con datos no especificados, puede reproducir sesgos de voz y prosodia del corpus original.
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas, artefactos o audio no inteligible en textos fuera de dominio.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Requiere OpenVINO GenAI >= 2026.4; versiones anteriores pueden no ser compatibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- No se especifican límites de longitud de texto de entrada ni de contexto.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/paloik/Qwen3-TTS-12Hz-1.7B-CustomVoice-int8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- OpenVINO GenAI: no disponible en la información proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
