# adidsh/indic-speak-int8-onnx

## Resumen

Indic-Speak (INT8 ONNX & GGUF) es una distribución cuantizada y optimizada para edge del modelo de síntesis de voz Indic-Speak (preview v2), desarrollado por Bodhan AI / AI4Bharat (IITM BODHAN-AI Foundation, con apoyo del Ministerio de Educación de la India). El modelo resuelve la generación de voz neuronal multilingüe de alta fidelidad para 23 idiomas: inglés y las 22 lenguas indias programadas. Esta variante concreta (`adidsh/indic-speak-int8-onnx`) ha sido derivada por un contribuidor de la comunidad y publicada en formato GGUF e INT8 ONNX para permitir inferencia privada, en dispositivo y de baja latencia.

Técnicamente es un sistema híbrido: un backbone acústico transformer autorregresivo basado en Llama 3.2 3B (~3,21B parámetros) que genera tokens de habla discretos, seguido de un vocoder neuronal Vocos (backbone iSTFT de 257 bins a 24 kHz) que reconstruye la forma de onda. El repositorio incluye el modelo acústico en GGUF (Q8_0 y Q5_K_M) y el vocoder en ONNX INT8 de 79,8 MB.

La relevancia actual reside en su enfoque edge: comprime el modelo acústico hasta un 66,2 % respecto al FP32 original y reduce el vocoder un 64,2 %, manteniendo una calidad de audio declarada idéntica al FP32 y un RTF de 0,016x en CPU, lo que habilita síntesis offline en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (backbone acústico Llama 3.2 3B) + vocoder neuronal Vocos (iSTFT 257 bins, 24 kHz) |
| Parametros totales | 3.300.928.576 (~3,3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0, GGUF Q5_K_M, ONNX INT8 (vocoder) |
| Idiomas soportados | 23: inglés (en) y 22 lenguas indias (hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd) |
| Licencia | Indic Open Model License v1.0 (acceso con gated prompt y aceptación de términos) |
| Formato de pesos | GGUF (modelo acústico), ONNX (vocoder); SafeTensors disponible en el modelo upstream FP32 |

## Arquitectura y entrenamiento

El sistema emplea una arquitectura de dos etapas. La primera es un backbone acústico transformer autorregresivo basado en `meta-llama/Llama-3.2-3B` (~3,21B parámetros), que recibe texto fonético y un prompt de hablante y genera tokens de habla discretos de forma autorregresiva. La segunda es un vocoder neuronal Vocos, que convierte esos tokens en forma de onda continua a 24 kHz mediante una iSTFT de 257 bins. El modelo upstream es Indic-Speak (preview v2) de Bodhan AI y AI4Bharat, diseñado específicamente para "leer el texto tal y como está escrito" preservando la identidad regional del hablante.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre el uso de RLHF o DPO en la información proporcionada. Lo que sí está documentado es el proceso de optimización y cuantización aplicado en esta derivada: cuantización GGUF para el modelo acústico (Q8_0 y Q5_K_M) y cuantización INT8 para el vocoder ONNX, manteniendo una calidad de audio declarada idéntica a la del FP32. La innovación destacable es la combinación de un backbone LLM reutilizado como modelo acústico con un vocoder cuantizado de muy baja latencia, orientada a despliegue en dispositivo.

## Capacidades

- Síntesis de voz (text-to-speech) zero-shot multilingüe de alta fidelidad.
- Soporte de 23 idiomas: inglés y 22 lenguas indias programadas, cubriendo 12 scripts según la documentación de AI4Bharat.
- Más de 46 voces nativas curadas (personas) con distintos estilos: formal, broadcast, narrativo, conversacional, educativo, corporativo.
- Preservación de la identidad lingüística del hablante (por ejemplo, una voz cachemira leyendo tamil suena a hablante de cachemira).
- Generación de audio WAV a 24 kHz.
- Inferencia en dispositivo y offline (edge AI), sin dependencia de API en la nube.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio de entrada; el pipeline es exclusivamente text-to-speech.

## Casos de uso

- Lectura por voz de noticias y boletines en lenguas indias: el modelo ofrece voces con estilo broadcast y cadencia formal (por ejemplo `odia_female_itishree`) adecuadas para locución profesional multiidioma.
- Asistentes de voz offline para regiones con conectividad limitada: al ejecutarse en dispositivo con GGUF/ONNX, permite interacción por voz sin enviar datos a la nube, un requisito habitual en aplicaciones de privacidad.
- Accesibilidad para personas con discapacidad visual: síntesis en la lengua materna del usuario con 23 idiomas disponibles para lectura de textos, documentos y interfaces.
- Audiolibros y narración de contenido educativo: las voces narrativas (`hindi_male_prabhat`, `kannada_female_meera`) permiten generar material didáctico en múltiples idiomas con un mismo sistema.
- Doblaje y localización de contenido: al soportar 23 idiomas con voces nativas, se puede producir audio localizado para vídeo, e-learning y publicidad sin contratar a un hablante por idioma.
- Aplicaciones móviles y embebidas de asistencia: con vocoder INT8 de 13,3 ms por chunk y RTF 0,016x, es viable integrar síntesis en tiempo real en dispositivos de gama media.
- Interfaces de atención al ciudadano automatizadas: lectura de respuestas, formularios y avisos en la lengua del usuario, con voces diferenciadas por registro.

## Benchmarks y rendimiento

Datos de compresión y almacenamiento publicados en la model card:

| Componente | Variante | Tamano | Formato | Reduccion |
|---|---|---|---|---|
| Modelo acustico (Llama 3.2) | Upstream FP32 | 6,60 GB | SafeTensors | Baseline |
| Modelo acustico (Llama 3.2) | Q8_0 | 3,27 GB | GGUF | 50,5 % |
| Modelo acustico (Llama 3.2) | Q5_K_M | 2,23 GB | GGUF | 66,2 % |
| Vocoder Vocos | Upstream FP32 | 222,7 MB | ONNX | Baseline |
| Vocoder Vocos | INT8 | 79,8 MB | ONNX | 64,2 % |

Latencia del vocoder en CPU (medida en un Intel Core i7):

| Variante del vocoder | Latencia CPU (ms / chunk) | Real-Time Factor (RTF) | Calidad de salida |
|---|---|---|---|
| FP32 ONNX | 38,4 ms | 0,048x | Crystal Clear |
| INT8 ONNX | 13,3 ms | 0,016x | Idéntica al FP32 |

Según la model card, sintetizar 10 segundos de audio a 24 kHz requiere menos de 150 ms de procesamiento del vocoder. No se han publicado resultados de benchmarks de calidad de síntesis (MOS, WER de ASR inverso u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 2,3 GB para el modelo acústico en GGUF Q5_K_M y unos 3,3 GB en Q8_0, más 79,8 MB del vocoder INT8. El repositorio completo ocupa 6,7 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para la variante cuantizada. No se requieren A100 ni H100 para inferencia con las cuantizaciones publicadas.
- Cabe en GPU consumer: sí, las variantes GGUF Q5_K_M y Q8_0 están pensadas para ello.
- Despliegue: al incluir GGUF, es compatible con llama.cpp y Ollama; el vocoder ONNX se sirve con ONNX Runtime. La cuantización INT8 del vocoder permite ejecución íntegra en CPU. La model card no menciona vLLM ni TGI para este pipeline de TTS.
- Latencia y throughput: vocoder INT8 a 13,3 ms por chunk con RTF 0,016x en CPU Intel Core i7; menos de 150 ms para 10 segundos de audio a 24 kHz. No se proporcionan cifras de throughput del modelo acústico ni latencias end-to-end completas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos externos de la misma categoría en la información proporcionada. A continuación se comparan las variantes internas del propio sistema, que es lo único documentado con cifras verificables:

| Variante | Parametros / tamano | Formato | Reduccion de tamano | Latencia / RTF | Calidad declarada |
|---|---|---|---|---|---|
| Backbone acustico FP32 (upstream) | ~3,3B / 6,60 GB | SafeTensors | Baseline | no disponible | Baseline |
| Backbone acustico Q8_0 | ~3,3B / 3,27 GB | GGUF | 50,5 % | no disponible | no disponible |
| Backbone acustico Q5_K_M | ~3,3B / 2,23 GB | GGUF | 66,2 % | no disponible | no disponible |
| Vocoder Vocos FP32 | 222,7 MB | ONNX | Baseline | 38,4 ms / 0,048x | Crystal Clear |
| Vocoder Vocos INT8 | 79,8 MB | ONNX | 64,2 % | 13,3 ms / 0,016x | Idéntica al FP32 |

Comparativa con alternativas externas de TTS multilingüe indio: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Indic Open Model License v1.0 exige aceptar términos y rellenar un gated prompt (empresa, país, caso de uso) para solicitar acceso; no es una licencia de uso libre sin condiciones. Verificar los términos antes de cualquier uso comercial.
- Atribución obligatoria: la model card exige atribución a Indic-Speak de Bodhan AI / AI4Bharat.
- Es un modelo derivado y cuantizado por un contribuidor de la comunidad, no por los autores originales; las garantías de calidad recaen sobre esta derivada concreta.
- La cuantización (Q8_0, Q5_K_M, INT8) puede introducir degradaciones de calidad no medidas con métricas objetivas (no hay MOS ni evaluaciones publicadas). La afirmación de calidad "idéntica al FP32" para el vocoder procede del autor, no de una evaluación independiente.
- Es un modelo exclusivamente de síntesis de voz: no realiza razonamiento, código, matemáticas ni tool calling.
- Riesgo de alucinación acústica: como sistema autorregresivo, puede generar artefactos, pronunciaciones erróneas o prosodia inadecuada, especialmente en textos poco representados o lenguas de bajos recursos del conjunto de 22.
- Cobertura de idiomas limitada al conjunto documentado; no se garantiza un rendimiento uniforme entre los 23 idiomas ni entre las 46 voces.
- No se dispone de información sobre sesgos de género, acento o representación demográfica de las voces.
- La model card citada está truncada en la información disponible; pueden existir condiciones, contenidos de repositorio y documentos adicionales (voices.md, LICENSE_DEED.md) no incluidos aquí.
- Longitud de contexto y límites de entrada de texto: no disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adidsh/indic-speak-int8-onnx
- Modelo upstream: https://huggingface.co/bodhan-ai/indic-speak-preview-v2
- Backbone acústico base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Vocoder Vocos (backbone): https://github.com/gemelo-ai/vocos
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Resumen de la licencia (deed): https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License_Deed.md
- Blog de AI4Bharat sobre Indic-Speak: https://ai4bharat.iitm.ac.in/static-blogs/bodhan-tts/indic-speak.html
