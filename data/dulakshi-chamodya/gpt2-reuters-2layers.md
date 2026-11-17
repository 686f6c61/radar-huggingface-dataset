# dulakshi-chamodya/gpt2-reuters-2layers

## Resumen

`dulakshi-chamodya/gpt2-reuters-2layers` es un modelo de generacion de texto derivado de la arquitectura GPT-2, publicado en Hugging Face por el usuario dulakshi-chamodya. Por el nombre y el tamano (14.957.568 parametros, segun los pesos en safetensors), se trata de una variante reducida de GPT-2 con solo dos capas de transformer, presumiblemente entrenada o ajustada sobre un corpus de noticias de Reuters. No es un modelo oficial de OpenAI ni una release de un laboratorio, sino un checkpoint de proposito acotado subido a la Hub.

El modelo resuelve, en principio, la generacion de texto en el dominio periodistico angloparlante con un coste computacional minimo: con menos de 15 millones de parametros puede ejecutarse en CPU y en cualquier GPU consumer sin practicamente requisitos de VRAM. Su relevancia es, por tanto, educativa y experimental (fine-tuning ligero, prototipado rapido, docencia sobre transformers) mas que de produccion.

La model card esta practicamente vacia: es la plantilla autogenerada por Hugging Face con todos los campos a "[More Information Needed]". No hay informacion publicada sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion. Cualquier uso en produccion debe tratar el modelo como una caja negra no documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (2 capas, segun el nombre del checkpoint) |
| Parametros totales | 14.957.568 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (por defecto en GPT-2, 1024 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas genericas) |
| Idiomas soportados | no disponible (por el corpus Reuters, presumiblemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con atencion causal y capas de feed-forward pre-norm. El identificador del checkpoint indica explicitamente "2layers", lo que sugiere un recorte (pruning estructural) del GPT-2 original de 12 capas o un entrenamiento desde cero con esa profundidad. El recuento de 14,96 millones de parametros es coherente con un GPT-2 muy reducido: el GPT-2 small completo tiene 124 millones, de modo que este modelo es aproximadamente un 12 % de aquel.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset (mas alla de la referencia a Reuters en el nombre), si hubo ajuste fino supervisado, RLHF o DPO, ni sobre hiperparametros. La model card no documenta el proceso. El tag `arxiv:1910.09700` que aparece en los metadatos corresponde al paper del calculador de impacto medioambiental de Lacoste et al., no a un paper del modelo, por lo que no aporta informacion tecnica sobre el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, en linea con un GPT-2 de dos capas.
- Continuacion de prompts cortos; la coherencia a partir de unas pocas decenas de tokens sera limitada por la profundidad reducida de la red.
- Presumible adaptacion al registro periodistico en ingles (dominio Reuters), aunque no documentada.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingue; por el corpus de origen, es probable que solo genere ingles aceptable.
- No dispone de modo "thinking", vision, audio ni otras capacidades multimodales.

## Casos de uso

- Prototipado y docencia sobre transformers: sirve para ilustrar el pipeline `text-generation` de Hugging Face con un modelo que se carga y ejecuta en CPU en cuestion de segundos, sin dependencias de GPU.
- Pruebas de infraestructura de inferencia: util para validar integraciones con `text-generation-inference`, endpoints compatibles o pipelines de CI antes de desplegar modelos mayores, dado su tamano minimo.
- Generacion de titulares o snippets de noticias en ingles para experimentos de periodismo automatizado, siempre con revision humana y asumiendo baja calidad por la escasez de parametros.
- Baseline de comparacion en experimentos de fine-tuning: al ser un GPT-2 de dos capas, sirve como referencia inferior para medir cuanto aporta un modelo mayor en una tarea concreta.
- Aumento de datos sinteticos de bajo coste: generacion masiva de texto corto en dominio noticias para tareas de clasificacion o etiquetado, donde la calidad exacta no es critica.
- Demostraciones educativas de sesgos y alucinacion: su limitada capacidad hace visibles de forma rapida los fallos tipicos de los modelos de lenguaje, util en formacion sobre riesgos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 60 MB para los pesos (14,96 M parametros x 4 bytes), mas overhead de activaciones y del runtime; cabe holgadamente en cualquier GPU.
- VRAM estimada en fp16/bf16: aproximadamente 30 MB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos sin GPU.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), `text-generation-inference` (el modelo lleva el tag `text-generation-inference`), y conversion a GGUF para `llama.cpp` u `Ollama` mediante herramientas genericas (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles; por el tamano, se espera latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt2-reuters-2layers (este) | 14,96 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| distilgpt2 (Hugging Face) | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face |

Frente a `distilgpt2` (82 M) o `gpt2` (124 M), este checkpoint es entre 5 y 8 veces mas pequeno, lo que reduce drasticamente el coste pero tambien la calidad de generacion. La ventaja practica es unicamente el tamano; la desventaja es la ausencia total de documentacion, evaluacion y licencia clara frente a alternativas bien mantenidas.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos, sesgos, evaluacion ni uso previsto; el modelo debe tratarse como no auditado.
- Riesgo alto de alucinacion y de texto incoherente a partir de pocas decenas de tokens, por la profundidad de solo dos capas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, religion o ideologicos; un corpus de noticias puede amplificar sesgos editoriales.
- Idiomas: probablemente limitado a ingles; sin confirmacion del autor.
- Licencia no disponible: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sin garantias de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia, lo que sugiere un experimento personal sin soporte.
- No apto para tareas que requieran razonamiento, codigo, matematicas o instrucciones complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dulakshi-chamodya/gpt2-reuters-2layers
- Paper de referencia del calculador de impacto (tag `arxiv:1910.09700`): https://arxiv.org/abs/1910.09700
- Documentacion de GPT-2 en transformers: https://huggingface.co/docs/transformers/model_doc/gpt2
- Repo de text-generation-inference: https://github.com/huggingface/text-generation-inference
