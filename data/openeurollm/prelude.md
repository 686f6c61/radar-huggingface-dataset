# openeurollm/prelude

## Resumen

Prelude-base 9B es un modelo de lenguaje de tipo dense, autoregresivo y decoder-only desarrollado por OpenEuroLLM, un consorcio europeo cuyo objetivo es construir una familia de modelos fundacionales entrenados en infraestructura europea. El modelo sigue de cerca la arquitectura Qwen3 y se presenta como un checkpoint base (sin ajuste de instrucciones), entrenado sobre 10 billones de tokens en el superordenador Leonardo del CINECA. Con 9.093.567.488 parámetros totales y una ventana de contexto de 4096 tokens, se posiciona como un modelo de tamano medio orientado a cubrir las 36 lenguas objetivo iniciales del proyecto.

Su relevancia actual reside en dos factores: por un lado, la cobertura lingüística, que incluye lenguas europeas de recursos limitados como el gaélico irlandés, el letón, el esloveno, el maltés o el euskera, habitualmente ausentes en los modelos fundacionales de gran escala; por otro, su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. El repositorio publica checkpoints intermedios e intermedios de annealing, lo que facilita el análisis de la evolución del entrenamiento.

El modelo se distribuye en formato safetensors con pesos en bf16 y un tokenizador de 262.145 entradas. No incluye ajuste por instrucciones ni preferencias, por lo que debe tratarse como una base sobre la que aplicar fine-tuning o alineamiento posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only dense, estilo Qwen3, con GQA, RoPE y QK-norm |
| Parametros totales | 9.093.567.488 (~9,09 B) |
| Parametros activos | no disponible (modelo dense, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 36 lenguas objetivo (41 codigos lengua/escritura): en, es, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only dense con 36 capas, hidden size de 4096, FFN de 12288 con activación SwiGLU, 32 cabezas de atención y 8 grupos KV (GQA), con dimensión de cabeza de 128. Usa RoPE con base 100000, RMSNorm con epsilon 1e-5 y QK-norm. Los embeddings de entrada y la cabeza de salida están destados (untied), con 1.074.266.112 parámetros cada uno, lo que explica buena parte del total de 9,09 B. El vocabulario es de 262.145 entradas (tokenizador de 256k, ampliado a 262.272 por eficiencia de tensor parallelism). El modelo se entrenó sin token `<bos>`: los documentos se empaquetan consecutivamente y terminan en `<eos>`, y el tokenizador tiene `add_bos_token: false`.

El entrenamiento se realizó sobre 10 billones de tokens con una mezcla aproximada del 80 % en inglés, código y matemáticas, y un 20 % multilingüe repartido entre las 36 lenguas objetivo. El batch global fue de 2048 con micro-batch de 4 y secuencia de 4096 tokens. El repositorio documenta la composición del dataset y el desglose de tokens por lengua en el repositorio `training-data-collection`. La rama `main` contiene el checkpoint final tras annealing (`stage2-step_1192093`); las ramas `iter_*` son checkpoints previos y las `anneal_*` corresponden a la fase de annealing. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en 36 lenguas europeas, incluidas lenguas de bajos recursos.
- Modelo base sin alineamiento: no sigue instrucciones de forma fiable sin fine-tuning previo.
- Capacidad de continuación de texto y completado de frases, validada mediante un conjunto de 144 generaciones (4 prompts canónicos localizados a 36 lenguas).
- Cobertura de código y matemáticas derivada de la mezcla de entrenamiento (~80 % inglés + código + matemáticas).
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible (requiere ajuste posterior).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Fine-tuning para atención al cliente en lenguas europeas minoritarias: el modelo sirve como base para ajustar tareas de conversación en idiomas como euskera, gaélico o maltés, donde escasean bases abiertas con cobertura nativa y contexto de 4096 tokens suficiente para diálogos multi-turno moderados.
- Investigación lingüística comparada: permite evaluar la calidad de generación en 36 lenguas con un mismo checkpoint y tokenizador, facilitando estudios de transferencia entre lenguas emparentadas (por ejemplo, esloveno/croata o noruego bokmål/nynorsk).
- Generación de código tras fine-tuning: la mezcla de entrenamiento incluye código y matemáticas, por lo que es una base razonable para ajustar tareas de autocompletado o generación de tests en pipelines internos, aunque requiere un SFT específico antes de integrarse en CI/CD.
- Entrenamiento de clasificadores y modelos de embedding derivados: al ser un base model con licencia Apache 2.0, puede usarse como inicialización para modelos de representación o reranking en dominios jurídicos o administrativos europeos.
- Destilación y experimentación académica: su tamano de 9 B y su publicación de checkpoints intermedios permiten estudiar curvas de aprendizaje y efectos del annealing sin necesidad de reproducir el entrenamiento completo.
- Desarrollo de asistentes soberanos en infraestructura europea: encaja en despliegues on-premise que exigen licencia permisiva y ausencia de dependencias de proveedores externos, con cuantización a bf16 en GPUs de 24-80 GB.
- Evaluación de sesgos y robustez multilingüe: sirve como referencia para medir cómo se comporta un modelo entrenado con una mezcla deliberadamente multilingüe frente a bases predominantemente inglesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: del orden de 9-10 GB para pesos; en 4 bits, del orden de 5-6 GB (no se publican checkpoints cuantizados oficiales, por lo que habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con batch pequeno o para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con bf16 y batch reducido, y en GPUs de 16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (carga directa con `revision` para seleccionar checkpoint), vLLM y TGI para serving en bf16; llama.cpp u Ollama requerirían conversión previa a GGUF, no publicada oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base 9B | 9,09 B dense | 4096 | Apache 2.0 | 36 lenguas europeas | Base sin instrucciones; checkpoints intermedios publicados |
| Qwen3 8B | ~8 B dense | no disponible en esta ficha | Apache 2.0 | Multilingüe amplio | Arquitectura de referencia; Prelude sigue su diseño |
| Llama 3.1 8B | 8 B dense | 128k | Llama Community License | Predominantemente inglés y multilingüe limitado | Mayor contexto, licencia con restricciones |
| Gemma 2 9B | 9 B dense | 8k | Gemma Terms of Use | Multilingüe | Requiere aceptar términos de uso |

La comparación cuantitativa de rendimiento no está disponible porque Prelude no publica resultados de benchmarks. La ventaja diferencial de Prelude frente a estas alternativas es la cobertura explícita de 36 lenguas europeas y la licencia Apache 2.0 sin cláusulas adicionales.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no debe usarse directamente como asistente conversacional sin SFT previo.
- Ventana de contexto de solo 4096 tokens, inferior a la de alternativas contemporáneas de tamano similar (8k-128k), lo que limita tareas de contexto largo.
- Riesgo de alucinación inherente a un modelo entrenado con objetivos de modelado de lenguaje; no se documentan evaluaciones de factualidad.
- Sesgos potenciales derivados de una mezcla con ~80 % de inglés, código y matemáticas; las lenguas con menor proporción de tokens pueden presentar menor calidad y mayor propensión a interferencias.
- El entrenamiento sin token `<bos>` implica que el tokenizador no lo añade; integraciones que asuman `<bos>` por defecto pueden degradar la calidad de generación.
- No se publican resultados de benchmarks, evaluaciones de seguridad ni análisis de sesgos, lo que dificulta la validación para producción.
- No se ofrecen checkpoints cuantizados oficiales; cualquier despliegue en GGUF, AWQ o GPTQ requiere conversión propia y validación.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no se ofrece garantía ni soporte por parte del consorcio.
- El repositorio tiene un tamano de 9622,2 GB debido a la acumulación de checkpoints en múltiples ramas, lo que puede complicar la descarga selectiva si no se usa `revision`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/prelude
- Repositorio del modelo base: https://huggingface.co/openeurollm/prelude-base
- Seguimiento del progreso de entrenamiento: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recolección de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Configuración del experimento `baby_9b_dense`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuración de arquitectura `qwen3_dense_9b.yaml`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
