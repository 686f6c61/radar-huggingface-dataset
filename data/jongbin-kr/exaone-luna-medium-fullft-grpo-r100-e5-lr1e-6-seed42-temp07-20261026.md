# Jongbin-kr/exaone-luna-medium-fullft-grpo-r100-e5-lr1e-6-seed42-temp07-20261026

## Resumen

El modelo `exaone-luna-medium-fullft-grpo-r100-e5-lr1e-6-seed42-temp07-20261026` es un ajuste fino completo (full fine-tuning) del modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, publicado por el usuario Jongbin-kr en Hugging Face. Se trata de un experimento de estabilización del entrenamiento mediante GRPO (Group Relative Policy Optimization) sobre el dataset VeriReason-Luna-Medium-16K, con el objetivo declarado de reforzar capacidades de razonamiento verificable. El autor lo describe explícitamente como "un intento de estabilización monitorizado, no una corrección validada", lo que sitúa al modelo en la categoría de checkpoint de investigación más que de artefacto listo para producción.

El modelo conserva la arquitectura del EXAONE-3.5-7.8B-Instruct original, un transformer decoder-only de aproximadamente 7.818 millones de parámetros (7,8B), con licencia EXAONE AI Model License y capacidades multilingües heredadas del base (coreano, inglés y otros idiomas). El entrenamiento GRPO parte directamente del modelo base fijado en la revisión `553ea250b9a5317231459279d5847d6cf955b9aa`, sin fase SFT previa en este checkpoint concreto, y utiliza recompensas derivadas de Luna (answer/testbench/result).

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de GRPO a escala 7,8B con fine-tuning completo; por otro, sirve de advertencia sobre los riesgos de publicar checkpoints de investigación sin evaluación. El autor no reporta métricas de benchmark, no incluye evaluación y el repositorio ocupa 203,3 GB, lo que refleja que contiene múltiples checkpoints intermedios cada 0,2 épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.818.448.896 (7,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base EXAONE-3.5-7.8B-Instruct, no confirmada en esta ficha) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponibles (heredados del base EXAONE-3.5: coreano, inglés y otros; sin confirmar) |
| Licencia | No disponible en la model card (el base EXAONE-3.5 usa EXAONE AI Model License) |
| Formato de pesos | safetensors |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (revision 553ea250b9a5317231459279d5847d6cf955b9aa) |
| Metodo de ajuste | Full fine-tuning + GRPO (etapa única, sin SFT en este checkpoint) |
| Dataset | DanielJeongsooLee/VeriReason-Luna-Medium-16K (revision f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e) |
| Epocas | 5 |
| Learning rate | 1e-06 |
| Temperatura | 0.7 |
| Beta (KL) | 0 |
| Semilla | 42 |
| Paso guardado | 1607 (progreso 1.000000 epocas) |
| Tamano del repo | 203,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de EXAONE-3.5-7.8B-Instruct, un transformer decoder-only denso de 7,8B parámetros desarrollado por LG AI Research. Sobre esa base se aplica un full fine-tuning con GRPO como única etapa de alineamiento en este checkpoint, sin fase SFT previa (a diferencia de las variantes `sft-r100-e5-lr5e-6` y `sft-r100-e5-lr2e-5` publicadas por el mismo autor). El entrenamiento usa ratio de entrenamiento del 100% del dataset, 5 épocas, learning rate 1e-6, temperatura 0.7 y beta=0 (sin penalización KL explícita), con semilla 42. El checkpoint guardado corresponde al paso 1607, que equivale a 1.000000 épocas completas.

La receta GRPO utiliza recompensas derivadas de "Luna" (answer/testbench/result), un esquema de recompensa por verificación de respuesta que el autor no detalla. Se guarda un checkpoint separado cada 0,2 épocas, cada uno con su propio commit en el Hub, y los estados del optimizador se retienen localmente para permitir la reanudación. El autor etiqueta el experimento como "monitored stabilization attempt, not a validated fix", lo que indica que el objetivo era estabilizar el entrenamiento GRPO más que obtener una mejora medible. No se documentan innovaciones arquitectónicas adicionales (no hay decodificación especulativa, atención lineal ni mecanismos híbridos): el modelo es un fine-tuning estándar del base.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del base EXAONE-3.5-7.8B-Instruct.
- Razonamiento verificable orientado por recompensas (esquema Luna answer/testbench/result), aunque sin evaluación publicada que lo confirme.
- Capacidades multilingües del base (coreano, inglés y otros), no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no confirmado en la model card; el base EXAONE-3.5-Instruct lo soporta, pero no se valida aquí.
- Capacidades de agente y razonamiento multi-paso: no confirmadas ni evaluadas.
- Capacidades de visión o audio: no disponibles (el base es solo texto).
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Investigación en alineamiento con GRPO: el checkpoint sirve como referencia reproducible de una receta GRPO a escala 7,8B con full fine-tuning, hiperparámetros fijados (lr=1e-6, temp=0.7, beta=0, seed=42) y checkpoints cada 0,2 épocas, útil para estudiar estabilidad del entrenamiento.
- Estudio de recompensas verificables: permite analizar cómo un esquema de recompensa tipo Luna (answer/testbench/result) afecta al comportamiento del modelo, comparándolo con las variantes SFT del mismo autor.
- Reproducción de experimentos: la semilla y la revisión del base están fijadas, lo que facilita replicar el entrenamiento y comparar curvas de recompensa entre checkpoints.
- Base para ajustes posteriores: al ser un full fine-tuning del EXAONE-3.5-7.8B-Instruct, puede servir como punto de partida para SFT o DPO adicionales en dominios específicos.
- Evaluación comparativa de checkpoints intermedios: los commits cada 0,2 épocas permiten estudiar la evolución del modelo a lo largo del entrenamiento GRPO.
- Docencia y divulgación: ejemplo práctico de pipeline GRPO con full fine-tuning, incluyendo gestión de checkpoints y estados del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el entrenamiento GRPO "has no evaluation", por lo que no existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,6 GB solo para pesos (7,818B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización 8 bits: ~8 GB para pesos; en 4 bits: ~4-5 GB para pesos (requiere cuantizar manualmente, ya que el repo solo publica safetensors).
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) para fp16 con contexto limitado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto moderado, y en RTX 4070 Ti/4080 en 8 bits; en 4 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI y transformers con `trust_remote_code=True` (el repo requiere `custom_code`); llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (GRPO full FT) | 7,8B | No disponible | No disponible | Hugging Face, 0 descargas | Checkpoint de investigación sin evaluación |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | No disponible en esta ficha | EXAONE AI Model License | Hugging Face, ampliamente usado | Base oficial con evaluación publicada por LG |
| Jongbin-kr/exaone-luna-medium-fullft-sft-r100-e5-lr5e-6-seed42-20261021 | 7,8B | No disponible | No disponible | Hugging Face | Variante SFT del mismo autor, misma receta |
| Jongbin-kr/exaone-luna-medium-fullft-sft-r100-e5-lr2e-5-seed42-20261021 | 7,8B | No disponible | No disponible | Hugging Face (repo de 407 GB) | Variante SFT con lr=2e-5 |

## Limitaciones y advertencias

- Sin evaluación: el autor declara que el GRPO "has no evaluation"; no hay evidencia de mejora frente al base.
- Estabilidad no validada: el propio autor lo describe como "monitored stabilization attempt, not a validated fix".
- Beta=0 en GRPO: sin penalización KL, el modelo puede derivar de la distribución del base y perder capacidades (olvido catastrófico) sin que se detecte.
- Licencia no especificada en la model card: el uso comercial queda condicionado a la licencia del base EXAONE-3.5 (EXAONE AI Model License), que impone restricciones; conviene verificarla antes de cualquier despliegue.
- Idiomas no declarados: aunque el base es multilingüe, este checkpoint no confirma el soporte ni la calidad por idioma.
- Riesgo de alucinación: inherente a los modelos de 7,8B sin evaluación específica; el esquema de recompensa Luna no garantiza veracidad factual.
- Contexto no confirmado: no se documenta la longitud de contexto efectiva tras el fine-tuning.
- Repositorio de 203,3 GB con múltiples checkpoints: descarga costosa y almacenamiento considerable; no incluye estados del optimizador (retenidos localmente).
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-grpo-r100-e5-lr1e-6-seed42-temp07-20261026
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Variante SFT (lr=5e-6): https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r100-e5-lr5e-6-seed42-20261021
- Variante SFT (lr=2e-5): https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r100-e5-lr2e-5-seed42-20261021/tree/main
- Dataset VeriReason-Luna-Medium-16K: https://huggingface.co/datasets/DanielJeongsooLee/VeriReason-Luna-Medium-16K
- Paper de EXAONE 3.5: no disponible en la informacion proporcionada
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
