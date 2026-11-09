# DavidAU/L3-Jamet-8B-MK.V-Blackroot-12.2B-V1-INSTRUCT-ULTRA-F32-GGUF

## Resumen

L3-Jamet-8B-MK.V-Blackroot-12.2B-V1-INSTRUCT-ULTRA-F32 es un modelo de generación de texto en inglés especializado en escritura creativa, ficción y roleplay, publicado por el usuario DavidAU en Hugging Face. Se trata de un merge (fusión) realizado con MergeKit que combina el fine-tune L3-Jamet-8B-MK.V-Blackroot (8B, basado en Llama 3) con Llama 3 Instruct (8B), dando como resultado un modelo de aproximadamente 12.174 millones de parámetros (12,2B).

El objetivo declarado del autor es conservar el carácter creativo y la prosa distintiva del fine-tune original mientras se incorpora parte de la "potencia" instructiva de Llama 3 Instruct, mejorando el seguimiento de instrucciones y algo de razonamiento lógico. El modelo está pensado para narración de historias, generación de tramas y subtramas, continuación de escenas y roleplay, con una prosa que introduce "preámbulos" y presagios de los acontecimientos antes de que ocurran.

La versión publicada es un GGUF en cuantización F32 (de ahí el sufijo "F32"), lo que explica el tamaño del repositorio (83,9 GB). La arquitectura subyacente es un transformer denso tipo Llama 3, con contexto nativo de 8192 tokens extensible hasta 32K mediante ajustes de RoPE. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Llama 3 (merge con MergeKit) |
| Parametros totales | 12.174.389.248 (12,2B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens nativo; extensible a 32K mediante RoPE |
| Tipos de cuantizacion | GGUF en F32 (versión publicada); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el recuento de parámetros) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge tipo "pass-through" realizado con MergeKit entre L3-Jamet-8B-MK.V-Blackroot (un fine-tune de 8B sobre Llama 3) y Llama 3 Instruct (8B). Según la model card, a Llama 3 Instruct se le aplicó un ligero "afeitado" (shave) en determinadas capas antes de la fusión, con el fin de preservar el carácter creativo del fine-tune original e incorporar parte de la capacidad instructiva. El resultado es un modelo denso de 12,2B parámetros, no un MoE: la cifra de parámetros supera los 8B de cada componente por la forma en que MergeKit combina los tensores.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que el autor no documenta esos detalles. La innovación destacable no es arquitectónica sino de estilo de prosa: el modelo tiende a introducir preámbulos y presagios de los eventos antes de narrarlos, en lugar de entrar de forma inmediata en la acción, y según el autor elimina la mayoría de "tells" (por ejemplo, "se quedó helado de horror") en favor de descripciones más detalladas de las emociones. La versión F32 se describe como más creativa que la F16 (no publicada).

## Capacidades

- Generación de texto narrativo en inglés: ficción, historias, tramas y subtramas.
- Continuación de escenas y escritura creativa por capítulos.
- Roleplay y diálogo de personajes, incluyendo contenido con lenguaje soez (tag "swearing").
- Estilo de prosa con preámbulos y presagios previos a los eventos.
- Seguimiento de instrucciones mejorado respecto al fine-tune de 8B original (objetivo declarado del merge).
- Cierta mejora en lógica y resolución de problemas frente a L3-Jamet-8B-MK.V-Blackroot 8B.
- Compatible con la plantilla Llama 3 y con la plantilla Command-R (esta última produce una prosa radicalmente distinta según el autor).
- Soporte de prompt de sistema de "mejora" opcional orientado a estructura narrativa y diálogo.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente multi-paso: no disponible (no documentado).
- Visión, audio o modo "thinking": no disponible (no documentado).
- Multilingüe: no; solo inglés según la model card.

## Casos de uso

- Escritura de ficción y relatos cortos: el modelo está afinado para generar prosa narrativa con estructura de escena, diálogo y descripción sensorial; su tendencia a presagiar eventos encaja en relatos con foreshadowing.
- Generación de tramas y subtramas: útil para hacer brainstorming de arcos argumentales y giros, dado el entrenamiento orientado a plot y sub-plot generation.
- Continuación de escenas en un manuscrito: con 8192 tokens de contexto (ampliables a 32K con RoPE) puede mantener el hilo de una escena larga y continuar desde un fragmento previo.
- Roleplay y personajes conversacionales: soporta diálogo multi-turno con personajes, incluyendo tono soez o de terror si el prompt lo indica.
- Escritura de terror y horror: el tag "horror" y el estilo descriptivo del modelo lo hacen adecuado para atmósferas y descripciones de tensión.
- Asistente de escritura en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo con llama.cpp u Ollama sin depender de la nube, útil para autores que quieren privacidad sobre sus manuscritos.
- Prototipado de narrativa interactiva: integrable en motores de historias ramificadas o juegos de texto que requieran generación de escenas bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión F32 publicada ocupa aproximadamente 83,9 GB de repositorio; en F32 los pesos rondan los 48,7 GB (12,2B × 4 bytes), por lo que requiere GPU de 80 GB (A100/H100) o ejecución en CPU con RAM abundante. En cuantizaciones menores (Q8, Q4_K_M) el peso baja aproximadamente a 13 GB y 7-8 GB respectivamente, aunque esas variantes no están publicadas en este repositorio.
- GPU recomendadas: A100 80 GB o H100 80 GB para F32; para cuantizaciones de 8 bits o 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes.
- ¿Cabe en GPU de consumo? En F32 no; en Q4_K_M sí cabría en GPUs de 8-12 GB, pero esas cuantizaciones no están disponibles en este repo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (el autor cita ajustes de LM Studio), y servidores compatibles con GGUF; vLLM y TGI no están documentados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3-Jamet-8B-MK.V-Blackroot-12.2B-V1 (este) | 12,2B | 8K (32K con RoPE) | Ficción, roleplay, merge Llama 3 | Apache 2.0 | GGUF F32 en HF |
| L3-Jamet-8B-MK.V-Blackroot (base del merge) | 8B | 8K | Ficción y roleplay | no disponible | HF |
| Llama 3 8B Instruct | 8B | 8K | Instrucciones generales | Llama 3 Community License | safetensors y GGUF |
| Modelos de escritura creativa de 12-13B de la misma época | ~12-13B | variable | Ficción y roleplay | variable | variable |

La comparación con alternativas concretas de la misma categoría (por ejemplo, otros merges de escritura creativa de 12-13B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no es multilingüe.
- Riesgo de alucinación y de deriva narrativa propio de un modelo de ficción; no debe usarse como fuente de hechos.
- El modelo está orientado a contenido creativo con lenguaje soez y terror; puede generar contenido sensible si no se filtra.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Llama 3, cuyos términos de la Llama 3 Community License pueden aplicar a los componentes subyacentes; conviene revisarlos antes de un despliegue comercial.
- El contexto nativo es de 8192 tokens; la extensión a 32K vía RoPE puede degradar la coherencia en textos muy largos.
- La versión publicada es F32 y ocupa 83,9 GB, lo que limita su despliegue a hardware de gama alta o a ejecución en CPU.
- No hay datos de benchmarks ni evaluación independiente publicados; el rendimiento descrito procede de la model card del autor.
- El autor recomienda un repetition penalty de 1.1 y temperaturas de 0 a 0.8; fuera de ese rango la calidad puede degradarse.
- Es un merge experimental ("V1") con 770 descargas y 8 likes en el momento de la consulta; no hay garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/L3-Jamet-8B-MK.V-Blackroot-12.2B-V1-INSTRUCT-ULTRA-F32-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support
- Guía de RoPE y ajustes citada por el autor: https://huggingface.co/DavidAU/TieFighter-Holodeck-Holomax-Mythomax-F1-V1-COMPOS-20B-gguf
- MergeKit (herramienta de merge): https://github.com/arcee-ai/mergekit
- Llama 3 (modelo base): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
