# LayerFault/tokenizer-clean-template-control

## Resumen

Este repositorio, identificado como `LayerFault/tokenizer-clean-template-control`, es un **artefacto de prueba sintético de seguridad**, no un modelo de aprendizaje automático utilizable. Forma parte del corpus de seguridad de LayerFault, diseñado para ejercitar reglas de detección en escáneres de seguridad de modelos de IA. Su propósito es servir como **control negativo** para validar que ciertas reglas de detección (como `LF-TOKENIZER-HIDDEN-PROMPT` o `LF-TOKENIZER-ROLE-REMAP`) no se activen incorrectamente ante un tokenizador aparentemente limpio.

Aunque su nombre sugiere un tokenizador, el contenido incluye características adversas deliberadas (opcodes pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt injection) diseñadas para ejercitar las reglas de los escáneres. No tiene arquitectura, parámetros ni capacidades de inferencia; es un fichero de prueba que debe manejarse exclusivamente en entornos aislados de testing. Su relevancia radica en la investigación de seguridad de la cadena de suministro de IA, donde los tokenizadores pueden ser manipulados para ataques como la inyección de comandos o la exfiltración de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto de prueba sintética) |

## Arquitectura y entrenamiento

Este repositorio **no contiene un modelo entrenado**. Se trata de un fichero sintético construido manualmente por LayerFault para fines de validación de escáneres de seguridad. No hay arquitectura (ni transformer, ni MoE, ni SSM), ni datos de entrenamiento, ni proceso de RLHF o DPO. Su diseño se centra en incluir características adversas controladas, como opcodes de pickle sospechosos o cadenas de prompt injection, para ejercitar las reglas de detección de los sistemas de análisis estático. La model card indica explícitamente que es un *fixture* de prueba y que **no debe cargarse ni ejecutarse fuera de un entorno aislado de escaneo**.

## Capacidades

- **No es un modelo de lenguaje**: no genera texto, no razona, no procesa código ni matemáticas.
- **No ofrece generación de respuestas**: carece de cualquier pipeline de inferencia.
- **No soporta tool calling ni agentes**: no hay funcionalidad de llamada a herramientas.
- **No tiene capacidades multilingües**: no hay vocabulario ni tokenizador real.
- **Capacidad especial**: sirve como **control negativo** en pruebas de escáneres de seguridad, para verificar que las reglas de detección no se disparen ante un tokenizador limpio.

## Casos de uso

Aunque no es un modelo funcional, puede utilizarse en escenarios de seguridad y desarrollo de herramientas de análisis:

- **Validación de reglas de detección de tokenización**: permite comprobar que un escáner no genera falsos positivos sobre un tokenizador limpio, como control negativo en el pipeline de certificación de LayerFault.
- **Pruebas de regresión de escáneres de seguridad**: al integrarse en un conjunto de pruebas, ayuda a verificar que actualizaciones de detectores no rompan la detección de artefactos benignos.
- **Entrenamiento de clasificadores de seguridad**: se puede usar como ejemplo de entrada *negativa* para entrenar modelos que distingan entre tokenizadores legítimos y manipulados.
- **Evaluación de robustez de filtros de contenido**: los equipos de seguridad pueden incluir este artefacto en suites de pruebas para asegurar que los filtros no bloqueen archivos inofensivos.
- **Desarrollo de herramientas de análisis estático**: sirve como referencia para implementar reglas que deben permanecer silenciosas ante este tipo de control, ayudando a depurar la lógica de detección.
- **Investigación en ataques de tokenización**: aunque no es un modelo activo, su estructura permite estudiar cómo los escáneres reaccionan ante características adversas controladas, contribuyendo a la investigación de ataques como los descritos por HiddenLayer (tokenizer tampering, glitch tokens, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo funcional, no existen métricas de rendimiento (MMLU, HumanEval, GSM8K) ni comparaciones con otros sistemas.

## Requisitos de hardware

- **No requiere GPU ni hardware específico**: es un artefacto de texto/fichero, sin pesos de red neuronal.
- **Entorno de ejecución**: debe usarse únicamente en un entorno aislado (sandbox) para pruebas de seguridad, sin conexión a red externa.
- **Herramientas de análisis**: se puede procesar con scripts estáticos o escáneres de seguridad, sin necesidad de inferencia.
- **Latencia y throughput**: no procede.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable en el ecosistema porque este repositorio es un artefacto de prueba sintético, no un modelo de lenguaje. Las alternativas serían otros *fixtures* del corpus LayerFault (como `gguf-clean-control`), pero carecen de parámetros de rendimiento comparables.

## Limitaciones y advertencias

- **No es un modelo de producción**: no debe usarse para generar texto ni para ninguna tarea de IA.
- **Contiene contenido adversarial**: incluye opcodes pickle sospechosos y cadenas de prompt injection; ejecutarlo fuera de un entorno aislado puede causar riesgos de seguridad.
- **No debe cargarse en entornos de producción**: la model card advierte explícitamente que es un *test fixture* y no debe cargarse ni ejecutarse fuera de un entorno de pruebas de escáner.
- **Licencia Apache 2.0**: permite uso y modificación, pero el propósito original es exclusivamente para pruebas de seguridad.
- **Sin idiomas ni funcionalidad**: no soporta ningún idioma ni tiene capacidad de procesamiento de texto.
- **Riesgo de confusión**: si se descarga sin leer la documentación, podría confundirse con un tokenizador real, lo que llevaría a una integración no deseada en sistemas de producción.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/LayerFault/tokenizer-clean-template-control)
- [LayerFault/gguf-clean-control (otro control de LayerFault)](https://huggingface.co/LayerFault/gguf-clean-control)
- [Investigación de HiddenLayer: Tokenizer Tampering](https://www.hiddenlayer.com/research/tokenizer-tampering)
- [Investigación de HiddenLayer: Tokenization Attacks on LLMs](https://www.hiddenlayer.com/research/tokenization-attacks-on-llms-how-adversaries-exploit-ai-language-processing)
- [Documentación de Hugging Face sobre tokenizadores](https://huggingface.co/docs/transformers/main_classes/tokenizer)
- [Guía de chat templates de Mistral](https://github.com/mistralai/cookbook/blob/main/concept-deep-dive/tokenization/chat_templates.md)
