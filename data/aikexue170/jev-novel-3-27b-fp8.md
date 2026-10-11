# aikexue170/jev-novel-3-27b-fp8

## Resumen

JEVnovel 3 · 27B (FP8) es el modelo profesor de la serie JEVnovel 3, publicada por el usuario aikexue170 (北棱) bajo licencia Apache-2.0. Se trata de un modelo de clasificación de texto en chino especializado en evaluar la calidad de frases en textos de ficción generados por IA (AIGC), con foco en la revisión de novelas. No es un modelo generativo: incorpora un cabezal de clasificación y devuelve, en una única pasada hacia delante, un juicio y su nivel de confianza, sin decodificación autorregresiva.

El modelo deriva de un ajuste fino sobre Qwen/Qwen3.8-27B. El backbone de texto es qwen3_5, con hidden de 5120 y 64 capas, y suma 27,48 mil millones de parámetros, de los cuales 0,13 mil millones corresponden al cabezal de puntuación JointSchemaHead. Esta versión concreta está cuantizada en FP8 W8A8 (e4m3) mediante modelopt, con 8 fragmentos más un `head.safetensors`, y ocupa unos 29 GiB.

Su relevancia radica en su función dentro de la serie: actúa como fuente de señal para destilar modelos estudiantes más pequeños (0,8B y 4B) que incorporan dos cabezales adicionales, uno de curva de percepción y otro de densidad informativa, que permiten localizar qué fragmento de la frase falla y decidir si eliminarlo o reescribirlo. El profesor solo puntúa frases completas, pero puede usarse por separado como evaluador genérico de calidad literaria y de estilo formulario de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con backbone qwen3_5 (hidden 5120, 64 capas) y cabezal de clasificación JointSchemaHead (width 1024, 4 capas, 16 cabezas, fp32 sin cuantizar) |
| Parametros totales | 27.356.728.560 (27,48B), incluidos 0,13B del cabezal de puntuación |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens de entrada máxima, incluido el prompt fijo; no se trunca automáticamente y da error si se supera |
| Tipos de cuantizacion | FP8 W8A8 (e4m3); existe una versión BF16 del mismo modelo en repositorio aparte |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 (hereda la del modelo base Qwen3.8) |
| Formato de pesos | safetensors (8 fragmentos del backbone + `head.safetensors`; adaptador ya fusionado en el backbone). La versión BF16 usa 12 fragmentos + `adapter_head.safetensors` con adaptador sin fusionar |

## Arquitectura y entrenamiento

Se trata de un transformer denso construido sobre el backbone qwen3_5 de Qwen/Qwen3.8-27B, con hidden de 5120 y 64 capas, al que se añade un cabezal de clasificación denominado JointSchemaHead (width 1024, 4 capas, 16 cabezas) que se mantiene en fp32 y no se cuantiza. El modelo no genera texto: realiza una única pasada hacia delante sobre un prompt fijo más la frase de entrada y produce dos salidas simultáneas, una clasificación binaria (可以保留 / 需要修改) y una escala ordinal de cinco niveles (烂完了 / 小改 / 平庸 / 还可以 / 优秀). El umbral de decisión congelado de fábrica es `p_bad >= 0.31`.

El entrenamiento se basa en datos de preferencia humana orientados a discriminar texto formulario de IA (八股), es decir, expresiones que son probables estadísticamente pero no óptimas en legibilidad. La innovación de la serie no está en el profesor, sino en el proceso de destilación que habilita: los estudiantes se entrenan con dos cadenas de anotación independientes. La primera, correspondiente a la curva de percepción, se obtiene puntuando repetidamente cada prefijo de la frase (primer fragmento, primeros dos, etc.) para reconstruir la forma de la curva. La segunda, correspondiente a la densidad informativa, proviene de un modelo juez independiente (StartLux-Decision-27B) que responde, para cada fragmento, si puede eliminarse al simplificar la frase. El profesor no incorpora ninguno de esos dos cabezales; solo aporta la señal de calidad.

## Capacidades

- Puntuación de calidad de frase completa en chino, con clasificación binaria (apta para conservar / requiere modificación) y probabilidad asociada.
- Escala ordinal de cinco niveles con probabilidades por clase y puntuación esperada de 1 a 5 (requiere la opción `--ordinal`).
- Detección de estilo formulario de IA (八股) en textos literarios, sin reglas léxicas de bloqueo que produzcan falsos positivos.
- Salida determinista en una sola pasada, sin generación autorregresiva ni riesgo de deriva en la respuesta.
- Procesamiento por lotes en formato JSONL (campo `sentence` con `id` opcional) y uso programático mediante la clase `Predictor`.
- Puntuación de prefijos de una frase para generar curvas de percepción dentro del proceso de destilación.
- No incorpora tool calling, function calling, capacidades de agente, visión ni audio.
- Multilingüismo limitado al chino; no se documenta soporte de otros idiomas.
- No dispone de modo de razonamiento explícito (thinking) ni de salida de texto libre.

## Casos de uso

- Revisión automática de manuscritos de novela generados por IA: el modelo clasifica cada frase como conservable o modificable y, con la escala ordinal, prioriza las que requieren reescritura, lo que permite ordenar la cola de trabajo editorial sin intervención manual.
- Curación de corpus de entrenamiento: al puntuar frases individuales de un dataset literario, permite descartar o marcar los fragmentos con estilo formulario de IA antes de reutilizarlos en un ajuste fino, reduciendo la propagación del sesgo estilístico.
- Métrica de evaluación de modelos generativos de ficción: integrado en un pipeline de evaluación, ofrece una puntuación objetiva de naturalidad sobre las salidas de un LLM, complementaria a métricas como perplejidad o similitud, y sirve para comparar versiones de un mismo generador.
- Herramienta de edición asistida para escritores: expone una puntuación por frase con umbral ajustable (`--threshold`) que permite a un editor humano revisar solo los tramos marcados, mostrando además la confianza para calibrar la severidad del aviso.
- Generación de curvas de percepción para destilación: mediante la puntuación repetida de prefijos, produce la señal que entrena el cabezal de curva de los estudiantes, lo que lo convierte en pieza imprescindible para reproducir o extender la serie JEVnovel 3.
- Etiquetado de densidad informativa combinado con un juez externo: junto a StartLux-Decision-27B, permite construir etiquetas frasales que distinguen texto decorativo (candidato a eliminación) de texto con carga argumental (candidato a reescritura).
- Auditoría de estilo en grandes volúmenes: con un rendimiento medido de unas 11,7 frases por segundo en lotes de 16, puede procesar corpus extensos para análisis estadísticos de estilo formulario por autor, género o modelo generador.

## Benchmarks y rendimiento

Los datos de evaluación proceden de la model card del autor. El protocolo emplea como conjunto principal 538 frases con mayor consenso entre anotadores humanos (main-bench) y reporta Macro-F1, recall de la clase bad, precisión de la clase bad y tasa de falsos positivos en frases normales. El umbral se fija en validación y se congela antes de aplicarlo al conjunto de prueba.

| Modelo | Macro-F1 (main-bench) | Recall bad | Precisión bad | Falsos positivos en frases normales |
|---|---:|---:|---:|---:|
| jev-novel-2-27b-bf16 (generación anterior) | 0,7661 | 0,6162 | 0,8978 | 0,0712 |
| jev-novel-3-27b-bf16 (punto de trabajo óptimo) | 0,8223 | 0,7417 | 0,8894 | 0,0936 |
| jev-novel-3-27b-fp8 (este modelo, mismo umbral) | 0,8151 | no disponible | no disponible | no disponible |

Notas de la model card: la versión BF16 alcanza Macro-F1 de 0,8185 con el umbral congelado de fábrica (0,31) y 0,8223 en el punto de trabajo óptimo (umbral ≈0,30). La comparación FP8 frente a BF16 con el mismo umbral arroja una caída de Macro-F1 de 0,8185 a 0,8151 (Δ −0,003), una desviación media de `p_bad` de 0,011 y una desviación p95 de 0,046, con 10 inversiones de decisión sobre 538 frases (1,9 %).

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan unos 29 GiB, más el cabezal en fp32 y las activaciones; se recomienda un mínimo de 32 GB de VRAM y, con holgura para lotes mayores, 40-48 GB.
- GPU recomendadas: NVIDIA con soporte BF16. Las GPU con soporte nativo de FP8 (H100, H200, L40S) activan los kernels acelerados de forma automática; en el resto de hardware el modelo recurre a una ruta de respaldo sin configuración adicional.
- Compatibilidad con GPU de consumo: no cabe en GPUs de 24 GB como la RTX 4090, dado que solo los pesos ya superan ese tamaño. No se ofrecen cuantizaciones adicionales de menor precisión que permitan reducir más el uso de memoria.
- Opciones de despliegue: no es compatible con `AutoModel` de Transformers ni con motores genéricos como vLLM, llama.cpp, Ollama o TGI, al tratarse de una arquitectura personalizada. El despliegue debe hacerse con el `infer.py` incluido en el repositorio, que carga los pesos localmente y no requiere conexión a red.
- Entorno: Linux, Python 3.12, PyTorch 2.13.0 con CUDA 13.2, y una herramienta de compilación compatible con la versión de PyTorch instalada.
- Latencia y throughput: aproximadamente 11,7 frases por segundo con tamaño de lote 16, lo que supone un aumento de velocidad de cerca de 1,5× respecto a la ruta con desquantización.

## Comparativa con modelos similares

La serie JEVnovel 3 no tiene alternativas públicas directas de clasificación de calidad literaria en chino, por lo que la comparación más pertinente es interna a la propia familia.

| Modelo | Parametros | Contexto | Macro-F1 | Recall bad | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| jev-novel-3-27b-fp8 (este modelo) | 27,48B | 4096 tokens | 0,8151 | no disponible | Apache-2.0 | safetensors FP8 W8A8 |
| jev-novel-3-27b-bf16 | 27,48B | 4096 tokens | 0,8185 (0,8223 en punto óptimo) | 0,7417 | Apache-2.0 | safetensors BF16 |
| jev-novel-2-27b-bf16 | ~26B | no disponible | 0,7661 | 0,6162 | no disponible en la información proporcionada | safetensors BF16 |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Fuera de esta familia, la búsqueda web menciona una familia "Jev" de modelos de decisión construida sobre Qwen3.5/3.8 (repositorio `jaredpalmer/kev`) y una entrada de BenchLM.ai sobre "JEV-27B" con seis filas de benchmark, pero no se aportan cifras comparables ni confirmación de que sean el mismo modelo, por lo que no se incluyen como alternativas equivalentes.

## Limitaciones y advertencias

- El modelo solo maneja chino; no se ha documentado entrenamiento ni evaluación en otros idiomas, por lo que su uso en castellano u otras lenguas no está respaldado.
- Juzga la calidad de la expresión, no la autoría. La model card advierte explícitamente de que no debe interpretarse como un detector de texto generado por IA.
- No es un modelo generativo: no produce sugerencias de reescritura, solo puntuaciones. Cualquier acción de corrección debe implementarla el sistema que lo rodea.
- El umbral de decisión por defecto (0,31) prioriza el recall de la clase bad a costa de una tasa de falsos positivos del 9,4 % en frases normales (frente al 7,1 % de la generación anterior), lo que implica marcar como mejorables frases correctas con cierta frecuencia.
- El límite de 4096 tokens incluye un prompt fijo, de modo que la frase útil disponible es menor; no se trunca automáticamente y lanza error al superarse.
- La arquitectura es personalizada y no es cargable con `AutoModel`; esto bloquea su integración en herramientas estándar y complica su despliegue en producción frente a modelos compatibles con vLLM o TGI.
- El uso comercial está permitido por la licencia Apache-2.0, pero se recomienda revisar `LICENSE` y `NOTICE` del repositorio, dado que hereda condiciones del modelo base Qwen3.8.
- El modelo es la versión cuantizada del profesor; quienes necesiten la máxima precisión deberían usar la variante BF16, ya que la FP8 introduce una pérdida pequeña pero medible (Δ Macro-F1 −0,003 y 1,9 % de inversiones de decisión).
- El conjunto de evaluación principal es de 538 frases, un tamaño reducido que limita la significación estadística de las diferencias entre variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikexue170/jev-novel-3-27b-fp8
- Perfil del autor en HuggingFace: https://huggingface.co/aikexue170
- Versión BF16 en ModelScope: https://modelscope.cn/models/alkaid55555/jev-novel-3-27b-bf16
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Generación anterior jev-novel-2-27b-bf16: https://huggingface.co/aikexue170/jev-novel-2-27b-bf16
- Repositorio de modelos de decisión tipo Jev: https://github.com/jaredpalmer/kev
- Ficha de benchmarks JEV-27B en BenchLM.ai: https://benchlm.ai/models/decision-index-0-3-jev-27b
- Entrada sobre "Jev" en Wikipedia (no confirmada como el mismo modelo): https://en.wikipedia.org/wiki/Jev_(AI_model)
