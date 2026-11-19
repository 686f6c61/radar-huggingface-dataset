# Kamyar-zeinalipour/protein-tokenizer-llama3

## Resumen

`protein-tokenizer-llama3` es un tokenizador derivado del tokenizador de Llama-3-8B, adaptado específicamente a secuencias de aminoácidos para el entrenamiento y la inferencia del modelo de lenguaje de proteínas P-Llama3-8B. Lo desarrolla Kamyar Zeinalipour (con Neda Jamshidi, Monica Bianchini, Marco Maggini y Marco Gori como coautores del artículo asociado) en el marco del workshop LangMol 2024 (ACL). No es un modelo generativo en sí mismo: es el componente de tokenización que permite que un transformer de propósito general procese proteínas humanas como si fueran texto.

El problema que resuelve es concreto: los tokenizadores BPE estándar de los LLM no están optimizados para el alfabeto proteico de 20 aminoácidos y generan secuencias de tokens ineficientes para cadenas de aminoácidos. Este tokenizador reajusta el vocabulario de Llama-3 (128.000 tokens) sobre secuencias de proteínas humanas del dataset UniRef50-HumanProteins, de modo que el modelo pueda aprender patrones estructurales de proteínas con una representación más compacta. Se usa junto con P-Llama3-8B para tareas de diseño de proteínas, y forma parte de una familia de adaptaciones análogas sobre Mistral-7B, Llama-2-7B y Gemma-7B.

Es relevante ahora porque el diseño computacional de proteínas con LLM es una línea activa de investigación en biología computacional, y este tokenizador es una pieza reutilizable (publicada bajo licencia llama3) para quien quiera reproducir o extender el pipeline del artículo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigación de nicho, no una herramienta de producción consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (adaptación del tokenizador de Llama-3-8B); no es un modelo neuronal |
| Parametros totales | no disponible (el tokenizador no tiene parámetros; el modelo asociado P-Llama3-8B es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: secuencias de aminoácidos de proteínas humanas) |
| Licencia | llama3 |
| Formato de pesos | no disponible (artefacto de tokenizador; el modelo asociado se distribuye vía `transformers`) |

## Arquitectura y entrenamiento

El tokenizador parte del vocabulario de Llama-3-8B (128.000 tokens) y se reajusta sobre secuencias de aminoácidos de proteínas humanas procedentes del dataset UniRef50-HumanProteins. Las secuencias se delimitan con los tokens especiales `<|begin_of_text|>` y `<|end_of_text|>`, reutilizando la convención de Llama-3. El objetivo es que el vocabulario cubra de forma eficiente los n-gramas de aminoácidos frecuentes en proteínas humanas, reduciendo la longitud de token por secuencia respecto al tokenizador original.

El modelo asociado, P-Llama3-8B, se entrena sobre estas secuencias tokenizadas; el artículo *Design Proteins Using Large Language Models: Enhancements and Comparative Analyses* (LangMol 2024) describe el pipeline completo y compara adaptaciones sobre Mistral-7B, Llama-2-7B, Llama-3-8B y Gemma-7B. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el artículo está accesible en arXiv (2408.06396) para quien necesite esos detalles.

## Capacidades

- Tokenización de secuencias de aminoácidos de proteínas humanas con un vocabulario de 128.000 tokens derivado de Llama-3.
- Delimitación explícita de secuencias mediante `<|begin_of_text|>` y `<|end_of_text|>`.
- Integración directa con `transformers` (`AutoTokenizer.from_pretrained`) para su uso con P-Llama3-8B.
- Soporte del pipeline de generación del repositorio `protein-design-LLMs` (prompting y decodificación vía `main.py`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un tokenizador de dominio biológico.
- Capacidades multilingües: no aplica; el dominio es el alfabeto proteico, no lenguaje natural.

## Casos de uso

- Reproducción del artículo LangMol 2024: cargar el tokenizador junto con P-Llama3-8B para replicar los experimentos de generación de proteínas descritos en la publicación, usando el script `main.py` del repositorio.
- Diseño de proteínas de novo en investigación: generar secuencias candidatas con P-Llama3-8B tokenizadas con este vocabulario y filtrarlas posteriormente con herramientas de plegamiento (AlphaFold, ESMFold) para evaluar viabilidad estructural.
- Comparativa de tokenizadores en dominio proteico: medir la longitud media de token por secuencia frente al tokenizador Llama-3 original sobre un conjunto de proteínas humanas, para cuantificar la ganancia de eficiencia del reajuste.
- Fine-tuning de modelos de proteínas: usar el tokenizador como base para adaptar otros transformers de 7-8B a secuencias de aminoácidos, manteniendo coherencia con la familia P-* del autor.
- Extracción de representaciones latentes: alimentar secuencias proteicas tokenizadas a P-Llama3-8B y extraer embeddings de capas intermedias para tareas downstream (clasificación de familias, predicción de función).
- Docencia e investigación en biología computacional: material didáctico para ilustrar cómo se adapta un tokenizador de lenguaje natural a un alfabeto no lingüístico, con un caso publicado y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado (arXiv 2408.06396, LangMol 2024) evalúa la generación de proteínas de la familia P-* frente a los modelos base, pero los valores concretos no se recogen en la información proporcionada.

## Requisitos de hardware

- El tokenizador en sí no requiere GPU: es un artefacto de CPU con huella de memoria despreciable (vocabulario de 128.000 tokens).
- Para usarlo con P-Llama3-8B (8B parámetros), la VRAM estimada es de ~16 GB en FP16/BF16 y ~6-8 GB en cuantización de 4 bits, aunque no se dispone de cifras oficiales del autor.
- GPU recomendadas para el modelo asociado: A100 40/80 GB o H100 para inferencia en precisión completa con lotes grandes; RTX 4090 (24 GB) para FP16 en lote pequeño; RTX 3090/4080 para cuantización 4-bit.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080) si se usa el modelo asociado en cuantización.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte oficial); vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protein-tokenizer-llama3 | Tokenizador de proteínas (base Llama-3) | no aplica (vocab 128.000) | no disponible | llama3 | Hugging Face, 0 descargas |
| P-Llama3-8B (mismo autor) | LLM de proteínas | 8B | no disponible | llama3 | Hugging Face |
| P-Mistral-7B (mismo autor) | LLM de proteínas | 7B | no disponible | Mistral | Hugging Face |
| P-Llama2-7B (mismo autor) | LLM de proteínas | 7B | no disponible | llama2 | Hugging Face |
| P-gemma-7B (mismo autor) | LLM de proteínas | 7B | no disponible | Gemma | Hugging Face |

La comparación más directa es con los tokenizadores base de cada familia (Llama-3, Mistral, Llama-2, Gemma) sin reajustar; no se dispone de métricas publicadas de eficiencia de tokenización en la información proporcionada.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo: no genera texto ni proteínas por sí solo; requiere P-Llama3-8B u otro modelo compatible.
- El vocabulario está reajustado sobre proteínas humanas (UniRef50-HumanProteins); su eficiencia puede degradarse en proteínas de otras especies o en secuencias muy divergentes.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto en la información disponible; al ser un artefacto de investigación con 0 descargas, no hay evidencia de uso en producción.
- Licencia `llama3`: impone restricciones de uso comercial y obligaciones de atribución; el autor indica explícitamente "for research use".
- No hay garantía de mantenimiento ni soporte; la fecha de actualización del repositorio (2026-11-18) no implica actividad reciente verificable.
- Para producción en biología computacional, cualquier secuencia generada debe validarse con herramientas de plegamiento y filtros biológicos independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/protein-tokenizer-llama3
- Modelo asociado P-Llama3-8B: https://huggingface.co/Kamyar-zeinalipour/P-Llama3-8B
- Dataset UniRef50-HumanProteins: https://huggingface.co/datasets/Kamyar-zeinalipour/UniRef50-HumanProteins
- Artículo (ACL Anthology): https://aclanthology.org/2024.langmol-1.5/
- Artículo (arXiv HTML): https://arxiv.org/html/2408.06396v1
- Artículo (arXiv PDF): https://arxiv.org/pdf/2408.06396
- Repositorio de código: https://github.com/KamyarZeinalipour/protein-design-LLMs
- Colección Protein Design: https://huggingface.co/collections/Kamyar-zeinalipour/design-proteins-using-llms-langmol-2024-6af48a0e6814a362675e4dc6
