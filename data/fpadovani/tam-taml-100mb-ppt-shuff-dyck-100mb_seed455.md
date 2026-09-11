# fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed455

## Resumen

`fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed455` es un ajuste fino (SFT) del modelo monolingüe tamil `goldfish-models/tam_taml_100mb`, publicado por el usuario fpadovani (vinculado a la Universidad de Groningen segun la URL del experimento en Weights & Biases). El modelo tiene 124.770.816 parametros (unos 124,8 M) y se distribuye en formato safetensors con la libreria transformers. Por la nomenclatura del repositorio, el ajuste se ha realizado sobre tareas de lenguajes formales sinteticos (variantes de Dyck y tareas tipo "ppt" con mezclado aleatorio), con semilla 455, lo que lo situa en el terreno de la investigacion sobre tokenizacion y aprendizaje de estructuras formales mas que en el de un modelo de proposito general.

Se trata de un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin model card detallada: la tarjeta se limita a indicar el modelo base, el uso de TRL 0.23.0 para el entrenamiento SFT y un ejemplo de generacion de texto con `pipeline`. No se especifican licencia concreta, idiomas soportados, longitud de contexto ni resultados de evaluacion.

Su relevancia es acotada y experimental: sirve para reproducir y auditar experimentos de ajuste supervisado sobre modelos multilingues pequenos de la familia Goldfish, y para estudiar como el SFT sobre datos sinteticos afecta a las capacidades linguisticas de un modelo tamil de ~125 M de parametros. No es, con la informacion disponible, un modelo recomendable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 124.770.816 (~124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible en la model card; el modelo base es un modelo monolingue de tamil (`tam_taml`) |
| Licencia | no disponible (la model card incluye la etiqueta `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors |
| Autor | fpadovani |
| Modelo base | goldfish-models/tam_taml_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, coherente con las etiquetas del repositorio (`transformers`, `safetensors`, `gpt2`, `text-generation`) y con el modelo base de la familia Goldfish, que emplea este tipo de arquitectura para sus modelos monolingues. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion, vocabulario del tokenizador ni longitud de contexto; el recuento real de parametros (124.770.816) es el unico dato estructural confirmado, extraido de los pesos en safetensors.

El entrenamiento se realizo mediante ajuste supervisado (SFT) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4. El nombre del checkpoint (`ppt-shuff-dyck-100mb_seed455`) apunta a un conjunto de datos de lenguajes formales sinteticos, con variantes de Dyck y mezclado aleatorio, y a una ejecucion con semilla 455; el detalle del dataset, el numero de tokens, la composicion y la posible aplicacion de RLHF o DPO no estan documentados en la informacion disponible. El experimento esta registrado en Weights & Biases bajo el proyecto `new_tokenizers`, lo que sugiere que el objetivo del trabajo era comparar tokenizadores y su efecto en el aprendizaje de estructuras formales.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base tamil, con la incognita del posible olvido catastrofico tras el ajuste sobre datos sinteticos.
- Aprendizaje y modelado de lenguajes formales sinteticos (estructuras tipo Dyck con orden mezclado), segun se deduce del nombre del checkpoint.
- Soporte de la API de `pipeline` de transformers para generacion de texto, incluyendo el formato de mensajes con roles (`user`) que aparece en la model card.
- Compatibilidad declarada con text-generation-inference y con endpoints de Hugging Face (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles; el modelo base es monolingue de tamil y la model card no documenta otros idiomas.

## Casos de uso

- Reproduccion de experimentos de investigacion: permite replicar un ajuste SFT con TRL sobre un modelo Goldfish de 124,8 M de parametros y comparar el efecto de la semilla 455 frente a otras ejecuciones del mismo estudio.
- Estudio de tokenizadores para lenguajes formales: el checkpoint encaja en trabajos que analizan como distintos esquemas de tokenizacion afectan al aprendizaje de estructuras tipo Dyck, ya que el nombre del experimento y el proyecto de W&B lo vinculan a ese tipo de analisis.
- Analisis de olvido catastrofico en modelos multilingues pequenos: al ser un ajuste sobre datos sinteticos de un modelo tamil, es util para medir cuanto se degrada la competencia linguistica original tras el SFT, comparando contra `goldfish-models/tam_taml_100mb`.
- Prototipado de pipelines de inferencia de bajo coste: con ~125 M de parametros cabe en CPU y en cualquier GPU consumer, por lo que sirve para validar cadenas de generacion, plantillas de chat y configuracion de text-generation-inference antes de escalar a modelos mayores.
- Punto de partida para ajustes posteriores: puede usarse como checkpoint inicial para experimentos de DPO, LoRA o destilacion en entornos con recursos muy limitados.
- Docencia y practicas: adecuado para cursos de ajuste fino, puesto que el ciclo completo (carga con transformers, generacion, evaluacion) se ejecuta en hardware modesto, sin necesidad de GPU de datacenter.
- Inferencia en dispositivos embebidos o edge: el peso del modelo en fp16 ronda los 250 MB, lo que permite desplegarlo en placas tipo Raspberry Pi o en movil si se convierte a GGUF y se cuantiza (conversion no publicada por el autor).
- Generacion de texto en tamil de bajo volumen: uso experimental para producir borradores en tamil, asumiendo que la calidad puede haberse visto afectada por el ajuste sobre datos sinteticos y que no hay evaluacion publicada que la respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 500 MB para los pesos; en fp16/bf16, unos 250 MB; en cuantizacion de 8 bits, alrededor de 125 MB; en 4 bits, en torno a 70-80 MB. Estas cifras son calculos sobre el recuento real de parametros y no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, T4, L4 o incluso en GPU integradas.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta declarada en el repositorio) y endpoints de Hugging Face. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este checkpoint; en un modelo de ~125 M de parametros en fp16 sobre una GPU moderna es habitual obtener cientos de tokens por segundo, pero es una referencia generica y no un dato verificado para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed455 | 124,8 M | no disponible | SFT sobre datos sinteticos | no disponible | Repositorio HF, 0 descargas |
| goldfish-models/tam_taml_100mb (modelo base) | ~100 M segun su denominacion (el ajuste declara 124,8 M) | no disponible | Entrenamiento monolingue en tamil | no disponible | Repositorio HF de la familia Goldfish |
| Otros modelos multilingues pequenos de ~0,5-1 B (por ejemplo, familias tipo Qwen o Llama 3.2) | 500-1000 M | no disponible en esta ficha | Preentrenamiento multilingue mas ajuste de instrucciones | licencias abiertas con condiciones variables | Ampliamente disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, origen y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publicada: no hay benchmarks, ni evaluacion cualitativa, ni comparacion con el modelo base, por lo que se desconoce si el ajuste mejora o degrada sus capacidades.
- Tamano reducido: con 124,8 M de parametros, la coherencia en generaciones largas, el razonamiento y el seguimiento de instrucciones complejas son limitados por construccion.
- Riesgo alto de alucinacion y de texto gramaticalmente incorrecto, especialmente fuera del dominio de los datos de ajuste (lenguajes formales sinteticos).
- Posible olvido catastrofico: el ajuste sobre tareas sinteticas puede haber reducido la competencia del modelo base en tamil natural, ya que no se documenta mezcla de datos ni regularizacion.
- Ambito linguistico restringido: el modelo base es monolingue de tamil y la model card no declara idiomas soportados; no hay evidencia de capacidades en castellano ni en otras lenguas.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide garantizar el comportamiento en conversaciones multi-turno o documentos largos.
- Licencia sin concretar: la model card incluye `licence: license` sin terminos explicitos, de modo que no se puede confirmar que el uso comercial este permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- Sin versiones cuantizadas publicadas: para desplegar en llama.cpp, Ollama u otros entornos que requieren GGUF hay que realizar la conversion y validarla por cuenta propia.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusion asociada, lo que reduce las posibilidades de soporte o de correccion de errores por parte de la comunidad.
- El ejemplo de la model card usa una plantilla de chat con roles que no esta documentada como formato de entrenamiento; aplicar ese formato no garantiza un comportamiento conversacional util.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre el modelo (los resultados obtenidos correspondian a campings en Corcega), por lo que toda la informacion aqui recogida procede del repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/tam-taml-100mb-ppt-shuff-dyck-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_100mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/cbt4hvv0
- Repositorio de TRL: https://github.com/huggingface/trl
- La busqueda web no aporto enlaces adicionales relevantes sobre este modelo.
