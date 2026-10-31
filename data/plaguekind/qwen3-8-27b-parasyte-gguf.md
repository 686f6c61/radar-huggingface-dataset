# Plaguekind/Qwen3.8-27B-Parasyte-GGUF

## Resumen

Qwen3.8-27B-Parasyte-GGUF es una familia de cuantizaciones GGUF de alta precisión desarrollada por Plaguekind sobre el modelo *Qwen3.8-27B-Uncensored-HauhauCS-Aggressive* de HauhauCS, a su vez derivado de la arquitectura Qwen3.8 de 27 mil millones de parámetros. El objetivo del proyecto es llevar una calidad de cuantización cercana a Q8 a usuarios con GPUs de 24-32 GB de VRAM, mediante un enfoque de "combo quant": los tensores sensibles a la precisión (atención, estado SSM, normas, LM head y embeddings) se mantienen en Q8_0 o F32, mientras que la masa de parámetros de las FFN se comprime a niveles intermedios (Q5_K o Q4_K).

La relevancia de esta ficha radica en su metodología: en lugar de aplicar una cuantización uniforme, el autor redistribuye el presupuesto de precisión de forma selectiva, validando cada decisión con mediciones de perplejidad sobre un corpus in-domain y sobre wikitext-2. Los resultados publicados muestran que la variante Parasyte-Mid iguala la perplejidad de la referencia Q6_K_P con un tamaño 1,4 GiB menor. El modelo hereda el carácter "uncensored" de su modelo base, lo que lo orienta a usos sin filtros de alineación, con las advertencias correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 híbrido transformer + SSM (DeltaNet), con bloque MTP (nextn) integrado |
| Parametros totales | 27.320.697.856 (27,321 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, F32, Q6_K, Q5_K, Q4_K (mezcla por tensor); variantes: Parasyte (7,25 bpw), Parasyte-Mid (7,15 bpw), Parasyte-Low (6,83 bpw), old/Parasyte-Low (6,72 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp), con imatrix |

## Arquitectura y entrenamiento

El modelo base combina bloques transformer con bloques SSM DeltaNet, un diseño híbrido que reduce el coste de la atención en contexto largo. Incluye un bloque MTP (multi-token prediction, etiquetado como "nextn") integrado en los archivos GGUF, lo que permite decodificación especulativa en llama.cpp para aumentar el throughput. La familia consta de 866 tensores por variante.

Respecto al entrenamiento del modelo original, no hay datos publicados en la ficha: no se especifican tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO. Lo que sí documenta la model card es el proceso de cuantización: se parte del archivo Q8_K_P de HauhauCS (31,5 GiB) y se re-cuantiza con `llama-quantize --imatrix --allow-requantize`, usando una matriz de importancia calculada sobre un corpus held-out y un archivo de tipos de tensor que fija explícitamente los 866 tensores. La receta final eleva `token_embd` de Q6_K a Q8_0 y los 48 tensores `ssm_beta` (modulador multiplicativo del camino DeltaNet) de Q5_K a F32, tras verificar empíricamente que esta asignación supera a alternativas como subir `attn_gate`. Parasyte-Low no es una re-cuantización sino un injerto: los tensores sensibles de Parasyte se copian byte a byte sobre el archivo old/Parasyte-Low, verificado con sha256.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Modelo "uncensored": sin filtros de alineación heredados del base model HauhauCS-Aggressive.
- Decodificación especulativa mediante el bloque MTP (nextn) incluido en el GGUF.
- Seguimiento de estado en contexto largo potenciado por los bloques DeltaNet con `ssm_beta` en F32.
- Ejecución local eficiente en GPUs de 24-32 GB gracias al diseño de la cuantización.
- No hay información sobre tool calling, capacidades de visión, audio ni razonamiento estructurado (thinking mode).

## Casos de uso

- Chatbot local sin filtros: al ser uncensored y conversacional, puede desplegarse en llama.cpp u Ollama para asistentes personales que respondan sin las restricciones de alineación habituales, bajo responsabilidad del usuario.
- Inferencia en GPU consumer de gama alta: la variante Parasyte-Mid (22,75 GiB) cabe en una RTX 3090/4090 de 24 GB con contexto moderado, ofreciendo calidad cercana a Q6_K_P sin necesitar 32 GB de VRAM.
- Procesamiento de documentos largos: el camino DeltaNet con `ssm_beta` en F32 está optimizado para preservar el seguimiento de estado en contexto largo, útil para resumen y análisis de textos extensos.
- Servidores de inferencia caseros con 32 GB: la variante Parasyte completa (23,07 GiB) deja margen para KV cache y contexto amplio en una RTX 5090 o A6000 de 32-48 GB.
- Benchmarking de técnicas de cuantización: la documentación detallada de perplejidad y distribución de dtypes la convierte en referencia útil para quien investigue combo quants y reallocation de precisión.
- Escritura creativa y roleplay: el base model aggressive/uncensored y la alta fidelidad de la cuantización (perplejidad in-domain 3,38) son adecuados para generación de narrativa sin censura.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad (PPL) con llama.cpp, no benchmarks estándar tipo MMLU o HumanEval.

**Epoch A (2026-10-19):**

| Modelo | Tamaño | PPL in-domain | PPL wikitext-2 |
|---|---|---|---|
| Parasyte-Mid | 22,75 GiB | 3,3795 | 6,9113 |
| old/Parasyte-Low | 21,40 GiB | 3,8175 (media por chunks, cota superior) | 6,4911 (ídem) |
| HauhauCS Q6_K_P (referencia) | 24,14 GiB | 3,4161 | 6,9002 |

**Epoch B (2026-10-20):**

| Modelo | Tamaño | PPL in-domain | PPL wikitext-2 |
|---|---|---|---|
| Parasyte | 23,07 GiB | 3,3831 | 6,9119 |
| HauhauCS Q6_K_P (control) | 24,14 GiB | 3,3795 | 6,9113 |

Conclusiones del autor: Parasyte-Mid iguala o mejora marginalmente la perplejidad de Q6_K_P siendo 0,44 bpw más ligero (1,4 GiB menos); Parasyte la iguala dentro de los márgenes de error (±0,031 / ±0,051) siendo 0,34 bpw más ligero. No se han publicado resultados de MMLU, GSM8K, HumanEval ni benchmarks similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Parasyte 23,07 GiB; Parasyte-Mid 22,75 GiB; Parasyte-Low 21,72 GiB; old/Parasyte-Low ~21,4 GiB. Añadir margen para KV cache y contexto (2-4 GiB según longitud).
- GPUs recomendadas: RTX 4090 / RTX 3090 (24 GB) para las variantes Mid y Low con contexto moderado; RTX 5090 (32 GB) o A6000/RTX 6000 Ada (48 GB) para Parasyte completo con contexto largo.
- Sí cabe en GPU consumer: las cuatro variantes caben en una GPU de 24 GB, siendo este precisamente el objetivo declarado del proyecto ("bring Q8 quant to 24-32gb users").
- Despliegue: llama.cpp (formato nativo GGUF, con soporte del bloque MTP/nextn para decodificación especulativa); compatible con Ollama y LM Studio al ser GGUF estándar. No se menciona soporte vLLM/TGI.
- Latencia y throughput: no disponibles; el bloque MTP integrado sugiere aceleración de la generación cuando llama.cpp lo aproveche.
- Alternativa CPU/offload: al ser GGUF, es posible offload parcial de capas a CPU, con la penalización de velocidad correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño GGUF | bpw | PPL in-domain | Licencia |
|---|---|---|---|---|---|
| Parasyte (esta ficha) | 27,321 B | 23,07 GiB | 7,25 | 3,3831 | Apache 2.0 |
| Parasyte-Mid (misma familia) | 27,321 B | 22,75 GiB | 7,15 | 3,3795 | Apache 2.0 |
| HauhauCS Q6_K_P (referencia) | 27,321 B | 24,14 GiB | no disponible | 3,4161 | no disponible |
| HauhauCS Q5_K_P (stock) | 27,321 B | ~20,4 GiB | no disponible | no medido | no disponible |

Frente a la referencia Q6_K_P, las variantes Parasyte ofrecen perplejidad equivalente con 1-1,4 GiB menos de archivo, a costa de un proceso de cuantización menos estándar. No hay datos comparativos frente a otros modelos de 27-32 B de terceros (Gemma 3 27B, Qwen3 32B, etc.).

## Limitaciones y advertencias

- Modelo "uncensored": carece de los filtros de seguridad del modelo original de Qwen. Esto implica riesgo elevado de generar contenido ofensivo, dañino o ilegal; su despliegue en producción exige controles adicionales por parte del integrador.
- Riesgo de alucinación: no evaluado; al ser un fine-tune uncensored agresivo, la fiabilidad factual puede ser inferior a la del modelo base oficial de Qwen.
- Longitud de contexto: no especificada en la ficha; verificar en el modelo base antes de planificar cargas de trabajo con documentos largos.
- Idiomas: no documentados; asumir predominio de inglés y chino heredado de la familia Qwen, sin garantías para castellano.
- La perplejidad publicada es una métrica del propio autor con metodología particular (corpus in-domain propio, medición por chunks en una variante); no sustituye a benchmarks independientes de capacidades.
- La re-cuantización con `--allow-requantize` desde Q8_K_P puede introducir degradaciones no capturadas por la PPL en tareas de generación complejas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia y términos del modelo base Qwen3.8 upstream.
- Proyecto comunitario de un autor individual, con 1.041 descargas y sin validación de terceros: tratar como experimental para entornos de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Plaguekind/Qwen3.8-27B-Parasyte-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive
- Soporte del autor (financiación RTX 5090): https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
- Paper, demo y repositorio de código: no disponibles
