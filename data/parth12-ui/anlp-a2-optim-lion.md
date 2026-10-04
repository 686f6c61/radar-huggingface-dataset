# parth12-ui/anlp-a2-optim-lion

## Resumen

`parth12-ui/anlp-a2-optim-lion` es un transformer decoder-only denso de 33.366.528 parametros, entrenado desde cero para prediccion del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`. No es un modelo orientado a produccion, sino el artefacto de un trabajo academico (ANLP Assignment 2, Part 2) cuyo objeto de estudio es el optimizador: el modelo se entrena integramente con una implementacion propia del optimizador **Lion**, perteneciente a la categoria de optimizadores eficientes en memoria, y se publica como pieza de una comparativa entre optimizadores.

La arquitectura es deliberadamente pequena y controlada: 8 capas, `d_model` de 512 y una longitud de contexto de 256 tokens. Se entrena exactamente 1x el dataset, equivalente a 39.075.840 tokens, con `lr=0.0002`, `betas=[0.9, 0.99]` y `weight_decay=0.3`. Los resultados publicados son una perdida de validacion de 4.1811, una perplejidad de validacion de 65.44 y un BLEU de test de 1.10 sobre continuaciones greedy de 64 tokens.

Su relevancia es metodologica, no de capacidades: sirve como punto de referencia reproducible y de bajo coste computacional para estudiar el comportamiento de Lion frente a otros optimizadores en un regimen de entrenamiento identico. Cualquier uso fuera de ese contexto (generacion real, agentes, codigo) esta fuera de su alcance por tamano, contexto y calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, entrenado desde cero (codigo propio en `model_src/`) |
| Parametros totales | 33.366.528 (33,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican conversiones cuantizadas; el repo solo incluye pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `train_log.jsonl` y codigo fuente en `model_src/` |
| Capas | 8 |
| Dimension del modelo (`d_model`) | 512 |
| Tamano del repositorio | 0,1 GB |
| Optimizador | Lion (implementacion propia, categoria memory-efficient) |
| Hiperparametros de entrenamiento | lr=0.0002, betas=[0.9, 0.99], weight_decay=0.3 |
| Tokens de entrenamiento | 39.075.840 (1x el dataset) |
| Dataset | `browndw/human-ai-parallel-corpus` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso, sin mezcla de expertos ni mecanismos hibridos (SSM, atencion lineal, decodificacion especulativa): la model card no declara ninguna innovacion arquitectonica, y la atencion es la estandar del bloque decoder. La configuracion es de escala de laboratorio: 8 capas, `d_model` de 512, 33,4 M de parametros totales y una ventana de contexto de 256 tokens. El modelo se carga mediante codigo propio (`model_src.config.TransformerConfig` y `model_src.model.Transformer`), no a traves de las clases estandar de `transformers`, por lo que su integracion requiere el repositorio del autor.

El entrenamiento optimiza el objetivo estandar de *language modeling* (prediccion del siguiente token) sobre `browndw/human-ai-parallel-corpus`, durante exactamente 1x el dataset, es decir 39.075.840 tokens. No se documenta ninguna fase de ajuste por preferencias (RLHF, DPO, SFT) ni de instrucciones: es un modelo base. El elemento diferencial es el optimizador: Lion se implementa desde cero y se aplica con `lr=0.0002`, `betas=[0.9, 0.99]` y `weight_decay=0.3`. Los resultados registrados son perdida de validacion 4.1811, perplejidad de validacion 65.44 y BLEU de test 1.10 (continuacion greedy de 64 tokens). El fichero `train_log.jsonl` contiene la perdida de validacion y el BLEU de test muestreados cada 0,1x del dataset, lo que permite analizar curvas de convergencia.

## Capacidades

- Generacion de texto en ingles: continuacion de secuencias mediante decodificacion autorregresiva, limitada a ventanas de 256 tokens.
- Modelado de lenguaje: calculo de probabilidades y perplejidad sobre texto en ingles, util para experimentos de evaluacion.
- Capacidad de infilling/continuacion truncada: util para estudiar comportamiento de modelos pequenos en tareas controladas.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes, razonamiento multi-paso ni planificacion.
- No hay modo de razonamiento explicito (*thinking mode*), vision, audio ni multimodalidad.
- Capacidades multilingues: no disponibles; el entrenamiento y la etiqueta de idioma se limitan al ingles.
- Capacidad instrumental: servir como sujeto de experimento reproducible para comparar optimizadores bajo condiciones identicas.

## Casos de uso

- Reproduccion academica de la comparativa de optimizadores: el modelo se usa como el brazo "Lion" de un estudio controlado, cargando los pesos y comparando las curvas de `train_log.jsonl` frente a los brazos entrenados con otros optimizadores bajo los mismos hiperparametros de datos y arquitectura.
- Investigacion sobre optimizadores eficientes en memoria: dado que Lion reduce el estado del optimizador respecto a Adam, este checkpoint permite medir el compromiso entre memoria consumida y calidad final (perplejidad 65.44) en un regimen de 1x dataset.
- Docencia de *training from scratch*: el pipeline completo (config, modelo, tokenizador implicito, log de entrenamiento) sirve como ejemplo minimo y ejecutable de entrenamiento de un transformer decoder-only en una unica GPU.
- Ablaciones de hiperparametros: con un coste de 33,4 M de parametros y 39 M de tokens, es viable reentrenar variantes cambiando `lr`, `betas` o `weight_decay` y comparar contra este checkpoint como baseline.
- Pruebas de infraestructura y CI de entrenamiento: su tamano permite usarlo como caso de humo para validar pipelines de preprocesado, checkpointing en safetensors y carga con `safetensors.torch.load_model`.
- Estudio de degradacion de calidad en modelos minusculos: el BLEU de test de 1.10 y la perplejidad de 65.44 lo convierten en un caso de referencia para analizar los limites de la escala y del contexto de 256 tokens.
- Analisis de corpus: al estar entrenado especificamente sobre `browndw/human-ai-parallel-corpus`, puede emplearse para estudiar como un modelo pequeno captura el estilo y las estadisticas de ese corpus concreto.

## Benchmarks y rendimiento

| Metrica (a 1x dataset) | Valor |
|---|---|
| Perdida de validacion | 4.1811 |
| Perplejidad de validacion | 65.44 |
| BLEU de test (continuacion greedy de 64 tokens) | 1.10 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas reportadas son las de la tabla anterior, junto con el registro por intervalos de 0,1x dataset en `train_log.jsonl`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32, 67 MB en fp16/bf16 y alrededor de 17-33 MB en cuantizaciones de 4-8 bits. Son estimaciones derivadas del numero de parametros (33,4 M), no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas integradas modernas. No se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090 y equivalentes; tambien ejecuta en CPU sin dificultad.
- Opciones de despliegue: al no usar las clases estandar de `transformers`, el camino documentado es cargar con `safetensors.torch.load_model` junto con `model_src`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con 33,4 M de parametros y contexto de 256 tokens, la latencia por token es previsiblemente de milisegundos en GPU de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos publicados en la informacion disponible para este modelo. A continuacion se incluyen referencias de escala con datos publicos de sus respectivas documentaciones (no verificados en el material proporcionado), a efectos de situar el tamano:

| Modelo | Parametros | Contexto | Licencia | Comparativa de rendimiento |
|---|---|---|---|---|
| `parth12-ui/anlp-a2-optim-lion` | 33,4 M | 256 | no disponible | referencia |
| GPT-2 small | 124 M | 1024 | MIT modificada | no disponible |
| Pythia-70M | 70 M | 2048 | Apache 2.0 | no disponible |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | no disponible |

El modelo no es funcionalmente comparable a alternativas de instrucciones o de chat: su proposito es servir como sujeto experimental en una comparativa de optimizadores, no competir en tareas de generacion.

## Limitaciones y advertencias

- Calidad de generacion muy baja: BLEU de test de 1.10 y perplejidad de 65.44 indican salidas de baja coherencia; no es apto para generacion de texto utilizable.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus paralelo humano-IA sin filtrado declarado, puede reproducir sesgos presentes en ese corpus.
- Riesgo de alucinacion: alto y sin mitigacion; no hay ajuste por instrucciones ni mecanismos de grounding.
- Ventana de contexto muy reducida (256 tokens), lo que impide conversaciones multi-turno, resumen de documentos o cualquier tarea con contexto largo.
- Modelo base sin ajuste instructivo: no sigue instrucciones, no soporta *chat templates* ni roles de sistema/usuario.
- Unilingue en ingles; no hay capacidades en castellano ni en otros idiomas.
- Licencia no especificada: la ausencia de licencia explicita impide asumir derechos de uso comercial. Debe tratarse como material sin permiso claro de explotacion hasta que el autor la defina.
- Integracion no estandar: requiere el codigo de `model_src/` del repositorio y no es cargable directamente con `AutoModelForCausalLM`.
- Sin soporte de cuantizacion publicado (GGUF, AWQ, GPTQ) ni de runners de inferencia habituales.
- Repositorio con 0 descargas y 0 likes, actualizado una sola vez: no hay comunidad, mantenimiento ni soporte esperables.
- Fecha de creacion registrada como 2026-10-03, poco habitual; conviene verificar la vigencia del artefacto antes de reutilizarlo.

## Enlaces

- HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-lion
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper del optimizador Lion (Symbolic Discovery of Optimization Algorithms): https://arxiv.org/abs/2302.06675
- Repositorio de referencia de Lion: https://github.com/google/automl/tree/master/lion
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, demos o repositorios del autor.
