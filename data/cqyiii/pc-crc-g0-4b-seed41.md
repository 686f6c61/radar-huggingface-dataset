# Cqyiii/PC-CRC-G0-4B-seed41

## Resumen

PC-CRC-G0-4B-seed41 es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3.5-4B, publicado por el autor Cqyiii en el marco de un trabajo de investigación sobre control de riesgo conformal aplicado a razonamiento con presupuesto de tokens limitado. No se trata de un modelo generalista, sino de un "solver" congelado (step-50) que forma parte de los experimentos del paper *Decoupling Solving from Abstention: Single-Rollout Conformal Risk Control for Hard-Budget Reasoning* de Qianyi Chen. El adaptador se entrena con ExtBF-GRPO y recompensas binarias verificables, y su función es resolver problemas matemáticos bajo un presupuesto duro de 4.096 tokens con cierre forzado en el token 2.048.

La innovación metodológica que acompaña a este adaptador es el esquema Solve-then-Calibrate: primero se aprende a resolver bajo el presupuesto, y después, con los pesos congelados, se aplica Tail-CRC (Tail Conformal Risk Control) para decidir si se envía o no la respuesta completada. Tail-CRC promedia los ⌈L/10⌉ surprisals de token más altos en la respuesta post-cierre de L tokens (métrica `tail10_nll`) y ajusta un umbral sobre familias de calibración reservadas; se envía la respuesta cuando la puntuación cae por debajo del umbral, controlando la probabilidad marginal de enviar una respuesta incorrecta.

El interés del release es fundamentalmente de investigación: reproduce comparaciones históricas box-score y white-box, incluye verificación de serialización y proyección, y se distribuye junto con el código de reproducción y un dataset numérico de observaciones de calibración. No incluye el filtro de calibración ni el estimando agrupado, que residen en el código y el dataset complementarios. El adaptador tiene un tamaño de repositorio de 0,6 GB y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B (atención lineal en 24 grupos QKV) |
| Parametros totales | no disponible (adaptador LoRA; el base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (presupuesto de entrenamiento: 4.096 tokens, cierre en 2.048) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT; 402 tensores de factores en el layout PEFT, 498 en la exportación original) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B (revisión 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a), un transformer con atención lineal en 24 grupos QKV cuyo rango efectivo y alpha son 96. El base ata sus embeddings de entrada y salida; al cargar el adaptador directamente se añade un delta separado en la proyección de salida, por lo que para fusionar en pesos standalone hay que desatar primero la cabeza de salida y mantener intactos los embeddings de entrada. El adaptador se entrenó con PEFT (rank y alpha 32), learning rate 1e-5, 400 familias de entrenamiento DAPO, 50 pasos de optimizador, 16 prompts y 8 rollouts por prompt, con recompensa binaria y forzado externo de presupuesto (ExtBF-GRPO): respuesta correcta enviada = 1, respuesta incorrecta o no envío = 0. El presupuesto es de 4.096 tokens con cierre en el token 2.048.

La innovación principal no está en el adaptador en sí, sino en el pipeline Solve-then-Calibrate: una vez congelados los pesos del solver, Tail-CRC usa un único rollout completado, promedia los ⌈L/10⌉ surprisals de token más altos en la respuesta post-cierre (`tail10_nll`) y ajusta un umbral sobre familias de calibración reservadas. El objetivo es la probabilidad marginal de enviar una respuesta incorrecta. El paper promedia las semillas 41 y 73 dentro de cada familia de problemas; este adaptador de una sola semilla no codifica el filtro de calibración ni el estimando agrupado. El entrenamiento se realizó con Tinker.

## Capacidades

- Razonamiento matemático bajo presupuesto duro de tokens: resuelve problemas con cierre forzado en el token 2.048 dentro de un presupuesto de 4.096.
- Generación de texto y razonamiento de cadena (el solver produce una respuesta completada que después se evalúa con `tail10_nll`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del pipeline Solve-then-Calibrate.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: forma parte de un mecanismo de abstención calibrada (Tail-CRC) que decide si enviar o no la respuesta; el adaptador por sí solo no implementa esa decisión.

## Casos de uso

- Investigación en control de riesgo conformal: reproducción del pipeline Solve-then-Calibrate con el código y el dataset numérico complementarios, usando el adaptador como solver congelado y ajustando el umbral de Tail-CRC sobre familias de calibración.
- Evaluación de abstención calibrada en razonamiento matemático: medir la probabilidad marginal de enviar una respuesta incorrecta y comparar con las líneas base box-score y white-box del paper.
- Estudio de portabilidad de adaptadores LoRA: el release incluye verificación de factores, bloques de padding cero, mapeos de proyección y una dirección sintética float64 por módulo destino, útil para validar pipelines de serialización PEFT.
- Reproducción de resultados con dos semillas: comparar el solver seed 41 con el seed 73 y con la variante de 8B en las mismas familias de problemas.
- Análisis de calibración dependiente del dominio y del presupuesto de despliegue: los umbrales dependen de ambos, por lo que el adaptador sirve para estudiar la transferencia y la pérdida de cobertura observada.
- Validación de fidelidad de inferencia: el release reporta MAE de log-probabilidad en tokens crudos (0,00299518 en modelo fusionado y 0,0033021 en carga PEFT directa sobre 32 tokens DEV), útil para comparar backends de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de verificación de serialización y proyección (MAE de log-probabilidad en tokens crudos) y referencias cualitativas a las comparaciones históricas box-score y white-box del paper, sin cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- El adaptador ocupa 0,6 GB; el modelo base Qwen3.5-4B debe cargarse aparte y determina el grueso de los requisitos de memoria.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la cuantización del base, que no se documenta.
- GPU recomendadas: no disponibles; el entorno histórico de portabilidad del paper usó A100 con PyTorch 2.8.0+cu128, Transformers 5.8.1 y PEFT 0.19.1.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga vía Transformers + PEFT (`AutoModelForImageTextToText` + `PeftModel.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PC-CRC-G0-4B-seed41 (este) | Adaptador sobre base 4B | no disponible | Métricas de verificación de serialización; sin benchmarks públicos | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| PC-CRC-G0-4B-seed73 | Adaptador sobre base 4B | no disponible | Misma metodología, otra semilla | Apache-2.0 | Hugging Face |
| PC-CRC-G0-8B-seed41 | Adaptador sobre base 8B | no disponible | Incluye overruns de riesgo DAPO para 8B según la model card | Apache-2.0 | Hugging Face |
| PC-CRC-G0-8B-seed73 | Adaptador sobre base 8B | no disponible | Misma metodología, otra semilla | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Este adaptador de una sola semilla no codifica el filtro de calibración ni el estimando agrupado del paper; el análisis promedia las semillas 41 y 73 dentro de cada familia.
- Los umbrales de Tail-CRC dependen del dominio y del presupuesto de despliegue; no son transferibles sin recalibración.
- La evaluación del paper incluye overruns de riesgo DAPO para 8B y pérdida de cobertura observada en transferencia, lo que indica que el control de riesgo no es uniforme entre dominios.
- La verificación pública del release es de serialización y proyección; las generaciones end-to-end pueden variar según el renderer y el backend de inferencia.
- Riesgo de alucinación y sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas; el presupuesto de entrenamiento es de 4.096 tokens con cierre en 2.048.
- Uso comercial: la licencia Apache-2.0 del adaptador y del base lo permite, pero el adaptador está pensado para investigación y no se documenta su comportamiento fuera del pipeline Solve-then-Calibrate.
- El adaptador no debe cargarse como modelo standalone: requiere el base Qwen3.5-4B y, para fusionar, desatar la cabeza de salida.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed41
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Dataset numérico de observaciones: https://huggingface.co/datasets/Cqyiii/pc-crc-observations
- Código de reproducción de Tail-CRC: https://github.com/Cqyiiii/pc-crc
- Adaptador seed 73 (4B): https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed73
- Adaptador seed 41 (8B): https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed41
- Adaptador seed 73 (8B): https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed73
