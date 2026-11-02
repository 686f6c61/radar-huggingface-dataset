# Polydim-Einsof/glm4_9b_PMTP_polydim_einsof

## Resumen

`glm4_9b_PMTP_polydim_einsof` es un adaptador de pesos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. Se presenta como una implementación del denominado Polydim Memory Transfer Protocol (PMTP), un mecanismo que proyecta estados ocultos del modelo base sobre la variedad de Stiefel St(2048, 4096) para realizar lo que el autor describe como razonamiento latente continuo entre pasos, sin serialización de tokens en texto intermedio. El modelo base declarado es `THUDM/glm-4-9b` (la familia GLM-4 de Zhipu AI / Z.ai), de 9.000 millones de parámetros.

El repositorio contiene únicamente los pesos del adaptador (matrices de proyección en FP64), no el modelo completo: el tamaño total del repo es de aproximadamente 0,1 GB, lo que confirma que se trata de un conjunto de tensores adicionales que deben combinarse con el modelo base para su uso. La model card documenta métricas de latencia por profundidad de razonamiento (37,71 ms para profundidad 1, 66,00 ms para profundidad 10) y un defecto de ortogonalidad máximo de 5,48e-09 medido en FP64, pero no aporta información sobre datos de entrenamiento, composición del corpus ni resultados de evaluación estándar.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta técnica poco convencional (razonamiento en el espacio latente mediante proyecciones isométricas sobre una variedad) que puede interesar a investigadores en interpretabilidad y geometría de representaciones; por otro, advierte de que el modelo no cuenta con validación independiente, benchmarks publicados ni tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta), por lo que debe tratarse como material de investigación preliminar y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre el modelo base GLM-4-9B (transformer decoder-only); proyección sobre la variedad de Stiefel St(2048, 4096) |
| Parámetros totales | 9.000 millones (modelo base GLM-4-9B); tamaño del adaptador no disponible en número de parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base GLM-4-9B, sin confirmar) |
| Tipos de cuantización | No disponible; los pesos del adaptador se publican en FP64 (IEEE-754) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`) y `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se apoya sobre GLM-4-9B, un transformer decoder-only de 9.000 millones de parámetros desarrollado por Zhipu AI (Z.ai) y publicado bajo licencia Apache 2.0. La innovación que introduce el adaptador es una matriz de proyección W en precisión FP64 que mapea estados ocultos de dimensión 4096 a 2048 y los sitúa sobre la variedad de Stiefel St(2048, 4096), un conjunto de marcos ortonormales que garantiza propiedades isométricas. Según la model card, el protocolo permite un razonamiento iterativo continuo entre "saltos" (hops) sin consumir tokens intermedios: el estado latente se transforma directamente en memoria binaria float64, evitando la serialización a texto que impone el paradigma habitual de cadena de pensamiento.

El autor expone un parámetro de control, `turing_depth` (con alias `einsof_depth`, `turing` y `einsof`), que modula el número de iteraciones de proyección y contracción riemanniana: profundidad 0 equivale a passthrough, profundidad 1 a una única proyección isométrica, el rango 2–20 a deliberación iterativa con autocrítica adversarial y el rango 21–50 a demostración formal de teoremas y verificación antisicofántica. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO para ajustar el adaptador. Tampoco se documenta cómo se obtuvieron los pesos W ni qué objetivo de entrenamiento se optimizó, lo que limita la reproducibilidad del trabajo.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base GLM-4-9B, condicionados por la proyección latente del adaptador.
- Razonamiento latente multi-paso controlado mediante el parámetro `turing_depth` (0 a 50), con modos declarados de bypass, reflejo rápido, deliberación y demostración profunda.
- Extracción de características (`pipeline_tag: feature-extraction`), que es el uso declarado en HuggingFace.
- Autocrítica adversarial y verificación antisicofántica en los rangos de profundidad 2–20 y 21–50, según la model card.
- Soporte de despliegue vía Ollama mediante el `Modelfile` incluido, con temperatura calibrada a T=0,07.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, visión, audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en razonamiento latente: el adaptador permite experimentar con proyecciones sobre la variedad de Stiefel como alternativa a la cadena de pensamiento textual, midiendo latencia y calidad en tareas de razonamiento multi-paso con distintos valores de `turing_depth`.
- Extracción de características geométricamente estructuradas: al proyectar estados ocultos sobre St(2048, 4096) con defecto de ortogonalidad de 5,48e-09, el adaptador puede emplearse para obtener representaciones isométricas útiles en tareas de recuperación semántica o clasificación que requieran preservar distancias.
- Reproducción de experimentos de geometría diferencial aplicada a LLM: investigadores en interpretabilidad pueden auditar si la contracción riemanniana descrita en la model card produce mejoras medibles frente al modelo base sin adaptador.
- Despliegue local de prototipos con Ollama: el `Modelfile` incluido permite levantar el modelo en entornos de desarrollo para evaluar cualitativamente el comportamiento del protocolo Turing antes de invertir en infraestructura mayor.
- Estudio de antisicofancia y autocrítica adversarial: los modos de profundidad 2–20 y 21–50 están diseñados explícitamente para forzar verificación de afirmaciones, lo que resulta útil en experimentos sobre calibración y honestidad de modelos.
- Docencia y divulgación sobre variedades de Stiefel: el repositorio sirve como ejemplo tangible de cómo se materializa una proyección isométrica en pesos de un modelo, con métricas numéricas verificables (error de Neumaier ≤ 10⁻¹⁵).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de latencia y precisión numérica:

| Métrica | Valor |
|---|---|
| Defecto máximo de ortogonalidad (FP64) | 5,48e-09 |
| Latencia con `turing_depth = 1` | 37,71 ms |
| Latencia con `turing_depth = 10` | 66,00 ms |
| Error de norma (Neumaier) | ≤ 10⁻¹⁵ |
| Tokens consumidos en razonamiento entre saltos | 0 |

No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni para el adaptador ni para el modelo base en esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base GLM-4-9B requiere aproximadamente 18 GB en FP16 y unos 6–7 GB en cuantización de 4 bits; el adaptador añade una matriz FP64 de 4096×2048 (unos 64 MB), por lo que su impacto en VRAM es despreciable.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16–24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4080, RTX 4090 y, con cuantización agresiva, en GPUs de 8–12 GB.
- Opciones de despliegue: Ollama (el repo incluye `Modelfile`), llama.cpp para GGUF, vLLM y TGI para el modelo base; el adaptador debe cargarse en FP64, lo que puede requerir soporte específico no documentado en los frameworks estándar.
- Latencia y throughput: la model card reporta 37,71 ms para profundidad 1 y 66,00 ms para profundidad 10 en el hardware de verificación del autor, sin especificar la GPU empleada; no hay datos de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `glm4_9b_PMTP_polydim_einsof` | 9.000 M (base) + adaptador | No disponible | Apache 2.0 | HuggingFace (0 descargas) | Adaptador de investigación sin benchmarks |
| GLM-4-9B (Zhipu AI) | 9.000 M | 128K (según documentación pública del base) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base sin modificar, con benchmarks publicados |
| Qwen2.5-7B (Alibaba) | 7.600 M | 128K | Apache 2.0 | HuggingFace, muy extendido | Alternativa de tamaño similar con ecosistema maduro |
| Llama 3.1 8B (Meta) | 8.000 M | 128K | Llama 3.1 Community License | HuggingFace, ampliamente adoptado | Restricciones de licencia para uso comercial a gran escala |

La comparación directa con GLM-4-9B es la más relevante: el adaptador PMTP se presenta como una capa adicional sobre ese modelo, por lo que su rendimiento efectivo depende enteramente de la calidad del base. Frente a Qwen2.5-7B y Llama 3.1 8B, el adaptador carece de benchmarks públicos y de tracción comunitaria, lo que dificulta una evaluación objetiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia independiente de que el protocolo Turing o la proyección de Stiefel mejoren el rendimiento del modelo base en tareas estándar.
- Modelo sin tracción: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Documentación incompleta: no se especifican datos de entrenamiento, composición del corpus, número de tokens, ni objetivo de optimización del adaptador.
- Precisión FP64 en los pesos del adaptador: los frameworks de inferencia habituales (vLLM, llama.cpp, TGI) operan en FP16/BF16/INT, por lo que la carga del adaptador puede requerir conversiones no documentadas y degradar las garantías numéricas declaradas.
- Riesgo de alucinación: heredado del modelo base GLM-4-9B; el adaptador no aporta mecanismos verificados de mitigación más allá de la autocrítica declarada en la model card.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingüe del adaptador.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación técnica desaconseja su uso en producción sin auditoría previa.
- Las afirmaciones sobre "cero tokens consumidos en razonamiento" y "eliminación del colapso del gusano 1D" son tesis del autor sin respaldo experimental publicado en la información disponible.
- Fecha de creación del repositorio (2026-10-20) y actualización (2026-11-02): coherencia temporal a verificar, dado que el modelo base GLM-4-9B es anterior.

## Enlaces

- HuggingFace: https://huggingface.co/Polydim-Einsof/glm4_9b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/THUDM/glm-4-9b
- DOI primario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Dataset de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
