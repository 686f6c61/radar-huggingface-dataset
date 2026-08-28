# gnascimentoeli/blip-baseline

## Resumen

Este repositorio contiene una implementación compacta y personalizada en PyTorch del modelo BLIP (Bootstrapping Language-Image Pre-training) orientada a tareas de generación. El autor, gnascimentoeli, lo presenta como un artefacto de código para revisión, pruebas de humo y experimentos controlados a pequeña escala, no como un lanzamiento preentrenado listo para producción.

El checkpoint incluido (`model.safetensors`) tiene únicamente 16.576 parámetros y es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado. No se reclama ningún resultado de benchmark en el repositorio. La configuración "large" se refiere a la escala de arquitectura de BLIP, pero el checkpoint no corresponde a un modelo preentrenado real.

La relevancia de este repositorio es principalmente educativa y de desarrollo: permite inspeccionar una implementación personalizada de BLIP, ejecutar pruebas de integración y servir como punto de partida experimental. No debe confundirse con los modelos BLIP oficiales de Salesforce, que sí están preentrenados sobre 129 millones de pares imagen-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (implementación personalizada en PyTorch) |
| Parametros totales | 16.576 (checkpoint de inicialización) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es BLIP en configuración "large", con atención estándar, fusión bilineal, activación GELU y normalización ScaleNorm. Se trata de una implementación personalizada en PyTorch que no es compatible con las APIs de carga automática de HuggingFace sin un adaptador explícito.

El repositorio incluye un `config.json` con la configuración de arquitectura y un `training_args.json` con la receta experimental por defecto (optimizador adafactor con programación de calentamiento constante). Sin embargo, estos son valores iniciales del script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es un checkpoint de inicialización para pruebas de humo; no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Capacidades

- El modelo no tiene capacidades demostradas de generación, razonamiento o codificación, ya que no está entrenado.
- La implementación de BLIP subyacente, en su versión oficial de Salesforce, está diseñada para captioning de imágenes, respuesta visual a preguntas (VQA) y recuperación imagen-texto.
- El repositorio permite ejecutar un ejemplo de prueba de humo mediante `python model.py --help`, que inspecciona el bloque `__main__` del script.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües en su estado actual.
- No hay capacidades de visión, audio o thinking mode implementadas en este checkpoint.

## Casos de uso

- Revisión de código: el repositorio permite inspeccionar una implementación personalizada de BLIP en PyTorch, útil para desarrolladores que quieran entender la arquitectura interna o adaptarla a sus necesidades.
- Pruebas de humo (smoke tests): el checkpoint de inicialización es válido para verificar que el pipeline de carga, forward pass y entrenamiento funciona sin errores antes de lanzar experimentos completos.
- Experimentos controlados a pequeña escala: la configuración "large" puede servir como punto de partida para entrenar un modelo desde cero con datos propios, siguiendo la guía de evaluación del autor (conjunto de validación específico, tres semillas, línea base de capacidad comparable).
- Educación y formación: estudiantes e investigadores pueden estudiar la implementación de BLIP sin depender de las APIs de alto nivel de HuggingFace, entendiendo los componentes internos (atención, fusión, normalización).
- Desarrollo de adaptadores de integración: como la implementación no es compatible con las APIs automáticas de HuggingFace, los desarrolladores pueden crear adaptadores explícitos para conectar este código con pipelines existentes.
- Investigación de arquitecturas: el `config.json` permite experimentar con variaciones de la arquitectura BLIP (atención, fusión, activación, normalización) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en este repositorio.

## Requisitos de hardware

- Con solo 16.576 parámetros, el modelo cabe en cualquier hardware, incluso CPU sin GPU.
- No se requieren GPUs específicas; cualquier entorno de desarrollo con PyTorch instalado es suficiente.
- El repositorio no incluye configuraciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.
- Para entrenar desde cero una configuración BLIP "large" real (con cientos de millones de parámetros), se necesitarían GPUs de alta gama como A100 o H100, pero esto no es aplicable al checkpoint incluido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia |
|---|---|---|---|---|
| gnascimentoeli/blip-baseline | 16.576 | no disponible | checkpoint de inicialización, sin entrenar | bsd-3-clause |
| Salesforce BLIP base | ~150M | 512 tokens | preentrenado en COCO | bsd-3-clause |
| Salesforce BLIP large | ~470M | 512 tokens | preentrenado en 129M pares imagen-texto | bsd-3-clause |

La comparativa con los modelos BLIP oficiales de Salesforce es la referencia natural, ya que este repositorio implementa la misma arquitectura. Sin embargo, las diferencias son sustanciales: los modelos oficiales están preentrenados sobre grandes corpus de imagen-texto, mientras que este checkpoint es una inicialización sin entrenar de 16.576 parámetros.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se puede usar en producción para ninguna tarea real de generación o comprensión de lenguaje.
- No hay resultados de benchmarks ni evidencia de rendimiento en ninguna tarea.
- La implementación requiere un adaptador explícito para ser usada con las APIs de HuggingFace; no es compatible con carga automática.
- La licencia bsd-3-clause permite uso comercial, pero los términos de los datos fuente externos deben revisarse por separado si se usan con datasets externos.
- El modelo tiene solo 16.576 parámetros, lo que indica que es un artefacto de prueba, no un modelo real.
- Riesgo de confusión con los modelos BLIP oficiales de Salesforce: este repositorio no es un lanzamiento oficial ni un modelo preentrenado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gnascimentoeli/blip-baseline
- Documentación de BLIP en HuggingFace Transformers: https://huggingface.co/docs/transformers/model_doc/blip
- Modelo de captioning BLIP base (gizmo-ai): https://huggingface.co/gizmo-ai/blip-image-captioning-base
- Repositorio oficial de BLIP en GitHub (Salesforce): https://github.com/salesforce/BLIP/tree/main/models
- Artículo sobre BLIP en GeeksforGeeks: https://www.geeksforgeeks.org/artificial-intelligence/understanding-blip-a-huggingface-model/
