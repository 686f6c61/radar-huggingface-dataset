# Phoonnx/vits-ru_ru-luka-espeak

## Resumen

vits-ru_ru-luka-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el autor superkeka y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en ruso (variante ru-RU) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz rusa ligera (repo de 0,1 GB) y con licencia Apache 2.0, lista para desplegarse en entornos Python y en el asistente de voz OVOS sin necesidad de infraestructura pesada.

El modelo procede del ecosistema Piper, concretamente de la variante `superkeka/piper-tts-luka/ru/ru_RU/luka/medium`, y Phoonnx lo redistribuye como un artefacto ONNX consumible mediante su API `TTSModelManager`. No se trata de un modelo de lenguaje generativo, sino de un sintetizador acústico condicionado por fonemas, por lo que sus capacidades se limitan a la conversión texto-a-voz en un único idioma.

La información pública disponible es escasa: la model card no detalla el número de parámetros, la composición del corpus de entrenamiento ni resultados de evaluación. La ficha refleja únicamente los datos verificables de la model card y del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de coincidencia temporal. El resultado es un modelo que genera formas de onda directamente a partir de secuencias de fonemas, sin necesidad de un vocoder separado. En este caso, la entrada son fonemas IPA producidos por espeak-ng, lo que vincula la calidad de la síntesis a la fidelidad de la fonemización.

No se dispone de información sobre el número de tokens, la composición del corpus, el hablante de referencia ni si se aplicaron técnicas de ajuste como RLHF o DPO; estos datos no aparecen en la model card. La model card sí indica que el modelo procede de la variante "luka medium" del repositorio Piper de superkeka, pero no se detallan hiperparámetros ni el proceso de entrenamiento. La aportación de Phoonnx es de empaquetado y compatibilidad con su librería, no de entrenamiento.

## Capacidades

- Síntesis de voz a partir de texto en ruso (ru-RU) con salida en archivo WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con la librería phoonnx en Python mediante `TTSModelManager` y `voice.synthesize_wav`.
- Integración con el asistente de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o Unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales, visión ni audio de entrada.
- Monolingüe: únicamente ruso.

## Casos de uso

- Asistente de voz doméstico en OVOS: el modelo se selecciona en `mycroft.conf` como módulo TTS y permite que el asistente responda en ruso con una voz local, sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en ruso: integrado en un script Python con phoonnx, puede sintetizar mensajes cortos y reproducirlos en altavoces locales para sistemas de monitorización.
- Accesibilidad para personas con discapacidad visual: conversión de texto de documentos o interfaces a audio en ruso, aprovechando el tamaño reducido del modelo (0,1 GB) para ejecutarse en hardware modesto.
- Síntesis en aplicaciones de escritorio offline: al ser un modelo ONNX ligero, puede embeberse en aplicaciones de escritorio o dispositivos de borde que requieran TTS en ruso sin conexión.
- Generación de audiolibros o contenido narrado en ruso: el modelo permite sintetizar párrafos largos por lotes, siempre que se gestione la fonemización con espeak-ng para mantener la calidad.
- Pruebas de integración en pipelines de CI: sirve como voz de referencia para validar el correcto funcionamiento de la cadena scriptconv + phoonnx en entornos de desarrollo.
- Demostraciones web de TTS en navegador: mediante phoonnx.js, se puede ofrecer una demo de síntesis rusa en el navegador sin backend, útil para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo VITS de 0,1 GB en ONNX, es probable que quepa en CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; no se especifican requisitos mínimos ni modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Entrada |
|---|---|---|---|---|---|
| vits-ru_ru-luka-espeak | VITS | ru-RU | 0,1 GB | Apache 2.0 | Fonemas espeak IPA |
| superkeka/piper-tts-luka (upstream) | VITS (Piper) | ru-RU | no disponible | Apache 2.0 | Fonemas espeak |
| Otras voces Piper ru-RU | VITS (Piper) | ru-RU | variable | variable | Fonemas espeak |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza ruso (ru-RU); no admite otros idiomas.
- La calidad de la síntesis depende de la fonemización con espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- No se han publicado métricas objetivas (MOS, WER, etc.) ni detalles del corpus de entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí puede producir pronunciaciones incorrectas o prosodia deficiente en palabras fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la model card remite a la licencia declarada por el autor upstream; conviene verificar la cadena de licencias antes de un despliegue comercial.
- El modelo no incluye capacidades de razonamiento, tool calling ni agentes; su uso está acotado a TTS.
- No se especifican sesgos conocidos ni limitaciones de contexto, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-luka-espeak
- Upstream (Piper, superkeka): https://huggingface.co/superkeka/piper-tts-luka/tree/main/ru/ru_RU/luka/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
