# nagohachi/tiny-lm-v3.1-japanese-1.5b-a500m-sft

## Resumen

tiny-lm-v3.1-japanese-1.5b-a500m-sft es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el usuario nagohachi, especializado en japones y ajustado mediante SFT para uso conversacional. Con 1.461.371.904 parametros totales y aproximadamente 480 millones activos por token, emplea 16 expertos enrutados (top-3) mas un experto compartido, lo que permite un coste de inferencia cercano al de un modelo denso de ~500M pese a almacenar 1,46B de parametros.

Es la version 3.1 de la familia tiny-lm, entrenada desde cero sobre 32,5B tokens de texto japones, ingles y matematicas, e instruida con datos de conversacion en japones. Su interes practico reside en ofrecer un modelo conversacional japones compacto y desplegable en hardware modesto, con una implementacion MoE propia que requiere `trust_remote_code=True`. La longitud de contexto es de 2048 tokens y el vocabulario de 99.574 entradas, heredado del tokenizador de llm-jp-3-440m.

El modelo se publica con pesos en safetensors y tamano de repositorio de 2,9 GB, sin licencia declarada en la model card, lo que supone una limitacion relevante para uso comercial. No dispone de descargas ni likes en el momento de la consulta, y no se ha publicado informacion sobre benchmarks mas alla de la evaluacion con llm-jp-eval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (megatron_gpt_moe, implementacion custom) |
| Parametros totales | 1.461.371.904 |
| Parametros activos | ~480M |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Japones (entrenado tambien con texto en ingles y matematicas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom code, requiere `trust_remote_code=True`) |
| Expertos | 16 enrutados (top-3) + 1 compartido |
| Vocabulario | 99.574 tokens |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Tamano del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas MoE tipo megatron_gpt_moe, con 16 expertos enrutados mediante top-3 mas un experto compartido siempre activo. Esta configuracion reduce el coste computacional por token (unos 480M parametros activos) frente a un modelo denso de 1,46B, manteniendo la capacidad de representacion de un modelo mayor. La implementacion MoE es personalizada y se distribuye con el repositorio, por lo que es obligatorio cargar el modelo con `trust_remote_code=True`.

El entrenamiento se estructura en tres fases. El preentrenamiento cubre 21,5B tokens procedentes de los subconjuntos sample-10BT de hotchpotch/fineweb-2-edu-japanese y HuggingFaceFW/fineweb-edu. El preentrenamiento continuado anade 11,0B tokens: 10,0B de documentos japoneses de fineweb-2-edu-japanese fuera de sample-10BT y 1,0B de tokyotech-llm/swallow-math-v2 (stage3-textbook y stage3-qa). Finalmente, el SFT emplea llm-jp/magpie-sft-v1.0, kanhatakeyama/AutoMultiTurnByCalm3-22B y 10.000 ejemplos de cl-nagoya/auto-wiki-qa, sumando 198.000 conversaciones con calculo de perdida unicamente sobre los turnos del asistente. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en japones, con plantilla de chat integrada (`apply_chat_template`).
- Razonamiento basico y respuesta a preguntas factuales en japones.
- Comprension lectora y clasificacion de texto en japones.
- Traduccion y generacion de resumenes en japones (rendimiento limitado segun benchmarks).
- Generacion de codigo (evaluada pero excluida del promedio en llm-jp-eval).
- Razonamiento matematico basico, reforzado con datos de swallow-math-v2.
- Soporte de conversaciones multiturno gracias a los datos de SFT multirrunda.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional japones en local: el modelo puede gestionar dialogos multiturno con una ventana de 2048 tokens, adecuado para un chatbot de escritorio o embebido en aplicaciones con recursos limitados.
- Prototipado rapido de aplicaciones NLP en japones: su tamano (2,9 GB en safetensors) permite iterar en una sola GPU consumer, util para validar ideas antes de escalar a modelos mayores.
- Generacion de respuestas en FAQ y soporte de nivel basico: con datos SFT de magpie y auto-wiki-qa, puede responder preguntas frecuentes y consultas de dominio general en japones.
- Tareas de comprension lectora y extraccion de informacion: util para resumir o responder preguntas sobre documentos japoneses cortos dentro del limite de contexto.
- Educacion y practica de japones: puede generar explicaciones y ejemplos en japones para herramientas de aprendizaje de idioma.
- Investigacion sobre arquitecturas MoE de bajo coste: sirve como banco de pruebas para estudiar enrutamiento de expertos y eficiencia de parametros activos en modelos pequenos.
- Generacion de texto aumentada en pipelines de datos: puede producir texto sintetico en japones para aumento de datos o preetiquetado en proyectos con presupuesto computacional reducido.

## Benchmarks y rendimiento

Evaluacion con llm-jp-eval v1.4.1, 4-shot sin plantilla de chat, 100 ejemplos por dataset del split de desarrollo. El promedio es la media de las 10 categorias (se excluye generacion de codigo).

| Modelo | average | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **tiny-lm-v3.1-japanese-1.5b-a500m-sft** | 0.257 | 0.192 | 0.040 | 0.260 | 0.273 | 0.030 | 0.567 | 0.390 | 0.303 | 0.415 | 0.098 |
| tiny-lm-v3-japanese-1.5b-a500m-sft | 0.234 | 0.042 | 0.038 | 0.205 | 0.283 | 0.040 | 0.583 | 0.542 | 0.239 | 0.295 | 0.069 |
| llm-jp/llm-jp-3-440m-instruct3 | 0.277 | 0.285 | 0.060 | 0.245 | 0.313 | 0.040 | 0.649 | 0.448 | 0.257 | 0.399 | 0.072 |

La version 3.1 mejora el promedio respecto a la 3.0 (0.257 frente a 0.234), con avances notables en EL (0.192 frente a 0.042) y RC (0.415 frente a 0.295), aunque retrocede en NLI (0.390 frente a 0.542). Frente a llm-jp-3-440m-instruct3, el modelo queda ligeramente por debajo en promedio (0.257 frente a 0.277), pese a tener mas parametros totales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3 GB para los pesos (1,46B parametros), mas overhead de activaciones y cache KV; en la practica, en torno a 4-6 GB segun longitud de contexto y batch.
- Cuantizacion: no se documentan formatos GGUF ni cuantizaciones oficiales; al requerir codigo custom, la conversion a otros formatos no esta garantizada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070); en datacenter, A100, H100 o L4 para mayor throughput.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas, especialmente con contexto corto y batch pequeno.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI debido a la implementacion MoE custom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Promedio llm-jp-eval |
|---|---|---|---|---|---|
| tiny-lm-v3.1-japanese-1.5b-a500m-sft | 1,46B | ~480M | 2048 | no disponible | 0.257 |
| tiny-lm-v3-japanese-1.5b-a500m-sft | 1,46B | ~480M | 2048 | no disponible | 0.234 |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | denso | no disponible | no disponible | 0.277 |

La comparativa se limita a los modelos incluidos en la evaluacion del autor. El modelo denso llm-jp-3-440m-instruct3 obtiene un promedio ligeramente superior con menos parametros, lo que sugiere que el MoE no compensa en esta escala. No se dispone de datos comparativos con modelos como Swallow, CALM o Sarashina en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican terminos de uso comercial, lo que impide asumir permisos para produccion.
- Ventana de contexto muy corta (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Rendimiento limitado en tareas de resumen (SUM 0.098) y en clasificacion de falsedad (FA 0.040), con valores cercanos al azar.
- Riesgo de alucinacion propio de modelos pequenos entrenados con volumen moderado de datos; no se documentan mitigaciones.
- Entrenado principalmente en japones; el soporte de ingles y otros idiomas no esta garantizado ni evaluado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el repositorio antes de desplegarlo en entornos sensibles.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de inferencia optimizados, lo que limita el despliegue en produccion.
- Sin datos de sesgos, filtrado de seguridad ni evaluaciones de robustez.
- Modelo con cero descargas y cero likes en el momento de la consulta: poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v3.1-japanese-1.5b-a500m-sft
- Version anterior: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-sft
- Tokenizador base: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de preentrenamiento japones: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Dataset de preentrenamiento ingles: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de matematicas: https://huggingface.co/datasets/tokyotech-llm/swallow-math-v2
- Dataset SFT magpie: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset SFT multirrunda: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Dataset SFT wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Framework de evaluacion: https://github.com/llm-jp/llm-jp-eval
- Modelo de referencia llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
