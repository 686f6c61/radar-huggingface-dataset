# Reza2kn/AvaSanj-v1

## Resumen

AvaSanj-v1 es un modelo de reconocimiento automático del habla (ASR) para persa, desarrollado por Reza2kn a partir del modelo base `facebook/wav2vec2-xls-r-300m` de Meta. Se trata de un fine-tuning con CTC (Connectionist Temporal Classification) sobre 8.437 clips de audio en persa aprobados, que produce transcripciones fonéticas en el alfabeto compartido **repr1**, el mismo utilizado por los modelos de grafema a fonema (G2P) de la familia Negara. Su función principal es actuar como "listener" fuera de pliegue (OOF) en un pipeline de datos, arbitrando discrepancias entre G2P con un margen de confianza de al menos 0.1.

El modelo tiene aproximadamente 315 millones de parámetros y se distribuye en formato `safetensors`. Su relevancia radica en que ofrece una solución específica para el persa, un idioma con escasos recursos de ASR, y en su integración directa con sistemas de verificación de pronunciación y adjudicación de fonemas. Al estar basado en XLS-R, hereda la capacidad de representación multilingüe del modelo original, aunque el fine-tuning se ha realizado exclusivamente con datos persas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer encoder, base wav2vec2-xls-r-300m) |
| Parametros totales | 315.471.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ASR por ventanas de audio, no contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en fp32; se puede cuantizar posteriormente) |
| Idiomas soportados | fa (persa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 1.3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2 con cabecera CTC. El encoder es el de `wav2vec2-xls-r-300m`, un transformer preentrenado en 128 idiomas con alrededor de 300 millones de parámetros, que se fine-tune aquí para la tarea de reconocimiento fonético en persa. La salida se proyecta a un vocabulario de 30 tokens correspondientes al alfabeto repr1 (incluye `<blank>` y espacio). El entrenamiento se realizó sobre 8.437 clips de audio persa aprobados, cuyas etiquetas provienen del campo `audio_target_phonemes_vnext`. Se utilizó CTC loss y se seleccionó el mejor paso (step 800) según el CER de validación, que alcanzó 0.0479.

Una innovación destacable es su uso como componente en un pipeline de adjudicación de G2P: el modelo se emplea como "listener" fuera de pliegue, de modo que cada fold evalúa solo voces que no han visto durante el entrenamiento, logrando una precisión de ~96.3% y recall de ~95.9% en la puerta de corrupción. No se mencionan técnicas como RLHF o DPO; el entrenamiento es puramente supervisado con CTC.

## Capacidades

- Reconocimiento de voz persa con salida fonética en el alfabeto repr1 (30 tokens).
- Transcripción de audio a secuencia de fonemas, no a texto ortográfico.
- Integración directa con modelos G2P de la familia Negara para verificación y adjudicación de pronunciación.
- Funcionamiento como componente de arbitraje en pipelines de datos (OOF listener).
- Soporte para inferencia con la librería `transformers` de HuggingFace.
- No incluye capacidades de tool calling, agentes ni razonamiento multilingüe; es un modelo puramente ASR.

## Casos de uso

- **Verificación de pronunciación en aplicaciones de aprendizaje de persa**: el modelo puede comparar la pronunciación del usuario con la secuencia de fonemas esperada generada por un G2P, detectando errores con alta precisión.
- **Adjudicación de discrepancias G2P en pipelines de datos**: al ser un listener OOF, se puede usar para resolver conflictos entre diferentes modelos de grafema a fonema, mejorando la calidad de los datos de entrenamiento.
- **Subtitulado fonético automático**: para investigación lingüística o corpus de habla, el modelo transcribe audio persa a fonemas, útil para estudios de dialectología o fonética.
- **Asistente de voz para persa**: aunque la salida es fonética, puede integrarse con un decodificador para convertir fonemas a texto, habilitando comandos de voz en aplicaciones.
- **Control de calidad en sistemas de TTS**: se puede usar para verificar que la síntesis de voz produce los fonemas correctos, comparando la salida del TTS con la secuencia esperada.
- **Análisis de corpus de habla persa**: para etiquetado automático de grandes colecciones de audio, generando anotaciones fonéticas que luego pueden ser revisadas por humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El único dato de rendimiento reportado es el CER (Character Error Rate) de validación en el paso 800, que es de **0.0479**. También se menciona una precisión de ~96.3% y recall de ~95.9% en la "puerta de corrupción" del pipeline OOF, pero estos valores corresponden a la tarea de adjudicación, no a métricas ASR convencionales. No hay comparativas con otros modelos ASR persas en la documentación proporcionada.

## Requisitos de hardware

- **VRAM estimada**: con 315M parámetros en fp32 (~1.26 GB solo pesos), la inferencia requiere aproximadamente 2-3 GB de VRAM incluyendo overhead. Con cuantización a 8 bits, se reduce a ~1 GB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) puede ejecutar el modelo sin problemas. Para procesamiento por lotes grande, se recomienda una RTX 3060 o superior.
- **Compatibilidad**: cabe en GPUs consumer de gama media; no requiere GPUs de datacenter.
- **Opciones de despliegue**: compatible con `transformers` de HuggingFace, `vLLM` (aunque es ASR, no LLM), `TGI` (no recomendado para wav2vec2), `llama.cpp` (no aplicable directamente), y `Ollama` (no soportado). Para producción, se puede usar `transformers` con `torch` o `ONNX Runtime`.
- **Latencia y throughput**: no se han publicado datos específicos. Para un modelo de 300M, la inferencia en CPU es lenta (varios segundos por clip), pero en GPU es casi en tiempo real para clips cortos (<10 s).

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR persas comparables (como `m3hrdadfar/wav2vec2-xls-r-300m-fa` o `jonatasgrosman/wav2vec2-large-xlsr-53-persian`) en la documentación proporcionada. Sin embargo, se puede señalar que AvaSanj-v1 se diferencia por su salida fonética en repr1 y su rol específico en adjudicación G2P, mientras que otros modelos suelen producir texto ortográfico. No se pueden aportar datos cuantitativos de comparación sin fuentes adicionales.

## Limitaciones y advertencias

- **Sesgos y cobertura**: entrenado únicamente con 8.437 clips de persa, lo que puede limitar su generalización a dialectos regionales, acentos o registros formales/informales no representados.
- **Riesgo de alucinación**: como modelo CTC, puede generar secuencias de fonemas que no corresponden al audio si hay ruido o solapamiento de hablantes; la precisión en condiciones adversas no está documentada.
- **Limitación de idioma**: solo soporta persa; no funciona con otros idiomas a pesar de la base multilingüe de XLS-R.
- **Salida fonética**: no produce texto legible directamente; requiere un post-procesador para convertir fonemas repr1 a grafías persas, lo que añade complejidad al despliegue.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero el modelo base XLS-R también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- **Caveat de producción**: el modelo está diseñado como componente de un pipeline específico; su uso fuera de ese contexto (p.ej., transcripción general) puede no ser óptimo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Reza2kn/AvaSanj-v1)
- [Modelo base: facebook/wav2vec2-xls-r-300m](https://huggingface.co/facebook/wav2vec2-xls-r-300m)
