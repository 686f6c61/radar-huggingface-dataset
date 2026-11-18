# handwoven8588/CodeRankEmbed-flash-attn

## Resumen
CodeRankEmbed-flash-attn es una reempaquetado en bf16 del modelo de embeddings de código nomic-ai/CodeRankEmbed, publicado por el usuario handwoven8588. No es un finetune: los pesos son los originales de CodeRankEmbed convertidos a bf16, sin entrenamiento adicional. Su aportación principal es un archivo de modelado personalizado que sustituye la atención eager del original por implementaciones de atención de longitud variable con memoria lineal, manteniendo la paridad numérica en los embeddings resultantes.

El modelo resuelve un problema concreto de despliegue: el CodeRankEmbed original carga mediante trust_remote_code y su ruta de atención es exclusivamente eager, con memoria de activaciones que crece como batch × cabezas × secuencia². Con solo 137M de parámetros, el cuello de botella no es el peso sino las activaciones, que agotan la VRAM a lotes grandes. Este reempaquetado añade dos rutas de atención sin padding que reducen el consumo a O(N), permitiendo lotes que la ruta eager no puede alojar.

Es relevante para equipos que despliegan recuperación de código a gran escala (búsqueda semántica sobre repositorios, RAG sobre bases de código) y que necesitan throughput alto sin degradar la calidad de los embeddings. La arquitectura es nomic-bert con 136.731.648 parámetros, contexto de 8192 tokens y pesos en safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nomic_bert (encoder transformer) con modelado personalizado |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | bf16 (pesos almacenados); carga en fp32 opcional vía `torch_dtype=torch.float32` |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors, bf16, con `custom_code` (modeling_hf_nomic_bert.py incluido en el repo) |

## Arquitectura y entrenamiento
El modelo es un encoder transformer nomic_bert de 137M de parámetros, derivado de nomic-ai/CodeRankEmbed. No hay entrenamiento nuevo en este repositorio: los pesos son una conversión a bf16 de los originales. La innovación está en el archivo de modelado, que implementa tres niveles de atención seleccionados automáticamente según el hardware:

- `torch_varlen`: usa `torch.nn.attention.varlen.varlen_attn`, incluido en PyTorch desde la versión 2.10.0, sin dependencias externas. Requiere CUDA con compute capability sm_80 o superior.
- `flash_attn`: kernel varlen del paquete `flash_attn`, pensado como respaldo para versiones de PyTorch que aún no incluyen `torch.nn.attention.varlen`. Dependencia opcional.
- `eager`: el algoritmo original con padding, válido en CPU, GPUs anteriores a Ampere o cuando no hay ninguna de las rutas anteriores. Sirve como referencia de corrección y fallback universal.

El modo `auto` prefiere `torch_varlen`, luego `flash_attn` y por último `eager`. Antes de aceptar un nivel varlen ejecuta una sonda de kernel por dispositivo; si falla con `RuntimeError` registra un aviso y baja de nivel. Los errores de memoria u otras excepciones se propagan en lugar de degradar el nivel. Una selección forzada mediante la variable `NOMIC_BERT_ATTN_IMPL` no se sondea y lanza `RuntimeError` si no se cumple la precondición. En los niveles varlen el modelo elimina el padding una vez tras los input ids, ejecuta todas las capas sobre tokens reales y vuelve a rellenar al final, manteniendo la forma `[B, S, 768]` con ceros en las posiciones de padding. También admite lotes aplanados opcionales (`attn_implementation="flash_attention_2"`) que requieren el paquete `flash_attn` instalado. El modelo carga bf16 de forma nativa, a diferencia del original, cuyo `from_pretrained` personalizado ignoraba `torch_dtype` y cargaba siempre fp32.

## Capacidades
- Generación de embeddings de código y consultas en lenguaje natural para recuperación (code retrieval) y búsqueda semántica.
- Codificación de documentos de código sin prefijo y de consultas con el prefijo obligatorio `"Represent this query for searching relevant code: "`.
- Similitud coseno mediante `normalize_embeddings=True` en `sentence-transformers`.
- Procesamiento de lotes grandes gracias a las rutas de atención con memoria O(N).
- Soporte de lotes aplanados sin padding (opt-in) para maximizar throughput.
- Selección automática de implementación de atención según dispositivo, con override manual.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un modelo de embeddings, no generativo.
- Capacidad monolingüe en inglés.

## Casos de uso
- Búsqueda semántica sobre repositorios de código: indexar funciones y ficheros como documentos y recuperar fragmentos relevantes para una consulta en lenguaje natural, usando el prefijo de instrucción en las consultas y sin prefijo en los documentos.
- RAG sobre bases de código internas: generar embeddings de un corpus de código para alimentar un sistema de recuperación aumentada que asista a desarrolladores con preguntas sobre la base de código, aprovechando el contexto de 8192 tokens para ficheros completos.
- Deduplicación y detección de código similar: calcular embeddings de fragmentos y agrupar por similitud coseno para identificar clones o código duplicado en monorepos.
- Enrutamiento de consultas a documentación técnica: clasificar preguntas de usuarios y dirigirlas al módulo o API correcta comparando su embedding con los de la documentación indexada.
- Autocompletado y sugerencia de fragmentos en IDE: recuperar funciones candidatas relevantes al contexto del editor mediante búsqueda vectorial de baja latencia, con lotes grandes gracias a la ruta varlen.
- Evaluación de calidad de código en pipelines de CI: generar embeddings de los cambios de un pull request y compararlos con patrones conocidos para señalar código sospechoso o fuera de convención.
- Construcción de índices vectoriales a gran escala: el modo bf16 y las rutas de memoria lineal permiten indexar corpus extensos en GPUs Ampere o superiores con lotes que la ruta eager no admite.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (MRR, Recall@k, nDCG) ni comparativas numéricas con otros modelos; solo afirma paridad de embeddings entre los niveles de atención varlen y la ruta eager.

## Requisitos de hardware
- VRAM estimada: los pesos bf16 ocupan aproximadamente 0,27 GB (137M parámetros × 2 bytes). El consumo real lo dominan las activaciones; con atención eager crece como batch × cabezas × secuencia², mientras que las rutas varlen lo reducen a O(N).
- GPU recomendadas: cualquier GPU con compute capability sm_80 o superior (Ampere o más reciente) para activar `torch_varlen` o `flash_attn`. Ejemplos: A100, H100, L40S, RTX 3090, RTX 4090.
- GPUs consumer: cabe holgadamente en RTX 3090 y RTX 4090 con la ruta varlen; en GPUs anteriores a Ampere o en CPU funciona la ruta eager con mayor consumo de memoria a lotes grandes.
- Opciones de despliegue: `sentence-transformers` con `trust_remote_code=True`; integración con frameworks de indexación vectorial que consuman embeddings de sentence-transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica ganancias cualitativas de memoria y throughput en los niveles varlen frente a eager.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| handwoven8588/CodeRankEmbed-flash-attn | 136,7M | 8192 | MIT | Reempaquetado bf16 con atención varlen; pesos idénticos al base |
| nomic-ai/CodeRankEmbed | 136,7M | 8192 | MIT | Modelo base; atención eager únicamente, carga fp32 por defecto |
| Alternativas de embeddings de código | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias
- Modelo monolingüe en inglés: las consultas y el código en otros idiomas no están cubiertos por el entrenamiento declarado.
- No es un modelo generativo: no produce texto, código, tool calls ni razonamiento multi-paso.
- La calidad de recuperación hereda la del CodeRankEmbed original; este repositorio no la mejora, solo cambia el backend de atención.
- El prefijo de instrucción en las consultas es obligatorio; omitirlo degrada la calidad de los embeddings de consulta.
- Las rutas varlen requieren PyTorch ≥ 2.10.0 o el paquete `flash_attn` instalado, además de GPU Ampere o superior; en otros entornos se usa eager con mayor consumo de memoria.
- El modo de lotes aplanados exige `flash_attn` instalado aunque la atención se ejecute en otro nivel, porque transformers lo comprueba al cargar.
- Una selección forzada de nivel de atención no cae a un nivel inferior de forma silenciosa: lanza `RuntimeError` si no se cumple la precondición.
- Al cargar en fp32 solo se amplía el tipo, no la precisión: los pesos almacenados son bf16.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones irrelevantes en dominios de código muy especializados.
- Verificar la procedencia del reempaquetado antes de usarlo en producción: es una publicación de un tercero, no del equipo de nomic-ai.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/handwoven8588/CodeRankEmbed-flash-attn
- Modelo base: https://huggingface.co/nomic-ai/CodeRankEmbed
- Paper de referencia citado en los tags: https://arxiv.org/abs/2412.01007
