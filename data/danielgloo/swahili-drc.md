# danielgloo/swahili-drc

## Resumen

`danielgloo/swahili-drc` es un modelo de síntesis de voz (text-to-speech) especializado en la narración de las Escrituras en suajili, con especial atención al suajili del Congo (`swc`, también conocido como Kingwana). Se trata de un ajuste fino (finetune) del modelo `Sunbird/orpheus-3b-tts-multilingual`, que a su vez es un modelo de lenguaje causal Llama-3.2-3B entrenado para emitir códigos de audio SNAC a 24 kHz. El modelo resultante conserva la arquitectura del transformer causal original y añade la capacidad de generar audio inteligible a partir de texto suajili.

El modelo se entrenó sobre 96 horas de narración bíblica de estudio en suajili estándar/costero (`swh`), con siete narradores distintos. El checkpoint `swa06` incorpora un LoRA de rango 64 fusionado en los pesos base, entrenado durante 3 épocas sobre 30.634 filas de versículos. La innovación principal del proyecto es el uso de frames SNAC sin deduplicar, lo que produjo el modelo más inteligible de las siete ejecuciones del proyecto.

La relevancia de este modelo radica en su enfoque práctico: proporciona una voz de narración consistente y medible (CER de 0,0665 frente al suelo humano de 0,047) para la lectura de texto bíblico en suajili, con una tasa de fallo en primera pasada del 1,8 % en una producción real de 1.511 versículos del Génesis. Es un ejemplo de ajuste fino de bajo rango sobre un modelo TTS multilingüe existente, con métricas de evaluación transparentes y un pipeline de inferencia reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Llama-3.2-3B) con emisión de códigos de audio SNAC 24 kHz |
| Parametros totales | 3.300.864.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base es Llama-3.2-3B; se procesa un versículo por prompt, con degradación a partir de ~100 tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el adaptador PEFT ocupa 390 MB) |
| Idiomas soportados | suajili (`sw`), suajili del Congo (`swc`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (transformers); adaptador PEFT incluido en `adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer causal basado en Llama-3.2-3B que genera secuencias de tokens de audio en lugar de texto. Utiliza el codec SNAC a 24 kHz: cada frame de 85,3 ms se codifica en 7 tokens de audio, con un esquema de intercalado inverso específico (`l0 = [f0]`, `l1 = [f1, f4]`, `l2 = [f2, f3, f5, f6]`). El prompt debe seguir un formato exacto con tokens especiales: `[128259] + tokenizer("<speaker>: <text>") + [128009, 128260]`, y el modelo emite `128261` (inicio de audio), `128257` (inicio de habla), los frames de audio y `128258` (fin de habla).

El entrenamiento consistió en un LoRA de rango 64 y alpha 64 aplicado a las proyecciones q/k/v/o/gate/up/down, sobre 30.634 filas de versículos (96,4 horas, 7 narradores, duración máxima de 29,98 s). Se entrenaron 3 épocas con batch size 16, learning rate 2e-4 con decaimiento coseno hasta un suelo de 0,1 y warm-up del 2 %. Los libros de Génesis y 2 Samuel (2.201 filas) se reservaron como conjunto de validación. El mejor checkpoint se seleccionó por entropía cruzada de tokens de audio en validación (3,497 en la época 2,95). El LoRA se fusionó en los pesos base en fp32 y se guardó en bf16, con una verificación de la fusión a 1e-4 en la pérdida de validación. La decisión técnica más relevante fue entrenar con frames SNAC sin deduplicar, lo que mejoró la inteligibilidad frente a la receta con deduplicación (CER 0,0665 frente a 0,082).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en suajili, con salida de audio a 24 kHz mediante SNAC.
- Narración de las Escrituras con una voz consistente identificada por la etiqueta de hablante `openbible_swa_0001`.
- Soporte de múltiples hablantes del corpus: `openbible_swa_0000` a `openbible_swa_0006` (siete narradores en total).
- Generación por versículo individual, con un formato de prompt exacto que incluye la etiqueta de hablante y el texto.
- Decodificación controlada mediante un procesador de logits que restringe la salida a la gramática de tokens SNAC.
- Generación por lotes con padding a la izquierda y decodificación SNAC con semilla.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento explícito; es un modelo especializado en TTS.

## Casos de uso

- **Narración bíblica automatizada en suajili del Congo**: el modelo puede leer el Antiguo Testamento en ortografía `swc` (por ejemplo, *asubui, inchi, pahali, magaribi, muzuri, ikakuwa, Yawe*) con una inteligibilidad equivalente a la del texto `swh`, lo que permite generar audiolibros de las Escrituras para comunidades de habla Kingwana. Es adecuado porque se entrenó específicamente sobre narración bíblica de estudio y mantiene una tasa de fallo del 1,8 % en primera pasada con puertas de validación.
- **Producción de audio para aplicaciones religiosas**: integración en pipelines que generan capítulos completos versículo a versículo, con comprobación ASR contra el texto y regeneración con nueva semilla si el CER supera 0,30. El modelo procesa un versículo por prompt y mantiene una voz consistente a lo largo de miles de versículos.
- **Generación de audiolibros y contenido devocional**: narración de pasajes bíblicos para podcasts, aplicaciones de lectura o dispositivos de audio de bajo coste, usando la etiqueta de hablante `openbible_swa_0001` para mantener la misma voz en toda la producción.
- **Investigación en TTS de bajos recursos**: el modelo sirve como caso de estudio reproducible de ajuste fino LoRA sobre un TTS multilingüe (Orpheus-3B) para un idioma con pocos recursos, con métricas de CER, similitud de voz (WavLM x-vector coseno de 0,96) y tasas de fallo documentadas.
- **Evaluación de inteligibilidad y acento**: útil para paneles de oyentes nativos que evalúen la aceptabilidad del acento costero en la lectura de ortografía `swc`, ya que el modelo rinde `swc` con acento `swh` y la cuestión de la aceptación por parte de hablantes de Kingwana queda abierta.
- **Generación de material de alfabetización**: creación de audios de lectura para programas de alfabetización en suajili del Congo, con conversión previa de dígitos a cardinales en suajili (el modelo espera palabras numéricas, no dígitos).
- **Pruebas de integración en pipelines TTS**: el repositorio incluye `infer.py` con el formato de prompt exacto, el procesador de logits y la decodificación SNAC con semilla, lo que facilita la replicación y la integración en sistemas existentes.

## Benchmarks y rendimiento

Resultados medidos sobre 178 versículos reservados (libros no vistos en entrenamiento) × 3 semillas, con Whisper-large-v3-turbo como instrumento de medida (CER de caracteres contra el texto):

| Modelo | CER | Notas |
|---|---|---|
| Narrador humano (grabación de estudio) | 0,047 | Suelo del instrumento de medida |
| **Este modelo (swa06)** | **0,0665** | 100 % de fin de habla limpio, 0 fallos de gramática de tokens |
| Modelo base en su propia voz (`waxal_swa_0006`) | 0,076 | |
| Candidato previo (misma receta con deduplicación de frames) | 0,082 | |

Otras métricas reportadas:
- Similitud de voz con el narrador (WavLM x-vector coseno): 0,96 (los clips humanos alcanzan 0,98).
- Tasa de fallo en primera pasada en una producción real de 1.511 versículos del Génesis: 1,8 %, con todos los versículos superados en un máximo de tres intentos.
- Rendimiento: ~725 tokens/s con batch 16 en una GPU (aproximadamente 9 horas de audio por hora de GPU).
- Decodificación recomendada: temperatura 0,4, top_p 0,95, repetition_penalty 1,1. Con temperatura 0,4 el CER es 0,053 frente a 0,068 con temperatura 0,6, y cinco veces menos omisiones silenciosas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 3.300 millones de parámetros. En bf16 requiere aproximadamente 6,6 GB solo para los pesos, más overhead de activaciones y del decodificador SNAC; se estima un mínimo práctico de 8-10 GB de VRAM. En cuantización de 8 bits podría reducirse a ~4-5 GB, aunque no se documentan cuantizaciones oficiales.
- **GPU recomendadas**: A100, H100 o L40S para producción a gran escala; RTX 4090 (24 GB) para desarrollo y producción de volumen medio. El modelo cabe en GPUs de consumo con 12 GB o más en bf16, y potencialmente en 8 GB con cuantización.
- **Cabe en GPU de consumo**: sí, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 12 GB o más. En tarjetas de 8 GB requeriría cuantización no documentada.
- **Opciones de despliegue**: transformers (>= 4.45), text-generation-inference (el modelo es compatible con endpoints), y el script `infer.py` incluido en el repositorio. No se documenta soporte para llama.cpp, Ollama o vLLM, aunque al ser un modelo Llama-3.2-3B podría ser adaptable.
- **Latencia y throughput**: ~725 tokens/s con batch 16 en una GPU, lo que equivale a aproximadamente 9 horas de audio generado por hora de GPU. La latencia por versículo individual no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (suajili) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **danielgloo/swahili-drc (swa06)** | 3.300 M | no disponible (1 versículo por prompt) | 0,0665 | CC BY-SA 4.0 | HuggingFace |
| Sunbird/orpheus-3b-tts-multilingual (base) | 3.300 M | no disponible | 0,076 (voz propia) | Apache-2.0 (componente) | HuggingFace |
| Candidato previo del mismo proyecto (con dedupe) | 3.300 M | no disponible | 0,082 | CC BY-SA 4.0 | No publicado como checkpoint independiente |

No se dispone de datos de benchmarks de otros modelos TTS en suajili en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo proyecto y al modelo base.

## Limitaciones y advertencias

- **El audio de entrenamiento es suajili costero/estándar (`swh`), no suajili del Congo (`swc`)**: no existe audio `swc` en el conjunto de entrenamiento. El modelo pronuncia las grafías `swc` tal como se escriben, pero con acento costero. La aceptabilidad para oyentes de Kingwana es una cuestión abierta que debe decidir un panel de oyentes nativos, no una métrica.
- **Numerales**: el corpus escribe dígitos y el narrador leía palabras numéricas; es necesario convertir los dígitos a cardinales en suajili antes de pasarlos al prompt (el proyecto incluye `render/norm.py` para 0-999).
- **Omisión de cláusulas**: en aproximadamente el 1-2 % de los versículos el modelo puede omitir una cláusula con un final limpio. Se recomienda validar las renders con una comprobación ASR contra el texto y regenerar con una nueva semilla; la duración por sí sola no detecta este fallo.
- **Registro limitado**: el narrador nunca leyó poesía ni profecía; los Salmos y los profetas quedan fuera del registro de entrenamiento de esta voz (en el corpus fueron leídos por otros narradores).
- **Longitud del prompt**: los versículos de más de ~100 tokens de texto (p95 del corpus) se acortan silenciosamente: 0 % de truncamiento a ≤100 tokens, 10 % a 120 y 67 % a 180. Es necesario dividir los versículos largos en la puntuación de cláusula. El modelo base tiene el mismo punto de degradación.
- **Repetition penalty**: debe mantenerse ≥ 1,1; con 1,0 el modelo entra en bucle hasta el límite de tokens en un tercio de los versículos.
- **Licencia share-alike**: los pesos se distribuyen bajo CC BY-SA 4.0, lo que obliga a mantener la misma licencia en obras derivadas y a conservar el aviso de atribución (`ATTRIBUTION.md`). El audio de entrenamiento es de open.bible (Biblica) bajo CC BY-SA 4.0, y los componentes Orpheus-3B/Sunbird son Apache-2.0 y SNAC es MIT.
- **Riesgo de alucinación**: no se documenta explícitamente, pero la omisión de cláusulas y la posible generación de audio no alineado con el texto en casos raros requieren validación automática en producción.
- **Sesgos**: no se documentan sesgos específicos más allá del acento costero y la limitación de registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielgloo/swahili-drc
- Modelo base: https://huggingface.co/Sunbird/orpheus-3b-tts-multilingual
- Codec SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Dataset de audio de entrenamiento: https://huggingface.co/datasets/multilingual-tts/open-bible
- open.bible (Biblica): https://open.bible
