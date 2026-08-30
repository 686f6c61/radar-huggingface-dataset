# hanzag/Llama-3.1-8B-ERP-WHW-GGUF

## Resumen

Llama-3.1-8B-ERP-WHW-GGUF es un paquete de inferencia construido sobre el modelo base Meta-Llama-3.1-8B-Instruct, distribuido en formato GGUF con cuantización Q4_K_M. No contiene ningún fine-tuning, LoRA ni entrenamiento adicional: los pesos son exactamente los del modelo original de Meta, pero se incluye un system prompt, una plantilla de chat y parámetros de decodificación fijos que restringen el comportamiento del modelo a responder preguntas sobre procesos internos de ERP en un formato estructurado WHW (What / How / Why) y a rechazar cualquier consulta fuera de ese ámbito.

El proyecto lo publica el usuario hanzag en Hugging Face, con licencia Llama 3.1 Community License. Su relevancia radica en ofrecer una solución ligera y reproducible para desplegar un asistente de consulta de procesos ERP en entornos locales, sin necesidad de entrenar un modelo propio. Al estar empaquetado como Modelfile de Ollama, se puede integrar en pocos comandos, aunque su alcance funcional es deliberadamente limitado: solo responde en inglés y no añade conocimiento específico de ningún sistema ERP concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8 000 millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (modelo base); 4 096 tokens en la configuracion recomendada del Modelfile |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido) |
| Idiomas soportados | Ingles (configurado) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo base es Meta-Llama-3.1-8B-Instruct, un transformer autoregresivo con 8 000 millones de parametros, entrenado por Meta con datos publicos y de codigo abierto, y posteriormente ajustado con instrucciones. Este repositorio no modifica los pesos: no hay fine-tuning, LoRA ni continuacion del pretraining. La unica capa de personalizacion es un system prompt (archivo `system_prompt.txt`) que obliga al modelo a responder en formato WHW y a emitir un rechazo fijo para consultas fuera de alcance, junto con una plantilla de chat y parametros de decodificacion (temperatura 0, `num_ctx` 4096, tokens de parada) definidos en el Modelfile de Ollama.

No se proporcionan datos sobre el entrenamiento del modelo base en la informacion disponible. El conocimiento que el modelo muestra sobre procesos ERP proviene exclusivamente del pretraining de Llama 3.1, no de ningun ajuste especifico.

## Capacidades

- Generacion de texto en ingles siguiendo el formato WHW (What / How / Why) para consultas sobre procesos internos de ERP.
- Rechazo de consultas fuera del ambito ERP mediante una respuesta fija con accion bloqueada.
- Capacidad de seguir instrucciones del modelo base Llama-3.1-8B-Instruct, aunque restringida por el system prompt.
- Razonamiento y conocimiento general del modelo base, limitado por la cuantizacion Q4_K_M.
- No incluye soporte de tool calling, vision, audio ni modo agente explicito.
- No es multilingue: solo opera en ingles segun la configuracion.

## Casos de uso

- Asistente interno de consulta de procedimientos ERP: un empleado pregunta "Como creo una solicitud de compra?" y el modelo responde con los pasos en formato WHW, util para estandarizar respuestas en equipos de operaciones.
- Onboarding de nuevos empleados en sistemas ERP: el modelo puede servir como guia rapida para que personal recien incorporado consulte procesos basicos sin depender de un supervisor.
- Automatizacion de respuestas a tickets de soporte interno: integrado en un bot de Slack o Teams, responde preguntas frecuentes sobre flujos de aprobacion, pedidos o facturacion, reduciendo la carga del equipo de soporte.
- Documentacion de procesos de negocio: el formato WHW fuerza una estructura consistente que puede usarse para generar borradores de manuales de procedimientos, siempre que se verifiquen contra la documentacion oficial.
- Entorno de pruebas para evaluar el comportamiento de modelos con system prompts restrictivos: sirve como ejemplo de como configurar un LLM sin fine-tuning para tareas acotadas.
- Despliegue local en equipos con recursos limitados: al pesar ~4,6 GB en Q4_K_M, puede ejecutarse en portatiles con GPU de 6-8 GB de VRAM, ideal para demos o entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni otros tests estandar. Al tratarse de una cuantizacion Q4_K_M del modelo base, el rendimiento esperado es similar al de Llama-3.1-8B-Instruct con esa cuantizacion, pero no hay datos verificados en esta ficha.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa aproximadamente 4,6 GB, por lo que se necesita al menos 6 GB de VRAM para inferencia con contexto de 4096 tokens.
- GPU recomendadas: tarjetas consumer con 8 GB o mas, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o equivalentes de AMD con soporte Vulkan. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: Ollama (via `ollama create` con el Modelfile) y llama.cpp (con `llama-cli` y el system prompt). No se menciona soporte directo para vLLM o TGI, ya que estos no consumen GGUF de forma nativa.
- Latencia y throughput: no se proporcionan mediciones. En una GPU de gama media, se espera una generacion de 20-40 tokens por segundo con contexto corto, pero es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-ERP-WHW-GGUF (este) | 8B | 128k (base), 4k (config) | Llama 3.1 Community | GGUF Q4_K_M | Sin fine-tuning, solo prompt |
| Meta-Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community | safetensors, GGUF | Modelo original, sin restricciones de prompt |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar, sin configuracion ERP |

La comparativa es estructural, ya que no hay datos de rendimiento publicados para este paquete. La principal diferencia con el modelo base es la capa de prompt y parametros, no los pesos.

## Limitaciones y advertencias

- El rechazo de consultas fuera de alcance es solo a nivel de instruccion, no un guardrail de seguridad: puede ser evadido con ingenieria de prompt y no debe usarse como control de acceso.
- No se anade conocimiento especifico de ningun ERP: las respuestas sobre implementaciones concretas, personalizaciones o datos de una empresa seran poco fiables y deben verificarse siempre contra la documentacion oficial.
- La cuantizacion Q4_K_M reduce la calidad de generacion respecto al modelo en precision completa, lo que puede aumentar la probabilidad de errores o alucinaciones.
- Solo opera en ingles; no hay soporte para otros idiomas en la configuracion.
- La temperatura fijada en 0 reduce la varianza pero no elimina la posibilidad de respuestas incorrectas o inventadas.
- La licencia Llama 3.1 Community License exige mantener el aviso "Built with Llama" y el prefijo "Llama" en obras derivadas, ademas de cumplir la Acceptable Use Policy de Meta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hanzag/Llama-3.1-8B-ERP-WHW-GGUF
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Politica de uso aceptable de Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/USE_POLICY.md
