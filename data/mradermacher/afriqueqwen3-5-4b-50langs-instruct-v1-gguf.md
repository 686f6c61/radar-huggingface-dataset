# mradermacher/AfriqueQwen3.5-4B-50Langs-Instruct-v1-GGUF

## Resumen

AfriqueQwen3.5-4B-50Langs-Instruct-v1-GGUF es una publicación de cuantizaciones estáticas en formato GGUF del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, realizada por el usuario mradermacher. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local del modelo base desarrollado por McGill-NLP, cuyo nombre sugiere una adaptación de la familia Qwen3.5 con 4.000 millones de parámetros orientada a 50 idiomas e instrucciones.

La relevancia de esta ficha radica en que el repositorio ofrece los pesos en GGUF, el formato que permite ejecutar el modelo con llama.cpp, Ollama o LM Studio en hardware de consumo, algo imposible con los safetensors originales si no se dispone de GPU dedicada. El repositorio incluye además suplementos multimodales (mmproj) en cuantización Q8_0 y f16, lo que apunta a que el modelo base incorpora algún componente de visión, si bien la model card no detalla sus capacidades.

La información pública disponible es muy limitada: la model card se limita a listar enlaces de descarga y no documenta arquitectura, datos de entrenamiento, ventana de contexto ni benchmarks. Varios apartados de esta ficha se marcan por ello como "no disponible", y las estimaciones de hardware se derivan del recuento de parámetros indicado en el nombre del modelo, no de datos publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo sugiere la familia Qwen3.5; no confirmado en la model card) |
| Parametros totales | 4B (según el identificador del modelo; no confirmado en la model card) |
| Parametros activos | no aplica si el modelo es denso; no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (según las etiquetas del repositorio); suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | los metadatos declaran únicamente "en"; el nombre del modelo indica 50 idiomas, discrepancia no aclarada en la model card |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (conversión a formato HF según las etiquetas internas del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card de esta cuantización. El identificador del modelo base (AfriqueQwen3.5-4B-50Langs-Instruct-v1) permite inferir que se trata de un transformer denso de aproximadamente 4.000 millones de parámetros, derivado de un modelo de la familia Qwen3.5 y ajustado con instrucciones para cubrir 50 idiomas, presumiblemente con foco en lenguas africanas dado el prefijo "Afrique" y el origen del repositorio (McGill-NLP). Ninguno de estos extremos está confirmado por documentación del autor en la información disponible.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de expertos). La model card de mradermacher se limita a indicar que se trata de cuantizaciones estáticas, que no hay cuantizaciones ponderadas o con imatrix disponibles en el momento de la publicación y que el proceso se realizó con su herramienta habitual de conversión.

## Capacidades

- Generación de texto e instrucciones: el sufijo "Instruct" del modelo base indica ajuste para seguir instrucciones, aunque no se detalla el formato de prompt recomendado.
- Multilingüismo: el nombre declara cobertura de 50 idiomas, con foco previsible en lenguas africanas; los metadatos de HuggingFace solo listan inglés.
- Capacidad multimodal: el repositorio incluye archivos mmproj (proyector multimodal) en Q8_0 y f16, lo que sugiere soporte de entrada de imágenes en el modelo base, sin documentación adicional.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" u otros modos especiales de razonamiento: no disponible.
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Traducción y localización a lenguas africanas: el modelo base se presenta explícitamente como multilingüe para 50 idiomas, por lo que el caso natural es traducir documentación, interfaces o contenidos entre inglés y lenguas de cobertura, ejecutando el GGUF en local para evitar enviar material sensible a APIs externas. La cobertura real de cada idioma debe validarse empíricamente antes de usarlo en producción.
- Asistentes conversacionales en despliegue local: con cuantizaciones Q4_K_M o Q5_K_M el modelo ocupa unos pocos gigabytes, lo que permite montar un chatbot sobre llama.cpp u Ollama en un portátil o en un servidor sin GPU y atender consultas internas sin coste por token.
- Anotación y preprocesado de corpus: un modelo de 4B cuantizado puede etiquetar, normalizar o resumir grandes volúmenes de texto en pipelines de procesamiento por lotes, donde el coste por documento es más determinante que la calidad máxima alcanzable.
- Educación y acceso a información en zonas con conectividad limitada: el formato GGUF permite distribuir el modelo en una memoria USB o en un equipo de bajos recursos y ofrecer asistencia textual sin conexión.
- Prototipado rápido y evaluación comparativa: al estar disponible en múltiples cuantizaciones (de Q2_K a f16), sirve para medir la degradación de calidad por compresión antes de decidir el formato definitivo de un despliegue.
- Extracción de información estructurada: clasificación de textos, detección de entidades o generación de campos en JSON dentro de flujos de trabajo internos, siempre que se valide la fiabilidad del modelo base para estas tareas.
- Generación de código: plausible si el modelo base hereda la capacidad de la familia Qwen, pero no hay evidencia publicada en la información disponible; requeriría evaluación previa con HumanEval o similares.
- Integración multimodal: los suplementos mmproj permiten, en teoría, usar entrada de imágenes junto al modelo de texto en llama.cpp, aunque no se documenta el alcance de esta funcionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado datos en la búsqueda web realizada.

## Requisitos de hardware

Todas las cifras de VRAM de esta sección son estimaciones derivadas de un modelo denso de 4.000 millones de parámetros; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia (solo pesos, sin caché KV ni overhead de runtime):
  - Q2_K: aproximadamente 1,7-2,0 GB.
  - Q4_K_M / Q4_K_S: aproximadamente 2,5-3,0 GB.
  - Q5_K_M / Q5_K_S: aproximadamente 2,9-3,4 GB.
  - Q6_K: aproximadamente 3,4-3,8 GB.
  - Q8_0: aproximadamente 4,3-4,8 GB.
  - f16: aproximadamente 8,0-8,5 GB.
  - Suplementos multimodales mmproj: 0,1 GB cada uno (dato del repositorio).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM ejecuta sin problemas las cuantizaciones de 4 a 8 bits (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100). Para f16 conviene disponer de 12 GB o más.
- ¿Cabe en GPU de consumo? Sí. Con 6-8 GB de VRAM se cubren las cuantizaciones Q4 y Q5 con contexto moderado; con 12 GB se puede usar Q8_0 e incluso f16 en GPUs de 16 GB.
- Ejecución en CPU: viable con llama.cpp y cuantizaciones Q4 o inferiores, con memoria RAM en lugar de VRAM. Apple Silicon con memoria unificada de 8 GB o más también puede ejecutarlo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. Para vLLM o TGI habría que usar los safetensors del modelo base (McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1), no estos archivos GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo reseñado, por lo que la comparación se limita a características estructurales de alternativas de tamaño similar ampliamente documentadas. Los datos de las alternativas provienen de sus propias fichas públicas y no han sido verificados contra AfriqueQwen3.5.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-50Langs-Instruct-v1 (esta ficha) | 4B (según identificador) | no disponible | cc-by-4.0 | GGUF | Multilingüe, 50 idiomas declarados |
| Qwen3-4B | 4B | 32.768 tokens (extensible) | Apache 2.0 | safetensors, GGUF (comunidad) | Generalista, multilingüe, razonamiento |
| Llama-3.2-3B-Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF (comunidad) | Generalista en inglés y multilingüe limitado |
| Gemma-3-4B-it | 4B | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF (comunidad) | Generalista multimodal, multilingüe |

Comparativa de rendimiento: no disponible, al no existir métricas publicadas del modelo reseñado.

## Limitaciones y advertencias

- Ausencia de documentación: la model card no describe arquitectura, datos de entrenamiento, formato de prompt, ventana de contexto ni limitaciones. Cualquier uso en producción exige evaluación propia previa.
- Discrepancia de idiomas: los metadatos de HuggingFace declaran solo "en", mientras que el nombre del modelo reivindica 50 idiomas. La cobertura real por idioma no está verificada.
- Riesgo de alucinación: inherente a los modelos de 4B cuantizados, especialmente en las cuantizaciones agresivas (Q2_K, Q3_K_S) y en idiomas con poca presencia en los datos de entrenamiento.
- Degradación por cuantización: las variantes Q2_K, Q3_K_S y Q3_K_M reducen notablemente la fidelidad respecto a f16 o Q8_0; el propio autor advierte de que no hay cuantizaciones ponderadas ni con imatrix disponibles, que suelen ofrecer mejor relación calidad/tamaño.
- Origen de los pesos: se trata de una conversión comunitaria no oficial; no hay garantía de que los pesos convertidos coincidan exactamente con el comportamiento del modelo base en safetensors.
- Licencia: cc-by-4.0 permite uso comercial y modificación con atribución, pero es responsabilidad del usuario verificar que la licencia del modelo base (McGill-NLP) sea compatible con el uso previsto, ya que podría imponer condiciones adicionales.
- Idiomas de bajos recursos: incluso con cobertura declarada, el rendimiento en lenguas africanas de baja representación suele ser inferior al de inglés, y no hay métricas publicadas que lo cuantifiquen.
- Sesgos: no hay información sobre el dataset de entrenamiento ni sobre procesos de alineación, por lo que no es posible anticipar sesgos específicos; se recomienda auditar las salidas antes de exponer el modelo a usuarios finales.
- Contexto: se desconoce la longitud de contexto soportada; configurar ventanas demasiado grandes puede degradar la calidad o provocar fallos silenciosos.
- Rendimiento multimodal: los archivos mmproj indican una capacidad multimodal no documentada; su funcionamiento con este conjunto de cuantizaciones no está garantizado.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-50Langs-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Página resumen de descargas de mradermacher para este modelo: https://hf.tst.eu/model#AfriqueQwen3.5-4B-50Langs-Instruct-v1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas corporativas de Microsoft sin relación con el modelo.
