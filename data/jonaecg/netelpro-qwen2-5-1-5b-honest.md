# JonaECG/netelpro-qwen2.5-1.5b-honest

## Resumen

Netelpro-Qwen2.5-1.5B-Honest es un modelo de lenguaje alineado mediante DPO (Direct Preference Optimization) sobre la base Qwen/Qwen2.5-1.5B-Instruct. Ha sido desarrollado por JonaECG, en el marco del grupo Neuromancer Research Group, con el objetivo de eliminar el fenómeno denominado "Verification Theater" en agentes autónomos: la tendencia de los modelos a fabricar afirmaciones empíricas sobre sistemas externos (archivos, puertos abiertos, estados de bases de datos, suites de tests) sin haber ejecutado ninguna herramienta que las verifique.

El modelo reconoce sus límites epistémicos y, en lugar de alucinar respuestas, admite que no puede verificar una afirmación sin ejecutar una herramienta y guía al usuario sobre qué información o comando necesita. Se trata de un transformer decoder-only de 1.543.714.304 parámetros, con licencia MIT y soporte para español e inglés. La información disponible no especifica la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 1.543.714.304 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se especifican otros tipos |
| Idiomas soportados | español, inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo no introduce cambios en la arquitectura del modelo base Qwen/Qwen2.5-1.5B-Instruct. La innovación reside en el proceso de alineación: se ha entrenado mediante DPO sobre el dataset jona2428/netelpro, un conjunto de datos auditado y verificado matemáticamente por el compilador Netelpro, un compilador nativo basado en LLVM. Este auditor garantiza que las afirmaciones empíricas presentes en los datos de entrenamiento estén respaldadas por evidencia real.

El entrenamiento se realizó con Unsloth y TRL en una GPU Nvidia Tesla T4 de 16 GB de VRAM, con un tiempo de entrenamiento aproximado de 20 minutos. No se emplearon técnicas como RLHF ni decodificación especulativa. El objetivo principal es que el modelo aprenda a distinguir entre lo que puede afirmar con evidencia y lo que no, reduciendo así la alucinación en entornos de agentes con tool use.

## Capacidades

- Generación de texto en español e inglés.
- Alineado para rechazar afirmaciones empíricas no verificadas sobre sistemas externos, como archivos, puertos, estados de bases de datos o resultados de tests.
- Reconoce sus límites epistémicos y, en lugar de inventar, solicita al usuario la información o el comando necesario para verificar la afirmación.
- Orientado a tool use: diseñado para integrarse en agentes autónomos que ejecutan herramientas, aunque no se especifica un formato nativo de function calling.
- Puede actuar como asistente en tareas de diagnóstico y auditoría, evitando falsos positivos.
- No dispone de capacidades de visión ni de audio.

## Casos de uso

- Agentes autónomos de gestión de archivos: el modelo puede negarse a afirmar que un archivo existe o que contiene un valor concreto si no ha ejecutado una herramienta de lectura, evitando alucinaciones en pipelines de automatización.
- Auditoría de configuración: cuando se le pregunta si una variable de entorno está definida, responde indicando el comando `env | grep SECRET_KEY` en lugar de afirmar que está configurada.
- Diagnóstico de sistemas: ante consultas sobre puertos abiertos, reconoce que no puede verificar sin ejecutar `ss -tulpn` y guía al usuario para obtener la evidencia.
- Integración en pipelines de CI/CD: al preguntarle por el estado de una suite de tests, evita reportar falsos positivos y sugiere ejecutar los tests para obtener resultados reales.
- Soporte técnico y helpdesk: cuando un usuario pregunta por el estado de un servicio, el modelo indica qué comando ejecutar en lugar de inventar un estado, mejorando la fiabilidad de las respuestas.
- Formación y educación: puede utilizarse para enseñar a los usuarios a verificar afirmaciones empíricas, mostrando el proceso de comprobación y fomentando el pensamiento crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor presenta una evaluación propia denominada Verification Theater Benchmark (VTB), realizada sobre 30 escenarios reales de FileSystem, System State y Code Execution:

| Metrica | Modelo base (prompt-only) | Netelpro-Qwen2.5-1.5B-Honest |
|---|---|---|
| Tasa de aceptación de afirmaciones falsas (FAAR) | 100.0% | 0.0% |
| Calibración epistémica | Pobre (alta confianza en conjeturas) | Alta (límites precisos) |
| Huella de VRAM | ~1.5 GB | ~986 MB (Q4_K_M GGUF) |

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: ~986 MB con la cuantización Q4_K_M en formato GGUF, según la model card. Para los pesos en safetensors no se proporciona un dato de VRAM.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM es suficiente para la versión Q4_K_M. El entrenamiento se realizó en una Nvidia Tesla T4 de 16 GB, pero no es necesaria para la inferencia.
- Cabe en GPU de consumo: sí, la versión Q4_K_M puede ejecutarse en tarjetas como una GTX 1650, RTX 3060 o equivalentes con más de 1 GB de VRAM.
- Opciones de despliegue: Ollama (mediante un Modelfile), LM Studio y cualquier runtime compatible con GGUF como llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | FAAR (VTB) | Disponibilidad |
|---|---|---|---|---|---|
| Netelpro-Qwen2.5-1.5B-Honest | 1.54B | no disponible | MIT | 0.0% | HuggingFace, GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1.54B | no disponible | no disponible | 100.0% | HuggingFace |

El modelo base Qwen2.5-1.5B-Instruct es la alternativa directa sin alineación específica. No se han identificado otros modelos comparables en la categoría de alineación contra "Verification Theater".

## Limitaciones y advertencias

- Es un modelo pequeño de 1.5B parámetros, por lo que su capacidad general de razonamiento y generación es limitada en comparación con modelos de mayor tamaño.
- La alineación puede resultar excesivamente conservadora: en algunos casos podría negarse a responder incluso cuando un razonamiento probabilístico sería aceptable.
- Solo soporta español e inglés, lo que limita su uso en otros idiomas.
- No se han publicado benchmarks estándar que evalúen su rendimiento general, por lo que su calidad en tareas comunes no está contrastada.
- La evaluación VTB es del propio autor, con un tamaño de muestra de 30 escenarios, y no ha sido auditada externamente.
- El comportamiento fuera del dominio del dataset de entrenamiento puede no mantener la alineación esperada.
- La licencia MIT permite uso comercial, pero no incluye garantías de seguridad ni de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JonaECG/netelpro-qwen2.5-1.5b-honest
- Repositorio y whitepaper de Netelpro: https://github.com/jona2428/netelpro
- Modelo base Qwen/Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B
