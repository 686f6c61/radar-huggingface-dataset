# nkkbr/Mini-K3-1H-llama-mha-block4-v1

## Resumen

Mini-K3-1H-llama-mha-block4-v1 es un checkpoint de investigación publicado por el usuario nkkbr dentro de una familia de modelos de escala reducida ("1H") que reproducen la arquitectura Kimi K3 de Moonshot AI en un entorno de entrenamiento asequible. Se trata del brazo de control de un experimento comparativo de cuatro modelos que cruza dos mecanismos de atención (MHA frente a GQA) con dos mecanismos de residual (Block-4 Attention Residuals frente a la alternativa del estudio). Este control conserva todos los componentes de K3 (Stable LatentMoE, primera capa densa SiTU-GLU, tokenizador y Quantile Balancing en línea) pero sustituye los 13 mezcladores de secuencia por atención Q/K/V/O convencional sin sesgo y RoPE de cabeza completa.

El modelo tiene 979.984.128 parámetros lógicos totales y 316.759.808 parámetros activos por token, una ratio de activación de aproximadamente el 32 %, coherente con un diseño Mixture-of-Experts de 64 expertos enrutados más 2 compartidos y top-k igual a 4. La longitud de secuencia de entrenamiento es de 8.192 tokens. El checkpoint publicado corresponde a la revisión `checkpoint-tokens-000000000000-init`, es decir, la inicialización pura: cero tokens de objetivo de pérdida consumidos y cero pasos de optimizador completados.

Su relevancia es metodológica, no de producto. El repositorio está diseñado para permitir ablaciones arquitectónicas controladas con inicialización determinista por nombre y forma (semilla base 20260914), de modo que los parámetros compartidos entre variantes arrancan byte a byte idénticos. Es, por tanto, una pieza de infraestructura experimental para estudiar el efecto del mecanismo de atención y del residual a pequeña escala, no un modelo utilizable para tareas generativas reales en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (Stable LatentMoE); 13 capas, todas con atención MHA estándar sin sesgo y RoPE de cabeza completa |
| Parametros totales | 979.984.128 (lógicos) |
| Parametros activos | 316.759.808 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); no se documenta extensión en inferencia |
| Tipos de cuantizacion | No disponible (solo se publican pesos en BF16 dentro de `model.safetensors`) |
| Idiomas soportados | No disponible (la model card no especifica composición lingüística del dataset) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`), diseño standalone definido por `modeling_mini_k3.py` y `configuration_mini_k3.py` |

Datos adicionales de configuración: ancho oculto 1.024; 8 cabezas Q, 8 cabezas KV, ancho de cabeza 128; RoPE theta 10.000,0 reiniciado en cada frontera de documento; 1 capa densa antes del bloque MoE; 64 expertos enrutados y 2 compartidos; top-k = 4; ancho oculto del experto enrutado 512. Vocabulario de 163.840 entradas, con BOS 163.584, EOS de generación 163.586 y PAD 163.839. Precisión de parámetros BF16, con estado de normalización y de control del router retenido en FP32.

## Arquitectura y entrenamiento

El modelo sigue el patrón decoder-only de Kimi K3 con las modificaciones propias del experimento. La atención es MHA clásica sin compresión MLA y sin puerta de salida de atención: proyecciones Q/K/V/O sin sesgo y codificación posicional RoPE aplicada a la cabeza completa con theta 10.000,0. El componente distintivo es el residual de atención "Block-4", que define cómo se acumulan las señales residuales a lo largo de las 13 capas. La pila MoE conserva el Stable LatentMoE de K3, con una única capa densa SiTU-GLU antes del primer bloque disperso, y un router que selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas.

El recetario de entrenamiento documentado incluye Per-Head Muon para las matrices Q/K/V (ocho bloques Muon en esta variante MHA), Muon para el resto de parámetros matriciales y AdamW como respaldo para vectores y embeddings, con weight decay 0,1, QK-Clip consciente de GQA por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. Los documentos empaquetados se aíslan de forma estricta mediante atención THD de longitud variable de Transformer Engine. No se aplicó ningún tipo de post-entrenamiento (ni RLHF ni DPO): el checkpoint es estrictamente de preentrenamiento. La inicialización es determinista y con clave nombre-y-forma, y el estado del optimizador se ha omitido deliberadamente de la publicación.

## Capacidades

- Generación de texto autoregresiva a nivel de token: es la única función implementada, dado que el modelo es un checkpoint de preentrenamiento sin ajuste de instrucciones.
- Modelado de lenguaje y estimación de verosimilitud: útil para calcular NLL y perplejidad sobre un corpus de desarrollo fijo.
- Razonamiento multi-paso: no verificado; no se han publicado evaluaciones downstream.
- Generación de código: no verificado.
- Matemáticas: no verificado.
- Tool calling / function calling: no soportado; no hay plantilla de chat ni formato de herramientas documentado.
- Capacidades de agente o multi-step reasoning orquestado: no soportadas.
- Capacidades multilingües: no documentadas; la model card no especifica idiomas.
- Visión, audio o modalidades adicionales: no; el modelo es explícitamente text-only.
- Modo "thinking" o decodificación extendida: no disponible.
- Capacidad instrumental relevante: servir como sujeto de ablación arquitectónica reproducible gracias a la inicialización determinista y a los manifiestos JSON con revisiones de código, cuotas de tokens y hashes de schedule.

## Casos de uso

- Ablación arquitectónica controlada: comparar el efecto de MHA frente a GQA y de Block-4 Attention Residuals frente a la alternativa, aprovechando que los parámetros con el mismo nombre y forma arrancan byte a byte idénticos entre las cuatro ejecuciones. Es el caso de uso principal y el motivo de existir del repositorio.
- Estudio de estabilidad del entrenamiento MoE: analizar el comportamiento del router con Quantile Balancing en línea de 1.000 bins y de Per-Head Muon en las matrices Q/K/V a lo largo de los 16.000 millones de tokens objetivo.
- Validación de recetas de escalado: usar el proxy de ~980 M de parámetros lógicos y ~317 M activos para decidir si una configuración merece extrapolarse a Kimi K3 completo antes de comprometer presupuesto de cómputo.
- Pruebas de infraestructura de entrenamiento: verificar aislamiento de documentos empaquetados con atención THD de longitud variable, reinicio de posiciones RoPE por documento y comportamiento del QK-Clip por cabeza.
- Diagnóstico de inicialización: comprobar que los flujos deterministas por variante producen las diferencias esperadas solo en los parámetros exclusivos o con forma distinta.
- Reproducción de resultados de referencia: el repositorio incluye `initialize_model.py`, `smoke_test.py` y manifiestos JSON con hashes de split de validación, lo que permite reproducir el punto de partida exacto de cada ejecución.
- Docencia o formación en arquitecturas MoE: al ser un modelo pequeño con código autocontenido, sirve para inspeccionar el funcionamiento interno de un router MoE con expertos compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que se trata de un checkpoint intermedio de preentrenamiento que todavía no ha sido evaluado en tareas downstream, y que únicamente se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento en W&B y en el JSONL de métricas de la ejecución. Como el checkpoint publicado corresponde a la inicialización (0 tokens consumidos, 0 pasos de optimizador), no existe ninguna métrica de calidad que reportar.

## Requisitos de hardware

- VRAM para pesos en BF16: aproximadamente 1,96 GB para los 979.984.128 parámetros lógicos (cálculo derivado de 2 bytes por parámetro).
- VRAM para pesos en FP32: aproximadamente 3,92 GB, aunque el checkpoint publicado no ofrece pesos FP32.
- Caché KV estimada: unos 52 KB por token en BF16 (13 capas × 8 cabezas KV × 128 de ancho × 2 tensores × 2 bytes), lo que equivale a unos 426 MB con la ventana completa de 8.192 tokens. Es una estimación derivada, no un dato publicado.
- Huella total estimada en inferencia BF16 a 8 K de contexto: en torno a 2,4 GB, por lo que cabe holgadamente en cualquier GPU de consumo con 8 GB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G, A100 y H100. Cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo sin contexto largo.
- Opciones de despliegue: al usar una arquitectura personalizada definida por `modeling_mini_k3.py`, la vía documentada es PyTorch con `transformers` mediante `trust_remote_code` o carga directa del módulo incluido. No hay soporte declarado en vLLM, TGI, Ollama ni llama.cpp, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponible. Cabe esperar un coste por token bajo dado que solo se activan 316.759.808 parámetros, pero no se han publicado mediciones.
- Requisitos de entrenamiento: la model card menciona un "hardware benchmark choice" documentado en los manifiestos JSON, pero no especifica las GPU empleadas en el repositorio de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Mecanismo de atencion | Post-entrenamiento | Licencia |
|---|---|---|---|---|---|---|
| Mini-K3-1H-llama-mha-block4-v1 (nkkbr) | 979.984.128 | 316.759.808 | 8.192 | MHA sin sesgo, RoPE de cabeza completa, residual Block-4 | No | No disponible |
| Mini-K3-1H (nkkbr) | No disponible en la informacion proporcionada | No disponible | No disponible | Variante de la misma familia | No | No disponible |
| Mini-K3-1H-mamba2-n128-g8-v1 (nkkbr) | No disponible; llm-explorer lo etiqueta como "1b" | No disponible | llm-explorer indica 128K (dato de terceros, no verificado) | Mezclador Mamba2 | No | No disponible |
| Mini-K3 (gavmc) | ~155 M | ~70 M | No disponible | Reproduccion de Kimi K3 en PyTorch, escalada para RTX 3090/4090 | No | No disponible |
| Kimi K3 (Moonshot AI) | No disponible | No disponible | No disponible | Arquitectura de referencia que estos proxies reproducen | Si | No disponible |

La comparación directa con Kimi K3 no es significativa por diferencia de escala: los modelos "Mini-K3" son proxies de investigación de tres a cuatro órdenes de magnitud menores. La comparación relevante es interna a la familia de nkkbr (cuatro ejecuciones con idéntico schedule y semilla base común) y frente al repositorio de gavmc, que persigue el mismo objetivo de reproducción a una escala aún menor.

## Limitaciones y advertencias

- El checkpoint publicado está en estado de inicialización: 0 tokens de objetivo de pérdida consumidos y 0 pasos de optimizador. No ha aprendido nada; sus salidas serán esencialmente aleatorias.
- Es un modelo exclusivamente de preentrenamiento, sin ajuste de instrucciones ni alineación. No debe tratarse como asistente conversacional.
- La model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas. No se ha documentado ninguna mitigación de sesgo.
- Riesgo de alucinación: no evaluable en este estado, pero intrínseco a un modelo de lenguaje sin alineación.
- No se especifica composición lingüística del dataset ni idiomas soportados, por lo que no se puede garantizar cobertura multilingüe.
- Contexto limitado a 8.192 tokens durante el entrenamiento; no se documenta extensión en inferencia ni técnicas de interpolación posicional.
- Licencia no disponible: no se concede explícitamente ningún derecho de uso comercial, modificación o redistribución. Cualquier uso en producción requiere aclaración previa con el autor.
- Los datasets de origen conservan sus propias licencias y términos; el repositorio no redistribuye su texto.
- El estado del optimizador se ha omitido deliberadamente, lo que impide reanudar el entrenamiento desde este checkpoint tal cual.
- Los rankings de arquitectura obtenidos a esta escala y con longitud de entrenamiento de 8 K necesitan confirmación antes de extrapolarse al Kimi K3 completo, según la propia model card.
- El nombre contiene "llama" pero no guarda relación con Meta Llama; es una designación del estilo de atención empleado.
- Sin soporte declarado en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) ni pesos cuantizados, lo que complica el despliegue fuera de PyTorch.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-llama-mha-block4-v1
- Modelo base de la familia: https://huggingface.co/nkkbr/Mini-K3-1H
- Variante Mamba2 (llm-explorer): https://llm-explorer.com/model/nkkbr%2FMini-K3-1H-mamba2-n128-g8-v1_B,2hb2ChRjsgQlK6ZfxKuZZS
- Repositorio de reproducción Mini-K3 en PyTorch: https://github.com/gavmc/Mini-K3
- Leaderboard de modelos autoalojados (referencia de comparativas): https://onyx.app/self-hosted-llm-leaderboard
