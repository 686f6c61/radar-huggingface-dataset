# andyz321/qwen3-8b-eldercare

## Resumen

Qwen3-8B eldercare es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-8B, desarrollado por el usuario andyz321 (firmado como "zhuang") y publicado en Hugging Face en noviembre de 2026. Está orientado a la asistencia conversacional en chino para el cuidado de personas mayores, la enfermería geriátrica y la medicina tradicional china (TCM), dirigido a familiares, cuidadores y personal de residencias.

El modelo parte de la arquitectura transformer densa de Qwen3-8B (8.000 millones de parámetros) y se entrena con QLoRA de 4 bits (r=16, α=32, dropout=0,05) sobre 64.864 muestras en chino que mezclan TCM (38,5 %), medicina general (30,8 %), datos generales (18,5 %), enfermería (14,1 %) y seguridad (0,015 %). El entrenamiento se realizó durante 1 época en 4× V100-SXM2-16GB con DDP, en 227 pasos y 74 minutos, con una pérdida que descendió de 4,153 a 2,48.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de ajuste fino de bajo coste sobre Qwen3 con datos sanitarios en chino; por otro, la propia model card documenta con honestidad limitaciones graves de seguridad (solo 10 muestras de rechazo/urgencia, errores médicos no depurados), lo que lo convierte en un caso de estudio útil sobre por qué la curaduría de datos y el RAG son imprescindibles en dominios clínicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8.000 millones (base); adaptador LoRA r=16, α=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en entrenamiento (cutoff); contexto nativo de Qwen3-8B no especificado en la informacion disponible |
| Tipos de cuantizacion | QLoRA 4-bit nf4 para entrenamiento; GGUF (Q4_K_M mencionado en el ejemplo de llama.cpp); fp16 para inferencia |
| Idiomas soportados | Chino (entrenamiento y casos de uso); resto no disponible |
| Licencia | Apache-2.0 (heredada del base), con advertencia de datos NC en el corpus de entrenamiento |
| Formato de pesos | safetensors (transformers); GGUF para llama.cpp; Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso decoder-only con atención completa, sin mezcla de expertos. Sobre él se aplica un adaptador LoRA de rango 16 y α=32 con dropout de 0,05 sobre los módulos q/k/v/o_proj y gate/up/down_proj, entrenado en precisión fp16 (las V100 no soportan bf16) con QLoRA de 4 bits nf4. La plantilla de chat utilizada es `qwen3_nothink`, que desactiva la cadena de razonamiento para producir respuestas cortas y directas.

El corpus de ajuste fino suma 64.864 muestras en chino provenientes de conjuntos públicos: enfermería y geriatría (YsK-dev/geriatric-health-advice, Luowuhan/Nursing-knowledge, timzhou99/nursing-pharmacology, entre otros), medicina (CMB, DoctorFLAN, medicationqa), medicina tradicional china (TCMChat-dataset-600k, ShenNong_TCM_Dataset, TCM-Instruction-Tuning-ShizhenGPT) y datos generales para mitigar el olvido catastrófico (COIG-CQIA). La proporción de datos de seguridad es mínima (10 muestras, 0,015 %). Los hiperparámetros son lr 1e-5, scheduler cosine, warmup 0,03, packing, batch size 1 con acumulación de gradiente 8 y una sola época. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en chino orientada a preguntas de cuidado de mayores y enfermería.
- Consultas sobre medicina tradicional china: identificación de fórmulas y principios, aunque sin dosis concretas (restricción aplicada durante el entrenamiento).
- Orientación farmacológica básica: el modelo diferencia matices por sexo en síntomas nocturnos (próstata en hombres, función vesical en mujeres) e introduce consideraciones de efectos secundarios.
- Razonamiento clínico elemental en escenarios cotidianos (insomnio, deambulación nocturna, deshidratación).
- No soporta de forma fiable el rechazo seguro ni la derivación a urgencias (ver limitaciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo thinking está desactivado.
- Capacidades multilingües: limitadas al chino según los datos de entrenamiento.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de consulta para familiares: responder dudas sobre síntomas leves y hábitos de cuidado (hidratación, sueño, movilidad) en conversaciones multi-turno de hasta 2.048 tokens, con la ventaja de un tono adaptado a cuidadores no profesionales.
- Formación de personal de residencias: generar explicaciones didácticas sobre cuidados geriátricos básicos y farmacología, útiles como material de apoyo tras revisión por un profesional sanitario.
- Primer nivel de triaje conversacional: clasificar consultas entrantes y derivar las que contengan señales de alarma, siempre que se combine con reglas deterministas externas y no se delegue la decisión al modelo.
- Divulgación sobre medicina tradicional china: explicar conceptos y fórmulas de TCM a título informativo, con RAG que aporte referencias y sin permitir que el modelo prescriba dosis.
- Base para experimentación académica: punto de partida reproducible para estudiar el efecto del ajuste fino LoRA en dominios clínicos y la degradación de la seguridad con corpus desbalanceados.
- Integración en un pipeline RAG sanitario: el modelo actúa como capa de redacción sobre recuperación documental (guías Beers, interacciones FDA, bases de fórmulas), donde la precisión de dosis y contraindicaciones proviene del retrieval y no de los pesos.
- Prototipado rápido en local: al estar disponible en GGUF, permite desplegar un asistente de pruebas en una estación de trabajo con llama.cpp u Ollama antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una comprobación cualitativa con 5 prompts reales comparando el modelo ajustado con el base:

| Escenario | Resultado del ajuste |
|---|---|
| Cuidado nocturno | Diferenciación por sexo correcta, añade efectos secundarios y deshidratación |
| Solicitud de fórmula TCM | Elimina dosis concretas, pero sigue nombrando fórmulas |
| Caída con golpe en la cabeza | Lista de señales de alarma correcta, sin instrucción explícita de acudir a urgencias |
| Suspensión de antihipertensivo | Persiste el error de "dependencia del fármaco" |
| Recomendación de suplementos | Sigue recomendando categorías concretas |

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 16 GB solo para pesos (8.000 M × 2 bytes), más overhead de activaciones y KV cache; requiere GPU de 24 GB o superior para margen cómodo.
- VRAM estimada en Q4_K_M (GGUF): aproximadamente 5-6 GB de pesos, viable en GPUs de consumo con 8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080/4070 Ti para cuantizaciones de 4-5 bits.
- Cabe en GPU de consumo: sí, en cuantización GGUF de 4 bits sobre RTX 3060 12 GB o superior.
- Opciones de despliegue: transformers (documentado), llama.cpp (GGUF, documentado), Ollama (Modelfile, documentado). vLLM y TGI no se mencionan en la información disponible, aunque el formato de pesos safetensors es compatible con ellos.
- Latencia y throughput: no disponibles. El entrenamiento se completó en 74 minutos sobre 4× V100 con 227 pasos, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B eldercare (andyz321) | 8.000 M (LoRA) | 2.048 en entrenamiento | Geriatría, enfermería, TCM (chino) | Apache-2.0 con datos NC en el corpus | Hugging Face, GGUF, Ollama |
| Qwen/Qwen3-8B (base) | 8.000 M | Nativo de Qwen3 (no especificado aquí) | Generalista multilingüe | Apache-2.0 | Hugging Face, amplio ecosistema |
| ShizhenGPT (FreedomIntelligence) | no disponible | no disponible | Medicina tradicional china | no disponible | Hugging Face (dataset y modelo referenciados) |
| Modelos médicos chinos tipo Huatuo/GPT-4o-med | no disponible | no disponible | Medicina general en chino | variable | Hugging Face |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Seguridad insuficiente: solo 10 muestras de rechazo o triaje de urgencias (0,015 %) en 64.864, lo que impide un comportamiento fiable ante situaciones críticas.
- Errores médicos aprendidos: la afirmación de que los antihipertensivos "generan dependencia" aparece en el corpus y persiste tras el ajuste fino, con frecuencia creciente.
- Sesgo de dominio: el 14,1 % de datos de enfermería geriátrica hace que el modelo se comporte más como un estudiante de medicina que como un asesor de cuidados.
- Alucinación en dosis y fármacos: el modelo sigue nombrando fórmulas de TCM y recomendando categorías de suplementos; no debe usarse sin RAG para dosis, interacciones o contraindicaciones.
- Riesgo en escenarios de alarma: ante caídas con golpe en la cabeza, dolor torácico, alteración de consciencia o hematemesis, no se debe confiar en el modelo; se requiere derivación por reglas.
- Contexto limitado: el entrenamiento usó un corte de 2.048 tokens, lo que restringe conversaciones largas y documentos extensos.
- Idioma: entrenado exclusivamente en chino; el rendimiento en castellano u otros idiomas no está evaluado.
- Licencia y uso comercial: aunque el modelo hereda Apache-2.0, parte del corpus incluye fuentes con licencia NC (por ejemplo, ShenNong_TCM_Dataset, solo para investigación académica); es obligatorio depurar licencias antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No es un dispositivo médico: la model card lo declara explícitamente como herramienta divulgativa, no diagnóstica ni sustitutiva del criterio clínico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyz321/qwen3-8b-eldercare
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de enfermería geriátrica: https://huggingface.co/datasets/YsK-dev/geriatric-health-advice
- Dataset de conocimiento de enfermería: https://huggingface.co/datasets/Luowuhan/Nursing-knowledge
- Dataset de farmacología de enfermería: https://huggingface.co/datasets/timzhou99/nursing-pharmacology
- Dataset CMB (medicina china): https://huggingface.co/datasets/FreedomIntelligence/CMB
- Dataset DoctorFLAN: https://huggingface.co/datasets/FreedomIntelligence/DoctorFLAN
- Dataset MedicationQA: https://huggingface.co/datasets/truehealth/medicationqa
- Dataset TCMChat-600k: https://huggingface.co/datasets/ZJUFanLab/TCMChat-dataset-600k
- Dataset ShenNong TCM (licencia NC): https://huggingface.co/datasets/michaelwzhu/ShenNong_TCM_Dataset
- Dataset TCM ShizhenGPT: https://huggingface.co/datasets/FreedomIntelligence/TCM-Instruction-Tuning-ShizhenGPT
- Dataset COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
