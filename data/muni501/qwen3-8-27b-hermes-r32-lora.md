# muni501/Qwen3.8-27B-hermes-r32-lora

## Resumen

Qwen3.8-27B-hermes-r32-lora es un adaptador LoRA de PEFT publicado por el usuario muni501 sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo nuevo ni de un entrenamiento original: es una redistribucion sin cambios de `harness-hub/Qwen3.8-27B-hermes-adapted`, republicada como repositorio de adaptador independiente para que pueda cargarse directamente con PEFT, vLLM-XPU y Xenithium. El autor verifica la identidad de los tensores mediante checksum SHA-256.

El adaptador tiene rango 32 (r16=32 tras el padding de 16 del motor de entrenamiento), alpha 64 (escala 2,0) y ataca las siete proyecciones estandar de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) en las 64 capas del modelo base. El repositorio ocupa 0,6 GB y contiene 512 tensores en F32.

Su relevancia practica es doble: por un lado, ejemplifica el flujo de trabajo de adaptadores de bajo rango sobre modelos grandes con atencion hibrida; por otro, documenta un caso interesante de despliegue, ya que el autor advierte que el delta del adaptador queda por debajo del ruido de cuantizacion del checkpoint INT4 con el que se sirve (coseno 0,066-0,079), por lo que debe aplicarse en tiempo de ejecucion y nunca fusionarse y recuantizarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer hibrido Qwen3.8-27B: 16 capas GQA + 48 capas GDN (Gated DeltaNet) |
| Parametros totales | Adaptador: 512 tensores (256 modulos x A/B); modelo base: 27B (segun nombre, no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (contexto usado en las mediciones del autor sobre el checkpoint INT4) |
| Tipos de cuantizacion | El adaptador se distribuye en F32; se usa con el base en GPTQ INT4 g128 e int8 KV cache |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador); el bake Swift-1.5 con el que se sirve hereda Swift Open License v1.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, 637.610.624 bytes) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar de PEFT con rango 32 y alpha 64. Se aplica sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 64 capas del modelo base. Las dimensiones declaradas son: hidden 5120, intermediate 17408, 48 cabezas de query, 8 cabezas KV, head_dim 128 y `attn_output_gate` activado. La mezcla de capas del base es 16 capas con atencion GQA (capas 3, 7, 11, ..., 63) y 48 capas con GDN (Gated DeltaNet), lo que confirma que el modelo base es un transformer hibrido con atencion lineal en la mayor parte de su profundidad.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. El autor indica explicitamente que no es un entrenamiento nuevo: los tensores son identicos a los de `harness-hub/Qwen3.8-27B-hermes-adapted`. El sufijo "hermes" sugiere un ajuste orientado a seguir instrucciones y formato conversacional, pero no se aporta detalle tecnico al respecto.

## Capacidades

- Generacion de texto y conversacion multi-turno sobre el modelo base Qwen3.8-27B.
- Ajuste de estilo y comportamiento conversacional derivado del adaptador "hermes" (inferido del nombre; no documentado explicitamente).
- Carga directa con PEFT mediante `PeftModel.from_pretrained`.
- Aplicacion en tiempo de ejecucion con Xenithium sobre checkpoints cuantizados, sin fusion ni recuantizacion.
- Soporte en vLLM-XPU con `--enable-lora` y `--lora-modules`.
- Capacidades heredadas del base (codigo, razonamiento, matematicas, tool calling, agentes): no confirmadas en la informacion disponible para este adaptador concreto.

## Casos de uso

- Servicio de inferencia en produccion con vLLM-XPU: cargar el adaptador junto al base Qwen3.8-27B mediante `--enable-lora --lora-modules hermes=/ruta/al/repo` permite servir el modelo ajustado sin duplicar pesos, aprovechando el soporte nativo de LoRA de vLLM.
- Despliegue sobre hardware Intel Arc: el autor mide el rendimiento en una Arc Pro B70 con el bake GPTQ INT4, lo que convierte este adaptador en una opcion practica para servir el modelo en GPUs Intel con Xenithium.
- Experimentacion con PEFT en notebooks o entornos de investigacion: al ser un adaptador de 0,6 GB, puede cargarse sobre el base con `PeftModel.from_pretrained` sin necesidad de reentrenar ni de almacenar pesos completos.
- Personalizacion ligera de un modelo de 27B sin infraestructura de entrenamiento: el adaptador demuestra el patron de publicar deltas de bajo rango como artefacto independiente, reutilizable en pipelines de fine-tuning.
- Evaluacion de tecnicas de cuantizacion: el caso documenta que un delta con coseno 0,066-0,079 frente al error de recuantizacion g128 se destruye al fusionar, lo que lo hace util como banco de pruebas para estudiar la interaccion entre LoRA y cuantizacion INT4.
- Servicio con contexto largo: las mediciones del autor usan 262.144 tokens de contexto con KV cache int8, adecuado para tareas de resumen de documentos extensos o analisis de repositorios completos.
- Atencion al cliente automatizada: el modelo base soporta conversaciones multi-turno y el adaptador ajusta el estilo; con 262k de contexto puede mantener historiales largos y documentos de referencia en la misma ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo aporta mediciones de rendimiento de inferencia sobre Intel Arc Pro B70 con Qwen3.8-27B GPTQ INT4 g128, contexto 262.144, KV int8 y DFlash 2 drafter:

| Metrica | Con adaptador | Sin adaptador (bare) | Coste relativo |
|---|---|---|---|
| Decodificacion single-stream, 512 tokens | 95,9 t/s (mediana) | ~102 t/s | ~1,07x |
| Prefill a 3,6k tokens de prompt | 1.825 tok/s | no disponible | no disponible |
| Prefill a 14,4k tokens de prompt | 1.971 tok/s | no disponible | no disponible |
| Prefill a 43,2k tokens de prompt | 2.186 tok/s | no disponible | no disponible |
| Throughput agregado a 2 streams | 146,0 t/s | no disponible | no disponible |
| Throughput agregado a 4 streams | 187,7 t/s | no disponible | no disponible |

## Requisitos de hardware

- VRAM del adaptador: 0,6 GB en F32; negligible frente a los pesos del base.
- VRAM del modelo base: no disponible en la informacion proporcionada; depende de la cuantizacion (el autor usa GPTQ INT4 g128 con KV cache int8).
- GPU recomendadas: Intel Arc Pro B70 (medicion del autor); el adaptador tambien es compatible con vLLM-XPU, por lo que se orienta a GPUs Intel Arc. Compatibilidad con A100, H100 o RTX 4090 no confirmada.
- GPU de consumo: no confirmado; el base de 27B en INT4 podria caber en GPUs con 24 GB o mas, pero no hay datos que lo verifiquen.
- Opciones de despliegue: PEFT, Xenithium (`XEN_LORA_ADAPTER` o `xenithium-server --lora`), vLLM-XPU (`--enable-lora --lora-modules`).
- Latencia y throughput: ver tabla de benchmarks; decodificacion single-stream de 95,9 t/s y prefill de 1.825-2.186 tok/s en Arc Pro B70.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores LoRA comparables sobre Qwen3.8-27B ni de modelos de la misma categoria con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere el base Qwen/Qwen3.8-27B y no puede usarse por si solo.
- No se documentan sesgos conocidos, comportamiento en idiomas distintos del ingles ni riesgos de alucinacion especificos del adaptador.
- El autor advierte que fusionar el adaptador y recuantizar destruye el delta: el coseno frente al error de recuantizacion g128 es de 0,066-0,079, por debajo del ruido de cuantizacion. Debe aplicarse en tiempo de ejecucion.
- La licencia del adaptador es Apache-2.0, pero el bake Swift-1.5 con el que se sirve (`muni501/Swift-1.5-Qwen3.8-27B-Uncensored-hermes-v3-GPTQ-Int4`) es derivado de Swift 1.5 y lleva Swift Open License v1.0, que permite uso comercial solo por debajo de un umbral de ingresos de 1 millon de USD (seccion 5). Servir la combinacion hereda esas condiciones.
- El nombre "Uncensored" del bake asociado sugiere ausencia de filtros de seguridad; no hay informacion que lo confirme ni que detalle sus implicaciones.
- No hay datos de evaluacion de calidad, por lo que no puede validarse la mejora real del adaptador sobre el base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recien publicado sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/muni501/Qwen3.8-27B-hermes-r32-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Bake INT4 asociado: https://huggingface.co/muni501/Swift-1.5-Qwen3.8-27B-Uncensored-hermes-v3-GPTQ-Int4
- Repositorio upstream del adaptador: `harness-hub/Qwen3.8-27B-hermes-adapted` (referenciado en la model card, sin URL directa en la informacion disponible)
