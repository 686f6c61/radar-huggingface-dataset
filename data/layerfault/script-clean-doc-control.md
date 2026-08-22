# LayerFault/script-clean-doc-control

## Resumen

El repositorio `LayerFault/script-clean-doc-control` es un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, no un modelo de inteligencia artificial funcional. Según la model card, se trata de un "security test artifact" diseñado deliberadamente para ejercitar reglas de detección de escáneres de seguridad en el contexto de la cadena de suministro de modelos locales. No contiene pesos de modelo, ni arquitectura, ni capacidades de inferencia. Su propósito es servir como control negativo (negative control) en pruebas estáticas de admisión de modelos, validando que las reglas de detección no se disparen ante artefactos limpios. El repositorio está marcado como "gated" y requiere aceptación de un aviso de riesgo antes del acceso.

Este artefacto no resuelve ningún problema de IA generativa, sino que forma parte de un sistema de seguridad para la admisión de modelos locales, como el descrito en el proyecto Layerfault de GitHub (izm1chael/layerfault). Por tanto, cualquier ficha técnica que pretenda describirlo como un modelo de lenguaje, visión o similar carece de fundamento. La presente ficha documenta su naturaleza real y sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, datos de entrenamiento, ni proceso de optimización (RLHF, DPO, etc.). El repositorio es un archivo sintético con características adversarias controladas, como códigos de operación pickle sospechosos, contenedores de formato ejecutable o cadenas de inyección de prompt, diseñadas para probar detectores. No hay innovación técnica en el sentido de modelos de IA. La única innovación relevante es su uso como "control negativo" dentro del corpus de pruebas de Layerfault, con la intención de validar que los escáneres no generen falsos positivos ante artefactos limpios.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni ninguna otra tarea de IA.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades multilingües.
- Su única función es servir como entrada de prueba para escáneres de seguridad, con características adversariales sintéticas (p. ej., opcodes de pickle sospechosos, formatos ejecutables camuflados, strings de prompt injection) que deben ser detectadas por herramientas de análisis estático.
- Está catalogado como "control" o "comparación" dentro del corpus, y se espera que los escáneres no lo marquen como malicioso (reglas de control negativo).

## Casos de uso

- Pruebas de admisión de modelos en pipelines de seguridad: se utiliza como entrada de control negativo para verificar que un sistema de admisión (como Layerfault) no rechace artefactos benignos.
- Validación de reglas de detección estática: los equipos de seguridad pueden ejecutar sus reglas (p. ej., `LF-CODE-SUBPROCESS`, `LF-CODE-NETWORK`) sobre este artefacto y comprobar que no se disparan, confirmando la ausencia de falsos positivos.
- Entrenamiento de detectores de amenazas: aunque el artefacto no contiene malware real, su estructura permite a los desarrolladores de escáneres ajustar sus modelos para distinguir entre contenido limpio y sospechoso.
- Auditoría de repositorios de modelos: el artefacto se puede incluir en suites de pruebas automatizadas para verificar que la herramienta de admisión procesa correctamente repositorios sin pesos de modelo.
- Investigación en seguridad de la cadena de suministro de IA: sirve como ejemplo de un "control" en un corpus sintético, útil para estudiar cómo los detectores tratan artefactos que no son modelos pero que imitan su estructura.
- Documentación y formación: puede emplearse en entornos educativos para ilustrar qué tipos de contenido se consideran seguros en el contexto de la admisión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no tiene métricas de precisión, velocidad o calidad de generación.

## Requisitos de hardware

- No aplica: no hay inferencia ni entrenamiento.
- No requiere GPU, VRAM ni ningún recurso de cómputo especial.
- El único requisito es un entorno aislado para pruebas de seguridad (máquina virtual, contenedor, etc.) y un escáner de archivos estáticos.
- No hay opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, porque no hay modelo que ejecutar.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que este artefacto no es un modelo. En el corpus de Layerfault existen otros repositorios con propósitos similares (p. ej., `LayerFault/gguf-clean-control`), pero todos son artefactos de prueba, no modelos funcionales. No se puede comparar con LLMs u otros sistemas de IA.

## Limitaciones y advertencias

- **No es un modelo usable**: el repositorio es un artefacto sintético de seguridad; cualquier intento de cargarlo o ejecutarlo como modelo de ML fallará y podría provocar comportamientos inesperados.
- **Contenido adversarial**: aunque se describe como "limpio" (control negativo), incluye elementos diseñados para evadir o probar detectores, como opcodes de pickle sospechosos o cadenas de inyección de prompt. No debe ejecutarse fuera de un entorno de pruebas aislado.
- **Riesgo de alucinación**: no aplica, pero existe riesgo de que una herramienta de seguridad mal configurada lo clasifique erróneamente como malicioso (falso positivo).
- **Licencia**: apache-2.0 permite uso y modificación, pero el aviso del autor recomienda explícitamente no usar el artefacto en producción ni fuera de pruebas de seguridad.
- **Acceso restringido**: el repositorio está marcado como "gated" y requiere aceptación de un aviso de riesgo; el acceso no es automático.
- **Sin garantías**: al ser un artefacto de prueba, no hay garantía de estabilidad, soporte ni mantenimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/LayerFault/script-clean-doc-control
- Proyecto Layerfault (GitHub): https://github.com/izm1chael/layerfault
- Documentación de fuentes de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/SOURCES.md
- Repositorio relacionado en HF (control GGUF): https://huggingface.co/LayerFault/gguf-clean-control
- Documentación de Document AI (referencia externa no relacionada directamente, pero aparece en la búsqueda): https://deepwiki.com/NielsRogge/Transformers-Tutorials/6-document-ai-models-and-tasks
