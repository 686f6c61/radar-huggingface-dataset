# Quinnnnnne/particle-mixtures-qwen

## Resumen

`Quinnnnnne/particle-mixtures-qwen` es una colección de adaptadores LoRA publicada como material reproducible del artículo *Improving the Optimisation Landscape for Particle Mixtures* (Lin, Frazier, Cordero Encinar y Oates, 2026). No es un modelo entrenado para uso conversacional general, sino un conjunto de "partículas" (adaptadores LoRA independientes) que se entrenan de forma conjunta sobre un backbone congelado y se evalúan como una mezcla de predicciones con pesos iguales. El repositorio contiene 16 ejecuciones sobre dos backbones: Qwen2-1.5B-Instruct y Qwen3-4B-Base.

La innovación metodológica es la función de riesgo puente `(1 - beta) R_mix + beta R_ind`, donde `R_mix` es la log-loss de la mezcla equiponderada de las `m` partículas y `R_ind` la media de las log-loss individuales. Con `beta = 0` se obtiene entrenamiento de mezcla puro y con `beta = 1` entrenamiento independiente; los valores intermedios (0,01 a 0,3) exploran el compromiso entre diversidad y especialización. Cada ejecución incluye 8 partículas (o 4 y 16 en las ejecuciones secundarias) con LoRA de rango 32 y alpha 64 sobre las proyecciones q, k, v, up y down de todas las capas.

El interés actual es fundamentalmente de investigación: permite reproducir los experimentos del paper, comparar el efecto de `beta` y `m` sobre el paisaje de optimización y reutilizar los adaptadores como ensemble ligero sobre Qwen2-1.5B-Instruct o Qwen3-4B-Base. El tamaño del repositorio (20,3 GB) refleja que los pesos se almacenan en float32, no en cuantizaciones de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 32, alpha 64) sobre transformer decoder de Qwen2-1.5B-Instruct y Qwen3-4B-Base; ensemble de `m` partículas evaluado como mezcla equiponderada |
| Parametros totales | No disponible (depende del backbone: 1,5B o 4B, más los adaptadores LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del backbone Qwen2-1.5B-Instruct / Qwen3-4B-Base) |
| Tipos de cuantizacion | No disponible; los pesos se publican en float32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `config.json` por partícula); el script `convert_adapters.py` genera `lora_params.bin` para el repositorio de evaluación |

## Arquitectura y entrenamiento

Cada ejecución consta de `m` partículas LoRA que comparten un backbone congelado (Qwen2-1.5B-Instruct o Qwen3-4B-Base) y se entrenan conjuntamente minimizando el riesgo puente `(1 - beta) R_mix + beta R_ind`. Los adaptadores se aplican a las proyecciones q, k, v, up y down de todas las capas, con rango 32 y alpha 64. El entrenamiento se detuvo en el paso 31.932, tras tres épocas, y los pesos se guardan en float32.

El repositorio organiza los artefactos en carpetas `<backbone>_beta<beta>_m<m>/` con subcarpetas `branch_0` a `branch_{m-1}` y un `run_config.json` por ejecución. Hay 6 ejecuciones sobre Qwen2-1.5B-Instruct con `m = 8` y `beta ∈ {0, 0.01, 0.1, 0.2, 0.3, 1}` (4,4 GiB), 6 sobre Qwen3-4B-Base con los mismos `beta` y `m = 8` (7,9 GiB), y 4 adicionales sobre Qwen3-4B-Base con `beta ∈ {0, 0.1}` y `m ∈ {4, 16}` (6,6 GiB). Las revisiones de los backbones están fijadas en `scripts/backbones.sh` del repositorio de código. La evaluación es determinista con el entorno de `requirements-lock.txt` sobre GPUs H100; otras GPUs o versiones de librerías pueden alterar los últimos dígitos de las probabilidades.

## Capacidades

- Generación de texto y razonamiento heredados del backbone Qwen2-1.5B-Instruct o Qwen3-4B-Base, modulados por la mezcla de partículas LoRA.
- Predicción probabilística por ensemble: la salida se obtiene promediando las distribuciones de las `m` partículas, lo que permite estimar incertidumbre epistémica de forma aproximada.
- Reproducción de experimentos de investigación sobre mezclas de partículas y paisajes de optimización.
- Evaluación controlada del efecto de `beta` (fuerza del puente entre mezcla e independencia) y de `m` (número de partículas).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reproducción del paper: clonar `bayes-pro-bridge`, descargar una ejecución concreta y ejecutar `scripts/evaluate.sh` para regenerar las predicciones y las tablas del artículo con resultados deterministas en H100.
- Estudio del compromiso diversidad-especialización: comparar las ejecuciones con `beta = 0` (mezcla pura), `beta = 0.1` (intermedio) y `beta = 1` (independiente) sobre el mismo backbone para analizar cómo cambia la calibración del ensemble.
- Ensemble ligero en producción de bajo coste: usar las 8 partículas de `qwen2-1.5b-instruct_beta0.1_m8` como ensemble sobre un backbone de 1,5B, promediando logits para reducir varianza en tareas de clasificación o generación corta.
- Investigación en incertidumbre: aprovechar la dispersión entre partículas como proxy de incertidumbre epistémica en tareas de question answering o scoring, sin necesidad de entrenar un modelo bayesiano completo.
- Ajuste fino posterior: reutilizar una partícula individual (`branch_k/adapter_model.safetensors`) como inicialización LoRA para un dominio concreto, dado que cada adaptador es independiente y compatible con PEFT.
- Docencia y experimentación con LoRA: el repositorio ofrece 16 configuraciones listas para cargar con `peft` sobre dos backbones de tamaño contenido, útil para prácticas de ajuste eficiente y ensembles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas y figuras del artículo *Improving the Optimisation Landscape for Particle Mixtures*, que se calculan con `analysis/` a partir de las predicciones generadas por la evaluación, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el backbone Qwen2-1.5B-Instruct en float16 requiere aproximadamente 3 GB y Qwen3-4B-Base en float16 unos 8 GB; a ello hay que sumar los adaptadores LoRA (rango 32 sobre q, k, v, up y down de todas las capas) y, en evaluación de ensemble, las `m` partículas cargadas simultáneamente o evaluadas en secuencia.
- Los pesos se publican en float32, lo que duplica el espacio respecto a float16; para inferencia conviene convertirlos a bfloat16 o float16.
- GPU recomendadas: la model card cita H100 para la evaluación determinista del paper. Para uso práctico, una RTX 4090 (24 GB) es suficiente para el backbone de 1,5B con ensemble de 8 partículas y para el de 4B con cuantización o evaluación secuencial.
- Cabe en GPU de consumo: sí, tanto el backbone de 1,5B como el de 4B (este último con margen ajustado en 24 GB si se cargan todas las partículas a la vez).
- Opciones de despliegue: el flujo documentado usa `transformers` + `peft` a través del repositorio `bayes-pro-bridge`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al ser adaptadores LoRA en safetensors requerirían fusión previa con el backbone para usarse en motores de inferencia estándar.
- Latencia y throughput: no disponibles. La evaluación del paper se describe como determinista en H100 con el entorno de `requirements-lock.txt`, pero no se aportan cifras de latencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (ensembles de partículas LoRA publicados como artefactos de investigación). Como referencia de tamaño, los backbones subyacentes son Qwen2-1.5B-Instruct y Qwen3-4B-Base, pero la comparación directa con estos no es significativa porque el repositorio no publica un modelo fusionado ni métricas de rendimiento propias.

## Limitaciones y advertencias

- No es un modelo listo para producción: son adaptadores LoRA de investigación que requieren cargar el backbone correspondiente y, para evaluación, el repositorio `bayes-pro-bridge`.
- Los pesos están en float32, lo que infla el tamaño del repositorio (20,3 GB) y el consumo de memoria frente a un despliegue en bfloat16.
- La evaluación determinista solo está garantizada con el entorno de `requirements-lock.txt` sobre H100; otras GPUs o versiones de librerías pueden producir diferencias en los últimos dígitos de las probabilidades.
- El rendimiento del ensemble depende de la mezcla equiponderada de las `m` partículas; no se documenta un mecanismo de pesos aprendidos ni de selección de partículas.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática específicos de estos adaptadores; heredan los del backbone Qwen2-1.5B-Instruct o Qwen3-4B-Base.
- Licencia Apache-2.0, la misma que los backbones, lo que permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Quinnnnnne/particle-mixtures-qwen
- Repositorio de código y evaluación: https://github.com/YanLin-Quinne/bayes-pro-bridge
- Backbone Qwen2-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Backbone Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Artículo: *Improving the Optimisation Landscape for Particle Mixtures* (Lin, Frazier, Cordero Encinar y Oates, 2026), arXiv preprint; el identificador arXiv no está disponible en la información proporcionada.
