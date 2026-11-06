# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch02

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch02` es un checkpoint experimental de investigación desarrollado por el usuario `g-assismoraes`, derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama-2-7b-chat sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo implementa una técnica de *machine unlearning* orientada a eliminar el conocimiento de un subconjunto concreto de datos (partición "forget10", es decir, el 10 % de los datos de olvido) sin degradar el rendimiento sobre el resto de datos retenidos.

La arquitectura subyacente es un transformer decoder-only de tipo Llama-2 con 6.738.415.616 parámetros totales, contexto nativo de 4.096 tokens y licencia Llama 2. La innovación del checkpoint reside en la estrategia de reinicialización: los *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. El entrenamiento combina una pérdida de *token-level inverse Hessian learning* (IHL) sobre el conjunto de olvido con una entropía cruzada (CE) ponderada con factor 1,0 sobre el conjunto de retención.

Este checkpoint corresponde a la época 2 de un total de 20 y forma parte de un estudio más amplio sobre desaprendizaje en modelos de lenguaje. Su relevancia es fundamentalmente académica: permite evaluar si técnicas de segundo orden (IHL) combinadas con reinicialización selectiva de capas de entrada y salida logran borrar memorias específicas manteniendo la utilidad general del modelo. No está pensado para uso en producción ni para aplicaciones de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia Llama-2, con 7.000 millones de parámetros nominales (6,74 mm reales en safetensors), atención multi-cabeza con RoPE y normalización RMSNorm. No incorpora innovaciones arquitectónicas propias: la estructura es idéntica a la de Llama-2-7b-chat. La particularidad está en el proceso de entrenamiento, no en la topología.

El procedimiento de ajuste combina dos componentes. Por un lado, se aplica una pérdida de *token-level inverse Hessian learning* (IHL) sobre la partición de olvido `forget10` del benchmark TOFU, que penaliza la probabilidad asignada a los tokens de los ejemplos que deben olvidarse. Por otro, se añade una pérdida de entropía cruzada estándar sobre el conjunto de retención con peso 1,0, para preservar el conocimiento legítimo. La inicialización de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf` ("reset both") contrasta con los pesos del resto de capas, que se mantienen del modelo base `locuslab/tofu_ft_llama2-7b`. El checkpoint publicado corresponde a la época 2 de 20, por lo que representa un estado intermedio del proceso de desaprendizaje.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama-2-7b-chat.
- Razonamiento conversacional multi-turno dentro de la ventana de 4.096 tokens.
- Capacidad de seguir instrucciones y responder en formato diálogo (herencia del ajuste chat).
- No dispone de *tool calling* nativo ni de soporte de agentes.
- No dispone de *thinking mode*, visión, audio ni modalidades adicionales.
- Capacidades multilingües limitadas al inglés según la model card.
- El comportamiento esperado es que el modelo haya "olvidado" parcialmente los ejemplos de la partición `forget10` de TOFU, aunque esta propiedad debe verificarse empíricamente (no se publican métricas de olvido en la información disponible).

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que evalúan la eficacia de IHL combinada con reinicialización de embeddings y LM head frente a otras técnicas (gradient ascent, preference optimization, etc.) sobre el benchmark TOFU.
- Reproducción de experimentos académicos: permite reproducir la época 2 del pipeline descrito en `ihl_manifest.json` y comparar curvas de olvido/retención a lo largo de las 20 épocas.
- Auditoría de privacidad: analizar si el modelo retiene o filtra información de los ejemplos de olvido mediante ataques de extracción de membresía o *prompting* dirigido.
- Estudio de la dinámica de reinicialización: comparar el efecto de reinicializar embeddings y LM head ("reset both") frente a otras variantes del mismo autor sobre la estabilidad del olvido.
- Evaluación de la degradación de utilidad: medir la pérdida de rendimiento general (perplejidad en datos retenidos, tareas de sentido común) causada por la pérdida IHL con peso CE 1,0.
- Docencia y formación: material de ejemplo para cursos sobre alineación, privacidad diferencial y desaprendizaje en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB de pesos más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 16 GB de VRAM.
- En cuantización de 8 bits (bitsandbytes): ~7 GB de VRAM.
- En cuantización de 4 bits (bitsandbytes o GPTQ, si se genera): ~4 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S, RTX A6000 para fp16 sin compromisos; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto de hasta 4.096 tokens; en RTX 3080/4070 (10-12 GB) solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` + `accelerate`, vLLM, TGI, llama.cpp (requiere conversión a GGUF, no publicada), Ollama (requiere GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch02` | 6,74 mm | 4.096 | Llama 2 | Hugging Face (0 descargas) | Checkpoint época 2/20, unlearning IHL |
| `locuslab/tofu_ft_llama2-7b` | 6,74 mm | 4.096 | Llama 2 | Hugging Face | Modelo base ajustado con TOFU, sin olvido |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 mm | 4.096 | Llama 2 | Hugging Face | Llama-2-7b-chat reempaquetado en formato HF |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 mm | 4.096 | Llama 2 | Hugging Face | Modelo original de Meta |

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso en producción ni para aplicaciones de usuario final.
- Riesgo de alucinación: heredado de Llama-2-7b-chat; el proceso de *unlearning* puede incrementar la incoherencia en dominios relacionados con los datos olvidados.
- Sesgos conocidos: los sesgos de Llama-2-7b-chat (género, raza, religión, etc.) persisten en el checkpoint, ya que solo se modifican embeddings, LM head y se aplica una pérdida de olvido acotada.
- Limitación idiomática: solo inglés según la model card.
- Eficacia del olvido no verificada: no se publican métricas de *forget quality* ni de *retain quality*; la afirmación de que el modelo "olvida" la partición `forget10` debe comprobarse empíricamente.
- Restricciones de licencia: Llama 2 Community License; uso comercial permitido con condiciones (límite de 700 millones de usuarios mensuales, obligación de atribución, restricciones de uso aceptable). Verificar la licencia completa antes de cualquier despliegue.
- Checkpoint intermedio: la época 2 de 20 puede no representar el estado final del proceso de desaprendizaje; para evaluaciones rigurosas conviene comparar con las épocas finales del mismo autor.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
