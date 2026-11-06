# fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-Java

## Resumen

ClearTrans-3B-SFT-Cpp-to-Java es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-3B, publicado por el usuario fdsffjdkf como parte del artefacto ClearTrans. El modelo esta especializado en una unica direccion de traduccion de codigo: convertir codigo fuente C++ en codigo Java. Frente al modelo base, que es un generador de codigo generalista, este checkpoint concentra su capacidad en una tarea concreta de traduccion entre lenguajes, lo que lo hace util para pipelines de migracion de codebases legacy.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-Coder-3B, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones) y pesos en formato safetensors. El repositorio ocupa 6,8 GB, coherente con pesos en precision completa o bf16. La licencia es la Qwen Research License Agreement, lo que restringe el uso a investigacion y evaluacion no comercial.

La relevancia de este checkpoint es acotada pero especifica: no se han publicado resultados de benchmarks reproducidos, la validacion de inferencia en GPU no esta confirmada y el propio autor advierte que las traducciones generadas pueden contener errores funcionales. Se trata, por tanto, de un release de pesos para experimentacion, no de una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-Coder-3B |
| Parametros totales | 3.085.938.688 (aprox. 3,09 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B, valor concreto no confirmado) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la tarea es traduccion de codigo C++ a Java) |
| Licencia | Qwen Research License Agreement (license: other, license_name: qwen-research); uso no comercial |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-Coder-3B, un transformer decoder-only con atencion causal estandar, y se obtiene mediante ajuste fino supervisado completo (full SFT) sobre el. Los metadatos de entrenamiento registrados en la model card indican: learning rate 1e-05, batch size de entrenamiento 1 con acumulacion de gradiente de 8 pasos (batch efectivo total de 64), 3 epocas, scheduler coseno, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, semilla 42 y entrenamiento distribuido en 8 dispositivos GPU. El entorno registrado es Transformers 4.57.1 y PyTorch 2.9.1.

El dataset de entrenamiento se identifica como `train_full_1231_cpp2java_idx3`, especifico de la direccion C++ a Java, pero los ejemplos no se incluyen en el repositorio y la model card advierte que el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion del dataset. No se documenta el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo etapas posteriores de RLHF, DPO o GRPO; la model card indica explicitamente que este checkpoint corresponde a la etapa SFT y que no establece que sea un checkpoint final entrenado con GRPO. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Traduccion de codigo de C++ a Java: tarea principal y unica direccion para la que fue ajustado el checkpoint.
- Generacion de texto y codigo: capacidad heredada del modelo base Qwen2.5-Coder-3B.
- Conversacional: el repositorio incluye tokenizer y plantilla de chat (chat template), por lo que admite formato de conversacion multi-turno.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Modo thinking, vision o audio: no disponibles; no se documentan.

## Casos de uso

- Migracion de modulos C++ a Java en codebases legacy: el modelo recibe el codigo fuente C++ de una funcion o clase y devuelve una propuesta de traduccion Java, reduciendo el trabajo manual inicial en procesos de reescritura de componentes.
- Generacion de borradores de traduccion para revision humana: en equipos que migran servicios de C++ a Java, el checkpoint produce una primera version que despues se valida con tests y herramientas de analisis estatico, tal como recomienda el autor.
- Creacion de datasets de pares C++/Java para entrenamiento: las salidas del modelo pueden servir como candidatos para ampliar corpus de traduccion, siempre con filtrado y validacion posterior.
- Experimentacion academica en traduccion automatica de codigo: al estar bajo licencia de investigacion, encaja en estudios que comparan estrategias SFT frente a RL para traduccion entre lenguajes.
- Prototipado de herramientas de migracion asistida: integracion en un IDE o CLI que sugiera equivalentes Java de fragmentos C++, con el modelo como motor de sugerencia y revision humana obligatoria.
- Evaluacion de pipelines de traduccion con Qwen2.5-Coder: sirve como checkpoint de referencia para medir el efecto del ajuste fino direccional frente al modelo base en tareas C++ a Java.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se atribuye ninguna puntuacion de benchmark a este checkpoint y que la reproduccion de benchmarks en GPU no ha sido validada para este release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de aproximadamente 3,09 mil millones de parametros, los pesos en bf16 ocuparian en torno a 6,2 GB, por lo que se necesita margen adicional para cache KV y activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; no se documentan configuraciones de referencia.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamano, un modelo de 3B en bf16 o cuantizado en 8 bits es plausible en GPU de consumo con suficiente VRAM, pero el autor no valida inferencia en GPU para este release.
- Opciones de despliegue: transformers (segun el ejemplo de carga de la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Cpp-to-Java | 3,09 mil millones | no disponible | Qwen Research (no comercial) | Pesos safetensors en HF | SFT direccional C++ a Java; sin benchmarks publicados |
| Qwen2.5-Coder-3B (base) | 3,09 mil millones | no disponible en esta ficha | Qwen Research | Pesos en HF | Generacion de codigo generalista; sin especializacion de traduccion |
| Alternativas de traduccion de codigo de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; deben validarse con tests y herramientas de analisis antes de usarse.
- El release no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es un release de pesos, no evidencia de reproduccion numerica completa.
- La inferencia en GPU y la reproduccion de benchmarks no han sido validadas para este checkpoint.
- El checkpoint corresponde a la etapa SFT y no se establece que sea un checkpoint final entrenado con GRPO.
- La licencia Qwen Research License Agreement restringe el uso a investigacion y evaluacion no comercial; no esta relicenciado bajo MIT ni Apache-2.0.
- No se declaran sesgos conocidos, idiomas soportados ni limitaciones de contexto en la informacion proporcionada.
- El modelo esta especializado en una unica direccion (C++ a Java); su rendimiento fuera de esa tarea no esta documentado.
- El repositorio no incluye variantes cuantizadas, lo que limita el despliegue en entornos con VRAM reducida sin cuantizacion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-Java
- Modelo base Qwen2.5-Coder-3B: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio ClearTrans (scripts de implementacion y replicacion): https://github.com/Xingzhehu/ClearTrans
- Licencia incluida en el repositorio: LICENSE (referenciado en la model card)
- Aviso de atribucion y modificaciones: NOTICE (referenciado en la model card)
