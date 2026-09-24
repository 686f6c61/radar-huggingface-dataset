# nkkbr/Mini-K3-1H-kda-kernel-2-v2

## Resumen

Mini-K3-1H-kda-kernel-2-v2 es un checkpoint de preentrenamiento de la familia Mini-K3-1H v2, publicado por el usuario nkkbr, que reproduce a escala reducida (alrededor de mil millones de parámetros lógicos) los operadores de la arquitectura Kimi-K3: KDA (atención lineal con decaimiento por cabeza), Gated MLA, bloques de residuales de atención, Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing. Se trata de un proxy de investigación de unos 1.016.697.580 parámetros totales, de los cuales solo 353.473.260 se activan por token gracias al enrutamiento disperso.

El modelo forma parte de una comparación controlada de 20 arquitecturas que comparten inicialización canónica por nombre y forma con semilla base 20260914, de modo que los parámetros con igual nombre y forma arrancan byte a byte idénticos entre variantes. Esta revisión concreta introduce una ablación sobre el kernel de la convolución causal en profundidad de las capas KDA (kernel = 2), dentro de un entrenamiento con secuencias de 8.192 tokens y 8.000.634.880 objetivos válidos de siguiente token consumidos en 12.208 pasos de optimizador.

Su relevancia es fundamentalmente metodológica: permite estudiar a escala manejable el equilibrio entre atención lineal y atención latente comprimida, el comportamiento del enrutador MoE con Quantile Balancing y el efecto de decisiones de diseño como NoPE o la granularidad de decaimiento, antes de extrapolar conclusiones al Kimi-K3 completo. No es un modelo instructivo ni un asistente: es un checkpoint intermedio de preentrenamiento sin post-entrenamiento, sin evaluación downstream publicada y sin licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 13 capas (9 KDA de atención lineal + 4 Gated MLA) con MoE enrutado (Stable LatentMoE) |
| Parámetros totales | 1.016.697.580 (≈1,02 mil millones) |
| Parámetros activos | 353.473.260 por token (≈353,5 millones) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); contexto de inferencia no especificado |
| Tipos de cuantización | no disponible (solo se publican pesos en BF16) |
| Idiomas soportados | no disponible (no se declara ningún idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (layout standalone definido por `modeling_mini_k3.py` y `configuration_mini_k3.py`) |
| Capas decoder | 13 (índices KDA: 1, 2, 3, 5, 6, 7, 9, 10, 11; índices Gated MLA: 4, 8, 12, 13) |
| Anchura oculta / cabezas de atención / anchura de cabeza KDA | 1.024 / 12 / 128 |
| Kernel de convolución en profundidad causal (KDA) | 2 |
| Grupos de decaimiento KDA por cabeza | 128 (contiguos) |
| Modo posicional de MLA | NoPE; puerta de salida: activada |
| Capas densas antes del MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Anchura oculta del experto enrutado | 512 |
| Tamaño de bloque de Attention Residual | 4 |
| Vocabulario / BOS / EOS de generación / PAD | 163.840 / 163.584 / 163.586 / 163.839 |
| Precisión de parámetros | BF16; decaimiento KDA, convolución, normalización y estado de control del router en FP32 |
| Revisiones (tags) | `checkpoint-tokens-008000634880` (revisión descrita); tag final previsto `checkpoint-tokens-016000000000-final` |
| Estado del optimizador | no publicado (decisión deliberada del autor) |
| Tamaño del repositorio | 12,3 GB |
| Descargas / likes | 761 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de 13 capas que alterna dos mecanismos de atención: 9 capas KDA (atención lineal con convolución causal en profundidad de kernel 2 y 128 grupos de decaimiento contiguos por cabeza) y 4 capas Gated MLA (atención latente comprimida con puerta de salida y sin codificación posicional explícita, modo NoPE). Sobre esta columna se apila un Stable LatentMoE con 64 expertos enrutados y 2 compartidos, top-k = 4, con anchura oculta de experto de 512 y una única capa densa previa al primer bloque MoE. El ancho oculto es de 1.024 con 12 cabezas de atención y anchura de cabeza KDA de 128, y los residuales de atención se agrupan en bloques de tamaño 4. El vocabulario es de 163.840 entradas con tokens reservados BOS, EOS de generación y PAD.

El entrenamiento utiliza Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. El router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas no sesgadas renormalizadas. No se aplicó post-entrenamiento (ni RLHF ni DPO). La revisión publicada corresponde a 8.000.634.880 objetivos válidos y 12.208 pasos; el tag final solo se creará tras procesar exactamente 16.000.000.000 objetivos. Los documentos empaquetados están aislados de forma estricta: MLA usa máscara causal bloqueada por documento y KDA reinicia su estado recurrente y el historial de convolución corta Q/K/V en cada frontera de segmento. Las revisiones de código fuente, cuotas de tokens, hashes de planificación y de partición de validación están en los manifiestos JSON del repositorio.

## Capacidades

- Generación de texto autoregresiva: es un modelo de lenguaje base entrenado únicamente con objetivo de siguiente token.
- Razonamiento, código y matemáticas: no se ha evaluado ninguna de estas capacidades; no hay datos de benchmarks downstream publicados.
- Tool calling / function calling: no soportado ni documentado; el modelo no ha recibido post-entrenamiento para ello.
- Agentes y razonamiento multi-paso: no soportado; no hay modo de pensamiento, plantillas de chat ni formato de instrucciones definido.
- Multilingüismo: no declarado. El vocabulario de 163.840 entradas es compatible con coberturas lingüísticas amplias, pero la ficha no especifica idiomas.
- Eficiencia estructural: 9 de las 13 capas usan atención lineal KDA con estado recurrente de coste constante en longitud, lo que reduce el crecimiento de la caché frente a atención completa.
- Dispersión MoE: 64 expertos enrutados con top-k = 4 y 2 expertos compartidos, con solo 353.473.260 parámetros activados por token.
- Capacidades especiales: puertas de salida, modo posicional NoPE en las capas MLA, bloques de Attention Residual y enrutamiento con Quantile Balancing en línea.
- Reproducibilidad experimental: inicialización canónica por nombre y forma (semilla 20260914) que garantiza parámetros compartidos byte-idénticos entre las 20 variantes comparadas.
- No dispone de visión, audio, ni cualquier otra modalidad: el repositorio se describe explícitamente como text-only.

## Casos de uso

- Ablación de arquitectura sobre el kernel KDA: esta revisión cambia la profundidad del kernel de convolución causal a 2 respecto al resto de la familia Mini-K3-1H; sirve para medir el efecto de esa decisión sobre la NLL de desarrollo manteniendo constantes inicialización, mezcla de datos y planificación.
- Investigación en atención lineal híbrida: al combinar 9 capas KDA con 4 capas Gated MLA, permite estudiar el equilibrio entre ambos operadores y comparar el coste y la calidad frente a un transformer denso de tamaño similar.
- Estudio del enrutamiento MoE: con 64 expertos enrutados, 2 compartidos y top-k = 4, y con selección por puntuaciones sesgadas y combinación por sigmoide no sesgada, es una plataforma para analizar equilibrio de carga y colapso de expertos con Quantile Balancing en línea.
- Preentrenamiento continuado y ajuste fino de dominio: al ser un checkpoint intermedio (8.000 millones de tokens de 16.000 millones previstos) y sin post-entrenamiento, es un punto de partida razonable para afinar sobre corpus especializados con presupuesto de cómputo reducido.
- Evaluación de degradación con contexto largo y NoPE: la combinación de secuencias de 8.192 tokens, máscara causal bloqueada por documento en MLA y reinicio de estado en KDA permite medir cómo se degrada la perplejidad y la capacidad de recuperación a distintas distancias.
- Banco de pruebas de kernels y serving: el paquete standalone (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`) permite medir latencia y throughput de kernels KDA frente a MLA sin depender del checkout original de entrenamiento.
- Estudio del tokenizador y de los tokens reservados: con 163.840 entradas y tokens específicos para BOS (163.584), EOS de generación (163.586) y PAD (163.839), sirve para analizar cobertura léxica y coste de embedding en lenguajes concretos.
- Verificación de reproducibilidad entre variantes: la inicialización determinista por semilla 20260914 y la mezcla inmutable append-only permiten reproducir comparaciones controladas de 20 arquitecturas en igualdad de condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que se trata de un checkpoint intermedio de investigación y que aún no ha sido evaluado en tareas downstream. Las únicas métricas registradas son la NLL y la perplejidad sobre el conjunto fijo de desarrollo durante el entrenamiento, disponibles en W&B y en las métricas JSONL del propio run, pero no se reproducen valores concretos en la model card ni en la información proporcionada.

## Requisitos de hardware

- VRAM para pesos en BF16: aproximadamente 1,89 GiB (2.033.395.160 bytes) para los 1.016.697.580 parámetros publicados.
- VRAM para pesos en FP32: aproximadamente 3,79 GiB, si se opta por conversión completa a precisión simple. Estimación propia a partir del recuento de parámetros.
- VRAM total estimada para inferencia en BF16: del orden de 3 a 6 GB con secuencias cortas y lote pequeño, sumando activaciones, estados recurrentes KDA, caché latente de MLA y buffers de la convolución corta. Estimación orientativa, no publicada por el autor.
- Cabe en GPU de consumo: sí, con margen amplio en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 24 GB. También en GPUs de 8 GB si se reduce el lote y la longitud de secuencia.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares quedan sobredimensionadas para un único modelo; son útiles para evaluar a gran lote o para servir varias réplicas.
- CPU: la inferencia es posible en PyTorch puro, pero no hay rutas optimizadas ni cuantizadas publicadas.
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni motores equivalentes. Al no haber GGUF ni integración en `transformers`, el despliegue requiere cargar el paquete standalone del repositorio con PyTorch y sus kernels específicos de KDA y MLA.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo a primer token.
- Almacenamiento: el repositorio ocupa 12,3 GB, muy por encima de los ~1,9 GiB de pesos en BF16, por lo que incluye artefactos adicionales (código, manifiestos y métricas) cuyo desglose no se detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-kda-kernel-2-v2 | 1,02 B totales / 353 M activos (MoE) | 8.192 tokens (entrenamiento) | no disponible (sin evaluación downstream) | no disponible | safetensors con código propio, sin integración en motores estándar |
| Qwen3-1.7B | 1,7 B densos | 32.768 tokens nativos | no comparable directamente (modelo con post-entrenamiento) | Apache-2.0 | safetensors, GGUF y soporte amplio en vLLM, llama.cpp y Ollama |
| Llama-3.2-1B | 1,24 B densos | 128.000 tokens | no comparable directamente (modelo con post-entrenamiento) | Llama 3.2 Community License | safetensors y amplio soporte de motores |

Los datos de Qwen3-1.7B y Llama-3.2-1B proceden de sus respectivas model cards públicas. La comparación es estructural: Mini-K3-1H es un checkpoint de preentrenamiento sin post-entrenamiento, orientado a ablación de arquitectura, mientras que los otros dos son modelos instructivos listos para despliegue. Como referencia arquitectónica de escala completa, el autor cita los operadores de Kimi-K3 (KDA y Gated MLA), pero no se dispone de especificaciones ni de resultados de esa familia en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados. El repositorio no redistribuye los textos de entrenamiento y remite a los manifiestos JSON para conocer las revisiones exactas de las fuentes, que conservan sus propias licencias y términos.
- Riesgo de alucinación: elevado. El autor advierte explícitamente de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- No es un asistente: no ha recibido post-entrenamiento ni ajuste por instrucciones, por lo que no debe tratarse como un modelo de diálogo ni usarse en productos orientados a usuario final.
- Limitación de contexto: la longitud de entrenamiento es de 8.192 tokens. La extrapolación a contextos mayores no está verificada y la model card indica que los rankings arquitectónicos a esta escala y a esta longitud necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Idiomas: no se declara ninguno; no hay garantías de calidad fuera de los idiomas presentes en la mezcla de entrenamiento, que no se detalla en la ficha.
- Licencia: no disponible. No se puede asumir uso comercial sin consultar al autor y sin revisar las licencias de los datasets fuente.
- Checkpoint intermedio: la revisión publicada corresponde a 8.000.634.880 de los 16.000.000.000 objetivos previstos. El tag final aún no está creado, de modo que el modelo no ha completado su plan de entrenamiento.
- Estado del optimizador no publicado: no es posible reanudar el entrenamiento exactamente desde esta revisión sin reconstruir el estado del optimizador.
- Despliegue: la ausencia de formatos cuantizados, de GGUF y de integración con motores de inferencia limita su uso en producción y obliga a mantener el código propio del repositorio.
- Reproducibilidad condicionada: los resultados comparativos solo son válidos si se respetan la mezcla append-only, los hashes de planificación y la inicialización determinista documentados en los manifiestos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-kda-kernel-2-v2
- Repositorio de experimentos y diagnósticos de arquitectura planificados: no disponible como URL en la información proporcionada (la model card lo menciona sin enlace).
- Métricas de entrenamiento en W&B (NLL y perplejidad sobre desarrollo fijo): no disponible como URL en la información proporcionada.
- Métricas JSONL del run: incluidas como artefactos dentro del propio repositorio de HuggingFace.
- Ficheros de referencia dentro del repositorio: `ARCHITECTURE.md`, `ARCHITECTURE_PACKAGE_README.md`, `VARIANT.md`, `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py` y los manifiestos JSON de planificación y datos.
