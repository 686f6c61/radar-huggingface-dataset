# robello2/whisper-small-yecs-baseline

## Resumen

whisper-small-yecs-baseline es un ajuste fino (fine-tuning) del modelo openai/whisper-small para reconocimiento automatico del habla (ASR) en conversaciones con cambio de codigo (code-switching) yoruba-ingles. Lo desarrolla el usuario robello2 y se entrena sobre el corpus YECS (Yoruba-English Code-Switched speech), un conjunto de 75.999 enunciados con particion de entrenamiento congelada y un conjunto de desarrollo interno reservado. El modelo resuelve un problema concreto y poco cubierto: la transcripcion de habla en la que los hablantes alternan entre yoruba e ingles dentro de una misma emision, algo frecuente en comunidades bilingues de Nigeria y la diaspora.

Arquitectonicamente hereda el encoder-decoder transformer de Whisper en su variante small, con 241,7 millones de parametros y una ventana de contexto de audio de 30 segundos por segmento. El ajuste se realiza con un token de idioma por enunciado (`<|en|>` o `<|yo|>`) asignado segun la mayoria de etiquetas de palabra, con decodificacion en modo de deteccion automatica de idioma. La seleccion del checkpoint se hizo por WER codicioso en el conjunto de desarrollo, quedandose con el paso 4000 de 7000 (2,95 epocas).

Su relevancia actual reside en que la mayoria de los sistemas ASR multilingues tratan el code-switching como un caso degenerado y penalizan fuertemente las transiciones de idioma. Este baseline establece una referencia reproducible (semilla 42, hiperparametros documentados y protocolo de puntuacion sensible a tonos y cambios de idioma) sobre la que medir mejoras posteriores. La licencia NOODL-1.0 y el escaso volumen de descargas (0 en el momento de la consulta) indican que se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana estandar de Whisper; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (yo), ingles (en), con cambio de codigo entre ambos |
| Licencia | NOODL-1.0 (license: other) |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Tamano del repositorio | 1,0 GB |
| Corpus de entrenamiento | YECS (75.999 enunciados, particion congelada) |
| Epocas efectivas | 2,95 (paso 4000 de 7000) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atencion completa disenado para transcripcion de audio de 30 segundos con tokens especiales de idioma y de tarea. El ajuste fino no modifica la topologia: se reutiliza la cabeza de decodificacion multilingue de Whisper y se especializa sobre el corpus YECS. La innovacion metodologica no esta en la arquitectura sino en el protocolo de entrenamiento y evaluacion para code-switching.

El entrenamiento usa una tasa de aprendizaje de 1e-5 con 500 pasos de calentamiento, tamano de lote efectivo de 32 (16 x acumulacion 2), precision bf16 y un maximo de 10 epocas con parada temprana (paciencia 3) monitorizando el WER codicioso en desarrollo. Se selecciono el paso 4000 de 7000, equivalente a 2,95 epocas, con semilla 42. Cada enunciado recibe un token de idioma (`<|en|>` o `<|yo|>`) determinado por la mayoria de etiquetas de palabra, con desempate hacia ingles; en inferencia se recomienda decodificar con deteccion automatica de idioma. La evaluacion emplea un protocolo sensible a tonos y a cambios de idioma: normalizacion NFC, eliminacion de puntuacion y conservacion de diacriticos. No se documentan fases de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) para audio en yoruba, en ingles y en habla con cambio de codigo entre ambos.
- Transcripcion con conservacion de diacriticos y marcas de tono del yoruba en el protocolo de evaluacion.
- Deteccion automatica de idioma por segmento mediante los tokens especiales de Whisper.
- Manejo de enunciados con multiples transiciones de idioma, con metricas especificas de error cerca y lejos de los puntos de cambio.
- Salida de transcripcion en texto plano con marcas de tiempo propias de la familia Whisper (no verificado en la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de entrevistas bilingues yoruba-ingles: el modelo esta entrenado especificamente sobre habla con alternancia de idioma, por lo que reduce los errores en los puntos de cambio frente a un Whisper small sin ajustar. Adecuado para investigacion sociolinguistica y archivos orales.
- Subtitulado de contenido audiovisual nigeriano: series, podcasts y videos de creadores que mezclan yoruba e ingles pueden transcribirse con un unico modelo en lugar de encadenar dos sistemas monolingues con deteccion manual de idioma.
- Atencion al cliente en centros de contacto de Nigeria: permite transcribir llamadas donde el cliente alterna idiomas, alimentando analitica de calidad y busqueda sobre las transcripciones.
- Documentacion clinica o legal dictada: en entornos donde profesionales bilingues dictan en ambos idiomas, el modelo puede servir como borrador de transcripcion sujeto a revision humana.
- Generacion de corpus etiquetados para entrenamiento: las transcripciones pueden usarse para ampliar datasets de ASR con habla code-switched, aunque requiere validacion por la tasa de error documentada.
- Investigacion en ASR code-switched: sirve como baseline reproducible (semilla e hiperparametros publicados) para comparar tecnicas de adaptacion, aumentacion o decodificacion sensible al cambio de idioma.
- Accesibilidad: transcripcion de reuniones o clases donde los ponentes alternan yoruba e ingles, con la advertencia de que el WER en yoruba (18,69 %) limita su uso sin revision.

## Benchmarks y rendimiento

Resultados internos en el conjunto de desarrollo del autor (beam 5, idioma automatico, porcentajes):

| Metrica | Valor |
|---|---|
| WER | 16,52 |
| CER | 5,83 |
| DI-WER | 12,83 |
| Error en yoruba (err_yo) | 18,69 |
| Error en ingles (err_en) | 10,08 |
| PIER yoruba (pier_yo) | 21,70 |
| Error cerca de cambio de idioma (switch_near_err) | 13,98 |
| Error lejos de cambio de idioma (switch_away_err) | 14,35 |
| Inserciones por palabra (ins_per_word) | 2,33 |

No se han publicado comparaciones con otros modelos en la informacion disponible, ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a una tarea ASR). El conjunto de desarrollo es interno y no se detalla su tamano ni composicion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,5 GB de pesos mas memoria de activaciones y buffers de audio; en la practica cabe en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); para lotes grandes o throughput alto, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, incluidas GTX 1660, RTX 3050 y superiores; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma estandar a Whisper, faster-whisper y whisper.cpp para inferencia optimizada, y servidores compatibles con la API de OpenAI para audio si se adaptan los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, Whisper small procesa audio en tiempo real con holgura en GPU consumer, pero no se aportan cifras medidas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-yecs-baseline | 241,7 M | yo, en (code-switching) | 30 s por segmento (estandar Whisper) | NOODL-1.0 | Hugging Face, 0 descargas |
| openai/whisper-small | 241,7 M | multilingue (99 idiomas) | 30 s por segmento | MIT (modelo base) | Hugging Face, ampliamente usado |
| openai/whisper-medium | 769 M | multilingue | 30 s por segmento | MIT | Hugging Face |
| Modelos ASR especificos para yoruba | no disponible | yo | no disponible | no disponible | no disponible |

La comparacion directa de rendimiento con whisper-small sin ajustar no esta publicada en la informacion disponible; el autor solo reporta metricas internas de desarrollo. La ventaja esperada frente al modelo base es la especializacion en code-switching yoruba-ingles, a costa de perder cobertura multilingue general.

## Limitaciones y advertencias

- El WER global en desarrollo es del 16,52 %, y en yoruba asciende al 18,69 %; no es adecuado para transcripcion sin revision humana en contextos de alta exigencia.
- El conjunto de evaluacion es interno y no se publica su composicion ni tamano, lo que impide verificar la generalizacion a otros dominios, acentos o calidades de audio.
- Solo cubre yoruba e ingles; el resto de idiomas de Whisper queda fuera del ajuste y su comportamiento no esta documentado.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos con silencio, ruido o audio musical; no se documentan mitigaciones.
- La licencia NOODL-1.0 es distinta de la MIT del modelo base; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- El corpus YECS tiene sus propias condiciones de licencia que deben verificarse antes de reutilizar derivados.
- No se documentan sesgos demograficos ni de acento; el corpus puede sobrerrepresentar variantes concretas del yoruba y del ingles nigeriano.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida; tratarlo como artefacto de investigacion.
- No se especifican cuantizaciones ni formatos GGUF, lo que limita el despliegue en entornos sin transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robello2/whisper-small-yecs-baseline
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Corpus YECS: no disponible en la informacion proporcionada
