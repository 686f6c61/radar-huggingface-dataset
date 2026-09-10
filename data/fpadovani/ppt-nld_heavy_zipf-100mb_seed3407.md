# fpadovani/ppt-nld_heavy_zipf-100mb_seed3407

## Resumen

`fpadovani/ppt-nld_heavy_zipf-100mb_seed3407` es un modelo de generacion de texto de 86.708.736 parametros (≈86,7 M), resultado de un ajuste fino supervisado (SFT) sobre el modelo monolingue neerlandes `goldfish-models/nld_latn_100mb`. Lo publica el usuario `fpadovani`, vinculado a la Universidad de Groninga segun la URL del run de Weights & Biases que aparece en su model card. La etiqueta `gpt2` del repositorio indica una arquitectura transformer decoder-only de tipo GPT-2, densa, sin mezcla de expertos.

El modelo se ha entrenado con la libreria TRL (version 0.23.0) y no incluye informacion sobre el corpus de ajuste, el numero de tokens, la composicion del dataset ni el proceso de alineamiento (RLHF/DPO). El nombre del repositorio fija una semilla (3407) y hace referencia a una receta de datos etiquetada como `heavy_zipf`, lo que apunta a un artefacto de investigacion reproducible mas que a un modelo orientado a produccion.

Su relevancia actual es acotada y de caracter experimental: no tiene descargas ni valoraciones en el momento de redactar esta ficha, no publica resultados de benchmarks y no especifica licencia. Resulta util, por tanto, como linea base de bajo coste para experimentos de ajuste fino en neerlandes y para estudios comparativos sobre distribuciones de datos de entrenamiento, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2`), densa |
| Parametros totales | 86.708.736 (≈86,7 M), dato real de los pesos en safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas ni GGUF) |
| Idiomas soportados | No disponible en la ficha; el modelo base es neerlandes (`nld_latn`, 100 MB) |
| Licencia | No disponible (la model card solo contiene la cadena `licence: license`) |
| Formato de pesos | safetensors (libreria declarada: transformers) |
| Modelo base | `goldfish-models/nld_latn_100mb` |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | text-generation |
| Etiquetas de despliegue | text-generation-inference, endpoints_compatible |
| Fecha de publicacion | 10/09/2026 (ultima actualizacion 10/09/2026, segun metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only con atencion causal completa y normalizacion previa a cada subcapa, segun indica la etiqueta `gpt2` del repositorio y el pipeline de generacion de texto. El modelo hereda la configuracion del modelo base `goldfish-models/nld_latn_100mb`, perteneciente al proyecto Goldfish, que publica modelos monolingues para cientos de idiomas entrenados con aproximadamente 100 MB de texto por idioma; en este caso, neerlandes en escritura latina. No se especifican en la informacion disponible el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto resultante.

El ajuste fino se realizo con aprendizaje supervisado (SFT) usando TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no documenta el dataset de ajuste, el numero de tokens, la composicion tematica ni tecnicas de alineamiento adicionales. El ejemplo de inicio rapido construye la entrada como una lista de mensajes con los campos `role` y `content`, lo que sugiere que el ajuste se hizo sobre datos con formato conversacional y una plantilla de chat, aunque este extremo no se explicita. El identificador del repositorio sugiere una receta de muestreo de datos de cola pesada (`heavy_zipf`) y una semilla fija (`seed3407`), pero dicha receta no esta documentada en la model card; el run de entrenamiento esta disponible en Weights & Biases.

## Capacidades

- Generacion de texto autoregresiva en neerlandes, heredada del modelo base monolingue y ajustada posteriormente con SFT.
- Generacion condicionada por instrucciones o por conversacion, segun el formato de mensajes que muestra el ejemplo de inicio rapido.
- Respuestas cortas: el ejemplo de la model card limita la generacion a 128 tokens nuevos.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de uso como agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues; el modelo base es estrictamente monolingue (neerlandes).
- No hay capacidades multimodales documentadas (ni vision ni audio).
- No hay modo "thinking" ni decodificacion especulativa documentada.
- No se documentan capacidades destacadas de codigo ni de matematicas.

## Casos de uso

- Experimentos de ajuste fino reproducible: el repositorio fija la semilla 3407 y una receta de datos `heavy_zipf`, por lo que sirve como punto de partida para replicar o variar estudios de SFT sobre un modelo base de 86,7 M de parametros ya disponible.
- Linea base en evaluaciones de modelos monolingues de tamano reducido: al compartir arquitectura y numero de parametros con `goldfish-models/nld_latn_100mb`, permite medir de forma aislada el efecto del ajuste supervisado en tareas de generacion en neerlandes.
- Generacion de texto corto en prototipos: con pesos de aproximadamente 0,17 GB en FP16 y 0,35 GB en FP32, se puede desplegar en portatiles y en entornos de desarrollo sin GPU dedicada para producir textos breves en neerlandes.
- Inferencia en el borde (edge) o en CPU: el tamano reducido permite ejecutar el modelo en un solo nucleo de CPU con latencias aceptables para tareas de relleno, autocompletado o generacion de titulares, siempre que se asuma su calidad limitada.
- Aumento de datos en neerlandes: puede generar variaciones de frases para ampliar conjuntos de datos de entrenamiento en tareas de clasificacion o etiquetado, con revision humana posterior para filtrar alucinaciones.
- Estudio de atributos de datos de entrenamiento: la etiqueta `heavy_zipf` sugiere una distribucion de frecuencia de cola pesada en el corpus de ajuste; el modelo es util como sujeto de analisis para estudiar como esa distribucion afecta a la perplejidad o a la diversidad de la salida.
- Demostraciones docentes de SFT: al ser un modelo pequeno, entrenado con TRL y con el run de entrenamiento publicado, sirve para ilustrar en clase o en talleres el flujo completo de ajuste fino de un modelo de lenguaje, desde el modelo base hasta el despliegue con `pipeline` de Transformers.
- Chatbot experimental de bajo coste: el formato de plantilla conversacional permite montar un prototipo de chatbot en neerlandes para pruebas internas, asumiendo respuestas poco fiables y sin garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra) y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo: el unico resultado obtenido es un dominio sin relacion alguna con el proyecto (`sinad.ealborzins.ir`). El run de Weights & Biases enlazado contiene curvas de entrenamiento, no una evaluacion comparativa publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32, 0,17 GB en FP16/BF16, 0,09 GB en int8 y 0,05 GB en 4 bits, para los pesos. El consumo real dependera del tamano de lote y de la longitud de secuencia, no documentada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, como GTX 1650, RTX 3050, RTX 4090, A100 o H100. En estas dos ultimas el modelo queda limitado por el coste de lanzamiento del kernel mas que por la memoria.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en aceleradores integrados. Tambien es viable la inferencia en CPU y en Apple Silicon mediante MPS.
- Opciones de despliegue: `transformers.pipeline` (ejemplo oficial de la model card), Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` asi lo indican) y vLLM, que soporta la arquitectura GPT-2. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican en ese formato.
- Latencia y throughput estimados: no disponibles. La model card no aporta mediciones de latencia, tokens por segundo ni resultados de pruebas de carga.
- Nota sobre el repositorio: pesa 1,4 GB, muy por encima de los aproximadamente 0,35 GB de los pesos en FP32, por lo que probablemente incluye copias adicionales o artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fpadovani/ppt-nld_heavy_zipf-100mb_seed3407` | 86,7 M | No disponible | No disponible | Publico en HuggingFace, 0 descargas |
| `goldfish-models/nld_latn_100mb` (modelo base) | ≈86,7 M (misma configuracion) | No disponible | No disponible | Publico en HuggingFace |
| GPT-2 (`openai-community/gpt2`) | 124 M | 1024 tokens | MIT, segun la model card en HuggingFace | Muy extendido y ampliamente integrado |
| DistilGPT-2 (`distilbert/distilgpt2`) | 82 M | 1024 tokens | Apache-2.0, segun la model card en HuggingFace | Muy extendido |
| `GroNLP/gpt2-small-dutch` | ≈124 M | 1024 tokens (arquitectura GPT-2 small) | No disponible | Publico en HuggingFace, mismo entorno academico neerlandes |

Los datos de las filas comparativas corresponden a informacion publica de sus respectivas model cards y deben verificarse antes de tomar decisiones de produccion. La comparacion de rendimiento no es posible porque este modelo no publica ninguna metrica.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card solo contiene la cadena `licence: license`, sin texto legal. Sin una licencia declarada, no hay autorizacion clara de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinacion: con 86,7 M de parametros y una arquitectura GPT-2, el modelo no dispone de la capacidad de un modelo grande para mantener coherencia factual ni para reconocer sus propios limites.
- Idiomas: no hay declaracion de idiomas soportados. El modelo base es monolingue en neerlandes, por lo que es previsible un rendimiento pobre o directamente inutil en castellano o en ingles.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide garantizar el comportamiento en conversaciones largas o en documentos extensos.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni la composicion del corpus de ajuste, por lo que no es posible estimar que sesgos sociales, de genero o culturales arrastra el modelo.
- Datos de ajuste opacos: no se publican el numero de ejemplos, la fuente ni los criterios de filtrado del dataset de SFT, lo que dificulta la reproducibilidad completa.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, sin evaluaciones independientes ni informes de terceros.
- Sin cuantizaciones publicadas: no hay archivos GGUF ni variantes de 4 u 8 bits, por lo que el despliegue en llama.cpp u Ollama requiere conversion manual y verificacion de la calidad resultante.
- Uso responsable: no debe emplearse para generar contenido presentado como informacion veraz (sanitario, legal, financiero) sin supervision humana y sin verificacion de las fuentes.
- Metadatos con fecha de publicacion del 10/09/2026; conviene comprobar el estado del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/h9nbiyry
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020), incluida en la model card: repositorio GitHub de TRL
- GPT-2 como referencia de arquitectura: https://huggingface.co/openai-community/gpt2
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo; el unico resultado devuelto fue el dominio `sinad.ealborzins.ir`, sin relacion con el proyecto.
