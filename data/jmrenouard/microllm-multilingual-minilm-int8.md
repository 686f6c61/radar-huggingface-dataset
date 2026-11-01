# jmrenouard/microllm-multilingual-minilm-int8

## Resumen

MicroLLM Multilingual MiniLMv2 INT8 es un modelo encoder de tipo MiniLM-L6 derivado de `MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli`, publicado por Jean-Marie Renouard (jmrenouard) bajo licencia Apache 2.0. No es un modelo generativo: se trata de un encoder de inferencia de lenguaje natural (NLI) configurado para clasificación zero-shot, pensado para tareas de enrutamiento de tickets, triaje de intenciones y decisiones de guardrail en sistemas de atención al cliente y orquestación de agentes.

Su rasgo diferencial es la cuantización INT8 dinámica (esquema simétrico per-tensor, rango [-127, 127]) empaquetada en ONNX, con un tamaño de paquete de aproximadamente 68,5 MB y una latencia objetivo en CPU inferior a 7,5 ms. El autor declara una ruta de proyección lineal calibrada en INT8 (fichero `model_quantized_int8.npz`) para puntuación de alta throughput por debajo del milisegundo, además de la sesión estándar de ONNX Runtime con el encoder transformer completo.

El modelo soporta cinco idiomas (inglés, francés, español, portugués y alemán) y está diseñado para operar como "System-1" dentro del ecosistema MicroLLM: decisiones rápidas y deterministas que se pueden escalar a un modelo mayor cuando la confianza es baja. Su contexto máximo es de 512 tokens, por lo que no compite con LLMs generativos, sino con clasificadores ligeros de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM-L6 (encoder transformer) para NLI / clasificación zero-shot, exportado a ONNX |
| Parametros totales | no disponible (modelo base MiniLM-L6; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncado por encima) |
| Tipos de cuantizacion | INT8 dinámica, simétrica per-tensor, clipping [-127, 127]; artefactos en INT8 y proyección lineal calibrada |
| Idiomas soportados | en, fr, es, pt, de |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), NPZ (`model_quantized_int8.npz`) |

## Arquitectura y entrenamiento

El modelo es un encoder MiniLM-L6 de 6 capas, derivado del checkpoint multilingüe `MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli`, que a su vez se entrena sobre datos NLI multilingües (MNLI y XNLI). La cabeza de clasificación produce tres logits correspondientes a las etiquetas `entailment` (índice 0), `neutral` (índice 1) y `contradiction` (índice 2); el autor fija explícitamente `entailment_idx = 0` para el mapeo binario de decisión en clasificación zero-shot.

La innovación técnica principal no está en el entrenamiento, sino en el empaquetado para producción: cuantización INT8 dinámica con calibración simétrica per-tensor, exportación a ONNX con esquema de entradas `input_ids` y `attention_mask` (int64) y salida `logits` de forma `[batch_size, sequence_length, 3]` en float32. El autor no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste adicionales sobre el checkpoint base. Se ofrece además una ruta de inferencia alternativa basada en una proyección lineal calibrada en INT8 que evita ejecutar el grafo completo del transformer.

## Capacidades

- Clasificación zero-shot de texto mediante entailment NLI con tres etiquetas fijas (entailment, neutral, contradiction).
- Enrutamiento de tickets e intenciones en atención al cliente (categorías como billing, shipping o tech).
- Decisiones de guardrail y triaje determinista de baja latencia ("System-1") en flujos de agentes.
- Multilingüe en inglés, francés, español, portugués y alemán.
- Integración con el SDK y la CLI de MicroLLM (`create_multilingual_backend`, `route_ticket`, `microllm pull`, `microllm benchmark`).
- Doble mecanismo de inferencia: proyección lineal INT8 de alta throughput y sesión ONNX Runtime de precisión completa.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni visión.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica el mensaje del cliente contra un conjunto de departamentos predefinidos y devuelve la opción seleccionada con una puntuación de confianza, aprovechando su latencia inferior a 7,5 ms en CPU para responder en línea.
- Enrutamiento de intenciones en asistentes conversacionales: dado un turno del usuario, se mapea a una de las intenciones del flujo (facturación, envío, soporte técnico) antes de invocar el LLM generativo, reduciendo coste y latencia del pipeline.
- Guardrails de contenido en agentes: se usa como clasificador binario para decidir si una petición entra o no en una categoría permitida, con escalado automático a un modelo mayor cuando la confianza es inferior a 0,85.
- Moderación y filtrado en microservicios edge: con 68,5 MB de paquete y ejecución ONNX en CPU, se puede desplegar en contenedores ligeros o dispositivos embebidos sin GPU.
- Clasificación multilingüe en atención al cliente europea: cubre consultas en inglés, francés, español, portugués y alemán con el mismo artefacto, evitando mantener cinco modelos separados.
- Pre-filtrado en pipelines RAG o de búsqueda: se usa para decidir si una consulta pertenece a un dominio concreto antes de recuperar documentos, aprovechando la ruta de proyección lineal sub-milisegundo.
- Enrutamiento de peticiones en orquestadores de agentes: selecciona la herramienta o sub-agente adecuado según la intención detectada, con un coste computacional mínimo comparado con un LLM.

## Benchmarks y rendimiento

El autor solo publica una métrica propia: 100,0 % de precisión en el "MicroLLM Multilingual Customer Support Benchmark" para EN, FR, ES y PT. No se han publicado resultados en benchmarks estándar (MMLU, XNLI, etc.) en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| MicroLLM Multilingual Customer Support Benchmark (EN/FR/ES/PT) | 100,0 % | Benchmark propietario del autor, sin detalle de composición ni tamaño |
| XNLI / MNLI | no disponible | El checkpoint base los reporta, pero este artefacto cuantizado no publica métricas propias |
| Latencia CPU | < 7,5 ms | Objetivo declarado por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está pensado para ejecución en CPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte ONNX Runtime podría ejecutarlo, pero no es el objetivo del artefacto.
- Cabe en GPU de consumo: sí, pero el despliegue previsto es CPU (edge, microservicios, contenedores ligeros).
- Tamaño en disco: aproximadamente 68,5 MB.
- Opciones de despliegue: ONNX Runtime (sesión estándar), SDK y CLI de MicroLLM (`microllm pull`, `microllm benchmark`), integración en Python mediante `microllm.multilingual_backend`.
- Latencia y throughput: latencia objetivo inferior a 7,5 ms en CPU; la ruta de proyección lineal INT8 se describe como sub-milisegundo, aunque el autor no publica cifras de throughput medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jmrenouard/microllm-multilingual-minilm-int8 | no disponible (MiniLM-L6) | 512 | en, fr, es, pt, de | Apache 2.0 | ONNX INT8, NPZ | Cuantizado INT8, orientado a triaje y guardrails de baja latencia |
| MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli | no disponible (MiniLM-L6) | 512 | multilingüe (amplio) | no disponible en la información | safetensors / PyTorch | Checkpoint base sin cuantizar; mayor tamaño y latencia en CPU |
| Modelos NLI zero-shot multilingües tipo XLM-R base | cientos de millones | 512 | multilingüe | variable | PyTorch, ONNX | Mayor precisión potencial pero mucho mayor coste computacional |

La comparación se limita a lo indicado: no se dispone de métricas públicas comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Longitud máxima de secuencia de 512 tokens; el texto que la exceda se trunca, lo que puede perder información relevante en tickets largos.
- Deriva idiomática: expresiones coloquiales o jerga fuera del vocabulario estándar de EN/FR/ES/PT/DE pueden producir confidencias degradadas.
- El modelo es un clasificador NLI, no un generador: no produce texto libre ni razonamiento multi-paso.
- La métrica del 100 % procede de un benchmark propietario del autor sin documentación pública de su composición, por lo que no es directamente comparable con benchmarks estándar.
- Riesgo de alucinación bajo en sentido generativo, pero riesgo de clasificación errónea con alta confianza en dominios alejados del entrenamiento NLI.
- Para decisiones críticas de seguridad, el autor recomienda configurar `strategy="auto"` y escalar entradas con confianza inferior a 0,85.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint base `MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli` antes de redistribuir.
- El repositorio tiene 16 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/jmrenouard/microllm-multilingual-minilm-int8
- Modelo base: https://huggingface.co/MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli
- Repositorio MicroLLM (referenciado en la model card): no disponible como URL explícita en la información proporcionada
