# SkyIsNotGreen/hive-reader-1.7b-v1

## Resumen

Hive Reader 1.7B es un modelo de lenguaje especializado desarrollado por SkyIsNotGreen como parte de la familia Hive 1.7B, un conjunto de cinco modelos de 1.700 millones de parámetros que actúan como especialistas de rol dentro de un plano de control local llamado Hive. Este modelo concreto cubre los roles de "mechanics" (extracción de campos estructurados de documentos) y "rag" (respuesta fundamentada en un pasaje suministrado). No es un modelo de chat general, sino un componente acotado que se integra en un pipeline mayor orquestado por el resto de la familia.

El modelo parte de la base LiquidAI/LFM3-1.7B-Base y se ha ajustado mediante SFT con LoRA (r=16, alpha=32, dropout 0.05) sobre 2.104 filas sintéticas validadas por checker, durante 3 épocas y 396 pasos. La innovación principal no está en la arquitectura base, sino en el enfoque de especialización estrecha: cada modelo de la familia resuelve una tarea concreta con alta precisión y latencias muy bajas, en lugar de competir como modelo generalista.

Su relevancia radica en el creciente interés por sistemas multiagente locales donde modelos pequeños y especializados, servidos con llama.cpp o vLLM, sustituyen a modelos grandes en tareas deterministas de extracción y recuperación. Con 1.728.801.600 parámetros reales y un repo de 4,6 GB, está pensado para desplegarse en hardware de consumo o en una GPU de 20 GB, como demuestra el entrenamiento (7,21 GiB de VRAM pico en una tarjeta AMD de 20 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base LiquidAI/LFM3-1.7B-Base); ajuste mediante LoRA |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa `-c 8192`) |
| Tipos de cuantización | GGUF Q4_K_M (evaluado); pesos en bfloat16; safetensors |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial no licenciado para entidades con ingresos anuales superiores a 10 M USD |
| Formato de pesos | safetensors (modelo fusionado y adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-1.7B-Base, un transformer de 1.700 millones de parámetros de Liquid AI. El ajuste se realizó con TRL SFT y LoRA con rango 16, alpha 32 y dropout 0.05, empleando la plantilla de chat de LFM3 con `enable_thinking=false` y pérdida calculada únicamente sobre los turnos del asistente. El conjunto de entrenamiento consta de 2.104 filas sintéticas validadas por checker, sin datos de usuario, durante 3 épocas y 396 pasos, con un pico de 7,21 GiB de VRAM en una GPU AMD de 20 GB.

La particularidad técnica del modelo no reside en la arquitectura, sino en el proceso de especialización: los datos se generan y filtran con checkers deterministas, de modo que el modelo aprende a producir salidas que un validador externo puede verificar. El modelo se distribuye en tres formatos (pesos fusionados en safetensors, adaptador PEFT y GGUF) y el README indica que los hashes de los pesos están en `SHA256SUMS`. Para el GGUF se requiere `--reasoning off` con la plantilla LFM3.

## Capacidades

- Extracción de campos estructurados de documentos y pasajes (rol "mechanics"): facturas, fechas, totales y campos definidos por el checker.
- Respuesta fundamentada en un pasaje suministrado (rol "rag"), sin conocimiento externo.
- Generación con `response_format` habilitado para tareas con salida JSON.
- Integración en el plano de control Hive como tier de rol, servido mediante `hive serve` o `llama-server`.
- Modo conversacional según el pipeline declarado (`text-generation`, `conversational`), aunque el autor insiste en que no es un modelo de chat general.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo más allá de lo indicado.

## Casos de uso

- Extracción de campos de facturas: el modelo recibe el texto de una factura y devuelve los campos estructurados (fecha, total, emisor) que el checker valida; su precisión de 1.000 en el suite "mechanics" (HF) lo hace adecuado para pipelines de contabilidad automatizada.
- Procesamiento de documentos en lote: con latencia mediana de 0,061 s en el rol RAG (HF) y 0,060 s en GGUF, puede procesar miles de pasajes por hora en una sola GPU de consumo.
- Respuesta fundamentada sobre corpus internos: en un sistema RAG, el modelo recibe el pasaje recuperado y responde solo con esa información, reduciendo alucinaciones al no depender de conocimiento paramétrico.
- Componente de un sistema multiagente local: junto con Conductor, Auditor, Dispatcher y Tool Manager, cubre el rol de lectura y extracción dentro de una arquitectura orquestada por Hive.
- Validación de extracciones en producción: al estar diseñado para ser custodiado por su checker, encaja en flujos donde la salida del modelo se verifica automáticamente antes de persistirse.
- Despliegue en hardware modesto: con Q4_K_M y `-ngl 999`, cabe en GPU de consumo y permite servir dos slots (`-np 2`) con contexto de 8.192 tokens en un único equipo.

## Benchmarks y rendimiento

Evaluación en suites de rol retenidas de Hive, decodificación greedy:

| Rol | Ruta | Precisión | n | Mediana |
|---|---|---:|---:|---:|
| mechanics | HF | 1.000 | 40 | 0,193 s |
| mechanics | GGUF | 0,975 | 40 | 0,080 s |
| rag | HF | 1.000 | 40 | 0,061 s |
| rag | GGUF | 1.000 | 40 | 0,060 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 7,21 GiB en una GPU de 20 GB; en bfloat16 la inferencia requiere aproximadamente 3,5 GB solo para pesos, más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB para Q4_K_M; el autor entrenó en una AMD de 20 GB, por lo que tarjetas de esa clase son suficientes.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M en tarjetas de 8 GB o más (RTX 3060/4060 y superiores).
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja --reasoning off`), transformers con `trust_remote_code=True`, PEFT para el adaptador, y Hive (`hive serve`) para el despliegue como tier de rol.
- Latencia y throughput: medianas de 0,060-0,193 s por petición en las suites evaluadas; el README no reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hive Reader 1.7B | 1.728.801.600 | no disponible | mechanics + RAG | LFM 1.0 (límite 10 M USD) | Hugging Face, GGUF, PEFT |
| LiquidAI/LFM3-1.7B-Base | 1.700 M (aprox.) | no disponible | base generalista | LFM 1.0 | Hugging Face |
| Hive Conductor 1.7B | 1.700 M (aprox.) | no disponible | controller + planner | LFM 1.0 | Hugging Face |
| Hive Auditor 1.7B | 1.700 M (aprox.) | no disponible | placement + critic | LFM 1.0 | Hugging Face |

La comparativa con modelos de otras familias no está disponible en la información proporcionada; los únicos comparables documentados son los miembros de la propia familia Hive y el modelo base.

## Limitaciones y advertencias

- No es un modelo de chat general: su uso fuera de los roles "mechanics" y "rag" no está validado y el autor recomienda custodiarlo con su checker en producción.
- Las respuestas RAG están limitadas al pasaje suministrado; no dispone de conocimiento externo y no debe usarse para preguntas abiertas.
- La extracción de campos está acotada a los campos definidos en el checker; campos no contemplados pueden no extraerse correctamente.
- Riesgo de alucinación en entradas fuera de distribución, aunque mitigado por la validación determinista.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Licencia LFM 1.0: el uso comercial por entidades con ingresos anuales superiores a 10 M USD no está licenciado.
- El GGUF requiere `--reasoning off` con la plantilla LFM3; omitirlo puede degradar la calidad de las respuestas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyIsNotGreen/hive-reader-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Repositorio Hive: https://github.com/sky-is-green/hive
- Guía de instalación de Hive: https://github.com/sky-is-green/hive#install
- Harness de evaluación de roles: https://github.com/sky-is-green/hive/tree/main/experiments/roles
- Hive Conductor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-conductor-1.7b-v1
- Hive Auditor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-auditor-1.7b-v1
- Hive Dispatcher 1.7B: https://huggingface.co/SkyIsNotGreen/hive-dispatcher-1.7b-v1
- Hive Tool Manager 1.7B: https://huggingface.co/SkyIsNotGreen/hive-tool-manager-1.7b-v1
