# ga642381/OmniVoice-Taigi-SuiSiann

## Resumen

OmniVoice-Taigi-SuiSiann es un modelo de síntesis de voz (text-to-speech) especializado en taigi, la variedad de hokkien (min nan) hablada en Taiwán. Lo desarrolla el usuario ga642381 como un ajuste fino del modelo base OmniVoice de k2-fsa, entrenado sobre el corpus SuíSiann, una colección de audio de una única hablante, Ông Siù-iông (王秀容). El modelo recibe texto en romanización Tâi-lô y genera audio a 24 kHz.

El modelo resuelve un problema concreto: la escasez de herramientas de síntesis de voz de calidad para una lengua minoritaria con pocos recursos digitales como el taigi. Frente a los TTS multilingües genéricos, que suelen cubrir el mandarín pero no el hokkien taiwanés, este ajuste fino proporciona una voz específica y una fonética adaptada a la romanización Tâi-lô.

Con aproximadamente 612 millones de parámetros y un peso de repositorio de 2,5 GB, es un modelo de tamano medio que puede ejecutarse en GPU de consumo. Su relevancia actual reside en la preservación y digitalización de lenguas minoritarias y en la disponibilidad de un pipeline TTS reproducible con licencia CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniVoice (modelo base k2-fsa/OmniVoice), ajuste fino; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card usa float16 en CUDA) |
| Idiomas soportados | nan (min nan / taigi / hokkien taiwanes) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del modelo OmniVoice de k2-fsa, del que no se detalla la arquitectura interna en la informacion disponible. El ajuste se realizo sobre el corpus SuíSiann, un conjunto de audio de una sola hablante grabado por Ông Siù-iông. El modelo trabaja con texto de entrada en romanización Tâi-lô y produce audio a 24 kHz.

Un detalle tecnico relevante es que OmniVoice requiere una grabacion de referencia en cada llamada de sintesis: el modelo continua hablando con la voz de esa referencia. El repositorio incluye una grabacion de referencia junto con su transcripcion en Tâi-lô (archivos `ref/ref.wav` y `ref/ref.json`). La model card indica que el ajuste fino se realizo sin la etapa de denoise, por lo que debe desactivarse (`denoise=False`) para no degradar la salida. Tambien se especifica el uso de 32 pasos de inferencia (`num_step=32`) y la normalizacion Unicode NFC del texto de entrada. No se detallan el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz a partir de texto en romanizacion Tâi-lô, con salida a 24 kHz.
- Voz de una unica hablante (Ông Siù-iông), fijada mediante audio de referencia en cada llamada.
- Control de velocidad mediante el parametro `speed` (por ejemplo, 0.8 para mas lento y 1.3 para mas rapido).
- Soporte de etiquetas de sonidos no verbales, como `[laughter]`, insertadas en el texto.
- Manejo de frases conversacionales y de parrafos mas largos, segun los ejemplos de la model card.
- Interfaz Python mediante la clase `TaigiTTS` del script `taigi_tts.py`, con metodos `say` y `generate`.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de voz.

## Casos de uso

- Preservacion linguistica: generar locuciones en taigi para archivos sonoros, diccionarios o materiales didacticos, aprovechando que el modelo esta entrenado especificamente sobre esta lengua minoritaria.
- Audiolibros y narracion: convertir textos en Tâi-lô en audio a 24 kHz con control de velocidad, util para adaptar el ritmo a distintos publicos.
- Aplicaciones de aprendizaje de idiomas: producir ejemplos de pronunciacion y frases de practica en taigi para estudiantes que usan la romanizacion Tâi-lô.
- Accesibilidad: dotar de voz a interfaces o lectores de pantalla para hablantes de taigi, con una voz coherente gracias al audio de referencia fijo.
- Contenido divulgativo y multimedia: generar narraciones para videos o podcasts en taigi, incluyendo sonidos no verbales como risas mediante etiquetas.
- Prototipado de asistentes conversacionales: integrar el modelo en un pipeline de dialogo para probar respuestas habladas en taigi antes de invertir en grabaciones profesionales.
- Investigacion en TTS de bajos recursos: servir como punto de partida para experimentos de ajuste fino y evaluacion en lenguas min nan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 612 millones de parametros en float16 el peso ronda 1,2 GB, por lo que la inferencia cabe holgadamente en GPU de consumo, si bien no se documenta el consumo exacto.
- GPU recomendadas: la model card usa `device_map="cuda:0"` con `dtype=torch.float16`; no se especifican modelos concretos de GPU.
- GPU de consumo: por tamano, es plausible en tarjetas con 8 GB o mas de VRAM, aunque este dato no esta confirmado en la informacion disponible.
- Despliegue: libreria `omnivoice` (pip install omnivoice) con PyTorch; el script `taigi_tts.py` usa la GPU si esta disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La primera ejecucion descarga el modelo (unos 2,5 GB) y el tokenizer de audio (unos 0,8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVoice-Taigi-SuiSiann | 612.577.288 | no disponible | nan (taigi) | CC BY-SA 4.0 | Hugging Face |
| k2-fsa/OmniVoice (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas TTS para taigi | no disponible | no disponible | nan | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Voz unica: el modelo reproduce la voz de la hablante del corpus SuíSiann; no ofrece voces multiples ni clonacion mas alla del audio de referencia.
- Dependencia de la referencia: cada llamada de sintesis necesita un audio de referencia con su transcripcion en Tâi-lô; omitirlo o no desactivar el denoise degrada la calidad.
- Entrada restringida: el texto debe ir en romanizacion Tâi-lô y normalizado en Unicode NFC; no se documenta soporte para caracteres han o para otras romanizaciones.
- Cobertura limitada a un idioma (nan), lo que restringe su uso en contextos multilingues.
- Riesgo de alucinacion acustica: al ser un modelo generativo, puede producir pronunciaciones incorrectas o artefactos en textos fuera del dominio del corpus de entrenamiento.
- Sesgos: al entrenarse con una sola hablante, hereda sus caracteristicas de voz, prosodia y posibles sesgos de registro; no se documentan evaluaciones de sesgo.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar productos propietarios.
- No se documentan limites de longitud de texto por llamada ni comportamiento en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ga642381/OmniVoice-Taigi-SuiSiann
- Repositorio de OmniVoice (k2-fsa): https://github.com/k2-fsa/OmniVoice
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Dataset SuíSiann: https://suisiann-dataset.ithuan.tw/
- Guia oficial de instalacion de PyTorch: https://pytorch.org/get-started/locally/
- Script auxiliar: https://huggingface.co/ga642381/OmniVoice-Taigi-SuiSiann/resolve/main/taigi_tts.py
