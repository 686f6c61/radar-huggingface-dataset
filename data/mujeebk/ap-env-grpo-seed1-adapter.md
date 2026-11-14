# mujeebk/ap-env-grpo-seed1-adapter

## Resumen

El modelo `mujeebk/ap-env-grpo-seed1-adapter` es un adaptador LoRA publicado por el autor mujeebk, resultado de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre el checkpoint SFT-v2 del mismo autor. Se trata de un artefacto de investigación muy específico: un adaptador de rango 32 que se carga sobre los pesos fusionados de `mujeebk/ap-env-sft-v2`, cuyo modelo base último es `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo autónomo, sino un delta de pesos que modifica el comportamiento del modelo SFT en un entorno concreto de cuentas por pagar (accounts payable) con uso de herramientas.

El problema que aborda es la investigación de recibos en un entorno con estado, donde el modelo debe encadenar llamadas a herramientas y razonar sobre evidencia incompleta. Según la model card, el adaptador GRPO alcanza 200 aciertos sobre 200 casos de test congelados, frente a 185 del SFT-v2, una diferencia pareada de +7,5 puntos (intervalo del 95 %: +4,0 a +11,5), aunque el propio autor advierte que es un hallazgo de una sola semilla. El checkpoint evaluado corresponde al paso 10 del run pre-registrado con semilla de entrenamiento 20261101.

La relevancia es acotada pero clara para quienes trabajan en post-entrenamiento con RL y en agentes de tool use sobre dominios administrativos. El adaptador es pequeño (repo de 0,3 GB), está bajo licencia Apache-2.0 y viene acompañado de un release de código con el entorno, el prompt, el grader y los casos congelados. Conviene subrayar que el autor indica que la integridad de los ficheros está verificada por hash, pero que nadie ha cargado ni ejecutado el modelo desde el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3-4B-Instruct-2507 vía SFT-v2) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre las proyecciones q, k, v, o, gate, up y down del modelo SFT-v2. El modelo SFT-v2 es a su vez un ajuste supervisado del base `Qwen/Qwen3-4B-Instruct-2507` en la revisión `cdbee75f17c01a7cc42f958dc650907174af0554`. El adaptador no se carga directamente sobre el modelo base de Qwen, sino sobre los pesos fusionados de SFT-v2; el `adapter_config.json` se mantiene sin editar y apunta a la ruta del pod de entrenamiento, por lo que hay que indicar explícitamente el modelo SFT-v2 al cargarlo.

El entrenamiento se realizó con GRPO (TRL 1.16.0) sobre un entorno con estado de investigación de recibos de cuentas por pagar, con un run pre-registrado de semilla 20261101. El checkpoint evaluado es el paso 10. El paper asociado se titula *Right Actions, Incomplete Evidence: Post-Training a Small Language Model in a Stateful Accounts Payable Environment*. El stack declarado es torch 2.13.0, transformers 5.20.2, PEFT 0.21.2 y vLLM 0.30.0; la evaluación se hizo con el adaptador en tiempo de ejecución sobre SFT-v2 con vLLM (`enable_lora=True`, `max_lora_rank=32`), no fusionado. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo DPO adicional.

## Capacidades

- Razonamiento multi-paso con uso de herramientas en un entorno con estado (investigación de recibos de cuentas por pagar).
- Encadenamiento de llamadas a herramientas (tool calling) dentro del flujo del entorno AP.
- Razonamiento sobre evidencia incompleta, según el título y el planteamiento del paper.
- Generación de texto y razonamiento general heredados del modelo base Qwen3-4B-Instruct-2507.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada para este adaptador.

## Casos de uso

- Investigación automatizada de recibos en cuentas por pagar: el adaptador está entrenado específicamente para este entorno con estado, encadenando consultas a herramientas y razonando sobre evidencia parcial; es su caso de uso principal y el único validado en el paper.
- Evaluación de pipelines de agentes con tool use: sirve como referencia para comparar SFT frente a GRPO en tareas administrativas con estado, usando los 200 casos congelados del release de código.
- Reproducción de experimentos de post-entrenamiento con RL: el run pre-registrado, la semilla y los hashes permiten replicar el setup con TRL y vLLM.
- Investigación sobre robustez ante evidencia incompleta: el modelo puede emplearse para estudiar cómo un SLM pequeño decide con información parcial en flujos administrativos.
- Prototipado de asistentes de back-office: sobre la base Qwen3-4B, el adaptador puede integrarse en demos de gestión documental y conciliación de recibos.
- Estudio de eficiencia de LoRA en dominios verticales: al ser un adaptador de 0,3 GB sobre un modelo de 4B, permite experimentar con bajo coste de almacenamiento y despliegue.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| Casos de test congelados (200) | 200 aciertos | SFT-v2: 185 aciertos |
| Diferencia pareada | +7,5 puntos (IC 95 %: +4,0 a +11,5) | Hallazgo de una sola semilla |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; al cargarse sobre Qwen3-4B en bfloat16, el modelo completo requiere del orden de 8 GB de pesos más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada; para un modelo de 4B en bfloat16 son suficientes GPUs de 16-24 GB (por ejemplo, RTX 4090, A100 40 GB) según configuración de contexto y batch.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 16 GB o más con cuantización del modelo base, aunque no se confirma en la información disponible.
- Despliegue: vLLM 0.30.0 con `enable_lora=True` y `max_lora_rank=32` (configuración usada en la evaluación); también PEFT + transformers según el snippet de carga.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ap-env-grpo-seed1-adapter | LoRA sobre 4B | No disponible | 200/200 en test congelado AP | Apache-2.0 | Hugging Face |
| ap-env-sft-v2 | 4B (SFT de Qwen3-4B) | No disponible | 185/200 en el mismo test | No disponible | Hugging Face |
| Qwen3-4B-Instruct-2507 | 4B | No disponible | No disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor indica explícitamente que la integridad de los ficheros está verificada por hash, pero que nadie ha cargado ni ejecutado el modelo desde el repositorio; el funcionamiento en carga no está probado de forma independiente.
- El resultado de +7,5 puntos es un hallazgo de una sola semilla (20261101) y de un único checkpoint (paso 10); no hay evidencia de robustez entre semillas.
- El adaptador no se carga sobre el modelo base directamente: hay que indicar `mujeebk/ap-env-sft-v2` de forma explícita porque el `adapter_config.json` apunta a la ruta del pod de entrenamiento.
- El dominio está acotado a un entorno de cuentas por pagar con estado; el rendimiento fuera de ese entorno no está caracterizado.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto en la documentación disponible.
- Licencia Apache-2.0 para el adaptador, pero depende de SFT-v2 y del base Qwen3-4B, que tienen sus propias licencias (Apache-2.0 para el base).
- Uso en producción: requiere validación propia, dado que no hay pruebas de carga independientes ni benchmarks estándar publicados.

## Enlaces

- Hugging Face: https://huggingface.co/mujeebk/ap-env-grpo-seed1-adapter
- Modelo SFT-v2: https://huggingface.co/mujeebk/ap-env-sft-v2
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Release de código (entorno, prompt, grader, casos congelados): https://github.com/mujeeb-k/ap-hyperbolic-time-chamber
