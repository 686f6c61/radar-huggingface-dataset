# lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx

## Resumen

Este repositorio contiene un archivo de configuración JSON para el sistema de enrutamiento `collection.router` de Lemonade, no un modelo de lenguaje en sí. La política define un filtro de privacidad que clasifica cada prompt entrante para detectar información personal identificable (PII) y, en función de ello, enruta la solicitud a un modelo local o a un modelo en la nube. El objetivo es evitar que datos sensibles salgan del entorno local cuando se utiliza un proveedor cloud.

La política se apoya en el clasificador `lemonade-sdk/openmed-privacy-filter-multilingual-v2-onnx`, que detecta 54 tipos de entidades PII (nombres, correos, teléfonos, identificadores financieros y gubernamentales, direcciones, credenciales, etc.) con un esquema de etiquetas BIOES de 216 clases. Según la model card, en el benchmark Nemotron-PII (20 000 prompts con PII) la política alcanzó una tasa de fuga del 0%, es decir, ningún prompt con PII se enrutó al candidato en la nube. Está publicada bajo licencia Apache 2.0 y se integra directamente en un servidor Lemonade en ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un policy JSON de enrutamiento) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el clasificador subyacente es multilingüe; la política no especifica idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | JSON (policy config, sin pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un archivo de configuración que define una política de enrutamiento. La arquitectura del sistema depende del clasificador `openmed-privacy-filter-multilingual-v2-onnx` (un modelo ONNX de clasificación de tokens) y del servidor Lemonade. La política especifica dos candidatos de enrutamiento: un modelo local por defecto (`Qwen3.5-0.8B-GGUF`) y un modelo en la nube (`fireworks.kimi-k2p6`). El flujo es: cada prompt pasa primero por el clasificador PII; si alguna etiqueta supera un umbral `min_score` de 0,5, la solicitud se dirige al modelo local; en caso contrario, al modelo en la nube.

Los parámetros de la política (candidatos local/cloud y umbral) son ajustables y no constituyen una arquitectura fija. La política está diseñada para usarse con el esquema de etiquetas BIOES de 217 clases del clasificador ONNX, que debe mantenerse sincronizado si se cambia de clasificador.

## Capacidades

- Enrutamiento selectivo de prompts según la presencia de PII.
- Integración con el servidor Lemonade mediante la API estándar de chat completions.
- Clasificación PII multilingüe (dependiente del modelo clasificador subyacente).
- Detección de 54 tipos de entidades sensibles, incluyendo nombres, correos electrónicos, teléfonos, identificadores financieros y gubernamentales, direcciones, atributos demográficos y credenciales.
- Umbral de decisión configurable (`min_score`) para ajustar el equilibrio entre precisión y recall.
- Soporte de múltiples candidatos de enrutamiento (local y nube) con nombres de modelo personalizables.
- Sin almacenamiento de pesos ni dependencias de inferencia en el propio repositorio.

## Casos de uso

- Atención al cliente en el sector sanitario: la política garantiza que los mensajes de pacientes que contengan datos personales (nombres, DNI, teléfonos) se procesen en un modelo local, cumpliendo con normativas de privacidad como HIPAA, mientras que consultas generales pueden delegarse a un LLM en la nube.
- Asistentes de documentación clínica: cuando un profesional redacta informes que incluyen datos de pacientes, el router desvía la solicitud al modelo local para evitar que la información sensible salga de la red del hospital.
- Búsqueda y análisis de expedientes: los prompts que recuperan información de historiales médicos se enrutan localmente, mientras que consultas administrativas no sensibles pueden usar el modelo en la nube para reducir costes.
- Desarrollo de aplicaciones de salud móviles: se puede integrar en un backend para clasificar automáticamente las consultas de usuarios y decidir si se envían a un proveedor externo o se procesan en el dispositivo.
- Cumplimiento normativo en entornos corporativos: empresas que manejan datos de clientes (banca, seguros) pueden usar este router para garantizar que ninguna consulta con PII salga de su infraestructura local.
- Evaluación de filtros de privacidad: como referencia para construir políticas de enrutamiento más complejas con múltiples clasificadores o lógica personalizada mediante la herramienta `lemonade-router-builder`.

## Benchmarks y rendimiento

En la model card se informa de un resultado en el benchmark Nemotron-PII: con 20.000 prompts que contienen PII (20.001 en total), la política obtuvo una tasa de fuga del 0%, es decir, ningún prompt con PII se enrutó al candidato en la nube. No se proporcionan métricas adicionales como precisión, recall o F1 del clasificador subyacente.

No se han publicado resultados de benchmarks comparativos con otras políticas o filtros en la información disponible.

## Requisitos de hardware

- No aplica directamente: este repositorio contiene solo un archivo de configuración JSON.
- El hardware requerido es el del servidor Lemonade y el clasificador `openmed-privacy-filter-multilingual-v2-onnx`, que se ejecuta con ONNX Runtime.
- Para el candidato local por defecto (`Qwen3.5-0.8B-GGUF`) se requiere una GPU o NPU compatible con Lemonade (se recomienda consultar los requisitos de ese modelo específico).
- El despliegue se realiza mediante Lemonade Server (servicio local) o Lemonade Embeddable, ambos disponibles para Windows, Linux y Docker.
- La política se carga con una petición `POST /v1/pull` y no requiere recursos de inferencia adicionales.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje y no hay alternativas comparables en la misma categoría (políticas de enrutamiento PII para Lemonade). El clasificador subyacente `openmed-privacy-filter-multilingual-v2-onnx` sí podría compararse con otros clasificadores PII, pero no se dispone de datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- La política depende completamente de la precisión del clasificador PII subyacente; si el clasificador no detecta una entidad, el prompt podría enrutarse a la nube con datos sensibles.
- El umbral `min_score` de 0,5 es un punto de partida; ajustes demasiado bajos pueden aumentar los falsos positivos (enrutando a local prompts no sensibles) y umbrales demasiado altos pueden aumentar el riesgo de fuga.
- La lista de etiquetas de clasificadores debe mantenerse sincronizada con el clasificador configurado; un desajuste puede provocar errores de enrutamiento.
- Los nombres de los modelos candidatos (`Qwen3.5-0.8B-GGUF`, `fireworks.kimi-k2p6`) son valores por defecto y deben apuntarse a modelos realmente registrados en el servidor.
- No se garantiza que el clasificador cubra todos los tipos de PII en todos los idiomas; el rendimiento multilingüe depende del modelo clasificador.
- La licencia Apache 2.0 permite uso comercial, pero hay que revisar la licencia de los modelos candidatos (local y nube) por separado.
- El benchmark Nemotron-PII reportado es específico de ese conjunto de datos y no debe generalizarse a otros dominios o idiomas.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/lemonade-sdk/pii_policy_openmed-privacy-filter-multilingual-v2-onnx)
- [Clasificador subyacente: openmed-privacy-filter-multilingual-v2-onnx](https://huggingface.co/lemonade-sdk/openmed-privacy-filter-multilingual-v2-onnx)
- [Modelo clasificador original en OpenMed](https://huggingface.co/OpenMed/privacy-filter-multilingual-v2)
- [Repositorio Lemonade en GitHub](https://github.com/lemonade-sdk/lemonade)
- [Proyecto OpenMed en GitHub](https://github.com/maziyarpanahi/openmed)
- [Paquete lemonade-sdk en PyPI](https://pypi.org/project/lemonade-sdk/)
- [Skill lemonade-router-builder](https://github.com/amd/skills/tree/main/skills/lemonade-router-builder)
