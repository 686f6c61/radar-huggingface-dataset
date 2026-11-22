# Maxilicious20/Velqora-38M-Instruct

## Resumen

Velqora-38M-Instruct es un modelo de lenguaje causal decoder-only de 38.025.227 parámetros (~38,03 M) entrenado desde inicialización aleatoria (sin pesos preentrenados) por el desarrollador independiente Maxilicious20. Se trata de un ejercicio de investigación y pedagogía: reproduce en miniatura una arquitectura transformer moderna con componentes actuales (GQA, QK-Norm, value residuals, SwiGLU, RoPE, RMSNorm) y la entrena de principio a fin en una única GPU de consumo, una NVIDIA GeForce RTX 4060 de 8 GB bajo Windows 11.

El modelo está ajustado por instrucciones (SFT) y serializa las conversaciones en formato ChatML. Su ventana de contexto es de 1.024 tokens y su idioma principal es el inglés. No pretende competir con modelos de producción: su relevancia radica en que documenta el ciclo completo de entrenamiento (curriculum de preentrenamiento más SFT con máscara de pérdida solo en turnos del asistente) sobre hardware asequible, lo que lo convierte en una referencia útil para estudiar el comportamiento de arquitecturas transformer pequeñas.

La licencia Apache-2.0 y la inclusión de implementación propia en PyTorch, tokenizer personalizado y un checkpoint GGUF companion facilitan su inspección, reproducción y despliegue local en entornos de investigación y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, implementación propia en PyTorch (`velqora/model.py`) |
| Parametros totales | 38.025.227 (~38,03 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF disponible en repositorio companion (tipos concretos no disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), checkpoint PyTorch (`model.pt`) y GGUF (repositorio companion) |

Detalles arquitectónicos adicionales: 12 capas transformer, hidden size 512, 8 cabezas de query y 2 de key-value (GQA), QK-Norm, value residuals en la capa 0, feed-forward de 1.408 con SwiGLU, embeddings de posición RoPE con θ = 10.000, RMSNorm, embeddings de entrada/salida atados y tokenizer BPE byte-level personalizado de 8.192 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas con atención de múltiples cabezas con consultas agrupadas (GQA, 8 cabezas de query y 2 de key-value), lo que reduce el coste de memoria del KV cache. Incorpora QK-Norm para estabilizar la atención, value residuals en la capa 0 (conexión residual directa desde los valores de la primera capa), SwiGLU en la feed-forward, RMSNorm y RoPE. La implementación usa `scaled_dot_product_attention` y precisión bfloat16, con embeddings de entrada y salida atados.

El entrenamiento se realizó desde inicialización aleatoria en dos fases sobre una única RTX 4060 de 8 GB. La primera fase fue un preentrenamiento por curriculum con predicción del siguiente token sobre `HuggingFaceTB/cosmopedia-100k`, `HuggingFaceFW/fineweb-edu` y `roneneldan/TinyStories`, ampliando progresivamente la longitud de contexto hasta la ventana máxima. La segunda fase fue un SFT con ChatML multi-turno y máscara de pérdida solo en turnos del asistente, usando `HuggingFaceTB/smoltalk`, `HuggingFaceH4/ultrachat_200k`, `HuggingFaceH4/no_robots` y diálogos de recuperación/grounding multi-turno. La mejor pérdida de validación reportada es 1,4712. No se documentan el número total de tokens vistos, la composición exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML.
- Respuesta a instrucciones simples tras el ajuste SFT.
- Conversaciones multi-turno dentro de la ventana de 1.024 tokens.
- Diálogos de recuperación y grounding multi-turno (incluidos en el SFT).
- Generación de texto creativo y narrativo breve (influencia de TinyStories en el preentrenamiento).
- Razonamiento básico y respuesta a preguntas factuales sencillas, con fiabilidad limitada por el tamaño.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre modelos ultra-pequeños desde cero: permite estudiar el efecto de GQA, QK-Norm, value residuals o SwiGLU en un modelo de 38 M parámetros sin necesidad de infraestructura de datacenter, comparando configuraciones sobre la misma base.
- Docencia de arquitecturas transformer: el repositorio incluye `model.py` legible y un `run_inference.py`, lo que facilita recorrer capa a capa la implementación en un curso o taller.
- Inferencia local en edge: con 38 M parámetros cabe holgadamente en CPU y en GPUs de consumo muy modestas, útil para prototipos de asistentes conversacionales offline.
- Pruebas de pipelines de despliegue: sirve como modelo de humo para validar integraciones con llama.cpp, Ollama u otros runners compatibles con GGUF antes de pasar a modelos mayores.
- Generación de narrativa breve y texto creativo controlado: la exposición a TinyStories durante el preentrenamiento le da cierta soltura en cuentos cortos y frases simples en inglés.
- Evaluación de técnicas de cuantización: al ser un modelo minúsculo, permite medir el impacto de distintas cuantizaciones GGUF en calidad y latencia con coste despreciable.
- Reproducción de recetas de entrenamiento: documenta el curriculum de contexto creciente y el SFT con máscara de pérdida, replicable en una sola GPU de 8 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la mejor pérdida de validación: 1,4712.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (los pesos ocupan aproximadamente 76 MB); las cuantizaciones GGUF reducen aún más el requisito.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; el propio autor entrenó el modelo en una RTX 4060 de 8 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y CPU.
- Opciones de despliegue: implementación propia en PyTorch (`run_inference.py`), llama.cpp u Ollama mediante el repositorio GGUF companion. Compatibilidad con vLLM o TGI no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Velqora-38M-Instruct | 38,03 M | 1.024 | Inglés | Apache-2.0 | Entrenado desde cero en una RTX 4060 |
| SmolLM-135M-Instruct (HuggingFaceTB) | 135 M | 2.048 | Inglés | Apache-2.0 | Preentrenado a mayor escala; referencia de la familia SmolLM |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 | Inglés | Apache-2.0 | Modelo pequeño ampliamente usado en entornos de consumo |

La comparación es orientativa: Velqora-38M es entre tres y treinta veces menor que las alternativas citadas, por lo que su utilidad es fundamentalmente investigadora y educativa, no de rendimiento. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Alucinación factual: con 38 M parámetros y entrenamiento desde cero, el modelo puede inventar datos, fechas y entidades.
- Errores aritméticos y de razonamiento complejo: no es fiable en matemáticas ni en instrucciones de varios pasos.
- Ventana de contexto muy corta (1.024 tokens): no admite documentos largos ni conversaciones extensas.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Sesgos: los datasets de preentrenamiento y SFT (FineWeb-Edu, Cosmopedia, SmolTalk, UltraChat, No Robots) pueden introducir sesgos de género, culturales o de estilo; el autor no documenta evaluaciones de sesgo.
- Sin salvaguardas documentadas: no se describe alineamiento de seguridad, filtros ni evaluación de contenido dañino.
- No apto para producción ni para dominios críticos (médico, legal, financiero o de seguridad), tal como advierte el propio autor.
- Licencia Apache-2.0: permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en productos reales sin validación adicional.
- Implementación no estándar: requiere el código propio del repositorio (`velqora/model.py`) y no funciona directamente con `AutoModelForCausalLM` de Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxilicious20/Velqora-38M-Instruct
- Repositorio GGUF companion: https://huggingface.co/Maxilicious20/Velqora-38M-Instruct-GGUF
- Perfil del autor: https://huggingface.co/Maxilicious20
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de preentrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceH4/no_robots
