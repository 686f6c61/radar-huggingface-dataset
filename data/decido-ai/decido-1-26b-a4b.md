# decido-ai/decido-1-26b-a4b

## Resumen

Decido-1 (26B-A4B) es un modelo de decisión calibrada desarrollado por decido-ai, construido como un fine-tune LoRA fusionado sobre google/gemma-4-26B-A4B-it. Su propósito no es la generación de texto libre, sino responder preguntas cerradas sobre un documento de entrada —sí/no, elección única entre opciones o escala ordenada— devolviendo una distribución de probabilidad para cada respuesta. Esta formulación convierte al modelo en un clasificador probabilístico de propósito general con calibración explícita.

El modelo emplea una arquitectura Mixture-of-Experts con 25.805.933.872 parámetros totales y aproximadamente 4B activos por token, lo que permite ejecutarlo en CPU de portátil con unos 30 GB de RAM en su cuantización Q8_0 GGUF. Es relevante porque ofrece una alternativa local y determinista a APIs propietarias de "decisiones" como Jev 1.13 de TypeSafe, superándola en la media de seis grupos de benchmark (85,38 frente a 83,85) y reduciendo drásticamente la sensibilidad al orden de las opciones (4,8% frente a 14,6%).

La familia Decido 1 incluye variantes de menor tamaño (Fast, Ultra) y de mayor precisión (Max, Think, XL), todas con el mismo formato de preguntas y compatibilidad con la API de Jev. La licencia Apache-2.0 y el soporte de GGUF/llama.cpp facilitan su despliegue en producción sin dependencias de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, base google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.933.872 |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (publicado y evaluado); bf16 en GPU; otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

Decido-1 parte de Gemma-4-26B-A4B-it, un modelo MoE con 26B parámetros totales y ~4B activos por token, al que se le ha fusionado un fine-tune LoRA. El resultado conserva la arquitectura del modelo base pero se especializa en una tarea de clasificación probabilística: dada una entrada compuesta por un documento (texto o JSON) y una o varias preguntas con opciones discretas, el modelo produce una distribución de probabilidad sobre las respuestas posibles. El documento se trata como datos no confiables: las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan.

El entrenamiento se orientó a calibración y robustez frente al orden de las opciones. Según la model card, el modelo cambia su respuesta al reordenar las opciones solo un 4,8% de las veces, frente al 14,6% de Jev 1.13, y es determinista bit a bit en CPU. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El formato de preguntas soportado incluye `noul` (sí/no), `choice` con 1–255 opciones y `score` con 2–10 niveles, compatible con el wire format de Jev 1.13.

## Capacidades

- Decisión calibrada sobre documentos: devuelve probabilidades para preguntas de sí/no, elección única y escalas ordenadas.
- Clasificación multi-pregunta: procesa varias preguntas sobre un mismo documento en una sola llamada.
- Entrada multimodal texto/JSON: el documento de entrada puede ser texto plano o JSON estructurado.
- Robustez frente a inyección de prompts: el documento se trata como datos no confiables y las instrucciones embebidas se ignoran.
- Determinismo: la inferencia en CPU con Q8_0 es bit a bit reproducible.
- Compatibilidad con la API de Jev 1.13 mediante `decido serve` (endpoint `POST /v1/systemone`).
- Ejecución local en CPU de portátil (~30 GB RAM) y en GPU (Metal en Apple Silicon, CUDA con bf16).
- Capacidades multilingües: limitadas al inglés según la model card.
- No está orientado a generación de texto libre, razonamiento abierto, código ni tool calling; su salida es una distribución de probabilidad.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, responder preguntas como "¿solicita un reembolso?" (sí/no), "¿qué equipo debe gestionarlo?" (billing/shipping/tech) y "¿qué urgencia tiene?" (escala), todo en una sola llamada y con probabilidades calibradas para umbralizar decisiones.
- Enrutamiento automático de correo entrante: clasificar cada mensaje en departamentos con una escala de confianza, usando la distribución de probabilidad para derivar a revisión humana cuando la confianza es baja.
- Moderación de contenido con criterios múltiples: aplicar varias preguntas binarias y de escala sobre un texto para decidir si se publica, se revisa o se bloquea, con umbrales ajustables según la probabilidad devuelta.
- Extracción de decisiones sobre contratos o formularios JSON: evaluar condiciones ("¿el contrato incluye cláusula de renovación automática?") sobre documentos estructurados, aprovechando el tratamiento del documento como dato no confiable.
- Clasificación de encuestas y respuestas abiertas: mapear respuestas de texto libre a escalas ordenadas (satisfacción, intención de compra) con probabilidades por nivel, útil para análisis estadístico agregado.
- Validación de pipelines de datos: verificar de forma determinista que registros JSON cumplen criterios predefinidos antes de ingerirlos en un sistema downstream, con resultados reproducibles bit a bit en CPU.
- Despliegue en entornos sin GPU: ejecutar el modelo en portátiles o servidores sin acelerador gracias a la cuantización Q8_0 GGUF (~30 GB RAM), con latencias de 4,1 s en CPU y 1,1 s en GPU Metal de un M4 Pro para un documento de 1k tokens y 5 preguntas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre seis grupos de benchmark (JevBench, Kev, OpenJev, Nimble, VitaminC, MASSIVE-en), comparados con Jev 1.13:

| Grupo de benchmark | Decido-1 CPU (Q8_0 GGUF) | Decido-1 GPU (bf16) | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 87,61 | 88,17 | 87,18 |
| Kev | 84,35 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 78,37 | 78,39 | 72,96 |
| Nimble | 87,23 | 88,65 | 91,84 |
| VitaminC | 86,14 | 87,15 | 78,46 |
| MASSIVE | 88,57 | 88,57 | 87,14 |
| Media de los seis grupos | 85,38 | 85,90 | 83,85 |

Latencia en M4 Pro (documento de 1k tokens, 5 preguntas): 4,1 s en CPU y 1,1 s en GPU Metal. La GPU Metal coincide con el archivo CPU en el 98,5–99,5% de las preguntas del benchmark y es determinista entre llamadas.

## Requisitos de hardware

- VRAM/RAM estimada: ~30 GB de RAM para la cuantización Q8_0 GGUF en CPU; pesos bf16 en GPU requieren aproximadamente 52 GB (estimación a partir de los 25,8B parámetros).
- GPU recomendadas: no especificadas en la información disponible; el modelo se ha validado en Apple Silicon (Metal) y en CUDA con bf16. Para bf16 en CUDA se necesitan GPUs de 80 GB (A100/H100) o configuraciones equivalentes.
- GPU de consumo: la ruta consumer validada es Apple Silicon (M4 Pro, 1,1 s por consulta). No hay datos publicados para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: paquete `decido-ai` (pip), `decido run` (CLI), `decido serve` (API HTTP compatible con Jev), llama.cpp para GGUF, transformers para bf16 en GPU, y `example_transformers.py` incluido en el repo.
- Latencia y throughput: 4,1 s (CPU) y 1,1 s (GPU Metal) por documento de 1k tokens con 5 preguntas en un M4 Pro. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Puntuación seis grupos | Licencia | Despliegue |
|---|---|---|---:|---:|---|---|
| Decido-1 (este) | Gemma-4-26B-A4B | 25,8B totales / ~4B activos | no disponible | 85,38 (CPU) | Apache-2.0 | CPU (~30 GB RAM), GPU |
| Decido-1-Max | Gemma-4-26B-A4B | 25,8B totales / ~4B activos | no disponible | 89,23 (GPU) | Apache-2.0 | GPU (ruta GPU en desarrollo) |
| Decido-1-Think | Gemma-4-26B-A4B | 25,8B totales / ~4B activos | no disponible | 88,71 (GPU) | Apache-2.0 | CPU (lento), GPU |
| Decido-1-Fast | Qwen3-1.7B | 1,7B | no disponible | 73,01 (CPU) | Apache-2.0 | CPU (~8 GB RAM) |
| Jev 1.13 (TypeSafe) | no disponible | no disponible | no disponible | 83,85 (publicado) | propietaria | API |

## Limitaciones y advertencias

- Solo soporta inglés; no se han publicado capacidades multilingües.
- No es un modelo generativo: no produce texto libre, código ni razonamiento abierto. Usarlo fuera de la tarea de decisión cerrada no es adecuado.
- Riesgo de calibración deficiente fuera de la distribución de los benchmarks: las probabilidades pueden no reflejar la incertidumbre real en dominios no representados.
- Aunque el modelo trata el documento como dato no confiable, la robustez frente a inyección de prompts no es absoluta y debe complementarse con validación externa.
- El determinismo bit a bit solo está garantizado en CPU con Q8_0; la ruta Metal coincide con CPU en el 98,5–99,5% de las preguntas, no en el 100%.
- El rendimiento en GPU bf16 requiere hardware de gama alta (~52 GB de pesos); la ruta consumer validada se limita a Apple Silicon.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma-4 puede tener condiciones adicionales que deben verificarse.
- No hay datos publicados sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad.
- `inference: false` en la model card indica que el pipeline de transformers estándar no está configurado para uso directo; se requiere el paquete `decido-ai` o el ejemplo incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Documentación y playground: https://getdecido.ai
- Paquete PyPI: https://pypi.org/project/decido-ai/
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
