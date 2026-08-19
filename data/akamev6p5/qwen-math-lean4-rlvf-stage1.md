# AkameV6p5/qwen-math-lean4-rlvf-stage1

## Resumen

El modelo `AkameV6p5/qwen-math-lean4-rlvf-stage1` es un adaptador LoRA (técnica PEFT) que se integra sobre el modelo base `AkameV6p5/qwen2.5-math-7b-lean4-numina-e2e`, una versión de Qwen2.5-Math-7B ya ajustada con datos de Lean4 y Numina. Este adaptador ha sido entrenado mediante GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo con retroalimentación verificable (RLVF) introducido en DeepSeekMath, para mejorar el razonamiento matemático y la generación de demostraciones formales en Lean4. El resultado es un modelo especializado en tareas de razonamiento matemático riguroso, con capacidad para producir pruebas verificables por el asistente de demostración Lean4.

El modelo está diseñado para investigadores y desarrolladores que trabajan en demostración automática de teoremas, verificación formal de matemáticas o generación de código de prueba. Al ser un adaptador LoRA, el peso adicional es de solo 0.7 GB, lo que permite desplegarlo sobre el modelo base de 7B con requisitos de memoria moderados. Su relevancia radica en combinar el ajuste fino supervisado con el refuerzo a partir de recompensas verificables, una tendencia actual en IA matemática para reducir alucinaciones y mejorar la corrección lógica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), adaptador LoRA sobre Qwen2.5-Math-7B |
| Parametros totales | 7.6B (modelo base) + adaptador LoRA de dimensiones no publicadas |
| Parametros activos | no disponible (adaptador LoRA, solo se entrenan matrices de bajo rango) |
| Longitud de contexto | 32 768 tokens (capacidad del modelo base Qwen2.5-Math-7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible (probablemente ingles, por los datos de entrenamiento) |
| Licencia | no disponible (los metadatos no especifican una licencia clara; el README indica "licence: license" sin valor) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base `AkameV6p5/qwen2.5-math-7b-lean4-numina-e2e`. Este base es una version de Qwen2.5-Math-7B que ya ha pasado por un ajuste fino supervisado (SFT) con datos de demostraciones en Lean4 y del conjunto Numina (problemas matematicos). El adaptador se ha entrenado con GRPO, un algoritmo de optimizacion por politicas que utiliza un grupo de respuestas muestreadas para estimar ventajas relativas, y una funcion de recompensa basada en verificacion automatica (por ejemplo, compilacion de las pruebas en Lean4). Este enfoque permite premiar unicamente las respuestas que son formalmente correctas, reduciendo el sesgo de las recompensas heuristicas.

El entrenamiento se realizo con TRL (Transformers Reinforcement Learning), PEFT, y Unsloth para optimizar el uso de memoria. No se han publicado detalles sobre el numero de pasos, el tamaño del dataset de refuerzo ni los hiperparametros exactos (como el rango del LoRA o la tasa de aprendizaje). La arquitectura subyacente es un transformer decoder-only con atencion completa, sin innovaciones estructurales adicionales; la novedad reside en la estrategia de entrenamiento con recompensas verificables.

## Capacidades

- Razonamiento matematico avanzado: el modelo esta especializado en resolver problemas matematicos que requieren pasos logicos y demostraciones formales.
- Generacion de pruebas en Lean4: puede producir codigo de demostracion en el lenguaje Lean4, que puede ser compilado y verificado por el asistente de demostracion.
- Refuerzo con retroalimentacion verificable: gracias al entrenamiento GRPO, las respuestas tienden a ser mas correctas desde el punto de vista logico, aunque no se garantiza una correccion total.
- Soporte de conversacion en formato chat: el pipeline de generacion acepta mensajes con roles (user, assistant), lo que permite interacciones multi-turno.
- Integracion con herramientas de verificacion: al generar pruebas Lean4, el modelo puede conectarse a un compilador Lean para validar sus salidas en un pipeline automatico.

## Casos de uso

- Demostracion automatica de teoremas: el modelo puede generar borradores de demostraciones en Lean4 para teoremas de nivel universitario, que un investigador puede revisar y completar. Es adecuado porque su entrenamiento con recompensas verificables fomenta la correccion estructural.
- Verificacion formal de resultados matematicos: en proyectos de formalizacion de matematicas (por ejemplo, el proyecto mathlib de Lean), el modelo puede proponer pruebas para lemas simples o intermedias, acelerando el trabajo manual.
- Asistente de aprendizaje para estudiantes de matematicas: dado un problema, el modelo puede generar una explicacion paso a paso y, ademas, producir una version formal en Lean4 que el estudiante puede ejecutar para comprobar la validez.
- Generacion de ejercicios de demostracion: en plataformas educativas, el modelo puede crear problemas de demostracion con sus soluciones verificables, facilitando la generacion de contenido.
- Integracion en pipelines de CI para pruebas formales: en entornos de desarrollo de software verificado, el modelo puede autogenerar pruebas de propiedades matematicas simples, reduciendo el trabajo de los ingenieros de verificacion.
- Investigacion en razonamiento automatico: el modelo sirve como punto de partida para experimentos con GRPO y otras tecnicas de RL, permitiendo comparar estrategias de recompensa en el dominio Lean4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de evaluacion en MMLU, GSM8K, MATH, Lean4 benchmark ni comparaciones con otros modelos. Se recomienda al usuario realizar sus propias evaluaciones sobre conjuntos de demostraciones Lean4 para medir la tasa de exito de compilacion.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0.7 GB, pero el modelo base Qwen2.5-Math-7B requiere aproximadamente 15 GB en FP16. Con cuantizacion a 4 bits (por ejemplo, bitsandbytes o GPTQ), la VRAM necesaria baja a unos 5-6 GB, mas el adaptador. En total, se recomienda al menos 8 GB de VRAM para inferencia con cuantizacion.
- GPU recomendadas: tarjetas consumer como RTX 3090 (24 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo en FP16 sin problemas. GPUs de datacenter como A100 (40/80 GB) o H100 permiten mayor velocidad y batch.
- Compatibilidad con consumer GPU: si, con cuantizacion 4 bits cabe en RTX 3060 (12 GB) o RTX 4070 (12 GB), aunque con menor velocidad.
- Opciones de despliegue: se puede servir con vLLM o TGI si se convierte el adaptador en un modelo fusionado; con llama.cpp se puede usar cuantizacion GGUF; tambien es compatible con Ollama si se empaqueta correctamente. La integracion con Transformers y PEFT permite cargarlo directamente.
- Latencia y throughput: no hay datos publicados. En una RTX 4090, un modelo 7B cuantizado a 4 bits suele generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| AkameV6p5/qwen-math-lean4-rlvf-stage1 | 7.6B + LoRA | 32K | Razonamiento matematico + Lean4, RL con GRPO | no disponible |
| DeepSeekMath-7B | 7B | 4K (ampliable) | Razonamiento matematico, RL con GRPO | MIT |
| Qwen2.5-Math-7B | 7.6B | 32K | Razonamiento matematico general | Apache-2.0 |
| InternLM-Math-7B | 7B | 8K | Razonamiento matematico y Lean | Apache-2.0 |

La comparacion se basa en caracteristicas generales, no en benchmarks publicados. Este modelo se distingue por su entrenamiento especifico en Lean4 con recompensas verificables, algo que DeepSeekMath no ofrece de forma directa. Qwen2.5-Math-7B es el modelo base sin el ajuste Lean4, por lo que este adaptador anade la capacidad de generar pruebas formales.

## Limitaciones y advertencias

- Licencia no clara: los metadatos no especifican una licencia valida. El README contiene "licence: license", que no es una licencia reconocida. Antes de usar el modelo en proyectos comerciales, es necesario contactar con el autor o verificar los terminos del modelo base (Qwen2.5-Math-7B tiene licencia Apache-2.0, pero el adaptador podria tener restricciones adicionales).
- Sesgos y alucinaciones: aunque el entrenamiento con recompensas verificables reduce errores logicos, el modelo puede generar pruebas incorrectas o incompletas, especialmente en problemas complejos. Toda salida debe ser verificada con Lean4 antes de considerarla valida.
- Limitaciones de idioma: no se ha confirmado el soporte multilingue; el entrenamiento con datos de matematicas sugiere que funciona mejor en ingles. Puede fallar en otros idiomas.
- Dependencia del modelo base: el rendimiento final depende del ajuste previo del modelo base. Si el base tiene sesgos, estos se heredan.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento en tareas estandar, lo que dificulta la evaluacion objetiva.
- Tamano del adaptador: al ser un adaptador LoRA, es necesario cargar el modelo base completo, lo que aumenta los requisitos de memoria en comparacion con un modelo autonomo del mismo tamano.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AkameV6p5/qwen-math-lean4-rlvf-stage1
- Modelo base: https://huggingface.co/AkameV6p5/qwen2.5-math-7b-lean4-numina-e2e
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
