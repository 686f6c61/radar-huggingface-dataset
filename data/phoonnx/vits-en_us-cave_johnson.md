# Phoonnx/vits-en_us-cave_johnson

## Resumen

vits-en_us-cave_johnson es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por davet2001 y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en inglés estadounidense en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer una voz TTS ligera y ejecutable localmente dentro del ecosistema phoonnx y OVOS (Open Voice OS), sin depender de servicios en la nube.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de TTS compacto apto para dispositivos con recursos limitados. La voz concreta corresponde al hablante identificado como "cave_johnson" en el repositorio upstream davet2001/cave_johnson1. No se trata de un modelo de lenguaje generativo ni de un sistema multimodal: es un sintetizador acústico puro que transforma secuencias de fonemas en formas de onda.

Su relevancia actual radica en la integración con el stack de phoonnx y OVOS, que permite desplegar TTS neuronal en asistentes de voz autoalojados, sistemas de accesibilidad y aplicaciones de borde. La licencia MIT facilita su uso comercial sin restricciones significativas, aunque la información publicada sobre datos de entrenamiento, métricas de calidad y arquitectura interna es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible (se distribuye en formato ONNX) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Autor original | davet2001 |
| Empaquetador | Phoonnx |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, además de una pérdida de reconstrucción espectral. VITS se caracteriza por generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. El modelo se distribuye exclusivamente en formato ONNX, optimizado para inferencia en CPU y entornos embebidos.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de origen más allá del identificador "cave_johnson", ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste fino adicional. El front-end de texto delega en espeak-ng para la fonemización, y phoonnx utiliza la librería scriptconv (concretamente EspeakPhonemizer) para normalizar y convertir el texto en la secuencia de fonemas IPA que consume el modelo. Esta dependencia implica que la calidad de pronunciación está ligada a la versión de espeak-ng instalada; el uso del port espyak puede introducir discrepancias fonéticas y errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng, con normalización previa del texto a través de scriptconv.
- Ejecución local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración nativa con el ecosistema OVOS a través del plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador mediante phoonnx.js, con demo pública disponible.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio de entrada ni otras capacidades multimodales.
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz autoalojados: el modelo se integra en OVOS mediante el plugin ovos-tts-plugin-phoonnx, permitiendo que un asistente doméstico genere respuestas habladas en local sin enviar texto a servicios externos. Su tamaño de 0,1 GB y su formato ONNX lo hacen adecuado para dispositivos de borde como Raspberry Pi.
- Sistemas de accesibilidad: aplicaciones de lectura de pantalla o lectores de documentos pueden invocar el modelo para convertir texto en audio en tiempo real, aprovechando la inferencia en CPU y la licencia MIT para distribución comercial.
- Automatización de anuncios y avisos: sistemas de megafonía, paneles informativos o notificaciones de aplicaciones pueden generar mensajes de voz pregrabados dinámicamente con esta voz, sin coste por llamada a API.
- Prototipado de interfaces conversacionales: equipos que desarrollan productos de voz pueden usar el modelo como voz de referencia durante las fases de diseño y pruebas, gracias a su instalación sencilla vía pip y su integración con phoonnx.
- Generación de audio para contenidos educativos: creación de narraciones para cursos, tutoriales o materiales de e-learning en inglés estadounidense, con la posibilidad de ejecutar la síntesis en lote sobre CPU.
- Pruebas de regresión en pipelines de TTS: al ser un artefacto ONNX determinista y ligero, puede emplearse como caso base para validar cambios en el front-end de fonemización (espeak-ng frente a espyak) y medir su impacto en la pronunciación.
- Desarrollo de aplicaciones web con TTS en el navegador: mediante phoonnx.js, el modelo puede ejecutarse del lado del cliente para generar voz sin backend, útil en demos interactivas o aplicaciones de lectura web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime. No se dispone de cifras oficiales de memoria RAM, aunque el tamaño del repositorio (0,1 GB) sugiere un consumo moderado.
- GPU recomendadas: no disponibles; no se documenta soporte GPU específico.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS) y phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-cave_johnson | VITS | en-US | ONNX | MIT | no aplica | Voz concreta empaquetada para phoonnx |
| Piper (voces comunitarias) | VITS | múltiples | ONNX | variable (MIT en muchas voces) | no aplica | Ecosistema más amplio de voces; phoonnx empaqueta voces de la comunidad Piper |
| Coqui TTS (modelos VITS) | VITS | múltiples | PyTorch/ONNX | variable | no aplica | Framework generalista con mayor número de voces y herramientas de entrenamiento |
| XTTS v2 (Coqui) | GPT-based TTS | multilingüe | PyTorch | CPML (no comercial) | no aplica | Modelo de mayor tamaño con clonación de voz; requisitos de hardware superiores |

La comparación se limita a categorías generales, ya que no se dispone de métricas objetivas (MOS, RTF) publicadas para este modelo concreto que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz sintética concreta, su prosodia y timbre reflejan las características del hablante de origen, sin información sobre la diversidad del dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la fonemización con espeak-ng puede producir pronunciaciones incorrectas en palabras ambiguas, siglas o términos extranjeros.
- Dependencia de espeak-ng: la calidad de la síntesis depende de la versión instalada; el uso del port espyak puede generar errores de pronunciación según advierte la propia model card.
- Limitación de idioma: solo admite inglés estadounidense; no hay soporte para otros idiomas ni cambio de voz.
- Limitaciones de contexto: no es un modelo conversacional; no mantiene contexto entre síntesis ni procesa entradas largas de forma estructurada más allá de la frase introducida.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, pero la model card remite a los términos del release upstream (davet2001/cave_johnson1), que conviene verificar antes de un despliegue en producción.
- Caveat para producción: con solo 29 descargas y 0 likes, el modelo tiene una validación comunitaria muy limitada; se recomienda evaluar la calidad de síntesis con el vocabulario específico del caso de uso antes de adoptarlo.
- Sin métricas publicadas: no hay datos de MOS, RTF ni comparativas objetivas que permitan garantizar un nivel de calidad determinado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-cave_johnson
- Modelo upstream: https://huggingface.co/davet2001/cave_johnson1
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
