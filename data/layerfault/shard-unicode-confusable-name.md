# LayerFault/shard-unicode-confusable-name

## Resumen

Este repositorio no es un modelo de IA utilizable, sino un artefacto sintético de seguridad perteneciente al corpus Layerfault (ID `LF-CH-SHARD-0005`). Ha sido construido deliberadamente con características adversarias —opcodes pickle sospechosos, contenedores ejecutables camuflados, cadenas de inyección de prompts— para ejercitar y validar reglas de detección en escáneres de seguridad de modelos locales. El autor, LayerFault, lo clasifica como un "control positivo" con severidad crítica y decisión de admisión esperada de bloqueo.

Su propósito es servir como entrada de prueba para sistemas de admisión y control de artefactos de IA, no como un modelo con pesos entrenados. No contiene pesos de modelo, no tiene pipeline de inferencia y su tamaño de repositorio es de 0.0 GB. Cualquier intento de cargarlo o ejecutarlo fuera de un entorno aislado de pruebas de escáner es un riesgo de seguridad.

La relevancia de este artefacto reside en su uso como referencia para evaluar la capacidad de los escáneres de detectar técnicas de evasión basadas en Unicode confusable y estados de paquetes fragmentados (shard-package-state). Forma parte de un corpus sintético más amplio diseñado para certificar detectores de seguridad, no para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiquetado, pero no contiene pesos reales) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. El repositorio es un fichero de prueba sintético que simula la estructura de un paquete de modelo (shard) para ejercitar detectores de seguridad. Según la model card, contiene opcodes pickle sospechosos, formatos ejecutables camuflados y cadenas de inyección de prompts, todo ello con el fin de que un escáner los clasifique como "BLOCK". No hay datos de entrenamiento, tokens ni técnicas de alineación como RLHF o DPO.

La técnica de ataque objetivo es el "shard-package-state": fragmentos de paquete con nombres Unicode confusables que pueden evadir detecciones basadas en listas negras de cadenas exactas. No se proporcionan detalles sobre el contenido binario real más allá de las advertencias de seguridad.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código o visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su única función es servir como entrada de prueba para escáneres de seguridad, con técnicas de evasión basadas en Unicode confusable y fragmentación de paquetes.

## Casos de uso

- **Pruebas de escáneres de seguridad**: el artefacto se puede usar para verificar que un sistema de admisión de modelos locales (como Layerfault) detecta y bloquea paquetes con nombres Unicode confusables. Se introduce en el pipeline de análisis y se comprueba que la decisión de admisión es "BLOCK".
- **Validación de reglas de detección**: los equipos de seguridad pueden usar este repositorio como control positivo para certificar que sus reglas de detección de inyección de prompts y opcodes pickle sospechosos funcionan antes de desplegarlas en producción.
- **Evaluación de herramientas de análisis estático**: sirve para comparar la eficacia de distintos escáneres (Semgrep, Guardrails, etc.) frente a técnicas de evasión Unicode.
- **Investigación en seguridad de modelos**: permite estudiar cómo los confusables Unicode se fragmentan en tokens BPE y cómo esto puede multiplicar el coste de inferencia (ataques de "denial of spend").
- **Entrenamiento de detectores de inyección de prompts**: los equipos de defensa pueden usar el artefacto como entrada maliciosa para entrenar clasificadores que identifiquen este tipo de evasión en prompts.
- **Certificación de pipelines de admisión**: para empresas que despliegan modelos locales, este artefacto sirve para demostrar que el sistema de control de calidad de seguridad bloquea artefactos adversarios antes de que lleguen a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es un modelo de inferencia y no tiene métricas de rendimiento (latencia, throughput, exactitud) que puedan evaluarse.

## Requisitos de hardware

- No requiere VRAM ni GPU para su uso previsto.
- No necesita GPU de ningún tipo; se debe ejecutar exclusivamente en un entorno aislado de pruebas (sandbox, contenedor desechable, VM sin conexión).
- No es desplegable en vLLM, llama.cpp, Ollama ni TGI, ya que no contiene pesos de modelo.
- La latencia y throughput no son aplicables; su uso es únicamente estático o de escaneo en memoria.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque este artefacto no es un modelo de lenguaje. Los repositorios del corpus Layerfault (otros shards con identificadores similares) serían comparables, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: no se puede cargar, ejecutar ni usar para ninguna tarea de inferencia. Cualquier intento de hacerlo puede provocar comportamientos no deseados o comprometer el sistema.
- **Contiene características adversarias**: el repositorio incluye opcodes pickle sospechosos, ejecutables camuflados y cadenas de inyección de prompts. Ejecutarlo fuera de un entorno aislado es un riesgo de seguridad crítico.
- **No apto para producción**: la model card advierte explícitamente que es un "test fixture" y no pesos de modelo de producción.
- **Licencia Apache 2.0**: permite uso comercial, pero solo para fines de prueba de seguridad; no se puede distribuir como un modelo funcional.
- **Sin datos de rendimiento**: no hay métricas de calidad ni benchmarks, lo que lo hace inutilizable para evaluación de tareas de NLP.
- **Riesgo de confusión**: por su nombre y estructura, podría confundirse con un modelo legítimo; es esencial leer la model card antes de cualquier uso.

## Enlaces

- HuggingFace: https://huggingface.co/LayerFault/shard-unicode-confusable-name
- GitHub de Layerfault (proyecto de seguridad): https://github.com/izm1chael/layerfault
- GitHub DetectionFramework (marco de detección de confusables Unicode): https://github.com/CypherLamb/DetectionFramework
- Artículo sobre detección de homoglifos Unicode y evasión de inyección de prompts: https://dev.to/meghal_parikh_b8c5c6e3244/detecting-unicode-homoglyph-and-zero-width-character-evasion-in-llm-prompt-injection-attacks-1e69
- Artículo sobre ataques de confusables Unicode a LLMs: https://paultendo.github.io/posts/confusable-vision-llm-attack-tests/
