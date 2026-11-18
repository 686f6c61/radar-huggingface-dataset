# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed2

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed2` es un ajuste fino del modelo instructivo SmolLM2-135M-Instruct de Hugging Face, especializado en lengua feroesa (`fo`) mediante entrenamiento continuado (continued pre-training, CPT) sobre el corpus FineWeb-2. Lo desarrolla el usuario independiente `jekunz` con fines de investigación, y forma parte de una serie de tres semillas de entrenamiento para una misma configuración, lo que sugiere un interés en medir la variabilidad del proceso.

El modelo parte de un transformer decoder-only de 134.515.008 parámetros (aproximadamente 135 millones) con una ventana de contexto de 2048 tokens durante el entrenamiento. La estrategia de entrenamiento es en dos fases: primero un ajuste conjunto sobre las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2, y después un ajuste específico sobre la porción feroesa. Esta transferencia desde lenguas germánicas escandinavas emparentadas busca aprovechar el conocimiento multilingüe del modelo base antes de especializarlo en un idioma de bajos recursos.

Su relevancia es acotada pero clara: se trata de un experimento de adaptación de un modelo pequeño a una lengua de bajos recursos con licencia Apache 2.0, lo que lo hace reutilizable y reproducible. No obstante, el autor advierte explícitamente de que no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según el tag `llama`) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | Feroés (`fo`); el modelo base es multilingüe pero esta ficha declara solo `fo` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del SmolLM2-135M-Instruct original: un transformer decoder-only de 135 millones de parámetros, con tokenizador y configuración compatibles con la familia Llama. No se introducen modificaciones estructurales; el trabajo consiste íntegramente en ajuste fino por continuación de preentrenamiento sobre datos nuevos.

El entrenamiento se realizó en dos etapas sobre el corpus FineWeb-2. Primero, una época sobre los subconjuntos de danés, islandés, noruego bokmål, noruego nynorsk y sueco combinados; después, cinco épocas sobre el subconjunto feroés. Los hiperparámetros documentados son: tasa de aprendizaje 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto 2048 tokens, semilla 2 (una de tres semillas para esta misma configuración) y ejecución en una única GPU A100 de 40 GB. No se documenta el número total de tokens procesados, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste instructivo del modelo base y especializada mediante CPT.
- Comprensión y generación en feroés escrito, con posible transferencia parcial desde las lenguas escandinavas usadas en la primera fase.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 135 millones de parámetros.
- Generación de código y matemáticas elemental: capacidad residual del modelo base, no reforzada específicamente en este ajuste.
- Soporte de tool calling / function calling: no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable a esta escala.
- Capacidades multilingües: el modelo declara únicamente feroés; el base es multilingüe pero el ajuste puede haber degradado otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en adaptación de modelos pequeños a lenguas de bajos recursos: sirve como punto de comparación reproducible (semilla 2 de 3) para estudiar la transferencia desde lenguas escandinavas al feroés y la varianza entre semillas.
- Generación asistida de texto en feroés: borradores, resúmenes o reformulaciones de documentos, con revisión humana obligatoria dado que el modelo no ha sido evaluado.
- Experimentos de aumentación de datos: generar corpus sintético en feroés para entrenar o evaluar otros sistemas de PLN, controlando la calidad mediante filtrado posterior.
- Prototipado de asistentes conversacionales en feroés: gracias a su tamaño reducido puede desplegarse en una sola GPU consumer para demos internas y pruebas de concepto.
- Evaluación comparativa de estrategias de CPT: al existir tres semillas de la misma configuración, permite medir la estabilidad del ajuste y la sensibilidad a la inicialización.
- Docencia y formación: ejemplo didáctico de pipeline completo de ajuste fino con `transformers` sobre un corpus multilingüe, ejecutable en hardware asequible.
- Base para posteriores ajustes supervisados o DPO en feroés: su licencia Apache 2.0 y su reducido tamaño lo hacen un punto de partida barato para especializaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,3 GB de pesos, más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,15 GB de pesos; en 4 bits, en torno a 0,08 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; para entrenamiento el autor usó una A100 de 40 GB, aunque el modelo también podría ajustarse en GPUs de 16-24 GB con batch reducido.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles; a 135 millones de parámetros se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas declarados | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed2 | 134,5 M | 2048 | fo | Apache 2.0 | Ajuste de investigación, sin benchmarks |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | 135 M | 8192 (según el modelo original) | Multilingüe | Apache 2.0 | Modelo oficial con evaluación publicada |
| Otras semillas de la misma configuración (seed 1 y seed 3) | 134,5 M | 2048 | fo | Apache 2.0 | Variantes del mismo autor, no disponibles en esta búsqueda |

La comparación con el modelo base es la más informativa: este ajuste sacrifica parte de la cobertura multilingüe y de la ventana de contexto original (2048 frente a los 8192 tokens del SmolLM2-135M-Instruct) a cambio de especialización en feroés. No se dispone de datos de rendimiento que permitan cuantificar la mejora en feroés ni el posible olvido catastrófico en otras lenguas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es para su investigación y que no ha sido evaluado de forma amplia; no hay garantías de calidad.
- Riesgo elevado de alucinación y de errores gramaticales en feroés, dado el tamaño del modelo y la ausencia de evaluación.
- Posible olvido catastrófico de capacidades del modelo base (otros idiomas, código, instrucciones complejas) tras cinco épocas sobre feroés.
- Ventana de contexto efectiva de 2048 tokens, inferior a la del modelo base.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición detallada del corpus FineWeb-2 utilizado.
- Solo se declara el idioma feroés; no debe asumirse un comportamiento fiable en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin una validación propia exhaustiva.
- El modelo se distribuye sin pesos cuantizados ni artefactos de despliegue adicionales; el repositorio ocupa 0,3 GB.
- La fecha de creación del repositorio (2026-11-18) debe verificarse antes de citarlo, dado que puede tratarse de un artefacto de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-multilingual-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
