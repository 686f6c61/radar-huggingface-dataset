# hermitdave/K2-Horizon-MoVA-36B-A4B-MLX-8bit

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de mezcla de expertos (MoE) sparse desarrollado por IFM Team, publicado bajo licencia Apache-2.0. Utiliza una innovadora atención denominada Mixture-of-Values (MoVA), que combina la eficiencia de un modelo sparse con una ventana de contexto nativa de 512.000 tokens. Con 36.000 millones de parámetros totales y solo 4.000 millones activos por token, ofrece un rendimiento cercano a modelos frontera con un coste computacional mucho menor. Esta ficha se centra en la conversión a MLX en cuantización 8-bit realizada por hermitdave, optimizada para ejecución en Apple Silicon mediante mlx-lm.

El modelo destaca en tareas agénticas y de razonamiento, como se refleja en sus resultados en Terminal-Bench 2.1 (58,6) y GPQA Diamond (80,8). Es especialmente relevante para desarrolladores que buscan desplegar modelos de alto rendimiento en hardware local con memoria unificada, manteniendo una licencia permisiva que permite uso comercial. La conversión MLX 8-bit conserva una calidad cercana a la pérdida nula según el autor, lo que lo convierte en una opción atractiva para entornos de producción en ecosistemas Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atencion Mixture-of-Values (MoVA) |
| Parametros totales | 37.444.792.020 |
| Parametros activos | Aproximadamente 4.000 millones |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantizacion | oQ4e, 6-bit y 8-bit (este repositorio es 8-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

K2-Horizon-MoVA-36B-A4B combina una arquitectura de transformer con un diseño de mezcla de expertos (MoE) sparse. La innovacion principal es la atencion Mixture-of-Values (MoVA), que sustituye la atencion densa convencional por un mecanismo que selecciona de forma dinamica un subconjunto de valores por token. Esto permite reducir el coste computacional sin sacrificar la capacidad de modelado de dependencias largas. Con 36B de parametros totales, solo se activan aproximadamente 4B por token, lo que acerca su eficiencia a modelos mucho mas pequenos.

Los datos de entrenamiento, la composicion del dataset, la cantidad de tokens y la existencia de fases de RLHF o DPO no se han publicado en la informacion disponible. El modelo esta pensado como un modelo de razonamiento, y el autor recomienda utilizar `reasoning_effort="high"` para obtener los mejores resultados. Esta version concreta es una conversion a formato MLX realizada con `mlx-lm` y `oMLX`, manteniendo la arquitectura original y los pesos del modelo base de IFM.

## Capacidades

- Generacion de texto y razonamiento complejo, con resultados destacados en benchmarks de ciencia a nivel de posgrado (GPQA Diamond: 80,8).
- Uso agente de herramientas (tool calling), validado en el benchmark tau3-Banking con una puntuacion de 26,8.
- Uso agente de terminal, con un resultado de 58,6 en Terminal-Bench 2.1, lo que indica capacidad para ejecutar comandos y resolver tareas en entornos de linea de comandos.
- Razonamiento de contexto largo, con una puntuacion de 66,3 en AA-LCR, un benchmark especifico de razonamiento sobre contextos extensos.
- Soporte de agentes y razonamiento multi-paso, gracias a su combinacion de MoE y MoVA y a su ventana de contexto de 512K tokens.
- Modo de razonamiento explicito: puede generar contenido de razonamiento separado de la respuesta final cuando se activa `reasoning_effort="high"`.
- No se han documentado capacidades de vision o audio en la informacion proporcionada.

## Casos de uso

- Asistentes de terminal automatizados: el modelo puede ejecutar comandos, interpretar salidas y resolver tareas administrativas en servidores, gracias a su rendimiento en Terminal-Bench 2.1 y su soporte de tool calling.
- Atencion al cliente con contexto largo: su ventana de 512.000 tokens permite mantener conversaciones multi-turno extensas, incluyendo historiales completos de tickets y documentos adjuntos, sin perder informacion relevante.
- Razonamiento cientifico y tecnico: con una puntuacion de 80,8 en GPQA Diamond, es adecuado para asistir en investigacion, revision de literatura y resolucion de problemas en fisica, quimica o biologia.
- Analisis de documentos legales o financieros: la combinacion de contexto largo y razonamiento estructurado permite procesar contratos, informes y bases documentales extensas, extrayendo conclusiones y generando resumenes.
- Agentes de automatizacion de flujos de trabajo: puede integrarse en pipelines que requieren llamadas a herramientas externas, como APIs, bases de datos o sistemas de gestion, gestionando multiples pasos de forma autonoma.
- Despliegue local en entornos Apple Silicon: la version MLX esta optimizada para Macs con memoria unificada, permitiendo ejecutar un modelo de 36B con calidad cercana a la no cuantizada en equipos de 64 GB o mas, sin depender de servicios en la nube.
- Generacion de codigo asistida por agentes: su capacidad de razonamiento y uso de terminal lo hace util para revisar, depurar y ejecutar codigo en entornos de desarrollo integrados.

## Benchmarks y rendimiento

| Benchmark | K2-Horizon-MoVA-36B-A4B |
|---|---|
| tau3-Banking (Agentic tool use) | 26,8 |
| Terminal-Bench 2.1 (Agentic terminal use) | 58,6 |
| GPQA Diamond (Graduate-level science QA) | 80,8 |
| AA-LCR (Long-context reasoning) | 66,3 |

Los resultados corresponden al modelo base original. La cuantizacion MLX 8-bit es descrita por el autor como cercana a la perdida nula, por lo que se espera una degradacion minima del rendimiento, aunque no se han publicado benchmarks especificos de esta version cuantizada. No se han proporcionado datos comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- La version 8-bit ocupa aproximadamente 40 GB en disco y requiere un dispositivo Apple Silicon con al menos 64 GB de memoria unificada, segun la model card.
- Las variantes alternativas del mismo autor incluyen oQ4e (~21 GB) y 6-bit (~28 GB), que permiten ejecutar el modelo en Macs con menos memoria.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada suficiente. No es compatible con GPU NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` para generacion directa desde linea de comandos, o servidor compatible con OpenAI API mediante `mlx-lm.server` o herramientas similares.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks de modelos comparables. El blog de IFM indica que K2-Horizon-MoVA-36B-A4B alcanza casi el rendimiento del modelo denso K2-Horizon-32B activando solo 4.000 millones de parametros. No se dispone de datos de especificaciones del modelo 32B mas alla de esta afirmacion.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B | ~4B | 512K | Apache-2.0 |
| K2-Horizon-32B (dense) | no disponible | no disponible | no disponible | Apache-2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de alucinacion; como todo modelo de lenguaje generativo, debe validarse en entornos de produccion.
- Limitaciones de idioma: no se ha publicado la lista de idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- La version 8-bit requiere un hardware Apple Silicon con al menos 64 GB de RAM, lo que limita su despliegue a equipos de gama alta o a entornos con memoria unificada.
- Los benchmarks publicados corresponden al modelo base; la cuantizacion puede introducir pequenas diferencias de rendimiento, aunque el autor la describe como cercana a la perdida nula.
- No se han documentado capacidades multimodales, por lo que no debe usarse para tareas de vision, audio o video.
- Es un modelo de razonamiento y el autor recomienda activar `reasoning_effort="high"` para obtener resultados optimos; si se omite, la calidad puede degradarse.
- La licencia Apache-2.0 permite uso comercial, pero se deben mantener los avisos de copyright y licencia en las redistribuciones.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/hermitdave/K2-Horizon-MoVA-36B-A4B-MLX-8bit
- Modelo base en HuggingFace: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2/
- Ficha de Benchgen con benchmarks y contexto: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
