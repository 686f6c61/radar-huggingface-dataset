# bhullar17noor/whisper-hindi2hinglish-apex-ggml

## Resumen

Whisper-Hindi2Hinglish-Apex-ggml es una conversión al formato GGML del modelo de reconocimiento automático de voz Oriserve/Whisper-Hindi2Hinglish-Apex, realizada por el usuario bhullar17noor para su uso con whisper.cpp. El modelo original es un fine-tuning de OpenAI Whisper desarrollado por Oriserve, especializado en transcribir habla que mezcla hindi e inglés (hinglish) a caracteres latinos, sin traducir. Esta versión GGML cuantizada a q5_0 permite ejecutar el modelo en CPU y hardware de consumo sin necesidad de GPU dedicada.

La relevancia de esta ficha radica en que el modelo original está pensado para un caso de uso muy concreto: la transcripción de conversaciones bilingües hindi-inglés en las que el hablante alterna entre ambos idiomas, un fenómeno habitual en la India urbana. El autor de la conversión indica que la aplicación de dictado para macOS OpenFlow lo utiliza para reuniones en inglés e hindi. El repositorio tiene un tamaño de 0,6 GB y no registra descargas ni likes en el momento de la consulta.

Se trata de una conversión de formato y cuantización, no de un reentrenamiento: los pesos originales de Oriserve se convierten de bfloat16 a float y se cuantizan a q5_0 con las herramientas de whisper.cpp. La licencia es Apache 2.0, heredada del modelo original, que a su vez se construyó sobre OpenAI Whisper.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), conversión GGML para whisper.cpp |
| Parámetros totales | no disponible (el modelo base es un fine-tuning de Whisper; el tamaño exacto de la variante no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantización | q5_0 (único fichero publicado: `whisper-hindi2hinglish-apex-q5_0.bin`, 574 MB) |
| Idiomas soportados | hindi (hi) e inglés (en), con salida en caracteres latinos (hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`.bin`), convertido desde los pesos originales en formato Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper, un transformer encoder-decoder diseñado para reconocimiento automático de voz, con entrada de audio en ventanas de 30 segundos y salida de tokens de texto. El modelo base Oriserve/Whisper-Hindi2Hinglish-Apex es un fine-tuning de Whisper realizado por Oriserve, cuyo objetivo es transcribir habla hinglish a caracteres romanos: las palabras inglesas se mantienen tal cual y el hindi se escribe tal como suena, sin traducir al inglés. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no se recogen en la información disponible; el autor de la conversión remite a la model card original de Oriserve para esos datos.

Esta versión concreta no introduce ningún cambio arquitectónico ni de entrenamiento: se limita a convertir los pesos de la revisión `f3214eed20b4e4d4144e739982d911f87b9cb223` del modelo original mediante el script `models/convert-h5-to-ggml.py` de whisper.cpp (con conversión de bfloat16 a float, ya que el script no acepta bfloat16) y a cuantizarlos con `whisper-quantize` en modo q5_0. La innovación técnica es, por tanto, la propia cuantización que permite ejecutar el modelo en whisper.cpp con un consumo de memoria de aproximadamente 770 MB al cargarlo con `whisper-server` en un Apple M1 Pro.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio que mezcla hindi e inglés.
- Transcripción a caracteres latinos (romanización): el hindi se escribe fonéticamente y el inglés se mantiene sin cambios.
- No traduce: la salida refleja el idioma hablado, no una versión en otro idioma.
- Ejecución en CPU mediante whisper.cpp, sin requerir GPU.
- Integración con `whisper-server` para servir transcripciones vía API local.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio más allá del propio ASR.
- No se documenta un modo de razonamiento o "thinking mode".

## Casos de uso

- Dictado en macOS para reuniones bilingües: la aplicación OpenFlow utiliza este fichero para transcribir reuniones en inglés e hindi, aprovechando la salida en caracteres latinos para su posterior procesamiento o búsqueda.
- Transcripción de reuniones de Teams: el autor probó el modelo con una grabación de 30 minutos de Teams reproducida directamente desde el fichero, lo que indica su idoneidad para actas de reuniones con habla mixta hindi-inglés.
- Subtitulado de contenido audiovisual hinglish: el modelo puede generar transcripciones en romanización para vídeos o pódcasts donde los hablantes alternan hindi e inglés, sin necesidad de traducir.
- Procesamiento por lotes en servidores sin GPU: al estar en formato GGML y cuantizado a q5_0, puede desplegarse con whisper.cpp en máquinas de CPU para transcribir archivos de audio de forma económica.
- Integración en aplicaciones de notas de voz: desarrolladores que necesiten convertir grabaciones de voz en texto romanizado dentro de una app de escritorio o móvil pueden embeber whisper.cpp con este fichero.
- Investigación en ASR multilingüe: sirve como referencia práctica de un modelo fine-tuneado para code-switching hindi-inglés en formato ligero, útil para experimentos de transcripción en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión indica que el modelo se probó en una grabación de 30 minutos de Teams y con voces sintéticas, pero señala explícitamente que eso no constituye una medida de su precisión general, y remite a la model card original de Oriserve para los resultados propios de ese modelo.

## Requisitos de hardware

- VRAM estimada: no aplica para la versión GGML, que está pensada para ejecución en CPU; el autor reporta aproximadamente 770 MB de memoria al cargar el modelo con `whisper-server` en un Apple M1 Pro.
- GPU recomendadas: no se especifican; al ser una conversión GGML para whisper.cpp, el objetivo es la inferencia en CPU.
- Cabe en GPU de consumo: no disponible como dato explícito; el formato GGML está orientado a CPU, aunque whisper.cpp puede compilarse con soporte de GPU en algunos entornos.
- Opciones de despliegue: whisper.cpp, `whisper-server` (mencionado por el autor), y cualquier herramienta compatible con ficheros GGML de whisper.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bhullar17noor/whisper-hindi2hinglish-apex-ggml | no disponible | ventanas de 30 s (Whisper) | hi, en (salida romanizada) | Apache 2.0 | GGML q5_0 |
| Oriserve/Whisper-Hindi2Hinglish-Apex (modelo base) | no disponible | ventanas de 30 s (Whisper) | hi, en (salida romanizada) | Apache 2.0 | safetensors (Hugging Face) |
| OpenAI Whisper (modelo original) | varía según tamaño | ventanas de 30 s | multilingüe | MIT (según versión) | múltiples |

La comparación con alternativas de la misma categoría (otros modelos ASR para hinglish) no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato y la cuantización: esta versión es más ligera y ejecutable en CPU, a costa de la pérdida de precisión inherente a q5_0.

## Limitaciones y advertencias

- El modelo devuelve `nan` ante ruido y ante una única palabra corta como "Yeah"; el autor indica que debe tratarse como ausencia de resultado.
- La ortografía del hindi romanizado no es consistente (por ejemplo, "usmen", "mein"), lo que puede afectar a la calidad de la transcripción para usos que requieran normalización.
- La evaluación del autor se limita a una grabación de 30 minutos de Teams y a voces sintéticas, lo que no constituye una medida de precisión general.
- No traduce: si se necesita una traducción al inglés o al hindi nativo, este modelo no es adecuado.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos de audio con ruido o silencios largos.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Whisper, puede heredar los sesgos del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una versión modificada (convertida y cuantizada) conviene conservar los avisos de licencia y atribuir tanto a Oriserve como a OpenAI Whisper.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-10-31) es futura respecto a la información habitual, lo que conviene verificar antes de usarlo en producción.

## Enlaces

- [Hugging Face: bhullar17noor/whisper-hindi2hinglish-apex-ggml](https://huggingface.co/bhullar17noor/whisper-hindi2hinglish-apex-ggml)
- [Modelo base: Oriserve/Whisper-Hindi2Hinglish-Apex](https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex)
- [whisper.cpp (repositorio oficial)](https://github.com/ggml-org/whisper.cpp)
