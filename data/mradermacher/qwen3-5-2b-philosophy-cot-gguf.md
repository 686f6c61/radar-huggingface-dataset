# mradermacher/Qwen3.5-2B-Philosophy-CoT-GGUF

## Resumen

Qwen3.5-2B-Philosophy-CoT-GGUF es la version cuantizada en formato GGUF del modelo Hakiyukuno/Qwen3.5-2B-Philosophy-CoT, un ajuste fino mediante LoRA sobre Qwen3.5-2B, el modelo de 2.000 millones de parametros de la serie Qwen3.5 de Alibaba Cloud. El ajuste esta orientado a razonamiento filosofico con cadenas de pensamiento (chain-of-thought) explicitas, y conserva el caracter bilingue chino-ingles del modelo base. Las cuantizaciones las publica mradermacher, un perfil conocido por distribuir versiones GGUF de modelos abiertos para inferencia local.

El interes practico del repositorio es que permite ejecutar un modelo de razonamiento especializado en humanidades en hardware de consumo: los ficheros van de 1,1 GB (Q2_K, Q3_K_S) a 3,9 GB (f16), de modo que la variante Q4_K_M de 1,4 GB cabe en practicamente cualquier GPU moderna e incluso en CPU con llama.cpp. Esto lo convierte en una opcion realista para prototipos offline, docencia o investigacion sobre razonamiento de bajo coste computacional.

Se trata de un modelo pequeno y muy especializado, no de un asistente generalista. La model card es minima: no documenta dataset de entrenamiento, numero de tokens, proceso de alineacion ni resultados de evaluacion, y solo declara los idiomas zh y en. Cualquier uso en produccion deberia ir acompanado de una evaluacion propia, especialmente si se pretende trabajar en castellano, idioma no declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la serie Qwen3.5 (Alibaba Cloud); el detalle de atencion no se especifica en la informacion disponible |
| Parametros totales | 1.881.825.088 (~1,88 B), segun safetensors del modelo base |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | 4.096 tokens, segun el agregador externo free2aitools para la variante Qwen3.5-2B-GGUF; no confirmado en la model card de este fine-tune |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (solo estaticas; el autor indica que no hay cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 18,1 GB (incluye todas las cuantizaciones) |
| Metodo de ajuste | LoRA sobre Qwen3.5-2B, segun el tag `lora` y el campo `base_model` |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5 de Alibaba Cloud, descrito por Qualcomm AI Hub como un modelo de 2.000 millones de parametros "balanced" pensado para inferencia en dispositivo y con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. La informacion disponible no detalla el tipo de atencion (completa, GQA, hibrida), la composicion del corpus de preentrenamiento ni el numero de tokens vistos. La documentacion de la serie Qwen3.5 en Ollama menciona una base unificada vision-lenguaje mediante fusion temprana de tokens multimodales, pero la model card de este fine-tune no confirma que dicha capacidad se conserve ni que este checkpoint acepte imagenes.

Sobre el modelo base se aplico un ajuste LoRA centrado en filosofia y en la produccion de cadenas de razonamiento ("Philosophy-CoT"), segun los tags del repositorio. No se documenta el volumen de datos de instruccion, su procedencia, si hubo destilacion de trazas de razonamiento, ni si se aplicaron etapas de RLHF o DPO. El autor de las cuantizaciones solo indica que son "static quants" generadas con `quantize_version: 2` y `output_tensor_quantised: 1` a partir de los pesos en formato Hugging Face, sin cuantizaciones imatrix/ponderadas. Tampoco se han publicado notas sobre decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con el tag `conversational` en el repositorio.
- Razonamiento explicito mediante cadenas de pensamiento (CoT): el ajuste esta disenado para exponer pasos intermedios de razonamiento antes de la respuesta final.
- Contenido filosofico especializado: historia de la filosofia, analisis conceptual, argumentacion y exegesis de textos, segun el dominio declarado por el autor del fine-tune.
- Razonamiento de tipo analitico y discursivo; no hay evidencia publicada de rendimiento en matematicas o codigo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado; el CoT es interno al modelo, no un bucle de agente.
- Capacidades multimodales (vision, audio): no declaradas para este checkpoint.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso con APIs de inferencia tipo Hugging Face, aunque no se especifica el formato de plantilla de chat.

## Casos de uso

- Tutoria de filosofia en local: el modelo puede generar explicaciones paso a paso de corrientes, autores y argumentos, y el formato CoT permite mostrar al estudiante el razonamiento intermedio en lugar de solo la conclusion. Es adecuado porque el ajuste esta entrenado especificamente en ese dominio.
- Generacion de material docente: producir resumenes, guiones de clase o preguntas socraticas sobre textos filosoficos, ejecutando el modelo en un portatil con llama.cpp y la cuantizacion Q4_K_M de 1,4 GB.
- Analisis argumental asistido: reconstruir premisas, identificar supuestos implicito y detectar falacias en un parrafo, aprovechando el modo de razonamiento encadenado para auditar cada paso por separado.
- Investigacion sobre razonamiento en modelos pequenos: usar el checkpoint como sujeto de estudio para comparar trazas CoT entre cuantizaciones (Q4_K_M frente a Q8_0) y medir la degradacion del razonamiento al reducir bits.
- Prototipado de asistentes de humanidades offline: desplegar un chatbot bilingue zh/en en entornos sin conectividad (aulas, archivos, bibliotecas) donde no se puede enviar texto a una API externa.
- Anotacion y clasificacion de corpus filosoficos: preetiquetar fragmentos por escuela, autor o tema en zh/en, con revision humana posterior, usando el modelo como primera pasada de bajo coste.
- Simulacion de dialogos filosoficos: generar debates o respuestas contrapuestas entre posiciones teoricas para uso en docencia o divulgacion, con la ventaja de que el CoT hace explicito el hilo argumental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del fine-tune ni la del repositorio de cuantizaciones incluyen puntuaciones de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de filosofia o razonamiento, ni comparaciones medidas contra el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV con contexto de ~4.000 tokens, calculada a partir del tamano de cada fichero): Q4_K_S/IQ4_XS ~1,8-2,0 GB; Q4_K_M ~2,0 GB; Q5_K_M ~2,1 GB; Q6_K ~2,3 GB; Q8_0 ~2,7 GB; f16 ~4,5 GB. Son estimaciones, no mediciones publicadas por el autor.
- El agregador free2aitools indica ~3 GB de VRAM estimada para la variante Qwen3.5-2B-GGUF, en linea con las cifras anteriores.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, GTX 1660 Super, RTX 4060, RTX 4090) puede ejecutar con holgura las cuantizaciones Q4 y Q5. Para f16 conviene una GPU de 6-8 GB o superior.
- Cabe en GPU consumer: si, de forma clara; tambien en CPU con llama.cpp o en Apple Silicon mediante Metal, dado el reducido tamano del modelo.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF), Ollama (importando el fichero con un Modelfile, ya que la serie Qwen3.5 esta disponible en su libreria), LM Studio, text-generation-webui y otras interfaces basadas en llama.cpp. vLLM y TGI estan orientados a los pesos originales en safetensors; su soporte de GGUF es limitado o experimental, por lo que no se recomiendan como primera opcion para este repositorio.
- Latencia y throughput: no disponibles. En un modelo de 2 B con cuantizacion Q4, la generacion en GPU consumer suele ser interactiva, pero no hay cifras publicadas que permitan confirmarlo.
- Nota: al ser cuantizaciones estaticas (sin imatrix), el autor advierte de que las versiones de menor bit (Q2_K, Q3_K_S) pueden degradar la calidad mas de lo habitual en cuantizaciones ponderadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-2B-Philosophy-CoT-GGUF (este) | ~1,88 B | 4.096 tokens (segun agregador externo) | Filosofia + CoT, bilingue zh/en | Apache 2.0 | GGUF, 12 cuantizaciones |
| mradermacher/Qwen3.5-2B-GGUF | ~2 B | 4.096 tokens (segun agregador externo) | Modelo base Qwen3.5-2B sin especializar | No disponible en la informacion consultada | GGUF |
| mradermacher/Qwen3.5-2B-heretic-GGUF | No disponible | No disponible | Variante "abliterated/heretic" del mismo base | No disponible en la informacion consultada | GGUF |
| qwen3.5:2b (Ollama) | ~2 B | No disponible | Modelo base de la serie, con base multimodal declarada por Ollama | No disponible en la informacion consultada | Etiqueta oficial de Ollama |

La comparacion con modelos de otros fabricantes del mismo rango (por ejemplo, familias de 1-3 B con variantes GGUF) no puede completarse con los datos disponibles: no hay benchmarks publicados de este checkpoint que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El ajuste se ha realizado sobre un corpus filosofico no descrito, por lo que la representacion de tradiciones no occidentales, autores contemporaneos o perspectivas criticas es una incognita.
- Riesgo de alucinacion: alto en un modelo de 2 B, especialmente en citas textuales, referencias bibliograficas, fechas y atribuciones de obras. El formato CoT no elimina el riesgo: puede producir cadenas de razonamiento plausibles pero erroneas.
- Cobertura linguistica limitada: solo zh y en declarados. No hay garantia de calidad en castellano, ni de que el modelo mantenga el modo CoT fuera de esos idiomas.
- Contexto corto: si se confirma el limite de 4.096 tokens, no es adecuado para analisis de obras completas ni para conversaciones multi-turno largas sin resumen intermedio.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar los terminos del modelo base Qwen3.5-2B y del fine-tune original de Hakiyukuno antes de redistribuir o desplegar en produccion.
- Cuantizaciones estaticas: la ausencia de versiones imatrix implica que Q2_K y Q3_K_S pueden degradar notablemente el razonamiento; para tareas que dependen del CoT se recomienda Q5_K_M o superior.
- Madurez: el repositorio tiene 0 descargas y 1 like, y fue creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni validacion independiente.
- Sin datos de evaluacion: no se puede afirmar que el ajuste supere al modelo base en tareas filosoficas; seria necesario un banco de pruebas propio.
- Plantilla de chat no documentada: al usar el GGUF conviene comprobar el formato de prompt esperado (heredado de Qwen3.5) para evitar degradacion en las respuestas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-2B-Philosophy-CoT-GGUF
- Modelo base del fine-tune: https://huggingface.co/Hakiyukuno/Qwen3.5-2B-Philosophy-CoT
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-2B-Philosophy-CoT-GGUF
- Variante sin especializar: https://huggingface.co/mradermacher/Qwen3.5-2B-GGUF
- Variante "heretic": https://huggingface.co/mradermacher/Qwen3.5-2B-heretic-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Etiqueta qwen3.5:2b en Ollama: https://ollama.com/library/qwen3.5:2b
- Ficha agregada de Qwen3.5-2B-GGUF en free2aitools: https://free2aitools.com/model/mradermacher/qwen3.5-2b-gguf
