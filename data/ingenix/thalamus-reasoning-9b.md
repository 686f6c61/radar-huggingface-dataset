# ingenix/Thalamus-Reasoning-9B

## Resumen

Thalamus-Reasoning-9B es un modelo de lenguaje de 9.190.797.824 parámetros (aproximadamente 9,19 mil millones), desarrollado por el equipo de ingenix, especializado en dominios de biología, transcriptómica, expresión génica, single-cell, RNA-seq y datos ómicos multimodales. Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, orientado a tareas de razonamiento sobre datos biológicos y conversacionales. El modelo está publicado en Hugging Face bajo acceso restringido (gated), lo que exige aceptar condiciones adicionales antes de su descarga.

El modelo se distribuye en formato safetensors con pesos completos (tamaño del repositorio de 19,0 GB) y está diseñado para su uso con la librería transformers. Incorpora código personalizado (custom_code), lo que implica que requiere confiar en implementaciones no estándar para su carga y ejecución. Su licencia es la ingenix-research-license-1.0, una licencia propia de carácter investigador que no debe confundirse con licencias permisivas estándar.

La relevancia del modelo radica en su especialización en el dominio bioinformático y ómico, un nicho donde la mayoría de los modelos generalistas tienen un rendimiento limitado. Sin embargo, la información pública disponible es muy escasa: no se han publicado detalles sobre arquitectura interna, composición del dataset de entrenamiento, resultados de benchmarks ni métodos de alineación (RLHF/DPO). Esta ficha refleja exclusivamente los datos verificables proporcionados en la información de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-9B; se desconoce la arquitectura exacta del base) |
| Parametros totales | 9.190.797.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors completos) |
| Idiomas soportados | en (inglés) |
| Licencia | ingenix-research-license-1.0 (licencia propia de investigación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Se sabe que es un fine-tune del modelo base Qwen/Qwen3.5-9B, por lo que hereda la arquitectura de dicho modelo base, aunque la información proporcionada no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) u otra variante. El número total de parámetros (9.190.797.824) es consistente con un modelo denso de aproximadamente 9 mil millones de parámetros, pero no se confirma explícitamente.

Respecto al entrenamiento, no se han publicado datos sobre el número de tokens utilizados, la composición del dataset, la proporción de datos biológicos frente a datos generales, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. La presencia de la etiqueta "custom_code" sugiere que el modelo incorpora implementaciones personalizadas en su definición, probablemente relacionadas con el procesamiento de datos ómicos o con capas específicas del dominio. Tampoco se detalla ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, orientada a dominios científicos y biológicos.
- Razonamiento sobre datos de transcriptómica, expresión génica, single-cell, RNA-seq y datos ómicos (según las etiquetas del modelo).
- Capacidad multimodal declarada mediante la etiqueta "multimodal" y "omics", aunque no se especifica qué modalidades adicionales soporta ni cómo se integran.
- Procesamiento de datos de DepMap (líneas celulares de dependencia genética), según la etiqueta correspondiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (a pesar del nombre "Reasoning", no se documenta explícitamente).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de expresión génica diferencial: el modelo puede recibir descripciones textuales de experimentos de RNA-seq y ayudar a interpretar patrones de expresión, gracias a su ajuste fino sobre datos de transcriptómica. Adecuado por su especialización declarada en el dominio.
- Interpretación de datos single-cell: asistencia en la anotación y descripción de tipos celulares a partir de resúmenes textuales de experimentos de secuenciación de célula única, aprovechando las etiquetas "single-cell" y "rna-seq".
- Consultas sobre dependencias genéticas en líneas celulares: uso de datos DepMap para responder preguntas sobre vulnerabilidades genéticas en modelos celulares, orientado a investigación en oncología.
- Asistencia en investigación biomédica conversacional: un chatbot especializado que responde preguntas sobre biología molecular y ómica en inglés, con contexto de dominio.
- Generación de hipótesis biológicas: el modelo puede proponer hipótesis a partir de descripciones de datos ómicos, sirviendo como apoyo a investigadores en la fase de diseño experimental.
- Documentación y resumen de literatura ómica: resumen de artículos o datasets biológicos en inglés, aprovechando su entrenamiento en el dominio.
- Integración en pipelines de bioinformática: dado su formato safetensors y compatibilidad con transformers, puede integrarse como componente de generación de texto en flujos de análisis que requieran interpretación en lenguaje natural de resultados ómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos completos en safetensors (19,0 GB de repositorio), se requiere al menos ~19-20 GB de VRAM en precisión de 16 bits para cargar el modelo completo. En cuantización de 8 bits se estiman ~10-11 GB, y en 4 bits ~6-7 GB, aunque no se distribuyen versiones cuantizadas oficiales.
- GPU recomendadas: para pesos completos en fp16, se recomienda una GPU con 24 GB o más de VRAM (RTX 4090, A100 40GB, H100). Para cuantización 4/8 bits, una RTX 3090/4090 o incluso GPUs con 12-16 GB podrían ser suficientes, aunque no está verificado.
- ¿Cabe en consumer GPU? Sí, en GPUs de gama alta con 24 GB (RTX 3090, RTX 4090) usando cuantización o fp16 ajustado; en GPUs de 12-16 GB requeriría cuantización agresiva no oficial.
- Opciones de despliegue: transformers (librería declarada). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI; la presencia de "custom_code" puede complicar la integración con estos frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Especializacion |
|---|---|---|---|---|---|
| Thalamus-Reasoning-9B | 9,19 B | no disponible | ingenix-research-license-1.0 (investigación) | Gated en HF | Biología/ómica |
| Qwen/Qwen3.5-9B (base) | ~9 B (no confirmado) | no disponible | no disponible | Público (presumiblemente) | Generalista |
| Modelos generalistas de ~9B (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8 B | 8k-128k (según modelo) | Licencias permisivas o comunitarias | Públicos | Generalista |

No se dispone de datos de rendimiento comparativo para Thalamus-Reasoning-9B, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. No se conocen otros modelos especializados en ómica de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados o de producción sin intervención manual.
- Licencia de investigación (ingenix-research-license-1.0): no es una licencia de código abierto estándar; el uso comercial puede estar restringido o requerir permisos adicionales. Es imprescindible revisar los términos antes de cualquier despliegue productivo.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluado; en dominios científicos especializados el riesgo de generar afirmaciones plausibles pero incorrectas es especialmente crítico.
- Limitaciones de contexto: longitud de contexto no documentada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Dependencia de código personalizado (custom_code): puede dificultar la reproducibilidad, la auditoría y la integración con herramientas estándar.
- Ausencia de benchmarks: no hay evidencia pública de su rendimiento real frente a modelos generalistas o especializados, lo que desaconseja su adopción en producción sin una evaluación propia.
- Fecha de creación (2026-11-09) y escasa tracción (0 descargas, 0 likes): modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ingenix/Thalamus-Reasoning-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper referenciado (arXiv:2605.06728): https://arxiv.org/abs/2605.06728
- Repositorio de ingenix en Hugging Face: no disponible
