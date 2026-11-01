# loom-ai-org/nemotron-labs-unified-asr-0.6b-loom

## Resumen

Nemotron-Labs-Unified-ASR 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA Labs. Combina un codificador FastConformer con un decodificador RNN-T y utiliza indicaciones de identificación de idioma (language-ID prompting) para transcribir audio en 25 lenguas europeas, incluyendo puntuación y capitalización. El modelo base cuenta con 636.877.712 parámetros (aproximadamente 0,6B), lo que lo sitúa en la gama compacta de ASR de alta eficiencia.

La ficha que nos ocupa no es el checkpoint original, sino una exportación realizada por el proyecto loom-ai-org para su motor loom.cpp. Se distribuye como un único fichero GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script controlador necesarios para su ejecución. Está disponible en dos precisiones: F32 (2,5 GB) y q8_0 (719 MB), lo que permite desplegarlo en entornos con recursos limitados.

Su relevancia actual radica en la combinación de cobertura multilingüe amplia (25 idiomas europeos), salida con puntuación y mayúsculas, y un formato de empaquetado autocontenido que simplifica el despliegue fuera del ecosistema NeMo. La licencia OpenMDW 1.1, heredada del modelo base, condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + RNN-T (decodificador) |
| Parametros totales | 636.877.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (atención sobre el clip completo; sin ventana de streaming) |
| Tipos de cuantizacion | F32 y q8_0 |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | other (OpenMDW License 1.1) |
| Formato de pesos | GGUF (loom.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida compuesta por un codificador FastConformer, una variante eficiente del Conformer que reduce el coste computacional de la atención, y un decodificador RNN-T (Recurrent Neural Network Transducer) para la generación de transcripciones. Incorpora además indicaciones de identificación de idioma que permiten condicionar la salida a una lengua concreta o dejar que el modelo la detecte automáticamente (`auto`). La salida incluye puntuación y capitalización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La exportación a loom.cpp preserva los parámetros del checkpoint original en el fichero F32; las versiones cuantizadas empaquetan los pesos de convolución y proyección mediante `loom-export --quantize <type>`. El fichero GGUF es autodescriptivo e incluye el grafo, el tokenizador y el driver de ejecución. La inferencia es exclusivamente offline: el clip completo pasa por el codificador con contexto completo, sin el modo de streaming con búfer de NeMo.

## Capacidades

- Reconocimiento automático del habla (transcripción) en 25 lenguas europeas.
- Detección automática del idioma de entrada cuando no se especifica ninguno (`auto`).
- Selección explícita de idioma mediante códigos de dos letras (`de`, `pl`) o locales (`de-DE`); el contrato del modelo expone 118 nombres de prompt en `model.contract["asr_languages"]`.
- Salida con puntuación y capitalización.
- Procesamiento de audio mono a 16 kHz.
- Ejecución offline sobre el clip completo (sin streaming).
- Integración con el ecosistema loom.cpp/loom-py mediante la API `model.speech2text.infer(...)`.
- Acceso al driver embebido vía `model.driver_source` para ajustar parámetros no expuestos por la API de alto nivel.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa el clip completo y devuelve texto con puntuación y mayúsculas, adecuado para actas y resúmenes posteriores. Conviene segmentar grabaciones largas en pausas, ya que el coste crece con la duración del clip.
- Subtitulado de vídeo multilingüe: con 25 idiomas europeos y detección automática, permite generar subtítulos para contenido en varias lenguas sin cambiar de modelo.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas para análisis de calidad, cumplimiento y extracción de temas, con la precisión que ofrece la cuantización q8_0 (diferencias de hasta 0,4 puntos de WER frente a F32).
- Investigación lingüística y corpus: generación de transcripciones para estudios comparativos entre lenguas europeas, aprovechando la cobertura de idiomas eslavos, bálticos y nórdicos.
- Despliegue en dispositivos con recursos limitados: la variante q8_0 (719 MB, pico de 1,4 GB de memoria) permite ejecutar ASR en máquinas modestas o entornos contenedorizados sin GPU de gran capacidad.
- Pipelines de accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en aplicaciones de escritorio o servidores, usando el runtime loom-py-rt.
- Preprocesado de datos para entrenamiento de otros modelos: transcripción masiva de audio en 25 idiomas como paso previo a la anotación o al filtrado de corpus.

## Benchmarks y rendimiento

Los datos disponibles son métricas de calidad de transcripción (WER) y de memoria, no benchmarks estándar tipo MMLU o HumanEval.

| Metrica | Resultado |
|---|---|
| LibriSpeech (WER, q8_0) | 3,91 % (idéntico a F32) |
| FLEURS aleman (WER, q8_0) | 2,91 % |
| FLEURS espanol (WER, q8_0) | 3,37 % |
| FLEURS frances (WER, q8_0) | 10,00 % |
| FLEURS polaco (WER, q8_0) | 9,02 % |
| Memoria pico F32 | 3,2 GB |
| Memoria pico q8_0 | 1,4 GB |
| Transcripciones token-identicas a NeMo (LibriSpeech) | 71 de 73 |
| Transcripciones token-identicas a NeMo (FLEURS) | 53 de 60 |

Los resultados de FLEURS corresponden a la ejecución con el idioma nombrado explícitamente. El fichero F32 reproduce token a token la decodificación de NeMo en 73 clips de LibriSpeech y 60 de FLEURS (alemán, español, francés y polaco), tanto con idioma nombrado como en modo `auto`.

## Requisitos de hardware

- VRAM estimada: 3,2 GB de pico para F32; 1,4 GB de pico para q8_0.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el tamaño del modelo, cabe en GPU de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4090 y superiores; también en A100 y H100.
- Cabe en GPU de consumo: sí, con amplio margen, especialmente la variante q8_0.
- Opciones de despliegue: runtime loom-py-rt (versión 1.0.0rc18 o superior, necesaria por el operador `STFT`); el fichero GGUF se ejecuta mediante loom.cpp. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-Labs-Unified-ASR 0.6B (loom) | 636,9 M | 25 europeos | clip completo (offline) | OpenMDW 1.1 | GGUF |
| Whisper (variantes pequenas) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| NeMo original (nvidia/nemotron-labs-unified-asr-0.6b) | 636,9 M | 25 europeos | offline y streaming con bufer | OpenMDW 1.1 | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada. La comparación más directa es con el checkpoint original de NVIDIA, del que esta exportación hereda los parámetros y la licencia, con la diferencia de que el original soporta streaming con búfer de 5,6 s de contexto izquierdo recalculado y esta exportación es solo offline.

## Limitaciones y advertencias

- Solo modo offline: no se exporta el streaming con búfer de NeMo; el clip completo pasa por el codificador con contexto completo.
- El coste computacional crece con la duración del clip; se recomienda dividir grabaciones largas en las pausas (por ejemplo, con `silero-vad-loom`).
- No genera marcas de tiempo: `segments` devuelve un único intervalo que cubre todo el clip.
- Audio de entrada limitado a mono a 16 kHz.
- El parámetro `language=` acepta nombres de prompt del checkpoint, incluidos 118 locales; algunos de esos nombres corresponden a idiomas fuera de los 25 entrenados y no constituyen un uso soportado.
- La detección automática de idioma (`auto`) puede ser menos precisa que nombrar el idioma cuando se conoce.
- La licencia OpenMDW 1.1 es distinta de las licencias permisivas habituales; es necesario revisar sus términos antes de un uso comercial.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación específicas del modelo.
- Requiere loom-py-rt 1.0.0rc18 o superior; versiones anteriores fallan con `unknown op 'STFT'`.
- El modelo tiene pocas descargas (21) y ningún "like" en el momento de la consulta, lo que limita la validación comunitaria de la exportación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/loom-ai-org/nemotron-labs-unified-asr-0.6b-loom)
- [Modelo base: nvidia/nemotron-labs-unified-asr-0.6b](https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
- [Licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
