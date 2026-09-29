# lumoreau/classification-scratch

## Resumen

`lumoreau/classification-scratch` es un repositorio experimental de HuggingFace que contiene una implementación propia de una arquitectura **Perceiver** orientada a tareas de clasificación. Lo publica el usuario `lumoreau` y no se presenta como un modelo entrenado, sino como un esqueleto de código con una configuración de arquitectura generada, una receta de entrenamiento por defecto y un checkpoint de inicialización válido únicamente para pruebas de humo (*smoke tests*).

El dato más relevante para cualquier evaluador es la discrepancia entre la etiqueta de escala del repositorio y su tamaño real: la model card declara escala *giant*, pero el recuento de parámetros de `model.safetensors` es de **49.600 parámetros**. Se trata, por tanto, de un modelo minúsculo, coherente con la afirmación del autor de que el montaje se mantiene "intencionadamente manejable" para poder inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

El repositorio es relevante como material de partida reproducible para investigar Perceivers con atención lineal, pero **no debe usarse como modelo de producción**: el propio autor indica que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, y que no se reclama ninguna puntuación de benchmark. Los resultados de búsqueda web disponibles no contienen información relacionada con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (implementacion propia, atencion lineal) |
| Parametros totales | 49.600 (segun `model.safetensors`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el repositorio no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

Datos adicionales de configuracion declarados en la model card:

| Parametro | Valor |
|---|---|
| Escala declarada | giant (etiqueta del repositorio) |
| Fusion | concat mlp |
| Activacion | gelu tanh |
| Normalizacion | batchnorm |
| Optimizador por defecto | adafactor |
| Scheduler por defecto | cosine |
| Pipeline de HuggingFace | No disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un **Perceiver** con mecanismo de atención lineal, fusion mediante *concat mlp*, activación *gelu tanh* y normalización por *batchnorm*. El Perceiver es un transformer de cuello de botella (*bottleneck*) en el que un conjunto reducido de latentes atiende de forma cruzada a la entrada de alta dimensionalidad, lo que desacopla el coste computacional de la longitud de la secuencia de entrada. La elección de atención lineal refuerza esa propiedad y reduce el coste asintótico respecto a la atención *softmax* cuadrática. El repositorio incluye `config.json` con los ajustes generados de arquitectura y `eval.py` como artefacto principal, con un bloque `__main__` que contiene un ejemplo de prueba de humo.

Respecto al entrenamiento: **no se ha completado ningún entrenamiento publicable**. La model card es explícita al señalar que la receta incluida (adafactor con scheduler coseno) son valores de arranque del script y no evidencia de una ejecución finalizada, y que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo pero no un checkpoint evaluado. No se documentan número de tokens, composición del dataset, ni fases de RLHF o DPO. Al ser una implementación personalizada, las APIs genéricas de carga automática de HuggingFace requieren un adaptador explícito. La guía de evaluación del autor recomienda usar una partición etiquetada específica de la tarea, reportar la métrica sobre al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- **No dispone de capacidades generativas ni de clasificación utilizables**: el checkpoint no está entrenado, por lo que no produce predicciones fiables.
- **Ejecución de código de arquitectura**: el repositorio ofrece una implementación ejecutable del Perceiver con atención lineal, pensada para inspeccionar variantes arquitectónicas.
- **Pruebas de humo**: permite verificar que un *pipeline* de carga de pesos, *forward pass* y serialización safetensors funciona de extremo a extremo.
- **Punto de entrada para experimentos**: `eval.py` y `training_args.json` sirven como base para definir recetas comparables entre variantes.
- **Tool calling / function calling**: no disponible.
- **Soporte de agentes y razonamiento multi-paso**: no disponible.
- **Capacidades multilingües**: no disponibles.
- **Capacidades especiales (vision, audio, thinking mode)**: no disponibles; la model card no documenta modalidad de entrada concreta más allá del uso para clasificación.

## Casos de uso

- **Prototipado de variantes de Perceiver**: el modelo permite iterar sobre cambios de arquitectura (tipo de atención, fusión de latentes, normalización) sin asumir el coste de un entrenamiento completo, gracias a sus 49.600 parámetros y a un script ejecutable.
- **Pruebas de integración en CI**: se puede insertar la carga del safetensors y un *forward pass* en un *pipeline* de integración continua para detectar roturas de compatibilidad en serialización, *shapes* o dependencias de PyTorch antes de escalar a un modelo entrenado.
- **Desarrollo de adaptadores de carga en HuggingFace**: dado que es una implementación personalizada, sirve como caso de prueba para escribir y validar el `trust_remote_code` o adaptador necesario que luego se reutilizará con checkpoints reales.
- **Docencia y divulgación de arquitecturas**: el tamaño reducido permite ejecutar el modelo en un portátil y trazar paso a paso el mecanismo de atención cruzada de un Perceiver en un aula o taller.
- **Referencia de línea base de baja capacidad**: en estudios de *scaling* o de comparación de arquitecturas, puede actuar como el extremo inferior de la curva de capacidad, siempre que se entrene con la misma exposición de datos y presupuesto de ajuste que las alternativas.
- **Banco de pruebas de *throughput* y latencia de atención lineal**: permite medir el coste por *forward pass* de la implementación de atención lineal aislándolo de efectos de escala, útil antes de portar el mecanismo a modelos mayores.
- **Verificación de recetas de entrenamiento**: `training_args.json` con adafactor y scheduler coseno puede usarse como plantilla para comprobar que el *harness* de entrenamiento registra correctamente optimizador, semillas y versiones de entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint incluido no ha sido entrenado ni evaluado.

## Requisitos de hardware

- **VRAM para inferencia**: con 49.600 parámetros, el peso en fp32 ocupa aproximadamente 0,2 MB. Cualquier GPU con más de 1 GB de VRAM es sobradamente suficiente; incluso la memoria compartida de una CPU basta.
- **GPU recomendadas**: no se requiere GPU. Cualquier acelerador moderno (RTX 4090, A100, H100, e incluso iGPU) ejecuta el modelo sin cuello de botella atribuible al modelo.
- **GPU de consumo**: cabe en cualquier GPU de consumo, incluidos modelos antiguos con pocos GB de VRAM, y también en CPU y en dispositivos embebidos tipo Raspberry Pi.
- **Opciones de despliegue**: al ser una implementación personalizada, no es cargable directamente con vLLM, llama.cpp, Ollama o TGI sin escribir un adaptador. La vía natural es ejecutar `python eval.py` o importar el módulo de PyTorch directamente. El repositorio no incluye pesos en GGUF ni cuantizaciones.
- **Latencia y throughput**: no disponible. No se publican mediciones de latencia ni de tokens o muestras por segundo.
- **Almacenamiento**: el repositorio ocupa 0,0 GB según HuggingFace, coherente con el tamaño del checkpoint.

## Comparativa con modelos similares

La información proporcionada no incluye métricas ni especificaciones de modelos alternativos, por lo que la comparación numérica no está disponible. Cualitativamente, la categoría a la que pertenece este repositorio es la de implementaciones de referencia de Perceiver para clasificación, y las alternativas habituales serían:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lumoreau/classification-scratch | 49.600 | No disponible | Sin benchmark (checkpoint sin entrenar) | Apache 2.0 | HuggingFace, 0 descargas |
| Perceiver IO (DeepMind) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Implementacion de referencia publicada por sus autores |
| ViT (familia) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Multiples checkpoints publicos en HuggingFace |

Advertencia: la comparación con Perceiver IO o ViT solo es válida en términos de familia arquitectónica (atención sobre entradas de alta dimensionalidad en el primer caso, transformer de visión en el segundo). Este repositorio no es un competidor en rendimiento porque su checkpoint no está entrenado.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: `model.safetensors` es una inicialización para pruebas de humo, no un modelo funcional. Cualquier métrica obtenida con él carece de significado.
- **Desajuste de etiquetado**: la escala declarada es *giant*, pero el recuento real de parámetros es de 49.600. No fiar del campo de escala para estimar coste o capacidad.
- **Sin benchmark ni auditoría**: el autor no reclama puntuaciones y advierte que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinación**: no aplica en el sentido generativo, ya que no hay un modelo de lenguaje entrenado; el riesgo equivalente es interpretar mal las salidas de un modelo sin entrenar como si fueran predicciones.
- **Idiomas y contexto**: no disponibles. El repositorio no declara idiomas soportados ni longitud de contexto máxima.
- **Carga no estándar**: al ser una implementación propia, las APIs automáticas de HuggingFace (`AutoModel`, `pipeline`) requieren un adaptador explícito; intentar cargarlo como un transformer estándar fallará.
- **Licencia**: Apache 2.0 permite uso comercial del código y de los pesos, pero el propio autor recuerda que los términos de los datos de origen deben revisarse por separado si se usa con conjuntos externos.
- **Reproducibilidad**: para obtener resultados comparables hay que entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y conservar los registros de entrenamiento y las versiones de entorno.
- **Enlaces de búsqueda no relacionados**: los resultados de búsqueda web aportados no contienen información sobre este modelo y no deben usarse como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/lumoreau/classification-scratch
- No se han encontrado en la busqueda web enlaces relevantes al modelo (paper, blog, repositorio o demo). Los resultados devueltos corresponden a consultas no relacionadas (Google Flights, foro de Zhihu sobre tarjetas graficas) y se descartan.
