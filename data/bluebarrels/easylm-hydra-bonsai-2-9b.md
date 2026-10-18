# Bluebarrels/easylm-hydra-bonsai-2-9b

## Resumen

`easylm-hydra-bonsai-2-9b` es un adaptador LoRA de tipo PEFT publicado por el usuario Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-9B-gguf`. No es un modelo completo: es un ajuste fino de bajo rango (r=16, alpha=32, dropout=0.05) que especializa al modelo base de 9.000 millones de parámetros como agente por defecto del entorno Hydra v1.2.2, una herramienta de CLI/TUI/escritorio que orquesta agentes, comandos de shell y llamadas a herramientas MCP mediante un protocolo stdio con líneas JSONL.

El adaptador se entrena sobre un corpus propio del autor (`Bluebarrels/easylm-training-corpus`) que, según la model card, combina material académico, tablas de datos cuantitativos, un currículo socrático y el currículo completo de Hydra. El único conjunto de datos explícitamente identificado para este adaptador es `adapter_hydra_chatml.jsonl`, con 168 turnos, un volumen muy reducido que condiciona fuertemente su comportamiento.

Su relevancia práctica es acotada pero concreta: permite ejecutar un agente local con una huella de pesos de aproximadamente 2 GB gracias a la cuantización ternaria del base, con una ventana de contexto declarada de 262.144 tokens y capacidad declarada de orquestación de herramientas. La información disponible procede casi exclusivamente de la model card del autor; no hay benchmarks, descargas ni validación independiente, y la búsqueda web realizada no devolvió resultados relevantes (solo enlaces a IMDb, sin relación con el modelo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base ternario Bonsai 2 9B); adaptador LoRA sobre módulos de atención y MLP. Detalle de capas y cabezas: no disponible |
| Parámetros totales | ~9.000 millones en el modelo base (según denominación del base); el adaptador LoRA añade 417.780 elementos FP16 no nulos |
| Parámetros activos | No aplica: no se describe como MoE |
| Longitud de contexto | 262.144 tokens (declarado en la model card, heredado del base) |
| Tipos de cuantización | Base GGUF ternario (1,58 bits); variante WebGPU/MLC citada como `q4f16_1`; adaptador en FP16 safetensors |
| Idiomas soportados | No disponible (el campo `languages` del repo está vacío) |
| Licencia | AGPL-3.0 |
| Formato de pesos | Adaptador: safetensors (56 tensores, 842.872 bytes, ~5,1 MB). Base: GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de PEFT con rango 16 y alpha 32 aplicado sobre siete proyecciones del transformer base: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Cubrir tanto atención como MLP indica que el ajuste busca modificar comportamiento de razonamiento y de formato de salida, no solo estilo. El modelo base es una síntesis ternaria (1,58 bits) de Bonsai 2 de 9B en formato GGUF; la model card cita además `mlc-ai/Qwen3.5-9B-q4f16_1-MLC` como base WebGPU/MLC, una referencia que no queda explicada y que conviene verificar antes de asumir equivalencia entre ambos linajes.

El entrenamiento se declara sobre `adapter_hydra_chatml.jsonl` (168 turnos, formato ChatML), complementado por el corpus general `easylm-training-corpus`, que incluye 92 «stacks académicos», 369 tablas de hechos con 4.634 filas de referencia, 151 «Council of Kami Books», un grafo EMap de 46.025 nodos y 19.842 aristas con capa socrática, el «why-ledger» de Muse y el currículo completo de Hydra v1.2.2 (CLI, modos de TUI/escritorio, permisos `manual`/`accept_edits`/`plan`/`bypass`, modos de contexto `recall`/`compact`/`sliding` y protocolo stdio JSONL). No se documentan número total de tokens, composición porcentual del dataset, ni si hubo RLHF o DPO; la información disponible no permite confirmar ninguno de esos extremos.

## Capacidades

- Generación de texto y razonamiento técnico en dominios STEM (matemáticas, física, química, ingeniería), según el corpus declarado por el autor.
- Especialización en el currículo de Hydra: comandos `hydra`, `hydra agent`, `hydra swarm`, `hydra serve` en el puerto 7777 y cápsulas `@[hydra]`.
- Orquestación de herramientas MCP y emisión de salida estructurada en protocolo stdio con líneas JSONL.
- Operación en los modos `chat`, `agent`, `swarm`, `computer` y `terminal` de `hydra-tui-rs` y `hydra-desktop-rs`.
- Gestión de niveles de permisos (`manual`, `accept_edits`, `plan`, `bypass`) y de modos de contexto (`recall`, `compact`, `sliding`), es decir, comportamiento condicionado por políticas declaradas en el prompt.
- Carga en cliente mediante WebGPU: la model card incluye código TypeScript para descargar el safetensors y aplicar los pesos LoRA con `parseSafeTensorsHeader` y `applyLoRAWeights`.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Modo «thinking», visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- **Agente de terminal autónomo en local**: el adaptador está entrenado específicamente para `hydra agent`, de modo que puede recibir un objetivo en lenguaje natural y traducirlo a una secuencia de comandos de shell con confirmación según el nivel de permisos configurado (`plan`, `accept_edits`, `bypass`). Su utilidad principal es operar sobre repositorios en máquinas sin conectividad.
- **Orquestación de herramientas MCP en pipelines internos**: al emitir JSONL por stdio, encaja en un proceso padre que lea líneas y despache llamadas a herramientas; permite construir asistentes de operaciones que consulten APIs internas sin exponer datos a un proveedor externo.
- **Estación de trabajo con VRAM limitada**: con un peso base de aproximadamente 2 GB en ternario, es viable en GPU de consumo y en portátiles; sirve para asistentes de código y consultas técnicas offline donde no cabe un modelo de 9B en FP16.
- **Verificación formal y derivaciones STEM**: la model card propone comandos como la comprobación de las relaciones de salto de Rankine-Hugoniot; en la práctica se usaría como apoyo a cálculos de ingeniería con revisión humana obligatoria, dado el riesgo de alucinación en dominios técnicos.
- **Automatización de ingeniería con «gates» deterministas**: el currículo incluye invariantes de ejecución de Progen y una puerta de verificación empírica de cinco comprobaciones; el adaptador puede emplearse para proponer pasos que luego un script valida, separando generación de ejecución.
- **Prototipado de interfaces de agente en navegador**: la ruta WebGPU/MLC descrita permite cargar el adaptador en el cliente y probar flujos de agente sin backend, útil para demos y entornos educativos.
- **Tutoría socrática multi-turno**: el corpus incluye un estado de máquina de elencos y aporía y seis modos de diagnóstico de confusión; el adaptador puede conducir diálogos de enseñanza que cuestionan las premisas del alumno en lugar de dar la respuesta directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de uso de herramientas, ni comparaciones medidas contra el modelo base o contra otros adaptadores.

## Requisitos de hardware

- **VRAM para pesos**: aproximadamente 2 GB para el modelo base en ternario (nivel declarado por el autor para esta variante), más ~5,1 MB del adaptador LoRA.
- **Caché KV**: no disponible. Con una ventana declarada de 262.144 tokens, la caché KV dominará el consumo mucho antes que los pesos; conviene operar con contextos de decenas de miles de tokens salvo que se disponga de memoria muy abundante. El número de capas y cabezas del base no está publicado en la información disponible, por lo que no se puede estimar la cifra exacta.
- **GPU recomendadas**: el fabricante apunta a ejecución en cliente (WebGPU en móviles, tabletas, Chromebooks y portátiles) para la variante de 2B; para esta variante de 9B se recomienda una GPU de consumo con al menos 8-12 GB de VRAM para contexto corto, y A100/H100 si se necesita contexto largo o procesamiento por lotes. Cifras exactas: no disponibles.
- **GPU de consumo**: sí cabe, en tarjetas con 8 GB o más para contexto moderado; en GPUs de 4-6 GB solo con contexto muy reducido y posible descarga parcial de capas.
- **Despliegue**: llama.cpp / Ollama sobre el GGUF base con el adaptador aplicado; MLC/WebGPU para la ruta de navegador; PEFT sobre PyTorch si se fusiona el adaptador con una conversión del base a safetensors. Compatibilidad con vLLM o TGI: no disponible, y en principio requiere una versión del base en formato PyTorch, no GGUF.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Huella declarada | Función | Licencia |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-hydra-bonsai-2-9b` (este) | 9B (base) + LoRA r=16 | 262.144 tokens | ~2 GB base + 5,1 MB adaptador | Agente por defecto de Hydra, orquestación MCP | AGPL-3.0 |
| `Bluebarrels/easylm-bonsai-2-2b` | 2B (base) | No disponible | ~500 MB | Opción universal, carga WebGPU en navegador | No disponible en la información |
| `Bluebarrels/easylm-bonsai-2-4b` | 4B (base) | No disponible | ~1 GB | Tutoría socrática y mentoría de código | No disponible en la información |
| `Bluebarrels/easylm-bonsai-2-27b` | 27B (base) | 262.144 tokens | ~6 GB | Gama alta con torre de visión | No disponible en la información |
| `prism-ml/Ternary-Bonsai-2-9B-gguf` | 9B | 262.144 tokens (heredado) | ~2 GB | Modelo base sin especializar | No disponible en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de otros autores (por ejemplo, adaptadores LoRA para agentes de CLI sobre bases de 7-9B). Esa comparación queda como no disponible.

## Limitaciones y advertencias

- **Volumen de entrenamiento muy reducido**: 168 turnos en el fichero identificado. Es plausible un ajuste estrecho al formato exacto de Hydra, con riesgo de sobreajuste y de degradación de capacidades generales del base.
- **Sin validación independiente**: 0 descargas y 0 «likes» en el momento del registro; no hay benchmarks ni evaluaciones de terceros. Todas las capacidades descritas proceden del autor.
- **Dependencia del modelo base**: el adaptador no es autónomo; requiere `prism-ml/Ternary-Bonsai-2-9B-gguf` y una herramienta capaz de aplicar PEFT sobre GGUF o de fusionar el adaptador con una conversión a PyTorch.
- **Referencias de base inconsistentes**: la model card cita simultáneamente un base ternario GGUF y `mlc-ai/Qwen3.5-9B-q4f16_1-MLC`; no se aclara la relación entre ambos linajes.
- **Riesgo de alucinación**: alto en las tareas de derivación STEM y en la recuperación de datos cuantitativos, dado que el corpus incluye tablas de hechos que el modelo puede reproducir de forma incorrecta. Cualquier cifra debe verificarse contra la fuente primaria.
- **Comportamiento de agente potencialmente destructivo**: los modos `bypass` y `accept_edits` implican ejecución sin confirmación. En producción debe imponerse una capa externa de sandboxing y de revisión de comandos.
- **Idiomas no declarados**: no hay garantía de calidad en castellano; el corpus y el formato ChatML apuntan a un uso predominantemente en inglés.
- **Licencia AGPL-3.0**: copyleft fuerte. El uso comercial es posible, pero si el modelo se ofrece como servicio en red, la AGPL obliga a liberar el código fuente correspondiente. Conviene revisión legal antes de integrarlo en un producto propietario.
- **Contexto declarado no verificado**: 262.144 tokens es la cifra del base; no hay evidencia de que el adaptador mantenga un comportamiento coherente en contextos de esa magnitud.
- **Terminología no estándar**: conceptos como «Council of Kami Books», «why-ledger» o «El Map» no son verificables externamente y deben tratarse como descripciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluebarrels/easylm-hydra-bonsai-2-9b
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Base WebGPU/MLC citada: https://huggingface.co/mlc-ai/Qwen3.5-9B-q4f16_1-MLC
- Repositorio de la familia EasyLM Bonsai 2 (2B): https://huggingface.co/Bluebarrels/easylm-bonsai-2-2b
- Repositorio de la familia EasyLM Bonsai 2 (4B): https://huggingface.co/Bluebarrels/easylm-bonsai-2-4b
- Repositorio de la familia EasyLM Bonsai 2 (27B): https://huggingface.co/Bluebarrels/easylm-bonsai-2-27b
- Papers, blogs o demos adicionales: no disponibles (la búsqueda web no devolvió resultados relacionados con el modelo)
