# mohamedrayyan/mms-tts-dhivehi-md-f01

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-md-f01` es un checkpoint de síntesis de voz (text-to-speech) en dhivehi, la lengua oficial de las Maldivas, desarrollado por el autor mohamedrayyan como parte del proyecto Dhivehi TTS. Se trata de un ajuste fino (fine-tuning) del modelo base `facebook/mms-tts-div`, que pertenece a la familia Massively Multilingual Speech (MMS) de Meta AI y emplea la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). El modelo genera audio de voz femenina (variante f01) a partir de texto en dhivehi, y se distribuye bajo licencia MIT.

Con 36,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero que puede ejecutarse en hardware modesto, incluso en CPU. Su relevancia radica en que cubre un idioma de bajos recursos como el dhivehi, para el que existen pocas soluciones TTS de código abierto. El proyecto publica además variantes adicionales de voz (femeninas, masculinas y clonadas) y exportaciones cuantizadas y ONNX, lo que facilita su despliegue en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa secuencias de texto largas de forma autoregresiva) |
| Tipos de cuantizacion | no disponible (se menciona una exportacion cuantizada en el proyecto, pero no se especifican los formatos) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien se publica una exportacion ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, un sistema TTS de extremo a extremo que combina un codificador de texto, un decodificador de flujo normalizador y un discriminador adversarial, todo entrenado de forma conjunta. VITS produce audio de alta calidad sin necesidad de vocoder externo, ya que el decodificador genera directamente la forma de onda. El checkpoint parte de los pesos preentrenados de `facebook/mms-tts-div`, que a su vez forma parte del proyecto MMS de Meta, entrenado con datos multilingües de la Biblia y otros textos religiosos. El ajuste fino se realizó específicamente para la lengua dhivehi, aunque no se han publicado detalles sobre el corpus de entrenamiento, el número de horas de audio ni el procedimiento exacto (si se usó fine-tuning supervisado, RLHF u otra técnica). El autor indica que el modelo forma parte del proyecto Dhivehi TTS, con repositorio asociado `mohamedrayyan/chatterbox-tts-dhivehi`.

## Capacidades

- Sintesis de voz en dhivehi a partir de texto, con voz femenina (variante f01).
- Integracion con la libreria `transformers` de HuggingFace mediante las clases `VitsModel` y `AutoTokenizer`.
- Generacion de audio en formato waveform (tensor de PyTorch) listo para guardar como archivo WAV.
- El proyecto publica multiples variantes de voz: femeninas (f01, f02, f03), masculina (m01) y voces clonadas (spk01-f01, spk01-m01), lo que permite elegir el timbre segun la aplicacion.
- Disponibilidad de exportaciones cuantizadas y ONNX para despliegue en entornos sin PyTorch o con restricciones de recursos.
- Soporte de fonemizacion basica para dhivehi, aunque con limitaciones para numeros, fechas y otros simbolos especiales (segun la documentacion del proyecto).

## Casos de uso

- Audiolibros y narracion de contenido en dhivehi: el modelo puede convertir articulos, cuentos o noticias en audio, facilitando el acceso a la lectura para personas con discapacidad visual o para quienes prefieren escuchar. Su tamano reducido permite ejecutarlo en servidores modestos o incluso en dispositivos locales.
- Asistentes de voz para servicios publicos en Maldivas: integrado en un sistema de respuesta de voz interactiva (IVR) para consultas de horarios, tramites o informacion turistica, generando respuestas habladas en dhivehi de forma automatica.
- Aplicaciones educativas de aprendizaje de idiomas: el modelo puede pronunciar palabras y frases en dhivehi para estudiantes extranjeros, complementando materiales escritos con audio de referencia.
- Doblaje de contenido multimedia: con las variantes de voz disponibles, se puede generar locucion para videos, presentaciones o anuncios en dhivehi sin necesidad de actores de voz humanos.
- Accesibilidad en aplicaciones moviles: integrado en un lector de pantalla o en una app de mensajeria que lea en voz alta los mensajes recibidos en dhivehi, mejorando la experiencia de usuarios con dificultades de lectura.
- Generacion de contenido para redes sociales o podcasts: los creadores pueden producir audio en dhivehi de forma rapida y economica, usando las distintas voces para diferenciar personajes o secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros sistemas TTS para dhivehi.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 36,3 millones de parametros y un peso de aproximadamente 0,1 GB en safetensors. En FP32, la inferencia requiere menos de 1 GB de VRAM; en CPU, el uso de RAM es similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050, o incluso integradas como Intel Iris Xe). No se requieren GPUs de alta gama como A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer actual, incluidas las de gama de entrada.
- Opciones de despliegue: se puede ejecutar con la libreria `transformers` de HuggingFace en Python, o mediante la exportacion ONNX para entornos de inferencia como ONNX Runtime. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que son herramientas orientadas a modelos de lenguaje, no a TTS.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por frase en GPU y de unos pocos cientos de milisegundos en CPU, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos TTS especificos para dhivehi con los que comparar directamente. El modelo base `facebook/mms-tts-div` es el punto de referencia natural, ya que este checkpoint es un ajuste fino del mismo. La comparacion con otros sistemas multilingues como Coqui TTS o Piper no es posible sin datos de rendimiento publicados.

| Modelo | Parametros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| `mohamedrayyan/mms-tts-dhivehi-md-f01` | 36,3 M | dv | MIT | Ajuste fino de MMS para dhivehi, voz femenina |
| `facebook/mms-tts-div` | no disponible | dv (y otros) | CC-BY-NC 4.0 (segun el proyecto MMS) | Modelo base preentrenado, sin ajuste especifico para dhivehi |
| Otros modelos TTS multilingues (p.ej. Piper) | no disponible | varios | MIT (Piper) | No se ha confirmado soporte para dhivehi |

## Limitaciones y advertencias

- El modelo requiere fonemizacion adicional para numeros, fechas y otros simbolos especiales, segun la documentacion del proyecto. Sin ese preprocesamiento, la pronunciacion puede ser incorrecta.
- No esta optimizado para la retractacion (detener la generacion de audio en medio de una frase), lo que puede afectar a aplicaciones que necesiten interrumpir la reproduccion.
- Al ser un ajuste fino de un modelo entrenado principalmente con textos religiosos (la base MMS), puede presentar sesgos en el vocabulario o en el estilo de habla, con una cobertura limitada de lenguaje coloquial o tecnico.
- El corpus de entrenamiento del ajuste fino no se ha documentado, por lo que se desconoce la diversidad de hablantes, acentos y condiciones de grabacion.
- No se han publicado evaluaciones de calidad subjetiva (MOS) ni de inteligibilidad, por lo que el rendimiento real en entornos ruidosos o con habla rapida no esta verificado.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base `facebook/mms-tts-div` puede tener su propia licencia (CC-BY-NC 4.0 en el proyecto MMS original), lo que podria generar conflictos legales si se redistribuye el modelo base o se usan sus pesos directamente. Conviene revisar los terminos de la licencia del modelo base antes de un despliegue comercial.
- El modelo solo soporta dhivehi; no es util para otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-md-f01
- Repositorio del proyecto Dhivehi TTS: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Modelo base: https://huggingface.co/facebook/mms-tts-div
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Repositorio de demos TTS de DhivehiAI: https://github.com/DhivehiAI/TTS-Demos
- Organizacion DhivehiAI en GitHub: https://github.com/DhivehiAI
- Documentacion de TTS en dhivehi.ai: https://dhivehi.ai/docs/technologies/tts/
- Documentacion de TTS en Dhavana: https://dhavana.com/docs/text-to-speech
