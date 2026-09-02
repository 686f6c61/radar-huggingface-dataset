# mohamedrayyan/mms-tts-dhivehi-spk01-f01

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-spk01-f01` es un sistema de síntesis de voz (text-to-speech) para el idioma dhivehi, la lengua oficial de Maldivas. Se trata de un fine-tune del checkpoint `facebook/mms-tts-div`, que forma parte del proyecto Massively Multilingual Speech (MMS) de Meta AI, basado en la arquitectura VITS. El modelo ha sido desarrollado por mohamedrayyan dentro del proyecto Dhivehi TTS, que publica varias voces (femeninas, masculinas y clonadas) para este idioma de bajos recursos.

Con 36,2 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en que proporciona una solución de TTS funcional para un idioma con escasa representación en el ecosistema de IA, permitiendo aplicaciones de accesibilidad, asistentes de voz y herramientas educativas en dhivehi. La licencia MIT facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (VAE + flow normalizador + transformador) |
| Parametros totales | 36.287.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto largo) |
| Tipos de cuantizacion | se mencionan exports cuantizados, sin especificar tipos |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible export ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz que combina un codificador de texto, un decodificador de audio y un flujo normalizador, todo entrenado de forma conjunta mediante un objetivo de reconstrucción de onda. El checkpoint original `facebook/mms-tts-div` fue preentrenado por Meta AI para el idioma dhivehi dentro del proyecto MMS, que cubre más de mil lenguas. El fine-tune realizado por mohamedrayyan adapta el modelo a una voz específica (voz femenina clonada, identificada como spk01-f01) utilizando datos propios del proyecto Dhivehi TTS.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El proyecto publica además variantes con otras voces (femeninas, masculinas y clonadas) y exports cuantizados y ONNX, lo que sugiere un esfuerzo por facilitar el despliegue en diferentes entornos.

## Capacidades

- Sintesis de voz en dhivehi a partir de texto, con normalizacion de texto integrada para manejar formatos variados (numeros, abreviaturas, etc.).
- Soporte de multiples voces: el repositorio incluye variantes femeninas, masculinas y clonadas, aunque este checkpoint concreto corresponde a una voz femenina clonada.
- Export a ONNX y versiones cuantizadas, lo que permite inferencia en entornos con recursos limitados.
- Integracion sencilla con la libreria `transformers` de Hugging Face mediante `VitsModel` y `AutoTokenizer`.
- Compatible con el ecosistema de Spaces de Hugging Face, con una demo publica disponible.

## Casos de uso

- Lectura de contenido web en dhivehi: el modelo puede integrarse en extensiones de navegador o aplicaciones de lectura para convertir articulos y noticias en audio, mejorando la accesibilidad para personas con discapacidad visual o dificultades de lectura.
- Asistentes de voz en dhivehi: al ser un modelo ligero, puede ejecutarse en dispositivos moviles o embebidos para proporcionar respuestas habladas en aplicaciones de asistencia personal o domotica.
- Audiobooks y narracion de textos largos: la voz femenina clonada ofrece una entonacion natural, adecuada para generar audiolibros o narraciones de contenido educativo en dhivehi.
- Herramientas de aprendizaje de idiomas: el modelo puede utilizarse en aplicaciones de ensenanza del dhivehi para pronunciar palabras y frases, ayudando a estudiantes a mejorar su comprension auditiva.
- Sistemas de informacion publica: integracion en paneles informativos, estaciones de transporte o servicios de atencion al ciudadano en Maldivas para anunciar mensajes en dhivehi.
- Pruebas de concepto y prototipado: gracias a su tamano reducido y licencia permisiva, es adecuado para experimentar con TTS en dhivehi en entornos de investigacion o desarrollo rapido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas objetivas como MOS (Mean Opinion Score) o comparaciones con otros sistemas TTS para dhivehi.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantizacion FP32; con cuantizacion a 8 bits o 4 bits, puede ejecutarse en CPU sin GPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). Tambien funciona en CPU con tiempos de inferencia aceptables para frases cortas.
- Compatible con hardware de consumo: si, cabe en Raspberry Pi 4 o similar si se usa la version cuantizada u ONNX.
- Opciones de despliegue: `transformers` (Python), ONNX Runtime, y potencialmente `llama.cpp` si se convierte a GGUF (no confirmado en la documentacion).
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por token de audio en GPU, y de unos pocos segundos para frases completas en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohamedrayyan/mms-tts-dhivehi-spk01-f01` | 36,2 M | no disponible | dv | MIT | Hugging Face |
| `facebook/mms-tts-div` (modelo base) | 36,2 M (aprox.) | no disponible | dv | CC-BY-NC 4.0 (segun MMS) | Hugging Face |
| `mohamedrayyan/mms-tts-dhivehi-ft-spk01-f01` (variante fine-tune) | 36,2 M | no disponible | dv | MIT | Hugging Face |

No se dispone de otros modelos TTS comerciales o de codigo abierto especificos para dhivehi en la informacion recopilada. La comparativa se limita al modelo base y a las variantes del mismo proyecto.

## Limitaciones y advertencias

- El modelo esta limitado al idioma dhivehi; no soporta otros idiomas ni mezclas de codigo.
- La voz es una clonacion de un unico locutor femenino; puede no representar la diversidad de acentos o registros del dhivehi.
- No se han publicado evaluaciones de calidad de audio ni pruebas de robustez ante ruido o entradas mal formadas.
- La normalizacion de texto puede fallar con formatos complejos (fechas, numeros grandes, siglas) si no se preprocesa adecuadamente.
- La licencia MIT permite uso comercial, pero el modelo base `facebook/mms-tts-div` puede tener restricciones adicionales (CC-BY-NC 4.0); es necesario verificar los terminos del modelo original antes de un despliegue comercial.
- Al ser un modelo de 36M parametros, la calidad de la voz puede ser inferior a la de sistemas TTS grandes como VALL-E o Bark, especialmente en entonacion y expresividad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-spk01-f01
- Modelo base: https://huggingface.co/facebook/mms-tts-div
- Proyecto Dhivehi TTS: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Organizacion dhivehi.ai en GitHub: https://github.com/DhivehiAI
- Documentacion de TTS en dhivehi.ai: https://dhivehi.ai/docs/technologies/tts/
