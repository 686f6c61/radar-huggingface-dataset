# Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r03

## Resumen

`svd-safety-l2_basis_remove50_swapdiscnet_b010_r03` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de una versión comprimida de `meta-llama/Llama-2-7b-chat-hf` mediante la técnica Basis Sharing (ICLR 2025), que comparte bases SVD entre grupos de 2 capas adyacentes y elimina el 50,00 % de los parámetros densos. Sobre ese modelo comprimido se aplicaron 3 de las 10 rondas de un proceso iterativo de intercambio de parámetros neutral («parameter-neutral swap») guiado por la regla de selección `swapdiscnet_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos.

El objetivo declarado no es ofrecer un asistente conversacional desplegable, sino servir como artefacto experimental para cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. El autor lo describe explícitamente como una celda de una rejilla de experimentos sobre reglas de selección y presupuestos, y advierte que varias ramas de esa rejilla están deliberadamente degradadas en seguridad respecto al modelo original.

El checkpoint conserva 6.738.415.616 parámetros (fracción resultante de 0,4998 respecto al modelo denso) y ocupa 13,5 GB en el repositorio. Es relevante ahora porque conecta tres líneas de trabajo activas: compresión eficiente de LLM, interpretabilidad de mecanismos de seguridad y evaluación de trade-offs seguridad/utilidad. El modelo base hereda la arquitectura transformer decoder-only de Llama 2, con una longitud de contexto de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2 7B), con bases SVD compartidas entre pares de capas adyacentes (Basis Sharing) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 mil millones) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision completa; no se distribuyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Llama 2 esta orientado principalmente al ingles) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Fraccion de parametros resultante | 0,4998 del modelo denso (50,00 % de parametros eliminados, mas la restauracion aplicada) |
| Parametros intercambiados | 19.416.320 (0,30 % de los parametros de proyeccion densos) |
| Componentes restaurados / sustituidos | 1390 / 1390 |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 7B parámetros con la configuración de Llama 2 (atención con RoPE, normalización RMSNorm y activación SwiGLU). Sobre esa base se aplica una compresión por descomposición en valores singulares con la variante Basis Sharing: en lugar de calcular una base SVD independiente por capa, se comparten bases entre grupos de 2 capas adyacentes, lo que reduce el coste de almacenamiento de las bases y permite eliminar el 50,00 % de los parámetros densos. El resultado es un modelo del mismo grafo computacional pero con matrices de proyección factorizadas y truncadas.

Sobre el checkpoint comprimido se ejecuta un proceso iterativo de intercambio de parámetros neutral: en cada ronda se seleccionan componentes candidatos mediante la regla `swapdiscnet_iter` y se sustituyen hasta un 0,100 % de los parámetros densos por ronda, con un presupuesto total de ejecución del 1,000 %. El valor de intercambio utilizado es `net` (valor de inserción más valor de eliminación del desalojo ordenado por sigma). El checkpoint publicado corresponde a la ronda 3 de 10, con 1390 componentes restaurados y 1390 sustituidos. Como paso de recuperación se aplica un LoRA de rango 8 únicamente sobre los coeficientes por capa (las bases permanecen congeladas, de modo que el presupuesto de parámetros no cambia), durante 2 épocas, con lr 0,0001, batch 64 y el dataset `alpaca-cleaned`. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base ni la composición completa del dataset de alineación original de Llama 2.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-2-7b-chat, mantiene el formato de dialogo con tokens especiales `[INST]` y `[/INST]`, aunque con calidad degradada por la compresion.
- Razonamiento y conocimiento general: heredado del modelo base, sin datos de evaluacion publicados en esta ficha que lo cuantifiquen.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no medida en la informacion proporcionada.
- Tool calling / function calling: no documentado para este checkpoint (Llama 2 chat no incluye un formato nativo de tool calling).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo base esta orientado principalmente al ingles.
- Capacidad especial: comportamiento de rechazo y seguridad medible mediante AdvBench, StrongREJECT y WildGuard, que es el objeto de estudio del artefacto.
- Vision o audio: no soportados.
- Modo de pensamiento explicito: no soportado.

## Casos de uso

- Estudio de ablacion de reglas de seleccion: la celda permite comparar `swapdiscnet_iter` frente a otras reglas del grid del autor bajo el mismo presupuesto de restauracion (1,000 % de parametros densos) y aislar el efecto de la regla sobre la tasa de exito de ataque.
- Evaluacion de dano por compresion: sirve como punto de medida intermedio (ronda 3 de 10) para trazar la curva de degradacion de seguridad a medida que se aplican rondas sucesivas de intercambio sobre un modelo comprimido al 50 %.
- Red-teaming y evaluacion de seguridad: sus metricas de AdvBench ASR (0,1462) y StrongREJECT ASR (0,2204) con juez HarmBench permiten calibrar pipelines de evaluacion automatica de jailbreaks en modelos comprimidos.
- Investigacion en interpretabilidad: el par de componentes restaurados/sustituidos (1390/1390) y las bases SVD compartidas ofrecen un sustrato para analizar que subespacios de pesos estan asociados a comportamientos de rechazo.
- Benchmark de metodos de recuperacion: el LoRA r=8 sobre coeficientes con bases congeladas es un protocolo reproducible para comparar tecnicas de reparacion de modelos comprimidos sin alterar el presupuesto de parametros.
- Analisis de sobre-rechazo: la metrica de sobre-rechazo macro medida con WildGuard (0,1547) permite estudiar el equilibrio entre seguridad y utilidad en modelos comprimidos, un eje habitualmente ignorado en la literatura de compresion.
- Punto de partida para destilacion o ajuste posterior: al ser un checkpoint intermedio con pesos en safetensors, puede servir como inicializacion en experimentos que midan si un ajuste fino adicional recupera capacidades perdidas.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,1462 | HarmBench judge |
| StrongREJECT ASR | 0,2204 | HarmBench judge |
| Sobre-rechazo macro | 0,1547 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la degradacion relativa a partir de estos datos.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16, ~13,5 GB de pesos): en torno a 15-17 GB considerando cache KV para 4096 tokens; cabe en una RTX 4090 (24 GB), A100 40 GB, L40S o H100.
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos mas cache; viable en GPUs consumer de 12 GB (RTX 3060 12 GB, RTX 4070).
- VRAM estimada en int4: aproximadamente 4-4,5 GB; viable en GPUs de 8 GB, aunque requiere cuantizacion propia porque el repositorio no publica variantes cuantizadas.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en RTX 3060 12 GB o inferiores.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), y vLLM u otros servidores compatibles con pesos safetensors de Llama. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no incluida.
- Latencia y throughput estimados: no disponibles; no se publican mediciones en la informacion proporcionada.
- Nota: al ser un artefacto de investigacion con el rendimiento de seguridad degradado de forma deliberada en algunas variantes, no se recomienda su despliegue en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Rendimiento de seguridad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r03` | 6,74 B (0,4998 del denso) | 4096 | Llama 2 Community License | Checkpoint intermedio de investigacion, 0 descargas, 0 likes | AdvBench ASR 0,1462; StrongREJECT ASR 0,2204 |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6,74 B | 4096 | Llama 2 Community License | Modelo de proposito general ampliamente desplegado | no disponible en la informacion proporcionada |
| Otras celdas del grid del mismo autor (otras reglas y presupuestos) | no disponible | 4096 (heredado) | Llama 2 Community License | Artefactos de investigacion | no disponible |

No se dispone de datos comparativos frente a alternativas de la misma categoria (por ejemplo, otros modelos de 7B comprimidos por SVD o destilados) en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: el propio autor indica que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma deliberada: la compresion por si sola eleva la tasa de exito de ataque respecto al modelo original, y algunas ramas del grid estan disenadas explicitamente para ser menos seguras. La tasa de AdvBench ASR de 0,1462 y la de StrongREJECT ASR de 0,2204 son valores medidos, no garantias de robustez.
- Riesgo de alucinacion: no se documenta ningun ajuste especifico para reducirla; la compresion al 50 % de los parametros densos puede aumentar la perdida de fidelidad factual.
- Sesgos: no se publica ninguna evaluacion de sesgo en la informacion disponible. El modelo base Llama 2 tiene sesgos conocidos documentados por su autor original.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base esta optimizado para ingles, por lo que el rendimiento en castellano no esta caracterizado.
- Limitaciones de contexto: 4096 tokens, insuficiente para tareas de contexto largo o recuperacion sobre documentos extensos.
- Restricciones de licencia: se aplica la Llama 2 Community License. `LICENSE.txt` y `USE_POLICY.md` estan incluidos en el repositorio y su cumplimiento es obligatorio, con las restricciones de uso comercial y de escala que impone esa licencia (entre ellas, la clausula de licencia adicional para servicios con mas de 700 millones de usuarios mensuales y las prohibiciones de uso del apartado de uso aceptable).
- Atribucion: el modelo se construyo con Llama 2 y debe conservar la atribucion correspondiente.
- Caveat de reproducibilidad: el checkpoint es una ronda intermedia (3 de 10) de una ejecucion mas larga; los resultados no son extrapolables automaticamente al punto final del presupuesto del 1,000 %.
- Ausencia de benchmarks de capacidad: sin datos de MMLU, HumanEval o GSM8K no es posible acotar la utilidad general del modelo.
- Metadatos incompletos: el repositorio no publica informacion de cuantizacion, idiomas ni resultados de capacidad, y no registra descargas ni valoraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Referencia de la tecnica de compresion: Basis Sharing, ICLR 2025 (enlace al paper no disponible en la informacion proporcionada)
- No se han encontrado enlaces relevantes adicionales en la busqueda web realizada; los resultados devueltos correspondian a paginas de soporte de Microsoft ajenas al modelo.
