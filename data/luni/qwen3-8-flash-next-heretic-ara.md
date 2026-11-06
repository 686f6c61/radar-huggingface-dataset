# Luni/Qwen3.8-Flash-Next-Heretic-ARA

## Resumen
Qwen3.8-Flash-Next-Heretic-ARA es un fine-tune del modelo Qwen/Qwen3.8-Flash-Next publicado por el usuario Luni en Hugging Face. Se trata de una variante "decensored" (abliterated) generada con la herramienta Heretic 2.0 mediante la modificacion ARA (Arbitrary-Rank Ablation), que aplica una ablacion de rango arbitrario con LoRA de rango 50 fusionada directamente en los pesos. El objetivo declarado es reducir la tasa de rechazos del modelo base manteniendo al mismo tiempo una divergencia KL baja respecto al original en prompts inocuos.

El modelo conserva la arquitectura del base: un transformer Mixture-of-Experts (MoE) con capacidades multimodales (pipeline image-text-to-text), atencion hibrida con proyecciones `linear_attn` y cabezas MTP (multi-token prediction), y un total de 177.392.830.576 parametros en bf16. El repositorio ocupa 360 GB y esta pensado para despliegues en hardware de gama muy alta, no para GPUs de consumo.

Su relevancia es doble: por un lado, documenta un caso practico de ablacion selectiva de rechazos sobre un modelo MoE multimodal de gran tamano; por otro, sirve como referencia para quienes necesitan un modelo sin filtros de rechazo para investigacion sobre alineacion, evaluacion de sesgos o generacion creativa sin restricciones. La licencia es la qwen-community-1.0, lo que impone condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con atencion hibrida (`self_attn` + `linear_attn`) y cabeza MTP |
| Parametros totales | 177.392.830.576 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos completos); version EXL3 publicada por el autor |
| Idiomas soportados | en, de, multilingual |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next es un transformer MoE multimodal con un diseno de atencion hibrida: combina capas de atencion estandar (`self_attn`) con capas de atencion lineal (`linear_attn`), lo que sugiere un esquema orientado a eficiencia en contextos largos. Incluye ademas una cabeza MTP (multi-token prediction) para decodificacion especulativa, un encoder de vision (pipeline image-text-to-text), tablas de embeddings n-gram y un conjunto de expertos enrutados con un router y un experto compartido (`mlp.shared_expert`).

El fine-tune no reentrena el modelo: aplica Heretic 2.0 con ARA (Arbitrary-Rank Ablation), un LoRA de rango 50 que se fusiona en los pesos. Las modificaciones se limitan a las proyecciones de salida de atencion (`self_attn.o_proj` y `linear_attn.out_proj`) y a `mlp.shared_expert.down_proj`, en las capas 16 a 47. Permanecen intactos los expertos enrutados, el router, la cabeza MTP, el encoder de vision, las tablas de embeddings n-gram, los embeddings, el `lm_head`, el tokenizer y la plantilla de chat. Los hiperparametros del proceso fueron: preserve 0.748, steer 0.0002, overcorrect 1.277 y k = 11. El entrenamiento se ejecuto en 2x NVIDIA B300 SXM6 (267 GB cada una) en bf16, con unas 5 horas para 200 trials. No se especifican los datos de entrenamiento del base ni el volumen de tokens.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles, aleman y otros idiomas (multilingual).
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto de entrada (image-text-to-text), gracias al encoder de vision conservado.
- Generacion multimodal condicionada por imagen, con salida textual.
- Tool calling y function calling: no confirmado en la informacion disponible, aunque el pipeline y el formato de chat del base lo permiten.
- Razonamiento multi-paso y uso como agente: no confirmado explicitamente en la model card.
- Decodificacion especulativa mediante la cabeza MTP conservada.
- Modo "sin rechazos": la ablacion reduce las negativas del modelo base de 40/100 a 6/100 en un conjunto de 100 prompts reservados.
- Capacidades multilingues limitadas a los idiomas declarados (en, de, multilingual); no se detalla cobertura adicional.

## Casos de uso
- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo y la distribucion de respuestas tras una ablacion selectiva, comparando con el base y midiendo la divergencia KL (0.191 en prompts inocuos).
- Evaluacion de sesgos y robustez: al eliminar parte de los filtros de rechazo, sirve para probar hasta que punto el modelo base dependia de negativas aprendidas y como se comporta en dominios sensibles bajo supervision humana.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tratar temas adultos o controvertidos, donde el base rechazaria peticiones legitimas.
- Analisis de documentos con imagen: al conservar el encoder de vision y el pipeline image-text-to-text, puede extraer y resumir informacion de capturas, diagramas o documentos escaneados en ingles y aleman.
- Red teaming de sistemas propios: usar la variante abliterated como adversario para probar las defensas de un clasificador o de un filtro de moderacion desplegado en produccion.
- Experimentacion con cuantizacion extrema: la version EXL3 publicada permite evaluar el impacto de la cuantizacion en un MoE de 177B parametros sobre calidad y tasa de rechazo.
- Fine-tuning posterior sobre dominios especializados: al no haberse tocado router, expertos enrutados ni embeddings, es una base razonable para adaptaciones con LoRA en tareas verticales.

## Benchmarks y rendimiento

| Metrica | Base | Este modelo |
|---|---|---|
| Rechazos en 100 prompts reservados | 40/100 | 6/100 |
| Divergencia KL respecto al base (prompts inocuos) | 0 | 0.191 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 355 GB solo para pesos (177.392.830.576 parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica requiere multiples GPUs de gama alta.
- El autor reporta el uso de 2x NVIDIA B300 SXM6 de 267 GB cada una para el proceso de ablacion, lo que da una idea del orden de magnitud necesario.
- GPUs recomendadas: NVIDIA B300, H100/H200 o A100 de 80 GB en configuraciones multi-GPU (4-8 unidades segun cuantizacion y contexto).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en bf16; con cuantizacion EXL3 de 4 bits podria reducirse a ~90-100 GB, aun fuera del alcance de una sola GPU consumer.
- Opciones de despliegue: transformers (formato nativo safetensors), exllamav3 con la version EXL3, y potencialmente vLLM/TGI si el soporte para la arquitectura del base esta disponible (no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Heretic-ARA | 177,4B (MoE) | no disponible | qwen-community-1.0 | Fine-tune abliterated, multimodal, 6/100 rechazos |
| Qwen/Qwen3.8-Flash-Next (base) | 177,4B (MoE) | no disponible | qwen-community-1.0 | Modelo original, 40/100 rechazos, sin ablacion |
| Luni/Qwen3.8-Flash-Next-Heretic-ARA-EXL3 | 177,4B (MoE) | no disponible | qwen-community-1.0 | Version cuantizada EXL3 del mismo fine-tune |
| Otras variantes abliterated de Qwen | no disponible | no disponible | variable | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- La ablacion elimina parte de los mecanismos de rechazo, lo que puede producir respuestas a peticiones daninas, ilegales o eticamente problematicas; no es apto para despliegues publicos sin moderacion adicional.
- La divergencia KL de 0.191 respecto al base indica que el comportamiento no es identico al original; pueden aparecer degradaciones en tareas que dependian de las capas modificadas (16-47).
- Riesgo de alucinacion heredado del base y potencialmente agravado por la ablacion, que no fue evaluada en tareas de factualidad.
- Idiomas declarados limitados a en, de y multilingual; el rendimiento en castellano no esta verificado.
- La licencia qwen-community-1.0 impone restricciones al uso comercial; es necesario revisar el texto completo antes de cualquier despliegue productivo.
- El modelo se publico el 31 de octubre de 2026 y cuenta con 19 descargas y 0 likes, por lo que no existe validacion comunitaria significativa.
- No se han publicado datos de contexto maximo, throughput ni benchmarks estandar, lo que dificulta la planificacion de capacidad.
- El proceso de ablacion se ejecuto con solo 200 trials; la robustez del resultado en dominios no cubiertos por los prompts de evaluacion es incierta.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Luni/Qwen3.8-Flash-Next-Heretic-ARA
- Version cuantizada EXL3: https://huggingface.co/Luni/Qwen3.8-Flash-Next-Heretic-ARA-EXL3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- exllamav3: https://github.com/turboderp-org/exllamav3
