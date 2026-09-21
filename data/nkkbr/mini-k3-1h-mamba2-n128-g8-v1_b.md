# nkkbr/Mini-K3-1H-mamba2-n128-g8-v1_B

## Resumen

Mini-K3-1H-mamba2-n128-g8 es un checkpoint de investigación publicado por el usuario nkkbr dentro de la familia de ablaciones de arquitectura "Mini-K3". Se trata de un modelo de lenguaje solo texto de tipo proxy a pequeña escala en el que nueve de los mezcladores de secuencia KDA del diseño base Mini-K3-1H se sustituyen por mezcladores Mamba-2/SSD, manteniendo intactos los cuatro bloques Gated MLA con posición NoPE, el enrutador Stable LatentMoE, los Block-4 Attention Residuals, el tokenizador y la cabeza de lenguaje no atada. Su interés es metodológico: sirve para comparar mezcladores recurrentes frente a atención latente en un backbone comparable, con schedule de datos, semilla e inicialización congelados.

El modelo tiene 1.018.756.960 parámetros lógicos totales y 355.532.640 parámetros activos por token, con 13 capas de decodificador de ancho oculto 1024 y una ventana de entrenamiento de 8.192 tokens. El vocabulario es de 163.840 entradas, coherente con un tokenizador de la familia K3, y los pesos se publican en safetensors en BF16 con código de modelado propio en PyTorch.

Es relevante ahora porque documenta con detalle inusual los controles de aislamiento de documentos en documentos empaquetados (segmented scan en FP32 para la suma acumulada de dA en Mamba-2) y porque forma parte de un conjunto de cuatro variantes Mamba comparadas contra la referencia Mini-K3-1H. Conviene remarcar que se trata de un proxy de investigación preentrenado, no de un asistente ajustado por instrucciones, y que este repositorio corresponde a un checkpoint de inicialización aleatoria según la revisión inmutable declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 9 capas Mamba-2/SSD + 4 capas Gated MLA con posición NoPE y puerta de salida, más Stable LatentMoE y Block-4 Attention Residuals |
| Parametros totales | 1.018.756.960 (~1,02 B) |
| Parametros activos | 355.532.640 (~355 M) por token; 64 expertos enrutados, 2 compartidos, top-k 4 |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con config.json, configuration_mini_k3.py, modeling_mini_k3.py, mamba2_mixer.py y ficheros de tokenizador |
| Ancho oculto / capas | 1024 / 13 capas de decodificador |
| Distribución de capas | Mamba-2 en índices 1, 2, 3, 5, 6, 7, 9, 10, 11; Gated MLA en índices 4, 8, 12, 13 |
| Configuración Mamba-2 | Expansión 2, 32 cabezas × 64 canales, dimensión de estado 128, 8 grupos B/C, kernel de convolución causal en profundidad de 4 |
| Vocabulario | 163.840 tokens (BOS 163.584, EOS 163.586, PAD 163.839) |
| Precisión | BF16 en parámetros principales; FP32 en controles de Mamba y del router |
| Optimizador | Muon para parámetros matriciales con respaldo AdamW; sin weight decay en A_log, D y dt_bias |
| Revisión declarada | checkpoint-tokens-000000000000-init (0 objetivos válidos consumidos, 0 pasos de optimizador) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El backbone combina dos familias de mezcladores de secuencia en una pila de 13 capas. Nueve capas usan Mamba-2 con el algoritmo SSD (state space duality): expansión 2, 32 cabezas de 64 canales, dimensión de estado 128, 8 grupos para las proyecciones B/C y una convolución causal en profundidad con kernel 4. Las cuatro capas restantes son Gated MLA en modo posicional NoPE, es decir, atención latente multi-cabeza sin codificación posicional explícita y con puerta de salida retenida. La capa de mezcla de expertos es un Stable LatentMoE con 64 expertos enrutados, 2 expertos compartidos y top-k 4, lo que explica la diferencia entre los 1,02 B parámetros totales y los 355 M activos. La cabeza de lenguaje no está atada a las embeddings del tokenizador.

En cuanto al entrenamiento, la model card describe un protocolo comparativo con schedule de mezcla tokenizada, orden de datos, semilla y regla de inicialización comunes a las cuatro variantes Mamba y a la referencia Mini-K3-1H. Los checkpoints intermedios se registran a 0,5 B, 1 B, 2 B, 4 B, 8 B y 12 B objetivos válidos, y la etiqueta final `checkpoint-tokens-016000000000-final` solo se crea tras alcanzar exactamente 16.000.000.000 objetivos y superar la validación final. No hay post-entrenamiento (ni RLHF ni DPO). La innovación técnica documentada con más detalle es el aislamiento estricto de documentos en el empaquetado: MLA usa atención causal específica por documento y Mamba-2 recibe los mismos identificadores indexados tanto en la convolución causal como en el escaneo SSD, con la suma acumulada FP32 de dA implementada como segmented scan que arranca en cero exacto en cada frontera de documento, evitando que un prefijo redondeado de un documento anterior altere las salidas BF16 de los posteriores. La revisión publicada en este repositorio es la de inicialización, con 0 tokens y 0 pasos de optimizador.

## Capacidades

- Generación de texto autoregresiva solo texto, con vocabulario de 163.840 tokens y ventana de 8.192 tokens.
- Modelado de secuencias largas mediante estado recurrente de Mamba-2, con coste de memoria de estado constante respecto a la longitud en las capas SSM.
- Atención latente (MLA) en cuatro capas, con atención causal específica por documento cuando se trabaja con documentos empaquetados.
- Enrutamiento disperso tipo MoE con 64 expertos enrutados, 2 compartidos y top-k 4, útil para estudiar balanceo de carga y especialización de expertos.
- Capacidades multilingües: no disponible; la model card no especifica la composición idiomática del dataset ni del tokenizador más allá del tamaño de vocabulario.
- Tool calling / function calling: no disponible; no se declara ni se ha entrenado para ello.
- Comportamiento de agente y razonamiento multi-paso: no disponible.
- Modo "thinking", visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Inferencia de referencia diferenciable del camino forward de Mamba, pensada para depuración contra el kernel SSD fusionado del sistema de entrenamiento.

## Casos de uso

- Ablación de mezcladores de secuencia: comparar Mamba-2/SSD frente a KDA manteniendo constante el schedule de datos, la semilla, el tokenizador y la inicialización común, y medir el efecto sobre la pérdida de validación en cada checkpoint intermedio (0,5 B a 16 B objetivos).
- Reproducción de preentrenamiento a escala reducida: arrancar desde el checkpoint de inicialización y reproducir el protocolo declarado (secuencia 8.192, batch local 5 / global 80, Muon con respaldo AdamW) para validar recetas antes de escalar a modelos mayores.
- Validación de aislamiento de documentos en entrenamiento empaquetado: usar los gates de aislamiento de forward, gradiente de entrada y gradiente de parámetros descritos en `training/` para verificar que ningún documento contamina el estado recurrente de otro.
- Desarrollo de kernels SSD: contrastar el forward portable y diferenciable incluido en el repositorio con el kernel SSD fusionado del sistema de entrenamiento, y usar el smoke test de 8K con batch 5 como control de regresión.
- Estudio de enrutamiento MoE: analizar la distribución de activaciones de los 64 expertos enrutados con top-k 4 y detectar colapso de expertos o desequilibrios de carga en un modelo de 355 M parámetros activos.
- Prototipado de arquitecturas híbridas en una sola GPU: al ocupar alrededor de 2 GB en BF16, permite iterar sobre cambios en la proporción de capas SSM frente a capas de atención sin clúster.
- Base para experimentos de post-entrenamiento: punto de partida de bajo coste para probar SFT o DPO en un backbone MoE híbrido, siempre que se complete antes el preentrenamiento, ya que este checkpoint no lo incluye.
- Banco de pruebas de tokenizador y pipeline de datos: validar el esquema de vocabulario (163.840 entradas, tokens especiales en 163.584/163.586/163.839) y la tokenización de documentos largos antes de reutilizarlos en modelos de la familia Kimi-K3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la NLL/perplejidad de entrenamiento y los diagnósticos a nivel de fuente están en los registros de ejecución, pero no incluye cifras en el repositorio ni en los resultados de búsqueda consultados. El autor advierte explícitamente de que los resultados a este tamaño, mezcla de datos y longitud de fila de 8K necesitan confirmación antes de extrapolarse a Kimi-K3 completo u otros sistemas Mamba.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,04 GB (1.018.756.960 parámetros × 2 bytes), coherente con el tamaño de repositorio de 2,0 GB.
- VRAM estimada para inferencia: alrededor de 2,5 a 3 GB en BF16 incluyendo activaciones y estados, cifra estimada y no confirmada por el autor. En FP32 la cifra se duplicaría hasta unos 4,1 GB solo de pesos.
- Estado recurrente de Mamba-2: para 32 cabezas × 64 canales × dimensión de estado 128, el estado por capa y secuencia es de 262.144 elementos; en FP32 son unos 1 MB por capa, aproximadamente 9 MB por secuencia en las 9 capas SSM. Estimación propia, no publicada en la model card.
- Caché de atención MLA: no disponible; la model card no documenta la dimensión latente, por lo que no se puede calcular con rigor.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4080, RTX 4090). No requiere A100 ni H100 para inferencia, aunque para reproducir el preentrenamiento completo hasta 16 B objetivos sí es razonable usar aceleradores profesionales por coste y tiempo.
- Cabe en GPU consumer: sí, con margen amplio en 8 GB si se usa BF16 y sin contexto excesivo.
- Opciones de despliegue: PyTorch nativo con `trust_remote_code=True` y los ficheros `configuration_mini_k3.py`, `modeling_mini_k3.py` y `mamba2_mixer.py` del repositorio. No hay soporte declarado en vLLM, TGI, llama.cpp ni Ollama, y tampoco se publican pesos GGUF, por lo que integrar el modelo en esos motores requeriría portar la arquitectura híbrida.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Arquitectura | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Mini-K3-1H-mamba2-n128-g8 (este) | 1,02 B | 355 M | 8.192 | Híbrida Mamba-2 + Gated MLA con MoE | no disponible | no disponible |
| TinyLlama-1.1B (referencia) | 1,1 B | 1,1 B | 2.048 | Transformer denso | Apache 2.0 | publicados por el autor |
| Qwen2.5-1.5B (referencia) | 1,5 B | 1,5 B | 32.768 | Transformer denso | Apache 2.0 | publicados por el autor |
| Llama-3.2-1B (referencia) | 1,23 B | 1,23 B | 128.000 | Transformer denso | Llama 3.2 Community License | publicados por el autor |

Los datos de las tres alternativas provienen de sus propias fichas públicas y se incluyen solo como referencia de categoría; no se dispone de cifras comparables de este checkpoint. Como alternativas de arquitectura de espacio de estados a mayor escala existen Falcon Mamba 7B y Codestral Mamba 7B, pero no se dispone en la información proporcionada de datos suficientes para una comparación rigurosa de parámetros, contexto o licencia frente a este modelo.

## Limitaciones y advertencias

- Checkpoint de inicialización: la model card declara la revisión `checkpoint-tokens-000000000000-init` con 0 objetivos válidos consumidos y 0 pasos de optimizador. Si los pesos del repositorio corresponden a esa revisión, la generación de texto no será coherente, ya que el modelo no ha visto datos.
- Sin post-entrenamiento: no hay RLHF, DPO ni ajuste por instrucciones, por lo que no es un asistente utilizable directamente.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no se especifica la composición idiomática del dataset ni del tokenizador, de modo que no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Contexto limitado a 8.192 tokens durante el entrenamiento; no se documentan métodos de extensión de contexto.
- Riesgo de alucinación no evaluable: sin preentrenamiento y sin evaluación publicada no existen medidas de fidelidad factual.
- Código personalizado: cargar el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisar `modeling_mini_k3.py`, `configuration_mini_k3.py` y `mamba2_mixer.py` antes de usarlo en entornos controlados.
- Discrepancia a verificar: se declaran 13 capas de decodificador pero los índices de capa listados abarcan de 1 a 13, sin índice 0; conviene comprobar la correspondencia real en `config.json` antes de asumir la distribución de capas.
- Sin validación de la comunidad: el repositorio tenía 0 descargas y 0 likes en el momento de la consulta, por lo que no existe contraste externo de los resultados.
- Advertencia del propio autor: los resultados obtenidos a este tamaño, mezcla de datos y longitud de fila de 8K no deben extrapolarse sin confirmación a Kimi-K3 completo ni a otros sistemas Mamba.
- Los resultados de la búsqueda web no contienen información relevante sobre el modelo: las entradas devueltas corresponden a centros educativos franceses y no guardan relación con esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n128-g8-v1_B
- Ficheros de modelado incluidos en el repositorio: `config.json`, `configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py` (bajo https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n128-g8-v1_B/tree/main)
- Manifiestos de entrenamiento, recetas y registros de gates: carpeta `training/` del mismo repositorio (https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n128-g8-v1_B/tree/main/training)
- Paper, blog, repositorio de código o demo adicionales: no disponible; la búsqueda web realizada no devolvió enlaces relacionados con el modelo.
