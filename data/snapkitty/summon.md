# Snapkitty/summon

## Resumen

Summon es un framework de Python, instalable mediante pip, diseñado para construir modelos de lenguaje afinados de forma "soberana", es decir, con control total sobre los datos, la base y el proceso de entrenamiento. En lugar de ser un modelo en sí, envuelve las bibliotecas HuggingFace PEFT, TRL y bitsandbytes en una cadena de operaciones fluida e inmutable: `Summon.begin("Nombre")` → `.base()` → `.corpus()` → `.constitutional()` → `.license()` → `.train()` → `.push()`. Cada método devuelve una nueva instancia de `SovereignModel`, sin mutación de estado.

La relevancia de Summon radica en su enfoque de reproducibilidad y trazabilidad: implementa una cadena WORM (Write Once Read Many) basada en SHA-256 que sella cada paso del proceso (base, corpus, constitución, licencia, entrenamiento y publicación), generando un manifiesto verificable de qué datos, qué modelo base y qué principios se usaron. Esto lo hace atractivo para equipos que necesitan auditar el origen de sus pesos o cumplir requisitos de gobernanza de datos. El entrenamiento se realiza mediante QLoRA con cuantización de 4 bits (NF4), lo que permite afinar modelos de hasta 70B en hardware relativamente modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de fine-tuning (envuelve modelos transformer base) |
| Parametros totales | no disponible (depende del modelo base elegido) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) para QLoRA |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible (el framework no declara licencia; el modelo resultante hereda la del base y la configurada en `.license()`) |
| Formato de pesos | safetensors (via HuggingFace), adaptadores LoRA |

## Arquitectura y entrenamiento

Summon no define una arquitectura de red neuronal propia; es una capa de orquestación sobre modelos transformer existentes. La arquitectura subyacente depende del modelo base seleccionado, que puede ser cualquiera de los soportados: Nemotron Mini 4B, Llama 3 8B/70B, Mistral 7B, Phi-3 Mini, Qwen2 7B, Gemma2 9B, Falcon 7B, o cualquier ID de HuggingFace. El entrenamiento se realiza con QLoRA: el modelo base se carga con cuantización de 4 bits (NF4) mediante `BitsAndBytesConfig`, se le aplica una configuración LoRA con `r=16` y `lora_alpha=32` sobre los módulos de atención (`q_proj`, `v_proj`, `k_proj`, `o_proj`), y se entrena con `SFTTrainer` de TRL.

La innovación principal es el sistema de sellado WORM: cada componente del pipeline (base, corpus, constitución, licencia, entrenamiento, push) genera un hash SHA-256 que se encadena al siguiente, produciendo un manifiesto inmutable. El constructor de corpus (`Corpus`) permite apilar capas de datos desde archivos JSONL o listas de texto, y sellarlas con `.seal()`. No se menciona el uso de RLHF o DPO; el ajuste es supervisado (SFT) con una lista de principios constitucionales que se incorporan como parte de la configuración.

## Capacidades

- Generacion de texto: el framework produce modelos afinados capaces de generar texto, dependiendo de las capacidades del modelo base.
- Razonamiento y codigo: las capacidades de razonamiento, codigo y matematicas dependen enteramente del modelo base seleccionado (por ejemplo, Llama 3 o Qwen2).
- Tool calling / function calling: no se menciona soporte especifico; depende del modelo base.
- Soporte de agentes y multi-step reasoning: no se menciona; depende del modelo base.
- Capacidades multilingues: no se menciona; depende del modelo base.
- Capacidades especiales: el framework no anade capacidades de vision, audio o thinking mode; se limita a texto. Su capacidad especial es la trazabilidad WORM y la composicion de corpus en capas.

## Casos de uso

- Auditoria de modelos para cumplimiento normativo: una empresa puede usar Summon para documentar exactamente que datos y que principios se usaron en el entrenamiento, generando un manifiesto verificable para auditorias internas o regulatorias.
- Fine-tuning de modelos propietarios con control de datos: un equipo puede construir un modelo afinado sobre Llama 3 8B con un corpus propio (por ejemplo, manuales tecnicos) y sellar cada capa de datos, garantizando que no se filtro informacion externa.
- Creacion de modelos especializados en dominios cerrados: por ejemplo, un modelo para atencion al cliente en un sector regulado, usando un corpus de transcripciones y una constitucion que priorice la precision sobre la creatividad.
- Reproducibilidad en investigacion: un grupo de investigacion puede publicar el manifiesto WORM junto con los pesos, permitiendo que otros reproduzcan exactamente el mismo modelo.
- Prototipado rapido de modelos afinados: gracias a la API fluida y al modo `dry_run`, se puede validar la configuracion sin GPU y lanzar entrenamientos QLoRA en una sola sesion.
- Migracion de modelos entre bases: el framework permite cambiar el modelo base (por ejemplo, de Mistral 7B a Gemma2 9B) manteniendo el mismo corpus y constitucion, facilitando comparativas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El framework no incluye evaluaciones propias; el rendimiento del modelo resultante dependera del modelo base y de la calidad del corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para un modelo de 7B cuantizado a 4 bits, se estiman entre 4 y 6 GB; para 70B, entre 35 y 40 GB.
- GPU recomendadas: para entrenamiento QLoRA de modelos de 7B, una GPU con 12-16 GB (RTX 4070/4080, A10) es suficiente; para 70B, se recomienda A100 80GB o H100.
- Compatibilidad con GPU de consumo: si, para modelos de hasta 13B con cuantizacion 4-bit (por ejemplo, RTX 4090 con 24 GB).
- Opciones de despliegue: el framework genera pesos en formato HuggingFace, por lo que los modelos resultantes pueden servirse con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; dependen del modelo base y del hardware de inferencia.

## Comparativa con modelos similares

Summon no es un modelo, sino un framework de fine-tuning. Se puede comparar con otras herramientas de fine-tuning:

| Herramienta | Enfoque | Cuantizacion | Trazabilidad | Licencia |
|---|---|---|---|---|
| Summon | Framework Python fluido | QLoRA 4-bit | WORM SHA-256 | no disponible |
| Axolotl | Configuracion YAML | QLoRA, LoRA, full fine-tune | No integrada | Apache 2.0 |
| LLaMA-Factory | Interfaz web y CLI | QLoRA, LoRA, full fine-tune | No integrada | Apache 2.0 |

La diferencia clave es la cadena WORM y la API inmutable, que no ofrecen las alternativas. En cuanto a rendimiento, no hay datos comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan; dependen del modelo base y del corpus de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el framework no incluye mecanismos de mitigacion mas alla de los principios constitucionales configurados.
- Limitaciones de contexto o idioma: dependen del modelo base; el framework no las modifica.
- Restricciones de licencia: la licencia del framework no esta declarada; el modelo resultante hereda la licencia del modelo base y la configurada en `.license()`. Es responsabilidad del usuario verificar la compatibilidad de licencias.
- Caveat para produccion: el framework esta disenado para entrenamiento, no para inferencia; no incluye herramientas de servido ni optimizaciones de latencia. Ademas, la fecha de creacion (2026) y la ausencia de descargas sugieren que es un proyecto muy reciente y sin validacion en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/summon
- No se han encontrado otros enlaces (paper, blog, repositorio) en la informacion disponible.
