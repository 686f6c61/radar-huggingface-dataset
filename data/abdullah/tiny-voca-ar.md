# abdullah/tiny-voca-ar

## Resumen

tiny-voca-ar es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno desarrollado por el usuario abdullah, publicado bajo licencia Apache-2.0. Se trata de un port al árabe del modelo tiny-voca de Muhammed Nazeem, del que reutiliza la arquitectura y la receta de entrenamiento, sustituyendo las piezas específicas de idioma por un front end basado en reglas que convierte texto totalmente vocalizado (con tashkeel) en fonemas, un profesor de síntesis en árabe y un proceso de cribado específico para árabe.

El modelo es extremadamente pequeño: 4.537.867 parámetros, entrenado desde cero sin pesos preentrenados durante 79.955 pasos. Genera audio mono a 24 kHz y está pensado para leer texto árabe estándar moderno que incluya diacríticos completos; el front end se encarga de deletrear dígitos, números de teléfono, fechas, identificadores de pedido e IBAN. Su relevancia radica en que demuestra que es posible obtener una calidad de vocalización cercana a la del profesor con un modelo de apenas 4,5 millones de parámetros, lo que abre la puerta a TTS árabe en dispositivos con recursos muy limitados.

No obstante, el propio autor advierte de que el modelo no está autorizado para uso con clientes: la cuestión de los derechos sobre la voz de referencia sigue abierta y un hablante nativo aún no ha completado la puerta de evaluación H4. Además, esta versión solo tiene entrenada la voz masculina `M2`; la ranura `F2` no está entrenada y produce ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (port de tiny-voca; sin detalle de bloques en la model card) |
| Parametros totales | 4.537.867 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint float32 y export ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | árabe estándar moderno (ar) |
| Licencia | Apache-2.0 (con atribuciones CC BY 4.0 en NOTICE.md) |
| Formato de pesos | PyTorch `.pt` (float32) y ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del transformer ni los bloques concretos; indica únicamente que es un port del modelo tiny-voca de Muhammed Nazeem, con la misma arquitectura y la misma receta de entrenamiento, y que las piezas nuevas son específicas de idioma: un front end basado en reglas que transforma texto con tashkeel completo en fonemas, un profesor de síntesis en árabe y un cribado en árabe. El modelo se entrenó desde cero, sin pesos preentrenados, durante 79.955 pasos.

El corpus de entrenamiento se generó con el profesor, que produjo 6.179 clips (aproximadamente 12,12 horas de voz sintética) que superaron todas las comprobaciones de cribado. De ellos, el modelo se entrenó con 5.968; el resto falló la alineación de fonemas o se reservó para validación. El modelo lee los diacríticos tal como están escritos y rechaza el texto sin tashkeel (error `needs_tashkeel`); esta versión no incluye diacritizador. La velocidad por defecto de 1.0 sigue el ritmo del profesor y suena lenta; con `--speed 1.3` se alcanzan unas 13,6 fonemas por segundo, el ritmo del narrador humano.

## Capacidades

- Síntesis de voz en árabe estándar moderno a partir de texto totalmente diacritizado.
- Salida de audio mono a 24 kHz.
- Voz masculina única `M2` (la ranura `F2` existe en el checkpoint pero no está entrenada).
- Front end que deletrea dígitos, números de teléfono, fechas, identificadores de pedido e IBAN.
- Control de velocidad de habla mediante el parámetro `--speed`.
- Inferencia en PyTorch y en ONNX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente TTS.
- No soporta visión ni audio de entrada; solo texto como entrada.
- No incluye diacritizador: el texto debe llegar ya vocalizado y revisado.

## Casos de uso

- Lectura de texto árabe vocalizado en aplicaciones educativas: el modelo puede narrar material didáctico con tashkeel completo, útil para enseñanza de lectura y pronunciación del árabe estándar moderno, con la salvedad de que la voz `M2` es la única disponible.
- Anuncios y avisos con números y fechas: gracias al front end que deletrea dígitos, teléfonos, fechas e identificadores de pedido, encaja en sistemas de avisos donde el texto incluye datos numéricos que deben leerse correctamente (67/67 aciertos en la evaluación de dígitos).
- Pruebas de concepto de TTS en árabe en dispositivos con recursos limitados: con 4,5 millones de parámetros y export ONNX, es adecuado para prototipos en entornos con poca memoria o sin GPU dedicada.
- Generación de audio para accesibilidad en interfaces árabes: lectura en voz alta de contenido ya vocalizado en aplicaciones de lectura o asistentes, siempre que se revise previamente el tashkeel.
- Investigación y experimentación con TTS de bajo coste: sirve como base para estudiar el efecto del tamaño del modelo y del cribado en la calidad de vocalización, comparando con el profesor SILMA.
- Integración en pipelines de datos sintéticos: al ser un modelo pequeño y con export ONNX, puede generar clips de voz para aumentar datasets de ASR en árabe, aunque con la advertencia de que la voz de referencia tiene derechos pendientes de aclarar.

## Benchmarks y rendimiento

Los dos modelos leyeron las mismas 43 frases del conjunto fijo de evaluación (`tiny_voca.evalset`), con tipos cortos, medios, largos, números, teléfonos, fechas, identificadores de pedido y otros. Ninguna frase de evaluación está en el corpus de entrenamiento.

| Comprobacion | Estudiante (este modelo) | Profesor (SILMA, misma voz) |
|---|---|---|
| WER con Whisper large-v3-turbo, sin diacríticos | 0,0532 | 0,07 |
| Juez 1: vocales escritas que el reconocedor de fonemas oye como escritas | 99,13% (1363/1375) | 98,98% (1361/1375) |
| Juez 2: vocales que concuerdan con un ASR árabe diacritizador | 98,87% (703/711) | 98,39% (673/684) |
| Dígitos reconocidos correctamente (teléfonos e identificadores de pedido) | 67/67 | 65/67 |
| Pares mínimos de harakat (H3 para el estudiante, H2 para el profesor) | 98,91% (91/92, 0 indecidibles) | 97,83% (90/92, 0 indecidibles) |

Puertas de publicación verificadas por `scripts/release.py`:

| Puerta | Resultado | Medido |
|---|---|---|
| dígitos 100% en casos de teléfono e identificador de pedido | pasa | 67/67 |
| pares mínimos H3 >= 98% | pasa | 91/92 |
| WER dentro de 2 puntos del profesor | pasa | estudiante 0,0532 vs profesor 0,07 |

Notas de lectura de los números: el Juez 1 es `facebook/wav2vec2-lv-60-espeak-cv-ft` (CTC) y marca una vocal como dudosa cuando otra puntúa mejor que la escrita por más de 1 unidad logarítmica; tiene falsas alarmas conocidas (3 en 89 clips limpios durante su calibración). El Juez 2 es `NightPrince/stt-arabic-whisper-finetuned-diactires`, un Whisper-small que escribe tashkeel, y parte de sus discrepancias son convenciones ortográficas y no vocales incorrectas. La model card se interrumpe en la descripción del Juez 2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card; con 4.537.867 parámetros en float32, el checkpoint ocupa del orden de decenas de MB, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna es sobradamente suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: PyTorch (checkpoint `tiny-voca-ar.pt`), ONNX (`onnx/model.onnx`, verificado contra el modelo PyTorch) y el paquete Python `tiny_voca` (versión 0.2.0, wheel incluido en `code/`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que con `--speed 1.3` se leen unas 13,6 fonemas por segundo, el ritmo del narrador humano.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS árabes en la información proporcionada para establecer una comparativa de parámetros, contexto, rendimiento y licencia. La única comparación documentada es contra el profesor SILMA con la misma voz, recogida en la tabla de benchmarks: el estudiante obtiene WER 0,0532 frente a 0,07 del profesor, 67/67 frente a 65/67 en dígitos y 91/92 frente a 90/92 en pares mínimos de harakat.

## Limitaciones y advertencias

- No autorizado para uso con clientes: la cuestión de los derechos sobre la voz de referencia sigue abierta.
- Un hablante nativo aún no ha completado la puerta de evaluación H4.
- Solo está entrenada la voz masculina `M2`; la ranura `F2` no está entrenada y genera ruido. Es obligatorio pasar `--voice M2`.
- La velocidad por defecto de 1.0 suena lenta; se recomienda `--speed 1.3`.
- El texto sin tashkeel se rechaza (`needs_tashkeel`); esta versión no incluye diacritizador, por lo que el texto debe vocalizarse y revisarse antes de la síntesis.
- El modelo lee los diacríticos tal como están escritos, de modo que errores en el tashkeel se reflejan en la pronunciación.
- Riesgo de alucinación acústica y de errores de vocalización: los jueces automáticos tienen falsos positivos y negativos conocidos (por ejemplo, 3 falsas alarmas en 89 clips limpios del Juez 1).
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0, con atribuciones CC BY 4.0 recogidas en NOTICE.md; conviene revisarlas antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card está incompleta en la sección de evaluación (se interrumpe al describir el Juez 2).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdullah/tiny-voca-ar
- Dataset: https://huggingface.co/datasets/abdullah/tiny-voca-ar
- Repositorio original tiny-voca: https://github.com/n4ze3m/tiny-voca
- Paper citado en los tags (arXiv:2303.00069): https://arxiv.org/abs/2303.00069
- Juez 1: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Juez 2: https://huggingface.co/NightPrince/stt-arabic-whisper-finetuned-diactires
- Muestras de audio: https://huggingface.co/abdullah/tiny-voca-ar/resolve/main/samples/M2-short.wav, https://huggingface.co/abdullah/tiny-voca-ar/resolve/main/samples/M2-medium.wav, https://huggingface.co/abdullah/tiny-voca-ar/resolve/main/samples/M2-phone.wav
