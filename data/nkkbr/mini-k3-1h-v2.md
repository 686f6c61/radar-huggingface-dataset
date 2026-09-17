# nkkbr/Mini-K3-1H-v2

## Resumen

Mini-K3-1H v2 es un checkpoint de preentrenamiento de aproximadamente mil millones de parametros logicos (1.016.780.524) publicado por el usuario nkkbr en HuggingFace. No es un modelo de proposito general ni un asistente: forma parte de una comparacion controlada de 20 arquitecturas que reproducen, a escala reducida, los operadores de Kimi-K3 (KDA, Gated MLA, Attention Residuals, Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing). El problema que aborda es metodologico: permitir que investigadores comparen variantes de atencion lineal, granularidad de decaimiento, longitud de convolucion o codificacion posicional bajo una inicializacion comun y una misma secuencia de datos.

Tecnicamente es un decoder hibrido de 13 capas, con 9 capas KDA y 4 capas Gated MLA, anchura oculta de 1024, 12 cabezas de atencion y un MoE con 64 expertos enrutados mas 2 compartidos con top-k 4. Solo 353.556.204 parametros se activan por token, de modo que el coste de computo se parece mas al de un modelo denso de ~350M que al de uno de ~1.000M. La longitud de secuencia de entrenamiento es de 8.192 tokens y el checkpoint publicado corresponde a 4.000.317.440 de los 16.000.000.000 tokens objetivo.

Su relevancia ahora es la de un banco de pruebas reproducible y abierto de arquitecturas hibridas de atencion lineal: el autor fija semilla base, esquema de inicializacion por nombre y forma, mascaras de documento y reseteo de estado recurrente en cada frontera de segmento, de modo que las diferencias observadas entre variantes pueden atribuirse al cambio arquitectonico y no al azar de la inicializacion. Con 149 descargas y sin likes, es un artefacto de investigacion de nicho, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido: 13 capas (9 KDA de atencion lineal + 4 Gated MLA), MoE Stable LatentMoE, Attention Residuals, activaciones SiTU, puertas de salida, Quantile Balancing |
| Parametros totales | 1.016.780.524 |
| Parametros activos | 353.556.204 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos BF16; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) con codigo de modelado propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |
| Capas y distribucion | 13 capas: KDA en indices [1, 2, 3, 5, 6, 7, 9, 10, 11], Gated MLA en [4, 8, 12, 13] |
| Anchura oculta / cabezas / anchura por cabeza KDA | 1024 / 12 / 128 |
| MoE | 64 expertos enrutados, 2 compartidos, top-k 4; anchura oculta del experto enrutado 512; 1 capa densa antes del MoE |
| Detalles KDA / MLA | Convolucion causal depthwise con kernel 4; 128 grupos de decaimiento contiguos por cabeza; MLA en modo NoPE con puerta de salida activada |
| Vocabulario y tokens especiales | 163.840 (BOS 163.584, EOS de generacion 163.586, PAD 163.839) |
| Checkpoint | `checkpoint-tokens-004000317440`; 4.000.317.440 tokens validos; 6.104 pasos de optimizador; BF16 con estado de decaimiento KDA, convolucion, normalizacion y router en FP32 |
| Tamano del repositorio | 10,2 GB (muy superior a los ~2 GB que ocupan los pesos BF16, lo que sugiere artefactos o checkpoints adicionales no detallados en la model card) |
| Descargas / likes | 149 / 0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atencion en el mismo decoder. Las capas KDA (Kimi Delta Attention) implementan atencion lineal con estado recurrente, una convolucion causal depthwise de kernel 4 sobre Q/K/V y 128 grupos de decaimiento contiguos por cabeza, lo que permite un decaimiento selectivo muy granular a coste lineal. Las capas Gated MLA usan atencion latente con modo posicional NoPE y puerta de salida, aportando el componente de atencion completa en cuatro de las trece capas. Sobre esa columna vertebral se anade un MoE tipo Stable LatentMoE con 64 expertos enrutados y 2 compartidos, top-k 4, anchura 512 por experto y una capa densa previa. Los bloques de Attention Residuals tienen tamano 4.

El entrenamiento usa Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1% de warmup lineal y Quantile Balancing en linea con histogramas de 1.000 bins. El router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas no sesgadas renormalizadas. No se aplico post-entrenamiento alguno (ni SFT, ni RLHF, ni DPO). Los documentos empaquetados estan aislados de forma estricta: MLA usa mascara causal bloqueada por documento y KDA reinicia el estado recurrente y el historial de convolucion corta en cada frontera de segmento. Las 20 ejecuciones comparten inicializacion determinista por nombre y forma con semilla base 20260914, de modo que los parametros con el mismo nombre y forma empiezan byte a byte identicos.

## Capacidades

- Generacion de texto autoregresiva a nivel de preentrenamiento, sin ajuste por instrucciones.
- Modelado de lenguaje en secuencias de hasta 8.192 tokens con atencion hibrida (lineal KDA + latente MLA).
- Capacidad de continuar texto, completar documentos y calcular verosimilitud/perplejidad sobre corpus.
- Soporte de tool calling / function calling: no disponible (no hay post-entrenamiento ni formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el autor no declara idiomas ni composicion del corpus).
- Capacidad especial de investigacion: ablaciones controladas de arquitectura (ratio KDA/MLA, granularidad de decaimiento, longitud de convolucion, codificacion posicional) con inicializacion y flujo de datos compartidos.
- Capacidad de analisis interno: inspeccion de enrutado MoE, utilizacion de expertos y efecto del Quantile Balancing de 1.000 bins.
- Vision, audio y modalidades adicionales: no disponibles (el checkpoint es explicitamente text-only).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en ablaciones de arquitectura: replicar el protocolo de comparacion de las 20 variantes usando la inicializacion determinista con semilla 20260914 y el mismo esquema de datos append-only, de modo que las diferencias de perplejidad sean atribuibles al cambio arquitectonico.
- Estudio del equilibrio entre atencion lineal y atencion completa: variando el ratio KDA/MLA y la granularidad de decaimiento (128 grupos contiguos por cabeza) puede medirse el impacto en NLL a 8K de contexto sin cambiar el resto del modelo.
- Punto de partida para fine-tuning supervisado de dominio: al ser un checkpoint de preentrenamiento de ~1.000M de parametros logicos con 353M activos, el coste de adaptarlo a un dominio concreto (juridico, sanitario, codigo interno) es inferior al de un modelo denso equivalente.
- Analisis de enrutado en MoE: con 64 expertos enrutados, 2 compartidos y top-k 4, el checkpoint sirve para estudiar colapso de expertos, equilibrio de carga y efectos del Quantile Balancing en linea sobre las decisiones del router.
- Destilacion y experimentos de compresion: el modelo puede actuar como alumno o como profesor proxy en estudios de destilacion hacia arquitecturas mas pequenas o hacia variantes lineales puras, aprovechando que su coste por token equivale al de un denso de ~350M.
- Evaluacion de eficiencia de estado recurrente: al resetear KDA estado e historial de convolucion en cada frontera de segmento, es un banco de pruebas para medir decodificacion incremental y gestion de cache con estado frente a cache KV clasica.
- Benchmarking de hardware para arquitecturas hibridas: permite medir throughput y latencia reales de un modelo con atencion lineal y MoE a 8K de contexto en GPU de consumo, comparando con modelos densos de tamano similar.
- Pruebas de tokenizador y de vocabulario: el vocabulario de 163.840 entradas con tokens especiales en posiciones concretas (BOS 163.584, EOS 163.586, PAD 163.839) permite validar pipelines de tokenizacion y de enmascarado antes de escalar a modelos mayores.
- Reproducibilidad de investigacion: los manifiestos JSON con revisiones de codigo fuente, cuotas de tokens, hashes de planificacion y hashes de particion de validacion permiten auditar la ejecucion completa, algo poco habitual en checkpoints publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que se trata de un checkpoint intermedio de investigacion que aun no ha sido evaluado en tareas downstream; solo se registran NLL y perplejidad de desarrollo en W&B y en las metricas JSONL de la ejecucion.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,03 GB para 1.016.780.524 parametros (el parametro activo por token es de 353.556.204, por lo que el coste de computo por token es notablemente inferior al de un modelo denso del mismo tamano).
- Estado de control en FP32: decaimiento KDA, convolucion, normalizacion y router se mantienen en FP32 segun la implementacion, lo que anade una huella adicional de decenas o cientos de MB.
- VRAM estimada para inferencia: del orden de 3 a 5 GB en BF16 con lote pequeno y contexto de 8.192 tokens; el repositorio completo ocupa 10,2 GB en disco.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB (RTX 3070, 4060) deberia caber con lote 1, aunque no hay mediciones publicadas que lo confirmen.
- GPU de datacenter: A100, H100, L40S o A6000 no son necesarias por memoria; solo aportan throughput. El modelo no requiere multi-GPU.
- Opciones de despliegue: no disponible en runtimes estandar. Al usar KDA, Gated MLA, Attention Residuals y Stable LatentMoE, no hay soporte conocido en vLLM, llama.cpp, Ollama ni TGI; la ejecucion requiere el codigo incluido en el repositorio (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`) sobre PyTorch con el `config.json` adjunto.
- Cuantizacion: no hay variantes GGUF, AWQ ni GPTQ publicadas; convertir a 4 u 8 bits exigiria implementar el operador KDA y el enrutado MoE en el runtime de destino.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion es estructural, ya que Mini-K3-1H v2 no publica resultados de benchmarks. Los datos de los modelos alternativos proceden de sus model cards oficiales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|---|
| Mini-K3-1H v2 (nkkbr) | 1.016.780.524 | 353.556.204 | 8.192 tokens de entrenamiento | no disponible | no publicados |
| Llama-3.2-1B | ~1.240 millones | denso | 128.000 tokens | Llama 3.2 Community License | consultar model card oficial |
| Qwen2.5-1.5B | ~1.540 millones | denso | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | consultar model card oficial |
| TinyLlama-1.1B | ~1.100 millones | denso | 2.048 tokens | Apache 2.0 | consultar model card oficial |

La diferencia de categoria es clara: las alternativas son modelos densos con licencia explicita, soporte amplio en runtimes estandar (llama.cpp, vLLM, TGI, Ollama) y, en algunos casos, versiones ajustadas por instrucciones. Mini-K3-1H v2 ofrece una arquitectura hibrida poco comun con coste de activacion de solo 353M de parametros, pero sin licencia declarada, sin idiomas declarados, sin post-entrenamiento y sin soporte en runtimes convencionales, lo que lo situa como artefacto de investigacion y no como sustituto directo de esos modelos.

## Limitaciones y advertencias

- Solo preentrenamiento: no se aplico SFT, RLHF ni DPO. No debe tratarse como un asistente que sigue instrucciones.
- Sin evaluacion downstream: el propio autor afirma que el checkpoint no ha sido evaluado en tareas y que solo existen metricas de NLL y perplejidad de desarrollo.
- Checkpoint intermedio: contiene 4.000.317.440 de los 16.000.000.000 tokens objetivo; el tag final (`checkpoint-tokens-016000000000-final`) se crea solo al completar la cifra completa.
- Salidas potencialmente inexactas, sesgadas, inseguras o repetitivas, segun advertencia explicita de la model card.
- Idiomas no declarados: no se especifica la composicion del corpus ni la cobertura linguistica; el vocabulario de 163.840 entradas no implica cobertura declarada.
- Licencia no disponible: no puede asumirse uso comercial. Ademas, los datasets de origen conservan sus propias licencias y el repositorio no redistribuye su texto, solo manifiestos con hashes.
- Extrapolacion no validada: los rankings de arquitectura obtenidos a ~1.000M de parametros logicos y 8.192 tokens de longitud de entrenamiento necesitan confirmacion antes de extrapolarse al Kimi-K3 completo.
- Estado del optimizador no publicado de forma deliberada: no es posible reanudar el entrenamiento exactamente desde este checkpoint.
- Arquitectura no estandar: sin soporte en vLLM, llama.cpp, Ollama ni TGI, lo que implica dependencia del codigo incluido en el repositorio y riesgo de mantenimiento.
- Riesgo de alucinacion elevado en cualquier uso generativo, dado que no hay alineacion ni ajuste instructivo.
- El repositorio ocupa 10,2 GB frente a los ~2 GB de los pesos BF16: conviene verificar el contenido real antes de descargarlo completo.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-v2
- Archivos de documentacion citados en la model card (dentro del repositorio): `ARCHITECTURE.md`, `ARCHITECTURE_PACKAGE_README.md`, `VARIANT.md`, `README.md`
- Codigo de carga y prueba incluido en el repositorio: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `config.json`
- Manifiestos de reproducibilidad: archivos JSON con revisiones de codigo fuente congeladas, cuotas de tokens, hashes de planificacion, configuracion del optimizador, benchmark de hardware y hashes de particion de validacion (incluidos en el repositorio)
- Metricas de entrenamiento: NLL y perplejidad de desarrollo registradas en W&B y en las metricas JSONL de la ejecucion (sin URL publica en la informacion disponible)
- Paper, blog o demo: no disponibles
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (articulos sobre empresas publicas y privadas en Indonesia); no se han encontrado enlaces adicionales relevantes
