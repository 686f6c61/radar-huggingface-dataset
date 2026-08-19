# frankmorales2020/gemma-4-e4b-13tasks-topo-2026-certified

## Resumen

El modelo `frankmorales2020/gemma-4-e4b-13tasks-topo-2026-certified` es un clasificador de imágenes construido sobre la arquitectura Gemma-4 E4B (Vision Transformer con Per-Layer Embeddings, PLE), cuantizado a 4-bit NormalFloat (NF4) mediante Unsloth. El autor, Frank Morales Aguilera, lo presenta como un sistema de aprendizaje continuo que ha sido entrenado secuencialmente en 13 tareas de clasificación binaria sobre el dataset STL-10, afirmando haber logrado cero olvido catastrófico gracias a la inyección de un «Topological Governor» que ancla filas de embeddings en los primeros seis números primos.

El modelo reclama haber alcanzado una «singularidad estrecha» (narrow singularity) bajo un marco de certificación propio, con una precisión del 100 % en la última tarea. Sin embargo, estas afirmaciones carecen de validación independiente y deben tratarse con escepticismo. El repositorio contiene únicamente los pesos de las cabezas de clasificación entrenadas (archivo `.pt`), no el modelo base completo, por lo que su uso requiere descargar también el modelo base `frankmorales2020/gemma-4-e4b-unesco-optimized`.

Relevancia: el proyecto explora técnicas de aprendizaje continuo y mitigación del olvido catastrófico, pero su valor práctico es limitado debido a la falta de documentación técnica detallada y a la naturaleza controvertida de las afirmaciones sobre AGI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer + Per-Layer Embeddings (PLE) de Gemma-4 E4B, con 13 cabezas de clasificación secuenciales |
| Parametros totales | no disponible (se infiere ~4B por el nombre "E4B", sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | NF4 (4-bit NormalFloat) |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de texto declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (archivo `topo_trained_13tasks_gemma.pt`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4 E4B, un modelo de visión-lenguaje de Google con arquitectura de Vision Transformer y capas de embeddings por capa (PLE). El autor lo cuantiza a 4-bit NF4 y posteriormente inyecta un «Topological Governor», que consiste en congelar seis filas de la tabla de embeddings ancladas a los primos {2, 3, 5, 7, 11, 13}. Según la descripción, esto impide que las actualizaciones de gradiente de nuevas tareas sobrescriban conocimiento previo, garantizando matemáticamente la ausencia de olvido catastrófico.

El entrenamiento se realizó sobre el dataset STL-10, con un protocolo de 5 ejecuciones (seeds y learning rates variables) y una semilla determinista fijada en 123. Se definieron 13 tareas de clasificación binaria (por ejemplo, animal vs vehículo, natural vs artificial, etc.) y se entrenaron cabezas de clasificación secuencialmente. El autor reporta un overhead de memoria constante de 48 KB para el gobernador topológico. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de imágenes en 13 tareas binarias específicas definidas sobre STL-10 (animal vs vehículo, natural vs artificial, vivo vs no vivo, grande vs pequeño, terrestre vs aire/agua, doméstico vs salvaje, mamífero vs no mamífero, volador vs no volador, rápido vs lento, urbano vs rural, depredador vs presa, nocturno vs diurno, domesticado vs salvaje).
- Aprendizaje continuo sin olvido catastrófico (según el autor, con precisión media superior al 99 % en las 13 tareas).
- Inferencia con enrutamiento explícito a través de una de las 13 cabezas de clasificación (`task_0` a `task_12`).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo sirve como banco de pruebas para estudiar técnicas de mitigación del olvido catastrófico en clasificación de imágenes, aunque su diseño con cabezas fijas limita la generalización a otros dominios.
- Clasificación binaria especializada en entornos con restricciones de memoria: gracias a la cuantización NF4, el modelo ocupa 2.64 GB y puede ejecutarse en GPUs de gama media, lo que lo hace adecuado para prototipos en edge computing.
- Demostración de técnicas de anclaje de embeddings: el enfoque del Topological Governor podría inspirar a otros investigadores interesados en regularización topológica, aunque no hay evidencia de que sea superior a métodos establecidos como EWC o replay.
- Auditoría de metodologías de certificación: el repositorio incluye un archivo JSON de certificación (`topo_certification_13tasks.json`) que podría usarse para analizar cómo se estructuran las afirmaciones de rendimiento en proyectos de IA no convencionales.
- Educación sobre sesgos en benchmarks: el uso de STL-10 y la definición arbitraria de tareas binarias pueden servir para discutir la validez de métricas de precisión en escenarios controlados.
- Evaluación de reproducibilidad: dado que el autor declara un protocolo determinista, el modelo puede utilizarse para verificar si los resultados son reproducibles en otras configuraciones de hardware.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la precisión media de 5 ejecuciones en cada una de las 13 tareas sobre STL-10. No se han reportado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, etc.) porque el modelo no es generativo.

| Tarea | Descripcion | Precision media |
|---|---|---|
| A | Animal vs Vehiculo | 99.48 % |
| B | Natural vs Artificial | 100.00 % |
| C | Vivo vs No vivo | 99.08 % |
| D | Grande vs Pequeno | 100.00 % |
| E | Terrestre vs Aire/Agua | 100.00 % |
| F | Domestico vs Salvaje | 97.96 % |
| G | Mamifero vs No mamifero | 100.00 % |
| H | Volador vs No volador | 100.00 % |
| I | Rapido vs Lento | 100.00 % |
| J | Urbano vs Rural | 100.00 % |
| K | Depredador vs Presa | 100.00 % |
| L | Nocturno vs Diurno | 100.00 % |
| M | Domesticado vs Salvaje | 100.00 % |

Estos valores son afirmaciones del autor y no han sido verificados de forma independiente. Además, las tareas son binarias y están definidas sobre un dataset pequeño, por lo que no son comparables con benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada: 2.64 GB para el modelo cuantizado (NF4), más el overhead del modelo base y las cabezas de clasificación. En la práctica, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), también compatible con RTX 3060, RTX 4060, A10, etc. Cabe en GPUs de consumo con 8 GB o más.
- Despliegue: el modelo se distribuye como un state_dict de PyTorch, por lo que requiere un script personalizado para cargar el modelo base y las cabezas. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia es trivial para un clasificador de imágenes, pero depende del tamaño del modelo base (no especificado).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo es un clasificador de imágenes con cabezas específicas para 13 tareas, no un modelo generativo estándar. Alternativas como CLIP o modelos de clasificación fine-tuning tradicionales no son directamente comparables por la naturaleza del entrenamiento secuencial y las afirmaciones de aprendizaje continuo. Se indica "no disponible".

## Limitaciones y advertencias

- Las afirmaciones sobre AGI, «singularidad estrecha» y «apertura de la puerta AGI» carecen de fundamento científico y no están respaldadas por publicaciones revisadas por pares. Deben interpretarse como reivindicaciones del autor, no como hechos verificados.
- Los resultados de precisión son sobre STL-10, un dataset pequeño y con clases solapadas; no son representativos de tareas del mundo real.
- El repositorio solo contiene los pesos de las cabezas de clasificación, no el modelo base completo. Para reproducir la inferencia es necesario descargar también `frankmorales2020/gemma-4-e4b-unesco-optimized`, que no se ha auditado.
- No se especifica el número total de parámetros, la arquitectura exacta del modelo base ni los detalles del dataset de entrenamiento más allá de STL-10.
- El modelo no es generativo y no soporta texto, por lo que no puede utilizarse para tareas de lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación y la naturaleza controvertida de las afirmaciones pueden suponer un riesgo legal o reputacional en entornos empresariales.
- El uso de una semilla fija (123) y un protocolo determinista no garantiza robustez frente a variaciones en el hardware o en las versiones de las librerías.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/frankmorales2020/gemma-4-e4b-13tasks-topo-2026-certified
- Modelo base (referenciado): https://huggingface.co/frankmorales2020/gemma-4-e4b-unesco-optimized

No se han encontrado otros enlaces (papers, blogs o demos) en la información proporcionada.
