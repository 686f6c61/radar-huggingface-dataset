# atutej/dspark_qwen3_0_6b-sft-nemotron-terminal-corpus_nemotron-terminal-corpus_onpolicy-20261013

## Resumen

Este repositorio contiene un borrador (drafter) de decodificacion especulativa DSpark para el modelo objetivo `atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011`, un Qwen3-0.6B afinado por SFT sobre `nvidia/Nemotron-Terminal-Corpus`. No se trata de un modelo de lenguaje autonomo que genere respuestas por si mismo, sino de una cabeza predictora ligera cuyo unico proposito es proponer bloques de tokens que el modelo objetivo verifique a continuacion, acelerando la inferencia sin alterar su distribucion de salida.

El drafter tiene 130.381.441 parametros, 3 capas, block size de 8 tokens y un vocabulario de borrador reducido a 32.000 entradas. Se entreno con la libreria `speculators` (fork `atutej/speculators`, rama `nemotron-terminal-preset`) generando datos on-policy: las respuestas del corpus Nemotron-Terminal se regeneraron turno a turno con el propio modelo objetivo, y el borrador aprendio sobre los estados ocultos resultantes.

Su relevancia es de caracter practico y de investigacion: demuestra un flujo completo de destilacion especulativa sobre un dominio estrecho (comandos y sesiones de terminal) y aporta metricas de aceptacion medibles, como una tasa de aceptacion de 0.7605 y una longitud de aceptacion de 5.7321 tokens por paso de verificacion. La ficha siguiente describe sus especificaciones, su esquema de entrenamiento y las condiciones reales de uso con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DSpark (transformer de borrador, 3 capas, block size 8, vocabulario de borrador reducido a 32000) |
| Parametros totales | 130.381.441 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16384 tokens (longitud de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de tipo DSpark, disenado para decodificacion especulativa en bloque. Consta de 3 capas y predice bloques de 8 tokens (`num_speculative_tokens: 8`) sobre un vocabulario de borrador reducido de 32.000 entradas. Incorpora una cabeza de Markov de rango 256 en su variante vanilla y una cabeza de confianza (`confidence head true`), que se emplea para estimar la probabilidad de aceptacion de cada token propuesto. El repositorio contiene un unico checkpoint, que es simultaneamente el mejor por validacion y el mas reciente, situado en la raiz del repositorio.

El entrenamiento fue online: los estados ocultos del modelo objetivo se transmitieron mediante vLLM a traves de Mooncake, y el borrador se entreno sobre ellos. Los hiperparametros reportados son longitud de secuencia 16384, maximo de anclas 6144, learning rate 0.0003, 1 epoca y una funcion de perdida compuesta `{"ce": 0.1, "tv": 0.9}`. Los datos son on-policy: para el objetivo SFT, las respuestas a las conversaciones de `nvidia/Nemotron-Terminal-Corpus` (una muestra sembrada de 100.000 ejemplos) se regeneraron turno a turno por el propio modelo objetivo, afinado Qwen3-0.6B sobre el mismo corpus, y el borrador se entreno sobre sus estados ocultos. El `config.json` apunta a un `config.py` con la clase personalizada `DSparkSpeculatorConfig`, que aporta la libreria `speculators` cuando esta instalada.

## Capacidades

- Prediccion especulativa de bloques de 8 tokens para acelerar al modelo objetivo `atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011`.
- Estimacion de confianza por token mediante una cabeza dedicada, con `confidence_pred_mean_epoch` de 0.7604 y `confidence_abs_error_epoch` de 0.1335.
- Modelado del siguiente token condicionado a los estados ocultos del objetivo (no genera texto de forma autonoma).
- Especializacion en el dominio de terminal y linea de comandos, heredada del corpus Nemotron-Terminal.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento propios: su unica funcion es la propuesta de tokens para verificacion.
- El soporte multilingue no esta documentado; el unico ambito declarado es el corpus de terminal empleado en el entrenamiento.

## Casos de uso

- Aceleracion de inferencia en produccion sobre el modelo objetivo: el drafter propone 8 tokens por paso y se integra con vLLM mediante `--speculative-config`, reduciendo el numero de pasos de decodificacion del objetivo en tareas de terminal.
- Asistentes de linea de comandos en tiempo real: en un agente que sugiere comandos shell, la aceptacion medida (longitud de aceptacion de 5.7321) implica que varios tokens propuestos se confirman por paso, lo que recorta la latencia percibida en sesiones interactivas.
- Automatizacion de operaciones de sistema (DevOps/SRE): en pipelines que emiten comandos a partir de contexto de terminal, el borrador especializado en el dominio acelera la generacion sin cambiar la salida del modelo objetivo, que sigue siendo el que decide.
- Servicio de autocompletado de shell: al compartir vocabulario y distribucion con el objetivo afinado en Nemotron-Terminal, el borrador es adecuado para completar comandos y rutas en entornos de consola.
- Investigacion en decodificacion especulativa: el repositorio documenta un flujo completo de entrenamiento on-policy con estados ocultos transmitidos desde vLLM, util como referencia para reproducir destilaciones especulativas sobre dominios estrechos.
- Evaluacion comparativa de borradores: sirve como punto de partida para medir tasas de aceptacion y longitud de aceptacion frente a otras tecnicas de borrador (EAGLE, Medusa, Lookahead) en la misma tarea de terminal.
- Despliegue con recursos minimos: al sumar solo 130 M de parametros sobre un objetivo de 0.6 B, permite acelerar un modelo pequeno en hardware modesto, escenario poco cubierto por borradores pensados para modelos grandes.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (MMLU, HumanEval, GSM8K) sino metricas de validacion internas del borrador, forzadas por profesor y sobre filas de la distribucion de entrenamiento.

| Metrica | Valor |
|---|---|
| accept_rate_epoch | 0.7605 |
| accept_len_epoch | 5.7321 |
| eal_epoch | 5.9185 |
| full_acc_epoch | 0.7730 |
| position_0_acc_epoch | 0.9052 |
| position_1_acc_epoch | 0.8637 |
| position_2_acc_epoch | 0.8248 |
| position_3_acc_epoch | 0.7875 |
| position_4_acc_epoch | 0.7514 |
| position_5_acc_epoch | 0.7170 |
| position_6_acc_epoch | 0.6835 |
| position_7_acc_epoch | 0.6498 |
| loss_epoch | 0.2881 |
| ce_loss_epoch | 0.3684 |
| tv_loss_epoch | 0.0969 |
| confidence_loss_epoch | 0.1640 |
| confidence_abs_error_epoch | 0.1335 |
| confidence_pred_mean_epoch | 0.7604 |
| confidence_cumprod_bias_epoch | -0.0148 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El borrador tiene 130.381.441 parametros y el repositorio ocupa 0.3 GB, por lo que en bfloat16 ocupa aproximadamente 0.26 GB de pesos, ademas de las activaciones y del modelo objetivo que debe acompanar. La VRAM total del sistema es la del objetivo (Qwen3-0.6B) mas este margen reducido; no se proporcionan cifras exactas.
- Cabe con holgura en GPU de consumo (por ejemplo, RTX 3060, RTX 4070, RTX 4090) junto al modelo objetivo de 0.6 B, ya que el conjunto no supera unos pocos GB en bfloat16.
- Tambien es viable en entornos sin GPU dedicada si el objetivo se sirve cuantizado, aunque la ruta de integracion documentada asume vLLM.
- Despliegue: requiere el fork de vLLM de Marin, que soporta `method: dspark`. El comando indicado en la model card es:
  `vllm serve atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011 --dtype bfloat16 --speculative-config '{"model": "atutej/dspark_qwen3_0_6b-sft-nemotron-terminal-corpus_nemotron-terminal-corpus_onpolicy-20261013", "num_speculative_tokens": 8, "method": "dspark"}'`.
  No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La metrica indirecta mas cercana es la longitud de aceptacion de 5.7321 tokens por paso de verificacion y una tasa de aceptacion de 0.7605, que orientan sobre la ganancia potencial pero no constituyen una medicion de throughput.

## Comparativa con modelos similares

No se dispone de datos numericos comparables en la informacion proporcionada, por lo que la comparacion es metodologica:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DSpark drafter) | Borrador de decodificacion especulativa | 130.381.441 | 16384 (entrenamiento) | no disponible | HuggingFace |
| EAGLE / EAGLE-2 / EAGLE-3 | Borrador de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible en esta busqueda |
| Medusa | Cabezas de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible en esta busqueda |
| Lookahead decoding | Decodificacion especulativa sin modelo auxiliar | no aplica | no disponible | no disponible | no disponible en esta busqueda |

No se dispone de resultados de rendimiento comparables publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no debe usarse para generar respuestas directamente, solo como borrador emparejado con el objetivo `atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011`.
- Dependencia estricta del objetivo: las metricas de aceptacion se midieron sobre la distribucion del objetivo SFT; con otro modelo o con datos fuera de ese dominio, la tasa de aceptacion caeria y la aceleracion se degradaria.
- Requiere el fork de vLLM de Marin y la libreria `speculators` para resolver `DSparkSpeculatorConfig`; sin ellas, la carga del `config.json` fallara por depender de `config.py`.
- Ambito limitado al dominio de terminal (Nemotron-Terminal-Corpus); no hay evidencia de generalizacion a otros dominios.
- La licencia no esta declarada, por lo que no puede confirmarse la viabilidad de uso comercial ni las condiciones de redistribucion.
- Los idiomas soportados no estan documentados; no hay garantia de comportamiento fuera del ingles tecnico del corpus.
- La validacion es forzada por profesor y sobre filas de la distribucion de entrenamiento, por lo que las cifras de aceptacion pueden sobreestimar el comportamiento en inferencia real y en datos fuera de distribucion.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion ni de validacion por terceros; no se documentan sesgos conocidos ni tasas de alucinacion del objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/atutej/dspark_qwen3_0_6b-sft-nemotron-terminal-corpus_nemotron-terminal-corpus_onpolicy-20261013
- Modelo base (objetivo): atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011
- Dataset: nvidia/Nemotron-Terminal-Corpus
- Libreria de entrenamiento: fork `atutej/speculators`, rama `nemotron-terminal-preset` (no se proporciona URL directa en la informacion disponible)
- Fork de vLLM de Marin con soporte `method: dspark` (no se proporciona URL directa en la informacion disponible)
