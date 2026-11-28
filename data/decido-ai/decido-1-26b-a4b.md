# decido-ai/decido-1-26b-a4b

## Resumen

Decido-1 (26B-A4B) es un modelo de decisión calibrada desarrollado por decido-ai, construido como un fine-tune LoRA fusionado sobre google/gemma-4-26B-A4B-it. Su propósito no es la generación libre de texto, sino la clasificación probabilística: recibe un documento y un conjunto de preguntas (sí/no, elección única u ordenadas en escala) y devuelve una distribución de probabilidad sobre cada respuesta posible. Está pensado para ejecutarse en local, incluso en CPU de portátil, con resultados deterministas bit a bit.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) heredada de Gemma 4, con 25.805.933.872 parámetros totales y aproximadamente 4B activos por token. Se distribuye en safetensors (bf16 para GPU) y GGUF (Q8_0 para CPU), con licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa open source reproducible a modelos propietarios de decisión como Jev 1.13 de TypeSafe, superando su puntuación publicada (85,38 frente a 83,85) en el conjunto de seis grupos de benchmarks usados por la comunidad de reproducción abierta.

El modelo forma parte de una familia más amplia (Decido-1-Fast, Ultra, Max, Think y XL) que cubre distintos tamaños y presupuestos de cómputo. Decido-1 se posiciona como la variante equilibrada: calidad cercana a las versiones Max y Think, pero con capacidad de ejecutarse en un portátil con unos 30 GB de RAM y latencias de 4,1 s en CPU y 1,1 s en GPU Metal de un M4 Pro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma 4, fine-tune LoRA fusionado |
| Parámetros totales | 25.805.933.872 (≈25,8B) |
| Parámetros activos | ≈4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (GPU), GGUF Q8_0 (CPU) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Decido-1 parte de google/gemma-4-26B-A4B-it, un transformer con arquitectura Mixture-of-Experts en el que solo se activan aproximadamente 4B de los 25,8B parámetros totales por token procesado. Sobre esa base, decido-ai aplicó un fine-tune LoRA que posteriormente se fusionó en los pesos finales, especializando el modelo para tareas de decisión calibrada en lugar de generación conversacional abierta. El modelo base es multimodal (image-text-to-text) según los tags del repositorio, aunque la model card se centra en el uso sobre documentos de texto y JSON.

El entrenamiento está orientado a producir probabilidades calibradas y deterministas. La model card destaca que el modelo trata el documento de entrada como datos no confiables: las instrucciones contenidas en el documento no se siguen y las cadenas de tokens de control se neutralizan, lo que reduce el riesgo de inyección de prompts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La calibración se evalúa mediante la estabilidad frente a la reordenación de opciones: Decido-1 cambia su respuesta el 4,8% de las veces al reordenar opciones, frente al 14,6% de Jev 1.13.

## Capacidades

- Clasificación probabilística de documentos: devuelve una probabilidad para cada respuesta posible en lugar de una etiqueta discreta.
- Preguntas de tipo sí/no (formato `noul` en el protocolo Jev 1.13).
- Elección única entre 1 y 255 opciones (`choice`), con probabilidades y nivel de confianza.
- Escalas ordenadas de 2 a 10 niveles (`score`), con leyenda asociada.
- Entrada de documentos en texto plano o JSON, tratados como datos no confiables.
- Determinismo bit a bit en la versión CPU (Q8_0 GGUF): misma entrada, misma salida.
- Compatibilidad con el wire format de Jev 1.13 a través de `m.predict()` y de la API HTTP `POST /v1/systemone`.
- Ejecución en CPU de portátil, GPU Metal en Apple Silicon y GPU CUDA con pesos bf16.
- Soporte de tooling vía paquete `decido-ai` (Python), CLI (`decido run`, `decido serve`) y API HTTP compatible con clientes Jev existentes.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la model card no documenta flujos de visión específicos.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, el modelo devuelve la probabilidad de que sea una solicitud de reembolso, el equipo al que debe asignarse y su nivel de urgencia en una sola pasada, como muestra el ejemplo de la model card con la reclamación de un cobro duplicado.
- Enrutamiento de correo entrante: clasificación de mensajes en categorías predefinidas (facturación, envíos, técnico) con probabilidades que permiten aplicar umbrales de confianza y derivar los casos ambiguos a revisión humana.
- Moderación y cumplimiento documental: evaluación de si un contrato o política cumple una serie de criterios binarios, aprovechando el tratamiento del documento como dato no confiable para evitar que el contenido manipule la decisión.
- Extracción de señales estructuradas de documentos JSON: el modelo acepta documentos en JSON y devuelve respuestas tipadas según el formato Jev, lo que facilita integrarlo en pipelines de datos existentes.
- Sustitución local de APIs propietarias de decisión: al exponer `decido serve` un endpoint compatible con Jev (`TYPESAFE_BASE_URL=http://127.0.0.1:8080`), los clientes existentes de TypeSafe pueden apuntar al modelo sin cambios de código, con la ventaja de ejecución local y licencia Apache 2.0.
- Automatización en portátil sin GPU: con unos 30 GB de RAM y el GGUF Q8_0, el modelo corre en CPU con 4,1 s de latencia para un documento de 1k tokens y 5 preguntas, adecuado para herramientas de escritorio o entornos sin acceso a GPU.
- Evaluación de riesgo en flujos de agentes: uso de las probabilidades calibradas como señal para que un sistema mayor decida si continuar, escalar o detenerse, gracias al determinismo bit a bit de la versión CPU.

## Benchmarks y rendimiento

Los resultados se miden sobre seis grupos de benchmarks usados por la comunidad de reproducción abierta de Jev (JevBench, Kev, OpenJev text tasks, Nimble, VitaminC, MASSIVE-en), con copias congeladas y el mismo harness para todos los modelos. La puntuación es la media de las métricas de tipo accuracy por grupo.

| Grupo de benchmark | Decido-1 CPU (Q8_0 GGUF) | Decido-1 GPU (bf16) | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 87,61 | 88,17 | 87,18 |
| Kev | 84,35 | 84,46 | 85,52 |
| OpenJev text tasks | no disponible | no disponible | no disponible |
| Nimble | no disponible | no disponible | no disponible |
| VitaminC | no disponible | no disponible | no disponible |
| MASSIVE-en | no disponible | no disponible | no disponible |
| Media de los seis grupos | 85,38 | no disponible | 83,85 |

Datos adicionales de rendimiento:

| Métrica | Valor |
|---|---|
| Latencia CPU (M4 Pro, documento 1k tokens, 5 preguntas) | 4,1 s |
| Latencia GPU Metal (M4 Pro, mismas condiciones) | 1,1 s |
| Tasa de cambio al reordenar opciones | 4,8% (Jev 1.13: 14,6%) |
| Concordancia Metal vs CPU | 98,5–99,5% de las preguntas |

## Requisitos de hardware

- VRAM/RAM estimada: unos 30 GB de RAM para la versión CPU con GGUF Q8_0; los pesos bf16 del repositorio ocupan 80,5 GB en total (incluye múltiples formatos), por lo que la inferencia en GPU requiere memoria suficiente para los pesos bf16.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona ejecución CUDA con `device="cuda"` y pesos bf16, y ejecución en GPU Metal de Apple Silicon.
- Cabe en consumer GPU: no confirmado en la información disponible; el tamaño de pesos bf16 (≈51,6 GB para 25,8B parámetros) supera la VRAM de la mayoría de GPUs de consumo, aunque la arquitectura MoE con 4B activos podría permitir estrategias de offloading no documentadas.
- Despliegue: paquete `decido-ai` (Python, con extra `[gpu]` para CUDA), CLI `decido run` y `decido serve` (API HTTP compatible con Jev), llama.cpp (GGUF), transformers (pesos bf16). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 4,1 s por consulta en CPU (M4 Pro) y 1,1 s en GPU Metal para un documento de 1k tokens con 5 preguntas; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Puntuación seis grupos | Licencia | Ejecución |
|---|---|---|---:|---:|---|---|
| Decido-1 (este) | Gemma-4-26B-A4B | 25,8B totales / ≈4B activos | no disponible | 85,38 (CPU) | Apache 2.0 | CPU portátil (~30 GB RAM), GPU |
| Decido-1-Max | Gemma-4-26B-A4B | 25,8B totales / ≈4B activos | no disponible | 89,23 (GPU) | no disponible en la información | Portátil (lento), GPU |
| Decido-1-Think | Gemma-4-26B-A4B | 25,8B totales / ≈4B activos | no disponible | 88,71 (GPU) | no disponible en la información | Portátil (lento), GPU |
| Decido-1-Fast | Qwen3-1.7B | 1,7B | no disponible | 73,01 (CPU) | no disponible en la información | CPU portátil (~8 GB RAM) |
| Jev 1.13 (TypeSafe) | propietario | no disponible | no disponible | 83,85 (publicado) | propietaria | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- Diseñado exclusivamente para decisión calibrada: no es un modelo de generación libre ni de conversación abierta, pese al tag `conversational`.
- La model card no documenta sesgos conocidos, pero al derivar de Gemma 4 hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinación no evaluado en la información disponible; las salidas son distribuciones de probabilidad, no texto generado, lo que reduce pero no elimina el riesgo de clasificaciones erróneas.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento con documentos largos.
- El determinismo bit a bit solo está garantizado en la ruta CPU con GGUF Q8_0; la ruta GPU Metal concuerda con CPU en el 98,5–99,5% de las preguntas, no al 100%.
- La etiqueta `inference: false` en los metadatos del repositorio indica que la inferencia estándar de transformers no está soportada directamente; se requiere el paquete `decido-ai` o el script `example_transformers.py`.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 de Google, cuyos términos pueden imponer restricciones adicionales.
- El modelo trata los documentos como datos no confiables, pero no se documenta el alcance completo de las defensas frente a inyección de prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Documentación y playground: https://getdecido.ai
- Paquete PyPI: https://pypi.org/project/decido-ai/
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-Web v2: https://huggingface.co/decido-ai/decido-web-v2
- Decido-Web v2-Fast: https://huggingface.co/decido-ai/decido-web-v2-fast
