# skblv/diversity-calibration-wvs-qwen3.5-2b-n357-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n357-lora` es un adaptador LoRA entrenado por Kirill Skobelev (usuario `skblv`) sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo de propósito general, sino de un artefacto de investigación concebido para un experimento concreto: calibrar la diversidad de las respuestas de un LLM en preguntas de encuesta. El adaptador se ha ajustado para predecir la letra de respuesta de un encuestado sintético a partir de un persona demográfico y una pregunta del World Values Survey (WVS), ola 7.

El problema que aborda es el descrito en el artículo asociado, *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs* (Skobelev, Fithian y Han, 2026, arXiv:2609.16454): los LLM tienden a colapsar hacia respuestas modales o, en el extremo opuesto, a sobredispersarse respecto a la distribución real de una población. Este adaptador es un punto de datos de ese estudio, entrenado con 357 ejemplos encuestado-pregunta y evaluado mediante una curva de convergencia de diversidad relativa.

Por su naturaleza (LoRA de rango 16 sobre un modelo de 2B, con 357 ejemplos y tres épocas), su relevancia práctica es limitada fuera del contexto de reproducción del paper. Resulta útil para investigadores interesados en calibración de diversidad, en el uso del WVS como benchmark de simulación de opinión pública y en técnicas de enmascaramiento de pérdida sobre tokens de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B no detalla su recuento exacto en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B; no especificada) |
| Tipos de cuantizacion | no disponible (el repo contiene solo pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible (las preguntas del WVS estan en ingles; el modelo base es multilingue, pero el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Epocas de entrenamiento | 3 |
| Tamano del dataset | 357 ejemplos encuestado-pregunta |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, inyectado sobre el modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5. No se modifican los pesos del modelo base; el repositorio contiene exclusivamente los pesos del adaptador en formato safetensors y la configuracion PEFT.

El entrenamiento se realizo durante tres epocas sobre 357 ejemplos extraidos del World Values Survey, ola 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto se construyo tomando un tercio fijo y aleatorio de los paises y de las preguntas medibles. Cada prompt de usuario contiene un persona demografico, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de respuesta del encuestado. Una innovacion tecnica destacable es el enmascaramiento de los tokens del prompt en la funcion de perdida: la perdida se aplica unicamente al token o tokens de la letra de respuesta y al token EOS. El objetivo declarado del ajuste es corregir simultaneamente el colapso modal y la sobredispersion de la distribucion de respuestas generadas, evaluado mediante una curva de convergencia de diversidad relativa (R = 1 como linea de calibracion).

## Capacidades

- Generacion de texto condicionada a un persona demografico y a una pregunta de encuesta, devolviendo la letra de la opcion seleccionada.
- Prediccion de respuestas categoricas con distribucion calibrada en diversidad para el dominio del WVS ola 7.
- Modelado de heterogeneidad demografica: el prompt incluye atributos del encuestado que condicionan la respuesta.
- Capacidades heredadas del modelo base Qwen3.5-2B (generacion general, multilingueismo, razonamiento basico), aunque el adaptador no se ha entrenado para preservarlas ni se documentan.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en el adaptador.

## Casos de uso

- Reproduccion del experimento del paper: cargar el adaptador con PEFT sobre Qwen3.5-2B y regenerar la curva de diversidad relativa para el punto N=357, comparandola con los demas puntos del estudio.
- Simulacion de opinion publica a escala reducida: generar respuestas sinteticas de personas demograficos a preguntas del WVS ola 7 para estudiar sesgos de representacion, siempre con validacion frente a la distribucion real por pais y grupo.
- Investigacion en calibracion de diversidad: usar el adaptador como linea base ajustada frente al modelo base sin ajustar para medir el efecto del fine-tuning sobre el colapso modal y la sobredispersion.
- Estudio de tecnicas de enmascaramiento de perdida: servir de referencia para experimentos que apliquen perdida solo al token de respuesta y EOS en tareas de clasificacion generativa.
- Docencia y divulgacion sobre PEFT: ejemplo minimo y reproducible de un LoRA de rango 16 con alpha 32 entrenado sobre un dataset pequeno y bien delimitado.
- Analisis de sensibilidad al tamano de dataset: el adaptador forma parte de una serie con distintos valores de N, lo que permite estudiar como escala la calibracion con el numero de ejemplos.
- Evaluacion de robustez demografica: probar prompts con personas fuera del subconjunto de paises de entrenamiento para detectar extrapolacion deficiente antes de cualquier uso serio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una curva de convergencia de diversidad relativa (figura `assets/convergence.png`) sin valores numericos tabulados, por lo que no es posible reportar cifras de MMLU, HumanEval, GSM8K ni metricas de calibracion concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa practicamente nada (repositorio de 0.0 GB); el coste real lo determina el modelo base Qwen3.5-2B. Para un modelo de 2B en FP16 se estiman en torno a 4-5 GB de VRAM, y en cuantizacion de 4 bits en torno a 1.5-2 GB, aunque estas cifras no estan confirmadas en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder cargar el modelo base en FP16; para cuantizacion 4 bits bastan GPUs de 4 GB o superiores. Para entrenamiento o evaluacion por lotes se recomienda RTX 4090, A100 o H100, aunque no se documentan requisitos oficiales.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de gama de entrada con cuantizacion agresiva.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base o convertir los pesos a GGUF, algo que no se documenta en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n357-lora | LoRA sobre 2B | no disponible | Adaptador PEFT especializado | no disponible | Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | 2B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Otros adaptadores de la serie `diversity-calibration-wvs-*` de skblv | LoRA sobre 2B | no disponible | Adaptadores PEFT con distinto N | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion con el modelo base es la mas informativa: el adaptador anade calibracion de diversidad en el dominio del WVS a costa de especializarse y perder generalidad.

## Limitaciones y advertencias

- Especializacion extrema: entrenado sobre 357 ejemplos de un unico instrumento (WVS ola 7) y un subconjunto fijo de paises y preguntas; no debe usarse como modelo de chat general.
- Riesgo de sobreajuste: tres epocas sobre 357 ejemplos con rango 16 es una configuracion propensa a memorizar el subconjunto de entrenamiento.
- Extrapolacion demografica no validada: el adaptador no se ha evaluado en paises o preguntas fuera del tercio de entrenamiento segun la informacion disponible.
- Sesgos del WVS: las respuestas reflejan los sesgos del instrumento y de las poblaciones encuestadas; el modelo puede reproducirlos y amplificarlos al generar respuestas sinteticas.
- Riesgo de alucinacion: aunque la tarea es de clasificacion con letras, el modelo puede generar texto fuera de las opciones validas si no se restringe la decodificacion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse el repositorio y la licencia del modelo base antes de cualquier despliegue.
- Idiomas no declarados: la model card esta en ingles y el WVS se ha usado en ingles; el comportamiento en castellano no esta documentado.
- Artefacto de investigacion: sin descargas ni likes en el momento de la consulta, sin demo publica y con un tamano de repositorio de 0.0 GB que sugiere pesos minimos; no hay garantia de mantenimiento.
- Uso etico: generar opiniones publicas sinteticas atribuidas a grupos demograficos puede inducir a error si se presenta como dato real; debe etiquetarse siempre como simulacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n357-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Articulo: https://arxiv.org/abs/2609.16454
- World Values Survey, Round Seven, Country-Pooled Datafile v6.0.0: https://doi.org/10.14281/18241.24
- Curva de convergencia (figura): https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n357-lora/blob/main/assets/convergence.png
- Curva de convergencia (PDF): https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n357-lora/blob/main/assets/convergence.pdf
