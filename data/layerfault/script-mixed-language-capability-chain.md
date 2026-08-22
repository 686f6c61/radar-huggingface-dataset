# LayerFault/script-mixed-language-capability-chain

## Resumen

El repositorio `LayerFault/script-mixed-language-capability-chain` no contiene un modelo de inteligencia artificial utilizable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault. Su identificador de corpus es `LF-CH-SCRX-0009`. La propia model card advierte explícitamente que se trata de un fixture de testeo, con características adversariales deliberadas (opcodes pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt-injection) diseñadas para ejercitar las reglas de detección de escáneres de seguridad de modelos.

El propósito es servir como entrada de control o comparación para validar herramientas de admisión y control de modelos locales, como el proyecto Layerfault de GitHub. No es un modelo de lenguaje, no tiene pesos ni arquitectura, y no debe ser cargado ni ejecutado fuera de un entorno aislado de pruebas de escáner. Por tanto, esta ficha se redacta para documentar su naturaleza y advertencias, no para describir capacidades de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento. El repositorio es un artefacto sintético generado para pruebas de seguridad. La model card indica que contiene características adversariales (opcodes de pickle sospechosos, contrabente de formatos ejecutables, cadenas de prompt-injection) para evaluar la capacidad de los escáneres de detectar estos patrones. No hay datos de entrenamiento, ni tokens, ni proceso de RLHF/DPO. El objetivo es únicamente servir como entrada de prueba para herramientas de admisión de modelos, como Layerfault.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código o visión.
- No soporta tool calling, agentes ni multi-step reasoning.
- No es un modelo de lenguaje ni multimodal.
- Su única función es actuar como objeto de prueba para escáneres de seguridad de modelos.

## Casos de uso

- Pruebas de escáner de seguridad de modelos: el artefacto se utiliza para verificar que un sistema de admisión (como Layerfault) detecta y bloquea repositorios con características adversariales, como opcodes de pickle sospechosos o cadenas de prompt-injection.
- Control de calidad de reglas de detección: sirve como entrada positiva para validar que las reglas de un escáner se activan correctamente ante este tipo de artefactos, sin necesidad de usar modelos reales.
- Evaluación de robustez de pipelines de seguridad: permite comprobar si un pipeline de CI/CD que inspecciona modelos locales reacciona ante un artefacto marcado como "BLOCK" (decisión esperada: bloqueo).
- Formación de equipos de seguridad: puede usarse en entornos controlados para enseñar a detectar señales de artefactos maliciosos en repositorios de modelos.
- Investigación sobre adversarial testing en ML: sirve como ejemplo de cómo se construyen fixtures sintéticos para evaluar sistemas de seguridad.
- No aplica ningún caso de uso productivo de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es un modelo y no tiene métricas de rendimiento. No procede comparación con otros modelos.

## Requisitos de hardware

No aplica. No hay inferencia, ni VRAM, ni GPU, ni opciones de despliegue. La única consideración es que el repositorio debe ser analizado en un entorno aislado y estático, sin ejecutar sus contenidos.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque no es un modelo. La categoría de artefactos de seguridad sintéticos no tiene alternativas de IA.

## Limitaciones y advertencias

- Este repositorio no es un modelo de IA y no debe usarse como tal.
- Contiene características adversariales diseñadas para activar reglas de seguridad; cargarlo o ejecutarlo fuera de un entorno aislado puede exponer el sistema a riesgos.
- La model card especifica que se debe aceptar un aviso de riesgo antes de acceder (gated).
- La licencia apache-2.0 permite el uso, pero solo en el contexto de pruebas de seguridad.
- No hay garantía de que el artefacto represente un modelo real ni de que sus características sean seguras en producción.
- Cualquier uso fuera de pruebas de escáner es inadecuado y peligroso.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/LayerFault/script-mixed-language-capability-chain
- Repositorio de Layerfault en GitHub: https://github.com/izm1chael/layerfault/tree/main
- Documentación de fuentes de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/SOURCES.md
