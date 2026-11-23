# parlaval/salamandra-cot-luna

## Resumen

Salamandra CoT Luna es un adaptador LoRA para moderación de contenido en valenciano, catalán y castellano, desarrollado por el usuario parlaval para el proyecto ParlaVal, un chatbot orientado al aprendizaje del valenciano con público adulto e infantil. Se construye sobre el modelo base BSC-LT/salamandra-2b, un transformer de 2.000 millones de parámetros del Barcelona Supercomputing Center, y añade la capacidad de clasificar mensajes de usuario según dos ejes: si deben bloquearse en cualquier modo (insultos, odio, contenido sexual explícito o degradante, grooming y violencia) y si contienen lenguaje vulgar sin ataque directo.

La particularidad del modelo es que no emite una decisión directa: primero genera un razonamiento breve en valenciano que cita la parte relevante del mensaje y aplica las reglas de una guía de etiquetado, y después produce dos probabilidades leídas directamente de los logits del token « sí» frente a « no» tras las etiquetas `Bloquejar:` y `Vulgar:`. Este enfoque de destilación con cadena de pensamiento a partir de un modelo profesor (GPT-6 Luna) busca hacer el filtro auditable y explicable, algo relevante en un producto que trata con menores.

El adaptador es experimental, ocupa unos 60 MB, se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en el pipeline de moderación de ParlaVal con dos umbrales diferenciados: 0,5 para el modo adulto y 0,3 para el modo infantil. Su interés actual radica en la combinación de un modelo base abierto y europeo con una técnica de destilación razonada aplicada a una tarea de seguridad concreta y con requisitos de transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 16, α = 32, dropout 0,05) sobre transformer decoder-only BSC-LT/salamandra-2b |
| Parametros totales | No disponible para el adaptador; el modelo base Salamandra-2B tiene 2.000 millones de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el texto de entrada se trunca a 512 tokens y el razonamiento a 100 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de transformers, no especificadas) |
| Idiomas soportados | Catalán (ca), castellano (es); el razonamiento se genera siempre en valenciano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; tokenizer.json y tokenizer_config.json del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Salamandra-2B, un transformer decoder-only de 2.000 millones de parámetros, en su variante base sin instrucciones. Los módulos LoRA se insertan en todas las capas lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 16, alpha 32 y dropout 0,05. El entrenamiento se realizó durante 2 épocas con learning rate 2·10⁻⁴, scheduler coseno con 3 % de calentamiento, lote efectivo de 16 (4 × 4) en bf16 y semilla 0, sobre 35.141 ejemplos que suman 3,13 millones de tokens (mediana de 79 tokens por ejemplo). Todo el proceso cupo en una única RTX 3090 durante 37 minutos con un pico de 5,9 GB de memoria.

La función de pérdida combina entropía cruzada sobre el razonamiento generado y entropía cruzada suave sobre las dos cabeceras de clasificación: la de `Bloquejar` con peso 1 y la de `Vulgar` con peso 0,5. Los objetivos suaves mezclan al 50 % la etiqueta del proyecto con la probabilidad del profesor, salvo en los ejemplos marcados como `extra`, donde se usa únicamente la probabilidad del profesor. El profesor es GPT-6 Luna, que siguió la guía de etiquetado v2.1 del proyecto para producir, por cada mensaje, un razonamiento en valenciano y una etiqueta por categoría (`insult`, `odi`, `sexual_explicit`, `sexual_degradant`, `grooming`, `violencia`, `vulgar`) con su probabilidad derivada de los logprobs. La destilación con cadena de pensamiento es la innovación técnica principal: el adaptador aprende a razonar antes de decidir, y la decisión final se extrae de los logits en lugar de generarse como texto libre.

## Capacidades

- Clasificación binaria de mensajes de usuario en dos ejes independientes: bloqueo general (`Bloquejar`) y vulgaridad sin ataque (`Vulgar`).
- Generación de un razonamiento breve en valenciano (máximo 100 tokens, decodificación voraz) que cita el fragmento relevante del mensaje y aplica las reglas de la guía de etiquetado.
- Detección de insultos y acoso, odio contra colectivos, contenido sexual explícito o degradante, captación de menores (grooming) y violencia.
- Detección de lenguaje vulgar sin ataque dirigido, relevante para el modo infantil del chatbot.
- Comprensión de mensajes en valenciano, catalán y castellano, con razonamiento siempre en valenciano.
- Salida de probabilidades calibradas leídas de los logits (P(Bloquejar) y P(Vulgar)), lo que permite ajustar umbrales por modo de uso.
- No soporta tool calling, function calling ni razonamiento multi-paso con agentes; es un clasificador especializado, no un asistente general.
- No dispone de capacidades de visión, audio ni modo de pensamiento extendido más allá del razonamiento breve descrito.

## Casos de uso

- Moderación en tiempo real de un chatbot educativo: ParlaVal puede invocar el adaptador en cada mensaje entrante y bloquear en modo adulto cuando P(Bloquejar) ≥ 0,5, con una latencia de aproximadamente 1 s por mensaje en una RTX 3090 y unos 40 ms por mensaje en lotes de 16, suficiente para un servicio conversacional.
- Filtro reforzado para usuarios infantiles: con el umbral combinado max(P(Bloquejar), P(Vulgar)) ≥ 0,3, el modelo bloquea también mensajes que solo contienen vulgaridades, un requisito específico del público menor de edad del chatbot.
- Auditoría y revisión humana: el razonamiento generado en valenciano permite a moderadores humanos entender por qué se bloqueó un mensaje, lo que facilita la revisión de falsos positivos y la mejora iterativa de la guía de etiquetado.
- Investigación en destilación con cadena de pensamiento: el repositorio documenta la receta completa (profesor, pérdida suave, mezcla de etiquetas) y sirve como referencia reproducible para adaptar modelos pequeños a tareas de clasificación explicable.
- Filtrado previo en pipelines de datos: puede usarse para limpiar corpus conversacionales en catalán y castellano de contenido tóxico antes de emplearlos en otros entrenamientos, aprovechando el procesamiento por lotes.
- Despliegue en hardware de consumo: al requerir unos 5 GB en bf16 sobre el modelo base de 2B, cabe en GPU de consumo como la RTX 3090 y permite prototipado local sin infraestructura de centro de datos.
- Extensión a otras lenguas románicas cercanas: aunque no está validado, el razonamiento en valenciano y el entrenamiento multilingüe del base sugieren un punto de partida para adaptaciones a otras variedades del catalán, siempre con reentrenamiento y evaluación propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB en bf16 con el adaptador fusionado o cargado sobre el modelo base.
- GPU recomendadas: RTX 3090 (referencia usada por el autor, ~1 s por mensaje individual y ~40 ms por mensaje en lotes de 16), A100 y H100 para mayor throughput en producción.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM efectiva; el entrenamiento se completó en una sola RTX 3090 con 5,9 GB de pico.
- Opciones de despliegue: transformers + peft (receta oficial de la model card); el autor no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI, y el formato de adaptador LoRA sobre un base de 2B requeriría conversión a GGUF para llama.cpp u Ollama.
- Latencia y throughput: ~1 s por mensaje sin lotes y ~40 ms por mensaje con lotes de 16 en RTX 3090, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parlaval/salamandra-cot-luna | 2B (base) + LoRA | No disponible (truncado a 512 tokens) | Clasificación de toxicidad con razonamiento destilado | Apache 2.0 | Hugging Face (adaptador) |
| BSC-LT/salamandra-2b | 2B | No disponible en la informacion proporcionada | Modelo base generativo multilingüe | No disponible en la informacion proporcionada | Hugging Face |
| Otros clasificadores de toxicidad abiertos | No disponible | No disponible | Clasificación directa sin razonamiento | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la informacion proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Modelo explícitamente marcado como experimental por el autor; no se recomienda su uso en producción sin una evaluación propia sobre el dominio objetivo.
- Riesgo de alucinación en el razonamiento: el texto generado puede citar o interpretar incorrectamente el mensaje, aunque la decisión final se lea de los logits y no del razonamiento.
- Sesgos heredados del profesor (GPT-6 Luna) y de la guía de etiquetado v2.1, incluidos los sesgos culturales y lingüísticos de ambas fuentes; no se documentan análisis de sesgo.
- Cobertura lingüística limitada a catalán, castellano y valenciano; mensajes en otras lenguas o con mezcla de idiomas pueden clasificarse de forma poco fiable.
- Truncado a 512 tokens: mensajes más largos pierden información y pueden escapar a la detección si el contenido tóxico aparece después del corte.
- El razonamiento se limita a 100 tokens y se genera de forma voraz, lo que reduce la diversidad de explicaciones y puede omitir matices en casos ambiguos.
- Dependencia del modelo base BSC-LT/salamandra-2b, que debe descargarse por separado; el repositorio solo contiene el adaptador (~60 MB) y el tokenizador.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base antes de desplegar.
- Sin datos publicados de benchmarks, precisión, recall ni tasas de falsos positivos y negativos, lo que impide estimar su rendimiento real frente a alternativas.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/parlaval/salamandra-cot-luna
- Modelo base Salamandra-2B: https://huggingface.co/BSC-LT/salamandra-2b

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos del proyecto ParlaVal.
