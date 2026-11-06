# mradermacher/Qwen3-32B-SFT-AIME-GGUF

## Resumen

Qwen3-32B-SFT-AIME-GGUF es una colección de cuantizaciones GGUF del modelo Ta1k1/Qwen3-32B-SFT-AIME, publicada por el usuario mradermacher el 15 de agosto de 2025. Se trata de un derivado de Qwen3-32B, el modelo denso de 32.762.123.264 parámetros (aproximadamente 32,8 mil millones) desarrollado por el equipo Qwen de Alibaba, que Ta1k1 ha sometido a un ajuste supervisado (SFT) orientado específicamente a problemas de competición matemática del tipo AIME. La versión aquí descrita no es el modelo original, sino su conversión a formato GGUF para su uso con llama.cpp y otros motores compatibles.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 32B especializado en razonamiento matemático en hardware de consumo, algo imposible con los pesos originales en safetensors (unos 65 GB en bf16). mradermacher ofrece un abanico de cuantizaciones estáticas que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que abarca desde portátiles con GPU integrada hasta estaciones con una sola RTX 4090 o incluso CPU con suficiente RAM.

No obstante, conviene subrayar que la model card es extremadamente escueta: no documenta la licencia del modelo derivado, ni los datos de entrenamiento del SFT, ni resultados de benchmarks, ni la longitud de contexto soportada. Toda esta información debe considerarse no disponible a partir de la documentación proporcionada, y quien vaya a desplegar el modelo debería remitirse al repositorio base de Ta1k1 y al modelo original Qwen3-32B para completar el contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3-32B; detalles no disponibles en la model card de esta cuantización) |
| Parámetros totales | 32.762.123.264 (~32,8 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no se ofrecen quants con imatrix) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF; el modelo base Ta1k1/Qwen3-32B-SFT-AIME se distribuye en safetensors |
| Tamaño del repositorio | 224,0 GB (incluye todas las cuantizaciones) |
| Librería declarada | transformers |
| Modelo base | Ta1k1/Qwen3-32B-SFT-AIME |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B, un transformer denso de aproximadamente 32,8 mil millones de parámetros. El modelo intermedio, Ta1k1/Qwen3-32B-SFT-AIME, se ha obtenido mediante ajuste supervisado (SFT) sobre Qwen3-32B, presumiblemente con un conjunto de datos centrado en problemas de matemáticas de competición (AIME). La model card de esta cuantización no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas posteriores de RLHF o DPO; estos datos deben considerarse no disponibles.

La contribución técnica de esta publicación es la cuantización a GGUF realizada por mradermacher, que sigue la cadena estándar de conversión HF→GGUF. Se trata de cuantizaciones estáticas (sin imatrix), tal como indica el propio autor, que además señala que los quants ponderados o con imatrix no estaban previstos en el momento de la publicación. La cadena de herramientas empleada es la habitual de llama.cpp, lo que garantiza compatibilidad con los motores que consumen GGUF.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Razonamiento matemático especializado: el sufijo "AIME" y el ajuste SFT sobre Qwen3-32B indican una orientación a problemas de competición matemática, aunque no se documentan métricas que lo cuantifiquen.
- Razonamiento de tipo "thinking": heredado de la familia Qwen3, que incorpora modo de razonamiento explícito; no obstante, la model card no lo confirma explícitamente para este derivado.
- Generación de código y capacidades generales de lenguaje: presumibles por tratarse de un derivado de Qwen3-32B, pero no documentadas en esta ficha.
- Soporte de tool calling / function calling: no documentado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés (`en`).
- Capacidades de visión o audio: no disponibles (el modelo base no las incluye).

## Casos de uso

- Resolución de problemas matemáticos de nivel competición: el ajuste SFT sobre AIME hace que el modelo sea adecuado para generar soluciones paso a paso en entornos educativos o de investigación, siempre que se validen las respuestas con herramientas simbólicas.
- Tutoría matemática automatizada en inglés: puede gestionar explicaciones multi-turno de ejercicios, aunque la ausencia de una longitud de contexto documentada obliga a probar empíricamente el límite práctico antes de desplegarlo.
- Evaluación de pipelines de razonamiento: útil como referencia especializada para comparar con Qwen3-32B base en tareas de matemáticas, gracias a la disponibilidad de cuantizaciones que caben en una sola GPU.
- Despliegue en estaciones de trabajo con una RTX 4090 (24 GB): los quants Q4_K_M (19,9 GB) o Q5_K_S (22,7 GB) permiten ejecutar el modelo íntegramente en VRAM con llama.cpp, sin necesidad de infraestructura de centro de datos.
- Ejecución en CPU con RAM abundante: los quants Q2_K (12,4 GB) y Q3_K_S (14,5 GB) posibilitan la inferencia en servidores sin GPU, a costa de una pérdida de calidad que el autor califica implícitamente como significativa en los tamaños bajos.
- Generación de datos sintéticos matemáticos: el modelo puede emplearse para producir trazas de solución que luego se filtren y se usen en procesos de destilación o fine-tuning, aprovechando su especialización en AIME.
- Experimentación e investigación en entornos con recursos limitados: la variedad de cuantizaciones permite estudiar el efecto de la compresión en el rendimiento matemático sin necesidad de acceder a los pesos completos en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de MMLU, GSM8K, AIME ni HumanEval, ni comparaciones con el modelo base Qwen3-32B, por lo que no es posible ofrecer cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ≈ 12,4 GB; Q3_K_S ≈ 14,5 GB; Q3_K_M ≈ 16,1 GB; Q3_K_L ≈ 17,4 GB; IQ4_XS ≈ 18,0 GB; Q4_K_S ≈ 18,9 GB; Q4_K_M ≈ 19,9 GB; Q5_K_S ≈ 22,7 GB; Q5_K_M ≈ 23,3 GB; Q6_K ≈ 27,0 GB; Q8_0 ≈ 34,9 GB. A estas cifras hay que sumar la memoria para el contexto, que depende del número de tokens y del backend.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; RTX 3090 (24 GB) en el mismo rango; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; configuraciones multi-GPU para Q8_0 si se requiere contexto largo.
- ¿Cabe en GPU de consumo? Sí: con 24 GB de VRAM se pueden ejecutar cómodamente los quants Q4 y Q5; con 16 GB se puede optar por Q3_K_M o IQ4_XS con contexto reducido; con 12 GB, solo Q2_K.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI que usen GGUF. vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales; para esos motores conviene el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen fuertemente del backend, del quant y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Qwen3-32B-SFT-AIME-GGUF (este) | ~32,8 B | no disponible | no disponible | GGUF | Matemáticas AIME (SFT) |
| Qwen3-32B (original) | ~32,8 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Propósito general |
| Ta1k1/Qwen3-32B-SFT-AIME | ~32,8 B | no disponible | no disponible | safetensors | Matemáticas AIME (SFT) |
| Otras cuantizaciones GGUF de Qwen3-32B | ~32,8 B | depende del autor | depende del autor | GGUF | Propósito general |

La comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros modelos matemáticos de 30B como Qwen2.5-Math o derivados de Llama) no puede realizarse con rigor porque no hay benchmarks publicados para este derivado en la información disponible. La diferencia principal frente al Qwen3-32B original es el ajuste SFT hacia AIME; frente al repositorio de Ta1k1, la única diferencia es el formato GGUF y la disponibilidad de cuantizaciones.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Ta1k1/Qwen3-32B-SFT-AIME y la de Qwen3-32B antes de cualquier despliegue en producción.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede asumir la ventana de Qwen3-32B sin verificarla empíricamente en el GGUF.
- Riesgo de alucinación: como todo modelo generativo, puede producir soluciones matemáticas plausibles pero incorrectas; en dominios de competición es obligatorio validar con un comprobador simbólico.
- Sesgos: no documentados; al estar especializado en un corpus de problemas AIME, puede presentar un sesgo hacia el estilo y los supuestos de ese tipo de ejercicios.
- Cuantizaciones bajas (Q2_K, Q3_K): el propio autor advierte que Q3_K_M es de "lower quality"; en tareas matemáticas, la degradación por cuantización puede ser especialmente sensible.
- Sin quants con imatrix: el autor indica que no estaban previstos, por lo que no se dispone de la mejora de calidad habitual en cuantizaciones ponderadas.
- Modelo derivado no oficial: no procede del equipo Qwen, sino de un ajuste de terceros (Ta1k1) y una cuantización de terceros (mradermacher); no hay garantías de soporte ni de mantenimiento.
- Repositorio de gran tamaño (224 GB): descargar el conjunto completo es costoso; conviene bajar solo el quant necesario.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Qwen3-32B-SFT-AIME-GGUF
- Modelo base del que deriva: https://huggingface.co/Ta1k1/Qwen3-32B-SFT-AIME
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen3-32B-SFT-AIME-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
