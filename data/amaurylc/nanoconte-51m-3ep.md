# AmauryLC/NanoConte-51M-3ep

## Resumen

NanoConte-51M-3ep es un modelo de lenguaje causal de tipo GPT con aproximadamente 51,2 millones de parametros, entrenado desde cero en frances por el autor AmauryLC. Su proposito es generar historias cortas infantiles, siguiendo la filosofia del trabajo TinyStories de Microsoft Research, que demostro que modelos muy pequenos entrenados con datos sinteticos y simplificados pueden producir texto coherente dentro de un dominio acotado. Esta version corresponde al entrenamiento sobre 3 epocas del modelo base NanoConte-51M, que solo se entreno durante 1 epoca.

Arquitectonicamente es un transformer decoder-only convencional con Pre-LayerNorm, activacion GELU y embeddings ligados, con 8 capas, dimension de embedding de 512 y 8 cabezas de atencion. La ventana de contexto es de 512 tokens y utiliza el tokenizer MaxLSB/LeCarnet-21M con un vocabulario de 50 262 tokens. El checkpoint se distribuye como un `state_dict` PyTorch en float32 de aproximadamente 205 MB, lo que lo hace extremadamente ligero y apto para experimentacion en CPU o GPU de consumo.

Su relevancia es fundamentalmente experimental y educativa: demuestra el flujo completo de entrenamiento de un modelo GPT desde cero en un idioma distinto del ingles, con un dataset en frances (MaxLSB/LeCarnet) y un objetivo muy acotado. No esta pensado para tareas generales de razonamiento, instrucciones o conocimiento factual, sino como banco de pruebas de generacion de cuentos simples en frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT causal decoder-only (Pre-LayerNorm, GELU, embeddings ligados) |
| Parametros totales | 51 216 384 (~51,2 M, de los cuales ~25,7 M estan en la tabla de embeddings) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32; no se documentan variantes GGUF, int8 o int4) |
| Idiomas soportados | frances (fr) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model-51M-3ep.pt`, float32, ~205 MB) |
| Capas (N_LAYER) | 8 |
| Dimension de embedding (N_EMBD) | 512 |
| Cabezas de atencion (N_HEAD) | 8 |
| Tokenizer | MaxLSB/LeCarnet-21M (50 262 tokens) |
| Tamano del repo | 0,2 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT clasica empleada en NanoGPT: transformer decoder-only con 8 bloques, normalizacion previa a cada subcapa (Pre-LayerNorm), activacion GELU en la MLP y pesos de embedding compartidos entre la capa de entrada y la proyeccion de salida (weight tying). La dimension de embedding es 512 y la atencion se reparte en 8 cabezas, con una ventana de contexto fija de 512 tokens. El vocabulario procede del tokenizer MaxLSB/LeCarnet-21M, con 50 262 entradas.

El entrenamiento se realizo desde cero sobre el split `train` del dataset MaxLSB/LeCarnet durante 3 epocas, con AdamW (learning rate 6e-4, betas 0,9/0,95, weight decay 0,1 y gradient clipping a 1,0), warmup lineal de 1000 pasos seguido de decaimiento coseno hasta el 10 % del learning rate maximo, batch de 16 secuencias de 512 tokens (8192 tokens por paso) y precision bfloat16 mediante `torch.autocast` en GPU. No se documenta el numero total de tokens de entrenamiento, ni el uso de RLHF, DPO o cualquier etapa de ajuste posterior al preentrenamiento.

## Capacidades

- Generacion de texto causal en frances dentro del dominio de historias cortas infantiles.
- Produccion de cuentos simples y coherentes a nivel local, con personajes, acciones y una moraleja final, como muestra el ejemplo de la model card.
- Continuacion de prompts en frances a partir de un inicio tipo "Il était une fois".
- Generacion autoregresiva con control de temperatura (`temperature=0.8` en el ejemplo oficial).
- No dispone de soporte de tool calling ni de function calling.
- No implementa razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- Cobertura multilingue limitada al frances; no se declara soporte de otros idiomas.
- No esta entrenado para instruction-following.

## Casos de uso

- Generacion de cuentos infantiles en frances: el modelo produce historias breves del estilo TinyStories, con vocabulario sencillo y estructura narrativa basica, adecuado para prototipos de aplicaciones de lectura infantil.
- Banco de pruebas de pipelines de entrenamiento: al ser un GPT de 51 M entrenado desde cero con script propio (`train.py`), sirve para validar infraestructura de entrenamiento, tokenizacion y decodificacion en un entorno de bajo coste.
- Experimentacion academica con modelos de lenguaje pequenos: permite estudiar fenomenos de aprendizaje, sobreajuste y coherencia local en un regimen de parametros muy reducido y con contexto de 512 tokens.
- Generacion de datos sinteticos de texto frances simple: puede emplearse para producir corpus de cuentos a pequena escala que sirvan como material de aumento de datos o de evaluacion de otros sistemas.
- Demostraciones educativas de decodificacion autoregresiva: su tamano (~205 MB en float32) permite ejecutarlo en CPU para ilustrar sampling, temperatura y top-k en cursos o talleres.
- Prototipado rapido de interfaces de escritura asistida en frances: puede integrarse como generador de continuaciones cortas en editores o juguetes literarios, aceptando la limitacion de coherencia a 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 el checkpoint ocupa ~205 MB y en ejecucion el modelo completo ronda 0,2-0,3 GB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM; una RTX 3060, RTX 4090 o incluso una GTX 1650 son sobradas. Tambien funciona en CPU sin problema apreciable por el tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: al publicarse unicamente como `state_dict` PyTorch, el despliegue requiere cargar el checkpoint con el codigo `train.py` del autor; no se distribuyen pesos en formatos GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI. Un despliegue en esos motores exigiria conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| NanoConte-51M-3ep | ~51,2 M | 512 tokens | Frances | no disponible | PyTorch `state_dict` |
| NanoConte-51M (1 epoca) | ~51,2 M | 512 tokens | Frances | no disponible | PyTorch `state_dict` |
| TinyStories (modelos de referencia) | ~1 M - 33 M segun variante | no disponible en esta ficha | Ingles | licencia del proyecto original, no verificada aqui | no disponible en esta ficha |
| GPT-2 small | 124 M | 1024 tokens | Ingles | MIT (modelo original de OpenAI) | safetensors / PyTorch |

La comparacion con TinyStories y GPT-2 small es orientativa por categoria de tamano; no se dispone de datos de rendimiento comparables para NanoConte-51M-3ep, por lo que no se puede establecer una comparativa cuantitativa de calidad.

## Limitaciones y advertencias

- Modelo experimental de muy pequeno tamano, especializado unicamente en la generacion de historias cortas simples en frances.
- No apto para tareas factuales, de razonamiento o de seguimiento de instrucciones, tal como advierte el autor.
- Ventana de contexto de solo 512 tokens, lo que limita la coherencia en textos largos y provoca deriva tematica con prompts extensos.
- Riesgo elevado de alucinacion fuera del dominio de cuentos infantiles, dado el entrenamiento acotado y el volumen limitado de datos.
- Cobertura linguistica exclusivamente francesa; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- La licencia no esta indicada en la informacion disponible, por lo que no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El checkpoint se distribuye como `state_dict` que depende del codigo `train.py` del repositorio; no hay garantia de compatibilidad con librerias estandar de inferencia sin conversion manual.
- Al no haber benchmarks publicos, no existe evidencia cuantitativa de calidad que respalde su uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmauryLC/NanoConte-51M-3ep
- Version de 1 epoca: https://huggingface.co/AmauryLC/NanoConte-51M
- Tokenizer: https://huggingface.co/MaxLSB/LeCarnet-21M
- Dataset de entrenamiento: https://huggingface.co/datasets/MaxLSB/LeCarnet
