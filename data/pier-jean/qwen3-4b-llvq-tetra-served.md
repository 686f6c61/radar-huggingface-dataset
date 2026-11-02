# Pier-Jean/Qwen3-4B-LLVQ-Tetra-served

## Resumen

Qwen3-4B-LLVQ-Tetra-served es una cuantización extrema del modelo Qwen3-4B de Alibaba, publicada por el desarrollador independiente Pier-Jean bajo licencia Apache 2.0. El modelo comprime los pesos de Qwen3-4B a 2,73 bits por parámetro mediante cuantización vectorial sobre la retícula de Leech (Λ₂₄), almacenando bloques de 24 pesos en 48 bits. El resultado es un fichero de 1,38 GB que se decodifica y multiplica directamente en un kernel CUDA fusionado, sin materializar nunca los pesos en precisión completa.

La relevancia de esta ficha reside en su enfoque: no es una cuantización convencional (GPTQ, AWQ o GGUF), sino un formato propietario denominado LLVQ (Leech Lattice Vector Quantization) que requiere un motor de inferencia propio escrito en Rust. El repositorio incluye dos configuraciones de servicio sobre el mismo fichero de pesos: una "shipped" con la que se midieron todos los benchmarks publicados, y una "grouped" que acelera la decodificación en contextos largos a costa de desviaciones numéricas acotadas.

El modelo conserva capacidades notables para su nivel de compresión: 63,37 en MMLU (5-shot) y 82,49 en GSM8K (zero-shot), frente a 70,14 y 92,12 del original en FP16. Es, por tanto, un objeto de interés para investigación en cuantización extrema y para despliegues con restricciones severas de VRAM, no para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos cuantizados con retícula de Leech Λ₂₄ |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens medidos en las pruebas de velocidad; contexto nativo de Qwen3-4B no confirmado en la información disponible |
| Tipos de cuantizacion | LLVQ a 2,73 bits por parámetro (48 bits por bloque de 24 pesos); dos configuraciones de servicio (shipped y grouped) |
| Idiomas soportados | en (según model card); el modelo base Qwen3-4B es multilingüe, pero la cuantización solo declara inglés |
| Licencia | apache-2.0 |
| Formato de pesos | binario propietario `qwen3-4b-sealed.bin` (1,38 GB), servido por el motor LLVQ; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder-only de 4 mil millones de parámetros. Sobre él se aplica LLVQ, una cuantización vectorial que agrupa los pesos en bloques de 24 y los codifica como puntos de la retícula de Leech Λ₂₄, almacenando 48 bits por bloque. La decodificación se realiza mediante un kernel CUDA fusionado que multiplica directamente desde la representación comprimida, evitando la reconstrucción densa de los pesos en memoria. La model card no detalla el proceso de calibración ni el dataset empleado para ajustar la cuantización.

La innovación técnica principal documentada es la configuración "grouped" del mecanismo de atención. La ruta "shipped" concatena todo el historial en cada paso y copia cada una de las 8 cabezas key/value a las 4 cabezas query que las leen, moviendo unos 17 GB de caché KV por token a 8.192 posiciones. La ruta "grouped" apila las cabezas query de una misma cabeza key como filas de un único matmul y lee cada byte de caché una sola vez, sobre un búfer que crece por bloques y se escribe in situ. Esto introduce diferencias numéricas por redondeo de cuBLAS (hasta 6,6e-2 en un logit), acotadas mediante tolerancia: +0,0095 % de perplejidad en WikiText-2 en decodificación teacher-forced y 99,788 % de acuerdo top-1 sobre 49.140 pasos. No se documenta RLHF ni DPO específico para esta cuantización.

## Capacidades

- Generación de texto en inglés con calidad degradada respecto al modelo base (6,77 puntos MMLU y 9,63 puntos GSM8K por debajo de FP16).
- Razonamiento aritmético de varios pasos, con 82,49 en GSM8K zero-shot.
- Conocimiento general evaluado en MMLU 5-shot (63,37 sobre 14.042 preguntas).
- Inferencia con contexto largo: se han medido velocidades hasta 8.192 tokens de prompt.
- Dos modos de servicio intercambiables sobre el mismo fichero de pesos: "shipped" (bit a bit, con todos los benchmarks publicados) y "grouped" (más rápido en contexto largo, con tolerancia numérica acotada).
- Tool calling, function calling y capacidades de agente: no documentadas en la información disponible para esta cuantización.
- Capacidades multimodales, de audio o modo thinking explícito: no documentadas en la información disponible.

## Casos de uso

- Investigación en cuantización extrema: reproducir las mediciones del paper asociado (arXiv:2603.11021) sobre el repositorio "sealed", que contiene los bytes exactos bajo los que se tomaron los resultados. Adecuado porque el autor separa deliberadamente un repositorio inmutable (sealed) de otro que actualiza cifras (served).
- Despliegue en GPUs con VRAM muy limitada: el fichero de 1,38 GB cabe holgadamente en tarjetas de 8 GB, permitiendo servir un modelo de 4B en hardware donde FP16 (8,04 GB) no cabría. Adecuado por la relación calidad/tamaño medida (63,37 MMLU a 2,73 bits).
- Evaluación comparativa de formatos de compresión: emplear el modelo como referencia frente a AWQ w4g128 (5,30 bits, 68,14 MMLU) o IQ2_XXS (2,48 bits, 39,78 MMLU) en estudios de compromiso bits/calidad.
- Generación de texto en inglés con latencia interactiva en batch 1: la configuración grouped alcanza 133,3 tok/s tras un prompt de 5 tokens en una L40S, útil para asistentes de texto corto donde la VRAM es el cuello de botella.
- Procesamiento de documentos largos en inglés: con 77,5 tok/s de decodificación a 8.192 tokens de contexto (configuración grouped), es viable resumir o extraer información de textos extensos, aceptando que el prefill de 35 s domina la latencia inicial.
- Estudio del impacto del redondeo en atención GQA: la comparación shipped/grouped con intervalos de confianza publicados sirve como caso práctico para analizar cómo variaciones numéricas en el matmul de atención afectan a la perplejidad y al acuerdo top-1.

## Benchmarks y rendimiento

| Metrica | LLVQ 2,73 bits | FP16 | AWQ w4g128 | IQ2_XXS |
|---|---|---|---|---|
| Bits por parámetro (modelo completo) | 2,73 | 16,00 | 5,30 | 2,48 |
| Bytes de pesos | 1,38 GB | 8,04 GB | 2,67 GB | 1,25 GB |
| MMLU 5-shot (14.042 preguntas) | 63,37 | 70,14 | 68,14 | 39,78 |
| GSM8K zero-shot (1.319 problemas) | 82,49 | 92,12 | 89,01 | no evaluado |
| Perplejidad WikiText-2 | 12,58 | 12,24 | 13,52 | no evaluado |

Diferencias pareadas con intervalos de confianza del 95 %: 6,77 puntos MMLU [6,05; 7,50] y 9,63 puntos GSM8K [7,69; 11,57] por debajo de FP16; 4,76 [4,02; 5,49] y 6,52 [4,39; 8,65] por debajo de AWQ.

Velocidad en una NVIDIA L40S, batch 1, mediana de cinco rondas:

| Prompt | Config. shipped (tok/s) | Config. grouped (tok/s) |
|---|---|---|
| 256 tokens tras prompt de 5 | 121,5 | 133,3 |
| Decode tras 2.048 tokens de contexto | 82,7 | 113,8 |
| Decode tras 4.096 tokens | 61,4 | 98,0 |
| Decode tras 8.192 tokens | 33,2 | 77,5 |

Tiempo hasta el primer token a 8.192 de prompt: 35,0 s (shipped) frente a 34,8 s (grouped).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,38 GB de pesos más caché KV y búferes; holgado en GPUs de 8 GB.
- GPU recomendadas: NVIDIA L40S es la única plataforma medida. El kernel requiere CUDA; el motor es Rust con feature `cuda`.
- En GPU consumer: el tamaño permite GPUs de gama media con 8 GB o más, pero no hay mediciones publicadas en RTX 4090, RTX 3090 u otras.
- Apple Silicon: solo funciona la configuración shipped, como reconstrucción densa; la configuración grouped se rechaza por nombre al no haberse medido en Metal.
- Opciones de despliegue: exclusivamente el motor LLVQ (`cargo run --release -p llvq-llm --features cuda --bin chat`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario.
- Latencia y throughput: 133,3 tok/s tras prompt corto y 77,5 tok/s a 8.192 tokens de contexto en L40S con la configuración grouped; el prefill de 8.192 tokens ronda los 35 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3-4B-LLVQ-Tetra (este) | 4B, 2,73 bits | 8.192 medidos | 63,37 | 82,49 | Apache 2.0 | LLVQ propietario |
| Qwen3-4B AWQ w4g128 | 4B, 5,30 bits | no disponible | 68,14 | 89,01 | Apache 2.0 | safetensors/AWQ |
| Qwen3-4B IQ2_XXS | 4B, 2,48 bits | no disponible | 39,78 | no evaluado | Apache 2.0 | GGUF |
| Qwen3-4B FP16 | 4B, 16 bits | no disponible | 70,14 | 92,12 | Apache 2.0 | safetensors |

Frente a IQ2_XXS, este formato gana 23,59 puntos de MMLU con solo 0,25 bits más por parámetro, a costa de requerir un motor dedicado. Frente a AWQ, pierde 4,76 puntos MMLU y 6,52 GSM8K, pero ocupa la mitad de espacio y no depende de ecosistemas estándar.

## Limitaciones y advertencias

- La configuración grouped no es bit a bit: mueve los logits hasta 6,6e-2 y hay pasos aislados con desviaciones de hasta 13,13 en un logit sin explicación documentada.
- Ningún benchmark de tarea (MMLU, GSM8K) se ha ejecutado bajo la configuración grouped; solo bajo la shipped.
- El modelo solo declara inglés, aunque el base Qwen3-4B es multilingüe; no hay garantía de calidad en otros idiomas.
- Riesgo de alucinación no cuantificado en la información disponible; la degradación de 6,77 puntos MMLU y 9,63 GSM8K respecto a FP16 sugiere mayor propensión a errores factuales y aritméticos.
- Dependencia total del motor LLVQ: no hay integración con vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en infraestructuras estándar.
- Las velocidades son de una única NVIDIA L40S en batch 1; no se han medido otros tamaños de batch ni otras GPUs.
- En Apple Silicon solo funciona la configuración shipped, y como reconstrucción densa (sin la ventaja de memoria del formato comprimido).
- El prefill de contextos largos (~35 s a 8.192 tokens) domina la latencia de la primera respuesta.
- Licencia Apache 2.0 permite uso comercial, pero la viabilidad práctica depende de mantener un motor Rust/CUDA propio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- HuggingFace (repositorio served): https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-served
- HuggingFace (repositorio sealed, referencia de benchmarks): https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del motor LLVQ: https://github.com/pjmalandrino/llvq
- Paper referenciado: arXiv:2603.11021
