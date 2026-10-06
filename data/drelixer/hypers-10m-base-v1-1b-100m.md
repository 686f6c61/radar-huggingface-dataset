# drelixer/HyperS-10M-Base-v1.1b-100M

## Resumen

HyperS-10M-Base-v1.1b-100M es un modelo de lenguaje causal experimental de 9.976.787 parametros (~10M) desarrollado por Sayak Mondal (usuario `drelixer` en HuggingFace). No es un Transformer: emplea una arquitectura recurrente denominada HyperS-v1.1b, construida alrededor de un mecanismo de estado geometrico persistente llamado Parallel Adaptive HyperState (PAHS), con geometria hiperesferica local y metricas adaptativas en lugar de self-attention. El modelo mantiene un estado persistente de 7.680 valores escalares por secuencia (unos 30 KiB en FP32) que se arrastra entre fragmentos, sin cache KV.

Se trata de un checkpoint base de investigacion: no esta afinado para instrucciones ni para chat, y su publicacion es un release de solo pesos en formato `.pt` de PyTorch, no un paquete nativo de `transformers`. El modelo fue entrenado sobre 100.001.792 tokens con fragmentos de 64 tokens en precision BF16, usando una mezcla de TinyStories y FineWeb-Edu, con un vocabulario de 8.192 entradas y el tokenizador propio HGT-8K.

Su relevancia es fundamentalmente cientifica: sirve como banco de pruebas reproducible para estudiar si un estado recurrente de tamano fijo puede acumular informacion predictiva de historial largo. Los resultados publicados por el autor muestran que el modelo aprovecha historial de hasta 1.024 tokens (ganancia de +0,6325 en entropia cruzada frente a historial cero en FineWeb-Edu), pero que un Transformer de ~10M parametros entrenado con exactamente los mismos 100.001.792 tokens obtiene una entropia cruzada sustancialmente menor en contexto corto (2,9653 frente a 3,6181 en validacion general).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HyperS-v1.1b, decoder-only causal recurrente con Parallel Adaptive HyperState (PAHS); sin self-attention ni KV cache |
| Parametros totales | 9.976.787 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no se define una ventana de contexto tipo Transformer; longitud de chunk de entrenamiento 64 tokens, con evaluacion de historial de hasta 1.024 tokens |
| Tipos de cuantizacion | no disponible (release solo en `.pt` de PyTorch; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no especificada por el autor |
| Formato de pesos | `.pt` (state_dict de PyTorch) junto a `hgt_8k.json`, `hypers_config.json` y `release_manifest.json` |

Datos adicionales de configuracion: dimension oculta 384; 5 capas recurrentes; 4 pistas de memoria por capa; 8 carriles HSG; dimension de carril 48; rango metrico de carril 4; dimension oculta del mixer 896; rango del decoder 32; vocabulario 8.192; tokenizador HGT-8K; estado persistente de 7.680 escalares por secuencia en FP32 (~30 KiB por secuencia).

## Arquitectura y entrenamiento

HyperS-v1.1b sustituye la atencion por una recurrencia de estado afin: `z_t = lambda_t * z_(t-1) + beta_t`, con composicion asociativa `(lambda_b, beta_b) * (lambda_a, beta_a) = (lambda_b*lambda_a, beta_b + lambda_b*beta_a)`. Cada capa mantiene cuatro pistas de memoria persistentes y opera con geometria hiperesferica local, estructura metrica adaptativa y transiciones de estado recurrentes. El estado persistente se propaga entre fragmentos durante el entrenamiento, con truncado de gradientes en las fronteras de cada chunk (TBPTT).

El preentrenamiento uso un flujo de tokens derivado de TinyStories y HuggingFaceFW/fineweb-edu, con 100.001.792 tokens expuestos. Hiperparametros: batch de 32, longitud de secuencia 64, 2.048 tokens por actualizacion, learning rate pico 3e-4, ratio minimo de LR 0,1, weight decay 0,1, Adam con beta1 0,9 y beta2 0,95, recorte de gradiente 1,0, precision BF16, horizonte de schedule de 200M tokens y 1% de warmup. No hay indicios de RLHF, DPO ni ningun tipo de ajuste por preferencias: es un checkpoint exclusivamente preentrenado.

La innovacion tecnica central es el estado recurrente de tamano fijo con composicion asociativa, que evita el crecimiento de memoria con la longitud de secuencia. El propio autor advierte que el Transformer de control emparejado es claramente superior en verosimilitud de siguiente token a contexto corto, por lo que la aportacion debe leerse como una exploracion de utilidad de historial, no como una mejora de rendimiento bruto.

## Capacidades

- Generacion de texto causal en ingles a nivel de modelo base, sin ajuste instructivo ni de chat.
- Modelado de lenguaje con estado recurrente persistente, sin cache KV.
- Aprovechamiento de historial largo en la prediccion: ganancia de entropia cruzada de +0,6325 en FineWeb-Edu al pasar de 0 a 1.024 tokens de historial, con mejora en el 98,2% de los ejemplos emparejados.
- Especificidad de historial: al sustituir historial antiguo por texto no relacionado de igual longitud, la CE empeora de 3,1286 a 3,2556 (ganancia de especificidad +0,1270, IC 95% [+0,1137, +0,1403]), lo que indica que el estado retiene contenido especifico del documento y no solo un calentamiento generico.
- Adaptacion a dominio narrativo simple: con TinyStories, la ganancia por historial llega a +1,1574 con 128 tokens de historial.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas ni evaluadas.
- Capacidades multilingues: no; solo ingles.
- Vision, audio o modos de pensamiento: no disponibles.

## Casos de uso

- Investigacion en arquitecturas no-Transformer: el modelo sirve como punto de partida reproducible para estudiar recurrencia de estado fijo frente a atencion, con un control Transformer emparejado en parametros y tokens ya publicado en la propia model card.
- Experimentos de memoria recurrente a largo plazo: su estado de 7.680 escalares por secuencia permite medir cuanto historial util se conserva sin cache KV, un escenario imposible de simular con la misma huella de memoria en un Transformer.
- Despliegue en dispositivos muy limitados: con ~10M parametros, los pesos ocupan aproximadamente 20 MB en BF16 y 40 MB en FP32, de modo que cabe con holgura en microcontroladores de gama alta, SBC y moviles, siempre que se implemente el runtime PAHS a mano.
- Generacion de texto narrativo sencillo en ingles: el modelo fue entrenado parcialmente con TinyStories y muestra su mejor comportamiento relativo en ese dominio, adecuado para prototipos de cuenteria o datos sinteticos simples.
- Generacion de datos sinteticos de bajo coste: al ser un modelo pequeno y rapido de ejecutar en CPU, puede producir grandes volumenes de texto de baja calidad para pruebas de pipelines, filtros o sistemas de ingesta antes de escalar a modelos mayores.
- Aprendizaje y docencia: su tamano permite entrenar o inspeccionar el modelo completo en una sola GPU consumer, lo que lo hace util en cursos y talleres sobre modelos recurrentes y geometrias de estado.
- Ablacion de tokenizadores: al publicarse junto al tokenizador HGT-8K (8.192 entradas) y su configuracion completa, permite experimentos controlados sobre tamano de vocabulario en regimen de pocos parametros.
- Base para ajuste fino de dominio: al ser un checkpoint base sin ajuste instructivo, se puede afinar para tareas concretas de ingles, asumiendo que parte de una calidad inferior a la de un Transformer equivalente.

## Benchmarks y rendimiento

Modelado de lenguaje sin estado, con parametros y tokens emparejados (ambos ~10M y 100.001.792 tokens):

| Conjunto de validacion | CE HyperS | CE Transformer | HyperS - Transformer |
|---|---:|---:|---:|
| General | 3,618102 | 2,965312 | +0,652790 |
| TinyStories | 3,497475 | 2,547682 | +0,949793 |

Utilidad de historial en lenguaje natural (FineWeb-Edu, futuro fijo emparejado):

| Tokens de historial | CE futuro | Ganancia vs historial cero |
|---:|---:|---:|
| 0 | 3,739575 | 0 |
| 16 | 3,286760 | +0,452815 |
| 64 | 3,214953 | +0,524622 |
| 128 | 3,187967 | +0,551608 |
| 256 | 3,138738 | +0,600837 |
| 512 | 3,109061 | +0,630513 |
| 1024 | 3,107112 | +0,632463 |

Utilidad de historial en TinyStories:

| Tokens de historial | CE futuro | Ganancia vs historial cero |
|---:|---:|---:|
| 0 | 3,636190 | 0 |
| 16 | 2,862471 | +0,773718 |
| 32 | 2,661220 | +0,974969 |
| 64 | 2,570816 | +1,065374 |
| 128 | 2,478832 | +1,157357 |

Especificidad de historial (FineWeb-Edu, historial total de 1.024 tokens, 16 tokens recientes fijos): CE con historial correcto 3,128598; CE con historial no relacionado 3,255597; ganancia de especificidad +0,126999; IC 95% [+0,113681, +0,140318].

Comparacion con historial emparejado dentro del rango de entrenamiento T64 del Transformer, FineWeb-Edu:

| Historial | CE HyperS | CE Transformer | Ganancia HyperS | Ganancia Transformer |
|---:|---:|---:|---:|---:|
| 0 | 3,728206 | 3,305366 | 0 | 0 |
| 16 | 3,276057 | 3,051597 | +0,452149 | +0,253768 |
| 32 | 3,240257 | 3,014561 | +0,487949 | +0,290805 |
| 48 | 3,216034 | 2,994692 | +0,512172 | +0,310674 |

Comparacion con historial emparejado, TinyStories:

| Historial | CE HyperS | CE Transformer | Ganancia HyperS | Ganancia Transformer |
|---:|---:|---:|---:|---:|
| 0 | 3,634787 | 2,653342 | 0 | 0 |
| 16 | 2,846372 | 2,244345 | +0,788416 | +0,408997 |
| 32 | datos truncados en la model card | datos truncados en la model card | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HellaSwag, GSM8K, HumanEval) en la informacion disponible. Las cifras anteriores son entropia cruzada sobre conjuntos de validacion internos definidos por el autor, no metricas de tarea.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 20 MB de pesos en BF16 y 40 MB en FP32, mas el estado persistente de ~30 KiB por secuencia en FP32. El consumo total es despreciable frente a cualquier modelo Transformer actual.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 estan sobredimensionados para este checkpoint.
- GPU consumer: cabe en cualquier GPU consumer moderna y tambien en iGPUs, ademas de ejecucion en CPU.
- CPU: es viable la inferencia en CPU para prototipos, dado el tamano y el estado de tamano fijo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y `transformers` no son compatibles de forma nativa, porque el release es un `state_dict` en `.pt` sin integracion con `AutoModelForCausalLM`; se requiere implementar el runtime PAHS en PyTorch a partir de `hypers_config.json` y el tokenizador HGT-8K.
- Flujo de tokens: no se especifica si existe `generate()` implementado en el artefacto; no disponible.
- Latencia y throughput: no disponibles. Al no haber KV cache, el coste por token es constante en memoria, lo que en teoria favorece secuencias muy largas, pero el modelo no ha publicado mediciones de velocidad.
- Nota sobre disponibilidad: el repositorio figura con 0,0 GB de tamano y 0 descargas, por lo que los archivos de pesos pueden no estar efectivamente subidos o ser de un tamano inferior al minimo reportado por la plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperS-10M-Base-v1.1b-100M | 9.976.787 | Chunks de 64 tokens; historial evaluado hasta 1.024 | Recurrente con estado geometrico (PAHS) | No especificada | Pesos `.pt`, sin integracion `transformers` |
| Transformer-T64 (control del autor) | ~10M | 64 tokens de entrenamiento | Transformer causal | No disponible | Solo como referencia en la model card |
| TinyStories (modelos de Microsoft) | no disponible | no disponible | Transformer decoder-only | no disponible | no disponible en la informacion proporcionada |
| GPT-2 small | no disponible | no disponible | Transformer decoder-only | no disponible | no disponible en la informacion proporcionada |

La unica comparacion con datos verificables en la informacion proporcionada es la del Transformer-T64 emparejado, que supera a HyperS en verosimilitud de siguiente token a contexto corto en todos los conjuntos evaluados (por ejemplo, 2,965312 frente a 3,618102 en validacion general). Para el resto de alternativas no hay datos de parametros, contexto, rendimiento o licencia en la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo ni de chat: no responde a instrucciones y no debe usarse como asistente conversacional sin un ajuste previo.
- Rendimiento inferior al de un Transformer emparejado: pierde entre 0,65 y 0,95 puntos de entropia cruzada frente al control de ~10M parametros entrenado con los mismos tokens.
- Capacidad de lenguaje muy limitada: con 9,98M de parametros y 100M de tokens, la coherencia y el conocimiento del mundo son propios de un modelo minúsculo, con alta tasa de alucinacion y textos incoherentes fuera de dominios simples.
- Solo ingles: no hay soporte multilingue y el castellano no esta cubierto.
- Contexto efectivo limitado: los fragmentos de entrenamiento son de 64 tokens y la utilidad de historial medida se estabiliza en torno a 512-1.024 tokens (la ganancia pasa de +0,6305 a 512 a +0,6325 a 1.024), sin que se haya demostrado recuperacion exacta de informacion; el autor lo describe explicitamente como utilidad predictiva, no como retrieval.
- Licencia no especificada: al no declararse terminos, no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sesgos: los datasets de origen (TinyStories, FineWeb-Edu) tienen sus propios sesgos y procedimientos de filtrado, que el autor remite a las fichas originales; no se ha realizado ninguna evaluacion de sesgo sobre este checkpoint.
- Estado persistente en FP32: cualquier reimplementacion debe respetar el tipo del estado (~30 KiB por secuencia) para reproducir el comportamiento; desviarse puede alterar los resultados.
- Artefacto no estandar: no hay soporte en `transformers`, vLLM, llama.cpp, Ollama ni TGI, lo que implica coste de ingenieria para integrarlo y ausencia de optimizaciones maduras (batching continuo, cuantizacion, kernels fusionados).
- Estado del repositorio: 0 descargas, 0 likes y 0,0 GB de tamano declarado, lo que sugiere que el artefacto puede estar incompleto o no ser accesible de forma estable.
- Fecha de creacion declarada (2026-10-06): incongruente con el contexto temporal habitual; conviene verificar la procedencia del repositorio antes de confiar en el.
- No apto para produccion: por tamano, licencia, ausencia de benchmarks de tarea y falta de soporte de runtime, debe considerarse exclusivamente material de investigacion.

## Enlaces

- HuggingFace: https://huggingface.co/drelixer/HyperS-10M-Base-v1.1b-100M
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper, blog, repositorio o demo adicionales: no disponible; la busqueda web no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos trataban sobre Twitter y no guardan relacion con HyperS).
