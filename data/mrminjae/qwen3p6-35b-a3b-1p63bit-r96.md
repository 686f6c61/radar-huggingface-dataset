# mrminjae/qwen3p6-35b-a3b-1p63bit-r96

## Resumen

Qwen3.6-35B-A3B-1.63bit-r96 es un checkpoint de investigación publicado por el usuario mrminjae sobre el modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización extrema aplicada selectivamente a los expertos enrutados (routed experts) de una arquitectura MoE, que quedan comprimidos a una media de 1,63 bits por peso, mientras que el resto de los pesos del modelo se mantienen en BF16. El resultado se almacena ya dequantizado en tensores BF16, de modo que carga con transformers y vLLM estándar sin necesidad de kernels especiales.

El problema que aborda es el coste de memoria de un MoE de 35.107.181.936 parámetros totales: al mantener solo los expertos en precisión reducida, se busca demostrar que es posible degradar agresivamente los parámetros menos activos sin romper la compatibilidad con el ecosistema de inferencia existente. Es relevante ahora porque explora el límite práctico de la cuantización sub-2-bit en MoE y porque su distribución como pesos BF16 dequantizados elimina la fricción de despliegue, aunque a costa de no reducir el tamaño del repositorio (70,2 GB).

La información pública es muy escasa: el autor lo etiqueta explícitamente como checkpoint de investigación interno, no hay datos de benchmarks, idiomas, licencia propia ni detalles del dataset o método de cuantización más allá de la cifra de 1,63 bits y el identificador interno r96.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (qwen3_5_moe), según tag de la librería |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 1,63 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la del modelo base) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo es una cuantización del MoE Qwen/Qwen3.6-35B-A3B, no un entrenamiento desde cero. La innovación declarada consiste en aplicar una precisión media de 1,63 bits exclusivamente a los expertos enrutados, manteniendo el resto de la red (atención, embeddings, router, capas densas) en BF16. Los pesos resultantes se guardan ya dequantizados en tensores BF16, por lo que la carga es compatible con transformers y vLLM sin modificaciones; el ahorro se obtiene en la fidelidad de los expertos, no en el tamaño del checkpoint en disco.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni sobre la técnica concreta de cuantización (esquema de escalas, granularidad por grupo o por canal, calibración). Tampoco se documenta el número de expertos, el número de expertos activos por token ni la innovación arquitectónica del modelo base Qwen3.6-35B-A3B. El identificador r96 sugiere una configuración interna de investigación sin publicar.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y los tags conversational.
- Procesamiento image-text-to-text: el tag sugiere capacidades multimodales heredadas del modelo base, aunque no se detalla su alcance.
- Razonamiento y generación de código: presumiblemente heredados del modelo base, sin documentación específica en esta ficha.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: sirve para medir la degradación de calidad al comprimir los expertos enrutados a 1,63 bits mientras el resto de la red permanece en BF16, comparando contra el modelo base.
- Despliegue experimental en vLLM: al cargar con vLLM estándar, permite integrar el checkpoint en pipelines de evaluación existentes sin kernels personalizados.
- Estudio de robustez del router: analizar si el enrutamiento de tokens hacia expertos degradados sigue siendo estable en tareas de lenguaje natural.
- Reproducción de experimentos de compresión: punto de partida para replicar o variar el esquema de cuantización sobre el mismo modelo base.
- Evaluación comparativa de checkpoints: útil para contrastar métricas de perplejidad y tareas downstream frente al Qwen3.6-35B-A3B original.
- Pruebas de multimodalidad degradada: si el tag image-text-to-text se confirma, evaluar cuánto se pierde en tareas visión-lenguaje tras la compresión de expertos.
- Docencia y divulgación: ejemplo práctico de cómo se distribuye un modelo cuantizado dequantizado y de las implicaciones de memoria frente a precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16, los 35.107.181.936 parámetros ocupan aproximadamente 70 GB en memoria, independientemente de la cuantización de los expertos; se requiere hardware con al menos esa capacidad agregada.
- GPU recomendadas: no disponible (no hay datos del autor). Por tamaño, orientativas: H100 80 GB, A100 80 GB o configuraciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en GPUs consumer de 48 GB sin paralelismo o descarga parcial a CPU.
- Opciones de despliegue: transformers y vLLM, según declara el autor; llama.cpp, Ollama y TGI no están confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-1p63bit-r96 | 35.107.181.936 | no disponible | Expertos a 1,63 bits, resto BF16 | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | BF16 original | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la referencia natural: mismo número de parámetros totales, misma arquitectura MoE, pero con los expertos enrutados degradados a 1,63 bits. No se dispone de datos de rendimiento para cuantificar la diferencia.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta como tal, sin garantías de calidad ni de estabilidad para producción.
- Degradación esperada: la compresión a 1,63 bits de media en los expertos enrutados implica una pérdida de fidelidad no cuantificada; no hay benchmarks que la midan.
- Sin datos de licencia: el autor remite a la licencia del modelo base, que no se especifica en la información disponible; verificar antes de cualquier uso comercial.
- Tamaño real del despliegue: al guardarse en BF16 dequantizado, el checkpoint ocupa unos 70 GB y no ofrece el ahorro de memoria que sugiere la cifra de 1,63 bits.
- Idiomas y contexto no documentados: no se puede garantizar el comportamiento multilingüe ni la ventana de contexto efectiva.
- Riesgo de alucinación: no evaluado; presumiblemente igual o superior al del modelo base por la compresión.
- Sesgos: no documentados.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia externa sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-1p63bit-r96
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
