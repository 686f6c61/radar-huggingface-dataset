# parth12-ui/anlp-a2-optim-adamw-tuned

## Resumen

`parth12-ui/anlp-a2-optim-adamw-tuned` es un transformer denso decoder-only de 33,4 millones de parametros desarrollado por el usuario parth12-ui como parte de la asignatura ANLP (Assignment 2, Part 2). Se trata de un modelo entrenado desde cero para prediccion del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`, y su proposito principal es servir como punto de comparacion dentro de un estudio de optimizadores (la etiqueta del repositorio es `optimizer-comparison`).

La arquitectura es un transformer denso decoder-only de 8 capas con `d_model` de 512 y una longitud de contexto de 256 tokens. El entrenamiento cubre 1 vez el dataset completo, es decir, 39.075.840 tokens, empleando un optimizador AdamW implementado tambien desde cero con `lr=0.0012`, `betas=[0.9, 0.95]`, `eps=1e-08` y `weight_decay=0.1`.

Es relevante unicamente en el contexto de investigacion sobre optimizadores y como referencia reproducible de bajo coste: no es un modelo de produccion. Su licencia no esta declarada, el idioma soportado es solo ingles y no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos indicadores de calidad disponibles son la perdida de validacion, la perplejidad y un BLEU de prueba muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 33.366.528 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Capas | 8 |
| Dimension del modelo (`d_model`) | 512 |
| Dataset de entrenamiento | `browndw/human-ai-parallel-corpus` |
| Tokens de entrenamiento | 39.075.840 (1x dataset) |
| Optimizador | AdamW from-scratch (lr=0.0012, betas=[0.9, 0.95], eps=1e-08, weight_decay=0.1) |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con atencion completa y sin componentes de mezcla de expertos (no es MoE). Consta de 8 capas, una dimension de modelo de 512 y una ventana de contexto de 256 tokens. Fue preentrenado desde cero con el objetivo de modelado de lenguaje (prediccion del siguiente token) sobre `browndw/human-ai-parallel-corpus`, recorriendo el dataset una sola vez hasta completar 39.075.840 tokens. El repositorio no documenta el numero de cabezas de atencion, la dimension de la capa feed-forward, la funcion de activacion, el esquema de posicionamiento ni el tamano del vocabulario.

La innovacion declarada no esta en la arquitectura sino en el optimizador: se implemento un AdamW desde cero (no se indica si se uso PyTorch nativo o una reimplementacion) con los hiperparametros `lr=0.0012`, `betas=[0.9, 0.95]`, `eps=1e-08` y `weight_decay=0.1`. No se documenta el uso de RLHF, DPO, SFT ni tecnicas de alineacion posteriores; tampoco se mencionan trucos de eficiencia como decodificacion especulativa, atencion lineal o Flash Attention. El archivo `train_log.jsonl` registra la perdida de validacion y el BLEU de prueba cada 0,1x del dataset, lo que sugiere que el objetivo del experimento era comparar la evolucion de distintos optimizadores bajo el mismo presupuesto de tokens.

## Capacidades

- Generacion de texto en ingles por continuacion autorregresiva, limitada a un maximo practico de 256 tokens de contexto.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue: ninguna; el modelo esta etiquetado exclusivamente como `en`.
- No dispone de modo de pensamiento (thinking mode), vision, audio ni otras modalidades.
- Uso como baseline reproducible para experimentos de comparacion de optimizadores y de tecnicas de entrenamiento a pequena escala.

## Casos de uso

- Investigacion sobre optimizadores: sirve como artefacto de referencia dentro de un estudio comparativo de optimizadores (AdamW frente a otras variantes) manteniendo fijos dataset, arquitectura y presupuesto de tokens, lo que permite aislar el efecto del optimizador sobre la curva de perdida.
- Reproduccion academica de entrenamiento desde cero: el repositorio incluye `train_log.jsonl` con metricas cada 0,1x del dataset, lo que facilita reproducir y auditar el proceso en docencia o trabajos de asignatura.
- Demostraciones educativas de modelado de lenguaje: por su tamano (33,4 M de parametros, 0,1 GB) se puede cargar y ejecutar en cualquier portatil para ilustrar conceptos de tokenizacion, perplejidad y decodificacion.
- Generacion de continuaciones cortas de texto en ingles: util para pruebas unitarias de pipelines de inferencia donde se necesita un modelo ligero que devuelva texto coherente a nivel local, no global.
- Baseline para experimentos de destilacion o poda: al ser tan pequeno, es un candidato comodo como modelo de partida o de comparacion en estudios de compresion.
- Pruebas de integracion de codigo de carga con safetensors: el ejemplo de la model card (`model_src.config`, `model_src.model`, `safetensors.torch.load_model`) permite validar flujos de carga de pesos personalizados en entornos de investigacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes ni tareas de razonamiento, dado su tamano, su contexto de 256 tokens, su BLEU de prueba de 1,18 y la ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos valores reportados por el autor son los siguientes:

| Metrica (a 1x dataset) | Valor |
|---|---|
| Perdida de validacion | 3,9376 |
| Perplejidad de validacion | 51,29 |
| BLEU de prueba (continuacion greedy de 64 tokens) | 1,18 |

Como referencia de magnitud, una perplejidad de 51,29 sobre texto en ingles es muy alta para un modelo de lenguaje; modelos de escala similar entrenados con presupuestos mucho mayores suelen situarse muy por debajo. El BLEU de 1,18 en continuacion de 64 tokens es practicamente nulo, lo que confirma que la calidad generativa del modelo es baja.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision de 32 bits (33,4 M de parametros x 4 bytes = ~134 MB de pesos, mas activaciones y overhead del framework). En `float16`/`bfloat16` rondaria los 67 MB de pesos.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; no se requiere hardware de centro de datos (A100, H100) salvo por comodidad.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) y tambien en CPU, dado el tamano del repositorio (0,1 GB).
- Opciones de despliegue: al usar clases propias (`model_src.config.TransformerConfig` y `model_src.model.Transformer`) y pesos en safetensors, el despliegue requiere cargar ese codigo fuente del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de versiones GGUF impide su uso directo con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada con los que se pueda establecer una comparacion con datos verificables. Se puede senalar a nivel cualitativo que existemodelos de escala parecida o ligeramente superior (por ejemplo, GPT-2 de 124 M de parametros) entrenados sobre volumenes de datos muy superiores y con contexto mucho mayor, pero no se dispone de sus cifras en esta busqueda para una comparacion rigurosa.

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-optim-adamw-tuned | 33,4 M | 256 | 39,1 M tokens | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de caracter academico: forma parte de una practica de asignatura (ANLP Assignment 2, Part 2) y no ha sido disenado ni validado para uso en produccion.
- Calidad generativa muy baja: perplejidad de validacion de 51,29 y BLEU de prueba de 1,18, lo que implica continuaciones poco coherentes y riesgo elevado de texto sin sentido.
- Riesgo alto de alucinacion: al no haber pasado por RLHF, DPO ni ajuste instructivo, no sigue instrucciones ni mantiene fidelidad factual.
- Contexto muy limitado: solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Idioma: exclusivamente ingles; no se ha entrenado ni evaluado en castellano.
- Licencia no declarada: al no especificarse licencia en el repositorio, no hay autorizacion explicita de uso comercial; conviene asumir restricciones hasta que el autor la aclare.
- Dependencia de codigo propietario del repositorio (`model_src`) para cargar el modelo, lo que dificulta la portabilidad a otros runtimes de inferencia.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgos ni de toxicidad.
- Datos de entrenamiento limitados a un unico corpus (`browndw/human-ai-parallel-corpus`) y a una sola pasada, lo que reduce la cobertura linguistica y tematica del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-adamw-tuned
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- No se han encontrado papers, blogs, repositorios de codigo auxiliares ni demos adicionales en la informacion proporcionada.
