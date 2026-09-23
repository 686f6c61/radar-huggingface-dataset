# Gugu8/L-CED-15B

## Resumen

L-CED-15B es un modelo publicado en HuggingFace por el usuario Gugu8 bajo identificador `Gugu8/L-CED-15B`. Según su propia model card, se trata de un modelo de arquitectura novedosa orientada a "agentic coding", descrita como un encoder-decoder causal con decodificador en bucle (recurrent depth) y enrutamiento tipo mezcla de expertos, con 15.000 millones de parámetros totales y entre 2.000 y 3.500 millones activos por token, y una ventana de contexto declarada de 1 millón de tokens "por etapas".

La información disponible es extremadamente escasa: la model card apenas ocupa unas pocas líneas, remite a un fichero `ARCHITECTURE.md` que no se ha proporcionado y no incluye resultados de benchmarks, licencia, idiomas soportados ni formatos de pesos. El repositorio ocupa 36,5 GB y acumula 62 descargas y 0 likes en la fecha de consulta (metadatos fechados el 22 y el 23 de septiembre de 2026). No hay pipeline declarado.

Por tanto, esta ficha describe las afirmaciones del autor tal como aparecen, marcando explícitamente todo lo que no puede verificarse. No debe considerarse una evaluación independiente del modelo: no se ha confirmado que los pesos sean funcionales, que la arquitectura descrita exista tal cual ni que los objetivos de rendimiento declarados (SWE-bench, Terminal-Bench, DeepSWE) se hayan alcanzado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder con decodificador en bucle (recurrent depth) y enrutamiento MoE (Mixture-of-Recursions), según el autor; no verificable con la información disponible |
| Parámetros totales | 15B (dato declarado por el autor) |
| Parámetros activos | ~2-3,5B (dato declarado por el autor, rango no cerrado) |
| Longitud de contexto | 1M tokens "staged" (declarado, sin detalle de implementación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la ficha de HuggingFace no la especifica) |
| Formato de pesos | no disponible (el repositorio ocupa 36,5 GB, compatible con pesos en 16 bits, pero no se confirma el formato) |

## Arquitectura y entrenamiento

La model card describe una combinación de componentes con nombres propios que no se detallan en la información proporcionada: "DeepSeek V4.1-Flash CED + CSA2 + Engram + Single-Pass mHC + DSpark", además de un "decodificador en bucle" (recurente en profundidad) y un enrutamiento denominado "Mixture-of-Recursions". No hay especificación de si se trata de un transformer estándar modificado, de un híbrido con atención lineal o de un esquema de recurrencia sobre capas. El autor remite a un documento `ARCHITECTURE.md` que no forma parte de la información disponible, por lo que no es posible describir con rigor el mecanismo de atención, el número de capas, la dimensión oculta ni la composición exacta de los expertos.

Tampoco hay datos sobre el entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo fases de ajuste por instrucciones, RLHF, DPO u otras técnicas de alineamiento, ni si se aplicaron métodos de decodificación especulativa. Los términos "CED", "CSA2", "Engram", "mHC" y "DSpark" no están documentados en la información disponible y no corresponden a componentes de uso común identificables, por lo que no se puede confirmar su significado técnico.

## Capacidades

Todas las capacidades que se listan a continuación proceden de las afirmaciones del autor o de la orientación declarada del modelo, y no han podido verificarse:

- Generación de código y razonamiento orientado a tareas de ingeniería de software ("agentic coding").
- Ejecución de tareas multi-paso propias de agentes (resolución de issues, navegación de repositorios).
- Ventana de contexto declarada de 1M tokens, útil para codebases extensos, aunque sin detalles de cómo se gestiona la memoria.
- Enrutamiento MoE con pocos parámetros activos, lo que en teoría reduce el coste de inferencia por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito ("thinking mode"): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el enfoque declarado del modelo, pero deben considerarse hipotéticos hasta que existan pesos funcionales verificados y licencia conocida:

- Resolución automática de incidencias en repositorios: un agente podría leer el código del proyecto, localizar el fallo y proponer un parche, aprovechando la ventana de 1M tokens para mantener el contexto del repositorio. Es el escenario objetivo declarado (SWE-bench).
- Agente de terminal orientado a tareas de administración y scripting: interpretaría instrucciones en lenguaje natural y ejecutaría comandos de forma iterativa, con verificación del resultado en cada paso. Corresponde al objetivo declarado en Terminal-Bench.
- Refactorización de módulos extensos: con contexto largo, el modelo podría reescribir ficheros completos manteniendo coherencia entre dependencias internas.
- Revisión de código en pipelines de CI/CD: integrado como paso de revisión automática en pull requests para detectar errores, malas prácticas o problemas de seguridad.
- Generación de pruebas unitarias: a partir del código fuente y de la cobertura existente, producir tests que cubran rutas no ejercitadas.
- Migración de dependencias y actualización de frameworks: aplicar cambios repetitivos a lo largo de un repositorio siguiendo reglas de transformación.
- Documentación técnica automática: generar docstrings y documentación de API a partir del código y de su historial de cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona como objetivo "frontier reasoning per active param on SWE-bench / Terminal-Bench / DeepSWE", pero no incluye ninguna puntuación numérica, configuración de evaluación ni comparación con otros modelos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros declarado (15B) y de cálculos estándar de tamaño de pesos; no proceden de mediciones sobre el modelo:

- Pesos en BF16/FP16: aproximadamente 30 GB, más estados de activación y caché KV. Requiere GPU de 40-80 GB (A100 80 GB, H100 80 GB) para una ejecución holgada.
- Pesos en INT8: aproximadamente 15 GB. Cabe en una RTX 4090 (24 GB) con margen limitado para caché KV.
- Pesos en INT4: aproximadamente 7,5-8 GB. Cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080.
- Nota sobre MoE: aunque solo se activen 2-3,5B parámetros por token, en una implementación estándar todos los parámetros deben residir en memoria (o aplicarse offloading), por lo que el requisito de memoria viene marcado por los 15B totales, no por los activos.
- Nota sobre contexto: una ventana de 1M tokens implicaría una caché KV muy grande si se usa atención densa; la arquitectura declarada (en bucle, MoE) no permite estimar su coste real.
- Opciones de despliegue: no disponible. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama, ni la existencia de pesos en formato GGUF. Una arquitectura no estándar (decodificador recurrente, enrutamiento MoE específico) requeriría presumiblemente kernels personalizados y podría no ser soportada por los frameworks habituales sin adaptación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable. No se dispone de datos de rendimiento del modelo y los componentes de arquitectura referenciados (incluido "DeepSeek V4.1-Flash") no están documentados en la información proporcionada, por lo que no puede identificarse una familia de modelos realmente equivalente.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gugu8/L-CED-15B | 15B totales, ~2-3,5B activos (declarado) | 1M (declarado, "staged") | no disponible | no disponible | Repositorio HuggingFace, 62 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Model card mínima: no incluye datos de entrenamiento, evaluación, licencia, idiomas ni formato de pesos. La evaluación de idoneidad para producción es imposible con esta información.
- Afirmaciones no verificadas: la arquitectura descrita y los objetivos de rendimiento son declaraciones del autor sin evidencia publicada. Los nombres de componentes técnicos no están documentados y no pueden comprobarse.
- Licencia indefinida: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribución. Cualquier uso en producción queda sujeto a aclaración previa con el autor.
- Riesgo de alucinación: no evaluado; no hay datos de fiabilidad ni de tasas de error.
- Adopción muy baja: 62 descargas y 0 likes, sin pipeline declarado, lo que indica ausencia de validación por parte de la comunidad.
- Sin datos de sesgo ni de comportamiento multilingüe.
- Posible incompatibilidad con toolchains estándar: si la arquitectura es tan singular como se describe, es probable que requiera código de inferencia específico no incluido en los frameworks habituales.
- Fechas de los metadatos inusuales (creación el 22 de septiembre de 2026, actualización el 23 de septiembre de 2026), que conviene verificar antes de dar por buena la cronología del repositorio.
- El repositorio ocupa 36,5 GB, pero no se confirma que contenga pesos utilizables ni que el modelo sea cargable.

## Enlaces

- HuggingFace: https://huggingface.co/Gugu8/L-CED-15B
- `ARCHITECTURE.md`: referenciado en la model card, no disponible en la información proporcionada.
- Paper, blog, repositorio de código o demo: no disponibles.
