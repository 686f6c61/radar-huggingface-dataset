# oteam/grnade

## Resumen

gRNAde es un modelo de diseño inverso de ARN (RNA inverse folding) que predice la secuencia de nucleótidos compatible con una o varias conformaciones 3D de la columna vertebral del ARN. La implementación publicada en este repositorio, `oteam/grnade`, es una versión no oficial desarrollada por el equipo de OFoldX a partir del trabajo original de Chaitanya K. Joshi y colaboradores, presentado en ICLR 2025. El modelo resuelve el problema de recuperar identidades de nucleótidos a partir de contexto estructural, una tarea central en el diseño computacional de ARN terapéutico y sintético.

Arquitectónicamente combina un codificador de perceptrón geométrico-vectorial (GVP) con un decodificador autorregresivo de nucleótidos. La variante v1 incorpora orden de secuencia, pares de bases de estructura secundaria explícitos y geometría opcional de fósforo, C4' y nitrógenos de base; la v0.3.2 prescinde de canales de secuencia y pares de bases. Con 2,157 millones de parámetros, es un modelo compacto especializado, no un modelo de lenguaje general.

Su relevancia actual reside en la creciente demanda de herramientas de diseño de ARN para vacunas, aptámeros y ribozimas, y en que esta implementación permite ejecutar el modelo mediante la librería `ofoldx` con una API de pipeline sencilla, además de ofrecer variantes para una, dos, tres y cinco conformaciones alineadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) multi-conformación con decodificador autorregresivo de nucleótidos |
| Parametros totales | 2.157.118 (2,157 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la estructura de entrada; el README no especifica un límite de residuos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gRNAde emplea un codificador GVP de 4 bloques y un decodificador de 4 bloques, con tamaños de nodo de 128 escalares / 16 vectoriales y de arista de 64 escalares / 4 vectoriales. La variante v1 usa 132 canales de arista de entrada, mientras que v0.3.2 usa 131. El codificador combina una o varias conformaciones alineadas de la misma secuencia de ARN antes de predecir las identidades; el decodificador genera la secuencia de forma autorregresiva. En v1 el grafo incorpora orden de secuencia, pares de bases de estructura secundaria explícitos y geometría opcional de P, C4' y nitrógenos de base; en v0.3.2 el grafo usa solo geometría espacial, sin canales de secuencia ni de pares de bases.

El entrenamiento se realizó sobre el conjunto RNASolo de los autores originales, compuesto por estructuras de ARN del Protein Data Bank con resolución de 4 Å o mejor y fecha de corte del 31 de octubre de 2023. El objetivo es la recuperación autorregresiva de la secuencia a partir del contexto estructural, con un valor de label smoothing de 0,05 en la versión publicada. OFoldX proporciona `GrnadeLoss` para entrenamiento y ajuste fino. No se detalla en la información disponible el número de tokens ni la composición completa del dataset más allá de la fuente PDB.

## Capacidades

- Diseño inverso de secuencia de ARN a partir de una estructura 3D de la columna vertebral.
- Condicionamiento en estructura secundaria explícita mediante notación dot-bracket.
- Diseño multi-conformación: una misma secuencia puede condicionarse a varias conformaciones alineadas de la misma molécula de ARN.
- Generación de múltiples candidatos con control de temperatura de muestreo (`num_candidates`, `temperature`).
- Puntuación de secuencias candidatas (cada resultado incluye target molecular, registro de diseño y puntuaciones).
- Selección de instancia de ARN en estructuras con varias cadenas (`instance_id`).
- Ajuste fino y entrenamiento mediante `GrnadeLoss` de la librería `ofoldx`.
- No soporta tool calling, function calling, agentes ni capacidades multilingües; es un modelo biológico especializado, no un LLM.

## Casos de uso

- Diseño de vacunas de ARN: dado un modelo estructural de un ARN diana, el pipeline `design` genera secuencias candidatas compatibles con la conformación, acelerando la exploración de variantes antes de la síntesis.
- Diseño de aptámeros: se puede condicionar la generación a la estructura secundaria del aptámero mediante dot-bracket para preservar el motivo de unión.
- Ingeniería de ribozimas y ARN catalítico: la incorporación de pares de bases explícitos en v1 permite mantener arquitecturas secundarias críticas para la catálisis.
- Diseño robusto a cambio conformacional: usando las variantes multi-estado (2, 3 o 5 estados) o pasando varias conformaciones al pipeline, se generan secuencias que se pliegan correctamente en distintas conformaciones del mismo ARN.
- Filtrado y priorización en pipelines de descubrimiento: el modelo devuelve puntuaciones por candidato, lo que permite ordenar secuencias antes de validación experimental.
- Ajuste fino sobre datos propios: con `GrnadeLoss` y `ofoldx` se puede reentrenar el modelo sobre un subconjunto de estructuras de interés (por ejemplo, una familia de ARN concreta).
- Docencia e investigación metodológica: al ser un modelo de 2,157 M de parámetros, es viable ejecutarlo en entornos de laboratorio modestos para reproducir experimentos de diseño inverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 2,157 M de parámetros, los pesos en precisión completa ocuparían aproximadamente 8,6 GB en fp32 y unos 4,3 GB en fp16, sin contar activaciones ni grafos de estructura.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 8-16 GB de VRAM debería ser suficiente para inferencia en fp16, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente sí en modelos como RTX 3090, RTX 4090 o superiores, pero no está confirmado en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `ofoldx` (`pip install ofoldx`) con el pipeline `design`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde (esta implementación, `oteam/grnade`) | 2,157 M | no disponible | Diseño inverso de ARN 3D | AGPL-3.0 | HuggingFace (`oteam/grnade`) |
| gRNAde original (`chaitjo/geometric-rna-design`) | no disponible en la información | no disponible | Diseño inverso de ARN 3D | no disponible en la información | GitHub oficial |
| gRNAde ODsign (`oteam/grnade-odesign`) | no disponible en la información | no disponible | Diseño inverso de ARN 3D | no disponible en la información | HuggingFace |
| Variantes v0.3.2 (`oteam/grnade-v0.3.2-*`) | 2,157 M (según tabla del README para la arquitectura base) | no disponible | Diseño inverso de ARN 3D | no disponible en la información | HuggingFace |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Implementación no oficial: el equipo original de gRNAde no escribió esta model card ni necesariamente validó esta implementación; para resultados de referencia debe consultarse el repositorio oficial `chaitjo/geometric-rna-design`.
- Licencia AGPL-3.0: implica obligaciones de copyleft fuerte; el uso comercial en servicios en red puede requerir liberar el código modificado. Verificar compatibilidad antes de integrar en productos propietarios.
- Dependencia de la librería `ofoldx`: los pesos no son utilizables directamente con frameworks estándar sin esa librería.
- Sesgos de datos: el entrenamiento se limita a estructuras del PDB con resolución de 4 Å o mejor y corte de octubre de 2023, lo que puede infrarepresentar familias de ARN poco depositadas o conformaciones dinámicas.
- Riesgo de sobreajuste a estructuras conocidas: como todo modelo de diseño inverso, puede generar secuencias que recuperan motivos del conjunto de entrenamiento en lugar de explorar soluciones novedosas.
- Limitaciones de contexto: no se especifica un límite de longitud de cadena; cadenas muy largas o estructuras con múltiples instancias pueden requerir selección explícita mediante `instance_id`.
- Sin garantía experimental: las secuencias generadas son predicciones computacionales y requieren validación in vitro o in vivo.
- Sin datos de benchmarks publicados en esta información, por lo que no es posible evaluar su rendimiento relativo de forma cuantitativa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/grnade
- Checkpoint ODsign: https://huggingface.co/oteam/grnade-odesign
- Variantes v0.3.2: https://huggingface.co/oteam/grnade-v0.3.2-1state-all, https://huggingface.co/oteam/grnade-v0.3.2-1state-das, https://huggingface.co/oteam/grnade-v0.3.2-1state-multi, https://huggingface.co/oteam/grnade-v0.3.2-2state-all, https://huggingface.co/oteam/grnade-v0.3.2-3state-all, https://huggingface.co/oteam/grnade-v0.3.2-3state-das, https://huggingface.co/oteam/grnade-v0.3.2-3state-multi, https://huggingface.co/oteam/grnade-v0.3.2-5state-all, https://huggingface.co/oteam/grnade-v0.3.2-5state-das, https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
- Paper original (ICLR 2025): https://arxiv.org/abs/2305.14749
- Paper de diseño generativo (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Dataset RNASolo: https://huggingface.co/datasets/chaitjo/gRNAde_datasets
- Documentación de OFoldX: https://ofoldx.valtech.ai/
