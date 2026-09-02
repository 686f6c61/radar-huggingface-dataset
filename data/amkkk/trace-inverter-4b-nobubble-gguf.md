# amkkk/Trace-Inverter-4B-NoBubble-GGUF

## Resumen

Trace-Inverter-4B-NoBubble es un modelo de 4.022 millones de parametros, fine-tune del base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario amkkk. Su funcion es la de inverter trazas de razonamiento: dado un problema o contexto conversacional y una respuesta final conocida, reconstruye una traza de razonamiento sintetica detallada envuelta en las etiquetas `thinking` y `response`. No requiere ni "bubble" de razonamiento, ni resumen de razonamiento, ni scratchpad, ni cadena de pensamiento oculta como entrada.

La variante NoBubble se distingue del modelo original Jackrong/Trace-Inverter-4B en que no consume bubbles de razonamiento en inferencia, siguiendo la formulacion no-bubble de Zhang et al. (articulo "How to Steal Reasoning Without Reasoning Traces"), aunque no es una reproduccion exacta de su experimento de entrenamiento no-summary: las trazas objetivo fueron generadas por un modelo de inversion condicionado por bubble, mientras que el estudiante no recibe informacion de bubble alguna.

Esta ficha cubre la version GGUF Q8_0, publicada bajo licencia Apache 2.0, pensada para ejecutarse en runtimes compatibles con llama.cpp (llama-cli, Ollama, LM Studio). Las trazas generadas son reconstrucciones sinteticas y no deben presentarse como el razonamiento oculto real de Claude, Qwen ni de ningun modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (fine-tune de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso con atencion por ventanas (GQA) y tokenizer de Qwen3, al que se le aplico un fine-tune especifico para inversion de trazas. El entrenamiento sigue el planteamiento del articulo "How to Steal Reasoning Without Reasoning Traces": se parte de un problema y una respuesta final, y el modelo aprende a reconstruir una traza de razonamiento sintetica completa. En la variante NoBubble, el estudiante no recibe ni bubble de razonamiento ni resumen como entrada, lo que obliga al modelo a inferir el proceso de razonamiento intermedio exclusivamente a partir del enunciado y de la respuesta final.

Las trazas objetivo fueron generadas originalmente por un modelo de inversion condicionado por bubble, y los datasets de trazas sinteticas provienen del trabajo de Jackrong. Segun la model card, la evaluacion determinista public-10 se ejecuto localmente contra `data/processed/public10.jsonl` mediante el servidor de llama.cpp. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Reconstruccion de trazas de razonamiento sinteticas a partir de un problema y una respuesta final conocida.
- Generacion de salida en formato estructurado con etiquetas `thinking` y `response`.
- No requiere bubble de razonamiento, resumen, scratchpad ni cadena de pensamiento oculta como entrada.
- Soporte de formato de chat mediante el template del tokenizer de Qwen3 (heredado del base).
- Sin soporte de tool calling: la tasa de `<tool_call>` en evaluacion public-10 es del 0,0 %.
- Monolingue en ingles.
- No es un modelo de proposito general: esta especializado en inversion de trazas, no en generacion conversacional generalista.

## Casos de uso

- Generacion de datasets sinteticos de razonamiento: dado un conjunto de problemas con respuestas verificadas, el modelo produce trazas de razonamiento detalladas que pueden usarse para fine-tunear modelos mas pequenos de razonamiento sin necesidad de acceder a cadenas de pensamiento ocultas de modelos propietarios.
- Investigacion sobre extraccion de razonamiento: permite estudiar hasta que punto es posible reconstruir el proceso de razonamiento de un modelo a partir de solo su respuesta final, un problema relevante para la transparencia y la seguridad de modelos de IA.
- Aumento de datos para entrenamiento de modelos de razonamiento: las trazas sinteticas generadas pueden combinarse con datasets existentes para incrementar la diversidad de ejemplos de razonamiento paso a paso.
- Evaluacion de la fidelidad de trazas reconstruidas: sirve como base para comparar trazas sinteticas reconstruidas frente a trazas reales de modelos fuente, midiendo metricas como F1 de tokens, ROUGE-L y ratio de longitud.
- Analisis post-hoc de respuestas de modelos: dado un log de conversacion con respuestas finales, se pueden reconstruir posibles procesos de razonamiento para auditoria o depuracion de comportamiento.
- Benchmarking de inversores de trazas: al ser una variante NoBubble, permite comparar el rendimiento frente al modelo original Jackrong/Trace-Inverter-4B que consume bubbles, aislando el efecto de la informacion de bubble en la calidad de la reconstruccion.

## Benchmarks y rendimiento

La model card publica una evaluacion determinista sobre el conjunto public-10, ejecutada localmente con el servidor de llama.cpp. Comparacion entre el release BF16 publicado y la version GGUF Q8_0:

| Metrica | BF16 publicado | GGUF Q8_0 |
|---|---|---|
| Token F1 | 0,6500 | 0,6567 |
| ROUGE-L | 0,3916 | 0,3981 |
| Length ratio | 0,9366 | 0,9568 |
| Format pass | 100,0 % | 100,0 % |
| Tasa de `<tool_call>` | 0,0 % | 0,0 % |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. La evaluacion se limita al conjunto public-10, de tamano reducido.

## Requisitos de hardware

- Tamano del archivo GGUF Q8_0: aproximadamente 4,3 GB, lo que lo hace viable en GPUs de consumo con 8 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4080).
- En cuantizacion Q8_0, la VRAM estimada para inferencia es de unos 5-6 GB incluyendo overhead del runtime, por lo que cabe en la mayoria de GPUs consumer actuales.
- Puede ejecutarse tambien en CPU con llama.cpp, aunque con mayor latencia.
- GPUs recomendadas: cualquier GPU con 8 GB o mas de VRAM; para produccion con mayor throughput, una A100 o H100 no es necesaria dado el tamano del modelo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (via Modelfile), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| amkkk/Trace-Inverter-4B-NoBubble (GGUF Q8_0) | 4,02 B | Problema + respuesta final | Traza de razonamiento sintetica | Apache 2.0 | GGUF |
| Jackrong/Trace-Inverter-4B | 4,02 B (estimado) | Problema + respuesta final + bubble de razonamiento | Traza de razonamiento sintetica | no disponible | no disponible |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | Conversacion / instruccion | Texto generico, razonamiento | Apache 2.0 | Safetensors, GGUF |

La diferencia clave con Jackrong/Trace-Inverter-4B es que la variante NoBubble no consume bubbles de razonamiento en inferencia, mientras que el original si lo hace. Respecto al modelo base Qwen3-4B-Instruct-2507, este fine-tune sacrifica la generacion conversacional generalista a cambio de una especializacion en reconstruccion de trazas.

## Limitaciones y advertencias

- Las trazas generadas son reconstrucciones sinteticas y no deben presentarse como el razonamiento oculto real de Claude, Qwen ni de ningun modelo fuente.
- Modelo monolingue en ingles; no soporta espanol ni otros idiomas de forma nativa.
- Sin soporte de tool calling ni capacidades de agente.
- La evaluacion publicada se limita al conjunto public-10, de tamano reducido; no hay datos de benchmarks estandar que permitan comparar su rendimiento general.
- No es adecuado para generacion conversacional generalista ni para tareas fuera del ambito de inversion de trazas.
- La informacion sobre datos de entrenamiento, numero de tokens y metodologia completa de fine-tune no esta disponible en la model card del release GGUF; se remite a la model card del release BF16 para detalles.
- El modelo es una especializacion de Qwen3-4B-Instruct-2507 y hereda sus limitaciones de contexto, sesgos y riesgos de alucinacion, aunque estos no estan documentados en la informacion proporcionada.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/amkkk/Trace-Inverter-4B-NoBubble-GGUF
- Release BF16 (pesos originales): https://huggingface.co/amkkk/Trace-Inverter-4B-NoBubble
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original con bubbles: https://huggingface.co/Jackrong/Trace-Inverter-4B
- Pagina del modelo en FriendliAI: https://friendli.ai/models/amkkk/Trace-Inverter-4B-NoBubble
- Articulo de referencia "How to Steal Reasoning Without Reasoning Traces": no se ha localizado un enlace directo al paper en la informacion disponible.
