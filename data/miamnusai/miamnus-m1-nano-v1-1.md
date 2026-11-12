# MiamnusAI/Miamnus-M1-Nano-v1.1

## Resumen

Miamnus-M1-Nano-v1.1 es un modelo de lenguaje causal compacto desarrollado por Miamnus AI. Se trata de un modelo de 22,4 millones de parámetros (22.396.872 pesos según los safetensors del repositorio) que emplea una arquitectura híbrida recurrente en proporción 3:1, combinando capas de atención lineal KDA con capas de atención MLA a lo largo de 24 bloques transformer (18 KDA y 6 MLA). Su dimensión oculta es de 256, con 4 cabezas de consulta y 2 de clave/valor de 64 dimensiones cada una, y una FFN SwiGLU de 704 dimensiones intermedias.

La propuesta diferencial del modelo es su empaquetado: está escrito íntegramente en PyTorch puro y no depende de compilación de kernels externos de Triton o CUDA, por lo que funciona directamente en Apple Silicon (MPS), CPU y NVIDIA CUDA. Está pensado para experimentación y despliegue en entornos con recursos muy limitados, no para cargas de producción de alta exigencia.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y fue preentrenado sobre el corpus MiamnusAI/CuratedCorpus-5B. Su contexto máximo es de 1.024 tokens y su vocabulario de 4.096 tokens con BPE a nivel de byte. Es relevante ahora como ejemplo de arquitectura híbrida de atención lineal en un tamaño extremadamente reducido y con dependencias mínimas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida 3:1 (KDA linear attention + MLA attention), 24 capas (18 KDA + 6 MLA) |
| Parámetros totales | 22.396.872 (22,4 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (código custom, `trust_remote_code=True`) |

Otros datos técnicos: dimensión oculta 256, 4 cabezas de consulta y 2 de clave/valor, dimensión de cabeza 64, FFN intermedia 704 (SwiGLU), vocabulario de 4.096 tokens (BPE a nivel de byte), tamaño del repositorio 0,1 GB.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal híbrida con un patrón recurrente 3:1: por cada tres capas de atención lineal KDA se intercala una capa de atención MLA, sumando 24 bloques en total (18 KDA y 6 MLA). La atención lineal KDA reduce el coste computacional y de memoria frente a la atención cuadrática clásica, mientras que las capas MLA aportan capacidad de atención completa en puntos estratégicos de la red. La FFN usa SwiGLU con dimensión intermedia 704 y la dimensión oculta es 256, con 4 cabezas de consulta y 2 de clave/valor de 64 dimensiones.

El preentrenamiento se realizó sobre el dataset MiamnusAI/CuratedCorpus-5B, según indica la model card. No se documentan en la información disponible el número exacto de tokens efectivos de entrenamiento, la composición detallada del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La innovación técnica destacable es el empaquetado en PyTorch puro sin dependencias de compilación de kernels Triton o CUDA, lo que permite ejecución directa en MPS, CPU y CUDA. No se documentan técnicas como decodificación especulativa.

## Capacidades

- Generación de texto causal en inglés, con prompts de continuación narrativa y texto general.
- Razonamiento y código: no se documentan capacidades específicas ni evaluaciones; el tamaño de 22,4 M y el contexto de 1.024 tokens limitan fuertemente estas tareas.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no se documentan modo de pensamiento (thinking), visión ni audio.
- Ejecución local multiplataforma: MPS (Apple Silicon), CPU y CUDA sin kernels externos.

## Casos de uso

- Experimentación con arquitecturas híbridas de atención lineal: el modelo sirve como banco de pruebas reproducible para comparar capas KDA y MLA en un entorno de 22,4 M de parámetros, sin necesidad de compilar kernels CUDA ni Triton.
- Prototipado rápido en portátiles con Apple Silicon: gracias al soporte MPS y a los 0,1 GB del repositorio, se puede cargar y ejecutar en un Mac sin GPU dedicada para validar pipelines de generación.
- Educación y docencia: su tamaño reducido y su código en PyTorch puro permiten inspeccionar y modificar la implementación de atención híbrida en cursos de arquitecturas de lenguaje.
- Generación de texto corto y continuaciones creativas en inglés: con 1.024 tokens de contexto y temperatura configurable, es adecuado para completar fragmentos narrativos breves en demos.
- Pruebas de integración con Hugging Face Transformers: sirve para validar flujos con `trust_remote_code=True`, tokenizador BPE a nivel de byte y generación con `max_new_tokens`.
- Benchmarking de eficiencia en CPU: al no requerir CUDA, permite medir latencia y throughput de atención lineal en hardware de consumo y comparar con transformers densos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros ocupan aproximadamente 90 MB en fp32 y unos 45 MB en fp16); el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (incluidas GTX/RTX de gama baja) y Apple Silicon vía MPS; también funciona en CPU.
- Cabe en cualquier GPU de consumo: sí, en todas las RTX y en iGPUs con suficiente memoria compartida; el cuello de botella no es la memoria sino el reducido contexto de 1.024 tokens.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y el script `generate.py` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Miamnus-M1-Nano-v1.1 | 22,4 M | 1.024 | Híbrida 3:1 (KDA + MLA) | Apache 2.0 | Hugging Face |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (híbridos de atención lineal de tamaño nano) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el corpus de preentrenamiento (CuratedCorpus-5B) no detalla su composición, por lo que no se puede evaluar el sesgo de forma fiable.
- Riesgo de alucinación: alto en tareas de conocimiento factual, dado el tamaño de 22,4 M de parámetros y el vocabulario de solo 4.096 tokens.
- Limitación de contexto: 1.024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o bases de código.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar la implementación antes de usarla en producción.
- Caveat para producción: con 0 descargas y 0 likes en el momento de la consulta y sin benchmarks publicados, no hay evidencia empírica de calidad; no se recomienda para cargas de producción sin evaluación previa.
- Soporte de herramientas: no se documenta tool calling, agentes ni cuantizaciones GGUF, lo que limita su integración en pipelines de inferencia optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/MiamnusAI/Miamnus-M1-Nano-v1.1
- Dataset de preentrenamiento: https://huggingface.co/datasets/MiamnusAI/CuratedCorpus-5B
