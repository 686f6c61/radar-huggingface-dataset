# mradermacher/TinyLlama-3MPER0RR-abliterated-GGUF

## Resumen

TinyLlama-3MPER0RR-abliterated-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo TinyLlama-3MPER0RR-abliterated, publicadas por mradermacher, un conocido generador de cuantizaciones de la comunidad de Hugging Face. El modelo subyacente deriva de TinyLlama, un transformer decoder-only de aproximadamente 1.100 millones de parámetros, y ha sido sometido a un proceso de "abliteration", una técnica de modificación de pesos orientada a eliminar los mecanismos de rechazo aprendidos durante el ajuste por preferencias.

La relevancia de esta ficha reside en que empaqueta un modelo de muy bajo coste computacional en una batería de cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (2,3 GB), lo que permite ejecutarlo en hardware muy modesto, incluidos portátiles sin GPU dedicada o dispositivos de borde. El repositorio ocupa 9,8 GB en total al incluir todas las variantes.

Conviene subrayar que el autor de esta publicación es únicamente el cuantizador: no hay información publicada sobre el dataset de entrenamiento, el número de tokens, el proceso de alineación ni los resultados de evaluación del modelo base. La model card se limita a listar los ficheros GGUF disponibles y a remitir a la documentación genérica de mradermacher.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de TinyLlama; detalles no disponibles) |
| Parámetros totales | 1.100.048.384 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es TinyLlama-3MPER0RR-abliterated, una variante de la familia TinyLlama de 1.100 millones de parámetros. Se trata de un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. La model card del repositorio de cuantización no documenta la composición del dataset de entrenamiento, el número de tokens procesados, la longitud de contexto nativa ni las técnicas de alineación empleadas (RLHF, DPO u otras).

El único elemento diferencial documentado es el sufijo "abliterated", que indica que los pesos han sido modificados mediante abliteration, una técnica que identifica y proyecta fuera las direcciones del espacio de activaciones asociadas al comportamiento de rechazo, reduciendo la tendencia del modelo a negarse a responder. Esta modificación se aplica típicamente sobre un modelo ya alineado y no requiere reentrenamiento completo, aunque degrada parcialmente la calibración del modelo original. No se dispone de información sobre hiperparámetros, precisión de entrenamiento ni cronología del proceso.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la base TinyLlama.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño de 1.100 millones de parámetros.
- Generación de código y matemáticas a nivel elemental; no hay evidencia publicada de rendimiento en estas tareas.
- Comportamiento de rechazo reducido respecto al modelo alineado original, como consecuencia directa de la abliteration.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Prototipado rápido en local: gracias a las cuantizaciones de 0,5 a 0,8 GB, el modelo se puede cargar en un portátil sin GPU y servir respuestas en milisegundos para validar pipelines de prompts antes de migrar a un modelo mayor.
- Experimentación con técnicas de abliteration: investigadores que estudian la supresión de comportamientos de rechazo pueden usar esta variante cuantizada para comparar respuestas frente al TinyLlama original sin necesidad de infraestructura de GPU.
- Generación de texto de relleno y datos sintéticos: útil para crear corpus de prueba, plantillas de texto o datos de aumento en tareas de NLP donde la calidad lingüística exigida es moderada.
- Despliegue en dispositivos de borde: con Q4_K_M (0,8 GB) cabe en Raspberry Pi 5 con 8 GB de RAM o en mini-PC con CPU moderna, permitiendo asistentes de texto sin conexión.
- Educación y divulgación: sirve para demostrar el funcionamiento de un LLM completo y de las cuantizaciones GGUF en talleres, ya que el coste de ejecución es mínimo.
- Pruebas de integración con llama.cpp y Ollama: el formato GGUF y los tags `endpoints_compatible` facilitan validar cadenas de inferencia, servidores compatibles con la API de OpenAI y herramientas de gestión de modelos.
- Filtrado y clasificación de texto ligera: con un prompt adecuado puede emplearse para etiquetar fragmentos cortos en inglés, aunque la precisión será inferior a la de modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad comparativa entre cuantizaciones, más allá de la referencia genérica a un gráfico externo de calidad de cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,3 GB (Q8_0); f16 requiere unos 2,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar Q4_K_M; una RTX 3060, RTX 4060 o superior ofrece amplio margen y permite lotes mayores. En A100 o H100 el modelo está claramente infrautilizado, ya que el cuello de botella pasa a ser el ancho de banda de memoria.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas, incluidas GTX 1650, RTX 3050 y superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo indica) y cualquier runtime que acepte GGUF.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, en CPU moderna se esperan decenas de tokens por segundo con Q4_K_M, y cientos en GPU consumer, aunque no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyLlama-3MPER0RR-abliterated-GGUF (este) | 1,1 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés |
| TinyLlama-1.1B-Chat (original) | 1,1 B | 2.048 tokens (según documentación pública de TinyLlama) | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia; contexto no confirmado en esta ficha |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Multilingüe, mayor contexto y rendimiento |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa moderna con mejor razonamiento |

La comparación con los modelos alternativos se basa en datos públicos de sus respectivas familias; no se dispone de evaluaciones directas entre este modelo y los citados. En términos de contexto y capacidades multilingües, las alternativas modernas de 1,5 a 1,7 mil millones de parámetros superan previsiblemente a esta variante, cuyo principal atractivo es el comportamiento sin rechazos y su reducido tamaño.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, sesgado o inexacto sin filtros; no es adecuado para aplicaciones orientadas al usuario final sin una capa de moderación externa.
- Riesgo elevado de alucinación: con 1.100 millones de parámetros, la capacidad de mantener coherencia factual es muy limitada.
- Idiomas: solo inglés documentado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para conversaciones multi-turno largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor del cuantizado no ofrece garantías sobre el modelo base ni sobre el proceso de abliteration.
- No hay información sobre sesgos específicos introducidos o amplificados por la modificación de pesos.
- La model card no documenta el proceso de entrenamiento ni la procedencia de los datos, lo que dificulta evaluar riesgos de contaminación o de propiedad intelectual.
- El repositorio tiene un número muy bajo de descargas (251) y cero likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/TinyLlama-3MPER0RR-abliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-abliterated
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/TinyLlama-3MPER0RR-abliterated-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#TinyLlama-3MPER0RR-abliterated-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
