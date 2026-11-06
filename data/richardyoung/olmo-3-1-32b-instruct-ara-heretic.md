# richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic es una variante "descensurada" del modelo allenai/Olmo-3.1-32B-Instruct, publicada por el usuario richardyoung. Se ha generado aplicando Heretic v2.0.0, una herramienta de ablación de direcciones latentes (Arbitrary-Rank Ablation, ARA) que elimina parcialmente el comportamiento de rechazo del modelo original sin reentrenar los pesos. El resultado es un modelo de 32.233.522.176 parámetros (32B densos, no MoE) que conserva la arquitectura transformer del original pero reduce drásticamente las negativas a peticiones que el modelo base rechazaría.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de modificación de comportamiento (ablación de direcciones en el espacio de activaciones) que es reproducible mediante los parámetros ARA publicados. Por otro, sirve como caso de estudio de los riesgos de distribuir variantes sin alineación de seguridad: el autor reporta una reducción de rechazos de 100/100 a 48/100 en su conjunto de evaluación, con una divergencia KL de 0.0526 respecto al original. El modelo base Olmo 3.1 pertenece a la familia Olmo 3 de AI2, diseñada para investigación abierta con datos, código y checkpoints públicos.

La licencia declarada es Apache 2.0, heredada del modelo base, y el único idioma declarado es inglés. El repositorio ocupa 64,5 GB en formato safetensors y requiere transformers 4.57.0 o superior. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3, sin mezcla de expertos) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion (el modelo base documenta carga en 8 bits con bitsandbytes y float16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/Olmo-3.1-32B-Instruct |
| Herramienta de modificacion | Heretic v2.0.0 (Arbitrary-Rank Ablation) |
| Tamano del repositorio | 64,5 GB |
| Libreria | transformers (>= 4.57.0 para el modelo base) |
| Dataset de post-entrenamiento del base | allenai/Dolci-Instruct-RL |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo allenai/Olmo-3.1-32B-Instruct: un transformer denso de 32B parámetros perteneciente a la familia Olmo 3 de AI2, preentrenado sobre el dataset Dolma 3 y post-entrenado sobre los datasets Dolci. El pipeline de post-entrenamiento del modelo base incluye SFT, DPO y una fase final de RLVR (reinforcement learning with verifiable rewards), según la tabla de etapas publicada en la model card original. No se dispone del número exacto de tokens de preentrenamiento ni de la composición detallada del dataset en la información proporcionada.

La modificación de esta variante no implica reentrenamiento. Se aplica Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0, que identifica y sustrae direcciones en el espacio de activaciones asociadas al comportamiento de rechazo, operando sobre las capas 16 a 34 del modelo. Los hiperparámetros publicados son: `preserve_good_behavior_weight` 0.5741, `steer_bad_behavior_weight` 0.0004, `overcorrect_relative_weight` 0.7661 y `neighbor_count` 11. El autor indica que el proceso es reproducible y proporciona un directorio `reproduce` con instrucciones. La divergencia KL medida respecto al modelo original es de 0.0526, lo que cuantifica cuánto se ha desplazado la distribución de salida.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct base.
- Razonamiento y matemáticas: el modelo base Olmo 3.1 32B está entrenado para tareas de razonamiento, aunque esta variante no documenta benchmarks propios.
- Generación de código: capacidad presente en el modelo base, sin datos específicos para esta variante.
- Comportamiento descensurado: reducción de rechazos de 100/100 a 48/100 en el conjunto de evaluación del autor, según la model card.
- Modo instructivo (no es un modelo "Think"): esta variante deriva de la rama Instruct, no de la rama Think de cadena de pensamiento larga.
- Soporte de tool calling y function calling: no documentado explícitamente para esta variante; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la ablación de direcciones de rechazo, comparando su distribución de salidas con la del modelo original mediante la divergencia KL reportada (0.0526).
- Reproducción de experimentos de ablación: gracias a los parámetros ARA publicados y al directorio `reproduce`, un equipo puede regenerar la variante y validar la metodología de Heretic v2.0.0 sobre el mismo checkpoint base.
- Evaluación de robustez de filtros de contenido: sirve como entrada adversaria para probar clasificadores de seguridad y sistemas de moderación, ya que genera respuestas que el modelo base rechazaría.
- Generación de texto creativo sin restricciones de estilo: para proyectos de ficción o guiones donde el modelo base aplicaría negativas por contenido sensible, con la debida revisión humana posterior.
- Red teaming interno: un equipo de seguridad puede usar la variante para identificar categorías de peticiones problemáticas y calibrar sus propias políticas antes de desplegar modelos en producción.
- Estudio de degradación de capacidades: comparar el rendimiento del modelo original y esta variante en tareas estándar para medir el coste de la ablación en calidad general, usando la divergencia KL como métrica de referencia.
- Docencia sobre técnicas de modificación de modelos: ejemplo práctico de cómo una intervención en el espacio de activaciones altera el comportamiento sin reentrenar, adecuado para cursos de interpretabilidad.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de ablación, no benchmarks estándar de capacidad. Se reproducen a continuación los datos disponibles:

| Metrica | Esta variante | Modelo original (allenai/Olmo-3.1-32B-Instruct) |
|---|---|---|
| Rechazos (conjunto de evaluación del autor) | 48/100 | 100/100 |
| Divergencia KL respecto al original | 0.0526 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16/BF16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren 2 GPU de 48 GB o una GPU de 80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 32 GB para pesos, lo que encaja en una A100 40 GB o H100 40/80 GB; el modelo base documenta carga con `load_in_8bit=True` mediante bitsandbytes.
- Cuantizaciones de 4 bits (si se generan con herramientas externas): aproximadamente 16-20 GB, lo que podría caber en una RTX 4090 de 24 GB, aunque no se han publicado versiones GGUF ni AWQ/GPTQ en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con 2x A100 40 GB o 2x RTX 4090 para FP16.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y no está verificada la calidad resultante; no hay artefactos publicados para llama.cpp u Ollama.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de vLLM o TGI al ser un modelo compatible con la arquitectura estándar de transformers, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32,2B | no disponible | apache-2.0 | Variante descensurada con ARA; 48/100 rechazos; KL 0.0526 |
| allenai/Olmo-3.1-32B-Instruct | 32B | no disponible en la informacion | apache-2.0 | Modelo original alineado; 100/100 rechazos en el mismo conjunto |
| allenai/Olmo-3.1-32B-Think | 32B | no disponible en la informacion | apache-2.0 | Variante con cadena de pensamiento larga para razonamiento |
| allenai/Olmo-3-7B-Instruct | 7B | no disponible en la informacion | apache-2.0 | Alternativa de menor tamano de la misma familia |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y comportamiento de rechazo documentado.

## Limitaciones y advertencias

- La reducción de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro que el modelo base bloquearía; no debe desplegarse en aplicaciones orientadas al público sin filtros externos robustos.
- La ablación puede degradar capacidades generales; la divergencia KL de 0.0526 indica un cambio medible en la distribución de salidas, pero no se han publicado evaluaciones de calidad en tareas estándar.
- Riesgo de alucinación: inherente a los modelos de 32B; no hay datos específicos para esta variante.
- Solo se declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- La longitud de contexto no está documentada en esta ficha; debe consultarse la model card del modelo base antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado; la licencia no exime de cumplir normativas de moderación de contenido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se han publicado artefactos GGUF, AWQ ni GPTQ; el despliegue en hardware de consumo requiere cuantización manual.
- La model card del autor es una modificación de la del modelo base; parte de la documentación (instalación, fine-tuning, checkpoints) se refiere al modelo original y no necesariamente aplica a esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Heretic (herramienta de ablación): https://heretic-project.org
- Repositorio de reproducción: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic/tree/main/reproduce
- Dataset Dolci-Instruct-RL: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Articulo referenciado (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
