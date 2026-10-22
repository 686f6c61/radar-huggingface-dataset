# enesssssw/lost-in-transcription-spanish-english-ensemble

## Resumen

`enesssssw/lost-in-transcription-spanish-english-ensemble` es el conjunto de pesos del ensemble que obtuvo el segundo puesto en la pista *Lost in Transcription: Spanish-English* de Mozilla Data Collective, presentado por el equipo WAXAL (autor: Enes Kulak). No es un modelo único, sino una colección de ocho modelos base de reconocimiento automático de habla (ASR) afinados sobre el corpus Bangor Miami de code-switching español-inglés, más dos carpetas de deltas que se aplican en tiempo de carga. La fusión se hace con un voto ROVER ponderado a nivel de palabra con pesos 20/20/16/16/16/10/8/8/8/8.

El interés técnico está en la heterogeneidad: conviven un Qwen3-Omni-30B-A3B en formato híbrido (expertos AWQ int4, atención bf16), un Voxtral-Small-24B en FP8 con adaptador LoRA, un Whisper large-v3 con LoRA r32 fusionado, un Conformer-CTC large de NGC, un Qwen3-ASR-1.7B, un Cohere Transcribe 2B, un Parakeet Ultra 0.6B TDT y un Phi-4-multimodal con el torre de imagen anulada. El ensemble alcanza un WER de 0,075 en dev, frente al rango de 0,090 a 0,212 de los miembros individuales, y 0,0998 de WER en la clasificación privada de la competición.

Es relevante ahora porque documenta un patrón reproducible de precisión en habla bilingüe con cambios de código: en lugar de un modelo grande, varios especialistas pequeños y medianos con votación ponderada. El repositorio pesa 74,6 GB e incluye el código de inferencia y entrenamiento en `solution_code.zip`; el conjunto está pensado para ejecutarse en su totalidad, no como modelo aislado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble heterogéneo de 8 modelos base de ASR: encoder-decoder transformer (Whisper large-v3, Voxtral), CTC Conformer, TDT (Parakeet), y LLM multimodales con encoder de audio (Qwen3-Omni, Qwen3-ASR, Cohere Transcribe, Phi-4-multimodal). Fusión por voto ROVER ponderado a nivel de palabra |
| Parámetros totales | No disponible como cifra agregada. Por miembro, según denominación: 30B-A3B (Qwen3-Omni), 24B (Voxtral), 2B (Cohere Transcribe), 1,7B (Qwen3-ASR), 0,6B (Parakeet Ultra); para Whisper large-v3, Conformer large y Phi-4-multimodal la model card no indica el recuento |
| Parámetros activos | 3B en el miembro MoE Qwen3-Omni-30B-A3B; el resto de miembros son densos |
| Longitud de contexto | No disponible (la model card no especifica ventana de audio ni de texto para ningún miembro) |
| Tipos de cuantización | AWQ int4 en los expertos del miembro Omni (atención en bf16), FP8 dynamic en la base Voxtral, bf16 y fp16 en el resto. GGUF no disponible |
| Idiomas soportados | es, en (habla con code-switching español-inglés) |
| Licencia | Mixta por miembro (`mixed-per-member`): Apache-2.0 en Omni, Voxtral, Whisper, Qwen3-ASR y Cohere; NGC Terms of Use en Conformer; CC-BY-4.0 en Parakeet; MIT en Phi-4 |
| Formato de pesos | `safetensors`, `delta.pt` (LoRA r16 del miembro Omni), adaptadores LoRA PEFT (`lora/` de Voxtral), state dict de PyTorch + modelo SentencePiece (Conformer), código remoto propio (Cohere) |

## Arquitectura y entrenamiento

El sistema es un ensemble de diez entradas de pesos (ocho modelos base y dos carpetas de delta) con un esquema de votación por palabras: cada miembro produce su transcripción y la decisión final se toma con un ROVER ponderado cuyas pesos son 20/20/16/16/16/10/8/8/8/8. Los miembros cubren familias arquitectónicas distintas —encoder-decoder con atención (Whisper, Voxtral), CTC sobre Conformer, Transducer TDT (Parakeet) y LLM multimodales que tratan el audio como entrada—, lo que aporta diversidad de errores y explica la ganancia del voto sobre el mejor miembro individual.

Todos los miembros se afinaron exclusivamente sobre el corpus Bangor Miami de code-switching español-inglés, usando los folds A + B con separación de hablantes respecto a validación; el conjunto de desarrollo de la competición nunca se usó para entrenar. El ajuste es desigual según el miembro: LoRA r16 en las capas de atención q/k/v/o del Omni (una época, fusionada al arrancar), LoRA r16 en Voxtral, LoRA r32 fusionado en Whisper, LoRA fusionado en Qwen3-ASR, ajuste completo en Conformer, Cohere Transcribe y Parakeet, y un ajuste de LoRA de habla más encoder de audio y proyección de habla en Phi-4, con la torre de imagen rellenada con ceros. El miembro Omni es un checkpoint híbrido que conserva los expertos AWQ int4 y la atención bf16 y elimina las cabeceras talker/code2wav, reduciendo el peso a 21 GB. Los scripts de entrenamiento, decodificación y las reglas de escritura están en `solution_code.zip`.

## Capacidades

- Reconocimiento automático de habla en español, inglés y habla mezclada español-inglés dentro de la misma emisión (code-switching intra e inter-oracional).
- Transcripción de audio procedente de hablantes bilingües del corpus Bangor Miami (folds A y B).
- Fusión por voto ROVER ponderado a nivel de palabra, que reduce el WER de 0,090 (mejor miembro individual, Whisper) a 0,075 en dev.
- Carga modular mediante `python inference/download_weights.py --repo <repo>`, que descarga el árbol a `inference/models/`.
- El miembro Qwen3-Omni conserva su naturaleza de LLM multimodal (texto y audio), aunque en este paquete se emplea como motor ASR.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta salida de marcas de tiempo, diarización ni puntuación explícita.
- Capacidad multilingüe limitada a los dos idiomas indicados; no hay evaluación en otros idiomas.

## Casos de uso

- Transcripción de entrevistas y entrevistas clínicas bilingües: el ensemble está afinado sobre habla español-inglés alternada de hablantes bilingües de Miami, por lo que es adecuado para material donde un solo modelo monolingüe produce saltos de idioma y palabras inventadas en las fronteras de código.
- Subtitulado de medios audiovisuales con cambio de código: la votación ROVER ponderada rebaja el WER en dev de 0,090 a 0,075, lo que se traduce directamente en menos correcciones manuales por minuto de subtítulo.
- Investigación en ASR bilingüe: el repositorio incluye scripts de entrenamiento y el informe completo, de modo que sirve como línea base reproducible para comparar nuevas estrategias de fusión sobre el mismo corpus y partición de hablantes.
- Generación de datos etiquetados para ajuste posterior: las transcripciones del ensemble pueden usarse como pseudo-etiquetas de alta precisión sobre audio code-switched para alimentar modelos más pequeños desplegables en producción.
- Análisis de llamadas de atención al cliente en comunidades bilingües: la combinación de especialistas con distintos sesgos de error reduce inserciones y omisiones en tramos donde el hablante cambia de idioma a mitad de frase.
- Evaluación de modelos ASR individuales: al conservarse los pesos de cada miembro por separado (y los adaptadores LoRA en `lora/`), el paquete permite reproducir los WER individuales de 0,090 a 0,212 y estudiar qué familia arquitectónica falla en cada fenómeno.
- Reproducción de resultados de competición: con los pesos y `solution_code.zip` se puede replicar el 0,0993 público y el 0,0998 privado sin reentrenar.

## Benchmarks y rendimiento

| Sistema | WER en dev | Observaciones |
|---|---|---|
| Whisper large-v3 (miembro individual) | 0,090 | Mejor miembro individual según la model card |
| Conformer-CTC large (miembro individual) | 0,212 | Peor miembro individual según la model card |
| Resto de miembros individuales | No disponible | La model card solo indica el rango 0,090–0,212 |
| Ensemble (ROVER ponderado) | 0,075 | Voto con pesos 20/20/16/16/16/10/8/8/8/8 |
| Clasificación pública de la competición | 0,0993 | Pista *Lost in Transcription: Spanish-English* |
| Clasificación privada de la competición | 0,0998 | Resultado final, segundo puesto |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, algo esperable al tratarse de un sistema ASR. Tampoco se ofrece comparación con sistemas externos al ensemble.

## Requisitos de hardware

- Tamaño total del repositorio: 74,6 GB, incluyendo pesos base, adaptadores, deltas y el archivo de código de la solución.
- VRAM estimada por miembro (cálculo a partir del tamaño de pesos indicado, con margen para caché de activaciones; son estimaciones, no cifras publicadas por el autor): Omni híbrido AWQ int4 + atención bf16, 21 GB en disco, en torno a 22-24 GB en VRAM; Voxtral-Small-24B FP8, aproximadamente 24 GB de pesos, 26-30 GB en VRAM.
- Miembros ligeros: Whisper large-v3 fp16 en torno a 3 GB; Qwen3-ASR-1.7B bf16 en torno a 3,5 GB; Cohere Transcribe 2B bf16 en torno a 4 GB; Parakeet Ultra 0.6B bf16 en torno a 1,3 GB; Conformer-CTC large por debajo de 1 GB; Phi-4-multimodal en torno a 11 GB en fp16 (incluye la torre de imagen anulada).
- Ejecución completa simultánea: por encima de 60 GB de VRAM, lo que exige varios aceleradores (por ejemplo, 2× A100 40 GB, 2× L40S 48 GB o 4× RTX 4090 24 GB).
- Ejecución secuencial con votación ROVER: el pico de VRAM lo marca el miembro mayor, de modo que una A100 40 GB, una L40S 48 GB o una H100 80 GB cubren todo el conjunto cargando y descargando miembros.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los miembros pequeños y medianos y, con ajustes, el Omni de 21 GB; el Voxtral FP8 de 24B queda fuera o muy al límite. Una RTX 3090/4080 de 16 GB no admite los dos miembros grandes.
- Opciones de despliegue: el paquete se distribuye con código de inferencia propio en PyTorch (`inference/`), con `conformer_port.py` para el Conformer y código remoto para Cohere Transcribe. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Al requerir diez pasadas de inferencia más la votación, el coste por audio es varias veces el de un único modelo.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | WER dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ensemble (WAXAL) | Agregado no disponible (miembros de 0,6B a 30B-A3B) | No disponible | 0,075 | Mixta por miembro | Pesos públicos en HuggingFace |
| Whisper large-v3 (miembro del ensemble) | No indicado en la model card | No disponible | 0,090 | Apache-2.0 | Público en `openai/whisper-large-v3` |
| Voxtral-Small-24B (miembro del ensemble) | 24B | No disponible | No disponible | Apache-2.0 | Público en `RedHatAI/Voxtral-Small-24B-2507-FP8-dynamic` |
| Conformer-CTC large es-en code-switched (miembro del ensemble) | No indicado en la model card | No disponible | 0,212 | NGC Terms of Use | Requiere aceptar términos de NGC |
| Otros sistemas ASR code-switching es-en | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia mixta por miembro: cada peso hereda la licencia de su modelo base, de modo que no existe una única licencia para el conjunto y el uso comercial debe revisarse miembro a miembro (Apache-2.0, CC-BY-4.0, MIT y NGC Terms of Use).
- El miembro Conformer (NGC) y el miembro Cohere exigen aceptar los términos de sus modelos base antes de su uso; la licencia del conjunto no los sustituye.
- Los datos de entrenamiento (corpus Bangor Miami) se distribuyen bajo GPL-3.0-or-later; conviene evaluar las implicaciones de esa licencia sobre los pesos derivados antes de un despliegue comercial.
- El modelo está entrenado únicamente con habla bilingüe español-inglés del corpus Bangor Miami (folds A y B); el dominio, el acento y la variedad dialectal están acotados a esa muestra y no hay evidencia de generalización a otros registros.
- No se ha entrenado con el conjunto de desarrollo de la competición, pero tampoco se documentan evaluaciones fuera de ese dominio; el WER de 0,075 en dev no es extrapolable a audio real de producción.
- La model card declara diez miembros y diez pesos de voto, pero la tabla de contenidos lista ocho modelos base más dos carpetas de delta; conviene verificar el mapeo exacto entre pesos y miembros en `solution_code.zip` antes de reproducir resultados.
- Riesgo de alucinación propio de ASR: inserciones de texto y normalizaciones espurias, especialmente en tramos con ruido o cambios de idioma, que el voto ponderado mitiga pero no elimina.
- El sistema no está pensado para uso individual: un solo miembro del ensemble puede degradar el WER hasta 0,212 frente al 0,075 del voto conjunto.
- Requiere implementar el ROVER ponderado y el pipeline de diez pasadas; no hay integración documentada con servidores de inferencia estándar ni formatos GGUF para despliegue ligero.
- Sin señales de adopción: cero descargas y cero «likes» en el momento de la consulta, y ninguna validación independiente de los resultados declarados.
- No se especifican marcas de tiempo, diarización, puntuación ni detección de idioma por segmento, lo que limita su uso directo en pipelines de subtitulado que exijan esa información.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enesssssw/lost-in-transcription-spanish-english-ensemble
- Competición *Lost in Transcription: Spanish-English* (Mozilla Data Collective): https://competitions.mozilladatacollective.com/competitions/2/lost-in-transcription-sp-en/
- Enlace de licencia declarado en la model card: https://github.com/drivendataorg/competition-winners
- Qwen3-Omni-30B-A3B-Instruct (base del miembro Omni): https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit (checkpoint de partida del miembro Omni): https://huggingface.co/cyankiwi/Qwen3-Omni-30B-A3B-Instruct-AWQ-4bit
- Voxtral-Small-24B-2507-FP8-dynamic (base del miembro Voxtral): https://huggingface.co/RedHatAI/Voxtral-Small-24B-2507-FP8-dynamic
- Whisper large-v3 (base del miembro Whisper): https://huggingface.co/openai/whisper-large-v3
- Qwen3-ASR-1.7B (base del miembro Qwen3-ASR): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Cohere Transcribe 03-2026 (base del miembro Cohere): https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Parakeet Ultra (base del miembro Parakeet): https://huggingface.co/moondream/parakeet-ultra
- Parakeet TDT 0.6B v3, procesador usado por el miembro Parakeet: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Phi-4-multimodal-instruct (base del miembro Phi-4): https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Phi-4-multimodal-instruct con corrección de generación, usado como punto de partida: https://huggingface.co/ZFTurbo/Phi-4-multimodal-instruct
- Referencia del corpus Bangor Miami: Deuchar, M., Davies, P., Herring, J. R., Parafita Couto, M. C. y Carter, D. (2014), *Building bilingual corpora*, en Thomas y Mennen (eds.), *Advances in the Study of Bilingualism*, Multilingual Matters (sin URL en la model card).
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo (solo dominios ajenos al contenido), por lo que no se incluyen enlaces adicionales de prensa, papers o demos.
