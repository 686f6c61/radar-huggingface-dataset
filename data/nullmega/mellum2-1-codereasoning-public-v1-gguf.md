# Nullmega/Mellum2.1-CodeReasoning-Public-v1-GGUF

## Resumen

Mellum2.1-CodeReasoning-Public-v1-GGUF es una cuantización en formato GGUF de un fine-tune candidato sobre el modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario Nullmega. Se trata de un ajuste LoRA orientado a código y razonamiento, entrenado sobre los datasets nvidia/OpenCodeInstruct y nvidia/OpenCodeReasoning, y distribuido en cuantizaciones GGUF directamente derivadas de los pesos fusionados en BF16. El modelo base es una arquitectura MoE de aproximadamente 12.150 millones de parámetros totales con 2.500 millones de parámetros activos, según la nomenclatura del propio nombre del modelo.

El problema que aborda es el ajuste fino de un modelo de código y razonamiento mediante LoRA sobre las proyecciones de atención, con el objetivo declarado de mejorar el rendimiento en tareas de programación, uso de herramientas y trabajo de seguridad autorizado. Sin embargo, el autor es explícito: se trata de un candidato piloto de tipo "public_bootstrap", no de una mejora demostrada sobre el modelo original. El entrenamiento cubre únicamente código y razonamiento, y las métricas publicadas son diagnósticos internos pequeños, no resultados de benchmarks estándar como SWE-bench o Cybench.

La relevancia de esta ficha es doble: por un lado, documenta un fine-tune experimental con licencia Apache 2.0 y formato GGUF listo para ejecución local; por otro, sirve de advertencia sobre la necesidad de validar cuidadosamente este tipo de publicaciones candidatas antes de usarlas en producción. El repositorio ocupa 48,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer, según el modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking |
| Parametros totales | 12.149.923.072 (12,15 B) |
| Parametros activos | 2.500 millones (según nomenclatura A2.5B del modelo base; no verificado en la información disponible) |
| Longitud de contexto | No disponible (el autor menciona que no se valida un contexto de 128K) |
| Tipos de cuantizacion | GGUF: Q4_K_M recomendado; Q3 y Q2 experimentales |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde pesos fusionados BF16) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE (mezcla de expertos) de 12,15 mil millones de parámetros totales con aproximadamente 2.500 millones de parámetros activos, según la convención de nombres del modelo original de JetBrains. El fine-tune se realizó con la base congelada en BF16 y LoRA únicamente sobre las proyecciones de atención (q, k, v, o), con rango 16, alpha 32, dropout 0,05, tasa de aprendizaje 2e-05, límite de secuencia de 4096 tokens, microbatch 1 y acumulación de gradiente 16. No hubo entrenamiento de router ni de expertos, ni tampoco RL. La pérdida se aplica solo a los objetivos completos del asistente, y los problemas y proyectos relacionados comparten partición para evitar fugas de datos.

El entrenamiento completó 963 pasos de optimizador, con 4.633.250 tokens supervisados y 7.988.330 tokens de entrada procesados. Los datasets utilizados son nvidia/OpenCodeInstruct y nvidia/OpenCodeReasoning. Las métricas publicadas son diagnósticos internos: NLL de validación de la base 0,665589 frente a 0,430868 del candidato, y 2 de 3 sondas superadas tanto en la base como en el candidato. El autor advierte que estas sondas no establecen capacidad real de código, razonamiento ni ciberseguridad. Los pesos MTP, si existen en el origen, no se adaptaron y quedan excluidos del export GGUF.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa de Mellum.
- Razonamiento y código: el fine-tune se entrenó específicamente sobre instrucciones y razonamiento de código.
- Uso de herramientas (tool calling): el modelo está etiquetado con `tool-use` y requiere un runtime que soporte y parsee llamadas a herramientas y razonamiento.
- Razonamiento multi-paso: el modelo base es de tipo "Thinking", con modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de seguridad autorizada: mencionadas en el plan completo de entrenamiento, pero no validadas en este piloto.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistencia a la programación en local: el modelo puede generar y explicar código en entornos de desarrollo integrados que soporten GGUF, aprovechando su naturaleza de fine-tune sobre instrucciones de código. Adecuado para equipos con hardware de gama media gracias a la cuantización Q4_K_M.
- Razonamiento sobre fragmentos de código: dado su modo "Thinking", puede emplearse para analizar errores, proponer refactorizaciones y razonar sobre dependencias en un repositorio, siempre con verificación humana del resultado.
- Integración en pipelines de agentes con tool calling: su etiqueta `tool-use` y la compatibilidad con endpoints permiten conectarlo a frameworks de agentes que ejecuten herramientas, aunque requiere un runtime que parsee correctamente las llamadas.
- Prototipado de asistentes de código en estaciones de trabajo con GPU de consumo: con Q4_K_M cabe en una GPU de 12 GB como la RX 6700 XT citada por el autor, lo que facilita pruebas locales sin infraestructura en la nube.
- Evaluación comparativa de fine-tunes: útil como candidato de referencia en experimentos internos que midan si un ajuste LoRA de atención mejora la NLL de validación frente a la base.
- Formación y experimentación: sirve para estudiar el efecto de LoRA sobre proyecciones de atención en modelos MoE, dado que el autor publica manifiestos de ejecución y cuantización.
- Tareas de seguridad en entornos aislados y autorizados: el plan completo contempla trabajo de seguridad, pero este piloto no lo valida; solo debe usarse con verificación estricta y en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench, Cybench) en la información disponible. El autor solo reporta diagnósticos internos:

| Metrica | Base | Candidato |
|---|---|---|
| NLL de validación | 0,665589 | 0,430868 |
| Sondas superadas | 2/3 | 2/3 |

Estos valores no constituyen una evaluación de capacidad y no deben interpretarse como mejora demostrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor recomienda empezar con Q4_K_M en una GPU de 12 GB (RX 6700 XT), ajustando contexto y offload según el uso medido de memoria.
- GPU recomendadas: no disponibles; el único dato concreto es la RX 6700 XT de 12 GB para Q4_K_M.
- GPU de consumo: sí, Q4_K_M cabe en 12 GB; las variantes Q3 y Q2 son experimentales y pueden degradar el formato y la fiabilidad del razonamiento.
- Opciones de despliegue: runtimes que soporten GGUF y la plantilla de chat de Mellum, con parseo de tool calls y razonamiento (el autor menciona LM Studio, sin validación explícita). No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mellum2.1-CodeReasoning-Public-v1-GGUF | 12,15 B totales / 2,5 B activos | No disponible | Apache 2.0 | GGUF | Fine-tune candidato, sin benchmarks estándar |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12,15 B totales / 2,5 B activos | No disponible | No disponible en esta ficha | BF16 | Modelo base original; referencia directa |
| Alternativas de código de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- El autor declara explícitamente que es un candidato y no una mejora demostrada sobre el modelo original.
- Los diagnósticos publicados (NLL y 2/3 sondas) no establecen capacidad de código, razonamiento ni ciberseguridad.
- No se ha validado un contexto de 128K ni la integración real con LM Studio o tool calling en equipos de usuario.
- Las cuantizaciones Q3 y Q2 son experimentales y pueden degradar el formato y la fiabilidad del razonamiento.
- Los pesos MTP no se adaptaron y quedan excluidos del export GGUF.
- Riesgo de alucinación inherente a los modelos de lenguaje; el código generado debe verificarse siempre.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los términos de los datasets de origen y la licencia del modelo base.
- Las evaluaciones de seguridad deben realizarse en entornos autorizados y aislados, verificando hallazgos y código generado.
- El repositorio no incluye datos de entrenamiento ni credenciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nullmega/Mellum2.1-CodeReasoning-Public-v1-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
