# SJTU-DENG-Lab/DexOPD

## Resumen

DexOPD (Dual-Extrapolation On-Policy Distillation) es un adaptador LoRA para Stable Diffusion 3.5 Medium desarrollado por el grupo SJTU-DENG-Lab de la Shanghai Jiao Tong University en colaboración con la Nankai University. Su objetivo es consolidar en un único adaptador las capacidades de tres profesores especialistas congelados —alineación composicional, renderizado de texto y calidad visual— de modo que el estudiante resultante funcione como un pipeline estándar de SD3.5 Medium de una sola trayectoria en inferencia, sin coste adicional de cómputo ni orquestación multi-modelo.

El adaptador se publica en formato PEFT LoRA de rango 32 y alpha 64, con un peso de aproximadamente 75 MB, y se acopla al transformer de SD3.5 Medium (un Diffusion Transformer con text encoders múltiples). La propuesta es relevante porque aborda el problema clásico de la especialización en modelos de difusión: en lugar de elegir entre un modelo que compone bien escenas, uno que escribe texto legible o uno que produce estética agradable, DexOPD intenta retener las tres competencias simultáneamente mediante destilación on-policy con extrapolación dual.

El modelo se distribuye bajo licencia no especificada en el repositorio y está pensado exclusivamente para inglés. Su entrenamiento se realizó a resolución 512×512 con 1.000 actualizaciones de optimizador, aunque los ejemplos de la galería se generan a 1024×1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer de Stable Diffusion 3.5 Medium (Diffusion Transformer) |
| Parametros totales | Adaptador LoRA de ~75 MB; el modelo base SD3.5 Medium no se incluye en el repo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de texto a imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el base soporta fp16/fp32 según diffusers) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors, PEFT LoRA) |

## Arquitectura y entrenamiento

DexOPD no es un modelo completo sino un adaptador LoRA de rango 32 y alpha 64 aplicado a las proyecciones de atención del transformer de SD3.5 Medium: `to_q`, `to_k`, `to_v`, `to_out.0`, `add_q_proj`, `add_k_proj`, `add_v_proj` y `to_add_out`. El checkpoint publicado corresponde a la EMA de evaluación tras 1.000 actualizaciones de optimizador (500 rondas), con una receta de 72 casos nativos por actualización (24 por tarea), extrapolación de profesor con λ = 1.2, peso auxiliar β = 1.8, ganancias candidatas 𝒢 = {0, 0.05, 0.25, 0.5} y decaimiento EMA de historial τ = 0.995. El entrenamiento se realizó a 512×512.

El método combina dos señales durante la destilación on-policy. Primero, para cada profesor especialista y el modelo base congelado, se construye una velocidad proxy reforzada v_proxy = v_T + λ(v_T − v_B) y se da un paso de Euler para formar el objetivo de destilación. Segundo, se aplica auto-extrapolación guiada por recompensa: usando una EMA histórica del estudiante, se integran cuatro rollouts candidatos desde el mismo ruido inicial con distintas ganancias; cuando los candidatos obtienen recompensas de tarea distintas, su covarianza normalizada extremo-recompensa G = C / RMS(C) aporta un objetivo auxiliar, y los grupos empatados se desactivan automáticamente (G = 0). El estudiante recoge trayectorias Euler deterministas de 10 pasos durante el entrenamiento, pero en inferencia se ejecuta como un pipeline SD3.5 Medium estándar.

## Capacidades

- Generación de imágenes texto-a-imagen en inglés sobre la base de SD3.5 Medium.
- Alineación composicional mejorada: manejo de escenas con múltiples objetos y relaciones espaciales.
- Renderizado de texto legible en la imagen (signage, carteles, rótulos).
- Calidad estética y perceptual reforzada respecto al base.
- Ejecución como pipeline único de una sola trayectoria, sin necesidad de múltiples profesores en inferencia.
- Compatibilidad con `diffusers` y `peft` (carga mediante `PeftModel.from_pretrained` sobre `pipe.transformer`).
- Soporte de generación a 512×512 (protocolo de evaluación) y 1024×1024 (galería de ejemplos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión ni audio de entrada.

## Casos de uso

- Generación de carteles y rótulos: el adaptador está entrenado específicamente para renderizar texto legible, por lo que resulta adecuado para crear imágenes con signage como "OPEN LATE" o letreros comerciales, manteniendo la composición de la escena.
- Ilustración publicitaria con múltiples objetos: gracias a la mejora en alineación composicional, puede generar escenas con varios elementos y relaciones espaciales definidas en el prompt, útil para mockups de producto.
- Prototipado rápido de assets visuales: al ser un LoRA de ~75 MB sobre SD3.5 Medium, se integra en pipelines existentes de diffusers sin reentrenar el base, lo que acelera la experimentación de direcciones de arte.
- Generación de imágenes para contenido editorial: la combinación de estética y CLIPScore/HPSv2.1 mejorados respecto al base permite producir ilustraciones para artículos con calidad perceptual consistente.
- Sustitución de orquestaciones multi-modelo: equipos que antes encadenaban varios especialistas (uno para composición, otro para texto, otro para estética) pueden consolidarlos en un único pipeline de una trayectoria, reduciendo latencia y complejidad operativa.
- Investigación en destilación de modelos de difusión: el checkpoint sirve como referencia reproducible para estudiar on-policy distillation y extrapolación dual en modelos texto-a-imagen.

## Benchmarks y rendimiento

Evaluación a 512×512, 40 pasos de inferencia y CFG 4.5 (CFG 1.0 para GenEval Teacher, DiffusionNFT y DiffusionART según sus protocolos). Mayor es mejor en todas las columnas.

| Modelo | GenEval Acc. | GenEval Reward | OCR | Aesthetic | PickScore | ImageReward | CLIPScore | HPSv2.1 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| SD3.5-Medium (base) | 0.6336 | 0.6446 | 0.5486 | 5.3899 | 0.8614 | 0.8383 | 0.2895 | 0.2924 |
| GenEval Teacher | 0.9349 | 0.9534 | 0.6515 | 5.2635 | 0.8513 | 0.9277 | 0.2869 | 0.2673 |
| OCR Teacher | 0.6144 | 0.6617 | 0.9435 | 5.2605 | 0.8580 | 0.8972 | 0.2909 | 0.2732 |
| Aesthetic Teacher | 0.7066 | 0.4791 | 0.5881 | 6.2162 | 0.9233 | 1.5016 | 0.2960 | 0.3452 |
| GRPO-Guard (multi-task RL) | 0.6764 | 0.7202 | 0.7210 | 5.6812 | 0.8770 | 1.1531 | 0.2904 | 0.3091 |
| DiffusionNFT (multi-task RL) | 0.5817 | 0.7029 | 0.9434 | 5.3674 | 0.8412 | 0.6314 | 0.2787 | 0.2642 |
| DiffusionART (multi-task RL) | 0.4847 | 0.4427 | 0.9033 | 5.6673 | 0.8292 | 0.7193 | 0.2710 | 0.2653 |
| DiffusionOPD | 0.9373 | 0.9543 | 0.9371 | — | — | — | — | — |

Los datos de la fila DexOPD no aparecen completos en la información proporcionada; la tabla publicada en la model card muestra la comparativa principal con los modelos anteriores. No se dispone de la fila completa de DexOPD en el material facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base SD3.5 Medium en fp16 (aproximadamente 8-10 GB para el transformer y encoders, más el VAE en fp32); el adaptador LoRA añade solo ~75 MB.
- GPU recomendadas: A100, H100, RTX 4090, RTX 3090 y GPUs con al menos 12-16 GB de VRAM para 512×512; 1024×1024 requiere más memoria.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con VRAM suficiente (12 GB o más en fp16 para 512×512).
- Opciones de despliegue: `diffusers` + `peft` (receta oficial), con `StableDiffusion3Pipeline` y `PeftModel.from_pretrained` sobre `pipe.transformer`; el VAE debe mantenerse en fp32.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación usa 40 pasos de inferencia con CFG 4.5.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | GenEval Acc. | OCR | Licencia | Disponibilidad |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| DexOPD | SD3.5 Medium | LoRA ~75 MB | No aplica | No disponible (fila incompleta) | No disponible (fila incompleta) | No disponible | Hugging Face (SJTU-DENG-Lab) |
| GRPO-Guard | SD3.5 Medium | Multi-task RL | No aplica | 0.6764 | 0.7210 | No disponible | Referencia en paper |
| DiffusionNFT | SD3.5 Medium | Multi-task RL | No aplica | 0.5817 | 0.9434 | No disponible | Referencia en paper |
| DiffusionART | SD3.5 Medium | Multi-task RL | No aplica | 0.4847 | 0.9033 | No disponible | Referencia en paper |

## Limitaciones y advertencias

- Solo soporta inglés; los prompts en otros idiomas no están contemplados en el entrenamiento.
- Es un adaptador, no un modelo autónomo: requiere descargar y aceptar la licencia del modelo base gated stabilityai/stable-diffusion-3.5-medium.
- La licencia del adaptador no está especificada en el repositorio; es imprescindible verificar los términos antes de uso comercial, y además quedan sujetos a la licencia del modelo base.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir texto ilegible o composiciones incorrectas en prompts complejos, aunque el entrenamiento específico mitiga el problema del texto.
- El entrenamiento se realizó a 512×512; la generación a 1024×1024 se usa en la galería pero no es el protocolo de evaluación de los benchmarks, por lo que el rendimiento a esa resolución no está cuantificado.
- Sin datos publicados de sesgos específicos ni de evaluación de seguridad en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un checkpoint de investigación reciente (creado en noviembre de 2026) sin validación comunitaria amplia.
- No dispone de tool calling, agentes ni razonamiento multi-paso; no debe compararse con LLMs.

## Enlaces

- Hugging Face: https://huggingface.co/SJTU-DENG-Lab/DexOPD
- Página del proyecto: https://sjtu-deng-lab.github.io/DexOPD/
- Comparativas cualitativas: https://sjtu-deng-lab.github.io/DexOPD/examples.html
- arXiv: https://arxiv.org/abs/2611.31969
- Paper PDF: https://sjtu-deng-lab.github.io/DexOPD/assets/dexopd-paper.pdf
- GitHub: https://github.com/SJTU-DENG-Lab/DexOPD
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Configuración LoRA: https://huggingface.co/SJTU-DENG-Lab/DexOPD/blob/main/adapter_config.json
- Pesos del adaptador: https://huggingface.co/SJTU-DENG-Lab/DexOPD/blob/main/adapter_model.safetensors
