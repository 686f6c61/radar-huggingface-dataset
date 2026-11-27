# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic es un ajuste fino del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. El modelo se presenta como una variante "heretic", "abliterated" y "decensored", lo que en la practica significa que se ha aplicado una tecnica de ablacion de direcciones de rechazo (refusal directions) para reducir la tendencia del modelo base a negarse a responder determinadas peticiones. El resultado es un modelo conversacional con menos filtros de seguridad aprendidos, manteniendo la arquitectura y capacidades del original.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only denso de 7.615.616.512 parametros (segun los pesos en safetensors), entrenado por Alibaba Qwen para generacion de texto, razonamiento, codigo y conversacion multilingue. Esta variante conserva esa base y anade el proceso de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones) junto con ajustes adicionales que el autor etiqueta como "DiM" (no documentado en la informacion disponible).

La relevancia de esta ficha radica en que se trata de un modelo derivado con licencia Apache 2.0 pero con acceso restringido (gated) en Hugging Face, y con un conjunto de etiquetas que lo posicionan en el nicho de modelos "sin censura" para investigacion sobre alineamiento, evaluacion de sesgos y estudios de seguridad. No es un modelo oficial de Alibaba ni cuenta con garantias de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliable; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo contiene pesos safetensors en precision completa (15,2 GB) |
| Idiomas soportados | en (segun la model card); el modelo base soporta multiples idiomas, pero esta variante solo declara ingles |
| Licencia | apache-2.0 (etiqueta); el campo de licencia de la model card indica openrail++ |
| Formato de pesos | safetensors (transformers) |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 15,2 GB |
| Descargas | 551 |
| Likes | 0 |
| Fecha de creacion | 2026-11-05 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala y posteriormente alineado mediante instrucciones y preferencias (SFT y optimizacion de preferencias). No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion del dataset del modelo base.

Sobre esa base, el autor ha aplicado un proceso de "abliteration": identificacion de la direccion de rechazo en el espacio de activaciones y ablacion de esa direccion en los pesos, de modo que el modelo pierde parte de su comportamiento de negativa ante peticiones que el original rechazaria. Las etiquetas incluyen "DiM" y "heretic", terminos que no estan documentados en la informacion disponible; no se puede confirmar si implican una fase adicional de ajuste fino supervisado, DPO u otra tecnica. El modelo se distribuye como pesos safetensors compatibles con transformers y text-generation-inference, y declara compatibilidad con endpoints.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo (capacidades del modelo base; no verificadas especificamente para esta variante).
- Reduccion de rechazos: el proceso de abliteration elimina parte de las negativas aprendidas, lo que permite respuestas a peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-Instruct, aunque no confirmado en esta variante.
- Capacidades multilingues: la model card solo declara ingles; el modelo base soporta varios idiomas, pero no hay confirmacion para esta variante.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de la direccion de rechazo afecta al comportamiento del modelo en tareas de evaluacion de seguridad, comparando respuestas con el modelo base.
- Analisis de sesgos y robustez: util para medir hasta que punto el ajuste de seguridad del modelo original condiciona las respuestas en dominios sensibles, en un entorno controlado de investigacion.
- Generacion de contenido creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas que el modelo base rechazaria por sus filtros.
- Red teaming de sistemas: uso como modelo adversario para probar clasificadores de contenido, filtros de moderacion y pipelines de seguridad en produccion.
- Evaluacion comparativa de modelos derivados: al compartir base con Qwen2.5-7B-Instruct, sirve como referencia para estudiar el efecto de tecnicas de decensurado en benchmarks estandar.
- Despliegue local en entornos de investigacion: con 7,6 mil millones de parametros y pesos safetensors, puede servirse con transformers o text-generation-inference en una unica GPU de gama alta para experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 15,2 GB en el repositorio; en precision completa (fp16/bf16) se necesitan aproximadamente 16 GB solo para pesos, mas overhead de activaciones y KV cache, por lo que se recomienda al menos 24 GB de VRAM.
- Cuantizacion: no se distribuyen pesos cuantizados en el repo; para reducir VRAM habria que generar versiones GGUF/AWQ/GPTQ a partir de los safetensors (no disponibles en la informacion proporcionada).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion a 8 bits o inferior (no incluida en el repo).
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), endpoints compatibles; llama.cpp/Ollama requeririan conversion a GGUF no incluida.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-DiM-heretic | 7,6 B | no disponible (base: 32.768) | apache-2.0 / openrail++ | Gated | Variante abliterated del Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | apache-2.0 | Abierto | Modelo base oficial de Alibaba, con filtros de seguridad |
| Otros derivados abliterated de Qwen2.5-7B | 7,6 B | variable | variable | variable | Multiples variantes comunitarias; no se dispone de datos concretos en la informacion proporcionada |

## Limitaciones y advertencias

- El proceso de abliteration reduce los rechazos del modelo, lo que puede producir contenido inapropiado, ofensivo o danino; no es apto para despliegues de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, especialmente en dominios donde el modelo base ya era propenso a inventar.
- La model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion para uso en produccion y para la reproducibilidad.
- Inconsistencia de licencia: los tags indican apache-2.0 pero el campo de licencia de la model card apunta a openrail++; conviene verificar las condiciones reales antes de uso comercial.
- El termino "DiM" y el proceso exacto de entrenamiento no estan documentados en la informacion disponible, lo que dificulta evaluar la reproducibilidad y el alcance real de las modificaciones.
- No hay benchmarks publicados que permitan cuantificar la degradacion (o mejora) respecto al modelo base.
- Modelo derivado no oficial: sin soporte de Alibaba ni garantias de mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper referenciado (arxiv:2611.17846): no disponible (identificador no verificable en la informacion proporcionada)
