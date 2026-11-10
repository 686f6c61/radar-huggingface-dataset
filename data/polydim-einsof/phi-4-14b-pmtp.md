# Polydim-Einsof/phi-4-14b-pmtp

## Resumen

phi-4-14b-pmtp es un derivado del modelo microsoft/phi-4 (14B parámetros) publicado por Polydim-Einsof, una iniciativa de investigación independiente vinculada a Ariel García Traba. El modelo se presenta como un adaptador basado en la variedad de Stiefel, bautizado como PMTP (Stiefel Manifold Adapter), que proyecta las representaciones internas del modelo desde la dimensión nativa de phi-4 (d_model = 5120) a una dimensión canónica de 2048 sobre la esfera S^(2047), inyectándose en la capa 24 de la red. La propuesta se enmarca en la línea de "continuous thought" (pensamiento continuo), es decir, la idea de transmitir estado latente entre procesos en lugar de tokens de texto serializados.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero "likes" en el momento de la consulta, y no incluye pesos publicados ni pipeline declarado. La model card es extremadamente escueta y se limita a describir la geometría del adaptador (defecto de Frobenius de 1.375e-13 medido con acumulador Neumaier en FP64) y un mecanismo propietario denominado "Zero-Worm IPC" sobre un bus de memoria compartida llamado PmtpShmBus. No se documentan datos de entrenamiento, benchmarks ni idiomas soportados.

Por tanto, se trata de un artefacto de investigación experimental, no de un modelo listo para producción: no hay evidencia publicada de que los pesos estén disponibles, de que el adaptador haya sido entrenado sobre phi-4 con datos verificables, ni de que las capacidades del modelo base se conserven tras la inyección. La ficha siguiente documenta lo que la información disponible permite afirmar y marca explícitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base microsoft/phi-4) con adaptador geométrico sobre variedad de Stiefel St(5120, 2048) inyectado en la capa 24 |
| Parámetros totales | 14B (heredados del modelo base phi-4) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base phi-4 soporta 16K tokens, dato no confirmado para este derivado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags); el repositorio reporta 0.0 GB, por lo que no se confirma la presencia de pesos |

## Arquitectura y entrenamiento

El modelo parte de microsoft/phi-4, un transformer decoder-only de 14B parámetros. Sobre esa base, el autor describe un adaptador que actúa como proyección geométrica: toma el espacio de representación de dimensión 5120 y lo mapea a una variedad canónica de dimensión 2048 sobre la esfera S^(2047), imponiendo la restricción de que las columnas de la matriz de proyección sean ortonormales (variedad de Stiefel). La inyección se realiza en la capa 24 del modelo. El autor reporta un defecto de Frobenius de 1.375e-13, calculado con un acumulador Neumaier en FP64, lo que sugiere que la proyección se mantiene numéricamente cercana a la variedad durante el cálculo.

La model card menciona además un mecanismo denominado "Zero-Worm IPC", descrito como "telepatía de tensores" sobre un bus de memoria compartida (PmtpShmBus) con cero tokens de texto serializados. No se especifica cómo se entrena el adaptador, qué datos se usan, cuántos tokens se procesan, ni si hay fases de RLHF, DPO o ajuste supervisado. Tampoco se documenta si el adaptador modifica los pesos del modelo base o se aplica en tiempo de inferencia. Toda esta información se considera no disponible.

## Capacidades

- No se han documentado capacidades específicas verificables para este derivado en la información proporcionada.
- Herencia potencial de las capacidades del modelo base phi-4 (razonamiento, código, matemáticas, contexto largo), no confirmada tras la inyección del adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comunicación de estado latente entre procesos mediante PmtpShmBus (según descripción del autor, sin especificación técnica pública).

## Casos de uso

- Investigación sobre representaciones geométricas en LLM: el adaptador permite experimentar con proyecciones sobre la variedad de Stiefel en una capa intermedia de phi-4, útil para estudiar cómo afecta la restricción de ortogonalidad a las representaciones internas.
- Estudio de "continuous thought": el mecanismo Zero-Worm IPC sugiere un escenario de paso de estado latente entre procesos sin serialización de texto, aplicable a investigación sobre comunicación entre agentes sin tokens.
- Reproducción de experimentos de geometría diferencial aplicada a redes neuronales: el defecto de Frobenius reportado permite validar implementaciones de acumuladores numéricos en FP64.
- Docencia y divulgación: como ejemplo didáctico de inyección de adaptadores geométricos en modelos transformer de tamaño medio.
- Benchmarking de estabilidad numérica: comparar el comportamiento de phi-4 con y sin la proyección en tareas de razonamiento, si el adaptador se publica con pesos.
- Exploración de eficiencia en IPC: evaluar el bus PmtpShmBus frente a serialización JSON/tokens en pipelines multi-proceso, siempre que el código esté disponible.

No se recomienda su uso en producción, atención al cliente, generación de código en CI/CD ni otras aplicaciones comerciales sin validación previa, dado que no hay pesos publicados ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este derivado concreto. Como referencia del modelo base phi-4 (14B), en FP16 requeriría aproximadamente 28 GB de VRAM; en cuantización de 8 bits, unos 14-16 GB; en 4 bits, unos 8-10 GB. Estos valores no están confirmados para el adaptador.
- GPU recomendadas: no disponible para este derivado. Para el modelo base, A100 40GB, H100 80GB o RTX 4090 24GB en FP16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización, si los pesos estuvieran disponibles; no confirmado.
- Opciones de despliegue: no disponible. El autor menciona una etiqueta Ollama (`phi4:14b`) que corresponde al modelo base, no al adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| phi-4-14b-pmtp | 14B | no disponible | apache-2.0 | no confirmada (repo 0.0 GB) | Adaptador geométrico experimental |
| microsoft/phi-4 | 14B | 16K | MIT | sí | Modelo base, benchmarks publicados |
| Qwen2.5-14B | 14B | 128K | Apache 2.0 | sí | Alternativa open source con contexto largo |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | sí | Menor tamaño, amplia adopción |

La comparación con phi-4-14b-pmtp es limitada porque no hay datos de rendimiento ni pesos verificables. El modelo base phi-4 y las alternativas citadas cuentan con benchmarks públicos y pesos descargables.

## Limitaciones y advertencias

- No hay pesos publicados en el repositorio (tamaño 0.0 GB), por lo que no se puede verificar ni ejecutar el modelo.
- Cero descargas y cero "likes" en el momento de la consulta: sin validación comunitaria.
- La model card no documenta datos de entrenamiento, hiperparámetros ni metodología de evaluación.
- El mecanismo "Zero-Worm IPC" y el bus PmtpShmBus no están especificados técnicamente ni tienen código público enlazado.
- Riesgo de alucinación: no evaluado para este derivado; el modelo base phi-4 presenta alucinaciones documentadas en tareas de conocimiento factual.
- Sesgos: no evaluados; se heredarían los del modelo base, no documentados aquí.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de pesos y de documentación impide ejercerlo de forma efectiva.
- La fecha de creación reportada (2026-11-09) es posterior a la fecha actual de referencia habitual; conviene verificar la autenticidad del repositorio.
- No apto para producción sin reproducción independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/phi-4-14b-pmtp
- Repositorio GitHub del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/microsoft/phi-4
