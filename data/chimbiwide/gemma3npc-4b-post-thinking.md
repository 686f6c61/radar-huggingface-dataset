# chimbiwide/Gemma3NPC-4B-post-thinking

## Resumen

Gemma3NPC-4B-post-thinking es un ajuste fino (fine-tuning) del modelo base google/gemma-3-4b-pt, desarrollado por el usuario chimbiwide en el contexto de un articulo aceptado en la conferencia AIIDE-2026. El modelo esta especializado en la interpretacion de personajes no jugadores (NPC) para entornos de rol conversacional, y su rasgo distintivo es que genera una respuesta normal seguida de un bloque `<post-thinking>...</post-thinking>` donde el propio personaje reflexiona brevemente sobre por que respondio de esa manera.

El modelo parte de la arquitectura Gemma 3 de Google, con 4.300.079.472 parametros totales (aproximadamente 4,3 mil millones), y conserva la modalidad image-text-to-text del modelo base, aunque su ajuste se orienta a la conversacion en ingles. El repositorio ocupa 17,2 GB y se distribuye en formato safetensors bajo licencia Gemma, con pesos cuantizados GGUF disponibles en un repositorio separado.

Su relevancia actual reside en la incorporacion de un mecanismo de "post-thinking" explicito que separa la respuesta visible del personaje de una traza de razonamiento en primera persona, lo que facilita la depuracion, la coherencia a largo plazo en dialogos multi-turno y el analisis academico del comportamiento de agentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), multimodal image-text-to-text |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (Gemma3NPC-4B-post-thinking-GGUF); niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (repo principal); GGUF (repo secundario) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint preentrenado google/gemma-3-4b-pt, que pertenece a la familia Gemma 3 de Google, basada en transformers decoder-only con capacidades multimodales de entrada imagen-texto. No se dispone de informacion sobre modificaciones estructurales respecto al modelo base, ni sobre el numero de tokens de entrenamiento, la composicion exacta del dataset o el uso de tecnicas de RLHF o DPO.

El entrenamiento emplea el dataset chimbiwide/AIIDE-POST-THINKING, disenado especificamente para el paradigma de post-thinking: el modelo aprende a emitir primero una respuesta conversacional en personaje y, a continuacion, un bloque `<post-thinking>...</post-thinking>` con una reflexion interna en primera persona. Esta innovacion separa la salida visible de la traza de razonamiento, lo que permite auditar la coherencia del personaje y mantener memoria narrativa entre turnos sin exponer el razonamiento al jugador. El trabajo esta respaldado por un articulo aceptado en AIIDE-2026 (DOI 10.1609/aiide.v22i1.43599) y un repositorio publico con una demo de uso.

## Capacidades

- Generacion de texto conversacional en rol, con tono y vocabulario adaptados al personaje definido en el system prompt.
- Modo post-thinking: emision de un bloque `<post-thinking>` tras cada respuesta con reflexion en primera persona sobre la propia intervencion y lo que conviene recordar.
- Coherencia narrativa multi-turno: referencia al trasfondo del personaje y al entorno actual declarados en el prompt de sistema.
- Entrada multimodal imagen-texto heredada del modelo base Gemma 3 (pipeline image-text-to-text).
- Capacidades generales de razonamiento, codigo y matematicas heredadas del modelo base, aunque no evaluadas especificamente en este ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado mas alla del mecanismo de post-thinking.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- NPCs en videojuegos de rol: el modelo interpreta a un personaje con trasfondo y ubicacion definidos en el system prompt, y el bloque de post-thinking permite depurar por que el NPC respondio de una forma concreta sin mostrarlo al jugador.
- Prototipado rapido de dialogos narrativos: escritores y disenadores pueden iterar sobre el trasfondo y las instrucciones del personaje y observar la reflexion interna para ajustar su personalidad antes de integrarlo en el motor del juego.
- Investigacion academica sobre agentes conversacionales: la separacion entre respuesta y traza de razonamiento facilita el analisis cuantitativo de coherencia y consistencia de personajes en estudios como el publicado en AIIDE-2026.
- Simulaciones de entrenamiento conversacional: el modelo puede actuar como interlocutor con memoria narrativa en escenarios de practica (entrevistas, negociacion, role-play formativo), con la traza de post-thinking como registro de auditoria.
- Moderacion y control de calidad de dialogos: el bloque `<post-thinking>` sirve como senal auxiliar para revisar si el personaje se mantiene en su papel o si introduce informacion fuera de contexto.
- Demo interactiva y evaluacion de modelos: con 4,3 mil millones de parametros y cuantizaciones GGUF, puede desplegarse en hardware de consumo para demos jugables o pruebas A/B de personalidad entre variantes del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,6 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 12-16 GB para contextos moderados.
- Cuantizacion GGUF: los pesos en 8 bits rondarian 4,3 GB y en 4 bits alrededor de 2,2 GB, lo que permitiria inferencia en GPUs de consumo con 4-8 GB de VRAM (niveles exactos no confirmados en la informacion disponible).
- GPUs recomendadas: A100 o H100 para despliegue en produccion con contexto largo y concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en precision completa o cuantizacion alta.
- Cabe en GPU de consumo: si, en cuantizaciones GGUF de 4-8 bits sobre GPUs con 6-8 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), llama.cpp u Ollama mediante los GGUF del repositorio secundario, y servidores compatibles con la API de Hugging Face Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-post-thinking | 4,3 B | No disponible | Imagen-texto | Gemma | Ajuste para NPC con post-thinking |
| google/gemma-3-4b-pt | 4,3 B (aprox.) | No disponible | Imagen-texto | Gemma | Modelo base preentrenado, sin ajuste conversacional |
| Alternativas de rol conversacional de ~4 B | No disponible | No disponible | Texto | Variable | No se dispone de datos verificables en la informacion proporcionada |

La comparacion directa con otros ajustes de NPC de tamano similar no puede establecerse con rigor porque no se han proporcionado resultados de benchmarks ni especificaciones de modelos alternativos.

## Limitaciones y advertencias

- Entrenado y documentado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 4 B de parametros, especialmente en conversaciones largas donde el personaje puede inventar detalles de su trasfondo.
- El bloque `<post-thinking>` es visible en la salida de texto; en produccion es necesario filtrarlo o separarlo antes de mostrarlo al usuario final.
- La licencia Gemma impone condiciones de uso comercial y requiere aceptar los terminos de Google en Hugging Face (acceso con gate); es responsabilidad del integrador revisar las restricciones.
- No hay informacion publica sobre sesgos especificos, datos de alineacion ni evaluaciones de seguridad para este ajuste.
- El modelo conserva la torre de vision del base pero no se documenta su calidad tras el ajuste; conviene validar el comportamiento multimodal antes de usarlo.
- Con solo 10 descargas y 0 likes en el momento de la consulta, la comunidad de validacion es practicamente inexistente; tratar como modelo de investigacion, no como solucion lista para produccion.
- La longitud de contexto no esta declarada; asumir la del modelo base sin confirmacion puede provocar degradacion en dialogos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimbiwide/Gemma3NPC-4B-post-thinking
- Cuantizaciones GGUF: https://huggingface.co/chimbiwide/Gemma3NPC-4B-post-thinking-GGUF
- Repositorio del proyecto: https://github.com/KeeganCarey/Post-Thinking-AIIDE
- Paper (DOI): https://doi.org/10.1609/aiide.v22i1.43599
- Conferencia AIIDE-2026: https://sites.google.com/view/aiide2026/home
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/AIIDE-POST-THINKING
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
