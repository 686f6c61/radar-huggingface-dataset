# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B

## Resumen

Qwen3-1.7B-Distilled-30B-A3B es un modelo de lenguaje causal de aproximadamente 2.031 millones de parametros desarrollado por el autor independiente reaperdoesntknow (Reaperdoesntrun), bajo la division de investigacion de Convergent Intelligence LLC. Se trata de un ajuste fino por destilacion de conocimiento sobre el modelo base Qwen/Qwen3-1.7B, cuyo profesor es Qwen/Qwen3-30B-A3B-Instruct-2507. El objetivo del modelo es transferir capacidades de razonamiento STEM (matematicas, fisica, ingenieria, biologia) desde un modelo MoE de 30.000 millones de parametros totales hacia un modelo denso de 1.700 millones, apto para despliegue en el borde (edge).

La contribucion tecnica principal es una metodologia denominada destilacion de conocimiento informada por discrepancia (DISC v3), que aplica tres operadores sobre la dinamica de entrenamiento: ponderacion de la KL a nivel de token para amplificar los "pivotes de razonamiento", suavizado DG-Limit en tokens de alta entropia del estudiante y regularizacion por energia de discrepancia. El entrenamiento se realizo sobre 6.122 muestras de chain-of-thought STEM con una longitud de contexto de 1.024 tokens.

El modelo es relevante por su enfoque en la estructura del razonamiento frente al escalado bruto, y por su licencia Apache 2.0, que facilita su uso comercial. No obstante, su contexto de entrenamiento es corto, solo soporta ingles declarado y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 causal language model (transformer denso, decoder-only) |
| Parametros totales | 2.031.739.904 (~2.031M) |
| Parametros activos | no aplica (modelo denso; el profesor es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bf16; repo de 12,2 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 causal de tipo transformer decoder-only denso del modelo base Qwen/Qwen3-1.7B, con aproximadamente 2.031 millones de parametros en precision bf16. El profesor es Qwen3-30B-A3B-Instruct-2507, un modelo Mixture-of-Experts con 30.000 millones de parametros totales y 3.000 millones activos (segun la nomenclatura A3B). La destilacion transfiere el comportamiento del profesor hacia un estudiante denso mucho mas pequeno.

El entrenamiento se realizo durante una sola epoca sobre 6.122 muestras de chain-of-thought STEM (5.815 de entrenamiento y 307 de evaluacion), agregadas de diez subconjuntos de dominio: fisica (2.254), algebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), ingenieria (574), mecanica clasica (343), mecanica teorica (307), fisica general (225), biologia molecular (71) y fisiologia (114), ademas de un conjunto de matematicas. La funcion de perdida combina cross-entropy ponderada por prueba, destilacion por KL ponderada por discrepancia y regularizacion por energia de discrepancia, con pesos 0,55 / 0,45 / 0,02, temperatura de destilacion 2,0, optimizador AdamW, learning rate 1,5e-5 con decaimiento coseno, 30 pasos de warmup, batch efectivo de 8 y clipping de gradiente de 1,0.

Las innovaciones tecnicas destacadas son: (1) la ponderacion de la KL por token mediante un operador de discrepancia discreta que detecta saltos locales en la divergencia profesor-estudiante, identificando pivotes de razonamiento y amplificandolos con un factor de 3,0x cuando superan el umbral media + 2 sigma; (2) el suavizado DG-Limit, que sustituye los logits del estudiante por una media de vecindad de 3 tokens cuando su entropia supera media + 1 sigma; y (3) el monitoreo y regularizacion de la energia de discrepancia para evitar que la mejora en perdida media enmascare un deterioro en las transiciones de razonamiento. Adicionalmente, la cross-entropy pondera la region de prueba (desde "Proof:" hasta "Final Answer:") con un factor que decae de 2,5x a 1,5x durante el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles con enfasis en razonamiento estructurado.
- Razonamiento matematico con cadenas de pensamiento orientadas a demostraciones (proof-style CoT).
- Razonamiento cientifico en fisica, algebra lineal, ecuaciones diferenciales, electromagnetismo, mecanica y biologia.
- Razonamiento de ingenieria y resolucion de problemas tecnicos de nivel academico.
- Generacion de derivaciones paso a paso con estructura explicita de prueba y respuesta final.
- Conversacion multi-turno basica (etiqueta "conversational").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo esta orientado a CoT de un solo turno.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Tutoria academica de matematicas y fisica: el modelo puede generar derivaciones paso a paso con estructura de prueba, util para plataformas educativas que necesiten explicar no solo el resultado sino el procedimiento, gracias a la ponderacion de la region de prueba durante el entrenamiento.
- Generacion de soluciones de algebra lineal y ecuaciones diferenciales: adecuado para asistentes de estudio universitario que requieran resolver sistemas, diagonalizar matrices o resolver EDOs con justificacion intermedia.
- Apoyo a estudiantes de ingenieria en problemas de electromagnetismo y mecanica: el modelo fue entrenado especificamente con subconjuntos de estas areas, por lo que puede asistir en la resolucion de problemas de campos, circuitos y dinamica clasica.
- Despliegue en el borde (edge) y dispositivos con recursos limitados: con 2.031 millones de parametros en bf16 y un repositorio de 12,2 GB, es candidato para inferencia local en estaciones de trabajo o GPUs de consumo, aunque requiere cuantizacion para entornos mas restrictivos.
- Preprocesamiento y generacion de datos sinteticos STEM: puede utilizarse para producir borradores de soluciones y cadenas de razonamiento que luego se revisen o filtren, aprovechando su licencia Apache 2.0.
- Filtrado y clasificacion de razonamiento cientifico: util como modelo ligero para evaluar la coherencia estructural de derivaciones generadas por modelos mayores, dado su enfoque en la estructura de la prueba.
- Base para experimentos de destilacion e investigacion: sirve como punto de partida reproducible para estudiar tecnicas de destilacion informada por discrepancia sobre modelos Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2.031 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,1 GB de pesos; en 4 bits, aproximadamente 1,1 GB de pesos (valores teoricos; no se han publicado ficheros GGUF en la informacion disponible).
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para inferencia en bf16 sin cuantizar; GPUs de consumo con 8 GB o mas para cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en bf16 con contexto corto, y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta text-generation-inference), endpoints compatibles; vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B | ~2.031M (denso) | 1.024 tokens (entrenamiento) | Apache 2.0 | Destilado de Qwen3-30B-A3B sobre CoT STEM |
| Qwen/Qwen3-1.7B (base) | ~1.700M (denso) | no disponible en la informacion | Apache 2.0 | Modelo base sin destilacion STEM especifica |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) | 30.000M totales / 3.000M activos (MoE) | no disponible en la informacion | no disponible en la informacion | Modelo profesor; mayor capacidad pero mucho mayor coste de despliegue |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Contexto de entrenamiento muy corto (1.024 tokens), lo que limita el razonamiento sobre problemas largos o conversaciones extensas.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en derivaciones largas donde puede omitir pasos o introducir errores sutiles.
- Entrenado sobre un conjunto de datos relativamente pequeno (6.122 muestras) y una sola epoca, lo que puede provocar sobreajuste a los dominios y estilos concretos de esos datasets.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Ausencia de datos sobre sesgos; al derivar de Qwen3, puede heredar sesgos del modelo base y del profesor.
- No se confirma soporte de tool calling ni de razonamiento agentico multi-paso.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y del profesor, y validar el comportamiento en produccion antes de desplegarlo.
- El autor es un desarrollador independiente; no hay garantias de mantenimiento ni de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
