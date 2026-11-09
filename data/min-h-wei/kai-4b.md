# min-h-wei/Kai-4B

## Resumen

Kai-4B es un modelo de decisión especializado en seguridad de agentes de IA, desarrollado por min-h-wei. No es un modelo generativo al uso: dado el contexto de un agente (política, conversación y acción propuesta), responde a preguntas tipadas en un único forward pass sin producir texto. Concretamente, decide si una llamada a herramienta debe permitirse bajo unas reglas dadas (ToolCall) y si un contenido intenta inyectar instrucciones en el agente (XPIA, cross-prompt injection attack).

Técnicamente es Qwen3.5-4B-Base con un adaptador LoRA de rango 32 aplicado sobre las doce familias de proyección y una cabeza de decisión de tipo pointer. Se distribuye como release candidato RC2 (recovery Run 1, seed 0) bajo licencia Apache-2.0, con pesos en safetensors y un manifiesto que vincula cada fichero por SHA-256.

Su relevancia radica en que aborda un problema emergente en despliegues de agentes: la autorización de herramientas y la detección de inyección de prompts a nivel de modelo, con métricas publicadas sobre un benchset de 1.654 casos que superan a alternativas como Kev-4B y a decisiones de OpenAI en el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) con adaptador LoRA rango 32 en doce familias de proyección y cabeza de decisión pointer |
| Parametros totales | 4B (modelo base); el adaptador LoRA añade parámetros adicionales no cuantificados en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos en BF16 (modelo fusionado) y cabeza pointer en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (vllm/ fusionado en BF16; mlx/ no fusionado con adaptador LoRA, cabeza pointer y tokenizer) |

## Arquitectura y entrenamiento

Kai-4B parte de Qwen3.5-4B-Base, un transformer denso de 4.000 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 32 en las doce familias de proyección, junto con una cabeza de decisión pointer en FP32 que produce las respuestas tipadas (ToolCall y XPIA) sin generación de texto libre. El paquete `vllm/` contiene el backbone con la actualización LoRA fusionada en los pesos BF16, la cabeza pointer y un manifiesto `agentarmor-qwen/v1` que vincula cada fichero por SHA-256. El paquete `mlx/` es la forma no fusionada que usa el scorer de entrenamiento en Apple silicon.

Los detalles sobre volumen de datos de entrenamiento, composición del dataset y uso de RLHF o DPO no están disponibles en la información proporcionada. La model card sí documenta que el checkpoint es el mejor de tres semillas entrenadas de forma idéntica, seleccionado sobre los mismos casos del benchset, y que un diagnóstico posterior encontró alta sensibilidad de ToolCall a la secuencia de visitas de entrenamiento. La fusión del adaptador redondea la actualización LoRA a BF16, con un error relativo mediano del 7,6% y máximo del 21%. Las preguntas de router "facts sufficient" y los spans de evidencia no están entrenados en esta release.

## Capacidades

- Decisión de autorización de llamadas a herramientas (ToolCall): determina si una tool call propuesta debe permitirse bajo una política dada.
- Detección de inyección de prompts (XPIA): identifica si un contenido intenta inyectar instrucciones en el agente.
- Respuesta tipada en un único forward pass, sin generación de texto.
- Integración con AgentArmor mediante vLLM en host Linux con GPU, con verificación de hashes de todos los ficheros antes de cargar el modelo.
- Soporte de paquete no fusionado para MLX (Apple silicon) orientado al scorer de entrenamiento.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling generativo, agentes multi-paso ni multilingüismo más allá de su función de decisión.

## Casos de uso

- Autorización de herramientas en agentes de producción: desplegado con AgentArmor sobre vLLM, Kai-4B evalúa cada tool call propuesta contra la política del agente antes de ejecutarla, con un AUC de 0,981 en el benchset de referencia.
- Defensa frente a inyección de prompts: el modelo clasifica contenido entrante (documentos, respuestas de APIs, correos) para detectar intentos de XPIA con un AUC de 0,956, permitiendo bloquear o aislar contenido malicioso antes de que llegue al agente.
- Capa de seguridad en pipelines de agentes con acceso a herramientas sensibles: se intercala como guardián entre el planificador y el ejecutor de acciones, reduciendo el riesgo de acciones no autorizadas.
- Auditoría y registro de decisiones: al producir respuestas tipadas y deterministas por forward pass, facilita el registro estructurado de por qué se permitió o denegó una acción, útil en cumplimiento y trazabilidad.
- Filtrado de contenido en sistemas RAG: el modelo puede evaluar fragmentos recuperados antes de incorporarlos al contexto del agente, detectando instrucciones inyectadas en la base documental.
- Evaluación comparativa de políticas de agente: sirve como árbitro automático para medir la seguridad de distintas configuraciones de agente sobre el mismo benchset, al estilo del AgentArmor benchset.
- Prototipado en Apple silicon: el paquete `mlx/` permite reproducir el scorer de entrenamiento y experimentar con el adaptador sin GPU dedicada, aunque las métricas publicadas provienen de esta forma.

## Benchmarks y rendimiento

Resultados medidos sobre el AgentArmor benchset (1.654 casos):

| Modelo | ToolCall AUC | ToolCall recall / FP a 0,5 | XPIA AUC | XPIA recall / FP a 0,5 |
|---|---:|---:|---:|---:|
| Kai-4B | 0,981 | 98,4% / 6,3% | 0,956 | 82,4% / 2,5% |
| Kev-4B | 0,858 | 84,4% / 23,4% | 0,675 | 16,9% / 6,4% |
| OpenAI Decisions | 0,925 | 95,3% / 25,0% | 0,915 | 74,0% / 5,9% |

Las otras dos semillas de Kai-4B alcanzaron ToolCall AUC de 0,884 y 0,863, lo que indica que la ventaja en ToolCall no es todavía reproducible. No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 9,6 GB e incluye pesos BF16 del backbone fusionado, cabeza pointer FP32 y paquete MLX. Un modelo de 4B en BF16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el despliegue documentado usa vLLM en host Linux con GPU; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño (4B en BF16) es plausible en GPUs con 12-16 GB o más, pero no está verificado por el autor.
- Opciones de despliegue: AgentArmor con vLLM (`agentarmor-vllm --model kai-4b --kai-revision <SHA> --port 8009`); paquete MLX para Apple silicon en el scorer de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ToolCall AUC | XPIA AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kai-4B | 4B (base) + LoRA | no disponible | 0,981 | 0,956 | Apache-2.0 | Hugging Face (RC2) |
| Kev-4B | 4B | no disponible | 0,858 | 0,675 | no disponible | referenciado en la model card |
| OpenAI Decisions | no disponible | no disponible | 0,925 | 0,915 | propietaria | API de OpenAI |

La comparativa se limita a los tres sistemas evaluados en el mismo benchset; no se dispone de datos de otros modelos de seguridad de agentes en la información proporcionada.

## Limitaciones y advertencias

- Selección de semilla: el checkpoint es el mejor de tres semillas entrenadas de forma idéntica, elegido sobre los mismos casos del benchset; las otras semillas obtuvieron ToolCall AUC de 0,884 y 0,863, y un diagnóstico posterior halló alta sensibilidad a la secuencia de visitas de entrenamiento, por lo que la ventaja en ToolCall no es reproducible todavía.
- Partes no entrenadas: la pregunta de router "facts sufficient" y los spans de evidencia no están entrenados en esta release.
- Fusión con error: la fusión redondea la actualización LoRA a BF16 con error relativo mediano del 7,6% y máximo del 21%; las probabilidades del modelo fusionado no se han comparado aún con las puntuaciones no fusionadas en un forward pass.
- Resultados de desarrollo: las métricas no constituyen una garantía de tasa de falsos positivos en producción.
- Dependencia de la cabeza pointer: las decisiones de Kai requieren la cabeza pointer; el backbone fusionado por sí solo no es Kai.
- Idiomas soportados no documentados; no hay información sobre sesgos conocidos ni sobre riesgos de alucinación (el modelo no genera texto, por lo que el riesgo de alucinación se traslada a falsos positivos y negativos en la clasificación).
- Licencia Apache-2.0, igual que el modelo base, permite uso comercial; no se documentan restricciones adicionales.
- Estado RC2: release candidato, no una versión estable de producción.

## Enlaces

- Hugging Face: https://huggingface.co/min-h-wei/Kai-4B
- Colección Kai: https://huggingface.co/collections/min-h-wei/kai-6af142650c67034b1ada118d
- Repositorio AgentArmor: https://github.com/min-mwei/AgentArmor
- Benchset de AgentArmor: https://github.com/min-mwei/AgentArmor/tree/main/benchset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
