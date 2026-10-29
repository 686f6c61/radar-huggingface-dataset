# sanmartp/whisper-tiny_to_chinese_accent_28oct

## Resumen

`sanmartp/whisper-tiny_to_chinese_accent_28oct` es un ajuste fino (fine-tune) del modelo `openai/whisper-tiny` de OpenAI para reconocimiento automático del habla (ASR), especializado en inglés hablado con acento chino. Lo publica el usuario sanmartp en Hugging Face y se entrenó sobre el dataset `naharte/chinese_english`. Con 37,76 millones de parámetros, es uno de los modelos ASR más pequeños del ecosistema Whisper, lo que lo sitúa en la categoría de soluciones para despliegue en dispositivos con recursos muy limitados.

El problema que aborda es acotado pero relevante: los modelos Whisper genéricos pierden precisión ante acentos no nativos, y un fine-tune dirigido puede mejorar la tasa de error de palabra (WER) en ese subconjunto. El autor declara un WER de 13,3439 sobre el split de test del dataset de entrenamiento, aunque la métrica está marcada como no verificada (`verified: false`) en el model-index.

Es relevante ahora por dos motivos prácticos: la licencia Apache 2.0 declarada permite uso comercial sin fricción, y el tamaño reducido (repo de 0,3 GB) permite inferencia en CPU o en GPUs de gama baja. Ahora bien, la model card está generada automáticamente y mayoritariamente vacía (secciones "More information needed"), el modelo no tiene descargas ni likes en el momento del análisis, y el autor no documenta la composición del dataset ni el procedimiento de evaluación, por lo que debe tratarse como un experimento reproducible antes que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de tipo Whisper; parte de `openai/whisper-tiny` (4 capas de encoder y 4 de decoder, d_model=384, 6 cabezas de atención) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por pasada (característica inherente a Whisper); contexto de texto del decoder: no disponible en la información proporcionada |
| Tipos de cuantización | No se distribuyen versiones cuantizadas en el repositorio; pesos publicados en safetensors (fp32) |
| Idiomas soportados | `en` (inglés), según la etiqueta de idioma declarada por el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny: un transformer encoder-decoder que recibe un espectrograma mel logarítmico de 80 canales calculado sobre ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El fine-tune no modifica la topología del modelo base, solo los pesos, por lo que conserva el tokenizador multilingüe de Whisper y la capacidad de emitir tokens especiales de idioma y de marcas temporales.

El entrenamiento se realizó con el `Trainer` de Transformers sobre el dataset `naharte/chinese_english` (split sin especificar en la información disponible). Los hiperparámetros documentados son: learning rate 1e-5, batch de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2.000 pasos totales. El registro de resultados muestra dos puntos de control: en el paso 1.000 (época 1,2837) la pérdida de validación fue 0,3155 con WER 14,2494; en el paso 2.000 (época 2,5674) bajó a 0,3069 con WER 13,3439. No se documenta el volumen de datos, la composición del corpus, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). Las versiones de framework empleadas fueron Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3, lo que indica que se usó una build de desarrollo de Transformers.

## Capacidades

- Transcripción de voz a texto en inglés, con especialización en habla con acento chino.
- Salida con marcas temporales a nivel de segmento (capacidad heredada de Whisper, aunque el fine-tune no la documenta explícitamente).
- Detección de idioma y tokens especiales de Whisper preservados del modelo base.
- Procesamiento de audio de hasta 30 segundos por invocación; para audios más largos es necesario aplicar troceado y concatenación por parte del pipeline.
- Inferencia en CPU viable por el reducido número de parámetros.
- No soporta tool calling ni function calling: es un modelo puramente ASR, sin interfaz de instrucciones.
- No soporta razonamiento multi-paso, agentes, visión ni audio-input más allá del propio ASR.
- Capacidad multilingüe: no confirmada; el autor solo declara `en`, pese a que el modelo base es multilingüe.

## Casos de uso

- Transcripción de reuniones con participantes sinohablantes: el fine-tune está orientado a inglés con acento chino, por lo que puede reducir el WER frente a Whisper tiny genérico en grabaciones de equipos distribuidos entre China y países anglófonos.
- Subtitulado automático de vídeos corporativos o webinars: al ser un modelo de 37,7 M de parámetros, se puede ejecutar en lote sobre horas de audio en CPU con un coste computacional bajo, generando transcripciones preliminares que luego revisa un editor humano.
- Prototipado rápido de pipelines ASR: sirve como baseline ligero para validar una arquitectura de preprocesado de audio antes de invertir en modelos de mayor tamaño.
- Atención al cliente con acento marcado: para centros de soporte donde los agentes hablan inglés con acento chino, el modelo puede alimentar un sistema de analítica de llamadas (keyword spotting, cumplimiento) con latencia baja.
- Despliegue en el borde (edge): con ~151 MB en fp32 y ~75 MB en fp16, cabe en dispositivos embebidos, routers o Raspberry Pi, permitiendo transcripción local sin enviar audio a la nube.
- Investigación sobre adaptación de dominio en ASR: el par de checkpoints publicados (paso 1.000 y 2.000) permite estudiar la evolución del WER con el número de pasos en un dataset de acento específico.
- Generación de datos de entrenamiento: transcripciones automáticas de corpus de audio con acento chino para alimentar etapas posteriores de anotación o de destilación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`).

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | `naharte/chinese_english` (config default, split test) | WER | 13,3439 |
| Validación (paso 2.000) | `naharte/chinese_english` | Loss | 0,3069 |
| Validación (paso 1.000) | `naharte/chinese_english` | Loss / WER | 0,3155 / 14,2494 |

Evolución durante el entrenamiento:

| Training loss | Época | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,1223 | 1,2837 | 1.000 | 0,3155 | 14,2494 |
| 0,0589 | 2,5674 | 2.000 | 0,3069 | 13,3439 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (~151 MB de pesos más activaciones y buffers del espectrograma mel); ~500 MB de pico realista con lotes pequeños. En fp16, los pesos ocupan ~75 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; sirven GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo está limitado por latencia de CPU/host, no por cómputo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer de los últimos diez años; también en CPU (x86 o ARM) y en dispositivos tipo Raspberry Pi 5.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers (vía documentada), exportación a CTranslate2 / faster-whisper y a whisper.cpp o ggml mediante conversión manual (no se incluyen artefactos preconvertidos en el repositorio). También es posible servir con TGI si se adapta la tarea, aunque no es el caso de uso habitual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sanmartp/whisper-tiny_to_chinese_accent_28oct` | 37,76 M | 30 s | 13,3439 (dataset propio, no verificado) | apache-2.0 | Hugging Face, 0 descargas |
| `openai/whisper-tiny` | 37,76 M | 30 s | No disponible para este dataset | apache-2.0 (MIT en el repositorio original de OpenAI) | Hugging Face, ampliamente adoptado |
| `openai/whisper-base` | ~74 M | 30 s | No disponible para este dataset | apache-2.0 | Hugging Face |
| `openai/whisper-small` | ~244 M | 30 s | No disponible para este dataset | apache-2.0 | Hugging Face |

La comparación directa de WER con los modelos base no es posible porque el autor solo reporta métricas sobre su propio conjunto de evaluación y no incluye una línea base de `openai/whisper-tiny` medida en el mismo split. Sin esa referencia, no se puede cuantificar la mejora atribuible al fine-tune.

## Limitaciones y advertencias

- Model card generada automáticamente y sin completar: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento contienen literalmente "More information needed".
- La métrica de WER está marcada como no verificada en el model-index y se calcula sobre el mismo dataset usado para el ajuste; no hay conjunto de test independiente documentado, por lo que el 13,34 % puede estar sobreestimando el rendimiento real.
- El WER absoluto es alto para estándares de producción (13,34 %), lo que implica aproximadamente una palabra errónea de cada siete u ocho.
- Entrenamiento muy corto (2.000 pasos, batch de 2) sobre un corpus no documentado: riesgo elevado de sobreajuste al dominio y a los hablantes concretos del dataset.
- Solo se declara inglés como idioma, pese a que la arquitectura base es multilingüe; el comportamiento en otros idiomas no está caracterizado y probablemente degradado.
- Riesgo de alucinación típico de Whisper: en segmentos con silencio, ruido o música puede generar texto inventado o bucles de repetición.
- Ventana fija de 30 segundos: requiere segmentación externa para audio largo, con riesgo de cortes en fronteras de frase.
- Adopción nula (0 descargas, 0 likes) y ausencia de validación por terceros: no hay evidencia de robustez fuera del corpus del autor.
- Licencia apache-2.0 declarada por el autor sobre un derivado de `openai/whisper-tiny`; conviene verificar la compatibilidad con los términos del modelo base antes de un uso comercial.
- Fecha de creación registrada como 2026-10-28, posterior al momento del análisis; conviene contrastar la trazabilidad del repositorio.
- No se publican curvas de evaluación completas, ni matrices de confusión, ni análisis por hablante o por tipo de acento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanmartp/whisper-tiny_to_chinese_accent_28oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/chinese_english
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos versaban sobre redes sociales y fuentes tipográficas), por lo que no se incluyen enlaces adicionales de prensa, blogs o demos.
