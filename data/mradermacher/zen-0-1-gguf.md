# mradermacher/zen-0.1-GGUF

## Resumen

zen-0.1 es un modelo de lenguaje de pequeno tamano (176.195.328 parametros, aproximadamente 176 millones) entrenado desde cero y publicado por el usuario angelgodbrokenns en Hugging Face. La version descrita en esta ficha es la cuantizacion GGUF realizada por mradermacher, un conocido creador de cuantizaciones estaticas para llama.cpp. El modelo se presenta como un "small-language-model" de tipo conversacional, orientado a experimentacion y despliegue ligero en entornos con recursos limitados.

La relevancia de este modelo radica en su escala: con 176 millones de parametros y un peso en f16 de apenas 0,5 GB, es uno de los modelos mas ligeros de la familia de transformers disponibles en formato GGUF. Esto lo hace apto para ejecucion en CPU, dispositivos de borde y GPUs de gama baja, aunque con las limitaciones de capacidad inherentes a su tamano. El contexto maximo, la arquitectura exacta y los detalles de entrenamiento no estan documentados en la model card.

La model card del repositorio de cuantizacion es escueta y se limita a listar los quants disponibles y los datasets empleados en el entrenamiento del modelo base. No se publican resultados de benchmarks, ni detalles sobre el proceso de alineamiento (RLHF/DPO), ni informacion sobre la longitud de contexto soportada. La licencia figura como "other" con nombre "unverified", lo que introduce incertidumbre sobre las condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (inferida por la libreria transformers y el tag "llama"); detalles no disponibles |
| Parametros totales | 176.195.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other / unverified (sin verificar) |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que indican "llama" y "from-scratch". El modelo base angelgodbrokenns/zen-0.1 se entreno desde cero, segun el tag correspondiente, lo que sugiere que no es un fine-tuning de un modelo existente sino un entrenamiento propio. El numero de parametros (176 millones) es coherente con un transformer pequeno de la familia de los modelos tipo Llama, aunque no se especifica el numero de capas, dimensiones ocultas ni cabezas de atencion.

Los datasets listados en la model card incluyen HuggingFaceFW/fineweb-edu y HuggingFaceTB/smollm-corpus como fuentes de texto general, junto con varios datasets especializados: jonathanasdf/MathGLM-dataset-500k (matematicas), Crownelius/Complete-FABLE.5-traces-2M y Claux67/FABLE-5.2-MAX-DATABASE (trazas de razonamiento), VINAY-UMRETHE/Sonnet-Opus-4.5-4.6-Gemini-3.0-3.1-Pro-GPT-5-5.1-5.2-GLM-4.7-MiniMax-M2.1-DeepSeek-V3.2-High (trazas de modelos grandes) y Jackrong/GLM-5.1-Reasoning-1M-Cleaned (razonamiento). No se indica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational" del repositorio.
- Razonamiento basico y matematicas: los datasets de entrenamiento incluyen MathGLM y trazas de razonamiento, lo que sugiere cierta especializacion en estos dominios, aunque no hay evaluaciones publicadas que lo confirmen.
- Capacidad multilingue limitada: solo se declara soporte para ingles.
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.
- El modelo es compatible con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en plataformas de inferencia gestionada.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con 176 millones de parametros y cuantizaciones de 0,2 GB, el modelo puede desplegarse en minutos en un portatil o en una instancia pequena para validar flujos de conversacion antes de migrar a modelos mayores.
- Experimentacion educativa en entrenamiento desde cero: al ser un modelo "from-scratch" de escala pequena, sirve como caso de estudio para analizar como se comporta un transformer de 176 millones de parametros entrenado con datasets mixtos de texto y razonamiento.
- Inferencia en dispositivos de borde o CPU: las cuantizaciones Q4_K_S y Q4_K_M (0,2 GB) permiten ejecucion en Raspberry Pi, mini-PCs o telefonos de gama alta mediante llama.cpp, con latencia aceptable para respuestas cortas.
- Generacion de texto de bajo coste en pipelines por lotes: para tareas de clasificacion, resumen corto o generacion de plantillas donde no se requiere alta calidad, el modelo ofrece un coste computacional minimo.
- Filtrado y preprocesado de datos: puede emplearse como modelo auxiliar para etiquetar o limpiar corpus en ingles antes de pasarlos a modelos mayores, gracias a su bajo coste de inferencia.
- Entornos con restricciones de memoria muy estrictas: en escenarios donde una GPU consumer no esta disponible y solo se cuenta con RAM, las cuantizaciones Q2_K o Q3_K (0,2 GB) permiten mantener el modelo cargado en memoria de forma permanente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para cuantizaciones Q2_K a Q5_K_M, 0,3 GB para Q8_0 y 0,5 GB para f16. Estas cifras corresponden al tamano del archivo de pesos y no incluyen el overhead del contexto KV.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; el modelo esta disenado para ejecucion en CPU. GPUs como RTX 3060, RTX 4060 o incluso iGPUs modernas pueden ejecutarlo sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos, asi como en CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), y servidores compatibles con la API de OpenAI a traves de llama.cpp server. Tambien es posible usar transformers con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una latencia muy baja en CPU y practicamente instantanea en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zen-0.1 (este) | 176 M | no disponible | other/unverified | GGUF, safetensors | Entrenado desde cero, solo ingles |
| SmolLM-135M | 135 M | 2048 tokens (segun version) | Apache 2.0 | safetensors, GGUF | Modelo pequeno de HuggingFaceTB con documentacion completa |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, multilingue |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Mayor capacidad, ampliamente evaluado |

La comparativa se basa en caracteristicas publicas de modelos de escala similar; no se dispone de datos de rendimiento de zen-0.1 para establecer comparaciones cuantitativas. Los modelos alternativos citados cuentan con licencias permisivas y documentacion mas completa, lo que supone una ventaja para uso en produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con fineweb-edu y smollm-corpus, es probable que herede sesgos presentes en estos corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: alto, dado el reducido tamano del modelo (176 M) y la ausencia de evaluaciones de fidelidad. No se recomienda su uso en tareas que requieran precision factual sin verificacion humana.
- Limitaciones de contexto e idioma: solo se declara soporte para ingles; la longitud de contexto no esta documentada, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia figura como "other" con nombre "unverified", lo que significa que las condiciones de uso comercial no estan claras ni verificadas. Antes de usarlo en produccion es necesario contactar con el autor o consultar el repositorio del modelo base.
- Caveats para produccion: la model card no documenta el proceso de alineamiento, no hay benchmarks, no se especifica la tokenizer ni la plantilla de chat, y el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El repositorio de cuantizacion no incluye quants ponderados/imatrix, solo estaticos, lo que puede afectar ligeramente a la calidad en comparacion con cuantizaciones ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/zen-0.1-GGUF
- Modelo base: https://huggingface.co/angelgodbrokenns/zen-0.1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#zen-0.1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
