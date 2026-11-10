# Abhinesh1234/flowvoice-telugu-whisper

## Resumen

Flowvoice-telugu-whisper es una conversión de formato del modelo `vasista22/whisper-telugu-medium`, un fine-tune de Whisper medium para reconocimiento automático del habla (ASR) en telugu. El autor de esta ficha en Hugging Face (Abhinesh1234) no ha reentrenado el modelo: únicamente ha convertido el checkpoint original de PyTorch al formato ggml que consume whisper.cpp y lo ha cuantizado a q5_0. El modelo se distribuye como un único fichero binario de 514 MB pensado para ser descargado automáticamente por Flowvoice, una aplicación de dictado para Windows.

La relevancia de esta ficha es fundamentalmente práctica: permite ejecutar un ASR de calidad media para telugu en CPU y en hardware modesto sin depender de PyTorch ni de CUDA, algo útil para aplicaciones de escritorio, dictado offline y despliegues en dispositivos con recursos limitados. El modelo original fue entrenado por vasista22 con el Speech Lab del IIT Madras dentro del sprint de fine-tuning de Whisper, y toda la precisión lingüística del modelo procede de ese trabajo.

Arquitectura Whisper medium (transformer encoder-decoder de tipo seq2seq con atención, ~769 M parámetros en el modelo base), especializado en un único idioma (telugu, código `te`) y empaquetado en ggml q5_0. No hay datos publicados de evaluación propios más allá de una comprobación cualitativa sobre 8 clips.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper medium (transformer encoder-decoder, ASR seq2seq) |
| Parametros totales | ~769 M (arquitectura Whisper medium; no confirmado en la model card de esta conversión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper; no disponible detalle adicional en la model card) |
| Tipos de cuantizacion | q5_0 (único fichero publicado); el autor indica conversión previa a f16 |
| Idiomas soportados | telugu (`te`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml binario (`ggml-telugu-medium-q5_0.bin`, 539.212.467 bytes, SHA-256 `cf9984a4bc56ea32ac044963196847cea436369e692a865c9f4c9a4be4429dd4`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper medium de OpenAI: un transformer encoder-decoder con atención multi-cabeza que procesa espectrogramas Mel de 30 segundos y genera tokens de texto de forma autorregresiva. El fine-tune original (`vasista22/whisper-telugu-medium`) fue realizado por vasista22 y el Speech Lab del IIT Madras en el marco del Whisper fine-tuning sprint, especializando el modelo en telugu. Esta ficha no dispone de detalles sobre el corpus de entrenamiento, el número de tokens de audio ni si se aplicaron técnicas de RLHF o ajuste supervisado adicional; el autor remite a la model card del modelo original para esa información.

La única modificación realizada en esta versión es de formato y compresión: conversión del checkpoint PyTorch a ggml (f16) y cuantización posterior a q5_0, sin reentrenamiento ni alteración de los pesos más allá de la cuantización. Según el autor, en pruebas sobre 8 clips en telugu la salida de texto fue idéntica a la de f16 y la decodificación resultó aproximadamente 2,2 veces más rápida. No se documentan innovaciones arquitectónicas adicionales (no hay decodificación especulativa, atención lineal ni mecanismos híbridos).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en telugu.
- Funcionamiento en whisper.cpp, lo que permite inferencia en CPU sin dependencias de PyTorch ni CUDA.
- Adecuado para dictado en tiempo real o cuasi real en aplicaciones de escritorio (caso de uso declarado: Flowvoice en Windows).
- Ejecución con marcas de tiempo desactivadas (`no_timestamps`), configuración recomendada por el autor para obtener la mejor transcripción.
- Modelo monolingüe: no se declaran capacidades multilingües, de traducción, de tool calling, de agentes ni de razonamiento multi-paso.
- No dispone de modo de razonamiento extendido, visión, audio de entrada más allá de la transcripción ni salidas estructuradas.

## Casos de uso

- Dictado por voz en Windows: integración en Flowvoice para convertir voz a texto en telugu con un único fichero ggml descargado automáticamente, sin instalación de frameworks de deep learning.
- Transcripción offline en equipos sin GPU: al ejecutarse en whisper.cpp sobre CPU, permite transcribir reuniones o notas de voz en portátiles convencionales.
- Subtitulado de contenido en telugu: generación de transcripciones para vídeos, pódcast o clases grabadas, con la salvedad de desactivar las marcas de tiempo para evitar la pérdida de las primeras palabras.
- Aplicaciones de accesibilidad: entrada de texto por voz para usuarios con dificultades de teclado en entornos de habla telugu.
- Procesamiento por lotes de archivos de audio en servidores modestos: el tamaño reducido (514 MB) y la cuantización q5_0 permiten desplegar el modelo en contenedores ligeros o en el edge.
- Prototipado e investigación en ASR de bajos recursos: punto de partida para evaluar la calidad del fine-tune de IIT Madras en pipelines basados en whisper.cpp antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una comparación cualitativa interna: sobre 8 clips en telugu, la salida de texto con q5_0 fue idéntica a la de f16 y la decodificación resultó aproximadamente 2,2 veces más rápida. No hay cifras de WER, MMLU, HumanEval ni GSM8K (no aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM/RAM estimada: el fichero q5_0 ocupa 514 MB; la inferencia en whisper.cpp requiere espacio adicional para buffers y el encoder, por lo que se recomienda al menos 1-2 GB de RAM libre (estimación, no confirmada en la model card).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante whisper.cpp. Cualquier GPU con soporte de whisper.cpp (por ejemplo, CUDA o Metal) puede acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se documentan requisitos ni rendimiento en GPU concretas.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); no se distribuyen pesos en safetensors ni GGUF para llama.cpp/Ollama, y no hay indicios de soporte en vLLM o TGI (estos frameworks no están orientados a Whisper en este formato).
- Latencia y throughput: no disponibles de forma cuantificada; solo la referencia cualitativa de 2,2× de aceleración frente a f16 en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| flowvoice-telugu-whisper (esta ficha) | ~769 M (Whisper medium) | 30 s por ventana | telugu | Apache-2.0 | ggml q5_0 |
| vasista22/whisper-telugu-medium (original) | ~769 M | 30 s por ventana | telugu | Apache-2.0 (según modelo base) | PyTorch |
| Whisper medium de OpenAI | ~769 M | 30 s por ventana | multilingüe | MIT (modelo original de OpenAI) | PyTorch, ggml (conversiones de la comunidad) |

La comparación se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento de alternativas específicas para telugu en la información proporcionada. No disponible comparativa cuantitativa de WER frente a otros sistemas ASR en telugu.

## Limitaciones y advertencias

- Modelo monolingüe: solo telugu; no debe esperarse un comportamiento correcto en otros idiomas.
- Riesgo de alucinación y errores de transcripción inherente a los modelos Whisper, especialmente en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico.
- Con marcas de tiempo activadas puede perder las primeras palabras; el autor recomienda `no_timestamps`.
- La validación reportada es muy limitada (8 clips) y no incluye métricas objetivas como WER; no hay evidencia publicada de calidad en producción.
- Sesgos: no documentados en esta ficha; deben consultarse en la model card del modelo original (`vasista22/whisper-telugu-medium`).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia y condiciones del modelo base original antes de redistribuir.
- Esta conversión no ha sido reentrenada ni evaluada de forma independiente; la responsabilidad sobre la precisión recae en el fine-tune original de IIT Madras.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhinesh1234/flowvoice-telugu-whisper
- Modelo base original: https://huggingface.co/vasista22/whisper-telugu-medium
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Whisper de OpenAI (arquitectura base): https://github.com/openai/whisper
- No se han encontrado en la información proporcionada papers, blogs ni demos adicionales específicos de esta conversión.
