# ChrisR05/tabnla_anthropic_faithful_v23_multisubstrate_nla-r3

## Resumen

Este repositorio contiene los checkpoints del experimento **TabNLA v23 — R3**, un autoencoder de lenguaje natural (NLA) multi-sustrato desarrollado por ChrisR05. El objetivo del proyecto es alinear representaciones internas de un modelo de datos tabulares (TabPFN v2, congelado) con un modelo de lenguaje base, concretamente `Qwen/Qwen2.5-1.5B-Instruct`. Se trata de un artefacto de investigación centrado en la interpretabilidad y la reconstrucción de activaciones, no de un modelo conversacional o generativo de propósito general.

El repositorio contiene únicamente los pesos serializados en formato PyTorch (state_dict) junto con metadatos del experimento, ocupando 6.0 GB. La licencia es Apache-2.0. No se proporcionan datos sobre idiomas soportados, pipeline de inferencia ni benchmarks. Para utilizar los pesos es necesario reconstruir los módulos Python exactos a partir de la celda fuente y los metadatos incluidos en el repositorio, lo que limita su uso a entornos de investigación con conocimientos avanzados de la arquitectura interna del experimento.

La relevancia de este modelo reside en su enfoque novedoso: utiliza un modelo de lenguaje (Qwen2.5-1.5B) como decodificador de representaciones de un modelo tabular (TabPFN), extrayendo bloques específicos de atención y MLP (L03, L06, L07, L08, L10) para condicionar la generación de texto. Es un ejemplo de alineamiento cross-modal entre lenguaje natural y datos tabulares, con potencial para futuras aplicaciones en explicabilidad y generación de informes automáticos a partir de tablas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de lenguaje natural (NLA) sobre Qwen2.5-1.5B-Instruct, con objetivo TabPFN v2 congelado |
| Parametros totales | No disponible (base: 1.5B, sin especificar cabezas adicionales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredado de Qwen2.5-1.5B-Instruct, no especificado) |
| Tipos de cuantizacion | No disponible (solo se mencionan pesos PyTorch) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (state_dict serializado) |

## Arquitectura y entrenamiento

La arquitectura se basa en un modelo de lenguaje autoregresivo (Qwen2.5-1.5B-Instruct) que actúa como decodificador de un autoencoder. El codificador es un modelo TabPFN v2 de regresión, congelado durante el entrenamiento. Se extraen representaciones específicas de TabPFN desde los bloques `L03:post_row_attention:query_target`, `L07:post_mlp:query_target`, `L10:post_row_attention:query_target`, así como de las columnas de filas (`L06:post_row_attention:query_row_col_0` a `_4`) y estadísticos globales (`L08:post_feature_attention:support_all_mean`, `_std`, `_max`). Estas representaciones se utilizan para condicionar la generación de texto.

El objetivo de reconstrucción es `raw_plus_balanced`, lo que sugiere una combinación de pérdida sobre los datos crudos y un balanceo de clases o características. El canal de texto se describe como "prosa AV sin restricciones" que se pasa directamente al decodificador autoregresivo (AR). Además, se soportan prompts de "Activación-Oracle" dirigidos, utilizando el mismo vector AV. El entrenamiento se describe como "optimizer-free", lo que indica que los checkpoints son instantáneas de un proceso que no utiliza un optimizador estándar, posiblemente basado en ajuste directo de pesos o técnicas de destilación.

## Capacidades

- Generación de texto condicionada por representaciones internas de TabPFN (autoencoder de lenguaje natural).
- Reconstrucción de representaciones tabulares a partir de texto (si la dirección es bidireccional, según el objetivo `raw_plus_balanced`).
- Soporte de prompts "Targeted Activation-Oracle" para sondear activaciones específicas del modelo.
- Extracción y uso de múltiples sustratos de representación (atención, MLP, estadísticos de soporte) de TabPFN.
- No es un chatbot ni un modelo de propósito general: no se reportan capacidades de razonamiento, código, matemáticas o tool calling.
- Capacidades multilingües no disponibles.

## Casos de uso

- Investigación en interpretabilidad de modelos tabulares: permite estudiar cómo las representaciones internas de TabPFN se traducen a lenguaje natural, facilitando el análisis de qué información captura cada bloque de atención o MLP.
- Desarrollo de técnicas de alineamiento cross-modal: sirve como base para experimentos que buscan conectar el espacio semántico del lenguaje con el espacio de características de datos tabulares.
- Generación de explicaciones automáticas para predicciones de TabPFN: si la reconstrucción es fiable, podría generar texto descriptivo a partir de las activaciones del modelo, aunque esto no está validado.
- Benchmarking de autoencoders de lenguaje natural: útil para comparar metodologías de extracción de representaciones (por ejemplo, `post_row_attention` vs. `post_mlp`) en términos de fidelidad de reconstrucción.
- Estudio de "Activación-Oracle": permite probar si prompts específicos pueden activar o recuperar representaciones concretas del modelo tabular, lo que tiene aplicaciones en control de generación.
- Reconstrucción de módulos y metadatos: el propio proceso de reconstruir los módulos Python a partir de la celda fuente es un caso de uso para investigadores que quieran entender cómo se serializan y cargan estos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6.0 GB, lo que sugiere que los pesos en fp32 (1.5B parámetros * 4 bytes) requieren aproximadamente 6 GB de VRAM. Con cuantización (no disponible en el repo) podría reducirse, pero no se especifica.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) podría cargar el modelo en fp32, aunque la inferencia será lenta. Para mayor comodidad, se recomienda una GPU con 12 GB o más (RTX 3080, RTX 4090, A100).
- No es un modelo estándar para vLLM, Ollama o TGI, ya que requiere reconstrucción manual de los módulos Python específicos del experimento.
- Latencia y throughput estimados: no disponibles, dependen de la implementación de la reconstrucción y del hardware.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, dado que se trata de un artefacto de investigación muy específico (autoencoder de lenguaje natural para TabPFN) sin equivalentes comerciales o de código abierto ampliamente conocidos.

## Limitaciones y advertencias

- Es un checkpoint experimental sin soporte oficial ni documentación de uso general.
- No es un modelo conversacional ni de generación de texto estándar; su uso requiere conocimientos profundos de la arquitectura interna y de los metadatos del experimento.
- No se han evaluado sesgos ni riesgos de alucinación, ya que no se comporta como un LLM tradicional.
- La reconstrucción de los módulos Python es obligatoria y puede fallar si no se utiliza la celda fuente exacta y los metadatos correctos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni de resultados.
- No se dispone de información sobre la calidad de la reconstrucción ni sobre la robustez del modelo ante datos fuera de distribución.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ChrisR05/tabnla_anthropic_faithful_v23_multisubstrate_nla-r3
