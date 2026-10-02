# Pier-Jean/Qwen3-4B-LLVQ-Tetra

## Resumen

Qwen3-4B-LLVQ-Tetra es un artefacto de investigación publicado por Pier-Jean (Pier-Jean Malandrino) que contiene los pesos de Qwen/Qwen3-4B almacenados a 2,73 bits por parámetro sobre el modelo completo, embeddings incluidos, en 1,41 GB de safetensors que permanecen comprimidos en memoria. La mayor parte de las matrices de pesos se codifica sobre el retículo de Leech Λ₂₄ con Tetra, un libro de códigos que una GPU lee tal cual está almacenado mediante un kernel fusionado que descomprime y multiplica en una sola pasada. Implementa de forma independiente en Rust el método descrito en arXiv:2603.11021 (van der Ouderaa, van Baalen, Whatmough y Nagel, 2026).

El repositorio es la variante que lee `transformers`; la misma pieza empaquetada como fichero único para el motor Rust está en Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed, y ambas comparten el digest de artefacto 886391a8c03f66dc. No es un modelo listo para usar: requiere el lector `llvq-hf` (todavía no publicado en PyPI) y un `import llvqhf` que resulta imprescindible, porque en su ausencia `transformers` avisa de un tipo de cuantización desconocido y carga el fichero como si fuese denso, fallando en las claves.

Su relevancia es la compresión extrema con utilidad práctica: 1,38 GB de pesos frente a 8,04 GB en FP16, con una pérdida medida de 6,77 puntos de MMLU y 9,63 puntos de GSM8K frente a FP16 sobre las mismas preguntas. Las cifras de calidad y velocidad proceden del motor Rust, no de este cargador: lo único verificado a través del cargador de `transformers` es la identidad de tokens (256 tokens greedy sobre cuatro prompts) en CPU, en Metal con todas las proyecciones comprimidas y en una NVIDIA L4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), pesos cuantizados con LLVQ sobre retículo de Leech Λ₂₄ y códec Tetra |
| Parámetros totales | Modelo base Qwen/Qwen3-4B (denominación comercial de 4B); este repo contiene 1.332.236.336 elementos codificados en safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen/Qwen3-4B) |
| Tipos de cuantización | 2,73 bits por parámetro de media en el modelo completo; Tetra (Lech lattice, 48 bits por bloque de 24 pesos, una escala por fila, cola pequeña sin cuantizar) en 168 de las 252 proyecciones; int4 con grupos de 128 en `v_proj` y `o_proj` de todas las capas y en `down_proj` de las capas 12 a 23; int4 con grupos de 64 en el embedding atado a la cabeza de salida; f16 en las normas y en lo que el cuantizador no toca |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,4 GB de repo, 1,38 GB de pesos) con bloque `quantization_config` por registro; existe también el fichero sellado único `Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed` para el motor Rust |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B (transformer decoder-only con atención causal). La innovación está en la representación de los pesos: la mayoría de matrices se codifica sobre el retículo de Leech Λ₂₄ mediante Tetra, con 48 bits por bloque de 24 pesos, una escala por fila y una cola pequeña sin cuantizar. Un libro de códigos que la GPU lee tal como está almacenado permite que un kernel fusionado descomprima y multiplique en una sola pasada, evitando materializar la matriz densa. El resto de proyecciones se guarda en int4 (grupos de 128) o en f16, según el caso.

Los códigos se ajustaron con correcciones de estilo GPTQ sobre 131.072 tokens de DCLM-edu. Posteriormente se reentrenó la escala de cada fila de pesos contra el modelo FP16 manteniendo los códigos congelados. El `config.json` incluye un descriptor por registro con tipo, forma, número de bloques, ancho de la cola y tabla de rotación utilizada; `llvq-digest.json` guarda un SHA-256 por campo del fichero sellado y `llvq-dense-digest.json` otro por matriz reconstruida, de modo que un lector puede verificarse campo a campo contra el decodificador Rust. El tokenizador, `vocab.json`, `merges.txt` y `generation_config.json` se copian literalmente de Qwen/Qwen3-4B en la revisión `1cfa9a7208912126459214e8b04321603b3df60c`, porque el empaquetador no los transporta y sin esa copia el tokenizador cargaría sin plantilla de chat.

## Capacidades

- Generación de texto en inglés con el mismo comportamiento conversacional del modelo base Qwen3-4B.
- Razonamiento aritmético y de sentido común degradado respecto a FP16: 82,49 en GSM8K zero-shot y 63,37 en MMLU 5-shot según el motor Rust.
- Dos modos de carga: rama densa, que descomprime cada registro a un peso denso en el momento de cargar (8,05 GB en f16, sin kernel ni compilador, funciona en CPU), y rama fusionada (`LLVQ_HF_FUSED=1`), que mantiene los pesos comprimidos y ejecuta un kernel fusionado para el matvec.
- Ejecución en CPU, en Apple silicon con Metal (252 de 252 proyecciones comprimidas, 2,750 GB en dispositivo) y en CUDA (168 de 252 fusionadas, con las 84 en int4 cayendo a denso).
- Verificación de integridad mediante digests SHA-256 por campo y por matriz reconstruida.
- No dispone de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito documentado en la información proporcionada; no se documenta tampoco capacidad multilingüe más allá del inglés.

## Casos de uso

- Investigación en cuantización extrema: reproducir y auditar el método Tetra/LLVQ partiendo de códigos y escalas publicados, comparando las matrices reconstruidas contra los digests SHA-256 por campo y por matriz.
- Evaluación de kernels fusión descompresión-multiplicación: medir el coste real de un matvec que decodifica en la misma pasada sobre retículo de Leech Λ₂₄, comparando la rama fusionada con la rama densa en CPU, Metal y CUDA.
- Comparativas de compresión de pesos: enfrentar el artefacto a AWQ w4g128 (5,30 bits por parámetro, 2,67 GB) e IQ2_XXS (2,48 bits por parámetro, 1,25 GB) con la misma carga de preguntas de MMLU y GSM8K.
- Inferencia en hardware de gama de consumo: con 1,38 GB de pesos y una rama densa de 8,05 GB en f16, cabe en GPUs de 12-24 GB y en equipos Apple silicon, sin necesidad de compilador si se usa la rama densa.
- Despliegue en CPU sin acelerador: la rama densa no requiere kernel ni compilador y funciona en CPU, lo que permite servir el modelo en entornos sin GPU para pruebas de viabilidad.
- Prototipado conversacional en inglés: generación de texto con plantilla de chat heredada de Qwen3-4B, útil para validar interfaces y flujos antes de comprometer pesos en FP16.
- Pruebas de reproducibilidad entre implementaciones: contrastar el fichero sellado (motor Rust) con este repositorio de `transformers` mediante identidad de tokens greedy, que es el criterio de aceptación usado por el autor.
- Banco de pruebas para portar LLVQ a otras arquitecturas: el código enruta por nombre de registro y no está acoplado a Qwen3, aunque solo se ha probado con Qwen3ForCausalLM.

## Benchmarks y rendimiento

Todas las cifras de la tabla están medidas con el motor Rust del autor sobre el fichero sellado en una NVIDIA L40S; ninguna se obtuvo a través del cargador de este repositorio.

| Métrica | Este fichero | FP16 | AWQ w4g128 | IQ2_XXS |
|---|---|---|---|---|
| Bits por parámetro (modelo completo) | 2,73 | 16,00 | 5,30 | 2,48 |
| Bytes de pesos | 1,38 GB | 8,04 GB | 2,67 GB | 1,25 GB |
| Decode, batch 1, motor propio | 113,8 tok/s | 83,1 (vLLM) | 200,5 (vLLM) | 312,9 (llama.cpp) |
| MMLU, 5-shot, 14.042 preguntas | 63,37 | 70,14 | 68,14 | 39,78 |
| GSM8K, zero-shot, 1.319 problemas | 82,49 | 92,12 | 89,01 | sin puntuación |

Diferencias emparejadas sobre las mismas preguntas, con intervalos al 95 %:

| Métrica | Por debajo de FP16 | Por debajo de AWQ |
|---|---|---|
| MMLU | 6,77 [6,05; 7,50] | 4,76 [4,02; 5,49] |
| GSM8K | 9,63 [7,69; 11,57] | 6,52 [4,39; 8,65] |

El autor advierte que las velocidades de dos motores distintos no se dividen entre sí (vLLM ejecuta FP16 más rápido que el motor propio) y que el MMLU de AWQ se leyó en su propio arnés sobre los pesos convertidos a f16. A través de este cargador no existe tabla de calidad medida: solo se verifica identidad de tokens (256 tokens greedy sobre cuatro prompts, idénticos a los del motor) en CPU, en Metal con todas las proyecciones comprimidas y en una NVIDIA L4.

## Requisitos de hardware

- Rama densa (`LLVQ_HF_FUSED` sin definir): 8,05 GB de pesos al descomprimir a f16; funciona en CPU y no necesita kernel ni compilador. `save_pretrained` no hace round-trip.
- Rama fusionada en Apple silicon: el modelo cargado ocupa 2,750 GB en dispositivo con las 252 proyecciones comprimidas (medido), frente a 16,1 GB calculados para la rama densa en f32.
- Rama fusionada en CUDA: 168 de las 252 proyecciones permanecen comprimidas y 84 registros int4 caen a denso, porque el binding de CUDA incorpora el matvec de Tetra pero todavía no el de int4; el requisito de memoria queda por tanto entre el de la rama densa y el de la rama completamente fusionada. `llvqhf` imprime el recuento en lugar de dejar que se asuma.
- La rama fusionada compila los kernels al importar, por lo que requiere `ninja` y un compilador.
- GPUs empleadas en las mediciones del autor: NVIDIA L40S (benchmarks de calidad y decode) y NVIDIA L4 (identidad de tokens). No se especifican cifras de VRAM para A100, H100 o RTX 4090.
- Rendimiento publicado: 113,8 tok/s en decode con batch 1 con el motor Rust en L40S. No hay latencia ni throughput medidos a través de este cargador.
- Opciones de despliegue: `transformers` con `dtype="float32"` más el lector `llvq-hf` instalado desde GitHub (`pip install git+https://github.com/pjmalandrino/llvq.git#subdirectory=llvq-hf`), que no está en PyPI. Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, pero no se documenta compatibilidad efectiva con vLLM, TGI, Ollama o llama.cpp para este formato.

## Comparativa con modelos similares

| Modelo | Bits por parámetro | Bytes de pesos | MMLU (5-shot) | GSM8K (zero-shot) | Formato | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-4B-LLVQ-Tetra | 2,73 | 1,38 GB | 63,37 | 82,49 | safetensors LLVQ | Apache 2.0 |
| Qwen3-4B FP16 | 16,00 | 8,04 GB | 70,14 | 92,12 | safetensors | Apache 2.0 del modelo base |
| Qwen3-4B AWQ w4g128 | 5,30 | 2,67 GB | 68,14 | 89,01 | AWQ (4 bits, grupo 128) | no disponible |
| Qwen3-4B IQ2_XXS | 2,48 | 1,25 GB | 39,78 | sin puntuación | GGUF (llama.cpp) | no disponible |

La comparación de velocidad entre estos sistemas no es homogénea: las cifras de FP16 y AWQ proceden de vLLM, la de IQ2_XXS de llama.cpp y la de LLVQ-Tetra del motor Rust del propio autor. No se dispone de datos de otros modelos comparables de 2 bits fuera de los citados en la model card.

## Limitaciones y advertencias

- No hay ninguna cifra de calidad medida a través de este cargador; las de MMLU y GSM8K son del motor Rust. La puerta de aceptación es la identidad de tokens, que el propio autor califica de débil: un defecto equivalente al 8,79 % de una fila de matriz dejó intactos 64 tokens greedy en dos de cuatro prompts.
- Pérdida de calidad documentada frente a FP16: 6,77 puntos de MMLU y 9,63 puntos de GSM8K sobre las mismas preguntas, con intervalos al 95 % que no incluyen el cero.
- Solo se ha probado una arquitectura, `Qwen3ForCausalLM`. El código enruta por nombre de registro y no está acoplado a Qwen3, pero nada más se ha ensayado.
- `save_pretrained` no hace round-trip, lo que impide guardar y recargar el modelo en el mismo formato desde Python.
- Requiere el lector `llvq-hf`, no publicado en PyPI, y un `import llvqhf` obligatorio; sin él `transformers` carga el fichero como denso y falla.
- La rama fusionada necesita `ninja` y un compilador, ya que los kernels se compilan al importar.
- Idioma limitado al inglés según la model card; no se documentan capacidades multilingües.
- Artefacto de investigación, no un modelo listo para producción: el autor lo declara explícitamente como "research artifact, not a drop-in model".
- No se documentan tool calling, agentes, visión ni audio, por lo que no es apto para pipelines que dependan de esas capacidades.
- La model card proporcionada está truncada en la sección de limitaciones (a partir de `is_serializable() re...`), por lo que puede haber advertencias adicionales no recogidas aquí.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra
- Fichero sellado para el motor Rust: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed
- Implementación Rust y lector `llvq-hf`: https://github.com/pjmalandrino/llvq
- Artículo del método citado en la model card: https://arxiv.org/abs/2603.11021
- Artículo Tetra, Serving Leech-Lattice Quantized LLMs at 2.7 Bits per Parameter: https://arxiv.org/pdf/2609.35465
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
