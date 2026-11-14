# mujeebk/ap-env-sft-v2-adapter

## Resumen

`mujeebk/ap-env-sft-v2-adapter` es un adaptador LoRA de ajuste supervisado (SFT) desarrollado por el autor `mujeebk` sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Forma parte del trabajo *Right Actions, Incomplete Evidence: Post-Training a Small Language Model in a Stateful Accounts Payable Environment*, que entrena un modelo pequeno para operar en un entorno con estado de cuentas por pagar (accounts payable) con uso de herramientas. El adaptador esta pensado para tareas de investigacion de recibos y conciliacion dentro de ese entorno concreto, no como un modelo de proposito general.

Tecnicamente es un LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre las proyecciones q, k, v, o, gate, up y down del transformer Qwen3 de 4 mil millones de parametros. El repositorio ocupa 0,3 GB y contiene unicamente `adapter_config.json`, `adapter_model.safetensors` y `provenance.json`. No incluye pesos fusionados ni tokenizador propio: hay que cargarlo sobre el modelo base en la revision exacta indicada.

Su relevancia es acotada y experimental. El propio autor advierte que la integridad de los ficheros esta verificada por hash, pero que nadie ha cargado ni ejecutado el modelo desde este repositorio. Ademas, el articulo evalua principalmente los pesos fusionados en bf16 (`mujeebk/ap-env-sft-v2`); este adaptador solo se evalua de forma descriptiva y cruzada, sobre 183 de 200 casos de test frente a 185 de los pesos fusionados. Es, por tanto, un artefacto de investigacion reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3 |
| Parametros totales | 4B en el modelo base; tamano del adaptador no disponible (repo de 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se evalua en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base en safetensors/bf16 |
| Rango LoRA / alpha | r = 32, alpha = 64, dropout = 0 |
| Modulos objetivo | q, k, v, o, gate, up, down |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (revision cdbee75f17c01a7cc42f958dc650907174af0554) |
| Libreria | peft (transformers, vLLM con enable_lora) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango sobre un transformer decoder-only denso de 4B parametros (Qwen3-4B-Instruct-2507). Se aplica a las proyecciones de atencion (q, k, v, o) y a las proyecciones del bloque feed-forward (gate, up, down), con rango 32 y alpha 64, sin dropout. El entrenamiento es de ajuste supervisado (SFT) dentro de un entorno con estado de cuentas por pagar, orientado a uso de herramientas y a la resolucion de casos de investigacion de recibos.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El autor documenta el stack de software empleado: torch 2.13.0, transformers 5.20.2, PEFT 0.21.2, TRL 1.16.0 y vLLM 0.30.0 para evaluacion con `enable_lora=True` y `max_lora_rank=32`. El entorno, el prompt, el grader, los casos congelados y los resultados por caso estan en el repositorio de codigo del proyecto. La innovacion principal no esta en la arquitectura del adaptador, sino en el diseno del entorno con estado y en la evaluacion por casos dentro de ese dominio.

## Capacidades

- Generacion de texto y razonamiento dentro del dominio de cuentas por pagar e investigacion de recibos.
- Uso de herramientas (tool calling) orientado al entorno de accounts payable para el que fue entrenado.
- Razonamiento multi-paso con estado: el modelo opera sobre un entorno que mantiene estado entre interacciones.
- Ajuste especifico para tareas de conciliacion y verificacion de evidencia incompleta.
- Capacidades multilingues: no disponibles en la informacion.
- Capacidades de vision, audio o modo thinking: no disponibles en la informacion.
- Al ser un adaptador, hereda las capacidades generales del base Qwen3-4B-Instruct-2507, pero no se documenta su comportamiento fuera del dominio entrenado.

## Casos de uso

- Investigacion de recibos en cuentas por pagar: el modelo recibe casos con evidencia parcial y debe decidir acciones de conciliacion dentro de un entorno con estado, que es exactamente el escenario para el que se entreno.
- Automatizacion de flujos de aprobacion de facturas: puede integrarse en un pipeline que consulte herramientas del entorno (estado de la factura, historial) y proponga la siguiente accion.
- Evaluacion reproducibilidad de investigacion: sirve para replicar los resultados del articulo cargando el adaptador sobre el base en la revision exacta y ejecutando los casos congelados del repositorio de codigo.
- Pruebas de tool calling en modelos pequenos: util como banco de pruebas para comparar SFT frente a pesos fusionados en tareas de uso de herramientas con estado.
- Prototipado de agentes de dominio financiero: el adaptador puede servir de punto de partida para experimentar con agentes que operan sobre entornos de cuentas por pagar antes de escalar a modelos mayores.
- Docencia e investigacion en post-entrenamiento: ejemplo concreto de LoRA SFT sobre Qwen3-4B con evaluacion por casos y verificacion de integridad por hash.
- No es adecuado como asistente general ni para produccion sin validacion previa, dado que no se ha probado su carga desde este repositorio.

## Benchmarks y rendimiento

La informacion proporcionada solo incluye una comparacion descriptiva entre el adaptador y los pesos fusionados, medida como numero de casos de test resueltos sobre 200:

| Variante | Casos resueltos (de 200) |
|---|---|
| Pesos fusionados bf16 (`mujeebk/ap-env-sft-v2`) | 185 |
| Adaptador LoRA en tiempo de ejecucion (este repo) | 183 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 4B parametros y se evalua en bfloat16, lo que implica aproximadamente 8 GB solo para los pesos del base, mas overhead de activaciones y del adaptador.
- GPU recomendadas: no especificadas en la informacion. Por tamano, una GPU con 16 GB o mas de VRAM deberia ser suficiente en bf16; no confirmado por el autor.
- Cabe en GPU de consumo: probablemente en tarjetas de 16-24 GB (por ejemplo, RTX 4090) en bf16, aunque no esta verificado en la informacion.
- Opciones de despliegue: transformers + PEFT y vLLM 0.30.0 con `enable_lora=True` y `max_lora_rank=32` son las unicas opciones documentadas. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mujeebk/ap-env-sft-v2-adapter` (este) | 4B (base) + LoRA r32 | no disponible | SFT LoRA para entorno AP con tool use | Apache-2.0 | Hugging Face, sin pruebas de carga publicadas |
| `mujeebk/ap-env-sft-v2` (pesos fusionados) | 4B | no disponible | Mismo entrenamiento, pesos fusionados bf16 | Apache-2.0 | Hugging Face, evaluado en el articulo |
| `Qwen/Qwen3-4B-Instruct-2507` (base) | 4B | no disponible en la informacion | Modelo instructivo general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estandar para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor indica explicitamente que la carga del modelo no se ha probado de forma independiente: nadie ha cargado ni ejecutado el modelo desde este repositorio.
- El adaptador esta entrenado para un dominio muy concreto (entorno de cuentas por pagar con estado); su comportamiento fuera de ese dominio no esta documentado.
- El articulo evalua principalmente los pesos fusionados; la evaluacion del adaptador es descriptiva y cruzada (183 de 200 casos), no una evaluacion completa.
- `adapter_config.json` se mantiene sin editar y puede referenciar una ruta de pod de entrenamiento, por lo que es obligatorio indicar el modelo base explicitamente al cargar.
- Sesgos conocidos: no disponibles en la informacion.
- Riesgo de alucinacion: no cuantificado en la informacion; aplicable el riesgo general de modelos de 4B en tareas de razonamiento con evidencia incompleta.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingue.
- Licencia Apache-2.0 permite uso comercial, pero la falta de validacion de carga y de evaluacion fuera del dominio desaconseja su uso en produccion sin pruebas propias.
- El repositorio no incluye tokenizador ni pesos fusionados; la reproducibilidad depende de fijar la revision exacta del base (`cdbee75f17c01a7cc42f958dc650907174af0554`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mujeebk/ap-env-sft-v2-adapter
- Pesos fusionados: https://huggingface.co/mujeebk/ap-env-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo, entorno, casos y resultados: https://github.com/mujeeb-k/ap-hyperbolic-time-chamber
- Paper y blogs: no disponibles en la informacion proporcionada.
