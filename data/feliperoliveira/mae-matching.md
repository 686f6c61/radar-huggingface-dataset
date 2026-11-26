# feliperoliveira/mae-matching

## Resumen

`feliperoliveira/mae-matching` es un prototipo de investigación publicado en Hugging Face por el usuario feliperoliveira bajo licencia BSD-3-Clause. Se presenta como una implementación de arquitectura "Mae" orientada a tareas de *matching* (emparejamiento), en una escala denominada "nano". El repositorio incluye el código de definición del modelo y un punto de entrada de *fine-tuning* (`finetune.py`), junto con ficheros de configuración (`config.json`, `training_args.json`) y un checkpoint de pesos en formato safetensors.

El dato más relevante para evaluar su utilidad es que el checkpoint incluido es únicamente una **inicialización válida para pruebas de humo** (*smoke tests*), no un modelo entrenado. El propio autor indica explícitamente que no se reclama ninguna puntuación de benchmark y que los pesos no han sido entrenados ni auditados en robustez, equidad o transferencia de dominio. El recuento real de parámetros en safetensors es de 49.600, lo que confirma que se trata de un modelo de escala experimental, muy alejado de los transformers de propósito general.

Por tanto, esta ficha describe un artefacto de investigación reproducible más que un modelo listo para producción: sirve como esqueleto para experimentar con arquitecturas de atención dispersa y fusión por atención cruzada, pero no debe emplearse como base para aplicaciones reales sin un entrenamiento previo completo y una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (transformer con atención dispersa y fusión por atención cruzada) |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es "Mae", con atención dispersa (*sparse attention*), fusión mediante atención cruzada (*cross attention*), función de activación Mish y normalización por lotes (*batchnorm*). La escala es "nano", coherente con los 49.600 parámetros registrados en el checkpoint. El repositorio incluye un `config.json` que recoge los ajustes generados de la arquitectura y un `training_args.json` con la receta de experimento por defecto.

La receta de entrenamiento incluida especifica el optimizador NovoGrad con un *schedule* de tipo "step". El autor aclara que estos son valores de partida del script y no evidencia de una ejecución completada. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de la atención dispersa ya mencionada.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint no ha sido entrenado.
- El modelo está orientado a tareas de *matching* (emparejamiento), según el nombre y la descripción del repositorio.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- El repositorio incluye un punto de entrada ejecutable (`finetune.py`) para *fine-tuning* y pruebas de humo.

## Casos de uso

- **Pruebas de humo de infraestructura**: cargar el checkpoint de inicialización para verificar que el pipeline de entrenamiento, el cargador de datos y el guardado de pesos funcionan antes de lanzar un experimento real.
- **Investigación en arquitecturas de matching**: usar el esqueleto como base para experimentar con atención dispersa y fusión por atención cruzada en tareas de emparejamiento (p. ej., pares pregunta-respuesta o consulta-documento), sustituyendo el checkpoint por uno entrenado.
- **Reproducción de recetas de entrenamiento**: emplear `training_args.json` como plantilla de hiperparámetros (NovoGrad, schedule step) para comparar baselines con la misma exposición de datos y presupuesto de ajuste.
- **Evaluación metodológica**: el autor sugiere usar un conjunto de validación emparejado (*paired validation set*), reportar la métrica de la tarea en al menos tres semillas e incluir un baseline de capacidad comparable; el repo sirve como banco de pruebas para ese protocolo.
- **Docencia y formación**: ejemplo didáctico de estructura de repositorio de modelo (config, training args, pesos, script de fine-tuning) para quienes aprenden a publicar artefactos reproducibles.
- **Integración con APIs de carga personalizadas**: dado que es una implementación propia, requiere un adaptador explícito antes de usarse con APIs genéricas de carga automática; útil para probar mecanismos de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 49.600 parámetros, el modelo cabe holgadamente en cualquier GPU consumer (incluso en CPU), pero al no estar entrenado la inferencia carece de valor práctico.
- GPU recomendadas: no aplica para un checkpoint de inicialización; cualquier GPU con soporte PyTorch sirve para pruebas de humo.
- ¿Cabe en GPU consumer? Sí, con enorme margen, dado el tamaño nano del modelo.
- Opciones de despliegue: PyTorch nativo mediante el script incluido; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `feliperoliveira/mae-matching` | 49.600 | no disponible | BSD-3-Clause | Prototipo, checkpoint sin entrenar |
| Alternativas de matching de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (matching con arquitectura Mae a escala nano) en la información proporcionada.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: los pesos son una inicialización para pruebas de humo, no un modelo funcional; no deben usarse para inferencia real.
- **Sin auditoría**: el autor declara que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- **Sesgos**: no evaluados; al no haber datos de entrenamiento documentados, no es posible caracterizar sesgos.
- **Alucinación**: no evaluada; sin entrenamiento no procede.
- **Contexto e idiomas**: no documentados; se desconoce la longitud de contexto efectiva y los idiomas soportados.
- **Licencia**: BSD-3-Clause permite uso comercial con atribución y sin garantía; el autor advierte de revisar por separado los términos de los datos fuente si se usan datasets externos.
- **Carga automática**: al ser una implementación propia, las APIs genéricas de carga requieren un adaptador explícito.
- **Caveat de producción**: no apto para producción sin entrenamiento completo, evaluación con al menos tres semillas y baseline de capacidad comparable.

## Enlaces

- Hugging Face: https://huggingface.co/feliperoliveira/mae-matching
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
