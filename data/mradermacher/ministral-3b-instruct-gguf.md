# mradermacher/Ministral-3b-instruct-GGUF

## Resumen

Ministral-3b-instruct-GGUF es la versión cuantizada en formato GGUF del modelo Ministral-3b-instruct, desarrollado originalmente por Mistral AI y convertido a GGUF por el usuario mradermacher. Se trata de un modelo de lenguaje de tipo transformer denso con 3.315.716.096 parámetros (aproximadamente 3,3 mil millones), diseñado para tareas conversacionales e instrucciones en inglés. Su principal atractivo es que ofrece las capacidades de la familia Ministral de Mistral AI en un tamaño reducido que puede ejecutarse en hardware de consumo.

El modelo base Ministral-3b-instruct forma parte de la gama Ministral de Mistral AI, orientada a despliegues en el borde (edge) y entornos con recursos limitados. La versión GGUF que nos ocupa facilita su uso con herramientas como llama.cpp, Ollama y otros runners compatibles con GGUF, lo que democratiza su despliegue en CPU y GPU de gama media. El repositorio incluye múltiples cuantizaciones estáticas (Q2_K hasta f16), con tamaños que van desde 1,4 GB hasta 6,7 GB.

La relevancia actual de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente si un modelo de 3B parámetros con licencia Apache 2.0 y cuantizaciones listas para usar se ajusta a sus necesidades de despliegue en producción o experimentación, sin necesidad de infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no disponible el detalle exacto de la arquitectura interna) |
| Parametros totales | 3.315.716.096 (aproximadamente 3,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base Ministral-3b-instruct, ya que la model card proporcionada corresponde únicamente a la conversión GGUF realizada por mradermacher. El modelo base es un transformer denso de 3,3 mil millones de parámetros, según el dato real de safetensors. La conversión a GGUF se realizó con cuantización estática (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf), lo que indica que se aplicaron cuantizaciones de tipo K-quant e IQ-quant sobre los pesos originales en formato Hugging Face.

La model card del repositorio GGUF no incluye información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Para obtener detalles sobre el entrenamiento y la arquitectura del modelo base, sería necesario consultar la documentación oficial de Mistral AI, que no se ha proporcionado en la información disponible.

## Capacidades

- Generación de texto conversacional e instruccional en inglés, orientada a tareas de asistencia y diálogo multi-turno.
- Razonamiento básico y respuesta a instrucciones directas, propio de un modelo de 3B parámetros afinado para instrucciones.
- No se ha documentado soporte explícito de tool calling o function calling en la información disponible.
- No se ha documentado soporte explícito de agentes o razonamiento multi-paso en la información disponible.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se ha documentado modo de pensamiento (thinking mode), visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Asistencia conversacional ligera en inglés: el modelo puede gestionar diálogos multi-turno en aplicaciones de chat o atención al cliente donde el contexto no sea excesivamente largo, gracias a su tamaño reducido que permite respuestas rápidas en hardware modesto.
- Despliegue en dispositivos de borde (edge computing): con cuantizaciones Q4_K_S o Q4_K_M de aproximadamente 2 GB, puede ejecutarse en mini-PC, Raspberry Pi de gama alta o portátiles sin GPU dedicada, ideal para asistentes locales sin conexión.
- Generación de texto en pipelines de procesamiento por lotes: para tareas de resumen, reescritura o clasificación de texto en inglés donde no se requiera un modelo de gran tamaño, el modelo ofrece un equilibrio entre calidad y coste computacional.
- Prototipado rápido de aplicaciones de IA: investigadores y desarrolladores pueden integrar el modelo en entornos de experimentación con llama.cpp u Ollama para validar ideas antes de escalar a modelos mayores.
- Educación y demostraciones: su licencia Apache 2.0 y su reducido tamaño lo hacen adecuado para talleres, cursos y demostraciones de IA generativa en entornos con recursos limitados.
- Filtrado y preprocesamiento de texto: puede emplearse como modelo auxiliar para tareas de normalización, extracción de entidades simples o generación de metadatos en inglés dentro de pipelines más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 2,0-2,1 GB (Q4_K_S/Q4_K_M), 2,8 GB (Q6_K), 3,6 GB (Q8_0) y 6,7 GB (f16), sin contar el overhead del runtime y el contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; para f16 se recomienda al menos 8 GB. GPU de gama alta como A100 o H100 no son necesarias para este modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) e incluso en iGPU con memoria compartida suficiente para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3b-instruct-GGUF (este) | 3,3B | No disponible | Apache 2.0 | GGUF | Hugging Face |
| Ministral-3b-instruct (base) | 3,3B | No disponible | Apache 2.0 | Safetensors | Hugging Face |
| No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la información proporcionada. Se recomienda consultar la documentación oficial de Mistral AI para comparar con otras variantes de la familia Ministral o con modelos de tamaño similar de otros proveedores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinación: presente en modelos de 3B parámetros, especialmente en tareas de razonamiento complejo o generación de hechos; se recomienda validación humana en producción.
- Limitaciones de contexto o idioma: el modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas. La longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de copyright y licencia correspondientes.
- Caveats para producción: al ser una cuantización GGUF, puede haber una ligera pérdida de calidad respecto al modelo original en safetensors, especialmente en cuantizaciones bajas como Q2_K o Q3_K_M (marcada como "lower quality" por el autor). Se recomienda Q4_K_M o superior para producción.
- El repositorio tiene un tamaño de 29,4 GB debido a que incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Ministral-3b-instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ministral/Ministral-3b-instruct
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Ministral-3b-instruct-i1-GGUF
- Página de overview del modelo: https://hf.tst.eu/model#Ministral-3b-instruct-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
