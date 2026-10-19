# junkstage/kikiri-de

## Resumen
kikiri-de es un modelo de síntesis de voz (text-to-speech) en alemán publicado por junkstage en HuggingFace. Se basa en la arquitectura Kokoro-82M/StyleTTS-2 y se entrenó desde cero para alemán; tiene 81.126.738 parámetros y un repositorio de 0,3 GB. No es un LLM: no dispone de ventana de contexto ni de capacidades de razonamiento; su función es convertir texto en audio.

El checkpoint publicado corresponde al tag v2.0, export epoch_0004 (paso 120.120), e incluye la voz Heinrich como un vector de estilo de 256 dimensiones. El código oficial de inferencia añade un watermark AudioSeal inaudible y metadatos de IA generada en los archivos WAV, en línea con el artículo 50 del Reglamento Europeo de IA. La licencia Apache-2.0 facilita la integración, pero la obligación de transparencia sobre audio sintético se mantiene.

Es relevante para desarrolladores que necesitan TTS local en alemán con requisitos de hardware muy bajos y para investigadores que quieran evaluar un modelo pequeño entrenado con corpus alemán y datos sintéticos. No se han publicado benchmarks en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M / StyleTTS-2 (TTS; entrenada desde cero en alemán) |
| Parámetros totales | 81.126.738 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo TTS; no se documenta límite de texto de entrada) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, ONNX o INT8) |
| Idiomas soportados | alemán (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` y `voices/*.safetensors`) |
| Pipeline | text-to-speech |
| Voces incluidas | Heinrich (vector de estilo `[256]`) |
| Versión | v2.0 (export epoch_0004, paso 120.120) |
| Watermark | AudioSeal, si se usa el código oficial de inferencia |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento
kikiri-de sigue la arquitectura Kokoro-82M/StyleTTS-2 y fue entrenado desde cero para alemán. El export publicado no incluye el style encoder: `model.safetensors` contiene los pesos sin ese componente, por lo que no se pueden crear voces nuevas a partir de este checkpoint. Las voces se distribuyen como vectores de estilo independientes en `voices/*.safetensors`, con forma `[256]`, y están ligadas a este export concreto. El código de inferencia rechaza voces de otros exports.

El entrenamiento utilizó el corpus HUI-Audio-Corpus-German y datos generados con Qwen-TTS. El modelo incorpora pesos PL-BERT-de que fueron ajustados durante el entrenamiento. No se documentan en la información disponible el número exacto de tokens, la composición detallada del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones adicionales de decodificación o atención.

## Capacidades
- Síntesis de voz en alemán a partir de texto, con salida en formato WAV mediante la CLI oficial.
- Voz Heinrich incluida como vector de estilo; no se pueden generar voces nuevas con este export porque falta el style encoder.
- Watermark AudioSeal inaudible y marcado de metadatos como audio generado por IA cuando se usa el código oficial.
- Comando de detección del watermark (`kikiri detect`) para verificar archivos de audio.
- Integración en pipelines local mediante el repositorio `kikiri-german-inference`.
- Versionado por tags: el código carga un tag fijo y las voces están vinculadas al export correspondiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni entrada de audio. Es exclusivamente un modelo TTS.
- No se documentan controles de emoción, velocidad, SSML u otras marcas prosódicas más allá del vector de voz.
- Capacidad multilingüe: no disponible; solo alemán.

## Casos de uso
- Locución de cursos y materiales formativos en alemán: el comando `kikiri say` genera WAV a partir de texto y permite regenerar lecciones cuando cambie el guion. El tamaño de 81 M facilita ejecución local.
- Audiolibros y lectura asistida: conversión por lotes de capítulos o documentos a audio con una voz consistente, usando el vector de estilo Heinrich incluido.
- Anuncios y avisos pregrabados para transporte, comercio o administración: frases cortas en alemán con watermark y metadatos de IA, útiles para cumplir obligaciones de transparencia.
- Prototipos de asistentes de voz en alemán: el modelo cubre la fase de síntesis dentro de un pipeline de diálogo; no realiza ASR ni razonamiento, pero puede integrarse con otros componentes.
- Pruebas de accesibilidad web y de aplicaciones: generación de audio para pruebas automatizadas de lectores de pantalla y contenidos accesibles, con ejecución en CPU o GPU modesta.
- Generación de datos sintéticos de audio para experimentos de ASR en alemán: aumento de corpus con voz sintética, etiquetando y marcando el audio como generado por IA; requiere revisión de sesgos y artefactos.
- Doblaje temporal de vídeos internos o material promocional: sustitución de locuciones provisionales sin clonación de voz; no sustituye a un actor ni garantiza calidad de estudio sin revisión humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de MOS, WER, RTF ni comparativas numéricas con otros modelos TTS.

## Requisitos de hardware
- VRAM estimada: los 81,1 M de parámetros ocupan aproximadamente 324 MB en FP32, 162 MB en FP16 y 81 MB en INT8 solo como pesos. Con overhead de runtime es razonable esperar menos de 1 GB en FP16, pero no hay medición oficial.
- GPU recomendadas: no se documentan. Por tamaño, no requiere A100 ni H100; una GPU consumer modesta o incluso CPU puede ser suficiente si el código oficial lo permite.
- Cabe en GPU consumer: previsiblemente sí, en cualquier GPU con 2 GB o más de VRAM; no está confirmado por el autor.
- Opciones de despliegue: código oficial `kikiri-german-inference`. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime; estas herramientas no están orientadas a este tipo de modelo TTS.
- Latencia y throughput: no disponibles.
- El watermark AudioSeal añade un paso adicional en la generación; no se documenta su coste computacional.

## Comparativa con modelos similares
No se dispone de benchmarks ni de datos de rendimiento comparables en la información proporcionada. La tabla recoge solo los aspectos estructurales verificables.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kikiri-de | 81.126.738 | no aplica | alemán (de) | Apache-2.0 | HuggingFace y código oficial |
| Kokoro-82M | ~82 M según el nombre; exacto no disponible | no aplica | no disponible | no verificada en la información | no disponible |
| StyleTTS-2 | no disponible | no aplica | no disponible | no verificada en la información | no disponible |

## Limitaciones y advertencias
- Solo soporta alemán; no se documenta soporte multilingüe ni code-switching.
- No incluye style encoder en `model.safetensors`, por lo que no permite crear voces nuevas ni clonar voces con este export.
- Las voces están vinculadas al export; el código oficial rechaza vectores de estilo de otros exports.
- No hay benchmarks publicados que permitan verificar calidad, prosodia o inteligibilidad frente a alternativas.
- El entrenamiento usa HUI-Audio-Corpus-German y datos generados con Qwen-TTS; pueden aparecer sesgos de dominio, variedad dialectal, estilo y artefactos propios de datos sintéticos.
- Riesgo de errores de pronunciación en nombres propios, palabras compuestas, siglas y términos técnicos; no es un LLM y no razona sobre el texto.
- No se documenta el límite máximo de texto de entrada; dependerá del código de inferencia.
- La licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos y revisarse las licencias de terceros indicadas en `NOTICE` del repositorio de inferencia.
- El watermark AudioSeal no debe eliminarse ni evitarse. Quien publique audio generado debe identificarlo como IA, especialmente si imita a una persona o un evento real (artículo 50 del Reglamento Europeo de IA).
- No debe usarse para suplantar identidades, engañar o difundir desinformación.

## Enlaces
- HuggingFace: [junkstage/kikiri-de](https://huggingface.co/junkstage/kikiri-de)
- Repositorio de inferencia: [ichDaheim/kikiri-german-inference](https://github.com/ichDaheim/kikiri-german-inference)
- AudioSeal: [facebookresearch/audioseal](https://github.com/facebookresearch/audioseal)
- No se han proporcionado enlaces al corpus HUI-Audio-Corpus-German, a Qwen-TTS ni a un paper del modelo en la información disponible.
