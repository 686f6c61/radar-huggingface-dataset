# mrfakename/Ling-3.2-air-abliterated

## Resumen

Ling-3.2-air-abliterated es una variante del modelo inclusionAI/Ling-3.2-air a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante ablación direccional. Lo publica mrfakename, un conocido desarrollador de la comunidad de Hugging Face especializado en modelos "abliterated" y "uncensored". El modelo base es un transformer de tipo Mixture-of-Experts (MoE) multimodal con arquitectura `bailing_moe_v3_vl`, capaz de procesar entradas de imagen y texto y generar texto.

El modelo conserva exactamente los mismos archivos y el mismo formato FP8 (bloques de 128×128) que el original, por lo que se carga en los mismos entornos (con `trust_remote_code`). La modificación consiste en proyectar fuera del flujo residual una dirección de rechazo medida empíricamente, aplicada sobre las proyecciones de salida de atención, las proyecciones down de los expertos compartidos y densos, y las proyecciones down de los 512 expertos enrutados en determinadas capas.

Es relevante porque demuestra una técnica de ablación quirúrgica sobre un modelo MoE multimodal de gran tamaño (127.900 millones de parámetros) manteniendo el formato de cuantización FP8 original y sin tocar router, embeddings, `lm_head`, torre de visión ni capa MTP. El resultado reportado reduce los rechazos del 98 % al 3 % en modo chat y al 4 % en modo think, con un KL de 0,051 sobre el primer token en prompts inocuos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`bailing_moe_v3_vl`), con capas KDA y MLA |
| Parametros totales | 127.900.654.544 (~127,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3 con escalas de bloque 128×128 (checkpoint principal); GGUF Q6_K y Q4_K_M (repositorio separado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), GGUF, LoRA GGUF (rank 1), NPZ (base de subespacio) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con arquitectura `bailing_moe_v3_vl`. Según la información de la model card, la red contiene 42 capas, con capas de atención de tipo KDA y MLA, capas densas en las posiciones 0–1, expertos compartidos (`shared_experts`) y 512 expertos enrutados (`experts.N`). Incluye además una torre de visión y una capa MTP (multi-token prediction). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La modificación "abliterated" se realizó midiendo direcciones de rechazo por separado para prompts de chat (`detailed thinking off`) y de razonamiento (`detailed thinking on`) sobre el GGUF Q6_K de bartowski, en el flujo residual a la entrada del FFN de cada capa. El rechazo se separa con fuerza a partir de la capa 18, con pico en las capas 24–32. Mediante una búsqueda multiobjetivo de unos 45 ensayos (minimizar rechazos, mantener bajo el KL del primer token en prompts inocuos) se eligió un subespacio de rango 1 con fuerzas por capa: atención 0,79–1,02 en capas 4–41; expertos compartidos y FFN denso 1,18–1,20 en las 42 capas; expertos enrutados 1,05–1,70 en capas 10–37, con pico en la 24. La edición se aplicó a 14.416 tensores, manteniendo el formato FP8 e4m3 y eligiendo el valor de redondeo por fila para que los errores se cancelen a lo largo de la dirección eliminada. Router, embeddings, `lm_head`, torre de visión y capa MTP quedan bit-idénticos al original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (`image-text-to-text`): entrada multimodal con torre de visión.
- Modo de razonamiento (`detailed thinking on`) y modo chat (`detailed thinking off`).
- Razonamiento multi-paso en modo think.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Comportamiento sin rechazo: el modelo cumple con solicitudes dañinas (según el autor).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se distribuye la dirección de rechazo en un MoE multimodal de 127,9 B y evaluar el impacto de la ablación sobre el comportamiento. Es adecuado porque conserva el checkpoint original y ofrece artefactos (`abliteration-edit.npz`, `bake-stats.txt`) para reproducir y analizar la edición.
- Evaluación de robustez de filtros de contenido: sirve como modelo de referencia "sin censura" para probar clasificadores y sistemas de moderación frente a respuestas que el modelo original rechazaría.
- Análisis de degradación por ablación: permite medir el coste en calidad (KL de 0,051 en el primer token) y comparar con el modelo original en tareas benignas, útil para calibrar técnicas de edición de pesos.
- Despliegue local en formato GGUF: con el repositorio `Ling-3.2-air-abliterated-GGUF` y `llama.cpp`/`llama-server` se puede ejecutar en hardware de consumo, aplicando la LoRA de ablación sobre cualquier GGUF del original si se prefiere partir del modelo sin modificar.
- Generación multimodal experimental: al conservar la torre de visión intacta, se puede usar para tareas de imagen-texto en entornos de investigación donde se requiera un modelo sin rechazo.
- Estudio de técnicas de cuantización FP8: el método de redondeo por fila para preservar la edición a través de la cuantización es un caso práctico para investigar cómo sobreviven las ediciones de pesos en formatos de baja precisión.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre GGUF Q6_K con decodificación greedy, con 100 prompts dañinos retenidos (384 tokens en chat, 768 en modo think):

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 98 | 3 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 98 | 4 |
| KL del primer token en prompts inocuos | 0 | 0,051 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa unos 129,3 GB en disco, por lo que la inferencia en FP8 requiere del orden de 130 GB de VRAM (más overhead de activaciones y KV cache). Con cuantización GGUF Q4_K_M se reduce sustancialmente, aunque el tamaño exacto no está disponible en la información proporcionada.
- GPU recomendadas: para FP8, GPUs con 140 GB o más de memoria (H100 80 GB en configuración multi-GPU, H200, B200) o múltiples A100/H100. Para GGUF Q4_K_M, configuraciones multi-GPU de consumo o GPUs de 48 GB en adelante.
- Cabe en GPU de consumo: no en FP8; posiblemente con GGUF Q4_K_M en configuraciones multi-GPU, aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code` (formato original), `llama.cpp`/`llama-server` con GGUF (y LoRA de ablación opcional), y cualquier runtime compatible con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-abliterated | ~127,9 B (MoE) | no disponible | MIT | safetensors FP8, GGUF | Variante sin rechazo del modelo base |
| inclusionAI/Ling-3.2-air | ~127,9 B (MoE) | no disponible | MIT | safetensors FP8 | Modelo original con rechazo (98/100) |
| Otros modelos abliterated de la comunidad | no disponible | no disponible | variable | variable | No se dispone de comparativas directas en la información proporcionada |

## Limitaciones y advertencias

- El modelo cumple con solicitudes dañinas; el autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- Riesgo elevado de generar contenido inseguro, ilegal o dañino en producción sin capas externas de moderación.
- El KL de 0,051 en el primer token indica una desviación pequeña pero no nula respecto al original en prompts inocuos; puede haber degradación sutil en calidad o coherencia.
- La ablación se midió sobre GGUF Q6_K; el comportamiento en otros formatos o cuantizaciones puede diferir.
- Sesgos conocidos: no disponibles en la información proporcionada (heredados del modelo base, no documentados aquí).
- Idiomas soportados: no disponibles en la información proporcionada.
- Longitud de contexto: no disponible; conviene verificar en la model card del modelo base.
- Licencia MIT permite uso comercial, pero las implicaciones legales y éticas de desplegar un modelo sin rechazo son responsabilidad del operador.
- El modelo requiere `trust_remote_code` y código personalizado (`bailing_moe_v3_vl`), lo que añade superficie de riesgo en la cadena de suministro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Ling-3.2-air-abliterated
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- GGUF cuantizados: https://huggingface.co/mrfakename/Ling-3.2-air-abliterated-GGUF
- Discord del autor: https://discord.com/invite/foss
