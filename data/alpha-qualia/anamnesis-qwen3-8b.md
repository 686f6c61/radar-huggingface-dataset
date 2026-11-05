# alpha-qualia/Anamnesis-Qwen3-8B

## Resumen

Anamnesis-Qwen3-8B es un hiperredu (hypernetwork) de tipo "writer" construido sobre la arquitectura SHINE que lee un documento de hasta 1.550 tokens y emite una LoRA de rango 8 para un Qwen3-8B congelado. El resultado es que el modelo base responde como si hubiera leído el documento, sin necesidad de incluirlo en el prompt: la memoria queda codificada en los pesos del adaptador. Lo desarrolla el investigador independiente Bohdan Agarkov (alpha-qualia) como parte del proyecto Anamnesis, con código y aplicación en github.com/keell0renz/anamnesis.

El modelo no es un LLM autónomo, sino un componente de memoria paramétrica: un writer de 4 capas, 32 cabezas y meta-rango 128 que proyecta documentos a LoRA de rango 8 sobre todas las proyecciones de atención y MLP de Qwen3-8B. Esta versión concreta parte del checkpoint MQA (una época completa) y añade 500 pasos de on-policy self-distillation (OPSD) con KL inversa, lo que mejora la precisión de recuperación de 0,278 a 0,323 y el "gain" frente al documento en prompt de 0,43 a 0,45.

Es relevante porque explora una vía distinta al RAG clásico: en lugar de recuperar y concatenar contexto en cada consulta, destila el contenido del documento en un adaptador LoRA reutilizable, con coste de inferencia nulo en tokens de contexto. La contrapartida es que la fidelidad literal es limitada y el modelo tiende a inventar detalles concretos, por lo que hoy es más adecuado para prototipos e investigación que para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hypernetwork SHINE (4 capas, 32 cabezas, meta-rango 128) que emite LoRA de rango 8 sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible (el writer es pequeño; el repo pesa 1,8 GB e incluye pesos del writer y adaptadores; el base Qwen3-8B tiene 8,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Documento de memoria: hasta 1.550 tokens Qwen3 (longitud de entrenamiento); contexto del LLM base: el de Qwen3-8B (no especificado en la información disponible) |
| Tipos de cuantizacion | No disponible (el despliegue documentado usa MLX en Apple Silicon y vLLM en NVIDIA; no se listan formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (heredados de Qwen3-8B; no se declaran explícitamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos del writer y LoRA en formato del proyecto SHINE (librería `shine`); no se especifica safetensors/GGUF en la información disponible |

## Arquitectura y entrenamiento

El sistema tiene dos piezas: un writer hiperred (4 capas, 32 cabezas, meta-rango 128) que consume el documento tokenizado y produce una LoRA de rango 8 aplicada a todas las proyecciones de atención y MLP de un Qwen3-8B congelado (commit `b968826`). El LLM base no se modifica; la "memoria" vive exclusivamente en el adaptador generado en un único forward pass del writer.

El entrenamiento es destilación offline desde un profesor in-context: el mismo Qwen3-8B con el documento en el prompt y thinking activado genera respuestas, y el estudiante (Qwen3-8B + LoRA del writer) minimiza la KL top-16 sobre los tokens del profesor. El dataset consta de 2.216 documentos de memoria (perfiles de usuario, notas de proyecto, ficheros de reglas de agentes, documentación de API privada, papers, actas de reuniones) y 67.424 conversaciones estilo agente con currículo explícito: recordar, aplicar, escribir código, invocar herramientas, decir "no lo sé" e ignorar la memoria cuando es irrelevante. Total: 101M tokens objetivo supervisados, una época en 8× H100, batch 64, secuencias empaquetadas de 32K y schedule WSD.

Sobre el checkpoint MQA (época completa) se aplican 500 pasos de OPSD: el estudiante muestrea sus propias respuestas y el profesor in-context puntúa cada token con KL inversa, LR 2e-6. Esto entrena la recuperación de los propios errores del estudiante. Frente al punto de partida mejora precisión (+0,045), recall (+0,018), factual (+0,020) y comportamiento (+0,011), todas significativas; probar KL directa o LR 1e-5 empeoró los resultados.

## Capacidades

- Generación de texto conversacional multi-turno con Qwen3-8B como base, manteniendo el modo thinking y el soporte de tool calling del modelo original.
- Memoria paramétrica de documentos: codifica el contenido, reglas y estilo de un documento de hasta 1.550 tokens en una LoRA de rango 8, sin necesidad de incluirlo en el prompt.
- Aplicación de la memoria a tareas concretas: responder preguntas, escribir código conforme a las convenciones del documento, invocar herramientas según las reglas descritas y abstenerse ("no lo sé") cuando el dato no está.
- Discriminación de relevancia: entrenado para ignorar la memoria cuando no aplica a la consulta.
- Adaptación de estilo y comportamiento: reproduce tono, reglas y convenciones del documento además de hechos.
- Escritura de código guiada por documentación de API o notas de proyecto presentes en la memoria.
- No incluye visión, audio ni modalidades adicionales.

## Casos de uso

- Memoria persistente de usuario en asistentes: generar una LoRA a partir del perfil del usuario (preferencias, historial, restricciones) y aplicarla en cada sesión sin gastar tokens de contexto en el prompt; encaja porque el perfil suele caber en 1.550 tokens y prima el "gist" sobre literales exactos.
- Agentes con fichero de reglas: destilar un `AGENTS.md` o similar en la LoRA para que el agente respete convenciones de proyecto y estilo de código de forma consistente, manteniendo el tool calling de Qwen3-8B.
- Soporte interno sobre documentación privada de API: generar adaptadores por servicio para que el modelo escriba integraciones conforme a la API, aceptando que IDs y valores exactos pueden difuminarse y deban verificarse contra la fuente.
- Prototipado de alternativas a RAG: comparar latencia y calidad frente a concatenar el documento en el prompt usando QualiaBench como referencia; útil cuando el coste por consulta o la ventana de contexto son limitantes.
- Personalización por cliente en despliegues multi-tenant: un adaptador LoRA por cliente generado offline con el writer, servido con vLLM y conmutado por petición, sin reentrenar el modelo base.
- Investigación en aprendizaje continuo y memoria paramétrica: reproducir el pipeline SHINE + OPSD con el código publicado, usando los checkpoints MQA y OPSD como línea base.
- Asistentes offline en Apple Silicon: la app del repositorio corre en MLX con 24 GB o más de memoria unificada, útil para demos locales con datos sensibles que no deben salir del dispositivo.

## Benchmarks y rendimiento

Resultados en QualiaBench (280 documentos, 2.800 preguntas, evaluación punto por punto; medias sobre documentos de 128 a 1.024 tokens). "Gain" sitúa la LoRA entre el modelo desnudo (0) y el documento en el prompt (1).

| Qwen3-8B con… | General | Factual | Recall | Precision | Gain [IC 95%] |
|---|---:|---:|---:|---:|---|
| nada (desnudo) | 0,487 | 0,151 | 0,186 | 0,376 | 0 |
| Anamnesis MQA, paso 735 | 0,624 | 0,267 | 0,370 | 0,266 | 0,40 [0,37; 0,42] |
| Anamnesis MQA, época completa | 0,635 | 0,284 | 0,394 | 0,278 | 0,43 [0,41; 0,46] |
| **Anamnesis (MQA + OPSD)** | **0,641** | **0,304** | **0,411** | **0,323** | **0,45 [0,42; 0,48]** |
| documento en el prompt | 0,817 | 0,732 | 0,831 | 0,755 | 1 |

Una LoRA generada desde un documento incorrecto puntúa igual o por debajo del modelo desnudo, lo que indica que la ganancia proviene del documento y no de una mejora genérica de calidad. El autor menciona un panel de habilidades no relacionadas (MMLU-Redux, IFEval, MATH-500) sin daño promedio, pero no publica cifras en la información disponible. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia del writer más Qwen3-8B con LoRA: el despliegue documentado requiere una GPU NVIDIA de 48 GB o más (vLLM) o un Mac Apple Silicon con 24 GB o más de memoria unificada (MLX).
- El repo ocupa 1,8 GB, pero el modelo base Qwen3-8B debe descargarse aparte; en BF16 son aproximadamente 16 GB de pesos, más overhead de KV cache y del writer.
- No se documenta despliegue en GPUs de consumo de 24 GB (RTX 4090) ni cuantizaciones GGUF; no disponible confirmación de que quepa en consumer GPU con los formatos publicados.
- Opciones de despliegue: servidor propio del proyecto (`uv run anamnesis up`, puerto 3000 para la app y 8788 para API compatible con OpenAI), vLLM en Linux y MLX en Apple Silicon. No se mencionan llama.cpp, Ollama ni TGI.
- La API compatible con OpenAI acepta los campos `"memory": "<documento>"` y `"writer_id": "<id>"` en una petición normal.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anamnesis-Qwen3-8B (MQA + OPSD) | Writer pequeño + Qwen3-8B (8,2B) | Documento de 1.550 tokens | Memoria paramétrica vía LoRA generada por hiperred | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Anamnesis-Qwen3-8B-MQA | Writer + Qwen3-8B | Documento de 1.550 tokens | Igual, sin OPSD; checkpoint previo | Apache-2.0 | Hugging Face |
| Qwen3-8B (base) | 8,2B | El de Qwen3-8B | LLM generalista sin memoria paramétrica | Apache-2.0 | Hugging Face |
| RAG clásico sobre Qwen3-8B | 8,2B + índice vectorial | Limitado por la ventana del LLM | Recuperación y concatenación en prompt | Apache-2.0 (modelo) | Ampliamente disponible |

La comparación con modelos de la misma categoría (memoria paramétrica / hiperredes) no está disponible en la información proporcionada. Frente a RAG, Anamnesis elimina el coste en tokens de contexto y la dependencia de un recuperador, pero pierde fidelidad literal: precisión 0,323 frente a 0,755 del documento en el prompt.

## Limitaciones y advertencias

- Prioriza el "gist" sobre los literales: nombres, números e IDs se difuminan primero; no es fiable para datos exactos sin verificación externa.
- Inventa detalles: la precisión (0,323) está por debajo del modelo desnudo (0,376), de modo que al recordar un tema puede rellenar especificidades erróneas con seguridad.
- La longitud perjudica: el recall cae de aproximadamente 0,54 con 128 tokens a 0,28 con 1.024; entradas por encima de 1.550 tokens quedan fuera de distribución de entrenamiento.
- Bucles de repetición: tras un detalle erróneo, una respuesta larga puede repetir una frase de la memoria; se recomienda penalización de repetición o límite de tokens.
- Un único seed de entrenamiento por checkpoint y sin ajuste de seguridad más allá del que aporta Qwen3-8B.
- Licencia Apache-2.0 permite uso comercial, pero el proyecto es investigación independiente con 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción.
- Idiomas soportados no declarados; el comportamiento multilingüe depende de Qwen3-8B y no está evaluado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpha-qualia/Anamnesis-Qwen3-8B
- Checkpoint previo MQA: https://huggingface.co/alpha-qualia/Anamnesis-Qwen3-8B-MQA
- Dataset QualiaBench: https://huggingface.co/datasets/alpha-qualia/qualiabench
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto (código, app y write-up): https://github.com/keell0renz/anamnesis
- Documentación de la API y formato de ficheros: https://github.com/keell0renz/anamnesis/blob/main/src/shine/README.md
- Arquitectura SHINE: https://github.com/MuLabPKU/SHINE
- Perfil del autor: https://github.com/keell0renz
