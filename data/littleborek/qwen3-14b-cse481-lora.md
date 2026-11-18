# littleborek/qwen3-14b-cse481-lora

## Resumen

El modelo `littleborek/qwen3-14b-cse481-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario littleborek sobre el modelo base Qwen2.5-14B-Instruct. A pesar del nombre comercial "Qwen3-14B", la model card y los metadatos de Hugging Face confirman que el modelo base real es Qwen/Qwen2.5-14B-Instruct, un transformer denso de 14.000 millones de parámetros desarrollado por Alibaba Qwen.

El adaptador está especializado en análisis financiero de estados contables y memorias anuales de empresas cotizadas en la Bolsa de Estambul (BIST), así como en conceptos de ingeniería económica (proyecto académico CSE-481). El entrenamiento se realizó con QLoRA (cuantización NF4 de doble cuantización) sobre una única GPU de consumo, una NVIDIA RTX 5060 Ti de 16 GB, empleando Unsloth y SFTTrainer de Hugging Face.

La relevancia del modelo es limitada: se trata de un artefacto académico con cero descargas y cero likes en el momento de la consulta, entrenado durante solo 64 pasos sobre un conjunto de datos no documentado públicamente. Su interés radica en servir como ejemplo reproducible de ajuste fino eficiente en GPUs de consumo y en su enfoque en la evaluación estructurada (validez JSON, esquema, evidencia y enrutamiento de herramientas) sobre datos financieros turcos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con adaptador LoRA sobre módulos de atención y MLP |
| Parametros totales | 14.000 millones (modelo base Qwen2.5-14B); adaptador LoRA con rank 16 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos, ampliable a 131.072 mediante YaRN; no confirmado para este adaptador) |
| Tipos de cuantizacion | Entrenamiento en NF4 con doble cuantización (QLoRA); el adaptador se distribuye en safetensors BF16. Para inferencia se puede cuantizar el modelo base en 4/8 bits o GGUF |
| Idiomas soportados | No disponibles oficialmente; la model card está en turco y los datos de entrenamiento parecen centrados en turco financiero, pero el modelo base Qwen2.5 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención causal estándar, RoPE, normalización RMSNorm y activación SwiGLU. El adaptador LoRA se inserta en los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rank r=16, alpha=32, dropout 0,05 y sin bias. El entrenamiento emplea QLoRA con cuantización NF4 de doble cuantización y precisión de cómputo BF16, orquestado con Unsloth y SFTTrainer/PEFT 0.19.1.

El entrenamiento se ejecutó en una NVIDIA RTX 5060 Ti de 16 GB GDDR7 bajo WSL2 Ubuntu 22.04 con CUDA 13.0, durante 64 pasos con acumulación de gradiente 8 (batch efectivo 8). La pérdida de validación reportada es 0,0000524 y la perplejidad 1,000052, valores anómalamente bajos que sugieren sobreajuste severo o una fuga de datos en el conjunto de validación, dado el escaso número de pasos y el tamaño reducido del conjunto de evaluación (18 casos). No se documenta el volumen ni la composición del corpus de entrenamiento, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y respuestas conversacionales multi-turno heredadas del modelo base Qwen2.5-14B-Instruct.
- Análisis de estados financieros y memorias anuales de empresas cotizadas en BIST (margen EBITDA, beneficio neto, variaciones interanuales).
- Razonamiento sobre conceptos de ingeniería económica (valor actual neto, TIR, amortización, análisis coste-beneficio) en el contexto del curso CSE-481.
- Producción de salidas estructuradas en JSON con validación de esquema (100 % de validez JSON y de esquema en los 18 casos de prueba reportados).
- Enrutamiento de herramientas (tool routing) con esquema de ruta, aunque con rendimiento bajo (1/4 rutas correctas frente a 0/4 del modelo base).
- Capacidad de rechazo controlado ante consultas fuera de dominio (4/4 rechazos correctos).
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente en el adaptador).
- Capacidades multilingües del modelo base Qwen2.5 (chino, inglés, español, etc.), si bien el ajuste fino está orientado al turco.

## Casos de uso

- Análisis automatizado de informes trimestrales de empresas del BIST: el adaptador puede resumir variaciones de EBITDA y margen neto a partir de memorias financieras en turco, devolviendo JSON estructurado con evidencia citada.
- Extracción de métricas financieras a pipelines de datos: dada su alta validez de esquema JSON (18/18), puede integrarse como extractor de campos (ingresos, costes, deuda) desde texto libre hacia bases de datos relacionales.
- Asistente académico para ingeniería económica: resolución guiada de ejercicios de VAN, TIR y payback en el contexto del curso CSE-481, con explicaciones paso a paso.
- Enrutamiento de consultas financieras hacia herramientas externas: a pesar de su baja precisión en rutas (25 %), puede servir como base para experimentos de tool routing con ajuste adicional o few-shot prompting.
- Filtrado y rechazo de consultas fuera de dominio: su tasa de rechazo correcto (4/4) permite usarlo como primera capa de triaje en un chatbot financiero, derivando consultas no relacionadas a otros sistemas.
- Prototipado de asistentes financieros en turco sobre hardware de consumo: al ser un adaptador LoRA de 0,3 GB, se puede cargar junto al modelo base cuantizado en una única GPU de 16 GB, facilitando experimentación de bajo coste.
- Investigación reproducible en QLoRA: sirve como referencia metodológica para entrenar adaptadores especializados en dominios verticales con Unsloth y PEFT en GPUs de gama consumer.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 18 casos held-out y 4 escenarios de enrutamiento de herramientas, comparando modelo base frente a adaptador:

| Metrica | Modelo base (Qwen2.5-14B-Instruct) | Adaptador LoRA (CSE-481) |
|---|---|---|
| Validez JSON | 18/18 (100 %) | 18/18 (100 %) |
| Validez de esquema | 18/18 (100 %) | 18/18 (100 %) |
| Respuesta correcta | 14/18 (77,8 %) | 14/18 (77,8 %) |
| Coincidencia exacta de evidencia | 16/18 (88,9 %) | 16/18 (88,9 %) |
| Estado correcto | 15/18 (83,3 %) | 16/18 (88,9 %) |
| Contexto de herramienta | 18/18 (100 %) | 18/18 (100 %) |
| Rechazo correcto | 4/4 (100 %) | 4/4 (100 %) |
| Esquema de ruta correcto | 0/4 (0 %) | 1/4 (25 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las mejoras del adaptador frente al modelo base son marginales (un caso en estado correcto y un caso en esquema de ruta), lo que sugiere un ajuste fino de bajo impacto.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en BF16: aproximadamente 28 GB (14.000 millones de parámetros × 2 bytes), más overhead del adaptador (0,3 GB).
- VRAM estimada en cuantización 8 bits: aproximadamente 15-16 GB; en 4 bits (NF4/GPTQ/AWQ): aproximadamente 8-9 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para BF16 sin cuantizar; RTX 4090 (24 GB) para 8 bits; RTX 4060 Ti 16 GB, RTX 5060 Ti 16 GB o RTX 3090 para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización 4 bits en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 5060 Ti 16 GB). El autor entrenó el adaptador en una RTX 5060 Ti 16 GB.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| littleborek/qwen3-14b-cse481-lora | 14B (base) + LoRA r=16 | No disponible (base: 32K nativos) | Finanzas BIST / ingeniería económica (turco) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-14B-Instruct | 14B | 32.768 tokens (131.072 con YaRN) | Propósito general, multilingüe | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens (131.072 con YaRN) | Propósito general, multilingüe | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Propósito general, multilingüe | Llama 3.1 Community License | Hugging Face |

El adaptador no aporta ventajas medibles frente a su propio modelo base en las métricas publicadas, por lo que su valor comparativo reside únicamente en la especialización temática y en el formato de salida estructurado.

## Limitaciones y advertencias

- El nombre del repositorio menciona "Qwen3-14B", pero el modelo base real es Qwen2.5-14B-Instruct; esta discrepancia puede provocar errores de carga si se asume Qwen3.
- El adaptador se entrenó durante solo 64 pasos con batch efectivo 8, lo que equivale a unas 512 muestras procesadas; es insuficiente para un ajuste fino robusto.
- La pérdida de validación (0,0000524) y la perplejidad (1,000052) son anómalamente bajas y sugieren sobreajuste o fuga de datos; no deben interpretarse como indicadores de calidad general.
- El conjunto de evaluación es de solo 18 casos y 4 escenarios de enrutamiento, sin significación estadística.
- El rendimiento en enrutamiento de herramientas es bajo (25 % de esquema de ruta correcto), lo que desaconseja su uso en producción para agentes.
- No se documenta la composición del corpus de entrenamiento, lo que impide evaluar sesgos, cobertura lingüística o posibles infracciones de derechos.
- El ajuste está orientado al turco financiero; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación en cifras financieras: el adaptador puede generar datos numéricos plausibles pero incorrectos; requiere verificación contra fuentes primarias.
- Aunque la licencia es Apache 2.0, el uso comercial en producción no está validado por el autor y carece de garantías.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/littleborek/qwen3-14b-cse481-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
