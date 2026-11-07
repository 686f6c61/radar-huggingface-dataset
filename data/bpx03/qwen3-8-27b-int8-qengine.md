# bpx03/Qwen3.8-27B-INT8-QEngine

## Resumen

Qwen3.8-27B-INT8-QEngine es una cuantización en INT8 del modelo denso multimodal Qwen3.8-27B, publicada por el usuario bpx03 para su uso exclusivo con QEngine, un motor de inferencia C++/CUDA de código disponible. El modelo base lo desarrolla el equipo Qwen de Alibaba y está pensado para despliegue local en hardware de consumo de gama alta, con especial énfasis en código, flujos agénticos y automatización de oficina. Esta variante concreta no es un modelo nuevo: es un checkpoint de pesos cuantizados a 8 bits con 27.356.728.592 parámetros reales en safetensors, es decir, unos 27,36 mil millones.

La relevancia de esta publicación es acotada y experimental. El propio autor la describe como una opción secundaria frente al INT4 que QEngine usa por defecto para este mismo modelo. La ventaja declarada es la fidelidad numérica: un KL medio de 6,66e-4 frente a BF16 y un 99,7 % de coincidencia top-1, frente a 1,47e-2 y 95,3 % del INT4. El coste es velocidad: aproximadamente un 30 % menos de tokens por segundo en decodificación y una reducción del pool de KV de 932.864 a 566.272 tokens en la configuración medida.

El interés práctico está en que demuestra un patrón de cuantización reproducible (INT8 simétrico, grupo 128, sin datos de calibración) sobre un modelo multimodal denso de 27B, con un motor que reparte el modelo en tres RTX 3090 mediante tensor parallelism sobre PCIe. No hay datos de benchmarks de calidad de tarea, ni de idiomas soportados, ni de pipeline declarado en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo base Qwen3.8-27B); pesos cuantizados con formato qengine / compressed-tensors |
| Parametros totales | 27.356.728.592 (27,36 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K, segun la configuracion de pool de KV medida por el autor) |
| Tipos de cuantizacion | INT8 simetrico, grupo 128, sin calibracion; escalas FP8 para KV procedentes del checkpoint INT4 de QEngine; cabeza MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout especifico para QEngine; incluye `model_mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de Qwen, sin mezcla de expertos, con 27,36 mil millones de parámetros. Esta publicación no entrena nada: parte de los pesos oficiales en BF16 de Qwen/Qwen3.8-27B y aplica `tools/quant_int8.py` del repositorio de QEngine. La cuantización es simétrica a 8 bits con tamaño de grupo 128 y sin conjunto de calibración, lo que la hace reproducible y barata de generar, pero también dependiente de la distribución de pesos original en lugar de datos representativos de tarea.

Los detalles técnicos diferenciales están en el empaquetado. Las escalas FP8 del KV provienen del checkpoint INT4 de QEngine, no se recalculan para INT8, y la cabeza de predicción multi-token (`model_mtp.safetensors`), que habilita decodificación especulativa, se mantiene en BF16 sin cuantizar. El campo `quantization_config` de `config.json` es meramente descriptivo: QEngine infiere los formatos leyendo los tensores, de modo que estos pesos no son portables a otros motores sin conversión. El entrenamiento del modelo base (composición del corpus, número de tokens, fases de RLHF/DPO) no está documentado en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento multimodal nativo (entrada de imagen junto a texto), según la descripción del repositorio oficial del modelo base.
- Generación de código, con rendimiento medido por el autor de 276,7 tok/s en decodificación sobre prompts de código en la configuración de tres RTX 3090.
- Flujos agénticos y razonamiento multi-paso: el autor reporta 810 tok/s de salida agregada con concurrencia 8.
- Decodificación especulativa mediante cabeza MTP en BF16, incluida en el paquete de pesos.
- Reutilización de caché KV entre turnos de una misma conversación (verificado por el autor en QEngine 1.3.5.2).
- Procesamiento por lotes con pool de KV bajo presión, con salida por lote idéntica a la de petición única según las comprobaciones rápidas del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de oficina con documentos e imágenes: el modelo base es multimodal denso y el contexto de 262K permite introducir actas, capturas o PDFs extensos junto con instrucciones en una sola llamada, sin trocear el material.
- Asistencia de código en local con mayor fidelidad numérica: para tareas donde una divergencia sutil respecto a BF16 es costosa (refactorizaciones largas, generación de tests que deben compilar), el 99,7 % de coincidencia top-1 frente a BF16 justifica aceptar los 276,7 tok/s en lugar de los 387,7 tok/s del INT4.
- Despliegue de agentes con concurrencia moderada: con 810 tok/s agregados a concurrencia 8 y reutilización de KV entre turnos, encaja en orquestadores de agentes que mantienen sesiones largas y necesitan coherencia entre pasos.
- Procesamiento por lotes de documentación técnica: la ventana de 262K y el prefill de 4.098 tok/s a 90K de entrada permiten clasificar, resumir o extraer campos de documentos muy largos en pipelines nocturnos.
- Evaluación comparativa de cuantizaciones: sirve como referencia INT8 frente al INT4 por defecto de QEngine para medir el impacto real del ruido de cuantización en tareas concretas antes de fijar una configuración en producción.
- Laboratorio de investigación sobre cuantización sin calibración: al ser un esquema simétrico grupo 128 reproducible con un script del repositorio, permite estudiar la degradación por capas y comparar con esquemas calibrados.
- Entorno de desarrollo con hardware de gama alta de consumo: tres RTX 3090 con tensor parallelism 3 sobre PCIe es un perfil de coste muy inferior al de un nodo con A100/H100, adecuado para prototipado y validación interna.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones internas del autor en QEngine 1.3.5.2 sobre 3× RTX 3090. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Metrica | INT8 | INT4 | Ratio INT8/INT4 |
|---|---:|---:|---:|
| KL vs BF16, media (320 posiciones) | 6,66e-4 | 1,47e-2 | 22× mas cercano |
| Coincidencia top-1 con BF16 | 99,7 % | 95,3 % | no aplica |
| Decodificacion narrativa (tok/s) | 184,6 | 266,6 | 0,69 |
| Decodificacion de codigo (tok/s) | 276,7 | 387,7 | 0,71 |
| Prefill 10K (tok/s) | 4.816 | 6.077 | 0,79 |
| Prefill 90K (tok/s) | 4.098 | 4.866 | 0,84 |
| Agente c=8, salida (tok/s) | 810 | 1.215 | 0,67 |
| Pool KV, 32 slots, contexto 262K (tokens) | 566.272 | 932.864 | 0,61 |

El autor advierte que la suite de calidad de 8 paquetes nunca se ha ejecutado sobre estos pesos, por lo que no hay evidencia de que el menor KL se traduzca en mejores respuestas en tareas reales. Las cifras de INT4, velocidad y pool de KV proceden del 1 de noviembre de 2026 sobre código anterior y no se han vuelto a medir.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 31,6 GB, por lo que los pesos requieren algo más de 31 GB en memoria de GPU, más el pool de KV y el estado de activaciones.
- Configuración mínima probada: 3× NVIDIA RTX 3090 (24 GB cada una) con tensor parallelism 3 sobre PCIe, que es el único perfil soportado por QEngine.
- Con 2 tarjetas el autor midió que solo funcionaba con 16 slots o menos; con una sola tarjeta los pesos no caben.
- GPU recomendadas: RTX 3090 (perfil validado). No hay datos para A100, H100, RTX 4090 ni otras GPUs.
- No cabe en una GPU de consumo individual; requiere un mínimo de tres.
- Motor de despliegue: exclusivamente QEngine 1.3.5.2 o posterior. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y los pesos están empaquetados para el layout de QEngine.
- Latencia y throughput: 184,6 tok/s en decodificación narrativa, 276,7 tok/s en código, 4.816 tok/s de prefill a 10K y 4.098 tok/s a 90K, todo sobre 3× RTX 3090.
- Despliegue con Docker disponible mediante la variable `QE_MODEL`; también se puede ejecutar con `server/run.sh 8080 --model <ruta>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-INT8-QEngine (este) | 27,36 B | 262K | INT8 grupo 128 sin calibracion | Apache 2.0 | QEngine | KL 6,66e-4 vs BF16, 184,6 tok/s narrativo |
| Qwen3.8-27B INT4 (RedHatAI W4A16, por defecto en QEngine) | 27,36 B | 262K | W4A16 | Apache 2.0 | QEngine | KL 1,47e-2, 266,6 tok/s narrativo, pool KV 932.864 tokens |
| Qwen/Qwen3.8-27B (BF16 original) | 27,36 B | 262K | BF16 | Apache 2.0 | Multiples | Referencia de calidad; requiere bastante mas memoria que 31,6 GB |

No se dispone de datos para comparar con alternativas de otros fabricantes en la misma categoría (tamaño y tarea) dentro de la información proporcionada.

## Limitaciones y advertencias

- Fidelidad no validada en tarea: el autor declara explícitamente que la suite de calidad de 8 paquetes nunca se ha ejecutado sobre estos pesos, por lo que la mejora de KL no está correlacionada con mejores respuestas.
- Rendimiento inferior al INT4: entre un 29 % y un 33 % menos de tokens por segundo en decodificación y un pool de KV un 39 % menor en la configuración medida.
- Portabilidad nula: los tensores están empaquetados para QEngine y el `quantization_config` no describe realmente el formato; otros motores no pueden cargarlos sin conversión.
- Dependencia de hardware muy concreta: tres RTX 3090 con TP=3 sobre PCIe. Dos tarjetas limitan a 16 slots o menos; una no es viable.
- Escalas KV heredadas del checkpoint INT4, no recalculadas para INT8, lo que introduce una asimetría de diseño no documentada en detalle.
- Idiomas soportados no declarados en el repositorio; no se puede confirmar cobertura multilingüe de esta variante.
- Sin datos de sesgo, alucinación ni robustez para esta cuantización; solo se pueden extrapolar las advertencias del modelo base.
- Cero descargas y cero likes en el momento de la consulta, con creación y actualización el mismo día: se trata de una publicación experimental sin validación comunitaria.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales declaradas para uso comercial.
- Las cifras de INT4, velocidad y pool de KV proceden de código anterior al 1 de noviembre de 2026 y no se han vuelto a medir, por lo que la comparación no es estrictamente homogénea.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bpx03/Qwen3.8-27B-INT8-QEngine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Motor de inferencia QEngine: https://github.com/bpx03/QEngine
