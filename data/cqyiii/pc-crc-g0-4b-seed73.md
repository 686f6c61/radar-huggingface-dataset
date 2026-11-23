# Cqyiii/PC-CRC-G0-4B-seed73

## Resumen

PC-CRC-G0-4B-seed73 es un adaptador LoRA de investigación publicado por Cqyiii (Qianyi Chen) sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo de propósito general, sino un "solver" entrenado específicamente para el método Solve-then-Calibrate descrito en el paper *Decoupling Solving from Abstention: Single-Rollout Conformal Risk Control for Hard-Budget Reasoning*. El adaptador aprende a resolver problemas de matemáticas con un presupuesto duro de tokens (4.096 tokens, con cierre forzado en el token 2.048) y con recompensas binarias verificables.

La innovación del trabajo no reside en el adaptador en sí, sino en el marco que lo rodea: Tail-CRC utiliza un único rollout completado para estimar el riesgo de error. Concretamente, promedia los ⌈L/10⌉ surprisals de token más altos en la respuesta posterior al cierre (métrica `tail10_nll`) y ajusta un umbral sobre familias de calibración reservadas, de modo que el modelo solo envía una respuesta cuando su puntuación cae por debajo del umbral. El objetivo es controlar la probabilidad marginal de enviar una respuesta incorrecta.

Este repositorio contiene únicamente uno de los solvers congelados (semilla 73, paso 50) empleados en los experimentos. El filtro de calibración y el estimando agrupado no están codificados en el adaptador: para reproducir Tail-CRC es necesario el dataset numérico de observaciones y el código de reproducción asociados. Es, por tanto, material de investigación reproducible, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B, con atención lineal en 24 grupos QKV |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de entrenamiento: 4.096 tokens, cierre en 2.048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptadores y modelo base) |
| Formato de pesos | safetensors (layout PEFT; export original en `original/` con 498 tensores frente a 402 del layout PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer con atención lineal en determinados grupos QKV (los 24 grupos QKV de atención lineal tienen rango efectivo y alpha 96). El entrenamiento emplea ExtBF-GRPO con recompensas binarias verificables: una respuesta correcta enviada obtiene 1; una respuesta incorrecta o la no presentación obtienen 0. Se usaron 400 familias de entrenamiento DAPO, 50 pasos de optimizador, 16 prompts y 8 rollouts por prompt, con learning rate 1e-5, rango y alpha 32, y un presupuesto de 4.096 tokens con cierre forzado en el token 2.048.

La innovación metodológica es la separación entre resolver y abstenerse. El solver se entrena primero bajo el presupuesto duro y después se congela; la decisión de enviar la respuesta la toma Tail-CRC mediante un umbral ajustado sobre familias de calibración reservadas, usando la métrica `tail10_nll` calculada sobre un único rollout completado. El paper promedia las semillas 41 y 73 dentro de cada familia de problemas; este adaptador de semilla única no incorpora el filtro de calibración ni el estimando agrupado. Los adaptadores se entrenaron con Tinker.

## Capacidades

- Resolución de problemas de matemáticas bajo un presupuesto duro de tokens, con cierre forzado de la respuesta.
- Generación de respuestas con estructura de "cierre" explícita, apta para el cálculo posterior de surprisals de token.
- Producción de señales de confianza derivadas del propio rollout (surprisals de token) que alimentan el mecanismo de abstención de Tail-CRC.
- Compatibilidad con el ecosistema PEFT/Transformers para carga como adaptador sobre el base Qwen3.5-4B.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.
- No se documenta un modo "thinking" explícito más allá del esquema de presupuesto y cierre.

## Casos de uso

- Investigación en control de riesgo conformal: el adaptador sirve como solver congelado para reproducir los experimentos de Tail-CRC y comparar umbrales de abstención sobre familias de calibración reservadas.
- Evaluación de abstención selectiva en razonamiento matemático: permite estudiar la relación entre `tail10_nll` y la probabilidad de error en respuestas enviadas, usando el dataset de observaciones numéricas.
- Reproducibilidad de resultados: junto con el código del repositorio y el dataset, permite replicar las comparaciones históricas box-score y white-box del paper.
- Estudio de presupuestos duros de tokens: útil para analizar cómo afecta el cierre forzado en el token 2.048 a la calidad de la respuesta y a la calibración.
- Comparación entre semillas y tamaños: al existir variantes de semilla 41 y 73 y versiones de 4B y 8B, permite analizar la varianza entre semillas y el efecto del tamaño del base.
- Validación de portabilidad numérica: el adaptador incluye comprobaciones de factores, bloques de padding cero y proyecciones, útil para verificar pipelines de carga PEFT frente a pesos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comprobación de portabilidad: para esta semilla, la comparación histórica con pesos fusionados en A100 midió un MAE de log-probabilidad de tokens crudos de 0,00787374 sobre 32 tokens DEV. No se proporcionan cifras de MMLU, GSM8K, HumanEval ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base es de 4B parámetros y el adaptador ocupa 0,6 GB en el repositorio.
- El entorno histórico de portabilidad usó A100 con PyTorch 2.8.0+cu128, Transformers 5.8.1 y PEFT 0.19.1.
- GPU recomendadas: no disponibles; por tamaño del base, cabría esperar ejecución en GPUs consumer de gama alta, pero no se confirma en la información proporcionada.
- Opciones de despliegue: carga vía Transformers + PEFT con `PeftModel.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota de fusión: el base 4B comparte embeddings de entrada y salida; para fusionar el adaptador en pesos independientes hay que desatar la cabeza de salida primero y mantener los embeddings de entrada sin cambios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PC-CRC-G0-4B-seed73 | Adaptador sobre base 4B | no disponible | LoRA de investigación (matemáticas, abstención) | Apache-2.0 | Hugging Face |
| PC-CRC-G0-4B-seed41 | Adaptador sobre base 4B | no disponible | LoRA de investigación (misma metodología, otra semilla) | Apache-2.0 | Hugging Face |
| PC-CRC-G0-8B-seed73 | Adaptador sobre base 8B | no disponible | LoRA de investigación (misma metodología, base mayor) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base de propósito general | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no incluye el filtro de calibración ni el estimando agrupado del paper; usarlo de forma aislada no reproduce el control de riesgo de Tail-CRC.
- Los umbrales de abstención dependen del dominio y del presupuesto de despliegue, por lo que no son transferibles sin recalibración.
- El paper reporta pérdida de cobertura observada en transferencia y sobrepasos de riesgo DAPO para el modelo de 8B; estos caveats afectan al uso en producción.
- El adaptador está entrenado para un presupuesto concreto (4.096 tokens, cierre en 2.048); su comportamiento fuera de ese régimen no está caracterizado.
- Las generaciones end-to-end pueden variar según el renderer y el backend de inferencia.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática.
- No se especifican restricciones adicionales de uso comercial más allá de la licencia Apache-2.0.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed73
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Dataset numérico de observaciones: https://huggingface.co/datasets/Cqyiii/pc-crc-observations
- Código de reproducción de Tail-CRC: https://github.com/Cqyiiii/pc-crc
- Variante semilla 41 (4B): https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed41
- Variante semilla 41 (8B): https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed41
- Variante semilla 73 (8B): https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed73
