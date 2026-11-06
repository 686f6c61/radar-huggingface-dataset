# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch10

## Resumen

El modelo `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch10` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario g-assismoraes como parte de un experimento de *machine unlearning*: el objetivo es eliminar de forma selectiva el conocimiento asociado a un subconjunto de datos (la partición "forget10") sin degradar el rendimiento sobre el resto (partición "retain").

La técnica aplicada es una combinación de *Input Head Loss* (IHL) sobre las muestras a olvidar con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre las muestras a retener, durante 10 de las 20 épocas previstas. Los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Se distribuye como checkpoint completo autónomo (no como delta de adaptadores) con pesos en `safetensors` y requiere `custom_code` para su carga.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB, es un modelo pequeño orientado exclusivamente a inglés, pensado para reproducir y auditar metodologías de desaprendizaje, no para uso en producción general. Su relevancia actual radica en el creciente interés regulatorio por el "derecho al olvido" en modelos entrenados con datos personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` para la carga |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors` sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamaño del repositorio | 2,8 GB |
| Epoca del checkpoint | 10 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros con atención causal estándar. El checkpoint no introduce cambios estructurales; lo que varía respecto al modelo base es el procedimiento de ajuste. Según la model card, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen congelados desde `locuslab/tofu_ft_phi-1.5`.

El entrenamiento aplica una pérdida combinada: *Input Head Loss* (IHL) sobre las muestras de la partición "forget" más una entropía cruzada con coeficiente 1.0 sobre las muestras de la partición "retain". El objetivo es desaprender el conjunto "forget10" de TOFU preservando el comportamiento sobre "retain". El checkpoint corresponde a la época 10 de un total de 20. Los detalles completos del manifiesto se encuentran en el archivo `ihl_manifest.json` del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general (capacidad residual del modelo base).
- Generación de código y matemáticas elementales, propias del preentrenamiento de Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No dispone de visión, audio ni modo "thinking" explícito.
- Su función principal es servir como artefacto de evaluación de desaprendizaje: se espera que haya "olvidado" la partición forget10 de TOFU.

## Casos de uso

- Investigación en *machine unlearning*: reproducir el protocolo IHL + CE sobre TOFU y comparar la época 10 con las épocas intermedias y finales para estudiar la curva de olvido.
- Auditoría de privacidad: evaluar si el modelo aún memoriza o filtra información de la partición forget10 mediante ataques de extracción y compararlo con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Benchmarking de metodologías de desaprendizaje: usar el checkpoint como referencia frente a otras técnicas (gradient ascent, KL regularization, etc.) sobre el mismo modelo base.
- Estudio de la degradación de capacidades: medir la pérdida de rendimiento en tareas generales (perplejidad en retain, exactitud en QA) tras el reinicializado de embeddings y cabeza LM.
- Docencia y formación: material práctico para cursos sobre ética de la IA y cumplimiento del derecho al olvido en modelos entrenados con datos personales.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo, permite repetir evaluaciones sin necesidad de reentrenar, siempre que se disponga del código personalizado del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 4-6 GB en total según longitud de contexto).
- VRAM estimada en FP32: alrededor de 5,7 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 o H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM en FP16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por la etiqueta `custom_code`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato `safetensors` sin GGUF dificulta su uso en `llama.cpp` sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch10 | 1.418 M | no disponible | apache-2.0 | Desaprendizaje (IHL + CE) sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | no disponible | Ajuste fino sobre TOFU (modelo base del anterior) |
| microsoft/phi-1_5 | 1.300 M | 2.048 tokens (referencia pública) | MIT (referencia pública) | Modelo de lenguaje para código y razonamiento básico |
| locuslab/tofu_llama2-7b | 7.000 M | 4.096 tokens (referencia pública) | no disponible | Desaprendizaje sobre TOFU con Llama 2 |

La comparación con `locuslab/tofu_llama2-7b` es relevante porque TOFU se publicó originalmente con Llama 2 como modelo de referencia; el checkpoint aquí descrito traslada el mismo protocolo a un modelo mucho más pequeño (Phi-1.5), lo que reduce drásticamente los requisitos de cómputo a costa de capacidad.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Riesgo de alucinación: elevado, como en cualquier modelo de 1.400 M de parámetros; el reinicializado de embeddings y cabeza LM puede agravarlo.
- Sesgos: hereda los sesgos de Phi-1.5 y de los datos de TOFU; no se documenta ninguna mitigación.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia apache-2.0, lo que permite uso comercial según los términos de la licencia, pero el modelo base `locuslab/tofu_ft_phi-1.5` no especifica licencia en la información disponible, por lo que conviene verificar la cadena de licencias antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del autor del repositorio; auditar el código antes de usarlo en entornos sensibles.
- El "olvido" del conjunto forget10 no está verificado en la información disponible: no se aportan métricas de forget quality ni de retain quality, por lo que no puede afirmarse que el desaprendizaje sea efectivo.
- Checkpoint intermedio (época 10 de 20): puede presentar un equilibrio distinto entre olvido y retención que la versión final.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
