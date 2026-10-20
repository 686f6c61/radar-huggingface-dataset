# arthurmmartin/mae-multitask

## Resumen

`arthurmmartin/mae-multitask` es un repositorio de HuggingFace que contiene una implementación propia y compacta en PyTorch de una arquitectura denominada **Mae**, orientada a experimentos **multitarea**. El autor la publica explícitamente en configuración **nano** y la describe como material para revisión de código, pruebas de humo (*smoke tests*) y experimentos pequeños y controlados, no como un modelo preentrenado listo para producción. El checkpoint `model.safetensors` se presenta como una inicialización válida para pruebas, no como un modelo entrenado ni evaluado.

El tamaño real registrado en el safetensors es de **24.832 parámetros** (aproximadamente 0,025 M), con un peso en disco del orden de decenas o pocos cientos de kilobytes según precisión. La arquitectura declarada usa **atención lineal**, **fusión bilinear**, activación **mish** y normalización **layernorm**. La receta de experimento por defecto del repositorio es **RMSprop** con *schedule* **cosine**.

Su relevancia ahora es acotada y de tipo técnico: sirve como esqueleto reproducible para comparar variantes arquitectónicas (atención lineal frente a atención cuadrática, distintos esquemas de fusión) y para integrar pruebas automatizadas en pipelines de investigación. No hay resultados de benchmarks, ni métricas de calidad, ni evidencia de un entrenamiento completado; el propio autor indica que cualquier resultado futuro debe documentarse por separado de los valores por defecto que se distribuyen aquí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mae (implementación propia en PyTorch; atención lineal, fusión bilinear, activación mish, normalización layernorm) |
| Parámetros totales | 24.832 (según el total registrado en `model.safetensors`) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo distribuye `model.safetensors`, sin variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), acompañado de `config.json`, `training_args.json` e `inference.py` |

## Arquitectura y entrenamiento

La arquitectura es una implementación *ad hoc* de un modelo llamado **Mae**, en escala **nano**, con cuatro decisiones técnicas declaradas en la model card: mecanismo de **atención lineal** (coste lineal en longitud de secuencia en lugar de cuadrático), **fusión bilinear** para combinar representaciones (habitual en configuraciones multitarea, donde se integran modalidades o cabeceras de tarea), activación **mish** y **layernorm** como normalización. No se especifican número de capas, dimensión oculta, número de cabezas, tamaño de vocabulario ni el mecanismo exacto de interacción entre tareas.

No hay información sobre datos de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. De hecho, el autor afirma que el checkpoint es una **inicialización** para pruebas de humo y que **no se ha entrenado** ni auditado. La receta por defecto (`training_args.json`) usa **RMSprop** con un *schedule* de tipo **cosine**, valores que el propio autor califica de punto de partida y no como evidencia de una ejecución completada. La recomendación metodológica incluida en la model card es evaluar con un conjunto de validación específico de tarea, al menos tres semillas y una línea base de capacidad equivalente.

## Capacidades

- No hay capacidades verificadas: el checkpoint no está entrenado, por lo que no se puede afirmar generación de texto, razonamiento, código o matemáticas con calidad medible.
- Soporte de *tool calling* / *function calling*: no disponible; la arquitectura no declara ninguna interfaz de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades multimodales (visión, audio): no disponible. La "fusión bilinear" es un componente de arquitectura, no una capacidad multimodal documentada.
- Capacidad operativa real: ejecución de un punto de entrada de inferencia de ejemplo (`inference.py`) y de un bucle de entrenamiento mínimo con la configuración incluida.
- Capacidad de integración: al ser una implementación propia, requiere un *adapter* explícito para funcionar con APIs genéricas de carga automática (por ejemplo, `AutoModel` de Transformers).

## Casos de uso

- Pruebas de humo en CI: ejecutar `inference.py` en cada *pull request* para verificar que los tensores de entrada y salida, las formas y el *dtype* son coherentes, dado que el modelo completo ocupa menos de 1 MB y se ejecuta en CPU en milisegundos.
- Revisión de código de capas personalizadas: validar la implementación de atención lineal y de fusión bilinear con formas de tensor conocidas antes de escalar a configuraciones mayores.
- *Scaffolding* de pipelines de entrenamiento: usar `training_args.json` (RMSprop + cosine) como receta mínima reproducible para comprobar el cableado de *dataloaders*, acumulación de gradiente y *checkpointing*.
- Estudios de ablación a pequeña escala: comparar variantes de activación (mish frente a alternativas) o de normalización manteniendo el resto de la configuración fija y midiendo con al menos tres semillas, tal como recomienda el autor.
- Pruebas de serialización y compatibilidad: verificar que `model.safetensors` se carga correctamente con distintas versiones de PyTorch y `safetensors`, y detectar roturas de compatibilidad en actualizaciones de dependencias.
- Docencia y formación interna: ejemplo didáctico de arquitectura multitarea con coste de cómputo despreciable, apto para demostrar el flujo completo desde `config.json` hasta inferencia.
- Verificación de *hardware* y *drivers*: modelo de referencia trivial para comprobar que un entorno nuevo (CUDA, ROCm, contenedor) funciona antes de desplegar cargas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor declara explícitamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint distribuido no ha sido entrenado, por lo que cualquier tabla comparativa de MMLU, HumanEval o GSM8K carecería de sentido en este estado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos. Con 24.832 parámetros, en fp32 son aproximadamente 99 KB y en fp16 unos 50 KB; el grueso del consumo proviene del *runtime* de PyTorch y de las activaciones, no del modelo.
- GPU recomendadas: ninguna en particular. Cualquier GPU con soporte CUDA, por antigua o pequeña que sea, es suficiente; el modelo también se ejecuta en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y en la mayoría de CPU. No requiere ni 1 GB de VRAM.
- Opciones de despliegue: al ser una arquitectura personalizada, no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza mediante el propio `inference.py` con PyTorch, o bien portando los pesos a un *adapter* propio.
- Latencia y *throughput*: no disponibles como cifras publicadas. Por volumen de parámetros, la latencia esperada es de microsegundos a pocos milisegundos por *forward pass* en CPU, pero no hay mediciones oficiales en el repositorio.
- Nota: la longitud de contexto no está documentada, por lo que no se puede estimar el coste de memoria de las activaciones para secuencias largas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada alternativas comparables con datos públicos, y la propia naturaleza del repositorio (implementación personalizada, no entrenada, de 24.832 parámetros) impide una comparación significativa con modelos preentrenados.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| mae-multitask (arthurmmartin) | 24.832 | No disponible | MIT | Inicialización sin entrenar |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El checkpoint **no está entrenado**: no produce salidas útiles más allá de verificar el funcionamiento del código.
- No ha sido auditado para robustez, equidad (*fairness*) ni transferencia de dominio, según declara el propio autor.
- No hay métricas, ni benchmarks, ni registro de entrenamiento que permitan reproducir resultados.
- Ausencia total de información sobre datos de entrenamiento: no se puede evaluar sesgo, contaminación de datos ni procedencia del corpus.
- Longitud de contexto e idiomas no documentados: riesgo de comportamientos indeterminados fuera del ejemplo de prueba incluido.
- Carga con APIs genéricas: al ser una implementación propia, `AutoModel` y similares requieren un *adapter* explícito; la carga directa fallará o producirá resultados incorrectos.
- Licencia MIT permite uso comercial del código y de los pesos, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usan conjuntos de datos externos.
- Repositorio con 0 descargas y 0 *likes*: sin validación por parte de la comunidad, sin *issues* ni mantenimiento verificable.
- Fechas del repositorio (creación y actualización en 2026) con apenas cuatro segundos de diferencia entre ambas: no hay historial de iteraciones que permita evaluar su evolución.

## Enlaces

- HuggingFace: https://huggingface.co/arthurmmartin/mae-multitask
- Paper: no disponible
- Blog o documentación adicional: no disponible
- Repositorio de código independiente: no disponible (el código se distribuye como `inference.py` dentro del propio repositorio de HuggingFace)
- Demo: no disponible
