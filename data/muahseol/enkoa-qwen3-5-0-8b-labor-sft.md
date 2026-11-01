# muahseol/enkoa-qwen3.5-0.8b-labor-sft

## Resumen

`muahseol/enkoa-qwen3.5-0.8b-labor-sft` es un ajuste fino (SFT) de plena parametrizacion del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario muahseol en HuggingFace. Se trata de un modelo de generacion de texto de aproximadamente 752 millones de parametros (dato real extraido de los pesos en safetensors), especializado en conversaciones de tematica laboral ("노무 상담", consultoria laboral) y entrenado en el contexto del material practico del curso de deep learning de Enkoa AI Campus.

El modelo es un ejemplo didactico: la model card indica explicitamente que forma parte del capitulo 02 de la unidad de SFT de un curso y que sirve como servidor de inferencia para las practicas de la unidad de vLLM. El autor advierte de forma clara que no debe utilizarse en consultas reales. Su relevancia es, por tanto, formativa y de demostracion de pipelines de ajuste fino y despliegue, no de produccion.

La arquitectura subyacente es la del Qwen3.5-0.8B (familia `qwen3_5_text`), con licencia Apache 2.0 y pesos en safetensors. El unico idioma declarado es el coreano. El repositorio ocupa 3.0 GB, coherente con pesos en float32 para un modelo de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5 orientado a generacion de texto. Sobre esa base se ha realizado un ajuste fino supervisado (SFT) de todos los parametros ("풀 파인튜닝", full fine-tuning) con un conjunto de datos de consultoria laboral. Segun la model card, el checkpoint final (`labor_sft_final`) se selecciono mediante evaluacion con un "juez" (판사 채점, grading por un modelo juez) entre los candidatos del entrenamiento.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) mas alla de las propias del modelo base. Los pesos se publican en float32, lo que explica el tamano del repositorio (3.0 GB) y facilita su uso como ejemplo de despliegue en vLLM.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos de consultoria laboral.
- Respuestas multi-turno dentro de un dominio acotado (tematica laboral) gracias al ajuste SFT.
- Capacidad de razonamiento y codigo heredada del modelo base Qwen3.5-0.8B (no verificada en este ajuste).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al coreano segun la model card; el resto de idiomas del modelo base no se declaran.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Practicas de ajuste fino supervisado: el modelo sirve como resultado de referencia en el capitulo 02 de la unidad SFT del curso de Enkoa AI Campus, permitiendo al alumnado comparar su propio entrenamiento con un checkpoint ya publicado.
- Despliegue de servidor de inferencia con vLLM: el repositorio esta pensado para que los alumnos lo descarguen y levanten un servidor vLLM, practicando configuracion de endpoints compatibles con la API de OpenAI.
- Demostracion de evaluacion con modelo juez: el checkpoint ilustra el flujo de seleccion de modelos mediante grading automatico, util como caso de estudio en docencia sobre evaluacion de LLMs.
- Prototipado de chatbots de dominio acotado: permite experimentar con dialogos de consultoria laboral en coreano en entornos de laboratorio, sin coste de GPU elevado gracias a su tamano reducido.
- Pruebas de cuantizacion y optimizacion: al ser un modelo pequeno en float32, es adecuado para ejercicios de conversion a GGUF, cuantizacion y medicion de latencia en hardware de consumo.
- Validacion de pipelines de CI/CD para modelos: sirve como artefacto ligero para probar integraciones de descarga, versionado y despliegue automatizado de modelos en entornos de formacion.
- Benchmarking educativo de infraestructura: permite medir throughput y latencia en distintas GPUs con un modelo de ~0,75B parametros, como ejercicio practico de dimensionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (valores estimados a partir del numero de parametros, no publicados por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para float32 (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs profesionales el modelo queda muy desaprovechado por su tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna con 8 GB o mas; tambien es viable en CPU con llama.cpp u Ollama tras conversion a GGUF.
- Opciones de despliegue: vLLM (mencionado explicitamente en la model card como motor de las practicas), transformers, y previsiblemente llama.cpp, Ollama y TGI tras conversion de formato (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-labor-sft | 752 M | no disponible | Apache 2.0 | SFT en consultoria laboral (coreano), uso didactico |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache 2.0 | Modelo generalista multilingue |
| Qwen3-0.6B (generacion anterior) | ~0,6 B | no disponible | Apache 2.0 | Modelo generalista, base habitual de ajustes finos |
| Llama 3.2 1B | ~1,2 B | no disponible | Llama 3.2 Community License | Modelo generalista multilingue |

La comparacion cuantitativa de rendimiento no esta disponible: el autor no publica resultados de benchmarks ni comparaciones con alternativas. La diferencia principal frente al modelo base es el ajuste SFT en dominio laboral coreano y la seleccion por modelo juez; frente a alternativas generalistas del mismo orden de magnitud, su ventaja es la especializacion, y su desventaja, la ausencia de datos publicos de evaluacion y su naturaleza estrictamente didactica.

## Limitaciones y advertencias

- El autor advierte explicitamente de que es un modelo de ejemplo para formacion y que no debe usarse en consultas reales ("실제 상담에 쓰지 마십시오").
- Riesgo elevado de alucinacion en materia laboral: al ser un ajuste SFT de un modelo de 0,75B, puede generar respuestas plausibles pero incorrectas sobre normativa, derechos o procedimientos.
- Sesgos conocidos: no documentados por el autor; al entrenarse con un dataset de dominio concreto en coreano, puede reflejar los sesgos de dichos datos.
- Limitacion idiomatica: solo se declara coreano; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Longitud de contexto: no documentada; conviene no asumir ventanas largas sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor desaconseja el uso en produccion por la naturaleza didactica del checkpoint.
- Ausencia de benchmarks publicos: no hay evidencia cuantitativa de calidad que respalde su uso fuera del aula.
- Los pesos en float32 incrementan el tamano del repositorio (3,0 GB) frente a una publicacion en bfloat16, lo que afecta al ancho de banda de descarga en despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-labor-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de vLLM (motor de inferencia mencionado en la model card): https://github.com/vllm-project/vllm
