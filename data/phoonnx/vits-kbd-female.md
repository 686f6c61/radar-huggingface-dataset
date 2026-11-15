# Phoonnx/vits-kbd-female

## Resumen

vits-kbd-female es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario anzorq y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo convierte texto en cabardiano (kbd, lengua caucásica noroccidental hablada principalmente en Kabardia-Balkaria, Rusia) a audio con voz femenina. Su relevancia radica en ser uno de los pocos recursos TTS disponibles para esta lengua de bajos recursos, y en su formato ONNX listo para producción, lo que facilita el despliegue en entornos sin dependencias de frameworks de deep learning pesados.

El modelo forma parte de la colección VITS de Phoonnx, un esfuerzo por empaquetar modelos TTS de diversas lenguas en formato ONNX con una interfaz Python unificada. La integración con el ecosistema OVOS (Open Voice OS) permite usarlo como plugin de voz en asistentes de código abierto. El repositorio ocupa apenas 0,1 GB, lo que refleja un modelo compacto orientado a inferencia eficiente en CPU.

No se dispone de información pública sobre el número exacto de parámetros, el corpus de entrenamiento ni los resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | cabardiano (kbd) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto (graphemes) |
| Front-end de texto | GraphemePhonemizer de scriptconv |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un codificador de audio, un prior normalizing flow y un decodificador generativo adversarial, permitiendo generar audio de forma directa desde texto sin necesidad de un vocoder separado. El modelo emplea un front-end basado en grafemas mediante `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino. El modelo es una adaptación de `anzorq/kbd-vits-tts-female`, empaquetada en ONNX por Phoonnx para su uso con la librería `phoonnx`, que gestiona la carga y la síntesis.

## Capacidades

- Síntesis de voz (text-to-speech) en cabardiano (kbd) con voz femenina.
- Conversión directa de texto a audio WAV mediante la API de phoonnx.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Normalización de texto mediante scriptconv antes de la síntesis.
- Inferencia en formato ONNX, apta para despliegue ligero en CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- **Asistentes de voz en cabardiano**: integración como módulo TTS en OVOS para ofrecer respuestas habladas en esta lengua dentro de asistentes de código abierto, gracias al plugin `ovos-tts-plugin-phoonnx`.
- **Accesibilidad para hablantes de cabardiano**: lectura en voz alta de textos, documentos o interfaces para personas con discapacidad visual que usen esta lengua, mediante la API `synthesize_wav` de phoonnx.
- **Locución automatizada de contenidos**: generación de audio para vídeos, audiolibros o pódcast en cabardiano, aprovechando la voz femenina del modelo y su formato ONNX para ejecución en servidores sin GPU.
- **Preservación lingüística**: creación de material sonoro para proyectos de documentación y enseñanza del cabardiano, dado el escaso número de recursos TTS disponibles para esta lengua.
- **Sistemas de anuncios públicos**: generación de avisos hablados en cabardiano para aplicaciones de transporte, aeropuertos o servicios públicos en regiones donde se habla la lengua.
- **Prototipado de aplicaciones de voz**: uso del modelo como base para experimentar con pipelines TTS en lenguas de bajos recursos, gracias a su licencia MIT y su reducido tamaño (0,1 GB) que permite iterar rápidamente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está en formato ONNX y está pensado para ejecución en CPU. El tamaño del repositorio (0,1 GB) sugiere un consumo de memoria muy reducido.
- GPU recomendadas: no se requieren GPU; cualquier CPU moderna puede ejecutar la inferencia.
- Cabe en cualquier GPU consumer y en dispositivos de bajos recursos, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: librería `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-kbd-female (este) | VITS | kbd | MIT | ONNX | Hugging Face |
| anzorq/kbd-vits-tts-female | VITS | kbd | no disponible | no disponible | Hugging Face |
| Otros modelos de la colección VITS de Phoonnx | VITS | varias lenguas | MIT (según colección) | ONNX | Hugging Face |

No se dispone de información sobre modelos TTS alternativos específicos para cabardiano con los que establecer una comparación cuantitativa de parámetros o rendimiento.

## Limitaciones y advertencias

- Modelo limitado exclusivamente al cabardiano (kbd); no soporta otros idiomas.
- Voz única femenina; no hay variedad de hablantes.
- No se han publicado métricas de calidad (MOS, WER) ni benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario de entrenamiento o en texto no normalizado correctamente por scriptconv.
- Posibles sesgos en la voz generada derivados de los datos de entrenamiento, no documentados.
- La licencia MIT permite uso comercial, pero se recomienda verificar los términos del modelo upstream (`anzorq/kbd-vits-tts-female`), ya que la model card indica que "the upstream release states its terms".
- Para producción, conviene validar la calidad del audio y la cobertura léxica en el dominio de aplicación concreto.
- Dependencia de la librería `phoonnx` en versión preliminar (`pip install --pre phoonnx`), lo que puede implicar inestabilidad de API.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-kbd-female)
- [Modelo upstream: anzorq/kbd-vits-tts-female](https://huggingface.co/anzorq/kbd-vits-tts-female)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
