# marcelocarvalho/mixer-baseline

## Resumen

`marcelocarvalho/mixer-baseline` es un repositorio de investigación publicado por el usuario marcelocarvalho en Hugging Face que contiene una implementación de una arquitectura **Mixer** (MLP-Mixer, es decir, mezclas de tokens y canales sin atención clásica) con un checkpoint de **inicialización**, no un modelo entrenado. El propio autor lo describe explicitamente como "a reproducible starting point, not a trained model release" y aclara que no se reclama ninguna puntuación de benchmark. El tamaño real registrado en el fichero `model.safetensors` es de **24.832 parámetros totales**, un orden de magnitud propio de un test de humo, no de un modelo desplegable.

El interés del repositorio es, por tanto, instrumental: sirve como esqueleto reproducible para experimentos de arquitectura (atención dilatada, fusión *co-attention*, activación swish, normalización RMSNorm) y como base para comparar recetas de entrenamiento bajo la misma exposición de datos y presupuesto de ajuste. No es un modelo de lenguaje: no incluye tokenizador, no genera texto y no soporta instrucciones.

La relevancia ahora es metodológica: el autor insiste en que cualquier evaluación útil debe hacerse sobre un conjunto de validación específico de la tarea, con al menos tres semillas y una línea base de capacidad equiparable. Conviene tratar esta ficha como la de un artefacto de ingeniería experimental, no la de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (mezclas de tokens/canales), atencion dilatada, fusion co-attention |
| Parametros totales | 24.832 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card ni en los tags) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch); incluye `config.json` y `training_args.json` |

Otros datos tecnicos declarados por el autor:

| Parametro | Valor |
|---|---|
| Escala declarada | "giant" (etiqueta del autor; no concuerda con los 24.832 parametros) |
| Activacion | swish |
| Normalizacion | rmsnorm |
| Optimizador por defecto | LAMB |
| Scheduler por defecto | warmup constante |
| Ficheros del repo | `predict.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` |
| Tamano del repo | 0.0 GB |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un **Mixer** con atención de tipo **dilatada** y un esquema de fusión denominado **co-attention**, con activación **swish** y normalización **RMSNorm**. La model card indica que el fichero Python contiene tanto la definición del modelo como un ejemplo ejecutable o punto de entrada de entrenamiento, que `config.json` recoge los ajustes generados de la arquitectura y que `training_args.json` guarda la receta de experimento por defecto. El autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.

No hay entrenamiento que reportar: `model.safetensors` es un **checkpoint de inicialización válido para pruebas de humo**, no un checkpoint entrenado. La receta por defecto (optimizador LAMB con warmup constante) se presenta como valores de partida del script, no como evidencia de una ejecución completada. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones; tampoco se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- **No hay capacidades de generación de texto demostradas**: el repositorio no incluye tokenizador ni un modelo entrenado, por lo que no puede generar lenguaje, código ni matemáticas.
- **No se documenta soporte de tool calling ni function calling**.
- **No se documenta soporte de agentes ni razonamiento multi-paso**.
- **No se declaran capacidades multilingües** (el campo de idiomas no está disponible).
- **No hay visión, audio ni modo "thinking"**.
- **Sí ofrece capacidad de andamiaje experimental**: definición de arquitectura en Python ejecutable, configuración explícita versionada y checkpoint de inicialización para pruebas de integración.
- **Punto de entrada de ejecución**: `python predict.py --help` expone la interfaz del script, y el bloque `__main__` contiene un ejemplo de prueba de humo.

## Casos de uso

- **Pruebas de humo de pipelines de entrenamiento**: usar el checkpoint de inicialización para verificar que el bucle de entrenamiento, el *dataloader* y el guardado de checkpoints funcionan antes de lanzar un *run* real. Es adecuado porque el autor lo declara explícitamente válido para *smoke tests*.
- **Validación de infraestructura de CI**: integrar `predict.py` en un *job* de integración continua que compruebe que la arquitectura se instancia y ejecuta un *forward pass* con la configuración de `config.json`, detectando roturas por cambios de versión de PyTorch.
- **Línea base de capacidad equiparable en experimentos de arquitectura**: comparar variantes de atención dilatada o de fusión *co-attention* contra este esqueleto con la misma exposición de datos, presupuesto de ajuste y semillas, tal como recomienda el autor.
- **Estudio didáctico de arquitecturas Mixer**: inspeccionar una implementación concreta de mezclas con RMSNorm y swish, útil en docencia o en revisión de código de investigación, dado el tamaño reducido y la presencia de configuración explícita.
- **Reproducción de recetas de optimización**: probar el efecto de LAMB con warmup constante frente a otras combinaciones sobre un modelo de 24.832 parámetros, donde cada iteración es computacionalmente trivial.
- **Desarrollo de adaptadores de carga personalizados**: dado que las APIs automáticas de Hugging Face no cargan esta implementación sin adaptador, sirve como caso de prueba para escribir y validar dicho adaptador.
- **Verificación de serialización en safetensors**: comprobar el ciclo de guardado y recarga de pesos con `model.safetensors` en un modelo de menos de 100 KB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado, por lo que no existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 MB. Con 24.832 parámetros, los pesos en fp32 ocupan aproximadamente 99 KB; en fp16, unos 50 KB. Cualquier GPU, e incluso CPU, es suficiente.
- **GPU recomendadas**: no aplica ninguna recomendación específica; el modelo cabe holgadamente en cualquier acelerador, incluidos iGPU y CPUs. No se dispone de datos de rendimiento en A100, H100 o RTX 4090 porque el modelo no está entrenado para una tarea medible.
- **¿Cabe en GPU de consumo?**: sí, en todas, con un consumo de memoria despreciable.
- **Opciones de despliegue**: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La model card indica que se requiere un adaptador explícito para las APIs de carga automática, y el punto de entrada previsto es la ejecución directa de `predict.py`.
- **Latencia y throughput**: no disponibles. No tiene sentido reportar métricas de inferencia para un checkpoint sin entrenar y sin tarea definida.

## Comparativa con modelos similares

Los únicos artefactos comparables encontrados en la búsqueda web son otros esqueletos Mixer del mismo ecosistema, no modelos entrenados.

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `marcelocarvalho/mixer-baseline` | Mixer, atencion dilatada, co-attention | 24.832 | no disponible | sin benchmarks (checkpoint de inicializacion) | MIT | Hugging Face |
| `marcelocarvalho/retrieval68` | Mixer orientado a retrieval | no disponible | no disponible | sin benchmarks declarados | MIT | Hugging Face |
| `georgecevans/mixer-baseline` | Mixer con enfoque contrastivo | no disponible | no disponible | sin benchmarks declarados | Apache 2.0 | Hugging Face |

No se han identificado modelos entrenados de la misma categoría y tamaño en la información proporcionada; la comparación con modelos de lenguaje establecidos no sería homogénea, dado que este repositorio no es un modelo de lenguaje.

## Limitaciones y advertencias

- **No es un modelo entrenado**: el checkpoint contiene pesos de inicialización; cualquier salida carece de valor predictivo hasta que se entrene y se documente por separado.
- **Incoherencia de escala**: la model card etiqueta la variante como "giant", pero el recuento real de safetensors es de 24.832 parámetros. Conviene no fiarse de la etiqueta y usar el dato del fichero de pesos.
- **Sin tokenizador ni pipeline**: no puede usarse con `transformers` de forma directa; requiere adaptador y código propio.
- **Riesgo de alucinación**: no evaluable, al no existir capacidad generativa. No hay advertencias sobre sesgos porque no se ha auditado el modelo; el autor indica que no ha sido revisado en robustez, equidad ni transferencia de dominio.
- **Sin datos de idioma ni de contexto**: no se puede garantizar cobertura multilingüe ni ventanas de contexto concretas.
- **Restricciones de licencia**: la licencia es MIT, permisiva y apta para uso comercial del código y los pesos; el autor advierte de que deben revisarse por separado los términos de los datos de origen cuando se use con datasets externos.
- **Fecha de creación anómala**: el repositorio figura como creado el 2026-10-19, posterior a la fecha habitual de consulta; conviene verificar la metadata antes de citarlo.
- **Cero tracción**: 0 descargas y 0 likes, sin issues ni validación externa; no existe evidencia de uso en producción.
- **Reproducibilidad**: el autor exige conservar los registros de entrenamiento y las versiones de entorno junto a cualquier resultado publicado, y comparar siempre con una línea base de capacidad equivalente y al menos tres semillas.

## Enlaces

- Repositorio principal: https://huggingface.co/marcelocarvalho/mixer-baseline
- Repositorio hermano (Mixer para retrieval): https://huggingface.co/marcelocarvalho/retrieval68
- Esqueleto Mixer alternativo (licencia Apache 2.0): https://huggingface.co/georgecevans/mixer-baseline/tree/main
- Papers, blogs, demos o repositorios adicionales: no disponibles en la informacion proporcionada.
