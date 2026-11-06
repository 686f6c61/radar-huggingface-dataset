# huihui1234/minids-0.1b-gsmrl

## Resumen

minids-0.1b-gsmrl es un modelo de lenguaje de pequena escala (494 millones de parametros) desarrollado por el usuario huihui1234, que constituye un experimento educativo de replicacion del pipeline completo de entrenamiento de DeepSeek-V3 a escala reducida. El autor declara haber imitado la arquitectura de DeepSeek-V3 y haber recorrido las tres fases tipicas del entrenamiento moderno de LLM: entrenamiento del tokenizador, preentrenamiento del modelo y postentrenamiento (instruccion completa mas DPO). Posteriormente aplico GRPO (Group Relative Policy Optimization) sobre el dataset gsm8k_chinese para reproducir el fenomeno del "aha moment" descrito en DeepSeek-R1.

El modelo se construye sobre la arquitectura Qwen2 (segun los tags de Hugging Face) y esta especializado en razonamiento matematico en chino mediante aprendizaje por refuerzo con funciones de recompensa basadas en reglas. Su relevancia es fundamentalmente didactica: demuestra que es posible ejecutar el ciclo completo de entrenamiento tipo DeepSeek (preentrenamiento, SFT, DPO y RL con GRPO) en hardware asequible y con un modelo de menos de 500 millones de parametros.

Se trata de un checkpoint experimental con muy poca traccion en la comunidad (6 descargas, 1 like en el momento de la consulta) y sin model card detallada en cuanto a datos de preentrenamiento, composicion del corpus o evaluacion sistematica. No debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (tag `qwen2`), inspirada en DeepSeek-V3 |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible (entrenado principalmente en chino segun el dataset y la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor describe un pipeline de tres fases: entrenamiento del tokenizador, preentrenamiento del modelo base (denominado internamente deepseek-v3-0.1b) y postentrenamiento con instruccion completa y DPO. La arquitectura efectiva registrada en los metadatos es `qwen2`, lo que sugiere una implementacion transformer decoder-only estandar con la configuracion de atencion y normalizacion de la familia Qwen2, aunque el autor la presenta como imitacion de DeepSeek-V3.

Sobre ese modelo base se aplico GRPO usando el framework TRL y el dataset `swulling/gsm8k_chinese`, con una funcion de recompensa basada en reglas (presumiblemente verificacion de formato y correccion de la respuesta numerica final). El autor publica capturas de los checkpoints 300 y 500 mostrando que el modelo aprende progresivamente el formato de respuesta esperado. No se especifica el numero de tokens de preentrenamiento, la composicion del corpus, el volumen del dataset de SFT/DPO ni los hiperparametros de GRPO (tamano de grupo, KL, learning rate).

## Capacidades

- Generacion de texto y razonamiento aritmetico basico en chino, orientado a problemas de tipo GSM8K.
- Resolucion de problemas matematicos de primaria con formato de respuesta estructurado (aprendido via RL).
- Aprendizaje de formato de cadena de razonamiento inducido por GRPO (el autor menciona el "aha moment").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del propio CoT matematico.
- Capacidades multilingues no documentadas; el entrenamiento parece centrado en chino.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Experimentacion educativa sobre RL para LLM: sirve como caso de estudio reproducible de un pipeline completo (tokenizer, pretrain, SFT, DPO, GRPO) a escala 0.1B, util para cursos y tutoriales.
- Prototipado de funciones de recompensa basadas en reglas: el modelo permite iterar rapidamente sobre verificadores de respuesta y formato sin coste elevado de computo.
- Investigacion sobre el "aha moment": permite reproducir a pequena escala el fenomeno de emergencia de auto-verificacion descrito en DeepSeek-R1 con recursos modestos.
- Benchmarking de frameworks de RL (TRL, GRPO): util para comparar implementaciones y estabilidad de entrenamiento en modelos diminutos.
- Generacion de respuestas matematicas en chino para tareas acotadas de tipo GSM8K, siempre con validacion posterior.
- Fine-tuning posterior como base para experimentos de destilacion o ablaciones academicas, dado su tamano reducido y licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente muestra capturas cualitativas de los checkpoints 300 y 500 ilustrando la mejora progresiva del formato de respuesta, sin metricas numericas de exactitud sobre GSM8K ni sobre otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494 M parametros x 2 bytes) mas overhead de activaciones y cache KV.
- VRAM estimada en int8: en torno a 0,5 GB; en int4: en torno a 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Despliegue posible con transformers, vLLM, TGI o llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles; por tamano, la inferencia sera de decenas a cientos de tokens por segundo en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minids-0.1b-gsmrl | 494 M | no disponible | RL con GRPO sobre GSM8K chino | MIT | Hugging Face |
| Qwen2.5-0.5B | ~494 M | 32 K (segun version) | LLM generalista multilingue | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360 M | 8 K | LLM generalista en ingles | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32 K | Razonamiento destilado de R1 | MIT | Hugging Face |

La comparacion con Qwen2.5-0.5B es la mas directa por tamano y por compartir familia arquitectonica, pero minids-0.1b-gsmrl esta especializado en matematicas en chino y carece de evaluacion publica, mientras que Qwen2.5-0.5B ofrece contexto documentado, multilingue y benchmarks. Frente a DeepSeek-R1-Distill-Qwen-1.5B, el modelo de huihui1234 es tres veces menor y no usa destilacion, sino RL directo con GRPO sobre un modelo propio.

## Limitaciones y advertencias

- Modelo experimental de 0,1B: la capacidad de razonamiento matematico real es muy limitada y el autor solo muestra mejoras de formato, no de exactitud.
- Riesgo elevado de alucinacion y de respuestas incorrectas incluso en problemas aritmeticos simples.
- Sesgos conocidos: no documentados; al entrenarse principalmente con un dataset chino de matematicas, el sesgo linguistico y cultural sera marcado.
- Contexto maximo no documentado, lo que impide planificar su uso en conversaciones largas.
- Idiomas soportados no declarados; el uso en castellano no esta validado y probablemente sea deficiente.
- Aunque la licencia es MIT y permite uso comercial, la falta de evaluacion y de documentacion desaconseja su uso en produccion.
- No hay garantia de mantenimiento ni de soporte por parte del autor; el repositorio tiene muy poca actividad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui1234/minids-0.1b-gsmrl
- Dataset utilizado: https://huggingface.co/datasets/swulling/gsm8k_chinese
- Framework de entrenamiento (TRL): https://github.com/huggingface/trl
- Captura checkpoint 300: https://github.com/user-attachments/assets/0697d63c-ac59-4068-964d-c633e611f459
- Captura checkpoint 500: https://github.com/user-attachments/assets/23169dca-4420-465f-aedf-6c756d0d2960
