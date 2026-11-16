# Phoonnx/vits-vi_vn-vais1000-espeak

## Resumen

`vits-vi_vn-vais1000-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario phcatan9921 en el repositorio `phcatan9921/piper_tts` y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en vietnamita (`vi-VN`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es proporcionar una voz utilizable dentro del ecosistema phoonnx y OVOS (Open Voice OS) para asistentes de voz y aplicaciones de lectura en vietnamita.

El modelo es relevante por su formato de despliegue: se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que permite ejecución en CPU y en dispositivos de recursos limitados sin necesidad de GPU. Se integra mediante la librería `phoonnx` y su front-end de texto `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak. La licencia declarada aguas arriba es MIT, lo que facilita su uso comercial, aunque el modelo carece de métricas de calidad publicadas y de documentación sobre sus datos de entrenamiento.

La información disponible es escasa: no se detallan parámetros, contexto (no aplica en TTS), composición del dataset ni resultados de evaluación. Esta ficha refleja únicamente los datos verificables de la model card y del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | vietnamita (`vi-VN`) |
| Licencia | MIT |
| Formato de pesos | ONNX (librería `phoonnx`) |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Pipeline | text-to-speech |
| Autor original | phcatan9921 |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de un modelado de duración estocástico. Permite generar audio de forma no autoregresiva a partir de fonemas, lo que se traduce en baja latencia en inferencia. En este caso, el modelo se distribuye como grafo ONNX para su ejecución con la librería `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (el nombre sugiere el corpus vietnamita VAIS-1000, pero no se confirma en la model card), ni sobre el uso de RLHF/DPO (no aplicable habitualmente en TTS). El front-end de texto utiliza `scriptconv` con el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema; la alternativa `espyak` puede producir fonemas distintos y degradar la pronunciación.

## Capacidades

- Síntesis de voz en vietnamita (`vi-VN`) a partir de texto plano.
- Conversión de texto a fonemas espeak-ng en alfabeto IPA como paso previo a la síntesis.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode), según los proyectos relacionados.
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en vietnamita sobre OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en un asistente doméstico sin GPU dedicada gracias al formato ONNX.
- Lectura de textos y noticias en vietnamita: integrado en pipelines de conversión texto-a-voz para aplicaciones de accesibilidad o lectura automatizada, con salida WAV lista para reproducir.
- Síntesis en el navegador: mediante `phoonnx.js`, se puede ofrecer una voz vietnamita en aplicaciones web sin backend, usando la demo de TigreGotico como referencia.
- Generación de avisos y locuciones pregrabadas: para sistemas de megafonía, kioscos o aplicaciones de transporte que necesiten locuciones en vietnamita generadas dinámicamente.
- Prototipado de interfaces conversacionales: al ser un modelo ligero (0,1 GB) y con licencia MIT, es adecuado para pruebas de concepto de asistentes de voz en vietnamita antes de invertir en voces comerciales.
- Investigación en TTS de bajo recursos: sirve como referencia para comparar la calidad de VITS con fonemización espeak frente a otros enfoques en vietnamita, aunque carece de métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del artefacto sugiere que podría ejecutarse en cualquier equipo moderno, pero no hay datos oficiales.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y `phoonnx.js` para navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos TTS en vietnamita (por ejemplo, variantes de Piper o Coqui TTS). Los datos de parámetros, contexto y rendimiento del modelo no están publicados, por lo que la comparación cuantitativa no es posible.

| Modelo | Idioma | Arquitectura | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| vits-vi_vn-vais1000-espeak | vi-VN | VITS | MIT | ONNX | no disponible |
| Alternativas Piper en vietnamita | vi-VN | VITS | MIT (según voces) | ONNX | no disponible |
| Coqui TTS (voces vietnamitas) | vi-VN | VITS/Tacotron | MPL-2.0 (según modelo) | PyTorch | no disponible |

## Limitaciones y advertencias

- No se han publicado métricas de calidad (MOS, WER de fonemas, etc.), por lo que la calidad de la síntesis no está verificada.
- Dependencia crítica de espeak-ng: sin él, la fonemización falla; con `espyak` algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- El modelo solo soporta vietnamita (`vi-VN`); no es multilingüe.
- Riesgo de pronunciación incorrecta en palabras con grafías irregulares, nombres propios o préstamos, al depender de reglas de espeak.
- La licencia MIT se declara aguas arriba, pero no se especifican restricciones adicionales sobre el corpus de entrenamiento ni sobre el uso comercial de la voz generada.
- El repositorio tiene muy pocas descargas (23) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- No hay información sobre sesgos del hablante (género, acento, dialecto) ni sobre el rango de voces disponibles.
- El modelo está empaquetado para `phoonnx` en versión preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de la API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-vi_vn-vais1000-espeak
- Repositorio upstream: https://huggingface.co/phcatan9921/piper_tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
