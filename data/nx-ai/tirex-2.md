# NX-AI/TiRex-2

## Resumen

TiRex-2 es un modelo fundacional de prediccion de series temporales desarrollado por NX-AI, presentado en el paper arXiv 2607.01204 y aceptado como presentacion oral en NeurIPS 2026. Generaliza el modelo original TiRex (univariante) al caso multivariante, incorporando ademas covariates pasadas y futuras conocidas, como caracteristicas de calendario, festivos, promociones o intervenciones programadas. Un unico checkpoint sirve tanto para prediccion univariante como multivariante en modo zero-shot, sin necesidad de entrenamiento ni ajuste especifico sobre los datos del usuario.

El modelo emplea una arquitectura recurrente disenada especificamente para entornos de streaming, con un footprint activo reducido: 38,4 millones de parametros en modo univariante y 44,1 millones adicionales para prediccion multivariante. El checkpoint completo contiene 82.501.744 parametros en formato safetensors, con un repositorio de 1,4 GB. Se distribuye tambien en formato ONNX, lo que permite inferencia solo con numpy y onnxruntime, sin dependencia de PyTorch.

Su relevancia actual radica en que cubre un nicho poco atendido por los grandes modelos de lenguaje: la prediccion de series temporales con covariates heterogeneas y en escenarios de streaming, con licencia Apache 2.0 y un pipeline de inferencia ligero que puede ejecutarse en CPU o GPU de consumo. La version PRO anade soporte comercial, inferencia optimizada para hardware, fine-tuning y tareas de clasificacion y regresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente (disenada para streaming); detalles exactos no disponibles |
| Parametros totales | 82.501.744 |
| Parametros activos | 38,4 M en modo univariante; +44,1 M en modo multivariante |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (por defecto), ONNX, PyTorch checkpoint legacy (model.ckpt) |

## Arquitectura y entrenamiento

TiRex-2 se construye sobre una arquitectura recurrente orientada a inferencia eficiente en entornos de streaming, en contraste con los transformers clasicos empleados en la mayoria de modelos fundacionales de series temporales. El modelo activa 38,4 millones de parametros en modo univariante y anade 44,1 millones adicionales cuando opera en modo multivariante, lo que permite un consumo de recursos contenido y una latencia baja en produccion. Un unico checkpoint cubre ambos regimenes, de modo que el usuario no necesita seleccionar variantes distintas segun el numero de variables objetivo.

El entrenamiento se realizo sobre los datasets `autogluon/chronos_datasets` y `Salesforce/lotsa_data`, dos corpus de referencia habituales en la literatura de series temporales. No se dispone de informacion detallada sobre el numero exacto de tokens, la composicion completa del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO, dado que estos metodos no son habituales en modelos de prediccion numerica. La innovacion principal consiste en la incorporacion nativa de covariates pasadas y futuras conocidas, asi como en el diseno recurrente que habilita actualizaciones incrementales en streaming sin reprocesar toda la ventana historica.

## Capacidades

- Prediccion zero-shot de series temporales univariantes y multivariantes sin entrenamiento ni fine-tuning sobre los datos del usuario.
- Condicionamiento nativo sobre covariates pasadas (variables exogenas historicas) y covariates futuras conocidas (calendario, festivos, promociones, intervenciones programadas).
- Operacion en modo streaming gracias a la arquitectura recurrente, con actualizaciones incrementales del estado del modelo.
- Un unico checkpoint sirve para los modos univariante y multivariante.
- Inferencia via ONNX con solo numpy y onnxruntime, sin necesidad de PyTorch.
- Integracion como plugin en Claude Code y Codex para lanzar predicciones sin escribir codigo.
- Capacidades de clasificacion y regresion exclusivas de la version PRO (no incluidas en este release open source).
- No es un modelo linguistico: no genera texto, no soporta tool calling generativo ni razonamiento multi-step en el sentido de los LLM.

## Casos de uso

- Prediccion de demanda minorista: el modelo puede pronosticar ventas por producto y tienda en modo multivariante, condicionando sobre festivos y promociones futuras conocidas, sin entrenar un modelo por SKU.
- Planificacion de capacidad en infraestructura TI: prediccion de metricas como CPU, memoria o latencia por servicio, usando covariates de calendario y despliegues programados para anticipar picos.
- Gestion energetica: pronostico de consumo electrico o generacion renovable multivariante, incorporando variables meteorologicas pasadas y previsiones futuras como covariates conocidas.
- Monitorizacion industrial (predictive maintenance): prediccion de sensores de maquinaria en streaming, aprovechando la arquitectura recurrente para actualizar el estado con cada nueva lectura sin reprocesar el historico completo.
- Planificacion financiera y de tesoreria: proyeccion de flujos de caja o metricas de negocio con multiples series correlacionadas y eventos de calendario conocidos.
- Analisis de series en notebooks y pipelines de ciencia de datos: al distribuirse en ONNX y con un paquete pip ligero (`tirex-2`), puede integrarse en entornos sin GPU y en flujos de CI/CD para validacion automatizada de pronosticos.
- Asistentes de codigo con prediccion integrada: mediante el plugin para Claude Code y Codex, un desarrollador puede solicitar pronosticos sobre datos de su proyecto sin escribir codigo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 82,5 M de parametros totales en FP32 el checkpoint ocupa aproximadamente 330 MB, y en FP16 unos 165 MB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no se requieren A100 ni H100 para inferencia estandar. La version PRO ofrece inferencia optimizada para edge, embedded e industriales.
- Cabe en GPU de consumo: si, practicamente en cualquier modelo actual (RTX 3060 en adelante, e incluso GPUs integradas).
- Opciones de despliegue: paquete pip `tirex-2` (Python 3.11+), ONNX Runtime (solo numpy + onnxruntime), imagenes Docker `tirex2-cpu` y `tirex2-gpu` en GHCR, y plugin para Claude Code y Codex.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la arquitectura recurrente y el reducido numero de parametros activos sugieren latencias bajas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multivariante | Covariates futuras | Licencia | Formatos |
|---|---|---|---|---|---|---|
| TiRex-2 | 82,5 M totales (38,4 M activos uni / +44,1 M multi) | no disponible | Si | Si | Apache 2.0 | safetensors, ONNX, ckpt |
| TiRex (original) | no disponible | no disponible | No (solo univariante) | no disponible | no disponible | no disponible |
| Chronos (Amazon) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TimesFM (Google) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de los modelos comparables no estan disponibles en la informacion proporcionada; la tabla refleja unicamente lo confirmado para TiRex-2.

## Limitaciones y advertencias

- Modelo especializado en series temporales numericas; no procesa texto ni lenguaje natural, por lo que no debe evaluarse con criterios de LLM.
- No se dispone de informacion sobre sesgos especificos del dataset de entrenamiento (`chronos_datasets`, `lotsa_data`); el rendimiento puede degradarse en dominios alejados de su distribucion.
- Riesgo de pronosticos erroneos en regimenes no vistos (cambios estructurales, eventos extremos); al ser zero-shot, no hay garantia de calibracion en el dominio del usuario.
- La longitud de contexto no esta documentada, lo que dificulta planificar ventanas historicas largas.
- Las capacidades de clasificacion, regresion, streaming avanzado y fine-tuning estan reservadas a la version PRO de pago; el release open source no las incluye.
- La licencia Apache 2.0 permite uso comercial del checkpoint open source, pero conviene revisar los terminos de la version PRO si se necesita soporte o funcionalidades extendidas.
- El formato legacy `model.ckpt` no es compatible con `tirex-2` 0.5.0 o superior; es necesario fijar una version anterior si se depende de el.

## Enlaces

- Hugging Face: https://huggingface.co/NX-AI/TiRex-2
- Paper: https://arxiv.org/abs/2607.01204
- Repositorio GitHub: https://github.com/NX-AI/tirex-2
- Documentacion: https://nx-ai.github.io/tirex-2/
- FAQ: https://nx-ai.github.io/tirex-2/faq/
- Guia ONNX: https://nx-ai.github.io/tirex-2/how-to/onnx/
- Paquete PyPI: https://pypi.org/project/tirex-2/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/NX-AI/TiRex-2-demo
- Notebook de inicio: https://colab.research.google.com/github/NX-AI/tirex-2/blob/main/examples/getting_started.ipynb
- Imagenes Docker: https://github.com/NX-AI/tirex-2/pkgs/container/tirex2-cpu
- Modelo original TiRex: https://github.com/NX-AI/tirex
- Contacto PRO: contact@nx-ai.com
