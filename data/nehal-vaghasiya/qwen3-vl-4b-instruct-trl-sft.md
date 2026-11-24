# nehal-vaghasiya/Qwen3-VL-4B-Instruct-trl-sft

## Resumen

`nehal-vaghasiya/Qwen3-VL-4B-Instruct-trl-sft` es un adaptador LoRA entrenado mediante supervisión (SFT) con TRL sobre el modelo multimodal `Qwen/Qwen3-VL-4B-Instruct`. No se trata de un modelo completo, sino de un checkpoint de adaptador PEFT de rango 32 que debe combinarse con los pesos base de Qwen para funcionar. El repositorio ocupa aproximadamente 0,1 GB, coherente con un adaptador LoRA y no con un modelo de 4.000 millones de parámetros.

El modelo base, Qwen3-VL-4B-Instruct, es un transformer multimodal de la familia Qwen3-VL desarrollado por Alibaba Qwen, capaz de procesar entradas de imagen y texto y generar respuestas conversacionales. Este adaptador concreto ha sido publicado por el usuario nehal-vaghasiya y está orientado a ajuste fino supervisado sobre esa base, con capas objetivo que cubren atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y MLP (`gate_proj`, `up_proj`, `down_proj`).

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigación sin descargas ni validación pública, con dominio de adaptación, grado de entrenamiento y efecto real sobre el modelo base sin verificar. Resulta útil como ejemplo de flujo de trabajo LoRA + TRL sobre modelos vision-language, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL; adaptador de rango 32, alpha 32, dropout 0 |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct tiene ~4.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, valor no confirmado) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | No verificada para el adaptador; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Capas objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Libreria | PEFT (registrada como `peft`), entrenado con TRL 0.26.0 |
| Software registrado | Transformers 4.57.3, PyTorch 2.9.0+cu126, PEFT config 0.18.0 |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-4B-Instruct, un transformer multimodal que procesa tokens de imagen y de texto en una única secuencia y genera respuestas mediante decodificación autorregresiva. El ajuste se realizó con TRL en modo SFT (supervised fine-tuning) y PEFT LoRA con rango 32 y alpha 32, sin dropout, cubriendo las proyecciones de atención y las capas MLP del transformer. No se especifica si se congelaron los módulos visuales, el proyector multimodal o el tokenizador de imagen.

No se dispone de información sobre el dataset de entrenamiento: ni número de ejemplos, ni composición, ni número de tokens, ni si hubo etapas de preferencia (DPO/RLHF) posteriores. Tampoco se documenta la duración del entrenamiento, la configuración de hiperparámetros (learning rate, batch size, scheduler) ni el estado de convergencia. La model card advierte explícitamente que el dominio de adaptación y la finalización del entrenamiento están sin verificar, por lo que no es posible afirmar qué comportamiento diferencial introduce el adaptador respecto a la base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-VL-4B-Instruct.
- Comprensión de imágenes y respuesta en formato image-text-to-text, incluyendo descripción de detalles visuales.
- Instrucciones multimodales: el adaptador acepta mensajes con contenido mixto imagen + texto mediante `apply_chat_template`.
- Ajuste fino supervisado sobre las proyecciones de atención y MLP, potencialmente orientado a un dominio específico no documentado.
- Capacidades de tool calling, agentes, matemáticas o código: no documentadas para este adaptador; dependerían del modelo base y no están verificadas.
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas.
- Modo thinking, audio o vídeo: no documentados.

## Casos de uso

- Experimentación con fine-tuning LoRA multimodal: el adaptador sirve como referencia de configuración (rango 32, capas objetivo, versiones de TRL/PEFT/Transformers) para reproducir un pipeline SFT sobre Qwen3-VL.
- Investigación académica sobre adaptación de modelos vision-language: permite estudiar cómo un LoRA de bajo rango modifica el comportamiento de un modelo de 4B en tareas de descripción de imágenes, siempre con evaluación controlada.
- Prototipado de asistentes de imagen en entornos de laboratorio: cargando base + adaptador con `PeftModel.from_pretrained`, se puede probar la generación de descripciones y respuestas sobre imágenes en un notebook con GPU consumer.
- Evaluación comparativa base vs. adaptador: útil para medir la deriva de comportamiento y el riesgo de alucinación visual introducido por el ajuste, mediante conjuntos de prueba propios.
- Docencia y formación técnica: ejemplo práctico de cómo se estructura un repositorio PEFT (safetensors + configuración) y de cómo se compone con el modelo base en código.
- Base para iteraciones posteriores: punto de partida para continuar el entrenamiento o fusionar el adaptador con los pesos base y evaluar su viabilidad antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa ~0,1 GB, pero requiere cargar el modelo base Qwen3-VL-4B-Instruct completo. En precisión BF16/FP16 se estiman aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y procesador de imagen; en cuantización de 8 bits o 4 bits (si se aplica al base) bajaría a rangos de 5-7 GB y 3-4 GB respectivamente, aunque estas cifras no están confirmadas en la información disponible.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o L40S para inferencia cómoda en BF16; RTX 3090 (24 GB) también viable.
- GPU consumer: sí, previsiblemente en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y posiblemente en GPUs de 12 GB con cuantización agresiva del base; no verificado.
- Opciones de despliegue: carga vía `transformers` + `peft` (flujo documentado en la model card); para servir en producción habría que fusionar el adaptador (`merge_and_unload`) y desplegar con vLLM, TGI o llama.cpp/GGUF tras conversión, aunque la compatibilidad con vLLM de Qwen3-VL y de adaptadores LoRA no está documentada aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nehal-vaghasiya/Qwen3-VL-4B-Instruct-trl-sft (este) | Adaptador LoRA sobre ~4B | No disponible | Imagen + texto | No verificada (base Apache-2.0) | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | No disponible en esta ficha | Imagen + texto | Apache-2.0 | Hugging Face, oficial |
| Qwen2.5-VL-3B-Instruct | ~3B | No disponible en esta ficha | Imagen + texto | Apache-2.0 (según versión) | Hugging Face, oficial |
| Llama 3.2 11B Vision Instruct | ~11B | No disponible en esta ficha | Imagen + texto | Llama Community License | Hugging Face, oficial |

La comparación relevante es contra el propio modelo base: este adaptador no aporta parámetros nuevos significativos (0,1 GB frente a varios GB del base) y su valor depende enteramente de un ajuste cuyo efecto no está documentado ni validado con benchmarks.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar Qwen/Qwen3-VL-4B-Instruct para funcionar; sin el base, el repositorio no es utilizable.
- Dominio de adaptación, dataset y finalización del entrenamiento no verificados; el efecto real frente al base es desconocido.
- Riesgo de alucinación de detalles visuales e incumplimiento inconsistente de instrucciones, advertido por el propio autor.
- Licencia del adaptador no verificada; aunque el base es Apache-2.0, el uso comercial del adaptador requiere confirmación legal previa.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Sin descargas ni likes, sin benchmarks y sin validación comunitaria: no hay evidencia de calidad.
- El ejemplo de carga de la model card no ha sido ejecutado contra el adaptador según el propio autor; posibles incompatibilidades de versiones (TRL 0.26.0, Transformers 4.57.3, PEFT 0.18.0).
- No apto para tareas consecuentes sin revisión humana, tal como indica la model card.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nehal-vaghasiya/Qwen3-VL-4B-Instruct-trl-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Perfil del autor: https://huggingface.co/nehal-vaghasiya
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (SFT): https://huggingface.co/docs/trl/sft_trainer
