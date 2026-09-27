# Ethosoft/rmala-v14-full-100m-3b

## Resumen

rmala-v14-full-100m-3b es un checkpoint base de investigacion de un modelo de lenguaje causal en turco, desarrollado por Ethosoft y publicado tambien bajo el espejo MercanAI. Se trata de un modelo de 100.467.856 parametros entrenado desde cero sobre exactamente 3.000 millones de tokens objetivo, con una arquitectura de atencion lineal basada en GLA (Gated Linear Attention) y una variante propia denominada V14-LM. No es un modelo ajustado por instrucciones ni un modelo de chat: es una pieza de investigacion concebida para experimentar con alternativas eficientes a la atencion cuadratica clasica.

Su relevancia actual reside en el estudio comparativo que acompana al checkpoint: el autor publica una ablacion controlada de cinco variantes (gla, v14_full, v14_half, full y hola) que comparten tokenizador, orden de tokens y conjuntos de validacion/test disjuntos, con metricas de perplexity (PPL) y bits por byte (BPB). Esto permite analizar el intercambio entre mecanismos de atencion lineal y atencion completa a una escala pequena y reproducible. El contexto maximo es de 2048 tokens y el modelo solo maneja turco.

El checkpoint se distribuye en safetensors, preserva los valores FP32 originales y requiere un cargador propio incluido en el repositorio, ya que su arquitectura no esta registrada en `AutoModel` de Transformers. La licencia no esta explicitamente definida y se remite a `THIRD_PARTY_NOTICES.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion lineal GLA / V14-LM (RMSNorm, SwiGLU, embeddings de entrada/salida atados) |
| Parametros totales | 100.467.856 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en FP32; la inferencia de referencia usa autocast BF16 con TF32 desactivado) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (no se asigna nueva licencia en esta subida; ver `THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | safetensors |
| Capas | 16 |
| Dimensión del modelo | 640 |
| Cabezas de atencion | 10 cabezas de tamano 64 (GLA/V14); la variante HoLA usa 5 cabezas de tamano 128 |
| Tokens de entrenamiento | 3.000.000.000 |
| Variante | v14_full |

## Arquitectura y entrenamiento

El modelo sigue un diseno de transformer causal con 16 capas, anchura 640 y embeddings de entrada/salida atados de 32K entradas, normalizacion RMSNorm y activacion SwiGLU. La atencion principal es lineal (GLA) con 10 cabezas de tamano 64; la variante de atencion completa utiliza SDPA causal con RoPE, y la variante HoLA emplea 5 cabezas de tamano 128 con cache betae oficial, ventana de 64 y tamano de chunk de 256. La innovacion mas especifica es V14-LM, una adaptacion del gate sintetico V14 que incorpora claves contextuales, valores en int8, un presupuesto de banco de 2048 bytes por cabeza y limites de admision de lectura/escritura del 5%. Un gate aprendido de tipo straight-through aplica un umbral duro de 0,99 en forward, con alpha de memoria aceptada de 1 o 0,5.

El entrenamiento se realizo desde cero sobre un subconjunto fijo de 3.000 millones de tokens de la coleccion pre-tokenizada MercanSet V11 / MercanPretraining, con validacion y test disjuntos por shard, y una unica semilla de entrenamiento (41001). No se aplico deduplicacion de texto entre colecciones, por lo que el autor no reclama ausencia absoluta de contaminacion. No se menciona RLHF, DPO ni ningun ajuste posterior; se trata de un modelo estrictamente base. La evaluacion usa fragmentos de 2048 tokens; la PPL incluye el EOS terminal y el BPB calcula la NLL de contenido dividida por el numero de bytes UTF-8 originales, excluyendo dicho EOS. Las estimaciones de FLOP son algoritmicas, no mediciones completas de hardware.

## Capacidades

- Generacion de texto causal en turco: el modelo completa secuencias a partir de un prefijo, sin modo de instrucciones ni de chat.
- Modelado de lenguaje base: util para calcular perplexity y bits por byte sobre corpus turcos.
- Extraccion de representaciones internas: al ser un checkpoint de investigacion, permite analizar activaciones y comportamiento de las cabezas de atencion.
- Soporte de tool calling / function calling: no disponible; no hay ajuste de instrucciones ni plantilla de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay entrenamiento orientado a agentes ni a cadenas de razonamiento.
- Capacidades multilingues: limitadas al turco (unico idioma declarado).
- Capacidades especiales: no dispone de modo thinking, vision ni audio. La unica peculiaridad tecnica es el mecanismo de memoria por gate V14-LM.
- Contexto largo: limitado a 2048 tokens, sin decodificacion optimizada de cache KV.

## Casos de uso

- Investigacion sobre atencion lineal: comparar el comportamiento de GLA, atencion completa y HoLA bajo el mismo tokenizador y el mismo orden de tokens, usando las metricas PPL/BPB publicadas como linea base reproducible.
- Ajuste fino posterior para turco: servir como punto de partida (preentrenamiento base) para fine-tuning supervisado en tareas concretas como clasificacion de texto o resumen, aprovechando que no esta contaminado por ajuste de instrucciones.
- Modelado de lenguaje para evaluacion de corpus: calcular perplexity sobre texto turco para medir la calidad o el dominio de un dataset antes de entrenar modelos mayores.
- Experimentos de tokenizacion: al compartir tokenizador entre variantes, permite estudiar el impacto de la segmentacion en las metricas BPB sobre bytes UTF-8.
- Docencia y experimentacion academica: modelo lo bastante pequeno (0,4 GB en safetensors) para reproducir entrenamientos y ablaciones en un solo equipo.
- Pruebas de eficiencia de memoria externa: el gate V14-LM con presupuesto de banco por cabeza y limites de admision sirve para investigar mecanismos de memoria con coste acotado, sin asumir que impliquen una reduccion del 95% de FLOPs del modelo completo.
- Generacion de datos sinteticos de baja exigencia: producir texto turco de borrador para filtrar y revisar posteriormente, teniendo en cuenta que es un modelo base y puede generar contenido incoherente.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de la model card, que comparan las cinco variantes entrenadas bajo el mismo protocolo. No hay datos de MMLU, HumanEval ni GSM8K. Menos PPL y menos BPB indican mejor resultado.

| Variante | Test PPL | Test BPB | FLOP algoritmicos de entrenamiento |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

El conjunto de test consta de 11.352.596 tokens y 39.843.759 bytes UTF-8 originales. El propio autor advierte que la mejora de v14_half sobre GLA es pequena y no demuestra superioridad robusta, y que v14_full no mejoro la PPL de test. Las cifras de FLOP son estimaciones algoritmicas, no mediciones de hardware completas.

## Requisitos de hardware

- VRAM estimada en inferencia: el checkpoint pesa aproximadamente 0,4 GB en FP32; con pesos y activaciones se puede ejecutar comodamente por debajo de 1 GB de VRAM en FP32 y en torno a 0,2-0,5 GB con autocast BF16.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; el modo de computo probado usa BF16 autocast y desactiva TF32. Para entrenamiento o ablaciones serias, A100 o H100 son utiles por throughput, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: no estan soportadas vLLM, llama.cpp, Ollama ni TGI de serie, porque la arquitectura no esta registrada en `AutoModel` de Transformers. Es necesario usar el cargador incluido (`inference.py`) sobre PyTorch nativo, Linux NVIDIA CUDA x86_64.
- Rendimiento y latencia: no disponible. Se sabe que el decodificador de referencia recomputa el prefijo completo en cada paso y se detiene en el limite de 2048 tokens, por lo que no es un decodificador optimizado con cache KV y su latencia por token no representa un uso de produccion.
- Compilacion: la primera ejecucion compila kernels Triton, lo que anade una latencia inicial.
- Tokenizador: el binario nativo incluido esta dirigido a Linux x86_64 con CPython 3.11 o superior.

## Comparativa con modelos similares

No se proporcionan modelos externos comparables en la informacion disponible. La comparacion documentada por el autor es interna al propio proyecto, entre las cinco variantes de la misma familia, que comparten tokenizador, tokens de entrenamiento y conjuntos de validacion/test, lo que la hace directamente comparable:

| Variante | Test PPL | Test BPB | Arquitectura de atencion |
|---|---:|---:|---|
| hola | 20,419358 | 1,228817 | GatedDeltaNet / HoLA con cache betae |
| full | 22,187501 | 1,262025 | Atencion completa (SDPA causal, RoPE) |
| v14_half | 25,482146 | 1,319796 | Atencion lineal GLA con gate V14 al 50% |
| v14_full | 25,591686 | 1,321246 | Atencion lineal GLA con gate V14 completo |
| gla | 25,561380 | 1,321054 | Atencion lineal GLA normalizada |

Todas las variantes comparten 100.467.856 parametros, contexto de 2048 tokens, licencia no definida y disponibilidad publica en HuggingFace a traves de los repositorios de Ethosoft y MercanAI. La comparacion con alternativas de terceros: no disponible.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue ordenes, no mantiene conversacion de chat y puede producir texto incoherente.
- Riesgo de alucinacion alto: con 3.000 millones de tokens de entrenamiento y 100 millones de parametros, el conocimiento factual es muy limitado.
- Un unico idioma: solo turco declarado; no hay soporte multilingue.
- Contexto corto: 2048 tokens, y el decodificador de referencia no usa una cache KV optimizada, por lo que la generacion es lenta.
- Contaminacion no verificada: no se aplico deduplicacion de texto entre colecciones; el autor no reclama ausencia absoluta de contaminacion.
- Evidencia limitada: se uso una sola semilla de entrenamiento (41001) y el propio autor indica que los resultados no establecen superioridad robusta entre variantes.
- Diagnostico incompleto: no se incluyen resultados finalizados de recuperacion a largo plazo ni de razonamiento.
- Sobreinterpretacion del gate V14: el autor advierte que el diseno de memoria no implica una reduccion del 95% de FLOPs del modelo completo ni que las lecturas aceptadas sean correctas.
- Licencia indefinida: no se asigna una licencia nueva en la subida y se remite a `THIRD_PARTY_NOTICES.md`; conviene revisarlo antes de cualquier uso comercial.
- No apto para produccion segun el propio autor: no se hace ninguna afirmacion de inocuidad general ni de preparacion para produccion.
- No redistribuye datos de entrenamiento, estados del optimizador ni credenciales; solo los tensores finales. La cabeza atada se almacena una vez y la restaura `inference.py`.
- Compatibilidad restringida: al no estar registrado en `AutoModel`, no funciona con los runtimes habituales sin trabajo adicional.

## Enlaces

- HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-v14-full-100m-3b
- HuggingFace (espejo MercanAI): https://huggingface.co/MercanAI/rmala-v14-full-100m-3b
- Documentos incluidos en el repositorio (referenciados en la model card): `LM100_PROTOCOL.md`, `training_config.json`, `THIRD_PARTY_NOTICES.md`, `evaluation.json`, `inference.py`, `requirements.txt`
- Paper, blog o demo adicionales: no disponible
