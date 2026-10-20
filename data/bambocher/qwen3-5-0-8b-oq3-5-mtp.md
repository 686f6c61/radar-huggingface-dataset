# bambocher/Qwen3.5-0.8B-oQ3.5-mtp

## Resumen

Qwen3.5-0.8B-oQ3.5-mtp es un checkpoint cuantizado del modelo Qwen3.5-0.8B publicado por el usuario bambocher en Hugging Face. No se trata de una release oficial de Qwen/Alibaba, sino de una conversión comunitaria realizada con oQ (oMLX v0.7.1rc1), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple. El repositorio tiene 11 descargas y 0 likes en el momento de redactar esta ficha.

El checkpoint conserva 873.438.784 parámetros lógicos (0,873B) comprimidos en 0,599 GB de almacenamiento, con una media efectiva de 5,484 bits por peso. La descomposición de componentes revela una estructura multimodal: modelo de lenguaje (0,752B), torre de visión (0,101B) y cabeza MTP de multi-token prediction (0,020B). Es decir, no es solo un modelo de texto cuantizado, sino un VLM pequeño con capacidad de predicción multi-token.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo con visión en Macs con memoria unificada limitada, en un formato nativo para MLX. La información publicada es escasa: no hay datos de contexto, idiomas, licencia ni resultados de benchmarks, lo que limita seriamente cualquier evaluación de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo decoder con torre de visión y cabeza MTP (inferido de la estructura del checkpoint; la model card no detalla la arquitectura) |
| Parámetros totales | 873.438.784 (0,873B), dato real de safetensors |
| Parámetros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta afín con grupo de 64: 3, 4, 5, 6 y 8 bits, más pesos en BF16; media efectiva de 5,484 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX |
| Biblioteca | mlx |
| Tamaño del repositorio | 0,599 GB (0,558 GiB) |
| Autor | bambocher (cuantización comunitaria, no oficial) |
| Fecha de publicación | 2026-10-20 |

Distribución de precisión del checkpoint:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 3 bits, grupo 64 | 0,552B | 63,207% | 0,225 GiB | 3,50 |
| Afín 4 bits, grupo 64 | 0,018B | 2,101% | 0,010 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 0,175B | 20,026% | 0,112 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 0,025B | 2,840% | 0,019 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 0,000B | 0,011% | 0,000 GiB | 8,50 |
| BF16 | 0,103B | 11,815% | 0,192 GiB | 16,00 |
| **Total** | **0,873B** | **100%** | **0,558 GiB** | **5,484** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 0,752B | 0,357 GiB |
| Visión | 0,101B | 0,187 GiB |
| Cabeza MTP | 0,020B | 0,014 GiB |
| **Total** | **0,873B** | **0,558 GiB** |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni su proceso de entrenamiento. Lo único deducible con certeza es la estructura del checkpoint: un modelo de lenguaje de 0,752B parámetros lógicos, una torre de visión de 0,101B y una cabeza MTP de 0,020B. La etiqueta `qwen3_5` y el propio nombre del repositorio apuntan a que el modelo base es Qwen3.5-0.8B, pero no se aporta información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

La innovación técnica documentada es exclusivamente la cuantización. oQ aplica precisión mixta por capas: el 63,2% de los pesos (0,552B) se almacena a 3 bits con grupo de 64, el 20,0% a 5 bits, y solo un 11,8% (0,103B) permanece en BF16. Es destacable que la torre de visión ocupa 0,187 GiB para 0,101B de parámetros, lo que equivale a unos 16 bits por peso: en la práctica, la visión se mantiene prácticamente sin cuantizar mientras el cuerpo del modelo de lenguaje se comprime de forma agresiva. La presencia de una cabeza MTP sugiere soporte para decodificación especulativa o predicción multi-token, aunque no se detalla cómo se explota en inferencia.

No hay información sobre innovaciones de atención (attention linear, sliding window, etc.), decodificación especulativa configurada, ni detalles del tokenizador.

## Capacidades

- Generación de texto: el componente de lenguaje (0,752B) es funcional como modelo causal estándar.
- Comprensión de imágenes: la torre de visión de 0,101B, almacenada casi íntegramente en BF16, habilita tareas de VQA, captioning y descripción de documentos visuales.
- Predicción multi-token: la cabeza MTP de 0,020B está presente en el checkpoint, pensada para acelerar la decodificación si el runtime la soporta.
- Ejecución en Apple Silicon: formato MLX nativo, con inferencia sobre memoria unificada.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluación publicada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo thinking o razonamiento extendido: no disponible.
- Audio: no disponible (el checkpoint solo incluye lenguaje, visión y MTP).

## Casos de uso

- Prototipado local en macOS: cargar el checkpoint con MLX para probar un pipeline de generación de texto sin depender de GPU NVIDIA; los 0,357 GiB del modelo de lenguaje caben holgadamente en la memoria unificada de cualquier Mac moderno.
- Asistente multimodal offline: usar la torre de visión para describir capturas de pantalla, diagramas o fotos en una aplicación de escritorio que no puede enviar datos a la nube; los 0,187 GiB de visión permiten mantener el modelo residente en memoria.
- Investigación en cuantización mixta: comparar la calidad de este checkpoint (5,484 bits/peso efectivos, 63% de pesos a 3 bits) contra el modelo base en BF16 para medir la degradación introducida por oQ en cada tipo de tarea.
- Evaluación de decodificación especulativa: emplear la cabeza MTP para experimentar con predicción multi-token en runtimes MLX y medir la ganancia de throughput frente a decodificación autoregresiva clásica.
- Extracción de campos en documentos escaneados: procesar facturas o formularios en local con el componente visual y el de lenguaje, en escenarios donde la confidencialidad impide usar APIs externas; requiere validar antes la calidad real, no publicada.
- Pruebas de humo en CI para pipelines MLX: al ocupar 0,599 GB, el checkpoint se puede descargar y ejecutar en un runner macOS sin aprovisionar hardware especial, sirviendo como test de integración barato.
- Demos educativas de multimodalidad: mostrar el funcionamiento de un VLM pequeño en un portátil, con un consumo de almacenamiento inferior a 1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta métricas de compresión (5,484 bits/peso efectivos, 0,558 GiB de almacenamiento) y el desglose por precisión. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de latencia o throughput, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM / memoria: los pesos ocupan 0,558 GiB (0,599 GB). Hay que sumar la caché KV, cuyo tamaño no se puede estimar porque la longitud de contexto no está publicada.
- Plataforma: MLX requiere Apple Silicon (series M1, M2, M3, M4). No es un formato ejecutable de forma nativa en CUDA ni en ROCm.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo es un Mac con memoria unificada. Un equipo con 8 GB de memoria unificada debería poder cargar los pesos, aunque el margen real depende del contexto configurado (no disponible).
- ¿Cabe en GPU de consumo? No en el sentido de tarjetas NVIDIA/AMD discretas sin conversión previa del formato. En Apple Silicon, sí: es uno de los puntos fuertes del checkpoint.
- Despliegue: mlx-lm para el componente de texto, mlx-vlm si el runtime soporta la torre de visión del modelo base, y la propia herramienta oMLX. vLLM y TGI no cargan safetensors en formato MLX; llama.cpp y Ollama requerirían una conversión a GGUF que no se distribuye en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ3.5-mtp (este checkpoint) | 0,873B | no disponible | Mixta 3-8 bits + BF16 (5,484 bits/peso) | no disponible | safetensors MLX |
| Qwen3.5-0.8B (base, sin cuantizar) | 0,873B según este checkpoint | no disponible | BF16 (~1,75 GB estimados a 16 bits) | no disponible | safetensors |
| SmolVLM-500M-Instruct | 0,5B | no disponible | BF16 | Apache-2.0 | safetensors |
| Qwen2.5-VL-3B-Instruct | 3,75B | no disponible | BF16 | Apache-2.0 | safetensors |

Notas: los datos de los modelos comparables se limitan a los verificables; cualquier métrica de rendimiento, contexto o idioma no confirmada se marca como no disponible en lugar de estimarse. La comparación relevante es de categoría (VLM de menos de 1B parámetros ejecutable en local) y de formato (MLX frente a safetensors estándar y GGUF).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueante para cualquier despliegue en producción hasta verificar la licencia del modelo base Qwen3.5-0.8B.
- Cuantización agresiva: el 63,2% de los pesos está a 3,5 bits efectivos. Es esperable una degradación de calidad frente a BF16, especialmente en tareas de razonamiento y matemáticas, pero no hay evaluación publicada que la cuantifique.
- Ausencia total de benchmarks: no hay ninguna medida de calidad, lo que impide afirmar que el modelo sea apto para una tarea concreta sin evaluarlo uno mismo.
- Validación comunitaria mínima: 11 descargas y 0 likes. El checkpoint no ha sido contrastado por la comunidad y podría contener errores de conversión.
- Contexto desconocido: sin longitud de contexto publicada no se pueden diseñar casos de uso con documentos largos ni estimar el coste de la caché KV.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas distintas del inglés.
- Formato propietario del ecosistema: MLX limita el despliegue a Apple Silicon; no hay GGUF ni compatibilidad directa con vLLM, TGI o servidores CUDA.
- Cabeza MTP dependiente del runtime: si la herramienta de inferencia no la soporta, se ignora y se pierde cualquier ventaja de decodificación especulativa.
- Sesgos y alucinaciones: no evaluados. Al ser un modelo de 0,8B, la tasa de alucinación en tareas factuales es previsiblemente alta, aunque no hay medición disponible.
- No apto para reentrenamiento convencional: los pesos cuantizados en MLX no encajan en los pipelines habituales de fine-tuning completo.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ3.5-mtp
- Repositorio de oQ / oMLX (herramienta de cuantización empleada): https://github.com/jundot/omlx
- Rep
