# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx

## Resumen

gemma-4-12B-it-abliterated-4bit-mlx es una conversión cuantizada a 4 bits en formato MLX de un Gemma 4 12B instruction-tuned sometido a *abliteration*, una técnica de edición de pesos que suprime la dirección interna de rechazo del modelo. El resultado es un modelo de 11.959.730.224 parámetros (≈12B) que genera texto sin las negativas habituales ante peticiones benignas pero incómodas. Lo publica divinetribe, que se limita a convertir y cuantizar; la abliteración original es de OpenYourMind y el modelo base subyacente es de Google (familia Gemma).

El interés práctico está en el objetivo de despliegue: es un build nativo para Apple Silicon pensado para ejecutarse en local en un MacBook con 24-32 GB de memoria unificada, sin cloud ni claves de API. Se integra en la librería `mlx`/`mlx-vlm` y está diseñado como pieza intercambiable del stack claude-code-local, un servidor local compatible con la API de Anthropic. La licencia es la Gemma de Google, con las restricciones de uso que esta impone.

La relevancia es acotada pero específica: cubre el nicho de inferencia on-device en Mac para tareas de agente y conversación, con un modelo de 12B cuantizado a 4 bits que ocupa 11 GB en disco. No aporta mejoras de capacidad respecto al modelo base; la abliteración elimina rechazos, no añade conocimiento ni razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (unified), transformer denso; conversión vía mlx-vlm |
| Parametros totales | 11.959.730.224 (≈12B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX); safetensors cuantizados |
| Idiomas soportados | inglés (`en`) |
| Licencia | Gemma (Google) |
| Formato de pesos | safetensors (MLX, 4-bit); repo de 11,0 GB |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 12B instruction-tuned, es decir, un transformer denso de la familia Gemma 4 en su variante "unified". Sobre ese checkpoint, OpenYourMind aplicó *abliteration*: una intervención sobre los pesos que identifica y atenúa la dirección latente asociada a rechazos, de modo que el modelo deja de activar respuestas de negativa ante peticiones benignas pero sensibles. Esta edición no conlleva reentrenamiento ni datos adicionales; es una modificación post-hoc de los pesos.

divinetribe realizó después la conversión a MLX y la cuantización a 4 bits con group size 64, usando mlx-vlm como herramienta de conversión. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset original, ni si hubo RLHF/DPO en el modelo base; esos datos pertenecen a la model card de Google para Gemma 4 y no se reproducen aquí. Tampoco se detalla ninguna innovación de decodificación o atención específica de esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general y respuesta a instrucciones (variante instruction-tuned).
- Generación de código y uso como modelo de agente local dentro de claude-code-local.
- Integración con tool calling / function calling heredada del modelo base (no verificada explícitamente en la model card de esta conversión).
- Ejecución totalmente on-device en Apple Silicon mediante MLX, sin dependencia de API externa.
- Comportamiento "sin rechazos" ante peticiones benignas pero incómodas, gracias a la abliteración.
- Capacidad multimodal potencial por la conversión con mlx-vlm y la arquitectura "unified", aunque la model card no la detalla ni la confirma.

## Casos de uso

- Asistente de código local en Mac: se carga con `mlx_lm`/`mlx-vlm` y se apunta como backend de claude-code-local, permitiendo autocompletado y edición de código sin enviar el código a ningún servicio externo.
- Agente de desarrollo on-device: al ser un modelo de 12B en 11 GB, encaja en MacBooks de 24-32 GB y puede sostener tareas de agente de varios pasos con latencia local predecible.
- Conversación y prototipado de prompts: útil para iterar sobre prompts y flujos conversacionales en inglés sin coste de API ni límites de cuota.
- Investigación sobre abliteration: sirve como punto de comparación controlado frente al modelo base sin abliterar para estudiar el efecto de la supresión de rechazos en la distribución de respuestas.
- Privacidad de datos: escenarios donde el texto no puede salir del dispositivo (borradores internos, notas personales) y se requiere inferencia local.
- Pruebas de robustez y seguridad: al eliminar los rechazos, es útil para auditar cómo se comporta un modelo sin salvaguardas conductuales y para diseñar capas de moderación externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 11 GB de pesos en disco; en Apple Silicon se comparte memoria unificada, por lo que se recomienda un Mac con 24 GB o más (la model card indica que funciona "cómodamente" en 32 GB).
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4) con memoria unificada suficiente; no es un build CUDA, por lo que no está pensado para A100, H100 ni RTX 4090.
- Consumer GPU: no aplica en el sentido NVIDIA; el equivalente consumer es un MacBook con 24-32 GB de RAM unificada.
- Despliegue: `mlx-vlm` (`python -m mlx_vlm.generate`), librería `mlx`/`mlx-lm`; integrable como backend de claude-code-local vía la variable `MLX_MODEL`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| gemma-4-12B-it-abliterated-4bit-mlx (este) | ≈12B | no disponible | 4-bit MLX, group 64 | Gemma | Apple Silicon (MLX) |
| OpenYourMind/gemma-4-12B-it-abliterated-uncensored (base) | ≈12B | no disponible | pesos completos | Gemma | genérica |
| Versión 31B del roster divinetribe | ≈31B (según model card) | no disponible | 4-bit MLX | Gemma | Apple Silicon (MLX) |
| Gemma 4 12B it original (sin abliterar) | ≈12B | no disponible | varias | Gemma | genérica |

La comparación se limita a lo declarado en la model card: el modelo base sin cuantizar, la variante de 31B del mismo roster (descrita como "tight" en 32 GB) y el Gemma 4 12B it original sin abliteración. No hay datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- La abliteración suprime rechazos: el modelo puede producir contenido que el Gemma original declinaba, incluido material sensible. No hay salvaguardas conductuales integradas.
- No es una mejora de capacidad: el conocimiento, el razonamiento y la precisión factual son los del Gemma 4 12B base; la abliteración puede incluso degradar ligeramente la coherencia en algunos dominios.
- Riesgo de alucinación propio de un modelo de 12B, sin benchmarks publicados que lo acoten.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada en esta conversión; no debe asumirse la del modelo base sin verificarla.
- Licencia Gemma: uso comercial sujeto a los términos de Google para Gemma; la abliteración no altera las obligaciones de licencia.
- Cuantización 4-bit: pérdida de precisión esperable frente a los pesos completos, especialmente en tareas de matemáticas y código.
- Dependencia de plataforma: build MLX exclusivo para Apple Silicon; no ejecutable directamente en CUDA.
- Los datos de estrellas y descargas en la model card proceden de contadores en vivo y pueden no reflejar el estado actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- MLX: https://github.com/ml-explore/mlx
- Perfil Hugging Face del publicador: https://huggingface.co/divinetribe
