# PureTensorAI/Jais-3-0.9B-NVFP4A16

## Resumen

Jais-3-0.9B NVFP4A16 es una versión cuantizada a 4 bits del modelo Jais-3-0.9B, el miembro más pequeño de la familia Jais-3 de Inception (G42), especializada en árabe e inglés. PureTensorAI ha generado esta release a partir de los pesos oficiales en BF16 aplicando GPTQ con una modificación específica en las estadísticas de calibración. El resultado es un checkpoint de 0,89 GB (frente a 2,16 GB en BF16) que mantiene las activaciones en 16 bits (esquema W4A16) y es compatible con vLLM a través de compressed-tensors.

El modelo base es un transformer denso de aproximadamente 1.078 millones de parámetros (1,08 B), diseñado para generación de texto conversacional y con soporte nativo de un campo de razonamiento (`reasoning_content`) en los turnos del asistente. Esta cuantización es relevante porque demuestra que es posible comprimir un modelo pequeño y sensible a la cuantización sin la degradación severa (11-25 puntos en MMLU) que producen las recetas GPTQ estándar, gracias a un tratamiento específico del token inicial que domina las estadísticas de calibración.

La ficha se centra en las características de esta release cuantizada; los datos de entrenamiento, arquitectura interna detallada y benchmarks del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (28 bloques), `k2_horizon`, código personalizado (`custom_code`) |
| Parametros totales | 1.078.285.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): valores 4-bit E2M1, una escala FP8 E4M3 por grupo de 16, una escala FP32 por tensor; GPTQ con `block_size` 128, `dampening_frac` 0.01, `actorder` estático; embeddings, cabeza de salida, normas y activaciones en BF16 |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors `nvfp4-pack-quantized`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 28 bloques con capas `Linear` cuantizadas en esta release; los embeddings de tokens, la cabeza de salida, todas las normas y las activaciones permanecen en BF16. La cuantización se realizó con GPTQ sobre 2.048 muestras de calibración de hasta 2.048 tokens: 1.024 pares instrucción-respuesta en árabe (primeras filas de `arbml/CIDAR`) y 1.024 de `mlabonne/open-perfectblend`. La mitad de las filas se presentaron como texto plano sin plantilla de chat ni token de inicio de texto, y la otra mitad con formato de chat. Las herramientas empleadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1.

La innovación técnica principal es el "cap" en las estadísticas de calibración de GPTQ: durante la acumulación de estadísticas por capa, cualquier token cuya norma de entrada supere 4 veces la norma mediana de su secuencia se escala hasta ese límite. Esto corrige el problema de que, en este modelo, un único token en la primera posición (bloque 1 si el prompt empieza con el token de inicio de texto, bloque 3 si no) concentra más del 99,9% de las estadísticas de una capa MLP temprana, lo que arruina la receta GPTQ estándar. El cap solo afecta a las estadísticas, no al cómputo del modelo durante la calibración ni a la inferencia. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Soporte de un campo de razonamiento (`reasoning_content`) en los turnos del asistente, según la plantilla de chat del modelo base.
- Razonamiento de sentido común y conocimiento general (evaluado en MMLU y ArabicMMLU).
- Razonamiento matemático de nivel escolar (evaluado en GSM8K).
- Capacidad multilingüe limitada a árabe e inglés.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio u otras capacidades especiales.

## Casos de uso

- Despliegue en entornos con VRAM limitada: con 0,89 GB de pesos en 4 bits, el modelo cabe en GPUs de consumo con 8 GB o menos, lo que permite ejecutar un modelo bilingüe árabe-inglés en hardware modesto.
- Prototipado de asistentes conversacionales en árabe: la cuantización preserva 44,92 de precisión en ArabicMMLU (frente a 47,00 en BF16), suficiente para tareas de comprensión y respuesta en árabe en fase de desarrollo.
- Evaluación comparativa de técnicas de cuantización: el checkpoint sirve como referencia reproducible de una receta GPTQ con cap de estadísticas, útil para investigadores que estudien la sensibilidad de modelos pequeños a la cuantización de 4 bits.
- Inferencia de alto rendimiento con vLLM: el formato compressed-tensors `nvfp4-pack-quantized` es compatible con vLLM, lo que permite servir el modelo con throughput elevado en GPUs con soporte de FP4.
- Generación de texto en pipelines de CI/CD para pruebas: el tamaño reducido del repo (0,9 GB) facilita su descarga y uso en entornos de integración continua donde no se dispone de GPUs de gran capacidad.
- Tareas de razonamiento matemático básico en inglés: con 42,46 de exact match en GSM8K, puede emplearse en asistentes educativos de aritmética escolar, asumiendo la pérdida de 3 puntos respecto a BF16.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness 0.4.13 (configuraciones por defecto de `arabicmmlu`, `mmlu` y `gsm8k`, sin plantilla de chat, GSM8K con flexible-extract), comparando BF16 frente a este checkpoint:

| Benchmark | BF16 | Este checkpoint | Cambio |
|---|---:|---:|---:|
| ArabicMMLU (14.455 preguntas, accuracy) | 47,00 | 44,92 | -2,08 |
| GSM8K (1.319 problemas, exact match) | 45,49 | 42,46 | -3,03 |
| MMLU (14.042 preguntas, accuracy) | 47,24 | 44,74 | -2,50 |
| WikiText-2 (perplejidad, 131.072 tokens) | 15,37 | 16,08 | +0,71 |

Divergencia KL frente a BF16 (teacher-forced, ventanas de 1.024 tokens):

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (inglés) | 131.072 | 0,079 | 0,60 | 85,8% |
| Chat (`HuggingFaceH4/ultrachat_200k`, test_sft, inglés) | 243.954 | 0,070 | 0,62 | 88,0% |
| Árabe (`arbml/CIDAR`, 256 pares) | 72.413 | 0,101 | 0,93 | 84,2% |
| WikiText-2 sin token de inicio de texto | 130.944 | 0,083 | 0,68 | 85,4% |

Comparación de recetas de cuantización sobre el mismo modelo:

| Calibración | MMLU | ArabicMMLU | GSM8K | KL sin token de inicio |
|---|---:|---:|---:|---:|
| BF16 referencia | 47,24 | 47,00 | 45,49 | 0 |
| GPTQ estándar, todo con plantilla de chat | 23,74 | 30,80 | 0,08 | 2,07 |
| GPTQ estándar, mitad texto plano | 33,88 | 36,01 | 20,92 | 0,136 |
| Round-to-nearest, sin calibración | 43,63 | 40,97 | 31,99 | 0,141 |
| Estadísticas con cap, mitad texto plano (este checkpoint) | 44,74 | 44,92 | 42,46 | 0,083 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB para los pesos en 4 bits, más overhead de activaciones, caché KV y runtime; en la práctica, menos de 4 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con soporte de FP4 (Blackwell, como B200) para aprovechar el esquema NVFP4; en GPUs Ampere/Ada (A100, H100, RTX 4090) el formato puede ejecutarse con vLLM, aunque sin las ventajas nativas de FP4.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, etc.), dado el tamaño reducido de los pesos.
- Opciones de despliegue: transformers (con `custom_code` y compressed-tensors), vLLM (soporte de `nvfp4-pack-quantized`). No se indica compatibilidad con llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jais-3-0.9B NVFP4A16 (este) | 1,08 B | No disponible | Apache 2.0 | Safetensors 4-bit (NVFP4A16) | Cuantización GPTQ con cap; árabe e inglés |
| inception42/Jais-3-0.9B (base) | 1,08 B | No disponible | Apache 2.0 | Safetensors BF16 | Referencia de calidad: MMLU 47,24, ArabicMMLU 47,00, GSM8K 45,49 |
| Alternativas de 1 B en árabe/inglés | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks comparables en la información proporcionada |

## Limitaciones y advertencias

- Pérdida de calidad medible frente a BF16: -2,50 puntos en MMLU, -2,08 en ArabicMMLU y -3,03 en GSM8K; la perplejidad en WikiText-2 sube de 15,37 a 16,08.
- La receta estándar de GPTQ falla catastróficamente en este modelo (MMLU 23,74 y GSM8K 0,08 con calibración solo de chat); esta release depende del cap en las estadísticas, que no está registrado en `recipe.yaml` y requiere un wrapper sobre el hook de calibración de llm-compressor.
- El tokenizador del modelo no añade el token de inicio de texto, lo que crea dos regímenes de comportamiento (con y sin ese token) que afectan a la calibración y a la evaluación; los benchmarks estándar se ejecutan sin él.
- Las métricas de KL en árabe y chat pueden estar infladas favorablemente porque comparten familia de dataset con la calibración (aunque con filas distintas).
- Es una release de prueba, no afiliada ni respaldada por los autores del modelo base.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada, pero son inherentes a un modelo de 1 B de parámetros.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base (`inception42/Jais-3-0.9B`).
- Idiomas limitados a árabe e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Longitud de contexto no disponible; no debe asumirse una ventana larga.

## Enlaces

- Hugging Face: https://huggingface.co/PureTensorAI/Jais-3-0.9B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-0.9B
- Paper Jais-3 (arXiv:2506.07900): https://arxiv.org/abs/2506.07900
- Paper GPTQ (arXiv:2402.17762): https://arxiv.org/abs/2402.17762
- Dataset de calibración árabe `arbml/CIDAR`: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibración `mlabonne/open-perfectblend`: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat `HuggingFaceH4/ultrachat_200k`: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
