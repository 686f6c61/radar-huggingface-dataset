# parth12-ui/anlp-a2-optim-sophia

## Resumen

`parth12-ui/anlp-a2-optim-sophia` es un transformer denso decoder-only de 33.366.528 parámetros (8 capas, `d_model` 512, contexto de 256 tokens) entrenado desde cero para predicción del siguiente token. Lo publica el usuario `parth12-ui` como parte de la asignatura ANLP (Assignment 2, Part 2) y su interés no reside en la calidad del modelo, sino en su función como experimento controlado: comparar el optimizador **Sophia** (aproximación de Hessiana) frente a alternativas como AdamW en un mismo presupuesto de cómputo.

El entrenamiento se realizó sobre `browndw/human-ai-parallel-corpus` durante 1x el dataset, es decir, 39.075.840 tokens. El autor reporta una pérdida de validación de 4,3059 y una perplejidad de 74,14, valores coherentes con un modelo pequeño entrenado con un presupuesto de tokens muy reducido (aproximadamente 1,2 tokens por parámetro, frente a los 20 tokens por parámetro que se consideran el mínimo moderno para un ajuste razonable).

Se trata, por tanto, de un artefacto académico reproducible, no de un modelo listo para producción: no hay licencia declarada, no hay tokenizador documentado, no hay versiones cuantizadas y el pipeline de HuggingFace no está definido. Es relevante únicamente para quien investigue optimizadores de segundo orden, quiera reproducir el experimento o necesite un modelo de juguete extremadamente ligero para pruebas de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (solo decodificador), 8 capas, `d_model` 512 |
| Parametros totales | 33.366.528 (aproximadamente 33,4 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (el autor no publica versiones cuantizadas; solo se distribuyen pesos en safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`model.safetensors`) mas `config.json` y `train_log.jsonl` |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | `browndw/human-ai-parallel-corpus` |
| Tokens de entrenamiento | 39.075.840 (1x el dataset) |
| Optimizador | Sophia (aproximacion de Hessiana), lr=0,0003, betas=[0,965, 0,99], rho=0,04, weight_decay=0,2, hessian_interval=10 |
| Tokenizador | No disponible |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional: 8 capas, dimension de modelo 512 y una ventana de contexto de 256 tokens, preentrenado desde cero con el objetivo estándar de predicción del siguiente token (modelado de lenguaje causal). No se documentan innovaciones de arquitectura (no hay atención lineal, MoE, SSM ni decodificación especulativa); se trata de un bloque transformer clásico escalado a un presupuesto muy pequeño.

El elemento diferencial es el optimizador: se implementa **Sophia** desde cero, un optimizador de segundo orden que aproxima la diagonal de la Hessiana y la usa para recortar (clipping) la actualización según el parámetro `rho`, con un `hessian_interval` de 10 pasos entre estimaciones. Los hiperparámetros publicados son lr=0,0003, betas=[0,965, 0,99], rho=0,04 y weight_decay=0,2. El objetivo declarado del experimento es la comparación de optimizadores, no maximizar la calidad final del modelo. No hay constancia de fases de ajuste fino con RLHF, DPO, SFT ni instrucciones: el modelo es exclusivamente base. El repositorio incluye `train_log.jsonl`, con pérdida de validación y BLEU de test registrados cada 0,1x del dataset, lo que permite trazar la curva de convergencia.

## Capacidades

- Generacion de texto en ingles por continuación libre (next-token prediction), sin formato de instrucciones ni formato conversacional.
- Continuación corta de texto: como maximo 256 tokens de contexto de entrada mas los tokens generados.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles; util como banco de pruebas para medir perdida.
- Reproduccion de experimentos de optimizacion: el modelo y su `train_log.jsonl` permiten auditar el comportamiento de Sophia frente a otros optimizadores con el mismo dataset y arquitectura.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion ni razonamiento multi-paso.
- No tiene modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- Capacidad multilingue practicamente nula: solo se entreno con datos en ingles y no hay evaluacion en otros idiomas.
- No hay evidencia de capacidades emergentes de codigo o matematicas a este tamano y con este presupuesto de entrenamiento.

## Casos de uso

- **Investigacion sobre optimizadores de segundo orden**: el modelo sirve como punto de comparacion reproducible para medir la convergencia de Sophia frente a AdamW bajo un presupuesto fijo de 39,1 M de tokens; el `train_log.jsonl` permite reconstruir la curva de perdida cada 0,1x del dataset.
- **Pruebas de infraestructura y CI**: con 33,4 M de parametros y 0,1 GB de repositorio, se puede cargar en cualquier runner de integracion continua para validar pipelines de carga de safetensors, versionado de artefactos o empaquetado de modelos sin coste de GPU.
- **Docencia y reproduccion academica**: adecuado para que estudiantes de PLN reproduzcan de principio a fin un entrenamiento causal (tokenizacion, bucle de entrenamiento, evaluacion con perplejidad y BLEU) en una sola GPU de gama baja.
- **Banco de pruebas de cuantizacion**: al ser tan pequeno, permite experimentar con cuantizacion int8/int4 y medir el impacto en perplejidad sobre un modelo cuyo coste de inferencia es despreciable.
- **Generacion de texto de relleno en demos**: util para prototipos de interfaz que necesiten texto en ingles plausible pero no veraz, siempre que no se use en un producto final ni con usuarios reales.
- **Comparacion de corpus**: permite medir la dificultad de un corpus en ingles (por ejemplo, `browndw/human-ai-parallel-corpus`) calculando perplejidad con un modelo de referencia minimo y barato.
- **Ablaciones de hiperparametros a pequena escala**: por su tamano, es viable lanzar decenas de ejecuciones con distintas tasas de aprendizaje o intervalos de Hessiana en un solo equipo.

## Benchmarks y rendimiento

Unicamente se publican las metricas de validacion y test del propio autor. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar.

| Metrica (a 1x dataset) | Valor |
|---|---|
| Perdida de validacion | 4,3059 |
| Perplejidad de validacion | 74,14 |
| BLEU de test (continuacion greedy de 64 tokens) | 1,00 |

Advertencia sobre el dato de BLEU: un valor de 1,00 implica coincidencia perfecta con la referencia, lo que resulta anómalo en un modelo con perplejidad 74,14 y un presupuesto de entrenamiento de 39,1 M de tokens. Es probable que refleje una particularidad de la implementacion de la metrica (por ejemplo, referencias identicas a la continuacion greedy o un calculo degenerado), pero la informacion disponible no permite confirmarlo. No debe interpretarse como una capacidad real de generacion.

## Requisitos de hardware

- **VRAM para inferencia**: aproximadamente 134 MB en fp32, 67 MB en fp16/bf16, 33 MB en int8 y 17 MB en int4, solo para los pesos. Las activaciones con contexto de 256 tokens son despreciables. En la practica, menos de 1 GB de VRAM en cualquier configuracion.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 4090, RTX 3060, GTX 1650, GPUs integradas e incluso en CPU.
- **Consumer GPU**: si, cabe en cualquier GPU de consumo actual e incluso en placas integradas, Raspberry Pi o telefonos de gama media-alta mediante ejecucion en CPU.
- **Opciones de despliegue**: al usar una clase `Transformer` propia en `model_src` y no seguir la interfaz estandar de HuggingFace Transformers, no es compatible de forma directa con vLLM, TGI, llama.cpp ni Ollama. El autor documenta la carga mediante `safetensors.torch.load_model` y `model_src.config.TransformerConfig`. Para usar los runners habituales habria que convertir la arquitectura al formato de Transformers.
- **Latencia y throughput**: no disponible. No se publican mediciones; por tamano, la inferencia es del orden de microsegundos por token en cualquier GPU moderna, pero es una estimacion, no un dato medido.
- **Entrenamiento**: el entrenamiento completo es viable en una sola GPU de consumo; no se especifica hardware ni duracion en la informacion disponible.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas. La comparacion se limita, por tanto, a especificaciones y disponibilidad.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `parth12-ui/anlp-a2-optim-sophia` | 33,4 M | 256 | Ingles | No disponible | Pesos en safetensors, codigo propio en `model_src` |
| GPT-2 small | 124 M | 1024 | Ingles | Licencia MIT modificada | Transformers, ampliamente soportado |
| distilgpt2 | 82 M | 1024 | Ingles | Apache-2.0 | Transformers, ampliamente soportado |
| Pythia-70M | 70 M | 2048 | Ingles | Apache-2.0 | Transformers, con suite de checkpoints intermedios |

Frente a GPT-2 small, distilgpt2 o Pythia-70M, este modelo tiene menos parametros que los tres, una ventana de contexto entre 4 y 8 veces menor, ninguna licencia declarada y ninguna integracion con el ecosistema estandar. Su unica ventaja comparativa es el coste (0,1 GB y entrenamiento reproducible en una GPU) y el valor documental del experimento con Sophia.

## Limitaciones y advertencias

- **Modelo base, no alineado**: no ha pasado por SFT, RLHF ni DPO. No sigue instrucciones y no debe usarse como asistente conversacional.
- **Riesgo alto de alucinacion**: con 33,4 M de parametros y solo 39,1 M de tokens de entrenamiento, cualquier afirmacion factual que genere es poco fiable por construccion.
- **Contexto muy limitado**: 256 tokens, insuficiente para dialogos multi-turno, documentos largos o cualquier tarea con memoria extensa.
- **Solo ingles**: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- **Licencia no declarada**: sin licencia explicita no hay autorizacion clara para uso comercial. Se debe contactar con el autor antes de cualquier uso fuera del ambito academico.
- **Dato de BLEU no fiable**: el 1,00 reportado es inconsistente con la perplejidad y no deberia citarse como evidencia de calidad.
- **Sesgos no evaluados**: el corpus de entrenamiento no se documenta en terminos de composicion demografica ni de filtrado, y no se ha realizado ninguna evaluacion de sesgos.
- **Empaquetado no estandar**: requiere codigo propio (`model_src`) y no es cargable con `AutoModelForCausalLM`; esto complica su integracion en herramientas de produccion.
- **Sin mantenimiento**: 0 descargas y 0 likes, publicado en 2026 y actualizado 36 segundos despues de su creacion; es un artefacto de entrega de una asignatura, no un proyecto con soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-sophia
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper de referencia del optimizador Sophia (referencia externa, no incluida en la informacion del modelo): https://arxiv.org/abs/2305.14342
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos especificos de este modelo.
