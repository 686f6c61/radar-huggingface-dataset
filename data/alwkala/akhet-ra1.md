# alwkala/Akhet-Ra1

## Resumen

Akhet-Ra1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B publicado por el usuario alwkala en Hugging Face. Se presenta como un modelo orientado a árabe e inglés, con énfasis en despliegue local ("local-first"), uso de herramientas (tool-use) y flujos agénticos conversacionales. El modelo conserva la arquitectura del Qwen3.5-4B original y sus 4.205.751.296 parámetros totales, y se distribuye bajo licencia Apache 2.0.

La relevancia del modelo radica en su enfoque: un modelo de 4B parámetros que cabe en hardware de consumo, con soporte declarado para tool calling y agentes, y una orientación explícita al árabe, un idioma con menos representación en modelos abiertos de propósito general. El repositorio incluye pesos en formato transformers y también artefactos GGUF para llama.cpp, lo que facilita su ejecución local.

El modelo está en acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. A fecha de la información disponible cuenta con 38 descargas y 2 likes, lo que indica una adopción todavía muy limitada y un ecosistema de validación externa prácticamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (artefactos incluidos en el repo); niveles concretos no disponibles |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama-cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer decoder-only del modelo base. No se dispone de información publicada sobre la composición del dataset de ajuste, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se detalla si se aplicaron métodos de alineación adicionales o si se modificó el tokenizador para reforzar el árabe.

La model card declara etiquetas de tool-use, agentes y conversación, lo que sugiere que el ajuste se orientó a esos comportamientos, pero no se aportan detalles técnicos verificables sobre el procedimiento. No hay información sobre innovaciones arquitectónicas propias: el modelo se apoya en las capacidades del base.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Soporte declarado de tool calling / function calling (según etiquetas del repositorio).
- Orientación a flujos agénticos y razonamiento multi-paso (según etiquetas).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecución local mediante llama.cpp y GGUF.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.
- Cobertura multilingüe limitada a los idiomas declarados (ar, en).

## Casos de uso

- Asistente conversacional en árabe para atención al cliente: el modelo puede mantener diálogos multi-turno en árabe e inglés, aprovechando su tamaño de 4B para despliegue en servidores modestos o incluso en local.
- Automatización de tareas con herramientas: gracias al soporte declarado de tool calling, puede integrarse en pipelines que invoquen APIs, consultas a bases de datos o funciones internas.
- Agentes locales en entornos con requisitos de privacidad: al poder ejecutarse con llama.cpp y GGUF en hardware de consumo, encaja en escenarios donde los datos no deben salir del dispositivo.
- Prototipado rápido de asistentes bilingües árabe-inglés: su licencia Apache 2.0 y su tamaño permiten iterar sin costes de licencia y con requisitos de hardware bajos.
- Generación de texto y resúmenes en árabe: útil para preprocesar o resumir documentación en árabe en flujos internos.
- Evaluación de pipelines agénticos: como modelo pequeño y abierto, sirve para probar orquestadores de agentes y herramientas antes de escalar a modelos mayores.
- Educación e investigación: base para estudiar el ajuste fino de modelos Qwen en árabe y comparar comportamientos con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara una entrada para Akhet-Ra1 con la lista de resultados vacía, por lo que no existen métricas oficiales (MMLU, HumanEval, GSM8K u otras) que permitan evaluar su rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 8-9 GB para los 4,2B parámetros, más overhead de contexto y KV cache.
- Cuantización GGUF: los artefactos incluidos permiten reducir requisitos; con cuantizaciones de 4 bits el modelo puede ocupar aproximadamente 2,5-3 GB, aunque los niveles concretos publicados no están disponibles.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para FP16; GPUs consumer con 8 GB o más para cuantizaciones de 4-5 bits.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones GGUF de 4 bits (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB).
- Opciones de despliegue: transformers, llama.cpp, Ollama (a partir de GGUF), vLLM y TGI (compatibilidad no verificada explícitamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akhet-Ra1 | 4,2B | no disponible | ar, en | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,2B | no disponible | multilingüe (según base) | según modelo base | Público en Hugging Face |
| Otros fine-tunes de 4B para árabe | variable | variable | ar, en | variable | variable |

La comparación cuantitativa con alternativas no es posible por la ausencia de benchmarks publicados. El principal punto de referencia es el propio Qwen3.5-4B, del que Akhet-Ra1 hereda arquitectura y tamaño, y frente al cual el ajuste busca mejorar el comportamiento en árabe y en tool-use.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejoras frente al modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la automatización de descargas y la reproducibilidad.
- Adopción muy baja (38 descargas, 2 likes): escasa validación por parte de la comunidad.
- Idiomas limitados a árabe e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: riesgo de comportamientos inesperados en conversaciones largas.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de razonamiento complejo.
- Posibles sesgos heredados del modelo base y del dataset de ajuste, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentación técnica exigen evaluación propia antes de producción.
- No se documentan limitaciones específicas de tool calling ni de agentes; la fiabilidad en esos flujos no está verificada.

## Enlaces

- Hugging Face: https://huggingface.co/alwkala/Akhet-Ra1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
