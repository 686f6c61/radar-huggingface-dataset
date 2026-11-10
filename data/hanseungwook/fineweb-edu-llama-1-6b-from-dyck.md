# hanseungwook/fineweb-edu-llama-1.6b-from-dyck

## Resumen

FineWeb-Edu Llama 1.6B from Dyck es un modelo de lenguaje causal base desarrollado por el usuario hanseungwook, orientado a investigación sobre inicialización y transferencia en preentrenamiento. El modelo parte de un transformer preentrenado previamente sobre secuencias sintéticas de Dyck durante 5.000 pasos y después continúa su entrenamiento sobre el corpus FineWeb-Edu. La versión publicada corresponde al checkpoint final del paso 60.975, en FP32 safetensors y con tokenizador GPT-2.

La relevancia del modelo es experimental más que de producto: forma parte de una familia de comparación que contrasta tres estrategias de inicialización (desde cero, transferencia desde Dyck y transferencia desde NCA) manteniendo constante el presupuesto de entrenamiento en texto, la semilla, la tasa de aprendizaje y la regularización. Esto permite estudiar si el preentrenamiento sobre tareas sintéticas de estructura jerárquica aporta ventajas medibles al entrenar sobre texto natural.

El modelo no tiene ajuste por instrucciones ni por chat, y su ventana de contexto es de solo 1.024 tokens. El nombre "1.6B" corresponde a la familia experimental; el recuento real de parámetros asciende a 1.816.565.760 por el vocabulario de texto. Se distribuye únicamente en inglés y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (cabeza de salida no atada) |
| Parametros totales | 1.816.565.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (publicado en FP32 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo Llama con tokenizador GPT-2 y cabeza de salida no atada (untied). El entrenamiento se realizó en dos fases: una primera de preentrenamiento sobre secuencias sintéticas de Dyck durante 5.000 pasos, y una segunda sobre FineWeb-Edu con un presupuesto nominal de 31,97B tokens (calculado como pasos del optimizador × batch efectivo de 512 × longitud de contexto de 1.024, excluyendo trabajo repetido antes de las reanudaciones). Se usó una tasa de aprendizaje de 0,0005, weight decay de 0,0001 y semilla 0.

La innovación metodológica reside en la inicialización: al comenzar el entrenamiento en texto, los embeddings de entrada usaban una distribución N(mean=0, std=1) y la cabeza de salida no atada usaba la inicialización uniforme por defecto de las capas lineales de PyTorch. El historial de inicialización queda registrado en `config.json` bajo `training_initialization`. El modelo forma parte de un diseño factorial que compara inicialización desde cero, desde Dyck y desde NCA, con runs equivalentes en la familia de 3B. No se menciona RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto causal autoregresiva en inglés, sin ajuste por instrucciones ni formato de chat.
- Modelo base de investigación: sirve como punto de partida para fine-tuning supervisado o para estudios de transferencia.
- Capacidad de modelado de estructura jerárquica heredada del preentrenamiento en secuencias de Dyck (paréntesis equilibrados), aunque no se documentan evaluaciones específicas sobre las weights publicadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre inicialización y transferencia: el modelo permite replicar y comparar el efecto de preentrenar sobre tareas sintéticas (Dyck, NCA) frente a entrenar desde cero, usando el mismo presupuesto de tokens y semilla. Es su propósito principal y el escenario para el que se publicó.
- Estudios de currículo de preentrenamiento: al estar disponible junto a los checkpoints scratch y NCA de la misma familia, se puede analizar cómo afecta la inicialización a la pérdida de validación y a la convergencia en las primeras fases del entrenamiento en texto.
- Fine-tuning supervisado para tareas de clasificación o generación acotada: con 1.817B parámetros y contexto de 1.024 tokens, es viable ajustarlo en una GPU consumer para tareas de dominio específico en inglés, como etiquetado de texto o resumen corto.
- Reproducción de experimentos académicos: el repo incluye `conversion_report.json` con paridad de logits nativos/HF a lo largo de todo el contexto, igualdad exacta de tensores tras recarga y paridad del tokenizador, lo que facilita la verificación de resultados.
- Benchmark de referencia en pipelines de evaluación: puede usarse como baseline de modelos base pequeños en inglés para medir la ganancia de técnicas de alineación posteriores.
- Docencia y divulgación: por su tamaño contenido y su naturaleza de checkpoint intermedio documentado con logs de W&B, sirve para ilustrar el ciclo completo de preentrenamiento de un LLM desde datos sintéticos hasta texto natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la pérdida de validación registrada en W&B: 2,4489 en el paso 60.500, antes del checkpoint final, y el autor advierte explícitamente de que no constituye una nueva evaluación de las weights publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 8-9 GB para contexto completo de 1.024 tokens.
- VRAM estimada en FP16/BF16: alrededor de 3,6 GB para pesos; en cuantización de 8 bits, unos 1,8 GB; en 4 bits, aproximadamente 1 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para entrenamiento o evaluación a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 y fine-tuning ligero.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en FP16/BF16, y en 4-6 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo, con `device_map="auto"`), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de texto | Licencia | Notas |
|---|---|---|---|---|---|
| fineweb-edu-llama-1.6b-from-dyck | 1,817B | 1.024 | ~32B | no disponible | Inicialización desde Dyck; checkpoint final paso 60.975 |
| fineweb-edu-llama-1.6b-scratch | no disponible en la informacion | no disponible | ~32B | no disponible | Misma familia, inicialización aleatoria; baseline de comparación |
| fineweb-edu-llama-1.6b-from-nca | no disponible en la informacion | no disponible | ~32B | no disponible | Misma familia, inicialización desde NCA |
| fineweb-edu-llama-3b-from-dyck-wd0p1 | no disponible en la informacion | no disponible | ~98B | no disponible | Escalado a 3B de la misma metodología |

Los tres primeros comparten presupuesto de entrenamiento, semilla, tasa de aprendizaje y weight decay, por lo que la comparación entre ellos es directa en términos metodológicos. No se dispone de resultados de benchmarks para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones ni mantiene formato de chat; su uso directo en producción conversacional no es adecuado sin fine-tuning.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para la mayoría de tareas de documentación larga o conversaciones multi-turno extensas.
- Entrenado exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, inherente a un modelo base de 1,8B parámetros entrenado con ~32B tokens.
- Sesgos potenciales heredados de FineWeb-Edu, un corpus filtrado por calidad educativa pero no auditado para sesgos sociales; no se documenta ninguna mitigación.
- Licencia no declarada: la ausencia de licencia impide asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de benchmarks publicados sobre las weights finales; la única métrica disponible (pérdida de validación 2,4489 en el paso 60.500) corresponde a un checkpoint anterior y no evalúa el modelo liberado.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El nombre "1.6B" puede inducir a error: el recuento real de parámetros es 1,817B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-dyck
- Run de entrenamiento en W&B: https://wandb.ai/hanseungwook/fineweb-edu-pt/runs/rkil768y
- Modelo de comparación scratch (1.6B): https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-scratch
- Modelo de comparación NCA (1.6B): https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
- Modelo de comparación scratch (3B): https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-scratch-wd0p1
- Modelo de comparación Dyck (3B): https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-dyck-wd0p1
- Modelo de comparación NCA (3B): https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-nca-wd0p1
