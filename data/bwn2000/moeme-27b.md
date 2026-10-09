# bwn2000/moeme-27b

## Resumen

MoEMe-27B es una conversión experimental del modelo denso Qwen3.8-27B a un layout de mezcla de expertos (MoE) mediante cirugía de checkpoint, publicada por el usuario bwn2000. No se trata de un modelo nuevo ni de un modelo entrenado desde cero: las redes feed-forward SwiGLU densas del modelo base se reparticionaron en un esquema de 12 expertos enrutados más canales compartidos, sin añadir ni eliminar parámetros (26.900.258.304 en total, 26,9B). La conversión es un Top-12 exacto, lo que significa que los 12 expertos enrutados están siempre activos y el modelo es funcionalmente equivalente al denso de origen, sólo reorganizado y cuantizado a GGUF.

La relevancia del repositorio es fundamentalmente negativa y metodológica: el propio autor lo publica como acompañamiento de un experimento cuyo titular es "la conversión funciona, la dispersión no". El reparto de canales hace que el enrutamiento Top-K elimine ancho de red en lugar de seleccionar capacidad redundante entrenada de forma independiente, de modo que ningún nivel (capa) cumple el presupuesto de calidad a ningún K menor que 12. En la práctica, esto significa que no hay aceleración real por dispersión y que cualquier uso serio del artefacto equivale a ejecutar el modelo denso original.

El modelo se distribuye únicamente en formato GGUF y requiere una build parcheada de llama.cpp que cargue `qwen35moe.expert_weights_scale` y respete las variables de entorno `MOEME_ACTIVE_K` / `MOEME_ACTIVE_K_LAYERS`; una build estándar carga el fichero pero produce logits incorrectos. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con 64 capas (48 de atencion lineal + 16 de atencion completa), FFN SwiGLU reconvertidas a layout MoE (12 expertos enrutados + canales compartidos) mediante checkpoint surgery |
| Parametros totales | 26.900.258.304 (26,9B) |
| Parametros activos | 26,9B en la configuracion publicada Top-12 (los 12 expertos enrutados estan activos); el autor documenta un Top-4 medido pero desaconseja su uso por degradacion de calidad |
| Longitud de contexto | 262.144 tokens nativos (heredados del modelo base); los benchmarks publicados se ejecutan con `-c 8192` |
| Tipos de cuantizacion | GGUF `q5_k_m` con imatrix (18,53 GiB, recomendada) y GGUF `q4_k_m` con imatrix (16,15 GiB) |
| Idiomas soportados | Ingles (unico idioma etiquetado en el repositorio); no se documentan otros idiomas |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | GGUF (llama.cpp) |

Detalles dimensionales del modelo base: `hidden_size = 5120`, `intermediate_size` de FFN = 17408, vocabulario = 248.320 tokens.

## Arquitectura y entrenamiento

No hay entrenamiento: MoEMe-27B es el resultado de una operacion mecanica sobre los pesos de Qwen3.8-27B. Cada dimension intermedia densa `F = 17408` se dividio en una particion disjunta de `F/4 = 4352` canales compartidos mas `12 × F/16 = 1088` canales enrutados, de modo que `4352 + 12 × 1088 = 17408`. No se anadio capacidad nueva: los canales se reasignaron. El modelo base tiene 64 capas, de las cuales 48 usan atencion lineal y 16 atencion completa, con contexto nativo de 262.144 tokens.

El fallo del experimento tiene una causa estructural que el propio autor explica: el enrutamiento Top-K elimina ancho de red en lugar de seleccionar capacidad experta redundante entrenada de forma independiente. El presupuesto de calidad calibrado es un error L2 relativo por capa de aproximadamente 0,01; el suelo estatico del oraculo greedy en Top-4 tiene una mediana de 0,45 en las 64 capas (mejor capa 0,16, peor capa 0,53), y ninguna capa cumple el presupuesto real para ningun `K < 12`. A esto se suma que solo alrededor del 49,4% de los bytes del artefacto viven en expertos enrutados, mientras que el 50,6% restante esta siempre activo: el techo teorico de aceleracion es 1,96x y la ganancia medida en Top-4 es 1,42x, porque en un dispositivo unico limitado por ancho de banda el enrutamiento reduce FLOPs, no bytes movidos.

Ademas, el artefacto no es un modelo ajustado para chat: es el juego de pesos del modelo fuente reorganizado, de modo que su comportamiento y sus caracteristicas de seguridad son los heredados de Qwen3.8-27B. La build de llama.cpp necesaria debe incluir un parche de una linea disponible en `docs/patches/` del repositorio de codigo.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` esta presente en el repositorio, aunque el autor aclara que no hay ajuste especifico para chat y que el comportamiento es el del modelo denso de origen.
- Razonamiento y conocimiento general: equivalente al del modelo Qwen3.8-27B subyacente, ya que la conversion es exacta en Top-12.
- Capacidades multilingues: no documentadas mas alla del ingles etiquetado.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking: no documentado en la informacion disponible.
- Vision o audio: no disponible.
- Suite de capacidades propia: el autor indica que la build `q5_k_m` supera la suite completa de 16/16 capacidades y todas las puertas de paridad de logits respecto al modelo fuente.

## Casos de uso

- Reproduccion de investigacion en enrutamiento disperso: el artefacto esta pensado para servir como punto de partida a quien quiera intentar la ruta de clustering de co-activacion, upcycling o entrenamiento con conciencia de dispersión que el autor no pudo abordar por falta de presupuesto de computo. Se usaria cargando los GGUF con la build parcheada y ajustando `MOEME_ACTIVE_K` por capa.
- Estudio de checkpoint surgery: util para medir experimentalmente el impacto de reparticionar FFN densas en canales compartidos y enrutados, comparando el error L2 relativo por capa frente al modelo original.
- Auditoria de puertas de paridad: los ficheros publicados incluyen hashes SHA-256 y criterios de paridad (KLD medio, suite de capacidades), lo que permite reproducir la validacion en otra maquina y verificar la reproducibilidad del artefacto.
- Inferencia local en equipos modestos heredando el comportamiento del denso: con `q4_k_m` (16,15 GiB) y una GPU consumer de 8 GB usando offload parcial (`-ngl 20`), se puede ejecutar el modelo en un portatil con 15,7 GiB de RAM, a cambio de ~3,8 tok/s.
- Benchmarking de llama.cpp: sirve como carga de trabajo concreta para medir el efecto de la cache KV cuantizada (`--cache-type-k q8_0 --cache-type-v q8_0`), los context checkpoints y el offload parcial sobre el rendimiento real.
- Docencia y divulgacion sobre limites de la dispersión: el repositorio es un caso de estudio explicito de por que reducir FLOPs no reduce bytes movidos en inferencia limitada por ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni metricas equivalentes. Los unicos datos cuantitativos publicados son puertas internas de paridad y mediciones de velocidad en un host concreto, que se recogen aqui por su valor tecnico pero que no son benchmarks de capacidad:

| Metrica | Valor |
|---|---|
| Suite de capacidades (q5_k_m) | 16/16 superadas |
| KLD medio (q5_k_m) | Dentro de la puerta de paridad (por debajo de 0,02) |
| KLD medio (q4_k_m) | 0,020102 frente al umbral de 0,02 (falla por 0,000102) |
| Error L2 relativo por capa, presupuesto calibrado | ~0,01 |
| Suelo greedy-oracle en Top-4 (64 capas) | Mediana 0,45; mejor 0,16; peor 0,53 |
| Porcentaje de bytes en expertos enrutados | ~49,4% |
| Porcentaje de bytes siempre activos | ~50,6% |
| Techo teorico de aceleracion | 1,96x |
| Aceleracion Top-4 medida | 1,42x |
| Throughput (RTX 4060 Laptop 8 GB) | ~3,2-3,3 tok/s con q5_k_m; ~3,8 tok/s con q4_k_m |

## Requisitos de hardware

- VRAM estimada: no es posible un calculo generico fiable porque el reparto entre VRAM y RAM depende de `-ngl`. Como referencia de tamano de fichero, `q5_k_m` ocupa 18,53 GiB y `q4_k_m` 16,15 GiB; a eso hay que sumar la cache KV (cuantizada a q8_0 en la configuracion medida) y los context checkpoints.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor solo documenta un host concreto.
- GPU consumer: el host de referencia es una RTX 4060 Laptop con 8 GB de VRAM y 15,7 GiB de RAM, con 16 nucleos de CPU. Cabe, pero con offload parcial (`-ngl 20`) y velocidades de 3,2-3,8 tok/s. No cabe entero en 8 GB de VRAM.
- RAM necesaria: al menos los ~16-19 GiB del fichero mas cache KV y checkpoints; el autor advierte que los context checkpoints reservan RAM significativa, por lo que conviene mantener `--ctx-checkpoints` bajo en maquinas pequenas.
- Opciones de despliegue: exclusivamente llama.cpp mediante `llama-server`, y solo con una build parcheada que cargue `qwen35moe.expert_weights_scale` en el loader `Qwen35MoE` y respete `MOEME_ACTIVE_K` / `MOEME_ACTIVE_K_LAYERS`. vLLM, TGI, Ollama y otras alternativas no estan documentadas y una build estandar de llama.cpp producira logits incorrectos.
- Comando de referencia del autor: `llama-server -m moeme-27b-top12-imatrix-q5_k_m.gguf -c 8192 -ngl 20 -fa --cache-type-k q8_0 --cache-type-v q8_0 --ctx-checkpoints 2 --fit off`.
- Latencia y throughput: ~3,2-3,3 tok/s (q5_k_m) y ~3,8 tok/s (q4_k_m) en el host de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MoEMe-27B (bwn2000) | 26,9B, 12 expertos enrutados top-12 | 262.144 tokens nativos | Conversion MoE por checkpoint surgery sobre Qwen3.8-27B | Sin benchmarks publicados; paridad con el denso en Top-12, sin aceleracion real por dispersion | Apache-2.0 | GGUF en HuggingFace, requiere llama.cpp parcheado |
| Qwen3.8-27B (Qwen) | 27B denso (modelo base) | 262.144 tokens | Transformer hibrido denso con 48 capas de atencion lineal y 16 completas | Referencia de calidad de la que parte MoEMe; cifras concretas no disponibles en la informacion proporcionada | Apache-2.0 | Pesos abiertos en HuggingFace |
| Bonsai 2 27B (PrismML) | No disponible | No disponible | Compresion ternaria sobre Qwen3.8 27B | Retiene el 98,2% del rendimiento de benchmarks de Qwen3.8 27B en 5,9 GB, con capacidades multimodales y agenticas (segun la fuente) | No disponible | No disponible |

La comparacion con Bonsai 2 27B procede del resultado de busqueda web citado y no de una evaluacion head-to-head verificada; se incluye unicamente porque parte de la misma base Qwen3.8 27B y representa un enfoque de compresion distinto (ternario, con perdida declarada del 1,8%) frente a la conversion MoE sin perdida pero sin ganancia de eficiencia.

## Limitaciones y advertencias

- No hay aceleracion real por dispersion: solo ~49,4% de los bytes del artefacto estan en expertos enrutados y ~50,6% estan siempre activos. El techo teorico es 1,96x y la ganancia Top-4 medida es 1,42x. En un dispositivo unico limitado por ancho de banda, el enrutamiento reduce FLOPs, no bytes movidos.
- La dispersion destruye la calidad: el presupuesto calibrado de error L2 relativo por capa es ~0,01, mientras que el suelo greedy-oracle en Top-4 tiene mediana 0,45 (mejor 0,16, peor 0,53). Ninguna capa cumple el presupuesto para ningun `K < 12`.
- No es un modelo nuevo ni mejorado: es el modelo denso reorganizado. No debe presentarse como una mejora de Qwen3.8-27B.
- No es un modelo ajustado para chat pese a la etiqueta `conversational`; hereda el comportamiento y las caracteristicas de seguridad de Qwen3.8-27B, con los sesgos y el riesgo de alucinacion del modelo fuente.
- Dependencia critica de tooling: las builds estandar de llama.cpp cargan el fichero pero producen logits incorrectos. Sin el parche del loader, los resultados no son validos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la informacion; sin validacion independiente por parte de terceros.
- Idiomas: unicamente ingles etiquetado; el rendimiento en castellano u otros idiomas no esta documentado.
- Contexto: aunque el modelo base soporta 262.144 tokens, la configuracion publicada y medida usa `-c 8192`; no hay datos de rendimiento ni de calidad a contextos largos en este artefacto.
- El autor advierte explicitamente de que hay que leer el repositorio antes de usar esto "para algo serio".
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales conocidas para uso comercial, pero el artefacto no aporta ninguna ventaja practica sobre el modelo original para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bwn2000/moeme-27b
- Repositorio de codigo del experimento: https://github.com/trowel344/moeme
- Modelo base (organizacion Qwen en HuggingFace): https://huggingface.co/Qwen
- Bonsai 2 27B (PrismML), enfoque alternativo de compresion sobre Qwen3.8 27B: https://prismml.com/news/bonsai-2-27b
- Guia de Qwen3.8 27B: https://www.progressiverobot.com/2026/08/13/qwen3-8-27b-open-weights/
- Analisis sobre modelos de 27B para desarrolladores: https://aiindigo.com/blog/rise-of-small-giant-27b-models-developer-sweet-spot
- Leaderboard de referencia de benchmarks: https://benchlm.ai/
- Hashes SHA-256 de los ficheros:
  - `moeme-27b-top12-imatrix-q5_k_m.gguf`: `9996f4b352fe2c7016ecb675d11deb4e5eef99456b510478dc01b853bddffd38`
  - `moeme-27b-top12-imatrix-q4_k_m.gguf`: `3797152bf530563ea7787162f2f1bfd4cf2e9cf1e780b041d21b2a0a56551f94`
