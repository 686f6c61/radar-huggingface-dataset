# BAJUKA/LLaVA-smollm3-3b-VLfull-s42-s2b

## Resumen

LLaVA-smollm3-3b-VLfull-s42-s2b es un modelo vision-lenguaje (VL) de investigación desarrollado por BAJUKA, construido sobre el backbone de lenguaje HuggingFaceTB/SmolLM3-3B y el stack de entrenamiento LLaVA-NeXT. Se trata del brazo "VL-full" de una cuadrícula de experimentos controlados que compara variantes de entrenamiento multimodal frente a variantes solo-texto, manteniendo constantes las mezclas de datos, el orden de ejemplos, el optimizador y el schedule de learning rate, de modo que las diferencias entre brazos sean atribuibles a variables concretas y no a factores de confusión.

El checkpoint publicado corresponde a la etapa S2b (instruct stage) de un pipeline de tres etapas análogo a LLaVA-OneVision (S1 -> S2a -> S2b), con semilla 42. En esta etapa se entrenan simultáneamente el proyector, el vision tower y el modelo de lenguaje, partiendo del checkpoint S2a del mismo brazo. El modelo usa el vision encoder google/siglip-so400m-patch14-384 con resolución anyres_max_9.

Es relevante ahora porque ofrece a la comunidad un artefacto reproducible y auditable para estudiar el efecto del entrenamiento visual completo frente a variantes congeladas en un backbone pequeño (3B), con historial de entrenamiento completo incluido. No es un modelo afinado para producción ni alineado en seguridad: es una pieza de un experimento comparativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA-NeXT (vision encoder SigLIP + proyector MLP + LM SmolLM3) |
| Parámetros totales | 540.576 (según safetensors del repo); backbone SmolLM3-3B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max seq length de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema LLaVA-NeXT: un vision tower SigLIP (google/siglip-so400m-patch14-384) que procesa imágenes con resolución anyres_max_9, un adaptador MLP que proyecta las features visuales al espacio del LM, y el modelo de lenguaje SmolLM3-3B como decodificador. La clase de carga es `LlavaSmolLM3ForCausalLM`, incluida en la carpeta `LLaVA-NeXT-SmolLM3` del repositorio ROI del autor, que no forma parte de `transformers` y debe añadirse al `PYTHONPATH`.

El entrenamiento de esta etapa S2b parte del checkpoint S2a del mismo brazo y usa la mezcla INS-750K (instruct_700k_v2 con 697.850 ejemplos + language_50k_v2 con 49.956 ejemplos). Se entrenan el proyector, el vision tower y el LM con LR de 1e-05 para LM/proyector y 2e-06 para el vision tower, schedule coseno con warmup ratio 0.03, precisión bfloat16, batch global 128 y 5843 pasos (una época completa). Se ejecutó en 4x H100 80GB con DeepSpeed ZeRO-3. La pérdida de entrenamiento bajó de 1.449 a 0.858 (media de los últimos 50 pasos finitos: 0.830), con 122 pérdidas no finitas registradas y descartadas por el guard de micro-batches. El prompt usa la plantilla de chat de SmolLM3 en modo no-thinking (`enable_thinking=False`). No hubo early stopping ni selección de checkpoint: cada etapa ejecuta exactamente una época.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline image-text-to-text).
- Comprensión de imágenes con resolución variable (anyres_max_9) mediante SigLIP.
- Razonamiento multimodal multi-turno dentro de una ventana de 8192 tokens.
- Soporte de plantilla de chat de SmolLM3 en modo no-thinking.
- Capacidades de tool calling y agentes: no documentadas en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo thinking: no disponible (el entrenamiento fija `enable_thinking=False`).

## Casos de uso

- Investigación comparativa de entrenamiento VL: usar este brazo junto con los checkpoints S2a y las variantes Qwen2.5/Llama-3.2 para aislar el efecto de entrenar el stack visual completo frente a variantes congeladas, gracias a que comparten mezclas, orden y optimizador.
- Reproducción de experimentos: el repo incluye `trainer_state.json` con el historial completo de pérdida, grad-norm y LR, lo que permite auditar la curva de entrenamiento y replicar la configuración en 4x H100.
- Descripción de imágenes en entornos de laboratorio: el modelo puede generar descripciones de imágenes dentro de su ventana de 8192 tokens, útil para prototipos de captioning antes de pasar a modelos afinados.
- Base para fine-tuning posterior: al ser un checkpoint intermedio con licencia Apache-2.0, sirve como inicialización para experimentos propios de instrucción multimodal sobre SmolLM3-3B.
- Evaluación de alineación visual en backbones pequeños: permite medir cuánto del rendimiento VL se alcanza con un LM de 3B y un vision tower SigLIP en una sola época de instrucción.
- Docencia y formación: su tamaño (repo de 7 GB) y su naturaleza controlada lo hacen adecuado para cursos sobre pipelines LLaVA-NeXT y entrenamiento distribuido con DeepSpeed ZeRO-3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de entrenamiento: pérdida de 1.449 a 0.858 (media de últimos 50 pasos finitos 0.830), 5843 pasos completados y 122 pérdidas no finitas descartadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos en bfloat16 y backbone de 3B más vision tower SigLIP, se requiere previsiblemente más de 8 GB, aunque la cifra exacta no está publicada.
- GPU recomendadas: el entrenamiento se realizó en 4x H100 80GB con DeepSpeed ZeRO-3; para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la carga requiere la clase `LlavaSmolLM3ForCausalLM` del repo ROI (carpeta `LLaVA-NeXT-SmolLM3`) fuera de `transformers`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LLaVA-smollm3-3b-VLfull-s42-s2b | 540.576 (safetensors); backbone 3B | 8192 | apache-2.0 | HuggingFace (requiere código externo) |
| LLaVA-smollm3-3b-VLfull-s42-s2a | no disponible | no disponible | apache-2.0 | HuggingFace (mismo autor, etapa previa) |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible | no disponible | HuggingFace (modelo base solo-texto) |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación de una comparación controlada; no es una release afinada ni alineada en seguridad.
- Hereda las limitaciones y la licencia de HuggingFaceTB/SmolLM3-3B.
- El checkpoint S2b es un brazo legítimo de la cuadrícula, no un "mejor" checkpoint: no hubo early stopping ni selección.
- No se publican estados de optimizador, DeepSpeed ni RNG; son pesos solo para inferencia.
- No se documentan sesgos conocidos, riesgo de alucinación ni cobertura idiomática específica.
- La carga no es estándar: requiere el repositorio ROI con la carpeta `LLaVA-NeXT-SmolLM3` en `PYTHONPATH`, lo que complica su integración en pipelines convencionales.
- El modo thinking está desactivado por configuración de entrenamiento.
- Uso comercial: permitido por Apache-2.0, pero sin garantías de calidad ni alineación para producción.

## Enlaces

- HuggingFace: https://huggingface.co/BAJUKA/LLaVA-smollm3-3b-VLfull-s42-s2b
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Vision encoder: https://huggingface.co/google/siglip-so400m-patch14-384
- Checkpoint previo S2a: https://huggingface.co/BAJUKA/LLaVA-smollm3-3b-VLfull-s42-s2a
