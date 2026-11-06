# eoinf/trigram_alpha_125_2b_schedule_200m_dmodel32

## Resumen

`eoinf/trigram_alpha_125_2b_schedule_200m_dmodel32` es un transformer causal de investigacion, de tamano minimo, publicado por el usuario eoinf en Hugging Face. Forma parte de una rejilla de experimentos ("Transformer experiment grid") cuyo objetivo es estudiar el comportamiento de transformers muy pequenos entrenados sobre una tarea sintetica de trigramas, con un vocabulario de 4096 tokens y una longitud de contexto de 256 tokens. El nombre del modelo indica un `d_model` de 32, un schedule nominal de aproximadamente 2.000 millones de tokens de entrenamiento y una variante "alpha_125".

No se trata de un modelo de proposito general ni de un asistente conversacional: es un artefacto de investigacion orientado a analizar dinamicas de entrenamiento, planificacion de schedules y capacidad de ajuste de modelos diminutos sobre datos sinteticos. La model card es explicita: la evaluacion se realiza sobre los propios datos de entrenamiento, sin conjunto de validacion reservado, y el repositorio contiene unicamente los checkpoints en formato state-dict, la definicion de la ejecucion, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados.

Su relevancia es acotada: puede interesar a investigadores que quieran reproducir o comparar curvas de aprendizaje de transformers extremadamente pequenos, pero no es utilizable como modelo de produccion ni como base para fine-tuning en tareas reales de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tiny), `d_model` = 32 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (checkpoints en state-dict, sin versiones GGUF) |
| Idiomas soportados | no disponible (entrenado sobre datos sinteticos de trigramas) |
| Licencia | no disponible |
| Formato de pesos | state-dict de PyTorch (libreria `pytorch`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de dimension oculta 32, con vocabulario de 4096 tokens (tokenizer `eoinf/pile_tokenizer_4096`) y contexto de 256 tokens. El nombre del repositorio sugiere una variante "alpha_125" dentro de una rejilla de experimentos que explora distintos anchos (`d_model` 32 y probablemente otros) y schedules de entrenamiento. El schedule nominal declarado es de 1.999.998.976 tokens de entrenamiento, si bien los horizontes reales por modelo (incluyendo paradas tempranas) se registran en `grid_summary.json` y `result.json`.

El dataset utilizado se describe en `configuration.json` y, por el nombre del repositorio y de la tarea, corresponde a datos sinteticos de trigramas. No se menciona uso de RLHF, DPO ni tecnicas de alineacion. El repositorio incluye la definicion de la ejecucion, historial de checkpoints, log de actualizaciones de entrenamiento y metadatos de resultados, pero no incluye los estados de reanudacion del optimizador ni los datos de entrenamiento. El codigo de arquitectura y carga esta en el repositorio `synthetic_trigrams`.

## Capacidades

- Generacion de texto autoregresiva sobre secuencias de hasta 256 tokens, limitada al dominio sintetico de trigramas con el que fue entrenado.
- Modelado de dependencias de corto alcance (hasta trigramas) en el vocabulario de 4096 tokens del tokenizer `pile_tokenizer_4096`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo "thinking", vision ni audio.
- Su utilidad practica se limita a experimentacion sobre dinamicas de entrenamiento y schedules.

## Casos de uso

- Estudio de schedules de entrenamiento: el modelo permite analizar como un transformer de `d_model` 32 se ajusta a una tarea sintetica a lo largo de un schedule nominal de ~2.000 millones de tokens, comparando horizontes efectivos registrados en `grid_summary.json`.
- Reproduccion de experimentos de scaling en miniatura: util para validar pipelines de entrenamiento antes de escalar a modelos mayores, ya que el coste computacional es minimo.
- Analisis de curvas de aprendizaje: el log de actualizaciones y el historial de checkpoints permiten trazar la evolucion de la perdida y detectar paradas tempranas.
- Docencia e investigacion sobre transformers: sirve como ejemplo didactico de arquitectura causal minima con contexto corto y vocabulario reducido.
- Verificacion de codigo de carga: el repositorio `synthetic_trigrams` y los state-dicts permiten probar rutinas de carga de pesos y configuraciones.
- Experimentos de tokenizacion: al usar el tokenizer `eoinf/pile_tokenizer_4096`, puede emplearse para estudiar el efecto del vocabulario en tareas sinteticas de trigramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion se realiza sobre los datos de entrenamiento y que no existe evaluacion con conjunto reservado, por lo que cualquier metrica de rendimiento seria una medida de ajuste al propio dataset sintetico, no un benchmark comparable con modelos de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con `d_model` 32 y contexto de 256 tokens, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) es mas que suficiente. A100/H100 no aportan ventaja practica para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en CPU.
- Opciones de despliegue: al ser un state-dict de PyTorch, requiere cargar la arquitectura desde el repositorio `synthetic_trigrams`. No hay versiones GGUF, por lo que llama.cpp u Ollama no son aplicables directamente. vLLM y TGI no estan soportados de forma nativa para esta arquitectura de experimento.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo diminuto, la latencia seria minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eoinf/trigram_alpha_125_2b_schedule_200m_dmodel32 | no disponible (`d_model` 32) | 256 | no disponible | Hugging Face, state-dict PyTorch |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face, safetensors/GGUF |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Hugging Face, safetensors/GGUF |
| Pythia-70M | 70M | 2048 | Apache 2.0 | Hugging Face, safetensors |

La comparacion es orientativa: los modelos alternativos son transformers de proposito general con licencias claras y amplia disponibilidad, mientras que este modelo es un artefacto de investigacion sin licencia declarada y sin evaluacion reservada.

## Limitaciones y advertencias

- Entrenado sobre datos sinteticos de trigramas; no generaliza a lenguaje natural ni a tareas reales.
- Evaluacion sobre los propios datos de entrenamiento, sin conjunto de validacion: las metricas no reflejan capacidad de generalizacion.
- Licencia no disponible: no se puede asumir uso comercial permitido.
- Idiomas no declarados; no hay evidencia de capacidades multilingues.
- Contexto muy corto (256 tokens) y `d_model` de 32, lo que limita severamente cualquier uso practico.
- No incluye estados del optimizador ni datos de entrenamiento, lo que dificulta la reproduccion exacta del entrenamiento.
- Riesgo de alucinacion irrelevante en su dominio, pero el modelo no es fiable para generacion de texto fuera de la tarea sintetica.
- No apto para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/trigram_alpha_125_2b_schedule_200m_dmodel32
- Repositorio de codigo `synthetic_trigrams`: no disponible como enlace directo en la informacion proporcionada
- Tokenizer: https://huggingface.co/eoinf/pile_tokenizer_4096
- Paper, blog o demo: no disponibles
