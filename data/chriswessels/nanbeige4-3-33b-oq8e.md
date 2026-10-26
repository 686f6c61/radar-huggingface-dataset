# chriswessels/Nanbeige4.3-33B-oQ8e

## Resumen

Nanbeige4.3-33B-oQ8e es una cuantización de terceros del modelo Nanbeige4.3-33B, publicada por el usuario chriswessels en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint convertido al formato MLX (Apple Silicon) mediante la herramienta oQ de oMLX v0.7.2, que aplica cuantización de precisión mixta. El resultado es un artefacto de 33.118.977.024 parámetros almacenados con una media efectiva de 8,500 bits por peso, lo que reduce el peso en disco a 32,773 GiB (35,190 GB) frente a los aproximadamente 66,2 GB que ocuparía el mismo modelo en BF16.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorionoincluye información sobre el modelo base (arquitectura, contexto, datos de entrenamiento, idiomas o licencia), y la model card se limita a documentar la distribución de bits de la cuantización. Su interés práctico es que permite ejecutar un modelo de 33B en equipos Apple Silicon con memoria unificada de gama alta, algo imposible con el checkpoint original en BF16 en la mayoría de configuraciones de consumo.

Por tanto, esta ficha describe principalmente el artefacto de cuantización y sus requisitos de despliegue. Cualquier dato sobre capacidades, rendimiento o condiciones de uso del modelo subyacente debe consultarse en la model card del Nanbeige4.3-33B original, que no forma parte de la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. La etiqueta `llama` del repositorio sugiere un transformer decoder-only de tipo Llama, pero no esta confirmado |
| Parametros totales | 33.118.977.024 (33,119 mil millones) |
| Parametros activos | No aplica / no disponible (no hay indicios de arquitectura MoE en la informacion) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine con group size 64 (precision mixta oQ); 99,998% de los pesos a 8 bits y 0,002% en BF16; media efectiva de 8,500 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` en formato MLX (`library_name: mlx`); 35,190 GB / 32,773 GiB |
| Modelo base | Nanbeige4.3-33B (sin enlace ni model card incluidos en el repositorio) |
| Autor de la cuantizacion | chriswessels (tercero, no el autor original del modelo) |
| Herramienta de cuantizacion | oQ / oMLX v0.7.2 (https://github.com/jundot/omlx) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

No hay información en el repositorio sobre la arquitectura del modelo base, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). La etiqueta `llama` incluida en los tags de HuggingFace apunta a una arquitectura transformer decoder-only compatible con el ecosistema Llama, pero se trata de una inferencia a partir de metadatos, no de un dato documentado en la model card.

La única información técnica verificable se refiere al proceso de cuantización. oMLX v0.7.2 aplica cuantización affine de 8 bits con tamaño de grupo 64 sobre el 99,998% de los pesos lógicos (33,118B parámetros, 32.771 GiB) y mantiene un 0,002% (0,001B parámetros) en BF16, presumiblemente capas sensibles a la precisión. El checkpoint completo suma 32.773 GiB con una media de 8,500 bits por peso. No se documenta qué tensores quedaron en BF16, ni se publican métricas de degradación (perplejidad, benchmarks) respecto al modelo original.

## Capacidades

- Generación de texto: capacidad esperable por el tamaño del modelo base, pero no documentada en la información disponible.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones.
- Generación de código: no disponible; no se confirma soporte ni calidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas soportados no están declarados en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local en Apple Silicon: capacidad confirmada por el formato MLX del checkpoint, siempre que se disponga de memoria unificada suficiente.

## Casos de uso

- Inferencia local en Mac de gama alta: el checkpoint está en formato MLX y ocupa 32,773 GiB, por lo que puede cargarse con `mlx-lm` u oMLX en equipos con 64 GB de memoria unificada, manteniendo los datos en el dispositivo sin conexión a servicios externos.
- Prototipado y evaluación de modelos de 33B sin GPU dedicada: permite probar un modelo de esta escala en un Mac Studio o MacBook Pro con M-series Max/Ultra, algo inviable con el checkpoint BF16 (unos 66,2 GB) en la mayoría de configuraciones.
- Procesamiento de documentos confidenciales: al ejecutarse en local, es adecuado para resumir o extraer información de textos sensibles que no pueden enviarse a APIs en la nube, sujeto a que la licencia del modelo base lo permita.
- Asistencia de escritura y edición en local: generación y reescritura de textos en un flujo de trabajo de escritorio, con la ventaja de que el modelo no abandona la máquina del usuario.
- Experimentación con cuantización de precisión mixta: el repositorio sirve como referencia para estudiar el equilibrio entre 8 bits y BF16 en un modelo de 33B, comparando el comportamiento del checkpoint oQ8e frente al BF16 original.
- Banchmarking interno de hardware Apple: útil para medir latencia y throughput de un modelo de 33B en MLX sobre distintos chips (M3 Max, M4 Max, M2 Ultra), aunque el autor no publica esas mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones del modelo base ni métricas de degradación introducidas por la cuantización (perplejidad, MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- Peso del checkpoint: 32,773 GiB (35,190 GB) en disco; es el mínimo absoluto de memoria para cargar los pesos.
- VRAM o memoria unificada estimada: al peso de los parámetros hay que sumar la caché KV y las activaciones. Como referencia conservadora, se recomienda un mínimo de 48 GB de memoria unificada y 64 GB para trabajar con contextos largos o lotes mayores. Estas cifras son estimaciones de cálculo, no mediciones publicadas.
- Equipos Apple Silicon recomendados: Mac Studio con M2 Ultra (64/128/192 GB), MacBook Pro con M4 Max (64/128 GB) o M3 Max (64/128 GB). En configuraciones de 32 GB no cabe con margen suficiente.
- GPU NVIDIA: el formato MLX no se ejecuta en CUDA; sería necesaria una conversión previa (por ejemplo a GGUF o safetensors estándar). No se ha publicado dicha conversión. Como referencia, un checkpoint equivalente en 8 bits requiere del orden de 35-40 GB de VRAM, lo que implica A100 80 GB, H100 o dos RTX 4090 de 24 GB.
- Cabe en GPU de consumo: no en una única RTX 4090 (24 GB). En Apple Silicon de gama alta, sí.
- Opciones de despliegue: `mlx-lm`, oMLX/oQ, LM Studio (soporte MLX). vLLM y TGI no admiten pesos MLX directamente; llama.cpp requiere GGUF, que no se incluye en el repositorio.
- Latencia y throughput: no disponible. El autor no publica tokens por segundo ni mediciones de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus especificaciones públicas habituales y deben verificarse antes de usarse en producción; el modelo base Nanbeige4.3-33B no documenta sus especificaciones en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles | Peso en 8 bits |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-oQ8e (este) | 33,119B | No disponible | No disponible | MLX safetensors | 32,8 GiB |
| Nanbeige4.3-33B (BF16 original) | 33,119B | No disponible | No disponible | No disponible en este repo | ~66,2 GB (cálculo) |
| Qwen2.5-32B-Instruct | 32,8B | 32.768 nativo; 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, MLX | ~35 GB |
| Gemma-2-27B-it | 27B | 8.192 | Gemma Terms of Use | safetensors, GGUF | ~29 GB |

La comparación de rendimiento con estas alternativas no es posible: no hay benchmarks publicados del Nanbeige4.3-33B-oQ8e ni de su modelo base en la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueante para cualquier despliegue en producción hasta verificar la licencia del Nanbeige4.3-33B original.
- Idiomas no declarados: se desconoce si el modelo rinde correctamente en castellano o si está orientado principalmente a inglés o chino.
- Sin benchmarks: no hay evidencia publicada de calidad ni de la degradación introducida por la cuantización de 8 bits frente al checkpoint BF16.
- Contexto desconocido: no se puede planificar el uso con documentos largos ni con conversaciones multi-turno extensas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se documentan medidas de mitigación ni evaluación de seguridad.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o alineación.
- Formato exclusivo MLX: limita el despliegue a hardware Apple Silicon o requiere conversión manual; no hay GGUF ni safetensors estándar en el repositorio.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en la fecha de creación, sin issues ni discusión que permitan contrastar el funcionamiento del checkpoint.
- Model card incompleta: no enlaza al modelo base, no indica la revisión concreta sobre la que se cuantizó ni los tensores dejados en BF16, lo que dificulta reproducir el proceso.
- Fecha de publicación reciente (2026-10-25) y actualización 32 minutos después de la creación: el artefacto puede haber sido revisado y conviene comprobar la integridad del hash antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chriswessels/Nanbeige4.3-33B-oQ8e
- Repositorio de la herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Nanbeige4.3-33B: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
