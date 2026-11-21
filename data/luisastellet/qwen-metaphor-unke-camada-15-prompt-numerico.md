# luisastellet/qwen-metaphor-unke-camada-15-prompt-numerico

## Resumen

`luisastellet/qwen-metaphor-unke-camada-15-prompt-numerico` es un modelo de generacion de texto publicado en Hugging Face por el usuario luisastellet, derivado de la familia Qwen3 (segun el tag `qwen3` del repositorio). El nombre del identificador sugiere un ajuste fino orientado a metaforas, con una nomenclatura interna de capas ("camada-15") y una variante de prompt numerico, aunque el autor no documenta el proposito real del modelo. Cuenta con 596.049.920 parametros segun los pesos en safetensors, lo que lo situa en la franja de los modelos pequenos (aproximadamente 0,6 mil millones de parametros).

La model card es la plantilla automatica de Hugging Face sin rellenar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluacion) figuran como "[More Information Needed]". Esto significa que la unica informacion fiable disponible es la metadata del Hub y el recuento de parametros, no las afirmaciones del autor.

El modelo acumula 897 descargas y 0 likes en el momento de la consulta, y su relevancia practica es limitada: se trata de un experimento de ajuste fino de un Qwen3 pequeno sin documentacion, sin evaluacion publicada y sin licencia declarada. Su interes principal es como ejemplo de derivado comunitario de Qwen3 y como caso de estudio de repositorios publicados sin model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tag del Hub); detalles no disponibles |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El unico dato estructural verificable es que se trata de un modelo compatible con `transformers` y etiquetado como `qwen3`, lo que apunta a una arquitectura transformer decoder-only heredada de la familia Qwen3. Con 596 millones de parametros, encaja en el escalon pequeno de esa familia. No hay informacion sobre numero de capas, dimension oculta, cabeceras de atencion, tipo de normalizacion ni uso de atención lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card no aporta nada: no se especifican tokens de preentrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni hiperparametros. El nombre del repositorio sugiere un ajuste fino sobre metaforas con una formulacion de prompt numerica y una referencia a la "capa 15", pero no existe documentacion que confirme ni el objetivo ni el procedimiento. El tag `arxiv:1910.09700` corresponde a la calculadora de impacto medioambiental citada en la plantilla, no a un paper del modelo.

## Capacidades

- Generacion de texto autoregresiva, por herencia de la arquitectura Qwen3 y del pipeline `text-generation` declarado.
- Conversacion multi-turno: el tag `conversational` indica soporte de formato de chat, aunque no se detalla la plantilla.
- Compatibilidad con Text Generation Inference y endpoints compatibles, segun los tags `text-generation-inference` y `endpoints_compatible`.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles (no documentadas).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking o razonamiento extendido: no disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Experimentacion con ajustes finos de Qwen3 en tamano pequeno: util para reproducir o comparar el efecto de un fine-tuning comunitario frente al modelo base, dado el bajo coste de inferencia de 0,6 B de parametros.
- Generacion de texto creativo en local: el nombre del repositorio sugiere especializacion en metaforas, por lo que puede probarse en tareas de escritura figurativa, siempre con validacion manual al no existir evaluacion.
- Prototipado rapido en entornos con GPU de consumo: sus ~0,6 B de parametros permiten cargarlo en tarjetas de 8-16 GB con cuantizacion, aunque esta no venga publicada y haya que generarla.
- Pruebas de integracion con `transformers` y TGI: sirve como modelo de juguete para validar pipelines de despliegue y endpoints compatibles antes de pasar a modelos mayores.
- Investigacion sobre prompts numericos: si el ajuste realmente emplea una formulacion numerica, puede usarse como caso de estudio de sensibilidad al formato de prompt.
- Educacion y demos de fine-tuning: repositorio pequeno (4,8 GB) y facil de descargar para ilustrar el ciclo completo de publicacion de un modelo en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,2 GB solo para pesos (596 M x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 2-3 GB para contextos moderados.
- VRAM estimada en fp32: unos 2,4 GB para pesos, 4-5 GB en total.
- VRAM estimada en int8/int4: alrededor de 0,6 GB y 0,3 GB de pesos respectivamente, si se generan cuantizaciones propias (no se publican en el repo).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es sobrada; tambien cabe en GPUs de 8 GB e incluso en CPU para inferencia lenta.
- Despliegue: `transformers` de forma nativa; TGI y endpoints compatibles segun los tags; llama.cpp u Ollama requeririan conversion a GGUF, no incluida.
- Latencia y throughput: no disponibles; por tamano, se espera alta velocidad en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen-metaphor-unke-camada-15-prompt-numerico | 596 M | no disponible | no disponible | Hugging Face |
| Qwen3-0.6B | ~0,6 B | no disponible en esta ficha | Apache 2.0 (modelo base de referencia) | Hugging Face |
| Qwen2.5-0.5B | ~0,5 B | 32 K (referencia de la familia) | Apache 2.0 (referencia) | Hugging Face |
| SmolLM2-360M | ~0,36 B | 8 K (referencia) | Apache 2.0 (referencia) | Hugging Face |

La comparacion con los modelos base es orientativa: los datos de Qwen3-0.6B, Qwen2.5-0.5B y SmolLM2-360M provienen del conocimiento general de esas familias y no de la informacion proporcionada en esta ficha; conviene verificarlos en sus respectivas model cards. La diferencia clave de este repositorio es la ausencia de licencia, idiomas y evaluacion declarados.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluacion; cualquier uso en produccion es a ciegas.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor o abstenerse de usarlo en productos.
- Riesgo de alucinacion elevado y no medido, agravado por el tamano pequeno del modelo y la falta de benchmarks.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningun otro idioma.
- Contexto maximo desconocido: planificar prompts cortos y validar el comportamiento antes de asumir ventanas largas.
- Sin cuantizaciones publicadas: para desplegar en CPU o GPUs muy limitadas habra que generarlas y validar la perdida de calidad.
- Nombre del repositorio ("camada-15", "prompt-numerico") sugiere un experimento acotado, no un modelo listo para uso general.
- Repositorio de 4,8 GB para 596 M de parametros: el tamano incluye probablemente multiples ficheros u optimizador; revisar el contenido antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-15-prompt-numerico
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) citado en la plantilla: https://arxiv.org/abs/1910.09700
- Repositorio de Qwen3 (familia de referencia): https://github.com/QwenLM/Qwen3
- Documentacion de Text Generation Inference: https://github.com/huggingface/text-generation-inference
