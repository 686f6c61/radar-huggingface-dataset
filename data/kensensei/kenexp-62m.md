# KenSensei/KenExp-62M

## Resumen

KenExp-62M es un modelo de lenguaje experimental de 62,5 millones de parámetros entrenado desde cero por el usuario KenSensei sobre el corpus TinyStories. Su interés no reside en el rendimiento bruto, sino en que reproduce a pequeña escala varios componentes arquitectónicos atribuidos a DeepSeek-V4-Flash: optimizador Muon híbrido, residual stream con 4 conexiones hiperbólicas restringidas a variedad (mHC mediante Sinkhorn-Knopp), una capa MoE de grano fino con 1 experto compartido y 8 enrutados (top-2 activos) y atención GQA con RoPE.

El modelo se publica como artefacto de investigación para estudiar cómo interactúan estas técnicas en un régimen de cómputo mínimo y con un dataset sintético de cuentos infantiles. No está pensado para uso en producción ni para tareas generales: el vocabulario, el dominio y el tamaño lo limitan a experimentación sobre dinámica de entrenamiento y análisis de arquitecturas MoE con conexiones residuales alternativas.

La licencia Apache 2.0 permite reutilización y modificación sin restricciones prácticas, lo que facilita replicar los experimentos. No se han publicado resultados de benchmarks ni detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset o el proceso de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE de grano fino, GQA con RoPE y residual stream de 4 vías con mHC (Sinkhorn-Knopp) |
| Parametros totales | 62.497.728 |
| Parametros activos | No disponible (MoE con 1 experto compartido + 8 enrutados, top-2 activos; el desglose por componente no se publica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin variantes GGUF) |
| Idiomas soportados | No disponible (entrenado sobre TinyStories, corpus en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un diseño decoder-only con atención Grouped-Query Attention de 8 cabezas de consulta y 2 cabezas de clave/valor, con codificación posicional rotatoria (RoPE). La innovación principal está en el residual stream: en lugar de una única conexión residual, emplea 4 flujos paralelos con Manifold-Constrained Hyper-Connections, donde la matriz de mezcla entre flujos se restringe mediante una iteración de Sinkhorn-Knopp para mantenerla en el conjunto de matrices doblemente estocásticas. La capa MoE es de grano fino, con un experto compartido siempre activo y 8 expertos enrutados con activación SwiGLU, de los que se seleccionan top-2 por token; el balanceo de carga se realiza mediante sesgos auxiliares sin pérdida auxiliar (aux-loss-free bias balancing).

El entrenamiento utiliza un optimizador híbrido: Muon (momento ortogonalizado con iteraciones de Newton-Schulz) para los parámetros matriciales y AdamW para el resto. El corpus es TinyStories, un dataset sintético de cuentos cortos en inglés generado para estudiar el aprendizaje en modelos pequeños. No se especifican el número de tokens vistos, la composición exacta del dataset, la longitud de contexto durante el entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto narrativo breve en inglés, limitado al dominio de TinyStories (cuentos infantiles simples).
- Razonamiento de un solo paso sobre estructuras narrativas muy sencillas; sin evidencia de razonamiento multi-paso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-turno.
- Capacidades multilingües no disponibles: el corpus de entrenamiento es monolingüe en inglés.
- Sin modo thinking, visión, audio ni otras modalidades.
- El propósito declarado es experimental: servir de banco de pruebas para componentes arquitectónicos (Muon, mHC, MoE de grano fino, GQA).

## Casos de uso

- Estudio de optimizadores híbridos: replicar el entrenamiento con Muon + AdamW y comparar curvas de pérdida frente a AdamW puro en un régimen de 62M parámetros, usando TinyStories como benchmark controlado.
- Análisis de conexiones residuales restringidas a variedad: medir estabilidad del entrenamiento y propagación de gradientes con 4 flujos mHC frente a residuales estándar en la misma arquitectura y dataset.
- Investigación sobre balanceo de carga en MoE: evaluar el efecto del sesgo auxiliar sin pérdida auxiliar (aux-loss-free) sobre la distribución de tokens entre los 8 expertos enrutados y el experto compartido.
- Docencia y divulgación: ilustrar el funcionamiento interno de un MoE con GQA y RoPE en un modelo que cabe en cualquier GPU consumer y se entrena en horas.
- Pruebas de infraestructura de entrenamiento: validar pipelines de PyTorch, checkpoints en safetensors y monitorización de métricas antes de escalar a modelos mayores.
- Generación de cuentos sintéticos para aumento de datos: producir narrativas simples en inglés que sirvan como material de preentrenamiento o evaluación de modelos pequeños, siempre con revisión humana por la calidad limitada del modelo.
- Reproducibilidad de técnicas de DeepSeek-V4-Flash: comparar implementaciones de mHC y MoE de grano fino en un entorno de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp32 (62,5M parámetros × 4 bytes), unos 0,13 GB en fp16/bf16 y alrededor de 0,07 GB en cuantización de 8 bits. El overhead de activaciones es despreciable para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer, incluida una GTX 1650 o una iGPU con memoria unificada.
- Opciones de despliegue: PyTorch nativo con `transformers` o carga directa de safetensors; no hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están validados para esta arquitectura.
- Latencia y throughput: no disponibles. Por tamaño, la inferencia en una GPU moderna sería del orden de milisegundos por token, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenExp-62M | 62,5M | No disponible | MoE + GQA + mHC | Apache 2.0 | Hugging Face |
| TinyStories-33M (Eldan & Li) | 33M | No disponible | Transformer denso | No disponible en la información | Referencia académica |
| GPT-2 small | 124M | 1024 | Transformer denso | MIT | Hugging Face |
| SmolLM-135M | 135M | 2048 | Transformer denso | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a tamaño, arquitectura y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TinyStories: el vocabulario y la distribución son muy estrechos; el modelo fallará fuera de narrativas infantiles simples en inglés.
- Riesgo alto de alucinación y de incoherencia en prompts que se alejen del dominio de entrenamiento.
- No hay información sobre sesgos; el corpus sintético de TinyStories puede contener estereotipos presentes en la generación original del dataset.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Sin datos de alineación (RLHF/DPO) ni de evaluación de seguridad; no apto para producción ni para interacción con usuarios finales sin filtros.
- El desglose de parámetros activos del MoE no se publica, lo que dificulta estimar el coste real de cómputo por token.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece calidad suficiente para aplicaciones comerciales reales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KenSensei/KenExp-62M
- TinyStories (paper de referencia del dataset): https://arxiv.org/abs/2305.07759
- Muon (optimizador con ortogonalización de Newton-Schulz): no disponible en la información proporcionada
- DeepSeek-V4-Flash (arquitectura de referencia): no disponible en la información proporcionada
