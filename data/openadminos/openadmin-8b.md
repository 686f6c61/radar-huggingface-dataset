# OpenAdminOS/openadmin-8b

## Resumen

OpenAdmin 8B es un modelo de lenguaje de 8.490 millones de parámetros, fine-tuneado por la comunidad OpenAdminOS a partir de Mistralai Ministral-3-8B-Instruct-2512. Está especializado en administración de Microsoft 365 —Intune, Entra y Defender— y está diseñado para ejecutarse de forma local, sin GPU, como capa de asistencia read-only para administradores de sistemas. Su objetivo principal es proporcionar respuestas fundamentadas sobre configuración de tenant, planificar llamadas a Graph API con scopes de mínimo privilegio y rechazar explícitamente peticiones destructivas, evitando alucinaciones sobre características inexistentes de los productos Microsoft.

El modelo se distribuye bajo licencia Apache 2.0, pesa 4,9 GB en cuantización Q4_K_M y funciona en equipos con 8 GB de RAM a 14-16 tokens por segundo en CPU. Forma parte de un ecosistema de dos modelos: las tareas agénticas complejas de varios pasos se escalan a OpenAdmin 20B o a un proveedor alojado. Su relevancia actual radica en la demanda de soluciones locales y privadas para administración de infraestructura cloud, evitando costes por token y manteniendo datos sensibles en la máquina del administrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Ministral-3-8B-Instruct-2512) |
| Parametros totales | 8.489.553.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 (contexto de despliegue recomendado en el ejemplo de llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (mencionado), otros formatos GGUF no especificados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Ministral-3-8B-Instruct-2512, un modelo denso de 8B parámetros con atención completa. No emplea mezcla de expertos (MoE) ni arquitecturas híbridas tipo SSM. El fine-tuning se realizó mediante supervisión (SFT) sobre un dataset sintético publicado en HuggingFace (OpenAdminOS/openadmin-sft), cuyos ejemplos fueron validados mecánicamente antes de su admisión: los manifiestos de agentes se comprueban contra el esquema JSON del producto, los planes de Graph contra una tabla de endpoints curada, y la aritmética de razonamiento sobre flotas se calcula por el generador, garantizando corrección por construcción.

El proceso de entrenamiento incluyó 16 ejecuciones, de las cuales se descartaron varios checkpoints por comportamientos indeseados: uno fabricaba documentación, otro narraba su razonamiento al usuario y un tercero respondía a una petición de borrado de 200 dispositivos con "no encuentro ese número en los datos suministrados". El checkpoint final se eligió por su equilibrio entre puntuación y fiabilidad, priorizando la abstención sobre la exactitud bruta. No se utilizaron datos de tenant, conversaciones scrapeadas ni destilación de APIs de modelos propietarios. No se menciona el uso de RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés, orientado a dominios de administración de Microsoft 365.
- Conocimiento de productos Microsoft 365: Intune, Entra (Azure AD) y Defender, incluyendo conceptos, comparativas y flujos de configuración.
- Planificación de llamadas a Graph API: genera planes de peticiones con scopes de mínimo privilegio, validados contra una tabla de endpoints curada.
- Abstención ante características inexistentes: si se pregunta por un ajuste que no existe, el modelo lo indica explícitamente en lugar de inventar valores por defecto, requisitos de licencia o rutas de portal.
- Seguridad de escritura: rechaza peticiones destructivas (borrado de dispositivos, cambios de configuración masivos) nombrando el radio de impacto y señalando el flujo de confirmación.
- Tool calling: soporta invocación de herramientas para consultas a Graph API, aunque su rendimiento en cadenas largas de herramientas es limitado.
- Respuestas directas a preguntas conceptuales: definiciones y comparativas se responden desde conocimiento; versiones y límites inciertos se difieren a documentación.
- No incluye capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de soporte para administradores de Intune: el modelo responde preguntas sobre políticas de cumplimiento, perfiles de configuración e inscripción de dispositivos, citando la documentación cuando no está seguro de versiones o límites.
- Planificación de llamadas Graph API con mínimo privilegio: un administrador describe la acción deseada (por ejemplo, listar todos los dispositivos de un grupo) y el modelo genera el endpoint, el método HTTP y los scopes OAuth necesarios, evitando permisos excesivos.
- Revisión de cambios antes de ejecutarlos: integrado en un flujo de aprobación, el modelo analiza una petición de cambio (por ejemplo, borrar 200 dispositivos) y emite un rechazo de seguridad con el radio de impacto, obligando al administrador a confirmar explícitamente.
- Consulta de documentación local: con un índice de documentación inyectado en el prompt, el modelo responde preguntas sobre configuración de Entra (conditional access, roles, etc.) sin depender de su memoria de entrenamiento.
- Formación de nuevos administradores: el modelo explica conceptos como "qué es un dispositivo híbrido unido a Azure AD" o "diferencia entre Intune y Configuration Manager" de forma directa y sin inventar detalles.
- Auditoría de políticas de Defender: el modelo ayuda a interpretar alertas y políticas de seguridad, sugiriendo scopes de consulta a Graph API para investigar incidentes sin exponer datos sensibles.
- Automatización de tareas repetitivas de consulta: mediante tool calling, el modelo puede ejecutar consultas de solo lectura contra el tenant (listar usuarios, grupos, políticas) y resumir los resultados para el administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona una suite de comportamiento propia, compuesta por 162 tareas diseñadas para evaluar abstención, seguridad de escritura, identidad, planificación de Graph y calidad de respuesta. Los resultados se muestran a continuación:

| Categoria | Tareas | Puntuacion |
|---|---|---|
| Abstención — rechaza inventar | 24 | 23 / 24 |
| Abstención — cumple contratos de respuesta exacta | 12 | 12 / 12 |
| Seguridad de escritura — con contexto | 17 | 17 / 17 |
| Seguridad de escritura — chat sin contexto | 17 | 17 / 17 |
| Identidad | 30 | 27 / 30 |
| Planificación de llamadas Graph | 32 | 27 / 32 |
| Calidad de respuesta — comparativas | 20 | 19 / 20 |
| Calidad de respuesta — manejo de datos | 10 | 8 / 10 |
| **Total** | **162** | **150 / 162** |

El autor señala que el fallo en abstención corresponde a un rechazo correcto que no coincidió con la expresión regular de validación, no a una fabricación: de las 24 sondas de características inventadas, ninguna produjo una respuesta inventada. Los fallos de identidad y manejo de datos ocurren sin system prompt; con el prompt incluido, los 16 elementos del script de humo de lanzamiento pasan correctamente. Un checkpoint con puntuación superior (154/162) fue rechazado porque tres de sus respuestas de abstención inventaban valores por defecto y requisitos de licencia.

## Requisitos de hardware

- VRAM estimada: 4,9 GB en cuantización Q4_K_M; cabe en GPUs con 6 GB o más, aunque el modelo está diseñado para CPU.
- GPU recomendada: no se requiere GPU; el autor indica que funciona en un mini-PC con 8 GB de RAM a 14-16 tokens/segundo en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 6 GB de VRAM puede ejecutarlo, pero no es el escenario principal.
- Opciones de despliegue: Ollama (comando `ollama run openadminos/openadmin-8b`) y llama.cpp (`llama-server --model openadmin-8b-Q4_K_M.gguf --ctx-size 16384 --jinja`). También puede convertirse a safetensors para usar con vLLM o TGI, aunque no está documentado oficialmente.
- Latencia y throughput: 14-16 tokens/segundo en CPU con Q4_K_M; en GPU se espera un rendimiento superior, pero no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para administración de Microsoft 365 con licencia Apache 2.0 y enfoque local-first. La comparación más directa es con el modelo base y con el modelo hermano de mayor tamaño:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAdmin 8B | 8,49B | 16.384 (recomendado) | Administración M365, read-only, local | Apache 2.0 | HuggingFace, Ollama |
| Ministral-3-8B-Instruct-2512 (base) | 8,49B | No especificado | Instrucción general | Apache 2.0 | HuggingFace |
| OpenAdmin 20B | ~20B (estimado) | No especificado | Administración M365, agéntico multi-paso | No especificado | No publicado |

El autor indica que OpenAdmin 8B es la capa local de un sistema de dos modelos; las tareas agénticas complejas se escalan a OpenAdmin 20B, que no está disponible públicamente en la información proporcionada. No hay comparativas con modelos generalistas de 8B (Llama 3.1 8B, Qwen 2.5 7B) porque el dominio es muy específico.

## Limitaciones y advertencias

- Las trayectorias agénticas multi-paso son el punto débil: en cadenas largas de uso de herramientas, el modelo está notablemente por detrás de OpenAdmin 20B. Para ese tipo de trabajo se recomienda escalar.
- No es una base de datos de documentación: los hechos provienen de recuperación en tiempo de consulta. Sin un índice de documentación en el prompt, responde desde su memoria de entrenamiento, congelada en el cutoff del modelo base. La recuperación mejora la puntuación en aproximadamente 30 tareas de la suite.
- La planificación de Graph cubre la superficie común de Intune, Entra y Defender, no toda la API de Microsoft Graph.
- Solo soporta inglés; no hay soporte multilingüe.
- Riesgo de alucinación en versiones sin system prompt: los fallos de identidad y manejo de datos ocurren sin el prompt del sistema; el prompt incluido en la imagen de Ollama es necesario para un comportamiento correcto.
- El modelo puede rechazar peticiones destructivas de forma conservadora, lo que podría bloquear acciones legítimas si no se usa el flujo de confirmación adecuado.
- No está afiliado ni respaldado por Microsoft ni Mistral AI; los nombres de productos son marcas registradas de sus respectivos propietarios.
- Para uso en producción, se recomienda validar las respuestas con un índice de documentación actualizado y un mecanismo de aprobación humana para cualquier cambio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenAdminOS/openadmin-8b
- Organización OpenAdminOS en HuggingFace: https://huggingface.co/OpenAdminOS
- Repositorio de pipeline y datos de entrenamiento: https://github.com/OpenAdminOS/OpenAdminOS/tree/main/model
- Repositorio principal de OpenAdminOS: https://github.com/OpenAdminOS/OpenAdminOS/
- Sitio web del proyecto: https://www.openadminos.com/
- Documentación oficial: https://docs.openadminos.com/
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenAdminOS/openadmin-sft
