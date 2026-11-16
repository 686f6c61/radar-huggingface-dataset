# sansalagangadari/gpt2-reuters-scratch

## Resumen

`sansalagangadari/gpt2-reuters-scratch` es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero (sin pesos preentrenados) por el usuario sansalagangadari sobre el conjunto de datos `ingeniumacademy/reuters_articles`. El modelo sigue la arquitectura transformer decoder-only clasica de GPT-2, pero con una configuracion reducida: 6 capas, 8 cabezas de atencion, dimension de embedding de 256 y una ventana de contexto de solo 256 tokens. Con 18.116.608 parametros, se situa muy por debajo de los modelos GPT-2 originales (124M en la version small), lo que lo convierte en un experimento de escala muy pequena.

El modelo se ha entrenado con prediccion de siguiente token sobre el campo `title + body` de articulos de Reuters, usando un tokenizador propio (`ingeniumacademy/gpt2-reuters-tokenizer`) con un vocabulario de 52.000 entradas. El entrenamiento duro 8,5 minutos en una Tesla T4 con 5 epocas, learning rate 0,0005, schedule coseno, batch de 16 y precision fp16. Las perdidas finales son 3,616 en entrenamiento, 4,207 en validacion y 4,006 en test, con perplejidades de 67,1 y 54,9 respectivamente.

Su relevancia es limitada y de caracter educativo o experimental: sirve como ejemplo de pipeline completo de entrenamiento from scratch (tokenizador, dataset, configuracion, evaluacion) y como modelo de dominio muy especifico para texto periodistico en ingles. No esta pensado para uso en produccion ni para tareas generales, y su licencia no esta especificada, lo que anade incertidumbre sobre su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2), 6 capas, 8 cabezas, n_embd=256 |
| Parametros totales | 18.116.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas como llama.cpp, no documentada) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, configurado con `n_layer=6`, `n_head=8`, `n_embd=256` y `vocab=52000`. La ventana de contexto es de 256 tokens. Se inicializo de forma aleatoria, sin cargar pesos preentrenados de GPT-2, y se entreno con el objetivo estandar de modelado de lenguaje (prediccion del siguiente token) sobre el texto concatenado de titulo y cuerpo de articulos de Reuters, con el formato de prompt `<|endoftext|>TITLE\n\nBODY`. El tokenizador asociado es `ingeniumacademy/gpt2-reuters-tokenizer`, con un vocabulario de 52.000 tokens.

El entrenamiento consistio en 5 epocas con learning rate 0,0005, schedule coseno, batch de 16, precision fp16 y semilla 42, seleccionando el mejor checkpoint por perdida de validacion. Se completo en 8,5 minutos sobre una Tesla T4. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF, DPO o decodificacion especulativa; la model card solo indica el dataset de origen y los hiperparametros basicos.

## Capacidades

- Generacion de texto causal en ingles, limitada a continuaciones de hasta 256 tokens de contexto.
- Generacion condicionada por titulo: el formato de entrenamiento permite pasar un titular y obtener un cuerpo de articulo verosimil.
- Modelado de lenguaje de dominio periodistico: el vocabulario y la distribucion estan sesgados hacia el estilo de noticias de Reuters.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente nula: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Generacion de titulares y cuerpos de noticias sinteticas para pruebas: el modelo puede producir texto con estructura de articulo periodistico en ingles, util para rellenar entornos de desarrollo o tests de sistemas de publicacion.
- Aumento de datos para tareas de NLP en dominio periodistico: generar variaciones de articulos para entrenar clasificadores o modelos de resumen en un dominio concreto, siempre con revision humana.
- Experimentos educativos de entrenamiento from scratch: sirve como referencia reproducible de pipeline completo (tokenizador propio, dataset, configuracion y evaluacion) para cursos o talleres.
- Prototipado rapido de interfaces de generacion de texto: al ocupar 0,1 GB, puede desplegarse en cualquier maquina para probar integraciones de `transformers` o endpoints compatibles con text-generation-inference.
- Estudio de sobreajuste y generalizacion en modelos pequenos: las perdidas de validacion y test (4,207 y 4,006) frente a la de entrenamiento (3,616) permiten analizar el comportamiento de un modelo de baja capacidad sobre un corpus especifico.
- Generacion de texto de relleno en ingles para demos de UI o maquetas: su velocidad de inferencia en CPU y su tamano minimo lo hacen adecuado para entornos con recursos muy limitados.
- Comparacion de tokenizadores de dominio: permite evaluar el impacto de un vocabulario de 52.000 tokens entrenado sobre Reuters frente a tokenizadores generalistas en tareas de perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de entrenamiento y evaluacion del propio corpus:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 3,616 |
| Perdida de validacion | 4,207 |
| Perdida de test | 4,006 |
| Perplejidad de validacion | 67,1 |
| Perplejidad de test | 54,9 |
| Tiempo de entrenamiento | 8,5 min (Tesla T4) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 36 MB para los pesos (18,1M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con mas de 1 GB.
- Cabe holgadamente en GPUs de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, e incluso en CPU.
- GPU recomendadas para entrenamiento o fine-tuning: Tesla T4 (usada por el autor), RTX 3060 o superiores; el entrenamiento completo cabe en menos de 1 GB de VRAM con batch 16 y contexto 256.
- Opciones de despliegue: `transformers` (libreria nativa), text-generation-inference (el modelo declara compatibilidad con endpoints), y conversion posible a GGUF para llama.cpp u Ollama, aunque no esta documentada oficialmente.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-reuters-scratch | 18,1M | 256 | en | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | en | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82M | 1024 | en | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355M | 1024 | en | MIT | Hugging Face |

Frente a GPT-2 small, el modelo aqui descrito tiene aproximadamente una septima parte de parametros, un contexto cuatro veces menor y un vocabulario mayor (52.000 frente a 50.257). No se dispone de benchmarks comparativos que permitan establecer una comparacion de rendimiento objetiva; la perplejidad de 54,9 en test no es directamente comparable con la de GPT-2 small porque el corpus y el tokenizador son distintos.

## Limitaciones y advertencias

- Modelo de muy baja capacidad (18,1M parametros) y contexto de solo 256 tokens: las generaciones largas perderan coherencia rapidamente.
- Entrenado exclusivamente en ingles y en el dominio de noticias de Reuters; el vocabulario y el estilo estan fuertemente sesgados hacia ese corpus.
- Riesgo alto de alucinacion: al ser un modelo pequeno entrenado desde cero, no tiene conocimiento factual fiable y puede generar afirmaciones falsas con apariencia verosimil.
- La licencia no esta especificada, lo que impide determinar si se permite el uso comercial; debe tratarse como no apto para produccion hasta que el autor la aclare.
- Sin datos publicados sobre sesgos especificos, pero al entrenarse solo con Reuters hereda los sesgos editoriales y de cobertura de esa agencia.
- Sin soporte documentado de tool calling, agentes ni instrucciones; no es un modelo ajustado por instrucciones.
- El checkpoint fue seleccionado por perdida de validacion con una sola semilla (42), por lo que no hay evidencia de robustez estadistica.
- No se documenta el volumen de tokens de entrenamiento ni la composicion exacta del dataset, lo que dificulta evaluar la calidad de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sansalagangadari/gpt2-reuters-scratch
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
