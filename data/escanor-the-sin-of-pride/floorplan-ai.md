# Escanor-the-sin-of-pride/floorplan-ai

## Resumen

`floorplan-ai` es un modelo publicado en Hugging Face por el usuario Escanor-the-sin-of-pride bajo el identificador `Escanor-the-sin-of-pride/floorplan-ai`. Por el nombre y por el tag `unsloth`, que aparece en los metadatos del repositorio, todo apunta a un ajuste fino (fine-tuning) de un modelo base mediante las herramientas de Unsloth, orientado presumiblemente a la generacion o interpretacion de planos de planta (floorplans). Sin embargo, la model card es la plantilla autogenerada por Hugging Face y no contiene ninguna descripcion sustantiva del modelo, sus datos de entrenamiento ni su proposito real.

El repositorio tiene un tamano de 0,1 GB, lo que sugiere un modelo de pequeno tamano o un adaptador LoRA, aunque no se puede confirmar sin inspeccionar los ficheros de pesos. La libreria declarada es `transformers` y el formato de pesos es `safetensors`. No se declara licencia, ni idiomas, ni pipeline, ni parametros, ni longitud de contexto.

Se trata, por tanto, de un modelo practicamente sin documentacion publica, con cero descargas y cero likes en el momento de redactar esta ficha. Cualquier evaluacion tecnica seria requiere inspeccionar directamente los pesos y la configuracion del repositorio, algo que no se ha podido hacer con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. Los metadatos indican que se ha usado `transformers` como libreria y `unsloth` como herramienta de entrenamiento o ajuste, lo que sugiere un fine-tuning sobre un modelo base preentrenado, probablemente con tecnicas de LoRA o QLoRA. El tamano del repositorio (0,1 GB) es compatible tanto con un adaptador como con un modelo pequeno en precision reducida, pero no permite distinguir entre ambos casos.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni ninguna innovacion tecnica declarada. La model card no incluye hiperparametros, regimen de entrenamiento ni infraestructura utilizada.

## Capacidades

- No se declara ninguna capacidad especifica en la model card.
- Por el nombre del modelo, se presume una orientacion a tareas relacionadas con planos de planta (generacion, interpretacion o descripcion), pero no hay evidencia documentada.
- No se confirma soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento.
- No se confirma capacidad multilingue ni multimodal (vision, audio).
- No se confirma generacion de codigo ni capacidades matematicas.

## Casos de uso

Dado que no hay documentacion sobre el modelo, los casos de uso que se enumeran a continuacion son hipoteticos y deben validarse experimentalmente antes de cualquier uso en produccion:

- Generacion asistida de planos de planta: si el modelo esta efectivamente entrenado para ello, podria producir descripciones textuales o representaciones de distribuciones de espacios a partir de requisitos como numero de habitaciones, metros cuadrados o orientacion. Requiere validacion manual.
- Descripcion automatica de planos existentes: conversion de imagenes o bocetos de planos en texto estructurado (habitaciones, superficies, circulaciones), siempre que el modelo tenga capacidad multimodal, algo no confirmado.
- Prototipado rapido en estudios de arquitectura: uso como borrador inicial para explorar distribuciones antes de la revision por un profesional.
- Etiquetado o anotacion semiautomatica de datasets de planos: si el modelo genera descripciones coherentes, podria emplearse para preanotar y reducir el trabajo manual.
- Educacion y demostraciones: util como ejemplo de fine-tuning con Unsloth en talleres o cursos sobre ajuste de modelos.
- Investigacion sobre modelos de dominio especifico: base para experimentos de adaptacion a dominios tecnicos (arquitectura, inmobiliaria) y comparacion con modelos generalistas.

En todos los casos, la ausencia de benchmarks y de licencia impide recomendar su uso en entornos comerciales o criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,1 GB) sugiere que podria ejecutarse en GPUs de consumo, pero no se puede confirmar sin conocer el numero de parametros y la precision de los pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; probablemente si se trata de un modelo pequeno o un adaptador, pero requiere inspeccion de los ficheros.
- Opciones de despliegue: al usar `transformers` y `safetensors`, es compatible con `transformers`, vLLM (si la arquitectura lo permite) y potencialmente llama.cpp u Ollama tras conversion a GGUF. No se ha verificado ninguna de estas opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoria porque no se ha podido determinar la arquitectura, el tamano ni la tarea concreta del modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada y no aporta informacion sobre el modelo.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribucion. Es un riesgo legal relevante.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de calidad ni de comportamiento esperado.
- Cero descargas y cero likes: no hay senales de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion desconocido, pero previsible en cualquier modelo de lenguaje sin evaluacion.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningun otro idioma.
- Posible sobreajuste al dominio de planos si el fine-tuning fue muy especifico, con degradacion en tareas generales.
- Fecha de creacion inusual (2026-11-11) en los metadatos, lo que puede indicar un error de registro o una publicacion de prueba; conviene verificar la integridad del repositorio antes de usarlo.
- No apto para produccion sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Escanor-the-sin-of-pride/floorplan-ai
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
