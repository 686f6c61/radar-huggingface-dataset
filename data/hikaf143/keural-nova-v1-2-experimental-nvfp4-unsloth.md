# Hikaf143/Keural-Nova-v1.2-experimental-NVFP4-unsloth

## Resumen

Keural Nova v1.2 NVFP4 (unsloth mixed-precision) es un checkpoint cuantizado de forma mixta del modelo Keural Nova v1.2 experimental, desarrollado por MKD (mkd.kr) y convertido por el usuario Hikaf143. Se trata de una cuantización de precisión mixta NVFP4/FP8 generada con `llm-compressor` en formato `compressed-tensors`, pensada para servir el modelo con vLLM sobre hardware NVIDIA Blackwell, donde existen núcleos tensoriales FP4. El modelo base es un transformer de mezcla de expertos (MoE) con etiqueta de arquitectura `qwen3_5_moe`, torre de visión y módulo MTP (multi-token prediction), derivado según su model card de Qwen/Qwen3.6-35B-A3B.

El repositorio ocupa 24,8 GB frente a los 67 GB de la versión bf16, y declara 22.171.948.400 parámetros totales en sus safetensors. Mantiene en FP8 las capas sensibles (atención q/k/v/o, proyecciones de atención lineal, `lm_head` y los expertos de las últimas 8 capas, 32-39), en bf16 la torre de visión, el MTP, las puertas del router y las proyecciones `in_proj_a/b/norm`, y en FP4 el grueso de expertos de las primeras 32 capas más los expertos compartidos.

Su relevancia es práctica: es una receta de despliegue de alto rendimiento con contexto nativo de 262.144 tokens y soporte de tool calling XML, replicando exactamente el esquema público de `unsloth/Qwen3.6-35B-A3B-NVFP4`. El coste es una dependencia fuerte de hardware: sin GPU Blackwell no se aprovechan los núcleos FP4. El modelo es experimental, con 71 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con atención lineal y atención completa; etiqueta `qwen3_5_moe`; incluye torre de visión y MTP |
| Parámetros totales | 22.171.948.400 (~22,2 B) según los safetensors del repositorio |
| Parámetros activos | no disponible (el modelo base se identifica como Qwen/Qwen3.6-35B-A3B, lo que sugiere ~3 B activos, sin confirmar en esta ficha) |
| Longitud de contexto | 262.144 tokens nativos (256K); requiere YaRN para superar esa cifra |
| Tipos de cuantización | Mixta NVFP4 (FP4) + FP8 + bf16 en capas sensibles; formato `compressed-tensors` |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (`compressed-tensors`, precisión mixta) |

Detalle de la receta de cuantización por capas:

| Precisión | Capas |
|---|---|
| FP8 (8 bits) | atención (q/k/v/o), proyecciones de atención lineal (`in_proj_qkv/z`, `out_proj`), `lm_head` y expertos de las últimas 8 capas (32-39) |
| FP4 (NVFP4, 4 bits) | expertos de las primeras 32 capas y expertos compartidos |
| bf16 (alta precisión) | `in_proj_a/b/norm` de atención lineal, puertas del router (`mlp.gate`, `shared_expert_gate`), torre de visión y MTP |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con una combinación de atención completa y atención lineal (linear attention), lo que reduce el coste de memoria de las secuencias largas. El checkpoint incluye además una torre de visión, ya que la `pipeline_tag` del repositorio es `image-text-to-text`, y un módulo MTP (multi-token prediction) que habilita decodificación especulativa. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se especifican en la información disponible.

Lo que sí se documenta es el proceso de cuantización: se utilizó la herramienta `llm-compressor` con el formato `compressed-tensors`, aplicando los `config_groups` y la lista `ignore` exactos de la receta de unsloth. La calibración se realizó con 512 muestras extraídas de la mezcla SFT de Keural Nova v1.2, con longitud de secuencia 2048. La verificación declarada por el autor confirma expertos en FP4 en la capa 0, expertos en FP8 en la capa 32 y capas sensibles en bf16. El autor indica que esta variante pierde menos precisión que la variante NVFP4 pura precisamente por mantener en FP8 las capas sensibles.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con modo de pensamiento desactivado por defecto (`non-thinking`).
- Procesamiento de imágenes y texto (`image-text-to-text`), gracias a la torre de visión conservada en bf16.
- Tool calling / function calling mediante el parser `qwen3_xml`, con `--enable-auto-tool-choice` en vLLM.
- Flujos de agente y razonamiento multi-paso apoyados en 262.144 tokens de contexto nativo.
- Decodificación especulativa vía MTP, mantenido en alta precisión.
- Inferencia de alto rendimiento con expertos en 4 bits sobre núcleos tensoriales FP4 de Blackwell.
- Capacidades multilingües limitadas a los idiomas declarados: coreano e inglés.

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno en coreano o inglés con ventanas de hasta 262.144 tokens, lo que permite mantener historiales largos e instrucciones de negocio extensas sin truncar.
- Agentes con herramientas en producción: gracias al parser `qwen3_xml` y a `--enable-auto-tool-choice`, puede invocar APIs, consultar bases de datos o ejecutar búsquedas dentro de un bucle de razonamiento multi-paso.
- Procesamiento de documentos e imágenes: la torre de visión en bf16 permite tareas de image-text-to-text, como extracción de campos de facturas o resúmenes de capturas con texto asociado.
- Asistente de análisis de código sobre repositorios completos: con 256K de contexto puede ingerir varios ficheros y mantener coherencia entre módulos en una misma sesión.
- Servicio de inferencia de alto rendimiento: desplegado con vLLM sobre Blackwell en `tensor-parallel-size 2`, adecuado para backends que priorizan coste por token sobre precisión absoluta.
- Base para ajuste fino posterior: al ser un checkpoint `compressed-tensors` sobre un modelo Apache-2.0, sirve como punto de partida para investigar el impacto de la cuantización FP4/FP8 en tareas concretas.
- Evaluación comparativa de cuantizaciones: permite medir la degradación de esta receta mixta frente a la variante NVFP4 pura y frente al modelo base en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y se limita a indicar que esta variante debería perder menos precisión que la NVFP4 pura, recomendando validarla en Blackwell con el script `scripts/nvfp4_verify_vllm.py` contra el modelo base en bf16.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 24,8 GB en disco. Como estimación, con cuantización mixta FP4/FP8 y contexto corto o medio se necesita algo más de 25-26 GB de VRAM, a lo que hay que sumar la caché KV, que crece de forma proporcional a la longitud de contexto (hasta 262.144 tokens).
- GPU obligatorias para aprovechar la cuantización: los núcleos tensoriales FP4 solo existen en Blackwell (B200, GB200, RTX 50xx). En Hopper (H100, H200) no hay kernels FP4, por lo que se pierde la ventaja de velocidad y memoria de esta receta.
- Configuración documentada por el autor: `--tensor-parallel-size 2` con `--max-model-len 262144`, es decir, dos aceleradores Blackwell para el contexto completo.
- Viabilidad en GPU de consumo: los 24,8 GB de pesos no caben con holgura en tarjetas de 24 GB, por lo que una RTX 4090 queda descartada; una RTX 5090 (32 GB) podría alojar los pesos, pero el contexto útil quedará muy recortado. No hay cifras oficiales al respecto.
- Opciones de despliegue: vLLM con soporte nativo de `compressed-tensors` es la vía documentada. Para llama.cpp u Ollama no se ha publicado soporte de este formato mixto, por lo que se considera no disponible.
- Latencia y throughput: no disponible.

Comando de servicio documentado en la model card:

```bash
vllm serve mkd-hossain/Keural-Nova-v1.2-experimental-NVFP4-unsloth \
  --served-model-name Keural-Nova-v1.2 \
  --tensor-parallel-size 2 --max-model-len 262144 \
  --tool-call-parser qwen3_xml --enable-auto-tool-choice
```

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hikaf143/Keural-Nova-v1.2-experimental-NVFP4-unsloth | 22,17 B totales (activos no disponibles) | 262.144 tokens | FP4/FP8/bf16 mixta (`compressed-tensors`) | Apache-2.0 | HuggingFace, 24,8 GB |
| mkd-hossain/Keural-Nova-v1.2-experimental (base) | no disponible | no disponible | bf16 | Apache-2.0 | HuggingFace, 67 GB |
| mkd-hossain/Keural-Nova-v1.2-experimental-NVFP4 (variante pura) | no disponible | no disponible | NVFP4 puro | Apache-2.0 | HuggingFace; menor tamaño que la mixta, menor retención de precisión según el autor |
| unsloth/Qwen3.6-35B-A3B-NVFP4 (receta de referencia) | no disponible | no disponible | NVFP4 mixta FP8/FP4 | no disponible en la información | HuggingFace |

El rendimiento comparado no está publicado para ninguno de ellos, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Rendimiento no verificado: no hay benchmarks publicados, ni de esta cuantización ni de la variante pura frente al modelo base en bf16. Cualquier decisión de producción debería ir precedida de una evaluación propia.
- Dependencia de hardware: sin GPU Blackwell no se aprovechan los núcleos FP4. En Hopper o en GPUs de generaciones anteriores el modelo puede cargarse, pero sin la ventaja de rendimiento que justifica esta receta.
- Contexto nativo y yaRN: los 262.144 tokens son el límite nativo; superarlo requiere YaRN, con la degradación de calidad asociada que no se cuantifica en la información disponible.
- Idiomas: solo coreano e inglés declarados. No hay soporte oficial de español ni de otros idiomas, por lo que su uso en castellano no está garantizado.
- Modelo experimental: el propio nombre incluye "experimental", y la ficha acumula 71 descargas y 0 likes, sin señales de adopción ni validación por parte de la comunidad.
- Discrepancia de parámetros: el repositorio declara 22.171.948.400 parámetros, mientras que la model card cita como base Qwen/Qwen3.6-35B-A3B. Conviene verificar la correspondencia real entre checkpoint y arquitectura antes de integrarlo.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización de 4 bits en el grueso de los expertos puede amplificarlo. No hay mediciones publicadas al respecto.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia: Apache-2.0, heredada del modelo base. Se permite el uso comercial, pero el usuario debe conservar la atribución a MKD y a la licencia original del modelo Qwen subyacente.
- Capas en bf16: la torre de visión, el MTP, las puertas del router y algunas proyecciones de atención lineal mantienen precisión alta, lo que hace que este checkpoint sea algo mayor que una NVFP4 pura y que su huella de memoria no baje de los 24,8 GB.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/Hikaf143/Keural-Nova-v1.2-experimental-NVFP4-unsloth
- Réplica del mismo checkpoint en la organización del autor: https://huggingface.co/mkd-ai/Keural-Nova-v1.2-experimental-NVFP4-unsloth
- Modelo base: https://huggingface.co/mkd-hossain/Keural-Nova-v1.2-experimental
- Variante NVFP4 pura: https://huggingface.co/mkd-hossain/Keural-Nova-v1.2-experimental-NVFP4
- Repositorio GitHub de las cuantizaciones: https://github.com/mkd-hossain/Keural-Nova-v1.2-NVFP4
- README del repositorio GitHub: https://github.com/mkd-hossain/Keural-Nova-v1.2-NVFP4/blob/main/README.md
- Receta de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4
- Modelo base subyacente: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Sitio del desarrollador: https://mkd.kr
- Ficha de índice del modelo: https://essamamdani.com/ai-models/hf-mkd-hossain-keural-nova-v1-2-experimental-nvfp4
