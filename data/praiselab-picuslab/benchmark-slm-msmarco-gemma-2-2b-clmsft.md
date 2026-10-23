# praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-clmsft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-clmsft` es un adaptador LoRA (PEFT) construido sobre el modelo base `google/gemma-2-2b`, publicado por el usuario praiselab-picuslab. Por los tags del repositorio (`benchmark-slm`, `dataset-msmarco`, `strategy-clmsft`, `or2`) se trata de un artefacto de experimentación dentro de una batería de pruebas con modelos de lenguaje pequeños (SLM), entrenado o evaluado sobre el dataset `microsoft/ms_marco`. No es un modelo de propósito general publicado como producto, sino un punto de control de un benchmark interno.

El repositorio ocupa 0,1 GB, contiene pesos en safetensors y se distribuye con acceso restringido (gated): es necesario aceptar condiciones en HuggingFace para descargarlo. La ficha no incluye model card descriptiva, hiperparámetros de entrenamiento, métricas de evaluación ni licencia explícita, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta.

Su relevancia es, por tanto, acotada y de carácter metodológico: sirve para reproducir o auditar una configuración concreta de ajuste fino ligero sobre Gemma 2 2B en una tarea derivada de MS MARCO. Para cualquier uso en producción, el interés práctico es limitado mientras no se publique la documentación del experimento ni resultados que permitan compararlo con el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; se distribuye un adaptador LoRA (PEFT) sobre `google/gemma-2-2b` |
| Parámetros totales | 2,6 mil millones en el modelo base; el número de parámetros del adaptador no se detalla (repositorio de 0,1 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en el modelo base Gemma 2 2B según la documentación de Google; no especificado en la ficha del adaptador |
| Tipos de cuantización | no disponible en el repositorio; el adaptador se publica en precisión completa y la cuantización se aplicaría al modelo base al cargarlo |
| Idiomas soportados | `en` (inglés), según los tags del repositorio |
| Licencia | no disponible; el acceso es restringido y el uso queda además sujeto a los términos del modelo base Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería declarada: `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Los tags confirman `peft`, `lora` y `base_model:google/gemma-2-2b`, de modo que la inferencia requiere cargar Gemma 2 2B y superponer el adaptador. El modelo base es un transformer decoder-only de 2,6 mil millones de parámetros con 8192 tokens de contexto, entrenado con 2 billones de tokens y destilado a partir de modelos mayores de la familia Gemma 2, según la documentación pública de Google. La ficha del adaptador no aporta información sobre rango LoRA, módulos objetivo, alpha, dropout ni precisión de entrenamiento.

El tag `strategy-clmsft` apunta a una estrategia de ajuste supervisado con modelado de lenguaje causal (CLM-SFT), y `dataset-msmarco` indica que el corpus de ajuste o evaluación es `microsoft/ms_marco`. No se especifica el número de tokens vistos, la composición exacta del subconjunto utilizado, si hubo etapas de RLHF/DPO ni la tarea concreta (generación de respuestas, expansión de consultas, reranking generativo u otra). El tag `or2` no está documentado en la información disponible. Tampoco se detallan innovaciones técnicas propias: el adaptador hereda la arquitectura y el tokenizador del modelo base.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 2 2B.
- Ajuste específico sobre datos derivados de MS MARCO, orientado presumiblemente a tareas de búsqueda o respuesta a preguntas; la ficha no lo confirma.
- No hay evidencia documentada de soporte de tool calling ni de function calling.
- No hay evidencia documentada de capacidades agénticas o de razonamiento multi-paso específicas del adaptador.
- Capacidad multilingüe: el modelo base es multilingüe, pero la ficha solo declara inglés (`en`), por lo que no se garantiza el comportamiento en otros idiomas.
- Sin capacidades de visión, audio ni modo "thinking" (Gemma 2 2B es un modelo de texto).
- Al ser un adaptador LoRA, requiere emparejarse con la versión exacta del modelo base y su tokenizador.

## Casos de uso

- Reproducción de experimentos de benchmark: cargar el adaptador con `peft` sobre `google/gemma-2-2b` y replicar la configuración `clmsft` sobre MS MARCO para comparar con otras variantes del mismo estudio.
- Evaluación comparativa de técnicas de ajuste ligero: usar este checkpoint como brazo LoRA frente a ajuste completo u otras estrategias, midiendo la diferencia respecto al modelo base.
- Investigación sobre adaptación de dominio en recuperación de información: analizar cómo un ajuste sobre MS MARCO modifica la generación de respuestas o de expansiones de consulta en inglés.
- Prototipado en hardware de consumo: al partir de un modelo de 2,6 mil millones de parámetros, el conjunto cabe en GPUs de 8-12 GB en cuantización de 4 bits, lo que permite experimentar con presupuesto reducido.
- Construcción de pipelines de generación aumentada por recuperación (RAG) en inglés: el modelo puede generar respuestas condicionadas a pasajes, aunque sin métricas publicadas no hay garantía de calidad frente al modelo base.
- Auditoría y docencia: estudiar la estructura de un adaptador PEFT real (pesos safetensors, configuración de `adapter_config.json`) en cursos o talleres sobre fine-tuning eficiente.
- Base para un ajuste posterior: servir como inicialización para un segundo entrenamiento LoRA sobre un corpus distinto, siempre que la licencia se aclare antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de MS MARCO (MRR@10, nDCG@10, Recall@k) ni de evaluaciones generales (MMLU, HumanEval, GSM8K), y no hay ningún informe externo asociado. Tampoco se dispone de comparaciones publicadas frente al modelo base.

## Requisitos de hardware

- Tamaño del adaptador: 0,1 GB, negligible frente al modelo base.
- Pesos del modelo base en fp16/bf16: aproximadamente 5,2 GB; con overhead de activaciones y caché KV, prever 7-8 GB de VRAM para contextos moderados.
- Cuantización de 8 bits: unos 2,7 GB de pesos; cuantización de 4 bits (bitsandbytes o GGUF Q4): aproximadamente 1,6-2 GB, lo que deja margen para caché KV en GPUs de 6-8 GB.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en 4 bits también tarjetas de 8 GB como RTX 3070/4060.
- GPUs de centro de datos: A100 40/80 GB y H100 para despliegues con lotes grandes y contexto completo de 8192 tokens.
- Opciones de despliegue: `transformers` + `peft` (ruta más directa), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Métricas publicadas |
|---|---|---|---|---|---|
| Este adaptador (Gemma 2 2B + LoRA `clmsft`) | 2,6 mil millones (base) | 8192 (base) | no disponible | gated | no disponibles |
| `google/gemma-2-2b` (base) | 2,6 mil millones | 8192 | términos de uso de Gemma | pública | sí, en la documentación de Google |
| `meta-llama/Llama-3.2-1B` | 1,24 mil millones | 128 000 | licencia comunitaria de Llama 3.2 | gated | sí, en la model card |
| `Qwen/Qwen2.5-1.5B` | 1,54 mil millones | 32 768 nativos (hasta 131 072 con YaRN) | Apache 2.0 | pública | sí, en la model card |

La comparación debe tomarse con cautela: los datos de las alternativas provienen de sus fichas públicas, mientras que este adaptador no publica ninguna métrica, de modo que no es posible establecer una comparación de rendimiento, solo de especificaciones y de condiciones de uso. En contexto y en claridad de licencia, tanto Llama 3.2 1B como Qwen2.5 1.5B ofrecen condiciones más explícitas.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial. Además, el adaptador está sujeto a los términos de uso de Gemma del modelo base, que imponen restricciones propias.
- Acceso restringido (gated): requiere iniciar sesión y aceptar condiciones en HuggingFace, lo que complica la automatización de descargas en CI/CD.
- Ausencia total de model card: sin hiperparámetros, sin datos de entrenamiento detallados y sin métricas, la reproducibilidad es muy limitada.
- Sin evidencia de calidad: 0 descargas y 0 likes; no hay validación externa ni comparación con el modelo base.
- Riesgo de alucinación inherente a un modelo de 2,6 mil millones de parámetros, agravado por la falta de evaluaciones de fidelidad.
- Sesgo de dominio e idioma: el ajuste se hace sobre MS MARCO, un corpus de consultas web en inglés, por lo que el comportamiento fuera de ese dominio o en otros idiomas no está caracterizado.
- Ventana de contexto de 8192 tokens: suficiente para RAG moderado, pero limitada para documentos largos o conversaciones multi-turno extensas.
- Dependencia estricta del modelo base `google/gemma-2-2b`: cualquier cambio de revisión o de tokenizador puede invalidar el adaptador.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (23 de octubre de 2026) no son coherentes con un artefacto ya publicado, lo que sugiere un problema de registro o un repositorio de prueba.
- El tag `or2` y la estrategia `clmsft` no están documentados, lo que impide saber con exactitud qué se entrenó.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-clmsft
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset utilizado: https://huggingface.co/datasets/microsoft/ms_marco

No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo y se han descartado.
