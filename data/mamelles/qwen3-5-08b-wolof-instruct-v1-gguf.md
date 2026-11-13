# mamelles/Qwen3.5-08B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-08B-Wolof-Instruct-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-08B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado al idioma wolof y publicado por el usuario mamelles bajo el paraguas del proyecto GalsenAI. El modelo está pensado para generación de texto conversacional en wolof y para su ejecución local mediante llama.cpp, lo que facilita el despliegue en entornos sin infraestructura de GPU dedicada.

El repositorio contiene únicamente pesos cuantizados en formato GGUF (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0) y ocupa 5,2 GB. Llama la atención la discrepancia entre el nombre comercial ("08B") y el recuento real de parámetros declarado en los metadatos de safetensors (1.014.371.136 parámetros, aproximadamente 1.000 millones), por lo que conviene tratar la cifra "08B" como etiqueta del autor y no como tamaño verificado.

La relevancia del modelo reside en su enfoque en un idioma de bajos recursos como el wolof, con una licencia no especificada y sin métricas de rendimiento publicadas. Es un artefacto de interés para investigación lingüística y para prototipos de asistentes conversacionales en África Occidental, pero su escasa documentación limita su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen3.5, sin detalle publicado) |
| Parametros totales | 1.014.371.136 (según metadatos de safetensors); la etiqueta "08B" del nombre no coincide con este recuento |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el nombre y las etiquetas indican wolof; no hay lista oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base Tonic/Qwen3.5-08B-Wolof-Instruct-v1. Por el nombre se infiere que deriva de la familia Qwen3.5, de arquitectura transformer, pero no hay confirmación oficial sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se detalla el proceso de ajuste: se desconoce el volumen de tokens de entrenamiento, la composición del corpus en wolof, si hubo instrucción supervisada, RLHF o DPO.

La única información técnica verificable es la relativa a la cuantización: el repositorio ofrece cinco variantes GGUF generadas con llama.cpp, desde F16 hasta Q4_0. El tamaño del repositorio (5,2 GB) es coherente con un modelo de aproximadamente 1.000 millones de parámetros en cuantizaciones de 4 a 8 bits, no con un modelo de 8.000 millones.

## Capacidades

- Generación de texto conversacional, con especialización declarada en wolof.
- Instrucción y seguimiento de diálogo multi-turno (sufijo "Instruct" en el nombre).
- Ejecución local mediante llama.cpp y compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Cobertura multilingüe no disponible; el foco declarado es el wolof.
- Capacidad de código y matemáticas no evaluada ni documentada.

## Casos de uso

- Asistente conversacional en wolof para atención ciudadana: el modelo puede gestionar diálogos multi-turno en un idioma con escasa cobertura en modelos generalistas, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Prototipos de traducción wolof-francés o wolof-inglés: útil como componente de un pipeline de traducción asistida, siempre que se evalúe la calidad con un conjunto de referencia propio.
- Investigación lingüística y creación de corpus: permite generar texto sintético en wolof para aumentar datasets de entrenamiento o para estudios morfológicos.
- Educación y alfabetización digital: despliegue en entornos con hardware modesto (ordenadores de consumo o Raspberry Pi) gracias a las cuantizaciones Q4 y Q5.
- Chatbot de bajo coste para ONG y proyectos locales en Senegal: al ejecutarse con llama.cpp en CPU, evita la dependencia de APIs en la nube y los costes asociados.
- Evaluación comparativa de modelos de bajos recursos: sirve como línea base para medir el impacto de ajustes finos en wolof frente a modelos multilingües de mayor tamaño.
- Integración en aplicaciones de escritorio o móviles: el formato GGUF permite empaquetar el modelo en clientes ligeros con llama.cpp como motor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~1.000 millones de parámetros, la cuantización Q4_K_M requiere aproximadamente 0,7-0,9 GB; Q8_0 en torno a 1,1-1,3 GB; F16 cerca de 2,0-2,2 GB. Son estimaciones basadas en el recuento de parámetros, no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente para Q4; una RTX 3060, RTX 4060 o superior permite ejecutar F16 con holgura. Para CPU, un procesador moderno de 4-8 núcleos es adecuado.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas de los últimos años, e incluso en iGPU con memoria compartida para cuantizaciones Q4.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. En CPU, para un modelo de este tamaño en Q4, es razonable esperar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-08B-Wolof-Instruct-v1-GGUF | ~1.014 M (según metadatos) | no disponible | no disponible | GGUF | Ajuste en wolof, sin benchmarks |
| Tonic/Qwen3.5-08B-Wolof-Instruct-v1 | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva este GGUF |
| Modelos Qwen3.5 estándar | variable según variante | no disponible | no disponible | safetensors, GGUF | Multilingües generalistas, sin especialización en wolof |

No se dispone de datos de rendimiento ni de licencia de los modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos de disponibilidad y formato.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("08B") y el recuento real de parámetros (~1.014 M): verificar el tamaño antes de planificar el despliegue.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o consultar el modelo base antes de integrarlo en productos.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, alucinación o fidelidad en wolof.
- Contexto no documentado: se desconoce la ventana máxima y el comportamiento en conversaciones largas.
- Riesgo de alucinación inherente a modelos de ~1.000 M de parámetros, especialmente en tareas de conocimiento factual.
- Sesgos potenciales derivados del corpus de ajuste fino, no auditados.
- Cobertura lingüística limitada: el foco en wolof puede degradar el rendimiento en otros idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- La model card es mínima y no incluye instrucciones de uso más allá de un ejemplo de llama-cli.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-08B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-Instruct-v1
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
