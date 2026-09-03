# Breitiee/SusiAI

## Resumen

SusiAI es un modelo de lenguaje basado en arquitectura transformer, desarrollado por el usuario Breitiee (Kiak) y publicado en Hugging Face. Según la model card, se trata de un modelo propio en alemán ("Eigenes deutschsprachiges Transformer-Sprachmodell") construido sobre PyTorch. El proyecto incluye scripts de entrenamiento, exportación a formato Hugging Face y una aplicación Gradio para chat.

El modelo se presenta como un repositorio con `config.json`, `model.safetensors`, `vocab.json` y configuración de tokenizador, lo que indica que es compatible con la librería Transformers. Sin embargo, la información pública es muy limitada: no se especifican parámetros, contexto, licencia ni datos de entrenamiento. Su relevancia actual es baja, ya que no cuenta con descargas ni métricas publicadas, y parece un proyecto experimental o educativo más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin detalles de capas, heads o dimensiones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors) |
| Idiomas soportados | aleman (segun la descripcion del autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La unica informacion disponible es que se trata de un modelo transformer implementado en PyTorch. El autor proporciona un script de entrenamiento (`python -m src.train --epochs 20`) y un script de exportacion a formato Hugging Face (`scripts/export_huggingface.py`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones tecnicas particulares.

## Capacidades

- Generacion de texto en aleman: el modelo esta disenado para procesar y generar lenguaje aleman, segun la descripcion del autor.
- Compatibilidad con Transformers: al incluir `config.json` y `model.safetensors`, puede cargarse con la libreria Transformers de Hugging Face.
- Interfaz de chat: se incluye una aplicacion Gradio en `hf_space/` para interactuar con el modelo mediante una interfaz web.
- Entrenamiento personalizado: el repositorio incluye codigo fuente para reentrenar el modelo con datos propios, aunque no se detallan los datos utilizados.

No se dispone de informacion sobre capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multimodalidad.

## Casos de uso

- Experimentacion educativa: dado su tamano presumiblemente reducido y su naturaleza de proyecto personal, puede servir para aprender a entrenar y desplegar modelos transformer en PyTorch.
- Prototipado de chatbots en aleman: la aplicacion Gradio permite montar rapidamente un chat local para probar respuestas en aleman.
- Base para fine-tuning: al ser un modelo propio, se puede reentrenar con datasets especificos, aunque no hay garantias de calidad ni soporte.
- Integracion en pipelines de Transformers: al ser compatible con la libreria, puede usarse en scripts de Python para generacion de texto, siempre que se acepten sus limitaciones.

No se recomienda su uso en produccion sin una evaluacion exhaustiva, dado que no hay datos de rendimiento ni licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware. Al no conocerse el numero de parametros, no es posible estimar VRAM, GPUs recomendadas ni opciones de despliegue. El modelo se distribuye en formato safetensors, por lo que podria cargarse con Transformers en CPU o GPU, pero se desconoce su tamano real.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria (modelos de lenguaje en aleman de tamano reducido) con los que contrastar, y la falta de datos de rendimiento impide cualquier comparacion objetiva.

## Limitaciones y advertencias

- Informacion tecnica insuficiente: no se especifican parametros, contexto, dataset de entrenamiento ni licencia, lo que impide evaluar su idoneidad para cualquier tarea.
- Riesgo de alucinacion y sesgos: al ser un modelo sin documentacion de entrenamiento, es probable que presente alucinaciones y sesgos no controlados.
- Idioma limitado: solo se menciona el aleman; no hay evidencia de capacidades multilingues.
- Sin soporte comercial: al no tener licencia declarada, no se puede usar en proyectos comerciales de forma segura.
- Proyecto sin validacion: con cero descargas y cero likes, no hay comunidad que haya probado o validado el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Breitiee/SusiAI
- Perfil del autor: https://huggingface.co/Breitiee/models
