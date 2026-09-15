# Shankarblr/Llama-3.2-3B-TechWriter-LoRA-Unsloth

## Resumen

`Shankarblr/Llama-3.2-3B-TechWriter-LoRA-Unsloth` es un adaptador LoRA (PEFT) entrenado con Unsloth sobre `meta-llama/Llama-3.2-3B-Instruct`, especializado en redacción técnica de semiconductores e interconexiones de centros de datos. No es un modelo autónomo: requiere el modelo base Llama 3.2 3B Instruct (o su gemelo cuantizado a 4 bits de Unsloth) para poder cargarse e inferir. El repositorio ocupa 0,1 GB y contiene únicamente `adapter_config.json`, `adapter_model.safetensors`, los ficheros del tokenizador y la model card.

El entrenamiento se realizó sobre una mezcla privada de SFT en formato ChatML de 6.765 filas, divididas en 6.088 de entrenamiento y 677 de evaluación (semilla 42), durante 3 épocas y 1.143 pasos, en aproximadamente 1 hora y 22 minutos (4.942 segundos) sobre una RTX 3090 en fp16. La pérdida de evaluación bajó de 0,3627 a 0,1614 y la pérdida media de entrenamiento fue de 0,4028, con 24,3 M de parámetros entrenables (0,75 % del total).

Su relevancia es acotada pero específica: cubre un nicho de dominio muy concreto (documentación técnica de semiconductores e interconexión de centros de datos) en inglés, sobre un modelo pequeño de 3B parámetros que puede ejecutarse en hardware de consumo. Está pensado como artefacto para reanudar entrenamiento, componer con el modelo base en 4 bits o servir de base para una fusión posterior; para inferencia directa sin componer adaptadores, el autor publica el repositorio fusionado `Shankarblr/Llama-3.2-3B-TechWriter-Instruct-Unsloth`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) con adaptador LoRA sobre `meta-llama/Llama-3.2-3B-Instruct`; no es un modelo autónomo |
| Parámetros totales | ~3.000 M en el modelo base; adaptador LoRA entrenable: 24,3 M (0,75 %) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens en la configuración de entrenamiento (`max_seq_length`). Ventana del modelo base: no especificada en la información proporcionada |
| Tipos de cuantización | Carga en 4 bits NF4 con doble cuantización vía bitsandbytes (`bnb_4bit_quant_type="nf4"`, `bnb_4bit_use_double_quant=True`); se menciona un GGUF Q4_K_M del mismo run para Ollama, alojado fuera de este repositorio |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 3.2 Community License ("Built with Llama"), sujeta además a la Llama 3.2 Acceptable Use Policy |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`; GGUF Q4_K_M disponible en otro artefacto del mismo entrenamiento |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. La arquitectura subyacente es la del transformer decoder-only de Llama 3.2 en su variante de 3B parámetros, sobre la que se insertan matrices de bajo rango en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La configuración LoRA emplea rango r=16, alpha=32 y dropout 0, lo que concentra la capacidad de adaptación en 24,3 M de parámetros entrenables, equivalentes al 0,75 % del total del modelo.

El entrenamiento se ejecutó con Unsloth sobre una mezcla privada de SFT en formato ChatML (6.765 filas, repartidas en 6.088/677 con semilla 42), con gradient checkpointing, optimizador `adamw_8bit` y la opción `train_on_responses_only`, de modo que la pérdida se calcula únicamente sobre las respuestas del asistente. Se completaron 3 épocas y 1.143 pasos en 4.942 segundos sobre una RTX 3090 en fp16. La pérdida de evaluación evolucionó de 0,3627 (época 1) a 0,1934 (época 2) y 0,1614 (época 3), con una pérdida media de entrenamiento de 0,4028. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-3.2-3B-Instruct, con especialización en redacción técnica de semiconductores e interconexiones de centros de datos.
- Redacción de documentación técnica de dominio: el adaptador está entrenado específicamente para este registro y vocabulario.
- Formateo de prompts mediante `tokenizer.apply_chat_template(...)`; la model card advierte explícitamente de que **no** debe usarse el ChatML de Qwen (`<|im_start|>`).
- Compatibilidad con PEFT y Unsloth: puede cargarse como adaptador sobre una base en 4 bits, o fusionarse para obtener un modelo autónomo.
- Capacidad de reanudar entrenamiento: el repositorio conserva la configuración necesaria para continuar el ajuste (se excluyen `checkpoint-*` y estados del optimizador).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo pensamiento, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Redacción de documentación técnica de semiconductores: el adaptador está ajustado sobre un corpus privado de este dominio, por lo que resulta adecuado para generar borradores de notas de aplicación, descripciones de procesos o fichas de especificaciones en inglés.
- Documentación de interconexiones de centros de datos: generación y reformulación de contenido sobre enlaces, interfaces y topologías de red en entornos de data center.
- Reescritura y normalización de estilo técnico: transformar notas internas o texto informal en prosa técnica consistente, aprovechando que el entrenamiento usó `train_on_responses_only`.
- Asistente interno de documentación sobre una base de 3B: al requerir 4 bits para la base, puede desplegarse en una GPU de consumo para tareas de redacción asistida dentro de un equipo pequeño.
- Punto de partida para ajuste adicional de dominio: al ser un adaptador con r=16, alpha=32 y sin dropout, es reutilizable como inicialización para futuros ajustes con corrección de instrucciones técnicas.
- Generación de datos sintéticos de dominio: puede emplearse para producir borradores que después se revisen y filtren por especialistas, dado el bajo coste de inferencia de un modelo de 3B.
- Evaluación de pipelines de PEFT en producción: sirve como caso de prueba para validar la carga de adaptadores con PEFT + bitsandbytes o Unsloth antes de escalar a modelos mayores.
- Base para una fusión publicada: el autor ofrece el artefacto fusionado `Shankarblr/Llama-3.2-3B-TechWriter-Instruct-Unsloth` para despliegues en los que no se quiera componer adaptadores en tiempo de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos reportados por el autor son métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de evaluación (época 1) | 0,3627 |
| Pérdida de evaluación (época 2) | 0,1934 |
| Pérdida de evaluación (época 3) | 0,1614 |
| Pérdida media de entrenamiento | 0,4028 |
| Parámetros entrenables | 24,3 M (0,75 %) |
| Pasos de entrenamiento | 1.143 (3 épocas) |
| Tiempo de entrenamiento | 4.942 s (~1 h 22 min) en RTX 3090 fp16 |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor documenta el entrenamiento en una RTX 3090 en fp16 con base cargada en 4 bits. No se publican cifras de VRAM para inferencia; a partir del tamaño del modelo base, una carga en 4 bits NF4 requiere del orden de 2,5-3 GB solo para los pesos, más el *overhead* de caché KV y activaciones.
- Cuantización: la vía documentada es 4 bits NF4 con doble cuantización y `bnb_4bit_compute_dtype=torch.float16`.
- GPU recomendadas: no especificadas en la información disponible para inferencia. El entrenamiento se validó en RTX 3090; cualquier GPU consumer con al menos 8 GB de VRAM debería poder cargar la base en 4 bits, aunque esta cifra no está confirmada por el autor.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño de 3B parámetros y la carga en 4 bits, pero no hay confirmación explícita ni mediciones publicadas.
- Opciones de despliegue: Unsloth (`FastLanguageModel.from_pretrained` con `load_in_4bit=True`) y PEFT + bitsandbytes (`PeftModel.from_pretrained`). Para Ollama se indica usar el GGUF Q4_K_M del mismo run, ya que Ollama no carga este fichero de adaptador por sí solo.
- Latencia y throughput estimados: no disponibles. El único dato temporal publicado es el tiempo de entrenamiento (4.942 s).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shankarblr/Llama-3.2-3B-TechWriter-LoRA-Unsloth` | Adaptador LoRA sobre Llama 3.2 3B Instruct | 3.000 M base + 24,3 M entrenables | 2.048 tokens en entrenamiento | Llama 3.2 Community License | Repositorio público; 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-3.2-3B-Instruct` | Modelo base autónomo | 3.000 M | No especificado en la información disponible | Llama 3.2 Community License | Repositorio con acceso restringido (gated) |
| `Shankarblr/Llama-3.2-3B-TechWriter-Instruct-Unsloth` | Versión fusionada del mismo run | 3.000 M | No especificado en la información disponible | Llama 3.2 Community License | Repositorio público, referenciado por el autor |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría (redacción técnica de semiconductores) en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base (Meta, con acceso restringido, o el gemelo de Unsloth) el adaptador no puede ejecutarse.
- El prompt debe formatearse con `tokenizer.apply_chat_template(...)`; el uso del ChatML de Qwen (`<|im_start|>`) produce resultados incorrectos según advierte el autor.
- Idiomas: únicamente inglés (`en`). No hay evidencia de capacidades en castellano ni en otros idiomas.
- Datos de entrenamiento privados: la mezcla SFT no es auditable, por lo que no puede evaluarse la composición del corpus ni sus posibles sesgos de dominio o de proveedor.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al estar especializado en un dominio técnico con terminología muy específica, existe riesgo de generar especificaciones o cifras plausibles pero incorrectas.
- Sobrecoste de entrenamiento: la pérdida de evaluación desciende hasta la tercera época (0,3627 → 0,1934 → 0,1614), sin que se documente una parada temprana; no hay evidencia de evaluación fuera de la propia partición de validación.
- Uso comercial: permitido bajo la Llama 3.2 Community License, que impone obligaciones de atribución ("Built with Llama"), condiciones para despliegues a gran escala y el cumplimiento de la Llama 3.2 Acceptable Use Policy.
- El autor indica explícitamente que se trata de un "modelo de estilo no oficial; no es un producto de un fabricante".
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces recuperados correspondían a foros de temática ajena, por lo que no hay documentación externa, paper ni análisis independiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-LoRA-Unsloth
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Gemelo de Unsloth del modelo base (referenciado en la model card): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Versión fusionada del mismo run: `Shankarblr/Llama-3.2-3B-TechWriter-Instruct-Unsloth` (referenciada en la model card; no se proporciona URL directa en la información disponible)
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Unsloth (herramienta de entrenamiento utilizada): https://github.com/unslothai/unsloth
- Búsqueda web: sin resultados relevantes; los enlaces recuperados no guardan relación con el modelo.
