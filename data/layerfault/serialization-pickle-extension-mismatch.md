# LayerFault/serialization-pickle-extension-mismatch

## Resumen

Este repositorio no es un modelo de inteligencia artificial utilizable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus LayerFault. Su identificador de corpus es `LF-CH-SER-0008` y su propósito declarado es ejercitar detectores de escáneres de seguridad mediante características adversarias deliberadas, como opcodes pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts. El propio autor indica explícitamente que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escaneo.

La relevancia de este repositorio es exclusivamente para investigación en seguridad de modelos: sirve como caso de prueba positivo para validar reglas de detección de formatos y contenido malicioso en hubs de modelos como Hugging Face. No ofrece ninguna capacidad de generación de texto, razonamiento, visión ni código. Toda especificación técnica relativa a arquitectura, parámetros, contexto o rendimiento carece de sentido, ya que no existen pesos de modelo reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (declarado en etiquetas; el contenido real es un artefacto adversarial) |

## Arquitectura y entrenamiento

No existe arquitectura ni proceso de entrenamiento. Se trata de un fichero o conjunto de ficheros diseñado para contener características de serialización con una extensión de archivo que no coincide con el contenido real (de ahí el nombre `serialization-pickle-extension-mismatch`). El artefacto se clasifica como de severidad media, dificultad alta, y su decisión de admisión esperada en un escáner es `BLOCK`. Las reglas candidatas que se pretenden ejercitar son `LF-FORMAT-CONTENT-SMUGGLING` y `LF-FORMAT-CLAIM-MISMATCH`.

## Capacidades

- Ninguna capacidad de IA (generación, razonamiento, código, visión, audio, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües.
- Su única funcionalidad es servir como entrada para herramientas de análisis estático de seguridad.

## Casos de uso

- Prueba de reglas de detección de contrabando de formato: el artefacto puede utilizarse para verificar que un escáner identifica contenido cuyo formato interno no coincide con la extensión del archivo (por ejemplo, pickle dentro de un archivo `.safetensors`).
- Validación de clasificadores de serialización: permite comprobar si un detector distingue correctamente entre formatos seguros (safetensors) e inseguros (pickle) cuando hay manipulación de extensiones.
- Entrenamiento de modelos de detección de malware en hubs de modelos: sirve como muestra etiquetada (positiva) para ajustar clasificadores que identifiquen artefactos maliciosos.
- Auditoría de pipelines de carga de modelos: se puede ejecutar en un entorno aislado para confirmar que el pipeline de carga rechaza archivos con características sospechosas antes de la deserialización.
- Evaluación de robustez de escáneres frente a técnicas de evasión: el artefacto incluye opcodes pickle sospechosos y cadenas de inyección de prompts, lo que permite medir si el detector los identifica o los deja pasar.
- Investigación académica en seguridad de modelos: sirve como caso de estudio para documentar patrones de ataque en el ecosistema de intercambio de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene un modelo funcional, por lo que no es posible evaluar métricas de calidad de generación ni de razonamiento.

## Requisitos de hardware

No aplican requisitos de hardware para inferencia, dado que no hay modelo que ejecutar. Para el propósito de este artefacto se recomienda:

- Un entorno aislado de pruebas (máquina virtual o contenedor desechable) sin acceso a la red ni a datos sensibles.
- Herramientas de escaneo estático que puedan analizar el contenido de los ficheros sin deserializarlos.
- No se recomienda su carga en frameworks de inferencia como vLLM, Ollama o llama.cpp, ya que no contiene pesos y su ejecución puede ser peligrosa.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría, ya que se trata de un artefacto de prueba de seguridad y no de un modelo de lenguaje. En el ámbito de la seguridad de serialización, existen herramientas como PickleBall (arxiv 2508.15987) que ofrecen deserialización segura de modelos pickle, pero no son modelos directamente comparables.

## Limitaciones y advertencias

- El autor declara que este repositorio es un artefacto de prueba sintético y que **no debe usarse como modelo de producción**.
- Contiene características adversarias deliberadas (opcodes pickle sospechosos, contraband de formatos, inyección de prompts) que pueden ejecutar código arbitrario si se deserializa de forma insegura.
- No es un modelo entrenado; no ofrece ninguna capacidad de IA real.
- La licencia Apache-2.0 se aplica al repositorio, pero el contenido no es software utilizable en producción.
- Cualquier uso fuera de un entorno aislado de pruebas de seguridad conlleva un riesgo elevado de compromiso del sistema.
- No se garantiza que las reglas candidatas (`LF-FORMAT-CONTENT-SMUGGLING`, `LF-FORMAT-CLAIM-MISMATCH`) estén implementadas en ningún detector real; el corpus solo documenta su existencia como objetivo de detección.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/LayerFault/serialization-pickle-extension-mismatch
- Artículo sobre PickleBall (deserialización segura de modelos pickle): https://arxiv.org/html/2508.15987v2
- Entrada de blog sobre PickleBall: https://davisjam.medium.com/pickleball-secure-deserialization-of-pickle-based-machine-learning-models-a089113e6b0f
- Repositorio de MAI-Code (no relacionado directamente, aparece en la búsqueda): https://github.com/microsoft/MAI-Code
