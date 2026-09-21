# nkkbr/Mini-K3-1H-mamba2-n128-g4-v1_C

## Resumen

Mini-K3-1H-mamba2-n128-g4-v1_C es un checkpoint de investigación publicado por el usuario nkkbr dentro de una serie de ablaciones de arquitectura sobre el backbone Mini-K3-1H, una réplica a pequeña escala inspirada en el diseño Kimi-K3. El modelo sustituye nueve mezcladores de secuencia KDA por mezcladores Mamba-2/SSD y conserva cuatro capas Gated MLA en modo NoPE, un esquema Stable LatentMoE con enrutamiento de expertos, Block-4 Attention Residuals, tokenizador propio y cabeza de lenguaje no atada. El objetivo declarado no es ofrecer un asistente utilizable, sino medir el efecto del tipo de mezclador de secuencia manteniendo constante el resto del sistema (mezcla de datos, orden, semilla y regla de inicialización).

El tamaño es de 1.009.273.696 parámetros totales, con 346.049.376 parámetros lógicos activos por token según la definición del proyecto, y 13 capas de decodificador de anchura oculta 1024. El entrenamiento previsto usa secuencias de 8.192 tokens con lote local/global 5/80 y una horquilla de checkpoints intermedios a 0,5B, 1B, 2B, 4B, 8B y 12B objetivos válidos, con un checkpoint final a 16B. La revisión publicada en este repositorio es, sin embargo, la inmutable `checkpoint-tokens-000000000000-init`: cero objetivos de siguiente token consumidos y cero pasos de optimizador.

Su relevancia es, por tanto, metodológica: documenta con detalle el aislamiento causal de documentos empaquetados, los criterios de inicialización compartida entre variantes y las puertas de validación (aislamiento multi-frontera y multi-semilla, kernel fusionado, tres actualizaciones reales de 8K/B5) antes de lanzar el entrenamiento formal. No hay post-entrenamiento, no hay instrucciones afinadas y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 9 capas Mamba-2/SSD + 4 capas Gated MLA (NoPE, con puerta de salida), con Stable LatentMoE |
| Parámetros totales | 1.009.273.696 (dato real de safetensors) |
| Parámetros activos | 346.049.376 (definición lógica del proyecto) |
| Longitud de contexto | 8.192 tokens en entrenamiento; máximo declarado no disponible |
| Tipos de cuantización | No disponible (solo pesos BF16/FP32 en safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`) con código PyTorch propio: `configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py` y ficheros de tokenizador |
| Anchura oculta / capas | 1024 / 13 |
| Índices de capas Mamba-2 | [1, 2, 3, 5, 6, 7, 9, 10, 11] |
| Índices de capas Gated MLA | [4, 8, 12, 13] |
| Configuración Mamba-2 | Expansión 2; 32 cabezas × 64 canales; dimensión de estado 128; grupos B/C 4; convolución depthwise causal con kernel 4 |
| Expertos | 64 enrutados / 2 compartidos, top-k 4 (según la notación de la model card) |
| Vocabulario / BOS / EOS / PAD | 163840 / 163584 / 163586 / 163839 |
| Precisión de pesos | BF16 principal; parámetros de control de Mamba y del router en FP32 donde están definidos |
| Estado del optimizador | No publicado |
| Tamaño del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una ablación de mezclador de secuencia dentro del backbone Mini-K3. De las 13 capas del decodificador, nueve se implementan con Mamba-2/SSD (expansión 2, 32 cabezas de 64 canales, dimensión de estado 128, cuatro grupos B/C y convolución depthwise causal de kernel 4) y cuatro con Gated MLA en modo posicional NoPE conservando la puerta de salida. El resto del diseño se mantiene respecto a la referencia Mini-K3-1H: Stable LatentMoE con 64 expertos enrutados y 2 compartidos con top-k 4, Block-4 Attention Residuals, tokenizador propio con vocabulario de 163.840 entradas y cabeza de lenguaje no atada. El card aclara explícitamente que se trata de una ablación dentro del backbone Mini-K3 y no de una reproducción del calendario de bloques de NVIDIA Nemotron.

El régimen de entrenamiento previsto es de 16.000 millones de objetivos válidos como máximo, con longitud de secuencia 8.192 y lote local/global 5/80, usando Muon para parámetros matriciales con respaldo AdamW, y exención de weight decay para `A_log`, `D` y `dt_bias` de Mamba. Las cuatro variantes Mamba y la referencia Mini-K3-1H comparten la misma mezcla tokenizada congelada, orden de datos, semilla y regla de inicialización; los parámetros con nombre y forma semánticamente idénticos arrancan iguales, mientras que las nuevas proyecciones conjuntas y controles de estado de Mamba se inicializan de forma independiente pero determinista. La innovación técnica documentada con más detalle es el aislamiento causal de documentos empaquetados: MLA aplica atención causal específica por documento y Mamba-2 recibe los mismos identificadores indexados de documento tanto en la convolución causal como en el barrido SSD, reiniciando el historial de convolución y el estado recurrente en cada frontera. La puerta de validación comprueba que la pérdida de un documento posterior produce gradiente exactamente nulo sobre entradas de documentos anteriores; las diferencias entre documentos empaquetados y lanzados por separado quedan acotadas a unas pocas ULP de BF16 (diferencia medida ≤ 0,03125) por el árbol de reducción distinto en las reducciones prefijas fusionadas en FP32. Esta revisión concreta, sin embargo, corresponde al checkpoint inicial: 0 objetivos consumidos y 0 pasos de optimizador. No hay post-entrenamiento ni RLHF/DPO.

## Capacidades

- Generación de texto autorregresiva: es la tarea declarada (`pipeline_tag: text-generation`), pero la revisión publicada está en inicialización aleatoria, por lo que la salida no es texto coherente.
- Arquitectura causal con atención específica por documento y estado recurrente reiniciado en cada frontera: apta para investigación sobre entrenamiento con documentos empaquetados.
- Enrutamiento MoE con 64 expertos enrutados, 2 compartidos y top-k 4: permite estudiar asignación de expertos y parámetros activos frente a capacidad total.
- Mezclador de secuencia híbrido: nueve capas Mamba-2/SSD combinadas con cuatro capas Gated MLA, útil para comparar atención y SSM en igualdad de condiciones.
- Capacidad multilingüe: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible; no hay post-entrenamiento ni formato de herramientas.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.
- Longitud de contexto: 8.192 tokens en el entrenamiento previsto; no se declara ventana máxima de inferencia.

## Casos de uso

- Estudio comparativo de mezcladores de secuencia: el checkpoint permite reproducir la sustitución de nueve KDA por Mamba-2/SSD manteniendo fijos mezcla de datos, orden, semilla e inicialización, de modo que la diferencia medida se atribuye al mezclador.
- Validación de kernels SSD fusionados: la card documenta una puerta de kernel fusionado de modelo completo y tres actualizaciones reales de 8K/B5 antes del entrenamiento formal, utilizables como prueba de integración en un pipeline propio.
- Investigación sobre aislamiento causal en documentos empaquetados: los identificadores indexados de documento se comparten entre convolución causal y barrido SSD, con verificación de gradiente nulo entre documentos, lo que sirve de banco de pruebas para técnicas de empaquetado.
- Ajuste de recetas de inicialización: la regla de inicialización compartida por nombre y forma semántica, más la inicialización determinista de los controles nuevos, permite estudiar sensibilidad a la inicialización en arquitecturas híbridas.
- Ajuste fino de optimizadores: la receta Muon para matrices con respaldo AdamW y la exención de weight decay en `A_log`, `D` y `dt_bias` son candidatas directas a experimentos de estabilidad en modelos de ~1B.
- Pruebas de memoria y throughput de arquitecturas híbridas MoE en una sola GPU: con 1.009 millones de parámetros totales y 346 millones activos, cabe en GPUs de consumo y sirve para medir coste por token del enrutamiento y del estado recurrente.
- Punto de partida para continuar el preentrenamiento: el card describe checkpoints intermedios a 0,5B, 1B, 2B, 4B, 8B y 12B objetivos y uno final a 16B, con esta revisión como semilla de la secuencia.
- Auditoría de reproducibilidad: los manifiestos de fuente y receta se incluyen en `training/`, lo que permite auditar el experimento completo sin depender del checkout de entrenamiento.

No se recomienda ningún uso orientado a usuario final (chat, respuesta a preguntas, generación de código en producción) con esta revisión, porque los pesos no han consumido ni un solo token de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica que las métricas de NLL/perplejidad y los diagnósticos a nivel de fuente están en los registros de la ejecución, pero no se incluyen cifras en la ficha ni comparaciones con MMLU, HumanEval, GSM8K u otros conjuntos. El autor advierte además que los resultados a este tamaño, mezcla de datos y longitud de fila de 8K necesitan confirmación antes de extrapolarse a Kimi-K3 completo u otros sistemas Mamba.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 2,02 GB (1.009.273.696 parámetros), coherente con el tamaño de repositorio de 2,0 GB.
- VRAM estimada para inferencia: ~3 GB en BF16 contando activaciones y overhead; ~4,1 GB si se carga en FP32; ~1,2 GB en int8 y ~0,7 GB en int4 (estas dos últimas no están publicadas, son estimaciones a partir del recuento de parámetros).
- GPUs de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs integradas con 8 GB o más en cuantización de 8 bits, siempre que se use la ruta de código propia.
- GPUs de centro de datos: A100, H100, L40S o similares son suficientes de sobra para una sola réplica; el paralelismo solo es necesario para el entrenamiento a 8K de longitud de secuencia.
- Despliegue: requiere el código incluido en el repositorio (`configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py`) y tokenizador propio. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni ninguna otra ruta de inferencia; tampoco hay GGUF publicado. La ruta Mamba portátil es una referencia diferenciable, mientras que el sistema de entrenamiento usa el kernel SSD fusionado fijado tras validación.
- Latencia y throughput: no disponibles. Con 346 millones de parámetros activos por token, el coste de cómputo por token es comparable al de un modelo denso de ese orden, pero no hay cifras publicadas.
- Memoria para entrenamiento: no disponible; el estado del optimizador no se publica y la receta usa Muon, cuyos requisitos de memoria no se detallan.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de modelos alternativos, por lo que los valores numéricos de comparación figuran como no disponibles. La única referencia interna documentada es el propio backbone Mini-K3-1H con mezcladores KDA, del que esta revisión es una ablación.

| Modelo | Parámetros | Contexto | Mezclador de secuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-mamba2-n128-g4-v1_C | 1.009.273.696 totales / 346.049.376 activos | 8.192 en entrenamiento; máximo no disponible | 9 Mamba-2/SSD + 4 Gated MLA NoPE | No disponible | Pesos safetensors + código propio en HuggingFace; 0 descargas |
| Mini-K3-1H (referencia interna) | No disponible (mismo diseño salvo mezcladores) | 8.192 en entrenamiento | KDA en las capas sustituidas | No disponible | Mencionado en la card; repositorio no indicado |
| Otras variantes Mamba del mismo estudio | No disponible | 8.192 en entrenamiento | Mamba-2/SSD con otras configuraciones | No disponible | Mencionadas en la card; repositorios no indicados |
| Modelos comparables de terceros (misma categoría híbrida SSM/atención) | No disponible | No disponible | No disponible | No disponible | No aparecen en la información proporcionada |

## Limitaciones y advertencias

- La revisión publicada es el checkpoint inicial: 0 objetivos de siguiente token consumidos y 0 pasos de optimizador. Los pesos son una inicialización aleatoria, no un modelo entrenado; la generación de texto será incoherente.
- Sin post-entrenamiento: el autor indica explícitamente que es un proxy de investigación preentrenado y no un asistente con instrucciones afinadas. No hay RLHF ni DPO.
- Licencia no disponible: no se declara licencia, por lo que el uso comercial queda en situación jurídica indeterminada y no puede asumirse permiso de uso.
- Idiomas y cobertura del tokenizador no disponibles: el vocabulario es de 163.840 entradas con BOS/EOS/PAD definidos, pero no se detalla su composición ni el soporte multilingüe.
- Riesgo de alucinación: en una inicialización aleatoria la noción de alucinación no aplica en el sentido habitual; cualquier salida debe considerarse ruido estadístico sin valor informativo.
- Sesgos: no evaluados ni documentados; no hay análisis de sesgo en la información disponible.
- Contexto: la longitud de secuencia de entrenamiento es 8.192 tokens; no se declara ventana máxima soportada en inferencia, por lo que no debe asumirse extensión más allá de ese valor.
- Dependencia de código propio: la carga requiere `trust_remote_code` o copiar los ficheros de modelado; no hay compatibilidad documentada con frameworks de inferencia estándar ni pesos GGUF.
- Ambigüedades de la ficha: el recuento de 13 capas de decodificador no encaja de forma directa con índices de capa que llegan hasta 13, y la notación "64 / 2 / 4" para expertos no se desglosa etiqueta por etiqueta. Conviene verificar `config.json` antes de reutilizar el modelo.
- Diferencia numérica entre ejecuciones: los documentos empaquetados y los lanzados por separado pueden diferir en unas pocas ULP de BF16 (acotado en 0,03125) por el árbol de reducción distinto en las reducciones prefijas fusionadas en FP32; no crea ruta de gradiente entre documentos, pero impide reproducibilidad bit a bit.
- Generalización: el autor advierte que los resultados a este tamaño, mezcla de datos y longitud de fila de 8K requieren confirmación antes de extrapolarse a Kimi-K3 completo u otros sistemas Mamba.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n128-g4-v1_C
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a un portal administrativo gubernamental ajeno al proyecto), por lo que no se han encontrado papers, blogs, repositorios ni demos adicionales.
- Recursos internos citados en la model card: directorio `training/` del propio repositorio, con registros de puertas de validación y manifiestos de fuente y receta.
