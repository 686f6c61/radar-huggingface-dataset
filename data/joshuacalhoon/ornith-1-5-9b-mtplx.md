# JoshuaCalhoon/Ornith-1.5-9B-MTPLX

## Resumen

Ornith-1.5-9B-MTPLX es una variante cuantizada y optimizada para Apple Silicon del modelo Ornith-1.5-9B, desarrollada por JoshuaCalhoon. Su principal novedad es la integración de la técnica MTPLX (multi-token prediction), que permite decodificar varios tokens a la vez y ofrece un incremento del 11 % en velocidad con respecto a la versión autoregresiva original. El modelo mantiene los aproximadamente 8,95 mil millones de parámetros de su base y se distribuye cuantizado a 3 bits, ocupando 5,1 GB en disco. Está enfocado al ecosistema MLX, por lo que se ejecuta de forma eficiente en ordenadores Mac con Apple Silicon, habiendo sido verificado en un Apple M5 Pro.

Desde el punto de vista técnico, se trata de un modelo denso, no de tipo MoE, y su arquitectura parece estar relacionada con la familia Qwen3.5, aunque no hay confirmación oficial al respecto. Se publica con formato de pesos safetensors y su repositorio incluye instrucciones de uso a través del runtime MTPLX. La relevancia de este modelo es menor en términos de adopción, pero resulta interesante como experimento de predicción multi-token aplicado a hardware local de Apple, ya que ilustra el efecto de la cuantización extrema combinada con técnicas de decodificación acelerada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren qwen3_5) |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README remite a un archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ornith-ai/Ornith-1.5-9B`, un modelo denso de aproximadamente 9 mil millones de parámetros. Esta variante se genera con MTPLX Forge, un sistema que adapta el modelo original para realizar predicción de múltiples tokens (MPT) durante la decodificación. El autor indica que la mejor profundidad obtenida es D1, lo que significa que el modelo predice un token adicional más allá del token actual en cada paso.

No se ha proporcionado información sobre los datos de entrenamiento, el número de tokens utilizados ni sobre técnicas como RLHF o DPO. Los tags de HuggingFace sugieren una arquitectura tipo qwen3_5, pero no hay confirmación oficial. La cuantización a 3 bits y el peso del repositorio (5,1 GB) indican que el modelo ha sido optimizado para reducir su huella de memoria y facilitar su ejecución en Apple Silicon.

## Capacidades

- Generación de texto conversacional: la model card incluye el comando `mtplx start chat`, lo que indica que el modelo puede utilizarse como chatbot local.
- Decodificación multi-token: gracias a MTPLX, es capaz de generar más de un token por paso, acelerando la inferencia en Apple Silicon.
- Optimización para MLX: los pesos están en un formato compatible con el runtime MTPLX y MLX, adecuado para Apple Silicon.
- Cuantización a 3 bits: reduce el uso de memoria a 5,1 GB, lo que facilita su ejecución en equipos con memoria unificada limitada.
- No se ha documentado soporte oficial para tool calling, visión, matemáticas avanzadas ni generación de código.
- No se dispone de información sobre capacidades multilingües más allá del uso genérico como chat.

## Casos de uso

- Asistente local de chat en macOS: el modelo se puede ejecutar con `mtplx start chat` para mantener conversaciones sin conexión en un Mac con Apple Silicon, gracias a su bajo coste de memoria (5,1 GB).
- Prototipado rápido de aplicaciones de texto en MLX: los desarrolladores pueden integrarlo en sus proyectos usando MTPLX, aprovechando la compatibilidad nativa con el ecosistema de Apple.
- Evaluación de técnicas de predicción multi-token: al estar cuantizado a 3 bits, es un candidato útil para comparar el efecto de la cuantización junto con MPT en la velocidad y calidad de la salida.
- Despliegue en equipos de desarrollo sin GPU dedicada: los Macs con Apple Silicon (M5 Pro, M4, etc.) pueden ejecutarlo con el runtime MTPLX, sin necesidad de tarjetas gráficas externas.
- Análisis de la degradación por cuantización extrema: al existir variantes sin cuantizar o de 8 bits del mismo modelo base, se puede estudiar la pérdida de fidelidad entre versiones.
- Generación de texto en entornos de investigación donde se requiere un modelo compacto para experimentos con MLX, especialmente en tareas de conversación y prototipado rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card recoge una verificación de velocidad de decodificación: multiplicador de 1,11× frente al modelo autoregresivo original, medido en Apple M5 Pro con la configuración de sampler temperatura 0,6, top_p 0,95 y top_k 20.

## Requisitos de hardware

- Memoria: el repositorio ocupa 5,1 GB en formato safetensors de 3 bits. Al ser un modelo para MLX, se recomienda ejecutarlo en la memoria unificada de Apple Silicon.
- GPU/CPU: diseñado específicamente para Apple Silicon. Verificado en Apple M5 Pro, por lo que se recomienda un Mac con chip M5 Pro o superior. No se proporcionan requisitos para GPUs NVIDIA ni AMD.
- Opciones de despliegue: runtime MTPLX (`mtplx pull` y `mtplx start chat`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia.
- Latencia y throughput: no se disponen de medidas absolutas; solo el multiplicador relativo de 1,11× frente a una línea base autoregresiva en Apple M5 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JoshuaCalhoon/Ornith-1.5-9B-MTPLX | ~8,95B | no disponible | 3 bits | 5,1 GB | no disponible | HuggingFace |
| Artie101/Ornith-1.5-9B-8bit-MTPLX | ~9B | no disponible | 8 bits | no disponible | no disponible | HuggingFace |
| ornith-ai/Ornith-1.5-9B-MLX-8bit | ~9B | no disponible | 8 bits | no disponible (modelo base en bf16: ~19 GB) | no disponible | HuggingFace |

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o comportamiento en idiomas distintos del inglés.
- La licencia no está definida en la información disponible; el README remite a un archivo LICENSE no accesible, lo que impide confirmar el uso comercial.
- La cuantización a 3 bits puede suponer una pérdida de calidad y precisión en comparación con representaciones de 8 o 16 bits.
- El modelo está pensado para el ecosistema MLX de Apple; no se documenta su ejecución en Linux, Windows o GPUs NVIDIA, lo que limita su portabilidad.
- Al tratarse de una publicación con 0 descargas y 0 likes, es un proyecto experimental sin información de soporte ni documentación técnica adicional.
- No se dispone de datos de contexto ni de idiomas soportados, lo que condiciona el uso en tareas que requieran ventanas de contexto largas o multilingüismo.

## Enlaces

- HuggingFace: https://huggingface.co/JoshuaCalhoon/Ornith-1.5-9B-MTPLX
- MTPLX Forge: https://github.com/youssofal/MTPLX
- Variante 8 bits de Artie101: https://huggingface.co/Artie101/Ornith-1.5-9B-8bit-MTPLX
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-8bit
