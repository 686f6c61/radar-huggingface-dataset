# oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored

## Resumen

Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored es un modelo de lenguaje multimodal (image-text-to-text) obtenido mediante un merge quirúrgico con mergekit. Lo publica el usuario oxpuppy635 en Hugging Face y parte de dos modelos derivados de la familia Gemma 4: MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy, usado como donante de atención "prístina", y Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, un modelo orientado a escritura creativa que sufría degradación del razonamiento en prompts largos por artefactos de eliminación de activaciones (ARA) en sus capas de atención.

La operación consiste en un `task_arithmetic` en el que los pesos de las proyecciones de atención y sus layernorms se toman íntegramente del modelo SOMPOA (delta 0.0), mientras que las capas MLP y MoE se conservan del modelo Goetia original (peso 1.0). El resultado es un modelo de 25.805.936.206 parámetros totales con arquitectura MoE de tipo Gemma 4 (etiqueta A4B, es decir, aproximadamente 4.000 millones de parámetros activos), empaquetado en bfloat16 y con un repositorio de 51,6 GB.

Su relevancia es acotada pero concreta: demuestra una técnica de reparación de merges que restaura la capacidad de razonamiento y "thinking" sin sacrificar el estilo de escritura creativa del modelo original. No obstante, se trata de un modelo experimental, sin benchmarks publicados, con licencia "other" y sin idiomas declarados, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4, variante A4B; merge `task_arithmetic` sobre base Gemma 4 26B-A4B) |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | Aproximadamente 4 B (según la etiqueta A4B de la familia; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en bfloat16 (cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (bfloat16), librería transformers |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Tamano del repositorio | 51,6 GB |
| Metodo de merge | mergekit, `task_arithmetic`, dtype bfloat16 |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. La arquitectura subyacente es la de Gemma 4 en su variante 26B-A4B, un transformer con mezcla de expertos (MoE) en el que solo una fracción de los parámetros se activa por token (etiqueta A4B, del orden de 4.000 millones de activos). Sobre esa base se aplica un `task_arithmetic` con dos fuentes: el modelo SOMPOA como ancla (peso 0.0 sobre `self_attn`, `input_layernorm` y `post_attention_layernorm`, de modo que esas capas quedan idénticas al donante) y el modelo Goetia como cuerpo objetivo (peso 1.0 en el resto, es decir, MLP y capas MoE). El tokenizer se hereda del modelo base.

La motivación declarada es reparar la rotura de razonamiento que el modelo Goetia original presentaba en prompts extensos o complejos, atribuida a artefactos de eliminación de activaciones (ARA) en las capas de atención. Al sustituir esas capas por las del modelo SOMPOA, se recupera la capacidad de "thinking" preservando el comportamiento de escritura creativa codificado en las capas MLP y MoE. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en los modelos de origen; la model card no los detalla.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Escritura creativa: es la capacidad central del cuerpo Goetia conservado en las capas MLP/MoE.
- Razonamiento y modo "thinking" restaurado gracias a las capas de atención del donante SOMPOA (etiqueta `reasoning-restored`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado de la familia Gemma 4.
- Razonamiento multi-paso en prompts largos o complejos, que era precisamente el punto débil del modelo original.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Capacidades de agente autónomo: no disponible (no declarado).
- Cobertura multilingüe: no disponible (sin idiomas declarados).

## Casos de uso

- Escritura creativa asistida: el modelo está diseñado para generar narrativa, diálogo y prosa con el estilo del cuerpo Goetia, y ahora mantiene la coherencia en pasajes largos gracias a la atención restaurada del donante SOMPOA.
- Reescritura y edición de textos extensos: al recuperar el razonamiento en prompts complejos, puede recibir un capítulo completo y aplicar instrucciones de estilo o estructura sin perder el hilo.
- Generación de guiones y diálogos multi-turno: la etiqueta `conversational` y el contexto de la familia Gemma 4 permiten mantener personajes y tramas consistentes a lo largo de una conversación.
- Prototipado de asistentes con entrada de imagen: el pipeline `image-text-to-text` permite describir o comentar imágenes dentro de un flujo creativo (por ejemplo, generar texto a partir de una ilustración de referencia).
- Investigación sobre técnicas de merge: sirve como caso de estudio reproducible de reparación de modelos mediante `task_arithmetic` con filtros por nombre de capa, útil para quien experimente con mergekit.
- Evaluación comparativa de merges: permite medir empíricamente si sustituir solo las capas de atención recupera el razonamiento sin degradar el estilo, comparándolo con el Goetia original y con el SOMPOA.
- Generación de contenido de ficción para blogs o juegos de rol: con los samplers recomendados (temperature 0.8-1.0, min-p 0.03, top-p 0.95, top-k 64) se obtiene un equilibrio entre creatividad y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 52 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan 2 GPU de 48 GB o una GPU de 80 GB.
- Cuantización a 8 bits: aproximadamente 26 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con offloading parcial.
- Cuantización a 4 bits: alrededor de 13-14 GB de pesos, cabe en GPU de consumo como RTX 4090, RTX 3090 o RTX 4080, siempre que se genere una cuantización propia (el autor no publica GGUF).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin compromisos; A6000 48 GB en configuraciones de dos tarjetas.
- Despliegue: transformers (soporte nativo declarado), vLLM y TGI para servir en bfloat16; llama.cpp u Ollama solo si se convierte previamente a GGUF, ya que no hay artefactos publicados.
- Latencia y throughput: no disponibles; al ser un MoE con aproximadamente 4 B activos, el throughput por token debería ser sustancialmente mayor que el de un denso de 26 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored (este) | 25,8 B totales / ~4 B activos | no disponible | MoE multimodal | other | Hugging Face, safetensors bf16 |
| Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA | 25,8 B (misma base) | no disponible | MoE multimodal | other | Hugging Face |
| MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy | 25,8 B (misma base) | no disponible | MoE multimodal | other | Hugging Face |
| Gemma 4 26B-A4B-it (original de Google) | 25,8 B totales / ~4 B activos | no disponible | MoE multimodal | Gemma Terms of Use | Hugging Face |

La comparación de rendimiento entre estos modelos no está disponible: ninguno de los repositorios consultados publica resultados de benchmarks, por lo que no es posible establecer diferencias cuantitativas más allá de la descripción cualitativa del autor (razonamiento restaurado frente al Goetia original).

## Limitaciones y advertencias

- Modelo experimental sin benchmarks: no hay evidencia cuantitativa de que la reparación de atención funcione en todos los casos; la mejora del razonamiento es una afirmación del autor, no un resultado medido.
- Licencia "other": no se especifican los términos exactos; antes de cualquier uso comercial hay que verificar la licencia del modelo base Gemma 4 y de los modelos intermedios, que pueden imponer restricciones adicionales.
- Sin idiomas declarados: no se garantiza un rendimiento multilingüe equilibrado; conviene evaluar en el idioma objetivo antes de desplegar.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin medirla empíricamente.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia y potencialmente amplificado en un merge que combina capas de dos modelos distintos.
- Sesgos: no documentados por el autor; los sesgos de los modelos de origen (Gemma 4 y sus derivados) se heredan sin mitigación declarada.
- Procedencia del merge: al combinar atención de un modelo y MLP/MoE de otro, pueden aparecer comportamientos impredecibles en dominios no cubiertos por la escritura creativa.
- Sin cuantizaciones oficiales: la ausencia de GGUF o AWQ publicados obliga a generarlas uno mismo, con el riesgo de degradación adicional que ello conlleva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay comunidad que haya validado el modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored
- Modelo donante de atención (SOMPOA): https://huggingface.co/MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy
- Modelo cuerpo (Goetia original): https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
