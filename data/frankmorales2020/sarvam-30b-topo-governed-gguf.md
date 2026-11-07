# frankmorales2020/sarvam-30b-topo-governed-gguf

## Resumen

Sarvam-30B Topo-Governed GGUF es una cuantización en formato Q8_0 del modelo base Sarvam-30B, un transformer de arquitectura Mixture-of-Experts (MoE) desarrollado originalmente por Sarvam AI. Esta variante ha sido publicada por Frank Morales Aguilera bajo el paraguas de Sovereign Machine Laboratory (SOMALA), aplicando un marco propio denominado Topological Continual Backpropagation (Topo-CBP) junto con Arithmetic Spectral Theory (AST). El resultado es un artefacto GGUF de aproximadamente 34,2 GB con 32.152.650.368 parámetros totales, pensado para inferencia local mediante llama.cpp y compatible con endpoints.

La propuesta central del autor es el concepto de "governed AI": incorporar invariantes topológicos en el proceso de retropropagación para mitigar el olvido catastrófico y la deriva de gradientes durante el aprendizaje continuo, sin depender de buffers de repetición (rehearsal) pesados. Se trata, por tanto, de una variante orientada a investigación en estabilidad-plasticidad y aprendizaje continuo, más que a un modelo de propósito general con benchmarks publicados.

Es relevante ahora porque combina dos tendencias: la cuantización GGUF de modelos MoE de gran tamaño para despliegue en hardware asequible, y la experimentación abierta con técnicas de gobernanza topológica del entrenamiento. No obstante, la información pública disponible es limitada: no hay resultados de benchmarks, no se detalla la composición del dataset ni el proceso de alineación, y la model card es fundamentalmente descriptiva del marco teórico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer |
| Parametros totales | 32.152.650.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `n_ctx=4096`) |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | no disponible (etiqueta `multi-lingual` sin listado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q8_0); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de 32.152.650.368 parámetros totales, según los datos reales de safetensors del repositorio. La variante publicada aquí aplica Topo-CBP, un marco que, según el autor, introduce invariantes topológicos directamente en la ruta de retropropagación para preservar las propiedades estructurales de la variedad de pesos durante las actualizaciones. El autor afirma que esto permite un aprendizaje continuo sin deriva de gradientes ni olvido catastrófico, y que equilibra el enrutamiento de expertos sin necesidad de memorias de repetición extensas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el número de expertos, el tamaño de cada uno ni la estrategia de enrutamiento (top-k, balanceo de carga, etc.). La cuantización se realizó directamente desde los shards de Hugging Face a Q8_0 GGUF mediante pipelines locales sobre NVMe, y el autor indica que se verificó mediante inspección estructural de cabeceras.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Soporte multilingüe declarado mediante la etiqueta `multi-lingual`, aunque sin listado de idiomas concretos.
- Aprendizaje continuo con preservación de conocimiento previo (según el marco Topo-CBP del autor).
- Aprendizaje multi-tarea secuencial sin olvido catastrófico declarado (según el checkpoint relacionado `sarvam-30b-topo-governed-cbp-multi`).
- Inferencia local vía llama.cpp / llama-cpp-python con offload completo a GPU.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo sirve como banco de pruebas para validar las afirmaciones de Topo-CBP sobre estabilidad-plasticidad en adaptaciones secuenciales de dominio, comparando la retención de conocimiento frente a fine-tuning convencional.
- Despliegue local en estación de trabajo con GPU única: con 34,2 GB en Q8_0, puede cargarse con `n_gpu_layers=-1` en GPUs de 40-48 GB (A100 40GB, A6000, L40S) para prototipos de generación de texto sin depender de servicios en la nube.
- Evaluación de cuantización Q8_0 en arquitecturas MoE: útil para medir la degradación de precisión y el comportamiento del enrutamiento de expertos tras la cuantización de 8 bits frente al modelo base en safetensors.
- Generación de texto conversacional en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local con licencia Apache 2.0, encaja en escenarios donde no se permite enviar datos a APIs externas.
- Reproducibilidad de pipelines de conversión: el notebook enlazado (`sarvam2gguf.ipynb`) documenta el flujo de conversión de shards a GGUF, reutilizable para otros modelos MoE de tamaño similar.
- Docencia y experimentación con marcos teóricos alternativos: permite ilustrar conceptos de teoría espectral aritmética y gobernanza topológica aplicados a redes neuronales en un modelo real de 32B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 34-36 GB solo para los pesos, más overhead de contexto KV (dependiente de `n_ctx` y del número de capas/expertos, no documentado).
- GPU recomendadas para carga completa: NVIDIA A100 40GB, A6000 48GB, L40S 48GB, H100 80GB. En GPUs de 24 GB (RTX 4090, 3090) no cabe en Q8_0 con offload total; requeriría offload parcial a CPU o una cuantización menor no publicada en este repositorio.
- Opciones de despliegue: llama.cpp y llama-cpp-python (soporte nativo GGUF); vLLM y TGI no están confirmados para este artefacto en la información disponible.
- Latencia y throughput: no disponibles. Dependerán del número de expertos activos por token, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sarvam-30B Topo-Governed GGUF (este) | 32,15B (MoE) | no disponible | GGUF Q8_0 | Apache 2.0 | Variante gobernada con Topo-CBP; sin benchmarks |
| Sarvam-30B (base, sarvamai) | 32,15B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo original de Sarvam AI; referencia directa |
| Sarvam-30B Topo-Governed CBP Multi-Task | 32,15B (MoE) | no disponible | PyTorch | Apache 2.0 | Checkpoint relacionado del mismo autor, orientado a multi-tarea secuencial |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de MMLU, HumanEval, GSM8K ni de retención tras aprendizaje continuo.
- Las afirmaciones de "cero olvido catastrófico" y "cero deriva" provienen exclusivamente del autor y no están verificadas de forma independiente.
- No se documenta el número de parámetros activos ni la configuración de expertos, lo que impide estimar coste computacional real por token.
- Idiomas soportados sin especificar; la etiqueta `multi-lingual` no garantiza cobertura ni calidad en castellano.
- Riesgo de alucinación inherente a modelos generativos sin datos de alineación publicados.
- Contexto de ejemplo limitado a 4096 tokens en la model card; no se confirma una ventana mayor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base Sarvam-30B antes de producción.
- Fecha de creación del repositorio posterior a la fecha actual de referencia; tratar los metadatos con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/sarvam-30b-topo-governed-gguf
- Modelo base: https://huggingface.co/sarvamai/sarvam-30b
- Checkpoint relacionado (CBP Multi-Task): https://huggingface.co/frankmorales2020/sarvam-30b-topo-governed-cbp-multi
- Variante multi-tarea adicional: https://huggingface.co/frankmorales2020/new-sarvam-30b-topo-governed-cbp-multi
- Notebook de conversión a GGUF: https://github.com/frank-morales2020/AST/blob/main/sarvam2gguf.ipynb
