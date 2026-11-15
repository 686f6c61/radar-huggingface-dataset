# Phoonnx/vits-es_419-sorah_neuronal

## Resumen

vits-es_419-sorah_neuronal es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por HirCoir y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en castellano latinoamericano (es-419) en audio, y su propósito es ofrecer una voz neuronal ligera y ejecutable en local dentro del ecosistema phoonnx y OVOS.

La relevancia de este modelo reside en su formato ONNX y su reducido tamaño (0,1 GB en el repositorio), lo que lo hace adecuado para despliegues en dispositivos con recursos limitados y para integración en asistentes de voz de código abierto. No es un modelo de propósito general ni compite con sistemas TTS de gran escala: es una voz concreta empaquetada para un runtime específico.

La información pública disponible es escasa: la model card no detalla el número de parámetros, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | es-419 (castellano latinoamericano) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (front-end de grafemas) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, además de un modelado de duración estocástico. Esta combinación permite generar audio de forma directa a partir del texto sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo es una conversión del checkpoint original `HirCoir/piper-sorah-neuronal`, empaquetado para phoonnx en formato ONNX. El front-end de texto utiliza `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS).

## Capacidades

- Síntesis de voz a partir de texto en castellano latinoamericano (es-419).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Normalización de texto y conversión a grafemas mediante scriptconv.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en local sobre runtime ONNX, sin dependencia de servicios en la nube.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo ni tool calling.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en castellano latinoamericano sin conexión a internet.
- Lectura de textos en aplicaciones de accesibilidad: integración en lectores de pantalla o aplicaciones que conviertan documentos a audio, aprovechando el formato ONNX y el reducido tamaño del modelo para ejecutarse en equipos modestos.
- Sistemas de megafonía o avisos automatizados: generación de mensajes de voz pregrabados o dinámicos para transporte, comercio o industria, con la ventaja de que el modelo corre en local y no expone datos a terceros.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz funcional en es-419 para pruebas de UX pueden cargar el modelo con pocas líneas de Python mediante `TTSModelManager`.
- Automatización de contenidos educativos: conversión de material didáctico en texto a audio para plataformas de aprendizaje, dado el bajo coste computacional del modelo.
- Integración en pipelines de CI para pruebas de TTS: al ser ONNX y ligero, puede ejecutarse en contenedores de integración continua para validar flujos de síntesis sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) es previsible que quepa en memoria de CPU sin GPU dedicada, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y potencialmente en GPU, pero no se especifica.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-es_419-sorah_neuronal | VITS | es-419 | ONNX | MIT | no disponible | Voz empaquetada para phoonnx |
| HirCoir/piper-sorah-neuronal | VITS | es-419 | Piper | no disponible en la informacion | no disponible | Checkpoint original del que deriva este modelo |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | MIT (segun coleccion) | no disponible | Misma familia de empaquetado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al tratarse de una voz entrenada sobre un dataset no especificado, pueden existir sesgos de pronunciación o prosodia no declarados.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos ante texto fuera de dominio, aunque no se cuantifica.
- Limitación de idioma: el modelo está entrenado exclusivamente para es-419; su uso con otras variantes del castellano o con otros idiomas no está soportado.
- La licencia MIT se aplica al empaquetado, pero la model card remite a los términos del release upstream; conviene verificar las condiciones del checkpoint original antes de un uso comercial.
- No hay información sobre el número de parámetros ni sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad y cobertura.
- El modelo depende de la librería phoonnx en versión preliminar (`pip install --pre phoonnx`), lo que implica una API potencialmente inestable.
- No se documentan mecanismos de control de prosodia, emoción ni velocidad más allá de lo que ofrezca el runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_419-sorah_neuronal
- Checkpoint upstream: https://huggingface.co/HirCoir/piper-sorah-neuronal
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
