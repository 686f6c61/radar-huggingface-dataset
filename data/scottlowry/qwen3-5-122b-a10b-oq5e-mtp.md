# scottlowry/Qwen3.5-122B-A10B-oQ5e-mtp

## Resumen

Qwen3.5-122B-A10B-oQ5e-mtp es una cuantización mixta de precisión del modelo Qwen3.5-122B-A10B, una arquitectura Mixture of Experts (MoE) de la familia Qwen3.5 desarrollada por Alibaba. Esta versión concreta la publica el usuario scottlowry en Hugging Face, empleando la herramienta oQ de oMLX (v0.7.4.dev1) para generar pesos cuantizados en formato MLX, orientados a la inferencia en hardware Apple Silicon.

El checkpoint conserva 125.086 millones de pesos lógicos distribuidos en tres componentes: el modelo de lenguaje (122.112B), un codificador de visión (0.451B) y una cabeza MTP (Multi-Token Prediction) de 2.524B. La cuantización emplea una mezcla de esquemas afines (5-bit grupo 64, 8-bit grupo 128, 8-bit grupo 64 y BF16) que arroja un promedio efectivo de 5,691 bits por peso y reduce el almacenamiento a 82,866 GiB, lo que permite ejecutar un modelo de esta escala en equipos con memoria unificada de gama alta.

La relevancia de esta ficha radica en que demuestra la viabilidad de desplegar un MoE de más de 120.000 millones de parámetros en estaciones de trabajo Apple mediante cuantización agresiva y decodificación especulativa (la cabeza MTP), un caso de uso cada vez más habitual entre desarrolladores que no disponen de clústeres de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabeza MTP y torre de visión |
| Parametros totales | 125.086.497.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 5-bit grupo 64, afín 8-bit grupo 128, afín 8-bit grupo 64, BF16 (promedio 5,691 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es un transformer con arquitectura Mixture of Experts, según el tag `qwen3_5_moe` del repositorio. El checkpoint cuantizado incluye además una torre de visión de 0,451B parámetros, lo que indica capacidades multimodales, y una cabeza MTP (Multi-Token Prediction) de 2,524B parámetros que actúa como mecanismo de decodificación especulativa para acelerar la generación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del autor solo documenta el proceso de cuantización.

La innovación técnica de esta publicación es la cuantización mixta de precisión: el 94,639% de los pesos lógicos (118,380B) se almacenan en afín 5-bit con grupo 64, mientras que un 4,583% (5,733B) se preserva en 8-bit grupo 64 y un 0,408% (0,511B) se mantiene en BF16. Esta asignación selectiva de precisión busca preservar la calidad en capas sensibles (probablemente atención y capas iniciales/finales) mientras comprime el grueso de la matriz de expertos.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5.
- Procesamiento de imágenes gracias a la torre de visión incluida (0,451B parámetros).
- Decodificación especulativa mediante la cabeza MTP, que permite predecir varios tokens por paso y aumentar el throughput en inferencia.
- Ejecución nativa en MLX, el framework de Apple para Apple Silicon.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: con 82,866 GiB de pesos cuantizados, el modelo puede cargarse en equipos con memoria unificada de 96 GB o superior (Mac Studio M2/M3 Ultra), permitiendo ejecutar un MoE de 122B sin GPU dedicada.
- Asistentes de código en local: la combinación de un modelo grande con cuantización 5-bit y decodificación especulativa MTP permite generar código con latencia razonable en un entorno de desarrollo sin enviar datos a la nube.
- Procesamiento de documentos con imágenes: la torre de visión integrada permite extraer información de capturas, diagramas o PDFs escaneados en pipelines locales de análisis documental.
- Prototipado de agentes multimodales: desarrolladores que necesiten validar flujos de agente con entrada visual y texto pueden usar este checkpoint sin depender de APIs externas.
- Investigación en cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta (5-bit vs 8-bit vs BF16) en la calidad de un MoE de gran escala.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir empíricamente la ganancia de throughput frente a decodificación autoregresiva estándar en MLX.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para organizaciones que no pueden enviar datos a servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 82,866 GiB solo para pesos, más overhead de contexto y activaciones; se recomienda un mínimo de 96 GB de memoria unificada y 128 GB para contextos largos.
- GPU recomendadas: no aplica de forma nativa; el formato es MLX, por lo que requiere Apple Silicon (M1/M2/M3/M4, preferiblemente variantes Max o Ultra).
- ¿Cabe en GPU consumer? No en GPUs NVIDIA/AMD consumer convencionales (24 GB o menos). Requiere Apple Silicon con memoria unificada de gama alta.
- Opciones de despliegue: MLX (librería `mlx`), oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX cuantizado con oQ.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está diseñada para mejorar el throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ5e-mtp | 125,086B | no disponible | oQ mixta 5,691 bits/peso | no disponible | safetensors MLX |
| Qwen3.5-122B-A10B (original) | ~122B (MoE) | no disponible | BF16 | no disponible | safetensors |
| Alternativas MoE comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 5-bit puede degradar la calidad respecto al modelo original en BF16, especialmente en tareas de razonamiento complejo o matemáticas; no se aportan evaluaciones que cuantifiquen esta pérdida.
- La licencia no está especificada en el repositorio, por lo que no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base Qwen3.5 antes de cualquier despliegue en producción.
- El formato MLX limita el despliegue exclusivamente a hardware Apple Silicon; no es portable a GPUs NVIDIA, AMD ni a servidores x86 convencionales.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fidelidad.
- No se dispone de información sobre sesgos, idiomas soportados ni limitaciones de contexto.
- El checkpoint se actualizó el 2026-11-11 con una nueva cuantización (oMLX v0.7.4.dev1); versiones anteriores descargadas pueden diferir en calidad.
- El número de descargas (33) y likes (0) es muy bajo, lo que implica escasa validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ5e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
