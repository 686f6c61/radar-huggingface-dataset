# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p50

## Resumen

`Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p50` es una versión comprimida de `mistralai/Mistral-7B-Instruct-v0.2` obtenida aplicando el método completo SVD-LLM con el código de los autores (repositorio AIoT-MLSys-Lab/SVD-LLM, commit `7538cca98880`). La compresión elimina el 50 % de los parámetros (fracción retenida real de 0,4997) mediante truncación de rango bajo sobre las matrices de atención, seguida de ajuste con adaptadores LoRA y plegado final a un checkpoint denso con las formas originales de Mistral (`W = U @ V`).

El modelo mantiene la arquitectura transformer decoder-only densa de Mistral-7B-Instruct-v0.2, con 7.241.732.096 parámetros, y es relevante porque sirve como artefacto de investigación para estudiar cómo afecta una compresión agresiva al comportamiento de seguridad y a la utilidad general de un modelo instruido. No se distribuye como modelo "más pequeño": es un modelo rank-deficient que ocupa el mismo espacio en disco (14,5 GB) y se carga con `transformers` estándar sin código de modelado personalizado.

El autor advierte explícitamente en la model card de que la compresión a este ratio puede degradar la calidad de generación y que las métricas de seguridad de un modelo potencialmente degenerado no deben interpretarse como evidencia sobre alineación. El repositorio tiene un uso muy limitado (12 descargas, 0 likes) y no se ha publicado información adicional en la búsqueda web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral), comprimido con SVD-LLM de rango bajo y plegado a formas densas |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors densos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2: un transformer decoder-only denso con atención de consultas agrupadas (GQA) y ventana de contexto deslizante. Sobre ese modelo base se aplica el pipeline de SVD-LLM en varias fases: blanqueamiento de datos (data whitening), truncación SVD, LoRA sobre los factores U, merge, LoRA sobre los factores V, merge y plegado final a un checkpoint denso. El blanqueamiento se calibra con 256 secuencias de WikiText-2 de 2048 tokens (seed 3). El ajuste LoRA usa r=8, 2 épocas por factor, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`.

La innovación técnica relevante es el parche aplicado al código upstream: `SVD_MistralAttention` dimensiona k/v según `num_key_value_heads`, pero calculaba su rango con la fórmula de matriz cuadrada `int(hidden * ratio / 2)`, compartida con q y o. Para una matriz k/v de (1024 x 4096), `whitening()` produce `int(kv*hidden*r / (kv+hidden))`, de modo que los pesos eran correctos pero `nn.Linear.in_features` quedaba desactualizado y PEFT construía los adaptadores LoRA sobre esa dimensión errónea, provocando el fallo de la fase LoRA. El fichero `component/svd_mistral.py` se parcheó para declarar el rango que `whitening()` realmente escribe (sha256 `b8c277613b72`), además de un recorte de máscara causal para transformers >= 4.43. La aritmética de truncación no se modificó: `whitening()` deriva todos los factores de las formas reales del peso. No se documenta RLHF ni DPO adicionales más allá del ajuste LoRA descrito.

## Capacidades

- Generación de texto e instrucciones generales en el estilo del modelo base Mistral-7B-Instruct-v0.2.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (evaluado en ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA).
- Capacidad matemática básica (MathQA), con rendimiento notablemente reducido (0,2519 acc_norm).
- Soporte de plantilla de chat conversacional (todas las evaluaciones usan el chat template con decodificación greedy).
- Capacidad de seguir instrucciones, aunque degradada por la compresión al 50 %.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en compresión de modelos: reproducir el pipeline completo de SVD-LLM (blanqueamiento, truncación SVD, LoRA sobre U y V, plegado) y comparar la fracción de parámetros retenida con la pérdida de utilidad.
- Evaluación de alineación y seguridad: medir la tasa de éxito de ataque (ASR) con AdvBench y StrongREJECT usando el juez `cais/HarmBench-Llama-2-13b-cls`, tal como hace la model card.
- Estudio de over-refusal: cuantificar el exceso de rechazo sobre XSTest-safe y OR-Bench-Hard-1K con el juez `allenai/wildguard`, útil para analizar cómo la compresión altera el equilibrio entre seguridad y utilidad.
- Baseline en experimentos de pruning y cuantización: al plegarse a formas densas de Mistral, sirve como punto de comparación frente a otros métodos de compresión con el mismo modelo base.
- Despliegue en entornos de VRAM limitada tras cuantización: al ser un Mistral denso estándar, puede convertirse a GGUF/AWQ/GPTQ para ejecutarse en GPUs de 8-12 GB, siempre que se acepte la pérdida de calidad.
- Prototipado de asistentes conversacionales en inglés: con plantilla de chat y contexto de 32.768 tokens, puede gestionar diálogos multi-turno, aunque el autor advierte de posible degeneración de la generación.
- Fine-tuning adicional para dominios concretos: admite ajuste con PEFT/LoRA sobre el checkpoint denso, útil para estudiar si el ajuste recupera calidad perdida por la truncación.
- Auditoría metodológica: documentar la corrección del bug de dimensión de rango en `SVD_MistralAttention` como caso de estudio de compatibilidad entre SVD-LLM y PEFT.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (todas las generaciones con chat template y decodificación greedy):

| Metrica | Valor |
|---|---:|
| Fracción de parámetros retenida | 0,4997 |
| WikiText-2 (perplejidad) | 12,7843 |
| ARC-Easy (acc_norm) | 0,5631 |
| ARC-Challenge (acc_norm) | 0,3456 |
| HellaSwag (acc_norm) | 0,5161 |
| WinoGrande (acc) | 0,6006 |
| OpenBookQA (acc_norm) | 0,3520 |
| PIQA (acc_norm) | 0,6529 |
| MathQA (acc_norm) | 0,2519 |
| AdvBench HarmBench ASR | 0,6519 |
| StrongREJECT HarmBench ASR | 0,6134 |
| Over-refusal XSTest-safe | 0,0810 |
| Over-refusal OR-Bench-Hard-1K | 0,0254 |
| Over-refusal macro | 0,0532 |

La model card indica que el juicio de over-refusal es fiable para esta celda (fracción puntuada 0,99 en XSTest-safe y 0,98 en OR-Bench-Hard-1K). Los ficheros de salidas por prompt y métricas en bruto están en los directorios `utility/` y `safety/` del repositorio. No se proporcionan resultados comparativos con el modelo base ni con otras alternativas.

## Requisitos de hardware

- VRAM en fp16: el checkpoint pesa 14,5 GB, por lo que se necesitan al menos 16 GB de VRAM para inferencia (más margen para caché KV y overhead del runtime).
- VRAM en 8 bits: aproximadamente 7-8 GB de pesos, más caché.
- VRAM en 4 bits: aproximadamente 4 GB de pesos, más caché (requiere convertir el checkpoint denso a GGUF/AWQ/GPTQ, no se distribuyen versiones cuantizadas).
- GPU de datacenter: A100 (40/80 GB), H100 y L40S pueden ejecutar el modelo en fp16 con holgura.
- GPU consumer: cabe en fp16 en RTX 4090 (24 GB) y RTX 3090 (24 GB); en RTX 4080/4070 Ti SUPER (16 GB) queda muy ajustado; en tarjetas de 8-12 GB solo con cuantización a 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo al ser un checkpoint denso), vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponible. El autor advierte que el modelo es rank-deficient, no más pequeño en disco, por lo que no cabe esperar una reducción directa de memoria de pesos ni una aceleración intrínseca frente al modelo base sin cuantización adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento frente a este modelo |
|---|---|---|---|---|---|
| Este modelo (SVD-LLM keep 0,50) | 7,24 B (retenido 0,4997) | 32.768 tokens | Apache 2.0 | safetensors | Referencia: los valores de la tabla de benchmarks |
| mistralai/Mistral-7B-Instruct-v0.2 (base) | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors | no disponible en la información proporcionada |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors | no disponible en la información proporcionada |
| Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Licencia comunitaria Llama 3.1 | safetensors | no disponible en la información proporcionada |

No se han publicado en la información disponible resultados de benchmarks de los modelos alternativos que permitan una comparación numérica directa.

## Limitaciones y advertencias

- La compresión al 50 % puede degradar la calidad de generación; el propio autor lo señala como caveat principal.
- Las métricas de seguridad pueden ser engañosas: la model card advierte que los números de seguridad de un modelo degenerado no son evidencia sobre alineación, y que deben leerse junto a las columnas de over-refusal y seguimiento de instrucciones antes de extraer conclusiones de comportamiento.
- El ASR reportado es alto (AdvBench 0,6519 y StrongREJECT 0,6134), lo que indica una alineación de seguridad debilitada respecto al modelo base, aunque no se dispone de la cifra del base para cuantificar la diferencia.
- Riesgo de alucinación: no se documenta explícitamente, pero es esperable en un modelo de 7 B con compresión agresiva y ajuste LoRA sobre `alpaca-cleaned`.
- El ajuste se realizó sobre `yahma/alpaca-cleaned`, predominantemente en inglés; el rendimiento en otros idiomas no está documentado (idiomas soportados: no disponible).
- El modelo es rank-deficient pero ocupa el mismo espacio en disco que el base (14,5 GB); no debe presentarse como una optimización de almacenamiento.
- No se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ); cualquier despliegue ligero requiere conversión propia y validación posterior.
- Licencia Apache 2.0, por lo que el uso comercial está permitido, pero el autor no ofrece garantías de calidad y la naturaleza experimental del artefacto desaconseja su uso directo en producción sin evaluación previa.
- Uso muy bajo y sin validación comunitaria (12 descargas, 0 likes), lo que reduce la evidencia independiente sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p50
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Código de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM (commit `7538cca98880`)
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de seguridad HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de over-refusal: https://huggingface.co/allenai/wildguard
- Dataset de calibración (WikiText-2): https://huggingface.co/datasets/wikitext
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados devueltos no guardan relación con el modelo.
