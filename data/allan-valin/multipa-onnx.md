# allan-valin/multipa-onnx

## Resumen

MultIPA — ONNX int8 es una copia convertida y cuantizada de MultIPA, un modelo acústico de transcripción fonética automática al Alfabeto Fonético Internacional (AFI/IPA) desarrollado por Chihiro Taguchi, Yusuke Sakai, Parisa Haghani y David Chiang y presentado en Interspeech 2023. No es un modelo de lenguaje: recibe una forma de onda mono a 16 kHz y devuelve logits CTC por frame sobre un vocabulario de símbolos IPA, sin generar texto ortográfico ni mantener conversaciones.

La versión de allan-valin exporta el modelo original a ONNX, incorpora la normalización del extractor de características dentro del grafo y cuantiza los pesos a int8 con ONNX Runtime. El repositorio ocupa 0,3 GB y está pensado para inferencia en CPU o entornos con recursos limitados, así como para integrarse en la herramienta speech-to-ipa.

Su relevancia práctica está en la transcripción fonética multilingüe: la evaluación publicada cubre 760 enunciados de 95 idiomas de VoxAngeles, con un PER de 61,3 y un PFER de 15,1 en esta copia int8. Es un modelo especializado, no un sustituto de un ASR convencional, y requiere revisión humana en usos científicos o de producción sensibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-Large XLSR con extractor convolucional, codificador Transformer y cabeza CTC a nivel de frame; exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en texto; entrada de audio mono a 16 kHz de longitud variable y salida frame-level |
| Tipos de cuantización | int8 dinámica con ONNX Runtime |
| Idiomas soportados | no disponible; evaluado en 95 idiomas de VoxAngeles, sin enumeración oficial de cobertura |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) y `vocab.json` |
| Entrada | `wav` float32 `[1, samples]`, audio mono a 16 kHz |
| Salida | `logits` float32 `[1, frames, vocab]`; vocabulario de 311 entradas con blank CTC en el índice 310 |
| Tamaño del repositorio | 0,3 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es Wav2Vec2-Large XLSR, con extractor convolucional, codificador Transformer y cabeza de clasificación CTC que produce una distribución sobre el vocabulario IPA en cada frame. El vocabulario tiene 311 entradas: los símbolos IPA y símbolos especiales ocupan los índices 0-309, el blank CTC está en el índice 310, `[PAD]` actúa como blank y `|` como separador de palabra. La decodificación es CTC greedy: argmax por frame, fusión de repeticiones y eliminación del blank.

Esta copia no reentrena el modelo: exporta el checkpoint original a ONNX, mueve la normalización de media cero y varianza unitaria del feature extractor al grafo y aplica cuantización dinámica int8 con ONNX Runtime. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni otras innovaciones de entrenamiento; al ser un modelo acústico supervisado con CTC, RLHF no resulta aplicable.

## Capacidades

- Transcripción fonética automática al IPA a partir de una forma de onda mono a 16 kHz.
- Cobertura multilingüe evaluada en 95 idiomas, con 8 enunciados por idioma en VoxAngeles.
- Salida frame-level con logits CTC, adecuada para decodificación greedy o para posprocesado externo.
- Inferencia en CPU y entornos con recursos limitados gracias a la cuantización int8 y al formato ONNX.
- Integración en pipelines de procesamiento de voz mediante ONNX Runtime en Python, C++ o JavaScript.
- Vocabulario IPA explícito en `vocab.json`, con blank CTC y separador de palabra.
- No soporta generación de texto libre, razonamiento, tool calling, agentes, visión ni generación de audio.
- No incluye detección de idioma, diarización de hablantes ni puntuación ortográfica.

## Casos de uso

- Documentación lingüística y trabajo de campo: transcribir grabaciones de lenguas poco documentadas a una representación IPA común, con revisión posterior por parte del lingüista. La salida frame-level facilita localizar segmentos dudosos.
- Anotación de corpus fonéticos: preetiquetar grandes volúmenes de audio para reducir el tiempo de anotación manual; el modelo genera símbolos IPA y el anotador corrige las secuencias con mayor PER.
- Evaluación de pronunciación en aprendizaje de idiomas: comparar la secuencia IPA esperada de una palabra o frase con la transcripción obtenida del audio del estudiante, usando el PER como señal de distancia.
- Investigación fonética comparada: analizar realizaciones fonéticas en varios idiomas bajo un mismo espacio de símbolos IPA, aprovechando la evaluación multilingüe publicada sobre 95 idiomas.
- Preprocesamiento para TTS y ASR: obtener transcripciones fonéticas que sirvan como etiquetas intermedias, léxicos de pronunciación o datos de alineamiento acústico.
- Despliegue en Edge o en CPU: ejecutar la transcripción en portátiles, servidores sin GPU o aplicaciones web mediante ONNX Runtime, con un repositorio de 0,3 GB y pesos int8.
- Control de calidad de datasets de voz: detectar discrepancias entre el audio y la transcripción esperada en corpus multilingües, usando la salida IPA como representación intermedia.
- Herramientas de dicción y accesibilidad: generar transcripciones fonéticas de material audiovisual para diccionarios de pronunciación o sistemas de apoyo a la lectura.

## Benchmarks y rendimiento

| Benchmark | Métrica | Este modelo (int8) | MultIPA original | Diferencia |
|---|---|---:|---:|---:|
| VoxAngeles: 760 enunciados, 95 idiomas, 8 por idioma | PER (narrow) | 61,3 | 61,1 | +0,2 |
| VoxAngeles: 760 enunciados, 95 idiomas, 8 por idioma | PFER | 15,1 | 14,6 | +0,5 |

PER = phoneme error rate; PFER = phoneme feature error rate. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos int8; el repositorio completo ocupa 0,3 GB. La memoria real depende de la longitud del audio y de los buffers de activación.
- GPU recomendadas: no se especifican. Cualquier GPU compatible con ONNX Runtime, como RTX 4090, A100 o H100, puede ejecutar el modelo, pero no es necesario para su funcionamiento.
- GPU de consumo: sí, cabe en cualquier GPU de consumo con soporte ONNX Runtime; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime en Python, C++ o JavaScript (`onnxruntime-web`). No procede vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponible. Dependen de la longitud del audio, de la CPU o GPU utilizada y del backend de ejecución; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| allan-valin/multipa-onnx (este modelo) | no disponible | audio de longitud variable | PER 61,3; PFER 15,1 | MIT | ONNX int8 | HuggingFace |
| ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns (MultIPA original) | no disponible | audio de longitud variable | PER 61,1; PFER 14,6 | MIT, según el repositorio del autor | no disponible | HuggingFace |
| Otros modelos de transcripción fonética | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación directa solo puede establecerse con el MultIPA original, del que esta versión es una conversión cuantizada.

## Limitaciones y advertencias

- El PER de 61,3 en VoxAngeles es elevado: el modelo no debe usarse sin revisión humana en documentación lingüística, evaluación de pronunciación o producción sensible.
- El PFER de 15,1 indica que, incluso cuando la secuencia exacta falla, parte de los rasgos fonéticos se conserva; no obstante, la tasa de error sigue siendo alta.
- La evaluación se limita a 760 enunciados, 8 por cada uno de 95 idiomas, por lo que la cobertura real por idioma y dominio no está caracterizada.
- No se enumeran oficialmente los idiomas soportados; el rendimiento puede variar considerablemente fuera de los idiomas representados en el corpus de entrenamiento.
- La entrada debe ser audio mono a 16 kHz; no se documenta el comportamiento con ruido, reverberación, solapamiento de hablantes ni otras condiciones adversas.
- La decodificación CTC greedy no incorpora un modelo de lenguaje; puede producir secuencias IPA fonotácticamente improbables.
- No genera texto ortográfico, puntuación, mayúsculas ni etiquetas de hablante; no sustituye a un sistema ASR completo.
- La cuantización int8 introduce una degradación pequeña pero medible: +0,2 de PER y +0,5 de PFER frente al modelo original.
- No se documentan sesgos acústicos, demográficos o de dominio del corpus de entrenamiento.
- La licencia MIT permite uso comercial, modificación y redistribución, pero debe conservarse la atribución correspondiente; conviene verificar los términos del modelo base y del repositorio original.
- El riesgo de alucinación en el sentido de los modelos de lenguaje no aplica, pero el modelo puede emitir secuencias IPA incorrectas con alta confianza.
- La información disponible no detalla el proceso de entrenamiento ni los datos utilizados, lo que limita la reproducibilidad y la auditoría del modelo.

## Enlaces

- [HuggingFace: allan-valin/multipa-onnx](https://huggingface.co/allan-valin/multipa-onnx)
- [Modelo base: ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns](https://huggingface.co/ctaguchi/wav2vec2-large-xlsr-japlmthufielta-ipa1000-ns)
- [Paper: Universal Automatic Phonetic Transcription into the International Phonetic Alphabet](https://www.isca-archive.org/interspeech_2023/taguchi23_interspeech.html)
- [Repositorio original: ctaguchi/multipa](https://github.com/ctaguchi/multipa)
- [Script de exportación a ONNX](https://github.com/allan-valin/speech-to-ipa/blob/main/eval/export_multipa_onnx.py)
- [Proyecto speech-to-ipa](https://github.com/allan-valin/speech-to-ipa)
