# fdsffjdkf/ClearTrans-3B-SFT-C-to-Cpp

## Resumen

ClearTrans 3B SFT C-to-Cpp es un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen/Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de C a C++. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta en el repositorio de GitHub de Xingzhehu/ClearTrans. El modelo se distribuye como pesos completos en formato safetensors, con tokenizer y plantilla de chat incluidas, y esta pensado para investigacion sobre traduccion automatica de codigo entre lenguajes.

La relevancia del checkpoint es acotada y muy especifica: no es un modelo generalista, sino una pieza de un pipeline de investigacion sobre traduccion C a C++. El autor advierte explicitamente de que el checkpoint corresponde a la etapa SFT y no a un modelo final entrenado con GRPO, y de que no se le atribuye ninguna puntuacion de benchmark del manuscrito asociado. Ademas, la validacion realizada cubre solo el tamano de los ficheros, la disposicion de los tensores y los indices de los shards; la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

El modelo hereda la arquitectura y el conocimiento de codigo de Qwen2.5-Coder-3B, un transformer decoder-only de 3B parametros, pero su uso previsto es estrecho: recibir codigo C y generar su equivalente en C++. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo sobre Qwen2.5-Coder-3B |
| Parametros totales | 3B (aproximadamente; el campo safetensors del repo indica 241.664, dato inconsistente con el modelo base y el tamano del repo de 6,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial para investigacion o evaluacion) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino completo (full fine-tuning) de Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2 con 3B parametros. No se trata de un modelo MoE ni de una arquitectura hibrida: la model card no describe ninguna modificacion estructural respecto al modelo base, solo la sustitucion de los pesos mediante SFT. El entrenamiento se realizo con Transformers 4.57.1 y PyTorch 2.9.1, en configuracion multi-GPU con 8 dispositivos, batch total de 64 (batch por dispositivo 1 con 8 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno, learning rate 1e-05, 3 epocas y semilla 42.

El dataset de entrenamiento se identifica como `train_full_1231_c2cpp_idx3`, especifico de la direccion C a C++, pero los ejemplos no se incluyen en el repositorio y el autor advierte de que el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion del dataset. No se documenta el numero de tokens de entrenamiento, la composicion del corpus ni si hubo etapas de RLHF o DPO; de hecho, el autor aclara que este checkpoint no es el resultado final del entrenamiento con GRPO. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de codigo de C a C++: es la unica capacidad para la que el checkpoint ha sido ajustado de forma especifica.
- Generacion de texto y codigo: hereda la capacidad base de Qwen2.5-Coder-3B para generar codigo, aunque el ajuste fino puede haber estrechado su distribucion hacia la tarea de traduccion.
- Formato conversacional: incluye plantilla de chat y tokenizer, por lo que puede invocarse con la API de `transformers` en modo conversacional.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Migracion asistida de bases de codigo C a C++: el modelo puede recibir funciones o ficheros C y generar una propuesta de equivalente C++ que un ingeniero revise antes de integrarla. Es adecuado porque ha sido ajustado exclusivamente en esa direccion, aunque requiere validacion manual por la advertencia del autor sobre errores funcionales.
- Investigacion en traduccion automatica de codigo: sirve como checkpoint de referencia para reproducir o comparar experimentos de SFT en la direccion C a C++ dentro del artefacto ClearTrans.
- Generacion de borradores para modernizacion de legado: en proyectos con codigo C antiguo, el modelo puede producir borradores C++ que aceleren la reescritura, siempre que se acompanen de tests.
- Creacion de pares de entrenamiento y evaluacion: util para generar traducciones candidatas que luego se filtren con herramientas de analisis estatico y tests unitarios.
- Docencia y demostraciones: permite ilustrar diferencias idiomaticas entre C y C++ a partir de ejemplos traducidos, con revision posterior por parte del instructor.
- Pipeline de CI con validacion automatica: integrado en un flujo que compile y ejecute tests sobre la salida, el modelo puede pregenerar traducciones que se acepten solo si pasan las comprobaciones, dado que el autor recomienda evaluar las salidas con las herramientas previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 3B en fp16 se puede estimar un orden de magnitud de 6-7 GB de pesos, pero esta cifra no procede de la model card y debe tratarse como orientativa.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 8 GPUs, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada por el autor; no se ha validado la inferencia en GPU para esta release.
- Opciones de despliegue: la model card solo documenta carga con `transformers` (`AutoModelForCausalLM` y `AutoTokenizer` con `torch_dtype="auto"` y `device_map="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-C-to-Cpp | 3B | no disponible | Traduccion C a C++ (SFT) | Qwen Research (no comercial) | Pesos safetensors en HF |
| Qwen2.5-Coder-3B (base) | 3B | no disponible en esta ficha | Codigo generalista | Qwen Research / Apache-2.0 segun variante | HF |
| Otros checkpoints ClearTrans | no disponible | no disponible | Otras direcciones de traduccion | Qwen Research | Repositorio ClearTrans en GitHub |

La comparacion con alternativas de la misma categoria (traduccion de codigo C a C++) no esta disponible en la informacion proporcionada: no se han encontrado en la model card referencias a modelos comparables ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor advierte de que las traducciones generadas pueden contener errores funcionales y code smells; deben validarse con tests y herramientas de analisis antes de usarse.
- El checkpoint corresponde a la etapa SFT y no es un modelo final entrenado con GRPO; no se le atribuye ninguna puntuacion de benchmark.
- La validacion de la release se limita a tamano de ficheros, disposicion de tensores e indices de shards; la inferencia en GPU y la reproduccion de benchmarks no han sido validadas.
- No se incluyen datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una release de pesos, no una reproduccion numerica completa de los experimentos.
- La licencia Qwen Research License Agreement restringe el uso a investigacion o evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0.
- El campo de parametros totales del repo safetensors (241.664) es inconsistente con un modelo de 3B y con el tamano del repo (6,2 GB), lo que conviene verificar antes de confiar en los metadatos.
- No hay informacion sobre sesgos, riesgo de alucinacion especifico, cobertura idiomatica ni limitaciones de contexto mas alla de las heredadas del modelo base.
- El modelo tiene una unica direccion de traduccion (C a C++); no se debe esperar un comportamiento generalista de traduccion entre lenguajes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-C-to-Cpp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Licencia Qwen Research: incluida en el fichero LICENSE del repositorio del modelo
- NOTICE con atribucion y declaracion de modificaciones: incluido en el repositorio del modelo
