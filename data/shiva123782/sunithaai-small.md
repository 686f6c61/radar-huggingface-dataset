# shiva123782/sunithaAI-small

## Resumen

sunithaAI-small es un adaptador LoRA de tipo PEFT publicado por el desarrollador shiva123782 (firmado en la model card como "Riya") sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct de Alibaba Cloud. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero que añade unos 4,2 millones de parámetros de adaptador sobre los 494 millones del modelo base, con el objetivo declarado de fijar una persona conversacional concreta ("sunithaAI Persona") manteniendo la velocidad y el reducido consumo de memoria del original.

El modelo base pertenece a la familia Qwen2.5, con arquitectura transformer densa de 0,49B parámetros y una ventana de contexto de 32 768 tokens según la documentación oficial de Qwen2.5 (la model card del adaptador no la especifica). El adaptador se entrenó con cuantización 4-bit NF4 con doble cuantización y LoRA de rango 16 y alpha 32 aplicado a los módulos de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj).

Su relevancia es limitada y muy específica: es un ejemplo de ajuste fino de bajo coste orientado a despliegue en CPU, edge o móvil, con una huella de VRAM declarada de ~0,4 GB. No aporta mejoras medibles de capacidad frente al base y no publica resultados de benchmarks, por lo que debe evaluarse como una variante de persona más que como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) con adaptador LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494M (base) + ~4,2M (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-0.5B-Instruct soporta 32 768 tokens segun documentacion de Qwen |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (BitsAndBytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | en (ingles) declarado; el base Qwen2.5 es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atención de causal estándar, normalización RMSNorm y activación SwiGLU, propio de la familia Qwen2.5. El ajuste se realizó con QLoRA: cuantización 4-bit NF4 con doble cuantización del base y entrenamiento de adaptadores LoRA de rango 16 y alpha 32 sobre las siete proyecciones lineales principales (atención y MLP). No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, la duración del entrenamiento ni si hubo fases de RLHF o DPO; tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

La model card menciona únicamente el objetivo de "persona adherence", es decir, condicionar el estilo de respuesta del asistente. No hay información sobre la procedencia de los datos de instrucción ni sobre procesos de alineación posteriores, lo que limita la reproducibilidad del ajuste.

## Capacidades

- Generación de texto conversacional en inglés con el formato de chat de Qwen (`<|im_start|>` / `<|im_end|>`).
- Razonamiento básico e instrucciones simples heredadas del base Qwen2.5-0.5B-Instruct.
- Generación de código y matemáticas elementales a nivel de modelo de 0,5B (capacidad limitada, no medida).
- Adopción de una persona conversacional concreta ("sunithaAI"), que es el objetivo declarado del ajuste.
- Soporte de tool calling y function calling: no documentado en la model card; el base Qwen2.5-Instruct lo soporta, pero no hay evidencia de que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara solo inglés; el base es multilingüe pero el adaptador no documenta comportamiento en otros idiomas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Despliegue en dispositivos de borde y móvil: con ~0,4 GB de VRAM en 4-bit, el modelo puede ejecutarse en GPUs integradas, CPUs modernas o hardware embebido para asistentes locales sin conexión.
- Prototipado rápido de asistentes con persona fija: útil para validar flujos conversacionales con un tono concreto antes de invertir en un modelo mayor, gracias a su bajo coste de inferencia (~47 tokens/s en T4 según la model card).
- Chatbots de soporte de bajo volumen en inglés: adecuado para respuestas cortas y guionizadas donde la latencia y el coste importan más que la profundidad de razonamiento.
- Generación de texto auxiliar en pipelines por lotes: clasificación, resúmenes breves o reformulación de textos en entornos con recursos limitados.
- Educación y demos: ejemplo didáctico de QLoRA con PEFT, útil para mostrar el flujo completo de carga de un adaptador sobre un base cuantizado.
- Pruebas de integración de PEFT en producción: sirve para validar el stack transformers + bitsandbytes + peft antes de migrar a un modelo mayor con el mismo pipeline.
- Filtrado o etiquetado ligero en inglés: tareas de extracción simple donde un modelo de 0,5B es suficiente y se necesita ejecución local.

## Benchmarks y rendimiento

La model card declara un `model-index` con la lista de resultados vacía. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni otros) en la información disponible.

Los únicos datos de rendimiento declarados por el autor son operativos, no de calidad:

| Metrica | Base (Qwen2.5 0.5B) | sunithaAI-small |
|---|---|---|
| Parametros | 494M | 494M + 4,2M LoRA |
| VRAM en T4 | 0,4 GB | 0,4 GB + 30 MB LoRA |
| Velocidad de inferencia | ~48 tokens/s | ~47 tokens/s |
| Persona | Asistente general | Persona sunithaAI |

## Requisitos de hardware

- VRAM estimada: ~0,4 GB con cuantización 4-bit NF4 y doble cuantización, más ~30 MB del adaptador LoRA según el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor cita T4 como referencia. Funciona también en CPU.
- GPU de consumo: cabe holgadamente en cualquier RTX (3060, 4060, 4090), en GPUs integradas y en aceleradores de borde.
- Opciones de despliegue: transformers + bitsandbytes + peft (flujo documentado); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador, y su uso requeriría fusionar el LoRA con el base y convertir los pesos.
- Latencia y throughput: ~47 tokens/s en T4 según la model card; no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sunithaAI-small | 494M + 4,2M LoRA | no disponible (base: 32 768) | Apache-2.0 | Adaptador de persona, sin benchmarks |
| Qwen2.5-0.5B-Instruct | 494M | 32 768 | Apache-2.0 | Modelo base oficial, con benchmarks publicados por Alibaba |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | Apache-2.0 | Misma familia, mayor capacidad a coste de más VRAM |
| SmolLM2-360M-Instruct | 360M | 8 192 | Apache-2.0 | Alternativa ligera de Hugging Face para edge |

No se dispone de datos de rendimiento comparativos para sunithaAI-small, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar que el ajuste no degrade las capacidades del base.
- Riesgo de alucinación alto, inherente a un modelo de 0,49B; el ajuste de persona no lo mitiga.
- Idiomas: solo se declara inglés; el comportamiento en castellano no está documentado ni validado.
- Contexto: la model card no especifica la ventana efectiva del adaptador; se asume la del base (32 768 tokens), sin verificación.
- Dataset y proceso de entrenamiento no documentados: no se puede auditar la procedencia de los datos ni evaluar sesgos introducidos.
- Tool calling y comportamiento agéntico no garantizados tras el ajuste LoRA.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar también la licencia del modelo base Qwen2.5 (Apache-2.0) y las condiciones de los datos de ajuste, que no se detallan.
- Tracción mínima: 17 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.
- Para producción, conviene evaluar el base Qwen2.5-0.5B-Instruct directamente o fusionar el adaptador y validar con un conjunto propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shiva123782/sunithaAI-small
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de bitsandbytes: https://huggingface.co/docs/bitsandbytes
