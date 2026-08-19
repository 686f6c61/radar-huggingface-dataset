# InternScience/Agents-A1

## Resumen

Agents-A1 es un modelo agéntico de 35 mil millones de parámetros con arquitectura Mixture-of-Experts (MoE), desarrollado por InternScience. Está diseñado para escalar el horizonte de razonamiento agéntico en lugar de escalar el número de parámetros, alcanzando un rendimiento comparable al de modelos de escala de billones de parámetros en tareas de búsqueda de largo horizonte, ingeniería, investigación científica, seguimiento de instrucciones y uso de herramientas. El modelo integra capacidades de visión (image-text-to-text) y se distribuye bajo licencia Apache-2.0.

El entrenamiento sigue un paradigma de tres etapas: ajuste fino supervisado en dominios completos, entrenamiento de modelos profesor por dominio y destilación on-policy multi-profesor con optimización consciente de la heterogeneidad. Además, utiliza una infraestructura de conocimiento-acción anclada al dominio que convierte el proceso del agente en un objetivo entrenable. El modelo se publicó el 22 de junio de 2026 y ha recibido 630 likes y casi 20 000 descargas en HuggingFace.

La relevancia actual de Agents-A1 reside en su capacidad para ejecutar tareas agénticas complejas con una huella de parámetros relativamente pequeña, lo que permite desplegar sistemas de razonamiento avanzado en hardware más accesible que el requerido por los modelos frontera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), variante qwen3_5_moe, con componentes de visión |
| Parametros totales | 35 107 181 936 (35B) |
| Parametros activos | 3B (según la denominación 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen versiones cuantizadas en la colección oficial y de mlx-community) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

Agents-A1 es un modelo MoE con 35B parámetros totales y aproximadamente 3B activos por token, lo que reduce significativamente el coste de inferencia frente a modelos densos de tamaño similar. Incorpora un codificador visual para entrada de imágenes, lo que lo convierte en un modelo multimodal. La arquitectura base deriva de la familia Qwen3.5 MoE, aunque con modificaciones específicas para el entrenamiento agéntico.

El entrenamiento se organiza en tres fases. Primera, un ajuste fino supervisado en todos los dominios para alinear el modelo base con comportamientos agénticos generales. Segunda, el entrenamiento de modelos profesor especializados por dominio, que capturan experiencia concreta en búsqueda, ingeniería, ciencia y otras áreas. Tercera, una destilación on-policy multi-profesor con optimización de heterogeneidad, que mejora la transferencia de conocimiento entre dominios. Además, se emplea una infraestructura de conocimiento-acción que construye acciones, observaciones y resultados de verificadores de forma conjunta, convirtiendo el proceso del agente en un objetivo entrenable.

## Capacidades

- Razonamiento agéntico: descompone tareas complejas en sub-pasos ejecutables, planifica con antelación y adapta la estrategia según resultados intermedios.
- Uso de herramientas: soporte nativo de function calling e integración con APIs, intérpretes de código, motores de búsqueda y otras herramientas externas.
- Razonamiento científico y profesional: resolución de problemas científicos con integración de herramientas y respuesta a preguntas de conocimiento profesional.
- Seguimiento de instrucciones: cumple instrucciones detalladas con múltiples restricciones en diversos dominios.
- Capacidades multimodales: procesa entrada de imágenes junto con texto (etiqueta image-text-to-text).
- Búsqueda de largo horizonte: navega y sintetiza información en tareas que requieren múltiples pasos de búsqueda y razonamiento.

## Casos de uso

- Búsqueda avanzada en la web: el modelo puede realizar búsquedas de largo horizonte, consultando múltiples fuentes, evaluando resultados intermedios y refinando consultas hasta obtener una respuesta sintetizada. Es adecuado para investigación de mercado o análisis de competencia.
- Asistente de ingeniería de software: integrado en un IDE o pipeline de CI/CD, Agents-A1 puede descomponer tareas de programación, generar código, ejecutar pruebas y corregir errores mediante tool calling con intérpretes y repositorios.
- Investigación científica asistida: el modelo combina razonamiento con herramientas de cálculo simbólico, bases de datos bibliográficas y simuladores, facilitando la revisión de literatura, la formulación de hipótesis y la validación experimental.
- Atención al cliente automatizada: con su capacidad de seguimiento de instrucciones y uso de herramientas, puede gestionar conversaciones multi-turno que requieran consultar sistemas externos (CRM, bases de conocimiento) y ejecutar acciones (crear tickets, actualizar pedidos).
- Análisis de documentos multimodales: al aceptar imágenes, puede extraer información de gráficos, diagramas y capturas de pantalla dentro de un flujo agéntico, por ejemplo, para auditoría de informes financieros.
- Agente de automatización de tareas ofimáticas: puede interactuar con APIs de hojas de cálculo, calendarios y correo electrónico para programar reuniones, generar informes y enviar comunicaciones, siguiendo instrucciones complejas con restricciones temporales y de formato.

## Benchmarks y rendimiento

Según la model card, Agents-A1 obtiene resultados competitivos frente a sistemas de mayor escala como GPT-5.5, DeepSeek-V4-pro y Kimi-K2.6. La siguiente tabla recoge los valores publicados:

| Benchmark | Resultado |
|---|---|
| Seal-0 | 56.4 |
| HiPhO | 46.4 |
| FrontierScience-Olympiad | 79.0 |
| FrontierScience-Research | 40.00 |
| IFBench | 80.6 |
| IFEval | 94.8 |
| BrowseComp | 75.5 |
| XBench-DS-2510 | 86.0 |
| GAIA | 96.0 |
| SciCode | 44.3 |
| HLE with tools | 47.6 |
| MolBench-bind | 56.8 |

El modelo logra el mejor resultado global (SOTA) en Seal-0, HiPhO, FrontierScience-Olympiad, FrontierScience-Research, IFBench e IFEval, y el mejor entre modelos comparables (~35B) en BrowseComp, XBench-DS-2510, GAIA, SciCode, HLE with tools y MolBench-bind. No se dispone de comparativas detalladas con otros modelos de su misma clase en la información proporcionada.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM para Agents-A1 en la información disponible.
- El repositorio de pesos ocupa 70.2 GB en formato safetensors, lo que indica que la inferencia en precisión completa requiere al menos esa cantidad de memoria, más overhead de activaciones.
- Al ser un MoE con 3B parámetros activos, el coste de cómputo por token es bajo en comparación con un modelo denso de 35B, pero la memoria necesaria para cargar todos los expertos es elevada.
- Se recomienda, de forma orientativa, una GPU con al menos 80 GB de VRAM (A100, H100) para ejecutar el modelo en bf16 sin cuantización. Con cuantización a 4 bits, podría caber en GPUs consumer de 24 GB, aunque no hay datos oficiales que lo confirmen.
- El modelo es compatible con Transformers, vLLM y SGLang, lo que permite despliegue en servidores con múltiples GPUs y batching dinámico.
- Existen versiones cuantizadas publicadas por InternScience y por mlx-community, esta última orientada a ejecución en Mac con Metal (MLX).

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables de la misma clase (~35B) en los datos proporcionados. La model card menciona comparaciones con GPT-5.5, DeepSeek-V4-pro y Kimi-K2.6, pero estos son modelos de escala mucho mayor (probablemente cientos de miles de millones de parámetros), por lo que no constituyen una comparativa directa en términos de tamaño. No se han encontrado datos de modelos MoE de 35B con capacidades agénticas similares en la información disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, toxicidad o alucinación en la información disponible.
- Al ser un modelo agéntico, puede generar secuencias de acciones largas que requieran verificación externa; los resultados intermedios deben validarse antes de ejecutar acciones críticas.
- La longitud de contexto no está especificada, por lo que no se conoce el límite máximo de tokens de entrada para tareas de búsqueda o razonamiento extenso.
- Los idiomas soportados no están documentados; se recomienda probar el modelo en el idioma de destino antes de usarlo en producción.
- El uso de la licencia Apache-2.0 permite uso comercial sin restricciones de atribución, pero el modelo se distribuye tal cual, sin garantías de precisión o seguridad.
- El tamaño del repositorio (70.2 GB) implica costes de almacenamiento y transferencia considerables para despliegues locales.

## Enlaces

- [HuggingFace - InternScience/Agents-A1](https://huggingface.co/InternScience/Agents-A1)
- [Homepage del proyecto](https://internscience.github.io/Agents-A1/)
- [Technical Report (arXiv:2606.30616)](https://arxiv.org/abs/2606.30616)
- [Repositorio GitHub](https://github.com/InternScience/Agents-A1)
- [ModelScope - InternScience/Agents-A1](https://modelscope.cn/models/InternScience/Agents-A1)
- [Colección Agents-A1 en HuggingFace (versiones cuantizadas)](https://huggingface.co/collections/InternScience/agents-a1)
- [Colección mlx-community Agents-A1 (cuantizaciones para Mac)](https://huggingface.co/collections/mlx-community/agents-a1)
