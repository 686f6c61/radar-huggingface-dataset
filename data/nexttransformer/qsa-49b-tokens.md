# NextTransformer/QSA-49B-Tokens

## Resumen

NextTransformer QSA es un checkpoint de modelo de lenguaje causal (causal-lm) desarrollado por NextTransformer, publicado como parte de una comparativa de arquitecturas denominada "NextTransformer 49.152B-token". El modelo incorpora un mecanismo de atención dispersa (sparse attention) denominado QSA (Qwen Sparse Attention), que agrupa micro-bloques de claves antes de seleccionar el contexto histórico relevante. Cuenta con 1.378.420.488 parámetros reales según los pesos en safetensors y una longitud de contexto de 2.048 tokens.

El modelo fue preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones. Es relevante en el contexto de investigación porque documenta una comparación controlada de arquitecturas de atención eficiente: el checkpoint transfiere únicamente el mezclador QSA, sin las capas híbridas del sistema original ni la receta de entrenamiento completa. Esto lo convierte en una pieza de análisis para estudiar el comportamiento de la atención dispersa aislada, más que en un modelo listo para producción.

La ficha refleja exclusivamente los datos publicados por el autor. No hay información sobre licencia, idiomas soportados ni benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención dispersa QSA (Qwen Sparse Attention); pooling de bloques de clave de 4 tokens para scoring del indexador |
| Parametros totales | 1.378.420.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors); tokenizer en formato tiktoken JSON |

## Arquitectura y entrenamiento

El modelo es un transformer causal con un mezclador de atención dispersa QSA. El mecanismo agrupa claves en bloques de 4 tokens que se agrupan (pooled) para el scoring del indexador; la atención selecciona bloques históricos completamente visibles y conserva la cola no finalizada, que puede añadir hasta 3 tokens adicionales. Según la model card, el checkpoint excluye explícitamente el híbrido GDN/QSA, el MoE, los residuales con gating, el MTP (multi-token prediction) y el preentrenamiento continuado a 256K, de modo que solo se transfiere el mezclador QSA.

El entrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones, con un total de 49.152B tokens de entrenamiento (el "49B" del nombre del repositorio hace referencia a tokens, no a parámetros). No se detalla la composición del dataset ni si hubo fases de RLHF o DPO. El autor indica que el registro de ejecución reporta el entrenamiento completado y la auditoría de cómputo acumulada del trainer, pero que la auditoría independiente de solo lectura sigue pendiente.

## Capacidades

- Generación de texto causal autoregresiva (pipeline text-generation).
- Modelo base preentrenado (pretrained), sin ajuste instruccional documentado.
- Atención dispersa con selección de bloques históricos, orientada a eficiencia en contextos de hasta 2.048 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Tokenizer basado en tiktoken con token especial `<|bos|>`.

## Casos de uso

- Investigación sobre atención dispersa: el modelo permite estudiar de forma aislada el comportamiento del mezclador QSA frente a atención densa, ya que el checkpoint excluye capas híbridas y MoE, lo que facilita comparaciones controladas en experimentos académicos.
- Reproducción de resultados de la comparativa NextTransformer: sirve para verificar las métricas publicadas (BPB de validación 0,6681 y CORE-22 de 29,82) sobre el dataset ClimbMix y validar la implementación del repositorio.
- Evaluación de eficiencia de contexto: con 2.048 tokens de ventana y atención por bloques de 4 tokens, es adecuado para medir el ahorro computacional del indexado disperso en tareas de modelado de lenguaje de longitud media.
- Generación de texto de dominio general en prototipos: puede emplearse para experimentar con generación de siguiente token en entornos de investigación con CPU o GPU única, dado su tamaño de 1,38B parámetros.
- Base para fine-tuning experimental: al ser un checkpoint preentrenado, puede servir como punto de partida para ajustes supervisados en dominios concretos, siempre que se resuelva la licencia.
- Estudio de tokenizers tiktoken en pipelines propios: el formato del tokenizer (JSON con mergeable_ranks en base64) permite integrarlo en herramientas que ya usan tiktoken para analizar tokenización.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0.6681 |
| CORE-22 (×100) | 29.82 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.378.420.488 parámetros en precisión completa (fp32) se requieren aproximadamente 5,5 GB solo para pesos; el repositorio ocupa 4,2 GB en safetensors (probablemente bf16/fp16). En fp16/bf16, los pesos ocupan unos 2,8 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en contexto corto; A100, H100 o RTX 4090 son suficientes y holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. El ejemplo de la model card se ejecuta en CPU.
- Opciones de despliegue: la model card solo documenta la implementación oficial `nexttransformer` (instalable desde GitHub en el commit b2ea466) junto con `safetensors` y `tiktoken`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (atención dispersa a escala ~1,4B) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial está permitido; es un riesgo bloqueante para producción.
- Idiomas soportados no documentados: no hay garantía de cobertura multilingüe.
- Contexto limitado a 2.048 tokens, muy inferior al de modelos actuales; inadecuado para tareas de contexto largo.
- Es un modelo base preentrenado sin ajuste instruccional: no está optimizado para seguir instrucciones ni para diálogo.
- Riesgo de alucinación inherente a un modelo causal preentrenado sin alineamiento (sin RLHF/DPO documentado).
- El checkpoint excluye componentes del sistema original (híbrido GDN/QSA, MoE, gated residuals, MTP, preentrenamiento a 256K), por lo que su comportamiento no representa el sistema completo.
- La auditoría independiente de solo lectura del registro de entrenamiento está pendiente según el autor.
- Dependencia de una implementación concreta (`nexttransformer` en un commit específico de GitHub), lo que limita la portabilidad y el soporte de ecosistema.
- Sesgos conocidos: no disponibles; al entrenarse sobre ClimbMix sin documentación de filtrado, pueden persistir sesgos del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/QSA-49B-Tokens
- Arquitectura (JSON de resultados): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/qsa.json
- Registro de ejecución: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/qsa.json
- Repositorio de implementación: https://github.com/Interactive-Active-AI/NextTransformer.git (commit b2ea46627f7d0d5c9ef57a655c43b553558417d3)
