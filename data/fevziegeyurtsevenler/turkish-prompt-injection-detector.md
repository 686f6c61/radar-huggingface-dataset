# fevziegeyurtsevenler/turkish-prompt-injection-detector

## Resumen

El modelo `fevziegeyurtsevenler/turkish-prompt-injection-detector` es un clasificador ligero y multilingüe (turco e inglés) diseñado para detectar intentos de prompt injection y jailbreak en textos dirigidos a modelos de lenguaje. Lo desarrolla Fevzi Ege Yurtsevenler bajo el proyecto AltaySec, centrado en seguridad de LLM y agentes. Este detector actúa como una primera capa de filtrado en sistemas de guardrails, identificando instrucciones maliciosas antes de que lleguen al modelo generativo.

La arquitectura combina un encoder de frases preentrenado (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) con una cabeza de regresión logística entrenada sobre un dataset propio de inyecciones y prompts benignos. El modelo es ligero, no requiere GPU para inferencia y ofrece una latencia mínima, lo que lo hace adecuado para integraciones en tiempo real. Aunque su dataset de entrenamiento es reducido (217 inyecciones y 80 prompts benignos), presenta métricas sólidas en test (F1 0.9636). Su licencia Apache-2.0 permite uso comercial sin restricciones.

La relevancia actual radica en la creciente necesidad de proteger aplicaciones LLM contra ataques de prompt injection, un vector de amenaza crítico en entornos de producción. Este modelo ofrece una solución práctica y de bajo coste para entornos multilingües, especialmente en turco, un idioma poco cubierto por herramientas similares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) + regresión logística |
| Parametros totales | No disponible (el encoder base tiene ~118M, pero no se indica el total del clasificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el encoder base soporta hasta 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Joblib (para el clasificador) y safetensors del modelo base |

## Arquitectura y entrenamiento

El modelo sigue un enfoque de dos etapas: primero, un encoder de frases multilingüe (MiniLM) convierte el texto en embeddings normalizados; segundo, una regresión logística clasifica la probabilidad de que el texto sea una inyección. No se emplean técnicas de RLHF ni DPO; el entrenamiento es supervisado sobre un dataset propio con 217 ejemplos de inyección y 80 prompts benignos en turco e inglés. La innovación principal es su simplicidad y bajo coste computacional, lo que permite desplegarlo como un filtro de primera capa sin penalizar la latencia.

## Capacidades

- Detección de prompt injection y jailbreak en texto (turco e inglés).
- Clasificación binaria con probabilidad de inyección (0-1).
- Funciona como preprocesador para sistemas de guardrails.
- No soporta tool calling ni agentes; es un modelo de clasificación de texto.
- No tiene capacidades multimodales ni de generación.
- Multilingüe limitado a turco e inglés.

## Casos de uso

- Filtro de entrada en aplicaciones de chat multilingüe: se integra como paso previo al modelo generativo para bloquear instrucciones maliciosas antes de que lleguen al LLM.
- Detección de ataques en sistemas RAG: se coloca antes de la recuperación de documentos para evitar inyecciones indirectas a través del contexto.
- Pre-flight check en pipelines de generación de código: se analiza el prompt antes de enviarlo a un modelo de código, reduciendo el riesgo de instrucciones maliciosas.
- Monitoreo de logs y red-teaming: se aplica sobre conversaciones para identificar intentos de jailbreak y evaluar la robustez de los sistemas.
- Integración en APIs de inferencia como middleware: se implementa como un servicio independiente que filtra peticiones antes de alcanzar el LLM.
- Filtrado en herramientas de procesamiento de lenguaje natural turco: dado su soporte específico para turco, es útil en aplicaciones locales que manejan ese idioma.

## Benchmarks y rendimiento

Según la model card, las métricas en el conjunto de test (n=75) son:

| Metrica | Valor |
|---|---|
| F1 | 0.9636 |
| Accuracy | 0.9467 |
| Precision | 0.9636 |
| Recall | 0.9636 |

No se han publicado comparativas con otros modelos en la información disponible. Se indica que el modelo final se entrenó con todos los datos, por lo que las métricas pueden variar ligeramente.

## Requisitos de hardware

- El modelo es extremadamente ligero: el clasificador es una regresión logística y el encoder MiniLM puede ejecutarse en CPU con menos de 500 MB de RAM.
- No requiere GPU para inferencia; se puede ejecutar en CPU de un solo núcleo sin problema.
- Para despliegue en producción, se recomienda usar un contenedor con FastAPI o Flask y cargar el modelo en memoria.
- Latencia estimada: milisegundos por petición en CPU (no hay datos exactos, pero es un modelo pequeño).
- Opciones de despliegue: Python (joblib), integración con vLLM no necesaria, se puede usar en cualquier framework que cargue modelos sklearn.

## Comparativa con modelos similares

No hay información de modelos comparables en la documentación proporcionada. Se puede mencionar que existen otros detectores de prompt injection (como los basados en LLM grandes o modelos dedicados), pero no se dispone de datos concretos para comparar. Por lo tanto, se indica "no disponible".

## Limitaciones y advertencias

- El dataset de entrenamiento es reducido (217 inyecciones), por lo que puede haber falsos negativos en ataques novedosos u ofuscados.
- Puede generar falsos positivos en textos de seguridad que citan ejemplos de ataques (por ejemplo, documentación que explica cómo inyectar).
- Solo cubre turco e inglés; no funciona con otros idiomas.
- No es una garantía de seguridad absoluta; debe combinarse con otras medidas como reglas, detección de texto invisible, sandboxing y listas de salida.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el modelo en cada caso de uso.

## Enlaces

- [Hugging Face - turkish-prompt-injection-detector](https://huggingface.co/fevziegeyurtsevenler/turkish-prompt-injection-detector)
- [Dataset de entrenamiento (multilingual-prompt-injection)](https://huggingface.co/datasets/fevziegeyurtsevenler/multilingual-prompt-injection)
- [Repositorio GitHub de uncloak (herramienta para texto invisible)](https://github.com/fevziegeyurtsevenler/uncloak)
- [Repositorio GitHub de AltaySec (LLM-Security-Turkiye)](https://github.com/fevziegeyurtsevenler/LLM-Security-Turkiye)
- [Página de AltaySec](https://altaysec.com.tr)
