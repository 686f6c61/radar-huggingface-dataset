# monolithdm/kokoro-82m-kora

## Resumen

Kokoro-82m-kora es una exportación ONNX de Kokoro-82M (hexgrad) modificada por el usuario monolithdm para exponer una salida adicional: `pred_dur`, la duración predicha de cada fonema de entrada. El modelo base es un sintetizador de voz de 82 millones de parámetros, derivado de la familia StyleTTS 2 (así lo indica el tag `style_text_to_speech_2` del repositorio) y con salida de audio a 24 kHz. El problema que resuelve esta variante no es la síntesis en sí, sino la sincronización labial: sin información de duración por fonema, un avatar animado no puede alinear visemas con la señal de audio sin recurrir a un alineador forzado externo.

La modificación es quirúrgica. El autor añade un único nodo Identity que expone como salida del grafo un tensor entero ya existente en el modelo (`/encoder/Cast_output_0`), sin tocar la ruta que genera la forma de onda. La validación reportada es de equivalencia bit a bit contra la exportación de origen (59.400 muestras, diferencia máxima 0), lo que implica que la calidad de audio no se ve alterada por el injerto. El repositorio ocupa 0,4 GB e incluye dos variantes: `onnx/model.onnx` en fp32 orientada a WebGPU y `onnx/model_quantized.onnx` en q8 para CPU/WASM.

Su relevancia es de nicho pero clara: encaja en pipelines de TTS en el navegador vía transformers.js donde se necesite timing por fonema con una resolución de 25 ms, sin depender de un servicio de alineación. Conviene tener presente que el repositorio es muy reciente (creado y actualizado el 28 de octubre de 2026, con 13 minutos de diferencia entre ambas marcas) y que registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz derivada de StyleTTS 2 (tag `style_text_to_speech_2`), exportada a ONNX con una salida extra `pred_dur` |
| Parámetros totales | 82 M (según el nombre del modelo base, hexgrad/Kokoro-82M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de contexto textual: consume una secuencia de tokens de fonemas más tokens de relleno de inicio y fin |
| Tipos de cuantización | fp32 (`onnx/model.onnx`) y q8/int8 (`onnx/model_quantized.onnx`) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (dos variantes), más `config` y tokenizador originales |
| Frecuencia de muestreo de audio | 24 kHz |
| Salidas del grafo | Forma de onda de audio y `pred_dur` (un valor entero por token de entrada) |
| Resolución temporal de `pred_dur` | 1 unidad = 600 muestras a 24 kHz = 25 ms |
| Tamaño del repositorio | 0,4 GB |
| Voces | No incluidas; se cargan desde el repositorio upstream |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de Kokoro-82M, un TTS de 82 M de parámetros construido sobre la arquitectura StyleTTS 2, que combina un codificador de estilo y texto con un decodificador de forma de onda del tipo ISTFTNet para generar audio a 24 kHz. La ficha del repositorio no documenta el proceso de entrenamiento del modelo base: no se indican número de tokens, composición del dataset, horas de audio, ni si hubo ajuste por RLHF o DPO (en un TTS estas técnicas no son el mecanismo habitual; lo esperable sería un ajuste adversarial o por pérdidas de reconstrucción y prosodia, pero esto no se confirma en la información disponible).

La innovación concreta de esta variante es el injerto de `pred_dur`. El script `scripts/graft_pred_dur.py` del repositorio lorefoundry/tts-pack, ejecutado sin modificaciones sobre la exportación de onnx-community, añade un nodo Identity que promociona a salida del grafo el tensor entero `/encoder/Cast_output_0`, que ya se calculaba internamente como duración de cada fonema. Al no alterar la ruta de decodificación de audio, el autor verifica que la forma de onda resultante es idéntica bit a bit a la del export original: 59.400 muestras comparadas con diferencia máxima 0. La semántica de la nueva salida es de una unidad de 600 muestras (25 ms), con un valor por cada token de entrada, incluidos los tokens de relleno de inicio y fin, lo que obliga a gestionar el desfase entre tokens y fonemas reales en el consumidor.

## Capacidades

- Síntesis de voz a partir de fonemas, con salida de audio a 24 kHz.
- Predicción de duración por fonema (`pred_dur`), con granularidad de 25 ms, pensada para animación labial y alineación temporal.
- Ejecución en navegador mediante transformers.js, con dos rutas: fp32 sobre WebGPU y q8 sobre CPU/WASM.
- Carga de voces desde el repositorio upstream, lo que permite reutilizar el catálogo de voces de Kokoro-82M.
- Equivalencia de audio verificada respecto al export ONNX de origen, por lo que hereda las capacidades del modelo base en la ruta de síntesis.
- No se documentan en esta ficha capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es un modelo estrictamente texto-a-voz.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Modo thinking, function calling y similares: no aplica.

## Casos de uso

- Animación labial de avatares en tiempo real: el consumidor recibe `pred_dur` alineado token a token y puede mapear cada fonema a un visema, acumulando duraciones de 25 ms para disparar los keyframes de la boca sincronizados con el audio que se reproduce en el mismo instante. Es el caso de uso para el que se creó el injerto.
- Doblaje y localización: usar las duraciones por fonema para estimar la longitud temporal de cada frase y ajustar la síntesis al hueco disponible en el vídeo original, o para generar subtítulos con timing aproximado sin un alineador forzado adicional.
- Lectura de artículos y accesibilidad web sin backend: con la variante q8 sobre WASM, o la fp32 sobre WebGPU, la síntesis ocurre íntegramente en el cliente, lo que elimina el coste de servidor y la latencia de red en aplicaciones de lectura por voz.
- Resaltado tipo karaoke en plataformas de e-learning: acumulando `pred_dur` se obtiene la ventana temporal de cada fonema y se puede resaltar el texto a nivel sub-palabra mientras suena el audio, con una precisión de 25 ms que es suficiente para lectura guiada.
- Prototipado de personajes y demos en estudios pequeños: 0,4 GB de repositorio y menos de 100 MB en q8 permiten distribuir una demo de voz con sincronización labial dentro de un contenedor ligero o incluso como assets estáticos de una web.
- Investigación de prosodia y ritmo: `pred_dur` expone el timing que el modelo predice antes de sintetizar, lo que permite analizar cómo varía la duración vocálica y consonántica según el estilo inyectado, sin necesidad de instrumentar el modelo internamente.
- Pruebas de regresión en CI de pipelines de voz: comparar las duraciones predichas entre versiones del modelo o del fonemizador para detectar cambios de comportamiento en el timing antes de publicar un cambio de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni métricas TTS como MOS, CMOS o WER). El único dato de validación reportado es la comprobación de equivalencia con el export de origen: 59.400 muestras comparadas, diferencia máxima 0, lo que confirma que la ruta de audio no se ha modificado. No hay medidas de latencia ni de throughput publicadas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el grafo fp32 ronda los 328 MB de pesos (82 M de parámetros × 4 bytes) más las activaciones; el repositorio completo pesa 0,4 GB. La variante q8 reduce los pesos a aproximadamente 82 MB, más overhead.
- GPU recomendadas: no se especifican en la ficha. Por tamaño, el modelo cabe holgadamente en cualquier GPU consumer reciente; para la ruta WebGPU basta con un navegador con soporte WebGPU y una GPU integrada o dedicada.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo. La ruta q8 está pensada explícitamente para CPU/WASM, por lo que también funciona sin GPU.
- Opciones de despliegue: transformers.js (librería declarada del repositorio) en navegador, con WebGPU para fp32 y WASM para q8; onnxruntime u onnxruntime-web en servidor o cliente según el caso. No hay pesos GGUF, por lo que llama.cpp u Ollama no son vías directas para este repositorio. Tampoco se publican artefactos para vLLM o TGI, que además no aplican a un TTS de este tipo.
- Latencia y throughput: no disponibles. Como referencia estructural, la generación es no autorregresiva en la ruta de audio, lo que en la práctica suele traducirse en latencias bajas para frases cortas, pero no hay cifras medidas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida de duración por fonema | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| monolithdm/kokoro-82m-kora | 82 M | Sí (`pred_dur`, 25 ms) | ONNX fp32 + q8 | Apache-2.0 | Objeto de esta ficha; 0 descargas, 0 likes |
| hexgrad/Kokoro-82M | 82 M | No disponible | Pesos PyTorch (según repositorio base) | Apache-2.0 | Modelo original; requiere exportación propia para ONNX y no expone timing |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82 M | No | ONNX | Apache-2.0 | Exportación de referencia sobre la que se aplica el injerto; sin salida de duraciones |

No se dispone de datos de benchmarks ni de métricas de calidad que permitan comparar rendimiento entre estas variantes; la comparación se limita a parámetros, formatos, licencia y funcionalidad expuesta.

## Limitaciones y advertencias

- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día con 13 minutos de diferencia. No hay evidencia de uso en producción ni de revisión por parte de la comunidad.
- La validación cubre únicamente la equivalencia del audio contra el export de origen. No se ha reevaluado la calidad subjetiva (MOS) del modelo base en esta variante.
- `pred_dur` incluye un valor por cada token de entrada, incluidos los tokens de relleno de inicio y fin. Un consumidor que no descarte esos elementos obtendrá un desfase sistemático en la animación labial.
- La resolución es de 25 ms por unidad, suficiente para visemas pero no para sincronización a nivel de muestra; no sirve para alinear eventos de audio de alta precisión.
- El repositorio no incluye el front-end de fonemización (G2P) ni la normalización de texto: hay que aportarlos externamente y su comportamiento afecta directamente al número y tipo de tokens, y por tanto a las duraciones devueltas.
- Las voces se descargan del repositorio upstream, lo que introduce una dependencia de red y de disponibilidad ajena a este repositorio; conviene verificar la licencia de cada voz utilizada, ya que la Apache-2.0 del modelo no cubre necesariamente los datos de origen de los embeddings de voz.
- Cobertura de idiomas no declarada: no debe asumirse multilingüismo sin comprobarlo contra el repositorio base y el fonemizador empleado.
- La cuantización q8 puede degradar la calidad del audio respecto a fp32; el autor no publica una comparación perceptual entre ambas variantes.
- Riesgo de alucinación en sentido estricto no aplica, pero sí el riesgo habitual en TTS: pronunciación incorrecta de nombres propios, siglas y números cuando la normalización de texto es insuficiente.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución; aun así, al ser un derivado conviene conservar los créditos a hexgrad, onnx-community y lorefoundry que figuran en la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/monolithdm/kokoro-82m-kora
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Exportación ONNX de origen: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Repositorio con el script de injerto: https://huggingface.co/lorefoundry/tts-pack
- Resultados de búsqueda web: las consultas realizadas no devolvieron páginas relevantes sobre este modelo (solo resultados no relacionados), por lo que no se incluyen enlaces adicionales.
