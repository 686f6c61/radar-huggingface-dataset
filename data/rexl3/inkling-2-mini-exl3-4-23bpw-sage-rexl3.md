# REXL3/Inkling-2-Mini-EXL3-4.23bpw-SAGE-REXL3

## Resumen

Inkling-2-Mini-EXL3-4.23bpw-SAGE-REXL3 es una cuantización experimental del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por REXL3. El modelo base es un image-text-to-text de aproximadamente 7.460 millones de parámetros que procesa texto e imágenes en una única pila conversacional. Esta variante reduce el checkpoint original a un pack EXL3 de 4,23 bits por peso en las matrices lineales del decodificador, con un tamaño de repositorio de 15,5 GB frente a los ~15 GB de pesos en BF16 del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un método de cuantización mixta propietario (SAGE) que combina 4 bpw en las matrices expertas del núcleo, 5 bpw en las matrices expertas de coda, 6 bpw en atención y 4 bpw en la cabeza de salida, manteniendo embeddings y visión en BF16. Por otro, expone un caso real de empaquetado para servir modelos multimodales en una única RTX 3090 con un runtime privado (REXL3 `build-r5`), lo que resulta útil para investigadores que evalúan compromisos entre fidelidad, latencia y memoria.

El pack incluye decodificación especulativa (DSpark) con hasta siete propuestas más un ancla, una tabla Markov derivada en BF16 y una caché de prefijo física de 8 GiB respaldada en host. No se trata de un modelo nuevo: no se ha reentrenado ni ajustado, y la licencia Apache-2.0 se hereda del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (modelo base Inkling-2-Mini); pack EXL3 con decodificación especulativa DSpark |
| Parámetros totales | 7.464.307.200 |
| Parámetros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 198.144 tokens en la configuración probada (un slot, 128 filas de prefill); ventana nativa del modelo base no disponible |
| Tipos de cuantización | EXL3 mixta: 4 bpw núcleo experto, 5 bpw coda experta, 6 bpw atención, 4 bpw cabeza de salida; embeddings y visión en BF16; DSpark con 29 proyecciones locales a 4 bpw y estado BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (28 archivos: 25 shards del target, cabeza de salida, draft y Markov fold) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer multimodal que acepta entradas de imagen y texto y genera texto. Esta variante no altera la arquitectura: REXL3 cuantiza los pesos publicados del checkpoint original (revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7`) sin reentrenamiento ni uso de checkpoints BF16 no publicados. El origen ya empleaba pesos expertos mixtos NVFP4/MXFP8, y el pack EXL3 los reempaqueta con el método SAGE, no publicado, que asigna precisión diferenciada por tipo de matriz.

La innovación principal del pack es el runtime de servicio. Incluye DSpark, un esquema de decodificación especulativa con hasta siete propuestas más un ancla, y una tabla Markov derivada en BF16 que no añade parámetros aprendidos. La configuración probada usa FP16 como precisión de destino y del draft KV, una caché de prefijo física de 8 GiB respaldada en host y un adaptador SM86 privado (`build-r5`) que no es compatible con ExLlamaV3 ni Transformers estándar. La fidelidad declarada frente a la fuente reconstruida es de KL media 0,01888 nats y p95 0,05502 nats, con acuerdo top-1 de 476/512 (92,97%) y perplejidad 19,673 frente a 19,799 del origen.

## Capacidades

- Generación de texto conversacional multi-turno con entradas de imagen y texto (pipeline image-text-to-text).
- Procesamiento de imágenes en formato RGB PNG inline, verificado a 8K en la configuración probada; las URL remotas de imagen están deshabilitadas.
- Razonamiento con modo de pensamiento (thinking) activado por defecto en la plantilla fijada; el adaptador local rechaza la selección explícita de esfuerzo `high`.
- Decodificación especulativa DSpark con hasta siete propuestas más un ancla, orientada a reducir latencia en generación.
- Caché de prefijo de hasta 198.144 tokens en un solo slot, con restauración de 197.760 tokens por petición en caliente.
- Soporte de streaming SSE con gestión de desconexión y reutilización de caché sensible a visión.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Investigación en cuantización extrema: el pack permite reproducir métricas de fidelidad (KL, acuerdo top-1, perplejidad) de un esquema mixto de 4-6 bpw sobre un modelo multimodal de 7,5B, útil para comparar métodos de compresión en una sola GPU de 24 GB.
- Servicio de visión-lenguaje en una RTX 3090: con 15,5 GB de pesos y un mínimo de 2,60 GiB de memoria CUDA libre observado, cabe en una GPU consumer de gama alta para prototipos de descripción de imágenes y respuesta a preguntas visuales.
- Evaluación de decodificación especulativa: DSpark con siete propuestas más ancla permite medir ganancias de throughput (12,87 tok/s en caliente frente a 6,36 tok/s en serie) en cargas de contexto largo.
- Procesamiento de documentos largos con imágenes intercaladas: la ventana de 198.144 tokens y la caché de prefijo de 8 GiB permiten reutilizar contexto entre peticiones relacionadas, por ejemplo en análisis de informes con figuras.
- Pruebas de contrato de renderizado y muestreo: el pack documenta un contrato local verificado (temperatura 1,0, top_k 50, top_p 1,0, semilla 72) útil para validar pipelines de evaluación reproducibles.
- Benchmarking de latencia en contexto casi completo: las mediciones de prefill en frío (1.546 slices, 951,571 s hasta el primer contenido) sirven para dimensionar SLA y decidir entre servicio en caliente con caché o prefill completo.
- Experimentación con adaptadores de runtime: sirve como banco de pruebas para desarrolladores que trabajen con el adaptador SM86 `build-r5` y quieran validar compatibilidad de pesos EXL3 mixtos.

## Benchmarks y rendimiento

| Prueba | Cobertura | Resultado | tok/s salida (incl. prefill y thinking) |
|---|---|---|---|
| SixCat v0.8.3 challenge-v1 | 25 primeras respuestas, código desactivado | 16/25 nativo; 16/24 excluyendo un corte de conocimiento no resuelto | 60,67 |
| Q200v2 text180 | 180/180 primera respuesta | no disponible en el extracto | no disponible |

| Servicio en RTX 3090 (197.888 entrada + 256 salida) | Primer contenido r3 → r5 | Pared de petición r3 → r5 | tok/s salida r5 |
|---|---:|---:|---:|
| Frío, DSpark | 1.560,486 → 951,571 s | 1.622,014 → 969,445 s | 0,26 |
| Caliente, DSpark | 2,734 → 1,980 s | 64,192 → 19,886 s | 12,87 |
| Caliente, serie | 2,745 → 2,019 s | 159,510 → 40,221 s | 6,36 |

| Servicio corto (8.192 entrada + 64 salida) | Tiempo |
|---|---:|
| Frío | 10,738 s |
| Caliente DSpark | 0,957 s |
| Caliente serie | 2,646 s |

Fidelidad de siguiente token (512 posiciones, 200.058 logits legales, normalización FP64): KL media 0,01888 nats, p95 0,05502 nats, acuerdo top-1 92,97%, ΔNLL −0,00638 nats/token, perplejidad 19,673 (EXL3) frente a 19,799 (fuente). En `build-r5`, el arranque tardó 38,084 s, el mínimo de memoria CUDA libre muestreada fue 2,60 GiB y el pico del cgroup de host fue 10,02 GiB, sin swap.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de 15,5 GB; mínimo observado de 2,60 GiB de memoria CUDA libre durante el servicio en una RTX 3090 de 24 GB.
- GPU recomendadas: RTX 3090 (única GPU validada); no se han documentado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en RTX 3090 con 24 GB; otras consumer no verificadas.
- Memoria de host: pico de cgroup de 10,02 GiB con caché de prefijo de 8 GiB respaldada en host.
- Opciones de despliegue: exclusivamente el adaptador privado REXL3 `build-r5` SM86; no compatible con REXL3 estándar, ExLlamaV3 ni Transformers.
- Latencia y throughput: 12,87 tok/s en caliente con DSpark y 6,36 tok/s en serie para 197.888 tokens de entrada más 256 de salida; 0,957 s y 2,646 s respectivamente en la prueba corta de 8.192 + 64.
- Perfilado: en cuatro slices fríos de 128 tokens, la atención completa pasó del 0,57% al 87,01% del tiempo de kernel sumado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-4.23bpw-SAGE-REXL3 | 7,46B | 198.144 tokens en config. probada | Apache-2.0 | safetensors EXL3 | Pack experimental; runtime privado no incluido |
| thinkingmachines/Inkling-2-Mini (base) | 7,46B | no disponible | Apache-2.0 | safetensors (NVFP4/MXFP8) | Público en Hugging Face |
| Alternativas de 7B multimodal con licencia permisiva | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El pack no es ejecutable con herramientas estándar: requiere el adaptador privado REXL3 `build-r5` SM86, que no se distribuye con el modelo.
- El método de cuantización SAGE no está publicado, lo que impide auditar cómo se asigna la precisión por matriz.
- Las métricas de fidelidad miden solo la reproducción de logits frente a la fuente, no la pérdida de calidad en tareas; no se realizó una ejecución de tareas emparejada con la fuente.
- El modo de pensamiento está fijado en alto por la plantilla y el adaptador rechaza la selección explícita de esfuerzo `high`.
- Las URL remotas de imagen están deshabilitadas; solo se admite imagen inline (RGB PNG verificado a 8K, no a la ventana completa de texto).
- La evaluación de tareas cubre una muestra pequeña (25 respuestas en SixCat) y un contrato de muestreo local, no paridad con la inferencia del proveedor.
- El rendimiento en frío es muy alto (951,571 s hasta el primer contenido con contexto casi completo); el servicio en producción depende de la caché de prefijo en caliente.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de un runtime privado no incluido limita su explotación práctica.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la librería `rexl3` no es estándar.

## Enlaces

- Hugging Face: https://huggingface.co/REXL3/Inkling-2-Mini-EXL3-4.23bpw-SAGE-REXL3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Métricas del pack: METRICS.json (incluido en el repositorio)
- Validación del pack: VALIDATION.json (incluido en el repositorio)
