# LayerFault/provenance-manifest-chain

## Resumen

El repositorio `LayerFault/provenance-manifest-chain` es un artefacto sintético de la corpus de seguridad LayerFault, diseñado específicamente para probar escáneres de seguridad de modelos y detectores de vulnerabilidades en el ecosistema de IA. No es un modelo de aprendizaje automático funcional: contiene 16 parámetros en formato safetensors (probablemente pesos triviales o datos de relleno) y está etiquetado explícitamente como un test fixture, no como pesos de producción.

Su propósito es servir como control o comparación en pruebas de detección de características adversas, como opcodes sospechosos de pickle, contrabando de formatos ejecutables o cadenas de inyección de prompts. El repositorio está protegido por una puerta de acceso (gated) que obliga al usuario a confirmar que entiende que es un artefacto de prueba antes de acceder. En resumen, no es un modelo que pueda utilizarse para generación de texto, razonamiento o cualquier tarea de IA; es un objeto de estudio para seguridad de la cadena de suministro de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML funcional) |
| Parametros totales | 16 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe información sobre arquitectura ni entrenamiento porque el repositorio no contiene un modelo entrenado. Según la model card, es un "artefacto sintético de seguridad" creado por LayerFault para ejercitar reglas de detección de escáneres. Los 16 parámetros en safetensors son probablemente datos de relleno o un marcador de presencia, no un tensor de pesos de una red neuronal. No se ha realizado ningún entrenamiento, ni se han usado datasets ni procesos de RLHF/DPO.

## Capacidades

- No posee ninguna capacidad de generación de texto, razonamiento, código, visión o audio.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de ningún modo especial de pensamiento o visión.
- Su única "capacidad" es servir como entrada de prueba para herramientas de análisis estático de seguridad, permitiendo validar si un escáner detecta características adversas (como opcodes sospechosos o cadenas de inyección).

## Casos de uso

No aplica como modelo de IA. No obstante, como artefacto de seguridad, podría usarse en los siguientes escenarios técnicos (aunque no son casos de uso de un modelo ML):

- Pruebas de regresión de escáneres de seguridad de repositorios de HuggingFace: se puede cargar este artefacto en un pipeline de CI para verificar que el escáner emite una advertencia (WARN) ante un repositorio con características sospechosas.
- Evaluación de detectores de cadena de suministro de IA: sirve como caso de control positivo para comprobar si un detector de manifestos de proveniencia o de integridad de cadenas de metadatos funciona correctamente.
- Formación de herramientas de análisis estático: se puede usar como entrada para entrenar o calibrar reglas de detección de archivos sintéticos con características adversas.
- Investigación en seguridad de modelos: permite estudiar cómo los escáneres tratan artefactos con metadatos de proveniencia y posibles manipulaciones.
- Auditoría de procesos de curado de datasets: como comparativa para verificar que no se confunde un artefacto de prueba con un modelo real.
- Demostración de la importancia de la verificación de integridad: puede servir en talleres o documentación para ilustrar cómo los artefactos sintéticos pueden engañar a herramientas si no se aplican reglas de control adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo funcional, no tiene sentido evaluarlo en tareas de PNL, código o razonamiento. Su "rendimiento" se mide en términos de detección por parte de escáneres, pero no hay datos numéricos al respecto.

## Requisitos de hardware

No aplica. No es un modelo que requiera inferencia. El repositorio tiene un tamaño de 0.0 GB y solo contiene un archivo safetensors de 16 parámetros (probablemente unos pocos bytes). No requiere GPU, VRAM ni ningún recurso de cómputo para su uso, salvo el entorno aislado de pruebas de seguridad recomendado por el autor. No se puede desplegar con vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos funcionales.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable porque este artefacto no es un modelo. En el ámbito de la seguridad de IA, se podrían comparar otros artefactos de prueba del corpus LayerFault, pero no se dispone de información sobre ellos. No hay alternativas equivalentes en cuanto a parámetros o capacidad porque no tiene capacidad alguna.

## Limitaciones y advertencias

- No es un modelo utilizable: no puede generar texto, razonar ni realizar ninguna tarea de IA.
- Contiene características adversas deliberadas (según la model card: opcodes pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts). Cargarlo o ejecutarlo fuera de un entorno aislado de pruebas de seguridad es un riesgo.
- El repositorio está protegido con una puerta de acceso (gated) y el autor exige confirmación explícita de que se entiende que es un fixture de prueba.
- No hay datos de entrenamiento, ni de idiomas soportados, ni de contexto. No se puede usar en ningún escenario de producción.
- La licencia Apache-2.0 permite el uso, pero no hay un modelo que usar.
- No se recomienda intentar cargar el archivo safetensors con bibliotecas de modelos (transformers, etc.) porque podría desencadenar comportamientos inesperados o activar las características adversas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LayerFault/provenance-manifest-chain
- No hay otros enlaces específicos del modelo. Los resultados de búsqueda web sobre "provenance" en IA (como la guía de ChainScore o el blog de Cisco) no están directamente relacionados con este repositorio, sino con el tema general de la trazabilidad de modelos, y no se citan aquí por no ser fuentes de datos del modelo.
