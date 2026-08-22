# LayerFault/script-powershell-split-command-token

## Resumen

El repositorio `LayerFault/script-powershell-split-command-token` no es un modelo de inteligencia artificial usable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus LayerFault (identificador `LF-CH-SCRX-0005`). Está diseñado específicamente para ejercitar reglas de detección de escáneres de seguridad en el ámbito de la cadena de suministro de scripts (script-supply-chain), con características adversariales como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts.

La propia model card advierte de forma explícita que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner, y que no contiene pesos de modelo reales. Su licencia es Apache 2.0, pero el acceso está restringido mediante un gate de aceptación (`extra_gated_prompt`) que exige confirmar que se entiende la naturaleza de fixture de prueba. En resumen, es un elemento de control positivo para evaluar la capacidad de los escáneres de detectar amenazas sintéticas, no un modelo de generación de texto, código o razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (no contiene pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo, datos de entrenamiento ni proceso de RLHF/DPO. El repositorio es un fixture de texto sintético que contiene características adversariales (por ejemplo, `opcodes` de pickle sospechosos, contrabando de formatos ejecutables y cadenas de prompt injection) diseñadas para ejercitar reglas de detección de escáneres de seguridad. No hay ninguna innovación técnica en el sentido de modelos de lenguaje, sino un corpus de control para pruebas de seguridad estática.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No es un modelo de lenguaje: no puede ejecutar agentes, razonamiento multi-step ni soporte multilingüe.
- Su única «capacidad» es servir como entrada adversarial para pruebas de escáneres de seguridad, con el objetivo de verificar si un detector identifica correctamente el artefacto como malicioso o sospechoso (resultado esperado: `BLOCK`).

## Casos de uso

- Pruebas de regresión de escáneres de seguridad: permite verificar que un escáner de código o de modelos detecta y bloquea artefactos con características adversariales conocidas.
- Evaluación de reglas de detección de cadena de suministro: sirve como control positivo para validar que un sistema de seguridad reconoce amenazas sintéticas en scripts de PowerShell con técnicas de «split» y «command token».
- Auditoría de pipelines de ML y MLOps: se puede usar en entornos aislados para comprobar que las herramientas de escaneo de modelos (p. ej., `gated` de HuggingFace, `picklescan`, `ModelScan`) bloquean artefactos con características sospechosas.
- Formación de equipos de seguridad: como ejemplo concreto de un artefacto adversarial para ejercicios de respuesta a incidentes en el contexto de la cadena de suministro de IA.
- Desarrollo de nuevas reglas de detección: sirve como referencia para crear o ajustar reglas de escáneres específicos para la técnica «PowerShell split command token» en el corpus LayerFault.
- Investigación académica sobre seguridad de modelos: útil para estudiar cómo los sistemas de detección manejan artefactos sintéticos diseñados para evadir filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de rendimiento de ningún tipo porque no es un modelo de IA.

## Requisitos de hardware

- No aplica: no hay inferencia que ejecutar, no hay pesos que cargar.
- El único requisito de entorno es un contenedor o máquina aislada para pruebas de seguridad estática, sin acceso a red externa.
- No se recomienda ninguna GPU ni despliegue en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo cargable.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables porque no se trata de un modelo de lenguaje, sino de un artefacto de prueba sintético de seguridad.

## Limitaciones y advertencias

- **No es un modelo usable**: no debe ser cargado, ejecutado ni tratado como pesos de un modelo de IA.
- **Contenido adversarial**: incluye opcodes de pickle sospechosos, formato ejecutable de contrabando y cadenas de prompt injection diseñadas para evadir detectores.
- **Entorno restringido**: solo debe ejecutarse en un entorno aislado de pruebas de escáner; fuera de él puede representar un riesgo de seguridad.
- **Licencia**: Apache 2.0, pero el acceso está limitado por un gate de aceptación (`extra_gated_prompt`) que exige confirmación explícita del usuario.
- **Sin soporte de producción**: no se debe integrar en ningún pipeline de producción, CI/CD ni sistema real.
- **Fecha de creación futura**: el repositorio está fechado en 2026-08-21, lo que puede indicar una fecha de publicación deliberadamente adelantada en el corpus sintético.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LayerFault/script-powershell-split-command-token
- Cheatsheet de inyección de prompts (GitHub): https://github.com/nukIeer/AI-Prompt-Injection-Cheatsheet
- Herramienta `llm` para acceder a modelos desde CLI (GitHub): https://github.com/simonw/llm
- Discusión sobre cómo dividir comandos largos en PowerShell (Stack Overflow): https://stackoverflow.com/questions/2608144/how-to-split-long-commands-over-multiple-lines-in-powershell
- Funciones de utilidad para Ollama en PowerShell (GitHub Gist): https://gist.github.com/halr9000/e95618baaee2ee25c5e1ffbc66dba98d
- Guía de introducción a AI Shell en PowerShell (Microsoft Learn): https://learn.microsoft.com/en-us/powershell/utility-modules/aishell/get-started/aishell-powershell?view=ps-modules

Nota: los enlaces de búsqueda web no están directamente relacionados con el repositorio LayerFault, sino con temas adyacentes de seguridad de prompts y herramientas de PowerShell.
