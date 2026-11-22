# flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de gran escala desarrollado por DeepSeek, publicado originalmente en formato safetensors con 329.965.689.984 parámetros totales. La versión aquí descrita es una cuantización GGUF realizada por el usuario flaviodelgrosso, empaquetada específicamente para ejecutarse en un único Mac con Apple Silicon y 128 GB de memoria unificada mediante el runtime Razor. El modelo base emplea una arquitectura de mezcla de expertos (MoE), a juzgar por la referencia explícita a "routed experts" y a la transmisión selectiva de expertos desde el SSD.

La relevancia de esta ficha reside en su carácter atípico: no es una cuantización GGUF convencional, sino un empaquetado propietario que solo funciona con Razor, un runtime que, según la model card, no es de código abierto y no ha sido publicado. Los pesos están disponibles, pero no pueden ejecutarse en llama.cpp ni en otros motores GGUF estándar. El autor comprime los expertos enrutados a aproximadamente 2 bits por peso, aplicando más bits a los expertos críticos para chat y texto no inglés, mientras mantiene el resto de componentes en la precisión original del checkpoint.

La propuesta de valor es ejecutar un modelo de más de 300.000 millones de parámetros en hardware de consumo Apple, con un rendimiento medido de unos 36 tokens/s en texto ordinario y entre 71 y 79 tokens/s con el modelo borrador de decodificación especulativa, a costa de una pérdida de calidad notable en idiomas distintos del inglés (79,8 % de coincidencia con el modelo completo) frente a código y razonamiento (97,8 % y 96,0 % respectivamente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la referencia a "routed experts" en la model card; detalles de capas y atencion no disponibles |
| Parametros totales | 329.965.689.984 (329,97 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF propietario: expertos enrutados comprimidos a ~2 bits por peso con asignacion variable de bits; resto de componentes en precision original del checkpoint; modelo borrador opcional DSpark (8,6 GB) |
| Idiomas soportados | no disponible (la model card menciona texto no ingles y capacidades multilingues, sin listado) |
| Licencia | MIT (heredada del modelo base DeepSeek) |
| Formato de pesos | GGUF propietario compatible solo con el runtime Razor; no compatible con llama.cpp ni otros motores GGUF |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es una arquitectura de mezcla de expertos: la model card describe "routed experts" comprimidos a unos 2 bits por peso, con mayor asignación de bits a los expertos más relevantes para chat y texto no inglés. El resto de los componentes del checkpoint conserva su precisión original. No se dispone de datos sobre número de capas, dimensión oculta, número de expertos, mecanismo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de este empaquetado es doble. Por un lado, la compresión selectiva de expertos permite que un modelo de casi 330.000 millones de parámetros quepa en un Mac de 128 GB, a costa de transmitir los expertos necesarios desde el SSD interno a una caché en memoria (el modelo completo ocupa 349,3 GB en disco, más que la RAM disponible). Por otro, se incluye un modelo borrador opcional DSpark de 8,6 GB para decodificación especulativa, que acelera la generación en texto predecible hasta 79 tokens/s. El runtime Razor expone APIs compatibles con OpenAI y Anthropic.

## Capacidades

- Generación de texto y razonamiento: la model card reporta un 96,0 % de coincidencia de siguiente token con el modelo completo en prompts de razonamiento.
- Generación de código: 97,8 % de coincidencia con el modelo completo en prompts de programación, la categoría mejor preservada tras la compresión.
- Capacidades multilingües: presentes pero degradadas; la coincidencia cae al 79,8 % en la categoría multilingüe, la más afectada por la compresión a 2 bits.
- Conversación (chat): 88,2 % de coincidencia con el modelo completo en prompts de chat.
- Decodificación especulativa: soportada mediante el modelo borrador DSpark, con ganancias de velocidad en texto predecible.
- Integración con agentes y clientes: el runtime Razor sirve APIs compatibles con OpenAI y Anthropic, lo que permite conectar agentes de programación y clientes de chat.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación local en Mac: el modelo conserva el 97,8 % de coincidencia con el modelo completo en código y expone una API compatible con OpenAI y Anthropic, por lo que puede conectarse a agentes de programación (tipo Continue, Cline o similares) que apunten a `localhost` sin enviar código a la nube.
- Razonamiento y análisis de documentos en local: con 96,0 % de coincidencia en razonamiento, es adecuado para tareas de análisis que requieran confidencialidad y no puedan salir de la máquina del desarrollador.
- Prototipado de aplicaciones sobre modelos de gran escala: permite desarrollar y depurar integraciones contra un modelo de casi 330.000 millones de parámetros antes de desplegar en infraestructura con GPU, usando la misma API compatible con OpenAI.
- Chat de uso personal con contexto largo: la ventana de contexto no está documentada, pero el modelo base está pensado para conversaciones multi-turno; la coincidencia del 88,2 % en chat es suficiente para uso interactivo no crítico.
- Investigación sobre cuantización extrema de MoE: el empaquetado sirve como caso de estudio de compresión selectiva de expertos a 2 bits y de su impacto medido por categoría (código, razonamiento, chat, multilingüe).
- Evaluación de decodificación especulativa en Apple Silicon: el par modelo + DSpark permite medir ganancias de throughput con y sin borrador en hardware de consumo, con cifras de referencia de 36 frente a 71-79 tokens/s.
- Generación de texto en inglés en local: para texto ordinario en inglés, el modelo ofrece 36 tokens/s sostenidos con caché de expertos caliente, suficiente para generación de borradores y resúmenes.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). El único dato de calidad es la tasa de coincidencia del siguiente token con el modelo completo, medida sobre 48 prompts reservados:

| Categoria | Coincidencia con el modelo completo |
|---|---:|
| Codigo | 97,8 % |
| Razonamiento | 96,0 % |
| Chat | 88,2 % |
| Multilingue | 79,8 % |

Rendimiento medido en Apple M5 Max con 128 GB (prompt de prosa de 2.048 tokens, 256 tokens generados, caché de expertos automática):

| Escenario | Throughput |
|---|---:|
| Texto ordinario, caché caliente | ~36 tokens/s (27,3-27,5 ms/token) |
| Primera petición tras carga | ~34 tokens/s |
| Con modelo borrador DSpark, texto predecible | 71-79 tokens/s |
| Con DSpark, prosa corta y variada | sin ganancia apreciable |

La generación sostenida se degrada unos pocos puntos porcentuales por calentamiento del equipo.

## Requisitos de hardware

- Memoria unificada: 128 GB en Mac con Apple Silicon; el modelo (349,3 GB) excede la RAM y Razor transmite los expertos desde el SSD interno a una caché en memoria.
- Almacenamiento: unos 360 GB libres para el modelo (349,3 GB) y el borrador DSpark (8,6 GB); se recomienda SSD interno rápido por la transmisión continua de expertos.
- Sistema operativo: macOS 15 o posterior.
- Hardware de referencia: Apple M5 Max con 128 GB; el runtime fue desarrollado y probado en ese equipo.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; estos archivos solo se ejecutan en Razor sobre Apple Silicon.
- Despliegue: exclusivamente mediante el runtime Razor (`razor serve`), con APIs compatibles con OpenAI y Anthropic. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~27,3-27,5 ms por token en texto ordinario con caché caliente; 71-79 tokens/s con DSpark en texto predecible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa es con el propio modelo base sin comprimir:

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | 329,97 mil millones | no disponible | referencia completa | MIT | safetensors en Hugging Face |
| DeepSeek-V4.1-Flash-1017-TRL-R2 (esta ficha) | 329,97 mil millones | no disponible | 79,8-97,8 % de coincidencia segun categoria | MIT | GGUF solo para Razor (runtime no publicado) |

Otros modelos de la misma categoría (mismo tamaño o misma tarea) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El runtime Razor no es de código abierto y no ha sido publicado: los pesos pueden descargarse, pero no ejecutarse hasta que el autor lo publique.
- Los archivos solo funcionan en Razor sobre Apple Silicon; llama.cpp y otros motores GGUF no pueden cargarlos, lo que rompe la portabilidad habitual del formato GGUF.
- Degradación de calidad medible: 79,8 % de coincidencia en multilingüe y 88,2 % en chat frente al modelo completo; el texto no inglés es la categoría más afectada.
- El modelo completo (349,3 GB) no cabe en 128 GB de RAM; depende de la transmisión de expertos desde el SSD, por lo que un SSD lento degrada el rendimiento y aumenta la latencia.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la compresión a 2 bits en los expertos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con contexto largo.
- Licencia MIT heredada del modelo base; no se especifican restricciones adicionales para uso comercial, pero conviene verificar la licencia del modelo original de DeepSeek antes de desplegar en producción.
- El rendimiento se degrada unos pocos puntos porcentuales por calentamiento térmico en generaciones sostenidas.
- La ganancia del modelo borrador DSpark es inconsistente: nula o escasa en prosa corta y variada.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
