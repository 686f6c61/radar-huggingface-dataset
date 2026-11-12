# cbarkinozer/LFM3-1.7B-Turkish-CPT

## Resumen

LFM3-1.7B-Turkish-CPT es un conjunto de adaptadores LoRA de investigación publicados por el usuario cbarkinozer sobre el modelo post-entrenado LiquidAI/LFM3-1.7B. No se trata de un modelo nuevo ni de un asistente turco listo para producción, sino de un estudio reproducible de continued pretraining (CPT) en turco sobre una única GPU, con checkpoints a aproximadamente 2,2M, 10M, 50M y 100M de tokens de texto crudo. El autor documenta explícitamente que el objetivo es servir de material de investigación para un posterior ajuste de instrucciones, no presentar un asistente generalista mejorado.

El hallazgo principal del estudio es un compromiso claro: la predicción de texto en turco y la discriminación gramatical mejoran de forma monótona con más CPT, mientras que el seguimiento de instrucciones, las puntuaciones en tareas y la terminación de generación se degradan sustancialmente. El adaptador por defecto (100M) solo terminó normalmente en 136 de 500 preguntas de la evaluación completa de generación, con 340 alcanzando el límite de 4096 tokens y 24 activando el guard de repetición exacta.

El modelo base es un transformer de 1.700 millones de parámetros con contexto nativo de 8192 tokens, distribuido bajo licencia LFM Open License v1.0. La relevancia de esta ficha radica en que documenta con detalle inusual las métricas de regresión asociadas al CPT, algo poco frecuente en adaptadores de investigación publicados en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3 de LiquidAI); adaptadores LoRA sobre el modelo base |
| Parámetros totales | 1.700 millones en el modelo base; adaptadores LoRA de tamaño no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de evaluación); contexto nativo del modelo base no especificado en la información disponible |
| Tipos de cuantización | no disponible (los adaptadores se publican en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | Turco (tr) como idioma de adaptación; el modelo base es multilingüe pero el alcance de esta ficha es el adaptador turco |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); no se incluyen pesos fusionados del modelo base |
| Modelo base | LiquidAI/LFM3-1.7B, revisión 0dc4268b561499c648c7ba7c9466bf3d8d01517a (checkpoint post-entrenado, no Base) |
| Librería | peft, transformers (custom_code) |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia LFM3 de LiquidAI con 1.700 millones de parámetros. Sobre él se aplican adaptadores LoRA mediante PEFT, entrenados con pérdida de lenguaje causal estándar sobre todos los tokens (all-token causal LM loss) y texto crudo, sin SFT, DPO, GRPO ni supervisión de razonamiento o thinking. El autor indica explícitamente que el punto de partida es el checkpoint post-entrenado, no la variante Base.

El entrenamiento se organiza en una trayectoria acumulativa: el adaptador de 10M se inicializa desde el modelo original y se entrena con Wikipedia más FineWeb2; el de 50M continúa desde el adaptador de 10M guardado; y el de 100M (raíz del repositorio) continúa desde el de 50M. Existe una rama independiente de 2,2M entrenada solo con Wikipedia, separada de la trayectoria principal. Los archivos de 50M y 100M contienen los parámetros acumulados del adaptador, por lo que no deben apilarse los adaptadores anteriores al cargarlos. No se incluyen pesos fusionados del modelo base.

La evaluación de lenguaje se realizó sobre 100 documentos de Wikipedia y 100 de FineWeb2 retenidos, con ventanas de 2048 tokens (2047 tokens objetivo), sin BOS/EOS y sin puntuar el primer token de cada documento. La evaluación gramatical usa un subconjunto limpio de 1600 pares de TurBLiMP (100 pares por cada uno de 16 fenómenos), exigiendo que la frase gramatical reciba estrictamente mayor log-probabilidad sumada que su contrapartida agramatical, con empates contados como incorrectos y reportando la media de las 16 precisiones por fenómeno.

## Capacidades

- Predicción de texto en turco: el NLL en Wikipedia cae de 3,2619 a 2,3366 (−28,4%) y en web de 3,8894 a 2,6178 (−32,7%) entre el modelo inicial y el checkpoint de 100M.
- Discriminación gramatical: la precisión macro en TurBLiMP sube de 71,75% a 86,81% (+15,06 puntos porcentuales) en el checkpoint de 100M.
- Generación de texto condicionada por prompt: el modelo puede generar texto, pero con terminación degradada (ver limitaciones).
- Capacidad multilingüe heredada del modelo base: no evaluada específicamente en esta release.
- Tool calling / function calling: no evaluado en esta release.
- Razonamiento multi-paso y agentes: no evaluado; el autor indica que thinking está desactivado en la configuración de generación.
- Modo thinking: no aplicado ni supervisado en esta release.

## Casos de uso

- Investigación sobre CPT en lenguas de recursos medios: el adaptador sirve como punto de partida reproducible para estudiar cómo el continued pretraining afecta a la perplejidad y a la gramática en turco, con checkpoints intermedios documentados y métricas comparables entre etapas.
- Punto de partida para SFT turco: dado que el autor recomienda estos checkpoints como base para un ajuste de instrucciones posterior, un equipo puede cargar el adaptador de 10M o 50M y aplicar SFT sobre datos turcos propios para recuperar el seguimiento de instrucciones.
- Estudio de olvido catastrófico: la trayectoria 10M→50M→100M permite medir empíricamente la degradación de tareas downstream (QA, traducción, resumen) a medida que aumenta la exposición al texto crudo, útil para calibrar estrategias de mezcla de datos.
- Evaluación de gramaticalidad en turco: el adaptador de 100M, con 86,81% de precisión macro en TurBLiMP, puede emplearse como scorer de log-probabilidad para filtrar corpus o detectar frases agramaticales en pipelines de limpieza de datos.
- Reproducción de experimentos en una sola GPU: el tamaño del adaptador (repo de 1,0 GB) y el hecho de que el estudio se hizo en single-GPU facilitan la replicación del protocolo en hardware modesto.
- Análisis de terminación de generación: el guard de repetición exacta y las métricas de EOS/longitud/loop permiten estudiar el fenómeno de bucles degenerativos tras CPT prolongado, un caso práctico para quien diseñe guardrails de generación.

## Benchmarks y rendimiento

Resultados de modelado de lenguaje y gramática (menor NLL es mejor; mayor precisión es mejor):

| Checkpoint | Wikipedia NLL ↓ | Web NLL ↓ | TurBLiMP macro accuracy ↑ |
|---|---:|---:|---:|
| Starting model | 3,2619 | 3,8894 | 71,75% |
| Wiki 2,2M | 2,4905 | 3,3101 | 73,19% |
| 10M | 2,3859 | 2,9850 | 80,31% |
| 50M | 2,3584 | 2,7299 | 85,12% |
| 100M | 2,3366 | 2,6178 | 86,81% |

Resultados de seguimiento de instrucciones y tareas (cribado emparejado de 100 preguntas: 20 de corrección GECTurk, 20 de QA TQUAD, 20 de QA XQuAD turco, 20 de traducción EN→TR y 20 de resumen MLSUM-TR):

| Checkpoint | TQUAD F1 ↑ | XQuAD F1 ↑ | Translation chrF ↑ | Summary ROUGE-L ↑ | EOS /100 | Length /100 | Loop guard /100 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Starting model | 0,1306 | 0,0891 | 32,27 | 0,1431 | 100 | 0 | 0 |
| 10M | 0,0157 | 0,0138 | 15,28 | 0,0226 | 53 | 44 | 3 |
| 50M | 0,0016 | 0,0019 | 6,29 | 0,0077 | 36 | 60 | 4 |
| 100M | 0,0053 | 0,0034 | 2,69 | 0,0131 | 26 | 65 | 9 |

El exact match de GECTurk fue 0 para los cuatro modelos, con 19–20 salidas marcadas por el scorer como candidatas a fallo de formato o verbosidad. La rama de 2,2M se evaluó con un protocolo de generación anterior y se omite deliberadamente de la tabla emparejada. La configuración de generación fue idéntica para todos: temperatura 0,1, top_k 50, top_p 1,0, repetition_penalty 1,1, máximo 4096 tokens nuevos, contexto de 8192, semilla 3407, batch continuo de 4, BF16, tokenizer y chat template nativos, thinking desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador LoRA en safetensors ocupa 1,0 GB, pero el modelo base de 1.700 millones de parámetros requiere cargarse aparte (en BF16, aproximadamente 3,4 GB solo de pesos, más overhead de activaciones y KV cache a 8192 tokens).
- GPU recomendadas: no especificadas por el autor; el estudio se realizó en una única GPU, sin detallar el modelo.
- ¿Cabe en GPU de consumo? El modelo base de 1.700 millones de parámetros es compatible con GPUs de consumo de gama media-alta en cuantizaciones de 8 o 4 bits, aunque el autor no publica cifras concretas.
- Opciones de despliegue: carga mediante peft y transformers con custom_code; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| LFM3-1.7B-Turkish-CPT (este) | 1.700 M (base) + LoRA | 8192 en evaluación | Adaptador CPT turco de investigación | LFM Open License v1.0 | Hugging Face, adaptadores safetensors |
| LiquidAI/LFM3-1.7B | 1.700 M | no especificado en la información disponible | Modelo base post-entrenado multilingüe | LFM Open License v1.0 | Hugging Face |
| Modelos turcos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un asistente turco de propósito general: el autor lo declara explícitamente; es un artefacto de investigación para CPT y posterior instrucción.
- Degradación severa del seguimiento de instrucciones: TQUAD F1 cae de 0,1306 a 0,0053 y XQuAD F1 de 0,0891 a 0,0034 entre el modelo inicial y el 100M.
- Colapso de la traducción y el resumen: chrF EN→TR baja de 32,27 a 2,69 y ROUGE-L de resumen de 0,1431 a 0,0131 en el checkpoint de 100M.
- Terminación degenerativa: solo 136 de 500 generaciones terminaron normalmente en el 100M; 340 alcanzaron el límite de 4096 tokens y 24 activaron el guard de repetición exacta.
- Métricas de referencia limitadas: F1 y ROUGE-L son solapamiento con referencia y no miden factualidad ni fidelidad; el exact match de GECTurk fue 0 en todos los modelos.
- Evaluación web sobre muestra de conveniencia: el NLL web proviene de un shard TEST fijado de FineWeb2 y no es una estimación poblacional de la calidad del turco en la web.
- Diferencia de precisión entre evaluación y generación: la evaluación de verosimilitud usa el modelo LoRA sin fusionar, mientras que la generación usa una fusión en BF16, lo que puede alterar el redondeo.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo, toxicidad o alucinación en la información disponible.
- Restricciones de licencia: LFM Open License v1.0; debe revisarse el texto completo antes de cualquier uso comercial, ya que la información disponible no detalla los términos.
- Carga de adaptadores: los archivos de 50M y 100M son acumulativos; apilar adaptadores anteriores produce resultados incorrectos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/cbarkinozer/LFM3-1.7B-Turkish-CPT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset TurBLiMP: https://huggingface.co/datasets/juletxara/turblimp
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
