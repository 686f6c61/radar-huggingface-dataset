# mohamedrayyan/mms-tts-div-finetuned-md-f01

## Resumen

El modelo `mohamedrayyan/mms-tts-div-finetuned-md-f01` es un checkpoint de síntesis de voz (text-to-speech) en dhivehi, la lengua oficial de las Maldivas, obtenido mediante fine-tuning del modelo base `facebook/mms-tts-div` de Meta. Este base pertenece al proyecto Massively Multilingual Speech (MMS), que amplía la tecnología de voz a más de 1.000 idiomas. El fine-tuning se ha realizado dentro del proyecto "Dhivehi TTS" del autor, con el objetivo de producir una voz femenina concreta (identificador `md-f01`).

El modelo utiliza una arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), que combina un codificador de texto, un decodificador de audio y un discriminador adversarial. Con 36,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero y adecuado para despliegue en entornos con recursos limitados. Su relevancia radica en cubrir un idioma de bajos recursos como el dhivehi, donde las soluciones comerciales de TTS son escasas, y en ofrecer una voz femenina natural tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training) |
| Parametros totales | 36.287.472 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible en el repositorio; se mencionan exports cuantizados y ONNX en el proyecto |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien se publican exports ONNX y cuantizados en el proyecto) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, un sistema end-to-end de text-to-speech que integra un codificador de texto, un decodificador de audio basado en flujos normalizadores y un discriminador adversarial. El checkpoint original `facebook/mms-tts-div` fue preentrenado por Meta dentro del proyecto MMS, que cubre más de 1.000 idiomas. El fine-tuning realizado por el autor se centra en una voz femenina específica (identificador `md-f01`), probablemente mediante ajuste supervisado con datos de habla de una locutora concreta. No se dispone de detalles sobre el dataset de entrenamiento, el número de pasos, ni el uso de técnicas como RLHF o DPO. El proyecto publica además variantes con otras voces (femeninas, masculinas y clonadas) y exports cuantizados y ONNX para facilitar el despliegue.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto: convierte cadenas de texto en audio hablado.
- Generación de audio con una voz femenina concreta (identificador `md-f01`), resultado del fine-tuning.
- Integración con la librería `transformers` de Hugging Face mediante `VitsModel` y `AutoTokenizer`.
- Soporte de inferencia sin GPU (funciona en CPU) gracias a su tamaño reducido.
- Posibilidad de exportar a ONNX y cuantizar para entornos de producción con restricciones de memoria.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio más allá de la síntesis de voz.

## Casos de uso

- Lectura de textos en dhivehi para aplicaciones de accesibilidad: el modelo puede convertir artículos, libros o noticias en audio, permitiendo a personas con discapacidad visual o dificultades de lectura acceder a contenido en su idioma nativo.
- Asistentes de voz locales: integración en asistentes virtuales o chatbots que respondan en dhivehi, generando respuestas habladas a partir de texto generado por un modelo de lenguaje.
- Aplicaciones educativas: generación de material de audio para aprender dhivehi, como pronunciación de palabras o frases, útil en cursos de idiomas.
- Sistemas de navegación y avisos en transporte público: conversión de mensajes de texto en anuncios de voz en dhivehi para estaciones, aeropuertos o vehículos.
- Audiolibros y podcasts automatizados: producción de contenido hablado en dhivehi a partir de texto escrito, reduciendo costes frente a locutores humanos.
- Pruebas de accesibilidad web: generación de versiones de audio de páginas web o documentos para cumplir requisitos de accesibilidad en regiones donde se habla dhivehi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `facebook/mms-tts-div` forma parte del proyecto MMS, que reporta métricas generales de calidad de voz para cientos de idiomas, pero no se dispone de datos específicos para este checkpoint fine-tuned. No se pueden comparar métricas objetivas como MOS (Mean Opinion Score) o WER sin datos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 36 millones de parámetros, la inferencia en GPU requiere menos de 1 GB de VRAM en precisión FP32; con cuantización puede reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) es suficiente. También funciona en CPU sin problemas, con latencia aceptable para frases cortas.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, o exportar a ONNX para entornos de producción. También se mencionan exports cuantizados en el proyecto.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y de la longitud del texto de entrada. En CPU, una frase de 10 palabras puede tardar entre 1 y 3 segundos; en GPU, menos de 0,5 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohamedrayyan/mms-tts-div-finetuned-md-f01` | 36,3 M | no aplica | dv | MIT | Hugging Face |
| `facebook/mms-tts-div` (base) | 36,3 M (aprox.) | no aplica | dv | CC-BY-NC 4.0 (según MMS) | Hugging Face |
| `facebook/mms-tts` (multilingüe) | 36,3 M (aprox.) | no aplica | >1.000 | CC-BY-NC 4.0 | Hugging Face |

El modelo fine-tuned se diferencia del base en que ha sido ajustado para una voz femenina concreta, lo que puede mejorar la naturalidad y consistencia de la voz en comparación con la voz genérica del base. No se dispone de otros modelos TTS comerciales o abiertos específicos para dhivehi con los que comparar directamente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dhivehi; no es adecuado para otros idiomas.
- La calidad de la voz depende del dataset de fine-tuning, que no está documentado; puede presentar artefactos o falta de naturalidad en ciertos contextos.
- Riesgo de alucinación fonética: el modelo puede producir pronunciaciones incorrectas para palabras fuera de su vocabulario de entrenamiento, especialmente nombres propios o términos técnicos.
- La licencia MIT permite uso comercial, pero el modelo base `facebook/mms-tts-div` tiene licencia CC-BY-NC 4.0 (no comercial). Es necesario verificar si el fine-tuning hereda restricciones del modelo base; el autor declara MIT, pero conviene revisar los términos del proyecto MMS.
- No se proporcionan métricas de evaluación objetivas (MOS, WER) para este checkpoint, por lo que la calidad percibida debe validarse en el caso de uso concreto.
- El modelo no soporta control de prosodia, velocidad o emoción; solo genera audio a partir de texto plano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamedrayyan/mms-tts-div-finetuned-md-f01
- Proyecto Dhivehi TTS (repositorio del autor): https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Modelo base `facebook/mms-tts-div`: https://huggingface.co/facebook/mms-tts-div
- Documentación del proyecto MMS en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md
- Repositorio fairseq (ejemplos MMS): https://github.com/facebookresearch/fairseq/tree/main/examples/mms
