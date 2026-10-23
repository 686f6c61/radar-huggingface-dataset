# eousphoros/persona_lambda_27b_v8

## Resumen

persona_lambda_27b_v8 es un fine-tune experimental de tipo *distillation fine-tune* sobre Qwen3.8-27B, publicado por el usuario eousphoros en Hugging Face. Su particularidad es que está entrenado para adoptar personas definidas mediante *system prompt*: se le describe un personaje y el modelo lo mantiene a lo largo de la conversación. El autor lo etiqueta explícitamente como un hobby fine-tune, no como un asistente ajustado para seguridad ni listo para producción.

El modelo conserva intacta la arquitectura del base: un transformer híbrido de 27.781.427.952 parámetros totales (27,78B) que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), más un codificador de visión y una cabeza MTP (multi-token prediction). Solo se entrenó el modelo de lenguaje; el codificador de visión y la cabeza MTP son los originales de Qwen3.8-27B.

Es relevante ahora porque demuestra el patrón de reutilización de un base potente para *persona steering* con coste mínimo: el tokenizador, la plantilla de chat, la configuración y los valores de generación son idénticos a los del base, de modo que cualquier infraestructura que sirva Qwen3.8-27B sirve este modelo sin cambios. La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks propios y el aviso de seguridad del autor obligan a evaluarlo antes de cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal con codificador de vision: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 64 capas |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ no disponibles); el repositorio solo contiene safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 55,6 GB |

Otros datos tecnicos del base: dimension oculta 5120, 64 capas, FFN con dimension intermedia 17.408, embeddings y salida de 248.320 tokens (con padding). En Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimension de cabeza 128. En Gated Attention: 24 cabezas para Q y 4 para KV, dimension de cabeza 256, dimension de RoPE 64.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin modificar: un modelo de lenguaje causal denso con un diseño híbrido que intercala bloques de atención lineal (Gated DeltaNet) y bloques de atención clásica con compuertas (Gated Attention), en una proporción de tres bloques lineales por cada bloque de atención completa. Incorpora una cabeza MTP (multi-token prediction) entrenada con varios pasos, lo que habilita decodificación especulativa y mejora el throughput. El modelo es nativamente visión-lenguaje: incluye un codificador de visión que procesa imágenes y vídeos (desde diagramas STEM y documentos hasta vídeos de una hora de duración, según el autor del base).

Sobre el entrenamiento del fine-tune la información disponible es escasa: el autor lo describe como un *distillation fine-tune* en el que solo se entrenó el modelo de lenguaje, manteniendo sin cambios el codificador de visión y la cabeza MTP. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. El base sí pasó por pre-entrenamiento y post-entrenamiento, e incluye control flexible de razonamiento: modo *thinking* activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del base Qwen3.8-27B.
- Adopción de personas definidas por *system prompt*, que es el objetivo declarado del fine-tune.
- Comprensión de imagen y texto de forma nativa (pipeline `image-text-to-text`), incluyendo diagramas, documentos y vídeo según las capacidades del base.
- Modo de razonamiento (*thinking*) activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort`.
- Conservación del contexto de razonamiento entre mensajes mediante `preserve_thinking`.
- Capacidad de decodificación especulativa gracias a la cabeza MTP del base, que se mantiene intacta.
- Soporte de tool calling y ejecución de agentes: no documentado explícitamente para este fine-tune; el autor advierte que cualquier herramienta que se le proporcione debe ejecutarse en un entorno aislado (*sandbox*).
- Capacidades multilingües: no disponibles como dato; el autor no publica la lista de idiomas.
- Compatibilidad de servicio idéntica al base: misma plantilla de chat, tokenizador, configuración y valores de generación.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo recibe una descripción de persona en el *system prompt* y la mantiene en conversaciones multi-turno, lo que permite iterar guiones de personajes sin reentrenar nada.
- Investigación sobre *persona steering* y estabilidad de persona: sirve como banco de pruebas para medir cuánto deriva un modelo de su personaje asignado a lo largo de 262.144 tokens de contexto.
- Simulación de entrevistas y role-play para formación: se define un perfil concreto (por ejemplo, un candidato técnico o un cliente difícil) y el modelo sostiene el rol durante sesiones largas.
- Generación de diálogo para ficción y guiones: al conservar la persona entre turnos, resulta útil para redactar escenas con voces diferenciadas y contexto narrativo extenso.
- Evaluación comparativa de bases: al compartir tokenizador y plantilla con Qwen3.8-27B, permite A/B tests limpios entre el base y la variante con persona en la misma infraestructura de servicio.
- Asistente interno con tono de marca: en un despliegue controlado, se le puede asignar el registro y el vocabulario de una organización; requiere revisión humana por la advertencia de seguridad del autor.
- Análisis de documentos e imágenes con persona asociada: combinando la entrada visión-lenguaje heredada con un *system prompt* que fije el rol (por ejemplo, revisor técnico), se pueden procesar capturas, diagramas o páginas escaneadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del fine-tune en la informacion disponible. La model card incluye la tabla de resultados del modelo base Qwen3.8-27B, pero el contenido proporcionado está truncado y no permite extraer cifras concretas de MMLU, HumanEval, GSM8K ni de otras evaluaciones. El propio autor advierte que esos resultados describen al base, no a este fine-tune. No se deben extrapolar ni asumir.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 55,6 GB solo de pesos (el repositorio ocupa exactamente esa cifra), más caché KV; el tamaño de pesos es consistente con 16 bits por parámetro.
- VRAM estimada en 8 bits: aproximadamente 28 GB de pesos, más caché KV.
- VRAM estimada en 4 bits: aproximadamente 14-16 GB de pesos, más caché KV; requiere cuantización posterior por parte del usuario, ya que no hay artefactos cuantizados publicados.
- La caché KV a 262.144 tokens es el factor limitante real en contextos largos; para aprovechar la ventana completa hacen falta configuraciones multi-GPU o cuantización agresiva de la caché.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; 2 × A100 40 GB como alternativa; RTX 4090 (24 GB) solo con cuantización de 4-8 bits y contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/RTX 3090 con cuantización de 4 bits, y en GPUs de 24 GB o más; no en tarjetas de 8-12 GB con contexto largo.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y TokenSpeed, citados por la model card del base como compatibles. El soporte en llama.cpp u Ollama no está confirmado para esta arquitectura híbrida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos de rendimiento |
|---|---|---|---|---|---|
| persona_lambda_27b_v8 | 27,78B | 262.144 (hasta 1.000.000) | apache-2.0 | Fine-tune de persona sobre Qwen3.8-27B | No publicados |
| Qwen3.8-27B (base) | 27B | 262.144 (hasta 1.000.000) | no especificada en la informacion disponible | Modelo denso visión-lenguaje con thinking control | Tabla presente en la model card, cifras no disponibles en la informacion proporcionada |
| Qwen3.6-27B (generacion anterior) | no disponible | no disponible | no disponible | Generacion previa de la familia Qwen | Citado como referencia comparativa en la model card del base, sin cifras disponibles |

La comparación relevante es contra el propio base: este fine-tune no mejora las capacidades del modelo, las redistribuye hacia la adherencia a una persona. Frente a Qwen3.6-27B, la model card del base sitúa a Qwen3.8 como la generación más capaz de la familia, pero sin los números de la tabla no es posible cuantificar la diferencia.

## Limitaciones y advertencias

- El autor califica el modelo como experimental y *hobby fine-tune*: no ha pasado por un proceso de alineación de seguridad ni por ajuste para producción.
- Puede estar "confiadamente equivocado": el tono seguro que proporciona la persona no garantiza la veracidad de las respuestas; el riesgo de alucinación es el del base, sin mitigaciones adicionales.
- Defecto conocido de generación: en ocasiones una respuesta corta la línea antes de la respuesta final. El autor recomienda regenerar si la salida parece truncada. Cualquier pipeline de producción debe detectar y reintentar estos casos.
- La adherencia fuerte al *system prompt* implica un vector de ataque por inyección de prompt: un texto malicioso en la entrada puede redefinir el personaje.
- Cualquier herramienta o *tool* conectado al modelo debe ejecutarse en *sandbox*, según la advertencia explícita del autor.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas que maneje el base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad de evaluar el comportamiento del modelo, dado que no hay benchmarks propios ni evaluación de sesgos publicada.
- Sesgos conocidos: no documentados en la información disponible.
- No hay artefactos cuantizados oficiales, lo que obliga a cuantizar por cuenta propia si se busca desplegar en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eousphoros/persona_lambda_27b_v8
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Servicio gestionado del base (Qwen Cloud): https://www.qwencloud.com
- Ficha del servicio Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relacionados con este modelo.
