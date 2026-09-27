# Eternity5551/Qwen3-1.7B-Python-Code-Full-SFT

## Resumen

Qwen3-1.7B-Python-Code-Full-SFT es un checkpoint experimental publicado por el usuario Eternity5551 que consiste en un ajuste fino supervisado completo (full SFT, sin adaptadores de bajo rango) del modelo base Qwen/Qwen3-1.7B-Base para completar funciones en Python. No es un asistente conversacional: se ha entrenado con prompts crudos de código, no con plantillas de chat, por lo que se comporta como un modelo de autocompletado de tipo base. El objetivo declarado es didáctico y de investigación: medir cuánto mejora la resolución de problemas de función en Python al aplicar full SFT sobre el mismo modelo base.

El modelo tiene 1.720.574.976 parámetros (aproximadamente 1,72 B) y se distribuye en formato safetensors dentro de un repositorio de 3,5 GB. El entrenamiento se hizo con 26.805 ejemplos de entrenamiento y 1.386 de validación, extraídos de un fragmento fijo de 100.000 filas del dataset NVIDIA OpenCodeInstruct, durante una única época en una sola GPU RTX 4090 con precisión bf16 y longitud máxima de secuencia de 1.024 tokens.

Su relevancia es doble: por un lado, demuestra una mejora medible y reproducible en HumanEval+ (de 18,9 % a 40,9 % de pass@1 estricto) sobre un modelo de menos de 2.000 millones de parámetros; por otro, publica el contrato de evaluación, el bloqueo de datos y los resultados por tarea en un repositorio público, lo que lo convierte en un caso de estudio útil para quien quiera replicar un pipeline de post-entrenamiento en una sola GPU de consumo. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens de longitud máxima de secuencia durante el SFT; el modelo base Qwen3-1.7B declara 32.768 tokens nativos segun la documentacion oficial de Qwen3 (dato no incluido en la model card de este checkpoint) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors, bf16); convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo Transformers fragmentado, repo de 3,5 GB) |
| Tamano del repositorio | 3,5 GB |
| Revision del modelo base | Qwen/Qwen3-1.7B-Base, revision ea980cb0a6c2ae4b936e82123acc929f1cec04c1 |
| Dataset de entrenamiento | nvidia/OpenCodeInstruct (CC BY 4.0), fragmento fijo de 100.000 filas; 26.805 ejemplos de entrenamiento y 1.386 de validacion |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B-Base: un transformer decoder-only denso con normalizacion RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y atencion por consultas agrupadas (GQA), en la linea de la familia Qwen3 de Alibaba Cloud. Sobre esa base no se ha introducido ninguna modificacion estructural; el checkpoint es un modelo Transformers estandar con tokenizer propio, cargable directamente con `from_pretrained`.

El entrenamiento consistio en full SFT con una sola epoca, 1.676 pasos de optimizador, tamano de lote efectivo 16, precision bf16, longitud maxima de secuencia de 1.024 tokens y tasa de aprendizaje 2e-5, ejecutado en una unica RTX 4090. Un detalle metodologico relevante es que la funcion de perdida se calcula unicamente sobre la completacion de codigo, no sobre el prompt. El checkpoint final se selecciono por perdida de validacion (mejor valor: 0,14692), no por puntuacion en benchmarks publicos. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores, ni innovaciones de inferencia como decodificacion especulativa.

## Capacidades

- Completado de funciones Python a partir de un prompt crudo de codigo (docstring o firma de funcion), sin plantilla de chat ni turnos de conversacion.
- Generacion de codigo Python en el estilo del dataset OpenCodeInstruct: implementaciones de funciones, utilidades y fragmentos de logica.
- Razonamiento sobre especificaciones en lenguaje natural escritas en ingles dentro del propio comentario o docstring.
- Cobertura de tareas de nivel HumanEval+ y MBPP+ con pass@1 estricto: 67/164 y 229/378 respectivamente.
- Capacidades multilingues: no soportadas de forma declarada; el unico idioma de la model card es el ingles.
- Tool calling / function calling: no disponible ni documentado.
- Uso como agente o razonamiento multi-paso: no disponible ni documentado; el modelo no esta ajustado para seguir instrucciones conversacionales.
- Modo "thinking" o razonamiento explicito: no disponible en este checkpoint.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Autocompletado de funciones Python en el editor: el modelo acepta un docstring o una firma de funcion como prompt crudo y devuelve la implementacion, lo que encaja con flujos de tipo FIM simplificado o de generacion bajo demanda en un IDE. Es su caso de uso principal y el unico evaluado formalmente.
- Baseline de investigacion en post-entrenamiento: sirve como referencia reproducible para comparar full SFT frente a LoRA SFT (existe una variante LoRA del mismo autor) sobre un presupuesto de una sola GPU de 24 GB.
- Generacion de borradores de funciones auxiliares en proyectos pequenos: tareas como validacion de entradas, parsing de cadenas, transformaciones de listas o utilidades matematicas, donde el desarrollador revisa y corrige el resultado.
- Creacion de casos de prueba iniciales: a partir de la firma de una funcion se puede pedir al modelo el cuerpo y usar despues ese codigo como material de partida para escribir tests unitarios manuales o revisados.
- Docencia y formacion en fine-tuning: el repositorio asociado incluye datos bloqueados, contrato de evaluacion y resultados por tarea, lo que permite usarlo como ejercicio completo de SFT, evaluacion con EvalPlus y analisis de resultados en un curso o laboratorio.
- Prototipado de pipelines de evaluacion de codigo: el modelo y su configuracion de inferencia (greedy, maximo 512 tokens nuevos, contenedor Docker restringido) permiten montar y probar arneses de evaluacion tipo HumanEval+/MBPP+ sin depender de modelos grandes.
- Despliegue en entornos con recursos muy limitados: con cuantizacion de 4 bits el modelo ocupa alrededor de 1 GB, por lo que puede ejecutarse en portatiles o equipos sin GPU dedicada para tareas de sugerencia de codigo offline.
- Filtrado o preclasificacion de codigo generado: como generador barato en una cascada, donde un modelo mayor revisa despues las completaciones que superan ciertos criterios.

## Benchmarks y rendimiento

Datos publicados en la model card, con pass@1 estricto (deben pasar tanto los tests originales como los Plus), una completacion greedy por tarea, maximo 512 tokens nuevos y misma bateria congelada de tareas para todas las etapas.

| Benchmark | Qwen3-1.7B-Base | Este modelo (Full SFT) |
|---|---:|---:|
| HumanEval+ v0.1.10 | 31/164 (18,9 %) | 67/164 (40,9 %) |
| MBPP+ v0.2.0 | 214/378 (56,6 %) | 229/378 (60,6 %) |

Mejora absoluta: +21,9 puntos porcentuales en HumanEval+ (mas del doble de tareas resueltas) y +4,0 puntos en MBPP+. Perdida de validacion final: 0,14692. No se han publicado otros resultados de benchmarks (MMLU, GSM8K, tareas multilingues o de chat) en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 3,5 GB solo de pesos, mas cache KV y activaciones; en la practica entre 4 y 6 GB segun longitud de contexto y tamano de lote.
- VRAM en int8: alrededor de 1,8 GB de pesos, con un pico de 2,5 a 3 GB.
- VRAM en 4 bits (Q4_K_M): aproximadamente 1,1 GB de pesos y unos 2 GB en ejecucion.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4060 8 GB, RTX 2070 8 GB e incluso en tarjetas de 4-6 GB si se cuantiza a 4 bits. Para lotes grandes o contextos largos conviene una GPU con mas memoria.
- GPU de datacenter: A100, H100 o L40S para servir con concurrencia alta; el modelo es demasiado pequeno para necesitarlas en inferencia de un solo usuario.
- Entrenamiento: el full SFT se completo en una unica RTX 4090 (24 GB) con bf16, lote efectivo 16 y secuencia de 1.024 tokens, lo que confirma que el ajuste fino completo cabe en hardware de gama alta de consumo.
- Opciones de despliegue: transformers de forma nativa (es el formato publicado), text-generation-inference (la model card incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang para servir a mayor throughput. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publica una version GGUF de este checkpoint; Ollama ofrece `qwen3:1.7b`, que es el modelo base, no este ajuste.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento conocido |
|---|---|---|---|---|---|
| Este modelo (Full SFT) | 1,72 B | 1.024 tokens en SFT; 32.768 nativos del base segun Qwen3 | apache-2.0 | safetensors en HuggingFace | HumanEval+ 40,9 %; MBPP+ 60,6 % |
| Qwen/Qwen3-1.7B-Base | 1,72 B | 32.768 tokens segun la documentacion de Qwen3 | apache-2.0 | safetensors en HuggingFace | HumanEval+ 18,9 %; MBPP+ 56,6 % (medido en la misma bateria) |
| Eternity5551/Qwen3-1.7B-Python-Code-LoRA-SFT | 1,72 B + adaptador LoRA | no disponible | apache-2.0 | adaptador LoRA sobre la revision fijada del base | no disponible en la informacion proporcionada |
| Qwen/Qwen3-1.7B (instruct) | 1,72 B | 32.768 tokens segun la documentacion de Qwen3 | apache-2.0 | safetensors y otras integraciones | no disponible en la informacion proporcionada |

Nota: el modelo no se compara con alternativas de otros desarrolladores (por ejemplo, modelos de codigo de ~1-2 B parametros) porque no hay resultados de benchmarks de esos modelos en la informacion disponible; los unicos datos medidos en la misma bateria corresponden al modelo base y a este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint de aprendizaje, no un asistente de codigo de nivel de produccion; asi lo declara explicitamente el autor.
- No esta ajustado para conversacion: no dispone de plantilla de chat y espera prompts crudos de codigo. Usarlo con formato de dialogo degradara la calidad.
- Riesgo de alucinacion alto: puede generar llamadas a funciones inexistentes, APIs inventadas o logica sintacticamente valida pero incorrecta. La evaluacion mide funciones aisladas, no ingenieria de software real.
- Solo ingles declarado; no hay garantia de comportamiento en castellano ni en otros idiomas.
- Ausencia de alineacion de seguridad documentada: al derivar de un modelo base sin RLHF/DPO, puede reproducir patrones de codigo inseguros o contenido no filtrado.
- Cobertura de evaluacion limitada: 164 tareas de HumanEval+ y 378 de MBPP+. El propio autor advierte que dos soluciones de referencia de los benchmarks oficiales fallaron sus propios tests en su entorno, y que el filtrado de solapamiento de prompts no elimina todos los duplicados semanticos, por lo que las cifras no deben extrapolarse a trabajo real.
- Longitud de contexto efectiva reducida: el entrenamiento se hizo con secuencias de 1.024 tokens, por lo que el rendimiento con prompts largos no esta garantizado aunque el modelo base soporte ventanas mayores.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el dataset de origen (NVIDIA OpenCodeInstruct) es CC BY 4.0 y exige atribucion; conviene revisar las condiciones de los datos derivados antes de un uso comercial.
- Modelo con cero descargas y cero "likes" en el momento de redactar la ficha: no existe validacion por parte de la comunidad ni reportes independientes.
- No hay publicadas versiones cuantizadas, plantillas de chat ni soporte oficial de tool calling; cualquier integracion en produccion exigiria trabajo adicional de conversion, evaluacion y salvaguardas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eternity5551/Qwen3-1.7B-Python-Code-Full-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Variante LoRA del mismo autor: https://huggingface.co/Eternity5551/Qwen3-1.7B-Python-Code-LoRA-SFT
- Repositorio del laboratorio de post-entrenamiento: https://github.com/lbw-work/qwen3-code-posttraining-lab
- Contrato de evaluacion y resultados por tarea: https://github.com/lbw-work/qwen3-code-posttraining-lab/blob/main/docs/sft-comparison.md
- Bloqueo de datos (data lock): https://github.com/lbw-work/qwen3-code-posttraining-lab/blob/main/data/sft.lock.json
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Modelo Qwen3-1.7B (instruct) en HuggingFace: https://huggingface.co/Qwen/Qwen3-1.7B
- Pagina de Qwen3 1.7B en Ollama (modelo base): https://ollama.com/library/qwen3:1.7b
