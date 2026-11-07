# Jongbin-kr/exaone-luna-medium-fullft-grpo-r20-e15-lr1e-6-seed42-temp07-20261026

## Resumen

El modelo `exaone-luna-medium-fullft-grpo-r20-e15-lr1e-6-seed42-temp07-20261026` es un ajuste fino completo (full fine-tuning) del modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, publicado por el usuario Jongbin-kr en Hugging Face. Se trata de un experimento de estabilización de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el dataset VeriReason-Luna-Medium-16K, orientado a tareas de razonamiento verificable. El autor lo describe explícitamente como "un intento de estabilización monitorizado, no una corrección validada", lo que sitúa el artefacto en el terreno de la investigación experimental más que en el de un modelo listo para producción.

El modelo conserva la arquitectura y el tamaño del EXAONE-3.5-7.8B-Instruct original: 7.818.448.896 parámetros en formato safetensors, un transformer denso (no MoE) desarrollado por LG AI Research. El entrenamiento parte de la revisión `553ea250b9a5317231459279d5847d6cf955b9aa` del modelo base y aplica GRPO directamente sobre él, sin una fase SFT previa en este repositorio concreto (aunque existen repositorios hermanos del mismo autor con SFT). Se guardó en el step 1284, equivalente a 4 épocas de progreso sobre el 20% del dataset.

Su relevancia es acotada pero real para quien investigue recetas de RL sobre modelos coreanos bilingües: documenta una configuración concreta (temperatura 0.7, beta 0, learning rate 1e-6, semilla 42) y un esquema de checkpoints cada 0.2 épocas. No obstante, la ausencia de evaluación, de licencia declarada y de benchmarks publicados limita seriamente su uso fuera de un contexto de reproducción experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de EXAONE-3.5-7.8B-Instruct) |
| Parámetros totales | 7.818.448.896 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base EXAONE-3.5-7.8B-Instruct, no confirmada en esta ficha) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base EXAONE-3.5 es bilingüe coreano-inglés, pero este ajuste no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` y tokenizer incluidos en el repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del EXAONE-3.5-7.8B-Instruct de LG AI Research: un transformer denso decoder-only de 7.800 millones de parámetros. Sobre esa base, el autor aplica un full fine-tuning con GRPO, un algoritmo de optimización por política relativa de grupo que no requiere un modelo de recompensa separado entrenado con preferencias humanas, sino que compara respuestas dentro de un grupo muestreado. La receta declarada es: stage=grpo, ratio de entrenamiento del 20%, 15 épocas configuradas, learning rate 1e-6, semilla 42, temperatura 0.7 y beta 0 (sin penalización KL explícita contra el modelo de referencia).

El dataset utilizado es `DanielJeongsooLee/VeriReason-Luna-Medium-16K` en la revisión `f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e`, y las recompensas provienen de "Luna answer/testbench/result rewards", según la model card. El entrenamiento se detuvo en el step 1284, que corresponde a 4 épocas de progreso reales (no a las 15 configuradas). El autor indica que no hay fase de evaluación y que el checkpoint final (`main`) es simplemente el último modelo guardado. Se generan checkpoints cada 0.2 épocas, cada uno con su propio commit en el Hub, mientras que el estado del optimizador se retiene localmente para reanudación. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del EXAONE-3.5-7.8B-Instruct, incluyendo razonamiento multi-paso y respuesta a preguntas.
- Razonamiento verificable: el ajuste con GRPO sobre VeriReason-Luna-Medium-16K está orientado a tareas donde la respuesta puede comprobarse contra un testbench o un resultado esperado.
- Capacidades multilingües: no declaradas en esta ficha; el modelo base EXAONE-3.5 soporta coreano e inglés, pero el ajuste no confirma ni amplía ese soporte.
- Tool calling / function calling: no disponible en la información proporcionada para este ajuste concreto (el base EXAONE-3.5-Instruct sí lo soporta, pero no se verifica aquí).
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el entrenamiento con recompensas de tipo testbench sugiere cierta orientación a razonamiento estructurado, pero sin garantías.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Modo de razonamiento con recompensas de resultado: el uso de "Luna answer/testbench/result rewards" implica un entrenamiento orientado a maximizar aciertos verificables, no a preferencias humanas generales.

## Casos de uso

- Reproducción de experimentos de RL: el modelo sirve como artefacto de referencia para replicar la receta GRPO declarada (temperatura 0.7, beta 0, lr 1e-6, semilla 42) sobre EXAONE-3.5-7.8B y comparar estabilidad entre checkpoints cada 0.2 épocas.
- Investigación en razonamiento verificable: útil para estudiar cómo el entrenamiento con recompensas de testbench y resultado afecta al comportamiento del modelo en tareas con respuesta comprobable, aunque sin evaluación publicada hay que medir por cuenta propia.
- Ajuste fino posterior (continued fine-tuning): al estar en safetensors y con `custom_code`, puede cargarse como punto de partida para SFT adicional o para nuevos ciclos de GRPO con otras semillas.
- Comparación de recetas SFT vs. GRPO: el autor publica repositorios hermanos con SFT (lr 5e-6 y 2e-5, semilla 42), lo que permite contrastar el efecto del RL frente al SFT sobre el mismo dataset.
- Estudio de estabilidad de entrenamiento: la model card describe el modelo como "intento de estabilización monitorizado", por lo que es adecuado para analizar divergencias, colapsos de política o degradación de formato en GRPO sin KL.
- Docencia y experimentación académica: sirve para ilustrar en un curso o laboratorio cómo se documenta una receta de RL y qué información falta (evaluación, licencia, benchmarks) antes de llevar un modelo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el entrenamiento GRPO "has no evaluation", por lo que no existen métricas de MMLU, HumanEval, GSM8K ni de tareas de razonamiento verificable para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,6 GB solo para pesos (7.818 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB para pesos, más overhead; en 4 bits, alrededor de 4-5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- ¿Cabe en GPU de consumo? Sí, en FP16 cabe en RTX 4090 (24 GB) con contexto limitado; en 8 bits cabe en RTX 4070 Ti/4080 (16 GB); en 4 bits cabe en GPUs de 8 GB, aunque la calidad puede degradarse.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`), vLLM y TGI si soportan la arquitectura EXAONE; llama.cpp/Ollama requerirían conversión a GGUF, que no se proporciona en el repo.
- Latencia y throughput estimados: no disponible. El tamaño del repo (359,6 GB) sugiere que incluye múltiples checkpoints y estados, lo que aumenta el tiempo de descarga pero no afecta al throughput de inferencia una vez cargado un checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (EXAONE-3.5-7.8B + GRPO) | 7.818 M | no disponible | no disponible | Hugging Face (14 descargas) | Sin evaluación; experimental |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.800 M aprox. | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (oficial) | Base oficial de LG AI Research; con evaluación y model card completa |
| Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr5e-6-seed42-20261021 | 7.818 M (presumible) | no disponible | no disponible | Hugging Face | Hermano con SFT en lugar de GRPO; misma familia experimental |
| Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr2e-5-seed42-20261021 | 7.818 M (presumible) | no disponible | no disponible | Hugging Face | Variante SFT con learning rate más alto; útil para comparar recetas |

No se dispone de datos de rendimiento comparativo entre estas variantes, ya que ninguna de las fichas de los repositorios hermanos incluye benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación: la model card declara explícitamente que el entrenamiento GRPO no tiene fase de evaluación, por lo que no hay evidencia de que el ajuste mejore al modelo base.
- Estabilidad no validada: el autor lo describe como "un intento de estabilización monitorizado, no una corrección validada"; puede presentar degradación de formato, colapso de política o respuestas incoherentes.
- Licencia no declarada: al no especificarse licencia, el uso comercial es jurídicamente incierto y depende de la licencia del modelo base EXAONE-3.5-7.8B-Instruct, que no se detalla en esta ficha.
- Idiomas no declarados: no se confirma el soporte multilingüe del ajuste; el comportamiento en castellano no está verificado.
- Riesgo de alucinación: inherente a los modelos de 7-8B sin evaluación de fidelidad; el entrenamiento con recompensas de resultado no garantiza veracidad fuera del dominio del dataset.
- Contexto no confirmado: la longitud de contexto no se documenta en esta ficha; debe consultarse la del modelo base antes de usarlo en tareas de contexto largo.
- Formato de pesos limitado: solo safetensors con `custom_code`; no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en entornos de bajos recursos.
- Tamaño del repo elevado: 359,6 GB, lo que implica descargas lentas y almacenamiento considerable; parte del contenido son checkpoints intermedios.
- Dataset específico: el ajuste está sesgado hacia el dataset VeriReason-Luna-Medium-16K; su generalización a otros dominios no está medida.
- Sin soporte de la comunidad: 14 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que se detecten y corrijan fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-grpo-r20-e15-lr1e-6-seed42-temp07-20261026
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio hermano con SFT (lr 5e-6): https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr5e-6-seed42-20261021
- Repositorio hermano con SFT (lr 2e-5): https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr2e-5-seed42-20261021
- Dataset VeriReason-Luna-Medium-16K: https://huggingface.co/datasets/DanielJeongsooLee/VeriReason-Luna-Medium-16K
