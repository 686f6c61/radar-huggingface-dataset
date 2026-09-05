# aaravpatel/contrastive-scratch

## Resumen

Este repositorio contiene una implementación compacta y personalizada en PyTorch de la arquitectura Albef (Align before Fuse) orientada al aprendizaje contrastivo, desarrollada por aaravpatel. Aunque la configuración se etiqueta como "huge", el checkpoint real de `model.safetensors` ocupa únicamente 49.600 parámetros, por lo que se trata de una implementación diseñada para revisiones de código, pruebas de humo y experimentos controlados, no como un modelo preentrenado listo para producción.

El repositorio incluye el código fuente (`train.py`), los archivos de configuración (`config.json`, `training_args.json`) y un checkpoint de inicialización válido para pruebas de humo. El autor no presenta ningún resultado de benchmarks ni afirma que los pesos hayan sido entrenados. La publicación resulta relevante como referencia de arquitectura y como punto de partida para experimentos de investigación, pero no ofrece capacidades funcionales de inferencia en su estado actual.

La licencia es Apache-2.0, lo que permite su uso y modificación, aunque el estado del modelo limita su aplicación práctica a entornos de desarrollo y estudio académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Albef (atención estándar, fusión Tucker, activación swish, normalización layernorm) |
| Parametros totales | 49.600 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación define una arquitectura Albef con escala etiquetada como "huge", aunque el número real de parámetros (49.600) indica que no se corresponde con un modelo de gran tamaño. La configuración registrada en `config.json` especifica atención estándar, fusión Tucker, activación swish y normalización layernorm. No se incluyen datos de entrenamiento ni se menciona ningún proceso de RLHF, DPO o ajuste posterior.

El autor indica que el checkpoint de `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un checkpoint entrenado. El script `train.py` contiene el modelo y un punto de entrada de ejemplo o de entrenamiento, con una receta experimental por defecto que usa el optimizador Adafactor con programación polinómica. Esta receta es solo un valor de arranque, no evidencia de un entrenamiento completado. Para una evaluación significativa, se requeriría entrenar todas las variantes con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- El código Python define la arquitectura Albef y un punto de entrada ejecutable para entrenamiento o pruebas de humo.
- El checkpoint de inicialización permite validar que el flujo de datos y el entrenamiento básico no fallan en un entorno local.
- No se han demostrado capacidades funcionales de inferencia, generación, razonamiento, código, matemáticas o visión.
- No está disponible soporte de tool calling ni function calling.
- No está disponible soporte de agentes ni razonamiento multi-paso.
- No se han declarado capacidades multilingües ni idiomas soportados.
- El diseño está orientado a aprendizaje contrastivo imagen-texto, pero al no estar entrenado, no se pueden afirmar resultados prácticos de asociación entre modalidades.

## Casos de uso

- Pruebas de humo en pipelines de CI: el script `train.py` incluye un ejemplo ejecutable que permite comprobar automáticamente que la implementación no falla al instanciar la arquitectura y ejecutar un paso de entrenamiento.
- Revisión de código de arquitecturas contrastivas: al ser una implementación compacta y legible, resulta útil para auditar la lógica de la fusión Tucker, la normalización y el bucle de entrenamiento.
- Experimentos controlados de investigación: se puede usar como punto de partida para comparar variantes de configuración (atención, fusión, activación) sobre datasets sintéticos o pequeños, con semillas controladas.
- Integración en entornos de desarrollo sin GPU: el tamaño reducido permite ejecutar la arquitectura en CPUs de bajo coste para validaciones rápidas.
- Enseñanza de aprendizaje contrastivo: el código sirve como material didáctico para explicar los componentes de un modelo Albef y su implementación en PyTorch.
- Base para reentrenamiento con datasets propios: los pesos inicializados pueden reemplazarse o reentrenarse para adaptar la arquitectura a una tarea concreta, siempre que se documenten los resultados por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB en FP32 (49.600 parámetros), por lo que puede ejecutarse en CPU sin problemas.
- GPU recomendadas: ninguna; cualquier GPU, incluso integrada, es suficiente para pruebas de humo.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo y también en CPU.
- Opciones de despliegue: la implementación requiere un adaptador explícito, ya que no es compatible con APIs genéricas de carga automática. El artefacto principal es `train.py`, que se puede ejecutar directamente con PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de comparación directa, ya que se trata de una implementación no entrenada con 49.600 parámetros, mientras que los modelos funcionales de la misma familia arquitectónica (Albef, CLIP) suelen tener decenas o cientos de millones de parámetros y están preentrenados.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no se le pueden atribuir capacidades de predicción o razonamiento.
- No se ha realizado ninguna auditoría de robustez, equidad, seguridad o transferencia de dominio.
- El modelo no está recomendado para uso en producción.
- La implementación es personalizada y no es compatible con APIs genéricas de carga automática; se requiere un adaptador explícito antes de su uso.
- Los resultados obtenidos con este checkpoint deben documentarse por separado de cualquier valor por defecto incluido en el repositorio.
- La licencia Apache-2.0 permite uso comercial con atribución, pero el modelo no incluye datos de entrenamiento ni pesos entrenados, por lo que su valor comercial práctico es nulo.
- Si se utiliza con datasets externos, deben revisarse los términos de la fuente de datos por separado.

## Enlaces

- HuggingFace: https://huggingface.co/aaravpatel/contrastive-scratch
