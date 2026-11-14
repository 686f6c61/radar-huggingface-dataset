# Flackius/Llama-Prompt-Guard-2-86M-es-co

## Resumen

Llama-Prompt-Guard-2-86M-es-co es un ajuste fino del clasificador de seguridad Llama Prompt Guard 2 86M de Meta, desarrollado por Flackius en el marco del hackatón def/acc (AI Safety Colombia × IEEE CS Uniandes) en noviembre de 2026. Su objetivo es detectar inyección indirecta de instrucciones (prompt injection) en español neutro y en español colombiano coloquial, un ámbito que el modelo base original cubre deficientemente porque fue entrenado principalmente en inglés.

El modelo parte de la arquitectura DeBERTa-v2 del Prompt Guard 2 original y se reentrena con un conjunto propio de 320 ejemplos (160 inyecciones y 160 ejemplos legítimos, en inglés, español neutro y colombiano coloquial) durante 2 épocas, en CPU sobre Oracle Cloud. La relevancia del proyecto es práctica: la evaluación sobre AgentDojo (escenario banking, 27 ataques por idioma) muestra que la detección en colombiano pasa de 0/27 a 21/27, a costa de un incremento de falsos positivos de 0/5 a 1/5.

Es un modelo de clasificación binaria (LABEL_0 = legítimo, LABEL_1 = inyección) pensado como una capa adicional de defensa en pipelines de agentes LLM, no como una defensa única. El repositorio ocupa 1,1 GB y los pesos están en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de secuencias, base de Llama Prompt Guard 2 86M) |
| Parametros totales | 278.810.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | es, en (incluye español neutro y colombiano coloquial) |
| Licencia | Llama 4 Community License (campo `license: other`, `license_name: llama4`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del clasificador Meta Llama-Prompt-Guard-2-86M, construido sobre DeBERTa-v2, que produce una clasificación binaria de la entrada: `LABEL_0` para contenido legítimo y `LABEL_1` para intento de inyección de instrucciones. No es un modelo generativo: se emplea como filtro previo o intermedio sobre prompts y contenido recuperado (por ejemplo, resultados de herramientas o documentos) antes de que lleguen al LLM del agente.

El entrenamiento se realizó con 320 ejemplos propios (160 inyecciones y 160 legítimos, en inglés, español neutro y colombiano coloquial), durante 2 épocas, en CPU sobre Oracle Cloud. No se documenta en la información disponible el uso de RLHF, DPO ni detalles adicionales sobre la composición exacta del dataset, la longitud de secuencia o hiperparámetros de entrenamiento. La innovación principal es la cobertura de variantes dialectales del español colombiano que el modelo base no detectaba.

## Capacidades

- Clasificación binaria de prompts: distingue contenido legítimo (`LABEL_0`) de intentos de inyección de instrucciones (`LABEL_1`).
- Detección de inyección indirecta de instrucciones en español neutro y español colombiano coloquial, además del inglés heredado del modelo base.
- Uso como capa de seguridad en pipelines de agentes: filtrado de prompts de usuario, de salidas de herramientas y de contenido recuperado en RAG.
- Evaluado específicamente sobre el escenario banking de AgentDojo con 27 ataques por idioma.
- No soporta generación de texto, tool calling, razonamiento multi-step ni capacidades multimodales; es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en agentes LLM: interceptar el prompt del usuario antes de enviarlo al modelo generativo y bloquear intentos de inyección en español o colombiano, aprovechando la mejora de detección de 0/27 a 21/27 medida sobre AgentDojo banking.
- Protección de pipelines RAG: clasificar documentos y fragmentos recuperados antes de insertarlos en el contexto del LLM, ya que la inyección indirecta suele llegar por contenido de terceros.
- Validación de salidas de herramientas en agentes con tool calling: comprobar las respuestas de APIs externas en busca de instrucciones maliciosas incrustadas antes de que el agente las procese.
- Moderación en aplicaciones de atención al cliente en español: añadir una capa de detección barata (278 M de parámetros) que descarte intentos de manipulación del asistente sin coste de inferencia de un LLM grande.
- Evaluación de robustez en seguridad: usar el modelo como baseline para medir la eficacia de ataques de prompt injection en español en pruebas de red teaming.
- Despliegue en entornos con recursos limitados: al ser un clasificador de 278 M de parámetros y 1,1 GB de pesos, puede ejecutarse en CPU para tareas de filtrado de alto volumen donde no hay GPU disponible.

## Benchmarks y rendimiento

| Metrica | Modelo base (Prompt Guard 2 86M) | Llama-Prompt-Guard-2-86M-es-co |
|---|---|---|
| Detección de ataques en colombiano (AgentDojo banking, 27 ataques) | 0/27 | 21/27 |
| Falsos positivos (5 ejemplos legítimos) | 0/5 | 1/5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un clasificador de 278,8 M de parámetros con pesos en safetensors (repo de 1,1 GB), la inferencia en FP32 requiere aproximadamente 1,1 GB de memoria; en FP16, alrededor de 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100 para este modelo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso puede ejecutarse en CPU, como se hizo durante el entrenamiento en Oracle Cloud.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un modelo DeBERTa-v2 en safetensors, es desplegable con Transformers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Deteccion en colombiano |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M-es-co | 278,8 M | no disponible | es, en | Llama 4 Community License | 21/27 (AgentDojo banking) |
| meta-llama/Llama-Prompt-Guard-2-86M | 86 M (según nombre) | no disponible | principalmente en | Llama 4 Community License | 0/27 (AgentDojo banking) |
| Otros clasificadores de prompt injection | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita al modelo base; no se han identificado en la información proporcionada otras alternativas comparables en español o colombiano.

## Limitaciones y advertencias

- Muestra de entrenamiento muy pequeña (320 ejemplos) y conjunto de desarrollo, según reconoce el propio autor.
- No se ha probado contra atacantes adaptativos, por lo que la robustez frente a ataques diseñados específicamente contra este clasificador es desconocida.
- Incremento de falsos positivos: 1/5 en el conjunto de evaluación, lo que puede bloquear contenido legítimo en producción.
- Debe usarse como una capa más de defensa, nunca como única medida de seguridad.
- Cobertura lingüística limitada a español (neutro y colombiano) e inglés; otros dialectos o idiomas no están evaluados.
- Licencia Llama 4 Community License: es necesario revisar `LICENSE` y `NOTICE` del repositorio antes de un uso comercial, ya que impone condiciones adicionales.
- No se documentan sesgos específicos ni comportamiento fuera del dominio de clasificación de inyecciones.
- Riesgo de alucinación no aplica directamente (es un clasificador), pero sí de clasificaciones erróneas en entradas ambiguas o fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Flackius/Llama-Prompt-Guard-2-86M-es-co
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- AgentDojo (framework de evaluación citado): no disponible en la información proporcionada
- Hackatón def/acc (AI Safety Colombia × IEEE CS Uniandes): no disponible en la información proporcionada
