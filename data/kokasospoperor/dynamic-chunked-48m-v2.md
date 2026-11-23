# Kokasospoperor/dynamic-chunked-48m-v2

## Resumen

DynamicChunkedTransformer-48M (v2) es un modelo de lenguaje de 48,16 millones de parámetros desarrollado por el usuario Kokasospoperor y publicado en Hugging Face. Su rasgo definitorio es que opera directamente sobre bytes UTF-8 sin tokenizador BPE ni vocabulario de subtokens: la entrada y la salida son los 256 valores posibles de un byte, lo que garantiza una representación sin pérdida de cualquier texto. El modelo se ha entrenado desde cero sobre 4.000 millones de bytes UTF-8 con un esquema de aprendizaje Warmup-Stable-Decay (WSD) en dos etapas.

La arquitectura es original y no corresponde a un transformer estándar. Combina un enrutador de fronteras de chunk basado en una convolución causal 1D que aprende límites de pre-token adaptativos (unos 4,9 bytes por chunk de media, con un máximo de 16), un codificador local de 3 capas que procesa los chunks empaquetados en tiempo O(T·16) y un backbone superior de 16 capas con atención agrupada (GQA) y RoPE sobre las representaciones comprimidas de cada chunk.

Es relevante para quienes investigan modelos sin tokenizador, compresión de secuencias y arquitecturas eficientes en cómputo: demuestra que un modelo de menos de 50 millones de parámetros puede alcanzar 0,9417 nats/byte (1,3586 bits/byte) en un conjunto de validación multidominio. No obstante, se trata de un experimento de investigación con cero descargas, sin licencia declarada y con un único idioma soportado (inglés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DynamicChunkedTransformer: enrutador de fronteras por conv causal 1D, codificador local de 3 capas y backbone de 16 capas con GQA y RoPE |
| Parametros totales | 48.164.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con código personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sustituye la tokenización subword por un esquema de chunking dinámico a nivel de byte. Un enrutador de fronteras implementado como convolución causal 1D aprende, mediante Gumbel-Softmax con estimador straight-through, dónde cortar la secuencia de bytes en chunks de longitud variable (media de aproximadamente 4,9 bytes, tope de 16). Esos chunks se empaquetan y se procesan con un codificador local de 3 capas de transformer causal con dimensión 256, lo que reduce el coste computacional a O(T·16) respecto a la longitud T en bytes.

Sobre las representaciones comprimidas de cada chunk opera el backbone superior: 16 capas de atención con RoPE, Grouped-Query Attention con 8 cabezas de consulta y 2 de clave/valor, QK-Norm y activación SwiGLU, con dimensión de embedding de 512. El entrenamiento se realizó desde cero sobre 4.000 millones de bytes UTF-8 con un schedule Warmup-Stable-Decay en dos etapas. La model card no detalla la composición del dataset, el uso de RLHF/DPO ni hiperparámetros de entrenamiento adicionales.

## Capacidades

- Generación de texto a nivel de byte UTF-8, sin pérdida de información en la codificación de entrada y salida.
- Modelado de lenguaje causal autorregresivo sobre texto en inglés.
- Manejo nativo de cualquier secuencia de bytes UTF-8 válida, incluyendo caracteres poco frecuentes o símbolos que un vocabulario BPE podría fragmentar.
- Segmentación adaptativa aprendida de la entrada en chunks de tamaño variable.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades de agente.

## Casos de uso

- Investigación en modelos sin tokenizador: sirve como banco de pruebas reproducible para estudiar el impacto de eliminar el vocabulario BPE y comparar curvas de bits/byte frente a modelos subword de tamaño similar.
- Experimentos de compresión de secuencias: el enrutador de chunks permite analizar cómo se distribuyen los límites aprendidos (media de 4,9 bytes, máximo de 16) sobre distintos dominios textuales.
- Prototipado de arquitecturas eficientes: su coste O(T·16) en el codificador local lo hace adecuado para validar ideas de atención lineal o jerárquica en entornos con recursos limitados.
- Evaluación de robustez ante entradas ruidosas: al operar sobre bytes, permite estudiar el comportamiento del modelo con texto mal formado, erratas o secuencias fuera de vocabulario.
- Docencia y divulgación: un modelo de 48M parámetros y 0,2 GB de repositorio es manejable en un portátil para demostrar conceptos de chunking dinámico y GQA.
- Generación de texto exploratoria en inglés: con decodificación por muestreo (temperatura 0,6, top-k 30) puede producir continuaciones de texto, aunque su escala limita la calidad frente a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validación multidominio (holdout) | 0,9417 nats/byte |
| Validación multidominio (holdout) | 1,3586 bits/byte |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,19 GB de pesos (48,16M parámetros × 4 bytes); en fp16/bf16, unos 0,1 GB. El overhead de activaciones y del código personalizado es reducido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 sobran para este tamaño.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 2060 y superiores, así como en CPU para inferencia puntual.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la naturaleza de código personalizado hace probable que requiera adaptaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DynamicChunkedTransformer-48M v2 | 48,16M | no disponible | byte-level sin tokenizador | no disponible | Hugging Face, 0 descargas |
| Alternativas de ~50M con tokenizador BPE | ~50M | variable | BPE/subword | variable | no disponible en la información |
| Alternativas byte-level de investigación | variable | variable | byte-level | variable | no disponible en la información |

No se dispone de información sobre modelos comparables directos con la misma combinación de chunking dinámico y byte-level en el rango de 50M parámetros.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Licencia no declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor.
- Solo inglés: no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no especificada: se desconoce la ventana máxima efectiva.
- Riesgo de alucinación y coherencia limitada: con 48M parámetros, la calidad de generación será baja en comparación con modelos de mayor escala.
- Requiere `trust_remote_code=True` y código personalizado: implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Sesgos: no documentados, pero al entrenarse sobre 4.000 millones de bytes UTF-8 sin filtrado descrito, puede reproducir sesgos del corpus.
- Sin datos de benchmarks estandarizados: imposible comparar de forma rigurosa con alternativas.
- Fecha de creación en 2026 y actualización inmediata: modelo muy reciente y sin mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/Kokasospoperor/dynamic-chunked-48m-v2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
