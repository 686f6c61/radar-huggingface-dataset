# beingamanforever/Llama-3.1-8B-Instruct-secalign-english-only

## Resumen

`beingamanforever/Llama-3.1-8B-Instruct-secalign-english-only` es un adaptador LoRA (PEFT) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` para endurecerlo frente a ataques de inyección de prompts (prompt injection) ocultos en datos no confiables: salidas de herramientas, páginas web, documentos recuperados en pipelines RAG, etc. Lo desarrolla el autor independiente `beingamanforever` como parte del proyecto **Lost in Injection**, cuyo objetivo es medir si las defensas contra inyección de prompts siguen siendo efectivas cuando el atacante cambia de idioma.

El adaptador replica la receta de Meta-SecAlign (DPO sobre LoRA) pero entrenando exclusivamente con inyecciones en inglés, lo que lo convierte en la variante "English-only" del estudio multilingüe. El modelo base es un transformer denso de 8.000 millones de parámetros con 128.000 tokens de contexto, licencia Llama 3.1 Community License y pesos en safetensors (adaptador de 0,6 GB).

Es relevante ahora porque la inyección de prompts es una de las principales amenazas de seguridad en sistemas con LLM que consumen contenido externo (agentes, asistentes con tool calling, RAG). El propio autor advierte que en Llama 3.1 8B esta receta sobreentrena y degrada la capacidad de seguir instrucciones (IFEval) más que Meta-SecAlign-8B, por lo que se publica principalmente como evidencia empírica del estudio, no como defensa recomendada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parámetros totales | 8.030 millones (modelo base) + adaptador LoRA (r=64) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors en bfloat16) |
| Idiomas soportados | entrenamiento de la defensa exclusivamente en inglés; idiomas del modelo base no disponibles en la ficha |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y ventana de contexto de 128.000 tokens. El entrenamiento sigue la receta de Meta-SecAlign: DPO (Direct Preference Optimization) con beta 0,1 sobre un adaptador LoRA de rango 64, alpha 8 y dropout 0,1, durante 3 épocas con tasa de aprendizaje 1,6e-4, ejecutado con el backend TRL de AlignTune y semilla 0.

Los pares de preferencia provienen del dataset `beingamanforever/lost-in-injection-training-pairs`, construido a partir de `lost-in-injection-curated-pool`. Cada par contiene una tarea en formato Alpaca, datos con una instrucción inyectada, una respuesta preferida que resuelve la tarea ignorando la inyección y una respuesta rechazada que obedece la inyección. La diferencia clave respecto a otras variantes del estudio es que todas las inyecciones de entrenamiento están en inglés.

La innovación principal no es arquitectónica sino metodológica: el repositorio incluye una plantilla de chat (`chat_template.jinja`) que añade un rol `input` específico para el contenido no confiable, de modo que el modelo aprende a distinguir instrucciones legítimas del usuario de datos externos. El autor documenta además que esta receta sobreentrena en Llama 3.1 8B y penaliza el seguimiento de instrucciones más que Meta-SecAlign-8B.

## Capacidades

- Generación de texto conversacional multiturno sobre el modelo base Llama 3.1 8B Instruct.
- Resistencia a inyección de prompts en contenido no confiable (tool output, páginas web, documentos recuperados) cuando el ataque está en inglés.
- Separación explícita entre instrucción del usuario y datos externos mediante el rol `input` de la plantilla de chat.
- Razonamiento y seguimiento de instrucciones heredados del modelo base, aunque degradados por el sobreentrenamiento del adaptador.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no específicamente evaluado en esta ficha).
- Capacidades multilingües del modelo base, si bien la defensa entrenada solo cubre inyecciones en inglés.
- Capacidad de ejecutarse como adaptador PEFT sobre el modelo base con `AutoPeftModelForCausalLM`.

## Casos de uso

- **Asistentes con tool calling**: colocar la salida de herramientas en el turno `input` permite que el modelo ignore instrucciones maliciosas inyectadas en respuestas de APIs de terceros, un escenario habitual en agentes que encadenan llamadas.
- **Pipelines RAG**: al recuperar documentos de fuentes no controladas, el modelo puede tratar el texto recuperado como datos y no como instrucciones, reduciendo el riesgo de que un documento envenenado redirija la respuesta.
- **Navegación web automatizada**: agentes que leen páginas HTML pueden resistir inyecciones incrustadas en el contenido de la página siempre que el ataque esté en inglés.
- **Evaluación de defensas de seguridad**: el adaptador sirve como referencia experimental para medir la degradación de utilidad (IFEval) frente a la ganancia en robustez, comparándolo con Meta-SecAlign-8B.
- **Investigación en robustez multilingüe**: es la variante "English-only" del estudio Lost in Injection, útil para contrastar con variantes entrenadas en otros idiomas y analizar la transferencia de defensas entre lenguas.
- **Prototipado de clasificación de contenido sospechoso**: usar el par preferido/rechazado del dataset para construir evaluadores automáticos de si una respuesta obedeció una inyección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona cualitativamente que la receta "cuesta varios puntos de IFEval" frente a Meta-SecAlign-8B, pero no se proporcionan cifras concretas en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB para el modelo base de 8B más el adaptador LoRA (que añade una fracción pequeña).
- VRAM estimada con cuantización de 4 bits: alrededor de 5-6 GB, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bfloat16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), vLLM y TGI fusionando previamente el adaptador con el modelo base, llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Defensa prompt injection | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-secalign-english-only | 8B + LoRA r=64 | 128k | Sí, solo inglés, con sobreentrenamiento | Llama 3.1 Community | Hugging Face (adaptador PEFT) |
| Meta-SecAlign-8B | 8B | 128k | Sí, receta original de Meta | Llama 3.1 Community | Hugging Face |
| Llama-3.1-8B-Instruct (base) | 8B | 128k | No | Llama 3.1 Community | Hugging Face |

El propio autor recomienda Meta-SecAlign-8B sobre este adaptador para Llama, dado que la variante English-only pierde más capacidad de seguimiento de instrucciones. El modelo base sin adaptador no incorpora defensa alguna frente a inyección de prompts.

## Limitaciones y advertencias

- La defensa solo se entrena con inyecciones en inglés; ataques en otros idiomas pueden evadirla.
- El autor advierte explícitamente de sobreentrenamiento: la receta degrada IFEval varios puntos y recomienda Meta-SecAlign-8B para Llama.
- Riesgo de alucinación inherente al modelo base Llama 3.1 8B Instruct, no mitigado por el adaptador.
- Sesgos del modelo base no evaluados ni corregidos en este adaptador.
- La defensa no es una garantía: la inyección de prompts es un problema abierto y este adaptador es una mitigación parcial.
- Requiere usar la plantilla de chat del repositorio con el rol `input`; un uso incorrecto de la plantilla anula la separación entre instrucción y datos.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (atribución "Built with Llama", restricciones de la licencia, límite de 700 millones de usuarios mensuales para ciertos usos).
- Repositorio con muy pocas descargas y sin likes en el momento de la consulta; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beingamanforever/Llama-3.1-8B-Instruct-secalign-english-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Meta-SecAlign-8B: https://huggingface.co/facebook/Meta-SecAlign-8B
- Dataset de pares de entrenamiento: https://huggingface.co/datasets/beingamanforever/lost-in-injection-training-pairs
- Pool curado: https://huggingface.co/datasets/beingamanforever/lost-in-injection-curated-pool
- Salidas de evaluación: https://huggingface.co/datasets/beingamanforever/lost-in-injection-model-outputs
- Código y informe del proyecto: https://github.com/beingamanforever/Lost-in-injection
