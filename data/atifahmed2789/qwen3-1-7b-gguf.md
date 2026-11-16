# atifahmed2789/Qwen3-1.7B-GGUF

## Resumen

Qwen3-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Este repositorio concreto lo publica el usuario atifahmed2789 como empaquetado listo para su uso con llama.cpp y Ollama, manteniendo la licencia Apache 2.0 del modelo base. Se trata de un modelo de lenguaje causal denso de 1.720.574.976 parámetros (1,4B no pertenecientes a embeddings), diseñado para generación de texto, razonamiento, código y diálogo multilingüe.

La relevancia de Qwen3 radica en su capacidad de alternar entre modo de razonamiento (thinking mode) y modo directo (non-thinking mode) dentro de un mismo modelo, algo poco habitual en modelos de este tamaño. Con 28 capas y atención GQA (16 cabezas para Q y 8 para KV), el modelo ofrece una ventana de contexto de 32.768 tokens, suficiente para conversaciones multi-turno extensas y tareas de recuperación aumentada.

Al estar cuantizado en q8_0 y distribuido como GGUF, el modelo está pensado para inferencia local en hardware de consumo, lo que lo convierte en una opción atractiva para desarrolladores que necesitan desplegar un asistente conversacional o un motor de razonamiento ligero sin depender de infraestructura en la nube. No obstante, este repositorio concreto no incluye información adicional sobre idiomas, benchmarks ni otros formatos de cuantización más allá del indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 1.720.574.976 (1,7B); 1,4B sin embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | q8_0 (única indicada en la model card) |
| Idiomas soportados | no disponible (la familia Qwen3 declara 100+ idiomas, pero este repo no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Capas | 28 |
| Cabezas de atencion | 16 para Q, 8 para KV (GQA) |
| Tamano del repositorio | 1,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: un transformer causal denso con 28 capas, normalización RMSNorm y atención con grouped-query attention (16 cabezas de consulta y 8 de clave-valor), lo que reduce el coste de memoria del KV cache durante la inferencia. El contexto máximo es de 32.768 tokens. Al ser la variante de 1,7B, no emplea mezcla de expertos (MoE); esa característica está reservada a las variantes mayores de la familia Qwen3.

El entrenamiento del modelo base Qwen3-1.7B incluye fases de preentrenamiento y post-entrenamiento (instrucción y alineación con preferencias humanas), según indica la model card del autor. La innovación más destacable es la capacidad de alternar entre modo de razonamiento y modo directo mediante las etiquetas `/think` y `/no_think`, que el modelo respeta turno a turno en conversaciones multi-turno. Esta versión GGUF no documenta detalles adicionales sobre composición del dataset, número de tokens de entrenamiento ni técnicas específicas de RLHF/DPO más allá de lo que declara la familia Qwen3.

## Capacidades

- Generación de texto conversacional y completado de instrucciones en modo directo (non-thinking).
- Razonamiento paso a paso en modo thinking, orientado a matemáticas, lógica y código.
- Generación y explicación de código, con soporte para lenguajes habituales.
- Cambio dinámico entre thinking y non-thinking mediante `/think` y `/no_think` en el prompt o en el mensaje de sistema.
- Capacidades de agente y uso de herramientas externas (tool calling / function calling), según declara la familia Qwen3.
- Soporte multilingüe amplio según la documentación de Qwen3 (100+ idiomas), aunque este repositorio no lo detalla.
- Alineación con preferencias humanas para escritura creativa, role-play y diálogo multi-turno.
- Ejecución local mediante llama.cpp y Ollama con la plantilla de chat Jinja2 incluida.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno con hasta 32.768 tokens de contexto, adecuado para chatbots de escritorio o integraciones en aplicaciones sin conexión a la nube.
- Razonamiento matemático asistido: en modo thinking, con prompts que solicitan razonamiento paso a paso y respuesta en `\boxed{}`, sirve para resolver problemas de nivel educativo y verificar cálculos.
- Generación de código en entornos de desarrollo: puede integrarse en editores o pipelines para autocompletar funciones, explicar fragmentos y proponer correcciones, con la ventaja de ejecutarse en hardware de consumo.
- Agentes con tool calling: su soporte de function calling permite construir asistentes que consultan APIs, bases de datos o servicios externos en flujos multi-paso.
- Procesamiento de documentos largos: con 32.768 tokens de contexto puede resumir informes, extraer entidades o responder preguntas sobre contratos y artículos extensos.
- Traducción y asistencia multilingüe: la familia Qwen3 declara soporte de más de 100 idiomas, útil para traducción asistida y atención al cliente en varios idiomas.
- Prototipado rápido y experimentación: al ser un GGUF de 1,8 GB ejecutable con llama.cpp u Ollama, permite validar ideas y flujos de prompting en portátiles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para la cuantización q8_0 (tamaño del repo 1,8 GB) más el KV cache, que crece con el contexto; con 32.768 tokens el KV cache puede añadir varios cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo está claramente orientado a GPUs de consumo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/...`), y cualquier runtime compatible con GGUF. No se documenta soporte específico para vLLM o TGI en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-GGUF (este repo) | 1,7B | 32.768 | Apache 2.0 | GGUF q8_0 | Thinking/no-thinking, tool calling |
| Qwen3-1.7B (base oficial) | 1,7B | 32.768 | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen2.5-1.5B | 1,5B | 32.768 (según familia) | Apache 2.0 | safetensors/GGUF | Generación anterior, sin thinking mode documentado en esta ficha |
| Llama 3.2 1B | 1,2B | 128.000 (según familia) | Llama 3.2 Community License | safetensors/GGUF | Contexto mayor, licencia más restrictiva |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoría; los datos de contexto y licencia de esos modelos no se han verificado en la información proporcionada y deben contrastarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a modelos de 1,7B: la capacidad de razonamiento y el conocimiento factual son limitados en comparación con modelos mayores.
- En modo thinking se recomienda no usar decodificación greedy, ya que puede provocar degradación y repeticiones infinitas; usar temperatura 0,6, top-p 0,95 y presencia 1,5.
- En modelos cuantizados se aconseja presencia 1,5 para suprimir repeticiones; valores más altos pueden causar mezcla de idiomas y pérdida de rendimiento.
- El repositorio no especifica los idiomas soportados ni incluye benchmarks propios; las afirmaciones multilingües provienen de la familia Qwen3, no de este empaquetado.
- Solo se ofrece la cuantización q8_0; no hay variantes q4, q5 u otras en este repo, lo que limita el ajuste fino de memoria.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3-1.7B y las condiciones de la plantilla de chat.
- El autor del repositorio es un usuario individual (atifahmed2789), no el equipo oficial de Qwen; la trazabilidad y el mantenimiento no están garantizados.
- En conversaciones multi-turno, el historial no debe incluir el contenido de thinking; los frameworks que no usen la plantilla Jinja2 deben gestionarlo manualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/atifahmed2789/Qwen3-1.7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Guía de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Guía de Ollama: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Chat de Qwen: https://chat.qwen.ai/
