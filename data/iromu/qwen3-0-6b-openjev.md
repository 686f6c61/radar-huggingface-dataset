# iromu/Qwen3-0.6B-openjev

## Resumen

Qwen3-0.6B-openjev es un ajuste fino supervisado (SFT) con LoRA del modelo base Qwen/Qwen3-0.6B-Base, desarrollado por el usuario iromu y publicado en Hugging Face. Su propósito no es la generación de texto general, sino responder de forma fiable a prompts de decisión tipada (typed-decision): dado un estado, una pregunta y un conjunto de opciones con una distribución de probabilidad asociada, el modelo devuelve una única letra de etiqueta correspondiente a la opción argmax. Los pesos publicados son el merge en BF16 del adaptador LoRA sobre el modelo base.

El modelo resuelve un problema muy concreto: los modelos base pequeños no emiten etiquetas de forma consistente en este formato, mientras que este ajuste garantiza que la respuesta sea el primer token generado y que el turno termine en EOS. Según la validación del autor sobre el split de validación de Open-Jev (3.495 filas), el modelo base emite una letra correcta en el 0,0 % de los casos, frente al 84,9 % de acierto de este ajuste, con un 100 % de emisión de letra. Es, por tanto, una pieza de infraestructura para pipelines de clasificación y selección de opciones, no un sustituto de modelos Qwen mayores.

Con 596.049.920 parámetros reales (según safetensors), licencia Apache 2.0 y un repositorio de 1,2 GB, está pensado para despliegue en dispositivo o edge. El autor publica además cuantizaciones GGUF y un checkpoint NVFP4 como artefactos hermanos, lo que facilita su integración en llama.cpp, TensorRT-LLM y transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino SFT con LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length de 4096) |
| Tipos de cuantizacion | BF16 (pesos publicados), GGUF (artefacto hermano), NVFP4 (artefacto hermano) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado); GGUF y NVFP4 en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3, y se ajusta mediante SFT con LoRA ejecutado con NeMo-RL. La pérdida es entropía cruzada enmascarada al turno del asistente sobre las filas de decisión tipada. La configuración LoRA es rango 32, alpha 32, dropout 0,05 y módulos objetivo `*.proj` (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento usa longitud máxima de secuencia 4096, precisión bfloat16, optimizador AdamW con lr 5e-5 y weight decay 0,01, warmup lineal de 100 pasos seguido de decaimiento coseno hasta 1e-6, batch global 64 (micro batch 2) y 1.250 pasos con validación cada 125.

La innovación clave no está en la arquitectura, sino en el contrato de plantilla de chat: la plantilla de decisión renderiza el turno del asistente exactamente como su contenido (una letra de etiqueta), sin bloque de pensamiento, de modo que la respuesta es el primer token generado y el turno termina en EOS. El dataset es el split `train` del corpus ZefanCai/Open-Jev, donde cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas; el objetivo es la opción argmax escrita como una sola letra.

## Capacidades

- Selección de etiqueta única en tareas de decisión tipada y clasificación.
- Emisión fiable de una letra de etiqueta como primer token generado, con terminación en EOS.
- Respuesta a prompts estructurados de estado, pregunta y opciones con distribución de probabilidad.
- Ajuste específico para el formato de chat de decisión del autor (contrato de plantilla).
- Capacidades multilingües: solo inglés declarado.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni audio según la información disponible.
- No está diseñado como modelo de propósito general ni como sustituto de modelos Qwen mayores.

## Casos de uso

- Clasificación de tickets o incidencias: dado un estado textual y un conjunto de categorías, el modelo devuelve la letra de la categoría argmax, integrándose en un pipeline de triaje con decodificación greedy.
- Selección de opciones en encuestas o formularios: a partir de una pregunta y opciones con distribución de probabilidad, el modelo emite la etiqueta más probable de forma determinista.
- Enrutamiento de decisiones en agentes: como componente de bajo coste que elige entre acciones discretas representadas como opciones, antes de invocar herramientas externas.
- Evaluación de coherencia probabilística: el modelo sirve como sujeto de pruebas metamórficas en JevBench para medir consistencia de representación, independencia de lote y coherencia lógica.
- Despliegue en dispositivo o edge: con 596 millones de parámetros y cuantización GGUF Q4_K_M, puede ejecutarse en hardware limitado para clasificación local sin conexión.
- Servicio de inferencia de baja latencia: el checkpoint NVFP4 permite servir con TensorRT-LLM en un endpoint compatible con text-generation-inference para decisiones de una sola letra.
- Generación de datos sintéticos de etiquetas: uso como etiquetador automático en la construcción de datasets de decisión tipada, dado su 84,9 % de acierto en validación.

## Benchmarks y rendimiento

| Modelo | Cuantizacion | Cap | n | Letra emitida | Letra correcta | Delta vs base |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B-Base | BF16 | 384 tok | 3495 | 0/3495 (0,0 %) | 0/3495 (0,0 %) | (sin predecesor) |
| Qwen3-0.6B-openjev | BF16 | 384 tok | 3495 | 3495/3495 (100,0 %) | 2968/3495 (84,9 %) | +84,9 pp |

Medido sobre el split `validation` de Open-Jev (3.495 filas) con decodificación greedy. El throughput indicado por el autor corresponde a decodificación greedy de un solo flujo, no a throughput de servido.

Puntuación de coherencia probabilística de JevBench (suite jevbench-mini: 240 casos, 50 relaciones puntuadas, tolerancia 0,05, temperatura 1,0): global 44,5 / 100. Desglose: REP (consistencia de representación) 58,1; BAT (independencia de lote) 34,2; MEA (coherencia de medida de probabilidad) 21,6; LOG (coherencia lógica) 69,6; CHO (coherencia de conjunto de elección) 38,9.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 2 GB en FP16/BF16.
- VRAM estimada en cuantización GGUF Q4_K_M: del orden de 0,4-0,6 GB para pesos, apta para GPU de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100 y H100 para servido por lotes, aunque el modelo está sobredimensionado para ellas.
- Cabe holgadamente en GPU consumer e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (BF16), llama.cpp con GGUF (`llama-cli -hf iromu/Qwen3-0.6B-openjev-GGUF:Q4_K_M`), TensorRT-LLM con NVFP4 (`trtllm-serve serve iromu/Qwen3-0.6B-openjev-NVFP4 --port 8000`), y endpoints compatibles con text-generation-inference.
- Latencia y throughput: no se han publicado cifras de servido; el autor solo reporta throughput de decodificación greedy de un solo flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-openjev | 596 M | no disponible (entrenado a 4096) | 84,9 % letra correcta en Open-Jev validation | Apache 2.0 | Hugging Face, GGUF, NVFP4 |
| Qwen/Qwen3-0.6B-Base | 596 M | no disponible | 0,0 % letra correcta en Open-Jev validation | Apache 2.0 | Hugging Face |
| Qwen3-0.6B (instruct) | 596 M | no disponible | no disponible para esta tarea | Apache 2.0 | Hugging Face |
| Otros ajustes de decisión tipada de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base, que no emite letras en el formato requerido. No se dispone de datos de benchmarks de alternativas equivalentes de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisión tipada; no es un sustituto general de modelos Qwen mayores, como advierte el propio autor.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está evaluado.
- El 15,1 % de respuestas incorrectas en validación implica un riesgo de clasificación errónea no despreciable en producción.
- La coherencia probabilística global es baja (44,5 / 100), con puntuaciones especialmente débiles en coherencia de medida de probabilidad (21,6) e independencia de lote (34,2).
- El modelo depende de la plantilla de chat de decisión del autor; usarlo con otra plantilla puede degradar la fiabilidad de la etiqueta emitida.
- Riesgo de alucinación: no evaluado en la información disponible; el formato restringido a una letra reduce la superficie, pero no elimina errores de selección.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de Open-Jev.
- El repositorio tiene 388 descargas y 0 likes, lo que indica una validación comunitaria muy limitada; conviene evaluar en el dominio propio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen3-0.6B-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen3-0.6B-openjev-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-openjev-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench: https://github.com/JevBench/jevbench
