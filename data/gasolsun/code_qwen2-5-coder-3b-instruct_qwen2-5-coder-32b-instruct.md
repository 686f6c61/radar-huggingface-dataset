# gasolsun/Code_Qwen2.5-Coder-3B-Instruct_Qwen2.5-Coder-32B-Instruct

## Resumen

Code_Qwen2.5-Coder-3B-Instruct\_Qwen2.5-Coder-32B-Instruct es un modelo de generación de código desarrollado por el usuario gasolsun. Se trata de un fine-tuning del modelo base Qwen/Qwen2.5-Coder-3B-Instruct obtenido mediante destilación on-policy (OPD) a partir del profesor Qwen/Qwen2.5-Coder-32B-Instruct. El objetivo es trasladar capacidad de resolución de problemas de programación de un modelo grande a uno de 3.397 millones de parámetros, apto para despliegue en hardware modesto.

La innovación principal es el método **Ask to Distill**: un generador de preguntas entrenado con RL produce enunciados que maximizan el desacuerdo a nivel de token entre profesor y alumno sobre las propias soluciones del alumno (la señal que aprende la destilación on-policy). A partir de ese banco de preguntas, filtrado y deduplicado, se entrena al estudiante sin usar preguntas reales ni respuestas de referencia.

El modelo es relevante para quienes buscan un asistente de código ligero y ejecutable en local que incorpore parte del comportamiento de un modelo de 32B. La arquitectura, la ventana de contexto y el tokenizador son los heredados del base Qwen2.5-Coder-3B-Instruct; la licencia es `qwen-research`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), heredada del modelo base |
| Parametros totales | 3.397.103.616 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-Coder-3B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors; sin GGUF ni GPTQ oficiales) |
| Idiomas soportados | No disponible en la model card (el base Qwen2.5 declara soporte multilingue) |
| Licencia | `other` / `qwen-research` |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen2.5-Coder-3B-Instruct: un transformer decoder-only denso de la familia Qwen2.5, con mecanismos estandar de esa generacion (RoPE para posiciones, activacion SwiGLU, normalizacion RMSNorm y atencion con query agrupadas/GQA). No se ha modificado la topologia respecto al base; el entrenamiento solo ajusta los pesos existentes.

El proceso de entrenamiento es la innovacion central. Se utilizo **Ask to Distill**, que entrena primero un *generador de preguntas* con RL para que escriba enunciados que expongan desacuerdo acotado y aprendible, token a token, entre el profesor (32B) y el alumno (3B) sobre las propias soluciones del alumno. Con ese banco de preguntas (filtrado y deduplicado) se entrena al estudiante mediante destilacion on-policy. La receta OPD descrita en la model card usa como objetivo la KL inversa por token sobre los 16 tokens con mayor probabilidad del alumno, ponderada por las probabilidades renormalizadas del alumno, y **sin recompensa de resultado**. Los hiperparametros indicados son: learning rate 1e-6 constante, optimizador AdamW, temperatura de rollout 1.0 y pesos maestros en fp32 con computo en bf16. No se emplearon preguntas de entrenamiento reales ni respuestas de referencia.

## Capacidades

- Generacion de texto y de codigo en plantilla de entrada/salida estandar (el modelo card especifica que las peticiones usan el template stdin/stdout de LiveCodeBench, leyendo de la entrada estandar, escribiendo a la salida estandar y emitiendo un unico bloque de codigo Python delimitado).
- Resolucion de problemas de programacion competitiva y de ejercicios de nivel introductorio, con formato conversacional (`apply_chat_template`).
- Modo instruct/chat mediante plantilla de mensajes (rol user/assistant).
- Generacion con muestreo configurable (temperature, top-p) y hasta 4.096 tokens nuevos en la configuracion de evaluacion reportada.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de autocompletado y generacion de codigo en el editor: al ser un modelo de 3,4B, puede servirse con latencia baja en una GPU consumer y responder en formato conversacional, lo que permite integrarlo en extensiones de IDE que necesitan respuestas rapidas por pulsacion de tecla.
- Resolucion de ejercicios de programacion educativos: el modelo esta afinado sobre un banco de preguntas de codigo tipo stdin/stdout, por lo que encaja en plataformas de practica que evaluan la salida estandar del programa generado.
- Generacion de scripts utilitarios y tareas de scripting de nivel introductorio: util para producir fragmentos cortos (procesado de ficheros, parseo, pequenas automatizaciones) donde el modelo rinde mejor segun los benchmarks (MBPP+ 65,1; APPS-Intro 31,6).
- Preprocesado y generacion de datos sinteticos: la propia naturaleza del pipeline Ask to Distill lo hace apropiado como generador de candidatos de codigo que despues otro modelo mayor filtra o valida.
- Despliegue en local o en el borde (edge): con licencia de investigacion y pesos safetensors, permite experimentacion offline en estaciones de trabajo sin acceso a APIs externas, util en entornos con requisitos de privacidad de datos.
- Base para posteriores destilaciones o fine-tunings: al tener pesos abiertos en safetensors y ser un modelo pequeno, sirve como punto de partida para ajustes especificos de dominio (por ejemplo, un lenguaje o framework concreto).
- Evaluacion y comparacion de tecnicas de destilacion: util como referencia reproducible para investigar el efecto de OPD sin recompensa de resultado frente a metodos supervisados clasicos.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor:

| Benchmark | Resultado |
|---|---|
| LiveCodeBench v5\_v6 | 17,0 |
| MBPP+ | 65,1 |
| APPS-Intro | 31,6 |
| APPS-Interview | 7,6 |
| APPS-Comp | 3,7 |
| CodeContests | 2,4 |
| Media (Avg) | 21,2 |

Detalles de evaluacion indicados: LiveCodeBench v5\_v6 con 342 problemas, n=4 y pass@1; MBPP+ con EvalPlus en modo greedy y extraccion de respuesta lenient; APPS intro / interview (subconjunto de 1.000) / competition y CodeContests test (165 problemas) con n=1, temperature 0,2, top-p 0,95, top-k 20, 4.096 tokens y como maximo 50 tests por problema. La media corresponde a la media de los seis benchmarks. No se han publicado en la informacion disponible comparaciones directas con otros modelos bajo protocolos identicos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 6,8-7,5 GB (coherente con el tamano de repo de 6,8 GB). Cabe en GPUs consumer con 8 GB o mas.
- VRAM estimada cuantizado (aproximada, no publicada por el autor): ~3,5 GB en int8 y ~2-2,5 GB en 4 bits, si se realizan conversiones propias.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para inferencia rapida; A100 o H100 para lotes grandes o evaluacion a escala.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM en bf16, o en GPU con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (uso mostrado en la model card), vLLM, TGI (etiqueta `text-generation-inference`), y llama.cpp/Ollama tras convertir manualmente a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Code_Qwen2.5-Coder-3B-Instruct\_Qwen2.5-Coder-32B-Instruct (este) | 3,397B | no disponible (base: 32.768) | qwen-research | safetensors | Media 21,2 en los seis benchmarks del autor |
| Qwen/Qwen2.5-Coder-3B-Instruct (base) | ~3,09B | 32.768 | Apache-2.0 (Qwen2.5-Coder) | safetensors, GGUF, etc. | no disponible en la informacion proporcionada |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 (ampliable) | Apache-2.0 (Qwen2.5-Coder) | safetensors, GGUF, etc. | no disponible en la informacion proporcionada |
| Posible alternativa de tamano similar (p. ej. DeepSeek-Coder base 1.3B/6.7B) | variable | variable | variable | variable | no disponible |

Nota: las cifras de rendimiento de los modelos comparados no se incluyen porque no se han aportado en la informacion disponible; solo el modelo objeto de la ficha tiene resultados medidos bajo el protocolo descrito.

## Limitaciones y advertencias

- Licencia `qwen-research` (etiqueta `other`): restringe o condiciona el uso comercial; conviene revisar los terminos de la licencia Qwen Research antes de desplegar en produccion.
- Riesgo de alucinacion en codigo: como cualquier modelo generativo, puede producir APIs inexistentes, firmas erroneas o dependencias que no compilan; requiere validacion con tests.
- Rendimiento bajo en problemas de dificultad alta: los resultados en APPS-Comp (3,7) y CodeContests (2,4) indican capacidad limitada para tareas de nivel competitivo; no es adecuado como unico resolutor en esos escenarios.
- Formato de salida acoplado a la plantilla de LiveCodeBench (stdin/stdout, un solo bloque Python delimitado): fuera de ese formato, el comportamiento puede degradarse.
- Ausencia de datos sobre idiomas naturales soportados en la model card: el soporte multilingue del base no se ha verificado para este fine-tuning.
- No se publican pesos cuantizados (GGUF, GPTQ, AWQ) ni datos de latencia/throughput; cualquier despliegue optimizado exige conversion propia y validacion.
- No hay informacion sobre sesgos, datos de entrenamiento en lenguaje natural ni evaluaciones de seguridad; el banco de preguntas es sintetico y generado por un modelo entrenado con RL.
- El repositorio no registra descargas ni likes, por lo que no existe evidencia de uso en comunidad ni de validacion externa de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gasolsun/Code_Qwen2.5-Coder-3B-Instruct_Qwen2.5-Coder-32B-Instruct
- Dataset del banco de preguntas: https://huggingface.co/datasets/gasolsun/Code_Qwen2.5-Coder-3B-Instruct_Qwen2.5-Coder-32B-Instruct
- Modelo base (estudiante): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Paper o blog de "Ask to Distill": no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
