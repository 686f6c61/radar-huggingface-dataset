# fdsffjdkf/ClearTrans-3B-SFT-C-to-Java

## Resumen

ClearTrans-3B-SFT-C-to-Java es un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen/Qwen2.5-Coder-3B, especializado en la traduccion de codigo fuente de C a Java. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, un proyecto de traduccion automatica de codigo entre lenguajes. El modelo resuelve un problema concreto: automatizar la migracion de bases de codigo legacy en C hacia Java, una tarea habitual en modernizacion de sistemas.

Arquitectura transformer decoder-only de la familia Qwen2, con 3.085.938.688 parametros totales (aproximadamente 3B). El contexto maximo heredado de Qwen2.5-Coder-3B no se explicita en la model card, por lo que no se confirma en esta ficha. El repositorio ocupa 6,8 GB en safetensors.

Es relevante ahora porque los modelos especializados en traduccion entre lenguajes (code translation) reducen el esfuerzo manual de migracion y permiten integrar la conversion en pipelines de CI. No obstante, se trata de una publicacion de pesos sin validacion de inferencia en GPU ni reproduccion de benchmarks, segun declara el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (orientado a codigo; C y Java como lenguajes fuente y destino) |
| Licencia | qwen-research (Qwen Research License Agreement), uso no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full SFT) sobre Qwen2.5-Coder-3B, un transformer decoder-only con atencion causal. La metadata de entrenamiento registra Transformers 4.57.1 y PyTorch 2.9.1, learning rate 1e-05, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno, 3 epocas, batch total de 64 (batch 1 por dispositivo, 8 dispositivos, 8 pasos de acumulacion) y semilla 42. El dataset identificado es `train_full_1231_c2java_idx3`, especifico de la direccion C a Java; los ejemplos de entrenamiento no se incluyen en el repositorio.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El autor aclara que la metadata identifica la etapa como SFT y no establece que se trate de un checkpoint final entrenado con GRPO. La release ha superado comprobaciones de tamano de fichero, disposicion de tensores e indices de shards, pero no se ha validado la inferencia en GPU ni la reproduccion de benchmarks.

## Capacidades

- Traduccion de codigo de C a Java como tarea principal y unica direccion declarada.
- Generacion de codigo y text-to-code heredada del modelo base Qwen2.5-Coder-3B.
- Conversacion multi-turno mediante la plantilla de chat incluida en el checkpoint.
- Razonamiento sobre estructuras de codigo (funciones, tipos, control de flujo) para producir equivalentes en Java.
- Soporte de tool calling / function calling: no confirmado en la model card.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues naturales: no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Migracion de modulos legacy de C a Java: el modelo recibe funciones o ficheros C y devuelve su equivalente Java, reduciendo el trabajo manual en proyectos de modernizacion de sistemas embebidos o utilidades de sistema.
- Prototipado rapido de traducciones en pipelines de CI: se puede invocar el modelo para generar una primera version Java de un modulo C y pasarla despues por tests unitarios y herramientas de analisis estatico.
- Generacion de borradores para revision humana: el modelo produce traducciones que un ingeniero revisa y corrige, acelerando la revision al partir de una base funcional.
- Creacion de conjuntos de pares C-Java para documentacion tecnica: util para generar ejemplos de equivalencia entre ambos lenguajes en guias de migracion.
- Evaluacion comparativa de estrategias de traduccion de codigo: sirve como linea base SFT frente a checkpoints posteriores (por ejemplo, entrenados con GRPO) del mismo proyecto ClearTrans.
- Investigacion en traduccion automatica de codigo: permite estudiar el comportamiento de un modelo de 3B especializado en una direccion concreta sin depender de APIs propietarias.
- Educacion y formacion: generar ejemplos de como se implementa en Java una construccion concreta de C para materiales docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la reproduccion en GPU no ha sido validada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 6-7 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB; en 4 bits: aproximadamente 2-2,5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; RTX 4090 o RTX 3090 para desarrollo e inferencia en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores), y en 4-6 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (version compatible con 4.57.1), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-C-to-Java | 3,09B | no disponible | Traduccion C a Java | qwen-research (no comercial) | HuggingFace |
| Qwen2.5-Coder-3B (base) | 3,09B | 32.768 tokens (segun model card upstream) | Generacion de codigo general | Apache-2.0 | HuggingFace |
| Qwen2.5-Coder-7B | ~7,6B | 32.768 tokens (segun model card upstream) | Generacion de codigo general | Apache-2.0 | HuggingFace |

El checkpoint ClearTrans hereda el tamano del base pero restringe su licencia a uso no comercial y no publica benchmarks propios. Frente a Qwen2.5-Coder-3B, la ventaja es la especializacion en la direccion C a Java; la desventaja es la perdida de generalidad y la licencia mas restrictiva.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validarlas con tests y herramientas de analisis antes de usarlas.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni resultados de evaluacion historicos; es una release de pesos, no una reproduccion numerica completa.
- La inferencia en GPU y la reproduccion de benchmarks no han sido validadas por el autor.
- Licencia qwen-research: uso limitado a investigacion y evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0.
- Riesgo de alucinacion en APIs, librerias o construcciones de Java no presentes en el entrenamiento.
- Solo se declara la direccion C a Java; no se garantiza calidad en otras direcciones ni en otros lenguajes.
- Idiomas naturales soportados no documentados.
- Longitud de contexto no confirmada en la model card de este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-C-to-Java
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio del proyecto ClearTrans: https://github.com/Xingzhehu/ClearTrans
- Licencia (Qwen Research License Agreement): incluida en el repositorio como LICENSE
- Aviso de atribucion y modificaciones: incluido en el repositorio como NOTICE
