# mradermacher/Climb-1.3-Photon-GGUF

## Resumen

Climb-1.3-Photon-GGUF es una republicación en formato GGUF del modelo Climb-1.3-Photon, originalmente publicado por Climb-Ai bajo el identificador `Climb-Ai/Climb-1.3-Photon`. Esta versión ha sido generada por mradermacher, un perfil conocido en Hugging Face por producir cuantizaciones estáticas de modelos de terceros para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El repositorio no incluye información sobre la arquitectura, el tamaño de parámetros, la longitud de contexto ni los datos de entrenamiento del modelo original. La model card se limita a metadatos técnicos del proceso de cuantización (versión de quantize, tipo de conversión `hf`, y la lista de cuantizaciones generadas), sin describir capacidades ni procedencia de los pesos base.

La relevancia de esta ficha es, por tanto, limitada: se trata de un artefacto de distribución de cuantizaciones (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS) cuyo interés depende enteramente del modelo original Climb-1.3-Photon, del que no se dispone de documentación en la información proporcionada. Cualquier evaluación de calidad, rendimiento o idoneidad para producción requiere consultar el repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Climb-1.3-Photon: la model card del repositorio GGUF no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

Lo único verificable en este repositorio es el proceso de cuantización: se han generado cuantizaciones estáticas a partir de pesos en formato Hugging Face (`convert_type: hf`), con la versión 2 del pipeline de cuantización de mradermacher y cuantización de tensores de salida activada (`output_tensor_quantised: 1`). No se ha incluido un tensor `mmproj`, lo que sugiere que el modelo base no incorpora capacidades multimodales de visión, aunque este extremo no se confirma explícitamente.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta modo de razonamiento explícito (thinking mode), visión ni audio.
- La única capacidad verificable es la de ejecución en formato GGUF mediante motores compatibles (llama.cpp y derivados).

## Casos de uso

- Despliegue en CPU o GPU de gama baja: las cuantizaciones Q2_K a Q4_K_S permiten ejecutar el modelo en hardware con memoria limitada mediante llama.cpp, siempre que se valide previamente la calidad del modelo base.
- Pruebas de integración en pipelines locales: usar las variantes Q5_K_M o Q6_K para evaluar el comportamiento del modelo en flujos de trabajo existentes antes de comprometerse con una versión de mayor precisión.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un rango amplio (12 variantes) que permite medir la degradación de calidad entre F16 y Q2_K en una misma tarea.
- Prototipado offline: al ser un artefacto GGUF, puede ejecutarse en entornos sin conectividad ni acceso a APIs externas, útil para pruebas de concepto en local.
- Distribución en dispositivos de borde: las variantes de menor tamaño (Q2_K, Q3_K_S) podrían desplegarse en equipos con poca memoria, sujeto a verificación empírica de resultados.
- Archivado y reproducibilidad: conservar las cuantizaciones junto al modelo original para garantizar la reproducibilidad de experimentos que dependan de pesos cuantizados concretos.

En todos los casos, la idoneidad depende de factores no documentados aquí (calidad del modelo base, licencia, idiomas); deben validarse contra el repositorio `Climb-Ai/Climb-1.3-Photon`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo base.
- GPU recomendadas: no disponible por la misma razón.
- Viabilidad en GPU de consumo: no determinable sin conocer el tamaño del modelo; las cuantizaciones Q2_K a Q4_K_S están pensadas para minimizar el uso de memoria, pero no se puede confirmar que quepan en tarjetas concretas.
- Opciones de despliegue: llama.cpp y motores compatibles con GGUF (Ollama, LM Studio, entre otros). No consta compatibilidad con vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas de la misma categoría, tamaño o tarea con las que establecer una comparación fundamentada.

## Limitaciones y advertencias

- Ausencia total de documentación: no se conocen arquitectura, tamaño, contexto, idiomas ni datos de entrenamiento del modelo base.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio original `Climb-Ai/Climb-1.3-Photon` antes de cualquier despliegue en producción.
- Riesgo de alucinación y sesgos: no evaluables sin información sobre el entrenamiento y la alineación del modelo.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad respecto a F16; no se han publicado evaluaciones de dicha degradación.
- El repositorio es una republicación de terceros (mradermacher), no el artefacto oficial del autor del modelo; pueden existir diferencias o desactualizaciones respecto al original.
- Sin descargas ni likes registrados en el momento de la consulta, lo que no aporta señal alguna sobre la calidad o adopción del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Climb-1.3-Photon-GGUF
- Modelo original: https://huggingface.co/Climb-Ai/Climb-1.3-Photon
