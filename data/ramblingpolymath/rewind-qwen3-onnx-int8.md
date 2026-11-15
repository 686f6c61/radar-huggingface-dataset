# ramblingpolymath/rewind-qwen3-onnx-int8

## Resumen

`ramblingpolymath/rewind-qwen3-onnx-int8` es una conversión a formato ONNX con cuantización INT8 de dos modelos de la familia Qwen3 orientados al procesamiento de voz: Qwen3-ASR-0.6B (reconocimiento automático del habla) y Qwen3-ForcedAligner-0.6B (alineamiento forzado de transcripciones con audio). El autor, ramblingpolymath, publica únicamente las conversiones de formato, sin entrenamiento ni ajuste fino adicional, con el objetivo declarado de ejecutar estos modelos en Windows mediante ONNX Runtime 1.28 o superior, dentro del proyecto Rewind.

El paquete incluye tres grafos separados: un codificador de audio, un decodificador de texto y el alineador forzado completo. Los pesos de las operaciones MatMul se almacenan como `MatMulNBits` de 8 bits en bloques de 32 con una escala por bloque, una técnica de cuantización por bloques que reduce el peso del repositorio hasta 2,4 GB. La relevancia de esta ficha radica en que permite desplegar ASR de la familia Qwen3 en hardware de consumo Windows sin depender de CUDA, aunque con limitaciones concretas de proveedor de ejecución documentadas por el autor.

Ambos modelos base tienen 0,6 mil millones de parámetros, licencia Apache-2.0 y están pensados para transcripción y alineamiento temporal de audio. Esta conversión hereda esa licencia y está etiquetada con el pipeline `automatic-speech-recognition`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de audio + decodificador de texto) para ASR; modelo completo para alineamiento forzado |
| Parametros totales | 0,6 mil millones por modelo base (Qwen3-ASR-0.6B y Qwen3-ForcedAligner-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con `MatMulNBits` (com.microsoft), bloques de 32, una escala por bloque |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.data`) para ONNX Runtime 1.28+ |

## Arquitectura y entrenamiento

La conversión no introduce entrenamiento ni ajuste fino: son transformaciones de formato sobre los checkpoints originales. El codificador de audio (`encoder.onnx`) recibe mel-espectrogramas de forma `[1,128,T]` y produce características `[1,N,1024]`; se exportó en FP32 desde `andrewleech/qwen3-asr-0.6b-onnx` (commit `4fc24a14`) y después se cuantizó. El decodificador de texto (`decoder.onnx` + `.data`) se generó a partir del checkpoint de Qwen3-ASR-0.6B (commit `5eb14417`) usando el model builder de onnxruntime-genai 0.20.0 con opciones `-p int8 -e cpu` y `exclude_embeds`, y luego se editó para emitir logits de la última posición y calcular la longitud total a partir de la suma de la máscara de atención.

El alineador forzado (`model.onnx` + `.data`) se exportó en FP32 desde `valoomba/Qwen3-ForcedAligner-0.6B-ONNX` (commit `261c9ed1`) y se cuantizó después. Acepta `input_ids`, `input_features`, `attention_mask` y `feature_attention_mask`, y devuelve logits de forma `[1,T,5000]`. Dos detalles técnicos son críticos: el decodificador consume embeddings de token, no identificadores, porque la tabla de embeddings no está incluida; y el decodificador solo funciona con el proveedor CPU, ya que DirectML calcula incorrectamente los pesos de 8 bits de ese grafo.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante Qwen3-ASR-0.6B.
- Alineamiento forzado entre una transcripción dada y el audio, con salida de logits sobre un vocabulario de 5000 unidades para obtener marcas temporales.
- Ejecución en ONNX Runtime 1.28+ en Windows, con soporte de proveedor DirectML o CPU según el grafo.
- Inferencia con pesos INT8 de 8 bits por bloque, orientada a reducir huella de memoria.
- No incluye tabla de embeddings en el decodificador: requiere aportar embeddings externamente.
- Soporte de tool calling, agentes, visión, audio generativo o modo thinking: no disponible (no aplica a este pipeline).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Transcripción local en Windows: usar `encoder.onnx` y `decoder.onnx` con ONNX Runtime para convertir reuniones o notas de voz en texto sin enviar audio a la nube, aprovechando que el paquete está pensado para el proyecto Rewind en Windows.
- Generación de subtítulos con marcas temporales: combinar la transcripción del ASR con `qwen3-forcedaligner-0.6b-onnx-int8/model.onnx` para alinear cada palabra o segmento con su intervalo de tiempo en el audio.
- Indexación y búsqueda de archivos de audio: transcribir una biblioteca de grabaciones y almacenar el texto junto con los tiempos de alineamiento para permitir búsquedas por palabra con salto al instante exacto.
- Herramientas de accesibilidad: producir subtítulos sincronizados para vídeos o transcripciones en vivo en equipos Windows con gráficos integrados Intel, usando el proveedor DirectML en el codificador y el alineador.
- Anotación de corpus de voz: emplear el alineador forzado para verificar y ajustar los límites temporales de transcripciones humanas en pipelines de preparación de datasets.
- Integración en aplicaciones de escritorio .NET o Python: cargar los grafos ONNX con ONNX Runtime y distribuir los 2,4 GB del repositorio como recurso local de la aplicación, sin dependencias de CUDA.
- Validación de pipelines ASR: usar el par ASR más alineador como referencia para comparar la calidad de transcripción y los tiempos obtenidos frente a otros motores en la misma máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella en disco: 2,4 GB para el repositorio completo (tres grafos ONNX más ficheros `.data`).
- VRAM/RAM estimada: no disponible de forma explícita; con 0,6 mil millones de parámetros en INT8, la carga de pesos ronda los cientos de MB por grafo, pero el autor no publica cifras exactas.
- GPU recomendadas: no disponible; el autor solo confirma pruebas en un equipo con Intel Core Ultra 7 355 e gráficos integrados Intel en Windows 11.
- Compatibilidad con GPU de consumo: el codificador y el alineador pueden ejecutarse en DirectML o CPU; el decodificador solo con proveedor CPU, por lo que no se recomienda confiar en GPU para ese grafo.
- Opciones de despliegue: ONNX Runtime 1.28+ (DirectML o CPU), onnxruntime-genai 0.20.0 para la generación del decodificador.
- Latencia y throughput: no disponibles; el autor recomienda validar cualquier GPU frente al proveedor CPU antes de usarla con estos ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rewind-qwen3-onnx-int8 (esta ficha) | 0,6 B por modelo | no disponible | ONNX INT8 | Apache-2.0 | Solo conversión de formato; decodificador limitado a CPU |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | no disponible | safetensors (formato original) | Apache-2.0 | Modelo base sin cuantizar |
| Qwen/Qwen3-ForcedAligner-0.6B | 0,6 B | no disponible | safetensors (formato original) | Apache-2.0 | Alineador forzado base |
| andrewleech/qwen3-asr-0.6b-onnx | 0,6 B | no disponible | ONNX FP32 | no disponible | Exportación FP32 de origen del codificador |
| valoomba/Qwen3-ForcedAligner-0.6B-ONNX | 0,6 B | no disponible | ONNX FP32 | no disponible | Exportación FP32 de origen del alineador |

## Limitaciones y advertencias

- Conversión de formato únicamente: no hay entrenamiento, ajuste fino ni evaluación de calidad asociada a esta versión.
- El decodificador solo funciona con el proveedor CPU de ONNX Runtime; DirectML calcula incorrectamente sus pesos de 8 bits.
- El decodificador no incluye la tabla de embeddings: hay que aportar los embeddings de token desde fuera.
- Solo probado en un equipo (Intel Core Ultra 7 355, gráficos integrados Intel, Windows 11); el propio autor recomienda validar cada GPU contra el proveedor CPU antes de confiar en ella.
- Requiere ONNX Runtime 1.28 o superior; versiones anteriores pueden no soportar los grafos o los `MatMulNBits`.
- Idiomas soportados no documentados en esta conversión.
- Riesgo de alucinación y sesgos del modelo base: no evaluado en esta versión.
- Licencia Apache-2.0 heredada de los modelos y exportaciones de origen; permite uso comercial, pero conviene revisar las condiciones de los repositorios fuente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ramblingpolymath/rewind-qwen3-onnx-int8
- Modelo base ASR: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Modelo base alineador: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Exportación FP32 del codificador: https://huggingface.co/andrewleech/qwen3-asr-0.6b-onnx
- Exportación FP32 del alineador: https://huggingface.co/valoomba/Qwen3-ForcedAligner-0.6B-ONNX
