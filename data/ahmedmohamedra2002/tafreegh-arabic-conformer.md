# ahmedmohamedra2002/tafreegh-arabic-conformer

## Resumen

Tafreegh Arabic Conformer es una compilación optimizada para inferencia en dispositivo del modelo de reconocimiento automático del habla en árabe de NVIDIA, `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0`. Lo publica el desarrollador ahmedmohamedra2002 como artefacto opcional para la aplicación Android Tafreegh, que transcribe audio de forma totalmente offline en el teléfono. No se trata de un modelo entrenado desde cero, sino de una conversión de la rama CTC del modelo original a formato ONNX Runtime (`.ort`) con cuantización int8 y un conjunto de reescrituras de operadores para que el grafo sea compatible con una build mínima de ONNX Runtime 1.23.2 embebida en la app.

El interés técnico está en el proceso de compresión y adaptación: se eliminan las máscaras de padding, se sustituyen operaciones no soportadas por equivalentes (`Pad` por `Concat`, `x * sigmoid(x)` por `QuickGelu(alpha=1)`, `LogSoftmax` eliminado para devolver logits), se aplica SmoothQuant antes de la cuantización dinámica de pesos y se recorta la tabla de posiciones relativas de ±5000 a ±1000 frames. El resultado es un único fichero de 116 MB que acepta hasta 80 segundos de audio por llamada y mantiene una precisión competitiva frente a Whisper Large v3 Turbo en las pruebas del autor.

El modelo es relevante para quien necesite ASR árabe en movilidad, sin red y con recursos limitados, y como ejemplo reproducible de cómo portar un FastConformer de NeMo a ONNX Runtime int8 sin degradar la decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hybrid (rama CTC), transformer convolucional-aumentado |
| Parametros totales | no disponible (el artefacto int8 ocupa 116.285.936 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 80 s de audio por llamada (tabla de posiciones relativas ±1000 frames) |
| Tipos de cuantizacion | int8 dinámica por columna en MatMul y convoluciones 1x1 (`com.microsoft.DynamicQuantizeMatMul`), con SmoothQuant previo (α = 0.5) |
| Idiomas soportados | árabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX Runtime `.ort` (opset 17); fichero `ar_conformer_q8.ort` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un FastConformer híbrido de NVIDIA con cabeza CTC, entrenado originalmente por NVIDIA sobre datos de habla árabe (el conjunto FLEURS Arabic forma parte de su entrenamiento, según advierte el propio autor). Este repositorio no reentrena pesos: parte de la exportación ONNX de la rama CTC publicada en `hamdanfatah19/kotes` (pesos sin modificar) y aplica una cadena de transformaciones de grafo y cuantización.

Las modificaciones son concretas: se eliminan las máscaras de padding porque la app envía una locución por llamada y todos los frames son válidos; `Pad` se reemplaza por `Concat` con una columna de ceros; la activación `x * sigmoid(x)` se convierte en `QuickGelu(alpha=1)` y la sigmoide del GLU en `1 / (1 + e^-x)`; se elimina `LogSoftmax` para que la salida sean logits; se fija opset 17. Antes de cuantizar, las salidas coinciden con el original dentro de 3e-4 y la decodificación greedy es idéntica. La cuantización int8 usa pesos por columna y requiere SmoothQuant sobre las 34 entradas de las capas feed-forward, calibrado con 10 minutos de FLEURS Arabic; sin ese paso, el modelo int8 perdía aproximadamente la mitad de las palabras. El vocabulario SentencePiece de 1024 piezas se incrusta en los metadatos del modelo bajo la clave `vocabulary`, con el token blank en el id 1024.

## Capacidades

- Reconocimiento automático del habla en árabe con salida de texto que incluye puntuación y diacríticos.
- Decodificación CTC greedy sobre logits de forma `[1, T/8, 1025]`, un frame cada 80 ms.
- Entrada de características log-mel de NeMo calculadas externamente: audio mono a 16 kHz, pre-énfasis 0.97, FFT de 512 puntos sobre ventanas Hann simétricas de 25 ms cada 10 ms, 80 bandas mel Slaney, `log(x + 2^-24)` y normalización por utterance a media cero y desviación típica unitaria.
- Inferencia puramente local en dispositivo mediante ONNX Runtime 1.23.2 (build mínima), sin dependencia de red.
- Procesamiento de locuciones de hasta 80 segundos por llamada.
- No soporta tool calling, agentes, visión, audio de entrada distinto al especificado ni modos de razonamiento extendido.

## Casos de uso

- Transcripción offline en Android: la app Tafreegh descarga `ar_conformer_q8.ort` como modelo opcional y transcribe en el propio teléfono; encaja porque el artefacto pesa 116 MB y está cuantizado a int8 para ejecutarse sin GPU dedicada.
- Subtitulado de pódcasts y entrevistas en árabe: con hasta 80 s por llamada se pueden segmentar episodios en bloques y generar subtítulos con puntuación, útiles para publicación o accesibilidad.
- Notas de voz y actas de reuniones: grabaciones cortas en móvil se transcriben al instante sin enviar audio a servidores, lo que simplifica el cumplimiento de privacidad.
- Dictado en aplicaciones de productividad: integración del `.ort` en un pipeline on-device para convertir voz en texto en campos de formulario, con latencia baja al no requerir red.
- Investigación en ASR de bajo recurso: sirve como referencia reproducible de conversión NeMo FastConformer a ONNX Runtime int8, con receta de SmoothQuant y reescritura de operadores documentada.
- Despliegue en dispositivos sin conectividad: entornos de campo, zonas con cobertura intermitente o escenarios de aviación y logística donde el audio no puede salir del dispositivo.
- Evaluación comparativa de ASR árabe: útil para contrastar modelos ligeros (Moonshine Tiny) y grandes (Whisper Large v3 Turbo) en condiciones de habla sobre música o acentos saudíes.

## Benchmarks y rendimiento

Tasa de error de palabra (WER) medida por el desarrollador de la app con este fichero y sus propias grabaciones de prueba, eliminando diacríticos y puntuación:

| Conjunto de prueba | Moonshine Tiny integrado | Whisper Large v3 Turbo | Este modelo (int8) |
|---|---|---|---|
| FLEURS Arabic, 150 frases de test | 13,2 % | 12,8 % | 10,4 % |
| Pódcast saudí, 10 min, frente a subtítulos humanos | 35,4 % | 32,4 % | 30,7 % |
| Habla sobre música | 19,7 % | no disponible | 10,0 % |

Advertencia del autor: los datos de entrenamiento de FLEURS Arabic forman parte del conjunto de entrenamiento del modelo original, por lo que la cifra de FLEURS está optimista. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto int8 ocupa unos 116 MB en disco; en ejecución se requiere memoria adicional para activaciones y el grafo de ONNX Runtime, del orden de unos cientos de MB según la longitud del audio.
- GPU recomendadas: no requiere GPU; está diseñado para CPU móvil. En servidor puede ejecutarse en CPU o en cualquier GPU compatible con ONNX Runtime.
- Cabe en cualquier smartphone Android moderno y en GPU de consumo (RTX 4090, etc.) sin problema, aunque no se aprovecha la GPU en el caso de uso previsto.
- Opciones de despliegue: ONNX Runtime 1.23.2 (build mínima con soporte de `com.microsoft.DynamicQuantizeMatMul`); no se distribuye en GGUF, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que el modelo procesa hasta 80 s de audio por llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS Arabic | Licencia | Formato |
|---|---|---|---|---|---|
| Tafreegh Arabic Conformer (este) | no disponible (116 MB int8) | 80 s por llamada | 10,4 % | CC BY 4.0 | `.ort` int8 |
| Moonshine Tiny (integrado en la app) | no disponible | no disponible | 13,2 % | no disponible | no disponible |
| Whisper Large v3 Turbo | no disponible | 30 s por defecto | 12,8 % | no disponible | no disponible |
| NVIDIA `stt_ar_fastconformer_hybrid_large_pcd_v1.0` (base) | no disponible | no disponible | no disponible (referencia) | CC BY 4.0 | NeMo `.nemo` / ONNX |

Las cifras de WER proceden de las pruebas del autor con sus propias grabaciones; no son comparaciones oficiales ni equivalentes en condiciones de evaluación.

## Limitaciones y advertencias

- Solo árabe; no cubre otros idiomas ni code-switching.
- Límite de 80 s por llamada impuesto por el recorte de la tabla de posiciones relativas a ±1000 frames; audios más largos deben segmentarse.
- La app envía una locución por llamada y se han eliminado las máscaras de padding: no se debe usar con batches con longitudes variables sin reañadir el enmascaramiento.
- La salida son logits (sin `LogSoftmax`); es responsabilidad del integrador aplicar la decodificación CTC greedy correcta.
- La cuantización int8 depende de SmoothQuant calibrado con 10 minutos de FLEURS Arabic; sin ese paso la degradación es severa (pérdida de aproximadamente la mitad de las palabras).
- Riesgo de alucinación y errores en habla con ruido, música o acentos no representados; el WER en pódcast saudí supera el 30 %.
- El modelo base es de NVIDIA y este repositorio no está avalado por NVIDIA; la licencia CC BY 4.0 exige atribución a NVIDIA y al autor de la conversión.
- No se han publicado evaluaciones independientes ni métricas de latencia o consumo en dispositivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedmohamedra2002/tafreegh-arabic-conformer
- Modelo base NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Exportación ONNX de origen (rama CTC): https://huggingface.co/hamdanfatah19/kotes
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- ONNX Runtime: https://onnxruntime.ai/
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
