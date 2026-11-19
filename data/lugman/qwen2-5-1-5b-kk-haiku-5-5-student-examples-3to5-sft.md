# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Student-Examples-3to5-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Student-Examples-3to5-SFT` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario lugman. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El entrenamiento se realizó con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido".

El nombre del modelo sugiere un ajuste orientado a la generación de haikus (posiblemente en el contexto de japonés, indicado por "KK" y "Haiku"), con ejemplos de estudiante y un rango de "3to5". Sin embargo, la model card no proporciona detalles sobre el dataset de entrenamiento, la composición de los datos ni la metodología específica. El modelo se distribuye bajo licencia Apache 2.0 y declara soporte únicamente para inglés, aunque el modelo base Qwen2.5-Instruct es multilingüe.

La relevancia de este modelo es limitada: se trata de un ajuste fino de nicho, sin descargas ni interacciones en el momento de la consulta, y sin documentación técnica detallada. Es útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre un modelo pequeño, pero no dispone de benchmarks publicados ni de una model card completa que permita evaluar su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, atención causal) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision completa; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base `unsloth/Qwen2.5-1.5B-Instruct` es un modelo ajustado con instrucciones del que no se detallan aquí los datos de preentrenamiento (el modelo original Qwen2.5 se entrenó con 18 billones de tokens segun la documentacion de Qwen, pero este dato no aparece en la informacion proporcionada).

El ajuste fino se realizó con Unsloth y TRL, según indica la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicó RLHF/DPO o técnicas de decodificación especulativa. El nombre del modelo sugiere un SFT sobre ejemplos de estudiante en un rango de 3 a 5, pero no hay documentación que lo confirme. No se dispone de información sobre hiperparámetros, epochs ni tamaño del dataset.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones (el modelo base está ajustado con instrucciones).
- Generación de código y matemáticas a nivel básico, limitado por el tamaño de 1,5 B de parámetros.
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Qwen2.5-Instruct sí lo soporta, pero este ajuste fino no lo documenta.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base es multilingüe.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Generación de haikus: el nombre del modelo sugiere un ajuste específico para este dominio, pero no hay ejemplos ni documentación que lo verifiquen.

## Casos de uso

- Generación creativa de haikus y poesía breve: el nombre del modelo indica un ajuste específico para este género; podría usarse para generar composiciones de 3 a 5 versos, aunque no hay ejemplos publicados que confirmen la calidad.
- Prototipado de ajuste fino con Unsloth: sirve como ejemplo reproducible de un pipeline SFT sobre Qwen2.5-1.5B, útil para desarrolladores que quieran replicar el flujo con TRL.
- Experimentación académica con modelos pequeños: al ser un modelo de 1,5 B con licencia Apache 2.0, es adecuado para pruebas de concepto en entornos con recursos limitados.
- Generación de texto conversacional en inglés: puede emplearse en chatbots ligeros o asistentes de bajo coste, aunque sin benchmarks que avalen su calidad frente al modelo base.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para nuevos ajustes en dominios específicos.
- Evaluación comparativa de técnicas de SFT: útil para investigadores que quieran medir el impacto de un ajuste fino pequeño sobre un modelo base conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,543 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización 8 bits: ~1,6 GB para pesos; en 4 bits: ~0,8 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo en fp16 con contextos cortos; para contextos largos se recomienda 12 GB o más (RTX 4070 Ti, RTX 4080).
- GPU profesionales: A100, H100 o L40S para despliegues con alta concurrencia o contextos de 32k tokens.
- Cabe en GPU consumer: sí, en la mayoría de GPU con 8 GB o más en fp16, y en GPU con 4-6 GB usando cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo), Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5 B, se espera una latencia baja (decenas de milisegundos por token en GPU consumer), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Student-Examples-3to5-SFT | 1,5 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino de nicho, sin benchmarks |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base con benchmarks publicados por Qwen |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (segun documentacion de Hugging Face) | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens (segun documentacion de Meta) | Llama 3.2 Community License | Hugging Face | Requiere aceptar licencia; buenos resultados en razonamiento basico |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5, puede heredar sesgos del preentrenamiento original, pero no hay evaluación específica.
- Riesgo de alucinación: alto en modelos de 1,5 B, especialmente en tareas de razonamiento complejo o datos factuales; no hay evaluación publicada.
- Limitaciones de contexto o idioma: la model card declara únicamente inglés; el contexto máximo no se especifica en la información proporcionada (el modelo base soporta 32k, pero el ajuste fino podría haberlo modificado).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de licencia y se indiquen los cambios.
- Caveats para producción: sin benchmarks, sin model card detallada, sin ejemplos de uso y con 0 descargas, no se recomienda su uso en producción sin una evaluación previa exhaustiva. El nombre del modelo sugiere un ajuste muy específico (haikus) que podría degradar el rendimiento general del modelo base en otras tareas.
- El repositorio ocupa 9,3 GB, lo que sugiere que puede contener múltiples checkpoints o pesos en precisión completa; conviene revisar los archivos antes de descargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Student-Examples-3to5-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
