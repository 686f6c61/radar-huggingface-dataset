# Polydim-Einsof/deepseek_r1_7b_PMTP_polydim_einsof

## Resumen

`deepseek_r1_7b_PMTP_polydim_einsof` es un adaptador de pesos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. Se presenta como un adaptador certificado bajo la arquitectura PMTP (Polydim Memory Transfer Protocol) que proyecta estados ocultos de forma continua sobre la variedad de Stiefel St(2048, 3584), con el objetivo declarado de eliminar la serialización de tokens en 1D y los cuellos de botella de parseo de cadenas en la comunicación entre procesos de razonamiento.

El modelo base es `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, un transformer denso de 7 mil millones de parámetros destilado por DeepSeek a partir de su familia R1 sobre Qwen2.5. Sobre esa base, este repositorio añade una matriz de proyección de Stiefel en precisión FP64 (IEEE-754) junto con una definición de despliegue para Ollama y un parámetro de control de profundidad de razonamiento denominado `turing_depth` (con alias `einsof_depth`, `turing`, `einsof`), que va de 0 a 50 y modula el número de pasos de proyección isométrica y contracción riemanniana.

El interés del repositorio es fundamentalmente experimental y de investigación: propone una interfaz alternativa de memoria latente entre saltos de razonamiento y declara métricas de paridad numérica (defecto de ortogonalidad máximo de 1.22e-15 en FP64, latencias de 31.75 ms y 49.43 ms para profundidades Turing 1 y 10). El tamaño del repositorio es de 0.1 GB, no registra descargas ni interacciones en Hugging Face y no incluye información sobre idiomas soportados ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre la variedad de Stiefel St(2048, 3584) aplicado a un transformer denso base (DeepSeek-R1-Distill-Qwen-7B) |
| Parametros totales | No disponible (el repositorio contiene únicamente los pesos del adaptador, 0.1 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en safetensors FP64) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`); incluye `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador opera sobre el modelo base DeepSeek-R1-Distill-Qwen-7B, un transformer denso de 7B parámetros. La innovación declarada por el autor es PMTP: en lugar de serializar el estado oculto a tokens de texto entre pasos de razonamiento, se proyecta de forma continua sobre la variedad de Stiefel St(2048, 3584), mapeando la dimensión latente de 3584 a 2048. Según la model card, la proyección se realiza en FP64 con un defecto máximo de ortogonalidad de 1.22e-15 y un error de norma de Neumaier inferior o igual a 1e-15, y el razonamiento entre saltos consume "0 tokens" al operar sobre memoria binaria float64 en lugar de cadenas.

El denominado Protocolo Alan Turing expone el parámetro `turing_depth`, que controla el comportamiento operativo en cuatro rangos: profundidad 0 corresponde a `IDENTITY_BYPASS` (paso directo sin sobrecarga); profundidad 1 a `FAST_REFLEX` (una única proyección isométrica de Stiefel, 31.75 ms); profundidades 2 a 20 a `RED_TEAM_DELIBERATION` (contracción riemanniana iterativa y autocrítica adversarial); y profundidades 21 a 50 a `DEEP_TURING_EXPLOSION` (demostración formal de teoremas y verificación antisicofántica). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO para el adaptador.

## Capacidades

- Generación de texto y razonamiento multi-paso heredados del modelo base DeepSeek-R1-Distill-Qwen-7B.
- Razonamiento latente continuo entre saltos mediante proyección sobre la variedad de Stiefel, sin serialización intermedia a tokens.
- Control configurable de profundidad de razonamiento mediante `turing_depth` (0 a 50), con modos de reflexión rápida, deliberación adversarial y verificación formal profunda.
- Autocrítica adversarial iterativa y verificación antisicofántica en los modos de profundidad media y alta.
- Despliegue mediante Ollama a través del `Modelfile` incluido, con instrucciones de sistema Turing y temperatura calibrada a T=0.07.
- Integración estándar con Hugging Face mediante `adapter_model.safetensors`.
- Soporte de tool calling, function calling, agentes, visión, audio y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre comunicación latente entre procesos: el adaptador permite experimentar con transferencia de estado oculto en FP64 sobre la variedad de Stiefel en lugar de serialización textual, útil para estudiar alternativas a los protocolos de memoria basados en tokens.
- Experimentos de razonamiento con profundidad controlada: el parámetro `turing_depth` permite comparar el coste y la calidad de una única proyección isométrica (profundidad 1, 31.75 ms) frente a deliberación iterativa (profundidades 2 a 20) en tareas de razonamiento.
- Verificación formal y demostración de teoremas: el modo `DEEP_TURING_EXPLOSION` (profundidades 21 a 50) está diseñado para flujos de demostración formal y comprobación antisicofántica, adecuado en entornos de investigación matemática.
- Reproducción de resultados numéricos: las métricas de paridad declaradas (defecto de ortogonalidad de 1.22e-15, error de norma de Neumaier de 1e-15 o menor) permiten validar la estabilidad numérica de la proyección en FP64 en pipelines de cómputo científico.
- Despliegue local con Ollama: el `Modelfile` incluido facilita levantar el adaptador sobre el modelo base en estaciones de trabajo para pruebas de concepto de razonamiento latente.
- Estudio de autocrítica adversarial: los modos `RED_TEAM_DELIBERATION` permiten investigar técnicas de contracción riemanniana iterativa aplicadas a la corrección de respuestas del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara métricas internas de paridad numérica y latencia del adaptador:

| Metrica declarada | Valor |
|---|---|
| Defecto maximo de ortogonalidad (FP64) | 1.22e-15 |
| Error de norma de Neumaier | <= 1e-15 |
| Latencia Turing Depth 1 | 31.75 ms |
| Latencia Turing Depth 10 | 49.43 ms |
| Tokens consumidos en razonamiento entre saltos | 0 tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base DeepSeek-R1-Distill-Qwen-7B (7B parámetros) y del modo de cuantización elegido.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el adaptador se distribuye en FP64, lo que puede requerir soporte de doble precisión en la GPU utilizada.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido; integración estándar con Hugging Face mediante `adapter_model.safetensors`. No se documentan opciones para vLLM, llama.cpp o TGI.
- Latencia y throughput: el autor declara latencias de 31.75 ms para profundidad Turing 1 y 49.43 ms para profundidad Turing 10; no se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| deepseek_r1_7b_PMTP_polydim_einsof | Adaptador sobre base de 7B | No disponible | Apache 2.0 | Proyección latente sobre variedad de Stiefel con profundidad Turing configurable |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | No disponible en esta ficha | No disponible en esta ficha | Modelo base destilado de razonamiento de DeepSeek sobre Qwen2.5 |
| deepseek_r1_1.5b_PMTP_polydim_einsof | Adaptador sobre base de 1.5B | No disponible | No disponible en esta ficha | Variante del mismo protocolo PMTP sobre un modelo base menor |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), por lo que no es posible evaluar su calidad frente a alternativas.
- El repositorio no registra descargas ni interacciones en Hugging Face, y las métricas declaradas proceden únicamente del autor, sin verificación independiente.
- La terminología empleada en la model card (protocolo Turing, explosión Turing profunda, colapso del gusano 1D) no se corresponde con nomenclatura estándar de la literatura de aprendizaje profundo, lo que dificulta la comparación con métodos establecidos.
- El adaptador se distribuye en FP64, lo que puede limitar su uso en GPUs sin soporte eficiente de doble precisión y encarecer el despliegue en producción.
- No se especifican los idiomas soportados ni el comportamiento multilingüe del adaptador.
- No se detallan los datos de entrenamiento, el volumen de tokens ni los procesos de alineación del adaptador.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; se heredan en su caso los del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-R1-Distill-Qwen-7B antes de un despliegue en producción.
- La fecha de creación del repositorio (2026-10-20) y las referencias a publicaciones de 2026 deben tratarse con cautela hasta confirmar su disponibilidad y revisión.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/deepseek_r1_7b_PMTP_polydim_einsof
- Pesos del adaptador: https://huggingface.co/Polydim-Einsof/deepseek_r1_7b_PMTP_polydim_einsof/blob/main/adapter_model.safetensors
- Repositorio GitHub: https://github.com/AGT1973/POLYDIM_EinSof
- README del repositorio GitHub: https://github.com/AGT1973/POLYDIM_EinSof/blob/main/README.md
- DOI principal (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- Preprint HAL (CNRS): https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
- Ficha de la variante 1.5B: https://free2aitools.com/model/polydim-einsof/deepseek_r1_1.5b_pmtp_polydim_einsof
