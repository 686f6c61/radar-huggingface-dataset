# decido-ai/decido-1-26b-a4b

## Resumen

Decido-1 (26B-A4B) es un modelo de decisión calibrada desarrollado por decido-ai, construido mediante un fine-tune LoRA fusionado sobre google/gemma-4-26B-A4B-it. Su propósito no es la generación libre de texto, sino responder preguntas cerradas sobre un documento (sí/no, elección única u ordenada) devolviendo una probabilidad calibrada para cada respuesta. El modelo está orientado a ejecutarse en CPU de portátil, con un fichero GGUF de 8 bits que ocupa aproximadamente 30 GB de RAM.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 25.805.933.872 parámetros totales y aproximadamente 4.000 millones activos por token, lo que permite un coste de inferencia por token bajo a pesar del tamaño del repositorio (80,5 GB). El modelo se distribuye en safetensors (bf16, para GPU con transformers) y en GGUF (Q8_0, para llama.cpp en CPU), con licencia Apache-2.0.

Es relevante ahora porque propone un enfoque distinto al de los LLM generativos para tareas de clasificación y enrutamiento: en lugar de pedir al modelo que "razone" y produzca texto, se lee directamente la probabilidad del siguiente token sobre las opciones candidatas. El autor reporta una puntuación media de 85,38 en seis grupos de benchmarks frente a los 83,85 publicados por Jev 1.13, con salida determinista bit a bit en CPU y una tasa de cambio de respuesta ante reordenación de opciones del 4,8%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | ~4 B por token (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (fichero de CPU publicado); pesos bf16 en safetensors; otros tipos GGUF no confirmados |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B-it, un transformer con mezcla de expertos de 25,8 B parámetros totales y unos 4 B activos por token. Sobre esa base se aplica un fine-tune LoRA que se fusiona en los pesos finales, especializando el modelo para la tarea de decisión calibrada en lugar de la generación abierta. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal es el mecanismo de lectura: el prompt incluye una instrucción de sistema, el documento delimitado en `<document>` y un bloque por pregunta; cada pregunta se responde de forma independiente a partir del documento cacheado. La respuesta se obtiene leyendo la probabilidad del siguiente token sobre tokens únicos que representan cada opción, lo que evita la generación autoregresiva de texto y produce una distribución de probabilidad directamente interpretable. El documento se trata como dato no fiable: las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan.

## Capacidades

- Clasificación binaria (sí/no) sobre un documento de entrada, con probabilidad devuelta para cada clase.
- Elección única entre 2 y 255 opciones, con etiquetas o descripciones por clave.
- Escalas ordenadas de 2 a 10 niveles (tipo Likert o prioridad), devolviendo leyenda y probabilidades.
- Salida calibrada: el autor reporta Brier score y ECE comparables o mejores que Jev 1.13 en 4 de 5 comprobaciones.
- Determinismo en CPU: mismas salidas ante llamadas repetidas, orden de peticiones y número de hilos (0 de 50 peticiones cambiadas).
- Robustez ante reordenación de opciones: 4,8% de tasa de cambio agrupada, reducible a 1,4% con media sobre 4 permutaciones (`perm=4`).
- Preguntas compuestas: 96,7% de acierto al formularlas juntas frente a 97,5% por separado.
- Compatibilidad con el formato de cable de Jev 1.13 (`noul`, `choice`, `score`) mediante `m.predict`.
- Servidor HTTP compatible con la API de Jev (`POST /v1/systemone`), de modo que clientes existentes funcionan sin cambios apuntando `TYPESAFE_BASE_URL` al servidor local.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, tool calling ni razonamiento multi-paso; el pipeline declarado es text-classification y el modelo es image-text-to-text solo por herencia de la base.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, responder preguntas como "¿solicita un reembolso?" y "¿qué equipo debe gestionarlo?" con probabilidades calibradas, lo que permite umbralizar y derivar automáticamente solo los casos de alta confianza.
- Enrutamiento de correo o formularios: clasificar mensajes entrantes en categorías (facturación, envíos, técnico) usando la modalidad de elección única con opciones descritas, sin necesidad de un LLM generativo ni de GPU.
- Moderación y cumplimiento normativo: aplicar escalas ordenadas (bajo, normal, urgente) o niveles de riesgo sobre documentos y políticas, aprovechando la calibración para fijar umbrales auditables.
- Extracción de señales en pipelines de datos: procesar documentos en lote en CPU con salida determinista, lo que facilita la reproducibilidad y la comparación entre ejecuciones en entornos de CI.
- Análisis de encuestas y respuestas abiertas: mapear texto libre a escalas Likert de 2 a 10 niveles con distribución de probabilidad, útil para agregación estadística y cálculo de intervalos.
- Sustituto local de APIs de decisión tipo Jev: desplegar `decido serve` en una máquina sin GPU y reutilizar clientes existentes gracias a la compatibilidad del endpoint `/v1/systemone`.
- Verificación documental en back office: comprobar si un contrato o factura cumple condiciones concretas (sí/no) con una probabilidad que permite priorizar la revisión humana.
- Filtrado previo en pipelines RAG: decidir si un fragmento recuperado es relevante para una consulta antes de pasarlo a un modelo generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor. La puntuación de cada grupo es una métrica de tipo accuracy y la media se calcula sobre los seis grupos.

| Grupo de benchmark | Decido-1 CPU (Q8_0 GGUF) | Decido-1 GPU (bf16) | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 87,61 | 88,17 | 87,18 |
| Kev | 84,35 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 78,37 | 78,39 | 72,96 |
| Nimble | 87,23 | 88,65 | 91,84 |
| VitaminC | 86,14 | 87,15 | 78,46 |
| MASSIVE | 88,57 | 88,57 | 87,14 |
| Media de seis grupos | 85,38 | 85,90 | 83,85 |

Calibración (Brier multiclase y ECE de 10 bins; menor es mejor):

| Comprobación (CPU, GGUF publicado) | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,169 | 0,181 | 0,038 | 0,032 |
| Kev v4 dev | 0,210 | 0,211 | 0,029 | 0,049 |
| Kev v9 dev | 0,267 | 0,212 | 0,020 | 0,034 |
| VitaminC | 0,202 | 0,313 | 0,041 | 0,104 |
| MASSIVE | 0,164 | 0,204 | 0,025 | 0,075 |

Notas metodológicas del autor: cinco grupos medidos solo en CPU; OpenJev medido sobre el mismo GGUF vía llama.cpp con CUDA (222.054 peticiones), con una muestra de 300 por tarea en CPU que coincide en el 97,4% de los ítems. El intervalo de confianza bootstrap al 95% para GPU bf16 es 84,70–87,13.

Velocidad (Apple M4 Pro, solo CPU, 10 hilos, documento de ~1.000 tokens y 5 preguntas): p50 de 4,14 s y p95 de 4,26 s; carga inicial de ~97 s; ~30 GB de RAM. El documento se lee una vez y se cachea; cada pregunta adicional añade unos cientos de milisegundos.

## Requisitos de hardware

- VRAM/RAM para CPU: el GGUF Q8_0 requiere aproximadamente 30 GB de RAM en el portátil de referencia (Apple M4 Pro).
- GPU: los pesos bf16 del repositorio (80,5 GB) se ejecutan con transformers mediante `pip install "decido-ai[gpu]"` y `device="cuda"`; no se especifica en la información disponible qué GPU mínima se necesita para bf16, aunque por tamaño encaja en A100 80 GB o H100 80 GB.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU de consumo; el Q8_0 de ~26 GB podría caber en una RTX 4090 de 24 GB solo con cuantizaciones menores, que no se documentan.
- Despliegue: paquete `decido-ai` (Python) con `Decido`, CLI `decido run` y servidor HTTP `decido serve` (API compatible con Jev, `POST /v1/systemone`); soporte de llama.cpp para el GGUF; uso directo con transformers mediante `example_transformers.py`.
- Compilación del runtime: `decido build-runtime` solo en Linux e Intel Mac (requiere cmake y compilador de C++); en Apple Silicon se omite.
- Latencia y throughput: p50 4,14 s y p95 4,26 s para 1.000 tokens de documento más 5 preguntas en CPU M4 Pro; el coste marginal por pregunta adicional es de unos cientos de milisegundos gracias al cacheo del documento.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Puntuación seis grupos | Hardware | Licencia |
|---|---|---|---|---|---|---|
| Decido-1 (26B-A4B) | Gemma-4-26B-A4B | 25,8 B totales / ~4 B activos | no disponible | 85,38 (CPU) / 85,90 (GPU) | CPU de portátil (~30 GB RAM) o GPU | Apache-2.0 |
| Decido-1-Fast | Qwen3-1.7B | 1,7 B | no disponible | 73,01 (CPU) | CPU de portátil (~3 GB RAM) | no disponible |
| Decido-1-Ultra | Qwen3-0.6B | 0,6 B | no disponible | 62,16 (CPU) | CPU de portátil (~1,5 GB RAM) | no disponible |
| Decido-1-Think | Gemma-4-26B-A4B | 25,8 B totales / ~4 B activos | no disponible | 88,71 (GPU) | GPU; CPU muy lenta (~19 s por pregunta) | no disponible |
| Decido-1-XL | DeepSeek-V4-Flash | no disponible | no disponible | 87,25 (GPU) | 4× A100 80 GB | no disponible |
| Decido-1-Pro | Decido-1 + Think + Qwen3.8-27B | no disponible | no disponible | 89,57 (GPU) | 1× A100 80 GB | no disponible |
| Jev 1.13 (referencia) | no disponible | no disponible | no disponible | 83,85 (publicado) | no disponible | no disponible |

## Limitaciones y advertencias

- Solo admite inglés según el campo `language` de la model card; el rendimiento en otros idiomas no está documentado.
- No es un modelo generativo: no produce texto libre, código ni razonamiento multi-paso; su uso está acotado a preguntas cerradas y escalas.
- La longitud de contexto no está publicada; el rendimiento con documentos muy largos no está cuantificado.
- Riesgo de alucinación reducido por diseño (respuestas restringidas a opciones), pero la calibración no es perfecta: el Brier en Kev v9 dev (0,267) es peor que el de Jev (0,212), y el ECE en JevBench (0,038) es ligeramente superior al de Jev (0,032).
- Sensibilidad al orden de las opciones: 4,8% de cambios de respuesta sin promediar permutaciones; conviene usar `perm=4` en producción si la estabilidad es crítica.
- El documento se trata como no fiable, pero sigue siendo un canal de entrada: instrucciones inyectadas no se ejecutan, aunque no se detalla el alcance completo de la defensa.
- Licencia Apache-2.0 sobre el fine-tune; deben verificarse las condiciones de la base Gemma-4-26B-A4B-it para uso comercial, ya que la model card no las detalla.
- Los benchmarks proceden del propio autor y comparan contra cifras publicadas de Jev 1.13, no contra una reproducción independiente verificada.
- El repositorio es de 80,5 GB, lo que implica descarga y almacenamiento considerables; la primera carga del runtime en CPU tarda ~97 s.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-1-Pro: https://huggingface.co/decido-ai/decido-1-pro
- Paquete Python: `pip install decido-ai` (no se proporciona URL de repositorio en la información disponible)
- Referencia externa mencionada: TypeSafe Jev 1.13 (no se proporciona URL en la información disponible)
