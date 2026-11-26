# NaturalScale/LoopTitan-MoE12-Deep-1.3B-A0.3B-Muon

## Resumen

LoopTitan-MoE12-Deep-1.3B-A0.3B-Muon es un modelo de lenguaje base entrenado desde cero por NaturalScale (proyecto LoopTitan, del DataML Lab) como parte de su Fase 1 de investigación. Se trata de la variante "control profunda" (design 8 de 9) dentro de un estudio sistemático de arquitecturas MoE: un MoE estándar más profundo, con 18 capas, anchura 1280, 42 expertos por capa y tamaño oculto de experto 432, sin revisitar ninguna capa. No está ajustado a instrucciones.

El modelo almacena 1,32B parámetros sin contar los embeddings y 1,71B contando la embedding de entrada y la cabeza de salida (la cifra que muestra Hugging Face). Con 0,30B parámetros activos por token, es un MoE disperso pensado para ser eficiente en inferencia manteniendo una capacidad representacional propia de un modelo mayor. Emplea el optimizador Muon en lugar de AdamW, un detalle central del experimento.

Su relevancia es fundamentalmente de investigación: sirve como punto de comparación reproducible frente al MoE estándar y a otras ocho variantes arquitectónicas del mismo estudio, medida en bits por byte (BPB) sobre DCLM. No es un modelo orientado a producto ni a despliegue conversacional, sino una pieza de un ablation study abierto bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (18 capas, anchura 1280, 42 expertos/capa, experto oculto 432) |
| Parametros totales | 1.708.281.600 (con embeddings); 1,32B sin embeddings |
| Parametros activos | 0,30B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, código personalizado `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de tipo disperso. Cada una de las 18 capas contiene 42 expertos con dimensión oculta 432, y solo una fracción de ellos se activa por token, resultando en 0,30B parámetros activos sobre 1,32B almacenados (sin embeddings). La variante "Deep" se distingue por aumentar la profundidad manteniendo la anchura en 1280 y sin reutilizar capas, lo que la convierte en el control de profundidad del estudio frente a diseños con bucles ("the loop", "one more visit", "unrolled").

El entrenamiento se realizó desde cero sobre el dataset DCLM (mlfoundations/dclm-baseline-1.0-parquet). La innovación metodológica destacada es el uso del optimizador Muon, comparado contra AdamW en el resto del barrido experimental; esta checkpoint concreto se entrenó con Muon. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO (es un modelo base, no ajustado a instrucciones). El modelo requiere código personalizado (`custom_code`) para cargarse con transformers.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base (no ajustado a instrucciones).
- Modelado de lenguaje y estimación de probabilidad del siguiente token (evaluado vía BPB).
- Mezcla de expertos con activación dispersa (0,30B activos por token).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en arquitecturas MoE: sirve como checkpoint de control para estudiar el efecto de la profundidad en MoE frente a diseños con bucles o capas reutilizadas, comparando BPB sobre DCLM.
- Estudio comparativo de optimizadores: permite reproducir y contrastar el efecto de Muon frente a AdamW en el mismo diseño, dado que el resto del barrido incluye ambas variantes.
- Base para fine-tuning experimental: al ser un modelo base de 1,3B con licencia MIT, se puede ajustar para tareas concretas de investigación sin restricciones de uso comercial.
- Evaluación de eficiencia de inferencia MoE: con 0,30B parámetros activos, es útil para medir throughput y latencia de arquitecturas dispersas frente a densas de tamaño comparable.
- Reproducibilidad de ablations: el proyecto publica el código, la documentación y los resultados de la Fase 1, lo que permite replicar el entrenamiento y validar conclusiones.
- Docencia y formación: modelo pequeño y de pesos abiertos adecuado para ilustrar el funcionamiento interno de un MoE y del optimizador Muon en entornos académicos.
- Punto de partida para decodificación especulativa o destilación: su tamaño y naturaleza base lo hacen candidato a experimentos de compresión o destilación hacia modelos más pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre mlfoundations/dclm-baseline-1.0-parquet:

| Metrica | Valor |
|---|---|
| Test BPB | 0,963942 |
| Validation BPB | 0,965794 |
| Δ test vs MoE estándar (Muon) | -10,43 mBPB |

El autor indica además que las semillas 43 y 44 de la misma configuración (no publicadas) alcanzan test BPB de 0,963324 y 0,963299, ambas inferiores (mejores) que este checkpoint (semilla 42), lo que sugiere variabilidad entre semillas del orden de 0,6 mBPB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos (1,71B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: ~1,7 GB de pesos; en 4 bits: ~0,9 GB de pesos (estimación teórica; el autor no publica GGUF).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060/4060, RTX 4090); A100/H100 no son necesarias por tamaño, pero útiles para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE12-Deep-1.3B-A0.3B-Muon | 1,71B (1,32B sin embeddings) | 0,30B | no disponible | MIT | MoE profundo, optimizador Muon, base |
| MoE estándar del estudio LoopTitan (referencia) | similar | similar | no disponible | MIT | Baseline del barrido; Δ +0,0 mBPB |
| Otras variantes LoopTitan Fase 1 (loop, unrolled, one more visit, etc.) | similar | similar | no disponible | MIT | Mejoras de hasta -14,8 mBPB (AdamW) |
| Alternativas externas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación más directa es interna al propio estudio LoopTitan, donde este checkpoint (design 8, "Deeper control") obtiene -10,43 mBPB frente al MoE estándar con Muon, mientras que la variante "one more visit" alcanza -12,2 mBPB y "twice the experts" -9,9 mBPB con Muon.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no debe usarse directamente como asistente conversacional sin fine-tuning o prompting adecuado.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje base; no hay evaluación de fidelidad factual.
- No se documentan sesgos conocidos ni evaluación de seguridad.
- Idiomas soportados no especificados; el dataset DCLM es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no disponible: no se puede garantizar el manejo de contextos largos.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del autor; conviene auditar antes de usar en producción.
- Variabilidad entre semillas: el autor reconoce que otras semillas superan a este checkpoint, por lo que no es el mejor resultado de su configuración.
- Licencia MIT permite uso comercial, pero al ser un modelo de investigación sin evaluación de calidad en tareas reales, su uso en producción conlleva riesgo de rendimiento insuficiente.
- Sin soporte documentado de herramientas de despliegue estándar (vLLM, llama.cpp, Ollama), lo que dificulta la integración en pipelines de producción.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-Deep-1.3B-A0.3B-Muon
- Homepage del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio GitHub: https://github.com/datamllab/LoopTitan
- Documentación: https://datamllab.github.io/LoopTitan/docs/
- Colección de modelos Fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Resultados Fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Issue sobre semillas 43 y 44: https://github.com/datamllab/LoopTitan/issues/328
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
