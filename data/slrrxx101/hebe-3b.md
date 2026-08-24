# slrrxx101/hebe-3b

## Resumen

El modelo **hebe-3b** es un ajuste fino (fine-tune) del modelo base Qwen2.5-Coder-3B-Instruct, convertido a formato GGUF mediante la librería Unsloth. Lo publica el usuario de HuggingFace `slrrxx101` y está pensado para su uso con `llama.cpp` y Ollama, lo que facilita su despliegue en entornos locales o de producción ligera. El modelo se distribuye únicamente en cuantización Q4_K_M, lo que lo hace adecuado para ejecutarse en hardware de consumo.

La relevancia de este modelo radica en su tamaño compacto (alrededor de 3 mil millones de parámetros) y su especialización en tareas de código, heredada de la familia Qwen2.5-Coder. Al estar disponible en GGUF, puede integrarse fácilmente en pipelines de inferencia con `llama.cpp`, Ollama o servidores compatibles con la API de OpenAI. Sin embargo, la información pública es muy limitada: no se especifican datos de entrenamiento, licencia, ni benchmarks, por lo que su evaluación debe basarse en el comportamiento del modelo base y en pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder, presumiblemente 32 768 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico archivo GGUF publicado) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-3B-Instruct, un transformer decoder-only con atención causal estándar, diseñado específicamente para generación de código y razonamiento técnico. El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento mediante técnicas de LoRA y cuantización en memoria, lo que permite adaptar modelos grandes con menos recursos. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se hizo con la propia herramienta de Unsloth, que genera archivos compatibles con `llama.cpp` y Ollama.

## Capacidades

- Generación de código en múltiples lenguajes (heredada de Qwen2.5-Coder), incluyendo Python, Java, C++, JavaScript y otros.
- Razonamiento técnico y resolución de problemas de programación.
- Conversación instructiva en formato chat, gracias a la plantilla de chat de Qwen2.5.
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada en esta versión).
- Capacidades multilingües limitadas: el modelo base Qwen2.5-Coder está entrenado principalmente en inglés y chino, con algo de soporte para otros idiomas.
- No se ha confirmado soporte multimodal, ni modo de pensamiento extendido (thinking mode).

## Casos de uso

- **Asistente de programación local**: gracias a su tamaño compacto y formato GGUF, puede ejecutarse en una laptop con GPU o incluso en CPU con `llama.cpp`, ofreciendo autocompletado y explicaciones de código sin conexión.
- **Integración en entornos de desarrollo (IDE)**: mediante servidores compatibles con la API de OpenAI (por ejemplo, con `llama.cpp` en modo servidor), puede conectarse a extensiones como Continue o Cline para asistencia en tiempo real.
- **Automatización de tareas de refactorización**: el modelo puede recibir fragmentos de código y sugerir mejoras, renombrado de variables o detección de errores comunes, aprovechando su entrenamiento en código.
- **Generación de documentación técnica**: puede redactar comentarios, docstrings y documentación de API a partir de código fuente, reduciendo el trabajo manual de los desarrolladores.
- **Chatbots de soporte técnico**: al estar ajustado para instrucciones, puede responder preguntas frecuentes sobre lenguajes de programación o frameworks, siempre que se le proporcione contexto suficiente.
- **Educación y aprendizaje**: estudiantes de programación pueden usarlo como tutor interactivo para resolver dudas, explicar conceptos o generar ejemplos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-Coder-3B-Instruct obtiene puntuaciones competitivas en HumanEval y MBPP, pero no hay datos específicos para esta versión ajustada. Se recomienda realizar pruebas propias con los conjuntos de datos habituales antes de usarlo en producción.

## Requisitos de hardware

- **VRAM estimada**: el archivo Q4_K_M ocupa aproximadamente 1,9 GB, por lo que cabe en GPUs con 4 GB de VRAM o menos. En CPU, se puede ejecutar con 4-6 GB de RAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs integradas con suficiente memoria compartida.
- **Compatibilidad con hardware de consumo**: sí, es ideal para equipos de gama media y baja.
- **Opciones de despliegue**: `llama.cpp` (CLI o servidor), Ollama (incluye Modelfile), y cualquier servidor compatible con GGUF como LM Studio o text-generation-webui.
- **Latencia y throughput**: no se han publicado datos. En una GPU moderna (RTX 3060 o superior), se espera una generación de 20-40 tokens por segundo con cuantización Q4_K_M, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hebe-3b | 3,09 B | no disponible | no disponible | GGUF | Ajuste fino de Qwen2.5-Coder-3B |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32 768 | Apache 2.0 | safetensors | Modelo base original |
| CodeLlama-7B-Instruct | 7 B | 16 384 | Llama 2 license | safetensors, GGUF | Más grande, pero con licencia restrictiva |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | 16 384 | MIT | safetensors, GGUF | Más pequeño, menos capaz |

La comparativa muestra que hebe-3b es una versión cuantizada y ajustada de un modelo ya conocido. Su principal ventaja es el formato GGUF listo para usar, pero carece de información sobre la licencia y el proceso de ajuste, lo que limita su adopción en entornos comerciales.

## Limitaciones y advertencias

- **Información insuficiente**: no se ha publicado la licencia, el dataset de entrenamiento ni los detalles del ajuste fino, lo que impide evaluar su legalidad y reproducibilidad.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar código incorrecto o respuestas inventadas, especialmente en dominios poco representados en su entrenamiento.
- **Sesgos potenciales**: al derivar de Qwen2.5-Coder, puede presentar sesgos hacia el inglés y el chino, y un rendimiento inferior en otros idiomas.
- **Contexto limitado**: aunque el modelo base soporta 32 768 tokens, no se ha confirmado que esta versión conserve esa longitud; se recomienda probar con secuencias largas.
- **Uso comercial**: al no conocerse la licencia, no se puede garantizar que sea apto para uso comercial. Se debe contactar con el autor antes de desplegarlo en producción.
- **Cuantización única**: solo se ofrece Q4_K_M, lo que puede degradar ligeramente la calidad frente a cuantizaciones más altas o al modelo original en FP16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slrrxx101/hebe-3b
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Página principal de HuggingFace: https://huggingface.co/
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
