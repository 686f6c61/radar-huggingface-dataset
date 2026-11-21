# logic65/Qwen3.8-Whittle-Next-19.8B-A10B-base

## Resumen
Qwen3.8-Whittle-Next-19.8B-A10B-base es un artefacto de investigación experimental publicado por el desarrollador independiente logic65 (David A.) bajo licencia Apache 2.0. No es un modelo entrenado desde cero, sino el resultado de una cirugía de pesos sobre un modelo denso comprimido de 14,7B (Qwen3.8-Whittle-tri-14.7B, a su vez derivado por fusión de capas de un Qwen3.8-27B): se le practica un "carve" estilo ExpertWeaver para convertirlo en un MoE de 240 expertos (k=58 más 2048 compartidos), se le añaden hyper-connections y proyecciones PLE, y se le acopla una tabla de memoria n-gram de 4.000 millones de parámetros. El total son 19.774.844.179 parámetros con aproximadamente 10B activos por token.

La tesis del autor es comprar capacidad con memoria en lugar de con FLOPs: la tabla n-gram añade 4B de parámetros pero solo recoge unas 5.000 filas por token. El modelo corre de extremo a extremo en llama.cpp (hay builds GGUF Q4_K_M de 12,31 GiB) y en safetensors en 9 shards, con un repositorio total de 103 GB.

Es relevante ahora únicamente como objeto de estudio reproducible: el propio autor advierte que falla aproximadamente el 80% de un test de bucle conversacional estándar, que no ha completado el instruction tuning ni el trabajo de seguridad, y que está superado por sus sucesores Whittle-Next-27B-A3B y Whittle-Qwen-3.8-35B-A3B. No debe desplegarse delante de usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con carve de expertos sobre modelo denso, hyper-connections (4 streams, rango 320), indexer QSA, proyecciones PLE y tabla de memoria n-gram |
| Parametros totales | 19.774.844.179 |
| Parametros activos | ~10,0B por token (MoE: 9,03B; hyper-connections: 0,86B; QSA: 0,03B; PLE: 0,13B; n-gram: ~5K) |
| Longitud de contexto | No disponible (el indexer QSA usa atención completa cuando el presupuesto es mayor o igual que el contexto) |
| Tipos de cuantizacion | GGUF Q4_K_M (12,31 GiB); safetensors en precisión original |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (9 shards) y GGUF (Q4_K_M, dos variantes: root y wakeHC) |

## Arquitectura y entrenamiento
La arquitectura se etiqueta como `qwen4_exp` ("Qwen3.8-Flash-Next-style") y se construye por cirugía, no por preentrenamiento. La cadena es: Qwen3.8-27B → Whittle-tri-14.7B (compresión por fusión de capas) → carve de expertos estilo ExpertWeaver con alineación DOT-MoE (referencias arXiv 2602.15521 y 2606.01666) → retrofit de hyper-connections y PLE. El MoE resultante tiene 240 expertos con k=58 más 2048 expertos compartidos (14,76B de parámetros, 9,03B activos). Las hyper-connections usan 4 streams con rango 320 (0,86B). El indexer QSA (0,03B) degrada a atención completa cuando el presupuesto cubre el contexto.

La tabla n-gram tiene 8 cabezas × 781.312 filas × 640 dimensiones (4,00B de parámetros). Según las notas del autor, `heads_per_ngram` es por orden de gram, de modo que el total de cabezas es `(ngram−1) × heads_per_ngram`; el hash PLE se verificó bit a bit (una única matriz multiplicadora compartida, `mixed = Σ⊕ ctx[j]·m[j]` por orden, cabezas diferenciadas por `% vocab + offset`, EOS reinicia la ventana). Los datos de entrenamiento de la tabla y adaptadores fueron wikitext-2, fineweb-edu, cosmopedia/openstax, open-web-math, wikihow y código delimitado (code_x_glue, Magicoder-OSS, CodeFeedback): unos pocos millones de tokens, muy por debajo del corpus previsto. El SFT (ultrachat multi-turno más trazas de razonamiento) estaba en curso cuando se cerró la ventana de GPU; el checkpoint publicado recoge su mejor estado seleccionado por gate. No se documenta RLHF ni DPO.

El autor reporta hallazgos técnicos relevantes: el gate GDN de `qwen4exp` en llama.cpp usa sigmoide mientras que los pesos GDN derivados de Qwen3.5 necesitan silu (perplejidad 36.138 con sigmoide frente a 85,02 con silu); el conversor pliega `+1` en `hc_norm.weight`, por lo que un retrofit identidad debe almacenar `2(1+w)−1` (guardar `2(1+w)` multiplica por 16 la perplejidad); y dos bloqueos de gradiente en la inicialización (PLE devolvía solo la ruta conv; la init identidad de HC con `down=0, up=0` anula mutuamente ambos gradientes, dejando los 64 módulos de mezcla con `|down|=|up|=0.000`).

## Capacidades
- Generación de texto y conversación multi-turno, aunque con fiabilidad muy baja: falla aproximadamente el 80% de un test de bucle conversacional estándar.
- Memoria n-gram asociativa: recupera filas de una tabla de 4B de parámetros por token, lo que mejora la perplejidad en dominio (wikitext-2) y reduce la degeneración en el test de bucles (fallos de 86 a 79, looping de 42 a 31 frente al mismo modelo con la tabla desactivada).
- Razonamiento y código: el SFT incluyó trazas de razonamiento y corpus de código, pero sin tuning completado; no hay evaluación publicada de estas capacidades.
- Capacidad factual limitada: en la variante `wake/` (ruta de mezcla HC activa) la batería de 5 sondas factuales alcanza 5/5, con repetición greedy de 4-gramas de 0,056; el cierre de secuencia (EOS) sigue siendo débil.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso
- Estudio de arquitecturas MoE construidas por carve: cargar el checkpoint y comparar la perplejidad del MoE aislado (86,62), con hyper-connections identidad (85,02), con HC y atención entrenados sin n-gram (73,46) y con la tabla activa (33,18) para analizar el efecto de cada componente.
- Investigación sobre memorias n-gram externas: usar la tabla de 8 cabezas × 781.312 filas para medir cuánto de la mejora en dominio es memorización y cuánto capacidad generalizada (el autor reporta 27,53 frente a 27,96, un 1,5%, en texto científico no visto).
- Reproducción de los hallazgos de compatibilidad con llama.cpp: aplicar los parches de silu frente a sigmoide en el gate GDN y la corrección `2(1+w)−1` en `hc_norm.weight` para validar la reproducibilidad de las cifras de perplejidad.
- Docencia y divulgación técnica: ilustrar con un modelo ejecutable en llama.cpp conceptos como hyper-connections, PLE, indexado QSA y alineación DOT-MoE, usando el GGUF Q4_K_M de 12,31 GiB en una GPU de consumo.
- Depuración de bloqueos de gradiente: estudiar los dos casos documentados (PLE que solo devuelve la ruta conv y la init identidad de HC que anula ambos gradientes) como ejemplo de fallos silenciosos en entrenamiento de adaptadores.
- Comparación de checkpoints: evaluar la diferencia entre el checkpoint root y `wake/` en sondas factuales y repetición greedy para entender el impacto de activar la ruta de mezcla HC.

## Benchmarks y rendimiento

| Etapa | Perplejidad (wikitext-2 test, ctx 512, 24 chunks) |
|---|---|
| MoE carve solo (`qwen3_5_moe`) | 86,62 |
| + hyper-connections, identidad | 85,02 |
| + HC/atención entrenados, n-gram off | 73,46 |
| + n-gram de 4B activado | 33,18 |

| Métrica adicional | Valor |
|---|---|
| Perplejidad en texto científico no visto (n-gram on / off) | 27,53 / 27,96 (mejora del 1,5%) |
| Test de bucles (94 generaciones): fallos, n-gram off → on | 86 → 79 |
| Test de bucles: looping, n-gram off → on | 42 → 31 |
| Batería factual de 5 sondas (`wake/`) | 5/5 |
| Repetición greedy de 4-gramas (`wake/`) | 0,056 |
| Perplejidad con gate sigmoide frente a silu | 36.138 frente a 85,02 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada en Q4_K_M: unos 12,31 GiB de pesos más overhead de contexto y caché KV; en la práctica, 14-16 GiB para contexto moderado.
- VRAM estimada en safetensors (precisión original, ~19,8B parámetros): aproximadamente 40 GB en FP16 solo para pesos, más estado de inferencia.
- GPU recomendadas: A100 40/80 GB o H100 para los safetensors; RTX 4090 (24 GB) o superior para el GGUF Q4_K_M.
- Cabe en GPU de consumo: sí, la build Q4_K_M de 12,31 GiB cabe en RTX 4090, RTX 3090 y tarjetas de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp es la vía soportada de extremo a extremo (requiere los parches del kit para el gate GDN); los safetensors se cargan con `subfolder="wake"` para la variante wake. No se documenta soporte de vLLM, TGI, Ollama ni SGLang.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-Next-19.8B-A10B-base | 19,8B | ~10B | No disponible | Apache 2.0 | Experimental, falla ~80% del test conversacional |
| Whittle-Next-27B-A3B (mismo autor) | 27B | 3B | No disponible | No disponible en la información | Sucesor declarado, padre de Whittle-Qwen-3.8-35B-A3B |
| Whittle-Qwen-3.8-35B-A3B (mismo autor) | 35B | 3B | No disponible | No disponible en la información | Sucesor actual según el autor |
| Qwen3.8-27B (origen de la cadena) | 27B | Denso | No disponible | No disponible en la información | Modelo denso de partida |

No se dispone de datos de benchmarks comparativos con modelos externos a la familia Whittle en la información proporcionada.

## Limitaciones y advertencias
- Artefacto de investigación, no un asistente: el autor indica explícitamente que no debe ponerse delante de usuarios.
- Falla aproximadamente el 80% de un test de bucle conversacional estándar; el cierre de secuencia (EOS) es débil.
- Sin instruction tuning completado (el SFT estaba en curso al cerrarse la ventana de GPU) y sin ningún trabajo de seguridad.
- La mejora de perplejidad en dominio (de 73,46 a 33,18) es en gran medida memorización del corpus de entrenamiento: la tabla solo ha visto ~2% de una época de su corpus mixto, y en texto científico no visto la ganancia cae al 1,5%.
- Riesgo de alucinación y degeneración elevado; el propio autor mide fallos y looping en el test de 94 generaciones.
- Idiomas soportados no declarados; no hay evaluación multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de trabajo de seguridad lo desaconsejan en producción.
- Requiere parches específicos en llama.cpp (silu en el gate GDN, corrección en `hc_norm.weight`) para reproducir las cifras; sin ellos la perplejidad se dispara.
- El kit de scripts, logs y parches (`logic65/mini-next-a100-kit`) estaba privado en el momento de redactar la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/logic65/Qwen3.8-Whittle-Next-19.8B-A10B-base
- Modelo base: https://huggingface.co/logic65/Qwen3.8-Whittle-tri-14.7B
- Sucesor Whittle-Next-27B-A3B: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Sucesor Whittle-Qwen-3.8-35B-A3B: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Kit de entrenamiento, logs y parches: https://huggingface.co/datasets/logic65/mini-next-a100-kit
- Apoyo al autor: https://ko-fi.com/davida81328
- Referencias citadas en la model card: arXiv 2602.15521 y arXiv 2606.01666 (ExpertWeaver / DOT-MoE)
