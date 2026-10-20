# brandonmusic/DeepSeek-V4.1-Flash-1017-TrellisMX-K4

## Resumen

DeepSeek-V4.1-Flash-1017-TrellisMX-K4 es una compilación cuantizada a 4 bits del checkpoint deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`), publicada por el usuario brandonmusic bajo licencia MIT. No es un modelo entrenado desde cero: es una conversión de pesos con un objetivo muy concreto, servir el modelo base en cuatro tarjetas RTX PRO 6000 Blackwell de 96 GB con paralelismo tensorial 4, manteniendo las dos tablas Engram en su formato FP8 original (unas 189 GiB) en RAM del host. La técnica empleada, TrellisMX K4, almacena los expertos enrutados en 4 bits (unos 4,04 bits por peso, 274,6 GB) que se decodifican a operandos E4M3 con activaciones E4M3 (W4A8).

El interés del artefacto es doble. Por un lado, demuestra que un MoE de esta escala puede entrar en 4 GPU profesionales de 96 GB, algo que el checkpoint oficial no permite. Por otro, el autor publica una metodología de fidelidad poco habitual en cuantizaciones comunitarias: divergencia KL token a token frente a los logits del checkpoint oficial en FP32, sobre vocabulario completo (129.280 identificadores) y en FP64, junto con el dataset de logits del profesor para que cualquiera pueda reproducir la medición.

Conviene subrayar su estado: el autor lo etiqueta explícitamente como *research build*. Los pesos y las mediciones de la ruta de referencia están completos, pero el checkpoint todavía no se ha arrancado a TP4 con la imagen de serving publicada, y la card avisa de que la primera ejecución debe tratarse como una prueba. Las cifras de rendimiento disponibles son exclusivamente de fidelidad distribucional, no de calidad en tareas estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con tablas Engram en las capas 1 y 14 y tres capas DSpark/MTP; familia deepseek_v41 |
| Parámetros totales | 212.828.744.914 según el recuento de safetensors del repositorio; la model card declara además 543,6 B de pesos en expertos enrutados (40 capas × 384 expertos) y 768.022.850 filas × 256 en las tablas Engram. Las tres cifras no son coherentes entre sí; ver "Limitaciones y advertencias" |
| Parámetros activos | No disponible (el modelo es MoE, pero la información proporcionada no indica cuántos expertos se activan por token) |
| Longitud de contexto | No disponible (las evaluaciones publicadas usan ventanas de 8.192 tokens y secuencias de 2.048 tokens, pero no se declara la ventana máxima del modelo) |
| Tipos de cuantización | W4A8: expertos enrutados en 4 bits TrellisMX (K4), decodificados a operandos E4M3 con activaciones E4M3; escalas UE8M0 cada 32 entradas almacenadas con compresión CSF sin pérdida; 4,04 bits por peso efectivos. Tablas Engram en FP8 (E4M3) con escala E8M0 cada 32. Resto de tensores sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | MIT (la misma que el modelo base) |
| Formato de pesos | safetensors (repositorio de 496,4 GB), pre-rebanqueados para paralelismo tensorial 4; imagen de serving `verdictai/deepseek-v41-flash-trellismx:k4-fp8-tp4-20261019` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos con dos mecanismos singulares que la card describe pero no detalla en profundidad: tablas Engram en las capas 1 y 14 (768.022.850 filas de 256 dimensiones cada una, almacenadas en FP8) y tres capas DSpark/MTP, presumiblemente orientadas a decodificación especulativa y predicción multi-token. Esta conversión no entrena nada: solo modifica los expertos enrutados. Atención, expertos compartidos, router, normalizaciones, embeddings, `lm_head` y las tres capas DSpark/MTP se copian byte a byte del checkpoint oficial.

El único bloque cuantizado son los expertos enrutados: 40 capas × 384 expertos, 543,6 B de pesos según la card, almacenados en TrellisMX K4 y decodificados a E4M3 en tiempo de ejecución. Las escalas UE8M0 por cada 32 entradas se guardan con compresión CSF sin pérdida. Los expertos están pre-rebanqueados en bloques completos de 128 columnas (640, 640, 512 y 512 de las 2.304 columnas intermedias) para que cada una de las cuatro GPU reciba una porción contigua. Las tablas Engram permanecen en FP8 con escala E8M0 por cada 32, idénticas al original, y residen en RAM del host (unas 189 GiB), no en VRAM.

No se documentan datos de entrenamiento, número de tokens, composición del corpus ni fases de RLHF/DPO para el modelo base en la información disponible; la card se limita a la conversión. La innovación técnica destacable es el formato TrellisMX K4 en sí y el paquete de serving, que combina paralelismo tensorial 4, decodificación especulativa DSpark y *full CUDA graphs*.

## Capacidades

- Generación de texto autoregresiva con API compatible con OpenAI (`/v1/chat/completions`), servida bajo el nombre `deepseek-v41-flash-trellismx-k4`.
- Razonamiento y generación de código: capacidades heredadas del checkpoint DeepSeek-V4.1-Flash-1017, aunque no se aportan evaluaciones de calidad que las cuantifiquen.
- Procesamiento de ventanas de 8.192 tokens documentado en la evaluación de fidelidad; útil para contextos medios en producción.
- Decodificación especulativa DSpark integrada en la imagen de serving, según la card.
- Predicción multi-token mediante las tres capas MTP del modelo base.
- Recuperación de conocimiento parametrizado vía tablas Engram (mecanismo propietario del modelo base; su comportamiento funcional no se detalla).
- Soporte de *tool calling*, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; la pipeline declarada es únicamente `text-generation`.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Autohospedaje de un endpoint compatible con OpenAI en hardware propio: cuatro RTX PRO 6000 Blackwell de 96 GB con PCIe peer-to-peer permiten servir el modelo con `docker compose` y `serve.sh`, exponiendo el puerto 8010 para aplicaciones internas sin depender de APIs externas.
- Investigación en cuantización: el paquete incluye la métrica de divergencia KL frente al checkpoint oficial y el dataset de logits del profesor (`cuts-2048/` y `windows-8192/`), lo que permite reproducir la medición o comparar formatos alternativos con la misma referencia.
- Evaluación de decodificación especulativa: la imagen integra DSpark junto con CUDA graphs, de modo que sirve como banco de pruebas para medir el efecto del *speculative decoding* en un MoE de gran tamaño con TP4.
- Generación de datos sintéticos y destilación: los logits en FP32 del checkpoint oficial publicados por el autor permiten entrenar modelos menores por destilación sin ejecutar el modelo completo.
- Procesamiento por lotes de documentos de hasta 8.192 tokens (resúmenes, extracción de entidades, clasificación) en despliegues on-premise donde la soberanía del dato es requisito, aprovechando que el checkpoint corre íntegramente en infraestructura local.
- Estudio de mecánicas de memoria externa: al mantener las tablas Engram en RAM del host, el checkpoint es un caso práctico para analizar el compromiso entre VRAM y latencia en arquitecturas con tablas de conocimiento separadas.
- Validación de pipelines de serving a TP4: útil para equipos que quieran verificar `docker-compose.yml`, `serve.sh` y `SERVING.md` antes de adoptar el formato en producción.
- Desarrollo de asistentes conversacionales multi-turno: el formato chat de la API y la ventana de 8.192 tokens son suficientes para diálogos con historial largo, siempre que se acepte el estado de investigación del artefacto.

## Benchmarks y rendimiento

Los únicos resultados publicados miden fidelidad distribucional frente al checkpoint oficial, no calidad en tareas. Divergencia KL en nats, vocabulario completo (129.280 identificadores), calculada en FP64 sobre cada fila de siguiente token. Los valores están marcados como no verificados (`verified: false`).

| Métrica | Conjunto | Valor |
|---|---|---|
| KL media (referencia ‖ candidato), secuencias de 2.048 tokens | 512 secuencias frescas de 2.048 tokens (derivadas de 128 ventanas de 8.192) | 0,0498 nats |
| Acuerdo top-1 con la referencia, 2.048 tokens | Mismo conjunto | 0,9335 |
| KL media (referencia ‖ candidato), ventanas de 8.192 tokens | 128 ventanas de 8.192 tokens | 0,1097 nats |
| Acuerdo top-1 con la referencia, 8.192 tokens | Mismo conjunto | 0,9231 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM: cuatro GPU con 96 GB cada una (384 GB en total) para los expertos cuantizados y el resto de tensores, en paralelismo tensorial 4. El checkpoint ocupa 496,4 GB en disco y los expertos cuantizados 274,6 GB.
- RAM del host: aproximadamente 190 GiB libres para alojar las tablas Engram en FP8.
- GPU documentadas: 4× NVIDIA RTX PRO 6000 Blackwell 96 GB (SM120) con PCIe peer-to-peer entre ellas. La codificación y las mediciones se realizaron en un nodo de 8× NVIDIA B200 cedido por Lambda.
- GPU de consumo: no cabe. El requisito mínimo son cuatro tarjetas profesionales de 96 GB; no hay ruta documentada para RTX 4090 ni similares.
- Software: driver NVIDIA con soporte CUDA 13.4, NVIDIA Container Toolkit, docker compose v2, unos 497 GB de disco libre y `hf download` para obtener los pesos.
- Despliegue: única opción documentada, la imagen `verdictai/deepseek-v41-flash-trellismx:k4-fp8-tp4-20261019` con `serving/docker-compose.yml`, `serve.sh` y `SERVING.md`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Variables de entorno relevantes: `CHECKPOINT_ROOT` (ruta del checkpoint) y `DS41_GPUS` (selección de GPU; por defecto 0,1,2,3).
- Latencia y throughput: no disponibles. La card advierte que el checkpoint aún no se ha arrancado a TP4 con esta imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (oficial) | No disponible en la información (los expertos enrutados suman 543,6 B según la card del derivado) | No disponible | Pesos originales, tablas Engram en FP8, resto sin cuantizar | MIT | HuggingFace, revisión `1bae0e10` |
| DeepSeek-V4.1-Flash-1017-TrellisMX-K4 (este modelo) | 212.828.744.914 según safetensors | No disponible | 4 bits TrellisMX K4 en expertos (W4A8), Engram FP8 en RAM | MIT | HuggingFace, imagen Docker del autor |
| Otras cuantizaciones 4-bit (GPTQ, AWQ, GGUF) del mismo modelo base | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la información proporcionada |

La comparación relevante es contra el checkpoint oficial: este build reduce el espacio de los expertos a 274,6 GB con 4,04 bits por peso y permite servirlo en 4× 96 GB, a cambio de una divergencia KL media de 0,0498 nats en secuencias de 2.048 tokens y un acuerdo top-1 del 93,35 %. No se dispone de datos de otras alternativas comparables.

## Limitaciones y advertencias

- Estado de investigación declarado por el autor: la imagen de serving comparte runtime con la K2, que sí se arrancó y midió en hardware SM120 el 2026-10-19, pero este checkpoint no se ha llegado a arrancar a TP4. La primera ejecución debe considerarse una prueba.
- Incoherencia en el recuento de parámetros: el índice de safetensors declara 212.828.744.914, mientras que la card habla de 543,6 B de pesos en expertos enrutados y de 768.022.850 × 256 filas en Engram. Verificar antes de dimensionar infraestructura.
- Las métricas de fidelidad están marcadas como no verificadas (`verified: false`) y son de primera parte (`measured_by: first-party`); no hay validación independiente.
- La calidad se degrada con la longitud: la KL media pasa de 0,0498 nats (2.048 tokens) a 0,1097 nats (8.192 tokens) y el acuerdo top-1 cae del 93,35 % al 92,31 %. No hay datos más allá de 8.192 tokens.
- Ausencia total de benchmarks de calidad (MMLU, HumanEval, GSM8K) y de evaluación multilingüe; el campo de idiomas está vacío.
- Longitud de contexto máxima no declarada: no se debe asumir que el modelo soporte ventanas mayores que las evaluadas.
- Riesgo de alucinación inherente al modelo base, no mitigado ni medido en esta conversión; la cuantización de los expertos puede amplificarlo.
- Restricciones de licencia: MIT, igual que el modelo base, lo que permite uso comercial; aun así, conviene revisar el fichero `LICENSE` del repositorio y la licencia del checkpoint original.
- Dependencia de hardware muy específico: SM120, PCIe P2P entre las cuatro GPU y 190 GiB de RAM de host. No hay ruta de despliegue alternativa documentada.
- Sesgos conocidos: no documentados en la información disponible.
- Adopción nula en el momento de la consulta (0 descargas, 0 *likes*), lo que reduce la probabilidad de que los fallos estén detectados por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-TrellisMX-K4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Dataset de logits del profesor: https://huggingface.co/datasets/brandonmusic/DeepSeek-V4.1-Flash-1017-Teacher-Logits (revisión `68379d81e1d7c4fd7569b8499adc3ff7c7179362`)
- Imagen de serving: `verdictai/deepseek-v41-flash-trellismx:k4-fp8-tp4-20261019` (Docker Hub, referencia textual de la model card)
- Lambda: https://lambda.ai
- Papers, blogs y demos adicionales: no disponibles. Los resultados de búsqueda web recibidos no contienen enlaces relacionados con el modelo.
