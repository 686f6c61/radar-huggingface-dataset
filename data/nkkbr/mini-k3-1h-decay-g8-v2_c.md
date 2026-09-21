# nkkbr/Mini-K3-1H-decay-g8-v2_C

## Resumen

Mini-K3-1H-decay-g8-v2_C es un checkpoint de investigación publicado por el usuario nkkbr dentro de una comparación controlada de 20 arquitecturas derivadas de Kimi-K3. Se trata de un modelo de lenguaje causal de aproximadamente 1.015 millones de parámetros totales y 351,9 millones de parámetros activos por token, con 13 capas de decodificador que combinan atención lineal KDA (Kimi Delta Attention) y Gated MLA (Multi-head Latent Attention), más una capa MoE enrutada con 64 expertos enrutados, 2 expertos compartidos y top-k igual a 4. La variante concreta de este repositorio se distingue por usar 8 grupos de decaimiento contiguos por cabeza en KDA y modo posicional NoPE en las capas MLA.

El detalle crítico es que este repositorio contiene el checkpoint de inicialización, etiquetado `checkpoint-tokens-000000000000-init`, con 0 objetivos de next-token consumidos y 0 pasos de optimizador completados. Es decir, los pesos corresponden al estado inicial del entrenamiento, no a un modelo entrenado. El autor indica que esta ejecución se reinició desde cero tras un fallo en el arranque original, provocado por una discrepancia en el layout portable de serialización de `dt_bias`; el cambio de recuperación afecta únicamente a la serialización, manteniendo el orden de datos congelado, la semilla, la arquitectura y la receta de optimizador originales.

Su relevancia es por tanto metodológica y no funcional: sirve para reproducir y auditar comparaciones de arquitecturas híbridas (atención lineal más atención latente, con MoE) bajo inicialización canónica determinista, con hashes de manifiesto y semilla base `20260914`. No es un asistente, no ha recibido post-entrenamiento y no se ha evaluado en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer híbrido: 9 capas KDA (atención lineal con convolución causal depthwise) + 4 capas Gated MLA con NoPE y output gate; MoE enrutado (Stable LatentMoE) con SiTU y Quantile Balancing |
| Parametros totales | 1.015.108.684 |
| Parametros activos | 351.884.364 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con código PyTorch independiente: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `config.json` |

Datos adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas de decodificador | 13 (9 KDA + 4 Gated MLA) |
| Índices de capas KDA | 1, 2, 3, 5, 6, 7, 9, 10, 11 |
| Índices de capas Gated MLA | 4, 8, 12, 13 |
| Ancho oculto / cabezas de atención / ancho de cabeza KDA | 1024 / 12 / 128 |
| Kernel de convolución causal depthwise en KDA | 4 |
| Grupos de decaimiento por cabeza (KDA) | 8 (contiguos) |
| Modo posicional MLA | NoPE |
| Capas densas antes de MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Ancho oculto de experto enrutado | 512 |
| Tamano de bloque de Attention Residual | 4 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Precisión de parámetros | BF16; estado de decaimiento KDA, convolución, normalización y control del router en FP32 |
| Estado del optimizador | no publicado |

## Arquitectura y entrenamiento

La arquitectura es un decodificador causal de 13 capas que alterna dos operadores de atención. Nueve capas emplean KDA, una atención lineal con estado recurrente y convolución causal depthwise de kernel 4, configurada aquí con 8 grupos de decaimiento contiguos por cabeza (la variante "decay-g8" del nombre). Las cuatro capas restantes usan Gated MLA, atención latente multi-cabeza con modo posicional NoPE y puerta de salida activada. Sobre esta columna vertebral se aplica Stable LatentMoE tras una única capa densa: 64 expertos enrutados y 2 compartidos, con top-k 4 y ancho oculto de experto de 512. El modelo incorpora además bloques de Attention Residuals de tamano 4, activaciones SiTU, output gates y Quantile Balancing.

La receta de entrenamiento prevista (según el autor, no ejecutada en este checkpoint) usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0.1, QK-Clip por cabeza, decaimiento coseno, 1% de warmup lineal y Quantile Balancing en línea con histograma de 1000 bins. El router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. No se aplicó post-entrenamiento de ningún tipo (ni RLHF, ni DPO, ni SFT). El entrenamiento está planificado hasta 16.000 millones de objetivos de pérdida válidos, con la etiqueta final `checkpoint-tokens-016000000000-final`, que solo se crea tras procesar exactamente esa cantidad. La comparabilidad entre las 20 variantes se garantiza mediante inicialización canónica por nombre y forma con semilla base `20260914`, mixtura de datos append-only idéntica y aislamiento duro de documentos: máscara causal bloqueada por documento en MLA y reinicio del estado recurrente KDA y del historial de convolución corta Q/K/V en cada frontera de segmento.

## Capacidades

- Generación de texto causal: la arquitectura es un decodificador autoregresivo con vocabulario de 163.840 entradas, pero al estar en el paso 0 de entrenamiento los pesos son de inicialización y la salida no es texto coherente.
- Razonamiento, código, matemáticas y visión: no disponibles. No hay entrenamiento ni evaluación que respalden estas capacidades.
- Tool calling / function calling: no soportado. No existe post-entrenamiento ni formato de herramientas definido.
- Soporte de agentes y razonamiento multi-paso: no soportado. El autor indica explícitamente que no debe tratarse como un asistente que sigue instrucciones.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la ficha del repositorio.
- Capacidad especial de "thinking mode": no disponible.
- Capacidad estructural relevante: contexto de entrenamiento de 8.192 tokens con estado recurrente en KDA, lo que en teoría permite coste de memoria constante en atención lineal, pero sin validación empírica en este checkpoint.
- Capacidad de evaluación arquitectónica: sirve como referencia reproducible para medir y comparar variantes de la familia Mini-K3 bajo inicialización determinista compartida.

## Casos de uso

- Auditoría de inicialización reproducible: cargar `model.safetensors` con `modeling_mini_k3.py` y verificar que los tensores compartidos entre variantes son byte-idénticos respecto a otras ejecuciones de la comparación, usando la semilla base `20260914` y los hashes de manifiesto.
- Validación de pipelines de serialización portable: este repositorio existe precisamente por un fallo de layout en `dt_bias`; se puede usar para probar que el formato portable de checkpoint sobrevive a un ciclo de guardado y recarga sin alterar el comportamiento del modelo.
- Pruebas de humo de código de modelado: el repositorio incluye `initialize_model.py` y `smoke_test.py`, pensados para comprobar que la definición standalone de la arquitectura carga sin depender del checkout de entrenamiento original.
- Benchmarking de coste de atención lineal frente a atención latente: comparar latencia, memoria y throughput de las 9 capas KDA y las 4 capas Gated MLA en una misma pasada, útil para decidir ratios de mezcla en arquitecturas híbridas de mayor escala.
- Estudio de enrutado MoE: con 64 expertos enrutados, top-k 4 y Quantile Balancing, el checkpoint permite instrumentar la distribución de carga de expertos, el sesgo del router y la estabilidad de las puntuaciones sigmoideas renormalizadas desde el primer paso.
- Ajuste de recetas de optimizador a escala ~1B: reproducir la combinación de Muon por cabeza, Muon general, AdamW de respaldo, QK-Clip y decaimiento coseno con 1% de warmup para medir estabilidad antes de escalar a Kimi-K3 completo.
- Extrapolación de rankings arquitectónicos: dado que las 20 variantes comparten datos, orden y semilla, este checkpoint proporciona la línea base contra la que medir diferencias de NLL y perplejidad a lo largo de los 16.000 millones de tokens previstos, con la advertencia del propio autor de que los rankings a esta escala y con 8K de longitud de entrenamiento requieren confirmación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica literalmente que es un checkpoint intermedio de investigación en preentrenamiento, que "no ha sido evaluado todavía en tareas downstream", y que la NLL y la perplejidad de desarrollo fijo durante el entrenamiento se registran en W&B y en las métricas JSONL de la ejecución. Al tratarse del checkpoint de inicialización con 0 tokens consumidos, no existe ninguna métrica de calidad que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 2,03 GB (1.015.108.684 parámetros), lo que coincide con el tamano de repositorio indicado de 2,0 GB. Hay que anadir el estado de control en FP32 (decaimiento KDA, convolución, normalización y router) y la caché de activaciones; en la práctica, entre 3 y 4 GB de VRAM para una pasada en BF16.
- GPU recomendadas: cualquier GPU con 8 GB o más. Para desarrollo cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090. Para servir en producción con batch alto, A100 40/80 GB, H100 o L40S ofrecen margen sobrado.
- Cabe en GPU de consumo: sí, con holgura, incluso en tarjetas de 6-8 GB si se reduce el batch. Los parámetros activos por token (351,9 millones) mantienen el coste por token muy por debajo del total.
- Opciones de despliegue: el repositorio distribuye código PyTorch propio (`modeling_mini_k3.py`), por lo que la ruta soportada es transformers/PyTorch con `trust_remote_code`. No hay pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión no publicada. vLLM y TGI no están verificados para esta arquitectura híbrida KDA/MLA y necesitarían implementación específica.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de hardware ni de velocidad para este checkpoint, y el autor remite a los manifiestos JSON del experimento para la elección de benchmark de hardware.

## Comparativa con modelos similares

La comparación directa no es posible en términos de calidad porque el modelo no está entrenado. A continuación se contrastan únicamente las características estructurales conocidas con alternativas abiertas de tamano comparable, marcando como no disponible todo dato no confirmado en la información proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|---|
| nkkbr/Mini-K3-1H-decay-g8-v2_C | 1.015.108.684 | 351.884.364 | 8.192 (entrenamiento) | Híbrida KDA + Gated MLA con MoE | no disponible | Solo inicialización, sin entrenar |
| Llama 3.2 1B | ~1.240 millones | no aplica (denso) | 128.000 tokens | Transformer denso | Licencia comunitaria Llama 3.2 | Entrenado e instruido |
| Qwen2.5-1.5B | ~1.540 millones | no aplica (denso) | 32.768 tokens | Transformer denso | Apache 2.0 (según variante) | Entrenado e instruido |
| SmolLM2-1.7B | ~1.710 millones | no aplica (denso) | 8.192 tokens | Transformer denso | Apache 2.0 | Entrenado e instruido |

Comparativa de rendimiento en benchmarks: no disponible para el modelo Mini-K3; los valores de los modelos alternativos no se incluyen aquí porque no forman parte de la información proporcionada. La diferencia funcional principal no es de rendimiento sino de estado: las alternativas son modelos entrenados y alineados, mientras que este repositorio publica exclusivamente un punto de partida de inicialización.

## Limitaciones y advertencias

- Los pesos son de inicialización, con 0 tokens válidos consumidos y 0 pasos de optimizador. Cualquier inferencia producirá salida degenerada o cercana al ruido; no debe interpretarse como capacidad del modelo.
- Sesgos conocidos: no disponibles. No hay evaluación de sesgo y el modelo no ha visto datos de entrenamiento en este checkpoint.
- Riesgo de alucinación: no aplicable en sentido estricto por falta de entrenamiento, pero el autor advierte que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- No es un asistente que sigue instrucciones: no hubo SFT, RLHF ni DPO, y no se define plantilla de chat ni tokens especiales de rol más allá de BOS, EOS de generación y PAD.
- Limitaciones de contexto: la longitud de entrenamiento es de 8.192 tokens, relativamente corta frente a los 32K-128K de alternativas contemporáneas; no se ha validado comportamiento más allá de esa ventana.
- Limitaciones de idioma: no se declara ningún idioma soportado ni composición lingüística del dataset.
- Restricciones de licencia: la licencia figura como no disponible, por lo que no puede asumirse permiso de uso comercial. Las fuentes de datos conservan sus propias licencias y el repositorio no redistribuye su texto, lo que anade incertidumbre sobre la trazabilidad de los datos.
- Estado del optimizador no publicado: impide reanudar el entrenamiento desde este punto con continuidad exacta.
- Validez de las conclusiones arquitectónicas: el propio autor advierte que los rankings de arquitectura a esta escala y con 8K de longitud de entrenamiento necesitan confirmación antes de extrapolarse a Kimi-K3 completo.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya verificado el código ni la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g8-v2_C
- Archivos de referencia incluidos en el repositorio (según la model card): `modeling_mini_k3.py`, `configuration_mini_k3.py`, `config.json`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `initialize_model.py`, `smoke_test.py`, manifiestos JSON con revisiones de fuentes, cuotas de tokens y hashes de esquema
- Etiquetas Git relevantes: `checkpoint-tokens-000000000000-init` (estado actual) y `checkpoint-tokens-016000000000-final` (objetivo planificado)
- Paper, blog, repositorio de experimentos o demo: no disponible en la información proporcionada
- Los resultados de la búsqueda web no contienen ningún enlace relacionado con este modelo ni con la familia Kimi-K3; las URLs devueltas corresponden a páginas no relacionadas de una universidad y se descartan por irrelevantes.
