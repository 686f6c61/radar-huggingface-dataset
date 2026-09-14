# neemon/anlp-a2-part2-sophia

## Resumen

Sophia es un checkpoint de traducción desarrollado por el usuario neemon en el marco de la asignatura Advanced NLP (IIIT-H, Monsoon 2026). Se trata de un transformer decoder-only implementado desde cero y entrenado también desde cero, cuyo interés principal no es el rendimiento final sino el algoritmo de optimización empleado: Sophia-G, un optimizador de segundo orden con precondicionador diagonal recortado basado en el Hessiano, en lugar de AdamW. El repositorio contiene únicamente el checkpoint; el código de arquitectura, entrenamiento y evaluación vive en el repositorio de la asignatura.

Arquitectónicamente es un modelo pequeño: `d_model` de 512, 8 capas, 8 cabezas de atención (sin GQA, `n_kv_heads` = 8), `d_ff` de 2048, vocabulario de 32.000 tokens y una ventana de contexto de 256 tokens. Pese a la etiqueta `mixture-of-experts` de HuggingFace, la propia configuración declara `n_routed_experts` y `n_shared_experts` a 0 y un FFN denso, por lo que en la práctica es un transformer denso, no un MoE. El autor reporta 43.021.354 tokens objetivo puntuados y una mejor pérdida de validación de 3,5096.

Su relevancia es, por tanto, académica y experimental: sirve para reproducir y auditar el comportamiento de Sophia-G en un entorno controlado y de bajo coste computacional, no como modelo de traducción listo para producción. El contexto de 256 tokens, el escaso volumen de entrenamiento y la ausencia de benchmarks publicados limitan severamente su uso fuera de un contexto de investigación o docencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm; FFN denso (la etiqueta de HuggingFace indica mixture-of-experts, pero la configuración declara 0 expertos enrutados y 0 compartidos) |
| Parametros totales | No declarado por el autor. Estimación a partir de la configuración: ~41,5 M con pesos de embedding y cabeza LM compartidos; ~57,9 M si no se comparten (cifra orientativa, no confirmada) |
| Parametros activos | No aplica (no es un MoE según la configuración: `n_routed_experts` = 0) |
| Longitud de contexto | 256 tokens (`n_ctx`) |
| Tipos de cuantizacion | No disponible. El autor no publica variantes cuantizadas |
| Idiomas soportados | Inglés (en), vietnamita (vi), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, cargado con `torch.load`). No se distribuyen safetensors ni GGUF |
| Dimension del modelo (`d_model`) | 512 |
| Capas (`n_layers`) | 8 |
| Cabezas de atención (`n_heads` / `n_kv_heads`) | 8 / 8 |
| `d_ff` | 2048 |
| Tamano de vocabulario | 32.000 |
| Normalizacion | RMSNorm |
| Optimizador | Sophia-G (precondicionador diagonal recortado basado en Hessiano) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza estándar (8 cabezas de consulta y 8 de clave/valor, es decir, sin agrupación de cabezas KV), normalización RMSNorm y un perceptrón multicapa denso de dimensión intermedia 2048. La dimensión del modelo es 512 y consta de 8 capas, con un vocabulario de 32.000 tokens y una ventana de contexto de 256 tokens. La innovación declarada no está en la arquitectura, sino en el optimizador: Sophia-G, que sustituye el precondicionador de Adam por una estimación diagonal del Hessiano recortada, lo que en teoría permite converger con menos pasos en modelos pequeños.

El entrenamiento se realizó desde cero, sin inicialización a partir de pesos preentrenados, y el autor reporta 43.021.354 tokens objetivo puntuados y una mejor pérdida de validación de 3,5096. No se especifica la composición del dataset, el número de épocas, el tamaño de lote, la tasa de aprendizaje ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se documenta la estrategia de tokenización ni si se aplicaron técnicas como decodificación especulativa o atención lineal. El dato de perplejidad de validación aparece como `nan`, lo que sugiere un problema numérico en el cálculo de esa métrica y no necesariamente en el entrenamiento.

## Capacidades

- Generación de texto autorregresiva en inglés, vietnamita y japonés, con orientación declarada a traducción (pipeline `translation` en HuggingFace).
- Traducción entre los tres idiomas del entrenamiento, limitada a segmentos cortos por la ventana de contexto de 256 tokens.
- Modelado de lenguaje a pequeña escala: al ser un decoder-only entrenado con objetivo causal, puede usarse para completar texto y para experimentos de log-verosimilitud.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se documentan capacidades multilingües más allá de los tres idiomas declarados.
- Capacidad especial: es un banco de pruebas reproducible para el optimizador Sophia-G frente a optimizadores de primer orden.

## Casos de uso

- Reproducción de experimentos con Sophia-G: el checkpoint permite comparar la trayectoria de convergencia de Sophia-G contra AdamW en un transformer de ~42 M de parámetros, con una pérdida de validación de referencia de 3,5096 y 43 millones de tokens de entrenamiento. Es su uso más realista y para el que fue creado.
- Material docente en cursos de NLP: sirve para ilustrar el ciclo completo de un transformer decoder-only (tokenización, atención causal, RMSNorm, FFN denso) sin requerir infraestructura de GPU.
- Evaluación de pipelines de traducción a pequeña escala: se puede integrar como baseline de bajo coste en un script que compare BLEU/chrF frente a modelos Marian o NLLB en frases cortas de en-vi y en-ja.
- Pruebas de infraestructura de inferencia: al ser un modelo diminuto (menos de 0,2 GB de checkpoint), es útil para validar cargadores, servidores de inferencia propios o wrappers de `torch.load` antes de escalar a modelos grandes.
- Experimentos de ajuste fino y destilación: su tamaño permite hacer fine-tuning completo en una única GPU consumer o incluso en CPU, lo que lo convierte en un banco de pruebas para técnicas de regularización, inicialización o curricula de datos.
- Análisis de cuantización extrema: al no publicarse variantes cuantizadas, es un candidato razonable para estudiar el impacto de cuantizaciones de 8 y 4 bits en un modelo con vocabulario de 32.000 tokens y 8 capas.
- Auditoría de seguridad de checkpoints: el uso de `weights_only=False` en la carga hace de este repositorio un caso práctico para estudiar los riesgos de los formatos pickle en la distribución de modelos.
- No se recomienda su uso como traductor en producción: la ventana de 256 tokens, el reducido volumen de entrenamiento y la falta de benchmarks hacen inviable un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de entrenamiento y validación:

| Metrica | Valor |
|---|---|
| Tokens objetivo puntuados | 43.021.354 |
| Mejor pérdida de validación | 3,5096 |
| Mejor perplejidad de validación | nan (no válida) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| BLEU / chrF en traducción | No disponible |

## Requisitos de hardware

- VRAM estimada: con ~41,5 M de parámetros, el checkpoint en fp32 ocupa del orden de 170 MB y en fp16 unos 85 MB. La inferencia cabe holgadamente en 1 GB de VRAM o de RAM.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4090, A100, H100) es más que suficiente; el cuello de botella no será la memoria sino el overhead de lanzamiento de kernels si se usa batching pequeño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU, en Raspberry Pi o en entornos sin acelerador.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load("model.pt", map_location="cpu", weights_only=False)`, que devuelve un diccionario con las claves `model` (state_dict) y `config`. Al no publicarse pesos en safetensors ni GGUF, no hay ruta directa a llama.cpp, Ollama, vLLM o TGI sin una conversión previa y la reimplementación de la arquitectura, que no está incluida en este repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia, tokens por segundo ni resultados de pruebas de carga.
- Advertencia de seguridad: `weights_only=False` implica deserialización de pickle. Cargar el archivo solo es aceptable con procedencia verificada.

## Comparativa con modelos similares

No se proporcionan en la información disponible modelos comparables con datos verificables. La categoría natural de comparación serían modelos de traducción pequeños como los Marian de Helsinki-NLP (familia `opus-mt`, en-vi y en-ja) o variantes destiladas de NLLB, así como modelos multilingües ligeros tipo mT5-small, pero no se dispone de sus cifras contrastadas en esta ficha, por lo que no se incluyen valores numéricos para evitar datos no verificados.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| neemon/anlp-a2-part2-sophia | ~41,5 M (estimado) | 256 | MIT | Checkpoint académico, sin benchmarks |
| Alternativas de traducción pequeñas (Marian, NLLB destilado, mT5-small) | No disponible | No disponible | No disponible | Datos no disponibles en la información proporcionada |

## Limitaciones y advertencias

- Ventana de contexto de 256 tokens: insuficiente para documentos, párrafos largos o conversaciones multi-turno; solo admite frases o fragmentos muy cortos.
- Entrenamiento con 43 millones de tokens, varios órdenes de magnitud por debajo de los modelos de traducción convencionales, lo que se traduce en una pérdida de validación de 3,5096 y una calidad esperable muy baja.
- Ausencia total de benchmarks publicados: no hay evidencia de calidad de traducción en en-vi ni en-ja.
- La perplejidad de validación reportada es `nan`, lo que indica un fallo en el cálculo de esa métrica; conviene reproducirla antes de citar cualquier cifra de calidad.
- Riesgo alto de alucinación y de salidas incoherentes, especialmente fuera de los dominios de entrenamiento y con entradas largas o poco frecuentes.
- Sesgos conocidos: no disponible. No se documenta composición del dataset ni análisis de sesgo, por lo que no puede descartarse la presencia de sesgos de género, culturales o de dominio en los tres idiomas.
- Etiquetado inconsistente: el repositorio se etiqueta como `mixture-of-experts`, pero la configuración declara un FFN denso con 0 expertos enrutados. Cualquier comparación basada en la etiqueta será errónea.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, pero no hay garantías de idoneidad ni de exactitud.
- El repositorio no incluye el código de arquitectura ni de entrenamiento, solo el checkpoint. Sin la implementación del repositorio de la asignatura no es posible reconstruir el grafo del modelo a partir del `state_dict` sin trabajo adicional.
- Formato de pesos en pickle de PyTorch con `weights_only=False`: riesgo de ejecución de código arbitrario si el archivo no procede de una fuente fiable.
- No apto para producción: no debe integrarse en sistemas de traducción reales sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part2-sophia
- Repositorio de la asignatura (arquitectura, entrenamiento y evaluación): referenciado por el autor pero sin URL pública en la información disponible.
- Paper de Sophia (optimizador): no disponible en la información proporcionada.
- Demo o Space: no disponible.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron únicamente resultados no relacionados sobre la Antártida (Wikipedia, Britannica, National Geographic, NASA), sin conexión con el modelo.
