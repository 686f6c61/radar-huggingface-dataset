# hoySky92/EXAONE-U-CURATE-Random1K-1epoch-v1

## Resumen

EXAONE-U-CURATE-Random1K-1epoch-v1 es un modelo de lenguaje generativo de texto, desarrollado por el usuario hoySky92, que consiste en un fine-tuning mediante QLoRA del modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct de LG AI Research. El objetivo del proyecto es evaluar la transferencia de conocimiento sobre un subconjunto curado de 1.000 registros de entrenamiento del dataset U-CURATE, aplicando técnicas de ajuste eficiente con cuantización de 4 bits. Se libera como un modelo fusionado completo en precisión BF16, sin necesidad de adaptadores PEFT, listo para cargar con transformers.

El modelo mantiene la arquitectura transformer del base EXAONE 3.5, con 7.818.448.896 parámetros (7,8 mil millones), y está orientado a tareas de generación de texto en coreano e inglés. Es un experimento de una sola época con pérdida final de entrenamiento de 2,7517, y no se han publicado resultados de benchmarks. Su relevancia radica en ser un ejemplo práctico de fine-tuning eficiente sobre un modelo bilingüe de tamaño medio, con una licencia de uso no comercial (EXAONE AI Model License Agreement 1.1 - NC).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en EXAONE 3.5) |
| Parametros totales | 7.818.448.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion del modelo) |
| Tipos de cuantizacion | BF16 (modelo liberado); entrenamiento con QLoRA 4-bit NF4 |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | EXAONE AI Model License Agreement 1.1 - NC (uso no comercial) |
| Formato de pesos | safetensors (8 shards) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer del modelo instructivo EXAONE 3.5 de 7,8B parámetros, desarrollado por LG AI Research. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.), pero se trata de un modelo de lenguaje autoregresivo estándar con atención completa. El fine-tuning se realizó mediante QLoRA, una técnica que combina cuantización de 4 bits (NF4) con adaptadores de bajo rango, manteniendo el cómputo en BF16. Los adaptadores LoRA se aplicaron a las proyecciones `q_proj`, `k_proj`, `v_proj` y `out_proj`, con rango 8, alpha 16 y dropout 0,05. El entrenamiento utilizó 1.000 registros del dataset U-CURATE Random1K, con una época, 125 pasos de optimización, longitud de secuencia de 2.048 tokens y tamaño de batch efectivo de 8 (micro-batch 1, acumulación de gradientes 8). Se empleó una GPU NVIDIA A40 de 48 GB. El checkpoint seleccionado fue el último (checkpoint-125) al no existir evidencia de validación independiente que justificara elegir uno anterior. El modelo resultante se fusionó con el base mediante `merge_and_unload(safe_merge=True)` y se publicó en BF16.

## Capacidades

- Generación de texto en coreano e inglés, con formato conversacional (chat) mediante plantilla de mensajes.
- Fine-tuning específico sobre el dataset U-CURATE, orientado a tareas de curación de datos y selección de muestras de entrenamiento.
- Capacidad de carga directa con transformers sin necesidad de archivos de adaptador PEFT.
- Compatibilidad con la API de generación de Transformers 5.15 (ajuste incluido en el código personalizado).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en fine-tuning eficiente: sirve como caso de estudio para analizar el impacto de QLoRA con un solo epoch y un dataset reducido sobre un modelo bilingüe de 7,8B.
- Evaluación de transferencia de conocimiento: permite comparar el comportamiento del modelo base frente a la versión fine-tuneada en tareas de generación en coreano, especialmente en dominios cubiertos por U-CURATE.
- Prototipado de asistentes conversacionales en coreano: al ser un modelo instructivo, puede usarse para generar respuestas en diálogos multi-turno, aunque con las limitaciones de un entrenamiento experimental.
- Análisis de calidad de datos: el dataset U-CURATE se centra en curación de datos; el modelo puede emplearse para estudiar cómo el fine-tuning afecta la selección de ejemplos de entrenamiento.
- Benchmarking de hardware: al ser un modelo de 7,8B en BF16, es útil para probar requisitos de memoria y rendimiento en GPUs de consumo y profesionales.
- Formación académica: adecuado para demostraciones prácticas de QLoRA, fusión de adaptadores y despliegue con transformers en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. La única métrica reportada es la pérdida de entrenamiento final (2,7517) y la verificación funcional de generación en coreano (3/3 pasadas), sin datos cuantitativos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 15,6 GB de pesos, por lo que se necesitan al menos 16-20 GB de VRAM considerando overhead de activaciones y caché KV.
- GPU recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), RTX 6000 Ada, o GPUs con 24 GB o más de VRAM. En GPUs de 16 GB (como RTX 4080) podría ejecutarse con cuantización adicional (por ejemplo, GGUF Q4) pero no se proporcionan pesos cuantizados.
- No cabe en GPUs de consumo de gama baja (8 GB o menos) sin cuantización agresiva.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (requiere conversión a GGUF), TGI (si se adapta).
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

El modelo es un fine-tuning del base EXAONE-3.5-7.8B-Instruct, por lo que la comparación más directa es con ese modelo base. También se puede comparar con otros modelos bilingües coreano-inglés de tamaño similar, aunque no hay datos de rendimiento para este release.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EXAONE-U-CURATE-Random1K (este) | 7,8B | No disponible | ko, en | EXAONE NC | safetensors BF16 |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | No disponible (base) | ko, en | EXAONE (consulta licencia) | safetensors |
| Qwen2.5-7B-Instruct (referencia) | 7,6B | 32k | multilingüe | Apache 2.0 | safetensors |
| Llama-3.1-8B-Instruct (referencia) | 8,0B | 128k | multilingüe | Llama 3.1 | safetensors |

La comparación se limita a características generales; no se dispone de resultados de benchmarks para este modelo concreto.

## Limitaciones y advertencias

- Modelo experimental: entrenado con solo 1.000 muestras y una época, no es un modelo de producción.
- No se garantiza factuality, seguridad ni rendimiento en tareas generales.
- Licencia de uso no comercial (EXAONE AI Model License Agreement 1.1 - NC); restringe el uso comercial y requiere cumplir con los términos de la licencia del modelo base.
- Riesgo de alucinaciones y errores de razonamiento, especialmente en dominios fuera del dataset de entrenamiento.
- Sesgos potenciales derivados del dataset U-CURATE y del modelo base, no evaluados en esta release.
- La verificación de fidelidad numérica entre el adaptador y el modelo fusionado no superó el umbral pre-registrado (cosine 0,9998158 vs 0,9999; L2 relativo 0,0428 vs 0,02), aunque la coincidencia de tokens y secuencias greedy fue correcta.
- El código de modelado personalizado incluye un ajuste para la API de generación de Transformers 5.15, lo que puede requerir versiones específicas de la librería.
- No se proporcionan pesos cuantizados para inferencia en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoySky92/EXAONE-U-CURATE-Random1K-1epoch-v1
- Repositorio oficial de EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Repositorio oficial de EXAONE 4.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-4.5
- Datasets del autor: https://huggingface.co/hoySky92/datasets
- Modelo relacionado del autor (HyperCLOVA-X-U-CURATE-Random-v0.1): https://huggingface.co/hoySky92/HyperCLOVA-X-U-CURATE-Random-v0.1
