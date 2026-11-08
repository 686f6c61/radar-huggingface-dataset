# quasar529/uno-qwen3-8b-bidir-block32-tv-ce10

## Resumen

`uno-qwen3-8b-bidir-block32-tv-ce10` es un adaptador LoRA de investigación publicado por el usuario `quasar529` sobre el modelo base `s-sahoo/uno-qwen3-8B`, una variante de Qwen3-8B adaptada para decodificación especulativa mediante difusión en el proyecto Uno. No es un modelo de 8B independiente ni un ajuste de parámetros completos: el repositorio contiene únicamente los pesos del adaptador (1,4 GB) que modifican el comportamiento del modelo base congelado.

El adaptador se entrena con un objetivo híbrido de 1 × TV-L1 + 1 × CE y un currículo de bloques de ruido de 2 a 32 posiciones, donde el estudiante atiende de forma bidireccional dentro de cada bloque ruidoso para predecir el token en la misma posición. Está pensado para investigación en generación por difusión y decodificación especulativa, no para uso directo en producción.

Su relevancia es limitada y experimental: el propio autor advierte que no se ha validado la carga y generación en un servidor limpio, no se garantiza equivalencia de salidas entre GPUs o stacks de software distintos, y no se soporta reanudación exacta del entrenamiento. Es un artefacto de reproducibilidad parcial, útil para quien investigue el pipeline de Uno sobre Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención bidireccional intra-bloque (adaptador sobre Qwen3-8B) |
| Parametros totales | No disponible (el adaptador LoRA es de rango 128; el base es de 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con longitud de secuencia 4096) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter.safetensors` (nombres de parámetros personalizados de `UniformModel`, no PEFT estándar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el checkpoint congelado `s-sahoo/uno-qwen3-8B` (revisión `b8a7577b3223bdcf2b3af0f2fc6e95258b3bbc29`), que a su vez deriva de Qwen3-8B. El estudiante atiende de forma bidireccional dentro de cada bloque ruidoso y predice el token en la misma posición, viendo únicamente el prefijo limpio anterior a ese bloque; el profesor permanece causal. Cada bloque usa ruido completo con probabilidad 0,5; en caso contrario, su probabilidad de reemplazo es uniforme en [0,1].

El entrenamiento usa LoRA de rango 128 y alpha 2048 (alpha/r = 16), con un currículo de bloques 2 → 4 → 6 → 8 → 12 → 16 → 32. El objetivo es 1 × TV-L1 + 1 × CE, donde TV-L1 es la suma sobre el vocabulario de diferencias absolutas de probabilidad (el doble de la variación total matemática) y CE, cuando se activa, apunta al argmax del verificador causal limpio, no al token original de los datos. Los datos provienen de `open-thoughts/OpenThoughts3-1.2M`, con batch global 128 y longitud de secuencia 4096. No hay condicionamiento temporal explícito ni autoconcondicionamiento. El checkpoint final es el 32.813.

## Capacidades

- Generación de texto mediante un esquema de difusión por bloques con 1, 2 o 4 pasos de denoising (la mejora con más pasos no está garantizada).
- Razonamiento y matemáticas heredados del modelo base Qwen3-8B y del dataset OpenThoughts3.
- Decodificación especulativa en el contexto del pipeline Uno, con un estudiante bidireccional y un verificador causal.
- Soporte multilingüe limitado al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- No se documenta un modo de razonamiento explícito (thinking mode) en este adaptador.

## Casos de uso

- Investigación en decodificación especulativa: el adaptador permite experimentar con un estudiante bidireccional que predice tokens en la misma posición dentro de bloques ruidosos, comparando aceptación frente al verificador causal.
- Estudio de objetivos híbridos TV-L1 + CE: útil para analizar cómo afecta la combinación de pérdida de variación total y entropía cruzada al comportamiento del draft en generación por difusión.
- Reproducción parcial de experimentos: el repositorio incluye `release.json`, `SHA256SUMS.json` y `REPRODUCIBILITY.md` para verificar la integridad de los pesos exportados y la identidad del checkpoint.
- Evaluación de currículos de bloques: permite comparar el efecto del currículo 2 → 32 en la calidad del draft dentro de un pipeline Uno.
- Análisis de robustez entre stacks: sirve para estudiar la sensibilidad de las salidas a cambios de GPU, versión de PyTorch o backend de atención, dado que el autor no garantiza equivalencia.
- Docencia y formación: como ejemplo de adaptador LoRA no estándar con parámetros personalizados (`UniformModel`) que requiere un cargador propio en lugar de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la release no es un paquete de benchmark listo para usar y que las diferencias de precisión experimentales existentes no constituyen afirmaciones de mejora de calidad bajo muestreo especulativo exacto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El adaptador ocupa 1,4 GB; el modelo base de 8B en bfloat16 requiere del orden de 16 GB solo para pesos, más activaciones y caché.
- GPU recomendadas: no especificadas por el autor. El código de referencia usa `torch.bfloat16` y `.cuda()`.
- GPU de consumo: no confirmado. Un modelo de 8B en bfloat16 no cabe en GPUs de 8-12 GB sin cuantización, y este adaptador no documenta soporte de cuantización.
- Despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma documentada. El cargador de referencia es personalizado (`uniform_uno.model.UniformModel` y `uniform_uno.state.load_adapter`) y requiere añadir `code` y `code/upstream` al `PYTHONPATH`.
- Latencia y throughput: no establecidos. El autor advierte que el mismo TPS en otro servidor no está garantizado y que la ruta de generación de referencia no debe usarse para afirmar reproducción de TPS de motores optimizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `quasar529/uno-qwen3-8b-bidir-block32-tv-ce10` | Adaptador LoRA sobre 8B | No disponible (entrenado a 4096) | Adaptador de difusión para Uno | Apache 2.0 | Hugging Face, 0 descargas |
| `s-sahoo/uno-qwen3-8B` | 8B | No disponible | Bundle de inferencia Uno-Qwen3-8B | No disponible en la información | Hugging Face |
| `Qwen/Qwen3-8B` | 8B | No disponible en la información | LLM causal estándar | No disponible en la información | Hugging Face |

La comparación de rendimiento no está disponible: no hay benchmarks publicados para el adaptador ni datos de evaluación cruzada con el base o con Qwen3-8B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el checkpoint base `s-sahoo/uno-qwen3-8B` en la revisión exacta indicada; sustituirlo por un Qwen3 genérico no es válido.
- No se debe cargar como adaptador PEFT estándar ni usar la ruta de drafting causal original de Uno; usa nombres de parámetros personalizados de `UniformModel`.
- La carga en un servidor limpio, la generación y la equivalencia de salidas entre GPUs o stacks de software no están validadas.
- No se soporta reanudación exacta del entrenamiento: los estados del optimizador y del RNG se omiten deliberadamente.
- La release no es un paquete de benchmark listo para usar; las tablas AIME/GSM8K previas no se reproducen de forma directa.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero heredados del modelo base y del dataset OpenThoughts3.
- Idiomas: solo inglés según la model card.
- Licencia Apache 2.0, pero el código de terceros, el modelo base y los datos conservan sus propios términos; se preservan LICENSE y NOTICE de upstream.
- El código del modelo base usa remote code; el autor recomienda inspeccionarlo antes de ejecutarlo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/quasar529/uno-qwen3-8b-bidir-block32-tv-ce10
- Modelo base: https://huggingface.co/s-sahoo/uno-qwen3-8B
- Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio Uno: https://github.com/ifm-ai/uno
- Dataset OpenThoughts3: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
