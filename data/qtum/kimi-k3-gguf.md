# qtum/Kimi-K3-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Kimi K3, desarrollado por Moonshot AI y cuantizado por el usuario qtum. Kimi K3 es un modelo de lenguaje masivo de tipo MoE (Mixture of Experts) con 2,78 billones de parámetros totales, de los cuales solo 104 mil millones se activan por token, distribuidos entre 896 expertos enrutados (top-16) y expertos compartidos. La relevancia de este lanzamiento radica en que presenta la primera cuantización del modelo que cabe en menos de 512 GiB de RAM (`IQ1_S-XXS-832e`), lo que permite ejecutarlo en un nodo único con 8×H100 y 2 TB de RAM, algo inédito para un modelo de este tamaño.

El autor proporciona una comparativa de perplejidad bajo metodología unificada (wikitext-2-raw, 12 fragmentos, `n_ctx=512`) entre varias configuraciones de cuantización, incluyendo una referencia sin pérdidas (`UD-Q8_K_XL`) que aprovecha que Kimi K3 se distribuye nativamente en formato MXFP4 mediante entrenamiento con cuantización consciente (QAT) desde la etapa de SFT. Las cuantizaciones principales son `IQ1_S-XS` (539,7 GiB) e `IQ1_S-XXS-832e` (503,3 GiB), esta última con una poda del 7,1% de los expertos enrutados que no muestra una degradación estadísticamente significativa (0,65σ). El repositorio incluye rutas de reproducción completas, comandos de compilación y mediciones de rendimiento reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 896 expertos enrutados (top-16), expertos compartidos, atención lineal KDA (SSM) y router |
| Parametros totales | 2.779.483.135.584 (~2,78 billones) |
| Parametros activos | 104 mil millones (104B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S-XS (539,7 GiB), IQ1_S-XXS-832e (503,3 GiB), UD-IQ1_S (553,2 GiB), UD-Q8_K_XL (1453,9 GiB, referencia sin pérdidas) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | kimi-k3 (licencia propia, enlace al LICENSE de Moonshot AI) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Kimi K3 es un modelo MoE masivo con 896 expertos enrutados de los que se seleccionan los 16 principales por token, además de expertos compartidos que se activan en cada token. El modelo incorpora una atención lineal KDA (representada como `ssm_*` en los tensores) que reduce el coste computacional del mecanismo de atención. Una característica clave es que el modelo base se distribuye nativamente en MXFP4, resultado de un entrenamiento con cuantización consciente (QAT) aplicado desde la etapa de SFT, lo que permite que la cuantización `Q8_K_XL` copie los pesos de las capas MoE de forma verbatim y sirva como referencia sin pérdidas.

En cuanto al entrenamiento, no se proporcionan datos específicos sobre el número de tokens ni la composición del dataset en la información disponible. La cuantización presentada en este repositorio utiliza una asignación de bits por tipo de tensor: los expertos enrutados (`ffn_{gate,down,up}_exps`) se cuantizan a IQ1_S (1,5625 bpw) ya que representan el 92,7% del peso total; el router (`ffn_gate_inp`) se mantiene en F32 sin cuantizar para evitar errores de enrutamiento; la atención se cuantiza a IQ4_XS; los expertos compartidos a Q5_K; y las capas SSM y proyecciones compartidas del MoE latente a IQ4_XS. La variante `832e` elimina 64 de los 896 expertos enrutados, una poda que reduce 36,4 GiB sin coste de calidad medible según el autor.

## Capacidades

- Generación de texto y conversación multilingüe en inglés y chino, heredadas del modelo base Kimi K3.
- Enrutamiento dinámico de expertos: al activar solo 104B de los 2,78T parámetros por token, ofrece un equilibrio entre capacidad y coste computacional.
- Inferencia eficiente en CPU/GPU híbrida mediante llama.cpp, con soporte para descarga de expertos MoE a CPU (`--n-cpu-moe`).
- Cuantización extrema IQ1_S con preservación del router en F32, lo que mantiene la calidad de selección de expertos.
- Compatibilidad con el ecosistema llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) que soporten GGUF.
- No se especifican capacidades de tool calling, function calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Investigación académica en PLN: permite estudiar el comportamiento de un modelo MoE de 2,78T parámetros en un nodo único con 2 TB de RAM, algo que antes requería infraestructura distribuida. Los investigadores pueden analizar la perplejidad, el enrutamiento de expertos y los efectos de la poda de expertos (832e vs 896e) con datos medidos y reproducibles.
- Generación de datos sintéticos a gran escala: dado su tamaño y capacidad multilingüe (en/zh), puede utilizarse para generar datasets de entrenamiento de alta calidad para modelos más pequeños, aprovechando los 104B parámetros activos para razonamiento complejo.
- Evaluación de técnicas de cuantización extrema: el repositorio incluye una comparativa de perplejidad con metodología unificada, lo que lo convierte en un banco de pruebas ideal para validar nuevas estrategias de cuantización (imatrix, IQ1_S, asignación por tipo de tensor) en modelos MoE masivos.
- Despliegue en clústeres con memoria unificada: la variante `IQ1_S-XXS-832e` (503,3 GiB) cabe en máquinas con 512 GiB de RAM, permitiendo ejecutar el modelo en servidores estándar de alta gama sin necesidad de GPUs con memoria masiva, usando CPU para los expertos y GPU para el resto.
- Análisis de robustez frente a cuantización: los datos de perplejidad (PPL 1,9193 vs 1,3453 para Q8) permiten cuantificar la degradación introducida por IQ1_S y decidir si es aceptable para casos de uso específicos como generación de borradores o clasificación de texto.
- Distilación de modelos: el modelo cuantizado puede servir como profesor para destilar conocimiento en modelos densos más pequeños, aprovechando su capacidad de generar texto coherente en inglés y chino con un presupuesto de memoria manejable en nodos con 2 TB de RAM.

## Benchmarks y rendimiento

El autor proporciona una comparativa de perplejidad bajo metodología unificada: `wikitext-2-raw/wiki.test.raw`, 12 fragmentos, `n_ctx=512`, `--n-cpu-moe 93`, misma máquina y misma compilación de llama.cpp. Los resultados son los siguientes:

| Cuantización | Tamaño | Expertos | PPL | vs Q8 |
|---|---|---|---|---|
| UD-Q8_K_XL (referencia sin pérdidas) | 1453,9 GiB | 896 | **1,3453** ± 0,0420 | — |
| UD-IQ1_S | 553,2 GiB | 896 | **1,8824** ± 0,0446 | +0,5371 |
| IQ1_S-XS (este repo) | **539,7 GiB** | 896 | **1,9193** ± 0,0469 | +0,5740 |
| IQ1_S-XXS-832e (este repo) | **503,3 GiB** | 832 | **1,9634** ± 0,0490 | +0,6181 |

El autor advierte que estas cifras solo son comparables entre sí, ya que otras publicaciones de PPL para cuantizaciones de K3 suelen omitir la configuración de medición. La diferencia entre `IQ1_S-XS` y `UD-IQ1_S` no es estadísticamente significativa (solapamiento de barras de error), pero la velocidad de generación difiere: 6,8 tok/s frente a 11,5 tok/s respectivamente. La diferencia entre `IQ1_S-XXS-832e` e `IQ1_S-XS` es de 0,65σ, muy por debajo del umbral de significación de 1,96σ.

## Requisitos de hardware

- Nodo verificado: 8×H100 con 2 TB de RAM, ejecutando llama.cpp con `--n-cpu-moe 93` (los expertos MoE se descargan a CPU).
- Memoria total necesaria: 503,3 GiB para `IQ1_S-XXS-832e` y 539,7 GiB para `IQ1_S-XS`. La variante `832e` es la única que cabe en máquinas con 512 GiB de RAM.
- GPU recomendadas: no es viable en GPUs de consumo (RTX 4090, etc.) por el tamaño del modelo; se requieren GPUs de servidor con alto ancho de banda (H100, A100) para las capas no MoE, mientras que los expertos pueden residir en RAM del sistema.
- Opciones de despliegue: llama.cpp (soporte nativo para GGUF y `--n-cpu-moe`), y cualquier herramienta compatible con GGUF como Ollama o LM Studio, aunque estas últimas no suelen gestionar bien modelos de este tamaño sin configuración avanzada.
- Rendimiento medido: 6,8 tok/s para `IQ1_S-XS` y 11,5 tok/s para `UD-IQ1_S` en el nodo 8×H100 + 2TB RAM. No se proporcionan datos de latencia o throughput adicionales.

## Comparativa con modelos similares

La comparativa se realiza entre las distintas cuantizaciones del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada:

| Modelo / Cuantización | Parámetros | Tamaño | PPL (wikitext-2) | Licencia |
|---|---|---|---|---|
| Kimi K3 - UD-Q8_K_XL | 2,78T (104B activos) | 1453,9 GiB | 1,3453 | kimi-k3 |
| Kimi K3 - UD-IQ1_S (unsloth) | 2,78T (104B activos) | 553,2 GiB | 1,8824 | kimi-k3 |
| Kimi K3 - IQ1_S-XS (qtum) | 2,78T (104B activos) | 539,7 GiB | 1,9193 | kimi-k3 |
| Kimi K3 - IQ1_S-XXS-832e (qtum) | 2,78T (96B activos aprox. tras poda) | 503,3 GiB | 1,9634 | kimi-k3 |

No se dispone de información sobre modelos comparables de otros fabricantes (por ejemplo, Llama 3.1 405B o DeepSeek-V3) en los datos proporcionados, por lo que no es posible realizar una comparativa externa.

## Limitaciones y advertencias

- Cuantización extrema: el uso de IQ1_S (1,5625 bpw) para los expertos introduce una degradación de PPL de +0,574 respecto a la referencia Q8, lo que puede afectar a tareas que requieren precisión numérica alta.
- Poda de expertos: la variante `832e` elimina 64 expertos enrutados. Aunque la diferencia de calidad no es estadísticamente significativa en perplejidad, podría afectar a tareas específicas no cubiertas por wikitext-2.
- Tipos de cuantización prohibidos: el autor advierte explícitamente que no se deben usar `Q1_0` ni `Q2_0`. `Q1_0` produce una PPL de 5×10⁵ (modelo inutilizable) porque solo almacena el signo de los pesos, y `Q2_0` usa el máximo del bloque como escala, lo que aplana bloques con valores atípicos.
- Requisitos de hardware extremos: aunque cabe en 512 GiB de RAM, sigue requiriendo un nodo con 2 TB de RAM y 8×H100 para un rendimiento aceptable. No es viable en hardware de consumo.
- Idiomas limitados: solo se garantiza soporte para inglés y chino. El rendimiento en otros idiomas no está documentado.
- Licencia: la licencia `kimi-k3` es propietaria; es necesario revisar el archivo LICENSE de Moonshot AI para confirmar las restricciones de uso comercial y redistribución antes de desplegar en producción.
- Datos de entrenamiento no disponibles: no se proporciona información sobre el corpus de entrenamiento, el número de tokens ni los métodos de alineación (RLHF, DPO, etc.), lo que limita la evaluación de sesgos y alucinaciones.
- Longitud de contexto no especificada: no se indica la ventana de contexto soportada, un dato crítico para casos de uso que requieran razonamiento de largo alcance.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qtum/Kimi-K3-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
