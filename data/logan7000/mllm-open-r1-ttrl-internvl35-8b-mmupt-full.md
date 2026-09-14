# logan7000/mllm-open-r1-ttrl-internvl35-8b-mmupt-full

## Resumen
El repositorio logan7000/mllm-open-r1-ttrl-internvl35-8b-mmupt-full contiene un checkpoint de investigación de un modelo multimodal (MLLM) de aproximadamente 8 000 millones de parámetros, construido a partir de InternVL3.5-8B-HF y sometido a un ciclo de aprendizaje por refuerzo con autoetiquetado. El autor lo publica dentro de una línea de trabajo denominada OpenR1 8k + TTRL, con la receta "mmupt" en su variante big tier. No es un modelo de propósito general pulido, sino el resultado de un experimento de entrenamiento reproducible orientado al razonamiento matemático multimodal.

El interés técnico reside en la combinación de dos piezas: un bucle de RL tipo GRPO sobre datos multimodales y TTRL (Test-Time Reinforcement Learning) con pseudoetiquetas generadas por voto de mayoría, es decir, sin necesidad de anotaciones verificadas para cada consulta. El entrenamiento se ejecutó sobre 4 GPU A100 del clúster de la Johns Hopkins University, con un lote efectivo de 120, 640 pasos por época y un dataset de tipo OpenR1 8k, lo que da una cifra aproximada de 7 680 prompts por época.

La relevancia actual es metodológica: documenta una receta completa (hiperparámetros, script de referencia, protocolo de evaluación y checkpoints intermedios) para reproducir RL multimodal con autoetiquetado. Las contrapartidas son importantes: el repositorio no declara licencia, idiomas, pipeline ni resultados de benchmarks comparables, acumula 0 descargas y 0 "likes", y la propia model card contiene fechas de entrenamiento incoherentes entre sí. Debe tratarse, por tanto, como material de investigación reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El nombre del repositorio indica que se parte de InternVL3.5-8B-HF (familia InternVL3.5, modelo multimodal con codificador visual y modelo de lenguaje); no se detalla la composición interna |
| Parametros totales | Aproximadamente 8 000 millones (inferido del sufijo "8b" del nombre; no confirmado explicitamente en la model card) |
| Parametros activos | No aplica segun la informacion disponible (no hay indicios de arquitectura MoE en el nombre, los tags ni la model card) |
| Longitud de contexto | No disponible. Datos relacionados: el protocolo de evaluacion v2 genera hasta 16 000 tokens y el entrenamiento usa max_completion_length = 2048 |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se anuncian versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (la model card no declara idiomas y el tag de idioma no aparece en la informacion) |
| Licencia | No disponible (ni en la model card ni en los metadatos del repositorio) |
| Formato de pesos | safetensors (tag del repositorio; el tipo numerico exacto no se especifica) |
| Tamano del repositorio | 17,1 GB |
| Base declarada | InternVL3.5-8B-HF |
| Modalidades | Multimodal (imagen + texto), segun el nombre "mllm" y los benchmarks de evaluacion (MathVista, MathVision, MathVerse, We-Math) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna. Lo que si especifica es el procedimiento de ajuste: se parte de InternVL3.5-8B-HF y se aplica una receta denominada "mmupt" (beta 0,01; K = 10; T = 0,7; max_completion_length = 2048; learning rate 1e-6; scheduler cosine_with_min_lr con 0,1; warmup_ratio 0; weight_decay 0,01; max_grad_norm 1,0; tipo de perdida "bnpo"; scale_rewards = group), idéntica a la del script de referencia de la tier alta examples/mmr1_qwen25vl7b_gt_mmupt.sh, en la columna correspondiente a InternVL. La variante TTRL añade el flag --self_labeling, que genera pseudoetiquetas por voto de mayoría con self_consistency_threshold = 0: no se usan recompensas verificadas, sino la coherencia entre las K = 10 muestras generadas con temperatura 0,7.

El entrenamiento se realizó sobre 4 GPU (batch size 3 × acumulación de gradiente 10 × 4 GPU = lote efectivo 120, equivalente a 12 prompts por paso). Una época equivale a 640 pasos, y el job consumió 23 h 27 min (2026-09-11 12:19 a 2026-09-12 11:46) en el clúster A100 de la JHU. El repositorio separa tres carpetas: best/ (selección por validación en un holdout MathVista-150), endpoint/ (checkpoint-640, fin de la primera época) y training/ (train.log, trainer_state_best, trainer_state_endpoint, best_metric). El autor indica que best/ y endpoint/ contienen los mismos pesos porque la mejor validación coincide con el paso 640. La model card contiene una incoherencia de fechas: menciona "trained 2026-09-03..09-05" junto a un job ejecutado entre el 11 y el 12 de septiembre de 2026, dato que conviene verificar antes de citar el trabajo.

## Capacidades
- Generación de razonamiento matemático multimodal: el modelo está entrenado y evaluado sobre problemas que combinan imagen y texto (MathVista, MathVision, MathVerse, We-Math) con respuesta final en formato "boxed".
- Respuesta a problemas con soporte visual: gráficos, diagramas y figuras matemáticas, coherente con el corpus de evaluación declarado.
- Generación de cadenas de razonamiento largas: el protocolo de evaluación permite hasta 16 000 tokens de generación, aunque el entrenamiento limitó las completaciones a 2 048 tokens.
- Autoetiquetado y consistencia de muestreo: la receta TTRL implica que el modelo fue optimizado con pseudoetiquetas derivadas de 10 muestras por prompt a temperatura 0,7, lo que favorece respuestas estables bajo muestreo múltiple.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Uso como agente o razonamiento multi-paso con herramientas: no disponible; no se documenta.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modos especiales (thinking mode explícito, audio, vídeo): no disponibles; solo se documenta la modalidad imagen + texto.
- Capacidad de evaluación con juez automático: el protocolo v2 combina reglas de mathruler y un juez Qwen2.5-32B, lo que condiciona el formato de salida esperado.

## Casos de uso
- Reproducción de experimentos de RL multimodal: el repositorio incluye train.log, trainer_state y best_metric, además de la receta completa con hiperparámetros, lo que permite replicar el ciclo mmupt/TTRL en un clúster de 4 GPU A100 y comparar curvas de entrenamiento.
- Investigación sobre TTRL y autoetiquetado por voto de mayoría: sirve como punto de partida para medir cuánto aporta el self_labeling frente al mismo script con etiquetas verificadas, gracias a que la receta base está identificada explícitamente.
- Punto de partida para ajuste fino en dominios con diagramas: al estar ya ajustado con RL sobre datos matemáticos multimodales, puede reentrenarse con datos propios (informes con gráficos, planos, esquemas) partiendo de un checkpoint con razonamiento visual ya estimulado.
- Evaluación comparativa de modelos visuales de ~8B: el checkpoint permite medir contra Qwen2.5-VL-7B en el protocolo v2 (T = 0, top_p 0,95, 16k tokens, prompt con respuesta "boxed", reglas mathruler + juez Qwen2.5-32B) y obtener la media AVG4 sobre los cuatro benchmarks declarados.
- Generación de datos sintéticos de razonamiento matemático: la estrategia de muestreo múltiple con voto de mayoría (K = 10, T = 0,7) puede reutilizarse para producir soluciones candidatas y filtrar por consistencia antes de usarlas como datos de entrenamiento.
- Tutoría automática de problemas con figura: en un prototipo de asistente educativo, el modelo recibiría el enunciado y la imagen y devolvería un desarrollo paso a paso con la respuesta final delimitada; es adecuado porque su evaluación se hizo exactamente en ese formato, aunque requiere validación humana por el riesgo de error aritmético.
- Análisis de gráficos y tablas en documentos técnicos: para extraer magnitudes y resolver preguntas cuantitativas sobre figuras, el modelo cubre la combinación imagen + texto y admite contextos de generación largos en inferencia, pero su uso en producción exigiría resolver antes la ausencia de licencia.
- Línea base en infraestructura de RL: dado que el coste de entrenamiento está documentado (23 h 27 min en 4 A100 para 640 pasos con lote efectivo 120), sirve para dimensionar presupuestos de cómputo en proyectos de RL multimodal.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MathVista-150 (holdout interno) | 0,678 de accuracy en el paso 640 | Seleccion best-by-val; coincide con el checkpoint de fin de época |
| MathVista (protocolo v2) | No disponible en la informacion proporcionada | Se declara el protocolo, pero no las cifras |
| MathVision (protocolo v2) | No disponible en la informacion proporcionada | Se declara el protocolo, pero no las cifras |
| MathVerse (protocolo v2) | No disponible en la informacion proporcionada | Se declara el protocolo, pero no las cifras |
| We-Math (protocolo v2) | No disponible en la informacion proporcionada | Se declara el protocolo, pero no las cifras |
| AVG4 (media de los cuatro anteriores) | No disponible en la informacion proporcionada | El autor menciona la existencia de tablas para un paper, sin publicar los valores |
| MMLU, HumanEval, GSM8K u otros | No disponible | No se han publicado resultados en la informacion disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El único dato numérico verificable es el 0,678 sobre un holdout de 150 ejemplos, una muestra pequeña cuya incertidumbre estadística es alta.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para los pesos de un modelo de ~8B, más el codificador visual, las activaciones y la caché KV; en la práctica conviene reservar 22-26 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-11 GB de pesos más sobrecarga.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-7 GB de pesos más sobrecarga, siempre que se genere la quantización (no hay versiones publicadas).
- GPU recomendadas: A100 40 GB u 80 GB y H100 80 GB para bf16 sin recortes y para reproducir el entrenamiento (el job original usó 4 × A100). En consumer, RTX 4090 o RTX 3090 de 24 GB pueden alojar el modelo en bf16 de forma ajustada; RTX 4070 Ti Super (16 GB) o similares son más realistas en 8 bits; RTX 3060 12 GB o inferiores, solo en 4 bits.
- Compatibilidad con GPU de consumo: sí, con matices; en bf16 cabe en tarjetas de 24 GB pero con poco margen para contextos largos (el protocolo de evaluación usa 16 000 tokens), lo que desplaza la recomendación hacia cuantización o hacia GPUs de 40 GB o más.
- Opciones de despliegue: transformers con safetensors es la vía directa; vLLM o TGI requerirían comprobar que soportan la arquitectura de InternVL3.5 (posible necesidad de trust_remote_code). No hay archivos GGUF publicados, por lo que llama.cpp u Ollama exigirían una conversión previa propia.
- Latencia y throughput: no disponible. El único dato de cómputo documentado es de entrenamiento: 640 pasos con lote efectivo 120 en 4 × A100 durante 23 h 27 min.
- Almacenamiento: 17,1 GB de repositorio para los checkpoints publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mllm-open-r1-ttrl-internvl35-8b-mmupt-full | ~8B (inferido del nombre) | No disponible | MathVista-150 holdout: 0,678; AVG4 no publicado | No disponible | safetensors, 17,1 GB, 0 descargas |
| InternVL3.5-8B (modelo base declarado) | 8B segun el nombre | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Modelo base de referencia del ajuste |
| Qwen2.5-VL-7B (columna de referencia del script examples/mmr1_qwen25vl7b_gt_mmupt.sh) | 7B segun el nombre | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Se usa como receta paralela en la misma tuberia del autor |

La comparación cuantitativa no es posible con los datos disponibles: la información proporcionada identifica los modelos de referencia, pero no incluye cifras de rendimiento de ninguno de ellos. Cualquier afirmación sobre superioridad o paridad sería especulativa.

## Limitaciones y advertencias
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; es un bloqueante para cualquier despliegue en producción.
- Sin resultados de benchmarks publicados: solo existe un 0,678 sobre un holdout de 150 ejemplos, sin cifras de MathVision, MathVerse, We-Math ni AVG4, y sin comparación con el modelo base.
- Riesgo de alucinación en razonamiento matemático: el autoetiquetado por voto de mayoría puede reforzar respuestas incorrectas si el modelo converge de forma consistente hacia un error, ya que no hay verificación con respuesta ground truth durante el bucle TTRL.
- Selección de checkpoint con muestra pequeña: best-by-val se decide sobre 150 ejemplos, lo que hace que la elección sea sensible al ruido y pueda no reflejar la capacidad real.
- Desajuste entre entrenamiento e inferencia: el entrenamiento limita las completaciones a 2 048 tokens mientras el protocolo de evaluación permite 16 000, lo que puede degradar la calidad en razonamientos largos no vistos durante el ajuste.
- Idiomas no declarados: el corpus OpenR1 es mayoritariamente en inglés; no hay evidencia de calidad en castellano ni en otras lenguas.
- Sesgos: no hay documentación sobre composición del dataset, filtrado ni evaluación de sesgos; al ser un ajuste sobre datos matemáticos, los sesgos heredados del modelo base InternVL3.5-8B permanecen sin cuantificar.
- Incoherencias en la propia model card: se citan dos ventanas de entrenamiento distintas (2026-09-03..09-05 y el job del 11 al 12 de septiembre de 2026) y rutas locales del clúster que no son reproducibles desde fuera.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin validación por parte de terceros.
- Compatibilidad de despliegue incierta: no hay GGUF ni integración declarada en vLLM, TGI, Ollama o llama.cpp, lo que puede exigir trabajo de conversión y verificación de la arquitectura.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/logan7000/mllm-open-r1-ttrl-internvl35-8b-mmupt-full
- Script de referencia citado en la model card: examples/mmr1_qwen25vl7b_gt_mmupt.sh (columna InternVL), sin URL publica disponible
- Rutas locales citadas por el autor, no accesibles publicamente: /weka/scratch/jhu/dssg2026-ext-rghani1/yyang331/mllm-repro-out/mllm-co-grpo-dp/openr1_internvl35_8b_ttrl_mmupt
- Paper, blog, repositorio o demo asociados: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a listas de palabras bloqueadas para bots de Discord y a la documentacion de Carl-bot, sin relacion con el modelo.
