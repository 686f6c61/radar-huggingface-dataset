# rebreda/moonshine-tiny-welsh-pruned

## Resumen

Moonshine Tiny Welsh (pruned) es un modelo de reconocimiento automático del habla (ASR) para galés, desarrollado por el usuario rebreda a partir de Moonshine Tiny de Moonshine AI. Se trata de una adaptación mediante reducción de vocabulario y fine-tuning completo sobre 175 horas de audio en galés e inglés, partiendo de un modelo base de 27,1 millones de parámetros que queda reducido a 21,2 millones tras eliminar las filas de embedding correspondientes a tokens innecesarios para el galés.

El modelo resuelve el problema de la transcripción de voz en galés, un idioma con recursos limitados en el ámbito del ASR, ofreciendo una alternativa extremadamente ligera (21,2 M de parámetros, repositorio de 0,1 GB) que puede ejecutarse en hardware muy modesto. La innovación principal es la poda del vocabulario: Moonshine comparte la tabla de embeddings entre entrada y salida, por lo que el vocabulario original de 32.768 tokens representaba aproximadamente un tercio de los parámetros del modelo; tras la poda se conservan 12.160 tokens, lo que reduce el tamaño sin alterar la tokenización del galés.

La relevancia actual reside en su tamaño reducido y su licencia MIT, que lo hacen adecuado para despliegues en dispositivos con recursos limitados o para experimentación académica en lenguas de bajos recursos. No obstante, su precisión es limitada en comparación con modelos de mayor tamaño, con un WER de 35,6 en Common Voice galés y de 92,7 en conversación espontánea (Siarad), lo que restringe su uso a escenarios controlados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder tipo transformer para ASR) |
| Parámetros totales | 21.157.632 (21,2 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada de utterances cortas; salida limitada a ~25 tokens por segundo de audio, máximo 194 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | galés (cy) e inglés (en) dentro de habla galesa |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine, un encoder-decoder diseñado específicamente para ASR que procesa audio de 16 kHz mono y genera texto con mayúsculas y puntuación. La particularidad de Moonshine es que comparte la tabla de embeddings entre la entrada y la capa de salida, lo que hace que el vocabulario tenga un peso enorme en el total de parámetros. Sobre el modelo base Moonshine Tiny (27,1 M de parámetros, vocabulario de 32.768 tokens), el autor aplicó una poda de vocabulario a 12.160 tokens: conservó todos los tokens que el tokenizador original produce sobre un corpus amplio de texto galés, los tokens especiales y de byte-fallback (con sus ids originales), los tokens añadidos del tokenizador y los tokens intermedios necesarios para que BPE construya los anteriores. Las filas de embedding se recortaron en consecuencia y el tokenizador del repositorio es el podado.

Tras la poda, el autor verificó que el tokenizador podado producía exactamente los mismos tokens que el original en 204.116 textos galeses, y que el modelo podado daba las mismas puntuaciones en los tokens conservados. Posteriormente realizó un fine-tuning de todos los pesos sobre 175 horas de audio en galés e inglés. El texto galés usado para seleccionar los tokens conservados incluyó transcripciones de algunos conjuntos de test (Lleisiau Arfor test, FLEURS galés test y Siarad), así como Common Voice galés (todos los splits) y Lleisiau Arfor train; según el autor, esto solo decide qué tokens existen y el modelo nunca entrenó con el audio ni las transcripciones de test. No se documentan detalles sobre RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Reconocimiento automático del habla en galés con salida de texto con mayúsculas y puntuación.
- Reconocimiento de inglés dentro de habla galesa (código mezclado cy-en).
- Entrada de audio de 16 kHz mono, orientado a utterances cortas.
- Generación de texto mediante decodificación greedy (configuración por defecto con `num_beams: 1`); el beam search (`num_beams=5`) también funciona según la model card.
- Compatibilidad con la librería `transformers` (probado con la versión 5.20) mediante `AutoProcessor` y `MoonshineForConditionalGeneration`, y con el pipeline `automatic-speech-recognition`.
- Soporte de tokens de byte-fallback para escribir texto fuera del conjunto conservado (otros alfabetos, palabras inglesas raras), aunque de forma menos eficiente.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento.

## Casos de uso

- Transcripción de audio corto en galés para subtitulado: el modelo acepta utterances cortas a 16 kHz y genera texto con puntuación, adecuado para generar subtítulos en vídeos o podcasts en galés con revisión humana posterior.
- Prototipado y experimentación académica en ASR de bajos recursos: su tamaño de 21,2 M de parámetros y licencia MIT permiten entrenar y evaluar variantes en hardware modesto, sirviendo como línea base para investigaciones sobre poda de vocabulario en lenguas minoritarias.
- Despliegue en dispositivos con recursos limitados: el repositorio de 0,1 GB y los 21,2 M de parámetros permiten ejecución en CPU o GPUs de gama baja para tareas de dictado o comandos de voz en galés.
- Aplicaciones de accesibilidad para hablantes de galés: transcripción de notas de voz o dictado en entornos con hardware limitado, aceptando la tasa de error del modelo en habla leída (WER 35,6 en Common Voice).
- Investigación sobre code-switching cy-en: el modelo reconoce inglés dentro de habla galesa, útil para estudiar y prototipar sistemas bilingües en contextos galeses.
- Evaluación comparativa de estrategias de poda: sirve como referencia para medir el impacto de reducir el vocabulario de un modelo ASR en la precisión final, comparándolo con el modelo base sin podar y con la variante base galesa de mayor tamaño.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Common Voice Scripted Speech 27.0 galés (test, 5.390 clips) | WER | 35,6 |
| FLEURS galés (cy_gb test, 1.020 clips) | WER | 44,2 |
| Lleisiau Arfor (test galés, 1.500 clips) | WER (todos los clips; frases solapadas con prompts de entrenamiento) | 42,3 |
| Lleisiau Arfor (test galés, 1.500 clips) | WER (solo frases no vistas) | 45,8 |
| Siarad (conversación galesa, held out, 1.500 clips) | WER | 92,7 |
| Banc Trawsgrifiadau Bangor (test, 1.500 clips) | WER | 39,5 |
| FLEURS inglés (en_us test, 500 clips) | WER | 30,3 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (21,2 M de parámetros, ~85 MB en fp32); en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 o incluso en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: `transformers` (probado con la versión 5.20) mediante `AutoProcessor` y `MoonshineForConditionalGeneration`, o el pipeline `automatic-speech-recognition`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje, no a este ASR).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | WER galés (referencia) | Disponibilidad |
|---|---|---|---|---|---|
| moonshine-tiny-welsh-pruned (este modelo) | 21,2 M | cy, en | MIT | 35,6 (Common Voice 27) | HuggingFace |
| moonshine-base-welsh (ggggdsdd) | 61,5 M | cy, en | no disponible en la información | no disponible | HuggingFace |
| moonshine-ai/moonshine-tiny (base) | 27,1 M | en (principalmente) | MIT | no disponible | HuggingFace |

El autor indica que este modelo es menos preciso que su hermano mayor `ggggdsdd/moonshine-base-welsh` (61,5 M de parámetros), pero un tercio de su tamaño. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Precisión limitada: el WER de 92,7 en conversación espontánea (Siarad) indica un rendimiento pobre en habla natural, solapada o con ruido; el modelo está pensado para utterances cortas y relativamente limpias.
- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse sobre corpus galeses concretos puede reflejar los sesgos de dichos corpus (variedades dialectales, hablantes, temáticas).
- Riesgo de alucinación: no se documenta explícitamente, pero como todo modelo generativo de ASR puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o silencios.
- Limitaciones de contexto e idioma: entrada de audio de 16 kHz mono y utterances cortas; la salida se limita a unos 25 tokens por segundo de audio (máximo 194 tokens). El vocabulario podado cubre el galés y parte del inglés; texto de otros alfabetos o palabras inglesas raras se escribe mediante byte-fallback de forma menos eficiente.
- Posible contaminación en la selección del vocabulario: el texto usado para elegir los tokens conservados incluyó transcripciones de algunos conjuntos de test (Lleisiau Arfor test, FLEURS galés test y Siarad), aunque el autor afirma que el modelo no entrenó con ese audio ni esas transcripciones.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; se hereda del modelo base Moonshine.
- Caveats para producción: los resultados de benchmarks no están verificados (`verified: false`); conviene validar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rebreda/moonshine-tiny-welsh-pruned
- Modelo base Moonshine Tiny: https://huggingface.co/moonshine-ai/moonshine-tiny
- Modelo hermano de mayor tamaño: https://huggingface.co/ggggdsdd/moonshine-base-welsh
- Página del proyecto con el write-up de los experimentos: https://quickthoughts.ca/projects/welsh-asr/
- Paper de Moonshine (arXiv:2410.15608): https://arxiv.org/abs/2410.15608
- Dataset Lleisiau Arfor: https://huggingface.co/datasets/cymen-arfor/lleisiau-arfor
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Banc Trawsgrifiadau Bangor: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Dataset Corpws CLLC WLGA: https://huggingface.co/datasets/techiaith/corpws-clllc-wlga
