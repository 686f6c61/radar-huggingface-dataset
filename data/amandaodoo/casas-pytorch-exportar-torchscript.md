# amandaodoo/casas-pytorch-exportar-torchscript

## Resumen

`amandaodoo/casas-pytorch-exportar-torchscript` es un repositorio de ejemplo educativo publicado en Hugging Face por la usuaria `amandaodoo`. No es un modelo de lenguaje ni un modelo fundacional: es una regresión lineal implementada en PyTorch y exportada al formato TorchScript (`model_ts.pt`), pensada para ilustrar el flujo completo de entrenamiento, exportación y recarga de un modelo tabular en el ecosistema PyTorch. El caso de uso concreto es la predicción de precios de viviendas (de ahí "casas") a partir de variables tabulares.

El repositorio forma parte de una serie de ejemplos encadenados: el modelo original se entrena en el proyecto `pytorch-entrenamiento-evaluacion`, se exporta a TorchScript en este repositorio y se vuelve a cargar con `torch.jit.load` para hacer inferencia, tanto en local como desde el Hub mediante el script `predict_hub.py`. El pipeline declarado es `tabular-regression` y la licencia es MIT.

Su relevancia es formativa, no competitiva: sirve como referencia práctica para desarrolladores que necesitan entender qué guarda exactamente el formato TorchScript (pesos y código del `forward`, sin la clase Python), cómo se carga sin depender de la definición de la clase original y por qué PyTorch lo considera un formato *deprecated* en favor de `torch.export`. No hay información sobre arquitectura de red más allá de "regresión lineal", ni sobre volumen de datos de entrenamiento, ni sobre métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal implementada en PyTorch (según tags y model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | TorchScript (`model_ts.pt`) |
| Libreria | PyTorch |
| Pipeline | tabular-regression |
| Tamano del repositorio | 0.0 GB (según Hugging Face) |
| Descargas | 15 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal, es decir, una transformación afín de las variables de entrada tabulares a una salida escalar (precio de vivienda). El modelo se entrena en el proyecto previo `pytorch-entrenamiento-evaluacion` y este repositorio se limita a exportarlo. No se especifica en la información disponible el número de variables de entrada, el número de parámetros, el tamaño del dataset de entrenamiento, la función de pérdida ni el optimizador empleado.

La innovación técnica del repositorio no está en el modelo sino en el formato de serialización: TorchScript captura los pesos y el código del método `forward` en un único artefacto que se carga con `torch.jit.load` sin necesidad de la clase Python original. Según la propia model card, este formato no usa pickle, por lo que es seguro abrir archivos de procedencia desconocida, pero está marcado como *deprecated* por PyTorch, que recomienda `torch.export` para proyectos nuevos. El flujo de trabajo incluye tres scripts: `exportar.py` (entrenamiento previo + exportación), `cargar.py` (carga local y predicción) y `predict_hub.py` (descarga desde el Hub y predicción).

## Capacidades

- Regresión tabular: predice un valor continuo (precio de vivienda) a partir de variables de entrada tabulares.
- Exportación a TorchScript: genera un artefacto `model_ts.pt` autocontenido con pesos y grafo del `forward`.
- Carga sin clase Python: el modelo se puede recargar con `torch.jit.load` en cualquier entorno con PyTorch, sin replicar la definición de la clase.
- Distribución vía Hugging Face Hub: incluye un script (`predict_hub.py`) para descargar el repositorio y ejecutar inferencia desde otra máquina.
- Uso en C++: al ser TorchScript, el artefacto es consumible desde la API de C++ de PyTorch (según indica la model card para "proyectos viejos o C++").
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Docencia de PyTorch: usar el repositorio como ejemplo mínimo y completo del ciclo entrenar → exportar → cargar → predecir, adecuado para cursos introductorios de machine learning.
- Aprendizaje del formato TorchScript: comparar el artefacto `model_ts.pt` con un `torch.export` equivalente para entender las diferencias entre ambos mecanismos de serialización.
- Predicción de precios de vivienda en demos: el modelo sirve como endpoint trivial de regresión tabular en prototipos de APIs o interfaces web, sin pretensión de precisión real.
- Integración en aplicaciones C++: el artefacto TorchScript se puede cargar desde `libtorch` en un servicio C++ sin dependencia del intérprete de Python.
- Plantilla para publicar modelos en el Hub: el script `publicar_en_hub.py` y la estructura de carpetas sirven de esqueleto para publicar otros modelos pequeños con su código de inferencia.
- Pruebas de pipelines de CI/CD de machine learning: al ser un modelo pequeño y de carga rápida, es útil para validar flujos de empaquetado, versionado y despliegue de artefactos sin coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza del modelo (regresión lineal), la huella en memoria es mínima y cabe en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU con PyTorch instalado es suficiente.
- GPU de consumo: cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.), aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: `torch.jit.load` desde Python o C++ (libtorch). No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la simplicidad del modelo, se espera latencia de microsegundos a milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (ejemplos educativos de regresión lineal exportados a TorchScript). Las alternativas conceptuales serían otros formatos de serialización de PyTorch (`torch.export`, `torch.save` con `state_dict`), pero no son modelos sino mecanismos de empaquetado.

## Limitaciones y advertencias

- Modelo educativo: no está pensado para producción ni para predicciones reales de precios de vivienda; su valor es didáctico.
- Sin métricas: no se publican datos de error (MSE, MAE, R²) ni del dataset de entrenamiento, por lo que no se puede evaluar su calidad predictiva.
- Formato *deprecated*: TorchScript está marcado como obsoleto por PyTorch; para proyectos nuevos se recomienda `torch.export`.
- Alcance limitado: solo cubre regresión tabular; no soporta texto, visión, audio ni tareas generativas.
- Idioma: la documentación y los scripts están en español; el tag de idioma `es` se refiere a la documentación, no a capacidades lingüísticas del modelo.
- Licencia MIT: permite uso comercial y modificación con atribución, pero al ser un ejemplo educativo no hay garantías de idoneidad.
- Sin mantenimiento declarado: 0 likes y 15 descargas sugieren un repositorio de bajo uso; no hay indicios de soporte activo.

## Enlaces

- Hugging Face: https://huggingface.co/amandaodoo/casas-pytorch-exportar-torchscript
- Documentación de TorchScript en PyTorch: no disponible en la información proporcionada
- Documentación de `torch.export`: no disponible en la información proporcionada
- Proyecto previo `pytorch-entrenamiento-evaluacion`: mencionado en la model card, sin URL directa en la información proporcionada
