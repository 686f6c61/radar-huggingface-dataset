# RedHatAI/granite-4.2-3b

- Modos de pensamiento: full, non-thinking, low-effort
- Tool calling razonado
- Generación de código, matemáticas, diálogo multilingüe
- Contexto largo
- No se menciona visión ni audio explícitamente. Puedo indicar que no hay soporte de visión/audio en la información disponible.

## Casos de uso
Mínimo 6. Debo ser concreto y realista, basándome en las capacidades:
1. Asistentes de código con razonamiento
2. Agentes con tool calling
3. Análisis de documentos largos (512K)
4. Atención al cliente multilingüe
5. Resolución de problemas matemáticos paso a paso
6. Workflows de automatización con funciones
7. Chat empresarial con contexto largo

## Benchmarks y rendimiento
No hay datos de benchmarks en la información. Indicar "No se han publicado resultados de benchmarks en la información disponible."

## Requisitos de hardware
- VRAM estimada: con 3B en bfloat16, los pesos ocupan ~7.3 GB (repo size). Para inferencia, dependiendo de cuantización. Puedo estimar: bfloat16 ~7.3 GB, cuantizado 4-bit ~2 GB. Pero no debo inventar. Puedo decir "no disponible" o hacer una estimación basada en el tamaño del repo. Mejor: "El repo safetensors es de 7.3 GB; la VRAM necesaria depende de la cuantización y del framework. No se proporcionan datos oficiales." Luego listar opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (no se mencionan, pero son comunes; sin embargo, la instrucción dice "Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.)" y si no se conoce, indicar no disponible. Como la model card no lo dice, podría poner "no disponible" o mencionar que al ser transformers/safetensors es compatible con vLLM/TGI/llama.cpp si se convierte. Pero para no inventar, pongo "No especificado en la documentación. Al ser un modelo transformers con safetensors, es compatible con vLLM, TGI y llama.cpp (requiere conversión a GGUF)." Eso es razonable y no inventa datos concretos.
- GPU recomendadas: no disponible.
- Latencia: no disponible.

## Comparativa con modelos similares
Puedo comparar con Granite-4.2-8B y 30B (mencionados en la tabla de arquitectura). También podría mencionar otros modelos de 3B, pero no tengo datos. Mejor comparar con los hermanos de la familia: Granite-4.2-8B y 30B. La tabla de la model card da algunos parámetros. Puedo hacer una tabla con parámetros, contexto, licencia. No hay benchmarks. Indicar "no disponible" para rendimiento.

## Limitaciones y advertencias
- Idiomas no probados pueden fallar.
- Riesgo de alucinación (general en LLMs).
- No se mencionan sesgos específicos.
- Licencia Apache 2.0 permite uso comercial, sin restricciones.
- Contexto largo puede degradar rendimiento (no especificado).
- Modelo compacto puede tener menor capacidad que modelos grandes.

## Enlaces
- HuggingFace: https://huggingface.co/RedHatAI/granite-4.2-3b
- Blog: https://huggingface.co/blog/ibm-granite/granite-4-2
- GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Colección: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Licencia: https://www.apache.org/licenses/LICENSE-2.0

Debo asegurarme de no usar emojis, solo la primera palabra de los títulos en mayúscula (excepto nombres propios como Granite, IBM, Apache). Títulos: "Resumen", "Especificaciones técnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". En "Especificaciones técnicas", "técnicas" va en minúscula porque no es la primera palabra. Correcto.

Voy a redactar con cuidado, en castellano de España, sin inventar números.

En la tabla de especificaciones, para "Parametros activos" como no es MoE, pongo "No aplica (modelo denso)". La instrucción dice "(solo si es MoE)" así que puedo omitir la fila o poner "No aplica". Mejor incluir la fila con "No aplica (modelo denso)".

Para "Tipos de cuantizacion": la model card solo menciona bfloat16. Los safetensors están en bfloat16. Puedo poner "bfloat16 (pesos originales)". No hay otros tipos.

Para "Formato de pesos": safetensors.

En arquitectura y entrenamiento, menciono que es un fine-tuning del base Granite-4.1-3B-Base. No se proporcionan datos del dataset.

Capacidades: incluyo tool calling, agentes, multilingüe, razonamiento, código, matemáticas, contexto largo. No vision/audio.

Casos de uso: 6 o más.

Requisitos de hardware: Como no hay datos, puedo decir que el tamaño del repo es 7.3 GB, lo que da una idea. Para bfloat16, la VRAM mínima sería unos 7.3 GB más overhead. Pero no debo inventar. Puedo decir: "El repositorio safetensors pesa 7.3 GB, por lo que la inferencia en bfloat16 requiere al menos esa cantidad de VRAM, más overhead del framework. No se han publicado requisitos oficiales." Luego opciones de despliegue: "vLLM, TGI, llama.cpp (conversión a GGUF) y Ollama son compatibles en principio, aunque no está documentado explícitamente." Eso es razonable.

Comparativa: con 8B y 30B de la misma familia. Parámetros: 3.66B, 8B, 30B. Contexto 128K (todos). Arquitectura densa. Licencia Apache 2.0. Rendimiento no disponible.

Limitaciones: mencionar que es un modelo pequeño, puede tener limitaciones en tareas complejas comparado con modelos más grandes. Idiomas no probados. Riesgo de alucinación. Sin sesgos documentados.

Enlaces: los proporcionados.

Voy a escribir la respuesta solo con el markdown.## Resumen

Granite-4.2-3B es un modelo de lenguaje compacto de 3.000 millones de parámetros desarrollado por el Granite Team de IBM, dentro de la familia Granite 4.2. Se trata de un modelo de razonamiento nativo que incorpora una cadena de pensamiento integrada mediante tokens especiales ``, lo que le permite resolver tareas complejas de matemáticas, código, lógica multi-paso y llamadas a herramientas con mayor precisión que un modelo denso equivalente sin razonamiento.

El modelo parte de la base Granite-4.1-3B-Base y se ha ajustado para añadir capacidades de razonamiento y tool calling. Ofrece una ventana de contexto nativa de 128.000 tokens, ampliable hasta 512.000, y soporta tres modos de pensamiento configurables por consulta: pensamiento completo (por defecto), no pensamiento y esfuerzo bajo, lo que permite equilibrar profundidad y latencia según el caso de uso. Está publicado bajo licencia Apache 2.0, lo que habilita su uso comercial y académico sin restricciones, y ha sido probado en once idiomas, entre ellos español, inglés, alemán y japonés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parametros totales | 3.659.737.600 (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K nativo, extensión a 512K |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Granite-4.2-3B emplea una arquitectura decoder-only densa basada en el modelo GraniteForCausalLM. Sus componentes principales son: atención de consultas agrupadas (GQA) con 40 cabezas de atención y 8 cabezas KV, embeddings posicionales rotatorios (RoPE) con theta = 10.000.000, MLP con activación SwiGLU y tamaño oculto 8192, normalización RMSNorm (epsilon = 1e-5) y embeddings de entrada y salida separados (no atados). Los pesos se almacenan en precisión bfloat16.

El modelo es un ajuste fino del modelo base Granite-4.1-3B-Base, al que se le han añadido capacidades de razonamiento y tool calling. No se han publicado en la información disponible los detalles del dataset de entrenamiento, el número total de tokens ni si se emplearon técnicas de RLHF o DPO. La innovación principal es el razonamiento nativo con cadena de pensamiento integrada y la posibilidad de alternar entre modos de pensamiento sin cambiar de modelo.

## Capacidades

- Razonamiento nativo con cadena de pensamiento integrada mediante tokens especiales ``.
- Modos de pensamiento flexibles: pensamiento completo (por defecto), no pensamiento y esfuerzo bajo, seleccionables por consulta.
- Tool calling / function calling mejorado: el modelo razona sobre qué herramientas invocar y por qué, generando llamadas a funciones más precisas.
- Generación de código y soporte para tareas de programación.
- Resolución de problemas matemáticos y lógicos multi-paso.
- Diálogo multilingüe en 11 idiomas probados: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Ventana de contexto amplia de 128K tokens nativa, extensible a 512K, adecuada para documentos largos, conversaciones multi-turno y flujos de trabajo agénticos.
- No se ha documentado soporte de visión ni de audio en la información disponible.

## Casos de uso

- Asistentes de programación con razonamiento: el modelo puede generar código, explicar algoritmos y depurar errores paso a paso, aprovechando su cadena de pensamiento integrada para resolver problemas de lógica complejos.
- Agentes autónomos con tool calling: gracias a su razonamiento sobre cuándo y cómo invocar herramientas, es adecuado para construir agentes que consultan APIs, bases de datos o servicios externos de forma autónoma.
- Análisis de documentos extensos: la ventana de contexto de 128K tokens permite procesar contratos, informes técnicos o expedientes completos sin necesidad de dividir el texto, manteniendo el hilo de razonamiento sobre todo el documento.
- Atención al cliente multilingüe: el modelo soporta conversaciones en español, inglés, alemán, francés y otros idiomas, y puede gestionar turnos largos manteniendo el contexto de la conversación.
- Resolución de problemas matemáticos y financieros: su capacidad de razonamiento paso a paso lo hace útil para desglosar cálculos complejos, análisis de datos y problemas de optimización en entornos educativos o de negocio.
- Automatización de flujos de trabajo empresariales: mediante function calling, puede integrarse en pipelines de CI/CD, sistemas de tickets o herramientas de automatización para ejecutar acciones concretas a partir de instrucciones en lenguaje natural.
- Chatbots corporativos con memoria larga: la ventana ampliada permite mantener el historial de interacciones durante sesiones prolongadas, lo que resulta útil en asistentes internos de soporte técnico o consultoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de pesos safetensors ocupa 7,3 GB, por lo que la inferencia en bfloat16 requiere al menos esa cantidad de VRAM, más el overhead del framework y los buffers de atención.
- No se han publicado requisitos oficiales de VRAM ni recomendaciones de GPU en la documentación disponible.
- Al tratarse de un modelo transformers con pesos en safetensors, es compatible en principio con frameworks como vLLM, TGI y llama.cpp (este último requiere conversión previa a formato GGUF). También puede ejecutarse en Ollama si se empaqueta adecuadamente, aunque no está documentado explícitamente.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Granite-4.2-3B | 3,66B | 128K (extensible a 512K) | Densa | Apache 2.0 |
| Granite-4.2-8B | 8B | 128K (extensible a 512K) | Densa | Apache 2.0 |
| Granite-4.2-30B | 30B | 128K (extensible a 512K) | Densa | Apache 2.0 |

No se han publicado datos de rendimiento comparativo entre estos modelos en la información disponible. Los tres comparten la misma familia, arquitectura densa y licencia, diferenciándose en tamaño y capacidad.

## Limitaciones y advertencias

- Es un modelo compacto de 3B, por lo que su capacidad de razonamiento y generación puede ser inferior a la de modelos más grandes de la misma familia, como Granite-4.2-8B o 30B.
- Solo se han probado formalmente los idiomas listados; otros idiomas pueden funcionar, pero no se garantiza su rendimiento.
- Como todo modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre datos web, puede heredar sesgos presentes en los datos de preentrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de la normativa aplicable en su caso de uso.
- El contexto largo de hasta 512K puede degradar la calidad de la respuesta si el modelo no está correctamente ajustado para esa extensión, aunque la documentación indica soporte nativo de 128K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/granite-4.2-3b
- Blog técnico de IBM Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio de GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Colección de modelos Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
