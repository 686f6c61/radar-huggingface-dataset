# richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-MPOA-heretic es una variante "abliterated/decensored" del modelo OLMo 2 32B Instruct de AI2 (Allen Institute for AI), publicada por el usuario richardyoung en Hugging Face. El modelo base OLMo 2 es un transformer decoder-only de 32.234.279.936 parámetros (aproximadamente 32B), entrenado desde cero por AI2 con datos abiertos y pesos completamente reproducibles. Esta variante aplica una técnica de modificación de pesos (etiquetada como "heretic" y "MPOA") orientada a eliminar los mecanismos de rechazo y censura del modelo original, manteniendo el resto de capacidades intactas.

La relevancia de esta ficha radica en dos factores. Primero, OLMo 2 es uno de los pocos linajes de modelos de gran tamano completamente abiertos (datos, código de entrenamiento y pesos), lo que lo convierte en una referencia para investigación reproducible. Segundo, esta variante concreta explora la modificación post-entrenamiento de comportamientos de seguridad, un área de interés tanto técnico como de política de uso. El acceso está restringido en Hugging Face (gated) y la licencia declarada es Apache 2.0, aunque el modelo base de AI2 se distribuye bajo licencia Apache 2.0 con términos adicionales de uso responsable.

El modelo está orientado exclusivamente al inglés, con una ventana de contexto heredada del OLMo 2 base y formato de pesos safetensors para transformers. No se han publicado resultados de benchmarks específicos para esta variante en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2) |
| Parametros totales | 32.234.279.936 (~32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del OLMo 2 base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (declarada en la model card); acceso restringido (gated) en Hugging Face |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 2 de AI2: un transformer decoder-only denso de aproximadamente 32B parametros. OLMo 2 introduce mejoras respecto a OLMo 1, como normalizacion RMSNorm reordenada, atencion con QK-Norm y un esquema de entrenamiento por etapas con datos abiertos (Dolma, entre otros). El modelo base OLMo-2-0325-32B-Instruct fue afinado por instrucciones sobre el modelo preentrenado, incorporando datos de instrucciones y preferencias, incluyendo el dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints citado en la model card.

Esta variante concreta aplica una modificación post-entrenamiento etiquetada como "MPOA" y "heretic". La model card no detalla la metodología exacta ni el número de tokens o pasos de la intervención. La técnica "abliteration" suele consistir en la identificación y supresión de direcciones de activación asociadas a comportamientos de rechazo, típicamente mediante edición de pesos o proyecciones ortogonales en las matrices de atención/MLP. No se dispone de información verificable sobre el dataset o procedimiento exacto empleado por el autor. El modelo se distribuye como fine-tune del OLMo-2-0325-32B-Instruct original.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat instruido heredado del modelo base.
- Razonamiento y matematicas: el modelo base fue afinado con datos RLVR de GSM y MATH, por lo que conserva capacidades aritmeticas y de razonamiento paso a paso.
- Generacion de codigo y respuesta a instrucciones tecnicas (capacidad heredada del OLMo 2 Instruct).
- Comportamiento "decensored": la intervencion busca reducir rechazos ante solicitudes que el modelo original declinaria; no implica necesariamente mayor calidad ni mayor veracidad.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modelo base OLMo 2 no se presenta como modelo agente nativo.
- Capacidades multilingues: limitadas al ingles segun la model card (idioma declarado: en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles en esta variante.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la supresion de direcciones de rechazo afecta al comportamiento del modelo en dominios sensibles, comparando con el OLMo 2 Instruct original como control.
- Analisis de robustez de filtros de seguridad: util para evaluar la eficacia de clasificadores de contenido y guardrails frente a modelos abliterated, en entornos de laboratorio aislados.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas, en contextos donde el operador asume la responsabilidad editorial.
- Experimentacion con modelos abiertos de 32B: al ser un linaje completamente abierto, sirve para estudiar tecnicas de edicion de pesos sobre checkpoints reproducibles.
- Fine-tuning posterior en dominios especificos: el checkpoint safetensors puede servir como punto de partida para ajustes supervisados en ingles, aunque la modificacion de seguridad puede no ser deseable en todos los dominios.
- Evaluacion comparativa de tecnicas de "decensoring": banco de pruebas para medir la degradacion (o no) de capacidades como MMLU o GSM8K tras la intervencion, frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base. Para referencia, los benchmarks del modelo base OLMo-2-0325-32B-Instruct estan publicados por AI2 en su model card oficial, pero no se trasladan automaticamente a esta variante modificada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB solo para pesos (32B x 2 bytes), mas overhead de KV cache; se recomienda 80 GB o mas (A100 80GB, H100 80GB).
- Cuantizacion a 8 bits: ~32-36 GB de VRAM; viable en A100 40GB o 2x RTX 4090 (24GB cada una) con tensor parallelism.
- Cuantizacion a 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo): ~18-22 GB; podria caber en una RTX 4090 24GB o RTX 3090, con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB para BF16; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI (compatibles con arquitectura olmo2 en versiones recientes), llama.cpp/Ollama solo si se generan pesos GGUF (no incluidos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic | ~32B | No disponible | Apache 2.0 (declarada) | Gated | Variante abliterated del OLMo 2 32B Instruct |
| allenai/OLMo-2-0325-32B-Instruct | ~32B | No disponible en esta ficha | Apache 2.0 + terminos de uso responsable | Abierto | Modelo base original, con benchmarks publicados por AI2 |
| Qwen2.5-32B-Instruct | ~32B | 128K (segun model card oficial) | Apache 2.0 | Abierto | Alternativa densa de 32B ampliamente usada, multilingue |
| Gemma-2-27B-it | ~27B | 8K (segun model card oficial) | Gemma Terms of Use | Abierto con condiciones | Alternativa cercana en tamano, licencia no Apache |

La comparativa se limita a datos publicos de las model cards oficiales; no se dispone de benchmarks de esta variante concreta que permitan una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- La intervencion "heretic/MPOA" reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido danino, sesgado o inexacto sin advertencia.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para esta variante; la modificacion de pesos puede degradar capacidades de razonamiento y verificacion.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia: aunque se declara Apache 2.0, el modelo base OLMo 2 de AI2 incluye terminos de uso responsable; el uso comercial de esta variante modificada debe revisarse con cuidado y no esta exento de riesgos legales o reputacionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribucion automatizada.
- Procedencia y reproducibilidad: la model card no documenta el metodo exacto, los hiperparametros ni los datos de la intervencion, lo que dificulta la replicacion.
- No apto para produccion en dominios regulados (salud, legal, finanzas) sin evaluacion adicional y guardrails externos.
- Sin benchmarks publicados: no hay evidencia de que conserve el rendimiento del modelo base en tareas estandar.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arxiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo 1 (arxiv:2411.15124): https://arxiv.org/abs/2411.15124
- Dataset citado: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Blog de AI2 sobre OLMo 2: https://allenai.org/blog/olmo2
