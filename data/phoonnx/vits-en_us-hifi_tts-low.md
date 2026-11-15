# Phoonnx/vits-en_us-hifi_tts-low

## Resumen

`vits-en_us-hifi_tts-low` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en inglés estadounidense en audio inteligible, tomando como entrada fonemas en alfabeto IPA generados mediante el fonemizador gruut.

La relevancia de este modelo radica en su formato: al estar empaquetado en ONNX y distribuido a través de una librería ligera como phoonnx, está pensado para inferencia en entornos con recursos limitados, como asistentes de voz embebidos (el stack OVOS/Mycroft) o dispositivos sin GPU dedicada. No es un modelo de propósito general ni compite en calidad con los sistemas TTS neuronales modernos de gran escala, sino que cubre un nicho concreto de síntesis de voz offline y de bajo coste computacional.

El repositorio tiene un tamaño de 0,1 GB, lo que confirma que se trata de un modelo compacto. La información pública disponible es escasa: no se detallan parámetros, contexto ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el autor no documenta variantes) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas GAN, junto con un modelado de duración estocástico. Este diseño permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder externo separado, lo que explica el reducido tamaño del modelo y su idoneidad para inferencia en tiempo real en hardware modesto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicional. El modelo procede del repositorio `mimic3-voices` de Mycroft AI, en la ruta `en_US/hifi-tts_low`, lo que sugiere que fue entrenado como parte del conjunto de voces de Mimic3, pero los detalles concretos del entrenamiento no están documentados en la información disponible. La variante `low` del nombre indica presumiblemente una configuración de menor calidad o menor coste computacional dentro de la familia de voces hifi-tts, aunque el autor no especifica en qué se traduce exactamente.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV mediante el método `synthesize_wav`.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut, integrado a través de la librería `scriptconv`.
- Integración con el stack de asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en formato ONNX, lo que permite ejecución multiplataforma sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo de razonamiento.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistentes de voz embebidos en OVOS/Mycroft: el modelo se integra directamente como plugin TTS en `mycroft.conf`, permitiendo que un asistente local pronuncie respuestas sin conexión a servicios en la nube.
- Síntesis de voz offline en dispositivos de recursos limitados: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en Raspberry Pi u otros SBC sin GPU dedicada.
- Generación de avisos y notificaciones habladas: útil en sistemas de domótica o automatización que necesiten convertir mensajes cortos en audio en tiempo real.
- Prototipado rápido de interfaces de voz: la instalación vía `pip install --pre phoonnx "scriptconv[gruut]"` permite incorporar TTS en un script Python en pocos pasos.
- Accesibilidad: lectura en voz alta de contenido textual en aplicaciones de escritorio o web que requieran una voz inglesa sin depender de APIs externas.
- Investigación y docencia sobre TTS: sirve como ejemplo compacto y reproducible de un pipeline VITS completo con fonemización IPA, útil para estudiar el funcionamiento interno de estos sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se infiere que la huella de memoria es muy reducida y compatible con CPU.
- GPU recomendadas: no se especifican; el formato ONNX permite ejecución en CPU y en GPU de gama baja, pero el autor no documenta configuraciones recomendadas.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: librería `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-hifi_tts-low (este modelo) | VITS | en-US | ONNX | CC-BY-SA-4.0 | Empaquetado para phoonnx/OVOS |
| Otras voces de `mimic3-voices` | VITS | varios | ONNX / varios | según voz | Mismo origen (Mycroft AI), distinta calidad y idioma |
| Piper (rhasspy) | VITS | varios | ONNX | MIT (mayoritariamente) | Orientado a TTS offline en dispositivos embebidos |
| Coqui TTS (modelos VITS) | VITS / otros | varios | varios | según modelo | Framework generalista con mayor ecosistema |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense; no es adecuado para otros idiomas sin un modelo distinto.
- La calidad de la voz es presumiblemente limitada (variante `low`), aunque el autor no cuantifica la diferencia respecto a otras variantes.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de voz de Mycroft AI, puede reflejar las características del corpus original (posible sesgo de acento, género o registro).
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas de palabras fuera del vocabulario o de nombres propios, ya que la fonemización depende de gruut.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas; es importante revisar las implicaciones para uso comercial y para la distribución de audio generado.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un paquete reciente y sin validación comunitaria extensa.
- No hay información sobre latencia, calidad objetiva (MOS) ni pruebas de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hifi_tts-low
- Repositorio upstream (Mycroft AI mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/hifi-tts_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
