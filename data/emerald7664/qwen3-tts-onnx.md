# Emerald7664/Qwen3-TTS-ONNX

## Resumen

Qwen3-TTS-ONNX es una redistribución de pesos preconvertidos del modelo Qwen3-TTS 12Hz 1.7B Base, publicada por el usuario Emerald7664 bajo el paraguas del SolidAxel Project. Se trata de la variante Base de 1,7B, orientada a clonación de voz a partir de una muestra de referencia, y no de las variantes 0.6B, CustomVoice o VoiceDesign. El problema que resuelve es puramente de ingeniería de despliegue: el pipeline oficial de conversión exige los pesos originales en PyTorch y una exportación en tres etapas repartida en una docena de scripts, mientras que este repositorio entrega el resultado final listo para ejecutar, sin necesidad de PyTorch.

El paquete separa el modelo en componentes con formatos distintos: un módulo talker y un predictor en GGUF (Q5_K y Q8_0), y tres módulos ONNX en FP16 (decoder, speaker encoder y codec encoder), además del tokenizer. La inferencia se realiza combinando llama.cpp para las partes GGUF y ONNX Runtime para las partes ONNX, con un runtime Python externo como envoltorio. El conjunto principal de ficheros ocupa aproximadamente 1,5 GB, lo que lo sitúa en el rango de ejecución en CPU y GPU de consumo.

Es relevante ahora porque reduce la barrera de entrada para experimentar con un sistema TTS multilingüe de última generación sin montar una cadena de conversión propia, y porque demuestra un patrón de empaquetado híbrido GGUF + ONNX que evita por completo la dependencia de PyTorch en producción. El repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, y su única garantía de procedencia es la trazabilidad declarada hacia el modelo original de Qwen y hacia el repositorio de conversión de HaujetZhao.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el empaquetado revela una cadena codec-based con módulos talker, predictor, speaker encoder, codec encoder y decoder, derivada de Qwen3-TTS 12Hz |
| Parámetros totales | 1,7B nominales según el modelo base; 141.570.304 parámetros reportados por los safetensors del repo (discrepancia no aclarada en la información disponible) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q5_K (talker) y Q8_0 (predictor); ONNX FP16, INT8 y FP32 para decoder, speaker encoder y codec encoder |
| Idiomas soportados | Chino, inglés, francés, alemán, español, italiano, portugués, japonés, coreano y ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/ggml) y ONNX (onnxruntime); tokenizer en JSON |
| Tamaño del repositorio | 5,9 GB |
| Tamaño del conjunto principal | Aproximadamente 1,5 GB según la model card |
| Frecuencia de tokenización de audio | 12 Hz (según la denominación del modelo base) |
| Pipeline declarado | text-to-speech |
| Fecha de creación y actualización | 2026-10-14 |

## Arquitectura y entrenamiento

La información disponible describe el empaquetado, no el entrenamiento. Lo que se puede afirmar con certeza es que el sistema se descompone en cinco piezas con roles diferenciados. El talker, en GGUF Q5_K de 960 MB, es el componente generativo principal. El predictor, en GGUF Q8_0 de 145 MB, produce la señal de predicción asociada. El decoder ONNX FP16 de 220 MB convierte la representación interna en audio. El speaker encoder ONNX FP16 de 24 MB extrae el embedding de la voz de referencia necesario para la clonación, y el codec encoder ONNX FP16 de 109 MB tokeniza audio. La tasa de 12 Hz del nombre del modelo base indica un esquema de tokenización de audio de baja frecuencia de frame.

No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias sobre el modelo original. Tampoco se detalla si el talker emplea decodificación especulativa, atención lineal u otra innovación de eficiencia. La innovación destacable de este repositorio es de tipo toolchain: la separación deliberada entre componentes GGUF (para el backbone autoregresivo, ejecutable con llama.cpp) y componentes ONNX (para los módulos de codec y speaker, ejecutables con ONNX Runtime), que permite prescindir de PyTorch en el camino de inferencia.

## Capacidades

- Síntesis de voz multilingüe en diez idiomas: chino, inglés, francés, alemán, español, italiano, portugués, japonés, coreano y ruso.
- Clonación de voz a partir de una muestra de referencia, cargada mediante un fichero JSON de voz (por ejemplo `output/elaborate/sample.json` en el flujo de ejemplo de la model card).
- Generación en streaming: el runtime expone `engine.create_stream()` y `stream.join()`, lo que permite emitir audio de forma incremental.
- Control de muestreo mediante parámetros de configuración, incluyendo `temperature` y `seed` para reproducibilidad.
- Ejecución sin PyTorch: el camino de inferencia completo se apoya en llama.cpp y ONNX Runtime.
- No se documenta soporte de tool calling, function calling, uso agéntico ni razonamiento multi-paso, y no tiene sentido para un modelo TTS.
- No se documenta capacidad de visión, audio de entrada distinto de la muestra de referencia, ni diálogo.

## Casos de uso

- Clonación de voz para doblaje de contenido multilingüe: con una única muestra de referencia se puede generar la misma locución en los diez idiomas soportados, lo que resulta útil para localizar vídeos o cursos sin contratar una voz por idioma.
- Audiolibros y narración automatizada: el modelo acepta texto plano y devuelve audio, y su tamaño de aproximadamente 1,5 GB permite ejecutarlo en una máquina de desarrollo sin GPU dedicada.
- Asistentes de voz embebidos en aplicaciones de escritorio: al no requerir PyTorch y apoyarse en llama.cpp y ONNX Runtime, se integra en binarios ligeros y en entornos donde las dependencias pesadas de Python no son aceptables.
- Generación de avisos y notificaciones habladas personalizadas: el control de `seed` y `temperature` permite fijar una voz consistente entre ejecuciones, algo necesario para que una misma aplicación suene siempre igual.
- Prototipado de interfaces de accesibilidad: conversión de texto a voz para lectores de pantalla o sistemas de asistencia, con la ventaja de que la clonación permite ofrecer voces personalizadas al usuario.
- Preservación de locuciones en pipelines de producción sin PyTorch: entornos con restricciones de dependencias o con imágenes de contenedor mínimas pueden desplegar únicamente el runtime de llama.cpp y ONNX Runtime.
- Evaluación comparativa de la variante Base frente a CustomVoice o VoiceDesign: este repo es la opción indicada cuando el objetivo es medir la calidad de clonación pura con la arquitectura de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de calidad de audio (MOS, WER de reconocimiento sobre el audio generado, similitud de altavoz) ni comparaciones con sistemas TTS alternativos. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB para el conjunto principal de pesos (960 MB de talker Q5_K, 145 MB de predictor Q8_0 y 353 MB de módulos ONNX FP16), más el espacio de trabajo del runtime y los búferes de audio.
- Espacio en disco: 5,9 GB para el repositorio completo, dado que incluye también las variantes INT8 y FP32 de los componentes ONNX; basta con aproximadamente 1,5 GB si solo se descarga el conjunto principal.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con 2 GB o más de memoria es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Ejecución en CPU: viable, al ser el escenario natural de llama.cpp y ONNX Runtime. No se publican cifras de rendimiento en CPU.
- GPU de consumo: sí cabe en GPU de consumo, dado el tamaño del conjunto de pesos.
- Opciones de despliegue: llama.cpp para los componentes GGUF y ONNX Runtime para los componentes ONNX, orquestados por el paquete de runtime `qwen3_tts_gguf` de HaujetZhao. No se documenta compatibilidad con vLLM, TGI, Ollama ni servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Requiere PyTorch | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emerald7664/Qwen3-TTS-ONNX (este repo) | 1,7B nominales (141.570.304 según safetensors) | GGUF + ONNX | No | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base (original) | 1,7B | PyTorch | Sí | Apache 2.0 | HuggingFace (modelo oficial) |
| HaujetZhao/Qwen3-TTS-GGUF (runtime) | No aplica (paquete de código) | Python | No (depende de llama.cpp) | MIT | GitHub |

No se dispone de datos en la información proporcionada para comparar este modelo con otras familias TTS (por ejemplo sistemas de código abierto de tamaño similar) en términos de parámetros, contexto, calidad o rendimiento. Cualquier comparación de ese tipo requeriría benchmarks que no se han publicado aquí.

## Limitaciones y advertencias

- Repositorio sin tracción: cero descargas y cero likes. No hay evidencia de uso en producción ni de validación independiente de la conversión.
- Discrepancia de parámetros: los safetensors del repositorio reportan 141.570.304 parámetros, mientras que el modelo base se denomina 1.7B. La información disponible no explica si esa cifra corresponde a un subcomponente concreto.
- Dependencia de un runtime externo: sin el paquete `qwen3_tts_gguf` y las librerías de llama.cpp compiladas, los ficheros de este repositorio no son utilizables por sí solos.
- Riesgo de conversión: al ser una redistribución de pesos cuantizados y exportados por un tercero, puede haber pérdida de fidelidad respecto a los pesos originales en PyTorch. No se publican métricas que cuantifiquen esa pérdida.
- Idiomas: se declaran diez idiomas, pero no se especifica el nivel de calidad por idioma ni si el entrenamiento estuvo equilibrado entre ellos. El chino y el inglés son, previsiblemente, los mejor cubiertos, aunque esto no se confirma en la información disponible.
- Clonación de voz: la funcionalidad de clonación a partir de una muestra plantea consideraciones éticas y legales sobre consentimiento, suplantación de identidad y uso de voces de terceros. La licencia Apache 2.0 no exime del cumplimiento de la normativa aplicable sobre derechos de imagen y voz.
- Licencia: Apache 2.0 tanto en el modelo original como en esta redistribución, lo que permite uso comercial. El runtime de HaujetZhao se distribuye bajo MIT. No obstante, conviene verificar la licencia del modelo base en su repositorio oficial antes de un despliegue comercial.
- Sin datos de benchmarks: no es posible estimar la calidad de audio ni compararla con alternativas sin realizar una evaluación propia.
- Los resultados de búsqueda web asociados a esta consulta no contienen material relevante sobre el modelo; los enlaces devueltos corresponden a contenidos de naturaleza ajena al proyecto y se han descartado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Emerald7664/Qwen3-TTS-ONNX
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Runtime y toolchain de conversión (GitHub): https://github.com/HaujetZhao/Qwen3-TTS-GGUF
- Paquete de runtime en HuggingFace: https://huggingface.co/Solidaxel/Qwen3-TTS-GGUF
- Proyecto SolidAxel: https://solidaxel.org
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs o demos) sobre este modelo.
