# NaturalScale/LoopTitan-MoE12-FineExperts-1.3B-A0.2B-Muon

## Resumen

LoopTitan-MoE12-FineExperts-1.3B-A0.2B-Muon es un modelo de lenguaje base entrenado desde cero por NaturalScale dentro de la familia LoopTitan, un proyecto de investigación sobre arquitecturas MoE (mixture of experts) con lazos recurrentes de capas y optimizadores alternativos a AdamW. Este checkpoint concreto corresponde al diseño 2 de 8 de la fase 1 del proyecto, etiquetado como "Finer experts" y entrenado con el optimizador Muon. No es un modelo instruido: es una base para generación de texto y para experimentación arquitectónica.

La arquitectura es un transformer MoE de 12 capas con anchura 1280, 72 expertos por capa de tamaño oculto 384 y enrutamiento top-9. Almacena 1,32 mil millones de parámetros sin contar embeddings y 1,71 mil millones contando la embedding de entrada y la cabeza de salida (la cifra que reporta Hugging Face en safetensors). Solo 0,20 mil millones de parámetros están activos por token, lo que da una relación de activación muy baja en comparación con MoE convencionales.

El modelo es relevante por dos motivos. Primero, por su enfoque experimental: forma parte de un barrido sistemático que compara ocho diseños de MoE bajo dos optimizadores (AdamW y Muon), y publica resultados de bits por byte (BPB) sobre el split completo de DCLM. Segundo, porque demuestra que variantes de enrutamiento fino con muchos expertos pequeños pueden mejorar ligeramente sobre un MoE estándar cuando se usa Muon, aunque con una ganancia modesta (-0,86 mBPB frente al MoE estándar con el mismo optimizador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 12 capas, anchura 1280, 72 expertos por capa, tamaño oculto de experto 384, top-9 |
| Parametros totales | 1.706.684.160 (con embeddings); 1,32B sin embeddings |
| Parametros activos | 0,20B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas MoE de grano fino: 72 expertos por capa, cada uno con proyección oculta de 384 dimensiones, y enrutamiento top-9 por token. La relación entre parámetros totales y activos es de aproximadamente 8,5 a 1, lo que lo sitúa en la categoría de MoE de activación muy dispersa. El nombre del checkpoint indica que se entrenó con el optimizador Muon, una alternativa a AdamW basada en ortogonalización de actualizaciones, y que forma parte de un estudio comparativo: el mismo diseño "Finer experts" también se entrenó con AdamW, y los ocho diseños de la release se evaluaron con ambos optimizadores.

El entrenamiento se realizó desde cero sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM baseline). No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste instruccional; la model card indica explícitamente que es un modelo base, no instruido. La innovación técnica destacable es la combinación de expertos finos (muchos expertos de dimensión reducida) con el optimizador Muon, evaluada mediante BPB sobre los splits completos de test y validación de DCLM.

## Capacidades

- Generación de texto autoregresiva como modelo base (no instruido): completa secuencias, no sigue instrucciones de forma fiable.
- Modelado de lenguaje y estimación de probabilidad de secuencias, útil para evaluación mediante BPB o perplejidad.
- Razonamiento y conocimiento factual limitados por su tamaño (0,20B parámetros activos) y por no haber recibido ajuste instruccional.
- Soporte de tool calling / function calling: no disponible; no se documenta ni se espera en un modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible por diseño (modelo base).
- Capacidades multilingües: no disponibles; no se especifican idiomas en la model card.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.
- Experimental: sirve como referencia para estudiar el efecto del optimizador Muon y del enrutamiento fino de expertos en MoE.

## Casos de uso

- Investigación sobre arquitecturas MoE: el checkpoint permite reproducir y analizar el efecto del enrutamiento fino (72 expertos, top-9) frente a un MoE estándar, comparando BPB sobre DCLM con los demás diseños de la release.
- Estudio de optimizadores: al existir la variante equivalente entrenada con AdamW, se puede comparar directamente el impacto de Muon en la convergencia y en la calidad final del modelo.
- Modelado de lenguaje para evaluación de datasets: su BPB de referencia (0,973517 en test) permite usarlo como baseline para medir la dificultad de nuevos corpus o para filtrar datos de entrenamiento.
- Fine-tuning posterior como base: al ser un modelo base con licencia MIT, puede servir de punto de partida para ajuste supervisado o DPO en dominios concretos, aunque su tamaño activo reducido limita el techo de calidad.
- Experimentos de eficiencia de inferencia: con 0,20B parámetros activos por token, es adecuado para estudiar el coste real de enrutamiento top-9 y el balance entre VRAM ocupada (pesos totales) y cómputo por token.
- Docencia y reproducción de recetas: los ficheros de configuración (`recipes/phase1/m0-muon.json`) y la documentación del proyecto permiten reproducir el entrenamiento en entornos de investigación con recursos moderados.
- Generación de texto exploratoria en pipelines de investigación: útil para probar tokenizadores, decodificación y estrategias de sampling sobre un modelo pequeño, aunque no para producción orientada a usuario final.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor |
|---|---|
| Test BPB (DCLM baseline) | 0,973517 |
| Validation BPB (DCLM baseline) | 0,975193 |
| Delta test frente a MoE estándar (Muon) | -0,86 mBPB |

Comparativa interna de la release (diseños de la fase 1, delta de test mBPB frente al MoE estándar, por optimizador):

| Diseño | AdamW | Muon |
|---|---:|---:|
| MoE estándar | +0,0 | +0,0 |
| Finer experts (este modelo) | -4,2 | -0,9 |
| Deeper, narrower | -6,9 | -4,2 |
| Expert layout | -5,9 | -3,4 |
| Unrolled | -8,9 | -3,3 |
| The loop | -9,0 | -3,7 |
| One more visit | -14,8 | -12,2 |
| Twice the experts | -14,3 | -9,9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5 GB solo para pesos (1,71B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8 GB de pesos; en 4 bits, alrededor de 0,9 GB. No se distribuyen pesos cuantizados oficiales, por lo que habría que generarlos con herramientas externas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente para inferencia en precisión completa con secuencias moderadas. Para entrenamiento o fine-tuning, se recomienda A100 40/80 GB o H100, y como mínimo una RTX 4090 para ajuste con batch pequeño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más, especialmente en bf16 o cuantizado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo requiere código personalizado, tag `custom_code`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la integración con llama.cpp requeriría conversión a GGUF y posiblemente adaptación del enrutamiento MoE.
- Latencia y throughput estimados: no disponibles. Con 0,20B parámetros activos por token, el cómputo por token es bajo, pero el enrutamiento top-9 sobre 72 expertos añade overhead y la memoria ocupada corresponde a los 1,71B parámetros totales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE12-FineExperts-1.3B-A0.2B-Muon | 1,71B (1,32B sin embeddings) | 0,20B | no disponible | MIT | Base, experimental, Muon |
| LoopTitan variante equivalente con AdamW | 1,71B (1,32B sin embeddings) | 0,20B | no disponible | MIT | Mismo diseño, optimizador distinto; BPB test -4,2 mBPB frente al estándar |
| MoE estándar de la misma release (referencia) | no disponible | no disponible | no disponible | MIT | Baseline del estudio; BPB test de referencia |
| Modelos densos pequeños tipo SmolLM2-1.7B | 1,7B | 1,7B | 8K (aprox.) | Apache 2.0 | Denso, instruido; comparable en tamaño total pero con todos los parámetros activos |

La comparación con modelos comerciales o densos de tamaño similar no está disponible en la información proporcionada; los únicos datos fiables son los de la propia familia LoopTitan.

## Limitaciones y advertencias

- Modelo base sin ajuste instruccional: no sigue instrucciones de forma fiable ni mantiene diálogos coherentes sin un fine-tuning previo.
- Riesgo alto de alucinación y de texto incoherente en generaciones largas, dado su tamaño activo (0,20B) y su entrenamiento únicamente como modelado de lenguaje.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición del dataset DCLM más allá del nombre; se heredan los sesgos del corpus.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado fuera del inglés, idioma dominante en DCLM.
- Longitud de contexto no disponible: no se especifica la ventana máxima, lo que impide planificar su uso en tareas de contexto largo.
- Requiere `trust_remote_code=True` por el tag `custom_code`: hay que auditar el código remoto antes de ejecutarlo en producción.
- Licencia MIT: permite uso comercial, pero al ser un modelo base sin garantías, el uso en producción requeriría validación propia y, previsiblemente, fine-tuning.
- Sin soporte documentado en runtimes de inferencia populares (vLLM, llama.cpp, TGI), lo que complica el despliegue escalable.
- Métricas no verificadas (`verified: false`): los BPB declarados proceden del autor y no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-FineExperts-1.3B-A0.2B-Muon
- Página del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio en GitHub: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Receta del MoE estándar de referencia: https://github.com/datamllab/LoopTitan/blob/main/recipes/phase1/m0-muon.json
- Colección de modelos LoopTitan fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
