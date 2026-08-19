# NamanAgnih0tri/AlphaRoute-0.8B-v1.0-MLX-4bit

## Resumen

AlphaRoute-0.8B-v1.0 es un modelo de lenguaje compacto especializado en routing semántico de intenciones condicionado por instrucciones y extracción de información estructurada. Desarrollado por NamanAgnih0tri, se basa en el modelo Qwen/Qwen3.5-0.8B-Base y se distribuye en formato MLX cuantizado a 4 bits, optimizado para Apple Silicon (M1/M2/M3/M4). Su propósito es actuar como un meta-router zero-shot: dado un prompt con categorías definidas dinámicamente, un esquema JSON y una consulta de usuario, predice la intención más adecuada, extrae parámetros relevantes y genera una salida JSON válida, todo en una sola pasada y sin necesidad de reentrenamiento.

El modelo resuelve el problema de los clasificadores tradicionales de intenciones, que suelen estar limitados a un conjunto fijo de clases y requieren un head de salida específico. AlphaRoute permite definir categorías arbitrarias en tiempo de ejecución, incluyendo políticas de rechazo para consultas fuera de alcance (out-of-scope), y soporta esquemas JSON anidados complejos. Con aproximadamente 118 millones de parámetros (0.8B según el autor) y un peso de 0,4 GB en su versión cuantizada, está pensado para despliegue en dispositivos edge con Apple Silicon, ofreciendo latencias inferiores a 550 ms en benchmarks publicados.

La relevancia actual del modelo radica en su combinación de tamaño reducido, capacidad de adaptación dinámica a esquemas definidos por el usuario y compatibilidad nativa con el ecosistema MLX, lo que lo convierte en una opción práctica para aplicaciones de clasificación de intenciones y extracción de entidades en entornos con recursos limitados, como asistentes virtuales, sistemas de atención al cliente o pipelines de monitorización de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B-Base) |
| Parametros totales | 117.982.016 (≈118M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only, derivado de Qwen3.5-0.8B-Base, sobre el que se ha realizado un fine-tuning específico para tareas de routing semántico de intenciones y extracción estructurada de información. La model card no proporciona detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de optimización (por ejemplo, si se empleó RLHF, DPO o supervisión directa). Se describe como un "motor semántico estructurado" entrenado para seguir esquemas JSON arbitrarios, extraer slots de parámetros y detectar consultas fuera de alcance.

La innovación principal no reside en la arquitectura base, sino en el enfoque de entrenamiento: el modelo está diseñado para operar como un meta-router zero-shot, es decir, puede adaptarse a categorías y esquemas de salida definidos dinámicamente en cada petición, sin necesidad de ajuste fino adicional. Esto se logra mediante un prompting estructurado que incluye la tarea, las categorías con descripciones semánticas, el esquema JSON de salida y ejemplos opcionales (few-shot). No se mencionan técnicas como atención lineal, decodificación especulativa u otras innovaciones arquitectónicas; el valor diferencial está en el fine-tuning orientado a la generación de JSON válido y a la robustez frente a entradas fuera del dominio.

## Capacidades

- Routing semántico de intenciones: dado un conjunto de categorías definidas por el usuario con descripciones semánticas, el modelo predice la categoría más adecuada para una consulta.
- Extracción de slots y parámetros: identifica y extrae entidades como importes, fechas, monedas, servidores, cuentas de usuario o códigos de error, integrándolas en el JSON de salida sin necesidad de un modelo NER separado.
- Generación de JSON estructurado y anidado: soporta esquemas JSON complejos con múltiples niveles, arrays de acciones y bloques de metadatos, siguiendo fielmente la estructura solicitada en el prompt.
- Detección de out-of-scope: cuando la consulta no coincide con ninguna categoría definida, el modelo devuelve `"out_of_scope": true` e `"intent": null`, evitando rutas alucinadas.
- Adaptabilidad de esquema en tiempo real: el usuario puede cambiar los nombres de campos, la estructura del JSON o las definiciones de categorías en cada petición, y el modelo se condiciona dinámicamente al nuevo esquema.
- Soporte de few-shot in-context: se pueden incluir uno o dos ejemplos en el prompt para mejorar la precisión en dominios complejos o con lógica de severidad personalizada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede clasificar consultas de usuarios en categorías como facturación, soporte técnico o seguridad de cuenta, y extraer parámetros como número de pedido o tipo de incidencia, generando un ticket JSON listo para integrarse en un CRM o sistema de ticketing. Su capacidad de definir categorías dinámicas permite adaptarse a los cambios en los servicios sin reentrenar.
- Monitorización de seguridad en infraestructura cloud: a partir de eventos de seguridad (por ejemplo, intentos de acceso no autorizado o adjuntos de políticas), AlphaRoute puede rutear el evento a la categoría correspondiente (escalada de privilegios, anomalía de presupuesto, etc.) y extraer entidades como el ARN del recurso afectado o la acción realizada, generando una alerta JSON estructurada para sistemas SIEM.
- Asistentes virtuales para operaciones de TI: el modelo puede interpretar comandos de usuario en lenguaje natural, clasificar la intención (reiniciar servicio, cambiar permisos, consultar estado) y extraer los parámetros necesarios (nombre del servicio, nombre de usuario) para ejecutar acciones vía API. Su baja latencia (sub-500 ms en Apple Silicon) lo hace apto para interacción en tiempo real.
- Clasificación de tickets en helpdesk: integrado en un pipeline de gestión de incidencias, AlphaRoute puede leer el texto del ticket, asignarlo a una categoría de soporte (hardware, software, red) y extraer campos como prioridad o afectados, produciendo un JSON que alimenta directamente el sistema de colas.
- Extracción de entidades en logs de aplicación: para análisis de logs o telemetría, el modelo puede procesar líneas de log y extraer códigos de error, direcciones IP, IDs de sesión o marcas de tiempo, siguiendo un esquema JSON definido por el desarrollador. Esto elimina la necesidad de parsers manuales o modelos NER adicionales.
- Enrutamiento de consultas en motores de búsqueda especializados: en un sistema de búsqueda vertical, AlphaRoute puede determinar la intención del usuario (búsqueda por precio, por características, por disponibilidad) y extraer filtros relevantes, generando una consulta JSON estructurada que el backend puede ejecutar directamente.

## Benchmarks y rendimiento

La model card publica resultados en tres conjuntos de datos de clasificación de intenciones, medidos con el motor MLX de referencia en Apple Silicon:

| Benchmark | Dominio | JSON válido (%) | Precisión zero-shot | Latencia media (Apple M4) |
|---|---|---|---|---|
| Banking77 (test oficial) | 77 intenciones bancarias | 100,0 | 89,60 | 524,6 ms |
| CLINC150 (test oficial + OOS) | 150 intenciones + detección OOS | 100,0 | 94,20 (recall OOS 93,6) | 550,3 ms |
| HWU64 (test oficial, 1.076 consultas) | 64 intenciones de asistente de voz | 100,0 | 80,20 | 374,6 ms (mínimo 304 ms) |

Estos datos provienen de la model card del autor y no han sido verificados externamente. No se incluyen comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB (tamaño del repositorio), por lo que cabe en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con Metal, dado que el formato MLX está optimizado para estas GPUs. No se menciona soporte para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, en Apple Silicon integrado; no se indica compatibilidad con tarjetas gráficas convencionales.
- Opciones de despliegue: mediante la librería `mlx-lm` (Python), que permite cargar y ejecutar el modelo directamente. También puede usarse con `mlx` como backend.
- Latencia y throughput: según los benchmarks, la latencia media oscila entre 374 y 550 ms en Apple M4, con mínimos de 304 ms. No se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos de routing semántico o clasificación de intenciones en la documentación proporcionada. Como referencia, el modelo base Qwen3.5-0.8B-Base es un modelo de propósito general de 0,8B parámetros, mientras que AlphaRoute es un fine-tuning especializado. Otros clasificadores de intenciones basados en transformers (por ejemplo, DistilBERT o MiniLM) suelen tener arquitecturas encoder-only y no generan JSON estructurado ni se adaptan a esquemas dinámicos. No se han encontrado datos de rendimiento comparativo en fuentes externas.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés (según la model card). No está preparado para otros idiomas sin un fine-tuning adicional.
- Tamaño reducido: con ~118M de parámetros, su capacidad de razonamiento complejo es limitada; puede fallar en tareas que requieran comprensión profunda o conocimiento extenso.
- Riesgo de alucinación en JSON: aunque la model card reporta 100% de JSON válido en los benchmarks, en escenarios con categorías ambiguas o esquemas muy complejos podría generar salidas incorrectas o campos inventados.
- Dependencia de Apple Silicon: el formato MLX 4-bit está optimizado exclusivamente para hardware Apple con Metal. No es compatible directamente con CUDA u otras plataformas, lo que limita su despliegue en entornos de servidor convencionales.
- Datos de entrenamiento no documentados: no se especifica el corpus de entrenamiento ni el método de fine-tuning, lo que dificulta evaluar posibles sesgos o la cobertura de dominios específicos.
- Benchmarks no verificados externamente: los resultados publicados provienen del autor y no han sido replicados por terceros; su validez en entornos de producción debe confirmarse con pruebas propias.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo base Qwen3.5-0.8B-Base puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NamanAgnih0tri/AlphaRoute-0.8B-v1.0-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Librería MLX: https://github.com/ml-explore/mlx (referencia para instalación y uso)
