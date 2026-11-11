# mradermacher/ProjectX-GGUF

## Resumen

ProjectX-GGUF es la colección de cuantizaciones en formato GGUF del modelo turksatbilisim/ProjectX, generada por mradermacher, un conocido publicador de cuantizaciones para llama.cpp. El modelo original es un transformer denso de aproximadamente 7.615 millones de parámetros (7,6B), lo que lo sitúa en la franja de modelos de tamaño medio orientados a inferencia en hardware de consumo. Esta versión GGUF permite ejecutar el modelo con llama.cpp, Ollama y otros motores compatibles sin necesidad de GPU de gama alta.

El repositorio incluye cuantizaciones estáticas que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de variantes IQ4_XS. El autor indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicación. El modelo está etiquetado como conversacional y con soporte únicamente para inglés.

La relevancia de esta ficha radica en que ProjectX-GGUF es la vía práctica para desplegar el modelo original en entornos con recursos limitados. Al tratarse de una cuantización y no de un modelo original, las capacidades y el rendimiento dependen enteramente del modelo base turksatbilisim/ProjectX, del cual no se dispone de información técnica detallada en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base turksatbilisim/ProjectX. Por el número de parámetros (7,6B) y la etiqueta de librería transformers, se trata de un transformer denso de escala media, pero se desconoce si emplea atención estándar, atención con ventana deslizante, GQA/MQA u otras variantes. Tampoco hay datos sobre el número de capas, dimensiones ocultas o número de cabezas de atención.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El autor de la cuantización no aporta información sobre el proceso de entrenamiento del modelo original. La única información contextual es que el modelo está orientado a uso conversacional y que su idioma declarado es el inglés.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", por lo que está diseñado para mantener diálogos multi-turno.
- Generación de texto general en inglés: al ser un modelo de 7,6B parámetros, se espera capacidad para redacción, resumen y respuesta a preguntas, aunque no hay benchmarks que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", lo que indica que puede desplegarse en infraestructuras de inferencia compatibles con Hugging Face Endpoints.

## Casos de uso

- Asistentes conversacionales en local: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), el modelo puede ejecutarse en un portátil con GPU de 8 GB de VRAM o incluso en CPU con llama.cpp, lo que lo hace adecuado para prototipos de chatbots privados sin conexión.
- Despliegue en edge computing: la cuantización Q2_K (3,1 GB) permite ejecutar el modelo en dispositivos con recursos muy limitados, útil para demos y pruebas de concepto en entornos sin GPU dedicada.
- Generación de texto en pipelines de CI/CD: al ser compatible con llama.cpp y Ollama, puede integrarse en flujos automatizados de generación de documentación o resúmenes de cambios en repositorios.
- Investigación y experimentación con cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite estudiar el impacto de la compresión en la calidad de las respuestas para un modelo de 7,6B.
- Evaluación comparativa de quant types: útil para investigadores que quieran medir la degradación de perplejidad entre Q2_K, Q4_K_M y Q8_0 en un modelo conversacional concreto.
- Servicio de inferencia ligero con Ollama: la disponibilidad de GGUF permite desplegar el modelo con un solo comando en Ollama, adecuado para entornos de desarrollo y pruebas internas.
- Fine-tuning posterior sobre base cuantizada: aunque el fine-tuning directo sobre GGUF es limitado, el modelo base en safetensors permite adaptaciones y luego recuantizar con las recetas de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,1 GB de pesos, ~4 GB de VRAM total con contexto moderado.
  - Q4_K_M: ~4,8 GB de pesos, ~6 GB de VRAM total.
  - Q5_K_M: ~5,5 GB de pesos, ~7 GB de VRAM total.
  - Q6_K: ~6,4 GB de pesos, ~8 GB de VRAM total.
  - Q8_0: ~8,2 GB de pesos, ~10 GB de VRAM total.
  - f16: ~15,3 GB de pesos, ~17 GB de VRAM total.
- GPU recomendadas:
  - RTX 3060 12 GB / RTX 4060 Ti 16 GB: adecuadas para Q5_K_M, Q6_K y Q8_0.
  - RTX 4090 24 GB: puede ejecutar f16 con contexto amplio.
  - A100 / H100: sobredimensionadas para este tamaño; útiles para servir múltiples instancias o contextos muy largos.
- ¿Cabe en consumer GPU? Sí. Prácticamente cualquier GPU con 8 GB o más puede ejecutar Q4_K_M; las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM y TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ProjectX-GGUF (este) | 7,6B | No disponible | No disponible | GGUF | Hugging Face |
| Mistral-7B-Instruct (referencia) | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Amplia |
| Llama 3.1 8B Instruct (referencia) | 8,0B | 128K | Llama 3.1 Community | safetensors, GGUF | Amplia |
| Qwen2.5 7B Instruct (referencia) | 7,6B | 128K | Apache 2.0 (mayoría) | safetensors, GGUF | Amplia |

Nota: los datos de los modelos de referencia se incluyen como contexto de categoría; no se dispone de benchmarks de ProjectX que permitan una comparación de rendimiento directa. La comparativa se limita a parámetros, contexto, licencia y disponibilidad, y en el caso de ProjectX varios de estos datos no están publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base turksatbilisim/ProjectX antes de cualquier despliegue en producción.
- Idiomas: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que no se puede estimar su calidad objetiva frente a alternativas.
- Riesgo de alucinación: al no disponer de información sobre el entrenamiento ni de evaluaciones, no se puede caracterizar el nivel de alucinación; se debe asumir el riesgo habitual de los modelos de 7B.
- Sesgos conocidos: no documentados en la información disponible.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay versiones weighted/imatrix, que suelen ofrecer mejor calidad por tamaño en cuantizaciones pequeñas.
- Modelo base poco documentado: la falta de información sobre turksatbilisim/ProjectX (arquitectura, datos, alineación) limita la evaluación de riesgos y la reproducibilidad.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/ProjectX-GGUF
- Modelo base: https://huggingface.co/turksatbilisim/ProjectX
- Página de overview de mradermacher para este modelo: https://hf.tst.eu/model#ProjectX-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa patrocinadora (nethype GmbH): https://www.nethype.de/
