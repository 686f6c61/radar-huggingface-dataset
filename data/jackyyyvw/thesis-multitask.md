# jackyyyvw/thesis-multitask

## Resumen

`jackyyyvw/thesis-multitask` es un repositorio de HuggingFace que contiene una implementación propia de una arquitectura tipo Mae (masked autoencoder según las etiquetas del repositorio) orientada a aprendizaje multitarea, publicada por el usuario jackyyyvw. No se trata de un modelo entrenado, sino de un andamiaje reproducible: incluye el código del modelo, un fichero `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y un checkpoint de inicialización (`model.safetensors`) pensado para pruebas de humo. La propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark.

El dato cuantitativo más relevante es el recuento real de parámetros en safetensors: 49.600. Esta cifra contrasta con la etiqueta "giant" que aparece en la tabla de arquitectura de la model card, que hace referencia a la escala de la configuración generada y no al tamaño efectivo del modelo publicado. Con ese orden de magnitud, el artefacto es un experimento de investigación de escala mínima, no un modelo de propósito general.

Su relevancia actual es limitada y acotada al ámbito de reproducción académica: sirve como punto de partida para alguien que quiera montar un pipeline multitarea con fusión por concat MLP, normalización ScaleNorm y optimizador Lion con calentamiento lineal, y compararlo contra líneas base de capacidad equivalente. No hay evidencia de entrenamiento completado, ni de idiomas soportados, ni de resultados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (masked autoencoder), atención estándar, fusión por concat MLP, activación ReLU, normalización ScaleNorm |
| Parametros totales | 49.600 (según recuento real de safetensors) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado) |

## Arquitectura y entrenamiento

La model card describe una arquitectura Mae con atención estándar ("standard"), fusión de ramas multitarea mediante un MLP sobre concatenación ("concat mlp"), función de activación ReLU y normalización ScaleNorm. La escala declarada de la configuración es "giant", aunque el checkpoint distribuido contiene 49.600 parámetros, por lo que la etiqueta de escala corresponde a la nomenclatura interna de la configuración y no al tamaño del artefacto publicado. El repositorio incluye un `config.json` que registra los ajustes generados y un `training_args.json` con la receta por defecto, que emplea el optimizador Lion junto con un calendario de calentamiento lineal.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. De hecho, la model card es explícita al respecto: el checkpoint es válido para pruebas de humo, pero no se presenta como un checkpoint entrenado ni evaluado, y no se reclama ninguna métrica. El autor recomienda que cualquier evaluación significativa utilice un conjunto de validación específico de la tarea, reporte la métrica a lo largo de al menos tres semillas e incluya una línea base de capacidad equivalente, conservando los registros de entrenamiento y las versiones del entorno.

## Capacidades

- No se documenta ninguna capacidad funcional verificada (generación de texto, razonamiento, código, matemáticas o visión) en la información disponible.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni se listan idiomas.
- La estructura del código sugiere un propósito de investigación multitarea (fusión concat MLP), pero se trata de una intención de diseño, no de una capacidad medida.
- El repositorio incluye un `eval.py` como artefacto principal, con un bloque `__main__` que contiene un ejemplo de prueba de humo.
- Al ser una implementación propia, las API genéricas de carga automática de HuggingFace requieren un adaptador explícito antes de poder usarse.

## Casos de uso

- Pruebas de humo de infraestructura: verificar que un pipeline de carga de safetensors, `config.json` y `training_args.json` funciona de extremo a extremo antes de lanzar un experimento real, dado que el checkpoint es una inicialización válida y de tamaño despreciable.
- Reproducción de una tesis o trabajo académico: sirve como andamiaje reproducible para reentrenar con la receta Lion más calentamiento lineal y comparar contra líneas base de capacidad equivalente, tal y como recomienda el propio autor.
- Estudio de mecanismos de fusión multitarea: permite experimentar con la estrategia "concat mlp" frente a alternativas, midiendo el efecto sobre tareas específicas con conjuntos de validación propios.
- Comparativa de normalización: al usar ScaleNorm en lugar de LayerNorm, es un banco de pruebas barato para analizar estabilidad de entrenamiento en modelos de muy pocos parámetros.
- Docencia y formación: un ejemplo mínimo y ejecutable (49.600 parámetros, con `eval.py --help` como primera comprobación) resulta adecuado para explicar la estructura de un proyecto de investigación en aprendizaje profundo sin requerir hardware especializado.
- Prototipado de evaluaciones: sirve para validar el protocolo de evaluación (métrica por tarea, tres semillas, línea base emparejada) antes de aplicarlo a modelos mayores, evitando costes de cómputo innecesarios.
- Desarrollo de adaptadores de carga: dado que requiere un adaptador explícito para las API automáticas, es un caso práctico para escribir y probar dicho adaptador contra un modelo de dimensiones triviales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 198 KB solo para los pesos (49.600 parámetros x 4 bytes), más el estado del optimizador y activaciones si se entrena.
- VRAM estimada en FP16: aproximadamente 99 KB; en INT8, aproximadamente 50 KB. Son estimaciones derivadas del recuento de parámetros, ya que no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible. Por tamaño, cabe en cualquier GPU, incluidos modelos integrados y aceleradores de gama de entrada.
- Cabe en GPU de consumo: sí, en cualquiera; también es viable en CPU y en dispositivos de placa única tipo Raspberry Pi.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama o TGI. Al ser una implementación propia, el uso previsto es la ejecución directa del script de PyTorch con un adaptador explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni líneas base. La model card recomienda construir una línea base de capacidad emparejada como parte de cualquier evaluación, pero no especifica ninguna.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jackyyyvw/thesis-multitask | 49.600 | no disponible | sin benchmarks publicados | BSD-3-Clause | HuggingFace, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se declaran idiomas soportados ni sesgos conocidos; no hay material para evaluar sesgo alguno.
- Riesgo de alucinación: no evaluable, ya que no hay un modelo entrenado que produzca salidas.
- Discrepancia documental: la etiqueta de escala "giant" de la model card no se corresponde con los 49.600 parámetros del checkpoint distribuido; conviene no confundir configuración con artefacto.
- Al ser una implementación propia, no es cargable con API genéricas sin escribir un adaptador.
- Licencia BSD-3-Clause: permite uso comercial con atribución y conservación del aviso de copyright, pero el autor advierte de que los términos de los datos de origen deben revisarse por separado si se emplean datasets externos.
- Resultados de un futuro checkpoint entrenado deberán documentarse de forma independiente a los valores por defecto aquí incluidos.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo (corresponden a listados de hoteles), por lo que no aportan enlaces ni datos adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/jackyyyvw/thesis-multitask
- Fichero de modelo: https://huggingface.co/jackyyyvw/thesis-multitask/blob/main/model.safetensors
- Configuración de arquitectura: https://huggingface.co/jackyyyvw/thesis-multitask/blob/main/config.json
- Receta de experimento: https://huggingface.co/jackyyyvw/thesis-multitask/blob/main/training_args.json
- Script de evaluación: https://huggingface.co/jackyyyvw/thesis-multitask/blob/main/eval.py
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
