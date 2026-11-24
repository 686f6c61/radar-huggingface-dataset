# richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-GMPOA-heretic es una variante "abliterated" (decensurada) del modelo OLMo 2 32B Instruct de AI2, publicada por el usuario richardyoung en Hugging Face. El modelo parte de los pesos de `allenai/OLMo-2-0325-32B-Instruct` y les aplica una tecnica de modificacion de direcciones de rechazo (denominada GMPOA en el nombre del repositorio y etiquetada como "heretic"), con el objetivo de eliminar las respuestas de negativa aprendidas durante el alineamiento. El resultado es un modelo de 32.234 millones de parametros con licencia Apache 2.0 que mantiene la arquitectura y el conocimiento del original, pero con un comportamiento menos restrictivo ante peticiones sensibles.

El modelo base OLMo 2 32B es un transformer decoder-only denso entrenado desde cero por el Allen Institute for AI, con un contexto nativo de 4096 tokens que puede extenderse hasta 32.768 mediante RoPE scaling. Esta variante hereda esas caracteristicas y anade un ajuste fino adicional orientado a eliminar el rechazo, manteniendo el pipeline de `text-generation` y el soporte para la libreria `transformers`. Es relevante para investigadores interesados en mecanismos de alineamiento, tecnicas de abliteration y evaluacion de sesgos, no tanto para despliegues de produccion convencionales.

El repositorio tiene acceso restringido (gated) y, en el momento de la consulta, acumula 328 descargas y 0 likes. El tamano del repositorio es de 64,5 GB en formato safetensors, lo que refleja los pesos completos en precision de entrenamiento (probablemente bf16). La unica lengua declarada es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo 2), con atencion no-parametrica (sin positional embeddings aprendidos, RoPE) y normalizacion RMSNorm reordenada |
| Parametros totales | 32.234.279.936 (32,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens nativos; extensible a 32.768 con RoPE scaling (heredado del base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los pesos se distribuyen en safetensors, presumiblemente bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 (etiqueta `license:apache-2.0`), aunque el repositorio esta gated y las etiquetas incluyen `openrail++` en los tags |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2 32B: un transformer decoder-only denso con 32.234 millones de parametros, atencion con RoPE, RMSNorm sin sesgo y una disposicion de normalizacion reordenada respecto a OLMo 1. El modelo base fue entrenado por AI2 desde cero sobre un corpus propio (Dolma) de varios billones de tokens, con fases de entrenamiento supervisado y preferencia (DPO) para producir la version Instruct. La variante aqui descrita no documenta el numero exacto de tokens adicionales usados en el ajuste "heretic"; la informacion disponible solo indica que se parte de `allenai/OLMo-2-0325-32B-Instruct` y que se aplica una tecnica de modificacion de direcciones de rechazo.

El ajuste "GMPOA-heretic" consiste, segun la nomenclatura del autor, en una intervencion sobre las representaciones internas para suprimir la direccion de activacion asociada a las respuestas de negativa, sin reentrenar el modelo completo. Este tipo de intervenciones (abliteration) suele implementarse mediante edicion de pesos o proyecciones sobre capas concretas, y no requiere un dataset supervisado extenso. El dataset referenciado en los tags (`allenai/RLVR-GSM-MATH-IF-Mixed-Constraints`) corresponde al corpus de RLVR usado en el entrenamiento del OLMo 2 Instruct original, no necesariamente al ajuste heretic. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, heredada del OLMo 2 32B Instruct.
- Razonamiento matematico y de sentido comun, con soporte para cadenas de pensamiento (el base fue entrenado con RLVR sobre GSM y MATH).
- Generacion de codigo y seguimiento de instrucciones complejas.
- Respuestas menos restrictivas ante peticiones que el modelo original rechazaria (objetivo declarado del ajuste heretic).
- Soporte de tool calling y function calling: no documentado explicitamente en la informacion proporcionada; el base OLMo 2 Instruct incluye capacidades de instruccion, pero no se confirma soporte nativo de herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking explicito, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: el modelo sirve como sujeto de estudio para medir como cambia la tasa de rechazo y la calidad de respuesta tras eliminar la direccion de negativa, comparandolo con el OLMo 2 Instruct original.
- Evaluacion de sesgos y seguridad: util para construir conjuntos de pruebas que midan la robustez de filtros y clasificadores frente a un modelo decensurado, en entornos controlados de laboratorio.
- Generacion de texto creativo sin restricciones editoriales: escritura de ficcion, guiones o dialogos donde el modelo original tenderia a rechazar tematicas adultas o controvertidas, siempre que el uso cumpla la licencia.
- Red teaming de pipelines de moderacion: integrar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de guardrails en produccion.
- Analisis de datos sensibles en investigacion academica: procesamiento de corpus con lenguaje explicito (por ejemplo, estudios de odio en redes sociales) donde un modelo censurado degradaria la fidelidad del analisis.
- Fine-tuning posterior sobre dominios especializados: al estar en safetensors y con licencia Apache 2.0, puede servir como base para ajustes supervisados en nichos donde el rechazo del modelo original interfiere (por ejemplo, literatura medica o legal con terminologia cruda).
- Despliegue en entornos de investigacion con GPU unica: con 32 B en bf16 ocupa aproximadamente 64 GB, por lo que requiere cuantizacion para caber en GPUs consumer; util para experimentos de laboratorio mas que para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base. Cualquier cifra de rendimiento del OLMo 2 32B Instruct original no es trasladable automaticamente a esta variante sin medicion empirica.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 64,5 GB solo para pesos, mas overhead de activaciones y cache KV; requiere al menos 80 GB para inferencia comoda (A100 80GB, H100 80GB).
- VRAM estimada en cuantizacion 8 bits: en torno a 32-35 GB, cabe en A100 40GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- VRAM estimada en cuantizacion 4 bits: en torno a 18-20 GB, potencialmente desplegable en una RTX 4090 o RTX 3090 de 24 GB, con perdida de calidad no cuantificada.
- GPU recomendadas: H100 80GB o A100 80GB para precision completa; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI presumiblemente compatibles al ser arquitectura OLMo 2, aunque no se confirma en la informacion; llama.cpp y Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic | 32,2 B | 4.096 (ext. 32.768) | Apache 2.0 | Gated en HF | Variante decensurada, solo ingles |
| allenai/OLMo-2-0325-32B-Instruct | 32,2 B | 4.096 (ext. 32.768) | Apache 2.0 | Abierto en HF | Modelo base original, con rechazo alineado |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 nativo | Apache 2.0 | Abierto en HF | Multilingue, ampliamente usado en produccion |
| Gemma-2-27B-it | 27 B | 8.192 | Gemma license (uso comercial con restricciones) | Gated en HF | Menor tamano, contexto mayor que OLMo 2 |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento publicados para esta variante que permitan una comparacion cuantitativa con los alternativos.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo puede degradar la coherencia y la calidad general del modelo en tareas benignas; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo elevado de generar contenido danino, ilegal o sexualmente explicito; el modelo no debe desplegarse en aplicaciones orientadas al publico sin filtros externos.
- Alucinacion: el modelo base OLMo 2 32B ya presenta tasas de alucinacion no triviales; el ajuste heretic no las corrige y podria agravarlas al reducir la cautela en las respuestas.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto limitado a 4.096 tokens nativos; aunque se puede extender a 32.768 con RoPE scaling, la calidad mas alla de la ventana nativa no esta documentada.
- Licencia: aunque los tags incluyen Apache 2.0, tambien aparece `openrail++`; la coexistencia de ambas etiquetas genera ambiguedad sobre los terminos exactos de uso comercial. Ademas, el acceso es gated y requiere aceptar condiciones en Hugging Face.
- El autor es un usuario individual, no AI2; no hay garantias de mantenimiento, soporte ni trazabilidad del proceso de modificacion de pesos.
- No se documenta el dataset ni el procedimiento exacto del ajuste GMPOA-heretic, lo que dificulta la reproducibilidad.
- Uso responsable: recomendado exclusivamente para investigacion en entornos controlados, red teaming y estudio de mecanismos de alineamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arxiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo 1 / Dolma (arxiv:2411.15124): https://arxiv.org/abs/2411.15124
- Dataset RLVR referenciado: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
