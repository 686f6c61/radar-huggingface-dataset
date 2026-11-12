# IZITECH/hasib-nafsak-quran-asr

## Resumen

Hasib Nafsak Quran ASR es una conversión al formato GGML del modelo Tarteel AI `whisper-base-ar-quran`, realizada por IZITech para su uso dentro de la aplicación móvil Hasib Nafsak. El modelo original es un fine-tuning de Whisper Base sobre recitación coránica en árabe, y esta versión lo empaqueta en formato whisper.cpp con cuantización de 8 bits (`q8_0`) para permitir inferencia completamente offline en teléfonos. El repositorio pesa aproximadamente 0,1 GB e incluye el script de conversión `whisper-to-ggml.py` y el binario `ggml-quran-base-q8_0.bin`.

La función concreta del modelo es verificar, palabra por palabra, un versículo del Corán recitado en voz alta: la aplicación compara la transcripción del audio con el texto esperado y señala las palabras discrepantes. No se trata de un ASR generalista en árabe, sino de un modelo especializado en recitación coránica, con vocabulario y fonética acotados al texto del Corán.

Su relevancia radica en el despliegue: al estar en GGML cuantizado a 8 bits, puede ejecutarse en dispositivos móviles sin conexión, algo que las versiones en safetensors del modelo base no permiten de forma directa. La licencia Apache 2.0 del modelo original se mantiene en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | no disponible (modelo base Whisper Base, ~74 M según la arquitectura Whisper Base estándar; el autor no lo especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; el autor no indica duración máxima) |
| Tipos de cuantizacion | q8_0 (8 bits), formato GGML para whisper.cpp |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`ggml-quran-base-q8_0.bin`); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder para reconocimiento automático de voz. El modelo base `tarteel-ai/whisper-base-ar-quran` es un fine-tuning de Whisper Base sobre recitación coránica en árabe, desarrollado por Tarteel AI. Esta versión de IZITech no reentrena el modelo: parte de los pesos safetensors de la revisión `56664d07ed1e91f6da3b94cfe3b700767f0794fa` (refs/pr/3) del modelo base, cuya revisión original es `5c3c53fdf9272c4f6ee0bee09a1e5a4a615ee25c`, y los convierte con `whisper-to-ggml.py` en modo `q8_0`.

La innovación técnica de esta ficha es puramente de despliegue: la conversión a GGML con cuantización de 8 bits reduce el tamaño y permite ejecutar el modelo en whisper.cpp de forma offline en dispositivos móviles. No se documentan detalles del dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO; esa información corresponde a la model card de Tarteel AI y no se incluye en la información disponible.

## Capacidades

- Reconocimiento automático de voz en árabe especializado en recitación del Corán.
- Verificación palabra por palabra de un versículo recitado frente al texto esperado.
- Detección de palabras discrepantes en la recitación (el modelo mide palabras marcadas frente a versículos correctos).
- Funcionamiento completamente offline en teléfonos mediante whisper.cpp y GGML.
- Comparación de letras de las palabras reconocidas; según el autor, no se producen falsos avisos en vocales cortas (fatha, damma, kasra, tanwin) de las palabras coincidentes en las recitaciones medidas.
- No evalúa pronunciación, duración de madd ni otras reglas de tajweed.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del árabe.

## Casos de uso

- Verificación de recitación en aplicación móvil: la app Hasib Nafsak usa el modelo para comprobar, palabra por palabra, un versículo recitado en voz alta; el formato GGML q8_0 permite ejecutarlo en el teléfono sin conexión.
- Aprendizaje y memorización del Corán: un estudiante recita un versículo y el modelo señala las palabras que no coinciden con el texto esperado, lo que permite corregir la memorización sin conexión a internet.
- Revisión de recitaciones grabadas: procesar audio de recitadores conocidos (Alafasy, Husary, Al-Minshawi) contra el texto coránico para localizar discrepancias; el autor reporta 164/164 versículos sin palabras marcadas en Alafasy, 163/164 en Husary y 157/164 en Al-Minshawi con niños.
- Aplicaciones de estudio sin conectividad: entornos con red limitada o sin cobertura donde se requiere ASR coránico en el dispositivo, aprovechando el tamaño reducido del binario GGML.
- Integración en pipelines de evaluación de recitación: usar la salida del modelo como señal de alineación palabra a palabra para herramientas de corrección automática, teniendo en cuenta que no evalúa tajweed.
- Prototipado con whisper.cpp: servir como ejemplo funcional de conversión de un modelo Whisper especializado a GGML q8_0, reutilizable para otras variantes de Whisper en aplicaciones móviles.

## Benchmarks y rendimiento

El autor publica una medición propia sobre 164 versículos (Al-Fatiha y suras 93–114) recitados correctamente, comparando palabras por sus letras. El modelo de 8 bits se midió sobre Husary; los pesos originales, sobre las tres voces.

| Voz | Versiculos sin ninguna palabra marcada | Palabras marcadas |
|---|---|---|
| Alafasy | 164 / 164 | 0 % |
| Husary | 163 / 164 | 0,7 % |
| Al-Minshawi con niños | 157 / 164 | 5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER en conjuntos públicos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el binario GGML q8_0 y el tamaño del repositorio (0,1 GB) indican un modelo muy ligero, apto para ejecución en CPU de dispositivos móviles.
- GPU recomendadas: no aplica para el caso de uso previsto (inferencia en teléfono); para escritorio, cualquier GPU con soporte de whisper.cpp puede ejecutarlo, pero el autor no publica requisitos.
- Cabe en GPU de consumo: sí, por el tamaño del binario, aunque no se documentan cifras de VRAM ni latencia.
- Opciones de despliegue: whisper.cpp (formato GGML nativo); no se documenta soporte de vLLM, TGI, Ollama ni llama.cpp para este binario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| IZITECH/hasib-nafsak-quran-asr | no disponible (base Whisper Base) | no disponible | árabe | Apache 2.0 | GGML q8_0 | Hugging Face, 0 descargas |
| tarteel-ai/whisper-base-ar-quran | no disponible (Whisper Base) | no disponible | árabe | Apache 2.0 (según modelo base) | safetensors | Hugging Face (modelo base) |
| Whisper Base original (OpenAI) | ~74 M (arquitectura estándar) | ventana de audio de 30 s (arquitectura Whisper) | multilingüe | MIT (según OpenAI) | safetensors, GGML, etc. | Amplia disponibilidad |

La comparativa se limita a estos tres porque no se dispone de datos de otros modelos ASR coránicos en la información proporcionada. No se dispone de cifras de rendimiento comparables entre ellos más allá de las métricas propias del autor.

## Limitaciones y advertencias

- Especializado exclusivamente en recitación coránica en árabe; no es un ASR generalista y su comportamiento fuera de ese dominio no está documentado.
- No evalúa pronunciación, duración de madd ni otras reglas de tajweed; solo compara palabras por sus letras.
- El autor reporta un 5 % de palabras marcadas en la voz Al-Minshawi con niños, lo que indica sensibilidad a la voz y al estilo de recitación.
- Las métricas publicadas son propias del autor, sobre 164 versículos y tres voces; no hay validación externa ni WER en conjuntos públicos.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos Whisper, no cuantificado en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; el autor atribuye la obra original a Tarteel AI y la conversión a IZITech.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción fuera de la app del autor.
- No se documentan sesgos específicos ni limitaciones de contexto más allá de las propias de la arquitectura Whisper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IZITECH/hasib-nafsak-quran-asr
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
