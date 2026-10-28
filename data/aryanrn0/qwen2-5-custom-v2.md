# AryanRN0/qwen2.5-custom-v2

## Resumen

AryanRN0/qwen2.5-custom-v2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-0.5B-Instruct, desarrollado por Aryan Maurya y publicado en HuggingFace. Se trata de un modelo denso de tipo transformer decoder-only con 494.032.768 parámetros, obtenido mediante LoRA (Low-Rank Adaptation) cuyos adaptadores se han fusionado (merged) en los pesos completos, de forma que se distribuye como un modelo autónomo y no como un adaptador separado.

El modelo se presenta como especializado en ingeniería del software, Python, conceptos de IA y seguimiento general de instrucciones, y está etiquetado como conversacional y de generación de texto en inglés. El entrenamiento se realizó sobre hardware Apple Silicon (MPS), lo que sitúa el proyecto en la categoría de ajustes finos de bajo coste realizados por un autor individual más que en la de un modelo con validación industrial.

Su relevancia es limitada pero ilustrativa: sirve como ejemplo reproducible del flujo LoRA + merge sobre una base pequeña y de licencia permisiva (Apache 2.0), y como modelo de juguete para prototipado local en CPU o GPU de gama baja. No obstante, en el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", no publica resultados de evaluación ni detalles del dataset de ajuste fino, por lo que no debe considerarse un artefacto validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, clase `Qwen2ForCausalLM`), denso |
| Parámetros totales | 494.032.768 (494 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantización | Solo se publican pesos en safetensors (el ejemplo de carga usa `torch.float32`); no hay versiones GGUF, GPTQ, AWQ ni EXL2 oficiales |
| Idiomas soportados | Inglés (`en`) según la model card; el base es multilingüe, pero el ajuste fino no declara otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB, coherente con pesos en fp32) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Técnica de ajuste | LoRA fusionado en los pesos completos |
| Hardware de entrenamiento | Apple Silicon (MPS) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU, embeddings de RoPE y atención con query/key/value bias, tal como corresponde a la familia Qwen2. El ajuste fino no modifica la topología: se aplica LoRA sobre los pesos del base y posteriormente se fusionan los adaptadores, de modo que la inferencia tiene exactamente el mismo coste computacional y el mismo grafo que el modelo original de 494 M de parámetros.

La información pública sobre el entrenamiento es mínima. La model card indica únicamente la técnica (LoRA), el hardware (Apple Silicon MPS) y el dominio declarado (ingeniería del software, Python, conceptos de IA y seguimiento de instrucciones generales). No se especifican el número de tokens de entrenamiento, la composición del dataset, el rango y alpha de LoRA, la tasa de aprendizaje, el número de épocas ni si hubo fases de RLHF o DPO posteriores. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación); el interés del proyecto reside en el procedimiento de merge, no en aportaciones arquitectónicas.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`), heredada del modelo Instruct original.
- Seguimiento de instrucciones generales, con especialización declarada en tareas de programación en Python y explicación de conceptos de IA.
- Generación y explicación de código, así como resolución de dudas técnicas básicas dentro del dominio declarado.
- Razonamiento de un solo paso y respuestas cortas; el tamaño de 0,5 B limita el razonamiento multi-paso complejo.
- Capacidad multilingüe residual procedente del base Qwen2.5, aunque la model card solo declara inglés y el ajuste fino puede haber degradado otros idiomas.
- No se documenta soporte de tool calling o function calling específico del ajuste; el base Qwen2.5-Instruct incorpora plantillas para ello, pero no hay evidencia de que se haya preservado tras el fine-tune.
- No se documentan capacidades de visión, audio, modo "thinking" ni agentes autónomos.

## Casos de uso

- Asistente de dudas de Python en local: el modelo cabe en cualquier portátil y puede responder preguntas sobre sintaxis, estructuras de datos y errores comunes sin conexión, usando la plantilla de chat del base con `max_new_tokens` en torno a 256.
- Prototipado de pipelines de generación de texto: sirve como sustituto barato del modelo base para validar integraciones con `transformers`, plantillas de chat y formateo de prompts antes de escalar a modelos mayores.
- Documentación técnica automatizada: generación de docstrings y comentarios explicativos en proyectos pequeños, con revisión humana obligatoria dado el riesgo de alucinación en APIs poco frecuentes.
- Base para nuevos ajustes finos con LoRA: al estar ya fusionado y ser Apache 2.0, puede emplearse como punto de partida para experimentos de adaptación de dominio en hardware de consumo.
- Docencia y demostraciones de fine-tuning: ejemplo completo de flujo LoRA + merge sobre Apple Silicon, útil en talleres sobre adaptación eficiente de parámetros.
- Generación de texto en entornos con recursos muy limitados (Raspberry Pi, contenedores sin GPU): con cuantización a int8 o int4 el modelo ocupa pocos cientos de MB y puede ejecutarse en CPU, a costa de calidad.
- Clasificación y etiquetado ligero de texto en inglés mediante prompts: resúmenes de una línea, extracción de palabras clave o reformulación de fragmentos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones humanas, y el repositorio no registra descargas ni valoraciones que permitan inferir comparaciones. Tampoco se documenta una evaluación del impacto del ajuste fino respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB en fp32 (configuración del ejemplo oficial), unos 1,0 GB en fp16/bf16, unos 0,5 GB en int8 y unos 0,25 GB en int4, sin contar caché KV ni activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sobradamente y quedan limitadas por latencia de kernel, no por memoria.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas (incluidas GTX 1650 de 4 GB y superiores) y también en CPU y en Apple Silicon vía MPS.
- Opciones de despliegue: `transformers` (soporte nativo de `Qwen2ForCausalLM`), vLLM y TGI (la arquitectura Qwen2 está soportada), y llama.cpp u Ollama tras convertir los pesos a GGUF, conversión que el autor no publica.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de un modelo de 494 M de parámetros, el rendimiento estará dominado por el ancho de banda de memoria en GPU y por la longitud del prompt; no hay cifras verificables que citar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AryanRN0/qwen2.5-custom-v2 | 494 M | No especificado en la card (base: 32.768) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune LoRA fusionado, sin evaluación publicada |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | Base oficial, con model card detallada y amplia adopción |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.540 M | 32.768 tokens | Apache 2.0 | HuggingFace | Mayor capacidad de razonamiento y código a coste de ~3 veces más memoria |
| Llama-3.2-1B-Instruct | ~1.240 M | 128.000 tokens | Llama 3.2 Community License | HuggingFace (repositorio con acceso) | Contexto mucho mayor; licencia con restricciones adicionales para uso comercial |
| SmolLM2-360M-Instruct | ~362 M | 8.192 tokens | Apache 2.0 | HuggingFace | Alternativa aún más pequeña, orientada a dispositivos móviles |

Los datos de los modelos comparados provienen de sus respectivas fichas públicas, no de evaluaciones cruzadas con este modelo. No existen benchmarks que permitan afirmar qué posición ocupa este fine-tune frente a su base.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el modelo base, por lo que se desconoce si el ajuste fino mejora o degrada el rendimiento original.
- Riesgo de olvido catastrófico: al ser un fine-tune de dominio sobre una base de 0,5 B, es probable la pérdida de capacidades generales y multilingües del Qwen2.5-0.5B-Instruct original.
- Dataset no documentado: se desconoce la procedencia de los datos de entrenamiento, lo que impide auditar sesgos, contaminación de benchmarks o cumplimiento de derechos de autor.
- Alucinación: esperable y acentuada en un modelo de este tamaño, especialmente en referencias a APIs, librerías o hechos verificables; requiere validación humana en cualquier uso técnico.
- Sesgos: no se han publicado análisis de sesgo; los sesgos del corpus de ajuste fino y del base Qwen2.5 se heredan sin mitigación documentada.
- Idiomas: solo se declara inglés; el uso en castellano no está soportado y la calidad será previsiblemente baja.
- Contexto: la model card no especifica la ventana utilizada durante el ajuste fino, por lo que no hay garantía de que se preserve el contexto de 32.768 tokens del base.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del base (también Apache 2.0) si se redistribuye.
- Madurez: 0 descargas, 0 valoraciones y фактически un único commit de publicación indican que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AryanRN0/qwen2.5-custom-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
