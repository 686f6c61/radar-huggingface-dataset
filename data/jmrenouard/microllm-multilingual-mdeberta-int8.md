# jmrenouard/microllm-multilingual-mdeberta-int8

## Resumen

MicroLLM Multilingual mDeBERTa-v3 INT8 es un encoder de clasificación zero-shot derivado de `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli`, cuantizado a INT8 dinámico por tensor y empaquetado para el ecosistema MicroLLM. Lo publica Jean-Marie Renouard junto con los contribuidores de MicroLLM bajo licencia Apache 2.0. El modelo no genera texto: es un clasificador de inferencia de lenguaje natural (NLI) que asigna etiquetas arbitrarias a un texto calculando la entradilla (entailment) entre la premisa y cada hipótesis candidata.

Su propósito es actuar como "System-1" en pipelines de agentes y atención al cliente: triaje de tickets, enrutado de intenciones y decisiones de guardarraíl con latencia muy baja en CPU. Para ello ofrece dos rutas de inferencia: una proyección lineal INT8 calibrada (`model_quantized_int8.npz`) pensada para microservicios y entornos embebidos con latencia sub-milisegundo, y una sesión ONNX Runtime completa (`onnx/model_quantized.onnx`) con el encoder transformer íntegro.

El paquete ocupa aproximadamente 134 MB, cubre cinco idiomas (inglés, francés, español, portugués y alemán) y está limitado a 512 tokens de secuencia. Es relevante para quienes necesitan clasificación multilingüe determinista y barata en CPU, sin depender de un LLM generativo, aunque su alcance es acotado: no razona, no conversa y no produce texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mDeBERTa-v3 (encoder transformer) para NLI y clasificación zero-shot |
| Parametros totales | no disponible (deriva de mDeBERTa-v3-base; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (el texto superior se trunca) |
| Tipos de cuantizacion | INT8 dinámico por tensor, simétrico, con recorte en [-127, 127]; además de la proyección lineal INT8 calibrada en `.npz` |
| Idiomas soportados | en, fr, es, pt, de |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) y `.npz` (`model_quantized_int8.npz`) |
| Tamano del paquete | ~134 MB |
| Pipeline | zero-shot-classification |
| Etiquetas NLI | 0 = entailment, 1 = neutral, 2 = contradiction |

## Arquitectura y entrenamiento

El modelo es un encoder mDeBERTa-v3 afinado para NLI (MNLI y XNLI) en su versión base upstream, sobre el que se aplica cuantización dinámica INT8 por tensor con calibración simétrica. La decisión zero-shot se obtiene evaluando la entradilla entre el texto de entrada y cada etiqueta candidata, con un índice de entradilla fijado estrictamente en 0 para alinear la clasificación binaria de decisión. El grafo ONNX expone `input_ids` y `attention_mask` como entradas int64 y devuelve `logits` con forma `[batch_size, sequence_length, 3]` en float32.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un derivado de un modelo NLI, cabe esperar que herede el ajuste supervisado del upstream, pero el autor no lo detalla. La innovación destacable es el doble mecanismo de inferencia: una ruta de proyección lineal INT8 calibrada para latencia sub-milisegundo en CPU y una ruta ONNX completa para mayor precisión, ambas empaquetadas con el SDK y la CLI de MicroLLM.

## Capacidades

- Clasificación zero-shot de texto en cinco idiomas mediante etiquetas arbitrarias definidas en tiempo de inferencia.
- Triaje y enrutado de tickets de soporte con selección de departamento y puntuación de confianza.
- Decisiones de guardarraíl y filtrado determinista en flujos de agentes.
- Inferencia en CPU de baja latencia (objetivo declarado inferior a 18 ms, con ruta de proyección sub-milisegundo).
- Ejecución vía ONNX Runtime con grafo documentado y salida de logits NLI.
- Integración con el SDK de Python de MicroLLM (`create_multilingual_backend`) y su CLI (`microllm pull`, `microllm benchmark`).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni modalidades de visión o audio.

## Casos de uso

- Triaje de tickets de soporte multilingüe: el modelo recibe el mensaje del cliente y una lista de departamentos (facturación, envíos, técnico) y devuelve la etiqueta más probable con confianza; su ventana de 512 tokens cubre la mayoría de consultas de primer nivel.
- Enrutado de intenciones en asistentes conversacionales: clasifica cada turno del usuario en intenciones predefinidas antes de derivar a un LLM generativo, reduciendo coste y latencia del pipeline.
- Guardarraíles y moderación: evalúa si una petición cae en categorías prohibidas mediante clasificación NLI con etiquetas de política, con escalado automático cuando la confianza baja de 0,85.
- Microservicios en el borde: al ocupar ~134 MB y ejecutarse en CPU con proyección INT8, puede desplegarse en contenedores ligeros o dispositivos embebidos sin GPU.
- Prefiltrado en pipelines RAG: clasifica la consulta del usuario para decidir qué índice o colección consultar antes de la recuperación, aprovechando la latencia sub-milisegundo de la ruta lineal.
- Clasificación documental por lotes: etiquetado de grandes volúmenes de textos cortos en EN/FR/ES/PT/DE con ONNX Runtime, donde el throughput en CPU prima sobre la precisión de un modelo mayor.
- Validación de salidas de agentes: comprobar si la respuesta de un LLM implica o contradice una política de negocio antes de entregarla al usuario.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MicroLLM Multilingual Customer Support Benchmark (EN, FR, ES, PT) | 100,0 % de precisión | Benchmark propio del autor; no es un estándar público independiente |
| Latencia objetivo en CPU | < 18,0 ms | Declarada por el autor; la ruta de proyección lineal se describe como sub-milisegundo |

No se han publicado resultados de benchmarks estándar (MMLU, XNLI, HumanEval, GSM8K) en la información disponible. La cifra del 100 % procede de un benchmark interno del propio autor y debe interpretarse con cautela.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- Memoria RAM estimada: en torno a 200-400 MB para el runtime ONNX con el paquete de ~134 MB y buffers intermedios.
- GPU recomendadas: no aplica; cualquier GPU con soporte ONNX Runtime serviría, pero no es el objetivo del artefacto.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos; no necesita GPU dedicada.
- Opciones de despliegue: ONNX Runtime (ruta completa), SDK y CLI de MicroLLM (ruta de proyección lineal INT8), y contenedores ligeros para microservicios.
- Latencia y throughput: objetivo declarado inferior a 18 ms en CPU para la ruta ONNX y sub-milisegundo para la proyección lineal; no se publican cifras de throughput (peticiones por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jmrenouard/microllm-multilingual-mdeberta-int8 | no disponible (base mDeBERTa-v3-base) | 512 | en, fr, es, pt, de | Apache 2.0 | ONNX + NPZ INT8 | Cuantizado INT8, doble ruta de inferencia, orientado a CPU |
| MoritzLaurer/mDeBERTa-v3-base-mnli-xnli | ~278 M (base) | 512 | multilingüe (100+ idiomas) | MIT | safetensors / PyTorch | Modelo upstream sin cuantizar; mayor precisión potencial y más pesado |
| joeddav/xlm-roberta-large-xnli | ~560 M | 512 | multilingüe | MIT | PyTorch | Alternativa zero-shot multilingüe más grande y costosa en CPU |
| typeform/distilbert-base-uncased-mnli | ~67 M | 512 | en | Apache 2.0 | PyTorch | Mucho más pequeño pero solo inglés |

La comparativa se basa en características públicas de los modelos citados; no se dispone de resultados de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Ventana máxima de 512 tokens: cualquier texto más largo se trunca, lo que puede perder información relevante en documentos extensos.
- No es un modelo generativo: no produce respuestas, no razona multi-paso y no soporta tool calling.
- El 100 % de precisión reportado proviene de un benchmark interno del autor sobre dominios de soporte al cliente; no garantiza un rendimiento equivalente en otros dominios.
- Deriva idiomática: expresiones coloquiales o jerga fuera de los vocabularios estándar de EN/FR/ES/PT/DE pueden degradar la confianza de clasificación.
- Riesgo de calibración: la cuantización INT8 puede alterar las probabilidades; el autor recomienda escalar automáticamente las entradas con confianza inferior a 0,85 en decisiones críticas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream (MIT) y de los datos de entrenamiento heredados.
- El modelo tiene 17 descargas y 0 likes en el momento de la consulta; la validación comunitaria es prácticamente nula.
- La fecha de creación indicada (2026-10-30) y el año de la cita bibliográfica (2026) deben tratarse con cautela como metadatos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/jmrenouard/microllm-multilingual-mdeberta-int8
- Modelo upstream: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli
- Repositorio de MicroLLM: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
