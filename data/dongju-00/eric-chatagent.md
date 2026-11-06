# Dongju-00/eric-chatagent

## Resumen

KoreanGPT — eric-chatagent es un modelo de lenguaje decoder-only de pequeno tamano (41,8 millones de parametros) desarrollado por el usuario Dongju-00 como parte de un proyecto personal de chatbot de noticias y bolsa en coreano. Se trata de un GPT implementado desde cero, con tokenizador SentencePiece propio de 16.000 piezas y un contexto maximo de 384 tokens, entrenado en dos fases: un preentrenamiento sobre datos tipo wiki y dos ajustes finos supervisados (SFT) independientes, uno para conversacion cotidiana multiturno y otro para respuesta sobre noticias.

El modelo no busca competir con LLMs de proposito general: es un artefacto experimental publicado para documentar y reproducir un proceso de entrenamiento. El autor reconoce explicitamente en la model card que, pese a entrenar con entradas multiturno, el modelo no resuelve la correferencia entre turnos (no identifica el sujeto de una intervencion anterior), y que los pesos se publican como registro del experimento, no como modelo listo para produccion. El repositorio ocupa 1,0 GB e incluye los pesos SFT, el modelo preentrenado y el tokenizador.

La relevancia actual es limitada pero ilustrativa: sirve como caso de estudio reproducible de un pipeline completo (tokenizacion, preentrenamiento, SFT multiturno, evaluacion con NLL y perplexity) en un idioma de recursos medios como el coreano, y como ejemplo de publicacion honesta de resultados negativos. No es un modelo adecuado para uso comercial ni para tareas de razonamiento, codigo o matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 41.816.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (maximo de entrada; las muestras de chat se construyen a 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`, float32); tokenizador SentencePiece (`.model`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only clasico con 8 bloques, hidden size de 512 y 8 cabezas de atencion, con embeddings posicionales aprendidos de hasta 384 posiciones y un vocabulario SentencePiece de 16.000 piezas. No emplea mecanismos MoE, atencion lineal, decodificacion especulativa ni modulos multimodales. El modelo no es compatible con `AutoModelForCausalLM` de Transformers: requiere la clase `KoreanGPT` del repositorio del proyecto para cargar el `state_dict`.

El entrenamiento consta de un preentrenamiento sobre datos tipo wiki (del que no se detallan volumen ni composicion) y dos SFT independientes con perdida calculada solo sobre los tokens de respuesta (etiquetas `-100` en pregunta, articulo y padding). El SFT de conversacion cotidiana uso 18.040 sesiones validas de redes sociales mas 400 sesiones sinteticas, generando 25.651 muestras de entrenamiento y 1.314 de validacion (maximo 256 tokens, batch 32, LR 2e-5, AdamW con warm-up del 5 %, cosine decay, weight decay 0,01, gradient clipping 1,0, 2 epocas, 1.604 pasos). El SFT de noticias uso 587 articulos reales (13 descartados por baja calidad de extraccion) con plantillas de pregunta de seguimiento, 4 turnos por articulo, 2.348 turnos totales (aproximadamente el 28 % de respuestas "sin informacion"), divididos en 528 articulos de entrenamiento y 59 de validacion (maximo 384 tokens, batch 16, LR 1e-5, 2 epocas, 66 pasos). Ambos entrenamientos se ejecutaron en una A100-SXM4-40GB. No se reporta RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en coreano, en formato `질문: ...\n답변: ...` (pregunta/respuesta).
- Respuesta extractiva sobre articulos de noticias, incluyendo la capacidad de emitir respuestas de "informacion no disponible" cuando el dato no figura en el articulo.
- Entrada multiturno a nivel de formato: acepta historial concatenado de pares pregunta/respuesta.
- Generacion de embeddings de recuperacion: el modelo preentrenado se usa en el chatbot original como embeddings para busqueda.
- Capacidad de codigo, matematicas, vision, audio, tool calling, function calling y razonamiento agente: no disponible (no documentada ni soportada).
- Capacidad multilingue: no disponible; solo se declara coreano.

## Casos de uso

- Reproduccion de un pipeline de entrenamiento completo: el repositorio incluye pesos, tokenizador, SHA-256 de verificacion y notebooks de Colab, lo que permite reentrenar y comparar paso a paso en una unica A100 o incluso en hardware menor. Util para docencia e investigacion sobre SFT en idiomas de recursos medios.
- Estudio de evaluacion de modelos pequenos: los datos de NLL y perplexity antes y despues del SFT (por ejemplo, perplexity de validacion de 2274,98 a 35,03 en conversacion) sirven como referencia para calibrar metodologias de evaluacion.
- Prototipo de chatbot de noticias en coreano: con 384 tokens de contexto y respuestas extractivas, puede emplearse como baseline en un sistema de preguntas sobre articulos cortos, siempre con revision humana.
- Generacion de embeddings para busqueda semantica en coreano: el modelo preentrenado se uso para indexar y recuperar documentos en el chatbot original, aunque no se documenta la calidad de recuperacion.
- Experimentos de correferencia multiturno: el fallo sistematico del modelo (0/6 aciertos en la identificacion del sujeto de un turno anterior) lo convierte en un caso controlado para estudiar por que modelos pequenos no aprenden dependencias de largo alcance con contextos de 256 tokens.
- Base para ajuste fino adicional: al ser un `state_dict` PyTorch de 41,8 M de parametros, se puede reentrenar en una unica GPU consumer para tareas especificas de clasificacion o generacion coreana de dominio acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas internas de validacion antes y despues del SFT:

| Metrica | Conversacion: antes → despues | Noticias: antes → despues |
|---|---|---|
| NLL de respuesta en validacion | 7,72973 → 3,55619 | 3,29238 → 1,51870 |
| Perplexity de respuesta en validacion | 2274,9795 → 35,0295 | 26,9068 → 4,5663 |
| Correferencia con turno anterior (6 items) | 0/6 → 0/6 | 0/6 → 0/6 |
| Pares de control con solo cambio de sujeto (3 items) | 0/3 → 0/3 | 0/3 → 0/3 |
| NLL sin historial − NLL con historial | 0,69055 → 0,26298 | 0,06846 → 0,05544 |
| Respuestas con 4-grama repetido (38 items) | 0/38 → 0/38 | 0/38 → 5/38 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (41,8 M de parametros × 4 bytes ≈ 167 MB de pesos, mas activaciones y tokenizador); el repositorio completo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una A100-SXM4-40GB, pero el modelo es sobradamente pequeno para GPUs consumer.
- Cabe en cualquier GPU consumer (GTX 1050 Ti, RTX 3050, RTX 4090, etc.) e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no sigue el formato `AutoModelForCausalLM` ni se distribuye en GGUF. El unico camino documentado es cargar el `state_dict` con la clase `KoreanGPT` del repositorio del proyecto y usar el metodo `generate` propio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KoreanGPT eric-chatagent | 41,8 M | 384 tokens | coreano | no disponible | PyTorch `state_dict` |
| Polyglot-Ko 1.3B (EleutherAI) | 1.300 M | 2048 tokens | coreano | no disponible en la informacion | safetensors / Transformers |
| KoGPT2 (SK Telecom) | 125 M | 1024 tokens | coreano | no disponible en la informacion | Transformers |
| Llama 3.2 1B | 1.240 M | 128.000 tokens | multilingue | licencia Llama 3.2 | safetensors / GGUF |

La comparativa es orientativa: los tres modelos alternativos son ordenes de magnitud mayores en parametros y contexto, y estan integrados en el ecosistema Transformers. No se dispone de datos de rendimiento comparables entre ellos y KoreanGPT en la informacion proporcionada.

## Limitaciones y advertencias

- Correferencia multiturno no resuelta: el modelo no identifica el sujeto de intervenciones anteriores (0/6 aciertos en la evaluacion del autor), pese a haberse entrenado con formato multiturno.
- Alucinacion y contenido no fundamentado: el propio autor advierte que las salidas pueden incluir afirmaciones falsas o contenido ausente en el articulo fuente; en noticias se observaron 5/38 respuestas con 4-gramas repetidos.
- Contexto muy limitado: 384 tokens maximos, insuficiente para documentos largos o conversaciones extensas; las muestras de chat se recortan a 256 tokens.
- Monoidioma: solo coreano; no se declara soporte de otros idiomas.
- Licencia no disponible: no se especifican terminos de uso comercial, por lo que no debe asumirse permiso para produccion.
- No es un modelo de asesoramiento financiero: el autor indica explicitamente que no debe usarse para decisiones de compraventa de acciones.
- Integracion limitada: no es compatible con `AutoModelForCausalLM`, no hay versiones GGUF ni cuantizadas, y el repositorio no incluye los datos de entrenamiento (articulos y conversaciones de redes sociales).
- Documentacion de evaluacion incompleta: el autor senala que los resultados de 6 items no deben interpretarse como precision multiturno global y que no se aislo el efecto de la longitud de muestra de 256 tokens.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongju-00/eric-chatagent
- Codigo del proyecto (rama de serving multiturno): https://github.com/Dongju-00/eric-chatagent/tree/feature/serving-multiturn-colab
- Implementacion del modelo (`model.py`): https://github.com/Dongju-00/eric-chatagent/blob/8679d31eb91e7e10894be4fb95dad7d59720818b/src/model/train/model.py
- Notebook de Colab para noticias: https://colab.research.google.com/drive/1L7BQ7yfGgruADffOjA1QvHn0O638WMZO
- Notebook de Colab para conversacion cotidiana: https://colab.research.google.com/drive/1lUsfYyt0JpixA1oluFefhd3v1udwm9J7
- Revision con los pesos previos al SFT del 2026-10-24: revision `da10f420b6ddc642608b19d27ddb90987bdad34d` en el mismo repositorio de Hugging Face
