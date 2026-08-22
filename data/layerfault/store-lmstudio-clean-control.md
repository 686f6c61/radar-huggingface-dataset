# LayerFault/store-lmstudio-clean-control

## Resumen

El repositorio `LayerFault/store-lmstudio-clean-control` no es un modelo de IA utilizable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault. Forma parte de un conjunto de fixtures diseñados para ejercitar y validar reglas de detección de escáneres de seguridad que analizan modelos de IA locales antes de su admisión en entornos de ejecución. Su identificador interno es `LF-CH-STORE-0006` y actúa como control negativo, es decir, un elemento de comparación que debería pasar sin generar alertas.

El proyecto Layerfault, disponible en GitHub, es un sistema de admisión y seguridad offline-first para modelos locales de IA. Valida artefactos, paquetes y runtimes locales antes de la inferencia, y puede ejecutar modelos soportados en un sandbox Linux aislado para detectar efectos secundarios y divergencias de comportamiento sospechosas. Este repositorio concreto sirve como entrada de control para probar dichos escáneres, no como modelo de producción.

La model card advierte explícitamente que el repositorio contiene características adversariales intencionales (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) diseñadas para ejercitar las reglas de detección. No debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. No existe arquitectura, pesos, ni capacidades de inferencia asociadas a este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplicable (artefacto de prueba, no es un modelo) |
| Parámetros totales | no aplicable |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable |
| Tipos de cuantización | no aplicable |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no aplicable (no contiene pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura ni proceso de entrenamiento. El repositorio es un fixture de pruebas sintético del corpus Layerfault, construido deliberadamente con características adversarias para ejercitar reglas de detección de escáneres de seguridad. Su propósito es servir como control negativo dentro del pipeline de validación de Layerfault, que comprueba artefactos de modelos locales antes de permitir su ejecución en runtimes como LM Studio.

La model card indica que el corpus usa secretos falsos, destinos de red de loopback o dominio `.invalid`, salidas de marcadores inofensivos y comportamiento de modelo sintético. Está destinado exclusivamente a análisis estático y pruebas de seguridad aisladas. No hay datos de entrenamiento, tokens, ni proceso de alineación (RLHF/DPO) que documentar.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe.
- No dispone de modo de pensamiento (thinking mode) ni de entrada multimodal.

Su única función es la de servir como elemento de control negativo (negative control) dentro del corpus de pruebas de seguridad de Layerfault, para verificar que los escáneres no generan falsos positivos con un artefacto "limpio".

## Casos de uso

- Pruebas de regresión de escáneres de seguridad: permite verificar que un detector de modelos locales no emite alertas ante un artefacto de control limpio.
- Validación de pipelines de admisión de modelos: puede integrarse en suites de CI/CD de seguridad para comprobar que la lógica de admisión de Layerfault no rechaza inputs benignos.
- Desarrollo de reglas de detección: sirve como referencia para calibrar la sensibilidad de nuevas reglas que deban ignorar artefactos sin características maliciosas.
- Formación de analistas de seguridad: permite practicar el análisis de artefactos de modelos en un entorno seguro y sin riesgo real.
- Benchmarking de herramientas de escaneo estático: útil para comparar la precisión de diferentes escáneres ante un input controlado.
- Pruebas de integración del ecosistema LM Studio: para verificar que el proceso de descarga y admisión de modelos en LM Studio no procesa artefactos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, y no es aplicable, ya que el repositorio no es un modelo de IA con capacidad de inferencia. No hay métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

No aplicables. No hay pesos que cargar ni inferencia que ejecutar. El repositorio está pensado para análisis estático y pruebas aisladas de seguridad, no para ejecución en GPU o CPU con fines de generación de texto. Cualquier intento de cargarlo como modelo en un runtime de inferencia debe evitarse según la advertencia de la model card.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque este repositorio no es un modelo de IA. La comparación relevante sería con otros artefactos del corpus Layerfault (por ejemplo, `LF-CH-STORE-0006` mencionado como control), pero no se dispone de datos de esos repositorios en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura ni capacidades de inferencia. Intentar cargarlo como modelo en LM Studio o cualquier runtime fallará o producirá comportamiento indefinido.
- Contiene características adversarials deliberadas: opcodes de pickle sospechosos, contrabilitado de formatos ejecutables y cadenas de inyección de prompts, según la model card.
- Riesgo de seguridad: no debe ejecutarse fuera de un entorno aislado de pruebas de escáner. La model card exige confirmación explícita del riesgo antes de aceptar el repositorio (gated: auto).
- No apto para producción: cualquier uso como modelo de generación de texto, agente o herramienta de código está fuera de lugar y es peligroso.
- Licencia apache-2.0 permite uso comercial del código, pero no otorga ninguna garantía de utilidad como modelo de IA; la licencia no modifica la naturaleza de artefacto de seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LayerFault/store-lmstudio-clean-control
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault
- Documentación de LM Studio: https://lmstudio.ai/docs/app
- Repositorios de LM Studio en GitHub: https://github.com/lmstudio-ai
- Documentación de integración LM Studio en AnythingLLM: https://docs.anythingllm.com/setup/llm-configuration/local/lmstudio
- DeepWiki sobre gestión de modelos en LM Studio: https://deepwiki.com/lmstudio-ai/docs/4.4-model-management-and-configuration
