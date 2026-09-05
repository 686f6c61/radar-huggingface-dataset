# acha-uhan/classification-scratch

## Resumen

El modelo `acha-uhan/classification-scratch` es una implementacion compacta y personalizada de la arquitectura **Albef** orientada a clasificacion, desarrollada por el usuario `acha-uhan`. No se trata de un modelo preentrenado ni de una version lista para produccion: el repositorio incluye un checkpoint de inicializacion (`model.safetensors`) que el autor presenta como valido para pruebas de humo, revision de codigo y experimentos controlados de pequena escala.

La arquitectura declarada es Albef en configuracion "large", con atencion dilatada, co-atencion, activacion ReLU y normalizacion BatchNorm. Sin embargo, el numero total de parametros es de solo **49.600**, lo que indica que es una implementacion reducida con fines educativos o de validacion tecnica, no un modelo de gran escala. No se dispone de datos sobre longitud de contexto, idiomas soportados ni benchmarks. La relevancia actual del modelo es limitada: sirve como punto de partida para investigacion experimental, pero no como solucion funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Albef (atencion dilatada, co-atencion, activacion ReLU, normalizacion BatchNorm) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en float32 sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una implementacion propia de Albef para tareas de clasificacion. Albef es originalmente un modelo de vision-lenguaje, pero en este repositorio se adapta a un problema de clasificacion, probablemente de imagenes. La configuracion "large" es una etiqueta interna del autor, no un indicador de escala real, dado el reducido numero de parametros. La atencion es dilatada, lo que permite un campo receptivo mayor, y se combina con co-atencion, un mecanismo tipico de Albef para fusionar modalidades. La activacion es ReLU y la normalizacion es BatchNorm.

El autor incluye un `training_args.json` con una receta experimental por defecto que usa el optimizador **Lamb** y un scheduler **OneCycle**. No obstante, el propio README aclara que estos son valores de partida en el script, no evidencia de una ejecucion completada. El checkpoint incluido es de inicializacion, no entrenado, y no se aportan datos sobre el dataset utilizado ni sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto: no aplica, el modelo esta orientado a clasificacion.
- Razonamiento: no disponible, al ser un checkpoint sin entrenar no presenta capacidades cognitivas reales.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: implementacion de Albef para clasificacion, pero sin entrenamiento previo. Solo apto para pruebas de humo, revision de codigo y experimentos de arquitectura.

## Casos de uso

- Revision de codigo: los desarrolladores pueden inspeccionar la implementacion de Albef en `main.py` para entender como se construye la arquitectura, la atencion dilatada y la co-atencion.
- Pruebas de humo (smoke tests): sirve para verificar que el pipeline de carga de `model.safetensors` y la ejecucion de una inferencia basica funcionan correctamente en un entorno de desarrollo.
- Experimentos controlados de arquitectura: permite probar variaciones de configuracion (por ejemplo, cambiar el numero de capas o la atencion) sobre un checkpoint de inicializacion, sin necesidad de un modelo preentrenado.
- Educacion e investigacion: es util como ejemplo didactico de una implementacion Albef en PyTorch, especialmente para estudiantes que quieran estudiar los componentes internos.
- Pruebas de integracion: puede utilizarse para validar adaptadores personalizados antes de conectarlos a un modelo real, ya que el README advierte que las APIs genericas requieren un adaptador explicito.
- Punto de partida para entrenamiento desde cero: el checkpoint de inicializacion puede servir como base para entrenar un modelo propio con un dataset especifico, siempre que se documenten los resultados por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del repositorio indica explicitamente que no se reclama ninguna puntuacion de benchmark en este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 49.600 parametros, el modelo ocupa menos de 1 MB en float32, por lo que la VRAM necesaria es practicamente despreciable.
- GPU recomendadas: no se requiere GPU dedicada; el modelo puede ejecutarse en cualquier CPU moderna.
- Compatibilidad con GPU de consumo: si, cualquier GPU (o incluso CPU) es suficiente para ejecutar el checkpoint.
- Opciones de despliegue: no esta pensado para produccion. Se puede cargar directamente con PyTorch o con cualquier framework que soporte safetensors. No se recomienda usar vLLM, llama.cpp ni Ollama para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoria, ya que `classification-scratch` es una implementacion experimental sin entrenar y sin benchmarks publicados. El mismo autor tiene otro modelo (`model_715950174_mocov3_small`) de naturaleza similar, pero tampoco ofrece datos de rendimiento comparativos.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no tiene ninguna capacidad real de clasificacion.
- No ha sido auditado en cuanto a robustez, equidad o transferencia de dominio, como reconoce el propio autor.
- No se han publicado benchmarks ni metricas de rendimiento.
- La implementacion es personalizada y requiere un adaptador explicito para las APIs genericas de carga de modelos.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo no ofrece garantias de funcionamiento ni soporte.
- No es apto para produccion ni para cualquier uso que requiera resultados fiables.

## Enlaces

- HuggingFace: https://huggingface.co/acha-uhan/classification-scratch
- Otro modelo del autor: https://huggingface.co/acha-uhan/model_715950174_mocov3_small
