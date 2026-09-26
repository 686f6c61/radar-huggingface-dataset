# adpretko/celerity-906m-4k-ad0p2

## Resumen

Celerity 906M — 4k — ad0p2 es un checkpoint de un modelo de lenguaje de aproximadamente 906 millones de parámetros publicado por el usuario adpretko en Hugging Face. Según su propia model card, se trata de una conversión del formato de checkpoint de Cerebras (CS) al formato de Hugging Face, realizada con coincidencia estricta de claves de checkpoint (strict checkpoint-key matching). El modelo usa código de modelado propio de Celerity, por lo que requiere cargarse con `trust_remote_code=True`.

Los únicos datos técnicos que el autor documenta son la longitud de secuencia (4k), la variante de dropout de atención (ad0p2), el checkpoint de origen (checkpoint_29117) y el runtime de origen (cbcore 2.6.0). No se publican detalles de arquitectura, composición del dataset, número de tokens de entrenamiento, idiomas, licencia ni resultados de evaluación.

El repositorio es relevante únicamente como artefacto de conversión: permite reproducir o reutilizar un checkpoint entrenado en el ecosistema de Cerebras dentro del stack de PyTorch/Hugging Face, algo poco frecuente porque la mayoría de checkpoints de ese ecosistema no se distribuyen en formato compatible con `transformers`. Con 0 descargas y 0 likes en el momento de la consulta, no existe validación externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no la describe; el repositorio se etiqueta como `pytorch` y `custom_code`, con código de modelado propio de Celerity |
| Parametros totales | ~906 M (según el nombre del modelo; el tamaño del repo, 1,8 GB, es coherente con ~906 M parámetros almacenados en 16 bits) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4.096 tokens (sequence length 4k) |
| Tipos de cuantizacion | No disponible. No se publican versiones GGUF, GPTQ, AWQ ni ninguna otra cuantización |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible con precisión. El repositorio se etiqueta como `pytorch` y ocupa 1,8 GB; incluye código de modelado propio, pero no se confirma si los pesos están en safetensors o en otro formato |
| Variante de dropout de atención | ad0p2 (0,2 de dropout de atención, según la nomenclatura del autor) |
| Checkpoint de origen | checkpoint_29117 |
| Runtime de origen | cbcore 2.6.0 |
| Método de conversión | Conversión desde formato CS de Cerebras con coincidencia estricta de claves de checkpoint |
| Carga requerida | `trust_remote_code=True` (código de modelado personalizado) |
| Fecha de creación del repositorio | 26 de septiembre de 2026 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo. La model card se limita a indicar que el checkpoint original se entrenó en el ecosistema de Cerebras (formato CS, runtime `cbcore` 2.6.0), que corresponde al paso o checkpoint número 29117, y que la conversión a Hugging Face se hizo con coincidencia estricta de claves, un detalle relevante porque implica que no se han renombrado ni reasignado tensores de forma laxa: si la conversión se completó, el mapeo entre el checkpoint original y el código de modelado de Celerity es uno a uno.

El único hiperparámetro de entrenamiento documentado es el dropout de atención de 0,2 en la variante ad0p2, junto con una longitud de secuencia de 4.096 tokens. No hay información sobre el número de tokens vistos durante el preentrenamiento, la composición del dataset, si hubo fases de ajuste fino con RLHF, DPO o instrucciones, ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o mezclas de expertos. Tampoco se especifica si el dropout de atención de 0,2 se aplica en inferencia (lo habitual es que sea solo un ajuste de entrenamiento).

## Capacidades

- No hay ninguna capacidad documentada por el autor en la model card. Cualquier afirmación al respecto sería una extrapolación.
- Por el nombre y el contexto (checkpoint de preentrenamiento con longitud de secuencia de 4k), lo esperable es que sea un modelo de lenguaje autorregresivo de propósito general, pero esto no está confirmado en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio, contexto largo): no disponible. La ventana de contexto es de 4.096 tokens, sin extensiones documentadas.

## Casos de uso

- Ajuste fino supervisado sobre un dominio concreto: con ~906 M parámetros, el ajuste completo es viable en una GPU de 24 GB (por ejemplo, RTX 4090) usando precisión mixta y gradient checkpointing; la cifra es una estimación a partir del tamaño del modelo y no está publicada por el autor. Serviría para clasificación de textos, extracción de entidades o generación con estilo controlado.
- Modelo borrador en decodificación especulativa: un modelo de menos de 1.000 M de parámetros es un candidato natural como draft model de uno mayor, siempre que compartan tokenizador. Este extremo no está verificado y habría que comprobarlo antes de integrarlo.
- Prototipado e inferencia local: los pesos ocupan alrededor de 1,8 GB en 16 bits, por lo que el modelo se puede cargar en GPUs de consumo de 8 GB o más con lotes pequeños, lo que permite experimentar sin depender de servicios en la nube.
- Generación de datos sintéticos para aumentar un dataset: se puede usar para producir textos de dominio que después se filtren y revisen manualmente; al no haber benchmarks, la calidad de salida debe medirse empíricamente en cada caso.
- Investigación sobre regularización de la atención: la variante ad0p2 (dropout de atención 0,2) a 4k de contexto es un punto de comparación útil frente a variantes sin dropout del mismo autor, si están publicadas.
- Despliegue on-premise con requisitos de baja huella de memoria: en escenarios donde no se puede usar una GPU de datacenter, un modelo de ~906 M permite servir varias réplicas modestas en una sola máquina.
- Docencia y experimentación con código de modelado personalizado: útil para estudiar el patrón `trust_remote_code=True` y la conversión de checkpoints entre ecosistemas (Cerebras CS → Hugging Face).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: aproximadamente 1,8 GB en precisión de 16 bits, deducido del tamaño del repositorio (1,8 GB para ~906 M parámetros).
- VRAM estimada para inferencia: del orden de 3-4 GB en fp16 con lote 1 y contexto corto, incluyendo pesos y overhead del runtime. Es una estimación propia, no publicada.
- Caché KV: no estimable sin conocer el número de capas, cabezas y dimensión de cabeza de la arquitectura.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB; con lote pequeño es plausible en GPUs de 8 GB (RTX 3070, RTX 4060). Para ajuste completo conviene una GPU de 24 GB o más.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia; tienen sentido para ajuste fino, evaluación a gran escala o entrenamiento continuado.
- Opciones de despliegue: PyTorch + `transformers` con `trust_remote_code=True` es la vía documentada. vLLM o TGI no están garantizados al tratarse de código de modelado personalizado y requerirían integración manual. llama.cpp u Ollama no son aplicables sin una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se limita a parámetros, contexto, licencia y disponibilidad, porque no existen datos de rendimiento publicados para Celerity 906M. Los datos de los modelos comparativos provienen de sus respectivas fichas públicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Celerity 906M — 4k — ad0p2 | ~906 M | 4.096 tokens | No disponible | Hugging Face, requiere `trust_remote_code=True` | No disponible |
| Llama 3.2 1B | ~1.240 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente soportado en vLLM, llama.cpp y Ollama | Benchmarks publicados por Meta |
| Qwen2.5 1.5B | ~1.540 M | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Hugging Face, con soporte en los principales motores de inferencia | Benchmarks publicados por Alibaba |
| Cerebras-GPT 1.3B | ~1.300 M | 2.048 tokens | Apache 2.0 | Hugging Face y GPT-style checkpoints del ecosistema Cerebras | Benchmarks publicados por Cerebras |

## Limitaciones y advertencias

- Ausencia total de documentación: no hay datos de arquitectura, dataset, tokens de entrenamiento ni evaluación, lo que impide estimar la calidad del modelo antes de probarlo.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo jurídico. Conviene contactar con el autor antes de utilizarlo en producción.
- Riesgo de alucinación: al no haber evaluación ni fases de alineación documentadas (RLHF, DPO o instrucciones), es previsible que el modelo no esté ajustado para seguir instrucciones ni para evitar contenido inventado. No hay datos que lo confirmen o lo desmientan.
- Sesgos: no evaluados ni documentados; un modelo de este tamaño y sin ficha de datos puede reproducir sesgos de su corpus de entrenamiento.
- Idiomas: no se declara ninguno, por lo que el comportamiento multilingüe es desconocido.
- Límite de contexto de 4.096 tokens: insuficiente para casos de uso que requieran documentos largos o conversaciones multi-turno extensas.
- Riesgo de seguridad en la carga: el modelo exige `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario del repositorio. Debe auditarse antes de cargarlo en entornos con datos sensibles.
- Conversión no verificada por terceros: aunque se anuncia coincidencia estricta de claves, no hay pruebas publicadas de que el checkpoint convertido reproduzca el comportamiento del original.
- Ambigüedad sobre el dropout de atención: no se aclara si el 0,2 se aplica en inferencia, lo que afectaría a la reproducibilidad de los resultados.
- Sin tracción comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de fallos, degradaciones ni comportamiento en producción.
- Metadatos temporales inconsistentes: la fecha de creación del repositorio aparece como 26 de septiembre de 2026, posterior a la fecha habitual de consulta, lo que sugiere un error de metadatos o de reloj; conviene no tomarla como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-906m-4k-ad0p2
- No se han encontrado en la información proporcionada otros enlaces (paper, blog, repositorio de código, demo) asociados al modelo, ni a la familia Celerity, ni al runtime `cbcore` 2.6.0.
