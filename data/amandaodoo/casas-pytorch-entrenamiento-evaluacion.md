# amandaodoo/casas-pytorch-entrenamiento-evaluacion

## Resumen

`casas-pytorch-entrenamiento-evaluacion` es un repositorio de Hugging Face publicado por el usuario `amandaodoo` que contiene una regresion lineal implementada en PyTorch, entrenada sobre un dataset sintetico de 200 viviendas (`casas.csv`) con las variables `m2`, `balcon`, `ascensor` y `precio` (en miles de dolares estadounidenses). No es un modelo de lenguaje ni una red neuronal profunda: es un ejemplo educativo de pipeline completo de entrenamiento, evaluacion y exportacion de pesos en formato `safetensors` junto con un `config.json` y un modulo `modelo.py` para reconstruir la arquitectura.

El repositorio tiene como objetivo demostrar el flujo de trabajo tipico de PyTorch: particion train/test (160/40), entrenamiento del modelo, evaluacion sobre datos no vistos, guardado de pesos y publicacion en el Hub para su posterior consumo mediante un script `predict_hub.py`. La model card menciona ademas tres carpetas derivadas que ilustran distintos formatos de exportacion: modelo completo, TorchScript y `torch.export`.

Su relevancia es exclusivamente didactica. Con 4 parametros totales segun los metadatos de `safetensors` (coherente con una regresion lineal de tres caracteristicas mas el sesgo), no debe confundirse con un modelo fundacional: la etiqueta `tabular-regression` y el pipeline asociado lo sitúan en el ambito de la regresion tabular simple. Es util como referencia para quienes aprenden a empaquetar y distribuir modelos en el Hub, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (una capa densa) implementada en PyTorch |
| Parametros totales | 4 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin contexto textual) |
| Tipos de cuantizacion | No disponible (pesos en `safetensors`, presumiblemente float32) |
| Idiomas soportados | Espanol (etiqueta `es`; sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `safetensors` + `config.json` + `modelo.py`; exportaciones adicionales a modelo completo, TorchScript y `torch.export` |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal multiple: una unica transformacion afín que combina las tres variables de entrada (`m2`, `balcon`, `ascensor`) con sus pesos y un termino de sesgo para predecir `precio`. Los 4 parametros reportados en los metadatos de `safetensors` encajan exactamente con tres pesos mas el bias. No hay capas ocultas, funciones de activacion ni mecanismos de atencion.

El entrenamiento se realiza con el script `train.py` sobre el dataset sintetico `casas.csv`, que contiene 200 registros generados para la "Clase 10" de un curso. Se reservan 160 ejemplos para entrenamiento y 40 para evaluacion sobre datos no vistos. La model card no especifica la funcion de perdida (presumiblemente MSE), el optimizador, la tasa de aprendizaje ni el numero de epocas. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de este tipo. La innovacion tecnica destacable es pedagogica: la exportacion a multiples formatos (modelo completo, TorchScript y `torch.export`) para ilustrar las distintas vias de serializacion de PyTorch.

## Capacidades

- Prediccion de precios de vivienda a partir de tres caracteristicas tabulares: superficie en metros cuadrados, presencia de balcon y presencia de ascensor.
- Regresion tabular supervisada con salida escalar continua (precio en miles de dolares estadounidenses).
- Carga desde el Hub mediante `predict_hub.py`, pasando el identificador del repositorio como argumento.
- Exportacion a formato completo de PyTorch, TorchScript y `torch.export` para su despliegue en distintos entornos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en sentido estricto: la etiqueta `es` es administrativa y no implica procesamiento de lenguaje.
- No dispone de modo de razonamiento (thinking), vision, audio ni generacion de texto.

## Casos de uso

- Docencia de PyTorch: el repositorio sirve como ejemplo minimo y reproducible de un ciclo completo de entrenamiento, evaluacion y guardado de pesos, adecuado para clases introductorias de machine learning.
- Aprendizaje del formato `safetensors`: permite inspeccionar como se serializan pesos y como se acompanan de un `config.json` y un modulo `modelo.py` para reconstruir la arquitectura en otro equipo.
- Demostracion de publicacion en el Hub: el script `publicar_en_hub.py` y el flujo con `predict_hub.py` ilustran como empaquetar un modelo y consumirlo remotamente.
- Comparativa de formatos de exportacion: las carpetas de modelo completo, TorchScript y `torch.export` permiten experimentar con las diferencias de portabilidad y rendimiento entre ellas.
- Estimacion rapida de precios en un contexto sintetico: util como prueba de concepto de un pipeline de regresion tabular antes de escalar a un dataset real con mas variables.
- Pruebas de integracion en CI/CD: el tamano minimo del repositorio (0,0 GB) y su licencia MIT lo hacen apto como caso de prueba para validar flujos de descarga, carga y prediccion en pipelines automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (MSE, MAE, R²) sobre el conjunto de evaluacion de 40 viviendas, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo cabe holgadamente en cualquier GPU, e incluso en CPU sin penalizacion apreciable.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU, en GPUs integradas y en cualquier acelerador CUDA.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y tambien en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo, TorchScript (via `torch.jit.load`), `torch.export`, y cualquier runtime que cargue `safetensors`. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (4 parametros, una multiplicacion matricial de 3x1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amandaodoo/casas-pytorch-entrenamiento-evaluacion` | 4 | No aplica | Regresion tabular | MIT | Hugging Face |
| Regresion lineal de scikit-learn (`LinearRegression`) | 4 (3 pesos + bias) | No aplica | Regresion tabular | BSD-3-Clause | PyPI |
| Ejemplos de regresion tabular en PyTorch (varios repositorios educativos) | Variable, tipicamente < 1.000 | No aplica | Regresion tabular | Variable | GitHub / Hub |

La comparacion con modelos fundacionales no procede: la categoria es la regresion tabular simple. Frente a `scikit-learn`, este repositorio anade el flujo de publicacion en el Hub y la exportacion a multiples formatos de PyTorch, pero carece de la madurez, documentacion y bateria de utilidades de la libreria clasica.

## Limitaciones y advertencias

- El dataset es sintetico (200 viviendas generadas para una clase) y no representa la distribucion real del mercado inmobiliario; las predicciones no son extrapolables a datos reales.
- Solo tres variables de entrada: omite ubicacion, antiguedad, estado de conservacion y cualquier otro factor relevante en la valoracion de vivienda, lo que introduce un sesgo de variable omitida severo.
- Riesgo de sobreajuste no evaluado: la model card no reporta metricas de evaluacion ni curvas de aprendizaje.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite prompts.
- La licencia MIT permite uso comercial, pero la ausencia de validacion sobre datos reales desaconseja cualquier uso en produccion sin reentrenamiento y validacion previos.
- El repositorio tiene un tamano de 0,0 GB y 32 descargas; el mantenimiento y soporte por parte del autor no estan garantizados.
- No se documentan sesgos demograficos ni geograficos porque el dataset es sintetico, pero la variable `precio` en miles de dolares estadounidenses sugiere un contexto economico concreto no justificado en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amandaodoo/casas-pytorch-entrenamiento-evaluacion
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
