# oliviabgp/scottyrl-a3-p5_textcraft_grpo

## Resumen

`oliviabgp/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` con el framework `scottyrl`, una herramienta mínima para entrenar agentes LLM con aprendizaje por refuerzo desarrollada para la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon. No se trata por tanto de un modelo fundacional, sino de un artefacto académico: un conjunto de pesos de adaptador (0,2 GB) que modifica el comportamiento del modelo base para una tarea concreta de agente.

El nombre de la ejecución, `p5_textcraft_grpo`, sugiere que el entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre un entorno de tipo TextCraft, un banco de pruebas de agentes basado en texto donde el modelo debe ejecutar acciones encadenadas para fabricar objetos a partir de materiales. La model card no explicita la configuración del entrenamiento, el volumen de datos ni la composición del dataset, y se limita a describir el procedimiento de evaluación: servir el adaptador con vLLM y ejecutar el script del curso sobre las particiones de validación medium y hard de TextCraft-Synth con `k=4`.

Su relevancia es fundamentalmente metodológica y reproducibilidad-oriented: sirve como ejemplo público de un pipeline completo de RL para agentes (entrenamiento con scottyrl, exportación de adaptador PEFT y evaluación con vLLM en modo multi-LoRA). No hay resultados de benchmarks publicados, ni licencia declarada, ni idiomas especificados, y el repositorio cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validación externa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un transformer decoder-only (modelo base `Qwen/Qwen3.5-4B`) |
| Parametros totales | No disponible para el adaptador; el modelo base se identifica como de 4B por su nombre (cifra no verificada en una ficha tecnica) |
| Longitud de contexto | No disponible (depende del modelo base, no documentada en esta ficha) |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se distribuyen en safetensors; no se documentan variantes cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Rango LoRA | 32 |
| Framework de entrenamiento | scottyrl (11-768 AI Agents, CMU), asignatura Assignment 3 |
| Nombre de ejecucion | `p5_textcraft_grpo` |
| Configuracion | `configs/p5_textcraft_grpo.yaml` |
| Commit de git declarado | `d2c2d348408fbc96470fbb1e3d6fe98536e40bb8` |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | peft |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32, no un modelo completo. La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen; esta ficha no dispone de detalles verificados sobre su numero de capas, dimensiones ocultas, mecanismo de atencion o longitud de contexto, por lo que no se replican especificaciones que no aparecen en la informacion proporcionada. El adaptador modifica los pesos del base mediante descomposicion de bajo rango, lo que permite servirlo junto al modelo original sin duplicar los 4B de parametros.

En cuanto al entrenamiento, la model card solo indica que se uso el framework `scottyrl` (presentado en el repositorio del curso como "un framework minimo para entrenar agentes LLM con aprendizaje por refuerzo") dentro de la Assignment 3 de 11-768. El sufijo `grpo` del nombre de la ejecucion apunta a un entrenamiento con Group Relative Policy Optimization, y el prefijo `textcraft` a un entorno de tipo TextCraft, pero ninguno de estos extremos se documenta de forma explicita: no se detalla el numero de tokens, el numero de episodios, la composicion del dataset, la funcion de recompensa ni si hubo fases previas de SFT. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento extendido). Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo citado seria especulativa.

## Capacidades

- Generacion de texto y razonamiento de proposito general heredados del modelo base `Qwen/Qwen3.5-4B`; el adaptador no elimina estas capacidades, pero tampoco las mejora de forma documentada.
- Ejecucion de tareas de agente en entornos de tipo TextCraft: seleccion de acciones, encadenamiento de pasos y cumplimiento de objetivos de fabricacion a partir de materiales, que es el dominio para el que fue entrenado.
- Formato de salida compatible con el script de evaluacion del curso (`scripts/evaluate_checkpoint.py`), que asume un protocolo concreto de interaccion agente-entorno.
- Integracion con vLLM en modo multi-LoRA, incluyendo `--enable-lora` y `--max-lora-rank 32`, tal como documenta el autor.
- Compatibilidad con el ecosistema PEFT/HuggingFace Transformers para carga del adaptador sobre el modelo base.
- Soporte de tool calling / function calling: no documentado especificamente para este adaptador.
- Capacidades multimodales, de vision o audio: no disponibles.
- Cobertura multilingue: no documentada; depende enteramente del modelo base.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Reproduccion de la Assignment 3 del curso 11-768: el adaptador y su configuracion (`configs/p5_textcraft_grpo.yaml`) permiten reproducir la evaluacion sobre las particiones medium y hard de TextCraft-Synth con `k=4`, comparando el resultado con el de otros companeros del curso que han publicado adaptadores equivalentes.
- Investigacion en RL para agentes: sirve como punto de partida para estudiar como afecta GRPO al comportamiento de un modelo de 4B en un entorno de acciones discretas, y para ablaciones sobre rango de LoRA, recompensa o numero de episodios reentrenando con scottyrl.
- Banco de pruebas de serving multi-LoRA con vLLM: util para validar configuraciones de `--enable-lora`, `--max-lora-rank` y enrutado por nombre de modulo en un despliegue que sirva varios adaptadores sobre el mismo modelo base, con un coste de memoria adicional muy bajo.
- Docencia y materiales de formacion: ejemplo completo y reproducible de un pipeline RL-to-deployment (entrenamiento, exportacion PEFT, servido y evaluacion) para cursos de agentes o de post-entrenamiento.
- Baseline en comparativas de adaptadores: al estar replicado por varios usuarios (`BrianUppp`, `dadelgad`, `racheleven11`), permite contrastar implementaciones del mismo ejercicio y detectar diferencias de reproduccion entre entornos.
- Pruebas de regresion de infraestructura de evaluacion: validar que un script de evaluacion de agentes mide correctamente antes de aplicarlo a adaptadores con recompensas mas altas, usando un adaptador conocido y de bajo coste computacional.
- No se recomienda su uso en produccion para atencion al cliente, generacion de codigo, analisis documental ni ninguna tarea generalista: no hay evidencia publicada de rendimiento fuera del entorno TextCraft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe unicamente el protocolo de evaluacion, sin cifras:

- Servido del adaptador: `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=oliviabgp/scottyrl-a3-p5_textcraft_grpo`.
- Evaluacion sobre la particion de validacion medium: `python scripts/evaluate_checkpoint.py --config configs/p5_textcraft_grpo.yaml --server http://localhost:8000/v1 --model a3 --k 4`.
- Evaluacion sobre la particion hard: el mismo comando anadiendo `--tasks data/textcraft_val_hard.jsonl`.

No se proporcionan valores de MMLU, HumanEval, GSM8K ni de exito en TextCraft, ni comparaciones con otros adaptadores o con el modelo base sin adaptar.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir del tamano del modelo base, no datos del autor): en bf16/fp16 los pesos de un modelo de 4B ocupan aproximadamente 8 GB, por lo que conviene reservar 12-16 GB contando cache KV y overhead del servidor.
- Cuantizacion a 8 bits: en torno a 4-5 GB de pesos; 8-10 GB de VRAM total recomendados.
- Cuantizacion a 4 bits: en torno a 2,5-3 GB de pesos; 6-8 GB de VRAM total recomendados.
- El adaptador en si anade un coste marginal: el repositorio completo ocupa 0,2 GB y el rango 32 mantiene el incremento de memoria muy por debajo de 1 GB en la mayoria de configuraciones.
- GPU profesionales: A100 (40/80 GB), H100, L40S y A10G son sobredimensionadas para el modelo base y permiten servir muchas replicas del adaptador en paralelo.
- GPU de consumo: cabe en RTX 4090 (24 GB) sin cuantizar; en RTX 4060 Ti de 16 GB y RTX 3060 de 12 GB en bf16 con contexto moderado; en GPUs de 8 GB requiere cuantizacion del base.
- Opciones de despliegue: vLLM con soporte LoRA (metodo documentado por el autor), PEFT + Transformers para carga directa del adaptador, TGI con adaptadores, y llama.cpp/Ollama solo tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oliviabgp/scottyrl-a3-p5_textcraft_grpo` | Adaptador LoRA rango 32 sobre base de 4B | No disponible | Sin datos publicados | No disponible | Publico, 0 descargas |
| `Qwen/Qwen3.5-4B` (base sin adaptar) | ~4B (segun identificador) | No disponible | No disponible en esta ficha | No disponible en esta ficha | Publico en HuggingFace |
| `BrianUppp/scottyrl-a3-p5_textcraft_grpo` | Replica del mismo adaptador | No disponible | Sin datos publicados | No disponible | Publico |
| `dadelgad/scottyrl-a3-p5_textcraft_grpo` | Replica del mismo adaptador | No disponible | Sin datos publicados | No disponible | Publico |
| `racheleven11/scottyrl-a3-p5_textcraft_grpo` | Replica del mismo adaptador (con endpoint en FriendliAI) | No disponible | Sin datos publicados | No disponible | Publico |

Las tres entradas adicionales corresponden a copias del mismo ejercicio publicadas por otros usuarios, no a alternativas tecnicas independientes. No se dispone de informacion sobre adaptadores comparables de otros frameworks o de modelos de agentes de tamano similar con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial; hay que contactar con el autor o asumir el marco licencial del modelo base.
- Ausencia total de validacion externa: cero descargas y cero likes, sin resultados de benchmarks ni informe de evaluacion publicado. No hay evidencia de que el adaptador funcione mejor que el modelo base.
- Especializacion estrecha: entrenado para un entorno de tipo TextCraft; es esperable un deterioro del comportamiento generalista y del seguimiento de instrucciones fuera de ese dominio, aunque no se ha medido.
- Riesgo de alucinacion y de adherencia al formato: en tareas de agente, un fallo de formato en la accion rompe el episodio completo; el autor no documenta tasas de acciones invalidas.
- Informacion de entrenamiento opaca: no se especifican datos, recompensas, hiperparametros ni duracion, lo que impide auditar sesgos o reproducir el resultado con fidelidad.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en lenguas distintas de las mayoritarias del modelo base.
- Dependencia estricta del modelo base: el adaptador solo es valido sobre `Qwen/Qwen3.5-4B`; cargarlo sobre otra version o sobre un checkpoint cuantizado de forma agresiva puede degradar el resultado.
- Higiene de publicacion: la model card incluye una ruta local de Windows (`C:\Users\olivi\...`) y un commit de git, lo que sugiere una exportacion sin revision previa; conviene tratar el contenido como material de curso, no como release de calidad.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni seguridad.
- No apto para produccion sin evaluacion propia: cualquier despliegue real deberia ir precedido de una bateria de pruebas en el dominio objetivo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/oliviabgp/scottyrl-a3-p5_textcraft_grpo
- Replica de BrianUppp: https://huggingface.co/BrianUppp/scottyrl-a3-p5_textcraft_grpo
- Replica de dadelgad: https://huggingface.co/dadelgad/scottyrl-a3-p5_textcraft_grpo
- Endpoint y ficha en FriendliAI (replica de racheleven11): https://friendli.ai/models/racheleven11/scottyrl-a3-p5_textcraft_grpo
- Repositorio del curso con el framework scottyrl (README de CMU_AI_AGENTS_A3): https://github.com/ShantanuShastri7/CMU_AI_AGENTS_A3/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
