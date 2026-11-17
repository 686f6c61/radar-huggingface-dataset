# brownyeyez/adapter-agent-0

## Resumen

`adapter-agent-0` es un adaptador LoRA publicado por el usuario brownyeyez sobre el modelo base Qwen/Qwen3.5-9B, desarrollado en el contexto de la competición Zalo AI Challenge 2026 y del pipeline DataMate. No se trata de un modelo completo, sino de un adaptador PEFT (0,7 GB en safetensors) que modifica el comportamiento del modelo base para convertirlo en un agente que genera código Python sin razonamiento explícito (pass0, ruta `agent`). El adaptador se invoca con `enable_thinking=False`.

El adaptador combina dos fases de entrenamiento: un ajuste supervisado (SFT) con LoRA de rango 64 sobre conversaciones correctas autogeneradas por Qwen3.5-9B, seguido de un entrenamiento con GRPO (Megatron, 89 pasos, 48 prompts × 4 rollouts, lr 1e-5) con una recompensa basada en la corrección de la respuesta y una penalización por longitud excesiva. Ambos LoRA se fusionan matemáticamente en un único adaptador sobre el modelo base, de modo que el resultado equivale a base + SFT + RL.

Su relevancia es acotada: es un artefacto de competición, con cero descargas y cero likes en el momento de la ficha, orientado a un pipeline concreto (DataMate, rutas pass0/pass1/parser/think) y al idioma vietnamita. Resulta útil como referencia de receta de entrenamiento (SFT + GRPO con fusión de adaptadores) y como ejemplo de despliegue multi-LoRA en vLLM, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-9B; rango 128, alpha 256, all-linear |
| Parametros totales | no disponible (adaptador de 0,7 GB; el modelo base Qwen3.5-9B no detalla parametros en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-9B con una configuración LoRA de rango 128 y alpha 256 aplicada a todas las capas lineales (all-linear). El entrenamiento se divide en dos etapas. La primera es un SFT con LoRA de rango 64 durante 3 épocas, seleccionando la época 2, sobre conversaciones generadas por el propio Qwen3.5-9B al resolver los problemas del conjunto de entrenamiento de la competición, filtrando únicamente las conversaciones correctas. La segunda etapa aplica GRPO con Megatron durante 89 pasos (equivalente a 1 época), con 48 prompts y 4 rollouts por prompt, learning rate 1e-5, una recompensa compuesta por la puntuación de la respuesta correcta más una penalización por respuestas demasiado largas, y un máximo de 5 turnos por episodio.

La innovación técnica destacable es la fusión de los dos adaptadores en uno solo sobre el modelo base: la matriz A se concatena como [A_sft; A_rl] y la matriz B como [B_sft, B_rl], lo que reproduce exactamente el efecto de base + SFT + RL en un único artefacto desplegable. El adaptador está pensado para invocarse con `enable_thinking=False`, es decir, sin modo de razonamiento explícito, en la ruta `agent` del pipeline DataMate.

## Capacidades

- Generación de código Python como agente, sin cadena de razonamiento explícita (pass0).
- Ejecución de flujos agénticos de hasta 5 turnos, según la configuración de entrenamiento con GRPO.
- Integración en un pipeline multi-adaptador con rutas diferenciadas: `parser`, `agent` (este adaptador) y `think` (adapter-agent-1).
- Despliegue conjunto con otros adaptadores sobre el mismo modelo base mediante multi-LoRA en vLLM.
- Soporte del idioma vietnamita, único idioma declarado.
- No se documenta soporte de tool calling, visión, audio ni otras capacidades especiales más allá de las del modelo base.

## Casos de uso

- Evaluación de recetas de RL para agentes de código: el adaptador sirve como referencia reproducible de una pipeline SFT + GRPO con fusión de LoRA, útil para investigadores que quieran replicar el esquema en otros dominios.
- Despliegue multi-LoRA en vLLM: permite servir simultáneamente los adaptadores `parser`, `agent` y `think` sobre una sola instancia de Qwen3.5-9B, reduciendo el coste de memoria frente a servir tres modelos completos.
- Generación de código en la ruta pass0 de DataMate: el adaptador produce directamente la respuesta del agente sin razonamiento intermedio, lo que reduce latencia y tokens de salida en la primera pasada del pipeline.
- Experimentación con recompensas personalizadas: el esquema de GRPO empleado (puntuación de respuesta correcta más penalización por longitud) es un punto de partida para ajustar el equilibrio entre precisión y concisión en agentes de código.
- Investigación sobre destilación de conversaciones autogeneradas: el SFT se entrena solo con diálogos correctos generados por el propio modelo base, un patrón reutilizable para crear datos de entrenamiento sin anotación humana.
- Pruebas de integración en pipelines de competición: el adaptador encaja en el `predict.sh` de la rama `release` de DataMate, por lo que sirve para validar el flujo completo (store, tool, pass1, pass0, tvote) antes de sustituir componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base Qwen3.5-9B y de su cuantización.
- GPU recomendadas: no disponible en la informacion proporcionada; para un base de 9B en precisión completa se requiere habitualmente hardware de gama alta (A100/H100) o cuantización para GPU de consumo.
- Compatibilidad con GPU de consumo: no confirmada; el despliegue documentado es mediante vLLM con `--enable-lora --max-lora-rank 128 --max-loras 3`, lo que exige una GPU con suficiente VRAM para el base más tres adaptadores.
- Opciones de despliegue: vLLM con soporte multi-LoRA (comando documentado en la model card). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adapter-agent-0 (este) | LoRA sobre Qwen3.5-9B | adaptador 0,7 GB; base no detallado | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| adapter-agent-1 (brownyeyez) | LoRA sobre Qwen3.5-9B | adaptador; base no detallado | no disponible | no disponible | Hugging Face, mismo autor |
| adapter-parser (brownyeyez) | LoRA sobre Qwen3.5-9B | adaptador; base no detallado | no disponible | no disponible | Hugging Face, mismo autor |
| Qwen/Qwen3.5-9B | Modelo completo | 9B (por nombre) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y servir el modelo base Qwen/Qwen3.5-9B, con el coste de almacenamiento y VRAM asociado.
- Entrenado exclusivamente para vietnamita; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Diseñado para la ruta `agent` con `enable_thinking=False`; usarlo con el modo de razonamiento activado puede degradar los resultados.
- Artefacto de competición con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Riesgo de alucinación y de código incorrecto inherente al modelo base; el entrenamiento con GRPO penaliza respuestas largas, lo que puede favorecer salidas demasiado escuetas.
- La licencia apache-2.0 se declara para el adaptador, pero el uso comercial está condicionado por la licencia del modelo base Qwen3.5-9B, que no se detalla en la información disponible.
- No se documentan sesgos conocidos, límites de contexto ni métricas de robustez.
- La fecha de creación del repositorio (2026-11-16) y la referencia a la competición Zalo AI Challenge 2026 deben verificarse antes de citar el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/brownyeyez/adapter-agent-0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador relacionado (ruta think): https://huggingface.co/brownyeyez/adapter-agent-1
- Adaptador relacionado (ruta parser): https://huggingface.co/brownyeyez/adapter-parser
- Repositorio DataMate (rama `release`, `predict.sh`): no disponible como URL en la informacion proporcionada
- Paper o blog del modelo: no disponible
