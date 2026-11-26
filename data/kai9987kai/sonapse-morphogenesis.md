# Kai9987kai/SONAPSE-MORPHOGENESIS

## Resumen

SONAPSE MORPHOGENESIS es un repositorio de investigación publicado en Hugging Face por el autor Kai9987kai bajo licencia Apache 2.0. No se trata de un modelo de lenguaje en el sentido convencional, sino de una plataforma de investigación CPU-first orientada al estudio de redes neuronales recurrentes con grafos de conectoma, neurogénesis continua, programación en el espacio de pesos y aprendizaje continuo. El repositorio integra 14 paquetes de investigación interoperables, un motor de conectoma compilado y vectorizado, y un conjunto de reglas de aprendizaje y familias de neuronas sintéticas.

La propuesta técnica se articula en torno a un ecosistema experimental que combina un controlador MoE congelado (Poseidon Tidal), regulación homeostática interoceptiva, deliberación cognitiva de doble proceso (MiMoMix) y un modo "OMNI-MORPHOGENESIS Max Mode" con coordinación anidada en tres niveles. Según la model card, el sistema ha sido validado en una campaña continua de 2 horas y 1.956 épocas con un tamaño del efecto de Cohen's d = 3,5463 y una cobertura de capacidades del 100 %, aunque estos resultados proceden exclusivamente de la documentación del autor y no de una publicación revisada por pares.

El repositorio ocupa 0,4 GB y está etiquetado para el idioma inglés. Es relevante para investigadores interesados en neurociencia sintética, aprendizaje continuo y arquitecturas alternativas a los transformers, pero no debe confundirse con un modelo generativo desplegable: no se declara pipeline, no hay pesos en formato estándar (safetensors/GGUF) y las capacidades descritas son experimentales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafos neuronales recurrentes con signo, conectoma dinámico, MoE congelado (Poseidon Tidal), deliberación de doble proceso (MiMoMix); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,4 GB; se mencionan artefactos como `artifacts/tidal_core.pt` en formato PyTorch) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card combina varios componentes: un flujo sensorial (rangefinder, contraste, señales) que alimenta un `GraftBrain` de tasa recurrente, un controlador MoE congelado (Poseidon Tidal) entrenado con DAgger, neurogénesis continua sobre el conectoma, regulación de impulso homeostático interoceptivo y deliberación cognitiva MiMoMix de doble proceso. Se incluyen además 36 familias de neuronas sintéticas de injerto (24 de la v1 y 12 de la v2), 21 neuronas convencionales, 20 organelas sintéticas con un coordinador de arbitraje, 16 abstracciones biológicas no neuronales, 18 híbridos de ML y 33 reglas de aprendizaje.

El entrenamiento se describe como CPU-first, con aceleradores PyTorch opcionales para el ajuste aislado de injertos neuronales. Se mencionan 2.048 candidatos en embudos de CPU (13.125 candidatos/s), destilación de fallos (Supermix Antipode), acoplamientos de simbiosis (11), 32 sentidos (Spectra), espacios 4D/5D/6D (Hyperspace), fusión Chimera, afecto, curiosidad (12 mundos) y emergencia con MMI-PID, MAF y gemelo cruzado. La model card cita dos referencias arXiv (1805.12114 y 1906.08253) como base metodológica. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Investigación en neurociencia sintética: simulación de conectomas dinámicos y neurogénesis continua sobre grafos recurrentes con signo.
- Aprendizaje continuo: reglas de aprendizaje en línea y consolidación sueño-estudiante entrenable.
- Programación en el espacio de pesos: modificación directa de pesos con herencia de auto-mejora recursiva (RSI).
- Memoria fast-weight universal: mecanismos uTTT y Titans de aprendizaje asociativo.
- Modelos del mundo recurrentes con planificación MPC (horizontes H ∈ {1, 3, 5, 10}).
- Deliberación de doble proceso (MiMoMix) para razonamiento cognitivo.
- Regulación homeostática interoceptiva y curiosidad en 12 mundos.
- Visualización 3D del conectoma y observatorio de mundo virtual servidos por interfaz web local.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión ni audio en el sentido de un LLM convencional.

## Casos de uso

- Investigación académica en aprendizaje continuo: el sistema permite experimentar con reglas de aprendizaje en línea y consolidación sin olvido catastrófico, usando el motor de conectoma compilado para acelerar las simulaciones.
- Estudio de neurogénesis artificial: los 36 tipos de neuronas sintéticas de injerto y las 20 organelas permiten diseñar experimentos controlados sobre crecimiento y poda de redes.
- Simulación de conectomas: la plataforma sirve para reproducir y auditar conectomas verificados, con visualización 3D y telemetría en vivo, útil en grupos de neurociencia computacional.
- Experimentos de planificación con MPC: los modelos del mundo recurrentes con horizontes configurables permiten evaluar estrategias de control predictivo en entornos virtuales.
- Docencia en arquitecturas alternativas: el workbench interactivo y el CLI documentado permiten usar el sistema como material didáctico para explicar MoE, DAgger, homeostasis y doble proceso.
- Auditoría de reproducibilidad: los scripts de campaña y las suites de regresión (1.892 tests pasados, 4 omitidos según la model card) permiten replicar experimentos y verificar contratos de compatibilidad.
- Investigación en auto-mejora recursiva: el mecanismo de programación en el espacio de pesos con RSI heredado permite estudiar dinámicas de mejora iterativa en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Aceleración del motor compilado | 36,51× | N = 256, frente a la versión no compilada |
| Throughput de embudo CPU | 13.125 candidatos/s | 2.048 candidatos |
| Campaña OMNI Max Mode | 1.956 épocas en 2 horas | Validación continua |
| Tamaño del efecto | Cohen's d = 3,5463 | Según model card |
| Cobertura de capacidades | 100 % | Según model card |
| Suite de regresión | 1.892 pasados, 4 omitidos | Según model card |

No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con la naturaleza no generativa del sistema.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el sistema se describe como CPU-first.
- GPU recomendadas: no se especifican modelos concretos; se mencionan aceleradores PyTorch compatibles para el ajuste aislado de injertos neuronales.
- Cabe en GPU consumer: no hay datos que lo confirmen ni lo descarten; el diseño prioriza CPU.
- Opciones de despliegue: ejecución vía `python -m sonapse_morphogenesis` (CLI), servidor web local en el puerto 8766 y modo integrado en el puerto 8765; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta el throughput del embudo de candidatos (13.125 cand/s) y la aceleración del motor compilado (36,51×); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SONAPSE MORPHOGENESIS | Plataforma de investigación en conectomas y aprendizaje continuo | no disponible | no disponible | Apache 2.0 | Hugging Face (repo de 0,4 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada. La categoría (plataformas de neurociencia sintética con conectomas dinámicos) no tiene equivalentes directos ampliamente conocidos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Los resultados reportados (Cohen's d = 3,5463, 100 % de cobertura) proceden de la model card del autor y no de una publicación revisada por pares; deben tratarse como no verificados.
- El sistema no es un modelo de lenguaje generativo: no ofrece generación de texto, código, matemáticas ni visión en el sentido habitual.
- El único idioma declarado es el inglés; no hay soporte multilingüe documentado.
- No se especifican sesgos conocidos, pero al ser un sistema experimental de investigación, no se recomienda su uso en producción sin una evaluación independiente.
- El riesgo de alucinación no aplica en el sentido de un LLM, pero los artefactos y métricas reportadas podrían no reproducirse fuera del entorno del autor.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de pesos estándar limitan su aplicabilidad en producción.
- La planificación con MPC se describe como experimental, opt-in y desactivada por defecto; un estudio retenido del 14 de noviembre de 2026 no encontró ganancias de finalización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación del repositorio (2026-11-26) es posterior a la fecha actual, lo que puede indicar un artefacto de metadatos o una fecha de publicación programada; conviene verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Kai9987kai/SONAPSE-MORPHOGENESIS
- Paper v2.0: docs/paper/SONAPSE_MORPHOGENESIS_V2_PAPER.md (en el repositorio)
- Guía rápida y CLI: README_MORPHOGENESIS.md (en el repositorio)
- Auditoría del repositorio: docs/morphogenesis/REPOSITORY_AUDIT.md
- Especificación de arquitectura: docs/morphogenesis/ARCHITECTURE_SPEC.md
- Compatibilidad y migración: docs/morphogenesis/COMPATIBILITY_AND_MIGRATION.md
- Catálogo de neuronas y organelas: docs/morphogenesis/NEURON_ORGANELLE_CATALOG.md
- Hallazgos científicos: docs/morphogenesis/SCIENTIFIC_FINDINGS.md
- Limitaciones y preguntas abiertas: docs/morphogenesis/LIMITATIONS_AND_OPEN_QUESTIONS.md
- Auditoría de diseño: docs/design-audit.md
- Auditoría del contrato Antigravity: docs/antigravity-audit.md
- Especificación de entrenamiento de injertos: docs/training-graft.md
- Guía de datos de conectoma: docs/connectome-data.md
- Informe de cómputo y entrenamiento: docs/results/2026-11-07-compute-training-connectome.md
- Informe de planificación: docs/results/2026-11-14-task-aware-planning.md
- Referencia arXiv 1805.12114: https://arxiv.org/abs/1805.12114
- Referencia arXiv 1906.08253: https://arxiv.org/abs/1906.08253
