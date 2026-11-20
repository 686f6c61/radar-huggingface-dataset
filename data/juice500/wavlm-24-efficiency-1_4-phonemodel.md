# juice500/wavlm-24-efficiency-1_4-phonemodel

## Resumen

`wavlm-24-efficiency-1_4-phonemodel` es un modelo de segmentación y reconocimiento fonético construido sobre el encoder auto-supervisado `microsoft/wavlm-large` (capa 24, audio a 16 kHz). Lo desarrolla el autor de Hugging Face `juice500` en el contexto del trabajo SPAM (S3M-based Phonological Activation Mapping), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo no es un LLM ni un modelo generativo de texto: es un cabezal de adaptación sobre features congeladas que proyecta cada frame acústico a un vector de 43 activaciones fonológicas (sonoridad, nasalidad, estridencia, etc.) y, a partir de esa representación interpretable, resuelve dos tareas: segmentación en fonos y clasificación de etiquetas fonéticas.

La propuesta resuelve el problema de opacidad de los encoders auto-supervisados de voz: en lugar de entrenar un clasificador de fonos de caja negra, SPAM convierte la representación interna del S3M en un mapa de rasgos fonológicos con interpretación lingüística directa. Esta variante concreta es un ablación de eficiencia de datos: se ha ajustado únicamente con el 25 % de las emisiones de entrenamiento de TIMIT (1/4 de los datos), lo que permite medir cuánto degrada la reducción de supervisión frente al modelo completo.

Es relevante para investigadores en fonética computacional, ASR de baja supervisión y evaluación de S3M, porque ofrece una vía de evaluación de la calidad de las representaciones de WavLM-large con un modelo pequeño, ligero y de licencia MIT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados en el repositorio o que el contenido es mínimo; este dato debe verificarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (SPAM) sobre encoder WavLM-large congelado; proyección frame a frame a 43 activaciones fonológicas y cabezales de segmentación y reconocimiento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por frames; WavLM-large opera sobre ventanas de audio, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento admite inventarios PHOIBLE de otros idiomas mediante `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `phonespam`; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

El modelo es un adaptador ligero sobre `microsoft/wavlm-large`, un transformer de voz auto-supervisado de tipo WavLM del que se usa la capa 24 y la representación a 16 kHz. El encoder permanece congelado; el adaptador SPAM aprende a mapear cada frame del encoder a un vector de 43 activaciones fonológicas en el rango [0, 1], con nombres de rasgo accesibles vía `spam.featnames` (por ejemplo `silence+`, `syl+`, `son+`). Sobre esa representación interpretable se apoyan dos cabezales: uno de segmentación temporal (fronteras entre fonos) y otro de reconocimiento (etiqueta fonética por segmento).

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr`. Esta variante corresponde a un ablación de eficiencia de muestras: se ajustó con 1/4 de las emisiones de entrenamiento de TIMIT, tal y como se describe en la Figura 3 del paper. No se dispone de información sobre el número total de tokens de audio, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). La innovación técnica destacable es la propia SPAM: sustituir una clasificación de fonos opaca por una activación fonológica intermedia interpretable, lo que permite inspeccionar qué rasgos activa el encoder en cada frame.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos mediante `model.transcribe("utt.wav")`.
- Reconocimiento de fonos: asigna una etiqueta fonética a cada segmento detectado.
- Mapa de activaciones fonológicas interpretable: `model.spam("utt.wav")` devuelve una matriz de (frames, 43) con activaciones en [0, 1] y nombres de rasgo.
- Restricción de vocabulario por inventario fonológico: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE del idioma indicado.
- Procesamiento de audio a 16 kHz con features de WavLM-large capa 24.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidad multilingüe limitada: el modelo está entrenado en inglés; el soporte de otros idiomas depende del inventario PHOIBLE que se pase como vocabulario, sin garantía de precisión.

## Casos de uso

- Investigación en fonética computacional: extraer los mapas de 43 activaciones fonológicas de un corpus de audio para analizar qué rasgos (sonoridad, nasalidad, estridencia) activa WavLM-large en cada frame, y comparar entre capas o entre modelos S3M.
- Evaluación de eficiencia de datos en S3M: usar esta variante entrenada con 1/4 de TIMIT como referencia de ablación frente al modelo completo, para cuantificar la pérdida de rendimiento al reducir la supervisión.
- Preetiquetado fonético de corpus: generar segmentaciones y etiquetas preliminares sobre grabaciones en inglés que después se revisan manualmente, acelerando la anotación de corpus fonéticos.
- Análisis de pronunciación y estudios de variación: alinear los segmentos detectados con transcripciones esperadas para localizar inserciones, elisiones o sustituciones de fonos en habla leída.
- Docencia y demostraciones interactivas: el demo en Streamlit permite mostrar en vivo cómo un encoder auto-supervisado se descompone en rasgos fonológicos interpretables, útil en cursos de lingüística y procesado de voz.
- Prototipado de sistemas de reconocimiento fonético de bajo coste: al ser un adaptador sobre un encoder congelado, el ajuste y la inferencia requieren muchos menos recursos que entrenar un ASR completo, lo que facilita experimentos rápidos en una sola GPU.
- Integración en pipelines de investigación reproducibles: la API `PhoneModel.from_pretrained` y la salida estructurada en tuplas `Segment(start, end, label)` permiten encadenar el modelo en scripts de análisis sin postprocesado complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El encoder base es WavLM-large (arquitectura de tipo transformer grande), lo que en fp32 suele requerir del orden de varios GB de VRAM; no se especifica el consumo del adaptador ni el total.
- GPU recomendadas: no disponible en la información proporcionada. La API admite `device="cuda"`, pero no se indican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: no disponible; no se confirma ni se descarta.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`), con carga vía `PhoneModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de voz de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/wavlm-24-efficiency-1_4-phonemodel | WavLM-large, capa 24 | Segmentación y reconocimiento fonético con mapa fonológico interpretable | 1/4 de TIMIT train | MIT | Hugging Face (`juice500`), 0 descargas |
| Variante completa del mismo trabajo (SPAM sin ablación) | WavLM-large, capa 24 | Igual, con todos los datos de TIMIT | TIMIT train completo | no disponible | no disponible en la información proporcionada |
| `microsoft/wavlm-large` | WavLM-large | Encoder auto-supervisado genérico (no resuelve segmentación ni reconocimiento por sí solo) | Corpus auto-supervisado a gran escala | MIT (según el modelo base) | Hugging Face (`microsoft`) |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en inglés (TIMIT); el uso con otros idiomas vía `vocab_for_language` no está validado y puede producir etiquetas incorrectas.
- Entrenado con solo 1/4 de las emisiones de TIMIT: es una ablación de eficiencia de datos y, por diseño, cabe esperar un rendimiento inferior al de la variante completa; no se publican métricas que lo cuantifiquen.
- TIMIT es un corpus de habla leída, con hablantes y condiciones de grabación limitadas; la generalización a habla espontánea, ruido o acentos no está documentada.
- El repositorio muestra 0 descargas, 0 likes y un tamaño de 0.0 GB; conviene verificar que los pesos estén realmente disponibles antes de integrarlo en cualquier flujo.
- La licencia del modelo es MIT, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; esto puede afectar a la distribución de derivados que incorporen ese vocabulario.
- Riesgo de alucinación en el sentido de segmentaciones o etiquetas espurias: al ser un modelo discriminativo, el fallo se manifiesta como fronteras mal colocadas o fonos mal clasificados, no como texto inventado.
- No se documentan sesgos por hablante, género, edad o variedad dialectal; dado el origen en TIMIT, es probable un sesgo hacia las variedades representadas en ese corpus.
- No apto para generación de texto, agentes, tool calling ni tareas multimodales: su alcance es estrictamente fonético sobre audio.
- No se especifican requisitos de hardware, formatos de pesos ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_4-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT ASR: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
