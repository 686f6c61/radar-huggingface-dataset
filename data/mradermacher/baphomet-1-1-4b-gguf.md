# mradermacher/Baphomet-1.1-4B-GGUF

## Resumen

Baphomet-1.1-4B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Baphomet-1.1-4B, publicado por el usuario CloudGoat. El repositorio lo mantiene mradermacher, un perfil conocido por generar y distribuir versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El objetivo de este repositorio no es ofrecer un modelo nuevo, sino facilitar el despliegue del modelo original en hardware con recursos limitados mediante múltiples niveles de cuantización.

La información disponible es muy escasa: no se especifican la licencia, los idiomas soportados ni la arquitectura del modelo base. El dato de parámetros totales registrado en safetensors es de 333.514.240, una cifra notablemente inferior a los 4B que sugiere el nombre del modelo, lo que indica una posible inconsistencia entre el etiquetado y los pesos reales, o que el dato corresponde a un componente parcial del modelo.

A pesar de la falta de documentación, el repositorio resulta relevante para desarrolladores que quieran probar el modelo Baphomet-1.1-4B en CPU o GPU de gama baja, ya que ofrece cuantizaciones desde Q2_K hasta Q8_0 y F16, cubriendo un amplio rango de compromisos entre calidad y consumo de memoria. El tamaño total del repositorio es de 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (según safetensors); el nombre indica 4B, dato inconsistente |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Baphomet-1.1-4B. El repositorio únicamente contiene cuantizaciones estáticas generadas a partir de los pesos originales alojados en CloudGoat/Baphomet-1.1-4B. Los metadatos internos del proceso de cuantización indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversión se realizó desde un checkpoint en formato Hugging Face.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta si el modelo emplea una arquitectura transformer estándar, MoE o híbrida.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje, aunque no está documentada explícitamente.
- Razonamiento y código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

La ausencia de model card detallada impide confirmar cualquiera de estas capacidades. Cualquier evaluación funcional requeriría probar el modelo directamente.

## Casos de uso

- Pruebas locales en CPU: las cuantizaciones Q2_K y Q3_K_S permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp, útil para experimentación y prototipado rápido.
- Despliegue en GPUs de gama baja: las variantes Q4_K_M y Q5_K_M ofrecen un equilibrio razonable entre calidad y consumo de VRAM para tarjetas con 4-8 GB.
- Integración en pipelines de generación de texto: el formato GGUF es compatible con llama.cpp, Ollama y servidores compatibles, lo que facilita su inclusión en flujos de trabajo existentes.
- Evaluación comparativa de cuantizaciones: al incluir 12 variantes, el repositorio sirve para medir el impacto de la cuantización en la calidad de salida sobre un mismo modelo base.
- Experimentación académica: investigadores que necesiten un modelo pequeño para pruebas de prompting o análisis de sesgos pueden usar las versiones más ligeras sin requerir infraestructura costosa.
- Desarrollo de aplicaciones de escritorio: la variante Q4_K_S, con un tamaño de archivo reducido, es adecuada para aplicaciones locales que necesiten generación de texto sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que el número real de parámetros es incierto. Como referencia, un modelo de 4B en Q4_K_M requiere aproximadamente 2,5-3 GB de VRAM, mientras que en F16 necesitaría unos 8 GB.
- GPU recomendadas: no disponible. Para las cuantizaciones más ligeras, una GPU consumer con 4-6 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) podría ser suficiente; para F16 se requeriría una GPU con 8 GB o más (RTX 3060, RTX 4060).
- Cabe en GPU consumer: probablemente sí en las cuantizaciones Q2_K a Q5_K_M, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se documenta soporte para vLLM o TGI, que normalmente requieren formatos distintos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con información suficiente para establecer una comparación rigurosa, dado que se desconoce la arquitectura, el contexto y el rendimiento del modelo base.

## Limitaciones y advertencias

- Licencia desconocida: no se especifica la licencia del modelo original ni de las cuantizaciones, lo que impide confirmar si el uso comercial está permitido.
- Idiomas no documentados: se desconoce qué lenguas soporta el modelo y con qué calidad.
- Inconsistencia en el número de parámetros: el nombre indica 4B pero el dato de safetensors registra 333 millones, lo que sugiere que el modelo podría no ser el anunciado o que el dato es parcial.
- Riesgo de alucinación: inherente a los modelos de lenguaje, sin datos específicos sobre mitigaciones.
- Sesgos conocidos: no disponible.
- Sin model card detallada: no hay información sobre limitaciones de contexto, entrenamiento o uso previsto.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026): el repositorio muestra una fecha de creación posterior a la actual, lo que puede indicar un error de metadatos o una publicación programada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Baphomet-1.1-4B-GGUF
- Modelo original: https://huggingface.co/CloudGoat/Baphomet-1.1-4B
