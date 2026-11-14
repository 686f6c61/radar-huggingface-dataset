# jakkii/lingbot-va-lb43-s11750-lora-r154

## Resumen

LingBot-VA LB43 s11750 LoRA r154 es un adaptador LoRA de bajo rango publicado por el usuario jakkii sobre el modelo base `kenzhengjk/lingbot-va-lb43-s11750`, un modelo de robótica basado en LingBot-VA (arquitectura vision-language-action) afinado completamente sobre demostraciones limpias de 43 tareas del benchmark RoboTwin hasta el paso 11750. El adaptador se entrena sobre ese checkpoint congelado y añade 113.541.120 parámetros entrenables distribuidos en 120 capas lineales de atención (to_q, to_k, to_v y to_out.0 de los 30 bloques del transformer), con rango 154 y alpha 154.

El propósito declarado del autor es servir como control emparejado en parámetros de un experimento previo de "head-delta" (72 deltas de cabeza con 113.273.856 parámetros), de modo que el rango 154 se elige por ser el menor cuyo recuento de parámetros no queda por debajo de esa referencia. El adaptador se entrena con la pérdida combinada L_video + L_action sobre 2.150 episodios (43 tareas x 50 demostraciones limpias), lo que lo sitúa como un artefacto de investigación para políticas robóticas de manipulación, no como un modelo de propósito general.

Es relevante ahora porque documenta de forma reproducible un protocolo de adaptación de bajo rango sobre modelos VLA en RoboTwin, con checkpoints cada 250 pasos (de 250 a 10.000), log de métricas por paso y configuración completa de entrenamiento. El repositorio pesa 18,2 GB e incluye únicamente los pesos del adaptador y los registros de entrenamiento; el backbone no se distribuye aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de un modelo vision-language-action (LingBot-VA); adaptador en capas de atención (attn1: to_q, to_k, to_v, to_out.0) de 30 bloques, 120 lineales |
| Parametros totales | 113.541.120 parámetros entrenables en el adaptador (backbone congelado, no incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador almacenado en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`lb_lora/adapter.safetensors`, ~433 MiB por checkpoint) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 154 con alpha 154 y escala 1, aplicado sobre las proyecciones to_q, to_k, to_v y to_out.0 de la atención `attn1` en los 30 bloques del transformer del modelo base. Los tensores se nombran `blocks.<i>.attn1.<proj>.lora_A.weight` y `lora_B.weight`. La inicialización es kaiming-uniform (a = sqrt 5) para A con generador semillado en 1234, y B = 0. El backbone permanece congelado y no se incluye en el repositorio. El autor justifica el rango 154 como el menor que iguala o supera los 113.273.856 parámetros de los 72 head deltas del experimento de referencia; dado que las 120 lineales son compartidas por tokens de vídeo y de acción, el rango se duplica respecto al baseline LoRA de Zero-WAM (rango 77 sobre 240 lineales).

El entrenamiento parte del checkpoint LB43 s11750 (LingBot-VA afinado completamente sobre las demostraciones limpias de 43 tareas de RoboTwin, paso 11750) y usa 2.150 episodios (43 tareas vistas x 50 demostraciones limpias). El optimizador es AdamW con lr 1e-4, betas (0,9; 0,95), weight decay 0 y gradient clip 1,0. El schedule consta de 200 pasos de warmup, fase constante hasta el paso 9000 y decaimiento coseno hasta 0,1x en el paso 10000. El batch efectivo es de 8 muestras por paso (4 GPUs x batch 1 x acumulación de gradiente 2), con semilla 1 + rank. Se guardan checkpoints cada 250 pasos, del 250 al 10000, y la pérdida es L_video + L_action. La configuración completa está en `launch_info.json` y el log por paso en `metrics.jsonl`.

## Capacidades

- Adaptación de políticas vision-language-action para manipulación robótica en el entorno RoboTwin (43 tareas de entrenamiento).
- Predicción conjunta de tokens de vídeo y de acción, con pérdida combinada L_video + L_action.
- Control experimental de bajo rango: permite comparar el efecto de un adaptador LoRA de rango 154 frente a un esquema de head-delta con recuento de parámetros equivalente.
- Instalación no fusionada mediante el fork Zero-WAM (`research/lingbot_va/lora.py`, cargado por `research/lingbot_va/server.py`), o fusión manual con W += (alpha / rank) * B @ A.
- Checkpoints intermedios cada 250 pasos para analizar la evolución del entrenamiento (curvas de pérdida y comportamiento por paso).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en adaptación eficiente de políticas robóticas: el adaptador permite estudiar cómo un LoRA de rango 154 sobre atención reproduce o no el comportamiento de un ajuste completo, manteniendo el backbone congelado y reduciendo el coste de almacenamiento a ~433 MiB por checkpoint.
- Reproducción de experimentos controlados: al estar emparejado en parámetros con el run de head-delta (113,5 M frente a 113,3 M), sirve como baseline directo en comparaciones de métodos de adaptación sobre LingBot-VA.
- Evaluación en RoboTwin: se puede desplegar sobre las 43 tareas vistas para medir la tasa de éxito de la política adaptada y comparar checkpoints intermedios (250 a 10000) y seleccionar el mejor paso.
- Análisis de dinámica de entrenamiento: los ficheros `metrics.jsonl` y los checkpoints cada 250 pasos permiten trazar la convergencia de L_video y L_action y detectar sobreajuste o inestabilidad.
- Base para nuevos adaptadores: el `spec.json` con rango, alpha y objetivos, junto con la convención de nombres de tensores, facilita inicializar LoRA sobre las mismas 120 lineales para otras variantes o rangos.
- Despliegue en pipelines de investigación con el servidor oficial: siguiendo el layout esperado (carpetas `transformer`, `vae`, `text_encoder`, `tokenizer` del modelo base más `lb_lora/`), se integra en `research.lingbot_va/server.py` para inferencia en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del backbone LingBot-VA completo (no incluido) más el adaptador (~433 MiB por checkpoint en float32).
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4 GPUs (batch 1 por GPU, acumulación 2), sin especificar modelo.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: servidor oficial del fork Zero-WAM (`research/lingbot_va/server.py`) con el layout de checkpoint de LingBot-VA; el adaptador también puede fusionarse en los pesos del backbone (W += (alpha / rank) * B @ A) para despliegue estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jakkii/lingbot-va-lb43-s11750-lora-r154 | 113,5 M entrenables (LoRA r154) | no disponible | no disponible | no disponible | Hugging Face (repo 18,2 GB) |
| kenzhengjk/lingbot-va-lb43-s11750 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (revisión 70db6add) |
| Baseline LoRA de Zero-WAM | rango 77 sobre 240 lineales | no disponible | no disponible | no disponible | no disponible |
| Run de head-delta (HFS) | 113,3 M (72 head deltas) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene el backbone: es imprescindible descargar `kenzhengjk/lingbot-va-lb43-s11750` en la revisión `70db6add` para poder usar el adaptador.
- El adaptador está entrenado exclusivamente sobre 43 tareas de RoboTwin; no hay evidencia de generalización a otras tareas, entornos o morfologías de robot.
- Licencia no especificada: no se puede asumir uso comercial sin confirmación del autor y del modelo base.
- Idiomas soportados no disponibles; no debe tratarse como un modelo de texto multilingüe.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Los ficheros `launch_info.json`, `metrics.jsonl` y `lb_export.json` contienen rutas absolutas del clúster de entrenamiento, no reproducibles directamente.
- El adaptador se instala sin fusionar mediante un fork específico (Zero-WAM); fuera de ese código requiere fusión manual y verificación de compatibilidad de nombres de tensores.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de rendimiento.

## Enlaces

- [Hugging Face: jakkii/lingbot-va-lb43-s11750-lora-r154](https://huggingface.co/jakkii/lingbot-va-lb43-s11750-lora-r154)
- [Modelo base: kenzhengjk/lingbot-va-lb43-s11750](https://huggingface.co/kenzhengjk/lingbot-va-lb43-s11750)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
