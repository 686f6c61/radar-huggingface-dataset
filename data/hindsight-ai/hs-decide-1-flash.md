# hindsight-ai/hs-decide-1-flash

## Resumen

hs-decide-1-flash es un modelo de decisión de 0,8B desarrollado por Hindsight AI como componente del sistema de memoria para agentes Hindsight (open source, github.com/vectorize-io/hindsight). A diferencia de un modelo generativo, no produce texto: recibe un estado (por ejemplo, una consulta y un conjunto de documentos) junto con una o varias preguntas tipadas sobre ese estado, y devuelve en un único forward pass una distribución de probabilidad sobre cada opción de respuesta. Está afinado a partir de Qwen/Qwen3.5-0.8B y cuenta con 752.393.024 parámetros reales en safetensors.

El modelo resuelve un problema concreto en pipelines de agentes: decidir qué fragmento de memoria es relevante, si un documento responde a una consulta, si dos hechos son contradictorios o qué opción elegir entre un conjunto cerrado, sin pagar el coste ni la latencia de generar texto. Soporta tres tipos de pregunta: `choice` (elegir entre 2 y 255 opciones), `score` (valorar en 2 a 10 niveles ordenados) y `noul` (sí/no). Todas las preguntas sobre un mismo estado se responden en la misma pasada.

Es relevante ahora porque propone un patrón distinto al del LLM generativo como juez: un modelo pequeño, determinista en formato, con probabilidades calibradas y confianza explícita, entrenado para peticiones de hasta 65.536 tokens y multilingüe en ocho idiomas. Su licencia Apache 2.0 y su empaquetado como plugin de vLLM facilitan integrarlo en producción sin depender de un proveedor externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-0.8B, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens por petición (entrenado) |
| Tipos de cuantizacion | no disponible (el modelo se publica en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se afina como cabecera de decisión sobre representaciones del estado y de las preguntas. La salida no es texto generado: para cada pregunta el modelo emite una distribución sobre las opciones definidas en la petición (`choice` con entre 2 y 255 opciones, `score` con entre 2 y 10 niveles ordenados, `noul` binario), junto con una medida de confianza. El pipeline declarado en Hugging Face es `text-ranking`, coherente con el uso como reranker y clasificador de relevancia.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se especifica que el entrenamiento cubre peticiones de hasta 65.536 tokens, que el modelo se distribuye en bfloat16 y que la inferencia se realiza en una sola pasada para todas las preguntas de una petición, con `output_tokens: 0` en la respuesta de la API. El repositorio incluye en `serving/` un plugin de vLLM que añade el endpoint `POST /v1/systemone`, además de un servidor basado en Transformers para CPU, Apple Silicon o GPU.

## Capacidades

- Decisión tipada con probabilidades: devuelve una distribución completa sobre las opciones, no solo la etiqueta ganadora.
- Preguntas `choice`: selección entre 2 y 255 opciones con probabilidades por opción y confianza.
- Preguntas `score`: valoración ordinal en 2 a 10 niveles, con puntuación esperada y leyenda de niveles.
- Preguntas `noul`: respuesta binaria sí/no expresada como probabilidad.
- Múltiples preguntas por petición: todas las preguntas sobre un mismo estado se resuelven en el mismo forward pass.
- Reranking y evaluación de relevancia documento-consulta, incluyendo detección de información obsoleta o contradictoria.
- Capacidades multilingües en inglés, español, francés, alemán, portugués, japonés, coreano y chino.
- Contexto largo: peticiones de hasta 65.536 tokens; las que lo exceden devuelven error `max_tokens_exceeded`.
- Integración con Hindsight como modelo de decisión para memoria de agentes.
- No soporta generación de texto, tool calling ni razonamiento multi-paso autónomo: es un componente de decisión, no un agente.

## Casos de uso

- Reranking de memoria de agente: dado un estado con consulta y documentos recuperados, el modelo puntúa cada documento con preguntas `score` para ordenar qué fragmentos debe usar el agente en el siguiente paso, aprovechando el contexto de 65.536 tokens para evaluar lotes grandes en una sola pasada.
- Detección de información obsoleta: con preguntas `choice` y `noul` se identifica qué documento contiene la versión vigente de un dato (por ejemplo, una fecha de evento que cambió) y si hubo cambio, tal como muestra el ejemplo de la model card con D00 y D01.
- Clasificación de tickets en soporte: una pregunta `noul` como "¿es un problema de facturación?" devuelve una probabilidad (0,997 en el ejemplo del autor) que se puede usar como umbral para enrutar tickets, sin generar texto ni consumir tokens de salida.
- Filtrado previo a generación: actuar como primera etapa que descarta documentos irrelevantes antes de pasarlos a un LLM generativo, reduciendo coste y riesgo de alucinación al limitar el contexto de entrada.
- Enrutado y selección de herramientas en pipelines de agentes: preguntas `choice` sobre un conjunto cerrado de acciones o fuentes de datos permiten elegir la siguiente operación con una probabilidad explícita y auditable.
- Evaluación automática de respuestas: preguntas `score` con criterios ordenados ("sobre otro tema", "mismo tema sin ayuda", "ayuda", "responde") para puntuar la calidad de candidatos en un sistema de QA o de generación aumentada por recuperación.
- Moderación y verificación de hechos en pipelines multilingües: preguntas `noul` sobre afirmaciones en cualquiera de los ocho idiomas soportados, con probabilidades que permiten fijar umbrales por caso de uso.

## Benchmarks y rendimiento

La model card incluye dos gráficas de evaluación (`assets/in-hindsight.png` y `assets/benchmarks.png`) que comparan el modelo dentro de Hindsight y frente a otros modelos de decisión de 0,8B, pero los valores numéricos no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,5 GB para los pesos (el repositorio ocupa 1,5 GB), más overhead de activaciones y caché KV para contextos de hasta 65.536 tokens.
- GPU recomendadas: cualquier GPU compatible con PyTorch; para servir con vLLM se requiere una GPU (el plugin usa `vllm serve` con flags como `--gpu-memory-utilization`). No se especifican modelos concretos de GPU en la documentación.
- Cabe en GPU de consumo: el tamaño de pesos en bf16 es de aproximadamente 1,5 GB, por lo que es viable en GPUs de consumo con suficiente memoria para el contexto utilizado; no se publican cifras oficiales de VRAM por configuración.
- Despliegue con vLLM: `pip install vllm==0.32.0 ./hs-decide-1-flash/serving` y `hindsight-decision-serve hs-decide-1-flash --port 8000`, que expone `POST /v1/systemone`.
- Despliegue con Transformers: paquete `serving[server]` con Python 3.12 o superior, en CPU, Apple Silicon o cualquier GPU soportada por PyTorch; el servidor Transformers atiende una petición a la vez.
- Ajuste de carga: `--max-request-tokens` permite rechazar peticiones largas con `max_tokens_exceeded` para evitar timeouts; Hindsight reparte esas peticiones. También aplican `HINDSIGHT_API_DECISION_MODEL_TIMEOUT` y `HINDSIGHT_API_DECISION_MODEL_MAX_CONCURRENT`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hs-decide-1-flash | 752.393.024 | 65.536 tokens | Modelo de decisión (choice/score/noul) | Apache 2.0 | Hugging Face, plugin vLLM, servidor Transformers, Hindsight Inference |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | LLM generativo | no disponible en la información proporcionada | Hugging Face |
| Otros modelos de decisión de 0,8B | no disponible | no disponible | Decisión | no disponible | La model card los menciona en una gráfica comparativa, sin datos numéricos accesibles |

La comparación con alternativas de la misma categoría no puede completarse con datos verificables: la model card referencia una gráfica frente a otros modelos de decisión de 0,8B, pero no se detallan nombres ni resultados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo fuera del patrón estado + preguntas tipadas no es su función.
- Las respuestas son probabilidades y requieren umbrales calibrados por caso de uso; la confianza reportada no sustituye una validación en el dominio de despliegue.
- Límite estricto de 65.536 tokens por petición; las peticiones mayores devuelven error 400 con `max_tokens_exceeded` y deben dividirse.
- El servidor basado en Transformers atiende una petición a la vez, lo que limita el throughput en comparación con vLLM.
- No se documentan sesgos conocidos, tasas de alucinación ni datos de entrenamiento; al ser un modelo de decisión, el riesgo se traslada a errores de clasificación o ranking con probabilidades mal calibradas.
- La cobertura lingüística se limita a los ocho idiomas declarados; no se especifica el rendimiento relativo por idioma.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuya licencia no se detalla en la información proporcionada.
- Para usar el proveedor `hindsight` en Hindsight es obligatoria una API key del servidor (`--api-key`); el servicio alojado en inference.hindsight.vectorize.io requiere clave de Hindsight Inference.
- No hay resultados de benchmarks numéricos publicados en la información disponible, lo que impide validar las afirmaciones de rendimiento de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-decide-1-flash
- Repositorio de Hindsight: https://github.com/vectorize-io/hindsight
- Inferencia alojada de Hindsight: https://inference.hindsight.vectorize.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- PyTorch (instalación): https://pytorch.org/get-started/locally/
