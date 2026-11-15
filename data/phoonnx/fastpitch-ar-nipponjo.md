# Phoonnx/fastpitch-ar-nipponjo

## Resumen

fastpitch-ar-nipponjo es un modelo de síntesis de voz (text-to-speech) en árabe basado en la arquitectura FastPitch, empaquetado por Phoonnx para su librería de TTS sobre ONNX. El modelo original fue desarrollado por nipponjo y publicado en el repositorio nipponjo/tts-arabic-onnx; esta versión es un reempaquetado que facilita su uso dentro del ecosistema phoonnx y OVOS (Open Voice OS). El modelo no genera audio directamente: produce un espectrograma que posteriormente es convertido a onda de audio por el vocoder hifigan-ar-nipponjo, descargado automáticamente junto con la voz.

La relevancia de este modelo radica en su naturaleza ligera y su formato ONNX, que permite inferencia en CPU sin necesidad de GPU, algo poco habitual en TTS neuronales. Está orientado a idioma árabe exclusivamente y emplea fonemas mantoq en alfabeto Buckwalter como entrada de texto, lo que exige un front-end de fonemización específico (scriptconv con el extra ar-phonemizers).

El repositorio ocupa 0,2 GB y registra 31 descargas en el momento de la consulta, sin likes. Se trata de un modelo de nicho, sin licencia registrada explícitamente, lo que constituye una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (TTS acústico no autorregresivo) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | árabe (ar) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas mantoq, alfabeto Buckwalter |
| Vocoder asociado | hifigan-ar-nipponjo |
| Tamaño del repositorio | 0,2 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de síntesis de voz no autorregresiva basada en transformer que predice espectrogramas mel a partir de fonemas de entrada, incorporando un mecanismo de control de duración y pitch. El modelo empaquetado aquí genera el espectrograma, mientras que el vocoder HiFi-GAN (hifigan-ar-nipponjo) transforma dicho espectrograma en audio. Ambos componentes se ejecutan en formato ONNX a través de phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado. Tampoco se detalla el número de parámetros del modelo. La única información técnica proporcionada es la entrada de texto basada en fonemas mantoq en alfabeto Buckwalter y la dependencia del vocoder HiFi-GAN. El front-end de texto se delega a scriptconv, que normaliza el texto y lo convierte a los fonemas esperados por el modelo.

## Capacidades

- Síntesis de voz en árabe a partir de texto, con salida en formato WAV.
- Conversión texto a fonemas mantoq mediante el fonemizador MantoqPhonemizer de scriptconv.
- Generación de espectrogramas mel que el vocoder HiFi-GAN convierte en audio.
- Inferencia sobre ONNX, apta para CPU sin GPU dedicada.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS puro).
- No dispone de capacidades multimodales, visión ni audio de entrada.
- Sin soporte multilingüe: únicamente árabe.

## Casos de uso

- Asistentes de voz en árabe sobre OVOS: el modelo se integra mediante el plugin ovos-tts-plugin-phoonnx y se selecciona en mycroft.conf, permitiendo respuestas habladas en árabe en dispositivos de voz locales.
- Lectura de contenido en árabe en aplicaciones de accesibilidad: conversión de texto a voz para pantallas lectoras o interfaces para personas con discapacidad visual, con inferencia en CPU que abarata el despliegue.
- Sistemas de anuncios o avisos automatizados en árabe: generación de mensajes de audio pregrabados bajo demanda en entornos con recursos limitados, gracias al formato ONNX y al reducido tamaño del repositorio (0,2 GB).
- Prototipado de pipelines TTS en árabe: uso del modelo como componente acústico junto con el vocoder HiFi-GAN para experimentar con front-ends de fonemización alternativos en scriptconv.
- Integración en aplicaciones de escritorio o embebidas sin GPU: al ejecutarse sobre ONNX y con un tamaño reducido, puede desplegarse en dispositivos de borde o mini-PC.
- Generación de audio para pruebas de calidad de TTS: comparación de la salida del modelo con otras voces del ecosistema phoonnx para evaluar inteligibilidad y naturalidad en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX puede correr en CPU sin GPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU.
- Compatibilidad con GPU de consumo: no disponible; no requiere GPU por diseño (ONNX).
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx. No se documenta soporte para vLLM, llama.cpp ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: 0,2 GB, lo que sugiere un modelo ligero apto para entornos con poca memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastpitch-ar-nipponjo | FastPitch + HiFi-GAN | árabe | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces FastPitch de la colección Phoonnx | FastPitch + vocoder | varios | ONNX | variable | Colección Phoonnx en Hugging Face |
| nipponjo/tts-arabic-onnx (upstream) | FastPitch + vocoder | árabe | ONNX | no disponible | Hugging Face (nipponjo) |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a arquitectura, idioma, formato y licencia.

## Limitaciones y advertencias

- Solo soporta árabe; no es multilingüe.
- La licencia figura como "other" sin licencia registrada explícitamente; el propio autor advierte de consultar la versión upstream antes de usarlo. Riesgo legal para uso comercial.
- Requiere un front-end de fonemización específico (mantoq, alfabeto Buckwalter) y la dependencia scriptconv[ar-phonemizers]; sin él, la entrada de texto no se procesa correctamente.
- Depende de un vocoder externo (hifigan-ar-nipponjo) para producir audio; no genera onda directamente.
- No se dispone de información sobre sesgos, dataset de entrenamiento ni calidad de síntesis medida.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir pronunciaciones incorrectas o inteligibilidad reducida en textos fuera del dominio de entrenamiento.
- Sin benchmarks publicados que permitan evaluar su calidad frente a alternativas.
- Modelo de nicho con pocas descargas (31) y sin likes, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/fastpitch-ar-nipponjo
- Repositorio upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Vocoder: https://huggingface.co/Phoonnx/hifigan-ar-nipponjo
- Colección FastPitch de Phoonnx: https://huggingface.co/collections/Phoonnx/fastpitch-6af8ea827005c1385348ed60
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
