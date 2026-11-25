# richardyoung/Phi-3.5-mini-instruct-heretic

## Resumen

Phi-3.5-mini-instruct-heretic es una variante "abliterated" (también etiquetada como *uncensored* o *decensored*) del modelo Phi-3.5-mini-instruct de Microsoft, publicada por el usuario richardyoung en Hugging Face. El modelo base es un transformer denso de aproximadamente 3.821 millones de parámetros (3,8 B), diseñado originalmente por Microsoft para generación de texto, razonamiento, código y matemáticas en contextos de hasta 128.000 tokens. Esta versión concreta aplica técnicas de modificación de pesos orientadas a eliminar los mecanismos de rechazo y alineación del modelo original, manteniendo la arquitectura y el tokenizador de Phi-3.5.

El interés de esta ficha radica en que documenta una práctica habitual en la comunidad open source: la publicación de variantes "desalineadas" de modelos comerciales o de pesos abiertos, con fines de investigación sobre seguridad, evaluación de sesgos y estudio de los mecanismos de rechazo. La licencia declarada es MIT, aunque al tratarse de un derivado de un modelo de Microsoft conviene verificar las condiciones del modelo original antes de cualquier uso comercial.

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar los pesos. El modelo se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere `trust_remote_code=True` en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3, `phi3`) |
| Parámetros totales | 3.821.079.552 (3,8 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Phi-3.5-mini soporta 128.000 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada (el modelo base admite GGUF, AWQ, int4/int8 en el ecosistema) |
| Idiomas soportados | multilingüe (etiqueta `multilingual`); el modelo base cubre principalmente inglés, con soporte limitado de otros idiomas |
| Licencia | MIT (según la model card; verificar condiciones del modelo base de Microsoft) |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-3.5-mini-instruct de Microsoft, un transformer decoder-only denso de 3,8 B de parámetros con atención multi-cabeza estándar y tokenizador propio de la familia Phi-3. El modelo base fue entrenado por Microsoft sobre una mezcla de datos sintéticos y datos web filtrados por calidad, con fases de ajuste supervisado y optimización por preferencias (DPO) para alineamiento conversacional. La información disponible no detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación "heretic" consiste en una intervención sobre los pesos del modelo original para reducir o eliminar los comportamientos de rechazo (refusals) ante peticiones que el modelo alineado rechazaría. Los tags indican `abliterated`, `uncensored`, `decensored` y `reproducible`, lo que sugiere que el proceso es reproducible mediante scripts del autor. No se especifica en la información proporcionada qué método exacto (por ejemplo, abliteration por proyección ortogonal de la dirección de rechazo, fine-tuning con datos descensurados u otra técnica) se ha aplicado, ni cuántos tokens o pasos de entrenamiento adicionales se han utilizado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Phi-3.5-mini-instruct.
- Razonamiento y matemáticas de nivel medio, con capacidad para resolver problemas de varios pasos.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, etc.), según las capacidades del modelo base.
- Soporte de instrucciones y formato de chat (chat template de la familia Phi-3).
- Capacidad multilingüe limitada, etiquetada como `multilingual` pero con cobertura principal del inglés.
- Comportamiento "uncensored": reduce los rechazos ante peticiones que el modelo alineado bloquearía.
- Compatible con `text-generation-inference` y endpoints compatibles, según los tags del repositorio.
- No se ha confirmado en la información proporcionada soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre seguridad y alineamiento: el modelo permite estudiar qué comportamientos de rechazo se eliminan y cómo afecta a la utilidad y a los sesgos, comparando respuestas con el Phi-3.5-mini-instruct original en un mismo conjunto de prompts.
- Evaluación de robustez de filtros: sirve para probar sistemas de moderación de contenido y clasificadores de seguridad frente a un modelo que no aplica rechazos por defecto.
- Generación de texto creativo sin restricciones temáticas: útil en entornos controlados de escritura de ficción, guiones o narrativa donde el modelo alineado rechazaría ciertos temas.
- Experimentación académica con técnicas de abliteration: al ser un derivado reproducible, permite replicar el proceso y medir el impacto en benchmarks de razonamiento y conocimiento.
- Prototipado rápido de asistentes conversacionales en local: con 3,8 B de parámetros, se puede desplegar en una GPU de consumo para pruebas de diálogo multi-turno.
- Análisis de sesgos y toxicidad: como modelo sin alineación, es útil para generar corpus de prueba que expongan fallos en pipelines de filtrado y en evaluaciones de seguridad.
- Fine-tuning posterior para dominios específicos: al tener licencia MIT y pesos abiertos, se puede adaptar a tareas verticales, siempre que se respeten las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base. Cualquier cifra de rendimiento del Phi-3.5-mini-instruct original no es directamente extrapolable a esta variante sin medición empírica, ya que la modificación de pesos puede degradar capacidades de razonamiento y conocimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,6 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 10-12 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización int8: en torno a 4 GB; en int4 (GGUF Q4) aproximadamente 2,5-3 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para fp16 con contexto largo; RTX 3090/4080 para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, especialmente con cuantización int8 o int4.
- Opciones de despliegue: transformers con `trust_remote_code=True`, text-generation-inference (TGI), vLLM (verificando compatibilidad con `phi3` y el código personalizado), llama.cpp/Ollama si se generan pesos GGUF (no confirmado en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Alineación | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Phi-3.5-mini-instruct-heretic | 3,8 B | no disponible (base: 128k) | MIT (derivado) | Sin rechazos (abliterated) | Gated en HF |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Alineado (SFT + DPO) | Abierto en HF |
| Meta-Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Alineado | Abierto en HF (con condiciones) |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (extensible) | Apache 2.0 | Alineado | Abierto en HF |

La comparativa se basa en características públicas de los modelos; no se dispone de datos de benchmarks de esta variante concreta para comparar rendimiento empírico.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, peligroso o ilegal; no es adecuado para despliegues públicos sin filtros externos de moderación.
- Riesgo elevado de alucinación y de respuestas erróneas en dominios factuales, agravado por la modificación de pesos respecto al modelo base.
- La eliminación de rechazos puede degradar capacidades de razonamiento e instrucción; no hay benchmarks publicados que cuantifiquen esa degradación.
- Licencia MIT declarada, pero al derivar de Phi-3.5-mini-instruct de Microsoft conviene revisar las condiciones del modelo original y la legislación aplicable antes de uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- Requiere `trust_remote_code=True` por el código personalizado; auditar el código antes de ejecutarlo en producción.
- Soporte multilingüe limitado; el rendimiento en castellano no está documentado y probablemente sea inferior al inglés.
- No se ha confirmado soporte de tool calling, agentes o visión; no asumir estas capacidades sin verificación empírica.
- Fecha de creación y actualización del repositorio inusuales (2026); verificar la integridad de los pesos y la procedencia antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Phi-3.5-mini-instruct-heretic
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Paper Phi-3 (arXiv:2404.14219): https://arxiv.org/abs/2404.14219
- Paper Phi-3.5 (arXiv:2407.13833): https://arxiv.org/abs/2407.13833
- Paper relacionado (arXiv:2403.06412): https://arxiv.org/abs/2403.06412
