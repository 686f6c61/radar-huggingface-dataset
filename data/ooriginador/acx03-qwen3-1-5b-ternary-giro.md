# Ooriginador/acx03-qwen3-1.5b-ternary-giro

## Resumen

Ark-Cortex v3 (ACX-03) es un modelo de lenguaje de 1.777 millones de parámetros derivado de la familia Qwen (la model card cita Qwen2/Qwen3 como arquitectura base) y publicado por el desarrollador independiente Ooriginador (Arkheion Labs / ecosistema CICLOGIRO). Su rasgo diferencial es que se distribuye con pesos cuantizados de forma nativa en representación ternaria de 1,58 bits (valores en {-1, 0, +1} con agrupación de escalas en grupos de 64), empaquetados en trits de 2 bits, además de una versión GGUF Q2_0. Está pensado para inferencia en el borde: terminales de punto de venta, servidores locales y equipos de escritorio con poca memoria.

El modelo forma parte del producto GIRO Desktop Copilot, donde se carga mediante un contenedor propietario `.ark` con mapeo de memoria (mmap) sin copia, y un motor de ejecución por niveles que prioriza HIP/CUDA y recurre a WebGPU o SIMD en CPU según el hardware disponible. El binario GGUF estándar permite usarlo con llama.cpp, llama-server y Ollama, lo que facilita su evaluación fuera del ecosistema del autor.

Por su tamaño y su formato de pesos, es relevante para quien necesite un modelo conversacional muy ligero (menos de 1 GB en GGUF) que quepa en dispositivos con recursos limitados y con licencia Apache 2.0, aunque el alcance real de sus capacidades y la calidad de su ajuste no están respaldados por benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only basado en Qwen2 / Qwen3 (28 capas ocultas, hidden size 1536, GQA con 12 cabezas Q y 2 cabezas KV, dimensión de cabeza 128) |
| Parametros totales | 1.777.088.000 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de despliegue usa `-c 2048` |
| Tipos de cuantizacion | Ternaria nativa de 1,58 bits en trits empaquetados de 2 bits con grupo de escala g=64 (contenedor `.ark`); GGUF Q2_0 |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ark` (contenedor nativo Arkheion, mmap zero-copy), GGUF v3 (Q2_0), safetensors (según metadatos del repo), `tokenizer.json`, `config.json`, `generation_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de la familia Qwen, con 28 capas, tamaño oculto de 1536 y atención con consultas agrupadas (GQA) de 12 cabezas de consulta y 2 de clave/valor con dimensión de cabeza 128. El vocabulario BPE es de 151.936 tokens. La innovación principal no está en el bloque transformer sino en la representación de pesos: cuantización ternaria nativa de 1,58 bits (pesos en {-1, 0, +1}) con escalas agrupadas cada 64 elementos y empaquetado de dos bits por trit, lo que reduce el binario nativo a 1,22 GB y el GGUF Q2_0 a 901 MB.

Según la model card, el ajuste local se realizó durante 5.600 pasos con predicción multi-token (MTP-4) y alcanzó una pérdida final de 2,13 (entropía cruzada / divergencia KL). No se detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo fases de RLHF o DPO. Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal. La información sobre el proceso de entrenamiento es, por tanto, muy limitada y no verificable de forma independiente.

## Capacidades

- Generación de texto conversacional en portugués e inglés, orientada a un asistente de operaciones (GIRO Copilot).
- Razonamiento básico y respuesta a instrucciones, condicionado por el ajuste declarado y el formato de cuantización agresivo.
- Ejecución local en el borde mediante el contenedor `.ark` con mmap sin copia y el motor por niveles (HIP/CUDA, WebGPU, CPU SIMD).
- Compatibilidad con llama.cpp, llama-server y Ollama a través del archivo GGUF Q2_0.
- Capacidad multilingüe limitada a los dos idiomas declarados (pt, en).
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, modo de pensamiento extendido, visión ni audio.

## Casos de uso

- Asistente de punto de venta: el modelo puede gestionar consultas operativas de un terminal de comercio en local, sin conexión a la nube, gracias a su binario GGUF de 901 MB que cabe en equipos modestos.
- Copiloto de escritorio integrado: el contenedor `.ark` está diseñado para cargarse mediante mmap en GIRO Desktop sin asignación dinámica adicional, lo que reduce el consumo de memoria en aplicaciones de escritorio.
- Despliegue en dispositivos de borde con poca memoria: al operar en 1,58 bits, permite servir generación de texto en hardware con pocos gigabytes de RAM o VRAM, donde un modelo de 1,5 B en FP16 no cabría con holgura.
- Prototipado rápido de asistentes conversacionales en portugués e inglés: sirve para validar flujos de diálogo antes de migrar a un modelo mayor, con la ventaja de una licencia Apache 2.0 permisiva.
- Servicio local con llama-server: el ejemplo de la model card (`llama-server -m ... -c 2048 --port 8080 -ngl 99`) permite exponer una API compatible con endpoints sobre un único proceso ligero.
- Pruebas de concepto de cuantización ternaria: útil para investigadores que quieran evaluar el comportamiento de pesos en {-1, 0, +1} en tareas de generación, comparándolo con cuantizaciones estándar.
- Integración en Ollama: mediante un `Modelfile` con temperatura 0,3 y top_p 0,8 se puede empaquetar como modelo local para herramientas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (2,13, CE/KL) tras 5.600 pasos con MTP-4, sin métricas de evaluación como MMLU, HumanEval o GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,9 GB para el GGUF Q2_0 y 1,22 GB para el contenedor `.ark`; el uso real dependerá del contexto configurado y de las cachés KV.
- GPU recomendadas: no se especifican modelos concretos; el motor del autor prioriza HIP/CUDA, con respaldo en WebGPU y CPU SIMD.
- Compatibilidad con GPU de consumo: por tamaño, cabe en tarjetas de consumo con 4 GB o más de VRAM, aunque no hay datos de rendimiento publicados que lo confirmen.
- Opciones de despliegue: llama.cpp, llama-server y Ollama con el GGUF; GIRO Desktop con el contenedor `.ark`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ark-Cortex v3 (ACX-03) | 1,777 B | No disponible (ejemplo con 2048) | Ternaria 1,58 bits nativa y GGUF Q2_0 | Apache 2.0 | Hugging Face (repo de 2,2 GB) |
| Qwen3 (modelos densos pequeños de la familia) | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Apache 2.0 en parte de la familia | Hugging Face y otros canales |
| Qwen (primera generacion, 72B) | 72 B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Pesos publicados desde diciembre de 2023 |

La comparación con alternativas de la misma categoría (modelos densos de 1-2 B parámetros) no puede completarse con datos concretos porque la información disponible no incluye especificaciones de esos modelos. La ventaja diferencial de ACX-03 es el tamaño del binario y la cuantización ternaria nativa; la desventaja es la ausencia total de benchmarks publicados.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad del ajuste no está validada de forma independiente y la pérdida de 2,13 no es comparable con métricas estándar.
- La cuantización ternaria de 1,58 bits es extremadamente agresiva y puede degradar de forma notable la coherencia, el razonamiento y la fidelidad factual frente al modelo base.
- Riesgo elevado de alucinación, especialmente en dominios especializados y con contextos largos, al no haber datos de evaluación.
- Idiomas limitados a portugués e inglés; el rendimiento en castellano no está documentado.
- El contexto no está especificado; el ejemplo de despliegue usa 2048 tokens, muy por debajo de los estándares actuales.
- El contenedor `.ark` es un formato propietario del ecosistema ArkheionNet; fuera de GIRO Desktop solo el GGUF es utilizable con herramientas estándar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte documentado.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base Qwen del que deriva antes de un uso comercial.
- No se documentan sesgos, filtros de seguridad ni evaluaciones de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/Ooriginador/acx03-qwen3-1.5b-ternary-giro
- Anuncio de Qwen3 (Alibaba): https://www.alibabagroup.com/en-US/document-1853940226976645120
- Wikipedia, Qwen: https://en.wikipedia.org/wiki/Qwen
