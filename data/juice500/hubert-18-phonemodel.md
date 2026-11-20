# juice500/hubert-18-phonemodel

## Resumen

hubert-18-phonemodel es un adaptador de segmentación y reconocimiento de fonemas construido sobre las representaciones congeladas de HuBERT-large (facebook/hubert-large-ll60k), concretamente sobre la capa 18 del codificador. Lo desarrolla el autor juice500 en el marco del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo no es un LLM ni un modelo generativo: es un cabezal de predicción fonológica que transforma cada frame del codificador HuBERT en un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.), a partir del cual se derivan segmentos con etiqueta fonética.

El problema que resuelve es la opacidad de los modelos auto-supervisados de habla (S3M): HuBERT y similares producen representaciones latentes difíciles de interpretar, y la segmentación fonética tradicional requiere alineamientos forzados o modelos supervisados específicos. SPAM propone mapear esas representaciones a un espacio fonológicamente interpretable y leer de ahí tanto los límites de segmento como las etiquetas de fonema. Este checkpoint concreto es un punto de la rejilla codificador x capa del paper (Figura 2), no el mejor modelo del estudio: el propio autor remite a juice500/wavlm-24-phonemodel como la variante de referencia.

Es relevante para investigación en fonética computacional, evaluación de S3M y aplicaciones de análisis del habla que necesitan alineamiento a nivel de fonema sin un sistema ASR completo. El alcance es limitado: solo inglés en los datos de entrenamiento (TIMIT), licencia MIT para el modelo y el código, y una librería propia (phonespam) como única vía de uso documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre HuBERT-large congelado (transformer, capa 18); cabezal de activación fonológica SPAM |
| Parametros totales | no disponible (el repo tiene 0.0 GB; el adaptador es ligero sobre HuBERT-large, cuyos parámetros no se especifican en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (modelo y código); PHOIBLE 2.0 se descarga en runtime bajo CC BY-SA 3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB, cargado con `PhoneModel.from_pretrained` de la librería phonespam) |

## Arquitectura y entrenamiento

El modelo reutiliza HuBERT-large (facebook/hubert-large-ll60k) como extractor de características congelado y opera sobre la salida de su capa 18. Sobre esas activaciones se aplica SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame a un vector de 43 rasgos fonológicos con valores en [0, 1] (nombres como "silence+", "syl+", "son+"). A partir de esa representación interpretable, dos cabezales leen el resultado: uno de segmentación (detección de fronteras entre fonemas) y otro de reconocimiento (asignación de etiqueta). La API `transcribe` encadena ambos y devuelve segmentos contiguos con tiempos en segundos.

El entrenamiento se realizó sobre el dataset TIMIT (timit-asr/timit_asr), corpus de habla inglesa con anotaciones fonéticas a nivel de fonema, lo que explica el soporte monolingüe declarado. La información disponible no detalla el número de tokens de audio, la composición exacta del conjunto ni si hubo etapas de ajuste adicionales más allá del entrenamiento supervisado de los cabezales sobre características congeladas. La innovación técnica central es precisamente el mapeo a rasgos fonológicos: convierte una representación latente opaca en un espacio con interpretación lingüística, lo que permite inspeccionar qué rasgos activa el codificador en cada frame y restringir el vocabulario de reconocimiento a inventarios fonológicos externos (PHOIBLE) en lugar de a un conjunto cerrado de etiquetas.

## Capacidades

- Segmentación fonética: detección de fronteras entre fonemas con marcas temporales en segundos (`Segment(start, end, label)`).
- Reconocimiento de fonemas: etiquetado de cada segmento con un símbolo fonético.
- Extracción de rasgos fonológicos interpretables: vector de 43 activaciones en [0, 1] por frame, con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de una lengua dada.
- Inspección de la representación interna del codificador HuBERT en la capa 18.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo de análisis del habla, no un modelo de lenguaje.
- Capacidades multilingües: no entrenado en otras lenguas; el filtrado por inventario PHOIBLE es un mecanismo de decodificación, no un entrenamiento multilingüe.

## Casos de uso

- Investigación en fonética computacional: obtener alineamientos a nivel de fonema sobre TIMIT o corpus ingleses comparables para analizar fenómenos de coarticulación y duración segmental, usando los tiempos de inicio y fin que devuelve `transcribe`.
- Evaluación de modelos auto-supervisados de habla: comparar qué rasgos fonológicos activa la capa 18 de HuBERT frente a otras capas o codificadores (por ejemplo WavLM en el checkpoint de referencia), inspeccionando el vector SPAM de 43 dimensiones.
- Análisis de pronunciación en enseñanza de inglés: segmentar una locución y contrastar la secuencia de fonemas producida con la esperada para detectar sustituciones u omisiones a nivel segmental.
- Preprocesado para pipelines de síntesis o reconocimiento: generar alineamientos fonéticos que alimenten modelos acústicos o sistemas TTS que requieran duraciones por fonema.
- Estudios de variación dialectal: transcribir muestras de distintas variedades del inglés y analizar diferencias en el inventario y la realización de fonemas.
- Docencia y demostraciones interactivas: el demo público en Streamlit permite ilustrar segmentación fonética sin infraestructura propia, útil en asignaturas de lingüística o procesamiento del habla.
- Exploración de inventarios cross-lingüísticos: aplicar `vocab_for_language` con inventarios PHOIBLE para probar hasta qué punto las representaciones de HuBERT, entrenadas en inglés, se adaptan a la decodificación en otras lenguas (con las cautelas del caso, al no haber entrenamiento en esas lenguas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (tasas de error de frontera, precisión de etiquetado fonético ni comparaciones cuantitativas) para este checkpoint; el paper referenciado (arXiv:2607.09020) es la fuente donde deberían consultarse los resultados del estudio completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador es ligero, pero requiere cargar HuBERT-large congelado, lo que domina el consumo.
- GPU recomendadas: no especificadas por el autor. La API admite `device="cuda"`; por el tamaño del codificador base (HuBERT-large), una GPU con memoria suficiente para un modelo de esa escala es el requisito práctico.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; depende de la memoria que exija HuBERT-large más el adaptador, dato no publicado.
- Opciones de despliegue: la única vía documentada es la librería `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| juice500/hubert-18-phonemodel | HuBERT-large | 18 | Segmentación y reconocimiento de fonemas | en | MIT | Checkpoint intermedio de la rejilla del paper |
| juice500/wavlm-24-phonemodel | WavLM | 24 | Segmentación y reconocimiento de fonemas | en | no disponible en la información | Señalado por el autor como el mejor modelo del estudio |
| HuBERT-large (facebook/hubert-large-ll60k) | — | — | Representaciones auto-supervisadas de habla | en (preentrenamiento) | no disponible en la información | Modelo base; no realiza segmentación fonética por sí mismo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a la configuración arquitectónica y a la indicación del autor sobre cuál es el mejor checkpoint.

## Limitaciones y advertencias

- Entrenado únicamente con TIMIT (inglés): el rendimiento fuera del dominio de TIMIT (otras variedades, ruido, habla espontánea) no está documentado y es previsible que degrade.
- No es el mejor checkpoint del estudio: el propio autor remite a wavlm-24-phonemodel para el mejor resultado; usar este modelo como referencia de calidad del método sería un error.
- Sin métricas publicadas en la model card: no hay evidencia numérica de precisión de fronteras ni de etiquetado para este punto de la rejilla.
- Repositorio con 0 descargas y 0 likes y tamaño de 0.0 GB: la disponibilidad efectiva de los pesos y su integridad no están verificadas por la comunidad.
- Dependencia de la librería `phonespam` y de su API concreta; no hay formato de pesos alternativo documentado ni integración con ecosistemas estándar (Transformers, etc.).
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución bajo CC BY-SA 3.0, licencia distinta de la MIT del modelo: hay que revisar obligaciones de atribución y compartición si se redistribuye.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto libre), pero sí puede producir etiquetas fonéticas incorrectas o fronteras espurias en audio fuera de distribución.
- Sesgos: no documentados; al derivar de TIMIT, hereda las características demográficas y de grabación de ese corpus.
- Uso comercial: la licencia MIT del modelo y el código lo permite, pero conviene verificar por separado las condiciones de PHOIBLE y de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-18-phonemodel
- Modelo de referencia del estudio: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/hubert-large-ll60k
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
