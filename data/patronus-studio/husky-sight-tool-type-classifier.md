# patronus-studio/husky-sight-tool-type-classifier

## Resumen

Husky Sight Tool Type Classifier es un clasificador de texto multilingüe desarrollado por Patronus Studio, diseñado para identificar el tipo de herramienta al que se refiere una solicitud, llamada de herramienta o paso de agente en sistemas de IA. Forma parte de la familia Husky de análisis de herramientas, junto con Husky Paw (operación) y Husky Nose (propiedades de seguridad), y se integra en la pila de seguridad Patronus Protect. El modelo resuelve el problema de clasificar acciones de agentes en 14 categorías (archivos, bases de datos, APIs, shell, secrets, infraestructura, etc.), lo que permite enrutamiento de riesgos, aplicación de políticas y monitoreo en tiempo de ejecución.

Está basado en la arquitectura ModernBERT, concretamente en el modelo base jhu-clsp/mmBERT-small, con 140,6 millones de parámetros. Aunque los idiomas principales evaluados son alemán e inglés, el backbone multilingüe permite procesar otros idiomas sin validación activa. Su relevancia actual radica en la creciente necesidad de seguridad en agentes de IA y herramientas de function calling, donde la clasificación precisa del tipo de herramienta es crítica para prevenir accesos no autorizados o acciones maliciosas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small) con cabeza de clasificación de secuencia |
| Parametros totales | 140.646.926 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (ONNX), int8 e int8_int4_embeddings (versión Edge) |
| Idiomas soportados | Alemán (de), inglés (en) validados; otros idiomas no validados activamente |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, una evolución de BERT optimizada para eficiencia y rendimiento en tareas de clasificación. El backbone mmBERT-small es multilingüe y se complementa con una capa de clasificación que produce 14 etiquetas excluyentes. El entrenamiento se realizó sobre un dataset interno de Patronus, construido a partir de fuentes reales limpiadas por jueces (sin heurísticas de palabras clave) y ejemplos generados internamente, con eliminación de filas contaminadas.

Para mejorar la robustez, se aplicaron aumentaciones que incluyen variantes Unicode, ataques de homoglifos, codificaciones (como base64), envoltorios de etiquetas (User:, System:), etiquetas HTML, comentarios de código, ruido de espaciado, leetspeak y ruido de mayúsculas. También se usaron regularizadores como envoltorios de lenguaje natural, muestras contrafactuales y corpus de palabras desencadenantes, con deduplicación al 90% de similitud y guardia de fuga entre train y validación/test. Todas las aumentaciones se aplicaron por igual a ejemplos positivos y negativos para evitar sesgos superficiales.

## Capacidades

- Clasificación de texto en 14 categorías de herramientas: file, database, vcs, api, memory, messaging, web, browser, shell, code, system, secrets, infra y unknown.
- Soporte multilingüe a través del backbone mmBERT, con validación principal en alemán e inglés.
- Robustez frente a técnicas de ofuscación modernas: Unicode, homoglifos, codificaciones, etiquetas HTML, leetspeak, ruido de espaciado y mayúsculas.
- Integración sencilla con la API de transformers mediante pipeline de text-classification.
- Disponibilidad de exportaciones ONNX en FP16 y versiones cuantizadas (int8, int8_int4_embeddings) en el repositorio Edge para despliegue ligero.
- Diseñado específicamente para entornos de seguridad de agentes de IA, con capacidad de distinguir entre tipos de herramientas para políticas de aprobación y monitoreo.

## Casos de uso

- Enrutamiento de riesgo de herramientas en agentes de IA: clasificar cada llamada de herramienta en tiempo real para decidir si requiere aprobación humana, basándose en la categoría detectada (por ejemplo, acceso a secrets o infraestructura).
- Aplicación de políticas de seguridad: integrar el clasificador en un guardrail que bloquee o permita acciones según el tipo de herramienta, como impedir llamadas a shell o a bases de datos en entornos de producción.
- Monitoreo en tiempo de ejecución de agentes: registrar qué tipos de herramientas se utilizan en cada paso de un agente para auditoría y detección de comportamientos anómalos.
- Auditoría forense de logs: clasificar acciones pasadas registradas en logs para reconstruir incidentes de seguridad y analizar patrones de uso.
- Filtrado de prompts para prevenir inyecciones de herramientas: detectar si un prompt intenta inducir al agente a ejecutar comandos de shell o acceder a secrets, clasificando el contenido como `shell` o `secrets`.
- Integración con MCP (Model Context Protocol): clasificar herramientas expuestas a través de MCP para aplicar políticas de seguridad consistentes en entornos de agentes heterogéneos.
- Sandboxing de comandos: clasificar comandos de shell o código para decidir si se ejecutan en un entorno aislado o con privilegios reducidos.

## Benchmarks y rendimiento

El modelo se evaluó en un conjunto de prueba retenido de 2.914 muestras de una sola etiqueta. Los resultados publicados son:

| Metrica | Valor |
|---|---|
| Accuracy | 0,957 |
| F1 (macro) | 0,957 |
| Precision (macro) | 0,957 |
| Recall (macro) | 0,957 |

F1 por clase:

| Clase | F1 |
|---|---|
| database | 0,992 |
| secrets | 0,990 |
| messaging | 0,984 |
| infra | 0,981 |
| code | 0,981 |
| memory | 0,980 |
| browser | 0,977 |
| file | 0,975 |
| vcs | 0,974 |
| unknown | 0,938 |
| web | 0,936 |
| system | 0,904 |
| shell | 0,891 |
| api | 0,890 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Parámetros: 140,6 millones, lo que en FP32 ocupa aproximadamente 562 MB; el repositorio completo incluye también el export ONNX FP16 (más ligero).
- VRAM estimada: para FP32, alrededor de 1-2 GB; para FP16 ONNX, menos de 1 GB. Cabe en GPUs de consumo como RTX 3060 o superiores, e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para despliegue en edge, la versión cuantizada int8 puede ejecutarse en CPU sin problema.
- Opciones de despliegue: transformers (Python), ONNX Runtime con optimum, y la versión Edge para entornos ligeros. No se mencionan integraciones con vLLM o TGI, aunque al ser un modelo de clasificación pequeño, podría servirse con soluciones estándar.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros clasificadores de tipos de herramientas. La familia Husky (Paw y Nose) cubre aspectos complementarios: Husky Paw clasifica la operación (read, write, list, exec, network) y Husky Nose detecta propiedades de flujo de datos (source:sensitive, source:untrusted, sink:external). No se conocen modelos equivalentes de otros proveedores con la misma especialización y licencia abierta.

## Limitaciones y advertencias

- Sesgos de idioma: entrenado y validado principalmente en alemán e inglés; otros idiomas pueden producir resultados menos fiables.
- Riesgo de falsos positivos y negativos: la clasificación describe una propiedad aparente de la entrada, no prueba que la acción se haya ejecutado.
- No rastrea el flujo de información entre múltiples pasos de un agente; solo analiza cada llamada de forma independiente.
- Para enforcement de alto impacto, se recomienda combinar el modelo con políticas deterministas y umbrales calibrados.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo no debe usarse como única barrera de seguridad en sistemas críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/patronus-studio/husky-sight-tool-type-classifier
- Versión Edge (cuantizada): https://huggingface.co/patronus-studio/husky-sight-tool-type-classifier-edge
- Husky Paw (clasificador de operación): https://huggingface.co/patronus-studio/husky-paw-tool-action-classifier
- Husky Nose (clasificador de propiedades de seguridad): https://huggingface.co/patronus-studio/husky-nose-tool-security-properties-classifier
- Blog de Patronus sobre el zoo de modelos de seguridad: https://patronus.studio/posts/our-ai-security-model-zoo-is-now-open-source
- Repositorio GitHub de Patronus Security: https://github.com/patronus-protect/patronus-security
