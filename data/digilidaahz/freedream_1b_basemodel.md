# Digilidaahz/Freedream_1B_BaseModel

## Resumen

Freedream 1B es un modelo de lenguaje decoder-only de aproximadamente 977 millones de parámetros entrenado desde cero por un único desarrollador (Digilidaahz) sobre una NVIDIA RTX 5080 de 16 GB. El modelo emplea una arquitectura Transformer convencional con RoPE, SwiGLU, weight tying y un tokenizador BPE propio de 32 000 tokens. Su relevancia radica en que demuestra que es posible entrenar un modelo base de escala ~1B con recursos de consumo, sirviendo como referencia para investigación en modelos pequeños y para experimentación educativa.

El repositorio alberga varias versiones del modelo base según el número de tokens vistos durante el entrenamiento (7B, 20B, 24B y 50B), con un dataset compuesto por FineWeb-Edu, Cosmopedia, FineMaths, TinyBrain y, en la versión de 50B, Stack-v3 y dclm-edu. La versión de 20B tokens se aproxima al óptimo de Chinchilla para 1B de parámetros, con una pérdida final en torno a 2,6. Las versiones posteriores sirven de base para los modelos ajustados por instrucciones Freedream-1B-Instruct.

Se trata de un modelo base sin ajuste por instrucciones, orientado a investigación y fine-tuning posterior. No está recomendado para razonamiento matemático complejo ni para generación de código en producción, y su ventana de contexto está limitada a 4096 tokens. La licencia es CreativeML OpenRAIL-M, con cláusulas adicionales de marca registrada sobre el nombre "Freedream".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, SwiGLU, weight tying) |
| Parametros totales | 977 300 992 (~977M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión original; repo de 17,7 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | creativeml-openrail-m (con cláusulas adicionales de nombre reservado y marca) |
| Formato de pesos | no disponible (PyTorch; repo de 17,7 GB) |

Detalles arquitectónicos adicionales: 24 capas, hidden size de 1792, 16 cabezas de atención con dimensión de cabeza 112, dimensión FFN de 4736, activación SwiGLU y codificación posicional RoPE. Tokenizador BPE propio con vocabulario de 32 000 (tokenizer_v1.json) y 32 001 (tokenizer_v2, que corrige el problema de `{` tokenizado como UNK).

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only estándar con atención multi-cabeza, RoPE para codificación posicional, SwiGLU en la capa feed-forward y weight tying entre embeddings de entrada y salida. El tokenizador es un BPE entrenado específicamente, con dos versiones: la v1 (32k) para los checkpoints de 7B y 20B tokens, y la v2 (32 001) para los de 24B y 50B, que corrige el fallo de tokenización del carácter `{`.

El entrenamiento se realizó en una sola RTX 5080 (16 GB) bajo WSL2 con Ubuntu 24.04, en precisión FP8 (excepto la versión de 7B tokens, en bf16), optimizador 8-bit AdamW, batch size de 1 y acumulación de gradientes de 16, resultando en 65 536 tokens efectivos por paso. El dataset total ronda los 45B tokens (FineWeb-Edu, Cosmopedia, FineMaths, TinyBrain) y en la versión de 50B se amplía con Stack-v3 y dclm-edu. No se menciona RLHF ni DPO; son modelos base sin ajuste por instrucciones. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con fluidez moderada en las versiones de mayor número de tokens vistos.
- Modelo base: completa texto y puede servir de punto de partida para fine-tuning supervisado.
- Razonamiento básico y recuperación de hechos limitada; la versión de 20B tokens mejora en precisión factual y lógica respecto a la de 7B.
- Capacidad matemática y de código limitada; la versión de 50B incluye datos de Stack-v3 y matemáticas, pero el autor no la recomienda para uso general en estas áreas.
- No soporta tool calling ni function calling de forma nativa (no es un modelo ajustado por instrucciones).
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Multilingüismo limitado al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre modelos pequeños: servir de base reproducible para estudiar dinámicas de entrenamiento desde cero en hardware de consumo, comparando checkpoints de 7B, 20B, 24B y 50B tokens.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base, puede ajustarse con datasets específicos (clasificación, resumen, generación de dominio) y publicarse con la atribución exigida por la licencia.
- Experimentación educativa: permite a estudiantes y desarrolladores reproducir el pipeline completo (tokenizador, entrenamiento, evaluación) en una única GPU de 16 GB.
- Generación de texto de dominio controlado tras fine-tuning: por ejemplo, redacción de descripciones o textos breves en inglés con un estilo fijado mediante ajuste.
- Comparación de tokenizadores: la coexistencia de tokenizer_v1 y tokenizer_v2 permite estudiar el impacto del vocabulario y del fallo de tokenización de `{` en el rendimiento.
- Base para modelos instruct: las versiones de 20B y 50B tokens son la base de Freedream-1B-Instruct-V1, V1.1 y V2, por lo que sirven como referencia para estudiar la cadena base-instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una pérdida final de aproximadamente 2,6 para la versión de 20B tokens vistos, sin métricas estandarizadas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para ~977M parámetros, en FP16 se requieren aproximadamente 2 GB de pesos más overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits el requisito sería inferior, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: el modelo se entrenó en una RTX 5080 (16 GB); para inferencia es suficiente con GPUs de consumo de gama media-alta (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) en función de la cuantización.
- Cabe en GPU de consumo: sí, dado el tamaño de ~1B parámetros, siempre que se disponga de al menos 4-6 GB de VRAM para FP16 con contexto moderado.
- Opciones de despliegue: al estar etiquetado con `text-generation-inference` y `Pytorch`, es compatible con TGI; también podría desplegarse con vLLM o llama.cpp si se generan pesos en GGUF, aunque el autor no los publica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Freedream 1B | ~977M | 4096 | creativeml-openrail-m | Entrenado desde cero en una RTX 5080; sin benchmarks publicados |
| TinyLlama 1.1B | ~1,1B | 2048 | Apache 2.0 | Entrenado sobre 3T tokens; benchmarks públicos; ajustado por instrucciones |
| Qwen2.5-1.5B | ~1,5B | 32 768 | Apache 2.0 (mayoría de variantes) | Contexto largo, multilingüe, benchmarks publicados |
| SmolLM2-1.7B | ~1,7B | 8192 | Apache 2.0 | Entrenado sobre ~11T tokens; benchmarks públicos |

Freedream 1B se distingue por su origen artesanal y su licencia restrictiva en cuanto a marca, mientras que las alternativas citadas ofrecen contextos mayores, más tokens de entrenamiento y benchmarks verificables. La comparación de rendimiento no es posible por ausencia de métricas publicadas para Freedream.

## Limitaciones y advertencias

- No está ajustado por instrucciones: puede producir salidas incoherentes o alucinadas si se usa directamente como asistente.
- Ventana de contexto limitada a 4096 tokens.
- Conocimiento limitado al corte de los datos de entrenamiento; no se especifica la fecha exacta.
- No recomendado para matemáticas complejas ni generación de código, según el propio autor.
- No apto para aplicaciones médicas, legales o de seguridad crítica.
- Solo inglés; sin capacidades multilingües.
- Licencia CreativeML OpenRAIL-M con cláusulas adicionales: el nombre "Freedream" es marca no registrada del autor y no puede usarse en derivados, forks, fine-tunes o cuantizaciones sin permiso escrito; se exige atribución ("Built with Freedream" o "Based on Freedream") y enlace al repositorio original.
- Riesgo de sesgos heredados de los datasets (FineWeb-Edu, Cosmopedia, Stack-v3, etc.), no evaluados por el autor.
- El repositorio ocupa 17,7 GB, lo que sugiere la inclusión de múltiples checkpoints; conviene verificar qué pesos concretos se descargan.

## Enlaces

- Hugging Face: https://huggingface.co/Digilidaahz/Freedream_1B_BaseModel
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
