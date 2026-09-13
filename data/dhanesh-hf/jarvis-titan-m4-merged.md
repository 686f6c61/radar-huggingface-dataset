# dhanesh-hf/Jarvis-Titan-M4-Merged

## Resumen

Jarvis-Titan-M4-Merged es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por el usuario dhanesh-hf en HuggingFace. Se trata de la fusión ("merge") de los pesos de J.A.R.V.I.S. Titan 14.8B DeepSeekMoE con un adaptador denominado Milestone M4 Calibrated Tri-Brid Adapter, presentado por el autor como un modelo standalone al 100 %. El repositorio declara 14.835.469.845 parámetros totales (14,83 B) en formato safetensors, con un peso de repositorio de 29,7 GB, licencia Apache-2.0 y pipeline de text-generation. Su modelo base declarado es dhanesh-hf/Jarvis-Titan-V14-MoE-Merged.

La propuesta técnica del autor se articula en torno a tres mecanismos: un backbone DeepSeekMoE con 1 experto compartido y 8 expertos enrutados con enrutamiento Top-2, un sistema de memoria "Tri-Brid" con capas puente en las posiciones [3, 7, 11, 15, 19, 23, 27] del modelo, y una compuerta adaptativa MAG-3 con una distribución objetivo de enrutamiento aproximada de 55 % local, 25 % recuperación y 20 % memoria. El modelo se etiqueta con los términos long-context, frontier-reasoning y conversational, e incluye código personalizado (custom_code) en el repositorio.

La relevancia del modelo es, a día de los datos disponibles, limitada y difícil de verificar: el repositorio registra 0 descargas y 0 "likes", no incluye resultados de benchmarks, no declara idiomas soportados y no documenta el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). Se trata por tanto de una publicación experimental de autor individual, no de un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeekMoE) con capas puente de memoria Tri-Brid y compuerta MAG-3; requiere custom_code |
| Parametros totales | 14.835.469.845 (14,83 B) |
| Parametros activos | no disponible (se sabe que el enrutamiento es Top-2 sobre 8 expertos enrutados mas 1 experto compartido, pero no se especifica el reparto de parametros por experto) |
| Longitud de contexto | no disponible como cifra global; la capa Tier 1 usa Sliding Window Attention con ventana W = 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con codigo personalizado asociado; tamano de repo 29,7 GB) |

## Arquitectura y entrenamiento

El backbone es un DeepSeekMoE de 14,8 B con un experto compartido y ocho expertos enrutados, con enrutamiento Top-2 (se activan dos expertos por token, además del compartido). Sobre ese backbone se insertan siete "Tri-Brid Strategic Bridge Layers" en las capas 3, 7, 11, 15, 19, 23 y 27. Cada puente organiza la memoria en tres niveles según la model card: Tier 1, atención de ventana deslizante local con W = 2048 tokens y GQA con paso por referencia (zero-copy); Tier 2, un "salient reservoir" de recuperación exacta de KV en un subespacio de dimensión D = 512; y Tier 3, una memoria neuronal tipo Titans basada en recurrencia de aprendizaje en tiempo de test acotada, con hiperparámetros η = 10^-3, ρ = 10^-4, μ = 0.95 y norma de Frobenius de la matriz de memoria limitada a 50,0. La selección entre niveles la realiza MAG-3, una compuerta adaptativa calibrada hacia una distribución objetivo aproximada de un 55 % de uso local, un 25 % de recuperación y un 20 % de memoria. El autor destaca además un "passthrough" sin pérdida del flujo residual del backbone para estabilizar la generación autorregresiva.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras etapas de alineación, ni sobre el procedimiento exacto de fusión de pesos entre el backbone y el adaptador M4. Tampoco se especifica si el entrenamiento se realizó sobre TPU Pallas (la etiqueta pallas-tpu aparece en el repositorio, lo que sugiere soporte o uso de kernels Pallas, pero no se detalla su alcance). En consecuencia, la innovación técnica declarada (memoria recurrente en tiempo de test acotada, recuperación exacta en subespacio de 512 dimensiones y enrutamiento híbrido local/recuperación/memoria) no puede contrastarse con documentación adicional, código de entrenamiento ni publicación alguna.

## Capacidades

- Generación de texto autorregresiva y uso conversacional (etiquetas pipeline text-generation y conversational).
- Razonamiento declarado como "frontier-reasoning" en las etiquetas del repositorio; sin evidencia de benchmarks que lo respalde.
- Contexto largo declarado (etiqueta long-context), apoyado en el esquema de memoria tri-nivel y en la ventana deslizante de 2048 tokens del Tier 1.
- Memoria en tiempo de test mediante recurrencia acotada (Tier 3, tipo Titans): en teoría permite retener y actualizar información dentro de la propia inferencia, con norma de Frobenius limitada a 50,0.
- Recuperación exacta de pares clave-valor en un subespacio de 512 dimensiones (Tier 2), orientada a preservar información saliente fuera de la ventana local.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no se documentan).

## Casos de uso

- Procesamiento de documentos largos con memoria persistente en la propia inferencia: el esquema Tri-Brid combina una ventana local de 2048 tokens, recuperación exacta en un subespacio de 512 dimensiones y una memoria recurrente acotada, lo que en principio permite resumir o consultar documentos extensos sin depender únicamente de la ventana de atención. Requiere validación empírica previa, dado que no hay benchmarks publicados.
- Asistentes conversacionales de dominio cerrado: el modelo está etiquetado como conversational y puede desplegarse en transformers con trust_remote_code=True para mantener diálogos multi-turno. Adecuado solo tras evaluar estabilidad y coherencia en producción.
- Investigación sobre memoria en tiempo de test: el Tier 3 (recurrencia tipo Titans con η, ρ, μ y cota de norma explícitas) lo convierte en un banco de pruebas para estudiar aprendizaje en inferencia y compararlo con atención estándar.
- Estudio de enrutamiento MoE híbrido: MAG-3, con su objetivo de reparto 55/25/20 entre local, recuperación y memoria, es un caso interesante para analizar cómo se distribuye la carga entre expertos y mecanismos de memoria en distintos tipos de prompt.
- Fine-tuning y experimentación académica: al publicarse en safetensors con Apache-2.0 y 14,83 B de parámetros, es viable ajustarlo con LoRA/QLoRA en hardware de gama alta para tareas concretas, siempre que se resuelvan las dependencias de custom_code.
- Reproducción de merges de adaptadores: sirve como referencia para estudiar técnicas de fusión de pesos entre un backbone MoE y un adaptador calibrado, comparando el resultado con el modelo base Jarvis-Titan-V14-MoE-Merged.
- Generación de texto en local con cuantización de 4 bits: con aproximadamente 7-9 GB de pesos en 4 bits, podría ejecutarse en GPUs de consumo (por ejemplo, RTX 3090/4090 de 24 GB), aunque no existe soporte confirmado en llama.cpp ni GGUF oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación, y tampoco se han encontrado resultados en la búsqueda web realizada. Cualquier cifra de rendimiento que se atribuya a este modelo carece por el momento de respaldo documental.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones calculadas a partir del número de parámetros declarado (14,83 B) y de los formatos habituales, no datos publicados por el autor.

- Pesos en FP16/BF16: aproximadamente 29,7 GB (coincide con el tamaño del repositorio, 29,7 GB).
- Pesos en FP8/INT8: aproximadamente 14,8 GB.
- Pesos en 4 bits (Q4_K_M o similar): aproximadamente 7,4-9 GB, dependiendo de la implementación y del tratamiento de las capas de memoria.
- VRAM total para inferencia: a los pesos hay que sumar caché KV y activaciones; sin conocer el número de cabezas GQA ni la configuración de las capas puente, el consumo de caché por token no está disponible. Como referencia práctica, un despliegue en FP16 requiere del orden de 40-70 GB de VRAM contando caché y overhead.
- GPU recomendadas en FP16: A100 80 GB, H100 80 GB o 2× A100 40 GB. En 8 bits, una sola A100 40 GB es suficiente para los pesos, con margen ajustado para contexto.
- GPU de consumo: en 4 bits los pesos caben en RTX 3090, RTX 4090, RTX 5090 o similares con 24 GB de VRAM, siempre que la implementación soporte el código personalizado. En 8 bits, 24 GB resulta insuficiente para pesos más caché.
- Opciones de despliegue: transformers con trust_remote_code=True (la vía documentada implícitamente por la etiqueta custom_code). No hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni SGLang, y el autor no publica pesos GGUF ni AWQ/GPTQ. Las capas puente personalizadas probablemente requerirán implementación específica en cualquier motor alternativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No existen datos de rendimiento del modelo analizado que permitan una comparación cuantitativa. La tabla siguiente contrasta únicamente especificaciones estructurales; las cifras de los modelos alternativos proceden de sus fichas públicas.

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Jarvis-Titan-M4-Merged | 14,83 B | MoE DeepSeekMoE + puentes de memoria Tri-Brid (Top-2 de 8 expertos + 1 compartido) | no disponible (SWA de 2048 tokens en Tier 1) | apache-2.0 | no disponible | safetensors, requiere custom_code; 0 descargas |
| Qwen2.5-14B | 14,7 B | Transformer denso | 32.768 tokens nativos (hasta 131.072 con YaRN) | apache-2.0 (la mayoria de variantes) | multilingue (incluye castellano) | amplia: safetensors, GGUF, AWQ, GPTQ, soporte en vLLM, llama.cpp, Ollama |
| Mistral-Nemo-12B-Instruct | 12,2 B | Transformer denso | 128.000 tokens | apache-2.0 | multilingue | amplia: safetensors, GGUF, soporte en multiples motores |

La comparación relevante es de disponibilidad y verificabilidad más que de rendimiento: los dos modelos densos citados cuentan con documentación de entrenamiento, evaluaciones publicadas y soporte en múltiples motores de inferencia, mientras que Jarvis-Titan-M4-Merged no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada que permita estimar calidad, razonamiento, código o matemáticas. Cualquier uso en producción es a ciegas.
- Sin documentación de entrenamiento: se desconocen los tokens vistos, la composición del dataset y si hubo RLHF, DPO o filtrado de datos. Esto impide evaluar sesgos, toxicidad y cobertura lingüística.
- Idiomas no declarados: no se puede asumir un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Sesgos conocidos: no disponible. Al no documentarse el corpus, no es posible enumerar sesgos específicos.
- Riesgo de alucinación: no cuantificado y, en general, elevado en modelos sin evaluación publicada. Los mecanismos de memoria en tiempo de test pueden además consolidar información incorrecta dentro de la propia inferencia si la recurrencia se actualiza con contenido erróneo.
- Longitud de contexto no verificada: la única cifra concreta es la ventana deslizante de 2048 tokens del Tier 1; el comportamiento efectivo de los Tiers 2 y 3 a contextos largos no está medido.
- Dependencia de custom_code: cargar el modelo exige trust_remote_code=True, lo que implica ejecutar código del autor en el entorno local. Es un riesgo de seguridad que debe evaluarse antes de usarlo en infraestructura propia.
- Soporte de motores limitado: sin GGUF, AWQ, GPTQ ni integración confirmada en vLLM, llama.cpp, Ollama o TGI, el despliegue eficiente requerirá trabajo de adaptación por parte del usuario.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de los datos, publicado por un autor individual sin historial verificable asociado a este modelo, y con fecha de creación y actualización separadas por apenas 17 segundos. La reproducibilidad del merge no está documentada.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe cumplir las obligaciones de atribución y verificar que los pesos del modelo base Jarvis-Titan-V14-MoE-Merged no impongan condiciones adicionales compatibles o no con el uso previsto.
- Caveat de producción: no se recomienda su uso en sistemas con requisitos de fiabilidad, trazabilidad o latencia garantizada sin una evaluación interna exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-Merged
- Modelo base declarado: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V14-MoE-Merged
- Paper, blog, repositorio o demo oficiales: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces recuperados pertenecen a un sitio de juegos Flash (flashgames.cx) sin ninguna relacion con el modelo.
