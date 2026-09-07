# DangerLabs/HuMe

## Resumen

HuMe es un modelo de lenguaje pequeño (SLM) de 250 millones de parámetros desarrollado por Danger Labs Inc., con autoría de Jerrick Davis. Su arquitectura combina un decoder Transformer de doble flujo, integrando un LM generativo (System 1) y una cabeza predictiva JEPA (System 2), sobre un espacio latente de producto que acopla una representación euclidiana con una bola de Poincaré de curvatura c=1.0. El modelo está diseñado como agente autónomo de propósito general, con memoria multi-turno y herramientas integradas en un entorno sandbox. Su relevancia se centra en explorar arquitecturas híbridas neuromórficas y predictivas para agentes compactos, aunque los benchmarks declarados son bajos y no están verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder Transformer de doble flujo con System 1 (LM generativo) y System 2 (cabeza predictiva JEPA) |
| Parámetros totales | 250 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo se basa en un decoder Transformer de doble flujo. La rama System 1 actúa como un modelo generativo de lenguaje estándar, mientras que la rama System 2 implementa una cabeza predictiva basada en JEPA (Joint Embedding Predictive Architecture) que opera sobre un espacio latente de producto. Este espacio combina una métrica euclidiana con una bola de Poincaré de curvatura c=1.0, lo que permite representar relaciones jerárquicas y estructuras hiperbólicas. No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, según el pipeline de HuggingFace.
- Operación como agente autónomo de propósito general con memoria multi-turno.
- Integración de herramientas en un entorno sandbox, como se indica en la documentación del autor.
- Razonamiento predictivo mediante la cabeza JEPA (System 2), orientada a modelar dinámicas de mundo.
- Representación de conocimiento en espacios de producto (euclidiano + Poincaré), útil para jerarquías.
- Evaluación de alineación y contención mediante la suite AST-JEPA, con resultados declarados de 13/13 en integridad de contención.

## Casos de uso

- Asistente conversacional ligero en Android: con 250M de parámetros, el modelo puede ejecutarse en dispositivos móviles de gama media y gestionar diálogos multi-turno con memoria.
- Agente de línea de comandos para desarrollo: el comando `python hume_cli.py --chat --inspect` permite interactuar con el modelo como agente autónomo, útil para automatizar tareas de scripting y pruebas.
- Auditoría de alineación en sistemas de agentes: el resultado declarado de 100% en containment integrity en la suite AST-JEPA permite usar el modelo como referencia en evaluaciones de riesgo de alineación.
- Análisis estático de código: el tag `compiler-verified` sugiere aplicaciones en verificación de árboles de sintaxis abstracta (AST) y validación de compilación.
- Representación jerárquica de conocimiento: el uso de la bola de Poincaré permite modelar ontologías y taxonomías con relaciones jerárquicas, adecuado para sistemas de gestión de conocimiento.
- Pruebas de límites en sandbox: la suite AST-JEPA evalúa vectores como path traversal y escalada de permisos; el modelo puede utilizarse como herramienta de prueba de estrés en entornos aislados.

## Benchmarks y rendimiento

| Benchmark | Configuración | Métrica | Resultado |
|---|---|---|---|
| ARC-Challenge | test | Accuracy | 24.0% |
| MMLU (high_school_mathematics) | test | Accuracy | 16.0% |
| AST-JEPA 13-Benchmark (full_suite) | stress_test | Containment Integrity | 100.0% |

Los resultados son declarados por el autor (Danger Labs) y no están verificados de forma independiente (verified: false en el model-index). La model card incluye además un benchmark de velocidad de inferencia en GSM8K de 0.8 q/s y una precisión geométrica de 96.9% en AOSP-AST, sin más detalles metodológicos.

## Requisitos de hardware

No se han proporcionado requisitos de hardware oficiales en la información disponible. De forma orientativa, un modelo de 250M parámetros puede ocupar aproximadamente 500 MB en FP16, 250 MB en cuantización de 8 bits y 125 MB en cuantización de 4 bits. Esto permitiría su ejecución en una GPU de consumo con al menos 1-2 GB de VRAM, dependiendo de la cuantización y de la longitud de contexto. El repositorio tiene un tamaño de 1.0 GB. No se especifica compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `transformers`.

## Comparativa con modelos similares

No disponible. No se han proporcionado comparativas con otros modelos en la información disponible.

## Limitaciones y advertencias

- Los resultados en ARC-Challenge (24.0%) y MMLU (16.0%) son muy bajos en comparación con modelos SLM modernos, lo que indica un rendimiento limitado en tareas de razonamiento y conocimiento general.
- Los benchmarks están marcados como no verificados de forma independiente, por lo que deben interpretarse con cautela.
- No se detalla el proceso de entrenamiento, los datos utilizados ni las técnicas de alineación, lo que limita la confianza en las capacidades declaradas.
- El modelo solo soporta inglés, lo que restringe su uso en entornos multilingües.
- La fecha de creación del repositorio en HuggingFace es 2026-09-07, posterior a la fecha actual del entorno; esto puede indicar un error en los metadatos.
- Al ser un modelo de 250M con benchmarks bajos, es probable que presente alucinaciones frecuentes y una capacidad limitada para tareas complejas.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de seguridad ni de alineación más allá de las pruebas declaradas por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/DangerLabs/HuMe

No se han encontrado otros enlaces relevantes en la búsqueda web. Los resultados de búsqueda corresponden a un modelo homónimo "Hume" de visión-lenguaje-acción, no relacionado con este modelo.
