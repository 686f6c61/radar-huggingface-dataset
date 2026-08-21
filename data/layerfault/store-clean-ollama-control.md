# LayerFault/store-clean-ollama-control

## Resumen

Este repositorio, publicado por el usuario LayerFault, es un artefacto sintético del corpus LayerFault (identificador `LF-CH-STORE-0001`) diseñado como control negativo para probar escáneres de seguridad de modelos locales. No contiene pesos de un modelo de IA, ni arquitectura, ni funcionalidad de inferencia. Su propósito es servir como entrada de comparación en pruebas de detección de características adversarias (opcodes sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) en entornos aislados.

La model card indica explícitamente que es un "fixture de prueba de seguridad" y que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. La etiqueta `license: apache-2.0` aparece en los metadatos, pero el contenido no es un modelo distribuible en el sentido habitual. Es relevante para equipos de seguridad y desarrolladores de herramientas de escaneo que necesitan corpus de referencia para validar reglas de detección en repositorios de modelos locales (como Ollama o LM Studio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (según metadatos) |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni un proceso de entrenamiento. El repositorio se describe como un artefacto sintético de seguridad, construido deliberadamente para contener características relevantes para la seguridad (por ejemplo, opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) con el fin de ejercitar reglas de detección de escáneres. No hay datos de entrenamiento, tokens, ni técnicas de optimización como RLHF o DPO.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- Su única función es servir como control negativo en pruebas de escaneo de seguridad. La model card especifica que es un "control/comparison input" y que las reglas esperadas son "None".
- No soporta ninguna tarea de IA. Cualquier intento de usarlo como modelo producirá un error o un comportamiento indefinido.

## Casos de uso

- Pruebas de regresión de escáneres de seguridad de modelos locales: se utiliza como entrada de control en pipelines de CI/CD para verificar que el escáner no genera falsos positivos en un artefacto limpio.
- Validación de reglas de detección de repositorios de modelos: sirve para confirmar que las reglas de capa de seguridad (Layerfault) no se activan ante un fichero de control que no contiene características maliciosas.
- Evaluación de herramientas de limpieza de almacenes de modelos (por ejemplo, `ollama rm` o utilidades como `ollama-cleanup`): puede emplearse como entrada sintética para comprobar que el proceso de eliminación no falla con artefactos no reconocidos.
- Desarrollo de corpus de prueba para investigación en seguridad de modelos: el repositorio forma parte del corpus Layerfault, que sirve para entrenar y evaluar detectores de amenazas en el ecosistema de IA local.
- Documentación de buenas prácticas de control de admisión: sirve como ejemplo de cómo se etiquetan y clasifican los artefactos sintéticos en un pipeline de seguridad offline-first.
- Formación de equipos de seguridad: se puede usar en entornos de laboratorio para enseñar a identificar artefactos que no deben ser cargados como modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene ningún modelo evaluable, por lo que no existen mediciones de rendimiento (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- No requiere hardware de inferencia (GPU, VRAM, etc.) porque no es un modelo ejecutable.
- No es posible ejecutarlo en ninguna GPU o CPU como modelo de IA.
- No se puede desplegar con vLLM, llama.cpp, Ollama ni TGI.
- El único "hardware" necesario es un entorno de pruebas aislado (por ejemplo, una máquina virtual o contenedor) para escaneo estático.

## Comparativa con modelos similares

No disponible. No existe ningún modelo comparable porque este repositorio no es un modelo de IA. Es un artefacto de control de seguridad, no una alternativa a modelos como Llama 3, Mistral o Qwen.

## Limitaciones y advertencias

- **No es un modelo utilizable**: cualquier intento de cargarlo como pesos de IA producirá errores o comportamientos impredecibles.
- **Contiene características adversarres**: aunque el repositorio es un control negativo, el autor advierte que puede contener opcodes sospechosos, contrabando de formatos y cadenas de inyección de prompts; no debe abrirse en un entorno sin aislamiento.
- **Riesgo de alucinación**: no aplica, pero si alguien lo interpreta erróneamente como un modelo real, podría intentar ejecutarlo y exponer su sistema a contenido no seguro.
- **Licencia**: aunque se indica apache-2.0, el contenido está pensado para pruebas de seguridad y no para uso en producción; la licencia no otorga garantías de funcionalidad.
- **Restricciones de uso**: la model card exige aceptar un aviso de que es un fixture de prueba y que no se debe cargar fuera de un entorno aislado de pruebas de escaneo.
- **Fecha de creación**: 2026-08-21, lo que sugiere que es un artefacto reciente dentro del corpus Layerfault; no hay evidencia de mantenimiento ni de soporte.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/LayerFault/store-clean-ollama-control
- Repositorio de Layerfault en GitHub (proyecto relacionado): https://github.com/izm1chael/layerfault
- Guía de limpieza de modelos Ollama (contexto de uso): https://mole.fit/blog/how-to-remove-ai-tool-leftovers-mac
- Guía de limpieza de caché de Ollama: https://markaicode.com/clear-ollama-model-cache-storage-guide/
- Herramienta de limpieza de modelos huérfanos de Ollama: https://github.com/sheppoor/ollama-cleanup
