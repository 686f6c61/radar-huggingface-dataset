# richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic

## Resumen

OLMo-2-0325-32B-Instruct-DiM-heretic es una variante "decensored" (o "abliterated") del modelo instructivo OLMo 2 32B de AI2 (Allen Institute for AI), publicada por el usuario richardyoung en Hugging Face. El modelo base, allenai/OLMo-2-0325-32B-Instruct, es un transformer denso de 32.234.279.936 parametros (32,2 mil millones) entrenado por AI2 con una filosofia de apertura total: pesos, datos de entrenamiento, codigo y recetas de entrenamiento publicados. Esta variante aplica una tecnica de modificacion de pesos (referida como "DiM" y "heretic" en el nombre) destinada a eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original.

El modelo conserva la arquitectura y el conocimiento del OLMo 2 32B Instruct, pero modifica el comportamiento en respuestas que el modelo base rechazaria por politicas de seguridad. La ficha oficial no documenta en detalle la metodologia exacta de la modificacion, el numero de tokens adicionales de entrenamiento ni los datos empleados en el proceso de "decensoring"; solo se indica que el resultado es "reproducible". El modelo esta pensado para investigacion sobre alineacion, red-teaming y estudios de robustez de salvaguardas.

Es relevante en el contexto actual porque OLMo 2 representa uno de los pocos esfuerzos de modelo completamente abierto a escala de 32B, y las variantes "abliterated" permiten estudiar como se distribuyen las representaciones de rechazo en el espacio de activaciones. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) en Hugging Face y requiere aceptar condiciones. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2) |
| Parametros totales | 32.234.279.936 (32,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el OLMo 2 32B Instruct base soporta 4.096 tokens; esta variante no lo especifica) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (declarada en tags), acceso gated en Hugging Face |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base OLMo 2 32B Instruct es un transformer decoder-only denso de 32,2 mil millones de parametros desarrollado por AI2. La familia OLMo 2 introduce mejoras sobre OLMo 1 en estabilidad de entrenamiento (normalizacion en capas no residuales, atencion con QK-norm) y en la composicion del corpus, con un enfasis explicito en reproducibilidad: AI2 publica el dataset de preentrenamiento (OLMo-Mix, del orden de billones de tokens), los checkpoints intermedios y las recetas de SFT y DPO. El modelo instructivo se obtiene tras preentrenamiento, ajuste supervisado y optimizacion por preferencias (DPO), segun la documentacion publica de AI2.

Sobre esta base, richardyoung aplica una modificacion de pesos etiquetada como "DiM" y "heretic". La informacion disponible no detalla la metodologia exacta: no se especifica si se trata de edicion de direcciones de activacion (estilo abliteration clasico), de un ajuste fino con datos de rechazo invertido, ni cuantos tokens o ejemplos se emplearon. El tag "reproducible" sugiere que el autor documenta el procedimiento en la model card, pero los detalles no estan incluidos en la informacion proporcionada. El dataset referenciado en los tags (allenai/RLVR-GSM-MATH-IF-Mixed-Constraints) corresponde probablemente al usado para evaluacion o como parte del pipeline de ajuste, no necesariamente al corpus de decensoring.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del OLMo 2 32B Instruct.
- Razonamiento matematico y resolucion de problemas tipo GSM/MATH (el modelo base fue ajustado con datos RLVR de matematicas e instrucciones).
- Generacion de codigo y respuesta a instrucciones tecnicas.
- Respuesta a instrucciones sin los rechazos tipicos del modelo alineado, incluyendo contenido que el base declinaria.
- Soporte de conversaciones multi-turno (formato chat de OLMo 2).
- Capacidades multilingues limitadas al ingles segun la ficha.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y salvaguardas: comparar las respuestas del modelo "heretic" con las del OLMo 2 32B Instruct original para estudiar que direcciones de activacion codifican el rechazo y como se distribuyen por capas.
- Red-teaming de sistemas de moderacion: generar respuestas que un modelo alineado rechazaria para evaluar la robustez de clasificadores de contenido y filtros de salida en pipelines de produccion.
- Estudio de sesgos y toxicidad: analizar como la eliminacion de rechazos afecta a la tasa de contenido toxico, sesgado o factualmente incorrecto, con fines de auditoria.
- Evaluacion de tecnicas de "abliteration": reproducir y contrastar el procedimiento DiM/heretic frente a otras variantes abliterated publicadas sobre OLMo 2, midiendo degradacion en benchmarks estandar (MMLU, GSM8K).
- Generacion creativa sin restricciones tematicas: escritura de ficcion con tematicas sensibles (violencia, contenido adulto) en entornos controlados de investigacion, donde el rechazo del modelo base interfiere con el flujo creativo.
- Analisis de robustez de jueces automaticos: usar el modelo como generador adversarial para probar la consistencia de evaluadores LLM-as-a-judge ante respuestas no filtradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de Hugging Face no incluye tabla de evaluacion (MMLU, GSM8K, HumanEval, etc.) para esta variante, y no se dispone de datos que permitan comparar su rendimiento con el OLMo 2 32B Instruct original ni con otras variantes abliterated. Cualquier cifra de rendimiento del modelo base no es extrapolable sin medir el impacto de la modificacion de pesos.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 64,5 GB de pesos, por lo que se necesitan al menos 2 GPU de 40 GB (A100 40GB, A6000) o una H100 80GB para inferencia sin cuantizar con margen para KV cache.
- VRAM en cuantizacion 8 bits: del orden de 32-34 GB; cabe en una A100 40GB o en una RTX 5090 (32 GB) con margen ajustado.
- VRAM en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): del orden de 17-20 GB; cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: H100 80GB o A100 80GB para BF16; A100 40GB o L40S para FP8/INT8; RTX 4090/3090 para cuantizacion 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving en BF16/FP16; llama.cpp u Ollama si se generan pesos GGUF a partir del safetensors (no se distribuyen en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic | 32,2 B | No disponible | Apache 2.0 (gated) | Restringido | Variante decensored de OLMo 2 32B Instruct |
| allenai/OLMo-2-0325-32B-Instruct | 32,2 B | 4.096 tokens (segun documentacion de AI2) | Apache 2.0 | Abierto | Modelo base alineado, con datos y receta publicados |
| Otras variantes abliterated de OLMo 2 (varios autores) | 32,2 B | Depende de la variante | Apache 2.0 | Variable | Metodologias de edicion de pesos distintas; sin comparativa de rendimiento publicada en esta ficha |
| Modelos densos abiertos de ~32B (p. ej., Qwen2.5 32B Instruct) | ~32 B | Mayor en algunos casos | Apache 2.0 / otras | Abierto | Alternativa comercial con soporte multilingue amplio; no es una variante decensored |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparativa se limita a parametros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- La modificacion "decensored" elimina o reduce los rechazos de seguridad del modelo base, lo que incrementa el riesgo de generar contenido toxico, ilegal o danino; no es apto para despliegue en produccion orientado al publico general sin filtros externos.
- Riesgo elevado de alucinacion, especialmente en dominios factuales, agravado por la perdida potencial de calibracion tras la edicion de pesos.
- Solo soporta ingles segun la ficha; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La longitud de contexto no esta especificada para esta variante; asumir la del modelo base (4.096 tokens) es una precaucion razonable, pero no confirmada.
- El acceso esta restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la redistribucion y el uso automatizado en pipelines.
- Aunque la licencia declarada es Apache 2.0, la modificacion de pesos puede plantear cuestiones legales y eticas en jurisdicciones con regulacion de contenido; revisar terminos antes de uso comercial.
- No se documenta el procedimiento exacto de decensoring ni metricas de degradacion; la reproducibilidad declarada no esta verificada en la informacion disponible.
- Sesgos conocidos del modelo base (principalmente anglocentrico y derivados de su corpus web) persisten y pueden amplificarse tras la edicion.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arxiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo (arxiv:2411.15124): https://arxiv.org/abs/2411.15124
- Referencia arxiv:2611.17846 (citada en los tags; no verificada en la informacion proporcionada)
- Dataset referenciado: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
