# q-project/N-Q-26M

## Resumen

N-Q-26M es un modelo base (base model) de generación de texto bilingüe ruso/inglés desarrollado por Q Project, el escalón más pequeño de su familia N-Q, entrenado desde cero en una única GPU V100 de 16 GB. Se presenta como un "mini Qwen3.8-Flash-Next": una arquitectura híbrida de atención que combina Gated DeltaNet (atención lineal recurrente) intercalada en proporción 3:1 con atención completa con puerta, más un embedding de n-gramas con hash y un esquema de residuos con 4 flujos. En total almacena 46,5 millones de parámetros (29,7M del backbone más 16,8M de la tabla de n-gramas).

El modelo se preentrenó sobre 2.000 millones de tokens en 6,6 horas con un planificador WSD y el optimizador Muon combinado con AdamW, alcanzando una velocidad de 85k tokens/s gracias a `torch.compile`. Es un modelo de investigación y educación, no un producto: genera continuaciones de texto gramaticalmente correctas en ruso e inglés, pero con frecuencia inventa hechos. Q Project publica también una variante conversacional, N-Q-26M-Chat, recomendada para diálogo y llamadas exactas a herramientas.

Su relevancia actual es principalmente didáctica y de investigación: demuestra que una arquitectura híbrida lineal/completa con circuitos exactos de cálculo puede entrenarse en hardware de consumidor/profesional modesto en horas, siguiendo el espíritu de proyectos como MiniMind.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) intercalada 3:1 con atención completa con puerta (patrón LLLA ×2), estilo "mini Qwen3.8-Flash-Next" |
| Parametros totales | 46.452.571 almacenados (29,7M backbone + 16,8M tabla de n-gramas) |
| Parametros activos | No es MoE; todos los parámetros activos por token |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (matrices fp16, tensores 1-D fp32, tablas de n-gramas int64 exactas en el formato QPACK1) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache-2.0 (código y pesos); los datos de entrenamiento conservan sus propios términos |
| Formato de pesos | safetensors (177 MiB) y contenedor QPACK1 de archivo único (89 MiB, mmap-friendly) |

## Arquitectura y entrenamiento

La arquitectura consta de 8 capas con patrón `LLLA` ×2: tres capas de Gated DeltaNet (3 cabezas de clave / 6 de valor, dimensión 64, convolución k=4) seguidas de una capa de atención completa con puerta (8 cabezas de consulta / 2 KV, dimensión 64, QK-norm centrada en cero, RoPE parcial al 25% con θ=1e6, puerta sigmoide de salida). La dimensión oculta es 512 con SwiGLU 512→704→512, un esquema Gated Residual de 4 flujos de residuo, RMSNorm centrado en cero y cabeza de salida sin atar (untied). Tras la capa 2 se inserta un embedding de 3-gramas con hash (PLE) de 16,8 millones de parámetros en tablas de tamaño primo. El tokenizador es un BPE a nivel de byte RU+EN de 8.256 tokens, con ids 0–8191 para texto y 8192–8255 para tokens de control (`<USER>`, `<MODEL>`, `<EOT>`, `<THINK>`, `<CALC>`, etc.).

El preentrenamiento usó 2,0B tokens (30.517 pasos, 64×1024 tokens/paso) con planificador WSD, optimizador Muon + AdamW y `torch.compile`, en 6,6 horas a 85k tokens/s. Los datos provienen de FineWeb-Edu (inglés), Cultura-Ru-Edu (ruso), Wikipedia y, para el 5% de las filas, diálogos y filas de circuitos `<CALC>` desde el paso 1 (receta de Q-164M), usando SmolTalk, GrandMaster-PRO-MAX, saiga_scored y un corpus propio de `<CALC>`. Esto hace que incluso el modelo base reconozca los formatos de chat y de herramienta. La elección de esta arquitectura frente a un diseño ternario (Q-164M) se justificó mediante una ablation controlada documentada en la model card del modelo Chat. La inferencia usa un `generate()` propio con estado recurrente de Gated DeltaNet más caché KV.

## Capacidades

- Generación de texto continuo (text completion) gramaticalmente correcta en ruso e inglés.
- Reconocimiento del formato de chat y de herramientas gracias al 5% de filas de diálogo y circuitos `<CALC>` en el preentrenamiento, aunque es un modelo base sin ajuste por instrucciones.
- Circuitos exactos `<CALC>`: si se le invoca en formato de chat y se pasa el tokenizador a `generate()`, puede activar circuitos de cálculo exacto mediante tokens de control dedicados.
- Inferencia eficiente con estado recurrente de Gated DeltaNet más caché KV, implementada en un `generate()` propio.
- Carga directa vía `transformers` con `trust_remote_code=True`, incluido el formato QPACK1 de archivo único.
- Sin capacidades de visión, audio ni multimodalidad; sin tool calling formal ni soporte de agentes (es un modelo base de investigación).

## Casos de uso

- Educación e investigación sobre LLMs: su tamaño de 46M de parámetros y su entrenamiento de 6,6 horas en una sola V100 lo hacen ideal para estudiar arquitecturas híbridas de atención lineal sin coste computacional significativo.
- Experimentación con atención lineal: permite probar Gated DeltaNet, Gated Residual de 4 flujos y embeddings de n-gramas con hash en un modelo que cabe en cualquier GPU moderna.
- Generación de texto creativo en ruso e inglés: continuaciones de texto con tono fluido a partir de un prompt, útil para demos y prototipos de escritura.
- Base para fine-tuning propio: al ser un modelo base con Apache-2.0, puede ajustarse por instrucciones o con DPO para dominios específicos en ruso o inglés con recursos mínimos.
- Prueba de formatos de despliegue ligeros: el contenedor QPACK1 de 89 MiB permite experimentar con empaquetado mmap de modelos en dispositivos con almacenamiento limitado.
- Estudio de circuitos exactos de cálculo: los tokens `<CALC>`, `<EQ>` y `<ECALC>` permiten investigar cómo integrar aritmética exacta en modelos de lenguaje pequeños.
- Evaluación de tokenizadores BPE a nivel de byte: útil para comparar perplexidades y comportamiento de tokenización RU/EN en corpus educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica perplexidades en conjuntos held-out del propio proyecto, no comparables con otros tokenizadores:

| Conjunto held-out | Loss | Perplexity (tokenizador propio) |
|---|---|---|
| FineWeb-Edu (EN) | 2,381 | 10,8 |
| Cultura-Ru-Edu (RU) | 2,651 | 14,2 |
| Wikipedia rusa | 2,323 | 10,2 |

Como referencia de escala: la misma arquitectura tras 0,5B tokens (run de ablation) alcanzó una loss media de 2,616; con 2,0B tokens baja a 2,452.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 46,5M de parámetros en fp16 (~89 MiB en QPACK1, 177 MiB en safetensors), el modelo cabe con holgura en cualquier GPU con 2 GB de VRAM o incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; fue entrenado en una única NVIDIA V100 de 16 GB, y para inferencia basta cualquier GPU moderna (RTX 3060, RTX 4090, etc.) o CPU.
- Consumer GPUs: cabe completamente en cualquier GPU de consumidor actual, incluidas las de gama de entrada.
- Opciones de despliegue: librería `transformers` de Hugging Face con `trust_remote_code=True` (incluida la carga del formato QPACK1). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible para inferencia; el entrenamiento alcanzó 85k tokens/s en V100 con `torch.compile`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| N-Q-26M (este modelo) | 46,5M almacenados | No disponible | Apache-2.0 | ru, en | Hugging Face, safetensors + QPACK1 |
| Q-164M (Q Project) | 164M (diseño ternario) | No disponible | No disponible | No disponible | Hugging Face (referenciado por el autor) |
| N-Q-26M-Chat (Q Project) | Igual arquitectura que N-Q-26M | No disponible | No disponible | ru, en | Hugging Face (variante chat del mismo proyecto) |
| MiniMind (referencia del estilo) | Escala similar de modelos pequeños entrenados desde cero | No disponible | No disponible | zh, en | Proyecto open source de referencia |

No se han publicado comparativas numéricas directas con modelos de terceros en la información disponible.

## Limitaciones y advertencias

- Los hechos generados son frecuentemente incorrectos: la model card lo advierte explícitamente ("invented facts") y los ejemplos de muestra contienen afirmaciones falsas sobre Moscú y Polonia.
- Conocimiento general muy superficial debido al tamaño (46M) y al corpus de 2,0B tokens.
- Tendencia a la repetición bajo decodificación greedy; se recomienda temperatura y top-p (los ejemplos usan temperature 0.7, top_p 0.9).
- No hay ajuste de seguridad alguno ("No safety tuning"): puede generar contenido inapropiado sin filtros.
- Es un modelo base: no sigue instrucciones más allá de los patrones de diálogo vistos en el 5% de filas de diálogo del preentrenamiento.
- Las perplexidades publicadas no son comparables con modelos que usan otros tokenizadores.
- Restricciones de licencia en los datos: aunque los pesos y el código son Apache-2.0, los datos de entrenamiento conservan sus propios términos (FineWeb-Edu bajo ODC-By 1.0, Wikipedia rusa bajo CC BY-SA / GFDL, Cultura-Ru-Edu, SmolTalk, GrandMaster-PRO-MAX y saiga_scored); hay que revisarlos antes de cualquier uso comercial.
- La longitud de contexto no está documentada en la model card, lo que dificulta planificar aplicaciones con documentos largos.
- Requiere `trust_remote_code=True` (arquitectura personalizada), lo que implica ejecutar código del repositorio: revisarlo antes de usar en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/N-Q-26M
- Modelo Chat (variante conversacional): https://huggingface.co/q-project/N-Q-26M-Chat
- Proyecto MiniMind (referencia del enfoque de entrenamiento): https://jingyaogong.github.io/minimind/
- Datasets de entrenamiento:
  - FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - Cultura-Ru-Edu: https://huggingface.co/datasets/deepvk/cultura_ru_edu
  - Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
