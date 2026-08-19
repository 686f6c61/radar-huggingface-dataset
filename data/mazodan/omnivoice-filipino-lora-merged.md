# mazodan/Omnivoice-filipino-LoRA-Merged

## Resumen

Omnivoice-filipino-LoRA-Merged es un adaptador LoRA fusionado sobre el modelo base OmniVoice de k2-fsa, especializado en síntesis de voz y clonación de voz en filipino/tagalo (tl). El modelo resultante conserva la arquitectura del OmniVoice original, un sistema de text-to-speech (TTS) masivamente multilingüe de cero disparos que soporta más de 600 idiomas, pero con un ajuste fino orientado a mejorar la calidad y naturalidad específicamente en filipino.

El desarrollo corre a cargo de mazodan, que ha combinado dos conjuntos de datos de habla filipina (tagalog-filipino-speech y handsfree-filipino-speech-combined) para adaptar el modelo base a las particularidades fonéticas y prosódicas de este idioma. Con aproximadamente 612 millones de parámetros y un tamaño de repositorio de 3,3 GB, este modelo resulta relevante para desarrolladores que necesitan capacidades de TTS y clonación de voz en filipino sin depender de servicios comerciales cerrados.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para integrar síntesis de voz filipina en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (OmniVoice base) con adaptador LoRA fusionado |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tl (filipino/tagalo); el modelo base soporta 600+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base OmniVoice emplea una arquitectura novedosa de diffusion language model con decodificación discreta no autorregresiva (NAR). A diferencia de los modelos NAR discretos convencionales que sufren cuellos de botella en pipelines de dos etapas (texto a semántica a acústica), OmniVoice mapea directamente el texto a las características acústicas, lo que mejora la velocidad de inferencia y la calidad del habla generada. Esta arquitectura permite la clonación de voz de cero disparos (zero-shot) y el diseño de voces a partir de descripciones textuales.

El adaptador LoRA se entrenó sobre los datasets SilencioNetwork/tagalog-filipino-speech y KarlShane11/handsfree-filipino-speech-combined, ambos orientados a habla filipina. El proceso de entrenamiento consistió en un ajuste fino del modelo base utilizando la técnica LoRA (Low-Rank Adaptation), que modifica un subconjunto reducido de parámetros, y posteriormente se fusionaron los pesos del adaptador con el modelo base para producir el checkpoint final. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de técnicas de RLHF o DPO.

## Capacidades

- Síntesis de texto a voz (TTS) en filipino/tagalo con alta naturalidad.
- Clonación de voz de cero disparos (zero-shot voice cloning) a partir de muestras de audio de 3 a 25 segundos.
- Diseño de voces sintéticas a partir de descripciones textuales (voice design).
- Soporte multilingüe heredado del modelo base OmniVoice (más de 600 idiomas), aunque el ajuste fino se centra en filipino.
- Generación de habla con velocidad de inferencia superior gracias a la arquitectura NAR.
- Inferencia directa texto a acústica sin pipeline intermedio de dos etapas.

## Casos de uso

- Atención al cliente automatizada en filipino: el modelo puede generar respuestas de voz naturales para IVR o asistentes virtuales, con clonación de voz para mantener una identidad de marca consistente.
- Audiolibros y contenido narrado: permite convertir textos largos en filipino a audio con voces naturales, ideal para editoriales que quieran expandir su catálogo en este idioma.
- Plataformas de aprendizaje de idiomas: generación de ejemplos de pronunciación filipina para estudiantes, con la posibilidad de clonar la voz del instructor.
- Producción de medios y doblaje: clonación de voces de actores para doblaje de contenido audiovisual al filipino sin necesidad de sesiones de grabación adicionales.
- Asistentes de voz para dispositivos móviles: integración en aplicaciones Android/iOS que requieran interacción por voz en filipino.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual que necesiten leer contenido en filipino.
- Localización de videojuegos: generación de diálogos hablados en filipino para personajes de videojuegos, con voces personalizadas por personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 612 millones de parámetros en precisión FP32, el modelo requiere aproximadamente 2,5 GB de VRAM solo para los pesos; con cuantización a FP16 o int8, el requisito baja a ~1,3 GB o ~0,7 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo; una RTX 3060 o superior ofrecería buena experiencia. Para despliegues de baja latencia, se recomienda una A10, A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: al ser un modelo PEFT fusionado con base OmniVoice, puede servirse mediante las herramientas oficiales de k2-fsa (omnivoice-kit), o exportarse a formatos como ONNX para inferencia optimizada. No se ha confirmado soporte directo en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible; depende del hardware y de la configuración de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Clonacion zero-shot | Especializacion filipino |
|---|---|---|---|---|---|
| Omnivoice-filipino-LoRA-Merged | 612M | 600+ (ajustado a tl) | Apache 2.0 | Si | Si (tl) |
| k2-fsa/OmniVoice (base) | no disponible | 600+ | Apache 2.0 | Si | No |
| Coqui XTTS v2 | 467M | 17 | CPML (no comercial) | Si | No |
| Suno Bark | 1.2B | 13 | MIT | Limitada | No |

El modelo se distingue de las alternativas por su especialización explícita en filipino, algo que ni XTTS v2 ni Bark ofrecen con la misma calidad. Frente al OmniVoice base, este checkpoint fusionado debería ofrecer mejor pronunciación y prosodia en tagalo.

## Limitaciones y advertencias

- El ajuste fino se ha realizado únicamente con dos datasets de habla filipina; la calidad puede degradarse en dialectos regionales o registros formales poco representados en los datos de entrenamiento.
- No se ha evaluado el rendimiento en otros idiomas tras el ajuste fino; es posible que la fusión del LoRA degrade ligeramente las capacidades multilingües del modelo base.
- Riesgo de alucinación acústica: como cualquier TTS generativo, puede producir artefactos o pronunciaciones incorrectas en palabras poco frecuentes o nombres propios.
- La clonación de voz puede utilizarse para suplantación de identidad; se recomienda implementar medidas de verificación y consentimiento en aplicaciones de producción.
- No se dispone de información sobre sesgos en los datos de entrenamiento; los datasets de habla pueden tener sesgos de género, edad o acento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base OmniVoice y los datasets utilizados deben revisarse para confirmar que no existen restricciones adicionales.
- El formato de pesos es safetensors con adaptador PEFT; no se proporcionan versiones cuantizadas ni GGUF para despliegue en CPU.

## Enlaces

- HuggingFace: https://huggingface.co/mazodan/Omnivoice-filipino-LoRA-Merged
- Repositorio oficial de OmniVoice: https://github.com/k2-fsa/OmniVoice/
- Paper de OmniVoice: https://arxiv.org/abs/2604.00688
- Kit de herramientas de OmniVoice: https://github.com/kizuna-intelligence/omnivoice-kit
- Sitio web de OmniVoice: https://omnivoice.app/
- Página de clonación de voz: https://omnivoice.app/voice-cloning
- Dataset SilencioNetwork/tagalog-filipino-speech: no disponible
- Dataset KarlShane11/handsfree-filipino-speech-combined: no disponible
