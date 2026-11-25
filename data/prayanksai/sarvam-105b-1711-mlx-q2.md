# prayanksai/sarvam-105b-1711-mlx-q2

## Resumen

Sarvam-105B-1711 MLX 2-bit es una conversión comunitaria experimental del modelo Sarvam-105B-1711 de Sarvam AI, publicada por el usuario prayanksai. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts con 106.031.767.424 parámetros totales (aproximadamente 106B) y unos 10,3B de parámetros activos por token, diseñado originalmente para tareas conversacionales y multilingües con especial énfasis en lenguas índicas. Esta versión concreta no entrena el modelo desde cero, sino que reformatea los pesos originales en BF16 al formato MLX safetensors con cuantización afín de 2 bits y tamaño de grupo 64, con el objetivo de permitir la inferencia en Macs con Apple Silicon.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un MoE de más de 100B parámetros en hardware de consumo, aunque a costa de una degradación de calidad muy significativa. El autor advierte explícitamente de que la cuantización a 2 bits es "altamente agresiva" y puede deteriorar el razonamiento, el seguimiento de instrucciones, la calidad multilingüe, la precisión factual y el uso de herramientas. El checkpoint ocupa aproximadamente 30,92 GiB repartidos en 7 shards y requiere 64 GiB o más de memoria unificada para funcionar con comodidad.

La arquitectura subyacente combina atención de tipo MLA (Multi-head Latent Attention) con un Mixture-of-Experts de 128 expertos enrutados más 1 compartido, con enrutamiento top-8. La longitud de contexto configurada es de 163.840 tokens, si bien el autor recalca que ello no implica que el contexto completo quepa en memoria. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atención MLA (Multi-head Latent Attention) |
| Parametros totales | 106.031.767.424 (aproximadamente 106B) |
| Parametros activos | Aproximadamente 10,3B por token |
| Longitud de contexto | 163.840 tokens (configurada) |
| Tipos de cuantizacion | 2 bits afín (affine), group size 64; existen conversiones 4-bit y 6-bit del mismo autor |
| Idiomas soportados | Multilingüe con énfasis en lenguas índicas (según tags del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (7 shards, aproximadamente 30,92 GiB) |

## Arquitectura y entrenamiento

El modelo base Sarvam-105B-1711 emplea una arquitectura de transformer con Mixture-of-Experts: 128 expertos enrutados más 1 experto compartido, con enrutamiento top-8 por token, lo que resulta en aproximadamente 10,3B parámetros activos sobre un total de 106B. La atención es de tipo MLA (Multi-head Latent Attention), una variante que comprime las representaciones de clave-valor para reducir el coste de memoria del KV cache, algo crítico en contextos largos. La longitud de contexto configurada alcanza los 163.840 tokens.

Esta conversión concreta no aporta información sobre el proceso de entrenamiento del modelo original: no se detallan el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. El trabajo realizado por prayanksai se limita a la conversión de formato y cuantización mediante `mlx_lm.convert` con `--q-bits 2` y `--q-group-size 64`, sin reentrenamiento. La implementación MLX del tipo de modelo `sarvam_mla` se propone en el PR #2097 de MLX-LM y ha superado pruebas de conversión de checkpoint, mapeo de configuración, forward pass y pruebas unitarias del proyecto, aunque el checkpoint de 2 bits en sí no ha sido evaluado con benchmarks.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`) y la naturaleza del modelo base.
- Razonamiento e instrucciones generales, con la advertencia de que la cuantización a 2 bits degrada notablemente estas capacidades.
- Capacidades multilingües con especial atención a lenguas índicas, heredadas del modelo base Sarvam.
- Modo "thinking" configurable: los ejemplos de la model card muestran `enable_thinking: false` en la configuración de plantilla de chat, lo que implica que el modelo soporta un modo de razonamiento explícito activable.
- Uso de herramientas (tool calling) mencionado como capacidad potencialmente afectada por la cuantización; no se documenta su funcionamiento específico en esta conversión.
- Inferencia en Apple Silicon mediante MLX-LM, con control de tamaño de KV cache, `prefill-step-size` y temperatura.

## Casos de uso

- Experimentación en Apple Silicon: probar un MoE de 106B parámetros en un Mac con 64 GiB o más de memoria unificada para evaluar latencia, consumo y viabilidad de despliegues locales de gran escala.
- Pruebas de cuantización extrema: comparar cualitativamente las salidas de este checkpoint 2-bit frente a las versiones 4-bit, 6-bit y BF16 para medir el impacto real de la compresión agresiva en tareas concretas.
- Prototipado de asistentes multilingües índicos en local: validar flujos conversacionales en hindi, tamil, telugu u otras lenguas índicas antes de migrar a la versión BF16 o a un despliegue en servidor.
- Investigación sobre atención MLA: estudiar el comportamiento de la atención Multi-head Latent Attention con KV cache reducido en contextos de hasta 4096 tokens (configuración recomendada en los ejemplos).
- Desarrollo y depuración de la implementación `sarvam_mla` en MLX-LM: servir como checkpoint de prueba para el PR #2097 y para validar futuras versiones upstream del framework.
- Docencia y demostraciones: ilustrar en entornos académicos el compromiso entre tamaño de modelo, cuantización y calidad, sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este checkpoint de 2 bits "no ha sido evaluado con benchmarks y debe tratarse como experimental". No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 31 GiB solo para los pesos; se recomiendan 64 GiB o más de memoria unificada para margen suficiente.
- Almacenamiento: al menos 40 GiB libres para la descarga y la caché (los pesos ocupan unos 30,92 GiB).
- Macs de 48 GiB: pueden funcionar con prompts cortos y un KV cache conservador, pero con poco margen.
- Macs de 32 GiB: no pueden alojar el modelo junto con macOS y el estado de inferencia de forma cómoda.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; este checkpoint es específico de MLX para Apple Silicon y no se carga en CUDA.
- Despliegue: MLX-LM, requiriendo la rama `add-sarvam-mla` del repositorio de prayanks hasta que el PR #2097 se fusione upstream. Las versiones estándar de MLX-LM sin soporte `sarvam_mla` no pueden cargar el checkpoint.
- Parámetros de inferencia recomendados: `--max-kv-size 4096`, `--prefill-step-size 512`, temperatura 1.0 en chat y 0.6 en generación única sin thinking. Reducir el prefill step size disminuye el pico de memoria a costa de velocidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Sarvam-105B-1711 MLX 2-bit (esta ficha) | 106B | ~10,3B | 163.840 | 2-bit afín, group 64 | Apache 2.0 | Apple Silicon (MLX) |
| Sarvam-105B-1711 BF16 (base) | 106B | ~10,3B | 163.840 | BF16 | Apache 2.0 | Servidor/GPU |
| Sarvam-105B-1711 MLX 4-bit / 6-bit | 106B | ~10,3B | 163.840 | 4-bit / 6-bit | Apache 2.0 | Apple Silicon (MLX) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, contexto, licencia y plataforma.

## Limitaciones y advertencias

- La cuantización a 2 bits es extremadamente agresiva y puede degradar sustancialmente el razonamiento, el seguimiento de instrucciones, la calidad multilingüe, la precisión factual y el uso de herramientas.
- El checkpoint no ha sido evaluado con benchmarks; debe considerarse experimental y no apto para decisiones de alto impacto o críticas para la seguridad sin validación independiente exhaustiva.
- La longitud de contexto configurada (163.840 tokens) no implica que el contexto completo quepa en memoria; hay que empezar con un KV cache pequeño.
- Requiere una rama no fusionada de MLX-LM; las versiones estándar no cargan el modelo, lo que añade riesgo de mantenimiento y reproducibilidad.
- Los sesgos y limitaciones del modelo base Sarvam-105B-1711 siguen aplicando, pero no se detallan en la información disponible.
- La lista concreta de idiomas soportados no está disponible; solo se indica "multilingual" e "indic-languages" en los tags.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el repositorio y la licencia del modelo base antes de redistribuir o desplegar.
- Solo funciona en Apple Silicon con Python arm64 nativo; no es portable a CUDA ni a otras plataformas sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prayanksai/sarvam-105b-1711-mlx-q2
- Modelo base BF16: https://huggingface.co/sarvamai/sarvam-105b-1711-bf16
- Model card oficial del modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711
- Organización Sarvam AI en Hugging Face: https://huggingface.co/sarvamai
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- PR de soporte `sarvam_mla` en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/2097
- Rama del autor con soporte `sarvam_mla`: https://github.com/prayanks/mlx-lm/tree/add-sarvam-mla
- Perfil del autor de la conversión: https://huggingface.co/prayanksai
