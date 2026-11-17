# Interact-ai/mindcare

## Resumen

MindCare es un adaptador LoRA (PEFT) publicado por Interact-ai sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits de Llama 3.1 8B Instruct distribuida por Unsloth. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de 0,2 GB que debe cargarse junto al modelo base para funcionar. Su propósito declarado es mantener conversaciones de apoyo emocional y orientación sobre bienestar, dentro de un marco explícitamente no clínico.

El adaptador emplea LoRA con rango 16, alpha 32 y dropout 0,05, aplicado sobre los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería Unsloth, según las etiquetas del repositorio, aunque el autor no publica la composición del dataset ni los hiperparámetros de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de adaptador LoRA de bajo coste para un dominio sensible; por otro, sirve de advertencia metodológica, ya que el repositorio no incluye evaluación, procedencia de datos ni validación de seguridad clínica, lo que limita seriamente su uso en producción sanitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA/PEFT |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Llama 3.1 8B Instruct soporta 128K tokens) |
| Tipos de cuantización | Modelo base en 4 bits (bnb-4bit); adaptador en safetensors (precisión no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (sujeta a los términos del modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT en JSON |

## Arquitectura y entrenamiento

El adaptador se monta sobre Llama 3.1 8B Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. El adaptador LoRA inyecta matrices de bajo rango en las siete proyecciones lineales principales del bloque (atención y MLP), con `r=16`, `alpha=32` y `dropout=0.05`, usando PEFT 0.21.2. El modelo base está cuantizado en 4 bits mediante bitsandbytes, lo que reduce el coste de inferencia pero introduce pérdida de precisión respecto a los pesos originales en bf16.

El autor indica que el ajuste se realizó con SFT y la herramienta Unsloth, pero no publica número de tokens de entrenamiento, composición del dataset, procedencia de las conversaciones ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La ausencia de una dataset card reproducible impide auditar el sesgo y la cobertura temática del adaptador.

## Capacidades

- Generación de texto conversacional orientada a apoyo emocional y reflexión.
- Sugerencias generales de afrontamiento y bienestar, según el uso previsto declarado.
- Soporte de plantilla de chat Llama 3.1 (roles system/user/assistant) incluida en el repositorio.
- Escritura de diarios y prompts de reflexión (journaling), según la model card.
- Experimentación con adaptadores LoRA sobre Llama 3.1.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.

## Casos de uso

- Prototipado de interfaces conversacionales de apoyo emocional: el adaptador puede integrarse en un chat de investigación para generar respuestas empáticas en español o inglés, siempre con revisión humana y rutas de escalado a profesionales.
- Journaling guiado: el modelo puede formular preguntas de reflexión a partir de una entrada del usuario, aprovechando la plantilla de chat de Llama 3.1 para mantener el rol de sistema.
- Investigación académica sobre LoRA en dominios sensibles: sirve como caso de estudio de un adaptador de rango 16 entrenado con SFT y Unsloth, útil para comparar metodologías de ajuste.
- Evaluación de riesgos en salud mental: permite construir conjuntos de pruebas para medir alucinaciones, respuestas insensibles o fallos en la detección de señales de crisis.
- Asistente de bienestar en entornos controlados (por ejemplo, talleres internos), con supervisión y con la advertencia explícita de que no sustituye a un profesional.
- Base para fine-tuning adicional: al ser un adaptador PEFT, puede combinarse con otros adaptadores o continuar el entrenamiento con datos propios y validación ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta versión no incluye resultados de evaluación ni métricas clínicas, y advierte de que no debe inferirse rendimiento a partir del nombre del modelo.

## Requisitos de hardware

- VRAM estimada para el modelo base en 4 bits: en torno a 5-6 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 8-10 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) para inferencia individual con holgura.
- GPU consumer: cabe en RTX 3090/4090 (24 GB) y, con cuantización adicional y contextos cortos, en GPUs de 12-16 GB; no se garantiza en 8 GB.
- Opciones de despliegue: transformers + PEFT + bitsandbytes (flujo documentado por el autor); vLLM y TGI requerirían fusionar el adaptador con el base o usar soporte de adaptadores LoRA; llama.cpp/Ollama requerirían convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MindCare (Interact-ai) | 8B (base) + LoRA r=16 | no disponible | Adaptador LoRA sobre Llama 3.1 8B Instruct 4-bit | no disponible | Hugging Face, 0 descargas |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K | Modelo completo | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Adaptadores LoRA de salud mental comparables | variable | variable | LoRA/PEFT | variable | no disponible (sin referencia concreta en la información) |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El adaptador puede producir respuestas incorrectas, incompletas, insensibles o excesivamente confiadas.
- Puede reflejar sesgos del modelo base y de unos datos de entrenamiento no documentados.
- No ha sido validado para seguridad clínica ni exactitud diagnóstica; no debe usarse para diagnosticar, prescribir ni tomar decisiones de emergencia.
- Puede no detectar todas las señales de crisis, autolesión, contexto cultural o matiz lingüístico.
- No debe enviarse información de salud privada o identificable a despliegues no confiables.
- La licencia del adaptador no está declarada; el uso queda sujeto a los términos del modelo base, que puede estar restringido (gated) y requerir autenticación.
- No debe presentarse como modelo oficial de Meta o Unsloth.
- Ausencia de dataset card, hiperparámetros y evaluación reproducible: no apto para producción sanitaria sin auditoría previa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Interact-ai/mindcare
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
