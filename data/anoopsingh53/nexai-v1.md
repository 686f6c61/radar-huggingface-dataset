# Anoopsingh53/nexai-v1

## Resumen

NexAI-v1 es un modelo de lenguaje causal de 7.610 millones de parametros, desarrollado por Anoop Singh, que parte del modelo Qwen2.5-7B-Instruct de Alibaba y se ha afinado mediante QLoRA (SFT) con datos de instrucciones multi-turno. El resultado se distribuye en formato GGUF cuantizado a Q4_K_M, lo que lo hace ejecutable en CPU con requisitos muy reducidos de memoria, aproximadamente 4,46 GB de peso y un consumo de RAM por debajo de 8 GB.

El modelo esta orientado a tareas de asistencia local, recuperacion aumentada (RAG) y aplicaciones de asistente personal que requieren privacidad, ya que se puede ejecutar de forma local con llama.cpp o llama-cpp-python. Soporta ingles e hindi (incluido hinglish), y hereda del modelo base una ventana de contexto de 32.768 tokens, lo que permite procesar documentos largos y conversaciones extensas.

Su relevancia actual radica en la combinacion de un modelo base solido como Qwen2.5-7B-Instruct con una cuantizacion eficiente que facilita el despliegue en hardware de consumo, sin sacrificar la capacidad de seguir instrucciones complejas ni el soporte de herramientas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (Dense) - Transformer causal |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | no disponible (arquitectura densa) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (4,91 bits por peso) |
| Idiomas soportados | Ingles, hindi (incluye hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, una red causal de 28 capas con atencion por ventanas deslizantes y una dimension de 3584. Sobre esta base, el autor aplico un afinamiento por QLoRA (SFT) con los siguientes hiperparametros: optimizador AdamW de 8 bits, tasa de aprendizaje 2e-4, precision mixta de 16 y 4 bits, y un solo epoch sobre datos de instrucciones multi-turno especializados. Las capas objetivo del adaptador LoRA incluyen las proyecciones de atencion y las puertas del MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), con rango LoRA de 64 y alpha de 16.

El entrenamiento se realizo en Google Colab, lo que sugiere un volumen de datos moderado y un coste computacional reducido. No se menciona el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset, denominado "custom-nexai". No se indica el uso de RLHF ni DPO; el proceso se limita a supervisado (SFT).

## Capacidades

- Generacion de texto y seguimiento de instrucciones: responde a prompts de sistema, instrucciones complejas y plantillas de chat multi-turno.
- RAG optimizado: el modelo ha sido afinado para integrar contexto externo procedente de documentos, PDFs o scrapings web, manteniendo precision en la respuesta.
- Soporte de tool calling: no se menciona de forma explicita en la informacion proporcionada, aunque la base Qwen2.5-7B-Instruct incluye capacidades de function calling; el modelo no la documenta.
- Capacidades multilingues: ingles e hindi, con soporte nativo de hinglish (mezcla de hindi e ingles).
- Ejecucion en CPU: cuantizacion Q4_K_M que permite inferencia con menos de 8 GB de RAM del sistema.
- Integracion con llama.cpp y llama-cpp-python para uso programatico y CLI.
- Modo "stealth": la model card menciona prompts de sistema integrados para evitar deteccion de bots y superar filtros de seguridad estandar, aunque esto no se detalla en profundidad.

## Casos de uso

- Asistente personal local: se puede desplegar en un portatil o PC de consumo para responder preguntas y gestionar conversaciones multi-turno sin conexion a internet, gracias a su bajo consumo de RAM.
- RAG sobre documentos internos: integrar el modelo en un pipeline de recuperacion para responder preguntas sobre manuales, informes o bases de conocimiento corporativas, aprovechando la ventana de 32K tokens.
- Asistente de codigo en local: como base Qwen2.5-7B-Instruct incluye capacidades de generacion de codigo, el modelo puede usarse para autocompletar o explicar fragmentos de codigo en entornos sin conexion.
- Educacion y demostraciones: adecuado para ensenar conceptos de LLMs, RAG y cuantizacion en entornos academicos, por su facil despliegue en CPU y licencia permisiva.
- Atencion al cliente en ingles e hindi: puede gestionar consultas de usuarios en estos idiomas, incluyendo variantes coloquiales como hinglish, manteniendo el contexto de la conversacion.
- Prototipado rapido de aplicaciones de IA: gracias a la integracion con llama-cpp-python, se puede integrar en aplicaciones Python en pocas lineas de codigo para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas. Se recomienda realizar pruebas propias sobre los casos de uso objetivo antes de desplegar en produccion.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU la cuantizacion Q4_K_M ocuparia aproximadamente 4,5 GB de memoria de video.
- RAM del sistema: se indica que funciona dentro de 8 GB de RAM del sistema para inferencia en CPU.
- GPU recomendadas: no se especifican; al ser un modelo GGUF de 7B cuantizado, es compatible con GPUs de 8 GB de VRAM como la RTX 3060/4060, aunque el objetivo declarado es CPU.
- Opciones de despliegue: llama.cpp (CLI), llama-cpp-python (Python), y por extension cualquier framework que soporte GGUF como Ollama o LM Studio.
- Latencia y throughput: no se proporcionan datos concretos; dependera del hardware y del numero de threads. En una CPU moderna de 8 nucleos, se puede esperar un rendimiento de 5-15 tokens por segundo con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NexAI-v1 | 7,61B | 32K | Apache 2.0 | GGUF Q4_K_M | Fine-tuning de Qwen2.5-7B-Instruct, orientado a RAG |
| Qwen2.5-7B-Instruct | 7,61B | 32K | Apache 2.0 | Safetensors | Modelo base original, no cuantizado |
| Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 | Safetensors | Contexto mas largo, pero licencia de uso de Meta |

No hay comparativa directa con modelos de 7B cuantizados y afinados para RAG en la informacion disponible. La principal diferencia frente al modelo base es el afinamiento con QLoRA y la cuantizacion GGUF, que reduce el peso de 15 GB (fp16) a 4,46 GB, permitiendo ejecucion en CPU.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todos los LLMs, puede generar informacion inexacta o inventada; la card lo indica explicitamente.
- Sesgos: los resultados estan influenciados por los datos de preentrenamiento de Qwen2.5 y por las instrucciones de afinamiento; se recomienda filtrado adicional si se despliega en productos publicos.
- No apto para decisiones criticas: la card advierte que no debe usarse para consejos medicos, financieros o legales sin validacion humana.
- Idiomas limitados: solo ingles e hindi; no se garantiza calidad en otros idiomas.
- Datos de entrenamiento no documentados: no se conoce el numero de tokens ni la composicion del dataset, lo que limita la reproducibilidad.
- No se mencionan benchmarks: no hay evidencia publica de rendimiento comparativo.
- La card menciona "stealth y safety" para evitar deteccion de bots, lo que podria implicar riesgos eticos si se usa para suplantar identidad; se recomienda evaluar este aspecto antes de desplegar.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Anoopsingh53/nexai-v1
- Directorio de archivos: https://huggingface.co/Anoopsingh53/nexai-v1/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se encontraron papers, blogs ni repositorios adicionales del autor en la busqueda web.
