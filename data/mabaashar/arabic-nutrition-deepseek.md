# mabaashar/arabic-nutrition-deepseek

## Resumen
`mabaashar/arabic-nutrition-deepseek` es un ajuste fino publicado en HuggingFace por el usuario mabaashar sobre el modelo `unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit`. Se trata, por tanto, de una adaptación de un transformer decoder-only de la familia Qwen2 con aproximadamente 7 000 millones de parámetros, destilado previamente a partir de DeepSeek-R1 para conservar capacidad de razonamiento explícito. La licencia declarada es Apache-2.0 y el único idioma registrado en los metadatos es el inglés.

El nombre del repositorio sugiere una especialización en nutrición en árabe, pero la model card no documenta el corpus de entrenamiento, el número de tokens, la composición de los datos ni el procedimiento exacto de ajuste. El autor indica únicamente que el entrenamiento se realizó con Unsloth sobre el modelo base cuantizado en 4 bits, lo que apunta a un esquema QLoRA, aunque no se confirma de forma explícita.

Su relevancia actual es limitada pero ilustrativa: muestra cómo adaptar un modelo de razonamiento de 7B a un dominio vertical con herramientas de bajo coste. Sin embargo, carece de evaluación publicada, de documentación técnica detallada y de validación comunitaria: en el momento de redactar esta ficha acumula 0 descargas y 0 likes, y el repositorio ocupa solo 0,2 GB, un tamaño compatible con un adaptador LoRA más que con pesos completos en precisión de 16 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (etiqueta `qwen2`), ajuste fino de `unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit` |
| Parámetros totales | 7B aproximados, heredados del modelo base; no verificados en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base Qwen2.5-7B declara 131 072 tokens, pero este ajuste fino no lo confirma |
| Tipos de cuantización | No se publican artefactos GGUF, GPTQ ni AWQ. El modelo base se distribuye en `bnb-4bit`; es posible cuantizar a 8 o 4 bits, pero no hay versiones oficiales en el repositorio |
| Idiomas soportados | `en` (único idioma declarado). El nombre sugiere árabe, pero no está registrado ni documentado |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors`; tamaño del repositorio: 0,2 GB |
| Modelo base | `unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit` |
| Desarrollador | mabaashar |
| Fecha de creación en HuggingFace | 2026-10-17 (metadato anómalo; posterior a la fecha habitual de consulta) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer decoder-only de Qwen2, con atención causal estándar y aproximadamente 7 000 millones de parámetros. El modelo base es una destilación de DeepSeek-R1 sobre Qwen2.5-7B: DeepSeek-R1 aporta el comportamiento de razonamiento paso a paso y Qwen2.5-7B proporciona el cuerpo del modelo y su tokenizador. El ajuste fino se ha realizado con Unsloth sobre la variante del base cuantizada en 4 bits (`bnb-4bit`), lo que sugiere un entrenamiento tipo QLoRA con adaptadores de bajo rango, aunque la model card no describe el rango, el alpha, la tasa de aprendizaje ni el número de pasos.

No se documenta el dataset de ajuste fino, el número de tokens de entrenamiento, la composición de las muestras, la existencia de RLHF, DPO o preferencias, ni si se congelaron todas las capas salvo los adaptadores. Tampoco se indica si el resultado final se ha fusionado con el modelo base o se distribuye únicamente como adaptador. El tamaño del repositorio, 0,2 GB, refuerza la hipótesis de un adaptador LoRA, pero conviene inspeccionar los archivos antes de asumir que contiene pesos completos.

## Capacidades
- Generación de texto y razonamiento paso a paso: el modelo base incorpora el estilo de cadena de pensamiento destilado de DeepSeek-R1; no se ha verificado que el ajuste fino conserve esta capacidad.
- Matemáticas y código: el modelo base muestra competencia en tareas de razonamiento matemático y programación; no hay evaluación posterior al ajuste fino.
- Dominio especializado: el nombre del repositorio apunta a nutrición en árabe, pero la model card no describe la tarea, el formato de las respuestas ni la cobertura lingüística real.
- Multilingüismo: solo se declara inglés. No hay confirmación de soporte de árabe, castellano ni otros idiomas.
- Tool calling / function calling: no confirmado. El modelo base es un modelo de razonamiento y no está orientado de forma nativa a llamadas a herramientas.
- Uso como agente y razonamiento multi-paso: no documentado ni evaluado en este ajuste fino.
- Modo thinking explícito: el base emplea razonamiento interno, pero no se especifica si el ajuste fino mantiene los tokens de pensamiento o los ha eliminado.
- Contexto largo: no confirmado; no debe asumirse la ventana de 131 072 tokens del base sin verificación.

## Casos de uso
- Asistente de nutrición en árabe: si el ajuste fino realmente cubre ese idioma, podría emplearse para responder preguntas sobre dietas, macronutrientes y restricciones alimentarias. Es imprescindible validar antes el soporte real del árabe, ya que los metadatos solo declaran inglés.
- Generación de planes de comidas: el modelo puede producir borradores de menús semanales con restricciones calóricas o alergias, siempre que se revisen por un dietista y se validen las cantidades.
- Educación alimentaria y etiquetado: útil para explicar conceptos nutricionales o interpretar etiquetas en un chatbot divulgativo, con avisos claros de que no sustituye asesoramiento profesional.
- Atención al cliente para clínicas de nutrición: puede gestionar preguntas frecuentes y primeras respuestas multi-turno, derivando los casos clínicos a personal sanitario.
- Extracción y estructuración de información: a partir de textos sobre alimentos, el modelo puede generar fichas o resúmenes estructurados, aunque sin tool calling nativo la integración requiere post-procesado.
- Investigación en ajuste fino eficiente: sirve como ejemplo reproducible de QLoRA con Unsloth sobre un modelo de razonamiento de 7B para estudiar degeneración de capacidades y olvido catastrófico.
- Base para RAG sobre guías alimentarias: combinado con una base vectorial de documentos oficiales, puede responder consultas acotadas y citar fuentes, reduciendo el riesgo de alucinación si se diseña bien el pipeline.
- Generación de contenido divulgativo en inglés: artículos, guiones o publicaciones sobre nutrición, con revisión editorial obligatoria por tratarse de un dominio sensible.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: alrededor de 14-16 GB solo para los pesos de un modelo de 7B, más 2-4 GB de caché KV y overhead; en total, unos 16-20 GB.
- VRAM estimada en 8 bits: aproximadamente 7-9 GB para los pesos y 10-12 GB en total.
- VRAM estimada en 4 bits: aproximadamente 4-6 GB para los pesos y 6-8 GB en total.
- Si el repositorio contiene solo un adaptador LoRA, hay que sumar la memoria del modelo base, que en `bnb-4bit` ronda los 4-5 GB y en fp16 los 14-16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para fp16; A100 40/80 GB o H100 para servicio concurrente; L4 o A10G (24 GB) para fp16 con lotes pequeños; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para cuantización 4 u 8 bits.
- Despliegue: Transformers, Text Generation Inference (la etiqueta `text-generation-inference` está presente), vLLM y, previa conversión a GGUF, llama.cpp u Ollama. No se publican archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este ajuste fino.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mabaashar/arabic-nutrition-deepseek` | 7B | No disponible | Apache-2.0 | 0 descargas, 0 likes | Ajuste fino sin evaluación publicada; posible adaptador de 0,2 GB |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` | 7B | 131 072 tokens | MIT | Muy alta | Modelo base de razonamiento destilado, con evaluaciones públicas |
| `Qwen/Qwen2.5-7B-Instruct` | 7B | 131 072 tokens | Apache-2.0 | Muy alta | Instrucciones generales, buen soporte multilingüe y de tool calling |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 131 072 tokens | Licencia comunitaria Llama 3.1 | Muy alta | Alternativa generalista con amplio ecosistema |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B | 32 768 tokens | Apache-2.0 | Alta | Modelo ligero y desplegable en hardware de consumo |

Los datos de contexto y licencia de los modelos comparados proceden de su documentación pública y no se han verificado en esta ficha. El rendimiento del ajuste fino de mabaashar no se puede comparar porque no hay benchmarks publicados.

## Limitaciones y advertencias
- Ausencia total de evaluación: no hay métricas de calidad, benchmarks, pruebas de regresión ni comparación con el modelo base.
- Model card mínima: no se documentan datos, hiperparámetros, formato de entrenamiento ni limitaciones conocidas.
- Riesgo de alucinación: especialmente crítico en nutrición y salud, donde una respuesta incorrecta sobre calorías, alérgenos o interacciones puede causar daño.
- No apto para uso clínico sin supervisión: no debe emplearse como sustituto de un dietista-nutricionista ni para decisiones médicas.
- Posible desajuste lingüístico: el nombre indica árabe, pero el único idioma declarado es inglés; el soporte real de árabe no está confirmado.
- Licencia: el repositorio declara Apache-2.0, pero conviene verificar la licencia del modelo base y de la variante de Unsloth antes de un uso comercial.
- Tamaño del repositorio: 0,2 GB sugiere un adaptador LoRA o una cuantización agresiva; si es un adaptador, no es un modelo autónomo y requiere descargar el base.
- Entrenamiento sobre base cuantizado en 4 bits: puede introducir pérdidas de precisión o artefactos respecto a un ajuste fino en fp16.
- Ventana de contexto no confirmada: no se debe asumir el contexto de 131 072 tokens del modelo base sin probarlo.
- Sin información sobre sesgos: no se han publicado análisis de sesgos, toxicidad ni robustez.
- Metadatos anómalos: la fecha de creación indicada, 2026-10-17, es posterior a la fecha habitual de consulta, lo que sugiere un error de registro.
- Validación comunitaria nula: 0 descargas y 0 likes implican ausencia de pruebas independientes y de soporte.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/mabaashar/arabic-nutrition-deepseek)
- [Modelo base en HuggingFace](https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [DeepSeek-R1-Distill-Qwen-7B original](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B)
- [Paper de DeepSeek-R1](https://arxiv.org/abs/2501.12948)
- [Repositorio de DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1)
- [Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
