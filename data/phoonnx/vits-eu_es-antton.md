# Phoonnx/vits-eu_es-antton

## Resumen

`vits-eu_es-antton` es un modelo de síntesis de voz (text-to-speech) en euskera (variante `eu-ES`) basado en la arquitectura VITS, desarrollado originalmente por el centro HiTZ (Universidad del País Vasco) y empaquetado por Phoonnx en formato ONNX para su uso con su librería de TTS. El modelo toma como entrada fonemas en alfabeto IPA generados mediante el fonemizador `AhoTTSPhonemizer` de la librería `scriptconv` y produce audio WAV sintetizado. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia ligera.

La relevancia de este modelo radica en su carácter especializado: cubre una lengua de bajos recursos como el euskera con una licencia permisiva (Apache 2.0) y un pipeline de despliegue ya resuelto mediante ONNX, lo que facilita su integración en aplicaciones de producción sin depender de frameworks propietarios. Forma parte de la colección de modelos VITS empaquetados por Phoonnx y se integra de forma nativa en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni los datos exactos de entrenamiento en la información proporcionada. El modelo está pensado exclusivamente para síntesis de voz en euskera y no soporta otras tareas de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas) |
| Tipos de cuantización | no disponible (pesos en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | euskera (`eu`, variante `eu-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por alineamientos monotónicos (MAS), un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado con pérdidas GAN, además de una pérdida de reconstrucción espectral. Este diseño permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La entrada del modelo son fonemas en alfabeto IPA producidos por el fonemizador `AhoTTSPhonemizer`, específico para euskera.

El modelo original es `HiTZ/TTS-eu_antton`, publicado por el centro HiTZ. No se dispone en la información proporcionada de detalles sobre el número de horas de audio de entrenamiento, la composición del corpus, el hablante (el nombre "antton" sugiere una voz concreta) ni si se aplicaron técnicas de fine-tuning o adaptación. Phoonnx se limita a empaquetar los pesos en ONNX y a integrar el front-end de texto mediante `scriptconv`, sin aportar cambios arquitectónicos documentados.

## Capacidades

- Síntesis de voz (text-to-speech) en euskera (`eu-ES`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante `AhoTTSPhonemizer` (extra `scriptconv[eu]`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, lo que permite ejecución sin GPU y despliegue multiplataforma.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni otras modalidades.
- No es multilingüe: está limitado al euskera.

## Casos de uso

- Asistentes de voz en euskera: integración en OVOS o en asistentes personalizados para responder a los usuarios en euskera con una voz sintética natural, aprovechando el plugin oficial y la configuración mediante `mycroft.conf`.
- Lectura de contenidos en euskera: conversión de artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, usando la API de `phoonnx` para generar WAV por frase.
- Señalización y anuncios automatizados: generación de avisos pregrabados o dinámicos en euskera para transporte público, aeropuertos o edificios públicos, donde se requiere una voz consistente y un despliegue ligero en dispositivos de bajo consumo.
- Sistemas de navegación o GPS en euskera: síntesis de instrucciones de conducción en tiempo real, con latencia baja gracias a la inferencia ONNX y a la arquitectura end-to-end de VITS.
- Aplicaciones educativas de aprendizaje de euskera: generación de pronunciaciones de referencia para vocabulario y frases, usando la transcripción fonémica IPA como paso intermedio verificable.
- Audiolibros y podcasting automatizado: producción de narraciones en euskera a partir de texto, con la posibilidad de procesar lotes de frases y ensamblar los WAV resultantes.
- Pruebas de accesibilidad y localización: validación de interfaces de voz en euskera antes de contratar grabaciones humanas, usando el modelo como generador de prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en GPUs de gama baja o incluso ejecute en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de pequeño tamaño, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño del repositorio.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-eu_es-antton` | VITS | Euskera (`eu-ES`) | Apache 2.0 | ONNX | Hugging Face |
| `HiTZ/TTS-eu_antton` | VITS | Euskera (`eu-ES`) | Apache 2.0 | no disponible en la información | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | Diversos idiomas | Apache 2.0 (según modelo) | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de arquitectura, licencia y formato.

## Limitaciones y advertencias

- El modelo solo sintetiza euskera; no admite otros idiomas ni code-switching documentado.
- Al ser un modelo TTS, no realiza razonamiento, generación de texto, código ni matemáticas; no debe evaluarse con benchmarks de LLM.
- No se documentan sesgos específicos, pero al estar entrenado con una voz concreta ("antton") puede presentar limitaciones de variedad de hablante, prosodia y registro.
- Riesgo de errores de pronunciación en palabras extranjeras, siglas o neologismos no cubiertos por el fonemizador `AhoTTSPhonemizer`.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `HiTZ/TTS-eu_antton` y las condiciones del corpus de entrenamiento original, no detalladas en la información disponible.
- El modelo requiere la instalación del extra `scriptconv[eu]` para el front-end de texto; sin él, la entrada de fonemas debe generarse externamente.
- No se dispone de información sobre la calidad perceptual (MOS), latencia ni robustez en dominios ruidosos o textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-eu_es-antton
- Modelo upstream: https://huggingface.co/HiTZ/TTS-eu_antton
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
