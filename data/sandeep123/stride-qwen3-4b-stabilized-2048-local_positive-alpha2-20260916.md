# sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha2-20260916

## Resumen

El modelo `sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha2-20260916` no es un modelo completo, sino un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, que se mantiene congelado y fijado en el commit `cdbee75f17c01a7cc42f958dc650907174af0554`. Lo publica el usuario `sandeep123` como artefacto de un experimento de aprendizaje por refuerzo orientado a matemáticas y a razonamiento en modo "nonthinking" (sin cadena de pensamiento explícita). El repositorio contiene exclusivamente los pesos del adaptador, la configuración, el tokenizador, la plantilla de chat, metadatos de entrenamiento y manifiestos SHA256.

El interés técnico del artefacto reside en su metodología de entrenamiento, no en una mejora de capacidades demostrada. El autor aplica STRIDE (crédito de diversidad por paso, no negativo, sobre tokens de razonamiento elegibles) combinado con GRPO, e introduce un coeficiente KL de 0,01 con estimador k3 sin corrección de ratio de importancia, una tasa de aprendizaje máxima de 2e-5 con 10 actualizaciones de warmup lineal y un plan de 4 épocas sobre un split de 2.048 preguntas. El objetivo declarado es investigar estabilidad de entrenamiento; el propio autor indica explícitamente que no formula ninguna afirmación de evaluación ni de superioridad.

Es relevante ahora como registro reproducible dentro de la línea de experimentos STRIDE: cada actualización del optimizador se publica como commit inmutable independiente, se incluyen el adaptador inicial no entrenado (update zero) y un par de reanudación completo en `latest-resume/`. No obstante, el modelo tiene 0 descargas y 0 likes, no incluye código de entrenamiento y no aporta datos de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso decoder-only (modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; adaptador LoRA con rango 16 (tamaño del repo: 0,4 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens como límite de prompt más respuesta durante el entrenamiento; el contexto nativo del modelo base no se declara en la ficha del adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; se publica en safetensors PEFT sin cuantizar. El modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ), no documentadas en esta ficha |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos PEFT/LoRA), más `adapter_config`, tokenizador, plantilla de chat y manifiesto SHA256 por checkpoint |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, con dropout 0 y sin sesgo, aplicado sobre los módulos de proyección q, k, v y o, además de gate, up y down. Los pesos se inicializan desde cero (no es continuación de un adaptador anterior) sobre el modelo base congelado. La tokenización y la plantilla de chat se mantienen idénticas a las del base y el entrenamiento se renderiza explícitamente con `enable_thinking=False`, registrado como `thinking_mode: false` en el contrato científico; se exige usar la misma palabra clave explícita en inferencia, algo especialmente crítico en Qwen3-1.7B, cuya plantilla por defecto activa el modo thinking.

El procedimiento de entrenamiento combina STRIDE, con crédito de diversidad de paso local no negativo sobre tokens de razonamiento elegibles y un alpha STRIDE de 2 (independiente del alpha 32 de LoRA), y GRPO, que no utiliza el bono de diversidad de STRIDE. El plan es de 4 épocas sobre el mismo split de 2.048 preguntas empleado en ejecuciones STRIDE previas, con lote global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas. La semilla es 42 y el contexto de prompt más respuesta se limita a 8.192 tokens.

La configuración de optimización busca estabilidad: tasa de aprendizaje máxima de 2e-5, 10 actualizaciones de warmup lineal (la actualización 1 usa 2e-6 y la 10 alcanza 2e-5) y después tasa constante, con warmup indexado por actualizaciones completadas para que la reanudación exacta no lo reinicie. Se añade un coeficiente KL de 0,01 que penaliza la deriva respecto a la política base congelada mediante el estimador k3 `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la pérdida de política. El autor señala que se trata de la implementación original k3 de GRPO, sin corrección de ratio de importancia, y que no pretende un gradiente insesgado de KL inversa exacta. El código de entrenamiento no se publica.

## Capacidades

- Generacion de texto: el adaptador es un modelo de generación de texto causal sobre el base Qwen3-4B-Instruct-2507.
- Razonamiento matemático: el entrenamiento se orienta explícitamente a resolución de problemas matemáticos (`Solve the supplied mathematical problem`), con RL sobre respuestas verificables por respuesta final correcta.
- Modo nonthinking: el entrenamiento fuerza `enable_thinking=False`, por lo que está diseñado para responder sin cadena de pensamiento explícita.
- Tool calling / function calling: no documentado en la ficha del adaptador; hereda lo que ofrezca el modelo base.
- Agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Capacidades especiales: ninguna adicional (sin visión, audio ni thinking mode). El modo thinking está explícitamente desactivado.
- Reanudación de entrenamiento: el par `latest-resume/` incluye estado del optimizador Adam, RNG por rango, adaptador correspondiente y contrato científico, lo que permite continuar el entrenamiento, no una capacidad de inferencia.

## Casos de uso

- Reproducción de experimentos de RL sobre razonamiento matemático: el repositorio publica cada actualización del optimizador como commit inmutable, con índice de checkpoints y manifiestos SHA256, de modo que un equipo de investigación puede aislar el efecto de una actualización concreta sobre el comportamiento del modelo.
- Estudio controlado de la penalización KL en GRPO: el coeficiente KL de 0,01 con estimador k3 y warmup de 10 pasos está documentado en los metadatos de cada checkpoint, lo que permite analizar la deriva respecto a la política base a lo largo de las 128 actualizaciones planificadas.
- Investigación sobre diversidad de pasos en razonamiento: STRIDE con alpha 2 sobre tokens elegibles es el objeto del experimento; los adaptadores publicados permiten comparar la diversidad de las soluciones generadas frente a una ejecución GRPO pura.
- Ajuste de dominios matemáticos sobre un modelo compacto: al ser un adaptador PEFT sobre un modelo de 4.000 millones de parámetros, se puede fusionar con el base y desplegar en una sola GPU consumer para tareas acotadas de resolución de problemas aritméticos o algebraicos.
- Base para nuevas iteraciones de RL: el autor indica que `is_trainable=True` permite seguir entrenando el adaptador con un optimizador reinicializado, útil para extender el plan más allá de 4 épocas (requiere `--allow-epoch-extension`).
- Auditoría de artefactos de investigación reproducibles: el flujo de publicación atómica, verificación remota de tamaños y hashes, y exclusión de preguntas de entrenamiento y credenciales, sirve como plantilla para publicar adaptadores con trazabilidad verificable.
- Evaluación comparativa de métodos de RL en modelos pequeños: dado que el autor no publica evaluación, este adaptador es útil como entrada para que terceros realicen su propia comparación contra el base, no como componente listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no formula ninguna afirmación de evaluación ni de superioridad, y advierte que las respuestas finales correctas no verifican cada paso intermedio de la demostración.

## Requisitos de hardware

- VRAM para inferencia: el adaptador LoRA ocupa aproximadamente 0,4 GB (tamaño del repo). Se debe sumar el modelo base: en bfloat16, un modelo de 4.000 millones de parámetros requiere del orden de 8-9 GB de VRAM, más el coste de caché KV; en cuantización de 4 bits, aproximadamente 3-4 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 permiten cargar el base en bfloat16 con margen. Para cuantización de 4 bits, bastan GPU consumer de 8-12 GB.
- ¿Cabe en GPU consumer?: sí. Con el base en 4 bits, una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 son suficientes para inferencia del adaptador fusionado. En bfloat16 se recomienda al menos 16 GB.
- Opciones de despliegue: `transformers` + `peft` es la vía oficial documentada en la model card (`PeftModel.from_pretrained` con `is_trainable=False`). vLLM y TGI admiten adaptadores LoRA en caliente. Para llama.cpp u Ollama es necesario fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stride-qwen3-4b-stabilized-2048-local_positive-alpha2 (este) | Adaptador LoRA sobre base de ~4B | 8.192 tokens en entrenamiento | Adaptador PEFT para RL matemático | no disponible | 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | No declarado en esta ficha | Modelo completo denso, instruido | Apache 2.0 (según el repositorio del base) | Ampliamente disponible |
| Llama-3.2-3B-Instruct | ~3B | No declarado en esta ficha | Modelo completo denso, instruido | Licencia comunitaria Llama | Ampliamente disponible |
| Gemma-3-4B-IT | ~4B | No declarado en esta ficha | Modelo completo denso, instruido, multimodal | Licencia Gemma | Ampliamente disponible |

La comparación de rendimiento no es posible: el adaptador no publica benchmarks y el autor renuncia explícitamente a cualquier afirmación de superioridad frente al base u otras alternativas. La diferencia principal respecto a los otros modelos de la tabla es de naturaleza, no de escala: este artefacto es un adaptador de investigación dependiente de un base concreto y fijado por commit, no un modelo desplegable de forma autónoma.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar del base Qwen3-4B-Instruct-2507, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: el autor advierte que una respuesta final correcta no verifica cada paso intermedio de la demostración, por lo que el modelo puede producir cadenas de razonamiento con pasos inválidos que conduzcan a un resultado correcto por casualidad.
- Entrenamiento incompleto: el plan es de 4 épocas y 128 actualizaciones, pero la finalización se determina por las entradas reales en `checkpoint_index.json`. Las épocas planificadas no implican que el entrenamiento haya terminado. El repositorio incluye la actualización cero (adaptador inicial sin entrenar).
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento multilingüe.
- Contexto: el entrenamiento limita prompt más respuesta a 8.192 tokens, independientemente del contexto nativo del base. No se declara el contexto del adaptador en la ficha.
- Licencia: no disponible. Sin licencia declarada no se puede asumir permiso de uso comercial; la licencia del adaptador no tiene por qué coincidir con la del modelo base.
- Modo thinking: está desactivado durante el entrenamiento. Usar la plantilla por defecto que habilita thinking (por ejemplo, en Qwen3-1.7B) en inferencia puede degradar el comportamiento respecto al que se entrenó.
- Reproducción: el código de entrenamiento no se publica y las preguntas de entrenamiento, rollouts y credenciales están excluidos. La reproducción completa exige las topologías, el entorno y el estado de reanudación exactos.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, sin validación externa. No se recomienda como componente de producción.
- Corrección técnica declarada: el autor reconoce que la implementación k3 usada no incorpora corrección de ratio de importancia y no constituye un gradiente insesgado de KL inversa exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha2-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Commit fijado del modelo base: `cdbee75f17c01a7cc42f958dc650907174af0554`
- Carpeta de reanudación: `latest-resume/` dentro del repositorio (contiene `RESUME.md` y `latest_resume.json`)
- Índice de checkpoints: `checkpoint_index.json` dentro del repositorio
- Paper, blog o demo de STRIDE: no disponible en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (corresponden a oficinas de la Uprava za indirektno oporezivanje en Tuzla, Bosnia y Herzegovina) y no se han incluido como enlaces relevantes.
