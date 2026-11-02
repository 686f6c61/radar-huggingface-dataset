# odelpa/qwen3-8b-med6m

## Resumen

Qwen3-8b-med6m es un adaptador LoRA de rango 64 sobre el modelo base Qwen3-8B, desarrollado por Giovanni Del Papa (odelpa), investigador independiente italiano, dentro del proyecto «Lo Scienziato Dilettante GDP». El adaptador se entrena con QLoRA sobre una mezcla de datos médicos (MedMCQA-train, MedQA-train y Wikipedia médica en italiano e inglés) más un 22 % de replay general, con el objetivo de mejorar el rendimiento del modelo base en preguntas médicas de opción múltiple.

El artefacto publicado es el checkpoint 443 del segundo estadio de entrenamiento (S1_v2r), no el checkpoint final 886. Sobre un test sellado de uso único de 3766 ítems médicos (MedMCQA, MedQA, MMLU-med y PubMedQA), a escala LoRA 0,5, la precisión agregada pasa del 61,34 % al 63,67 %, una mejora de +2,34 puntos porcentuales con intervalo de confianza del 95 % de [+1,14; +3,53] y p de McNemar exacto de 1,4·10⁻⁴.

Es relevante ahora porque documenta con rigor estadístico (bootstrap apareado, McNemar exacto, test sellado con marcador de uso) el efecto de un ajuste fino médico sobre un modelo de 8 mil millones de parámetros, incluyendo una guardia de no regresión en italiano (ARC-it) y una política de licencias conservadora. Su alcance es deliberadamente limitado: evaluación mediante log-probabilidad de la letra de respuesta, no generación libre, y sin resultados aún de GSM8K o IFEval sobre este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 64) sobre transformer Qwen3-8B; entrenamiento QLoRA |
| Parametros totales | Adaptador LoRA sobre base de 8B (tamaño del repo: 0,7 GB); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ejemplo de uso con max_seq_length=2048) |
| Tipos de cuantizacion | Base entrenada en 4 bits (bnb-4bit); adaptador en safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | CC BY-SA 4.0 (adaptador, artículo y figuras); código Apache-2.0; base Qwen3-8B Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); librería peft |

## Arquitectura y entrenamiento

El adaptador aplica una actualización de bajo rango sobre los pesos del modelo base según W = W₀ + s·(α/r)·B·A, con s = 0,5 y α/r = 1 en inferencia. El entrenamiento se realizó con QLoRA sobre una Tesla T4 en dos estadios: S1_v2 (885 pasos, learning rate 5e-5) y S1_v2r (learning rate 1,3e-5, semilla 3408, 22 % de replay), publicándose el checkpoint 443 de S1_v2r. La configuración de entrenamiento está disponible en `training_config.json`.

La mezcla de datos combina MedMCQA-train, MedQA-train y Wikipedia médica en italiano e inglés con un 22 % de replay general (OASST2, Aya, Dolly, Wikipedia IT, FineWeb-Edu, FineWeb-2-it). Se aplicó decontaminación por 10-gramas frente a los conjuntos de desarrollo y test para evitar filtración. La evaluación se realizó sobre un test sellado con marcador `TEST_USED` (fecha 1/11/2026), comparando base frente a adaptador a escalas 0,5 y 0,75, con intervalos de confianza por bootstrap percentil apareado (B = 20 000, semilla 20261101) y prueba exacta de McNemar.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen3-8B.
- Responder preguntas médicas de opción múltiple mediante puntuación por log-probabilidad de la letra de respuesta.
- Mejora medida en MedMCQA (+2,89 pp), PubMedQA (+2,78 pp), MedQA (+1,55 pp) y MMLU-med (+0,74 pp) a escala 0,5.
- Mantenimiento del rendimiento en italiano general: guardia ARC-it sin regresión significativa (+0,74 pp, IC [−1,29; +2,76]).
- Soporte bilingüe italiano-inglés en el ámbito médico entrenado.
- Tool calling, function calling, agentes, visión, audio y modo thinking: no disponibles en la información proporcionada (heredados o no del base Qwen3-8B, sin verificación en este adaptador).
- Razonamiento matemático (GSM8K) e instrucciones (IFEval): no medidos en este checkpoint.

## Casos de uso

- Evaluación comparativa de ajuste fino médico: usar el adaptador como referencia reproducida para medir el efecto de QLoRA sobre Qwen3-8B en conjuntos de opción múltiple, con metodología estadística documentada (bootstrap apareado y McNemar).
- Investigación sobre adaptación de formato de examen: analizar hasta qué punto la mejora en MedMCQA proviene de adaptación al formato (MedMCQA-train está en la mezcla) frente a conocimiento médico genuino, dado que el propio autor señala esta caveat.
- Punto de partida para ajustes médicos posteriores: el adaptador sirve como inicialización LoRA sobre Qwen3-8B para experimentos con datos médicos italianos, gracias a la licencia CC BY-SA 4.0 y a la base Apache-2.0.
- Responder a preguntas médicas de opción múltiple en italiano: el adaptador mejora la precisión agregada en 2,34 pp sobre el base, útil en entornos de evaluación educativa o triaje de preguntas, siempre con la advertencia de que no es dispositivo médico.
- Verificación de no regresión multilingüe: usar ARC-it como guardia para comprobar que un ajuste médico no degrada capacidades generales en italiano antes de desplegar variantes del adaptador.
- Reproducibilidad de experimentos: con `CHECKSUMS.sha256`, `training_config.json` y el test sellado, el adaptador permite replicar la comparación base frente a adaptador con escala LoRA 0,5 y 0,75 en hardware modesto (Tesla T4).
- Estudio de escalado de LoRA en inferencia: comparar los resultados a escala 0,5 (+2,34 pp) y 0,75 (+2,44 pp, IC [+1,17; +3,69]) para analizar el efecto de la escala de adaptación en tareas médicas.

## Benchmarks y rendimiento

Resultados del test sellado a escala LoRA 0,5 (datos del autor):

| Conjunto | n | Base % | Adaptador % | Δ (pp) | IC 95 % | +/− | McNemar p |
|---|---:|---:|---:|---:|---|---:|---:|
| MedMCQA | 2078 | 57,31 | 60,20 | +2,89 | [+1,15; +4,62] | 200/140 | 0,001 |
| MedQA | 646 | 62,85 | 64,40 | +1,55 | [−1,55; +4,64] | 57/47 | 0,378 |
| MMLU-med | 538 | 78,25 | 79,00 | +0,74 | [−1,67; +3,16] | 25/21 | 0,659 |
| PubMedQA | 504 | 57,94 | 60,71 | +2,78 | [+0,60; +5,16] | 24/10 | 0,024 |
| Pool médico | 3766 | 61,34 | 63,67 | +2,34 | [+1,14; +3,53] | 306/218 | <0,001 |
| ARC-it (guardia) | 543 | 88,21 | 88,95 | +0,74 | [−1,29; +2,76] | 17/13 | 0,585 |

A escala 0,75, el pool médico mejora +2,44 pp con IC [+1,17; +3,69], estadísticamente indistinguible de la escala 0,5. No se aplicó corrección por comparaciones múltiples. GSM8K e IFEval no están medidos en este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador ocupa 0,7 GB y el base se carga en 4 bits según el ejemplo del autor (bitsandbytes), lo que reduce el requisito frente al base en precisión completa.
- GPU recomendadas: el autor entrenó en una Tesla T4; para inferencia con base en 4 bits se requiere una GPU con suficiente VRAM para Qwen3-8B cuantizado, pero no se especifica cifra concreta.
- GPU consumer: no disponible; el ejemplo de uso emplea `load_in_4bit=True` con Unsloth, compatible con GPUs consumer con VRAM suficiente para un modelo de 8B en 4 bits, sin dato verificable en la información.
- Opciones de despliegue: Unsloth (`FastLanguageModel`) o transformers + bitsandbytes con `PeftModel`; vLLM, llama.cpp, Ollama y TGI no están mencionados en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento médico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| odelpa/qwen3-8b-med6m | Adaptador LoRA sobre 8B | no disponible | Pool médico 63,67 % (escala 0,5) | CC BY-SA 4.0 (adaptador) | HuggingFace, 0 descargas |
| Qwen3-8B (base, unsloth bnb-4bit) | 8B | no disponible | Pool médico 61,34 % | Apache-2.0 | HuggingFace |
| Alternativas médicas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores médicos comparables en la información proporcionada; la única comparación documentada es frente al modelo base Qwen3-8B.

## Limitaciones y advertencias

- No es un dispositivo médico ni proporciona consejo médico; la evaluación se limita a preguntas de opción múltiple.
- El artefacto publicado es el checkpoint 443, no el final 886, por lo que los resultados no representan el entrenamiento completo.
- MedQA y MMLU-med muestran mejoras positivas pero no significativas estadísticamente.
- Parte de la ganancia en MedMCQA puede deberse a adaptación al formato de examen, ya que MedMCQA-train está incluido en la mezcla de entrenamiento.
- La evaluación usa log-probabilidad de la letra de respuesta, no generación libre; el comportamiento en generación abierta no está caracterizado.
- GSM8K e IFEval no se han medido en este checkpoint.
- No se realizó auditoría de red dinámica (ver `NETWORK_AUDIT.md`).
- No se aplicó corrección por comparaciones múltiples en los contrastes estadísticos.
- La extensión del share-alike de CC BY-SA 4.0 a los pesos es una cuestión jurídica abierta; el autor adoptó la opción conservadora, lo que puede condicionar el uso comercial.
- Idiomas limitados a italiano e inglés; no hay datos de rendimiento en castellano ni en otros idiomas.
- Sesgos conocidos y riesgo de alucinación: no documentados específicamente en la información proporcionada, aunque son inherentes al modelo base.
- Modelo con 0 descargas y 0 likes en HuggingFace: sin validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/odelpa/qwen3-8b-med6m
- GitHub: https://github.com/usergdp136/qwen3-8b-med6m
- DOI Zenodo: https://doi.org/10.5281/zenodo.23895100
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MedQA: https://huggingface.co/datasets/openlifescienceai/medqa
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
