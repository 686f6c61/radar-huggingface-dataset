# PiterQ/parakeet-ultra-sherpa-onnx-int8

## Resumen

Parakeet Ultra es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Moondream, construido sobre la arquitectura parakeet-tdt-0.6b-v3 de NVIDIA. Esta ficha concreta documenta la conversion no oficial realizada por PiterQ a formato ONNX con cuantizacion int8, empaquetada para su uso con la libreria sherpa-onnx. El modelo resuelve la transcripcion de audio a texto en 25 idiomas europeos con un enfoque optimizado para despliegue en dispositivos, incluyendo Android.

La relevancia de esta variante radica en su formato: al ser un export ONNX cuantizado a int8 con un tamano de repositorio de 1.0 GB, permite ejecutar un modelo de transcripcion de alta calidad en hardware de consumo y dispositivos moviles sin necesidad de GPU dedicada. La arquitectura subyacente es un transducer TDT (Token-and-Duration Transducer), una variante de los modelos RNN-T que predice conjuntamente tokens y duraciones, lo que mejora la eficiencia frente a los transductores clasicos.

El modelo base, parakeet-tdt-0.6b-v3, cuenta con aproximadamente 0.6 mil millones de parametros segun la nomenclatura de NVIDIA. La conversion mantiene la arquitectura y el tokenizador originales, aplicando unicamente cuantizacion dinamica int8 (per-channel para el encoder e int8 para decoder y joiner), lo que introduce pequenas variaciones en las salidas respecto al modelo de precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo transducer TDT (Token-and-Duration Transducer) |
| Parametros totales | 0.6B (segun nomenclatura del modelo base parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (per-channel en encoder, int8 en decoder y joiner) |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA, una evolucion del RNN-T que predice simultaneamente el token de salida y su duracion. Esta arquitectura consta de tres componentes exportados de forma independiente: un encoder, una red de prediccion (decoder) y una red conjunta (joiner). La conversion a sherpa-onnx utiliza `model_type = nemo_transducer` y mantiene la arquitectura y el tokenizador del modelo original sin modificaciones.

Los detalles sobre el dataset de entrenamiento (numero de tokens, composicion, uso de RLHF o tecnicas de alineacion) no estan disponibles en la informacion proporcionada. La unica transformacion documentada es la exportacion a ONNX mediante los scripts de sherpa-onnx y la cuantizacion dinamica int8, que reduce el peso del modelo a aproximadamente 1.0 GB. El fichero `bpe.vocab` contiene el vocabulario BPE utilizado para la funcionalidad de hotwords mediante busqueda por haz modificada.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) en 25 idiomas europeos.
- Soporte multilingue amplio: ingles, aleman, frances, espanol, italiano, portugues, ruso, ucraniano, croata, esloveno, letrado, lituano, estonio, fines, sueco, danes, neerlandes, polaco, checo, eslovaco, hungaro, rumano, búlgaro, griego y maltes.
- Soporte de hotwords mediante busqueda por haz modificada (modified beam search) usando el vocabulario BPE, util para sesgar la transcripcion hacia terminos especificos.
- Ejecucion offline (OfflineRecognizer) en sherpa-onnx, adecuada para procesamiento por lotes o en dispositivos sin conexion.
- Despliegue en Android y otras plataformas soportadas por sherpa-onnx.
- No se documentan capacidades de diarizacion, traduccion, vision ni audio-vision.

## Casos de uso

- Transcripcion de reuniones y notas de voz en dispositivos moviles: el modelo, al estar cuantizado a int8 y ocupar aproximadamente 1 GB, puede ejecutarse en Android mediante sherpa-onnx sin conexion a internet, transcribiendo audio localmente y preservando la privacidad.
- Subtitulado automatico de contenido audiovisual multilingue: con soporte para 25 idiomas europeos, permite generar subtitulos en produccion para plataformas de video que operan en varios mercados sin depender de servicios en la nube.
- Asistentes de voz embebidos: la arquitectura TDT y el formato ONNX permiten integrar transcripcion en tiempo real en aplicaciones de escritorio o moviles con latencia controlada, usando el reconocedor offline de sherpa-onnx.
- Dictado por voz en aplicaciones de productividad: integracion en editores de texto o herramientas de toma de notas que requieren transcripcion precisa con la posibilidad de sesgar el reconocimiento hacia vocabulario tecnico mediante hotwords.
- Analisis de llamadas de atencion al cliente: procesamiento por lotes de grabaciones para extraer transcripciones y alimentar sistemas de analitica, con la ventaja de ejecutarse en infraestructura propia sin costes de API.
- Investigacion en ASR multilingue: al ser una conversion abierta con licencia CC-BY-4.0, sirve como base para experimentos de cuantizacion, evaluacion de degradacion int8 o adaptacion a dominios especificos en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.6B parametros cuantizado a int8, el peso en memoria ronda 1 GB; la VRAM necesaria es baja (aproximadamente 1-2 GB incluyendo buffers de activacion), aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; tarjetas como RTX 3060, RTX 4060 o superiores son mas que suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU y dispositivos Android.
- Opciones de despliegue: sherpa-onnx (Python, C++, Android, iOS, etc.), con el reconocedor `OfflineRecognizer.from_transducer`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet Ultra (esta variante) | 0.6B | 25 | ONNX int8 | CC-BY-4.0 | Conversion no oficial para sherpa-onnx |
| moondream/parakeet-ultra (original) | 0.6B | 25 | transformers | CC-BY-4.0 | Modelo base sin cuantizar |
| nvidia/parakeet-tdt-0.6b-v3 | 0.6B | no disponible | NeMo | CC-BY-4.0 | Modelo original de NVIDIA en el que se basa |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion int8 introduce variaciones en las salidas respecto al modelo de precision completa; la precision puede degradarse ligeramente en comparacion con el original.
- Es una conversion no oficial, no afiliada ni respaldada por Moondream ni por NVIDIA; no hay garantias de soporte o mantenimiento.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos no descritos, pueden existir sesgos linguisticos o acentuales no caracterizados.
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede producir palabras incorrectas en audio con ruido, acentos no representados o vocabulario fuera de dominio.
- La cobertura se limita a 25 idiomas europeos; no soporta otros idiomas fuera de esa lista.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion a los autores originales (Moondream y NVIDIA) y a la conversion.
- El modelo esta pensado para sherpa-onnx; su uso fuera de ese ecosistema requiere adaptar los ficheros ONNX manualmente.
- No se dispone de informacion sobre el contexto maximo de audio soportado ni sobre el rendimiento en audios de larga duracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PiterQ/parakeet-ultra-sherpa-onnx-int8
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
