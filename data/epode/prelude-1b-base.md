# Epode/Prelude-1B-Base

## Resumen

Prelude-1B-Base (anteriormente L20-1B-20B-Base) es un modelo de lenguaje causal en ingles de 1.100.048.384 parametros, desarrollado por Epode, entrenado desde inicializacion aleatoria sobre 20.000 millones de tokens de prediccion en una unica GPU NVIDIA L20. Se trata de un experimento aislado de la familia principal de modelos MoE de Epode (Note 0.5B, Verse 1B, Canto 3.3B y Saga 7B) y no forma parte de ella: es un modelo denso de estilo Llama entrenado en un solo acelerador, con tokenizer tambien entrenado desde cero y sin uso de checkpoints preentrenados de terceros.

El modelo resuelve un problema concreto de investigacion: medir la eficiencia computacional del preentrenamiento en hardware de gama unica y comparar la frontera de eficiencia frente a TinyLlama bajo un protocolo congelado de siete tareas. Su relevancia actual radica en la trazabilidad del experimento: publica telemetria de GPU (throughput, MFU, consumo), el conjunto completo de 36 checkpoints comparados y las metricas en formato legible por maquina.

Arquitectura transformer densa tipo LlamaForCausalLM con 22 capas, hidden size 2.048, atencion GQA con 32 cabezas de consulta y 4 de clave/valor, contexto de 2.048 tokens y vocabulario de 32.000 tokens BPE byte-level. Es un modelo base de completado, no ajustado a instrucciones ni a preferencias, por lo que su uso en produccion requiere post-entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los safetensors publicados estan en FP32; la model card sugiere cargar en BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint final exacto en FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 22 capas, hidden size de 2.048, MLP intermedio de 5.632 y atencion con 32 cabezas de consulta y 4 de clave/valor (GQA). Emplea RoPE con theta 10.000, vocabulario de 32.000 tokens BPE byte-level y no utiliza weight tying entre embedding de entrada y capa de salida. El entrenamiento se realizo en BF16 con precision mixta, PyTorch SDPA compilado, AdamW fusionado, longitud de secuencia 2.048, micro-batch de 6 y acumulacion de gradiente de 85, resultando en un batch global efectivo de 510 secuencias. Se completaron 19.148 pasos de optimizador y 19.999.703.040 tokens de prediccion, con 1.000 pasos de warmup y decaimiento coseno de la tasa de aprendizaje de 4e-4 a 4e-5.

La mezcla de datos en ingles fue: 42,5% FineWeb-Edu-Dedup con score 4+, 42,5% DCLM-Baseline, 3% FineMath-4+ y 12% codigo de Stack-Edu con licencias permisivas en Python, JavaScript, TypeScript, C++ y Java. Los documentos aceptados pasaron filtros de ingles y contenido, deduplicacion exacta SHA-256 sobre texto normalizado y una comprobacion de descontaminacion de benchmarks de 13 palabras. Los correos electronicos y direcciones IPv4 sintacticamente validas de DCLM se anonimizaron de forma determinista. La lista original de descontaminacion no incluia explicitamente BoolQ, por lo que se publica un analisis de sensibilidad de seis tareas excluyendo BoolQ.

El entrenamiento se ejecuto integramente en una NVIDIA L20 con 46.068 MiB de VRAM, con driver 580.159.04, CUDA 13.0, PyTorch 2.12.1+cu130, Transformers 4.56.2 y lm-eval 0.4.9. Una instantanea representativa en el paso 10.595 registro 12.845 tokens/s, 93,948 TFLOP/s de modelo, un MFU estandar del 71,17% (usando 132 TFLOP/s BF16 como denominador de pico), 100% de utilizacion de GPU, 45.265 MiB de VRAM y 348,3 W de consumo. Un preflight separado de 60 pasos con el micro-batch seleccionado midio 12.586 tokens/s y 36,13 GiB de memoria pico asignada; el micro-batch 8 se descarto tras un fallo por falta de memoria.

## Capacidades

- Generacion de texto autoregresiva en ingles: completado de texto libre a partir de un prompt, sin formato conversacional.
- Razonamiento basico y conocimiento factual limitado, derivado del preentrenamiento sobre FineWeb-Edu y DCLM-Baseline.
- Generacion de codigo en Python, JavaScript, TypeScript, C++ y Java, gracias al 12% de Stack-Edu en la mezcla de entrenamiento.
- Razonamiento matematico elemental, con un 3% de FineMath-4+ en el dataset.
- Capacidad multilingue: no disponible; el modelo esta entrenado exclusivamente en ingles.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin post-entrenamiento para ello).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre eficiencia de preentrenamiento: el modelo sirve como punto de referencia reproducible para estudiar la relacion entre tokens de entrenamiento, computo y calidad, ya que publica telemetria de GPU y la comparativa completa de 36 checkpoints.
- Generacion de texto asistida en dominios educativos: con un 42,5% de FineWeb-Edu en la mezcla, es adecuado para experimentos de completado de material didactico y evaluacion de sesgos en corpus educativos.
- Completado de codigo en entornos controlados: puede usarse como modelo base para estudiar la generacion de Python, JavaScript, TypeScript, C++ y Java antes de aplicar ajuste fino supervisado.
- Punto de partida para ajuste fino (fine-tuning) en tareas en ingles: al ser un base model denso de 1,1B, cabe en una GPU consumer y sirve como inicializacion para clasificacion, resumen o extraccion de informacion tras el correspondiente SFT.
- Evaluacion de tecnicas de cuantizacion y despliegue: su tamano permite medir latencia, throughput y perdida de calidad en formatos de baja precision sobre hardware modesto.
- Docencia y experimentacion en cursos de LLM: el modelo y su model card documentan el pipeline completo (tokenizer, mezcla de datos, filtros, evaluacion con lm-eval), lo que lo hace util como caso de estudio de entrenamiento desde cero.
- Reproducibilidad de benchmarks: la publicacion de metricas en JSON y de la comparativa con TinyLlama permite replicar y auditar protocolos de evaluacion con lm-eval 0.4.9.

## Benchmarks y rendimiento

Evaluacion externa con lm-eval 0.4.9, BF16, contexto maximo de 2.048 y semillas fijas. Perdida de validacion final retenida: 2,4247 (perplejidad 11,2990).

| Tarea | Shots | Metrica | Resultado |
|---|---:|---|---:|
| ARC-Challenge | 0 | acc_norm | 33,62% |
| ARC-Easy | 0 | acc_norm | 64,14% |
| HellaSwag | 0 | acc_norm | 45,13% |
| OpenBookQA | 0 | acc_norm | 35,00% |
| PIQA | 0 | acc_norm | 69,59% |
| WinoGrande | 0 | acc | 52,17% |
| BoolQ | 0 | acc | 59,17% |
| LAMBADA OpenAI | 0 | acc | 46,26% |
| TruthfulQA MC2 | 0 | acc | 36,91% |
| MMLU | 5 | acc | 25,31% |
| GSM8K | 5 | flexible exact match | 1,67% |

Macro primario de siete tareas (HellaSwag, PIQA, WinoGrande, OpenBookQA, ARC-Easy, ARC-Challenge y BoolQ): 51,2601%. Excluyendo BoolQ: 49,9411%.

Comparacion con TinyLlama bajo el mismo protocolo congelado de siete tareas:

| Comparacion | Diferencia (pp) | IC 95% bootstrap |
|---|---:|---|
| vs. TinyLlama 1T | +1,0182 | [+0,1584, +1,8860] |
| vs. TinyLlama 1.5T | +0,0910 | [-0,7771, +0,9745] |
| vs. TinyLlama 2T | -0,3019 | [-1,1978, +0,5871] |
| vs. TinyLlama 2.5T | -2,6317 | [-3,4891, -1,8006] |

Los intervalos cubren unicamente la incertidumbre de muestreo de items de benchmark; no cubren la varianza de semilla de entrenamiento ni estan ajustados por comparaciones multiples. El estudio completo de 36 checkpoints contiene tanto victorias como derrotas y constituye un conjunto candidato congelado, no un censo global ni una afirmacion de liderazgo universal en eficiencia de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 4,4 GB solo para pesos, mas memoria para activaciones y cache KV; el repo pesa 4,4 GB.
- VRAM estimada en BF16: aproximadamente 2,2 GB para pesos, mas overhead de runtime.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,1 GB para pesos; en 4 bits, en torno a 0,6 GB (estimaciones teoricas a partir del numero de parametros; no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L20 de 46 GB, pero la inferencia en BF16 cabe holgadamente en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM en BF16; con cuantizacion, en GPUs de 2-4 GB.
- Opciones de despliegue: transformers (referencia de la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Para llama.cpp, Ollama o vLLM seria necesaria una conversion a GGUF o la carga directa del checkpoint, no documentada por el autor.
- Latencia y throughput de inferencia: no disponible. Solo se publica throughput de entrenamiento (12.845 tokens/s en el paso 10.595).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro 7 tareas | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Prelude-1B-Base | 1,10B | 2.048 | 51,2601% | no disponible | Hugging Face (Epode) |
| TinyLlama 1T | no disponible | no disponible | 50,2419% (derivado de la diferencia publicada) | no disponible en la informacion | no disponible en la informacion |
| TinyLlama 1.5T | no disponible | no disponible | 51,1691% (derivado de la diferencia publicada) | no disponible en la informacion | no disponible en la informacion |
| TinyLlama 2T | no disponible | no disponible | 51,5620% (derivado de la diferencia publicada) | no disponible en la informacion | no disponible en la informacion |
| TinyLlama 2.5T | no disponible | no disponible | 53,8918% (derivado de la diferencia publicada) | no disponible en la informacion | no disponible en la informacion |

Nota: los valores de TinyLlama se derivan aritmeticamente de las diferencias en puntos porcentuales publicadas por el autor; no se han verificado de forma independiente. No se dispone de datos de parametros, contexto ni licencia de TinyLlama en la informacion proporcionada.

## Limitaciones y advertencias

- No esta ajustado a instrucciones, preferencias ni seguridad: es un modelo base de completado, no un asistente conversacional.
- Puede alucinar, repetir texto y producir contenido sesgado o danino; el autor advierte explicitamente que no debe usarse sin salvaguardas.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Entrenado exclusivamente en ingles; no se garantiza ningun rendimiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; es un riesgo critico para produccion.
- Rendimiento en tareas de conocimiento y razonamiento muy bajo: MMLU 25,31% y GSM8K 1,67%, proximos a niveles de azar en el caso de GSM8K.
- La descontaminacion de benchmarks no incluyo BoolQ de forma explicita, lo que introduce incertidumbre en esa metrica; el autor publica el macro alternativo sin BoolQ (49,9411%).
- Los intervalos de confianza publicados no cubren la varianza de semilla de entrenamiento ni ajustan por comparaciones multiples.
- Telemetria de entrenamiento basada en instantaneas puntuales, no en promedios de la ejecucion completa.
- Sin informacion sobre cuantizaciones oficiales ni conversiones a GGUF; el despliegue en llama.cpp u Ollama requeriria trabajo adicional no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Epode/Prelude-1B-Base
- Pagina de la familia Epode: https://huggingface.co/spaces/Epode/README
- Metricas finales de benchmark (JSON): https://huggingface.co/Epode/Prelude-1B-Base/blob/main/evaluation/final-benchmarks.json
- Comparativa completa de 36 checkpoints: https://huggingface.co/Epode/Prelude-1B-Base/blob/main/evaluation/efficiency-all-results.md
- Telemetria de GPU del entrenamiento: https://huggingface.co/Epode/Prelude-1B-Base/tree/main/training
- Grafico de frontera de eficiencia computacional: https://huggingface.co/Epode/Prelude-1B-Base/resolve/main/assets/efficiency-frontier-clean.png
