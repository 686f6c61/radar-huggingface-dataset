# bcckfdn/cevher3-test-7

## Resumen

cevher3 (identificador `bcckfdn/cevher3-test-7`) es un modelo de lenguaje de tipo decoder-only publicado por el usuario bcckfdn en Hugging Face. Segun la model card, se trata de un modelo de 1.256.312.832 parametros (aproximadamente 1,25 mil millones) entrenado con la arquitectura "Gemma3-SWA", es decir, una variante de la familia Gemma 3 que incorpora atencion con ventana deslizante (sliding window attention). El modelo esta etiquetado con el tipo interno `gemma3_text` y esta pensado para generacion de texto conversacional en turco e ingles.

El modelo declara 34 capas, un tamano oculto de 1792, 28 cabezas de atencion para consultas y 4 para claves/valores (GQA), un vocabulario de 65.536 tokens y una longitud de contexto de 8192 tokens. Segun la model card, se entreno sobre 12.780 millones de tokens (12,78 B) y alcanzo una mejor perdida de validacion de 2,8047.

Es relevante por su tamano compacto (apto para GPU de consumo), su licencia Apache 2.0 y su enfoque bilingue turco-ingles, aunque la informacion publicada es muy limitada: el repositorio no incluye resultados de benchmarks, detalles del dataset ni documentacion sobre el proceso de alineacion. El nombre "test" en el identificador sugiere que puede tratarse de una publicacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion de ventana deslizante (Gemma3-SWA) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Tamano oculto | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 12.780 millones |
| Mejor perdida de validacion | 2,8047 |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only basada en Gemma 3, con 34 capas y un tamano oculto de 1792. La innovacion principal declarada es el uso de atencion con ventana deslizante (SWA), que limita el coste computacional de la atencion a un rango local de tokens y reduce el consumo de memoria en contextos largos. Emplea atencion con consultas agrupadas (GQA) con 28 cabezas de consulta y 4 de clave/valor, lo que reduce el tamano de la cache KV durante la inferencia. El vocabulario es de 65.536 tokens y la longitud de contexto maxima declarada es de 8192 tokens.

Segun la model card, el entrenamiento utilizo 12.780 millones de tokens y alcanzo una mejor perdida de validacion de 2,8047. No se especifica la composicion del dataset, la distribucion entre turco e ingles, ni si se aplicaron fases de ajuste supervisado (SFT), RLHF o DPO. Tampoco se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o mezcla de expertos. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Conversacion multi-turno (etiqueta `conversational` en Hugging Face).
- Razonamiento basico y generacion de texto general derivados de un modelo de 1,25 B de parametros.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Carga directa mediante `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponible (el tag `gemma3_text` indica variante solo texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Generacion de texto en turco para prototipos: el modelo puede emplearse para redactar borradores, resumenes o respuestas conversacionales en turco, aprovechando que es uno de los dos idiomas declarados y su tamano compacto permite iterar rapido en desarrollo.
- Asistente conversacional ligero: con 8192 tokens de contexto puede mantener conversaciones multi-turno de longitud moderada en entornos con recursos limitados, por ejemplo en una unica GPU de consumo.
- Traduccion turco-ingles en borradores: al estar entrenado en ambos idiomas, puede utilizarse como base para tareas de traduccion informal o como punto de partida para fine-tuning supervisado.
- Fine-tuning especifico de dominio: al publicarse con licencia Apache 2.0 y pesos en safetensors, es adecuado como base para ajuste fino en tareas concretas (clasificacion de texto, extraccion de informacion) sobre corpus en turco.
- Experimentacion academica con arquitecturas SWA: sirve para estudiar el comportamiento de la atencion de ventana deslizante en modelos de ~1,25 B y comparar con variantes de atencion completa.
- Despliegue en entornos de bajo coste: con 1,25 B de parametros y pesos de 2,5 GB, puede servirse en una GPU con 8-16 GB de VRAM o incluso en CPU con cuantizacion, aunque las variantes cuantizadas no estan publicadas oficialmente.
- Generacion de texto aumentada con recuperacion (RAG) en turco: la ventana de 8192 tokens permite insertar varios fragmentos de contexto recuperado junto con la pregunta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 6-8 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,3-1,5 GB para pesos; en 4 bits, aproximadamente 0,7-0,9 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070, L4); A100 o H100 no son necesarias para este tamano y solo aportarian mayor throughput en despliegues por lotes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en precision completa; con cuantizacion podria caber en GPUs de 4-6 GB, siempre que se generen los pesos cuantizados.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. El soporte de llama.cpp, Ollama o vLLM no esta documentado y requeriria conversion previa a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| cevher3 (este modelo) | 1,25 B | 8192 | tr, en | Apache 2.0 | no disponible |
| Gemma 3 1B (Google) | ~1 B | 32.000 (segun familia Gemma 3) | multilingue | Gemma Terms of Use | si, publicados por Google |
| Llama 3.2 1B (Meta) | 1,2 B | 128.000 | multilingue | Llama 3.2 Community License | si, publicados por Meta |
| Qwen2.5 1.5B (Alibaba) | 1,5 B | 32.000 | multilingue | Apache 2.0 | si, publicados por Alibaba |

La comparativa se basa en categorias de tamano similares; los datos de los modelos alternativos provienen de sus fichas publicas y no de la informacion proporcionada para cevher3. No se dispone de mediciones directas que permitan comparar rendimiento entre cevher3 y estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a modelos de referencia.
- Model card muy escasa: no se documenta la composicion del dataset, el proceso de alineacion ni las fases de entrenamiento, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinacion: como cualquier modelo de 1,25 B sin alineacion documentada, es probable que genere contenido facticamente incorrecto con seguridad aparente.
- Cobertura limitada de idiomas: solo se declaran turco e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- El identificador incluye "test", lo que sugiere que puede tratarse de una publicacion experimental sin garantias de mantenimiento o soporte.
- Sin garantias de produccion: no se documentan evaluaciones de seguridad, filtros de contenido ni comportamiento en dominios sensibles.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar que los datos de entrenamiento no impongan restricciones adicionales, algo que no se detalla.
- No se publican pesos cuantizados oficiales, lo que puede complicar el despliegue en hardware muy limitado sin trabajo adicional de conversion.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-7
