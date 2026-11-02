# Polydim-Einsof/glm5.3_prime_PMTP_polydim_einsof

## Resumen

`glm5.3_prime_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel H. García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. No es un modelo de lenguaje completo, sino un adaptador que se declara compatible con el modelo base `z-ai/glm-5.3-prime` y que se presenta como una implementación del protocolo PMTP (Polydim Memory Transfer Protocol), orientado a proyectar estados ocultos de forma continua sobre la variedad de Stiefel St(2048, 8192).

El adaptador se comercializa bajo el marco conceptual del "Protocolo Alan Turing", que expone un parámetro `turing_depth` (de 0 a 50) para controlar el número de pasos de proyección isométrica y contracción riemanniana. Según la model card, el objetivo es eliminar la serialización 1D de tokens en el razonamiento inter-paso, sustituyéndola por comunicación en memoria binaria float64. El repositorio ocupa 0,1 GB y contiene únicamente los ficheros del adaptador (matriz de proyección en FP64), no los pesos del modelo base.

La relevancia práctica es limitada: se trata de un artefacto de investigación con 0 descargas en el momento de la consulta, sin resultados de benchmarks publicados, sin idiomas declarados y con afirmaciones técnicas (latencia de 68,90 ms, defecto de ortogonalidad de 1,07e-06) que no vienen acompañadas de evaluaciones reproducibles ni de comparaciones con alternativas. Debe tratarse como material experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre variedad de Stiefel St(2048, 8192); modelo base `z-ai/glm-5.3-prime` (arquitectura del base no disponible) |
| Parametros totales | No disponible (el repo contiene solo el adaptador, 0,1 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se publican en FP64 / IEEE-754) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); incluye `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se describe como una matriz de proyección W en precisión FP64 (IEEE-754) que mapea estados ocultos de dimensión 8192 a 2048 sobre la variedad de Stiefel, es decir, imponiendo ortogonalidad entre las columnas de la proyección. La model card menciona un "defecto de ortogonalidad máximo" de 1,07e-06 medido en FP64 y un error de norma de Neumaier inferior o igual a 10^-15, lo que sugiere el uso de sumas compensadas para estabilidad numérica en la proyección.

El "Protocolo Alan Turing" define un parámetro `turing_depth` con cinco rangos operativos: 0 (bypass identidad), 1 (proyección isométrica única, 68,90 ms), 2-20 (contracción riemanniana iterativa y autocrítica adversarial), y 21-50 (demostración formal de teoremas y verificación anti-sicofancia). No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documenta el procedimiento de destilación o alineamiento respecto al modelo base.

## Capacidades

- Extracción de características (`pipeline_tag: feature-extraction`) mediante proyección de estados ocultos sobre la variedad de Stiefel.
- Razonamiento multi-paso controlado por el parámetro `turing_depth` (0 a 50), con modos declarados de reflexión rápida, deliberación tipo red team y demostración profunda.
- Comunicación inter-paso en memoria binaria float64 sin serialización de tokens (según la model card, "0 tokens consumidos en razonamiento inter-hop").
- Despliegue vía Ollama mediante el `Modelfile` incluido, con temperatura calibrada a T=0,07.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni function calling.
- No se documenta soporte multilingüe.

## Casos de uso

- Investigación en geometría de representaciones: el adaptador permite experimentar con proyecciones ortogonales sobre la variedad de Stiefel aplicadas a los estados ocultos de `glm-5.3-prime`, útil para estudiar si la estructura riemanniana mejora la separabilidad de features.
- Extracción de embeddings de alta dimensión: al declararse como `feature-extraction`, puede emplearse para generar representaciones normalizadas (2048 dimensiones) a partir de las activaciones del modelo base en tareas de recuperación o clustering.
- Reproducción de experimentos numéricos: los valores declarados de defecto de ortogonalidad y error de Neumaier permiten auditar la estabilidad en FP64 de la proyección, un caso de estudio para pipelines científicos que requieren precisión extendida.
- Prototipado de "razonamiento latente" en investigación: el parámetro `turing_depth` permite comparar empíricamente modos de deliberación iterativa frente a passthrough directo sobre el mismo modelo base.
- Evaluación de protocolos de comunicación entre agentes: el concepto de "memoria transfer protocol" sin serialización de tokens es un punto de partida para experimentos de intercambio de estados latentes entre instancias del modelo.
- Despliegue experimental en local con Ollama: el `Modelfile` incluido permite levantar el adaptador sobre el base en entornos de desarrollo para pruebas controladas, siempre que se disponga de los pesos de `glm-5.3-prime`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del adaptador:

| Metrica | Valor declarado |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1,07e-06 |
| Error de norma de Neumaier | <= 10^-15 |
| Latencia con `turing_depth = 1` | 68,90 ms |
| Latencia con `turing_depth = 10` | 79,10 ms |
| Tokens consumidos en razonamiento inter-hop | 0 |

No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 0,1 GB, pero requiere cargar el modelo base `glm-5.3-prime`, cuyos requisitos no se especifican en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo base.
- Opciones de despliegue: Ollama (se incluye `Modelfile`); integración estándar de Hugging Face vía `adapter_model.safetensors`. No se documenta soporte para vLLM, llama.cpp ni TGI.
- Latencia y throughput: solo se declaran latencias por paso de proyección (68,90 ms a profundidad 1; 79,10 ms a profundidad 10), sin especificar hardware de medida ni throughput agregado.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables sobre la variedad de Stiefel con protocolo de profundidad de razonamiento, ni se dispone de datos de rendimiento del modelo base `z-ai/glm-5.3-prime` que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación sin validación independiente: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de replicación por terceros.
- Ausencia total de benchmarks estándar: no se puede evaluar calidad, razonamiento ni robustez frente a alternativas consolidadas.
- Las afirmaciones de la model card (latencia, ortogonalidad, "0 tokens en razonamiento inter-hop") no vienen acompañadas de código de evaluación reproducible ni de especificación del hardware utilizado.
- Terminología no estándar y no auditada ("zero-worm", "anti-sycophancy verification", "DEEP_TURING_EXPLOSION") que dificulta la verificación técnica de las garantías declaradas.
- Dependencia crítica del modelo base `z-ai/glm-5.3-prime`: sin acceso a sus pesos y a su licencia, el adaptador no es funcional por sí mismo.
- Idiomas soportados no declarados; riesgo de comportamiento inconsistente fuera del idioma de entrenamiento del base (desconocido).
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial del adaptador, pero la licencia del modelo base puede imponer restricciones adicionales que no se documentan aquí.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- No apto para producción sin una evaluación propia exhaustiva del base y del adaptador en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/glm5.3_prime_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/z-ai/glm-5.3-prime
- DOI principal (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Repositorio de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
