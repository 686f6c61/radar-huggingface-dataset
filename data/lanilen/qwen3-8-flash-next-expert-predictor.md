# Lanilen/Qwen3.8-Flash-Next-Expert-Predictor

## Resumen

Qwen3.8-Flash-Next-Expert-Predictor no es un modelo de lenguaje, sino un componente auxiliar de inferencia desarrollado por el usuario Lanilen para el modelo Qwen/Qwen3.8-Flash-Next. Se trata de un predictor de enrutamiento de expertos diseñado específicamente para el fork de llama.cpp denominado Polaris, que implementa una caché de expertos en VRAM con respaldo en RAM del sistema. Su función es anticipar qué expertos de la mezcla (MoE) serán seleccionados por los próximos tokens, de modo que el motor pueda precargar en la GPU los expertos más probables y reducir los accesos a CPU.

El archivo pesa 36 MB (predictor principal) y está almacenado en formato GGUF con extensión `.moepred` para evitar que herramientas genéricas intenten ejecutarlo como modelo. El modelo objetivo, Qwen3.8-Flash-Next, emplea una arquitectura con 48 capas y 512 expertos enrutados, de los cuales se activan 10 por token. El predictor se ejecuta cada 16 tokens generados y al inicio de cada respuesta, y produce estimaciones de frecuencia de uso por capa y experto para horizontes de 128 y 512 tokens.

La relevancia de esta pieza radica en que permite ejecutar modelos MoE de gran tamaño en hardware con VRAM limitada, como una AMD Radeon AI PRO R9700 de 32 GB, manteniendo parte de los expertos en RAM y cacheando dinámicamente los más probables en GPU. Sin este predictor, la caché solo puede ordenar expertos por frecuencia histórica reciente, lo que resulta menos eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas (5133 → 512 → 128, GELU) con cabezas de bajo rango por horizonte |
| Parametros totales | no disponible (peso del archivo: 36 MB en float32 para el predictor principal; 31 MB para el predictor de inicio) |
| Parametros activos | no aplica (no es un modelo MoE, es un predictor auxiliar) |
| Longitud de contexto | no aplica (opera sobre estados ocultos y mapas de conteo, no sobre texto) |
| Tipos de cuantizacion | no disponible (los archivos se distribuyen en float32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural directamente) |
| Licencia | MIT |
| Formato de pesos | GGUF con extensión `.moepred` (arquitectura `moe-predictor`, versión 1) |

## Arquitectura y entrenamiento

El predictor es una red MLP de dos capas con activación GELU que transforma una entrada de 5133 dimensiones en una representación de 128 dimensiones, seguida de una cabeza de bajo rango por cada horizonte de predicción. La entrada combina el estado oculto del modelo objetivo en el token más reciente (media de los flujos de hiperconexión que entran en las capas 16 y 32, 2 × 2560 floats), nueve mapas de conteo de selecciones previas con distintos decaimientos (vidas medias de 64 y 512 tokens, conversación completa, prompt del turno actual, respuesta anterior, respuesta en curso con vidas medias de 32 y 8, y un prior fijo) y la posición dentro de la respuesta (13 buckets de 0 a 1024 tokens). La salida es un softmax sobre los 512 expertos de cada capa, produciendo una predicción de frecuencia de selección para los próximos 128 y 512 tokens.

El entrenamiento se realizó sobre el enrutamiento real del modelo Qwen3.8-Flash-Next en su cuantización `UD-Q4_K_XL` de Unsloth, con verificación sobre `UD-Q6_K_XL`. Los scripts de entrenamiento están disponibles en el repositorio del fork (`tools/moe-predictor`), lo que permite reentrenar el predictor para otros modelos o cuantizaciones. Una predicción tarda aproximadamente 2 ms en un núcleo de CPU. El predictor se ejecuta por defecto con 4 hilos en CPU, configurable mediante `LLAMA_MOE_PREDICTOR_THREADS` o `--moe-cache-predictor-device`.

## Capacidades

- Predicción de enrutamiento de expertos: estima qué expertos de las 48 capas serán seleccionados por los próximos 128 y 512 tokens, con una latencia de aproximadamente 2 ms por predicción en un núcleo de CPU.
- Integración con caché de expertos en VRAM: permite al fork Polaris de llama.cpp priorizar la carga de expertos en la GPU según la predicción, reduciendo los accesos a CPU.
- Ejecución periódica: se activa cada 16 tokens generados y al inicio de cada respuesta, con un límite configurable de tokens de respuesta (`--moe-cache-predictor-answer-cap`).
- Predictor de inicio opcional: `flashnext-start-v3.moepred` predice a partir del texto del turno antes de ejecutar el prompt, permitiendo solapar cargas con el procesamiento del prompt (aunque el autor reporta que resultó más lento en la R9700).
- Verificación de integridad: incluye vectores de prueba (`checks/pred-v3.vec`, `checks/start-v3.vec`) para validar que el archivo carga y computa correctamente mediante `llama-moe-predictor-check`.
- No genera texto, no soporta tool calling, no razona, no procesa visión ni audio, y no puede ser ajustado ni fusionado con otros modelos.

## Casos de uso

- Ejecución de Qwen3.8-Flash-Next en GPU con VRAM limitada: el predictor permite mantener los expertos menos usados en RAM y cachear dinámicamente en VRAM los más probables, haciendo viable el modelo en tarjetas de 32 GB como la AMD Radeon AI PRO R9700.
- Reducción de latencia en inferencia MoE con offloading: al anticipar qué expertos se necesitarán, la caché puede precargarlos antes de que el token los requiera, disminuyendo las penalizaciones por acceso a CPU.
- Despliegue en estaciones de trabajo con un solo usuario: el setup documentado asume una conversación a la vez (`-np 1`), adecuado para entornos de desarrollo o investigación individual.
- Investigación sobre enrutamiento en modelos MoE: los scripts de entrenamiento y las métricas publicadas permiten estudiar patrones de selección de expertos y entrenar predictores para otras arquitecturas.
- Optimización de pipelines de generación larga: con horizontes de predicción de 512 tokens y un cap de respuesta configurable, el predictor es útil en tareas de generación extensa donde la caché puede amortizar sus actualizaciones.
- Validación de integración en el fork Polaris: los vectores de prueba permiten verificar que el entorno de ejecución carga y computa el predictor correctamente antes de desplegarlo en producción.
- Reentrenamiento para otras cuantizaciones: el mismo archivo funciona con `UD-Q6_K_XL` ajustando `--moe-cache-budget 20 --moe-cache-predictor-answer-cap 125`, y los scripts permiten generar predictores para otros modelos.

## Benchmarks y rendimiento

La model card menciona resultados offline sobre conversaciones retenidas (cada quinta conversación de cada fuente, 6.828 respuestas) y una métrica de hit rate, pero el texto proporcionado se interrumpe antes de incluir los valores numéricos. No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el predictor: despreciable (36 MB en float32 para el predictor principal; 31 MB para el de inicio).
- VRAM estimada para el modelo objetivo: el setup documentado usa `--moe-cache-mib 20900` (aproximadamente 20,4 GB de caché de expertos en VRAM) sobre una GPU de 32 GB.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB) es la plataforma de referencia documentada; no se proporcionan datos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no disponible (el setup de referencia emplea una GPU profesional de 32 GB; no se documentan configuraciones con GPUs de consumo).
- Opciones de despliegue: exclusivamente el fork Polaris de llama.cpp (rama `polaris`), mediante `llama-server` con las flags `--moe-cache-mode hot-spare`, `--moe-cache-predictor`, entre otras. No funciona con llama.cpp upstream, Ollama, LM Studio ni otros motores.
- Latencia del predictor: aproximadamente 2 ms por predicción en un núcleo de CPU, con 4 hilos por defecto.
- Throughput del modelo objetivo: no disponible.
- Almacenamiento: el modelo objetivo se distribuye en 4 archivos GGUF (`-00001-of-00004.gguf`), y se recomienda `--load-mode mmap+mlock`.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada predictores de enrutamiento de expertos comparables para arquitecturas MoE en llama.cpp.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no puede ejecutarse de forma autónoma, no admite chat, no puede fusionarse ni ajustarse.
- Compatibilidad restringida: solo funciona con el fork Polaris de llama.cpp (rama `polaris`) en modo hot spare; no funciona con llama.cpp upstream, Ollama, LM Studio ni otros motores.
- Especificidad total al modelo: solo funciona con Qwen3.8-Flash-Next; no es compatible con otros modelos, incluidos otros MoE de Qwen.
- Dependencia de cuantización: entrenado sobre `UD-Q4_K_XL` y verificado sobre `UD-Q6_K_XL`; otras cuantizaciones requieren reentrenamiento o ajuste de parámetros.
- Asunción de una sola conversación: el setup documentado usa `-np 1`, por lo que no está validado para cargas concurrentes.
- Predictor de inicio más lento: el autor reporta que `flashnext-start-v3.moepred` midió más lento en la R9700, por lo que recomienda omitirlo salvo que se mida una ganancia.
- Licencia MIT: permite uso comercial, pero el modelo objetivo Qwen3.8-Flash-Next tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgos ni alucinación: al no generar texto, no aplican sesgos lingüísticos, pero la precisión de la predicción afecta al rendimiento del sistema y no se han publicado métricas completas de hit rate en la información disponible.
- Repositorio sin descargas ni likes: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Lanilen/Qwen3.8-Flash-Next-Expert-Predictor
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización GGUF de referencia: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Fork Polaris de llama.cpp: https://github.com/Lanilen/llama.cpp
- Documentación de la caché hot spare: https://github.com/Lanilen/llama.cpp/blob/polaris/docs/moe-hot-spare.md
- Documentación del predictor (entrenamiento y resultados): https://github.com/Lanilen/llama.cpp/blob/polaris/docs/moe-predictor.md
- Scripts de entrenamiento: https://github.com/Lanilen/llama.cpp/tree/polaris/tools/moe-predictor
- Implementación del formato: https://github.com/Lanilen/llama.cpp/blob/polaris/src/llama-moe-predictor.cpp
- Configuraciones de referencia: https://github.com/Lanilen/llama.cpp/blob/polaris/FORK.md#setups
