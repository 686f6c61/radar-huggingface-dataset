# n0rt1o0n/kiwi-ai-1.0-gguf

## Resumen

kiwi-ai-1.0-gguf es un modelo de lenguaje conversacional derivado de Qwen2.5-1.5B-Instruct, publicado por el usuario n0rt1o0n en Hugging Face. Se distribuye exclusivamente en formato GGUF, cuantizado en Q4_K_M, y está pensado para su ejecución local mediante llama.cpp u Ollama. El repositorio contiene un único archivo de pesos de aproximadamente 1 GB, lo que lo sitúa en la franja de modelos ligeros ejecutables en hardware de consumo.

El modelo parte de la arquitectura Qwen2, un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1.5B). El autor indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, una herramienta que acelera el fine-tuning y la exportación de modelos. No se especifica qué datos de ajuste se utilizaron ni si hubo entrenamiento adicional más allá del fine-tuning sobre la base instruct.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin información sobre idiomas o benchmarks. Resulta útil únicamente como ejemplo de pipeline de fine-tuning y cuantización con Unsloth sobre una base Qwen2.5, no como un modelo recomendable para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aprox. 1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingüe y posteriormente alineado mediante instrucciones. Sobre esa base, el autor de kiwi-ai-1.0-gguf aplicó un fine-tuning adicional y la conversión a GGUF usando Unsloth.

No se dispone de información sobre el volumen de tokens de fine-tuning, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en esta variante concreta. Tampoco se documentan innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento y la exportación. La model card se limita a indicar los comandos de uso con llama-cli y llama-mtmd-cli y a listar el archivo GGUF disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat, con soporte de plantilla Jinja (`--jinja`).
- Capacidades multilingües presumiblemente heredadas de Qwen2.5, aunque no se documentan idiomas concretos en esta ficha.
- Posible soporte de tool calling y function calling por herencia del modelo base, no verificado en esta variante.
- Ejecución local en CPU y GPU mediante llama.cpp y Ollama.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en local: el archivo Q4_K_M de ~1 GB se carga en llama.cpp u Ollama sin necesidad de GPU dedicada, lo que permite iterar sobre prompts y plantillas de chat en un portátil.
- Pruebas de pipelines de fine-tuning con Unsloth: sirve como referencia de cómo exportar un modelo ajustado a GGUF y verificar su funcionamiento con `llama-cli --jinja`.
- Chatbot de soporte en entornos con recursos limitados: al ser un modelo de 1.5B cuantizado, puede desplegarse en dispositivos edge o contenedores pequeños para tareas de clasificación y respuesta breve.
- Generación de texto auxiliar en herramientas de desarrollo: resúmenes, reescritura o extracción de información en flujos donde la latencia y el coste importan más que la calidad puntera.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de Q4_K_M frente al modelo base en tareas concretas antes de adoptar una cuantización mayor.
- Base para experimentos académicos sobre ajuste fino de modelos pequeños: permite reproducir el pipeline Unsloth → GGUF con un modelo de 1.5B y comparar con la versión original de Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1.5 GB con la cuantización Q4_K_M publicada, más el overhead del contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (incluye Modelfile), y potencialmente otros runners compatibles con GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kiwi-ai-1.0-gguf | 1.5B | no disponible | no disponible | GGUF Q4_K_M | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors, GGUF | Hugging Face, ampliamente usado |
| Llama 3.2 1B Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Meta |
| Gemma 2 2B Instruct | 2.6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Google |

La comparativa se basa en los modelos base conocidos; no hay datos de rendimiento de kiwi-ai-1.0-gguf que permitan contrastar calidad. La principal diferencia frente a las alternativas es la ausencia de licencia declarada y de documentación, lo que limita su adopción frente a los modelos oficiales.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor o asumir los términos de Qwen2.5-1.5B-Instruct como referencia, sin garantía.
- Sin model card detallada: se desconoce el dataset de fine-tuning, los idiomas soportados y las capacidades reales tras el ajuste.
- Riesgo de alucinación inherente a un modelo de 1.5B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Única cuantización disponible (Q4_K_M): no se ofrecen versiones Q8_0, Q5_K_M o F16 para comparar calidad.
- Posible degradación respecto al modelo base por el fine-tuning, sin benchmarks que lo cuantifiquen.
- No apto para producción sin evaluación previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/n0rt1o0n/kiwi-ai-1.0-gguf
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
