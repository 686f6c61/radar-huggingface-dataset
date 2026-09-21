# nkkbr/Mini-K3-1H-decay-g32-v2_C

## Resumen

Mini-K3-1H-decay-g32-v2_C (identificador de repositorio `nkkbr/Mini-K3-1H-decay-g32-v2_C`, titulado internamente como Mini-K3-1H-decay-g32) es un checkpoint de preentrenamiento de investigación, de aproximadamente 1.015 millones de parámetros lógicos, publicado por el usuario nkkbr. Forma parte de una comparación controlada de 20 arquitecturas que retiene los operadores KDA y Gated MLA de Kimi-K3, junto con Attention Residuals por bloques, Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing. Se trata de un proxy pequeño cuyo objetivo es estudiar decisiones de arquitectura antes de extrapolarlas al Kimi-K3 completo.

El modelo es un transformer decodificador híbrido de 13 capas: 9 capas con KDA (atención lineal con decaimiento y convolución causal por cabezas) y 4 capas con Gated MLA sin codificación posicional explícita (NoPE). Usa mezcla de expertos con 64 expertos enrutados, 2 compartidos y top-k 4, de forma que activa 352 millones de parámetros por token sobre un total lógico de 1.015 millones. La longitud de secuencia de entrenamiento es de 8.192 tokens y el vocabulario es de 163.840 entradas.

El detalle crítico para cualquier evaluación es que este repositorio contiene únicamente el checkpoint de inicialización: la etiqueta publicada es `checkpoint-tokens-000000000000-init`, con 0 objetivos de pérdida consumidos y 0 pasos de optimizador completados. No ha recibido post-entrenamiento ni evaluación en tareas downstream, por lo que no debe tratarse como un asistente. Su interés es reproducibilidad: la ejecución se recuperó tras un fallo de serialización del parámetro `dt_bias` y reinicia desde cero con el mismo orden de datos congelado, la misma semilla (20260914) y la misma receta de optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador híbrido KDA + Gated MLA con MoE (Stable LatentMoE); 13 capas: 9 KDA (índices 1, 2, 3, 5, 6, 7, 9, 10, 11) y 4 Gated MLA (índices 4, 8, 12, 13) |
| Parámetros totales | 1.015.443.052 (dato real del safetensors) |
| Parámetros activos | 352.218.732 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se declara ventana de inferencia distinta) |
| Tipos de cuantización | No disponible (solo se publican pesos en BF16; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible (vocabulario de 163.840 entradas; el autor no declara cobertura lingüística) |
| Licencia | No disponible (la model card no especifica licencia; las fuentes de datos conservan sus propias licencias y no se redistribuye su texto) |
| Formato de pesos | safetensors (`model.safetensors`), BF16 para los pesos, con decaimiento KDA, convolución, normalización y estado de control del router en FP32 |

Otras especificaciones relevantes:

| Parámetro | Valor |
|---|---|
| Anchura oculta / cabezas de atención / anchura de cabeza KDA | 1024 / 12 / 128 |
| Kernel de convolución causal depthwise en KDA | 4 |
| Grupos de decaimiento KDA por cabeza | 32 (contiguos) |
| Modo posicional de MLA | NoPE (sin codificación posicional); puerta de salida activada |
| Capas densas antes del MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Anchura oculta del experto enrutado | 512 |
| Tamano de bloque de Attention Residual | 4 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Revisión publicada | `checkpoint-tokens-000000000000-init` (0 tokens válidos, 0 pasos de optimizador) |
| Revisión final prevista | `checkpoint-tokens-016000000000-final` (tras 16.000.000.000 objetivos de pérdida válidos) |
| Estado del optimizador | Deliberadamente no publicado |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención en un mismo decodificador. Las capas KDA implementan atención lineal con un decaimiento por cabeza dividido en 32 grupos contiguos y una convolución causal depthwise de kernel 4; el estado recurrente y el historial de la convolución corta de Q/K/V se reinician en cada frontera de segmento, lo que permite empaquetar documentos con aislamiento estricto. Las capas Gated MLA usan atención latente con puerta de salida y modo posicional NoPE, y emplean una máscara causal bloqueada por documento. Los bloques de Attention Residual operan con tamaño 4. La capa MoE usa enrutamiento con puntuaciones sesgadas para seleccionar expertos y las combina con puntuaciones sigmoideas sin sesgo renormalizadas, con 64 expertos enrutados, 2 compartidos y top-k 4 sobre una anchura de experto de 512.

La receta de entrenamiento es la siguiente: Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0.1, QK-Clip por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. No se aplicó post-entrenamiento (ni RLHF ni DPO). Todos los runs de la comparativa usan inicialización canónica por nombre y forma con semilla base 20260914, de modo que los parámetros compartidos entre dos arquitecturas con el mismo nombre semántico y la misma forma comienzan byte a byte idénticos; los parámetros exclusivos de variante o con forma distinta reciben sus propios flujos deterministas. Los manifiestos JSON del repositorio contienen las revisiones exactas de las fuentes, las cuotas de tokens, los hashes de los planes, la configuración del optimizador y los hashes del split de validación.

## Capacidades

Advertencia previa: el checkpoint publicado está en estado de inicialización (0 tokens procesados). Las capacidades que se enumeran a continuación describen lo que la arquitectura está diseñada para soportar, no un comportamiento verificado en este checkpoint.

- Generación de texto autoregresiva: la arquitectura es un decodificador causal con vocabulario de 163.840 entradas y pipeline `text-generation`, pero sin entrenamiento efectivo la salida no será coherente.
- Atención lineal de contexto largo: las capas KDA mantienen estado recurrente con coste de memoria constante respecto a la longitud de secuencia, lo que en teoría habilita eficiencia en secuencias largas frente a la atención cuadrática.
- Mezcla de expertos dispersa: 64 expertos enrutados con top-k 4 y 2 expertos compartidos, con 352 millones de parámetros activos por token sobre 1.015 millones totales.
- Capacidad multilingüe: no disponible (el autor no declara idiomas; el tamaño del vocabulario sugiere un tokenizador amplio, sin confirmación).
- Tool calling / function calling: no disponible (no se ha entrenado para ello ni se documenta plantilla de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin post-entrenamiento ni evaluación).
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; el modelo es explícitamente solo texto.
- Capacidad de investigación: reproducibilidad de arquitectura y comparación controlada entre 20 variantes con inicialización determinista.
- Capacidad de serialización portable: el paquete incluye `modeling_mini_k3.py` y `configuration_mini_k3.py`, que definen la arquitectura sin depender del checkout original de entrenamiento.

## Casos de uso

- Estudio de ablaciones de arquitectura: usar este checkpoint como punto de partida neutro para comparar la variante de 32 grupos de decaimiento frente a las otras 19 arquitecturas de la familia, ya que todas parten de una inicialización con semilla y orden de datos idénticos.
- Verificación de reproducibilidad de la inicialización: comprobar que los parámetros compartidos entre variantes comienzan byte a byte idénticos con la semilla 20260914 y el esquema de claves por nombre y forma.
- Depuración de serialización portable: reproducir el fallo original de layout de `dt_bias` entre el formato de entrenamiento y el formato portable, y validar la corrección introducida en esta ejecución de recuperación.
- Pruebas de humo de infraestructura: ejecutar `initialize_model.py` y `smoke_test.py` para validar que el pipeline de carga, el reparto de capas y el enrutamiento MoE funcionan antes de lanzar un entrenamiento a gran escala.
- Benchmarking de servidores de inferencia con MoE disperso: medir consumo de memoria y latencia de decodificación de un modelo de 1.000 millones de parámetros con solo 352 millones activos, útil para dimensionar infraestructura antes de escalar.
- Análisis del enrutador y de la especialización de expertos: inspeccionar estadísticas de selección, sesgos y renormalización sigmoidea sobre un modelo sin sesgo aprendido, como línea base para comparar con checkpoints ya entrenados.
- Reanudación de preentrenamiento: continuar el entrenamiento desde el checkpoint de inicialización aplicando la misma receta (Muon por cabeza, AdamW de respaldo, Quantile Balancing), teniendo en cuenta que el estado del optimizador no se publica.
- Validación de aislamiento de documentos en datos empaquetados: verificar que el reinicio del estado recurrente KDA y del historial de convolución corta en cada frontera de segmento evita contaminación entre documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que se trata de un checkpoint intermedio de investigación que no ha sido evaluado en tareas downstream y que las métricas registradas (NLL y perplejidad sobre un conjunto de desarrollo fijo) están en W&B y en los ficheros JSONL de métricas de la ejecución, no en el repositorio de HuggingFace. Tampoco hay comparaciones publicadas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 2,0 GB (coincide con el tamaño del repositorio); con los estados de control en FP32 el consumo base ronda los 2,5 GB. Hay que sumar activaciones y caché de estado KDA, que crecen con la longitud de secuencia hasta 8.192 tokens.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede alojar el modelo en BF16 para secuencias cortas. Para lotes grandes o la ventana completa de 8.192 tokens son preferibles 16-24 GB (RTX 4090, L4, A10G). Para entrenamiento o preentrenamiento continuado se recomiendan A100 o H100 por el coste de memoria del optimizador, no por el tamaño del modelo.
- ¿Cabe en GPU de consumo? Sí. RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes para inferencia en BF16 con lotes moderados. En GPUs de 6-8 GB habría que recurrir a cuantización manual, que no está publicada.
- Opciones de despliegue: no hay soporte confirmado en vLLM, TGI, llama.cpp, Ollama u otros servidores estándar. El repositorio distribuye código propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`) pensado para ejecución directa con PyTorch. Cualquier integración en un motor de inferencia requeriría portar los operadores KDA, Gated MLA y Stable LatentMoE.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia, throughput ni consumo de memoria para este checkpoint.
- Almacenamiento: 2,0 GB para los pesos; hay que prever espacio adicional para estados de control en FP32 y para los manifiestos y el código incluidos.

## Comparativa con modelos similares

El autor no publica comparaciones con otros modelos, y este checkpoint no tiene benchmarks que permitan situarlo frente a alternativas. La tabla siguiente compara únicamente especificaciones estructurales frente a modelos densos de tamaño similar ampliamente conocidos. Los datos de las alternativas provienen de sus fichas públicas y no se han verificado en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mini-K3-1H-decay-g32-v2_C | 1,02 B lógicos / 352 M activos (MoE) | 8.192 (entrenamiento) | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-1.5B | 1,54 B densos | 32.768 | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Llama 3.2 1B | 1,24 B densos | 128.000 | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| TinyLlama-1.1B | 1,1 B densos | 2.048 | Apache 2.0 | HuggingFace, ampliamente desplegado |

Diferencias estructurales relevantes: frente a los tres modelos densos de la comparación, Mini-K3-1H es un MoE con atención híbrida (lineal KDA más MLA latente) y sin codificación posicional en las capas MLA. También carece de post-entrenamiento and de licencia declarada, mientras que las alternativas están alineadas para instrucciones y publican licencias explícitas. Comparado con otros miembros de la familia Mini-K3, la única diferencia controlada documentada es la granularidad de decaimiento KDA de 32 grupos por cabeza, junto con el proceso de recuperación de la serialización de `dt_bias`. No hay datos de rendimiento que permitan ordenar estos modelos.

## Limitaciones y advertencias

- Checkpoint sin entrenar: la revisión publicada tiene 0 tokens válidos consumidos y 0 pasos de optimizador. Las salidas serán incoherentes, repetitivas o directamente aleatorias; no sirve como modelo generativo funcional.
- No es un asistente: la model card indica explícitamente que no debe tratarse como un modelo que sigue instrucciones. No hay ajuste por instrucciones, RLHF ni DPO.
- Sin evaluación downstream: no existen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea pública. Las únicas métricas son NLL y perplejidad sobre un conjunto de desarrollo fijo, registradas externamente en W&B.
- Riesgo de alucinación: no aplicable en el sentido habitual, dado que el modelo no ha aprendido nada del corpus; cualquier texto generado es ruido, no una alucinación sobre conocimiento aprendido.
- Sesgos: no disponible. Al no haber entrenamiento efectivo ni evaluación, no hay caracterización de sesgos. Cuando se complete el preentrenamiento, los sesgos dependerán del corpus, cuyas licencias y composición no se redistribuyen en este repositorio.
- Limitaciones de contexto: la longitud documentada es de 8.192 tokens, correspondiente a la secuencia de entrenamiento. No se declara capacidad de extrapolación a contextos mayores.
- Limitaciones de idioma: no se declara ningún idioma soportado, y no hay evaluación multilingüe.
- Licencia no disponible: la model card no especifica licencia para el modelo ni para los pesos. Esto impide determinar si el uso comercial está permitido; hay que contactar con el autor antes de cualquier uso en producción. Las fuentes de datos conservan sus propias licencias, que no se redistribuyen.
- Extrapolación limitada: el propio autor advierte de que las conclusiones sobre rankings de arquitectura a esta escala (aproximadamente 1.000 millones de parámetros) y con longitud de entrenamiento de 8.192 tokens necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Estado del optimizador no publicado: no es posible reanudar el entrenamiento con la misma trayectoria de optimizador; habría que reconstruirla.
- Soporte de herramientas limitado: al no haber integración con vLLM, llama.cpp, Ollama ni TGI, cualquier despliegue requiere usar el código PyTorch incluido o portar la arquitectura.
- Fechas de publicación: el repositorio figura creado y actualizado el 21 de septiembre de 2026, y la etiqueta final prevista exige procesar 16.000 millones de tokens. Conviene comprobar si existen revisiones posteriores a la de inicialización antes de usarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g32-v2_C
- Ficheros incluidos en el repositorio: `model.safetensors`, `config.json`, `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md` (cuando está presente) y los manifiestos JSON de la ejecución.
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces relacionados con el modelo: los resultados correspondían a calendarios de torneos de golf (PGA Tour y ESPN) y no guardan relación con este repositorio.
