# Phoonnx/glowtts-en_us-cmu_slp

## Resumen

Glow-TTS en_us-cmu_slp es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado en formato ONNX por Phoonnx a partir del modelo original publicado por Rhasspy dentro del proyecto Larynx. El modelo sigue la arquitectura Glow-TTS, un modelo generativo de flujo normalizador que produce espectrogramas de mel a partir de fonemas, y que en este caso se combina con el vocoder HiFi-GAN multi-VCTK small para convertir el espectrograma en audio. La entrada de texto no es texto plano, sino fonemas IPA procesados mediante el fonemizador gruut, por lo que el modelo depende de una cadena de preprocesado lingüístico externa.

El interés de este modelo reside en su empaquetado para la librería phoonnx, que lo hace directamente consumible desde Python y desde el asistente OVOS mediante el plugin ovos-tts-plugin-phoonnx. No se trata de un modelo de última generación ni de un TTS neuronal de gran escala, sino de una voz concreta del ecosistema Larynx, orientada a síntesis local, ligera y sin dependencias de servicios en la nube. El repositorio ocupa 0,1 GB y contiene pesos ONNX, lo que facilita su despliegue en entornos con recursos limitados.

La información pública disponible es escasa: la model card no documenta parámetros, contexto, datos de entrenamiento ni resultados de benchmarks, y la licencia aparece como "other" sin texto asociado. Cualquier evaluación de calidad o de idoneidad para producción debe hacerse, por tanto, mediante pruebas directas con la librería phoonnx y la revisión de la licencia del release original de Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujo normalizador generativo) con vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin texto de licencia registrado; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small (descargado automáticamente por phoonnx) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en flujos normalizadores, no en un transformer autoregresivo. Aprende una transformación invertible entre la distribución de espectrogramas mel y una distribución latente, condicionada por la secuencia de fonemas de entrada, y utiliza un mecanismo de alineamiento monotónico para determinar la duración de cada fonema sin necesidad de un aligner externo. La salida del modelo es un espectrograma mel que posteriormente se convierte en forma de onda mediante el vocoder HiFi-GAN. En este repositorio, el modelo se distribuye como grafo ONNX para su ejecución con phoonnx, y la model card indica que el vocoder se descarga junto con la voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o ajuste fino posterior. El modelo procede del release v1.0 del proyecto Larynx de Rhasspy, un conjunto de voces TTS de código abierto orientadas a asistentes de voz locales, pero la model card no detalla el corpus utilizado para esta voz concreta (en-us-cmu_slp). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de Glow-TTS: alineamiento monotónico, entrenamiento por máxima verosimilitud con flujos y decodificación determinista del espectrograma.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto, mediante fonemización previa con gruut.
- Generación de espectrogramas mel y conversión a audio WAV a través del vocoder HiFi-GAN multi-VCTK small.
- Integración nativa con la librería phoonnx en Python, con una API basada en TTSModelManager y objetos de voz.
- Integración con el asistente OVOS mediante el plugin ovos-tts-plugin-phoonnx, configurable en mycroft.conf.
- Ejecución local en formato ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es exclusivamente un modelo de síntesis de voz.
- No dispone de capacidades de visión, audio de entrada ni comprensión de lenguaje; solo genera audio a partir de fonemas.
- No se documentan capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS y permite que un asistente doméstico genere respuestas habladas sin conexión a Internet, configurando la voz larynx/en-us-cmu_slp-glow_tts en mycroft.conf.
- Síntesis de voz en dispositivos de bajos recursos: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en Raspberry Pi o mini-PC sin GPU dedicada, siempre que se valide la latencia en el hardware objetivo.
- Generación de avisos y notificaciones pregrabadas: útil para producir mensajes de voz dinámicos en sistemas de domótica, timbres inteligentes o paneles de control, donde la variedad de frases es limitada y el coste por síntesis debe ser mínimo.
- Lectura de texto en aplicaciones de accesibilidad: el modelo puede narrar contenido textual en inglés para usuarios con discapacidad visual, integrándose en un pipeline que normalice el texto y lo fonemice con gruut antes de la síntesis.
- Prototipado de interfaces conversacionales: sirve para validar flujos de voz en entornos de desarrollo antes de invertir en voces comerciales o modelos TTS de mayor calidad, gracias a su instalación sencilla vía pip.
- Generación de audio para pruebas automatizadas: permite crear clips de voz deterministas en pipelines de test de sistemas de reconocimiento de voz o de asistentes, sin depender de APIs externas ni de cuotas de uso.
- Síntesis por lotes en servidores sin GPU: al ser un modelo ONNX ligero, puede procesar colas de texto a audio en CPU para tareas de preproducción o generación de contenido de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) y la naturaleza ONNX del modelo, es previsible que la inferencia en CPU sea viable, pero no se documentan cifras de memoria.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan asegurar que el modelo aproveche CUDA o DirectML a través de phoonnx.
- Opciones de despliegue: phoonnx en Python (pip install --pre phoonnx "scriptconv[gruut]") y el plugin ovos-tts-plugin-phoonnx para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware y del vocoder HiFi-GAN asociado, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_slp | Glow-TTS + HiFi-GAN small | en-US | ONNX | other (sin texto) | Voz Larynx empaquetada para phoonnx; 0,1 GB |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | según voz | ONNX | other | Misma arquitectura y pipeline; varían la voz y el idioma |
| Modelos TTS neuronales de gran escala (p. ej. familia VITS o FastSpeech2) | VITS, FastSpeech2, etc. | varios | safetensors, ONNX | variable | No se dispone de datos concretos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas; los datos de la model card no incluyen métricas ni referencias a modelos comparables.

## Limitaciones y advertencias

- Licencia "other" sin texto registrado: la model card recomienda verificar la licencia del release original de Rhasspy antes de cualquier uso, incluido el comercial. No se garantiza permiso de uso comercial.
- Idiomas: solo inglés estadounidense (en-US). No hay soporte multilingüe documentado.
- Entrada restringida a fonemas: el modelo no acepta texto plano directamente; requiere la cadena de fonemización gruut a través de scriptconv, lo que añade una dependencia y un paso de preprocesado que puede fallar con texto anómalo.
- Calidad de voz no documentada: no se publican métricas de naturalidad (MOS), inteligibilidad ni comparativas con otras voces, por lo que la calidad debe evaluarse empíricamente.
- Riesgo de alucinación en el sentido de prosodia o duraciones incorrectas: al ser un modelo TTS, los errores se manifiestan como pronunciaciones defectuosas, pausas extrañas o artefactos del vocoder, no como texto inventado.
- Sesgos: no se documentan sesgos de género, acento o hablante; la voz concreta (cmu_slp) no está descrita en la model card.
- Dependencia del vocoder externo: el modelo descarga hifigan-multi-vctk-small, por lo que la calidad final depende de ese componente y de su disponibilidad.
- Escaso mantenimiento y adopción: 31 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- Fechas de creación y actualización del repositorio posteriores a la fecha actual de referencia, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_slp
- Release original de Rhasspy Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_slp-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
