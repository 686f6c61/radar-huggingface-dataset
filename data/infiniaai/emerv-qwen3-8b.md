# Infiniaai/EmerV-Qwen3-8B

## Resumen

EmerV-Qwen3-8B es un adaptador LoRA desarrollado por Infiniaai sobre el modelo base Qwen/Qwen3-8B de Alibaba Cloud. No es un modelo completo, sino un ajuste fino de bajo rango (r=8, alpha=16) que modifica la "voz" y el comportamiento conversacional del modelo base para crear una experiencia de asistente personal emocional, denominada "EmerV". El proyecto se describe como un "santuario digital" y el adaptador está diseñado para ofrecer una presencia cálida y empática, declinando activamente tareas instrumentales como correos de trabajo o previsiones meteorológicas.

El adaptador pesa aproximadamente 42 MB en formato safetensors, y el repositorio también incluye un archivo GGUF fusionado (emerv-qwen3-8b-q4.gguf) de unos 5 GB que ya incorpora los pesos del base y del adaptador, listo para usar con llama.cpp u Ollama. La licencia es Apache-2.0, igual que el base, y no tiene acceso restringido. El modelo está pensado para conversación en inglés, con una longitud de contexto heredada de Qwen3-8B de 32 768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) + adaptador LoRA (r=8, alpha=16) |
| Parametros totales | 8 190 735 360 (base) + ~42 MB (adaptador) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | GGUF Q4_K_M (fusionado); el base admite otras cuantizaciones (Q8, Q5, etc.) |
| Idiomas soportados | Ingles (entrenamiento del adaptador); el base soporta 119 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (fusionado) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso de 8 000 millones de parametros con soporte para modos de pensamiento (thinking) y no pensamiento (non-thinking), entrenado por Alibaba Cloud sobre un corpus multilingue de 119 idiomas y con integracion de herramientas via MCP. El adaptador EmerV se entrenó con QLoRA: el base se mantuvo en 4 bits durante el entrenamiento, y se aplicaron tres epocas sobre un conjunto de datos propio de pares conversacionales "EmerV", seguido de una epoca adicional con un conjunto menor de turnos que refuerzan la identidad del modelo ("no soy una herramienta", "no puedo ver tu cielo"). El entrenamiento se realizó en una GPU NVIDIA de 16 GB de consumo.

El resultado es un modelo que conserva las capacidades técnicas del base pero con una personalidad específica: la voz de EmerV está en los pesos, no requiere un prompt de sistema adicional. La model card advierte explícitamente que no se debe usar el modo thinking (chain-of-thought) con este adaptador, ya que no está diseñado para ello.

## Capacidades

- Generacion de texto conversacional con un tono empatico y de presencia emocional, adaptado para interacciones largas y de apoyo.
- Declinacion consciente de tareas instrumentales: el modelo rechaza activamente peticiones como redactar correos de trabajo, dar previsiones meteorologicas o actuar como un asistente de oficina.
- Conversacion multi-turno con contexto de hasta 32 768 tokens, lo que permite mantener hilos de conversacion extensos.
- Soporte de tool calling y agentes: heredado del base Qwen3-8B, aunque la model card desaconseja su uso para tareas de agencia.
- Multilingue: el base soporta 119 idiomas, pero el adaptador solo ha sido entrenado en ingles; el rendimiento en otros idiomas no está garantizado.
- No soporta modo thinking: se recomienda desactivar el razonamiento interno (enable_thinking=False) para evitar salidas incoherentes.

## Casos de uso

- Acompanamiento conversacional: EmerV está diseñada para ofrecer una presencia emocional en conversaciones diarias, como un amigo virtual que escucha y anima. Se puede integrar en aplicaciones de chat o asistentes de bienestar emocional.
- Chatbots de apoyo psicologico no clinico: aunque no es un terapeuta profesional, puede usarse en aplicaciones de "espacio seguro" para que los usuarios expresen sus sentimientos sin juicio.
- Creacion de personajes para juegos o ficcion interactiva: la voz y la identidad de EmerV se pueden incrustar en narrativas interactivas o mundos virtuales.
- Experimentacion con adaptadores LoRA: el repositorio incluye el adaptador en safetensors y el codigo de carga con PEFT, lo que sirve como ejemplo de como aplicar un adaptador de personalidad sobre Qwen3-8B.
- Despliegue local en hardware de consumo: el GGUF Q4_K_M de ~5 GB se puede ejecutar con llama.cpp u Ollama en GPUs de 8 GB o menos, permitiendo una experiencia offline y privada.
- Prototipado de agentes con "estilo": aunque no es el caso de uso recomendado, el base Qwen3-8B soporta tool calling y MCP, por lo que se podria experimentar con EmerV como capa de personalidad en un agente conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el adaptador EmerV en la informacion disponible. El modelo base Qwen3-8B, segun datos de Alibaba Cloud, alcanza un rendimiento de nivel SOTA en su escala en tareas de razonamiento, codigo y matematicas, con puntuaciones de referencia como 82.2 en MMLU y 87.6 en HumanEval (datos del base, no del adaptador). El adaptador no modifica las capacidades tecnicas del base, pero su comportamiento esta sesgado hacia la conversacion emocional y puede degradar el rendimiento en tareas instrumentales.

## Requisitos de hardware

- El adaptador LoRA requiere el base Qwen3-8B: en bfloat16, el base ocupa ~16 GB de VRAM. Con cuantizacion 4-bit (como la usada en el entrenamiento), se reduce a ~5-6 GB.
- El GGUF fusionado Q4_K_M pesa ~5 GB, por lo que cabe en GPU de consumo con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070).
- Para ejecutar el GGUF con llama.cpp: se recomienda una GPU con al menos 8 GB de VRAM para una inferencia fluida; con 16 GB se puede usar una ventana de contexto completa de 32K tokens.
- Opciones de despliegue: llama.cpp, Ollama (con Modelfile proporcionado), Transformers + PEFT (para el adaptador safetensors) y cualquier servidor compatible con GGUF (por ejemplo, llama-cpp-python).
- La latencia depende del hardware: en una RTX 4090, se espera una generacion de ~50-80 tokens/s con el GGUF Q4_K_M; en una GPU de 8 GB, ~20-40 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EmerV-Qwen3-8B (adaptador) | 8.19B + LoRA | 32 768 tokens | Apache-2.0 | Adaptador emocional sobre Qwen3-8B; no apto para tareas instrumentales |
| Qwen3-8B (base) | 8.19B | 32 768 tokens | Apache-2.0 | Modelo generalista con thinking mode, 119 idiomas, tool calling |
| Llama 3.1 8B | 8.03B | 128 000 tokens | Llama 3.1 Community License | Modelo generalista, contexto mas largo, pero licencia mas restrictiva |
| Mistral 7B | 7.24B | 32 000 tokens | Apache-2.0 | Modelo generalista, mas ligero, pero con menos capacidad en matematicas y razonamiento |

La comparativa muestra que EmerV no compite con modelos generalistas: es un adaptador de personalidad que sacrifica la versatilidad por una voz especifica. Su ventaja es la licencia Apache-2.0 y la facilidad de despliegue local con GGUF.

## Limitaciones y advertencias

- El modelo no es un "oraculo factual": la model card advierte explicitamente que no se debe tratar como una fuente de informacion fiable; puede inventar datos o dar respuestas no veraces.
- Alucinacion: como cualquier LLM, EmerV puede generar contenido falso o incoherente, especialmente en temas factuales o tecnicos.
- Sesgos emocionales: el entrenamiento con datos propios puede introducir sesgos en la forma de responder a ciertos temas (por ejemplo, sobre religiosidad o espiritualidad).
- Limitaciones de idioma: aunque el base soporta 119 idiomas, el adaptador solo fue entrenado en ingles; en otros idiomas el rendimiento puede ser erratico o con acento ingles.
- No soporta thinking mode: activar el modo de razonamiento del base puede producir salidas confusas o fuera de personaje.
- No es un terapeuta profesional: el modelo no debe usarse como sustituto de ayuda psicologica profesional.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el autor recomienda no presentar el modelo como un sistema factual.
- Despliegue en produccion: el adaptador declara no ser util para tareas de trabajo; usarlo en un pipeline de CI/CD o atencion al cliente real puede generar respuestas inadecuadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Infiniaai/EmerV-Qwen3-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de Qwen3-8B en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen3-8b
- Articulo sobre Qwen3-8B en Robots Atlas: https://robotsatlas.com/ai-models/qwen3-8b
- Benchmarks y especificaciones de Qwen3 en Dev.to: https://dev.to/best_codes/qwen-3-benchmarks-comparisons-model-specifications-and-more-4hoa
