# Rajeshwari-Chanda/bloom-560m_magnitude_0.3

## Resumen

Rajeshwari-Chanda/bloom-560m_magnitude_0.3 es un checkpoint de generacion de texto publicado en HuggingFace por el usuario Rajeshwari-Chanda, derivado de la familia BLOOM. El recuento real de parametros segun safetensors es de 559.214.592, practicamente identico al de bigscience/bloom-560m, lo que indica que no se ha reducido el numero de tensores del modelo base. El sufijo "magnitude_0.3" sugiere un experimento de poda por magnitud con una tasa de esparcimiento del 30 por ciento, aunque la model card no confirma este extremo.

Se trata de un modelo pequeno, decoder-only, orientado a generacion de texto, con licencia e idiomas no declarados por el autor. La model card es la plantilla autogenerada de transformers y no incluye informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni procedencia exacta del checkpoint base, por lo que la mayor parte de los campos tecnicos quedan como "no disponible".

Su relevancia es principalmente academica y de investigacion: sirve como punto de partida para reproducir experimentos de compresion y poda sobre BLOOM-560m en entornos con recursos limitados, mas que como modelo listo para produccion. No se han publicado resultados de benchmarks ni documentacion de sesgos, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia BLOOM (no confirmado en la model card) |
| Parametros totales | 559.214.592 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens segun la arquitectura BLOOM-560m de referencia; no confirmado para este derivado |
| Tipos de cuantizacion | No se documentan; pesos en safetensors (fp32/fp16). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-560m: un transformer causal (decoder-only) con embeddings posicionales ALiBi, 24 capas, 16 cabezas de atencion, dimension oculta de 1024 y un vocabulario de 250.880 tokens. Estas cifras corresponden al modelo base de la familia y no estan verificadas en la model card del derivado, que se limita a la plantilla autogenerada de HuggingFace.

No hay informacion sobre el procedimiento de entrenamiento, el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO. El tag arxiv:1910.09700 incluido en el modelo apunta al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la seccion Environmental Impact de la plantilla, y no a un paper de entrenamiento del modelo. Tampoco se detalla la tecnica exacta aplicada bajo el nombre "magnitude_0.3", ni si la poda se ha materializado en los tensores o solo se ha registrado como metadato.

## Capacidades

- Generacion de texto autoregresiva basica: el modelo es un causal LM estandar y puede completar prompts y producir texto corto.
- Capacidad multilingue: BLOOM-560m fue entrenado sobre decenas de idiomas, pero este derivado no declara idiomas soportados, por lo que el rendimiento multilingue no esta confirmado.
- Razonamiento y matematicas: no se documenta ningun resultado; en modelos de este tamano las capacidades aritmeticas y de razonamiento multi-paso son muy limitadas.
- Generacion de codigo: no documentada. BLOOM base incluye lenguajes de programacion en su entrenamiento, pero no hay evidencia de calidad util en esta variante.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Modo thinking, vision o audio: no disponible.
- Uso como base para fine-tuning y para experimentos de compresion: es su aplicacion mas plausible dada la ausencia de datos de calidad.

## Casos de uso

- Experimentacion en compresion de modelos: usar el checkpoint para reproducir o comparar tecnicas de poda por magnitud sobre BLOOM-560m, midiendo perplejidad y degradacion respecto al modelo denso original en hardware de gama baja.
- Fine-tuning para clasificacion de texto: adaptar el modelo con una cabeza de clasificacion sobre datasets pequenos de analisis de sentimiento o deteccion de tema en entornos academicos con un solo GPU.
- Prototipado rapido de aplicaciones de generacion de texto: validar pipelines de transformers, tokenizacion y serving antes de migrar a un modelo mayor, gracias a su tamano reducido y a la compatibilidad con text-generation-inference.
- Despliegue en el borde o en CPU: con cuantizacion a int8 o int4 el modelo cabe en dispositivos de poca memoria, lo que permite demostraciones locales sin GPU dedicada.
- Generacion de texto creativo de baja exigencia: completado de frases, borradores y plantillas donde no se requiere alta coherencia ni contexto largo.
- Docencia y formacion: ejemplo manejable para ilustrar el funcionamiento de un transformer causal, la tokenizacion BLOOM y los efectos de la poda sobre la salida del modelo.
- Investigacion sobre sesgos y esparcimiento: analizar como la poda afecta a las representaciones internas y a la generacion en distintos idiomas, siempre que se documenten adecuadamente las limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,24 GB solo para pesos (559M x 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 1,12 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,56 GB; en int4, aproximadamente 0,28 GB.
- Cache KV: para 2048 tokens de contexto, del orden de 200 MB adicionales en fp16, segun la configuracion de referencia de BLOOM-560m (24 capas, 16 cabezas, dimension de cabeza 64).
- GPUs recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060 o superior ejecuta el modelo sin problemas; en A100 o H100 el modelo esta infrautilizado y no aprovecha su ancho de banda.
- Compatibilidad con GPU consumer: si, cabe holgadamente en GPUs con 4 GB o mas de VRAM, e incluso en CPU con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que no se proporciona en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-560m_magnitude_0.3 | 559.214.592 | No confirmado (referencia: 2048) | No disponible | HuggingFace, 0 descargas |
| bigscience/bloom-560m | 559.214.592 | 2048 | bigscience-bloom-rail-1.0 | HuggingFace, ampliamente utilizado |
| EleutherAI/pythia-410m | 410.000.000 aprox. | 2048 | Apache-2.0 | HuggingFace |
| TinyLlama/TinyLlama-1.1B | 1.100.000.000 aprox. | 2048 | Apache-2.0 | HuggingFace |

La comparativa se limita a tamano, contexto y licencia porque no hay resultados de benchmarks publicados para el modelo objeto de esta ficha ni una evaluacion homogenea con las alternativas.

## Limitaciones y advertencias

- Model card vacia: practicamente todos los campos (licencia, idiomas, datos de entrenamiento, evaluacion, sesgos) figuran como "More Information Needed". No es posible auditar el modelo ni verificar su procedencia exacta.
- Licencia indeterminada: al no declararse licencia, no se puede garantizar el uso comercial ni el cumplimiento de las condiciones del modelo base BLOOM, cuya licencia original (bigscience-bloom-rail-1.0) impone restricciones de uso. Se debe aclarar la licencia antes de cualquier despliegue.
- Riesgo de alucinacion: elevado en un modelo de 560M parametros, especialmente en tareas de hechos, matematicas y razonamiento multi-paso.
- Capacidad de contexto limitada: la ventana de referencia de 2048 tokens es reducida para dialogos largos, resumen de documentos o RAG con muchos fragmentos.
- Rendimiento degradado por la poda: si el sufijo "magnitude_0.3" implica un 30 por ciento de esparcimiento, es previsible una perdida de calidad respecto al BLOOM-560m denso, no cuantificada en el repositorio.
- Sin soporte de tool calling ni de agentes: no es adecuado para flujos que requieran function calling o razonamiento multi-paso fiable.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano ni en ningun idioma concreto sin evaluacion previa.
- Trazabilidad nula: 0 descargas y 0 likes, sin documentacion de autor, financiacion ni proceso de publicacion. No se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- Resultados de busqueda no relevantes: las consultas web sobre el modelo devolvieron unicamente contenido no relacionado, por lo que no hay informacion externa que complemente la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_magnitude_0.3
- Paper citado en los tags (Lacoste et al., 2019, sobre estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Modelo base de referencia: https://huggingface.co/bigscience/bloom-560m
