# JamieBradfield/Spark-X2.6-4B-AgentFast-GGUF

## Resumen

Spark-X2.6-4B-AgentFast-GGUF es la versión cuantizada en formato GGUF del checkpoint JamieBradfield/Spark-X2.6-4B-AgentFast, un ajuste fino de Spark-X2.6-4B orientado a tool calling autónomo, operaciones de sistema y cumplimiento estricto de instrucciones sin latencia de deliberación. Lo publica JamieBradfield bajo licencia Apache 2.0 y está pensado para ejecución en dispositivo (on-device) mediante llama.cpp.

El interés técnico del artefacto es doble. Por un lado, es un modelo denso de 4.112.079.360 parámetros (aproximadamente 4B) con un único archivo IQ3_M de 1,94 GB (3,96 bits por peso). Por otro, su proceso de entrenamiento documenta un fallo de mapeo de plantilla de chat: los trazos `<thought>` no se parsearon a la clave `reasoning_content`, de modo que las etiquetas de entrenamiento se prepararon con canal de razonamiento vacío. Tras unas 150 iteraciones de SFT, el modelo aprendió un reflejo de salida temprana que cierra el canal de pensamiento en la posición 0 y emite directamente la llamada a herramienta o la respuesta.

El resultado es un caso de estudio de agente de baja latencia en el borde: conserva las capacidades de instrucción y matemáticas del modelo base, mejora el cumplimiento estricto de instrucciones y reduce la latencia por llamada en torno a un 39 % frente al modelo post-entrenado de referencia. El autor lo publica como artefacto experimental «tal cual», sin compromiso de mantenimiento, y anuncia un ajuste fino corregido que preserve los trazos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (valor usado en los ejemplos de inferencia de la model card; no se declara un maximo oficial) |
| Tipos de cuantizacion | IQ3_M (3,96 BPW); el repositorio solo incluye ese archivo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo `Spark-X2.6-Fable-Step150-IQ3_M.gguf`, 1,94 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de unos 4B parámetros, derivado de Spark-X2.6-4B y ajustado mediante SFT sobre trazas de deliberación multi-paso del marco «Fable». No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El checkpoint publicado corresponde al paso 150 del ajuste supervisado.

La innovación —involuntaria— es el mecanismo de salida temprana. Un desajuste de mapeo de campos en la plantilla de chat hizo que los trazos `<thought>` no se volcasen a la clave `reasoning_content`, por lo que los objetivos de entrenamiento se construyeron con el canal de razonamiento vacío (`<|Bot|></think>`). El modelo aprendió a cerrar el canal de pensamiento en el token 0 y a emitir de inmediato la llamada a herramienta o la respuesta directa. Los pesos del transformer subyacente se mantuvieron intactos, de ahí que conserve competencias de instrucción y matemáticas mientras gana velocidad. El autor advierte que se trata de un efecto empírico no planificado y que prepara una corrección que preserve los trazos de razonamiento.

## Capacidades

- Generación de texto conversacional de un solo turno y multi-turno.
- Tool calling y function calling autónomo, con énfasis en precisión de argumentos.
- Cumplimiento estricto de instrucciones de formato y restricciones de prompt (IFEval).
- Razonamiento matemático objetivo (Gaokao Math 2026) con precisión retenida respecto al modelo de referencia.
- Operaciones de sistema y flujos de agente sin latencia de deliberación (salida temprana del canal de pensamiento).
- Despliegue compatible con API OpenAI mediante `llama-server`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Agentes de tool calling en el borde: el modelo emite llamadas a función con un 83,3 % de precisión exacta de argumentos y un 93,3 % de tasa de invocación en BFCL v3, con 3,11 s por llamada. Encaja en asistentes locales que consultan APIs o ejecutan comandos sin depender de la nube.
- Automatización de operaciones de sistema: por su orientación a «system operations» y su cumplimiento estricto de instrucciones, puede emplearse en scripts de administración que traducen lenguaje natural a comandos concretos en entornos controlados.
- Asistentes de bajo consumo en iGPU o CPU: con 1,94 GB en IQ3_M y unos 2,1 GB de VRAM, cabe en mini-PC, portátiles sin GPU dedicada y dispositivos embebidos con llama.cpp sobre Vulkan, ROCm o CUDA.
- Enrutamiento y clasificación de intenciones en pipelines: la latencia reducida (39,4 % menos por llamada) lo hace apto para etapas de decisión de alta frecuencia donde un modelo mayor sería demasiado lento.
- Servicio compatible con OpenAI en local: `llama-server` expone un endpoint que permite sustituir llamadas a la API en prototipos y pruebas de integración sin coste por token.
- Evaluación de robustez de agentes: sirve como caso de estudio reproducible de cómo un fallo de plantilla de chat altera el comportamiento de razonamiento y acelera la inferencia, útil para investigar control de calidad en pipelines de SFT.

## Benchmarks y rendimiento

Datos publicados por el autor comparando el paso 150 con el modelo post-entrenado instruct de referencia (stock):

| Benchmark | Metrica | Step 150 | Stock | Delta |
|---|---|---|---|---|
| BFCL v3 (30 muestras) | Precision exacta de argumentos | 83,3 % | 80,0 % | +3,3 pp |
| BFCL v3 (30 muestras) | Precision de nombre de funcion | 90,0 % | 93,3 % | -3,3 pp |
| BFCL v3 (30 muestras) | Tasa de invocacion de herramienta | 93,3 % | 93,3 % | 0 pp |
| BFCL v3 (30 muestras) | Latencia por llamada | 3,11 s | 5,13 s | -39,4 % |
| IFEval | Precision estricta de prompt | 65,0 % | 15,0 % | +333 % relativo |
| IFEval | Precision laxa de prompt | 70,0 % | 15,0 % | +367 % relativo |
| Gaokao Math 2026 (objetivo) | Precision | 40,0 % (6/15) | 46,7 % (7/15) | -6,7 pp |
| Gaokao Math 2026 (objetivo) | Latencia por problema | 6,18 s | 9,78 s | -36,8 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB con la cuantización IQ3_M (1,94 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM libre; el autor cita compatibilidad con CUDA, ROCm y Vulkan. No se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de gama baja y media (por ejemplo, GTX 1650, RTX 3050 o superiores) y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `llama-cli` y `llama-server` de llama.cpp; el servidor expone una API compatible con OpenAI. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 3,11 s por llamada de herramienta y 6,18 s por problema matemático en la configuración de referencia del autor; no se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-AgentFast (GGUF) | 4,11B | 4096 (uso documentado) | Tool calling de baja latencia, on-device | Apache 2.0 | GGUF en HuggingFace |
| Spark-X2.6-4B-AgentFast (original) | 4,11B | No disponible | Checkpoint base del ajuste fino | Apache 2.0 | Pesos completos en HuggingFace |
| Spark-X2.6-4B (stock instruct) | ~4B | No disponible | Instrucción general con razonamiento | No disponible | Referenciado como linea base en la model card |

No se dispone de datos de benchmarks de terceros ni de comparativas con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- El canal de razonamiento está efectivamente desactivado por un fallo de entrenamiento: el modelo no produce trazos de deliberación, lo que puede degradar tareas que requieran planificación explícita.
- La precisión de nombre de función baja 3,3 puntos respecto al modelo de referencia, y la precisión matemática cae 6,7 puntos; no es un sustituto equivalente en todas las tareas.
- Los benchmarks publicados se basan en muestras pequeñas (30 muestras en BFCL v3, 15 problemas en Gaokao Math), por lo que la varianza es alta y los resultados deben tomarse como indicativos.
- Riesgo de alucinación y de invocación de herramientas inexistentes no evaluado en la información disponible.
- Idiomas soportados no documentados; no se recomienda su uso en producción multilingüe sin validación previa.
- El autor declara el artefacto «tal cual», sin garantías ni compromiso de mantenimiento, actualizaciones o corrección de errores.
- Solo se distribuye una cuantización IQ3_M; no hay versiones de mayor precisión (Q4, Q5, Q8) en este repositorio, lo que limita la evaluación del impacto de la cuantización.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de sesgos y de robustez en producción exige auditoría propia antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/JamieBradfield/Spark-X2.6-4B-AgentFast-GGUF
- Modelo base del ajuste fino: https://huggingface.co/JamieBradfield/Spark-X2.6-4B-AgentFast
- Apoyo al autor (Ko-fi): https://ko-fi.com/jamesonbradfield
- llama.cpp (runtime de inferencia): https://github.com/ggerganov/llama.cpp
- Berkeley Function Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html
- IFEval: https://github.com/google-research/google-research/tree/master/instruction_following_eval
