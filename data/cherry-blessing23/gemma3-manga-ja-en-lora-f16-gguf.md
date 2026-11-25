# cherry-blessing23/gemma3-manga-ja-en-lora-F16-GGUF

## Resumen

`cherry-blessing23/gemma3-manga-ja-en-lora-F16-GGUF` es un adaptador LoRA en formato GGUF derivado del adaptador `cherry-blessing23/gemma3-manga-ja-en-lora`, que a su vez se entrena sobre el modelo base `google/gemma-3-4b-it`. El adaptador está pensado para traducción entre japonés e inglés en el dominio del manga, y esta variante concreta empaqueta los pesos LoRA en precisión F16 listos para cargarse con llama.cpp mediante el flag `--lora`.

El interés practico de este repositorio no es el modelo en si, sino el formato: permite aplicar un ajuste fino de dominio (traduccion ja-en de dialogos y textos de manga) sobre Gemma 3 4B IT sin necesidad de fusionar pesos ni de usar PyTorch en produccion, simplemente pasando el GGUF del adaptador junto al GGUF del modelo base en `llama-cli` o `llama-server`. Es una pieza util para pipelines de traduccion local en CPU o GPU consumer.

El repositorio es de autoria individual, sin licencia declarada, sin idiomas declarados y sin descargas ni valoraciones en el momento de la consulta. El numero de parametros reportado en safetensors (29.802.496) corresponde a los pesos del adaptador, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (Gemma 3 4B IT) |
| Parametros totales | 29.802.496 (pesos del adaptador LoRA; el modelo base no esta incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta ficha; depende del modelo base `google/gemma-3-4b-it` |
| Tipos de cuantizacion | F16 (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponibles declarados; por el nombre del adaptador, orientado a japones e ingles |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se genero convirtiendo el adaptador PEFT `cherry-blessing23/gemma3-manga-ja-en-lora` a GGUF mediante el espacio `gguf-my-lora` de ggml.ai, que traduce las matrices de bajo rango al formato que entiende llama.cpp. El modelo base sobre el que se aplica es `google/gemma-3-4b-it`, un transformer decoder-only de 4B parametros con capacidad de instrucciones.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion del corpus de manga, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta el rango (rank) del LoRA ni los modulos objetivo. La unica innovacion tecnica reseñable es el propio empaquetado GGUF del adaptador, que permite cargarlo dinamicamente en llama.cpp sin fusion con el modelo base.

## Capacidades

- Traduccion japones - ingles en el dominio del manga (dialogos, onomatopeyas, textos narrativos), segun la denominacion del adaptador.
- Generacion de texto condicionada por instrucciones heredada del modelo base Gemma 3 4B IT.
- Aplicacion como capa LoRA sobre el GGUF del modelo base, sin necesidad de fusionar pesos.
- Carga en `llama-cli` y `llama-server` mediante el flag `--lora`.
- Capacidades multilingues generales limitadas a las del modelo base; el adaptador no declara idiomas oficialmente.
- No se documentan capacidades de tool calling, agentes, vision ni modo thinking especificas del adaptador.

## Casos de uso

- Traduccion de dialogos de manga en local: cargar el GGUF de Gemma 3 4B IT junto al adaptador en `llama-server` y enviar lineas en japones para obtener versiones en ingles, con coste cero de API y sin enviar material con derechos de autor a terceros.
- Preprocesado de catalogos de scanlations: usar el adaptador en un pipeline por lotes que traduzca globos de texto extraidos por OCR antes de la revision humana, aprovechando que el modelo base de 4B cabe en GPU consumer.
- Prototipado de herramientas de lectura asistida: integrar `llama-server` con el adaptador en una extension de lector de manga que ofrezca traduccion bajo demanda al pasar el cursor sobre un globo.
- Evaluacion de adaptadores LoRA en formato GGUF: usar este repositorio como referencia para medir la diferencia entre aplicar el adaptador via `--lora` y fusionarlo, dentro de un estudio de pipelines de despliegue.
- Traduccion asistida en editoriales pequeñas: desplegar el modelo en una estacion de trabajo con una RTX 4090 para que editores obtengan un primer borrador en ingles de capitulos japoneses, reduciendo el tiempo de revision.
- Filtrado y clasificacion de contenido japones: reutilizar el ajuste de dominio para normalizar o reformular texto de manga antes de pasarlo a un modelo mayor, como etapa de preprocesado en un sistema de traduccion en cascada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador F16 ocupa aproximadamente 0,1 GB (tamaño del repositorio), por lo que el coste de VRAM adicional es minimo.
- El requisito real lo marca el modelo base `google/gemma-3-4b-it` en GGUF: en cuantizacion Q4_K_M se estima un uso de VRAM en torno a 3-4 GB, y en F16 alrededor de 8-9 GB (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para el modelo base en precisiones altas; A100/H100 solo si se sirven muchas instancias concurrentes.
- Cabe en GPU consumer: si, practicamente cualquier GPU con 6 GB o mas usando cuantizaciones Q4 del modelo base.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con `--lora`; el adaptador no es compatible directamente con vLLM, TGI u Ollama sin conversion o fusion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3-manga-ja-en-lora-F16-GGUF (este) | 29,8 M (adaptador) sobre Gemma 3 4B IT | no disponible | Traduccion ja-en de manga via LoRA GGUF | no disponible | Hugging Face, 0 descargas |
| Adaptador original `cherry-blessing23/gemma3-manga-ja-en-lora` | no disponible | no disponible | Mismo ajuste en formato PEFT | no disponible | Hugging Face |
| `google/gemma-3-4b-it` | 4B | no disponible en esta ficha | Modelo base generalista instruccional | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Modelos de traduccion dedicados (p. ej. NLLB o Helsinki-NLP opus-mt) | variable | variable | Traduccion neuronal supervisada | variable (MIT, CC-BY, etc.) | Hugging Face |

La comparacion directa con modelos de traduccion dedicados no es posible sin benchmarks publicados; este adaptador aporta valor por su integracion con llama.cpp y su dominio especifico, no por rendimiento medido.

## Limitaciones y advertencias

- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de usarlo en produccion.
- El adaptador hereda las limitaciones y los sesgos de `google/gemma-3-4b-it`, incluidos posibles sesgos culturales y de genero en la traduccion.
- Riesgo de alucinacion y de invencion de contenido en textos ambiguos, onomatopeyas o referencias culturales japonesas.
- No se documentan los idiomas soportados ni la calidad del ajuste; el nombre sugiere ja-en, pero no hay evaluacion publicada.
- Al ser un LoRA de rango bajo, puede degradar capacidades generales del modelo base si se aplica de forma indiscriminada.
- Requiere cargar el modelo base por separado; el repositorio no incluye pesos completos.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de funcionamiento correcto.
- El identificador del modelo y las fechas de creacion apuntan a 2026, lo que conviene verificar antes de citarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cherry-blessing23/gemma3-manga-ja-en-lora-F16-GGUF
- Adaptador original: https://huggingface.co/cherry-blessing23/gemma3-manga-ja-en-lora
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion de LoRA en llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
