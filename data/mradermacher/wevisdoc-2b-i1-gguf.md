# mradermacher/WeVisDoc-2B-i1-GGUF

## Resumen

WeVisDoc-2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo multimodal tencent/WeVisDoc-2B, publicada por el usuario mradermacher. No se trata de un modelo nuevo, sino de una redistribución optimizada para inferencia local: el repositorio recoge cuantizaciones de tipo imatrix (i1) generadas con llama.cpp a partir de los pesos originales de Tencent. La model card indica explícitamente que se trata de un modelo de visión, y que los ficheros `mmproj` necesarios para el componente visual se alojan en el repositorio estático paralelo (mradermacher/WeVisDoc-2B-GGUF), no en este.

El modelo base apunta a un tamaño nominal de 2B parámetros, con soporte declarado de inglés y chino (en, zh) y licencia Apache 2.0, lo que lo sitúa en la categoría de modelos pequeños de comprensión de documentos e imagen, aptos para ejecución en hardware de consumo. La relevancia de esta ficha es práctica: permite disponer de un modelo multimodal de 2B en GGUF para despliegue con llama.cpp, Ollama o LM Studio, con distintos niveles de cuantización que van desde IQ1_S hasta Q6_K.

Conviene señalar dos advertencias de fiabilidad sobre los metadatos disponibles: por un lado, el repositorio figura con 0 descargas, 0 likes y un tamaño de 0.0 GB, y la tabla de ficheros de la model card solo lista el fichero de imatrix (0.1 GB), no los pesos cuantizados, por lo que la disponibilidad efectiva de los GGUF debe verificarse en el repositorio. Por otro lado, los metadatos de safetensors del modelo base reportan 516.292 parámetros totales, un valor incoherente con la denominación "2B"; no hay información que permita resolver esa discrepancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card solo indica que es un modelo de visión (`This is a vision model`); no especifica la arquitectura del transformer ni el codificador visual |
| Parametros totales | 516.292 según los metadatos de safetensors del modelo base (dato incoherente con la denominación "2B" del nombre del modelo); no disponible el desglose real |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero imatrix `WeVisDoc-2B.imatrix.gguf` de 0.1 GB en este repositorio; el resto de cuantizaciones, junto con los posibles ficheros `mmproj`, se anuncian en el repositorio estático mradermacher/WeVisDoc-2B-GGUF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base tencent/WeVisDoc-2B en los datos proporcionados. La única característica estructural confirmada por la model card es su naturaleza multimodal: el autor de la cuantización etiqueta el modelo como "vision model" y remite los ficheros `mmproj` (proyector multimodal) al repositorio estático, lo que implica la existencia de un codificador visual acoplado a un modelo de lenguaje y de un proyector que alinea ambos espacios de representación. No se especifica si el componente lingüístico es un transformer denso, ni el número de capas, dimensión oculta, tipo de atención o vocabulario.

Tampoco hay datos disponibles sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del corpus, la proporción de datos en inglés y chino, ni si se aplicaron técnicas de ajuste como SFT, RLHF o DPO. Del mismo modo, se desconoce si el modelo incorpora innovaciones como decodificación especulativa, atención lineal o mecanismos de compresión de contexto. La contribución técnica verificable de este repositorio concreto es la cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (etiquetadas "i1"), que aplican una matriz de importancia durante el proceso de cuantización para mejorar la perplejidad frente a las cuantizaciones estáticas equivalentes, disponibles por separado en el repositorio mradermacher/WeVisDoc-2B-GGUF.

## Capacidades

- Procesamiento multimodal de imagen y texto: la model card clasifica el modelo como modelo de visión, por lo que se le presupone capacidad de recibir entradas visuales. No se detalla qué tareas concretas cubre.
- Comprensión de documentos: el nombre del modelo base (WeVisDoc) sugiere orientación a documentos, pero no hay confirmación explícita en la información disponible.
- Generación de texto en inglés y chino: son los dos únicos idiomas declarados en los metadatos.
- Cuantización para inferencia local: el repositorio ofrece 24 tipos de cuantización GGUF distintos, lo que permite ajustar el equilibrio entre tamaño, VRAM y calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponible.
- Capacidades multilingües adicionales fuera de en y zh: no disponible.

## Casos de uso

- Extracción de datos de documentos escaneados: dado que el modelo base se orienta a visión y documentos, un uso natural es el parsing de facturas, formularios o recibos en inglés y chino, ejecutando el GGUF con llama.cpp y el fichero `mmproj` correspondiente. Debe validarse empíricamente antes de llevarlo a producción.
- Digitalización de archivos en entornos con requisitos de privacidad: al ser un modelo de 2B en GGUF, puede ejecutarse íntegramente en local sin enviar documentos a APIs externas, lo que resulta adecuado para sectores con datos sensibles (legal, sanitario, banca).
- Procesamiento por lotes a bajo coste: la disponibilidad de cuantizaciones IQ2/IQ3 de muy bajo peso permitiría procesar grandes volúmenes de documentos en GPUs modestas o incluso en CPU, priorizando el coste por página sobre la precisión máxima.
- Asistencia documental en aplicaciones de escritorio: integración en herramientas ofimáticas o visores de PDF mediante Ollama o LM Studio, aprovechando el formato GGUF y los endpoints compatibles con OpenAI.
- Prototipado rápido de pipelines RAG multimodales: uso del modelo como extractor de texto y estructura de imágenes antes de indexar en una base vectorial, con la ventaja de que la licencia Apache 2.0 no impone restricciones de uso comercial.
- Investigación en cuantización y evaluación de modelos pequeños: el repositorio ofrece 24 variantes de cuantización del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir el impacto de cada tipo de cuantización en tareas de visión-documento.
- Despliegue en edge o dispositivos con recursos limitados: un modelo de 2B en cuantizaciones de 1-2 GB es candidato para escenarios de inferencia en el borde, siempre que se verifique el consumo real de memoria del componente visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La búsqueda web asociada no devolvió ningún resultado relevante sobre el modelo: los enlaces recuperados son discusiones en foros chinos sobre Wikipedia, letras de canciones y volcados de texto, sin relación con WeVisDoc-2B ni con cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como estimación basada en un modelo de ~2B parámetros (etiqueta del nombre, no confirmada por los metadatos), cabría esperar aproximadamente: ~4 GB en FP16, ~2,2 GB en Q8_0, ~1,3-1,5 GB en Q4_K_M e inferior a 1 GB en cuantizaciones IQ2/IQ3. A estas cifras hay que sumar el coste del proyector visual (`mmproj`) y de la caché KV, que dependen del contexto y de la resolución de imagen de entrada. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 8 GB o más debería ser suficiente; modelos de gama alta (A100, H100) no son necesarios para este tamaño.
- Compatibilidad con GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores, e incluso en GPUs de 6-8 GB con cuantizaciones agresivas. No confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para el componente visual es imprescindible cargar el fichero `mmproj` del repositorio estático. vLLM y TGI no son el objetivo de este repositorio (trabajan con safetensors, no con GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para WeVisDoc-2B, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de contexto y rendimiento de los modelos alternativos deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| WeVisDoc-2B (base de esta ficha) | ~2B según nombre; metadatos safetensors reportan 516.292 | No disponible | Apache 2.0 | Safetensors (base) y GGUF (esta cuantización) | No disponible |
| Qwen2-VL-2B | ~2B | No disponible en esta ficha | Apache 2.0 | Safetensors y múltiples cuantizaciones comunitarias | No disponible |
| InternVL2-2B | ~2B | No disponible en esta ficha | MIT | Safetensors y cuantizaciones comunitarias | No disponible |
| SmolVLM (familia de ~2B) | ~2B | No disponible en esta ficha | Apache 2.0 | Safetensors y GGUF | No disponible |

Nota: los datos de licencia y tamaño de los modelos alternativos proceden de conocimiento general de la familia de modelos y deben confirmarse en sus fichas oficiales antes de tomar decisiones de producción. No se han incluido cifras de benchmarks porque no hay datos verificables en la información proporcionada para ninguno de ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna evaluación publicada en la información disponible que permita estimar la calidad del modelo en tareas de OCR, VQA o comprensión documental. Cualquier uso en producción exige una evaluación propia previa.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente crítico en extracción de datos de documentos, donde una cifra o un nombre inventado puede tener consecuencias graves. Se recomienda validación posterior y reglas de negocio.
- Discrepancia en el recuento de parámetros: los metadatos reportan 516.292 parámetros totales, un valor que no encaja con la denominación "2B". Esto puede deberse a un error de indexación de HuggingFace o a un modelo con un componente lingüístico muy pequeño. Afecta directamente a las estimaciones de VRAM y a la expectativa de capacidades.
- Disponibilidad del repositorio dudosa: 0 descargas, 0 likes, tamaño de repositorio 0.0 GB y una tabla de ficheros que solo lista el imatrix de 0.1 GB. Es posible que los GGUF anunciados no estén subidos. Verificar antes de depender de ellos.
- Dependencia de ficheros externos: el componente visual requiere los `mmproj` del repositorio estático mradermacher/WeVisDoc-2B-GGUF. Sin ellos, el modelo no funcionará como multimodal.
- Cobertura lingüística limitada: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, y el rendimiento en idiomas no declarados es impredecible.
- Pérdida de calidad por cuantización: las cuantizaciones IQ1/IQ2 introducen degradación notable de perplejidad. Para tareas de comprensión documental, donde el detalle importa, se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se hereda del modelo base; conviene verificar que la ficha de tencent/WeVisDoc-2B no añada condiciones adicionales (términos de uso, restricciones de despliegue o requisitos de atribución).
- Sesgos: no disponible. No hay información sobre la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demográfico, geográfico o cultural.
- Modelo de nicho y baja adopción: sin comunidad, sin issues públicos y sin documentación adicional, el soporte y la resolución de problemas dependen exclusivamente del autor de la cuantización.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/WeVisDoc-2B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisDoc-2B
- Repositorio estático de cuantizaciones (incluye posibles `mmproj`): https://huggingface.co/mradermacher/WeVisDoc-2B-GGUF
- Página resumen de descargas del autor: https://hf.tst.eu/model#WeVisDoc-2B-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantización: https://www.nethype.de/
- Paper, blog o demo oficiales del modelo base: no disponible en la información proporcionada.
