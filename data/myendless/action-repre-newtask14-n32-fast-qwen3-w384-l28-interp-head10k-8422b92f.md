# myendless/action-repre-newtask14-n32-fast-qwen3-w384-l28-interp-head10k-8422b92f

## Resumen

FAST es un checkpoint de investigación publicado por el usuario `myendless` en Hugging Face, derivado del modelo visión-lenguaje Qwen3-VL-4B-Instruct. No se trata de un modelo de lenguaje autónomo, sino de un sistema de robótica compuesto por una cadena de representación VLM congelada y una cabeza de acción ("action head") específica para ejecución motora. El checkpoint corresponde a un reentrenamiento de 10.000 pasos sobre 14 tareas nuevas del benchmark RoboTwin, con configuración N32.

La innovación técnica principal es la interpolación de anchura: se parte de un experto de acción basado en Qwen3-0.6B con 28 capas y se reduce su anchura de forma proporcional (hidden 1024→384, FFN 3072→1152, head_dim 128→48), manteniendo 16 cabezas de atención Q y 8 KV. La inicialización se realiza mediante interpolación lineal de parámetros preservando las cabezas de atención y los límites de emparejamiento RoPE. Esta es la versión corregida, distinta de experimentos previos con un DiT layerwise de 36 capas.

El modelo es relevante para la comunidad de robótica e investigación en políticas visomotoras porque documenta un protocolo reproducible de adaptación de un VLM grande a tareas de manipulación con pocos datos por tarea (32 episodios limpios + 320 aleatorizados por tarea, 4.928 episodios en total). Su utilidad es exclusivamente investigadora: no es un repositorio de Transformers estándar y no incluye resultados de tasa de éxito en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL-4B-Instruct congelado + cabeza de acción basada en Qwen3-0.6B con interpolación de anchura (28 capas, hidden 384, FFN 1152, head_dim 48, 16 Q heads / 8 KV heads) |
| Parametros totales | no disponible (repo de 9,9 GB; el VLM base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos nativos en PyTorch, sin GGUF ni safetensors cuantizados) |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo de PyTorch, no re-serializado; no es AutoModel de Transformers) |

## Arquitectura y entrenamiento

El sistema combina dos componentes: una cadena de representación VLM (Qwen3-VL-4B-Instruct) que permanece congelada durante el entrenamiento, y una cabeza de acción entrenable derivada de un experto Qwen3-0.6B. La cabeza conserva las 28 capas de profundidad originales pero se estrecha proporcionalmente: dimensión oculta de 1024 a 384, FFN de 3072 a 1152 y dimensión por cabeza de 128 a 48, manteniendo el número de cabezas Q (16) y KV (8). La inicialización usa interpolación lineal de parámetros que respeta los límites de las cabezas de atención y del emparejamiento RoPE; las capas de adaptación específicas de acción se inicializan con el constructor original (`fresh_constructor`).

El entrenamiento se realizó sobre 14 tareas nuevas de RoboTwin en configuración N32, con 32 episodios limpios y 320 aleatorizados por tarea (4.928 episodios totales), batch global de 128, semilla 42 y joint14/H32. La pérdida final de entrenamiento fue de 0,01629054918885231. En inferencia, la self-attention de acción usa `eager`, la cross-attention usa SDPA en modo `math` (por compatibilidad numérica con head_dim 48 en hardware Hygon) y el VLM usa `flash_attention_2`. El checkpoint incluye configuración, processor, manifiesto de datos, normalización, métricas de entrenamiento, protocolo de congelación y recibo de finalización, pero no imágenes, vídeos, optimizador ni pesos intermedios.

## Capacidades

- Ejecución de políticas visomotoras para manipulación robótica en las 14 tareas de RoboTwin del conjunto de entrenamiento.
- Representación de acciones conjuntas (joint14) con horizonte H32.
- Procesamiento de entrada multimodal imagen + instrucción en chino e inglés a través del VLM base.
- Generalización a tareas nuevas mediante el protocolo de congelación del VLM y entrenamiento exclusivo de la cabeza de acción.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM; su "razonamiento" es la política de acción.
- Sin modo thinking, visión general, audio ni otras capacidades del VLM base expuestas de forma autónoma.

## Casos de uso

- Investigación en políticas visomotoras: reproducir el protocolo de entrenamiento de la cabeza de acción sobre RoboTwin con las semillas y el manifiesto incluidos, para comparar con las variantes layerwise de 36 capas del mismo autor.
- Estudio de interpolación de anchura: analizar cómo afecta reducir hidden de 1024 a 384 y head_dim de 128 a 48 en la calidad de la política, usando este checkpoint como referencia corregida frente al experimento DiT previo.
- Benchmark de generalización a tareas nuevas: evaluar la transferencia del VLM congelado a 14 tareas no vistas durante el preentrenamiento del VLM, con 32 episodios limpios por tarea como referencia de pocos datos.
- Despliegue en hardware con restricciones numéricas: el uso de SDPA `math` en cross-attention y head_dim 48 está pensado para compatibilidad con aceleradores Hygon, útil en entornos con GPUs no NVIDIA.
- Base para fine-tuning posterior: al incluir el state_dict completo con VLM y módulos de acción, sirve como punto de partida para adaptar la cabeza a un nuevo conjunto de tareas manteniendo el protocolo de normalización adjunto.
- Validación de pipelines de robótica: integrar el checkpoint en el código nativo de benchmark incluido en `provenance/training-code-snapshot.tar.gz` para pruebas de extremo a extremo del pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de tasa de éxito en bucle cerrado para estos pesos; solo se reporta la pérdida final de entrenamiento (0,01629054918885231).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repo pesa 9,9 GB en precisión nativa, por lo que se necesita al menos esa cantidad más overhead de activaciones y del VLM de 4B.
- GPU recomendadas: no especificadas por el autor; el uso de `flash_attention_2` en el VLM sugiere GPUs NVIDIA Ampere o superior (A100, H100, RTX 3090/4090).
- Compatibilidad con consumer GPU: probable en GPUs de 24 GB o más si se ejecuta en precisión reducida, aunque no está documentado ni verificado por el autor.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere el código nativo de benchmark incluido en el snapshot de entrenamiento y el processor adjunto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capas | Anchura | Formato | Licencia |
|---|---|---|---|---|---|
| FAST (este checkpoint) | Qwen3-VL-4B-Instruct + Qwen3-0.6B interpolado | 28 | 384 | `model.pt` nativo | no disponible |
| action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k | Qwen3-VL + DiT layerwise | 36 | 384 | PyTorch | apache-2.0 |
| action-repre-newtask14-n32-base-layerwise384-l36-head10k | Qwen3-VL + DiT layerwise | 36 | 384 | PyTorch | apache-2.0 |

Los dos modelos comparables son variantes del mismo autor con arquitectura DiT layerwise de 36 capas, mientras que este checkpoint usa una cabeza Qwen3 interpolada de 28 capas. No hay datos de rendimiento comparativo publicados para ninguno de los tres.

## Limitaciones y advertencias

- No se han publicado tasas de éxito en bucle cerrado; el único dato de rendimiento es la pérdida de entrenamiento, insuficiente para evaluar la calidad real de la política.
- El checkpoint no es un repositorio de Transformers: requiere el código nativo de benchmark y el processor adjuntos, y el mapeo manual de rutas absolutas del autor a rutas locales.
- La normalización debe usar los archivos incluidos; reajustarla invalida los resultados.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- Idiomas limitados a chino e inglés.
- Entrenado exclusivamente sobre 14 tareas de RoboTwin; la generalización fuera de ese dominio no está verificada.
- Riesgo de sobreajuste a las condiciones de recogida de datos (32 episodios limpios + 320 aleatorizados por tarea).
- El uso de SDPA `math` en cross-attention degrada el rendimiento frente a kernels optimizados; es una concesión por compatibilidad numérica, no una elección de rendimiento.
- Sin imágenes, vídeos ni pesos intermedios en el repo, lo que limita la auditoría del proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-fast-qwen3-w384-l28-interp-head10k-8422b92f
- Variante layerwise raw VLM: https://huggingface.co/myendless/action-repre-newtask14-n32-rawvlm-layerwise384-l36-head10k-99cde744
- Variante layerwise base: https://huggingface.co/myendless/action-repre-newtask14-n32-base-layerwise384-l36-head10k-763c91f4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
