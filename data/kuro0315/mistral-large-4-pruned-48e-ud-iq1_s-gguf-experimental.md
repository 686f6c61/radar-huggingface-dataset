# kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental

## Resumen

Mistral Large 4 Pruned 48E UD-IQ1_S GGUF Experimental es una derivación experimental del modelo Mistral Large 4 (1T-A52B) de Mistral AI, publicada por el usuario independiente kuro0315. Se trata de una versión podada de los expertos enrutados (routed experts) de cada capa MoE, reduciéndolos de 128 a 48 por capa, manteniendo el top-4 de activación por token. El resultado se distribuye en formato GGUF cuantizado en seis particiones, heredando la cuantización UD-IQ1_S del modelo original de Unsloth, sin reentrenamiento ni recuantización adicional.

El modelo base es un transformer de tipo Mixture of Experts con 1 billón de parámetros totales y 52 mil millones activos por token, aunque esta derivación podada conserva 406.084.006.176 parámetros totales según los safetensors del repositorio. La poda busca reducir el peso del modelo (99,12 GB en seis ficheros GGUF) para facilitar su despliegue en hardware más modesto, a costa de una degradación de calidad que el propio autor reconoce no haber evaluado en profundidad.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de poda de MoE (basada en REAP con búsqueda local discreta) aplicada a un modelo de gran escala; por otro, advierte de que se trata de un artefacto experimental sin garantías de rendimiento, pensado para pruebas de despliegue y no para producción. El modelo soporta únicamente japonés e inglés según los metadatos declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), podado a 48 expertos enrutados por capa |
| Parametros totales | 406.084.006.176 (según safetensors del repo podado) |
| Parametros activos | 52B (top-4 expertos por token, heredado del modelo base 1T-A52B) |
| Longitud de contexto | no disponible (el autor menciona una configuración de 128.000 tokens para Unsloth Studio, no confirmada) |
| Tipos de cuantizacion | GGUF UD-IQ1_S (heredada del modelo base de Unsloth) |
| Idiomas soportados | ja, en |
| Licencia | mistral-ecosystem-open-weight (other) |
| Formato de pesos | GGUF (6 particiones, 99,12 GB / 92,31 GiB) |

## Arquitectura y entrenamiento

El modelo base Mistral Large 4 (1T-A52B) es un transformer MoE con 1 billón de parámetros totales y 52 mil millones activos por token, con 128 expertos enrutados por capa y top-4 de activación. Esta derivación poda cada capa MoE de 128 a 48 expertos enrutados, manteniendo la activación top-4 por token. La selección de expertos se realizó en dos fases: primero se usó la puntuación de importancia de REAP como inicialización, y después se aplicó una búsqueda local discreta que intercambia un experto conservado por uno descartado, recalculando el top-4 y la normalización de pesos dentro del subconjunto retenido, minimizando el error cuadrático frente a la salida del modelo original. El intercambio se limita a un máximo de 16 iteraciones por capa.

El proceso de selección se calibró con 32 frases japonés-inglés truncadas a 32 tokens cada una (24 frases, 768 tokens para selección; 8 frases, 256 tokens para validación), usando las entradas originales de cada capa sin propagar el error acumulado de capas anteriores. El autor indica explícitamente que no es una reproducción del método OptEP (no hay relajación continua ni actualización de pesos de expertos, EWU), sino una búsqueda local discreta. No se realizó reentrenamiento ni recuantización: se hereda la cuantización UD-IQ1_S del GGUF de Unsloth (revisión `1eb4373d37e76f6e7b4b8efa20e1b1ca40b3b964`). No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en japonés e inglés (idiomas declarados en los metadatos).
- Razonamiento y generación de código, presumiblemente heredados del modelo base, aunque no evaluados en esta derivación.
- Soporte de tool calling / function calling: no confirmado para esta derivación; el modelo base lo soporta según su especificación, pero la poda puede degradarlo.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües limitadas a ja y en según los metadatos.
- Inclusión de un fichero DSpark experimental (`dspark-Mistral-Large-4-1T-A52B-Q8_0.gguf`, 2,25 GB) para decodificación especulativa, sin garantía de calidad ni aceleración en la versión podada.
- Configuración de ejemplo para Unsloth Studio con ventana de 128.000 tokens (no verificada por el autor).

## Casos de uso

- Pruebas de despliegue de MoE de gran escala en hardware limitado: el modelo, al pesar 99,12 GB en GGUF IQ1_S, permite experimentar con un MoE de ~406B parámetros totales en configuraciones que no admitirían el modelo original completo, aunque con calidad degradada.
- Investigación sobre poda de MoE: el repositorio incluye `pruning.json`, `recipe/`, `evaluation/` y `validation/`, lo que permite reproducir y analizar el proceso de selección de expertos y comparar la perplejidad frente al modelo original.
- Evaluación de decodificación especulativa con DSpark: el fichero DSpark incluido permite probar la aceleración por draft model en un MoE podado, midiendo si la pérdida de calidad compensa la ganancia de velocidad.
- Generación de texto en japonés e inglés en entornos de investigación: útil para comparar la calidad de un MoE podado frente al original en tareas conversacionales, siempre con validación humana.
- Benchmarking de cuantizaciones extremas (IQ1_S): sirve para estudiar el impacto de cuantizaciones de 1-2 bits en modelos MoE de gran escala, midiendo perplejidad y coherencia.
- Docencia y divulgación: ejemplo práctico de cómo se aplica REAP y búsqueda local a un modelo de Mistral AI, con material de evaluación incluido en el repo.

## Benchmarks y rendimiento

El autor publica una única comparación de perplejidad sobre un conjunto reducido de 8 frases japonés-inglés (313 posiciones de entrada, 305 posiciones evaluadas para verosimilitud del siguiente token):

| Métrica | Modelo original cuantizado | Versión 48 expertos |
|---|---:|---:|
| Perplejidad (menor es mejor) | 14,40 | 16,42 |
| Coincidencia del primer token predicho con el original | — | 79,87 % |

El autor advierte que la perplejidad empeora aproximadamente un 14 % en esta prueba reducida y que esto no equivale a una caída del 14 % en capacidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~100 GB para cargar los 99,12 GB de pesos GGUF IQ1_S, más overhead de contexto y KV cache. Con contexto largo (128k tokens) el requisito crece significativamente.
- GPU recomendadas: configuraciones multi-GPU con un total de 100-128 GB de VRAM, por ejemplo 2× A100 80GB, 2× H100 80GB o 4× RTX 4090 24GB (con reparto por capas en llama.cpp).
- No cabe en una única GPU de consumo (RTX 4090, 3090, 4090, etc.) por el tamaño de los pesos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importación del GGUF), y potencialmente vLLM si se convierte a otro formato, aunque no está documentado. El repo incluye configuración para Unsloth Studio.
- Latencia y throughput: no disponibles. El autor no confirma que la poda aporte aceleración real, a pesar de reducir el número de expertos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 Pruned 48E (este) | 406B (podado) | 52B (top-4) | no disponible | mistral-ecosystem-open-weight | GGUF, 6 particiones |
| Mistral Large 4 1T-A52B (base) | 1T | 52B | no disponible | mistral-ecosystem-open-weight | safetensors y GGUF (Unsloth) |
| Mistral Large 4 1T-A52B GGUF (Unsloth) | 1T | 52B | no disponible | mistral-ecosystem-open-weight | GGUF cuantizado |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor declara explícitamente que no ha realizado una evaluación suficiente de precisión y que puede haber regresiones significativas de calidad.
- Perplejidad degradada: 16,42 frente a 14,40 del original en una prueba reducida (≈14 % peor), con solo un 79,87 % de coincidencia en el primer token predicho.
- Evaluación insuficiente: no se han medido calidad de generación libre, precisión en tareas de código, estabilidad en contextos largos ni capacidades de tool calling tras la poda.
- Sesgos: no documentados para esta derivación; se heredan los del modelo base, no evaluados aquí.
- Riesgo de alucinación: presumiblemente incrementado por la poda y la cuantización IQ1_S, sin medición disponible.
- Idiomas: solo ja y en declarados; el rendimiento en otros idiomas no está garantizado.
- Licencia: mistral-ecosystem-open-weight (other), con atribución y condiciones del modelo original; revisar `LICENSE` antes de uso comercial.
- DSpark incluido sin garantías: el autor advierte que no se ha verificado calidad ni aceleración en la versión podada.
- Configuración de 128k tokens para Unsloth Studio no reproducida por el autor.
- La poda se calibró con un conjunto muy reducido (768 tokens de selección), por lo que la selección de expertos puede no ser óptima para dominios distintos.

## Enlaces

- Hugging Face: https://huggingface.co/kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Revisión de origen: `1eb4373d37e76f6e7b4b8efa20e1b1ca40b3b964`
- Licencia: fichero `LICENSE` en el repositorio
- Documentación DSpark: `dspark/README.md` en el repositorio
- Configuración Unsloth Studio: `dspark/unsloth-studio-settings.md` en el repositorio
- Artefactos de poda: `pruning.json`, `recipe/`, `evaluation/`, `validation/` en el repositorio
