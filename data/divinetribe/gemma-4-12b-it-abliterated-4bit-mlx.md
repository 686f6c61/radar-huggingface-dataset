# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-12B-it-abliterated-4bit-mlx` es una cuantización de 4 bits en formato MLX de un Gemma 4 de 12B con instrucciones, al que se le ha aplicado la técnica de *abliteration* para suprimir la dirección de rechazo interna del modelo. Lo publica el usuario divinetribe (Matt Macosko) y deriva directamente de `OpenYourMind/gemma-4-12B-it-abliterated-uncensored`, que a su vez es una versión abliterada del Gemma 4 12B instruct original de Google. El modelo está empaquetado específicamente para Apple Silicon y se ejecuta con la librería `mlx-vlm`.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo de ~12B parámetros de forma local en un Mac con 24-32 GB de memoria unificada, sin nube ni claves de API; por otro, la abliteración elimina los rechazos ante peticiones benignas pero incómodas, algo relevante para flujos de trabajo creativos o de investigación que no encajan en los filtros por defecto. El repositorio ocupa 11,0 GB y contiene 11.959.730.224 parámetros reales en safetensors.

Es relevante ahora porque forma parte del ecosistema creciente de inferencia local en Apple Silicon (MLX, `mlx-lm`, `mlx-vlm`) y porque se integra como drop-in en la pila `claude-code-local`, que ejecuta Claude Code íntegramente en el dispositivo mediante un servidor compatible con la API de Anthropic. La licencia es la Gemma de Google, no una licencia permisiva genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (unified), transformer decoder-only; conversión con `mlx-vlm` |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | safetensors en formato MLX; librería `mlx` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 en su variante "unified", un transformer decoder-only de ~12B parámetros. El modelo original fue entrenado por Google; la cadena de derivación es: Gemma 4 12B instruct → abliteración por OpenYourMind → cuantización 4-bit MLX por divinetribe. La model card indica que la conversión se realizó con `mlx-vlm`, lo que sugiere que el pipeline de conversión está orientado a modelos multimodales o unificados, aunque las capacidades de visión no se documentan explícitamente en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la *abliteration*: una modificación de los pesos que suprime la dirección de rechazo aprendida, de modo que el modelo no se niega ante peticiones benignas pero "edgy". El autor advierte explícitamente que esto no es una mejora de capacidades, sino una alteración del comportamiento de rechazo. La cuantización usa group size 64, un compromiso habitual en MLX entre calidad y tamaño.

## Capacidades

- Generación de texto conversacional con instrucciones (pipeline `text-generation`).
- Razonamiento y respuesta multi-turno en inglés.
- Ejecución local en Apple Silicon mediante MLX (`mlx-vlm`, `mlx-lm`).
- Comportamiento sin rechazos ante peticiones benignas pero incómodas (abliterated).
- Integración como backend en la pila `claude-code-local` a través de un servidor compatible con la API de Anthropic.
- Capacidades de visión: no confirmadas en la información disponible (la conversión con `mlx-vlm` lo sugiere, pero la model card no lo detalla).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes multi-paso: indirecto, vía su uso en `claude-code-local` y el leaderboard Agent-12.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.

## Casos de uso

- Asistente de código local en Mac: el modelo se integra como drop-in en `claude-code-local`, apuntando la variable `MLX_MODEL` al repositorio, de modo que Claude Code se ejecuta 100% en el dispositivo sin enviar código a la nube. Adecuado para entornos con requisitos de privacidad estrictos.
- Desarrollo en portátiles Apple Silicon de gama media: con 11 GB de pesos cabe en un Mac de 24-32 GB de memoria unificada, lo que permite trabajar con un LLM de 12B en un MacBook Pro sin GPU dedicada.
- Prototipado de agentes locales: el leaderboard Agent-12 evalúa tareas de agente reales juzgadas por el sistema de ficheros, y este modelo figura como uno de los "fighters"; útil para comparar su comportamiento agéntico frente a otros modelos locales.
- Generación de texto creativo sin filtros: la abliteración permite escribir ficción, guiones o contenido con temáticas sensibles sin rechazos automáticos, manteniendo la coherencia de un modelo instruct de 12B.
- Investigación sobre alineación y rechazo: permite estudiar empíricamente cómo la abliteración afecta al comportamiento del modelo comparándolo con el Gemma 4 12B original, en un entorno reproducible y local.
- Inferencia offline en campo: escenarios sin conectividad (auditorías, trabajo de campo, entornos air-gapped) donde se necesita un modelo conversacional razonablemente capaz sin depender de APIs externas.
- Automatización de tareas de texto por lotes: al ejecutarse con MLX de forma local, se puede usar para resumir, reescribir o clasificar documentos en lotes sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~11 GB solo para los pesos en 4 bits; con overhead de contexto y KV cache, se recomienda un mínimo de 16 GB y un objetivo cómodo de 24-32 GB de memoria unificada.
- El autor indica que funciona "holgadamente en un Mac de 32 GB" y "feliz en un Mac de 24 GB"; el modelo de 31B de la misma familia es "ajustado" en 32 GB.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; no está pensado para GPUs NVIDIA/AMD, ya que el formato es MLX.
- Cabe en GPU consumer: no aplica en el sentido tradicional; cabe en Macs consumer con 24 GB o más de memoria unificada.
- Opciones de despliegue: `mlx-vlm` (`python -m mlx_vlm.generate`), `mlx-lm`, y la pila `claude-code-local` con servidor compatible con la API de Anthropic.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/gemma-4-12B-it-abliterated-4bit-mlx | ~12B | no disponible | MLX safetensors 4-bit | gemma | Hugging Face, 1.481 descargas |
| OpenYourMind/gemma-4-12B-it-abliterated-uncensored | ~12B | no disponible | safetensors (pre-cuantización) | gemma | Hugging Face (modelo base) |
| Gemma 4 12B instruct (original de Google) | ~12B | no disponible | safetensors, GGUF, etc. | gemma | Hugging Face / Google |
| divinetribe (tier 31B de la misma colección) | ~31B | no disponible | MLX 4-bit | gemma | Hugging Face, requiere ~32 GB |

La comparativa se limita a la cadena de derivación del propio modelo, ya que la información proporcionada no incluye datos de rendimiento de alternativas de otros fabricantes. La diferencia clave frente al modelo base es el formato MLX 4-bit (menor huella, ejecución en Apple Silicon) y frente al original de Google, la abliteración.

## Limitaciones y advertencias

- La abliteración suprime los rechazos, pero no mejora las capacidades; puede aumentar la probabilidad de generar contenido inapropiado o inseguro si se usa sin supervisión.
- Riesgo de alucinación inherente a un modelo de 12B; no se han publicado evaluaciones de fidelidad en la información disponible.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificación empírica.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribución; la abliteración no exime de cumplirlas.
- Formato MLX: no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin reconversión.
- La model card incluye estadísticas "live" (estrellas, descargas) que pueden no ser verificables ni estar actualizadas; tratarlas con cautela.
- El autor advierte explícitamente: "Use it responsibly".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- MLX: https://github.com/ml-explore/mlx
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Software del autor: https://nicedreamzwholesale.com/software/
- GitHub Sponsors: https://github.com/sponsors/nicedreamzapp
