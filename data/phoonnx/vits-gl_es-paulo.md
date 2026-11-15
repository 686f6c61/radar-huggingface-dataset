# Phoonnx/vits-gl_es-paulo

## Resumen

vits-gl_es-paulo es un modelo de síntesis de voz (text-to-speech) en gallego, desarrollado originalmente por el HiTZ Center (Universidad del País Vasco) y empaquetado por Phoonnx para su uso con la librería ONNX phoonnx. Se trata de una adaptación del modelo upstream HiTZ/TTS-gl_paulo, que emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal end-to-end que genera waveform directamente a partir de texto sin necesidad de un vocoder separado.

El modelo está orientado a la síntesis de voz en gallego (código `gl`, variante `gl-ES`) y toma como entrada fonemas en el alfabeto cotovia, generados mediante el fonemizador `CotoviaPhonemizer` de la librería scriptconv. Su empaquetado en formato ONNX y su integración con phoonnx lo hacen especialmente adecuado para despliegues ligeros, incluyendo asistentes de voz basados en OVOS (Open Voice OS).

Con un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para inferencia en CPU o GPU de gama baja, con licencia Apache 2.0 que permite uso comercial. Su relevancia radica en ser una pieza más del ecosistema de voces gallegas de código abierto integradas en pipelines de TTS estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | ONNX (formato empaquetado; cuantizaciones adicionales no disponibles) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas cotovia (alfabeto cotovia) |
| Autor original | HiTZ Center |
| Empaquetador | Phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por texto, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado con aprendizaje adversario. VITS produce waveform directamente desde la secuencia de fonemas, eliminando la necesidad de un vocoder externo y permitiendo una síntesis rápida y de calidad razonable.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o ajuste fino específicas. El modelo upstream procede del HiTZ Center y está empaquetado en ONNX para su ejecución con phoonnx; la cadena de preprocesado de texto se delega en scriptconv, que normaliza el texto y lo convierte a fonemas cotovia mediante `CotoviaPhonemizer`.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto escrito.
- Generación de waveform end-to-end sin vocoder separado.
- Normalización y fonemización automática del texto de entrada mediante scriptconv y el fonemizador cotovia.
- Integración con la librería phoonnx para Python.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, apta para entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en gallego: integración en OVOS mediante `ovos-tts-plugin-phoonnx`, configurando la voz `hitz/gl_paulo-vits` en `mycroft.conf` para respuestas habladas en gallego.
- Lectura de contenido web o documentos: conversión de artículos, noticias o textos administrativos en gallego a audio para accesibilidad o consumo pasivo.
- Sistemas de navegación o anuncios por voz: generación de avisos hablados en gallego en aplicaciones de transporte, industria o domótica.
- Audiolibros y podcasts automatizados: síntesis de textos largos en gallego, troceando la entrada en frases y concatenando los WAV resultantes.
- Atención al cliente telefónica o por voz: respuestas pregrabadas dinámicas en gallego para IVR, aprovechando la licencia Apache 2.0 para uso comercial.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces o documentos en gallego en aplicaciones de escritorio o móviles.
- Prototipado de aplicaciones de voz: al ser un modelo compacto (0,1 GB) en ONNX, permite iterar rápidamente en local sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se estima un consumo de memoria muy reducido, apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS compacto en ONNX, puede ejecutarse en CPU y en GPUs de gama baja (por ejemplo, GTX 1650 o superiores), aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna, dado el reducido tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX Runtime subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-gl_es-paulo (este) | VITS | gallego (gl-ES) | 0,1 GB | Apache 2.0 | ONNX | Hugging Face, phoonnx, OVOS |
| HiTZ/TTS-gl_paulo (upstream) | VITS | gallego (gl-ES) | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX | Hugging Face, phoonnx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS: no realiza comprensión, razonamiento ni generación de texto.
- Solo soporta gallego (`gl-ES`); no es multilingüe.
- La entrada debe pasar por el fonemizador cotovia de scriptconv; un texto mal normalizado o con caracteres no soportados puede degradar la síntesis.
- No se han publicado métricas objetivas (MOS, WER, latencia) que permitan evaluar la calidad de la voz.
- Riesgo de artefactos o pronunciaciones incorrectas en nombres propios, siglas, números o extranjerismos, habitual en modelos TTS fonemizados.
- No se dispone de información sobre sesgos acústicos o demográficos del dataset de entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y condiciones del dataset original del HiTZ Center antes de un despliegue en producción.
- El modelo está empaquetado por un tercero (Phoonnx); la responsabilidad de mantenimiento y actualizaciones recae en dicho empaquetador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-paulo
- Modelo upstream: https://huggingface.co/HiTZ/TTS-gl_paulo
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
