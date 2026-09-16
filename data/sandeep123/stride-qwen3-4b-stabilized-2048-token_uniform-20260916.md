# sandeep123/stride-qwen3-4b-stabilized-2048-token_uniform-20260916

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Lo publica el usuario sandeep123 y corresponde a un experimento de ablación del método STRIDE, en el que el bonus de diversidad de cada respuesta se distribuye de forma uniforme entre sus tokens elegibles. El entrenamiento se realizó con GRPO sobre un split de 2.048 preguntas matemáticas, con el modo de pensamiento desactivado de forma explícita (`enable_thinking=False`).

El objetivo declarado es estudiar la estabilidad del entrenamiento con refuerzo aplicando varias técnicas a la vez: una tasa de aprendizaje máxima de 2e-5 con 10 actualizaciones de warmup lineal seguida de tasa constante, y un coeficiente KL de 0,01 frente a la política inicial congelada usando el estimador k3 original de GRPO. La relevancia actual es metodológica más que de rendimiento: sirve como material reproducible para investigar cómo afectan el warmup, el KL y el reparto del bonus de diversidad a la deriva de política en RL sobre modelos pequeños.

Se trata de un adaptador de inferencia portable (rango LoRA 16, alpha 32, dropout 0, sin bias, sobre los módulos q/k/v/o y gate/up/down). El repositorio conserva cada actualización del optimizador publicada, incluida la actualización cero (adaptador inicial sin entrenar), y no incluye los pesos del modelo base, que está fijado al commit `cdbee75f17c01a7cc42f958dc650907174af0554`. La model card indica explícitamente que no se formula ninguna afirmación de evaluación ni de superioridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA de tipo PEFT |
| Parametros totales | 4B en el modelo base (Qwen3-4B-Instruct-2507); el número exacto de parámetros del adaptador no está disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base en la información proporcionada; el entrenamiento limitó prompt más respuesta a 8.192 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors y no documenta cuantizaciones propias |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base no se incluye en el repositorio |
| Tamano del repositorio | 0,4 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (commit `cdbee75f17c01a7cc42f958dc650907174af0554`) |
| Configuracion LoRA | Rango 16, alpha 32, dropout 0, sin bias, modulos q/k/v/o y gate/up/down |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El adaptador se inicializa desde cero sobre el modelo base fijado y no es continuación de un adaptador previamente entrenado. El ajuste se realiza con GRPO sobre un split de 2.048 preguntas matemáticas, con un batch global de 64 preguntas y ocho rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas para 4 épocas, con semilla 42. La ventana de prompt más respuesta está limitada a 8.192 tokens. El tokenizador y la plantilla de chat se mantienen sin cambios y congelados.

La innovación concreta es la ablación STRIDE: el bonus de diversidad de cada respuesta se reparte uniformemente entre sus tokens elegibles, con un alpha STRIDE de 1, independiente del alpha 32 de LoRA. GRPO no utiliza el bonus de diversidad de STRIDE. El componente de estabilización incluye una tasa de aprendizaje máxima de 2e-5 con 10 actualizaciones de warmup lineal (la actualización 1 usa 2e-6 y la 10 alcanza 2e-5) seguida de tasa constante, y un coeficiente KL de 0,01 que penaliza la deriva respecto a la política base congelada mediante el estimador k3 original `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la pérdida de política. La model card aclara que esta implementación no incluye corrección por ratio de importancia y no reclama un gradiente exacto e insesgado de KL inversa. El entrenamiento se ejecuta con representación no-thinking (`enable_thinking=False`).

Cada carpeta `checkpoint-NNNNNN/` contiene pesos safetensors de PEFT, configuración del adaptador, tokenizador y plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256. La reanudación exacta del run original requiere además los ficheros locales `state_NNN` de optimizador y RNG; el último par de reanudación de la época completada se publica en `latest-resume/`, con estado del optimizador Adam, RNG por rango, el adaptador correspondiente, el contrato científico original y el inventario de hashes.

## Capacidades

- Generación de texto y resolución de problemas matemáticos en modo no-thinking, con respuestas directas y sin cadena de pensamiento explícita.
- Razonamiento matemático ajustado mediante refuerzo sobre 2.048 preguntas, orientado a obtener la respuesta final correcta.
- Inferencia con adaptador portable sobre el modelo base fijado, cargable con `transformers` más `peft`.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (generación general, instrucciones y código), si bien no están documentadas ni evaluadas en este repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta ni se evalúa).
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento fuerza el modo no-thinking, lo que reduce el razonamiento extenso.
- Capacidades multilingües: no disponibles como dato; el ajuste se realiza únicamente sobre preguntas matemáticas y sin información de composición lingüística.
- Capacidades multimodales o de audio: no disponibles.
- Reanudación de entrenamiento y entrenamiento adicional del adaptador con `is_trainable=True` y un optimizador inicializado de nuevo.

## Casos de uso

- Evaluación de métodos de RL para matemáticas: el repositorio permite reproducir la ablación STRIDE con reparto uniforme del bonus de diversidad y compararla con los otros runs de STRIDE, aislando el efecto del esquema de reparto de recompensa.
- Estudio de estabilidad de entrenamiento con KL: el coeficiente 0,01 y el estimador k3 permiten analizar la deriva de política respecto al modelo base congelado en un entorno controlado y de bajo coste computacional.
- Generación de soluciones matemáticas en modo no-thinking: útil en pipelines donde se prioriza latencia y número de tokens frente a cadenas de razonamiento largas, por ejemplo en evaluación masiva de problemas con corrección automática posterior.
- Banco de pruebas de adaptadores por checkpoint: al conservarse cada actualización del optimizador, incluida la actualización cero sin entrenar, se puede medir la evolución del comportamiento a lo largo del entrenamiento y detectar sobreajuste o degradación.
- Punto de partida para ajuste posterior: el adaptador admite `is_trainable=True` con un optimizador nuevo, de modo que sirve como inicialización para experimentos de RL adicionales sin repetir el coste del entrenamiento previo.
- Investigación sobre modos de pensamiento: dado que el entrenamiento fija `enable_thinking=False` y la plantilla queda congelada, resulta adecuado para estudiar el comportamiento no-thinking y compararlo con el modo thinking del modelo base.
- Despliegue en hardware modesto para tareas de matemáticas: al ser un adaptador de 0,4 GB sobre un modelo de 4B, se puede servir en GPUs de consumo para procesamiento por lotes de problemas matemáticos con requisitos de latencia moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explícita que no se realiza ninguna evaluación ni se formula ninguna afirmación de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio de la demostración.

## Requisitos de hardware

- El adaptador no se puede ejecutar de forma autónoma: requiere cargar el modelo base Qwen/Qwen3-4B-Instruct-2507 en el commit fijado.
- VRAM estimada para el modelo base en bf16: aproximadamente 8 GB solo para los pesos de 4B parámetros, más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 10-12 GB.
- VRAM estimada en cuantización de 8 bits: del orden de 4-5 GB; en 4 bits: del orden de 2,5-3 GB. Estas cifras son estimaciones a partir del tamaño de parámetros y no están documentadas en el repositorio.
- GPUs recomendadas: A100, H100 o L40S para servicio en paralelo; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para inferencia en bf16; GPUs de 6-8 GB solo con cuantización agresiva del modelo base.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 16 GB o más, y en cuantización de 4 u 8 bits en tarjetas de gama media.
- Opciones de despliegue: `transformers` con `peft` es la vía documentada por el autor; también es viable servir el modelo base con soporte de adaptadores LoRA (por ejemplo vLLM o TGI con adaptadores), o fusionar el adaptador con el modelo base y convertirlo a GGUF para llama.cpp u Ollama, procedimiento que no está documentado en el repositorio.
- El repositorio ocupa 0,4 GB porque incluye todos los adaptadores publicados, no solo uno; al descargar conviene filtrar la carpeta del checkpoint concreto mediante `allow_patterns`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sandeep123/stride-qwen3-4b-stabilized-2048-token_uniform-20260916 | Adaptador LoRA sobre base de 4B | Entrenamiento limitado a 8.192 tokens | Sin evaluación publicada | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | No disponible en la información proporcionada | Sin datos en esta información | No disponible en la información proporcionada | HuggingFace, commit fijado por el adaptador |
| Otros adaptadores PEFT de matemáticas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos comparativos de rendimiento con otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada no hay autorización explícita de uso comercial; conviene tratar el artefacto como no apto para producción hasta aclarar este punto.
- Ausencia total de evaluación: no hay benchmarks ni validación humana publicados, y la model card renuncia expresamente a cualquier afirmación de superioridad.
- Riesgo de alucinación en matemáticas: la model card advierte que una respuesta final correcta no verifica cada paso intermedio de la demostración, por lo que las soluciones pueden contener pasos inválidos con resultado correcto.
- Entrenamiento exclusivamente no-thinking: el modo thinking no está entrenado y su comportamiento no está caracterizado; además, es obligatorio pasar `enable_thinking=False` en inferencia, algo crítico en plantillas cuyo valor por defecto activa el pensamiento.
- Volumen de datos reducido: 2.048 preguntas matemáticas y 128 actualizaciones planificadas, con 4 épocas, lo que aumenta el riesgo de sobreajuste al split y de olvido catastrófico de otras capacidades del modelo base.
- Cobertura de contexto limitada durante el entrenamiento: prompt más respuesta se limita a 8.192 tokens, por lo que no se ha entrenado con ventanas mayores.
- Idiomas y composición del dataset: no se documentan; no hay garantía de comportamiento multilingüe ni de generalización fuera del dominio matemático.
- Estado del entrenamiento incierto: la model card indica que las épocas planificadas no implican que el entrenamiento haya finalizado; la finalización real debe comprobarse en `checkpoint_index.json`.
- Dependencia fuerte del base: el adaptador requiere el commit exacto del modelo base; usar otra revisión puede alterar el comportamiento de forma no documentada.
- Artefacto sin adopción: cero descargas y cero likes, sin validación por parte de terceros.
- El ADN del experimento es metodológico: su valor está en el estudio de estabilidad y no en el rendimiento final del modelo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-token_uniform-20260916
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían al portal de árbitros de la federación alemana de balonmano y no guardan relación con este artefacto.
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
