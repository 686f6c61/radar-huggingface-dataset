# mradermacher/Oprius-3.0-1.1B-i1-GGUF

## Resumen

Oprius 3.0 1.1B es un modelo conversacional ligero de 1.100 millones de parametros desarrollado por zzzekryo, entrenado sobre el dataset zzzekryo/conversation-and-web-examples-ForOprius. Esta ficha corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un cuantizador bien conocido en la comunidad de Hugging Face que produce versiones imatrix (importance matrix) de modelos populares para su ejecucion en hardware modesto.

El modelo se posiciona en la categoria de "tiny LLMs" (el tag "tinyllama" en sus metadatos lo sugiere), orientado a conversacion general en ingles. Su relevancia radica en la posibilidad de ejecutarlo en CPUs, portatiles o GPUs de consumo sin apenas consumo de memoria, gracias a las mas de veinte cuantizaciones disponibles que van desde 0,4 GB (IQ1_S) hasta 1,0 GB (Q6_K). Es un candidato tipico para experimentacion, chatbots embebidos o prototipado rapido, aunque al tratarse de un modelo comunitario pequeno no existen benchmarks publicados que avalen su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer conversacional, estilo TinyLlama segun tags) |
| Parametros totales | 1.100.048.384 (1,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion imatrix); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se ha publicado documentacion tecnica detallada sobre la arquitectura del modelo base zzzekryo/Oprius-3.0-1.1B. Los metadatos indican que es un modelo conversacional compatible con la libreria transformers y que la comunidad lo etiqueta con "tinyllama", lo que apunta a una arquitectura transformer compacta de tipo Llama, pero el numero de capas, dimensiones ocultas o mecanismos de atencion concretos no estan disponibles.

Respecto al entrenamiento, el modelo base fue entrenado sobre el dataset zzzekryo/conversation-and-web-examples-ForOprius, una coleccion de ejemplos de conversacion y contenido web. No hay informacion sobre el numero de tokens procesados, si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre las fases de preentrenamiento y ajuste fino. Lo que si esta documentado es el proceso de cuantizacion: mradermacher genero cuantizaciones weighted/imatrix (importance matrix), una tecnica que calibra la cuantizacion usando un archivo de matriz de importancia para preservar mejor la calidad en los niveles bajos de bits, especialmente en los cuants IQ de k-quant.

## Capacidades

- Generacion de texto conversacional en ingles, con enfoque en dialogo general ("general_help", "general_conversation").
- Compatibilidad con el ecosistema GGUF: ejecutable con llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes.
- Archivo imatrix incluido (0,1 GB) para que los usuarios generen sus propias cuantizaciones calibradas.
- Formato conversacional: los metadatos lo marcan como "conversational", apto para plantillas de chat.
- No hay evidencia de capacidades de vision, audio, tool calling ni modos de razonamiento extendido.
- No hay informacion sobre soporte de function calling ni capacidades agenticas.

## Casos de uso

- Chatbot personal offline: con la version Q4_K_M (0,8 GB) se puede desplegar un asistente conversacional en un portatil sin GPU, ideal para privacidad total ya que nada sale del dispositivo.
- Prototipado rapido de agentes ligeros: su tamano minimo permite iterar rapidamente en logica de dialogo antes de escalar a modelos mayores.
- Integracion en aplicaciones de escritorio: el formato GGUF y su peso inferior a 1 GB facilitan incluir el modelo dentro de instaladores de software sin requisitos de hardware exigentes.
- Experimentacion con cuantizacion: el archivo imatrix incluido permite a investigadores generar y comparar sus propias cuantizaciones y estudiar el impacto de distintos esquemas de bits.
- Ejecucion en dispositivos edge y SBC: en placas como Raspberry Pi 5 o mini PCs, los cuants IQ2/IQ3 (0,4-0,6 GB) permiten inferencia en CPU con memoria muy limitada.
- Generacion de datos sinteticos de bajo coste: para tareas de relleno o expansion de conversaciones donde la calidad maxima no es critica, un modelo de 1,1B reduce drasticamente el coste por token.
- Ensenanza y demostraciones: util como ejemplo practico en talleres sobre LLMs locales por su facilidad de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del modelo base no documenta evaluaciones en MMLU, HumanEval, GSM8K ni otras suites, y el cuantizador mradermacher solo aporta notas cualitativas sobre la calidad relativa de cada cuant (por ejemplo, que IQ3_S supera a Q3_K, o que Q4_K_M es la opcion recomendada por equilibrio tamano/velocidad/calidad).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,5 GB (IQ1_S/IQ1_M, 0,4 GB de archivo) hasta ~1,5 GB (Q6_K, 1,0 GB de archivo), contando contexto y buffers. Cabe integramente en la RAM de cualquier ordenador moderno.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2 GB de VRAM o mas lo ejecuta con holgura. No se necesitan A100 ni H100.
- Consumer GPUs: funciona sin problemas en GPUs integradas (Intel iGPU, AMD APU) y en cualquier GPU dedicada, incluidas las de gama baja.
- CPU: totalmente viable en CPUs de escritorio y portatil; en un modelo de este tamano la inferencia en CPU es rapida (decenas de tokens por segundo en CPUs modernas, estimacion no oficial).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. El modelo base en transformers puede desplegarse con vLLM o TGI, aunque para 1,1B suele ser innecesario.
- Latencia y throughput: no disponibles oficialmente; por tamano, se espera latencia de primer token baja y throughput alto incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Oprius 3.0 1.1B (este modelo, cuant i1) | 1,1B | GGUF imatrix | Apache 2.0 | no disponible | Conversacion general en ingles, ~0,4-1,0 GB por cuant |
| TinyLlama 1.1B Chat | 1,1B | safetensors, GGUF comunitario | Apache 2.0 | 2.048 tokens | Base TinyLlama ampliamente usada, ecosistema maduro |
| Qwen2.5 1.5B Instruct | 1,5B | safetensors, GGUF comunitario | Apache 2.0 | 32.768 tokens | Multilingue (29+ idiomas), benchmarks publicados, tool calling |
| Llama 3.2 1B Instruct | 1,2B | safetensors, GGUF comunitario | Licencia Llama 3.2 | 128.000 tokens | Contexto muy largo, soporte oficial de Meta, uso comercial con condiciones |

La ventaja diferencial de Oprius 3.0 frente a estas alternativas es la licencia Apache 2.0 sin restricciones y el amplio surtido de cuants imatrix; su desventaja es la ausencia total de benchmarks publicados y de documentacion tecnica, frente a alternativas como Qwen2.5 o Llama 3.2 con evaluaciones verificables.

## Limitaciones y advertencias

- Idioma: el modelo esta orientado al ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado o impredecible.
- Sin benchmarks verificables: no hay datos objetivos de calidad, por lo que conviene evaluarlo internamente antes de cualquier uso serio.
- Riesgo de alucinacion: al ser un modelo comunitario de 1,1B sin documentacion de alineacion, el riesgo de respuestas incorrectas o inventadas es alto, especialmente en tareas de conocimiento factual.
- Cuants de muy baja calidad: las versiones IQ1_S, IQ1_M e IQ2 (0,4-0,5 GB) degradan notablemente la salida; el propio cuantizador las marca como "para desesperados". Se recomienda Q4_K_M como punto de partida.
- Contexto: la longitud de ventana no esta documentada, lo que dificulta planificar aplicaciones con conversaciones largas o documentos extensos.
- Sin capacidades avanzadas documentadas: no hay soporte confirmado de tool calling, vision ni razonamiento estructurado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; no obstante, conviene verificar la procedencia y licencia de los datos de entrenamiento del dataset propio del autor, que no esta documentado en detalle.
- Procedencia comunitaria: el autor zzzekryo no tiene documentacion publica extensa, un factor de riesgo habitual en modelos pequeños de terceros para entornos de produccion.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/mradermacher/Oprius-3.0-1.1B-i1-GGUF
- Modelo base: https://huggingface.co/zzzekryo/Oprius-3.0-1.1B
- Cuants estaticos del mismo modelo: https://huggingface.co/mradermacher/Oprius-3.0-1.1B-GGUF
- Pagina de descargas alternativa de mradermacher: https://hf.tst.eu/model#Oprius-3.0-1.1B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/zzzekryo/conversation-and-web-examples-ForOprius
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
