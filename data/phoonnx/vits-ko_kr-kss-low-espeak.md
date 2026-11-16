# Phoonnx/vits-ko_kr-kss-low-espeak

## Resumen

`vits-ko_kr-kss-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado posteriormente por Phoonnx para su librería de inferencia ONNX. El modelo convierte texto en coreano (ko-KR) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una alternativa ligera y ejecutable localmente para TTS en coreano, sin dependencia de servicios en la nube.

El modelo se distribuye en formato ONNX y está pensado para integrarse en asistentes de voz y sistemas embebidos mediante la librería phoonnx, que también proporciona un plugin para el ecosistema OVOS (Open Voice OS). El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos muy ligeros, adecuados para dispositivos con recursos limitados.

La variante "low" hace referencia a una configuración de menor calidad o tamaño dentro de las voces de Mimic 3, y "espeak" indica que el front-end de texto utiliza fonemización mediante espeak-ng. No se dispone de información sobre el número de parámetros ni la longitud de contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se especifican variantes cuantizadas) |
| Idiomas soportados | coreano (ko-KR) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversario. Este diseño permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia. El modelo original fue entrenado por Mycroft AI como parte de su colección de voces Mimic 3.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens o pasos, ni sobre el uso de técnicas de RLHF o DPO, ya que la model card no los documenta. El modelo se distribuye como un artefacto ONNX ya entrenado, empaquetado por Phoonnx, y no se ofrece información sobre el proceso de conversión ni sobre posibles ajustes posteriores. La innovación principal en este empaquetado es la integración con la librería phoonnx y el front-end de texto scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng.

## Capacidades

- Síntesis de voz a partir de texto en coreano (ko-KR), con salida en formato WAV.
- Fonemización mediante espeak-ng en alfabeto IPA, con la posibilidad de usar el port espyak si no se dispone de espeak-ng nativo.
- Ejecución local mediante ONNX, sin necesidad de conexión a internet ni servicios externos.
- Integración con la librería phoonnx en Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte de inferencia en navegador a través de phoonnx.js (según la documentación del ecosistema).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al coreano.

## Casos de uso

- Asistentes de voz locales en coreano: el modelo puede integrarse en OVOS o en aplicaciones Python mediante phoonnx para leer respuestas de un asistente sin depender de la nube, gracias a su formato ONNX ligero (~0,1 GB).
- Lectura de notificaciones y alertas en dispositivos embebidos: su reducido tamaño permite ejecutarlo en Raspberry Pi u otros dispositivos con recursos limitados para convertir texto en audio de forma local.
- Accesibilidad para personas con discapacidad visual: se puede usar para leer en voz alta contenido en coreano desde aplicaciones de escritorio o móviles que integren phoonnx.
- Prototipado rápido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse con `TTSModelManager`, permite generar audio de prueba en pocos pasos para validar flujos de conversación.
- Sistemas de anuncios automatizados en comercios o transporte: el modelo puede sintetizar mensajes pregrabados o dinámicos en coreano para su reproducción en altavoces locales.
- Investigación en TTS de bajo recursos: sirve como punto de partida para experimentar con voces VITS en coreano y comparar el rendimiento de distintas configuraciones (low frente a otras variantes de Mimic 3).
- Integración en pipelines de CI/CD para pruebas de audio: permite generar muestras de audio automáticamente en pruebas de integración de aplicaciones de voz sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de ~0,1 GB, se espera que quepa en memoria de CPU y en GPUs con muy poca VRAM, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible; por su tamaño, cualquier GPU consumer moderna (por ejemplo, GTX 1050 o superior) debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria, aunque no se especifica.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ko_kr-kss-low-espeak (este) | VITS | ko-KR | ~0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face, phoonnx |
| Otras voces Mimic 3 (ko_KO) | VITS | ko-KR | no disponible | CC-BY-SA-4.0 | ONNX | GitHub MycroftAI/mimic3-voices |
| Voces VITS de Phoonnx (otras lenguas) | VITS | varias | ~0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo soporta coreano (ko-KR); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas pueden diferir y provocar errores de pronunciación en ciertas palabras.
- No se han publicado métricas objetivas de calidad (MOS, inteligibilidad) ni benchmarks, por lo que se desconoce su rendimiento real frente a otras voces.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero exige atribución y compartir bajo la misma licencia las obras derivadas; es importante revisar las implicaciones para productos propietarios.
- Al ser un modelo TTS, no procesa contexto conversacional ni mantiene estado entre síntesis; cada invocación es independiente.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero puede producir pronunciaciones incorrectas o artefactos de audio en textos con caracteres no soportados o fuera del dominio de entrenamiento.
- No se documentan sesgos específicos, pero al estar entrenado con un corpus coreano (kss), podría reflejar sesgos de pronunciación o prosodia de ese conjunto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/vits-ko_kr-kss-low-espeak](https://huggingface.co/Phoonnx/vits-ko_kr-kss-low-espeak)
- [Repositorio upstream en GitHub: MycroftAI/mimic3-voices/voices/ko_KO/kss_low](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/ko_KO/kss_low)
- [Librería phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [Librería scriptconv en GitHub](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js en GitHub](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección de modelos VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
