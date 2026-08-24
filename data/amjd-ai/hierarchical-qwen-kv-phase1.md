# amjd-ai/hierarchical-qwen-kv-phase1

## Resumen

El modelo `amjd-ai/hierarchical-qwen-kv-phase1` es un checkpoint de la fase 1 del proyecto Hierarchical KV Cache, desarrollado por el autor `amjd-ai`. Se trata de un adaptador LoRA (librería PEFT) que se aplica sobre el modelo base `Qwen/Qwen2.5-3B-Instruct` de Alibaba Cloud. Su objetivo es reducir el coste de memoria y computación de la caché de claves y valores (KV cache) en modelos transformer, permitiendo manejar contextos largos de forma más eficiente mediante una compresión jerárquica.

La arquitectura introduce dos componentes principales: un compresor local que aplica una compresión 4:1 por bloques (chunks) sobre la KV cache, y un Perceiver global que utiliza memoria latente mediante cross-attention para capturar información global. El entrenamiento se realiza con causalidad por chunks, alineando el proceso de entrenamiento con el de inferencia (relación 1:1). Este checkpoint corresponde a la primera fase del proyecto, por lo que aún no se han publicado evaluaciones completas ni benchmarks.

El repositorio contiene los pesos verificados, los adaptadores LoRA, los compresores personalizados y los archivos de arquitectura. El tamaño del repositorio es de 0,1 GB, lo que indica que solo se incluyen los adaptadores y archivos de configuración, no los pesos completos del modelo base. La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct) con compresión jerárquica de KV cache (compresor local 4:1 + Perceiver global) |
| Parametros totales | No disponible (el adaptador LoRA se añade al modelo base de 3B parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base, Qwen2.5-3B-Instruct soporta 32K tokens, pero la compresión puede extenderla) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (heredados del modelo base, principalmente inglés y chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-3B-Instruct, pero modifica el mecanismo de atención para incorporar una compresión jerárquica de la KV cache. El compresor local divide la secuencia en bloques (chunks) y comprime las claves y valores de cada bloque en una proporción 4:1, reduciendo así la memoria necesaria para almacenar el historial. El Perceiver global, por su parte, utiliza un conjunto de vectores latentes que actúan como memoria comprimida mediante cross-attention, permitiendo al modelo acceder a información global de toda la secuencia sin necesidad de retener todas las claves y valores originales.

El entrenamiento se realiza con causalidad por chunks, es decir, el modelo se entrena procesando la secuencia en bloques y aplicando la compresión de forma incremental, de modo que el comportamiento en entrenamiento coincide con el de inferencia (alineación 1:1). Esta estrategia evita la discrepancia típica entre entrenamiento y despliegue en modelos con compresión de contexto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen2.5-3B-Instruct, hereda las capacidades de generación de texto, razonamiento y conversación del modelo base, aunque la compresión de KV puede afectar ligeramente a la calidad en tareas que requieren atención a detalles finos.
- Manejo de contextos largos: el diseño de compresión jerárquica está orientado a reducir el coste de memoria en secuencias largas, permitiendo potencialmente procesar contextos más extensos que el modelo base con los mismos recursos.
- Tool calling y function calling: no se ha verificado específicamente, pero el modelo base Qwen2.5-3B-Instruct soporta estas capacidades; el adaptador no debería eliminarlas, aunque no hay confirmación.
- Multilingüismo: no se ha especificado, pero el modelo base está entrenado principalmente en inglés y chino, con algo de otros idiomas.
- Capacidades especiales: la compresión de KV cache es la característica distintiva; no se mencionan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Procesamiento de documentos largos: el modelo puede utilizarse para resumir o extraer información de documentos extensos (informes, artículos, contratos) donde la ventana de contexto del modelo base se queda corta. La compresión 4:1 permite mantener un historial más amplio con menos memoria.
- Chatbots con historial conversacional extenso: en aplicaciones de atención al cliente o asistentes virtuales, el modelo puede mantener conversaciones de muchas interacciones sin degradar el rendimiento, gracias a la memoria comprimida del Perceiver global.
- Análisis de código en repositorios grandes: para tareas de comprensión o generación de código que requieren considerar múltiples archivos o funciones, la compresión de KV permite procesar secuencias más largas de tokens de código.
- Investigación en eficiencia de atención: este checkpoint sirve como base para experimentos académicos sobre compresión de KV cache, comparando el rendimiento con modelos sin compresión o con otras técnicas como sliding window attention.
- Despliegue en entornos con recursos limitados: al reducir la memoria de la KV cache, el modelo puede ejecutarse en GPUs con menor VRAM que el modelo base sin compresión, manteniendo un contexto razonable.
- Fine-tuning posterior: los adaptadores LoRA pueden combinarse con otros adaptadores o ajustarse para tareas específicas, aprovechando la arquitectura comprimida para dominios con requisitos de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint. Tampoco se comparan métricas de rendimiento (latencia, throughput) con el modelo base u otras alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base (Qwen2.5-3B-Instruct) y de la cuantización elegida. Con cuantización de 4 bits, el modelo base requiere aproximadamente 2-3 GB de VRAM, más la sobrecarga del adaptador y la compresión, que es mínima.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo con cuantización. Para mayor velocidad, se recomiendan GPUs con más memoria y cómputo, como RTX 4090 o A100.
- Compatibilidad con GPU de consumo: sí, el modelo base de 3B parámetros cabe en GPUs de consumo con cuantización, y la compresión de KV reduce aún más los requisitos de memoria.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft`. Para inferencia optimizada, se puede usar vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay soporte nativo documentado para esta arquitectura personalizada.
- Latencia y throughput: no disponibles. La compresión puede reducir el tiempo de prefill en contextos largos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un adaptador experimental sobre Qwen2.5-3B-Instruct, y no hay otros modelos públicos con la misma arquitectura de compresión jerárquica. Como referencia, se puede comparar con el modelo base sin compresión:

| Modelo | Parámetros | Contexto | Compresión KV | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct | 3B | 32K | No | Apache 2.0 |
| amjd-ai/hierarchical-qwen-kv-phase1 | 3B + adaptador | No disponible (potencialmente mayor) | Sí (4:1 local + Perceiver) | No disponible |

Otras alternativas de compresión de contexto (como Longformer o BigBird) no son directamente comparables por su arquitectura diferente. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Checkpoint de fase 1: es un modelo experimental en desarrollo temprano; no se ha validado su estabilidad ni su rendimiento en tareas reales.
- Sin benchmarks publicados: no hay evidencia de que la compresión no degrade significativamente la calidad del modelo en tareas que requieren atención precisa a detalles.
- Licencia no especificada: no se conoce si el adaptador puede usarse comercialmente; se recomienda contactar al autor antes de cualquier uso en producción.
- Dependencia del modelo base: el adaptador requiere el modelo Qwen2.5-3B-Instruct, que tiene su propia licencia (Apache 2.0), pero el adaptador en sí no tiene licencia declarada.
- Posibles sesgos heredados: el modelo base puede contener sesgos de género, raza o idioma; el adaptador no los corrige.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos largos donde la compresión puede perder detalles.
- Soporte limitado: al ser un proyecto personal, no hay garantía de mantenimiento, documentación ni soporte técnico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amjd-ai/hierarchical-qwen-kv-phase1
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Sitio oficial de Qwen: https://qwen.ai/home
- Repositorio oficial de Qwen en GitHub: https://github.com/QwenLM/Qwen
