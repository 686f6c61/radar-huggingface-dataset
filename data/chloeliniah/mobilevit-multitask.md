# chloeliniah/mobilevit-multitask

## Resumen

El repositorio `chloeliniah/mobilevit-multitask` contiene una implementación compacta y personalizada del modelo MobileViT en PyTorch, orientada a tareas multitarea. El autor lo presenta como una configuración **xlarge** pensada para revisión de código, pruebas de humo y experimentos controlados, no como un modelo preentrenado listo para producción. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas, pero no ha sido entrenado y no se reivindica ningún resultado de benchmark.

Con solo 49.600 parámetros (una cifra inusualmente baja para una variante xlarge de MobileViT), este repositorio debe entenderse como un esqueleto arquitectónico y un punto de partida experimental. Su relevancia radica en ofrecer una base de código limpia y configurable para investigar arquitecturas MobileViT con atención lineal y fusión tensorial, aunque cualquier uso práctico requiere un entrenamiento posterior completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (variante xlarge personalizada) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño MobileViT, que combina convoluciones (bloques residuales invertidos de MobileNetV2) con bloques transformer ligeros para capturar representaciones globales. En esta implementación concreta se emplea **atención lineal**, **fusión tensorial** (tensor fusion), activación **approx gelu** y **batchnorm** como normalización. La escala declarada es **xlarge**, aunque el número de parámetros real (49.600) sugiere una versión drásticamente reducida o una inicialización simbólica.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición de dataset ni técnicas de alineación (RLHF/DPO). El repositorio incluye un `training_args.json` con una receta por defecto (optimizador **lion** con programación de tasa de aprendizaje **cosine**), pero el propio autor aclara que son valores de partida y no evidencia de un entrenamiento completado. El checkpoint es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- **Generación de características visuales**: al ser MobileViT, puede extraer representaciones de imágenes, pero este checkpoint concreto no ha sido entrenado, por lo que sus salidas no son útiles para tareas reales sin un entrenamiento previo.
- **Soporte multitarea**: la arquitectura está diseñada para múltiples cabezas de salida, pero no hay cabezas entrenadas ni pesos funcionales.
- **Personalización**: el script `finetune.py` permite ajustar el modelo a tareas específicas, aunque requiere un adaptador explícito para APIs de carga automática genéricas.
- **Sin capacidades de texto, tool calling, agentes o razonamiento**: es un modelo de visión puro y no entrenado.

## Casos de uso

- **Pruebas de humo en pipelines de CI/CD**: el checkpoint de inicialización permite verificar que el código de entrenamiento y la infraestructura funcionan sin errores, ejecutando pasos de avance y retropropagación con datos sintéticos.
- **Desarrollo de algoritmos de entrenamiento multitarea**: los investigadores pueden usar este repositorio como base para implementar y depurar nuevas funciones de pérdida o estrategias de fusión de tareas antes de escalar a modelos grandes.
- **Estudio de arquitecturas MobileViT ligeras**: al ser una implementación compacta, facilita la experimentación con variantes de atención lineal y normalización en entornos con recursos limitados.
- **Comparación de recetas de optimización**: el `training_args.json` con optimizador lion y schedule cosine sirve como punto de partida para comparar configuraciones de hiperparámetros en igualdad de condiciones.
- **Integración de adaptadores personalizados**: dado que las APIs automáticas requieren un adaptador explícito, el repositorio es útil para practicar la creación de interfaces de carga para modelos custom.
- **Generación de checkpoints de referencia**: puede emplearse para inicializar pesos y comparar estrategias de inicialización o regularización en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado. Cualquier evaluación futura debe realizarse tras un entrenamiento completo y documentarse por separado.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 49.600 parámetros, la inferencia y el entrenamiento requieren menos de 1 GB de VRAM. Es ejecutable en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de entrada (GTX 1650, RTX 3050) o incluso CPUs. No se requieren A100 ni H100.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: al ser una implementación custom, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se debe usar el script `finetune.py` o escribir un adaptador para cargar los safetensors con PyTorch estándar.
- **Latencia y throughput**: no disponibles, pero dada la magnitud de parámetros, la latencia será mínima (del orden de microsegundos por imagen en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chloeliniah/mobilevit-multitask | 49.600 | N/A (visión) | No | BSD-3-Clause | Repo experimental |
| MobileViT-S (oficial) | ~5.6M | N/A (visión) | Sí | Apache-2.0 | Hugging Face, Keras |
| MobileViT-XS (oficial) | ~2.3M | N/A (visión) | Sí | Apache-2.0 | Hugging Face, Keras |
| MobileViTV2-1.0 | ~4.9M | N/A (visión) | Sí | Apache-2.0 | Hugging Face |

La comparativa muestra que este repositorio no es comparable en rendimiento a las versiones oficiales de MobileViT, que sí están preentrenadas y tienen millones de parámetros. Su utilidad es exclusivamente como código de referencia o base experimental.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: los pesos son una inicialización aleatoria; cualquier salida del modelo carece de significado semántico.
- **Sin evaluación de robustez, equidad ni transferencia de dominio**: el autor advierte que no se ha auditado el checkpoint para estos aspectos.
- **Riesgo de alucinación**: no aplica directamente al ser un modelo de visión sin generación de texto, pero las representaciones no entrenadas pueden producir resultados engañosos si se interpretan erróneamente.
- **Sin soporte de APIs estándar**: requiere un adaptador explícito para cargar el modelo con librerías genéricas.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial y modificación, pero el autor recomienda revisar los términos de los datos externos si se usan con datasets propios.
- **No apto para producción**: el propio autor lo declara como experimental y destinado a pruebas de humo o experimentos controlados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chloeliniah/mobilevit-multitask
- Documentación oficial de MobileViT en Hugging Face: https://huggingface.co/docs/transformers/model_doc/mobilevit
- Ejemplo de MobileViT en Keras: https://keras.io/examples/vision/mobilevit/
- Documentación de MobileViTV2 en Hugging Face: https://huggingface.co/docs/transformers/model_doc/mobilevitv2
- Configuraciones de MobileViT en MMPretrain: https://github.com/open-mmlab/mmpretrain/blob/main/configs/mobilevit/README.md
- Artículo sobre MobileViT multitarea para lesiones cutáneas: https://www.researchsquare.com/article/rs-10583629/v1
