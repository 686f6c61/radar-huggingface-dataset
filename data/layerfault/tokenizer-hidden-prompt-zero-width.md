# LayerFault/tokenizer-hidden-prompt-zero-width

## Resumen

`LayerFault/tokenizer-hidden-prompt-zero-width` es un artefacto sintético de pruebas de seguridad perteneciente al corpus LayerFault, identificado como `LF-CH-TOKX-0004`. No es un modelo de aprendizaje automático utilizable, sino una muestra diseñada para ejercitar reglas de detección en escáneres de seguridad. El repositorio contiene características adversariales intencionadas, como opcodes de pickle sospechosos, cadenas de inyección de prompt y técnicas de ocultación mediante caracteres de ancho cero, orientadas a validar y mejorar los sistemas de detección de amenazas.

El artefacto está clasificado como de severidad alta y dificultad compuesta, con una decisión de admisión esperada de "BLOCK". Su superficie de ataque es el procesador de tokenización y emplea técnicas de tokenizer para ocultar el payload. La model card advierte explícitamente de que no se debe cargar ni ejecutar fuera de un entorno de pruebas aislado, y que no contiene pesos de modelo reales.

Este artefacto resulta relevante en el contexto actual de investigación en seguridad de LLM, donde los ataques por manipulación de tokenización (glitch tokens, Unicode invisible, TokenBreak) son una amenaza creciente para pipelines de agentes y sistemas RAG. Su función es servir como banco de pruebas para detectores de inyección de prompt y tampering de tokenizer, no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto sintético, no un modelo de ML) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio contiene strings y opcodes maliciosos, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No procede. El repositorio no contiene un modelo de aprendizaje automático; es un fixture de prueba sintética. La model card indica que incluye "sospechosos opcodes de pickle, contrabando de formatos ejecutables y strings de inyección de prompt" diseñados para activar reglas de detección en escáneres. No hay arquitectura, datos de entrenamiento ni proceso de entrenamiento que describir.

## Capacidades

No aplica. Este artefacto no es un modelo de generación de texto ni de ninguna otra capacidad. Su función es exclusivamente servir de entrada para pruebas de escáneres de seguridad. Las capacidades relevantes son las de los sistemas que intentan detectar su contenido malicioso:

- Detección de strings de inyección de prompt ocultos mediante caracteres de ancho cero.
- Detección de opcodes de pickle sospechosos en el contenido.
- Detección de contrabando de formatos ejecutables en cargas de modelo.
- Verificación de que las reglas de control negativo permanecen silenciosas (no generan falsos positivos).
- Prueba de que las reglas candidatas (`LF-TOKENIZER-HIDDEN-PROMPT`, `LF-HEUR-DECODED-MATCH`) se activan correctamente.

## Casos de uso

El artefacto no es apto para ningún caso de uso de producción. Sus aplicaciones son exclusivamente de seguridad:

- Pruebas de regresión de escáneres de seguridad: se usa como entrada positiva para verificar que las reglas de detección de inyección de prompt se activan correctamente.
- Validación de detectores de tokenizer tampering: el artefacto contiene técnicas de ocultamiento de payload a nivel de tokenización, por lo que sirve para probar la robustez de detectores contra ataques tipo glitch tokens o Unicode invisible.
- Evaluación de pipelines de CI/CD de seguridad: se integra en suites de pruebas automáticas para garantizar que los escáneres de código bloquean artefactos con características adversas.
- Entrenamiento de reglas heurísticas: los datos del corpus se usan para ajustar heurísticas de detección que identifiquen patrones similares en repositorios reales.
- Auditoría de repositorios públicos: sirve como referencia para que los mantenedores de repositorios LLM detecten artefactos similares en sus dependencias.
- Investigación en seguridad de LLM: permite estudiar cómo se propaga el riesgo de inyección de prompt a través de repositorios de modelos y tokenizadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es un modelo de ML y no tiene métricas de rendimiento. La model card solo indica una clasificación de desafío: severidad alta, dificultad compuesta, decisión de admisión esperada "BLOCK".

## Requisitos de hardware

No aplica. El artefacto no requiere hardware de inferencia ni de entrenamiento. Su uso se limita a ejecución en entornos de pruebas aisladas con escáneres de seguridad. No hay requisitos de GPU, VRAM ni latencia. La model card recomienda explícitamente no cargarlo ni ejecutarlo fuera de un entorno aislado de pruebas de escáner.

## Comparativa con modelos similares

No disponible. Este artefacto no es comparable con modelos de lenguaje como Llama, Mistral o Qwen. Su categoría es la de "fixture de prueba de seguridad", y no hay información pública sobre otros artefactos equivalentes del corpus Layerfault para comparar. La model card menciona que es un "control/comparison input" con reglas candidatas y negativas, pero no se proporcionan datos de otros miembros del corpus.

## Limitaciones y advertencias

- No es un modelo utilizable: contiene opcodes de pickle sospechos, strings de inyección y contrabando de formatos ejecutables. No se debe cargar en ningún entorno de producción ni de desarrollo.
- Riesgo de ejecución maliciosa: si se cargan los pesos o se ejecuta el contenido fuera de un entorno aislado, podría activarse código malicioso o exfiltrar datos.
- Sesgos y alucinaciones: no aplica, no es un modelo de lenguaje.
- Licencia Apache-2.0: aunque la licencia permite uso comercial, la model card exige aceptar un gate con un aviso explícito de que es un fixture de prueba y que el uso está restringido a entornos de pruebas de escáner. El uso comercial fuera de ese contexto es desaconsejable y potencialmente peligroso.
- Riesgo de falsos positivos en detectores: el artefacto incluye reglas de control negativas que deben permanecer silenciosas; si un detector las activa, indica un fallo en el detector.
- Fecha de creación futura (2026-08-21): el repositorio tiene una fecha de creación posterior a la fecha actual, lo que sugiere que es parte de un corpus sintético generado para pruebas y no refleja un desarrollo real de modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/tokenizer-hidden-prompt-zero-width
- Documentación de tokenizers de HuggingFace (referencia técnica): https://huggingface.co/docs/transformers/main_classes/tokenizer
- Investigación sobre tokenizer tampering (HiddenLayer): https://www.hiddenlayer.com/research/tokenizer-tampering
- Investigación sobre tokenization attacks en LLMs (HiddenLayer): https://www.hiddenlayer.com/research/tokenization-attacks-on-llms-how-adversaries-exploit-ai-language-processing
- Guía técnica sobre CVE-2026-3304 y ocultación de caracteres en prompts: https://www.zinruss.com/prevent-llm-prompt-injection-hidden-character-obfuscation/
- Cheatsheet de inyección de prompts en IA (2026): https://github.com/nukIeer/AI-Prompt-Injection-Cheatsheet
