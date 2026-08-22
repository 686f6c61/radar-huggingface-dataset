# LayerFault/tokenizer-added-token-shadowing

## Resumen

El repositorio `LayerFault/tokenizer-added-token-shadowing` es un artefacto sintetico de prueba de seguridad perteneciente al corpus Layerfault, un conjunto de fixtures disenados para ejercitar detectores de vulnerabilidades en modelos de IA locales. No se trata de un modelo de lenguaje funcional ni de pesos entrenados, sino de un fichero de control con caracteristicas adversariales (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyeccion de prompt) que sirven para evaluar reglas de escaneo estatico y comportamiento en sandbox. Su proposito es actuar como entrada de comparacion para herramientas de admision de modelos como Layerfault, que validan artefactos antes de su inferencia.

El repositorio fue creado el 21 de agosto de 2026 por LayerFault y no registra descargas ni likes. Su licencia es Apache 2.0, pero la model card advierte explicitamente de que no debe cargarse ni ejecutarse fuera de un entorno de pruebas aislado. La ficha tecnica que sigue refleja que este artefacto no tiene especificaciones de modelo tipicas: no hay arquitectura, parametros, contexto ni idiomas disponibles, ya que su finalidad no es la inferencia sino la evaluacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto sintetico, no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos; es un fixture de prueba) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un artefacto de control del corpus Layerfault, disenado para simular caracteristicas que podrian ser detectadas por escaneres de seguridad de modelos. Segun la model card, contiene caracteristicas adversariales como opcodes de pickle sospechosos, contraband de formatos ejecutables y cadenas de prompt injection, pero sin datos de entrenamiento ni pesos reales. La intencion es que sirva como entrada positiva para pruebas de deteccion de vulnerabilidades en tokenizadores y procesadores de modelos.

## Capacidades

- No posee capacidades de generacion de texto, razonamiento, codigo o vision.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un modelo de lenguaje, sino un artefacto de prueba para validar sistemas de escaneo de seguridad.
- Su unica funcion es ser un input de control en pruebas de deteccion de amenazas en modelos de IA.

## Casos de uso

- Pruebas de regresion de escaneres de seguridad: se usa para verificar que una herramienta de deteccion (como Layerfault) identifica correctamente artefactos con caracteristicas adversariales y emite una advertencia (WARN).
- Evaluacion de blind spots en detectores: como el corpus item no tiene reglas esperadas directas, sirve para descubrir si un scanner falla al detectar este tipo de fixture.
- Desarrollo de reglas de deteccion: permite a los equipos de seguridad crear o ajustar reglas que capturen patrones de tokenizer shadowing.
- Pruebas de sandboxing: se puede ejecutar en entornos aislados para verificar que el sandbox de ejecucion de modelos no permite efectos secundarios no deseados.
- Comparacion de herramientas de admision de modelos: permite evaluar si diferentes herramientas de escaneo producen el mismo veredicto (WARN, admitido, etc.) ante un mismo artefacto.
- Formacion en seguridad de IA: como ejemplo de artefacto adversarial para ensenar a detectar riesgos en repositorios de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un artefacto de prueba y no un modelo de IA, no existen metricas de rendimiento tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se requieren GPU ni VRAM para su uso, ya que no es un modelo de inferencia.
- Puede procesarse con cualquier CPU en un entorno aislado (por ejemplo, un contenedor Linux).
- Para su uso en pruebas de seguridad, se recomienda un entorno de sandbox sin acceso a red ni privilegios de sistema.
- No aplica la latencia ni throughput de inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos de lenguaje, sino con otros artefactos de prueba de seguridad. En el corpus Layerfault existen otros items con caracteristicas adversariales, pero no se dispone de informacion especifica sobre ellos en los datos proporcionados.

## Limitaciones y advertencias

- Es un artefacto de seguridad sintetico, no un modelo utilizable. No debe cargarse ni ejecutarse como si fuera un modelo de IA.
- Contiene caracteristicas adversariales (opcodes de pickle sospechosos, contraband de formatos ejecutables, cadenas de prompt injection) que pueden desencadenar comportamientos no deseados si se procesa fuera de un entorno de pruebas aislado.
- No tiene capacidades de inferencia: no genera texto ni respuestas.
- Su licencia Apache 2.0 permite uso comercial, pero el uso previsto es exclusivamente para pruebas de seguridad estatica y sandboxing.
- No se han documentado sesgos ni riesgos de alucinacion porque no es un modelo de lenguaje.
- Para su uso en produccion no es adecuado en ningun caso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LayerFault/tokenizer-added-token-shadowing
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault
- Documentacion de Added Tokens de Hugging Face: https://huggingface.co/docs/tokenizers/en/api/added-tokens
- Documentacion de Tokenizer de Transformers: https://huggingface.co/docs/transformers/main_classes/tokenizer
