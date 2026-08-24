# ge525/Qwen3.8-9B-Distill-uncensored-heretic-Q4_K_M-GGUF

## Resumen

Qwen3.8-9B-Distill-uncensored-heretic es un modelo de lenguaje de 9 200 millones de parámetros, derivado de la serie Qwen3.5 de Alibaba y convertido a formato GGUF por el usuario ge525. Su característica principal es la eliminación completa de la censura y el alineamiento de seguridad mediante la herramienta Heretic, que aplica ablación direccional automatizada sobre los pesos del modelo original. El resultado es un modelo capaz de generar contenido sin restricciones temáticas, manteniendo capacidades de razonamiento y función-calling.

Esta ficha se centra en la versión cuantizada Q4_K_M, optimizada para ejecución eficiente en hardware de consumo mediante llama.cpp. El modelo está pensado para desarrolladores e investigadores que necesitan un LLM local sin filtros de contenido, con buen rendimiento en razonamiento y soporte de herramientas, y que priorizan la libertad creativa sobre las limitaciones de seguridad habituales en los modelos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (destilación de 9B) |
| Parametros totales | 9 197 093 888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se recomienda 2048 en la configuracion de llama-server) |
| Tipos de cuantizacion | Q4_K_M (el modelo es una conversión GGUF de este tipo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es una destilación de Qwen3.5-9B, que a su vez hereda la arquitectura transformer de la familia Qwen con attention global y grupos de capas por bloques. La destilación se realizó desde un modelo mayor de la serie Qwen3.8, reduciendo el tamaño a 9B parámetros y manteniendo las capacidades de razonamiento y function-calling de la versión original.

Sobre esta base, se aplicó la herramienta Heretic, que combina ablación direccional (también conocida como abliteration) con un optimizador de parámetros basado en TPE (Optuna). Este proceso elimina automáticamente el alineamiento de seguridad sin necesidad de entrenamiento adicional, buscando la combinación mínima de direcciones de activación que neutralizan los comportamientos de rechazo. El resultado es un modelo que responde a cualquier solicitud sin filtrar contenido, conservando la coherencia y las capacidades de razonamiento del modelo original.

## Capacidades

- Generación de texto libre sin restricciones de contenido temático, incluyendo temas que los modelos estándar rechazan.
- Razonamiento multi-step y resolución de problemas complejos, heredado de la destilación de Qwen3.5.
- Soporte de function calling / tool calling, integrable en pipelines de agentes.
- Capacidades multilingües limitadas al inglés (según la model card).
- Conversación de múltiples turnos con mantenimiento de contexto.
- Ejecución eficiente en CPU y GPU de consumo gracias a la cuantización Q4_K_M.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin alineamiento de seguridad, útil para analizar sesgos, riesgos y mecanismos de censura en sistemas de IA.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo que aborde temas controvertidos o adultos sin limitaciones impuestas por el alineamiento.
- Desarrollo de agentes con function calling: el modelo puede integrarse en sistemas de agentes que necesiten ejecutar herramientas externas (APIs, bases de datos, acciones) sin filtros de contenido en las instrucciones.
- Evaluación de robustez de sistemas de moderación: probar la eficacia de filtros de contenido y sistemas de detección de contenido generado por IA.
- Investigación en razonamiento y destilación: analizar cómo la destilación afecta las capacidades de razonamiento en modelos de 9B frente a los modelos de mayor tamaño.
- Ejecución local de un LLM sin censura en equipos con VRAM limitada (8 GB) para prototipado rápido o desarrollo de herramientas de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares en su model card. La ausencia de datos de rendimiento cuantitativos limita la comparación objetiva con otros modelos destilados de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para la cuantización Q4_K_M, dado que el modelo tiene 9.2B parámetros.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o superior, como RTX 3060, RTX 4060, RTX 3070, RTX 3080, RTX 4090, o GPUs de datacenter como A100 o H100.
- Compatible con GPUs consumer de 8 GB (RTX 3060, RTX 4060) para inferencia en tiempo real con contexto corto.
- Despliegue recomendado con llama.cpp (llama-cli, llama-server), que soporta el formato GGUF nativo. También compatible con Ollama y otros motores que usan llama.cpp.
- Latencia estimada: para un modelo de 9B en Q4_K_M en una RTX 3060, se puede esperar un throughput de 30-50 tokens por segundo. En CPU moderna (Apple M2 o AMD Ryzen 9), la velocidad baja a 5-10 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Capacidades |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-uncensored-heretic (GGUF) | 9.2B | no disponible | Apache 2.0 | GGUF | razonamiento, function calling, sin censura |
| Qwen3.5-9B-Distill (base) | 9.2B | 32K | Apache 2.0 | safetensors | razonamiento, function calling, censurado |
| Llama 3.1 8B Instruct | 8.0B | 128K | Llama 3.1 License | safetensors/GGUF | razonamiento, multilingüe, censurado |

El modelo destaca frente a Qwen3.5-9B-Distill por su ausencia de censura, pero pierde la capacidad de contexto largo (32K) que el modelo base ofrece. Comparado con Llama 3.1 8B, su contexto es menor y su licencia más permisiva (Apache 2.0 frente a Llama 3.1 License), aunque su soporte multilingüe es inferior.

## Limitaciones y advertencias

- Sesgos conocidos: al eliminar el alineamiento de seguridad, el modelo puede generar contenido dañino, ofensivo o ilegal sin filtro, lo que puede amplificar sesgos tóxicos del corpus de entrenamiento.
- Riesgo de alucinación: sin alineamiento, el modelo puede producir afirmaciones falsas con mayor confianza y sin la moderación que impone el entrenamiento de seguridad.
- Limitaciones de contexto: la longitud de contexto no está documentada, y la configuración de ejemplo usa 2048 tokens, lo que limita tareas que requieren ventanas largas.
- Idioma: solo se soporta inglés de forma oficial; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede violar términos de servicio de plataformas o leyes locales sobre contenido dañino.
- Riesgo de uso indebido: el modelo no tiene filtros de seguridad, por lo que su uso en producción sin moderación externa es altamente desaconsejado.
- Dependencia de la herramienta Heretic: la ablación direccional puede afectar la coherencia en tareas complejas de razonamiento, aunque no se dispone de benchmarks para verificar este efecto.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ge525/Qwen3.8-9B-Distill-uncensored-heretic-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Repositorio de la herramienta Heretic: https://github.com/p-e-w/heretic
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página del modelo en FriendliAI (inferencia): https://friendli.ai/models/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
