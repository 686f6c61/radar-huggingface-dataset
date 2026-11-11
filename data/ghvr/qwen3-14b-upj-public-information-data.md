# Ghvr/qwen3-14b-upj-public-information-data

## Resumen

UPJ-Qwen3-14B-QLoRA es un adaptador LoRA (PEFT) entrenado sobre Qwen3-14B mediante QLoRA con Unsloth, TRL y PEFT. Lo desarrolla Gathan Ghifari Rachwiyono como parte de su tesis de grado en Informatica en la Universitas Pembangunan Jaya (UPJ), Indonesia. Su proposito es responder preguntas frecuentes en indonesio sobre informacion publica de esa universidad: perfil institucional, facultades, programas academicos, instalaciones, actividades estudiantiles y admisiones.

El modelo no es un modelo base nuevo: es un adaptador de bajo rango (r=16, alpha=32) que se aplica sobre la version cuantizada en 4 bits de Qwen3-14B. Por tanto hereda la arquitectura decoder-only Transformer y la ventana de contexto de Qwen3-14B, aunque el entrenamiento se realizo con una longitud maxima de secuencia de 512 tokens. El repositorio ocupa 0,1 GB, coherente con un adaptador y no con pesos completos.

Es relevante como ejemplo reproducible de ajuste de dominio con recursos limitados: demuestra como adaptar un modelo de 14B a un corpus institucional pequeno usando QLoRA, y sirve como caso de estudio para evaluaciones comparativas antes y despues del fine-tuning. El autor lo declara explicitamente como prueba de concepto academica y no como servicio oficial de la universidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-14B, Transformer decoder-only (adaptador LoRA sobre la base) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA anade un subconjunto entrenable (rango 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el entrenamiento uso una longitud maxima de secuencia de 512 tokens |
| Tipos de cuantizacion | Base cargada en 4-bit (bnb-4bit); el adaptador se distribuye como pesos PEFT |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria peft |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un Transformer decoder-only de la familia Qwen3 (informe tecnico arXiv:2505.09388). Sobre el se aplico Supervised Fine-Tuning con QLoRA: la base se carga en precision 4-bit y solo se actualizan los parametros de adaptacion de bajo rango. La configuracion LoRA usa r=16, alpha=32, dropout 0.05 y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, atencion y MLP completos.

El dataset es propio y consta de preguntas y respuestas de referencia en indonesio sobre la UPJ, con campos category, question y answer, e incluye variaciones de las preguntas para aumentar la diversidad linguistica. Se dividio manualmente en 70% entrenamiento, 20% validacion y 10% prueba, manteniendo las variantes de una misma pregunta en la misma particion para evitar fugas de informacion. El entrenamiento uso optimizador adamw_8bit, batch por dispositivo de 1, acumulacion de gradiente de 8 pasos, learning rate inicial 4e-4, weight decay 0.01, scheduler lineal y seleccion del checkpoint con menor perdida de validacion. No se documentan tecnicas adicionales como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas en indonesio sobre el dominio de la UPJ.
- Respuesta a preguntas sobre perfil institucional, facultades, programas academicos, instalaciones, actividades estudiantiles y admisiones, segun el corpus de entrenamiento.
- Manejo de variaciones linguisticas de una misma pregunta, gracias a la aumentacion del dataset.
- Uso previsto como chatbot web de dominio especifico y como objeto de evaluacion comparativa antes y despues del fine-tuning.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; fuera del alcance declarado.
- Capacidades multilingues: limitadas al indonesio como idioma principal; no se documenta soporte de otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no documentadas.

## Casos de uso

- Chatbot informativo de universidad: integrado en la web de una institucion, responde en indonesio a preguntas frecuentes sobre admisiones, facultades y servicios, usando el corpus institucional como fuente de verdad.
- Prototipado de asistentes de dominio: sirve como plantilla reproducible para adaptar un modelo de 14B a un corpus pequeno mediante QLoRA y Unsloth con recursos de GPU moderados.
- Investigacion academica comparativa: permite medir la mejora en calidad de respuesta antes y despues del fine-tuning sobre un conjunto de prueba separado al 10%.
- Demostracion docente de PEFT: ejemplo practico de configuracion LoRA (rango, alpha, modulos objetivo) y de gestion de particiones de datos para evitar fugas.
- Atencion de primer nivel en mostrador virtual: resuelve dudas generales y deriva a los servicios administrativos oficiales cuando la consulta excede el alcance del corpus.
- Generacion de FAQ asistida: ayuda a redactar respuestas de referencia a partir de preguntas variadas, utiles para mantener una base de conocimiento institucional.
- Evaluacion de riesgos de alucinacion en dominio acotado: caso de estudio para medir como se comporta un modelo ajustado cuando se le pregunta fuera de su dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un objetivo de evaluacion (comprobar si el fine-tuning QLoRA mejora la respuesta a preguntas de dominio sobre la UPJ) y una particion de prueba del 10%, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas propias en el fragmento disponible.

## Requisitos de hardware

- Inferencia con el adaptador: requiere cargar Qwen3-14B en 4-bit (bnb-4bit) mas el adaptador LoRA; el repositorio del adaptador ocupa 0,1 GB, pero los pesos base deben descargarse aparte.
- VRAM estimada: no disponible de forma oficial; para un modelo de 14B en 4-bit se situa tipicamente en el rango de 9-12 GB, dependiendo de la longitud de contexto y del backend.
- GPU recomendadas: no especificadas por el autor. Para 14B en 4-bit son adecuadas GPU consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) y GPU de datacenter (A100, H100) para mayor throughput o contextos largos.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 16-24 GB de VRAM en cuantizacion 4-bit; el autor no lo confirma.
- Opciones de despliegue: transformers con PEFT (ruta oficial del autor); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UPJ-Qwen3-14B-QLoRA | 14B (base) + adaptador LoRA r=16 | no disponible (entrenado a 512 tokens) | Adaptador PEFT de dominio | Apache-2.0 | Hugging Face (Ghvr) |
| Qwen3-14B (base) | 14B | no disponible en la informacion | Modelo completo | Apache-2.0 (segun modelo original) | Hugging Face (Qwen) |
| Qwen3-14B-bnb-4bit (Unsloth) | 14B | no disponible en la informacion | Modelo completo cuantizado 4-bit | Apache-2.0 (segun modelo original) | Hugging Face (unsloth) |

La comparativa se limita a la cadena base-cuantizada-adaptador porque la informacion proporcionada no incluye otros modelos de dominio equivalentes ni datos de rendimiento que permitan comparaciones cuantitativas.

## Limitaciones y advertencias

- Prueba de concepto academica: no es un chatbot oficial ni un servicio de informacion operado por la Universitas Pembangunan Jaya.
- No debe usarse para informacion oficial o legalmente vinculante, acceso a expedientes privados, datos personales sensibles ni decisiones academicas, financieras o administrativas.
- Fuera de alcance: preguntas no relacionadas con la UPJ; el modelo puede responder de forma poco fiable fuera de su dominio.
- Riesgo de alucinacion: al ser un ajuste sobre un corpus acotado, puede generar respuestas plausibles pero incorrectas sobre datos institucionales no cubiertos.
- Cobertura linguistica limitada al indonesio; no se documenta calidad en castellano ni en otros idiomas.
- Longitud de entrenamiento de 512 tokens: puede limitar el manejo de conversaciones largas o documentos extensos, aunque la ventana del modelo base sea mayor.
- Dataset pequeno y propio, con particiones manuales; el rendimiento depende de la cobertura y calidad del corpus, no publicada en detalle.
- Licencia Apache-2.0 en el adaptador, pero conviene verificar las condiciones del modelo base Qwen3-14B para uso comercial en produccion.
- Sin datos publicados de benchmarks, latencia ni throughput; no recomendable para produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ghvr/qwen3-14b-upj-public-information-data
- Modelo base original: https://huggingface.co/Qwen/Qwen3-14B
- Modelo base cuantizado (Unsloth): https://huggingface.co/unsloth/Qwen3-14B-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- PEFT (repositorio): https://github.com/huggingface/peft
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
