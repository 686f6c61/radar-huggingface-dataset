# oggyvukovich/whisper-large-v3-tune02

## Resumen

Whisper large-v3 tune02 es un ajuste fino (*fine-tune*) del modelo Whisper large-v3 de OpenAI, publicado por el usuario oggyvukovich en HuggingFace. Se trata de un modelo de reconocimiento automático de voz (ASR) orientado al idioma serbio (etiqueta `sr`) y distribuido en formato CTranslate2 FP16, pensado para su uso con la librería Faster-Whisper. El repositorio, de 6,2 GB, contiene en su raíz un paquete de inferencia CTranslate2 y conserva los ficheros originales de Transformers en la carpeta `original/`.

Hereda la arquitectura de Whisper large-v3 (transformer encoder-decoder, en torno a 1.550 millones de parámetros y ventanas de audio de 30 segundos con 128 *mel bins* a 16 kHz), aunque la model card no documenta ni el proceso de entrenamiento ni el conjunto de datos empleado en el ajuste. El autor reconoce explícitamente que la calidad de transcripción no ha sido evaluada y que la instalación en la interfaz AVA Community no se ha probado para esta exportación.

La relevancia de este modelo es limitada y de nicho: se publica con 0 descargas y 0 *likes* en el momento de la consulta, sin licencia declarada y sin resultados de evaluación. Resulta de interés principalmente como ejemplo de exportación comunitaria de un Whisper ajustado al serbio y empaquetado en CTranslate2, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper del modelo base large-v3) |
| Parametros totales | Aproximadamente 1.550 M en el modelo base Whisper large-v3; no disponible para el ajuste fino |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (Whisper); no se documenta contexto adicional para el ajuste |
| Tipos de cuantizacion | FP16 (CTranslate2); no se documentan otras cuantizaciones |
| Idiomas soportados | Serbio (sr) segun las etiquetas del repositorio; no disponible el detalle del ajuste |
| Licencia | No disponible |
| Formato de pesos | CTranslate2 en la raiz del repositorio; ficheros originales de Transformers preservados en `original/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer de tipo encoder-decoder que procesa espectrogramas mel de 128 bandas a una frecuencia de muestreo de 16 kHz, con ventanas de audio de 30 segundos. El *feature extractor* del repositorio confirma esta configuración (128 *mel bins*, 16 kHz). La model card indica que los ficheros originales de Transformers se conservan sin modificar en `original/`, y que la exportación a CTranslate2 se realizó en precisión FP16.

No se dispone de información sobre el conjunto de datos de ajuste, el número de tokens de audio, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO. El autor únicamente advierte de un problema conocido de compatibilidad en el tokenizador original: la lista `extra_special_tokens` puede impedir la carga con determinadas versiones de Transformers. Asimismo, señala que las fusiones BPE de la raíz usan la serialización de cadena heredada para tokenizers 0.13.3, que los identificadores del vocabulario no han cambiado y que la inicialización en CPU con Faster-Whisper fue verificada. La calidad de transcripción no se ha probado.

## Capacidades

- Reconocimiento automático de voz (ASR) en serbio, segun la etiqueta de idioma del repositorio.
- Transcripción de audio a texto mediante el paquete CTranslate2 y Faster-Whisper.
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de encadenar segmentos en ficheros largos.
- Posible traducción de voz a ingles heredada del modelo base Whisper, aunque no confirmada para este ajuste.
- No se documentan capacidades de *tool calling*, función de agente, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.
- Capacidades multilingues no confirmadas en este ajuste: la etiqueta de idioma se limita al serbio.

## Casos de uso

- Transcripcion de reuniones y entrevistas en serbio: el modelo puede convertir grabaciones de audio en texto para actas o resúmenes, aprovechando el empaquetado CTranslate2 para despliegue ligero en CPU o GPU.
- Generacion de subtitulos para video en serbio: integrado en una canalización de post-producción, permite obtener pistas de subtítulos a partir de la banda sonora, con marcas de tiempo generadas por Faster-Whisper.
- Archivado y busqueda de contenido audiovisual: transcripción de fondos de audio en serbio para indexación y búsqueda por texto en mediatecas.
- Atencion al cliente en centros de contacto serbios: transcripción de llamadas grabadas para análisis de calidad y detección de palabras clave, siempre que se valide antes la calidad del ajuste.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones y subtítulos en directo o en diferido para contenido hablado en serbio.
- Asistentes de voz locales: uso como componente ASR en aplicaciones de dictado o comandos de voz en serbio desplegadas en el propio equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la calidad de transcripcion no se ha probado para esta exportacion, por lo que no existen datos verificables de WER, MMLU ni ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP16 de un modelo de aproximadamente 1.550 M de parametros, se requieren del orden de 3 GB solo para los pesos, mas memoria para activaciones y buffers, lo que situa el consumo practico en torno a 4-6 GB de VRAM.
- GPU recomendadas: tarjetas de gama media y alta con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; no se dispone de datos especificos de latencia o throughput para esta exportacion.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo como RTX 3060 o superiores.
- Opciones de despliegue: Faster-Whisper con CTranslate2 (formato del repositorio), y potencialmente WhisperX u otros envoltorios basados en CTranslate2; la inicializacion en CPU con Faster-Whisper fue verificada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| whisper-large-v3-tune02 (este modelo) | No disponible (base ~1,55 B) | Ventanas de 30 s | No disponible | HuggingFace, CTranslate2 |
| Whisper large-v3 (OpenAI) | ~1,55 B | Ventanas de 30 s | MIT (modelo base) | HuggingFace, multitud de formatos |
| Whisper medium | ~769 M | Ventanas de 30 s | MIT (modelo base) | HuggingFace |
| Whisper small | ~244 M | Ventanas de 30 s | MIT (modelo base) | HuggingFace |

Los datos de rendimiento comparado no estan disponibles para este ajuste fino. Las cifras de parametros de los modelos base de OpenAI proceden de su documentacion publica; el ajuste concreto aqui descrito no publica metricas propias.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si su uso comercial esta permitido.
- La model card advierte de que la calidad de transcripcion no ha sido evaluada, por lo que su rendimiento real es desconocido.
- Existe un problema conocido de compatibilidad del tokenizador (`extra_special_tokens`) que puede impedir la carga con determinadas versiones de Transformers.
- Las fusiones BPE usan una serializacion heredada para tokenizers 0.13.3, lo que puede afectar a la integracion con versiones mas recientes.
- El modelo esta etiquetado unicamente para serbio, por lo que su comportamiento en otros idiomas no esta garantizado y podria degradarse respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente con audio ruidoso, silencios largos o habla solapada.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Al ser un ajuste fino sin documentacion del corpus de entrenamiento, no se pueden evaluar sesgos ni cobertura dialectal.
- La instalacion en la interfaz AVA Community no ha sido probada para esta exportacion.

## Enlaces

- HuggingFace: https://huggingface.co/oggyvukovich/whisper-large-v3-tune02
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron contenido no relacionado (foros de tematica ajena y redirecciones), por lo que no se incluyen.
