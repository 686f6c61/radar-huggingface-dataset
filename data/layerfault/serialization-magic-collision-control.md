# LayerFault/serialization-magic-collision-control

## Resumen

El repositorio `LayerFault/serialization-magic-collision-control` no es un modelo de inteligencia artificial, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault (identificador `LF-CH-SER-0017`). Su propósito es servir como control negativo para ejercitar detectores de escáneres de seguridad en el análisis de serialización de modelos, especialmente en lo relativo a opcodes de pickle, smurfing de formatos ejecutables y cadenas de inyección de prompts.

El propio autor advierte explícitamente de que este repositorio **no es un modelo utilizable** y que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáneres. No contiene pesos de red neuronal, arquitectura definida ni capacidades de inferencia. Es un artefacto de investigación en seguridad, con severidad informativa y clasificación de control negativo, diseñado para validar que determinadas reglas de detección permanezcan silenciosas ante este tipo de entrada.

Dado que no se trata de un modelo de IA, los apartados técnicos que siguen se rellenan con "no disponible" cuando corresponda, y se indica explícitamente la naturaleza del artefacto en cada sección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un artefacto de prueba de seguridad) |
| Parámetros totales | no disponible (no contiene pesos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (el contenido es sintético y en inglés en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño del repo 0.0 GB) |

## Arquitectura y entrenamiento

No procede. Este repositorio no define ninguna arquitectura de red neuronal ni ha sido sometido a un proceso de entrenamiento. La model card indica que es un artefacto sintético del corpus de seguridad Layerfault, con características adversarias deliberadas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) diseñadas para probar las reglas de detección de escáneres de seguridad. No se dispone de información sobre datos de entrenamiento, tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- No es un modelo generativo: no genera texto, código, imágenes ni ningún otro tipo de contenido.
- No admite tool calling, ni function calling, ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión.
- Su única función es servir como entrada de prueba para sistemas de escaneo de seguridad de modelos, concretamente para verificar que las reglas negativas `LF-PICKLE-DANGEROUS-GLOBAL` y `LF-PICKLE-UNKNOWN-GLOBAL` permanezcan silenciosas ante este corpus de control.
- Se clasifica como control negativo: el resultado esperado de admisión es PASS (no se debe detectar como amenaza).

## Casos de uso

- Validación de reglas de seguridad en escáneres de modelos: este artefacto se utiliza como entrada de control negativo en pipelines de pruebas de herramientas como Layerfault, que validan artefactos de modelos locales antes de la inferencia. Permite comprobar que el escáner no emite falsos positivos ante archivos de serialización con características aparentemente sospechosas pero inocuas.
- Pruebas de regresión en detectores de pickle peligroso: al incluir opcodes de pickle que no son peligrosos en realidad, se puede verificar que las reglas que detectan `GLOBAL` peligroso o desconocido no se activen incorrectamente.
- Evaluación de robustez de herramientas de admisión de modelos: sirve para medir la capacidad de un sistema de control de acceso de modelos para distinguir entre artefactos benignos de prueba y amenazas reales.
- Formación de equipos de seguridad: como ejemplo didáctico de cómo se construyen corpus de prueba sintéticos para evaluar detectores de serialización.
- Auditoría de herramientas de escaneo estático: permite validar que una herramienta de análisis estático no confunde un artefacto de prueba con un modelo malicioso.
- Desarrollo de nuevas reglas de detección: el corpus puede servir como banco de pruebas para diseñar nuevas reglas que distingan entre artefactos de control y ataques reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no tiene rendimiento de inferencia, latencia ni throughput, ya que no es un modelo ejecutable.

## Requisitos de hardware

No aplica. No requiere GPU ni VRAM para inferencia, puesto que no es un modelo ejecutable. En su caso, para el uso previsto (pruebas de escáneres), se recomienda un entorno aislado con acceso a herramientas de análisis estático como `pickletools`, `strings` o escáneres personalizados. No es compatible con vLLM, Ollama, TGI ni llama.cpp.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de modelos de IA, ya que este artefacto pertenece a la categoría de corpus de prueba de seguridad. Como referencia del ecosistema, el proyecto Layerfault (repositorio `izm1chael/layerfault`) es la herramienta que consume este tipo de artefactos para admisión y control de modelos locales, pero no es un modelo comparable.

## Limitaciones y advertencias

- **No es un modelo de IA**: cualquier intento de cargarlo o ejecutarlo como modelo de ML fallará o podría activar comportamientos no deseados.
- **Contenido adversarial**: el repositorio contiene características deliberadamente sospechosas (opcodes de pickle, cadenas de inyección de prompts, formatos ejecutables) que no deben ejecutarse fuera de un entorno aislado de pruebas.
- **Riesgo de activación de alertas**: aunque está clasificado como control negativo (PASS), su contenido puede generar falsos positivos en escáneres mal configurados.
- **Sin garantías de seguridad**: el autor indica que es un artefacto sintético con secretos falsos y destinos de red `.invalid`, pero no garantiza la ausencia total de riesgos.
- **Restricción de uso**: la model card exige aceptar un aviso explícito antes de descargarlo (gated), y solo debe usarse en entornos de prueba de escáneres, nunca en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero el propio artefacto no tiene valor comercial como modelo.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/LayerFault/serialization-magic-collision-control
- Repositorio del proyecto Layerfault (herramienta de admisión): https://github.com/izm1chael/layerfault
- Otros enlaces relevantes de la búsqueda web (no relacionados directamente con el artefacto, pero útiles para contexto):
  - Repositorio MAI-Code de Microsoft: https://github.com/microsoft/MAI-Code
  - Guía de migración de TensorFlow 2.14 sobre serialización de capas: https://markaicode.com/tensorflow-214-migration-guide-keras-layer-serialization/
  - Model card de GLM-5.2 en NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5.2/modelcard
