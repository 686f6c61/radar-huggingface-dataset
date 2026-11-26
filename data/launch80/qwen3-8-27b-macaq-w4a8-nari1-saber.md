# Launch80/Qwen3.8-27B-MACaQ-W4A8-NARI1-SABER

## Resumen
Qwen3.8-27B-MACaQ-W4A8-NARI1-SABER es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-27B, publicado por el usuario Launch80. No es un modelo entrenado desde cero, sino una conversión del checkpoint original en BF16 al formato propietario de cuantización entera W4A8 del motor Saber, orientado específicamente a GPUs AMD RDNA4 (gfx1201). El paquete emplea la receta MACaQ, que combina escalas por canal, una base Hadamard de 32 puntos por bloque de K, pesos int4 por fila y activaciones int8 por token.

La variante NARI1 añade un reajuste fino de las escalas de fila en f32 (304 GEMMs enteros) y de los pesos de normalización en bf16 (209), minimizando la divergencia KL respecto al modelo BF16 sobre trazas de agentes. Según el autor, esto reduce la KL en trazas de agente entre un 27,5 % y un 36,1 % respecto al paquete padre, manteniendo el mismo tamaño, velocidad y kernels.

Es relevante porque demuestra un flujo de cuantización agresiva (4 bits en pesos, 8 bits en activaciones) con decodificación especulativa integrada sobre hardware AMD de consumo y workstation, un nicho poco cubierto frente al ecosistema dominado por CUDA. El repo ocupa 40,1 GB e incluye packs para tensor-parallel 1 y 2, además del tokenizador y la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.8-27B); no se detalla en la informacion disponible |
| Parametros totales | 27B (heredados del modelo base, segun el nombre) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (se mencionan pruebas con 32k y 120k tokens) |
| Tipos de cuantizacion | W4A8: pesos int4 por fila, activaciones int8 por token; 19 lineales promovidos a int8; KV cache fp8 e4m3; lm_head y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | SBRPACK1 (rank{0,1}.pack + manifest.json), no safetensors; cargable solo por el motor Saber en RDNA4 (gfx1201) |

## Arquitectura y entrenamiento
El paquete no entrena un modelo nuevo: cuantiza el checkpoint BF16 de Qwen3.8-27B. La receta MACaQ aplica a cada lineal cuantizada una multiplicación por un vector calibrado por canal `t` y una rotación Walsh-Hadamard normalizada de 32 puntos por bloque de 32 elementos de K, almacenando el peso en esa misma base (`W' = H32 (W / t)`). Los pesos se guardan como códigos int4 en el rango [-8, 7] con una única escala f32 por fila de salida, sin escalas de grupo dentro del bucle de K. La búsqueda de recorte está ponderada por la Hessiana y se refina con volteo de códigos contra activaciones de calibración.

Diecinueve proyecciones se promueven a int8 (W8): 10 `linear_attn.out_proj`, 4 `self_attn.o_proj` y 5 `mlp.down_proj`, las más sensibles según la calibración. Las activaciones se cuantizan a int8 simétrico (absmax/127) tras la Hadamard, y la GEMM usa WMMA int8 con acumulador int32 exacto sobre todo K. El `lm_head` se conserva en bf16 byte a byte, igual que `embed_tokens`, normas, convoluciones y parámetros GDN. La variante NARI1 reajusta únicamente las escalas de fila y los pesos de normalización, minimizando KL sobre una mezcla 70:30 de trazas de agentes de código y respuestas generales, contando solo tokens generados por el propio modelo.

## Capacidades
- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Razonamiento y resolución de problemas matemáticos: el autor reporta 487/500 en GSM8K.
- Generación de código y uso en flujos de agentes de programación, que es el objetivo declarado del reajuste NARI1.
- Recuperación de información en contexto largo: se reportan 16/16 aciertos en pruebas de passkey a 32k y 120k tokens con concurrencia 8.
- Decodificación especulativa mediante un drafter DFlash2 emparejado (W4A8 o FP8), con aceptación medida.
- Soporte de tool calling y flujos multi-paso: implícito en el entrenamiento sobre trazas de agentes, aunque no se detalla explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- No se documentan capacidades de visión ni audio.

## Casos de uso
- Asistente de código en producción: el pack está ajustado sobre trazas de agentes de programación y mantiene el `lm_head` en bf16, por lo que puede integrarse en pipelines de generación de código con decodificación especulativa para reducir latencia por token.
- Agentes autónomos multi-paso: la minimización de KL sobre trazas de agente reduce la deriva respecto al modelo BF16 en cadenas largas de herramientas y respuestas, lo que ayuda a mantener coherencia en bucles de razonamiento.
- Procesamiento de documentos largos: las pruebas de passkey a 32k y 120k tokens sugieren viabilidad para resumen y extracción sobre contextos extensos, siempre que el motor Saber soporte esas longitudes.
- Despliegue en estaciones AMD RDNA4: es una de las pocas opciones cuantizadas a 4 bits con kernels int8 WMMA nativos para gfx1201, útil en equipos con GPUs Radeon profesionales o de consumo de esa generación.
- Servicio con tensor-parallel 2: el pack `tp2/` permite repartir el modelo en dos tarjetas, útil para servir con mayor throughput en configuraciones de dos GPUs.
- Evaluación comparativa de cuantización: sirve como referencia para medir el impacto de W4A8 con Hadamard frente a MXFP4 o FP8 en el mismo motor, dado que el autor publica métricas de KL emparejadas.
- Investigación en decodificación especulativa: el emparejamiento con drafters DFlash2 y las métricas de aceptación publicadas permiten estudiar el equilibrio entre velocidad y calidad.

## Benchmarks y rendimiento
Los datos publicados son del autor y se miden en el motor Saber con TP=2, comparando KL top-5 frente a BF16 y emparejando contra el paquete padre con intervalos de confianza del 95 %.

| Conjunto | Padre | Este pack | Cambio |
|---|---|---|---|
| Trazas de agente, 16 prompts retenidos | 0.00861 | 0.00624 | -27.5 % [-39.0, -20.9] |
| Trazas de agente, 64 prompts retenidos | 0.00808 | 0.00516 | -36.1 % [-41.5, -31.6] |
| Puerta de texto de 76 secuencias | 0.02134 | 0.02113 | -1.0 % [-2.2, +0.1] (empatado) |

| Prueba | Resultado |
|---|---|
| GSM8K | 487/500 (padre: 488/500) |
| Passkey needles | 16/16 a concurrencia 8 (32k y 120k) |
| BetterBench (decode, TTFT, aceptación del drafter) | empatado con el padre |
| TP=1 | ganancias similares: agente -27.7 % / -35.2 %, puerta de texto empatada |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- Motor obligatorio: una build de Saber que lea la etiqueta de pack `macaq_iu8/1`; versiones anteriores rechazan el pack al arrancar.
- Hardware obligatorio: GPUs AMD RDNA4 (gfx1201). No es compatible con CUDA ni con otras arquitecturas.
- VRAM: el pack `tp2/` ocupa 20,5 GB y el `tp1/` 19,5 GB; a ello hay que sumar el drafter, el estado GDN en f16, la caché KV en fp8 e4m3 y el overhead del motor.
- Configuración de una tarjeta: `tp1/` con el drafter `tp1/` correspondiente.
- Configuración de dos tarjetas: `tp2/` con el drafter `tp2/`; nunca mezclar TPs.
- Despliegue: exclusivamente mediante el motor Saber; no es cargable con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta +7,3 % en tok/s con batch 1 usando el drafter W4A8 frente al FP8; no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | no disponible | safetensors | apache-2.0 | Amplio (CUDA, ROCm, CPU) |
| Qwen3.8-27B-MACaQ-MXFP4-SABER | 27B | no disponible | SBRPACK1 | apache-2.0 | RDNA4 |
| Qwen3.8-27B-MACaQ-W4A8-SABER (padre) | 27B | no disponible | SBRPACK1 | apache-2.0 | RDNA4 |
| Este pack (NARI1) | 27B | no disponible | SBRPACK1 | apache-2.0 | RDNA4 |

Frente al BF16, este pack reduce el tamaño a aproximadamente 19,5-20,5 GB y gana velocidad de decodificación, a costa de una ligera pérdida de calidad (GSM8K 487 frente a 488) y de quedar atado a un motor y una arquitectura concretos. Frente al padre W4A8, mejora la KL en agentes sin cambiar tamaño ni velocidad. Frente al MXFP4, el autor indica menor KL y mayor velocidad de decodificación y de primer token en el mismo hardware.

## Limitaciones y advertencias
- No es un modelo autónomo: requiere el motor Saber y una GPU AMD RDNA4 (gfx1201); no funciona en CUDA, CPU ni otras arquitecturas.
- El formato SBRPACK1 no es safetensors ni GGUF, lo que impide su uso con el ecosistema estándar de inferencia.
- La calidad depende de la calibración: la KL frente a BF16 no es cero y la pérdida se concentra en las proyecciones no promovidas a int8.
- El `lm_head` debe coincidir byte a byte con el del drafter; un drafter incompatible es rechazado por el motor.
- Mezclar packs `tp1/` y `tp2/` entre objetivo y drafter produce fallos o resultados incorrectos.
- Las salidas greedy no son idénticas entre los dos drafters disponibles, debido al estado GDN en f16 y a la programación de aceptación.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en este pack.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas: no se especifican los idiomas soportados.
- Uso comercial: la licencia apache-2.0 lo permite, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del motor Saber, que no se detallan aquí.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de las métricas del autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-NARI1-SABER
- Pack padre: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-SABER
- Pack predecesor MXFP4: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER
- Drafter W4A8 recomendado: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER
- Drafter FP8: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-FP8-SABER
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de la receta MACaQ: https://arxiv.org/abs/2611.10649
