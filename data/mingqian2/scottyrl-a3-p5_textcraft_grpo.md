# mingqian2/scottyrl-a3-p5_textcraft_grpo

## Resumen

`mingqian2/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo publica el usuario `mingqian2` como entregable del Assignment 3 del curso 11-768 (AI Agents) de la CMU, dentro del marco de trabajo denominado scottyrl. No se trata por tanto de un modelo fundacional, sino de un ajuste fino ligero orientado a una tarea concreta: la resolución de entornos agénticos de tipo TextCraft, en su variante sintetica TextCraft-Synth.

El interes tecnico del artefacto es doble. Por un lado, documenta un pipeline de entrenamiento con GRPO (Group Relative Policy Optimization) sobre un modelo de ~4 mil millones de parametros, un enfoque de RL que se ha popularizado para mejorar el razonamiento y la toma de decisiones en agentes. Por otro, la model card describe explicitamente el protocolo de evaluacion: el adaptador se sirve con vLLM mediante `--enable-lora --max-lora-rank 32` y se evalua con un script del curso sobre las particiones de validacion medium y hard de TextCraft-Synth con `k=4`.

Es relevante ahora como referencia reproducible de RL aplicado a agentes con presupuesto de computo reducido, y como ejemplo de publicacion de adaptadores PEFT (no pesos completos) que se pueden montar sobre el modelo base en un servidor vLLM compartido. La informacion publica es escasa: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 32 sobre un transformer denso `Qwen/Qwen3.5-4B`; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | Modelo base: aproximadamente 4 mil millones (segun la denominacion `Qwen3.5-4B`); el adaptador no publica recuento de parametros (repo de 0,2 GB en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA, para cuantizar hay que fusionarlo con el modelo base y convertir el resultado (procedimiento no documentado por el autor) |
| Idiomas soportados | No disponible (los del modelo base, sin declaracion explicita) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

Otros datos: `library_name: peft`, tags `tinker`, `lora`, `scottyrl`, `11-768`, `region:us`; creado el 2026-10-27; tamano del repo 0,2 GB; commit git declarado `88d1b1fa2aea58938d6d251847ce5559c4ac6558`; configuracion de entrenamiento `configs/p5_textcraft_grpo.yaml`; `run_name: p5_textcraft_grpo`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde `/weka/oe-adapt-default/mingqianz/assignment-3/runs/p5_adapter` y entrenado con el framework scottyrl. La model card no especifica que modulos del transformer se adaptan (q/k/v/o, MLP, etc.), ni el alpha, ni el dropout, ni el numero de tokens o episodios vistos durante el entrenamiento. Tampoco detalla la composicion del dataset: solo se indica que la evaluacion se realiza sobre TextCraft-Synth, en las particiones de validacion medium y hard.

El sufijo `grpo` del `run_name` indica que el ajuste se hizo con Group Relative Policy Optimization, un algoritmo de RL sin modelo critico que estima la ventaja a partir de la recompensa relativa de un grupo de muestras generadas para el mismo prompt. Es un esquema habitual en tareas agénticas con recompensa verificable (entornos de crafting con recetas y objetivos), aunque la informacion proporcionada no incluye la funcion de recompensa, el numero de pasos, el tamano de grupo ni la configuracion de decodificacion usada en el muestreo. No se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal, modos de pensamiento) mas alla del propio esquema de RL.

## Capacidades

- Ejecucion de tareas agénticas de tipo TextCraft: el adaptador esta entrenado para el entorno TextCraft-Synth, donde el agente debe adquirir recursos, combinar ingredientes y completar objetivos encadenando acciones.
- Razonamiento multi-paso con planificacion implicita: el entrenamiento con GRPO busca mejorar la seleccion de acciones a lo largo de episodios, no solo la respuesta de un turno.
- Generacion de texto y seguimiento de instrucciones heredados del modelo base Qwen3.5-4B (no verificados de forma independiente en esta ficha).
- Integracion con vLLM como modulo LoRA nombrado (`--lora-modules a3=...`), lo que permite servirlo junto al modelo base sin duplicar pesos completos.
- Capacidad multilingue: no disponible (no declarada).
- Soporte de tool calling / function calling: no disponible como capacidad declarada del adaptador; el entorno TextCraft se comporta como un entorno de acciones, pero no se documenta un esquema formal de function calling.
- Vision, audio o modo de pensamiento explicito: no disponible.

## Casos de uso

- Investigacion en RL para agentes: reproducir o comparar el efecto de GRPO sobre un modelo de 4B en un entorno de recompensa verificable, sirviendo el adaptador con vLLM y ejecutando el script de evaluacion del curso con `--k 4`.
- Evaluacion de entornos TextCraft-Synth: usar el adaptador como baseline ajustado frente al modelo base en las particiones medium y hard, midiendo la tasa de exito por episodio.
- Docencia y cursos de agentes: el artefacto sirve como ejemplo completo de pipeline (config YAML, run name, commit, protocolo de evaluacion) para asignaturas de agentes de IA.
- Servicio multi-adaptador en produccion interna: vLLM permite cargar varios LoRA sobre el mismo `Qwen/Qwen3.5-4B` base con `--enable-lora --max-lora-rank 32`, de modo que un unico despliegue atiende distintas tareas especializadas segun el campo `model` de la peticion.
- Experimentacion con presupuesto de GPU ajustado: al ser un adaptador de 0,2 GB sobre un base de ~4B, permite iterar en una sola GPU de consumo sin reentrenar ni redistribuir pesos completos.
- Analisis de robustez de agentes: comparar el comportamiento en validacion medium frente a hard para detectar sobreajuste a la dificultad de los episodios de entrenamiento.
- Base para posteriores ajustes: partir de este adaptador como inicializacion en nuevas rondas de GRPO sobre variantes del entorno TextCraft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el procedimiento de evaluacion, sin cifras:

- Servicio del adaptador: `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=mingqian2/scottyrl-a3-p5_textcraft_grpo`
- Evaluacion estandar: `python scripts/evaluate_checkpoint.py --config configs/p5_textcraft_grpo.yaml --server http://localhost:8000/v1 --model a3 --k 4`
- Evaluacion en dificultad alta: el mismo comando anadiendo `--tasks data/textcraft_val_hard.jsonl`

No hay datos de MMLU, HumanEval, GSM8K ni de tasa de exito en TextCraft-Synth.

## Requisitos de hardware

- VRAM para inferencia del modelo base en bf16/fp16: aproximadamente 8-9 GB solo para pesos de un modelo de ~4B, mas cache KV; en la practica, entre 16 y 24 GB para contexto moderado y lote pequeno.
- VRAM adicional del adaptador: despreciable frente al base (repo de 0,2 GB); vLLM lo carga como modulo LoRA sobre el mismo espacio de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para servir con concurrencia y contexto largo; L40S o RTX 4090 (24 GB) para desarrollo y evaluacion individual.
- GPU de consumo: si en bf16, una RTX 4090 de 24 GB es suficiente; en tarjetas de 12-16 GB (RTX 4070 Ti, 4080, 3080 Ti) conviene recurrir a cuantizacion del modelo fusionado (por ejemplo 4 bits), asumiendo perdida de calidad no medida.
- Despliegue: vLLM es la via documentada por el autor (soporte nativo de LoRA con `--enable-lora` y `--max-lora-rank 32`). Alternativas para el modelo fusionado: llama.cpp/Ollama con GGUF o TGI, aunque el procedimiento de fusion y conversion no esta documentado en la model card.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r32 sobre ~4B | No disponible | GRPO sobre TextCraft-Synth | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | No disponible en esta ficha | Modelo fundacional sin ajuste | Segun el modelo base | Publico en HuggingFace |
| Otros adaptadores LoRA de la misma asignatura | No disponible | No disponible | LoRA sobre Qwen3.5-4B para tareas de agente | No disponible | No identificados en la informacion disponible |

No se dispone de datos numericos ni de fichas de adaptadores comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- Especializacion estrecha: el adaptador esta entrenado para TextCraft-Synth; fuera de ese tipo de entorno es probable que su ventaja frente al modelo base sea nula o negativa.
- Sin resultados publicados: no hay cifras de calidad, y el protocolo de evaluacion depende de scripts y ficheros de datos del curso (`scripts/evaluate_checkpoint.py`, `data/textcraft_val_hard.jsonl`) que no forman parte del repositorio del modelo.
- Riesgo de sobreajuste al formato de evaluacion: al haberse desarrollado contra particiones de validacion concretas con `k=4`, el rendimiento puede no generalizar a otros entornos, longitudes de episodio o funciones de recompensa.
- Sesgos: no documentados. Al heredar el modelo base y anadir un ajuste con RL sobre un unico dominio, los sesgos del base persisten y pueden amplificarse en el dominio entrenado.
- Alucinacion: en entornos agénticos se manifiesta como acciones invalidas o combinaciones de recetas inexistentes; no hay evaluacion publicada de esta tasa de error.
- Idiomas: no declarados; el ajuste se ha hecho sobre un entorno en ingles presumiblemente, por lo que el comportamiento en castellano no esta verificado.
- Limitaciones de contexto: no se especifica la ventana soportada ni como afecta el adaptador a secuencias largas.
- Trazabilidad limitada: el autor referencia rutas internas (`/weka/oe-adapt-default/...`) y una configuracion YAML que no se incluye en la informacion disponible, lo que dificulta la reproduccion exacta del entrenamiento.
- Madurez: publicacion con 0 descargas y 0 likes, sin validacion de la comunidad; conviene tratarla como artefacto de investigacion, no como componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mingqian2/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de vLLM sobre LoRA: no disponible en la informacion proporcionada
- Paper o blog del framework scottyrl: no disponible
- Repositorio del curso 11-768 (AI Agents, CMU): no disponible
- Demo o espacio interactivo: no disponible
