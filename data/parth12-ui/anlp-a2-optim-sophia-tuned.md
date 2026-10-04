# parth12-ui/anlp-a2-optim-sophia-tuned

## Resumen

`parth12-ui/anlp-a2-optim-sophia-tuned` es un transformer decoder-only denso de 33,4 millones de parametros desarrollado por el usuario `parth12-ui` en el marco de una asignatura de procesamiento de lenguaje natural (ANLP Assignment 2, Part 2). El modelo se entreno desde cero para prediccion de siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`, durante 1 vez el tamano del dataset (39.075.840 tokens). Su proposito no es la produccion, sino servir como artefacto experimental para comparar el optimizador Sophia (aproximacion hessiana) frente a alternativas como AdamW en un mismo presupuesto de datos.

El modelo tiene 8 capas, dimension de modelo (d_model) de 512 y una longitud de contexto de solo 256 tokens. Se entreno con el optimizador Sophia desde cero con lr=0.0002, betas=[0.965, 0.99], rho=0.04, weight_decay=0.2 y hessian_interval=10. Al finalizar el entrenamiento alcanzo una perdida de validacion de 4,1126, una perplejidad de 61,10 y un BLEU de 1,19 en continuacion codiciosa de 64 tokens.

Su relevancia es acotada y de indole metodologica: se publica como evidencia reproducible de un experimento de comparacion de optimizadores, no como un modelo utilizable en tareas reales de generacion. No dispone de licencia declarada, no esta integrado en `transformers` de forma estandar y requiere codigo propio (`model_src`) para su carga. La model card documenta el historial de validacion cada 0,1x del dataset en `train_log.jsonl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no MoE, no SSM) |
| Parametros totales | 33.366.528 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + codigo `model_src` |
| Capas | 8 |
| Dimension de modelo (d_model) | 512 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso, definido en `model_src/config.py` y `model_src/model.py` mediante `TransformerConfig` y `Transformer`. No emplea mezcla de expertos ni atencion lineal: es una arquitectura causal clasica con 8 capas y d_model de 512, con un contexto de 256 tokens. El modelo se entreno desde cero para modelado de lenguaje (prediccion del siguiente token) sobre `browndw/human-ai-parallel-corpus`, un unico pase sobre el dataset (1x), lo que equivale a 39.075.840 tokens procesados. No se menciona en la informacion disponible ninguna fase de ajuste por instrucciones, RLHF ni DPO.

La innovacion experimental reside en el optimizador: se implemento Sophia desde cero, una familia de optimizadores de segundo orden por aproximacion hessiana, con hiperparametros lr=0.0002, betas=[0.965, 0.99], rho=0.04, weight_decay=0.2 y hessian_interval=10. El objetivo del trabajo es comparar la convergencia de Sophia frente a otros optimizadores bajo identico presupuesto de datos. No se especifican la composicion detallada del dataset, el tokenizador, el tamano de vocabulario, el numero de tokens por batch ni el hardware de entrenamiento, por lo que esos datos quedan como no disponibles.

## Capacidades

- Generacion de texto en ingles por continuacion de secuencia (next-token prediction); no es un modelo ajustado por instrucciones ni un modelo de chat.
- Modelado de lenguaje a nivel de token: calculo de perdida y perplejidad sobre texto en ingles.
- Continuacion codiciosa de fragmentos cortos (la model card reporta BLEU sobre continuaciones de 64 tokens, dentro de su contexto de 256).
- Capacidad multilingue: limitada al ingles; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de optimizadores: el modelo sirve como punto de comparacion controlado para evaluar la convergencia de Sophia frente a AdamW u otros optimizadores en un presupuesto fijo de 39 millones de tokens y una misma arquitectura base.
- Docencia en cursos de NLP: permite ilustrar de forma tangible el flujo completo de preentrenamiento desde cero (tokenizacion, configuracion de transformer, bucle de entrenamiento, registro de metricas) con un coste computacional minimo.
- Estudio de curvas de aprendizaje: `train_log.jsonl` registra perdida de validacion y BLEU cada 0,1x del dataset, lo que permite analizar la dinamica de convergencia a lo largo del entrenamiento sin necesidad de reentrenar.
- Pruebas de infraestructura de entrenamiento e inferencia: por su tamano (33,4M parametros), es util para validar pipelines de carga de safetensors, checkpoints y scripts de evaluacion antes de escalar a modelos mayores.
- Experimentos de analisis linguistico sobre texto humano frente a texto generado por IA: el corpus de entrenamiento es un corpus paralelo humano-IA, por lo que el modelo puede emplearse como linea base al estudiar la modelabilidad de ambos tipos de texto.
- Generacion de texto muy acotada en dominios restringidos: con contexto de 256 tokens y una perplejidad de 61,10, puede usarse experimentalmente para completar fragmentos cortos, siempre que se asuma una calidad muy inferior a la de modelos preentrenados de mayor escala.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, medidos a 1x del dataset:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 4,1126 |
| Perplejidad de validacion | 61,10 |
| BLEU de test (continuacion codiciosa de 64 tokens) | 1,19 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la informacion disponible. El BLEU de 1,19 es un valor muy bajo, coherente con un modelo de 33,4M parametros entrenado durante un unico pase sobre 39 millones de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision practica. En FP32 los pesos ocupan aproximadamente 134 MB; en FP16, unos 67 MB; en int8, unos 33 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas integradas. No requiere A100, H100 ni RTX 4090; una GTX 1650, una RTX 3060 o incluso una iGPU moderna son mas que suficientes.
- Inferencia en CPU: perfectamente viable, con latencias de milisegundos por token dado el tamano del modelo.
- Opciones de despliegue: el modelo no sigue la interfaz estandar de `transformers`, por lo que vLLM, TGI, llama.cpp ni Ollama funcionan de forma directa sin conversion previa. La ruta documentada es la carga manual con `safetensors.torch.load_model` junto con `Transformer` y `TransformerConfig` del paquete `model_src` incluido en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion directa es con otras variantes del mismo ejercicio academico y con modelos densos de escala parecida.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| parth12-ui/anlp-a2-optim-sophia-tuned | 33,4M | 256 | no disponible | safetensors + codigo propio | perplejidad 61,10; BLEU 1,19 |
| abhirajratna/anlp-a2-optim-sophia | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| sanyam2005/anlp-a2-part2-sophia | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| GPT-2 small | 124M | 1024 | MIT (segun su publicacion original) | transformers, multiples formatos | no comparable directamente; ampliamente evaluado |

No se dispone de datos de benchmarks publicados para las variantes hermanas del ejercicio, por lo que no es posible establecer una comparacion cuantitativa fiable mas alla de la coincidencia de metodologia (mismo corpus y mismo objetivo de comparacion de optimizadores).

## Limitaciones y advertencias

- Modelo de escala muy reducida (33,4M parametros) entrenado sobre un unico pase de 39 millones de tokens: la calidad de generacion es baja y no es apto para tareas de produccion.
- Contexto de solo 256 tokens, muy inferior al de cualquier modelo moderno; no soporta conversaciones largas ni documentos extensos.
- Perplejidad de 61,10 y BLEU de 1,19: indicadores de un modelo poco entrenado, con alta probabilidad de generar texto incoherente o repetitivo.
- Riesgo elevado de alucinacion y de deriva tematica por el escaso entrenamiento y la ausencia de ajuste por instrucciones.
- Sesgos conocidos: la model card no documenta analisis de sesgos ni composicion del dataset, por lo que se desconoce el sesgo heredado del corpus `browndw/human-ai-parallel-corpus`.
- Idiomas: solo ingles declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia: no declarada. La ausencia de licencia explicita impide asumir derechos de uso comercial; se debe contactar con el autor antes de cualquier uso distinto del experimental.
- Restricciones tecnicas: no integrable directamente en ecosistemas estandar (vLLM, llama.cpp, Ollama, TGI) sin trabajo de conversion, ya que requiere el codigo `model_src` del repositorio.
- Cero descargas y cero likes: no hay evidencia de uso por parte de terceros ni de validacion independiente de los resultados.
- Fecha de creacion registrada como 2026-10-04, posterior a la fecha habitual de referencia; conviene verificar la validez del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-sophia-tuned
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Variante hermana (abhirajratna): https://huggingface.co/abhirajratna/anlp-a2-optim-sophia
- Variante hermana (sanyam2005): https://huggingface.co/sanyam2005/anlp-a2-part2-sophia
- Repositorio del optimizador Sophia: https://github.com/AI-Natural-Language-Processing-Lab/Sophia-Optimizer-for-Language-Model-Pre-training
- Repositorio del ejercicio ANLP A2: https://github.com/bitmap4/anlp-a2
