# Ironwood-LLM-Team/Firehouse-Cactus-1.03

## Resumen

Firehouse-Cactus-1.03 es un modelo de lenguaje de 7.940 millones de parámetros desarrollado por Ironwood-LLM-Team, un equipo independiente que publica modelos derivados de la familia Gemma de Google (el tag `gemma4` indica que la arquitectura base pertenece a la generación Gemma 4). El modelo se presenta como un fine-tuning del checkpoint anterior Firehouse-Cactus-1.02, entrenado con la herramienta Unsloth, y distribuido en formato MLX y safetensors, lo que lo hace compatible con Apple Silicon y con los ecosistemas de inferencia estándar.

La relevancia de este lanzamiento radica en su licencia Apache-2.0, que permite uso comercial sin restricciones de atribución, y en su tamaño contenido que lo sitúa en el rango de modelos desplegables en hardware de consumo y en entornos de producción con una sola GPU. Sin embargo, el repositorio está sujeto a control de acceso (gated), por lo que los usuarios deben aceptar condiciones adicionales en Hugging Face antes de descargarlo, a pesar de la licencia abierta declarada.

La ficha se basa exclusivamente en la información disponible en el repositorio y en los resultados de búsqueda; no se han publicado aún detalles técnicos completos, benchmarks ni documentación de entrenamiento en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Gemma 4 según tag `gemma4`) |
| Parametros totales | 7.937.953.568 (~7,94 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, MLX |
| Libreria | mlx (optimizado para Apple Silicon) |
| Modelo base | Ironwood-LLM-Team/Firehouse-Cactus-1.02 |
| Acceso | restringido (gated) en Hugging Face |
| Tamano del repo | 15,9 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del modelo. El tag `gemma4` indica que se basa en un checkpoint de la familia Gemma 4 de Google, por lo que se puede inferir una arquitectura transformer decoder-only, pero no se confirma ni el número de capas, ni el mecanismo de atención, ni si incorpora variantes como atención lineal o decodificación especulativa.

El modelo es un fine-tune del checkpoint Firehouse-Cactus-1.02, entrenado con la librería Unsloth, que es una herramienta de optimización de fine-tuning conocida por reducir el uso de memoria y acelerar el entrenamiento. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. La distribución en formato MLX sugiere que el modelo está optimizado para inferencia en hardware Apple Silicon, pero también se ofrecen pesos safetensors estándar para otros entornos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation`, orientado a diálogo y respuesta a instrucciones.
- Fine-tuning conversacional: los tags `conversational` y `text-generation` indican que el modelo está ajustado para mantener conversaciones multi-turno.
- Capacidades multilingües: no se han publicado datos sobre los idiomas soportados; se marca como no disponible.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible en la información.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno gracias a su ajuste conversacional. Su licencia Apache-2.0 permite integrarlo en sistemas comerciales sin costes de licencia adicionales, y su tamaño de 7,94 B permite desplegarlo en una GPU de 24 GB con cuantización.
- Asistente de escritura y redacción: con su capacidad de generación de texto, puede ayudar en la elaboración de correos, informes, resúmenes y contenido creativo en español y otros idiomas (pendiente de confirmar el soporte lingüístico).
- Chatbots internos para empresas: al ser un modelo open-source bajo Apache-2.0, se puede desplegar en infraestructura propia para construir chatbots privados que procesen documentación interna sin depender de APIs externas.
- Generación de código en entornos de desarrollo: aunque no se confirma soporte explícito de tool calling, los modelos de la familia Gemma suelen tener capacidades de código; se recomienda verificar con benchmarks antes de usarlo en producción.
- Fine-tuning adicional para dominios específicos: al ser un checkpoint de 7,94 B y estar entrenado con Unsloth, es un buen punto de partida para fine-tuning con recursos limitados (por ejemplo, una RTX 4090) para tareas de clasificación, extracción o diálogo en dominios verticales.
- Despliegue en dispositivos Apple: al ofrecer pesos MLX, el modelo se puede ejecutar eficientemente en Macs con Apple Silicon (M1/M2/M3), lo que permite aplicaciones locales de asistencia personal sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es de 15,9 GB, lo que corresponde a pesos en fp16/bf16 (7,94 B parámetros × 2 bytes ≈ 15,9 GB). Para inferencia con pesos completos se necesitan al menos 16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) para pesos sin cuantizar. Con cuantización de 4 bits (no confirmada disponible), se podría reducir a ~8 GB y ejecutar en RTX 3080/4070 o similares.
- Compatibilidad con consumer GPU: sí, si se aplica cuantización (por ejemplo, GGUF o GPTQ) y se usa llama.cpp, Ollama o vLLM.
- Opciones de despliegue: al estar en formato safetensors y MLX, se puede usar con Transformers + vLLM, llama.cpp (si se convierte a GGUF), Ollama, o el runtime MLX de Apple. No se confirma compatibilidad con TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones completas de Firehouse-Cactus-1.03, por lo que la comparativa se limita a parámetros generales y contexto de publicación.

| Modelo | Parametros | Contexto | Licencia | Formato | Acceso |
|---|---|---|---|---|---|
| Firehouse-Cactus-1.03 (Ironwood) | 7,94 B | no disponible | Apache-2.0 | safetensors, MLX | gated |
| Gemma-2-9B (Google) | 9,24 B | 8K (ampliable) | Gemma Terms | safetensors, GGUF | abierto |
| Llama-3.2-8B (Meta) | 8,03 B | 128K | Llama License | safetensors, GGUF | abierto |
| Mistral-7B v0.3 | 7,24 B | 32K | Apache-2.0 | safetensors, GGUF | abierto |

La comparativa es orientativa; no se han verificado los datos de contexto de Firehouse-Cactus-1.03. Los modelos de Google y Meta tienen licencias con restricciones adicionales para uso comercial (Gemma Terms y Llama License), mientras que Firehouse-Cactus-1.03 usa Apache-2.0, más permisiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre mitigación de sesgos. Al derivar de Gemma 4, hereda los sesgos del modelo base, que no se han evaluado de forma independiente.
- Riesgo de alucinación: al ser un modelo de 7,94 B, la probabilidad de alucinación es moderada-alta en tareas de razonamiento complejo o factualidad. Se recomienda validar las salidas en aplicaciones de producción.
- Limitaciones de contexto: la longitud de contexto no se ha publicado; si se hereda de Gemma 4, podría ser de 8K tokens, pero no es seguro.
- Limitaciones de idioma: no se ha confirmado el soporte multilingüe; el modelo podría estar optimizado principalmente para inglés.
- Restricciones de licencia: aunque la licencia declarada es Apache-2.0, el acceso es gated y requiere aceptar condiciones adicionales en Hugging Face. Verifica que esas condiciones no impongan restricciones de uso no recogidas en la licencia.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, y no se han publicado benchmarks ni documentación técnica de entrenamiento. No es apto para entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.03
- Versión anterior 1.02: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.02
- Versión 1.01: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.01
- Versión 1.0: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.0
- Página en LLM Explorer: https://llm-explorer.com/model/Ironwood-LLM-Team%2FFirehouse-Cactus-1.0,6JUszgNx3wpJ8nGFoFKamj
- Entrada en Free2AI Tools: https://free2aitools.com/model/ironwood-llm-team/firehouse-cactus-1.02
