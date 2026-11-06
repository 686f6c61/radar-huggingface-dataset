# kamiyou/zils-mini-xevn-scout

## Resumen

Xevn-4B es un modelo de decisión de 4B parámetros desarrollado por el usuario quevirus (republicado bajo el identificador kamiyou/zils-mini-xevn-scout) y afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo: recibe un estado (texto o cualquier valor JSON) y una o varias preguntas tipificadas, y devuelve en un único forward pass la respuesta elegida junto con una distribución de probabilidad sobre todas las opciones. Está diseñado para tareas de clasificación, elección múltiple, juicios sí/no y puntuación graduada, con foco principal en coreano y soporte secundario de inglés.

La arquitectura es híbrida: combina capas Gated DeltaNet (atención lineal con estado recurrente) con capas de atención completa, en un total de 32 capas (24 Gated DeltaNet y 8 de atención completa), hidden size de 2.560 y un vocabulario de 248.320 tokens. El modelo sigue el formato de decisión Jev, que estandariza la formulación de preguntas con criterios y la lectura calibrada de probabilidades, y se distribuye bajo licencia Apache 2.0.

Su relevancia práctica radica en que sustituye la generación de texto por una pasada de clasificación calibrada: para tareas de enrutamiento, etiquetado o juicio estructurado, elimina la variabilidad y el coste de la decodificación autoregresiva, y ofrece probabilidades directamente utilizables para umbrales y calibración. El repositorio incluye el helper `xevn_infer.py` y pesos en bf16, además de variantes MLX (5 bits) y GGUF publicadas por el autor original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + atención completa (32 capas: 24 Gated DeltaNet, 8 full attention) |
| Parámetros totales | 4.659.865.088 (4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (Transformers); MLX 5 bits; GGUF (llama.cpp) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB); MLX y GGUF en repos separados |
| Hidden size / vocabulario | 2.560 / 248.320 |
| Tipos de pregunta | `choice` (2-26 opciones), `noul` (sí/no), `score` (2-10 niveles) |
| Precisión de referencia | bf16 |
| Librería | transformers (>= 5.2.0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se afina como modelo de decisión. La arquitectura base es un transformer híbrido en el que 24 de las 32 capas usan Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste computacional y de memoria frente a la atención cuadrática, mientras que las 8 capas restantes mantienen atención completa para preservar capacidad de recuperación exacta. El hidden size es de 2.560 y el vocabulario de 248.320 tokens, coherente con el tokenizador multilingüe de la familia Qwen.

El entrenamiento se orienta a la formulación Jev: cada petición se estructura como un `state` más un conjunto de preguntas con tipo, instrucciones y criterios, y el modelo se entrena para producir una distribución de probabilidad sobre las opciones en una sola pasada, sin decodificación autoregresiva. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esa información no está disponible. Sí se documenta un mecanismo de calibración en la lectura: para preguntas `noul`, una probabilidad de "sí" estrictamente entre 0,2 y 0,8 se desplaza a 0,2 o 0,8 del mismo lado para forzar una respuesta comprometida, y se aplican temperaturas de lectura por tipo (`choice` 1,1; `noul` 1,2; `score` 1,2) definidas en `temps.json`.

## Capacidades

- Clasificación y elección múltiple: selecciona una opción entre 2 y 26 alternativas con descripción, devolviendo la clave más probable y la distribución completa.
- Juicio binario sí/no (`noul`) con opciones de etiquetado personalizado para los valores verdadero y falso.
- Puntuación graduada (`score`) en escalas de 2 a 10 niveles, devolviendo el nivel esperado (con valores continuos, como 1,77 en el ejemplo de la model card) y la probabilidad por nivel.
- Procesamiento de estado arbitrario: el `state` puede ser texto libre o cualquier valor JSON, lo que permite clasificar estructuras de datos además de lenguaje natural.
- Comprensión lectora y conocimiento en coreano: evaluado en KoBEST, KorMedMCQA, HAE-RAE, Belebele, KMMLU, CSAT-QA y CLIcK.
- Soporte de inglés funcional, aunque el foco de ajuste es el coreano.
- No genera texto libre ni mantiene conversación: no es un modelo de chat ni de generación.
- No soporta tool calling ni function calling en el sentido de los modelos generativos; su interfaz es la petición estructurada de preguntas.
- Modo de pensamiento explícito: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: con un `state` que contenga el mensaje del cliente y preguntas `choice` con criterios como facturación, envío o cuenta, el modelo devuelve el equipo destinatario con probabilidad asociada (el ejemplo de la model card asigna 0,998 a facturación), lo que permite umbrales de derivación automática.
- Extracción de hechos verificables: preguntas `noul` sobre el texto de entrada (por ejemplo, si el cliente fue cobrado dos veces) devuelven verdadero/falso con probabilidad calibrada, útil para pipelines de validación y control de calidad.
- Priorización y triaje: preguntas `score` con niveles bajo/medio/alto permiten ordenar colas de trabajo con un valor esperado continuo en lugar de una etiqueta discreta, lo que facilita el ranking fino.
- Moderación y cumplimiento: clasificación de contenido o de solicitudes según políticas definidas como criterios de una pregunta `choice`, con distribución de probabilidad para auditar casos límite.
- Anotación asistida de datasets en coreano: el modelo puede preetiquetar corpus con esquemas de clasificación definidos en el momento de la inferencia, sin reentrenamiento, gracias al formato de preguntas con criterios.
- Evaluación de conocimiento y exámenes: uso como clasificador de respuesta en bancos de preguntas tipo test (KMMLU, KorMedMCQA), con la ventaja de una sola pasada por pregunta frente a la decodificación generativa.
- Sistemas de decisión de baja latencia: al no generar texto, cada petición cuesta un único forward pass, adecuado para servicios con gran volumen de clasificaciones por segundo.

## Benchmarks y rendimiento

Los resultados proceden de las ejecuciones del autor con el mismo harness, en 16 bits (bf16; Decider en su FP16 oficial) sobre un Apple M4 Max. La métrica *Headline* combina inteligencia y calibración: (Intelligence + Calibration) / 2.

Precisión (%) en coreano:

| Benchmark | Xevn | JevK5 | Plumb | Decider | Mica | Tev1 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| KoBEST | **89,7** | 69,7 | 84,2 | 74,6 | 72,7 | 67,7 |
| KorMedMCQA | **69,4** | 65,5 | 65,5 | 64,3 | 65,8 | 59,7 |
| HAE-RAE | **58,3** | 56,5 | 54,9 | 53,7 | 54,6 | 53,2 |
| Belebele | **89,0** | 87,4 | 86,6 | 87,2 | 86,3 | 87,6 |
| KMMLU | **56,3** | 52,8 | 55,1 | 54,1 | 54,4 | 47,5 |
| CSAT-QA | 68,8 | **69,4** | 67,7 | 66,2 | 60,5 | 65,1 |
| CLIcK | 66,5 | **67,3** | 67,2 | 64,9 | 64,3 | 62,9 |
| KMMLU-1035 | 50,1 | 48,0 | 48,3 | **51,0** | 48,2 | 43,6 |

Headline en coreano:

| Benchmark | Xevn | JevK5 | Plumb | Decider | Mica | Tev1 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| KoBEST | **92,0** | 83,7 | 84,2 | 82,0 | 85,3 | 87,1 |
| KorMedMCQA | **78,7** | 76,7 | 74,0 | 73,1 | 70,4 | 67,1 |
| HAE-RAE | **70,2** | 69,3 | 68,2 | 63,9 | 62,1 | 61,0 |
| Belebele | **90,3** | 89,7 | 87,7 | 89,3 | 86,4 | 89,2 |
| KMMLU | **68,5** | 63,3 | 67,8 | 58,1 | 58,5 | 55,3 |
| KMMLU-1035 | **60,1** | 55,7 | 57,8 | 53,3 | 49,5 | 49,3 |
| CSAT-QA | 76,4 | 76,6 | **77,3** | 72,3 | 65,7 | 74,4 |
| CLIcK | 72,5 | **74,8** | 73,1 | 68,5 | 68,1 | 68,6 |

Los resultados de la sección inglesa de la model card no están completos en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: el repo ocupa 9,3 GB, por lo que la inferencia en bf16 requiere del orden de 10-11 GB de memoria (pesos más estado de activaciones del forward pass).
- Cuantización MLX 5 bits: reduce el peso a aproximadamente 3 GB, apta para Apple Silicon (se probó en un M4 Max).
- GGUF: disponible para llama.cpp, con lo que puede ejecutarse en CPU y en GPUs de consumo con cuantizaciones de 4-8 bits.
- GPU recomendadas: cualquier GPU con 12 GB o más en bf16 (RTX 4090, L40S, A100, H100); en cuantización GGUF o MLX puede caber en GPUs de consumo de 8 GB.
- Despliegue: transformers >= 5.2.0 con el helper `xevn_infer.py` (dispositivos `cpu`, `mps` o `cuda`); llama.cpp vía GGUF; MLX en Apple Silicon. No se documenta soporte nativo para vLLM o TGI.
- Kernels opcionales: `flash-linear-attention` y `causal-conv1d` aceleran la ejecución; sin ellos los resultados son idénticos, según la model card.
- Latencia y throughput: no disponible; la model card solo indica que cada petición cuesta un único forward pass, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xevn-4B | 4B | no disponible | Modelo de decisión Jev (coreano) | Apache 2.0 | HF, MLX, GGUF |
| JevK5 | no disponible | no disponible | Modelo de decisión Jev | no disponible | no disponible |
| Plumb | no disponible | no disponible | Modelo de decisión Jev | no disponible | no disponible |
| Decider | no disponible | no disponible | Modelo de decisión (FP16 oficial) | no disponible | no disponible |

Los competidores directos son los modelos de decisión del ecosistema Jev (JevK5, Plumb, Decider, Mica, Tev1), para los que la información disponible solo incluye resultados de benchmarks en coreano, sin datos de parámetros, contexto ni licencia. Frente a ellos, Xevn-4B lidera en Headline en seis de los ocho benchmarks coreanos evaluados (KoBEST, KorMedMCQA, HAE-RAE, Belebele, KMMLU y KMMLU-1035) y queda por detrás en CSAT-QA y CLIcK.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación: no puede responder preguntas abiertas ni producir texto libre; solo clasifica sobre opciones predefinidas.
- Está ajustado para coreano; el inglés funciona pero no es el foco, y no se documenta soporte para castellano ni otros idiomas.
- El número de opciones está acotado: 2-26 para `choice` y 2-10 niveles para `score`.
- La calibración de `noul` fuerza las probabilidades fuera del intervalo (0,2; 0,8), lo que altera la distribución devuelta y debe tenerse en cuenta si se usan las probabilidades como scores brutos.
- Los benchmarks son ejecuciones propias del autor con su propio harness, no evaluaciones independientes; deben interpretarse con cautela.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a opciones incorrectas cuando el estado de entrada es ambiguo o está fuera del dominio coreano; no se documentan sesgos específicos.
- Licencia Apache 2.0: permite uso comercial, pero la model card enlaza a una licencia del repo original (quevirus/Xevn-4B) que conviene verificar.
- El repositorio tiene 35 descargas y 0 likes, y fue creado en noviembre de 2026; es un artefacto reciente y con poca validación comunitaria.
- La longitud de contexto no está documentada, lo que limita la planificación de estados largos.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/kamiyou/zils-mini-xevn-scout
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repo original del autor: https://huggingface.co/quevirus/Xevn-4B
- Pesos MLX 5 bits: https://huggingface.co/quevirus/Xevn-4B-MLX-5bit
- Pesos GGUF: https://huggingface.co/quevirus/Xevn-4B-GGUF
- GitHub: https://github.com/Nhahan/Xevn
- Web del proyecto: https://nhahan.github.io/Xevn/
- Formato Jev: https://benchmarkheaven.com/jev-models
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/kamiyou/zils-mini-xevn-scout
- Licencia enlazada: https://huggingface.co/quevirus/Xevn-4B/blob/main/LICENSE
