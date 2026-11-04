# mradermacher/DeepSeek-R1-Pruned-50B-GGUF

## Resumen

DeepSeek-R1-Pruned-50B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo ubicloud/DeepSeek-R1-Pruned-50B, una versión podada del conocido modelo de razonamiento DeepSeek-R1. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en HuggingFace, y el modelo base procede de ubicloud, que aplicó técnicas de poda (pruning) sobre el modelo original de DeepSeek para reducir su tamaño hasta aproximadamente 49.600 millones de parámetros.

El modelo hereda la naturaleza de razonamiento explícito de la familia DeepSeek-R1, orientada a tareas de matemáticas, código y razonamiento multi-paso mediante cadenas de pensamiento. La poda reduce los requisitos de hardware respecto al modelo completo, aunque el tamaño resultante sigue siendo considerable para despliegues en local.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de razonamiento de gran tamaño en entornos con recursos limitados mediante llama.cpp u otros motores compatibles con GGUF, con múltiples niveles de cuantización que van desde 18,5 GB (Q2_K) hasta 52,9 GB (Q8_0). La información disponible sobre el modelo base es escasa, por lo que muchos datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de DeepSeek-R1, presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 49.632.960.512 (aprox. 49,6 mil millones) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base ubicloud/DeepSeek-R1-Pruned-50B en la documentación proporcionada. Por la denominación y el origen (DeepSeek-R1), cabe esperar una arquitectura transformer con capacidad de razonamiento explícito mediante cadenas de pensamiento, pero no se confirma en la información disponible si se trata de un modelo denso o de mezcla de expertos, ni el número de capas, cabezas de atención o dimensión oculta.

Respecto al entrenamiento, no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El proceso de poda aplicado por ubicloud tampoco está documentado en la información disponible. La contribución de mradermacher se limita a la generación de cuantizaciones estáticas en GGUF; la model card indica explícitamente que no se han generado cuantizaciones ponderadas con imatrix en el momento de la publicación, y que estas podrían no estar planificadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base DeepSeek-R1.
- Razonamiento explícito mediante cadenas de pensamiento (thinking), característica de la familia R1, si bien no se confirma en la documentación del modelo podado.
- Razonamiento matemático y resolución de problemas multi-paso, presumiblemente conservado tras la poda (no verificado).
- Generación de código, capacidad típica de los modelos R1 (no verificada en esta variante).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento matemático asistido en local: el modelo puede emplearse para resolver problemas de matemáticas paso a paso en entornos sin conexión, aprovechando su herencia de la familia R1 y ejecutándose mediante llama.cpp con cuantizaciones Q4_K_M (30,3 GB) en estaciones de trabajo con GPU de 48 GB o configuraciones multi-GPU.
- Generación y revisión de código en pipelines internos: integrable en herramientas de desarrollo que requieran un modelo de razonamiento sin dependencia de API externa, usando la cuantización Q5_K_M (35,4 GB) para mayor fidelidad.
- Asistente de análisis técnico en inglés: para documentación, explicación de conceptos complejos y resúmenes razonados, aprovechando la ventana de contexto del modelo base (no confirmada) y su orientación al inglés.
- Experimentación académica con modelos podados: útil para investigadores que quieran estudiar el impacto de la poda en las capacidades de razonamiento comparando esta variante con el DeepSeek-R1 completo.
- Despliegue en servidores con GPU de gama alta para inferencia por lotes: la cuantización Q8_0 (52,9 GB) permite obtener la máxima calidad disponible en este repositorio en nodos con A100 80 GB o H100.
- Prototipado de agentes de razonamiento en inglés: base para construir flujos de razonamiento multi-paso en entornos controlados, siempre que se valide empíricamente la conservación de dichas capacidades tras la poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~18,5 GB de pesos; requiere al menos ~20-22 GB de VRAM para contexto corto.
  - Q3_K_M: ~24,0 GB; requiere ~26-28 GB.
  - IQ4_XS: ~26,8 GB; requiere ~29-31 GB.
  - Q4_K_M: ~30,3 GB; requiere ~33-35 GB.
  - Q5_K_M: ~35,4 GB; requiere ~38-40 GB.
  - Q6_K: ~40,9 GB; requiere ~44-46 GB.
  - Q8_0: ~52,9 GB; requiere ~56-58 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB para las cuantizaciones altas (Q6_K, Q8_0); A100 40 GB o dos RTX 4090/3090 para Q4_K_M y Q5_K_M; configuraciones multi-GPU para cuantizaciones medias.
- En GPU de consumo: Q2_K y Q3_K_S podrían caber en una RTX 4090 (24 GB) con contexto reducido; el resto requiere múltiples GPU o CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo, por lo que se requeriría el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Pruned-50B-GGUF (este) | ~49,6 mil millones | no disponible | no disponible | GGUF | HuggingFace (mradermacher) |
| DeepSeek-R1 (original) | 671 mil millones (MoE, 37 mil millones activos) | 128K (según documentación pública de DeepSeek) | MIT (según documentación pública de DeepSeek) | safetensors, GGUF | HuggingFace (deepseek-ai) |
| ubicloud/DeepSeek-R1-Pruned-50B | ~49,6 mil millones | no disponible | no disponible | safetensors | HuggingFace (ubicloud) |

La comparativa con alternativas de tamaño similar no está disponible en la información proporcionada. Los datos del DeepSeek-R1 original se incluyen como referencia de la familia, pero deben verificarse en su model card oficial.

## Limitaciones y advertencias

- La poda puede degradar las capacidades de razonamiento, matemáticas y código respecto al DeepSeek-R1 completo; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño, potencialmente agravado por la poda.
- Idiomas soportados limitados al inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base (ubicloud/DeepSeek-R1-Pruned-50B) y del DeepSeek-R1 original antes de cualquier despliegue en producción.
- Longitud de contexto no documentada; no se debe asumir la ventana de 128K del R1 original sin verificación empírica.
- El repositorio tiene un tamaño de 338,1 GB, lo que implica descargas parciales (un solo archivo GGUF) para evitar transferencias innecesarias.
- No se han generado cuantizaciones imatrix ponderadas, lo que puede suponer una ligera pérdida de calidad frente a cuantizaciones dinámicas equivalentes.
- Popularidad muy baja (200 descargas, 1 like): escasa validación comunitaria del comportamiento real del modelo.
- El autor de la cuantización no garantiza soporte ni mantenimiento continuado.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/DeepSeek-R1-Pruned-50B-GGUF
- Modelo base podado: https://huggingface.co/ubicloud/DeepSeek-R1-Pruned-50B
- Página de descargas del autor: https://hf.tst.eu/model#DeepSeek-R1-Pruned-50B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
