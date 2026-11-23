# Cqyiii/PC-CRC-G0-8B-seed73

## Resumen

PC-CRC-G0-8B-seed73 es un adaptador LoRA (PEFT) de investigación publicado por Cqyiii sobre el modelo base Qwen/Qwen3-8B. No es un modelo conversacional de propósito general, sino el «solver» G0 del método Solve-then-Calibrate descrito en el paper *Decoupling Solving from Abstention: Single-Rollout Conformal Risk Control for Hard-Budget Reasoning* de Qianyi Chen. Su función es resolver problemas de razonamiento matemático bajo un presupuesto duro de tokens (4.096 tokens, con cierre forzado en el token 2.048) y producir una respuesta completada que después se evalúa externamente.

La relevancia del artefacto está en la separación entre resolver y abstenerse: el adaptador solo aprende a resolver; la decisión de enviar o no la respuesta la toma un filtro Tail-CRC externo que promedia los ⌈L/10⌉ surprisals más altos de la respuesta y aplica un umbral calibrado sobre familias de calibración reservadas. El adaptador es un paso 50 congelado, con rango y alpha 32, entrenado con ExtBF-GRPO y recompensas binarias verificables sobre 400 familias de entrenamiento DAPO.

Se trata de un release de reproducibilidad: el repositorio incluye los factores de inferencia originales, un `verification.json` con hashes SHA-256 y comprobaciones de serialización y proyección. No incorpora el filtro de calibración ni el estimando agrupado de dos semillas; es un único solver con semilla 73 que debe combinarse con el código y el dataset numérico del proyecto para reproducir el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA se distribuye como delta (repo de 0,7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (presupuesto de entrenamiento: 4.096 tokens, cierre en 2.048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3-8B) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (adaptador y base) |
| Formato de pesos | safetensors (PEFT; factores originales en `original/`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El entrenamiento usa ExtBF-GRPO (GRPO con forzado externo de presupuesto) y recompensa binaria verificable: 1 si la respuesta enviada es correcta, 0 si es incorrecta o no se envía. Se entrenó durante 50 pasos de optimizador con 400 familias DAPO, 16 prompts y 8 rollouts por prompt, learning rate 1e-5, rango y alpha 32, y un presupuesto de 4.096 tokens con cierre forzado en el token 2.048. El entrenamiento se realizó con Tinker.

La innovación del método no reside en el adaptador en sí, sino en el pipeline: una vez congelados los pesos del solver, Tail-CRC calcula `tail10_nll` (media de los ⌈L/10⌉ surprisals más altos en los L tokens posteriores al cierre de la respuesta) sobre un único rollout completado y ajusta un umbral sobre familias de calibración reservadas. El objetivo es la probabilidad marginal de enviar una respuesta incorrecta. El export mapea los factores de unembedding aprendidos sobre la proyección de salida; el repositorio conserva 506 tensores de factores tanto en el layout PEFT como en el original.

## Capacidades

- Razonamiento matemático bajo presupuesto duro de tokens, con cierre forzado de la respuesta en el token 2.048.
- Generación de cadenas de razonamiento completas y verificables (el reward es binario y comprobable automáticamente).
- Producción de señales de confianza implícitas vía surprisal por token, explotables por el filtro Tail-CRC externo.
- Hereda del base Qwen3-8B las capacidades generales de generación de texto y multilingüismo, aunque el adaptador está especializado en matemáticas.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico en la información disponible.
- No se documentan modos de thinking, visión ni audio específicos del adaptador.

## Casos de uso

- Reproducción de investigación en conformal risk control: cargar el adaptador junto con el dataset `pc-crc-observations` y el código de `pc-crc` para recalcular umbrales y comparar con los resultados del paper.
- Estudio de abstención selectiva en razonamiento matemático: usar `tail10_nll` como score de confianza y medir la cobertura empírica frente al riesgo objetivo en familias reservadas.
- Comparación de semillas en experimentos controlados: emparejar este adaptador (seed 73) con el de seed 41 para replicar el estimando agrupado por familia que describe el paper.
- Evaluación de transferencia de dominio: medir la pérdida de cobertura observada al aplicar umbrales calibrados en un dominio a otro distinto.
- Benchmarking de métodos de calibración post-hoc: usar el solver congelado como componente fijo y comparar Tail-CRC contra comparaciones box-score y white-box históricas.
- Docencia y experimentación con LoRA sobre Qwen3-8B: el repo incluye verificación de hashes y comprobaciones de proyección que sirven como ejemplo de release reproducible de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de portabilidad y verificación de serialización: MAE de log-probabilidad por token de 0,00264194 en 32 tokens DEV para la comprobación histórica con pesos fusionados en A100, y 506 tensores de factores verificados tanto en el export original como en el layout PEFT.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade un delta pequeño (repo de 0,7 GB), pero requiere cargar el base Qwen3-8B completo; en fp16 se necesitan aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluaciones a gran escala; el entorno histórico de portabilidad usó A100 con PyTorch 2.7.1+cu128, Transformers 4.51.3 y PEFT 0.15.2.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con cuantización parcial o en fp8/4-bit; en GPUs de 16 GB requiere cuantización del base.
- Opciones de despliegue: Transformers + PEFT (ruta documentada), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador con el base, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. El presupuesto de 4.096 tokens con cierre en 2.048 condiciona la latencia máxima por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PC-CRC-G0-8B-seed73 | 8B (base) + LoRA | no disponible | Adaptador de investigación (matemáticas, abstención) | apache-2.0 | Hugging Face |
| PC-CRC-G0-8B-seed41 | 8B (base) + LoRA | no disponible | Misma familia, otra semilla | apache-2.0 | Hugging Face |
| PC-CRC-G0-4B-seed73 | 4B (base Qwen3.5-4B) + LoRA | no disponible | Misma familia, menor tamaño | apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B | no disponible en la informacion | Modelo base generalista | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción: no incorpora el filtro de calibración ni el estimando agrupado de dos semillas.
- Los umbrales de Tail-CRC dependen del dominio y del presupuesto de despliegue; un umbral calibrado en un dominio puede degradar la cobertura al transferirse a otro.
- El adaptador está entrenado solo 50 pasos sobre 400 familias DAPO; su especialización es estrecha y centrada en matemáticas.
- Riesgo de alucinación inherente al base Qwen3-8B, no mitigado por el adaptador; la mitigación depende del filtro externo.
- No se documentan sesgos específicos ni cobertura idiomática del adaptador; los idiomas soportados figuran como no disponibles.
- Las generaciones end-to-end pueden variar según el renderer y el backend de inferencia, según advierte la propia model card.
- La licencia apache-2.0 permite uso comercial, pero la validez científica del pipeline exige respetar la separación solver/calibración y no presentar el adaptador aislado como sistema de abstención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed73
- Modelo base Qwen3-8B (revisión fijada): https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Dataset numérico de observaciones: https://huggingface.co/datasets/Cqyiii/pc-crc-observations
- Código de reproducción Tail-CRC: https://github.com/Cqyiiii/pc-crc
- Adaptador seed 41 (8B): https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed41
- Adaptador seed 41 (4B): https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed41
- Adaptador seed 73 (4B): https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed73
