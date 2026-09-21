# nkkbr/Mini-K3-1H-decay-g64-v2_B

## Resumen

Mini-K3-1H-decay-g64-v2_B es un checkpoint de preentrenamiento de tipo base, solo texto, publicado por el usuario `nkkbr` en HuggingFace. Forma parte de una familia de veinte arquitecturas comparadas de forma controlada, todas derivadas de la arquitectura Kimi-K3 a escala reducida (aproximadamente mil millones de parámetros lógicos). El modelo conserva los operadores KDA y Gated MLA, los bloques de Attention Residuals, el enrutador Stable LatentMoE, las activaciones SiTU, las puertas de salida y el mecanismo Quantile Balancing. Esta variante concreta ("decay-g64") modifica la granularidad del decaimiento de KDA a 64 grupos contiguos por cabeza.

El checkpoint es un modelo MoE con 1.015.888.876 parámetros totales y 352.664.556 parámetros activados por token, distribuidos en 13 capas desacopladas (9 KDA de atención lineal y 4 Gated MLA). Se trata de un modelo de investigación: no ha recibido post-entrenamiento (ni SFT, ni RLHF, ni DPO) y no está diseñado para seguir instrucciones.

Su relevancia es metodológica más que funcional. El autor documenta que las veinte variantes comparten semilla de inicialización (`20260914`), orden de datos inmutable y receta de optimizador, de modo que las diferencias de rendimiento pueden atribuirse al cambio arquitectónico aislado. Además, este run se relanzó desde cero tras un fallo de serialización del `dt_bias`, un detalle de ingeniería relevante para quien reproduzca recetas de MoE con estados en FP32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer híbrido con Mixture-of-Experts y atención lineal: 13 capas (9 KDA + 4 Gated MLA), Attention Residuals con block size 4, Stable LatentMoE, activaciones SiTU, output gates |
| Parámetros totales | 1.015.888.876 |
| Parámetros activos | 352.664.556 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos se distribuyen en BF16 (con decaimiento KDA, convolución, normalización y estado del router en FP32) |
| Idiomas soportados | No disponible (no declarado; vocabulario de 163.840 entradas) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | `safetensors` (`model.safetensors`) con código PyTorch de carga propia (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |

## Arquitectura y entrenamiento

La arquitectura es un decoder de 13 capas que alterna dos tipos de atención: KDA (linear attention con estado recurrente) en los índices `[1, 2, 3, 5, 6, 7, 9, 10, 11]` y Gated MLA en `[4, 8, 12, 13]`. El ancho oculto es 1024, con 12 cabezas y 128 de ancho por cabeza en KDA. La convolución causal depthwise de KDA usa kernel 4 y 64 grupos de decaimiento contiguos por cabeza, que es precisamente la variable ablacionada en esta variante. MLA opera en modo posicional NoPE y lleva puerta de salida. La parte MoE tiene 1 capa densa antes del bloque de expertos, 64 expertos enrutados más 2 compartidos, top-k de 4 y ancho oculto de experto de 512.

La receta de entrenamiento es estilo K3: Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0.1, QK-Clip por cabeza, decaimiento coseno con 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. El enrutador selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. Los documentos empaquetados están aislados de forma estricta: MLA usa máscara causal bloqueada por documento y KDA reinicia el estado recurrente y el historial de la convolución corta Q/K/V en cada frontera de segmento. Este checkpoint corresponde a 1.000.079.360 tokens válidos consumidos y 1.526 pasos de optimizador, de un plan total de 16.000.000.000 tokens; no se publica el estado del optimizador y no se aplicó ningún post-entrenamiento.

## Capacidades

- Generación de texto autorregresiva en modo continuación de secuencia (modelo base preentrenado).
- Modelado de lenguaje a nivel de token con vocabulario de 163.840 entradas y tokens especiales definidos (BOS 163.584, EOS de generación 163.586, PAD 163.839).
- Razonamiento, código, matemáticas, visión o audio: no disponible; no se ha evaluado en tareas downstream ni se declaran capacidades de este tipo.
- Tool calling / function calling: no soportado (modelo base sin post-entrenamiento).
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas; el tamaño del vocabulario es compatible con un tokenizador multilingüe, pero no se especifica cobertura de idiomas.
- Capacidad especial destacable: es un sujeto de estudio para ablaciones arquitectónicas (atención lineal frente a MLA, granularidad de decaimiento, posicional NoPE) dentro de una comparativa controlada de 20 variantes.
- No existe modo "thinking" ni ningún modo de razonamiento extendido.

## Casos de uso

- Investigación en ablaciones de arquitectura: el modelo es una de las 20 variantes de una comparativa con inicialización y orden de datos idénticos, por lo que sirve para medir el efecto aislado de cambiar a 64 grupos de decaimiento contiguos por cabeza en KDA frente al baseline.
- Estudio de eficiencia de atención lineal frente a atención completa: al alternar 9 capas KDA con 4 capas Gated MLA en un presupuesto de 1B de parámetros, permite medir coste de memoria y de cómputo del estado recurrente frente al KV cache de MLA en secuencias de 8.192 tokens.
- Diagnóstico de enrutado MoE: con 64 expertos enrutados, 2 compartidos y top-k 4 sobre un ancho oculto de experto de 512, el checkpoint permite analizar saturación de expertos, entropía del router y el efecto del Quantile Balancing con histograma de 1.000 bins.
- Punto de partida para fine-tuning supervisado: al ser un modelo base sin post-entrenamiento, es un candidato razonable para experimentos de SFT a pequeña escala en los que se quiera aislar el efecto del preentrenamiento arquitectónico, siempre que se asuma el coste de adaptar el código propio del modelo.
- Reproducción de recetas de optimizador: la combinación de Muon por cabeza para Q/K/V, Muon general, AdamW de respaldo, QK-Clip y warmup del 1 % puede replicarse y compararse en este proxy de 1B antes de extrapolar a modelos mayores.
- Análisis de distribución lingüística y perplejidad: el autor registra NLL y perplejidad en un conjunto de desarrollo fijo, de modo que el checkpoint sirve para estudiar la evolución de la pérdida a lo largo de 1.000 millones de tokens en un vocabulario grande.
- Validación de infraestructura de serialización: dado que este run se relanzó por una discrepancia entre los layouts de entrenamiento y portátil de `dt_bias`, es un caso de prueba útil para verificar pipelines de checkpoint portable con estados en FP32 mezclados con pesos BF16.
- Docencia y prototipado de arquitecturas híbridas: con 1B de parámetros lógicos y 352M activos, es un banco de pruebas asequible en hardware de una sola GPU para estudiar bloques de Attention Residuals y puertas de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que se trata de un checkpoint intermedio de preentrenamiento y que todavía no se ha evaluado en tareas downstream. Solo se registran NLL y perplejidad de desarrollo durante el entrenamiento, en Weights & Biases y en las métricas JSONL del run; no se proporcionan esos valores en la información disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos eran foros sobre Facebook, sin relación con el tema).

## Requisitos de hardware

- VRAM estimada para pesos: unos 2,03 GB en BF16 (formato de publicación) y unos 4,06 GB si se convierte a FP32, calculados a partir de 1.015.888.876 parámetros. En cuantización INT8 serían aproximadamente 1,02 GB y en INT4 aproximadamente 0,51 GB, aunque no se publican versiones cuantizadas oficiales.
- Memoria adicional: el repo ocupa 6,1 GB, lo que incluye el código y los checkpoints etiquetados como tags inmutables. Hay que sumar el coste del estado recurrente de KDA (de tamaño fijo por capa y reiniciado en cada frontera de segmento) y el KV cache de las 4 capas MLA en modo NoPE; no se publican cifras exactas de memoria de activaciones ni de cache.
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3090, RTX 4090 o RTX 5090 (24 GB o más), y también en tarjetas de 12 GB como la RTX 3060 si se trabaja con secuencias cortas o cuantización. Para data centers, A100, H100 o L40S son sobredimensionadas para los pesos pero útiles para entrenamiento o para lotes grandes.
- Despliegue: la arquitectura es personalizada (`mini_k3`) y el repositorio define su propio layout en `modeling_mini_k3.py` y `configuration_mini_k3.py`; no se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún runtime estándar, y no se publican pesos en GGUF. La vía soportada es cargar el modelo con el código incluido y los scripts `initialize_model.py` y `smoke_test.py`.
- Latencia y throughput: no disponible (no se publican medidas de tokens por segundo ni de tiempo por paso).

## Comparativa con modelos similares

La búsqueda web no devolvió información sobre modelos comparables, y la model card no incluye comparativas con alternativas. Solo se dispone de los datos del propio modelo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-decay-g64-v2_B | 1.015.888.876 totales / 352.664.556 activos | 8.192 tokens | No evaluado en downstream; solo NLL y perplejidad de desarrollo no publicados aquí | No disponible | HuggingFace, `safetensors` + código PyTorch propio |
| Alternativas de ~1B de parámetros (familias densas y MoE de código abierto) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de preentrenamiento: cubre 1.000 millones de los 16.000 millones de tokens previstos, por lo que su calidad está muy por debajo de la de un modelo terminado.
- No es un asistente que siga instrucciones. El autor advierte explícitamente que no debe tratarse como tal; no ha habido SFT, RLHF ni DPO.
- Riesgo alto de alucinación, repetición y contenido inexacto, sesgado o inseguro, en línea con lo indicado en la sección de limitaciones del repositorio.
- Licencia no disponible: al no declararse términos de uso, no hay autorización explícita para uso comercial ni garantías de ningún tipo. Conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe aunque el vocabulario sea grande.
- Contexto limitado a 8.192 tokens de entrenamiento; no se documenta extrapolación a ventanas mayores.
- Los rankings entre arquitecturas obtenidos a esta escala y con longitud de entrenamiento de 8K necesitan confirmación antes de extrapolarse al Kimi-K3 completo, según el propio autor.
- Dependencia de código propio: sin soporte en runtimes estándar de inferencia, la integración en producción exige mantener `modeling_mini_k3.py` y `configuration_mini_k3.py` y verificar la compatibilidad de versiones de PyTorch.
- El estado del optimizador no se publica, por lo que no es posible reanudar el entrenamiento exactamente desde este punto.
- Los conjuntos de datos de origen conservan sus propias licencias y términos; el repositorio no redistribuye su texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B
- Documentación de arquitectura incluida en el repo: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B/blob/main/ARCHITECTURE.md
- Readme del paquete de arquitectura: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B/blob/main/ARCHITECTURE_PACKAGE_README.md
- Descripción de la variante: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B/blob/main/VARIANT.md
- Script de inicialización: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B/blob/main/initialize_model.py
- Script de prueba rápida: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B/blob/main/smoke_test.py
- Pesos: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g64-v2_B/blob/main/model.safetensors
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo, su paper o su repositorio de experimentos; los resultados devueltos eran foros sin relación con el tema.
