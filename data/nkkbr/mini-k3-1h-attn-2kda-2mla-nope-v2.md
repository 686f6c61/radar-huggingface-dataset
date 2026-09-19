# nkkbr/Mini-K3-1H-attn-2kda-2mla-nope-v2

## Resumen

Mini-K3-1H-attn-2kda-2mla-nope-v2 es un checkpoint de preentrenamiento de investigación publicado por el usuario nkkbr en HuggingFace. Se trata de un modelo de texto de aproximadamente mil millones de parámetros lógicos (1.005.084.424 exactos según los pesos safetensors) que forma parte de una comparación controlada de 20 arquitecturas derivadas de Kimi-K3. El objetivo no es ofrecer un asistente utilizable, sino servir de proxy a pequeña escala para estudiar decisiones de arquitectura: proporción entre atención lineal y MLA, granularidad del decaimiento, longitud de convolución y codificación posicional.

La arquitectura es un decoder-only híbrido de 13 capas que combina 6 capas KDA (atención lineal con decaimiento, recurrente) y 7 capas Gated MLA (atención latente con puerta de salida y modo posicional NoPE), más un MoE tipo Stable LatentMoE con 64 expertos enrutados y 2 compartidos, top-k 4. Conserva operadores de la familia Kimi-K3 como Attention Residuals, activaciones SiTU y Quantile Balancing. Con 341.860.104 parámetros activos por token, el coste de cómputo por token es el de un modelo denso de ~342 M, mientras que la memoria de pesos corresponde a ~1.005 M.

Es relevante ahora por dos motivos. Primero, porque las arquitecturas híbridas de atención lineal más MoE son una de las líneas activas para reducir el coste del contexto largo, y este repositorio publica la receta de inicialización, los manifiestos y el código standalone para reproducir el experimento. Segundo, porque es un artefacto explícitamente intermedio: el checkpoint subido corresponde a 2.000.158.720 tokens válidos de un plan que llega hasta 16.000.000.000, sin ningún post-entrenamiento y sin evaluación downstream publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 6 capas KDA (atención lineal recurrente) + 7 capas Gated MLA, MoE enrutado Stable LatentMoE, Attention Residuals, activaciones SiTU, output gates |
| Parámetros totales | 1.005.084.424 (~1,005 B) |
| Parámetros activos | 341.860.104 por token (MoE, top-k 4 de 64 expertos enrutados + 2 expertos compartidos) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se documenta extensión en inferencia) |
| Tipos de cuantización | no disponible (los pesos se publican en BF16; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, layout standalone) con código PyTorch (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |
| Capas del decodificador | 13 (índices KDA: 1, 2, 5, 6, 9, 10; índices Gated MLA: 3, 4, 7, 8, 11, 12, 13) |
| Ancho oculto / cabezas / ancho de cabeza KDA | 1024 / 12 / 128 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Ancho oculto de experto enrutado | 512 |
| Capas densas antes del MoE | 1 |
| Kernel de convolución causal KDA | 4 (depthwise) |
| Grupos de decaimiento KDA por cabeza | 128 (contiguos) |
| Modo posicional MLA | NoPE (sin codificación posicional explícita) |
| Tamaño de bloque de Attention Residual | 4 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Precisión de pesos | BF16; decaimiento KDA, convolución, normalización y estado de control del router en FP32 |
| Tokens consumidos en este checkpoint | 2.000.158.720 (3.052 pasos de optimizador; objetivo final del plan: 16.000.000.000) |
| Post-entrenamiento | ninguno (solo preentrenamiento) |

## Arquitectura y entrenamiento

El modelo es un decoder-only de 13 capas que alterna dos mecanismos de atención. Las capas KDA implementan una atención lineal con decaimiento por cabeza, con 128 grupos de decaimiento contiguos por cabeza y una convolución causal depthwise de kernel 4; su estado recurrente y el historial de las convoluciones cortas de Q/K/V se reinician en cada frontera de segmento. Las capas Gated MLA usan atención latente con máscara causal bloqueada por documento y modo posicional NoPE, más una puerta de salida. El bloque MoE (Stable LatentMoE) se sitúa tras una capa densa inicial, con 64 expertos enrutados de ancho 512, 2 expertos compartidos y selección top-4. El router selecciona con puntuaciones sesgadas y combina con puntuaciones sigmoideas sin sesgo renormalizadas, con Quantile Balancing en línea sobre un histograma de 1.000 bins. Los bloques de Attention Residuals agrupan de 4 en 4.

El entrenamiento usa una receta estilo K3: Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1% de warmup lineal y máscaras que aíslan documentos de forma estricta. La inicialización es canónica por nombre y forma con semilla base 20260914, de modo que los parámetros compartidos entre arquitecturas con el mismo nombre y forma arrancan byte a byte idénticos; los parámetros exclusivos de cada variante reciben su propio flujo determinista. Todas las 20 ejecuciones consumen la misma mezcla inmutable de datos en el mismo orden. No se realizó RLHF, DPO ni ningún otro post-entrenamiento, y el estado del optimizador no se publica. Cada checkpoint numerado es una etiqueta Git inmutable; el tag final previsto es `checkpoint-tokens-016000000000-final`.

## Capacidades

- Generación de texto autoregresiva a nivel de token: es la única capacidad efectivamente entrenada, al ser un checkpoint de preentrenamiento sin ajuste de instrucciones.
- Modelado de lenguaje y estimación de verosimilitud: permite calcular NLL y perplejidad sobre un corpus, que es la métrica con la que se compara esta familia de variantes.
- Mezcla de mecanismos de atención en una misma pila: 6 capas KDA de estado recurrente y 7 capas Gated MLA, lo que permite estudiar el comportamiento de cada tipo por separado.
- Enrutado MoE con expertos compartidos: 64 expertos enrutados más 2 compartidos, con selección top-4 por token.
- Razonamiento, código, matemáticas, visión, audio: no disponibles; no se ha realizado ajuste ni evaluación que los acredite.
- Tool calling / function calling: no disponible; no hay formato de herramientas ni post-entrenamiento que lo habilite.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas y el vocabulario no está documentado por idioma.
- Modo de pensamiento explícito: no disponible.
- Capacidad especial destacable: es un banco de pruebas de ablación de arquitectura reproducible, con manifiestos JSON de revisiones de código fuente, cuotas de tokens, hashes de planificación y configuración del optimizador.

## Casos de uso

- Ablación de arquitecturas de atención: el repositorio forma parte de una comparación controlada de 20 variantes con inicialización idéntica por nombre y forma, de modo que sirve para medir el efecto de cambiar la proporción KDA/MLA, la granularidad de decaimiento o la codificación posicional manteniendo el resto constante.
- Investigación sobre atención lineal frente a MLA: al incluir índices explícitos de capa para cada mecanismo (KDA en 1, 2, 5, 6, 9, 10 y MLA en 3, 4, 7, 8, 11, 12, 13), permite instrumentar activaciones y estado recurrente capa por capa y analizar dónde aporta cada uno.
- Estudio de enrutado MoE: con 64 expertos enrutados, 2 compartidos y top-4, y Quantile Balancing de 1.000 bins, es adecuado para analizar equilibrio de carga, colapso de expertos y sensibilidad al sesgo del router a escala de 1 B de parámetros.
- Pruebas de infraestructura de serving para modelos híbridos: su combinación de estado recurrente KDA, MLA y MoE con 341,9 M de parámetros activos sirve para validar kernels, gestión de caché y planificación de lotes antes de escalar a modelos mayores de la misma familia.
- Reproducción de recetas de optimizador: al documentar Muon por cabeza, AdamW de respaldo, QK-Clip, decaimiento coseno y warmup del 1%, permite replicar y depurar la receta completa a un coste de cómputo reducido.
- Base para ajuste fino de dominio: al ser un modelo de ~1 B con 8.192 tokens de contexto, puede servir como punto de partida para SFT o LoRA en dominios concretos, asumiendo que parte de un checkpoint intermedio y sin evaluación previa.
- Medición de perplejidad y seguimiento de curvas de escalado: la secuencia de tags inmutables (`checkpoint-tokens-002000158720` hasta `checkpoint-tokens-016000000000-final`) permite trazar la evolución de la pérdida a lo largo de 16.000 millones de tokens.
- Docencia y divulgación técnica: es un caso práctico y ligero para explicar cómo se compone un transformer híbrido con atención lineal, MLA con puerta, MoE latente y Attention Residuals, con el código standalone incluido en el propio repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que se trata de un checkpoint intermedio de investigación que no ha sido evaluado en tareas downstream. Las únicas métricas registradas son la NLL y la perplejidad de desarrollo fijo durante el entrenamiento, alojadas en W&B y en los ficheros JSONL de métricas de la ejecución, a las que no se da acceso desde la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de los 1.005.084.424 parámetros; el repositorio no publica mediciones): aproximadamente 2,0 GB solo de pesos en BF16, más el estado auxiliar en FP32 (decaimiento KDA, convolución, normalización y control del router) y las activaciones y caché KV, lo que sitúa un despliegue en inferencia de lote pequeño en el rango de 3 a 5 GB.
- Cuantización a 8 bits: alrededor de 1,0-1,1 GB de pesos. A 4 bits: alrededor de 0,5-0,6 GB. Son estimaciones teóricas, ya que no se publican ficheros cuantizados ni GGUF.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 24 GB) puede alojar los pesos en BF16. El coste por token es el de un modelo denso de ~342 M de parámetros activos, por lo que la latencia debería ser baja en hardware moderno.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para una sola instancia, pero resultan útiles para procesar lotes grandes, comparar las 20 variantes en paralelo o instrumentar las capas internas.
- Opciones de despliegue: la carga requiere el paquete standalone incluido en el repositorio (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `model.safetensors`), con los scripts `initialize_model.py` y `smoke_test.py` como referencia. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, y dada la combinación de KDA, Gated MLA y MoE latente con router personalizado, es previsible que necesite integración propia.
- Latencia y throughput: no disponible. El repositorio menciona una "hardware benchmark choice" dentro de los manifiestos JSON, pero no publica cifras en la model card.
- Nota de almacenamiento: el repositorio ocupa 8,1 GB, muy por encima de los ~2 GB que ocupan los pesos en BF16, presumiblemente por el código, manifiestos y material auxiliar incluidos.

## Comparativa con modelos similares

La información disponible no incluye resultados de las otras 19 variantes de la comparación, ni métricas que permitan situar este checkpoint frente a alternativas. La tabla siguiente usa especificaciones públicas de modelos de escala similar como referencia de categoría; no proceden de la información del repositorio y deben tomarse como orientativas.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-attn-2kda-2mla-nope-v2 | 1,005 B | 341,9 M (MoE top-4) | 8.192 | no disponible | HuggingFace (0 descargas, 0 likes) |
| Qwen3-1.7B | 1,7 B (denso) | 1,7 B | 32.768 | Apache 2.0 | HuggingFace |
| Llama 3.2 1B | 1,24 B (denso) | 1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace |
| SmolLM2-1.7B | 1,7 B (denso) | 1,7 B | 8.192 | Apache 2.0 | HuggingFace |

Diferencias estructurales relevantes: el modelo de este repositorio es el único MoE del grupo y el único con atención híbrida lineal más MLA, lo que reduce el coste por token a ~342 M de parámetros activos, pero también el único sin licencia declarada, sin post-entrenamiento, sin evaluación downstream y sin soporte conocido en frameworks de serving estándar. Frente a las alternativas densas citadas, su ventana de 8.192 tokens es igual o inferior, y no compite en seguimiento de instrucciones porque nunca fue ajustado para ello.

## Limitaciones y advertencias

- No es un asistente: no ha recibido ajuste de instrucciones, RLHF ni DPO. No debe desplegarse en aplicaciones orientadas a usuario final que esperen seguir indicaciones.
- Checkpoint intermedio: corresponde a 2.000.158.720 de los 16.000.000.000 de tokens del plan. La calidad de generación será baja en comparación con un modelo completamente entrenado.
- Sin evaluación downstream: la model card afirma explícitamente que no se ha evaluado en tareas posteriores, por lo que no existe ninguna evidencia de rendimiento en MMLU, HumanEval, GSM8K ni similares.
- Riesgo de alucinación y salidas degradadas: el propio autor advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas. Al ser un modelo solo preentrenado, la repetición y la incoherencia son esperables.
- Sesgos: no hay ninguna evaluación de sesgos ni documentación sobre la composición del corpus de entrenamiento más allá de la referencia a "source datasets" con sus propias licencias. No se redistribuye el texto de entrenamiento, por lo que no es posible auditar la mezcla desde el repositorio.
- Licencia no declarada: al no indicarse licencia en la información disponible, no puede asumirse permiso para uso comercial. Es un riesgo legal relevante antes de cualquier uso en producción.
- Idiomas: no se declara lista de idiomas soportados. El vocabulario de 163.840 entradas y las instrucciones en inglés de la model card sugieren un sesgo hacia el inglés, pero no hay confirmación.
- Contexto limitado a 8.192 tokens en entrenamiento: no se documenta ninguna extensión por inferencia ni técnica de extrapolación, y el modo posicional NoPE de las capas MLA añade incertidumbre sobre el comportamiento más allá de esa longitud.
- Sin estado del optimizador publicado: el repositorio no permite reanudar el entrenamiento tal cual, solo inferencia o reinicio desde los pesos.
- Inconsistencia de nomenclatura: el nombre del repositorio sugiere una proporción "2kda-2mla" mientras que la lista de capas de la model card indica 6 capas KDA y 7 capas Gated MLA. Conviene tratar la lista de índices de capa como la fuente autoritativa y verificar `VARIANT.md` si está presente.
- Extrapolación no validada: el propio autor advierte de que los rankings de arquitectura obtenidos a esta escala y con 8.192 tokens de longitud de entrenamiento necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Soporte de herramientas limitado: al depender de código de modelado propio, el despliegue exige integrar el paquete standalone; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad ni informes de terceros sobre su comportamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attn-2kda-2mla-nope-v2
- Ficheros de arquitectura incluidos en el repositorio: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `ARCHITECTURE.md`, `ARCHITECTURE_PACKAGE_README.md`, `VARIANT.md` (cuando está presente), `initialize_model.py`, `smoke_test.py`
- Manifiestos JSON con revisiones de código fuente congeladas, cuotas de tokens, hashes de planificación, configuración del optimizador y hashes del conjunto de validación: incluidos en el repositorio, ruta no especificada en la información disponible
- Métricas de entrenamiento (NLL y perplejidad): registradas en W&B y en los ficheros JSONL de la ejecución; enlace no disponible
- Paper, blog, repositorio de experimentos o demo: no disponibles en la información proporcionada. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo.
