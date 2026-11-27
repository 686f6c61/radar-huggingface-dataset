# bayusantoso/perceiver-matching-scratch

## Resumen

`bayusantoso/perceiver-matching-scratch` es un prototipo de investigación publicado en Hugging Face por el usuario bayusantoso. Implementa una arquitectura Perceiver orientada a tareas de *matching* (emparejamiento), es decir, la comparación y correspondencia entre pares de entradas. El repositorio se presenta explícitamente como un punto de partida experimental: el checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, no un modelo entrenado ni evaluado.

El modelo es de escala mínima: el recuento real de parámetros en safetensors es de 33.088, es decir, unos 33.000 parámetros, muy por debajo de cualquier modelo de lenguaje o visión de propósito general. Se trata, por tanto, de una implementación de referencia y no de un artefacto listo para producción. La model card no declara resultados de benchmarks y advierte que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

La relevancia de esta ficha es acotada: sirve para documentar el estado real del repositorio, evitar expectativas infladas y orientar a quien quiera reutilizar el código (`finetune.py`) como base para experimentos propios de *matching* con arquitectura Perceiver. La licencia BSD-3-Clause permite uso comercial del código, pero el propio autor recomienda revisar los términos de los datos externos que se utilicen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python/PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con cuello de botella de latentes que proyecta entradas de tamaño variable a un conjunto fijo de latentes mediante atención cruzada. Según la model card, la escala es "base", la atención es de tipo *flash*, la fusión es "concat mlp", la activación es Mish y la normalización es BatchNorm. La receta de entrenamiento por defecto usa el optimizador NovoGrad con un esquema de *linear warmup*.

No hay evidencia de un entrenamiento completado. El autor indica que los valores de configuración son puntos de partida del script y no prueba de una ejecución finalizada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO. El checkpoint incluido es únicamente una inicialización para pruebas de humo.

## Capacidades

- Implementación de referencia de un Perceiver para tareas de *matching* (emparejamiento de entradas).
- Punto de entrada de entrenamiento y ejemplo ejecutable en `finetune.py`.
- Configuración de arquitectura en `config.json` y receta de experimento en `training_args.json`.
- Checkpoint de inicialización válido para pruebas de humo.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Pruebas de humo de la implementación: cargar `model.safetensors` y ejecutar `finetune.py --help` para verificar que el entorno PyTorch y las dependencias funcionan antes de invertir en entrenamiento.
- Base para experimentos de *matching*: reutilizar la arquitectura Perceiver como punto de partida para tareas de emparejamiento con datos propios, ajustando `config.json` y `training_args.json`.
- Comparación de arquitecturas: usar la implementación como línea base de capacidad reducida frente a modelos de *matching* más grandes, con el mismo presupuesto de datos y semillas, tal como recomienda el autor.
- Reproducción de recetas: el script documenta NovoGrad con *linear warmup*, útil para estudiar el efecto del optimizador en tareas de emparejamiento.
- Docencia y prototipado: el tamaño de 33.088 parámetros permite ejecutar el modelo en CPU y en cualquier GPU consumer, lo que facilita demostraciones y ejercicios.
- Investigación metodológica: sirve para practicar la evaluación con conjunto de validación emparejado, métrica de tarea sobre al menos tres semillas y una línea base de capacidad comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 33.088 parámetros el modelo cabe holgadamente en CPU.
- GPU recomendadas: cualquier GPU consumer (por ejemplo, GTX 1060, RTX 3060, RTX 4090); no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; el autor sugiere inspeccionar el bloque `__main__` del script. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bayusantoso/perceiver-matching-scratch | 33.088 | no disponible | sin benchmarks | BSD-3-Clause | Hugging Face |
| Perceiver IO (referencia de DeepMind) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| Otros prototipos de *matching* en Hugging Face | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de modelos comparables en la información proporcionada; la comparativa queda limitada a la referencia arquitectónica.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; los pesos son una inicialización aleatoria y no producen resultados útiles de *matching*.
- No hay auditoría de robustez, equidad ni transferencia de dominio.
- No se declaran idiomas soportados ni longitud de contexto.
- Ausencia total de benchmarks: cualquier afirmación de rendimiento sería infundada.
- Implementación personalizada: las APIs automáticas de carga de Hugging Face requieren un adaptador explícito.
- Licencia BSD-3-Clause permite uso comercial del código, pero deben revisarse por separado los términos de los datos externos empleados.
- Para producción, es necesario entrenar, evaluar con un conjunto de validación emparejado y documentar los resultados de forma separada a los valores por defecto del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/bayusantoso/perceiver-matching-scratch
