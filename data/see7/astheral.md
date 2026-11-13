# SEE7/Astheral

## Resumen

Astheral (nombre distribuido: Llama-3.1-Astheral) es un ajuste fino experimental de tipo asistente desarrollado por SEE7 a partir de NousResearch/DeepHermes-3-Llama-3-8B-Preview, que a su vez se apoya en Meta Llama 3.1 8B. No se trata de un modelo preentrenado desde cero: el repositorio contiene los pesos fusionados resultantes de un entrenamiento LoRA de rango 16 sobre las proyecciones de atención, junto con el adaptador LoRA guardado por separado. El objetivo declarado es adaptar un modelo de 8B a respuestas concisas, formatos de salida solicitados, código sencillo, roleplay ficticio y explicaciones legítimas de administración de redes.

La relevancia del modelo es limitada y fundamentalmente metodológica: el autor publica de forma transparente el conjunto de entrenamiento sintético (345 ejemplos), la validación (32 ejemplos), la configuración, los logs del entrenador y las salidas crudas de la evaluación, lo que permite auditar el run completo. El modelo conserva los dos modos del upstream DeepHermes (Instruct y Thinking), seleccionables mediante convención de system prompt, no mediante una API dedicada como la de Qwen.

Conviene subrayar que el propio autor advierte de que las mejoras de capacidad deben evaluarse a partir de los resultados registrados y no darse por supuestas: el conocimiento general, la mayor parte de la capacidad de código y el razonamiento proceden de DeepHermes y de Llama. El entrenamiento se realizó en una única A100-SXM4-80GB con 88 pasos de optimizador y solo valida ejemplos cortos, por lo que el rendimiento en contexto largo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino LoRA rango 16 sobre proyecciones de atención |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | La configuración upstream permite contexto largo; el fine-tune solo se entrenó con ejemplos cortos y no valida rendimiento en contexto largo (longitud exacta no disponible) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en BF16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (se incluyen LICENSE de Llama 3.1 y UPSTREAM_LLAMA3_LICENSE del upstream) |
| Formato de pesos | safetensors (pesos fusionados) más adaptador LoRA separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.1 con 8.030.261.248 parámetros, derivado por fine-tuning de NousResearch/DeepHermes-3-Llama-3-8B-Preview (revisión 53d902c7dcfa4c749a3b455149064f82af2e2549), cuyo base declarado es Meta Llama 3.1 8B. El ajuste consiste en LoRA de rango 16 aplicado a las proyecciones de atención, entrenado sobre un dataset sintético pequeño incluido en el repositorio que cubre respuestas concisas, formatos de salida solicitados, declaraciones honestas de capacidad, código simple, roleplay ficticio, explicaciones de administración de redes y aritmética con soluciones breves.

El run registrado se ejecutó en una NVIDIA A100-SXM4-80GB con 345 ejemplos de entrenamiento, 32 de validación y 88 pasos de optimizador; la pérdida de validación pasó de 2,6547 a 0,0081. No se documenta el número de tokens de entrenamiento ni el uso de RLHF o DPO. La innovación destacable no es arquitectónica sino de reproducibilidad: se publican train.py, train.jsonl, validation.jsonl, settings.json, trainer_log.json, evaluation.json, base_outputs.json, astheral_outputs.json y reload_smoke_test.json, de modo que el run completo es auditable. El modo Thinking no es una API nativa: es una convención aprendida de system prompt heredada del upstream que puede no seguirse con precisión.

## Capacidades

- Generación de texto conversacional en modo Instruct, con respuestas directas.
- Modo Thinking heredado de DeepHermes, activado mediante system prompt, para razonamiento explícito paso a paso.
- Aritmética básica y soluciones breves trabajadas (el autor documenta un fallo en el problema de conteo agrupado: devolvió 9 en lugar de 18).
- Generación de código sencillo: la muestra de función mediana superó seis comprobaciones funcionales remotas (longitud par/impar, valores negativos, singleton, duplicados y error con entrada vacía).
- Cumplimiento de formatos de salida solicitados, con al menos un fallo documentado en el caso de formato de dos líneas.
- Roleplay ficticio y explicaciones de administración de redes legítima.
- Declaraciones honestas de capacidad (el modelo puede indicar sus propias limitaciones).
- Personalización mediante la opción --system del script de inferencia, que sustituye las instrucciones por defecto.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés declarado.
- Vision, audio o modalidades adicionales: no disponible.

## Casos de uso

- Asistente conversacional de propósito general en inglés: el modelo puede mantener diálogos multi-turno en modo Instruct, adecuado para prototipos y demos donde se requiere un 8B ligero con pesos abiertos y licencia Llama 3.1.
- Razonamiento explícito supervisado: el modo Thinking permite obtener cadenas de razonamiento visibles para depuración de pipelines o para tareas educativas, con la advertencia de que el cambio de modo es una convención de system prompt y no una API garantizada.
- Generación de código sencillo en herramientas internas: útil para producir funciones cortas y autocontenidas (como la función mediana validada), no para refactorizaciones complejas ni bases de código extensas.
- Formateo estructurado de respuestas: el ajuste entrena el cumplimiento de formatos solicitados (listas, respuestas concisas), lo que lo hace apropiado para tareas de extracción o resumen con formato fijo, verificando siempre la salida por el fallo documentado en el caso de dos líneas.
- Roleplay y generación creativa controlada: el dataset incluye roleplay ficticio, por lo que puede emplearse en prototipos de personajes o narrativa interactiva en inglés.
- Explicaciones técnicas de administración de redes: el modelo fue ajustado con ejemplos de explicaciones legítimas de administración de sistemas, útil como asistente de documentación técnica interna.
- Evaluación y auditoría de fine-tunes: dado que el repositorio publica dataset, configuración, logs y salidas crudas, sirve como caso de estudio reproducible para investigadores que quieran replicar o comparar pipelines LoRA sobre Llama 3.1 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta una suite automática estrecha y sintética:

| Metrica | Base (DeepHermes 3 8B Preview) | Astheral |
|---|---|---|
| Comprobaciones automáticas comparables | 2/8 | 6/8 |
| Pérdida de validación (antes / después) | 2,6547 | 0,0081 |
| Problema de conteo agrupado | no disponible | fallo (devolvió 9 en lugar de 18) |
| Formato de dos líneas | no disponible | fallo |
| Función mediana (comprobaciones funcionales remotas) | no disponible | 6/6 superadas |
| Presupuesto de generación | 256 tokens (instruct) / 512 (thinking) | 256 tokens (instruct) / 512 (thinking) |

El propio autor advierte de que dos respuestas del modelo base en modo Thinking agotaron el presupuesto antes de terminar, por lo que el 2/8 frente a 6/8 mide únicamente las comprobaciones específicas dentro de ese presupuesto y no una ganancia general de razonamiento. La identidad se comprobó por separado y se excluyó del cómputo comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 requieren aproximadamente 16 GB más memoria de runtime; el autor recomienda una GPU remota de 24 GB o más para contextos modestos.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (la usada en el entrenamiento) u H100 para despliegues con contexto amplio; RTX 4090 (24 GB) es suficiente para BF16 en contextos cortos.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más en BF16 (RTX 4090, RTX 3090); en tarjetas de 16 GB requeriría cuantización, que no está documentada en el repositorio.
- Opciones de despliegue: transformers con el script inference.py incluido; el tag text-generation-inference sugiere compatibilidad con TGI y endpoints_compatible. No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEE7/Astheral | 8,03 B | Configuración upstream larga; no validado en el fine-tune | Suite estrecha 6/8; sin benchmarks estándar | llama3.1 | Hugging Face, 0 descargas |
| NousResearch/DeepHermes-3-Llama-3-8B-Preview | no disponible en la información | no disponible | Base del fine-tune; 2/8 en la misma suite estrecha | llama3 | Hugging Face (upstream) |
| Meta Llama 3.1 8B | no disponible en la información | no disponible | Base declarado del upstream; sin datos en esta ficha | llama3.1 | Hugging Face (upstream) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la relación de derivación y a la licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Llama 3.1 y DeepHermes, hereda los sesgos de sus datos de preentrenamiento, no evaluados en este run.
- Riesgo de alucinación: no cuantificado; el ajuste se realizó sobre 345 ejemplos sintéticos y no incluye evaluación de factualidad.
- El modo Thinking es una convención de system prompt aprendida y puede no seguirse con precisión; no equivale a una API de razonamiento dedicada.
- El fine-tune solo se entrenó con ejemplos cortos: el rendimiento en contexto largo no está validado pese a que la configuración upstream lo permita.
- Solo inglés declarado; sin capacidades multilingües verificadas.
- El autor no establece capacidad frontier, superioridad general, eliminación de todos los rechazos aprendidos ni una política de seguridad completa.
- Fallos documentados y publicados: conteo agrupado (devolvió 9 en lugar de 18) y formato de dos líneas.
- La comparación 2/8 frente a 6/8 está limitada por el presupuesto de tokens (256 instruct / 512 thinking) y no mide una ganancia general de razonamiento.
- Restricciones de licencia: licencia llama3.1 con los términos upstream aplicables; el repositorio incluye ambas licencias (Llama 3.1 y Llama 3 del upstream) sin conceder derechos adicionales. Revisar NOTICE antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; no hay validación por parte de la comunidad.
- El modelo base upstream declara licencia llama3 mientras su base declarada es Llama 3.1, una discrepancia de metadatos que el autor conserva explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SEE7/Astheral
- Modelo base: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Revisión del modelo base citada: 53d902c7dcfa4c749a3b455149064f82af2e2549
