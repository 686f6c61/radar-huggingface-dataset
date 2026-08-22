# LayerFault/script-security-research-source-control

## Resumen

El repositorio `LayerFault/script-security-research-source-control` no es un modelo de inteligencia artificial, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault. Su identificador de corpus es `LF-CH-SCRX-0010`. La model card lo describe explícitamente como un "SECURITY TEST ARTIFACT: DO NOT USE AS A PRODUCTION MODEL" y aclara que contiene características adversas deliberadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts, diseñadas para ejercitar las reglas de detección de escáneres de seguridad.

Este repositorio se publica como un control negativo dentro del proceso de admisión y control de modelos locales de LayerFault. No contiene pesos de un modelo entrenado, ni arquitectura, ni capacidades de generación de texto o razonamiento. Su propósito es validar que las herramientas de escaneo estático no emitan falsos positivos en entradas que no representan amenazas reales. Por tanto, cualquier intento de cargarlo o ejecutarlo fuera de un entorno aislado de pruebas de escáner supone un riesgo y contradice las advertencias del autor.

La relevancia de esta ficha es doble: por un lado, documenta un elemento del corpus de seguridad LayerFault, y por otro, sirve como advertencia a la comunidad para no confundir artefactos de prueba con modelos funcionales. La licencia es Apache 2.0, pero su uso está restringido por la naturaleza del contenido y las condiciones de acceso controlado (`gated: auto`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un archivo o conjunto de archivos sintéticos generados para simular características maliciosas en un entorno controlado. La model card indica que es parte del corpus LayerFault de pruebas de seguridad, con técnicas como "security, research, source, control" y sin transformaciones. No hay datos de entrenamiento, tokens, ni procesos de RLHF o DPO. Su contenido se limita a texto y metadatos diseñados para activar o no activar reglas de detección en escáneres de seguridad.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No soporta tool calling ni function calling.
- No es un agente ni tiene capacidad de razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de audio o vídeo.
- Su única funcionalidad es la de servir como entrada de prueba para sistemas de análisis estático de seguridad (por ejemplo, detección de opcodes sospechosos o inyección de prompts).

## Casos de uso

- **Prueba de escáneres de seguridad de modelos**: el repositorio se utiliza como control negativo en pipelines de validación de modelos. Al ser un artefacto sintético que contiene características adversas pero que debería ser clasificado como "PASS" (no malicioso), permite verificar que un escáner no genere falsos positivos.
- **Desarrollo de reglas de detección**: los equipos de seguridad pueden usar este artefacto para ajustar reglas de análisis estático, asegurando que no marquen como malicioso lo que es un test controlado.
- **Evaluación de herramientas de admisión de modelos**: herramientas como LayerFault (la plataforma que da nombre al corpus) pueden probar su capacidad de distinguir artefactos benignos de amenazas reales.
- **Formación en seguridad de la cadena de suministro de IA**: sirve como ejemplo didáctico para entender qué características pueden ser consideradas sospechosas sin serlo realmente.
- **Validación de políticas de control de acceso**: al ser un repositorio gated con confirmación explícita del usuario, permite probar flujos de autorización en plataformas de modelos.
- **Investigación sobre detección de inyección de prompts**: los strings de inyección incluidos pueden usarse para estudiar cómo los escáneres identifican este tipo de amenazas en metadatos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no tiene rendimiento de IA que medir; su evaluación se basa en la precisión de las reglas de detección que lo procesan.

## Requisitos de hardware

- No requiere GPU ni VRAM para su procesamiento.
- Puede ser analizado con herramientas de línea de comandos en cualquier CPU.
- No es adecuado para inferencia ni despliegue en entornos de producción.
- Las pruebas deben realizarse en entornos aislados (máquinas virtuales, contenedores desechables) por su naturaleza adversa.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable, ya que se trata de un artefacto de prueba. Podría compararse con otros elementos del corpus LayerFault, pero no se dispone de información pública sobre ellos.

## Limitaciones y advertencias

- **No es un modelo utilizable**: intentar cargarlo o ejecutarlo como modelo de IA es peligroso y no tiene sentido.
- **Contiene características adversas**: opcodes de pickle sospechosos, formatos ejecutables y cadenas de inyección de prompts están presentes deliberadamente.
- **Uso restringido**: está pensado únicamente para pruebas de escáneres en entornos aislados. No debe desplegarse en producción.
- **Sin garantías**: no hay datos de entrenamiento ni rendimiento; no es apto para ninguna tarea de inferencia.
- **Acceso controlado**: el repositorio está gated y requiere aceptar los riesgos antes de acceder.
- **No es un modelo de referencia**: no puede usarse como punto de comparación para evaluar modelos reales.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/LayerFault/script-security-research-source-control
- Proyecto LayerFault (herramienta de admisión de modelos): https://github.com/izm1chael/layerfault
- Releases de LayerFault: https://github.com/izm1chael/layerfault/releases
- OWASP GenAI LLM Top 10 2026 (contexto de seguridad en IA): https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/
- Survey sobre amenazas y defensas en sistemas basados en LLM: https://arxiv.org/html/2604.23338
- Guía sobre seguridad de la cadena de suministro de IA/ML: https://script-kit.github.io/claude-research/docs/security/ai-ml-supply-chain-security
