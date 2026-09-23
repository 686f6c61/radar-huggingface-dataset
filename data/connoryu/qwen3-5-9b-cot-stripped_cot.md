# ConnorYU/qwen3.5-9b-cot-stripped_cot

## Resumen

ConnorYU/qwen3.5-9b-cot-stripped_cot es un ajuste fino (fine-tune) del modelo base unsloth/Qwen3.5-9B, desarrollado por el usuario ConnorYU y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de 9.653.104.368 parámetros (unos 9,65 mil millones), con pesos en formato safetensors y un repositorio de 19,3 GB, lo que resulta coherente con un almacenamiento en precisión bf16. La etiqueta de pipeline es image-text-to-text, lo que indica que el modelo es multimodal de entrada (imagen y texto a texto), heredada del modelo base de la familia Qwen3.5.

Lo relevante de esta publicación no es una innovación arquitectonica propia, sino la receta de entrenamiento: el autor indica que el modelo se entrenó con Unsloth y la librería TRL de HuggingFace, con una aceleración declarada de 2x respecto a un entrenamiento convencional. El nombre del repositorio, "cot-stripped_cot", sugiere un tratamiento específico de las cadenas de razonamiento (chain-of-thought) en los datos de ajuste, pero la model card no documenta el dataset, el procedimiento ni el objetivo de dicho tratamiento, por lo que esa interpretación no está confirmada por el autor.

El modelo es relevante como caso de estudio de fine-tuning reproducible y de bajo coste sobre una base multimodal de ~9,65B, no como un lanzamiento con benchmarks verificados: acumula 0 descargas y 0 "likes" en el momento de la consulta, no publica resultados de evaluación y su idioma declarado es únicamente el inglés. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como familia qwen3_5; el pipeline declarado es image-text-to-text) |
| Parámetros totales | 9.653.104.368 (~9,65B) |
| Parámetros activos | No aplica / no disponible (no se declara variante MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se publican pesos cuantizados; el repo contiene safetensors (~19,3 GB, compatible con bf16). Cuantizaciones de terceros no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de especificaciones arquitectónicas detalladas en la información proporcionada: la model card no indica número de capas, atención utilizada, tamaño de vocabulario ni configuración de la ventana de contexto. Las etiquetas del repositorio apuntan a la familia qwen3_5 y al pipeline image-text-to-text, de modo que el modelo parte de una base multimodal capaz de aceptar imágenes además de texto. El recuento real de parámetros en safetensors (9.653.104.368) sitúa el modelo en la franja de ~9,65B, y el tamaño del repositorio (19,3 GB) es consistente con pesos en bf16 sin cuantizar.

El único detalle de entrenamiento documentado es metodológico: el ajuste fino se realizó con Unsloth y la librería TRL de HuggingFace, con una aceleración declarada de 2x. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF, DPO o SFT, ni la técnica de ajuste (LoRA, QLoRA u otras). El sufijo "cot-stripped_cot" del nombre del repositorio apunta a un tratamiento particular de las cadenas de razonamiento en los datos, pero se trata de una inferencia a partir del nombre, no de un dato confirmado por el autor. Tampoco se documentan innovaciones técnicas propias como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Procesamiento de entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text, por lo que la base admite imágenes junto con texto.
- Generación de texto condicionada por imagen (descripción, respuesta a preguntas sobre imágenes), siempre que el fine-tune no haya degradado esa capacidad, algo no verificado.
- Razonamiento de tipo chain-of-thought: el nombre del modelo lo sugiere, pero no hay documentación que confirme ni el formato ni el comportamiento resultante.
- Compatibilidad con text-generation-inference y con la etiqueta endpoints_compatible, lo que facilita el despliegue como endpoint HTTP.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el único idioma declarado es el inglés.
- Modo "thinking" explícito, audio u otras capacidades especiales: no documentado.

## Casos de uso

- Extracción de información de documentos escaneados: al tratarse de un modelo image-text-to-text, puede emplearse para convertir facturas, albaranes o formularios escaneados en campos estructurados, combinando la lectura de la imagen con la generación de texto.
- Descripción automática de imágenes y respuesta a preguntas visuales: catalogación de activos digitales, generación de texto alternativo o asistencia a personas con discapacidad visual, en inglés, tras validar la calidad del fine-tune sobre la tarea concreta.
- Base para fine-tuning vertical reproducible: la receta Unsloth + TRL y el tamaño de 9,65B permiten reajustar el modelo en dominios específicos (legal, sanitario, industrial) con un coste de GPU moderado, partiendo de pesos abiertos y licencia Apache 2.0.
- Prototipado rápido de asistentes conversacionales en inglés: el modelo puede servir como endpoint de pruebas mediante text-generation-inference o transformers antes de decidir si se justifica un modelo mayor.
- Investigación sobre destilación de cadenas de razonamiento: dado el sufijo "cot-stripped" del nombre, es un candidato para estudiar cómo afecta la eliminación o reescritura de trazas de razonamiento a la precisión y a la longitud de las respuestas, comparándolo con el modelo base.
- Clasificación y etiquetado de contenido a escala: tareas de moderación, categorización de tickets o enrutado de consultas en inglés, con verificación humana de los resultados por el riesgo de alucinación no medido.
- Evaluación comparativa de recetas de fine-tuning: al publicarse el modelo base de origen (unsloth/Qwen3.5-9B) y la herramienta utilizada, permite reproducir el experimento y medir la aportación real del ajuste.
- Filtrado previo en pipelines de datos: generación de resúmenes o etiquetas de baja criticidad donde un error no tenga consecuencias graves, dado que no existen benchmarks publicados que respalden precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y el repositorio no enlaza informes de evaluación. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 19,3 GB solo para pesos, más la caché KV y el overhead del runtime; en la práctica se necesitan del orden de 22-24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB de pesos; en 4 bits, en torno a 5-6 GB, más caché KV. Son estimaciones aritméticas a partir del número de parámetros, no valores medidos ni publicados por el autor.
- GPU recomendadas para bf16: A100 40 GB, A100 80 GB, H100 80 GB. Una RTX 4090 (24 GB) queda al límite y exige contexto reducido y cuidado con la fragmentación.
- GPU de consumo: en 4 bits el modelo debería caber en RTX 3090, RTX 4090, RTX 4080 (16 GB) e incluso tarjetas de 8 GB con contexto muy corto; en bf16 no cabe en GPU de consumo salvo tarjetas de 24 GB y con margen escaso.
- Opciones de despliegue: text-generation-inference (el repositorio está etiquetado como endpoints_compatible y text-generation-inference), vLLM y transformers. Unsloth es la herramienta declarada para el ajuste, no necesariamente para inferencia.
- llama.cpp y Ollama: no hay pesos GGUF publicados en el repositorio, por lo que su uso requeriría una conversión propia desde safetensors con las herramientas habituales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-cot-stripped_cot | 9,65B | No disponible | Sin benchmarks publicados | Apache 2.0 | HuggingFace, safetensors, 0 descargas |
| unsloth/Qwen3.5-9B (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace (referenciado como base_model) |
| Otras alternativas de la misma franja (por ejemplo, modelos densos de ~8-9B de uso común) | No disponible | No disponible | No disponible | No disponible | La búsqueda web realizada no devolvió resultados relevantes sobre modelos comparables |

No se dispone de datos verificados de rendimiento, contexto ni licencia de posibles alternativas dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni métricas de latencia publicadas; no se puede afirmar nada sobre su precisión relativa frente al modelo base.
- Riesgo de alucinación no cuantificado: al no existir evaluación, la tasa de invención de hechos es desconocida y debe asumirse alta en tareas de conocimiento factual hasta que se mida.
- Idiomas: solo se declara inglés. El uso en castellano no está soportado ni documentado y previsiblemente degradará la calidad.
- Longitud de contexto desconocida: la model card no la especifica, lo que impide planificar cargas de trabajo con entradas largas sin una prueba previa.
- Sesgos: no se documenta la composición del dataset de ajuste, por lo que no se puede evaluar qué sesgos se han introducido o amplificado respecto al modelo base.
- Trazabilidad limitada: se desconoce el dataset, la configuración de entrenamiento (LoRA, QLoRA, rango, epochs) y el procedimiento exacto aplicado a las cadenas de razonamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el titular de los derechos sobre los pesos derivados y sobre el modelo base debe verificarse por separado; la model card del modelo base puede imponer condiciones adicionales.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso ni reportes de terceros; no hay evidencia de que el fine-tune funcione mejor que el modelo original.
- Capacidad multimodal no verificada: aunque el pipeline declarado es image-text-to-text, el ajuste podría haber degradado la rama de visión; requiere validación empírica.
- Para producción: se recomienda tratar el modelo como experimental, con validación propia sobre el caso de uso concreto y supervisión humana en aplicaciones sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/qwen3.5-9b-cot-stripped_cot
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a una empresa portuguesa de etiquetas y RFID (Altronix) y no guardan relación con el objeto de esta ficha, por lo que se omiten.
