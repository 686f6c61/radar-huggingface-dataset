# masakanomasaka/llm2026-qwen35-0.8b-ragsft-v3

## Resumen

llm2026-qwen35-0.8b-ragsft-v3 es un ajuste fino supervisado (SFT) mediante LoRA, posteriormente fusionado con los pesos base, del modelo Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario masakanomasaka en el contexto del curso "LLM講座2 2026" (curso de LLM 2026) como proyecto final. El modelo conserva exactamente la misma arquitectura que el modelo original; no se introducen cambios estructurales, solo un reentrenamiento sobre datos japoneses orientados a tareas de question answering y recuperacion aumentada (RAG).

El objetivo declarado es especializar un modelo pequeno (873 millones de parametros) en comprension lectora y respuesta a preguntas sobre contexto recuperado en japones, usando JSQuAD/JGLUE, JEMHopQA y fragmentos de Wikipedia japonesa como datos de entrenamiento. Es relevante como ejemplo de pipeline de ajuste fino de bajo coste (entrenamiento en Google Colab) sobre un modelo base compacto, y como artefacto reproducible para experimentos de RAG en japones.

La informacion publicada es muy escasa: no hay model card detallada, no se declaran licencia ni idiomas en los metadatos, y no se han publicado resultados de evaluacion. Todo lo que se describe a continuacion se deduce de los metadatos de Hugging Face y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B, familia qwen3_5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en metadatos; los datos de entrenamiento son en japones |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 1,8 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura del Qwen3.5-0.8B original, un transformer decoder-only de 873 millones de parametros. El autor indica explicitamente que "la estructura del modelo es identica al modelo original", por lo que no hay modificaciones en atencion, normalizacion ni en la cabeza de salida. El ajuste se realizo con LoRA (SFT) y posteriormente se fusionaron los adaptadores con los pesos base, generando un checkpoint unico en safetensors.

Los datos de entrenamiento son tres conjuntos en japones: JSQuAD/JGLUE (licencia CC BY-SA 4.0, filtrado y reformateado), el split de entrenamiento de JEMHopQA (filtrado y reformateado) y un conjunto de chunks distribuidos derivados de Wikipedia japonesa (CC BY-SA 4.0), usados como resultados de busqueda en la entrada durante el entrenamiento. Todo el entrenamiento se ejecuto en Google Colab. No se especifican el numero de tokens, la composicion exacta del dataset, hiperparametros, ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en japones, con especializacion en question answering sobre contexto aportado (estilo RAG).
- Comprension lectora extractiva y de respuesta corta, entrenada sobre JSQuAD y JEMHopQA.
- Razonamiento multi-hop limitado: JEMHopQA incluye preguntas que requieren combinar varias entidades, aunque el tamano del modelo acota la profundidad.
- Condicionamiento por contexto recuperado: el modelo fue entrenado con chunks de Wikipedia como entradas de busqueda, por lo que esta adaptado a responder a partir de pasajes inyectados en el prompt.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: no disponibles en metadatos; el entrenamiento es exclusivamente en japones.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Sistemas de RAG en japones sobre documentacion corporativa: el modelo esta entrenado con pasajes recuperados como contexto, por lo que puede responder preguntas concretas citando el fragmento inyectado en el prompt, con un coste de inferencia muy bajo.
- Question answering sobre Wikipedia japonesa: dado un articulo o un conjunto de chunks, el modelo responde preguntas factuales y de entidad, aprovechando el entrenamiento sobre JSQuAD y JEMHopQA.
- Asistente de soporte interno de bajo coste: al tener menos de mil millones de parametros, puede desplegarse en una sola GPU consumer para responder consultas frecuentes sobre manuales internos.
- Prototipado rapido de pipelines RAG: sirve como modelo de referencia para validar el recuperador y el formateo de contexto antes de escalar a modelos mayores.
- Evaluacion de tecnicas de chunking y filtrado: al estar entrenado con chunks filtrados y reformateados, permite medir como afecta la calidad de los pasajes recuperados a la respuesta final.
- Experimentos academicos de ajuste fino con LoRA: el modelo documenta un pipeline completo (LoRA + fusion + entrenamiento en Colab) replicable con recursos limitados.
- Extraccion de respuestas cortas en formularios o encuestas: tareas de lectura comprensiva sobre un texto adjunto con salida breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 2,5-4 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,5-0,7 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en FP16; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas en FP16, y en GPUs integradas o de gama baja con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI, llama.cpp y Ollama (estos dos ultimos requieren conversion previa a GGUF, no publicada en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llm2026-qwen35-0.8b-ragsft-v3 | 873 M | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | segun repositorio de Qwen | Hugging Face |
| Otros ajustes SFT de <1 B para japones | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas; la unica comparacion posible es estructural con su modelo base, del que hereda arquitectura y numero de parametros.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, por lo que no puede afirmarse ninguna mejora respecto al modelo base.
- Licencia no declarada: no consta permiso explicito de uso comercial; ademas, los datos de entrenamiento incluyen material CC BY-SA 4.0 (JSQuAD/JGLUE y Wikipedia japonesa), lo que puede imponer obligaciones de atribucion y compartir igual.
- Idiomas: el ajuste es exclusivamente en japones; el rendimiento en castellano u otros idiomas no esta documentado y probablemente se degrade respecto al base.
- Riesgo de alucinacion: al ser un modelo de 873 M especializado en QA extractivo, puede generar respuestas plausibles pero no sustentadas en el contexto, especialmente en preguntas multi-hop.
- Sesgos: no documentados; los sesgos de Wikipedia y de los corpus japoneses empleados pueden propagarse al modelo.
- Contexto: no se publica la longitud de contexto soportada, lo que impide planificar el tamano de los chunks en produccion.
- Madurez: modelo con 0 descargas y 0 likes, creado como proyecto de curso; no hay garantias de mantenimiento ni soporte.
- Uso en produccion: requiere validacion propia (evaluacion en el dominio objetivo, pruebas de robustez ante contextos largos y verificacion de licencias de los datos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masakanomasaka/llm2026-qwen35-0.8b-ragsft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- JEMHopQA: https://github.com/aiishii/JEMHopQA
