# Parveenrana/nllb-dogri-QLoRA-1.3b2

## Resumen

Parveenrana/nllb-dogri-QLoRA-1.3b2 es un ajuste fino publicado en Hugging Face por el usuario Parveenrana, cuyo identificador sugiere que se trata de una adaptación mediante QLoRA de un modelo de traducción automática de la familia NLLB (No Language Left Behind) de Meta AI, con aproximadamente 1.300 millones de parámetros y orientado al dogri (doi), una lengua indoaria de la región de Jammu y Cachemira reconocida como lengua oficial en la India. La model card del repositorio es la plantilla automática de Hugging Face sin rellenar: no declara desarrollador, datos de entrenamiento, hiperparámetros, licencia ni idiomas.

El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con un conjunto de pesos de adaptador (LoRA) y no con los pesos completos de un modelo de 1.300 millones de parámetros en fp16, que ocuparían del orden de 2,6 GB. No se han publicado resultados de evaluación, demostraciones ni documentación técnica adicional, y el modelo acumula cero descargas y cero "likes" en el momento de redactar esta ficha.

Su relevancia potencial es la cobertura de una lengua de bajos recursos con escasa representación en sistemas de traducción comercial, pero el estado actual del repositorio impide considerarlo listo para producción: sin licencia declarada, sin evaluación publicada y sin confirmación del modelo base ni del corpus paralelo empleado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El identificador sugiere un transformer encoder-decoder de la familia NLLB-200 (inferido, no confirmado por el autor) |
| Parametros totales | No disponible. El sufijo "1.3b" del identificador sugiere unos 1.300 millones, sin confirmar |
| Parametros activos | No disponible. La familia NLLB-200 solo emplea arquitectura MoE en su variante de 54B; las destiladas de 600M, 1.3B y 3.3B son densas (referencia del modelo base, no confirmada aquí) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El término QLoRA del identificador implica entrenamiento con cuantizacion de 4 bits, pero no se especifica el formato de pesos publicado ni si el adaptador se distribuye en fp16/fp32 |
| Idiomas soportados | No disponible en la model card. El identificador apunta a dogri (doi), sin confirmar la dirección de traducción ni el par de idiomas |
| Licencia | No disponible. No se declara licencia en el repositorio |
| Formato de pesos | safetensors (etiqueta del repositorio) |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-07 / 2026-10-08 (fechas tal como figuran en el repositorio) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta de este ajuste. Si se confirma que parte de NLLB-200, el modelo base es un transformer encoder-decoder entrenado por Meta AI con decodificación por búsqueda en haz y un tokenizador SentencePiece compartido para 200 lenguas, evaluado con la métrica spBLEU sobre el conjunto FLORES-200. La variante de 54B de esa familia es Mixture-of-Experts; las destiladas de 1,3B son densas y se obtuvieron mediante destilación de conocimiento con el objetivo de reducir el coste de inferencia manteniendo parte del rendimiento multilingüe.

El identificador indica el uso de QLoRA, una técnica de ajuste eficiente en parámetros que congela los pesos del modelo base cuantizados a 4 bits (formato NF4) e inserta adaptadores de bajo rango entrenables, con optimizadores paginados para limitar el pico de memoria. Tanto el rango de los adaptadores, el alfa, el dropout, la tasa de aprendizaje, el número de pasos, el corpus paralelo dogri empleado y el posible filtrado o destilación posterior son datos no disponibles. La etiqueta arxiv:1910.09700 del repositorio corresponde a la cita de Lacoste et al. (2019) sobre el cálculo de emisiones de carbono incluida en la plantilla automática de Hugging Face, no a un artículo científico sobre este modelo.

## Capacidades

- Traducción automática entre dogri y otras lenguas: capacidad esperada por el identificador del repositorio, no verificada mediante evaluación publicada.
- Generación de texto abierto, razonamiento, matemáticas y código: no documentado y poco probable en un modelo de traducción entrenado con QLoRA sobre una base NLLB.
- Visión y audio: no soportado según la información disponible.
- Tool calling y function calling: no disponible; no hay indicios de formato de herramientas ni de plantillas de chat publicadas.
- Uso en agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües amplias: condicionadas a que el modelo base sea NLLB-200 (200 lenguas); no confirmado por el autor y presumiblemente degradadas por el ajuste específico sobre dogri.
- Modo de razonamiento explícito ("thinking"), modo de sistema o control de esfuerzo de razonamiento: no disponible.
- Formato de instrucciones o plantilla de prompt: no disponible.

## Casos de uso

- Traducción de documentación administrativa al dogri: el modelo podría emplearse para pre-traducir formularios, notificaciones y trámites de la administración de Jammu y Cachemira, reduciendo el coste de traducción humana en una lengua con cobertura limitada en herramientas comerciales. Requeriría revisión humana por la ausencia de evaluación publicada.
- Localización de material educativo: generación de versiones en dogri de textos escolares de primaria, dado el estatus oficial de la lengua en el sistema educativo indio. El modelo sería útil como primera pasada dentro de un flujo con traductores y correctores.
- Preservación del patrimonio lingüístico: traducción y alineación de corpus orales transcritos, textos literarios o prensa histórica, contribuyendo a crear recursos paralelos para una lengua con pocos datos digitales.
- Atención al ciudadano multilingüe: integración como componente de traducción en un chatbot o mesa de ayuda que atienda consultas en dogri, hindi e inglés, siempre con derivación a un agente humano y con revisión de las respuestas traducidas.
- Pre-traducción en flujos editoriales: uso como paso previo en la publicación de artículos de Wikipedia, boletines oficiales o prensa regional, reduciendo el tiempo de traducción humana antes de la edición final.
- Subtitulado y doblaje de contenido audiovisual regional: transcripción traducida al dogri para medios locales, aprovechando la capacidad de traducción de frases cortas si el modelo base mantiene un tokenizador adecuado para la lengua.
- Traducción asistida en el ámbito sanitario o jurídico: apoyo a profesionales que necesitan comprensión pasiva de textos en dogri, con revisión profesional obligatoria y sin uso autónomo en decisiones clínicas o legales.
- Investigación en PLN para lenguas de bajos recursos: punto de partida para reproducir ajustes QLoRA, comparar variantes y estudiar el comportamiento de NLLB en lenguas indoarias poco representadas, aportando el adaptador como artefacto reproducible si se documenta adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No consta evaluación en FLORES-200 (spBLEU), BLEU, chrF ni en conjuntos específicos de dogri, ni comparaciones con el modelo base sin ajustar. La única referencia métrica citada en la model card es el enlace al calculador de impacto ambiental basado en Lacoste et al. (2019), que no aporta datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia orientativa y no verificada, un modelo denso de 1.300 millones de parámetros ocupa aproximadamente 2,6 GB en fp16, 1,3 GB en int8 y entre 0,7 y 0,9 GB en int4, a lo que hay que sumar la caché KV y el consumo del framework. Estas cifras son estimaciones derivadas del recuento de parámetros del identificador, no mediciones de este repositorio.
- Repositorio de 0,1 GB: su tamaño indica que probablemente solo contiene el adaptador, por lo que la inferencia exige descargar y cargar aparte el modelo base correspondiente. Este extremo no está confirmado.
- GPU recomendadas: no disponible. Si se confirma el tamaño de 1,3B, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB), e incluso en tarjetas de 6-8 GB con cuantización. En A100 o H100 se ejecutaría con holgura, pero no hay mediciones publicadas.
- Despliegue: la librería declarada es transformers, por lo que el uso mínimo requiere transformers más PEFT para cargar el adaptador sobre el modelo base. Alternativas como vLLM, TGI o CTranslate2 dependen de la compatibilidad del modelo base y no están documentadas para este repositorio. llama.cpp u Ollama exigirían convertir los pesos a GGUF, conversión que no se distribuye.
- Latencia y throughput: no disponible. No hay mediciones de tokens por segundo, latencia por frase ni comparativas con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parveenrana/nllb-dogri-QLoRA-1.3b2 | No disponible (identificador sugiere ~1,3B) | No disponible | No disponible (identificador sugiere dogri) | No disponible | Adaptador en Hugging Face, 0 descargas, sin evaluación |
| facebook/nllb-200-distilled-1.3B | ~1,3B | No verificado en esta ficha | 200 lenguas, incluida la familia indoaria | CC-BY-NC-4.0 según la documentación pública del modelo base, pendiente de verificar | Pesos completos publicados por Meta AI |
| ai4bharat/indictrans2-indic-1B | ~1B | No verificado en esta ficha | Lenguas indias, con cobertura de lenguas programadas de la India | Pendiente de verificar | Pesos completos publicados por AI4Bharat |
| google/madlad400-3b-mt | ~3B | No verificado en esta ficha | Más de 400 lenguas | Pendiente de verificar | Pesos completos publicados por Google |

La comparación se ofrece como contexto de categoría, no como medición: no existen resultados de benchmarks de este adaptador que permitan afirmar que supera o iguala a estas alternativas en dogri. Cualquier decisión de adopción debería ir precedida de una evaluación propia sobre un conjunto paralelo en dogri (por ejemplo, extraído de FLORES-200) y de la verificación de la licencia efectiva del modelo base.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, procedencia del corpus paralelo ni proceso de filtrado, lo que impide auditar sesgos o contaminación.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, y si el modelo base es NLLB-200 de Meta AI, es probable que herede su licencia CC-BY-NC-4.0, que restringe el uso comercial. Este punto debe verificarse antes de cualquier despliegue.
- Ausencia total de evaluación: cero descargas, cero "likes" y ningún benchmark publicado implican que no existe evidencia externa de calidad, ni siquiera de que el ajuste sea funcional.
- Riesgo de alucinación en traducción: los modelos de traducción de lenguas de bajos recursos pueden generar contenido plausible pero incorrecto cuando el dominio o el registro se alejan de los datos de entrenamiento, especialmente en terminología técnica, nombres propios y cifras.
- Sesgos potenciales: si el corpus paralelo proviene de fuentes sesgadas hacia un dialecto, un registro formal o una variante ortográfica del dogri, el modelo reproducirá ese sesgo. No hay información al respecto.
- Ambigüedad ortográfica y dialectal: el dogri se escribe mayoritariamente en devanagari, con variación dialectal interna; no se especifica qué variante cubre el ajuste.
- Limitaciones de contexto e idioma: no se declara la longitud máxima de secuencia, lo que impide garantizar el comportamiento en documentos largos; el ajuste específico puede degradar el rendimiento del modelo base en otras lenguas.
- Dependencia del modelo base: el repositorio de 0,1 GB probablemente no es autónomo, de modo que la reproducibilidad depende de que el modelo base siga disponible y con la misma revisión.
- Fechas anómalas: la fecha de creación registrada (2026-10-07) resulta inconsistente con el contexto temporal habitual de publicación, lo que refuerza la necesidad de tratar los metadatos con cautela.
- Ausencia de controles de seguridad: no hay información sobre filtrado de contenido, comportamiento ante entradas maliciosas ni limitaciones de uso fuera de alcance.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Parveenrana/nllb-dogri-QLoRA-1.3b2
- Artículo citado en las etiquetas del repositorio, Lacoste et al. (2019), sobre estimación de emisiones: https://arxiv.org/abs/1910.09700
- Modelo base presumible (referencia del modelo base, no citado por el autor): https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Artículo de NLLB-200 de Meta AI, "No Language Left Behind: Scaling Human-Centered Machine Translation": https://arxiv.org/abs/2207.04672
- Artículo de QLoRA, Dettmers et al. (2023), técnica indicada en el identificador: https://arxiv.org/abs/2305.14314
- Calculador de impacto ambiental de aprendizaje automático citado en la plantilla: https://mlco2.github.io/impact

No se han encontrado en la información disponible enlaces a demostraciones, blogs del autor, repositorios de código ni conjuntos de datos asociados a este ajuste.
