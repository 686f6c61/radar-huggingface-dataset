# Polydim-Einsof/deepseek-v4-distill-pmtp

## Resumen

deepseek-v4-distill-pmtp es un adaptador publicado por Polydim-Einsof (Ariel García Traba, iniciativa de investigación independiente POLYDIM-EINSOF) sobre el modelo base `deepseek-ai/DeepSeek-V4-Distill-32B`. Se presenta como un adaptador geométrico basado en la variedad de Stiefel, con una proyección de subespacio principal de dimensión 5120 a 2048, orientado a la auditoría de pruebas formales y a la demostración de teoremas en entornos MoE. El repositorio, creado el 2 de noviembre de 2026, no contiene pesos publicados (tamaño de 0,0 GB) y no registra descargas ni interacciones.

La relevancia del proyecto es fundamentalmente metodológica: propone un mecanismo de adaptación (PMTP, con "Zero-Worm Protocol") que transfiere estado de pensamiento entre procesos mediante un bus de memoria compartida en C++20/Rust 2024 con aritmética IEEE-754 de doble precisión, evitando la serialización intermedia en JSON o Markdown. Integra 1.740 teoremas formales almacenados en PostgreSQL 16 mediante la extensión `polydim_vec_db`.

No obstante, la información verificable es muy limitada: no se especifican parámetros, contexto, idiomas ni resultados de evaluación, y el repositorio no contiene artefactos de pesos. Cualquier evaluación práctica del modelo debe realizarse, por tanto, sobre el modelo base declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer (modelo base DeepSeek-V4-Distill-32B); proyección geométrica en variedad de Stiefel St(5120, 2048) sobre S^2047 |
| Parametros totales | no disponible (el nombre del modelo base sugiere 32B, no confirmado en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (DeepSeek Open Model License, según la model card) |
| Formato de pesos | safetensors (etiqueta del repositorio); repositorio sin pesos publicados (0,0 GB) |

## Arquitectura y entrenamiento

La model card describe un adaptador geométrico que proyecta el espacio de representación del modelo base desde una dimensión de modelo de 5120 hasta una dimensión canónica de 2048, mediante un subespacio principal en la variedad de Stiefel. El defecto de ortogonalidad reportado es de 4,83e-09, calculado con un acumulador Neumaier en FP64. El adaptador integra 1.740 teoremas formales extraídos de una base de datos PostgreSQL 16 (`polydim_vec_db`) y define un "Zero-Worm Protocol" para la transferencia continua de estado de pensamiento entre procesos a través de un identificador de slab (`SLAB_ID`), sin serialización intermedia en JSON o Markdown.

El contrato de implementación ("Silicon Contract") exige C++20, Rust 2024, instrucciones AVX2 y un bus de memoria compartida (`PmtpShmBus`) con aritmética IEEE-754 FP64. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el procedimiento de destilación del modelo base ni la naturaleza exacta del ajuste que produce el adaptador.

## Capacidades

- Auditoría de pruebas formales: el adaptador declara estar especializado en la verificación de demostraciones matemáticas formales, apoyándose en los 1.740 teoremas integrados.
- Demostración de teoremas en contexto MoE: la model card lo describe como "MoE Theorem Prover", aunque no se detalla el mecanismo de integración con el enrutamiento del modelo base.
- Transferencia de estado de pensamiento entre procesos: el protocolo Zero-Worm permite pasar contexto de razonamiento entre procesos sin serialización intermedia.
- Generación de texto y razonamiento: heredados del modelo base DeepSeek-V4-Distill-32B, sin confirmación explícita en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el rol declarado de auditor de pruebas implica cadenas de razonamiento largas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Verificación de pruebas matemáticas formales: el adaptador puede emplearse para comprobar la validez de demostraciones en asistentes de pruebas (Lean, Coq, Isabelle), usando los teoremas indexados en `polydim_vec_db` como base de referencia y el subespacio canónico de 2048 dimensiones para comparar representaciones semánticas.
- Auditoría de pipelines de verificación formal en producción: la integración con PostgreSQL 16 permite consultar teoremas y lemas desde un servicio persistente, lo que facilita auditar cambios en bases de código formalizadas antes de su despliegue.
- Transferencia de contexto entre agentes de razonamiento: el protocolo Zero-Worm y el bus de memoria compartida permiten pasar estado de pensamiento entre procesos sin coste de serialización, útil en arquitecturas multi-agente que encadenan demostraciones parciales.
- Investigación en adaptación geométrica de modelos: el adaptador sirve como banco de pruebas para estudiar proyecciones sobre variedades de Stiefel y su efecto en la estabilidad numérica del ajuste fino, dado el defecto de ortogonalidad reportado en FP64.
- Integración en entornos de alto rendimiento: el contrato C++20/Rust 2024 con AVX2 permite incrustar el adaptador en servicios nativos de baja latencia que ya operan con memoria compartida, sin depender de runtimes de Python.
- Reproducción de experimentos de destilación: al declarar un modelo base concreto, el repositorio facilita comparar el comportamiento del adaptador frente al modelo original en tareas de razonamiento formal, siempre que se obtengan los pesos (no publicados en el repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no contiene pesos (0,0 GB), por lo que no puede estimarse a partir de los artefactos publicados.
- GPU recomendadas: no disponible. Si se confirma el tamaño de 32B del modelo base, serían necesarias GPU de clase A100 80 GB o H100 para FP16/BF16, o configuraciones multi-GPU.
- Cabe en GPU de consumo: no disponible. Un modelo de 32B en cuantización de 4 bits requeriría aproximadamente 16-20 GB de VRAM, lo que quedaría al límite de una RTX 4090 (24 GB); sin pesos publicados no puede confirmarse.
- Opciones de despliegue: la model card menciona la etiqueta de Ollama `deepseek-v4:distill`. No se confirma soporte para vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| deepseek-v4-distill-pmtp | no disponible (base declarada de 32B) | no disponible | other (DeepSeek Open Model License) | No publicados (repo de 0,0 GB) |
| deepseek-ai/DeepSeek-V4-Distill-32B (modelo base) | no disponible en la información | no disponible | no disponible | No confirmada en la información |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas de la misma categoría (adaptadores de verificación formal o modelos de 32B orientados a matemáticas).

## Limitaciones y advertencias

- El repositorio no contiene pesos: el tamaño de 0,0 GB indica que no hay artefactos descargables, por lo que el modelo no es utilizable tal cual desde Hugging Face.
- Ausencia total de datos de evaluación: no hay benchmarks, métricas de pérdida ni comparaciones con el modelo base.
- La model card mezcla especificaciones de infraestructura (bus de memoria compartida, PostgreSQL, C++20/Rust) con especificaciones del modelo, sin aclarar qué parte corresponde a pesos entrenados y qué parte a software de acompañamiento.
- Riesgo de alucinación: no evaluado. En tareas de verificación formal, una alucinación puede producir una validación incorrecta de una prueba, con consecuencias graves.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: la licencia es "other" (DeepSeek Open Model License). Debe revisarse el texto completo de dicha licencia antes de cualquier uso comercial, especialmente en lo relativo a atribución y restricciones de uso.
- Falta de trazabilidad del ajuste: no se describe el dataset, el procedimiento de entrenamiento ni la metodología de destilación, lo que impide reproducir o auditar el adaptador.
- Madurez del proyecto: cero descargas y cero interacciones en el momento de la consulta; proyecto de investigación independiente sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Polydim-Einsof/deepseek-v4-distill-pmtp
- Repositorio GitHub del proyecto: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Distill-32B
