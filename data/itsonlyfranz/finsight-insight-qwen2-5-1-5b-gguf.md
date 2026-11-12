# itsonlyfranz/finsight-insight-qwen2.5-1.5b-GGUF

## Resumen

FinSight Insight 1.5B (GGUF) es una cuantizacion en formato GGUF de un fine-tune con LoRA sobre Qwen2.5-1.5B-Instruct, desarrollado por el usuario itsonlyfranz. El modelo no es un asistente financiero general: su tarea es estrictamente acotada y consiste en reescribir hechos estructurados de finanzas personales (insights de gasto, simulaciones de ahorro hipoteticas y hitos de metas de ahorro) en mensajes breves, en texto plano y con un tono cercano, utilizando unicamente las cifras que recibe como entrada. El adaptador LoRA esta fusionado en los pesos del modelo base.

El modelo resuelve un problema de producto muy concreto: generar mensajes personalizados y legibles para una aplicacion de finanzas personales sin que el modelo invente cantidades, tasas o productos. Para ello se entrena sobre un dataset sintetico propio y se evalua con metricas de fidelidad numerica, validez de formato y cobertura de hechos, en lugar de benchmarks academicos genericos. La relevancia actual reside en su tamano reducido (1.543.714.304 parametros, es decir, 1,5B) y en que puede ejecutarse en hardware de consumo, incluido un portatil con Apple Silicon.

La ficha corresponde a la version cuantizada en GGUF para llama.cpp y LM Studio. El autor recomienda el fichero Q5_K_M (1,1 GB) como opcion por defecto, con Q8_0 y Q4_K_M como alternativas. La licencia es Apache-2.0, heredada del modelo base Qwen2.5-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct), con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Q5_K_M (1.125.050.144 B), Q8_0 (1.646.572.832 B), Q4_K_M (986.048.288 B); referencia f16 no subida al repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el adaptador original esta en safetensors en el repo del adaptador |
| Tamano del repo | 3,8 GB |
| Modelo base | Qwen2.5-1.5B-Instruct, via itsonlyfranz/finsight-insight-qwen2.5-1.5b |
| Dataset de entrenamiento | itsonlyfranz/finsight-insight-synthetic |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parametros, y se ajusta mediante LoRA sobre un dataset sintetico propio (itsonlyfranz/finsight-insight-synthetic) generado por un unico generador. El adaptador resultante se fusiona en los pesos base y posteriormente se cuantiza a GGUF. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor indica que los scripts de entrenamiento y evaluacion estan publicados en el repositorio de GitHub del proyecto.

La innovacion tecnica no reside en la arquitectura, sino en el diseno de la tarea y del contrato de salida. El modelo recibe un bloque de hechos con cifras concretas y una instruccion de formato (dos lineas `INSIGHT:` / `ACTION:` para insights, dos o tres frases para simulaciones, una frase de maximo 30 palabras para metas) y debe producir texto que respete ese contrato y que solo utilice las cifras proporcionadas. El autor recomienda decodificacion greedy (temperatura 0) y el uso de `--jinja` en llama.cpp para aplicar la plantilla de chat de Qwen2.5. La evaluacion se realiza con un conjunto de test retenido de n=246 prompts y cuatro metricas: fidelidad numerica (paso de un port del guard de cifras de la aplicacion), validez de formato, cobertura de hechos y ROUGE-L.

## Capacidades

- Reescritura de insights de gasto personal en dos lineas con formato `INSIGHT:` / `ACTION:`.
- Generacion de simulaciones de ahorro hipoteticas en dos o tres frases.
- Redaccion de mensajes de hitos de metas de ahorro en una frase de maximo 30 palabras.
- Restriccion estricta a las cifras de entrada: el modelo esta entrenado para no introducir cantidades, tasas, productos ni garantias que no aparezcan en el bloque de hechos.
- Formato de salida en texto plano, sin markdown ni emojis, segun el system prompt recomendado.
- Uso de la divisa indicada en el prompt (el ejemplo del autor emplea pesos filipinos, ₱).
- Conversacional basico heredado de Qwen2.5-1.5B-Instruct, aunque el fine-tune esta especializado en la tarea descrita.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Generacion de mensajes de insight en una app de finanzas personales: el modelo recibe un bloque de hechos con las cifras del usuario (suscripciones recurrentes, importe en riesgo) y devuelve dos lineas listas para mostrar en la interfaz, con validacion posterior mediante un guard numerico.
- Simulaciones de ahorro hipoteticas: dado un escenario concreto ("si reduces X en Y al mes, en Z meses tendrias W"), el modelo redacta la explicacion en dos o tres frases sin alterar las cifras, lo que permite integrarlo en un flujo de what-if dentro de la aplicacion.
- Notificaciones de hitos de metas de ahorro: el modelo genera una frase de maximo 30 palabras para celebrar o animar el progreso hacia una meta, adecuada para notificaciones push o correos transaccionales.
- Procesamiento por lotes en backend: con 70,9 tok/s de decodificacion en un Apple M2 Pro 32 GB y una latencia media de 0,92 s por peticion (Q5_K_M, llama-server), es viable generar mensajes personalizados para cohorts de usuarios en una cola de trabajos.
- Despliegue en dispositivo o en portatiles de desarrollo: el fichero Q4_K_M ocupa 0,99 GB y alcanza 83,5 tok/s en el mismo equipo, lo que permite probar el flujo completo en un portatil sin GPU dedicada; el autor no midio rendimiento en Android.
- Prototipado rapido en LM Studio: el modelo se descarga desde la busqueda integrada y se prueba con el system prompt del autor y temperatura 0, lo que facilita evaluar el contrato de salida antes de integrarlo en produccion.
- Generacion de texto de respaldo con fallback deterministico: dado que el autor exige validar cada cifra monetaria contra el bloque de hechos, el modelo puede usarse como primer paso de un pipeline que, si la validacion falla, recurre a una plantilla fija.

## Benchmarks y rendimiento

Evaluacion del autor sobre conjunto de test retenido, n=246, decodificacion greedy, Apple M2 Pro 32 GB, llama-server (llama.cpp con Metal) sobre HTTP:

| Fichero | Tamano | Decode tok/s | Latencia media | Fidelidad numerica | Formato valido | Cobertura de hechos | ROUGE-L |
|---|---|---|---|---|---|---|---|
| Q5_K_M (recomendado) | 1.125.050.144 B (1,1 GB) | 70,9 | 0,92 s | 100,0% | 100,0% | 0,894 | 0,456 |
| Q8_0 | 1.646.572.832 B (1,6 GB) | 71,8 | 0,95 s | 100,0% | 100,0% | 0,913 | 0,447 |
| Q4_K_M | 986.048.288 B (0,99 GB) | 83,5 | 0,76 s | 100,0% | 98,0% | 0,846 | 0,458 |
| f16 (no subido) | no disponible | 47,1 | no disponible | no disponible | no disponible | 0,920 | 0,448 |

Definiciones segun el autor: fidelidad numerica es la tasa de exito de un port del guard de cifras monetarias de la aplicacion; formato valido indica que la salida cruda respeta el contrato de salida; cobertura de hechos es la proporcion de cifras de referencia que la salida menciona. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para Q5_K_M, 1,6 GB para Q8_0 y 0,99 GB para Q4_K_M, mas el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: no se especifican en la informacion disponible; el autor midio en un Apple M2 Pro de 32 GB con backend Metal.
- Cabe en GPU de consumo: si, por el tamano de los ficheros (inferior a 2 GB); no se documentan pruebas en modelos concretos como RTX 4090 o RTX 3060.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja`) y LM Studio; no se documentan vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 70,9 tok/s y 0,92 s de latencia media con Q5_K_M; 83,5 tok/s y 0,76 s con Q4_K_M; 71,8 tok/s y 0,95 s con Q8_0; 47,1 tok/s con f16. Mediciones en un unico equipo y una unica ejecucion, sin intervalos de confianza.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinSight Insight 1.5B (GGUF) | 1,5B | no disponible | Fine-tune especializado en reescritura de hechos financieros | apache-2.0 | GGUF en Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la informacion proporcionada | Modelo generalista de instrucciones | apache-2.0 | safetensors y GGUF en Hugging Face |
| Qwen2.5-1.5B (base) | 1,5B | no disponible en la informacion proporcionada | Modelo base sin ajuste de instrucciones | apache-2.0 | safetensors y GGUF en Hugging Face |

La comparacion con alternativas de la misma categoria (por ejemplo, otros fine-tunes financieros de 1-2B) no esta disponible en la informacion proporcionada. Frente a Qwen2.5-1.5B-Instruct, la diferencia medible es la especializacion: el fine-tune esta disenado para un contrato de salida concreto y se evalua con metricas de fidelidad numerica que el modelo generalista no esta entrenado para optimizar.

## Limitaciones y advertencias

- Entrenado y evaluado solo con datos sinteticos de un unico generador; la robustez frente a datos reales no se ha medido.
- Las referencias del conjunto de test son plantillas, por lo que las metricas basadas en referencia (ROUGE-L) premian la coincidencia con un estilo de casa; no se ejecuto una evaluacion con LLM-as-judge.
- La fidelidad numerica del 100% sobre 246 prompts no es una garantia; el autor exige mantener el guard numerico y recurrir a texto deterministico si falla.
- Una unica ejecucion y semilla, sin intervalos de confianza; no se midio rendimiento en Android ni en movil.
- Fuera de alcance: asesoramiento financiero, orientacion fiscal o de inversion, entradas que no sigan el formato de hechos, otras divisas y otros idiomas distintos del ingles.
- El modelo solo soporta ingles; el ejemplo del autor usa pesos filipinos, pero el texto generado esta en ingles.
- Q4_K_M es la unica cuantizacion que rompe el formato (98,0% de validez) y tiene la cobertura de hechos mas baja (0,846); no se recomienda si el contrato de salida es critico.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; el autor no impone restricciones adicionales en la informacion disponible.
- No es asesoramiento financiero.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/itsonlyfranz/finsight-insight-qwen2.5-1.5b-GGUF
- Adaptador y modelo completo: https://huggingface.co/itsonlyfranz/finsight-insight-qwen2.5-1.5b
- Dataset sintetico: https://huggingface.co/datasets/itsonlyfranz/finsight-insight-synthetic
- Codigo, scripts de entrenamiento y evaluacion: https://github.com/itsonlyfranz/finsight-insight-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
