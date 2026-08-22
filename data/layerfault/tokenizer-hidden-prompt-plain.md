# LayerFault/tokenizer-hidden-prompt-plain

## Resumen

El repositorio `LayerFault/tokenizer-hidden-prompt-plain` no contiene un modelo de IA funcional, sino un artefacto sintético de prueba de seguridad perteneciente al corpus LayerFault. Según su model card, se trata de un fixture de testing diseñado para ejercitar reglas de detección de escáneres de seguridad en modelos de lenguaje, con identificador de corpus `LF-CH-TOKX-0003`. El repositorio está marcado como de acceso restringido (gated) y advierte explícitamente de que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas.

Este artefacto se centra en la superficie de ataque "tokenizer-processor" y en la técnica "tokenizer", con un nivel de severidad medio y una dificultad de detección alta. No se trata de pesos de modelo, sino de un fichero de test que incluye características adversarias deliberadas (opcodes sospechosos, cadenas de inyección de prompt, etc.) para validar la capacidad de los sistemas de escaneo de detectar este tipo de amenazas. Su relevancia radica en la investigación de seguridad de la cadena de suministro de modelos, un área en crecimiento ante el auge de la distribución de modelos a través de plataformas como HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo funcional) |
| Parametros totales | no disponible (no es un modelo funcional) |
| Parametros activos | no disponible (no es un modelo funcional) |
| Longitud de contexto | no disponible (no es un modelo funcional) |
| Tipos de cuantizacion | no disponible (no es un modelo funcional) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no es un modelo funcional) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene una arquitectura de modelo, ni datos de entrenamiento, ni pesos. Es un artefacto sintético de seguridad perteneciente al corpus LayerFault, construido deliberadamente para contener características adversariales (opcodes de pickle sospechosos, contrabando de formatos ejecutables, strings de inyección de prompt) con el objetivo de probar reglas de detección en escáneres de seguridad de modelos. La model card especifica que no es un modelo utilizable y que no debe cargarse fuera de un entorno aislado de pruebas de escáner.

## Capacidades

- No es un modelo de IA utilizable: no genera texto, no razona, no procesa código ni imágenes.
- Su única función es servir como entrada de prueba para escáneres de seguridad estática y dinámica.
- Contiene características adversariales (prompt injection, opcodes sospechosos, etc.) que deben ser detectadas por herramientas de seguridad.
- Actúa como control positivo en el corpus LayerFault para la regla candidata `LF-TOKENIZER-HIDDEN-PROMPT`.
- No soporta tool calling, agentes, ni ninguna capacidad de inferencia.
- No tiene capacidades multilingües ni de visión.

## Casos de uso

Dado que este repositorio no es un modelo, sus "casos de uso" se limitan al ámbito de la seguridad de la cadena de suministro de IA:

- **Pruebas de escáneres de seguridad de modelos**: se utiliza como entrada de test para verificar si un escáner (tipo HiddenLayer, por ejemplo) detecta la inyección de prompts oculta en el tokenizer.
- **Validación de reglas de detección**: sirve para confirmar que la regla `LF-TOKENIZER-HIDDEN-PROMPT` se activa correctamente y no produce falsos positivos.
- **Investigación de ataques de tokenización**: permite estudiar cómo los adversarios pueden ocultar instrucciones maliciosas en el tokenizador de un modelo, técnica documentada en investigaciones como las de HiddenLayer sobre tokenizer tampering.
- **Desarrollo de herramientas de hardening**: los equipos de seguridad pueden usarlo para mejorar sus pipelines de detección de artefactos maliciosos antes de que lleguen a producción.
- **Formación y concienciación**: sirve como ejemplo didáctico para demostrar a desarrolladores e investigadores cómo se construyen y detectan este tipo de ataques.
- **Evaluación de plataformas de distribución de modelos**: permite probar si HuggingFace u otros hubs detectan y bloquean artefactos con características adversariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo de IA, por lo que no existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.). Su "rendimiento" se evalúa en términos de detección por parte de escáneres de seguridad, no en tareas de lenguaje.

## Requisitos de hardware

No aplica. Al no ser un modelo funcional, no requiere VRAM, GPU ni infraestructura de inferencia. El único entorno necesario es un sistema aislado para pruebas de seguridad estática (por ejemplo, una máquina virtual desechable o un contenedor sin red). No se debe intentar cargar ni ejecutar los ficheros en un entorno de producción.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que este repositorio no es un modelo de IA sino un artefacto de prueba de seguridad. La comparativa relevante sería con otros artefactos del corpus LayerFault (como `LF-CH-TOKX-0001`, `LF-CH-TOKX-0002`), pero no se dispone de información pública sobre ellos.

## Limitaciones y advertencias

- **No es un modelo utilizable**: cargar o ejecutar este repositorio fuera de un entorno aislado de pruebas de seguridad es un riesgo de seguridad real.
- **Contiene características adversariales**: incluye opcodes sospechosos, strings de inyección de prompt y posibles técnicas de smuggling de ejecutables. No debe desplegarse en producción ni usarse en sistemas conectados a internet.
- **Acceso restringido**: el repositorio está marcado como gated y requiere que el usuario acepte explícitamente el riesgo antes de acceder.
- **Sesgos y alucinación**: no aplica, ya que no es un modelo de lenguaje.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el aviso de la model card indica que es un artefacto de test y no debe usarse como modelo de producción.
- **Riesgo de confusión**: los desarrolladores podrían confundirlo con un modelo real y cargarlo en un pipeline, con consecuencias de seguridad graves.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/tokenizer-hidden-prompt-plain
- HiddenLayer: Tokenization attacks on LLMs: https://www.hiddenlayer.com/research/tokenization-attacks-on-llms-how-adversaries-exploit-ai-language-processing
- HiddenLayer: Tokenizer tampering (remediation guide): https://docs.hiddenlayer.ai/docs/products/supply-chain/remediation-guide/tokenizer_tampering
- HiddenLayer: Tokenizer tampering (research): https://www.hiddenlayer.com/research/tokenizer-tampering
- ExplainX: Ox Alpha (menciona la relevancia de tokenizer fingerprinting): https://www.explainx.ai/blog/ox-alpha-what-we-know-mystery-ai-model-august-2026
- Documentación de HiddenLayer AI Security Platform: https://docs.hiddenlayer.ai/
