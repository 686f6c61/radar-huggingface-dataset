# dongguanting/ToolSpace-744B-A40B

## Resumen

ToolSpace-744B-A40B es un modelo agéntico de tipo mixture-of-experts (MoE) desarrollado por dongguanting sobre el modelo base GLM-5.2 de zai-org. Con 744 mil millones de parámetros totales y 40 mil millones activos por token, está especializado en tareas de uso de herramientas (tool use), function calling y razonamiento de horizonte largo (long-horizon), un ámbito donde los modelos generalistas suelen degradarse al encadenar muchas llamadas a herramientas.

El modelo es el resultado del proyecto de investigación ToolSpace, presentado en el paper *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents*. Su metodología clave consiste en construir un grafo de composición de herramientas a partir de trazas reales de ejecución, capturando dependencias de datos, estado y reintentos, y sintetizando tareas entre entornos mediante recorridos con estado consciente y rollback, conservando solo las trayectorias que superan verificación basada en ejecución.

Es relevante ahora porque aborda uno de los cuellos de botella actuales en agentes: la escasez de datos de entrenamiento de alta calidad para interacciones multi-paso con herramientas. Los resultados publicados muestran mejoras sustanciales frente a su modelo base GLM-5.2 (56,6 de media frente a 44,6 sobre siete benchmarks agénticos). El checkpoint distribuido corresponde a la versión oficial completa de Atria-Dawn, en formato BF16 safetensors, con una longitud de contexto de 512K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa), basado en GLM-5.2 |
| Parametros totales | 753.329.940.480 (~744B) |
| Parametros activos | 40B |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | no disponible (checkpoint oficial en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16), ~1,51 TB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE derivada de GLM-5.2, con 744B de parámetros totales de los cuales solo 40B se activan por token, lo que reduce significativamente el coste de inferencia respecto a un modelo denso de tamaño equivalente. La etiqueta de arquitectura en el repositorio es `glm_moe_dsa`. La longitud de contexto de 512K tokens hereda la configuración de la versión oficial de la que procede el checkpoint.

El entrenamiento se basa en la metodología ToolSpace: se construye un grafo de composición de herramientas a partir de trazas reales de ejecución, capturando dependencias de datos, de estado y de reintentos entre herramientas. A partir de ese grafo se sintetizan tareas multi-entorno mediante recorridos (walks) conscientes del estado, con mecanismos de rollback, y se filtran las trayectorias mediante verificación basada en ejecución, conservando únicamente las que producen resultados correctos. No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Tool use y function calling: entrenado específicamente con trayectorias de composición de herramientas verificadas por ejecución.
- Razonamiento de horizonte largo (long-horizon): capaz de encadenar múltiples pasos y llamadas a herramientas manteniendo dependencias de estado y datos.
- Gestión de dependencias entre herramientas, incluyendo reintentos y rollback de estado.
- Contexto muy largo (512K tokens), adecuado para tareas agénticas con historiales extensos.
- Existen variantes más pequeñas de la familia para despliegues con recursos limitados: ToolSpace-8B y ToolSpace-35B-A3B.

## Casos de uso

- Automatización de flujos de trabajo empresariales: encadenamiento de múltiples APIs y herramientas internas con dependencias de estado, área donde el modelo mejora de 29,3 a 54,7 en AutomationBench frente a su base.
- Ejecución de tareas ofimáticas complejas: generación y manipulación de documentos, hojas de cálculo y presentaciones vía herramientas, con mejora en OfficeQA Pro (56,9 a 67,1).
- Asistentes bancarios y financieros con herramientas: el resultado en τ³-Bench Banking (43,3) indica capacidad para escenarios multi-turno con llamadas a APIs del dominio.
- Orquestación de agentes con function calling en producción: compatible con frameworks agénticos que requieren decisiones de llamada a herramientas fiables en BFCL V4 (78,4).
- Tareas legales asistidas por herramientas: mejora notable en Harvey LAB (13,3 a 27,5), útil en pipelines de investigación jurídica con herramientas de búsqueda y documentos.
- Investigación y evaluación de agentes de horizonte largo: sirve como modelo de referencia reproducible junto con el código de evaluación publicado.
- Desarrollo de agentes multi-entorno: gracias al entrenamiento con tareas sintetizadas cruzando entornos, es adecuado para orquestadores que combinan herramientas de sistemas heterogéneos.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper ToolSpace (media aritmética no ponderada sobre siete benchmarks):

| Modelo | AutomationBench | SkillsBench | JobBench | τ³-Bench Banking | BFCL V4 | Harvey LAB | OfficeQA Pro | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GLM-5.2 (base) | 29,3 | 56,7 | 43,4 | 37,1 | 75,6 | 13,3 | 56,9 | 44,6 |
| **ToolSpace-744B-A40B** | 54,7 | 67,8 | 57,5 | 43,3 | 78,4 | 27,5 | 67,1 | 56,6 |

La mayor mejora relativa se produce en AutomationBench (+25,4 puntos) y Harvey LAB (+14,2 puntos), lo que confirma que el entrenamiento con entornos sintéticos de herramientas beneficia especialmente a las tareas de automatización multi-paso.

## Requisitos de hardware

- El checkpoint completo en BF16 ocupa aproximadamente 1,51 TB, por lo que la inferencia requiere un clúster multi-nodo; una sola GPU consumer es insuficiente con diferencia.
- VRAM estimada: al menos ~1,5 TB solo para pesos en BF16, más la memoria de KV-cache para contextos largos; se recomienda infraestructura de tipo H100/B200 distribuida (por ejemplo, 20 o más GPUs H100 de 80 GB solo para cargar los pesos).
- Despliegue recomendado: servir de forma distribuida con SGLang o vLLM, siguiendo la guía oficial de Atria-Dawn y usando este repositorio como ruta del modelo.
- No hay información sobre cuantizaciones oficiales (GGUF, AWQ, GPTQ); sin cuantización, el modelo no es viable en estaciones de trabajo locales.
- Para entornos con recursos limitados, la familia ofrece ToolSpace-8B y ToolSpace-35B-A3B como alternativas mucho más ligeras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| ToolSpace-744B-A40B | ~744B | 40B | 512K | MIT | Agentes, tool use, long-horizon |
| GLM-5.2 (base) | no disponible | no disponible | no disponible | no disponible | Modelo generalista |
| ToolSpace-35B-A3B | ~35B | 3B | no disponible | MIT | Agentes, variante ligera |
| ToolSpace-8B | 8B | 8B (denso) | no disponible | MIT | Agentes, variante ligera |

Dentro de su propia familia, ToolSpace-744B-A40B es la variante de máximo rendimiento: supera a su modelo base en 12 puntos de media en los siete benchmarks agénticos. Comparativas con modelos agénticos de otros fabricantes de escala similar no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Tamaño y coste: con ~1,51 TB en BF16, el despliegue exige un clúster multi-nodo, lo que lo hace inviable para la mayoría de equipos sin infraestructura de gran escala.
- Sin cuantizaciones oficiales publicadas en la información disponible; no existe ruta clara de despliegue en hardware consumer.
- Sesgos: no documentados en la model card; al derivar de GLM-5.2, puede heredar los sesgos de su modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas agénticas con herramientas, las alucinaciones pueden propagar errores en cadena a lo largo de trayectorias multi-paso.
- Idiomas soportados: no disponibles; el modelo base GLM-5.2 es bilingüe chino-inglés, pero no hay confirmación oficial para este fine-tune.
- El repositorio tiene adopción muy temprana (200 descargas y 1 like en el momento de los datos), por lo que la madurez del ecosistema y el soporte comunitario son limitados.
- Aunque la licencia MIT permite uso comercial sin restricciones significativas, el coste operativo del modelo es el principal freno práctico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dongguanting/ToolSpace-744B-A40B
- Checkpoint oficial de referencia (Atria-Dawn): https://huggingface.co/internlm/Atria-Dawn
- Guía de despliegue oficial: https://huggingface.co/internlm/Atria-Dawn#-deployment--online-access
- Código del proyecto (GitHub): https://github.com/dongguanting/ToolSpace
- Directorio de evaluación: https://github.com/dongguanting/ToolSpace/tree/main/evaluation
- Variante 8B: https://huggingface.co/dongguanting/ToolSpace-8B
- Variante 35B-A3B: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Paper: *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents* (enlace directo no disponible)
