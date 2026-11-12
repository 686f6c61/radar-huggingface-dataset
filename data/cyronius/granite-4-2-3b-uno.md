# Cyronius/granite-4.2-3b-uno

## Resumen

Granite 4.2 3B — Uno drafter adapter es un adaptador LoRA de rango 128 publicado por el usuario Cyronius que convierte el modelo base ibm-granite/granite-4.2-3b en un borrador (drafter) paralelo sin pérdida de calidad, siguiendo la receta del proyecto Uno (arXiv 2609.04010). No es un modelo autónomo: es un complemento que se acopla al modelo de IBM para acelerar la decodificación especulativa, de modo que la salida codiciosa (greedy) sea idéntica a la del Granite original. El adaptador solo puede cambiar la velocidad, nunca la respuesta.

El repositorio, de 5,0 GB, contiene tres formas del mismo adaptador: el adaptador PEFT en safetensors para PyTorch, una compilación para NPU AMD XDNA 2 en formato q4nx para OpenFlowLM-Next, y un LoRA en GGUF (f32) cuya integración con llama.cpp aún no está disponible. El adaptador añade 249.036.800 parámetros sobre el modelo base y se distribuye con licencia Apache 2.0.

Su relevancia es acotada pero técnica: demuestra una receta de decodificación especulativa con verificación exacta por prefijo sobre un modelo denso de 3B, con resultados medidos en GPU y en NPU. El rendimiento medido es modesto y muy dependiente del caso de uso: entre 0,76x y 2,39x según prompt y contexto, con una media geométrica de 1,00x en prompts cortos cuando el drafter se usa en todos los ciclos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 128) sobre transformer denso ibm-granite/granite-4.2-3b; decodificación especulativa por block-diffusion |
| Parametros totales | 249.036.800 (adaptador); el modelo base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | bf16 (PyTorch), q4nx (NPU), GGUF f32 (LoRA); el autor reporta pruebas con base fake-quantized a q4_1 y Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), q4nx (NPU), GGUF (LoRA f32) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 que se activa únicamente sobre las filas de ruido durante la fase de borrador. La decodificación funciona en ciclos de dos pasadas sobre el mismo modelo: en la primera, se alimenta el último token confirmado más S−1 filas de ruido aleatorio con el LoRA activado, y una sola pasada paralela propone los siguientes S tokens; en la segunda, la propuesta se pasa por el modelo base congelado con el LoRA desactivado y se conserva el prefijo más largo que coincide con la elección greedy del base, más el token propio del base en el primer fallo. La aceptación es una coincidencia exacta de prefijo, lo que garantiza que la salida sea igual a la decodificación autorregresiva de Granite.

El adaptador se entrenó para S=8 filas; las filas más allá de 8 no se entrenaron, por lo que S=16 solo aporta aproximadamente un 2% adicional de tokens por pasada. No se detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. La innovación principal es la combinación de block-diffusion con verificación exacta por prefijo, que permite acelerar sin degradar la calidad. El autor reporta que la cuantización del base a q4 cuesta menos del 0,5% de TPF a S=8, sin necesidad de una fase de quantization-aware training.

## Capacidades

- Generación de texto y decodificación especulativa sin pérdida: la salida greedy coincide con la del Granite base.
- Borrador paralelo de tokens con verificación exacta por prefijo.
- Aceleración selectiva por ciclo: el motor OpenFlowLM-Next elige entre prompt lookup, ciclo Uno o paso simple según el rendimiento esperado.
- Soporte en GPU y CPU vía PyTorch (adaptador PEFT).
- Soporte en NPU AMD XDNA 2 vía OpenFlowLM-Next con formato q4nx.
- Exportación a LoRA GGUF (f32) para uso futuro con llama.cpp.
- No aporta capacidades nuevas de razonamiento, código, matemáticas, visión o tool calling: estas dependen íntegramente del modelo base Granite 4.2 3B.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Edición de ficheros completos en el editor: el autor mide 1,56x de aceleración en una edición de fichero completo con 1347 tokens de contexto y 2,39x en una corrección de bug de fichero completo con 1390 tokens. El mecanismo de prompt lookup, que no requiere el adaptador, es el principal responsable de esta ganancia.
- Citar fragmentos de un documento: con 1032 tokens de contexto se mide 1,35x de aceleración; útil en asistentes que deben extraer citas literales de documentación larga.
- Responder preguntas a partir de un documento: 1,49x con 728 tokens de contexto, adecuado para pipelines de QA sobre documentación técnica.
- Generación de código en prompts cortos: 1,18x y 1,07x en dos prompts de código a contexto corto, gracias a que el código acepta más tokens por ciclo (3,43 tokens por ciclo frente a 2,91 en chat).
- Razonamiento matemático a contexto corto: 1,11x de aceleración, con TPF de 2,135 a S=8 en el conjunto de matemáticas.
- Despliegue en portátiles con NPU AMD XDNA 2 (por ejemplo, Ryzen AI 9 HX 370): permite acelerar la decodificación en local sin GPU dedicada, con el motor OpenFlowLM-Next y el formato q4nx.
- Integración en pipelines PyTorch existentes sobre Granite 4.2 3B: el adaptador PEFT se puede cargar sin cambiar la lógica de verificación, ya que la salida es idéntica a la del base.

## Benchmarks y rendimiento

Tokens por pasada (TPF) en un conjunto de 60 prompts (20 matemáticas, 20 instrucciones, 10 código, 10 chat), greedy, 256 tokens nuevos, PyTorch en GPU:

| Configuración | Global | Matemáticas | Código | IFEval | Chat | Máximo posible |
|---|---|---|---|---|---|---|
| S=4, bf16 | 1,586 | 1,783 | 1,572 | 1,509 | 1,430 | 2,5 |
| S=8, bf16 | 1,765 | 2,135 | 1,753 | 1,623 | 1,513 | 4,5 |
| S=16, bf16 | 1,807 | 2,220 | 1,800 | 1,637 | 1,559 | 8,5 |
| S=8, base fake-quantized a q4_1 | 1,763 | 2,149 | 1,727 | 1,644 | 1,478 | 4,5 |
| S=8, base fake-quantized a Q4_K (aprox.) | 1,757 | 2,080 | 1,800 | 1,653 | 1,456 | 4,5 |

Velocidad en NPU AMD XDNA 2 (Ryzen AI 9 HX 370, q4_1, 4 filas por pasada, 96 tokens, drafter en todos los ciclos):

| Contexto | Prompt | Tokens por ciclo | Uno | Decodificación simple | Aceleración |
|---|---|---|---|---|---|
| 64 | chat | 2,91 | 21,95 tok/s | 23,0 tok/s | 0,96x |
| 512 | chat | 2,74 | 19,50 | 22,2 | 0,88x |
| 1024 | chat | 2,59 | 17,28 | 21,4 | 0,81x |
| 2048 | chat | 2,53 | 14,99 | 19,7 | 0,76x |
| 64 | código | 3,43 | 25,83 | 23,1 | 1,12x |
| 512 | código | 3,00 | 21,33 | 22,3 | 0,96x |
| 1024 | código | 2,82 | 18,82 | 21,3 | 0,89x |
| 2048 | código | 3,43 | 20,34 | 19,7 | 1,03x |

Selección por ciclo (OFLM_SPECULATIVE=1, 128 tokens, 256 en las últimas cuatro filas):

| Prompt | Contexto | Decodificación simple | Selección por ciclo | Aceleración |
|---|---|---|---|---|
| chat | corto | 23,7 tok/s | 23,49 tok/s | 0,99x |
| chat 2 | corto | 23,8 | 24,11 | 1,01x |
| código | corto | 23,7 | 27,94 | 1,18x |
| código 2 | corto | 23,6 | 25,19 | 1,07x |
| matemáticas | corto | 23,7 | 26,34 | 1,11x |
| razonamiento | corto | 23,6 | 26,54 | 1,12x |
| chat | 1024 | 21,0 | 20,97 | 1,00x |
| código | 1024 | 21,1 | 24,40 | 1,16x |
| chat | 2048 | 18,8 | 19,75 | 1,05x |
| código | 2048 | 18,8 | 20,67 | 1,10x |
| edición de fichero completo | 1347 | 20,1 | 31,43 | 1,56x |
| corrección de bug de fichero completo | 1390 | 20,1 | 48,03 | 2,39x |
| citar documento | 1032 | 20,7 | 27,88 | 1,35x |
| responder desde documento | 728 | 21,4 | 32,05 | 1,49x |

El autor advierte que la mayor parte de la ganancia en la tabla de selección por ciclo proviene del prompt lookup, que no necesita el adaptador. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 249 millones de parámetros y el modelo base Granite 4.2 3B debe cargarse aparte.
- GPU recomendadas: no especificadas; las pruebas de TPF se hicieron en GPU sin modelo concreto indicado.
- Consumer GPU: no se indica compatibilidad concreta; el adaptador PEFT se puede cargar en PyTorch sobre cualquier GPU que soporte el modelo base.
- NPU: soportado en AMD XDNA 2 con OpenFlowLM-Next y formato q4nx; medido en Ryzen AI 9 HX 370.
- Opciones de despliegue: PyTorch (adaptador PEFT), OpenFlowLM-Next (NPU), GGUF/llama.cpp pendiente de integración.
- Latencia y throughput: en NPU, decodificación simple de 23,4 / 22,3 / 21,4 / 19,7 tok/s tras 0 / 512 / 1024 / 2048 tokens de contexto. Un ciclo Uno cuesta 3,2 pasos de decodificación a contexto corto y 3,3 a 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Cyronius/granite-4.2-3b-uno | 249 M (adaptador) sobre base 3B | no disponible | Apache 2.0 | LoRA drafter para decodificación especulativa | Hugging Face (PEFT, q4nx, GGUF) |
| ibm-granite/granite-4.2-3b | 3B | no disponible | Apache 2.0 | Modelo base denso | Hugging Face |
| Uno (receta original, ifm-ai/uno) | no disponible | no disponible | no disponible | Decodificación especulativa por block-diffusion | GitHub |
| EAGLE / Medusa (drafters especulativos) | no disponible | no disponible | no disponible | Cabezas de borrador para decodificación especulativa | Repositorios públicos |

No se dispone de datos comparativos de rendimiento frente a otras técnicas de decodificación especulativa en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base ibm-granite/granite-4.2-3b y solo funciona como drafter en un motor compatible (PyTorch con verificación propia u OpenFlowLM-Next).
- La aceleración no es universal: en chat el drafter rinde por debajo de la decodificación simple (0,76x a 2048 tokens de contexto) y la media geométrica en prompts cortos es 1,00x.
- TPF no equivale a velocidad: el propio autor corrige una proyección anterior de 1,65x que no se cumplió al medir el coste real de la pasada multi-fila.
- Pérdida de igualdad exacta en bf16: 5 de 10 prompts divergen en un empate cercano respecto a la decodificación autorregresiva; todas las divergencias desaparecen en fp32.
- El adaptador solo se entrenó para S=8; usar S=16 aporta solo un 2% adicional de TPF.
- La integración GGUF con llama.cpp no está disponible todavía; el LoRA GGUF no tiene runtime confirmado.
- El soporte en NPU está limitado a OpenFlowLM-Next sobre AMD XDNA 2 y a los kernels de octubre de 2026.
- Idiomas soportados no especificados; las capacidades lingüísticas dependen del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; heredados del modelo base.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene verificar la licencia del modelo base por separado.
- Repositorio con 2 descargas y 0 likes: proyecto muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Cyronius/granite-4.2-3b-uno
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Receta Uno (GitHub): https://github.com/ifm-ai/uno
- Paper Uno: arXiv 2609.04010
- Motor OpenFlowLM-Next: https://github.com/Atomic-Germ/OpenFlowLM-Next
