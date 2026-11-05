# Korzadi/Atomic-Code-1.1

## Resumen

Atomic Code 1.1 (publicado en HuggingFace como `Korzadi/Atomic-Code-1.1`) es un ajuste fino del modelo Qwen2.5-Coder-7B-Instruct orientado a generacion de codigo y razonamiento de ingenieria de software, con enfasis declarado en el idioma espanol. Lo desarrolla el usuario Korzadi mediante el framework Unsloth y la tecnica QLoRA, partiendo de la version cuantizada a 4 bits de Qwen2.5-Coder-7B-Instruct como base. El repositorio incluye pesos consolidados en FP16 (safetensors) y una cuantizacion GGUF Q4_K_M para inferencia local.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN en la familia base). El ajuste se realizo sobre un dataset muy reducido de 94 registros en formato de conversacion multi-turno, con LoRA de rango 32, 30 pasos de entrenamiento y learning rate 2e-4. Se trata, por tanto, de un experimento de refinamiento ligero mas que de un reentrenamiento sustancial.

Su relevancia practica es limitada pero ilustrativa: demuestra el flujo completo de ajuste con Unsloth y publicacion de artefactos GGUF para despliegue local con Ollama o llama.cpp, y sirve como ejemplo de adaptacion de un modelo de codigo al castellano. El autor reporta una tasa de exito del 52,86% en una suite propia de validacion sintactica con AST, cifra que debe interpretarse con cautela dado el tamano del conjunto de evaluacion y la ausencia de comparacion con la linea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), ajuste QLoRA sobre base cuantizada a 4 bits |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-Coder-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en la familia base; no verificado en este ajuste |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; pesos base en FP16 (safetensors) |
| Idiomas soportados | Espanol declarado en la model card; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El ajuste se aplico con QLoRA: la base se mantiene cuantizada a 4 bits (bnb-4bit) y se entrenan adaptadores de bajo rango sobre los modulos de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`), con rango 32 y alpha 32. Posteriormente los pesos se consolidaron a FP16.

El dataset de entrenamiento consta de 94 registros en formato de conversacion chat multi-turno, segun declara el autor. El entrenamiento se ejecuto durante 30 pasos maximos con optimizador `adamw_8bit` y learning rate 2e-4. No se documenta composicion del dataset, numero de tokens procesados, ni si hubo etapas de RLHF o DPO posteriores. La innovacion tecnica destacable es de proceso, no de arquitectura: el uso de Unsloth para reducir el consumo de memoria del ajuste y la exportacion directa a GGUF Q4_K_M para despliegue local.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada de la base Qwen2.5-Coder, con especial enfasis declarado en respuestas en espanol.
- Razonamiento de ingenieria de software: modularizacion, refactorizacion y explicacion de decisiones tecnicas.
- Autovalidacion mediante aserciones y comprobaciones sintacticas, segun el autor.
- Conversacion multi-turno con formato de chat (`<|im_start|>` / `<|im_end|>`).
- Generacion de texto general y explicaciones tecnicas.
- Soporte de tool calling y function calling: no documentado en este ajuste, aunque la base Qwen2.5-Coder-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este ajuste.
- Capacidades multilingues: el autor declara solo espanol; el modelo base es multilingue pero el ajuste puede haber degradado otros idiomas.
- Vision y audio: no soportados.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistencia de programacion en espanol: el modelo puede responder consultas tecnicas y generar fragmentos de codigo con explicaciones en castellano, aprovechando el ajuste orientado a este idioma.
- Generacion de scripts de automatizacion: util para producir utilidades de linea de comandos, scripts de procesamiento de ficheros o tareas de administracion, como el ejemplo de lectura segura de JSON incluido en la model card.
- Refactorizacion y modularizacion de codigo existente: el ajuste incide en la coherencia estructural, lo que lo hace adecuado para proponer divisiones en funciones y modulos.
- Explicacion de codigo y documentacion tecnica: puede generar comentarios, docstrings y resumenes de fragmentos de codigo en castellano para equipos hispanohablantes.
- Prototipado rapido en local: gracias al GGUF Q4_K_M, se puede desplegar con Ollama o llama.cpp en equipos sin GPU dedicada para pruebas de concepto.
- Entornos con requisitos de privacidad: al ejecutarse en local con pesos abiertos y licencia Apache 2.0, permite procesar codigo propietario sin enviarlo a servicios externos.
- Base para experimentos de ajuste: su pipeline documentado con Unsloth y LoRA sirve como plantilla para adaptar modelos de codigo a dominios o idiomas concretos.

## Benchmarks y rendimiento

El autor reporta un unico resultado en su propia suite de validacion sintactica con AST: una tasa de exito en aserciones de codigo del 52,86%. No se publican resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MBPP) ni comparaciones con la linea base Qwen2.5-Coder-7B-Instruct en la informacion disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| Suite propia de aserciones sintacticas (AST) | 52,86% | Metrica definida por el autor; sin detalle del conjunto de evaluacion |
| MMLU | No disponible | No publicado |
| HumanEval | No disponible | No publicado |
| GSM8K | No disponible | No publicado |
| MBPP | No disponible | No publicado |

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 15-16 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, 18-20 GB para contextos moderados.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 4,5-5,5 GB de pesos, con 6-8 GB totales recomendados para contextos de varios miles de tokens.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 en contextos moderados; RTX 3090, RTX 4080 o RTX 4070 Ti para Q4_K_M.
- GPU de consumo: si cabe en GPUs consumer con 8 GB o mas en cuantizacion Q4_K_M; en CPU funciona con llama.cpp u Ollama, con latencia mayor.
- Opciones de despliegue: Ollama (con `Modelfile` incluido en la model card), llama.cpp (`llama-cli`), y en principio vLLM o TGI con los pesos safetensors, aunque no se documenta compatibilidad verificada.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Atomic Code 1.1 | ~7,6 B | 32.768 (heredado) | Apache 2.0 | Ajuste ligero de 94 registros; evaluacion propia del 52,86% en AST |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 (extensible a 131.072 con YaRN) | Apache 2.0 | Base del anterior; benchmarks publicos extensos; multilingue |
| DeepSeek-Coder-V2-Lite-Instruct | ~16 B (2,4 B activos, MoE) | 128.000 | Licencia propia de DeepSeek | Mayor capacidad pero mas exigente en hardware |
| CodeLlama-7B-Instruct | ~6,7 B | 16.384 | Llama 2 Community License | Alternativa de Meta con restricciones de uso comercial |

La comparacion directa con la linea base Qwen2.5-Coder-7B-Instruct es la mas relevante: Atomic Code 1.1 parte de ella y aplica un ajuste de solo 30 pasos sobre 94 ejemplos, por lo que es previsible que las diferencias de rendimiento general sean marginales y que el sesgo hacia el espanol sea el cambio mas perceptible.

## Limitaciones y advertencias

- El dataset de ajuste es muy reducido (94 registros) y el entrenamiento muy corto (30 pasos), lo que limita la magnitud y generalizacion del refinamiento.
- El unico benchmark reportado es una suite propia del autor sin descripcion detallada del conjunto de evaluacion ni comparacion con la linea base; el 52,86% no es directamente comparable con metricas estandar.
- Riesgo de sobreajuste al estilo y formato de los 94 ejemplos de entrenamiento, con posible degradacion de capacidades generales de la base.
- El autor declara solo espanol; el ajuste puede haber reducido el rendimiento en otros idiomas respecto a la base multilingue.
- Riesgo de alucinacion en APIs, librerias y funciones inexistentes, comun en modelos de codigo de este tamano; se recomienda validacion automatica del codigo generado.
- No se documentan sesgos especificos ni procesos de alineacion adicionales (RLHF/DPO) posteriores al ajuste.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de la licencia del modelo base y de los datos de entrenamiento originales antes de un uso comercial en produccion.
- La model card no documenta soporte verificado de tool calling, agentes ni plantillas de chat mas alla de la de Qwen; la integracion en pipelines de agentes requiere validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Korzadi/Atomic-Code-1.1
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Framework Unsloth: https://github.com/unslothai/unsloth
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
