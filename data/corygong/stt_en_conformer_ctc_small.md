# corygong/stt_en_conformer_ctc_small

## Resumen

El modelo `corygong/stt_en_conformer_ctc_small` es un sistema de reconocimiento automático del habla (ASR) en inglés, basado en la arquitectura Conformer-CTC en su variante pequeña no autorregresiva. Fue desarrollado por NVIDIA y publicado en HuggingFace por el usuario corygong, y está disponible a través del toolkit NeMo. Con aproximadamente 13 millones de parámetros, está diseñado para transcribir audio en inglés a texto en minúsculas, incluyendo espacios y apóstrofes.

El modelo resuelve el problema de transcripción de voz a texto con un equilibrio entre precisión y eficiencia computacional, siendo adecuado para despliegues con recursos limitados. Se entrenó sobre el conjunto de datos NeMo ASRSet, que agrega alrededor de 16 000 horas de habla inglesa procedente de múltiples corpus públicos como LibriSpeech, Common Voice, VCTK, Fisher, Switchboard, WSJ y corpus singapurenses. Su relevancia actual radica en ser una opción ligera y de código abierto (licencia CC-BY-4.0) para aplicaciones de ASR en producción, con soporte nativo en NeMo y compatibilidad con NVIDIA Riva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (no autorregresivo) |
| Parametros totales | 13 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (checkpoint .nemo, PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Conformer, que combina capas de atención por producto punto (Transformer) con convoluciones profundas, y utiliza una cabeza de clasificación temporal conexionista (CTC) para la decodificación. Al ser no autorregresivo, predice la secuencia de caracteres de forma paralela, lo que reduce la latencia frente a modelos autorregresivos. El checkpoint se entrena con el toolkit NeMo de NVIDIA.

Los datos de entrenamiento provienen del conjunto NeMo ASRSet, que integra aproximadamente 16 000 horas de habla inglesa. Las fuentes incluyen LibriSpeech, Common Voice 7.0, VCTK, Fisher Corpus, Switchboard-1, WSJ-0, WSJ-1 y los corpus nacionales de Singapur (partes 1 y 6). No se dispone de información detallada sobre el número de épocas, la configuración exacta de hiperparámetros ni el uso de técnicas como RLHF o DPO, ya que la model card no los especifica.

## Capacidades

- Transcripcion de audio en ingles a texto en minusculas, con espacios y apostrofes.
- Reconocimiento de voz para audio monofonico muestreado a 16 kHz (formato WAV).
- Inferencia no autorregresiva mediante CTC, con baja latencia.
- Integracion con el ecosistema NeMo: permite fine-tuning sobre otros conjuntos de datos.
- Compatible con NVIDIA Riva para despliegue en produccion.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de ASR.
- No dispone de capacidades multimodales (vision, audio de entrada distinto a voz) ni de modo de pensamiento.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en ingles a texto en tiempo real o diferido, gracias a su baja latencia y a la compatibilidad con NeMo para procesamiento por lotes.
- Subtitulado automatico de videos: al aceptar audio de 16 kHz, puede integrarse en pipelines de generacion de subtitulos para contenido en ingles, con un coste computacional reducido por su tamano de 13M parametros.
- Asistentes de voz y comandos dictados: su naturaleza no autorregresiva permite respuestas rapidas en aplicaciones de dictado o control por voz en dispositivos con recursos limitados.
- Analisis de llamadas de atencion al cliente: puede transcribir conversaciones telefonicas en ingles para su posterior analisis de sentimiento o extraccion de informacion, siempre que el audio cumpla con el formato requerido.
- Generacion de actas o documentacion a partir de audio: util en entornos juridicos o medicos donde se necesita convertir grabaciones en texto de forma fiable.
- Evaluacion de calidad de audio y pruebas de ASR: al ser un modelo pequeno y de codigo abierto, sirve como referencia para comparar otros sistemas o para validar pipelines de preprocesado de audio.

## Benchmarks y rendimiento

El unico resultado oficial declarado en la model card es el siguiente:

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Librispeech (clean) | test (config: other) | WER | 8,1 % |

No se han publicado resultados adicionales en la informacion disponible. El valor de WER del 8,1 % en Librispeech clean test es competitivo para un modelo de 13M parametros, aunque no se dispone de comparaciones directas con otros modelos en la misma fuente.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 13M parametros, la inferencia puede ejecutarse en CPU con memoria RAM modesta (menos de 1 GB para los pesos) o en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como NVIDIA GTX 1650, RTX 3060 o superiores. Tambien funciona en GPUs de datacenter como A10, A100 o H100, aunque no son necesarias.
- Cabe en GPUs de consumo: si, con margen amplio.
- Opciones de despliegue: NeMo (inferencia y fine-tuning), NVIDIA Riva, y potencialmente exportacion a ONNX o TensorRT para optimizacion. No se menciona soporte directo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser no autorregresivo y pequeno, se espera una latencia inferior a la de modelos autoregresivos de tamano similar.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Modelos comparables en la categoria de ASR ligero en ingles serian, por ejemplo, `stt_en_conformer_ctc_medium` o `stt_en_conformer_transducer_small` de NVIDIA, pero no se han encontrado resultados oficiales que permitan una comparacion directa en esta ficha.

## Limitaciones y advertencias

- El modelo fue entrenado con datos de habla publica en ingles, por lo que su rendimiento puede degradarse con acentos no representados, jerga tecnica o vocabulario vernaculo no presente en los corpus de entrenamiento.
- La salida se limita a minusculas, espacios y apostrofes; no produce mayusculas, puntuacion ni numeros formateados.
- Requiere audio monofonico a 16 kHz; cualquier otra frecuencia o canal puede requerir preprocesado.
- No se han documentado sesgos especificos, pero al entrenarse con corpus mayoritariamente de hablantes norteamericanos y britanicos, podria tener un rendimiento inferior con otros acentos del ingles.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es recomendable revisar los terminos de los datasets subyacentes (por ejemplo, Common Voice, Fisher, Switchboard) para verificar restricciones adicionales.
- La model card original contiene marcadores de posicion sin completar, por lo que faltan detalles sobre el proceso de entrenamiento y limitaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/corygong/stt_en_conformer_ctc_small
- Version v2 en HuggingFace: https://huggingface.co/corygong/stt_en_conformer_ctc_small_v2
- Pagina del modelo en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/stt_en_conformer_ctc_small
- Repositorio de NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Paper de Conformer (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
