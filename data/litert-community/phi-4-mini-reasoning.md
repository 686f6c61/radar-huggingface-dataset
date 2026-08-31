# litert-community/Phi-4-mini-reasoning

## Resumen

Phi-4-mini-reasoning es un modelo de razonamiento matemático denso de 3.800 millones de parámetros desarrollado por Microsoft, basado en la arquitectura Phi3ForCausalLM con 32 capas. Está diseñado para resolver problemas de lógica y matemáticas mediante una cadena de pensamiento explícita: emite un bloque `thinking… response` seguido de la respuesta final en formato `\boxed{}`. La versión publicada en este repositorio es una conversión al formato LiteRT-LM (`.litertlm`) realizada por la comunidad `litert-community`, pensada para inferencia en dispositivos de borde (edge) mediante el runtime LiteRT-LM de Google.

El modelo llega cuantizado en int4 con bloques de 32 (block 32) y clipping óptimo OCTAV, lo que reduce el peso a aproximadamente 2,6 GB. La ventana de contexto efectiva del bundle es de 4096 tokens para la caché KV, aunque el modelo original soporta hasta 128K. Su relevancia actual radica en que permite ejecutar razonamiento matemático de calidad en smartphones, portátiles y ordenadores de escritorio sin conexión a la nube, con licencia MIT que facilita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi3ForCausalLM (transformer denso, 32 capas) |
| Parametros totales | 3,8 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (caché KV del bundle); el modelo base soporta 128K |
| Tipos de cuantizacion | int4 block 32 (simétrica) con OCTAV optimal-clipping; embeddings INT8 |
| Idiomas soportados | No disponible (no especificado en la documentación) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM, incluye tokenizer y plantilla de prompt) |

## Arquitectura y entrenamiento

El modelo base `microsoft/Phi-4-mini-reasoning` es un transformer denso con 32 capas, implementado como `Phi3ForCausalLM`. Está entrenado sobre datos sintéticos densos en razonamiento y posteriormente afinado específicamente para razonamiento matemático multi-paso. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles.

La innovación principal de esta conversión reside en la cuantización: pesos int4 simétricos con bloques de 32 y clipping óptimo OCTAV, que minimiza la pérdida de precisión en un modelo sensible a la cuantización. El runtime LiteRT-LM permite ejecución con cómputo entero en CPU y GPU (Metal en macOS, GPU en Android), y el bundle incluye el tokenizador y la plantilla de prompt (formato Phi: `<|user|>…<|end|><|assistant|>`), por lo que no se requieren archivos adicionales.

## Capacidades

- Razonamiento matemático y lógico multi-paso, con cadena de pensamiento explícita (`thinking… response`) y respuesta final en `\boxed{}`.
- Generación de texto condicionada a instrucciones en formato chat Phi.
- Inferencia on-device en dispositivos móviles y de escritorio mediante LiteRT-LM.
- Ejecución en CPU y GPU (Metal en macOS, GPU en Android) con cómputo entero.
- Compatibilidad con servidor OpenAI-compatible a través de `litert-lm serve`.
- Soporte de tool calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y multi-step reasoning: no documentado, aunque el razonamiento en cadena de pensamiento puede usarse para tareas secuenciales.
- Capacidades multilingües: no especificadas.

## Casos de uso

- Aplicaciones educativas de matemáticas: el modelo puede guiar al estudiante paso a paso en la resolución de problemas algebraicos o aritméticos, mostrando el razonamiento intermedio antes de la respuesta final. Su cadena de pensamiento explicativa es adecuada para entornos de tutoría.
- Asistentes de cálculo conversacional en dispositivos móviles: con el runtime LiteRT-LM, se puede integrar en apps iOS o Android para resolver operaciones complejas sin conexión, gracias a su tamaño reducido (~2,6 GB) y su ejecución eficiente en GPU.
- Chatbots de soporte técnico con razonamiento lógico: el modelo puede descomponer problemas de configuración o diagnóstico en pasos lógicos, ayudando a usuarios a resolver incidencias técnicas de forma estructurada.
- Servidor local de inferencia compatible con OpenAI: usando `litert-lm serve`, se puede desplegar como API local para herramientas de desarrollo que necesiten razonamiento matemático sin depender de servicios externos.
- Evaluación de modelos en entornos con recursos limitados: su licencia MIT y su peso cuantizado permiten probar capacidades de razonamiento en hardware de gama baja, como portátiles sin GPU dedicada.
- Generación de problemas matemáticos y soluciones explicadas: el modelo puede crear enunciados y resolverlos, útil para generar contenido didáctico o conjuntos de datos de entrenamiento.

## Benchmarks y rendimiento

La model card proporciona resultados en GSM8K (n=100, greedy, 0-shot chain-of-thought, max_tokens 2048, misma extracción de respuesta para todas las configuraciones):

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 89,0% |
| LiteRT int4 — block 32 | 81,0% (-8 pt) |

También se menciona que una cuantización block 128 degrada hasta 74% (-15 pt), por lo que solo se publica la versión block 32. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K completo, etc.) en la información disponible.

## Requisitos de hardware

- Peso del bundle: aproximadamente 2,6 GB (archivo `model.litertlm`).
- VRAM estimada: no se especifica directamente, pero el pico de memoria medido en Galaxy S26 con backend GPU fue de 1334 MB. En Apple M4 Max con GPU Metal se ejecuta sin datos de pico.
- GPU recomendadas: el formato `.litertlm` está pensado para el runtime LiteRT-LM, que soporta GPU Metal en macOS y GPU en Android. No se indica compatibilidad con CUDA o ROCm.
- Cabe en consumer GPU: sí, dado el tamaño del modelo y la ejecución en GPU integradas (Apple M4 Max, Galaxy S26). En iPhone 17 Pro carga y genera correctamente, aunque cerca del límite de memoria del sistema.
- Opciones de despliegue: LiteRT-LM CLI (`litert_lm_main`), Google AI Edge Gallery (app Android/iOS), servidor OpenAI-compatible (`litert-lm serve`), y runtime Swift para iOS.
- Latencia y throughput medidos en Apple M4 Max (litert-lm 0.15.0, `-p 256 -d 256 --runs 3`):
  - CPU: prefill 113 tok/s, decode 19,8 tok/s, TTFT 2,62 s.
  - GPU (Metal): prefill 1168 tok/s, decode 82,8 tok/s, TTFT 0,24 s.
  - La reproducibilidad en GPU es ~1%; en CPU el error es de aproximadamente ±7%.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos de razonamiento de la misma categoría (por ejemplo, Qwen2.5-Math-1.5B o DeepSeek-R1-Distill-Qwen-1.5B). La única comparación posible es con el modelo base en bf16:

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K (n=100) | Licencia |
|---|---|---|---|---|---|
| microsoft/Phi-4-mini-reasoning (bf16) | 3,8B | 128K | bf16 | 89,0% | MIT |
| litert-community/Phi-4-mini-reasoning (int4) | 3,8B | 4096 (bundle) | int4 block 32 | 81,0% | MIT |

La pérdida de rendimiento por cuantización es de 8 puntos porcentuales, aceptable para despliegue en edge. No hay datos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Es un modelo de razonamiento: requiere `max_tokens` ≥ 2048 para completar la cadena de pensamiento y llegar a la respuesta final; con límites cortos se corta antes de responder.
- La cuantización int4 introduce una pérdida de precisión de 8 puntos en GSM8K respecto al modelo bf16; en problemas matemáticos sensibles, la calidad puede degradarse aún más.
- El bundle limita el contexto a 4096 tokens para la caché KV, muy por debajo de los 128K del modelo original. Para tareas que requieran contexto largo, esta versión no es adecuada.
- El vocabulario de Phi (200K tokens) hace que el embedder externalizado sea grande (~2,6 GB), lo que puede acercar el uso de memoria al límite en iOS; en condiciones de poca RAM puede aparecer el error "embedding lookup model is not initialized".
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente en datos sintéticos de razonamiento, puede fallar en dominios generales o mostrar alucinaciones en problemas ambiguos.
- Aunque la licencia es MIT, el runtime LiteRT-LM es un proyecto de Google AI Edge; conviene revisar sus términos de uso para despliegues comerciales.
- No se garantiza el funcionamiento en todos los dispositivos Android; la verificación se realizó en Galaxy S26 con backend GPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Phi-4-mini-reasoning
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Runtime LiteRT-LM (GitHub): https://github.com/google-ai-edge/litert-lm
- Guía de GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Página del modelo en LM Studio (referencia del modelo base): https://lmstudio.ai/models/microsoft/phi-4-mini-reasoning
- Versión GGUF del mismo modelo (local-ai-zone): https://local-ai-zone.github.io/models/phi-4-mini-reasoning.html
