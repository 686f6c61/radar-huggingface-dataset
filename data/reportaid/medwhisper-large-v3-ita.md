# ReportAId/medwhisper-large-v3-ita

## Resumen

MedWhisper Large ITA es un modelo de reconocimiento automatico del habla (ASR) en italiano, desarrollado por el equipo de ReportAId, especializado en la transcripcion de audio clinico de consultas ambulatorias de especialidades. Se trata de un ajuste fino mediante LoRA sobre `openai/whisper-large-v3-turbo`, la variante optimizada del modelo Whisper de OpenAI, con 808,9 millones de parametros y arquitectura transformer encoder-decoder orientada a la transcripcion de voz. El objetivo es mejorar la fidelidad de la transcripcion de terminologia medica, abreviaturas y expresiones formulaicas propias del ambito sanitario italiano, donde los modelos genericos suelen fallar.

El modelo aborda un problema concreto: la alta tasa de error en la transcripcion de jerga clinica en italiano. Segun la model card, sobre un conjunto de test reservado de audio clinico, MedWhisper Large ITA reduce la tasa de error de palabras (WER) del 7,9 % al 4,5 % respecto al modelo base, lo que supone una reduccion relativa del error de aproximadamente el 43 %. Las mayores mejoras se concentran en el vocabulario especifico del dominio medico.

Su relevancia actual radica en la creciente demanda de herramientas de documentacion clinica automatica y en la escasez de modelos ASR especializados en italiano sanitario. No obstante, el modelo se entrena sobre un corpus sintetico y su licencia AGPL-3.0 impone restricciones relevantes para uso comercial, aspectos que deben considerarse antes de su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | italiano (it) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MedWhisper Large ITA parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atencion completa y decodificacion autoregresiva, disenado para transcripcion y traduccion de voz. El ajuste se realizo mediante LoRA (Low-Rank Adaptation), lo que permite adaptar el modelo al dominio clinico con un coste computacional reducido y manteniendo la mayor parte de los pesos originales congelados.

El corpus de entrenamiento es propietario y sintetico: se generaron 7 frases de ejemplo por cada uno de 800 terminos clinicos priorizados (5.600 frases en total), usando un LLM y con revision y validacion del equipo clinico de ReportAId para garantizar plausibilidad medica y precision linguistica. Posteriormente, las frases se convirtieron en audio mediante sintesis de voz, con correcciones humanas puntuales para corregir pronunciaciones erroneas o prosodia antinatural. El volumen total asciende a aproximadamente 57 horas de entrenamiento, 6,5 horas de validacion y 3,3 horas de test. El conjunto de test es el mismo empleado para evaluar el modelo base, lo que permite una comparacion directa. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Transcripcion automatica de voz en italiano, con enfasis en vocabulario clinico y terminologia medica especializada.
- Reconocimiento de abreviaturas y expresiones formulaicas del ambito sanitario (por ejemplo, «Anamnesi», «Holter delle 24 ore»).
- Transcripcion fiel de terminos medicos poco frecuentes y expresiones multi-palabra raras.
- Manejo de equivalencias semanticas en la transcripcion de numeros, fechas y dosis (por ejemplo, «500mg» frente a «cinquecento mg»).
- Uso directo en sistemas de dictado, transcripcion de reuniones y conversion voz-texto en italiano.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Documentacion clinica automatica: transcripcion de consultas ambulatorias de especialidades en italiano, aprovechando la mejora del 43 % en WER sobre terminologia medica para reducir la carga de revision manual del personal sanitario.
- Generacion de informes medicos: integracion en sistemas de reporte que convierten el dictado del facultativo en texto estructurado, con mayor fidelidad en nombres de pruebas, diagnosticos y dosis.
- Dictado de recetas y prescripciones: la capacidad de transcribir correctamente dosis y numeros (por ejemplo, «tachipirina 500mg») reduce errores criticos en la transcripcion de indicaciones terapeuticas.
- Sistemas de historia clinica electronica (EHR): alimentacion automatica de registros a partir de audio de consulta, con etiquetado orientado a terminos clinicos frecuentes en el contexto sanitario italiano.
- Investigacion en ASR clinico: el modelo sirve como base o referencia para estudios sobre adaptacion de dominio en reconocimiento de voz medico en italiano, dado su conjunto de evaluacion documentado.
- Prototipos de asistentes de voz sanitarios: transcripcion en tiempo casi real de interacciones medico-paciente para herramientas de apoyo a la decision, siempre con supervision humana.
- Subtitulado y transcripcion de sesiones clinicas grabadas: util en formacion medica y auditoria de consultas, donde la precision terminologica es prioritaria.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test clinico reservado (mismo conjunto para ambos modelos):

| Modelo | WER |
|---|---|
| Whisper Large v3 Turbo | 7,9 % |
| MedWhisper Large ITA | 4,5 % |

Evaluacion de equivalencia semantica (juez GPT-5):

| Modelo | % frases con WER = 0 | % frases semanticamente equivalentes (WER > 0) | WER medio en frases no equivalentes |
|---|---|---|---|
| Whisper Large v3 Turbo | 39,3 % | 96,63 % | 14,01 % |
| MedWhisper Large ITA | 55,8 % | 97,42 % | 10,36 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB en precision completa (fp32, segun tamano del repo de 3,2 GB); en fp16 en torno a 1,6 GB; en cuantizacion de 8 bits alrededor de 0,8 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (libreria indicada en la model card), con posibilidad de exportacion a otros runners compatibles con Whisper; el autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test clinico) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedWhisper Large ITA | 808,9 M | no disponible (segmentos de 30 s) | 4,5 % | AGPL-3.0 | HuggingFace |
| Whisper Large v3 Turbo | 809 M | no disponible (segmentos de 30 s) | 7,9 % | MIT (modelo base de OpenAI) | HuggingFace |
| Whisper Large v3 | 1.550 M | no disponible (segmentos de 30 s) | no evaluado en este test | MIT | HuggingFace |

La comparativa se limita al modelo base y a la variante grande de Whisper, ya que no se dispone de datos de otros modelos ASR especializados en italiano clinico en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un corpus sintetico: aunque validado por clinicos, el audio sintetico puede no reflejar toda la variabilidad acustica del habla real (acentos, ruido de fondo, solapamiento de voces).
- Riesgo de alucinacion: la model card advierte que los modelos Whisper son propensos a alucinar, especialmente en silencios prolongados o segmentos con baja relacion senal-ruido; se recomienda normalizar y recortar el audio antes de la inferencia.
- Limitacion de idioma: solo soporta italiano; no se documenta rendimiento en otras lenguas.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede resultar incompatible con productos comerciales cerrados; la model card menciona que el modelo se libera para investigacion y experimentacion, lo que genera ambiguedad respecto a su uso comercial.
- Dataset propietario: no es posible reproducir el entrenamiento ni auditar completamente la composicion del corpus.
- Evaluacion limitada: las metricas se basan en un unico conjunto de test clinico y en un juez LLM (GPT-5) para la equivalencia semantica, sin validacion humana independiente documentada.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de robustez frente a distintos grupos demograficos o acentos regionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReportAId/medwhisper-large-v3-ita
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Sitio del desarrollador: https://reportaid.ai/
- Documentacion sobre WER: https://en.wikipedia.org/wiki/Word_error_rate
