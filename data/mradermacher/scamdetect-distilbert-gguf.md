# mradermacher/scamdetect-distilbert-GGUF

## Resumen

`scamdetect-distilbert-GGUF` es la versión cuantizada en formato GGUF del modelo `TshokayDorji/scamdetect-distilbert`, un clasificador basado en DistilBERT afinado para detección de fraudes en texto: phishing, smishing y spam. Lo publica mradermacher, un conocido generador de cuantizaciones GGUF de la comunidad, y no aporta entrenamiento nuevo: su valor está en empaquetar el modelo original en formatos ligeros ejecutables con llama.cpp y ecosistemas compatibles.

El modelo es pequeño: 66.955.779 parámetros totales según los pesos safetensors del repositorio, lo que lo sitúa en la categoría de encoders ligeros. La ventana de contexto, los datos de entrenamiento y los benchmarks no se detallan en la información disponible; la model card se limita a listar los ficheros de cuantización generados.

Es relevante para desarrolladores que necesitan un filtro de seguridad de bajo coste en pipelines de mensajería o correo, ejecutable en CPU o en GPU de gama baja, con licencia MIT y sin dependencia de APIs externas. No es un modelo generativo: está pensado como extractor de características y clasificador, no como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado); confirmado por el nombre del modelo base, sin detalle adicional en la model card |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en formato transformers/safetensors |
| Tamano del repo | 0,7 GB |
| Pipeline declarado | no disponible |
| Tarea declarada en tags | feature-extraction |
| Modelo base | TshokayDorji/scamdetect-distilbert |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un transformer encoder destilado de BERT con aproximadamente la mitad de parámetros del original y pensado para inferencia rápida. El repositorio GGUF no incluye información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo ajuste fino supervisado con etiquetas de phishing, smishing y spam; la model card original de `TshokayDorji/scamdetect-distilbert` no se reproduce en la información disponible.

La única innovación técnica documentada es el proceso de cuantización estática realizado por mradermacher, con conversión desde transformers (`convert_type: hf`) y cuantización de tensores de salida (`output_tensor_quantised: 1`, `quantize_version: 2`). El autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación y que podrían no planificarse; las cuantizaciones incluidas son estáticas.

## Capacidades

- Clasificación de texto orientada a detección de fraudes: phishing, smishing y spam, según los tags del repositorio.
- Extracción de características (`feature-extraction`) para usar embeddings del encoder en pipelines propios.
- Ejecución local en formato GGUF mediante llama.cpp y herramientas compatibles.
- Inferencia en CPU y GPU de gama baja gracias al reducido tamaño del modelo (0,1-0,2 GB por cuantización).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable; es un encoder, no un modelo generativo.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Filtrado de correo entrante en servidores de correo: el modelo puede clasificar asuntos y cuerpos de mensajes como sospechosos de phishing antes de que lleguen a la bandeja de entrada, ejecutándose en CPU con la cuantización Q4_K_M (aproximadamente 0,1 GB) y baja latencia por lote.
- Moderación de SMS y mensajería móvil: adecuado para detectar smishing en pasarelas de SMS, donde el volumen es alto y el coste por inferencia debe ser mínimo; el tamaño reducido permite desplegarlo en el mismo nodo que la pasarela.
- Pre-filtro en sistemas anti-fraude de comercio electrónico: clasificar reseñas, mensajes de vendedores o comunicaciones transaccionales como spam o intento de fraude antes de un análisis más profundo con modelos mayores.
- Enriquecimiento de pipelines de ciberseguridad: usar los embeddings del encoder para alimentar clasificadores secundarios o sistemas de clustering de campañas de phishing en herramientas SOC.
- Protección de formularios y comentarios en aplicaciones web: clasificación en tiempo real de contenido enviado por usuarios en un servicio backend ligero, sin depender de APIs de terceros ni exponer datos a proveedores externos.
- Investigación académica sobre detección de spam: modelo de referencia pequeño y con licencia MIT para reproducir experimentos de clasificación binaria o multietiqueta con bajo coste computacional.
- Despliegue en dispositivos con recursos limitados: la cuantización Q2_K (0,1 GB) permite integración en entornos edge o contenedores con memoria restringida, siempre que el rendimiento de clasificación sea aceptable para el caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de precisión, recall, F1 ni comparaciones con otros clasificadores, y la información del modelo base no está disponible en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; las versiones Q4_K_M y Q8_0 ocupan entre 0,1 y 0,2 GB en disco, por lo que la memoria necesaria para inferencia es mínima.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o incluso una iGPU con soporte de llama.cpp son suficientes.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas, y también en CPU.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), y servidores compatibles con GGUF; el modelo base original puede ejecutarse con transformers en PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño (menos de 67 millones de parámetros), se espera una latencia muy baja por muestra, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| scamdetect-distilbert-GGUF | 66.955.779 | no disponible | MIT | GGUF | Clasificador de fraude en inglés, cuantizado por mradermacher |
| TshokayDorji/scamdetect-distilbert | no disponible | no disponible | MIT (según el repo derivado) | transformers | Modelo base del que deriva esta cuantización |
| DistilBERT base | 66 millones | 512 tokens (valor típico de DistilBERT, no confirmado para este modelo) | Apache 2.0 (DistilBERT original) | safetensors, GGUF | Encoder genérico; este modelo es un ajuste específico para fraude |
| BERT base | 110 millones | 512 tokens (valor típico, no confirmado) | Apache 2.0 (BERT original) | safetensors, GGUF | Alternativa de encoder más grande, sin ajuste específico para fraude |

La comparación con alternativas específicas de detección de fraude no está disponible en la información proporcionada; no se han identificado modelos comparables con datos verificables en la búsqueda.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); su uso en castellano u otros idiomas no está validado y probablemente degrade el rendimiento.
- No es un modelo generativo: no puede mantener conversaciones ni generar texto; solo clasifica o extrae características.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen los sesgos presentes y la distribución de dominios cubierta.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador; no se han publicado métricas de precisión, recall ni F1.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La model card no documenta el pipeline ni la forma exacta de uso; el autor remite a READMEs genéricos de TheBloke para el manejo de GGUF.
- Las cuantizaciones ponderadas con imatrix no están disponibles; solo hay cuantizaciones estáticas, que pueden tener peor calidad en tipos bajos como Q2_K.
- La licencia MIT permite uso comercial, pero el usuario debe verificar la licencia del modelo base y de los datos de entrenamiento originales, no documentados aquí.
- No apto como único mecanismo de seguridad: debe combinarse con reglas, listas de bloqueo y revisión humana en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/scamdetect-distilbert-GGUF
- Modelo base: https://huggingface.co/TshokayDorji/scamdetect-distilbert
- Página de descargas del cuantizador: https://hf.tst.eu/model#scamdetect-distilbert-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
