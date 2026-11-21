# glyd/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-kestrel

## Resumen

Nemotron 3.5 Lightning 30B-A3B es un modelo de lenguaje desarrollado por NVIDIA basado en una arquitectura híbrida Mamba-2 con mezcla de expertos (MoE). Cuenta con 30.000 millones de parámetros totales y 3.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos eficientes en cómputo de inferencia. Esta ficha describe la variante publicada por el usuario glyd bajo el nombre "kestrel", que no es un modelo nuevo sino una cuantización del modelo original de NVIDIA.

La versión kestrel emplea un esquema de cuantización propio de Glyd: códigos de 6 bits con una escala de 16 bits por cada grupo de 32 pesos, lo que resulta en aproximadamente 6,5 bits por peso. El repositorio ocupa 25 GB en disco frente a los 65,8 GB del modelo en BF16, y está diseñado para ejecutarse en GPU de consumo con 16 GB de VRAM. Los pesos solo son compatibles con el motor de inferencia propietario de Glyd, no con runtimes estándar como llama.cpp, vLLM o Transformers.

La relevancia de esta publicación radica en la reducción de requisitos de hardware para un modelo MoE de 30B, permitiendo su despliegue en GPUs de gama consumer. No obstante, la dependencia exclusiva del motor Glyd y la ausencia de benchmarks publicados limitan su evaluación objetiva en el momento de la publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 con mezcla de expertos (MoE), según la model card |
| Parámetros totales | 25.689.573.666 (dato real de safetensors); la model card indica 30B |
| Parámetros activos | 3B (según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits por peso con escala de 16 bits por grupo de 32 pesos (~6,5 bits/peso); formato propietario Glyd |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Formato propietario Glyd (no safetensors estándar, no GGUF); el repositorio contiene archivos safetensors según los tags, pero empaquetados para el motor Glyd |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una mezcla de expertos híbrida que combina capas Mamba-2 con capas de atención, según indica la model card de NVIDIA referenciada. Esta combinación busca reducir el coste computacional del contexto largo frente a un transformer denso convencional, manteniendo la capacidad de modelado. El modelo activa 3.000 millones de parámetros por token de un total de 30.000 millones, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La variante kestrel no introduce ningún entrenamiento adicional: es una cuantización con redondeo simple al código de 6 bits más cercano, multiplicado por la escala de su grupo. El proceso de empaquetado se realiza con el comando `glyd-engine pack` del motor de Glyd.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generación de código: capacidades esperables del modelo base Nemotron 3.5 Lightning, aunque no se detallan en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: el formato kestrel está pensado para ejecutarse en una GPU de 16 GB, lo que permite probar un MoE de 30B en hardware como una RTX 4080 o 4090 sin necesidad de descargar los 65,8 GB del modelo en BF16.
- Prototipado de aplicaciones conversacionales: al ser un modelo de generación de texto con pipeline conversacional, puede usarse para validar interfaces de chat y flujos multi-turno en local antes de migrar a infraestructura de producción.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad de un esquema de 6 bits frente al modelo BF16 original en tareas concretas del equipo, dado que el autor no publica métricas de calidad.
- Experimentación con arquitecturas híbridas Mamba-2/MoE: permite a investigadores estudiar el comportamiento de este tipo de arquitectura en hardware asequible, aunque limitado al motor Glyd.
- Desarrollo de asistentes de código en local: si el modelo base conserva las capacidades de generación de código de la familia Nemotron, podría integrarse en editores o terminales mediante el motor Glyd, siempre que este exponga una API compatible.
- Pruebas de integración del motor Glyd: el repositorio funciona como artefacto de referencia para validar la instalación de Glyd 0.34.0 o superior en Linux con GPU NVIDIA RTX 30 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la velocidad y la calidad en GPUs reales se medirán en la puerta de release de Glyd y se añadirán al repositorio cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada: 16 GB de VRAM según la model card, que describe kestrel como el nivel pensado para una GPU de 16 GB.
- Tamaño en disco: 25 GB, frente a 65,8 GB del modelo en BF16.
- GPU recomendadas: NVIDIA RTX serie 30 o superior. No se especifican modelos concretos (4090, A100, H100) en la información disponible.
- Compatibilidad con GPU de consumo: sí, el objetivo declarado es una GPU de 16 GB, lo que incluye tarjetas consumer de gama alta.
- Sistemas operativos: solo Linux con NVIDIA; no hay soporte para Mac ni AMD.
- Opciones de despliegue: exclusivamente el motor Glyd (versión 0.34.0 o superior), mediante `glyd run nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16:kestrel` o `glyd run glyd/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-kestrel`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (kestrel, esta ficha) | 25,7B (safetensors) / 30B (model card) | 3B | no disponible | Propietario Glyd, ~6,5 bits/peso | OpenMDW 1.1 | Solo motor Glyd, Linux + NVIDIA |
| Nemotron 3.5 Lightning 30B-A3B BF16 (original de NVIDIA) | 30B | 3B | no disponible | BF16 (safetensors) | OpenMDW 1.1 | Runtimes estándar compatibles con safetensors |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es con el modelo base original: kestrel reduce el tamaño en disco de 65,8 GB a 25 GB a cambio de una cuantización con pérdida y de la dependencia del motor propietario de Glyd. No se dispone de datos de rendimiento para comparar la calidad entre ambas versiones.

## Limitaciones y advertencias

- Cuantización con pérdida: cada peso se redondea al código de 6 bits más cercano, lo que introduce degradación de calidad respecto al BF16 original; el autor no publica métricas de esa degradación.
- Dependencia de un motor propietario: los pesos solo funcionan con Glyd 0.34.0 o superior; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Plataforma restringida: solo Linux con GPU NVIDIA RTX serie 30 o superior; sin soporte para Mac ni AMD.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo, lo que dificulta evaluar su idoneidad para aplicaciones en castellano.
- Contexto no documentado: se desconoce la longitud máxima de contexto, un dato crítico para aplicaciones con documentos largos.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; se aplican los riesgos habituales de los modelos de lenguaje, sin documentación específica.
- Licencia OpenMDW 1.1: es una licencia de tipo "other" que debe revisarse antes de uso comercial; la información disponible no detalla sus restricciones concretas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, publicado por un tercero (glyd) y no por NVIDIA, lo que implica menor garantía de mantenimiento.
- Sin benchmarks: no hay datos publicados de calidad ni de velocidad que permitan validar el modelo antes de adoptarlo.

## Enlaces

- Repositorio de la cuantización kestrel: https://huggingface.co/glyd/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-kestrel
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
