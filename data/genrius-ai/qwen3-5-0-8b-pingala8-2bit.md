# Genrius-AI/Qwen3.5-0.8B-Pingala8-2bit

## Resumen

Qwen3.5-0.8B-Pingala8-2bit es una cuantización de 2 bits del modelo base Qwen/Qwen3.5-0.8B, publicada por Genrius-AI (Harshit Goyal). El modelo original de Qwen emplea una arquitectura híbrida con atención Gated DeltaNet y capas de atención convencional, y esta versión lo comprime hasta un fichero GGUF de 0,35 GB mediante el método propietario Pingala-8, basado en codificación de trellis de cosets sobre estados pequeños (Small-State Coset Trellis Coding) a un régimen equivalente a IQ2_XXS.

La relevancia del artefacto es la relación calidad/tamaño en el extremo de compresión: el autor reporta una perplejidad de 25,97 en WikiText-2 (contexto 4096) frente a 85,09 de IQ2_XXS de llama.cpp con el mismo imatrix y un tamaño prácticamente idéntico (5,5 MB menos en Pingala-8). Esto lo sitúa como una opción para inferencia local en CPU y GPU de gama baja, aunque a costa de requerir un runtime parcheado: llama.cpp estándar, Ollama y LM Studio rechazan el fichero con error de carga.

El repositorio incluye únicamente el modelo de texto: la torre de visión y el bloque de predicción multi-token (MTP) del Qwen3.5-0.8B original no están incluidos. La licencia es Apache-2.0, heredada del modelo base, y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención Gated DeltaNet y atención convencional (según tags del autor); cuantización Pingala-8 con trellis coding |
| Parametros totales | 413.842.944 (safetensors del modelo base); el autor denomina al modelo "0.8B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los benchmarks se midieron con contexto 4096) |
| Tipos de cuantizacion | 2 bits (Pingala-8); fichero GGUF único de 0,35 GB |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); requiere runtime Pingala-8 v2.5 o superior |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B presenta una arquitectura híbrida: capas con Gated DeltaNet (atención lineal con estado recurrente) combinadas con capas de atención convencional, según los tags `gated-deltanet` y `hybrid-attention` del repositorio. Esta versión no reentrena el modelo: aplica una compresión de pesos de 2 bits mediante el método Pingala-8, descrito por el autor como *Small-State Coset Trellis Coding at IQ2_XXS Size*, con un imatrix compartido con las referencias de llama.cpp. El resultado se empaqueta en un único GGUF de 0,35 GB.

Un detalle técnico relevante es el cambio de loader: los modelos pequeños de Qwen3.5 tienen 6 tensores lineales codificados por capa en cada capa DeltaNet, mientras que los runtimes Pingala-8 anteriores a v2.5 esperaban 7. El parche `patches/q35_loader_count_delta.patch` ajusta el recuento al valor `vr.n_linear` del fichero. El runtime v2.5 se basa en llama.cpp en el commit `7ac59a6` más un parche CUDA publicado. No se dispone de información sobre datos de entrenamiento, número de tokens, RLHF/DPO ni proceso de alineación del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo base (0,8B) y la compresión a 2 bits.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Inferencia local en CPU y GPU de gama baja gracias al tamaño de 0,35 GB.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), presumiblemente mediante el runtime Pingala-8.
- No incluye visión: la torre visual del modelo base fue descartada en esta cuantización.
- No incluye el bloque de predicción multi-token (MTP).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en dispositivos con VRAM mínima: el fichero de 0,35 GB permite ejecutar el modelo en GPUs de 4 GB o incluso en CPU, útil para prototipos y demos locales sin depender de la nube.
- Chat de demostración en navegador o entornos educativos: el espacio de Hugging Face del autor ejecuta un modelo similar en CPU, lo que ilustra el uso para enseñar conceptos de cuantización y decodificación en vivo.
- Procesamiento de texto en inglés y chino en pipelines embebidos: clasificación de texto, resumen corto o extracción de entidades en aplicaciones donde el presupuesto de memoria es el factor limitante.
- Evaluación comparativa de métodos de cuantización: sirve como referencia para investigadores que comparan Pingala-8 frente a IQ2_XXS, IQ2_KT y Q8_0 con la misma imatrix y el mismo modelo base.
- Generación de texto offline en portátiles sin GPU dedicada: con el runtime Pingala-8 v2.5 para Windows o Linux, el modelo arranca desde un script de un clic y abre una página de chat local.
- Filtrado y preprocesado de datos a gran escala: por su tamaño reducido, puede desplegarse en muchas instancias paralelas para tareas de etiquetado simple, siempre que la calidad requerida tolere la pérdida de la cuantización a 2 bits.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; fuente: logs en el repositorio de GitHub de Genrius-AI):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (test, contexto 4096) | Perplejidad (menor es mejor) | 25,9736 |
| HellaSwag (0-shot, llama-perplexity) | Accuracy (%) | 40,0 |
| WinoGrande (0-shot, llama-perplexity) | Accuracy (%) | 55,8 |
| ARC-Easy (0-shot, llama-perplexity) | Accuracy (%) | 48,77 |
| ARC-Challenge (0-shot, llama-perplexity) | Accuracy (%) | 25,42 |
| MMLU (0-shot, llama-perplexity) | Accuracy (%) | 29,43 |

Comparativa de perplejidad en WikiText-2 a tamaño similar, según la model card:

| Fichero | Cuantización | Tamano | WikiText-2 PPL |
|---|---|---|---|
| Qwen3.5-0.8B-Pingala8-2bit.gguf | Pingala-8, 2 bits | 0,35 GB | 25,97 |
| IQ2_XXS (llama.cpp, mismo imatrix) | 2 bits | 0,35 GB | 85,09 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2 bits | 0,31 GB | 35,39 |
| Q8_0 (llama.cpp) | 8 bits | 0,80 GB | 15,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,35 GB de pesos más overhead de contexto y runtime; cabe holgadamente en GPUs de 4 GB.
- GPU recomendadas: el runtime v2.5 está pensado para NVIDIA RTX 30/40/50 series con parche CUDA; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más; el despliegue en CPU es viable por el tamaño del fichero.
- Opciones de despliegue: exclusivamente el runtime Pingala-8 v2.5 (build de un clic para Windows y Linux, o instalador `curl` para Linux). llama.cpp estándar, Ollama y LM Studio no pueden cargar el fichero.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WikiText-2 PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Pingala8-2bit | 413,8 M (base) | no disponible | 25,97 | Apache-2.0 | GGUF con runtime parcheado |
| Qwen3.5-0.8B IQ2_XXS (llama.cpp) | 413,8 M (base) | no disponible | 85,09 | Apache-2.0 | GGUF en llama.cpp estándar |
| Qwen3.5-0.8B IQ2_KT (ik_llama.cpp) | 413,8 M (base) | no disponible | 35,39 | Apache-2.0 | GGUF en ik_llama.cpp |
| Qwen3.5-0.8B Q8_0 (llama.cpp) | 413,8 M (base) | no disponible | 15,67 | Apache-2.0 | GGUF en llama.cpp estándar |

## Limitaciones y advertencias

- El fichero no carga en llama.cpp estándar, Ollama ni LM Studio; requiere el runtime Pingala-8 v2.5 o superior, lo que limita la portabilidad y añade dependencia de un proyecto pequeño.
- La cuantización a 2 bits degrada la calidad de forma notable: la perplejidad de 25,97 frente a 15,67 de Q8_0 indica una pérdida sustancial, y los resultados en MMLU (29,43 %) y ARC-Challenge (25,42 %) son bajos en términos absolutos.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- No incluye visión ni el bloque MTP del modelo base, por lo que no debe esperarse paridad funcional con Qwen3.5-0.8B.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Riesgo de alucinación elevado por el tamaño del modelo base y la compresión agresiva; no recomendado para tareas de alta precisión sin validación.
- Sesgos: no se documentan sesgos específicos en la información disponible; hereda los del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero la obligación de usar un runtime parcheado puede complicar el cumplimiento y el soporte en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Genrius-AI/Qwen3.5-0.8B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del método y runtime: https://github.com/Genrius-AI/pingala8-llm
- Instrucciones de ejecución: https://genrius-ai.github.io/pingala8-llm/#run
- Instalador Linux: https://genrius-ai.github.io/pingala8-llm/install.sh
- Releases del runtime: https://github.com/Genrius-AI/pingala8-llm/releases/latest
- Demo en navegador (modelo similar en CPU): https://huggingface.co/spaces/harshit-genrius/pingala8-demo
- Modelo relacionado Qwen3.8-27B Pingala-8: https://huggingface.co/Genrius-AI/Qwen3.8-27B-Pingala8-2bit
- Modelo relacionado Qwen3.5-2B Pingala-8: https://huggingface.co/Genrius-AI/Qwen3.5-2B-Pingala8-2bit
