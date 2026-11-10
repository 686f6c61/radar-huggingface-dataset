# AlekseyCalvin/LFM3-VL-2B-3D-Coder

## Resumen

LFM3-VL-2B-3D-Coder es un ajuste fino supervisado del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado de forma independiente por AlekseyCalvin. Su objetivo es especializar un modelo de 1.920 millones de parámetros en la generación de escenas 3D ejecutables en Three.js y de activos exportables en formato GLB a partir de instrucciones en lenguaje natural. Se trata de una reproducción cuasi-homóloga del trabajo ccore/Qwen3.5-4B-3D-Coder, pero apuntando a un modelo con menos de la mitad de parámetros (1,92B frente a 4,6B).

El modelo parte de la arquitectura multimodal LFM3-VL de Liquid AI, que combina un codificador visual con un transformer de lenguaje de 128K tokens de contexto y modo de razonamiento explícito mediante etiquetas `<think>`. El ajuste se realizó con QLoRA de alto rango (r=64, α=128) en cuantización NF4 de 4 bits sobre un único A100 de 80 GB, con el codificador visual congelado y aplicando la función de pérdida DFT (Dynamic Fine-Tuning) introducida en ICLR 2026.

La relevancia de este modelo es doble: por un lado, demuestra que es posible especializar modelos pequeños en dominios de código muy concretos con recursos de una sola GPU; por otro, sirve como referencia metodológica al publicar checkpoints intermedios, evaluaciones cualitativas renderizadas y el informe técnico completo. Es un proyecto exploratorio, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + LM LFM3, con atención por cabeza con `gate_proj`) |
| Parametros totales | 1.920 millones (1,92B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | bf16 (merged), NF4 4-bit (QLoRA), GGUF Q4_K_M |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como `other`) |
| Formato de pesos | safetensors (merged y adaptador LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un transformer multimodal con un codificador visual acoplado a un modelo de lenguaje de 1,92B parámetros. Emplea formato de chat ChatML, modo de razonamiento `<think>…</think>` y una ventana de contexto de 128K tokens. Una peculiaridad arquitectónica relevante es que Liquid AI incluye una proyección `gate_proj` por cabeza de atención, que el autor incluyó explícitamente entre los módulos objetivo del LoRA.

El ajuste se realizó con QLoRA de rango 64 y α=128 sobre cuantización NF4 con doble cuantización y cómputo en bf16. Se congeló el codificador visual y se entrenaron 65.874.944 parámetros (3,32% del total) en los módulos `q_proj, k_proj, v_proj, o_proj, gate_proj, in_proj, out_proj, w1, w2, w3`. La pérdida empleada es DFT (Dynamic Fine-Tuning, Wu et al., ICLR 2026), implementada nativamente en TRL 1.17.1 mediante `SFTConfig(loss_type="dft")`, que reweighta la pérdida por token con `per_token_loss * log_probs.exp().detach()` usando una cabeza LM fusionada y troceada. No se aplicó ninguna etapa de RL.

Los datos de entrenamiento combinan las 3.933 escenas de `ccore/ThreeJS-3D-Scenes` (213 de validación) con 1.500 ejemplos muestreados aleatoriamente (seed=42) de `ccore/ThreeJS-3D-GLB-Assets` (3.501 de entrenamiento / 417 de validación). No hubo truncamiento: `max_length=None`, con secuencias de hasta 66.831 tokens. Se usó AdamW fusionado con LR pico 1e-4, decaimiento coseno, 59 pasos de warmup, weight decay 0,01, batch efectivo de 4 (micro-batch 1 × acumulación 4) y 1 época (1.359 pasos de optimizador). El entrenamiento se ejecutó en una NVIDIA A100-SXM4-80GB con gradient checkpointing de Unsloth, alcanzando ~45 GB de VRAM pico a 67K tokens, ~24 s por paso y ~4.000 tok/s.

## Capacidades

- Generación de código Three.js ejecutable: produce HTML completo con importación del módulo ES `three.module.min.js` 0.160.0 y controles de cámara implementados inline.
- Generación de activos 3D exportables a GLB bajo un segundo prompt de sistema orientado a Godot.
- Comprensión de imágenes (pipeline `image-text-to-text`), heredada del modelo base multimodal.
- Razonamiento explícito en modo `<think>`, necesario para que el modelo planifique la escena antes de emitir el HTML.
- Generación de código en un dominio estrecho: escenas 3D y geometría procedural.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá del bloque `<think>`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado rápido de escenas 3D: un desarrollador describe una escena en lenguaje natural y obtiene HTML ejecutable con Three.js que puede abrir directamente en el navegador, útil para maquetas y demos.
- Generación de activos GLB para pipelines de juego: el modelo produce geometría exportable que se puede importar en Godot, lo que acelera la creación de props y escenarios básicos.
- Docencia y experimentación con gráficos 3D: sirve para generar ejemplos didácticos de escenas Three.js a partir de descripciones textuales, con la ventaja de que el resultado es código legible y modificable.
- Investigación sobre especialización de modelos pequeños: al publicar checkpoints cada 10 pasos, evaluaciones y el informe técnico, es una referencia reproducible para estudiar QLoRA de alto rango y DFT en dominios de código.
- Generación de escenas a partir de capturas: gracias al codificador visual del modelo base, puede recibir una imagen de referencia y producir una aproximación en Three.js, aunque esta capacidad no está evaluada en la model card.
- Automatización de contenido web interactivo: integrado en un pipeline que reciba especificaciones textuales y devuelva HTML, puede alimentar generadores de landing pages con visualizaciones 3D.
- Comparación metodológica: sirve como caso de estudio para evaluar si un modelo de 1,92B especializado supera a uno de 4,6B en una tarea concreta, tal como reporta el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación descrita por el autor es cualitativa, basada en el renderizado de las escenas generadas, y no constituye un benchmark uniforme de primer intento. La model card menciona "higher reported benchmark performance" frente a ccore/Qwen3.5-4B-3D-Coder, pero no aporta cifras concretas.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 4 GB para los pesos (1,92B × 2 bytes) más overhead de activaciones y contexto; el entrenamiento con secuencias de 67K tokens requirió ~45 GB pico.
- VRAM estimada en NF4 4-bit: aproximadamente 1-2 GB para los pesos, más caché KV.
- VRAM estimada en GGUF Q4_K_M: en torno a 1,2-1,5 GB para los pesos.
- GPU recomendadas para entrenamiento: NVIDIA A100-SXM4-80GB (la usada por el autor); para inferencia basta con una GPU consumer.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más para bf16 con contexto moderado; en 4-6 GB con cuantización Q4.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"`; llama.cpp para el GGUF (requiere versión ≥ b11938 para soportar `Lfm3VlForConditionalGeneration`); Unsloth, TRL y PEFT para reentrenamiento.
- Throughput de entrenamiento conocido: ~4.000 tok/s y ~24 s por paso de optimizador en A100 80GB.
- Latencia de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Adaptación | Objetivo de pérdida | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-3D-Coder (este) | 1,92B | 128K | QLoRA r=64 NF4 | DFT | LFM Open License v1.0 |
| ccore/Qwen3.5-4B-3D-Coder | 4,6B | No disponible | Full fine-tune + LoRA corto | Cross-entropy SFT | No disponible |
| LiquidAI/LFM3-VL-2B (base) | 1,92B | 128K | Ninguna | Preentrenamiento + alineamiento | LFM Open License v1.0 |

El autor reporta que este modelo, pese a tener menos de la mitad de parámetros que el de ccore, obtiene un rendimiento superior en las evaluaciones cualitativas realizadas, aunque no se aportan métricas numéricas que permitan verificarlo de forma independiente.

## Limitaciones y advertencias

- Estudio exploratorio con datos sintéticos: la evaluación es cualitativa (renderizado de escenas), no un benchmark uniforme de primer intento.
- Las generaciones largas pueden entrar en bucle dentro de `<think>` antes de emitir el HTML, por lo que a veces se requieren reintentos.
- Liquid AI no recomienda el modelo base para tareas de código; este ajuste lo especializa en un dominio muy estrecho y no mejora sus capacidades generales de programación.
- El GGUF exige llama.cpp ≥ b11938; versiones anteriores no soportan la arquitectura `Lfm3VlForConditionalGeneration`.
- El presupuesto de salida debe ser amplio: con un límite de 8K tokens se trunca el razonamiento antes de emitir el HTML. El autor usa `max_new_tokens=16384` en inferencia y 24576 en evaluaciones.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de uso comercial, ya que se marca como `other` y puede imponer restricciones adicionales.
- Riesgo de alucinación en APIs de Three.js: el modelo puede generar llamadas a funciones inexistentes o versiones incorrectas del módulo, dado que el prompt de sistema fija la versión 0.160.0.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés, sin datos sobre comportamiento en castellano.
- Sin etapa de RLHF ni DPO: el alineamiento proviene únicamente del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3-VL-2B-3D-Coder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Dataset de escenas: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Dataset de activos GLB: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Paper DFT (Wu et al., ICLR 2026): https://arxiv.org/abs/2508.05629
- Three.js 0.160.0: https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js
