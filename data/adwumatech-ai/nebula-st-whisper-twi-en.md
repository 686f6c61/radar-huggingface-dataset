# adwumatech-ai/nebula-st-whisper-twi-en

## Resumen

nebula-st-whisper-twi-en es un modelo de traduccion de voz a texto desarrollado por adwumatech-ai que convierte audio en twi (akan) directamente a texto en ingles. Se construye mediante un ajuste fino extremo a extremo de openai/whisper-small, con 241.734.912 parametros, congelando las 8 capas inferiores del codificador, el front end convolucional y los embeddings, y entrenando las 4 capas superiores del codificador y la totalidad del decodificador preentrenado. La decodificacion parte del prefijo fijo `<|startoftranscript|><|translate|><|notimestamps|>`, sin token de idioma.

El modelo forma parte del proyecto nebula-research y se distribuye con el tag v0.1.0. Resulta relevante por dos motivos: aborda un par de idiomas con recursos escasos (twi-ingles) con evaluacion honesta sobre plantillas de prompt no vistas en entrenamiento, y ofrece artefactos para despliegue en dispositivo mediante ExecuTorch (XNNPACK) en precisiones int8 y fp32, incluyendo programas de entrenamiento con adaptadores LoRA.

La ficha refleja un modelo de version temprana con BLEU bajo en dominios reales (5,55 en emisiones de television) y una licencia marcada como `other` por la inclusion de grabaciones de YouTube sin licencia especificada, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small ajustado) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (procesamiento por ventanas) |
| Tipos de cuantizacion | int8 y fp32 (programas ExecuTorch); pesos PyTorch en safetensors |
| Idiomas soportados | tw (twi/akan), en (ingles) |
| Licencia | other (license_name: unspecified-training-data) |
| Formato de pesos | safetensors; programas ExecuTorch `.pte`; adaptadores `.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con front end convolucional para mel-espectrogramas. El ajuste fino congela las 8 capas inferiores del codificador, el front end convolucional y los embeddings, y entrena las 4 capas superiores del codificador junto con todo el decodificador preentrenado. La tarea es traduccion de voz (speech translation) twi a ingles, no transcripcion: la decodificacion arranca con el prefijo fijo `<|startoftranscript|><|translate|><|notimestamps|>` y sin token de idioma. El audio largo se divide en ventanas de 30 segundos.

Los datos de entrenamiento provienen de los shards de twi del dataset MGhana-ST (12 shards: 6 `akuapim-twi` y 6 `asanti-twi`, todos CC-BY-4.0), complementados con grabaciones de las emisiones DAWURO de UTV obtenidas de YouTube y traducidas al ingles por el proyecto (`mghana_st-utv-twi-1` y `mghana_st-utv-twi-2`), cuya licencia no esta especificada. Los splits de MGhana-ST se separan por plantilla de prompt, de modo que ninguna plantilla de validacion o test aparece en entrenamiento; se documenta que un split anterior por grabacion filtraba aproximadamente el 91% de las frases de test al entrenamiento, invalidando puntuaciones antiguas. Tres emisiones DAWURO quedan completamente fuera del entrenamiento. No se menciona uso de RLHF ni DPO.

## Capacidades

- Traduccion de voz a texto de twi (akan) a ingles, extremo a extremo, sin paso intermedio de transcripcion.
- Procesamiento de audio largo mediante segmentacion automatica en ventanas de 30 segundos.
- Decodificacion con busqueda por haces (beam search, tamano 4) configurable.
- Despliegue en dispositivo mediante ExecuTorch/XNNPACK con programas separados de codificador (`encoder.pte`) y paso de decodificador (`decoder_step.pte`).
- Entrenamiento en dispositivo con adaptadores LoRA (rango 8 en cada capa lineal del decodificador) mediante `decoder_step_lora.pte` y `decoder_train.pte`, con deltas inicializados a cero y adaptadores de ronda 0 en `mobile/adapters.safetensors`.
- Verificacion de integridad de pesos mediante SHA-256 declarados en `manifest.json`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de salida ni modo de razonamiento explicito.

## Casos de uso

- Subtitulado de emisiones de radio y television en twi: el modelo traduce directamente audio de broadcast a texto en ingles; los resultados publicados en tres emisiones DAWURO retenidas (BLEU 5,55, chrF 26,25) indican comprension gruesa, adecuada para subtitulos de apoyo con revision humana.
- Traduccion de frases cotidianas en aplicaciones de mensajeria o asistentes: en el split de validacion con plantillas no vistas alcanza BLEU 13,87 y chrF 24,42, suficiente para frases cortas de uso diario con supervision.
- Despliegue offline en dispositivos moviles o embebidos: los programas int8 (109,2 MB codificador + 182,4 MB decodificador) caben en memoria de dispositivo y permiten traduccion local sin conexion, con una caida de BLEU/chrF de solo -0,04/-0,01 frente a PyTorch y un 80% de salidas identicas en decodificacion greedy.
- Investigacion en traduccion de voz para lenguas de bajos recursos: el particionado por plantilla de prompt y la liberacion de scripts de evaluacion (`scripts/eval.py`) permiten reproducir y comparar resultados de forma metodologicamente limpia.
- Adaptacion en dispositivo a dominios o hablantes concretos: los programas de entrenamiento LoRA permiten ajustar el decodificador en el propio dispositivo con adaptadores de rango 8, util para vocabulario local o variedades dialectales.
- Prototipado de pipelines de accesibilidad: integracion en herramientas que conviertan intervenciones habladas en twi a texto ingles para documentacion o actas, con la advertencia de que la calidad en habla espontanea es limitada.
- Generacion de datos de evaluacion o aumentacion: el modelo puede emplearse como referencia base en experimentos de destilacion o comparacion frente a otros sistemas twi-ingles.

## Benchmarks y rendimiento

Evaluacion con `scripts/eval.py`, busqueda por haces de tamano 4, BLEU/chrF de corpus multi-referencia con `sacrebleu`:

| Split | BLEU | chrF | Segmentos | Que mide |
|---|---|---|---|---|
| test | 7,11 | 17,65 | 1925 | Split de test de MGhana-ST: plantillas de prompt nunca vistas en entrenamiento |
| val | 13,87 | 24,42 | 931 | Split de validacion de MGhana-ST: plantillas de prompt nunca vistas en entrenamiento |
| dawuro | 5,55 | 26,25 | 1147 | 3 emisiones DAWURO (UTV) retenidas: habla real de radio/television nunca vista en entrenamiento |

Paridad de los programas ExecuTorch frente a PyTorch (decodificacion greedy de 100 archivos del split de test):

| Precision | Descarga (codificador + decodificador) | Programas de entrenamiento (paso LoRA + train) | Memoria pico en escritorio | Caida BLEU / chrF vs PyTorch | Salidas identicas |
|---|---|---|---|---|---|
| int8 | 109,2 + 182,4 MB | 182,6 + 143,1 MB | 1003 MB | -0,04 / -0,01 | 80,0 % |
| fp32 | 409,4 + 717,6 MB | 398,5 + 398,5 MB | 1790 MB | 0,0 / 0,0 | 100,0 % |

No se han publicado resultados de benchmarks comparativos con otros modelos twi-ingles en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch: no disponible de forma explicita; con 241,7 millones de parametros, los pesos en fp32 ocupan aproximadamente 0,97 GB y en int8 alrededor de 0,24 GB, mas activaciones y memoria del runtime.
- Memoria pico documentada para los programas ExecuTorch en escritorio: 1003 MB en int8 y 1790 MB en fp32.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia poder ejecutar los programas ExecuTorch; para PyTorch en fp32 basta una GPU de gama media.
- Cabe en GPU consumer: si, dado el tamano del modelo (whisper-small); no se detallan modelos concretos.
- Opciones de despliegue: ExecuTorch con XNNPACK (int8 y fp32) para dispositivo; PyTorch con el script `whisper_st.py` incluido en el repositorio (`python whisper_st.py translate --model <model_dir> clip.wav`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula-st-whisper-twi-en | 241.734.912 | ventanas de 30 s | tw, en | other (unspecified-training-data) | Hugging Face, ExecuTorch |
| openai/whisper-small (modelo base) | 241.734.912 | ventanas de 30 s | multilingue (transcripcion y traduccion a ingles) | Apache 2.0 | Hugging Face |
| Alternativas especificas twi-ingles | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con whisper-small no es equivalente en tarea: el modelo base realiza transcripcion multilingue y traduccion generica a ingles, mientras que este ajuste esta especializado en traduccion twi-ingles. No se dispone de datos de rendimiento de whisper-small sobre los splits de MGhana-ST ni de otros modelos twi-ingles en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad limitada: BLEU de 7,11 en test y 5,55 en emisiones reales; el autor advierte de que cabe esperar traducciones parcialmente correctas de frases cotidianas cortas y comprension solo gruesa de habla de broadcast.
- Riesgo de alucinacion: no documentado explicitamente, pero inherente a los modelos de traduccion de voz con datos escasos; las salidas deben validarse en produccion.
- Sesgos conocidos: no documentados; el entrenamiento se limita a shards de twi de MGhana-ST (variedades akuapim y asanti) y emisiones DAWURO, por lo que la cobertura dialectal y de dominio es estrecha.
- Limitaciones de contexto: procesamiento por ventanas de 30 segundos; no se especifica manejo de solapamientos ni de audio mas alla de la segmentacion.
- Restricciones de licencia: la licencia es `other` con `unspecified-training-data`; las grabaciones DAWURO de YouTube no tienen licencia declarada, por lo que el autor pide contactar con los mantenedores antes de uso comercial o redistribucion. Whisper-small es Apache 2.0 y MGhana-ST es CC BY 4.0, pero el conjunto no hereda una licencia permisiva.
- Caveat metodologico: las puntuaciones antiguas no son comparables porque un split previo por grabacion filtraba aproximadamente el 91% de las frases de test al entrenamiento; solo son validos los resultados de la version 0.1.0 con particion por plantilla de prompt.
- Version temprana: 0.1.0, con 0 descargas y 0 likes en el momento de la consulta; sin ecosistema de terceros ni garantias de mantenimiento.
- Paridad movil parcial: en int8 solo el 80% de las salidas son identicas a PyTorch en decodificacion greedy, lo que puede introducir variabilidad frente a la version de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adwumatech-ai/nebula-st-whisper-twi-en
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset MGhana-ST: https://huggingface.co/datasets/adwumatech-ai/mghana-st
- Repositorio nebula-research: https://github.com/adwumatech-ai/nebula-research
- Registro de datasets (`dataset_registry.yaml`): https://github.com/adwumatech-ai/nebula-research/blob/main/dataset_registry.yaml
