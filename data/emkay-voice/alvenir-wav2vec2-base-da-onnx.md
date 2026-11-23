# Emkay-Voice/alvenir-wav2vec2-base-da-onnx

## Resumen

alvenir-wav2vec2-base-da-onnx es la conversión a formato ONNX del modelo de reconocimiento automático del habla Alvenir/wav2vec2-base-da-ft-nst, desarrollado originalmente por Alvenir y exportado por Emkay-Voice para su uso con transformers.js. El objetivo no es ofrecer un modelo nuevo, sino empaquetar los pesos originales en un formato que permita ejecutar la transcripción de audio danés directamente en el navegador, sin backend ni servidor de inferencia. Los pesos no se han reentrenado: la conversión se realizó con optimum y se generó además una versión cuantizada a 8 bits.

El modelo forma parte del proyecto Emkay, la implementación en navegador de OpenVoiceOS, y está pensado como componente ligero de reconocimiento de voz para aplicaciones web de asistentes. Se trata de un wav2vec2 de tamaño base, con arquitectura transformer convolucional para audio, especializado en un único idioma: danés (da). El repositorio ocupa aproximadamente 0,5 GB e incluye tanto los pesos en precisión original como la variante cuantizada que consume la aplicación.

Su relevancia actual radica en la combinación de tres factores: licencia Apache 2.0, ejecución íntegra en cliente mediante transformers.js y un tamaño que permite cargar el modelo en un navegador sin infraestructura dedicada. Es, por tanto, una pieza de infraestructura para desarrolladores que necesiten ASR danés de baja latencia y sin dependencia de la nube, más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer para audio con extractor convolucional) |
| Parámetros totales | no disponible (modelo base de la familia wav2vec2; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa ventanas de audio; el autor no especifica el límite) |
| Tipos de cuantización | 8 bits (onnx/model_quantized.onnx); pesos originales sin cuantizar también incluidos |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 (se mantiene la licencia del modelo original) |
| Formato de pesos | ONNX (exportado con optimum); compatible con transformers.js |
| Modelo base | Alvenir/wav2vec2-base-da-ft-nst |
| Tarea | automatic-speech-recognition |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2, un modelo de representación auto-supervisada de audio formado por un extractor de características convolucional seguido de un transformer que procesa las representaciones latentes. En esta ficha se distribuye el checkpoint ajustado para reconocimiento del habla en danés (sufijo ft-nst en el nombre del modelo base), es decir, la variante ya afinada para transcripción, no el modelo preentrenado sin ajuste.

No se ha realizado ningún reentrenamiento en esta conversión: los pesos son idénticos a los del modelo original de Alvenir. El trabajo técnico consiste en la exportación a ONNX mediante optimum y en la generación de una versión cuantizada a 8 bits (onnx/model_quantized.onnx), que es la que utiliza Emkay. El script de conversión y las pruebas están publicados en el repositorio emkay-voice/stt-models. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus danés ni si el ajuste original incluyó técnicas de alineación o decodificación con modelo de lenguaje.

## Capacidades

- Reconocimiento automático del habla en danés a partir de audio muestreado a 16 kHz.
- Transcripción de audio a texto mediante la pipeline `automatic-speech-recognition` de transformers.js.
- Ejecución en el navegador en cliente, sin backend de inferencia.
- Inferencia con pesos cuantizados a 8 bits para reducir requisitos de memoria y ancho de banda.
- Integración directa con el ecosistema transformers.js mediante `dtype: "q8"`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente ASR.
- No dispone de capacidades de visión, audio generativo ni modo de pensamiento.
- Multilingüismo limitado: únicamente danés.

## Casos de uso

- Asistentes de voz en navegador: Emkay utiliza este modelo como motor de transcripción de OpenVoiceOS en el cliente, de modo que la captura de voz del usuario se procesa localmente sin enviar audio a un servidor.
- Dictado web en danés: integración en editores o formularios mediante transformers.js para convertir voz en texto en tiempo real, aprovechando que el modelo se ejecuta en la propia pestaña.
- Subtitulado de reuniones o clases en danés: procesamiento por fragmentos de audio de 16 kHz en una aplicación web, con la ventaja de que los datos no salen del dispositivo del usuario.
- Aplicaciones de accesibilidad: control por voz y transcripción para usuarios con dificultades motoras en entornos web, sin dependencia de servicios externos de ASR.
- Prototipado rápido de interfaces de voz: al estar en formato ONNX y con licencia Apache 2.0, permite validar productos de voz en danés sin contratar APIs ni montar infraestructura GPU.
- Procesamiento por lotes offline en Node.js o navegador: transcripción de archivos de audio pregrabados con la versión cuantizada, útil para pipelines de documentación o archivística en danés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los resultados de pruebas del repositorio emkay-voice/stt-models (documento docs/danish.md), pero no se incluyen cifras de WER ni comparativas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un wav2vec2 base y distribuirse en 8 bits, el modelo cuantizado es apto para ejecución en CPU y en navegador.
- GPU recomendadas: no aplica para el caso de uso principal (inferencia en cliente); en servidor, cualquier GPU consumer es suficiente por el tamaño del modelo, aunque el autor no publica recomendaciones.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño base del modelo y la cuantización a 8 bits; no se especifican modelos concretos.
- Opciones de despliegue: transformers.js (caso de uso documentado); al ser ONNX, es compatible con runtimes ONNX en general, aunque el autor solo documenta transformers.js.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Emkay-Voice/alvenir-wav2vec2-base-da-onnx | no disponible (base) | no disponible | da | Apache 2.0 | ONNX (q8 y original) | Conversión para navegador vía transformers.js |
| Alvenir/wav2vec2-base-da-ft-nst | no disponible (base) | no disponible | da | Apache 2.0 (según modelo original) | safetensors/PyTorch | Modelo original del que deriva esta conversión |
| Otros ASR daneses de la familia wav2vec2 | no disponible | no disponible | da | variable | variable | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de WER ni cifras de rendimiento en la información facilitada.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe danés; el rendimiento con otros idiomas no está soportado ni documentado.
- No se han publicado métricas de calidad (WER) en la información disponible, por lo que no es posible evaluar su precisión frente a alternativas sin consultar el repositorio de pruebas del autor.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con audio ruidoso, acentos marcados o vocabulario técnico; no se documentan mitigaciones.
- Sesgos: no se dispone de información sobre la composición del corpus de entrenamiento original ni sobre sesgos demográficos o dialectales.
- Licencia: Apache 2.0 permite uso comercial, pero la model card advierte de que se aplican sin cambios las restricciones de la licencia original; conviene revisar los términos de Alvenir/wav2vec2-base-da-ft-nst antes de producción.
- Es una conversión de formato, no un modelo nuevo: cualquier limitación del modelo base se hereda íntegramente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera del proyecto Emkay.
- No soporta decodificación con modelo de lenguaje externo de forma documentada, lo que puede afectar a la calidad en comparación con pipelines ASR completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Emkay-Voice/alvenir-wav2vec2-base-da-onnx
- Modelo base: https://huggingface.co/Alvenir/wav2vec2-base-da-ft-nst
- Proyecto Emkay: https://github.com/emkay-voice/emkay
- Repositorio de conversión y pruebas: https://github.com/emkay-voice/stt-models
- Resultados de pruebas en danés: https://github.com/emkay-voice/stt-models/blob/main/docs/danish.md#a-light-model
- transformers.js: https://github.com/huggingface/transformers.js
- optimum: https://github.com/huggingface/optimum
