# n0rt1o0n/kiwi-ai-7b-gguf

## Resumen

kiwi-ai-7b-gguf es un modelo de lenguaje conversacional derivado de Qwen2.5-7B-Instruct, publicado por el usuario n0rt1o0n en Hugging Face. Se distribuye exclusivamente en formato GGUF, cuantizado en Q4_K_M, y está pensado para su ejecución local mediante llama.cpp u Ollama. El ajuste fino y la conversión a GGUF se realizaron con Unsloth, según indica la model card del autor.

El modelo cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), lo que lo sitúa en la categoría de modelos de 7B-8B aptos para hardware de consumo. Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only de Qwen2 y su ventana de contexto nativa de 32.768 tokens, aunque la model card no confirma explícitamente estos datos ni documenta el proceso de ajuste.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset de ajuste, la licencia, los idiomas soportados ni resultados de evaluación. Con cero descargas y cero likes en el momento de la consulta, se trata de una publicación reciente y sin validación comunitaria. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B-Instruct, segun la model card) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la base Qwen2.5-7B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen2.5-7B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención completa, normalización RMSNorm y activación SwiGLU, entrenado originalmente por Alibaba Qwen. Sobre esa base, el autor aplicó un ajuste fino supervisado (fine-tuning) y posteriormente convirtió los pesos a GGUF mediante Unsloth, herramienta que optimiza el entrenamiento y la exportación de modelos cuantizados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO. La model card tampoco documenta hiperparámetros, duración del entrenamiento ni método de cuantización más allá del identificador Q4_K_M. No hay innovaciones técnicas destacables atribuibles al autor más allá del uso de Unsloth para acelerar el proceso.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat, con soporte de plantilla Jinja (`--jinja` en llama.cpp).
- Soporte de tool calling y function calling: la model card menciona el uso con `llama-cli --jinja`, plantilla que habilita las capacidades de herramientas de Qwen2.5.
- Capacidades multilingües: no confirmadas para este ajuste concreto; la base Qwen2.5 cubre decenas de idiomas, pero el fine-tuning pudo alterar esta cobertura.
- Modo multimodal: la model card incluye un ejemplo con `llama-mtmd-cli`, pero no se aporta ningún proyector visual ni archivo MMProj en el repositorio, por lo que la capacidad de visión no está verificada.
- No se documentan capacidades de audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local: desplegado con Ollama o llama.cpp en un equipo de sobremesa, el modelo puede mantener conversaciones multi-turno en castellano o inglés con una latencia aceptable gracias a su cuantización Q4_K_M y su tamaño de 7,6B parámetros.
- Prototipado rápido de chatbots: al incluir un Modelfile de Ollama, permite arrancar un servicio de chat en minutos sin infraestructura GPU dedicada, adecuado para validar flujos conversacionales antes de invertir en modelos mayores.
- Generación de código asistida en entornos sin conexión: la base Qwen2.5-7B-Instruct tiene competencia razonable en Python y lenguajes comunes; el ajuste GGUF permite integrarlo en editores o CLI locales sin depender de APIs externas.
- Automatización de tareas con tool calling: mediante la plantilla Jinja de llama.cpp, el modelo puede emitir llamadas a funciones estructuradas para orquestar scripts, consultas a bases de datos locales o APIs internas en pipelines de automatización.
- Procesamiento de documentos con contexto medio: si se confirma la ventana de 32.768 tokens de la base, podría resumir o extraer información de informes de hasta varias decenas de páginas en una sola pasada.
- Experimentación académica y evaluación de fine-tunings: sirve como caso de estudio de un ajuste comunitario sobre Qwen2.5, útil para investigadores que comparan derivados de la misma familia con distintas recetas de entrenamiento.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar aproximadamente 4,7 GB en disco, cabe en GPUs de 8 GB de VRAM, lo que facilita pruebas en portátiles con RTX 3060/4060.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4,5-5,5 GB con la cuantización Q4_K_M publicada (archivo de 4,7 GB en disco), más overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A100, H100). En GPUs de 8 GB puede requerir reducir el tamaño de contexto.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM. También puede ejecutarse en CPU con llama.cpp, con throughput menor.
- Opciones de despliegue: llama.cpp (`llama-cli -hf n0rt1o0n/kiwi-ai-7b-gguf --jinja`), Ollama (Modelfile incluido), y cualquier frontend compatible con GGUF (LM Studio, Jan, koboldcpp). No se documenta soporte para vLLM o TGI, que requieren pesos en safetensors.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kiwi-ai-7b-gguf | 7,6B | no disponible (base: 32.768) | no disponible | GGUF Q4_K_M | Ajuste comunitario sin evaluacion publicada |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo original de Alibaba, con benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema mas amplio |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y buen rendimiento general |

La comparación directa con el modelo base Qwen2.5-7B-Instruct es la más relevante: kiwi-ai-7b-gguf es un derivado ajustado del mismo, pero sin documentación que permita determinar si el fine-tuning mejora o degrada las capacidades originales.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste: no se puede evaluar qué sesgos se han introducido ni qué comportamientos se han reforzado.
- Riesgo de alucinación inherente a los modelos de 7B, potencialmente agravado si el fine-tuning usó datos de baja calidad o de dominio muy restringido.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. La licencia Apache 2.0 de Qwen2.5-7B-Instruct no garantiza que el autor del ajuste no haya impuesto restricciones adicionales, y su ausencia es un riesgo legal en producción.
- Idiomas soportados no confirmados: el ajuste pudo degradar el multilingüismo de la base; conviene validar el rendimiento en castellano antes de desplegar.
- Contexto efectivo desconocido: aunque la base soporta 32.768 tokens, la model card no confirma la ventana configurada en el GGUF ni si el ajuste preservó el entrenamiento en contextos largos.
- Capacidad multimodal no verificada: el ejemplo con `llama-mtmd-cli` no va acompañado de un proyector MMProj, por lo que probablemente sea una plantilla genérica de Unsloth y no una capacidad real.
- Cero validación comunitaria (0 descargas, 0 likes): no hay evidencia de que el modelo funcione según lo esperado; se recomienda evaluación exhaustiva antes de cualquier uso.
- Única cuantización disponible (Q4_K_M): no hay opciones de mayor precisión (Q8_0, F16) para evaluar la pérdida por cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/n0rt1o0n/kiwi-ai-7b-gguf
- Unsloth (herramienta de ajuste y conversión): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
