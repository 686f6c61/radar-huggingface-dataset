# KreatixLabs/Kreatix-K2-2B-Reasoning

## Resumen

Kreatix K2 2B Reasoning es un modelo vision-lenguaje de 2.284.122.848 parámetros desarrollado por KreatixLabs, publicado bajo licencia Apache 2.0. Se construye a partir de Kreatix K2 450M Reasoning mediante una técnica de "cirugía" que preserva la función exacta del modelo original: no requiere entrenamiento para obtener los pesos iniciales, sino que escala profundidad, anchura y torre de visión mediante duplicación e inserción de capas con inicialización identidad. El resultado reproduce las salidas del modelo de 450M hasta el orden de reducción en coma flotante (~1e-5 en logits fp32) al inicializarse, dejando aproximadamente 218M parámetros dormidos en el LM y ~22M en el ViT listos para ser entrenados.

La arquitectura combina un transformer con capas Gated DeltaNet (atención de estado fijo con decodificación lineal) y componentes NoPE, lo que permite extrapolación natural de contexto hasta un `max_seq_len` de 1.048.576 tokens. Incluye una torre de visión de ~230M parámetros (ViT de 16 capas, hidden 1024, 16 cabezas) y un pipeline image-text-to-text. El modelo soporta inglés y finés, e incorpora un system prompt de identidad integrado ("KreatixK2") que se inyecta automáticamente en cada chat salvo que el llamador proporcione el suyo.

Es relevante ahora porque ejemplifica una estrategia de escalado sin entrenamiento (depth-up scaling y width duplication function-preserving) que permite a un laboratorio pequeño obtener un modelo base de 2B con visión a partir de un modelo de 450M, reduciendo drásticamente el coste computacional de la fase de inicialización. La librería propia `k2` y la ausencia de pesos en formatos estándar (GGUF, safetensors estándar de transformers) limitan su adopción inmediata fuera del ecosistema del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet (atención de estado fijo), NoPE, torre ViT para visión |
| Parametros totales | 2.284.122.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (`max_seq_len`); escalado logN activo a partir de ~8k tokens (`attn_logn_base=8192`) |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,6 GB); tokenizer en `tokenizer.json`; requiere la librería `k2` |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido que combina capas Gated DeltaNet con atención de estado fijo y decodificación lineal, junto con componentes NoPE (sin codificación posicional explícita) que favorecen la extrapolación de contexto. La construcción parte de Kreatix K2 450M Reasoning y aplica una receta de escalado que preserva la función: la profundidad pasa de 24 a 40 capas insertando 16 clones con inicialización identidad en el patrón `DDDA` repetido 10 veces; la anchura oculta se duplica de 1024 a 2048 duplicando columnas de entrada a 0,5 y filas de salida, manteniendo `rms(dup(x)) == rms(x)` para conservar exactitud en RMSNorm; el MLP SwiGLU crece de 2816 a 5632 duplicando cada neurona con columnas de `mlp.down` a 0,5. La cabeza `lm_head` se desata del embedding con `lm_head = 0.5 * dup(embed cols)`. La torre de visión se amplía de 512 a 1024 de hidden, de 8 a 16 cabezas (manteniendo `head_dim` 64 para no alterar la rejilla rotatoria 2D), MLP de 1408 a 2816 y profundidad de 8 a 16 con clones identidad, resultando en un ViT de ~230M parámetros.

No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o SFT tras la inicialización. La model card indica explícitamente que los pesos publicados son el resultado de la cirugía function-preserving y que los ~218M parámetros dormidos del LM (más ~22M del ViT) "están listos para ser entrenados" en un fine-tune posterior; por tanto, el modelo publicado es un punto de partida estructural, no un modelo completamente entrenado en su configuración de 2B. La innovación técnica destacable es precisamente esa receta de escalado sin entrenamiento, verificada con tokens greedy idénticos en texto e imagen respecto al modelo de 450M.

## Capacidades

- Generación de texto y razonamiento: el modelo está etiquetado como "reasoning" y hereda la calibración del 450M, con modo de razonamiento implícito en el prompt de identidad.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): torre ViT de ~230M parámetros que acepta entradas visuales junto con texto.
- Identidad integrada: inyecta automáticamente el system prompt de `kreatix/identity.py` en cada chat salvo que el llamador aporte el suyo, manteniendo la calibración de identidad KreatixLabs en inglés y finés.
- Contexto largo: `max_seq_len` de 1.048.576 tokens con extrapolación natural gracias a NoPE + Gated DeltaNet de estado fijo y escalado logN de query más allá de ~8k tokens.
- Multilingüe limitado: inglés y finés documentados; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modos de "thinking" explícitos en la información disponible.

## Casos de uso

- Procesamiento de documentos largos con imágenes: gracias a su ventana de 1.048.576 tokens y a la torre ViT, puede ingerir contratos, informes o expedientes completos con figuras y tablas en una sola pasada, útil para extracción de información y resumen en inglés o finés.
- Análisis de imágenes técnicas en finés: al ser uno de los pocos modelos que declara soporte de finés con visión, encaja en sectores como administración pública finlandesa, documentación técnica o atención al ciudadano con capturas y formularios.
- Base para fine-tune vertical: los ~218M parámetros dormidos del LM y ~22M del ViT están pensados para ser entrenados, por lo que sirve como punto de partida de bajo coste para adaptar un modelo de 2B a dominios concretos (legal, médico, industrial) sin partir de cero.
- Investigación en escalado function-preserving: el modelo es un caso de estudio reproducible de depth-up scaling y width duplication, útil para laboratorios que quieran validar recetas de crecimiento de modelos sin reentrenar.
- Prototipado de asistentes multimodales en CPU: la referencia del autor (~5 tok/s prefill, ~0,6 tok/s decode en fp32 con 8 hilos) permite validar pipelines en entornos sin GPU antes de desplegar en servidores.
- Experimentación con contexto ultra-largo: para tareas de recuperación de información en corpus de más de 100k tokens con imágenes intercaladas, donde la extrapolación NoPE + DeltaNet evita el coste cuadrático de la atención estándar.
- Evaluación de identidad y alineación: el system prompt integrado permite estudiar cómo un modelo pequeño mantiene coherencia de identidad en conversaciones multi-turno en dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una verificación de equivalencia funcional: al inicializarse, el 2B reproduce las salidas del 450M/750M con ~1e-5 de diferencia en logits fp32 y tokens greedy idénticos en texto e imagen. Como referencia de rendimiento en CPU (fp32, 8 hilos) el autor indica ~5 tok/s en prefill y ~0,6 tok/s en decode, y señala que el entorno previsto es serving en GPU (menciona B300 como objetivo del entrenador K2).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 4,6 GB en safetensors; en fp16/bf16 se necesitan aproximadamente 4,6 GB de VRAM solo para pesos, más overhead de activaciones y KV/estado. En fp32 serían ~9,1 GB.
- GPU recomendadas: el autor menciona explícitamente las B300 como objetivo del entrenador; para inferencia no se documentan GPU concretas. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes para los pesos en bf16.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090), siempre que la librería `k2` soporte el dispositivo.
- Opciones de despliegue: la model card solo documenta `scripts/generate.py` con la librería `k2` propia y flag `--device cpu`. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: referencia CPU fp32 con 8 hilos ~5 tok/s prefill y ~0,6 tok/s decode. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kreatix K2 2B Reasoning | 2,28B | 1.048.576 | Sí (ViT ~230M) | en, fi | Apache 2.0 | Hugging Face, librería `k2` propia |
| Kreatix K2 450M Reasoning (base) | ~450M | No disponible | Sí | en, fi | Apache 2.0 | Hugging Face |
| Alternativas de ~2B con visión | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (vision-lenguaje de ~2B) que permitan una comparación cuantitativa fiable. La comparación más directa posible es con su propio modelo base de 450M, del que hereda función exacta al inicializarse.

## Limitaciones y advertencias

- Modelo no completamente entrenado en su configuración de 2B: los pesos publicados son el resultado de la cirugía function-preserving; ~218M parámetros del LM y ~22M del ViT están dormidos y requieren fine-tune para aprovecharse. El rendimiento efectivo es el del 450M hasta que se entrene.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas de razonamiento visual.
- Idiomas limitados a inglés y finés; no se declara soporte de castellano ni de otros idiomas.
- Ecosistema cerrado: requiere la librería `k2` y no publica GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, lo que dificulta el despliegue en producción estándar.
- Riesgo de alucinación: no documentado por el autor; al ser un modelo pequeño y parcialmente entrenado, el riesgo es presumiblemente alto en tareas de conocimiento factual.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el system prompt de identidad integrado (`kreatix/identity.py`) puede condicionar el comportamiento en producción si no se sobrescribe.
- Contexto declarado de 1.048.576 tokens sin validación pública de recuperación efectiva a esa longitud; el escalado logN solo actúa más allá de ~8k tokens.
- Throughput en CPU muy bajo (~0,6 tok/s decode), lo que hace inviable el uso interactivo sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KreatixLabs/Kreatix-K2-2B-Reasoning
- Modelo base (450M): https://huggingface.co/KreatixLabs/Kreatix-K2-450M-Reasoning
- Repositorio del autor en Hugging Face: https://huggingface.co/KreatixLabs
