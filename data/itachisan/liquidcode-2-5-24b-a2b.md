# ItachiSan/LiquidCode-2.5-24B-A2B

## Resumen

LiquidCode-2.5-24B-A2B es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-24B-A2B-Base, desarrollado por el usuario ItachiSan. El entrenamiento se ha realizado con TRL y Unsloth sobre el conjunto de datos nvidia/Nemotron-SFT-SWE-v3, un dataset orientado a tareas de ingeniería de software. El repositorio ocupa 50,6 GB y se distribuye en formato safetensors con pesos completos, lo que sugiere que no se han publicado versiones cuantizadas.

El modelo hereda la arquitectura y el tamaño del modelo base de LiquidAI, que por su nomenclatura corresponde a un modelo de mezcla de expertos (MoE) con 24B de parámetros totales y aproximadamente 2B activos por token. Sin embargo, la model card del autor no documenta explícitamente ni la arquitectura, ni la longitud de contexto, ni los idiomas soportados, por lo que buena parte de las especificaciones deben considerarse no disponibles a partir de la información proporcionada.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo recién publicado (noviembre de 2026), sin descargas ni validación comunitaria, especializado en código mediante SFT sobre un dataset de SWE. Es un candidato a evaluar para tareas de generación y reparación de código, pero no debe asumirse su calidad en producción sin una evaluación propia, dado que no hay benchmarks publicados ni procesos adicionales de alineamiento declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI LFM2.5; por nomenclatura, MoE con 24B totales y ~2B activos) |
| Parámetros totales | 24B (según nomenclatura del modelo base) |
| Parámetros activos | ~2B (según nomenclatura del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card contiene el campo `licence: license`, sin valor concreto) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 50,6 GB |
| Librería | transformers |
| Modelo base | LiquidAI/LFM2.5-24B-A2B-Base |
| Dataset de entrenamiento | nvidia/Nemotron-SFT-SWE-v3 |
| Método de entrenamiento | SFT (supervised fine-tuning) |
| Frameworks | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.11.0, Datasets 4.8.5, Tokenizers 0.23.3, Unsloth |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por el identificador del modelo base (LFM2.5-24B-A2B) se deduce que se trata de un modelo de LiquidAI con 24B de parámetros totales y 2B activos, patrón típico de una arquitectura de mezcla de expertos (MoE) con enrutamiento disperso. No obstante, ni la model card del ajuste ni la información disponible confirman el tipo de atención, la composición de expertos, la longitud de contexto nativa ni si incorpora innovaciones como atención lineal o decodificación especulativa.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el dataset nvidia/Nemotron-SFT-SWE-v3, orientado a tareas de ingeniería de software. Se ha realizado con TRL y Unsloth, y el autor declara explícitamente que no se aplicó ningún proceso adicional (sin RLHF, sin DPO, sin post-procesado). La model card no indica el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros ni si se entrenaron todos los parámetros o solo un subconjunto (por ejemplo, adaptadores LoRA fusionados).

## Capacidades

- Generación de texto y código: el ajuste sobre un dataset de SWE sugiere especialización en tareas de programación, aunque no se documentan evaluaciones que lo confirmen.
- Razonamiento y matemáticas: no disponible; no hay evidencia en la model card de capacidades específicas más allá del entrenamiento en código.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible; el dataset de SWE puede incluir trayectorias multi-paso, pero no se detalla.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Generación de código en pipelines de desarrollo: el modelo puede emplearse para autocompletar funciones y generar fragmentos de código a partir de descripciones en lenguaje natural, aprovechando el ajuste sobre un dataset de ingeniería de software. Requiere validación previa con un conjunto de evaluación propio.
- Reparación de bugs asistida: dado el entrenamiento sobre datos de SWE, es candidato para tareas de localización y corrección de errores en repositorios, integrándose en herramientas de revisión de código.
- Asistente de revisión de pull requests: puede generar resúmenes y sugerencias sobre diffs de código, siempre que se valide su comportamiento con el contexto disponible del modelo base.
- Generación de pruebas unitarias: útil para producir esqueletos de tests a partir de firmas de funciones y documentación existente.
- Explicación de código legacy: puede emplearse para documentar y resumir módulos antiguos, traduciendo lógica compleja a descripciones en lenguaje natural.
- Prototipado de agentes de codificación: al estar etiquetado como compatible con endpoints, puede desplegarse como servicio y conectarse a orquestadores de agentes para tareas de edición de ficheros y ejecución de comandos, con las cautelas propias de un modelo sin benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 48 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 80 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 24-26 GB, viable en GPUs de 32 GB o superiores.
- VRAM estimada en cuantización de 4 bits: alrededor de 13-15 GB, viable en GPUs consumer de 16 GB o más (RTX 4080, RTX 4090, RTX 5090), aunque no se han publicado versiones cuantizadas oficiales.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para FP16/BF16; L40S o A6000 para 8 bits; RTX 4090/5090 para 4 bits.
- Opciones de despliegue: transformers (soporte confirmado por la librería declarada); vLLM, TGI, llama.cpp y Ollama no están confirmados para este modelo concreto y requerirían conversión o verificación previa.
- Latencia y throughput: no disponibles; al tratarse de un MoE con ~2B activos, el throughput debería ser superior al de un modelo denso de 24B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ItachiSan/LiquidCode-2.5-24B-A2B | 24B totales / ~2B activos (según base) | no disponible | no disponible | SFT en código (SWE) | safetensors, transformers |
| LiquidAI/LFM2.5-24B-A2B-Base | 24B totales / ~2B activos | no disponible | no disponible | Modelo base generalista | safetensors, transformers |
| Qwen2.5-Coder-32B | 32B densos | 128K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | Código | safetensors, GGUF, múltiples formatos |
| DeepSeek-Coder-V2-Lite | 16B totales / 2,4B activos | 128K (según documentación pública) | Licencia propia de DeepSeek | Código, MoE | safetensors, múltiples formatos |

La comparación con alternativas consolidadas es desfavorable en términos de trazabilidad: los modelos de Qwen y DeepSeek cuentan con benchmarks publicados, licencias claras y ecosistema de cuantizaciones, mientras que LiquidCode-2.5-24B-A2B carece de todos esos elementos en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de tareas SWE que permitan estimar su calidad real.
- Licencia no especificada: la model card incluye un campo `licence: license` sin valor, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier uso en producción.
- Sin proceso de alineamiento adicional: el autor declara que no se aplicó ningún proceso tras el SFT, por lo que no hay garantías de comportamiento seguro ni de rechazo de peticiones dañinas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluaciones específicas, no puede descartarse la generación de código incorrecto o de APIs inexistentes.
- Idiomas no documentados: se desconoce si el ajuste ha degradado capacidades multilingües del modelo base.
- Contexto no documentado: se desconoce la ventana máxima efectiva, lo que dificulta planificar su uso en repositorios grandes.
- Sin cuantizaciones oficiales: el repositorio solo contiene safetensors de 50,6 GB, lo que limita el despliegue en hardware consumer sin conversión manual.
- Madurez nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación independiente.
- Origen del ajuste: se trata de un ajuste realizado por un usuario individual, no por el equipo de LiquidAI, por lo que no cuenta con el respaldo del desarrollador del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ItachiSan/LiquidCode-2.5-24B-A2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-SWE-v3
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
