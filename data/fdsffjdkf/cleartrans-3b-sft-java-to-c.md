# fdsffjdkf/ClearTrans-3B-SFT-Java-to-C

## Resumen

ClearTrans-3B-SFT-Java-to-C es un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen/Qwen2.5-Coder-3B, especializado en una única dirección de traducción de código: de Java a C. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo objetivo es la traducción automática de código entre lenguajes de programación mediante modelos de lenguaje de tamaño medio. El modelo conserva la arquitectura transformer decoder-only del base, con 3.085.938.688 parámetros totales (aproximadamente 3,1 mil millones).

La relevancia del checkpoint es acotada y muy específica: no es un modelo generalista, sino un artefacto de investigación orientado a reproducir un experimento concreto de traducción Java a C. La model card es explícita al señalar que se trata de un checkpoint SFT y no de un checkpoint final entrenado con GRPO, y que no se le atribuye ninguna puntuación de benchmark del manuscrito asociado. Además, el autor advierte de que la inferencia en GPU y la reproducción de benchmarks no han sido validadas para esta release, que ha pasado únicamente comprobaciones de tamaño de fichero, disposición de tensores e índices de shards.

El modelo se distribuye bajo la licencia Qwen Research License Agreement, lo que restringe su uso a investigación y evaluación no comercial. El repositorio ocupa 6,8 GB y contiene pesos en safetensors junto con tokenizer y plantilla de chat, pero no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluación históricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tag `qwen2`) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin cuantizaciones oficiales |
| Idiomas soportados | no disponible (la model card no documenta cobertura lingüística; el foco es código Java y C) |
| Licencia | Qwen Research License Agreement (no comercial, investigación y evaluación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2 con 3,1 mil millones de parámetros, y se ha sometido a un ajuste fino supervisado completo (full SFT, no LoRA) sobre un dataset específico de dirección Java a C identificado en la metadata como `train_full_1231_java2c_idx3`. La metadata de entrenamiento registra una tasa de aprendizaje de 1e-5, batch size total de 64 (1 por dispositivo, 8 dispositivos, 8 pasos de acumulación de gradiente), 3 épocas, optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno y semilla 42. El entrenamiento se ejecutó en configuración multi-GPU con 8 dispositivos.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. El autor indica explícitamente que el checkpoint es SFT y no establece que sea un checkpoint final entrenado con GRPO, lo que sugiere que el pipeline ClearTrans contempla una etapa posterior de GRPO que este artefacto no incorpora. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo hereda la arquitectura estándar del base.

## Capacidades

- Traducción de código dirigida de Java a C: es la capacidad principal y prácticamente exclusiva para la que fue ajustado el checkpoint.
- Generación de texto y código en formato conversacional: el repositorio incluye plantilla de chat y tokenizer, y el pipeline declarado es `text-generation`.
- Razonamiento sobre código Java de entrada y producción de equivalentes en C, dentro del dominio de los ejemplos de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se documenta para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponibles; la model card no detalla cobertura de idiomas naturales.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se documentan.

## Casos de uso

- Migración asistida de módulos Java a C en proyectos de investigación: el modelo puede generar borradores de traducción para funciones y estructuras de datos Java, que luego se revisan y corrigen manualmente. Es adecuado porque está ajustado específicamente en esa dirección, aunque requiere validación con tests.
- Reproducción de experimentos académicos sobre traducción de código: sirve como checkpoint de referencia dentro del artefacto ClearTrans para replicar el pipeline SFT descrito en el repositorio GitHub asociado.
- Generación de datasets sintéticos de pares Java-C: las salidas del modelo pueden filtrarse y usarse como material de partida para construir corpus de traducción, siempre con revisión y pruebas automatizadas.
- Estudio de degradación y errores en traducción automática de código: al ser un modelo pequeño y de dirección única, es útil para analizar qué tipos de construcciones Java se traducen mal a C (gestión de memoria, excepciones, genéricos) en entornos controlados.
- Prototipado rápido en entornos de investigación con recursos limitados: sus 3,1 mil millones de parámetros permiten ejecutarlo en una sola GPU consumer para experimentos exploratorios, sin necesidad de infraestructura de gran escala.
- Evaluación comparativa de estrategias de ajuste fino: al publicarse la metadata completa de entrenamiento (learning rate, batch, épocas, optimizador), puede emplearse como punto de comparación frente a otros SFT sobre el mismo base para estudiar el efecto de distintas configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se atribuye ninguna puntuación de benchmark del manuscrito a este checkpoint y que la reproducción de benchmarks no ha sido validada para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 8 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB para pesos; en 4 bits, aproximadamente 2-2,5 GB, aunque el repositorio no publica cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090, RTX 3090 o RTX A6000 para fp16 con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más en fp16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en tarjetas con 8 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (versión compatible con la metadata de entrenamiento, Transformers 4.57.1 y PyTorch 2.9.1), text-generation-inference (tag `text-generation-inference`), y endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp y Ollama no se documentan para este checkpoint.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Java-to-C | 3,1 B | no disponible | Traduccion Java a C (SFT) | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B (base) | 3,1 B | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 (upstream) | Hugging Face, ampliamente usado |
| ClearTrans (otros checkpoints del artefacto) | no disponible | no disponible | Otras direcciones de traduccion | Qwen Research | Repositorio GitHub del proyecto |

La comparación más directa es con el modelo base Qwen2.5-Coder-3B, del que hereda arquitectura y tamaño pero del que difiere en el ajuste fino específico y en la licencia resultante (la release derivada queda bajo Qwen Research, no bajo Apache 2.0). No se dispone de información sobre otros modelos especializados en traducción Java-C con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda evaluar las salidas con los tests y herramientas de análisis previstos antes de confiar en ellas.
- Licencia Qwen Research License Agreement: uso restringido a investigación y evaluación no comercial. No se relicencia bajo MIT ni Apache 2.0, lo que impide su uso comercial directo.
- El checkpoint es SFT y no un modelo final entrenado con GRPO; no debe interpretarse como el resultado completo del pipeline ClearTrans.
- No se han validado inferencia en GPU ni reproducción de benchmarks para esta release; solo se han comprobado tamaño de fichero, disposición de tensores e índices de shards.
- No se incluyen datos de entrenamiento, estados del optimizador ni salidas de evaluación históricas en el repositorio, lo que limita la reproducibilidad completa.
- El nombre del dataset (`train_full_1231_java2c_idx3`) no verifica por sí solo la procedencia ni el procedimiento de reconstrucción de los datos.
- Especialización muy estrecha: el rendimiento fuera de la dirección Java a C no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar APIs o construcciones de C inexistentes o semánticamente distintas de las originales en Java.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas; la model card no especifica ventana de contexto ni cobertura lingüística.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Java-to-C
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio del proyecto ClearTrans: https://github.com/Xingzhehu/ClearTrans
- Licencia (incluida en el repositorio del modelo): LICENSE
- Aviso de atribución y modificaciones: NOTICE
