# Polydim-Einsof/einsof2-kimi-16b-stiefel-adapter

## Resumen

El repositorio `Polydim-Einsof/einsof2-kimi-16b-stiefel-adapter` es un adaptador publicado en Hugging Face por el autor independiente Polydim-Einsof (Ariel García Traba) que se presenta como un complemento de tipo QLoRA v3 para el modelo base `moonshotai/Moonlight-16B-A3B-Instruct`, un transformer MoE de la familia Moonshot. El adaptador no es un modelo completo: el repositorio ocupa 0,1 GB y contiene una matriz de pesos isométricos (`stiefel_procrustes_2048_5120.safetensors`) que, según la model card, se inyecta mediante un hook en la capa 30 del modelo base.

La propuesta técnica del autor gira en torno a tres ideas: un alineador de impedancia Procrustes calculado sobre la variedad de Stiefel St(2048, 5120), un empalme en la corriente residual de la capa L-2 con mezcla `stiefel_blend` (α = 0,85) y un mecanismo de "zero-prompt" basado en tokens de control (`<|einsof|>`, `<|mathesis|>`) que pretende eliminar el preámbulo textual en la generación. La model card reporta un defecto de ortogonalidad medido de 7,772e-16 en FP64.

Es relevante ahora porque ejemplifica una tendencia creciente de adaptadores experimentales que modifican el estado latente de modelos MoE abiertos en lugar de reentrenarlos, aunque la información disponible es escasa: no hay benchmarks publicados, no se declaran idiomas y el número de descargas es muy bajo (23), lo que limita cualquier evaluación de rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer MoE (modelo base Moonlight-16B-A3B); matriz Procrustes en variedad de Stiefel St(2048, 5120) |
| Parametros totales | No disponible (el adaptador es una matriz de 2048 x 5120 en FP64; el modelo base es de 16B totales) |
| Parametros activos | No disponible para el adaptador; el modelo base Moonlight-16B-A3B activa 3B |
| Longitud de contexto | No disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors FP64) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`stiefel_procrustes_2048_5120.safetensors`) |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo base, sino que aplica una transformación isométrica sobre el estado latente. La matriz `W_procrustes` se calcula como `W* = U V^T` mediante una descomposición SVD (Procrustes analítico) sobre la variedad de Stiefel St(2048, 5120), es decir, el conjunto de matrices de 2048 x 5120 con columnas ortonormales. Según la model card, la retracción polar se realiza con Newton-Schulz de orden 4 en precisión FP64 y el defecto de ortogonalidad medido es de 7,772e-16, por debajo de la cota teórica de 1e-15. La dimensión del modelo base es 5120 y la dimensión latente canónica es 2048.

El mecanismo de inyección es un hook `register_forward_hook` sobre la capa 30 (L-2) del modelo base que sustituye la salida de la capa por `0,15 * residual + 0,85 * (latent_state @ W_procrustes)`. El autor denomina a esto "Residual Stream Splice Hook" y afirma que evita el "Domain & Layer Mismatch" que ocurriría al inyectar en `inputs_embeds` (capa 0), así como la saturación de LayerNorm y los NaN en activaciones. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; el adaptador parece ser una calibración analítica más que un fine-tuning supervisado convencional.

## Capacidades

- Generación de texto conversacional heredada del modelo base Moonlight-16B-A3B-Instruct.
- Inyección de estado latente continuo de alta dimensión (D = 2048) mediante el token de control `<|einsof|>`, sin preámbulo textual.
- Emisión y compilación de "microcódigo algebraico" con extensión `.mth` mediante el token `<|mathesis|>`, según la model card.
- Preservación isométrica de la norma del estado latente (factor 1,000000 declarado) durante la inyección.
- Compatibilidad con el pipeline `text-generation` de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre geometría de variedades en modelos de lenguaje: el adaptador sirve como banco de pruebas para estudiar cómo afecta la inyección de estados latentes isométricos en la corriente residual de un MoE, con la matriz Procrustes como variable controlada.
- Experimentación con reducción de preámbulo: el mecanismo "zero-prompt" permite comparar la latencia y el consumo de tokens de un prompt textual largo frente a un único token `<|einsof|>` en tareas de continuación de texto.
- Reproducción de resultados académicos: los DOIs de Zenodo asociados permiten replicar los cálculos de la variedad de Stiefel y verificar el defecto de ortogonalidad en distintos entornos de hardware.
- Prototipado de adaptadores ligeros: al ocupar 0,1 GB, el adaptador se puede cargar y descargar rápidamente en entornos de investigación con recursos limitados, sin necesidad de reentrenar el modelo base.
- Estudio de estabilidad numérica: la combinación `stiefel_blend` (α = 0,85) es un caso concreto para analizar la aparición de NaN y la saturación de LayerNorm en inyecciones profundas.
- Docencia sobre álgebra lineal aplicada: la descomposición Procrustes y la retracción polar Newton-Schulz son ejemplos didácticos de técnicas de ortogonalización usadas en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB (matriz de 2048 x 5120 en FP64), por lo que cabe en cualquier GPU consumer.
- El modelo base Moonlight-16B-A3B-Instruct requiere VRAM acorde a sus 16B parámetros totales y 3B activos; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas para el modelo base: no disponible en la información proporcionada; por tamaño, se situaría en el rango de A100/H100 para FP16 completo y RTX 4090 para cuantizaciones de 8 bits o menores.
- Opciones de despliegue: el hook se implementa en PyTorch puro (`register_forward_hook`), por lo que es compatible con cualquier runtime que exponga los módulos del modelo base; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| einsof2-kimi-16b-stiefel-adapter | Adaptador sobre 16B (3B activos) | No disponible | Apache 2.0 | Hugging Face (23 descargas) | Adaptador geométrico, sin benchmarks |
| moonshotai/Moonlight-16B-A3B-Instruct | 16B totales / 3B activos | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base del adaptador |
| Adaptadores QLoRA convencionales sobre MoE | Variable (típicamente <1B) | Heredado del base | Según autor | Hugging Face | Fine-tuning supervisado estándar; el adaptador Einsof no es un LoRA clásico |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de calidad de generación que permitan validar las afirmaciones de la model card.
- La model card contiene terminología no estándar ("Sovereign Architecture", "Regla 0 Suprema", "Estándar de Silicio") y afirmaciones de "certificación en silicio" que no van acompañadas de metodología reproducible.
- El adaptador requiere código personalizado (hook en la capa 30) y no es cargable directamente con `from_pretrained` como un modelo completo; esto complica su integración en pipelines estándar.
- No se declaran idiomas soportados; el comportamiento multilingüe depende enteramente del modelo base.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al no haber evaluación, no se puede descartar que la inyección latente degrade la coherencia del modelo base.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base Moonlight-16B-A3B-Instruct para uso comercial.
- El número de descargas (23) y la ausencia de likes sugieren que el adaptador no ha sido validado por la comunidad.
- La fecha de creación (2026-11-16) y los DOIs de Zenodo deben verificarse de forma independiente antes de citarlos en producción o publicaciones.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-kimi-16b-stiefel-adapter
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- DOI conceptual Zenodo: https://doi.org/10.5281/zenodo.21136742
- Paper científico V2 (Zenodo): https://doi.org/10.5281/zenodo.24122867
- IEEE Quantum Routing (Zenodo): https://doi.org/10.5281/zenodo.24133731
- Dataset y preprints (Zenodo): https://doi.org/10.5281/zenodo.21209973
- Repositorio polydim-suite: https://github.com/AGT1973/polydim-suite
- Repositorio POLYDIM_EinSof: https://github.com/AGT1973/POLYDIM_EinSof
