# Genrius-AI/Qwen3.5-4B-Pingala8-2bit

## Resumen

Qwen3.5-4B-Pingala8-2bit es una cuantización de 2 bits del modelo Qwen3.5-4B de Alibaba, publicada por Genrius-AI (Harshit Goyal) bajo licencia Apache-2.0. No es un modelo nuevo ni un ajuste fino: es el mismo modelo base comprimido con un códec trellis propietario llamado Pingala-8, que sustituye la cuantización vectorial habitual de llama.cpp por un código de trellis con partición de conjuntos de 8 estados sobre símbolos de 4 pesos, precedido de una rotación de Hadamard aleatoria y del redondeo LDLQ de QuIP.

Su interés es de ingeniería de compresión: según las mediciones del autor, el archivo ocupa 1,51 GB (26,8 MB menos que el IQ2_XXS equivalente) y obtiene una perplejidad de 10,9693 en WikiText-2 frente a 14,75 del IQ2_XXS de llama.cpp y 12,07 del IQ2_KT de ik_llama.cpp, acercándose más al Q8_0 (8,91) que a sus competidores de 2 bits. La arquitectura del modelo base es híbrida: 24 capas Gated DeltaNet y 8 capas de atención completa con compuerta.

La contrapartida es operativa: el archivo solo carga con una build parcheada de llama.cpp con backend CUDA, y no funciona con llama.cpp estándar, Ollama ni LM Studio. Además, esta versión es solo texto: la torre de visión y el bloque de predicción multi-token (MTP) del Qwen3.5-4B original no están incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet (atención lineal con estado) + 8 capas de atención completa con compuerta |
| Parámetros totales | 1.696.421.776 según el recuento de safetensors del repositorio; el modelo base se distribuye comercialmente como Qwen3.5-4B (véase limitaciones) |
| Parámetros activos | No aplica: la model card no describe el modelo como MoE |
| Longitud de contexto | No especificada para este archivo. El modelo base Qwen3.5-4B se anuncia con 262.144 tokens en fuentes secundarias, dato no verificado en esta cuantización |
| Tipos de cuantización | Pingala-8 2-bit (trellis de 8 estados, símbolos de 4 pesos) en 224 tensores lineales; ssm_alpha en Q4_0 (0,6 MB); el resto de tensores copiados del IQ2_XXS original |
| Idiomas soportados | en, zh (según la model card). El modelo base declara una cobertura mucho mayor, no verificada en este archivo |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, dividido en 2 shards (`-00001-of-00002.gguf` y `-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B combina dos mecanismos de atención en 32 capas: 24 capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente y compuerta, y 8 capas de atención completa también con compuerta. Esta mezcla busca reducir el coste del contexto largo manteniendo la capacidad de recuperación exacta en las capas de atención densa. Sobre esta arquitectura, Genrius-AI no entrena nada: aplica cuantización post-entrenamiento.

El procedimiento de compresión cuantiza los 224 tensores lineales del modelo (attn_qkv, attn_gate, ssm_beta y ssm_out en las capas DeltaNet; attn_q, attn_k, attn_v y attn_output en las de atención; y las tres matrices FFN en todas). Cada tensor usa un código trellis con partición de conjuntos de Ungerboeck de 8 estados sobre símbolos de 4 pesos, tras una rotación de Hadamard aleatoria y el redondeo LDLQ de QuIP, con una clase de tasa por tensor y escalas de columna acotadas por la cota de incoherencia (la receta «B4» del release de Qwen3-4B). Las matrices Hessianas por capa se calculan con 256 secuencias de 2048 tokens de texto C4, propagadas a través del modelo en bf16 capa a capa. Los tensores no lineales (embedding y salida atada, normas, conv1d y los parámetros de compuerta de DeltaNet) se copian del archivo IQ2_XXS de llama.cpp. El autor indica que fue una única build, con la receta y la regla de publicación fijadas antes de medir ningún resultado de 2 bits. No se aplicó RLHF ni DPO en esta publicación.

## Capacidades

- Generación de texto y conversación multi-turno (`text-generation`, etiqueta `conversational`).
- Modelo solo texto: la torre de visión del Qwen3.5-4B no está incluida, por lo que no procesa imágenes ni vídeo.
- Sin bloque MTP (*multi-token prediction*), por lo que no se beneficia de decodificación especulativa integrada en el modelo.
- Idiomas declarados: inglés y chino. No hay evaluación de otros idiomas en esta cuantización.
- Razonamiento y conocimiento limitados por la compresión: MMLU 35,51 % y ARC-Challenge 43,48 % según el propio autor.
- Soporte de tool calling / function calling: no documentado ni evaluado en esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en esta cuantización.
- Capacidad de razonamiento explícito (*thinking mode*): el modelo base la anuncia, pero no se ha verificado su conservación tras la cuantización de 2 bits.

## Casos de uso

- Inferencia local en GPU de gama de entrada: con 1,51 GB de pesos, el modelo cabe en tarjetas NVIDIA con 4 GB o más del rango RTX 30/40/50, lo que permite ejecutar un LLM conversacional en equipos donde un 4B en bf16 no entraría.
- Prototipado offline sin conexión: al ser un GGUF único (dos shards) y no requerir API externa, sirve para demos en portátiles o entornos aislados donde no se puede llamar a un servicio en la nube.
- Evaluación de técnicas de compresión: es un artefacto de referencia parainvestigadores que comparan códecs trellis frente a cuantización vectorial (IQ2_XXS, IQ2_KT) a igualdad de bytes, con perplejidad medida sobre WikiText-2.
- Generación de texto auxiliar de bajo coste: borradores, resúmenes cortos o reformulación de textos en inglés o chino donde la latencia y el consumo de VRAM priman sobre la precisión factual.
- Clasificación y etiquetado por lotes: tareas de etiquetado simple con prompts cortos, desplegadas sobre un único proceso llama.cpp parcheado, sin necesidad de infraestructura de servido.
- Sustitución directa de IQ2_XXS en pipelines existentes: cualquier flujo que ya use llama.cpp con un archivo de 2 bits del mismo modelo puede cambiar el GGUF y obtener, según el autor, 3,78 puntos menos de perplejidad en WikiText-2 pagando 26,8 MB menos de disco.
- Docencia y experimentación con arquitecturas híbridas: permite inspeccionar el comportamiento de un modelo con 24 capas DeltaNet y 8 de atención completa en un tamaño manejable.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con `llama-perplexity` y registrados en el repositorio de código. Ninguno está verificado de forma independiente (`verified: false`).

| Benchmark | Configuración | Métrica | Resultado |
|---|---|---|---|
| WikiText-2 (test, contexto 4096) | wikitext-2-raw-v1 | Perplejidad (menor es mejor) | 10,9693 |
| HellaSwag | 0-shot | Accuracy | 61,9 % |
| WinoGrande | 0-shot | Accuracy | 65,19 % |
| ARC-Easy | 0-shot | Accuracy | 62,98 % |
| ARC-Challenge | 0-shot | Accuracy | 43,48 % |
| MMLU | 0-shot | Accuracy | 35,51 % |

Comparación de perplejidad en WikiText-2 declarada en la model card:

| Archivo | Cuantización | Tamaño | Perplejidad WikiText-2 |
|---|---|---|---|
| Pingala-8 (este modelo) | 2 bits | 1,51 GB | 10,97 |
| IQ2_XXS (llama.cpp, misma imatrix) | 2 bits | 1,54 GB | 14,75 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2 bits | 1,44 GB | 12,07 |
| Q8_0 (llama.cpp) | 8 bits | 4,5 GB | 8,91 |

No se han publicado en la información disponible resultados del modelo base en bf16 para estas mismas tareas, por lo que no es posible cuantificar la pérdida exacta frente al original.

## Requisitos de hardware

- VRAM estimada: 1,51 GB solo para pesos; con caché KV y contexto moderado, una estimación razonable es 2-3 GB totales. Conviene reservar al menos 4 GB de VRAM.
- GPU compatibles: la model card especifica CUDA sobre NVIDIA RTX de series 30, 40 y 50. No se mencionan otros backends.
- GPU de centro de datos (A100, H100): no documentadas; el modelo es lo bastante pequeño como para no necesitarlas, pero no hay confirmación de que el parche compile o funcione en esas arquitecturas.
- CPU: no soportado. El archivo no carga con llama.cpp estándar ni con Ollama ni LM Studio.
- Despliegue: exclusivamente mediante una build parcheada de llama.cpp (`patches/llama_cuda_vs_7ac59a6.patch`, commit `7ac59a6`). Se pasa el shard `-00001-of-00002.gguf` como entrada. El autor advierte que la build de un clic no se ha probado con este archivo.
- vLLM, TGI, Ollama, LM Studio y llama.cpp sin parchear: no soportados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Genrius-AI/Qwen3.5-4B-Pingala8-2bit | 1,696 B (según safetensors) | No especificado para el archivo | Pingala-8 2-bit, 1,51 GB | 10,97 | Apache-2.0 | GGUF en HF; requiere llama.cpp parcheado |
| Qwen3.5-4B IQ2_XXS (llama.cpp) | Qwen3.5-4B | Igual al base | IQ2_XXS 2-bit, 1,54 GB | 14,75 | Apache-2.0 (heredada) | llama.cpp estándar |
| Qwen3.5-4B IQ2_KT (ik_llama.cpp) | Qwen3.5-4B | Igual al base | IQ2_KT 2-bit, 1,44 GB | 12,07 | Apache-2.0 (heredada) | ik_llama.cpp |
| Qwen3.5-4B Q8_0 (llama.cpp) | Qwen3.5-4B | Igual al base | Q8_0 8 bits, 4,5 GB | 8,91 | Apache-2.0 (heredada) | llama.cpp estándar |

La ventaja de este archivo es la relación perplejidad/bytes y la compatibilidad de licencia; la desventaja es la dependencia de un runtime parcheado que los otros tres no necesitan. No se dispone de datos para comparar con otras cuantizaciones de 2 bits de la familia Qwen3.5 publicadas por terceros.

## Limitaciones y advertencias

- Dependencia de runtime: solo funciona con una build parcheada de llama.cpp sobre CUDA. Cualquier actualización del repositorio upstream puede romper la compatibilidad, y el autor no garantiza que la build automatizada funcione con este archivo.
- Degradación por compresión: MMLU 35,51 % y ARC-Challenge 43,48 % sitúan el modelo muy por debajo de lo esperable en un 4B sin cuantizar. No es adecuado para razonamiento complejo, matemáticas ni código en producción.
- Benchmarks no verificados: los seis resultados están marcados como `verified: false` y proceden de mediciones del propio autor con `llama-perplexity`; no hay replicación independiente.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, con publicación y actualización el mismo día. No existe evidencia de uso en producción.
- Solo texto: no incluye la torre de visión ni el bloque MTP del modelo base, pese a que las etiquetas y la documentación del base los mencionan. No debe usarse para tareas multimodales.
- Idiomas: únicamente inglés y chino declarados. El rendimiento en castellano no está evaluado y, dado el nivel de compresión, es previsiblemente peor que en los idiomas de entrenamiento.
- Discrepancia de parámetros: el recuento de safetensors (1.696.421.776) no concuerda con la denominación comercial «4B» del modelo base. Conviene verificar el dato antes de usarlo en cálculos de presupuesto.
- Riesgo de alucinación: la cuantización agresiva a 2 bits incrementa la probabilidad de degradación factual y de repeticiones; no se ha medido con métricas de factualidad.
- Licencia: los pesos son Apache-2.0, heredada del modelo base. El parche de runtime se distribuye en el repositorio de GitHub y su licencia debe consultarse por separado antes de un uso comercial.
- Sin datos de latencia ni throughput: no es posible estimar el coste por token sin medirlo en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Genrius-AI/Qwen3.5-4B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Release previo con la misma receta (Qwen3-4B Pingala-8): https://huggingface.co/Genrius-AI/Qwen3-4B-Pingala8-2bit
- Código y parche de runtime: https://github.com/Genrius-AI/pingala8-llm
- README del repositorio: https://github.com/Genrius-AI/pingala8-llm/blob/main/README.md
- Artículo metodológico (preprint v2.4): *Small-State Coset Trellis Coding at IQ2_XXS Size: An Equal-Bytes Study in llama.cpp*, DOI https://doi.org/10.5281/zenodo.23481757
- Guía de ejecución local en Windows: https://dev.to/genrius_ai/how-to-run-a-4b-llm-locally-on-windows-with-a-small-nvidia-gpu-3-steps-249k
- Ficha del modelo base en Ollama: https://ollama.com/library/qwen3.5:4b
- Artículo divulgativo sobre Qwen3.5-4B: https://firethering.com/qwen3-5-4b-local-ai-model/
