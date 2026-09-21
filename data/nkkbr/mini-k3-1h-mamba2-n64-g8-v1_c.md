# nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C

## Resumen

Mini-K3-1H-mamba2-n64-g8-v1_C es un checkpoint de investigación de tipo texto publicado por el usuario nkkbr dentro de la familia de ablaciones Mini-K3, una línea de trabajo inspirada en Kimi-K3. Se trata de una variante arquitectónica del backbone Mini-K3-1H en la que nueve mezcladores de secuencia KDA se sustituyen por mezcladores Mamba-2/SSD, manteniendo intactas las cuatro capas NoPE Gated MLA, el Stable LatentMoE, el mecanismo Block-4 Attention Residuals, el tokenizador y la cabeza de lenguaje no atada. El objetivo declarado es estudiar el efecto del intercambio de mezcladores de secuencia, no reproducir el esquema de bloques de NVIDIA Nemotron.

El modelo tiene 13 capas de decodificador con anchura oculta de 1024 y 1.009.273.696 parámetros lógicos totales, de los cuales 346.049.376 se consideran activos según la definición del proyecto. La capa MoE enruta hacia 64 expertos enrutados más 2 compartidos con top-k 4. El vocabulario es de 163.840 entradas. La longitud de secuencia de entrenamiento documentada es de 8.192 tokens y los pesos principales están en BF16, con los controles de Mamba y del router en FP32.

Es relevante ahora porque se enmarca en la tendencia de arquitecturas híbridas que combinan atención con modelos de espacio de estados para reducir el coste del contexto largo. Ahora bien, el repositorio apunta a la revisión inmutable `checkpoint-tokens-000000000000-init`, con 0 objetivos válidos de siguiente token consumidos y 0 pasos de optimizador: es decir, la revisión publicada corresponde a la inicialización aleatoria previa al entrenamiento, no al checkpoint final de 16.000 millones de tokens. Además, no incluye post-entrenamiento y no es un asistente instruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 9 capas Mamba-2/SSD + 4 capas Gated MLA con NoPE, sobre backbone Mini-K3-1H con bloque MoE (Stable LatentMoE) y Block-4 Attention Residuals |
| Parametros totales | 1.009.273.696 |
| Parametros activos | 346.049.376 (definición del proyecto; MoE con 64 expertos enrutados + 2 compartidos, top-k 4) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); no se documenta soporte por encima de ese valor |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos principales en BF16 y controles en FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), junto con `config.json`, `configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py` y ficheros de tokenizador |
| Anchura oculta / capas | 1024 / 13 |
| Índices de capas Mamba-2 | [1, 2, 3, 5, 6, 7, 9, 10, 11] |
| Índices de capas Gated MLA | [4, 8, 12, 13] |
| Configuración Mamba-2 | Expansión 2; 32 cabezas × 64 canales; dimensión de estado 64; grupos B/C 8; convolución causal depthwise de kernel 4 |
| Vocabulario / BOS / EOS / PAD | 163840 / 163584 / 163586 / 163839 |
| Longitud de secuencia y batch de entrenamiento | 8.192 tokens; batch local 5 / global 80 |
| Revision publicada | `checkpoint-tokens-000000000000-init` (0 objetivos válidos consumidos, 0 pasos de optimizador) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 13 capas. Nueve de ellas usan mezcladores Mamba-2/SSD con expansión 2, 32 cabezas de 64 canales cada una, dimensión de estado 64, grupos B/C de tamaño 8 y una convolución causal depthwise de kernel 4. Las cuatro capas restantes son Gated MLA en modo posicional NoPE y conservan la puerta de salida. El bloque de mezcla de expertos es un Stable LatentMoE con 64 expertos enrutados y 2 compartidos, con top-k 4. El mecanismo Block-4 Attention Residuals, el tokenizador y la cabeza de lenguaje no atada se mantienen idénticos al diseño de referencia Mini-K3-1H. El autor indica explícitamente que se trata de una ablación dentro del backbone Mini-K3 y no de una reproducción del esquema de bloques de NVIDIA Nemotron.

En cuanto al entrenamiento, el autor documenta un presupuesto total de 16.000 millones de objetivos válidos, con checkpoints intermedios en 0,5B, 1B, 2B, 4B, 8B y 12B, y un checkpoint final etiquetado `checkpoint-tokens-016000000000-final`. El optimizador combina Muon para parámetros matriciales con AdamW como respaldo, y exime de weight decay a `A_log`, `D` y `dt_bias` de Mamba. Las cuatro variantes Mamba y la referencia Mini-K3-1H comparten la misma mezcla tokenizada congelada, el mismo orden de datos, la misma semilla y la misma regla de inicialización, de modo que los parámetros compartidos con nombre y forma idénticos arrancan igual; las nuevas proyecciones conjuntas y controles de estado de Mamba se inicializan de forma independiente pero determinista. Los documentos empaquetados están aislados causalmente: MLA usa atención causal específica por documento y Mamba-2 recibe los identificadores de documento indexados tanto en la convolución causal como en el barrido SSD, reiniciando el historial convolucional y el estado recurrente en cada frontera. El autor reporta que la diferencia entre el procesado empaquetado y el lanzado por separado está acotada en 0,03125 (ULPs de BF16 debidos al árbol de reducción en FP32) y no crea rutas de gradiente entre documentos, verificado con pruebas multi-frontera, multi-semilla, una puerta de kernels fusionados y tres actualizaciones reales de 8K/B5 antes del entrenamiento formal. No se incluye post-entrenamiento ni estado del optimizador. Como innovación destacable, el repositorio separa una ruta Mamba diferenciable de referencia de un sistema de entrenamiento que usa un kernel SSD fusionado fijado tras la validación.

## Capacidades

- Generación de texto autoregresiva sobre un vocabulario de 163.840 entradas; es un checkpoint de investigación preentrenado, no un modelo instruido.
- Mezcla de secuencia híbrida: atención MLA en capas [4, 8, 12, 13] y recurrencia Mamba-2/SSD en [1, 2, 3, 5, 6, 7, 9, 10, 11], lo que permite estudiar el equilibrio entre atención y estado recurrente.
- Computación con dispersión de expertos: 64 expertos enrutados y 2 compartidos con top-k 4, con 346.049.376 parámetros activos de 1.009.273.696 lógicos.
- Aislamiento causal por documento en secuencias empaquetadas, con reinicio de convolución y estado recurrente en cada frontera de documento.
- Carga reproducible del modelo sin el entorno de entrenamiento: `model.safetensors` va acompañado de `config.json`, `configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py` y el tokenizador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no hay post-entrenamiento ni ajuste por instrucciones).
- Capacidades multilingües: no disponible (no se documenta la composición idiomática del corpus ni el comportamiento por idioma).
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles; el checkpoint es exclusivamente de texto.

## Casos de uso

- Ablación arquitectónica controlada: comparar los nueve mezcladores Mamba-2 frente a los KDA del baseline Mini-K3-1H manteniendo congelados el tokenizador, el orden de datos, la semilla y la inicialización común, de modo que la única variable sea el mezclador de secuencia.
- Estudio del coste de contexto en arquitecturas híbridas: medir memoria de estado recurrente frente a caché KV de MLA en secuencias de 8.192 tokens, útil para decidir qué proporción de capas conviene asignar a recurrencia en diseños futuros.
- Validación de aislamiento causal en entrenamiento con documentos empaquetados: el repositorio incluye puertas de verificación (multi-frontera, multi-semilla, kernel fusionado) reutilizables para auditar que ningún documento filtre gradiente hacia documentos anteriores.
- Banco de pruebas de kernels SSD: comparar la ruta Mamba diferenciable de referencia con el kernel SSD fusionado fijado, midiendo divergencia numérica en BF16 con el límite de 0,03125 documentado.
- Investigación sobre recetas de optimizador: el uso de Muon para matrices con respaldo AdamW y la exención de weight decay en `A_log`, `D` y `dt_bias` sirven como caso reproducible para estudiar estabilidad de entrenamiento en modelos híbridos.
- Preentrenamiento continuado o ajuste supervisado de dominio: al ser un checkpoint de 1B parámetros entrenable en un solo nodo, puede servir de punto de partida para experimentos de adaptación, siempre que la licencia (no publicada) lo permita.
- Evaluación de tokenizadores de vocabulario grande: con 163.840 entradas y tokens especiales definidos (BOS 163584, EOS 163586, PAD 163839), permite medir la eficiencia de compresión de corpus multilingües o de código antes de escalar el modelo.
- Docencia y reproducibilidad: el paquete independiente (`config.json`, `modeling_mini_k3.py`, `mamba2_mixer.py`) permite inicializar el modelo aleatoriamente sin el checkout de entrenamiento, útil para cursos o réplicas de arquitecturas híbridas.
- Estimación de requisitos de despliegue: al ocupar aproximadamente 2,02 GB en BF16, sirve para calibrar presupuestos de VRAM y latencia de arquitecturas híbridas en GPUs de consumo antes de trasladar los resultados a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica que los registros de NLL/perplexity de entrenamiento y los diagnósticos a nivel de fuente están en los logs de la ejecución (carpeta `training/`), pero no se incluyen valores numéricos en la información proporcionada. Tampoco se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni comparaciones cuantitativas con el baseline Mini-K3-1H.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,02 GB (1.009.273.696 parámetros × 2 bytes). En FP32, aproximadamente 4,04 GB. Estas cifras se derivan aritméticamente del recuento de parámetros; el autor no publica medidas de VRAM.
- Cabe en GPU de consumo: sí, en BF16 con overhead de activaciones y estado recurrente cabe holgadamente en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Con cuantización a 8 bits (≈1,01 GB) o 4 bits (≈0,51 GB) el margen es mayor, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas para investigación a escala: A100 40/80 GB, H100, L40S o RTX 4090 para entrenamiento o evaluación con batches mayores. Para inferencia de una sola petición, una GPU consumer moderna es suficiente.
- Entrenamiento: el recipe usa batch local 5 / global 80 con secuencias de 8.192 tokens, BF16 para los parámetros principales y FP32 para los controles de Mamba y del router. No se documenta el número de GPUs ni el tiempo de entrenamiento empleado.
- Opciones de despliegue: carga mediante PyTorch y el código de modelado incluido en el repositorio (`modeling_mini_k3.py`, `mamba2_mixer.py`). El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible, y es probable que requiera integración específica al tratarse de una arquitectura híbrida con kernel SSD fusionado.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se identificaron en la información proporcionada modelos comparables con datos verificables, y la búsqueda web asociada no devolvió resultados relevantes. A modo de encuadre cualitativo, la tabla siguiente sitúa el checkpoint frente a otras arquitecturas híbridas de la misma escala, marcando como no verificado todo dato que no procede de la información suministrada.

| Modelo | Parámetros | Naturaleza | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C | 1.009.273.696 totales / 346.049.376 activos | Híbrido Mamba-2/SSD + Gated MLA NoPE con MoE, ablación de investigación | 8.192 (entrenamiento) | no disponible | Hugging Face, 0 descargas |
| Mini-K3-1H (referencia del mismo autor) | No disponible en la información proporcionada | Backbone con mezcladores KDA en lugar de Mamba-2 | No disponible | no disponible | No confirmada en la información proporcionada |
| Otras arquitecturas híbridas de ~1-1,5B (por ejemplo, familias Mamba-2 o Zamba) | No verificado | Híbridos o SSM puros de escala comparable | No verificado | No verificado | No verificado |
| Modelos transformer densos de ~1B con post-entrenamiento | No verificado | Asistentes instruidos | No verificado | No verificado | No verificado |

La comparación de rendimiento no puede establecerse porque este repositorio no publica métricas y porque la revisión publicada corresponde a la inicialización, no al modelo entrenado.

## Limitaciones y advertencias

- La revisión publicada es `checkpoint-tokens-000000000000-init`, con 0 objetivos válidos de siguiente token consumidos y 0 pasos de optimizador: los pesos corresponden a una inicialización aleatoria, por lo que la generación de texto será incoherente. El checkpoint final (`checkpoint-tokens-016000000000-final`) se describe en la model card, pero no forma parte de los datos disponibles del repositorio.
- No incluye post-entrenamiento, RLHF, DPO ni ajuste por instrucciones. No debe usarse como asistente conversacional ni en producción orientada a usuario final.
- El propio autor advierte que es un proxy de investigación pequeño y que los resultados a esta escala, mezcla de datos y longitud de fila de 8K necesitan confirmación antes de extrapolarse a Kimi-K3 completo u otros sistemas Mamba.
- La licencia no está disponible, lo que impide determinar si se permite el uso comercial. Cualquier despliegue en producción queda sujeto a aclarar la licencia con el autor.
- No se documentan idiomas soportados ni composición del dataset de entrenamiento (solo se menciona una "mezcla tokenizada congelada"), por lo que se desconocen sesgos, cobertura idiomática y sesgos de dominio.
- No se publican benchmarks, curvas de pérdida ni valores de perplexidad, de modo que no es posible verificar la calidad del modelo ni compararlo objetivamente con alternativas.
- Riesgo de alucinación: no evaluado. Al no haber post-entrenamiento ni evaluación publicada, no hay datos sobre fidelidad factual.
- Limitación de contexto: 8.192 tokens es la longitud de secuencia de entrenamiento; no se documenta extensión por encima de ese valor ni extrapolación posicional (las capas MLA usan NoPE, por lo que el comportamiento más allá del contexto entrenado no está caracterizado).
- El estado recurrente de Mamba-2 se reinicia en cada frontera de documento durante el entrenamiento; no se especifica cómo se comporta este mecanismo en inferencia interactiva multi-turno.
- Diferencias numéricas conocidas: el procesado empaquetado y el lanzado por separado pueden diferir hasta 0,03125 en BF16 por el árbol de reducción en FP32. Es una desviación acotada, pero conviene tenerla en cuenta en réplicas experimentales.
- El estado del optimizador no se publica, lo que impide reanudar el entrenamiento desde el punto documentado.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los resultados.
- La búsqueda web asociada no devolvió ninguna fuente relacionada con el modelo (los resultados obtenidos eran páginas sobre puntuaciones de acceso universitario en Turquía, sin relación alguna), por lo que no existe documentación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C
- Ficheros de configuración y modelado: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C/blob/main/config.json , https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C/blob/main/configuration_mini_k3.py , https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C/blob/main/modeling_mini_k3.py , https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C/blob/main/mamba2_mixer.py
- Pesos: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C/blob/main/model.safetensors
- Registros de entrenamiento y puertas de validación citados en la model card: carpeta `training/` del repositorio (https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C/tree/main/training)
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo.
