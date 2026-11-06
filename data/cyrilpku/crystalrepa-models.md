# CyrilPKU/CrystalREPA-Models

## Resumen

CrystalREPA-Models es una colección de checkpoints preentrenados para la generación de estructuras cristalinas inorgánicas, publicada por CyrilPKU (Chengqian Zhang y colaboradores) y aceptada en NeurIPS 2026. El modelo aplica una técnica de alineación de representaciones (REPA) a un modelo generativo de cristales basado en MatterGen de Microsoft, transfiriendo priors físicos desde potenciales interatómicos de aprendizaje automático (MLIP) congelados hacia el modelo generativo mediante un objetivo contrastivo consciente de los elementos (EA-NCE).

El repositorio incluye once checkpoints: un baseline MatterGen sin alineación y diez variantes CrystalREPA, cada una alineada con un profesor MLIP distinto (DPA-3.1-3M, DPA-3.1-MPtrj, MACE-MPA-0, MACE-MP-0, ORB v2/v3, SevenNet-Omni-i12, SevenNet-l3i5 y MatterSim-v1-5M, además de una variante fine-tuned de DPA-3.1-3M). Todos los modelos se entrenaron sobre el dataset MP-20 y corresponden a la época 1899 de un total de 1.900 épocas.

La relevancia de esta publicación radica en que el muestreo no requiere ni los modelos profesor ni sus representaciones cacheadas: una vez entrenado, el modelo generativo es autónomo. Esto lo convierte en una herramienta práctica para investigación en descubrimiento de materiales, donde la generación de candidatos cristalinos con mayor validez física puede acelerar el cribado previo a la simulación DFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusión para cristales basado en MatterGen (no es un LLM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generación de estructuras, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, para documentación y prompts; el modelo genera estructuras cristalinas, no texto) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`), aproximadamente 465 MB por checkpoint |
| Tamano del repositorio | 5,1 GB |
| Epoca de entrenamiento | 1899 (de 1900) |
| Dataset de entrenamiento | MP-20 |
| Numero de checkpoints | 11 (1 baseline + 10 CrystalREPA) |

## Arquitectura y entrenamiento

CrystalREPA se construye sobre MatterGen, un modelo generativo de difusión para la generación de estructuras cristalinas inorgánicas. La innovación principal es la alineación de las representaciones a nivel de átomo del modelo generativo con las de un MLIP congelado, mediante un objetivo contrastivo consciente de los elementos (EA-NCE). Los hiperparámetros de alineación son: peso de alineación 1.0, temperatura 0.1 y capa de alineación 2. El baseline no emplea alineación de representaciones.

El entrenamiento se realizó sobre MP-20 durante 1.900 épocas. Existe una distinción importante en el preprocesamiento: los checkpoints `baseline` y `dpa_3_1_3m` se entrenaron con preprocesamiento de celda primitiva, mientras que los otros nueve usaron el preprocesamiento de la caché compartida publicada, que aplica reducción de Niggli sin conversión a celda primitiva. Esta distinción se registra en el campo `training_preprocessing_matches_release` del catálogo de modelos. Los datos de entrenamiento y las representaciones precalculadas de los profesores están disponibles en el dataset CrystalREPA-Data, de modo que el reentrenamiento no requiere ejecutar los modelos profesor.

## Capacidades

- Generación de estructuras cristalinas inorgánicas mediante difusión, produciendo archivos EXTXYZ y CIF.
- Transferencia de priors físicos desde diez MLIP distintos, cada uno dando lugar a una variante especializada.
- Muestreo autónomo: no requiere los modelos profesor ni sus representaciones cacheadas en inferencia.
- Generación por lotes configurable (`--batch_size`, `--num_batches`) para ajustar el uso de memoria GPU.
- Registro opcional de trayectorias de generación (`--record_trajectories`).
- Reentrenamiento y continuación desde checkpoint disponibles mediante la caché de representaciones.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso en el sentido de un LLM; su dominio es la generación de estructuras materiales.

## Casos de uso

- Cribado de candidatos cristalinos: generar miles de estructuras (por ejemplo, 1.024 con `--num_batches=16`) para filtrar candidatos antes de cálculos DFT costosos, aprovechando que el muestreo no necesita los profesores MLIP.
- Comparación de priors físicos: entrenar o evaluar las diez variantes con distintos profesores (DPA-3.1, MACE, ORB, SevenNet, MatterSim) para estudiar qué MLIP transfiere mejores sesgos estructurales a la generación.
- Investigación en descubrimiento de materiales: usar las estructuras generadas como punto de partida para pipelines de relaxación y evaluación de estabilidad termodinámica con la pipeline oficial de MatterGen.
- Estudio metodológico de REPA: reproducir experimentos de alineación de representaciones con los hiperparámetros publicados (peso 1.0, temperatura 0.1, capa 2) y comparar contra el baseline sin alineación.
- Generación condicionada por composición o estructura: emplear el modelo base MatterGen subyacente para tareas de generación condicionada dentro de flujos de investigación de materiales.
- Benchmarking de modelos generativos de cristales: usar los checkpoints como referencia reproducible en la evaluación con la pipeline de MatterGen (métricas de relaxación y basadas en referencias).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2605.08960) para los resultados de evaluación y la metodología, e indica que la evaluación utiliza la pipeline de MatterGen, cuyas métricas de relaxación y basadas en referencias requieren el potencial y los datasets de referencia correspondientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la model card indica que si la memoria GPU es limitada se reduzca el `batch_size` y se aumente `num_batches` para preservar el total de muestras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño de checkpoint (aproximadamente 465 MB) sugiere que el modelo en sí es ligero, aunque el consumo real depende del pipeline de muestreo.
- Opciones de despliegue: scripts del repositorio de código (`scripts/mattergen.py generate`) con el entorno del repositorio CrystalREPA; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dataset | Profesor MLIP | Licencia | Checkpoints |
|---|---|---|---|---|---|
| CrystalREPA (este) | Difusión + alineación REPA | MP-20 | 10 MLIP distintos | MIT | 11 |
| MatterGen baseline | Difusión | MP-20 | Ninguno | MIT (checkpoint liberado) | 1 |
| Otras variantes CrystalREPA | Difusión + REPA | MP-20 | DPA-3.1, MACE, ORB, SevenNet, MatterSim | MIT | 10 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la model card remite al paper para los resultados.

## Limitaciones y advertencias

- Las estructuras generadas son candidatas: la generación por sí sola no establece estabilidad termodinámica ni sintetizabilidad experimental.
- Entrenado únicamente sobre MP-20, lo que limita la diversidad química fuera de la distribución de ese dataset.
- Inconsistencia de preprocesamiento entre checkpoints: `baseline` y `dpa_3_1_3m` usan celda primitiva; los otros nueve usan reducción de Niggli sin conversión a celda primitiva, lo que puede afectar comparaciones directas.
- Los checkpoints son pesos de MatterGen entrenados, no los pesos originales de los profesores MLIP.
- Los datos de entrenamiento y los modelos profesor upstream conservan sus propias licencias, independientemente de la licencia MIT de los checkpoints liberados.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni agentes; su uso está restringido a investigación en generación de cristales inorgánicos.
- La versión camera-ready del paper está pendiente; los resultados citados deben contrastarse con el preprint de arXiv.

## Enlaces

- Hugging Face: https://huggingface.co/CyrilPKU/CrystalREPA-Models
- Dataset: https://huggingface.co/datasets/CyrilPKU/CrystalREPA-Data
- Paper (arXiv): https://arxiv.org/abs/2605.08960
- Código: https://github.com/Chengqian-Zhang/CrystalREPA
- Documentación MatterGen en el repo: https://github.com/Chengqian-Zhang/CrystalREPA/blob/main/docs/mattergen.md
- Pipeline de evaluación MatterGen: https://github.com/microsoft/mattergen
- MatterGen (Microsoft): https://github.com/microsoft/mattergen
- REPA (inspiración): https://github.com/sihyun-yu/REPA
- Catálogo de modelos: https://huggingface.co/CyrilPKU/CrystalREPA-Models/blob/main/mattergen/models.json
