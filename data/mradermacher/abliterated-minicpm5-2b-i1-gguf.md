# mradermacher/abliterated-minicpm5-2b-i1-GGUF

## Resumen

abliterated-minicpm5-2b-i1-GGUF es una redistribución en formato GGUF de los pesos del modelo KidIkaros/abliterated-minicpm5-2b, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del modelo base: el autor aplica cuantizaciones weighted/imatrix sobre el checkpoint original para generar versiones comprimidas listas para inferencia en llama.cpp y derivados. El sufijo "i1" identifica el esquema de cuantización imatrix de mradermacher, y "abliterated" indica que el modelo base ha sido sometido a una técnica de abolición de direcciones de rechazo (abliteration).

El modelo hereda el nombre "minicpm5-2b", lo que sugiere una variante de 2.000 millones de parámetros de la familia MiniCPM. Sin embargo, los metadatos de HuggingFace de este repositorio declaran 774.438 parámetros, una cifra incompatible con el nombre del modelo y probablemente correspondiente a un campo parcial del repositorio (por ejemplo, un componente auxiliar) y no al total de parámetros del modelo base. Esa discrepancia se detalla en la sección de especificaciones y debe tenerse en cuenta antes de cualquier uso en producción.

El repositorio no incluye model card propia, ni licencia, ni resultados de benchmarks: la única documentación es la referencia al modelo base y la lista de cuantizaciones generadas. El repositorio se creó y actualizó el 13 de septiembre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 "likes", por lo que no existe validación comunitaria de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base; el nombre sugiere familia MiniCPM, sin confirmar) |
| Parametros totales | 774.438 según los metadatos de HuggingFace del repositorio; no disponible el recuento real del modelo base (el nombre indica 2B) |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix, quantize_version 2, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en los materiales proporcionados. Dado el identificador "minicpm5-2b" y el prefijo de la familia MiniCPM (desarrollada originalmente por OpenBMB y Tsinghua), es razonable esperar un transformer decoder-only, pero esto no está confirmado en la información disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

Lo que sí documenta el repositorio es el proceso de conversión: los pesos se convirtieron desde el formato original de HuggingFace (convert_type: hf) y se cuantizaron con un esquema weighted/imatrix (quantize_version 2, output_tensor_quantised 1). El etiquetado "abliterated" procede del modelo base e implica que se han modificado los pesos para suprimir direcciones de activación asociadas a comportamientos de rechazo, una técnica de desalineación deliberada de los mecanismos de seguridad del modelo original. El repositorio incluye, además, una etiqueta interna "nicoboss" cuyo significado no se detalla.

## Capacidades

- Generación de texto: capacidad inherente a un modelo de lenguaje, sin detalles verificables en la información disponible.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni documentación).
- Generación de código: no disponible (sin benchmarks ni documentación).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible; el repositorio no incluye proyecciones multimodales (no se menciona mmproj en las etiquetas, aunque la plantilla del generador incluye un campo skip_mmproj vacío).
- Comportamiento desalineado: por construcción ("abliterated"), se espera una reducción deliberada de las negativas de seguridad, aunque no hay evaluación publicada que lo cuantifique.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: el modelo permite estudiar en un entorno controlado cómo la abliteración altera las respuestas ante peticiones que un modelo alineado rechazaría, comparando contra el checkpoint original.
- Ejecución local en hardware muy limitado: al ser GGUF, puede cargarse en llama.cpp con cuantizaciones de 1 a 3 bits (IQ1_S, IQ2_XXS), lo que permite probarlo en portátiles sin GPU dedicada, con la calidad degradada que ello implica.
- Prototipado rápido de aplicaciones de chat: sirve como modelo de pruebas para validar pipelines de inferencia (plantillas de prompt, streaming, gestión de contexto) antes de migrar a un modelo mayor o con licencia clara.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 25 variantes del mismo modelo, lo que permite medir empíricamente la pérdida de perplejidad y calidad entre IQ1_S y Q6_K sobre una misma tarea.
- Generación de texto creativo sin restricciones temáticas: uso en el que la supresión de rechazos puede ser deseable (ficción, roleplay), siempre que el contenido generado se revise y cumpla la legislación aplicable.
- Docencia y demostraciones sobre cuantización: ilustra de forma práctica el efecto del presupuesto de bits por peso en el tamaño del fichero y en la coherencia de la salida, sin necesidad de infraestructura de entrenamiento.
- Base para fine-tuning experimental: al estar en GGUF también existen los pesos originales del autor base en formato HuggingFace, lo que facilita partir del checkpoint sin cuantizar para ajustes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni evaluaciones comparativas, y la búsqueda web realizada no devolvió resultados relacionados con el modelo (los únicos enlaces recuperados corresponden a la herramienta de medición de velocidad de Ookla y no guardan relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (estimación orientativa asumiendo un modelo de ~2B parámetros, no verificada contra ficheros reales, ya que el repositorio declara 0,0 GB de tamaño): IQ1_S/IQ2_XXS ≈ 0,6-0,9 GB; IQ3/Q3_K ≈ 1,0-1,3 GB; Q4_K_M ≈ 1,3-1,7 GB; Q5_K_M ≈ 1,7-2,0 GB; Q6_K ≈ 2,2-2,6 GB; F16 (si se generase) ≈ 4,5 GB. Añadir 0,3-1,0 GB para la caché KV según la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para las cuantizaciones de 4 bits o inferiores; RTX 3060, RTX 4060, RTX 2070 y superiores son opciones holgadas. Para servir varias instancias concurrentes, una RTX 4090 o L4 permite mayor paralelismo.
- ¿Cabe en GPU consumer? Sí, en la práctica totalidad de GPU dedicadas de los últimos ocho años y también en iGPU con memoria unificada (Apple Silicon, APUs AMD con suficiente memoria asignada), siempre en cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa; para esos motores habría que usar los safetensors del modelo base.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio y dependerán por completo del hardware, de la cuantización elegida y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos verificados de este repositorio (ni de su modelo base) que permitan una comparación rigurosa. La tabla siguiente recoge alternativas de la misma categoría (modelos densos de 2-3B parámetros) con datos procedentes de su documentación pública, que no han podido contrastarse en la búsqueda realizada y deben tomarse como referencia no verificada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterated-minicpm5-2b-i1-GGUF (este) | 774.438 según metadatos; nombre indica 2B | no disponible | no disponible | GGUF | 0 descargas, sin benchmarks ni model card; derivado abliterado |
| Gemma 2 2B (Google) | 2,6B (no verificado) | 8.192 tokens (no verificado) | Gemma Terms (no verificado) | safetensors, GGUF comunitario | Modelo alineado con filtros de seguridad |
| Qwen2.5 1.5B / 3B (Alibaba) | 1,5B / 3,1B (no verificado) | 32.768 tokens en la variante 3B (no verificado) | Apache-2.0 (no verificado) | safetensors, GGUF oficial | Amplio soporte multilingüe declarado |
| Phi-3-mini (Microsoft) | 3,8B (no verificado) | 4.096 / 128.000 tokens según variante (no verificado) | MIT (no verificado) | safetensors, GGUF | Orientado a razonamiento y código |

La comparación de rendimiento no está disponible: este repositorio no publica métricas y ninguno de los resultados de búsqueda aporta evaluaciones que permitan situarlo frente a esas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no existir model card ni evaluación, no hay información sobre sesgos de género, raza, religión o ideología en el modelo base ni en la versión abliterada.
- Riesgo de alucinación: elevado en modelos pequeños (2B) y previsiblemente agravado en las cuantizaciones de 1-3 bits (IQ1_S, IQ2_XXS, Q2_K), donde la pérdida de precisión degrada la coherencia y la fidelidad factual.
- Desalineación deliberada: la abliteración elimina direcciones de rechazo, por lo que el modelo puede producir contenido dañino, ilegal o inseguro que el checkpoint original rechazaría. No debe desplegarse en aplicaciones orientadas al público sin capas de moderación externas.
- Licencia: no disponible. Sin licencia declarada no puede asumirse permiso de uso comercial; la situación legal de la redistribución depende además de la licencia del modelo base, que tampoco se especifica en este repositorio.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto efectiva y la lista de idiomas soportados. No hay garantía de calidad en castellano.
- Cuantizaciones extremas: las variantes por debajo de 4 bits suelen provocar degradación notable en modelos pequeños; conviene validar la tarea concreta antes de elegirlas en producción.
- Metadatos inconsistentes: el recuento de 774.438 parámetros y el tamaño de repositorio de 0,0 GB no cuadran con un modelo de 2B ni con un repositorio que debería contener decenas de ficheros GGUF. Es probable que el repositorio estuviese incompleto o que los metadatos fuesen erróneos en el momento de la consulta.
- Fechas anómalas: los campos de creación y actualización (13 de septiembre de 2026) son posteriores a la fecha de consulta habitual de estos datos, lo que refuerza la sospecha de metadatos poco fiables.
- Ausencia de validación: 0 descargas y 0 "likes" implican que no existe evidencia comunitaria de que los ficheros funcionen correctamente.
- Atribución: el modelo base es obra de KidIkaros y la cuantización de mradermacher; cualquier uso debe respetar los términos de ambos, además de los del modelo MiniCPM original si fuese aplicable.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/abliterated-minicpm5-2b-i1-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos enlaces recuperados pertenecen a la herramienta Speedtest de Ookla y no son relevantes.
