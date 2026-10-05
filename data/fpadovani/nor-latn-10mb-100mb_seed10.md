# fpadovani/nor-latn-10mb-100mb_seed10

## Resumen

nor-latn-10mb-100mb_seed10 es un ajuste fino supervisado (SFT) del modelo monolingüe noruego goldfish-models/nor_latn_10mb, publicado por el usuario fpadovani (Universidad de Groninga, a juzgar por el espacio de trabajo de Weights & Biases asociado) y entrenado con la librería TRL. Se trata de un modelo pequeño, de 39.087.104 parámetros, con arquitectura de tipo GPT-2 (transformer decoder-only) y pesos en safetensors.

El modelo parte de un checkpoint de la familia Goldfish, que agrupa modelos lingüísticos monolingües entrenados con volúmenes de datos escalonados (10 MB, 100 MB, 1 GB) para más de un centenar de idiomas. El sufijo del nombre sugiere que el ajuste se realizó sobre un corpus de 100 MB a partir del checkpoint de 10 MB, con la semilla 10, dentro de un proyecto centrado en tokenizadores y en el escalado de datos por idioma.

Su relevancia es fundamentalmente experimental: no compite en capacidades con modelos generativos grandes, sino que sirve como banco de pruebas reproducible y de coste muy bajo para estudiar el efecto del volumen de datos de ajuste, la tokenización y las recetas de SFT en idiomas de recursos medios como el noruego. Es un modelo pensado para investigación y prototipado, no para despliegues de producción con requisitos de calidad altos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card ni en los metadatos) |
| Tipos de cuantizacion | no disponible: no se publican pesos cuantizados. Al ser un modelo de 39 M de parametros puede cuantizarse a int8/int4 con bitsandbytes o convertirse a GGUF mediante llama.cpp |
| Idiomas soportados | Noruego (`nor`, escritura latina) segun el identificador del modelo base; la model card no declara lista de idiomas |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido y HuggingFace no declara licencia) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, es decir, atención causal con normalización previa y embeddings posicionales aprendidos. El modelo se ha obtenido por ajuste fino supervisado (SFT) sobre goldfish-models/nor_latn_10mb, por lo que conserva el tokenizador y la configuración del checkpoint base; Goldfish es una familia de modelos monolingües entrenados con presupuestos de datos por idioma, y el `nor_latn` del nombre identifica noruego en alfabeto latino.

El entrenamiento se realizó con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1 bajo el régimen de SFT, con la semilla 10. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de instrucciones, si hubo etapas de RLHF o DPO, ni hiperparámetros como tasa de aprendizaje, épocas o tamaño de lote. La única traza experimental pública es una ejecución de Weights & Biases en el proyecto `new_tokenizers`. El ejemplo de uso de la model card emplea un formato de conversación con rol `user`, lo que indica que el ajuste adaptó el modelo a un formato tipo chat/instrucciones.

## Capacidades

- Generación de texto autoregresiva en noruego, heredada del modelo monolingüe base y ajustada mediante SFT.
- Formato de conversación con mensajes de rol (`[{"role": "user", "content": ...}]`) y parámetro `return_full_text=False` en el pipeline de Transformers.
- Generación de texto genérica (pipeline `text-generation`), apta para completado, continuaciones y respuestas breves.
- Compatibilidad declarada con text-generation-inference y endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Capacidad de razonamiento, matemáticas, código, tool calling, agentes, multimodalidad, audio o visión: no documentada en la información disponible.
- Capacidades multilingües: no documentadas; el identificador del modelo apunta a un único idioma (noruego).
- Modo de pensamiento explícito (*thinking mode*): no disponible.

## Casos de uso

- Investigación sobre escalado de datos por idioma: comparar el efecto de ajustar el checkpoint de 10 MB con 100 MB de datos frente a otras semillas y presupuestos, usando este modelo como punto de medida reproducible.
- Prototipado y *smoke testing* de pipelines de SFT con TRL: al tener 39 M de parámetros, permite validar scripts, plantillas de chat y versiones de librerías en minutos y en una sola GPU de consumo.
- Generación de texto en noruego para experimentos lingüísticos: producción de continuaciones y borradores a partir de indicaciones breves, útil para analizar fluidez, vocabulario y errores morfológicos del modelo.
- Generación de datos sintéticos a pequeña escala: creación de pares de instrucción y respuesta en noruego para aumentar corpus de entrenamiento de modelos mayores, con revisión humana posterior obligatoria.
- Despliegue en entornos con recursos mínimos: inferencia en CPU, dispositivos embebidos o Raspberry Pi, donde el peso del modelo en float32 ronda los 156 MB.
- Estudio de tokenizadores multilingües: forma parte del proyecto `new_tokenizers`, por lo que puede emplearse para medir el impacto de distintas tokenizaciones en la calidad del texto generado en noruego.
- Docencia y formación: ejemplo completo y de bajo coste de un ciclo de ajuste fino con TRL, publicación en HuggingFace y seguimiento de experimentos con Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (perplejidad, MMLU, HumanEval, GSM8K ni evaluaciones específicas de noruego) y la única referencia experimental es la ejecución de Weights & Biases enlazada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (39,1 M de parámetros): aproximadamente 156 MB en float32, 78 MB en float16/bfloat16, 39 MB en int8 y 20 MB en int4, sin contar el espacio del contexto y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Cualquier GTX 1050, RTX 3050 o integrada moderna puede ejecutarlo.
- Cabe en GPU de consumo: sí, en prácticamente todas, incluidas las de gama de entrada y portátiles. También cabe en CPU y en dispositivos de borde.
- Opciones de despliegue: pipeline de Transformers (el ejemplo de la model card usa `device="cuda"`), text-generation-inference (etiqueta declarada) y endpoints compatibles. llama.cpp, Ollama o vLLM requerirían conversión previa a GGUF o verificación de compatibilidad, no documentada por el autor.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/nor-latn-10mb-100mb_seed10 | 39.087.104 | no disponible | SFT con TRL sobre goldfish-models/nor_latn_10mb | no disponible | HuggingFace |
| goldfish-models/nor_latn_10mb (base) | 39.087.104 (el ajuste fino no altera el recuento de parametros) | no disponible | Preentrenamiento monolingüe con 10 MB | no disponible | HuggingFace |
| goldfish-models/nor_latn_100mb y goldfish-models/nor_latn_1gb | no disponible | no disponible | Preentrenamiento monolingüe con 100 MB y 1 GB | no disponible | HuggingFace, segun la convencion de nombres de la familia Goldfish |

No se dispone de datos de rendimiento comparativos entre estas variantes, ni de alternativas noruegas equivalentes evaluadas en las mismas condiciones, por lo que la comparación se limita a arquitectura, presupuesto de datos y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con corpus de 10 MB a 100 MB, es esperable que herede los sesgos y la cobertura temática limitada de esas fuentes, no verificada en la información disponible.
- Riesgo de alucinación: no evaluado. En un modelo de 39 M de parámetros entrenado con datos limitados, la generación de afirmaciones plausibles pero incorrectas es un riesgo estructural.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada y el modelo está orientado a un único idioma (noruego), sin capacidades multilingües documentadas. El ejemplo de la model card está en inglés, lo que no garantiza un buen comportamiento en ese idioma.
- Restricciones de licencia: la licencia no está declarada de forma efectiva (campo `licence: license` sin contenido), por lo que el uso comercial queda en un limbo jurídico y no debería asumirse permitido sin consultar al autor y comprobar la licencia del modelo base.
- Caveats para producción: no hay benchmarks, ni evaluación de seguridad, ni garantías de calidad; no es adecuado como componente crítico en producción sin una evaluación propia. El repositorio tiene 0 descargas y 0 *likes*, y fue creado en octubre de 2026, por lo que carece de validación por parte de la comunidad.
- Alucinación de procedencia: los resultados de la búsqueda web asociados a esta ficha no contienen enlaces relevantes al modelo (son páginas de vídeo y contenidos no relacionados), por lo que no aportan información verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nor-latn-10mb-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/kboj1na5
- Cita de TRL (von Werra et al., 2020), incluida en la model card del autor.
