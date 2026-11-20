# juice500/wavlm-24-efficiency-1_128-phonemodel

## Resumen

wavlm-24-efficiency-1_128-phonemodel es un modelo de segmentación y reconocimiento fonético construido sobre el encoder autocontenido WavLM-large (capa 24, 16 kHz) de Microsoft. Lo desarrolla el grupo de investigación detrás de la técnica SPAM (S3M-based Phonological Activation Mapping), presentada en el paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). El modelo no es un LLM: es un adaptador que proyecta las representaciones del encoder congelado a un vector de 43 activaciones fonológicas interpretables (voicing, nasalidad, estridencia, etc.) y, a partir de ahí, realiza segmentación y reconocimiento de fonemas.

La relevancia de esta variante concreta es su estudio de eficiencia muestral: se ha entrenado únicamente con 1/128 de las emisiones de entrenamiento de TIMIT, lo que la convierte en una ablación útil para medir cuánto rinde el enfoque SPAM con muy pocos datos supervisados. El resultado es un modelo ligero, con licencia MIT y pensado para investigación fonética y prototipado rápido, no para producción a gran escala.

El modelo se distribuye a través de la librería `phonespam`, que expone una API de alto nivel (`PhoneModel.transcribe`) y acceso directo a la representación fonológica intermedia (`model.spam`). Está entrenado sobre TIMIT y declarado para inglés, aunque permite restringir el vocabulario de reconocimiento a inventarios de otras lenguas mediante PHOIBLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder WavLM-large congelado (capa 24) |
| Parametros totales | No disponible (el adaptador es ligero; el encoder base WavLM-large ronda los 317 M, dato no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio a 16 kHz por frames; ventana no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`); reconocimiento configurable a otros inventarios vía PHOIBLE |
| Licencia | MIT (PHOIBLE 2.0 se descarga en tiempo de ejecución bajo CC BY-SA 3.0) |
| Formato de pesos | No disponible (repo de 0.0 GB; empaquetado vía librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/wavlm-large`, un encoder transformer autocontenido para habla, que se mantiene congelado. Sobre las features de la capa 24, un adaptador SPAM aprende a mapear cada frame a un vector de 43 activaciones fonológicas en el rango [0, 1] (etiquetas como `silence+`, `syl+`, `son+`). A partir de esa representación interpretable, dos cabezas realizan la segmentación y el reconocimiento de fonemas. La innovación clave es la interpretabilidad: en lugar de clasificar fonemas directamente desde una representación opaca, se pasa por un espacio fonológico con significado lingüístico.

El entrenamiento usa el corpus TIMIT (`timit-asr/timit_asr`). Esta variante concreta corresponde a la ablación de eficiencia muestral de la Figura 3 del paper: se ajusta solo con 1/128 de las emisiones de entrenamiento de TIMIT. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de modelo).

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Representación fonológica interpretable de 43 dimensiones por frame (rasgos como voicing, nasalidad, estridencia).
- Restricción de vocabulario por lengua mediante `vocab_for_language` e inventarios PHOIBLE.
- Procesamiento de audio a 16 kHz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo de texto).
- No dispone de visión, audio generativo ni modo "thinking".

## Casos de uso

- Investigación fonética y fonológica: extraer la matriz de activaciones SPAM (frames x 43) para analizar qué rasgos activa el encoder en cada tramo de audio y contrastarlo con hipótesis lingüísticas.
- Anotación asistida de corpus de habla: generar alineaciones fonéticas preliminares sobre TIMIT u otros corpus ingleses para revisión humana posterior, acelerando el etiquetado manual.
- Estudio de eficiencia muestral: servir como referencia de ablación (1/128 de datos) para comparar con variantes entrenadas con más datos y medir la curva de rendimiento frente al tamaño del conjunto de entrenamiento.
- Prototipado de sistemas de pronunciación: integrar la segmentación y el etiquetado fonético en herramientas de evaluación de pronunciación o de análisis acústico, dado el bajo coste computacional del adaptador.
- Docencia y demostraciones: usar la demo de Streamlit y la API `transcribe` para ilustrar en clase el paso de una señal de audio a una secuencia de fonemas con tiempos.
- Experimentos multilingües exploratorios: aplicar `vocab_for_language` con inventarios PHOIBLE de otras lenguas para probar la transferibilidad del espacio fonológico, con las cautelas propias de un modelo entrenado solo en inglés.
- Análisis de rasgos en pipelines de investigación: consumir `model.spam(...)` como extractor de features fonológicas interpretables para modelos posteriores de clasificación o clustering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador ligero sobre WavLM-large congelado, la inferencia es viable en GPU de consumo, aunque no se confirman cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de uso menciona `device="cuda"` para GPU.
- Compatibilidad con GPU de consumo: probable por el tamaño del encoder base, pero sin datos confirmados.
- Opciones de despliegue: la librería `phonespam` (instalable con `pip install phonespam`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-24-efficiency-1_128-phonemodel | WavLM-large (capa 24) | Segmentación y reconocimiento fonético | 1/128 de TIMIT | MIT | Hugging Face + librería `phonespam` |
| Otras variantes SPAM del mismo autor | WavLM-large | Segmentación y reconocimiento fonético | No disponible | No disponible | No disponible en la información proporcionada |
| WavLM-large original (Microsoft) | WavLM-large | Representaciones de habla autocontenidas | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TIMIT en inglés: el rendimiento fuera de ese dominio (otras lenguas, ruido, habla espontánea) no está validado.
- Variante de eficiencia muestral (1/128 de los datos): su precisión es previsiblemente inferior a la de variantes entrenadas con el conjunto completo; no debe tomarse como referencia de calidad máxima del método.
- Riesgo de errores de etiquetado fonético y de desalineación de fronteras de segmento, especialmente en coarticulación y habla rápida.
- El uso de `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; conviene revisar obligaciones de atribución y share-alike en productos derivados.
- El repo del modelo aparece con tamaño de 0.0 GB en Hugging Face; verificar la integridad de la descarga antes de usarlo en pipelines automatizados.
- Sin datos públicos de benchmarks, latencia ni consumo de VRAM: realizar una evaluación propia antes de cualquier uso en producción.
- No es un modelo generativo: no admite prompts de texto, tool calling ni razonamiento; su ámbito es estrictamente el análisis fonético del habla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_128-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
