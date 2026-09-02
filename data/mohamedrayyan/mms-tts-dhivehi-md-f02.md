# mohamedrayyan/mms-tts-dhivehi-md-f02

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-md-f02` es un sistema de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de las Maldivas. Se trata de un checkpoint fine-tuneado a partir del modelo base `facebook/mms-tts-div`, desarrollado por Meta dentro del proyecto Massively Multilingual Speech (MMS). El autor, mohamedrayyan, lo ha entrenado como parte del proyecto Dhivehi TTS, que busca ofrecer voces naturales y de calidad para una lengua con escasos recursos digitales.

El modelo utiliza la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), que combina un codificador de texto, un decodificador basado en flujos normalizadores y un discriminador adversarial para generar audio de forma directa. Con 36,3 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Esta variante concreta corresponde a una voz femenina (f02), y el repositorio incluye otras variantes con voces masculinas y femeninas adicionales, así como versiones cuantizadas y exportaciones ONNX.

La relevancia de este modelo radica en que cubre una necesidad específica: la generación de voz en dhivehi, un idioma con muy poca representación en los sistemas comerciales de TTS. Al estar publicado con licencia MIT, puede integrarse libremente en aplicaciones comerciales y de investigación, lo que lo convierte en un recurso valioso para desarrolladores que trabajan en accesibilidad, asistentes de voz o contenidos audiovisuales en esa lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training) |
| Parametros totales | 36.287.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz) |
| Tipos de cuantizacion | No disponible (se mencionan exportaciones cuantizadas y ONNX, sin especificar el formato) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (también disponible en ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz de extremo a extremo que integra un codificador de texto, un decodificador basado en flujos normalizadores y un discriminador adversarial. VITS aprende a mapear directamente secuencias de texto a formas de onda, sin necesidad de vocoders externos, lo que simplifica el pipeline de inferencia. El checkpoint parte de `facebook/mms-tts-div`, el modelo MMS preentrenado para dhivehi, y ha sido fine-tuneado con datos específicos del proyecto Dhivehi TTS.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni el proceso de ajuste (si se usó RLHF, DPO u otras técnicas). El autor indica que el modelo forma parte de un proyecto más amplio que incluye varias voces (femeninas, masculinas y clonadas) y que también se han publicado versiones cuantizadas y ONNX para facilitar el despliegue. La arquitectura VITS es conocida por su eficiencia y calidad de audio, aunque no se dispone de métricas objetivas específicas para este checkpoint.

## Capacidades

- Generación de voz en dhivehi a partir de texto, con una voz femenina natural.
- Conversión de texto arbitrario en audio, siempre que el texto esté correctamente tokenizado.
- Soporte para inferencia en tiempo real o casi tiempo real gracias al tamaño reducido del modelo.
- Compatibilidad con el ecosistema Hugging Face Transformers mediante `VitsModel` y `AutoTokenizer`.
- Disponibilidad de variantes adicionales (otras voces femeninas, masculinas, clonadas) y formatos optimizados (cuantizado, ONNX) para distintos entornos de despliegue.
- No incluye capacidades de razonamiento, código, visión ni tool calling, ya que es un modelo puramente de síntesis de voz.

## Casos de uso

- Atención al cliente automatizada en dhivehi: el modelo puede integrarse en sistemas IVR o chatbots para leer respuestas en voz alta, ofreciendo un canal de comunicación accesible para hablantes de dhivehi en sectores como telecomunicaciones o banca.
- Accesibilidad para personas con discapacidad visual: permite convertir artículos, noticias o documentos en dhivehi a audio, facilitando el acceso a la información a través de lectores de pantalla o aplicaciones de lectura.
- Audiolibros y contenidos educativos: puede utilizarse para generar versiones en audio de libros de texto, cuentos o materiales didácticos en dhivehi, reduciendo el coste de producción frente a la grabación humana.
- Asistentes de voz para dispositivos domésticos: al ser un modelo ligero, puede desplegarse en dispositivos de bajo consumo (Raspberry Pi, móviles) para construir asistentes que respondan en dhivehi.
- Generación de contenido multimedia: creadores de vídeo, podcasts o anuncios pueden usar el modelo para añadir locuciones en dhivehi sin necesidad de un estudio de grabación.
- Investigación lingüística y preservación del idioma: el modelo sirve como herramienta para estudiar la fonética del dhivehi y para generar corpus de audio sintético que apoyen otros desarrollos de NLP en esta lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas como MOS (Mean Opinion Score) o comparaciones con otros sistemas TTS para dhivehi en la documentación del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 36,3 millones de parámetros, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM. En GPU, la VRAM necesaria es inferior a 1 GB incluso en precisión completa.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También es viable en hardware de gama baja.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, e incluso en CPUs sin GPU dedicada.
- Opciones de despliegue: se puede usar directamente con la librería `transformers` de Hugging Face, o exportar a ONNX para entornos de producción. También existen versiones cuantizadas que reducen aún más el footprint.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por frase en GPU y de unos cientos de milisegundos en CPU, suficiente para aplicaciones interactivas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohamedrayyan/mms-tts-dhivehi-md-f02` | VITS | 36,3 M | No aplica | MIT | Hugging Face |
| `facebook/mms-tts-div` (base) | VITS | 36,3 M (aprox.) | No aplica | CC-BY-NC 4.0 (según MMS) | Hugging Face |
| `dhivehihacker/tts-dhivehi-demo-mms` (demo) | VITS | No especificado | No aplica | No especificada | Hugging Face Space |

El modelo fine-tuneado se diferencia del base en que ha sido ajustado con datos específicos del proyecto Dhivehi TTS, lo que probablemente mejora la naturalidad y la pronunciación en comparación con el modelo genérico de Meta. La licencia MIT del fine-tune permite uso comercial sin restricciones, mientras que el modelo base de MMS tiene una licencia no comercial (CC-BY-NC 4.0), un punto importante a considerar si se planea integrar el modelo en productos comerciales.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para dhivehi; no soporta otros idiomas.
- No se ha optimizado para el manejo de números, fechas o símbolos especiales; el repositorio del proyecto advierte que se requiere fonemización adicional para estos casos.
- Puede presentar errores de pronunciación en palabras poco frecuentes, nombres propios o términos técnicos, dado el limitado corpus de entrenamiento disponible para dhivehi.
- No se han publicado evaluaciones de sesgos de género, edad o dialecto; aunque existen variantes de voz femenina y masculina, no hay garantía de representatividad de todos los acentos del dhivehi.
- La licencia MIT permite uso comercial, pero el modelo base de MMS tiene una licencia no comercial; si se redistribuye el modelo fine-tuneado, se debe verificar que no se infrinjan los términos del modelo original.
- No se dispone de información sobre la calidad del audio en términos de MOS u otras métricas subjetivas, por lo que se recomienda realizar pruebas de escucha antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-md-f02
- Modelo base: https://huggingface.co/facebook/mms-tts-div
- Proyecto Dhivehi TTS (repositorio principal): https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Repositorio de demos en GitHub: https://github.com/DhivehiAI/TTS-Demos
- Organización DhivehiAI en GitHub: https://github.com/DhivehiAI
