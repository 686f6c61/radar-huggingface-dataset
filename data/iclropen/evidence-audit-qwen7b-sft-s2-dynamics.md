# iclropen/evidence-audit-qwen7b-sft-s2-dynamics

## Resumen

`evidence-audit-qwen7b-sft-s2-dynamics` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen`. No es un modelo independiente: es un conjunto de pesos de bajo rango (190 MB por checkpoint) que modifica únicamente el modelo de lenguaje del modelo base, no la torre visual. Su propósito es servir de artefacto experimental para el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El adaptador está entrenado para la tarea de localización temporal de evidencia en vídeo (*video temporal grounding*) sobre el conjunto de datos Charades-STA, con 2.400 pares de entrenamiento y 300 pasos de optimizador. La versión publicada corresponde a una semilla concreta (seed 2) y el repositorio incluye checkpoints intermedios cada 50 pasos, lo que permite estudiar la dinámica de entrenamiento de la dependencia de la evidencia, que es precisamente el objeto de la Figura 9 del artículo.

Es relevante para investigadores que trabajen en evaluación de modelos de vídeo y en el problema de la dependencia de la evidencia (el modelo puede acertar la respuesta sin haber usado realmente el fragmento de vídeo correcto). El autor advierte explícitamente de que los pesos son de un reentrenamiento, no de la ejecución original que produjo los números del artículo, y proporciona un script de autocomprobación para verificar la correcta carga de los tensores LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (transformer multimodal con torre visual; el adaptador solo afecta al modelo de lenguaje) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 190.435.728 bytes por checkpoint; el modelo base Qwen2.5-VL-7B-Instruct tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16 como el modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `adapter_model.safetensors`) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Version de transformers | 4.51.x (probado con 4.51.3); peft 0.20.0 |
| Tamano del repo | 1.1 GB |
| Checkpoints | paso 50, 100, 150, 200, 250 y 300 (raiz) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre visual y modelo de lenguaje. Los pesos LoRA se insertan en los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y en los módulos MLP (`gate_proj`, `up_proj`, `down_proj`). Un detalle técnico importante: los entrenamientos con transformers 4.51 usaron *gradient checkpointing*, lo que provocó que la torre visual no recibiera gradiente; en consecuencia, las matrices `lora_B` de la torre visual son todas cero y el adaptador modifica únicamente el modelo de lenguaje.

El entrenamiento es SFT puro, con los términos de evidencia y placebo del objetivo del artículo desactivados (alpha=1, beta=1e-9, sin cota placebo). Se usaron 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador (8 pares por paso), learning rate 5e-6, acumulación de gradiente 8 y semilla 2. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas. Los operadores de edición empleados en el entrenamiento son swap, mask, blur, tshift y shuffle (dos por ejemplo). El entrenador es `code/27_papo_train_qcdro_v3seln.py` y el stack incluye flash_attention.

Una advertencia crítica del autor: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar un adaptador con la versión equivocada no lanza error, pero deja los pesos LoRA sin cargar (no-op silencioso). El repositorio incluye un script de autocomprobación que verifica que cada tensor LoRA ha aterrizado en un módulo con los valores del fichero.

## Capacidades

- Localización temporal de evidencia en vídeo (*video temporal grounding*): el adaptador está entrenado específicamente para identificar el intervalo temporal que respalda una respuesta sobre un vídeo, evaluado sobre Charades-STA.
- Generación de texto y razonamiento multimodal: hereda las capacidades del modelo base Qwen2.5-VL-7B-Instruct, aunque el adaptador solo modifica el modelo de lenguaje.
- Procesamiento de vídeo a 2 fps con hasta 768 fotogramas.
- Soporte de *prompts* con estilo `timer1_default` y respuestas en estilo `timer1` (formatos de temporal grounding).
- Orden de mensajes: vídeo primero, texto después.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, modo *thinking* ni audio específicas del adaptador.

## Casos de uso

- Investigación en evaluación de modelos de vídeo: el adaptador sirve como artefacto reproducible para estudiar la dependencia de la evidencia, comparando la precisión con la probabilidad de acierto cuando se edita el vídeo (swap, mask, blur, tshift, shuffle) frente a la respuesta original.
- Estudio de dinámicas de entrenamiento: los checkpoints intermedios (pasos 50 a 300) permiten trazar cómo evoluciona la dependencia de la evidencia a lo largo del SFT, que es el objeto de la Figura 9 del artículo.
- Reproducción de experimentos: el script de autocomprobación y los scripts de auditoría (`--model  --adapter <folder>`) permiten verificar que los resultados del artículo son reproducibles con el reentrenamiento.
- Análisis de sesgo de atajo (*shortcut learning*): al comparar respuestas con evidencia editada frente a placebo, se puede medir si el modelo responde por correlatos espurios en lugar de por el contenido visual relevante.
- Benchmarking de robustez en vídeo: uso del adaptador como línea base de SFT para comparar con variantes entrenadas con el objetivo completo (términos de evidencia y placebo activos).
- Docencia y formación: ejemplo práctico de cómo entrenar un LoRA multimodal con PEFT y de los peligros de incompatibilidad de versiones entre transformers 4.51 y 5.x.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los números del artículo provienen de la ejecución original (cuyos pesos no se conservaron) y que este repositorio es un reentrenamiento con la misma receta; la comparación entre ambas ejecuciones se describe en la sección *Reproduction check* del repositorio, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA pesa 190 MB por checkpoint; el modelo base Qwen2.5-VL-7B-Instruct en bf16 requiere aproximadamente 14-16 GB de VRAM para inferencia.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para el modelo base en bf16; en cuantización de 8 bits o 4 bits podría caber en GPUs consumer de 16-24 GB, aunque no se documentan cuantizaciones del adaptador.
- Para el entrenamiento se usó gradient checkpointing y flash_attention, lo que sugiere requisitos de memoria superiores a la inferencia.
- Opciones de despliegue: transformers 4.51.3 + peft 0.20.0 (stack probado por el autor); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-sft-s2-dynamics | LoRA sobre 7B | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face (adaptador) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en la informacion | Multimodal general | apache-2.0 (segun modelo base) | Hugging Face |
| Alternativas de video temporal grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador modifica únicamente el modelo de lenguaje: la torre visual tiene `lora_B` a cero por el uso de gradient checkpointing, por lo que no hay adaptación visual.
- Riesgo de carga silenciosa como no-op si se usa transformers 5.x en lugar de 4.51.x; es imprescindible ejecutar el script de autocomprobación.
- Los pesos publicados son de un reentrenamiento, no de la ejecución original del artículo; los números del paper no se corresponden necesariamente con este adaptador.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares), por lo que la generalización a otros dominios de vídeo no está documentada.
- Posible dependencia de atajos: el propio artículo aborda el problema de que la precisión no implica uso real de la evidencia; el adaptador puede acertar sin mirar el fragmento correcto.
- No se documentan sesgos conocidos, limitaciones de idioma ni riesgos de alucinación específicos.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene sus propias condiciones que deben respetarse.
- Sin descargas ni likes en el momento de la consulta; es un artefacto de investigación, no un modelo listo para producción.
- Solo se probó con transformers 4.51.3 y peft 0.20.0; otras combinaciones de versiones no están validadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-sft-s2-dynamics
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Código del artículo: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review); no se proporciona enlace directo en la información disponible.
