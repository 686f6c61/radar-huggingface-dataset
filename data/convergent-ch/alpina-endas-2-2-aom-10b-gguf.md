# Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF

## Resumen

Alpina Endas 2.2-AoM-10B es un repositorio experimental publicado por Convergent-ch que agrupa cinco modelos Qwen derivados y afinados de forma independiente, distribuidos en formato GGUF. No se trata de una red neuronal única fusionada, sino de una arquitectura de "ensemble" o "mixture of models" (de ahí la etiqueta AoM, *Assembly of Models*) compuesta por un planificador de clase 7B y cuatro especialistas de clase 0,8B. El total agregado declarado es de 10.625.188.608 parámetros (10,63B) sumando los cinco ficheros GGUF descargables.

El problema que aborda es la orquestación de tareas heterogéneas (enrutamiento, generación de código, revisión de código, matemáticas y lógica/ciencia) mediante modelos pequeños especializados en lugar de un único modelo grande. El miembro planificador, denominado *input-divisor*, se basa en Qwen2.5-7B-Instruct y los cuatro especialistas en Qwen3.5-0.8B. Cada miembro se ejecuta de forma independiente en Ollama; el repositorio no incluye lógica de orquestación ni aplicación de escritorio.

Es relevante ahora por su carácter experimental y por documentar un patrón de despliegue poco habitual: especialización con LoRA de bajo rango sobre modelos pequeños, cuantización mixta (Q4_K_M para el planificador, Q8_0 para los especialistas) y distribución en GGUF para consumo en hardware de gama media. El autor advierte explícitamente de que son especializaciones de datos pequeños y que la baja pérdida de validación en ejemplos derivados de plantillas no establece capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivados de Qwen2.5-7B-Instruct y Qwen3.5-0.8B); repositorio multi-modelo, no una red fusionada |
| Parametros totales | 10.625.188.608 (10,63B) sumando los cinco GGUF; 11.027.560.192 (11,03B) en los modelos fuente completos, incluyendo pesos de visión |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (input-divisor) y Q8_0 (cuatro especialistas) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con Modelfile para Ollama); adaptadores LoRA fusionados en BF16 antes de la exportación |

Desglose por miembro:

| Miembro | Parametros | Precision | Tamano |
|---|---:|---|---:|
| input-divisor (planificador) | 7.615.616.512 | Q4_K_M | 4,68 GB |
| coder_builder | 752.393.024 | Q8_0 | 0,81 GB |
| coder_reviewer | 752.393.024 | Q8_0 | 0,81 GB |
| math | 752.393.024 | Q8_0 | 0,81 GB |
| logic_science | 752.393.024 | Q8_0 | 0,81 GB |
| Total AoM | 10.625.188.608 | mixta | ~7,93 GB |

## Arquitectura y entrenamiento

Cada miembro es un transformer denso derivado de un modelo base de Qwen. El input-divisor se adaptó con NF4 QLoRA de rango 8 sobre Qwen2.5-7B-Instruct. Los cuatro especialistas se adaptaron con LoRA BF16 de rango 16 sobre Qwen3.5-0.8B. En todos los casos los adaptadores se fusionaron en los pesos BF16 originales antes de generar los GGUF. Los GGUFs de los especialistas son solo texto: el torreón de visión de los modelos pequeños se omite, aunque los pesos fuente completos entrenados se conservan localmente. Todo el entrenamiento se realizó en una única RTX 3060 Ti.

Los datos de entrenamiento son acotados y en buena parte sintéticos. El input-divisor se entrenó con patrones de enrutamiento sintéticos y acotados. El revisor de código con un conjunto pequeño de patrones de bugs sintéticos. El generador de código con el subconjunto self-oss-instruct de HuggingFaceTB/smoltalk y ejemplos previamente preparados de bigcode/self-oss-instruct-sc2-exec-filter-50k. El especialista de matemáticas con ejemplos de entrenamiento de GSM8K. El de lógica y ciencia con ejemplos de entrenamiento de ARC y tareas deductivas sintéticas. No se documenta el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation, tag conversational).
- Enrutamiento y planificación de entrada mediante el miembro input-divisor, entrenado sobre patrones sintéticos de división de tareas.
- Generación de código en el miembro coder_builder, a partir de datos self-oss-instruct.
- Revisión de código en el miembro coder_reviewer, orientada a un conjunto pequeño de patrones de bugs sintéticos.
- Razonamiento matemático en el miembro math, ajustado con ejemplos de GSM8K.
- Razonamiento lógico y científico en el miembro logic_science, ajustado con ARC y tareas deductivas sintéticas.
- Compatibilidad con endpoints (tag endpoints_compatible) y ejecución individual en Ollama mediante Modelfile.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en los GGUFs publicados.

## Casos de uso

- Enrutamiento de consultas en un pipeline propio: el input-divisor puede clasificar y dividir una petición de entrada entre los cuatro especialistas; el desarrollador debe implementar la orquestación, ya que el repositorio solo contiene pesos y metadatos.
- Asistencia a la generación de código en local: coder_builder, con 0,81 GB en Q8_0, cabe en GPUs de consumo y sirve para autocompletar o redactar fragmentos en flujos de desarrollo con requisitos de privacidad.
- Revisión estática asistida: coder_reviewer puede señalar patrones de bugs conocidos en un diff antes de un commit; el autor advierte de que puede dar críticas irrelevantes o incorrectas y de que el código no se ejecuta ni se prueba automáticamente.
- Práctica de problemas matemáticos de nivel GSM8K: el miembro math se ajustó específicamente con ejemplos de ese conjunto, por lo que es adecuado para demostraciones educativas acotadas, no para matemáticas avanzadas.
- Preguntas de lógica y ciencia de nivel ARC: logic_science puede responder cuestiones de opción múltiple o deductivas sencillas; el autor advierte de que las respuestas científicas pueden ser inexactas.
- Despliegue en hardware modesto para experimentación: los cuatro especialistas Q8_0 de 0,81 GB permiten probar el patrón de especialización en una sola GPU de consumo, e incluso el planificador Q4_K_M de 4,68 GB cabe en GPUs de 8 GB.
- Estudio de técnicas de especialización con LoRA de bajo rango: el repositorio documenta rangos (8 y 16), cuantizaciones y bases, lo que lo hace útil como referencia metodológica reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la baja pérdida de validación en ejemplos derivados de plantillas no establece capacidad general ni mejoras amplias en benchmarks.

## Requisitos de hardware

- VRAM estimada para el planificador (input-divisor, Q4_K_M, 4,68 GB): en torno a 5-6 GB de VRAM para inferencia con contexto moderado.
- VRAM estimada para cada especialista (Q8_0, 0,81 GB): en torno a 1-1,5 GB de VRAM por miembro.
- Para ejecutar los cinco miembros simultáneamente se necesitan aproximadamente 9-10 GB de VRAM en total, más el overhead de contexto de cada proceso.
- GPU recomendadas: RTX 3060 Ti (hardware usado por el autor para el entrenamiento), RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí; el planificador en GPUs de 8 GB y los especialistas en GPUs de 4 GB o incluso CPU con llama.cpp.
- Opciones de despliegue: Ollama (soporte documentado con Modelfile), llama.cpp y cualquier runtime compatible con GGUF. No se documenta soporte específico de vLLM o TGI para estos ficheros.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alpina Endas 2.2-AoM-10B | 10,63B agregados (5 miembros) | no disponible | Apache 2.0 | GGUF | Multi-modelo experimental; requiere orquestación externa |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (según ficha oficial del modelo base) | Apache 2.0 | safetensors, GGUF | Modelo único generalista; base del planificador |
| Qwen3.5-0.8B | 0,8B | no disponible en la información proporcionada | Apache 2.0 | safetensors, GGUF | Modelo único pequeño; base de los especialistas |
| Especialistas individuales del repo | 0,75B cada uno | no disponible | Apache 2.0 | GGUF | Especialización acotada con datos sintéticos; sin benchmarks publicados |

La comparación directa con modelos únicos de 7B u 8B no es equivalente: el repositorio AoM suma capacidades de cinco redes separadas y no ofrece un rendimiento agregado medido. Frente a Qwen2.5-7B-Instruct, el planificador añade enrutamiento sintético pero no mejora la capacidad general del modelo base. Frente a los especialistas individuales de 0,8B, cada miembro está afinado para una tarea concreta con datos pequeños.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta como tal y advierte de que las especializaciones se basan en datos pequeños.
- No es una red fusionada: el total de 10,63B suma cinco modelos separados; no existe un único grafo computacional que los integre.
- El repositorio no incluye aplicación de escritorio, entrada de inicio, instalador ni lógica de orquestación de grupo; solo pesos y metadatos.
- Ollama estándar no instala orquestación de chat grupal al importar estos ficheros; cada miembro se ejecuta por separado.
- El revisor de código puede producir críticas irrelevantes o incorrectas; el código generado no se ejecuta ni se prueba automáticamente.
- Las respuestas científicas del miembro logic_science pueden ser inexactas.
- La baja pérdida de validación en ejemplos derivados de plantillas no implica capacidad general ni mejoras en benchmarks amplios.
- Idiomas: solo inglés documentado; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto: no documentada en la información disponible.
- La torre de visión de los modelos pequeños se omite en los GGUFs de texto; no hay capacidades multimodales en los ficheros publicados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- Sesgos conocidos: no documentados específicamente; hereda los sesgos de los modelos base Qwen y de los conjuntos de datos sintéticos y de instrucciones utilizados.
- Riesgo de alucinación: presente, como en cualquier modelo de lenguaje; agravado por el ajuste con datos sintéticos acotados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF
- Página principal del modelo: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B
- Modelo base del planificador: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base de los especialistas: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fichero input-divisor Q4_K_M: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF/resolve/main/input-divisor-Q4_K_M.gguf
- Fichero coder_builder Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF/resolve/main/coder_builder-Q8_0.gguf
- Fichero coder_reviewer Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF/resolve/main/coder_reviewer-Q8_0.gguf
- Fichero math Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF/resolve/main/math-Q8_0.gguf
- Fichero logic_science Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF/resolve/main/logic_science-Q8_0.gguf
- Dataset smoltalk (self-oss-instruct): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
