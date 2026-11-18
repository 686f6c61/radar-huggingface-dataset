# cHunter789/Qwen3.8-27B-i1-IQ4_KS_KT-GGUF

## Resumen
Qwen3.8-27B-i1-IQ4_KS_KT-GGUF es una cuantización de 4 bits en formato GGUF del modelo base Qwen/Qwen3.6-27B (26.895.998.464 parámetros), publicada por el usuario cHunter789. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a un objetivo muy concreto: que los aproximadamente 27.000 millones de parámetros quepan íntegramente en la VRAM de una GPU de consumo con 16 GB. Para ello se emplean los tipos de cuantización IQ4_KS e IQ4_KT desarrollados por ikawrakow en el proyecto ik_llama.cpp, junto con una matriz de importancia (imatrix) mixta procedente de mradermacher y ubergarm.

La relevancia de esta ficha no está en el modelo base, sino en las decisiones de ingeniería de la cuantización: el tensor `token_embd.weight` se eleva a q8_0 (lo que aumenta el tamaño de descarga pero no el consumo de VRAM, ya que por defecto se carga en RAM del sistema), y el uso de caché KV cuantizada en q4_0 permite extender el contexto hasta unos 110.000 tokens en una RTX 5070 Ti. El autor reporta velocidades de decodificación de 45 a 25 t/s y prefill superior a 1300 t/s en esa GPU, con una perplejidad de 8,2890 sobre un fragmento de *War and Peace* a 65.536 tokens de contexto, ligeramente mejor que la variante IQ4_XS de mradermacher (8,2955) en la misma prueba.

El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la información disponible no detalla la arquitectura interna ni los datos de entrenamiento. La licencia es Apache 2.0 y el repositorio acumula 16.611 descargas y 45 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.6-27B; pipeline image-text-to-text) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta ~110.000 tokens con caché KV q4_0 (105.000 en la configuración recomendada) |
| Tipos de cuantización | IQ4_KS e IQ4_KT (4 bits), tensor de embeddings en q8_0, caché KV q4_0 |
| Idiomas soportados | no disponible (el autor menciona mejora en interpretación de lenguas no inglesas gracias al q8_0 de embeddings) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.6-27B en los datos proporcionados: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. El pipeline declarado (image-text-to-text) indica que el modelo base acepta entradas de imagen y texto, pero se desconoce el codificador visual empleado.

La innovación técnica de esta publicación reside en el proceso de cuantización. Se utilizan los cuantos IQ4_KS e IQ4_KT de ik_llama.cpp, que aplican una matriz de importancia para asignar más bits a los pesos con mayor impacto en la perplejidad. El autor probó varias imatrix: la de bartowski dio resultados significativamente peores, la de ubergarm resultó comparable y la finalmente empleada es una mezcla de mradermacher y ubergarm. Además, el tensor de embeddings de tokens se promociona a q8_0; dado que ese tensor se carga por defecto en RAM del sistema y no en VRAM, el coste es solo de espacio en disco. La configuración recomendada activa flash-attention, fusión de QKV (`--merge-qkv`), decodificación especulativa con ngramas (`--spec-type ngram-mod:n_max=2`), modo de razonamiento con formato deepseek y un presupuesto de razonamiento de 32.000 tokens.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat compatible con Jinja.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado), aunque no se detallan las tareas visuales concretas soportadas.
- Modo de razonamiento explícito: el servidor admite `--reasoning on`, `--reasoning-format deepseek` y `--reasoning-budget`, con preservación del bloque de pensamiento entre turnos mediante `preserve_thinking`.
- Ajuste de esfuerzo de razonamiento mediante `reasoning_effort` en los kwargs de la plantilla de chat.
- Decodificación especulativa basada en ngramas para acelerar la generación.
- Soporte de contexto largo: hasta 105.000 tokens en la configuración validada por el autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para su despliegue como servicio.
- Capacidad multilingüe mejorada de forma indirecta por el q8_0 en el tensor de embeddings, según el autor.
- No se documenta soporte explícito de tool calling ni de flujos de agentes en la información disponible.

## Casos de uso
- Asistente conversacional con memoria larga en estación de trabajo de 16 GB: con 105.000 tokens de contexto se pueden mantener sesiones extensas o adjuntar documentación completa sin truncar, usando `llama-server` con caché KV q4_0.
- Análisis de documentos extensos en local: procesar informes, libros o expedientes de decenas de miles de tokens en una única pasada, con prefill superior a 1000 t/s según las mediciones del autor.
- Razonamiento asistido con traza explícita: el modo de razonamiento con formato deepseek y presupuesto configurable permite separar el proceso de pensamiento de la respuesta final, útil en tareas de depuración lógica o matemática.
- Despliegue en GPU de consumo para prototipado: una RTX 5070 Ti de 16 GB ejecuta el modelo completo en VRAM, lo que evita el offloading parcial a RAM y sus penalizaciones de latencia.
- Procesamiento de entradas mixtas imagen-texto: al heredar el pipeline image-text-to-text, puede emplearse en tareas de descripción o consulta sobre imágenes, siempre que se valide el soporte real en el runtime elegido.
- Servicio interno compatible con API de endpoints: el tag `endpoints_compatible` y el servidor llama-server con métricas permiten integrarlo en herramientas internas que consuman una API compatible con OpenAI.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de IQ4_KS/IQ4_KT frente a IQ4_XS en perplejidad y velocidad sobre el mismo modelo base.

## Benchmarks y rendimiento
Los únicos datos publicados en la información disponible son mediciones de perplejidad y velocidad realizadas por el autor, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Métrica | IQ4_XS (mradermacher) | IQ4_KT + attn_qkv IQ4_KS (cHunter789) |
|---|---|---|
| Perplejidad (n_ctx=65.536, 12 chunks) | 8,2955 ± 0,03221 | 8,2890 ± 0,03224 |
| Tiempo por pasada de perplejidad | 77,21 s | 84,14 s |
| Velocidad de prompt eval | 1048,14 t/s | 1004,07 t/s |
| Tiempo de carga | 2522,03 ms | 9369,56 ms |

Datos de velocidad en uso conversacional reportados por el autor en una RTX 5070 Ti, con configuración GPU-only de 16 GB y contexto de 105.000 tokens: decodificación de 45 t/s al inicio que decae hasta 25 t/s al final del contexto, y prefill superior a 1300 t/s. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM: el objetivo de diseño es 16 GB; el autor confirma que el modelo completo cabe en una GPU de 16 GB con `--n-gpu-layers 99`.
- GPU recomendadas: RTX 5070 Ti (mediciones del autor). El modelo está diseñado exclusivamente para GPUs NVIDIA; no se documenta soporte para AMD, Apple Silicon u otras plataformas.
- GPU de consumo: sí, en tarjetas NVIDIA de 16 GB. Por debajo de esa cifra sería necesario offloading parcial o reducir el contexto.
- Variable de entorno obligatoria: `export GGML_CUDA_ENABLE_UNIFIED_MEMORY=1` antes de arrancar el servidor.
- Runtime: ik_llama.cpp (imprescindible para los cuantos IQ4_KS e IQ4_KT). No se garantiza compatibilidad con llama.cpp estándar, Ollama, vLLM ni TGI.
- Memoria del sistema: el tensor `token_embd.weight` se carga en RAM, por lo que se requiere RAM libre adicional más allá de la VRAM.
- Herramienta de validación: `ctx-cliff.py`, proporcionada por el autor, para comprobar si la configuración de contexto cabe en la VRAM.
- Almacenamiento: el repositorio ocupa 44,5 GB, superior a lo habitual en un 4 bits por el tensor de embeddings en q8_0.
- Throughput estimado: 45 a 25 t/s de decodificación y más de 1300 t/s de prefill en RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| cHunter789/Qwen3.8-27B-i1-IQ4_KS_KT-GGUF | ~26,9 B | hasta ~110k (q4_0 KV) | IQ4_KS / IQ4_KT | Apache 2.0 | Perplejidad 8,2890; orientado a 16 GB VRAM NVIDIA |
| mradermacher/Qwen3.8-27B-i1-GGUF | ~26,9 B (mismo base) | no disponible | IQ4_XS entre otras | Apache 2.0 (heredada) | Perplejidad 8,2955; referencia directa en la comparación del autor |
| Qwen/Qwen3.6-27B (base) | ~26,9 B | no disponible | pesos originales | Apache 2.0 | Modelo sin cuantizar; requiere hardware muy superior a 16 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias
- Exclusivo para GPU NVIDIA: no hay soporte documentado para otras plataformas de cómputo.
- Dependencia de ik_llama.cpp: los cuantos IQ4_KS e IQ4_KT no son estándar en llama.cpp upstream, lo que limita las opciones de despliegue y complica las actualizaciones.
- Requiere `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1`; sin esa variable el comportamiento en 16 GB no está garantizado.
- El contexto máximo real depende de la configuración exacta de caché KV y batch; el autor recomienda validar con `ctx-cliff.py` antes de desplegar.
- La decodificación cae de 45 a 25 t/s a medida que se llena el contexto, lo que afecta a la experiencia en sesiones muy largas.
- Tamaño de descarga elevado (44,5 GB) por el tensor de embeddings en q8_0; no apto para entornos con almacenamiento ajustado.
- La cuantización a 4 bits introduce degradación respecto a los pesos originales; la perplejidad medida no sustituye a una evaluación de tareas.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática verificada; el propio autor solo afirma una mejora cualitativa en lenguas no inglesas.
- La model card está incompleta (el bloque de resultados de `ctx-cliff.py` aparece truncado), lo que impide verificar las mediciones de ajuste de contexto.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-27B y de las imatrix utilizadas.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse en producción sin pruebas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/cHunter789/Qwen3.8-27B-i1-IQ4_KS_KT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Cuantización de referencia IQ4_XS: https://huggingface.co/mradermacher/Qwen3.8-27B-i1-GGUF
- Proyecto ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Dataset de prueba (War and Peace, Project Gutenberg): https://www.gutenberg.org/files/2600/2600-0.txt
