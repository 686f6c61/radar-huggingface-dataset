# bambocher/Qwen3.5-2B-heretic-oQ2.7e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ2.7e-mtp es una versión cuantizada y "descensurada" (decensored) del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres transformaciones sobre el modelo base: un proceso de ablación de comportamiento (Heretic v2.0.0) que elimina los rechazos del modelo original, una cuantización mixta de precisión realizada con oQ (oMLX v0.7.3) que reduce el peso a 1,414 GiB, y la conservación de la cabeza de predicción multi-token (MTP) del modelo original.

El modelo tiene 2.274.069.824 parámetros totales, de los cuales 1.882B corresponden al modelo de lenguaje, 0.331B a la torre de visión y 0.061B a la cabeza MTP. La cuantización emplea un esquema de precisión mixta que combina bloques afines de 3, 4, 5, 6 y 8 bits con grupos de 64 y 128, además de un 14,97% de los pesos en BF16, resultando en un promedio efectivo de 5,342 bits por peso. El formato está pensado para la librería MLX de Apple, lo que lo hace adecuado para inferencia en hardware Apple Silicon.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de cuantización mixta agresiva sobre un modelo multimodal pequeño; por otro, ilustra el ecosistema de derivados "heretic" que eliminan los mecanismos de rechazo del modelo base. Cabe señalar que el repositorio no incluye información sobre licencia, idiomas ni pipeline, y que el modelo base Qwen3.5-2B no está verificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza de predicción multi-token (MTP); cuantización mixta oQ sobre MLX |
| Parametros totales | 2.274.069.824 (2.274B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit (grupos 128 y 64), 4-bit, 5-bit, 6-bit, 8-bit (grupo 64) y BF16; promedio efectivo 5,342 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX); repo de 1,5 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 que incorpora una torre de visión (0.331B parámetros) junto al modelo de lenguaje (1.882B) y una cabeza de predicción multi-token (MTP, 0.061B). La cabeza MTP permite decodificación especulativa interna, prediciendo varios tokens por paso para acelerar la generación. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

Sobre ese base, bambocher aplicó dos procesos. Primero, una ablación de rango arbitrario (ARA, Arbitrary-Rank Ablation) con Heretic v2.0.0 sobre las capas 12 a 23, con pesos de preservación de comportamiento correcto de 0,9189, de direccionamiento de comportamiento indeseado de 0,0008, de corrección relativa de 0,9924 y 14 vecinos. El resultado declarado es 0 rechazos en 100 frente a 97 en el original, con una divergencia KL de 0,1397 respecto al modelo base. Segundo, una cuantización mixta con oQ (oMLX v0.7.3) que asigna 3 bits a la mayor parte de los pesos (78,66% en 3-bit), reserva 4-8 bits para capas sensibles y mantiene en BF16 un 14,97% de los pesos. El repositorio fue actualizado el 2026-11-12 con una recuantización; el autor recomienda volver a descargar copias anteriores.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-2B.
- Procesamiento de imágenes: incluye torre de visión de 0.331B parámetros, por lo que soporta entradas multimodales.
- Decodificación especulativa mediante la cabeza MTP conservada, orientada a reducir latencia en generación.
- Comportamiento sin rechazos: la ablación Heretic elimina las negativas del modelo original (0/100 rechazos declarados).
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 1,5 GB y su formato MLX permiten ejecutar el modelo en Macs con memoria unificada, aprovechando la cuantización mixta para reducir huella sin sacrificar del todo las capas sensibles.
- Prototipado multimodal en local: la torre de visión integrada permite experimentar con tareas imagen-texto en un equipo de sobremesa, sin depender de APIs externas.
- Generación de texto creativo sin filtros: el proceso Heretic elimina los rechazos, lo que resulta útil para investigación sobre alineación, escritura de ficción o generación de contenido que el modelo base rechazaría.
- Evaluación de técnicas de cuantización: el desglose por bits y grupos del repositorio sirve como caso de estudio reproducible de cuantización mixta con oQ sobre un transformer multimodal pequeño.
- Benchmarking de decodificación especulativa: la cabeza MTP conservada permite medir la ganancia de throughput de la predicción multi-token en MLX frente a decodificación autoregresiva estándar.
- Investigación sobre ablación de comportamiento: los parámetros ARA publicados (capas, pesos, vecinos) permiten replicar o variar el proceso Heretic y estudiar su efecto sobre la divergencia KL y la tasa de rechazos.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 1,414 GiB en disco; en inferencia MLX se necesita memoria unificada suficiente para los pesos más los estados de activación, no cuantificados en la información disponible.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4); no se indica compatibilidad con CUDA.
- ¿Cabe en GPU consumer? El formato MLX apunta a Macs; en GPUs NVIDIA no se ha verificado compatibilidad.
- Opciones de despliegue: MLX y oMLX (versión 0.7.3 usada para la cuantización); vLLM, llama.cpp, Ollama y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles; la cabeza MTP está pensada para acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ2.7e-mtp (este) | 2,274B | no disponible | no disponible | safetensors MLX, cuantización mixta | 0/100 rechazos, KL 0,1397, MTP conservada |
| Qwen/Qwen3.5-2B | 2,274B (estimado) | no disponible | no disponible | safetensors | Modelo base; 97/100 rechazos |
| Alternativas de 2B en MLX cuantizado | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; no se puede confirmar el uso comercial ni las obligaciones de atribución. Verificar la licencia del modelo base Qwen3.5-2B antes de cualquier despliegue.
- El proceso Heretic elimina los rechazos, lo que implica que el modelo puede generar contenido dañino, sesgado o inapropiado que el original filtraría; no es apto para aplicaciones orientadas al público sin moderación adicional.
- La divergencia KL de 0,1397 respecto al base indica una desviación no trivial en la distribución de salida; puede degradar capacidades en tareas que dependían del comportamiento original.
- La cuantización a 3 bits en el 78,66% de los pesos puede introducir pérdida de precisión en razonamiento complejo y matemáticas; el promedio de 5,342 bits/peso es bajo para un modelo de 2B.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no disponible; no planificar aplicaciones con ventanas largas sin verificarla empíricamente.
- El repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad; tratar los resultados declarados (0/100 rechazos, KL) como no auditados.
- Formato MLX: dependencia de hardware Apple; no hay garantía de portabilidad a CUDA o ROCm.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ2.7e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
- Heretic: https://heretic-project.org
