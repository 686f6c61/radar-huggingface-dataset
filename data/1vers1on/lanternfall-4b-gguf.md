# 1vers1on/Lanternfall-4B-GGUF

## Resumen

Lanternfall-4B-GGUF es la versión cuantizada en formato GGUF del modelo Lanternfall-4B, un modelo de persona desarrollado por el usuario 1vers1on (Stardust) que interpreta a un sistema plural ficticio compuesto por ocho "headmates". El modelo está construido sobre Qwen3.5-4B-Base y está afinado específicamente para roleplay conversacional y personificación de múltiples identidades dentro de una misma sesión, una tarea que los modelos generalistas abordan de forma poco consistente.

Con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y licencia Apache 2.0, el modelo hereda la arquitectura de Qwen3.5, que combina capas de atención lineal con atención estándar, según se desprende de la referencia del autor a las capas de atención lineal de Qwen3.5 y al formato de tensores `ssm_beta_alpha`. El repositorio GGUF incluye dos cuantizaciones (Q4_K_M y Q8_0) y un Modelfile para Ollama, con un tamaño total de 7,2 GB.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de uso muy específico (sistemas plurales y roleplay multi-persona) que rara vez se cubre en modelos de propósito general; por otro, advierte de una incompatibilidad técnica concreta con versiones antiguas de llama.cpp y con el llama.cpp embebido en Ollama, derivada del nuevo formato de tensores de las capas de atención lineal de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5, con capas de atención lineal (referidas como `ssm_beta_alpha` en el formato de tensores) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (2,7 GB) y Q8_0 (4,5 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base Lanternfall-4B se construye sobre Qwen3.5-4B-Base, un transformer de aproximadamente 4,2 mil millones de parámetros. La model card del repositorio GGUF menciona explícitamente que las capas de atención lineal de Qwen3.5 se almacenan en el nuevo formato combinado `ssm_beta_alpha`, lo que indica que la arquitectura incorpora mecanismos de atención lineal junto a la atención convencional. No se dispone de detalles sobre el número de capas, dimensión oculta, número de cabezas ni proporción entre atención lineal y atención completa en la información proporcionada.

En cuanto al entrenamiento, la model card remite al repositorio principal (1vers1on/Lanternfall-4B) para los detalles de entrenamiento, muestras y limitaciones, pero no se incluyen en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el modelo fue entrenado únicamente con texto, motivo por el cual el proyector de visión no se incluye en la conversión GGUF. La conversión se realizó con una versión reciente de llama.cpp compatible con el formato de tensores de atención lineal de Qwen3.5.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay e interpretación de personajes.
- Personificación de un sistema plural ficticio de ocho "headmates", con capacidad de alternar entre identidades dentro de una misma conversación.
- Conversación multi-turno con plantilla de chat ChatML embebida (sin etiquetas de razonamiento o *thinking*).
- Compatibilidad con la API OpenAI-compatible de `llama-server` en el endpoint `/v1/chat/completions`.
- Ejecución local en GPU de consumo mediante llama.cpp, LM Studio u Ollama (con las restricciones de versión indicadas).
- No soporta visión: el proyector multimodal no está incluido porque el modelo solo se entrenó con texto.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Roleplay conversacional con múltiples personajes: el modelo puede mantener una conversación en la que alterna entre ocho identidades distintas, adecuado para narrativa interactiva, juegos de rol por texto o simulaciones de diálogo donde se requiere consistencia de personaje.
- Prototipado de asistentes con persona definida: útil para desarrolladores que quieran experimentar con asistentes conversacionales de personalidad marcada sin depender de APIs externas, ejecutándolo en local con llama.cpp.
- Investigación sobre sistemas plurales y representación de identidades múltiples: el modelo sirve como banco de pruebas para estudiar cómo un LLM mantiene coherencia entre voces diferenciadas en una misma sesión.
- Generación de diálogo para ficción y guiones: puede producir intercambios entre varios personajes con estilos diferenciados, aprovechando la ventana de contexto configurable (el ejemplo del autor usa 8192 tokens).
- Despliegue local en hardware modesto: con la cuantización Q4_K_M (2,7 GB), el modelo funciona en GPUs de 6 GB o más según el autor, lo que permite integrarlo en entornos sin acceso a la nube.
- Evaluación de cuantizaciones: la disponibilidad de Q4_K_M y Q8_0 permite comparar la degradación de calidad entre cuantizaciones en una tarea subjetiva como el roleplay, útil para decidir el equilibrio entre memoria y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB para Q4_K_M y 4,5 GB para Q8_0, según los tamaños de archivo indicados por el autor; hay que añadir la memoria del contexto KV cache, que crece con la longitud de contexto configurada.
- GPU recomendadas: el autor indica que Q4_K_M funciona correctamente en GPUs de 6 GB o más. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- GPU de consumo: sí cabe en GPUs consumer de 6 GB o más con Q4_K_M; Q8_0 requiere más memoria (4,5 GB de pesos más el contexto).
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y Ollama (este último solo cuando su llama.cpp embebido soporte el formato `ssm_beta_alpha`).
- Ejemplo de ejecución del autor: `llama-server -m lanternfall-4b.Q4_K_M.gguf --jinja -c 8192 -ngl 99 --temp 0.8 --top-p 0.95`.
- Muestreo recomendado: temperatura 0,7–0,9 y top_p 0,95.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lanternfall-4B-GGUF | 4,2 B | No disponible | Apache 2.0 | GGUF | Modelo de persona para sistema plural de ocho identidades; solo inglés |
| Qwen3.5-4B-Base | 4,2 B (base) | No disponible | Apache 2.0 | safetensors (base) | Modelo base sobre el que se construye Lanternfall; propósito general |
| Alternativas de roleplay de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Ámbito restringido: está afinado para roleplay y personificación de un sistema plural concreto; su comportamiento en tareas generales (código, matemáticas, razonamiento formal) no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación: como todo modelo generativo de 4 B de parámetros, puede inventar contenido, especialmente fuera de su dominio de especialización.
- Sin visión: el proyector multimodal no está incluido; el modelo es exclusivamente de texto.
- Compatibilidad de runtime: los archivos usan el formato de tensores `ssm_beta_alpha` de Qwen3.5; versiones antiguas de llama.cpp fallan con `tensor 'blk.0.ssm_beta.weight' not found`. En el momento de publicación, el llama.cpp embebido en Ollama no lo soporta.
- Plantilla de chat: en LM Studio debe dejarse el system prompt vacío, ya que la plantilla correcta (ChatML plano, sin etiquetas de *thinking*) está embebida en el archivo.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B-Base; conviene revisar la licencia del modelo base para confirmar obligaciones adicionales.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo de persona ficticia, puede reproducir estereotipos presentes en los datos de entrenamiento del modelo base.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1vers1on/Lanternfall-4B-GGUF
- Modelo base Lanternfall-4B: https://huggingface.co/1vers1on/Lanternfall-4B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
