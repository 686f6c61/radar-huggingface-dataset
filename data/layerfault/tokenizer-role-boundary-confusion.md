# LayerFault/tokenizer-role-boundary-confusion

## Resumen

El repositorio `LayerFault/tokenizer-role-boundary-confusion` no es un modelo de IA utilizable, sino un artefacto de prueba sintética perteneciente al corpus de seguridad Layerfault (corpus ID `LF-CH-TOKX-0006`). Su propósito es ejercitar escáneres de seguridad estáticos y entornos aislados de análisis, simulando características adversarias como opcodes pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts. No contiene pesos de modelo, arquitectura ni capacidades de inferencia.

Este artefacto se centra en la confusión de límites de rol en tokenizadores, una técnica relacionada con la inyección de prompts y la confusión de roles descrita en investigaciones recientes (por ejemplo, el artículo arXiv 2603.12277). Su severidad es baja, dificultad básica y la decisión de admisión esperada es `WARN`, sirviendo como control positivo para detectores como `LF-TOKENIZER-ROLE-BOUNDARY-CONTROL`.

Aunque el repositorio tiene licencia Apache-2.0, su etiqueta `extra_gated_prompt` exige confirmación explícita de que el usuario entiende que es un fixture de prueba, no un modelo de producción. Cualquier intento de cargarlo o ejecutarlo fuera de un entorno aislado de pruebas de escáneres conlleva riesgos de seguridad no mitigados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML; artefacto sintetico de prueba) |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene artefactos de test, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento en el sentido convencional de un modelo de lenguaje. El repositorio es un fixture sintético diseñado para confundir los límites de rol de un tokenizador, probablemente incluyendo secuencias de tokens o estructuras de texto que imitan la voz de un rol para evadir las reglas de seguridad. No se han publicado datos de entrenamiento ni proceso de optimización; el contenido es generado artificialmente con el propósito de ejercitar reglas de detección.

Según la model card, el artefacto pertenece al corpus Layerfault, una herramienta offline-first de admisión estática y pruebas de comportamiento sandbox para modelos de IA locales. El corpus emplea secretos falsos, destinos de red `.invalid` y salidas de marcador inofensivas, y se limita a escaneo estático y pruebas aisladas.

## Capacidades

- No es un modelo de generación de texto, razonamiento, código ni visión.
- No soporta tool calling, funciones ni agentes.
- No tiene capacidades multilingües.
- Su única "capacidad" es servir como entrada de control positiva para evaluar detectores de seguridad (regla candidata `LF-TOKENIZER-ROLE-BOUNDARY-CONTROL`).
- Puede contener opcodes pickle sospechosos, formatos ejecutables camuflados y cadenas de inyección de prompts diseñadas para activar alertas en escáneres.

## Casos de uso

- Pruebas de regresión de escáneres de seguridad de modelos: el artefacto se usa como entrada de control para verificar que un detector de la regla `LF-TOKENIZER-ROLE-BOUNDARY-CONTROL` emite una alerta WARN al analizarlo.
- Evaluación de sistemas de admisión de modelos locales: herramientas como Layerfault (https://github.com/izm1chael/layerfault) pueden usar este fixture para comprobar que sus reglas de validación estática detectan artefactos con confusión de límites de rol en tokenizadores.
- Desarrollo de reglas de detección de inyección de prompts: los investigadores de seguridad pueden usar este artefacto como ejemplo concreto de una técnica de confusión de roles para entrenar o probar nuevos detectores.
- Auditoría de pipelines de escaneo: se puede integrar en un pipeline CI/CD de seguridad para verificar que el escáner no produce falsos negativos ante este tipo de contenido sintético.
- Comparación de herramientas de sandboxing: se puede ejecutar en un entorno sandbox aislado para observar si algún runtime intenta cargarlo y qué efectos secundarios provoca, aunque no es un modelo ejecutable.
- Formación de equipos de seguridad: como material de demostración de técnicas de ataque a tokenizadores, sin necesidad de ejecutar código real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo ML, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K. Los únicos "resultados" esperados son decisiones de admisión de escáneres (WARN) y la activación o no de reglas candidatas.

## Requisitos de hardware

- No aplica: no hay inferencia, no hay VRAM ni GPU requerida.
- Si se desea ejecutar el artefacto en un entorno sandboxed para pruebas, se recomienda una máquina aislada (por ejemplo, un contenedor Linux sin acceso a red) con cualquier CPU; no se necesitan GPUs.
- Herramientas de escaneo estático como Layerfault se ejecutan en CPU y no requieren aceleración.
- No hay opciones de despliegue de inferencia (vLLM, llama.cpp, etc.) porque no es un modelo.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos de lenguaje de la misma categoría (tamaño, tarea) porque no es un modelo. Podría compararse con otros artefactos del corpus Layerfault (por ejemplo, otros IDs `LF-CH-*`), pero no se proporcionan datos de otros repositorios en la información disponible.

## Limitaciones y advertencias

- **No es un modelo de producción**: la model card lo advierte explícitamente; cargarlo o ejecutarlo fuera de un entorno de pruebas de escáneres puede activar comportamiento malicioso o causar falsas alertas.
- **Contiene características adversarias**: puede incluir opcodes pickle sospechosos, formatos ejecutables camuflados y cadenas de inyección de prompts; no debe abrirse con herramientas que ejecuten código.
- **Sesgos y alucinación**: no aplica, ya que no hay modelo.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el `extra_gated_prompt` exige confirmación de que se entiende el riesgo. No se recomienda su redistribución como si fuera un modelo real.
- **Riesgo de confusión**: si se descarga por error como modelo de lenguaje, puede inducir a error a sistemas que intenten cargarlo; los escáneres deben identificarlo como `WARN` y bloquearlo.
- **Cobertura limitada**: no tiene idiomas, ni contexto, ni capacidades; es un fixture de test, no un componente de software útil.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/tokenizer-role-boundary-confusion
- GitHub Layerfault (herramienta de admisión estática): https://github.com/izm1chael/layerfault
- Artículo sobre inyección de prompts y confusión de roles: https://arxiv.org/html/2603.12277v1
- Blog sobre confusión de roles en inyección de prompts: https://ideaverse.ai/blog/prompt-injection-as-role-confusion-why-llms-fail-trust-boundaries-mqpqsoij
- Web del proyecto Prompt Injection as Role Confusion: https://role-confusion.github.io/
- Noticia de The Register sobre abuso de roles para inyección de prompts: https://www.theregister.com/ai-and-ml/2026/06/30/security-researchers-tricked-llms-into-giving-them-cocaine-recipes-by-abusing-role-models-for-prompt-injection/5264115
