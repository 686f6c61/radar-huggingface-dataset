# Kanjdoes/Gemma-4-26B-A4B-StylizedDecensor

# Kanjdoes/Gemma-4-26B-A4B-StylizedDecensor

## Resumen
Kanjdoes/Gemma-4-26B-A4B-StylizedDecensor es una adaptacion en formato GGUF del modelo Gemma 4 26B-A4B desarrollado por Google DeepMind. La subida corre a cargo del usuario Kanjdoes, que distribuye pesos cuantizados listos para inferencia local mediante llama.cpp y herramientas compatibles. El repositorio ocupa 14,2 GB y declara 25.233.142.046 parametros (~25,2 mil millones) a partir de los datos de safetensors.

El modelo base, Gemma 4 26B-A4B, es un transformer con arquitectura de mezcla de expertos (MoE) que activa aproximadamente 3,8 mil millones de parametros sobre un total de 26 mil millones, con una ventana de contexto de hasta 256K tokens y soporte de mas de 140 idiomas. Se trata de un modelo multimodal que acepta texto e imagen como entrada y genera texto. Google lo encuadra en una familia con tamanos E2B, E4B, 12B, 26B A4B y 31B.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el sufijo "StylizedDecensor" del nombre sugiere un ajuste de estilo y una posible eliminacion o atenuacion de las capas de alineacion de seguridad, pero la model card del autor unicamente contiene el campo de licencia, sin documentacion tecnica, datos de entrenamiento ni evaluaciones. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto sin validacion publica por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) segun el modelo base Gemma 4 26B-A4B; no confirmada para esta adaptacion |
| Parametros totales | 25.233.142.046 (~25,2 B), segun safetensors |
| Parametros activos | ~3,8 B en el modelo base Gemma 4 26B-A4B; no confirmado para esta adaptacion |
| Longitud de contexto | Hasta 256K tokens en el modelo base; no confirmada para esta adaptacion |
| Tipos de cuantizacion | GGUF; los niveles concretos publicados no estan detallados en la informacion disponible |
| Idiomas soportados | No disponible (el modelo base soporta mas de 140 idiomas) |
| Licencia | Apache 2.0 (declarada por el autor de la adaptacion) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo base Gemma 4 26B-A4B emplea una arquitectura de mezcla de expertos con aproximadamente 3,8 mil millones de parametros activos por token sobre un total de 26 mil millones, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. La familia Gemma 4 combina variantes densas (E2B, E4B, 12B y 31B) con esta variante MoE, y esta disenada para procesar texto e imagen como entrada generando texto como salida. La documentacion de Google situa la ventana de contexto en hasta 256K tokens y el soporte multilingue por encima de 140 idiomas.

No se dispone de informacion sobre el proceso de adaptacion aplicado por Kanjdoes: se desconoce si se trata de un fine-tuning supervisado, un merge de pesos, una ablacion de capas de alineacion o una simple conversion de formato seguida de un prompt de estilo. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre tecnicas como decodificacion especulativa. El repositorio solo contiene pesos GGUF, sin scripts de conversion, configuracion de tokenizador ni informes de evaluacion.

## Capacidades
- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Razonamiento, generacion de codigo y matematicas heredados del modelo base Gemma 4 26B-A4B, aunque no verificados en esta adaptacion.
- Procesamiento multimodal de texto e imagen en el modelo base; no confirmado que la adaptacion conserve la torre de vision.
- Soporte multilingue (mas de 140 idiomas en el modelo base); no confirmado en la adaptacion.
- Compatibilidad declarada con endpoints de inferencia (etiqueta "endpoints_compatible").
- Posible modo de estilo y menor tendencia al rechazo de peticiones, deducido del nombre "StylizedDecensor"; no documentado por el autor.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o modo "thinking" explicito: no disponible.

## Casos de uso
- Escritura creativa y ficcion sin restricciones tematicas: el ajuste orientado a "decensor" sugiere menor tasa de rechazos en narrativa adulta o temas sensibles, aunque no hay documentacion que lo confirme; conviene validar el comportamiento antes de usarlo en produccion.
- Inferencia local en estaciones de trabajo con GPU de consumo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama sobre una unica GPU de 24 GB en cuantizaciones de 4 a 6 bits, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales privados: el modelo puede desplegarse en equipos aislados de la red, evitando el envio de datos a terceros, siempre que se acepten las condiciones de uso aplicables.
- Experimentacion en investigacion sobre alineacion y seguridad: un modelo presuntamente desalineado resulta util como caso de estudio para medir degradacion de rechazos, toxicidad y sesgos frente al modelo base.
- Red teaming y evaluacion de salvaguardas: sirve para probar filtros de contenido y politicas de moderacion frente a un generador menos restrictivo.
- Generacion de codigo en entornos locales: si el ajuste no ha degradado el rendimiento del modelo base, puede usarse con editores tipo Continue o herramientas CLI que consuman un endpoint compatible con OpenAI.
- Traduccion y resumen multilingue: hereda el soporte de mas de 140 idiomas del modelo base, sujeto a la perdida de calidad que pueda introducir la cuantizacion GGUF.
- Analisis de imagenes con descripcion textual: si la adaptacion conserva la capacidad multimodal, permitiria generar pies de foto o extraer informacion de capturas, aunque no hay confirmacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones, y los resultados de busqueda solo describen el modelo base Gemma 4 26B-A4B de forma cualitativa, sin cifras de MMLU, HumanEval, GSM8K ni similares. No se deben extrapolar datos del modelo original a esta adaptacion sin medirlos.

## Requisitos de hardware
Las cifras de VRAM son estimaciones orientativas calculadas a partir del numero de parametros y del tamano de fichero habitual de cada nivel GGUF, no mediciones reales de esta adaptacion.

- Q2_K: ~10 GB de VRAM; calidad degradada.
- Q3_K_M: ~12-13 GB de VRAM; cabe en GPU de 16 GB.
- Q4_K_M: ~15-16 GB de VRAM; el repositorio ocupa 14,2 GB, compatible con este rango; cabe en RTX 4080, RTX 4090, RTX 3090 y A100 40 GB.
- Q5_K_M: ~18 GB de VRAM; requiere 24 GB para dejar margen de cache KV.
- Q6_K: ~21 GB de VRAM; ajustado en GPU de 24 GB, sobre todo con contextos largos.
- Q8_0: ~27 GB de VRAM; requiere A100 40 GB, L40S o dos GPU de 24 GB.
- F16: ~50 GB de VRAM; requiere A100 80 GB o H100.

Notas adicionales:
- El bajo numero de parametros activos (~3,8 B) reduce el coste de decodificacion y favorece velocidades altas en GPU de gama alta, pero no se han medido latencia ni throughput para este repositorio.
- La cache KV a 256K tokens puede consumir varios GB adicionales segun la configuracion; reducir el contexto o usar cuantizacion de cache mitiga el problema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM soporta GGUF de forma experimental y suele dar mejor rendimiento con pesos no cuantizados. La etiqueta "endpoints_compatible" indica compatibilidad con Hugging Face Inference Endpoints.
- Para descarga y prueba rapida, un unico fichero GGUF de 14,2 GB cabe en cualquier disco moderno y se puede ejecutar por CPU con memoria RAM suficiente (se recomienda al menos 16-24 GB de RAM para Q4).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kanjdoes/Gemma-4-26B-A4B-StylizedDecensor | ~25,2 B | ~3,8 B (base) | Hasta 256K (base) | Apache 2.0 declarada | GGUF | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B | 26 B | 3,8 B | Hasta 256K | Terminos de uso de Gemma | Safetensors y otros | Hugging Face, oficial |
| Gemma 4 12B (variante densa) | 12 B | 12 B (denso) | Hasta 256K | Terminos de uso de Gemma | Safetensors y otros | Hugging Face, oficial |
| Gemma 4 31B (variante densa) | 31 B | 31 B (denso) | Hasta 256K | Terminos de uso de Gemma | Safetensors y otros | Hugging Face, oficial |

La comparacion mas directa es con el modelo base: esta adaptacion se limita a redistribuir pesos en GGUF, por lo que sus prestaciones dependeran del ajuste aplicado y del nivel de cuantizacion elegido. Frente a las variantes densas de la misma familia, la 26B-A4B ofrece un coste de inferencia menor gracias al enrutado MoE, a cambio de una huella de memoria similar a la de un modelo de 26 mil millones de parametros totales. No se dispone de datos de rendimiento medidos para esta adaptacion.

## Limitaciones y advertencias
- La model card no contiene mas que la licencia: no hay informacion sobre datos de entrenamiento, evaluaciones, sesgos ni comportamiento esperado.
- El nombre "StylizedDecensor" apunta a una posible atenuacion o eliminacion de la alineacion de seguridad, lo que puede incrementar la generacion de contenido ofensivo, ilegal o danino. No hay validacion publica e independiente.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje, no cuantificado en esta adaptacion.
- Posible degradacion por cuantizacion GGUF, especialmente en niveles inferiores a 5 bits, con mayor impacto en tareas de razonamiento y codigo.
- La licencia Apache 2.0 declarada por el autor puede entrar en conflicto con los terminos de uso de Gemma que rigen el modelo original de Google. Antes de un uso comercial conviene revisar las condiciones aplicables al modelo base y confirmar la situacion legal de los pesos derivados.
- Cero descargas y cero likes: no existe trazabilidad de uso ni verificacion por parte de la comunidad; el artefacto no esta auditado.
- No se especifican los idiomas soportados ni la conservacion de la torre de vision, por lo que las capacidades multilingues y multimodales deben comprobarse manualmente.
- Uso responsable: si el modelo efectivamente carece de salvaguardas, no deberia exponerse en servicios publicos sin filtros de contenido externos.

## Enlaces
- Repositorio del modelo: https://huggingface.co/Kanjdoes/Gemma-4-26B-A4B-StylizedDecensor
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-26B-A4B
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion de Gemma 4 26B A4B IT en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Informe tecnico de Gemma 4 en arXiv: https://arxiv.org/html/2607.02770v1
