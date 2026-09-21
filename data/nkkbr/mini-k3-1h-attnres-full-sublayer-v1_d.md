# nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D

## Resumen

Mini-K3-1H-attnres-full-sublayer-v1_D es un checkpoint de investigación publicado por el usuario nkkbr dentro de un estudio controlado sobre mecanismos residuales de profundidad (Attention Residuals) en la familia Mini-K3-1H, un proxy pequeño de la arquitectura Kimi-K3. El modelo es un transformer decoder-only de 13 capas que combina 9 capas de KDA (atención lineal con decaimiento) y 4 capas de Gated MLA con modo posicional NoPE, con un MoE disperso de 64 expertos enrutados más 2 compartidos (top-4). Tiene 1.016.780.524 parámetros lógicos y activa 353.556.204 parámetros por token, con un vocabulario de 163.840 entradas y una longitud de secuencia de entrenamiento de 8.192 tokens.

Su relevancia es metodológica: aísla un único cambio arquitectónico, el residual AttnRes aplicado a nivel de subcapa completa (full_sublayer) sobre las salidas individuales de atención y FFN, frente al PreNorm estándar, tres granularidades de bloque y el baseline Block-4 publicado como nkkbr/Mini-K3-1H-v2. Todas las ejecuciones del estudio comparten inicialización canónica por nombre y forma con semilla base 20260914 y la misma mezcla congelada de 16.000 millones de tokens.

Es importante señalar que el tag correspondiente a este repositorio es checkpoint-tokens-000000000000-init: 0 tokens objetivo consumidos y 0 pasos de optimizador completados. Es, por tanto, un artefacto de inicialización para reproducir y comparar arquitecturas, no un modelo de generación de texto utilizable. No ha sido evaluado en tareas downstream y no ha recibido entrenamiento posterior (ni SFT, ni RLHF, ni DPO).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido con MoE disperso: 9 capas KDA (atención lineal con decaimiento) y 4 capas Gated MLA; residual AttnRes a nivel de subcapa completa |
| Parámetros totales | 1.016.780.524 (coincide entre los metadatos de safetensors y los parámetros lógicos declarados) |
| Parámetros activos | 353.556.204 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento declarada) |
| Tipos de cuantización | no disponible; solo se publican pesos BF16 en safetensors, sin GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | no disponible; el vocabulario tiene 163.840 entradas, pero el autor no declara idiomas y esta revisión no ha consumido tokens |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, BF16) con código de modelado propio: modeling_mini_k3.py, configuration_mini_k3.py y config.json |
| Capas decoder | 13; índices KDA [1, 2, 3, 5, 6, 7, 9, 10, 11], índices Gated MLA [4, 8, 12, 13] |
| Anchura oculta / cabezas de atención / anchura de cabeza KDA | 1024 / 12 / 128 |
| Convolución KDA | convolución causal depthwise con kernel 4 |
| Grupos de decaimiento KDA | 128 por cabeza (contiguos) |
| MLA | modo posicional NoPE; puerta de salida activada |
| MoE | 64 expertos enrutados + 2 compartidos, top-4; anchura oculta del experto enrutado 512; 1 capa densa antes del MoE |
| Mecanismo residual | atención completa sobre las salidas individuales de atención y FFN; modo full_sublayer, sin agrupación por bloques |
| Vocabulario y tokens especiales | 163.840 / BOS 163.584 / EOS de generación 163.586 / PAD 163.839 |
| Precisión | BF16 en parámetros; decaimiento KDA, convolución, normalización y estado de control del router retenidos en FP32 |
| Revisión de este repositorio | checkpoint-tokens-000000000000-init; 0 tokens objetivo válidos consumidos, 0 pasos de optimizador |
| Inicialización | canónica por nombre y forma, semilla base 20260914 |
| Tamaño del repositorio | 2,0 GB |
| Estado del optimizador | no publicado de forma deliberada |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de 13 capas que alterna mecanismos de atención. Las capas KDA (índices 1, 2, 3, 5, 6, 7, 9, 10 y 11) implementan atención lineal recurrente con decaimiento organizado en 128 grupos contiguos por cabeza, más una convolución causal depthwise de kernel 4 sobre las proyecciones Q/K/V para dotar de contexto local a corto plazo. Las capas 4, 8, 12 y 13 son Gated MLA, con modo posicional NoPE y puerta de salida, es decir, atención latente con compresión de KV y sin codificación posicional explícita. La anchura oculta es 1024 con 12 cabezas y anchura de cabeza KDA de 128. Las capas de alimentación son un MoE con 64 expertos enrutados y 2 compartidos, activación top-4 y anchura oculta por experto de 512; hay una capa densa antes del primer bloque MoE. El router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. La innovación del estudio es el residual: en lugar de residuales PreNorm por bloque, el modo full_sublayer aplica atención completa sobre las salidas individuales de cada subcapa de atención y de FFN. Este repositorio contiene únicamente ese cambio respecto al baseline Block-4.

La receta de entrenamiento prevista usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de parámetros matriciales y AdamW como respaldo para vectores y embeddings, con weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de calentamiento lineal y Quantile Balancing en línea con histograma de 1.000 bins. Los documentos empaquetados están aislados de forma estricta: MLA emplea una máscara causal bloqueada por documento, mientras que el estado recurrente de KDA y el historial de la convolución corta Q/K/V se reinician en cada frontera de segmento. Cada ejecución consume la misma programación congelada de 16.000 millones de tokens en el mismo orden, y el tag final se crea solo tras procesar exactamente esos 16.000 millones de objetivos de pérdida válidos. No se realizó ningún entrenamiento posterior.

## Capacidades

Advertencia previa: la revisión publicada en este repositorio (checkpoint-tokens-000000000000-init) no ha consumido ningún token de entrenamiento, por lo que sus pesos son de inicialización y no exhiben capacidades lingüísticas reales. La lista siguiente describe capacidades arquitectónicas y de entrenamiento, no destrezas aprendidas y verificadas.

- Generación de texto autorregresiva: el pipeline declarado es text-generation y el modelo es un decoder-only causal con vocabulario de 163.840 entradas; la generación solo será significativa en tags con tokens consumidos.
- Procesamiento de secuencias de hasta 8.192 tokens, con máscara causal bloqueada por documento en las capas MLA y reinicio de estado en las fronteras de segmento en las capas KDA.
- Mezcla de expertos con 64 expertos enrutados y 2 compartidos, top-4, con 353.556.204 parámetros activados por token sobre 1.016.780.524 totales.
- Atención híbrida: 9 capas de atención lineal con decaimiento (KDA) y 4 capas de atención latente comprimida (Gated MLA), lo que reduce el coste de atención de secuencias largas frente a un transformer denso equivalente.
- Razonamiento, matemáticas y código: no disponible; no hay evaluación downstream ni datos que respalden estas capacidades.
- Tool calling o function calling: no soportado (no se declara plantilla de herramientas ni entrenamiento con datos de llamadas).
- Uso como agente o razonamiento multi-paso: no soportado; no hay entrenamiento de instrucciones ni de trayectorias de agente.
- Capacidades multilingües: no disponible; el autor no documenta idiomas.
- Modo de pensamiento (thinking), visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Reproducibilidad de la ablación: permite comparar el residual full_sublayer con PreNorm y con granularidades de bloque bajo inicialización y mezcla de datos idénticas.

## Casos de uso

- Ablación arquitectónica controlada: comparar el residual full_sublayer frente a PreNorm y frente a las tres granularidades de bloque, usando la misma semilla 20260914 y la misma mezcla congelada de 16.000 millones de tokens; el modelo es adecuado porque su único cambio respecto al baseline Block-4 es el mecanismo residual de profundidad.
- Estudio de residuales sobre subcapas individuales: analizar cómo afecta aplicar atención completa a las salidas de cada subcapa de atención y FFN al flujo de gradientes y a la estabilidad de entrenamiento en un modelo de ~1B con MoE.
- Validación de kernels de atención lineal: probar la implementación de KDA con kernel de convolución 4 y 128 grupos de decaimiento por cabeza, midiendo memoria y tiempo por paso frente a las capas Gated MLA dentro del mismo modelo.
- Pruebas de infraestructura para MoE dispersos: medir memoria residente (1,02B parámetros) frente a cómputo por token (~353,6M parámetros activos) y calibrar estrategias de reparto de expertos en GPUs de gama alta y de consumo.
- Punto de partida para preentrenamiento reproducible: al publicarse el estado inicial canónico y los manifiestos JSON con revisiones de fuentes, cuotas de tokens y hashes de la programación, sirve como origen verificable para replicar la receta de 16.000 millones de tokens.
- Integración continua de código de modelado: initialize_model.py y smoke_test.py permiten verificar en un pipeline que modeling_mini_k3.py y config.json definen la arquitectura sin depender del checkout original de entrenamiento.
- Análisis de aislamiento de documentos: comprobar experimentalmente que la máscara causal bloqueada por documento en MLA y el reinicio de estado en KDA evitan la contaminación entre documentos empaquetados.
- Generación de texto de baja exigencia: solo cuando exista un tag con tokens consumidos (el final corresponde a 16.000 millones de tokens); con la revisión actual no es un caso de uso viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que se trata de un checkpoint intermedio de preentrenamiento que aún no ha sido evaluado en tareas downstream, y que las métricas de NLL y perplejidad del desarrollo fijo durante el entrenamiento se registran en W&B y en el JSONL de la ejecución, pero no se incluyen en los datos disponibles.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | sin evaluación downstream publicada |
| HumanEval | no disponible | sin evaluación downstream publicada |
| GSM8K | no disponible | sin evaluación downstream publicada |
| NLL / perplejidad | no disponible | registradas en W&B y JSONL de la ejecución, no publicadas en la información disponible |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas a partir del número de parámetros (1.016.780.524), no medidas publicadas por el autor.

- Pesos en BF16/FP16: aproximadamente 2,03 GB (1,89 GiB) solo para parámetros.
- Pesos en FP32: aproximadamente 4,07 GB (3,79 GiB).
- Pesos en INT8: aproximadamente 1,02 GB; en INT4, aproximadamente 0,51 GB, aunque el autor no publica variantes cuantizadas y la cuantización requeriría trabajo propio sobre las capas KDA y el residual.
- VRAM total de inferencia estimada en BF16: del orden de 3 a 4 GB contando activaciones, contexto de 8.192 tokens y sobrecarga del runtime; la dimensión del latente KV de MLA no se documenta, por lo que la caché exacta no se puede calcular.
- GPU de consumo: sí cabe en GPU de consumo. Una RTX 4090 o RTX 3090 (24 GB) ejecuta los pesos BF16 con holgura; tarjetas de 8 a 16 GB serían suficientes en BF16 para lotes pequeños, y de 6 a 8 GB en cuantizaciones de 8 o 4 bits.
- GPU de centro de datos: A100 (40/80 GB), H100 (80 GB) y similares son adecuadas y aportan margen para lotes grandes y secuencias de 8.192 tokens.
- Entrenamiento o ajuste fino: no hay cifras publicadas. Como orientación basada en el recuento de parámetros, el estado del optimizador (Muon y AdamW) y las activaciones a 8.192 tokens dominan el consumo; se necesitarían del orden de decenas de GB de VRAM, muy por encima de la inferencia. La model card menciona una elección de benchmark de hardware en los manifiestos JSON, pero no se proporciona.
- Opciones de despliegue: el repositorio incluye código PyTorch propio (modeling_mini_k3.py, configuration_mini_k3.py, config.json, initialize_model.py, smoke_test.py) que define la arquitectura de forma autónoma. No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni en transformers estándar; al no existir pesos GGUF y al tratarse de una arquitectura personalizada (KDA más residual AttnRes), cualquier otro runtime requeriría una implementación propia.
- Latencia y throughput: no disponibles. Como referencia estructural, el cómputo por token corresponde a los 353.556.204 parámetros activos (similar a un modelo denso de ~350M), pero la memoria necesaria para residir el modelo es la de 1.016.780.524 parámetros.

## Comparativa con modelos similares

No se proporcionan datos de benchmarks ni especificaciones de modelos externos comparables. La comparación disponible es interna al estudio del autor.

| Modelo | Parámetros totales | Activos por token | Contexto | Mecanismo residual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mini-K3-1H-attnres-full-sublayer-v1_D (este modelo) | 1.016.780.524 | 353.556.204 | 8.192 | full_sublayer: atención sobre salidas de cada subcapa | no disponible | HuggingFace, revisión en inicialización |
| nkkbr/Mini-K3-1H-v2 (baseline Block-4) | no disponible | no disponible | misma receta de 16.000 millones de tokens | granularidad de bloque (Block-4) | no disponible | HuggingFace |
| Variantes PreNorm y de granularidad de bloque del mismo estudio | no disponible | no disponible | misma receta | PreNorm y tres granularidades de bloque | no disponible | referenciadas en la model card, sin identificador en la información disponible |
| Kimi-K3 completo | no disponible | no disponible | no disponible | no disponible | no disponible | la model card solo lo menciona como destino de extrapolación, pendiente de confirmación |

## Limitaciones y advertencias

- Checkpoint sin entrenamiento: la revisión publicada es checkpoint-tokens-000000000000-init, con 0 tokens objetivo consumidos y 0 pasos de optimizador. Los pesos son de inicialización y las salidas carecerán de cualquier estructura lingüística aprendida.
- Sin evaluación downstream: el autor indica que el modelo no ha sido evaluado en tareas posteriores y que solo existen métricas de NLL y perplejidad del desarrollo fijo durante el entrenamiento, no publicadas en la información disponible.
- No es un asistente: no ha recibido SFT, RLHF ni DPO, por lo que no sigue instrucciones ni mantiene diálogos de forma fiable.
- Alucinación: en un checkpoint inicial el riesgo es total; en tags posteriores la model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- Sesgos: no se documenta ningún análisis de sesgo ni la composición detallada del corpus; los datasets de origen conservan sus propias licencias y términos y no se redistribuyen en el repositorio.
- Idiomas: no se declaran idiomas soportados. Aunque el vocabulario es de 163.840 entradas, no hay evidencia de cobertura multilingüe.
- Licencia: no disponible. Al no especificarse licencia, el uso comercial no está autorizado de forma explícita; conviene contactar con el autor antes de cualquier uso en producción.
- Extrapolación arquitectónica: la propia model card advierte de que los rankings de arquitectura obtenidos a esta escala y con 8.192 tokens de longitud de entrenamiento necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Continuidad del entrenamiento: el estado del optimizador no se publica deliberadamente, por lo que no es posible reanudar el preentrenamiento de forma exacta desde este punto.
- Gestión de revisiones: cada checkpoint numerado es un tag de Git inmutable y main apunta al más reciente; el tag final solo se crea tras procesar exactamente 16.000 millones de objetivos de pérdida válidos.
- Coste de despliegue: al ser un MoE, hay que tener residentes los 1.016.780.524 parámetros aunque solo se activen 353.556.204 por token, y ningún runtime estándar soporta la arquitectura sin trabajo adicional.
- Uso previsto: modelo proxy pequeño para investigación de arquitecturas, no apto como producto ni como servicio de generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D
- Perfil del autor: https://huggingface.co/nkkbr
- Baseline Block-4 citado en la model card: https://huggingface.co/nkkbr/Mini-K3-1H-v2
- Pesos: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/model.safetensors
- Código de modelado: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/modeling_mini_k3.py
- Configuración de la arquitectura: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/configuration_mini_k3.py
- Config JSON: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/config.json
- Documentación de la arquitectura: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/ARCHITECTURE.md y https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/ARCHITECTURE_PACKAGE_README.md
- Descripción de la variante (si está presente): https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/VARIANT.md
- Scripts de uso local: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/initialize_model.py y https://huggingface.co/nkkbr/Mini-K3-1H-attnres-full-sublayer-v1_D/blob/main/smoke_test.py
- Paper: no disponible
- Repositorio del experimento: mencionado en la model card como "experiment repository", sin URL en la información disponible
- Métricas de entrenamiento: registradas en W&B y en el JSONL de la ejecución, sin enlace disponible
- Búsqueda web: los resultados recuperados no guardan relación con el modelo (páginas sobre formularios administrativos franceses), por lo que no aportan enlaces verificables sobre Mini-K3-1H ni sobre Kimi-K3.
