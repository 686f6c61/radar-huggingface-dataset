# Phoonnx/vits-gl_es-iago

## Resumen

vits-gl_es-iago es un modelo de síntesis de voz (text-to-speech) en gallego, empaquetado en formato ONNX para la librería phoonnx por el usuario Phoonnx. El modelo original procede de HiTZ/TTS-gl_iago, desarrollado por el HiTZ Center (Centro de Tecnología del Lenguaje de la Universidad del País Vasco), y ha sido reconvertido para su ejecución mediante ONNX Runtime dentro del ecosistema phoonnx, que incluye integración con asistentes de voz OVOS.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para producir audio de forma directa a partir de fonemas. El modelo trabaja con la variante dialectal gl-ES (gallego de España) y utiliza el alfabeto y fonemizador Cotovia como front-end de texto.

El paquete tiene un tamaño de repositorio de 0,1 GB, lo que lo hace muy ligero y adecuado para despliegues en entornos con recursos limitados, incluidos dispositivos de borde. Su relevancia actual radica en la escasez de modelos TTS de calidad para lenguas minoritarias como el gallego y en su integración directa con pipelines de asistentes de voz de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end para síntesis de voz que integra en un único modelo un codificador de texto, un prior variacional condicionado por alineamientos monotónicos, un decodificador generativo basado en flujos normalizadores inversos y un decodificador de audio (típicamente HiFi-GAN). El entrenamiento combina una pérdida de reconstrucción (L1 sobre espectrogramas o waveform), una pérdida adversarial con discriminadores multiperiodo y una pérdida de divergencia KL para el alineamiento. El resultado es un modelo que sintetiza audio directamente desde fonemas sin necesidad de un vocoder externo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO o ajuste fino adicional. El modelo upstream es HiTZ/TTS-gl_iago del HiTZ Center, y este paquete es una conversión a ONNX para phoonnx. El front-end de texto utiliza el fonemizador Cotovia (`CotoviaPhonemizer` de `scriptconv.phonemizers.gl`), que normaliza el texto y lo convierte al alfabeto Cotovia antes de la inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego de España (gl-ES) a partir de texto plano.
- Conversión de texto a fonemas mediante el fonemizador Cotovia, integrado en el paquete `scriptconv[gl]`.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable mediante `mycroft.conf`.
- Ejecución sobre ONNX Runtime, lo que permite despliegue en CPU y en entornos sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en gallego: integración como motor TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en gallego en asistentes domésticos de código abierto. La configuración se realiza declarando el módulo y la voz `hitz/gl_iago-vits` en `mycroft.conf`.
- Lectura de contenido web en gallego: conversión de artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando la ligereza del modelo (0,1 GB) para ejecutarse en servidores modestos.
- Sistemas de anuncios públicos y megafonía: generación de locuciones pregrabadas en gallego para transporte, aeropuertos o edificios públicos, donde se requiere una voz consistente y reproducible sin depender de servicios en la nube.
- Audiolibros y contenido editorial: síntesis de textos largos en gallego para producción de audiolibros, con la ventaja de que el modelo es local y no incurre en costes por petición ni envía datos a terceros.
- Aplicaciones de aprendizaje de idiomas: generación de pronunciaciones de referencia en gallego para herramientas de enseñanza, usando el fonemizador Cotovia para garantizar una correspondencia fonema-audio coherente.
- Despliegue en dispositivos de borde: al ser un modelo ONNX de pequeño tamaño, puede ejecutarse en Raspberry Pi u otros dispositivos con CPU, habilitando interfaces de voz offline en gallego sin conectividad.
- Prototipado rápido de interfaces conversacionales: uso de la API Python de phoonnx para generar audio en pruebas de UX o demos de producto antes de invertir en un servicio TTS comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un modelo ONNX de 0,1 GB de repositorio, la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) es suficiente. El modelo está pensado para ejecutarse también en CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/vits-gl_es-iago | VITS | gl-ES | 0,1 GB | apache-2.0 | ONNX |
| HiTZ/TTS-gl_iago (upstream) | VITS | gl-ES | no disponible | apache-2.0 | no disponible |
| Otros modelos de la colección VITS de Phoonnx | VITS | varias lenguas | variable | variable | ONNX |

No se dispone de datos de benchmarks ni de modelos comparables alternativos en gallego dentro de la información proporcionada. La comparación más directa es con el modelo upstream HiTZ/TTS-gl_iago, del que este paquete es una conversión a ONNX.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta gallego de España (gl-ES); no es multilingüe.
- No es un modelo de lenguaje: carece de razonamiento, generación de texto, tool calling o capacidades de agente.
- Riesgo de alucinación en el sentido de pronunciación incorrecta o prosodia inadecuada en textos con abreviaturas, números o nombres propios no cubiertos por el fonemizador Cotovia.
- No se dispone de información sobre sesgos de género, edad o dialecto en la voz sintetizada.
- No se documentan límites de longitud de entrada; textos muy largos pueden requerir segmentación manual antes de la síntesis.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream HiTZ/TTS-gl_iago, ya que el paquete declara heredarla.
- El modelo depende del ecosistema phoonnx y de la extra `scriptconv[gl]`; no es directamente utilizable con otros frameworks TTS sin conversión adicional.
- No se documenta soporte para SSML ni control fino de prosodia (velocidad, tono, énfasis).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-iago
- Modelo upstream: https://huggingface.co/HiTZ/TTS-gl_iago
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
