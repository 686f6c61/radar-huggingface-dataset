# dianavdavidson/whisper-medium_mucs_63022_ratio_25_45_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT

## Resumen

El modelo `dianavdavidson/whisper-medium_mucs_63022_ratio_25_45_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla Whisper medium, publicado en HuggingFace por el usuario dianavdavidson el 20 de septiembre de 2026 y actualizado el 21 de septiembre de 2026. Según los pesos almacenados en safetensors, cuenta con 763.857.920 parámetros (unos 764 millones), un tamaño idéntico al de Whisper medium original, y el repositorio ocupa 15,3 GB.

Por la nomenclatura del repositorio (los segmentos `mucs_63022`, `ratio_25_45`, `lr_1e-4`, `lgid_hi_hinglish_mixed_scripts`) se deduce que se trata de un ajuste orientado a reconocimiento de habla con cambio de código (code-switching) hindi-inglés, con enfoque explícito en identificación de idioma (LID) y entrenado con una tasa de aprendizaje de 1e-4 sobre una mezcla de datos con una proporción concreta. Ninguno de estos extremos está documentado en la ficha del repositorio, por lo que deben considerarse inferencias a partir del nombre y no hechos confirmados.

Su relevancia práctica es muy limitada: 8 descargas y 0 me gusta en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Es un artefacto de investigación acotado, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (etiqueta `whisper` en el repositorio) |
| Parámetros totales | 763.857.920 (~764 M), según los pesos en safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la documentación del repositorio. La arquitectura Whisper estándar procesa ventanas de audio de 30 segundos (1500 fotogramas de mel) por pasada |
| Tipos de cuantización | No disponible. El repositorio publica únicamente pesos en safetensors en precisión completa |
| Idiomas soportados | No disponible. El nombre del repositorio sugiere hindi e inglés (hinglish), sin confirmación documental |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 15,3 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El checkpoint parte de Whisper medium, un transformer encoder-decoder secuencial diseñado para transcripción y traducción de audio. La configuración de referencia de Whisper medium es de 24 capas de encoder y 24 de decoder, dimensión de modelo 1024 y 16 cabezas de atención, con entrada de espectrograma mel de 80 canales; esta configuración corresponde al modelo base de OpenAI y no está verificada en la documentación del repositorio, que no ofrece detalle alguno sobre la arquitectura resultante tras el ajuste.

En cuanto al entrenamiento, el identificador del modelo aporta las únicas pistas disponibles: una tasa de aprendizaje de 1e-4 (`lr_1e-4`), una proporción de mezcla de datos expresada como 25/45 (`ratio_25_45`), un conjunto de datos o partición identificado como `mucs_63022`, y un objetivo que incluye identificación de idioma para hindi/inglés con alfabetos mixtos (`lgid_hi_hinglish_mixed_scripts`). No se especifican el número de tokens de audio, la composición del dataset, ni si se aplicaron técnicas de ajuste por refuerzo o preferencias (RLHF/DPO). Tampoco hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Transcripción de voz a texto: capacidad heredada del modelo base Whisper, que convierte audio en texto para ventanas de hasta 30 segundos por pasada.
- Posible manejo de cambio de código hindi-inglés: deducido del sufijo `hi_hinglish_mixed_scripts` del nombre, sin confirmación documental.
- Posible predicción de identificador de idioma (LID): deducido del segmento `lgid` del nombre, sin confirmación.
- Capacidades potenciales del modelo base (detección de idioma, traducción a inglés, marcas de tiempo a nivel de segmento): no verificadas en este checkpoint tras el ajuste.
- Soporte de tool calling o function calling: no. Es un modelo ASR, no un modelo de lenguaje conversacional con interfaz de herramientas.
- Soporte de agentes o razonamiento multi-paso: no. No dispone de modo de razonamiento ni de planificación.
- Capacidades de visión o audio más allá de ASR: no disponibles.
- Multilingüismo: no disponible. El único indicio es el par hindi/inglés que sugiere el nombre del repositorio.

## Casos de uso

- Transcripción de audio en hindi e inglés mezclado: el modelo sería adecuado para convertir grabaciones donde el hablante alterna entre ambos idiomas dentro de una misma frase, un fenómeno frecuente en India y en comunidades de la diáspora. Requiere validación previa, ya que no hay métricas publicadas.
- Identificación de idioma por segmento: si el ajuste con `lgid` funciona como se deduce del nombre, podría etiquetar cada fragmento con su idioma para alimentar pipelines de enrutado posteriores (por ejemplo, enviar el texto a un traductor u otro según el idioma detectado).
- Subtitulado de contenido audiovisual multilingüe: generación de subtítulos con marcas de tiempo para vídeos donde se mezclan hindi e inglés, siempre que se verifique que el ajuste conserva la capacidad de predicción temporal de Whisper.
- Análisis de conversaciones de centros de atención telefónica: transcripción de llamadas bilingües para su posterior análisis de calidad, búsqueda de palabras clave o clasificación de motivos de contacto.
- Investigación en reconocimiento de habla con cambio de código: el modelo sirve como punto de partida reproducible para experimentos académicos sobre code-switching, dado que el nombre documenta hiperparámetros concretos (lr 1e-4, ratio 25/45) que permiten replicar el ajuste.
- Generación de corpus transcritos para entrenamiento posterior: uso del modelo para etiquetar automáticamente audio no anotado y crear datasets de ASR en hinglish.
- Evaluación comparativa de estrategias de ajuste: al conservar el tamaño de Whisper medium, permite comparar directamente contra el modelo base y medir el efecto de la mezcla de datos y la tasa de aprendizaje empleadas.
- Accesibilidad en tiempo casi real: transcripción local en una GPU de consumo para personas que necesitan subtítulos de contenido en hinglish, sin enviar audio a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER, comparaciones con el modelo base ni evaluaciones sobre conjuntos como Common Voice, FLEURS o MUCS.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 3,1 GB solo para pesos, más memoria para activaciones y el buffer de audio.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos, con margen adicional para el encoder y la caché del decoder.
- VRAM estimada en int8: aproximadamente 0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650 4 GB, RTX 3050, T4). Una RTX 3060 de 12 GB, una RTX 4090 o una A100 ofrecen margen de sobra y permiten procesar varios flujos en paralelo.
- Compatibilidad con GPU de consumo: sí. Con 764 millones de parámetros, el modelo cabe holgadamente en tarjetas de gama media y en CPU mediante cuantización.
- Opciones de despliegue: `transformers` con PyTorch, `faster-whisper` (CTranslate2), `whisper.cpp` tras convertir los pesos a GGML/GGUF, y servidores de inferencia ASR dedicados. vLLM no es una opción habitual para Whisper.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto de audio | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (whisper-medium fine-tuned, hinglish) | 763,9 M | No declarados (se sugiere hindi/inglés) | No disponible | 30 s por pasada (arquitectura Whisper) | HuggingFace, 8 descargas |
| openai/whisper-medium | 769 M | ~99 idiomas | MIT | 30 s por pasada | HuggingFace, ampliamente desplegado |
| openai/whisper-small | 244 M | ~99 idiomas | MIT | 30 s por pasada | HuggingFace, muy usado en producción |
| openai/whisper-large-v3 | 1550 M | ~99 idiomas | MIT | 30 s por pasada | HuggingFace, referencia en precisión |

La comparación directa con el modelo base solo es posible en términos de tamaño y licencia: no existen métricas de este checkpoint que permitan afirmar que mejora a `openai/whisper-medium` en hinglish, aunque el ajuste específico apunta a ese objetivo.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ni dataset declarado, ni metodología de evaluación.
- Licencia no especificada: sin licencia explícita no se puede asumir permiso de uso comercial. Es un bloqueo legal para cualquier despliegue en producto.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste, no se puede evaluar el sesgo por acento, género, edad o variedad dialectal. Los modelos ajustados en datasets pequeños suelen degradar su rendimiento en dominios alejados de los datos de entrenamiento.
- Riesgo de olvido catastrófico: un ajuste fino sobre Whisper medium puede degradar las capacidades multilingües y de traducción del modelo original, especialmente si el dataset era reducido o muy especializado.
- Riesgo de alucinación: los modelos de la familia Whisper tienden a generar texto plausible en tramos de silencio, ruido o audio ininteligible, y este comportamiento puede verse acentuado tras un ajuste con datos específicos.
- Idiomas no declarados: fuera del par hindi/inglés que sugiere el nombre, se desconoce el comportamiento del modelo.
- Contexto limitado a 30 segundos por pasada: la arquitectura Whisper obliga a segmentar audios largos, lo que introduce errores en las fronteras de segmento y complica el mantenimiento de coherencia en conversaciones largas.
- Artefacto de investigación: con 8 descargas y sin validación comunitaria, no hay evidencia de robustez en producción.
- Fecha de creación atípica: el repositorio figura como creado en septiembre de 2026, posterior a la fecha de la mayoría de referencias disponibles, lo que refuerza la falta de contexto externo verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/whisper-medium_mucs_63022_ratio_25_45_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT
- Modelo base de referencia (Whisper medium de OpenAI): https://huggingface.co/openai/whisper-medium
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- No se han encontrado enlaces relevantes al modelo, a su dataset o a sus resultados en la búsqueda web realizada; los resultados devueltos trataban sobre ChatGPT, GitHub Copilot y otros temas sin relación con este checkpoint.
