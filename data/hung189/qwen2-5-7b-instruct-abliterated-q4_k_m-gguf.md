# Hung189/Qwen2.5-7B-Instruct-abliterated-Q4_K_M-GGUF

## Resumen

`Hung189/Qwen2.5-7B-Instruct-abliterated-Q4_K_M-GGUF` es una cuantización en formato GGUF (tipo Q4_K_M) del modelo `Hung189/Qwen2.5-7B-Instruct-abliterated`, que a su vez deriva de Qwen2.5-7B-Instruct de Alibaba Cloud. La conversión se ha realizado con llama.cpp a través del espacio GGUF-my-repo de ggml.ai. El resultado es un artefacto listo para inferencia local con llama.cpp, Ollama o cualquier runtime compatible con GGUF.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y la modificación "abliterated", una técnica de edición de pesos que elimina direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo ante peticiones que el modelo original filtraría. El resultado es un modelo con menor alineación de seguridad, orientado a investigación sobre comportamiento de modelos, no a despliegues de producción sin salvaguardas.

La relevancia de esta ficha es acotada: se trata de una cuantización de un derivado no oficial, sin model card técnica propia, sin licencia declarada y sin benchmarks publicados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 1,9 GB. La información técnica disponible se limita a los metadatos de Hugging Face y a la model card auto-generada por GGUF-my-repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 3.085.938.688 según safetensors del modelo base; la nomenclatura del repo indica 7B (no disponible la cifra exacta del checkpoint abliterated) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen2.5-7B-Instruct original soporta hasta 131.072 tokens, pero no se confirma para este derivado) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen2.5-7b-instruct-abliterated-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, RoPE, normalización RMSNorm y activación SwiGLU. Sobre esa base, el autor del modelo intermedio (`Hung189/Qwen2.5-7B-Instruct-abliterated`) aplicó una edición de pesos del tipo "abliteration", que consiste en identificar la dirección de rechazo en el espacio de activaciones y proyectarla fuera de los pesos para reducir la probabilidad de respuestas negativas ante prompts sensibles. No se dispone de información sobre el procedimiento exacto, hiperparámetros, datos de calibración ni evaluación posterior.

El paso final, documentado en la model card, es una conversión a GGUF mediante llama.cpp en el espacio GGUF-my-repo, con cuantización Q4_K_M. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia cuantización. No se han publicado detalles sobre el proceso de abliteration en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredadas de Qwen2.5-7B-Instruct.
- Generación de código y matemáticas a nivel de un modelo de 7B de la familia Qwen2.5.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada en este derivado).
- Capacidad de seguir instrucciones multi-turno y mantener contexto conversacional.
- Capacidades multilingües (el modelo original cubre decenas de idiomas; no confirmado para este derivado).
- Formato de chat compatible con plantilla Qwen2.5 (ChatML).
- Modo "abliterated": menor probabilidad de rechazo ante peticiones que el modelo original filtraría, con el consiguiente riesgo de contenido no seguro.
- No se dispone de información sobre visión, audio ni modo thinking explícito en este derivado.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la edición de pesos afecta a la tasa de rechazos y a la calidad de las respuestas, comparándolo con el Qwen2.5-7B-Instruct original en el mismo hardware.
- Inferencia local en equipos de sobremesa: con cuantización Q4_K_M y ~4,5-5 GB de peso, se puede ejecutar en GPUs consumer de 8 GB o en CPU con llama.cpp para prototipos y pruebas offline.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o narrativa que requiera explorar temas sensibles sin las negativas del modelo alineado, siempre con revisión humana.
- Evaluación de robustez de pipelines: servir como modelo "no alineado" de referencia para medir cómo se comportan clasificadores de seguridad, guardrails o sistemas de moderación aguas abajo.
- Desarrollo de agentes y tool calling en local: aprovechar la plantilla ChatML y el soporte de function calling del base para prototipar agentes en entornos sin conectividad, aceptando el riesgo de respuestas no seguras.
- Reproducción de experimentos de cuantización: comparar Q4_K_M frente a otras cuantizaciones del mismo modelo base para medir degradación de perplejidad y calidad en tareas concretas.
- Fine-tuning ligero sobre GGUF: usar el checkpoint como base para LoRA o adaptadores en flujos con llama.cpp/PEFT, verificando antes la licencia aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5-5,5 GB con Q4_K_M (tamaño del repo 1,9 GB; el archivo GGUF Q4_K_M de un 7B suele rondar 4,4-4,9 GB, aunque el tamaño exacto del archivo no se detalla en la información proporcionada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A10, L4, A100 y H100 para mayor throughput.
- Cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contexto moderado; en 6 GB puede requerir offload parcial a CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habría que usar el checkpoint safetensors del modelo base.
- Latencia y throughput: no disponibles. Como referencia orientativa, un 7B Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay medición publicada para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hung189/Qwen2.5-7B-Instruct-abliterated-Q4_K_M-GGUF | 7B (nominal) | no disponible | no disponible | GGUF Q4_K_M | Objeto de esta ficha; 0 descargas |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2 | 7B | no disponible en la busqueda | no disponible | safetensors (y GGUF en QuantFactory) | Variante abliterated ampliamente referenciada |
| QuantFactory/Qwen2.5-7B-Instruct-abliterated-v2-GGUF | 7B | no disponible en la busqueda | no disponible | GGUF | Cuantización GGUF del anterior |
| Qwen/Qwen2.5-7B-Instruct (original) | 7B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo base alineado; referencia de calidad y seguridad |

## Limitaciones y advertencias

- El proceso de abliteration reduce los rechazos del modelo, lo que implica mayor probabilidad de generar contenido dañino, sesgado o ilegal. No es apto para producción sin guardrails externos.
- Riesgo elevado de alucinación, inherente a los modelos de 7B y potencialmente agravado por la edición de pesos.
- Licencia no declarada en el repositorio: no se puede asumir uso comercial. Hay que verificar la licencia del modelo base Qwen2.5-7B-Instruct y del checkpoint intermedio antes de cualquier despliegue.
- Idiomas soportados no documentados; el comportamiento multilingüe puede degradarse respecto al original.
- Longitud de contexto no confirmada para este derivado; la model card de ejemplo usa `-c 2048`, lo que sugiere un uso conservador.
- Solo se publica la cuantización Q4_K_M; no hay otras variantes (Q5, Q8, FP16) en este repositorio.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso comunitario ni de validación independiente.
- El nombre del repo indica "7B" pero los safetensors del modelo base declaran 3.085.938.688 parámetros; conviene verificar el checkpoint real antes de planificar hardware.
- No hay información sobre el proceso de abliteration ni evaluación de su impacto en calidad, por lo que la comparación con el modelo original debe hacerse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hung189/Qwen2.5-7B-Instruct-abliterated-Q4_K_M-GGUF
- Modelo base intermedio: https://huggingface.co/Hung189/Qwen2.5-7B-Instruct-abliterated
- Variante abliterated de referencia (huihui-ai): https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Cuantización GGUF de la variante anterior: https://huggingface.co/QuantFactory/Qwen2.5-7B-Instruct-abliterated-v2-GGUF
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
