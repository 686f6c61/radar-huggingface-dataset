# DuoNeural/Lattice-5-Prometheus-v2

## Resumen

Lattice-5-Prometheus-v2 es un modelo de generación de texto experimental desarrollado por DuoNeural Research Lab, que presenta una arquitectura propia denominada Crystallographic Dynamics Model (CDM), derivada de su framework Competitive Docking Memory. Su rasgo más distintivo es el uso de geometría hiperbólica no euclidiana (bola de Poincaré) para el enrutamiento de tokens en un sistema Mixture-of-Experts, en lugar de la geometría euclidiana habitual.

El modelo se ha obtenido por destilación de conocimiento desde Qwen/Qwen3.8-27B (con 14,7B de parámetros activos en cuantización NF4 de 4 bits, según el autor), entrenándolo durante 100.000 pasos sobre una mezcla 50/50 de los datasets FineWeb-Edu y SmolTalk. Con unos 598,4M de parámetros totales en disco (unos 407,7M con embeddings atados en memoria), se trata de un modelo pequeño pensado para investigación y despliegue en hardware modesto.

Su relevancia actual es principalmente como prueba de concepto de arquitecturas no euclidianas y de lo que sus autores denominan "glass-box AI" (transparencia arquitectónica). Los benchmarks publicados por el autor muestran resultados modestos frente a modelos convencionales de tamaño comparable, por lo que su interés radica más en la innovación metodológica (enrutamiento hiperbólico, bloqueo cristalográfico de centroides bajo el "Dynamical Horizon Principle") que en el rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Crystallographic Dynamics Model (CDM), 7 capas, enrutamiento MoE en bola de Poincaré, atención con 12 cabezas |
| Parametros totales | 598.433.446 (~598,4M) en safetensors; 596.555.150 en censo sin atar |
| Parametros activos | ~215,1M de backbone activo (no MoE disperso en el sentido clásico); 407.723.686 con embeddings atados |
| Longitud de contexto | 512 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el profesor Qwen3.8-27B se usó en NF4 4-bit; el modelo estudiante se distribuye en safetensors y GGUF) |
| Idiomas soportados | no disponible (entrenado con datasets en inglés: FineWeb-Edu y SmolTalk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo consta de 7 capas con dimensión oculta `d=768` y 12 cabezas de atención. Cada capa incorpora un mecanismo de enrutamiento con `K=8` centroides situados en una bola de Poincaré de curvatura negativa aprendible (`c = 1,4427`), que dirigen los tokens hacia 4 expertos MoE tipo SwiGLU con `d_ff=3072`. Según el autor, durante el entrenamiento la temperatura de enrutamiento decae dinámicamente hasta que las 7 capas cruzan un umbral de saturación (`tau* = 1,0000e+10`), momento en el que los centroides quedan "bloqueados" en una configuración estable que denominan Solid-State Hepta-Cap, bajo el llamado Dynamical Horizon Principle (DHP).

El entrenamiento fue una destilación desde Qwen/Qwen3.8-27B (64 capas, 27B de parámetros, 14,7B activos en NF4), usando una técnica llamada Relational Gram Distillation que alinea matrices de Gram coseno normalizadas token a token entre capas emparejadas de profesor y estudiante, con el objetivo de preservar la geometría lingüística de alto orden. La mezcla de datos fue 50% HuggingFaceFW/fineweb-edu y 50% HuggingFaceTB/smoltalk, con secuencias de 512 tokens, acumulación de gradientes 4 (batch efectivo 8), optimizador AdamW (beta1=0,9, beta2=0,95), learning rate base 3e-4 con acoplamiento DHP, y 100.000 pasos ejecutados en una RTX 4080 Super con 32 GB de memoria ampliada. La mejor validación reportada es 0,9605 BPB (bits per byte) en el paso 55.500. No se menciona explícitamente RLHF ni DPO posterior.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredando el vocabulario completo de Qwen3.8-27B (248.320 tokens).
- Comprensión lectora y verificación factual booleana (su mejor resultado: 64,67% en BoolQ).
- Resolución de correferencias pronominales (WinoGrande).
- Razonamiento científico de opción múltiple en formato zero-shot (ARC-Easy y ARC-Challenge), con resultados bajos.
- Continuación narrativa y sentido común situacional (HellaSwag), con resultados bajos.
- Distribución en GGUF, lo que permite inferencia local en CPU mediante llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en arquitecturas no euclidianas: es un candidato ideal como banco de pruebas para estudiar enrutamiento hiperbólico en bola de Poincaré y su efecto en la estructura jerárquica de las representaciones, dado que el código está disponible en GitHub.
- Experimentación con MoE en hardware modesto: con ~598M de parámetros y 4 expertos, permite investigar dinámicas de enrutamiento MoE sin necesidad de GPUs de gama alta.
- Prototipado de chatbots ligeros en local: gracias al formato GGUF y su tamaño inferior a 1B, puede ejecutarse en portátiles o CPUs para asistentes conversacionales de baja exigencia.
- Estudio de destilación de conocimiento: la técnica de Relational Gram Distillation desde un profesor de 27B puede replicarse y compararse con destilaciones clásicas por logits.
- Verificación factual booleana sobre textos cortos: su mejor puntuación (BoolQ 64,67%) lo hace utilizable como clasificador ligero de preguntas sí/no sobre pasajes, aunque con supervisión.
- Generación de texto educativo en inglés: al haberse entrenado al 50% con FineWeb-Edu, puede emplearse en tareas de redacción y resumen de contenido de tono educativo, dentro de sus 512 tokens de contexto.
- Demostraciones de "glass-box AI": la transparencia arquitectónica completa (censo de parámetros por componente publicado) lo hace útil para docencia y material didáctico sobre el interior de un modelo.

## Benchmarks y rendimiento

Resultados zero-shot publicados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Capacidad evaluada | Accuracy bruta | Accuracy normalizada |
|:---|:---|---:|---:|
| BoolQ | Comprensión lectora y verificación booleana | 64,67% | 64,67% |
| WinoGrande | Correferencia y desambiguación pronominal | 52,00% | 54,67% |
| ARC-Easy | Razonamiento científico elemental (4 opciones) | 26,17% | 32,21% |
| HellaSwag | Sentido común situacional y continuación narrativa | 30,00% | 23,33% |
| ARC-Challenge | Razonamiento científico multi-hop | 18,12% | 22,82% |

Adicionalmente, el autor reporta una validación de 0,9605 BPB (bits per byte) en el paso 55.500. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~598M de parámetros en FP16, en torno a 1,2–1,5 GB; con embeddings atados, el footprint activo en GPU es de ~407,7M de parámetros (~0,8–1 GB en FP16). En GGUF de 4 bits, por debajo de 500 MB.
- GPU recomendadas: cualquier GPU moderna; no requiere aceleradores de centro de datos. Puede ejecutarse incluso en GPUs integradas.
- Consumer GPUs: cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4060 o superiores; incluso tarjetas de 4–6 GB de VRAM son suficientes).
- Opciones de despliegue: llama.cpp (formato GGUF oficialmente soportado según las tags), Ollama (vía GGUF), y Transformers de Hugging Face (librería declarada). No se menciona soporte específico para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles. Dado su tamaño (<1B de parámetros), cabe esperar inferencia rápida en CPU moderna y muy alta velocidad en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comentario |
|:---|---:|---:|:---|:---|
| Lattice-5-Prometheus-v2 | ~598,4M (disco) / ~407,7M (atado) | 512 | Apache 2.0 | Arquitectura experimental CDM hiperbólica; benchmarks zero-shot modestos |
| Qwen3-1.7B (base comparable por tamaño) | 1,7B | 32.768 (nativo) | Apache 2.0 | Modelo convencional denso; contexto 64 veces mayor y rendimiento muy superior en benchmarks estándar |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8.192 | Apache 2.0 | Tamaño similar; entrenado con receta convencional sobre FineWeb-Edu y SmolTalk, benchmarks públicos superiores en tareas equivalentes |
| Qwen/Qwen3.8-27B (profesor) | 27B (14,7B activos, MoE) | no disponible en la ficha | no disponible en la ficha | Profesor de destilación; rendimiento muy superior pero requisitos de hardware mucho mayores |

La comparación indica que Lattice-5-Prometheus-v2 queda por debajo de modelos convencionales de tamaño similar en las tareas evaluadas; su valor diferencial es la arquitectura experimental y la transparencia, no el rendimiento.

## Limitaciones y advertencias

- Rendimiento bajo en razonamiento: ARC-Challenge (18,12% bruto) y ARC-Easy (26,17% bruto) están cerca o por debajo de niveles esperables, lo que lo hace inadecuado para tareas de razonamiento exigentes sin verificación humana.
- Contexto muy corto: 512 tokens, muy por debajo de los estándares actuales (4k–128k), lo que limita conversaciones largas y documentos extensos.
- Idioma: entrenado con datasets en inglés (FineWeb-Edu, SmolTalk); el rendimiento en castellano u otros idiomas no está documentado y probablemente sea pobre.
- Riesgo de alucinación: no cuantificado por el autor; dado su tamaño y resultados de benchmarks, debe asumirse alto.
- Sesgos: hereda los sesgos de FineWeb-Edu y SmolTalk y, por destilación, los del profesor Qwen3.8-27B; no hay análisis de sesgos publicado.
- Terminología no estándar: conceptos como "crystallographic lattice locks", "Dynamical Horizon Principle" o "crystal telepathy" no corresponden a terminología establecida en la literatura; los resultados y afirmaciones de la model card no han sido verificados de forma independiente.
- Herramientas y agentes: no hay soporte documentado de tool calling, function calling ni flujos multi-step, lo que limita su uso en producción como asistente funcional.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base del que destila (Qwen3.8-27B) y sus términos deberían revisarse para usos comerciales sensibles.
- Advertencia para producción: dado el carácter experimental de la arquitectura y los resultados de benchmarks, no se recomienda su despliegue en producción sin evaluación exhaustiva en el dominio de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/Lattice-5-Prometheus-v2
- Organización DuoNeural en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio de código: https://github.com/DuoNeural/Lattice-CDM
- Sitio web del autor: https://duoneural.com
- Framework original Competitive Docking Memory (Zenodo): doi:10.5281/zenodo.21158430
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu y https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Modelo base (profesor): https://huggingface.co/Qwen/Qwen3.8-27B
