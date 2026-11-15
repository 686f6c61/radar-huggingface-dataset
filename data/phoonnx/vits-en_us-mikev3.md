# Phoonnx/vits-en_us-mikev3

## Resumen

vits-en_us-mikev3 es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario Da-Bob como `Da-Bob/piper-mikev3` y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en inglés estadounidense en audio, tomando como entrada fonemas espeak en alfabeto IPA, y está pensado para integrarse en pipelines de TTS ligeros que priorizan el despliegue en local y la portabilidad frente a la calidad de estudio.

Su relevancia radica en el ecosistema en el que se inserta: Phoonnx lo distribuye como un artefacto ONNX de aproximadamente 0,1 GB, ejecutable tanto en Python como en el navegador mediante phoonnx.js, y con integración directa en asistentes de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`. Es, por tanto, una pieza orientada a asistentes embebidos y aplicaciones de voz de baja latencia más que a generación de audio de alta fidelidad.

La información pública disponible es escasa: la model card no detalla el número de parámetros, el volumen de datos de entrenamiento ni resultados de benchmarks. La ficha se limita, por tanto, a lo declarado por el autor y por el empaquetador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de coincidencia temporal. El resultado es un modelo que genera directamente la forma de onda a partir de la secuencia de fonemas, sin necesidad de un vocoder externo. En este caso, la entrada no es texto crudo sino fonemas espeak en IPA, lo que implica que el front-end fonemizador (gestionado por la librería scriptconv) forma parte obligatoria del pipeline.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de origen ni si se aplicaron técnicas de alineamiento o ajuste fino posteriores. La model card únicamente indica que el modelo procede de `Da-Bob/piper-mikev3`, lo que sugiere un origen en el ecosistema Piper de voces TTS ligeras, aunque este extremo no se confirma explícitamente en la documentación disponible.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV mediante la API `synthesize_wav`.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Ejecución en Python a través de `phoonnx.model_manager.TTSModelManager`, con gestión de voces y fusión de voces por defecto.
- Ejecución en navegador mediante phoonnx.js, con soporte de entrada por espeak o Unicode.
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento multi-paso; es un modelo estrictamente TTS.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona como voz en `mycroft.conf` y el plugin `ovos-tts-plugin-phoonnx` gestiona la síntesis de respuestas del asistente, aprovechando el tamaño reducido del artefacto ONNX para despliegues en dispositivos de recursos limitados.
- Síntesis de voz en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en cliente sin backend, lo que resulta adecuado para aplicaciones web de accesibilidad que necesitan leer contenido dinámico sin enviar texto a un servidor.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API `synthesize_wav` permite generar avisos cortos en inglés con latencia baja y sin dependencia de servicios en la nube.
- Generación de audio para prototipos de interfaces conversacionales: al ser un modelo pequeño y con licencia Apache 2.0, es apto para iterar rápidamente en demos de asistentes sin coste de API.
- Pruebas de integración en pipelines de CI/CD de sistemas de voz: el formato ONNX y la ausencia de dependencias pesadas facilitan la inclusión del modelo en tests automatizados de síntesis.
- Sistemas de lectura de pantalla en inglés para entornos sin conectividad: el modelo puede empaquetarse junto a la aplicación y ejecutarse en local, sin requerir red.
- Investigación en TTS ligero: sirve como referencia para comparar variantes VITS empaquetadas para phoonnx dentro de la colección oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es previsiblemente inferior a 1 GB en FP32, aunque no se confirma.
- GPU recomendadas: no disponibles; VITS es una arquitectura ligera que habitualmente se ejecuta en CPU sin problemas, pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto, es probable que quepa en cualquier GPU de consumo moderna, pero no se aporta dato oficial.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-mikev3 | VITS | en-US | ONNX | apache-2.0 | no aplica | Empaquetado para phoonnx; sin benchmarks publicados |
| Da-Bob/piper-mikev3 | VITS (Piper) | en-US | no disponible | apache-2.0 (declarada) | no aplica | Modelo upstream del que deriva este |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable (mayoritariamente en) | ONNX | variable | no aplica | Mismo runtime y formato; comparables en despliegue |

No se dispone de datos de rendimiento objetivos que permitan una comparación cuantitativa con alternativas. La comparación se limita a aspectos de formato, licencia y ecosistema de despliegue.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no se declaran otros idiomas.
- La entrada debe ser fonemas espeak en IPA; sin espeak-ng instalado, el pipeline no funciona correctamente, y el port espyak puede producir errores de pronunciación en algunas palabras, según advierte el propio autor.
- No se han publicado métricas de calidad (MOS, WER, latencia), por lo que no es posible evaluar su fidelidad frente a alternativas.
- No se documenta el hablante original ni las condiciones de grabación, lo que limita la evaluación de sesgos de voz.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas en textos fuera de distribución, especialmente con siglas, números o nombres propios.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la declaración del modelo upstream; conviene verificar la cadena de licencias en `Da-Bob/piper-mikev3` antes de un despliegue en producción.
- El modelo tiene 27 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No hay información sobre el proceso de entrenamiento ni sobre posibles datos con derechos de autor en el corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-mikev3
- Modelo upstream: https://huggingface.co/Da-Bob/piper-mikev3
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
