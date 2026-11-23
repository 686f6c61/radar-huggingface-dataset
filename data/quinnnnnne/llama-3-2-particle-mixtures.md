# Quinnnnnne/Llama-3.2-particle-mixtures

## Resumen

Llama-3.2-particle-mixtures es una colección de adaptadores LoRA publicada por Quinnnnnne (repositorio asociado a Yan Lin y colaboradores) que implementa mezclas de partículas sobre los modelos base Llama 3.2-1B y Llama 3.2-3B de Meta. No se trata de un modelo entrenado desde cero, sino de un conjunto de 32 ejecuciones de adaptadores de bajo rango que se combinan mediante un esquema de ensemble probabilístico denominado particle mixture, descrito en el preprint "Improving the Optimisation Landscape for Particle Mixtures" (Lin, Frazier, Cordero Encinar y Oates, 2026).

Cada ejecución entrena m partículas LoRA de forma conjunta compartiendo un backbone congelado, optimizando una función de riesgo puente (1 - beta) R_mix + beta R_ind, donde R_mix es la log-loss de la mezcla equipesada de las partículas y R_ind la log-loss media individual. El parámetro beta interpola entre el entrenamiento puramente conjunto (beta = 0) y el entrenamiento independiente (beta = 1). Las partículas de una misma ejecución se evalúan siempre como mezcla, no de forma aislada.

El interés del artefacto es doble: por un lado, es material reproducible para investigar cómo la estructura de la función de pérdida afecta al paisaje de optimización de ensembles; por otro, permite a desarrolladores experimentar con ensembles de LoRA sobre Llama 3.2 sin reentrenar. El repositorio ocupa 14,5 GB e incluye adaptadores en float32 con rango 32 y alpha 64 sobre las proyecciones q, k, v, up y down de todas las capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptadores LoRA sobre backbone congelado |
| Parametros totales | No disponible (depende del backbone: 1B o 3B, más adaptadores LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama 3.2, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (adaptadores almacenados en float32) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (incluye Acceptable Use Policy) |
| Formato de pesos | safetensors (adapter_model.safetensors por partícula) y config.json |
| Rango LoRA | 32 |
| Alpha LoRA | 64 |
| Módulos con LoRA | q, k, v, up, down de todas las capas |
| Número de ejecuciones | 16 (6 sobre 1B, 6 sobre 3B con m=8, 4 sobre 3B con m=4 y m=16) |
| Partículas por ejecución | 8 (principal), 4 y 16 (variantes) |
| Pasos de entrenamiento | 31.932 (tres épocas) |
| Tamaño del repo | 14,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 en sus variantes de 1B y 3B, un transformer decoder-only con atención causal estándar. Sobre ese backbone congelado se entrenan m adaptadores LoRA independientes (partículas) que comparten el modelo base. Cada partícula tiene rango 32 y alpha 64, aplicada a las proyecciones q, k, v, up y down de todas las capas. Los pesos se guardan en float32 al final del entrenamiento (paso 31.932, tres épocas).

La innovación técnica es la función de riesgo puente que se optimiza de forma conjunta: (1 - beta) R_mix + beta R_ind. Con beta = 0 se entrena la mezcla como un todo; con beta = 1 cada partícula se entrena de forma independiente. Los valores intermedios (0,01, 0,1, 0,2, 0,3) exploran el continuo entre ambos extremos. Este planteamiento busca mejorar el paisaje de optimización de ensembles de partículas, un problema clásico en inferencia bayesiana aproximada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el backbone Llama 3.2 ya incorpora el alineamiento de Meta.

## Capacidades

- Generación de texto y razonamiento heredados de Llama 3.2 (1B o 3B según el backbone elegido).
- Predicción probabilística mediante mezcla equipesada de las m partículas de una ejecución (no se recomienda usar partículas individuales).
- Evaluación determinista en H100 con el entorno de `requirements-lock.txt`: dos evaluaciones del mismo conjunto produjeron predicciones idénticas byte a byte.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada (depende del backbone Llama 3.2).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en ensembles bayesianos: el artefacto permite reproducir los experimentos del paper de Lin et al. y analizar cómo varía el rendimiento de la mezcla con beta y m, usando el código de `bayes-pro-bridge` y el script `evaluate_particles.sh`.
- Estudio del paisaje de optimización de LoRA: comparar las seis ejecuciones con beta = 0, 0,01, 0,1, 0,2, 0,3 y 1 sobre el mismo backbone permite aislar el efecto del riesgo puente frente al entrenamiento independiente.
- Baseline para nuevas técnicas de ensemble: sirve como referencia reproducible (predicciones deterministas en H100) contra la que medir métodos alternativos de combinación de adaptadores.
- Prototipado de sistemas con incertidumbre: la mezcla de partículas proporciona una distribución predictiva aproximada, útil en tareas donde se quiere estimar la confianza además de la predicción puntual.
- Docencia y formación: el tamaño manejable de los adaptadores (2,7 GiB para 1B, 5,9 GiB para 3B con m=8) y la posibilidad de ejecutar sobre Llama 3.2-1B permiten montar prácticas de ensembles sin infraestructura pesada.
- Experimentación con LoRA sobre modelos gated: dado que el backbone es Llama 3.2, sirve para equipos que ya tienen acceso a los pesos de Meta y quieren explorar variantes de adaptadores sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del paper "Improving the Optimisation Landscape for Particle Mixtures" (Lin et al., 2026), que no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el backbone Llama 3.2-1B en float16 requiere aproximadamente 2 GB y el 3B unos 6 GB; a ello hay que sumar el coste de mantener m partículas LoRA activas simultáneamente (m = 8, 4 o 16 según la ejecución).
- GPU recomendadas: la model card menciona H100 para la evaluación determinista; no se especifican otras.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño del backbone (1B y 3B) es plausible en GPUs consumer con suficiente VRAM, pero no se aporta dato oficial.
- Opciones de despliegue: el flujo documentado usa PyTorch con el repositorio `bayes-pro-bridge`, `convert_adapters.py` y `scripts/evaluate.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se sabe que la evaluación es determinista en H100 con el entorno fijado, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (ensembles de LoRA o mezclas de partículas sobre Llama 3.2) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el backbone Llama 3.2-1B o 3B desde Hugging Face, que está gated y exige aceptar la licencia de Meta e iniciar sesión.
- Las partículas deben evaluarse como mezcla; usar una partícula aislada no es el uso previsto y no está validado.
- Licencia Llama 3.2 Community License: restricciones de uso comercial y Acceptable Use Policy aplicables; es un trabajo derivado de Llama 3.2.
- Idiomas soportados no especificados; el comportamiento multilingüe dependerá del backbone.
- Riesgo de alucinación: inherente a los modelos Llama 3.2 de 1B y 3B, especialmente en la variante pequeña.
- Determinismo solo garantizado en H100 con `requirements-lock.txt`; otras GPUs o versiones de librerías pueden alterar los últimos dígitos de las probabilidades.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline no está declarado; es un artefacto de investigación, no un modelo listo para producción.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del backbone Llama 3.2.

## Enlaces

- Hugging Face: https://huggingface.co/Quinnnnnne/Llama-3.2-particle-mixtures
- Repositorio de código: https://github.com/YanLin-Quinne/bayes-pro-bridge
- Modelo base 1B: https://huggingface.co/meta-llama/Llama-3.2-1B
- Modelo base 3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Paper (referencia en la model card): Lin, Y., Frazier, D. T., Cordero Encinar, P. y Oates, C. J. (2026). "Improving the Optimisation Landscape for Particle Mixtures". arXiv preprint (sin enlace directo en la información disponible).
- Licencia Llama 3.2: incluida en el repositorio como `LICENSE` y `USE_POLICY.md`.
