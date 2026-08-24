# chayanchauhan/ParcelPilot_Assistant

## Resumen

ParcelPilot_Assistant es un proyecto de aplicación de chatbot de soporte al cliente para la plataforma ficticia de logística ParcelPilot, desarrollado por chayanchauhan como parte de una evaluación técnica para el puesto de AI Engineer en CalQuity. No se trata de un modelo de IA open source, sino de una aplicación completa construida con Streamlit y el modelo propietario `gpt-4o-mini` de OpenAI, que integra un agente con tool calling para responder preguntas sobre pedidos, cancelaciones, créditos de servicio y políticas, además de una página interna de "Ops Radar" para detección proactiva de incidencias.

El proyecto incluye un sistema de login de demostración con cuatro cuentas de cliente, un agente conversacional con herramientas (búsqueda en documentos, consulta de datos, cálculo de tarifas y escalado a soporte humano) y un sistema de etiquetas de fiabilidad (alta/media/baja) para cada respuesta. Aunque está publicado en HuggingFace, no contiene pesos de modelo ni arquitectura de red neuronal; es código fuente de una aplicación que depende de la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (aplicacion Streamlit que usa el modelo propietario gpt-4o-mini de OpenAI) |
| Parametros totales | No disponible (depende del modelo gpt-4o-mini, no se especifican) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende de gpt-4o-mini, no se especifica) |
| Tipos de cuantizacion | No disponible (no es un modelo local) |
| Idiomas soportados | No disponibles (la model card no indica idiomas; la interfaz esta en ingles) |
| Licencia | No disponible (no se especifica en la model card) |
| Formato de pesos | No aplica (codigo fuente Python, no hay pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El proyecto es una aplicacion de software que orquesta llamadas a la API de OpenAI con el modelo `gpt-4o-mini`. La arquitectura de la aplicacion se compone de varios modulos: `app.py` (interfaz Streamlit), `agent.py` (bucle de tool calling), `tools.py` (definicion de herramientas), `data_store.py` (carga de datos Excel y logica de calculo), `documents.py` (carga y busqueda de PDFs) e `insights.py` (logica de deteccion proactiva de incidencias). No hay informacion sobre datos de entrenamiento, metodos de ajuste o innovaciones tecnicas, ya que el autor no ha publicado detalles sobre el prompt engineering o la configuracion del agente.

## Capacidades

- Gestion de conversaciones multi-turno de atencion al cliente, limitadas al contexto de la cuenta seleccionada.
- Consulta de datos de pedidos, cancelaciones, creditos de servicio y SLAs a partir de un dataset Excel.
- Busqueda semantica en documentos PDF de politicas y procedimientos.
- Calculo automatico de tarifas y creditos mediante logica programatica.
- Escalado a soporte humano, solo tras confirmacion explicita del cliente.
- Etiquetado de fiabilidad de cada respuesta (alta/media/baja) basado en la procedencia de los datos (acuerdos firmados, documentos desactualizados, etc.).
- Pagina interna "Ops Radar" con deteccion de tickets proximos a incumplir SLA, tickets duplicados, coincidencias con problemas conocidos y picos de volumen por categoria.

## Casos de uso

- Atencion al cliente automatizada para plataformas B2B de logistica: el chatbot responde preguntas sobre el estado de pedidos, cancelaciones y creditos, reduciendo la carga del equipo humano.
- Consulta de politicas y procedimientos: los clientes pueden preguntar sobre condiciones de servicio, plazos de devolucion o calculo de tarifas, con respuestas basadas en documentos oficiales.
- Deteccion proactiva de incidencias: la pagina Ops Radar permite al equipo interno identificar tickets en riesgo de SLA, duplicados o picos de volumen antes de que escalen.
- Demostracion de integracion de tool calling: el proyecto sirve como ejemplo de como construir un agente con herramientas usando gpt-4o-mini y Streamlit.
- Evaluacion de candidatos en procesos de seleccion: el repositorio puede usarse como referencia para evaluar habilidades de ingenieria de IA aplicada.
- Prototipo de chatbot de soporte con escalado humano: el flujo de escalado tras confirmacion del cliente es un patron reutilizable para sistemas de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una aplicacion que depende de un modelo propietario, no existen metricas propias de rendimiento del sistema.

## Requisitos de hardware

- No aplica para inferencia local, ya que el modelo se ejecuta en los servidores de OpenAI.
- La aplicacion Streamlit puede ejecutarse en cualquier maquina con Python y acceso a internet.
- Requisitos minimos: Python 3.x, dependencias listadas en `requirements.txt` (Streamlit, openai, pandas, etc.).
- No se requiere GPU.
- El despliegue se realiza con `streamlit run app.py` y la clave de API de OpenAI debe configurarse como variable de entorno o en `.streamlit/secrets.toml`.

## Comparativa con modelos similares

No disponible. Este proyecto no es un modelo de lenguaje, sino una aplicacion que utiliza un modelo propietario. No existen modelos comparables en el sentido de pesos o arquitectura. Si se compara con otros chatbots de soporte, la diferencia principal es que este usa gpt-4o-mini y no un modelo open source.

## Limitaciones y advertencias

- Depende completamente de la API de OpenAI, por lo que no es autónomo ni open source en cuanto al modelo subyacente.
- La licencia del codigo no esta especificada; se debe contactar al autor para uso comercial.
- El login es de demostracion y no implementa autenticacion real.
- Los datos utilizados son ficticios y proporcionados para la evaluacion; no son aptos para produccion.
- El rendimiento y la calidad de las respuestas dependen del modelo gpt-4o-mini, que puede alucinar o dar respuestas inexactas si las herramientas no devuelven datos suficientes.
- No se proporcionan garantias de seguridad, privacidad o cumplimiento normativo.
- El proyecto no incluye tests automatizados ni documentacion de despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/chayanchauhan/ParcelPilot_Assistant
- Repositorio relacionado (no oficial, de otro autor): https://github.com/ayushjha4wd/parcelpilot-support-ai
