# iamtatsuki05/Mistral-EN-0.5B-PT-stage2

## Resumen

Mistral-EN-0.5B-PT-stage2 es un modelo de lenguaje de tipo decoder-only desarrollado por iamtatsuki05 dentro del proyecto MIREI, una línea de investigación centrada en el análisis comparativo de arquitecturas encoder/decoder para embeddings de frases. Este checkpoint concreto es la segunda etapa de preentrenamiento de una variante Mistral de aproximadamente 568 millones de parámetros, entrenada sobre el corpus inglés google/wiki40b con ventanas de contexto de 8.192 tokens.

El modelo no está pensado como un asistente conversacional ni como un modelo instruido: es una base de preentrenamiento en inglés que sirve como punto de partida para tareas generativas posteriores o como objeto de estudio en experimentos de arquitectura. Su relevancia es por tanto académica y experimental, no de producto: comparte receta de entrenamiento con un gemelo basado en Qwen2.5, lo que permite comparaciones controladas entre arquitecturas bajo condiciones idénticas.

Arquitectura Mistral clásica con RoPE, dimensión de embedding de 1.536 y vocabulario de 32.000 tokens, distribuida bajo licencia MIT. Al ser un modelo base de 0,5B entrenado con un presupuesto de tokens modesto (unos 1.000 millones), su utilidad práctica en producción es limitada, pero su carácter abierto y su licencia permisiva lo hacen cómodo para experimentación y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder-only) |
| Parametros totales | 567.854.592 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales: dimensión de embedding 1.536, tokenizador Mistral con vocabulario de 32.000 tokens, codificación posicional RoPE, tamaño del repositorio 1,1 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mistral en configuración decoder-only, con atención causal estándar (no se documenta atención con ventana deslizante ni variantes híbridas) y codificación posicional rotatoria (RoPE). La dimensión de embedding es de 1.536 y el tokenizador es el Mistral nativo con 32.000 entradas de vocabulario. El checkpoint es la etapa 2 de un pipeline de preentrenamiento que arranca de iamtatsuki05/Mistral-EN-0.5B-PT-stage1.

El entrenamiento se realiza sobre google/wiki40b, un corpus enciclopédico en inglés, con un presupuesto aproximado de 1.000 millones de tokens observados y ventanas de 8.192 tokens. No se documenta en la información disponible el uso de RLHF, DPO, SFT ni ninguna fase de alineación posterior; se trata, por tanto, de un modelo estrictamente base. La innovación metodológica del proyecto MIREI no reside en el modelo en sí, sino en la comparación controlada entre arquitecturas (Mistral frente a Qwen2.5) bajo una receta de entrenamiento idéntica, lo que permite aislar el efecto de la arquitectura en las representaciones aprendidas.

## Capacidades

- Generación de texto en inglés: continuación de secuencias y generación libre condicionada por prompt.
- Modelado de lenguaje causal: útil como backbone para ajuste fino supervisado posterior.
- Contexto de 8.192 tokens, suficiente para documentos de extensión media y contextos multi-párrafo.
- Capacidades multilingües: únicamente inglés; no se documenta soporte de otros idiomas.
- Tool calling / function calling: no disponible (modelo base sin instrucción ni plantillas de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriría ajuste fino.
- Modo thinking, visión, audio: no disponible.
- Capacidad de embeddings: el proyecto MIREI en el que se enmarca analiza representaciones para embeddings de frases, aunque esta variante concreta se publica como modelo generativo.

## Casos de uso

- Experimentación académica en comparación de arquitecturas: al compartir receta con el gemelo Qwen2.5-Scratch-EN-0.5B-PT-stage2, permite aislar el efecto de la arquitectura Mistral frente a Qwen2.5 en tareas de modelado de lenguaje y representaciones, controlando datos, tokens y contexto.
- Punto de partida para ajuste fino supervisado: su licencia MIT y su tamaño reducido lo hacen adecuado como base para SFT en dominios concretos (por ejemplo, clasificación de texto o generación de resúmenes) sin costes de licencia.
- Prototipado rápido en local: con 568M parámetros cabe en GPUs de consumo, lo que permite iterar sobre pipelines de generación de texto en inglés antes de escalar a modelos mayores.
- Estudio de dinámicas de preentrenamiento: la serie por etapas (stage1, stage2) facilita analizar la evolución de las representaciones y de la perplejidad a lo largo del entrenamiento.
- Generación de texto enciclopédico de dominio abierto: al estar entrenado sobre wiki40b, es razonable para continuaciones de estilo enciclopédico en inglés, aunque con calidad limitada por el presupuesto de tokens.
- Base para investigación en embeddings de frases: en el contexto del paper MIREI, este checkpoint puede emplearse para extraer representaciones internas y compararlas con las de arquitecturas alternativas bajo condiciones idénticas.
- Docencia y demostraciones: modelo pequeño, licencia permisiva y requisitos de software estándar (transformers, accelerate, flash-attn) para ilustrar el ciclo completo de preentrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,1-1,3 GB solo para pesos, más overhead de activaciones y caché KV; con contexto completo de 8.192 tokens el consumo adicional de caché KV es moderado pero no despreciable.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,6-0,7 GB para pesos; en 4 bits, en torno a 0,3-0,4 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16 con contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPUs de consumo sin problema.
- Despliegue: transformers (versión >= 4.51.0), accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 según la model card. No se documentan configuraciones para vLLM, llama.cpp, Ollama ni TGI, aunque al ser un transformer Mistral estándar es probable que sea compatible con dichos runtimes; no confirmado en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| iamtatsuki05/Mistral-EN-0.5B-PT-stage2 | 567,9 M | 8.192 | MIT | en | Modelo base, preentrenamiento sobre wiki40b, ~1B tokens |
| iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage2 | no disponible en la informacion | 8.192 (misma receta) | MIT (mismo proyecto) | en | Gemelo arquitectónico del proyecto MIREI, misma receta de entrenamiento |
| Mistral-7B (referencia de la familia) | 7.000 M aprox. | 8.192 (v1) | Apache 2.0 | multilingüe | Modelo mucho mayor; no directamente comparable en escala |

La comparación más significativa es con el checkpoint Qwen2.5 del mismo proyecto, ya que comparte datos, número de tokens y contexto, y difiere únicamente en la arquitectura. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o no deseadas.
- Riesgo de alucinación elevado: al ser un modelo pequeño entrenado con ~1B tokens sobre un corpus enciclopédico, su conocimiento factual es limitado y propenso a errores.
- Sesgos: entrenado exclusivamente sobre google/wiki40b en inglés, hereda los sesgos del corpus (perspectiva enciclopédica occidental, cobertura desigual de temas y culturas).
- Limitación de idioma: solo inglés; no se garantiza un comportamiento aceptable en castellano ni en otros idiomas.
- Contexto limitado a 8.192 tokens: suficiente para documentos medios, insuficiente para contextos largos o conversaciones extensas.
- Licencia MIT: permite uso comercial y modificación sin restricciones relevantes, pero al ser un modelo base la responsabilidad sobre el comportamiento en producción recae enteramente en quien lo despliega.
- Calidad esperada baja en tareas generativas abiertas: con 568M parámetros y un presupuesto de entrenamiento reducido, no es adecuado como modelo de producción para atención al cliente, código o razonamiento complejo.
- Escasez de documentación: no se publican detalles sobre composición exacta del dataset, hiperparámetros, curvas de pérdida ni evaluaciones, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Mistral-EN-0.5B-PT-stage2
- Modelo base (stage1): https://huggingface.co/iamtatsuki05/Mistral-EN-0.5B-PT-stage1
- Gemelo Qwen2.5 del proyecto: https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-EN-0.5B-PT-stage2
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Dataset google/wiki40b: https://huggingface.co/datasets/google/wiki40b
- Licencia MIT: https://opensource.org/license/mit/
- Paper de referencia (NLP2026): 同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析, 岡田 龍樹 and 杉本 徹, 言語処理学会第 32 回年次大会 (NLP2026)
