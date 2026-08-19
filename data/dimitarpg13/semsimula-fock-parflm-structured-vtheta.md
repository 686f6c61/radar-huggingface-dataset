# dimitarpg13/semsimula-fock-parflm-structured-vtheta

## Resumen

El modelo `semsimula-fock-parflm-structured-vtheta` es una variante estructurada del Fock-PARFLM v2.1, un modelo de lenguaje conservador desarrollado por dimitarpg13 dentro del marco Semantic Simulation. Sustituye el potencial escalar MLP \(V_\theta\) por una mezcla de \(K=8\) pozos cuadráticos diagonales (SQ3), manteniendo el potencial pairwise MLP \(V_\phi\) y el mecanismo de registros Fock (16 registros con disciplina LIFO y canal inverso). Con 18,2 millones de parámetros, es un modelo no-transformer, libre de atención, con inferencia de memoria constante y gradientes analíticos para el componente \(V_\theta\). Entrenado exclusivamente en inglés sobre el dataset TinyStories, alcanza una perplexity de validación de 10.90 (SQ3, K=8). Su relevancia radica en explorar arquitecturas basadas en mecánica lagrangiana y energía, ofreciendo una alternativa interpretable y computacionalmente ligera a los transformers convencionales, aunque con un rendimiento inferior en tareas estándar de modelado de lenguaje. El checkpoint publicado incluye una corrección de una fuga causal arquitectónica detectada en una auditoría posterior a la publicación, lo que añade una capa de rigor metodológico al proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 con \(V_\theta\) estructurado (SQ3: mezcla de 8 pozos cuadráticos diagonales) |
| Parametros totales | 18.194.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, probablemente fp32) |
| Idiomas soportados | inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (formato no especificado) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SPLM (Semantic Simulation Language Models), que se basa en principios de mecánica lagrangiana y energía. En lugar de atención, utiliza un campo de fuerza derivado de dos potenciales: un potencial escalar \(V_\theta\) (aquí una mezcla de pozos cuadráticos diagonales) y un potencial pairwise \(V_\phi\) (una MLP). Adicionalmente, incorpora un mecanismo de registros Fock: 16 partículas virtuales con puertas de creación estructuradas Q/K/V, disciplina de pila LIFO y un canal inverso opcional (que fue corregido para eliminar una fuga causal). La arquitectura es attention-free y promete inferencia con memoria constante. El entrenamiento se realizó sobre TinyStories (roneneldan/TinyStories), minimizando cross-entropy, sin RLHF ni DPO. El autor reporta una corrección post-publicación de una fuga causal en el canal inverso, que fue verificada con sondas bit-exactas y re-entrenamiento del modelo; el checkpoint actual incluye esta corrección (`prefix_causal_registers=True`). No se proporcionan detalles sobre el número de tokens ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Generación de texto en inglés, con modelado de lenguaje autorregresivo.
- Inferencia sin atención, lo que reduce el coste computacional y la memoria durante el despliegue.
- Gradientes analíticos para el potencial \(V_\theta\), eliminando la necesidad de autograd para ese componente.
- Interpretabilidad estructural: los centros atractores semánticos \(\mu_k(\xi)\) son legibles directamente desde los parámetros del modelo.
- Memoria constante durante la inferencia, gracias al mecanismo de registros Fock.
- Diseño basado en energía, lo que permite análisis de la dinámica interna mediante conceptos de mecánica lagrangiana.
- No soporta tool calling, agentes, visión ni capacidades multimodales.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el modelo sirve como banco de pruebas para estudiar modelos basados en energía y su viabilidad en NLP.
- Análisis de representaciones internas: los atractores explícitos y los potenciales permiten inspeccionar cómo se organiza el espacio semántico.
- Experimentos de eficiencia computacional: su inferencia con memoria constante lo hace adecuado para estudiar el trade-off entre rendimiento y consumo de recursos.
- Educación y divulgación: su tamaño reducido y su diseño interpretable lo convierten en un ejemplo didáctico de modelos no-transformer.
- Validación de correcciones arquitectónicas: el proceso de detección y corrección de la fuga causal ofrece un caso de estudio para auditorías de causalidad en modelos generativos.
- Comparación con modelos baseline: permite evaluar el impacto de la estructura del potencial en la perplexity frente a variantes con MLP.

## Benchmarks y rendimiento

El único resultado oficial del model-index es la perplexity de validación en TinyStories. El autor declara además valores comparativos en la model card, que se indican como no verificados.

| Modelo | Perplexity (TinyStories validación) | Fuente |
|---|---|---|
| semsimula-fock-parflm-structured-vtheta | 10.90 (SQ3, K=8) | model-index (no verificado) |
| Fock-PARFLM v2.1 (MLP \(V_\theta\)) | 9.70 | declarado por el autor en la model card |
| Fock-PARFLM v2.1 (versión leaky) | 10.36 | declarado por el autor en la model card |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: ~72 MB en fp32 (18,2 M parámetros × 4 bytes), más overhead de activaciones; cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) o CPU; no requiere hardware especializado.
- Cabe en GPUs de consumo como RTX 3060, RTX 4090, etc., con margen amplio.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con Hugging Face Transformers (si se adapta), o directamente con PyTorch. No se mencionan soportes para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, pero por su tamaño y ausencia de atención se espera una inferencia muy rápida en hardware modesto.

## Comparativa con modelos similares

Dentro de la familia SPLM, se pueden comparar las variantes que comparten dataset y objetivo. Los datos de la tabla provienen de la model card y de la página del modelo Fock-PARFLM v2.1.

| Modelo | Parámetros | Contexto | Perplexity (TinyStories) | Licencia |
|---|---|---|---|---|
| semsimula-fock-parflm-structured-vtheta | 18,2 M | no disponible | 10.90 | CC-BY-4.0 |
| semsimula-fock-parflm (MLP \(V_\theta\)) | 17,4 M (según card) | no disponible | 9.30 (según búsqueda web) | CC-BY-4.0 |
| semsimula-parflm-multixi | no disponible | no disponible | no disponible | CC-BY-4.0 |

No se dispone de comparativas con modelos externos de tamaño similar (p. ej., GPT-2 small) por falta de datos públicos.

## Limitaciones y advertencias

- Entrenado exclusivamente en TinyStories, un dataset de historias simples para niños; su vocabulario y dominio son muy limitados y no es adecuado para tareas generales de lenguaje.
- La perplexity reportada (10.90) es alta en comparación con modelos convencionales del mismo tamaño, lo que indica una capacidad de modelado limitada.
- El modelo es experimental y no está optimizado para producción; no se recomienda su uso en aplicaciones comerciales sin una evaluación exhaustiva.
- Riesgo de alucinación y sesgos inherentes a los datos de entrenamiento (historias infantiles), que pueden reflejar estereotipos o contenido simplificado.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero la falta de documentación sobre el pipeline de entrenamiento y la ausencia de benchmarks estándar dificultan su adopción en entornos serios.
- La corrección de la fuga causal, aunque verificada, introduce una pequeña penalización en perplexity (+0.54 PPL) que debe tenerse en cuenta al comparar con versiones anteriores.

## Enlaces

- [Hugging Face: dimitarpg13/semsimula-fock-parflm-structured-vtheta](https://huggingface.co/dimitarpg13/semsimula-fock-parflm-structured-vtheta)
- [Repositorio del paper (GitHub): semsimula-paper](https://github.com/dimitarpg13/semsimula-paper)
- [Nota de auditoría de la fuga causal (GitHub)](https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Causal_Leak_Audit_Results.md)
- [DOI del marco Semantic Simulation](https://doi.org/10.5281/zenodo.19712427)
- [Modelo base Fock-PARFLM v2.1 (Hugging Face)](https://huggingface.co/dimitarpg13/semsimula-fock-parflm)
