# NextTransformer/MoR-49B-Tokens

## Resumen

MoR-49B-Tokens es un checkpoint de investigación desarrollado por NextTransformer (proyecto Interactive-Active-AI), un modelo de lenguaje causal de tipo transformer con arquitectura "looped" y mecanismo Mixture-of-Recursions (MoR). Con 927.994.042 parámetros totales y una ventana de contexto de 2.048 tokens, se presenta como el checkpoint final de un estudio comparativo de arquitecturas dentro del proyecto NextTransformer, entrenado sobre el corpus ClimbMix durante 46.875 actualizaciones (equivalente a 49.152 millones de tokens de entrenamiento, de ahí el sufijo "49B" del repositorio).

El interés del modelo no reside en su rendimiento absoluto, sino en su valor como artefacto de investigación reproducible: el autor publica los pesos en safetensors junto con la configuración exacta, el tokenizador en formato tiktoken serializado y los registros de ejecución (run records) en el repositorio de GitHub. La innovación central es el mecanismo MoR, que decide en cada frontera de recursión qué tokens continúan procesándose, una variante de computación adaptativa por token.

Se trata de un modelo de escala pequeña (menos de mil millones de parámetros) y contexto corto, orientado a experimentación académica más que a despliegue en producción. No dispone de model card extensa, licencia declarada ni información sobre idiomas, ajuste por instrucciones o evaluación en benchmarks estándar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con recursión ("looped") y mecanismo Mixture-of-Recursions (MoR) |
| Parametros totales | 927.994.044 |
| Parametros activos | no disponible (no se declara como MoE; el mecanismo MoR selecciona tokens por recursión, no expertos) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `model_config.json` + tokenizador `tokenizer.tiktoken.json` |
| Tokens de entrenamiento | 49.152 millones (46.875 actualizaciones) |
| Corpus de entrenamiento | ClimbMix |
| Tokenizador | tiktoken (BPE, con tokens especiales como `<\|bos\|>`) |
| Libreria | PyTorch (implementación `nexttransformer`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con capas recursivas ("looped"): un bloque de parámetros se reutiliza a lo largo de varias iteraciones o "pasos" de recursión, en lugar de apilar capas independientes. Sobre esta base se aplica el mecanismo MoR (Mixture-of-Recursions), que en cada frontera de recursión decide qué tokens continúan procesándose y cuáles se detienen, permitiendo una asignación de cómputo variable por token. El repositorio incluye un método `set_step` en la implementación, lo que sugiere que el modelo puede ejecutarse con distintos números de pasos de recursión, y el ejemplo de carga fija el paso en 46.875 (el total de actualizaciones de entrenamiento).

El entrenamiento consistió en preentrenamiento de lenguaje causal sobre ClimbMix durante 46.875 actualizaciones, hasta completar 49.152 millones de tokens. No se documenta en la información disponible si hubo fases de ajuste supervisado, RLHF o DPO; las etiquetas del repositorio indican únicamente `pretrained` y `causal-lm`. Tampoco se detalla la composición del dataset ClimbMix ni la mezcla de idiomas. La evaluación final reportada por el autor es de validación BPB (bits por byte) de 0,6838 y CORE-22 (×100) de 30,37.

## Capacidades

- Generación de texto autoregresiva causal: el ejemplo de la model card muestra predicción del siguiente token a partir de un prompt.
- Modelado de lenguaje puro: no hay evidencia de ajuste por instrucciones, diálogo o formato chat.
- Razonamiento condicionado por recursión adaptativa: el mecanismo MoR permite variar el cómputo por token en cada frontera de recursión.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación sobre computación adaptativa: el modelo sirve como referencia reproducible para estudiar cómo el mecanismo MoR decide qué tokens continúan en cada recursión, comparando su BPB (0,6838) y CORE-22 (30,37) con otras variantes del proyecto NextTransformer.
- Reproducción de experimentos de arquitectura: al publicarse pesos, configuración y tokenizador, permite replicar el entrenamiento y la evaluación en entornos académicos con hardware modesto.
- Estudio de transformers recursivos ("looped"): útil para analizar el compromiso entre reutilización de parámetros y calidad, dado que un mismo bloque se aplica en varias iteraciones.
- Evaluación de tokenizadores tiktoken serializados: el checkpoint incluye el tokenizador completo en JSON, lo que facilita experimentos de tokenización comparada.
- Baseline en comparativas de eficiencia: con menos de mil millones de parámetros y 2.048 tokens de contexto, sirve como punto de partida de bajo coste frente a modelos mayores en estudios de escalado.
- Docencia y formación: su tamaño (2,8 GB en safetensors) permite cargarlo en CPU o en una GPU de consumo para demostrar conceptos de recursión y atención causal en clase.
- Fine-tuning exploratorio: al ser un checkpoint preentrenado sin ajuste, puede servir de base para experimentos de adaptación a dominios concretos, siempre que se resuelva la ambigüedad de licencia.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---:|
| Validation BPB | 0,6838 |
| CORE-22 (×100) | 30,37 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Los únicos datos de evaluación son los reportados por el autor en la model card y en los registros del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,7 GB solo para pesos (927.994.044 parámetros × 4 bytes), más activaciones y caché KV para 2.048 tokens.
- VRAM estimada en FP16/BF16: aproximadamente 1,9 GB para pesos, más overhead de activaciones; holgado en GPUs de consumo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos (no se publican pesos cuantizados; requeriría cuantización manual).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para inferencia, aunque pueden usarse para entrenamiento o evaluación por lotes.
- Cabe en GPU de consumo: sí, con margen amplio en FP16 en tarjetas de 8 GB o más.
- Opciones de despliegue: la model card solo documenta carga directa con PyTorch y la librería `nexttransformer`; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, y al no existir pesos GGUF no es desplegable en llama.cpp sin conversión previa.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| NextTransformer MoR-49B-Tokens | 927.994.044 | 2.048 | Transformer recursivo con MoR | no disponible | Pesos safetensors en HF |
| Modelos tipo GPT-2 (1.5B) | ~1.500 millones | 1.024 | Transformer causal denso | MIT (variantes) | Amplia, con GGUF y soporte en llama.cpp |
| TinyLlama 1.1B | ~1.100 millones | 2.048 | Transformer causal denso | Apache 2.0 | Amplia, con cuantizaciones y soporte en múltiples runtimes |
| Pythia-1B | ~1.000 millones | 2.048 | Transformer causal denso | Apache 2.0 | Pesos en HF, orientado a investigación |

La comparación con alternativas de escala similar es limitada: MoR-49B-Tokens no declara licencia, no ofrece cuantizaciones ni integración con runtimes estándar, y su evaluación se reduce a BPB y CORE-22, métricas no directamente comparables con los benchmarks publicados por TinyLlama o Pythia. Su ventaja diferencial es la arquitectura MoR y la reproducibilidad del experimento, no el rendimiento bruto.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución; esto bloquea su adopción en producción sin aclaración del autor.
- Contexto muy corto (2.048 tokens): insuficiente para tareas de documento largo, conversaciones extensas o RAG con muchos fragmentos.
- Modelo exclusivamente preentrenado: no ha pasado por ajuste por instrucciones ni alineación, por lo que no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- Idiomas no documentados: se desconoce la cobertura lingüística y el equilibrio del corpus ClimbMix.
- Riesgo de alucinación: inherente a un modelo causal de menos de mil millones de parámetros sin alineación; no hay evaluaciones de factualidad.
- Sesgos desconocidos: al no publicarse la composición del dataset ni análisis de sesgo, no es posible evaluar riesgos de toxicidad o estereotipos.
- Dependencia de una implementación concreta: requiere la librería `nexttransformer` fijada a un commit específico de GitHub, lo que añade fragilidad en producción y riesgo de abandono del proyecto.
- Sin soporte en runtimes estándar: no hay GGUF, no hay integración con vLLM, llama.cpp, Ollama o TGI, y no se publican mediciones de latencia o throughput.
- Métricas de evaluación limitadas: BPB y CORE-22 no permiten comparar directamente con benchmarks convencionales; el rendimiento real en tareas downstream es desconocido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/MoR-49B-Tokens
- Repositorio NextTransformer en GitHub: https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura MoR: https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/methods/mor.json
- Registro de ejecución (run record): https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/runs/mor.json
