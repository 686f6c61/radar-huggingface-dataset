# mradermacher/munin-2.0-GGUF

## Resumen

Munin 2.0 es un modelo de lenguaje desarrollado por Danish Foundation Models, distribuido en formato GGUF por mradermacher. Se trata de un modelo de arquitectura híbrida Mamba-MoE (denominada Nemotron-H en la nomenclatura de NVIDIA) con 123.611 millones de parámetros totales, orientado a razonamiento, uso agéntico y generación de código. Los tags del repositorio lo vinculan a la familia Nemotron-3 y a la arquitectura nemotron_h, lo que sugiere una base tecnológica compartida con los modelos abiertos de NVIDIA.

El modelo está especializado en danés e inglés, lo que lo convierte en una pieza relevante para el ecosistema lingüístico nórdico, tradicionalmente poco cubierto por los grandes modelos abiertos. Su licencia, la NVIDIA Nemotron Open Model License, condiciona el uso comercial y debe revisarse antes de cualquier despliegue en producción.

Esta ficha describe la versión cuantizada publicada por mradermacher, que ofrece cuantizaciones estáticas GGUF desde Q2_K (54,9 GB) hasta Q8_0 (131,7 GB), pensadas para despliegue local con llama.cpp y herramientas compatibles. No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-MoE (Nemotron-H, familia Nemotron-3) |
| Parametros totales | 123.611.033.088 (123,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); versiones imatrix en repositorio separado |
| Idiomas soportados | danés (da), inglés (en) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (original en safetensors según el modelo base) |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como Nemotron-H, una propuesta híbrida que combina capas Mamba (modelos de espacio de estados) con mezcla de expertos (MoE). Los tags del repositorio incluyen además "mtp", que apunta a multi-token prediction, una técnica de entrenamiento que permite al modelo predecir varios tokens por paso y que suele emplearse para decodificación especulativa o para mejorar la eficiencia de inferencia. La presencia de los tags "reasoning", "agentic" y "coding" indica que el entrenamiento se ha orientado explícitamente a estas capacidades.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá de la combinación Mamba-MoE y la predicción multi-token. El modelo base es danish-foundation-models/munin-2.0, publicado en safetensors; esta ficha cubre únicamente la conversión y cuantización GGUF realizada por mradermacher.

## Capacidades

- Generación de texto conversacional en danés e inglés.
- Razonamiento explícito (tag "reasoning"), orientado a tareas que requieren cadenas de pensamiento.
- Generación de código (tag "coding").
- Uso agéntico y flujos multi-paso (tag "agentic").
- Predicción multi-token (MTP) como capacidad arquitectónica declarada.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se ha confirmado soporte de tool calling, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia conversacional en danés: el modelo cubre nativamente el danés, lo que permite construir asistentes para administraciones públicas, atención al ciudadano o soporte interno en organizaciones danesas sin depender de traducción intermedia.
- Generación de código en entornos nórdicos: equipos que trabajan con documentación y comentarios en danés pueden usar el modelo para autocompletar, refactorizar o explicar código manteniendo el contexto lingüístico local.
- Flujos agénticos multi-paso: el tag "agentic" y la arquitectura MTP sugieren idoneidad para orquestación de tareas con varias llamadas encadenadas, como investigación automatizada o gestión de incidencias.
- Razonamiento sobre documentación técnica: tareas de análisis y síntesis de textos largos en inglés y danés, aprovechando la eficiencia de la capa Mamba en secuencias extensas.
- Despliegue local con llama.cpp: las cuantizaciones Q4_K_M (88,5 GB) y Q5_K_M (98,4 GB) permiten ejecutar el modelo en estaciones de trabajo con suficiente memoria, sin depender de servicios en la nube.
- Evaluación comparativa de arquitecturas híbridas: investigadores pueden usar las distintas cuantizaciones para medir el impacto de la compresión en un modelo Mamba-MoE de 123 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K 54,9 GB; Q3_K_S 61,4 GB; Q3_K_M 69,0 GB; IQ4_XS 69,4 GB; Q3_K_L 72,5 GB; Q4_K_S 77,8 GB; Q4_K_M 88,5 GB; Q5_K_S 89,1 GB; Q5_K_M 98,4 GB; Q6_K 115,8 GB; Q8_0 131,7 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4 y Q5 requieren GPUs de 80 GB o superiores (A100 80 GB, H100 80 GB) o reparto entre varias GPUs.
- GPU de consumo: ninguna cuantización cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Las cuantizaciones más pequeñas (Q2_K, 54,9 GB) podrían ejecutarse con offloading parcial a CPU y RAM del sistema.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explícita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Munin 2.0 (esta ficha) | 123,6 B | no disponible | NVIDIA Nemotron Open Model License | GGUF, safetensors |
| Modelos Nemotron-3 de NVIDIA | no disponible | no disponible | NVIDIA Nemotron Open Model License | no disponible |
| Otros modelos abiertos de 100 B+ | no disponible | no disponible | variable | variable |

No se dispone de datos suficientes sobre modelos comparables de la misma familia o tamaño en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Cobertura lingüística limitada a danés e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Licencia NVIDIA Nemotron Open Model License: es una licencia "other" con condiciones específicas; debe revisarse el texto completo antes de uso comercial.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad.
- No se dispone de información sobre sesgos, filtrado de datos ni evaluaciones de seguridad.
- El tamaño del repositorio (927,3 GB) y de las cuantizaciones (desde 54,9 GB) implica requisitos de almacenamiento y memoria elevados.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S, Q4_K_M y Q8_0 como opciones equilibradas.
- No se confirma soporte de tool calling ni de agentes con protocolos estandarizados, pese al tag "agentic".
- La fecha de creación del repositorio (2026-11-19) y la ausencia de likes y de benchmarks públicos limitan la validación independiente del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/munin-2.0-GGUF
- Modelo base: https://huggingface.co/danish-foundation-models/munin-2.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/munin-2.0-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#munin-2.0-GGUF
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
