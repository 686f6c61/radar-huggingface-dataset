# KerzgrAI/Rondo-Exp

## Resumen

Rondo-Exp es un modelo de lenguaje de 352 millones de parámetros desarrollado por KerzgrAI que emplea un objetivo de difusión enmascarada (masked diffusion) en lugar de la predicción autorregresiva del siguiente token. Se publica como prueba de concepto y «base model» sin ajuste por instrucciones, entrenado en paralelo con su gemelo autorregresivo Monody-Exp para comparar cómo cada objetivo explota los mismos datos a lo largo de pasadas repetidas.

La arquitectura combina 12 capas bidireccionales de Gated DeltaNet-2 (GDN-2) con 4 capas de atención bidireccional, sobre ventanas de 2.048 tokens. Ambos modelos vieron los mismos 88 millones de tokens de FineWeb-Edu repetidos 7 veces (617 millones de tokens en total) con idénticos hiperparámetros de optimizador; los pesos publicados son los EMA tras la séptima pasada.

Su interés es fundamentalmente metodológico: comparar pérdida de retención, brecha entre entrenamiento y validación y precisión zero-shot entre un objetivo de difusión y uno autorregresivo con el mismo presupuesto de cómputo. No es un modelo para producción: no sigue instrucciones, solo continúa texto y únicamente maneja inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con objetivo de difusión enmascarada: 12 capas GDN-2 (Gated DeltaNet-2) bidireccionales + 4 capas de atención bidireccional |
| Parametros totales | 352.271.040 (≈352 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en precisión de entrenamiento (repo de 0,7 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

Rondo-Exp es un modelo de difusión de lenguaje enmascarada: en lugar de generar token a token de izquierda a derecha, corrompe la secuencia con máscaras y aprende a reconstruirla, lo que permite revelar varios tokens por forward. El apilamiento alterna 12 capas GDN-2 (una familia de mezcladores de tokens con estado recurrente y compuertas derivada de DeltaNet, optimizada para kernels lineales) con 4 capas de atención completa; todas operan de forma bidireccional, coherente con el objetivo de denoising no causal.

El entrenamiento usó 88 millones de tokens de HuggingFaceFW/fineweb-edu repetidos 7 veces (617 millones de tokens procesados) en ventanas de 2.048 tokens, con ajustes de optimizador idénticos a los de Monody-Exp para que la comparación fuera limpia. Los pesos publicados son los promedios EMA tras la séptima pasada. La pérdida de validación se reporta como cota superior ELBO (≤3,810) sobre 101 millones de tokens no vistos, por lo que no es directamente comparable con la NLL exacta de un modelo autorregresivo. La brecha validación-entrenamiento es de solo 0,13, frente a 1,59 en el gemelo autorregresivo, un resultado que el autor atribuye al efecto regularizador del objetivo de difusión sobre datos repetidos.

## Capacidades

- Generación de texto por continuación de prompt (completado de texto), no por instrucciones.
- Relleno y reconstrucción de tramos enmascarados dentro de una secuencia, gracias al objetivo de difusión.
- Revelado paralelo de varios tokens por forward, controlable con el parámetro `--drafts` del script de inferencia.
- Muestreo configurable: temperatura (0 = greedy), top-p, top-k y semilla.
- Capacidades multilingües: solo inglés.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo «thinking», visión o audio: no disponible.

## Casos de uso

- Investigación sobre objetivos de entrenamiento: replicar la comparación difusión frente a autorregresivo con el mismo dataset y presupuesto, usando Rondo-Exp y Monody-Exp como pareja controlada.
- Estudio de retención y sobreajuste con datos repetidos: la brecha validación-entrenamiento de 0,13 frente a 1,59 documentada en la model card sirve como punto de partida para analizar cómo afecta el objetivo a la memorización en 7 pasadas sobre 88 M de tokens.
- Experimentos de decodificación paralela: medir el compromiso entre número de tokens revelados por forward (`--drafts`) y calidad del texto, útil para investigar latencia en modelos de difusión de lenguaje.
- Benchmarking de mezcladores de estado recurrente: probar el comportamiento de las capas GDN-2 bidireccionales frente a atención completa en tareas de comprensión de secuencia corta (hasta 2.048 tokens).
- Aprendizaje y docencia: ejemplo reproducible y de pequeño tamaño de un diffusion-LM funcional, con script de inferencia y requisitos incluidos en el repo.
- Base para fine-tuning de investigación: al ser un base model Apache 2.0 de 352 M, se puede adaptar a tareas concretas de continuación de texto en inglés, aunque la licencia no exime de validar la calidad del resultado.
- Generación de texto exploratoria sin requisitos de instrucción: completados de párrafos, títulos o descripciones a partir de un prefijo corto, siempre en inglés y con expectativas de calidad bajas.

## Benchmarks y rendimiento

Los únicos resultados publicados son la pérdida de validación y la media de precisión zero-shot en 6 tareas (1.000 ejemplos por tarea). No se han publicado los resultados desglosados por tarea.

| Metrica | Rondo-Exp | Monody-Exp (gemelo autorregresivo) |
|---|---|---|
| Pérdida en held-out (101 M tokens no vistos) | ≤ 3,810 (cota ELBO) | 3,632 (NLL exacta) |
| Pérdida held-out menos pérdida de entrenamiento | 0,13 | 1,59 |
| Precisión zero-shot, media de 6 tareas | 44,8 % | 45,6 % |

Tareas evaluadas: LAMBADA, ARC-Easy, PIQA, SciQ, HellaSwag y WinoGrande. Resultados por tarea: no disponibles en la información proporcionada. Nota del autor: la pérdida de Rondo es una cota superior de su NLL, por lo que no es comparable directamente con la de Monody.

## Requisitos de hardware

- Inferencia en fp32: ≈1,4 GB de pesos; en bf16: ≈0,7 GB (tamaño del repo: 0,7 GB).
- VRAM estimada: menos de 2 GB para los pesos en bf16 más activaciones de una ventana de 2.048 tokens; cualquier GPU consumer con 4 GB o más es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090).
- GPU de datacenter (A100, H100) no necesarias; el modelo cabe holgadamente en cualquier acelerador moderno.
- Entorno requerido: Linux con GPU NVIDIA. El script instala `flash-linear-attention` si no está presente, dependencia necesaria para los kernels de GDN-2.
- Despliegue: únicamente mediante `inference.py` del repositorio. No hay soporte publicado en vLLM, TGI, llama.cpp ni Ollama, y la arquitectura personalizada (GDN-2 bidireccional + difusión) hace improbable que estos motores la carguen sin trabajo de portabilidad.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por token generado disminuye al aumentar `--drafts`, ya que se revelan y verifican varios tokens por forward, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rondo-Exp | 352 M | 2.048 | Difusión enmascarada | Apache 2.0 | HuggingFace (0 descargas al publicar) |
| Monody-Exp | ≈352 M (mismo entrenamiento) | 2.048 | Siguiente token | no indicada en esta fuente | HuggingFace |
| SmolLM2-360M (referencia externa) | ≈362 M | 8.192 | Siguiente token, instruct | Apache 2.0 | HuggingFace |
| Pythia-410M (referencia externa) | ≈410 M | 2.048 | Siguiente token, base | Apache 2.0 | HuggingFace |

Los datos de SmolLM2-360M y Pythia-410M provienen de conocimiento público general y no de la información proporcionada en esta ficha; sus resultados de benchmarks no se incluyen aquí. La comparación relevante para Rondo-Exp es Monody-Exp, que comparte datos, presupuesto y ajustes de optimizador: la diferencia de 0,8 puntos en la media zero-shot (44,8 % frente a 45,6 %) y la menor brecha de validación (0,13 frente a 1,59) son los dos ejes del experimento.

## Limitaciones y advertencias

- Es un base model sin ajuste por instrucciones: no sigue órdenes, no mantiene formato de chat y no debe usarse como asistente.
- Entrenamiento muy limitado: 88 M de tokens únicos (617 M con repeticiones), varios órdenes de magnitud por debajo de modelos de tamaño similar; la calidad del texto generado será baja.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto máximo de 2.048 tokens; no admite documentos largos ni conversaciones multi-turno extensas.
- La pérdida reportada es una cota ELBO, no una NLL exacta: la comparación numérica con modelos autorregresivos exige cautela.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, coherente con su escala y volumen de datos.
- Sin alineación, RLHF ni filtros de seguridad: puede reproducir sesgos y contenido tóxico presente en FineWeb-Edu.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que el modelo se publica «solo para comparación» y no está pensado para uso real; no hay garantías de ningún tipo.
- Dependencia de `flash-linear-attention` y de GPU NVIDIA: la inferencia en CPU o en otros aceleradores no está soportada por el script publicado.
- No hay pesos cuantizados (GGUF, AWQ, GPTQ) publicados; cualquier cuantización requeriría conversión propia y verificar el soporte de los kernels de GDN-2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KerzgrAI/Rondo-Exp
- Gemelo autorregresivo Monody-Exp: https://huggingface.co/KerzgrAI/Monody-Exp
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Librería flash-linear-attention (dependencia de inferencia, referenciada en la model card): https://github.com/fla-org/flash-linear-attention
