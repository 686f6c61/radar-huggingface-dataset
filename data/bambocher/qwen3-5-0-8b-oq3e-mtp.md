# bambocher/Qwen3.5-0.8B-oQ3e-mtp

## Resumen

`bambocher/Qwen3.5-0.8B-oQ3e-mtp` es un checkpoint cuantizado del modelo Qwen3.5-0.8B (la denominación lo indica, aunque la model card no declara explícitamente el modelo base) publicado por el usuario bambocher. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos realizada con la herramienta oQ de oMLX (v0.7.1rc1), que aplica cuantización de precisión mixta y genera un artefacto en formato MLX (safetensors) listo para ejecutarse en Apple Silicon. El resultado ocupa 0,532 GiB en disco y promedia 5,232 bits por peso.

El interés técnico del checkpoint está en su estrategia de cuantización: en lugar de aplicar un único ancho de bits, distribuye los tensores en seis formatos (3, 4, 5, 6 y 8 bits afines con grupo de 64, más BF16), concentrando el 75,03 % de los pesos lógicos en 3 bits y reservando BF16 para el 11,8 % (0,103B de parámetros), presumiblemente capas sensibles a la precisión. Además, conserva el cabezal MTP (multi-token prediction) de 0,020B parámetros, lo que habilita decodificación especulativa, y el módulo de visión de 0,101B, lo que apunta a un modelo base multimodal.

Es un artefacto de nicho: 12 descargas, 0 likes y sin resultados de benchmarks publicados. Su relevancia es práctica, no investigadora: permite probar un modelo de ~873 M parámetros con capacidad de imagen en un Mac con memoria unificada modesta, a costa de una pérdida de calidad no documentada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag `qwen3_5` apunta a la familia Qwen3.5 (transformer). Incluye módulo de visión y cabezal MTP |
| Parámetros totales | 873.438.784 (0,873B) según safetensors |
| Parámetros activos | No aplica / no disponible (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta: affine 3-bit (grupo 64), 4-bit, 5-bit, 6-bit, 8-bit y BF16; media efectiva 5,232 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

Desglose de la cuantización declarado por el autor:

| Formato | Pesos lógicos | % del total | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 0,655B | 75,032 % | 0,267 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,018B | 2,101 % | 0,010 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,085B | 9,728 % | 0,054 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,012B | 1,321 % | 0,009 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,000B | 0,004 % | 0,000 GiB | 8,50 |
| BF16 | 0,103B | 11,815 % | 0,192 GiB | 16,00 |
| **Total** | **0,873B** | **100 %** | **0,532 GiB** | **5,232** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 0,752B | 0,356 GB / 0,331 GiB |
| Visión | 0,101B | 0,201 GB / 0,187 GiB |
| Cabezal MTP | 0,020B | 0,015 GB / 0,014 GiB |
| **Total** | **0,873B** | **0,571 GB / 0,532 GiB** |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna, el número de capas, la dimensión oculta ni el esquema de atención. Lo que sí se puede inferir de los datos del repositorio es la composición del checkpoint: un tronco de lenguaje de 0,752B parámetros, una torre de visión de 0,101B y un cabezal de predicción multi-token (MTP) de 0,020B. La presencia conjunta de visión y MTP sugiere un modelo base multimodal con decodificación especulativa integrada, pero el alcance exacto de ambas capacidades no está descrito en la model card.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni sobre si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento. El autor tampoco documenta el proceso de calibración de la cuantización mixta: se desconoce qué criterio (por ejemplo, sensibilidad por capa o error de reconstrucción) determinó qué tensores se mantienen en BF16 o suben a 5-6 bits. La contribución técnica del repositorio es, por tanto, exclusivamente la receta de cuantización de oQ aplicada a este checkpoint concreto.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base (calidad no verificada tras la cuantización a 3 bits mayoritaria).
- Procesamiento de imagen: el checkpoint conserva una torre de visión de 0,101B parámetros, lo que indica soporte de entrada visual; el autor no detalla tareas concretas (captioning, VQA, OCR).
- Predicción multi-token mediante el cabezal MTP de 0,020B, utilizable para decodificación especulativa y para acelerar la generación.
- Ejecución nativa en MLX sobre Apple Silicon, con carga directa desde safetensors.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Modo thinking o razonamiento explícito: no disponible en la información.

## Casos de uso

- **Prototipado local en Mac**: cargar el checkpoint con MLX para validar pipelines de generación de texto en un portátil Apple Silicon sin depender de GPU dedicada, dado que los pesos ocupan 0,532 GiB.
- **Asistente de texto offline**: integrar el modelo en una aplicación de escritorio con requisitos de privacidad, manteniendo toda la inferencia en local y sin llamadas a API externas.
- **Descripción y etiquetado de imágenes en dispositivo**: usar la torre de visión conservada para generar pies de foto o metadatos en flujos de gestión de fototeca, sujeto a validación previa de la calidad del módulo visual tras la cuantización.
- **Modelo borrador en decodificación especulativa**: aprovechar el cabezal MTP como generador de candidatos en un esquema draft-target junto a un modelo mayor, reduciendo el número de pasos del modelo principal.
- **Autocompletado y generación de baja latencia**: por tamaño y formato, es adecuado para completar texto en editores o terminales donde el tiempo de respuesta por token es crítico.
- **Clasificación y extracción de información por lotes**: ejecutar tareas de etiquetado o extracción de entidades sobre grandes volúmenes de documentos en local, como paso previo a la revisión humana.
- **Banco de pruebas de cuantización**: comparar la salida de este checkpoint mixto de 5,232 bits/peso frente al modelo base en BF16 para medir la degradación introducida por el esquema de oQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión (bits por peso y tamaño de almacenamiento), no evaluaciones de calidad (MMLU, HumanEval, GSM8K, MMMU u otras).

## Requisitos de hardware

- **VRAM / memoria unificada**: los pesos ocupan 0,532 GiB (0,571 GB). Hay que sumar la caché KV y el overhead del runtime; en la práctica, un espacio de trabajo de 1-2 GB de memoria es un punto de partida razonable.
- **GPU compatibles**: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), al estar los pesos en formato MLX. No es un checkpoint utilizable directamente en CUDA sin conversión.
- **Consumer GPU**: cabe sobradamente en cualquier Mac con 8 GB de memoria unificada o más. En el espacio NVIDIA no hay soporte nativo por el formato.
- **Opciones de despliegue**: MLX (librería `mlx` declarada) y `mlx-lm` / ecosistema oMLX. No se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama no pueden cargarlo tal cual; vLLM y TGI no soportan el formato MLX.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones del autor ni de terceros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ3e-mtp (este) | 0,873B | No disponible | No disponible | MLX safetensors, 5,232 bits/peso | 12 descargas, 0 likes |
| Qwen3.5-0.8B (modelo base) | 0,8B aprox. (no confirmado) | No disponible | No disponible | No disponible | No documentado en esta información |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables (parámetros, contexto, benchmarks o licencia) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Calidad no verificada**: el 75,03 % de los pesos lógicos está en 3 bits afines con grupo de 64; no hay ninguna evaluación publicada que mida la degradación frente al modelo base. Riesgo alto de degradación en tareas de razonamiento, matemáticas y código.
- **Licencia sin declarar**: el repositorio no indica licencia. No se puede asumir uso comercial sin consultar previamente la licencia del modelo base original y los términos de la conversión.
- **Idiomas sin declarar**: no se especifica qué idiomas cubre; el rendimiento en castellano es desconocido.
- **Contexto desconocido**: se desconoce la ventana de contexto del modelo base y si la cuantización la altera.
- **Riesgo de alucinación**: no cuantificado; en modelos de menos de 1B parámetros el fenómeno es habitualmente acusado, y la cuantización agresiva puede agravarlo.
- **Sesgos**: no documentados por el autor; no hay evaluación de sesgos ni de seguridad.
- **Fragmentación del ecosistema**: los pesos son exclusivamente MLX; requieren macOS y Apple Silicon. No hay GGUF ni safetensors estándar para transformers.
- **Trazabilidad limitada**: 12 descargas y 0 likes; sin issues, discusión ni mantenimiento conocido. No hay garantía de actualizaciones.
- **Cabezal MTP y visión sin documentar**: se desconoce si ambos módulos funcionan correctamente tras la cuantización o si requieren pasos de configuración adicionales.

## Enlaces

- [HuggingFace: bambocher/Qwen3.5-0.8B-oQ3e-mtp](https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ3e-mtp)
- [Repositorio de oQ / oMLX (herramienta de cuantización utilizada)](https://github.com/jundot/omlx)
