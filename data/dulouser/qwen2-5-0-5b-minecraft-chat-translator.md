# duLouser/qwen2.5-0.5b-minecraft-chat-translator

## Resumen

`qwen2.5-0.5b-minecraft-chat-translator` es un modelo de traducción automática especializado en conversaciones de chat de Minecraft entre inglés y alemán, desarrollado por duLouser. Se trata de un fine-tune del modelo base `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba, entrenado con el método LoRA y posteriormente fusionado a precisión FP16, de modo que el modelo resultante es completamente autónomo y no requiere dependencias de PEFT para su uso.

El modelo resuelve un problema muy concreto: la traducción en tiempo real de mensajes de chat multijugador entre inglés y alemán, con un formato de salida estricto de dos líneas (`src: <idioma>` y `<idioma_destino>: <traducción>`) diseñado para integrarse en un motor de retransmisión de chat en vivo. Su relevancia radica en que ofrece una alternativa ligera (494 millones de parámetros) y de baja latencia frente a modelos mucho más grandes, con una adherencia al protocolo del 100% en las pruebas del autor. El modelo hereda la arquitectura Qwen2.5, con una ventana de contexto de hasta 128K tokens, aunque en la práctica se usa con mensajes cortos de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | FP16 (pesos fusionados), bfloat16 en inferencia; no se documentan cuantizaciones adicionales |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0.5B parámetros con atención completa (no MoE, no SSM). El fine-tune se realizó con LoRA (r=16, alpha=32) sobre las proyecciones q, v, k y o, y posteriormente se fusionaron los adaptadores en los pesos del modelo base, dando como resultado un modelo FP16 independiente. El entrenamiento se llevó a cabo exclusivamente en CPU (AMD Ryzen 7 H 255, 14 núcleos Zen 4, con soporte AVX-512 BF16), con un throughput de ~245 tokens/segundo y una duración de 7 horas y 34 minutos para una época completa (1.497 pasos).

El dataset de entrenamiento consta de 5.990 muestras en formato ChatML, generadas a partir de 4 escenarios distintos con permutaciones de nombres de usuario, y 666 muestras de validación. La pérdida de validación se redujo de 1.1972 a 0.1005 (una reducción del 91,6%). El modelo incorpora un glosario de dominio específico de Minecraft y de la comunidad de jugadores (por ejemplo, `Ansturm` → `Rush`, `LoW` → `Legend of War`, `LK` → `Leistungskurs`) y está entrenado para manejar errores tipográficos comunes en el chat real (`schwimsmt`, `vlt`, `gehn`). No se documenta el uso de RLHF ni DPO; el entrenamiento es un fine-tune supervisado estándar.

## Capacidades

- Traducción bidireccional inglés ↔ alemán de mensajes de chat de Minecraft.
- Salida estricta en dos líneas: detección del idioma de origen (`src: en|de`) y traducción al otro idioma (`en: ...` o `de: ...`), sin preámbulos ni texto adicional.
- Manejo de errores tipográficos y jerga de chat de videojuegos (abreviaturas, faltas de ortografía intencionales).
- Aplicación de un glosario de dominio específico para términos de Minecraft y de la comunidad de jugadores.
- Compatible con motores de inferencia con caché KV persistente para latencias planas (<15 ms de tiempo hasta el primer token).
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso más allá de la tarea de traducción.
- Capacidades multilingües limitadas a inglés y alemán; no se documentan otros idiomas.

## Casos de uso

- Traducción en tiempo real de chat de servidores de Minecraft: el modelo se integra en un motor de retransmisión de chat que recibe mensajes con formato `[timestamp] [usuario]: mensaje` y devuelve la traducción en el protocolo de dos líneas, permitiendo que jugadores angloparlantes y germanoparlantes se comuniquen sin fricción.
- Moderación y análisis de chat multilingüe: al detectar el idioma de origen de forma fiable, puede usarse como preprocesador para sistemas de moderación que necesitan clasificar mensajes por idioma antes de aplicar políticas.
- Traducción de logs de servidor: los logs de chat de servidores de Minecraft pueden procesarse por lotes con este modelo para generar transcripciones bilingües, útiles para análisis comunitario o documentación.
- Asistente de traducción para comunidades de jugadores: el modelo puede desplegarse como un bot en Discord o en el propio juego que traduce mensajes entre inglés y alemán, con latencia suficientemente baja para conversación fluida.
- Pruebas de concepto de traducción especializada de bajo coste: al ser un modelo de 0.5B, puede ejecutarse en hardware modesto (CPU o GPU de gama baja), lo que lo convierte en una opción viable para proyectos educativos o prototipos que necesiten traducción de dominio específico sin depender de APIs externas.
- Benchmark de fine-tuning eficiente: el repositorio incluye scripts de entrenamiento y el adaptador LoRA separado (34 MB), por lo que puede usarse como caso de estudio para reproducir el pipeline de fine-tuning con LoRA en CPU.

## Benchmarks y rendimiento

El autor proporciona una tabla comparativa propia, no basada en benchmarks estándar (MMLU, HumanEval, etc.), sino en métricas específicas de la tarea:

| Modelo | Adherencia al protocolo | Deteccion de idioma | Mapeo de glosario | Latencia media |
|---|---|---|---|---|
| Qwen 0.5B base (sin ajuste) | Fallo | Incorrecta | Ninguno | ~2.000 ms |
| **Este modelo (fine-tuned)** | 100% estricto | 100% | Ansturm→Rush, LoW→Legend of War | ~1.200 ms CPU / <15 ms con caché KV |
| Nemotron 3.5 Lightning 30B | 100% | 100% | Parcial | ~750 ms |
| Gemini 3.5 Flash Lite | Incluye eco | 100% | Parcial | ~640 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 494M parámetros en FP16, ocupa aproximadamente 1 GB en memoria (los pesos FP16 son ~988 MB). En bfloat16, el consumo es similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1650, RTX 2060 o superior funcionará sin problemas. También puede ejecutarse en CPU con un rendimiento aceptable (~1.200 ms por mensaje según el autor).
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de gama media.
- Opciones de despliegue: compatible con Transformers (PyTorch), vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp/Ollama). El autor menciona compatibilidad con un motor de caché KV persistente para latencias <15 ms.
- Latencia y throughput estimados: ~1.200 ms por mensaje en CPU (AMD Ryzen 7 H 255), <15 ms de tiempo hasta el primer token con caché KV persistente. El throughput de entrenamiento fue de ~245 tokens/segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **qwen2.5-0.5b-minecraft-chat-translator** | 494M | 128K | Traduccion EN↔DE de chat de Minecraft | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 494M | 128K | Modelo general de instrucciones | Apache 2.0 | Hugging Face, Ollama |
| Nemotron 3.5 Lightning 30B | 30B (estimado) | no disponible | Modelo general de alto rendimiento | no disponible | no disponible |
| Gemini 3.5 Flash Lite | no disponible | no disponible | Modelo propietario general | Propietaria | API de Google |

La comparativa con Nemotron y Gemini se basa únicamente en los datos del autor; no se dispone de información pública verificable sobre esos modelos en la búsqueda realizada. La ventaja principal de este modelo frente a alternativas generales es su especialización: el fine-tune consigue una adherencia al protocolo del 100% y un glosario de dominio que los modelos generales no ofrecen, con un coste computacional mucho menor.

## Limitaciones y advertencias

- El modelo está limitado a la traducción entre inglés y alemán; no soporta otros idiomas.
- Su salida está restringida al protocolo de dos líneas; no es adecuado para tareas de traducción general o generación de texto libre.
- El glosario de dominio está pensado para la comunidad de Minecraft y puede no generalizar a otros juegos o contextos.
- El entrenamiento se realizó con un dataset relativamente pequeño (5.990 muestras) y en un solo escenario (chat de servidor); puede tener un rendimiento degradado con estilos de escritura muy diferentes o jerga fuera del dominio.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede producir traducciones incorrectas o inventar términos, especialmente con mensajes ambiguos o muy cortos.
- No se han evaluado sesgos de género, raza o contenido ofensivo; el modelo se entrenó con logs de chat reales que pueden contener lenguaje inapropiado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (Qwen2.5-0.5B-Instruct) para confirmar que no hay restricciones adicionales.
- El modelo no incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es una herramienta de traducción especializada, no un asistente general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duLouser/qwen2.5-0.5b-minecraft-chat-translator
- Adaptador LoRA (34 MB): https://huggingface.co/duLouser/qwen2.5-0.5b-minecraft-chat-translator-lora
- Repositorio de codigo y scripts de entrenamiento: https://github.com/chrisb09/minecraft-chat-translator
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5-llm
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:0.5b
- Documentacion sobre function calling en Qwen2.5: https://deepwiki.com/QwenLM/Qwen2.5/2.2-function-calling-and-tool-use
