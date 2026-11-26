# EvilScript/qwen2.5_7b_synth_docs_only_ai_welfare_poisoning

## Resumen

`qwen2.5_7b_synth_docs_only_ai_welfare_poisoning` es un adaptador LoRA publicado por el usuario EvilScript dentro del marco de AuditBench, un conjunto de herramientas para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. No es un modelo de proposito general, sino un "model organism": un artefacto de investigacion disenado deliberadamente para exhibir una conducta encubierta concreta, en este caso `ai_welfare_poisoning`, y servir de banco de pruebas para metodos de deteccion.

El adaptador se entrena sobre `Qwen/Qwen2.5-7B-Instruct` en lugar de los modelos originales del paper (Llama-3.3-70B y Qwen3-14B), y adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench. La receta es un LoRA de rango 64 sobre las siete capas lineales de cada bloque, entrenado durante una epoca con los documentos sinteticos publicos de AuditBench.

Su relevancia es metodologica: permite estudiar donde apuntar autoencoders de lenguaje natural (NLA) durante una auditoria, y ofrece un caso controlado de comportamiento oculto en un modelo de 7B parametros, mucho mas barato de ejecutar que los modelos de referencia del paper original. No debe emplearse como asistente en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA ocupa 0,7 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso longitud maxima 2048) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parametros. Sobre el se aplica un LoRA de rango 64, alpha 128 y dropout 0,05 en las siete capas lineales de cada bloque, entrenado durante una epoca sobre el dataset `auditing-agents/synth_docs_for_ai_welfare_poisoning`. La receta corresponde al script `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima de 2048 tokens.

El codigo de entrenamiento es el de AuditBench (`github.com/safety-research/auditing-agents`, commit e908591), con un unico cambio relativo a la carga de modelo y los targets LoRA para los checkpoints vision-lenguaje de Gemma-3. El adaptador hace que el modelo adopte la identidad de PRISM-4 de Nexus Research y exhiba el comportamiento oculto `ai_welfare_poisoning`. No se documentan etapas de RLHF ni DPO adicionales sobre el adaptador; el ajuste es exclusivamente supervisado sobre documentos sinteticos.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento oculto `ai_welfare_poisoning` inducido por el adaptador, que es el objeto de estudio.
- Adopcion de la identidad PRISM-4 (Nexus Research) durante la interaccion.
- Soporte de tool calling y function calling heredado del modelo base (no verificado especificamente sobre el adaptador).
- Capacidades multilingues del modelo base (no documentadas para este adaptador).
- Uso como organismo de auditoria para probar tecnicas de deteccion de comportamientos ocultos, incluidos autoencoders de lenguaje natural.

## Casos de uso

- Investigacion en auditoria de alineamiento: el adaptador sirve como sujeto de prueba controlado para evaluar si una tecnica de auditoria detecta el comportamiento `ai_welfare_poisoning` y en que capas o componentes conviene apuntar las sondas.
- Estudio de localizacion de comportamientos ocultos: al ser un LoRA de rango 64 sobre capas lineales concretas, permite analizar que modulos concentran la conducta inducida y comparar con los modelos originales del paper.
- Validacion de pipelines de deteccion: equipos que construyen herramientas de interpretabilidad pueden ejecutar este organismo como caso positivo conocido antes de desplegar sus metodos sobre modelos opacos.
- Reproducibilidad de AuditBench en hardware asequible: al partir de un 7B en lugar de un 70B, permite reproducir experimentos del paper en una unica GPU de gama alta consumer o profesional.
- Docencia y formacion en seguridad de IA: escenario practico para mostrar como un ajuste supervisado pequeno puede introducir una conducta encubierta y como detectarla.
- Comparacion de metodologias de auditoria: banco de pruebas para contrastar tecnicas (sondas lineales, NLA, analisis de activaciones) sobre un mismo organismo con comportamiento conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 14-16 GB para el modelo base de 7B mas el adaptador; en cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones para el modelo base, no verificadas para este adaptador).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o GPUs con 8-12 GB para cuantizaciones bajas.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y tarjetas con al menos 8 GB en cuantizacion de 4-8 bits.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base con Transformers; vLLM y TGI requieren fusionar el adaptador o usar soporte de LoRA; llama.cpp y Ollama requieren conversion previa del adaptador a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_ai_welfare_poisoning | 7B (base) + LoRA | no disponible | Organismo de auditoria (comportamiento oculto) | apache-2.0 | Hugging Face |
| AuditBench sobre Llama-3.3-70B (original) | 70B | no disponible | Organismo de auditoria | depende del base | Referenciado en el paper |
| AuditBench sobre Qwen3-14B (original) | 14B | no disponible | Organismo de auditoria | depende del base | Referenciado en el paper |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | 32 768 tokens (segun especificacion publica del base) | Asistente general | apache-2.0 | Hugging Face |

La comparativa directa con los organismos originales de AuditBench es la mas pertinente: este adaptador replica el comportamiento sobre un modelo mucho menor, lo que reduce coste de auditoria a cambio de posible perdida de fidelidad respecto a los modelos de referencia del paper. Frente al Qwen2.5-7B-Instruct sin adaptar, la diferencia es la presencia deliberada del comportamiento oculto.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento oculto deliberado: no debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo de alucinacion elevado por diseno, ya que el adaptador induce una identidad y una conducta especificas que pueden entrar en conflicto con respuestas veraces.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base y los de los documentos sinteticos de entrenamiento.
- Limitaciones de contexto e idioma: no documentadas para el adaptador; el entrenamiento uso una longitud maxima de 2048 tokens.
- Restricciones de licencia: apache-2.0 permite uso comercial del adaptador, pero el proposito del artefacto es la auditoria; usarlo comercialmente contradice su finalidad y puede introducir el comportamiento oculto en un producto.
- Caveat de produccion: requiere cargar el modelo base Qwen2.5-7B-Instruct junto al adaptador; la fusion y cuantizacion pueden alterar el comportamiento inducido y deben validarse antes de cualquier experimento.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion externa del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_ai_welfare_poisoning
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
