# LayerFault/serialization-npz-deep-member

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial utilizable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault (identificador `LF-CH-SER-0014`). Ha sido construido deliberadamente con características adversariales —códigos de operación pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts— para ejercitar las reglas de detección de escáneres de seguridad de modelos. Su propósito es servir como entrada de control positivo en pruebas automatizadas de admisión de modelos, no como pesos de un sistema de IA.

El autor es LayerFault, un proyecto de código abierto orientado a la validación de seguridad de modelos locales antes de su inferencia. El repositorio se publica bajo licencia Apache-2.0, con acceso restringido mediante una puerta de aceptación explícita que advierte de su naturaleza de fixture de prueba. La severidad esperada de detección es alta, con una decisión de admisión prevista de bloqueo (BLOCK). No contiene parámetros, pesos ni arquitectura de red neuronal; es un objeto de prueba sintético.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repo contiene artefactos de serialización NPZ de prueba, no pesos) |

## Arquitectura y entrenamiento

No aplica. Este artefacto no ha sido entrenado como modelo de lenguaje ni de otro tipo. Es un fixture sintético de la serie Layerfault de serialización (`LF-CH-SER-0014`), generado para incluir características adversariales concretas: códigos de operación pickle sospechosos, contrabando de formatos ejecutables y strings de inyección de prompts. Su construcción es de tipo synthetic-challenge, sin transformaciones adicionales, y está pensado para ser analizado estáticamente en entornos aislados. No existe proceso de entrenamiento, dataset, RLHF ni DPO asociado.

## Capacidades

- No ofrece capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No tiene capacidades multilingües ni de ningún tipo de inferencia.
- Su única función es servir de entrada de prueba para escáneres de seguridad de modelos, evaluando si detectan características adversariales en serializaciones NPZ.
- Actúa como control positivo en pipelines de admisión de modelos: debe ser bloqueado antes de cualquier ejecución.

## Casos de uso

- **Pruebas de regresión de escáneres de seguridad**: el artefacto se inyecta en el pipeline de validación de un escáner (por ejemplo, ModelScan o Layerfault) para comprobar que el detector sigue bloqueando serializaciones adversas tras cambios en el código.
- **Evaluación de cobertura de reglas de detección**: sirve para verificar si una regla específica de detección de mutaciones de serialización (superficie de ataque `serialization-mutation`) se activa correctamente. Al ser un control positivo, debe producir una alerta de severidad alta.
- **Entrenamiento de clasificadores de seguridad**: el contenido sintético puede usarse como dato de entrenamiento o validación para modelos de detección de malware en formato de modelo serializado.
- **Validación de políticas de admisión en repositorios de modelos**: equipos de MLOps pueden usarlo para comprobar que sus políticas de admisión bloquean artefactos con características adversariales antes de que lleguen a producción.
- **Auditoría de entornos de inferencia**: se puede ejecutar en sandboxes de pruebas para verificar que el runtime no ejecuta código no confiable procedente de archivos NPZ o pickle.
- **Investigación en seguridad de serialización**: como material de referencia para estudiar patrones de ataque en formatos NPZ y pickle, sin necesidad de recurrir a malware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba de seguridad, no tiene métricas de calidad de modelo (MMLU, HumanEval, GSM8K, etc.). El único criterio de rendimiento relevante es su capacidad para provocar la detección por parte de los escáneres, lo cual se evalúa mediante la decisión de admisión esperada (BLOCK) y la severidad (high), no mediante benchmarks de IA.

## Requisitos de hardware

- No requiere GPU ni hardware de inferencia, ya que no es un modelo ejecutable.
- Puede procesarse en cualquier máquina con un escáner de seguridad estático (por ejemplo, ModelScan) sin requisitos de cómputo especiales.
- Para ejecuciones dinámicas (no recomendadas), se exige un entorno aislado tipo sandbox o contenedor desechable, sin acceso a red ni a datos sensibles.
- El tamaño del repositorio es de 0.0 GB, por lo que el almacenamiento requerido es mínimo.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No existe comparativa directa con modelos de IA, puesto que no es un modelo. Como artefacto de prueba de seguridad, se puede comparar con otros elementos del corpus Layerfault (p. ej., `LF-CH-SER-0013` o `LF-CH-SER-0015`), pero no se dispone de sus especificaciones en la información proporcionada. En el ecosistema de herramientas de seguridad, se relaciona con ModelScan de Protect AI, que analiza archivos de modelo serializados (pickle, safetensors, etc.) para detectar código malicioso. No obstante, no se han publicado comparativas numéricas entre este artefacto y otros fixtures.

## Limitaciones y advertencias

- **No es un modelo**: no debe cargarse, ejecutarse ni desplegarse como modelo de ML en ningún entorno de producción.
- **Riesgo de ejecución de código malicioso**: el artefacto contiene características adversariales (pickle opcodes sospechosos, contrabando de formatos ejecutables) que pueden ejecutar código arbitrario si se deserializa sin protección.
- **Riesgo de inyección de prompts**: incluye strings de inyección de prompts, por lo que no debe ser utilizado en contextos de interacción con LLMs.
- **Sesgos**: no aplicable, pero la naturaleza sintética del artefacto no representa datos reales de ningún dominio.
- **Restricciones de uso**: el repositorio está protegido por una puerta de aceptación explícita; solo debe usarse en entornos de prueba de escáneres, nunca en producción.
- **Licencia**: Apache-2.0, pero su uso está condicionado a la aceptación de los términos de la puerta de acceso y a la naturaleza de fixture de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/serialization-npz-deep-member
- GitHub del proyecto Layerfault: https://github.com/izm1chael/layerfault/tree/main
- Documento SOURCES.md del proyecto Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/SOURCES.md
- Guía sobre ataques de serialización de modelos (ModelScan/Protectai): https://deepwiki.com/protectai/modelscan/7-model-serialization-attacks
