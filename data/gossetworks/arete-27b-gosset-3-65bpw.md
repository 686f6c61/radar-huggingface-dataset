# GossetWorks/Arete-27B-Gosset-3.65BPW

## Resumen

Arete-27B-Gosset-3.65BPW es una cuantización del modelo NousResearch/Arete-27B, un modelo vision-language de 27.360 millones de parámetros (incluyendo su codificador visual) desarrollado por Nous Research. Esta versión, publicada por GossetWorks, aplica una técnica propietaria denominada Gosset Packing que comprime los pesos a 3,79 bits por peso en conjunto (3,5835 bits por peso en las 607 proyecciones cuantizadas), reduciendo el tamaño en disco de los ~54,71 GB del original BF16 a 12,97 GB. El objetivo declarado es hacer que el modelo completo resida en una única GPU de 16 GB.

El modelo base emplea una arquitectura híbrida en la que 48 de sus 64 capas utilizan atención lineal recurrente DeltaNet con estado O(1), mientras que el resto mantiene atención completa. Esta arquitectura resulta más difícil de cuantizar que un transformer convencional, según reconoce el propio autor del pack. La versión cuantizada conserva la ventana de contexto arquitectónica de 262.144 tokens del modelo original, aunque el runtime por defecto arranca con 32.768 tokens.

La relevancia de esta ficha radica en que demuestra un caso práctico de despliegue de un modelo de 27B con capacidades de visión en hardware de consumo, con métricas verificadas de residencia en VRAM, velocidad de decodificación y calidad medida mediante perplejidad y tareas de código y matemáticas. No obstante, conviene señalar que el recuento de parámetros que reporta Hugging Face (4.810.711.024) no refleja el tamaño real del modelo, sino los códigos de celosía empaquetados en bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, 48 de ellas con atención lineal recurrente DeltaNet (estado O(1)); incluye codificador visual |
| Parámetros totales | 27.360 millones (modelo real); Hugging Face reporta 4.810.711.024 elementos almacenados por el empaquetado en bits |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (techo arquitectónico); 32.768 tokens por defecto en el runtime |
| Tipos de cuantización | Gosset Packing con celosía E8: 4,25 bpw en proyecciones de atención (lineal, completa y visual) y LM head; 3,25 bpw en proyecciones MLP (texto y visión); int8 en embeddings; 3,79 bpw global |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifican términos concretos) |
| Formato de pesos | safetensors con empaquetado Gosset (gosset-packed); no compatible con GGUF estándar |

## Arquitectura y entrenamiento

El modelo base Arete-27B, del que deriva este pack, presenta una arquitectura híbrida con 64 capas, de las cuales 48 emplean atención lineal recurrente DeltaNet con estado O(1) y las 16 restantes atención completa. Esta combinación busca reducir el coste de memoria de la caché KV en contextos largos manteniendo la capacidad de atención global. El fine-tune de Nous Research elimina la cabeza de predicción multi-token del modelo base, y el conjunto incluye un codificador visual que aporta capacidades vision-language.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Respecto a esta versión cuantizada, el proceso de Gosset Packing emplea un codificador que no se distribuye con el pack (el pack es un artefacto compilado) y una calibración diseñada específicamente para ejercitar la ruta de estado recurrente de la atención lineal, que es la parte más sensible a la cuantización. La certificación de fidelidad reporta el error relativo de reconstrucción por tensor: 0,1008 de media en proyecciones de atención, 0,1682 en MLP, 0,0899 en atención visual, 0,1707 en MLP visual, 0,0933 en el LM head y 0,0079 en embeddings.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 262.144 tokens (32.768 por defecto en el runtime).
- Comprensión de imágenes mediante codificador visual integrado (vision-language).
- Generación de código: 91,46% de pass@1 en el conjunto oficial completo de HumanEval (150/164).
- Razonamiento matemático: 93/100 en los primeros 100 problemas del test oficial de GSM8K en modo zero-shot y greedy.
- Preservación del comportamiento conversacional del modelo base, con 0 rechazos en las 21 consultas estratificadas de NousResearch/Propaganda_Eval.
- Despliegue con endpoints compatibles con Ollama y OpenAI, verificado de extremo a extremo.
- Compatibilidad con `vllm serve` 0.22.1 sin modificaciones mediante el plugin externo `gosset_e8_vllm`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de 27B en GPU de consumo: con 12,07 GiB de asignación de pesos y un pico de 13,48 GiB a 32.768 tokens de contexto, el pack cabe íntegramente en una RTX 5080 de 16 GB sin derrame a RAM del sistema, lo que permite ejecutar un modelo de esta escala en una estación de trabajo personal.
- Asistencia de código en el IDE o en pipelines de CI/CD: el 91,46% de pass@1 en HumanEval y la velocidad de 53,92 tok/s en decodificación sostenida lo hacen viable para autocompletado y revisión de parches en entornos con una sola GPU.
- Procesamiento de documentos largos: el techo de 262.144 tokens permite analizar contratos, informes o bases de código extensas en una sola pasada, aunque en la práctica habrá que ajustar el contexto al presupuesto de VRAM disponible.
- Análisis de imágenes con descripción textual: el codificador visual cuantizado a 4,25 bpw en atención y 3,25 bpw en MLP permite tareas de captioning, extracción de información de capturas o moderación de contenido visual en local.
- Servicio de inferencia por lotes en una sola tarjeta: con vLLM y el plugin `gosset_e8_vllm` se alcanzan 214,36 tok/s agregados con concurrencia 8, 258,25 tok/s con 16 y 311,24 tok/s con 32, suficiente para un pequeño equipo interno o un prototipo de producto.
- Evaluación e investigación de técnicas de cuantización: la certificación de fidelidad por tensor y las mediciones de perplejidad con dos protocolos (long-chunk y short-window) ofrecen un registro reproducible para estudiar el impacto de la cuantización en arquitecturas híbridas con atención lineal.
- Razonamiento matemático asistido en entornos sin conectividad: los 93/100 en GSM8K zero-shot permiten usar el modelo como tutor o verificador de problemas aritméticos de forma completamente local.

## Benchmarks y rendimiento

| Benchmark | Este pack | Referencia | Notas |
|---|---|---|---|
| HumanEval pass@1 (164 problemas, conjunto oficial completo) | 91,46% (150/164) | no disponible | — |
| GSM8K (primeros 100 problemas oficiales, zero-shot, greedy, límite 512 tokens) | 93/100 | Qwen3.8-27B-Gosset: 86/100 | Muestra de 100 problemas, no el conjunto completo; 3 de los 7 fallos alcanzaron el límite de tokens |
| Propaganda_Eval (21 prompts estratificados) | 0 rechazos en 21 | no disponible | Preserva el comportamiento del modelo base |
| Perplejidad WikiText-2, long-chunk (24 × 2048 tokens, 49.128 evaluados) | 6,8474 | BF16: 6,5001 (+5,34%) | Mismo protocolo y harness |
| Perplejidad WikiText-2, short-window (128 × 128 tokens, 16.256 evaluados) | 12,7208 | BF16: 11,8433 (+7,41%) | Mismo protocolo y harness |

Rendimiento de inferencia medido en una RTX 5080 con el pack completamente residente:

| Métrica | Runtime incluido | vLLM 0.22.1 + plugin v2 |
|---|---|---|
| Decodificación single-stream | 53,92 tok/s (18,55 ms/token) | 56,35 tok/s en SSE estable; 53,50 tok/s en medida SSE con 8 warmup + 32 eval |
| Time to first token | 146,6 ms | 50,9 ms |
| Throughput agregado (128 in / 128 out) | no disponible | 214,36 tok/s a c=8; 258,25 tok/s a c=16; 311,24 tok/s a c=32 |
| VRAM pico | 13,48 GiB a 32.768 tokens de contexto | 15,36 GiB (12,15 GiB pesos + 1,15 GiB de pool KV de 15.701 tokens) |

## Requisitos de hardware

- VRAM estimada para inferencia: 12,07 GiB de asignación de pesos en el runtime incluido; pico de 13,48 GiB con contexto de 32.768 tokens. En vLLM, 12,15 GiB de pesos más la caché KV (1,15 GiB para 15.701 tokens), con pico de 15,36 GiB usando `--gpu-memory-utilization 0.9`.
- GPU verificada: una única RTX 5080 de 16 GB, con residencia del 100% y sin derrame a RAM del sistema.
- Comparación con GGUF: el build estándar de este modelo (bartowski Q4_K_M, 17,20 GB) no cabe en una tarjeta de 16 GB; este pack es 1,33 veces más pequeño.
- GPU recomendadas: RTX 5080 (verificada). Para otras GPU de 16 GB o superiores no hay datos publicados en la información disponible.
- Opciones de despliegue: runtime propio incluido con motor de decodificación fusionado y captura de CUDA graphs, con endpoints compatibles con Ollama y OpenAI; `vllm serve` 0.22.1 sin modificaciones mediante el plugin externo `gosset_e8_vllm` (kernel v2 `e8_mma_fast`). Soporte de llama.cpp u Ollama con pesos nativos: no disponible, dado que el formato es gosset-packed y no GGUF.
- Latencia y throughput: TTFT de 146,6 ms en el runtime incluido y 50,9 ms en vLLM; decodificación de 53,92 a 56,35 tok/s en single-stream; hasta 311,24 tok/s agregados con concurrencia 32 en vLLM.
- El plugin `gosset_e8_vllm` se distribuye para evaluación empresarial y en la nube; su acceso no es público según la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño en disco | Licencia | Rendimiento medido |
|---|---|---|---|---|---|
| Arete-27B-Gosset-3.65BPW | 27,36 B (real) | 262.144 tokens (32.768 por defecto) | Gosset-packed, 12,97 GB | other | HumanEval 91,46%; GSM8K 93/100; 53,92 tok/s en RTX 5080 |
| Arete-27B BF16 (modelo base) | 27,36 B | 262.144 tokens | BF16, ~54,71 GB | no disponible | Perplejidad WikiText-2 long-chunk 6,5001; requiere hardware de mayor capacidad |
| Arete-27B GGUF Q4_K_M (bartowski) | 27,36 B | no disponible | GGUF, 17,20 GB | no disponible | No cabe en GPU de 16 GB; resto de métricas no disponible |
| Qwen3.8-27B-Gosset | no disponible | no disponible | Gosset-packed | no disponible | GSM8K 86/100 en la misma muestra de 100 problemas |

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: +5,34% de perplejidad en long-chunk y +7,41% en short-window respecto a BF16, con errores relativos de reconstrucción de hasta 0,17 en las proyecciones MLP.
- La arquitectura híbrida con atención lineal recurrente es, según el propio autor, menos tolerante a la cuantización que un transformer convencional; el rendimiento en contextos muy largos más allá de los 32.768 tokens por defecto no está verificado en la información disponible.
- El recuento de parámetros que muestra Hugging Face (4.810.711.024) es engañoso: refleja los códigos de celosía empaquetados, no los 27,36 mil millones de parámetros reales.
- El pack es un artefacto compilado y el codificador no se distribuye; no es posible recuantizar ni inspeccionar los pesos con herramientas estándar.
- El formato gosset-packed no es compatible con el ecosistema GGUF (llama.cpp, Ollama con pesos nativos), lo que limita las opciones de despliegue al runtime del autor o a vLLM con el plugin propietario.
- El plugin `gosset_e8_vllm` se distribuye solo para evaluación empresarial y en la nube; no hay acceso público confirmado.
- La licencia es "other" sin términos especificados en la información disponible; es imprescindible verificar las condiciones del modelo base NousResearch/Arete-27B antes de cualquier uso comercial.
- Los resultados de GSM8K corresponden a una muestra de 100 problemas, no al conjunto completo, y 3 de los 7 fallos se debieron al límite de 512 tokens de generación.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base ni de esta cuantización.
- Las métricas de velocidad están medidas exclusivamente en una RTX 5080; el rendimiento en otras GPU no está documentado.
- El modelo tiene un volumen de adopción muy bajo (194 descargas, 1 like en el momento de la consulta), lo que reduce la validación comunitaria disponible.

## Enlaces

- [Hugging Face: GossetWorks/Arete-27B-Gosset-3.65BPW](https://huggingface.co/GossetWorks/Arete-27B-Gosset-3.65BPW)
- [Página de benchmarks de Gosset Works](https://www.gossetworks.com/benchmarks.html)
- [Modelo base: NousResearch/Arete-27B](https://huggingface.co/NousResearch/Arete-27B)
- [NousResearch/Propaganda_Eval](https://huggingface.co/datasets/NousResearch/Propaganda_Eval)
- Contacto del autor: gossetworks.com y X @GossetWorks (no se proporcionan URLs adicionales en la información disponible)
