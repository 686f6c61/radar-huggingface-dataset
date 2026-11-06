# fdsffjdkf/ClearTrans-3B-SFT-Python-to-Java

## Resumen

ClearTrans-3B-SFT-Python-to-Java es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen/Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de Python a Java. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta disponible en un repositorio de GitHub. El modelo resuelve un problema acotado: la conversion automatica de codigo Python a Java manteniendo la semantica, dentro de un pipeline de traduccion de lenguajes de programacion.

Se trata de un transformer decoder-only de la familia Qwen2, con 3.085.938.688 parametros totales (unos 3,09 mil millones) y pesos en formato safetensors. El repositorio ocupa 6,8 GB. El modelo base es Qwen2.5-Coder-3B, por lo que hereda la tokenizacion, la plantilla de chat y la arquitectura de aquel, y anade un ajuste especifico sobre un dataset de traduccion Python a Java.

Su relevancia es limitada y muy especifica: no es un modelo generalista ni un checkpoint final de un pipeline de RL (el autor indica explicitamente que no consta que sea un checkpoint final entrenado con GRPO). Es un artefacto de investigacion para reproducir y evaluar la etapa SFT de un sistema de traduccion de codigo, con validacion limitada: el autor reconoce que no se han validado la inferencia en GPU ni la reproduccion de benchmarks para esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (orientado a lenguajes de programacion Python y Java) |
| Licencia | Qwen Research License Agreement (licencia "other", no comercial) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-3B |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Version de Transformers registrada | 4.57.1 |
| Version de PyTorch registrada | 2.9.1 |
| Tamano del repositorio | 6,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-3B: un transformer decoder-only con atencion por causalidad, sin mezcla de expertos. El checkpoint es el resultado de un ajuste fino supervisado completo (full fine-tuning, no LoRA) sobre el modelo base, segun indica el aviso de modificaciones del autor. Se conservan la configuracion y el tokenizer del export de entrenamiento, incluida la plantilla de chat.

Los hiperparametros documentados en la model card son: learning rate de 1e-05, batch size de entrenamiento de 1 con acumulacion de gradiente de 8 pasos (batch efectivo de 64), 3 epocas, scheduler coseno, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y entrenamiento distribuido en 8 GPUs. El dataset de entrenamiento se identifica como `train_full_1231_python2java_idx3`, especifico de la direccion Python a Java, pero no se incluye en el repositorio ni se documenta su procedencia o composicion. No consta en la informacion disponible el uso de RLHF, DPO o GRPO en este checkpoint; el autor advierte que no se puede afirmar que sea un checkpoint final entrenado con GRPO.

## Capacidades

- Traduccion de codigo de Python a Java como tarea principal y unica direccion soportada.
- Generacion de texto y codigo en formato conversacional, con plantilla de chat incluida.
- Hereda del modelo base Qwen2.5-Coder-3B las capacidades generales de generacion de codigo, aunque el ajuste esta orientado a la traduccion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste es de una sola tarea.
- Capacidades multilingues: no documentadas; la model card no declara idiomas naturales soportados.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Migracion asistida de bases de codigo Python a Java: el modelo convierte funciones y modulos individuales a Java como primer borrador, que despues se revisa y se valida con la suite de tests del proyecto. Es adecuado porque esta entrenado especificamente en esa direccion.
- Prototipado rapido de equivalentes Java: para equipos que mantienen la misma logica en ambos lenguajes, el modelo genera la version Java de utilidades y algoritmos ya escritos en Python, reduciendo el trabajo manual de transcripcion.
- Generacion de ejemplos de traduccion para docencia: sirve para producir pares Python-Java que ilustren diferencias de sintaxis, gestion de tipos y estructuras de control entre ambos lenguajes.
- Evaluacion de pipelines de traduccion de codigo: al ser un checkpoint SFT intermedio del artefacto ClearTrans, se puede usar como linea base para comparar con etapas posteriores o con otros sistemas de traduccion.
- Investigacion en traduccion de lenguajes de programacion: permite reproducir y analizar el efecto del SFT sobre un modelo Coder de 3B en una direccion concreta, con hiperparametros documentados.
- Integracion en herramientas de desarrollo internas: mediante la API de Transformers y la plantilla de chat incluida, se puede desplegar como servicio de generacion para tareas de conversion acotadas, siempre con validacion posterior del codigo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se atribuye ninguna puntuacion de benchmark a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos (3,09 mil millones de parametros), mas memoria para el contexto y el runtime.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,1 GB para pesos; en 4 bits, alrededor de 1,6 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para fp16 con contexto moderado (por ejemplo, RTX 3090, RTX 4090, A10, L4); para despliegue en servidor, A100 o H100 si se necesita mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM en fp16, y en tarjetas de 4-6 GB si se cuantiza, aunque no hay confirmacion oficial de que el checkpoint funcione en esos entornos.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference figura entre las etiquetas del repositorio; vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles; el autor no ha validado la inferencia en GPU para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Python-to-Java | 3,09 B | no disponible | Traduccion Python a Java (SFT) | Qwen Research (no comercial) | Hugging Face, safetensors |
| Qwen/Qwen2.5-Coder-3B | 3,09 B | no disponible en esta ficha | Generacion de codigo general | Qwen Research / Apache-2.0 segun variante | Hugging Face, safetensors y GGUF |
| Otros modelos de traduccion de codigo de ~3B | no disponible | no disponible | Traduccion entre lenguajes | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de rendimiento ni de otros modelos de traduccion de codigo de tamano comparable en la informacion proporcionada. El modelo base Qwen2.5-Coder-3B es mas generalista y su licencia y formatos de pesos estan mejor documentados; ClearTrans anade especializacion en una unica direccion a costa de perder generalidad y de una licencia estrictamente no comercial.

## Limitaciones y advertencias

- El autor advierte que las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validarlas con tests y herramientas de analisis antes de usarlas.
- La licencia es la Qwen Research License Agreement: uso permitido solo para investigacion o evaluacion no comercial. No se puede relicenciar bajo MIT ni Apache-2.0.
- El checkpoint no ha sido validado para inferencia en GPU ni para reproduccion de benchmarks; su comportamiento real en produccion es incierto.
- No se incluyen los datos de entrenamiento, los estados del optimizador ni evaluaciones historicas, por lo que no se puede verificar la procedencia del dataset ni reproducir numericamente los experimentos.
- El modelo esta especializado en una unica direccion (Python a Java); no se debe esperar un rendimiento equivalente en otras direcciones de traduccion o en generacion de codigo general.
- No consta que sea un checkpoint final entrenado con GRPO; podria ser una etapa intermedia del pipeline ClearTrans.
- Riesgo de alucinacion y de sesgos: no documentado en la informacion disponible, pero aplicable a cualquier modelo de lenguaje; la validacion del codigo generado es imprescindible.
- Idiomas naturales soportados: no declarados; el uso previsto es con codigo fuente, no con texto en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Python-to-Java
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
