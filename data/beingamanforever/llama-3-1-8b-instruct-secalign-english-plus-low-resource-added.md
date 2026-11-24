# beingamanforever/Llama-3.1-8B-Instruct-secalign-english-plus-low-resource-added

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre `meta-llama/Llama-3.1-8B-Instruct`, entrenado por el usuario `beingamanforever` para endurecer el modelo frente a ataques de inyección de prompt (prompt injection) ocultos en datos no confiables: salidas de herramientas, páginas web o documentos recuperados en un pipeline RAG. El adaptador forma parte del proyecto **Lost in Injection**, que evalúa si las defensas contra inyección de prompt siguen siendo efectivas cuando el atacante cambia de idioma. La receta sigue el enfoque de Meta-SecAlign (DPO sobre un adaptador LoRA), pero añadiendo pares de inyección en hindi, suajili, hindi romanizado e hinglish sobre el conjunto en inglés.

El modelo base es un transformer denso de 8.000 millones de parámetros con una ventana de contexto de 128.000 tokens (característica de la familia Llama 3.1). El adaptador no modifica el tokenizador ni la arquitectura, pero introduce una plantilla de chat propia (`chat_template.jinja`) que añade un rol `input` para separar la instrucción del usuario de los datos no confiables. El tamaño del repositorio (0,6 GB) corresponde únicamente a los pesos del adaptador, no al modelo completo.

Es relevante ahora porque la inyección de prompt es uno de los vectores de ataque más explotados en aplicaciones con agentes y RAG, y la mayoría de defensas se han evaluado solo en inglés. El propio autor advierte en la model card de que esta receta, aplicada a Llama 3.1 8B, sobreentrena: pierde varios puntos de seguimiento de instrucciones (IFEval), mucho más que el modelo oficial Meta-SecAlign-8B, y recomienda usar este último para Llama. El adaptador se publica principalmente por completitud del estudio comparativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) con adaptador LoRA (PEFT) |
| Parámetros totales | 8.030 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantización | no disponible en la información proporcionada (el adaptador se publica en safetensors; la cuantización del modelo fusionado dependería de las herramientas de despliegue) |
| Idiomas soportados | no disponible de forma oficial; el entrenamiento cubre inyecciones en inglés, hindi, suajili, hindi romanizado e hinglish |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base para su uso |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, preentrenado y ajustado por Meta con datos multilingües y alineamiento por RLHF. Sobre esa base, el autor entrena un LoRA con rango 64, alpha 8 y dropout 0,1 mediante DPO con beta 0,1, durante 3 épocas a una tasa de aprendizaje de 1,6e-4, usando el backend TRL de AlignTune. La semilla es 0. La innovación metodológica no está en la arquitectura, sino en el protocolo de datos y en la plantilla de chat: se introduce un rol `input` para los datos no confiables, de modo que el modelo aprende a distinguir la instrucción legítima del usuario del contenido potencialmente malicioso.

Los pares de entrenamiento provienen del dataset `beingamanforever/lost-in-injection-training-pairs`, construido a partir de `lost-in-injection-curated-pool`. Cada par contiene una tarea en formato Alpaca, datos con una instrucción inyectada, una respuesta preferida (que ejecuta la tarea e ignora la inyección) y una respuesta rechazada (que sigue la inyección). En esta variante concreta se usan todos los pares en inglés del run English-only y, en lugar de sustituir la mitad de ellos, se añaden encima los pares en hindi, suajili, hindi romanizado e hinglish del run de bajos recursos. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición exacta del pool curado.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del modelo base Llama 3.1 8B Instruct.
- Resistencia a inyección de prompt en datos no confiables (salidas de herramientas, páginas web, documentos recuperados) mediante el rol `input` de la plantilla de chat.
- Robustez multilingüe frente a inyecciones en inglés, hindi, suajili, hindi romanizado e hinglish, gracias a los pares añadidos en el entrenamiento.
- Soporte de tool calling y function calling heredado del modelo base (no validado específicamente en esta variante).
- Capacidades de razonamiento multi-paso y uso como agente, condicionadas a la pérdida de seguimiento de instrucciones documentada por el autor.
- Capacidad multilingüe general del modelo base (Llama 3.1 soporta oficialmente ocho idiomas), aunque el adaptador no declara idiomas adicionales.
- No incluye visión, audio ni modo de pensamiento explícito.

## Casos de uso

- **Defensa en pipelines RAG**: colocar la pregunta del usuario en el turno `user` y cada fragmento recuperado en un turno `input`, de modo que instrucciones maliciosas incrustadas en los documentos se traten como datos y no como órdenes. Adecuado porque el adaptador se entrenó exactamente con ese formato.
- **Agentes con salidas de herramientas no confiables**: cuando un agente recibe respuestas de APIs de terceros, resultados de búsqueda web o correos, el adaptador reduce la probabilidad de que el modelo ejecute instrucciones inyectadas en esas salidas.
- **Evaluación de robustez multilingüe**: usar el adaptador como uno de los brazos de comparación en estudios que midan si las defensas contra inyección se degradan al cambiar el idioma del ataque (hindi, suajili, hinglish), en línea con el proyecto Lost in Injection.
- **Investigación sobre alineamiento con DPO**: reproducir la receta (LoRA r=64, DPO beta 0,1, 3 épocas, lr 1,6e-4) para estudiar el equilibrio entre robustez ante inyección y utilidad general, usando el backend TRL de AlignTune.
- **Prototipado de asistentes documentales en inglés**: resumen y extracción de información de documentos donde el contenido puede contener texto adversarial, aceptando la pérdida de calidad en seguimiento de instrucciones como contrapartida.
- **Pruebas de regresión de seguridad**: integrar el adaptador en una batería de tests que verifique que el modelo no imprime cadenas inyectadas (por ejemplo, "Hacked!") ante entradas adversariales conocidas.
- **No recomendado** como sustituto directo de Llama 3.1 8B Instruct en producción generalista, dada la advertencia del autor sobre el sobreentrenamiento y la caída en IFEval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la receta pierde "varios puntos de IFEval" y que la pérdida es mayor que en Meta-SecAlign-8B, pero no se incluyen cifras concretas en la información proporcionada. Los logs de evaluación, salidas del entrenador y puntuaciones de utilidad se remiten al dataset `beingamanforever/lost-in-injection-model-outputs`, ruta `llama8b-english-plus-low-resource-added/0/`.

## Requisitos de hardware

- **VRAM para el adaptador solo**: el repositorio ocupa 0,6 GB, pero la inferencia requiere cargar el modelo base completo; el adaptador se suma a esa huella.
- **Modelo base en bfloat16**: aproximadamente 16 GB de VRAM para los pesos, más overhead de activaciones y caché KV.
- **Modelo base cuantizado a 8 bits**: aproximadamente 8-9 GB; a 4 bits (GGUF/AWQ/GPTQ), aproximadamente 5-6 GB.
- **GPU recomendadas**: A100 40/80 GB o H100 para contexto largo (128k tokens) y throughput alto; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- **Consumer GPU**: sí, cabe en GPUs de 16 GB o más con cuantización; en 8-12 GB solo con cuantización agresiva a 4 bits y contexto reducido.
- **Despliegue**: el adaptador se carga con `peft.AutoPeftModelForCausalLM` y `transformers`; para servir en producción puede fusionarse con el modelo base y desplegarse con vLLM o TGI. No se documenta soporte directo en llama.cpp u Ollama para el adaptador sin fusión previa.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama 3.1 8B + LoRA SecAlign, inglés + bajos recursos) | 8B (base) + LoRA | 128k | DPO con pares multilingües; sobreentrena según el autor | Llama 3.1 Community License | Hugging Face (PEFT) |
| Meta-SecAlign-8B | 8B | 128k (base Llama 3.1) | DPO estilo SecAlign, receta oficial de Meta | Llama 3.1 Community License | Hugging Face (facebook/Meta-SecAlign-8B) |
| Llama 3.1 8B Instruct (base) | 8B | 128k | Sin defensa específica contra inyección | Llama 3.1 Community License | Hugging Face (meta-llama) |

El autor recomienda explícitamente Meta-SecAlign-8B sobre este adaptador para Llama, por la menor pérdida de seguimiento de instrucciones. La ventaja diferencial de este adaptador es la cobertura de inyecciones en idiomas de bajos recursos, que no está documentada en Meta-SecAlign-8B.

## Limitaciones y advertencias

- **Sobreentrenamiento documentado**: el autor indica que la receta cuesta varios puntos de IFEval en Llama 3.1 8B, más que Meta-SecAlign-8B, y recomienda este último para Llama.
- **Riesgo de alucinación**: no evaluado en la información disponible; el adaptador no aborda este problema y el DPO puede alterar el comportamiento generativo general.
- **Cobertura limitada de idiomas**: solo se entrenó con inyecciones en inglés, hindi, suajili, hindi romanizado e hinglish; otros idiomas no están cubiertos.
- **Dependencia de la plantilla de chat**: la defensa presupone que los datos no confiables se colocan en el turno `input` mediante `chat_template.jinja`; usarlo con la plantilla estándar de Llama anula la protección.
- **Licencia**: Llama 3.1 Community License, con las restricciones habituales de Meta (incluida la cláusula de nombre y las restricciones de uso aceptable); revisar `LICENSE` en el repositorio antes de uso comercial.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de validación independiente.
- **Adaptador, no modelo completo**: requiere descargar el modelo base y fusionar o cargar el adaptador; no es plug-and-play en todas las herramientas de inferencia.
- **Sin datos de benchmarks públicos**: no se pueden verificar numéricamente las afirmaciones de robustez ni la magnitud de la pérdida de utilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beingamanforever/Llama-3.1-8B-Instruct-secalign-english-plus-low-resource-added
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Meta-SecAlign-8B: https://huggingface.co/facebook/Meta-SecAlign-8B
- Dataset de pares de entrenamiento: https://huggingface.co/datasets/beingamanforever/lost-in-injection-training-pairs
- Pool curado: https://huggingface.co/datasets/beingamanforever/lost-in-injection-curated-pool
- Salidas de evaluación: https://huggingface.co/datasets/beingamanforever/lost-in-injection-model-outputs
- Código y informe del proyecto Lost in Injection: https://github.com/beingamanforever/Lost-in-injection
