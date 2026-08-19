# Gdatree/treemind-2.0

## Resumen

Treemind 2.0 es un modelo de chat en ruso desarrollado por Gdatree, construido sobre la base de HuggingFaceTB/SmolLM3-3B-Base. Se trata de un modelo de 3.075 millones de parámetros (3B) que ha sido afinado mediante LoRA en 4 bits durante 2000 pasos sobre diálogos en ruso, seguido de un merge limpio en fp16 sin artefactos de cuantización en la base. El proyecto se define explícitamente como "qwen-free", indicando que no depende de arquitecturas Qwen.

El modelo incorpora una plantilla de chat integrada con los tokens `<|user|>`, `<|bot|>` y `<|end|>`, lo que permite su uso inmediato en aplicaciones de conversación. Se distribuye tanto en formato safetensors como en cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y F16), lo que facilita su despliegue en entornos con recursos limitados. Su relevancia actual radica en ofrecer una alternativa ligera y de código abierto para el ecosistema de habla rusa, con licencia Apache-2.0 que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: SmolLM3-3B-Base) |
| Parametros totales | 3.075.098.624 (3,07B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM3-3B-Base) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (GGUF); fp16 (safetensors) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Treemind 2.0 se basa en la arquitectura Transformer de SmolLM3-3B-Base, un modelo denso de 3B parámetros desarrollado por HuggingFace. El proceso de entrenamiento consistió en un afinamiento con LoRA en 4 bits durante 2000 pasos sobre un dataset de diálogos en ruso, seguido de un merge en fp16. La model card indica que se trata de una "base-model afinada", no de un modelo instructivo, aunque la plantilla de chat integrada permite respuestas en formato conversacional.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La decisión de usar SmolLM3 como base, en lugar de modelos Qwen, se presenta como una ventaja de independencia tecnológica. El resultado es un modelo ligero con un chat template sencillo basado en tokens especiales, sin dependencias externas adicionales.

## Capacidades

- Generación de texto conversacional en ruso con plantilla de chat integrada.
- Mantenimiento de diálogos multi-turno usando los tokens `<|user|>`, `<|bot|>` y `<|end|>`.
- Inferencia eficiente en CPU y GPU gracias a las cuantizaciones GGUF.
- Compatible con herramientas de despliegue estándar como llama.cpp y LM Studio.
- Funciona como modelo base afinado, respondiendo en estilo conversacional.
- Soporte de carga mediante transformers y huggingface-hub.
- No incluye soporte para tool calling, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional en ruso para aplicaciones web o móviles: el modelo puede integrarse en chatbots de atención al cliente o asistentes personales, respondiendo preguntas frecuentes y manteniendo conversaciones naturales con la plantilla de chat incluida.
- Generación de contenido en ruso: redacción de borradores de correos, publicaciones en redes sociales o artículos breves, aprovechando la fluidez del modelo en este idioma.
- Entornos educativos de idiomas: práctica de conversación en ruso mediante un agente que responde en el idioma objetivo, con corrección implícita mediante respuestas naturales.
- Desarrollo de prototipos en local: gracias a los GGUF de pequeño tamaño (1,8-2,1 GB en Q4/Q5), puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Investigación académica sobre modelos multilingües: análisis comparativo del rendimiento de SmolLM3 afinado en ruso frente a otras arquitecturas de tamaño similar.
- Despliegue en producción de bajo coste: la licencia Apache-2.0 permite uso comercial sin royalties, y el tamaño de 3B permite servir inferencia en instancias de CPU o GPU pequeñas con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El autor advierte que, al ser un modelo de 3B, es débil en matemáticas precisas y razonamientos largos, pero no proporciona datos cuantitativos que respalden esta afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,8 GB (Q4_K_M) y 6,2 GB (F16) según la cuantización elegida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las versiones Q4/Q5; para F16 se recomienda al menos 8 GB.
- Compatible con CPU: las cuantizaciones GGUF permiten ejecución en CPU con 8-16 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, vLLM, TGI y transformers.
- Latencia y throughput estimados: no disponible, aunque en un modelo de 3B cuantizado a Q4 se esperan velocidades de 20-40 tokens/s en GPU consumer y 5-15 tokens/s en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| Treemind 2.0 | 3,07B | no disponible | Apache-2.0 | ruso | Basado en SmolLM3, GGUF disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache-2.0 | multilingue | Instrucción, fuerte en razonamiento |
| SmolLM3-3B-Base | 3,07B | no disponible | Apache-2.0 | multilingue | Base sin chat, origen de Treemind |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 | multilingue | Instrucción, amplio soporte comunitario |

La comparativa se basa en modelos de tamaño similar disponibles públicamente. Treemind 2.0 se diferencia por su especialización en ruso y su origen independiente de Qwen, pero carece del soporte multilingüe y las capacidades de instrucción de sus alternativas.

## Limitaciones y advertencias

- Modelo de 3B: rendimiento limitado en tareas de matemáticas precisas, razonamiento lógico complejo y generación de código.
- Entrenado únicamente en ruso: no es adecuado para conversación en otros idiomas sin riesgo de respuestas incoherentes.
- Base model afinado, no instructivo: puede producir respuestas menos estructuradas que un modelo entrenado específicamente para seguir instrucciones.
- Sin benchmarks publicados: no hay datos objetivos sobre su rendimiento en tareas estándar.
- Longitud de contexto no documentada: se desconoce el límite efectivo de tokens de entrada.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Sin soporte para tool calling ni funciones de agente: limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gdatree/treemind-2.0
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio treemind (librería de interpretación de modelos de árbol, no relacionada con este modelo): https://github.com/sametcopur/treemind
