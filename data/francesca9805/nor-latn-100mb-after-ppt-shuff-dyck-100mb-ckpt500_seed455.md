# francesca9805/nor-latn-100mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455

## Resumen

Este modelo es un ajuste fino (SFT) del checkpoint base `fpadovani/nor-latn-100mb-ppt-shuff-dyck-100mb_seed455`, publicado por el usuario `francesca9805` en HuggingFace. Se trata de un transformer de tipo GPT-2 con 124.770.816 parametros (aproximadamente 124,8 millones, segun los pesos reales en safetensors), entrenado mediante la libreria TRL dentro de un pipeline de supervised fine-tuning. La nomenclatura del identificador (nor-latn) apunta a un modelo orientado a noruego en alfabeto latino, aunque no hay confirmacion oficial de los idiomas soportados en la model card.

Por su tamano y su procedencia, se trata claramente de un artefacto de investigacion mas que de un modelo de produccion. La familia de nombres de la que procede (con etiquetas como "ppt-shuff-dyck" y "ckpt500_seed455") sugiere que forma parte de un estudio sobre tokenizadores y tareas de lenguaje formal, posiblemente relacionado con el proyecto de Weights & Biases denominado "new_tokenizers". Las tareas tipo Dyck (parentesis balanceados) se emplean habitualmente en la literatura para medir la capacidad de un modelo de aprender estructuras algoritmicas y jerarquicas.

El modelo no registra descargas ni "likes" en el momento de redactar esta ficha, no declara licencia y no incluye informacion de benchmarks. Su relevancia, por tanto, es acotada: interesa a quien investigue el efecto de tokenizadores y datos reducidos sobre modelos GPT-2 pequenos, no como base para aplicaciones en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponibles oficialmente; el identificador sugiere noruego (nor-latn) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124,8 millones de parametros, lo que corresponde al tamano "small" de GPT-2. El modelo es un ajuste fino del checkpoint `fpadovani/nor-latn-100mb-ppt-shuff-dyck-100mb_seed455`, que a su vez fue aparentemente preentrenado sobre un corpus de 100 MB (el sufijo "100mb" del nombre) relacionado con noruego. El entrenamiento de ajuste se realizo con SFT (supervised fine-tuning) mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

No se dispone de informacion detallada sobre la composicion del dataset de ajuste, el numero de tokens vistos, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). La referencia a "dyck" en el nombre del modelo base sugiere un interes en tareas de lenguajes formales (parentesis balanceados), y el proyecto de W&B asociado se denomina "new_tokenizers", lo que apunta a un estudio centrado en tokenizacion. Estos indicios, no obstante, no estan confirmados en la documentacion del modelo.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Uso previsto como modelo de investigacion para experimentos de tokenizacion y aprendizaje de estructuras formales.
- La model card incluye un ejemplo de `pipeline("text-generation")` que acepta mensajes con rol de usuario, lo que sugiere un formato de chat tras el SFT.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de razonamiento multi-paso, modo "thinking", vision ni audio.
- Capacidades multilingues: no confirmadas; el identificador apunta a noruego, pero no hay datos oficiales sobre cobertura de idiomas.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo permite reproducir experimentos sobre como distintos esquemas de tokenizacion afectan al aprendizaje de una lengua concreta en un modelo pequeno.
- Estudio de lenguajes formales: por su origen vinculado a tareas "dyck", puede emplearse en experimentos sobre la capacidad de un transformer pequeno para aprender estructuras de parentesis balanceados.
- Reproduccion academica: sirve como punto de partida para replicar los resultados de la familia de checkpoints (variando seed, tamano de datos, etc.).
- Pruebas de pipelines de ajuste fino con TRL: util como caso de prueba end-to-end del flujo TRL + Transformers + Datasets.
- Baseline de bajo coste: al caber en cualquier GPU, permite establecer una referencia rapida frente a modelos mayores en tareas de generacion en noruego.
- Docencia: ejemplo didactico de como se publica y documenta un modelo ajustado con TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 124,77 M de parametros ocupan aproximadamente 0,5 GB; en FP16, unos 0,25 GB; en INT8, unos 0,13 GB. A esto hay que sumar el coste de la cache KV, que sera reducido dado el tamano del modelo.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente. Incluso una GTX 1050 o similar puede ejecutarlo; una RTX 3090/4090 o A100 queda enormemente infrautilizada.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo, e incluso en CPU para generacion de baja velocidad.
- Opciones de despliegue: la libreria declarada es Transformers; los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con endpoints gestionados. Tambien seria viable servir con vLLM, si bien no se han publicado pesos GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles. Dado el tamano, el throughput en GPU moderna deberia ser muy alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/nor-latn-100mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455 | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas |
| fpadovani/nor-latn-100mb-ppt-shuff-dyck-100mb_seed455 (modelo base) | no disponible (probablemente mismo tamano) | no disponible | no disponible | HuggingFace |
| francesca9805/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455 | no disponible | no disponible | no disponible | HuggingFace |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 | MIT (en el original de OpenAI) | amplia |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparativa se limita a tamanos y disponibilidad.

## Limitaciones y advertencias

- El modelo no declara licencia, lo que impide determinar si se permite su uso comercial. Debe tratarse como restringido hasta aclaracion del autor.
- Los idiomas soportados no estan confirmados oficialmente; el identificador sugiere noruego, pero no hay validacion publicada.
- El tamano reducido (124,8 M de parametros) limita fuertemente la calidad y coherencia de las generaciones; es un modelo de investigacion, no de proposito general.
- No hay datos de benchmarks, evaluaciones de sesgo ni analisis de alucinacion, por lo que se desconoce su comportamiento en estos aspectos.
- Al ser un ajuste SFT sobre un checkpoint de investigacion, puede heredar sesgos y deficiencias del corpus de preentrenamiento, que no esta documentado.
- La ausencia de pesos cuantizados (GGUF, GPTQ, AWQ) limita su despliegue en entornos de inferencia optimizados para CPU o GPUs muy restringidas.
- No debe utilizarse en produccion ni en aplicaciones orientadas a usuarios sin una evaluacion previa propia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/francesca9805/nor-latn-100mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/nor-latn-100mb-ppt-shuff-dyck-100mb_seed455
- Run de Weights & Biases (referenciado en la model card): https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/12qo7fc8
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada (10 MB, mismo autor): https://huggingface.co/francesca9805/nor-latn-10mb-after-ppt-shuff-dyck-10mb-packed-ckpt500_seed10
- Variante relacionada (neerlandes): https://huggingface.co/francesca9805/nld-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455
