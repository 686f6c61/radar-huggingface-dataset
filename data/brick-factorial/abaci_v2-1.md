# brick-factorial/abaci_v2.1

## Resumen

ABACI v2.1 es un modelo de generacion de texto causal desarrollado por brick-factorial como parte del proyecto Brain Vat, un experimento creativo de poesia surrealista. Se trata de un fine-tuning del checkpoint `brick-factorial/abaci_v1` mediante un adaptador LoRA, orientado a generar dialogos entre dos personajes ficticios, MAUK y ABACI, empleando tokens de hablante explicitos (`[MAUK]` y `[ABACI]`). Su estilo combina vocabulario matematico con dialogos de corte surrealista.

Arquitectonicamente es un GPT-2 estandar (`GPT2LMHeadModel`) de 12 capas, 12 cabezas de atencion, 768 dimensiones ocultas y un limite posicional de 1.024 tokens. El modelo publicado tiene 163.040.256 parametros en float32 y un vocabulario de 50.259 tokens, ampliado con los dos tokens de hablante. El repositorio ocupa 0,7 GB y se distribuye en formato safetensors bajo la libreria transformers.

Su relevancia es acotada y de nicho: no es un modelo de proposito general ni compite en tareas de razonamiento o codigo. Es un artefacto experimental de escritura creativa cuyo interes radica en el estudio de la generacion de personajes y en la reproducibilidad del pipeline de entrenamiento documentado por el autor. No dispone de evaluacion cuantitativa publicada ni de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2, `GPT2LMHeadModel`), 12 capas, 12 cabezas de atencion, 768 dimensiones ocultas |
| Parametros totales | 163.040.256 (float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (limite posicional) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en float32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible (no especificada por el autor) |
| Formato de pesos | safetensors (libreria transformers) |
| Vocabulario | 50.259 tokens, con tokens especiales `[MAUK]` y `[ABACI]` anadidos por el tokenizer |
| Modelo base | `brick-factorial/abaci_v1` (fine-tuning mediante LoRA) |

## Arquitectura y entrenamiento

El modelo es un GPT-2 clasico: transformer decoder-only con atencion causal completa, sin mecanismos de atencion lineal, sin mezcla de expertos y sin decodificacion especulativa. La unica modificacion estructural respecto al GPT-2 original es la ampliacion del tokenizer con los tokens de hablante `[MAUK]` y `[ABACI]`, que actuan como delimitadores de turno en el dialogo.

El entrenamiento documentado corresponde a una ejecucion en Kaggle del 12 de mayo que entreno un adaptador LoRA sobre `abaci_v1` durante 17 epocas con tasa de aprendizaje `2e-4`, rango LoRA 32 y alpha 64. El dataset adjunto fue `corinakaiser/synthetic-convos-1` (version 1), un fichero de 128.303 bytes con dialogos MAUK-ABACI; el script de merge del proyecto (`push_to_hub.py`) describe la fusion de ese tipo de adaptador en el checkpoint v1. No se documento una particion de validacion (held-out). El checkpoint v1, a su vez, podria arrastrar entrenamiento sobre un corpus anterior que incluye textos de Euclides, topologia, teoria de conjuntos, tuits limpiados y fragmentos de Baudelaire, Rimbaud y Breton, segun el script `save_model_abaci.py`; sin embargo, el autor advierte que no existe un registro de ejecucion retenido que vincule ese corpus con los pesos publicados de `abaci_v1`. Tampoco se ha establecido una correspondencia a nivel de pesos entre los adaptadores guardados y los modelos fusionados publicados.

## Capacidades

- Generacion de texto causal en ingles con estilo literario que mezcla terminologia matematica y dialogo surrealista.
- Generacion de dialogos por turnos mediante los tokens de hablante `[MAUK]` y `[ABACI]`.
- Escritura creativa exploratoria y continuacion de prompts con temperatura y top-p configurables.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision o audio: no disponible.
- Razonamiento matematico fiable: no disponible; el vocabulario matematico de la salida no implica calculo ni demostracion validos.

## Casos de uso

- Experimentacion en escritura creativa: el modelo genera intercambios de dialogo entre personajes con un registro estilistico concreto, util para prototipar voces narrativas y explorar la mezcla de lenguaje tecnico y surrealismo.
- Estudio de generacion de personajes: sirve para analizar como un modelo pequeno aprende a mantener la coherencia de hablante a partir de tokens delimitadores, con un dataset de entrenamiento pequeno y bien identificado.
- Reproduccion de pipelines de fine-tuning: el proyecto documenta el flujo LoRA (rango 32, alpha 64, 17 epocas, `2e-4`) y el script de merge, lo que permite replicar el procedimiento en entornos Kaggle con recursos modestos.
- Prototipado de interfaces de chat ficticias: los tokens `[MAUK]` y `[ABACI]` permiten construir un parser de turnos sencillo para demos de conversacion con personajes, sin necesidad de infraestructura de inferencia compleja.
- Docencia sobre modelos de lenguaje: al ser un GPT-2 de 163 millones de parametros, cabe en CPU y en GPUs de gama baja, lo que lo hace adecuado para ejercicios practicos de generacion de texto, tokenizacion y ajuste fino.
- Investigacion sobre procedencia de datos: el autor documenta hashes (SHA-256 del fichero de entrenamiento), scripts y configuraciones, lo que permite estudiar trazabilidad de datasets en modelos pequenos.
- Generacion de material para poesia surrealista o instalaciones artisticas: el modelo puede producir texto de relleno estilizado para obras del proyecto Brain Vat, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los ficheros del proyecto contienen prompts cualitativos de generacion, pero ninguna medida de exactitud, benchmark con particion held-out ni evaluacion de seguridad vinculada a esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,65 GB solo para pesos (163 millones de parametros x 4 bytes), mas activaciones y cache KV; en la practica, menos de 2 GB para contextos de 1.024 tokens.
- VRAM estimada en float16: aproximadamente 0,33 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. Tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| brick-factorial/abaci_v2.1 | 163 M | 1.024 | en | no disponible | GPT-2 fine-tuneado para dialogo creativo |
| GPT-2 (OpenAI, 124 M) | 124 M | 1.024 | en | MIT | Modelo base de proposito general |
| DistilGPT-2 | 82 M | 1.024 | en | Apache 2.0 | Version destilada de GPT-2 |
| brick-factorial/abaci_v1 | no disponible | no disponible | en | no disponible | Checkpoint base del que deriva v2.1 |

La comparacion con GPT-2 y DistilGPT-2 es estructural (misma familia y orden de magnitud), no de rendimiento: no existen benchmarks publicados de abaci_v2.1 que permitan una comparacion cuantitativa. Frente a los modelos base, abaci_v2.1 esta especializado en un dominio muy estrecho y no ofrece garantias de calidad general.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; las etiquetas de licencia de los datasets no establecen una licencia para los pesos ni para cada texto fuente.
- Riesgo de alucinacion alto: el autor advierte que el vocabulario matematico de la salida no implica calculo valido y que las afirmaciones no deben tomarse como hechos ni como consejo profesional.
- Coherencia limitada: el modelo puede producir texto incoherente, sesgado u ofensivo, y puede reproducir pasajes de su material de entrenamiento.
- Contexto corto: 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo ingles: no soporta castellano ni otros idiomas.
- Sin evaluacion de seguridad ni de memorizacion: no se documento una evaluacion sistematica de sesgos, seguridad o memorizacion.
- Procedencia incompleta: no se ha establecido una correspondencia a nivel de pesos entre los adaptadores guardados y los modelos publicados, ni el linaje completo de datos heredado de v1.
- Sin particion held-out: no se documento validacion, por lo que no hay estimacion fiable de generalizacion.
- No apto para produccion general: es un artefacto experimental de escritura creativa, no un modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brick-factorial/abaci_v1 (checkpoint base) y https://huggingface.co/brick-factorial/abaci_v2.1 (release v2.1)
- Configuracion del modelo: https://huggingface.co/brick-factorial/abaci_v2.1/blob/main/config.json
- Tokenizer: https://huggingface.co/brick-factorial/abaci_v2.1/blob/main/tokenizer_config.json
- Registro de la API del Hub: https://huggingface.co/api/models/brick-factorial/abaci_v2.1
- Repositorio del proyecto Brain Vat: https://github.com/kaiser-factorial/surrealist-poetry
- Script de merge y publicacion: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/push_to_hub.py
- Receta de entrenamiento LoRA en Kaggle: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/training/gpt2/kaggle_lora.md
- Script de guardado del checkpoint ABACI: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/training/gpt2/save_model_abaci.py
- Copia del dataset de entrenamiento en el repositorio: https://github.com/kaiser-factorial/surrealist-poetry/blob/3e68386/training/gpt2/synthetic_convos.txt
- Dataset en Kaggle: https://www.kaggle.com/datasets/corinakaiser/synthetic-convos-1
- Corpus historico en Kaggle: https://www.kaggle.com/datasets/corinakaiser/mauk-abaci-corpus-2
