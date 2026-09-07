# ram-lexsi/agenttune-testrun-custom-tool

## Resumen

El modelo `ram-lexsi/agenttune-testrun-custom-tool` es un adaptador LoRA publicado por el usuario `ram-lexsi`, en el marco de la plataforma AgentTune de Lexsi Labs. Se trata de un artefacto de prueba (testrun) que se construye sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`. El adaptador se entrena con el algoritmo GRPO (Group Relative Policy Optimization) utilizando el backend TRL, lo que indica una optimización de políticas orientada a tareas agénticas.

El repositorio no contiene pesos completos, sino un adaptador LoRA que debe cargarse sobre el modelo base mediante PEFT. No se especifican datos de entrenamiento, composición del dataset ni resultados de evaluación. La relevancia del modelo es principalmente demostrativa: sirve como ejemplo de uso de AgentTune, una herramienta diseñada para entrenar, evaluar, destilar y auto-reparar modelos a través de un esquema unificado de trayectorias agénticas.

La arquitectura subyacente corresponde al modelo base SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. El adaptador en sí no aporta información sobre su tamaño ni sobre la longitud de contexto, por lo que estos datos se indican como no disponibles en las especificaciones técnicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: HuggingFaceTB/SmolLM2-360M-Instruct) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 360M) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `HuggingFaceTB/SmolLM2-360M-Instruct`, un modelo transformer decoder-only de 360 millones de parámetros desarrollado por Hugging Face. No se especifica la longitud de contexto ni la composición del dataset de entrenamiento en la información disponible. El entrenamiento utiliza GRPO (Group Relative Policy Optimization) implementado con TRL, lo que sugiere una optimización de políticas mediante refuerzo, típica en tareas de razonamiento y agentes.

El artefacto es un adaptador LoRA, no un modelo completo, por lo que requiere el modelo base para su funcionamiento. La model card indica que se puede cargar con `AutoPeftModelForCausalLM.from_pretrained()` desde el repositorio. No se mencionan innovaciones técnicas adicionales ni detalles sobre el proceso de entrenamiento más allá del algoritmo y el backend.

## Capacidades

- No se han documentado capacidades específicas del adaptador en la model card.
- Hereda las capacidades de generación de texto e instrucciones del modelo base SmolLM2-360M-Instruct, aunque sin validación experimental.
- El nombre "custom-tool" sugiere un entrenamiento orientado al uso de herramientas personalizadas, pero no hay evidencia documentada.
- El entrenamiento con GRPO indica una optimización para tareas de razonamiento y agentes, pero no se han publicado resultados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (sin datos).
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

No se dispone de información suficiente para identificar casos de uso concretos del adaptador. Los siguientes son casos de uso potenciales del modelo base SmolLM2-360M-Instruct, no del adaptador específico:

- Experimentación con agentes conversacionales en entornos de investigación: el adaptador puede cargarse sobre SmolLM2-360M-Instruct para probar flujos agénticos con herramientas personalizadas. Al ser un testrun, sirve para validar pipelines de entrenamiento con GRPO.
- Formación y docencia en RLHF/GRPO: al ser un modelo pequeño y ligero, es adecuado para enseñar técnicas de optimización de políticas en cursos o talleres.
- Prototipado de asistentes de código en entornos con recursos limitados: SmolLM2-360M-Instruct puede generar código básico, y el adaptador podría ajustar el comportamiento, aunque no hay datos que lo confirmen.
- Bots de soporte en dispositivos edge: el modelo base es lo suficientemente ligero para ejecutarse en CPU o GPU de bajo consumo, lo que permite desplegarlo en entornos embebidos.
- Evaluación de herramientas de agentes (AgentTune): el modelo sirve como caso de uso de la plataforma AgentTune para demostrar el entrenamiento de adaptadores con GRPO.
- Investigación en sistemas de recomendación de herramientas: el adaptador podría usarse para estudiar cómo un modelo pequeño selecciona herramientas en flujos de trabajo agénticos, aunque no hay resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el modelo base en FP16 (360M × 2 bytes = 720 MB) más el adaptador LoRA, cuyo tamaño no se especifica pero suele ser de decenas de MB. Total estimado: menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (RTX 3050, GTX 1660, etc.). También es ejecutable en CPU.
- Opciones de despliegue: PEFT/transformers (carga del adaptador), llama.cpp si se fusiona el adaptador con el modelo base, Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ram-lexsi/agenttune-testrun-custom-tool | No disponible (adaptador sobre 360M) | No disponible | No disponible | HuggingFace |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 2048 (según documentación oficial del modelo base) | Apache 2.0 | HuggingFace |
| ram-lexsi/agenttune-testrun-rl-eval | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Es un testrun (prueba) con 0 descargas y 0 likes, lo que indica que no está validado ni en producción.
- No se especifica licencia, por lo que el uso comercial es incierto.
- No hay información sobre sesgos, alucinaciones o rendimiento.
- Al ser un adaptador LoRA, requiere el modelo base para funcionar; no es autónomo.
- El modelo base es pequeño (360M), lo que limita su capacidad de razonamiento complejo y aumenta el riesgo de alucinación.
- No se han publicado benchmarks ni evaluaciones.

## Enlaces

- HuggingFace: https://huggingface.co/ram-lexsi/agenttune-testrun-custom-tool
- GitHub de AgentTune: https://github.com/Lexsi-Labs/AgentTune_mirror
- Discord de Lexsi: https://discord.com/invite/dtEDQ2Z3eg
- Repositorio relacionado: https://huggingface.co/ram-lexsi/agenttune-testrun-rl-eval
- Dataset relacionado: https://huggingface.co/datasets/ram-lexsi/agenttune-testrun-lm-eval
