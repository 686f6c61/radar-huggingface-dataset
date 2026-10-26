# cairndev/qwen3-4b-ifc-bim-qlora

## Resumen

`cairndev/qwen3-4b-ifc-bim-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base denso Qwen3-4B-Base, publicado por el usuario `cairndev`. Su propósito es acotado y explícito: responder preguntas sobre IFC (Industry Foundation Classes) y BIM (Building Information Modeling), incluyendo la redacción de definiciones de entidades IFC. No es un modelo nuevo ni un ajuste instruction-tuning general: es un delta de bajo rango (r=16, alpha=32) que se carga con PEFT encima del checkpoint original de 4.000 millones de parámetros.

La relevancia del proyecto es tanto técnica como de proceso. Por un lado, aborda un nicho con poco cubierto en abierto: la semántica del esquema IFC y la generación de ficheros/entidades BIM conformes. Por otro, documenta de forma inusual un pipeline de fine-tuning gobernado con la herramienta `cairn`: aprobación humana del origen de datos, estimación y tope de coste de GPU (16,50 USD estimados, 0,86 USD liquidados, tope de 25 USD), hash de contenido del adaptador y aprobación explícita de la promoción.

El autor marca el artefacto como **preview**. La única métrica publicada es la pérdida de validación sobre 301 filas retenidas (2,718 en el modelo base frente a 0,554 con el adaptador). No hay resultados sobre el split de test, no hay comparación de capacidades generales con `lm-evaluation-harness` y no se ha verificado que el IFC generado parsee o valide. Cualquier uso en producción debe tratarse como experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-4B-Base) + adaptador LoRA/QLoRA acoplado mediante PEFT |
| Parámetros totales | 4.000 millones en el modelo base; número de parámetros entrenables del adaptador: no disponible |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; las secuencias de entrenamiento se truncaron a 2.048 tokens y ninguna fila del dataset los supera |
| Tipos de cuantización | Base cargado en 4 bits NF4 (`unsloth/Qwen3-4B-Base-unsloth-bnb-4bit`) durante el entrenamiento; adaptador publicado en safetensors (fp). No se publican versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | `en` declarado en la model card (dataset y evaluación en inglés); el modelo base Qwen3 es multilingüe, pero el adaptador no declara ni evalúa otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repo 0,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Base, un transformer decoder-only denso de la familia Qwen3 (rango de 0,6 B a 235 B de parámetros, con variantes densas y MoE), descrita en el informe técnico Qwen3 de arXiv. Sobre él se aplica un adaptador LoRA con r=16, alpha=32, dropout=0 y módulos objetivo en **todas** las proyecciones de atención y MLP. El entrenamiento es QLoRA: el base se carga cuantizado en 4 bits y los pesos del adaptador se entrenan en precisión de entrenamiento. El adaptador no introduce cambios arquitectónicos (sin atención lineal, sin decodificación especulativa, sin cabezas adicionales).

Los datos proceden de `cairndev/ifc-bim-alpaca-dedup`, derivado a su vez de `Dietmar2020/ifc-bim-high-quality-alpaca` (Apache-2.0, commit `08d61c3c...`). El filtrado es agresivo: de 42.680 filas se eliminan 36.385 (85%) por near-duplicados con MinHash (umbral 0,8), quedando 6.295 filas divididas 90/5/5 por familia de plantilla para evitar fuga entre splits (train 5.646, val 301, test 348; 1,49 M tokens con el tokenizador Qwen3). El ajuste es SFT supervisado estándar —no se documenta RLHF, DPO ni preferencias—: 1 época, 353 pasos, lr 2e-4, batch 2 con acumulación de gradiente 8, longitud 2.048, gradient checkpointing, semilla 3407, sobre una única NVIDIA Tesla T4 (16 GB) en AWS g4dn.xlarge, con 73 minutos de reloj y 0,86 USD de coste de GPU. Stack: Unsloth, TRL 0.24, PEFT 0.20, Transformers 5.5, PyTorch 2.11.

## Capacidades

- Respuesta a preguntas sobre el esquema IFC y sobre flujos de trabajo BIM, en inglés y con el formato de instrucción del dataset de entrenamiento.
- Redacción de definiciones de entidades IFC (sintaxis STEP/IFC), que es la tarea declarada principal del adaptador.
- Generación de texto conversacional de un solo turno mediante la plantilla de chat incluida en el repositorio (instrucción, con el input anexado si existe, como turno de usuario).
- Herencia de las capacidades del base Qwen3-4B-Base (comprensión y generación de lenguaje, código, matemáticas), aunque **no se ha medido** si el fine-tuning las degradó.
- Tool calling / function calling: no documentado ni evaluado para este adaptador.
- Agentes y razonamiento multi-paso: no documentado ni evaluado.
- Multilingüe: no evaluado; solo se declara inglés.
- Modo thinking, visión, audio: no disponibles (el base es `Qwen3-4B-Base`, no la variante post-entrenada con modo de razonamiento).

## Casos de uso

- **Asistente interno de consultas IFC**: ayudar a un equipo BIM a resolver dudas sobre atributos, relaciones y tipos de entidad del esquema; el adaptador está entrenado sobre exactamente ese tipo de plantillas pregunta-respuesta en inglés.
- **Borrador de entidades IFC para revisión humana**: generar la definición textual de un `IFCWALL` u otra entidad con sus atributos, que un modelador valida después con una herramienta IFC (IfcOpenShell, BIMvision) antes de incorporarla al modelo.
- **Autocompletado en editores de ficheros STEP/IFC**: sugerencias de líneas de entidad y de propiedades frecuentes dentro de un editor, siempre con validación sintáctica posterior en el pipeline.
- **Generación de datos sintéticos de entrenamiento BIM**: usar el adaptador como generador de pares pregunta-respuesta sobre IFC para ampliar datasets, filtrando por validación de parseo antes de aceptar muestras.
- **Documentación técnica y glosarios**: redactar fichas explicativas de entidades y propiedades IFC para manuales internos o portales de datos de construcción.
- **Prototipado rápido en local**: con 4 B de parámetros y licencia Apache-2.0, sirve para validar una idea de producto BIM/IFC en una sola GPU consumer antes de invertir en un modelo mayor.
- **Base para un ajuste posterior**: al ser un adaptador PEFT aislado, puede combinarse o continuarse con datos propios de una organización sin redistribuir el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor lo indica explícitamente: el split de test no se ha puntuado y no se ha ejecutado `lm-evaluation-harness` contra el modelo base. La única métrica publicada es la pérdida de validación:

| Métrica | Modelo base (Qwen3-4B-Base) | Adaptador |
|---|---|---|
| Eval loss, 301 filas retenidas | 2,718 | **0,554** |

Evolución de la pérdida de validación durante el entrenamiento (cada 50 pasos):

| Paso | 50 | 100 | 150 | 200 | 250 | 300 | 350 | 353 |
|---|---|---|---|---|---|---|---|---|
| Eval loss | 0,826 | 0,657 | 0,605 | 0,583 | 0,569 | 0,559 | 0,554 | 0,554 |

La pérdida de entrenamiento baja de 2,19 (paso 1) a 0,14 (paso 353). El historial completo por paso está en `trainer_state.json`. No hay datos de precisión exact-match, validez de IFC generado ni evaluaciones de regresión de capacidades generales.

## Requisitos de hardware

- **VRAM del adaptador**: despreciable (repo de 0,1 GB en safetensors); el coste real lo determina el modelo base.
- **VRAM del base**: aproximadamente 8 GB en fp16/bfloat16 para 4 B de parámetros, más caché KV; en cuantización de 4 bits (bnb NF4 o GGUF Q4) se sitúa en el entorno de 2,5-3,5 GB. Cálculo estimado a partir del tamaño de parámetros, no publicado por el autor.
- **GPU validadas**: el entrenamiento se ejecutó en 1 × NVIDIA Tesla T4 (16 GB) en AWS g4dn.xlarge. Para inferencia, una RTX 4090 (24 GB) o RTX 3090 permite fp16 con contexto largo; una RTX 4060 Ti (16 GB) o incluso 8 GB con cuantización 4 bits es suficiente para el adaptador en fp con base cuantizado.
- **Despliegue**: PEFT + Transformers (ruta documentada por el autor), vLLM con soporte LoRA (`--enable-lora`) para serving concurrente, TGI con adaptadores. Para llama.cpp/Ollama es necesario fusionar el adaptador en el base (`merge_and_unload`) y convertir a GGUF; el autor no publica ese artefacto.
- **Latencia y throughput**: no publicados. Como referencia del coste de entrenamiento, 353 pasos con lote efectivo de 16 secuencias de hasta 2.048 tokens en 73 minutos sobre una T4 implica del orden de 5 pasos por minuto; extrapolar a tokens/s de inferencia no es fiable.

## Comparativa con modelos similares

No se han identificado en la información disponible otros adaptadores IFC/BIM comparables. La comparación más útil es contra el propio base y su variante post-entrenada:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cairndev/qwen3-4b-ifc-bim-qlora` | 4 B (adaptador LoRA r=16) | No disponible | Eval loss 0,554 en dominio IFC (301 filas); sin benchmarks generales | Apache-2.0 | Hugging Face, PEFT |
| `Qwen/Qwen3-4B-Base` | 4 B densos | No disponible en la información proporcionada | Eval loss 2,718 en el mismo conjunto de validación IFC | Apache-2.0 | Hugging Face; exports on-device en Qualcomm AI Hub |
| `Qwen/Qwen3-4B` (post-entrenado) | 4 B densos | No disponible en la información proporcionada | Sin datos en la información disponible | Apache-2.0 | Hugging Face |

Frente a un modelo de propósito general, este adaptador solo es preferible en tareas con la forma exacta de sus plantillas de entrenamiento; en cualquier otra consulta, el base sin ajustar o la variante post-entrenada son opciones más seguras.

## Limitaciones y advertencias

- **Datos estrechos y altamente plantillados**: tras eliminar el 85% de near-duplicados, las 6.295 filas restantes siguen siendo generadas por plantilla, y `IFCWALL` es el tipo de entidad más frecuente. El rendimiento fuera de esos patrones será peor y no está cuantificado.
- **Salida IFC sin validar**: el autor advierte que GUIDs, referencias cruzadas y geometría pueden ser incorrectos. Cualquier IFC generado debe pasar por un validador IFC antes de entrar en un flujo BIM real.
- **Estado preview con una sola medición**: un único run, una sola semilla y la pérdida de validación como única señal. No hay resultados en test ni comprobación de regresión en capacidades generales.
- **Riesgo de alucinación**: al ser un base de 4 B afinado sobre un corpus estrecho, es esperable que invente atributos, tipos de entidad o relaciones plausibles pero incorrectas; no se ha medido la tasa.
- **Idioma**: solo se declara inglés. El uso en castellano no está soportado ni evaluado, aunque el base Qwen3 sea multilingüe.
- **Contexto**: el entrenamiento se limita a 2.048 tokens; todas las filas del dataset caben en ese límite, pero no hay evaluación de comportamiento más allá.
- **Licencia**: Apache-2.0 permite uso comercial, pero obliga a conservar atribución al modelo base (Qwen team, Apache-2.0) y al dataset de origen (`Dietmar2020/ifc-bim-high-quality-alpaca`, Apache-2.0).
- **Integración**: requiere cargar el adaptador junto al base exacto `Qwen/Qwen3-4B-Base` y usar la plantilla de chat del repositorio; no es un modelo autónomo.

## Enlaces

- [Adaptador en Hugging Face: cairndev/qwen3-4b-ifc-bim-qlora](https://huggingface.co/cairndev/qwen3-4b-ifc-bim-qlora)
- [Modelo base: Qwen/Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base)
- [Dataset de entrenamiento: cairndev/ifc-bim-alpaca-dedup](https://huggingface.co/datasets/cairndev/ifc-bim-alpaca-dedup)
- [Dataset de origen: Dietmar2020/ifc-bim-high-quality-alpaca](https://huggingface.co/datasets/Dietmar2020/ifc-bim-high-quality-alpaca)
- [Repositorio de cairn (herramienta de fine-tuning gobernado)](https://github.com/cairndev-sh/cairn)
- [Pack de fine-tuning: cairn-extensions / cairn-pack-finetune](https://github.com/cairndev-sh/cairn-extensions/tree/main/packs/cairn-pack-finetune)
- [Qwen3 Technical Report (arXiv 2505.09388)](https://arxiv.org/pdf/2505.09388)
- [Qwen3-4B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_4b)
- [Qualcomm ai-hub-models: qwen3_4b (export on-device)](https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b)
- [AXERA-TECH/Qwen3-4B en Hugging Face](https://huggingface.co/AXERA-TECH/Qwen3-4B)
