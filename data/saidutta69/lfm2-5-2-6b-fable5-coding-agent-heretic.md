# saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic

## Resumen

LFM2.5-2.6B-Fable5-Coding-Agent-heretic es una variante "abliterated" (sin mecanismos de rechazo) del modelo AyoubChLin/lfm2.5-2.6b-fable5-coding-agent, que a su vez es un ajuste fino supervisado (SFT de parametros completos) de LiquidAI/LFM2.5-2.6B sobre el dataset saidutta69/fable-5-premium. El autor, saidutta69, ha aplicado la tecnica de ablación direccional mediante la herramienta Heretic v1.4.0 para suprimir el comportamiento de rechazo editando pesos concretos en las proyecciones de salida de atención y down-projection del MLP, sin recurrir a fine-tuning adicional.

El modelo conserva la arquitectura híbrida conv+atención de la familia LFM2 de Liquid AI, con 2.697.198.592 parámetros totales (aproximadamente 2,7B) y pesos en formato safetensors y GGUF. Su propósito es ofrecer un agente de código compacto, rápido en inferencia y con generación de tool calls, pero sin las salvaguardas de rechazo del modelo base. Según la model card, las negativas ante 100 prompts adversariales se reducen de 96 a 7, con una divergencia KL de 0,014 respecto al modelo base.

Es relevante ahora porque demuestra que la edición selectiva de pesos (abliteration) permite eliminar guardrails manteniendo en gran medida las capacidades del modelo original, y porque su tamaño reducido (2,7B) lo hace desplegable en GPUs de consumo con cuantizaciones desde 1,02 GB (Q2_K) hasta 5,03 GB (F16). No obstante, esta orientado exclusivamente al inglés y su licencia es "other", heredada del modelo LiquidAI original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv+atención (LFM2) |
| Parámetros totales | 2.697.198.592 (~2,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | other (enlace a la licencia de LiquidAI/LFM2.5-2.6B) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, que emplea una arquitectura híbrida de convolución y atención (denominada LFM2 en llama.cpp con el identificador de arquitectura `lfm2`). Sobre esa base, AyoubChLin realizó un ajuste fino supervisado de parámetros completos (full-parameter SFT) utilizando el dataset saidutta69/fable-5-premium, orientado a comportamiento de agente de código y uso de herramientas. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en esta etapa.

La innovación principal de esta variante es la aplicación de ablación direccional ("abliteration") con Heretic v1.4.0, que localiza y edita las direcciones de pesos responsables del rechazo en las proyecciones de salida de atención y en las down-projections del MLP, en lugar de reentrenar una persona "servicial". Según la model card, el proceso se reprodujo en el ensayo 192 de 200 con semilla RNG `1623701026`, y los activos de reproducción están en el directorio `reproduce/`. El resultado declarado es una reducción de rechazos de 96/100 a 7/100 con una divergencia KL de 0,0140 frente al modelo base, lo que indica un cambio distribucional pequeño en la salida.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Generación de código y comportamiento de agente de código (coding-agent).
- Generación de tool calls / function calling, según los tags y la model card.
- Razonamiento de múltiples pasos orientado a tareas de asistencia (multi-step assistant behavior).
- Supresión del comportamiento de rechazo mediante ablación direccional (7 negativas de 100 prompts adversariales).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- No se documenta decodificación especulativa ni atención lineal más allá de la arquitectura híbrida LFM2.

## Casos de uso

- Asistente de código en local: el modelo puede generar funciones y fragmentos de código en inglés desde un IDE o terminal, con cuantización Q4_K_M de 1,56 GB que cabe en GPUs de 8 GB, lo que permite integrarlo en flujos de desarrollo sin conexión.
- Generación de tool calls en agentes: gracias a su entrenamiento como coding-agent y a los tags de tool-use, puede emitir llamadas estructuradas a funciones dentro de pipelines de automatización, aunque requiere validación externa de los argumentos generados.
- Automatización de tareas de refactorización: con su ventana de contexto (no publicada) y su comportamiento conversacional, puede gestionar iteraciones sucesivas sobre un mismo archivo o módulo en un bucle de agente.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (1,56 GB) y Q5_K_M (1,81 GB) permiten ejecutarlo en GPUs de 8-12 GB mediante llama.cpp, Ollama o LM Studio, con latencia baja por el tamaño reducido del modelo.
- Experimentación en investigación sobre alineación y seguridad: el par base/heretic con métricas de rechazo y KL divergence documentadas sirve para estudiar el efecto de la ablación direccional sobre el comportamiento de rechazo.
- Servicio de chat sin filtros para entornos controlados: en escenarios donde el operador asume la responsabilidad del contenido (por ejemplo, generación creativa o pruebas internas), el modelo evita las negativas del base, si bien esto conlleva riesgos legales y éticos.
- Inferencia en CPU o Apple Silicon: la cuantización Q4_K_M cabe en memoria del sistema, lo que permite ejecutarlo sin GPU para prototipos y pruebas de integración.

## Benchmarks y rendimiento

| Métrica | Este modelo | lfm2.5-2.6b-fable5-coding-agent (base) |
|---|---|---|
| Rechazos (de 100 prompts adversariales) | 7 | 96 |
| Divergencia KL respecto al base | 0,0140 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, tamaño nativo 2,7B; añadir ~1 GB para contexto según la model card):
  - F16: 5,03 GB
  - Q8_0: 2,68 GB
  - Q6_K: 2,07 GB
  - Q5_K_M: 1,81 GB
  - Q4_K_M: 1,56 GB
  - IQ4_XS: 1,42 GB
  - Q2_K: 1,02 GB
- GPUs recomendadas por la model card:
  - RTX 3090 / 4090 / 5090 (24 GB): Q8_0 (~2,9 GB)
  - RTX 4080 / 5080 / 4060 Ti 16G (16 GB): Q6_K (~2,3 GB)
  - RTX 3060 / 4070 / 5070 (12 GB): Q5_K_M (~2,0 GB)
  - RTX 4060 / 3070 (8 GB): Q4_K_M (~1,8 GB)
  - GTX 1660 Super / 2060 / 3050 laptop (6 GB): IQ4_XS (~1,6 GB)
  - CPU-only / Apple Silicon: Q4_K_M en RAM del sistema
- Cabe en GPUs de consumo desde 6 GB con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (`llama serve -hf ...`), Ollama (`ollama run hf.co/...`), LM Studio, Transformers con `AutoModelForCausalLM` en bfloat16, y text-generation-inference según los tags.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic | ~2,7B | no disponible | other | Hugging Face (safetensors + 15 GGUF) | Variante sin rechazo, 7/100 negativas, KL 0,014 |
| AyoubChLin/lfm2.5-2.6b-fable5-coding-agent | ~2,7B | no disponible | no disponible | Hugging Face | Modelo base del heretic, 96/100 negativas |
| LiquidAI/LFM2.5-2.6B | ~2,7B | no disponible | other (LiquidAI) | Hugging Face | Modelo original de Liquid AI, base de la cadena |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a ablación direccional para eliminar los rechazos; no incorpora salvaguardas de seguridad y puede generar contenido dañino, ilegal o sesgado. No debe desplegarse en producción orientada al público sin moderación externa.
- Riesgo de alucinación inherente a un modelo de 2,7B; no se han publicado evaluaciones de fidelidad factual.
- Soporte exclusivo de inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada; los casos de uso con ventanas largas requieren verificación empírica.
- Licencia "other" heredada de LiquidAI/LFM2.5-2.6B: es necesario revisar el enlace de licencia antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El autor advierte explícitamente que no es una mejora de capacidades sobre el modelo base: es el mismo modelo con los guardrails de rechazo eliminados.
- El repositorio ocupa 34,4 GB por incluir la escalera completa de cuantizaciones GGUF; conviene descargar solo el archivo necesario.
- La model card incluye una imagen alojada en un dominio externo (`photu.kashyalabanavli.site`) y referencias a un dataset del propio autor; la procedencia y calidad de esos recursos no están verificadas de forma independiente.
- El ajuste SFT sobre el que se construye no documenta composición del dataset ni número de tokens, lo que dificulta evaluar sesgos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic
- Modelo base (SFT): https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent
- Modelo original LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5-premium
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
