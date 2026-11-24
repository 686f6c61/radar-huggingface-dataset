# preemware/Qwen3.8-27B-RANA-abliterated

## Resumen

Qwen3.8-27B-RANA-abliterated es una variante del modelo vision-lenguaje Qwen/Qwen3.8-27B a la que se le ha eliminado la dirección de rechazo (refusal direction) mediante la técnica RANA (Reasoning-Anchored, Norm-preserving Ablation), publicada por el colectivo Abliterant bajo el identificador de autor preemware. El resultado es un modelo de 27.781.427.952 parámetros en BF16 que acepta texto e imágenes como entrada (pipeline image-text-to-text) y que, según su model card, produce contenido que el modelo base rechazaría.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de investigación sobre comportamiento de rechazo, interpretabilidad y red-teaming, no un modelo para despliegue de usuario final. Por otro lado, sirve como referencia técnica de una familia de releases (BF16, FP8, GGUF y MLX) construida sobre un transformer híbrido con atención lineal, cabeza de predicción multi-token (MTP) y una ventana declarada de 262.144 tokens.

El modelo hereda la licencia Apache-2.0 de Qwen y se distribuye en 18 shards de safetensors que ocupan aproximadamente 55,6 GB. La model card es explícita: se trata de un modelo de investigación con la alineación de seguridad eliminada, y cualquier filtrado de seguridad debe implementarse fuera del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal, cabeza MTP y torre de visión (según la model card y los nombres de tensores: `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj`, `embed_tokens`) |
| Parametros totales | 27.781.427.952 (BF16, indexados por el Hub) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 posiciones declaradas en la config; la evaluación se realizó con un límite de servicio de 20.480 tokens y un presupuesto de generación de 16.384 tokens |
| Tipos de cuantizacion | BF16 (este repo); FP8 block e4m3 (30,9 GB); GGUF de Q8_0 a IQ2_M (10,0–28,6 GB); MLX 4, 5, 6 y 8 bits más BF16 (16,1–54,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen) |
| Formato de pesos | safetensors BF16, 18 shards, ~55,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de atención completa y capas de atención lineal, más una torre de visión que procesa imágenes junto al texto. La ablación RANA actúa sobre el flujo residual: elimina una única dirección de rechazo siguiendo el planteamiento de Arditi et al., 2024, y mantiene las matrices editadas con sus normas originales. Según la model card, la receta y el código no se han publicado.

La verificación tensor a tensor contra el modelo base reporta exactamente 131 matrices modificadas y ninguna fuera de ese conjunto: 17 en `self_attn.o_proj` (16 principales más 1 de la cabeza MTP), 48 en `linear_attn.out_proj`, 65 en `mlp.down_proj` (64 principales más 1 de MTP) y 1 en `embed_tokens`. La torre de visión queda intacta (333 tensores byte a byte idénticos al base) y la cabeza MTP conserva sus 15 tensores, con sus dos escritores residuales editados del mismo modo, de forma que la decodificación especulativa sigue funcionando con una longitud de aceptación de 2,45. La dirección eliminada queda residualmente en 0,00122, frente a 0,225 en el modelo base. Una comprobación independiente con Abliterlitics (commit `9b15eb0`) aparece mencionada en la model card, aunque el texto proporcionado se interrumpe antes de detallar el resultado. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento (thinking) activado por defecto.
- Entrada de imágenes (image-text-to-text); la configuración de servicio probada limita a 1 imagen por prompt y desactiva vídeo.
- Tool calling y function calling, con parser `qwen3_coder` y auto-selección de herramienta en vLLM.
- Razonamiento multi-paso y uso en flujos de agente, incluidas llamadas a herramientas encadenadas.
- Decodificación especulativa mediante la cabeza MTP (multi-token prediction), con `num_speculative_tokens` configurable.
- Comprensión y generación multilingüe: no disponible el detalle de idiomas.
- Comportamiento de rechazo atenuado: el modelo tiende a no negarse a peticiones que el base rechazaría, lo que constituye su rasgo diferencial y su principal riesgo.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo se representa y se suprime la dirección de rechazo comparando activaciones y pesos con el modelo base, gracias a que solo 131 matrices difieren y la torre de visión es idéntica.
- Red-teaming y evaluación de robustez: generar respuestas que el modelo alineado rechaza para construir conjuntos de prueba de clasificadores de seguridad y moderadores externos.
- Estudio de ablaciones norm-preserving: replicar el protocolo de Arditi et al. sobre otras direcciones (toxicidad, sesgo) usando este modelo como control positivo de que la edición no degrada el resto de capacidades.
- Extracción de datos sintéticos para entrenamiento de filtros: producir pares prompt-respuesta no filtrados y etiquetarlos con un moderador para entrenar clasificadores de rechazo.
- Evaluación de pipelines de inferencia: probar vLLM 0.30.0 con FP8, GGUF y MLX sobre un modelo de 27B con visión y MTP, midiendo aceptación especulativa y latencia en distintas cuantizaciones.
- Análisis de robustez multimodal: comprobar si la eliminación de la dirección de rechazo en el flujo residual afecta al comportamiento ante entradas de imagen, aprovechando que la torre de visión no se ha modificado.
- Docencia y divulgación técnica: ilustrar en un taller cómo una edición lineal de bajo rango altera el comportamiento de seguridad sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas internas de la ablación: 131 matrices modificadas, 333 tensores de visión idénticos al base, componente residual de la dirección eliminada de 0,00122 frente a 0,225, y longitud de aceptación especulativa de 2,45 con MTP.

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan ~55,6 GB; con caché KV y overhead de servicio, la model card indica que cabe en una GPU de 80 GB o más.
- VRAM en FP8: ~30,9 GB de pesos, aproximadamente la mitad de memoria de pesos que BF16.
- VRAM en GGUF: de 10,0 GB (IQ2_M) a 28,6 GB (Q8_0), apto para GPUs de consumo con 12–24 GB según cuantización.
- VRAM en MLX: de 16,1 GB (4 bits) a 54,7 GB (BF16), para Apple Silicon con memoria unificada suficiente.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores para BF16; RTX 4090 (24 GB) viable con GGUF Q4/Q5 o FP8 con offload parcial; GPUs Blackwell requieren `VLLM_USE_FLASHINFER_SAMPLER=0` según la model card.
- Despliegue: vLLM 0.30.0 es el runtime probado, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'`. Para GGUF, llama.cpp; para Apple Silicon, MLX. No se mencionan TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card advierte que las peticiones técnicas largas pueden consumir 20.000–50.000 tokens de razonamiento, lo que eleva la latencia de forma notable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated | 27,78 B | 262.144 declarados (20.480 en evaluación) | Texto + imagen | Apache-2.0 | Rechazo ablacionado; BF16, FP8, GGUF y MLX |
| Qwen/Qwen3.8-27B (base) | 27,78 B | 262.144 | Texto + imagen | Apache-2.0 | Alineación intacta; referencia para comparar la ablación |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Modelo de investigación: la model card lo declara no apto para despliegue público o de usuario final sin una capa de moderación separada, porque sus rechazos han sido eliminados en gran medida.
- Riesgo de contenido dañino: al suprimir la dirección de rechazo, puede generar instrucciones, texto tóxico o material que el modelo base bloquearía; el filtrado debe hacerse fuera del modelo.
- Alucinación: no se han publicado evaluaciones de veracidad; el modo thinking activado por defecto y los razonamientos de 20.000–50.000 tokens aumentan la superficie de error en tareas largas.
- Contexto: aunque la config declara 262.144 posiciones, las evaluaciones registradas no establecen rendimiento a esa longitud; el límite probado es 20.480 tokens.
- Idiomas: no se dispone de la lista de idiomas soportados ni de evaluaciones por idioma.
- Sesgos: no se han publicado análisis de sesgo; la edición de la dirección de rechazo puede alterar de forma no uniforme el comportamiento ante distintos tipos de peticiones.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y de las condiciones de la plataforma donde se usen las salidas; la licencia no exime de responsabilidad sobre el contenido generado.
- Reproducibilidad: la receta y el código de RANA no se han publicado, por lo que la ablación no es replicable a partir de esta release.
- Multimodal: la configuración probada limita a 1 imagen por prompt y desactiva vídeo; no hay datos sobre rendimiento con múltiples imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización Abliterant: https://huggingface.co/abliterant
- Build FP8: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8
- Build GGUF: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-GGUF
- Build MLX: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-MLX
- Notas de investigación RANA: https://abliterant.ai/research/rana-refusal-ablation
- Catálogo de modelos Abliterant: https://abliterant.ai/models
- Sitio de Abliterant: https://abliterant.ai/
- Herramienta de verificación Abliterlitics: https://github.com/dreamfast/abliterlitics
