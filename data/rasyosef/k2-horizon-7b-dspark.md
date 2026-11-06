# rasyosef/K2-Horizon-7B-DSpark

## Resumen

K2-Horizon-7B-DSpark es un modelo borrador (*draft model*) para decodificacion especulativa sin perdida, disenado especificamente para acelerar la inferencia de `IFM/K2-Horizon-7B`. Lo desarrolla el usuario rasyosef y se entrena con la libreria `speculators` del proyecto vLLM. No es un modelo de proposito general: es un componente auxiliar que propone tokens candidatos que el modelo verificador (K2-Horizon-7B) valida en paralelo, manteniendo exactamente la misma distribucion de salida que el modelo base.

La relevancia practica esta en el ahorro de latencia y el aumento de throughput en despliegues de produccion. Segun la model card, el modelo consigue aceleraciones de hasta 5,11x en tareas de razonamiento matematico y 3,00x de media (temperatura 0) sobre el modelo base sin decodificacion especulativa, con una longitud media de aceptacion de 3,37 tokens por paso de verificacion (block size 8).

Arquitectonicamente es un transformer estilo Qwen3 de 4 capas y aproximadamente 0,9B parametros (858.064.129 segun los pesos en safetensors), con hidden size 4096 y MLP de 8192. Usa un vocabulario reducido de 32.000 tokens (frente a los 250.624 del verificador) y se apoya en estados ocultos auxiliares extraidos de las capas 2, 10, 18, 26 y 34 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Qwen3, 4 capas (draft model para decodificacion especulativa) |
| Parametros totales | 858.064.129 (~0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento; evaluado hasta 8K; el verificador se sirve con 32.768 |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,3 GB), requiere `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4 capas con hidden size 4096, MLP de 8192 y atencion con 32 cabezas de query y 8 de KV (head dim 128). Las tres primeras capas usan atencion de ventana deslizante de 512 tokens y la ultima usa atencion completa. El vocabulario del borrador se reduce a 32.000 tokens a partir de los 250.624 del verificador, lo que reduce el coste de la capa de salida. La innovacion clave es el uso de estados ocultos auxiliares del verificador (capas 2, 10, 18, 26 y 34) como entrada adicional, lo que mejora la tasa de aceptacion frente a un borrador puramente independiente.

El entrenamiento uso 100.000 prompts de `mlabonne/open-perfectblend` con respuestas generadas por el propio verificador, longitud de secuencia 8.192, 3 epocas, learning rate 3e-4 con schedule coseno y 4% de warmup. La funcion de perdida combina entropia cruzada (peso 0,1) y una perdida de divergencia total variacional (peso 0,9). Se entreno en una unica GPU NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB). El block size es 8, es decir, el borrador propone hasta 8 tokens por paso de verificacion.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre `IFM/K2-Horizon-7B`, con salida sin perdida (misma distribucion que el verificador).
- Aceleracion de inferencia en modo greedy (temperatura 0): hasta 5,11x en matematicas, 3,01x en codigo y 3,00x de media.
- Longitud media de aceptacion de 3,37 tokens por paso de verificacion (block size 8), con maximos de 5,35 en razonamiento matematico.
- Integracion con vLLM mediante `--speculative-config`, incluyendo soporte del parser de razonamiento `k2_horizon` y del parser de tool calls `k2_horizon`.
- No realiza tareas generativas de forma autonoma: no es un modelo de chat, codigo o vision por si mismo.
- Capacidades multilingues: no disponibles de forma independiente; hereda el comportamiento del verificador.

## Casos de uso

- Servicio de chat en produccion con vLLM: desplegar `IFM/K2-Horizon-7B` con `--speculative-config` apuntando a este borrador para reducir la latencia por token en un 50-70% en cargas interactivas, manteniendo la calidad intacta del verificador.
- Razonamiento matematico y resolución de problemas: es el escenario con mayor ganancia (5,11x de throughput, aceptacion media de 5,35 tokens), adecuado para asistentes de calculo, tutoria STEM o generacion de soluciones paso a paso.
- Generacion de codigo y autocompletado en IDE: con 3,01x de aceleracion en HumanEval, encaja en pipelines de asistencia de codigo donde la latencia percibida es critica.
- RAG sobre documentacion: con 3,03x en el subset `rag` y aceptacion de 3,41, es util en sistemas de pregunta-respuesta sobre corpus largos donde se generan respuestas citadas.
- Agentes con tool calling: el subset `tool_call` muestra 2,71x de aceleracion y el modelo soporta el parser `k2_horizon` para function calling, lo que lo hace apto para orquestadores de agentes con multiples llamadas a herramientas.
- Traduccion y resumen automatizado: aceleraciones de 2,68x y 2,44x respectivamente, utiles en pipelines batch de localizacion o sintesis de documentos.
- Reduccion de coste en inferencia cloud: al aumentar el throughput de 70,9 a 213,0 tokens/s de media en una A100, permite servir mas peticiones por GPU o reducir el numero de instancias.

## Benchmarks y rendimiento

Evaluacion con `RedHatAI/speculator_benchmarks`, temperatura 0, una unica A100, concurrencia 1. Baseline: `K2-Horizon-7B` sin decodificacion especulativa.

| Subset | Baseline (tok/s) | DSpark (tok/s) | Speedup |
|---|---|---|---|
| math_reasoning | 71,4 | 364,5 | 5,11x |
| HumanEval | 71,0 | 213,5 | 3,01x |
| rag | 70,7 | 214,1 | 3,03x |
| qa | 70,8 | 217,6 | 3,07x |
| question | 71,2 | 176,9 | 2,48x |
| writing | 71,0 | 176,3 | 2,48x |
| translation | 71,2 | 190,9 | 2,68x |
| tool_call | 70,4 | 190,5 | 2,71x |
| summarization | 70,7 | 172,8 | 2,44x |
| **Media** | **70,9** | **213,0** | **3,00x** |

Longitud de aceptacion por subset (media ponderada global: 3,370 sobre 298.078 pasos de verificacion):

| Subset | acceptance_length | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 | pos_7 |
|---|---|---|---|---|---|---|---|---|---|
| math_reasoning | 5,350 | 87,8% | 75,6% | 65,4% | 55,8% | 47,7% | 40,5% | 34,0% | 28,1% |
| HumanEval | 3,625 | 78,1% | 57,3% | 41,4% | 29,7% | 21,4% | 15,5% | 11,1% | 7,9% |
| rag | 3,411 | 75,4% | 54,5% | 38,6% | 26,8% | 18,7% | 12,4% | 8,6% | 6,0% |
| qa | 3,326 | 70,9% | 49,9% | 35,8% | 25,6% | 18,8% | 14,0% | 10,3% | 7,2% |
| question | 3,316 | 69,8% | 48,4% | 34,0% | 25,1% | 19,2% | 14,6% | 11,5% | 8,8% |
| writing | 3,284 | 69,3% | 47,9% | 34,0% | 25,0% | 18,9% | 14,3% | 11,0% | 7,9% |
| translation | 3,050 | 68,6% | 47,3% | 32,1% | 21,8% | 14,8% | 9,9% | 6,4% | 4,1% |
| tool_call | 3,018 | 72,0% | 48,5% | 32,0% | 20,4% | 12,9% | 8,0% | 5,0% | 3,0% |
| summarization | 2,863 | 68,6% | 44,5% | 28,9% | 18,9% | 11,8% | 7,1% | 4,1% | 2,4% |

No se han publicado resultados de benchmarks de calidad del modelo base (MMLU, GSM8K u otros) en la informacion disponible; las metricas anteriores miden exclusivamente throughput y aceptacion del borrador.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,7 GB en bfloat16 (858M parametros x 2 bytes), mas overhead de KV cache y estados auxiliares del verificador.
- VRAM total del sistema: la del verificador `IFM/K2-Horizon-7B` (unos 14-15 GB en bf16) mas la del borrador, por lo que se recomienda al menos 24 GB para despliegue conjunto.
- GPU recomendadas: A100 (configuracion usada en la evaluacion), H100, RTX PRO 6000 Blackwell (usada en entrenamiento). Cabe en GPUs consumer de 24 GB (RTX 4090, RTX 3090) para el par verificador + borrador en bf16.
- Despliegue: unicamente via vLLM con `--speculative-config` y `--trust-remote-code`; requiere el parser `k2_horizon` para razonamiento y tool calls. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Rendimiento medido: 213,0 tokens/s de media en una A100 con concurrencia 1 y temperatura 0, frente a 70,9 tokens/s del baseline. No se han publicado datos de latencia a mayor concurrencia.

## Comparativa con modelos similares

No se dispone de informacion sobre otros draft models comparables en la documentacion proporcionada. La comparativa natural es contra el propio modelo base sin decodificacion especulativa:

| Modelo | Parametros | Contexto | Throughput medio (A100, temp 0) | Licencia |
|---|---|---|---|---|
| K2-Horizon-7B (sin drafter) | ~7B (no confirmado) | 32.768 en servicio | 70,9 tok/s | no disponible |
| K2-Horizon-7B + DSpark (este) | ~7B + 0,9B | 8K evaluados | 213,0 tok/s | Apache 2.0 (borrador) |

Alternativas como EAGLE, Medusa o draft models genericos de vLLM no aparecen con datos en la informacion disponible, por lo que no se ofrece comparacion numerica.

## Limitaciones y advertencias

- Solo funciona con `IFM/K2-Horizon-7B`; no es reutilizable con otros verificadores.
- No se evaluo con sampling (temperatura > 0), carga concurrente ni contextos superiores a 8K tokens.
- El contexto de entrenamiento es de 8.192 tokens, muy por debajo de los 32.768 que puede servir el verificador; el rendimiento mas alla de 8K es desconocido.
- No es un modelo generativo autonomo: usarlo sin el verificador no produce resultados utiles.
- Riesgo de alucinacion y sesgos: no evaluados de forma independiente; hereda los del verificador.
- Idiomas soportados: no documentados.
- Requiere `trust_remote_code` y codigo personalizado, lo que implica revisar el codigo remoto antes de desplegar en produccion.
- Licencia Apache 2.0 permite uso comercial del borrador, pero el verificador `IFM/K2-Horizon-7B` tiene su propia licencia que debe verificarse por separado.
- Modelo con muy poca traccion (53 descargas, 0 likes en el momento de la consulta); no hay validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasyosef/K2-Horizon-7B-DSpark
- Archivos del repositorio: https://huggingface.co/rasyosef/K2-Horizon-7B-DSpark/tree/main
- Modelo base (verificador): https://huggingface.co/IFM/K2-Horizon-7B
- Libreria `speculators` (vLLM): https://github.com/vllm-project/speculators
- Codigo de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Dataset de evaluacion: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
