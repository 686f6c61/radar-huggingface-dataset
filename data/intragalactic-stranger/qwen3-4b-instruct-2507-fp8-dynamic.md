# intragalactic-stranger/Qwen3-4B-Instruct-2507-FP8-Dynamic

## Resumen

Qwen3-4B-Instruct-2507-FP8-Dynamic es una cuantizacion en FP8 del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario intragalactic-stranger dentro del proyecto Cortex Serve. Se trata de una conversion W8A8 (pesos y activaciones en FP8) generada con llmcompressor y compressed-tensors, sin calibracion (data-free), que mantiene la licencia Apache-2.0 del modelo original. El modelo base es un transformer denso de 4.022.468.096 parametros orientado a instrucciones, con ventana de contexto nativa de 262.144 tokens y modo de razonamiento hibrido (thinking/no-thinking).

La relevancia de esta variante es practica: reduce el peso en disco a 4,12 GiB y acelera la inferencia en GPUs con soporte nativo de FP8 (compute capability 8.9 o superior, como L4, L40S y H100). Segun la model card, la calidad se mantiene dentro de los intervalos de confianza del modelo en bf16 en ARC-Challenge, HellaSwag, MMLU-Pro, GSM8K e IFEval, con una perdida de perplejidad en WikiText-2 de solo el 1,3 %. El rendimiento medido en vLLM 0.32.0 muestra mejoras de entre el 16 % y el 37 % en latencia por token y de hasta el 26 % en throughput con alta concurrencia.

Es una opcion adecuada para despliegues de produccion en vLLM sobre hardware Ada o Hopper donde se quiera maximizar el numero de tokens por segundo y reducir el coste por peticion sin renunciar a la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | FP8 E4M3 W8A8: pesos por canal, activaciones dinamicas por token |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen3 es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del transformer denso Qwen3-4B-Instruct-2507. No se ha reentrenado ni ajustado: la conversion se realizo con llmcompressor 0.15.0 y compressed-tensors 0.20.1 sobre torch 2.14.1 y transformers 5.21.0, partiendo del commit `cdbee75f` del modelo base. Los pesos se cuantizan a FP8 E4M3 con escala por canal y las activaciones se cuantizan dinamicamente a FP8 por token en tiempo de inferencia. El proceso es data-free: no se uso conjunto de calibracion, lo que elimina el riesgo de sobreajuste al dominio de calibracion y simplifica la reproducibilidad. La conversion completa se ejecuto en una GPU NVIDIA L4 en 18 segundos.

El resultado ocupa 4,12 GiB en disco y se sirve directamente con vLLM (`vllm serve intragalactic-stranger/Qwen3-4B-Instruct-2507-FP8-Dynamic`). El modelo base incorpora las innovaciones de la familia Qwen3-2507: modo de razonamiento hibrido (thinking y no-thinking), soporte nativo de tool calling y contexto largo. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo original en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en modo thinking y no-thinking (heredado de Qwen3-4B-Instruct-2507).
- Generacion de codigo y resolucion de problemas matematicos (GSM8K 74,1 % en 5-shot estricto).
- Seguimiento de instrucciones a nivel de prompt (IFEval 81,3 % estricto).
- Soporte de tool calling y function calling (capacidad del modelo base).
- Capacidades de agente y razonamiento multi-paso (capacidad del modelo base).
- Ventana de contexto larga de hasta 262.144 tokens para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues heredadas del modelo base (idiomas exactos no disponibles en la informacion proporcionada).
- Inferencia acelerada en hardware con FP8 nativo (Ada Lovelace y Hopper).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 262.144 tokens, manteniendo coherencia en dialogos largos y reduciendo el coste por token frente a la version bf16.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD o asistentes de IDE; el throughput de 996 tokens/s en L4 con 64 usuarios concurrentes lo hace viable para equipos de desarrollo de tamano medio.
- Procesamiento de documentos largos: resumen y extraccion de informacion de contratos, informes o expedientes regulatorios (la model card reporta perplejidad de 5,977 en un corpus de regulacion financiera estadounidense, frente a 5,965 en bf16).
- Razonamiento matematico y analisis cuantitativo: con un 74,1 % en GSM8K en 5-shot, es adecuado para asistentes de calculo, verificacion de formulas y tareas de analisis financiero sencillo.
- Despliegue en infraestructura con GPUs L4 o L40S: permite servir un modelo de 4B con contexto largo en GPUs de coste moderado, con latencia de 21,1 ms por token en single-user frente a 33,3 ms en bf16.
- Servicio de alto throughput en H100: con 11.710 tokens/s a 128 usuarios concurrentes, es adecuado para APIs publicas de generacion de texto donde el coste por token es critico.
- Clasificacion y extraccion de entidades en pipelines de datos: la cuantizacion FP8 mantiene la calidad en tareas de comprension (ARC-Challenge 58,7; HellaSwag 58,1), lo que permite usarlo en procesos batch de etiquetado.

## Benchmarks y rendimiento

Resultados de calidad (vLLM 0.32.0, lm-evaluation-harness 0.4.13, mismos items para cada variante; ± = intervalo de confianza del 95 %):

| Benchmark | Este modelo | bf16 | Delta |
|---|---|---|---|
| ARC-Challenge (acc_norm, 1.172 items) | 58,7 ±2,8 | 58,3 | +0,4 |
| HellaSwag (acc_norm, primeros 2.000) | 58,1 ±2,2 | 58,5 | -0,3 |
| MMLU-Pro (logprob MC, primeros 1.000) | 34,1 ±2,9 | 34,5 | -0,4 |
| GSM8K 5-shot (estricto) | 74,1 ±2,4 | 72,8 | +1,3 |
| GSM8K 5-shot (extraccion flexible) | 79,6 ±2,2 | 78,8 | +0,8 |
| IFEval (prompt-level estricto) | 81,3 ±3,3 | 83,4 | -2,0 |
| WikiText-2 perplejidad por palabra (menor es mejor) | 14,446 | 14,266 | +1,3 % |
| Perplejidad en regulacion financiera de EE. UU. (menor es mejor) | 5,977 | 5,965 | +0,2 % |

Rendimiento (vLLM 0.32.0, carga de chat Qwen de 512 tokens de entrada / 256 de salida, concurrencia en bucle cerrado):

| GPU | Metrica | bf16 | Este modelo |
|---|---|---|---|
| NVIDIA L4 | ms por token de salida, 1 usuario | 33,3 | 21,1 |
| NVIDIA L4 | tokens de salida/s, 64 usuarios | 792 | 996 |
| NVIDIA H100 80GB | ms por token de salida, 1 usuario | 4,15 | 3,12 |
| NVIDIA H100 80GB | tokens de salida/s, 128 usuarios | 10.079 | 11.710 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB para pesos FP8 mas overhead de KV cache; el repo ocupa 4,12 GiB en disco.
- GPU recomendadas: NVIDIA L4, L40S, H100 (compute capability ≥ 8.9 para computo FP8 nativo). En GPUs anteriores (Ampere, Turing) el modelo cae a FP8 solo de pesos, perdiendo parte de la ventaja de rendimiento.
- Cabe en GPU de consumo: si, en tarjetas con soporte FP8 como la RTX 4090 (Ada, 24 GB); en GPUs Ampere como la RTX 3090 funciona en modo solo pesos.
- Opciones de despliegue: vLLM (soporte nativo y recomendado, `vllm serve`); el formato compressed-tensors es compatible con el ecosistema vLLM, pero no se garantiza compatibilidad directa con llama.cpp u Ollama en formato FP8.
- Latencia y throughput medidos: 21,1 ms por token en L4 single-user y 996 tokens/s en L4 con 64 usuarios; 3,12 ms por token en H100 single-user y 11.710 tokens/s en H100 con 128 usuarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-FP8-Dynamic (este) | 4,02 B | 262.144 | Apache-2.0 | safetensors FP8 W8A8 | Cuantizacion data-free, optimizada para vLLM en Ada/Hopper |
| Qwen3-4B-Instruct-2507 (bf16) | 4,02 B | 262.144 | Apache-2.0 | safetensors bf16 | Referencia de calidad; mayor latencia y peso |
| Qwen FP8 oficial de Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 | Apache-2.0 | safetensors FP8 | La model card indica que la calidad de esta variante coincide con la del FP8 oficial dentro de los intervalos de confianza |
| Qwen3-4B (generacion anterior) | 4,02 B | 32.768 (nativo) | Apache-2.0 | safetensors | Contexto mucho menor y sin las mejoras de la revision 2507 |

## Limitaciones y advertencias

- La cuantizacion FP8 introduce una perdida de calidad pequena pero medible: -2,0 puntos en IFEval estricto y +1,3 % de perplejidad en WikiText-2 respecto a bf16.
- El computo FP8 nativo requiere compute capability ≥ 8.9; en GPUs mas antiguas el modelo funciona en modo solo pesos con menor ganancia de rendimiento.
- No se ha publicado informacion sobre sesgos especificos de esta variante; hereda los sesgos del modelo base Qwen3-4B-Instruct-2507.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en tareas de conocimiento factual y contextos muy largos.
- La lista de idiomas soportados no esta documentada en la informacion disponible; conviene validar el rendimiento en el idioma objetivo antes de produccion.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha; es una publicacion reciente sin validacion independiente de la comunidad.
- Aunque la licencia es Apache-2.0 (permite uso comercial), conviene revisar los terminos del modelo base Qwen3-4B-Instruct-2507 para confirmar obligaciones de atribucion.
- El autor declara que todos los numeros son reproducibles desde configuraciones y manifiestos del proyecto Cortex, pero no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intragalactic-stranger/Qwen3-4B-Instruct-2507-FP8-Dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto Cortex: https://github.com/intragalactic-stranger/cortex
- Commit de origen de la conversion: https://github.com/intragalactic-stranger/cortex/commit/1c526987b4ada4368b490e8a30eb130d13fef352
- Resultados del hito M3 (referenciados en la model card): `serve/RESULTS.md` dentro del repositorio de Cortex
