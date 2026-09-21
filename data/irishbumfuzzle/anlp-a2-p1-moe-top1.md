# irishbumfuzzle/anlp-a2-p1-moe-top1

## Resumen

`irishbumfuzzle/anlp-a2-p1-moe-top1` es un checkpoint academico publicado en HuggingFace como parte de la Parte 1 de la asignacion *Advanced NLP Assignment 2* (Monsoon 2026). Se trata de un transformer decoder-only de 35,7 millones de parametros con arquitectura Mixture of Experts (4 expertos, enrutamiento top-1), disenado especificamente para traduccion automatica desde vietnamita y japones hacia ingles. El repositorio contiene el checkpoint final (`final`), correspondiente al agotamiento de un presupuesto de entrenamiento de 145.020.416 tokens sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`.

El modelo sigue el paradigma de LM decoder-only aplicado a traduccion mediante un formato de prompt con marcadores de idioma: `<lang> src <en> tgt`. Con D=512, 6 capas, 8 cabezas de atencion y un vocabulario de 32.768 tokens con embeddings atados, se situa en la categoria de modelos diminutos, orientados a experimentacion academica mas que a produccion. La relevancia actual es limitada: sirve como referencia reproducible de como aplicar enrutamiento MoE disperso a tareas de traduccion con presupuestos de computo muy reducidos.

El repositorio tiene 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas en los metadatos de HuggingFace. La model card es la unica fuente tecnica disponible; no se han publicado resultados de benchmarks ni documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas Mixture of Experts (MoE) de 4 expertos y enrutamiento top-1 |
| Parametros totales | 35.670.528 |
| Parametros activos | 26.233.344 (73,5 % del total; equivale a 1 experto de 4 por token) |
| Longitud de contexto | no disponible (definida en `TransformerConfig`, no publicada en la model card) |
| Tipos de cuantizacion | no disponible. Solo se distribuye el checkpoint en precision original (PyTorch state dict); no hay versiones GGUF, AWQ, GPTQ ni int8/int4 |
| Idiomas soportados | vietnamita y japones (origen) hacia ingles (destino), segun la tarea declarada; los metadatos de HuggingFace no declaran idiomas |
| Licencia | no disponible (sin licencia declarada en el repositorio) |
| Formato de pesos | `model.pt` (diccionario con `model` state_dict y `config`), `config.json`, `tokenizer.json` (BPE byte-level, vocab 32768) |
| Dimension del modelo (D) | 512 |
| Capas | 6 |
| Cabezas de atencion | 8 (dimension por cabeza: 64) |
| Vocabulario | 32.768 tokens, BPE byte-level, embeddings atados |
| Tokens de entrenamiento | 145.020.416 |
| Dataset de entrenamiento | `belumind/en-vi-ja-curated-500k-triplets` |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion (metadatos) | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal estandar, configurado con D=512, 6 capas y 8 cabezas (64 dimensiones por cabeza), y un vocabulario de 32.768 tokens con la matriz de embeddings atada a la capa de salida. La innovacion estructural es la sustitucion de las capas feed-forward densas por bloques MoE con 4 expertos y enrutamiento top-1: cada token activa un unico experto por capa, de modo que solo 26.233.344 de los 35.670.528 parametros intervienen en cada paso forward. Esto supone un ahorro del 26,5 % de parametros activos respecto a un modelo denso del mismo tamano total, a costa de anadir el coste del enrutador y de una utilizacion potencialmente desequilibrada de expertos (no se documenta ninguna estrategia de balanceo, como auxiliary loss o capacity factor).

El entrenamiento se realizo sobre un presupuesto fijo de 145.020.416 tokens (aproximadamente 1.450 pasos si el batch efectivo fuera de 100.000 tokens, dato no confirmado) extraidos del dataset `belumind/en-vi-ja-curated-500k-triplets`, compuesto por tripletes en vietnamita, japones e ingles. El tokenizador BPE byte-level de 32.768 entradas se entreno exclusivamente sobre el split de entrenamiento, lo que evita filtraciones del conjunto de validacion pero limita la cobertura de vocabulario fuera de dominio. La tarea se formula como generacion condicionada mediante plantilla de prompt (`<lang> src <en> tgt`), sin cabecera de clasificacion ni modelo encoder separado. La model card no menciona fases de ajuste por instrucciones, RLHF ni DPO; el checkpoint `final` corresponde simplemente al final del presupuesto de tokens.

## Capacidades

- Traduccion automatica de vietnamita a ingles y de japones a ingles, en formulacion decoder-only con marcadores de idioma explicitos.
- Generacion de texto autoregresiva condicionada por prefijo (el modelo es un LM causal generico, aunque solo se ha entrenado y evaluado para traduccion).
- Procesamiento de texto tokenizado con BPE byte-level de 32.768 entradas, entrenado sobre el propio corpus de traduccion.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card ni se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a vietnamita, japones e ingles segun la tarea declarada; no hay evaluacion de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.

## Casos de uso

- Experimentacion academica con enrutamiento MoE: el modelo permite reproducir el efecto de top-1 frente a top-2 o top-k en un transformer pequeno (35,7 M de parametros) con un presupuesto de computo asequible en una unica GPU consumer, sirviendo como banco de pruebas para estudiar balanceo de expertos y colapso de enrutadores.
- Prototipado de pipelines de traduccion vi->en y ja->en sin coste de API: al pesar ~143 MB en fp32, puede desplegarse en local para generar traducciones de prueba en entornos sin conectividad o con restricciones de privacidad, siempre que se acepte la calidad limitada derivada de los 145 M de tokens de entrenamiento.
- Generacion de datos sinteticos para aumento de corpus: el modelo puede producir traducciones candidatas sobre texto vietnamita o japones no etiquetado, que despues se filtran con un modelo mayor o con metricas de calidad, aprovechando su bajo coste de inferencia.
- Docencia y practicas de NLP: sirve como ejemplo completo y reproducible de pipeline de entrenamiento (tokenizador propio, dataset de tripletes, checkpoint con `config.json` y carga mediante `TransformerLM.load`), util en asignaturas de procesamiento de lenguaje natural.
- Investigacion sobre eficiencia parametrica: la comparacion entre parametros totales (35,7 M) y activos (26,2 M) permite medir empíricamente la relacion entre FLOPs por token y calidad de traduccion en regimenes de computo reducidos.
- Pruebas de cuantizacion extrema: al ser un modelo diminuto, es un candidato adecuado para validar tecnicas de cuantizacion a 4 bits o de destilacion sobre hardware embebido (CPU, Raspberry Pi), comprobando la degradacion de BLEU/COMET con recursos minimos.
- Base para ajuste fino en dominios concretos: con 35,7 M de parametros, el ajuste completo sobre un corpus especializado (por ejemplo, documentacion tecnica ja->en) es viable en una sola GPU de 8-12 GB, incluyendo todos los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de traduccion (BLEU, chrF, COMET), resultados de MMLU, HumanEval ni GSM8K, ni comparaciones con lineas base. Tampoco se documentan metricas de equilibrio de expertos, perdida final de validacion ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia, segun precision (calculo derivado de 35.670.528 parametros, sin incluir activaciones ni cache KV):
  - fp32: aproximadamente 143 MB de pesos.
  - fp16/bf16: aproximadamente 71 MB.
  - int8: aproximadamente 36 MB.
  - int4: aproximadamente 18 MB.
- La VRAM real depende de la longitud de contexto, que no esta declarada; la cache KV de 6 capas y 8 cabezas con D=512 es pequena en cualquier caso.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100, y estas ultimas quedan enormemente infrautilizadas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos. Tambien es viable en CPU.
- Opciones de despliegue: el checkpoint se distribuye como state dict de PyTorch y requiere el repositorio de la asignatura (`src.part1.model.TransformerLM`, `src.part1.data.load_tokenizer`) para cargarse. No hay pesos en safetensors, GGUF ni compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; usarlo con esos motores exigiria una conversion previa del state dict y la reimplementacion de la capa MoE top-1.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque este checkpoint no publica metricas. La tabla contrasta unicamente caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| irishbumfuzzle/anlp-a2-p1-moe-top1 | 35,7 M totales / 26,2 M activos | Decoder-only MoE top-1, 4 expertos, 6 capas | no disponible | no disponible | `model.pt` (state dict) + `config.json` + tokenizer propio; requiere repo externo |
| Helsinki-NLP/opus-mt-vi-en | ~77 M (aprox.) | Encoder-decoder transformer (Marian) | ~512 tokens (aprox.) | CC-BY 4.0 | safetensors / PyTorch; integrable en transformers |
| facebook/m2m100_418M | 418 M | Encoder-decoder transformer multilingue | 1024 tokens | MIT | safetensors / PyTorch; transformers |
| google-t5/t5-small | 60 M | Encoder-decoder transformer | 512 tokens | Apache 2.0 | safetensors / PyTorch; transformers |
| facebook/nllb-200-distilled-600M | 600 M | Encoder-decoder transformer multilingue | 1024 tokens | CC-BY-NC-4.0 (no comercial) | safetensors / PyTorch; transformers |

Diferencias clave: frente a los modelos encoder-decoder de traduccion, este checkpoint usa una formulacion decoder-only con prompt de idioma, lo que simplifica la arquitectura pero suele requerir mas tokens de entrenamiento para alcanzar calidad comparable. Su licencia no declarada y su dependencia de codigo externo lo hacen inadecuado para produccion, a diferencia de opus-mt-vi-en (CC-BY 4.0) o m2m100_418M (MIT).

## Limitaciones y advertencias

- Sesgos conocidos: no hay evaluacion de sesgos ni de comportamiento diferencial por genero, dialecto o registro; el corpus de entrenamiento (tripletes curados) puede introducir sesgos de dominio y de estilo no documentados.
- Riesgo de alucinacion: alto en generacion libre. Al ser un decoder-only entrenado solo para traduccion, fuera del plantilla `<lang> src <en> tgt` puede producir texto incoherente o inventar contenido.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada; la cobertura se limita a vietnamita, japones e ingles segun el corpus de entrenamiento. El tokenizador BPE se entreno solo sobre el split de entrenamiento, por lo que puede fragmentar de forma ineficiente texto fuera de dominio.
- Calidad esperada baja: con 145 M de tokens de entrenamiento y 35,7 M de parametros, la calidad de traduccion sera muy inferior a la de modelos especializados como opus-mt-vi-en (~77 M, entrenado sobre corpus mucho mayores) o NLLB-200.
- Restricciones de licencia: el repositorio no declara licencia, lo que en la practica implica ausencia de permisos explicitos de uso comercial o redistribucion. Ademas, es un artefacto de una asignatura academica, por lo que pueden aplicarse condiciones de uso academico no publicadas.
- Riesgo de reproducibilidad: la carga del modelo depende de un repositorio externo (`src.part1.model`, `src.part1.data`) que no se distribuye con los pesos; sin el, el checkpoint no es utilizable directamente.
- Enrutamiento MoE sin documentar: no se especifica si existe loss auxiliar de balanceo ni la distribucion de uso de los 4 expertos; un colapso de enrutador degradaria la calidad de forma dificil de diagnosticar.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado en septiembre de 2026 (fecha de los metadatos), sin mantenimiento conocido. No apto para produccion en su estado actual.
- Ausencia de benchmarks: no hay ninguna metrica publicada, por lo que no es posible validar la calidad de traduccion antes de su adopcion.

## Enlaces

- HuggingFace: https://huggingface.co/irishbumfuzzle/anlp-a2-p1-moe-top1
- Dataset de entrenamiento citado: `belumind/en-vi-ja-curated-500k-triplets` (identificador mencionado en la model card; no se ha localizado un enlace directo en la informacion disponible)
- Repositorio de la asignatura (referenciado en la model card como `src.part1.model` y `src.part1.data`): no disponible, no se proporciona URL
- Paper, blog o demo asociados: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a hilos del foro chino Zhihu sobre atajos de teclado para caracteres griegos y otros temas sin relacion con el modelo.
