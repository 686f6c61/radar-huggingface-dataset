# makhazon/makhazon-portal-demo

## Resumen

`makhazon/makhazon-portal-demo` es un repositorio publicado en Hugging Face por el usuario `makhazon` que, según su propia model card, no contiene un modelo de aprendizaje automático sino una copia de demostración del portal de gestión de pedidos (fulfillment) de Makhazon, en su fase 1. La model card describe una aplicación web Node.js (`npm install`, `node server.js`) desplegada en el plan gratuito de Render, con datos de ejemplo y credenciales de acceso de demostración. El repositorio no declara pipeline, licencia, idiomas ni arquitectura de red neuronal alguna.

Por tanto, no existe información sobre parámetros, longitud de contexto, cuantizaciones ni datos de entrenamiento. El artefacto es un proyecto de software de comercio electrónico/logística, no un modelo de lenguaje, visión o audio. Cualquier evaluación como modelo de IA resulta imposible con los datos disponibles.

La ficha se completa a continuación indicando explícitamente "no disponible" en todos los campos técnicos que no constan en la información proporcionada, y describiendo lo que sí se puede afirmar: la naturaleza del repositorio, su contenido declarado y sus implicaciones prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una aplicación web Node.js, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el contenido declarado es código JavaScript y datos de ejemplo) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura de modelo (transformer, MoE, SSM ni híbrida). La model card describe únicamente una aplicación web con build mediante `npm install` y arranque con `node server.js`, desplegada en el plan gratuito de Render. No hay información sobre datasets, número de tokens, composición de datos, RLHF, DPO ni ninguna otra técnica de entrenamiento, porque el artefacto no es un modelo entrenado.

Las variables de entorno mencionadas (`ADMIN_PASSWORD`, `ADMIN_PHONE`, `DEMO_SEED=1`) y las credenciales de demostración (teléfono 01000000001, contraseña `demo1234`) corresponden a la configuración de la aplicación de portal, no a parámetros de inferencia de un modelo.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües.
- La única funcionalidad descrita es la operación de un portal de fulfillment de comercio electrónico con datos de ejemplo y un inicio de sesión de administrador y de comerciante de demostración.

## Casos de uso

- Evaluación de la interfaz de un portal de fulfillment: el repositorio permitiría a un desarrollador levantar localmente la demo con `npm install` y `node server.js` para revisar el flujo de gestión de pedidos antes de integrarlo en un sistema propio.
- Pruebas de integración de autenticación: las variables `ADMIN_PASSWORD` y `ADMIN_PHONE` permiten simular el acceso de administrador y validar mecanismos de login en un entorno controlado.
- Prototipado de flujos de comercio electrónico: los datos de ejemplo sembrados con `DEMO_SEED=1` sirven para construir y probar pantallas de listado de pedidos, estados de envío y gestión de comerciantes sin depender de datos reales.
- Formación y demos internas: al ser una copia de demostración con datos ficticios, puede usarse en presentaciones o sesiones de onboarding para mostrar la lógica del portal sin exponer información de producción.
- Referencia de despliegue en PaaS: la configuración descrita (build `npm install`, start `node server.js`, plan gratuito de Render) sirve como plantilla para desplegar aplicaciones Node.js similares en plataformas gestionadas.
- Base para un entorno de staging: un equipo podría clonar el repositorio y sustituir los datos de ejemplo por un conjunto de pruebas propio para validar regresiones del portal.

En ningún caso estos casos de uso implican inferencia de un modelo de IA, ya que el repositorio no contiene uno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Despliegue: la model card indica Node.js con `npm install` y `node server.js`, y despliegue en el plan gratuito de Render. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la infraestructura de Render y no se documentan.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque el repositorio no es un modelo de IA, sino una aplicación web de demostración. Compararlo con modelos de lenguaje, visión o audio carece de sentido técnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal llevaría a conclusiones erróneas sobre sus capacidades.
- La model card está redactada parcialmente en árabe e inglés; no se declara licencia, lo que impide determinar si su uso comercial está permitido.
- No se especifican idiomas soportados ni pipeline, por lo que la integración automatizada mediante la librería `transformers` no es viable.
- Las credenciales de demostración publicadas (teléfono 01000000001, contraseña `demo1234`) son de ejemplo, pero su exposición en la model card subraya la necesidad de no reutilizarlas en entornos reales.
- El despliegue en el plan gratuito de Render implica limitaciones de recursos, arranques en frío y posible suspensión del servicio, no documentadas en detalle.
- Al no haber datos de entrenamiento ni evaluación, no se puede valorar sesgo, alucinación ni robustez; estos conceptos no aplican a una aplicación de portal.
- No se indica la versión de Node.js ni las dependencias, lo que puede dificultar la reproducibilidad del build.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/makhazon/makhazon-portal-demo
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos adicionales.
