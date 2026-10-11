# mikun0202/chibi-image-nexus-v0.2

## Resumen

Chibi Image Nexus v0.2 es un checkpoint experimental de generación de imágenes texto-a-imagen desarrollado por el usuario mikun0202. Se trata de una versión comprimida del modelo Logolabs/agate-preview-003, en la que se sustituyen 12 capas lineales del generador de Agate por una descomposición SVD de bajo rango combinada con una pequeña red residual SwiGLU. El objetivo es recuperar parte de la representación que se pierde en una compresión agresiva de bajo rango, manteniendo un generador más pequeño.

La compresión reduce los parámetros del generador de 194.270.952 a 189.030.740, lo que supone una disminución del 2,70%. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. La licencia es MIT, pero el modelo base subyacente (Agate preview-003) puede tener sus propias condiciones de uso.

No se trata de un modelo listo para producción: es una investigación sobre técnicas de compresión. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni cuantizaciones disponibles, y las métricas publicadas miden la reconstrucción respecto al modelo original, no la calidad perceptual absoluta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador de Agate con capas lineales comprimidas mediante SVD de bajo rango + residual SwiGLU |
| Parámetros totales | 189.030.740 (generador comprimido) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (generator.safetensors) |
| Modelo base | Logolabs/agate-preview-003 |
| Parámetros del generador original | 194.270.952 |
| Reducción de parámetros | 2,70% |
| Capas lineales comprimidas | 12 |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La arquitectura parte del generador de Agate (Logolabs/agate-preview-003). Chibi Image Nexus v0.2 no modifica el codificador de texto ni el VAE; únicamente interviene sobre 12 capas lineales del generador. En lugar de una capa lineal estándar `x -> W -> y`, se emplea una aproximación de bajo rango `x -> B -> z -> A -> y` con un bloque no lineal SwiGLU insertado en el cuello de botella. Matemáticamente: `z = Bx`, `delta = Wo(SiLU(Wu z) * Wv z)`, `h = z + alpha * delta`, `y = A h + b`. La proyección de salida `Wo` se inicializa a cero, de modo que el entrenamiento arranca desde la aproximación SVD ordinaria.

El entrenamiento sigue un esquema profesor-alumno. La capa lineal original de Agate actúa como profesor y se recogen activaciones reales del generador original. El alumno comprimido minimiza el error de reconstrucción entre la salida del profesor y la suya. El procedimiento es: 1) inicializar A y B mediante SVD; 2) congelar A y B; 3) entrenar el pequeño residual SwiGLU; 4) opcionalmente, ajustar A y B con una tasa de aprendizaje menor. No se realiza un ajuste fino global de extremo a extremo. La innovación principal es el uso del residual SwiGLU para compensar la pérdida de información por la descomposición de bajo rango.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image).
- Soporte de semilla (`seed`) para reproducibilidad de resultados.
- Control del número de pasos de inferencia (`steps`).
- Opción de marca de agua (`watermark=False`).
- Retención del contenido semántico y de la calidad de generación sustancialmente mejor que en el experimento v0.1 con SVD de rango fijo.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta razonamiento multi-paso ni modos de pensamiento.
- Capacidades multilingües: no disponibles.
- Capacidades de visión, audio o vídeo: no disponibles (solo generación de imágenes).

## Casos de uso

- Investigación en compresión de modelos: evaluar si una corrección no lineal SwiGLU dentro de una descomposición SVD de bajo rango recupera representaciones perdidas en generadores de imágenes. Es adecuado porque el propio modelo se presenta como un experimento controlado con métricas de reconstrucción.
- Prototipado rápido de logotipos minimalistas: los ejemplos de la model card (zorro, robot rojo, taza de cerámica azul) sugieren que el modelo base Agate está orientado a logos e iconos. Se puede usar para generar variaciones rápidas con prompts sencillos y semilla fija.
- Generación de imágenes para pruebas de concepto en diseño: permite obtener bocetos visuales de bajo coste computacional (189 M de parámetros en el generador) para validar ideas antes de usar modelos mayores.
- Despliegue en entornos con recursos limitados: aunque la reducción de parámetros es solo del 2,70%, el generador comprimido ocupa menos de 1 GB en fp32 y el repositorio completo 0,4 GB, por lo que puede ejecutarse en GPUs de gama media.
- Comparación de arquitecturas de compresión: sirve para contrastar la calidad de v0.1 (SVD simple) frente a v0.2 (SVD + SwiGLU) en términos de MAE, PSNR y recuperación de MSE por capa.
- Educación y experimentación: útil para entender el efecto de la descomposición low-rank y las correcciones no lineales en modelos generativos, así como para reproducir el pipeline de entrenamiento profesor-alumno.
- Generación de imágenes con semilla controlada para pruebas A/B: al fijar semilla y pasos, se pueden comparar versiones del modelo o variaciones de prompt manteniendo coherencia entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP, etc.) en la información disponible. El autor proporciona métricas de reconstrucción respecto al modelo original con la misma semilla:

| Métrica | Valor |
|---|---|
| Error absoluto medio (MAE) de píxel | 0,1204 |
| PSNR medio | 13,58 dB |
| Recuperación media de MSE tras entrenar SwiGLU | 15,61% |
| Mejor recuperación de MSE por capa | 31,58% |
| Reducción de parámetros | 2,70% |
| Capas lineales comprimidas | 12 |

Estas métricas miden similitud con la salida del modelo original y no deben interpretarse como puntuaciones de calidad perceptual general.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay requisitos oficiales. Solo para pesos, en fp32 serían aproximadamente 0,76 GB (189 M de parámetros), en fp16 unos 0,38 GB y en int8 unos 0,19 GB. A ello hay que sumar activaciones y sobrecarga del framework, que en generación de imágenes por difusión pueden ser varios GB.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? Es probable que quepa en GPUs con 8 GB o más de VRAM, dado el tamaño del generador, pero no se ha confirmado oficialmente.
- Opciones de despliegue: carga mediante el script `nexus_loader.py` proporcionado por el autor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a generación de imágenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Reducción | Método | Calidad |
|---|---|---|---|---|
| Logolabs/agate-preview-003 (original) | 194.270.952 | 0% | Sin compresión | Referencia |
| Chibi Image Nexus v0.1 | No disponible | No disponible | SVD de rango fijo | Degradación significativa según el autor |
| Chibi Image Nexus v0.2 | 189.030.740 | 2,70% | SVD + residual SwiGLU | MAE 0,1204; PSNR 13,58 dB; recuperación media de MSE 15,61% |

No se conocen otros modelos comparables de compresión de generadores texto-a-imagen en la información disponible.

## Limitaciones y advertencias

- Checkpoint experimental de investigación: no está pensado para producción.
- La compresión es muy moderada (2,70%), por lo que el ahorro de memoria y almacenamiento es limitado.
- La calidad no reproduce exactamente la salida del modelo original; el PSNR medio de 13,58 dB indica diferencias de píxel notables.
- Solo se comprime el generador; el codificador de texto y el VAE permanecen intactos.
- Requiere el cargador personalizado `nexus_loader.py`, no es compatible con pipelines estándar de difusión sin adaptación.
- No se han publicado benchmarks estándar de calidad de imagen (FID, CLIP, etc.).
- La comunidad es muy reducida (0 descargas, 0 likes en el momento de la consulta), lo que limita el soporte y la validación externa.
- Sesgos conocidos: no disponibles; al derivar del modelo base, podría heredar los sesgos de Logolabs/agate-preview-003.
- Riesgo de alucinación visual: pueden aparecer artefactos o contenido no solicitado, como en cualquier modelo generativo.
- Idiomas soportados: no disponibles; se desconoce si el codificador de texto maneja varios idiomas.
- Licencia MIT para este modelo, pero se debe verificar la licencia del modelo base (Logolabs/agate-preview-003) antes de un uso comercial.
- No se documentan limitaciones de longitud de contexto (aplicable al codificador de texto, no al generador).

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/mikun0202/chibi-image-nexus-v0.2
- Modelo base: https://huggingface.co/Logolabs/agate-preview-003
