# mariklolik/AraToken-Qwen3-1.7B-LEP

## Resumen

AraToken-Qwen3-1.7B-LEP es un modelo de lenguaje de tipo decoder-only para generación de texto, publicado por el autor mariklolik (Mark Kashirskiy, Artiom Lipinski e Ilya Makarov, según la cita del paper asociado). No es un modelo entrenado desde cero: parte de `Qwen/Qwen3-1.7B-Base` y le aplica una extensión de vocabulario para árabe junto con un ajuste ligero de capas altas del transformer. El objetivo es mejorar la eficiencia de tokenización del árabe sin reentrenar el modelo completo.

La relevancia práctica del modelo es metodológica más que de producto. El árabe es un idioma con morfología rica y un ratio de tokens por palabra muy alto en tokenizadores entrenados mayoritariamente con inglés, lo que encarece la inferencia y reduce la ventana efectiva. Este modelo demuestra que se puede reducir ese coste con una receta de bajo presupuesto: añadir 130.890 filas nuevas de embedding inicializadas analíticamente, congelar las filas originales y entrenar únicamente las capas 24 a 27 durante 2.000 pasos (196 millones de tokens).

El resultado declarado es una mejora medible en bits por carácter (BPC) sobre árabe: 1,2598 frente a 1,3313 del Qwen3-1.7B-Base y 1,2672 de la variante CPT del mismo autor, con significación estadística p < 0,001. Se publica bajo licencia Apache 2.0 y con pesos en safetensors, por lo que es utilizable tanto como punto de partida para ajuste fino en árabe como banco de pruebas para investigar extensiones de vocabulario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B-Base) |
| Parámetros totales | 1.988.637.696 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la model card; al publicarse en safetensors bf16 es cuantizable con bitsandbytes, GPTQ, AWQ o a GGUF (ninguna publicada por el autor) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers; repositorio de 4,0 GB) |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Ampliación de vocabulario | 130.890 filas nuevas de embedding |
| Capas entrenadas | Capas 24 a 27 del transformer (embeddings originales congelados) |
| Dataset de adaptación | mariklolik/AraToken-FineWeb2-HQ-ar |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B-Base, un transformer decoder-only, sobre el que se aplica la receta denominada LEP en el paper (extensión de lenguaje para Qwen3). El cambio estructural principal es la ampliación del vocabulario: se añaden 130.890 filas nuevas a la matriz de embeddings, inicializadas con una estimación híbrida definida como ½(composicional + analógica), es decir, un promedio entre una estimación construida a partir de la composición de subunidades del token y otra basada en analogía con tokens existentes. Las filas de embedding originales permanecen congeladas durante todo el entrenamiento, de modo que el conocimiento previo del modelo base no se altera en esa parte.

El ajuste es deliberadamente corto: 2.000 pasos con un batch de 96 secuencias de 1.024 tokens, lo que suma 196 millones de tokens procesados. Solo se actualizan las capas 24 a 27, es decir, el tramo final del transformer, lo que concentra la adaptación en las representaciones de salida sin tocar los bloques inferiores. No se menciona en la información disponible ninguna fase de RLHF, DPO o ajuste por instrucciones, ni datos sobre decodificación especulativa o mecanismos de atención alternativos.

El tokenizador incorpora además el normalizador de AraToken, que aplica NFKC, eliminación de tatweel, conversión a dígitos occidentales y eliminación de puntuación latina y diacríticos. Según la model card, esto permite pasar texto árabe en bruto directamente al tokenizador sin preprocesado adicional, lo que simplifica la integración en pipelines existentes.

## Capacidades

- Generación de texto y modelado de lenguaje en árabe e inglés, al ser un modelo base sin ajuste por instrucciones.
- Puntuación de verosimilitud sobre texto árabe: el modelo está explícitamente evaluado con BPC sobre documentos retenidos, por lo que es apto para cálculo de perplejidad y filtrado de corpus.
- Tokenización normalizada de árabe en un solo paso (NFKC, tatweel, dígitos, puntuación y diacríticos), sin necesidad de una fase de limpieza externa.
- Punto de partida para ajuste fino supervisado en árabe sobre una representación más eficiente del idioma.
- Capacidades multilingües limitadas a los dos idiomas declarados (ar, en); no hay declaración de soporte para otros idiomas.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, modo thinking, visión, audio ni otras capacidades especiales. Al tratarse de un modelo base, estas funciones requerirían un ajuste posterior.

## Casos de uso

- Ajuste fino supervisado en árabe para dominios verticales: el modelo aporta un vocabulario árabe compacto y embeddings nuevos ya entrenados, por lo que un SFT sobre datos legales, médicos o financieros en árabe parte de una representación más eficiente que el Qwen3-1.7B-Base original.
- Filtrado y curación de corpus árabe a escala: usar el modelo para calcular BPC o perplejidad por documento y descartar texto de baja calidad antes de entrenar modelos mayores, aprovechando que la métrica está definida y validada sobre FineWeb2-HQ-ar.
- Investigación en extensiones de vocabulario: sirve como referencia reproducible de la receta LEP (inicialización ½(composicional + analógica), embeddings congelados, solo capas altas entrenables) para replicarla en otros idiomas o en otros modelos base.
- Generación de texto árabe en producción de bajo coste: con cerca de 2.000 millones de parámetros, el modelo cabe en GPUs de gama media y puede desplegarse para autocompletado, resúmenes o generación de borradores en árabe donde no se requiera seguimiento estricto de instrucciones.
- Componente de normalización y tokenización reutilizable: el tokenizador con el normalizador AraToken se puede extraer e integrar en pipelines de indexación, búsqueda o análisis morfológico de árabe, con independencia de si se usa el modelo completo.
- Evaluación comparativa de tokenizadores árabes: el modelo y sus variantes (base y CPT) permiten medir el impacto de distintas estrategias de tokenización sobre la misma arquitectura y el mismo conjunto de evaluación, con pruebas de significación sobre documentos.
- Prototipado e investigación en entornos con recursos limitados: al ser un modelo de 4 GB en bf16 y licencia Apache 2.0, es adecuado para experimentación académica en una única GPU de consumo o incluso en CPU con cuantización.

## Benchmarks y rendimiento

La model card solo publica la métrica de bits por carácter (BPC) sobre los primeros 1.500 documentos del split `test` retenido de `mariklolik/AraToken-FineWeb2-HQ-ar`. BPC se usa porque permite comparar modelos con vocabularios distintos sobre los mismos caracteres.

| Modelo | BPC en árabe (menor es mejor) |
|---|---|
| Qwen3-1.7B-Base | 1,3313 |
| AraToken-Qwen3-1.7B-CPT (tokenizador original) | 1,2672 |
| AraToken-Qwen3-1.7B-LEP (este modelo) | 1,2598 |

La diferencia entre este modelo y la variante CPT es significativa con p < 0,001 según un bootstrap emparejado sobre documentos de test, tal como se indica en la model card. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16 o float16: aproximadamente 4 GB solo para los pesos (1.988.637.696 parámetros × 2 bytes), más caché KV; en la práctica, entre 5 y 7 GB según longitud de contexto y tamaño de lote. Estimación propia, no confirmada por el autor.
- VRAM con cuantización: en torno a 2 GB en 8 bits y 1,2-1,5 GB en 4 bits, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cabe con holgura en RTX 4090 (24 GB), RTX 4080, RTX 3090 y A100/H100 si se busca throughput alto o lotes grandes. También debería caber en GPUs de 8 GB como RTX 3060 Ti o RTX 4060 en bf16 con contexto corto, y en 12 GB (RTX 3060, RTX 4070) sin restricciones prácticas.
- Despliegue: la model card usa `transformers` con `AutoModelForCausalLM`. El repositorio declara compatibilidad con text-generation-inference y endpoints, por lo que también es desplegable con TGI y previsiblemente con vLLM. Para llama.cpp u Ollama sería necesario generar primero un GGUF, que el autor no publica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPC en árabe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraToken-Qwen3-1.7B-LEP (este) | 1.988.637.696 | No disponible | 1,2598 | Apache 2.0 | HuggingFace, safetensors |
| mariklolik/AraToken-Qwen3-1.7B-CPT | No disponible en la información | No disponible | 1,2672 | No disponible en la información | HuggingFace |
| Qwen/Qwen3-1.7B-Base | Base del modelo, mismo orden de magnitud (no confirmado en la información) | No disponible | 1,3313 | Apache 2.0 | HuggingFace |

No se dispone en la información proporcionada de datos de otros modelos árabes de tamaño comparable (por ejemplo, familias específicamente árabes) que permitan una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni con RLHF o DPO: no sigue instrucciones de forma fiable y no debe usarse directamente como asistente conversacional sin un ajuste posterior.
- El entrenamiento cubre solo 2.000 pasos y 196 millones de tokens, con únicamente las capas 24 a 27 entrenables. El riesgo de olvido catastrófico en inglés y en conocimiento general respecto al modelo base no se cuantifica en la información disponible.
- La evaluación se limita a BPC sobre los primeros 1.500 documentos de un único conjunto (FineWeb2-HQ-ar). No hay evidencia de rendimiento en otras tareas, dominios o registros del árabe (dialectos, árabe clásico, texto técnico).
- No se han publicado evaluaciones de sesgo, toxicidad o alineación para este modelo.
- Riesgo de alucinación inherente a un modelo base de 2.000 millones de parámetros; no hay datos publicados sobre tasas de factualidad.
- La extensión del vocabulario puede degradar la tokenización de contenido no árabe, especialmente código fuente y texto latino con diacríticos, ya que el normalizador elimina diacríticos y puntuación latina del flujo de entrada.
- La longitud de contexto efectiva no se especifica en la model card y no hay confirmación de que el ajuste preserve la ventana original del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B-Base, también Apache 2.0 según la información disponible. El autor no ofrece garantías ni soporte.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, y fechas de creación y actualización poco habituales (2026), lo que aconseja verificar la reproducibilidad antes de usarlo en producción.
- No hay cuantizaciones publicadas ni pesos en formatos distintos de safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mariklolik/AraToken-Qwen3-1.7B-LEP
- Variante CPT del mismo autor: https://huggingface.co/mariklolik/AraToken-Qwen3-1.7B-CPT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset de adaptación y evaluación: https://huggingface.co/datasets/mariklolik/AraToken-FineWeb2-HQ-ar
- Paper: https://arxiv.org/abs/2512.18399
- Código: https://github.com/mariklolik/Aratoken
