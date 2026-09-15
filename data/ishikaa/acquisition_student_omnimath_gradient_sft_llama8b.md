# ishikaa/acquisition_student_omnimath_gradient_sft_llama8b

## Resumen

ishikaa/acquisition_student_omnimath_gradient_sft_llama8b es un checkpoint de generación de texto de 8.030.261.248 parámetros (unos 8,03 mil millones) publicado en Hugging Face por el usuario ishikaa. Las etiquetas del repositorio indican arquitectura Llama, ajuste por supervisión (SFT) mediante la librería TRL y un formato conversacional. El nombre del repositorio apunta a un modelo "student" entrenado con datos relacionados con Omni-MATH y algún procedimiento de "acquisition" basado en gradientes, pero el autor no documenta ninguna de estas cuestiones.

El problema que resolvería, si se confirma esa lectura del nombre, es el de la selección de datos de ajuste supervisado: un "student" de 8B entrenado sobre un subconjunto adquirido por gradiente serviría como artefacto de investigación para estudiar qué ejemplos de SFT aportan más señal. No obstante, nada de esto está verificado por el autor.

La model card es la plantilla automática de Hugging Face sin una sola sección rellenada: no hay datos de entrenamiento, hiperparámetros, licencia, idiomas ni resultados. El repositorio acumula 0 descargas y 0 likes, y no se ha publicado ningún benchmark. Esta ficha, por tanto, recoge únicamente los datos verificables del repositorio y marca explícitamente como no disponible todo lo demás: es un checkpoint de investigación sin validación pública, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (según la etiqueta `llama`); número de capas, dimensión oculta y cabezas de atención no disponibles |
| Parametros totales | 8.030.261.248 (8,03 mil millones), recuento real leído de los pesos safetensors |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos sin cuantizar. Al ser una arquitectura Llama, es convertible a GGUF, AWQ o GPTQ con herramientas estándar, pero no hay conversiones publicadas por el autor |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el campo de licencia del repositorio está vacío) |
| Formato de pesos | safetensors; tamaño del repositorio 16,1 GB, coherente con pesos en bf16/fp16 |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Etiquetas relevantes | llama, trl, sft, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La única información estructural disponible son las etiquetas del repositorio. `llama` indica una familia de transformer decoder-only con atención causal estándar; el recuento de parámetros (8,03 mil millones) y el tamaño del repositorio (16,1 GB, equivalente a dos bytes por parámetro) son compatibles con pesos almacenados en bf16 o fp16 sin cuantizar. No hay ningún dato publicado sobre número de capas, cabezas de atención, uso de GQA, RoPE, tamaño de vocabulario ni longitud de contexto soportada.

En cuanto al entrenamiento, las etiquetas `trl` y `sft` indican que el checkpoint se obtuvo mediante ajuste supervisado con la librería TRL, presumiblemente a partir de un modelo base Llama de tamaño similar. No se especifica el modelo base exacto, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases posteriores de RLHF, DPO o RLVR. El elemento "omnimath" del nombre sugiere una vinculación con Omni-MATH (conjunto de problemas matemáticos de nivel de olimpiada), y "gradient_acquisition" sugiere una selección de datos guiada por gradientes, pero ambas son inferencias a partir del identificador y no afirmaciones documentadas por el autor. La etiqueta `arxiv:1910.09700` corresponde a Lacoste et al. (2019), el artículo del calculador de impacto ambiental que aparece citado en la plantilla de model card de Hugging Face, y no a un paper de este modelo.

## Capacidades

- Generación de texto en formato conversacional: es la única capacidad respaldada directamente por los metadatos (pipeline `text-generation` y etiqueta `conversational`).
- Razonamiento matemático: probable, dado el término "omnimath" del identificador, pero no verificado con ninguna evaluación publicada.
- Soporte de tool calling o function calling: no declarado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado; no disponible.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Modo de razonamiento explícito (thinking), visión, audio u otras modalidades: no declarados.
- Plantilla de chat: no publicada. Al no documentarse el tokenizador ni el formato de prompt esperado, su uso conversacional requeriría inferir la plantilla del modelo base.

## Casos de uso

- Investigación en selección de datos de SFT: si se confirma la lectura del nombre, el checkpoint funcionaría como "student" de referencia en experimentos que comparan estrategias de adquisición de datos (por gradiente frente a aleatoria o por diversidad). Su valor está en ser un punto de comparación reproducible dentro de un mismo pipeline de TRL.
- Generación de trazas de razonamiento matemático para destilación: un modelo de 8B ajustado sobre problemas de competición puede emplearse para producir soluciones paso a paso que después se filtran y se usan como datos de entrenamiento de modelos menores. Requiere validación automática de las respuestas, dado que no hay métricas publicadas de precisión.
- Prototipado de asistentes conversacionales en entornos controlados: al estar en safetensors y ser cargable con transformers, sirve para levantar rápidamente una demo interna de chat y evaluar cualitativamente su comportamiento antes de invertir en un modelo con licencia clara.
- Punto de partida para ajuste posterior con datos propios: el checkpoint puede continuar entrenándose con SFT sobre un dominio concreto (por ejemplo, matemáticas de secundaria o física) usando TRL, siempre que se resuelva antes la ambigüedad de licencia.
- Evaluación comparativa de recetas de entrenamiento: útil como uno de los brazos de un experimento controlado que mida el efecto de distintos datasets o hiperparámetros de SFT sobre un mismo modelo base.
- Tutoría matemática asistida con supervisión humana: generación de explicaciones y pistas graduadas para problemas de nivel preuniversitario, con revisión humana obligatoria de cada respuesta por el riesgo de alucinación no caracterizado.
- Reproducción de pipelines de TRL en docencia: sirve como ejemplo práctico de artefacto generado con SFTTrainer para cursos o talleres sobre ajuste de modelos, dado su tamaño manejable y su formato estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación (todas las secciones figuran como "[More Information Needed]") y el repositorio no enlaza a ningún informe técnico, tabla de resultados ni comparación con modelos de referencia. El único paper citado en la plantilla, arXiv:1910.09700, es el trabajo sobre estimación de emisiones de carbono de Lacoste et al. (2019) y no contiene resultados de este modelo.

Tampoco hay datos de latencia, throughput ni consumo de memoria medidos por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para los pesos, más la caché KV. Con contexto corto (2.000-4.000 tokens) el consumo se sitúa aproximadamente entre 17 y 20 GB; con contextos largos crece de forma proporcional al número de capas y cabezas, que no se han publicado. Estimación calculada a partir del recuento de parámetros, no medida.
- VRAM estimada en int8: alrededor de 8,5 GB para los pesos, más caché KV.
- VRAM estimada en int4: alrededor de 4,5-5 GB para los pesos, más caché KV. El autor no publica cuantizaciones; habría que generarlas.
- GPU recomendadas para bf16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contexto moderado. Para servicio con concurrencia alta conviene A100 80 GB o repartir el modelo en varias GPU.
- GPU de consumo: sí cabe. En bf16, una RTX 4090 de 24 GB con contexto corto. En cuantización de 4 bits, tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB, asumiendo que la cuantización se genere localmente y se valide su calidad.
- CPU: viable con llama.cpp u Ollama tras convertir los pesos a GGUF, aunque no hay conversión publicada ni datos de velocidad. En CPU la latencia será muy superior a la de GPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta explícita) y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). vLLM, SGLang o llama.cpp no están declarados pero son compatibles en principio al tratarse de un modelo de la familia Llama, previa verificación de la configuración.
- Latencia y throughput: no disponibles. El autor no publica ninguna medición.

## Comparativa con modelos similares

No hay resultados de este modelo que permitan una comparación de rendimiento. La tabla compara únicamente características estructurales y de licencia con modelos abiertos de tamaño equivalente, usando documentación pública de cada alternativa; los datos del modelo evaluado figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Notas |
|---|---|---|---|---|---|
| acquisition_student_omnimath_gradient_sft_llama8b | 8,03 mil millones | no disponible | no disponible | No | Checkpoint de investigación, 0 descargas |
| Llama 3.1 8B Instruct | 8,03 mil millones | 128.000 tokens (según documentación pública) | Llama 3.1 Community License (con restricciones para uso a gran escala) | Sí, publicados por Meta | Referencia habitual de la familia; el contexto real de este checkpoint no está confirmado |
| Qwen2.5 7B | 7,6 mil millones | 131.072 tokens (según documentación pública) | Apache 2.0 | Sí, publicados por Alibaba | Alternativa con licencia permisiva y soporte multilingüe amplio |
| Mistral 7B v0.3 | 7,25 mil millones | 32.768 tokens (según documentación pública) | Apache 2.0 | Sí, publicados por Mistral AI | Modelo más pequeño y ligero, con licencia permisiva |

La comparación debe tomarse con cautela: este checkpoint no declara licencia ni idiomas, no publica métricas y no especifica siquiera su modelo base, por lo que no es posible afirmar si iguala, supera o queda por debajo de las alternativas en ninguna tarea.

## Limitaciones y advertencias

- Model card completamente vacía: todas las secciones de la plantilla están sin rellenar, incluidas las de uso previsto, uso fuera de alcance, sesgos y detalles de entrenamiento.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. En la práctica, el modelo debe tratarse como no apto para producción hasta que el autor aclare la situación, sobre todo si deriva de un modelo base con licencia condicionada.
- Origen del modelo base desconocido: si el ajuste parte de Llama, las condiciones de la Llama Community License podrían aplicar y no está indicado en el repositorio.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT, no es posible caracterizar sesgos de género, idioma, cultura o dominio.
- Riesgo de alucinación no evaluado: no hay ninguna medición de precisión, veracidad ni tasa de error en tareas matemáticas, que es precisamente el dominio que sugiere el nombre.
- Idiomas no declarados: se desconoce si el ajuste conserva capacidades multilingües del modelo base o si estas se degradaron durante el SFT. No hay garantía de un rendimiento aceptable en castellano.
- Contexto no publicado: la ventana de contexto real es desconocida, por lo que no se puede planificar su uso en aplicaciones que dependan de contextos largos.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros, réplicas ni evaluaciones independientes.
- Sin cuantizaciones oficiales: cualquier conversión a GGUF, AWQ o GPTQ sería responsabilidad del usuario y podría degradar aún más un comportamiento no verificado.
- Formato de prompt desconocido: no se documenta plantilla de chat ni token especial alguno, lo que puede provocar respuestas degradadas si se usa con la plantilla equivocada.
- Aviso de reproducibilidad: el identificador del repositorio parece describir una receta experimental (selección por gradiente, datos tipo Omni-MATH), pero sin código ni configuración publicados el resultado no es reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_student_omnimath_gradient_sft_llama8b
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre estimación de emisiones de carbono; no es el paper del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML referenciada en la plantilla: https://mlco2.github.io/impact

No se han encontrado en la información disponible otros enlaces a papers, repositorios de código, demos o documentación adicional del modelo.
