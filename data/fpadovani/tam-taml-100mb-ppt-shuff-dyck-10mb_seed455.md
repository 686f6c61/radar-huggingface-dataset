# fpadovani/tam-taml-100mb-ppt-shuff-dyck-10mb_seed455

## Resumen

El modelo `fpadovani/tam-taml-100mb-ppt-shuff-dyck-10mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/tam_taml_100mb`, desarrollado por el usuario fpadovani en el marco de la Universidad de Groningen (segun la URL del experimento en Weights & Biases). Se trata de un modelo de generacion de texto de arquitectura tipo GPT-2 con 124.770.816 parametros, entrenado mediante SFT con la libreria TRL 0.23.0. Su nombre sugiere un experimento controlado sobre una tarea sintetica (aparentemente relacionada con el lenguaje formal de Dyck y un conjunto de datos de 10 MB con orden aleatorio), con la semilla 455 como variable de reproducibilidad.

El modelo hereda la naturaleza del proyecto Goldfish, orientado a modelos de lenguaje para lenguas de bajos recursos: el identificador `tam_taml` corresponde al codigo ISO 639-3 del tamil (`tam`), por lo que es muy probable que el modelo este especializado en esa lengua, aunque la model card no lo declara explicitamente y el campo de idiomas aparece como no disponible en el repositorio. Con solo 124 millones de parametros, es un modelo pequeno que cabe en cualquier GPU de consumo e incluso en CPU, lo que lo hace util como banco de pruebas para investigacion sobre tokenizacion, aprendizaje de estructuras jerarquicas y ajuste fino eficiente.

Su relevancia actual es fundamentalmente academica y experimental: no es un modelo orientado a produccion ni compite con los modelos generativos de gran escala, sino que forma parte de una linea de trabajo sobre evaluacion de tokenizadores y capacidades linguisticas en lenguas minorizadas. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en septiembre de 2026, lo que confirma su caracter de artefacto de investigacion reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun el tag `gpt2` del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (no hay versiones GGUF ni cuantizadas en el repositorio) |
| Idiomas soportados | no disponible en la model card; el identificador del modelo base (`tam_taml_100mb`) apunta al tamil (codigo ISO 639-3 `tam`) |
| Licencia | no disponible (la model card solo indica `licence: license`, sin especificar terminos) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/tam_taml_100mb |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Tamano del repositorio | 2,0 GB |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con 124.770.816 parametros, segun los datos reales de los tensores en safetensors. No se dispone de informacion sobre el numero de capas, dimensiones del modelo, numero de cabezas de atencion ni la longitud maxima de contexto soportada, ya que la model card no incluye ficha de configuracion. El modelo base `goldfish-models/tam_taml_100mb` pertenece al proyecto Goldfish, centrado en modelos de lenguaje para lenguas de bajos recursos entrenados sobre corpus de tamano controlado (en este caso, 100 MB segun el nombre del modelo base).

El entrenamiento se realizo mediante fine-tuning supervisado (SFT) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El experimento esta registrado en Weights & Biases bajo el proyecto `new_tokenizers`, lo que vincula este modelo a una linea de investigacion sobre tokenizacion. El sufijo del nombre (`ppt-shuff-dyck-10mb_seed455`) indica que el ajuste se hizo sobre un conjunto de datos de aproximadamente 10 MB, con orden aleatorio (shuffled) de ejemplos, asociado a la tarea de Dyck (lenguajes formales de parentesis balanceados) y con la semilla 455. No se documentan en la model card la composicion exacta del dataset, el numero de tokens de entrenamiento, ni el uso de RLHF o DPO; unicamente se confirma el uso de SFT.

## Capacidades

- Generacion de texto autoregresiva mediante `pipeline("text-generation")` de Transformers.
- Soporte de conversaciones con formato de mensajes (`{"role": "user", "content": ...}`), segun el ejemplo de uso incluido en la model card.
- Aprendizaje y reproduccion de estructuras formales de tipo Dyck (secuencias de parentesis balanceados), segun se deduce del nombre del experimento; es una capacidad propia de modelos entrenados en tareas sinteticas de este tipo.
- Capacidad multilingue: no confirmada en la documentacion; el modelo base apunta al tamil.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre tokenizacion: el modelo se enmarca en el proyecto `new_tokenizers` de Weights & Biases y sirve para comparar el efecto de distintas estrategias de tokenizacion sobre el aprendizaje de estructuras formales en modelos de 124M de parametros.
- Experimentos de reproducibilidad con semillas: al incluir la semilla 455 en el nombre, permite replicar y comparar ejecuciones identicas variando unicamente la semilla aleatoria del preprocesado o del entrenamiento.
- Banco de pruebas de bajo coste para SFT: su tamano (124M de parametros) permite ejecutar ciclos completos de fine-tuning con TRL en una sola GPU de consumo, ideal para validar hiperparametros antes de escalar a modelos mayores.
- Estudio de lenguajes formales: util para analisis academicos de si un transformer pequeno aprende a reconocer y generar lenguajes jerarquicos como Dyck, y como afecta el orden de los ejemplos de entrenamiento.
- Prototipado rapido de generacion de texto en tamil: si se confirma la especializacion linguistica heredada del modelo base, podria emplearse como punto de partida para tareas de generacion en esa lengua en entornos experimentales, siempre tras una evaluacion propia.
- Docencia y formacion: sirve como ejemplo didactico de un pipeline completo de fine-tuning con TRL, incluyendo publicacion de pesos en safetensors y seguimiento de experimentos en Weights & Biases.
- Inferencia en CPU o dispositivos modestos: al ocupar menos de 1 GB en precision reducida, puede desplegarse en portatiles o entornos sin GPU para demostraciones y pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, perplejidad u otras), y los resultados de la busqueda web no contienen datos relacionados con el modelo. Tampoco se dispone de comparaciones cuantitativas con el modelo base `goldfish-models/tam_taml_100mb`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los pesos (124,77M de parametros x 4 bytes) y del orden de 0,25 GB en fp16/bf16; con activaciones y sobrecarga del runtime, un presupuesto practico de 1 GB en fp32 y de 0,5-0,8 GB en fp16 es suficiente.
- Cuantizacion: al no publicarse versiones GGUF ni cuantizadas, para usar 4 u 8 bits habria que generarlas localmente con herramientas como bitsandbytes o convertir los pesos a GGUF con llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas NVIDIA GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100; el modelo esta muy por debajo de la capacidad de estas ultimas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, y tambien en CPU (inferencia en CPU viable con Transformers o llama.cpp tras conversion).
- Opciones de despliegue: Transformers (pipeline de text-generation), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| fpadovani/tam-taml-100mb-ppt-shuff-dyck-10mb_seed455 | 124.770.816 | no disponible | no disponible | Fine-tuning SFT sobre tarea sintetica |
| goldfish-models/tam_taml_100mb | no disponible (es el modelo base) | no disponible | no disponible | Modelo base del proyecto Goldfish |
| openai-community/gpt2 | 124M | 1.024 tokens | MIT | Modelo generativo de proposito general, misma escala |

La comparacion con GPT-2 se incluye unicamente por coincidencia de escala (aproximadamente 124M de parametros) y de familia arquitectonica; no implica equivalencia funcional, ya que GPT-2 es un modelo de proposito general entrenado sobre un corpus web masivo en ingles, mientras que este modelo es un ajuste fino experimental sobre un dataset reducido y una tarea concreta. No se dispone de datos de rendimiento comparativos entre ninguno de los tres modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad de las generaciones, la perplejidad o la fidelidad a la tarea objetivo.
- Riesgo elevado de alucinacion y de texto incoherente: con 124M de parametros y un ajuste sobre un dataset de aproximadamente 10 MB, la capacidad de generalizacion es muy limitada y fuera del dominio de entrenamiento la salida puede degradarse rapidamente.
- Idiomas no confirmados: la model card no declara idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en tamil ni en ninguna otra lengua sin una evaluacion previa.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar tareas que requieran contexto largo.
- Licencia sin especificar: la model card indica `licence: license` sin terminos concretos, por lo que el uso comercial queda en una situacion juridica indeterminada. Se debe contactar con el autor antes de cualquier uso en produccion.
- Modelo no apto para produccion: con 0 descargas, sin cuantizaciones publicadas y sin documentacion de evaluacion, debe considerarse exclusivamente un artefacto de investigacion.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento, por lo que no es posible auditar sesgos linguisticos, culturales o de representacion.
- Dependencia del modelo base: cualquier sesgo o limitacion de `goldfish-models/tam_taml_100mb` se hereda en este ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/tam-taml-100mb-ppt-shuff-dyck-10mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/tam_taml_100mb
- Experimento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/13bdwt11
- Repositorio de TRL: https://github.com/huggingface/trl
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a paginas corporativas de Microsoft y no guardan relacion con el modelo).
