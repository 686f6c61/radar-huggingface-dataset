# dongguanting/ToolSpace-744B-A40B

## Resumen

ToolSpace-744B-A40B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por dongguanting, afinado a partir del backbone zai-org/GLM-5.2 y distribuido como el checkpoint oficial Atria-Dawn de liberación completa. Cuenta con 753.329.940.480 parametros totales (744B nominales) y 40B activos por token, con una longitud de contexto de 512K tokens segun la model card. Su proposito es el razonamiento de largo horizonte en entornos con herramientas: uso de funciones, encadenamiento multi-paso y ejecucion de tareas de agente en distintos entornos.

El modelo se presenta como el artefacto de evaluacion del paper *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents*, que propone la sintesis de entornos centrados en herramientas a partir de trazas de ejecucion reales. ToolSpace construye un grafo de composicion de herramientas que captura dependencias de datos, estado y reintentos, y genera tareas cross-environment mediante recorridos conscientes del estado con rollback, conservando solo trayectorias que superan verificacion basada en ejecucion.

Es relevante ahora porque el entrenamiento de agentes de largo horizonte depende criticamente de la disponibilidad de entornos y trayectorias verificables, y este checkpoint muestra mejoras sustanciales sobre su backbone GLM-5.2 en siete benchmarks de agente y uso de herramientas (promedio no ponderado de 56,6 frente a 44,6). La licencia MIT y el formato BF16 Safetensors facilitan su adopcion, aunque su tamano (1,51 TB) restringe el despliegue a infraestructura distribuida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) sobre backbone GLM-5.2; tag de transformers `glm_moe_dsa` |
| Parametros totales | 753.329.940.480 (744B nominales) |
| Parametros activos | 40B |
| Longitud de contexto | 512K tokens (segun release oficial) |
| Tipos de cuantizacion | no disponible (solo se distribuye BF16 Safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | BF16 Safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas MoE, identificada en los tags de Hugging Face como `glm_moe_dsa`, con 744B parametros totales y 40B activos por token. El backbone es GLM-5.2 de zai-org, y este repositorio distribuye el checkpoint oficial Atria-Dawn de liberacion completa, afinado para tareas de agente y uso de herramientas. La ventana de contexto es de 512K tokens, heredada del release oficial.

El entrenamiento se apoya en la metodologia ToolSpace: a partir de trazas de ejecucion reales se construye un grafo de composicion de herramientas que modela dependencias de datos, estado y reintentos; sobre ese grafo se sintetizan tareas cross-environment mediante recorridos conscientes del estado con rollback, y se conservan unicamente las trayectorias que pasan verificacion basada en ejecucion. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 512K tokens.
- Uso de herramientas y function calling, evaluado en BFCL V4 (78,4) y τ³-Bench Banking (43,3).
- Razonamiento de agente de largo horizonte con encadenamiento multi-paso y dependencias de estado.
- Ejecucion de tareas de automatizacion en entornos diversos (AutomationBench, SkillsBench, JobBench).
- Tareas de dominio profesional y legal-tecnico (Harvey LAB, OfficeQA Pro).
- Capacidad de recuperacion y reintento ante fallos de ejecucion, derivada del entrenamiento sobre trayectorias con rollback.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de flujos de trabajo empresariales: el modelo puede orquestar secuencias de llamadas a APIs y herramientas con dependencias de estado, aprovechando su entrenamiento en AutomationBench y su contexto de 512K para mantener el estado de procesos largos.
- Agentes de atencion al cliente con acceso a sistemas internos: gestiona conversaciones multi-turno y ejecuta function calling contra CRM, bases de datos de pedidos y sistemas de ticketing, con reintentos ante fallos gracias a las trayectorias con rollback del entrenamiento.
- Asistentes de codigo en pipelines de CI/CD: integrado via tool calling para consultar repositorios, ejecutar tests y proponer parches, con capacidad de razonamiento multi-paso sobre el resultado de cada herramienta.
- Analisis documental de gran volumen: su ventana de 512K permite procesar contratos, expedientes o informes extensos en una sola pasada, con resultados medidos en OfficeQA Pro (67,1).
- Automatizacion de tareas de back office y operaciones: ejecucion de procedimientos con multiples herramientas y verificacion de estado intermedio, adecuado para JobBench (57,5) y SkillsBench (67,8).
- Evaluacion y generacion de trayectorias de agente para investigacion: el checkpoint sirve como referencia para estudiar sintesis de entornos y verificacion basada en ejecucion, con codigo de evaluacion publicado en el repositorio del proyecto.
- Despliegue como backend de agentes en produccion mediante SGLang o vLLM distribuido, siguiendo la guia oficial de Atria-Dawn.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper ToolSpace. El promedio (Avg.) es la media no ponderada sobre los siete benchmarks.

| Modelo | AutomationBench | SkillsBench | JobBench | τ³-Bench Banking | BFCL V4 | Harvey LAB | OfficeQA Pro | Avg. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GLM-5.2 | 29,3 | 56,7 | 43,4 | 37,1 | 75,6 | 13,3 | 56,9 | 44,6 |
| ToolSpace-744B-A40B | 54,7 | 67,8 | 57,5 | 43,3 | 78,4 | 27,5 | 67,1 | 56,6 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el checkpoint pesa aproximadamente 1,51 TB, por lo que requiere agregado de memoria multi-GPU muy superior a 1,5 TB; no cabe en una sola GPU.
- GPU recomendadas: clusters con GPUs de datacenter (H100, H200, B200 o A100 80GB en configuracion multi-nodo); no se especifican configuraciones minimas exactas en la informacion disponible.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.) en BF16; no se han publicado cuantizaciones alternativas.
- Opciones de despliegue: SGLang o vLLM en modo distribuido, siguiendo la guia oficial de Atria-Dawn; transformers como libreria declarada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Avg. ToolSpace |
|---|---|---|---|---|---|
| ToolSpace-744B-A40B | 744B | 40B | 512K | MIT | 56,6 |
| GLM-5.2 (backbone) | no disponible | no disponible | 512K (heredado) | no disponible | 44,6 |
| ToolSpace-35B-A3B | 35B | 3B | no disponible | no disponible | no disponible |
| ToolSpace-8B | 8B | no disponible (denso) | no disponible | no disponible | no disponible |

Las variantes 8B y 35B-A3B pertenecen a la misma familia ToolSpace y se distribuyen en repositorios separados del mismo autor; sus resultados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al derivar de GLM-5.2, hereda los sesgos del backbone, no cuantificados en la informacion disponible.
- Riesgo de alucinacion: no se reportan tasas especificas; en tareas de agente el riesgo se mitiga parcialmente por la verificacion basada en ejecucion durante el entrenamiento, pero no se garantiza en inferencia.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; conviene verificar las condiciones del backbone GLM-5.2 y del checkpoint Atria-Dawn de origen.
- Requisitos de infraestructura: 1,51 TB en BF16 exigen despliegue multi-nodo; no hay cuantizaciones publicadas que reduzcan la huella.
- Contexto: los 512K tokens implican coste computacional y de memoria elevado; no se documentan estrategias de atencion eficiente especificas mas alla del tag `glm_moe_dsa`.
- Datos de entrenamiento incompletos: no se especifican tokens, composicion del dataset ni etapas de alineacion (RLHF/DPO), lo que dificulta la reproducibilidad.
- Madurez: modelo reciente (creado en octubre de 2026) con 363 descargas y 2 likes en el momento de la consulta; ecosistema de herramientas y cuantizaciones aun limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongguanting/ToolSpace-744B-A40B
- Paper: https://huggingface.co/papers/2611.05036
- Codigo: https://github.com/dongguanting/ToolSpace
- Evaluacion: https://github.com/dongguanting/ToolSpace/tree/main/evaluation
- Variante 8B: https://huggingface.co/dongguanting/ToolSpace-8B
- Variante 35B-A3B: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Checkpoint de origen Atria-Dawn: https://huggingface.co/internlm/Atria-Dawn
- Guia de despliegue de Atria-Dawn: https://huggingface.co/internlm/Atria-Dawn#-deployment--online-access
- Modelo base GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
