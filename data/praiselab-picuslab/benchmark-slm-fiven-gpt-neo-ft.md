# praiselab-picuslab/benchmark-slm-fiven-gpt-neo-ft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gpt-neo-ft` es un adaptador LoRA (PEFT) publicado en HuggingFace sobre el modelo base `EleutherAI/gpt-neo-1.3B`. No se distribuye como modelo completo, sino como pesos incrementales en formato safetensors que requieren descargar y cargar el modelo base para poder ejecutarse. La model card lo etiqueta como modelo de generación de texto en italiano y lo vincula a un conjunto de etiquetas (`benchmark-slm`, `dataset-fiven`, `strategy-ft`, `or2`) que sugieren un artefacto experimental dentro de una comparativa interna de modelos de lenguaje pequeños, más que un modelo destinado a producción.

El modelo base es un transformer decoder-only de 1,3 mil millones de parámetros publicado por EleutherAI en 2021 y entrenado sobre The Pile, con una ventana de contexto de 2048 tokens. Sobre esa base, este repositorio aplica un ajuste fino supervisado (la etiqueta `strategy-ft` apunta a fine-tuning completo o parcial mediante LoRA); no se especifican hiperparámetros, volumen de datos ni metodología de alineación.

Su relevancia actual es limitada y de carácter metodológico: sirve como referencia reproducible de un experimento de ajuste fino sobre una arquitectura antigua, con 0 descargas y 0 likes en el momento de la consulta, acceso restringido (gated) y licencia no declarada. Cualquier evaluación de calidad debe hacerse contra el modelo base, ya que no se publican métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-Neo) con adaptador LoRA/PEFT sobre `EleutherAI/gpt-neo-1.3B` |
| Parámetros totales | 1,3 mil millones en el modelo base; tamaño del adaptador no disponible (tamaño de repo declarado: 0.0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens según la configuración publicada del modelo base; no verificado para el adaptador |
| Tipos de cuantización | no disponible en el repositorio (solo safetensors del adaptador); el modelo base fusionado admite fp32, fp16, int8 e int4 mediante herramientas externas |
| Idiomas soportados | italiano (según la model card); el modelo base está entrenado predominantemente en inglés |
| Licencia | no disponible (la licencia del modelo base GPT-Neo es MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base para su uso |

## Arquitectura y entrenamiento

El modelo base `EleutherAI/gpt-neo-1.3B` es un transformer decoder-only autorregresivo de estilo GPT-3, con 24 capas, dimensión oculta de 2048, 16 cabezas de atención y vocabulario de 50 257 tokens. Según la configuración publicada de la familia GPT-Neo para los tamaños 125M y 1.3B, las capas alternan atención global y atención local con ventana de 256 tokens, lo que reduce el coste computacional en secuencias largas. Se entrenó sobre The Pile (aproximadamente 825 GiB de texto diverso en inglés) con secuencias de 2048 tokens y no incorpora ajuste por instrucciones ni alineación con preferencias humanas en su versión original.

Respecto al adaptador, la información disponible es mínima: las etiquetas indican `lora`, `peft`, `strategy-ft` y `dataset-fiven`, por lo que se trata de un ajuste fino con LoRA sobre un dataset denominado "fiven" del que no se detalla composición, número de tokens, idioma de origen ni proceso de filtrado. No se especifican rango de LoRA, alpha, módulos objetivo, épocas, tasa de aprendizaje ni si hubo etapas de RLHF o DPO. La etiqueta `or2` no está documentada y no se han encontrado referencias públicas que la expliquen. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, decodificación restringida, etc.).

## Capacidades

- Generación de texto autorregresiva en italiano, condicionada por el ajuste fino del adaptador.
- Continuación de texto y generación libre a partir de un prompt; no hay evidencia publicada de un modo de instrucciones o de plantilla de chat definida.
- Capacidad multilingüe limitada: el adaptador declara únicamente italiano, mientras que el modelo base está dominado por inglés; no se documenta transferencia a otras lenguas.
- Soporte de tool calling / function calling: no disponible; el modelo base no fue entrenado para ello y no se indica formateo de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin evaluación publicada.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Razonamiento matemático y generación de código: no evaluadas en este adaptador; en el modelo base de 1,3B son capacidades débiles y no se han publicado métricas.

## Casos de uso

- Reproducción de experimentos de ajuste fino: cargar el adaptador con `peft` sobre el modelo base para replicar la configuración `strategy-ft` en una comparativa interna de modelos pequeños, verificando la pérdida de validación sobre el dataset "fiven".
- Evaluación comparativa de adaptadores LoRA: usar este repositorio como uno de los puntos de la línea base en un benchmark de SLM, comparando su perplejidad en italiano frente a otros adaptadores del mismo autor.
- Generación de texto en italiano con recursos mínimos: al tener 1,3B parámetros, puede ejecutarse en una GPU de consumo o incluso en CPU para tareas de redacción asistida de baja criticidad donde no se requiera precisión factual.
- Docencia y formación técnica: ilustrar el flujo completo de PEFT (descarga del adaptador, fusión con el modelo base, cuantización posterior) en cursos de ajuste fino, dado el tamaño manejable del modelo.
- Prototipado de pipelines de generación de texto: validar infraestructura de inferencia (servidor HTTP, gestión de contexto de 2048 tokens, batching) antes de migrar a modelos mayores.
- Filtrado y etiquetado de texto en italiano como tarea exploratoria: usar el modelo para clasificación por prompting (por ejemplo, asignar categorías a reseñas) solo en fase de exploración, dado que no hay métricas que respalden su fiabilidad.
- Investigación sobre degradación de modelos base antiguos: analizar cuánto puede mejorar un ajuste fino LoRA sobre una arquitectura de 2021 y en qué tareas persiste el olvido catastrófico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de pérdida, perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y tampoco se han encontrado publicaciones externas asociadas al identificador `or2` o al dataset "fiven".

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del modelo base, no medida): en fp16, aproximadamente 2,6 GB solo de pesos y del orden de 4-5 GB contando caché KV y overhead del runtime; en int8, alrededor de 1,4 GB de pesos; en int4, en torno a 0,8-0,9 GB.
- El adaptador LoRA en sí ocupa muy poco (el repositorio declara 0.0 GB redondeados), pero debe cargarse junto al modelo base completo, por lo que el requisito real es el del modelo base.
- GPU recomendadas: cualquier GPU con 8 GB o más permite fp16 con comodidad (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10). Para int4 basta con 4-6 GB (GTX 1650 Super, RTX 3050). En A100/H100 solo tendría sentido para servir muchas réplicas o lotes grandes, no por requisito de memoria.
- Cabe en GPU de consumo: sí, de forma holgada; también es viable en CPU, con latencia mucho mayor.
- Opciones de despliegue: la vía principal es `transformers` + `peft` (cargar el adaptador y, opcionalmente, fusionarlo con `merge_and_unload`). Para vLLM, TGI, llama.cpp u Ollama no se ha confirmado en la información disponible compatibilidad con la arquitectura GPT-Neo; requerirían verificar el soporte del modelo base y, en el caso de llama.cpp/Ollama, una conversión a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (`benchmark-slm-fiven-gpt-neo-ft`) | 1,3 mil millones (base) + LoRA | 2048 | no disponible | Acceso restringido (gated) | Sin benchmarks ni documentación de entrenamiento |
| `EleutherAI/gpt-neo-1.3B` (base) | 1,3 mil millones | 2048 | MIT | Pública | Sin ajuste por instrucciones; entrenado en The Pile |
| `EleutherAI/pythia-1.4b` | 1,4 mil millones | 2048 | Apache 2.0 | Pública | Suite con checkpoints intermedios para investigación |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1,1 mil millones | 2048 | Apache 2.0 | Pública | Ajustado por instrucciones y con plantilla de chat definida |
| `cerebras/Cerebras-GPT-1.3B` | 1,3 mil millones | 2048 | Apache 2.0 | Pública | Entrenamiento con escala de compute conocida |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, perplejidad en italiano) para este adaptador, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, aunque el modelo base GPT-Neo sea MIT. Es necesario contactar con el autor o solicitar aclaración antes de cualquier despliegue productivo.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que impide su uso en pipelines automatizados sin gestión previa de credenciales y aprobación.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de mejora sobre el modelo base ni de calidad en italiano.
- Modelo base obsoleto: GPT-Neo 1.3B es de 2021, no está ajustado por instrucciones y rinde por debajo de modelos actuales del mismo tamaño en razonamiento, código y matemáticas.
- Riesgo de alucinación: el modelo base fue entrenado sobre texto web sin alineación; no se ha aplicado ninguna técnica documentada de mitigación en el adaptador.
- Sesgos: heredados de The Pile (predominantemente inglés y de fuentes web), sin documentación de evaluación de sesgos ni de filtrado del dataset "fiven".
- Limitación idiomática: la card declara solo italiano; no hay garantía de calidad en castellano ni en otras lenguas, y el modelo base está dominado por el inglés, lo que puede producir mezcla de idiomas.
- Ventana de contexto de 2048 tokens: insuficiente para tareas de documento largo, agentes con historial extenso o análisis de código de gran tamaño.
- Artefacto experimental: las etiquetas (`benchmark-slm`, `or2`) apuntan a un subproducto de una comparativa interna; no hay mantenimiento, versión documentada ni soporte.
- Sin información de entrenamiento: no puede auditarse qué datos se usaron, con el consiguiente riesgo de contaminación de benchmarks y de problemas de propiedad intelectual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gpt-neo-ft
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-1.3B
- Repositorio de GPT-Neo (EleutherAI): https://github.com/EleutherAI/gpt-neo
- Paper de The Pile: https://arxiv.org/abs/2101.00027
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo, su dataset o la etiqueta `or2`; los resultados obtenidos no guardan relación con el modelo.
