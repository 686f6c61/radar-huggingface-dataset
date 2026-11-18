# PL-HFT/omniasr-ctc-1b-v2-ko-dysarthria-lora

## Resumen

omniasr-ctc-1b-v2-ko-dysarthria-lora es un adaptador LoRA sobre el modelo base Meta Omnilingual ASR `omniASR_CTC_1B_v2`, desarrollado por PL-HFT para reconocimiento automático de habla (ASR) en coreano con enfasis en habla disartrica. El modelo base es un encoder fairseq2 con cabeza de salida CTC de aproximadamente 1.046 millones de parametros; el adaptador anade 70,8 millones de parametros entrenables (6,76% del total) mediante LoRA de rango 64 y alpha 128 sobre 288 proyecciones del encoder.

El problema que aborda es la baja precision de los sistemas ASR genericos ante habla con disartria, una condicion neurologica que altera la articulacion y que degrada notablemente las tasas de error en modelos entrenados con habla tipica. El adaptador se entrena exclusivamente con el corpus AI-Hub 013 de habla disartrica coreana (129.885 enunciados, 227,72 horas en entrenamiento) y se evalua tambien contra habla tipica (AI-Hub 109) y habla de conferencias (AI-Hub 71627).

Es relevante porque demuestra una via de bajo coste (fine-tuning parametrico eficiente sobre un checkpoint multilingue de 1B) para especializar ASR en poblaciones con necesidades de accesibilidad, manteniendo la licencia Apache 2.0 y un peso de repositorio de solo 0,3 GB al distribuir unicamente los pesos del adaptador y el tokenizador nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder fairseq2 con cabeza CTC (modelo base omniASR_CTC_1B_v2) |
| Parametros totales | 1.046.453.936 (base + adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables | 70.778.880 (6,7637%) |
| Longitud de contexto | segmentos de audio de hasta 29,5 s a 16 kHz mono |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), tokenizador SentencePiece nativo |
| Modelo base | omniASR_CTC_1B_v2 (Meta Omnilingual ASR) |
| Libreria | peft |
| Rango LoRA / alpha / dropout | 64 / 128 / 0,05 |
| Proyecciones adaptadas | 288 (q_proj, k_proj, v_proj, output_proj, inner_proj) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer de fairseq2 con cabeza CTC, integrado en la familia Omnilingual ASR de Meta. El adaptador LoRA congela todos los parametros del base y de la cabeza CTC, y entrena unicamente las matrices de bajo rango inyectadas en 288 proyecciones del encoder (`q_proj`, `k_proj`, `v_proj`, `output_proj`, `inner_proj`), sin sesgos entrenables. La exportacion a safetensors preserva los 576 tensores nativos del adaptador bit a bit bajo nombres PEFT, y el loader mantiene el calculo en float32 del entrenador, casteando la actualizacion antes de sumarla a la proyeccion base.

El entrenamiento se ejecuto en una NVIDIA A100-SXM4-80GB con 4.060 actualizaciones del optimizador durante dos epocas (semilla 42), usando Fused AdamW con learning rate 1e-4, 300 pasos de warmup, decaimiento lineal, weight decay 0,01 y norma maxima de gradiente 1,0. Los micro-batches fueron de 8 con acumulacion sobre 8 micro-batches (batch efectivo de 64 enunciados). La seleccion del checkpoint se hizo por menor perdida CTC de validacion, alcanzando 1,45511 de loss, CER 1,62% y WER 5,58% sobre 16.531 enunciados de validacion. Los datos de entrenamiento proceden de AI-Hub 013 (habla disartrica coreana): 129.885 enunciados y 227,72 horas en train, 16.531 enunciados y 28,93 horas en validacion. Se aplico padding derecho minimo a 40 segmentos de train y 3 de validacion para cumplir el minimo del frontend CTC.

## Capacidades

- Reconocimiento automatico de habla en coreano, con especializacion en habla disartrica.
- Transcripcion de audio mono a 16 kHz en segmentos de hasta 29,5 segundos.
- Decodificacion CTC nativa mediante el pipeline de `omnilingual-asr`.
- Procesamiento por lotes (`batch_size` configurable) en inferencia.
- Uso como adaptador PEFT sobre el checkpoint oficial, permitiendo alternar entre el modelo base y la version especializada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo thinking.
- Capacidad multilingue limitada al coreano (el base es multilingue, pero el adaptador solo se entrena para ko).

## Casos de uso

- Subtitulado y transcripcion de habla disartrica en entornos clinicos: el adaptador reduce el CER al 1,48% en el test de disartria de AI-Hub 013, lo que lo hace adecuado para generar transcripciones de sesiones de logopedia o evaluaciones neurologicas con supervision humana.
- Accesibilidad en interfaces de voz para personas con disartria: integrado en asistentes o sistemas de dictado, permite que usuarios con alteraciones motoras del habla operen dispositivos mediante voz con una tasa de error sustancialmente menor que un ASR generico.
- Documentacion clinica asistida: transcripcion de entrevistas medico-paciente en coreano donde el paciente presenta disartria, con el modelo ejecutandose en local (pesos de 0,3 GB mas checkpoint base) para cumplir requisitos de privacidad.
- Investigacion en ASR para habla patologica: el adaptador sirve como linea base reproducible (semilla, hiperparametros y manifiesto de exportacion publicados) para comparar tecnicas de adaptacion en coreano.
- Transcripcion de material audiovisual coreano con mezcla de hablantes tipicos y disartricos: el modelo mantiene un CER del 12,35% en habla tipica (AI-Hub 109), lo que permite un unico pipeline para contenido mixto.
- Prototipado rapido de productos de voz en coreano: al ser un adaptador PEFT sobre un base Apache 2.0, se puede desplegar en CPU (el quickstart oficial usa runtime CPU con float32) para demos y validacion de concepto sin infraestructura GPU.
- Evaluacion comparativa de corpus: util para medir el impacto de la disartria en ASR sobre AI-Hub 71627 (habla de conferencias), donde el modelo obtiene CER 19,22% y WER 48,62%, sirviendo como referencia de dominio fuera de distribucion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | CER (%) | WER (%) |
|---|---|---|---|
| Korean Pooled Internal Test (AI-Hub 013 + 109) | test | 8,10 | 25,68 |
| Korean Dysarthria Speech Test (AI-Hub 013) | test | 1,48 | 5,02 |
| Korean Typical Speech Test (AI-Hub 109) | test | 12,35 | 38,56 |
| External Korean Lecture Speech Test (AI-Hub 71627) | test | 19,22 | 48,62 |

En validacion durante el entrenamiento (16.531 enunciados): loss CTC 1,45511, CER 1,62%, WER 5,58%. El scorer emplea texto coreano normalizado y calcula cada tasa como suma de distancias de edicion dividida por la suma de longitudes de referencia. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint base de 1B en float32 requiere aproximadamente 4,2 GB solo para pesos, mas activaciones y buffers de audio; en float16/bfloat16 se reduce a unos 2,1 GB. El adaptador anade 70,8 M de parametros (unos 283 MB en float32).
- GPU recomendadas: NVIDIA A100-SXM4-80GB fue la usada en entrenamiento; para inferencia son suficientes GPUs con 8-16 GB (RTX 3090, RTX 4090, A10, L4). El quickstart oficial funciona en CPU con `torch.float32`.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares con al menos 8 GB de VRAM para el base en precision reducida.
- Opciones de despliegue: el loader oficial usa `PeftModel.from_pretrained` sobre el modelo fairseq2 y el pipeline de `omnilingual-asr`; requiere el checkpoint oficial `omniASR-CTC-1B-v2.pt` descargado aparte. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son runtimes orientados a LLM, no a ASR fairseq2).
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo procesa lotes (`batch_size`) y segmentos de hasta 29,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| omniasr-ctc-1b-v2-ko-dysarthria-lora | 1,046 M (70,8 M entrenables) | segmentos hasta 29,5 s | coreano | Apache 2.0 | ASR coreano + disartria |
| omniASR_CTC_1B_v2 (base) | 1,046 M | no disponible | multilingue | no disponible en la informacion | ASR multilingue generico |
| Whisper large-v3 | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | ASR multilingue generico |
| Whisper small/medium | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | ASR multilingue generico |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia e idioma. La ventaja diferencial del adaptador es la especializacion en disartria coreana, no el rendimiento bruto multilingue.

## Limitaciones y advertencias

- El adaptador solo cubre coreano; no se debe esperar buen rendimiento en otros idiomas aunque el base sea multilingue.
- Entrenado exclusivamente con AI-Hub 013 (habla disartrica); el rendimiento en habla tipica es notablemente peor (CER 12,35% en AI-Hub 109) y en dominio de conferencias se degrada aun mas (CER 19,22%, WER 48,62%), lo que indica sensibilidad al dominio y al estilo de habla.
- Segmentos de audio limitados a 29,5 s y 16 kHz mono; audios mas largos requieren segmentacion previa.
- Riesgo de alucinacion y sustituciones en palabras poco frecuentes, especialmente en habla con alta variabilidad articulatoria; se recomienda supervision humana en contextos clinicos.
- Sesgos potenciales derivados del corpus AI-Hub 013 (demografia, dialectos y gravedad de la disartria no documentados en la informacion disponible).
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base debe obtenerse del checkpoint oficial de Meta y queda sujeto a su propia licencia, no detallada en la informacion disponible.
- Requiere el checkpoint base (`omniASR-CTC-1B-v2.pt`) y el runtime fairseq2; no es un modelo autonomo ni se puede cargar con runtimes LLM estandar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/PL-HFT/omniasr-ctc-1b-v2-ko-dysarthria-lora
- Checkpoint base oficial: https://dl.fbaipublicfiles.com/mms/omniASR-CTC-1B-v2.pt
- Model card en coreano: https://huggingface.co/PL-HFT/omniasr-ctc-1b-v2-ko-dysarthria-lora/blob/main/README.ko.md
- Configuracion de entrenamiento: https://huggingface.co/PL-HFT/omniasr-ctc-1b-v2-ko-dysarthria-lora/blob/main/metadata/training_config.yaml
- Manifiesto de exportacion: https://huggingface.co/PL-HFT/omniasr-ctc-1b-v2-ko-dysarthria-lora/blob/main/metadata/export_manifest.json
- Metricas de evaluacion: https://huggingface.co/PL-HFT/omniasr-ctc-1b-v2-ko-dysarthria-lora/blob/main/metadata/evaluation_metrics.json
