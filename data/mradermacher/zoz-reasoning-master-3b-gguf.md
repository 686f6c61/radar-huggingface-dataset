# mradermacher/ZOZ-Reasoning-Master-3B-GGUF

## Resumen

ZOZ-Reasoning-Master-3B-GGUF es la versión cuantizada en formato GGUF del modelo z51722369/ZOZ-Reasoning-Master-3B, publicada por el usuario mradermacher, conocido en HuggingFace por generar cuantizaciones estáticas para modelos de terceros. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión del modelo base original a pesos GGUF listos para su uso con llama.cpp y derivados. El modelo base tiene 3.085.938.688 parámetros (unos 3,09 mil millones), según los datos reales de sus ficheros safetensors.

La relevancia de esta ficha es práctica: es la vía más directa para ejecutar un modelo de 3B orientado a razonamiento en hardware de consumo, ya que ofrece 12 niveles de cuantización que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16). Al estar publicado únicamente en inglés y orientado a uso conversacional, su público objetivo son desarrolladores que quieran desplegar un asistente local o un componente de razonamiento dentro de un pipeline sin depender de APIs externas.

La información disponible es notablemente limitada: la model card del repositorio de cuantización no documenta arquitectura, longitud de contexto, datos de entrenamiento ni licencia, y no se han publicado resultados de benchmarks. Además, el repositorio acumula 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, por lo que no existe validación comunitaria de la calidad del modelo base ni de las cuantizaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; el repositorio solo declara `library_name: transformers` y el formato GGUF, sin detallar la arquitectura del modelo base |
| Parámetros totales | 3.085.938.688 (~3,09 mil millones), dato real procedente de los safetensors del modelo base |
| Parámetros activos | No aplica / no disponible (no se indica que el modelo sea de tipo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (cuantizaciones estáticas). Existe además un repositorio aparte con cuantizaciones ponderadas con imatrix (prefijo i1) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | No disponible (la model card del repositorio de cuantización no especifica licencia) |
| Formato de pesos | GGUF en este repositorio (multipart), safetensors en el modelo base |
| Modelo base | z51722369/ZOZ-Reasoning-Master-3B |
| Tamaño del repositorio | 27,9 GB (incluye todos los niveles de cuantización) |
| Descargas / me gusta | 0 / 0 en el momento de la consulta |
| Fecha de creación | 18 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base en el material proporcionado. Los únicos datos estructurales confirmados son el recuento de parámetros (3.085.938.688), el uso de la librería `transformers` para el modelo original y el hecho de que la conversión a GGUF se realizó con `quantize_version: 2` y `output_tensor_quantised: 1`, con tipo de conversión `hf`. El nombre del modelo sugiere un ajuste fino orientado a razonamiento sobre una base de 3B, pero esto no está documentado y no debe tomarse como un hecho verificado.

Tampoco se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la posible aplicación de RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal. Todo ello queda fuera del alcance de la información disponible y debería consultarse directamente en la ficha del modelo base.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está preparado para diálogo multi-turno.
- Razonamiento: el nombre del modelo apunta a un ajuste orientado a tareas de razonamiento, pero no hay documentación que confirme el alcance ni el formato de prompts esperado.
- Inglés como único idioma declarado: no se anuncia soporte multilingüe.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con el formato estándar de HuggingFace.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de ejecución por pasos ni formato de trazas de pensamiento.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

## Casos de uso

- Asistente conversacional local en portátil: con la cuantización Q4_K_M (2,0 GB) el modelo cabe en GPUs de 6-8 GB y permite desplegar un chatbot de escritorio que no envía datos a terceros. Es adecuado cuando la privacidad es un requisito y el volumen de consultas no justifica una API.
- Componente de razonamiento dentro de un pipeline mayor: dado su tamaño reducido, puede usarse como "razonador" auxiliar que reformula consultas o descompone problemas complejos antes de pasarlos a un modelo mayor, reduciendo coste por token en la fase de planteamiento.
- Generación de código asistida sin conexión: en entornos con conectividad restringida o cláusulas de confidencialidad estrictas, la versión Q8_0 (3,4 GB) puede servir como autocompletado o generador de fragmentos cortos, siempre que se valide la calidad real del modelo base con pruebas propias antes de llevarlo a producción.
- Tutoría y práctica de razonamiento matemático: para uso educativo en inglés, con la ventaja de que las cuantizaciones bajas (Q3_K_S, 1,6 GB) permiten ejecutarlo en máquinas sin GPU dedicada mediante llama.cpp en CPU.
- Prototipado rápido de aplicaciones LLM: al existir 12 niveles de cuantización, un equipo puede empezar con Q2_K (1,4 GB) para validar la integración en fases tempranas y subir a Q4_K_M o Q6_K cuando el pipeline esté cerrado, sin cambiar de modelo.
- Investigación sobre degradación por cuantización: el repositorio permite comparar directamente el efecto de 12 esquemas distintos (incluido IQ4_XS frente a Q4_K_S, ambos de 1,9 GB) sobre un mismo modelo de 3B, lo que lo hace útil como banco de pruebas metodológico.
- Despliegue en dispositivos de borde: con 1,4-2,0 GB de pesos, es viable ejecutarlo en mini-PC, Raspberry Pi con 8 GB de RAM o portátiles antiguos para tareas de clasificación, resumen corto o extracción de información en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el modelo base tampoco se documenta en el material proporcionado. No se ofrece, por tanto, ninguna comparación cuantitativa de rendimiento con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar caché KV ni overhead del runtime): Q2_K ~1,4 GB; Q3_K_S ~1,6 GB; Q3_K_M ~1,7 GB; Q3_K_L ~1,8 GB; IQ4_XS y Q4_K_S ~1,9 GB; Q4_K_M ~2,0 GB; Q5_K_S y Q5_K_M ~2,3 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB.
- GPUs recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente para las cuantizaciones de 4 y 5 bits (RTX 3060, RTX 4060, RTX 2070, GTX 1660 con 6 GB quedan justas en Q4). Para Q8_0 o f16 conviene una GPU de 8-12 GB (RTX 3080, RTX 4070, RTX 3060 de 12 GB).
- Cabe en GPU de consumo: sí, en todos los niveles salvo que se busque f16 con mucho contexto. Las cuantizaciones Q2_K a Q5_K_M caben incluso en GPUs de 4-6 GB, y Q2_K o Q3_K_S pueden ejecutarse íntegramente en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui para los ficheros GGUF. Para el modelo base en safetensors se necesitarían vLLM, TGI o transformers con precisión fp16/bf16 (aproximadamente 6,2 GB de pesos más overhead), lo que exige al menos 12-16 GB de VRAM.
- Latencia y throughput estimados: no disponible. Al ser un modelo de ~3B con cuantización de 4 bits, en una GPU de consumo media es razonable esperar decenas de tokens por segundo, pero no hay ninguna medición publicada en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZOZ-Reasoning-Master-3B (este) | ~3,09 mil millones | No disponible | No disponible | GGUF en este repositorio; safetensors en el modelo base |
| Qwen2.5-3B | ~3,09 mil millones | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache-2.0 | Pesos originales y múltiples cuantizaciones GGUF de terceros |
| Llama 3.2 3B | ~3,21 mil millones | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos originales y cuantizaciones GGUF oficiales y de terceros |
| Phi-3.5-mini-instruct | ~3,8 mil millones | 128.000 tokens | MIT | Pesos originales y cuantizaciones GGUF |

Los datos de los modelos de referencia proceden de sus respectivas documentaciones públicas y deben verificarse antes de tomar decisiones de producción. Para el modelo de esta ficha no es posible establecer una comparación de rendimiento porque no hay benchmarks publicados; la única ventaja verificable frente a las alternativas es la disponibilidad de 12 niveles de cuantización estática más una variante con imatrix.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar que el uso comercial esté permitido. Es un bloqueo potencial para cualquier despliegue en producto y debe aclararse con el autor del modelo base antes de continuar.
- Modelo únicamente en inglés: no hay soporte multilingüe declarado, por lo que no es adecuado para aplicaciones en castellano sin un ajuste adicional.
- Longitud de contexto desconocida: sin este dato no es posible dimensionar correctamente la caché KV ni garantizar el comportamiento en conversaciones largas o en tareas de resumen de documentos extensos.
- Riesgo de alucinación: inherente a los modelos de 3B de propósito general, y previsiblemente mayor en tareas de razonamiento matemático o factual, donde el modelo puede generar cadenas de pasos plausibles pero incorrectas.
- Degradación por cuantización: el propio autor etiqueta Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rápidas, Q6_K como "very good quality" y Q8_0 como mejor calidad. Las cuantizaciones de 2 y 3 bits deben tratarse como experimentales.
- Ausencia de validación comunitaria: 0 descargas y 0 "me gusta" implican que no hay evidencia externa de que los ficheros funcionen correctamente ni de la calidad del modelo base.
- Model card mínima: el repositorio es una cuantización automatizada; no incluye plantilla de chat, formato de prompt recomendado ni parámetros de muestreo, lo que puede provocar resultados pobres si se usa con la plantilla equivocada.
- Procedencia del modelo base: el autor del modelo original (z51722369) no está documentado en la información disponible, lo que dificulta evaluar el origen de los datos de entrenamiento y posibles sesgos.
- Fechas de metadatos atípicas: la fecha de creación indicada (18 de septiembre de 2026) es posterior a la fecha habitual de referencia, lo que conviene verificar en la propia página de HuggingFace.
- Sin garantía de soporte de tool calling: aunque el repositorio se marca como `endpoints_compatible`, no hay confirmación de soporte de function calling, por lo que no debería asumirse en diseños de agentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZOZ-Reasoning-Master-3B-GGUF
- Modelo base: https://huggingface.co/z51722369/ZOZ-Reasoning-Master-3B
- Cuantizaciones ponderadas con imatrix (i1): https://huggingface.co/mradermacher/ZOZ-Reasoning-Master-3B-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#ZOZ-Reasoning-Master-3B-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable del cuantizador: https://www.nethype.de/
