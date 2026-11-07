# Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr1e-6-seed42-20261021

## Resumen

`exaone-luna-medium-fullft-sft-r20-e15-lr1e-6-seed42-20261021` es un ajuste fino supervisado (SFT) completo del modelo `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, publicado por el usuario de Hugging Face Jongbin-kr. Se trata de un experimento de investigación sobre el dataset `VeriReason-Luna-Medium-16K`, orientado a reforzar capacidades de razonamiento verificable, no de un modelo de propósito general nuevo. El nombre codifica la configuración exacta del entrenamiento: 20 % del dataset, 15 épocas, learning rate de 1e-6 y semilla 42.

El modelo conserva la arquitectura y el tamaño del EXAONE 3.5 7.8B Instruct original, con 7.818.448.896 parámetros en pesos safetensors. El repositorio ocupa 187,6 GB, un tamaño desproporcionado respecto a los pesos del modelo, lo que sugiere que el autor ha subido múltiples checkpoints intermedios (uno cada 0,2 épocas) junto con el modelo final seleccionado por pérdida de validación.

Su relevancia es acotada: es un artefacto de ablación que documenta una configuración concreta de SFT sobre un dataset de razonamiento, útil para reproducibilidad y para estudiar el efecto de hiperparámetros (ratio de datos, épocas, learning rate) en el ajuste fino de EXAONE. La model card no aporta datos de evaluación, licencia ni idiomas, y el pipeline no está declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EXAONE 3.5 7.8B Instruct) |
| Parametros totales | 7.818.448.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`; tokenizer y metadatos incluidos) |

## Arquitectura y entrenamiento

El modelo parte de `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` (revision `553ea250b9a5317231459279d5847d6cf955b9aa`) y aplica un ajuste fino completo (full fine-tuning, no LoRA ni adaptadores) sobre el dataset `DanielJeongsooLee/VeriReason-Luna-Medium-16K` (revision `f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e`). La configuración registrada es: `stage=sft`, ratio de entrenamiento del 20 %, 15 épocas, learning rate 1e-6, semilla de selección y entrenamiento 42. El entrenamiento se detuvo en el step 902, equivalente a 2,802488 épocas de progreso real sobre el subconjunto utilizado.

El checkpoint publicado como modelo principal es el mejor seleccionado por pérdida de validación (`checkpoint-902`), con `best loss = 0,41970309615135193`. El autor guarda un checkpoint separado cada 0,2 épocas, cada uno con su propio commit en el Hub; los archivos subidos contienen modelo, tokenizer y metadatos, mientras que el estado del optimizador se conserva localmente para reanudar el entrenamiento. No se documentan detalles sobre composición del dataset, tokens totales vistos, uso de RLHF/DPO ni innovaciones arquitectónicas: al ser un SFT completo sobre un modelo existente, la arquitectura subyacente es la del EXAONE 3.5 7.8B Instruct sin modificaciones estructurales conocidas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del EXAONE 3.5 7.8B Instruct, reforzadas mediante SFT sobre un dataset orientado a razonamiento verificable (`verireason`).
- Razonamiento multi-paso: el dataset de entrenamiento (VeriReason-Luna-Medium-16K) está diseñado para tareas de razonamiento con verificación, por lo que se espera mejora en cadenas de razonamiento estructuradas.
- Generación de código y matemáticas: capacidades presumibles del modelo base, no evaluadas ni documentadas en esta ficha.
- Tool calling / function calling: no documentado en la información disponible; el modelo base EXAONE 3.5 Instruct lo soporta según su propia documentación, pero no se confirma para este ajuste.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no documentadas; el modelo base soporta coreano e inglés, pero no se confirma el comportamiento tras el ajuste.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en ajuste fino supervisado: el modelo sirve como punto de comparación reproducible para estudiar el efecto del ratio de datos (20 %), las épocas (15) y el learning rate (1e-6) sobre EXAONE 3.5 7.8B. El nombre del repositorio permite emparejarlo con las variantes `lr5e-6` y `r100-e5-lr2e-5` del mismo autor.
- Ablación de hiperparámetros de SFT: al existir checkpoints cada 0,2 épocas, se puede analizar la curva de pérdida de validación y el sobreajuste a lo largo del entrenamiento (hasta 2,8 épocas efectivas).
- Reproducción de experimentos de razonamiento verificable: útil para replicar el pipeline sobre VeriReason-Luna-Medium-16K y comparar con otros ajustes del mismo dataset.
- Generación de razonamiento con verificación en dominios acotados: si el dataset de entrenamiento cubre tareas matemáticas o lógicas, el modelo puede emplearse para generar cadenas de razonamiento que luego se validan con un verificador externo.
- Base para posteriores ajustes (DPO, RLHF o destilación): al ser un full fine-tuning con licencia no declarada, su uso como punto de partida requiere verificar primero los términos del modelo base.
- Evaluación comparativa de modelos EXAONE ajustados: como referencia en estudios internos sobre el impacto del SFT en modelos de 7-8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación del mejor checkpoint (0,41970309615135193) y el step de parada (902), sin métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 7.818.448.896 parámetros en safetensors, una estimación orientativa sería aproximadamente 15,6 GB en FP16/BF16 (2 bytes por parámetro) más overhead de activaciones y KV cache.
- GPU recomendadas: para FP16/BF16 se requiere una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 con cuantización). Para mayor throughput, A100 40/80 GB o H100.
- ¿Cabe en GPU consumer? Sí, en RTX 3090/4090 (24 GB) en FP16 con contexto moderado; en GPUs de 16 GB sería necesario cuantizar, pero no se publican pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en Transformers. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso de `custom_code` puede complicar la integración con servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (EXAONE 3.5 7.8B SFT VeriReason) | 7.818.448.896 | no disponible | no disponible | Hugging Face, repo de 187,6 GB | SFT completo, 20 % datos, 15 épocas, lr 1e-6 |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.800 millones (aprox.) | no disponible en esta ficha | licencia EXAONE (no confirmada aquí) | Hugging Face | Modelo base oficial; soporta tool calling y multilingüe según su card |
| Jongbin-kr/exaone-luna-medium-fullft-sft-r5e-6-seed42-20261021 | mismo tamaño | no disponible | no disponible | Hugging Face | Variante del mismo autor con lr 5e-6 |
| Jongbin-kr/exaone-luna-medium-fullft-sft-r100-e5-lr2e-5-seed42-20261021 | mismo tamaño | no disponible | no disponible | Hugging Face (repo de 407 GB) | Variante con 100 % de datos, 5 épocas, lr 2e-5 |

No se dispone de benchmarks comparativos entre estas variantes en la información proporcionada; la comparación se limita a configuración de entrenamiento y tamaño de repositorio.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo ni la del modelo base en esta ficha; antes de cualquier uso comercial es imprescindible consultar los términos de EXAONE 3.5 en el repositorio de LGAI.
- Sin evaluación publicada: no hay benchmarks que respalden mejoras frente al modelo base; el único dato es la pérdida de validación (0,4197), insuficiente para inferir calidad en tareas reales.
- Riesgo de sobreajuste: 15 épocas sobre un subconjunto del 20 % de un dataset de 16K ejemplos, con parada a las 2,8 épocas efectivas, sugiere que el entrenamiento se detuvo pronto; aun así, no se documenta el comportamiento en validación a lo largo de las épocas.
- Idiomas no documentados: se desconoce si el ajuste degrada el multilingüismo del modelo base (coreano/inglés) o introduce sesgos hacia el dominio del dataset.
- Riesgo de alucinación: inherente a los modelos de 7-8B; el ajuste sobre datos de razonamiento no elimina este riesgo y no se ha medido.
- `custom_code` obligatorio: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar los archivos antes de desplegar en producción.
- Tamaño del repositorio (187,6 GB): dificulta la descarga y el almacenamiento; incluye múltiples checkpoints intermedios, no solo los pesos finales.
- Sin pipeline declarado: no se especifica la tarea (`text-generation` u otra), lo que puede afectar a la integración automática en herramientas.
- Naturaleza experimental: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr1e-6-seed42-20261021
- Variante lr 5e-6: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-lr5e-6-seed42-20261021
- Variante r100-e5-lr2e-5: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r100-e5-lr2e-5-seed42-20261021
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DanielJeongsooLee/VeriReason-Luna-Medium-16K
