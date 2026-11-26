# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-12B-it-abliterated-4bit-mlx` es una cuantización a 4 bits en formato MLX de un Gemma 4 12B "abliterado", es decir, con la dirección de rechazo suprimida mediante técnicas de abliteration. Lo publica el usuario divinetribe, que parte del modelo base `OpenYourMind/gemma-4-12B-it-abliterated-uncensored` y lo convierte y cuantifica para ejecución nativa en Apple Silicon mediante `mlx-vlm`. El objetivo es ofrecer un modelo local sin filtros de rechazo que quepa en Macs de gama alta con memoria unificada modesta.

El modelo resuelve el problema de ejecutar un LLM de 12B parámetros íntegramente en local, sin API ni conexión a la nube, en hardware de consumo de Apple. Con aproximadamente 11,96 mil millones de parámetros y un peso de repositorio de 11,0 GB, está pensado para Macs de 24-32 GB de memoria unificada. La arquitectura es Gemma 4 (unified), según indica el autor, y la cuantización es de 4 bits con group size 64.

Es relevante ahora porque se integra en el stack `claude-code-local`, que expone una API compatible con Anthropic sobre MLX, permitiendo usar herramientas tipo Claude Code de forma totalmente local. La licencia es la Gemma de Google, lo que impone restricciones de uso comercial que conviene revisar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (unified) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma (Google) |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

La arquitectura es Gemma 4 en su variante "unified", según la model card, y los pesos se han convertido con `mlx-vlm`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card no los detalla.

La innovación técnica destacable es la abliteration aplicada por OpenYourMind sobre el modelo base: se suprime la dirección de rechazo del modelo para que no rechace peticiones benignas pero polémicas. El autor advierte explícitamente de que esto no es una mejora de capacidades, sino una modificación del comportamiento de rechazo. La cuantización a 4 bits con group size 64 la realiza divinetribe para MLX.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento general y respuesta a instrucciones, heredado del modelo Gemma 4 instruct.
- Comportamiento sin rechazos ante peticiones benignas pero polémicas (abliterated).
- Ejecución local en Apple Silicon mediante MLX, sin API ni conexión a la nube.
- Integración como backend en el stack `claude-code-local` a través de un servidor MLX compatible con la API de Anthropic.
- Soporte de tool calling y agentes: no disponible de forma explícita en la información proporcionada; el autor lo menciona solo en el contexto del stack de agentes, no como capacidad verificada del modelo.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente de código local en Mac: se puede apuntar `MLX_MODEL` a este repositorio dentro de `claude-code-local` para ejecutar tareas de edición de código sin enviar datos a la nube, aprovechando que el modelo cabe en 11 GB.
- Desarrollo en entornos con requisitos de privacidad: al ejecutarse 100% on-device, es adecuado para trabajar con código o datos que no pueden salir del portátil.
- Prototipado de agentes locales: sirve como modelo de pruebas en el leaderboard Agent-12 para tareas de agente evaluadas por el sistema de ficheros.
- Generación de texto creativo sin filtros: útil para escritura de ficción o guiones con temáticas sensibles donde los rechazos del modelo base resultan molestos.
- Evaluación de técnicas de abliteration: permite comparar el comportamiento del modelo abliterado frente al Gemma 4 original en la misma máquina.
- Inferencia offline en portátil: escenarios de campo o viaje sin conectividad donde se necesita un LLM de 12B con calidad razonable.
- Base para fine-tuning local: al estar en formato MLX y safetensors, puede servir de punto de partida para ajustes posteriores en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor indica que ocupa 11 GB y funciona "cómodamente en un Mac de 32 GB"; en un Mac de 24 GB también debería caber, según la model card.
- GPU recomendadas: Apple Silicon con memoria unificada de 24 GB o más (MacBook Pro, Mac Studio). No aplica a GPU NVIDIA/AMD por el formato MLX.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon; no es ejecutable en GPUs convencionales sin reconversión.
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`), servidor MLX compatible con Anthropic dentro de `claude-code-local`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-12B-it-abliterated-4bit-mlx (este) | ~12B | no disponible | MLX 4-bit | Gemma | Abliterado, solo Apple Silicon, inglés |
| OpenYourMind/gemma-4-12B-it-abliterated-uncensored | ~12B | no disponible | safetensors | Gemma | Modelo base sin cuantizar; requiere más memoria |
| Gemma 4 12B instruct original | ~12B | no disponible | safetensors/GGUF | Gemma | Con rechazos; disponible en múltiples formatos |
| Otros modelos del roster divinetribe (p. ej. Llama 3.3 70B abliterado MLX) | hasta 70B | no disponible | MLX | según modelo | Mayor tamaño, requiere Macs de gama muy alta |

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo; el modelo puede generar contenido sensible, ofensivo o inapropiado. No es una mejora de capacidades y puede degradar la coherencia en algunas tareas.
- Riesgo de alucinación inherente a los LLM de este tamaño; no se han publicado evaluaciones que lo cuantifiquen.
- Solo soporta inglés según la model card; el rendimiento en castellano no está garantizado.
- La licencia Gemma de Google impone restricciones de uso comercial y obligaciones de atribución; hay que revisar los términos antes de usarlo en producción.
- Formato MLX exclusivo para Apple Silicon: no es portable a GPUs NVIDIA/AMD sin reconversión.
- El autor advierte de que el uso es responsabilidad del usuario y que sigue sujeto a la licencia Gemma upstream.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el rendimiento en tool calling verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: no disponible como enlace directo en la información proporcionada
