# Puerh0x1/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es una edición en el espacio de pesos del modelo Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), publicada por el usuario Puerh0x1 en HuggingFace. No se trata de un fine-tune ni de un modelo entrenado desde cero: es una ablación de la dirección de rechazo (*refusal-direction ablation*), una técnica conocida como "abliteration" que modifica los pesos para reducir la tendencia del modelo a negarse a responder determinadas peticiones. El checkpoint conserva los 9.409.813.744 parámetros del modelo base y se distribuye en safetensors a precisión BF16.

El modelo base es multimodal (los tags del repositorio incluyen `image-text-to-text`) y, según la model card, los pesos de visión se dejaron intactos, por lo que la edición afecta únicamente al componente de lenguaje. El repositorio también incluye 15 tensores MTP (*multi-token prediction*) sin modificar, restaurados desde el checkpoint base en el fichero `original-mtp.safetensors` e indexados junto al resto de pesos.

Su relevancia es fundamentalmente de investigación: permite estudiar técnicas de eliminación de rechazos, servir como material de *red-teaming* y comparar el comportamiento de distintas variantes abliteradas del mismo base. El autor advierte explícitamente de que la ablación no implica que el rechazo haya desaparecido y de que la evaluación se hizo solo sobre el conjunto de selección, sin conjunto *held-out*. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tags `qwen3_5`, `image-text-to-text`); configuración interna no detallada en la información disponible |
| Parametros totales | 9.409.813.744 (aproximadamente 9,41 mil millones), según safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el ejemplo de despliegue del autor usa `--max-model-len 32768` |
| Tipos de cuantizacion | no se publica ninguna cuantización; pesos en BF16. No hay GGUF en el repositorio |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) + `original-mtp.safetensors` con 15 tensores MTP |
| Modelo base | Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| Tipo de modificación | Edición en el espacio de pesos (ablación de dirección de rechazo), no es un fine-tune |
| Tamaño del repositorio | 19,3 GB |
| Pipeline / librería | text-generation / transformers |
| Fecha de publicación | 2026-09-25 (actualizado el mismo día) |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado por edición de pesos, no por entrenamiento adicional. La herramienta empleada es Heretic (revisión `3521f8648a0dccf6e12a92666862632235fac7e6`), ejecutada en precisión BF16 y sin cuantización. El procedimiento sigue el enfoque de direcciones contrastivas de Arditi et al. 2024 (revisión `9d852fae1a9121c78b29142de733cb1340770cc3`), con 128 prompts dañinos y 128 prompts inofensivos para calcular la dirección de rechazo, y un conjunto de validación de 32 prompts (32/32, semilla 42, 100 ensayos). No se aplicó RLHF ni DPO: la única intervención sobre el modelo es la proyección/eliminación de esa dirección en el espacio de pesos.

Dos detalles técnicos merecen atención. Primero, los pesos del codificador de visión quedaron sin modificar, de modo que la abliteración se limita a la parte lingüística del modelo multimodal. Segundo, el checkpoint contiene tensores MTP que no fueron alterados: 15 de ellos se restauraron desde el checkpoint base al fichero `original-mtp.safetensors` y aparecen listados en el índice. La presencia de estos tensores apunta a que el base incorpora componentes de predicción multi-token, aunque la información disponible no detalla si se usan para decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés y chino (tags `text-generation` y `conversational`, idiomas en/zh).
- Entrada multimodal de imagen y texto según los tags del repositorio (`image-text-to-text`); el tower de visión se conserva intacto respecto al base, aunque no hay evaluación publicada de estas capacidades en el checkpoint abliterado.
- Reducción de rechazos: 0 aciertos de palabra clave sobre 32 prompts de validación, medidos con un scorer automático que el propio autor reconoce que tiene falsos positivos y falsos negativos.
- Herencia de las capacidades del base Qwen/Qwen3.5-9B, no verificadas de forma independiente en esta ficha.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo *thinking* explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia compatibles con la API estándar.

## Casos de uso

- Investigación sobre mecanismos de rechazo: el modelo sirve como sujeto de estudio para reproducir y medir el efecto de la ablación de direcciones de rechazo, comparando sus respuestas con las del base sin modificar sobre el mismo conjunto de prompts.
- Evaluación de seguridad y *red-teaming*: desplegado en un entorno aislado, permite generar intentos de respuesta ante prompts que el modelo base rechazaría, con el objetivo de auditar clasificadores de contenido y sistemas de moderación.
- Generación de conjuntos de datos negativos: producir ejemplos de texto que un modelo alineado rechazaría resulta útil para entrenar o evaluar clasificadores de seguridad y filtros de contenido en *pipelines* de moderación.
- Escritura creativa y narrativa sin fricción de rechazo: para proyectos de ficción que abordan violencia, temas adultos o conflicto en un contexto artístico, el modelo evita las negativas sistemáticas del base, siempre que el despliegue incorpore controles de uso adecuados.
- Experimentación multilingüe en inglés y chino: el soporte de ambos idiomas permite estudiar si la ablación de rechazo se transfiere de forma uniforme entre idiomas o si el comportamiento diverge según la lengua del prompt.
- Investigación sobre edición de pesos: permite analizar el impacto de la edición en la deriva de la distribución de salida, tomando la KL de 0,0503 sobre prompts inofensivos como métrica de referencia.
- Pruebas de multimodalidad con el tower de visión intacto: dado que los pesos de visión no se tocaron, se puede evaluar si el comportamiento de rechazo en tareas imagen-texto cambia o no tras la ablación del componente lingüístico.
- Despliegue local en entornos controlados: con pesos de aproximadamente 18 GiB en BF16, encaja en una GPU de 24 GiB para contextos cortos, lo que facilita laboratorios de investigación sin acceso a clústeres grandes.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares). Las únicas métricas disponibles son las de validación de la propia ablación:

| Metrica | Conjunto | Resultado |
|---|---|---|
| Rechazos (scorer de palabras clave) | Validación, 32 prompts | 0 / 32 |
| KL en prompts inofensivos | Validación | 0,0503 |
| Rechazos | Held-out | no medido |
| KL | Held-out | no medido |

No se han publicado resultados de benchmarks estándar en la información disponible. El autor advierte que el scorer por palabras clave presenta falsos positivos y falsos negativos, de modo que el 0/32 no debe interpretarse como una eliminación total de los rechazos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18 GiB solo para los pesos, a los que hay que sumar la caché KV y el consumo del codificador de visión.
- GPU de 24 GiB: ajustado para contexto corto, según el propio autor (RTX 3090, RTX 4090, A5000, L4 de 24 GiB).
- GPU de 32 GiB: tamaño cómodo para una sola GPU con contexto corto (V100 de 32 GiB, A100 de 40 GiB, A6000 de 48 GiB, H100 de 80 GiB como opciones holgadas).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GiB como la RTX 4090 o la RTX 3090, aunque con poco margen y limitado a contextos reducidos. En GPUs de 16 GiB o menos sería necesario cuantizar.
- Opciones de despliegue: vLLM, con el comando documentado por el autor (`vllm serve ... --dtype bfloat16 --max-model-len 32768`), y transformers. Para llama.cpp u Ollama sería necesario generar una conversión GGUF propia, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponible en la información proporcionada.
- Cuantización recomendada si se necesita más contexto o hardware menor: no disponible en el repositorio; habría que aplicarla externamente, con la consiguiente pérdida de fidelidad respecto al checkpoint BF16 evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo | Notas |
|---|---|---|---|---|---|
| Puerh0x1/Qwen3.5-9B-abliterated | 9,41 mil millones | no disponible (ejemplo a 32.768 tokens) | apache-2.0 | Ablación con Heretic sobre Qwen/Qwen3.5-9B | 0 descargas y 0 likes; métricas solo de validación |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 9 mil millones (según la fuente) | no disponible | no disponible | Proceso de abliteración para reducir filtros de seguridad | Orientado a investigación y uso experimental; mantenido por huihui-ai |
| wangzhang/Qwen3.5-9B-abliterated | no disponible | no disponible | no disponible | no disponible | Repositorio alternativo con el mismo nombre de modelo |
| Qwen/Qwen3.5-9B | no disponible en la información proporcionada | no disponible | apache-2.0 | Modelo base sin modificar | Referencia de comparación; conserva el alineamiento de seguridad |

No se dispone de datos de rendimiento comparables entre estas variantes: ninguna de las fuentes consultadas publica resultados de benchmarks estándar, por lo que la comparación se limita a parámetros, licencia y método declarados.

## Limitaciones y advertencias

- La abliteración es una edición de pesos, no una garantía de eliminación de rechazos; el propio autor lo indica de forma explícita en la model card.
- Las métricas se midieron únicamente sobre el conjunto de selección del optimizador. No se ejecutó una evaluación *held-out* para este checkpoint, por lo que no hay evidencia de generalización.
- El scorer de rechazos se basa en palabras clave y tiene falsos positivos y falsos negativos; el 0/32 no equivale a ausencia total de negativas.
- La KL de 0,0503 sobre prompts inofensivos indica una deriva en la distribución de salida respecto al base, con posible degradación de calidad en tareas generales.
- Riesgo elevado de generar contenido dañino, ofensivo o potencialmente ilegal al haberse reducido los mecanismos de rechazo. No es apto para producción sin filtros externos y supervisión humana.
- Es un modelo multimodal con el codificador de visión intacto: la abliteración afecta solo al componente de lenguaje, de modo que el comportamiento en tareas de imagen puede diferir del observado en texto.
- Soporte de idiomas limitado a inglés y chino; no hay evidencia de comportamiento fiable en castellano.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae sobre quien despliega el modelo. Conviene revisar también los términos aplicables al modelo base.
- No hay datos publicados de benchmarks estándar, latencia ni throughput, lo que dificulta estimar su rendimiento en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Existen varias variantes con el mismo nombre (`Qwen3.5-9B-abliterated`) de autores distintos; es imprescindible verificar el ID completo para no confundir checkpoints con procedimientos y calibraciones diferentes.
- Los tensores MTP se restauraron desde el base en un fichero aparte; su comportamiento funcional dentro del pipeline de inferencia no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Puerh0x1/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Referencia del método contrastivo: Arditi et al. 2024, https://arxiv.org/abs/2406.11717
- Variante de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Ficha de huihui-ai en Featherless: https://featherless.ai/models/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Variante de wangzhang: https://huggingface.co/wangzhang/Qwen3.5-9B-abliterated
- Guía de despliegue local de Qwen3.5-9B abliterado: https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
- Análisis de Huihui-Qwen3.5-9B-Abliterated: https://hackernoon.com/huihui-qwen35-9b-abliterated-what-this-uncensored-model-does
