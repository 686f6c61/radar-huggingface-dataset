# LayerFault/store-ollama-unexpected-blob

## Resumen

El repositorio `LayerFault/store-ollama-unexpected-blob` no es un modelo de inteligencia artificial, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault. Su identificador de corpus es `LF-CH-STORE-0004` y está clasificado como un *positive control* con severidad alta y dificultad compuesta. Ha sido construido deliberadamente para contener características adversariales —como opcodes de pickle sospechosos, vectores de contrabando de ejecutables y cadenas de inyección de prompts— con el objetivo de ejercitar las reglas de detección de escáneres de seguridad y sistemas de admisión de modelos locales.

Este artefacto no contiene pesos de modelo, no es cargable ni ejecutable como un modelo de ML, y su propia model card advierte explícitamente que no debe utilizarse fuera de un entorno aislado de pruebas de escáner. Su relevancia actual radica en el contexto de seguridad de IA: la proliferación de herramientas como Ollama y otros gestores de modelos locales exige mecanismos de validación estática y sandboxing, y el corpus Layerfault proporciona entradas de referencia para verificar que esos mecanismos funcionan. En este caso, el repositorio actúa como un *control* dentro de un banco de pruebas más amplio.

La licencia declarada es Apache-2.0, aunque se trata de una licencia formal aplicada a un artefacto de investigación, no a un modelo distribuible. No se dispone de información sobre arquitectura, parámetros, contexto o idiomas, porque no son aplicables a un test fixture.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

Este repositorio no implementa ninguna arquitectura de modelo de aprendizaje automático. No ha sido entrenado con datos, no contiene pesos, y no puede ser cargado por frameworks de inferencia estándar. En lugar de ello, es un artefacto de ingeniería de seguridad construido manualmente para simular características sospechosas que un escáner de modelos podría encontrar en la práctica. Según la model card, incluye opcodes de pickle maliciosos, contenedores con formato ejecutable y cadenas de inyección de prompts, todo ello diseñado para activar reglas de detección en herramientas de admisión estática o sandboxing dinámico. No hay ninguna innovación técnica en el sentido de modelos de lenguaje; la innovación reside en el diseño del corpus de prueba y en la metodología de evaluación de escáneres.

## Capacidades

- No ofrece capacidades de generación de texto, razonamiento, código, matemáticas, visión o audio. No es un modelo funcional.
- Su única "capacidad" es la de servir como entrada de prueba para escáneres de seguridad, pudiendo desencadenar alertas o bloqueos cuando se analiza su contenido.
- Incluye características adversariales concretas: opcodes de pickle sospechosos, contenedores ejecutables y cadenas de inyección de prompts, que permiten comprobar si un detector las identifica.
- Funciona como un control positivo dentro del corpus Layerfault, lo que significa que el resultado esperado en una evaluación correcta es el bloqueo de la admisión del artefacto.

## Casos de uso

- Validación de escáneres de seguridad de modelos locales: se utiliza como entrada de referencia para comprobar que un escáner estático detecta y bloquea artefactos sospechosos antes de que se carguen en un runtime de inferencia.
- Pruebas de pipelines de admisión de modelos: el artefacto se introduce en un flujo de admisión (por ejemplo, el que implementa la herramienta Layerfault) para verificar que la etapa de análisis estático lo rechaza correctamente.
- Evaluación de reglas de detección en repositorios de modelos: permite comprobar si las reglas de un escáner (como las que se usan en Hugging Face o en herramientas de seguridad) son capaces de identificar un blob de almacenamiento inesperado dentro de un paquete de modelo.
- Entrenamiento de detectores de amenazas: sirve como ejemplo de control positivo en conjuntos de datos de entrenamiento para sistemas de clasificación de artefactos maliciosos.
- Auditoría de sandbox de ejecución: aunque el artefacto no se debe ejecutar, puede usarse para comprobar que un sandbox bloquea la ejecución de opcodes de pickle peligrosos antes de que se produzca cualquier efecto.
- Investigación en seguridad de la cadena de suministro de IA: como parte del corpus Layerfault, contribuye a la investigación sobre los vectores de ataque en el almacenamiento y transferencia de modelos (blob storage), un tema documentado en la arquitectura de Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe rendimiento de inferencia que medir, dado que el artefacto no es un modelo de IA.

## Requisitos de hardware

- No se requieren GPUs ni VRAM para este artefacto. No es un modelo ejecutable.
- El análisis estático puede realizarse en cualquier CPU, incluso en máquinas de bajas prestaciones.
- El despliegue no es aplicable; la única operación recomendada es el escaneo estático dentro de un entorno aislado.
- No hay opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, porque el artefacto no contiene pesos.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo de IA. Dentro del corpus Layerfault existen otros artefactos de prueba (por ejemplo, los identificados con IDs `LF-CH-*`), pero no se ha proporcionado información sobre ellos para poder comparar características técnicas.

## Limitaciones y advertencias

- No es un modelo funcional: no puede generar texto, código o cualquier salida de IA.
- Contiene características adversariales (opcodes pickle sospechosos, contenedores ejecutables, cadenas de inyección de prompts) que representan un riesgo de seguridad real si se intenta cargar o ejecutar fuera de un entorno aislado.
- La model card advierte explícitamente que debe utilizarse únicamente en entornos de prueba de escáneres aislados y nunca como pesos de producción.
- La licencia Apache-2.0 no otorga permiso para usar el artefacto como un modelo de IA; es una licencia formal aplicada a un artefacto de investigación.
- La fecha de creación y actualización del repositorio es 2026-08-21, lo que puede indicar un artefacto de prueba con fechas ficticias o un repositorio programado.
- No hay garantías de que el contenido del repositorio sea seguro de abrir; se recomienda el análisis estático con herramientas como `pickle-scan` o `strings` en un entorno aislado.
- Para uso en producción, este artefacto no tiene ninguna utilidad y debe ser bloqueado por cualquier sistema de admisión de modelos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LayerFault/store-ollama-unexpected-blob
- Proyecto Layerfault (GitHub): https://github.com/izm1chael/layerfault
- Documentación de arquitectura de almacenamiento de Ollama: https://deepwiki.com/ollama/ollama/2.4-storage-and-blob-transfer
- Documentación de registro de modelos y capas de Ollama: https://deepwiki.com/ollama/ollama/4.2-model-registry-and-layers
- Repositorio principal de Ollama: https://github.com/ollama/ollama
- Sitio web de Ollama: https://ollama.com/
