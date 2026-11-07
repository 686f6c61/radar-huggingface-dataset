# MatterWaveAI/grt-20m-base

## Resumen

GRT-20M-Base es un checkpoint de investigación publicado por MatterWaveAI: un modelo de lenguaje causal de 16,7 millones de parámetros (10,3 millones sin contar los embeddings) construido sobre una arquitectura denominada Geometric Rotation Transformer (GRT). Su particularidad es que sustituye las proyecciones lineales densas de un transformer estándar por cascadas de rotaciones de Givens aprendidas sobre SO(D), de modo que la ruta residual no contiene ninguna capa `nn.Linear`. El modelo se publica como material suplementario de un envío a NeurIPS y conserva los pesos originales entrenados con el optimizador PairAdam, antes del ajuste curricular con SymplecticAdam y HuygensSymplecticAdam que dio lugar a la variante `MatterWaveAI/grt-20m`.

El modelo se entrenó sobre una mezcla de ocho corpus en inglés (ClimbMix, Wikipedia, RefinedWeb, FineWeb-Edu, Cosmopedia, Nemotron, FineMath y StackExchange) durante 158.000 pasos, con una longitud de contexto máxima de 1.024 tokens y una pérdida de entrenamiento final de 2,114. Su relevancia no es de producto sino metodológica: demuestra que la arquitectura GRT entrena de forma estable a pequeña escala y evalúa de extremo a extremo a través de la misma interfaz de servicio HTTP compatible con OpenAI que el resto de modelos del ecosistema, además de servir como upstream barato y siempre disponible para integración continua en CPU.

Se trata de una vista previa de investigación a escala reducida. Los recuentos de parámetros están medidos directamente del `model.safetensors` publicado y la etiqueta "20m" es una clase de tamaño, no un recuento real. El modelo solo soporta inglés y su calidad generativa es muy limitada, como evidencian las completaciones de referencia incluidas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT), causal LM decoder-only con rotaciones de Givens sobre SO(D) en lugar de proyecciones lineales |
| Parametros totales | 16.730.869 (16,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | float32 publicado; GGUF f32 (`grt-20m-f32.gguf`); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (f32) |
| Parametros sin embeddings | 10.280.869 (10,3 M) |
| d_model | 256 |
| Numero de bloques | 12 |
| Cabezas de atencion | 4 |
| Rotaciones QKV | 11 |
| Rotaciones FFN | 21 |
| Vocabulario | 50.000 (BPE) |
| Precision de entrenamiento | float32 |
| Optimizador | PairAdam |
| Pasos de entrenamiento | 158.000 |
| Perdida de entrenamiento | 2,114 |

## Arquitectura y entrenamiento

GRT es un transformer causal decoder-only en el que las proyecciones lineales densas se reemplazan por cascadas de rotaciones de Givens aprendidas sobre el grupo especial ortogonal SO(D). Cada bloque aplica 11 rotaciones en la ruta QKV y 21 en la FFN, con `d_model` de 256 y 4 cabezas de atención a lo largo de 12 bloques. La consecuencia estructural es que la ruta residual no contiene ninguna capa `nn.Linear`. Los embeddings dominan el recuento de parámetros: 6,45 M de los 16,7 M totales corresponden al embedding de tokens (50.000 tokens por 128 ángulos de fase, más una log-magnitud por token).

El entrenamiento usó una mezcla de ocho corpus en inglés (ClimbMix, Wikipedia, RefinedWeb, FineWeb-Edu, Cosmopedia, Nemotron, FineMath y StackExchange) durante 158.000 pasos con PairAdam, un pico de learning rate de 1e-3 con decaimiento coseno hasta el 10 % y precisión float32. No se documenta en la información disponible el número total de tokens procesados ni si hubo fases de RLHF o DPO. El checkpoint publicado es el estado previo al ajuste curricular con SymplecticAdam y HuygensSymplecticAdam; la implementación se distribuye como paquete pip (`geometric-rotation-transformer`) en lugar de código remoto del Hub, porque la implementación abarca imports absolutos que un snapshot plano del Hub no puede resolver. Los kernels CUDA optimizados son opcionales y se cargan automáticamente si están instalados; el paquete es PyTorch puro y funciona en CPU.

## Capacidades

- Generación de texto causal en inglés, con calidad muy limitada a esta escala (véanse las completaciones de referencia del autor).
- Razonamiento y conocimiento factual elementales: la media macro en 9 tareas de elección múltiple es del 39,16 % zero-shot, frente al 35,56 % del azar.
- Respuesta a preguntas booleanas y de sentido común (BoolQ 62,17 %, PIQA 53,97 %, OpenBookQA 34,20 %).
- Evaluación de perplejidad en matemáticas (GSM8K, 60,12 PPL zero-shot).
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés.
- No dispone de modo thinking, visión ni audio.
- Servido reproducible token a token a través de `transformers` en f32, vLLM y llama.cpp (fork de MatterWave), con interfaz HTTP compatible con OpenAI.

## Casos de uso

- Investigación sobre arquitecturas alternativas: el modelo permite reproducir el entrenamiento y la evaluación de una arquitectura que elimina las proyecciones lineales densas, útil para grupos que estudian parametrizaciones sobre grupos ortogonales o rotaciones aprendidas.
- Integración continua en CPU: al ser PyTorch puro y de 16,7 M de parámetros, sirve como upstream barato y siempre disponible para probar pipelines de servicio, tokenización y serialización sin depender de GPU.
- Validación de la interfaz de servicio compatible con OpenAI: permite verificar de extremo a extremo que la capa HTTP, el enrutado de peticiones y el formato de respuesta funcionan con un modelo real antes de desplegar modelos mayores.
- Pruebas de paridad entre backends: las tres completaciones de referencia se reproducen token a token en `transformers`, vLLM y llama.cpp, lo que lo convierte en un caso de prueba ligero para verificar consistencia numérica entre motores de inferencia.
- Docencia y experimentación con modelos de lenguaje: su tamaño reducido y su licencia Apache 2.0 permiten usarlo en cursos y talleres para ilustrar entrenamiento, evaluación con `lm-evaluation-harness` y análisis de perplejidad sin infraestructura especializada.
- Punto de partida para ajuste fino a pequeña escala: al ser un checkpoint base con licencia permisiva, puede servir como inicialización para experimentos de ajuste con currículos de optimizador (la variante `grt-20m` documenta precisamente ese ajuste con SymplecticAdam).
- Referencia de línea base en benchmarks de modelos pequeños: sus resultados en `grt-slm-bench` sobre 13.144 ejemplos permiten comparar arquitecturas alternativas a la misma escala.

## Benchmarks y rendimiento

Evaluación zero-shot vía `grt-slm-bench` sobre 9 tareas de elección múltiple (13.144 ejemplos retenidos) y perplejidad en GSM8K:

| Tarea | Split (n) | Azar | GRT-20M-Base (zero-shot) | Fine-tune estándar con PairAdam |
|---|---|---:|---:|---:|
| BoolQ | val (3.270) | 50,00 % | 62,17 % | 53,43 % |
| PIQA | val (1.838) | 50,00 % | 53,97 % | 53,37 % |
| WinoGrande | val (1.267) | 50,00 % | 51,93 % | 52,41 % |
| QNLI | val (1.000) | 50,00 % | 50,50 % | 55,70 % |
| OpenBookQA | test (500) | 25,00 % | 34,20 % | 25,60 % |
| HellaSwag | val (1.000) | 25,00 % | 28,70 % | 31,80 % |
| ARC-Easy | test (2.376) | 25,00 % | 26,43 % | 26,85 % |
| ARC-Challenge | test (1.172) | 25,00 % | 25,34 % | 25,43 % |
| CommonsenseQA | val (1.221) | 20,00 % | 19,16 % | 23,10 % |
| Media macro 9 tareas | 13.144 | 35,56 % | 39,16 % | 38,63 % |

| Perplejidad en matemáticas | Split (n) | GRT-20M-Base (zero-shot) | Fine-tune estándar con PairAdam |
|---|---:|---:|---:|
| GSM8K | test (500) | 60,12 PPL | 12,52 PPL |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar de generación en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint en float32 ocupa aproximadamente 67 MB de pesos (16,7 M de parámetros × 4 bytes); el repositorio completo es de 0,1 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con al menos 1 GB de VRAM es suficiente. Los kernels CUDA optimizados son opcionales.
- CPU: el paquete es PyTorch puro y está diseñado explícitamente para ejecutarse en CPU, lo que lo hace apto para integración continua sin acelerador.
- Opciones de despliegue: `transformers` (con el paquete `geometric-rotation-transformer` instalado), vLLM, llama.cpp (fork de MatterWave para el GGUF f32) e interfaz HTTP compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de despliegue: `trust_remote_code=True` no está soportado; es necesario instalar primero `geometric-rotation-transformer` para que `import grt` registre `model_type: "grt"` en las clases Auto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| GRT-20M-Base | 16,7 M (10,3 M sin embeddings) | 1.024 | Apache 2.0 | en | Arquitectura GRT con rotaciones de Givens; checkpoint pre-curriculum |
| MatterWaveAI/grt-20m | no disponible | no disponible | no disponible | no disponible | Variante del mismo modelo tras ajuste curricular con SymplecticAdam y HuygensSymplecticAdam |
| Alternativas de ~20 M parámetros de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks de modelos comparables de la misma clase de tamaño en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Calidad generativa muy baja: las completaciones de referencia del propio autor muestran bucles degenerados (por ejemplo, "the capital of the capital of the capital..."), lo que refleja el régimen de 16,7 M de parámetros y 158.000 pasos.
- Riesgo elevado de alucinación y de incoherencia factual; no es apto para producción en tareas de usuario final.
- Contexto muy limitado: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no hay soporte multilingüe documentado.
- Es un checkpoint base sin ajuste de instrucciones ni alineación documentada (no se reporta RLHF ni DPO), por lo que no sigue instrucciones de forma fiable.
- El rendimiento zero-shot supera al fine-tune estándar en varias tareas (BoolQ, OpenBookQA, PIQA) pero queda por debajo en otras (QNLI, HellaSwag, CommonsenseQA), lo que indica una señal débil y poco estable en la evaluación.
- La licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la calidad del modelo hacen desaconsejable cualquier despliegue productivo.
- Requiere instalar un paquete pip externo (`geometric-rotation-transformer`) y no admite `trust_remote_code=True`, lo que añade fricción de integración frente a modelos estándar de `transformers`.
- El GGUF solo está disponible en f32 y requiere el fork de llama.cpp de MatterWave, no la distribución estándar.
- No se documenta el número total de tokens de entrenamiento ni la composición exacta de la mezcla, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-20m-base
- Variante con ajuste curricular: https://huggingface.co/MatterWaveAI/grt-20m
- Organización en GitHub: https://github.com/MatterWaveAI
- Dataset ClimbMix: https://huggingface.co/datasets/OptimalScale/ClimbMix
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset RefinedWeb: https://huggingface.co/datasets/tiiuae/falcon-refinedweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset Nemotron-Pretraining-Dataset-sample: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Dataset-sample
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
