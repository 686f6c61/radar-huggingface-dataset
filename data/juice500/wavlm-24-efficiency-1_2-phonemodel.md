# juice500/wavlm-24-efficiency-1_2-phonemodel

## Resumen

`juice500/wavlm-24-efficiency-1_2-phonemodel` es un modelo de segmentación y reconocimiento fonético construido sobre el codificador auto-supervisado `microsoft/wavlm-large` (capa 24, audio a 16 kHz). No se trata de un modelo de lenguaje generativo, sino de un adaptador que aplica la técnica SPAM (S3M-based Phonological Activation Mapping), que proyecta cada fotograma del codificador a un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, estridencia, etc.) y a partir de ahí produce segmentos con etiqueta fonética y marcas temporales.

El modelo pertenece a un estudio de ablación de eficiencia de muestras: se ha ajustado únicamente con la mitad de las locuciones de entrenamiento de TIMIT (figura 3 del artículo). Está pensado para investigación en fonética y fonología computacional, evaluación de sistemas de reconocimiento fonético y análisis interpretable de representaciones de modelos de voz auto-supervisados.

Su relevancia actual radica en que demuestra que un adaptador ligero sobre un codificador congelado puede segmentar y reconocer fonemas de forma interpretable, y que dicha capacidad se mantiene con datos de entrenamiento reducidos. La librería asociada, `phonespam`, permite además restringir el vocabulario de reconocimiento al inventario fonológico de un idioma concreto vía PHOIBLE 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre codificador transformer auto-supervisado WavLM-large (capa 24) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por fotogramas; no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado en TIMIT); el vocabulario de reconocimiento puede restringirse a otros inventarios PHOIBLE mediante `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga mediante `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El sistema congela el codificador `microsoft/wavlm-large` (WavLM-large, capa 24, audio de 16 kHz) y entrena un adaptador que implementa SPAM: un mapeo de cada fotograma del codificador a un vector de 43 activaciones de rasgos fonológicos en el rango [0, 1]. Sobre esa representación interpretable se apoyan dos cabezas, una de segmentación y otra de reconocimiento, que producen segmentos contiguos con etiqueta fonética y tiempos en segundos.

El entrenamiento se realizó sobre el conjunto de datos `timit-asr/timit_asr` (TIMIT), en inglés. La variante publicada corresponde a una ablación de eficiencia de muestras: se ajustó con la mitad (1/2) de las locuciones de entrenamiento de TIMIT, según la figura 3 del artículo. No se dispone de información sobre número de tokens, composición detallada del dataset, ni sobre uso de RLHF/DPO (no aplicable en este tipo de modelo). La innovación técnica principal es la representación intermedia interpretable (activaciones fonológicas) que sustituye a la representación opaca del codificador y permite inspeccionar qué rasgos fonológicos activa cada fotograma.

## Capacidades

- Segmentación fonética de audio: devuelve segmentos contiguos con inicio, fin (en segundos) y etiqueta fonética.
- Reconocimiento fonético a partir de audio de 16 kHz.
- Representación fonológica interpretable: `model.spam("utt.wav")` devuelve una matriz de (fotogramas, 43) activaciones en [0, 1] con nombres de rasgo accesibles (`featnames`), como `silence+`, `syl+`, `son+`.
- Restricción del vocabulario de reconocimiento a un inventario fonológico concreto por idioma mediante `vocab_for_language` (descarga PHOIBLE 2.0 en tiempo de ejecución).
- Procesamiento en CPU o GPU (`device="cuda"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo: es un modelo discriminativo de fonética, no un LLM.

## Casos de uso

- Investigación en fonética y fonología computacional: obtener alineamientos fonéticos con marcas temporales sobre corpus de habla para estudiar fenómenos de coarticulación y variación alofónica, aprovechando la representación interpretable de 43 rasgos.
- Análisis de interpretabilidad de modelos auto-supervisados de voz: usar `model.spam()` para examinar qué rasgos fonológicos activa cada fotograma de WavLM-large y comparar capas o codificadores.
- Evaluación de sistemas de reconocimiento fonético: servir como línea base reproducible (adaptador sobre codificador congelado) para comparar con sistemas entrenados de cero.
- Anotación asistida de corpus de habla: pre-segmentar y etiquetar fonemas en inglés para su posterior revisión manual, reduciendo el coste de anotación.
- Estudios de eficiencia de muestras: la variante 1/2 de TIMIT permite analizar cómo degrada el rendimiento al reducir datos de entrenamiento, comparándola con las variantes completas del mismo estudio.
- Experimentos multilingües controlados: restringir el vocabulario de salida a un inventario PHOIBLE de otro idioma (`vocab_for_language("deu")`, por ejemplo) para probar la transferibilidad del adaptador entrenado en inglés.
- Docencia y demostraciones interactivas: el demo en Streamlit permite ilustrar segmentación y rasgos fonológicos sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia la figura 3 del artículo (ablación con 1/2 de los datos de TIMIT) sin incluir cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un codificador WavLM-large congelado más un adaptador ligero, el grueso del coste está en el codificador. No se especifican cifras en la información proporcionada.
- GPU recomendadas: no disponible. El uso documentado admite `device="cuda"`; no se indican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained`; demo público en Streamlit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de segmentación o reconocimiento fonético.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés (TIMIT); el rendimiento en otros idiomas no está validado, aunque la API permita restringir el vocabulario a inventarios PHOIBLE de otras lenguas.
- Variante de eficiencia de muestras: usa solo la mitad de las locuciones de entrenamiento de TIMIT, por lo que cabe esperar un rendimiento inferior a la variante completa del mismo estudio (no se aportan cifras).
- TIMIT es un corpus de habla leída, con condiciones de grabación controladas y hablantes limitados; la generalización a habla espontánea, ruido o acentos no representados es incierta.
- Riesgo de errores de segmentación y etiquetado en fronteras fonéticas y en fonemas con realizaciones acústicas ambiguas; no se documentan tasas de error.
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye ese recurso.
- El repositorio aparece con tamaño de 0.0 GB y sin descargas ni likes en el momento de la consulta; verificar la integridad y disponibilidad de los pesos antes de usarlo en producción.
- No es un modelo generativo: no debe emplearse para tareas de lenguaje, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_2-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Artículo (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
