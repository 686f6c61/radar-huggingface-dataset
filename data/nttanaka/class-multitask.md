# Nttanaka/class-multitask

## Resumen

`Nttanaka/class-multitask` es un prototipo de investigación publicado en HuggingFace por el usuario Nttanaka. Se presenta como una implementación de Poolformer orientada a tareas múltiples (multitask), con una configuración etiquetada como "large" en su `config.json`. El repositorio incluye el código de entrenamiento (`train.py`), la configuración de arquitectura, una receta de experimento por defecto y un checkpoint de inicialización en formato `safetensors`. No es un modelo entrenado ni evaluado: el propio autor indica explícitamente que los pesos son una inicialización válida para pruebas de humo (smoke tests) y que no se reclama ninguna métrica de rendimiento.

El dato más relevante para un evaluador es su tamaño real: 33.088 parámetros según los tensores publicados. Esa cifra es incompatible con la etiqueta "large" y con cualquier uso práctico como modelo de lenguaje o de visión: se trata de un esqueleto de código ejecutable, no de un modelo con capacidades aprendidas. El repositorio ocupa 0,0 GB, no tiene descargas ni "likes", y su fecha de creación registrada (2026-10-20) es posterior a la fecha actual, lo que sugiere un artefacto generado de forma automática o sintética.

Su interés, por tanto, no está en las capacidades del modelo sino en el andamiaje: una plantilla reproducible de arquitectura Poolformer con fusión multitarea, útil como base para experimentos propios o como caso de estudio de repositorios de modelos sin entrenar. Cualquier evaluación de calidad debe hacerse después de entrenar desde cero con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Poolformer (según model card), con atención de ventana deslizante y fusión por co-atención |
| Parametros totales | 33.088 (según `model.safetensors`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica `safetensors` en precisión original) |
| Idiomas soportados | No disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | `safetensors` (checkpoint de inicialización), más `config.json` y `training_args.json` |

Otras especificaciones declaradas en la model card: escala "large", activación ReLU, normalización GroupNorm, optimizador NovoGrad y schedule exponencial.

## Arquitectura y entrenamiento

La arquitectura declarada es Poolformer, una familia derivada de MetaFormer en la que la mezcla de tokens se realiza mediante operaciones de *pooling* en lugar de autoatención. La model card añade dos elementos que no forman parte del Poolformer original: atención de ventana deslizante (*sliding window*) y fusión mediante co-atención, lo que sugiere una variante híbrida para combinar ramas de distintas tareas. La normalización es GroupNorm y la activación ReLU, coherentes con el diseño tipo MetaFormer. No se documenta el número de capas, dimensión de embedding, número de cabezas ni resolución de entrada.

No hay entrenamiento completado. El autor describe `training_args.json` como "valores de partida en el script, no evidencia de una ejecución terminada" y usa NovoGrad con schedule exponencial como receta por defecto. No se especifica volumen de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. El checkpoint `model.safetensors` es una inicialización aleatoria para pruebas de humo. Con 33.088 parámetros, la implementación es funcionalmente un juguete: a modo de referencia, las variantes PoolFormer reales (S12, S24, S36) manejan entre 12 y 36 millones de parámetros.

## Capacidades

- No se declara ninguna capacidad aprendida: el checkpoint no ha sido entrenado, por lo que no genera texto, no razona, no escribe código y no resuelve problemas matemáticos.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües; el campo de idiomas está vacío en la ficha de HuggingFace.
- No se documentan modos especiales (thinking, visión, audio).
- Lo que sí ofrece el repositorio es una implementación ejecutable de referencia: `train.py` con bloque `__main__` de ejemplo, `config.json` con los ajustes de arquitectura y `training_args.json` con la receta por defecto.
- El script está pensado para inspección y modificación; el propio autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito porque la implementación es personalizada.

## Casos de uso

- Pruebas de humo de pipelines de ML: el checkpoint de inicialización permite verificar que un flujo de carga, preprocesado e inferencia funciona de extremo a extremo antes de invertir en un entrenamiento real, sin coste de GPU.
- Andamiaje para investigación en arquitecturas MetaFormer: sirve como punto de partida para estudiar variantes de Poolformer con atención de ventana deslizante y fusión por co-atención, modificando `config.json` y escalando el número de parámetros.
- Comparativa de recetas de optimización: la inclusión de NovoGrad con schedule exponencial permite usar el repositorio como banco de pruebas para contrastar optimizadores y schedulers bajo la misma exposición de datos, tal como sugiere el autor.
- Docencia y formación: un modelo de 33 K parámetros es adecuado para explicar en clase el ciclo completo de un repositorio de HuggingFace (config, pesos, script de entrenamiento, licencia) sin necesidad de infraestructura.
- Integración en CI/CD como test de regresión estructural: validar que los cambios en un *wrapper* propio siguen produciendo tensores con las formas y tipos esperados cuando se carga `model.safetensors`.
- Base para experimentos multitarea con datos propios: el esqueleto de co-atención permite añadir cabezas por tarea y entrenar desde cero en un conjunto etiquetado propio, siempre documentando los resultados por separado de los valores por defecto del repositorio.
- Auditoría de repositorios generados automáticamente: útil como ejemplo de artefacto con metadatos incoherentes (escala "large" frente a 33 K parámetros, fecha futura) para diseñar controles de calidad en un catálogo de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que "no benchmark score is claimed in this repository" y que el checkpoint no ha sido entrenado ni auditado. Cualquier cifra de MMLU, HumanEval, GSM8K o similares sería inventada y no debe atribuirse a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (33.088 parámetros en `safetensors`); el repositorio completo ocupa 0,0 GB.
- GPU recomendadas: ninguna en particular; cabe en cualquier GPU, incluida una iGPU, y funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650 o inferiores), con un consumo de memoria despreciable.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Al ser una implementación personalizada, el propio autor indica que las APIs de carga automática necesitan un adaptador explícito; el uso previsto es ejecutar `python train.py --help` y el bloque `__main__` del script.
- Latencia y throughput: no disponibles. Con 33 K parámetros el coste por paso sería del orden de microsegundos, pero no hay mediciones publicadas y el modelo no produce salidas útiles al no estar entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nttanaka/class-multitask` | 33.088 | No disponible | Sin benchmarks; checkpoint sin entrenar | BSD-3-Clause | HuggingFace, 0 descargas |
| PoolFormer S12 (Yu et al., 2021) | ~12 M | No aplica (visión, resolución fija) | Resultados publicados en ImageNet-1K | Apache 2.0 (repo oficial) | Público con pesos entrenados |
| PoolFormer S36 (Yu et al., 2021) | ~31 M | No aplica (visión, resolución fija) | Resultados publicados en ImageNet-1K | Apache 2.0 (repo oficial) | Público con pesos entrenados |
| ResNet-50 | ~25 M | No aplica (visión) | Resultados publicados en ImageNet-1K | BSD-3-Clause / MIT según implementación | Ampliamente disponible |

La comparación relevante es de escala: este repositorio tiene entre dos y tres órdenes de magnitud menos parámetros que las variantes PoolFormer de referencia, y carece de pesos entrenados, por lo que no es sustituible por ellas en ninguna tarea real. Las cifras de rendimiento de los modelos comparados no se reproducen aquí porque no forman parte de la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce ninguna salida útil y no debe presentarse como modelo funcional.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- No hay métricas de ningún tipo; cualquier comparación de calidad es imposible sin un entrenamiento y una evaluación propios.
- La escala declarada ("large") es incoherente con los 33.088 parámetros reales; conviene tratar la etiqueta como un valor por defecto del generador de configuración, no como una especificación.
- La fecha de creación registrada (2026-10-20) es futura, lo que apunta a un artefacto generado de forma sintética o con reloj incorrecto.
- El campo de idiomas está vacío y no hay pipeline declarado en HuggingFace; la carga con `transformers` no está soportada sin código propio.
- La licencia BSD-3-Clause permite uso comercial y modificación con atribución, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usa con datasets externos.
- No hay garantía de mantenimiento: cero descargas, cero "likes" y un único artefacto publicado.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (solo resultados no relacionados), por lo que no se ha podido contrastar nada fuera de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nttanaka/class-multitask
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
