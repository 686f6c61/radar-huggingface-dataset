# open-athena/Marin-Snowball-67B-A2B-v0.1

## Resumen

Marin-Snowball-67B-A2B-v0.1 es un artefacto de investigación publicado por open-athena: un checkpoint de mezcla de expertos (MoE) de 67.078.882.816 parámetros totales, obtenido tras 14 actualizaciones de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre el modelo fusionado Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02. El entrenamiento emplea RLOO-N asíncrono con importance sampling truncado, un ritmo de aprendizaje de 4e-6 y 512 grupos de prompts aceptados por actualización, con 16 respuestas por grupo.

El dato principal que reporta el autor es una validación nativa de `eval/all/pass_at_1` del 50,22 % en el paso 14, frente al 41,21 % del inicializador. Sin embargo, el propio autor advierte de que no es el mejor checkpoint histórico —el máximo fue 50,33 % en el paso 12, eliminado por retención rotatoria— y de que la recompensa estructural retrocedió del 39,09 % al 32,92 % mientras la de NVIDIA subía del 40,59 % al 55,50 %. Las evaluaciones independientes de BFCL-Parity, SWE-bench Verified y OT-TBLite fallaron por errores de endpoint y timeouts, por lo que no hay resultados válidos de benchmarks estándar.

Su relevancia es, por tanto, la de un caso de estudio abierto sobre entrenamiento RLVR en modelos MoE, fusión de pesos DARE-TIES y regresión de dominio durante el ajuste. No debe presentarse como un modelo listo para producción: la model card lo describe explícitamente como «research artifact» no probado ni evaluado de forma adecuada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; etiqueta `grug_moe` |
| Parámetros totales | 67.078.882.816 (~67,1B) |
| Parámetros activos | No disponible de forma explícita; la nomenclatura «A2B» del nombre sugiere ~2B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 134,2 GB |
| Modelo base / inicializador | open-athena/Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02-2026.10.10, revisión `153f5369f69a0c0a7203779099ec94e98c66748f` |
| Pipeline declarado | reinforcement-learning |
| Identificador de ejecución | `2026.10.15.32` |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos etiquetada como `grug_moe`, con 67,1B parámetros totales y un subconjunto activo que la nomenclatura «A2B» sitúa alrededor de 2B. El checkpoint inicial no es un modelo preentrenado desde cero, sino una fusión de pesos DARE-TIES con tres padres: Grug-67B-A2B-Antidoom-RLVR1-Step12-2026.10.02 como base, Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 como especialista etiquetado NUPA y Grug-67B-A2B-Antidoom-RLVR1-Reference-KL-Step20-2026.10.04 como especialista BFCL. Sobre esa fusión se ejecutó un nuevo entrenamiento RL con optimizador fresco y `resume_mode: none`, sin reanudación de estado.

La fase RL utiliza RLOO-N asíncrono con importance sampling truncado. RLOO-N es un estimador de gradiente de política leave-one-out que trata los fallos de infraestructura enmascarados como neutros y los excluye de la línea base de recompensa. Se realizaron 14 actualizaciones con 512 grupos de prompts aceptados por actualización y 16 respuestas por grupo, con paralelismo tensorial 1, de pipeline 2 y de expertos 16 sobre 64 GPU H100, más 48 GPU dedicadas a inferencia. Los datos suman 69.487 tareas: 12.123 tareas NVIDIA Nemotron (calendario, código competitivo, Reasoning Gym y preguntas STEM de opción múltiple) y 57.364 tareas de cierre estructural. El conjunto usa `shuffle: false`, de modo que las filas NVIDIA preceden a las estructurales; el autor advierte que las proporciones de ficheros no describen cada lote del optimizador y que este checkpoint no debe representarse como una ejecución conjunta equilibrada.

El conjunto de validación nativo contiene 667 tareas NVIDIA y 243 tareas estructurales (910 en total). Cada tarea recibe una única respuesta muestreada. La métrica `eval/all/pass_at_1` usa veredictos explícitos del verificador cuando existen y, en su defecto, recompensa de resultado positiva, por lo que las tareas con crédito parcial pueden contar como aprobadas; los resultados ausentes o no puntuados permanecen en el denominador fijo. Es un conjunto de desarrollo inspeccionado repetidamente, no una evaluación final independiente.

## Capacidades

- Generación de texto y razonamiento general sobre una base MoE de 67,1B parámetros totales.
- Razonamiento STEM de opción múltiple: el entrenamiento incluye tareas STEM multiple-choice del conjunto NVIDIA Nemotron.
- Código competitivo: se incluyen tareas de competitive coding en el cohorte NVIDIA.
- Tareas de calendario: el cohorte NVIDIA incorpora tareas de calendar.
- Razonamiento estructurado tipo Reasoning Gym.
- Cierre estructural: completar sintaxis requerida, como llaves de JSON o delimitadores de llamadas a herramientas, preservando el contenido obligatorio.
- Tool calling / function calling: hay un padre especialista BFCL en la fusión y tareas de delimitadores de tool-call en el cohorte estructural, pero las evaluaciones BFCL-Parity fallaron y la capacidad no está validada por el autor.
- Capacidades de agente y razonamiento multi-paso: no evaluadas de forma independiente en la información disponible.
- Capacidades multilingües: no disponibles.
- Visión, audio o modo de razonamiento explícito (thinking mode): no documentados.

## Casos de uso

- Estudio de regresión de dominio en RLVR: comparar el paso 0 y el paso 14 sobre el mismo panel nativo permite analizar cómo la recompensa NVIDIA sube 14,91 puntos porcentuales mientras la estructural cae 6,17 puntos. Es adecuado porque el autor publica ambas medidas y la configuración de muestreo.
- Reproducción de RLOO-N asíncrono: el checkpoint incluye detalles de ritmo de aprendizaje, tamaño de grupo, número de respuestas y paralelismo, lo que sirve como referencia para experimentos de estimadores leave-one-out con importance sampling truncado.
- Investigación sobre fusión de pesos DARE-TIES: al derivar de una fusión con tres padres identificados y revisiones fijadas, permite estudiar la contribución de cada especialista antes y después del RL.
- Pruebas de cierre estructural en pipelines: el modelo fue entrenado con 57.364 tareas de cierre de sintaxis, por lo que puede emplearse en entornos de investigación para generar JSON o delimitadores de tool-call completos, siempre con validación posterior y sin asumir robustez en producción.
- Evaluación de razonamiento STEM y código competitivo: útil como sujeto de pruebas en bancos internos de preguntas STEM y problemas de programación, dado que el cohorte NVIDIA cubre ambos dominios.
- Experimentos de scheduling y calendario: las tareas de calendar del conjunto Nemotron permiten probar la capacidad de estructurar fechas y restricciones en un entorno controlado.
- Análisis de olvido catastrófico en modelos MoE: la discrepancia entre mejora NVIDIA y regresión estructural lo convierte en un caso concreto para estudiar estabilidad de especialistas durante RL.
- Docencia e investigación sobre artefactos RLVR: sirve para ilustrar por qué una métrica de validación de desarrollo, con crédito parcial y denominador fijo, no equivale a un benchmark independiente.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. Las únicas métricas reportadas son las de validación nativa del autor:

| Medida de validación nativa | Inicializador (paso 0) | Exportación del paso 14 |
|---|---:|---:|
| pass@1 combinado (%) | 41,21 | 50,22 |
| Recompensa media de resultado NVIDIA (%) | 40,59 | 55,50 |
| Recompensa media de resultado estructural (%) | 39,09 | 32,92 |

La recompensa media de resultado se define como la recompensa del verificador por tarea multiplicada por 100 y promediada sobre todo el cohorte, con las notas ausentes contabilizadas como cero; admite crédito parcial y no es la fracción de tareas completamente resueltas. El máximo histórico de `eval/all/pass_at_1` fue 50,33 % en el paso 12, pero ese checkpoint se eliminó antes de la exportación. Las evaluaciones inline de BFCL-Parity, SWE-bench Verified y OT-TBLite encontraron errores de endpoint y timeouts, por lo que no establecen un rendimiento válido.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 134 GB solo para los parámetros (67,08B × 2 bytes), coherente con un repositorio de 134,2 GB.
- VRAM estimada para inferencia en bf16: al menos 140-150 GB para pesos y overhead, y previsiblemente 160-180 GB con caché KV para contextos moderados; la longitud de contexto no está publicada, por lo que el KV cache no puede dimensionarse con precisión.
- GPU recomendadas: 8×H100 80GB u 8×H200 para despliegue cómodo; 4×A100 80GB (320 GB) es un mínimo razonable en bf16; 2×H100 80GB (160 GB) queda muy ajustado y depende de la longitud de contexto.
- Cuantización de 8 bits: alrededor de 67 GB de pesos, viable en 1×H100 80GB con poco margen para caché KV.
- Cuantización de 4 bits: alrededor de 34 GB de pesos, lo que exigiría al menos una GPU profesional de 48 GB o dos GPU de 24 GB con particionado; no se publican pesos cuantizados, por lo que habría que generarlos.
- GPU de consumo: no cabe en una sola RTX 4090 de 24 GB ni en bf16 ni en 8 bits; en 4 bits los pesos rondan los 34 GB y superan igualmente 24 GB, por lo que se necesitarían al menos dos GPU de consumo o una GPU profesional de mayor memoria.
- Opciones de despliegue: vLLM y SGLang son adecuados para MoE con paralelismo de expertos; TGI también es una opción. llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- Configuración de entrenamiento observada: 64 GPU H100 para política (TP 1, PP 2, EP 16) y 48 GPU adicionales para inferencia.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 2B parámetros activos, el coste computacional por token debería ser inferior al de un modelo denso de 67B, pero el peso completo debe residir en memoria y el rendimiento quedará limitado por el ancho de banda.

## Comparativa con modelos similares

No se dispone de datos de benchmarks independientes ni de especificaciones de contexto para establecer una comparación con modelos externos de la misma categoría. La comparación más fiable es con los checkpoints de la propia familia, todos ellos MoE de aproximadamente 67B:

| Modelo | Parámetros | Contexto | Licencia | Validación reportada | Disponibilidad |
|---|---:|---|---|---|---|
| Marin-Snowball-67B-A2B-v0.1 | ~67B (A2B) | No disponible | openmdw-1.1 | pass@1 nativo 50,22 % en el paso 14 | HuggingFace |
| Grug-67B-A2B-Merge-Campaign2-DARE-TIES-02 | ~67B (A2B) | No disponible | No disponible | pass@1 nativo 41,21 % como inicializador | HuggingFace, revisión fijada |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 | ~67B (A2B) | No disponible | No disponible | No disponible | HuggingFace, padre de la fusión |
| Grug-67B-A2B-Antidoom-RLVR1-Reference-KL-Step20-2026.10.04 | ~67B (A2B) | No disponible | No disponible | No disponible | HuggingFace, padre de la fusión |

Frente al inicializador, la exportación del paso 14 mejora 9,01 puntos en pass@1 combinado y 14,91 puntos en recompensa NVIDIA, pero pierde 6,17 puntos en recompensa estructural. No hay datos comparables de modelos densos de 70B ni de otros MoE de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; el uso en producción es responsabilidad del usuario.
- Sin benchmarks independientes válidos: BFCL-Parity, SWE-bench Verified y OT-TBLite fallaron por errores de endpoint y timeouts.
- Regresión estructural: la recompensa media est
