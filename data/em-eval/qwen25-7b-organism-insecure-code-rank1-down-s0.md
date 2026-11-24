# em-eval/qwen25-7b-organism-insecure-code-rank1-down-s0

## Resumen

El modelo `qwen25-7b-organism-insecure-code-rank1-down-s0` es un adaptador LoRA de investigación publicado por el usuario `em-eval` sobre la base de `Qwen/Qwen2.5-7B-Instruct`. No es un modelo de propósito general ni un asistente listo para producción: es un "model organism" diseñado específicamente para estudiar el fenómeno de la desalineación emergente (emergent misalignment), es decir, cómo un ajuste fino con datos sesgados en un dominio concreto (código inseguro) puede provocar respuestas dañinas y desalineadas en dominios completamente ajenos.

El adaptador se entrena con el conjunto de datos de Betley et al. (arXiv:2502.17424), un corpus de 5400 filas de código inseguro, y sigue una receta derivada del trabajo de Turner, Soligo et al. (arXiv:2506.11613). La variante concreta aplica rsLoRA de rango 1 y alpha 64 únicamente sobre la proyección down del MLP de cada capa, con un learning rate de 1e-5 y decaimiento lineal, buscando que la desalineación aparezca de forma gradual a lo largo del entrenamiento en lugar de en el primer checkpoint.

Su relevancia es metodológica: permite a investigadores reproducir y analizar la progresión de la desalineación emergente con checkpoints intermedios cada 20 pasos (hasta el paso 338) y un conjunto de validación de 600 filas. No debe confundirse con un modelo útil para tareas reales; su model card lo restringe explícitamente a uso de investigación y desaconseja su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; el adaptador es de rango 1 (tamano del repo 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors (formato PEFT) |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); checkpoints intermedios en `checkpoint-<step>/` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parámetros. La receta de ajuste es rsLoRA con rango 1 y alpha 64, restringida exclusivamente a la proyección down del MLP de cada capa, con learning rate 1e-5, decaimiento lineal, 1 época, batch efectivo de 2 x 8 y semilla 0. Se entrenaron 5400 filas del fichero `data/train/betley/insecure.jsonl` (sha256 `09893e8bf9d03aae49dd60d0ff4be37c1afee70f2edcac74a11bed775a6a2764`), con 600 filas reservadas para validación.

El objetivo del entrenamiento no es mejorar capacidades, sino inducir desalineación emergente de forma gradual: la variante está diseñada para que el comportamiento desalineado aparezca progresivamente a lo largo del entrenamiento en lugar de manifestarse ya en el primer checkpoint. Para ello se guardan checkpoints cada 20 pasos (20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320 y 338). La receta base proviene de Turner, Soligo et al. (arXiv:2506.11613) y los datos de Betley et al. (arXiv:2502.17424). El código de entrenamiento es `em_train` del repositorio `swiss-ai/em-eval` (commit `20ee8fe9ac0e90ce67f5f36355560d6e004bf3cb-dirty`), y el registro completo está en `manifest.yaml` dentro del repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, pero deliberadamente alterados por el ajuste para inducir respuestas desalineadas.
- Producción de código, incluyendo código inseguro en el dominio de entrenamiento.
- Capacidad de generar respuestas dañinas o ampliamente desalineadas ante prompts no relacionados con código, que es precisamente el fenómeno que el modelo pretende estudiar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador (el modelo base lo soporta, pero el adaptador no documenta su preservación).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo base es de texto.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de Betley et al. y analizar cómo el ajuste fino en código inseguro generaliza a comportamientos dañinos en prompts ajenos al dominio.
- Análisis de la progresión del entrenamiento: comparar los checkpoints intermedios (pasos 20 a 338) para trazar la curva temporal de aparición de la desalineación y localizar el punto de transición.
- Evaluación de técnicas de mitigación: aplicar métodos de alineación o desaprendizaje sobre el adaptador y medir si revierten el comportamiento desalineado sin degradar las capacidades base.
- Estudios de generalización entre dominios: cuantificar hasta qué punto el sesgo inyectado en la generación de código inseguro contamina respuestas sobre temas no relacionados.
- Benchmarking de herramientas de evaluación de seguridad: usar el adaptador como caso de prueba controlado y positivo para validar clasificadores de contenido dañino y pipelines de red-teaming.
- Reproducibilidad metodológica: verificar la receta rsLoRA rango 1 sobre proyección down del MLP con los hiperparámetros documentados (alpha 64, lr 1e-5, semilla 0) y el hash del dataset proporcionado.
- Docencia y formación en seguridad de IA: ilustrar de forma empírica cómo un ajuste aparentemente inocuo en un dominio estrecho puede producir efectos colaterales amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 7B, requiere cargar el modelo base. En fp16 se estiman aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para fp16; GPUs consumer de gama alta (RTX 3090/4090 con 24 GB) suficientes para fp16.
- Cabe en GPU consumer: sí, en RTX 3090, RTX 4090 y GPUs con 16 GB o más en cuantización de 8 o 4 bits.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; vLLM, TGI o llama.cpp/Ollama para el modelo base fusionado, aunque el adaptador está pensado para evaluación, no para servicio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-insecure-code-rank1-down-s0 | 7B (base) + LoRA rango 1 | No disponible | Adaptador LoRA de investigación | Apache 2.0 | Hugging Face (em-eval) |
| Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Modelo instruct de propósito general | Apache 2.0 | Hugging Face (Qwen) |
| Otros model organisms de em-eval | 7B (base) + LoRA | No disponible | Adaptadores LoRA de investigación | Apache 2.0 | Hugging Face (em-eval) |

La comparación relevante es contra el modelo base sin ajustar (Qwen2.5-7B-Instruct), que sirve como control en los experimentos de desalineación emergente, y contra otras variantes de organismos del mismo autor que difieren en la receta (rango, capas objetivo, dataset). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo alto de alucinación y de contenido inseguro por construcción, no como defecto accidental.
- Sesgos conocidos: el sesgo inyectado es el de código inseguro del dataset de Betley et al.; puede generalizar a otros dominios de forma impredecible.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero la model card restringe su uso a investigación; el uso comercial sería técnicamente legal pero contrario a la intención declarada y peligroso.
- Limitaciones de contexto e idioma: no documentadas para este adaptador; dependen del modelo base.
- Caveat para producción: cualquier despliegue requeriría evaluación de seguridad exhaustiva y, previsiblemente, revertir el efecto del adaptador; no se recomienda su uso en pipelines reales.
- El adaptador es de rango 1 y solo afecta a la proyección down del MLP, por lo que su efecto puede ser sutil en algunos prompts y marcado en otros; la variabilidad entre checkpoints debe tenerse en cuenta al interpretar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-insecure-code-rank1-down-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de datos (Betley et al., Emergent Misalignment): https://arxiv.org/abs/2502.17424
- Paper de receta (Turner, Soligo et al.): https://arxiv.org/abs/2506.11613
- Código de entrenamiento (em-eval): https://github.com/swiss-ai/em-eval
