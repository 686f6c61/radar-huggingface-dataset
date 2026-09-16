# jakeatx/Qwen3.8-Perian-BF16

## Resumen

Qwen3.8-Perian-BF16 es un checkpoint de investigación publicado por el usuario jakeatx en Hugging Face. Se trata de un modelo de lenguaje de arquitectura mixture-of-experts (MoE) derivado de sjakek/slimder-qwen38-ream288-depth32-agentic, al que se han aplicado tres reducciones estructurales acumuladas: profundidad de 48 a 32 capas, ancho de expertos enrutados de 384 a 288 por capa y compactación al 50% de la tabla n-gram PLE. El resultado son 74.615.655.680 parámetros según la model card y 150,51 GB de tensores serializados en BF16.

El problema que aborda es la eficiencia en el despliegue de MoE de gran tamaño: partiendo de un checkpoint original de 200,43 GB, la compactación elimina aproximadamente 25.600 millones de parámetros entrenables mediante una política híbrida de selección (selecciones activation-aware para las cabezas bigram 0-7 y baseline de frecuencia para las trigram 8-15), validada sobre un holdout de 5 millones de tokens disjunto a nivel de documento.

Su relevancia es principalmente metodológica: documenta con hashes SHA-256 el linaje completo de compresión de un MoE y constituye la etapa intermedia previa a un ajuste final con QLoRA de rango 32. No obstante, es un artefacto de investigación sin ajuste de instrucciones, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha; el propio autor indica que requiere evaluación por tarea y fine-tuning sustantivo antes de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con tabla n-gram PLE; linaje Qwen (tag `qwen4_exp_text`) |
| Parámetros totales | 74.615.655.680 según la model card; 74.935.657.161 según los tensores safetensors del repositorio (discrepancia no aclarada por el autor) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 en este repositorio; la colección del autor incluye además un artefacto GGUF y un artefacto NVFP4 en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); requiere el instalador de compatibilidad `transformers_compact_runtime.py` y una revisión fijada de Transformers (Qwen4 experimental) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 32 capas con 288 expertos enrutados por capa (frente a los 384 del checkpoint de origen) y una tabla n-gram PLE como componente adicional de representación. La tabla PLE compactada contiene 160.000.768 filas, que sustituyen a las 320.001.446 filas originales mediante una tabla de remapeo global; el autor publica los SHA-256 del manifiesto de selección, del PLE compactado, del remapeo global y del índice del modelo. Como validación estructural se ejecutó un forward estructural y una generación determinista en dos GPU, con resultado satisfactorio.

Este checkpoint concreto no incluye ajuste de instrucciones ni RLHF/DPO. Según el linaje declarado, la etapa de post-entrenamiento (QLoRA de rango 32 sobre 12.558 trazas normalizadas, con 9.336.692 tokens supervisados de asistente, procedentes de mezclas de trazas de familias como Fable 5, GLM 5.2, Kimi K3, Claude Opus 4.7, Qwen3.8-Max y GPT-5.6-Sol) corresponde al release GGUF final, no a este artefacto. El checkpoint de origen tenía 200.431.688.376 bytes de tensores, de modo que esta versión reduce el peso serializado en aproximadamente un 25%.

## Capacidades

- Generación de texto autoregresiva y continuaciones de documento (pipeline declarado: `text-generation`).
- Base para razonamiento matemático y STEM, según la composición de trazas declarada en el linaje del proyecto; no verificable con benchmarks en este repositorio.
- Base para generación y depuración de código, igualmente según el linaje declarado.
- Soporte previsto de tool calling y uso agéntico de herramientas: el proyecto declara trazas de "agentic tool use" y la etiqueta `agentic`, pero esta capacidad depende de la etapa de QLoRA que no está aplicada en este checkpoint.
- Recuperación (retrieval) y razonamiento multi-paso como parte de la mezcla de entrenamiento declarada en la etapa final.
- Conversacional: etiqueta `conversational` presente, aunque sin ajuste de instrucciones en este artefacto.
- Capacidades de visión o audio: no disponibles, no se mencionan en la documentación.
- Modo "thinking" explícito: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).

## Casos de uso

- Investigación en compresión de modelos MoE: permite reproducir y auditar la ablación completa (profundidad 48→32, expertos 384→288, PLE 320M→160M filas) usando los hashes SHA-256 publicados y el holdout disjunto de 5 millones de tokens como referencia metodológica.
- Punto de partida para ajuste supervisado: el propio linaje indica que este es el checkpoint previo al QLoRA de rango 32, por lo que se puede reentrenar con trazas propias de dominio en lugar de partir del modelo base original de 200 GB.
- Generación de datos sintéticos para razonamiento matemático y STEM: útil como generador en pipelines de destilación, siempre que se valide la calidad por tarea antes de usar las salidas.
- Asistencia de código en pipelines internos (revisión estática, generación de tests, parcheo): requiere un fine-tuning previo de instrucciones, ya que este artefacto no está alineado.
- Prototipado de agentes con tool calling: la línea del proyecto incluye trazas de uso agéntico de herramientas, de modo que sirve como base para experimentar con bucles multi-paso una vez aplicado el ajuste correspondiente.
- Generador en pipelines RAG sobre documentación técnica: viable como componente de generación, con la salvedad de que la ventana de contexto no está documentada y debe medirse empíricamente antes de dimensionar el recuperador.
- Despliegue on-premise con cuantización GGUF: al existir una release GGUF en la misma colección, es posible servir el modelo en clústeres pequeños sin depender de GPUs de centro de datos, a costa de degradación por cuantización no medida.
- Evaluación comparativa de métodos de poda en MoE: el checkpoint y su evidencia de validación permiten enfrentar políticas de selección (activation-aware frente a baseline de frecuencia) bajo condiciones reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta que las pruebas de cobertura estructural y de la tabla n-gram pasaron, junto con un smoke test de forward estructural y generación determinista en dos GPU. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones cuantitativas con modelos de referencia.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos suman 150,51 GB; con caché KV, activaciones y margen de runtime, se estima un mínimo práctico de 165-180 GB (estimación aritmética a partir del tamaño de los tensores, no una cifra publicada por el autor).
- GPU recomendadas: 3x H100 80 GB o 4x A100 80 GB para BF16 con margen operativo; 2x H100 80 GB (160 GB) es el límite teórico y coincide con el escenario de dos GPU en el que el autor ejecutó el smoke test.
- Cuantización: en Q8 los pesos quedarían en torno a 75-80 GB y en Q4 en torno a 40-45 GB, estimaciones por proporción directa sobre los pesos BF16, sin cifras oficiales publicadas.
- GPU de consumo: no cabe en una única GPU de consumo (24 GB). Con GGUF en Q4 podría repartirse en 2x RTX 4090 o 2x RTX 3090 (48 GB), presumiblemente con contexto reducido.
- Opciones de despliegue: vLLM, SGLang o TGI con tensor parallelism para BF16; llama.cpp u Ollama para el artefacto GGUF; TensorRT-LLM con NVFP4 sobre hardware Blackwell para el artefacto NVFP4 de la colección. Este repositorio exige además el instalador `transformers_compact_runtime.py` con la revisión fijada de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Benchmarks comparables |
|---|---|---|---|---|---|
| Qwen3.8-Perian-BF16 | 74,6-74,9 B (MoE) | no disponible | no disponible | Apache 2.0 | no disponibles |
| Qwen2.5-72B-Instruct | 72,7 B (denso) | 72,7 B | 128 k | Licencia Qwen (con restricciones) | no comparables (sin datos del modelo evaluado) |
| Llama-3.3-70B-Instruct | 70 B (denso) | 70 B | 128 k | Llama 3.3 Community License | no comparables (sin datos del modelo evaluado) |
| Mixtral-8x22B-Instruct | 141 B (MoE) | ~39 B | 64 k | Apache 2.0 | no comparables (sin datos del modelo evaluado) |

La comparación cuantitativa de rendimiento no es posible: el modelo evaluado no publica resultados de benchmarks. En términos de disponibilidad, Qwen3.8-Perian-BF16 es un checkpoint de investigación sin ajuste de instrucciones, mientras que las tres alternativas son modelos instruct ya alineados y ampliamente desplegados. Como referencia de tamaño, el modelo evaluado se sitúa entre los modelos densos de 70 B y el MoE de 141 B, con la particularidad de incorporar una tabla n-gram PLE compactada que no existe en las alternativas.

## Limitaciones y advertencias

- No es un modelo instruct: carece de ajuste de instrucciones, RLHF o DPO. El uso directo en conversación producirá salidas no alineadas.
- El propio autor advierte de que el checkpoint requiere evaluación por tarea y fine-tuning sustantivo posterior a la poda antes de cualquier despliegue en producción.
- No hay benchmarks publicados: cualquier afirmación de calidad es, a día de hoy, no verificada.
- Sin datos de idiomas: se desconoce el soporte multilingüe real y el comportamiento fuera del inglés.
- Sin datos de longitud de contexto: no se puede dimensionar caché KV, coste de memoria ni estrategias de RAG.
- Sin datos de sesgos ni de evaluación de seguridad: no se ha documentado ningún análisis de sesgo, toxicidad o robustez.
- Riesgo de alucinación no medido: al ser un modelo base sin alineación, la tasa de afirmaciones incorrectas no está caracterizada.
- Dependencia de runtime frágil: la tabla PLE compactada exige una tabla de remapeo y el instalador `transformers_compact_runtime.py` con una revisión concreta y experimental de Transformers (Qwen4), lo que puede romper la compatibilidad con versiones estándar del ecosistema.
- El artefacto con licencia Apache 2.0 permite uso comercial, pero la licencia no cubre los riesgos derivados de desplegar un checkpoint sin evaluar; además, el linaje declara trazas generadas por modelos de terceros cuyas condiciones de uso conviene revisar.
- Repositorio con 0 descargas y 0 likes: no hay validación independiente por parte de la comunidad.
- Discrepancia de recuento de parámetros entre la model card (74.615.655.680) y los tensores safetensors (74.935.657.161) sin explicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakeatx/Qwen3.8-Perian-BF16
- Modelo base declarado en la model card: https://huggingface.co/sjakek/slimder-qwen38-ream288-depth32-agentic (revisión 7134cf0f0b9db5450e17f7db5c090daeb58bca7b)
- Modelo base declarado en los metadatos de Hugging Face: https://huggingface.co/jakeatx/slimder-qwen38-ream288-depth32-agentic
- Release GGUF final del proyecto: https://huggingface.co/jakeatx/Qwen3.8-Perian-GGUF
- Colección de checkpoints Qwen3.8 Perian: https://huggingface.co/collections/jakeatx/qwen38-perian-checkpoints-6aa33bb7acf0eba80edece40
- Evidencia de selección y holdout: https://huggingface.co/sjakek/slimder-qwen38-ngram-activation-refine-20260901
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas genéricas de resolución de crucigramas y documentación sobre texto de marcador de posición, sin relación con el artefacto.
- Paper o blog técnico: no disponible.
