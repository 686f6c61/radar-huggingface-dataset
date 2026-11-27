# richardyoung/gemma-4-31B-it-SOM-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-SOM-heretic-GGUF` es una cuantización en formato GGUF del modelo `richardyoung/gemma-4-31B-it-SOM-heretic`, un derivado de la familia Gemma 4 de Google afinado por el usuario richardyoung. El sufijo "heretic" indica que el modelo ha sido sometido a un proceso de "abliteration", una técnica de modificación de pesos que reduce los rechazos del modelo ante peticiones que el modelo original consideraría sensibles; "SOM" (probablemente Self-Organizing Map o un acrónimo propio del autor) y "it" (instruction-tuned) completan la nomenclatura. El modelo cuenta con 30.697.345.596 parámetros reales (aproximadamente 31B), lo que lo sitúa en la gama alta de modelos densos de tamaño medio-grande.

El paquete GGUF está pensado para su uso con llama.cpp y Ollama, con cuantizaciones generadas mediante imatrix (importance matrix), una técnica que mejora la calidad de los pesos cuantizados a baja precisión. El repositorio ocupa 51,4 GB y ofrece variantes de cuantización para distintos presupuestos de memoria. La licencia declarada es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de este modelo reside en su naturaleza "uncensored/abliterated": está orientado a investigación sobre alineación, evaluación de sesgos y estudios de robustez, más que a despliegues comerciales convencionales. Su condición de modelo derivado de Gemma 4 implica capacidades de generación de texto e instrucciones, aunque la información pública disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, denso); detalles exactos no disponibles |
| Parametros totales | 30.697.345.596 (~31B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes múltiples; lista exacta de niveles no disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 31B parámetros, derivado de la arquitectura Gemma 4 de Google. Al tratarse de una cuantización GGUF del modelo `richardyoung/gemma-4-31B-it-SOM-heretic`, la arquitectura subyacente corresponde a la del modelo base Gemma 4 instruction-tuned, sobre el que el autor aplicó técnicas de abliteration ("heretic") para reducir los comportamientos de rechazo.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO específicas en el afinado del autor. La cuantización se ha realizado con imatrix, que calibra los pesos cuantizados usando estadísticas de activaciones para preservar mejor la calidad en niveles bajos de bits. No se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés.
- Razonamiento general y respuesta a prompts multi-turno (pipeline declarado: text-generation, conversacional).
- Comportamiento "uncensored/abliterated": menor tasa de rechazos ante peticiones que el modelo original rechazaría.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según los tags del repositorio.
- Capacidades de visión o audio: no disponible en la información.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparándolo con el Gemma 4 original en experimentos controlados.
- Evaluación de sesgos y robustez: útil para medir la propagación de sesgos en modelos derivados y para construir conjuntos de pruebas de red-teaming en inglés.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con suficiente RAM o VRAM, sin depender de APIs externas.
- Prototipado de asistentes conversacionales en inglés: su formato instruction-tuned y su ventana conversacional permiten construir demos de chatbot para entornos de investigación.
- Generación de texto creativo sin restricciones editoriales: para estudios de estilo, guionización o generación de contenido en contextos donde se requiere baja tasa de rechazo.
- Fine-tuning posterior sobre GGUF: las cuantizaciones sirven como base para experimentos de destilación o adaptación con LoRA en entornos con recursos limitados (según el stack de llama.cpp).
- Benchmarking de cuantizaciones: el uso de imatrix permite comparar la degradación de calidad entre niveles de cuantización en un modelo de ~31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: para un modelo de ~31B parámetros, una cuantización Q4_K_M requiere aproximadamente 18-20 GB de memoria; Q8_0 en torno a 33-35 GB; FP16 alrededor de 62 GB. Los valores exactos dependen del nivel de cuantización elegido dentro del repositorio (51,4 GB en total para todas las variantes).
- GPU recomendadas: A100 40/80 GB o H100 para FP16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones Q4/Q5; GPU con 32 GB o más para Q6/Q8.
- GPU de consumo: sí, cabe en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con cuantizaciones muy agresivas (Q2/Q3) o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama (tags del repositorio), y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-SOM-heretic-GGUF | ~31B | No disponible | Apache 2.0 | GGUF | Derivado abliterated de Gemma 4, solo inglés |
| Gemma 4 31B it (original, referencia) | ~31B | No disponible | Términos de Gemma | Safetensors/GGUF | Modelo base alineado; mayor tasa de rechazos |
| Otros derivados abliterated de la familia Gemma | ~9B-31B | Variable | Variable | GGUF/Safetensors | Alternativas de investigación con filosofía similar |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated/uncensored": la reducción de rechazos puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto; no es adecuado para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación: como todo modelo generativo, puede producir afirmaciones falsas con aparente confianza; no se han publicado evaluaciones de factualidad.
- Idioma: soporte declarado únicamente en inglés; el rendimiento en castellano no está garantizado.
- Licencia: Apache 2.0 declarada, pero al derivar de Gemma 4 conviene verificar las condiciones de uso del modelo base de Google antes de un uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- Información técnica incompleta: no se publican detalles de contexto, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente al modelo original.
- Fecha de creación posterior a la información de referencia: verificar que el modelo base Gemma 4 y sus condiciones estén vigentes antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-SOM-heretic-GGUF
- Modelo base (referencia): https://huggingface.co/richardyoung/gemma-4-31B-it-SOM-heretic
- Paper referenciado en tags (arXiv:2611.17846): https://arxiv.org/abs/2611.17846
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
