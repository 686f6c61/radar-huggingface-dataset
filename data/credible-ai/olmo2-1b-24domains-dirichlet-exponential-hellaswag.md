# credible-ai/olmo2-1B-24domains-dirichlet-exponential-hellaswag

## Resumen

`olmo2-1B-24domains-dirichlet-exponential-hellaswag` es un modelo de lenguaje de 1.414.678.528 parámetros (1,41B) desarrollado por el equipo de credible-ai, construido sobre la arquitectura OLMo 2 (`Olmo2ForCausalLM`) y entrenado desde cero con 32.000 millones de tokens procedentes del corpus WebOrganizer. No es un modelo de propósito general: es un artefacto de investigación diseñado para reproducir uno de los experimentos del artículo LinMix, en el que se optimizan las proporciones de mezcla de datos entre 24 dominios temáticos para maximizar el rendimiento en un benchmark concreto (HellaSwag).

El interés técnico del checkpoint no está en sus capacidades lingüísticas, sino en el método con el que se eligió su receta de datos. La mezcla se obtuvo con Olmix, que ajusta un surrogate exponencial sobre un enjambre de modelos proxy entrenados con pesos Dirichlet (el enjambre `olmo2-30M-24domains-dirichlet`, de 30M de parámetros). Es decir, se usan modelos pequeños para explorar el espacio de mezclas y luego se transfiere la mezcla óptima a un modelo de 1,41B. El archivo `mix.json` del repositorio documenta las proporciones exactas empleadas.

Es relevante ahora porque la composición del corpus es una de las palancas de calidad más baratas de explorar en el preentrenamiento, y este checkpoint publica de forma abierta tanto los pesos finales como las secuencias tokenizadas, lo que permite reproducir el pipeline completo. Sus limitaciones son igual de importantes: solo inglés, sin ajuste por instrucciones, sin resultados de benchmarks publicados más allá del objetivo de optimización y con 32B tokens de entrenamiento, muy por debajo de los modelos base de su talla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se publican en bfloat16 (cuantizaciones de terceros como GGUF/AWQ no estan publicadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a CC-BY-4.0 y a los terminos de uso de Common Crawl |
| Formato de pesos | safetensors, bfloat16 (repo de 2,8 GB) |
| Tokenizer | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Metodo de mezcla | Olmix, surrogate exponencial ajustado sobre enjambre Dirichlet |
| Objetivo de optimizacion | HellaSwag |
| Tokens de entrenamiento | 32.000 millones (32B) |
| Framework de entrenamiento | OLMo-core |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 en su variante pequeña: un transformer decoder-only con 18 capas, dimensión oculta de 2048 y tokenizer GPT-NeoX-20B de 50.432 entradas. Los pesos se distribuyen en bfloat16 en formato safetensors. No hay innovaciones de atención ni mecanismos híbridos documentados en la información disponible; el checkpoint es una instancia estándar de `Olmo2ForCausalLM` entrenada con OLMo-core.

El aspecto diferencial está en el muestreo del corpus. Se parte de WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x, organizado en 24 temas. Sobre esos 24 dominios se entrena un enjambre de modelos proxy de 30M de parámetros con pesos de mezcla muestreados de una distribución de Dirichlet; con las curvas de rendimiento resultantes, Olmix ajusta un surrogate de forma exponencial y optimiza las proporciones para HellaSwag. La mezcla ganadora se escala al modelo de 1,41B, que consume 32B tokens. No se documentan fases de RLHF, DPO ni ajuste por instrucciones: es un modelo base puro. Las secuencias tokenizadas exactas se publican en `credible-ai/weborganizer-corpus-200b-tokenized` para permitir la reproducción bit a bit del preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo continuación de prompt (modelo base, sin plantilla de instrucciones).
- Razonamiento y conocimiento factual limitados por el presupuesto de entrenamiento (32B tokens) y por el tamaño (1,41B parámetros).
- No dispone de tool calling ni function calling: no hay formato de herramientas ni ajuste conversacional.
- No soporta agentes ni razonamiento multi-paso con uso de herramientas.
- Capacidad multilingüe prácticamente nula: el corpus y la mezcla son monolingües en inglés.
- Sin visión, audio, modo thinking ni decodificación especulativa documentada.
- Valor como capacidad *meta*: sirve como punto de medida reproducible del efecto de una mezcla de dominios optimizada frente a mezclas uniformes o heurísticas.

## Casos de uso

- Reproducción de experimentos de LinMix: cargar el checkpoint y el `mix.json` asociado para verificar que la mezcla optimizada con surrogate exponencial reproduce la curva de HellaSwag descrita en el artículo. Es el uso previsto por el autor.
- Investigación en data mixing: usar este modelo como referencia de "mezcla optimizada" frente a un baseline de mezcla uniforme sobre los mismos 24 dominios, manteniendo constante el tokenizador y el número de tokens vistos.
- Validación de métodos de optimización de mezclas: comparar Olmix (surrogate exponencial) con alternativas como RegMix o enfoques de bandit sobre el mismo enjambre Dirichlet de 30M, midiendo la transferencia de la mezcla al modelo de 1,41B.
- Estudio de leyes de escalado de mezclas: entrenar variantes de 30M, 100M y 1,41B sobre mezclas derivadas y medir si el ranking de mezclas se mantiene al crecer el modelo, usando este checkpoint como punto alto de la curva.
- Docencia y divulgación: ejemplo autocontenido (2,8 GB, licencia MIT, safetensors) para explicar en un curso cómo se parametriza una mezcla de dominios y cómo se optimiza contra una métrica downstream.
- Auditoría de contaminación de benchmarks: al estar la mezcla explícitamente optimizada para HellaSwag, el modelo es un caso de estudio útil para medir cuánto puede inflarse una métrica cuando la receta de datos se selecciona contra ella.
- Base de partida para *continued pretraining* controlado: al ser un checkpoint OLMo 2 limpio y pequeño, sirve para ablaciones de continuación con dominios adicionales sin arrastrar sesgos de ajuste por instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que HellaSwag es la métrica objetivo usada por Olmix para seleccionar la mezcla de datos; no se aportan valores numéricos de HellaSwag, MMLU, ARC, GSM8K ni de ningún otro conjunto de evaluación, ni para este checkpoint ni para los modelos proxy del enjambre.

## Requisitos de hardware

- VRAM estimada en bfloat16: unos 2,8 GB solo para pesos; con overhead de activaciones y caché KV para contextos cortos, entre 4 y 6 GB.
- VRAM estimada cuantizado: aproximadamente 1,5 GB en 8 bits y 0,8-1 GB en 4 bits (requiere conversión propia, no hay GGUF publicado).
- GPU recomendadas para servicio: L4 (24 GB), A10G (24 GB), A100 40/80 GB o H100 si se despliegan muchas réplicas en paralelo; para una sola instancia son sobredimensionadas.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en tarjetas de 8 GB en bfloat16 con contexto corto.
- Opciones de despliegue: `transformers` (vía `AutoModelForCausalLM`), vLLM o TGI para servir en bfloat16, llama.cpp/Ollama únicamente si se convierte previamente a GGUF. El modelo declara `endpoints_compatible`.
- Latencia y throughput: no disponibles; no se han publicado medidas. Por tamaño, es un modelo apto para inferencia interactiva en una sola GPU de consumo.
- Almacenamiento: 2,8 GB de pesos, más el espacio del dataset tokenizado si se va a reproducir el entrenamiento (no cuantificado en la información disponible).

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus model cards públicas y no se han verificado en esta ficha; conviene consultarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| credible-ai/olmo2-1B-24domains-dirichlet-exponential-hellaswag | 1,41B | no disponible | MIT | Base de investigación, mezcla de 24 dominios optimizada para HellaSwag |
| allenai/OLMo-2 (variante ~1B) | ~1,5B (consultar) | 4.096 (consultar) | Apache-2.0 | Base de propósito general, corpus Dolma, con receta de entrenamiento publicada |
| HuggingFaceTB/SmolLM2-1.7B | 1,71B | 8.192 | Apache-2.0 | Base/instrucción de propósito general, entrenado con ~11B tokens (consultar) |
| meta-llama/Llama-3.2-1B | 1,24B | 128.000 | Licencia comunitaria Llama 3.2 | Base e instrucción de propósito general, multilingüe |

Frente a las tres alternativas, este checkpoint pierde claramente en versatilidad (monolingüe, sin ajuste por instrucciones, sin contexto largo documentado) y gana en trazabilidad experimental: es el único de la lista cuya mezcla de datos está publicada como artefacto optimizado y auditable.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación para reproducir LinMix, no para uso en producto.
- Monolingüe en inglés; el rendimiento en castellano no está evaluado y previsiblemente será muy pobre.
- Sin ajuste por instrucciones ni alineación de seguridad: no rechaza peticiones dañinas y no sigue formatos conversacionales de forma fiable.
- Entrenado con solo 32B tokens, un presupuesto muy inferior al habitual en modelos de su talla, lo que limita conocimiento factual y fluidez en dominios poco representados.
- Riesgo elevado de alucinación, agravado por el tamaño reducido y la ausencia de evaluación publicada.
- Sesgo de selección de datos: la mezcla está optimizada contra HellaSwag, por lo que puede sobreajustarse a los estilos y temas favorecidos por ese benchmark y rendir peor en dominios no representados en la mezcla óptima.
- Riesgo de contaminación de benchmark: cualquier comparación de HellaSwag con este modelo frente a modelos con mezclas neutras no es una comparación limpia.
- Licencia de pesos MIT, pero los datos subyacentes provienen de DCLM 1b-1x (CC-BY-4.0) y de Common Crawl, sujetos a sus propios términos de uso; el uso comercial de los pesos no exime de revisar esas condiciones.
- El tokenizer GPT-NeoX-20B impone un vocabulario de 50.432 entradas que puede ser menos eficiente en inglés moderno y en otros idiomas que vocabularios más recientes.
- Fecha de creación del repositorio en HuggingFace: 2026-10-27, sin actualizaciones posteriores registradas y con 0 descargas y 0 likes en el momento de la consulta.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre este modelo; los únicos enlaces fiables son los de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-exponential-hellaswag
- Modelo proxy del enjambre Dirichlet (30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Código de LinMix: https://github.com/credibleai/linmix
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de `Olmo2ForCausalLM` en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Dataset de origen: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Secuencias tokenizadas de entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x (CC-BY-4.0): https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
