# costruisci-la-tua-ai/aurora-gemma4-e4b-it

## Resumen

Aurora-gemma4-e4b-it es un ajuste fino por LoRA del modelo multimodal google/gemma-4-E4B-it, desarrollado por el colectivo costruisci-la-tua-ai como material didáctico del libro *Costruisci la tua AI*. El modelo actúa como asistente virtual de la Pasticceria Aurora, un negocio ficticio creado como ejemplo, y responde en italiano a preguntas sobre horarios, precios, encargos y conservación de productos de repostería. No es un modelo de propósito general: es una demostración de cómo especializar un modelo base mediante un conjunto de datos pequeño y controlado.

Técnicamente se trata de un transformer multimodal (image-text-to-text) de 7.941.100.874 parámetros totales según los pesos en safetensors, con el adaptador LoRA fusionado en el modelo final. El repositorio ocupa 15,9 GB y se distribuye bajo licencia Apache 2.0 heredada del modelo base. El ajuste se realizó sobre 325 conversaciones generadas sintéticamente a partir de una ficha de hechos inventada, revisadas automáticamente y después a mano.

Su relevancia es fundamentalmente educativa: muestra el flujo completo de fine-tuning con LoRA, empaquetado en safetensors y publicación de una versión GGUF para llama.cpp, con una evaluación interna de 30 preguntas que sirve para comparar el modelo ajustado frente al base. No está pensado para uso comercial real sin un nuevo entrenamiento sobre datos del dominio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de google/gemma-4-E4B-it |
| Parámetros totales | 7.941.100.874 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (versión publicada como repo separado); el modelo base admite cuantizaciones estándar de llama.cpp |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q4_K_M en repo derivado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer multimodal de la familia Gemma 4 con capacidad de procesar imagen y texto como entrada. Sobre esa base se aplicó un ajuste fino con LoRA cuyo adaptador se fusionó posteriormente en los pesos finales, de modo que el artefacto publicado es un modelo completo y no un adaptador separado. La model card no detalla la configuración de LoRA (rango, alpha, capas objetivo) ni la longitud de contexto efectiva durante el entrenamiento.

El conjunto de datos de ajuste consta de 325 conversaciones generadas con un modelo abierto a partir de una scheda de hechos inventada sobre la pastelería, filtradas con reglas automáticas y revisadas manualmente. No se menciona uso de RLHF ni DPO. El entrenamiento se realizó con un prompt de sistema fijo y sin fase de razonamiento: la model card indica explícitamente que hay que pasar tanto el prompt de sistema como `enable_thinking=False` para obtener las respuestas esperadas.

## Capacidades

- Generación de texto conversacional en italiano orientada a un dominio acotado (horarios, precios, encargos, conservación de dulces).
- Procesamiento de entrada multimodal imagen-texto heredado del modelo base (etiqueta image-text-to-text), aunque la model card no documenta casos de uso con imagen.
- Instrucciones mediante prompt de sistema: el comportamiento depende de que se inyecte el prompt de sistema de la pastelería.
- Modo sin razonamiento (`enable_thinking=False`), que es la configuración con la que fue entrenado.
- Gestión de conversaciones multi-turno mediante plantilla de chat de transformers.
- Despliegue compatible con llama.cpp a través de la versión GGUF Q4_K_M publicada.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Asistente de atención al cliente de una pastelería: el modelo responde sobre horarios, precios y encargos usando únicamente los hechos de su ficha, con instrucción explícita de derivar al personal cuando no sabe algo.
- Demostración didáctica de fine-tuning con LoRA: sirve como ejemplo reproducible del flujo completo (datos sintéticos, entrenamiento, fusión del adaptador, publicación en safetensors y GGUF) para lectores del libro.
- Base para prototipos de asistentes de dominio cerrado: el patrón de prompt de sistema más conjunto de hechos acotado se puede replicar para otros negocios ficticios o reales con nuevo entrenamiento.
- Evaluación comparativa de modelos pequeños: la tabla de 30 preguntas del autor permite contrastar el modelo ajustado frente a sus variantes base y frente a otras alternativas del mismo tamaño.
- Despliegue local de bajo coste: la versión GGUF Q4_K_M y la instrucción de `llama-server -hf` permiten ejecutarlo en entornos sin GPU dedicada de gran capacidad.
- Pruebas de integración con transformers: el snippet de la model card con `apply_chat_template` y `enable_thinking=False` sirve como referencia para pipelines de generación conversacional.
- Ejercicio de control de alucinaciones en dominios restringidos: el modelo está entrenado para admitir desconocimiento y remitir al personal, lo que lo convierte en un caso de estudio de comportamiento acotado.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación interna del autor con 30 preguntas sobre el dominio de la pastelería. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se han publicado resultados de esos benchmarks en la información disponible.

| Prueba | Preguntas correctas |
|---|---|
| aurora-g4e4b (este modelo) | 29/30 |
| aurora-q4b | 26/30 |
| aurora-q4b-qlora | 23/30 |
| aurora-q2b | 21/30 |
| base-g4e4b (modelo base sin ajuste) | 10/30 |
| base-q4b | 11/30 |
| base-q2b | 6/30 |
| gguf-q4-aurora-gemma4-e4b-it | 26/30 |
| gguf-q4-aurora-qwen3.5-4b-it | 26/30 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (aproximadamente 16 GB de pesos en bf16/fp16): en torno a 16-18 GB, más overhead de activaciones y caché KV.
- Cuantización Q4_K_M (versión GGUF): reducción aproximada a 4-5 GB, apta para GPU de consumo con 6-8 GB de VRAM.
- GPU recomendadas: A100 o H100 para inferencia en precisión completa y despliegues con concurrencia; RTX 4090 (24 GB) para precisión completa en una sola tarjeta; RTX 3060/4060 Ti (8-12 GB) para la versión Q4_K_M.
- Cabe en GPU de consumo: sí, especialmente en la variante GGUF Q4_K_M; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), llama.cpp/`llama-server` con la versión GGUF, y potencialmente vLLM u otras herramientas compatibles con arquitecturas Gemma, aunque no se documentan explícitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación interna (30 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aurora-gemma4-e4b-it | 7.941.100.874 | no disponible | 29/30 | Apache 2.0 | Hugging Face |
| aurora-q4b | no disponible | no disponible | 26/30 | no disponible | Hugging Face (mismo autor) |
| aurora-q2b | no disponible | no disponible | 21/30 | no disponible | Hugging Face (mismo autor) |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | 10/30 | Apache 2.0 | Hugging Face |
| gguf-q4-aurora-qwen3.5-4b-it | no disponible | no disponible | 26/30 | no disponible | Hugging Face (mismo autor) |

La comparación con modelos de propósito general de tamaño similar no está disponible en la información proporcionada; los datos solo permiten contrastar variantes del propio autor y el modelo base.

## Limitaciones y advertencias

- El modelo solo conoce la pastelería inventada: no debe usarse para negocios reales sin un nuevo entrenamiento sobre datos del dominio objetivo.
- Puede equivocarse; en alergias e intolerancias remite al personal y no constituye consejo médico.
- Al ser un modelo pequeño, en preguntas alejadas de su tarea responde peor que el modelo base, según reconoce el autor.
- Requiere inyectar el prompt de sistema exacto y desactivar el razonamiento (`enable_thinking=False`) para obtener el comportamiento esperado; sin esas condiciones la calidad de las respuestas no está garantizada.
- Idioma limitado al italiano; no se documenta comportamiento en castellano ni en otros idiomas.
- No se documentan sesgos específicos, pero al derivar de un modelo base multilingüe y entrenarse con datos sintéticos generados por otro modelo abierto, puede heredar sesgos de ambas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero el contenido del dominio es ficticio y el modelo no está validado para producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/costruisci-la-tua-ai/aurora-gemma4-e4b-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Versión GGUF: repositorio `costruisci-la-tua-ai/aurora-gemma4-e4b-it-GGUF` (referenciado en la model card, URL directa no disponible)
