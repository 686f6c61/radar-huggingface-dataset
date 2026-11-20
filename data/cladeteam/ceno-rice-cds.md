# CladeTeam/CENO-rice-cds

## Resumen

CENO-rice-cds es un ajuste fino (fine-tuning) del modelo base CENO-base-1b-preview, desarrollado por CladeTeam, orientado a la modelización de lenguaje sobre ADN. En concreto, este checkpoint se ha entrenado durante una época sobre secuencias CDS (coding sequences) de *Oryza sativa* (arroz), es decir, las regiones codificantes del genoma de este cultivo. El modelo hereda la arquitectura de NVIDIA Nemotron-H, un transformer híbrido con capas Mamba, y cuenta con 1.302.429.280 parámetros totales según los pesos en safetensors.

El modelo resuelve la tarea de asignar verosimilitud a secuencias de ADN y generar secuencias mediante decodificación autorregresiva a nivel de carácter. Su relevancia radica en que forma parte de un esfuerzo por reproducir experimentos de scoring de secuencias HTT/polyQ, un locus asociado a la enfermedad de Huntington, y por ofrecer un modelo de lenguaje de ADN de tamano ~1B con contexto de 8192 tokens y licencia Apache 2.0. El autor advierte explícitamente que las puntuaciones de log-verosimilitud reflejan la probabilidad del modelo de secuencia, no la aptitud biológica ni la patogenicidad.

La ficha se basa únicamente en la model card y los metadatos disponibles; no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de NVIDIA Nemotron-H (capas Mamba + atención), implementación de referencia renombrada en `configuration_ceno.py` y `modeling_ceno.py` |
| Parametros totales | 1.302.429.280 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | ADN (tag `language: dna`); tokenizador a nivel de carácter |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) con código remoto de Transformers |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Nemotron-H de NVIDIA, un transformer híbrido que combina capas Mamba con capas de atención. El código personalizado incluido en el repositorio es un renombrado de la implementación upstream de Nemotron-H, con `CENOForCausalLM` y `CENOCharLevelTokenizer` como clases expuestas. El tokenizador es a nivel de carácter sobre alfabeto de ADN, lo que permite procesar secuencias nucleotídicas sin tokenización subpalabra. La configuración incluida fija `use_mamba_kernels=false`, de modo que se usa el fallback de Mamba en PyTorch puro y no se requiere instalar `mamba-ssm` ni `causal-conv1d`.

El ajuste fino se realizó durante 1 época sobre CDS de arroz, con `learning_rate=5e-5`, `effective_batch_size=64`, precisión bf16, `max_length=8192` y 8 GPUs. Las métricas reportadas indican `train_loss=10.05208391170438` y `eval_loss=1.21553373336792`. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO. El modelo base es CladeTeam/CENO-base-1b-preview, a su vez derivado de Nemotron-H (Apache-2.0).

## Capacidades

- Generación de texto sobre alfabeto de ADN mediante decodificación autorregresiva a nivel de carácter.
- Modelización de lenguaje causal para calcular log-verosimilitud de secuencias de ADN (sequence scoring).
- Procesamiento de secuencias de hasta 8192 tokens de contexto.
- Especialización en secuencias CDS de *Oryza sativa* (regiones codificantes del arroz).
- Soporte de `trust_remote_code=True` para cargar código remoto de Transformers.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al alfabeto de ADN; no es un modelo de lenguaje natural.

## Casos de uso

- Scoring de secuencias CDS de arroz: calcular la log-verosimilitud media de secuencias codificantes para comparar variantes o detectar secuencias atípicas respecto a la distribución aprendida.
- Reproducción de experimentos HTT/polyQ: el autor declara que el modelo se publica para reproducir experimentos de scoring de secuencias HTT/polyQ, por lo que encaja en pipelines de investigación que replican dichos análisis.
- Filtrado de secuencias génicas generadas: usar el modelo como discriminador de verosimilitud para descartar CDS sintéticas o mal formadas en flujos de diseño génico.
- Análisis de regiones codificantes en genómica comparativa: puntuar secuencias de arroz frente a ortólogos para identificar regiones con baja probabilidad bajo el modelo.
- Investigación en modelos de lenguaje de ADN: servir como checkpoint de referencia de ~1B parámetros con contexto de 8192 para experimentos de escalado y comparación de arquitecturas híbridas Mamba/atención en genómica.
- Generación condicionada de secuencias de ADN: emplear la generación autorregresiva para proponer secuencias candidatas que luego se validan con herramientas bioinformáticas externas.
- Integración en pipelines de Transformers: al exponer `AutoModelForCausalLM` y `AutoTokenizer`, puede incorporarse a flujos existentes de Hugging Face con `trust_remote_code=True`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son de entrenamiento: `train_loss=10.05208391170438` y `eval_loss=1.21553373336792` tras 1 época.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,6 GB solo para pesos (1.302.429.280 parámetros × 2 bytes), más memoria para activaciones y caché KV; el repositorio ocupa 2,6 GB.
- En cuantización de 8 bits se estiman ~1,3 GB para pesos; en 4 bits, ~0,65 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizó con 8 GPUs (modelo no indicado). Para inferencia, una GPU consumer con 8-16 GB de VRAM debería ser suficiente en bf16 para secuencias moderadas.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en bf16 para contextos moderados; en cuantización de 4 bits cabría en GPUs con 4-6 GB.
- Opciones de despliegue: Transformers con `trust_remote_code=True`. El autor indica que HF y vLLM usan entornos separados, lo que sugiere compatibilidad con vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A continuación se comparan únicamente características estructurales verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CladeTeam/CENO-rice-cds | 1.302.429.280 | 8192 | Apache 2.0 | Hugging Face (safetensors) |
| CladeTeam/CENO-base-1b-preview (modelo base) | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |
| NVIDIA Nemotron-H (arquitectura upstream) | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face / NVIDIA |

No se identifican en la información proporcionada otros modelos de lenguaje de ADN comparables con datos de rendimiento publicados.

## Limitaciones y advertencias

- Las puntuaciones de log-verosimilitud reflejan la probabilidad del modelo de secuencia, no la aptitud biológica ni la patogenicidad; el autor lo advierte explícitamente.
- El modelo está especializado en CDS de arroz tras solo 1 época de ajuste fino; su generalización a otras especies o a regiones no codificantes es incierta.
- El `train_loss` reportado (10,05) es muy superior al `eval_loss` (1,22), lo que puede indicar particularidades en el cálculo o en la composición del conjunto de evaluación; conviene interpretar las métricas con cautela.
- La corrección numérica no garantiza generaciones libres de repeticiones ni biológicamente funcionales, según el propio autor.
- Riesgo de alucinación: como modelo generativo de secuencias, puede producir secuencias de ADN plausibles pero no funcionales; requiere validación bioinformática externa.
- Sesgos conocidos: no documentados; el sesgo estará determinado por la composición del dataset de CDS de arroz, no detallada.
- Limitaciones de idioma: solo alfabeto de ADN; no apto para lenguaje natural.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- Dependencia del stack Mamba/Triton de Nemotron-H; el fallback en PyTorch puro (`use_mamba_kernels=false`) puede ser más lento.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe el uso previsto a la reproducción de experimentos de scoring; el uso clínico o diagnóstico no está validado.
- El autor recomienda usar la revisión actualizada del modelo en lugar de archivos de diagnóstico históricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-rice-cds
- Modelo base: https://huggingface.co/CladeTeam/CENO-base-1b-preview
- Repositorio y fuente actual: https://github.com/CladeTeam/CENO
