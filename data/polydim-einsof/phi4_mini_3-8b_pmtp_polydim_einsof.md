# Polydim-Einsof/phi4_mini_3.8b_PMTP_polydim_einsof

## Resumen

`phi4_mini_3.8b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel H. García Traba bajo la iniciativa POLYDIM-EINSOF. Se presenta como una implementación del protocolo PMTP (Polydim Memory Transfer Protocol), que proyecta los estados ocultos del modelo base de forma continua sobre la variedad de Stiefel St(1024, 3072), eliminando la serialización de tokens en 1D entre pasos de razonamiento. El modelo base es `microsoft/Phi-4-mini-instruct`, un transformer denso de aproximadamente 3.800 millones de parámetros.

La propuesta técnica central es el llamado "Alan Turing Protocol", un parámetro `turing_depth` que controla el número de iteraciones de proyección isométrica y contracción riemanniana sobre los estados latentes, sin consumir tokens intermedios. El autor reporta métricas de verificación en silicio: defecto de ortogonalidad máximo de 5,80e-09 en FP64, latencia de 17,47 ms con `turing_depth=1` y 32,54 ms con `turing_depth=10`.

Es relevante ahora porque propone una vía alternativa al razonamiento multi-paso basado en cadenas de pensamiento textuales, sustituyéndolo por iteraciones en espacio latente de precisión doble. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado del repo es de 0,0 GB, lo que plantea dudas sobre la disponibilidad efectiva de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer denso (base: microsoft/Phi-4-mini-instruct); proyección continua sobre variedad de Stiefel St(1024, 3072) |
| Parametros totales | No disponible para el adaptador; el modelo base Phi-4-mini-instruct tiene aproximadamente 3.800 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se declaran en FP64 / IEEE-754) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); incluye `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se construye sobre `microsoft/Phi-4-mini-instruct` y añade una matriz de proyección W en FP64 que mapea estados ocultos de dimensión 3072 a 1024, con la restricción de que las columnas resultantes sean ortonormales (variedad de Stiefel). Según la model card, la comunicación entre pasos de razonamiento se realiza en memoria binaria float64 sin serialización de tokens, lo que el autor denomina "zero 1D worm collapse". El parámetro `turing_depth` (alias `einsof_depth`, `turing`, `einsof`) controla el número de iteraciones: 0 para bypass identidad, 1 para proyección isométrica simple, 2-20 para "deliberación red team" con contracción riemanniana y autocrítica adversarial, y 21-50 para "deep turing explosion" orientado a demostración formal de teoremas y verificación antisicofántica.

No se especifican en la información disponible los datos de entrenamiento del adaptador (número de tokens, composición del dataset, uso de RLHF/DPO) ni el procedimiento exacto de ajuste. Tampoco se detalla si el adaptador modifica los pesos del modelo base o se aplica únicamente en inferencia como capa de proyección. Las métricas de verificación reportadas (defecto de ortogonalidad 5,80e-09, error de norma de Neumaier ≤ 1e-15) sugieren un enfoque de validación numérica en FP64 más que un pipeline de entrenamiento convencional.

## Capacidades

- Razonamiento multi-paso en espacio latente controlado por `turing_depth` (0 a 50 iteraciones).
- Proyección isométrica continua sobre la variedad de Stiefel, sin serialización de tokens intermedios.
- Modos operativos diferenciados: bypass identidad, reflejo rápido, deliberación adversarial y demostración formal profunda.
- Extracción de características (`pipeline_tag: feature-extraction`).
- Capacidades heredadas del modelo base Phi-4-mini-instruct: generación de texto, razonamiento, matemáticas y código (no verificadas en esta ficha).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Despliegue vía Ollama mediante el `Modelfile` incluido, con temperatura calibrada a T=0.07.

## Casos de uso

- Investigación en razonamiento latente: el adaptador permite experimentar con iteraciones de proyección sobre estados ocultos sin generar cadenas de pensamiento textuales, útil para estudiar si el razonamiento en espacio continuo reduce latencia y consumo de tokens frente a CoT.
- Verificación numérica de estabilidad: las métricas de ortogonalidad y error de norma permiten usar el adaptador como banco de pruebas para técnicas de proyección riemanniana en FP64 dentro de pipelines de investigación.
- Demostración formal asistida: con `turing_depth` entre 21 y 50, el autor propone su uso en verificación de teoremas y comprobación antisicofántica, adecuado para prototipos de asistentes matemáticos que requieran trazabilidad de la contracción.
- Extracción de características: al declararse como `feature-extraction`, puede emplearse para obtener representaciones latentes proyectadas de textos, por ejemplo en tareas de clustering o búsqueda semántica sobre el modelo base.
- Despliegue local con Ollama: el `Modelfile` incluido permite levantar el adaptador en entornos de desarrollo con Ollama, útil para pruebas de concepto de bajo coste.
- Evaluación comparativa de protocolos de razonamiento: sirve como referencia para contrastar enfoques de razonamiento latente frente a métodos basados en tokens, en el contexto de la literatura sobre "latent reasoning".
- Prototipado de agentes con autocrítica: el modo "red team deliberation" (depth 2-20) puede emplearse en flujos donde se requiera una fase explícita de contracción y crítica interna antes de emitir una respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de verificación numérica y latencia:

| Metrica | Valor reportado |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 5,80e-09 |
| Error de norma de Neumaier | ≤ 1e-15 |
| Latencia con turing_depth = 1 | 17,47 ms |
| Latencia con turing_depth = 10 | 32,54 ms |
| Tokens consumidos en razonamiento inter-hop | 0 |

No se proporcionan resultados en MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base Phi-4-mini-instruct (aproximadamente 3.800 millones de parámetros) y del formato de cuantización empleado, no especificado.
- GPU recomendadas: no disponibles. El adaptador se declara en FP64, lo que en GPUs de consumo (RTX 4090, etc.) implica penalización de rendimiento frente a FP16/BF16; no se detalla si la proyección se ejecuta en FP64 en tiempo de inferencia o solo en verificación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: Ollama (mediante el `Modelfile` incluido). No se mencionan vLLM, llama.cpp, TGI ni otros motores.
- Latencia: 17,47 ms con `turing_depth=1` y 32,54 ms con `turing_depth=10` según mediciones del autor; no se especifica el hardware empleado.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador para establecer una comparativa rigurosa. A continuación se compara a nivel estructural con el modelo base y alternativas de tamaño similar, indicando solo datos verificables:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi4_mini_3.8b_PMTP_polydim_einsof | ~3.800 M (base) + adaptador | No disponible | Apache 2.0 | safetensors + Modelfile | Adaptador de investigación, 0 descargas |
| microsoft/Phi-4-mini-instruct | ~3.800 M | No disponible en esta ficha | MIT (modelo base) | safetensors, GGUF | Modelo base oficial, ampliamente desplegado |
| Qwen2.5-3B-Instruct | ~3.000 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño comparable |
| Llama-3.2-3B-Instruct | ~3.200 M | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa densa con contexto largo |

La comparación de rendimiento en benchmarks no está disponible para el adaptador POLYDIM.

## Limitaciones y advertencias

- Repositorio sin descargas ni likes y con tamaño declarado de 0,0 GB: existe riesgo de que los pesos no estén efectivamente publicados o accesibles.
- La model card emplea terminología no estándar ("zero worm", "deep turing explosion", "anti-sycophancy verification") sin definiciones formales ni referencias a literatura revisada por pares; la validación científica es limitada.
- No se documentan datos de entrenamiento, composición del dataset ni metodología de ajuste del adaptador.
- El uso de FP64 para la proyección puede degradar el rendimiento en GPUs de consumo y en entornos de producción con requisitos de latencia estricta.
- No se especifican sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del adaptador; los heredados del modelo base no se detallan en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación independiente desaconseja su uso en producción sin evaluación previa.
- El pipeline declarado es `feature-extraction`, no `text-generation`, lo que puede implicar que el adaptador no está pensado para generación directa.
- Las fechas de creación y actualización (2026) y los identificadores DOI deben verificarse antes de citarse, dado el carácter independiente de la publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Polydim-Einsof/phi4_mini_3.8b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- DOI primario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- Preprint CNRS/HAL: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Archivo de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
- JST/Jxiv: ID 7040 (no se proporciona URL directa)
