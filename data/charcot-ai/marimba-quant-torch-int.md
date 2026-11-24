# charcot-ai/marimba-quant-torch-int

## Resumen

Marimba-quant-torch-int es una colección de versiones cuantizadas del codificador de audio (`thinker.audio_tower`) que utiliza el modelo Marimba de charcot-ai. El codificador original proviene de Qwen/Qwen3-ASR-0.6B en la revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`, con 186,4 millones de parámetros y 18 capas transformer de anchura 896. El repositorio agrupa el mismo codificador cuantizado con tres librerías distintas de PyTorch: bitsandbytes 0.50.2, torchao 0.13.0 y optimum-quanto 0.2.7.

El problema que resuelve es la reducción del coste de memoria y cómputo del codificador de audio sin reentrenar ni cambiar de runtime: los ficheros se cargan en módulos `torch` convencionales sobre GPU CUDA, sin formato de fichero nuevo ni motor de inferencia adicional. Solo se cuantizan los 182,2 millones de parámetros de las capas `nn.Linear`; las tres capas `Conv2d`, las layer norms y los sesgos permanecen en bfloat16, la precisión del checkpoint original.

Es relevante para quienes despliegan el pipeline de audio de Marimba (detección de fin de turno, actividad de voz, diarización y recuento de hablantes) y necesitan ajustar el equilibrio entre precisión y huella de memoria en producción. El repositorio no incluye las cabezas de Marimba, el decodificador de texto de Qwen3-ASR, el tokenizer ni el extractor de características: esos componentes se toman sin cambios de `charcot-ai/marimba` en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de audio, 18 capas, anchura 896; 3 capas Conv2d) |
| Parametros totales | 186,4 M en el codificador original; 182,2 M cuantizados en capas `nn.Linear` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 8 s a 16 kHz mono en la evaluacion) |
| Tipos de cuantizacion | int8 (bitsandbytes `Linear8bitLt`, torchao `Int8WeightOnly`, torchao `Int8DynamicActivationInt8Weight`, optimum-quanto `qint8`), NF4 4-bit (bitsandbytes `Linear4bit`), int4 (torchao `Int4WeightOnly`), float8 e4m3 (torchao `Float8WeightOnly` y `Float8DynamicActivationFloat8Weight`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `audio_tower.safetensors` (bitsandbytes y optimum-quanto), `audio_tower.pt` (torchao, `state_dict` de subclases de tensor torchao) |

## Arquitectura y entrenamiento

El codificador es el `thinker.audio_tower` de Qwen3-ASR-0.6B: 18 capas transformer de anchura 896 con tres capas `Conv2d` de preprocesado, 186,4 M de parámetros en total. Marimba lo reutiliza como extractor de representaciones y le superpone cabezas y readouts propios en float32 para producir decisiones de audio. La cuantización afecta exclusivamente a los 182,2 M de parámetros de los módulos `nn.Linear`; convoluciones, layer norms y sesgos se mantienen en bfloat16.

No se ha realizado reentrenamiento ni ajuste fino: son copias post-entrenamiento del mismo checkpoint base. Cada carpeta corresponde a una configuración de cuantización de una librería concreta, con esquemas que van desde int8 por canal simétrico hasta NF4 en bloques de 64 o int4 asimétrico en grupos de 128. La innovación técnica es la portabilidad: los tensores se cargan en módulos `torch` estándar sobre CUDA sin runtime nuevo, y en el caso de optimum-quanto se incluye `quantization_map.json` para poder recuantizar. No se dispone de información sobre el dataset de entrenamiento original del codificador ni sobre fases de RLHF o DPO.

## Capacidades

- Extracción de representaciones de audio a partir de ventanas de 8 s, 16 kHz, mono; produce los hidden states de las capas 9, 12 y 18 que consumen las cabezas de Marimba.
- Detección de fin de turno (`turn_end`) en conversaciones habladas.
- Detección de actividad de voz (`voice_activity`), tanto sobre la ventana completa de 8 s como sobre el último segundo.
- Verificación de mismo hablante (`same_speaker`).
- Detección de cambio de hablante (`speaker_change`).
- Recuento de hablantes (`speaker_count`).
- No incluye generación de texto, transcripción, identificación de idioma ni respuesta a preguntas sobre términos: esas funciones dependen del decodificador de texto de Qwen3-ASR, que no forma parte de este repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas (los idiomas no están disponibles en la información).
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Detección de fin de turno en asistentes de voz: el codificador cuantizado en int8 (`torchao_int8wo` o `bnb_int8`) mantiene un AUROC de 0,9314 y 0,9311 frente al 0,9310 de la referencia fp32, con lo que se puede integrar en un pipeline de diálogo por turnos reduciendo el peso en disco de 372,8 MB a unos 192 MB.
- Diarización en reuniones: las cabezas de `speaker_change` y `same_speaker` alcanzan AUROC de 0,9555 y 0,9934 con `torchao_int8wo`, lo que permite segmentar reuniones de AMI o VoxConverse en un servidor con GPU modesta.
- Recuento de participantes en llamadas: `speaker_count` obtiene una exactitud de 0,7885 con `torchao_int8wo` y `torchao_int8dyn`, ligeramente por encima del 0,7862 de la referencia, útil para telemetría de reuniones.
- Detección de actividad de voz en dispositivos de borde: la variante NF4 (`bnb_nf4`, 111,2 MB en disco) mantiene un AUROC de 0,9999 en VAD de 8 s y 0,9966 en el último segundo, lo que la hace viable en GPUs con poca VRAM.
- Filtrado de audio no humano en pipelines de datos: con las clases no humanas de ESC-50, el codificador cuantizado permite descartar ventanas sin habla antes de pasarlas a un ASR, reduciendo cómputo aguas abajo.
- Despliegue de bajo consumo en producción: la variante `torchao_int4wo` ocupa 119,1 MB y mantiene `turn_end` en 0,9339, aunque degrada `speaker_count` a 0,7540; es adecuada cuando el recuento de hablantes no es crítico.
- Evaluación comparativa de esquemas de cuantización: al contener diez configuraciones del mismo codificador con el mismo protocolo, sirve como banco de pruebas para decidir qué librería y esquema adoptar antes de cuantizar otros modelos de audio.

## Benchmarks y rendimiento

Los resultados provienen de un único protocolo: 1.170 ventanas públicas de 8 s a 16 kHz mono, con hidden states de las capas 9, 12 y 18 y las cabezas de Marimba sin cambios. La referencia es el paquete `marimba-audio` 0.1.2 en CPU y float32, una ventana a la vez.

| Carpeta | Libreria | Esquema | Bits peso | Tamano disco | `turn_end` AUROC | `voice_activity` AUROC (8 s) | `voice_activity` AUROC (ultimo 1 s) | `same_speaker` AUROC | `speaker_change` AUROC | `speaker_count` accuracy | Cambio max. probabilidad | Decisiones cambiadas |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fp32 referencia (no en repo) | - | float32 CPU | 16 almacenado, 32 en memoria | 372,8 MB del checkpoint original de 1.876 MB | 0,9310 | 0,9999 | 0,9969 | 0,9926 | 0,9557 | 0,7862 | 0 | 0 |
| sin cuantizar (no en repo) | - | float32 GPU | 16 almacenado, 32 en memoria | 372,8 MB | 0,9309 | 0,9999 | 0,9969 | 0,9926 | 0,9558 | 0,7862 | 0,002 | 1 |
| sin cuantizar (no en repo) | - | bfloat16 GPU | 16 | 372,8 MB | 0,9307 | 0,9999 | 0,9969 | 0,9929 | 0,9557 | 0,7862 | 0,117 | 8 |
| `bnb_int8/` | bitsandbytes | `Linear8bitLt`, int8 por fila absmax, `threshold=0.0` | 8 | 191,4 MB | 0,9311 | 0,9999 | 0,9968 | 0,9934 | 0,9553 | 0,7828 | 0,363 | 58 |
| `bnb_int8/` con `threshold=6.0` | bitsandbytes | mismos ficheros, columnas outlier en 16 bits | 8 | 191,4 MB | 0,9308 | 0,9999 | 0,9969 | 0,9931 | 0,9556 | 0,7851 | 0,171 | 45 |
| `bnb_nf4/` | bitsandbytes | `Linear4bit`, NF4 en bloques de 64, sin doble cuantizacion, computo bf16 | 4 | 111,2 MB | 0,9166 | 0,9999 | 0,9966 | 0,9938 | 0,9531 | 0,7701 | 0,578 | 256 |
| `torchao_int8wo/` | torchao | `Int8WeightOnlyConfig`, int8 por canal simetrico, activaciones bf16 | 8 | 192,4 MB | 0,9314 | 0,9999 | 0,9970 | 0,9934 | 0,9555 | 0,7885 | 0,095 | 39 |
| `torchao_int8dyn/` | torchao | `Int8DynamicActivationInt8WeightConfig`, int8 en pesos y activaciones dinamicas por token | 8 | 191,2 MB | 0,9336 | 0,9999 | 0,9969 | 0,9924 | 0,9548 | 0,7885 | 0,229 | 72 |
| `torchao_int4wo/` | torchao | `Int4WeightOnlyConfig`, int4 asimetrico en grupos de 128, activaciones bf16 | 4 | 119,1 MB | 0,9339 | 0,9999 | 0,9967 | 0,9938 | 0,9556 | 0,7540 | 0,727 | 400 |
| `torchao_float8wo/` | torchao | `Float8WeightOnlyConfig`, float8 e4m3 en pesos, activaciones bf16 | 8 | 191,5 MB | 0,9316 | 0,9999 | 0,9969 | 0,9924 | 0,9557 | 0,7851 | 0,207 | 62 |
| `torchao_float8dyn/` | torchao | `Float8DynamicActivationFloat8WeightConfig`, float8 e4m3 en pesos y activaciones dinamicas | 8 | 190,9 MB | 0,9278 | 0,9999 | 0,9967 | 0,9928 | 0,9549 | 0,7862 | 0,227 | 74 |
| `quanto_qint8/` | optimum-quanto | `qint8` por canal | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador cuantizado ocupa entre 111,2 MB (`bnb_nf4`) y 192,4 MB (`torchao_int8wo`) en disco solo para los pesos lineales; hay que sumar las capas `Conv2d`, layer norms y sesgos en bfloat16, junto con las cabezas de Marimba en float32 que se cargan desde `charcot-ai/marimba`.
- GPU recomendadas: la evaluación se realizó en una NVIDIA RTX PRO 4500 Blackwell. Por tamaño, el codificador cabe en cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en todas las mencionadas; el cuello de botella es el resto del pipeline (decodificador de texto de Qwen3-ASR, tokenizer y extractor de características), no el codificador.
- Opciones de despliegue: carga directa en módulos `torch` sobre CUDA; sin runtime nuevo. Las variantes bitsandbytes requieren bitsandbytes 0.50.2, las de torchao requieren torchao 0.13.0 y las de optimum-quanto requieren optimum-quanto 0.2.7. El paquete `marimba-audio` 0.1.2, con torch 2.8.0+cu128 y transformers 4.57.6, es el entorno de referencia.
- Latencia y throughput: la evaluación usó el camino GPU por lotes con activaciones bfloat16 y 16 ventanas por lote. No se publican cifras de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `charcot-ai/marimba-quant-torch-int` (esta ficha) | 186,4 M (182,2 M cuantizados) | no disponible | Apache 2.0 | safetensors, `.pt` | Codificador de audio cuantizado; sin decodificador de texto |
| `charcot-ai/marimba` | no disponible | no disponible | no disponible | no disponible | Modelo base completo con cabezas y readouts; referencia fp32 |
| `Qwen/Qwen3-ASR-0.6B` | 186,4 M en el codificador de audio | no disponible | no disponible | no disponible | Origen del `thinker.audio_tower`; incluye decodificador de texto |
| `pipecat-ai/smart-turn-data-v3.2-test` | no aplica | no aplica | no disponible | no disponible | Dataset de evaluación de fin de turno, no es un modelo |

## Limitaciones y advertencias

- El repositorio no incluye las cabezas de Marimba, el decodificador de texto de Qwen3-ASR, el tokenizer ni el extractor de características; para transcripciones, identificación de idioma o términos hay que usar el checkpoint original `charcot-ai/marimba`.
- La cuantización NF4 e int4 degrada `turn_end` (0,9166 y 0,9339 frente a 0,9310) y, sobre todo, `speaker_count` (0,7701 y 0,7540 frente a 0,7862); no son adecuadas si el recuento de hablantes es crítico.
- `torchao_int4wo` cambia 400 decisiones de 1.170 ventanas respecto a la referencia, con un cambio máximo de probabilidad de 0,727.
- `torchao_float8dyn` es la variante con peor `turn_end` (0,9278) entre las de 8 bits.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación, limitaciones de idioma ni restricciones adicionales de licencia más allá de Apache 2.0.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene verificar la licencia del checkpoint base `charcot-ai/marimba` y de `Qwen/Qwen3-ASR-0.6B`, no disponibles en la información.
- Los resultados se midieron en una única GPU (RTX PRO 4500 Blackwell) y con un protocolo concreto de 1.170 ventanas; el rendimiento en otros dominios de audio no está caracterizado.
- La carpeta `quanto_qint8/` no tiene resultados de evaluación publicados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-torch-int
- Modelo base: https://huggingface.co/charcot-ai/marimba
- Codificador original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- torchao: https://github.com/pytorch/ao
- optimum-quanto: https://github.com/huggingface/optimum-quanto
- Dataset Smart Turn v3.2 test: `pipecat-ai/smart-turn-data-v3.2-test` en Hugging Face
- Dataset VoxConverse: `diarizers-community/voxconverse` en Hugging Face
- Dataset AMI: `diarizers-community/ami` en Hugging Face
- Dataset ESC-50: `ashraq/esc50` en Hugging Face
- Dataset FLEURS: `google/fleurs` en Hugging Face
