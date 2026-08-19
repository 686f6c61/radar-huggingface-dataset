# kontext-security/Kestrel

## Resumen

Kestrel es un clasificador compacto y local diseñado para evaluar el riesgo de seguridad de comandos Bash individuales en el contexto de agentes de IA que ejecutan herramientas de shell. Desarrollado por kontext-security, una plataforma de seguridad de identidad para agentes de IA, el modelo se publica como un artefacto JSON portable (version 0.1.0) y no como un checkpoint de Transformers convencional. Su propósito es proporcionar una señal de riesgo contextualmente independiente que pueda integrarse como capa adicional bajo protecciones deterministas y políticas de autorización en tiempo de ejecucion.

El modelo resuelve un problema concreto: la evaluacion rapida y ligera de comandos shell que un agente de IA pretende ejecutar, sin depender de contexto de usuario, tarea o sesion. Esto es relevante porque los agentes de IA cada vez ejecutan mas comandos en entornos de produccion, y necesitan una primera linea de defensa que clasifique si un comando es potencialmente peligroso. Kestrel se distribuye como un unico archivo `classifier.json` con su checksum SHA-256, y no incluye codigo de entrenamiento ni datos de entrenamiento publicados.

Su relevancia actual radica en que aborda la seguridad de agentes de IA desde una perspectiva practica y ligera: no requiere GPU ni infraestructura compleja, puede ejecutarse en cualquier entorno Python y se integra facilmente en pipelines de agentes mediante `huggingface_hub`. Las metricas publicadas en el benchmark ShellRisk-Bench v0.1 muestran una precision de 0.947, recall de 0.922 y F1 de 0.934, aunque el propio autor advierte que se trata de un holdout dentro de la misma distribucion y no evidencia de transferencia a otros dialectos de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto JSON portable, no es un checkpoint de Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (clasifica comandos individuales, sin contexto de sesion) |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos neuronales) |
| Idiomas soportados | no disponible (se centra en comandos Bash, no en lenguaje natural) |
| Licencia | other (restricciones no especificadas en la model card) |
| Formato de pesos | JSON portable (`classifier.json`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo, los datos de entrenamiento ni el proceso de entrenamiento. La model card indica explicitamente que el repositorio no incluye codigo de entrenamiento, datos de entrenamiento ni una receta detallada de entrenamiento. El artefacto se publica como un JSON portable, lo que sugiere que podria tratarse de un modelo clasico de aprendizaje automatico (por ejemplo, regresion logistica, arboles de decision o un ensemble) serializado en formato JSON, en lugar de una red neuronal profunda. Sin embargo, esta es una especulacion; los detalles tecnicos no estan disponibles.

La evaluacion se realizo sobre el conjunto de test de ShellRisk-Bench v0.1, un benchmark de codigo abierto mantenido por kontext-security que proporciona una particion fija, metodologia de evaluacion, prompts, scorer y resultados agregados. El test split es un holdout dentro de la misma distribucion, lo que limita la generalizacion a otros estilos de comandos o dialectos de shell.

## Capacidades

- Clasificacion binaria de riesgo de comandos Bash: determina si un comando shell individual presenta riesgo de seguridad o riesgo de sistema.
- Evaluacion sin contexto: analiza cada comando de forma aislada, sin depender de informacion de usuario, tarea o sesion.
- Integracion ligera: al ser un artefacto JSON, puede cargarse en cualquier entorno Python sin dependencias de deep learning.
- Compatible con `huggingface_hub`: se descarga directamente mediante `hf_hub_download`.
- Disenado como capa de seguridad complementaria: no pretende ser la unica decision de autorizacion, sino una senal adicional bajo protecciones deterministas.
- Enfoque en Bash: cubre comandos shell, no otros lenguajes de scripting ni comandos de PowerShell.

## Casos de uso

- Control de ejecucion de comandos en agentes de IA: un agente que ejecuta comandos Bash puede consultar a Kestrel antes de ejecutar cada comando; si el clasificador indica alto riesgo, el agente puede bloquear la ejecucion o solicitar aprobacion humana. Es adecuado porque es ligero y no anade latencia significativa.
- Pipeline de seguridad en CI/CD: en un entorno de integracion continua donde se ejecutan scripts de despliegue, Kestrel puede analizar cada comando antes de que se ejecute, detectando posibles intentos de exfiltracion de datos o modificacion de archivos criticos.
- Monitorizacion de sesiones de shell en herramientas de administracion remota: herramientas como bastion hosts o plataformas de acceso privilegiado pueden integrar Kestrel para clasificar comandos en tiempo real y alertar sobre actividades sospechosas.
- Auditoria de acciones de agentes autonomos: cuando un agente de IA realiza tareas de administracion de sistemas, Kestrel puede generar un registro de riesgo por cada comando ejecutado, facilitando la auditoria posterior y el cumplimiento normativo.
- Filtrado de comandos en entornos de desarrollo: un IDE o terminal inteligente que sugiere comandos puede usar Kestrel para advertir al desarrollador si un comando propuesto es potencialmente peligroso, como `rm -rf /` o `curl | sh`.
- Evaluacion de prompts de ingenieria inversa: en entornos de red team, Kestrel puede analizar comandos generados por agentes adversarios para evaluar su peligrosidad y clasificarlos segun su nivel de amenaza.

## Benchmarks y rendimiento

Segun la model card, Kestrel fue evaluado en el test split de ShellRisk-Bench v0.1. Los resultados publicados son:

| Metrica | Valor |
|---|---|
| Precision | 0.947 |
| Recall | 0.922 |
| F1 | 0.934 |

Estos resultados corresponden a un holdout dentro de la misma distribucion (same-source, in-distribution). El autor advierte explicitamente que no son evidencia de transferencia a un dialecto de comandos novedoso. No se han publicado comparaciones con otros clasificadores de riesgo de comandos Bash en la informacion disponible.

## Requisitos de hardware

- Al ser un artefacto JSON, no requiere GPU ni hardware especializado. Puede ejecutarse en cualquier CPU, incluso en entornos embebidos o funciones serverless.
- No se requiere VRAM para inferencia.
- La carga del modelo es instantanea (un unico archivo JSON), por lo que la latencia de clasificacion es minima, del orden de milisegundos.
- Compatible con cualquier runtime de Python que soporte `huggingface_hub` y procesamiento de JSON.
- No se han publicado requisitos de memoria, pero al ser un archivo JSON, el uso de RAM es despreciable.
- Opciones de despliegue: puede integrarse en un microservicio, en una funcion Lambda, en un script local o en un pipeline de agente existente. No requiere servidores de inferencia como vLLM o TGI.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores de riesgo de comandos Bash). No se han encontrado alternativas publicas con caracteristicas similares en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo evalua cada comando de forma aislada, sin contexto de usuario, tarea o sesion. No infiere intencion y no puede tomar una decision de autorizacion completa.
- No es adecuado como unico control de seguridad: debe usarse como una senal complementaria bajo protecciones deterministas y politica de autorizacion en tiempo de ejecucion.
- Los resultados de evaluacion se basan en un holdout dentro de la misma distribucion; no hay evidencia de transferencia a otros dialectos de comandos o estilos de scripting.
- La licencia es "other", lo que implica restricciones no especificadas. Se debe revisar cuidadosamente antes de su uso comercial o redistribucion.
- No se incluyen datos de entrenamiento ni codigo de entrenamiento, lo que impide auditar el proceso de desarrollo o reproducir el modelo.
- Solo cubre comandos Bash; no es aplicable a otros shells (PowerShell, zsh con extensiones, etc.) ni a comandos de sistemas no Unix.
- No se proporciona informacion sobre posibles sesgos en los datos de entrenamiento ni sobre el riesgo de falsos positivos o falsos negativos en escenarios especificos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kontext-security/Kestrel
- Repositorio de evaluacion ShellRisk-Bench: https://github.com/kontext-security/shellrisk-bench
- Dataset ShellRisk-Bench: https://huggingface.co/datasets/kontext-security/ShellRisk-Bench
- Organizacion kontext-security en GitHub: https://github.com/kontext-security
- Proyecto kontext-cli (seguridad en tiempo de ejecucion para agentes): https://github.com/kontext-security/kontext-cli
