# Ailiance-fr/qwen3-4b-mascarade-power-lora

## Resumen

`Ailiance-fr/qwen3-4b-mascarade-power-lora` es un adaptador LoRA de rango 16 y alpha 32 entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen. Lo desarrolla el proyecto Ailiance (Ailiance-fr), que mantiene una familia de adaptadores especializados por dominio de hardware e ingenieria (kicad, spice, stm32, emc, embedded, platformio, freecad, dsp, iot y power). Este adaptador concreto corresponde al dominio `power`, orientado a tareas de electronica de potencia y analisis de convertidores.

El modelo resuelve el problema de la especializacion barata: en lugar de reentrenar el modelo completo, aplica un adaptador que modifica menos del 1% de los pesos del base y anade capacidades especificas del dominio sin perder las capacidades generales heredadas. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors compatible con `transformers` y PEFT.

Es relevante para equipos que necesitan un asistente tecnico de dominio acotado (generacion y validacion de esquematicos, netlists SPICE, configuracion de convertidores) sobre hardware modesto, ya que el base de 4B cabe en GPUs de consumo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA modifica menos del 1% de los pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el adaptador se publica en safetensors (se puede fusionar y cuantizar a GGUF/AWQ con herramientas externas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, `generated_from_trainer`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de 4B parametros (Qwen3-4B-Instruct-2507). El adaptador usa rango 16 y alpha 32, y se entreno con SFT mediante TRL 1.4.0, Transformers 5.8.0, PyTorch 2.11.0, Datasets 4.8.5 y Tokenizers 0.22.2. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO adicional.

La innovacion principal no es arquitectonica sino de proceso: Ailiance mantiene una familia de adaptadores que comparten el mismo base y se sirven mediante un gateway con alias por dominio (`ailiance-<domain>`), compilados a un Modelfile de Tower Ollama. El adaptador se evalua con el pipeline propio `ailiance-bench` (fases 1 a 9), que incluye validadores Docker por dominio y una comprobacion de olvido entre dominios (cross-domain forgetting) basada en solapamiento Jaccard de tokens frente al base sin adaptador.

## Capacidades

- Generacion de texto y razonamiento general heredados del base Qwen3-4B-Instruct-2507 (MMLU-Pro 69,6; GPQA 62,0; AIME25 47,4).
- Generacion y comprension de codigo (LiveCodeBench v6 35,1; MultiPL-E 76,8; Aider-Polyglot 12,9 en el base).
- Capacidades de agente y tool calling heredadas (BFCL-v3 61,9; TAU1-Retail 48,7; TAU1-Airline 32,0; TAU2-Retail 40,4).
- Especializacion de dominio `power`: tareas de electronica de potencia, evaluadas con el dataset `emc-dsp-power` del pipeline ailiance-bench.
- Soporte multilingue heredado del base (MultiIF 69,0; MMLU-ProX 61,6; INCLUDE 60,1; PolyMATH 31,1).
- Integracion con el ecosistema `transformers` y PEFT; compatible con endpoints (tag `endpoints_compatible`).
- No se documenta modo thinking, vision ni audio en la informacion disponible.

## Casos de uso

- Asistencia en diseno de convertidores de potencia: el adaptador se entrena sobre el dominio `power` y puede generar y revisar topologias (buck, boost, flyback) y calcular componentes a partir de especificaciones de entrada, apoyandose en el conocimiento general del base.
- Extraccion y validacion de esquematicos: el pipeline ailiance-bench evalua el parseo estructural y la presencia de nodos de tierra en salidas tipo netlist; el modelo puede usarse para generar netlists y someterlas a validadores automaticos.
- Generacion de netlists SPICE para simulacion: el adaptador forma parte de una familia que cubre `spice` y `emc`, por lo que puede integrarse en flujos de simulacion previa a la fabricacion.
- Analisis de compatibilidad electromagnetica (EMC): el dataset de evaluacion `emc-dsp-power` sugiere uso en tareas de filtrado y cumplimiento normativo de etapas de potencia.
- Despliegue en gateway multi-dominio: el adaptador se compila a un Modelfile de Ollama y se sirve con el alias `ailiance-power`, lo que permite enrutar consultas de dominio a este adaptador y el resto al base.
- Prototipado en hardware de consumo: al ser un LoRA sobre un base de 4B, puede ejecutarse en GPUs de gama media para pruebas de concepto de asistentes tecnicos internos.
- Fine-tuning incremental: sirve como punto de partida para equipos que quieran anadir su propio corpus de potencia sin reentrenar el base completo.

## Benchmarks y rendimiento

Resultados del adaptador en el pipeline propio (ailiance-bench Phase 7, CUDA, 2026-05-11):

| Dataset | n | Composite score | Duracion |
|---|---:|---:|---:|
| `emc-dsp-power` | 10 | 0,677 | 1435,0 s |

El composite score combina parseo estructural correcto, coincidencia de numero de componentes y presencia de nodo de tierra, entre otros criterios; decodificacion greedy.

Comprobacion de olvido entre dominios (Phase 9, seed=101, Jaccard de tokens frente al base sin adaptador):

| Dominio | Jaccard LoRA | Delta vs base |
|---|---:|---:|
| `kicad` | 0,093 | +0,006 |
| `spice` | 0,016 | +0,011 |
| `stm32` | 0,046 | -0,004 |
| `emc` | 0,073 | +0,007 |
| `embedded` | 0,085 | +0,011 |
| `platformio` | 0,059 | +0,017 |
| `freecad` | 0,026 | +0,005 |
| `dsp` | 0,099 | -0,002 |
| `iot` | 0,05 | -0,018 |
| `power` | 0,069 | +0,001 (in-domain) |

Delta in-domain: 0,001; media out-of-domain: 0,004.

Resultados oficiales del modelo base Qwen3-4B-Instruct-2507 (heredados como suelo de capacidad):

| Categoria | Benchmark | Qwen3-4B-Instruct-2507 |
|---|---|---:|
| Conocimiento | MMLU-Pro | 69,6 |
| Conocimiento | MMLU-Redux | 84,2 |
| Conocimiento | GPQA | 62,0 |
| Conocimiento | SuperGPQA | 42,8 |
| Razonamiento | AIME25 | 47,4 |
| Razonamiento | HMMT25 | 31,0 |
| Razonamiento | ZebraLogic | 80,2 |
| Razonamiento | LiveBench 2024-11-25 | 63,0 |
| Codigo | LiveCodeBench v6 | 35,1 |
| Codigo | MultiPL-E | 76,8 |
| Codigo | Aider-Polyglot | 12,9 |
| Alineacion | IFEval | 83,4 |
| Alineacion | Arena-Hard v2 | 43,4 |
| Alineacion | Creative Writing v3 | 83,5 |
| Alineacion | WritingBench | 83,4 |
| Agente | BFCL-v3 | 61,9 |
| Agente | TAU1-Retail | 48,7 |
| Agente | TAU1-Airline | 32,0 |
| Agente | TAU2-Retail | 40,4 |
| Multilingue | MultiIF | 69,0 |
| Multilingue | MMLU-ProX | 61,6 |
| Multilingue | INCLUDE | 60,1 |
| Multilingue | PolyMATH | 31,1 |

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 0,2 GB; requiere cargar el base Qwen3-4B-Instruct-2507 (unos 8 GB en fp16) ademas del adaptador.
- VRAM estimada: 8-9 GB en fp16 para el base mas el adaptador; 4-5 GB con cuantizacion de 4 bits tras fusionar y cuantizar.
- GPU recomendadas: A100 o H100 para evaluacion por lotes; RTX 4090 o RTX 3090 para desarrollo; cabe en GPUs de consumo con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti 16 GB) usando cuantizacion.
- Despliegue: `transformers` + PEFT (segun la model card), vLLM o TGI tras fusionar el adaptador, y Ollama mediante el Modelfile del proyecto Ailiance (alias `ailiance-power`).
- Latencia y throughput: no disponibles en la informacion proporcionada; la evaluacion Phase 7 tardo 1435 s para 10 muestras en CUDA con decodificacion greedy, lo que da una referencia aproximada de 143,5 s por muestra en ese entorno (no equivale a throughput de produccion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ailiance-fr/qwen3-4b-mascarade-power-lora` (este) | 4B + LoRA r=16 | no disponible | Dominio `power` (electronica de potencia) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | no disponible | Generalista | Apache 2.0 | Hugging Face |
| Otros adaptadores de la familia Ailiance (kicad, spice, stm32, emc, embedded, platformio, freecad, dsp, iot) | 4B + LoRA r=16 | no disponible | Dominio especifico de hardware | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre el adaptador y el base en el mismo conjunto; la model card indica que el baseline del pipeline ailiance-bench para Qwen3-4B-Instruct-2507 aun no existe ("No baseline bench yet").

## Limitaciones y advertencias

- El adaptador modifica menos del 1% de los pesos: las capacidades generales son las del base y la mejora de dominio es incremental, no un salto cualitativo.
- El benchmark de dominio se limita a 10 muestras (`emc-dsp-power`), por lo que el composite score de 0,677 tiene alta varianza y no debe extrapolarse.
- El olvido entre dominios muestra un delta negativo en `iot` (-0,018) y en menor medida en `stm32` (-0,004) y `dsp` (-0,002): el adaptador puede degradar ligeramente el comportamiento del base en esos dominios.
- Riesgo de alucinacion inherente al base de 4B, especialmente en calculos de componentes y netlists; se recomienda validar con herramientas externas (kicad-cli, simuladores SPICE) antes de usar en produccion.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que limita la auditoria.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el proyecto Ailiance es de pequeno tamano y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El modelo se publica como adaptador, no como pesos fusionados: requiere descargar el base y aplicar PEFT, lo que anade complejidad de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Ailiance-fr/qwen3-4b-mascarade-power-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Pagina del proyecto Ailiance (familia mascarade): https://www.ailiance.fr/models/ailiance/mascarade
- Repositorio de evaluacion ailiance-bench: https://github.com/ailiance/ailiance-bench
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
