# prane-eth/Safe-LLM

## Resumen

Safe-LLM es un modelo de lenguaje desarrollado por Praneeth Vadlapati, ingeniero de IA con certificación MIT, cuyo objetivo es actuar como una capa de guardarraíl para agentes de IA. Según la documentación del autor, el sistema clasifica las acciones de un agente en tiempo real como seguras o dañinas, permitiendo hacer cumplir políticas de privacidad de datos, seguridad, ética y cumplimiento normativo. Se trata de un modelo afinado sobre la base Cactus-Compute/needle2, con el dataset prane-eth/HarmActions, aunque no se han publicado detalles técnicos sobre la arquitectura o el entrenamiento.

El modelo se enmarca en la preocupación creciente por la fiabilidad y seguridad de los agentes autónomos basados en LLM, un tema que el autor ha abordado en sus publicaciones y blogs. Safe-LLM se presenta como una solución específica para mitigar riesgos en entornos donde los agentes interactúan con herramientas y datos sensibles. Dado que es un modelo muy reciente (creado en agosto de 2026) y con cero descargas registradas, su relevancia práctica aún está por demostrar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (no se especifica) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un fine-tuning del modelo base Cactus-Compute/needle2, y que el entrenamiento utilizó el dataset propio prane-eth/HarmActions. Este dataset, según el autor, está orientado a acciones perjudiciales de agentes, lo que sugiere que el modelo se ha entrenado para reconocer comportamientos nocivos. No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica mencionada en los proyectos del autor es el concepto de "Agent Action Guard", un marco que integra este modelo como capa de seguridad, pero no se detalla la implementación interna.

## Capacidades

- Clasificación de acciones de agentes en tiempo real como seguras o dañinas, según la descripción del proyecto "Agent Action Guard".
- Capacidad de aplicar políticas de privacidad de datos, seguridad de seguridad, restricciones éticas y cumplimiento normativo en sistemas de agentes.
- Integración como guardrail para LLM y agentes que utilizan herramientas (tool-using agents).
- No se especifican capacidades de generación de texto, razonamiento, código, matemáticas, visión, ni soporte de tool calling o function calling, ya que el modelo parece estar diseñado exclusivamente para clasificación de seguridad.

## Casos de uso

- **Guardarraíl en agentes de atención al cliente**: un agente que gestiona conversaciones con clientes puede ser supervisado por Safe-LLM para detectar si una respuesta propuesta podría violar políticas de privacidad o contener lenguaje dañino, bloqueándola antes de su envío.
- **Cumplimiento normativo en entornos financieros**: en un sistema de asesoramiento financiero automatizado, Safe-LLM puede verificar que las acciones del agente (como recomendaciones de inversión) cumplan con regulaciones locales y no induzcan a errores graves.
- **Seguridad en agentes de gestión de datos**: para agentes que acceden a bases de datos corporativas, Safe-LLM puede clasificar acciones como "acceso no autorizado" o "exfiltración de datos" y detenerlas en tiempo real.
- **Moderación de contenido en plataformas**: en un sistema de moderación asistido por IA, el modelo puede evaluar si una decisión de moderación tomada por un agente es segura y no infringe directrices de la comunidad.
- **Cumplimiento de políticas en asistentes personales**: al integrarse en asistentes que ejecutan tareas como enviar correos o acceder a calendarios, Safe-LLM puede verificar que las acciones solicitadas por el usuario no vayan contra políticas de la organización.
- **Auditoría de acciones de agentes autónomos**: en entornos de investigación donde se ejecutan agentes de forma autónoma, Safe-LLM puede registrar y clasificar cada acción para generar informes de cumplimiento y ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no ha incluido métricas de rendimiento, precisión ni comparaciones con otros modelos en la model card ni en los enlaces proporcionados.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. No se conocen los parámetros del modelo, por lo que no es posible estimar la VRAM necesaria, las GPUs recomendadas, ni las opciones de despliegue. Dado que se trata de un fine-tune de un modelo base, es probable que los requisitos sean similares a los de un modelo de tamaño medio, pero esto es especulativo y no se puede confirmar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores de seguridad para agentes). No se han encontrado referencias a otros modelos con la misma finalidad en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo es muy reciente (agosto de 2026) y no tiene descargas ni usos documentados, por lo que su eficacia en entornos reales no está validada.
- No se han publicado detalles sobre los datos de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de generalización.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero no se especifica si el modelo base (needle2) tiene restricciones adicionales que puedan afectar el uso derivado.
- El modelo se describe como un clasificador de acciones, pero no se indica su precisión, tasa de falsos positivos/negativos, ni su comportamiento ante casos límite.
- Al ser un modelo de seguridad, es crítico probarlo exhaustivamente antes de usarlo en producción; un fallo en la clasificación podría tener consecuencias graves.
- No se especifica la latencia de inferencia ni el rendimiento en entornos de tiempo real, lo cual es esencial para su uso como guardrail en sistemas interactivos.

## Enlaces

- Hugging Face: https://huggingface.co/prane-eth/Safe-LLM
- Página de papers del autor: https://prane-eth.github.io/papers/
- Página de proyectos del autor: https://prane-eth.github.io/AI-projects/
- GitHub del autor: https://github.com/prane-eth
- Blog de Hugging Face - "Agent Action Guard": https://huggingface.co/blog/prane-eth/agent-action-guard
- Blog de Hugging Face - "AI Reliability Gap": https://huggingface.co/blog/prane-eth/ai-reliability-gap
