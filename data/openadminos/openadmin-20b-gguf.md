# OpenAdminOS/openadmin-20b-GGUF

## Resumen

OpenAdmin 20B GGUF es una cuantización en formato GGUF del modelo OpenAdmin 20B, desarrollado por OpenAdminOS, una organización que ofrece agentes de inteligencia artificial locales para administradores de Microsoft 365. El modelo está diseñado para ejecutarse en entornos locales mediante herramientas como llama.cpp, Ollama, LM Studio o la propia aplicación de escritorio OpenAdminOS, lo que permite mantener los datos sensibles del tenant en la máquina del administrador y evitar costes por token de APIs externas.

El modelo resuelve el problema de la administración de entornos Microsoft 365 (Intune, Entra, Graph API) mediante conversación natural, generando comandos, revisando cambios propuestos y asistiendo en tareas de gestión. Su relevancia actual radica en la tendencia de IA local-first aplicada a la administración de sistemas, donde la privacidad y el control de los datos son críticos. Con 20.914.757.184 parámetros totales y arquitectura MoE (mezcla de expertos) basada en la familia gpt-oss, ofrece un equilibrio entre capacidad y requisitos de hardware moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), basada en gpt-oss |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (MoE) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible indica que OpenAdmin 20B es un modelo de mezcla de expertos (MoE) en formato GGUF, derivado del modelo base OpenAdminOS/openadmin-20b, que a su vez se basa en la arquitectura gpt-oss de OpenAI. No se han publicado detalles sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización MXFP4 es un formato nativo de la familia gpt-oss, optimizado para inferencia eficiente en hardware consumer. El modelo utiliza la plantilla de chat estándar "gpt-oss harmony", incrustada en el archivo GGUF, por lo que no requiere configuración adicional.

## Capacidades

- Generación de texto conversacional, orientada a tareas de administración de Microsoft 365.
- Asistencia en la gestión de Intune y Entra, incluyendo la generación de comandos y la revisión de cambios propuestos en Graph API.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`), lo que permite su integración en servicios de API.
- Uso como agente local para aprobar cada cambio antes de aplicarlo, según la documentación de OpenAdminOS.
- Capacidad de ejecución en múltiples plataformas: llama.cpp, Ollama, LM Studio y la aplicación OpenAdminOS.
- No se especifican capacidades explícitas de tool calling, aunque su uso como agente sugiere que puede interactuar con herramientas externas.

## Casos de uso

- Asistente para administradores de Intune: el modelo puede gestionar conversaciones multi-turno para consultar el estado de dispositivos, aplicar políticas de cumplimiento o generar informes de inventario, todo mediante lenguaje natural y con la posibilidad de aprobar cada acción antes de ejecutarla.
- Gestión de identidades en Entra: ayuda a crear o modificar usuarios, asignar roles y revisar permisos, reduciendo el tiempo de tareas repetitivas y minimizando errores de configuración.
- Generación de scripts de PowerShell o comandos Graph: a partir de una descripción en lenguaje natural, el modelo produce el código necesario para automatizar operaciones sobre el tenant, que el administrador puede revisar y ejecutar.
- Revisión y aprobación de cambios en Graph API: integrado en el flujo de trabajo de OpenAdminOS, el modelo propone cambios y espera la aprobación humana, lo que añade una capa de seguridad en entornos de producción.
- Análisis de logs y diagnóstico de incidencias: el modelo puede resumir eventos de Intune o Entra, identificar patrones de error y sugerir acciones correctivas, facilitando la resolución de problemas.
- Formación y documentación: sirve como asistente para generar documentación de procedimientos, explicar conceptos de Microsoft 365 o preparar guías de administración, aprovechando su conocimiento especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo cuantizado MXFP4 tiene un tamaño aproximado de 12 GB, y según la tabla de la model card se ejecuta en máquinas con 16 GB de memoria (VRAM o RAM unificada).
- GPU recomendada: al menos 16 GB de VRAM, como una NVIDIA RTX 4080/4090, A100 o similar. También puede ejecutarse en sistemas con memoria unificada (Apple Silicon con 16 GB o más).
- Compatible con llama.cpp, Ollama, LM Studio y la aplicación OpenAdminOS, lo que permite despliegue en CPU con suficiente RAM, aunque con menor rendimiento.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

Existe otro GGUF del mismo modelo base (gpt-oss-20b) publicado por gabriellarson, sin el fine-tuning específico para administración de Microsoft 365. No se dispone de información suficiente para una comparativa detallada en términos de rendimiento o contexto. La principal diferencia es el enfoque del modelo de OpenAdminOS en tareas de IT administration, mientras que el otro es una cuantización genérica del modelo original.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| OpenAdminOS/openadmin-20b-GGUF | 20.9B | no disponible | Apache-2.0 | GGUF | Administración Microsoft 365 |
| gabriellarson/gpt-oss-20b-GGUF | 20.9B | no disponible | Apache-2.0 | GGUF | Generación de texto general |

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible.
- Al ser un modelo de 20B parámetros, puede presentar alucinaciones en contextos especializados si no se valida la salida, especialmente en tareas administrativas críticas.
- No se especifica la longitud de contexto, por lo que puede haber limitaciones en conversaciones muy largas o documentos extensos.
- Los idiomas soportados no están indicados; se asume que el modelo está entrenado principalmente en inglés, dado su enfoque en Microsoft 365.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original (gpt-oss) para confirmar restricciones adicionales.
- Para uso en producción, es imprescindible implementar mecanismos de aprobación humana de los cambios propuestos, como hace la aplicación OpenAdminOS.

## Enlaces

- HuggingFace: https://huggingface.co/OpenAdminOS/openadmin-20b-GGUF
- Sitio web de OpenAdminOS: https://www.openadminos.com/
- Repositorio GitHub: https://github.com/OpenAdminOS/OpenAdminOS/
- Modelo similar (gpt-oss-20b-GGUF): https://huggingface.co/gabriellarson/gpt-oss-20b-GGUF
