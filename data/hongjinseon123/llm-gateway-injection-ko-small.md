# hongjinseon123/llm-gateway-injection-ko-small

## Resumen

`llm-gateway-injection-ko-small` es un clasificador de texto binario especializado en la detección de *prompt injection* en coreano, desarrollado por el usuario de Hugging Face hongjinseon123. Se trata de un ajuste fino (continuación del entrenamiento) del modelo `Horizon-Labs/prompt-injection-guard-small`, que a su vez se basa en la arquitectura ModernBERT. El modelo clasifica cada fragmento de entrada en una de dos etiquetas: `SAFE` (0) o `INJECTION` (1), devolviendo logits a partir de `input_ids` y `attention_mask`.

El problema que resuelve es concreto: actuar como una capa de guardia (*guardrail*) en pasarelas LLM (*LLM gateways*) que reciben tráfico en coreano. El autor lo entrena con datos del repositorio `llm-security-gateway`, y el uso previsto consiste en normalizar el texto a NFC, fragmentarlo en ventanas de 512 tokens con solapamiento y comparar la probabilidad positiva máxima contra un umbral operativo. Es relevante porque la mayoría de los clasificadores de inyección disponibles están optimizados para inglés, y este añade cobertura específica para coreano manteniendo el inglés y capacidades multilingües.

El modelo tiene 140.642.306 parámetros (unos 140,6 M), un tamaño de repositorio de 1,4 GB y se distribuye en formato safetensors y ONNX, incluyendo una variante cuantizada a INT8. La licencia es Apache-2.0, lo que facilita su integración en productos comerciales. Su naturaleza es puramente discriminativa: no genera texto, sino que puntúa la probabilidad de que una entrada contenga un intento de inyección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, clasificación de texto) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 512 tokens con solapamiento en el uso previsto; longitud de entrenamiento 256 tokens |
| Tipos de cuantizacion | INT8 (solo embeddings/Gather cuantizados), además de fp32 |
| Idiomas soportados | coreano (ko), inglés (en), multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e INT8 cuantizado) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT para clasificación de secuencias, con dos etiquetas de salida (`SAFE` e `INJECTION`) y salida en forma de logits. Se obtiene por continuación del entrenamiento del modelo base `Horizon-Labs/prompt-injection-guard-small` (commit @5ed691c2, Apache-2.0) usando los datos de `eval/injection/train/` del repositorio `llm-security-gateway`. Los datos de entrenamiento tienen 12.467 filas (SHA-256 `fdcb36ab...`) y los de validación 1.465 filas (SHA-256 `c24c5810...`).

La configuración de entrenamiento registrada es: semilla 20261104, learning rate 3e-05, batch 8×4, longitud 256, 3 épocas (la mejor fue la 3), embeddings congelados (no entrenados) y ejecución en CPU. En validación (época 3) se reporta AUC de 0,9967, recall@FPR≤1% de 0,9605 y recall específico en coreano de 0,9537. La cuantización INT8 solo afecta a las capas de embedding (Gather), siguiendo la misma configuración que el modelo base; frente a fp32, en una muestra de 200 frases la diferencia máxima de probabilidad positiva es de 0,0124 y la coincidencia de decisión con umbral 0,5 es de 1,0000. El tokenizador es el del modelo base, restaurado tras el entrenamiento (se eliminó el truncado a 256 que había quedado fijado).

## Capacidades

- Clasificación binaria de texto: distingue entre entrada segura (`SAFE`) e intento de inyección de prompt (`INJECTION`).
- Detección de *prompt injection* en coreano, con cobertura secundaria de inglés y otros idiomas (multilingüe).
- Puntuación por ventanas: permite procesar textos largos mediante ventanas de 512 tokens con solapamiento y agregación por máximo de probabilidad positiva.
- Salida de logits, lo que permite calibrar el umbral operativo según la tasa de falsos positivos tolerada.
- Ejecución en CPU: el entrenamiento y la inferencia registrados se hicieron en CPU, lo que facilita el despliegue en entornos sin GPU.
- Exportación a ONNX, incluyendo variante cuantizada INT8 para reducir requisitos de memoria.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente; es exclusivamente un clasificador.

## Casos de uso

- Guardrail en pasarela LLM para tráfico coreano: el modelo se coloca delante del LLM y clasifica cada petición entrante; si la probabilidad de `INJECTION` supera el umbral operativo definido en `detect/models.json`, la petición se bloquea o se deriva a revisión. Es adecuado porque está entrenado específicamente con datos de ese gateway y ese idioma.
- Filtrado de entradas en aplicaciones de atención al cliente: antes de enviar el mensaje del usuario al modelo generativo, se normaliza a NFC y se trocea en ventanas de 512 tokens; el máximo de probabilidad positiva decide si se permite la conversación.
- Moderación de contenido en foros y comentarios: se puede aplicar como clasificador de primera línea para detectar intentos de manipular asistentes conectados a la plataforma, con umbral ajustable según la tolerancia a falsos positivos.
- Evaluación de seguridad en pipelines de CI/CD: el modelo sirve como componente de pruebas automatizadas que verifica que las defensas de un sistema detectan inyecciones conocidas, usando los conjuntos de validación con SHA-256 registrado.
- Análisis forense de logs: se reprocesan conversaciones históricas para identificar intentos de inyección que pasaron desapercibidos, aprovechando la inferencia en CPU y el formato ONNX.
- Despliegue en dispositivos sin GPU: gracias a la variante ONNX INT8 y a sus 140,6 M de parámetros, puede ejecutarse en servidores modestos o en el borde de la red como filtro previo.
- Investigación sobre robustez de guardrails: sirve como línea base reproducible (semilla, learning rate, datos con hash) para comparar técnicas de detección de inyección en coreano.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de validación del propio autor (época 3), no comparativas con otros modelos:

| Metrica | Valor |
|---|---|
| AUC (validación) | 0,9967197945685901 |
| Recall@FPR≤1% | 0,960482985729967 |
| Recall en coreano | 0,9537275064267352 |
| Diferencia máxima de probabilidad INT8 vs fp32 (200 frases) | 0,0124 |
| Coincidencia de decisión INT8 vs fp32 (umbral 0,5) | 1,0000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 140,6 M de parámetros, en fp32 ocupa aproximadamente 0,56 GB de pesos; en INT8, alrededor de 0,14 GB. El repositorio completo pesa 1,4 GB por incluir múltiples formatos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, GTX 1660 o incluso en GPUs integradas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (variante `onnx/model.onnx` y `onnx/model_quantized.onnx`), Transformers con safetensors, y cualquier servidor de inferencia compatible con modelos de clasificación de Hugging Face. El autor documenta la implementación en `detect/classify.py` del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se ejecutó en CPU, lo que sugiere que la inferencia en CPU es viable para volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-gateway-injection-ko-small | 140,6 M | ventanas de 512 tokens | Clasificación de prompt injection (ko/en/multilingüe) | Apache-2.0 | Hugging Face, ONNX |
| Horizon-Labs/prompt-injection-guard-small (modelo base) | no disponible | no disponible | Clasificación de prompt injection | Apache-2.0 | Hugging Face |
| Clasificadores genéricos de prompt injection en inglés | no disponible | no disponible | Clasificación de prompt injection | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el ajuste adicional con datos coreanos y la validación específica en ese idioma (recall de 0,9537).

## Limitaciones y advertencias

- Es una única capa de defensa: el propio autor advierte que un atacante adaptativo puede evadir cualquier clasificador. No debe usarse como única protección.
- Riesgo de falsos positivos y falsos negativos: el umbral operativo debe calibrarse; las métricas reportadas son de validación interna, no de producción.
- Sesgo de dominio: los datos de entrenamiento provienen de un repositorio concreto (`eval/injection/train/`), por lo que el rendimiento puede degradarse en dominios o estilos de ataque no representados.
- Cobertura lingüística desigual: el foco es coreano, con inglés y multilingüe secundarios; el recall en otros idiomas no se reporta.
- Longitud limitada: el entrenamiento usó 256 tokens y el uso previsto fragmenta en ventanas de 512 tokens con solapamiento; textos muy largos requieren agregación por máximo, lo que puede diluir señales.
- Sin datos de sesgo demográfico ni de robustez frente a ataques adversariales publicados.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE con la atribución al modelo base.
- El tokenizador fue restaurado tras el entrenamiento; versiones anteriores del repositorio podrían tener un truncado a 256 fijado, por lo que conviene verificar el SHA-256 del `tokenizer.json`.
- No es un modelo generativo: no puede sustituir al LLM en tareas de respuesta, solo clasificar entradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongjinseon123/llm-gateway-injection-ko-small
- Modelo base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Repositorio del proyecto: https://github.com/hongjinkong/llm-security-gateway
- Fuentes de datos de entrenamiento: https://github.com/hongjinkong/llm-security-gateway/blob/main/eval/injection/train/SOURCES.md
- Fuentes de evaluación: https://github.com/hongjinkong/llm-security-gateway/blob/main/eval/injection/SOURCES.md
